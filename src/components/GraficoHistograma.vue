<!-- Lineas3.vue (FIX: si llega vacío, usa mock y no muestra "No data") -->
<template>
  <div
    ref="chartContainer"
    class="card"
    style="width: 99%; height: 232px;"
  />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import Highcharts from 'highcharts'
import Exporting from 'highcharts/modules/exporting'
import NoData from 'highcharts/modules/no-data-to-display'

const props = defineProps({
  titulo: { type: String, default: 'Curva S Plan / Real (Gantt)' },
  subtitulo: { type: String, default: '3 series (mock)' }
})

defineExpose({ refreshChart, setSeries })

const chartContainer = ref(null)
let chart = null

// ✅ mock por defecto
const mock = getMock3Lines()
// ✅ guardamos el último payload válido
const lastPayload = ref(mock)

onMounted(async () => {
  await nextTick()
  initChart()
  // ✅ al montar SIEMPRE carga algo (mock)
  applyPayload(lastPayload.value, true)

  const onResize = () => refreshChart()
  window.addEventListener('resize', onResize)

  onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize)
    if (chart) {
      chart.destroy()
      chart = null
    }
  })
})

function initChart () {
  if (!chartContainer.value) return

  chart = Highcharts.chart(chartContainer.value, {
    chart: { type: 'line', animation: true },
    title: { text: props.titulo },
    subtitle: { text: props.subtitulo },
    credits: { enabled: false },
    exporting: { enabled: true },
    lang: { noData: 'No hay datos para mostrar' },

    xAxis: {
      categories: [],
      tickmarkPlacement: 'on',
      crosshair: true
    },

    yAxis: {
      title: { text: 'Valor' },
      min: 0,
      labels: { format: '{value}' }
    },

    tooltip: {
      shared: true,
      pointFormat:
        '<span style="color:{series.color}">●</span> {series.name}: <b>{point.y:,.0f}</b><br/>'
    },

    plotOptions: {
      series: {
        marker: { enabled: false },
        dataLabels: {
          enabled: true,
          formatter() {
            const idx = this.point.index
            return (idx === 0 || idx === this.series.data.length - 1 || idx % 2 === 0)
              ? Highcharts.numberFormat(this.y, 0, ',', '.')
              : null
          }
        }
      }
    },

    series: [
      { name: 'Plan', data: [] },
      { name: 'Real', data: [] },
      { name: 'Proyección', data: [] }
    ]
  })
}

function refreshChart () {
  chart?.reflow()
}

/**
 * ✅ setSeries “inteligente”:
 * - si le llega vacío → usa mock
 * - si llega bueno → lo guarda y lo aplica
 */
function setSeries (payload = {}) {
  const normalized = normalizePayload(payload)

  // si viene vacío, NO dejís el chart pelado
  const finalPayload = normalized.hasData ? normalized.payload : mock

  lastPayload.value = finalPayload
  applyPayload(finalPayload, true)
}

function applyPayload (payload = {}, redraw = true) {
  if (!chart) return

  const categories = payload.categories || []
  const names = payload.names || ['Plan', 'Real', 'Proyección']
  const s1 = (payload.s1 || []).map(num)
  const s2 = (payload.s2 || []).map(num)
  const s3 = (payload.s3 || []).map(num)

  const hasData = categories.length && (s1.length || s2.length || s3.length)

  if (!hasData) {
    chart.showNoData?.()
    chart.xAxis[0].setCategories([], false)
    chart.series[0].setData([], false)
    chart.series[1].setData([], false)
    chart.series[2].setData([], redraw)
    return
  }

  chart.hideNoData?.()
  chart.xAxis[0].setCategories(categories, false)

  chart.series[0].update({ name: names[0] ?? 'Plan' }, false)
  chart.series[1].update({ name: names[1] ?? 'Real' }, false)
  chart.series[2].update({ name: names[2] ?? 'Proyección' }, false)

  chart.series[0].setData(s1, false)
  chart.series[1].setData(s2, false)
  chart.series[2].setData(s3, redraw)
}

function normalizePayload(p = {}) {
  const categories = Array.isArray(p.categories) ? p.categories : []
  const s1 = Array.isArray(p.s1) ? p.s1 : []
  const s2 = Array.isArray(p.s2) ? p.s2 : []
  const s3 = Array.isArray(p.s3) ? p.s3 : []

  const hasData = categories.length && (s1.length || s2.length || s3.length)

  return {
    hasData,
    payload: {
      categories,
      names: Array.isArray(p.names) ? p.names : undefined,
      s1, s2, s3
    }
  }
}

function num(v) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function getMock3Lines () {
  return {
    categories: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
    names: ['Plan', 'Real', 'Proyección'],
    s1: [10, 18, 30, 42, 55, 63, 72, 80, 88, 95, 100, 105],
    s2: [ 8, 15, 26, 38, 50, 58, 66, 74, 81, 90,  96, 102],
    s3: [ 9, 17, 28, 40, 53, 61, 70, 79, 86, 93,  99, 110]
  }
}
</script>
