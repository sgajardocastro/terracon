<template>
  <DashboardLayout>
    <div>
      <v-row
        class="mb-0"
        dense
      >
        <v-col cols="12">
          <v-card class="pt-2">
            <!-- Tabs scrollables en mobile -->
            <!-- TABS: sin flechas en móvil y vertical en móvil -->
            <!-- DESKTOP / TABLET (como antes) -->
            <div v-if="mdAndUp">
              <v-tabs
                v-model="tab"
                show-arrows
              >
                <v-tab
                  v-show="canSeeDashboardSeguridad"
                  value="one"
                >
                  Dashboard Seguridad
                </v-tab>
                <v-tab value="two">
                  Planificación Seguridad
                </v-tab>
                <v-tab value="three">
                  Ejecución
                </v-tab>
                <v-tab value="four">
                  Informes
                </v-tab>
                <v-tab value="five">
                  Verificación
                </v-tab>

                <!-- Filtros en fila, como antes -->
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

            <!-- MOBILE (sin scroll, todo apilado) -->
            <div v-else>
              <!-- Tabs en columna, sin flechas -->
              <v-tabs
                v-model="tab"
                class="tabs-mobile"
                :show-arrows="false"
                direction="vertical"
              >
                <v-tab
                  v-show="canSeeDashboardSeguridad"
                  value="one"
                >
                  Dashboard Seguridad
                </v-tab>
                <v-tab value="two">
                  Planificación Seguridad
                </v-tab>
                <v-tab value="three">
                  Agenda Seguridad
                </v-tab>
                <v-tab value="four">
                  Informes
                </v-tab>
                <v-tab value="five">
                  Verificación
                </v-tab>
              </v-tabs>

              <!-- Filtros uno bajo otro -->
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
                <v-tabs-window-item value="one">
                  <v-row dense>
                    <!-- Izquierda (indicadores) -->
                    <v-col cols="12">
                      <div class="grupos">
                        <div
                          v-for="(item, i) in jsonData"
                          :key="i"
                        >
                          <div
                            v-for="(grupo, gi) in item.grupo"
                            :key="gi"
                          >
                            <GrupoIndicador
                              :grupo="grupo"
                              :fecha-desde="fechaDesde"
                              :fecha-hasta="fechaHasta"
                              :id-activo="idActivoMA"
                              @toggle="onIndicadorToggle"
                            />
                          </div>
                        </div>
                      </div>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="6">
                      <CumplimientoSeguridad
                        :fecha-desde="fechaDesde"
                        :fecha-hasta="fechaHasta"
                        :cliente-id="cliente"
                        :proyecto-id="proyecto"
                        :items="personas"
                        @ver="onVer"
                      />
                    </v-col>
                    <v-col cols="6">
                      <GraficoSeguridad />
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <GraficosKpiSeguridad :items="kpis" />
                    </v-col>
                  </v-row>
                </v-tabs-window-item>

                <!-- TAB 2 -->
                <v-tabs-window-item value="two">
                  <v-row dense>
                    <v-col cols="12">
                      <div v-if="mdAndUp">
                        <v-tabs
                          v-model="tabPlan"
                          show-arrows
                        >
                          <v-tab value="onePlan">
                            Seguridad General
                          </v-tab>
                          <v-tab value="twoPlan">
                            Seguridad Personalizados
                          </v-tab>
                          <v-tab value="threePlan">
                            Registro de Informes
                          </v-tab>
                        </v-tabs>
                      </div>

                      <!-- MOBILE (sin scroll, todo apilado) -->
                      <div v-else>
                        <!-- Tabs en columna, sin flechas -->
                        <v-tabs
                          v-model="tabPlan"
                          class="tabs-mobile"
                          :show-arrows="false"
                          direction="vertical"
                        >
                          <v-tab value="onePlan">
                            Seguridad General
                          </v-tab>
                          <v-tab value="twoPlan">
                            Seguridad Personalizados
                          </v-tab>
                          <v-tab value="threePlan">
                            Registro de Informes
                          </v-tab>
                        </v-tabs>
                      </div>
                    </v-col>
                  </v-row>
                  <v-card-text>
                    <v-tabs-window v-model="tabPlan">
                      <!-- TAB 1 -->
                      <v-tabs-window-item value="onePlan">
                        <v-row dense>
                          <v-col cols="12">
                            <CrearInspeccion
                              ref="crearInspeccionComp"
                              :fecha-desde="fechaDesde"
                              :fecha-hasta="fechaHasta"
                              :cliente-id="cliente"
                              :proyecto-id="proyecto"
                              :seguridad="true"
                              @survey-creado="onSurveyCreado"
                            />
                          </v-col>
                        </v-row>
                      </v-tabs-window-item>
                      <v-tabs-window-item value="twoPlan">
                        <v-row dense>
                          <v-col cols="12">
                            <ProgramasPersonalizados />
                          </v-col>
                        </v-row>
                      </v-tabs-window-item>
                      <v-tabs-window-item value="threePlan">
                        <v-row dense>
                          <v-col cols="12">
                            <CrearInspeccion
                              ref="crearInspeccionComp"
                              :fecha-desde="fechaDesde"
                              :fecha-hasta="fechaHasta"
                              :cliente-id="cliente"
                              :proyecto-id="proyecto"
                              :seguridad="true"
                              :registro-informes="true"
                              @survey-creado="onSurveyCreado"
                            />
                            <!--VerInspecciones
                              ref="verInspeccionesComp"
                              :fecha-desde="fechaDesde"
                              :fecha-hasta="fechaHasta"
                              :cliente-id="cliente"
                              :proyecto-id="proyecto"
                              :estadoSurvey="estadoFiltro"
                              :seguridad="true"
                              @refresh-crear-inspeccion="refreshCrearInspeccion"
                            /-->
                          </v-col>
                        </v-row>
                      </v-tabs-window-item>
                    </v-tabs-window>
                  </v-card-text>
                </v-tabs-window-item>

                <!-- TAB 3 -->
                <v-tabs-window-item
                  value="three"
                  eager
                >
                  <keep-alive>
                    <template v-if="!selectedSurveyId">
                      <Surveys
                        ref="surveysComp"
                        :seguridad="true"
                        @open-inspeccion="handleOpenInspeccion"
                      />
                    </template>

                    <template v-else>
                      <!-- Pásale el id al componente -->
                      <Inspeccion
                        :id-inspeccion="selectedSurveyId"
                        @close="closeInspeccion"
                      />
                    </template>
                  </keep-alive>
                </v-tabs-window-item>

                <!-- TAB 4 -->
                <v-tabs-window-item value="four">
                  <v-row
                    class="ma-0 fill-height"
                    dense
                  >
                    <!-- Explorador Sidebar -->
                    <v-col
                      cols="12"
                      md="3"
                      class="pa-1"
                    >
                      <FileExplorer @select="onFileSelected" />
                    </v-col>
                    
                    <!-- Contenido Central -->
                    <v-col
                      cols="12"
                      md="9"
                      class="pa-1"
                    >
                      <v-card
                        variant="outlined"
                        class="fill-height d-flex flex-column"
                        rounded="lg"
                      >
                        <!-- Formulario Específico para ESTADISTICA MENSUAL -->
                        <FormularioEstadisticaMensual 
                          v-if="selectedFile && selectedFile.name.includes('TPI-PRR-INF-001')"
                          :report-name="selectedFile.name"
                          :context="selectedFile.context"
                        />

                        <!-- Nuevo Formulario: Auditoría Legal -->
                        <FormularioAuditoriaLegal
                          v-else-if="selectedFile && selectedFile.name.includes('TPI-AUD-LGL-001')"
                          :report-name="selectedFile.name"
                          :context="selectedFile.context"
                        />
                        
                        <!-- Vista por Defecto para otros informes -->
                        <div
                          v-else-if="selectedFile"
                          class="pa-6 flex-grow-1 overflow-y-auto custom-scrollbar"
                        >
                          <div class="d-flex align-center mb-6">
                            <v-icon
                              :icon="getFileIcon(selectedFile)"
                              :color="getFileColor(selectedFile)"
                              size="48"
                              class="mr-4"
                            />
                            <div>
                              <h2 class="text-h4 font-weight-bold mb-1">
                                {{ selectedFile.name }}
                              </h2>
                              <p class="text-subtitle-1 grey--text">
                                <v-chip
                                  size="small"
                                  variant="tonal"
                                  class="mr-2"
                                >
                                  {{ selectedFile.extension?.toUpperCase() }}
                                </v-chip>
                                Informe de Seguridad • 12 Mar 2025
                              </p>
                            </div>
                            <v-spacer />
                            <v-btn
                              color="primary"
                              prepend-icon="mdi-download"
                              variant="elevated"
                            >
                              Descargar
                            </v-btn>
                          </div>
                          
                          <v-divider class="mb-6" />
                          
                          <div class="report-content">
                            <h3 class="text-h6 mb-4">
                              Vista Previa
                            </h3>
                            <v-sheet
                              border
                              rounded="lg"
                              class="pa-8 mb-6 text-center bg-grey-lighten-4"
                              min-height="400"
                            >
                              <v-icon
                                size="64"
                                color="grey-darken-1"
                              >
                                mdi-file-eye-outline
                              </v-icon>
                              <p class="mt-4 grey--text text--darken-2">
                                Cargando vista previa del documento...
                              </p>
                            </v-sheet>
                            
                            <h3 class="text-h6 mb-4">
                              Metadatos del Reporte
                            </h3>
                            <v-table density="comfortable">
                              <tbody>
                                <tr>
                                  <td
                                    class="font-weight-bold"
                                    style="width: 200px"
                                  >
                                    Autor
                                  </td>
                                  <td>Juan Pérez - Jefe de Seguridad</td>
                                </tr>
                                <tr>
                                  <td class="font-weight-bold">
                                    Fecha de Generación
                                  </td>
                                  <td>12 de Marzo, 2025 - 09:45 AM</td>
                                </tr>
                                <tr>
                                  <td class="font-weight-bold">
                                    Proyecto Asociado
                                  </td>
                                  <td>{{ proyectoSeleccionado || 'General' }}</td>
                                </tr>
                                <tr>
                                  <td class="font-weight-bold">
                                    Tamaño del Archivo
                                  </td>
                                  <td>2.4 MB</td>
                                </tr>
                              </tbody>
                            </v-table>
                          </div>
                        </div>
                        
                        <div
                          v-else
                          class="pa-10 text-center flex-grow-1 d-flex flex-column align-center justify-center"
                        >
                          <v-avatar
                            size="100"
                            color="grey-lighten-4"
                            class="mb-6"
                          >
                            <v-icon
                              size="50"
                              color="grey-lighten-1"
                            >
                              mdi-file-find-outline
                            </v-icon>
                          </v-avatar>
                          <h3 class="text-h5 grey--text text--darken-1">
                            Selecciona un archivo
                          </h3>
                          <p class="text-subtitle-1 grey--text">
                            Explora la carpeta de la izquierda para visualizar los reportes disponibles.
                          </p>
                        </div>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-tabs-window-item>

                <!-- TAB 5: Verificación -->
                <v-tabs-window-item value="five">
                  <VerificationTab />
                </v-tabs-window-item>
              </v-tabs-window>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
    <v-dialog
      v-model="show"
      max-width="1200"
      scrim="rgba(0,0,0,0.75)"
    >
      <GanttasticPersSurv
        :key="idUserSel + '-' + idPersonalizadoSel"
        :tareas-gantt="tareasGanttUser"
        :surveys="surveys"
        :id-personalizado="idPersonalizadoSel"
        @refresh="obtenerTareasGantt"
      />
    </v-dialog>
  </DashboardLayout>
</template>
<script setup>
import DashboardLayout from '../layouts/dashboard.vue';
import GraficoSeguridad from '@/components/GraficoSeguridad.vue';
import GraficosKpiSeguridad from '@/components/GraficosKpiSeguridad.vue';
import MiniKPIChartV2 from '@/components/MiniKPIChartV2.vue';
import FileExplorer from '@/components/FileExplorer.vue';
import FormularioEstadisticaMensual from '@/components/FormularioEstadisticaMensual.vue';
import FormularioAuditoriaLegal from '@/components/FormularioAuditoriaLegal.vue';
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import apiAxios from '@/services/api';

import { useRouter, useRoute } from 'vue-router'
import VerificationTab from '@/components/seguridad/VerificationTab.vue';

import { useUserDetailStore } from "@/stores/userDetail";

import * as XLSX from 'xlsx';

import { useDisplay } from 'vuetify'
import GanttasticPersSurv from '@/components/GanttasticPersSurv.vue';
import CumplimientoSeguridad from '@/components/CumplimientoSeguridad.vue';
import { id } from 'vuetify/locale';

const selectedSurveyId = ref(null)

const selectedFile = ref(null)

const tareasGantt = ref([]);

const idPersonalizadoSel = ref(null)
const idUserSel = ref(null)

const roles = ref([])

const surveysComp = ref(null)

async function closeInspeccion() {
  selectedSurveyId.value = null
  await nextTick()
  await surveysComp.value?.getSurveys?.()   // o .filtrar?.() según tu Surveys
}

async function refreshCrearInspeccion () {
  // deja que Vue asiente estado/DOM si venías de un cambio
  await nextTick()
  await crearInspeccionComp.value?.getSurveys?.()
}

const obtenerRoles = async () => {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerUsuariosRoles')
    roles.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('Error al obtener roles:', e)
    roles.value = []
  }
}

const ID_SECU_PROG = 26 // <-- PON EL ID REAL DEL ROL SECU_PROG

const canSeeDashboardSeguridad = computed(() => {
  const userId = Number(userDetailStore.userDetail?.id_user)
  if (!userId) return false

  return roles.value.some(
    r =>
      Number(r.id_user) === userId &&
      Number(r.id_rol) === ID_SECU_PROG
  )
})

const obtenerTareasGantt = async (idPer, idUser) => {
  try {
    const response = await apiAxios.get('/servicio/seg/kpi/personalizadoPctCumplimPersSurv?id_personalizado=' + idPer)

    tareasGantt.value = Array.isArray(response.data)
      ? response.data
      : (response.data?.datos ?? [])
    console.log('tareasGantt del personalizado', idPer, JSON.stringify(tareasGantt.value))
    await getSurveys(idPer, idUser)
  } finally {
    loading.value = false
  }
}

const tareasGanttUser = computed(() =>
  (tareasGantt.value || []).filter(t => Number(t.id_user) === Number(idUserSel.value))
)

const surveys = ref([])

async function getSurveys(idPer, idUser) {
  try {
    const respSurveys = await apiAxios.get(`/servicio/leanglobal/procesosSurveyV3`)
    const all = respSurveys.data.datos || []
    surveys.value = all
      .filter(s => Number(s.id_personalizado) === Number(idPer) && Number(s.id_user) === Number(idUser))
      .sort((a,b) => Number(b.id_survey) - Number(a.id_survey))
    console.log('Surveys del personalizado', idPer, surveys.value.length)
  } catch (e) {
    console.error('Error al obtener surveys:', e)
  }
}

function handleOpenInspeccion({ id /*, notifId*/ }) {
  selectedSurveyId.value = id
}

const show = ref(false)
const seleccionado = ref(null)

const { smAndDown } = useDisplay()
const { mdAndUp } = useDisplay()

const userDetailStore = useUserDetailStore()
const router = useRouter()
const route = useRoute()
const clientes = ref([]);
const proyectos = ref([]);
const cliente = ref(null);
const clienteSeleccionado = ref(null);
const proyecto = ref(null);
const proyectoSeleccionado = ref(null);
const loading = ref(false);
const error = ref(null);
const today = new Date();

// 🔹 15 días antes
const fifteenDaysAgo = new Date(today);
fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

// 🔹 15 días después
const fifteenDaysLater = new Date(today);
fifteenDaysLater.setDate(fifteenDaysLater.getDate() + 15);

// 🔹 Convertir a YYYY-MM-DD
const isoFifteenDaysAgo = fifteenDaysAgo.toISOString().split('T')[0];
const isoFifteenDaysLater = fifteenDaysLater.toISOString().split('T')[0];

// 🔹 Inicializar refs
const fechaDesde = ref(isoFifteenDaysAgo);
const fechaDesdeSeleccionada = ref(isoFifteenDaysAgo);
const fechaHasta = ref(isoFifteenDaysLater);
const fechaHastaSeleccionada = ref(isoFifteenDaysLater);

const jsonData = ref([]);
const tab = ref(null);
const tabPlan = ref('onePlan')
const exportConfig = ref() // 👈 REACTIVO

const crearInspeccionComp = ref(null)

// UI state
const exporting = ref(false)
const idActivoMA = ref(null)

const onIndicadorToggle = (id) => {
  idActivoMA.value = id
}

const exportarExcel = () => {
  exporting.value = true
  try {
    const dataToExport = mockInformes.value.length > 0 ? mockInformes.value : jsonData.value
    const ws = XLSX.utils.json_to_sheet(dataToExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Reporte")
    XLSX.writeFile(wb, "Reporte_Seguridad.xlsx")
  } catch (e) {
    console.error('Error al exportar Excel:', e)
  } finally {
    exporting.value = false
  }
}

onMounted(async () => {
  console.log('userDetailStore.userDetail', userDetailStore.userDetail);
  // Obtener datos necesarios
  await obtenerClientes();
  await obtenerProyectos();
  await obtenerRoles();


  // ✅ fija la pestaña inicial UNA vez (cuando ya sabes el permiso)
  if (route.query.tab) {
    tab.value = route.query.tab
  } else if (!tab.value) {
    tab.value = canSeeDashboardSeguridad.value ? 'one' : 'two'
  }

  // ✅ tabPlan: por defecto, que caiga en la primera
  if (!tabPlan.value) {
    tabPlan.value = 'onePlan'
  }

  const resp = await fetch(import.meta.env.BASE_URL + 'dataSeguridad.json');
  const data = await resp.json()
  jsonData.value = data

  const exportNode = Array.isArray(data) ? data.find(o => o && o.export) : null
  if (exportNode?.export) {
    exportConfig.value = exportNode.export
  }

  await nextTick()
  await filtrar()

});


const personas = ref([
  { nombre: 'Pedro Pérez',  cargo: 'Administrador de obra', cumplimiento: 99.5 },
  { nombre: 'Carla Cáceres', cargo: 'APR', cumplimiento: 89.5 },
])

// --- MOCK DATA FOR INFORMES (TAB 4) ---
const mockInformes = ref([
  {
    cliente: 'Antofagasta Minerals',
    proyecto: 'Proyecto Expansión Pelambres',
    requerimiento: 'Seguridad en Excavaciones',
    tarea: 'Charla de inicio de jornada',
    horasEst: 1.0,
    horasReal: 1.5,
    diferencia: 0.5,
    fInicioPlan: '2025-03-10',
    fInicioReal: '2025-03-10',
    fFinPlan: '2025-03-10',
    fFinReal: '2025-03-10'
  },
  {
    cliente: 'BHP',
    proyecto: 'Spence Growth Option',
    requerimiento: 'Trabajo en Altura',
    tarea: 'Inspección de arneses y líneas de vida',
    horasEst: 2.0,
    horasReal: 1.8,
    diferencia: -0.2,
    fInicioPlan: '2025-03-11',
    fInicioReal: '2025-03-11',
    fFinPlan: '2025-03-11',
    fFinReal: '2025-03-11'
  },
  {
    cliente: 'Codelco',
    proyecto: 'Chuquicamata Subterránea',
    requerimiento: 'Control de Polvo',
    tarea: 'Monitoreo de material particulado',
    horasEst: 4.0,
    horasReal: 4.5,
    diferencia: 0.5,
    fInicioPlan: '2025-03-10',
    fInicioReal: '2025-03-10',
    fFinPlan: '2025-03-10',
    fFinReal: '2025-03-13'
  }
])

const onFileSelected = (file) => {
  selectedFile.value = file
}

const getFileIcon = (file) => {
  const ext = file.extension;
  switch (ext) {
    case 'pdf': return 'mdi-file-pdf-box';
    case 'xlsx':
    case 'xls': return 'mdi-file-excel';
    case 'docx':
    case 'doc': return 'mdi-file-word';
    default: return 'mdi-file-outline';
  }
}

const getFileColor = (file) => {
  const ext = file.extension;
  switch (ext) {
    case 'pdf': return 'red-darken-1';
    case 'xlsx':
    case 'xls': return 'green-darken-1';
    case 'docx':
    case 'doc': return 'blue-darken-1';
    default: return 'grey-darken-1';
  }
}

const kpiInformes = ref({
  totalRegistros: 156,
  cumplimientoGral: 94.2,
  desviacionHoras: 12.5,
  incidentesReportados: 3
})

const kpiMapCompliance = ref({
  '': {
    categories: ['Ene','Feb','Mar','Abr','May','Jun'],
    series: [{ name: 'Cumplimiento', data: [88, 91, 89, 94, 93, 95] }]
  }
})

const kpiMapHours = ref({
  '': {
    categories: ['Ene','Feb','Mar','Abr','May','Jun'],
    series: [{ name: 'Horas', data: [120, 145, 130, 160, 155, 170] }]
  }
})

const kpiMapIncidents = ref({
  '': {
    categories: ['Ene','Feb','Mar','Abr','May','Jun'],
    series: [{ name: 'Incidentes', data: [2, 1, 3, 0, 1, 0] }]
  }
})

const kpiMapTasks = ref({
  '': {
    categories: ['Ene','Feb','Mar','Abr','May','Jun'],
    series: [{ name: 'Tareas', data: [45, 52, 48, 60, 58, 65] }]
  }
})

// --- END MOCK DATA ---
//const personas = ref([]);
const docs = ['AST','Charla diaria','Aplicación Protector Solar UV','Permiso de Trabajo','Plan de Izaje','Observaciones de Conducta','Inspecciones']

// Tus registros reales vendrán de la API
const registros = ref([
  { doc: 'AST', date: '2025-09-02', status: 'ok' },
  { doc: 'AST', date: '2025-09-03', status: 'fail' },
  { doc: 'AST', date: '2025-09-04', status: 'warn' },
  { doc: 'AST', date: '2025-09-05', status: 'ok' },
  { doc: 'Charla diaria', date: '2025-09-01', status: 'ok', slot: 'top' },
  { doc: 'Charla diaria', date: '2025-09-03', status: 'fail', slot: 'top' },
  { doc: 'Charla diaria', date: '2025-09-03', status: 'ok', slot: 'bottom' },
  { doc: 'Charla diaria', date: '2025-09-02', status: 'warn' },

  { doc: 'Charla diaria', date: '2025-09-04', status: 'ok' },
  { doc: 'Aplicación Protector Solar UV', date: '2025-09-16', status: 'ok', slot: 'top' },
  { doc: 'Aplicación Protector Solar UV', date: '2025-09-16', status: 'fail', slot: 'bottom' },
])

const kpis = ref([
  { label: 'Accidentes', value: 0.0, series: [0,0,0,0,0,0,0], decimals: 1 },
  { label: 'Días Perdidos', value: 0.0, series: [0,0,0,0,0,0,0], decimals: 1 },
  { label: 'Promedio Trabajadores', value: 0.0, series: [0,0,0,0,0,0,0], decimals: 1 },
  { label: 'Índice de Accidentabilidad', value: 0.0, series: [0,0,0,0,0,0,0], decimals: 1 },
  { label: 'Índice de Frecuencia',       value: 0.0, series: [0,0,0,0,0,0,0], decimals: 1 },
  { label: 'Índice de Gravedad',         value: 0.0, series: [0,0,0,0,0,0,0], decimals: 1 },
])

watch(tab, async (val) => {
  if (val === 'three') {
    await nextTick()
    await surveysComp.value?.getSurveys?.()   // o el método real que recarga
  }
})

async function onVer(row) {
  seleccionado.value = row
  idPersonalizadoSel.value = row.id_personalizado
  idUserSel.value = row.id_user
  show.value = true
  await obtenerTareasGantt(row.id_personalizado, row.id_user)
}

// Funciones para obtener datos desde API
const obtenerClientes = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await apiAxios.get('/servicio/leanglobal/obtenerEmpresas');
    clientes.value = response.data;
  } catch (err) {
    error.value = 'Error al obtener clientes: ' + err.message;
    console.error(err);
  } finally {
    loading.value = false;
  }
};

watch(clienteSeleccionado, async (nuevoCliente) => {
  // Limpia inmediatamente el select de proyecto
  proyectoSeleccionado.value = null
  proyecto.value = ''        // si usas este para filtrar abajo
  proyectos.value = []       // vacía la lista para que no quede “fantasma”

  if (nuevoCliente) {
    await obtenerProyectos(nuevoCliente)
  }
})

const BYPASS_ROLES = new Set(['SECU_PROG', 'SECU_GCIA', 'SECU_ADMIN', 'SECU_APRB', 'GRAL_PROG', 'GRAL_GCIA', 'GRAL_ADMIN', 'GRAL_APRB'])

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
  const roles = getRolesNames()
  return roles.some(r => BYPASS_ROLES.has(String(r || '').trim().toUpperCase()))
}


const obtenerProyectos = async (id_cliente) => {
  loading.value = true
  error.value = null

  try {
    const response = await apiAxios.get(
      '/servicio/leanglobal/obtenerProyectos?id_empresa_cliente=' + (id_cliente || '')
    )

    let data = Array.isArray(response.data) ? response.data : []

    // 🔐 Si NO es PROG/GCIA/ADMIN → filtrar por projectsIds (localStorage)
    if (!canSeeAllProjects()) {
      const projectsIds = getProjectsIds()

      if (!projectsIds.length) {
        proyectos.value = []
        return
      }

      data = data.filter(p => projectsIds.includes(Number(p.id_proyecto)))
    }

    proyectos.value = data
  } catch (err) {
    error.value = 'Error al obtener proyectos: ' + err.message
    console.error(err)
  } finally {
    loading.value = false
  }
}



async function filtrar() {
  console.log("filtrar");

  fechaDesde.value = fechaDesdeSeleccionada.value;
  fechaHasta.value = fechaHastaSeleccionada.value;

  cliente.value =
    (clienteSeleccionado.value === null || clienteSeleccionado.value === undefined || clienteSeleccionado.value === '')
      ? ''
      : Number(clienteSeleccionado.value);

  proyecto.value =
    (proyectoSeleccionado.value === null || proyectoSeleccionado.value === undefined || proyectoSeleccionado.value === '')
      ? ''
      : Number(proyectoSeleccionado.value);

  // ✅ deja que Vue “propague” los nuevos props al hijo
  await nextTick()

  // ✅ ahora sí, el hijo ve los valores nuevos
  await crearInspeccionComp.value?.getSurveys()
}

watch(canSeeDashboardSeguridad, (canSee) => {
  // si no puede ver dashboard y está en one → lo sacamos
  if (!canSee && tab.value === 'one') tab.value = 'two'

  // si SÍ puede ver dashboard y tab aún no está seteado o quedó en two por default → lo llevamos a one
  if (canSee && (!tab.value || tab.value === 'two')) tab.value = 'one'
}, { immediate: true })
</script>
<style scoped>

</style>
