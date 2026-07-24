<template>
  <div class="pa-1 h-100">
    <v-card
      class="surface-card h-100"
      variant="outlined"
      style="border-color: #e2e8f0; border-radius: 12px; background-color: white;"
    >
      <v-card-text class="pa-0 d-flex cargas-layout">
        <div class="cargas-table-pane">
          <v-table
            density="compact"
            fixed-header
            :height="tableHeightCompact"
            class="tabla-sakai text-caption bg-transparent"
            hover
          >
            <thead>
              <tr>
                <th
                  class="bg-grey-lighten-5 text-grey-darken-2 font-weight-bold text-uppercase"
                  style="width: 80px;"
                >
                  ID
                </th>
                <th
                  class="bg-grey-lighten-5 text-grey-darken-2 font-weight-bold text-uppercase"
                  style="width: 140px;"
                >
                  Fecha
                </th>
                <th class="bg-grey-lighten-5 text-grey-darken-2 font-weight-bold text-uppercase">
                  Nombre
                </th>
                <th
                  class="bg-grey-lighten-5 text-grey-darken-2 font-weight-bold text-uppercase text-center"
                  style="width: 180px;"
                >
                  N° Asig
                </th>
                <th
                  class="bg-grey-lighten-5 text-grey-darken-2 font-weight-bold text-uppercase text-center"
                  style="width: 110px;"
                >
                  Total Asig
                </th>
                <th
                  class="bg-grey-lighten-5 text-grey-darken-2 font-weight-bold text-uppercase text-center"
                  style="width: 60px;"
                >
                  Excel
                </th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="r in rows"
                :key="r.id"
                class="row-hover transition-swing"
                :class="{ 'row-selected': selectedLoadId === r.id }"
                style="cursor: pointer;"
                @click="seleccionarCarga(r)"
              >
                <td class="font-weight-bold text-medium-emphasis">
                  {{ r.id }}
                </td>

                <td class="text-medium-emphasis">
                  {{ r.fecha }}
                </td>

                <td
                  class="text-truncate"
                  style="max-width: 250px;"
                >
                  <span class="font-weight-medium text-high-emphasis">{{ r.nombre }}</span>
                </td>

                <td class="text-center font-weight-bold text-medium-emphasis">
                  {{ r.nro_asignaciones }}
                </td>

                <td class="text-center font-weight-bold text-medium-emphasis">
                  {{ r.total_asignaciones }}
                </td>

                <td class="text-center">
                  <v-tooltip
                    text="Ver Excel original"
                    location="top"
                  >
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        icon
                        size="x-small"
                        variant="text"
                        color="success"
                        :disabled="!r.name_doc_interno && !r.id_doc"
                        @click.stop="verExcel(r)"
                      >
                        <v-icon
                          icon="mdi-file-excel-box"
                          size="20"
                        />
                      </v-btn>
                    </template>
                  </v-tooltip>
                </td>
              </tr>
              <tr v-if="!rows.length">
                <td
                  colspan="6"
                  class="text-center py-8 text-medium-emphasis"
                >
                  <div class="d-flex flex-column align-center">
                    <v-icon
                      icon="mdi-database-off-outline"
                      size="32"
                      class="mb-2 text-disabled"
                    />
                    <div>Sin registros disponibles.</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>

        <div
          v-if="props.showUploadButton"
          class="cargas-actions-pane border-l d-flex justify-center align-start pa-2"
        >
          <v-btn
            color="primary"
            size="x-small"
            class="cargas-btn-excel"
            @click="emit('open-excel')"
          >
            <v-icon
              start
              icon="mdi-file-excel"
            />
            {{ cargarExcelLabel }}
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import apiAxios from '@/services/api'

const props = defineProps({
  height: { type: [Number, String], default: 360 },
  fechaDesde: { type: String, default: '' },
  fechaHasta: { type: String, default: '' },
  filtro: { type: [String, Number], default: '' },   // id_empresa_cliente
  secatrib: { type: [String, Number], default: '' }, // id_proyecto
  showUploadButton: { type: Boolean, default: true },
  planMode: { type: String, default: 'conexion' } // 'conexion' | 'plan_c'
})

const emit = defineEmits(['carga-selected', 'open-excel'])
const cargarExcelLabel = computed(() => (props.planMode === 'plan_c' ? 'Cargar Excel C' : 'Cargar Excel'))

const ARCHIVO_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://servidor.leanglobal.cl'

const rows = ref([])
const loading = ref(false)
const error = ref('')
const selectedLoadId = ref(null)
const docNameCache = ref({})

const tableHeightCompact = computed(() => {
  const h = props.height
  if (typeof h === 'number') return Math.max(Math.floor(h / 2), 120)
  const n = Number(h)
  if (Number.isFinite(n)) return Math.max(Math.floor(n / 2), 120)
  return h
})

function toYYYYMMDDLocal(input) {
  if (!input) return ''
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) return input
  const d = new Date(input)
  if (Number.isNaN(d.getTime())) return ''
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function parseDateSafe(input) {
  if (!input) return null
  const d = new Date(input)
  if (!Number.isNaN(d.getTime())) return d
  return null
}

const PLAN_C_OBS_TAG = '[PLAN_C]'

function isPlanCLoadFromObservaciones(obs) {
  return String(obs || '').toUpperCase().includes(PLAN_C_OBS_TAG)
}

function loadMatchesMode(loadRow) {
  const isPlanC = isPlanCLoadFromObservaciones(loadRow?.observaciones)
  return props.planMode === 'plan_c' ? isPlanC : !isPlanC
}

function dentroDeRangoFechaCarga(fechaCargaIso) {
  const carga = new Date(fechaCargaIso)
  if (Number.isNaN(carga.getTime())) return false

  const desde = props.fechaDesde ? new Date(`${props.fechaDesde}T00:00:00`) : null
  const hasta = props.fechaHasta ? new Date(`${props.fechaHasta}T23:59:59.999`) : null

  if (desde && Number.isNaN(desde.getTime())) return true
  if (hasta && Number.isNaN(hasta.getTime())) return true

  const cumpleDesde = !desde || carga >= desde
  const cumpleHasta = !hasta || carga <= hasta
  return cumpleDesde && cumpleHasta
}

function formatFechaCL(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return String(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function isLikelyInvalidDocName(v) {
  const s = String(v || '').trim()
  if (!s) return true
  // Evita abrir rutas que no son archivos reales (ej: "cnxload/94").
  return s.toLowerCase().includes('cnxload/')
}

async function resolveDocNameInterno(idDoc) {
  const id = Number(idDoc || 0)
  if (!id) return ''

  const cached = docNameCache.value[id]
  if (cached?.name_doc_interno) return cached.name_doc_interno
  if (cached?.loading) return ''

  docNameCache.value = {
    ...docNameCache.value,
    [id]: { name_doc_interno: '', loading: true, error: '' }
  }

  try {
    const resp = await apiAxios.get(`/servicio/leanglobal/obtenerTFMGFile?id_doc=${id}`)
    const row = Array.isArray(resp?.data) ? resp.data[0] : resp?.data
    const name = row?.name_doc_interno || ''
    docNameCache.value = {
      ...docNameCache.value,
      [id]: { name_doc_interno: name, loading: false, error: '' }
    }
    return name
  } catch (e) {
    docNameCache.value = {
      ...docNameCache.value,
      [id]: { name_doc_interno: '', loading: false, error: 'No pude resolver el documento' }
    }
    return ''
  }
}

async function obtenerPadresConexion() {
  const params = new URLSearchParams()
  if (props.filtro !== '' && props.filtro !== null && props.filtro !== undefined) {
    params.append('ts.id_empresa_cliente', String(props.filtro))
  }
  if (props.secatrib !== '' && props.secatrib !== null && props.secatrib !== undefined) {
    params.append('ts.id_proyecto', String(props.secatrib))
  }

  const { data } = await apiAxios.get(`/servicio/leanglobal/procesosSurveyV3?${params.toString()}`)
  const surveys = Array.isArray(data?.datos) ? data.datos : []

  return surveys.filter(s =>
    Number(s?.id_area) === 8 &&
    Number(s?.id_template) !== 153 &&
    Number(s?.id_survey_padre || 0) === 0
  )
}

function buildCountByLoadId(padres) {
  const out = new Map()
  for (const p of padres || []) {
    const idLoad = Number(p?.id_load || 0)
    if (!idLoad) continue
    out.set(idLoad, (out.get(idLoad) || 0) + 1)
  }
  return out
}

async function obtenerCNXLoad() {
  loading.value = true
  error.value = ''
  try {
    const [padres, respLoad] = await Promise.all([
      obtenerPadresConexion(),
      apiAxios.get('/servicio/leanglobal/obtenerCNXLoad')
    ])
    const data = respLoad?.data
    const arr = Array.isArray(data) ? data : []
    const arrFiltrado = arr
      .filter(loadMatchesMode)
      .filter(r => dentroDeRangoFechaCarga(r.fecha_carga))
    const allowedLoadIds = new Set(
      arrFiltrado
        .map(r => Number(r?.id_load || 0))
        .filter(id => id > 0)
    )
    const padresFiltrados = (padres || []).filter(p => allowedLoadIds.has(Number(p?.id_load || 0)))
    const countByLoadId = buildCountByLoadId(padresFiltrados)

    rows.value = arrFiltrado.map(r => {
      const idLoad = Number(r?.id_load || 0)
      const countSurveys = Number(countByLoadId.get(idLoad) || 0)
      const countFallback = Number(r?.cant_cargados || 0) || Number(r?.cant_total_excel || 0) || 0
      const totalAsig = countSurveys > 0 ? countSurveys : countFallback

      return {
        id: idLoad,
        fecha: formatFechaCL(r.fecha_carga),
        fecha_carga_iso: r.fecha_carga,
        fecha_carga_dia: toYYYYMMDDLocal(r.fecha_carga),
        fecha_carga_ts: parseDateSafe(r.fecha_carga),
        nombre: r.name_doc_orig || `Documento #${r.id_doc}`,
        nro_asignaciones: String(totalAsig),
        total_asignaciones: totalAsig,
        id_doc: r.id_doc,
        name_doc_orig: r.name_doc_orig,
        name_doc_interno: r.name_doc_interno,
        estado_carga: r.estado_carga,
        observaciones: r.observaciones || null,
        path_doc: r.path_doc || '/u05/LeanDocs/terracon'
      }
    }).sort((a, b) => {
      const ta = a?.fecha_carga_ts?.getTime?.() || 0
      const tb = b?.fecha_carga_ts?.getTime?.() || 0
      if (tb !== ta) return tb - ta
      return Number(b.id) - Number(a.id)
    })

    if (selectedLoadId.value && !rows.value.some(r => Number(r.id) === Number(selectedLoadId.value))) {
      selectedLoadId.value = null
    }
  } catch (e) {
    console.error(e)
    error.value = e?.response?.data?.message || e?.message || 'Error cargando registros.'
    rows.value = []
  } finally {
    loading.value = false
  }
}

function seleccionarCarga(row) {
  selectedLoadId.value = row.id

  // 👇 manda id, fecha y nombre de la carga seleccionada
  emit('carga-selected', {
    id_load: Number(row.id),
    fecha_carga: row.fecha_carga_iso, // ISO real
    fecha_carga_texto: row.fecha || '',
    nombre_carga: row.nombre || '',
    rango_desde: row.fecha_carga_iso || null,
    rango_hasta: null
  })
}

async function verExcel(row) {
  let docName = row?.name_doc_interno || ''
  if (isLikelyInvalidDocName(docName) && row?.id_doc) {
    docName = await resolveDocNameInterno(row.id_doc)
  }
  if (!docName) return
  const url = `${ARCHIVO_BASE_URL}/archivo/terracon/${docName}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

function getRowsForExport() {
  return (rows.value ?? []).map(r => ({
    id_load: r.id ?? '',
    fecha_carga: r.fecha ?? '',
    nombre: r.nombre ?? '',
    nro_asignaciones: r.nro_asignaciones ?? '',
    total_asignaciones: r.total_asignaciones ?? 0,
    id_doc: r.id_doc ?? '',
    estado_carga: r.estado_carga ?? '',
    observaciones: r.observaciones ?? ''
  }))
}

defineExpose({ reload: obtenerCNXLoad, getRowsForExport })

onMounted(() => {
  obtenerCNXLoad()
})
</script>

<style scoped>
.surface-card {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02) !important;
}

.icon-box {
  width: 34px;
  height: 34px;
  background: #f1f5f9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-primary-dark {
  color: #1e293b;
}

/* Row Hover Effect */
.row-hover:hover {
  background-color: #f8fafc !important;
  /* Slate 50 */
}

.row-selected {
  background-color: #dbeafe !important;
}

.row-selected td {
  font-weight: 700;
}

.tabla-sakai :deep(thead th) {
  padding: 0 6px !important;
  height: 24px !important;
  font-size: 10px;
  line-height: 1.1 !important;
}

.tabla-sakai :deep(tbody td) {
  padding: 0 6px !important;
  height: 22px !important;
  font-size: 10px;
  line-height: 1.1 !important;
}

.tabla-sakai :deep(.v-btn--size-x-small) {
  width: 20px !important;
  height: 20px !important;
}

.cargas-layout {
  align-items: stretch;
}

.cargas-table-pane {
  flex: 1 1 auto;
  min-width: 0;
}

.cargas-actions-pane {
  width: 130px;
  flex: 0 0 130px;
  background: #ffffff;
}

.cargas-btn-excel {
  height: 26px;
  font-size: 10px;
}

/* Custom Scrollbar for this table specifically if needed, 
   otherwise inherits from global or v-table defaults 
   matched with other components */
</style>
