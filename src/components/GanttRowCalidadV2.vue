<template>
  <div
    class="gantt-row-container"
    :class="{ 'is-expanded': isExpanded }"
  >
    <div 
      class="gantt-row" 
      :class="[row.kind, { 'even': index % 2 === 1 }]"
      :style="{ height: rowHeight + 'px', '--rh': rowHeight + 'px', '--left-width': (leftWidth || 450) + 'px' }"
    >
      <div class="left-cells">
        <div
          class="cell w-task"
          :style="{ paddingLeft: (level * 20 + 12) + 'px' }"
        >
          <button
            v-if="canExpand"
            class="chev"
            :disabled="isLoadingChildren"
            @click="toggleExpand"
          >
            <v-progress-circular
              v-if="isLoadingChildren"
              indeterminate
              size="12"
              width="2"
              color="primary"
            />
            <span
              v-else
              :class="['arrow', { open: isExpanded }]"
            >▶</span>
          </button>
          <span
            :class="{ 'task-title': true, 'task-leaf': !canExpand }"
            :title="row.nombre_tarea"
          >
            {{ row.nombre_tarea }}
          </span>
        </div>
        <div class="cell w-av">
          <div
            class="pct-bar"
            :class="{ 'is-real': !canExpand }"
          >
            <div
              class="pct-bar__fill"
              :style="{ width: clamp01(row.cantidad_avance_pct) + '%' }"
            />
            <span class="pct-bar__text">{{ formatPct1(row.cantidad_avance_pct) }}%</span>
          </div>
        </div>
      </div>

      <div class="right-timeline">
        <div
          v-if="canExpand && row.fecha_ini_plan && row.fecha_fin_plan"
          class="summary-bar"
          :style="barStyle(row.fecha_ini_plan, row.fecha_fin_plan)"
        />
        <div
          v-else-if="!canExpand && row.fecha_ini_plan && row.fecha_fin_plan"
          class="leaf-bar-container"
          :style="barStyle(row.fecha_ini_plan, row.fecha_fin_plan)"
        >
          <div class="bar-range-bg" />
          <div
            v-for="dot in dailyDots"
            :key="dot.key"
            class="dot-bar"
            :class="dot.statusClass"
            :style="dotStyle(dot)"
          >
            <span
              v-if="dayW > 15"
              class="dot-val"
            >{{ formatNumShort(dot.value) }}</span>
          </div>
        </div>
      </div>
    </div>

    <template v-if="isExpanded && hasChildren">
      <GanttRowCalidadV2
        v-for="(child, idx) in row.children"
        :key="child.id_tarea"
        :row="child"
        :index="idx"
        :level="level + 1"
        :px-per-day="pxPerDay"
        :row-height="rowHeight"
        :left-width="leftWidth"
        :days="days"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  row: Object,
  index: Number,
  level: { type: Number, default: 0 },
  pxPerDay: Number,
  days: Array,
  rowHeight: { type: Number, default: 28 },
  leftWidth: Number
})

const isExpanded = ref(props.level === 0)
const isLoadingChildren = ref(false)
const hasChildren = computed(() => props.row.children && props.row.children.length > 0)
const canExpand = computed(() => {
  if (hasChildren.value) return true
  if (props.row.dailyPlan && Object.keys(props.row.dailyPlan).length > 0) return false
  if (props.row.dailyReal && Object.keys(props.row.dailyReal).length > 0) return false
  return props.row.nivel < 5
})

const toggleExpand = () => {
  if (isExpanded.value) { isExpanded.value = false; return; }
  isExpanded.value = true
}

const formatNumShort = (v) => (v == null || v === '' ? '' : new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 }).format(v))
const formatPct1 = (v) => Number(v || 0).toFixed(1)
const clamp01 = (v) => Math.max(0, Math.min(100, Number(v || 0)))

const dayW = computed(() => props.pxPerDay)
const getDayIndex = (dateStr) => {
  if (!dateStr) return -1
  const d = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr
  return props.days.findIndex(day => day.key === d)
}

const barStyle = (start, end) => {
  const i0 = getDayIndex(start); const i1 = getDayIndex(end)
  if (i0 === -1 || i1 === -1) return { display: 'none' }
  const widthRaw = (i1 - i0 + 1) * dayW.value
  const offset = dayW.value < 12 ? 1 : 6
  const left = i0 * dayW.value + offset
  const width = Math.max(widthRaw - (offset * 2), 4)
  return { left: left + 'px', width: width + 'px' }
}

const dailyDots = computed(() => {
  if (canExpand.value) return []
  const dots = []
  const i0 = getDayIndex(props.row.fecha_ini_plan); const i1 = getDayIndex(props.row.fecha_fin_plan)
  if (i0 === -1) return []
  const dailyData = props.row.dailyPlan || {}; const realData = props.row.dailyReal || {}
  for (let i = i0; i <= i1; i++) {
    const day = props.days[i]
    if (!day) continue
    const valPlan = dailyData[day.key] || 0; const valReal = realData[day.key] || 0
    if (valPlan === 0 && valReal === 0) continue
    let statusClass = 'bar-plan'
    let prog = 0
    if (valReal <= 0 && valPlan > 0) { prog = 0; statusClass += ' prog-zero' }
    else if (valPlan <= 0) { prog = valReal > 0 ? 1 : 0; statusClass += ' prog-ok' }
    else if (valReal < valPlan) { prog = Math.max(0, Math.min(1, valReal / valPlan)); statusClass += ' prog-warn' }
    else { prog = Math.max(0, Math.min(1, valReal / valPlan)); statusClass += ' prog-ok' }
    dots.push({ key: day.key, index: i, value: valPlan, statusClass, prog })
  }
  return dots
})

const dotStyle = (dot) => {
  const i0 = getDayIndex(props.row.fecha_ini_plan); const innerIdx = dot.index - i0
  let gap = 10; let minW = 12
  if (dayW.value < 15) { gap = 2; minW = Math.max(4, dayW.value - gap); }
  const width = Math.max(dayW.value - gap, minW)
  const left = innerIdx * dayW.value + Math.max(0, (dayW.value - width) / 2)
  return { left: left + 'px', width: width + 'px', '--prog': dot.prog }
}
</script>

<style scoped>
.gantt-row { display: flex; border-bottom: 1px solid #eef2f7; }
.gantt-row:hover { background-color: #f8fafc; }
.left-cells {
  display: flex; width: var(--left-width, 450px); max-width: var(--left-width, 450px); flex-shrink: 0; background: white; position: sticky; left: 0; z-index: 10; border-right: 1px solid #eef2f7;
}
.cell { padding: 0 10px; display: flex; align-items: center; font-size: 11px; border-right: 1px solid #eef2f7; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.w-task { width: 70%; padding-left: 12px; }
.w-av { width: 30%; justify-content: center; }
.task-title { font-weight: 600; color: #1e293b; }
.task-leaf { font-weight: 500; color: #475569; }
.chev { border: none; background: transparent; cursor: pointer; padding: 0 4px; }
.arrow { display: inline-block; transition: transform .2s; font-size: 10px; }
.arrow.open { transform: rotate(90deg); }
.right-timeline { position: relative; flex-grow: 1; }
.summary-bar { position: absolute; top: 25%; height: 50%; background: #1e293b; border-radius: 4px; z-index: 1; }
.leaf-bar-container { position: absolute; top: 0; bottom: 0; }
.bar-range-bg { position: absolute; inset: 2px 0; background: rgba(56, 189, 248, 0.1); border-radius: 4px; }
.dot-bar { position: absolute; top: 15%; height: 70%; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 9px; z-index: 2; overflow: hidden; }
.dot-bar::after { content: ''; position: absolute; inset: 0; width: calc(var(--prog, 0) * 100%); border-radius: inherit; }
.bar-plan { background: #8ecae6; }
.prog-ok::after { background: rgba(42, 157, 143, 0.9); }
.prog-warn::after { background: rgba(255, 209, 102, 0.8); }
.prog-zero::after { width: 3px !important; background: rgba(230, 57, 70, 0.8); }
.dot-val { position: relative; z-index: 3; }
.pct-bar { width: 100%; height: 60%; background: #e2e8f0; border-radius: 10px; position: relative; overflow: hidden; }
.pct-bar__fill { height: 100%; background: #0ea5e9; }
.pct-bar.is-real .pct-bar__fill { background: #10b981; }
.pct-bar__text { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; color: #1e293b; z-index: 2; }
.even { background: #f8fafc; }
.even .left_cells { background: #f8fafc; }
</style>
