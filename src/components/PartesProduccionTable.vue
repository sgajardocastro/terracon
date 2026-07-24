<template>
  <div class="partes-produccion-container">
    <!-- Tabular View Section (PPDs) -->
    <v-row dense>
      <v-col cols="12">
        <v-card
          class="pa-4 rounded-xl border"
          variant="flat"
          style="border-color: #e2e8f0 !important;"
        >
          <div class="d-flex align-center justify-space-between mb-4 flex-wrap gap-2">
            <div class="d-flex align-center">
              <v-avatar
                color="primary-lighten-5"
                size="36"
                class="mr-3"
              >
                <v-icon
                  icon="mdi-table-large"
                  color="primary"
                  size="20"
                />
              </v-avatar>
              <div>
                <span class="text-subtitle-1 font-weight-black text-slate-800">Partes de Producción Diaria (PPD)</span>
                <div class="text-caption text-slate-500">
                  Listado y estados de firmas de informes diarios
                </div>
              </div>
            </div>
            <!-- Search field -->
            <v-text-field
              v-model="searchQuery"
              prepend-inner-icon="mdi-magnify"
              label="Buscar en la tabla..."
              density="compact"
              variant="outlined"
              hide-details
              style="max-width: 300px; min-width: 200px;"
              class="rounded-lg"
            />
          </div>

          <v-data-table
            :headers="headers"
            :items="ppdReports"
            :search="searchQuery"
            density="comfortable"
            class="ppd-data-table border rounded-xl overflow-hidden"
            :loading="loadingReports"
            loading-text="Cargando informes PPD..."
            no-data-text="No se encontraron reportes PPD en el rango seleccionado."
            :items-per-page="10"
            :items-per-page-options="[5, 10, 20, 50]"
            show-expand
            item-value="idSurvey"
          >
            <!-- Format Fecha -->
            <template #[`item.fecha`]="{ item }">
              <span class="font-weight-bold text-slate-800">{{ formatDateString(item.fecha) }}</span>
            </template>

            <!-- Format KM -->
            <template #[`item.km`]="{ item }">
              <span
                v-if="Number(item.km) > 0"
                class="font-weight-bold text-slate-800"
              >{{ item.km }} KM</span>
              <span
                v-else
                class="text-slate-400"
              >—</span>
            </template>

            <!-- Format Cameras -->
            <template #[`item.camaras`]="{ item }">
              <v-chip
                v-if="item.camaras > 0"
                size="small"
                color="teal"
                variant="flat"
                class="text-white font-weight-bold"
              >
                {{ item.camaras }} cdo.
              </v-chip>
              <span
                v-else
                class="text-slate-400"
              >—</span>
            </template>

            <!-- Format Acceso al informe -->
            <template #[`item.acciones`]="{ item }">
              <v-btn
                size="small"
                variant="flat"
                color="primary"
                prepend-icon="mdi-file-document-outline"
                class="font-weight-bold px-4 rounded-lg"
                @click="openReportModalFromReport(item)"
              >
                Ver Reporte
              </v-btn>
              <v-btn
                v-if="getPdfUrlForReport(item)"
                size="small"
                variant="flat"
                color="success"
                prepend-icon="mdi-file-pdf-box"
                class="font-weight-bold px-4 ml-2 text-white rounded-lg"
                :href="getPdfUrlForReport(item)"
                target="_blank"
              >
                Ver PDF
              </v-btn>
            </template>

            <!-- Expanded row slot to show nested list of activities -->
            <template #expanded-row="{ columns, item }">
              <tr>
                <td
                  :colspan="columns.length"
                  class="bg-slate-50 pa-4"
                >
                  <v-card
                    variant="outlined"
                    class="border rounded-lg bg-white overflow-hidden"
                    style="border-color: #e2e8f0 !important;"
                  >
                    <v-table
                      density="compact"
                      class="text-caption"
                    >
                      <thead>
                        <tr style="background-color: #f8fafc;">
                          <th class="text-left font-weight-bold text-slate-700">
                            EDT
                          </th>
                          <th class="text-left font-weight-bold text-slate-700">
                            Partida
                          </th>
                          <th class="text-left font-weight-bold text-slate-700">
                            Actividad de Mantención
                          </th>
                          <th class="text-left font-weight-bold text-slate-700">
                            Geoloc
                          </th>
                          <th class="text-left font-weight-bold text-slate-700">
                            Oleoducto
                          </th>
                          <th class="text-left font-weight-bold text-slate-700">
                            Patrulla
                          </th>
                          <th class="text-center font-weight-bold text-slate-700">
                            Km Mantención
                          </th>
                          <th class="text-center font-weight-bold text-slate-700">
                            Cámaras
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="act in getActivitiesForDate(item)"
                          :key="act.idTarea"
                        >
                          <td class="py-2">
                            <v-chip
                              size="x-small"
                              variant="tonal"
                              color="slate-600"
                              class="font-weight-bold"
                            >
                              {{ act.codigoEdt || '—' }}
                            </v-chip>
                          </td>
                          <td class="py-2">
                            {{ act.partida }}
                          </td>
                          <td class="py-2 font-weight-bold text-slate-800">
                            {{ act.actividad }}
                          </td>
                          <td class="py-2">
                            <span
                              v-if="act.lat && act.lon"
                              class="text-caption text-primary"
                            >
                              <v-icon
                                icon="mdi-map-marker"
                                size="14"
                                color="error"
                                class="mr-1"
                              />
                              {{ Number(act.lat).toFixed(4) }}, {{ Number(act.lon).toFixed(4) }}
                            </span>
                            <span
                              v-else
                              class="text-slate-400 text-caption"
                            >—</span>
                          </td>
                          <td class="py-2">
                            {{ act.oleoducto }}
                          </td>
                          <td class="py-2">
                            {{ act.patrullas }}
                          </td>
                          <td class="py-2 text-center font-weight-bold">
                            {{ act.kmMantencion ? act.kmMantencion + ' KM' : '—' }}
                          </td>
                          <td class="py-2 text-center">
                            <v-chip
                              v-if="Number(act.camarasRealizadas) > 0"
                              size="x-small"
                              color="teal"
                              variant="flat"
                              class="text-white font-weight-bold"
                            >
                              {{ act.camarasRealizadas }}
                            </v-chip>
                            <span
                              v-else
                              class="text-slate-400"
                            >—</span>
                          </td>
                        </tr>
                        <tr v-if="!getActivitiesForDate(item).length">
                          <td
                            colspan="8"
                            class="text-center py-4 text-slate-400 italic"
                          >
                            No se registraron actividades para este día.
                          </td>
                        </tr>
                      </tbody>
                    </v-table>
                  </v-card>
                </td>
              </tr>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Report Dialog Modal -->
    <v-dialog
      v-model="showReportModal"
      :max-width="smAndDown ? '100%' : 1000"
      :fullscreen="smAndDown"
      scrollable
    >
      <v-card class="d-flex flex-column rounded-xl overflow-hidden">
        <v-toolbar
          color="primary"
          density="compact"
          class="text-white px-4"
        >
          <v-toolbar-title class="font-weight-bold text-subtitle-1 d-flex align-center">
            <v-icon
              icon="mdi-file-document-box-multiple-outline"
              class="mr-2"
            />
            Parte de Producción Diaria (PPD) - Módulo Técnico
          </v-toolbar-title>
          <v-spacer />
          <v-btn
            icon
            color="white"
            variant="text"
            @click="showReportModal = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text
          class="pa-6 bg-slate-50"
          style="max-height: 80vh;"
        >
          <PpdReportDocument
            v-if="showReportModal && reportSurveyData && reportSurveyData.id_survey"
            :survey-id="reportSurveyData.id_survey"
            :fecha="selectedRow?.fecha"
            :gantt-tasks="ganttTasks"
            @signed="handleReportSigned"
          />
        </v-card-text>

        <v-card-actions class="pa-4 bg-slate-100 border-top justify-end">
          <v-btn
            color="slate-600"
            variant="flat"
            class="text-white font-weight-bold rounded-lg"
            @click="showReportModal = false"
          >
            Cerrar Visualizador
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import apiAxios from '@/services/api'
import PpdReportDocument from './PpdReportDocument.vue'
import { useDisplay } from 'vuetify'

const { smAndDown } = useDisplay()

const props = defineProps({
  fechaDesde: String,
  fechaHasta: String,
  clienteId: [String, Number],
  proyectoId: [String, Number]
})

const ganttTasks = ref([])
const loadingTasks = ref(false)
const searchQuery = ref('')

const headers = [
  { title: '', key: 'data-table-expand' },
  { title: 'Fecha', key: 'fecha', sortable: true },
  { title: 'Cantidad Km', key: 'km', sortable: true },
  { title: 'Cámaras', key: 'camaras', sortable: true },
  { title: 'Acceso al informe', key: 'acciones', sortable: false }
]

const showReportModal = ref(false)
const selectedRow = ref(null)
const reportSurveyData = ref(null)
const ppdReports = ref([])
const loadingReports = ref(false)

// Utility functions
const toYmd = (v) => {
  if (!v) return ''
  const s = String(v).trim()
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (m) return `${m[1]}-${m[2]}-${m[3]}`
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

const getPdfUrlForReport = (item) => {
  if (!item || !item.fecha) return null
  const targetDate = toYmd(item.fecha)
  if (!targetDate) return null
  
  const tasks = ganttTasks.value || []
  for (const task of tasks) {
    let diarios = []
    if (Array.isArray(task.json_data)) {
      diarios = task.json_data
    } else if (typeof task.json_data === 'string') {
      try {
        diarios = JSON.parse(task.json_data)
      } catch {
        diarios = []
      }
    }
    if (!Array.isArray(diarios)) continue
    
    for (const entry of diarios) {
      const entryDate = toYmd(entry.fecha || entry.date || entry.dia || '')
      if (entryDate === targetDate) {
        const pdfName = entry.pdf || entry.pdf_name || entry.name_doc_interno
        if (pdfName) {
          const ARCHIVO_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://servidor.leanglobal.cl'
          return `${ARCHIVO_BASE_URL}/archivo/ppd/${pdfName}`
        }
      }
    }
  }
  return null
}

const normalizeText = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()

const toNumberSafe = (v) => {
  if (v === null || v === undefined) return 0
  const n = parseFloat(String(v).replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

const formatDateString = (dateStr) => {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }
  return dateStr
}

// Flat computed list of reported tasks per date (PPD Rows)
const ppdRows = computed(() => {
  const rows = []
  const tasks = ganttTasks.value || []
  const tasksMap = new Map(tasks.map((t) => [String(t.id_tarea), t]))

  const desde = toYmd(props.fechaDesde)
  const hasta = toYmd(props.fechaHasta)

  for (const task of tasks) {
    let diarios = task.json_data
    if (typeof diarios === 'string') {
      try {
        diarios = JSON.parse(diarios)
      } catch {
        diarios = []
      }
    }
    if (!Array.isArray(diarios)) continue

    const hierarchy = getTaskHierarchy(task, tasksMap)
    const contrato = hierarchy[0] || ''
    const nivel2 = hierarchy[1] || ''

    const segment = inferSegmentByTask(task)

    const taskResources = Array.isArray(task.recursos) ? task.recursos : []
    const equiposJson = parseRecursos(task.equipos_json)
    const taskPatrullas = dedupePatrullas([...taskResources, ...equiposJson])

    for (const entry of diarios) {
      const rawDate = entry.fecha || entry.date || entry.dia || ''
      if (!rawDate) continue

      const dateStr = toYmd(rawDate)
      if (!dateStr) continue

      const matchDesde = !desde || dateStr >= desde
      const matchHasta = !hasta || dateStr <= hasta
      if (!matchDesde || !matchHasta) continue

      const pkAvance = entry.pk_avance_diario ?? entry.pkAvanceDiario ?? entry.pk_avance ?? entry.pkAvance ?? ''
      const pkInicio = entry.pk_inicio ?? entry.pkInicio ?? entry.pk_ini ?? ''
      const pkFinal = entry.pk_final ?? entry.pk_fin ?? entry.pkFinal ?? ''
      const oleoducto = entry.oleoducto || ''
      const horasRealizadas = toNumberSafe(entry.horas_realizadas ?? entry.horasRealizadas ?? entry.totalHorasActividad ?? entry.real)
      const horasTraslado = toNumberSafe(entry.horas_traslado ?? entry.horasTraslado ?? 0)
      const lat = entry.latitud ?? entry.lat ?? null
      const lon = entry.longitud ?? entry.long ?? entry.lon ?? entry.lng ?? null

      const camarasRealizadasVal = entry.camaras_realizadas ?? entry.camarasRealizadas ?? ''
      const camarasSeleccionadas = Array.isArray(entry.camaras_seleccionadas)
        ? entry.camaras_seleccionadas
        : Array.isArray(entry.camarasSeleccionadas)
          ? entry.camarasSeleccionadas
          : []

      rows.push({
        idTarea: task.id_tarea,
        fecha: dateStr,
        codigoEdt: task.codigo_edt || '',
        partida: nivel2 || contrato || 'Sin partida',
        actividad: (segment === 'actividad' && (entry.actividad || entry.actividad_nombre)) ? (entry.actividad || entry.actividad_nombre) : (task.nombre_tarea || 'Sin actividad'),
        segment,
        patrullas: taskPatrullas.join(', ') || 'Sin patrulla',
        oleoducto: oleoducto || 'N/A',
        pkInicio,
        pkFinal,
        kmMantencion: pkAvance !== '' ? pkAvance : (pkInicio && pkFinal ? String(Math.abs(toNumberSafe(pkFinal) - toNumberSafe(pkInicio)) / 1000) : ''),
        camarasRealizadas: camarasRealizadasVal !== '' ? camarasRealizadasVal : (camarasSeleccionadas.length ? String(camarasSeleccionadas.length) : ''),
        horasRealizadas,
        horasTraslado,
        lat,
        lon,
        entry: {
          ...entry,
          total_calicatas_realizadas: entry.total_calicatas_realizadas ?? entry.totalCalicatasRealizadas ?? 0,
          reposicion_pilar: entry.reposicion_pilar ?? entry.reposicionPilar ?? 0,
          total_hitos_pintados: entry.total_hitos_pintados ?? entry.totalHitosPintados ?? 0,
          instalacion_senaletica_nueva: entry.instalacion_senaletica_nueva ?? entry.instalacionSenaleticaNueva ?? 0
        },
        task
      })
    }
  }

  return rows.sort((a, b) => {
    const dateCmp = b.fecha.localeCompare(a.fecha)
    if (dateCmp !== 0) return dateCmp
    return String(a.codigoEdt).localeCompare(String(b.codigoEdt))
  })
})

const getActivitiesForDate = (item) => {
  if (!item) return []
  const date = item.fecha
  const baseRows = ppdRows.value.filter((r) => r.fecha === date).map(r => ({ ...r }))

  const survey = item.survey
  if (survey && survey.body_exec) {
    const body = survey.body_exec || {}
    const tasksList = Array.isArray(body.tasks) ? body.tasks : []
    const manualTasks = tasksList.filter((t) => String(t.id_tarea).startsWith('__manual_n3__:'))
    
    for (const t of manualTasks) {
      if (baseRows.some(r => String(r.idTarea) === String(t.id_tarea))) continue

      const draft = body.ppd_web?.tasks?.[t.id_tarea] || {}
      const act = draft.actividad || {}

      const horasRealizadas = toNumberSafe(act.totalHorasActividad ?? act.real ?? 0)
      const horasTraslado = toNumberSafe(act.horasTraslado ?? 0)

      baseRows.push({
        idTarea: t.id_tarea,
        fecha: date,
        codigoEdt: t.codigo_edt || '',
        partida: t.contexto_nivel || t.contexto_contrato || 'Sin partida',
        actividad: act.actividad || t.actividad_nombre || t.nombre_tarea || 'Sin actividad',
        segment: 'actividad',
        patrullas: Array.isArray(draft.patrullas) ? draft.patrullas.join(', ') : (draft.patrullas || 'Sin patrulla'),
        oleoducto: act.oleoducto || 'N/A',
        pkInicio: act.pkInicio || '',
        pkFinal: act.pkFinal || '',
        kmMantencion: act.pkAvanceDiario !== '' ? act.pkAvanceDiario : (act.pkInicio && act.pkFinal ? String(Math.abs(toNumberSafe(act.pkFinal) - toNumberSafe(act.pkInicio)) / 1000) : ''),
        camarasRealizadas: '',
        horasRealizadas,
        horasTraslado,
        lat: draft.lat || null,
        lon: draft.lon || null,
        entry: {
          ...act,
          total_calicatas_realizadas: act.totalCalicatasRealizadas ?? 0,
          reposicion_pilar: act.reposicionPilar ?? 0,
          total_hitos_pintados: act.totalHitosPintados ?? 0,
          instalacion_senaletica_nueva: act.instalacionSenaleticaNueva ?? 0,
          observacion: act.observaciones || ''
        },
        task: t
      })
    }
  }

  return baseRows
}

// Helpers for resource and patrol parsing
const parseRecursos = (raw) => {
  const recursos = Array.isArray(raw)
    ? raw
    : typeof raw === 'string'
      ? (() => {
          try {
            const parsed = JSON.parse(raw)
            return Array.isArray(parsed) ? parsed : []
          } catch {
            return []
          }
        })()
      : []
  return recursos.map((r) => String(r?.nombre_excel || '').trim()).filter(Boolean)
}

const normalizePatrullaName = (value) => String(value ?? '').trim()

const dedupePatrullas = (items) => {
  const seen = new Set()
  const out = []
  for (const item of Array.isArray(items) ? items : []) {
    const nombre = normalizePatrullaName(item)
    if (!nombre) continue
    const key = normalizeText(nombre)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(nombre)
  }
  return out
}

const inferSegmentByTask = (task) => {
  if (String(task?.manualSegment || '').trim().toLowerCase() === 'actividad') return 'actividad'
  const text = normalizeText([
    task?.nombre_tarea ?? task?.nombreTarea,
    task?.contexto_contrato ?? task?.contextoContrato,
    task?.contexto_nivel ?? task?.contextoNivel,
    task?.codigo_edt ?? task?.codigoEdt
  ].filter(Boolean).join(' '))
  if (!text) return 'servidumbre'

  if (/(otros|otras)/.test(text)) return 'actividad'

  const isCamara = /(camara|camaras|cámara|cámaras)/.test(text)
  const isServidumbre = /(servidumbre|desmalezado|acceso|porton|portón|senalet|señalet|pk)/.test(text)

  if (isCamara && !isServidumbre) return 'camaras'
  if (isCamara && isServidumbre) return 'camaras'
  if (isServidumbre) return 'servidumbre'
  return 'servidumbre'
}

const getTaskHierarchy = (task, tasksMap) => {
  const visited = new Set()
  let current = task
  const names = []
  let guard = 0
  while (current && guard < 10) {
    guard++
    const key = String(current.id_tarea ?? '')
    if (!key || visited.has(key)) break
    visited.add(key)
    const name = String(current.nombre_tarea ?? '').trim()
    if (name) names.unshift(name)
    const parentId = current.id_tarea_padre
    if (parentId === null || parentId === undefined || parentId === '') break
    current = tasksMap.get(String(parentId))
  }
  return names
}

async function loadGanttTasks() {
  try {
    if (!props.proyectoId) {
      ganttTasks.value = []
      return
    }
    loadingTasks.value = true
    const response = await apiAxios.get('/servicio/leanglobal/obtenerGanttsTareasV3', {
      params: {
        id_proyecto: Number(props.proyectoId)
      }
    })
    ganttTasks.value = response.data?.datos ?? response.data ?? []
  } catch (err) {
    console.error('Error loading tasks for PPD table:', err)
  } finally {
    loadingTasks.value = false
  }
}

async function loadPpdReports() {
  try {
    loadingReports.value = true
    ppdReports.value = []

    const desde = toYmd(props.fechaDesde)
    const hasta = toYmd(props.fechaHasta)
    if (!desde || !hasta || !props.proyectoId) return

    const params = {
      fecha_desde: desde,
      fecha_hasta: hasta,
      'ts.id_empresa_cliente': props.clienteId || '',
      'ts.id_proyecto': props.proyectoId,
      'ts.id_template': 87
    }

    const { data } = await apiAxios.get('/servicio/leanglobal/procesosSurveyV3', { params })
    const list = data?.datos ?? data ?? []
    const ppdSurveys = list.filter((s) => Number(s.id_template) === 87)

    const details = await Promise.all(
      ppdSurveys.map(async (survey) => {
        try {
          const detailResp = await apiAxios.get(`/servicio/leanglobal/procesosSurveyDetail?id_survey=${survey.id_survey}`)
          const detailRows = detailResp.data?.datos ?? detailResp.data ?? []
          const detail = detailRows[0] || survey

          let bodyExec = detail.body_exec
          if (typeof bodyExec === 'string') {
            try {
              bodyExec = JSON.parse(bodyExec)
            } catch {
              bodyExec = {}
            }
          }
          detail.body_exec = bodyExec
          return detail
        } catch (err) {
          console.error(`Error loading detail for survey ${survey.id_survey}:`, err)
          return null
        }
      })
    )

    const validDetails = details.filter(Boolean)
    const reportsMap = {}

    for (const detail of validDetails) {
      const fecha = toYmd(detail.fecha_plan_ini || detail.fecha_real_ini)
      if (!fecha) continue

      const acts = getActivitiesForDate({ fecha, survey: detail })
      let totalKm = 0
      let totalCamaras = 0
      for (const act of acts) {
        totalKm += toNumberSafe(act.kmMantencion)
        totalCamaras += toNumberSafe(act.camarasRealizadas)
      }
      
      const newReport = {
        idSurvey: detail.id_survey,
        fecha,
        km: totalKm.toFixed(3),
        camaras: totalCamaras,
        survey: detail
      }

      const existing = reportsMap[fecha]
      if (!existing || detail.id_survey > existing.idSurvey) {
        reportsMap[fecha] = newReport
      }
    }

    const reportsList = Object.values(reportsMap)
    reportsList.sort((a, b) => b.fecha.localeCompare(a.fecha))
    ppdReports.value = reportsList

  } catch (err) {
    console.error('Error loading PPD reports:', err)
  } finally {
    loadingReports.value = false
  }
}

function openReportModalFromReport(item) {
  selectedRow.value = { fecha: item.fecha }
  reportSurveyData.value = item.survey
  showReportModal.value = true
}

async function handleReportSigned() {
  await Promise.all([
    loadPpdReports(),
    loadGanttTasks()
  ])
}

const loadAllData = async () => {
  await loadGanttTasks()
  await loadPpdReports()
}

watch(
  [() => props.fechaDesde, () => props.fechaHasta, () => props.clienteId, () => props.proyectoId],
  () => {
    loadAllData()
  }
)

onMounted(() => {
  loadAllData()
})
</script>

<style scoped>
.ppd-data-table {
  background-color: #ffffff;
}
.ppd-data-table :deep(thead) {
  background-color: #f8fafc;
}
.text-slate-800 {
  color: #1e293b;
}
.text-slate-700 {
  color: #334155;
}
.text-slate-500 {
  color: #64748b;
}
.bg-slate-50 {
  background-color: #f8fafc;
}
.border {
  border: 1px solid #e2e8f0 !important;
}
</style>
