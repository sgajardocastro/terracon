<template>
  <DashboardLayout>
    <div>
      <v-row
        class="mb-0"
        dense
      >
        <v-col cols="12">
          <v-card class="pt-2">
            <!-- DESKTOP -->
            <div v-if="mdAndUp">
              <v-tabs
                v-model="tab"
                show-arrows
              >
                <v-tab
                  v-show="canSeeDashboardCalidad"
                  value="one"
                  @click="teratribSeleccionado = 10"
                >
                  Dashboard Calidad
                </v-tab>
                <v-tab
                  value="two"
                  @click="teratribSeleccionado = 11"
                >
                  Planificación Calidad
                </v-tab>
                <v-tab value="three">
                  Agenda Calidad
                </v-tab>

                <v-row
                  class="px-1 pt-1"
                  dense
                >
                  <v-col cols="auto">
                    <v-text-field
                      v-model="fechaDesdeSeleccionada"
                      label="Fecha Inicio Plan"
                      type="date"
                      density="compact"
                      variant="outlined"
                      hide-details
                      style="max-width:180px"
                    />
                  </v-col>
                  <v-col cols="auto">
                    <v-text-field
                      v-model="fechaHastaSeleccionada"
                      label="Fecha Fin Plan"
                      type="date"
                      density="compact"
                      variant="outlined"
                      hide-details
                      style="max-width:180px"
                    />
                  </v-col>
                  <v-col cols="auto">
                    <v-select
                      v-model="clienteSeleccionado"
                      :items="clientes"
                      item-title="name_empresa"
                      item-value="id_empresa"
                      label="Cliente"
                      density="compact"
                      variant="outlined"
                      style="width:180px"
                      clearable
                    />
                  </v-col>
                  <v-col cols="auto">
                    <v-select
                      v-model="proyectoSeleccionado"
                      :items="proyectos"
                      item-title="nombre_proyecto"
                      item-value="id_proyecto"
                      label="Proyecto"
                      density="compact"
                      variant="outlined"
                      style="width:180px"
                      clearable
                    />
                  </v-col>
                  <v-col cols="auto">
                    <v-btn @click="filtrar()">
                      Filtrar
                    </v-btn>
                  </v-col>
                  <v-col cols="auto">
                    <v-btn
                      :loading="exporting"
                      @click="exportarExcel"
                    >
                      Exportar
                    </v-btn>
                  </v-col>
                </v-row>
              </v-tabs>
            </div>

            <!-- MOBILE -->
            <div v-else>
              <v-tabs
                v-model="tab"
                class="tabs-mobile"
                :show-arrows="false"
                direction="vertical"
              >
                <v-tab
                  v-show="canSeeDashboardCalidad"
                  value="one"
                  @click="teratribSeleccionado = 10"
                >
                  Dashboard Calidad
                </v-tab>
                <v-tab
                  value="two"
                  @click="teratribSeleccionado = 11"
                >
                  Planificación Calidad
                </v-tab>
                <v-tab value="three">
                  Agenda Protocolos
                </v-tab>
              </v-tabs>

              <v-row
                class="px-3 pt-3 ga-2"
                dense
              >
                <v-col cols="12">
                  <v-text-field
                    v-model="fechaDesdeSeleccionada"
                    label="Fecha Inicio Plan"
                    type="date"
                    density="compact"
                    variant="outlined"
                    hide-details
                  />
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="fechaHastaSeleccionada"
                    label="Fecha Fin Plan"
                    type="date"
                    density="compact"
                    variant="outlined"
                    hide-details
                  />
                </v-col>
                <v-col cols="12">
                  <v-select
                    v-model="clienteSeleccionado"
                    :items="clientes"
                    item-title="name_empresa"
                    item-value="id_empresa"
                    label="Cliente"
                    density="compact"
                    variant="outlined"
                    clearable
                  />
                </v-col>
                <v-col cols="12">
                  <v-select
                    v-model="proyectoSeleccionado"
                    :items="proyectos"
                    item-title="nombre_proyecto"
                    item-value="id_proyecto"
                    label="Proyecto"
                    density="compact"
                    variant="outlined"
                    clearable
                  />
                </v-col>
                <v-col cols="12">
                  <v-btn
                    block
                    @click="filtrar()"
                  >
                    Filtrar
                  </v-btn>
                </v-col>
                <v-col cols="12">
                  <v-btn
                    block
                    :loading="exporting"
                    @click="exportarExcel"
                  >
                    Exportar
                  </v-btn>
                </v-col>
              </v-row>
            </div>

            <v-card-text>
              <v-tabs-window v-model="tab">
                <!-- TAB 1 -->
                <v-tabs-window-item
                  value="one"
                  eager
                >
                  <v-row dense>
                    <v-col
                      cols="12"
                      md="6"
                    >
                      <div class="grupos">
                        <div
                          v-for="(item, index) in jsonData"
                          :key="index"
                        >
                          <div
                            v-for="(grupo, gIndex) in item.grupo"
                            :key="gIndex"
                          >
                            <GrupoIndicador
                              :grupo="grupo"
                              :fecha-desde="fechaDesde"
                              :fecha-hasta="fechaHasta"
                              :filtro="safeCliente"
                              :secatrib="safeProyecto"
                              :teratrib="teratrib"
                              :id-activo="idActivo"
                              @toggle="onToggle"
                            />
                          </div>
                        </div>
                      </div>
                    </v-col>

                    <v-col
                      cols="12"
                      md="6"
                    >
                      <div class="grupo">
                        <div class="panel-titulo">
                          Perspectiva Geográfica
                        </div>
                        <Mapa
                          ref="mapaComp"
                          :fecha-desde="fechaDesde"
                          :fecha-hasta="fechaHasta"
                          :cliente-id="cliente"
                          :proyecto-id="proyecto"
                          class="fill"
                        />
                      </div>
                    </v-col>
                  </v-row>

                  <v-row dense>
                    <v-col
                      cols="12"
                      md="6"
                    >
                      <div
                        class="grupo"
                        :style="{ height: smAndDown ? '290px' : '345px' }"
                      >
                        <div class="panel-titulo mb-2">
                          Perspectiva Temporal
                        </div>
                        <div
                          ref="chartContainer"
                          class="fill"
                          style="margin: 5px; color: #757575; border-radius: 5px;"
                        />
                      </div>
                    </v-col>

                    <v-col
                      cols="12"
                      md="6"
                      class="d-flex"
                    >
                      <div class="grupo grupo2 flex-grow-1">
                        <VerInspecciones
                          :key="protocolosKey"
                          ref="verInspeccionesComp"
                          :fecha-desde="fechaDesde"
                          :fecha-hasta="fechaHasta"
                          :cliente-id="cliente"
                          :proyecto-id="proyecto"
                          :estado-survey="estadoFiltro"
                          :familia-survey="familiaFiltro"
                          :calidad="true"
                        />
                      </div>
                    </v-col>
                  </v-row>
                </v-tabs-window-item>

                <!-- TAB 2 -->
                <v-tabs-window-item value="two">
                  <v-row dense>
                    <v-col cols="12">
                      <div class="grupo">
                        <CrearInspeccion
                          ref="crearInspeccionComp"
                          :fecha-desde="fechaDesde"
                          :fecha-hasta="fechaHasta"
                          :cliente-id="cliente"
                          :proyecto-id="proyecto"
                          :calidad="true"
                          @survey-creado="onSurveyCreado"
                        />
                      </div>
                    </v-col>
                  </v-row>
                </v-tabs-window-item>

                <!-- TAB 3 -->
                <v-tabs-window-item value="three">
                  <VerCalendario />
                </v-tabs-window-item>
              </v-tabs-window>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </DashboardLayout>

  <!-- Modal detalle -->
  <v-dialog
    v-model="showModal"
    :max-width="smAndDown ? '100%' : 1000"
  >
    <v-card>
      <v-toolbar
        color="primary"
        dark
      >
        <v-toolbar-title>Detalle de Inspección</v-toolbar-title>
        <v-spacer />
        <v-btn
          icon
          @click="showModal = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text>
        <VerSurvey :Survey="selectedSurveyId" />
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Progreso export -->
  <v-dialog
    v-model="showDialog"
    :width="smAndDown ? '95vw' : 480"
    persistent
  >
    <v-card>
      <v-card-title class="text-subtitle-1">
        Exportando…
      </v-card-title>
      <v-card-text>
        <div class="mb-2">
          {{ textoProgreso }}
        </div>
        <v-progress-linear
          :model-value="porcentaje"
          height="8"
          rounded
          striped
          indeterminate="false"
        />
        <div class="mt-2 text-caption">
          {{ avance }} / {{ totalHojas }} hojas
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="text"
          :disabled="!exporting"
          @click="cancelar"
        >
          Cancelar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import DashboardLayout from '../layouts/dashboard.vue'
import GrupoIndicador from '../components/GrupoIndicador.vue'
import VerInspecciones from '../components/VerInspecciones.vue'
import CrearInspeccion from '../components/CrearInspeccion.vue'
import VerCalendario from '../components/VerCalendario.vue'
import Mapa from '../components/Mapa.vue'

import Highcharts from 'highcharts/highcharts-gantt'
import { ref, onMounted, computed, nextTick, watch, onBeforeUnmount } from 'vue'
import apiAxios from '@/services/api'
import axios from 'axios'

import { useRouter } from 'vue-router'
import { useUserDetailStore } from "@/stores/userDetail"
import * as XLSX from 'xlsx'

import { useDisplay } from 'vuetify'
const { smAndDown, mdAndUp } = useDisplay()

const userDetailStore = useUserDetailStore()
const router = useRouter()

const clientes = ref([])
const proyectos = ref([])
const familias = ref([])
const tareas = ref([])

const cliente = ref(null)
const clienteSeleccionado = ref(null)
const proyecto = ref(null)
const proyectoSeleccionado = ref(null)

const loading = ref(false)
const error = ref(null)

const today = new Date()
const fifteenDaysAgo = new Date(today); fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15)
const fifteenDaysLater = new Date(today); fifteenDaysLater.setDate(fifteenDaysLater.getDate() + 15)

const isoFifteenDaysAgo = fifteenDaysAgo.toISOString().split('T')[0]
const isoFifteenDaysLater = fifteenDaysLater.toISOString().split('T')[0]

const fechaDesde = ref(isoFifteenDaysAgo)
const fechaDesdeSeleccionada = ref(isoFifteenDaysAgo)

const fechaHasta = ref(isoFifteenDaysLater)
const fechaHastaSeleccionada = ref(isoFifteenDaysLater)

const teratrib = ref()
const teratribSeleccionado = ref(3)
const jsonData = ref([])

const chartContainer = ref(null)
const chartInstance = ref(null)

const tab = ref(null)

const showModal = ref(false)
const selectedSurveyId = ref(null)

const mapaComp = ref(null)
const crearInspeccionComp = ref(null)
const verInspeccionesComp = ref(null)

const idActivo = ref(null)
const tituloActivo = ref(null)
const estadoFiltro = ref(null)
const familiaFiltro = ref(null)
const protocolosKey = computed(() =>
  [
    fechaDesde.value ?? '',
    fechaHasta.value ?? '',
    cliente.value ?? '',
    proyecto.value ?? '',
    estadoFiltro.value ?? '',
    familiaFiltro.value ?? ''
  ].join('|')
)

const safeCliente = computed(() => {
  const v = cliente.value
  return (v === null || v === undefined || v === 'null' || v === 'undefined' || v === '')
    ? ''
    : Number(v) || v
})

const safeProyecto = computed(() => {
  const v = proyecto.value
  return (v === null || v === undefined || v === 'null' || v === 'undefined' || v === '')
    ? ''
    : Number(v) || v
})

const roles = ref([])
const ID_QLTY_PROG = 14

const canSeeDashboardCalidad = computed(() => {
  const userId = Number(userDetailStore.userDetail?.id_user)
  if (!userId) return false
  const rolesUsuario = roles.value.filter(r => Number(r.id_user) === userId)
  return rolesUsuario.some(r => Number(r.id_rol) === ID_QLTY_PROG)
})

const obtenerUsuariosRoles = async () => {
  const { data } = await apiAxios.get('/servicio/leanglobal/obtenerUsuariosRoles')
  roles.value = Array.isArray(data) ? data : []
}

// mapa de títulos → estado backend
const estadoPorTitulo = {
  'Planificados': '',
  'Aprobados': 'APROBADO',
  'Rechazados': 'RECHAZADO',
  'No Terminados': 'NO TERMINADO'
}

function onToggle(payload) {
  const newId = payload?.id ?? null
  const same = idActivo.value === newId
  idActivo.value = same ? null : newId

  if (idActivo.value) {
    const titulo = payload?.titulo ?? ''
    tituloActivo.value = titulo
    if (Object.prototype.hasOwnProperty.call(estadoPorTitulo, titulo)) {
      estadoFiltro.value = estadoPorTitulo[titulo] ?? ''
      familiaFiltro.value = null
    } else {
      estadoFiltro.value = null
      familiaFiltro.value = titulo || null
    }
    filtrar()
  } else {
    tituloActivo.value = null
    estadoFiltro.value = null
    familiaFiltro.value = null
    filtrar()
  }
}

function normalizeText(v) {
  return String(v ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

function abrirModalConSurvey(id) {
  selectedSurveyId.value = id
  showModal.value = true
}

// =========================
// DATA LOADERS
// =========================
const obtenerClientes = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await apiAxios.get('/servicio/leanglobal/obtenerEmpresas')
    clientes.value = (Array.isArray(response.data) ? response.data : []).filter(
      e => !(e.flag_externo === true || e.flag_externo === 1 || e.flag_externo === '1' || e.flag_externo === 't' || e.flag_externo === 'true')
    )
  } catch (err) {
    error.value = 'Error al obtener clientes: ' + err.message
    console.error(err)
  } finally {
    loading.value = false
  }
}

const BYPASS_ROLES = new Set(['QLTY_PROG', 'QLTY_GCIA', 'QLTY_ADMIN', 'QLTY_APRB', 'GRAL_PROG', 'GRAL_GCIA', 'GRAL_ADMIN', 'GRAL_APRB'])

function getRolesNames() {
  try {
    const raw = JSON.parse(localStorage.getItem('rolesNames') || '[]')
    return Array.isArray(raw)
      ? raw.map(r => String(r || '').trim().toUpperCase()).filter(Boolean)
      : []
  } catch {
    return []
  }
}

function getProjectsIds() {
  try {
    const raw = JSON.parse(localStorage.getItem('proyectsIds') || '[]')
    return Array.isArray(raw) ? raw.map(Number).filter(Number.isFinite) : []
  } catch {
    return []
  }
}

function canSeeAllProjects() {
  const rolesNames = getRolesNames()
  return rolesNames.some(r => BYPASS_ROLES.has(String(r || '').trim().toUpperCase()))
}

const obtenerProyectos = async (id_cliente) => {
  loading.value = true
  error.value = null
  try {
    const response = await apiAxios.get(
      '/servicio/leangglobal/obtenerProyectos?id_empresa_cliente=' + (id_cliente || '')
    )
    let data = Array.isArray(response.data) ? response.data : []

    if (!canSeeAllProjects()) {
      const projectsIds = getProjectsIds()
      if (projectsIds.length) {
        data = data.filter(p => projectsIds.includes(Number(p.id_proyecto)))
      }
    }

    proyectos.value = data
  } catch (err) {
    error.value = 'Error al obtener proyectos: ' + err.message
    console.error(err)
  } finally {
    loading.value = false
  }
}

const obtenerFamilias = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await apiAxios.get('/servicio/leanglobal/obtenerFamilias')
    familias.value = response.data
  } catch (err) {
    error.value = 'Error al obtener familias: ' + err.message
    console.error(err)
  } finally {
    loading.value = false
  }
}

// =========================
// GANTT DATA
// =========================
const tasksGantt = ref([])
const categoriasGantt = ref([])

const colorMap = {
  Rojo: '#EF5350',
  Azul: '#64B5F6',
  Amarillo: '#FFD54F'
}

const obtenerTareas = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await apiAxios.get(
      '/servicio/leanglobal/procesosSurveyV3' +
      `?fecha_desde=${fechaDesdeSeleccionada.value}` +
      `&fecha_hasta=${fechaHastaSeleccionada.value}` +
      `&filtro=${clienteSeleccionado.value ?? ''}` +
      `&secatrib=${proyectoSeleccionado.value ?? ''}`
    )

    let tareasOrdenadas = (response.data?.datos ?? []).slice().sort((a, b) => {
      return new Date(a.fecha_plan_ini) - new Date(b.fecha_plan_ini)
    })

    tareasOrdenadas = tareasOrdenadas.filter(t => t.id_area == 1)
    tareas.value = tareasOrdenadas

    const tiposUnicos = [...new Set(tareasOrdenadas.map(t => t.name_tipo_srv))]
    categoriasGantt.value = tiposUnicos

    const tareasPorFechaYTipo = {}

    tasksGantt.value = tareasOrdenadas
      .map(item => {
        if (!item?.fecha_plan_ini || !item?.fecha_plan_fin) return null

        const fechaFin = String(item.fecha_plan_fin) // YYYY-MM-DD o ISO
        const year = Number(fechaFin.slice(0, 4))
        const month = Number(fechaFin.slice(5, 7)) - 1
        const day = Number(fechaFin.slice(8, 10))
        if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null

        const tipo = item.name_tipo_srv
        const keyGrupo = `${tipo}_${fechaFin}`
        if (!tareasPorFechaYTipo[keyGrupo]) tareasPorFechaYTipo[keyGrupo] = 0

        const bloque = tareasPorFechaYTipo[keyGrupo]++
        const horaInicio = bloque * 6
        const horaFin = horaInicio + 6

        return {
          id: String(item.id_survey),
          name: item.name_template_srv,
          start: Date.UTC(year, month, day, horaInicio, 0),
          end: Date.UTC(year, month, day, horaFin, 0),
          y: tiposUnicos.indexOf(tipo),
          color: colorMap[item.estado_color] || '#BDBDBD',
          id_survey: item.id_survey
        }
      })
      .filter(Boolean)

  } catch (err) {
    error.value = 'Error al obtener tareas: ' + err.message
    console.error(err)
  } finally {
    loading.value = false
  }
}

// =========================
// CHART: create/update helpers
// =========================
function initChart() {
  if (!chartContainer.value) return

  const minDate = new Date(fechaDesdeSeleccionada.value).getTime()
  const maxDate = new Date(fechaHastaSeleccionada.value).getTime()

  chartInstance.value = Highcharts.ganttChart(chartContainer.value, {
    chart: {
      height: smAndDown.value ? 200 : 280
    },
    xAxis: [
      {
        min: minDate,
        max: maxDate,
        labels: { style: { fontSize: "9px" }, format: "{value:%d}" },
        grid: { enabled: true, cellHeight: 20 },
        tickInterval: 24 * 3600 * 1000
      },
      {
        min: minDate,
        max: maxDate,
        labels: { format: "{value:%b}" },
        grid: { enabled: true, cellHeight: 20 },
        tickInterval: 30 * 24 * 3600 * 1000
      }
    ],
    yAxis: {
      categories: categoriasGantt.value,
      grid: { cellHeight: 30 },
      labels: { useHTML: true, style: { fontSize: '11px' } }
    },
    plotOptions: {
      series: {
        pointHeight: 10,
        borderRadius: 4,
        connectors: { enabled: false },
        dataLabels: { enabled: false },
        point: {
          events: {
            click() {
              this.series.chart.options.customOptions.onPointClick(this.id)
            }
          }
        }
      }
    },
    tooltip: {
      useHTML: true,
      formatter() {
        return `
          <b>${this.point.name}</b><br/>
          ${categoriasGantt.value[this.point.y] ?? ''}<br/>
          <b>ID Survey:</b> ${this.point.id_survey}<br/>
          <b>Inicio Plan:</b> ${Highcharts.dateFormat('%Y-%m-%d', this.point.start)}<br/>
          <b>Fin Plan:</b> ${Highcharts.dateFormat('%Y-%m-%d', this.point.end)}
        `
      }
    },
    customOptions: {
      onPointClick: abrirModalConSurvey
    },
    series: [{
      name: 'Tareas',
      data: tasksGantt.value
    }]
  })

  // por si el contenedor se montó con tamaño raro
  chartInstance.value.reflow()
}

function updateChart() {
  if (!chartInstance.value) return

  const min = new Date(fechaDesde.value).getTime()
  const max = new Date(fechaHasta.value).getTime()

  let base = tareas.value.filter(t => {
    const f = new Date(t.fecha_plan_ini).getTime()
    const fechaOk = (!fechaDesde.value || f >= min) && (!fechaHasta.value || f <= max)
    const clienteOk = !cliente.value || t.id_empresa_cliente == cliente.value
    const proyectoOk = !proyecto.value || t.id_proyecto == proyecto.value
    return fechaOk && clienteOk && proyectoOk
  })

  if (estadoFiltro.value) {
    base = (estadoFiltro.value === 'APROBADO' || estadoFiltro.value === 'RECHAZADO')
      ? base.filter(t => t.estado_srv === estadoFiltro.value)
      : base.filter(t => t.estado_srv !== 'APROBADO' && t.estado_srv !== 'RECHAZADO')
  }

  if (familiaFiltro.value) {
    const familiaNorm = normalizeText(familiaFiltro.value)
    base = base.filter(t => normalizeText(t?.name_tipo_srv) === familiaNorm)
  }

  const fams = [...new Set(base.map(t => t.name_tipo_srv))]
  const tareasPorFechaYTipo = {}

  const points = base.map(item => {
    if (!item?.fecha_plan_ini || !item?.fecha_plan_fin) return null
    const fechaFin = String(item.fecha_plan_fin)

    const year = +fechaFin.slice(0, 4)
    const month = +fechaFin.slice(5, 7) - 1
    const day = +fechaFin.slice(8, 10)
    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null

    const tipo = item.name_tipo_srv
    const key = `${tipo}_${fechaFin}`
    const bloque = (tareasPorFechaYTipo[key] ?? 0)
    tareasPorFechaYTipo[key] = bloque + 1

    const horaInicio = bloque * 6
    const horaFin = horaInicio + 6

    return {
      id: String(item.id_survey),
      name: item.name_template_srv,
      start: Date.UTC(year, month, day, horaInicio, 0),
      end: Date.UTC(year, month, day, horaFin, 0),
      y: fams.indexOf(tipo),
      color: colorMap[item.estado_color] || '#BDBDBD',
      id_survey: item.id_survey
    }
  }).filter(Boolean)

  chartInstance.value.xAxis[0].setExtremes(min, max, false)
  chartInstance.value.xAxis[1].setExtremes(min, max, false)
  chartInstance.value.yAxis[0].setCategories(fams, false)
  chartInstance.value.series[0].setData(points, true, false, false)

  chartInstance.value.reflow()
}

async function ensureChart() {
  // SOLO tiene sentido si estamos en el tab "one"
  if (tab.value !== 'one') return

  await nextTick()

  // si no hay contenedor aún, no intentes crear
  if (!chartContainer.value) return

  if (!chartInstance.value) initChart()
  else updateChart()
}

// =========================
// MAIN FILTER
// =========================
async function filtrar() {
  teratrib.value = teratribSeleccionado.value
  fechaDesde.value = fechaDesdeSeleccionada.value
  fechaHasta.value = fechaHastaSeleccionada.value

  cliente.value = (clienteSeleccionado.value === null || clienteSeleccionado.value === undefined || clienteSeleccionado.value === '')
    ? ''
    : Number(clienteSeleccionado.value)

  proyecto.value = (proyectoSeleccionado.value === null || proyectoSeleccionado.value === undefined || proyectoSeleccionado.value === '')
    ? ''
    : Number(proyectoSeleccionado.value)

  // trae datos frescos
  await obtenerTareas()

  // crea/actualiza chart si corresponde
  await ensureChart()

  // tabla
  crearInspeccionComp.value?.getSurveys?.()
  verInspeccionesComp.value?.getSurveys?.()

  let tareasFiltradas = tareas.value

  // aplica estado igual que antes
  if (estadoFiltro.value) {
    tareasFiltradas = (estadoFiltro.value === 'APROBADO' || estadoFiltro.value === 'RECHAZADO')
      ? tareasFiltradas.filter(t => t.estado_srv === estadoFiltro.value)
      : tareasFiltradas.filter(t => t.estado_srv !== 'APROBADO' && t.estado_srv !== 'RECHAZADO')
  }

  if (familiaFiltro.value) {
    const familiaNorm = normalizeText(familiaFiltro.value)
    tareasFiltradas = tareasFiltradas.filter(t => normalizeText(t?.name_tipo_srv) === familiaNorm)
  }

  // aplica id_area si quieres que mapa muestre solo calidad (igual que obtienesTareas ya filtra id_area==1)
  // si quieres reforzarlo:
  tareasFiltradas = tareasFiltradas.filter(t => t.id_area == 1)

  mapaComp.value?.setPuntos?.(tareasFiltradas)
  mapaComp.value?.refreshMap?.()
}

// =========================
// TAB WATCH: al entrar al tab one, aseguras chart + datos
// =========================
watch(tab, async (val) => {
  if (val === 'one') {
    await filtrar() // esto ya trae tareas + ensureChart + mapa + tabla
    mapaComp.value?.refreshMap?.()
  }
})

// =========================
// ON MOUNT
// =========================
const exportConfig = ref()

onMounted(async () => {
  await obtenerUsuariosRoles()
  await obtenerClientes()
  await obtenerProyectos()
  await obtenerFamilias()

  // set tab antes del primer filtro (para que exista chartContainer si corresponde)
  if (!tab.value) {
    if (canSeeDashboardCalidad.value) {
      tab.value = 'one'
      teratribSeleccionado.value = 10
    } else {
      tab.value = 'two'
      teratribSeleccionado.value = 11
    }
  }

  const resp = await fetch(import.meta.env.BASE_URL + 'data.json')
  const data = await resp.json()
  jsonData.value = data

  const exportNode = Array.isArray(data) ? data.find(o => o && o.export) : null
  if (exportNode?.export) exportConfig.value = exportNode.export

  await nextTick()
  mapaComp.value?.refreshMap?.()

  // carga inicial: solo intentará chart si tab == one
  await filtrar()

  // resize: reflow del chart cuando exista
  const onResize = () => chartInstance.value?.reflow?.()
  window.addEventListener('resize', onResize)
  onBeforeUnmount(() => window.removeEventListener('resize', onResize))
})

// =========================
// SURVEY CREATED
// =========================
async function onSurveyCreado({ fechaDesde: fDesde, fechaHasta: fHasta, clienteId, proyectoId }) {
  fechaDesdeSeleccionada.value = fDesde
  fechaHastaSeleccionada.value = fHasta
  clienteSeleccionado.value = clienteId
  proyectoSeleccionado.value = proyectoId

  await nextTick()
  await filtrar()
}

// =========================
// EXPORT (igual que tú)
// =========================
const pila = ref('')
const filtro2 = ref('')
const textoSubAcopio = ref('')

const exporting = ref(false)
const showDialog = ref(false)
const textoProgreso = ref('Preparando…')
const avance = ref(0)
const totalHojas = ref(0)
const cancelRequested = ref(false)
let abortController = null

const porcentaje = computed(() => {
  if (!totalHojas.value) return 0
  return Math.round((avance.value / totalHojas.value) * 100)
})

function sanitizeSheetName(name) {
  const s = String(name || 'Hoja')
  return s.replace(/[\[\]\:\*\?\/\\]/g, '').slice(0, 31) || 'Hoja'
}

function formatFecha(val) {
  if (!val) return ''
  const d = (val instanceof Date) ? val : new Date(val)
  if (isNaN(d.getTime())) return String(val)
  const dd = String(d.getDate()).padStart(2,'0')
  const mm = String(d.getMonth()+1).padStart(2,'0')
  const yyyy = d.getFullYear()
  return `${dd}-${mm}-${yyyy}`
}

const API_BASE = window.apiURIComun || '/'

function buildUrl(hoja) {
  const base = API_BASE + hoja.url
  const url = new URL(base, window.location.origin)
  const params = new URLSearchParams()

  params.set('fecha_desde', fechaDesdeSeleccionada.value)
  params.set('fecha_hasta', fechaHastaSeleccionada.value)
  params.set('filtro', clienteSeleccionado.value ?? '')
  params.set('teratrib', 12)
  params.set('in', '')

  url.search = params.toString()
  return url.toString()
}

function mapDatosAHoja(datos, campos) {
  const headers = []
  const keys = []
  for (const c of (campos || [])) {
    if (c.header) headers.push(c.header)
    if (c.nombre) keys.push(c)
  }
  const rows = []
  for (const item of (datos || [])) {
    const row = []
    for (const c of keys) {
      let v = item[c.nombre]
      if (c.tipo === 'fecha') v = formatFecha(v)
      row.push(v)
    }
    rows.push(row)
  }
  rows.unshift(headers)
  return rows
}

function cancelar() {
  cancelRequested.value = true
  if (abortController) abortController.abort()
  textoProgreso.value = 'Cancelando…'
}

async function exportarExcel() {
  if (!exportConfig.value || !Array.isArray(exportConfig.value.hojas) || !exportConfig.value.hojas.length) {
    return alert('No hay hojas configuradas para exportar.')
  }

  exporting.value = true
  showDialog.value = true
  cancelRequested.value = false
  avance.value = 0
  totalHojas.value = exportConfig.value.hojas.length
  textoProgreso.value = 'Iniciando…'

  const wb = XLSX.utils.book_new()

  try {
    for (const hoja of exportConfig.value.hojas) {
      if (cancelRequested.value) throw new Error('Exportación cancelada por el usuario.')
      avance.value++
      textoProgreso.value = `Generando hoja "${hoja.nombre}"…`

      abortController = new AbortController()
      const url = buildUrl(hoja)

      const resp = await apiAxios.get(url, {
        signal: abortController.signal,
        timeout: 120000
      })

      let payload = resp.data
      if (typeof payload === 'string') {
        try { payload = JSON.parse(payload) } catch {}
      }

      const datos =
        Array.isArray(payload)        ? payload :
        Array.isArray(payload?.datos) ? payload.datos :
        Array.isArray(payload?.data)  ? payload.data :
        []

      const aoa = mapDatosAHoja(datos, hoja.campos || [])
      const ws = XLSX.utils.aoa_to_sheet(aoa)
      const sheetName = sanitizeSheetName(hoja.nombre || `Hoja ${avance.value}`)
      XLSX.utils.book_append_sheet(wb, ws, sheetName)
    }

    const filename = exportConfig.value.filename || 'reporte.xlsx'
    XLSX.writeFile(wb, filename)
    textoProgreso.value = '¡Listo!'
  } catch (err) {
    if (axios.isCancel?.(err) || err?.name === 'CanceledError') {
      console.warn('⛔ Export cancelada.')
    } else {
      console.error('❌ Error exportando:', err)
      alert(`Error exportando: ${err?.message || err}`)
    }
  } finally {
    exporting.value = false
    showDialog.value = false
    abortController = null
  }
}
</script>

<style scoped>
.panel-titulo {
  padding-bottom: 10px;
  font-size: 16px;
}

.fill {
  width: 98%;
  height: 100%;
}

@media (max-width: 600px) {
  .tabs-mobile .v-slide-group__content {
    flex-wrap: wrap;
  }
  .filters-block {
    padding-inline: 12px;
  }
  .grupo {
    min-height: 240px;
  }
  .grupo2 {
    height: auto;
  }
  .card {
    min-height: 200px;
  }
}

.tabs-mobile { overflow: hidden; }

.grupo {
  margin: 5px;
  padding: 5px;
  border-radius: 5px;
  background-color: #eaeded;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
              0 1px 5px 0 rgba(0, 0, 0, 0.12),
              0 3px 1px -2px rgba(0, 0, 0, 0.2);
  width: 100%;
}

.grupo2 {
  display: flex;
  flex-direction: column;
  height: 345px;
}

.card {
  margin: 5px;
  padding: 5px;
  color: #757575;
  border-radius: 5px;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
              0 1px 5px 0 rgba(0, 0, 0, 0.12),
              0 3px 1px -2px rgba(0, 0, 0, 0.2);
}

.card.indicador {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  background: white;
}
</style>
