<template>
  <div class="gantt-v3-container">
    <div class="controls pa-2 d-flex align-center gap-4 border-b bg-slate-50">
      <v-btn
        color="blue-grey-darken-3"
        variant="tonal"
        class="text-none font-weight-bold"
        @click="$emit('refresh')"
      >
        <v-icon class="mr-1">
          mdi-refresh
        </v-icon> Refrescar V3
      </v-btn>
      
      <div
        class="zoom-sliders d-flex align-center gap-4 ml-4"
        style="width: 300px; max-width: 100%;"
      >
        <v-icon
          size="small"
          color="grey-darken-1"
        >
          mdi-arrow-expand-horizontal
        </v-icon>
        <v-slider
          v-model="zoomHoriz"
          :min="10"
          :max="150"
          :step="1"
          hide-details
          density="compact"
          color="teal-darken-1"
          class="flex-grow-1"
        />
      </div>

      <v-spacer />
      
      <div class="info-text d-flex align-center gap-3">
        <v-chip
          size="x-small"
          variant="outlined"
          color="blue-grey"
        >
          EDT Hierarchy
        </v-chip>
        <div class="text-caption font-weight-bold text-slate-600">
          Tareas: {{ actualTareas.length }} | Estructura N-Niveles
        </div>
      </div>
    </div>

    <div
      class="d-flex"
      style="flex-grow: 1; overflow: hidden; position: relative;"
    >
      <!-- Vertical Zoom Slider -->
      <div class="y-axis-slider">
        <v-slider
          v-model="zoomVert"
          :min="25"
          :max="80"
          :step="2"
          direction="vertical"
          hide-details
          color="teal-darken-1"
        />
        <v-icon
          size="small"
          class="mt-4"
          color="grey-darken-1"
        >
          mdi-arrow-expand-vertical
        </v-icon>
      </div>

      <div
        ref="gridRef"
        class="grid-v3"
        style="flex-grow: 1; position: relative;"
        :style="{ '--left-width': leftWidth + 'px' }"
      >
        <div class="header-row bg-slate-200">
          <div class="left-header">
            <div
              class="cell"
              :style="{ width: columnWidths.edt + 'px' }"
            >
              EDT <div
                class="resize-handle resize-handle-edt"
                @mousedown.stop="startColResize('edt', $event)"
              />
            </div>
            <div
              class="cell"
              :style="{ width: columnWidths.descripcion + 'px' }"
            >
              PARTIDAS / ACTIVIDADES <div
                class="resize-handle resize-handle-descripcion"
                @mousedown.stop="startColResize('descripcion', $event)"
              />
            </div>
            <div
              class="cell"
              :style="{ width: columnWidths.unidad + 'px' }"
            >
              UD <div
                class="resize-handle resize-handle-unidad"
                @mousedown.stop="startColResize('unidad', $event)"
              />
            </div>
            <div
              class="cell"
              :style="{ width: columnWidths.plan + 'px' }"
            >
              CANT. PLAN <div
                class="resize-handle resize-handle-plan"
                @mousedown.stop="startColResize('plan', $event)"
              />
            </div>
            <div
              class="cell"
              :style="{ width: columnWidths.real + 'px' }"
            >
              CANT. REAL <div
                class="resize-handle resize-handle-real"
                @mousedown.stop="startColResize('real', $event)"
              />
            </div>
          </div>
          <div
            ref="headerViewport"
            class="right-header-viewport"
          >
            <!-- ... (resto del timeline igual) -->
            <div
              class="timeline-header"
              :style="{ width: totalTimelineWidth + 'px' }"
            >
              <div
                v-for="d in days"
                :key="d.key"
                class="day-label"
                :class="{ 
                  'wknd': d.isWeekend, 
                  'first-of-month': d.isFirstOfMonth,
                  'hovered-day-col': d.key === hoveredDayKey
                }"
                :style="{ width: dayW + 'px' }"
              >
                <div class="day-text">
                  {{ d.labelShort }}
                </div>
                <div
                  v-if="d.isFirstOfMonth"
                  class="month-label font-weight-black text-blue-darken-4"
                >
                  {{ d.monthLabel }}
                </div>
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
            
            <div
              v-if="hoveredDayKey"
              class="column-highlight"
              :style="columnHighlightStyle"
            />
            
            <GanttRowV3
              v-for="(row, idx) in taskTree"
              :key="row.id_tarea"
              :row="row"
              :index="idx"
              :px-per-day="dayW"
              :row-height="zoomVert"
              :left-width="leftWidth"
              :column-widths="columnWidths"
              :days="days"
              @edit="openEdit"
              @resource-click="onResourceClick"
              @row-click="onTaskRowClick"
              @day-hover="hoveredDayKey = $event"
              @day-click="onDayClick"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <!-- ... (resto del modal igual) -->
    <v-dialog
      v-model="editOpen"
      max-width="900"
    >
      <v-card
        v-if="editRow"
        class="rounded-lg overflow-hidden"
      >
        <v-toolbar
          color="indigo-darken-4"
          density="compact"
        >
          <v-toolbar-title class="text-white text-subtitle-1">
            Detalle: {{ editRow.codigo_edt }} - {{ editRow.nombre_tarea }}
          </v-toolbar-title>
          <v-spacer />
          <v-btn
            icon
            color="white"
            variant="text"
            @click="editOpen = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text class="pa-4 bg-slate-50">
          <div class="d-flex ga-4 mb-4">
            <v-chip
              size="small"
              color="blue"
              variant="tonal"
              label
            >
              EDT: {{ editRow.codigo_edt }}
            </v-chip>
            <v-chip
              size="small"
              color="teal"
              variant="tonal"
              label
            >
              Unidad: {{ editRow.unidad }}
            </v-chip>
            <v-chip
              size="small"
              color="indigo"
              variant="tonal"
              label
            >
              Plan: {{ editRow.total_plan }}
            </v-chip>
            <v-chip
              size="small"
              color="emerald"
              variant="tonal"
              label
            >
              Real: {{ editRow.total_real }}
            </v-chip>
          </div>
           
          <h4 class="text-subtitle-2 mb-3 text-slate-700">
            Equipos Asignados:
          </h4>
          <div class="d-flex ga-2 mb-4 flex-wrap">
            <v-chip
              v-for="(eq, i) in editRow.equipos_json"
              :key="i"
              size="small"
              :color="eq.id_equipo_proyecto ? 'indigo' : 'orange'"
              variant="elevated"
            >
              <v-icon
                start
                size="14"
              >
                {{ eq.id_equipo_proyecto ? 'mdi-account-group' : 'mdi-account-question' }}
              </v-icon>
              {{ eq.nombre_excel }}
            </v-chip>
          </div>

          <v-divider class="mb-4" />
          <p class="text-caption text-slate-400 italic font-italic">
            * En V3, la edicion de avance se realizara asociando el ID del equipo oficial al ID temporal del Excel.
          </p>
        </v-card-text>
      </v-card>
    </v-dialog>


    <!-- Dialogo de Equipos del Proyecto -->
    <v-dialog
      v-model="teamsOpen"
      max-width="500"
    >
      <v-card class="rounded-lg">
        <v-toolbar
          color="indigo-darken-3"
          density="compact"
        >
          <v-toolbar-title class="text-white text-subtitle-2">
            Equipos Oficiales del Proyecto
          </v-toolbar-title>
          <v-spacer />
          <v-btn
            icon
            color="white"
            variant="text"
            @click="teamsOpen = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text class="pa-4 bg-slate-50">
          <p class="text-caption mb-4 text-slate-600">
            Vincular recurso <b>{{ selectedResourceForLink?.nombre_excel }}</b> con equipo oficial:
          </p>
          
          <div
            v-if="!equiposProyecto || equiposProyecto.length === 0"
            class="pa-4 text-center"
          >
            <v-icon
              size="48"
              color="grey-lighten-1"
              class="mb-2"
            >
              mdi-account-group-outline
            </v-icon>
            <p class="text-caption text-grey-darken-1">
              No se encontraron equipos oficiales para este proyecto.
            </p>
          </div>

          <v-list
            v-else
            class="bg-transparent"
            lines="two"
          >
            <v-list-item
              v-for="eq in equiposProyecto"
              :key="eq.id_equipo_proyecto"
              class="border rounded-md mb-2 bg-white"
              link
              @click="linkTeam(eq)"
            >
              <template #prepend>
                <v-avatar
                  color="indigo-lighten-5"
                  size="32"
                >
                  <v-icon
                    color="indigo"
                    size="18"
                  >
                    mdi-account-group
                  </v-icon>
                </v-avatar>
              </template>
              <v-list-item-title class="font-weight-bold text-slate-800">
                {{ eq.nombre_equipo }}
              </v-list-item-title>
              <v-list-item-subtitle class="text-caption">
                ID: {{ eq.id_equipo_proyecto }} | Interno
              </v-list-item-subtitle>
              <template #append>
                <div
                  class="d-flex align-center ga-2"
                  @click.stop
                >
                  <MantenedorIntegrantesEquipo 
                    :id-equipo="eq.id_equipo_proyecto"
                    :nombre-equipo="eq.nombre_equipo"
                    :descripcion-equipo="eq.descripcion_equipo"
                    :usuarios="usuarios"
                  />
                  <v-icon color="slate-300">
                    mdi-chevron-right
                  </v-icon>
                </div>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-snackbar
      v-model="snack"
      :timeout="2000"
      color="indigo"
    >
      {{ snackMsg }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import GanttRowV3 from './GanttRowV3.vue'
import MantenedorIntegrantesEquipo from './MantenedorIntegrantesEquipo.vue'

const props = defineProps({
  tareas: { type: Array, required: true },
  equiposProyecto: { type: Array, default: () => [] },
  usuarios: { type: Array, default: () => [] },
  fechaDesde: String,
  fechaHasta: String
})

const emit = defineEmits(['refresh', 'task-click'])

const actualTareas = computed(() => Array.isArray(props.tareas) ? props.tareas : [])

/* Tree Logic N-Levels */
const taskTree = computed(() => {
  const map = {}
  const roots = []
  
  // Clonar y preparar mapa, ordenando por codigo_edt
  const sorted = [...actualTareas.value].sort((a,b) => (a.codigo_edt || '').localeCompare(b.codigo_edt || ''))
  
  sorted.forEach(t => {
    map[t.id_tarea] = {
      ...t,
      children: [],
      dailyPlan: parseJsonDaily(t.json_data, 'value'),
    }
  })
  
  // Construir árbol
  sorted.forEach(t => {
    if (t.id_tarea_padre && map[t.id_tarea_padre]) {
      map[t.id_tarea_padre].children.push(map[t.id_tarea])
    } else {
      roots.push(map[t.id_tarea])
    }
  })
  
  return roots
})

function parseJsonDaily(json, field) {
  if (!json) return {}
  const data = Array.isArray(json) ? json : []
  const out = {}
  data.forEach(it => {
    if (it.fecha) out[it.fecha] = Number(it[field] || 0)
  })
  return out
}

/* Timeline Logic */
const zoomHoriz = ref(40)
const zoomVert = ref(38)
const columnWidths = ref({
  edt: 60,
  descripcion: 400,
  unidad: 50,
  plan: 80,
  real: 80
})
const leftWidth = computed(() => {
  return Object.values(columnWidths.value).reduce((a, b) => a + b, 0)
})
const dayW = computed(() => zoomHoriz.value)

const hoveredDayKey = ref(null)

const columnHighlightStyle = computed(() => {
  if (!hoveredDayKey.value) return { display: 'none' }
  const idx = days.value.findIndex(d => d.key === hoveredDayKey.value)
  if (idx === -1) return { display: 'none' }
  return {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: (leftWidth.value + idx * dayW.value) + 'px',
    width: dayW.value + 'px',
    backgroundColor: 'rgba(0, 150, 136, 0.12)',
    borderLeft: '1px dashed rgba(0, 150, 136, 0.5)',
    borderRight: '1px dashed rgba(0, 150, 136, 0.5)',
    pointerEvents: 'none',
    zIndex: 4
  }
})

const dateLimits = computed(() => {
  const dates = actualTareas.value.flatMap(t => [t.fecha_ini_plan, t.fecha_fin_plan]).filter(Boolean).map(d => new Date(d))
  
  const min3Weeks = new Date()
  min3Weeks.setDate(min3Weeks.getDate() - 14)
  
  const max3Weeks = new Date()
  max3Weeks.setDate(max3Weeks.getDate() + 7)
  
  if (!dates.length) {
    return { min: min3Weeks, max: max3Weeks }
  }
  
  const minTask = new Date(Math.min(...dates))
  minTask.setDate(minTask.getDate() - 3)
  
  const maxTask = new Date(Math.max(...dates))
  maxTask.setDate(maxTask.getDate() + 10)
  
  const min = minTask < min3Weeks ? minTask : min3Weeks
  const max = maxTask > max3Weeks ? maxTask : max3Weeks
  
  return { min, max }
})

const days = computed(() => {
  const out = []
  let curr = new Date(dateLimits.value.min)
  while (curr <= dateLimits.value.max) {
    const ymd = curr.toISOString().split('T')[0]
    out.push({
      key: ymd,
      labelShort: curr.getDate(),
      monthLabel: curr.toLocaleString('es', { month: 'long' }).toUpperCase() + ' ' + curr.getFullYear(),
      isFirstOfMonth: curr.getDate() === 1,
      isWeekend: [0, 6].includes(curr.getDay()),
      date: new Date(curr)
    })
    curr.setDate(curr.getDate() + 1)
  }
  return out
})

const totalTimelineWidth = computed(() => days.value.length * dayW.value)

const gridBgStyle = computed(() => ({
  backgroundImage: `repeating-linear-gradient(to right, transparent 0, transparent ${dayW.value - 1}px, #e2e8f0 100%)`,
  width: totalTimelineWidth.value + 'px',
  left: leftWidth.value + 'px'
}))

/* Scroll & UI Sync */
const headerViewport = ref(null)
const bodyScroller = ref(null)
function syncScroll() {
  if (headerViewport.value && bodyScroller.value) {
    headerViewport.value.scrollLeft = bodyScroller.value.scrollLeft
  }
}

/* Resizable Logic */
const resizingCol = ref(null)
function startColResize(col, e) {
  resizingCol.value = col
  document.addEventListener('mousemove', handleColResize)
  document.addEventListener('mouseup', stopColResize)
  document.body.style.cursor = 'col-resize'
}
function handleColResize(e) {
  if (!resizingCol.value) return
  e.preventDefault()
  
  // Encontrar el elemento actual para calcular el desplazamiento
  const handle = document.querySelector(`.resize-handle-${resizingCol.value}`)
  if (!handle) return
  
  const rect = handle.parentElement.getBoundingClientRect()
  const newWidth = e.clientX - rect.left
  
  if (newWidth > 30) {
    columnWidths.value[resizingCol.value] = newWidth
  }
}
function stopColResize() {
  resizingCol.value = null
  document.removeEventListener('mousemove', handleColResize)
  document.removeEventListener('mouseup', stopColResize)
  document.body.style.cursor = 'default'
}

/* Interaction */
const editOpen = ref(false)
const editRow = ref(null)
const teamsOpen = ref(false)
const selectedResourceForLink = ref(null)
const snack = ref(false)
const snackMsg = ref('')

function openEdit(row) { editRow.value = row; editOpen.value = true; }

function onResourceClick(row, resource) {
  console.log('🚀 Click en recurso recibido en GanttasticV3:', { row, resource })
  snackMsg.value = `Recurso: ${resource.nombre_excel}`
  snack.value = true
  
  editRow.value = row
  selectedResourceForLink.value = resource
  teamsOpen.value = true
}

function onTaskRowClick(row) {
  emit('task-click', row)
}

function onDayClick(dayKey, row) {
  emit('task-click', row, dayKey)
}

function linkTeam(officialTeam) {
  console.log('Vincular recurso:', selectedResourceForLink.value.nombre_excel, '->', officialTeam.nombre_equipo)
  // Aquí iría la lógica de persistencia
  teamsOpen.value = false
  alert(`Vincular: ${selectedResourceForLink.value.nombre_excel} con el equipo oficial ${officialTeam.nombre_equipo}`)
}

const gridRef = ref(null)

const initZoomAndScroll = () => {
  nextTick(() => {
    if (!gridRef.value || !bodyScroller.value) return
    const availableWidth = gridRef.value.clientWidth - leftWidth.value
    if (availableWidth > 100) {
      const calculatedZoom = Math.floor(availableWidth / 21)
      zoomHoriz.value = Math.max(10, Math.min(150, calculatedZoom))
    }
    nextTick(() => {
      const targetDate = new Date()
      targetDate.setDate(targetDate.getDate() - 14)
      const targetDateYmd = targetDate.toISOString().split('T')[0]
      const dayIdx = days.value.findIndex(d => d.key === targetDateYmd)
      if (dayIdx !== -1 && bodyScroller.value) {
        bodyScroller.value.scrollLeft = dayIdx * dayW.value
      }
    })
  })
}

onMounted(() => {
  initZoomAndScroll()
})

watch(() => props.tareas, () => {
  initZoomAndScroll()
}, { deep: true })
</script>

<style scoped>
.gantt-v3-container { height: 100%; display: flex; flex-direction: column; background: #ffffff; overflow: hidden; font-family: 'Inter', sans-serif; }
.grid-v3 { flex-grow: 1; display: flex; flex-direction: column; overflow: hidden; }
.header-row { display: flex; height: 50px; border-bottom: 2px solid #cbd5e1; flex-shrink: 0; position: relative; z-index: 15; }
.left-header { display: flex; width: var(--left-width, 910px); flex-shrink: 0; background: #f1f5f9; border-right: 2px solid #cbd5e1; position: sticky; left: 0; z-index: 20; }
.right-header-viewport { flex-grow: 1; overflow: hidden; }
.timeline-header { display: flex; height: 100%; }
.day-label { display: flex; flex-direction: column; align-items: center; justify-content: flex-end; padding-bottom: 6px; border-right: 1px solid #e2e8f0; position: relative; }
.day-label.wknd { background: rgba(203, 213, 225, 0.2); color: #94a3b8; }
.day-label.hovered-day-col { background-color: rgba(0, 150, 136, 0.18) !important; transition: background-color 0.1s ease; }
.day-text { font-size: 10px; font-weight: 800; }
.month-label { position: absolute; top: 4px; left: 6px; font-size: 10px; font-weight: 800; color: #1e3a8a; white-space: nowrap; letter-spacing: 0.5px; }

.y-axis-slider { width: 34px; background: #f8fafc; border-right: 1px solid #cbd5e1; display: flex; flex-direction: column; align-items: center; padding: 20px 0; }
.body-scroller { flex-grow: 1; overflow: auto; position: relative; scroll-behavior: smooth; }
.gantt-rows-container { position: relative; z-index: 2; }
.grid-background { position: absolute; top: 0; bottom: 0; pointer-events: none; z-index: 1; }

.cell { padding: 0 8px; display: flex; align-items: center; font-weight: 800; color: #334155; font-size: 10px; text-transform: uppercase; border-right: 1px solid #cbd5e1; }

/* Match row styles */
.w-edt { width: 60px; justify-content: center; }
.w-partida { width: 220px; }
.w-actividad { width: 220px; }
.w-unidad { width: 50px; justify-content: center; }
.w-val { width: 80px; justify-content: center; }
.w-recursos { width: 200px; border-right: none; }

.resize-handle {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  cursor: col-resize;
  z-index: 100;
  background: #cbd5e1;
  opacity: 0;
  transition: opacity 0.2s;
}
.cell:hover .resize-handle {
  opacity: 1;
}
.resize-handle:hover {
  background: #38bdf8;
  opacity: 1 !important;
}
</style>
