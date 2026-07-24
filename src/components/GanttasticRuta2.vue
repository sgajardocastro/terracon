<template>
  <div
    class="mb-2"
    style="display:flex; gap:8px;"
  >
    <v-btn
      color="green"
      @click="exportarExcelCompleto"
    >
      EXCEL COMPLETO
    </v-btn>
    <v-btn
      color="red"
      @click="exportarPDF"
    >
      EXPORTAR PDF
    </v-btn>
  </div>

  <div
    ref="gridRef"
    class="gridgantt"
  >
    <!-- HEADER IZQUIERDA -->
    <div class="left-header">
      <div class="cell w-cuadrilla">
        Cuadrilla
      </div>
      <div class="cell w-partida">
        Partida
      </div>
      <div class="cell w-unidad">
        Unidad
      </div>
      <div class="cell w-pond">
        Pond.
      </div>
      <div class="cell w-obj">
        Cant. Objetivo
      </div>
      <div class="cell w-obj">
        Cant. Avance
      </div>
      <div class="cell w-av">
        % Cant. Avance
      </div>
      <div class="cell w-av">
        % Avance Pond.
      </div>
      <div class="cell w-tipo">
        Plan
      </div>
    </div>

    <!-- (oculto: eje de días lo dibuja Ganttastic) -->
    <div class="right-header-viewport is-hidden" />

    <div class="rows-scroller">
      <!-- IZQUIERDA: TABLA -->
      <div class="left-body">
        <div
          v-for="(row, i) in visibleRows"
          :key="'L'+i+'-'+row.kind"
          class="left-row"
          :class="[{ even: i%2===1 }, row.kind]"
          :style="{ height: row.kind==='data' ? rowHeight+'px' : headerRowHeight+'px' }"
        >
          <!-- Cuadrilla -->
          <div class="cell w-cuadrilla">
            <template v-if="row.kind==='cuad'">
              <button
                class="chev"
                :aria-expanded="isCuadOpen(row.cuadrilla)"
                @click="toggleCuad(row.cuadrilla)"
              >
                <span :class="['arrow', { open: isCuadOpen(row.cuadrilla) }]">▶</span>
              </button>
              <span class="linklike">{{ row.cuadrilla }}</span>
            </template>
          </div>

          <!-- Partida -->
          <div class="cell w-partida">
            <template v-if="row.kind==='data'">
              <span
                v-if="row.showLeft"
                class="partida-title"
              >{{ row.partida }}</span>
            </template>
            <template v-else>
              <span class="muted" />
            </template>
          </div>

          <div class="cell w-unidad">
            <template v-if="row.kind==='data'">
              <span v-if="row.showLeft">{{ row.unidad ?? '—' }}</span>
            </template>
          </div>
          <div class="cell w-pond">
            <template v-if="row.kind==='data'">
              <span v-if="row.showLeft">{{ formatNum(row.pondMostrar) }}</span>
            </template>
          </div>
          <div class="cell w-obj">
            <template v-if="row.kind==='data'">
              <span v-if="row.showLeft">{{ formatNum(row.cantObjetivo) }}</span>
            </template>
          </div>

          <div class="cell w-obj">
            {{ formatNum(row.cantAvance) }}
          </div>

          <div class="cell w-av">
            <template v-if="row.kind==='data'">
              <div class="pct-bar is-plan">
                <div
                  class="pct-bar__fill"
                  :style="{ width: clamp01(row.avance) + '%' }"
                />
                <span class="pct-bar__text">{{ Math.round(row.avance ?? 0) }}%</span>
              </div>
            </template>
            <span v-else>—</span>
          </div>

          <div class="cell w-av">
            <template v-if="row.kind==='data'">
              <div class="pct-bar is-plan">
                <div
                  class="pct-bar__fill"
                  :style="{ width: pondWidth(row) }"
                />
                <span class="pct-bar__text">{{ pondLabel(row) }}</span>
              </div>
            </template>
            <span v-else>—</span>
          </div>

          <div class="cell w-tipo">
            <template v-if="row.kind==='data'">
              <span class="badge b-plan">Plan</span>
            </template>
            <span v-else>—</span>
          </div>
        </div>
      </div>

      <!-- DERECHA: GANTT REAL (Ganttastic) -->
      <div class="right-side">
        <GGanttChart
          class="ganttastic-wrapper"
          :start="chartStart"
          :end="chartEnd"
          :precision="'day'"
          :row-height="rowHeight"
          :links="ganttLinks"
          :grid="false"
          :push-on-overlap="true"
        >
          <!-- 👇 Header con fechas -->
          <template #header>
            <GGanttHeader
              :start="chartStart"
              :end="chartEnd"
              :precision="'day'"
              :style="{ position: 'sticky', top: '0', zIndex: 5, background: '#eef2f7', borderBottom: '1px solid #e5e7eb' }"
            />
          </template>

          <!-- 👇 Líneas verticales de día (opcional) -->
          <GGanttGrid :precision="'day'" />

          <!-- 👇 Filas (una por Partida) -->
          <GGanttRow
            v-for="(r, i) in ganttRows"
            :key="'row-'+i"
            :label="r.label"
            :bars="r.bars"
          />
        </GGanttChart>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

import { GGanttChart, GGanttRow } from '@infectoone/vue-ganttastic'

/* =================== MOCK: datos de mentira =================== */
const tareasDemo = [
  // Cuadrilla 1
  { id_tarea: 1,  nivel: 1, nombre_tarea: 'Cuadrilla 1', ponderado: 30 },
  { id_tarea: 10, nivel: 2, id_tarea_padre: 1, nombre_tarea: 'Aperturas de Pista', unidad: 'ML', cantidad_objetivo: 180,
    json_data: [{fecha:'2025-10-20', value: 90}, {fecha:'2025-10-21', value: 90}] },
  { id_tarea: 11, nivel: 2, id_tarea_padre: 1, nombre_tarea: 'Registro de calicatas', unidad: 'UN', cantidad_objetivo: 12,
    json_data: [{fecha:'2025-10-22', value: 6}, {fecha:'2025-10-23', value: 6}] },
  { id_tarea: 12, nivel: 2, id_tarea_padre: 1, nombre_tarea: 'Retiro de revestimiento', unidad: 'ML', cantidad_objetivo: 180,
    json_data: [{fecha:'2025-10-24', value: 100}, {fecha:'2025-10-25', value: 120}] },
  // Cuadrilla 2
  { id_tarea: 2,  nivel: 1, nombre_tarea: 'Cuadrilla 2', ponderado: 20 },
  { id_tarea: 20, nivel: 2, id_tarea_padre: 2, nombre_tarea: 'Excavación', unidad: 'M3', cantidad_objetivo: 100,
    json_data: [{fecha:'2025-10-21', value: 40}, {fecha:'2025-10-24', value: 60}] },
  { id_tarea: 21, nivel: 2, id_tarea_padre: 2, nombre_tarea: 'Rellenos', unidad: 'M3', cantidad_objetivo: 80,
    json_data: [{fecha:'2025-10-26', value: 30}, {fecha:'2025-10-28', value: 50}] },
]

/* =================== Helpers =================== */
const parse = (s) => new Date(s.replace(' ', 'T'))
const trunc = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())
const ymd = (date) => {
  const pad = (n) => String(n).padStart(2,'0')
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`
}
const formatNum = (v) => (v == null || v === '' ? '—' : new Intl.NumberFormat('es-CL', { maximumFractionDigits: 2 }).format(v))
const clamp01 = (v) => Math.max(0, Math.min(100, Math.round(v ?? 0)))
const toDate = (s) => (s ? new Date(`${s}T00:00:00`) : null)

/* =================== Transformador (igual a tu flujo, pero usando MOCK) =================== */
function buildRowsFromTareas(tareas = []) {
  const padres = new Map()
  const hijos = []
  for (const t of tareas) {
    if (t.nivel === 1) padres.set(t.id_tarea, { nombre: t.nombre_tarea, ponderado: t.ponderado ?? null })
    else if (t.nivel === 2) hijos.push(t)
  }

  const rows = []
  for (const h of hijos) {
    const padre = padres.get(h.id_tarea_padre)
    if (!padre) continue
    const json = Array.isArray(h.json_data) ? h.json_data : []

    let dMin = null, dMax = null, planTotal = 0
    const daily = {}
    for (const it of json) {
      const key = it?.fecha; if (!key) continue
      const v = it.value == null || it.value === '' ? null : Number(it.value)
      if (v != null) {
        planTotal += v
        daily[key] = (daily[key] ?? 0) + v
        const dd = new Date(`${key}T00:00:00`)
        dMin = dMin ? (dd < dMin ? dd : dMin) : dd
        dMax = dMax ? (dd > dMax ? dd : dMax) : dd
      }
    }

    const cantObjetivo = h.cantidad_objetivo ?? null
    const avancePlanPct = cantObjetivo && cantObjetivo > 0 ? (planTotal / cantObjetivo) * 100 : 0

    rows.push({
      kind: 'data',
      id_tarea: h.id_tarea,
      cuadrilla: padre.nombre,
      partida: h.nombre_tarea,
      unidad: h.unidad ?? '',
      avance: Math.round(avancePlanPct),
      ponderado: null,
      pond: null,
      ponderadoCuad: padre.ponderado,
      cantObjetivo,
      cantAvance: planTotal,
      start: dMin ? ymd(dMin) : null,
      end:   dMax ? ymd(dMax) : null,
      daily: Object.keys(daily).length ? daily : null
    })
  }

  // Cabecera por cuadrilla + filas
  const out = []
  const tree = new Map()
  for (const r of rows) {
    if (!tree.has(r.cuadrilla)) tree.set(r.cuadrilla, [])
    tree.get(r.cuadrilla).push(r)
  }
  for (const [cuad, recs] of tree.entries()) {
    const starts = recs.map(r => r.start).filter(Boolean).map(s => toDate(s))
    const ends   = recs.map(r => r.end).filter(Boolean).map(s => toDate(s))
    const spanStart = starts.length ? new Date(Math.min(...starts)) : null
    const spanEnd   = ends.length   ? new Date(Math.max(...ends))   : null
    out.push({ kind: 'cuad', cuadrilla: cuad, pondMostrar: recs[0]?.ponderadoCuad ?? null, spanStart, spanEnd })

    const porPartida = new Map()
    for (const r of recs) {
      if (!porPartida.has(r.partida)) porPartida.set(r.partida, [])
      porPartida.get(r.partida).push(r)
    }
    for (const [partida, lista] of porPartida.entries()) {
      let first = true
      for (const r of lista) {
        out.push({ ...r, showLeft: first })
        first = false
      }
    }
  }

  return out
}

/* =================== Estado/UI =================== */
const rowHeight = 44
const headerRowHeight = 36

const rows = computed(() => buildRowsFromTareas(tareasDemo))

const treeByCuad = computed(() => {
  const mapa = new Map()
  for (const r of rows.value) {
    if (r.kind !== 'data') continue
    if (!mapa.has(r.cuadrilla)) mapa.set(r.cuadrilla, new Map())
    const porPartida = mapa.get(r.cuadrilla)
    if (!porPartida.has(r.partida)) porPartida.set(r.partida, [])
    porPartida.get(r.partida).push(r)
  }
  return mapa
})

const openCuads = ref(new Set())
const isCuadOpen = (c) => openCuads.value.has(c)
const toggleCuad = (c) => {
  const s = new Set(openCuads.value)
  s.has(c) ? s.delete(c) : s.add(c)
  openCuads.value = s
}

const visibleRows = computed(() => {
  const out = []
  for (const [cuad, porPartida] of treeByCuad.value.entries()) {
    const all = Array.from(porPartida.values()).flat()
    const starts = all.map(r => r.start).filter(Boolean).map(toDate)
    const ends   = all.map(r => r.end).filter(Boolean).map(toDate)
    const spanStart = starts.length ? new Date(Math.min(...starts)) : null
    const spanEnd   = ends.length   ? new Date(Math.max(...ends))   : null
    out.push({ kind: 'cuad', cuadrilla: cuad, pondMostrar: all[0]?.ponderadoCuad ?? null, spanStart, spanEnd })

    if (!isCuadOpen(cuad)) continue
    for (const [partida, recs] of porPartida.entries()) {
      let first = true
      for (const r of recs) {
        out.push({ ...r, showLeft: first })
        first = false
      }
    }
  }
  return out
})

/* =================== Eje Gantt: desde la 1ª hasta la última fecha del MOCK =================== */
const chartRange = computed(() => {
  const fechas = tareasDemo.flatMap(t =>
    (Array.isArray(t.json_data) ? t.json_data : [])
      .map(x => x?.fecha)
      .filter(Boolean)
      .map(f => new Date(`${f}T00:00:00`))
  )
  const min = new Date(Math.min(...fechas))
  const max = new Date(Math.max(...fechas))
  const pad = 1 // día de buffer
  const s = new Date(min); s.setDate(s.getDate() - pad)
  const e = new Date(max); e.setDate(e.getDate() + pad)
  return { start: s, end: e }
})
const chartStart = computed(() => chartRange.value.start)
const chartEnd   = computed(() => chartRange.value.end)

/* =================== Ganttastic Rows (fila = Partida) =================== */
const ganttRows = computed(() => {
  const out = []
  for (const [cuad, porPartida] of treeByCuad.value.entries()) {
    for (const [partida, recs] of porPartida.entries()) {
      const starts = recs.map(r => toDate(r.start)).filter(Boolean)
      const ends   = recs.map(r => toDate(r.end)).filter(Boolean)
      if (!starts.length || !ends.length) continue
      const s = new Date(Math.min(...starts))
      const e = new Date(Math.max(...ends))

      out.push({
        label: `${cuad} — ${partida}`,
        bars: [{
          start: s,
          end: e,
          ganttBarConfig: { id: `t-${recs[0].id_tarea}`, label: partida, class: 'gbar--plan' }
        }]
      })
    }
  }
  return out
})

/* =================== Links demo (consecutivos) =================== */
const ganttLinks = computed(() => {
  const rows = ganttRows.value
  const links = []
  for (let i = 1; i < rows.length; i++) {
    const from = rows[i-1].bars[0].ganttBarConfig.id
    const to   = rows[i].bars[0].ganttBarConfig.id
    links.push({ from, to, type: 'finish-start' })
  }
  return links
})

/* =================== Montaje =================== */
onMounted(async () => {
  // abre todas las cuadrillas del mock
  visibleRows.value.forEach(r => { if (r.kind === 'cuad') openCuads.value.add(r.cuadrilla) })
  await nextTick()
})

/* =================== Ponderado (píldora) =================== */
const pondPct = (row) => {
  const w0 = row.ponderadoCuad ?? row.ponderado ?? row.pond
  if (w0 == null || row.avance == null) return null
  let w = Number(w0)
  if (Number.isNaN(w)) return null
  if (w <= 1) w = w * 100
  return Math.max(0, Math.min(100, Math.round(row.avance * (w / 100))))
}
const pondWidth = (row) => {
  const v = pondPct(row); return v == null ? '0%' : v + '%'
}
const pondLabel = (row) => {
  const v = pondPct(row); return v == null ? '—' : v + '%'
}

/* =================== Export =================== */
const gridRef = ref(null)
function toggleExportMode(on){ (gridRef.value||document.querySelector('.gridgantt'))?.classList.toggle('exporting', !!on) }

async function exportarPDF() {
  const el = gridRef.value || document.querySelector('.gridgantt'); if (!el) return
  toggleExportMode(true)
  if (document.fonts?.ready) { try { await document.fonts.ready } catch {} }
  const canvas = await html2canvas(el, { backgroundColor:'#fff', scale:2, useCORS:true, allowTaint:true })
  const pdf = new jsPDF('l','mm','a3')
  const pxToMm = (px) => px * 25.4 / 96
  const w = pxToMm(canvas.width), h = pxToMm(canvas.height)
  const r = Math.min(pdf.internal.pageSize.getWidth()/w, pdf.internal.pageSize.getHeight()/h)
  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, w*r, h*r)
  pdf.save('Gantt.pdf')
  toggleExportMode(false)
}

async function exportarExcelCompleto() {
  const fixed = ['Cuadrilla','Partida','Unidad','Pond.','Cant. Objetivo','Cant. Avance','% Cant. Avance','% Avance Pond.','Tipo']
  const data = []
  for (const row of visibleRows.value) {
    data.push({
      'Cuadrilla': row.kind==='cuad' ? row.cuadrilla : '',
      'Partida'  : row.kind==='data' ? row.partida   : '',
      'Unidad'   : row.unidad ?? '',
      'Pond.'    : row.pondMostrar ?? '',
      'Cant. Objetivo': row.cantObjetivo ?? '',
      'Cant. Avance'  : row.cantAvance   ?? '',
      '% Cant. Avance': row.kind==='data' ? Math.round(row.avance ?? 0) : '',
      '% Avance Pond.': row.kind==='data' ? (pondPct(row) ?? '') : '',
      'Tipo': row.kind==='data' ? 'Plan' : ''
    })
  }
  const ws = XLSX.utils.json_to_sheet(data, { header: fixed })
  ws['!cols'] = [{wch:18},{wch:32},{wch:8},{wch:8},{wch:14},{wch:14},{wch:14},{wch:16},{wch:10}]
  ws['!freeze'] = { xSplit: 9, ySplit: 1 }
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Gantt')
  const buf = XLSX.write(wb, { bookType:'xlsx', type:'array' })
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), 'Gantt_completo.xlsx')
}
</script>

<style scoped>
*{ box-sizing: border-box; }
.is-hidden{ display:none !important; }

/* ===== Grid principal ===== */
.gridgantt{
  --left-w: 960px;
  background: #f8fafc;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0,0,0,.06);
  overflow: hidden;
  display: grid;
  grid-template-columns: var(--left-w) minmax(0, 1fr);
  grid-template-rows: 48px 1fr;
}

/* ===== Header izquierda ===== */
.left-header{
  grid-column: 1; grid-row: 1;
  display: grid;
  grid-template-columns: 110px 220px 60px 60px 90px 90px 120px 120px 90px;
  align-items: center; height: 48px;
  background: #eef2f7; color: #374151; font-weight: 600;
  border-bottom: 1px solid #e5e7eb;
  position: sticky; left: 0; z-index: 6;
}
.left-header .cell{ justify-content: center; text-align: center; }
.left-header .w-partida{ text-overflow: ellipsis; white-space: nowrap; overflow: hidden; }

/* ===== Scroller ===== */
.rows-scroller{
  grid-column: 1 / 3; grid-row: 2;
  display: grid; grid-template-columns: var(--left-w) minmax(0, 1fr);
}
.left-body{
  position: sticky; left: 0; z-index: 4; background: #f8fafc; box-shadow: 1px 0 0 #e5e7eb;
  overflow: auto; max-height: calc(100vh - 160px);
}
.left-row{
  display: grid;
  grid-template-columns: 110px 220px 60px 60px 90px 90px 120px 120px 90px;
}
.left-row.even .cell{ background:#fafbff; }
.left-row.cuad .cell{ height: 36px; }

.cell{
  padding: 0 12px; height: 44px;
  display:flex; align-items:center; gap:8px;
  border-bottom:1px solid #eef2f7; color:#111827; font-size:14px;
}
.linklike{ color:#0f62fe; font-weight:600; cursor:pointer; }
.linklike:hover{ text-decoration: underline; }
.muted{ color:#4b5563; }
.partida-title{ font-weight:600; color:#111827; }

.chev{ border:none; background:transparent; cursor:pointer; padding:0 4px; }
.arrow{ display:inline-block; transition: transform .2s ease; }
.arrow.open{ transform: rotate(90deg); }

/* ===== Píldoras % ===== */
.w-av .pct-bar{
  --track:#dff1fb; --fill:#8ecae6;
  position: relative; width: 140px; height: 26px; border-radius: 9999px;
  background: var(--track); overflow: hidden; box-shadow: inset 0 0 0 1px rgba(0,0,0,.04);
}
.w-av .pct-bar__fill{ position:absolute; inset:auto 0 auto 0; top:0; bottom:0; background:var(--fill); border-radius:9999px; transition: width .25s ease; }
.w-av .pct-bar__text{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:13px; color:#000; text-shadow:0 1px 0 rgba(0,0,0,.18); }

.badge{ display:inline-block; padding:2px 8px; border-radius:999px; font-weight:700; font-size:12px; color:#fff !important; text-shadow:0 1px 0 rgba(0,0,0,.15); }
.b-plan{ background:#8ecae6 !important; }

/* ===== Ganttastic ===== */
.right-side{ min-width: 0; overflow: auto; max-height: calc(100vh - 160px); }
.ganttastic-wrapper{
  --gg-grid-color:#edf0f3;
  --gg-grid-current-color:#ffd166;
  --gg-label-bg:transparent;
  --gg-row-bg-odd:#fafbff;
  --gg-row-bg-even:#f8fafc;
  --gg-link-color:#0ea5e9;
}
.gbar--plan .gg-bar{
  background:#8ecae6;
  box-shadow:0 2px 6px rgba(0,0,0,.15);
  border-radius:14px;
  color:#0b3b50;
  font-weight:800;
}

/* ===== Export ===== */
.gridgantt.exporting { box-shadow:none !important; filter:none !important; background:#fff !important; }
.gridgantt.exporting .left-header{ position: static !important; }
.gridgantt.exporting .left-body, .gridgantt.exporting .right-side{ max-height:none !important; overflow:visible !important; }
</style>
