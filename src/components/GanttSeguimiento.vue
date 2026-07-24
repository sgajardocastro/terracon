<template>
  <div class="gantt-wrap">
    <div
      ref="el"
      class="gantt-container"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import ApexGantt from 'apexgantt'

const d = (y, m, day) => Date.UTC(y, m - 1, day)
const toMDY = (ts) => {
  const dt = new Date(ts)
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const dd = String(dt.getDate()).padStart(2, '0')
  const yy = dt.getFullYear()
  return `${mm}-${dd}-${yy}`
}
const diffDays = (s, e) => {
  const [sm, sd, sy] = s.split('-').map(Number)
  const [em, ed, ey] = e.split('-').map(Number)
  const ms = new Date(ey, em - 1, ed) - new Date(sy, sm - 1, sd)
  return Math.max(0, Math.round(ms / 86400000)) || 0
}
const colorByTipo = (t) => (t === 'Planificado' ? '#7ABAFF' : '#3CB371')

// ── datos demo
const rows = [
  { familia: 'Movimiento de tierras', partida: 'Excavaciones [MI]',         cuadrilla: 'C-01', tipo: 'Planificado', cantidad: 2.00,  avance: 25, x:d(2025,10,21), x2:d(2025,10,22) },
  { familia: 'Movimiento de tierras', partida: 'Instalación de Faena [ud]', cuadrilla: 'C-02', tipo: 'Planificado', cantidad: 500.0, avance:100, x:d(2025,10,18), x2:d(2025,10,22) },
  { familia: 'Área Mecánica',         partida: 'Tendido Cable Ánodo [m²]',  cuadrilla: 'C-03', tipo: 'Real',        cantidad: 37.5,  avance: 80, x:d(2025,10,20), x2:d(2025,10,22) },
]

function buildSeries(rows) {
  const famMap = new Map()
  rows.forEach(r => {
    if (!famMap.has(r.familia)) famMap.set(r.familia, [])
    famMap.get(r.familia).push(r)
  })

  const series = []
  let famIdx = 0

  for (const [familia, famRows] of famMap.entries()) {
    const famStart = Math.min(...famRows.map(r => r.x))
    const famEnd   = Math.max(...famRows.map(r => r.x2))
    const famProg  = Math.round(famRows.reduce((s, r) => s + (+r.avance || 0), 0) / famRows.length)
    const famId    = `fam-${++famIdx}`

    series.push({
      id: famId, name: familia,
      startTime: toMDY(famStart), endTime: toMDY(famEnd), progress: famProg,
      familia, partida: '', cuadrilla: '', rowBackgroundColor: '#f6f8fa'
    })

    const partMap = new Map()
    famRows.forEach(r => {
      if (!partMap.has(r.partida)) partMap.set(r.partida, [])
      partMap.get(r.partida).push(r)
    })

    let pIdx = 0
    for (const [partida, partRows] of partMap.entries()) {
      const pStart = Math.min(...partRows.map(r => r.x))
      const pEnd   = Math.max(...partRows.map(r => r.x2))
      const pProg  = Math.round(partRows.reduce((s, r) => s + (+r.avance || 0), 0) / partRows.length)
      const partId = `${famId}-p-${++pIdx}`

      series.push({
        id: partId, parentId: famId, name: partida,
        startTime: toMDY(pStart), endTime: toMDY(pEnd), progress: pProg,
        familia, partida, cuadrilla: '', rowBackgroundColor: '#ffffff'
      })

      partRows.forEach((r, i) => {
        series.push({
          id: `${partId}-c-${i+1}`, parentId: partId, name: r.cuadrilla,
          startTime: toMDY(r.x), endTime: toMDY(r.x2), progress: +r.avance || 0,
          barBackgroundColor: colorByTipo(r.tipo),
          familia, partida, cuadrilla: r.cuadrilla, tipo: r.tipo, cantidad: r.cantidad
        })
      })
    }
  }
  return series
}

const series = buildSeries(rows)

// helpers (déjalos donde ya los tienes)
const toDMY = (mdy) => {
  // mdy: 'MM-DD-YYYY' -> 'DD-MM-YYYY'
  if (!mdy) return ''
  const [mm, dd, yyyy] = String(mdy).split('-')
  return `${dd}-${mm}-${yyyy}`
}

// ── OPCIONES: columnas EN ESPAÑOL y desactivar las default (dos banderas)
const options = {
  enableTooltip: true,
  enableTaskDrag: false,
  enableTaskEdit: false,
  enableTaskResize: false,

  // algunas versiones usan esta:
  showDefaultColumns: false,

  // y otras esta (estructura table):
  table: {
    useDefaultColumns: false,
    columns: [
      { title: 'Tarea',     field: 'name',      width: 260 }, // (antes "Task Name")
      { title: 'Familia',   field: 'familia',   width: 200 },
      { title: 'Partida',   field: 'partida',   width: 240 },
      { title: 'Cuadrilla', field: 'cuadrilla', width: 110 },
      { title: 'Inicio',    field: 'startTime', width: 110,
        formatter: (v) => toDMY(v) },
      // ⬇️ Nueva columna: "Final" (mapea al campo 'end' si lo traes,
      // y si no, usa endTime para calcular/mostrar)
      { title: 'Final',     field: 'end',       width: 110,
        formatter: (v, row) => toDMY(v || row.endTime) },
      { title: 'Duración',  field: 'endTime',   width: 95,
        formatter: (_, row) => `${diffDays(row.startTime, row.endTime)} d` },
      { title: 'Avance',    field: 'progress',  width: 90,
        formatter: (v) => `${v ?? 0}%` },
    ]
  },

  series
}

const el = ref(null)
let gantt = null

function render() {
  if (!el.value) return
  if (gantt?.destroy) gantt.destroy()
  gantt = new ApexGantt(el.value, options)
  gantt.render()
  // Plan B: si igual apareciera "Task Name" (por defaults internos), lo forzamos a "Tarea"
  forceSpanishHeader()
}

function forceSpanishHeader() {
  // Busca th que diga exactamente "Task Name" y cámbialo
  const headers = el.value?.querySelectorAll('th, .apexgantt__table th, .ag-column-header-cell')
  if (!headers) return
  headers.forEach(h => {
    const txt = (h.textContent || '').trim()
    if (txt === 'Task Name') h.textContent = 'Tarea'
    if (txt === 'Start') h.textContent = 'Inicio'
  })
  // Reintento pequeño por si el lib rehidrata tarde
  setTimeout(() => {
    const hs = el.value?.querySelectorAll('th, .apexgantt__table th, .ag-column-header-cell')
    hs?.forEach(h => {
      const txt = (h.textContent || '').trim()
      if (txt === 'Task Name') h.textContent = 'Tarea'
      if (txt === 'Start') h.textContent = 'Inicio'
    })
  }, 50)
}

function handleResize() {
  if (gantt?.resize) gantt.resize()
  forceSpanishHeader()
}

onMounted(async () => {
  await nextTick()
  render()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (gantt?.destroy) gantt.destroy()
  gantt = null
})
</script>

<style scoped>
.gantt-wrap { width: 100%; min-height: 480px; }
.gantt-container { width: 100%; height: 100%; }
</style>
