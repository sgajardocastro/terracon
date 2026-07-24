<template>
  <div class="sonacol-servidumbre-dashboard mt-4">
    <!-- Top Row: Map & S-Curve -->
    <v-row dense>
      <!-- Map Section -->
      <v-col
        cols="12"
        md="6"
      >
        <v-card
          class="pa-3 fill-height-card"
          elevation="2"
        >
          <div class="d-flex align-center mb-3">
            <v-icon
              icon="mdi-map-marker-radius"
              color="primary"
              class="mr-2"
            />
            <span class="text-subtitle-1 font-weight-bold text-slate-800">Ubicaciones PPD</span>
          </div>
          <div class="map-wrapper">
            <Mapa ref="mapRef" />
          </div>
        </v-card>
      </v-col>

      <!-- S-Curve Section -->
      <v-col
        cols="12"
        md="6"
      >
        <v-card
          class="pa-3 fill-height-card"
          elevation="2"
        >
          <div class="d-flex align-center justify-space-between mb-3">
            <div class="d-flex align-center">
              <v-icon
                icon="mdi-chart-line"
                color="primary"
                class="mr-2"
              />
              <span class="text-subtitle-1 font-weight-bold text-slate-800">Curva S Plan / Real (Gantt)</span>
            </div>
            <!-- Month Selector -->
            <v-select
              v-model="selectedMonth"
              :items="monthOptions"
              label="Filtrar por Mes"
              density="compact"
              variant="outlined"
              hide-details
              style="max-width: 160px"
              class="month-selector"
            />
          </div>
          <div class="chart-wrapper">
            <div
              v-show="selectedMonth === 'ALL'"
              ref="columnChartContainer"
              class="column-chart-container"
            />
            <CurvaSV2
              v-show="selectedMonth !== 'ALL'"
              ref="curvaRef"
            />
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Bottom Row: Indicators & Bar Chart -->
    <v-row
      dense
      class="mt-3"
    >
      <!-- Indicators Section -->
      <v-col
        cols="12"
        md="6"
      >
        <v-card
          class="pa-4 h-100"
          elevation="2"
        >
          <div class="d-flex align-center mb-4">
            <v-icon
              icon="mdi-gauge"
              color="primary"
              class="mr-2"
            />
            <span class="text-subtitle-1 font-weight-bold text-slate-800">Indicadores de Gestión</span>
          </div>

          <v-row dense>
            <!-- Card 1: Servidumbre -->
            <v-col
              cols="12"
              sm="6"
            >
              <div class="kpi-card servidumbre">
                <div class="kpi-title text-blue">
                  MANTENCIÓN DE SERVIDUMBRE
                </div>
                <div class="kpi-items">
                  <div class="kpi-item">
                    <span class="kpi-val">{{ formatNumber(kpiStats.serv.actividades) }}</span>
                    <span class="kpi-lbl">ACTIVIDADES</span>
                  </div>
                  <div class="kpi-item">
                    <span class="kpi-val">{{ formatHours(kpiStats.serv.horas) }}</span>
                    <span class="kpi-lbl">HORAS</span>
                  </div>
                  <div class="kpi-item">
                    <span class="kpi-val">{{ formatNumber(kpiStats.serv.km, 2) }}</span>
                    <span class="kpi-lbl">KM DE MANTENCIÓN</span>
                  </div>
                </div>
              </div>
            </v-col>

            <!-- Card 2: Cámaras -->
            <v-col
              cols="12"
              sm="6"
            >
              <div class="kpi-card camaras">
                <div class="kpi-title text-teal">
                  MANTENCIÓN DE CÁMARAS
                </div>
                <div class="kpi-items">
                  <div class="kpi-item">
                    <span class="kpi-val">{{ formatNumber(kpiStats.cam.actividades) }}</span>
                    <span class="kpi-lbl">ACTIVIDADES</span>
                  </div>
                  <div class="kpi-item">
                    <span class="kpi-val">{{ formatHours(kpiStats.cam.horas) }}</span>
                    <span class="kpi-lbl">HORAS</span>
                  </div>
                  <div class="kpi-item">
                    <span class="kpi-val">{{ formatNumber(kpiStats.cam.realizadas) }}</span>
                    <span class="kpi-lbl">CÁMARAS REALIZADAS</span>
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>

          <v-row
            dense
            class="mt-3"
          >
            <!-- Card 3: Calicatas -->
            <v-col
              cols="12"
              sm="4"
            >
              <div class="kpi-card calicatas d-flex flex-column justify-center align-center">
                <div class="kpi-title text-amber text-center">
                  CALICATAS
                </div>
                <div class="kpi-val-large">
                  {{ formatNumber(kpiStats.calicatas) }}
                </div>
              </div>
            </v-col>

            <!-- Card 4: Traslado -->
            <v-col
              cols="12"
              sm="4"
            >
              <div class="kpi-card traslado d-flex flex-column justify-center align-center">
                <div class="kpi-title text-purple text-center">
                  HORAS DE TRASLADO
                </div>
                <div class="kpi-val-large">
                  {{ formatHours(kpiStats.horasTraslado) }}
                </div>
              </div>
            </v-col>

            <!-- Card 5: Señaléticas -->
            <v-col
              cols="12"
              sm="4"
            >
              <div class="kpi-card senaleticas">
                <div class="kpi-title text-slate">
                  SEÑALÉTICAS
                </div>
                <div class="kpi-items">
                  <div class="kpi-item">
                    <span class="kpi-val">{{ formatNumber(kpiStats.senaleticas.pilas) }}</span>
                    <span class="kpi-lbl">PILAR</span>
                  </div>
                  <div class="kpi-item">
                    <span class="kpi-val">{{ formatNumber(kpiStats.senaleticas.monolitos) }}</span>
                    <span class="kpi-lbl">MONOLITOS</span>
                  </div>
                  <div class="kpi-item">
                    <span class="kpi-val">{{ formatNumber(kpiStats.senaleticas.letreros) }}</span>
                    <span class="kpi-lbl">LETREROS NUEVOS</span>
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <!-- Bar Chart Section -->
      <v-col
        cols="12"
        md="6"
      >
        <v-card
          class="pa-4 h-100"
          elevation="2"
        >
          <div
            ref="barChartContainer"
            class="bar-chart-container"
          />
        </v-card>
      </v-col>
    </v-row>

    <!-- Tabular View Section (PPDs) -->
    <v-row
      dense
      class="mt-3"
    >
      <v-col cols="12">
        <v-card
          class="pa-4"
          elevation="2"
        >
          <div class="d-flex align-center justify-space-between mb-4 flex-wrap gap-2">
            <div class="d-flex align-center">
              <v-icon
                icon="mdi-table-large"
                color="primary"
                class="mr-2"
              />
              <span class="text-subtitle-1 font-weight-bold text-slate-800">Partes de Producción Diaria (PPD)</span>
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
            />
          </div>

          <v-data-table
            :headers="headers"
            :items="ppdReports"
            :search="searchQuery"
            density="comfortable"
            class="ppd-data-table border rounded"
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
                class="font-weight-bold px-4"
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
                class="font-weight-bold px-4 ml-2 text-white"
                :href="getPdfUrlForReport(item)"
                target="_blank"
              >
                Ver PDF
              </v-btn>
            </template>

            <!-- Expanded row slot to show nested list of activities (resumen de actividades) -->
            <template #expanded-row="{ columns, item }">
              <tr>
                <td
                  :colspan="columns.length"
                  class="bg-slate-50 pa-4"
                >
                  <v-card
                    variant="outlined"
                    class="border rounded-lg bg-white overflow-hidden"
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

    <!-- Dialog for Leaflet Mini Map -->
    <v-dialog
      v-model="showGeoDialog"
      max-width="500"
    >
      <v-card class="pa-4 rounded-lg">
        <div class="d-flex justify-space-between align-center mb-3">
          <span class="text-subtitle-1 font-weight-bold text-slate-800 d-flex align-center">
            <v-icon
              icon="mdi-map-marker"
              color="error"
              class="mr-1"
            />
            Ubicación del Registro PPD
          </span>
          <v-btn
            icon
            variant="text"
            size="small"
            @click="showGeoDialog = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <div
          id="geo-mini-map"
          class="border rounded-lg"
          style="height: 350px; width: 100%;"
        />
        <div class="text-caption text-slate-500 mt-2 text-center">
          Coordenadas: {{ selectedGeo.lat?.toFixed(6) }}, {{ selectedGeo.lon?.toFixed(6) }}
        </div>
      </v-card>
    </v-dialog>

    <!-- Premium Modal for PPD Document Visualizer -->
    <v-dialog
      v-model="showReportModal"
      max-width="1000"
      scrollable
    >
      <v-card class="rounded-xl overflow-hidden">
        <v-toolbar
          color="primary"
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
            class="text-white"
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
import { ref, onMounted, watch, nextTick, onBeforeUnmount, computed } from 'vue'
import apiAxios from '@/services/api'
import Mapa from './Mapa.vue'
import CurvaSV2 from './CurvaSV2.vue'
import Highcharts from 'highcharts'
import PpdReportDocument from './PpdReportDocument.vue'


const reportVersion = ref('v2')

const props = defineProps({
  fechaDesde: { type: String, default: '' },
  fechaHasta: { type: String, default: '' },
  clienteId: { type: [Number, String], default: '' },
  proyectoId: { type: [Number, String], default: '' }
})

const mapRef = ref(null)
const curvaRef = ref(null)
const barChartContainer = ref(null)
const columnChartContainer = ref(null)

let barChartInstance = null
let columnChartInstance = null
const selectedMonth = ref('ALL')

const monthOptions = [
  { title: 'Año completo', value: 'ALL' },
  { title: 'Enero', value: '0' },
  { title: 'Febrero', value: '1' },
  { title: 'Marzo', value: '2' },
  { title: 'Abril', value: '3' },
  { title: 'Mayo', value: '4' },
  { title: 'Junio', value: '5' },
  { title: 'Julio', value: '6' },
  { title: 'Agosto', value: '7' },
  { title: 'Septiembre', value: '8' },
  { title: 'Octubre', value: '9' },
  { title: 'Noviembre', value: '10' },
  { title: 'Diciembre', value: '11' }
]

const surveys = ref([])
const ganttRows = ref([])
const ganttTasks = ref([])
const loadingTasks = ref(false)
const searchQuery = ref('')



// Headers for the v-data-table (Fecha, Km, Cámaras, Acceso al informe)
const headers = [
  { title: '', key: 'data-table-expand' },
  { title: 'Fecha', key: 'fecha', sortable: true },
  { title: 'Cantidad Km', key: 'km', sortable: true },
  { title: 'Cámaras', key: 'camaras', sortable: true },
  { title: 'Acceso al informe', key: 'acciones', sortable: false }
]

// Modal & Map States
const showGeoDialog = ref(false)
const selectedGeo = ref({ lat: null, lon: null })
let miniMapInstance = null

const showReportModal = ref(false)
const selectedRow = ref(null)
const loadingReportSurvey = ref(false)
const reportSurveyData = ref(null)
const flowStepsActuales = ref([])

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

// --- OSM embed map helper ---
// Usa el endpoint de embed de OpenStreetMap que no tiene restricciones de CORS ni referrer


const osmEmbedUrl = (lat, lon) => {
  const delta = 0.005 // bbox ~500m alrededor del punto
  const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`
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

const formatNumber = (num, decimals = 0) => {
  const value = toNumberSafe(num)
  return value.toLocaleString('es-CL', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

const formatHours = (hours) => {
  const value = toNumberSafe(hours)
  if (value >= 1000) {
    return (value / 1000).toLocaleString('es-CL', { maximumFractionDigits: 1 }) + 'k'
  }
  return value.toLocaleString('es-CL', { maximumFractionDigits: 0 })
}

const formatDateString = (dateStr) => {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }
  return dateStr
}

const formatDateLong = (dateStr) => {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length === 3) {
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ]
    const day = parseInt(parts[2], 10)
    const month = months[parseInt(parts[1], 10) - 1]
    const year = parts[0]
    return `${day} de ${month} de ${year}`
  }
  return dateStr
}



const geoActivities = computed(() => {
  const list = []
  const rows = selectedDateRows.value || []
  for (const r of rows) {
    if (r.lat && r.lon) {
      let label = 'Actividad'
      if (r.segment === 'servidumbre') label = 'Mantención'
      else if (r.segment === 'camaras') label = 'Cámaras'
      else if (r.segment === 'actividad') {
        label = r.actividad.split(' ').slice(0, 2).join(' ')
      }
      list.push({
        lat: Number(r.lat),
        lon: Number(r.lon),
        label
      })
    }
  }
  return list
})

const isOleoducto = (val, type) => {
  if (!val) return false
  const clean = normalizeText(val)
  if (type === 'maa') {
    return clean.includes('maa') || clean.includes('amb')
  }
  return clean.includes(type)
}

const getFirmaByRol = (rolName) => {
  const cleanRol = normalizeText(rolName)
  const hit = computedFirmas.value.find(f => {
    const cleanFirmaRol = normalizeText(f.rol)
    return cleanFirmaRol.includes(cleanRol)
  })
  return hit || null
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
    return a.codigoEdt.localeCompare(b.codigoEdt, 'es', { numeric: true })
  })
})


// Compute Dynamic KPIs
const kpiStats = computed(() => {
  const rows = ppdRows.value || []

  let servActividades = 0
  let servHoras = 0
  let servKm = 0

  let camActividades = 0
  let camHoras = 0
  let camRealizadas = 0

  let calicatas = 0
  let horasTraslado = 0

  let pilas = 0
  let monolitos = 0
  let letreros = 0

  for (const row of rows) {
    const entry = row.entry
    const hours = row.horasRealizadas

    horasTraslado += row.horasTraslado
    calicatas += toNumberSafe(entry.total_calicatas_realizadas ?? entry.totalCalicatasRealizadas)

    pilas += toNumberSafe(entry.reposicion_pilar ?? entry.reposicionPilar)
    monolitos += toNumberSafe(entry.total_hitos_pintados ?? entry.totalHitosPintados)
    letreros += toNumberSafe(entry.instalacion_senaletica_nueva ?? entry.instalacionSenaleticaNueva)

    if (row.segment === 'servidumbre') {
      servActividades++
      servHoras += hours
      servKm += toNumberSafe(row.kmMantencion)
    } else if (row.segment === 'camaras') {
      camActividades++
      camHoras += hours
      camRealizadas += toNumberSafe(row.camarasRealizadas)
    }
  }

  return {
    serv: {
      actividades: servActividades,
      horas: servHoras,
      km: servKm
    },
    cam: {
      actividades: camActividades,
      horas: camHoras,
      realizadas: camRealizadas
    },
    calicatas,
    horasTraslado,
    senaleticas: {
      pilas,
      monolitos,
      letreros
    }
  }
})

// Other Activities category map & dynamic series
const categoryMapping = {
  'senaletica': 'SEÑALÉTICAS',
  'trabajos adicionales servidumbre': 'TRABAJOS ADICIONALES SERVIDUMBRE',
  'apoyo recorrido inspeccion': 'APOYO RECORRIDO INSPECCIÓN',
  'retiro y entrega de materiales/herramientas': 'RETIRO Y ENTREGA MATERIALES',
  'marcacion de oleoducto': 'MARCACIÓN DE OLEODUCTOS',
  'apoyo conejeo': 'APOYO A CONEJO',
  'reunion': 'REUNIÓN',
  'capacitaciones o cursos': 'CAPACITACIONES O CURSOS',
  'calicatas': 'CALICATAS',
  'control de erosiones': 'CONTROL DE EROSIONES',
  'mantencion de camionetas': 'MANTENCIÓN DE CAMIONETA',
  'limpieza canal interior y exterior planta curacavi': 'LIMPIEZA CANAL CURACAVÍ',
  'mantencion de porton': 'MANTENCIÓN DE PORTÓN',
  'mantencion de accesos servidumbre': 'MANTENCIÓN ACCESOS',
  'corte y retiro linea fuera de servicio': 'CORTE Y RETIRO LÍNEAS F.S.',
  'apoyo servidumbre renaca alto': 'APOYO REÑACA ALTO',
  'mantencion de empalmes rectificadores y remoto': 'MANTENCIÓN EMPALMES'
}

const getCategoryForTask = (task) => {
  const actName = normalizeText(task.actividad_nombre || task.nombre_tarea || '')
  for (const [key, categoryName] of Object.entries(categoryMapping)) {
    if (actName.includes(key) || key.includes(actName)) {
      return categoryName
    }
  }
  const txt = normalizeText(task.nombre_tarea || '')
  if (txt.includes('camara') || txt.includes('cámara')) return null
  if (txt.includes('servidumbre') && !txt.includes('adicionales')) return null

  for (const [key, categoryName] of Object.entries(categoryMapping)) {
    if (txt.includes(key)) return categoryName
  }
  return null
}

const barChartData = computed(() => {
  const counts = {
    'SEÑALÉTICAS': 0,
    'TRABAJOS ADICIONALES SERVIDUMBRE': 0,
    'APOYO RECORRIDO INSPECCIÓN': 0,
    'RETIRO Y ENTREGA MATERIALES': 0,
    'MARCACIÓN DE OLEODUCTOS': 0,
    'APOYO A CONEJO': 0,
    'REUNIÓN': 0,
    'CAPACITACIONES O CURSOS': 0,
    'CALICATAS': 0,
    'CONTROL DE EROSIONES': 0,
    'MANTENCIÓN DE CAMIONETA': 0,
    'LIMPIEZA CANAL CURACAVÍ': 0,
    'MANTENCIÓN DE PORTÓN': 0,
    'MANTENCIÓN ACCESOS': 0,
    'CORTE Y RETIRO LÍNEAS F.S.': 0,
    'APOYO REÑACA ALTO': 0,
    'MANTENCIÓN EMPALMES': 0
  }

  const rows = ppdRows.value || []
  for (const row of rows) {
    if (row.horasRealizadas > 0) {
      const cat = getCategoryForTask(row.task)
      if (cat && counts[cat] !== undefined) {
        counts[cat]++
      }
    }
  }

  const categoriesOrder = [
    'SEÑALÉTICAS',
    'TRABAJOS ADICIONALES SERVIDUMBRE',
    'APOYO RECORRIDO INSPECCIÓN',
    'RETIRO Y ENTREGA MATERIALES',
    'MARCACIÓN DE OLEODUCTOS',
    'APOYO A CONEJO',
    'REUNIÓN',
    'CAPACITACIONES O CURSOS',
    'CALICATAS',
    'CONTROL DE EROSIONES',
    'MANTENCIÓN DE CAMIONETA',
    'LIMPIEZA CANAL CURACAVÍ',
    'MANTENCIÓN DE PORTÓN',
    'MANTENCIÓN ACCESOS',
    'CORTE Y RETIRO LÍNEAS F.S.',
    'APOYO REÑACA ALTO',
    'MANTENCIÓN EMPALMES'
  ]

  return categoriesOrder.map((cat) => counts[cat])
})

// Details dialog computed values
const selectedDateRows = computed(() => {
  if (!selectedRow.value) return []
  const baseRows = ppdRows.value.filter((r) => r.fecha === selectedRow.value.fecha)

  const survey = reportSurveyData.value
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
        fecha: selectedRow.value.fecha,
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

  return baseRows.sort((a, b) => a.codigoEdt.localeCompare(b.codigoEdt, 'es', { numeric: true }))
})

const uniqueOleoductos = computed(() => {
  const list = selectedDateRows.value.map((r) => r.oleoducto).filter((o) => o && o !== 'N/A')
  return [...new Set(list)].join(', ') || 'N/A'
})

const uniquePatrullas = computed(() => {
  const list = selectedDateRows.value.map((r) => r.patrullas).filter((p) => p && p !== 'Sin patrulla')
  return [...new Set(list)].join(', ') || 'Sin patrulla'
})

const reportObservations = computed(() => {
  for (const row of selectedDateRows.value) {
    const obs = row.entry?.observacion ?? row.entry?.observaciones
    if (obs) return obs
  }
  return ''
})

const firmasHistorial = computed(() => {
  let raw = reportSurveyData.value?.approval_exec
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw)
    } catch {
      raw = []
    }
  }
  const arr = Array.isArray(raw) ? raw : []
  return arr.map((it) => it?.firma ?? it).filter((f) => f && (f.nombre || f.rut))
})

function findFirmaByStep(step, historial) {
  return (historial || [])
    .slice()
    .reverse()
    .find(
      (h) =>
        String(h?.rol || '').trim().toUpperCase() === String(step?.name_rol || '').trim().toUpperCase() ||
        (Number.isFinite(Number(h?.id_user)) && Number(h?.id_user) === Number(step?.id_user))
    ) || null
}

const computedFirmas = computed(() => {
  const historial = firmasHistorial.value
  const steps = flowStepsActuales.value || []
  if (!steps.length) {
    return [
      { rol: 'SUPERVISOR', nombre: 'Sin registrar', rut: '—', aprueba_rechaza: 'PENDIENTE', fecha: '—' },
      { rol: 'CONTROL Y PLANIFICACIÓN', nombre: 'Sin registrar', rut: '—', aprueba_rechaza: 'PENDIENTE', fecha: '—' },
      { rol: 'ADMINISTRADOR DE CONTRATO', nombre: 'Sin registrar', rut: '—', aprueba_rechaza: 'PENDIENTE', fecha: '—' }
    ]
  }
  return steps.map((st) => {
    const hit = findFirmaByStep(st, historial)
    const estado = hit?.aprueba_rechaza
      ? String(hit.aprueba_rechaza).toUpperCase()
      : String(st?.estado || 'PENDIENTE').toUpperCase()
    return {
      rol: st?.name_rol ?? 'Sin asignar',
      nombre: hit?.nombre ?? st?.nombre_user ?? 'Sin registrar',
      rut: hit?.rut ?? '—',
      fecha: hit?.fecha ? formatDateString(hit.fecha.slice(0, 10)) : '—',
      aprueba_rechaza: estado
    }
  })
})

const calculateSurveyTotals = (detail) => {
  let totalKm = 0
  let totalCamaras = 0

  const body = detail.body_exec || {}
  const tasksMap = body.ppd_web?.tasks || {}

  for (const draft of Object.values(tasksMap)) {
    if (!draft) continue
    
    const act = draft.actividad
    const cm = Array.isArray(draft.camaraMantencion) ? draft.camaraMantencion[0] : null
    const pm = Array.isArray(draft.primeraMantencion) ? draft.primeraMantencion[0] : null

    const isAct = act && (act.totalHorasActividad || act.pkAvanceDiario || act.camarasRealizadas || act.observaciones || act.actividad)
    const isCam = cm && (cm.horasPlanificadas || cm.camarasRealizadas || (Array.isArray(cm.camarasSeleccionadas) && cm.camarasSeleccionadas.length > 0))
    const isServ = pm && (pm.horasPlanificadas || pm.pkAvanceDiario)

    if (isAct) {
      const isCamaraAct = /(camara|camaras|cámara|cámaras)/i.test(String(act.actividad || ''))
      if (isCamaraAct) {
        if (Array.isArray(act.camarasSeleccionadas) && act.camarasSeleccionadas.length > 0) {
          totalCamaras += act.camarasSeleccionadas.length
        } else if (act.camarasRealizadas) {
          totalCamaras += toNumberSafe(act.camarasRealizadas)
        }
      } else {
        if (act.pkAvanceDiario) {
          totalKm += toNumberSafe(act.pkAvanceDiario)
        } else if (act.pkInicio && act.pkFinal) {
          totalKm += Math.abs(toNumberSafe(act.pkFinal) - toNumberSafe(act.pkInicio)) / 1000
        }
      }
    } else if (isCam) {
      if (Array.isArray(cm.camarasSeleccionadas) && cm.camarasSeleccionadas.length > 0) {
        totalCamaras += cm.camarasSeleccionadas.length
      } else if (cm.camarasRealizadas) {
        totalCamaras += toNumberSafe(cm.camarasRealizadas)
      }
    } else if (isServ) {
      if (pm.pkAvanceDiario) {
        totalKm += toNumberSafe(pm.pkAvanceDiario)
      }
    }
  }

  return { km: totalKm, camaras: totalCamaras }
}

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

  if (item.survey?.id_flow) {
    flowStepsActuales.value = []
    apiAxios.get(`/servicio/leanglobal/flujosAprobacionSteps?id_flow=${item.survey.id_flow}`)
      .then(({ data: steps }) => {
        flowStepsActuales.value = Array.isArray(steps)
          ? [...steps].sort(
              (a, b) =>
                Number(a?.flow_tmpl_step_orden ?? Number.MAX_SAFE_INTEGER) -
                Number(b?.flow_tmpl_step_orden ?? Number.MAX_SAFE_INTEGER)
            )
          : []
      })
      .catch(err => console.error(err))
  }
}

// Load PPD Points for the map & store Tasks
async function loadMapPoints() {
  try {
    if (!props.proyectoId) {
      mapRef.value?.setPuntos([])
      ganttTasks.value = []
      return
    }
    loadingTasks.value = true
    const response = await apiAxios.get('/servicio/leanglobal/obtenerGanttsTareasV3', {
      params: {
        id_proyecto: Number(props.proyectoId)
      }
    })
    const list = response.data?.datos ?? response.data ?? []
    ganttTasks.value = list
    
    const points = []
    const desde = toYmd(props.fechaDesde)
    const hasta = toYmd(props.fechaHasta)
    
    for (const task of list) {
      let diarios = task.json_data
      if (typeof diarios === 'string') {
        try {
          diarios = JSON.parse(diarios)
        } catch {
          diarios = []
        }
      }
      if (!Array.isArray(diarios)) continue
      
      for (const item of diarios) {
        if (item && item.latitud && item.longitud) {
          const rawDate = item.fecha || item.date || item.dia || ''
          const dateStr = toYmd(rawDate)
          if (!dateStr) continue

          const matchDesde = !desde || dateStr >= desde
          const matchHasta = !hasta || dateStr <= hasta
          
          if (matchDesde && matchHasta) {
            points.push({
              latitud: item.latitud,
              longitud: item.longitud,
              estado_color: 'rojo', // render as red dots
              id_survey: task.id_tarea,
              nombre_area: task.nombre_tarea || ''
            })
          }
        }
      }
    }
    
    console.log('[DashboardSonacol] Loaded PPD map points:', points.length)
    surveys.value = points
    mapRef.value?.setPuntos(points)
  } catch (err) {
    console.error('[DashboardSonacol] Error al obtener puntos del mapa desde Gantt V3:', err)
  } finally {
    loadingTasks.value = false
  }
}

// Load Gantt Plan/Real Data for S-Curve
async function loadGanttData() {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerGanttPlanReal')
    ganttRows.value = Array.isArray(data) ? data : []
    updateSCurve()
  } catch (err) {
    console.error('[DashboardSonacol] Error al obtener datos Gantt:', err)
  }
}

// Initialize monthly column chart – cumulative (S-curve shape) with distinct color per month
function initMonthlyColumnChart() {
  if (!columnChartContainer.value) return

  // Calculate monthly totals first
  const monthlyData = Array.from({ length: 12 }, () => ({ plan: 0, real: 0 }))

  let filtered = ganttRows.value
  if (props.proyectoId) {
    filtered = ganttRows.value.filter(r => Number(r.id_proyecto ?? r.proyecto_id ?? 0) === Number(props.proyectoId))
  }

  for (const r of filtered) {
    const dateStr = r.fecha_registro || r.fecha
    if (!dateStr) continue
    const d = new Date(dateStr)
    const m = d.getMonth()
    if (m >= 0 && m < 12) {
      monthlyData[m].plan += Number(r.unidades_planificadas ?? 0) || 0
      monthlyData[m].real += Number(r.unidades_reales ?? 0) || 0
    }
  }

  const categories = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

  let accPlan = 0
  let accReal = 0
  const planSeries = monthlyData.map((v, i) => ({
    y: (accPlan += v.plan),
    name: categories[i]
  }))
  accPlan = 0
  const realSeries = monthlyData.map((v, i) => ({
    y: (accReal += v.real),
    name: categories[i]
  }))

  if (columnChartInstance) {
    columnChartInstance.destroy()
  }

  columnChartInstance = Highcharts.chart(columnChartContainer.value, {
    chart: {
      type: 'column',
      height: 350,
      backgroundColor: 'transparent',
      style: { fontFamily: 'Inter, Roboto, sans-serif' }
    },
    title: { text: null },
    xAxis: {
      categories,
      labels: {
        style: { fontSize: '11px', fontWeight: '600', color: '#475569' }
      }
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Acumulado de Actividades',
        style: { fontSize: '11px', fontWeight: '600', color: '#475569' }
      },
      gridLineDashStyle: 'ShortDash'
    },
    tooltip: {
      shared: true,
      headerFormat: '<span style="font-size:12px; font-weight:bold;">{point.key}</span><br/>',
      pointFormat: '<span style="color:{series.color}">\u25CF</span> {series.name}: <b>{point.y:.0f}</b><br/>'
    },
    plotOptions: {
      column: {
        borderRadius: 5,
        groupPadding: 0.08,
        dataLabels: {
          enabled: true,
          style: { fontSize: '9px', fontWeight: 'bold', color: '#1e293b' },
          formatter() { return this.y > 0 ? Highcharts.numberFormat(this.y, 0) : '' }
        }
      }
    },
    credits: { enabled: false },
    series: [
      {
        name: 'Planificado (acum.)',
        data: planSeries,
        color: '#38bdf8', // Celeste / Azul claro
        opacity: 0.7
      },
      {
        name: 'Ejecutado (acum.)',
        data: realSeries,
        color: '#6366f1', // Indigo / Azul oscuro
        opacity: 1.0
      }
    ]
  })
}

// Process S-Curve data based on selected month
function updateSCurve() {
  if (!ganttRows.value.length) return

  if (selectedMonth.value === 'ALL') {
    nextTick(() => {
      initMonthlyColumnChart()
    })
  } else {
    // Specific month
    let filtered = ganttRows.value
    if (props.proyectoId) {
      filtered = ganttRows.value.filter(r => Number(r.id_proyecto ?? r.proyecto_id ?? 0) === Number(props.proyectoId))
    }

    // Sort by date
    filtered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.fecha_registro ?? a.fecha)
      const dateB = new Date(b.fecha_registro ?? b.fecha)
      return dateA - dateB
    })

    const monthIdx = Number(selectedMonth.value)
    const year = 2026
    const numDays = new Date(year, monthIdx + 1, 0).getDate()
    const dailyData = Array.from({ length: numDays }, () => ({ plan: 0, real: 0 }))

    for (const r of filtered) {
      const dateStr = r.fecha_registro || r.fecha
      if (!dateStr) continue
      const d = new Date(dateStr)
      if (d.getMonth() === monthIdx) {
        const day = d.getDate() - 1
        if (day >= 0 && day < numDays) {
          dailyData[day].plan += Number(r.unidades_planificadas ?? 0) || 0
          dailyData[day].real += Number(r.unidades_reales ?? 0) || 0
        }
      }
    }

    const categories = Array.from({ length: numDays }, (_, i) => String(i + 1))
    let accPlan = 0
    let accReal = 0
    const plan = dailyData.map(v => (accPlan += v.plan))
    const real = dailyData.map(v => (accReal += v.real))

    const fridays = []
    const ticks = [0] // Siempre marcar día 1 (índice 0)
    for (let day = 1; day <= numDays; day++) {
      const date = new Date(year, monthIdx, day)
      if (date.getDay() === 5) { // 5 is Friday
        fridays.push(day - 1)
        ticks.push(day - 1)
      }
    }
    // Siempre marcar el último día del mes (índice numDays - 1)
    if (!ticks.includes(numDays - 1)) {
      ticks.push(numDays - 1)
    }
    ticks.sort((a, b) => a - b)

    curvaRef.value?.setSeries({ categories, plan, real, fridays, ticks })
  }
}

// Initialize horizontal bar chart for other activities
function initBarChart() {
  if (!barChartContainer.value) return

  const initialData = [...barChartData.value]
  const isAllZeros = initialData.every(v => v === 0)
  const seriesData = isAllZeros ? [4, 2, 5, 3, 1, 2, 4, 3, 2, 1, 3, 2, 2, 1, 3, 1, 2] : initialData
  const seriesName = isAllZeros ? 'Ejemplo (Sin datos en el rango)' : 'Actividades Realizadas'

  barChartInstance = Highcharts.chart(barChartContainer.value, {
    chart: {
      type: 'bar',
      height: 480,
      backgroundColor: 'transparent',
      style: {
        fontFamily: 'Inter, Roboto, sans-serif'
      }
    },
    title: {
      text: 'OTRAS ACTIVIDADES<br/><span style="font-size: 11px; color: #64748b; font-weight: normal; text-transform: uppercase;">Total de Actividades Realizadas</span>',
      align: 'center',
      useHTML: true,
      style: {
        fontWeight: 'bold',
        fontSize: '15px',
        color: '#1e293b'
      }
    },
    xAxis: {
      categories: [
        'SEÑALÉTICAS',
        'TRABAJOS ADICIONALES SERVIDUMBRE',
        'APOYO RECORRIDO INSPECCIÓN',
        'RETIRO Y ENTREGA MATERIALES',
        'MARCACIÓN DE OLEODUCTOS',
        'APOYO A CONEJO',
        'REUNIÓN',
        'CAPACITACIONES O CURSOS',
        'CALICATAS',
        'CONTROL DE EROSIONES',
        'MANTENCIÓN DE CAMIONETA',
        'LIMPIEZA CANAL CURACAVÍ',
        'MANTENCIÓN DE PORTÓN',
        'MANTENCIÓN ACCESOS',
        'CORTE Y RETIRO LÍNEAS F.S.',
        'APOYO REÑACA ALTO',
        'MANTENCIÓN EMPALMES'
      ],
      labels: {
        style: {
          fontSize: '9px',
          fontWeight: '600',
          color: '#475569'
        }
      },
      gridLineWidth: 0
    },
    yAxis: {
      min: 0,
      title: {
        text: null
      },
      labels: {
        overflow: 'justify',
        style: {
          fontSize: '10px'
        }
      }
    },
    plotOptions: {
      bar: {
        dataLabels: {
          enabled: true,
          style: {
            fontSize: '10px',
            fontWeight: 'bold',
            color: '#0f172a'
          }
        },
        borderRadius: 4,
        colorByPoint: true
      }
    },
    colors: [
      '#0284c7', '#0ea5e9', '#38bdf8', '#0d9488', '#14b8a6',
      '#f59e0b', '#eab308', '#64748b', '#475569', '#334155',
      '#78716c', '#854d0e', '#a21caf', '#be185d', '#b91c1c',
      '#c2410c', '#1e293b'
    ],
    credits: {
      enabled: false
    },
    legend: {
      enabled: false
    },
    series: [{
      name: seriesName,
      data: seriesData
    }]
  })
}

// Dialog Actions




function printReport() {
  window.print()
}

// Watch filters to reload data
watch(() => [props.fechaDesde, props.fechaHasta, props.clienteId, props.proyectoId], () => {
  loadMapPoints()
  ganttRows.value = []
  loadGanttData()
  loadPpdReports()
})

// Watch ppdRows to keep ppdReports totals in sync with detail rows
watch(ppdRows, () => {
  if (!ppdReports.value || ppdReports.value.length === 0) return
  for (const report of ppdReports.value) {
    const acts = getActivitiesForDate({ fecha: report.fecha, survey: report.survey })
    let totalKm = 0
    let totalCamaras = 0
    for (const act of acts) {
      totalKm += toNumberSafe(act.kmMantencion)
      totalCamaras += toNumberSafe(act.camarasRealizadas)
    }
    report.km = totalKm.toFixed(3)
    report.camaras = totalCamaras
  }
}, { deep: true })

// Watch month selection for S-Curve
watch(selectedMonth, () => {
  updateSCurve()
})

const updateBarChartData = (dataVal) => {
  if (!barChartInstance) return
  const isAllZeros = dataVal.every(v => v === 0)
  if (isAllZeros) {
    const exampleData = [4, 2, 5, 3, 1, 2, 4, 3, 2, 1, 3, 2, 2, 1, 3, 1, 2]
    barChartInstance.series[0].update({
      name: 'Ejemplo (Sin datos en el rango)',
      data: exampleData
    })
  } else {
    barChartInstance.series[0].update({
      name: 'Actividades Realizadas',
      data: [...dataVal]
    })
  }
}

// Update chart series when data changes
watch(barChartData, (newVal) => {
  updateBarChartData(newVal)
}, { deep: true, immediate: true })

// Double guarantee: update bar chart when gantt tasks load
watch(ganttTasks, () => {
  updateBarChartData(barChartData.value)
}, { deep: true })

async function handleReportSigned() {
  await Promise.all([
    loadPpdReports(),
    loadMapPoints()
  ])
}

onMounted(async () => {
  await nextTick()
  initBarChart()
  await loadMapPoints()
  await loadGanttData()
  await loadPpdReports()

  // Delay map refresh slightly to ensure OL container size is computed correctly inside tabs
  setTimeout(() => {
    mapRef.value?.refreshMap()
  }, 400)

  const onResize = () => {
    barChartInstance?.reflow()
    mapRef.value?.refreshMap()
  }
  window.addEventListener('resize', onResize)
  onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize)
    if (barChartInstance) {
      barChartInstance.destroy()
    }
    if (miniMapInstance) {
      try {
        miniMapInstance.remove()
      } catch { /* ignorar */ }
      miniMapInstance = null
    }
  })
})
</script>

<style scoped>
.sonacol-servidumbre-dashboard {
  width: 100%;
}

.fill-height-card {
  display: flex;
  flex-direction: column;
}

.map-wrapper {
  flex-grow: 1;
  min-height: 350px;
}

.chart-wrapper {
  flex-grow: 1;
  min-height: 350px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.bar-chart-container {
  width: 100%;
  height: 480px;
}

/* Indicators Styling */
.kpi-card {
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  height: 100%;
  transition: all 0.3s ease;
  background: #ffffff;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
}

.kpi-card.servidumbre {
  border-left: 5px solid #0284c7;
  background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
}

.kpi-card.camaras {
  border-left: 5px solid #0d9488;
  background: linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%);
}

.kpi-card.calicatas {
  border-left: 5px solid #d97706;
  background: linear-gradient(135deg, #ffffff 0%, #fffbeb 100%);
  min-height: 140px;
}

.kpi-card.traslado {
  border-left: 5px solid #7c3aed;
  background: linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%);
  min-height: 140px;
}

.kpi-card.senaleticas {
  border-left: 5px solid #475569;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
}

.kpi-title {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
  text-transform: uppercase;
}

.text-blue { color: #0284c7; }
.text-teal { color: #0d9488; }
.text-amber { color: #d97706; }
.text-purple { color: #7c3aed; }
.text-slate { color: #475569; }

.kpi-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.kpi-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px dashed #e2e8f0;
  padding-bottom: 4px;
}

.kpi-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.kpi-val {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
}

.kpi-lbl {
  font-size: 10px;
  font-weight: 700;
  color: #64748b;
}

.kpi-val-large {
  font-size: 36px;
  font-weight: 900;
  color: #1e293b;
  margin-top: 10px;
}

/* Premium Table Styling */
.ppd-data-table {
  background-color: #ffffff;
}

.ppd-data-table :deep(thead) {
  background-color: #f8fafc;
}

.ppd-data-table :deep(th) {
  font-weight: 700 !important;
  color: #475569 !important;
  text-transform: uppercase;
  font-size: 11px !important;
  letter-spacing: 0.05em;
  border-bottom: 2px solid #e2e8f0 !important;
}

.ppd-data-table :deep(tbody tr:hover) {
  background-color: #f1f5f9 !important;
  transition: background-color 0.2s ease;
}

/* Document Modal styling */
.border-slate {
  border: 1px solid #cbd5e1 !important;
}

.uppercase-label {
  letter-spacing: 0.05em;
  font-size: 10px !important;
  text-transform: uppercase;
}

.meta-label {
  font-size: 10px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 2px;
}

.meta-value {
  font-size: 14px;
  line-height: 1.2;
}

/* Official Header formatting */
.ppd-official-header {
  display: grid;
  grid-template-columns: 200px 1fr 230px;
  border: 2px solid #0f172a;
  background-color: #ffffff;
}

.ppd-header-logo-col {
  padding: 16px;
  border-right: 2px solid #0f172a;
}

.logo-text {
  font-size: 18px;
  letter-spacing: 0.05em;
}

.ppd-header-title-col {
  padding: 16px;
  text-align: center;
  border-right: 2px solid #0f172a;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.ppd-doc-type {
  font-size: 10px;
  font-weight: 800;
  color: #64748b;
  letter-spacing: 0.1em;
}

.ppd-doc-title {
  font-size: 18px;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: 0.02em;
  margin: 4px 0;
}

.ppd-doc-subtitle {
  font-size: 12px;
  font-weight: 700;
  color: #475569;
}

.ppd-header-meta-col {
  padding: 12px 16px;
  font-size: 11px;
  color: #334155;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  background-color: #f8fafc;
}

/* Signatures details block */
.signature-section-row :deep(.v-card) {
  border: 1.5px solid #e2e8f0 !important;
}

/* PRINT MEDIA CSS CLASS OVERRIDES */
@media print {
  body * {
    visibility: hidden !important;
  }
  #ppd-document-print-area,
  #ppd-document-print-area * {
    visibility: visible !important;
  }
  #ppd-document-print-area {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    background-color: #ffffff !important;
    padding: 10px !important;
  }
  
  .ppd-official-header {
    border: 2px solid #000000 !important;
  }
  .ppd-header-logo-col, .ppd-header-title-col {
    border-right: 2px solid #000000 !important;
  }
  .compact-print-table th, .compact-print-table td {
    border: 1px solid #000000 !important;
    padding: 4px 8px !important;
  }
  .border-slate {
    border: 1px solid #000000 !important;
  }
  .v-chip {
    border: 1px solid #000000 !important;
    background: transparent !important;
    color: #000000 !important;
  }
}

/* Tablas formales para el reporte PPD */
.ppd-table-grid, .ppd-table-totals, .ppd-table-signatures {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  background-color: #ffffff;
  border: 1.5px solid #000000;
  font-family: Arial, Helvetica, sans-serif;
}

.ppd-table-grid th, .ppd-table-grid td,
.ppd-table-totals th, .ppd-table-totals td,
.ppd-table-signatures th, .ppd-table-signatures td {
  border: 1px solid #000000 !important;
  padding: 6px;
  font-size: 11px;
  color: #000000;
  vertical-align: middle;
}

.ppd-table-grid th, .ppd-table-totals th, .ppd-table-signatures th {
  background-color: #f1f5f9;
  font-weight: bold;
  text-align: center;
  text-transform: uppercase;
}

.ppd-table-grid .sub-headers th {
  padding: 2px 4px;
  font-size: 9px;
}

.vertical-header {
  height: 140px;
  width: 35px;
  min-width: 35px;
  max-width: 35px;
  vertical-align: bottom;
  padding: 8px 2px !important;
}

.vertical-header > div {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  white-space: nowrap;
  font-size: 10px;
  font-weight: bold;
  text-align: left;
  margin: 0 auto;
}

.signature-cell {
  height: 90px;
  vertical-align: middle;
  text-align: center;
}

.signature-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.signature-svg {
  border: 1px dashed #2563eb;
  padding: 6px 10px;
  border-radius: 4px;
  background-color: #eff6ff;
  color: #1e40af;
  font-size: 10px;
  line-height: 1.3;
}

.signed-text {
  font-weight: bold;
  color: #1d4ed8;
}

.signed-by {
  font-weight: 900;
  margin-top: 2px;
}

.signed-date {
  font-size: 9px;
  color: #475569;
}

.pending-signature {
  color: #94a3b8;
  font-style: italic;
  font-size: 11px;
}

.signature-names td {
  font-size: 10px;
  line-height: 1.4;
  background-color: #f8fafc;
}
</style>

