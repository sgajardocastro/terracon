<template>
  <DashboardLayout>
    <div>
      <v-row
        class="mb-0"
        dense
      >
        <v-col cols="12">
          <v-card class="pt-1 conexion-main-card">
            <!-- Tabs scrollables en mobile -->
            <!-- TABS: sin flechas en móvil y vertical en móvil -->
            <!-- DESKTOP / TABLET (como antes) -->
            <div v-if="mdAndUp">
              <v-tabs
                v-model="tab"
                show-arrows
                class="conexion-tabs"
              >
                <v-tab 
                  value="one"
                >
                  Conexión
                </v-tab>
                <v-tab
                  v-if="!isExternalCompany"
                  value="carga"
                >
                  Planificación Conexión
                </v-tab>
                <v-tab
                  v-if="!isExternalCompany && showPlanCTab"
                  value="plan_c"
                >
                  Plan C
                </v-tab>
                <v-tab
                  v-if="!isExternalCompany"
                  value="reclamos"
                >
                  Reclamos
                </v-tab>
                <!--v-tab value="four">Vista Gantt</v-tab>
                <v-tab value="two">Planificación Conexión</v-tab-->
                <v-tab
                  v-if="!isExternalCompany"
                  value="three"
                >
                  Agenda Conexión
                </v-tab>
                <v-tab value="documentos">
                  Documentos
                </v-tab>

                <!-- Filtros en fila, como antes -->
                <v-row
                  v-if="!isExternalCompany"
                  class="px-1 pt-1 conexion-filtros"
                  dense
                >
                  <v-col cols="auto">
                    <v-text-field
                      v-model="fechaDesdeSeleccionada"
                      class="conexion-date-field conexion-date-field-desde"
                      label="Fecha Inicio"
                      type="date"
                      density="comfortable"
                      variant="outlined"
                      hide-details
                      clearable
                      prepend-inner-icon="mdi-calendar"
                      style="max-width:180px"
                      @click:clear="fechaDesdeSeleccionada = ''"
                      @click:prepend-inner="abrirFechaDesde"
                    />
                  </v-col>
                  <v-col cols="auto">
                    <v-text-field
                      v-model="fechaHastaSeleccionada"
                      class="conexion-date-field conexion-date-field-hasta"
                      label="Fecha Fin"
                      type="date"
                      density="comfortable"
                      variant="outlined"
                      hide-details
                      clearable
                      prepend-inner-icon="mdi-calendar"
                      style="max-width:180px"
                      @click:clear="fechaHastaSeleccionada = ''"
                      @click:prepend-inner="abrirFechaHasta"
                    />
                  </v-col>
                  <v-col
                    v-if="false"
                    cols="auto"
                  >
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
                  <v-col
                    v-if="false"
                    cols="auto"
                  >
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
                    <v-btn
                      class="conexion-filter-btn"
                      @click="filtrar()"
                    >
                      Filtrar
                    </v-btn>
                  </v-col>
                  <v-col cols="auto">
                    <v-btn
                      class="conexion-filter-btn"
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
                class="tabs-mobile conexion-tabs-mobile"
                :show-arrows="false"
                direction="vertical"
              >
                <v-tab
                  v-show="canSeeDashboardSeguimiento"
                  value="one"
                >
                  Conexión
                </v-tab>
                <v-tab
                  v-if="!isExternalCompany"
                  value="carga"
                >
                  Planificación Conexión
                </v-tab>
                <v-tab
                  v-if="!isExternalCompany && showPlanCTab"
                  value="plan_c"
                >
                  Plan C
                </v-tab>
                <v-tab
                  v-if="!isExternalCompany"
                  value="reclamos"
                >
                  Reclamos
                </v-tab>
                <!--v-tab value="four">Vista Gantt</v-tab>
                <v-tab value="two">Planificación Conexión</v-tab-->
                <v-tab
                  v-if="!isExternalCompany"
                  value="three"
                >
                  Agenda Conexión
                </v-tab>
                <v-tab value="documentos">
                  Documentos
                </v-tab>
              </v-tabs>

              <!-- Filtros uno bajo otro -->
              <v-row
                v-if="!isExternalCompany"
                class="px-3 pt-3 ga-2 conexion-filtros"
                dense
              >
                <v-col cols="12">
                  <v-text-field
                    v-model="fechaDesdeSeleccionada"
                    class="conexion-date-field conexion-date-field-desde"
                    label="Fecha Inicio Plan"
                    type="date"
                    density="compact"
                    variant="outlined"
                    hide-details
                    clearable
                    prepend-inner-icon="mdi-calendar"
                    @click:clear="fechaDesdeSeleccionada = ''"
                  />
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="fechaHastaSeleccionada"
                    class="conexion-date-field conexion-date-field-hasta"
                    label="Fecha Fin Plan"
                    type="date"
                    density="compact"
                    variant="outlined"
                    hide-details
                    clearable
                    prepend-inner-icon="mdi-calendar"
                    @click:clear="fechaHastaSeleccionada = ''"
                    @click:prepend-inner="abrirFechaHasta"
                  />
                </v-col>
                <v-col
                  v-if="false"
                  cols="12"
                >
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
                <v-col
                  v-if="false"
                  cols="12"
                >
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
                    class="conexion-filter-btn"
                    block
                    @click="filtrar()"
                  >
                    Filtrar
                  </v-btn>
                </v-col>
                <v-col cols="12">
                  <v-btn
                    class="conexion-filter-btn"
                    block
                    :loading="exporting"
                    @click="exportarExcel"
                  >
                    Exportar
                  </v-btn>
                </v-col>
              </v-row>
            </div>

            <v-card-text class="conexion-tabs-content">
              <v-tabs-window v-model="tab">
                <!-- TAB 1 (LIMPIO) -->
                <v-tabs-window-item
                  v-if="!isExternalCompany"
                  value="one"
                >
                  <v-row
                    class="mb-0"
                    dense
                  >
                    <!-- IZQUIERDA: Indicadores -->
                    <v-col
                      cols="12"
                      md="6"
                    >
                      <DashboardConexionIndicadores
                        :key="`conexion-kpis-${conexionRefreshSeq}`"
                        :json-data="jsonData"
                        :fecha-desde="fechaDesde"
                        :fecha-hasta="fechaHasta"
                        :cliente-id="safeCliente"
                        :proyecto-id="safeProyecto"
                        @toggle-indicator="onToggle"
                      />
                    </v-col>

                    <!-- DERECHA: Curva S -->
                    <v-col
                      cols="12"
                      md="6"
                    >
                      <div class="grupo">
                        <CurvaS
                          ref="curvaSRef"
                          :key="`conexion-curva-${conexionRefreshSeq}`"
                          titulo=""
                          :default-series="{ categories: [], plan: [], real: [] }"
                        />
                      </div>
                    </v-col>
                    <!--v-col cols="12">
                      <ExcelPreview
                        :fechaDesde="fechaDesde"
                        :fechaHasta="fechaHasta"
                        :filtro="safeCliente"
                        :secatrib="safeProyecto"
                      />
                    </v-col-->
                    <v-col cols="12">
                      <ResumenCarga
                        :key="`conexion-resumen-${conexionRefreshSeq}`"
                        :fecha-desde="fechaDesde"
                        :fecha-hasta="fechaHasta"
                        :filtro="safeCliente"
                        :secatrib="safeProyecto"
                        :resumen="true"
                      />
                    </v-col>
                  </v-row>
                </v-tabs-window-item>

                <v-tabs-window-item
                  v-if="!isExternalCompany"
                  value="four"
                >
                  <v-row
                    class="mb-0"
                    dense
                  >
                    <v-col cols="4">
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
                    <v-col cols="8">
                      <div class="grupo">
                        <TablaHistorialVersionesSeguimiento />
                      </div>
                    </v-col>
                  </v-row>

                  <v-row
                    class="mb-0"
                    dense
                  >
                    <v-col cols="12">
                      <!-- tabs internas (Gantt / Crítico) -->
                      <v-switch
                        v-model="verCritico"
                        inset
                        color="primary"
                        :label="verCritico ? 'Solo Plan' : 'Plan vs Real'"
                      />

                      <!-- OJO: acá estaba el error: v-model debe ser tabGantts -->
                      <v-window v-model="tabGantts">
                        <v-window-item value="gantt">
                          <v-row
                            class="mb-0"
                            dense
                          >
                            <v-col cols="12">
                              <Ganttastic
                                :tareas="tareasGantt"
                                @refresh="obtenerTareasGantt"
                              />
                            </v-col>
                          </v-row>
                        </v-window-item>

                        <v-window-item value="critico">
                          <v-row
                            class="mb-0"
                            dense
                          >
                            <v-col cols="12">
                              <GanttasticRuta
                                :tareas="tareasGantt"
                                @refresh="obtenerTareasGantt"
                              />
                            </v-col>
                          </v-row>
                        </v-window-item>
                      </v-window>
                    </v-col>
                  </v-row>
                </v-tabs-window-item>

                <v-tabs-window-item
                  v-if="!isExternalCompany"
                  value="carga"
                >
                  <v-row dense>
                    <!-- ==============================================
                         NUEVO LAYOUT (Solicitado: Indicadores Izq, Cargas Der, Tabla Abajo)
                         ============================================== -->

                    <!-- 1. INDICADORES (comentado por solicitud) -->
                    <!--
                    <v-col
                      cols="12"
                      md="6"
                    >
                      <v-row
                        dense
                        class="h-100 align-content-start"
                      >
                        <v-col
                          v-for="(indicador, idx) in planificacionIndicadores"
                          :key="`plan-kpi-${idx}`"
                          cols="6"
                        >
                          <v-card
                            class="h-100 pa-4 d-flex align-center justify-space-between"
                            variant="outlined"
                            style="border-color: #e2e8f0; border-radius: 16px; background: white;"
                          >
                            <div class="d-flex flex-column">
                              <div
                                class="text-caption font-weight-bold text-medium-emphasis text-uppercase mb-1"
                                style="letter-spacing: 0.05em;"
                              >
                                {{ indicador.titulo }}
                              </div>
                              <div class="text-h4 font-weight-bold text-grey-darken-3">
                                {{ formatPlanificacionValor(indicador.value) }}{{ indicador.unidad ? ` ${indicador.unidad}` : '' }}
                              </div>
                            </div>
                            <div
                              class="d-flex align-center justify-center rounded-lg"
                              :style="{
                                width: '48px',
                                height: '48px',
                                backgroundColor: getPlanificacionColorBg(indicador.color),
                                color: getPlanificacionColorText(indicador.color)
                              }"
                            >
                              <v-icon size="24">
                                {{ indicador.icono }}
                              </v-icon>
                            </div>
                          </v-card>
                        </v-col>
                      </v-row>
                    </v-col>
                    -->

                    <!-- TABLA PRINCIPAL -->
                    <v-col
                      cols="12"
                      class="pa-0"
                    >
                      <CrearInspeccionConexion
                        ref="crearInspeccionConexionRef"
                        :fecha-desde="fechaDesde"
                        :fecha-hasta="fechaHasta"
                        :cliente-id="safeCliente"
                        :proyecto-id="safeProyecto"
                        :registro-informes="registroInformes"
                        :hide-header="true"
                        plan-mode="conexion"
                        @open-excel="dialogExcel = true"
                        @open-cargas="dialogCargas = true"
                      />
                    </v-col>

                    <!-- ==============================================
                         FIN NUEVO LAYOUT
                         Para volver atrás, comenta lo de arriba y descomenta lo de abajo:
                         ============================================== -->
                    <!--
                    <v-col cols="12" md="4" class="pa-1">
                      <VerCargas ref="verCargasRef" :fechaDesde="fechaDesde" :fechaHasta="fechaHasta"
                        :filtro="safeCliente" :secatrib="safeProyecto" @carga-selected="onCargaSelected" @open-excel="dialogExcel = true" />
                    </v-col>

                    <v-col cols="12" md="8" class="pa-1">
                      <CrearInspeccionConexion ref="crearInspeccionConexionRef" :fechaDesde="fechaDesde"
                        :fechaHasta="fechaHasta" :clienteId="safeCliente" :proyectoId="safeProyecto"
                        :registroInformes="registroInformes" />
                    </v-col>
                    -->

                    <!--v-col cols="12">
                      <ResumenCarga :fechaDesde="fechaDesde" :fechaHasta="fechaHasta" :filtro="safeCliente"
                        :secatrib="safeProyecto" :resumen="false" />
                    </v-col-->
                  </v-row>
                </v-tabs-window-item>

                <v-tabs-window-item
                  v-if="!isExternalCompany && showPlanCTab"
                  value="plan_c"
                >
                  <v-row dense>
                    <v-col
                      cols="12"
                      class="pa-0"
                    >
                      <CrearInspeccionConexionC
                        ref="crearInspeccionPlanCRef"
                        :fecha-desde="fechaDesde"
                        :fecha-hasta="fechaHasta"
                        :cliente-id="safeCliente"
                        :proyecto-id="safeProyecto"
                        :registro-informes="registroInformes"
                        :hide-header="true"
                        @open-excel="dialogExcelPlanC = true"
                        @open-cargas="dialogCargasPlanC = true"
                      />
                    </v-col>
                  </v-row>
                </v-tabs-window-item>

                <!-- TAB 2 -->
                <v-tabs-window-item
                  v-if="!isExternalCompany"
                  value="two"
                >
                  <v-row dense>
                    <v-col cols="12">
                      <div class="grupo3">
                        <VerPartesProduccion
                          ref="crearInspeccionComp"
                          :fecha-desde="fechaDesde"
                          :fecha-hasta="fechaHasta"
                          :cliente-id="cliente"
                          :proyecto-id="proyecto"
                          @survey-creado="onSurveyCreado"
                        />
                      </div>
                    </v-col>
                    <v-col cols="12">
                      <div class="grupo3">
                        <CrearInspeccion
                          ref="crearInspeccionComp"
                          :fecha-desde="fechaDesde"
                          :fecha-hasta="fechaHasta"
                          :cliente-id="cliente"
                          :proyecto-id="proyecto"
                          :seguimiento="true"
                          @survey-creado="onSurveyCreado"
                        />
                      </div>
                    </v-col>
                  </v-row>
                </v-tabs-window-item>

                <!-- TAB 3 -->
                <v-tabs-window-item
                  v-if="!isExternalCompany"
                  value="reclamos"
                >
                  <ReclamosConexion
                    :fecha-desde="fechaDesde"
                    :fecha-hasta="fechaHasta"
                  />
                </v-tabs-window-item>

                <v-tabs-window-item
                  v-if="!isExternalCompany"
                  value="three"
                >
                  <VerCalendario />
                </v-tabs-window-item>

                <v-tabs-window-item value="documentos">
                  <DocumentosConexion
                    :fecha-desde="fechaDesde"
                    :fecha-hasta="fechaHasta"
                    @formularios-historial-change="onFormulariosHistorialChange"
                  />
                </v-tabs-window-item>
              </v-tabs-window>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </DashboardLayout>

  <!-- Modal detalle responsive -->
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

  <!-- Progreso responsive -->
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
  </v-dialog><v-dialog
    v-model="dialogCargas"
    :max-width="smAndDown ? '100%' : 1100"
    eager
  >
    <v-card>
      <v-toolbar
        color="blue-darken-3"
        dark
      >
        <v-toolbar-title>
          Ver Cargas
        </v-toolbar-title>
        <v-spacer />
        <v-btn
          icon
          @click="dialogCargas = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="pa-2">
        <VerCargas
          ref="verCargasRef"
          :fecha-desde="fechaDesde"
          :fecha-hasta="fechaHasta"
          :filtro="safeCliente"
          :secatrib="safeProyecto"
          :height="320"
          :show-upload-button="false"
          plan-mode="conexion"
          @carga-selected="onCargaSelected"
        />
      </v-card-text>
    </v-card>
  </v-dialog><v-dialog
    v-model="dialogExcel"
    :max-width="smAndDown ? '100%' : 1200"
    persistent
  >
    <v-card>
      <v-toolbar
        color="blue-darken-3"
        dark
      >
        <v-toolbar-title>
          <v-icon
            start
            icon="mdi-file-excel"
          />
          Vista previa Excel
        </v-toolbar-title>
        <v-spacer />
        <v-btn
          icon
          @click="dialogExcel = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="pa-2">
        <ExcelPreview
          :fecha-desde="fechaDesde"
          :fecha-hasta="fechaHasta"
          :filtro="safeCliente"
          :secatrib="safeProyecto"
          plan-mode="conexion"
          @carga-ok="onCargaOk"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
  <v-dialog
    v-model="dialogCargasPlanC"
    :max-width="smAndDown ? '100%' : 1100"
    eager
  >
    <v-card>
      <v-toolbar
        color="blue-darken-3"
        dark
      >
        <v-toolbar-title>
          Ver Cargas Plan C
        </v-toolbar-title>
        <v-spacer />
        <v-btn
          icon
          @click="dialogCargasPlanC = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="pa-2">
        <VerCargas
          ref="verCargasPlanCRef"
          :fecha-desde="fechaDesde"
          :fecha-hasta="fechaHasta"
          :filtro="safeCliente"
          :secatrib="safeProyecto"
          :height="320"
          :show-upload-button="false"
          plan-mode="plan_c"
          @carga-selected="onCargaSelectedPlanC"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
  <v-dialog
    v-model="dialogExcelPlanC"
    :max-width="smAndDown ? '100%' : 1200"
    persistent
  >
    <v-card>
      <v-toolbar
        color="blue-darken-3"
        dark
      >
        <v-toolbar-title>
          <v-icon
            start
            icon="mdi-file-excel"
          />
          Vista previa Excel Plan C
        </v-toolbar-title>
        <v-spacer />
        <v-btn
          icon
          @click="dialogExcelPlanC = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="pa-2">
        <ExcelPreviewC
          :fecha-desde="fechaDesde"
          :fecha-hasta="fechaHasta"
          :filtro="safeCliente"
          :secatrib="safeProyecto"
          @carga-ok="onCargaOkPlanC"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import DashboardLayout from '../layouts/dashboard.vue';
import GrupoIndicador from '../components/GrupoIndicador.vue';
import VerPartesProduccion from '../components/VerPartesProduccion.vue';
import VerCalendario from '../components/VerCalendario.vue';
import Mapa from '../components/Mapa.vue';
import CurvaS from '../components/GraficoHistograma.vue';
import Highcharts, { GanttChart } from 'highcharts/highcharts-gantt'
import GanttSeguimiento from '../components/GanttSeguimiento.vue';
import GanttGSTC from '../components/GanttGSTC.vue';
import GanttTabla from '@/components/GanttTabla.vue';
import Ganttastic from '@/components/Ganttastic.vue';
import GanttasticRuta from '@/components/GanttasticRuta.vue';
import GanttasticRuta2 from '@/components/GanttasticRuta2.vue';
import TablaHistorialVersionesSeguimiento from '../components/TablaHistorialVersionesSeguimiento.vue';
import { ref, onMounted, onBeforeUnmount, computed, nextTick, watch } from 'vue';
import apiAxios from '@/services/api';
import CrearInspeccion from '../components/CrearInspeccion.vue';
import ResumenCarga from '@/components/conexion/ResumenCarga.vue';
import VerCargas from '@/components/conexion/VerCargas.vue';
import ExcelPreviewC from '@/components/ExcelPreviewC.vue';

import { useUserDetailStore } from "@/stores/userDetail";
import * as XLSX from 'xlsx';
import { useDisplay } from 'vuetify'
import CrearInspeccionConexion from '@/components/conexion/CrearInspeccionConexion.vue';
import CrearInspeccionConexionC from '@/components/conexion/CrearInspeccionConexionC.vue';
import DocumentosConexion from '@/components/conexion/DocumentosConexion.vue';
import DashboardConexionIndicadores from '@/components/conexion/DashboardConexionIndicadores.vue';
import ReclamosConexion from '@/components/conexion/ReclamosConexion.vue';

const { smAndDown } = useDisplay()
const { mdAndUp } = useDisplay()

const userDetailStore = useUserDetailStore()
const showPlanCTab = false
const isExternalCompany = computed(() =>
  userDetailStore.userDetail?.isExternalCompany === true ||
  localStorage.getItem('isExternalCompany') === 'true'
)

const clientes = ref([]);
const proyectos = ref([]);
const familias = ref([]);
const tareas = ref([]);

const cliente = ref(null);
const clienteSeleccionado = ref(null);
const proyecto = ref(null);
const proyectoSeleccionado = ref(null);

const loading = ref(false);
const error = ref(null);

const today = new Date();

const tabGantts = ref('gantt');

const dialogExcel = ref(false)
const dialogCargas = ref(false)
const dialogExcelPlanC = ref(false)
const dialogCargasPlanC = ref(false)
const conexionRefreshSeq = ref(0)
const registroInformes = ref(false)
const conexionRealtimeBootstrapped = ref(false)
const conexionRealtimeCursorTs = ref(0)
const conexionRealtimeRefreshing = ref(false)
const conexionRealtimeChangesAvailable = ref(true)
const conexionRealtimeVersionAvailable = ref(false)
const conexionRealtimeDisabled = ref(false)
const conexionRealtimeVersionTs = ref(null)
let conexionRealtimeTimer = null

const crearInspeccionConexionRef = ref(null) // ref al componente derecho
const crearInspeccionPlanCRef = ref(null)

function onCargaSelected(payload) {
  // payload = { id_load, fecha_carga }
  // 👇 le avisamos al componente derecho
  crearInspeccionConexionRef.value?.filtrarPorCarga?.(payload)
}

function onCargaSelectedPlanC(payload) {
  crearInspeccionPlanCRef.value?.filtrarPorCarga?.(payload)
}

const verCritico = computed({
  get: () => tabGantts.value === 'critico',
  set: (val) => {
    tabGantts.value = val ? 'critico' : 'gantt';
  },
});

async function onCargaOk() {
  dialogExcel.value = false         // ✅ cierra el modal
  recargarCargas()                  // ✅ refresca VerCargas
  crearInspeccionConexionRef.value?.getSurveys?.() // âœ… refresca tabla/inspecciones (tab conexión)
  crearInspeccionComp.value?.getSurveys?.() // ✅ compatibilidad con otras tabs/componentes
  await refreshConexionTabData()    // ✅ refresca tab "Conexión" (KPIs, curva, resumen)
}

async function onCargaOkPlanC() {
  dialogExcelPlanC.value = false
  recargarCargasPlanC()
  crearInspeccionPlanCRef.value?.getSurveys?.()
}

const oneDayAgo = new Date(today);
oneDayAgo.setDate(today.getDate() - 1);

const oneDayLater = new Date(today);
oneDayLater.setDate(today.getDate() + 1);

const fechaDesde = ref(oneDayAgo.toISOString().split('T')[0]);
const fechaDesdeSeleccionada = ref(oneDayAgo.toISOString().split('T')[0]);

const fechaHasta = ref(oneDayLater.toISOString().split('T')[0]);
const fechaHastaSeleccionada = ref(oneDayLater.toISOString().split('T')[0]);

const teratrib = ref();
const teratribSeleccionado = ref(3);
const jsonData = ref([]);
const planificacionIndicadores = ref([]);

const chartContainer = ref(null);
const chartInstance = ref(null)

const tab = ref(null);
const ganttRef = ref(null)

watch(tab, async (val) => {
  if (val === 'four') {
    await nextTick()
    ganttRef.value?.reflowChart()   // 👈 fuerza reflow al mostrarse
  }
})

watch([fechaDesdeSeleccionada, fechaHastaSeleccionada], ([desde, hasta]) => {
  if (!desde || !hasta) return
  if (String(desde) > String(hasta)) {
    fechaHastaSeleccionada.value = desde
  }
})

const showModal = ref(false);
const selectedSurveyId = ref(null);

const mapaComp = ref(null);
const crearInspeccionComp = ref(null)

const idActivo = ref(null)
const tituloActivo = ref(null)
const estadoFiltro = ref(null)

const tareasGantt = ref([]);
const curvaSRef = ref(null);

const roles = ref([])

const obtenerRoles = async () => {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerUsuariosRoles')
    roles.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('Error al obtener roles:', e)
    roles.value = []
  }
}

const ID_AVAN_PROG = 32 // <-- PON AQUÍ EL id_rol real de AVAN_PROG

const verCargasRef = ref(null)
const verCargasPlanCRef = ref(null)

function recargarCargas() {
  verCargasRef.value?.reload?.()
}

function recargarCargasPlanC() {
  verCargasPlanCRef.value?.reload?.()
}

async function applyRealtimeChanges(changes = []) {
  if (conexionRealtimeRefreshing.value) return
  conexionRealtimeRefreshing.value = true

  try {
    let anyApplied = false
    for (const change of (Array.isArray(changes) ? changes : [])) {
      // Regla UX: sin recarga completa automática.
      // Sólo parcheamos filas visibles cuando venga patch utilizable.
      const okConexion = !!crearInspeccionConexionRef.value?.applyRealtimeChange?.(change)
      const okPlanC = !!crearInspeccionPlanCRef.value?.applyRealtimeChange?.(change)
      if (okConexion || okPlanC) anyApplied = true
    }

    // Fallback: si llegó lote de cambios pero ninguno pudo aplicarse (payload no estándar),
    // refrescamos listas una vez para mantener sincronía en caliente.
    if (!anyApplied && Array.isArray(changes) && changes.length) {
      await Promise.all([
        crearInspeccionConexionRef.value?.getSurveys?.(),
        crearInspeccionPlanCRef.value?.getSurveys?.()
      ])
    }
  } finally {
    conexionRealtimeRefreshing.value = false
  }
}

async function refreshConexionFallback() {
  recargarCargas()
  recargarCargasPlanC()
  crearInspeccionConexionRef.value?.getSurveys?.()
  crearInspeccionPlanCRef.value?.getSurveys?.()
}

async function pollConexionRealtimeVersion() {
  if (isExternalCompany.value) return
  if (document.visibilityState === 'hidden') return
  if (conexionRealtimeDisabled.value) return

  try {
    if (conexionRealtimeChangesAvailable.value) {
      const { data } = await apiAxios.get('/realtime/conexion/changes', {
        params: {
          since: conexionRealtimeCursorTs.value || 0,
          limit: 200,
        },
      })
      const serverTs = Number(data?.serverTs || Date.now())
      const changes = Array.isArray(data?.changes) ? data.changes : []

      if (!conexionRealtimeBootstrapped.value) {
        conexionRealtimeBootstrapped.value = true
        conexionRealtimeCursorTs.value = Math.max(conexionRealtimeCursorTs.value, serverTs)
        return
      }

      if (changes.length) {
        await applyRealtimeChanges(changes)
        const maxChangeTs = changes.reduce((acc, item) => Math.max(acc, Number(item?.ts || 0)), 0)
        conexionRealtimeCursorTs.value = Math.max(conexionRealtimeCursorTs.value, maxChangeTs, serverTs)
        return
      }

      conexionRealtimeCursorTs.value = Math.max(conexionRealtimeCursorTs.value, serverTs)
      return
    }

    conexionRealtimeDisabled.value = true
    stopConexionRealtimePolling()
    console.warn('Realtime de conexion desactivado: backend sin ruta /realtime/conexion/changes en este ambiente.')
  } catch (err) {
    const status = Number(err?.response?.status || 0)
    if (status === 404) {
      if (conexionRealtimeChangesAvailable.value) {
        conexionRealtimeChangesAvailable.value = false
        console.warn('Ruta /realtime/conexion/changes no disponible. Se desactiva realtime en este ambiente.')
        conexionRealtimeDisabled.value = true
        stopConexionRealtimePolling()
        return
      }
      conexionRealtimeDisabled.value = true
      stopConexionRealtimePolling()
      return
    }
    console.error('Error consultando cambios realtime de conexion:', err)
  }
}

function startConexionRealtimePolling() {
  if (conexionRealtimeTimer) return
  conexionRealtimeTimer = setInterval(() => {
    pollConexionRealtimeVersion()
  }, 4000)
}

function stopConexionRealtimePolling() {
  if (!conexionRealtimeTimer) return
  clearInterval(conexionRealtimeTimer)
  conexionRealtimeTimer = null
}

function onConexionVisibilityChange() {
  if (document.visibilityState === 'visible') {
    pollConexionRealtimeVersion()
  }
}

const canSeeDashboardSeguimiento = computed(() => {
  const userId = Number(userDetailStore.userDetail?.id_user)
  if (!userId) return false

  const hasConexionName = (name) => {
    const n = String(name || '').trim().toUpperCase()
    return n.startsWith('CNX-') || n.startsWith('CON-') || n.includes('-CNX-') || n.includes('-CON-')
  }

  const hasCnxRoleByApi = roles.value.some(r =>
    Number(r.id_user) === userId &&
    hasConexionName(r?.name_rol)
  )
  if (hasCnxRoleByApi) return true

  const hasCnxRoleByStore = Array.isArray(userDetailStore.userDetail?.rolesNames) &&
    userDetailStore.userDetail.rolesNames.some(n => hasConexionName(n))
  if (hasCnxRoleByStore) return true

  const hasCnxRoleByStorage = (() => {
    try {
      const raw = JSON.parse(localStorage.getItem('rolesNames') || '[]')
      return Array.isArray(raw) && raw.some(n => hasConexionName(n))
    } catch {
      return false
    }
  })()
  if (hasCnxRoleByStorage) return true

  return roles.value.some(r =>
    Number(r.id_user) === userId &&
    Number(r.id_rol) === ID_AVAN_PROG
  )
})

async function cargarCurvaSPlanReal() {
  const url = "/servicio/leanglobal/obtenerGanttPlanReal";

  const { data } = await apiAxios.get(url);

  if (!Array.isArray(data) || !data.length) {
    return {
      categories: [],
      plan: [],
      real: []
    };
  }

  const ordenado = [...data].sort(
    (a, b) => new Date(a.fecha_registro ?? a.fecha) - new Date(b.fecha_registro ?? b.fecha)
  );

  const porDia = {};

  for (const r of ordenado) {
    let fecha = null;

    if (typeof r.fecha_registro === 'string') {
      fecha = r.fecha_registro.slice(0, 10);
    } else if (r.fecha_registro instanceof Date) {
      fecha = r.fecha_registro.toISOString().slice(0, 10);
    } else if (r.fecha) {
      if (typeof r.fecha === 'string') {
        fecha = r.fecha.slice(0, 10);
      } else if (r.fecha instanceof Date) {
        fecha = r.fecha.toISOString().slice(0, 10);
      }
    }

    if (!fecha) {
      console.warn('Registro sin fecha válida en obtenerGanttPlanReal:', r);
      continue;
    }

    const plan = Number(r.unidades_planificadas ?? 0) || 0;
    const real = Number(r.unidades_reales ?? 0) || 0;

    if (!porDia[fecha]) porDia[fecha] = { plan: 0, real: 0 };
    porDia[fecha].plan += plan;
    porDia[fecha].real += real;
  }

  const fechas = Object.keys(porDia).sort();

  const planDiario = fechas.map(f => porDia[f].plan);
  const realDiario = fechas.map(f => porDia[f].real);

  let accPlan = 0;
  let accReal = 0;

  const planAcum = planDiario.map(v => accPlan += v);
  const realAcum = realDiario.map(v => accReal += v);

  const categories = fechas.map(f => {
    const d = new Date(f);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = d.toLocaleString('es-ES', { month: 'short' }); // ej: "nov"
    return `${dd}-${mm}`;
  });

  return {
    categories,
    plan: planAcum,
    real: realAcum
  };
}

async function cargarCurvaSGantt() {
  const datos = await cargarCurvaSPlanReal();

  // Accedemos a la referencia del componente hijo
  curvaSRef.value.setSeries({
    categories: datos.categories,
    plan: datos.plan,
    real: datos.real
  });
}

async function refreshConexionTabData() {
  // Fuerza remount de componentes en tab "Conexión" para recargar sus consultas.
  conexionRefreshSeq.value += 1

  // Refresca también datos globales usados por mapa y curva.
  await Promise.allSettled([
    obtenerTareas(),
    cargarCurvaSGantt()
  ])

  await nextTick()
  mapaComp.value?.refreshMap?.()
}

const safeCliente = computed(() => {
  const v = cliente.value;
  return (v === null || v === undefined || v === 'null' || v === 'undefined' || v === '')
    ? ''
    : Number(v) || v; // si es número, que sea número
});

const safeProyecto = computed(() => {
  const v = proyecto.value;
  return (v === null || v === undefined || v === 'null' || v === 'undefined' || v === '')
    ? ''
    : Number(v) || v;
});

// mapa de títulos â†’ estado backend
const estadoPorTitulo = {
  'Planificados': '',          // vacío
  'Aprobados': 'APROBADO',
  'Rechazados': 'RECHAZADO',
  'No Terminados': 'NO TERMINADO'
}

function onToggle(payload) {
  const newId = payload?.id ?? null
  const same = idActivo.value === newId

  // 1) alterna selección
  idActivo.value = same ? null : newId

  // 2) si hay activo, mapeamos; si no, limpiamos
  if (idActivo.value) {
    const titulo = payload?.titulo ?? ''
    const estado = estadoPorTitulo[titulo] ?? ''  // default a vacío si no matchea

    tituloActivo.value = titulo
    estadoFiltro.value = estado

    console.log('Titulo:', tituloActivo.value)
    console.log('Estado:', estadoFiltro.value)
    filtrar();

  } else {
    tituloActivo.value = null
    estadoFiltro.value = null
    console.log('Titulo:', tituloActivo.value)
    console.log('Estado:', estadoFiltro.value)
    filtrar();
  }
}

const tasks = [
  {
    id: '1',
    name: 'Diseño',
    start: Date.UTC(2025, 5, 20),
    end: Date.UTC(2025, 5, 25),
    color: '#81C784'
  },
  {
    id: '2',
    name: 'Desarrollo',
    start: Date.UTC(2025, 5, 26),
    end: Date.UTC(2025, 6, 2),
    color: '#64B5F6'
  },
  {
    id: '3',
    name: 'Testing',
    start: Date.UTC(2025, 6, 3),
    end: Date.UTC(2025, 6, 6),
    color: '#64B5F6'
  }
];

const dtmin = Math.min(...tasks.map(t => t.start))
const dtmax = Math.max(...tasks.map(t => t.end))

function getPlanificacionColorBg(colorName) {
  const map = {
    Green: '#dcfce7',
    Indigo: '#e0e7ff',
    Teal: '#ccfbf1',
    Orange: '#ffedd5',
    Blue: '#dbeafe',
    Red: '#fee2e2',
    Purple: '#f3e8ff'
  }
  return map[colorName] || '#f1f5f9'
}

function getPlanificacionColorText(colorName) {
  const map = {
    Green: '#15803d',
    Indigo: '#4338ca',
    Teal: '#0f766e',
    Orange: '#c2410c',
    Blue: '#1d4ed8',
    Red: '#b91c1c',
    Purple: '#7e22ce'
  }
  return map[colorName] || '#334155'
}

function formatPlanificacionValor(val) {
  if (val === undefined || val === null || val === '') return '0'
  const n = Number(val)
  if (!Number.isFinite(n)) return '0'
  if (Number.isInteger(n)) return n.toLocaleString('es-CL')
  return n.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

function initPlanificacionIndicatorsFromJson(data) {
  const fromGrupo = data?.[0]?.grupo?.find(g => g?.titulo === 'PlanificacionConexion')?.indicadores
  const fromPlanificacion = data?.find(item => item?.planificacionConexion)?.planificacionConexion?.indicadores
  const source = Array.isArray(fromPlanificacion) && fromPlanificacion.length
    ? fromPlanificacion
    : (Array.isArray(fromGrupo) ? fromGrupo : [])

  planificacionIndicadores.value = source.map(ind => ({
    titulo: ind.titulo,
    icono: ind.icono,
    color: ind.color,
    unidad: ind.unidad || '',
    uri: ind.uri,
    value: 0,
    loading: false
  }))
}

async function fetchPlanificacionIndicatorValue(ind) {
  if (!ind?.uri) return
  ind.loading = true
  try {
    const params = {
      fecha_desde: fechaDesde.value || '',
      fecha_hasta: fechaHasta.value || '',
      filtro: safeCliente.value ?? '',
      secatrib: safeProyecto.value ?? '',
      teratrib: ''
    }

    const url = '/servicio' + ind.uri
    const { data } = await apiAxios.get(url, { params })
    const raw = data?.indicador
    const numeric = Number(raw)
    ind.value = Number.isFinite(numeric) ? numeric : 0
  } catch (e) {
    console.error(`Error fetching indicador ${ind?.titulo || ''}:`, e)
    ind.value = 0
  } finally {
    ind.loading = false
  }
}

async function fetchPlanificacionIndicadores() {
  if (!planificacionIndicadores.value.length) return
  await Promise.all(planificacionIndicadores.value.map(ind => fetchPlanificacionIndicatorValue(ind)))
}


onMounted(async () => {
  console.log('userDetailStore.userDetail', userDetailStore.userDetail);
  // Obtener datos necesarios
  cargarCurvaSGantt();
  await obtenerClientes();
  await obtenerProyectos();
  await obtenerFamilias();
  await obtenerTareas();
  await obtenerTareasGantt();

  await obtenerRoles()

  // ✅ setea tab inicial solo una vez, con permiso real
  if (isExternalCompany.value) {
    tab.value = 'documentos'
  } else if (!tab.value) {
    tab.value = canSeeDashboardSeguimiento.value ? 'one' : 'four'  // o 'two' si prefieres
  }
  if (!showPlanCTab && tab.value === 'plan_c') {
    tab.value = 'carga'
  }

  const resp = await fetch(import.meta.env.BASE_URL + 'dataConexion.json');
  const data = await resp.json();
  jsonData.value = data;
  initPlanificacionIndicatorsFromJson(data)
  await fetchPlanificacionIndicadores()
  console.log('jsonData', jsonData.value);

  await nextTick();
  mapaComp.value?.refreshMap();

  await nextTick()
  await filtrar()
  await pollConexionRealtimeVersion()
  startConexionRealtimePolling()
  document.addEventListener('visibilitychange', onConexionVisibilityChange)

  //initChart();
});

onBeforeUnmount(() => {
  stopConexionRealtimePolling()
  document.removeEventListener('visibilitychange', onConexionVisibilityChange)
})

async function onSurveyCreado({ fechaDesde: fDesde, fechaHasta: fHasta, clienteId, proyectoId }) {
  // Asignamos a los campos seleccionados del filtro
  fechaDesdeSeleccionada.value = fDesde;
  fechaHastaSeleccionada.value = fHasta;
  clienteSeleccionado.value = clienteId;
  proyectoSeleccionado.value = proyectoId;

  // Luego filtramos con los nuevos valores
  await nextTick(); // Espera que Vue reactive los cambios
  filtrar();
}

function abrirModalConSurvey(id) {
  console.log('Abrir modal para idInspeccion:', id);
  selectedSurveyId.value = id;
  showModal.value = true;
}

const tareasPorFamilia = computed(() => {
  const grupos = {}

  for (const tarea of tareas.value) {
    const familia = tarea.name_tipo_srv ?? 'Sin familia'

    if (!grupos[familia]) grupos[familia] = []
    grupos[familia].push(tarea)
  }

  return grupos
})

const obtenerTareasGantt = async () => {
  try {
    const response = await apiAxios.get('/servicio/leanglobal/obtenerGanttsTareas');
    tareasGantt.value = response.data;
    console.log("tareasGantt", tareasGantt.value)
  } catch (err) {
    error.value = 'Error al obtener tareas gantt: ' + err.message;
    console.error(err);
  } finally {
    loading.value = false;
  }
}

// Funciones para obtener datos desde API
const obtenerClientes = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await apiAxios.get('/servicio/leanglobal/obtenerEmpresas');
    clientes.value = (Array.isArray(response.data) ? response.data : []).filter(
      e => !(e.flag_externo === true || e.flag_externo === 1 || e.flag_externo === '1' || e.flag_externo === 't' || e.flag_externo === 'true')
    );
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
  proyectos.value = []       // vac�a la lista para que no quede “fantasma”

  if (nuevoCliente) {
    await obtenerProyectos(nuevoCliente)
  }
})

watch(tabGantts, async (nuevo) => {
  // Solo si estás en la pestaña "Vista Gantt"
  if (tab.value === 'four') {
    await obtenerTareasGantt()
  }
})

watch(
  () => [fechaDesde.value, fechaHasta.value, safeCliente.value, safeProyecto.value],
  async () => {
    await fetchPlanificacionIndicadores()
  },
  { deep: true }
)

const BYPASS_ROLES = new Set(['CNX-TRC-ADMIN', 'CNX-TRC-XADMIN', 'CNX-TRC-GTE', 'GRAL_PROG', 'GRAL_GCIA', 'GRAL_ADMIN', 'GRAL_APRB'])

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

    // 🔐 Si NO es PROG/GCIA/ADMIN → filtrar por projectsIds (localStorage) solo cuando existan
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
  loading.value = true;
  error.value = null;
  try {
    const response = await apiAxios.get('/servicio/leanglobal/obtenerFamilias');
    familias.value = response.data;
  } catch (err) {
    error.value = 'Error al obtener familias: ' + err.message;
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const tasksGantt = ref([]);
const categoriasGantt = ref([]);

const obtenerTareas = async () => {
  loading.value = true;
  error.value = null;
  console.log(fechaHastaSeleccionada.value);
  try {
    const response = await apiAxios.get('/servicio/leanglobal/procesosSurveyV3' +
      `?fecha_desde=${fechaDesdeSeleccionada.value}` +
      `&fecha_hasta=${fechaHastaSeleccionada.value}` +
      `&filtro=${clienteSeleccionado.value ?? ''}` +
      `&secatrib=${proyectoSeleccionado.value ?? ''}`
    );
    console.log("response", response)
    // Ordenar por fecha_plan_ini ascendente
    const tareasOrdenadas = response.data.datos.sort((a, b) => {
      return new Date(a.fecha_plan_ini) - new Date(b.fecha_plan_ini);
    });

    tareas.value = tareasOrdenadas;

    // Agrupar por name_tipo_srv (sin duplicados)
    const tiposUnicos = [
      ...new Set(tareasOrdenadas.map(t => t.name_tipo_srv))
    ];

    // Guardamos las categorías para el eje Y
    categoriasGantt.value = tiposUnicos;

    const tareasPorFechaYTipo = {};

    tasksGantt.value = tareasOrdenadas.map(item => {
      const fechaFin = item.fecha_plan_fin;
      const year = Number(fechaFin.slice(0, 4));
      const month = Number(fechaFin.slice(5, 7)) - 1;
      const day = Number(fechaFin.slice(8, 10));

      const tipo = item.name_tipo_srv;
      const keyGrupo = `${tipo}_${fechaFin}`;

      // Contador de cuántas tareas ya hay en esa fecha y grupo
      if (!tareasPorFechaYTipo[keyGrupo]) {
        tareasPorFechaYTipo[keyGrupo] = 0;
      }

      const bloque = tareasPorFechaYTipo[keyGrupo];
      tareasPorFechaYTipo[keyGrupo]++;

      const horaInicio = bloque * 6;
      const horaFin = horaInicio + 6;

      return {
        id: String(item.id_survey),
        name: item.name_template_srv,
        start: Date.UTC(year, month, day, horaInicio, 0),
        end: Date.UTC(year, month, day, horaFin, 0),
        y: tiposUnicos.indexOf(tipo),
        color: colorMap[item.estado_color] || '#BDBDBD',
        nombre_proyecto: item.nombre_proyecto,
        cliente: item.name_empresa_cliente,
        estado_srv: item.estado_srv,
        id_survey: item.id_survey
      };
    });

  } catch (err) {
    error.value = 'Error al obtener tareas: ' + err.message;
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const colorMap = {
  Rojo: '#EF5350',
  Azul: '#64B5F6',
  Amarillo: '#FFD54F'
};

function mapColor(color) {
  switch ((color || '').toLowerCase()) {
    case 'rojo':
      return 'red'
    case 'azul':
      return 'blue'
    case 'amarillo':
      return 'amber darken-2'
    case 'verde':
      return 'green'
    case 'gris':
      return 'grey'
    default:
      return 'grey'
  }
}

function toStartOfDayTs(dateLike) {
  if (!dateLike) return Number.NEGATIVE_INFINITY
  const d = new Date(dateLike)
  if (Number.isNaN(d.getTime())) return Number.NEGATIVE_INFINITY
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function toEndOfDayTs(dateLike) {
  if (!dateLike) return Number.POSITIVE_INFINITY
  const d = new Date(dateLike)
  if (Number.isNaN(d.getTime())) return Number.POSITIVE_INFINITY
  d.setHours(23, 59, 59, 999)
  return d.getTime()
}

async function filtrar() {
  teratrib.value = teratribSeleccionado.value;
  fechaDesde.value = fechaDesdeSeleccionada.value;
  fechaHasta.value = fechaHastaSeleccionada.value;

  // fuerza a number o deja undefined
  cliente.value = (clienteSeleccionado.value === null || clienteSeleccionado.value === undefined || clienteSeleccionado.value === '')
    ? ''
    : Number(clienteSeleccionado.value);

  proyecto.value = (proyectoSeleccionado.value === null || proyectoSeleccionado.value === undefined || proyectoSeleccionado.value === '')
    ? ''
    : Number(proyectoSeleccionado.value);

  await nextTick();
  recargarCargas()
  recargarCargasPlanC()

  updateChart()

  crearInspeccionConexionRef.value?.getSurveys?.();
  crearInspeccionPlanCRef.value?.getSurveys?.();
  crearInspeccionComp.value?.getSurveys();

  let tareasFiltradas = tareas.value.filter(t => {
    const fechaTs = new Date(t.fecha_plan_ini).getTime()
    const desdeTs = toStartOfDayTs(fechaDesde.value)
    const hastaTs = toEndOfDayTs(fechaHasta.value)
    const fechaOk = fechaTs >= desdeTs && fechaTs <= hastaTs
    const clienteOk = !cliente.value || t.id_empresa_cliente == cliente.value
    const proyectoOk = !proyecto.value || t.id_proyecto == proyecto.value
    return fechaOk && clienteOk && proyectoOk
  })

  if (estadoFiltro.value != null && estadoFiltro.value != undefined && estadoFiltro.value !== '') {
    console.log('Estado filtro:', estadoFiltro.value);
    if (estadoFiltro.value == 'APROBADO' || estadoFiltro.value == 'RECHAZADO') {
      tareasFiltradas = tareasFiltradas.filter(survey => survey.estado_srv === estadoFiltro.value);
    }
    else {
      tareasFiltradas = tareasFiltradas.filter(survey => survey.estado_srv !== 'APROBADO' && survey.estado_srv !== 'RECHAZADO');
    }
  }

  console.log("tareasFiltradas: ", tareasFiltradas);
  //await obtenerTareas();

  mapaComp.value?.setPuntos(tareasFiltradas)
}

function initChart() {
  // 1. Convertir las fechas seleccionadas a timestamps
  const minDate = toStartOfDayTs(fechaDesdeSeleccionada.value);
  const maxDate = toEndOfDayTs(fechaHastaSeleccionada.value);

  // 2. Inicializar el Gantt con Highcharts
  chartInstance.value = Highcharts.ganttChart(chartContainer.value, {
    chart: {
      //height: 35 * tasksGantt.value.length  // ajusta la altura según nº de tareas
      height: smAndDown.value ? 200 : 280, // ðŸ‘ˆ más bajo en móvil
    },
    xAxis: [
      {
        // Eje de días
        min: minDate,
        max: maxDate,
        labels: {
          style: { fontSize: "9px" },
          format: "{value:%d}"   // día del mes
        },
        grid: {
          enabled: true,
          cellHeight: 20
        },
        tickInterval: 24 * 3600 * 1000  // un día en ms
      },
      {
        // Eje de meses
        min: minDate,
        max: maxDate,
        labels: {
          format: "{value:%b}"   // mes abreviado
        },
        grid: {
          enabled: true,
          cellHeight: 20
        },
        tickInterval: 30 * 24 * 3600 * 1000  // ~un mes en ms
      }
    ],
    yAxis: {
      categories: categoriasGantt.value,
      grid: { cellHeight: 30 },
      labels: {
        useHTML: true,
        style: { fontSize: '11px' }
      }
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
              // Al hacer clic en una barra, abre el modal
              this.series.chart.options.customOptions.onPointClick(this.id);
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
          ${categoriasGantt.value[this.point.y]}<br/>
          <b>ID Survey:</b> ${this.point.id_survey}<br/>
          <b>Inicio Plan:</b> ${Highcharts.dateFormat('%Y-%m-%d', this.point.start)}<br/>
          <b>Fin Plan:</b> ${Highcharts.dateFormat('%Y-%m-%d', this.point.end)}
        `;
      }
    },
    customOptions: {
      onPointClick: abrirModalConSurvey
    },
    series: [{
      name: 'Tareas',
      data: tasksGantt.value
    }]
  });
}

function updateChart() {
  if (!chartInstance.value) return;

  const min = toStartOfDayTs(fechaDesde.value);
  const max = toEndOfDayTs(fechaHasta.value);

  // 1) filtra en la fuente cruda (tareas.value)
  let base = tareas.value.filter(t => {
    const f = new Date(t.fecha_plan_ini).getTime();
    const fechaOk = (!fechaDesde.value || f >= min) && (!fechaHasta.value || f <= max);
    const clienteOk = !cliente.value || t.id_empresa_cliente == cliente.value;
    const proyectoOk = !proyecto.value || t.id_proyecto == proyecto.value;
    return fechaOk && clienteOk && proyectoOk;
  });

  if (estadoFiltro.value) {
    base = (estadoFiltro.value === 'APROBADO' || estadoFiltro.value === 'RECHAZADO')
      ? base.filter(t => t.estado_srv === estadoFiltro.value)
      : base.filter(t => t.estado_srv !== 'APROBADO' && t.estado_srv !== 'RECHAZADO');
  }

  // 2) recalcula categorías Y (familias) y mapea a puntos
  const familias = [...new Set(base.map(t => t.name_tipo_srv))];
  const tareasPorFechaYTipo = {};
  const points = base.map(item => {
    const fechaFin = item.fecha_plan_fin; // usa la misma lógica que tienes
    const year = +fechaFin.slice(0, 4);
    const month = +fechaFin.slice(5, 7) - 1;
    const day = +fechaFin.slice(8, 10);

    const tipo = item.name_tipo_srv;
    const key = `${tipo}_${fechaFin}`;
    const bloque = (tareasPorFechaYTipo[key] ?? 0);
    tareasPorFechaYTipo[key] = bloque + 1;

    const horaInicio = bloque * 6;
    const horaFin = horaInicio + 6;

    return {
      id: String(item.id_survey),
      name: item.name_template_srv,
      start: Date.UTC(year, month, day, horaInicio, 0),
      end: Date.UTC(year, month, day, horaFin, 0),
      y: familias.indexOf(tipo),
      color: colorMap[item.estado_color] || '#BDBDBD',
      cliente_id: item.id_empresa_cliente,
      proyecto_id: item.id_proyecto,
      estado_srv: item.estado_srv,
      id_survey: item.id_survey
    };
  });

  // 3) aplica cambios en lote (sin redibujar hasta el final)
  chartInstance.value.xAxis[0].setExtremes(min, max, false);
  chartInstance.value.xAxis[1].setExtremes(min, max, false);
  chartInstance.value.yAxis[0].setCategories(familias, false);
  chartInstance.value.series[0].setData(points, true, false, false);
}

// UI state
const exporting = ref(false)
const showDialog = ref(false)
const textoProgreso = ref('Preparando…')
const avance = ref(0)
const totalHojas = ref(0)
const cancelRequested = ref(false)
const formulariosHistorialActivo = ref(false)

const porcentaje = computed(() => {
  if (!totalHojas.value) return 0
  return Math.round((avance.value / totalHojas.value) * 100)
})

// Helpers
function sanitizeSheetName(name) {
  const s = String(name || 'Hoja')
  // SheetJS: máx 31 chars, sin: []:*?/\
  return s.replace(/[\[\]\:\*\?\/\\]/g, '').slice(0, 31) || 'Hoja'
}

function mapRowsToSheet(rows, columns) {
  const headers = columns.map(c => c.header)
  const body = (rows || []).map(item =>
    columns.map(c => {
      const value = item?.[c.key]
      return value == null ? '' : value
    })
  )
  return XLSX.utils.aoa_to_sheet([headers, ...body])
}

const EXCLUDED_ASIGNACIONES_EXPORT_KEYS = new Set([
  'SUP_ARTEFAC',
  'SUP_CONVERS_ARTEFAC'
])

function buildSurveyColumnsFromRows(rows, prefix) {
  const list = Array.isArray(rows) ? rows : []
  const normalizedPrefix = String(prefix || '').toUpperCase()
  if (!normalizedPrefix) return []

  const keys = new Set()
  for (const row of list) {
    for (const k of Object.keys(row || {})) {
      const key = String(k || '')
      if (!key.startsWith(normalizedPrefix)) continue
      if (EXCLUDED_ASIGNACIONES_EXPORT_KEYS.has(key.toUpperCase())) continue
      keys.add(key)
    }
  }

  return Array.from(keys)
    .sort((a, b) => a.localeCompare(b, 'es'))
    .map((key) => ({
      key,
      header: key.replaceAll('_', ' ')
    }))
}

function isFechaInRange(fechaISO, desde, hasta) {
  if (!fechaISO) return false
  const fecha = String(fechaISO).split('T')[0]
  if (desde && fecha < desde) return false
  if (hasta && fecha > hasta) return false
  return true
}

function getEstadoText(fechaVence) {
  if (!fechaVence) return 'NA'
  const today = new Date()
  const venc = new Date(fechaVence)
  const diffDays = Math.ceil((venc - today) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return 'VENCIDO'
  if (diffDays <= 30) return 'POR VENCER'
  return 'VIGENTE'
}

function getEstadoDocumentacionEquipo(docsEquipo) {
  const requiredTypes = [
    'Revisión Técnica',
    'Permiso de Circulación',
    'Seguro Obligatorio',
    'Certificado de Gases',
    'Póliza'
  ]

  const latestByType = {}
  for (const doc of (docsEquipo || [])) {
    const type = doc?.registro_acreditacion
    if (!type) continue
    if (!latestByType[type] || Number(doc.id_acreditacion) > Number(latestByType[type].id_acreditacion)) {
      latestByType[type] = doc
    }
  }

  let hasVencido = false
  let hasPorVencer = false

  for (const type of requiredTypes) {
    const doc = latestByType[type]
    if (!doc) return 'Incompleto'
    const estado = getEstadoText(doc.fecha_prox_calibracion)
    if (estado === 'VENCIDO') hasVencido = true
    if (estado === 'POR VENCER') hasPorVencer = true
  }

  if (hasVencido) return 'Revisar'
  if (hasPorVencer) return 'Atención'
  return 'Completo'
}

function getLatestDocsByType(docsEquipo) {
  const latestByType = {}
  for (const doc of (docsEquipo || [])) {
    const type = doc?.registro_acreditacion
    if (!type) continue
    if (!latestByType[type] || Number(doc.id_acreditacion) > Number(latestByType[type].id_acreditacion)) {
      latestByType[type] = doc
    }
  }
  return latestByType
}

function getEstadoTipoDoc(docsEquipo, tipo) {
  const latestByType = getLatestDocsByType(docsEquipo)
  const doc = latestByType[tipo]
  if (!doc) return 'NA'
  return getEstadoText(doc.fecha_prox_calibracion)
}

async function getEquiposMovilesRowsForExport() {
  const [equiposRes, docsRes] = await Promise.all([
    apiAxios.get('/servicio/leanglobal/obtenerEquiposMoviles'),
    apiAxios.get('/servicio/leanglobal/obtenerDocumentacionResumen')
  ])

  const equipos = Array.isArray(equiposRes?.data) ? equiposRes.data : []
  const docsResumen = Array.isArray(docsRes?.data) ? docsRes.data : []
  const desde = fechaDesde.value || ''
  const hasta = fechaHasta.value || ''
  const filtrarPorFecha = Boolean(desde || hasta)

  const equiposFiltrados = equipos.filter(eq => {
    if (!filtrarPorFecha) return true
    const docsEquipo = docsResumen.filter(d => d.id_equipo === eq.id_equipo)
    if (!docsEquipo.length) return true
    const docsConFecha = docsEquipo.filter(d => !!d.fecha_prox_calibracion)
    if (!docsConFecha.length) return true
    return docsConFecha.some(d => isFechaInRange(d.fecha_prox_calibracion, desde, hasta))
  })

  return equiposFiltrados.map(eq => {
    const docsEquipo = docsResumen.filter(d => d.id_equipo === eq.id_equipo)
    return {
      vehiculo: eq?.json_data?.nombre || eq?.elemento || '',
      responsable: eq?.nombre || 'Sin Responsable',
      patente: eq?.patente || '',
      revision_tecnica: getEstadoTipoDoc(docsEquipo, 'Revisión Técnica'),
      permiso_circulacion: getEstadoTipoDoc(docsEquipo, 'Permiso de Circulación'),
      seguro_obligatorio: getEstadoTipoDoc(docsEquipo, 'Seguro Obligatorio'),
      cert_gases: getEstadoTipoDoc(docsEquipo, 'Certificado de Gases'),
      poliza: getEstadoTipoDoc(docsEquipo, 'Póliza'),
      documentacion: getEstadoDocumentacionEquipo(docsEquipo)
    }
  })
}

async function getAsistenciaRowsForExport() {
  const [asistenciaRes, empresasRes, usersRes] = await Promise.all([
    apiAxios.get('/tfmg-archivos'),
    apiAxios.get('/servicio/leanglobal/obtenerEmpresas'),
    apiAxios.get('/servicio/leanglobal/obtenerUsuarios')
  ])

  const dataRaw = Array.isArray(asistenciaRes?.data?.data) ? asistenciaRes.data.data : []
  const empresas = Array.isArray(empresasRes?.data) ? empresasRes.data : []
  const users = Array.isArray(usersRes?.data) ? usersRes.data : []
  const desde = fechaDesde.value || ''
  const hasta = fechaHasta.value || ''

  const empresasMap = {}
  empresas.forEach(e => { empresasMap[e.id_empresa] = e.name_empresa || `Empresa ${e.id_empresa}` })

  const usersMap = {}
  users.forEach(u => {
    usersMap[u.id_user] = `${u.name_frst || ''} ${u.apellido_pat || ''}`.trim() || `User ${u.id_user}`
  })

  const filtered = dataRaw
    .filter(i => i.tipo_documento === 'REGISTRO DE ASISTENCIA')
    .map(i => {
      if (typeof i.json_data === 'string') {
        try { i.json_data = JSON.parse(i.json_data) } catch { i.json_data = {} }
      }
      return i
    })
    .filter(i => {
      if (!desde && !hasta) return true
      const raw = i.fecha_registro || i.fecha_creacion || i.fecha
      if (!raw) return false
      const fecha = String(raw).slice(0, 10)
      if (desde && fecha < desde) return false
      if (hasta && fecha > hasta) return false
      return true
    })
    .sort((a, b) => (Number(b.id_archivo) || 0) - (Number(a.id_archivo) || 0))

  return filtered.map(i => ({
    id: i.id_archivo ?? '',
    contratista: empresasMap[i.json_data?.id_empresa_contratista] || 'No especificado',
    fecha_registro: String(i.fecha_registro || i.fecha_creacion || i.fecha || '').slice(0, 10),
    estado: i.json_data?.estado || 'COMPLETADO',
    observacion: i.observacion || '',
    usuario: usersMap[i.id_usuario_creacion] || `ID: ${i.id_usuario_creacion || ''}`
  }))
}

async function getPersonalRowsForExport() {
  const res = await apiAxios.get('/servicio/leanglobal/obtenerPersonalExterno')
  const rows = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.data) ? res.data.data : [])
  const desde = fechaDesde.value || ''
  const hasta = fechaHasta.value || ''

  const normJson = (val) => {
    if (!val) return {}
    if (typeof val === 'object') return val
    if (typeof val === 'string') {
      try { return JSON.parse(val) } catch { return {} }
    }
    return {}
  }

  const nombreCompleto = (p) => (
    p?.nombre || `${p?.name_frst || ''} ${p?.name_sec || ''} ${p?.apellido_pat || ''} ${p?.apellido_mat || ''}`.trim()
  )

  const filtered = rows
    .map(p => {
      const json = normJson(p.json_data)
      const inicioContrato = String(json?.inicio_contrato || json?.fechaContrato || '').slice(0, 10)
      return { p, json, inicioContrato }
    })
    .filter(({ inicioContrato }) => {
      if (!desde && !hasta) return true
      if (!inicioContrato) return false
      if (desde && inicioContrato < desde) return false
      if (hasta && inicioContrato > hasta) return false
      return true
    })

  return filtered.map(({ p, json, inicioContrato }) => ({
    nombre: nombreCompleto(p),
    rut: p?.rut || '',
    contratista: p?.contratista || 'S/E',
    subcontrato: p?.subcontrato || json?.subcontrato || '',
    cargo: json?.cargo || 'S/I',
    credencial: (json?.credencial || json?.credencial_filename || json?.id_doc_credencial) ? 'SI' : 'NO',
    inicio_contrato: inicioContrato || '',
    termino_contrato: String(json?.fechaTerminoContrato || '').slice(0, 10),
    desvinculacion: String(json?.fechaDesvinculacion || '').slice(0, 10),
    tipo_contrato: json?.tipoContrato || '',
    examen_altura_estado: json?.examenAltura?.estado || 'NA',
    examen_altura_vence: String(json?.examenAltura?.fechaVence || '').slice(0, 10),
    clase_3_estado: json?.clase3?.estado || 'NA',
    clase_3_vence: String(json?.clase3?.fechaVence || '').slice(0, 10),
    licencia_conducir_estado: json?.licenciaConducir?.estado || 'NA',
    licencia_conducir_vence: String(json?.licenciaConducir?.fechaVence || '').slice(0, 10),
    cedula_estado: json?.cedulaIdentidad?.estado || 'NA',
    cedula_vence: String(json?.cedulaIdentidad?.fechaVence || '').slice(0, 10),
    soldadura_estado: json?.soldadura?.estado || 'NA',
    soldadura_vence: String(json?.soldadura?.fechaVence || '').slice(0, 10),
    correo: p?.email || '',
    telefono: p?.movil || '',
    telefono_emergencia: json?.telefonoEmergencia || '',
    fecha_nacimiento: String(json?.fechaNacimiento || '').slice(0, 10),
    direccion: json?.direccion || '',
    comuna: json?.comuna || '',
    fecha_c4: String(json?.fechaC4 || '').slice(0, 10),
    patente: json?.patente || ''
  }))
}

function formatDateYYYYMMDD(dateStr) {
  if (!dateStr) return ''
  return String(dateStr).slice(0, 10)
}

function getCalibrationStateLabelByDate(dateStr) {
  if (!dateStr) return 'NA'
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  const diffDays = Math.ceil((date - today) / (1000 * 60 * 60 * 24))
  if (diffDays <= 0) return 'Vencido'
  if (diffDays <= 14) return 'Por Vencer'
  return 'Vigente'
}

async function getEquipamientoRowsForExport() {
  const [equiposRes, usersRes] = await Promise.all([
    apiAxios.get('/tequ-equipos'),
    apiAxios.get('/servicio/leanglobal/obtenerUsuarios')
  ])

  const equiposRaw = Array.isArray(equiposRes?.data?.data) ? equiposRes.data.data : []
  const users = Array.isArray(usersRes?.data) ? usersRes.data : []
  const desde = fechaDesde.value || ''
  const hasta = fechaHasta.value || ''

  const usersMap = {}
  users.forEach(u => {
    usersMap[u.id_user] = `${u.name_frst || ''} ${u.apellido_pat || ''}`.trim() || `Usuario ${u.id_user}`
  })

  let equipos = equiposRaw.map(e => ({
    ...e,
    serie: e.numero_serie || '',
    tipo: e.tipo_equipo || '',
    fecha_registro_fmt: formatDateYYYYMMDD(e.fecha_registro),
    fecha_registro_iso: formatDateYYYYMMDD(e.fecha_registro)
  }))

  equipos = equipos.filter(item => {
    const tipo = (item.tipo || '').toLowerCase()
    return !(tipo.includes('movil') || tipo.includes('móvil'))
  })

  if (desde || hasta) {
    equipos = equipos.filter(item => {
      const fecha = item.fecha_registro_iso || ''
      if (!fecha) return false
      if (desde && fecha < desde) return false
      if (hasta && fecha > hasta) return false
      return true
    })
  }

  const certEntries = await Promise.all(
    equipos.map(async (item) => {
      try {
        const res = await apiAxios.get(`/tequ-documentacion/${item.id_equipo}`)
        const certs = Array.isArray(res?.data?.data) ? res.data.data : []
        return [item.id_equipo, certs]
      } catch {
        return [item.id_equipo, []]
      }
    })
  )

  const certMap = Object.fromEntries(certEntries)

  return equipos.map(item => {
    const certs = certMap[item.id_equipo] || []
    const latest = [...certs].sort(
      (a, b) => new Date(b?.fecha_ult_calibracion || 0) - new Date(a?.fecha_ult_calibracion || 0)
    )[0]

    const usuario = latest?.id_usuario_responsable
      ? (usersMap[latest.id_usuario_responsable] || `Usuario ${latest.id_usuario_responsable}`)
      : (item.nombre_responsable || usersMap[item.id_usuario_creacion] || `Usuario ${item.id_usuario_creacion || ''}`)

    return {
      marca: item.marca || '',
      serie: item.serie || '',
      tipo: item.tipo || '',
      estado: getCalibrationStateLabelByDate(latest?.fecha_prox_calibracion),
      presion: latest?.json_data?.presion || 'NA',
      fecha_registro: item.fecha_registro_fmt || '',
      ult_calib: formatDateYYYYMMDD(latest?.fecha_ult_calibracion),
      prox_calib: formatDateYYYYMMDD(latest?.fecha_prox_calibracion),
      usuario: usuario || '',
      cantidad: certs.length
    }
  })
}

async function getFormulariosRowsForExport() {
  const res = await apiAxios.get('/tfmg-archivos')
  const data = Array.isArray(res?.data?.data) ? res.data.data : []
  const desde = fechaDesde.value || ''
  const hasta = fechaHasta.value || ''

  const allowed = data.filter(i =>
    (i.tipo_documento || '').includes('Formularios PDR') ||
    (i.tipo_documento || '').includes('Formularios DEN')
  )

  const filteredByDate = allowed.filter(i => {
    if (!desde && !hasta) return true
    const fecha = String(i.fecha_creacion || '').slice(0, 10)
    if (!fecha) return false
    if (desde && fecha < desde) return false
    if (hasta && fecha > hasta) return false
    return true
  })

  let rowsToExport = []

  if (formulariosHistorialActivo.value) {
    rowsToExport = [...filteredByDate].sort((a, b) => (Number(b.id_archivo) || 0) - (Number(a.id_archivo) || 0))
  } else {
    const latestByRoot = {}
    for (const item of filteredByDate) {
      const json = (typeof item.json_data === 'string')
        ? (() => { try { return JSON.parse(item.json_data) } catch { return {} } })()
        : (item.json_data || {})

      const key = json?.root_id || item.id_archivo
      if (!latestByRoot[key] || Number(item.version) > Number(latestByRoot[key].version)) {
        latestByRoot[key] = item
      }
    }
    rowsToExport = Object.values(latestByRoot).sort((a, b) => (Number(b.id_archivo) || 0) - (Number(a.id_archivo) || 0))
  }

  const usersRes = await apiAxios.get('/servicio/leanglobal/obtenerUsuarios')
  const users = Array.isArray(usersRes?.data) ? usersRes.data : []
  const usersMap = {}
  users.forEach(u => {
    usersMap[u.id_user] = `${u.name_frst || ''} ${u.apellido_pat || ''}`.trim() || `Usuario ${u.id_user}`
  })

  return rowsToExport.map(i => ({
    id_doc: i.id_doc ?? '',
    tipo_documento: i.tipo_documento || '',
    nombre_archivo: i.name_doc_orig || (i.id_doc ? `Documento #${i.id_doc}` : 'Sin archivo'),
    observacion: i.observacion || '',
    version: i.version ?? '',
    fecha_creacion: String(i.fecha_creacion || '').slice(0, 10),
    usuario: usersMap[i.id_usuario_creacion] || `Usuario ${i.id_usuario_creacion || ''}`
  }))
}

function normalizeAnyDateToYMD(raw) {
  if (!raw) return ''
  const s = String(raw).trim()
  if (!s) return ''

  // Caso: viene con prefijo/texto como "sysdatehhmm ..." y la fecha está embebida
  const isoAnywhere = s.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (isoAnywhere) return `${isoAnywhere[1]}-${isoAnywhere[2]}-${isoAnywhere[3]}`

  const dmyAnywhere = s.match(/(\d{2})[\/-](\d{2})[\/-](\d{4})/)
  if (dmyAnywhere) return `${dmyAnywhere[3]}-${dmyAnywhere[2]}-${dmyAnywhere[1]}`

  const compactAnywhere = s.match(/(\d{4})(\d{2})(\d{2})(\d{0,4})/)
  if (compactAnywhere) return `${compactAnywhere[1]}-${compactAnywhere[2]}-${compactAnywhere[3]}`

  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`

  const dmy = s.match(/^(\d{2})[\/-](\d{2})[\/-](\d{4})/)
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`

  const compact = s.match(/^(\d{4})(\d{2})(\d{2})(\d{0,4})$/)
  if (compact) return `${compact[1]}-${compact[2]}-${compact[3]}`

  const d = new Date(s)
  if (!isNaN(d.getTime())) {
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }
  return ''
}

function findAttrInSegments(segmentos, label) {
  const normalizeLabelText = (v) => String(v || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .toLowerCase()

  const target = normalizeLabelText(label)
  for (const seg of (segmentos || [])) {
    for (const attr of (seg.attributes || [])) {
      if (normalizeLabelText(attr?.label || '') === target) {
        if (attr.value !== undefined && attr.value !== null) return attr.value
        if (attr.answer !== undefined && attr.answer !== null) return attr.answer
        if (attr.default !== undefined && attr.default !== null) return attr.default
        return null
      }
    }
  }
  return null
}


function findAttrInSegmentsFlexible(segmentos, labels = [], contains = []) {
  const normalizeLabelText = (v) => String(v || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .toLowerCase()

  const exacts = (labels || []).map(v => normalizeLabelText(v)).filter(Boolean)
  const partials = (contains || []).map(v => normalizeLabelText(v)).filter(Boolean)

  for (const seg of (segmentos || [])) {
    for (const attr of (seg.attributes || [])) {
      const lbl = normalizeLabelText(attr?.label || '')
      const exactMatch = exacts.includes(lbl)
      const containsMatch = partials.some(p => lbl.includes(p))
      if (!exactMatch && !containsMatch) continue

      if (attr.value !== undefined && attr.value !== null && String(attr.value).trim() !== '') return attr.value
      if (attr.answer !== undefined && attr.answer !== null && String(attr.answer).trim() !== '') return attr.answer
      if (attr.default !== undefined && attr.default !== null && String(attr.default).trim() !== '') return attr.default
    }
  }
  return null
}
function parseBodyReclamoExport(body) {
  const segmentos = body?.segmentos || []
  return {
    ic: findAttrInSegments(segmentos, 'IC'),
    direccion: findAttrInSegmentsFlexible(segmentos, ['Direccion', 'Direcci�n'], ['direccion']),
    comuna: findAttrInSegments(segmentos, 'Comuna'),
    telefono: findAttrInSegmentsFlexible(segmentos, ['Telefono Cliente', 'Tel�fono Cliente'], ['telefono cliente']),
    nombre_cliente: findAttrInSegments(segmentos, 'Nombre del Cliente'),
    gio: findAttrInSegments(segmentos, 'Gio a cargo del Reclamo'),
    nro_reclamo: findAttrInSegmentsFlexible(
      segmentos,
      ['Nro Reclamo', 'N° Reclamo', 'Nº Reclamo', 'Nmro Reclamo', 'Numero Reclamo', 'Número Reclamo'],
      ['nro reclamo', 'numero reclamo', 'nmro reclamo']
    ),
    observacion: findAttrInSegmentsFlexible(segmentos, ['Observacion/descripcion del problema.', 'Observaci�n/descripci�n del problema.', 'Observacion del problema'], ['observacion', 'descripcion del problema']),
    fecha_recepcion_reclamo: findAttrInSegmentsFlexible(
      segmentos,
      ['Fecha Recepcion Reclamo', 'Fecha Recepción Reclamo', 'Fecha de recepción del reclamo', 'Fecha de recepcion del reclamo', 'Fecha recepción reclamo', 'Fecha recepcion reclamo'],
      ['fecha recepcion reclamo', 'fecha de recepcion del reclamo']
    ),
    fecha_creacion: findAttrInSegmentsFlexible(segmentos, ['Fecha Creaci�n', 'Fecha Creacion', 'Fecha de Creaci�n', 'Fecha de Creacion'], ['fecha creaci', 'fecha creacion']),
    sysdatehhmm: findAttrInSegmentsFlexible(segmentos, ['sysdatehhmm', 'sysdate hhmm', 'sysdate hh:mm', 'sysdate'], ['sysdate']),
    fecha_target: findAttrInSegments(segmentos, 'Fecha Target Max (+48hrs)'),
    fecha_cierre: findAttrInSegments(segmentos, 'Fecha Cierre Real'),
    sla_real: findAttrInSegments(segmentos, 'SLA Real')
  }
}

async function getReclamosRowsForExport() {
  const params = new URLSearchParams()
  params.append('ts.id_template', 153)

  const [listRes, usersRes] = await Promise.all([
    apiAxios.get(`/servicio/leanglobal/procesosSurveyV3?${params.toString()}`),
    apiAxios.get('/servicio/leanglobal/obtenerUsuarios')
  ])

  const users = Array.isArray(usersRes?.data) ? usersRes.data : []
  const usersMap = {}
  users.forEach(u => {
    usersMap[u.id_user] = `${u.name_frst || ''} ${u.apellido_pat || ''}`.trim() || `Usuario ${u.id_user}`
  })

  const rawList = Array.isArray(listRes?.data?.datos) ? listRes.data.datos : []
  const base = rawList
    .filter(r => Number(r.id_template) === 153)
    .sort((a, b) => (Number(b.id_survey) || 0) - (Number(a.id_survey) || 0))

  const detailRows = await Promise.all(base.map(async (item) => {
    try {
      const detailResp = await apiAxios.get(`/servicio/leanglobal/procesosSurveyDetail?id_survey=${item.id_survey}`)
      const detailData = Array.isArray(detailResp.data) ? detailResp.data[0] : detailResp.data?.surveyDetail?.[0]
      const body = (() => {
        const src = detailData?.body_exec || detailData?.json_exec
        if (!src) return { segmentos: [] }
        if (typeof src === 'string') {
          try { return JSON.parse(src) } catch { return { segmentos: [] } }
        }
        return src
      })()
      const parsed = parseBodyReclamoExport(body)
      return { ...item, parsed }
    } catch {
      return { ...item, parsed: {} }
    }
  }))

  const desde = fechaDesde.value || ''
  const hasta = fechaHasta.value || ''
  const filtered = detailRows.filter(item => {
    if (!desde && !hasta) return true
    const raw =
      item?.parsed?.fecha_recepcion_reclamo ||
      item?.parsed?.fecha_creacion ||
      item?.parsed?.sysdatehhmm ||
      item?.sysdatehhmm ||
      item?.fecha_plan_ini ||
      item?.fecha_plan_fin ||
      ''
    const fecha = normalizeAnyDateToYMD(raw)

    if (!fecha) return false
    if (desde && fecha < desde) return false
    if (hasta && fecha > hasta) return false
    return true
  })

  return filtered.map(item => ({
    ic: item?.parsed?.ic || '',
    direccion: item?.parsed?.direccion || '',
    comuna: item?.parsed?.comuna || '',
    cliente: item?.parsed?.nombre_cliente || '',
    telefono: item?.parsed?.telefono || '',
    gio: item?.parsed?.gio || '',
    nro_reclamo: item?.parsed?.nro_reclamo || '',
    observacion: item?.parsed?.observacion || '',
    creacion: item?.parsed?.fecha_recepcion_reclamo || item?.parsed?.fecha_creacion || item?.parsed?.sysdatehhmm || '',
    target: item?.parsed?.fecha_target || '',
    cierre_real: item?.parsed?.fecha_cierre || '',
    sla_real: item?.parsed?.sla_real || '',
    usuario: item?.nombre_user || usersMap[item?.id_user] || '',
    estado: item?.estado_srv || '',
    inicio_plan: item?.fecha_plan_ini ? String(item.fecha_plan_ini).slice(0, 10) : '',
    fin_plan: item?.fecha_plan_fin ? String(item.fecha_plan_fin).slice(0, 10) : ''
  }))
}

function onFormulariosHistorialChange(value) {
  formulariosHistorialActivo.value = !!value
}

function cancelar() {
  cancelRequested.value = true
  textoProgreso.value = 'Cancelando…'
}

async function exportarExcel() {
  exporting.value = true
  showDialog.value = true
  cancelRequested.value = false
  avance.value = 0
  totalHojas.value = 8
  textoProgreso.value = 'Iniciando…'

  const wb = XLSX.utils.book_new()
  const exportPlanC = tab.value === 'plan_c'
  const activeCargasRef = exportPlanC ? verCargasPlanCRef : verCargasRef
  const activeInspeccionRef = exportPlanC ? crearInspeccionPlanCRef : crearInspeccionConexionRef

  try {
    textoProgreso.value = 'Generando hoja "Cargas"...'
    const cargasRows = activeCargasRef.value?.getRowsForExport?.() || []
    const cargasColumns = [
      { key: 'id_load', header: 'ID Load' },
      { key: 'fecha_carga', header: 'Fecha Carga' },
      { key: 'nombre', header: 'Nombre' },
      { key: 'id_doc', header: 'ID Doc' },
      { key: 'estado_carga', header: 'Estado Carga' },
      { key: 'observaciones', header: 'Observaciones' }
    ]
    const wsCargas = mapRowsToSheet(cargasRows, cargasColumns)
    XLSX.utils.book_append_sheet(wb, wsCargas, sanitizeSheetName('Cargas'))
    avance.value = 1

    if (cancelRequested.value) throw new Error('Exportación cancelada por el usuario.')

    textoProgreso.value = 'Generando hoja "Asignaciones"...'
    const inspeccionesRows = activeInspeccionRef.value?.getRowsForExport?.() || []
    const inspeccionesBaseColumns = [
      { key: 'id_survey', header: 'ID SURVEY' },
      { key: 'certificadora', header: 'CERTIF.' },
      { key: 'proyecto', header: 'PROYECTO' },
      { key: 'ic_sap_mg', header: 'IC_SAP MG' },
      { key: 'orden', header: 'Orden' },
      { key: 'gio', header: 'GIO' },
      { key: 'supervisor_terracon', header: 'SUP. TERRACON' },
      { key: 'tecnico', header: 'TÉCNICO' },
      { key: 'fecha', header: 'FECHA' },
      { key: 'direccion_comuna', header: 'DIRECCIÓN Y COMUNA' },
      { key: 'hora_llegada_tecnico', header: 'HORA LLEGADA T.' },
      { key: 'estado', header: 'ESTADO' },
      { key: 'estado_detalle', header: 'ESTADO DETALLE' },
      { key: 'cliente', header: 'CLIENTE' },
      { key: 'fonos', header: 'FONOS' },
      { key: 'charla', header: 'CHARLA' },
      { key: 'ats', header: 'ATS' },
      { key: 't_altura', header: 'T. ALTURA' },
      { key: 'observacion', header: 'OBSERVACIÓN' },
      { key: 'pdf', header: 'PDF' },
      { key: 'informe', header: 'INFORME' }
    ]
    const inspeccionesSupColumns = buildSurveyColumnsFromRows(inspeccionesRows, 'SUP_')
    const inspeccionesTecColumns = buildSurveyColumnsFromRows(inspeccionesRows, 'TEC_')
    const inspeccionesColumns = [
      ...inspeccionesBaseColumns,
      ...inspeccionesSupColumns,
      ...inspeccionesTecColumns
    ]
    const wsInspecciones = mapRowsToSheet(inspeccionesRows, inspeccionesColumns)
    XLSX.utils.book_append_sheet(wb, wsInspecciones, sanitizeSheetName('Asignaciones'))
    avance.value = 2

    if (cancelRequested.value) throw new Error('Exportación cancelada por el usuario.')

    textoProgreso.value = 'Generando hoja "Equipos Moviles"...'
    const equiposRows = await getEquiposMovilesRowsForExport()
    const equiposColumns = [
      { key: 'vehiculo', header: 'VEHÍCULO' },
      { key: 'responsable', header: 'RESPONSABLE' },
      { key: 'patente', header: 'PATENTE' },
      { key: 'revision_tecnica', header: 'REVISIÓN TÉCNICA' },
      { key: 'permiso_circulacion', header: 'PERMISO CIRCULACIÓN' },
      { key: 'seguro_obligatorio', header: 'SEGURO OBLIGATORIO' },
      { key: 'cert_gases', header: 'CERT GASES' },
      { key: 'poliza', header: 'PÓLIZA' },
      { key: 'documentacion', header: 'DOCUMENTACIÓN' }
    ]
    const wsEquipos = mapRowsToSheet(equiposRows, equiposColumns)
    XLSX.utils.book_append_sheet(wb, wsEquipos, sanitizeSheetName('Equipos Moviles'))
    avance.value = 3

    if (cancelRequested.value) throw new Error('Exportación cancelada por el usuario.')

    textoProgreso.value = 'Generando hoja "Asistencia"...'
    const asistenciaRows = await getAsistenciaRowsForExport()
    const asistenciaColumns = [
      { key: 'id', header: 'ID' },
      { key: 'contratista', header: 'CONTRATISTA' },
      { key: 'fecha_registro', header: 'FECHA REGISTRO' },
      { key: 'estado', header: 'ESTADO' },
      { key: 'observacion', header: 'OBSERVACIÓN' },
      { key: 'usuario', header: 'USUARIO' }
    ]
    const wsAsistencia = mapRowsToSheet(asistenciaRows, asistenciaColumns)
    XLSX.utils.book_append_sheet(wb, wsAsistencia, sanitizeSheetName('Asistencia'))
    avance.value = 4

    if (cancelRequested.value) throw new Error('Exportación cancelada por el usuario.')

    textoProgreso.value = 'Generando hoja "Personal"...'
    const personalRows = await getPersonalRowsForExport()
    const personalColumns = [
      { key: 'nombre', header: 'NOMBRE' },
      { key: 'rut', header: 'RUT' },
      { key: 'contratista', header: 'CONTRATISTA' },
      { key: 'subcontrato', header: 'SUBCONTRATO' },
      { key: 'cargo', header: 'CARGO' },
      { key: 'credencial', header: 'CREDENCIAL' },
      { key: 'inicio_contrato', header: 'INICIO CONTRATO' },
      { key: 'termino_contrato', header: 'TÉRMINO CONTRATO' },
      { key: 'desvinculacion', header: 'DESVINCULACIÓN' },
      { key: 'tipo_contrato', header: 'TIPO CONTRATO' },
      { key: 'examen_altura_estado', header: 'EXAMEN ALTURA ESTADO' },
      { key: 'examen_altura_vence', header: 'EXAMEN ALTURA VENCE' },
      { key: 'clase_3_estado', header: 'CLASE 3 ESTADO' },
      { key: 'clase_3_vence', header: 'CLASE 3 VENCE' },
      { key: 'licencia_conducir_estado', header: 'LICENCIA CONDUCIR ESTADO' },
      { key: 'licencia_conducir_vence', header: 'LICENCIA CONDUCIR VENCE' },
      { key: 'cedula_estado', header: 'CÉDULA ESTADO' },
      { key: 'cedula_vence', header: 'CÉDULA VENCE' },
      { key: 'soldadura_estado', header: 'SOLDADURA ESTADO' },
      { key: 'soldadura_vence', header: 'SOLDADURA VENCE' },
      { key: 'correo', header: 'CORREO' },
      { key: 'telefono', header: 'TELÉFONO' },
      { key: 'telefono_emergencia', header: 'TELÉFONO EMERGENCIA' },
      { key: 'fecha_nacimiento', header: 'FECHA NACIMIENTO' },
      { key: 'direccion', header: 'DIRECCIÓN' },
      { key: 'comuna', header: 'COMUNA' },
      { key: 'fecha_c4', header: 'FECHA C4' },
      { key: 'patente', header: 'PATENTE' }
    ]
    const wsPersonal = mapRowsToSheet(personalRows, personalColumns)
    XLSX.utils.book_append_sheet(wb, wsPersonal, sanitizeSheetName('Personal'))
    avance.value = 5

    if (cancelRequested.value) throw new Error('Exportación cancelada por el usuario.')

    textoProgreso.value = 'Generando hoja "Equipamiento"...'
    const equipamientoRows = await getEquipamientoRowsForExport()
    const equipamientoColumns = [
      { key: 'marca', header: 'MARCA' },
      { key: 'serie', header: 'SERIE' },
      { key: 'tipo', header: 'TIPO' },
      { key: 'estado', header: 'ESTADO' },
      { key: 'presion', header: 'PRESIÓN' },
      { key: 'fecha_registro', header: 'F. REGISTRO' },
      { key: 'ult_calib', header: 'ULT. CALIB' },
      { key: 'prox_calib', header: 'PROX. CALIB' },
      { key: 'usuario', header: 'USUARIO' },
      { key: 'cantidad', header: 'CANT.' }
    ]
    const wsEquipamiento = mapRowsToSheet(equipamientoRows, equipamientoColumns)
    XLSX.utils.book_append_sheet(wb, wsEquipamiento, sanitizeSheetName('Equipamiento'))
    avance.value = 6

    if (cancelRequested.value) throw new Error('Exportación cancelada por el usuario.')

    textoProgreso.value = 'Generando hoja "Formularios"...'
    const formulariosRows = await getFormulariosRowsForExport()
    const formulariosColumns = [
      { key: 'id_doc', header: 'ID DOC' },
      { key: 'tipo_documento', header: 'TIPO DOCUMENTO' },
      { key: 'nombre_archivo', header: 'NOMBRE ARCHIVO' },
      { key: 'observacion', header: 'OBSERVACIÓN' },
      { key: 'version', header: 'VERSIÓN' },
      { key: 'fecha_creacion', header: 'FECHA CREACIÓN' },
      { key: 'usuario', header: 'USUARIO' }
    ]
    const wsFormularios = mapRowsToSheet(formulariosRows, formulariosColumns)
    XLSX.utils.book_append_sheet(wb, wsFormularios, sanitizeSheetName('Formularios'))
    avance.value = 7

    if (cancelRequested.value) throw new Error('Exportación cancelada por el usuario.')

    textoProgreso.value = 'Generando hoja "Reclamos"...'
    const reclamosRows = await getReclamosRowsForExport()
    const reclamosColumns = [
      { key: 'ic', header: 'IC' },
      { key: 'direccion', header: 'DIRECCIÓN' },
      { key: 'comuna', header: 'COMUNA' },
      { key: 'cliente', header: 'CLIENTE' },
      { key: 'telefono', header: 'TELÉFONO' },
      { key: 'gio', header: 'GIO' },
      { key: 'nro_reclamo', header: 'N° RECLAMO' },
      { key: 'observacion', header: 'OBS' },
      { key: 'creacion', header: 'CREACIÓN' },
      { key: 'target', header: 'TARGET (+48H)' },
      { key: 'cierre_real', header: 'CIERRE REAL' },
      { key: 'sla_real', header: 'SLA REAL' },
      { key: 'usuario', header: 'USUARIO' },
      { key: 'estado', header: 'ESTADO' },
      { key: 'inicio_plan', header: 'INICIO PLAN' },
      { key: 'fin_plan', header: 'FIN PLAN' }
    ]
    const wsReclamos = mapRowsToSheet(reclamosRows, reclamosColumns)
    XLSX.utils.book_append_sheet(wb, wsReclamos, sanitizeSheetName('Reclamos'))
    avance.value = 8

    if (cancelRequested.value) throw new Error('Exportación cancelada por el usuario.')

    const hoy = new Date()
    const yyyy = hoy.getFullYear()
    const mm = String(hoy.getMonth() + 1).padStart(2, '0')
    const dd = String(hoy.getDate()).padStart(2, '0')
    const filename = `conexion_${yyyy}${mm}${dd}.xlsx`
    XLSX.writeFile(wb, filename)
    textoProgreso.value = 'Listo.'
  } catch (err) {
    if (err?.name === 'CanceledError' || String(err?.message || '').toLowerCase().includes('cancel')) {
      console.warn('Export cancelada.')
    } else {
      console.error('Error exportando:', err)
      alert(`Error exportando: ${err?.message || err}`)
    }
  } finally {
    exporting.value = false
    showDialog.value = false
  }
}


watch(canSeeDashboardSeguimiento, (canSee) => {
  if (isExternalCompany.value) {
    tab.value = 'documentos'
    return
  }

  // si pierde permiso y está en one â†’ sacarlo
  if (!canSee && tab.value === 'one') tab.value = 'four'  // o 'two'

  // si gana permiso y quedó en default (four/two) â†’ volver a one
  if (canSee && (!tab.value || tab.value === 'four' || tab.value === 'two')) {
    tab.value = 'one'
  }
}, { immediate: true })

watch(isExternalCompany, (isExternal) => {
  if (isExternal) tab.value = 'documentos'
}, { immediate: true })

const abrirFechaDesde = () => {
  const input = document.querySelector('.conexion-date-field-desde input')
  input?.showPicker?.() // moderno
  input?.focus()
}

const abrirFechaHasta = () => {
  const input = document.querySelector('.conexion-date-field-hasta input')
  input?.showPicker?.() // moderno
  input?.focus()
}
</script>

<style scoped>
.conexion-main-card {
  min-height: calc(100vh - 110px);
  display: flex;
  flex-direction: column;
}

.conexion-tabs-content {
  padding: 0 !important;
  flex: 1 1 auto;
  min-height: 0;
}

.conexion-tabs-content :deep(.v-tabs-window),
.conexion-tabs-content :deep(.v-window__container),
.conexion-tabs-content :deep(.v-window-item),
.conexion-tabs-content :deep(.v-window-item__content) {
  height: 100%;
  min-height: 0;
}

.panel-titulo {
  padding-bottom: 10px;
  font-size: 16px;
}

.fill {
  width: 98%;
  height: 100%;
}

/* Ajustes de tarjetas en pantallas pequeñas */
@media (max-width: 600px) {
  .tabs-mobile .v-slide-group__content {
    flex-wrap: wrap;
  }

  .filters-block {
    padding-inline: 12px;
  }

  .grupo {
    min-height: 240px;
    /* asegura espacio mínimo */
  }

  .grupo2 {
    height: auto;
    /* deja crecer con el contenido */
  }

  .card {
    min-height: 200px;
  }
}

/* Evita que los tabs generen scroll horizontal */
.tabs-mobile {
  overflow: hidden;
}

.conexion-tabs :deep(.v-tab) {
  min-height: 36px;
  height: 36px;
  padding-inline: 12px;
  font-size: 0.9rem;
}

.conexion-tabs :deep(.v-btn.v-tab) {
  letter-spacing: 0.06em;
}

.conexion-filtros :deep(.v-field) {
  --v-input-control-height: 44px;
  min-height: 44px;
}

.conexion-filtros :deep(.v-field__input) {
  min-height: 44px;
  padding-top: 10px;
  padding-bottom: 6px;
}

.conexion-filtros :deep(.v-field-label) {
  font-size: 0.78rem;
  line-height: 1.1;
}

.conexion-date-field :deep(.v-field),
.conexion-date-field :deep(.v-field__outline),
.conexion-date-field :deep(.v-field__outline__notch) {
  overflow: visible;
}

.conexion-date-field :deep(.v-field-label) {
  top: 50%;
  transform: translateY(-50%);
}

.conexion-date-field :deep(.v-field--focused .v-field-label),
.conexion-date-field :deep(.v-field--active .v-field-label) {
  top: 0;
  transform: translateY(-50%) scale(0.75);
}

.conexion-filter-btn {
  min-height: 32px !important;
  height: 32px !important;
  font-size: 0.75rem;
  padding-inline: 10px;
}

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

.grupo3 {
  margin: 5px;
  padding: 5px;
  border-radius: 5px;
  background-color: #eaeded;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
    0 1px 5px 0 rgba(0, 0, 0, 0.12),
    0 3px 1px -2px rgba(0, 0, 0, 0.2);
  width: 100%;
  height: calc(100vh - 200px);
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
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
}

.card.indicador {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  background: white;
}

.mini :deep(.v-card) {
  padding: 8px !important;
}

/* opcional */

/* Mitad de pantalla con scroll interno */
.carga-half {
  height: 50vh;
  /* 👈 mitad de la pantalla */
  overflow: auto;
  /* 👈 scroll dentro */
  padding: 4px;
  /* opcional */
}

/* (opcional) en móvil dale más aire */
@media (max-width: 600px) {
  .carga-half {
    height: 45vh;
    /* ajusta si quieres */
  }
}

.carga-half-scroll {
  height: 50vh;
  overflow: auto;
  /* âœ… este sí scrollea */
}

.carga-half-no-scroll {
  height: 50vh;
  display: flex;
  flex-direction: column;
  min-height: 0;
  /* 🔥 CLAVE */
  overflow: hidden;
  /* 🔥 CLAVE */
}

.conexion-date-field :deep(.v-field) {
  --v-input-control-height: 36px;
  min-height: 32px;
}

.conexion-date-field :deep(.v-field__input) {
  min-height: 32px;
  padding-top: 6px;
  padding-bottom: 4px;
}

.conexion-date-field :deep(.v-field-label) {
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.72rem;
}

.conexion-date-field :deep(.v-field--focused .v-field-label),
.conexion-date-field :deep(.v-field--active .v-field-label) {
  top: 0;
  transform: translateY(-50%) scale(0.75);
}

.conexion-date-field :deep(input) {
  font-size: 0.75rem;
}

/* INPUTS FECHA (más chicos pero estables) */
.conexion-date-field {
  width: 150px; /* antes 180 */
}

.conexion-date-field :deep(.v-field) {
  --v-input-control-height: 32px;
  min-height: 32px;
}

.conexion-date-field :deep(.v-field__input) {
  min-height: 32px;
  padding-top: 4px;
  padding-bottom: 2px;
}

/* NÚMEROS */
.conexion-date-field :deep(input) {
  font-size: 0.72rem;
}

/* LABEL */
.conexion-date-field :deep(.v-field-label) {
  font-size: 0.65rem;
  top: 50%;
  transform: translateY(-50%);
}

.conexion-date-field :deep(.v-field--focused .v-field-label),
.conexion-date-field :deep(.v-field--active .v-field-label) {
  top: 0;
  transform: translateY(-50%) scale(0.75);
}

/* BOTONES */
.conexion-filter-btn {
  min-height: 30px !important;
  height: 30px !important;
  font-size: 0.7rem;
  padding-inline: 10px;
}

/* ICONO calendario más chico */
.conexion-date-field :deep(.v-icon) {
  font-size: 16px;
}

.conexion-date-field :deep(input[type="date"])::-webkit-calendar-picker-indicator {
  opacity: 0;
  display: none;
}

.conexion-date-field :deep(input[type="date"]) {
  appearance: none;
  -webkit-appearance: none;
}
</style>



