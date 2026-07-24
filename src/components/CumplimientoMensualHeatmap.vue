<template>
  <v-card class="pa-3">
    <div class="toolbar">
      <h3 class="title">
        Programa de Cumplimiento Mensual
        <span v-if="persona?.nombre">— {{ persona.nombre }} <small>({{ persona.cargo }})</small></span>
      </h3>

      <div class="controls">
        <v-switch
          v-model="groupByWeek"
          color="primary"
          hide-details
          inset
          :label="groupByWeek ? 'AGRUPADO POR SEMANA' : 'POR DÍA (división horizontal)'"
        />
      </div>
    </div>

    <div
      ref="chartEl"
      class="chart"
    />
  </v-card>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed, nextTick } from 'vue'

import Highcharts from 'highcharts'
import 'highcharts/modules/heatmap'
import 'highcharts/modules/exporting'

/* -------- PROPS -------- */
const props = defineProps({
  persona: { type: Object, default: () => ({ nombre: 'Pedro Pérez', cargo: 'Administrador de obra' }) },
  year:    { type: Number, default: () => new Date().getFullYear() },
  month:   { type: Number, default: () => new Date().getMonth() + 1 }, // 1..12
  // Subfilas por documento (2 = dos cuadrados apilados por día)
  subRowsPerDoc: { type: Number, default: 2 },
  documentos: {
    type: Array,
    default: () => [
      'AST','Charla diaria','Aplicación Protector Solar UV','Permiso de Trabajo',
      'Plan de Izaje','Observaciones de Conducta','Inspecciones'
    ]
  },
  // { doc, date:'YYYY-MM-DD', status:'ok'|'warn'|'fail'|'none', slot?: 'top'|'bottom'|0|1|'am'|'pm' }
  registros: {
    type: Array,
    default: () => ([
      { doc: 'AST', date: '2025-09-02', status: 'ok'   },
      { doc: 'AST', date: '2025-09-03', status: 'fail' },
      { doc: 'AST', date: '2025-09-04', status: 'warn' },
      { doc: 'AST', date: '2025-09-05', status: 'ok'   },
      { doc: 'Charla diaria', date: '2025-09-01', status: 'ok',   slot: 'top' },
      { doc: 'Charla diaria', date: '2025-09-02', status: 'warn', slot: 'bottom' },
      { doc: 'Charla diaria', date: '2025-09-03', status: 'ok',   slot: 'bottom' },
    ])
  }
})

/* -------- CONSTANTES -------- */
const STATUS_TO_VALUE = { none: 0, ok: 1, warn: 2, fail: 3 }
const VALUE_TO_NAME   = { 0: 'Sin registro', 1: 'Cumple', 2: 'Parcial', 3: 'No cumple' }
const COLORS = { none: '#dcdcdc', ok: '#43a047', warn: '#fdd835', fail: '#e53935' }
const DOW = ['D','L','M','X','J','V','S']
const SLOT_NAME = ['Plan', 'Real'] // etiquetas subfilas

/* -------- REFS -------- */
const chartEl = ref(null)
let chart = null
const groupByWeek = ref(false)

/* -------- HELPERS FECHA -------- */
function daysInMonth (y, m) { return new Date(y, m, 0).getDate() } // m=1..12
function weekOfMonth (y, m, d) {
  const date = new Date(y, m - 1, d)
  const first = new Date(y, m - 1, 1)
  const firstDay = (first.getDay() + 6) % 7
  return Math.floor((d + firstDay - 1) / 7) + 1
}
function labelDia (y, m, day) {
  const dow = DOW[new Date(y, m - 1, day).getDay()]
  return `${dow}<br>${day}`
}
function slotIdx(raw) {
  if (raw === 0 || raw === '0' || raw === 'top' || raw === 'a' || raw === 'am' || raw === 'AM') return 0
  if (raw === 1 || raw === '1' || raw === 'bottom' || raw === 'b' || raw === 'pm' || raw === 'PM') return 1
  return 0
}

/* -------- DATA -------- */
const yDocs = computed(() => props.documentos.slice())

// MODO DIARIO con división horizontal (subfilas por documento)
function buildDailyMatrixHorizontal () {
  const docs = yDocs.value
  const totalDays = daysInMonth(props.year, props.month)
  const subRows = Math.max(1, props.subRowsPerDoc)
  const totalY = docs.length * subRows

  // doc+day+subrow -> status
  const map = new Map()
  for (const r of props.registros) {
    const dt = new Date(r.date)
    if (dt.getFullYear() !== props.year || (dt.getMonth()+1) !== props.month) continue
    const day = dt.getDate()

    if (r.slot === undefined && subRows > 1) {
      for (let s = 0; s < subRows; s++) map.set(`${r.doc}::${day}::${s}`, r.status)
    } else {
      const s = slotIdx(r.slot)
      map.set(`${r.doc}::${day}::${s}`, r.status)
    }
  }

  const data = []
  for (let y = 0; y < docs.length; y++) {
    const doc = docs[y]
    for (let d = 1; d <= totalDays; d++) {
      for (let s = 0; s < subRows; s++) {
        const status = map.get(`${doc}::${d}::${s}`) || 'none'
        const ySlot = y * subRows + s // subfila
        data.push([d - 1, ySlot, STATUS_TO_VALUE[status]])
      }
    }
  }

  const xCategories = Array.from({ length: totalDays }, (_, i) => labelDia(props.year, props.month, i + 1))
  return { xCategories, totalY, subRowsPerDoc: subRows, data }
}

// MODO SEMANAL (una fila por documento)
function buildWeeklyMatrix () {
  const docs = yDocs.value
  const totalDays = daysInMonth(props.year, props.month)
  const lastWeek = weekOfMonth(props.year, props.month, totalDays)
  const worst = new Map()

  for (const r of props.registros) {
    const dt = new Date(r.date)
    if (dt.getFullYear() !== props.year || (dt.getMonth()+1) !== props.month) continue
    const w = weekOfMonth(props.year, props.month, dt.getDate())
    const k = `${r.doc}::${w}`
    const v = STATUS_TO_VALUE[r.status] ?? 0
    worst.set(k, Math.max(worst.get(k) ?? 0, v))
  }

  const data = []
  for (let y = 0; y < docs.length; y++) {
    const doc = docs[y]
    for (let w = 1; w <= lastWeek; w++) {
      data.push([w - 1, y, worst.get(`${doc}::${w}`) ?? 0])
    }
  }

  const xCategories = Array.from({ length: lastWeek }, (_, i) => `Sem ${i + 1}`)
  return { xCategories, totalY: docs.length, subRowsPerDoc: 1, data, weekly: true }
}

/* -------- CHART -------- */
function safe(obj) {
  // Clonado plano para evitar proxys/reactividad dentro de Highcharts
  return JSON.parse(JSON.stringify(obj))
}

function chartOptions ({ xCategories, totalY, subRowsPerDoc, data, weekly = false }) {
  const DOCS = Math.floor(totalY / subRowsPerDoc)
    // Color del gap (ajústalo si tu fondo no es blanco)
  const GAP_COLOR = '#fff'         // o '#fafafa' si tu card es gris claro
  const GAP_PX    = 7              // separación deseada en píxeles

  // 👇 “margen” entre Plan(0) y Real(1) de cada documento (no cambia el alto de filas)
  const splitLines = weekly ? [] : Array.from({ length: DOCS }, (_, idx) => ({
    color: GAP_COLOR,              // igual al fondo => se ve como separación
    width: GAP_PX,                 // grosor en píxeles
    value: idx * subRowsPerDoc - 0.5, // entre 0–1, 2–3, 4–5, ...
    zIndex: 5
  }))

  return {
    chart: { type: 'heatmap', backgroundColor: 'transparent', height: 460, spacing: [26,10,10,10] },
    title: { text: null },
    credits: { enabled: false },
    legend: { enabled: false },

    xAxis: {
      categories: xCategories,
      opposite: true,
      tickLength: 0,
      lineWidth: 0,
      labels: { useHTML: true, style: { fontSize: '11px' } },
      lineColor: '#e0e0e0'
    },

    // 👇 eje Y numérico con subfilas (Plan/Real)
    yAxis: [{
      min: 0,
      max: totalY - 1,
      tickInterval: subRowsPerDoc,       // ticks SOLO al inicio de cada documento
      labels: {
        x: -30,
        y: -10,
        formatter() {
          const docIndex = Math.floor(this.value / subRowsPerDoc)
          return yDocs.value[docIndex] ?? ''
        },
        style: { fontSize: '12px' }
      },

      // bordes de documento en gris
      gridLineWidth: 1,
      gridLineColor: '#e0e0e0',

      // ❌ sin minor grid (para no pintar de más)
      minorTickInterval: null,
      minorGridLineWidth: 0,

      // ✅ línea amarilla entre Plan/Real
      plotLines: splitLines,

      reversed: false,
      title: null
    },
    {
        linkedTo: 0,
        min: 0,
        max: totalY - 1,
        reversed: true,
        tickInterval: 1,
        labels: {
          align: 'right',
          x: -5,
          y: 31,
          formatter() {
            // 0 = Plan, 1 = Real
            return (Number(this.value) % subRowsPerDoc) === 0 ? 'Plan' : 'Real'
          },
          style: { fontSize: '11px', color: '#666' }
        },
        lineWidth: 0,
        gridLineWidth: 0,
        minorGridLineWidth: 0,
        tickLength: 0,
        title: null,
        offset: 0         // más cerca del área del gráfico
      }
  ],

    colorAxis: {
      dataClasses: [
        { from: 0, to: 0, color: COLORS.none, name: VALUE_TO_NAME[0] },
        { from: 1, to: 1, color: COLORS.ok,   name: VALUE_TO_NAME[1] },
        { from: 2, to: 2, color: COLORS.warn, name: VALUE_TO_NAME[2] },
        { from: 3, to: 3, color: COLORS.fail, name: VALUE_TO_NAME[3] }
      ]
    },

    tooltip: {
      useHTML: true,
      formatter() {
        const docIdx = Math.floor(this.point.y / subRowsPerDoc)
        const docName = yDocs.value[docIdx]
        const day = this.series.xAxis.categories[this.point.x]
        const slot = (this.point.y % subRowsPerDoc) // 0 plan, 1 real
        const slotName = slot === 0 ? 'Plan' : 'Real'
        return `<b>${docName}</b><br/>${day} — ${slotName}: <b>${VALUE_TO_NAME[this.point.value]}</b>`
      }
    },

    plotOptions: {
      series: { turboThreshold: 0 },
      heatmap: {
        colsize: 1,
        rowsize: 1,
        borderWidth: 2,
        borderColor: '#fff',
        dataLabels: { enabled: false }
      }
    },

    series: [{ type: 'heatmap', data }]
  }
}

function buildChart() {
  const payload = groupByWeek.value ? buildWeeklyMatrix() : buildDailyMatrixHorizontal()
  const opts = chartOptions(payload)
  if (chart) {
    chart.update({
      xAxis: { categories: safe(opts.xAxis.categories) },
      yAxis: {
        min: 0, max: payload.totalY - 1,
        tickInterval: payload.subRowsPerDoc
      },
      series: [{ data: safe(payload.data) }]
    }, true, true)
  } else {
    chart = Highcharts.chart(chartEl.value, {
      ...opts,
      xAxis: { ...opts.xAxis, categories: safe(opts.xAxis.categories) },
      series: [{ type: 'heatmap', data: safe(payload.data) }]
    })
  }
}

/* -------- watcher y lifecycle (sin loops) -------- */
let rafId = null
function queueBuild () {
  if (rafId != null) cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => {
    rafId = null
    buildChart()
  })
}

let resizePending = false
function onResize () {
  if (resizePending) return
  resizePending = true
  requestAnimationFrame(() => {
    resizePending = false
    chart?.reflow()
  })
}

onMounted(() => {
  buildChart()
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  chart?.destroy()
  chart = null
})

// 👇 sin deep, y en flush post para correr después del render
watch(
  [groupByWeek, () => props.year, () => props.month, () => props.subRowsPerDoc, () => props.registros],
  async () => { await nextTick(); queueBuild() },
  { flush: 'post' }
)
</script>

<style scoped>
.toolbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.title { margin: 0; font-weight: 700; color: #2b2b2b; }
.controls { display: flex; align-items: center; gap: 8px; }
.chart { width: 100%; min-height: 380px; }
</style>
