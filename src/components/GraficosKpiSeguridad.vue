<template>
  <div>
    <h3 class="mb-3">
      Información Estadística
    </h3>

    <v-row dense>
      <v-col
        v-for="(kpi, i) in items"
        :key="i"
        cols="12"
        sm="6"
        md="4"
        lg="2"
      >
        <v-card
          class="pa-4"
          elevation="2"
        >
          <div class="kpi-number">
            {{ formatValue(kpi.value, kpi.decimals, kpi.suffix) }}
          </div>
          <div class="kpi-label">
            {{ kpi.label }}
          </div>

          <!-- contenedor sparkline; evita mutar estado durante render -->
          <div
            :ref="el => el && setChartHost(el, i)"
            class="sparkline"
          />
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import Highcharts from 'highcharts'

/**
 * PROPS
 * items: [{ label, value, series: number[], decimals?, suffix?, color? }]
 */
const props = defineProps({
  items: {
    type: Array,
    default: () => ([
      { label: 'Accidentes',                 value: 0.0, series: [0,0,0,0,0,0,0], decimals: 1, suffix: '' },
      { label: 'Días Perdidos',              value: 0.0, series: [0,0,0,0,0,0,0], decimals: 1, suffix: '' },
      { label: 'Promedio Trabajadores',      value: 0.0, series: [0,0,0,0,0,0,0], decimals: 1, suffix: '' },
      { label: 'Índice de Accidentabilidad', value: 0.0, series: [0,0,0,0,0,0,0], decimals: 1, suffix: '' },
      { label: 'Índice de Frecuencia',       value: 0.0, series: [0,0,0,0,0,0,0], decimals: 1, suffix: '' },
      { label: 'Índice de Gravedad',         value: 0.0, series: [0,0,0,0,0,0,0], decimals: 1, suffix: '' },
    ])
  }
})

/* ============================
   Highcharts: estado NO reactivo
============================ */
// NO reactivity here → evita loops por render
const chartHosts = []   // DOM nodes (no-reactivo)
const charts = []       // instancias Highcharts (no-reactivo)
const rafs = new Map()  // rAF por índice

function setChartHost (el, i) {
  chartHosts[i] = el
  queueBuild(i) // programa construcción en próximo frame
}

function buildOptions (kpi) {
  const base = kpi.color || '#29a4ff'
  return {
    chart: {
      type: 'areaspline',
      backgroundColor: 'transparent',
      height: 80,
      spacing: [2, 0, 0, 0],
      animation: false
    },
    title: { text: null },
    credits: { enabled: false },
    legend: { enabled: false },
    tooltip: { enabled: false },
    xAxis: { visible: false },
    yAxis: { visible: false, startOnTick: false, endOnTick: false },
    plotOptions: {
      series: {
        lineWidth: 2,
        marker: { enabled: false },
        states: { hover: { enabled: false }, inactive: { opacity: 1 } }
      },
      areaspline: {
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, Highcharts.color(base).setOpacity(0.8).get('rgba')],
            [1, Highcharts.color(base).setOpacity(0.0).get('rgba')]
          ]
        },
        color: base,
        threshold: null
      }
    },
    series: [{
      data: [...(kpi.series || [])], // clona para evitar proxys
    }]
  }
}

function buildOrUpdateChart (i) {
  const el = chartHosts[i]
  const kpi = props.items?.[i]
  if (!el || !kpi) return

  const existing = charts[i]
  const opts = buildOptions(kpi)

  if (existing) {
    existing.update({ series: [{ data: [...(kpi.series || [])] }] }, true, false)
    existing.reflow()
  } else {
    charts[i] = Highcharts.chart(el, opts)
  }
}

function queueBuild (i) {
  // Throttle por índice (evita múltiples builds en el mismo frame)
  const prev = rafs.get(i)
  if (prev) cancelAnimationFrame(prev)
  const id = requestAnimationFrame(() => {
    buildOrUpdateChart(i)
    rafs.delete(i)
  })
  rafs.set(i, id)
}

function destroyAll () {
  charts.forEach(c => c && c.destroy && c.destroy())
  charts.length = 0
  chartHosts.length = 0
  rafs.forEach(id => cancelAnimationFrame(id))
  rafs.clear()
}

/* ============================
   Lifecycle + watchers
============================ */
function onResize () {
  // reflow sin tocar estado Vue
  charts.forEach(c => c && c.reflow && c.reflow())
}

onMounted(() => {
  // Construye todos después del primer render
  nextTick(() => {
    props.items?.forEach((_, i) => queueBuild(i))
  })
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  destroyAll()
})

// ❌ Nada de deep: true (causa loops con proxys/reactividad)
// Observa solo el cambio de referencia de items
watch(() => props.items, (nv, ov) => {
  if ((ov?.length ?? 0) !== (nv?.length ?? 0)) {
    // si varía la cantidad de tarjetas, reconstruye todo
    destroyAll()
    nextTick(() => nv?.forEach((_, i) => queueBuild(i)))
  } else {
    // misma cantidad → refresca cada serie
    nv?.forEach((_, i) => queueBuild(i))
  }
}, { deep: false })

/* ============================
   Formatting
============================ */
function formatValue (val, decimals = 0, suffix = '') {
  const num = Number(val ?? 0)
  return `${num.toLocaleString('es-CL', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`
}
</script>

<style scoped>
.kpi-number {
  font-size: 28px;
  font-weight: 800;
  line-height: 1.1;
  text-align: center;
  color: #2b2b2b;
}
.kpi-label {
  text-align: center;
  color: #757575;
  margin-bottom: 6px;
}
.sparkline {
  width: 100%;
  height: 70px;
}
</style>
