<template>
  <v-card
    class="modern-kpi-card overflow-hidden"
    :style="{ height: `${heightPx}px` }"
    variant="flat"
  >
    <div class="pa-4 d-flex flex-column h-100">
      <!-- Header Area -->
      <div class="d-flex align-center justify-space-between mb-2">
        <div class="d-flex align-center">
          <div class="indicator-accent mr-3" />
          <span class="text-subtitle-2 font-weight-bold text-slate-700 uppercase tracking-wider">{{ title }}</span>
        </div>
        
        <v-select
          v-if="keys.length > 1"
          v-model="selectedKey"
          :items="keys"
          density="compact"
          variant="outlined"
          rounded="lg"
          hide-details
          class="modern-select"
          style="max-width: 140px"
          @update:model-value="applySelected"
        >
          <template #selection="{ item }">
            <span class="text-caption font-weight-medium text-slate-500">{{ item.title }}</span>
          </template>
        </v-select>
      </div>

      <!-- Main Number (Optional, if we want to show the last value or a summary) -->
      <div class="d-flex align-baseline mt-1 mb-auto">
        <span class="text-h4 font-weight-black text-slate-900">{{ currentVal }}</span>
        <span
          v-if="unit"
          class="ml-1 text-caption font-weight-bold text-slate-400 uppercase"
        >{{ unit }}</span>
      </div>

      <!-- Chart Area -->
      <div class="chart-container-modern mt-2">
        <div
          ref="chartEl"
          class="chart-instance"
        />
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick, computed } from 'vue'
import Highcharts from 'highcharts'

const props = defineProps({
  title: { type: String, default: 'Horas Hombre' },
  heightPx: { type: Number, default: 220 },
  dataMap: { type: Object, required: true },
  unit: { type: String, default: '' },
  color: { type: String, default: '#10b981' } // emerald-500 default
})

const chartEl = ref(null)
let chart = null
const keys = ref([])
const selectedKey = ref(null)
const currentVal = ref(0)

const applySelected = () => {
  if (!chart) return
  const key = selectedKey.value
  const pack = props.dataMap?.[key]
  
  chart.xAxis[0].setCategories(pack?.categories || [], false)
  while (chart.series.length) chart.series[0].remove(false)
  
  if (pack?.series?.length) {
    const mainSeries = pack.series[0]
    chart.addSeries({
      ...mainSeries,
      color: props.color,
      fillColor: {
        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
        stops: [
          [0, props.color],
          [1, 'transparent']
        ]
      }
    }, false)
    
    // Update current value to the last point
    const data = mainSeries.data || []
    currentVal.value = data.length ? data[data.length - 1].toLocaleString() : 0
  }
  
  chart.redraw()
}

const initKeys = (map) => {
  const k = Object.keys(map || {})
  keys.value = k
  if (!k.includes(selectedKey.value)) selectedKey.value = k[0] ?? null
}

const initChart = () => {
  if (chart) return
  chart = Highcharts.chart(chartEl.value, {
    chart: {
      type: 'areaspline',
      backgroundColor: 'transparent',
      margin: [0, 0, 0, 0],
      spacing: [0, 0, 0, 0],
      height: 80
    },
    title: { text: null },
    credits: { enabled: false },
    xAxis: {
      visible: false,
      categories: []
    },
    yAxis: {
      visible: false,
      min: 0
    },
    legend: { enabled: false },
    tooltip: {
      shared: true,
      outside: true,
      shadow: false,
      borderWidth: 0,
      backgroundColor: '#1e293b',
      style: { color: '#f8fafc' },
      headerFormat: '',
      pointFormat: '<b>{point.y}</b>'
    },
    plotOptions: {
      areaspline: {
        fillOpacity: 0.1,
        lineWidth: 3,
        marker: {
          enabled: false,
          states: { hover: { enabled: true, radius: 4 } }
        },
        threshold: null
      }
    },
    series: []
  })
}

watch(() => props.dataMap, (val) => {
  initKeys(val)
  nextTick(applySelected)
}, { immediate: true, deep: true })

onMounted(async () => {
  await nextTick()
  initChart()
  applySelected()
  window.addEventListener('resize', () => chart?.reflow())
})

onBeforeUnmount(() => {
  if (chart) chart.destroy()
})
</script>

<style scoped>
.modern-kpi-card {
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}
.modern-kpi-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important;
}
.indicator-accent {
  width: 4px;
  height: 16px;
  background: v-bind(color);
  border-radius: 2px;
}
.chart-container-modern {
  height: 80px;
  width: 100%;
}
.chart-instance {
  width: 100%;
  height: 100%;
}
.modern-select :deep(.v-field__outline) {
  --v-field-border-opacity: 0.1;
}
.modern-select :deep(.v-field__input) {
  padding-top: 4px !important;
  padding-bottom: 4px !important;
  min-height: 32px !important;
}
.tracking-wider { letter-spacing: 0.05em; }
.uppercase { text-transform: uppercase; }
.text-slate-700 { color: #334155; }
.text-slate-900 { color: #0f172a; }
.text-slate-400 { color: #94a3b8; }
.text-slate-500 { color: #64748b; }
</style>
