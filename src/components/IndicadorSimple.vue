<template>
  <div>
    <h3 class="mb-2">
      {{ config?.titulo }}
    </h3>

    <v-row
      dense
      class="items-stretch"
    >
      <!-- 50%: Gráfico (SIN CAMBIOS) -->
      <v-col
        cols="12"
        md="6"
      >
        <div
          ref="chartEl"
          class="chart-box"
        />
      </v-col>

      <!-- 50%: Tabla (ACTUALIZADA) -->
      <!-- Tabla -->
      <v-col
        cols="12"
        md="6"
      >
        <v-data-table
          :headers="headers"
          :items="tableRows"
          density="compact"
          :items-per-page="-1"
          hide-default-footer
          class="table-box"
        >
          <template #item="{ item }">
            <tr>
              <td
                v-for="h in headers"
                :key="h.key"
              >
                <!-- 🔗 Columna Link: icono PDF clickeable -->
                <template v-if="h._tipo === 'link'">
                  <a
                    v-if="pdfHref(item)"
                    :href="pdfHref(item)"
                    target="_blank"
                    rel="noopener"
                    title="Abrir PDF"
                    style="display:inline-flex;align-items:center;justify-content:center"
                  >
                    <v-icon size="26">mdi-file-pdf-box</v-icon>
                  </a>
                  <span v-else>—</span>
                </template>

                <!-- 🗓️/🔢 resto de tipos -->
                <template v-else>
                  {{ formatCell(item[h.key], h._tipo) }}
                </template>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import apiAxios from '@/services/api';
import Highcharts from 'highcharts'

const props = defineProps({
  config: { type: Object, required: true },
  fechaDesde: { type: String, default: '' },
  fechaHasta: { type: String, default: '' }
})

// 👇 Vuelve a cargar datos cuando cambian las fechas o la URI del indicador
watch(
  () => [props.fechaDesde, props.fechaHasta, props.config?.uri, props.config?.uriTabla],
  () => {
    fetchData()
  }
)

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})

/* --- chart (SIN CAMBIOS) --- */
const chartEl = ref(null)
let chartInstance = null
const rows = ref([])            // <- datos SOLO del chart

/* --- tabla (NUEVO) --- */
const tableRows = ref([])       // <- datos SOLO de la tabla
const headers   = ref([])

/* helpers tabla */
const pdfHref = (row) => {
  const id = row?.id_doc || ''
  return id
    ? `/archivo/terracon/${id}`
    : ''
}

function formatDateDDMMYYYY (val) {
  const d = new Date(val)
  if (!isNaN(d)) {
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    return `${dd}-${mm}-${yyyy}`
  }
  return val ?? ''
}
function formatCell (val, tipo) {
  if (tipo === 'fecha')   return formatDateDDMMYYYY(val)
  if (tipo === 'percent') {
    const n = Number(val)
    return Number.isFinite(n) ? `${n}%` : (val ?? '')
  }
  if (tipo === 'number')  return Number(val ?? 0).toLocaleString()
  return val ?? ''
}

onMounted(() => {
  buildHeaders()
  fetchData()
})

function buildHeaders () {
  headers.value = (props.config?.columnas || []).map(c => ({
    title: c.header, key: c.nombre, _tipo: c.tipo, align: 'start', sortable: true
  }))
}

/* --- carga de datos --- */
// 👇 helper: devuelve el primer arreglo de objetos que encuentre
function extractArray(payload) {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== 'object') return []

  // patrones comunes
  const candidates = [
    payload.rows,
    payload.datos,
    payload.data,        // a veces viene como array directo
    payload.list,
    payload.items,
    payload.result,
    payload.resultado?.rows,
    payload.resultado?.datos,
  ].filter(Boolean)

  for (const c of candidates) {
    if (Array.isArray(c)) return c
  }

  // búsqueda profunda (por si viene anidado en otro nivel)
  const firstArray = deepFindFirstArray(payload)
  return Array.isArray(firstArray) ? firstArray : []
}

function deepFindFirstArray(obj, depth = 0, maxDepth = 4) {
  if (!obj || typeof obj !== 'object' || depth > maxDepth) return null
  for (const k of Object.keys(obj)) {
    const v = obj[k]
    if (Array.isArray(v)) return v
    if (v && typeof v === 'object') {
      const found = deepFindFirstArray(v, depth + 1, maxDepth)
      if (found) return found
    }
  }
  return null
}

async function fetchData () {
  const base = '/servicio'
  const urlChart = base + (props.config?.uri || '')
  const urlTable = base + (props.config?.uriTabla || props.config?.uri || '')
  const params = {
    fecha_desde: props.fechaDesde || '',
    fecha_hasta: props.fechaHasta || ''
  }

  try {
    const [rChart, rTable] = await Promise.all([
      apiAxios.get(urlChart, { params }),   // 👈 apiAxios en vez de axios
      apiAxios.get(urlTable, { params })    // 👈 apiAxios en vez de axios
    ])

    // Chart: {datos:[...]} o array o {rows:[...]}
    rows.value = extractArray(rChart?.data)

    // Tabla: {rows:[...]}, {datos:[...]}, {data:[...]}, etc.
    const tArr = extractArray(rTable?.data)
    tableRows.value = tArr

    renderChart()
  } catch (e) {
    console.error('Error cargando datos:', e)
    rows.value = []
    tableRows.value = []
    renderChart()
  }
}


/* --- chart (mismo código que tenías) --- */
function renderChart () {
  if (!chartEl.value) return
  if (chartInstance) chartInstance.destroy()

  const g = props.config?.grafico || {}
  const catKey = g.categoria || 'serie'

  const categories = rows.value.map(r => {
    const v = r[catKey]
    const d = new Date(v)
    return isNaN(d) ? (v ?? '') : formatDateDDMMYYYY(v)
  })

  // 🔸 Forzar ítems de leyenda
  const series = (g.series || []).map(s => ({
    name: s.name || s.campo,
    type: s.type || 'line',
    data: rows.value.map(r => Number(r[s.campo]) || 0),
    showInLegend: true,           // 👈 fuerza a que aparezca en la leyenda
    visible: s.visible !== false
  }))

  chartInstance = Highcharts.chart(chartEl.value, {
    title: { text: props.config?.titulo || '' },
    chart: { height: 320, spacingBottom: 36 },
    xAxis: { categories },
    yAxis: { title: { text: props.config?.unidad || null } },

    // 👇 Leyenda abajo
    legend: {
      enabled: true,              // 👈 forzar leyenda
      layout: 'horizontal',
      align: 'center',
      verticalAlign: 'bottom',
      floating: false,
      symbolRadius: 6,
      symbolWidth: 12,
      symbolHeight: 12,
      symbolPadding: 8,
      itemDistance: 24,
      itemMarginTop: 6,
      itemMarginBottom: 6,
      padding: 8,
      backgroundColor: 'transparent',
      itemStyle: { fontSize: '12px', fontWeight: '400' }
    },

    plotOptions: {
      series: { marker: { enabled: true, radius: 3 } }
    },

    credits: { enabled: false },
    tooltip: { shared: true },
    series
  })
}
</script>

<style scoped>
.chart-box { width: 100%; height: 320px; }
.table-box { height: 320px; }
</style>
