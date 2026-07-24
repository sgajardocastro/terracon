<template>
  <v-card
    class="mini-kpi-card"
    :style="{ height: `${heightPx + 15 }px` }"
    elevation="8"
  >
    <!-- Header fijo -->
    <v-card-title class="py-2 px-3 d-flex align-center justify-space-between header-bar">
      <span class="title">{{ title }}</span>

      <v-select
        v-if="keys.length"
        v-model="selectedKey"
        :items="keys"
        density="compact"
        variant="solo"
        rounded="xl"
        hide-details
        class="pill-select"
        style="max-width: 160px"
        @update:model-value="applySelected"
      />
    </v-card-title>

    <!-- Área del chart ocupa el resto -->
    <div
      class="chart-wrap"
      style="padding-bottom: 15px !important;"
    >
      <div
        ref="chartEl"
        class="chart"
      />
    </div>
  </v-card>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import Highcharts from 'highcharts'
import Exporting from 'highcharts/modules/exporting'

const props = defineProps({
  title: { type: String, default: 'Horas Hombre' },
  heightPx: { type: Number, default: 200 },
  // { 'Cuadrilla 1': { categories: [], series: [{type:'area', data:[]}] }, ... }
  dataMap: { type: Object, required: true }
})

defineExpose({ setData })

const HEADER_PX = 48 // alto real del header

const chartEl = ref(null)
let chart = null

const keys = ref([])
const selectedKey = ref(null)

watch(
  () => props.dataMap,
  (val) => {
    initKeys(val)
    // re-render con la clave actual
    nextTick(applySelected)
  },
  { immediate: true, deep: true }
)

onMounted(async () => {
  await nextTick()
  initChart()
  applySelected()

  const onResize = () => chart?.reflow?.()
  window.addEventListener('resize', onResize)
  onBeforeUnmount(() => window.removeEventListener('resize', onResize))
})

function initKeys(map) {
  const k = Object.keys(map || {})
  keys.value = k
  if (!k.includes(selectedKey.value)) selectedKey.value = k[0] ?? null
}

function initChart() {
  if (chart) return
  const chartHeight = Math.max(100, props.heightPx - HEADER_PX)
  chart = Highcharts.chart(chartEl.value, {
    chart: {
      type: 'area',
      spacing: [4, 8, 4, 8],
      animation: true,
      height: chartHeight
    },
    title: { text: null },
    credits: { enabled: false },
    exporting: { enabled: false },
    xAxis: {
      categories: [],
      tickLength: 0,
      lineWidth: 0,
      labels: { style: { fontSize: '10px' } }
    },
    yAxis: {
      title: { text: null },
      gridLineWidth: 0,
      labels: { enabled: true, style: { fontSize: '10px' } }
    },
    legend: { enabled: false },
    tooltip: { shared: true },
    plotOptions: {
      area: { marker: { enabled: false }, fillOpacity: 0.15, lineWidth: 2 },
      series: { animation: { duration: 300 } }
    },
    series: []
  })
}

function applySelected() {
  if (!chart) return
  const key = selectedKey.value
  const pack = props.dataMap?.[key]
  // limpia/actualiza
  chart.xAxis[0].setCategories(pack?.categories || [], false)
  while (chart.series.length) chart.series[0].remove(false)
  ;(pack?.series || []).forEach(s => chart.addSeries(s, false))
  chart.redraw()
}

function setData(newMap) {
  const keepKey = selectedKey.value
  // @ts-ignore: simple replace
  props.dataMap = newMap
  initKeys(newMap)
  if (keepKey && newMap[keepKey]) selectedKey.value = keepKey
  applySelected()
}
</script>

<style scoped>
.mini-kpi-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.header-bar {
  min-height: 48px;
}
.title {
  font-weight: 600;
  font-size: 14px;
  color: rgba(0,0,0,.8);
}
.pill-select :deep(.v-field) {
  border-radius: 9999px !important;
  box-shadow: 0 1px 3px rgba(0,0,0,.12);
  min-height: 34px !important;
}
.chart-wrap {
  flex: 1 1 auto;
  display: flex;
}
.chart {
  flex: 1 1 auto;
}
</style>
