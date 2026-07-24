<template>
  <div
    ref="container"
    class="modern-curva-s"
  >
    <div
      v-if="!hasData"
      class="empty-state d-flex align-center justify-center text-slate-400"
    >
      <v-icon start>
        mdi-chart-line-variant
      </v-icon>
      Sincronizando datos...
    </div>
    
    <svg
      v-else
      :viewBox="`0 0 ${width} ${height}`"
      preserveAspectRatio="none"
      class="chart-svg"
    >
      <!-- Gradients -->
      <defs>
        <linearGradient
          id="gradPlan"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="0%"
            stop-color="#0ea5e9"
            stop-opacity="0.2"
          />
          <stop
            offset="100%"
            stop-color="#0ea5e9"
            stop-opacity="0"
          />
        </linearGradient>
        <linearGradient
          id="gradReal"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="0%"
            stop-color="#10b981"
            stop-opacity="0.3"
          />
          <stop
            offset="100%"
            stop-color="#10b981"
            stop-opacity="0"
          />
        </linearGradient>
      </defs>

      <!-- Grid Lines -->
      <g class="grid-lines">
        <!-- Horizontal grid lines -->
        <line
          v-for="i in 5"
          :key="`grid-y-${i}`" 
          x1="0"
          :y1="(chartBottomY / 5) * i"
          :x2="width"
          :y2="(chartBottomY / 5) * i"
          stroke="#f1f5f9"
          stroke-width="1"
        />
        <!-- Vertical grid lines for non-Friday ticks -->
        <line
          v-for="i in xTickIndexes"
          v-show="!fridaysList.includes(i)"
          :key="`grid-x-${i}`"
          :x1="getX(i)"
          y1="0"
          :x2="getX(i)"
          :y2="chartBottomY"
          stroke="#f1f5f9"
          stroke-width="1"
          stroke-dasharray="2 2"
        />
      </g>

      <!-- Vertical Cutoff Lines (Viernes de Corte) -->
      <g class="cutoff-lines">
        <g
          v-for="idx in fridaysList"
          :key="`cutoff-${idx}`"
        >
          <line
            :x1="getX(idx)"
            y1="0"
            :x2="getX(idx)"
            :y2="chartBottomY"
            stroke="#f43f5e"
            stroke-width="1.2"
            stroke-dasharray="4 4"
            opacity="0.8"
          />
          <text
            :x="getX(idx)"
            y="14"
            text-anchor="middle"
            font-size="9"
            fill="#f43f5e"
            font-weight="bold"
          >
            Corte
          </text>
        </g>
      </g>

      <!-- Area Real -->
      <path
        :d="areaPathReal"
        fill="url(#gradReal)"
      />
      <!-- Area Plan -->
      <path
        :d="areaPathPlan"
        fill="url(#gradPlan)"
      />

      <!-- Line Plan (Dashed / Thin) -->
      <path
        :d="linePathPlan"
        fill="none"
        stroke="#0ea5e9"
        stroke-width="2"
        stroke-dasharray="4 2"
        opacity="0.6"
      />
      
      <!-- Line Real (Thick / Solid) -->
      <path
        :d="linePathReal"
        fill="none"
        stroke="#10b981"
        stroke-width="4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <!-- Interactive Overlay for tooltips -->
      <rect
        v-for="(cat, i) in categories"
        :key="`hit-${i}`"
        :x="i === 0 ? 0 : ((getX(i - 1) + getX(i)) / 2)" 
        y="0" 
        :width="i === categories.length - 1
          ? width - (categories.length === 1 ? 0 : ((getX(i - 1) + getX(i)) / 2))
          : ((getX(i) + getX(i + 1)) / 2) - (i === 0 ? 0 : ((getX(i - 1) + getX(i)) / 2))"
        :height="chartBottomY" 
        fill="transparent"
        @mouseenter="showTooltip($event, i)"
        @mouseleave="hideTooltip"
      />

      <!-- Axis X: Tiempo -->
      <g class="axis-x">
        <line
          x1="0"
          :y1="chartBottomY"
          :x2="width"
          :y2="chartBottomY"
          stroke="#cbd5e1"
          stroke-width="1.2"
        />
        <g
          v-for="i in xTickIndexes"
          :key="`tick-${i}`"
        >
          <line
            :x1="getX(i)"
            :y1="chartBottomY"
            :x2="getX(i)"
            :y2="chartBottomY + 5"
            stroke="#94a3b8"
            stroke-width="1"
          />
          <text
            :x="getX(i)"
            :y="chartBottomY + 18"
            text-anchor="middle"
            font-size="11"
            fill="#64748b"
          >
            {{ categories[i] }}
          </text>
        </g>
        <text
          :x="width / 2"
          :y="height - 2"
          text-anchor="middle"
          font-size="11"
          fill="#475569"
          font-weight="700"
        >
          Tiempo
        </text>
      </g>
    </svg>

    <!-- Floating Tooltip -->
    <div
      v-if="tooltip.visible" 
      class="custom-tooltip"
      :style="{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }"
    >
      <div class="tooltip-header">
        {{ tooltip.category }}
      </div>
      <div class="tooltip-body">
        <div class="d-flex align-center mb-1">
          <div class="dot plan mr-2" />
          <span>Plan: <b>{{ tooltip.plan }}</b></span>
        </div>
        <div class="d-flex align-center">
          <div class="dot real mr-2" />
          <span>Real: <b>{{ tooltip.real }}</b></span>
        </div>
        <div class="mt-1 text-caption">
          Delta: <b>{{ tooltip.diff }}</b>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div
      v-if="hasData"
      class="chart-legend d-flex justify-center mt-4 ga-4"
    >
      <div class="legend-item plan">
        <span class="line" /> Planificado
      </div>
      <div class="legend-item real">
        <span class="line" /> Ejecutado
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

defineProps({
  heightPx: { type: Number, default: 350 }
})

const width = 1000
const height = 400
const axisBottom = 34

const categories = ref([])
const planData = ref([])
const realData = ref([])
const fridaysList = ref([])
const ticksList = ref([])
const container = ref(null)

const hasData = computed(() => categories.value.length > 0)
const maxValue = computed(() => Math.max(...planData.value, ...realData.value, 100))
const chartBottomY = computed(() => height - axisBottom)

const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  category: '',
  plan: 0,
  real: 0,
  diff: 0
})

const getX = (index) => (width / Math.max(1, categories.value.length - 1)) * index
const getY = (value) => {
  return chartBottomY.value - (value / maxValue.value) * chartBottomY.value
}

const xTickIndexes = computed(() => {
  if (ticksList.value && ticksList.value.length > 0) {
    return ticksList.value
  }
  const n = categories.value.length
  if (!n) return []
  const maxTicks = 8
  if (n <= maxTicks) return Array.from({ length: n }, (_, i) => i)
  const step = Math.ceil((n - 1) / (maxTicks - 1))
  const idx = []
  for (let i = 0; i < n; i += step) idx.push(i)
  if (idx[idx.length - 1] !== n - 1) idx.push(n - 1)
  return idx
})

const linePathPlan = computed(() => generateSmoothPath(planData.value))
const linePathReal = computed(() => generateSmoothPath(realData.value))

const areaPathPlan = computed(() => {
  if (!planData.value.length) return ''
  const path = generateSmoothPath(planData.value)
  return `${path} L ${getX(planData.value.length - 1)} ${chartBottomY.value} L 0 ${chartBottomY.value} Z`
})

const areaPathReal = computed(() => {
  if (!realData.value.length) return ''
  const path = generateSmoothPath(realData.value)
  return `${path} L ${getX(realData.value.length - 1)} ${chartBottomY.value} L 0 ${chartBottomY.value} Z`
})

function generateSmoothPath(data) {
  if (!data.length) return ''
  let d = `M 0 ${getY(data[0])}`

  for (let i = 1; i < data.length; i++) {
    d += ` L ${getX(i)} ${getY(data[i])}`
  }
  return d
}

function showTooltip(event, index) {
  const rect = container.value.getBoundingClientRect()
  const plan = Number(planData.value[index] || 0)
  const real = Number(realData.value[index] || 0)
  const rawX = event.clientX - rect.left
  tooltip.value = {
    visible: true,
    x: Math.min(Math.max(rawX, 70), rect.width - 70),
    y: event.clientY - rect.top - 80,
    category: categories.value[index],
    plan: plan.toFixed(1),
    real: real.toFixed(1),
    diff: (real - plan).toFixed(1)
  }
}

function hideTooltip() {
  tooltip.value.visible = false
}

function setSeries(payload) {
  const { categories: cats = [], plan = [], real = [], fridays = [], ticks = [] } = payload || {}
  categories.value = cats
  planData.value = plan
  realData.value = real
  fridaysList.value = fridays
  ticksList.value = ticks
}

defineExpose({ setSeries })

onMounted(() => {
  // Initial reflow if needed
})
</script>

<style scoped>
.modern-curva-s {
  position: relative;
  width: 100%;
  background: white;
  border-radius: 16px;
  overflow: visible;
}

.chart-svg {
  width: 100%;
  height: 300px;
  overflow: visible;
}

.empty-state {
  height: 300px;
  border: 2px dashed #f1f5f9;
  border-radius: 12px;
  font-size: 0.9rem;
}

.custom-tooltip {
  position: absolute;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(8px);
  color: white;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 0.8rem;
  pointer-events: none;
  z-index: 100;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
  transform: translateX(-50%);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.tooltip-header {
  font-weight: 800;
  margin-bottom: 6px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.dot.plan { background: #0ea5e9; }
.dot.real { background: #10b981; }

.chart-legend {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-item .line {
  width: 24px;
  height: 3px;
  border-radius: 4px;
}

.legend-item.plan .line { 
  background: #0ea5e9; 
  border-top: 2px dashed #0c4a6e;
}
.legend-item.real .line { background: #10b981; }
</style>
