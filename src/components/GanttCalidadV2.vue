<template>
  <div class="gantt-v2-container">
    <!-- Main Layout with Grid -->
    <div
      ref="gridRef"
      class="grid-v2"
      style="flex-grow: 1; position: relative;"
      :style="{ '--left-width': leftWidth + 'px' }"
    >
      <!-- HEADER -->
      <div class="header-row">
        <div class="left-header">
          <div class="cell w-task">
            Tarea / Descripción
          </div>
          <div class="cell w-av">
            % Avance
          </div>
        </div>
        <div
          ref="headerViewport"
          class="right-header-viewport"
        >
          <div
            class="timeline-header"
            :style="{ width: totalTimelineWidth + 'px' }"
          >
            <div 
              v-for="d in days" 
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
          <div
            class="grid-background"
            :style="gridBgStyle"
          />
          
          <GanttRowCalidadV2
            v-for="(row, idx) in taskTree"
            :key="row.id_tarea"
            :row="row"
            :index="idx"
            :level="0"
            :px-per-day="dayW"
            :row-height="32"
            :left-width="leftWidth"
            :days="days"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import GanttRowCalidadV2 from './GanttRowCalidadV2.vue'

const props = defineProps({
  tareas: { type: Array, required: true },
  fechaDesde: String,
  fechaHasta: String
})

const actualTareas = computed(() => {
  if (Array.isArray(props.tareas)) return props.tareas
  return props.tareas?.datos || []
})

const taskTree = computed(() => {
  const map = {}; const roots = []; const data = actualTareas.value
  data.forEach(t => { map[t.id_tarea] = { ...t, children: [] } })
  data.forEach(t => { if (t.id_tarea_padre && map[t.id_tarea_padre]) map[t.id_tarea_padre].children.push(map[t.id_tarea]); else roots.push(map[t.id_tarea]) })
  return roots
})

const zoomHoriz = ref(56)
const zoomLevel = computed(() => {
  if (zoomHoriz.value < 4) return 'months'
  if (zoomHoriz.value < 14) return 'weeks'
  return 'days'
})

const dayW = computed(() => zoomHoriz.value)
const ymd = (d) => d.toISOString().split('T')[0]

const dateLimits = computed(() => {
  const pMin = props.fechaDesde ? new Date(props.fechaDesde.replace(' ', 'T')) : null
  const pMax = props.fechaHasta ? new Date(props.fechaHasta.replace(' ', 'T')) : null
  if (pMin && pMax) return { min: pMin, max: pMax }
  const dates = actualTareas.value.flatMap(t => [t.fecha_ini_plan, t.fecha_fin_plan]).filter(Boolean).map(d => new Date(d))
  if (!dates.length) return { min: new Date(), max: new Date(Date.now() + 7 * 86400000) }
  return { min: new Date(Math.min(...dates)), max: new Date(Math.max(...dates)) }
})

const days = computed(() => {
  const out = []
  let curr = new Date(dateLimits.value.min)
  while (curr <= dateLimits.value.max) {
    out.push({
      key: ymd(curr),
      labelShort: `${curr.getDate()}/${curr.getMonth() + 1}`,
      weekLabel: curr.getDay() === 1 ? `S${getWeekNumber(curr)}` : '',
      isFirstOfMonth: curr.getDate() === 1,
      isWeekend: [0, 6].includes(curr.getDay()),
      date: new Date(curr)
    })
    curr.setDate(curr.getDate() + 1)
  }
  return out
})

const totalTimelineWidth = computed(() => days.value.length * dayW.value)

function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function formatMonthLabel(date, dayWidth) {
  const widthPx = 30 * dayWidth
  if (widthPx < 50) return date.toLocaleString('es', { month: 'narrow' })
  return date.toLocaleString('es', { month: 'short' }) + ' ' + date.getFullYear().toString().slice(2)
}

const gridRef = ref(null); const bodyScroller = ref(null); const headerViewport = ref(null)
let resizeObserver = null

function calcMinZoom() {
  nextTick(() => {
    if (headerViewport.value && days.value.length > 0) {
      const w = headerViewport.value.clientWidth
      zoomHoriz.value = Math.max(0.1, (w - 2) / days.value.length)
    }
  })
}

watch(() => [props.fechaDesde, props.fechaHasta, days.value.length], () => calcMinZoom())

function syncScroll() { if (headerViewport.value && bodyScroller.value) headerViewport.value.scrollLeft = bodyScroller.value.scrollLeft }

onMounted(() => {
  if (headerViewport.value) { resizeObserver = new ResizeObserver(() => calcMinZoom()); resizeObserver.observe(headerViewport.value) }
  calcMinZoom()
})
onUnmounted(() => { if (resizeObserver) resizeObserver.disconnect() })

const leftWidth = ref(450)
const gridBgStyle = computed(() => ({
  backgroundImage: `repeating-linear-gradient(to right, transparent 0, transparent ${dayW.value - 1}px, #e2e8f0 ${dayW.value - 1}px, #e2e8f0 ${dayW.value}px)`,
  width: totalTimelineWidth.value + 'px'
}))
</script>

<style scoped>
.gantt-v2-container { height: 100%; display: flex; flex-direction: column; background: white; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; }
.grid-v2 { flex-grow: 1; display: flex; flex-direction: column; overflow: hidden; }
.header-row { display: flex; height: 38px; background: #ffffff; border-bottom: 1px solid #e2e8f0; flex-shrink: 0; position: relative; z-index: 15; }
.left-header {
  display: flex; width: var(--left-width, 450px); max-width: var(--left-width, 450px); flex-shrink: 0; background: #f8fafc; z-index: 10; border-right: 1px solid #e2e8f0; position: sticky; left: 0;
}
.right-header-viewport { flex-grow: 1; overflow: hidden; }
.timeline-header { display: flex; height: 100%; }
.day-label { display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 600; color: #64748b; border-right: 1px solid #eef2f7; position: relative; }
.day-label.wknd { background: #f8fafc; }
.week-text { position: absolute; left: 4px; font-size: 9px; font-weight: 700; color: #334155; }
.month-text { position: absolute; left: 4px; font-size: 10px; font-weight: 700; color: #0f172a; }
.body-scroller { flex-grow: 1; overflow: auto; position: relative; }
.gantt-rows-container { position: relative; z-index: 2; min-width: max-content; }
.grid-background { position: absolute; top: 0; left: var(--left-width, 450px); bottom: 0; pointer-events: none; z-index: 1; }
.cell { padding: 0 10px; display: flex; align-items: center; font-weight: 700; color: #64748b; font-size: 10px; text-transform: uppercase; border-right: 1px solid #e2e8f0; overflow: hidden; }
.w-task { width: 70%; padding-left: 12px; }
.w-av { width: 30%; justify-content: center; }
</style>
