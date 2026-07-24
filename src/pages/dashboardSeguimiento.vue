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
                  v-if="false"
                  v-show="canSeeDashboardSeguimiento"
                  value="one"
                >
                  Dashboard Seguimiento
                </v-tab>
                <v-tab
                  v-if="false"
                  value="four"
                >
                  Vista Gantt
                </v-tab>
                <v-tab value="six">
                  Dashboard V2
                </v-tab>
                <v-tab value="seven">
                  GANTT
                </v-tab>
                <v-tab value="eight">
                  PARTES PRODUCCION
                </v-tab>

                <!--v-tab value="two">Planificación Seguimiento</v-tab>
                <v-tab value="three">Agenda Seguimiento</v-tab-->

                <v-row
                  class="px-1 pt-1"
                  dense
                >
                  <v-col
                    cols="auto"
                    class="d-none"
                  >
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
                  <v-col
                    cols="auto"
                    class="d-none"
                  >
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
                  v-if="false"
                  v-show="canSeeDashboardSeguimiento"
                  value="one"
                >
                  Dashboard Seguimiento
                </v-tab>
                <v-tab
                  v-if="false"
                  value="four"
                >
                  Vista Gantt
                </v-tab>
                <v-tab value="six">
                  Dashboard V2
                </v-tab>
                <v-tab value="seven">
                  GANTT
                </v-tab>
                <v-tab value="eight">
                  PARTES PRODUCCION
                </v-tab>

                <!--v-tab value="two">Planificación Seguimiento</v-tab>
                <v-tab value="three">Agenda Seguimiento</v-tab-->
              </v-tabs>

              <v-row
                class="px-3 pt-3 ga-2"
                dense
              >
                <v-col
                  cols="12"
                  class="d-none"
                >
                  <v-text-field
                    v-model="fechaDesdeSeleccionada"
                    label="Fecha Inicio Plan"
                    type="date"
                    density="compact"
                    variant="outlined"
                    hide-details
                  />
                </v-col>
                <v-col
                  cols="12"
                  class="d-none"
                >
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
                  v-if="false"
                  value="one"
                >
                  <v-row
                    class="mb-0"
                    dense
                  >
                    <v-col cols="6">
                      <v-row dense>
                        <v-col cols="12">
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
                          <MiniKPIChart
                            :height-px="200"
                            title="Horas Hombre"
                            :data-map="hhMap"
                            class="mini"
                          />
                        </v-col>
                        <v-col
                          cols="12"
                          md="6"
                        >
                          <MiniKPIChart
                            :height-px="200"
                            title="Margen Bruto"
                            :data-map="margenMap"
                            class="mini"
                          />
                        </v-col>
                        <v-col
                          cols="12"
                          md="6"
                        >
                          <MiniKPIChart
                            :height-px="200"
                            title="Rendimiento"
                            :data-map="rendiMap"
                            class="mini"
                          />
                        </v-col>
                        <v-col
                          cols="12"
                          md="6"
                        >
                          <MiniKPIChart
                            :height-px="200"
                            title="Productividad"
                            :data-map="prodMap"
                            class="mini"
                          />
                        </v-col>
                        <v-col
                          cols="12"
                          style="padding-top: 15px;"
                        >
                          <MetricasIndicadores
                            v-model:tipo="tipoSeleccionado"
                            :config="jsonMetricas"
                            class="mini"
                          />
                        </v-col>
                      </v-row>
                    </v-col>
                    <v-col cols="6">
                      <v-row dense>
                        <v-col cols="12">
                          <div class="grupo">
                            <div class="panel-titulo">
                              Curva S
                            </div>
                            <!-- Que el mapa se adapte de alto -->
                            <!--v-responsive :aspect-ratio="smAndDown ? 4/3 : 16/9"-->
                            <!--CurvaS
                                :fecha-desde="fechaDesde"
                                :fecha-hasta="fechaHasta"
                                :cliente-id="clienteSeleccionado"
                                :proyecto-id="proyectoSeleccionado"
                                url-curva-s="/reportes/curvaS"
                                titulo="Curva S del Proyecto Proy02-Clie01"
                                :default-series="{
                                  categories: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
                                  plan: [3,7,12,20,28,40,55,72,85,95,100,100],
                                  real: [2,6,10,18,25,38,53,70,82,92,98,100]
                                }"
                              /-->
                            <CurvaS
                              ref="curvaSRef"
                              titulo="Curva S Plan / Real (Gantt)"
                              :default-series="{ categories:[], plan:[], real:[] }"
                            />
                            <!--/v-responsive-->
                          </div>
                        </v-col>
                        <v-col
                          cols="12"
                          class="d-flex"
                        >
                          <div class="grupo grupo2 flex-grow-1">
                            <VerInspecciones
                              ref="verInspeccionesComp"
                              :fecha-desde="fechaDesde"
                              :fecha-hasta="fechaHasta"
                              :cliente-id="cliente"
                              :proyecto-id="proyecto"
                              :estado-survey="estadoFiltro"
                              :seguimiento="true"
                            />
                          </div>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-tabs-window-item>

                <v-tabs-window-item
                  v-if="false"
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
                  <!--v-row class="mb-0" dense>
                    <v-col cols="12">
                      <GanttTabla2 v-if="tab === 'four'" :options="ganttOptions" />
                    </v-col>
                  </v-row-->
                  <!--v-row class="mb-0" dense>
                    <v-col cols="12">
                      <GanttTabla v-if="tab === 'four'" :options="ganttOptions" />
                    </v-col>
                  </v-row>
                  <v-row class="mb-0" dense>
                    <v-col cols="12">
                      <GanttSeguimiento v-if="tab === 'four'" :options="ganttOptions" />
                    </v-col>
                  </v-row-->

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



                <!-- TAB 6: DASHBOARD V2 (MODERNO) -->
                <v-tabs-window-item value="six">
                  <div
                    class="pa-4"
                    style="background-color: #f8fafc; min-height: 600px;"
                  >
                    <DashboardSonacolServidumbre
                      v-if="isSonacolServidumbre"
                      :fecha-desde="fechaDesde"
                      :fecha-hasta="fechaHasta"
                      :cliente-id="safeCliente"
                      :proyecto-id="safeProyecto"
                    />
                    <v-row
                      v-else
                      dense
                    >
                      <!-- Columna Izquierda: Indicadores de Grupo, Mini Charts y Métricas -->
                      <v-col
                        cols="12"
                        md="6"
                      >
                        <v-row dense>
                          <!-- Indicadores de Grupo -->
                          <v-col cols="12">
                            <div class="grupos-v2">
                              <template
                                v-for="(item, index) in jsonData"
                                :key="index"
                              >
                                <div
                                  v-for="(grupo, gIndex) in item.grupo"
                                  v-if="item.grupo"
                                  :key="gIndex"
                                  class="mb-4"
                                >
                                  <GrupoIndicadorV2
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
                              </template>
                            </div>
                          </v-col>

                          <!-- Mini KPIs Grid -->
                          <v-col
                            cols="12"
                            class="mt-4"
                          >
                            <v-row
                              dense
                              class="mx-0 mb-4"
                            >
                              <v-col
                                cols="6"
                                sm="3"
                              >
                                <MiniKPIChartV2
                                  title="Horas Hombre"
                                  :data-map="hhMap"
                                  color="#0ea5e9"
                                  unit="HH"
                                />
                              </v-col>
                              <v-col
                                cols="6"
                                sm="3"
                              >
                                <MiniKPIChartV2
                                  title="Margen Bruto"
                                  :data-map="margenMap"
                                  color="#10b981"
                                  unit="USD"
                                />
                              </v-col>
                              <v-col
                                cols="6"
                                sm="3"
                              >
                                <MiniKPIChartV2
                                  title="Rendimiento"
                                  :data-map="rendiMap"
                                  color="#f59e0b"
                                  unit="%"
                                />
                              </v-col>
                              <v-col
                                cols="6"
                                sm="3"
                              >
                                <MiniKPIChartV2
                                  title="Productividad"
                                  :data-map="prodMap"
                                  color="#8b5cf6"
                                  unit="UXH"
                                />
                              </v-col>
                            </v-row>
                          </v-col>

                          <v-col
                            cols="12"
                            class="mt-2"
                          >
                            <MetricasIndicadoresV2
                              v-model:tipo="tipoSeleccionado"
                              :config="jsonMetricas"
                              :fecha-desde="fechaDesde"
                              :fecha-hasta="fechaHasta"
                              :safe-cliente="safeCliente"
                              :safe-proyecto="safeProyecto"
                              :teratrib="teratrib"
                              :id-activo="idActivo"
                              @toggle="onToggle"
                            />
                          </v-col>
                        </v-row>
                      </v-col>

                      <!-- Columna Derecha: Curva S e Inspecciones -->
                      <v-col
                        cols="12"
                        md="6"
                      >
                        <v-row dense>
                          <v-col cols="12">
                            <v-card
                              variant="outlined"
                              class="rounded-lg bg-white"
                              style="border-color: #e2e8f0 !important;"
                            >
                              <v-toolbar
                                flat
                                density="compact"
                                color="white"
                                class="border-bottom"
                              >
                                <v-toolbar-title class="text-subtitle-1 font-weight-bold text-slate-700">
                                  Curva S Plan / Real (Gantt)
                                </v-toolbar-title>
                                <v-spacer />
                                <v-select
                                  v-model="curvaSMesSeleccionado"
                                  :items="curvaSMesOptions"
                                  item-title="title"
                                  item-value="value"
                                  label="Mes"
                                  density="compact"
                                  variant="outlined"
                                  hide-details
                                  class="mr-2"
                                  style="max-width: 220px;"
                                />
                              </v-toolbar>
                              <v-card-text class="pa-4">
                                <CurvaSV2
                                  ref="curvaSRefV2"
                                  :default-series="{ categories:[], plan:[], real:[] }"
                                />
                              </v-card-text>
                            </v-card>
                          </v-col>

                          <v-col
                            cols="12"
                            class="mt-4"
                          >
                            <v-card
                              variant="outlined"
                              class="rounded-lg bg-white overflow-hidden"
                              style="border-color: #e2e8f0 !important;"
                            >
                              <v-toolbar
                                flat
                                density="compact"
                                color="white"
                                class="border-bottom"
                              >
                                <v-toolbar-title class="text-subtitle-1 font-weight-bold text-slate-700">
                                  Seguimiento de Inspecciones
                                </v-toolbar-title>
                              </v-toolbar>
                              <v-card-text class="pa-0">
                                <VerInspecciones
                                  :fecha-desde="fechaDesde"
                                  :fecha-hasta="fechaHasta"
                                  :cliente-id="cliente"
                                  :proyecto-id="proyecto"
                                  :estado-survey="estadoFiltro"
                                  :seguimiento="true"
                                />
                              </v-card-text>
                            </v-card>
                          </v-col>
                        </v-row>
                      </v-col>
                    </v-row>
                  </div>
                </v-tabs-window-item>

                <!-- TAB GANTTV3 (N-NIVELES) -->
                <v-tabs-window-item value="seven">
                  <v-row
                    class="mb-0 px-3 pt-2"
                    dense
                  >
                    <v-col cols="12">
                      <v-card
                        variant="outlined"
                        class="rounded-lg bg-slate-50 border-info"
                      >
                        <v-card-text class="pa-3 d-flex align-center">
                          <v-icon
                            color="info"
                            size="20"
                            class="mr-3"
                          >
                            mdi-information-outline
                          </v-icon>
                          <span class="text-caption font-weight-bold">GANTT V3: Estructura jerárquica N-Niveles basada en Códigos EDT con soporte para múltiples equipos.</span>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                  <v-row
                    class="mb-0 px-3 pb-3"
                    dense
                  >
                    <v-col
                      cols="12"
                      style="height: calc(100vh - 280px); min-height: 500px; position: relative;"
                      class="rounded-lg border bg-white"
                    >
                      <div
                        v-if="cargandoGanttV3"
                        class="d-flex w-100 h-100 align-center justify-center"
                      >
                        <v-progress-circular
                          indeterminate
                          color="info"
                          size="64"
                        />
                      </div>
                      <GanttasticV3
                        v-else-if="tab === 'seven'"
                        :tareas="tareasGanttV3"
                        :fecha-desde="fechaDesde"
                        :fecha-hasta="fechaHasta"
                        :equipos-proyecto="equiposProyectoV3"
                        :usuarios="roles"
                        @refresh="obtenerTareasGanttV3"
                        @task-click="(row, dayKey) => openPpd2ModalFromTask(row, dayKey)"
                      />
                    </v-col>
                  </v-row>
                </v-tabs-window-item>

                <!-- TAB 8: PARTES PRODUCCION -->
                <v-tabs-window-item value="eight">
                  <div
                    class="pa-4 bg-slate-50"
                    style="min-height: 600px;"
                  >
                    <PartesProduccionTable
                      :fecha-desde="fechaDesde"
                      :fecha-hasta="fechaHasta"
                      :cliente-id="safeCliente"
                      :proyecto-id="proyectoSeleccionado"
                    />
                  </div>
                </v-tabs-window-item>



                <!-- TAB 2 -->
                <v-tabs-window-item value="two">
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
  </v-dialog>

  <!-- Modal PPD desde Gantt V3 → usa el reporte PPD oficial de Sonacol (Estructura V1/V2) -->
  <v-dialog
    v-model="showPpd2Modal"
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
          @click="showPpd2Modal = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <!-- Cargando surveys -->
      <v-card-text
        v-if="ppd2SurveyLoading"
        class="d-flex justify-center align-center"
        style="min-height: 200px; background-color: #f8fafc;"
      >
        <v-progress-circular
          indeterminate
          color="primary"
          size="48"
        />
      </v-card-text>

      <!-- Sin surveys -->
      <v-card-text
        v-else-if="!ppd2SurveyIds.length"
        class="text-center text-grey bg-slate-50"
        style="min-height: 200px; display:flex; align-items:center; justify-content:center;"
      >
        <div>
          <v-icon
            size="48"
            color="grey-lighten-2"
          >
            mdi-clipboard-text-off-outline
          </v-icon>
          <p class="mt-2 text-body-2">
            Sin partes de producción registrados para este día.
          </p>
        </div>
      </v-card-text>

      <!-- Un solo survey -->
      <v-card-text
        v-else-if="ppd2SurveyIds.length === 1"
        class="pa-4 bg-slate-50"
        style="max-height: 80vh;"
      >
        <PpdReportDocument
          :survey-id="ppd2SurveyIds[0]"
          :fecha="ppd2ModalFecha"
          :gantt-tasks="tareasGanttV3"
          @signed="obtenerTareasGanttV3"
        />
      </v-card-text>

      <!-- Múltiples surveys → tabs -->
      <template v-else>
        <v-tabs
          v-model="ppd2SurveyTab"
          color="primary"
          density="compact"
          class="border-b bg-white"
        >
          <v-tab
            v-for="(id, idx) in ppd2SurveyIds"
            :key="id"
            :value="idx"
            class="font-weight-bold text-caption"
          >
            PPD #{{ id }}
          </v-tab>
        </v-tabs>
        <v-card-text
          class="pa-4 bg-slate-50"
          style="max-height: 80vh;"
        >
          <PpdReportDocument
            :key="ppd2SurveyIds[ppd2SurveyTab ?? 0]"
            :survey-id="ppd2SurveyIds[ppd2SurveyTab ?? 0]"
            :fecha="ppd2ModalFecha"
            :gantt-tasks="tareasGanttV3"
            @signed="obtenerTareasGanttV3"
          />
        </v-card-text>
      </template>

      <v-card-actions class="pa-4 bg-slate-100 border-top justify-end no-print">
        <v-btn
          color="slate-600"
          variant="flat"
          class="text-white font-weight-bold"
          @click="showPpd2Modal = false"
        >
          Cerrar Visualizador
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import axios from 'axios';
import DashboardLayout from '../layouts/dashboard.vue';
import GrupoIndicador from '../components/GrupoIndicador.vue'
import GrupoIndicadorV2 from '../components/GrupoIndicadorV2.vue'
import MiniKPIChart from '../components/MiniKPIChart.vue'
import MiniKPIChartV2 from '../components/MiniKPIChartV2.vue';
import VerInspecciones from '../components/VerInspecciones.vue';
import VerPartesProduccion from '../components/VerPartesProduccion.vue';
import VerCalendario from '../components/VerCalendario.vue';
import VerSurvey from '../components/VerSurvey.vue';
import Mapa from '../components/Mapa.vue';
import CurvaS from '../components/GraficoSeguimiento.vue';
import CurvaSV2 from '../components/CurvaSV2.vue';
import Highcharts, { GanttChart } from 'highcharts/highcharts-gantt'
import MetricasIndicadoresV2 from '../components/MetricasIndicadoresV2.vue';
import DashboardSonacolServidumbre from '../components/DashboardSonacolServidumbre.vue';
import GanttSeguimiento from '../components/GanttSeguimiento.vue';
import GanttGSTC from '../components/GanttGSTC.vue';
import GanttTabla from '@/components/GanttTabla.vue';
import Ganttastic from '@/components/Ganttastic.vue';
import GanttasticRuta from '@/components/GanttasticRuta.vue';
import GanttasticRuta2 from '@/components/GanttasticRuta2.vue';
import GanttasticV2 from '@/components/GanttasticV2.vue';
import TablaHistorialVersionesSeguimiento from '../components/TablaHistorialVersionesSeguimiento.vue';
import { ref, onMounted, computed, nextTick, watch } from 'vue';
import apiAxios from '@/services/api';
import CrearInspeccion from '../components/CrearInspeccion.vue';

import { useRouter } from 'vue-router'

import { useUserDetailStore } from "@/stores/userDetail";

import * as XLSX from 'xlsx';

import GanttasticV3 from '../components/GanttasticV3.vue';
import PpdReportDocument from '../components/PpdReportDocument.vue';
import PartesProduccionTable from '../components/PartesProduccionTable.vue';
import { useDisplay } from 'vuetify'

const { smAndDown } = useDisplay()
const { mdAndUp } = useDisplay()

const userDetailStore = useUserDetailStore()

const router = useRouter()

const clientes = ref([]);
const proyectos = ref([]);
const familias = ref([]);
const tareas = ref([]);

const cliente = ref(null);
const clienteSeleccionado = ref(3);
const proyecto = ref(null);
const proyectoSeleccionado = ref(1);

const loading = ref(false);
const error = ref(null);

const today = new Date();

const tabGantts = ref('gantt');

const verCritico = computed({
  get: () => tabGantts.value === 'critico',
  set: (val) => {
    tabGantts.value = val ? 'critico' : 'gantt';
  },
});

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

const teratrib = ref();
const teratribSeleccionado = ref(3);
const jsonData = ref([]);

const chartContainer = ref(null);
const chartInstance = ref(null)

const tab = ref(null);
const ganttRef = ref(null)

const dataCurvaSGlobal = ref({ categories: [], plan: [], real: [] })

watch(tab, async (val) => {
  if (val === 'four') {
    await nextTick()
    ganttRef.value?.reflowChart()
  }
  if (val === 'six') {
    await nextTick()
    if (dataCurvaSGlobal.value.categories.length) {
      curvaSRefV2.value?.setSeries(dataCurvaSGlobal.value)
    }
  }
})

const showModal = ref(false);
const selectedSurveyId = ref(null);
const showPpd2Modal = ref(false)
const ppd2ModalFecha = ref('')
const ppd2SurveyIds = ref([])
const ppd2SurveyTab = ref(0)
const ppd2SurveyLoading = ref(false)

const mapaComp = ref(null);

const crearInspeccionComp = ref(null)
const verInspeccionesComp = ref(null)

const idActivo = ref(null)
const tituloActivo = ref(null)
const estadoFiltro = ref(null)

const tipoSeleccionado = ref(null);
const jsonMetricas = computed(() => {
  const item = jsonData.value?.find(i => i.metricas)
  return item ? { metricas: item.metricas } : null
})

const tareasGantt = ref([]);
const tareasGanttV2 = ref([]);
const cargandoGanttV2 = ref(false);
const canRenderGanttV2 = computed(() => Array.isArray(tareasGanttV2.value) && tareasGanttV2.value.length > 0);

const tareasGanttV3 = ref([]);
const cargandoGanttV3 = ref(false);
const equiposProyectoV3 = ref([]);
const cargandoEquiposV3 = ref(false);

const obtenerEquiposProyectoV3 = async () => {
  const pId = normalizeProyectoId(proyectoSeleccionado.value)
  if (!pId) return
  cargandoEquiposV3.value = true
  try {
    console.log('📦 Cargando equipos para proyecto:', pId)
    const response = await apiAxios.get('/servicio/leanglobal/obtenerEquiposProyectos', {
      params: { id_proyecto: pId }
    })
    equiposProyectoV3.value = response.data
    console.log('✅ Equipos cargados:', equiposProyectoV3.value.length)
  } catch (err) {
    console.error('❌ Error al obtener equipos:', err)
  } finally {
    cargandoEquiposV3.value = false
  }
}

const curvaSRef = ref(null);
const curvaSRefV2 = ref(null);
const curvaSMesSeleccionado = ref('ALL')
const curvaSMesOptions = [
  { title: 'Año completo', value: 'ALL' },
  { title: 'Enero', value: 1 },
  { title: 'Febrero', value: 2 },
  { title: 'Marzo', value: 3 },
  { title: 'Abril', value: 4 },
  { title: 'Mayo', value: 5 },
  { title: 'Junio', value: 6 },
  { title: 'Julio', value: 7 },
  { title: 'Agosto', value: 8 },
  { title: 'Septiembre', value: 9 },
  { title: 'Octubre', value: 10 },
  { title: 'Noviembre', value: 11 },
  { title: 'Diciembre', value: 12 },
]

const roles = ref([])
const rolesCatalog = ref([])

const obtenerRolesCatalog = async () => {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerRoles')
    rolesCatalog.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('Error al obtener roles catalog:', e)
    rolesCatalog.value = []
  }
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

const ID_AVAN_PROG = 32 // <-- PON AQUÍ EL id_rol real de AVAN_PROG

const canSeeDashboardSeguimiento = computed(() => {
  const userId = Number(userDetailStore.userDetail?.id_user)
  if (!userId) return false

  return roles.value.some(r =>
    Number(r.id_user) === userId &&
    Number(r.id_rol) === ID_AVAN_PROG
  )
})

const isSonacolServidumbre = computed(() => {
  if (!safeCliente.value || !safeProyecto.value) return false
  const selectedCli = clientes.value.find(c => Number(c.id_empresa) === Number(safeCliente.value))
  const selectedProj = proyectos.value.find(p => Number(p.id_proyecto) === Number(safeProyecto.value))
  if (!selectedCli || !selectedProj) return false
  
  const cliName = String(selectedCli.name_empresa || '').toLowerCase()
  const projName = String(selectedProj.nombre_proyecto || '').toLowerCase()
  
  return cliName.includes('sonacol') && projName.includes('servidumbre')
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
  const mesFiltro = curvaSMesSeleccionado.value
  const fechasFiltradas = (mesFiltro === 'ALL')
    ? fechas
    : fechas.filter((f) => {
      const d = new Date(`${f}T00:00:00`)
      if (Number.isNaN(d.getTime())) return false
      return (d.getMonth() + 1) === Number(mesFiltro)
    })

  const planDiario = fechasFiltradas.map(f => porDia[f].plan);
  const realDiario = fechasFiltradas.map(f => porDia[f].real);
  let accPlan = 0
  let accReal = 0
  const planAcum = planDiario.map((v) => (accPlan += v))
  const realAcum = realDiario.map((v) => (accReal += v))

  const categories = fechasFiltradas.map(f => {
    const d = new Date(`${f}T00:00:00`);
    if (Number.isNaN(d.getTime())) return String(f);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  });

  const result = {
    categories,
    plan: planAcum,
    real: realAcum
  };
  dataCurvaSGlobal.value = result;
  return result;
}

async function cargarCurvaSGantt() {
  const datos = await cargarCurvaSPlanReal();

  if (curvaSRef.value) {
    curvaSRef.value.setSeries({
      categories: datos.categories,
      plan: datos.plan,
      real: datos.real
    });
  }
  if (curvaSRefV2.value) {
    curvaSRefV2.value.setSeries({
      categories: datos.categories,
      plan: datos.plan,
      real: datos.real
    });
  }
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

// mapa de títulos → estado backend
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

const exportConfig = ref() // 👈 REACTIVO

// demo: cada “map” agrupa por opción del select.
// El select cambia automáticamente con las claves del objeto.
const categorias = ['Ene','Feb','Mar','Abr','May','Jun']

/*const hhMap = {
  'Cuadrilla 1': {
    categories: categorias,
    series: [{ name:'HH', type:'area', data:[0,0,0,0,0,0] }]
  },
  'Cuadrilla 2': {
    categories: categorias,
    series: [{ name:'HH', type:'area', data:[0,0,0,0,0,0] }]
  }
}*/
const hhMap = {
  '': {
    categories: categorias,
    series: [{ name:'HH', type:'area', data:[0,0,0,0,0,0] }]
  },
  '': {
    categories: categorias,
    series: [{ name:'HH', type:'area', data:[0,0,0,0,0,0] }]
  }
}

const margenMap = {
  '': {
    categories: categorias,
    series: [{ name:'Margen', type:'area', data:[0,0,0,0,0,0] }]
  },
  '': {
    categories: categorias,
    series: [{ name:'Margen', type:'area', data:[0,0,0,0,0,0] }]
  }
}

const rendiMap = {
  '': {
    categories: categorias,
    series: [{ name:'Rend.', type:'area', data:[0,0,0,0,0,0] }]
  },
  '': {
    categories: categorias,
    series: [{ name:'Rend.', type:'area', data:[0,0,0,0,0,0] }]
  }
}

const prodMap = {
  '': {
    categories: categorias,
    series: [{ name:'Prod.', type:'area', data:[0,0,0,0,0,0] }]
  },
  '': {
    categories: categorias,
    series: [{ name:'Prod.', type:'area', data:[0,0,0,0,0,0] }]
  }
}

onMounted(async () => {
  console.log('userDetailStore.userDetail', userDetailStore.userDetail);
  // Obtener datos necesarios
  cargarCurvaSGantt();
  await obtenerClientes();
  await obtenerRoles();
  await obtenerRolesCatalog();
  await obtenerProyectos(3);
  await obtenerFamilias();
  await obtenerTareas();
  await obtenerTareasGantt();

  // ✅ setea tab inicial solo una vez (tabs one/four ocultos)
  if (!tab.value) {
    tab.value = 'six'
  }

  const resp = await fetch(import.meta.env.BASE_URL + 'dataSeguimiento.json');
  const data = await resp.json();
  jsonData.value = data;
  console.log('jsonData', jsonData.value);

  // jsonMetricas.value = { metricas: jsonData.value[1].metricas } // 👈 removed, now computed
  console.log("jsonMetricas", jsonMetricas.value);

  const exportNode = Array.isArray(data) ? data.find(o => o && o.export) : null
  if (exportNode?.export) {
    exportConfig.value = exportNode.export
  }

  await nextTick();
  mapaComp.value?.refreshMap();

  await nextTick()
  await filtrar()

  //initChart();
});

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

const toYmd = (v) => {
  if (!v) return ''
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v.toISOString().slice(0, 10)
  const s = String(v).trim()
  if (!s) return ''
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (m) return `${m[1]}-${m[2]}-${m[3]}`
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

const resolvePpd2FechaForTask = (task) => {
  const desde = toYmd(fechaDesde.value) || toYmd(fechaDesdeSeleccionada.value)
  const hasta = toYmd(fechaHasta.value) || toYmd(fechaHastaSeleccionada.value)
  const diarios = Array.isArray(task?.json_data) ? task.json_data : []
  const fechas = diarios
    .map((it) => toYmd(it?.fecha ?? it?.date ?? it?.dia))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))
  if (desde && hasta) {
    const inRange = fechas.find((f) => f >= desde && f <= hasta)
    if (inRange) return inRange
  }
  return (
    fechas[0] ||
    toYmd(task?.fecha_ini_plan) ||
    toYmd(task?.fecha_fin_plan) ||
    desde ||
    toYmd(new Date())
  )
}

async function openPpd2ModalFromTask(task, overrideFecha) {
  const fecha = overrideFecha || resolvePpd2FechaForTask(task)
  const proyectoId = normalizeProyectoId(proyectoSeleccionado.value) || task?.id_proyecto || ''
  const clienteId = normalizeClienteId(clienteSeleccionado.value) || task?.id_empresa_cliente || ''

  ppd2ModalFecha.value = fecha
  ppd2SurveyIds.value = []
  ppd2SurveyTab.value = 0
  ppd2SurveyLoading.value = true
  showPpd2Modal.value = true

  try {
    const params = new URLSearchParams({
      fecha_desde: fecha,
      fecha_hasta: fecha,
    })
    if (proyectoId) params.append('ts.id_proyecto', String(proyectoId))
    if (clienteId) params.append('ts.id_empresa_cliente', String(clienteId))

    const resp = await apiAxios.get(`/servicio/leanglobal/procesosSurveyV3?${params.toString()}`)
    const rows = Array.isArray(resp.data)
      ? resp.data
      : Array.isArray(resp.data?.datos)
      ? resp.data.datos
      : []

    ppd2SurveyIds.value = rows
      .map(s => Number(s?.id_survey || 0))
      .filter(id => id > 0)
  } catch (e) {
    console.error('Error al buscar surveys PPD para Gantt:', e)
    ppd2SurveyIds.value = []
  } finally {
    ppd2SurveyLoading.value = false
  }
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
  } catch (err) {
    console.error('Error al obtener tareas gantt:', err);
  }
}

const obtenerTareasGanttV2 = async () => {
  if (!hasGanttV2Selection()) {
    tareasGanttV2.value = []
    return
  }

  cargandoGanttV2.value = true;
  try {
    const response = await apiAxios.get('/servicio/leanglobal/obtenerGanttsTareasV2', {
      params: {
        id_proyecto: normalizeProyectoId(proyectoSeleccionado.value) || ''
      }
    });
    // Si la API devuelve {datos: [...], Count: ...}, extraemos datos. Si es array, lo usamos directo.
    const payload = response.data
    const data =
      Array.isArray(payload) ? payload :
      Array.isArray(payload?.datos) ? payload.datos :
      Array.isArray(payload?.data) ? payload.data :
      []
    tareasGanttV2.value = filtrarTareasGanttV2PorSeleccion(data);
    console.log("tareasGanttV2", tareasGanttV2.value)
    const tareasGanttV2SinJsonData = (tareasGanttV2.value || []).map(({ json_data, ...rest }) => rest);
    console.log("tareasGanttV2_sin_json_data_json", JSON.stringify(tareasGanttV2SinJsonData, null, 2));
    const tareasConPctDistintoDeCero = tareasGanttV2SinJsonData.filter((tarea) =>
      Object.entries(tarea).some(([key, value]) =>
        key.toLowerCase().includes('pct') && Number(value) !== 0
      )
    );
    console.log(
      "tareasGanttV2_con_pct_distinto_de_cero_json",
      JSON.stringify(tareasConPctDistintoDeCero, null, 2)
    );
  } catch (err) {
    error.value = 'Error al obtener tareas gantt: ' + err.message;
    console.error(err);
  } finally {
    loading.value = false;
    cargandoGanttV2.value = false;
  }
}

const obtenerTareasGanttV3 = async () => {
  if (!proyectoSeleccionado.value) {
    tareasGanttV3.value = []
    return
  }
  cargandoGanttV3.value = true;
  try {
    const response = await apiAxios.get('/servicio/leanglobal/obtenerGanttsTareasV3', {
      params: {
        id_proyecto: Number(proyectoSeleccionado.value)
      }
    });
    const payload = response.data
    tareasGanttV3.value = Array.isArray(payload) ? payload : (payload?.datos || [])
  } catch (err) {
    console.error('Error al obtener tareas gantt V3:', err);
  } finally {
    cargandoGanttV3.value = false;
  }
}

const cargarHijosGanttV2 = async (id_padre) => {
  try {
    // Cambiamos a GET porque el servidor suele escuchar GET en serviciosGeneral/servicioDobleNivel
    // Y pasamos id_tarea_padre como query param.
    const response = await apiAxios.get('/servicio/leanglobal/obtenerGanttHijosV2', {
      params: { id_tarea_padre: id_padre }
    });

    const payload = response.data
    const data =
      Array.isArray(payload) ? payload :
      Array.isArray(payload?.datos) ? payload.datos :
      Array.isArray(payload?.data) ? payload.data :
      []
    const dataFiltrada = filtrarTareasGanttV2PorSeleccion(data)

    // Solo agregamos las que no existen ya (por si acaso el evento se dispara dos veces)
    const nuevos = dataFiltrada.filter(
      n => !tareasGanttV2.value.some(t => t.id_tarea === n.id_tarea)
    );

    if (nuevos.length > 0) {
      tareasGanttV2.value.push(...nuevos);
    }
  } catch (err) {
    console.error('Error al cargar hijos de gantt v2:', err);
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

function hasSelectedValue(v) {
  return v !== null && v !== undefined && v !== ''
}

function normalizeClienteId(v) {
  if (!hasSelectedValue(v)) return ''
  if (typeof v === 'object') return v.id_empresa ?? v.value ?? ''
  return v
}

function normalizeProyectoId(v) {
  if (!hasSelectedValue(v)) return ''
  if (typeof v === 'object') return v.id_proyecto ?? v.value ?? ''
  return v
}

function hasGanttV2Selection() {
  return hasSelectedValue(normalizeProyectoId(proyectoSeleccionado.value))
}

function getTaskIdByKeys(task, keys) {
  for (const k of keys) {
    const value = task?.[k]
    if (hasSelectedValue(value)) return String(value).trim()
  }
  return ''
}

function filtrarTareasGanttV2PorSeleccion(data) {
  const proyectoId = String(normalizeProyectoId(proyectoSeleccionado.value) ?? '').trim()

  return (Array.isArray(data) ? data : []).filter((task) => {
    const taskProyecto = getTaskIdByKeys(task, ['id_proyecto', 'proyecto_id'])

    return !proyectoId || taskProyecto === proyectoId
  })
}

watch(clienteSeleccionado, async (nuevoCliente) => {
  const clienteId = normalizeClienteId(nuevoCliente)
  if (clienteId !== nuevoCliente) clienteSeleccionado.value = clienteId

  // Limpia inmediatamente el select de proyecto
  proyectoSeleccionado.value = null
  proyecto.value = ''        // si usas este para filtrar abajo
  proyectos.value = []       // vacía la lista para que no quede “fantasma”

  if (hasSelectedValue(clienteId)) {
    await obtenerProyectos(clienteId)
  }

  if (tab.value === 'five') {
    await obtenerTareasGanttV2()
  } else if (!hasGanttV2Selection()) {
    tareasGanttV2.value = []
  }
})

watch(proyectoSeleccionado, async () => {
  if (tab.value === 'five') {
    await obtenerTareasGanttV2()
  } else if (tab.value === 'seven') {
    await obtenerTareasGanttV3()
    await obtenerEquiposProyectoV3()
  } else if (!hasGanttV2Selection()) {
    tareasGanttV2.value = []
  }
})

watch(tabGantts, async (nuevo) => {
  // Solo si estás en la pestaña "Vista Gantt"
  if (tab.value === 'four') {
    await obtenerTareasGantt()
  }
})

watch(tab, async (nuevoTab) => {
  if (nuevoTab === 'four') {
    await obtenerTareasGantt()
  } else if (nuevoTab === 'five') {
    if (hasGanttV2Selection()) {
      await obtenerTareasGanttV2()
    } else {
      tareasGanttV2.value = []
    }
  } else if (nuevoTab === 'seven') {
    await obtenerTareasGanttV3()
    await obtenerEquiposProyectoV3()
  }
})

watch(curvaSMesSeleccionado, async () => {
  await cargarCurvaSGantt()
})


const BYPASS_ROLES = new Set(['AVAN_PROG', 'AVAN_GCIA', 'AVAN_ADMIN', 'AVAN_APRB', 'GRAL_PROG', 'GRAL_GCIA', 'GRAL_ADMIN', 'GRAL_APRB'])

function getRolesNames() {
  const list = []
  try {
    const raw = JSON.parse(localStorage.getItem('rolesNames') || '[]')
    if (Array.isArray(raw)) {
      list.push(...raw.map(r => String(r || '').trim().toUpperCase()))
    }
  } catch {}

  const userId = Number(userDetailStore.userDetail?.id_user)
  if (userId && roles.value.length && rolesCatalog.value.length) {
    const roleMap = new Map(rolesCatalog.value.map(r => [Number(r.id_rol), String(r.name_rol || '').trim().toUpperCase()]))
    const mine = roles.value
      .filter(r => Number(r.id_user) === userId)
      .map(r => roleMap.get(Number(r.id_rol)))
      .filter(Boolean)
    list.push(...mine)
  }

  return Array.from(new Set(list)).filter(Boolean)
}

function getProjectsIds() {
  try {
    const rawLegacy = JSON.parse(localStorage.getItem('proyectsIds') || '[]')
    const rawAlt = JSON.parse(localStorage.getItem('projectsIds') || '[]')
    const raw = Array.isArray(rawLegacy) && rawLegacy.length ? rawLegacy : rawAlt
    return Array.isArray(raw)
      ? raw.map(v => String(v ?? '').trim()).filter(Boolean)
      : []
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

    const payload = response.data
    let data =
      Array.isArray(payload) ? payload :
      Array.isArray(payload?.datos) ? payload.datos :
      Array.isArray(payload?.data) ? payload.data :
      []

    // 🔐 Si NO es PROG/GCIA/ADMIN → filtrar por projectsIds (localStorage)
    if (!canSeeAllProjects()) {
      const projectsIds = getProjectsIds()

      // Si no hay lista de proyectos permitidos, no forzamos vacío.
      // Evita dejar el select "Proyecto" sin datos por problemas de storage.
      if (projectsIds.length) {
        const allowed = new Set(projectsIds)
        data = data.filter(p => allowed.has(String(p?.id_proyecto ?? '').trim()))
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
        end:   Date.UTC(year, month, day, horaFin, 0),
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

  updateChart()

  crearInspeccionComp.value?.getSurveys();
  verInspeccionesComp.value?.getSurveys();

  let tareasFiltradas = tareas.value.filter(t => {
    const fecha = new Date(t.fecha_plan_ini)
    const desde = new Date(fechaDesde.value)
    const hasta = new Date(fechaHasta.value)
    const fechaOk = (!fechaDesde.value || fecha >= desde) && (!fechaHasta.value || fecha <= hasta)
    const clienteOk = !cliente.value || t.id_empresa_cliente == cliente.value
    const proyectoOk = !proyecto.value || t.id_proyecto == proyecto.value
    return fechaOk && clienteOk && proyectoOk
  })

  if(estadoFiltro.value != null && estadoFiltro.value != undefined && estadoFiltro.value !== '') {
    console.log('Estado filtro:', estadoFiltro.value);
    if(estadoFiltro.value == 'APROBADO' || estadoFiltro.value == 'RECHAZADO'){
      tareasFiltradas = tareasFiltradas.filter(survey => survey.estado_srv === estadoFiltro.value);
    }
    else{
      tareasFiltradas = tareasFiltradas.filter(survey => survey.estado_srv !== 'APROBADO' && survey.estado_srv !== 'RECHAZADO');
    }
  }

  console.log("tareasFiltradas: ", tareasFiltradas);
  //await obtenerTareas();

  mapaComp.value?.setPuntos(tareasFiltradas)
}

function initChart() {
  // 1. Convertir las fechas seleccionadas a timestamps
  const minDate = new Date(fechaDesdeSeleccionada.value).getTime();
  const maxDate = new Date(fechaHastaSeleccionada.value).getTime();

  // 2. Inicializar el Gantt con Highcharts
  chartInstance.value = Highcharts.ganttChart(chartContainer.value, {
    chart: {
      //height: 35 * tasksGantt.value.length  // ajusta la altura según nº de tareas
      height: smAndDown.value ? 200 : 280, // 👈 más bajo en móvil
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

  const min = new Date(fechaDesde.value).getTime();
  const max = new Date(fechaHasta.value).getTime();

  // 1) filtra en la fuente cruda (tareas.value)
  let base = tareas.value.filter(t => {
    const f = new Date(t.fecha_plan_ini).getTime();
    const fechaOk    = (!fechaDesde.value || f >= min) && (!fechaHasta.value || f <= max);
    const clienteOk  = !cliente.value  || t.id_empresa_cliente == cliente.value;
    const proyectoOk = !proyecto.value || t.id_proyecto        == proyecto.value;
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
    const year  = +fechaFin.slice(0,4);
    const month = +fechaFin.slice(5,7) - 1;
    const day   = +fechaFin.slice(8,10);

    const tipo = item.name_tipo_srv;
    const key = `${tipo}_${fechaFin}`;
    const bloque = (tareasPorFechaYTipo[key] ?? 0);
    tareasPorFechaYTipo[key] = bloque + 1;

    const horaInicio = bloque * 6;
    const horaFin    = horaInicio + 6;

    return {
      id: String(item.id_survey),
      name: item.name_template_srv,
      start: Date.UTC(year, month, day, horaInicio, 0),
      end:   Date.UTC(year, month, day, horaFin, 0),
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







// 🔧 Si tienes tu JSON fijo, puedes pegarlo aquí:
/*const exportConfig = ref({
  filename: "calidad.xlsx",
  hojas: [
    {
      "nombre": "Lotes Recepción",
      "url": "servicio/leanglobal/procesosSurveyV3?fecha_desde=2025-08-26&fecha_hasta=2025-09-25&ts.id_empresa_cliente=&ts.id_proyecto=",
      "campos": [
        { "nombre": "id_survey", "header": "survey" }
      ]
    }

  ]
})*/
//console.log('Cargando configuración de exportación desde data.json...', jsonData.value);
//const exportConfig = jsonData.value.export;

console.log('Configuración de exportación:', exportConfig.value);

// Parámetros externos que ocupas en tus URLs
const pila = ref('')                  // this.pila
const filtro2 = ref('')               // this.filtro2
const textoSubAcopio = ref('')        // this.textoSubAcopio

// UI state
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

// Helpers
function sanitizeSheetName (name) {
  const s = String(name || 'Hoja')
  // SheetJS: máx 31 chars, sin: []:*?/\
  return s.replace(/[\[\]\:\*\?\/\\]/g, '').slice(0, 31) || 'Hoja'
}

function formatFecha (val) {
  if (!val) return ''
  // Acepta Date/ISO/epoch numérico:
  const d = (val instanceof Date) ? val : new Date(val)
  if (isNaN(d.getTime())) return String(val)
  // dd-mm-yyyy
  const dd = String(d.getDate()).padStart(2,'0')
  const mm = String(d.getMonth()+1).padStart(2,'0')
  const yyyy = d.getFullYear()
  return `${dd}-${mm}-${yyyy}`
}

const API_BASE = window.apiURIComun || '/';

// Construye la URL exacta como en tu script original
function buildUrl(hoja) {
  // Ojo: tus hojas ya vienen con rutas tipo "/als/cf/calidad/export/..."
  const base = API_BASE + hoja.url;

  const url = new URL(base, window.location.origin);
  const params = new URLSearchParams();

  // Usa los mismos filtros que ocupas en la otra llamada
  params.set('fecha_desde', '2025-09-01');
  params.set('fecha_hasta', '2025-09-30');
  params.set('filtro',      '');      // cliente
  params.set('teratrib',    12);     // proyecto (igual que el legado)
  params.set('in',          '');           // si aplica

  url.search = params.toString();
  return url.toString();
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

  // Inserta encabezados al inicio
  rows.unshift(headers)
  return rows
}

function cancelar() {
  cancelRequested.value = true
  if (abortController) abortController.abort()
  textoProgreso.value = 'Cancelando…'
}

// 👇 Función principal
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
      // ⚠️ Antes usabas response.statusText; debe ser response.data
      console.log('Fetch URL:', url)
      const resp = await apiAxios.get(url, {
        signal: abortController.signal,
        // Si el backend entrega JSON grande, puedes aumentar timeout:
        timeout: 120000
      })


      // ✅ Normaliza la respuesta aunque el backend mande string o anide "datos"
      let payload = resp.data;
      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload);
        } catch (e) {
          console.warn('Respuesta no-JSON, usando string:', payload);
        }
      }

      // Escenarios comunes:
      //  - { datos: [...] }
      //  - { status: true, datos: [...] }
      //  - [ ... ] directo
      //  - { data: [...] } (a veces)
      const datos =
        Array.isArray(payload)            ? payload :
        Array.isArray(payload?.datos)     ? payload.datos :
        Array.isArray(payload?.data)      ? payload.data :
        [];

      console.log(`Datos hoja "${hoja.nombre}" (len=${datos.length}):`, datos);

      // Arma AOA (arreglo de arreglos) respetando columnas y tipos
      const aoa = mapDatosAHoja(datos, hoja.campos || [])
      const ws = XLSX.utils.aoa_to_sheet(aoa)
      const sheetName = sanitizeSheetName(hoja.nombre || `Hoja ${avance.value}`)
      XLSX.utils.book_append_sheet(wb, ws, sheetName)
    }

    const filename = exportConfig.value.filename || 'reporte.xlsx'
    // Escribe archivo (descarga en el navegador)
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

watch(canSeeDashboardSeguimiento, () => {
  // one/four están ocultos: mantener siempre un tab visible
  if (!tab.value || tab.value === 'one' || tab.value === 'four' || tab.value === 'two') {
    tab.value = 'five'
  }
}, { immediate: true })
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

.ppd2-modal-close {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.16);
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
    min-height: 240px; /* asegura espacio mínimo */
  }
  .grupo2 {
    height: auto;      /* deja crecer con el contenido */
  }
  .card {
    min-height: 200px;
  }
}

/* Evita que los tabs generen scroll horizontal */
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
.mini :deep(.v-card) { padding: 8px !important; } /* opcional */
</style>
