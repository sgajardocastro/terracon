<template>
  <div class="pa-0 d-flex flex-column ga-4">
    <v-card
      class="surface-card pa-4"
      variant="outlined"
      style="border-color: #e2e8f0; border-radius: 12px; background-color: white;"
    >
      <div class="d-flex align-center flex-wrap ga-4">
        <div class="d-flex align-center mr-4">
          <div class="icon-box mr-3">
            <v-icon
              color="primary"
              icon="mdi-history"
            />
          </div>
          <div>
            <div class="text-subtitle-1 font-weight-bold text-primary-dark">
              HISTORICO
            </div>
            <div class="text-caption text-medium-emphasis">
              Registro historico de documentos
            </div>
          </div>
        </div>

        <v-divider
          vertical
          class="mx-2 hidden-sm-and-down"
        />

        <div style="width: 320px;">
          <label class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary">Buscar</label>
          <v-text-field
            v-model="searchText"
            density="compact"
            variant="outlined"
            hide-details
            placeholder="Buscar en cualquier campo..."
            prepend-inner-icon="mdi-magnify"
            bg-color="grey-lighten-5"
            class="sakai-input"
            clearable
          />
        </div>
      </div>
    </v-card>

    <v-card
      class="sakai-table-card"
      variant="outlined"
      elevation="0"
    >
      <v-card-text class="pa-0">
        <div
          ref="topScrollRef"
          class="x-scroll x-scroll-top"
          @scroll="onScroll('top')"
        >
          <div :style="{ width: scrollContentWidth, height: '1px' }" />
        </div>

        <div class="table-scroll-wrap">
          <v-table
            ref="tableRef"
            class="tabla-historico text-caption"
            density="comfortable"
            hover
            fixed-header
            height="70vh"
          >
            <thead>
              <tr>
                <th
                  v-for="col in columns"
                  :key="col"
                  class="text-left th-header"
                >
                  {{ toHeader(col) }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td
                  :colspan="Math.max(columns.length, 1)"
                  class="text-center py-8"
                >
                  <v-progress-circular
                    indeterminate
                    color="primary"
                  />
                </td>
              </tr>
              <tr v-else-if="errorMsg">
                <td
                  :colspan="Math.max(columns.length, 1)"
                  class="text-center py-8 text-error"
                >
                  {{ errorMsg }}
                </td>
              </tr>
              <tr
                v-for="(item, idx) in pagedItems"
                v-else
                :key="item.id_historico || item.id || idx"
                class="row-hover"
              >
                <td
                  v-for="col in columns"
                  :key="`${idx}-${col}`"
                >
                  {{ formatCell(item[col], col) }}
                </td>
              </tr>
              <tr v-if="!loading && !errorMsg && !pagedItems.length">
                <td
                  :colspan="Math.max(columns.length, 1)"
                  class="text-center text-grey py-8"
                >
                  <div class="d-flex flex-column align-center">
                    <v-icon
                      size="40"
                      color="grey-lighten-2"
                      class="mb-2"
                    >
                      mdi-database-off
                    </v-icon>
                    <div>No hay registros disponibles</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>
      </v-card-text>

      <v-divider />
      <div
        ref="bottomScrollRef"
        class="x-scroll x-scroll-bottom"
        @scroll="onScroll('bottom')"
      >
        <div :style="{ width: scrollContentWidth, height: '1px' }" />
      </div>
      <div class="d-flex align-center justify-space-between px-4 py-3 bg-grey-lighten-5 flex-wrap ga-2">
        <div class="text-caption text-medium-emphasis">
          Mostrando {{ pageStart }}-{{ pageEnd }} de {{ filteredItems.length }} registros
        </div>
        <v-pagination
          v-if="pageCount > 1"
          v-model="page"
          :length="pageCount"
          density="comfortable"
          total-visible="7"
        />
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import api from '@/services/api'

const ITEMS_PER_PAGE = 100

defineProps({
  fechaDesde: { type: String, default: '' },
  fechaHasta: { type: String, default: '' }
})

const loading = ref(false)
const errorMsg = ref('')
const items = ref([])
const searchText = ref('')
const page = ref(1)
const topScrollRef = ref(null)
const tableRef = ref(null)
const bottomScrollRef = ref(null)
const scrollContentWidth = ref('0px')
const middleScrollEl = ref(null)
let resizeObserver = null
let isSyncing = false

const columns = computed(() => {
  const first = items.value?.[0]
  if (!first || typeof first !== 'object') return []
  return Object.keys(first)
})

const filteredItems = computed(() => {
  const s = String(searchText.value || '').trim().toLowerCase()
  if (!s) return items.value

  return items.value.filter((row) =>
    columns.value.some((key) => String(formatCell(row[key])).toLowerCase().includes(s))
  )
})

const pageCount = computed(() => Math.max(1, Math.ceil(filteredItems.value.length / ITEMS_PER_PAGE)))

const pagedItems = computed(() => {
  const start = (page.value - 1) * ITEMS_PER_PAGE
  return filteredItems.value.slice(start, start + ITEMS_PER_PAGE)
})

const pageStart = computed(() => {
  if (!filteredItems.value.length) return 0
  return (page.value - 1) * ITEMS_PER_PAGE + 1
})

const pageEnd = computed(() => {
  if (!filteredItems.value.length) return 0
  return Math.min(page.value * ITEMS_PER_PAGE, filteredItems.value.length)
})

watch(searchText, () => { page.value = 1 })
watch(filteredItems, () => {
  if (page.value > pageCount.value) page.value = pageCount.value
})
watch([pagedItems, columns], async () => {
  await nextTick()
  recalcScrollWidth()
})

function toHeader(key) {
  return String(key || '')
    .replaceAll('_', ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase()
}

function isDateColumn(key) {
  const k = String(key || '').toLowerCase()
  return k.includes('fecha') || k.includes('date') || k.endsWith('_at')
}

function formatDateHuman(raw) {
  const dt = new Date(raw)
  if (Number.isNaN(dt.getTime())) return String(raw)

  // Formato local humano: dd-mm-aaaa HH:mm
  const txt = new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(dt)

  return txt.replace(',', '')
}

function formatCell(value, key = '') {
  if (value === null || value === undefined || value === '') return '-'
  if (isDateColumn(key)) return formatDateHuman(value)
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }
  return String(value)
}

async function cargarHistorico() {
  loading.value = true
  errorMsg.value = ''

  try {
    const { data } = await api.get('/servicio/leanglobal/obtenerHistoricoConexion')
    items.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('Error cargando historico conexion:', e)
    items.value = []
    errorMsg.value = 'No se pudo cargar la tabla historico.'
  } finally {
    loading.value = false
  }
}

function onScroll(source) {
  if (isSyncing) return
  isSyncing = true

  const top = topScrollRef.value
  const mid = middleScrollEl.value
  const bot = bottomScrollRef.value

  const left =
    source === 'top' ? top?.scrollLeft || 0
      : source === 'bottom' ? bot?.scrollLeft || 0
        : mid?.scrollLeft || 0

  if (top) top.scrollLeft = left
  if (mid) mid.scrollLeft = left
  if (bot) bot.scrollLeft = left

  requestAnimationFrame(() => { isSyncing = false })
}

function onMiddleScroll() {
  onScroll('middle')
}

function recalcScrollWidth() {
  const mid = middleScrollEl.value
  if (!mid) {
    scrollContentWidth.value = '0px'
    return
  }
  const width = Math.max(mid.scrollWidth || 0, mid.clientWidth || 0)
  scrollContentWidth.value = `${width}px`
}

onMounted(async () => {
  await cargarHistorico()
  await nextTick()

  middleScrollEl.value = tableRef.value?.$el?.querySelector('.v-table__wrapper') || null
  if (middleScrollEl.value) {
    middleScrollEl.value.addEventListener('scroll', onMiddleScroll, { passive: true })
  }

  recalcScrollWidth()

  if (middleScrollEl.value) {
    resizeObserver = new ResizeObserver(() => recalcScrollWidth())
    resizeObserver.observe(middleScrollEl.value)
  }
  window.addEventListener('resize', recalcScrollWidth)
})

onBeforeUnmount(() => {
  if (middleScrollEl.value) {
    middleScrollEl.value.removeEventListener('scroll', onMiddleScroll)
  }
  if (resizeObserver) resizeObserver.disconnect()
  window.removeEventListener('resize', recalcScrollWidth)
})
</script>

<style scoped>
.surface-card {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02) !important;
}

.icon-box {
  width: 40px;
  height: 40px;
  background: #f1f5f9;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-primary-dark {
  color: #1e293b;
}

.sakai-input :deep(.v-field__outline) {
  --v-field-border-opacity: 0.15;
}

.sakai-input :deep(.v-field--focused .v-field__outline) {
  --v-field-border-opacity: 0.8;
}

.sakai-input :deep(.v-field) {
  border-radius: 8px;
}

.sakai-table-card {
  border-color: #e2e8f0;
  border-radius: 12px;
  background-color: white;
}

.table-scroll-wrap {
  overflow: hidden;
}

.x-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  height: 16px;
}

.x-scroll-top {
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.x-scroll-bottom {
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.tabla-historico :deep(table) {
  width: max-content;
  min-width: 100%;
}

/* Evita la 3ra barra horizontal (interna de v-table). */
.tabla-historico :deep(.v-table__wrapper) {
  overflow-x: hidden !important;
  overflow-y: auto !important;
}

.tabla-historico :deep(thead th) {
  background: #f8fafc;
  color: #64748b;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  height: 52px;
  border-bottom: 2px solid #e2e8f0;
  white-space: nowrap;
}

.tabla-historico :deep(tbody td) {
  height: 52px;
  border-bottom: 1px solid #f1f5f9;
  white-space: nowrap;
}

.tabla-historico :deep(tbody tr.row-hover:hover) {
  background-color: #f8fafc !important;
}
</style>
