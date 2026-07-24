<!-- RegistrosCargados.vue -->
<template>
  <v-card
    class="surface-card h-100"
    variant="outlined"
    style="border-color: #e2e8f0; border-radius: 12px; background-color: white;"
  >
    <!-- Header Sakai Style -->
    <div
      v-if="!props.resumen"
      class="pa-4 d-flex align-center justify-space-between border-b"
    >
      <div class="d-flex align-center">
        <div class="icon-box mr-3">
          <v-icon
            color="primary"
            icon="mdi-list-status"
          />
        </div>
        <div>
          <div class="text-subtitle-1 font-weight-bold text-primary-dark">
            {{ props.resumen ? 'Procesos de Conexión' : 'Registros Cargados' }}
          </div>
          <div class="text-caption text-medium-emphasis">
            {{ props.resumen ? 'Vista resumida de procesos' : 'Detalle de cargas y estados' }}
          </div>
        </div>
      </div>
    </div>

    <v-card-text class="pa-4">
      <v-alert
        v-if="error"
        type="error"
        variant="tonal"
        class="mb-3 rounded-lg"
      >
        {{ error }}
      </v-alert>

      <div
        v-for="day in days"
        :key="day.fecha"
        class="mb-3"
      >
        <!-- âœ… HEADER TIPO ACORDEON ESTILIZADO -->
        <div
          class="day-summary rounded-lg elevation-0 border-opacity-50"
          :class="openedKey === day.fecha ? 'border-primary bg-blue-lighten-5' : 'bg-grey-lighten-5'"
          @click="toggleDay(day.fecha)"
        >
          <div class="sum-fecha text-body-2 text-high-emphasis">
            <v-icon
              size="20"
              class="mr-2 transition-transform"
              :class="openedKey === day.fecha ? 'rotate-90 text-primary' : 'text-medium-emphasis'"
              icon="mdi-chevron-right"
            />
            {{ day.fecha }}
          </div>

          <div class="sum-metrics d-none d-sm-flex">
            <v-chip
              size="x-small"
              color="primary"
              variant="flat"
              class="font-weight-bold"
            >
              Plan: {{ day.planificados }}
            </v-chip>
            <v-chip
              size="x-small"
              color="success"
              variant="tonal"
              class="font-weight-bold"
            >
              Ok: {{ day.terminados }}
            </v-chip>
            <v-chip
              size="x-small"
              color="warning"
              variant="tonal"
              class="font-weight-bold"
            >
              Pend: {{ day.pendientes }}
            </v-chip>
          </div>

          <div class="sum-bar ml-auto">
            <div class="d-flex align-center">
              <span class="text-caption font-weight-bold mr-2 text-medium-emphasis">{{ day.avancePct }}%</span>
              <v-progress-linear
                :model-value="day.avancePct"
                color="primary"
                height="6"
                rounded
                style="width: 100px;"
              />
            </div>
          </div>
        </div>

        <!-- DETALLE -->
        <v-expand-transition>
          <div
            v-if="openedKey === day.fecha"
            class="mt-2 pl-2 pr-2"
          >
            <v-card
              variant="outlined"
              class="rounded-lg"
              style="border-color: #f1f5f9;"
            >
              <v-table
                v-if="props.resumen"
                density="compact"
                fixed-header
                :height="tableHeight"
                class="tabla-sakai text-caption bg-transparent"
              >
                <thead>
                  <tr>
                    <th
                      class="bg-grey-lighten-5 text-grey-darken-2 font-weight-bold text-uppercase text-center"
                      style="width: 52px;"
                    >
&nbsp;
                    </th>
                    <th
                      v-for="col in activeColumns"
                      :key="col.key"
                      :class="col.align ? `text-${col.align}` : 'text-left'"
                      :style="col.width ? `width:${col.width};` : ''"
                      class="bg-grey-lighten-5 text-grey-darken-2 font-weight-bold text-uppercase"
                    >
                      {{ col.label }}
                    </th>
                    <th
                      class="text-center bg-grey-lighten-5 text-grey-darken-2 font-weight-bold text-uppercase"
                      style="width: 70px;"
                    >
                      PDF
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <template
                    v-for="it in day.items"
                    :key="it.id"
                  >
                    <tr class="row-hover">
                      <td class="text-center">
                        <v-btn
                          icon
                          variant="text"
                          size="x-small"
                          color="primary"
                          @click.stop="toggleRow(day.fecha, it.id)"
                        >
                          <v-icon size="20">
                            {{ isExpandedRow(day.fecha, it.id) ? 'mdi-eye-off-outline' : 'mdi-eye-outline' }}
                          </v-icon>
                        </v-btn>
                      </td>
                      <td
                        v-for="col in activeColumns"
                        :key="col.key"
                        :class="col.align ? `text-${col.align}` : 'text-left'"
                        class="py-2"
                      >
                        <v-chip
                          v-if="col.key === 'estado'"
                          size="x-small"
                          :color="it.estado === 'Pre Creado' ? 'error' : (it.estado === 'Creado' ? 'success' : 'grey')"
                          variant="tonal"
                          class="font-weight-bold"
                        >
                          {{ it[col.key] ?? '-' }}
                        </v-chip>
                        <span
                          v-else
                          class="text-medium-emphasis"
                        >{{ formatCellByKey(it, col.key) }}</span>
                      </td>
                      <td class="text-center">
                        <v-btn
                          icon
                          size="x-small"
                          variant="text"
                          :disabled="!it.pdf_ok"
                          :color="it.pdf_ok ? 'error' : 'grey-lighten-1'"
                          @click.stop="verPdf(it)"
                        >
                          <v-icon
                            icon="mdi-file-pdf-box"
                            size="20"
                          />
                        </v-btn>
                      </td>
                    </tr>

                    <tr v-if="isExpandedRow(day.fecha, it.id)">
                      <td
                        :colspan="activeColumns.length + 2"
                        class="pa-0"
                      >
                        <div class="pa-3 pl-10">
                          <v-card
                            variant="outlined"
                            style="border-color: #e2e8f0; border-radius: 8px;"
                          >
                            <v-table
                              density="compact"
                              class="text-caption bg-white"
                            >
                              <thead>
                                <tr>
                                  <th class="bg-grey-lighten-4 text-grey-darken-1 font-weight-bold">
                                    Id
                                  </th>
                                  <th class="bg-grey-lighten-4 text-grey-darken-1 font-weight-bold">
                                    Nombre
                                  </th>
                                  <th class="bg-grey-lighten-4 text-grey-darken-1 font-weight-bold">
                                    Código
                                  </th>
                                  <th class="bg-grey-lighten-4 text-grey-darken-1 font-weight-bold">
                                    Usuario
                                  </th>
                                  <th class="bg-grey-lighten-4 text-grey-darken-1 font-weight-bold">
                                    Estado
                                  </th>
                                  <th class="bg-grey-lighten-4 text-grey-darken-1 font-weight-bold">
                                    Inicio
                                  </th>
                                  <th class="bg-grey-lighten-4 text-grey-darken-1 font-weight-bold">
                                    Fin
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr
                                  v-for="h in getChildrenOfDay(day, it.id)"
                                  :key="h.id"
                                  class="row-hover"
                                >
                                  <td class="text-medium-emphasis">
                                    {{ h.id }}
                                  </td>
                                  <td class="text-medium-emphasis">
                                    {{ h.nombre || '-' }}
                                  </td>
                                  <td class="text-medium-emphasis">
                                    {{ h.codigo || '-' }}
                                  </td>
                                  <td class="text-medium-emphasis">
                                    {{ h.usuario || '-' }}
                                  </td>
                                  <td>
                                    <v-chip
                                      size="x-small"
                                      :color="h.estado === 'Pre Creado' ? 'error' : (h.estado === 'Creado' ? 'success' : 'grey')"
                                      variant="tonal"
                                      class="font-weight-bold"
                                    >
                                      {{ h.estado || '-' }}
                                    </v-chip>
                                  </td>
                                  <td class="text-medium-emphasis">
                                    {{ formatDateDMY(h.inicio) }}
                                  </td>
                                  <td class="text-medium-emphasis">
                                    {{ formatDateDMY(h.fin) }}
                                  </td>
                                </tr>
                                <tr v-if="!getChildrenOfDay(day, it.id).length">
                                  <td
                                    colspan="7"
                                    class="text-center text-medium-emphasis py-3"
                                  >
                                    Sin subregistros
                                  </td>
                                </tr>
                              </tbody>
                            </v-table>
                          </v-card>
                        </div>
                      </td>
                    </tr>
                  </template>

                  <tr v-if="!day.items.length">
                    <td
                      :colspan="activeColumns.length + 2"
                      class="text-center py-8 text-medium-emphasis"
                    >
                      <div class="d-flex flex-column align-center">
                        <v-icon
                          icon="mdi-folder-open-outline"
                          size="40"
                          class="mb-2 text-disabled"
                        />
                        <div>Sin registros para este día.</div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </v-table>

              <v-table
                v-else
                density="compact"
                fixed-header
                :height="tableHeight"
                class="tabla-sakai text-caption bg-transparent"
              >
                <thead>
                  <tr>
                    <th
                      v-for="col in activeColumns"
                      :key="col.key"
                      :class="col.align ? `text-${col.align}` : 'text-left'"
                      :style="col.width ? `width:${col.width};` : ''"
                      class="bg-grey-lighten-5 text-grey-darken-2 font-weight-bold text-uppercase"
                    >
                      {{ col.label }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="it in day.items"
                    :key="it.id"
                    class="row-hover"
                  >
                    <td
                      v-for="(col, idx) in activeColumns"
                      :key="col.key"
                      :class="col.align ? `text-${col.align}` : 'text-left'"
                      class="py-2"
                    >
                      <a
                        v-if="idx === 0"
                        href="#"
                        class="link-survey text-decoration-none font-weight-bold text-primary"
                        :title="`Ver survey ${it.id}`"
                        @click.prevent.stop="abrirSurveyModal(it.id)"
                      >
                        {{ it[col.key] ?? '-' }}
                      </a>
                      <span
                        v-else
                        class="text-medium-emphasis"
                      >{{ formatCellByKey(it, col.key) }}</span>
                    </td>
                  </tr>
                  <tr v-if="!day.items.length">
                    <td
                      :colspan="activeColumns.length"
                      class="text-center py-8 text-medium-emphasis"
                    >
                      <div class="d-flex flex-column align-center">
                        <v-icon
                          icon="mdi-folder-open-outline"
                          size="40"
                          class="mb-2 text-disabled"
                        />
                        <div>Sin registros para este día.</div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-card>
          </div>
        </v-expand-transition>
      </div>
    </v-card-text>

    <!-- âœ… MODAL SURVEY -->
    <v-dialog
      v-model="dialogSurvey"
      max-width="1200"
      scrollable
      eager
      :retain-focus="false"
    >
      <v-card class="rounded-xl h-screen-85">
        <v-card-title class="pa-0">
          <v-toolbar
            color="surface"
            density="compact"
            class="border-b"
          >
            <v-icon
              icon="mdi-text-box-search-outline"
              color="primary"
              class="ml-4 mr-2"
            />
            <span class="text-subtitle-1 font-weight-bold text-medium-emphasis">Vista Survey</span>
            <v-spacer />
            <v-btn
              icon
              variant="text"
              color="medium-emphasis"
              @click="dialogSurvey = false"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar>
        </v-card-title>

        <v-card-text class="pa-0 h-100 bg-grey-lighten-4">
          <iframe
            v-if="surveyModalUrl"
            :src="surveyModalUrl"
            style="border:0; width:100%; height:100%;"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import apiAxios from '@/services/api'

const props = defineProps({
  fechaDesde: { type: [String, Date], default: null },
  fechaHasta: { type: [String, Date], default: null },
  clienteId: { type: [String, Number], default: null },
  proyectoId: { type: [String, Number], default: null },
  filtro: { type: [String, Number], default: null },
  secatrib: { type: [String, Number], default: null },
  resumen: { type: Boolean, default: false }
})

/** =====================
 *  UI estado
 *  ===================== */
const openedKey = ref(null)
function toggleDay(key) {
  openedKey.value = openedKey.value === key ? null : key
}
const expandedRows = ref(new Set())
function rowKey(dayKey, id) {
  return `${dayKey}::${Number(id || 0)}`
}
function toggleRow(dayKey, id) {
  const k = rowKey(dayKey, id)
  const next = new Set(expandedRows.value)
  if (next.has(k)) next.delete(k)
  else next.add(k)
  expandedRows.value = next
}
function isExpandedRow(dayKey, id) {
  return expandedRows.value.has(rowKey(dayKey, id))
}
function getChildrenOfDay(day, parentId) {
  return day?.hijosByPadre?.[Number(parentId)] || []
}

/** Modal Survey */
const dialogSurvey = ref(false)
const surveyModalUrl = ref('')

function abrirSurveyModal(idSurvey) {
  const sid = Number(idSurvey || 0)
  if (!sid) return
  const baseFront = import.meta.env.VITE_APP_BASE_URL || ''
  surveyModalUrl.value = `${baseFront}/verSurveyPrint?idInspeccion=${encodeURIComponent(sid)}`
  dialogSurvey.value = true
}

/** =====================
 *  Datos reales
 *  ===================== */
const surveys = ref([])
const error = ref('')

const API_BASE_URL =
  (import.meta?.env?.VITE_API_BASE_URL || import.meta?.env?.VUE_APP_API_BASE_URL || '')
    .replace(/\/$/, '')
const USE_CONEXION_V4 = String(import.meta?.env?.VITE_USE_CONEXION_V4 ?? 'true').trim().toLowerCase() !== 'false'

/** cache simple de id_doc -> name_doc_interno */
const docCache = ref({})

function normParam(v) {
  if (v == null) return ''
  const s = String(v).trim()
  if (!s || s.toLowerCase() === 'null') return ''
  return s
}

// Helper para detalle
async function getSurveyDetail(id) {
  try {
    const { data } = await apiAxios.get("/servicio/leanglobal/procesosSurveyDetail?id_survey=" + id)
    // El servicio suele retornar un array o un objeto principal
    // Aseguramos tomar el primer elemento si es array, o data si es object
    const row = Array.isArray(data) ? data[0] : (data?.surveyDetail?.[0] || data)
    return row
  } catch (e) {
    console.error('getSurveyDetail error', id, e)
    return null
  }
}

async function fetchConexionRowsBase({ fechaDesde, fechaHasta, clienteId, proyectoId }) {
  const params = new URLSearchParams()
  if (fechaDesde) params.append('fecha_desde', String(fechaDesde))
  if (fechaHasta) params.append('fecha_hasta', String(fechaHasta))
  params.append('ts.id_empresa_cliente', String(clienteId || ''))
  params.append('ts.id_proyecto', String(proyectoId || ''))

  if (USE_CONEXION_V4) {
    try {
      const respV4 = await apiAxios.get(`/servicio/leanglobal/procesosSurveyV4?${params.toString()}`)
      return Array.isArray(respV4?.data?.datos) ? respV4.data.datos : []
    } catch (err) {
      console.warn('[ResumenCarga][V4] fallback a V3 por error:', err?.response?.status || err?.message || err)
    }
  }

  const respV3 = await apiAxios.get(`/servicio/leanglobal/procesosSurveyV3?${params.toString()}`)
  return Array.isArray(respV3?.data?.datos) ? respV3.data.datos : []
}

/** Trae surveys Conexión (id_area=8) y respeta filtros de props */
async function getSurveysReales() {
  error.value = ''
  try {
    const proyectoId = normParam(props.proyectoId)
    const clienteId = normParam(props.clienteId)

    const fechaDesde = normParam(props.fechaDesde)
    const fechaHasta = normParam(props.fechaHasta)

    const arr = (await fetchConexionRowsBase({
      fechaDesde,
      fechaHasta,
      clienteId,
      proyectoId
    }) || [])
      .slice()
      .sort((a, b) => Number(b.id_survey) - Number(a.id_survey))

    // âœ… SOLO CONEXIÃ“N
    const filtered = arr.filter(s => Number(s.id_area) === 8)
    surveys.value = filtered

    // âœ… ENRIQUECER con detalle para obtener body_exec
    // Hacemos requests en paralelo para obtener el JSON completo
    if (filtered.length > 0) {
      await Promise.all(filtered.map(async (s) => {
        const det = (s?.body_exec || s?.json_exec) ? s : await getSurveyDetail(s.id_survey)
        if (det) {
          s.body_exec = det.body_exec
          s.json_exec = det.json_exec // por si acaso
          s.header_exec = det.header_exec
        }
      }))
      // Forzamos reactividad
      surveys.value = [...filtered]
    }
  } catch (e) {
    console.error('getSurveysReales', e)
    error.value = e?.response?.data?.message || e?.message || 'Error cargando surveys.'
    surveys.value = []
  }
}

/** =====================
 *  Columnas 
 *  ===================== */
const columnsResumenTrue = computed(() => ([
  { key: 'proyecto', label: 'Proyecto', align: 'left', width: '220px' },
  { key: 'ic', label: 'IC', align: 'left', width: '120px' },
  { key: 'orden', label: 'Orden', align: 'left', width: '120px' },
  { key: 'gio', label: 'GIO', align: 'left', width: '170px' },
  { key: 'supervisor', label: 'Supervisor', align: 'left', width: '200px' },
  { key: 'tipo', label: 'Tipo', align: 'left', width: '120px' },
  { key: 'tecnico', label: 'Nombre Técnico', align: 'left', width: '200px' },
  { key: 'valor_servicio', label: 'Valor Servicio', align: 'left', width: '150px' },
  { key: 'estado', label: 'Estado', align: 'center', width: '120px' },
  { key: 'inicio', label: 'Inicio', align: 'left', width: '120px' },
  { key: 'fin', label: 'Fin', align: 'left', width: '120px' }
]))

const columnsFullFalse = computed(() => ([
  { key: 'id', label: 'ID', align: 'left', width: '120px' },

  { key: 'contratista', label: 'Contratista', align: 'left', width: '160px' },
  { key: 'codigo_contratista', label: 'C. Contratista', align: 'left', width: '160px' },
  { key: 'rut_certificador', label: 'Rut Cert.', align: 'left', width: '140px' },
  { key: 'rut_gio', label: 'Rut GIO', align: 'left', width: '140px' },
  { key: 'tipo', label: 'Tipo', align: 'left', width: '120px' },

  { key: 'certificadora', label: 'Certificadora', align: 'left', width: '160px' },
  { key: 'ic_sap_mg', label: 'IC_SAP MG', align: 'left', width: '140px' },
  { key: 'nmro_orden_mg', label: 'N° Orden', align: 'left', width: '140px' },
  { key: 'gio', label: 'GIO', align: 'left', width: '100px' },
  { key: 'fecha_planificada', label: 'Fecha', align: 'left', width: '120px' },
  { key: 'direccion_comuna', label: 'Ubicación', align: 'left', width: '220px' },
  { key: 'cliente_fonos_obs', label: 'Cliente / Obs', align: 'left', width: '260px' }
]))

const activeColumns = computed(() =>
  props.resumen ? columnsResumenTrue.value : columnsFullFalse.value
)

const tableHeight = computed(() => (props.resumen ? 500 : 420))

/** =====================
 *  Agrupar por fecha
 *  ===================== */
function toYYYYMMDD(v) {
  if (!v) return ''
  return String(v).slice(0, 10)
}

function isTerminada(estadoSrv) {
  const s = String(estadoSrv || '').toLowerCase()
  return s.includes('termin') || s === 'terminada'
}

function getFirstBodyValue(vals, keys = []) {
  for (const k of keys) {
    const v = vals?.[k]
    if (v !== undefined && v !== null && String(v).trim() !== '') return String(v)
  }
  return ''
}

function formatDateDMY(raw) {
  const s = String(raw ?? '').trim()
  if (!s) return '-'
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return `${iso[3]}-${iso[2]}-${iso[1]}`
  const dmy = s.match(/^(\d{2})[/-](\d{2})[/-](\d{4})/)
  if (dmy) return `${dmy[1]}-${dmy[2]}-${dmy[3]}`
  return s
}

function formatCellByKey(item, key) {
  if (key === 'inicio' || key === 'fin') return formatDateDMY(item?.[key])
  return item?.[key] ?? '-'
}

// âœ… Helper para extraer del JSON
let debugLogged = false

// âœ… Helper para extraer del JSON
// âœ… Helper para extraer del JSON
function getBodyValues(s) {
  // Debug especÃ­fico para el survey 1456
  const debugId = Number(s.id_survey)
  if (debugId === 1456) {
    console.log('[ResumenCarga] >>> SURVEY 1456 FULL:', JSON.stringify(s, null, 2))
    console.log('[ResumenCarga] >>> SURVEY 1456 BODY_EXEC TYPE:', typeof s.body_exec)
    // console.log('[ResumenCarga] >>> SURVEY 1456 BODY_EXEC RAW:', s.body_exec)
  }

  // SOLO body_exec (o json_exec si el backend lo llama asÃ­)
  const raw = s.body_exec || s.json_exec
  if (!raw) return {}

  const res = {}
  try {
    const obj = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (obj && obj.segmentos) {
      for (const seg of obj.segmentos) {
        for (const attr of (seg.attributes || [])) {
          if (attr.label) {
            // Normalizamos key a trim y UPPERCASE para facilitar matching
            const key = String(attr.label).trim().toUpperCase()

            // Prioridad: value > answer > respuesta > default
            let val = attr.value
            if (val === undefined || val === null) val = attr.answer
            if (val === undefined || val === null) val = attr.respuesta
            if (val === undefined || val === null) val = attr.default

            res[key] = val !== undefined && val !== null ? String(val) : ''
          }
        }
      }
    }
  } catch (e) {
    console.error('[ResumenCarga] Error parsing body_exec', e)
  }
  return res
}

const days = computed(() => {
  const map = Object.create(null)

  for (const s of (surveys.value || [])) {
    const fecha = toYYYYMMDD(s.fecha_plan_ini || s.fecha_plan_ini_raw)
    if (!fecha) continue

    if (!map[fecha]) {
      map[fecha] = {
        fecha,
        items: [],
        planificados: 0,
        terminados: 0,
        pendientes: 0,
        avancePct: 0
      }
    }

    // Extraemos todo del JSON (prioridad)
    const b = getBodyValues(s)

    // Helper p/ nulos con key uppercase
    const v = (key) => b[key] || ''

    const direccion = v('DIRECCIÓN')
    const comuna = v('COMUNA')
    const cliente = v('CLIENTE')
    const fonos = v('FONOS')
    const obs = v('OBSERVACIÓN')

    const item = {
      id: Number(s.id_survey),
      id_survey_padre: Number(s?.id_survey_padre || 0) || 0,

      // Mapeos solicitados (usando keys UPPERCASE del helper)
      contratista: v('CONTRATISTA') || s.contratista || s.codi_tipo_srv || '-',
      certificadora: v('CERTIFICADORA') || s.certificadora || '-',
      ic_sap_mg: v('IC_SAP MG') || s.ic_sap_mg || s.ic_sap || '-',
      nmro_orden_mg: v('NMRO ORDEN MG') || s.nmro_orden_mg || s.orden || '-',
      gio: v('GIO') || s.gio || '-',

      fecha_planificada: v('FECHA') || fecha || '-',

      // Combinados
      direccion_comuna: (direccion + (direccion && comuna ? ' / ' : '') + comuna) || s.direccion_comuna || s.direccion || '-',

      cliente_fonos_obs:
        (cliente
          + (fonos ? (' - F: ' + fonos) : '')
          + (obs ? (' - Obs: ' + obs) : '')
        ) || s.cliente_fonos_obs || '-',

      codigo_contratista: v('CÓDIGOS') || s.codigo_contratista || s.rut_certificador || '-',

      rut_certificador: v('RUT') || s.rut_certificador || '-',
      rut_gio: s.rut_gio || '-',
      tipo: getFirstBodyValue(b, ['TIPO', 'ESTADO']) || s.tipo || s.name_tipo_srv || '-',

      hora_llegada: s.hora_llegada || '-',
      charla: v('CHARLA') || s.charla || '-',
      ats: v('ATS') || s.ats || '-',
      estado: s.estado || s.estado_srv || '-',
      t_altura: v('T. ALTURA') || s.t_altura || '-',

      // Vista similar a Asignaciones
      proyecto: getFirstBodyValue(b, ['PROYECTO', 'NOMBRE PROYECTO']) || s.nombre_proyecto || '-',
      ic: getFirstBodyValue(b, ['IC-SAP', 'IC SAP', 'IC SAP MG', 'IC_SAP MG']) || s.ic_sap_mg || s.ic_sap || '-',
      orden: v('NMRO ORDEN MG') || v('ORDEN') || s.nmro_orden_mg || s.orden || s.id_survey || '-',
      supervisor: s.nombre_user || '-',
      tecnico: s.nombre_tecnico || '-',
      valor_servicio: getFirstBodyValue(b, ['VALOR SERVICIO', 'VALOR SERVCIO']) || s.valor_servicio || '-',
      inicio: s.fecha_plan_ini || s.fecha_plan_ini_raw || '-',
      fin: s.fecha_plan_fin || s.fecha_plan_fin_raw || '-',
      nombre: s.name_template_srv || '-',
      codigo: s.codi_template_srv || '-',
      usuario: s.nombre_user || '-',

      estado_srv: s.estado_srv || '',
      id_doc: s.id_doc ? Number(s.id_doc) : null,
      pdf_ok: !!s.id_doc
    }

    map[fecha].items.push(item)
    map[fecha].planificados += 1
    if (isTerminada(s.estado_srv)) map[fecha].terminados += 1
  }

  for (const day of Object.values(map)) {
    day.pendientes = Math.max(0, day.planificados - day.terminados)
    day.avancePct = day.planificados ? Math.round((day.terminados / day.planificados) * 100) : 0

    const hijosByPadre = {}
    for (const it of day.items) {
      if (!it.id_survey_padre) continue
      const pid = Number(it.id_survey_padre)
      if (!hijosByPadre[pid]) hijosByPadre[pid] = []
      hijosByPadre[pid].push(it)
    }
    for (const k of Object.keys(hijosByPadre)) {
      hijosByPadre[k].sort((a, b) => Number(a.id) - Number(b.id))
    }

    const padres = day.items
      .filter(it => !Number(it.id_survey_padre || 0))
      .sort((a, b) => Number(b.id) - Number(a.id))

    for (const p of padres) {
      const hijos = hijosByPadre[Number(p.id)] || []
      if ((!p.tecnico || p.tecnico === '-') && hijos.length) {
        const h = hijos.find(x => String(x.usuario || '').trim() !== '')
        if (h) p.tecnico = h.usuario
      }
    }

    day.hijosByPadre = hijosByPadre
    day.items = padres
  }

  return Object.values(map).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
})

/** =====================
 *  PDF REAL
 *  ===================== */
async function resolveDocNameInterno(idDoc) {
  const id = Number(idDoc || 0)
  if (!id) return ''

  const cached = docCache.value[id]
  if (cached?.name_doc_interno) return cached.name_doc_interno
  if (cached?.loading) return ''

  docCache.value = {
    ...docCache.value,
    [id]: { name_doc_interno: '', loading: true, error: '' }
  }

  try {
    const resp = await apiAxios.get(`/servicio/leanglobal/obtenerTFMGFile?id_doc=${id}`)
    const row = Array.isArray(resp.data) ? resp.data[0] : resp.data
    const name = row?.name_doc_interno || ''

    docCache.value = {
      ...docCache.value,
      [id]: { name_doc_interno: name, loading: false, error: '' }
    }

    return name
  } catch (e) {
    console.error('resolveDocNameInterno', e)
    docCache.value = {
      ...docCache.value,
      [id]: { name_doc_interno: '', loading: false, error: 'No pude resolver el documento' }
    }
    return ''
  }
}

async function verPdf(it) {
  if (!it?.id_doc) return
  const nameInterno = await resolveDocNameInterno(it.id_doc)
  if (!nameInterno) return

  const url = `${API_BASE_URL}/archivo/terracon/${nameInterno}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

onMounted(() => {
  getSurveysReales()
})

watch(
  () => [props.fechaDesde, props.fechaHasta, props.clienteId, props.proyectoId, props.filtro, props.secatrib],
  () => {
    getSurveysReales()
  }
)
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

.day-summary {
  display: grid;
  grid-template-columns: 140px 1fr 180px;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid transparent;
  width: 100%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.day-summary:hover {
  background-color: #f8fafc;
  /* Slate 50 */
}

.sum-fecha {
  display: flex;
  align-items: center;
  font-family: 'Inter', sans-serif;
}

.sum-metrics {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.rotate-90 {
  transform: rotate(90deg);
}

.transition-transform {
  transition: transform 0.2s ease;
}

.link-survey:hover {
  text-decoration: underline;
}

.h-screen-85 {
  height: 85vh;
}
</style>





