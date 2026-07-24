<!-- CurvaS.vue -->
<template>
  <div
    ref="chartContainer"
    class="card"
    style="width: 99%; height: 488px;"
  />
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import apiAxios from '@/services/api';
import Highcharts from 'highcharts'
import Exporting from 'highcharts/modules/exporting'
import NoData from 'highcharts/modules/no-data-to-display'

const props = defineProps({
  fechaDesde: String,
  fechaHasta: String,
  clienteId: [String, Number],
  proyectoId: [String, Number],
  titulo: { type: String, default: 'Curva S del Proyecto' },
  urlCurvaS: { type: String, default: '' },

  // ✅ Fallback si la API no responde o viene vacía
  defaultSeries: {
    type: Object,
    default: () => ({
      categories: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
      plan: [3,7,12,20,28,40,55,72,85,95,100,100],
      real: [2,6,10,18,25,38,53,70,82,92,98,100]
    })
  }
})

defineExpose({
  refreshChart,
  cargarDatos,
  setSeries
})

const chartContainer = ref(null)
let chart = null

watch(
  () => [props.fechaDesde, props.fechaHasta, props.clienteId, props.proyectoId],
  () => {
    // 🔄 Al cambiar filtros, recarga datos
    cargarDatos()
  }
)

onMounted(async () => {
  initChart()
  await cargarDatos()

  // reflow en resize
  const onResize = () => refreshChart()
  window.addEventListener('resize', onResize)
  onBeforeUnmount(() => window.removeEventListener('resize', onResize))
})

function initChart() {
  chart = Highcharts.chart(chartContainer.value, {
    chart: { type: 'line', animation: true },
    title: { text: props.titulo },
    subtitle: { text: 'Programado vs Ejecutado' },
    credits: { enabled: false },
    exporting: { enabled: true },
    xAxis: {
      categories: [],
      tickmarkPlacement: 'on',
      crosshair: true
    },
    // 🔹 AHORA EN UNIDADES
    yAxis: {
      title: { text: 'Unidades acumuladas' },
      min: 0,
      labels: { format: '{value}' } // sin %
      // max: 100,        // ❌ sacar
      // tickInterval: 10 // ❌ sacar
    },
    tooltip: {
      shared: true,
      // valueSuffix: '%', // ❌ sacar
      pointFormat:
        '<span style="color:{series.color}">\u25CF</span> ' +
        '{series.name}: <b>{point.y:,.0f}</b><br/>' // unidades
    },
    plotOptions: {
      series: {
        marker: { enabled: false },
        dataLabels: {
          enabled: true,
          formatter() {
            const idx = this.point.index
            // solo algunos puntos como antes
            return (idx === 0 || idx === this.series.data.length - 1 || idx % 2 === 0)
              ? Highcharts.numberFormat(this.y, 0, ',', '.') // ej: 1.234
              : null
          }
        }
      }
    },
    lang: {
      noData: 'No hay datos para mostrar'
    },
    series: [
      { name: 'Programado', data: [] },
      { name: 'Ejecutado',  data: [] }
    ]
  })
}

function refreshChart() {
  if (!chart) return
  chart.reflow()
}

// === API ===
// Espera que el endpoint entregue algo tipo:
// [{ mes:'2025-01', plan: 5, real: 3 }, { mes:'2025-02', plan: 12, real: 9 }, ...]
// Los valores pueden ser mensuales o acumulados. Si son mensuales, acá los acumulamos.
async function cargarDatos() {
  try {
    if (!chart) initChart()

    // 🔹 Si no hay URL: usar fallback y salir
    if (!props.urlCurvaS) {
      setSeries(props.defaultSeries)
      return
    }

    const url =
      `${props.urlCurvaS}` +
      `?fecha_desde=${props.fechaDesde ?? ''}` +
      `&fecha_hasta=${props.fechaHasta ?? ''}` +
      `&id_cliente=${props.clienteId ?? ''}` +
      `&id_proyecto=${props.proyectoId ?? ''}`

    const { data } = await apiAxios.get(url)
    const filas = Array.isArray(data?.datos) ? data.datos : (Array.isArray(data) ? data : [])

    if (filas.length) {
      const { categories, planAcum, realAcum } = normalizarCurvaS(filas)
      applySeries({ categories, plan: planAcum, real: realAcum })
    } else {
      // 🔹 Fallback si la API viene vacía
      setSeries(props.defaultSeries)
    }

    refreshChart()
  } catch (e) {
    console.error('Error cargando Curva S:', e)
    // 🔹 Fallback si la API falla
    setSeries(props.defaultSeries)
    refreshChart()
  }
}

// Permite inyectar datos manualmente desde el padre:
// setSeries({ categories: ['Ene','Feb',...], plan:[...], real:[...] })
function setSeries(payload) {
  const { categories = [], plan = [], real = [] } = payload || {}
  applySeries({ categories, plan, real })
  refreshChart()
}

// === Helpers ===

// Intenta detectar si los valores son mensuales o ya acumulados.
// Si parecen mensuales, acumula (capando a 100).
function normalizarCurvaS(rows = []) {
  // mapea mes -> 'MMM' (o usa YYYY-MM)
  const orden = [...rows].sort((a, b) => String(a.mes || a.fecha).localeCompare(String(b.mes || b.fecha)))

  const categories = orden.map(r => mesLabel(r.mes || r.fecha || ''))
  const planRaw = orden.map(r => num(r.plan ?? r.plan_pct ?? r.programado ?? 0))
  const realRaw = orden.map(r => num(r.real ?? r.real_pct ?? r.ejecutado ?? 0))

  const planAcum = toAcumulado(planRaw)
  const realAcum = toAcumulado(realRaw)

  return { categories, planAcum, realAcum }
}

function toAcumulado(arr) {
  const out = []
  let acc = 0
  for (const v of arr) {
    acc += Number.isFinite(v) ? v : 0
    out.push(acc)   // 👈 sin límite
  }
  return out
}

function mesLabel(s) {
  // acepta 'YYYY-MM' o ISO; devuelve 'Ene', 'Feb', ...
  try {
    let d
    if (/^\d{4}-\d{2}$/.test(s)) d = new Date(`${s}-01T00:00:00`)
    else d = new Date(s)
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
    const mm = d.getMonth()
    if (Number.isFinite(mm)) return meses[mm]
  } catch {}
  return String(s || '')
}

function applySeries({ categories, plan, real }) {
  if (!chart) return
  chart.hideNoData?.()

  chart.xAxis[0].setCategories(categories || [], false)

  const sPlan = chart.series[0] || chart.addSeries({ name: 'Programado', data: [] }, false)
  const sReal = chart.series[1] || chart.addSeries({ name: 'Ejecutado',  data: [] }, false)

  // 🔹 AHORA VAN TAL CUAL, SIN LIMITAR A 100
  sPlan.update({ data: (plan || []).map(num) }, false)
  sReal.update({ data: (real || []).map(num) }, false)

  chart.redraw()
}

function num(v) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}
</script>
