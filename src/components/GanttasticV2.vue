<template>
  <div class="gantt-v2-container">
    <div class="controls pa-2 d-flex align-center gap-4 border-b">
      <v-btn
        color="blue-grey-darken-3"
        variant="tonal"
        class="text-none font-weight-bold"
        @click="$emit('refresh')"
      >
        Refrescar
      </v-btn>
      <div
        class="zoom-sliders d-flex align-center gap-4 ml-4"
        style="width: 300px; max-width: 100%;"
      >
        <div class="d-flex align-center flex-grow-1">
          <v-icon
            size="small"
            class="mr-2"
            color="grey-darken-1"
          >
            mdi-arrow-expand-horizontal
          </v-icon>
          <v-slider
            v-model="zoomHoriz"
            :min="minZoomHoriz"
            :max="120"
            :step="1"
            hide-details
            density="compact"
            color="teal-darken-1"
            track-color="blue-grey-lighten-4"
            thumb-color="teal-darken-2"
            class="mt-0"
            title="Zoom Horizontal (Escala de Tiempo)"
          />
        </div>
      </div>
      <v-spacer />
      <div class="info-text">
        Tareas cargadas: {{ actualTareas.length }} | Niveles detectados: {{ maxNivel }}
      </div>
    </div>

    <!-- Main Layout with Y-Axis Slider and Grid -->
    <div
      class="d-flex"
      style="flex-grow: 1; overflow: hidden; position: relative;"
    >
      <!-- Y-Axis Vertical Zoom Slider -->
      <div class="y-axis-slider">
        <v-slider
          v-model="zoomVert"
          :min="20"
          :max="80"
          :step="2"
          direction="vertical"
          hide-details
          color="teal-darken-1"
          track-color="blue-grey-lighten-4"
          thumb-color="teal-darken-2"
          title="Zoom Vertical (Altura de Filas)"
          class="flex-grow-1"
        />
        <v-icon
          size="small"
          class="mt-4"
          color="grey-darken-1"
          title="Zoom Vertical"
        >
          mdi-arrow-expand-vertical
        </v-icon>
      </div>

      <div
        ref="gridRef"
        class="grid-v2"
        style="flex-grow: 1; position: relative;"
        :style="{ '--left-width': leftWidth + 'px' }"
      >
        <!-- SPLITTER (Resizer) -->
        <div
          class="gantt-splitter"
          :class="{ 'is-resizing': isResizing }"
          @mousedown.prevent="startResizing"
        />

        <!-- HEADER -->
        <div class="header-row">
          <!-- Izquierda: Nombres -->
          <div class="left-header">
            <div class="cell w-task">
              Tarea / Descripción
            </div>
            <div class="cell w-unidad">
              Unidad
            </div>
            <div class="cell w-obj">
              Cant. Obj.
            </div>
            <div class="cell w-av">
              % Avance
            </div>
          </div>
          <!-- Derecha: Tiempo -->
          <div
            ref="headerViewport"
            class="right-header-viewport"
          >
            <div
              class="timeline-header"
              :style="{ width: totalTimelineWidth + 'px' }"
            >
              <div
                v-for="d in filteredDays"
                :key="d.key"
                class="day-label"
                :class="{ 'wknd': d.isWeekend, 'is-week': zoomLevel === 'weeks', 'is-month': zoomLevel === 'months' && d.isFirstOfMonth }"
                :style="{ width: dayW + 'px' }"
              >
                <template v-if="zoomLevel === 'days'">
                  {{ d.labelShort }}
                </template>
                <template v-else-if="zoomLevel === 'weeks'">
                  <span
                    v-if="d.weekLabel"
                    class="week-text"
                  >{{ d.weekLabel }}</span>
                </template>
                <template v-else>
                  <span
                    v-if="d.isFirstOfMonth"
                    class="month-text"
                  >{{ formatMonthLabel(d.date, dayW) }}</span>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- BODY -->
        <div
          ref="bodyScroller"
          class="body-scroller"
          @scroll="syncScroll"
        >
          <div
            class="gantt-rows-container"
            :style="{ width: `calc(${leftWidth}px + ${totalTimelineWidth}px)` }"
          >
            <!-- Background Grid (Moved inside rows container for proper sticky nesting) -->
            <div
              class="grid-background"
              :style="gridBgStyle"
            />

            <GanttRowV2
              v-for="(row, idx) in taskTree"
              :key="row.id_tarea"
              :row="row"
              :index="idx"
              :level="0"
              :px-per-day="dayW"
              :row-height="zoomVert"
              :left-width="leftWidth"
              :days="days"
              @edit="openEdit"
              @dot-click="onDotClick"
              @load-children="$emit('load-children', $event)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <v-dialog
      v-model="editOpen"
      max-width="900"
    >
      <v-card v-if="editRow">
        <v-toolbar
          flat
          density="compact"
        >
          <v-toolbar-title>Editar: {{ editRow.nombre_tarea }}</v-toolbar-title>
          <v-spacer />
          <v-btn
            icon
            @click="editOpen = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-divider />
        <v-card-text>
          <GanttEditarTareas
            ref="editorRef"
            :row="editRow"
            :plan-daily="editRow.dailyPlan || {}"
            :show-actions="false"
            @save="onSaveTask"
            @cancel="editOpen = false"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="editOpen = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            @click="editorRef?.save()"
          >
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import GanttRowV2 from './GanttRowV2.vue'
import GanttEditarTareas from './GanttEditarTareas.vue'
import apiAxios from '@/services/api'

const props = defineProps({
  tareas: { type: Array, required: true },
  fechaDesde: String,
  fechaHasta: String
})

const emit = defineEmits(['refresh', 'load-children'])

const actualTareas = computed(() => {
  if (Array.isArray(props.tareas)) return props.tareas
  if (props.tareas && Array.isArray(props.tareas.datos)) return props.tareas.datos
  return []
})

const parseJsonArray = (json) => {
  if (Array.isArray(json)) return json
  if (typeof json === 'string') {
    try {
      const parsed = JSON.parse(json)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

const toYmd = (value) => {
  if (!value) return null
  if (typeof value === 'string') {
    const clean = value.includes('T') ? value.split('T')[0] : value
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean
  }
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const daysBetweenInclusive = (start, end) => {
  const a = toYmd(start)
  const b = toYmd(end)
  if (!a || !b) return 0
  const d0 = new Date(`${a}T00:00:00Z`)
  const d1 = new Date(`${b}T00:00:00Z`)
  if (Number.isNaN(d0.getTime()) || Number.isNaN(d1.getTime()) || d1 < d0) return 0
  return Math.floor((d1 - d0) / 86400000) + 1
}

const getLeafBinaryProgressStats = (t) => {
  const dailyReal = t?.dailyReal && Object.keys(t.dailyReal).length
    ? t.dailyReal
    : parseJsonDaily(t?.json_data, 'real')

  const totalDias = daysBetweenInclusive(t?.fecha_ini_plan, t?.fecha_fin_plan)
  if (totalDias <= 0) return { diasConAvance: 0, totalDias: 0 }

  let diasConAvance = 0
  let cur = new Date(`${toYmd(t?.fecha_ini_plan)}T00:00:00Z`)
  for (let i = 0; i < totalDias; i++) {
    const key = cur.toISOString().slice(0, 10)
    const realDia = Number(dailyReal[key] ?? 0)
    if (Number.isFinite(realDia) && realDia > 0) diasConAvance += 1
    cur.setUTCDate(cur.getUTCDate() + 1)
  }

  return { diasConAvance, totalDias }
}

/* Tree Logic */
const taskTree = computed(() => {
  const map = {}
  const roots = []
  const data = actualTareas.value
  data.forEach(t => {
    map[t.id_tarea] = {
      ...t,
      cantidad_avance_pct: 0,
      children: [],
      dailyPlan: t.dailyPlan || parseJsonDaily(t.json_data, 'value'),
      dailyReal: t.dailyReal || parseJsonDaily(t.json_data, 'real'),
      reasignadoDaily: t.reasignadoDaily || parseJsonDaily(t.json_data, 'plan_reasignado', true)
    }
  })
  data.forEach(t => { if (t.id_tarea_padre && map[t.id_tarea_padre]) { map[t.id_tarea_padre].children.push(map[t.id_tarea]) } else { roots.push(map[t.id_tarea]) } })
  roots.forEach((root) => {
    const assignProgressPct = (node) => {
      let stats = { diasConAvance: 0, totalDias: 0 }
      if (node.children?.length) {
        node.children.forEach((child) => {
          const childStats = assignProgressPct(child)
          stats.diasConAvance += childStats.diasConAvance
          stats.totalDias += childStats.totalDias
        })
      } else {
        stats = getLeafBinaryProgressStats(node)
      }
      node.cantidad_avance_pct = stats.totalDias > 0
        ? (stats.diasConAvance / stats.totalDias) * 100
        : 0
      node.cantidad_objetivo = stats.totalDias
      return stats
    }
    assignProgressPct(root)
  })
  return roots
})

const maxNivel = computed(() => {
  const data = actualTareas.value
  if (!data.length) return 0
  return Math.max(0, ...data.map(t => t.nivel || 0))
})

function parseJsonDaily(json, field, isBool = false) {
  const data = parseJsonArray(json)
  if (!data.length) return {}
  const out = {}
  data.forEach(it => {
    const key = toYmd(it?.fecha)
    if (key && it[field] !== null && it[field] !== undefined && it[field] !== '') {
      out[key] = isBool ? !!Number(it[field]) : Number(it[field])
    }
  })
  return out
}

/* Timeline & Zoom */
const zoomHoriz = ref(56)
const zoomVert = ref(28)
const minZoomHoriz = ref(1)

const zoomLevel = computed(() => {
  if (zoomHoriz.value < 6) return 'months'
  if (zoomHoriz.value < 20) return 'weeks'
  return 'days'
})

const dayW = computed(() => zoomHoriz.value)
const parseDate = (s) => new Date(s.replace(' ', 'T'))
const ymd = (d) => d.toISOString().split('T')[0]

const dateLimits = computed(() => {
  const dates = actualTareas.value.flatMap(t => [t.fecha_ini_plan, t.fecha_fin_plan]).filter(Boolean).map(d => new Date(d))
  if (!dates.length) return { min: new Date(), max: new Date(Date.now() + 7 * 86400000) }
  const min = new Date(Math.min(...dates))
  min.setDate(min.getDate() - 2)
  const max = new Date(Math.max(...dates))
  max.setDate(max.getDate() + 5)
  return { min, max }
})

const days = computed(() => {
  const out = []
  let curr = new Date(dateLimits.value.min)
  while (curr <= dateLimits.value.max) {
    out.push({
      key: ymd(curr),
      labelShort: `${curr.getDate()}/${curr.getMonth() + 1}`,
      weekLabel: curr.getDay() === 1 ? `S${getWeekNumber(curr)}` : '',
      monthLabel: curr.getDate() === 1 ? curr.toLocaleString('es', { month: 'long', year: 'numeric' }) : '',
      isFirstOfMonth: curr.getDate() === 1,
      isWeekend: [0, 6].includes(curr.getDay()),
      date: new Date(curr)
    })
    curr.setDate(curr.getDate() + 1)
  }
  return out
})

const filteredDays = computed(() => days.value)
const totalTimelineWidth = computed(() => days.value.length * dayW.value)

function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function formatMonthLabel(date, dayWidth) {
  const widthPx = 30 * dayWidth
  if (widthPx < 25) return ''
  if (widthPx < 50) return date.toLocaleString('es', { month: 'narrow' })
  if (widthPx < 90) return date.toLocaleString('es', { month: 'short' }) + ' ' + date.getFullYear().toString().slice(2)
  return date.toLocaleString('es', { month: 'long', year: 'numeric' })
}

const gridRef = ref(null)
const bodyScroller = ref(null)
const headerViewport = ref(null)

let resizeObserver = null

function calcMinZoom() {
  if (headerViewport.value && days.value.length > 0) {
    const w = headerViewport.value.clientWidth
    const dCount = days.value.length
    const calculatedMin = Math.max(0.1, w / dCount)
    minZoomHoriz.value = calculatedMin
    if (zoomHoriz.value < minZoomHoriz.value) { zoomHoriz.value = minZoomHoriz.value }
  }
}

function syncScroll() {
  if (headerViewport.value && bodyScroller.value) { headerViewport.value.scrollLeft = bodyScroller.value.scrollLeft }
}

onMounted(() => {
  if (headerViewport.value) {
    resizeObserver = new ResizeObserver(() => calcMinZoom())
    resizeObserver.observe(headerViewport.value)
  }
  syncScroll()
})

onUnmounted(() => { if (resizeObserver) resizeObserver.disconnect() })

const leftWidth = ref(780)
const isResizing = ref(false)

function startResizing(e) {
  isResizing.value = true
  document.body.style.userSelect = 'none'
  document.body.style.cursor = 'col-resize'
  document.addEventListener('mousemove', onResizing)
  document.addEventListener('mouseup', stopResizing)
}

function onResizing(e) {
  if (!isResizing.value) return
  const gridEl = gridRef.value
  if (!gridEl) return
  const gridRect = gridEl.getBoundingClientRect()
  let newW = e.clientX - gridRect.left
  if (newW < 200) newW = 200
  if (newW > gridRect.width - 50) newW = gridRect.width - 50
  leftWidth.value = newW
}

function stopResizing() {
  isResizing.value = false
  document.body.style.userSelect = ''
  document.body.style.cursor = ''
  document.removeEventListener('mousemove', onResizing)
  document.removeEventListener('mouseup', stopResizing)
}

const gridBgStyle = computed(() => {
  if (zoomLevel.value === 'months') { return { width: totalTimelineWidth.value + 'px', background: 'transparent' } }
  return { backgroundImage: `repeating-linear-gradient(to right, transparent 0, transparent ${dayW.value - 1}px, #e2e8f0 ${dayW.value - 1}px, #e2e8f0 ${dayW.value}px)`, width: totalTimelineWidth.value + 'px' }
})

const editOpen = ref(false)
const editRow = ref(null)
const editorRef = ref(null)

function openEdit(row) { editRow.value = row; editOpen.value = true; }

async function onSaveTask({ reasignadoDaily, obsDaily, row }) {
  const currentJson = Array.isArray(row.json_data) ? row.json_data : []
  const mapArr = new Map(currentJson.map(it => [it.fecha, { ...it }]))
  Object.entries(reasignadoDaily).forEach(([fecha, val]) => { const existing = mapArr.get(fecha) || { fecha, value: null, real: null, fotos: [] }; mapArr.set(fecha, { ...existing, plan_reasignado: val }) })
  Object.entries(obsDaily).forEach(([fecha, txt]) => { const existing = mapArr.get(fecha) || { fecha, value: null, real: null, fotos: [] }; mapArr.set(fecha, { ...existing, observacion: txt }) })
  const newJson = Array.from(mapArr.values())
  try {
    await apiAxios.put('/tareas/updTareas', { id_tarea: row.id_tarea, json_data: newJson })
    editOpen.value = false
    emit('refresh')
  } catch (err) { console.error("Save error:", err) }
}

function onDotClick(row) {
  console.log("Dot clicked for row:", row)
  if (!row?.id_survey) return
  const baseFront = import.meta.env.VITE_APP_BASE_URL || window.location.origin
  const sep = String(baseFront).endsWith('/') ? '' : '/'
  const url = `${baseFront}${sep}verSurveyPrint?idInspeccion=${encodeURIComponent(row.id_survey)}`
  window.open(url, '_blank')
}
</script>

<style scoped>
.gantt-v2-container { height: 100%; display: flex; flex-direction: column; background: white; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; }
.grid-v2 { flex-grow: 1; display: flex; flex-direction: column; overflow: hidden; }
.header-row { display: flex; height: 38px; background: #ffffff; border-bottom: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0,0,0,0.02); flex-shrink: 0; position: relative; z-index: 15; }
.left-header {
  display: flex; width: var(--left-width, 780px); max-width: var(--left-width, 780px); flex-shrink: 0; background: #f8fafc; z-index: 10; border-right: 1px solid #e2e8f0; position: sticky; left: 0; box-sizing: border-box;
}
.right-header-viewport { flex-grow: 1; overflow: hidden; }
.timeline-header { display: flex; height: 100%; }
.day-label { display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 600; color: #64748b; border-right: 1px solid #eef2f7; position: relative; overflow: visible; }
.day-label.wknd { background: #f8fafc; color: #94a3b8; }
.day-label.is-week { border-right: 1px solid #cbd5e1; }
.day-label.is-month { border-right: 1px solid #94a3b8; }
.week-text { position: absolute; left: 6px; font-size: 10px; font-weight: 700; color: #334155; white-space: nowrap; z-index: 5; text-transform: uppercase; letter-spacing: 0.5px; }
.month-text { position: absolute; left: 8px; font-size: 11px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; z-index: 5; }
.y-axis-slider { display: flex; flex-direction: column; align-items: center; padding: 16px 4px; background: #f8fafc; border-right: 1px solid #cbd5e1; flex-shrink: 0; width: 44px; }
.body-scroller { flex-grow: 1; overflow: auto; position: relative; min-width: 0; }
.gantt-rows-container { position: relative; z-index: 2; min-width: max-content; }
.grid-background { position: absolute; top: 0; left: var(--left-width, 780px); bottom: 0; pointer-events: none; z-index: 1; }
.cell {
  padding: 0 10px; display: flex; align-items: center; font-weight: 700; color: #64748b; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; border-right: 1px solid #e2e8f0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; box-sizing: border-box;
}
.w-task { width: 45%; padding-left: 12px; }
.w-unidad { width: 10%; justify-content: center; }
.w-obj { width: 15%; justify-content: center; }
.w-av { width: 20%; justify-content: center; }
.gantt-splitter { position: absolute; left: var(--left-width, 780px); top: 0; bottom: 0; width: 6px; background: transparent; cursor: col-resize; z-index: 50; transform: translateX(-50%); }
.gantt-splitter:hover, .gantt-splitter.is-resizing { background: rgba(148, 163, 184, 0.5); }
.info-text { font-size: 12px; color: #64748b; font-style: italic; }
</style>
