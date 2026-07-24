<template>
  <div class="chart-card">
    <h3 class="chart-title">
      Capacitaciones
    </h3>
    <div
      ref="chartEl"
      class="chart-container"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import Highcharts from 'highcharts'
//import Exporting from 'highcharts/modules/exporting'

// (opcional) activar menú de exportación
//Exporting(Highcharts)

const chartEl = ref(null)
let chart = null

// Categorías y datos (puedes traerlos de tu API y actualizar `data`)
const categories = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
const data = ref([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])

// Configuración del chart
const options = {
  chart: {
    type: 'column',
    backgroundColor: 'transparent',
    height: 320
  },
  title: { text: null },
  credits: { enabled: false },
  legend: { enabled: false },
  xAxis: {
    categories,
    lineColor: '#e6e6e6',
    tickWidth: 0
  },
  yAxis: {
    min: 0,
    max: 20,            // para verse como la imagen
    tickInterval: 5,    // 0,5,10,15,20
    title: { text: null },
    gridLineColor: '#eee'
  },
  tooltip: {
    pointFormat: '<b>{point.y}</b> capacitaciones'
  },
  plotOptions: {
    column: {
      borderWidth: 0,
      pointPadding: 0.15,
      groupPadding: 0.08,
      borderRadius: 4,  // esquinas redondeadas
      dataLabels: { enabled: false }
    }
  },
  series: [{
    name: 'Capacitaciones',
    data: data.value,
    color: '#2f7ed8'
  }]
}

function buildChart () {
  if (chart) chart.destroy()
  chart = Highcharts.chart(chartEl.value, options)
}

// Mantener responsivo
function onResize () {
  chart?.reflow()
}

onMounted(() => {
  buildChart()
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  chart?.destroy()
})

// Si `data` cambia (por ejemplo, tras una llamada a tu API), actualizamos el gráfico
watch(data, (vals) => {
  if (chart) chart.series[0].setData(vals, true)
})
</script>

<style scoped>
.chart-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,.08);
  padding: 12px;
}
.chart-title {
  margin: 0 0 8px;
  color: #2b2b2b;
  font-weight: 700;
}
.chart-container {
  width: 100%;
  min-height: 260px;
}
</style>
