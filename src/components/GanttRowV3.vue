<template>
  <div
    class="gantt-row-v3"
    :class="{ 
      'expanded': isExpanded, 
      'is-parent': hasChildren, 
      'level-0': level === 0,
      'level-1': level === 1,
      'is-activity': level > 1
    }"
    :style="{ height: rowHeight + 'px' }"
    @click="emit('row-click', row)"
  >
    <v-tooltip
      activator="parent"
      location="top"
      open-delay="500"
    >
      <div class="text-caption">
        <div class="font-weight-bold">
          {{ row.nombre_tarea }}
        </div>
        <div>Inicio: {{ formatDateLong(row.fecha_ini_plan) }}</div>
        <div>Termino: {{ formatDateLong(row.fecha_fin_plan) }}</div>
      </div>
    </v-tooltip>
    <!-- Columna Izquierda (Sticky) -->
    <div
      class="left-cells"
      :style="{ width: leftWidth + 'px', minWidth: leftWidth + 'px' }"
    >
      <!-- 1. EDT -->
      <div
        class="cell"
        :style="{ width: columnWidths.edt + 'px' }"
      >
        <span class="edt-code">{{ row.codigo_edt }}</span>
      </div>

      <!-- 2. Partidas / Actividades (N-Niveles con indentación) -->
      <div
        class="cell"
        :style="{ width: columnWidths.descripcion + 'px', paddingLeft: (level * 20 + 8) + 'px' }"
      >
        <v-btn
          v-if="hasChildren"
          icon
          variant="text"
          size="x-small"
          class="mr-1 expand-btn"
          @mousedown.stop
          @click.stop="toggleExpand"
        >
          <v-icon size="16">
            {{ isExpanded ? 'mdi-chevron-down' : 'mdi-chevron-right' }}
          </v-icon>
        </v-btn>
        <span
          v-else
          class="ml-7"
        />
        <span
          class="text-truncate"
          :class="{ 'font-weight-bold': level <= 1 }"
          :title="row.nombre_tarea"
        >
          {{ row.nombre_tarea }}
        </span>
      </div>

      <!-- 4. Unidad -->
      <div
        class="cell text-center"
        :style="{ width: columnWidths.unidad + 'px' }"
      >
        {{ row.unidad }}
      </div>

      <!-- 5. Cantidad Plan -->
      <div
        class="cell text-right font-weight-bold text-indigo-darken-2"
        :style="{ width: columnWidths.plan + 'px' }"
      >
        {{ formatNumber(row.total_plan) }}
      </div>

      <!-- 6. Cantidad Real -->
      <div
        class="cell text-right font-weight-bold text-emerald-darken-2"
        :style="{ width: columnWidths.real + 'px' }"
      >
        {{ formatNumber(row.total_real) }}
      </div>

      <!-- 7. Recurso(s) -->
      <div class="cell flex-grow-1">
        <div
          class="d-flex flex-wrap ga-1 overflow-hidden"
          style="max-height: 24px;"
        >
          <template v-if="equipos.length > 0">
            <v-tooltip
              v-for="(eq, i) in equipos"
              :key="i"
              location="bottom"
            >
              <template #activator="{ props }">
                <v-chip
                  v-bind="props"
                  size="x-small"
                  :color="eq.id_equipo_proyecto ? 'indigo' : 'red-darken-2'"
                  variant="flat"
                  class="resource-chip px-1"
                  style="font-weight: 700; cursor: pointer;"
                  @click.stop="$emit('resource-click', row, eq)"
                >
                  <v-icon
                    start
                    size="10"
                    color="white"
                  >
                    {{ eq.id_equipo_proyecto ? 'mdi-account-group' : 'mdi-alert-circle' }}
                  </v-icon>
                  {{ eq.nombre_excel }}
                </v-chip>
              </template>
              <span>{{ eq.nombre_excel }} {{ eq.id_equipo_proyecto ? '(Asignado)' : '(Pendiente)' }}</span>
            </v-tooltip>
          </template>
        </div>
      </div>
    </div>

    <!-- Columna Derecha (Timeline) -->
    <div class="right-cells-viewport">
      <div class="timeline-row">
        <!-- Puntos Diarios para Actividades (Hojas) -->
        <template v-if="!hasChildren">
          <div 
            v-for="dot in dailyDots" 
            :key="dot.key"
            class="dot-cell shadow-sm"
            :class="dot.statusClass"
            :style="dotStyle(dot)"
          >
            <v-tooltip
              activator="parent"
              location="top"
              density="compact"
            >
              <div class="text-caption">
                {{ dot.tooltip }}
              </div>
            </v-tooltip>
            <div
              class="dot-fill"
              :style="{ width: (dot.prog * 100) + '%' }"
            />
          </div>
        </template>

        <!-- Barra de Resumen para Padres -->
        <div 
          v-else-if="row.fecha_ini_plan && row.fecha_fin_plan"
          class="task-bar-wrapper"
          :style="barStyle"
        >
          <div class="task-bar-summary" />
        </div>
      </div>
    </div>
  </div>

  <!-- Hijos (N-Niveles) -->
  <template v-if="isExpanded && hasChildren">
    <GanttRowV3
      v-for="(child, idx) in row.children"
      :key="child.id_tarea"
      :row="child"
      :index="idx"
      :level="level + 1"
      :px-per-day="pxPerDay"
      :row-height="rowHeight"
      :left-width="leftWidth"
      :column-widths="columnWidths"
      :days="days"
      @edit="$emit('edit', $event)"
      @resource-click="(row, res) => $emit('resource-click', row, res)"
      @row-click="$emit('row-click', $event)"
    />
  </template>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  row: Object,
  index: Number,
  level: { type: Number, default: 0 },
  pxPerDay: Number,
  rowHeight: Number,
  leftWidth: Number,
  columnWidths: Object,
  days: Array
})

const emit = defineEmits(['edit', 'resource-click', 'row-click'])

const isExpanded = ref(props.level < 1)
const hasChildren = computed(() => props.row.children && props.row.children.length > 0)

const equipos = computed(() => {
  if (Array.isArray(props.row.equipos_json)) return props.row.equipos_json
  try { return typeof props.row.equipos_json === 'string' ? JSON.parse(props.row.equipos_json) : [] }
  catch { return [] }
})

const dailyDots = computed(() => {
  if (hasChildren.value) return []
  
  const dots = []
  const todayKey = new Date().toISOString().slice(0, 10)
  
  // Extraer datos diarios del json_data
  const dailyData = {}
  const realData = {}
  
  if (Array.isArray(props.row.json_data)) {
    props.row.json_data.forEach(it => {
      const k = String(it.fecha || '').substring(0, 10)
      if (k) {
        dailyData[k] = Number(it.value || 0)
        realData[k] = Number(it.real || 0)
      }
    })
  }

  props.days.forEach((day, index) => {
    const valPlan = dailyData[day.key] || 0
    const valReal = realData[day.key] || 0
    
    if (valPlan === 0 && valReal === 0) return
    
    let statusClass = 'dot-plan'
    let prog = 0
    const isPastOrToday = day.key <= todayKey

    if (valReal <= 0 && valPlan > 0) {
      prog = 0
      statusClass = isPastOrToday ? 'dot-zero' : 'dot-plan'
    } else if (valPlan <= 0) {
      prog = valReal > 0 ? 1 : 0
      statusClass = 'dot-ok'
    } else if (valReal < valPlan) {
      prog = valReal / valPlan
      statusClass = isPastOrToday ? 'dot-warn' : 'dot-ok'
    } else {
      prog = 1
      statusClass = 'dot-ok'
    }

    dots.push({
      key: day.key,
      index,
      valPlan,
      valReal,
      statusClass,
      prog,
      tooltip: `Fecha: ${day.key} | Plan: ${valPlan} | Real: ${valReal}`
    })
  })
  
  return dots
})

const dotStyle = (dot) => {
  return {
    left: (dot.index * props.pxPerDay) + 'px',
    width: props.pxPerDay + 'px',
    '--prog': dot.prog
  }
}

function toggleExpand() {
  isExpanded.value = !isExpanded.value
}

function formatNumber(val) {
  if (val === null || val === undefined) return '0'
  return Number(val).toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 })
}

const barStyle = computed(() => {
  if (!props.row.fecha_ini_plan || !props.row.fecha_fin_plan) return { display: 'none' }
  
  const startStr = String(props.row.fecha_ini_plan).substring(0, 10)
  const endStr = String(props.row.fecha_fin_plan).substring(0, 10)

  const startIdx = props.days.findIndex(d => d.key === startStr)
  const endIdx = props.days.findIndex(d => d.key === endStr)
  
  if (startIdx === -1 && endIdx === -1) return { display: 'none' }
  
  const sIdx = startIdx === -1 ? 0 : startIdx
  const eIdx = endIdx === -1 ? props.days.length - 1 : endIdx

  const left = sIdx * props.pxPerDay
  const width = (eIdx - sIdx + 1) * props.pxPerDay
  
  return {
    left: left + 'px',
    width: width + 'px',
    top: '30%',
    height: '40%'
  }
})

function formatDateLong(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
}
</script>

<style scoped>
.gantt-row-v3 { display: flex; border-bottom: 1px solid #edf2f7; background: white; }
.gantt-row-v3:hover { background: #fdfdfd; }
.left-cells { display: flex; position: sticky; left: 0; background: inherit; z-index: 5; border-right: 2px solid #cbd5e1; }
.cell { display: flex; align-items: center; padding: 0 8px; font-size: 11px; color: #475569; border-right: 1px solid #e2e8f0; overflow: hidden; white-space: nowrap; flex-shrink: 0; }

.edt-code { font-weight: 800; color: #1e293b; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 10px; border: 1px solid #e2e8f0; }

.resource-chip { height: 18px; font-size: 9px; font-weight: 600; text-transform: uppercase; }

.right-cells-viewport { flex-grow: 1; position: relative; overflow: hidden; }
.timeline-row { position: relative; height: 100%; display: flex; align-items: center; }

.task-bar-wrapper { position: absolute; z-index: 2; cursor: pointer; }
.task-bar-summary { width: 100%; height: 100%; background: #1e293b; border-radius: 4px; opacity: 0.85; border: 1px solid #0f172a; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }

.dot-cell {
  position: absolute;
  top: 15%;
  height: 70%;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  z-index: 3;
}
.dot-fill { height: 100%; transition: width 0.3s ease; border-radius: 2px; }

/* Status Colors */
.dot-plan { background: #e0f2fe; }
.dot-plan .dot-fill { background: #0ea5e9; } /* Azul plan */

.dot-ok { background: #ecfdf5; }
.dot-ok .dot-fill { background: #10b981; } /* Verde ok */

.dot-warn { background: #fffbeb; }
.dot-warn .dot-fill { background: #f59e0b; } /* Amarillo warn */

.dot-zero { background: #fef2f2; border-color: #fecaca; }
.dot-zero .dot-fill { background: #ef4444; width: 4px !important; } /* Rojo alerta */

/* Level Styles */
.level-0 { background: #f8fafc; }
.level-0 .cell { color: #0f172a; font-weight: 800; font-size: 12px; }
.level-1 { background: #ffffff; }
.level-1 .cell { font-weight: 600; }
.is-activity { color: #64748b; }

.expand-btn { transition: transform 0.2s; }
</style>
