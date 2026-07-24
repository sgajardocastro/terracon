<template>
  <DashboardLayout>
    <v-container
      fluid
      class="pa-4 bg-grey-lighten-4 fill-height align-start"
    >
      <v-row>
        <!-- Header -->
        <v-col cols="12">
          <v-card class="sombra-resaltada mb-4 border-l-primary">
            <v-card-text class="d-flex align-center justify-space-between py-4 px-6 bg-white rounded-lg flex-wrap ga-4">
              <div>
                <h1 class="text-h5 font-weight-bold text-blue-darken-3 mb-1">
                  <v-icon
                    icon="mdi-rocket-launch-outline"
                    start
                    color="primary"
                    class="mr-2"
                  />
                  Consola de Setup de Proyectos
                </h1>
                <p class="text-body-2 text-grey-darken-1 mb-0">
                  Fuente de la verdad y área de staging para aprovisionar nuevos proyectos de servicio.
                </p>
              </div>
              <div class="d-flex align-center ga-3">
                <v-btn
                  v-if="showWizard"
                  variant="outlined"
                  color="secondary"
                  prepend-icon="mdi-arrow-left"
                  @click="backToMatrix"
                >
                  Volver a la Matriz
                </v-btn>
                <v-btn
                  v-else
                  color="primary"
                  prepend-icon="mdi-plus"
                  @click="initNewProject"
                >
                  Nuevo Proyecto
                </v-btn>
                <v-chip
                  color="primary"
                  variant="flat"
                  size="comfortable"
                  class="font-weight-bold"
                >
                  Ecosistema Terracon
                </v-chip>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- ========================================================== -->
        <!-- VIEW 1: MATRIX DASHBOARD                                   -->
        <!-- ========================================================== -->
        <v-col
          v-if="!showWizard"
          cols="12"
        >
          <v-card class="sombra-resaltada border bg-white mb-4">
            <v-card-title class="px-6 py-4 border-b bg-grey-lighten-5 d-flex align-center justify-space-between">
              <span class="text-subtitle-1 font-weight-bold text-blue-darken-3">
                <v-icon
                  icon="mdi-grid"
                  class="mr-2"
                />
                Matriz de Control y Staging
              </span>
              <v-btn
                icon="mdi-refresh"
                variant="text"
                density="comfortable"
                :loading="loadingProjects"
                @click="fetchProjects"
              />
            </v-card-title>
            <v-card-text class="pa-6">
              <div
                v-if="loadingProjects"
                class="text-center py-12"
              >
                <v-progress-circular
                  indeterminate
                  color="primary"
                  size="48"
                />
                <p class="text-caption text-grey mt-2">
                  Cargando proyectos desde el servidor...
                </p>
              </div>
              <div
                v-else-if="!projectsList.length"
                class="text-center py-12"
              >
                <v-icon
                  icon="mdi-folder-open-outline"
                  size="64"
                  color="grey-lighten-1"
                />
                <p class="text-body-1 font-weight-medium text-grey-darken-1 mt-3">
                  No se encontraron proyectos configurados.
                </p>
                <v-btn
                  color="primary"
                  prepend-icon="mdi-plus"
                  class="mt-4"
                  @click="initNewProject"
                >
                  Crear Primer Proyecto
                </v-btn>
              </div>
              <v-table
                v-else
                class="bg-white"
              >
                <thead>
                  <tr class="bg-grey-lighten-4">
                    <th class="font-weight-bold text-left">
                      Proyecto
                    </th>
                    <th class="font-weight-bold text-center">
                      Datos Gral.
                    </th>
                    <th class="font-weight-bold text-center">
                      Nómina
                    </th>
                    <th class="font-weight-bold text-center">
                      Equipos
                    </th>
                    <th class="font-weight-bold text-center">
                      Gantt
                    </th>
                    <th class="font-weight-bold text-center">
                      Calidad
                    </th>
                    <th class="font-weight-bold text-center">
                      Medio Amb.
                    </th>
                    <th class="font-weight-bold text-center">
                      Seguridad
                    </th>
                    <th class="font-weight-bold text-center">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="proj in projectsList"
                    :key="proj.id_proyecto"
                  >
                    <td class="py-3">
                      <div class="font-weight-bold text-blue-darken-3">
                        {{ proj.nombre_proyecto }}
                      </div>
                      <div class="text-caption text-grey d-flex ga-3">
                        <span>Código: {{ proj.codi_proyecto }}</span>
                        <span v-if="proj.centro_costo">CC: {{ proj.centro_costo }}</span>
                      </div>
                    </td>
                    <!-- Stage status chips -->
                    <td
                      v-for="stg in ['general', 'roster', 'teams', 'gantt', 'calidad', 'medioAmbiente', 'seguridad']"
                      :key="stg"
                      class="text-center"
                    >
                      <v-chip
                        :color="getChipStatus(proj, stg).color"
                        size="small"
                        variant="flat"
                        class="cursor-pointer"
                        :prepend-icon="getChipStatus(proj, stg).icon"
                        @click="openProjectWizard(proj, stg)"
                      >
                        {{ getChipStatus(proj, stg).label }}
                      </v-chip>
                    </td>
                    <td class="text-center">
                      <v-btn
                        color="blue-darken-3"
                        size="small"
                        variant="flat"
                        prepend-icon="mdi-cog"
                        @click="openProjectWizard(proj, 'general')"
                      >
                        Configurar
                      </v-btn>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- ========================================================== -->
        <!-- VIEW 2: STEPPER WIZARD CONFIGURATOR                        -->
        <!-- ========================================================== -->
        <v-col
          v-else
          cols="12"
        >
          <!-- Stepper Indicator -->
          <v-card class="sombra-resaltada mb-4">
            <v-card-text class="py-3 px-6 bg-white rounded-lg">
              <div class="d-flex justify-space-between align-center flex-wrap ga-4">
                <div 
                  v-for="s in stepsList" 
                  :key="s.val" 
                  class="d-flex align-center cursor-pointer ga-2 step-item"
                  :class="{ 'step-active': step === s.val, 'step-completed': step > s.val || getStepCompletedStatus(s.val) }"
                  @click="goToStep(s.val)"
                >
                  <v-avatar 
                    size="28" 
                    :color="step === s.val ? 'primary' : (getStepCompletedStatus(s.val) ? 'success' : 'grey-lighten-1')" 
                    class="text-white font-weight-bold text-caption"
                  >
                    <v-icon
                      v-if="getStepCompletedStatus(s.val)"
                      icon="mdi-check"
                      size="14"
                    />
                    <span v-else>{{ s.val }}</span>
                  </v-avatar>
                  <span class="text-body-2 font-weight-medium text-grey-darken-3">
                    {{ s.label }}
                  </span>
                  <v-icon
                    v-if="s.val < 7"
                    icon="mdi-chevron-right"
                    color="grey-lighten-1"
                    class="ml-2"
                  />
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Main Content Area -->
          <v-card
            class="sombra-resaltada border bg-white"
            style="min-height: 520px;"
          >
            <v-card-text class="pa-6">
              <!-- Header / Status Banner for Current Step -->
              <div class="d-flex align-center justify-space-between border-b pb-4 mb-4 flex-wrap ga-4">
                <div class="d-flex align-center ga-3">
                  <v-chip
                    v-if="currentStepOk"
                    color="success"
                    variant="flat"
                    prepend-icon="mdi-check-circle"
                    size="comfortable"
                  >
                    Sincronizado OK
                  </v-chip>
                  <v-chip
                    v-else-if="currentStepDraft"
                    color="orange"
                    variant="flat"
                    prepend-icon="mdi-pencil"
                    size="comfortable"
                  >
                    Borrador Guardado (Staging)
                  </v-chip>
                  <v-chip
                    v-else
                    color="grey"
                    variant="flat"
                    prepend-icon="mdi-circle-outline"
                    size="comfortable"
                  >
                    Pendiente de Configuración
                  </v-chip>
                </div>
                <div class="d-flex ga-2">
                  <v-btn
                    variant="tonal"
                    color="warning"
                    prepend-icon="mdi-content-save-outline"
                    :loading="savingProject"
                    @click="saveDraft(step)"
                  >
                    Guardar Borrador
                  </v-btn>
                  <v-btn
                    color="success"
                    prepend-icon="mdi-sync"
                    :loading="savingProject"
                    @click="confirmAndSync(step)"
                  >
                    Confirmar y Sincronizar
                  </v-btn>
                </div>
              </div>

              <v-window v-model="step">
                <!-- ========================================== -->
                <!-- STEP 1: DATOS GENERALES -->
                <!-- ========================================== -->
                <v-window-item :value="1">
                  <div>
                    <h3 class="text-h6 font-weight-bold text-blue-darken-3 mb-4 d-flex align-center">
                      <v-icon
                        icon="mdi-card-text-outline"
                        class="mr-2"
                      />
                      1. Datos Generales del Proyecto
                    </h3>
                    <v-form
                      ref="formStep1"
                      lazy-validation
                    >
                      <v-row>
                        <v-col
                          cols="12"
                          md="6"
                        >
                          <v-text-field
                            v-model="projectForm.nombre_proyecto"
                            label="Nombre Oficial del Proyecto *"
                            variant="outlined"
                            density="comfortable"
                            :rules="[v => !!v || 'Nombre es requerido']"
                            required
                          />
                        </v-col>
                        <v-col
                          cols="12"
                          md="3"
                        >
                          <v-text-field
                            v-model="projectForm.codi_proyecto"
                            label="Código del Proyecto / Contrato *"
                            variant="outlined"
                            density="comfortable"
                            placeholder="ej: SON-07"
                            :rules="[v => !!v || 'Código es requerido']"
                            required
                          />
                        </v-col>
                        <v-col
                          cols="12"
                          md="3"
                        >
                          <v-text-field
                            v-model="projectForm.centro_costo"
                            label="Centro de Costo"
                            variant="outlined"
                            density="comfortable"
                          />
                        </v-col>
                        <v-col
                          cols="12"
                          md="4"
                        >
                          <v-select
                            v-model="projectForm.id_empresa_cliente"
                            :items="companies"
                            item-title="name_empresa"
                            item-value="id_empresa"
                            label="Empresa Cliente *"
                            variant="outlined"
                            density="comfortable"
                            :rules="[v => !!v || 'Cliente es requerido']"
                          />
                        </v-col>
                        <v-col
                          cols="12"
                          md="4"
                        >
                          <v-select
                            v-model="projectForm.id_proyecto_tipo"
                            :items="projectTypes"
                            item-title="descripcion_tipo"
                            item-value="id_proyecto_tipo"
                            label="Tipo de Proyecto *"
                            variant="outlined"
                            density="comfortable"
                          />
                        </v-col>
                        <v-col
                          cols="12"
                          md="4"
                        >
                          <v-select
                            v-model="projectForm.id_proyecto_estado"
                            :items="projectStates"
                            item-title="nombre_estado"
                            item-value="id_proyecto_estado"
                            label="Estado Inicial *"
                            variant="outlined"
                            density="comfortable"
                          />
                        </v-col>
                        <v-col
                          cols="12"
                          md="6"
                        >
                          <v-text-field
                            v-model="projectForm.fecha_plan_ini"
                            label="Fecha Inicio Planificada"
                            type="date"
                            variant="outlined"
                            density="comfortable"
                          />
                        </v-col>
                        <v-col
                          cols="12"
                          md="6"
                        >
                          <v-text-field
                            v-model="projectForm.fecha_plan_fin"
                            label="Fecha Fin Planificada"
                            type="date"
                            variant="outlined"
                            density="comfortable"
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-textarea
                            v-model="projectForm.objetivo_proyecto"
                            label="Objetivo del Proyecto"
                            variant="outlined"
                            density="comfortable"
                            rows="2"
                            auto-grow
                          />
                        </v-col>
                      </v-row>
                    </v-form>
                  </div>
                </v-window-item>

                <!-- ========================================== -->
                <!-- STEP 2: NÓMINA (ENROLAMIENTO MASIVO) -->
                <!-- ========================================== -->
                <v-window-item :value="2">
                  <div>
                    <h3 class="text-h6 font-weight-bold text-blue-darken-3 mb-2 d-flex align-center">
                      <v-icon
                        icon="mdi-account-multiple-plus-outline"
                        class="mr-2"
                      />
                      2. Nómina de Personal y Enrolamiento
                    </h3>
                    <p class="text-caption text-grey-darken-1 mb-4">
                      Sube la nómina de trabajadores del proyecto. El borrador guarda los trabajadores temporalmente. Sincronizar iniciará los flujos FES correspondientes.
                    </p>

                    <v-row class="align-center mb-4">
                      <v-col
                        cols="12"
                        md="8"
                      >
                        <v-file-input
                          v-model="rosterFile"
                          label="Seleccionar archivo Excel Nómina (.xlsx)"
                          accept=".xlsx,.xls"
                          prepend-icon="mdi-file-excel"
                          density="comfortable"
                          variant="outlined"
                          hide-details
                          clearable
                          @update:model-value="onRosterSelected"
                        />
                      </v-col>
                      <v-col
                        cols="12"
                        md="4"
                      >
                        <v-btn
                          color="primary"
                          variant="outlined"
                          prepend-icon="mdi-download"
                          class="w-100"
                          @click="downloadRosterTemplate"
                        >
                          Descargar Plantilla Nómina
                        </v-btn>
                      </v-col>
                    </v-row>

                    <!-- Alert message -->
                    <v-alert
                      v-if="rosterStatusMsg"
                      :type="rosterStatusType"
                      variant="tonal"
                      class="mb-4"
                      density="compact"
                    >
                      {{ rosterStatusMsg }}
                    </v-alert>

                    <!-- Table showing parsed excel rows -->
                    <v-card
                      v-if="rosterRows.length"
                      variant="outlined"
                      class="bg-white"
                    >
                      <v-table density="compact">
                        <thead>
                          <tr class="bg-grey-lighten-4">
                            <th class="font-weight-bold">
                              RUT
                            </th>
                            <th class="font-weight-bold">
                              Nombre
                            </th>
                            <th class="font-weight-bold">
                              Correo
                            </th>
                            <th class="font-weight-bold">
                              Roles Asignados
                            </th>
                            <th class="font-weight-bold">
                              Estado Staging
                            </th>
                            <th class="font-weight-bold">
                              Detalle/Log
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="(row, idx) in rosterRows"
                            :key="idx"
                          >
                            <td>{{ row.rut }}</td>
                            <td>{{ row.nombre }}</td>
                            <td>{{ row.correo }}</td>
                            <td>
                              <v-chip 
                                v-for="rid in row.rolesIds" 
                                :key="rid"
                                size="x-small" 
                                class="mr-1"
                                color="primary"
                              >
                                {{ rolesList.find(r => r.id_rol === rid)?.name_rol || rid }}
                              </v-chip>
                            </td>
                            <td>
                              <v-chip 
                                size="x-small" 
                                :color="row._status === 'OK' ? 'success' : (row._status === 'ERROR' ? 'error' : 'warning')"
                              >
                                {{ row._status }}
                              </v-chip>
                            </td>
                            <td class="text-caption font-italic text-grey">
                              {{ row._log }}
                            </td>
                          </tr>
                        </tbody>
                      </v-table>
                    </v-card>
                  </div>
                </v-window-item>

                <!-- ========================================== -->
                <!-- STEP 3: CONFIGURACIÓN DE EQUIPOS -->
                <!-- ========================================== -->
                <v-window-item :value="3">
                  <div>
                    <h3 class="text-h6 font-weight-bold text-blue-darken-3 mb-2 d-flex align-center">
                      <v-icon
                        icon="mdi-account-group-outline"
                        class="mr-2"
                      />
                      3. Equipos y Cuadrillas de Trabajo
                    </h3>
                    <p class="text-caption text-grey-darken-1 mb-4">
                      Diseña las cuadrillas asignando supervisores y trabajadores. Al sincronizar se crearán y vincularán en el ecosistema relacional de base de datos.
                    </p>

                    <v-row>
                      <!-- Form Team -->
                      <v-col
                        cols="12"
                        md="4"
                      >
                        <v-card
                          variant="outlined"
                          class="pa-4 bg-grey-lighten-5"
                        >
                          <h4 class="text-subtitle-1 font-weight-bold mb-3 text-grey-darken-3">
                            Nuevo Equipo
                          </h4>
                          <v-text-field
                            v-model="newTeam.nombre_equipo"
                            label="Nombre de la Cuadrilla"
                            variant="outlined"
                            density="comfortable"
                          />
                          <v-text-field
                            v-model="newTeam.descripcion_equipo"
                            label="Descripción"
                            variant="outlined"
                            density="comfortable"
                          />
                          <v-select
                            v-model="newTeam.id_usuario_lider"
                            :items="supervisors"
                            item-title="nombre_user"
                            item-value="id_user"
                            label="Supervisor / Líder"
                            variant="outlined"
                            density="comfortable"
                          />
                          <v-select
                            v-model="newTeam.miembros"
                            :items="operators"
                            item-title="nombre_user"
                            item-value="id_user"
                            label="Miembros / Operadores"
                            multiple
                            chips
                            variant="outlined"
                            density="comfortable"
                          />
                          <v-btn 
                            color="primary" 
                            block 
                            prepend-icon="mdi-plus"
                            @click="addTeamLocal"
                          >
                            Agregar a Borrador
                          </v-btn>
                        </v-card>
                      </v-col>

                      <!-- Local Teams List -->
                      <v-col
                        cols="12"
                        md="8"
                      >
                        <v-card
                          variant="outlined"
                          class="fill-height bg-white pa-4"
                        >
                          <h4 class="text-subtitle-1 font-weight-bold mb-3 text-grey-darken-3">
                            Equipos Configurados (Borrador)
                          </h4>
                          <div
                            v-if="!createdTeams.length"
                            class="text-center py-12 text-grey"
                          >
                            <v-icon
                              icon="mdi-account-group-outline"
                              size="48"
                              class="mb-2"
                            />
                            <p class="text-body-2">
                              No se han estructurado cuadrillas para este proyecto todavía.
                            </p>
                          </div>
                          <v-row v-else>
                            <v-col
                              v-for="(t, idx) in createdTeams"
                              :key="idx"
                              cols="12"
                              sm="6"
                            >
                              <v-card
                                variant="outlined"
                                class="border bg-grey-lighten-5 relative"
                              >
                                <v-card-title class="text-subtitle-2 font-weight-bold d-flex justify-space-between align-center bg-blue-lighten-5 py-2 px-3">
                                  <span>{{ t.nombre_equipo }}</span>
                                  <v-icon 
                                    icon="mdi-close-circle" 
                                    color="red" 
                                    class="cursor-pointer"
                                    @click="removeTeamLocal(idx)"
                                  />
                                </v-card-title>
                                <v-card-text class="pa-3 text-caption">
                                  <div><strong>Líder:</strong> {{ t.lider_nombre }}</div>
                                  <div class="mt-1">
                                    <strong>Miembros:</strong>
                                    <v-chip-group>
                                      <v-chip
                                        v-for="m in t.miembros_nombres"
                                        :key="m"
                                        size="x-small"
                                        variant="tonal"
                                      >
                                        {{ m }}
                                      </v-chip>
                                    </v-chip-group>
                                  </div>
                                  <div class="mt-2 text-right">
                                    <v-chip 
                                      v-if="t.id_equipo_proyecto" 
                                      color="success" 
                                      size="x-small" 
                                      variant="flat"
                                    >
                                      Sincronizado (ID {{ t.id_equipo_proyecto }})
                                    </v-chip>
                                    <v-chip
                                      v-else
                                      color="warning"
                                      size="x-small"
                                      variant="flat"
                                    >
                                      Borrador Local
                                    </v-chip>
                                  </div>
                                </v-card-text>
                              </v-card>
                            </v-col>
                          </v-row>
                        </v-card>
                      </v-col>
                    </v-row>
                  </div>
                </v-window-item>

                <!-- ========================================== -->
                <!-- STEP 4: CARGA GANTT -->
                <!-- ========================================== -->
                <v-window-item :value="4">
                  <div>
                    <h3 class="text-h6 font-weight-bold text-blue-darken-3 mb-2 d-flex align-center">
                      <v-icon
                        icon="mdi-chart-timeline-variant-shimmer"
                        class="mr-2"
                      />
                      4. Carga e Importación de Planificación Gantt
                    </h3>
                    <p class="text-caption text-grey-darken-1 mb-4">
                      Importa el archivo Gantt (.xlsx) de planificación diaria. Valida que las cuadrillas declaradas correspondan a las creadas en el Paso 3.
                    </p>

                    <v-row class="align-center mb-4">
                      <v-col
                        cols="12"
                        md="8"
                      >
                        <v-file-input
                          v-model="ganttFile"
                          label="Seleccionar archivo Gantt (.xlsx)"
                          accept=".xlsx,.xls"
                          prepend-icon="mdi-file-excel"
                          density="comfortable"
                          variant="outlined"
                          hide-details
                          clearable
                          @update:model-value="onGanttSelected"
                        />
                      </v-col>
                      <v-col
                        cols="12"
                        md="4"
                      >
                        <v-btn
                          color="primary"
                          variant="outlined"
                          prepend-icon="mdi-download"
                          class="w-100"
                          @click="downloadGanttTemplate"
                        >
                          Descargar Plantilla Gantt
                        </v-btn>
                      </v-col>
                    </v-row>

                    <!-- Alert message -->
                    <v-alert
                      v-if="ganttStatusMsg"
                      :type="ganttStatusType"
                      variant="tonal"
                      class="mb-4"
                      density="compact"
                    >
                      {{ ganttStatusMsg }}
                    </v-alert>

                    <!-- Date range info -->
                    <v-card
                      v-if="ganttTasks.length"
                      variant="flat"
                      class="pa-4 bg-blue-grey-lighten-5 mb-4 rounded-lg d-flex justify-space-between align-center flex-wrap ga-3"
                    >
                      <div>
                        <strong>Rango del Plan:</strong> {{ ganttMinDate }} al {{ ganttMaxDate }}
                      </div>
                      <v-chip
                        color="primary"
                        class="font-weight-bold"
                      >
                        Total Actividades: {{ ganttTasks.length }}
                      </v-chip>
                    </v-card>

                    <!-- Interactive Gantt Chart Preview -->
                    <v-card
                      v-if="ganttTasks.length"
                      class="pa-4 bg-white mb-4 border sombra-resaltada"
                    >
                      <div
                        ref="ganttChartContainer"
                        style="width: 100%; min-height: 250px;"
                      />
                    </v-card>

                    <!-- Table showing parsed tasks -->
                    <v-card
                      v-if="ganttTasks.length"
                      variant="outlined"
                      class="bg-white max-height-320"
                    >
                      <v-table density="compact">
                        <thead>
                          <tr class="bg-grey-lighten-4">
                            <th class="font-weight-bold">
                              EDT
                            </th>
                            <th class="font-weight-bold">
                              Partida / Actividad
                            </th>
                            <th class="font-weight-bold text-center">
                              Unidad
                            </th>
                            <th class="font-weight-bold text-right">
                              Cant. Total
                            </th>
                            <th class="font-weight-bold">
                              Recurso
                            </th>
                            <th class="font-weight-bold text-center">
                              ¿Cuadrilla Válida?
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="(task, idx) in ganttTasks"
                            :key="idx"
                          >
                            <td>{{ task.edt }}</td>
                            <td>{{ task.nombre }}</td>
                            <td class="text-center">
                              {{ task.unidad }}
                            </td>
                            <td class="text-right">
                              {{ task.cantidad }}
                            </td>
                            <td>
                              <v-chip
                                size="x-small"
                                :color="task.recursoValido ? 'success' : 'amber-darken-3'"
                              >
                                {{ task.recurso || 'SIN ASIGNAR' }}
                              </v-chip>
                            </td>
                            <td class="text-center">
                              <v-icon 
                                :icon="task.recursoValido ? 'mdi-check-circle' : 'mdi-alert'" 
                                :color="task.recursoValido ? 'success' : 'amber-darken-3'" 
                                size="18" 
                              />
                            </td>
                          </tr>
                        </tbody>
                      </v-table>
                    </v-card>

                    <!-- Protocolos (Plantillas) de Avance -->
                    <v-row class="mt-4">
                      <v-col cols="12">
                        <v-card
                          variant="outlined"
                          class="pa-4 bg-white"
                        >
                          <h4 class="text-subtitle-1 font-weight-bold text-blue-darken-2 mb-3 border-b pb-2">
                            <v-icon
                              icon="mdi-playlist-check"
                              start
                            />
                            Protocolos y Surveys de Avance
                          </h4>
                          <div class="d-flex flex-column ga-3 max-height-320">
                            <div
                              v-for="group in groupTemplatesByFamily(avanceTemplates)"
                              :key="group.name"
                              class="mb-2"
                            >
                              <div class="text-caption font-weight-bold text-blue-darken-3 mb-1 border-b">
                                {{ group.name }}
                              </div>
                              <div
                                v-for="t in group.templates"
                                :key="t.id"
                                class="d-flex align-center justify-space-between pl-2 py-1"
                              >
                                <v-checkbox
                                  v-model="hseqSelection.avance"
                                  :label="`[ID ${t.id}] ${t.nombre}`"
                                  :value="t.id"
                                  density="compact"
                                  color="blue"
                                  hide-details
                                />
                                <v-btn
                                  icon="mdi-eye-outline"
                                  variant="text"
                                  density="comfortable"
                                  color="primary"
                                  @click="openSurveyPreview(t)"
                                />
                              </div>
                            </div>
                          </div>
                        </v-card>
                      </v-col>
                    </v-row>
                  </div>
                </v-window-item>

                <!-- ========================================== -->
                <!-- STEP 5: CALIDAD (PROTOCOLOS Y KPIS)        -->
                <!-- ========================================== -->
                <v-window-item :value="5">
                  <div>
                    <h3 class="text-h6 font-weight-bold text-blue-darken-3 mb-2 d-flex align-center">
                      <v-icon
                        icon="mdi-hammer-wrench"
                        class="mr-2"
                        color="blue"
                      />
                      5. Configuración de Calidad (Protocolos y KPIs)
                    </h3>
                    <p class="text-caption text-grey-darken-1 mb-4">
                      Selecciona las plantillas de control de calidad y define las metas operacionales para los indicadores principales.
                    </p>

                    <v-row>
                      <!-- Protocolos (Plantillas) -->
                      <v-col
                        cols="12"
                        md="6"
                      >
                        <v-card
                          variant="outlined"
                          class="pa-4 bg-white fill-height"
                        >
                          <div class="d-flex justify-space-between align-center border-b pb-2 mb-3">
                            <h4 class="text-subtitle-1 font-weight-bold text-blue-darken-2 mb-0">
                              <v-icon
                                icon="mdi-playlist-check"
                                start
                              />
                              Protocolos de Calidad
                            </h4>
                            <v-btn size="small" variant="text" color="primary" @click="selectAll('calidad')">
                              Seleccionar Todo
                            </v-btn>
                          </div>
                          <div class="d-flex flex-column ga-3 max-height-320">
                            <div
                              v-for="group in groupTemplatesByFamily(qualityTemplates)"
                              :key="group.name"
                              class="mb-2"
                            >
                              <div class="text-caption font-weight-bold text-blue-darken-3 mb-1 border-b">
                                {{ group.name }}
                              </div>
                              <div
                                v-for="t in group.templates"
                                :key="t.id"
                                class="d-flex align-center justify-space-between pl-2 py-1"
                              >
                                <v-checkbox
                                  v-model="hseqSelection.calidad"
                                  :label="`[ID ${t.id}] ${t.nombre}`"
                                  :value="t.id"
                                  density="compact"
                                  color="blue"
                                  hide-details
                                />
                                <v-btn
                                  icon="mdi-eye-outline"
                                  variant="text"
                                  density="comfortable"
                                  color="primary"
                                  @click="openSurveyPreview(t)"
                                />
                              </div>
                            </div>
                          </div>
                        </v-card>
                      </v-col>

                      <!-- KPIs Metas -->
                      <v-col
                        cols="12"
                        md="6"
                      >
                        <v-card
                          variant="outlined"
                          class="pa-4 bg-grey-lighten-5 fill-height"
                        >
                          <h4 class="text-subtitle-1 font-weight-bold text-grey-darken-3 mb-3 border-b pb-2">
                            <v-icon
                              icon="mdi-chart-line"
                              start
                            />
                            KPIs y Metas de Calidad
                          </h4>
                          <v-row>
                            <v-col cols="12">
                              <v-text-field
                                v-model.number="calidadKPIs.meta_cumplimiento_protocolos"
                                label="Meta de Cumplimiento de Protocolos (%)"
                                type="number"
                                suffix="%"
                                variant="outlined"
                                density="comfortable"
                              />
                            </v-col>
                            <v-col cols="12">
                              <v-text-field
                                v-model.number="calidadKPIs.limite_desviaciones"
                                label="Límite Máximo de Desviaciones Toleradas"
                                type="number"
                                variant="outlined"
                                density="comfortable"
                              />
                            </v-col>
                            <v-col cols="12">
                              <v-text-field
                                v-model.number="calidadKPIs.frecuencia_auditorias_dias"
                                label="Frecuencia de Auditorías de Calidad (Días)"
                                type="number"
                                suffix="días"
                                variant="outlined"
                                density="comfortable"
                              />
                            </v-col>
                          </v-row>
                        </v-card>
                      </v-col>
                    </v-row>
                  </div>
                </v-window-item>

                <!-- ========================================== -->
                <!-- STEP 6: MEDIO AMBIENTE (PROTOCOLOS Y KPIS) -->
                <!-- ========================================== -->
                <v-window-item :value="6">
                  <div>
                    <h3 class="text-h6 font-weight-bold text-green-darken-3 mb-2 d-flex align-center">
                      <v-icon
                        icon="mdi-leaf"
                        class="mr-2"
                        color="green"
                      />
                      6. Configuración de Medio Ambiente (Protocolos y KPIs)
                    </h3>
                    <p class="text-caption text-grey-darken-1 mb-4">
                      Selecciona las plantillas de medio ambiente y define las metas operacionales correspondientes.
                    </p>

                    <v-row>
                      <!-- Protocolos (Plantillas) -->
                      <v-col
                        cols="12"
                        md="6"
                      >
                        <v-card
                          variant="outlined"
                          class="pa-4 bg-white fill-height"
                        >
                          <div class="d-flex justify-space-between align-center border-b pb-2 mb-3">
                            <h4 class="text-subtitle-1 font-weight-bold text-green-darken-2 mb-0">
                              <v-icon
                                icon="mdi-playlist-check"
                                start
                              />
                              Protocolos de Medio Ambiente
                            </h4>
                            <v-btn size="small" variant="text" color="primary" @click="selectAll('medioAmbiente')">
                              Seleccionar Todo
                            </v-btn>
                          </div>
                          <div class="d-flex flex-column ga-3 max-height-320">
                            <div
                              v-for="group in groupTemplatesByFamily(environmentTemplates)"
                              :key="group.name"
                              class="mb-2"
                            >
                              <div class="text-caption font-weight-bold text-blue-darken-3 mb-1 border-b">
                                {{ group.name }}
                              </div>
                              <div
                                v-for="t in group.templates"
                                :key="t.id"
                                class="d-flex align-center justify-space-between pl-2 py-1"
                              >
                                <v-checkbox
                                  v-model="hseqSelection.medioAmbiente"
                                  :label="`[ID ${t.id}] ${t.nombre}`"
                                  :value="t.id"
                                  density="compact"
                                  color="green"
                                  hide-details
                                />
                                <v-btn
                                  icon="mdi-eye-outline"
                                  variant="text"
                                  density="comfortable"
                                  color="primary"
                                  @click="openSurveyPreview(t)"
                                />
                              </div>
                            </div>
                          </div>
                        </v-card>
                      </v-col>

                      <!-- KPIs Metas -->
                      <v-col
                        cols="12"
                        md="6"
                      >
                        <v-card
                          variant="outlined"
                          class="pa-4 bg-grey-lighten-5 fill-height"
                        >
                          <h4 class="text-subtitle-1 font-weight-bold text-grey-darken-3 mb-3 border-b pb-2">
                            <v-icon
                              icon="mdi-chart-line"
                              start
                            />
                            KPIs y Metas Ambientales
                          </h4>
                          <v-row>
                            <v-col cols="12">
                              <v-text-field
                                v-model.number="medioAmbienteKPIs.meta_clasificacion_residuos"
                                label="Meta de Clasificación de Residuos (%)"
                                type="number"
                                suffix="%"
                                variant="outlined"
                                density="comfortable"
                              />
                            </v-col>
                            <v-col cols="12">
                              <v-text-field
                                v-model.number="medioAmbienteKPIs.limite_incidentes_ambientales"
                                label="Límite Máximo de Incidentes Ambientales"
                                type="number"
                                variant="outlined"
                                density="comfortable"
                              />
                            </v-col>
                            <v-col cols="12">
                              <v-text-field
                                v-model.number="medioAmbienteKPIs.frecuencia_inspecciones_dias"
                                label="Frecuencia de Inspecciones Ambientales (Días)"
                                type="number"
                                suffix="días"
                                variant="outlined"
                                density="comfortable"
                              />
                            </v-col>
                          </v-row>
                        </v-card>
                      </v-col>
                    </v-row>
                  </div>
                </v-window-item>

                <!-- ========================================== -->
                <!-- STEP 7: SEGURIDAD (PROTOCOLOS Y KPIS)      -->
                <!-- ========================================== -->
                <v-window-item :value="7">
                  <div>
                    <h3 class="text-h6 font-weight-bold text-red-darken-3 mb-2 d-flex align-center">
                      <v-icon
                        icon="mdi-shield-check-outline"
                        class="mr-2"
                        color="red"
                      />
                      7. Configuración de Seguridad (Protocolos y KPIs)
                    </h3>
                    <p class="text-caption text-grey-darken-1 mb-4">
                      Selecciona las plantillas de seguridad/SST y configura las metas operacionales finales para cerrar el aprovisionamiento.
                    </p>

                    <v-row>
                      <!-- Protocolos (Plantillas) -->
                      <v-col
                        cols="12"
                        md="6"
                      >
                        <v-card
                          variant="outlined"
                          class="pa-4 bg-white fill-height"
                        >
                          <div class="d-flex justify-space-between align-center border-b pb-2 mb-3">
                            <h4 class="text-subtitle-1 font-weight-bold text-red-darken-2 mb-0">
                              <v-icon
                                icon="mdi-playlist-check"
                                start
                              />
                              Protocolos de Seguridad (SST)
                            </h4>
                            <v-btn size="small" variant="text" color="primary" @click="selectAll('seguridad')">
                              Seleccionar Todo
                            </v-btn>
                          </div>
                          <div class="d-flex flex-column ga-3 max-height-320">
                            <div
                              v-for="group in groupTemplatesByFamily(sstTemplates)"
                              :key="group.name"
                              class="mb-2"
                            >
                              <div class="text-caption font-weight-bold text-blue-darken-3 mb-1 border-b">
                                {{ group.name }}
                              </div>
                              <div
                                v-for="t in group.templates"
                                :key="t.id"
                                class="d-flex align-center justify-space-between pl-2 py-1"
                              >
                                <v-checkbox
                                  v-model="hseqSelection.seguridad"
                                  :label="`[ID ${t.id}] ${t.nombre}`"
                                  :value="t.id"
                                  density="compact"
                                  color="red"
                                  hide-details
                                />
                                <v-btn
                                  icon="mdi-eye-outline"
                                  variant="text"
                                  density="comfortable"
                                  color="primary"
                                  @click="openSurveyPreview(t)"
                                />
                              </div>
                            </div>
                          </div>
                        </v-card>
                      </v-col>

                      <!-- KPIs Metas -->
                      <v-col
                        cols="12"
                        md="6"
                      >
                        <v-card
                          variant="outlined"
                          class="pa-4 bg-grey-lighten-5 fill-height"
                        >
                          <h4 class="text-subtitle-1 font-weight-bold text-grey-darken-3 mb-3 border-b pb-2">
                            <v-icon
                              icon="mdi-chart-line"
                              start
                            />
                            KPIs y Metas de Seguridad (SST)
                          </h4>
                          <v-row>
                            <v-col
                              cols="12"
                              md="6"
                            >
                              <v-text-field
                                v-model.number="seguridadKPIs.meta_asistencia_charlas"
                                label="Meta Asistencia Charlas (%)"
                                type="number"
                                suffix="%"
                                variant="outlined"
                                density="comfortable"
                              />
                            </v-col>
                            <v-col
                              cols="12"
                              md="6"
                            >
                              <v-text-field
                                v-model.number="seguridadKPIs.meta_elaboracion_asts"
                                label="Meta Elaboración ASTs (%)"
                                type="number"
                                suffix="%"
                                variant="outlined"
                                density="comfortable"
                              />
                            </v-col>
                            <v-col
                              cols="12"
                              md="6"
                            >
                              <v-text-field
                                v-model.number="seguridadKPIs.meta_inspecciones_seguridad"
                                label="Meta Inspecciones Seguridad (%)"
                                type="number"
                                suffix="%"
                                variant="outlined"
                                density="comfortable"
                              />
                            </v-col>
                            <v-col
                              cols="12"
                              md="6"
                            >
                              <v-text-field
                                v-model.number="seguridadKPIs.frecuencia_inspeccion_herramientas_dias"
                                label="Frecuencia Chequeo Herramientas"
                                type="number"
                                suffix="días"
                                variant="outlined"
                                density="comfortable"
                              />
                            </v-col>
                          </v-row>
                        </v-card>
                      </v-col>
                    </v-row>
                  </div>
                </v-window-item>
              </v-window>
            </v-card-text>

            <v-divider />

            <!-- Stepper Actions -->
            <v-card-actions class="pa-4 justify-space-between bg-grey-lighten-5">
              <v-btn 
                variant="tonal" 
                prepend-icon="mdi-arrow-left" 
                :disabled="step === 1 || savingProject" 
                @click="prevStep"
              >
                Atrás
              </v-btn>
              <div>
                <v-btn 
                  v-if="step < 7"
                  color="primary" 
                  append-icon="mdi-arrow-right"
                  :loading="savingProject"
                  @click="nextStep"
                >
                  Siguiente
                </v-btn>
                <v-btn
                  v-else
                  color="success"
                  variant="flat"
                  prepend-icon="mdi-check-all"
                  :loading="savingProject"
                  @click="finalizeSetup"
                >
                  Finalizar Setup de Proyecto
                </v-btn>
              </div>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Success Modal -->
    <v-dialog
      v-model="successDialog"
      max-width="480px"
      persistent
    >
      <v-card class="pa-4 text-center">
        <v-card-text>
          <v-icon
            icon="mdi-check-circle"
            color="success"
            size="80"
            class="mb-4"
          />
          <h3 class="text-h5 font-weight-bold text-grey-darken-3 mb-2">
            ¡Proyecto Configurado!
          </h3>
          <p class="text-body-2 text-grey-darken-1 mb-4">
            El proyecto <strong>{{ projectForm.nombre_proyecto }}</strong> (Código: {{ projectForm.codi_proyecto }}) se ha configurado y sincronizado correctamente en el sistema.
          </p>
          <v-divider class="my-4" />
          <div class="d-flex justify-center ga-3">
            <v-btn
              color="primary"
              @click="goToMatrixView"
            >
              Ir a la Matriz
            </v-btn>
            <v-btn
              variant="outlined"
              @click="resetWizard"
            >
              Configurar Otro
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Preview Modal (PWA & Print) -->
    <v-dialog
      v-model="previewDialog"
      max-width="1000px"
      scrollable
    >
      <v-card class="rounded-xl overflow-hidden bg-grey-lighten-4">
        <v-toolbar
          color="primary"
          flat
          dark
          class="px-4"
        >
          <v-toolbar-title class="text-h6 font-weight-bold text-white">
            <v-icon
              icon="mdi-eye-outline"
              class="mr-2"
            />
            Vista Previa de Survey / Protocolo
          </v-toolbar-title>
          <v-spacer />
          <v-btn
            icon="mdi-close"
            color="white"
            variant="text"
            @click="previewDialog = false"
          />
        </v-toolbar>

        <v-tabs
          v-model="previewTab"
          bg-color="white"
          class="border-b"
          color="primary"
        >
          <v-tab
            value="pwa"
            class="font-weight-bold"
          >
            <v-icon
              icon="mdi-cellphone"
              class="mr-2"
            />
            Vista PWA (Móvil)
          </v-tab>
          <v-tab
            value="print"
            class="font-weight-bold"
          >
            <v-icon
              icon="mdi-printer"
              class="mr-2"
            />
            Vista Impresión (PDF)
          </v-tab>
        </v-tabs>

        <v-card-text
          class="pa-4 bg-grey-lighten-3"
          style="max-height: 70vh;"
        >
          <v-window v-model="previewTab">
            <!-- TAB 1: PWA PREVIEW -->
            <v-window-item value="pwa">
              <div class="d-flex justify-center py-4">
                <div class="mobile-device-frame elevation-12 border rounded-xl overflow-hidden bg-white">
                  <div class="mobile-notch" />
                  <div
                    class="mobile-screen-content overflow-y-auto pa-2"
                    style="height: 600px; width: 360px;"
                  >
                    <PwaPreview v-if="previewReady && selectedPreviewTemplate" />
                  </div>
                </div>
              </div>
            </v-window-item>

            <!-- TAB 2: PRINT PREVIEW -->
            <v-window-item value="print">
              <div class="d-flex justify-center py-4">
                <div
                  class="print-paper-sheet elevation-8 bg-white pa-8 rounded"
                  style="width: 100%; max-width: 800px; min-height: 800px; font-family: sans-serif;"
                >
                  <!-- Cabecera de impresión -->
                  <div class="d-flex justify-space-between align-center border-b pb-4 mb-4">
                    <div
                      style="width: 100px; height: 50px;"
                      class="d-flex align-center bg-grey-lighten-3 rounded px-2 text-caption text-grey"
                    >
                      Logo Terracon
                    </div>
                    <div class="text-center flex-grow-1 px-4">
                      <h2 class="text-h6 font-weight-bold text-grey-darken-3 mb-1 uppercase">
                        {{ selectedPreviewTemplate?.nombre || selectedPreviewTemplate?.name_template_srv }}
                      </h2>
                      <div class="text-caption text-grey-darken-1">
                        Código: {{ selectedPreviewTemplate?.codigo || selectedPreviewTemplate?.codi_template_srv || 'TPI-XXX-PRT' }}
                      </div>
                    </div>
                    <div
                      style="width: 100px; height: 50px;"
                      class="d-flex align-center bg-grey-lighten-3 rounded px-2 text-caption text-grey"
                    >
                      Logo Cliente
                    </div>
                  </div>

                  <!-- Datos generales del protocolo -->
                  <div class="mb-6">
                    <h3 class="text-subtitle-2 font-weight-bold border-b pb-1 mb-2 text-grey-darken-3">
                      Datos Generales del Protocolo
                    </h3>
                    <v-row dense>
                      <v-col cols="6">
                        <div class="text-caption text-left">
                          <strong>Área:</strong> HSEQ / Producción
                        </div>
                        <div class="text-caption text-left">
                          <strong>Nombre:</strong> {{ selectedPreviewTemplate?.nombre }}
                        </div>
                      </v-col>
                      <v-col cols="6">
                        <div class="text-caption text-left">
                          <strong>Proyecto / Contrato:</strong> [Proyecto Asignado]
                        </div>
                        <div class="text-caption text-left">
                          <strong>Usuario Responsable:</strong> [Firma de Operador]
                        </div>
                      </v-col>
                    </v-row>
                  </div>

                  <!-- Renderizado de Segmentos y Atributos (Impresión) -->
                  <div v-if="selectedPreviewTemplate">
                    <div
                      v-for="(seg, sIdx) in getPreviewSegmentos(selectedPreviewTemplate)"
                      :key="sIdx"
                      class="mb-6"
                    >
                      <h4 class="text-subtitle-2 font-weight-bold text-blue-darken-3 border-b-2 pb-1 mb-3 text-left">
                        {{ seg.label || `Segmento ${sIdx + 1}` }}
                      </h4>

                      <!-- Contenedor de atributos -->
                      <div v-if="seg.attributes && seg.attributes.length">
                        <!-- Iterar atributos -->
                        <div
                          v-for="(attr, aIdx) in seg.attributes"
                          :key="aIdx"
                          class="mb-4"
                        >
                          <!-- Text, Number, Textarea, Dates -->
                          <v-row
                            v-if="['textField', 'textArea', 'number', 'decimal', 'datePicker', 'dateHourPicker', 'comboBox', 'combobox'].includes(attr.type)"
                            dense
                          >
                            <v-col
                              cols="4"
                              class="text-caption font-weight-bold text-grey-darken-2 d-flex align-center text-left"
                            >
                              {{ attr.label || attr.quest || 'Pregunta' }}
                            </v-col>
                            <v-col
                              cols="8"
                              class="border-b text-caption text-grey py-1 min-height-24 font-italic text-left"
                            >
                              __________________________________________________________________________
                            </v-col>
                          </v-row>

                          <!-- CheckList -->
                          <div
                            v-else-if="attr.type === 'checkList'"
                            class="mt-2 text-left"
                          >
                            <div class="text-caption font-weight-bold text-grey-darken-3 mb-2">
                              {{ attr.label || 'Lista de Chequeo' }}
                            </div>
                            <table class="w-100 print-preview-table">
                              <thead>
                                <tr class="bg-grey-lighten-4 text-left">
                                  <th class="pa-2 text-caption font-weight-bold">
                                    Ítem / Control
                                  </th>
                                  <th
                                    class="pa-2 text-caption font-weight-bold text-center"
                                    style="width: 60px;"
                                  >
                                    SI
                                  </th>
                                  <th
                                    class="pa-2 text-caption font-weight-bold text-center"
                                    style="width: 60px;"
                                  >
                                    NO
                                  </th>
                                  <th
                                    class="pa-2 text-caption font-weight-bold text-center"
                                    style="width: 60px;"
                                  >
                                    N/A
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr
                                  v-for="(chk, cIdx) in attr.checkBoby"
                                  :key="cIdx"
                                  class="border-b"
                                >
                                  <td class="pa-2 text-caption">
                                    {{ chk.label }}
                                  </td>
                                  <td class="pa-2 text-center text-caption">
                                    <v-icon
                                      icon="mdi-checkbox-blank-outline"
                                      size="16"
                                      color="grey"
                                    />
                                  </td>
                                  <td class="pa-2 text-center text-caption">
                                    <v-icon
                                      icon="mdi-checkbox-blank-outline"
                                      size="16"
                                      color="grey"
                                    />
                                  </td>
                                  <td class="pa-2 text-center text-caption">
                                    <v-icon
                                      icon="mdi-checkbox-blank-outline"
                                      size="16"
                                      color="grey"
                                    />
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          <!-- Photo Capture / File Upload -->
                          <div
                            v-else-if="['photoCapture', 'fileUpload', 'photo'].includes(attr.type)"
                            class="border pa-4 rounded-lg bg-grey-lighten-5 text-center my-2 border-dashed"
                          >
                            <v-icon
                              icon="mdi-camera-outline"
                              color="grey"
                              size="24"
                              class="mb-1"
                            />
                            <div class="text-caption font-weight-bold text-grey-darken-1">
                              {{ attr.label || 'Registro Fotográfico' }}
                            </div>
                            <div class="text-caption text-grey">
                              Espacio reservado para captura de imágenes de evidencia
                            </div>
                          </div>

                          <!-- Lógica Semanal Diaria (Vibropison, Betonera, etc.) -->
                          <div
                            v-else-if="['vibropison', 'chequeoSeguridadBetonera', 'chequeoExtensionElectrica', 'checkMonofasicoTrifasico', 'checkListTecles', 'checkListHerramientasManuales'].includes(attr.type)"
                            class="mt-2 text-left"
                          >
                            <div class="text-caption font-weight-bold text-grey-darken-3 mb-1">
                              {{ attr.label || 'Chequeo Semanal' }}
                            </div>
                            <table class="w-100 print-preview-table text-center">
                              <thead>
                                <tr class="bg-grey-lighten-4">
                                  <th class="pa-2 text-caption font-weight-bold text-left">
                                    Control Semanal
                                  </th>
                                  <th
                                    class="pa-2 text-caption font-weight-bold"
                                    style="width: 45px;"
                                  >
                                    L
                                  </th>
                                  <th
                                    class="pa-2 text-caption font-weight-bold"
                                    style="width: 45px;"
                                  >
                                    M
                                  </th>
                                  <th
                                    class="pa-2 text-caption font-weight-bold"
                                    style="width: 45px;"
                                  >
                                    M
                                  </th>
                                  <th
                                    class="pa-2 text-caption font-weight-bold"
                                    style="width: 45px;"
                                  >
                                    J
                                  </th>
                                  <th
                                    class="pa-2 text-caption font-weight-bold"
                                    style="width: 45px;"
                                  >
                                    V
                                  </th>
                                  <th class="pa-2 text-caption font-weight-bold text-left">
                                    Observaciones
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr
                                  v-for="wItem in getWeeklyItems(attr)"
                                  :key="wItem"
                                  class="border-b"
                                >
                                  <td class="pa-2 text-caption text-left">
                                    {{ wItem }}
                                  </td>
                                  <td class="pa-2">
                                    <v-icon
                                      icon="mdi-checkbox-blank-outline"
                                      size="14"
                                      color="grey"
                                    />
                                  </td>
                                  <td class="pa-2">
                                    <v-icon
                                      icon="mdi-checkbox-blank-outline"
                                      size="14"
                                      color="grey"
                                    />
                                  </td>
                                  <td class="pa-2">
                                    <v-icon
                                      icon="mdi-checkbox-blank-outline"
                                      size="14"
                                      color="grey"
                                    />
                                  </td>
                                  <td class="pa-2">
                                    <v-icon
                                      icon="mdi-checkbox-blank-outline"
                                      size="14"
                                      color="grey"
                                    />
                                  </td>
                                  <td class="pa-2">
                                    <v-icon
                                      icon="mdi-checkbox-blank-outline"
                                      size="14"
                                      color="grey"
                                    />
                                  </td>
                                  <td class="pa-2 text-caption text-left text-grey font-italic">
                                    __________________
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          <!-- Lista Inspeccion Camion -->
                          <div
                            v-else-if="['listaInspeccionCamion', 'LISTA INSPECCION CAMION'].includes(attr.type)"
                            class="mt-2 text-left"
                          >
                            <div class="text-caption font-weight-bold text-grey-darken-3 mb-1">
                              {{ attr.label || 'Inspección de Camión (Mensual)' }}
                            </div>
                            <table
                              class="w-100 print-preview-table text-center"
                              style="font-size: 10px;"
                            >
                              <thead>
                                <tr class="bg-grey-lighten-4">
                                  <th
                                    class="pa-2 text-left font-weight-bold"
                                    rowspan="2"
                                  >
                                    Elemento a Inspeccionar
                                  </th>
                                  <th
                                    class="pa-1 font-weight-bold"
                                    colspan="3"
                                  >
                                    Semana 1
                                  </th>
                                  <th
                                    class="pa-1 font-weight-bold"
                                    colspan="3"
                                  >
                                    Semana 2
                                  </th>
                                  <th
                                    class="pa-1 font-weight-bold"
                                    colspan="3"
                                  >
                                    Semana 3
                                  </th>
                                  <th
                                    class="pa-1 font-weight-bold"
                                    colspan="3"
                                  >
                                    Semana 4
                                  </th>
                                </tr>
                                <tr
                                  class="bg-grey-lighten-4"
                                  style="font-size: 8px;"
                                >
                                  <th>SI</th><th>NO</th><th>NA</th>
                                  <th>SI</th><th>NO</th><th>NA</th>
                                  <th>SI</th><th>NO</th><th>NA</th>
                                  <th>SI</th><th>NO</th><th>NA</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr
                                  v-for="cItem in getTruckItems(attr)"
                                  :key="cItem.label"
                                  :class="{ 'bg-grey-lighten-5 font-weight-bold': cItem.kind === 'group', 'border-b': cItem.kind !== 'group' }"
                                >
                                  <td
                                    class="pa-2 text-left"
                                    :colspan="cItem.kind === 'group' ? 13 : 1"
                                  >
                                    {{ cItem.label }}
                                  </td>
                                  <template v-if="cItem.kind !== 'group'">
                                    <td>
                                      <v-icon
                                        icon="mdi-checkbox-blank-outline"
                                        size="12"
                                        color="grey"
                                      />
                                    </td>
                                    <td>
                                      <v-icon
                                        icon="mdi-checkbox-blank-outline"
                                        size="12"
                                        color="grey"
                                      />
                                    </td>
                                    <td>
                                      <v-icon
                                        icon="mdi-checkbox-blank-outline"
                                        size="12"
                                        color="grey"
                                      />
                                    </td>
                                    <td>
                                      <v-icon
                                        icon="mdi-checkbox-blank-outline"
                                        size="12"
                                        color="grey"
                                      />
                                    </td>
                                    <td>
                                      <v-icon
                                        icon="mdi-checkbox-blank-outline"
                                        size="12"
                                        color="grey"
                                      />
                                    </td>
                                    <td>
                                      <v-icon
                                        icon="mdi-checkbox-blank-outline"
                                        size="12"
                                        color="grey"
                                      />
                                    </td>
                                    <td>
                                      <v-icon
                                        icon="mdi-checkbox-blank-outline"
                                        size="12"
                                        color="grey"
                                      />
                                    </td>
                                    <td>
                                      <v-icon
                                        icon="mdi-checkbox-blank-outline"
                                        size="12"
                                        color="grey"
                                      />
                                    </td>
                                    <td>
                                      <v-icon
                                        icon="mdi-checkbox-blank-outline"
                                        size="12"
                                        color="grey"
                                      />
                                    </td>
                                    <td>
                                      <v-icon
                                        icon="mdi-checkbox-blank-outline"
                                        size="12"
                                        color="grey"
                                      />
                                    </td>
                                    <td>
                                      <v-icon
                                        icon="mdi-checkbox-blank-outline"
                                        size="12"
                                        color="grey"
                                      />
                                    </td>
                                    <td>
                                      <v-icon
                                        icon="mdi-checkbox-blank-outline"
                                        size="12"
                                        color="grey"
                                      />
                                    </td>
                                  </template>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          <!-- Fallback for other custom/unhandled attributes -->
                          <v-row
                            v-else
                            dense
                          >
                            <v-col
                              cols="4"
                              class="text-caption font-weight-bold text-grey-darken-2 text-left"
                            >
                              {{ attr.label || attr.type }}
                            </v-col>
                            <v-col
                              cols="8"
                              class="text-caption text-grey py-1 border-b text-left"
                            >
                              [ Campo de entrada: {{ attr.type }} ]
                            </v-col>
                          </v-row>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </v-window-item>
          </v-window>
        </v-card-text>
      </v-card>
    </v-dialog>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import * as XLSX from 'xlsx'
import apiAxios from '@/services/api'
import DashboardLayout from '../layouts/dashboard.vue'
import { useUserDetailStore } from '@/stores/userDetail'
import { useSurveyDetailStore } from '@/stores/surveyDetail'
import PwaPreview from '@/components/mantenedores/PwaPreview.vue'
import Highcharts from 'highcharts/highcharts-gantt'

const router = useRouter()
const userDetailStore = useUserDetailStore()
const surveyDetailStore = useSurveyDetailStore()

// Setup Dual-View State
const showWizard = ref(false)
const projectsList = ref([])
const previewDialog = ref(false)
const previewTab = ref('pwa')
const selectedPreviewTemplate = ref(null)
const previewReady = ref(false)
const loadingProjects = ref(false)

// Steps Definition
const step = ref(1)
const stepsList = [
  { val: 1, label: 'Datos Generales' },
  { val: 2, label: 'Nómina (Excel)' },
  { val: 3, label: 'Equipos' },
  { val: 4, label: 'Carga Gantt' },
  { val: 5, label: 'Calidad' },
  { val: 6, label: 'Medio Amb.' },
  { val: 7, label: 'Seguridad' }
]

// State / Lists
const companies = ref([])
const projectTypes = ref([])
const projectStates = ref([])
const usersList = ref([])
const rolesList = ref([])
const sstTemplates = ref([])
const qualityTemplates = ref([])
const environmentTemplates = ref([])
const avanceTemplates = ref([])

// Wizard Global Project References
const createdProjectId = ref(null)
const savingProject = ref(false)
const successDialog = ref(false)

// Form Step 1
const formStep1 = ref(null)
const projectForm = ref({
  nombre_proyecto: '',
  codi_proyecto: '',
  centro_costo: '',
  id_empresa_cliente: null,
  id_proyecto_tipo: 1,
  id_proyecto_estado: 2, // default Planificación
  fecha_plan_ini: '',
  fecha_plan_fin: '',
  objetivo_proyecto: '',
  observacion_proyecto: '',
  id_proyecto_padre: null,
  id_usuario_cliente: null,
  id_usuario_jefe_proyecto: null,
  duracion_plan: 0,
  avance_plan_proyecto: 0,
  json_field: {}
})

// Step 2: Roster (Nómina)
const rosterFile = ref(null)
const rosterRows = ref([])
const processingRoster = ref(false)
const rosterStatusMsg = ref('')
const rosterStatusType = ref('success')

// Step 3: Teams
const newTeam = ref({
  nombre_equipo: '',
  descripcion_equipo: '',
  id_usuario_lider: null,
  miembros: []
})
const createdTeams = ref([]) // local list of teams (draft state / synchronised)

// Step 4: Gantt
const ganttFile = ref(null)
const ganttTasks = ref([])
const savingGantt = ref(false)
const ganttMinDate = ref('—')
const ganttMaxDate = ref('—')
const ganttStatusMsg = ref('')
const ganttStatusType = ref('success')
const ganttChartContainer = ref(null)
const ganttChartInstance = ref(null)

// HSEQ Selections & KPIs (Staging area variables)
const hseqSelection = ref({
  seguridad: [],
  calidad: [],
  medioAmbiente: [],
  avance: []
})

const calidadKPIs = ref({
  meta_cumplimiento_protocolos: 95,
  limite_desviaciones: 5,
  frecuencia_auditorias_dias: 30
})

const medioAmbienteKPIs = ref({
  meta_clasificacion_residuos: 90,
  limite_incidentes_ambientales: 0,
  frecuencia_inspecciones_dias: 15
})

const seguridadKPIs = ref({
  meta_asistencia_charlas: 100,
  meta_elaboracion_asts: 100,
  meta_inspecciones_seguridad: 90,
  frecuencia_inspeccion_herramientas_dias: 7
})

// --- Helper: Matrix status parsing ---
const stepNameMapping = {
  1: 'general',
  2: 'roster',
  3: 'teams',
  4: 'gantt',
  5: 'calidad',
  6: 'medioAmbiente',
  7: 'seguridad'
}

const currentStepOk = computed(() => {
  const sName = stepNameMapping[step.value]
  const j = projectForm.value.json_field || {}
  return !!j.stage_ok?.[sName]
})

const currentStepDraft = computed(() => {
  const sName = stepNameMapping[step.value]
  const j = projectForm.value.json_field || {}
  return !!j.stage_drafts?.[sName]
})

function getChipStatus(proj, stage) {
  let j = proj.json_field
  if (typeof j === 'string') {
    try { j = JSON.parse(j) } catch { j = {} }
  }
  if (!j) j = {}
  
  if (j.stage_ok?.[stage]) {
    return { label: 'OK', color: 'success', icon: 'mdi-check-circle' }
  }
  if (j.stage_drafts?.[stage]) {
    return { label: 'Borrador', color: 'orange', icon: 'mdi-pencil' }
  }
  return { label: 'Pendiente', color: 'grey', icon: 'mdi-circle-outline' }
}

function getStepCompletedStatus(stepVal) {
  const sName = stepNameMapping[stepVal]
  const j = projectForm.value.json_field || {}
  return !!j.stage_ok?.[sName]
}

// --- Fetch projects for Matrix ---
async function fetchProjects() {
  loadingProjects.value = true
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerProyectos')
    projectsList.value = Array.isArray(data) ? data.filter(p => p.nombre_proyecto) : []
  } catch (err) {
    console.error('Error al obtener proyectos:', err)
  } finally {
    loadingProjects.value = false
  }
}

// --- Navigation & Project Loading ---
function backToMatrix() {
  showWizard.value = false
  fetchProjects()
}

function goToMatrixView() {
  successDialog.value = false
  showWizard.value = false
  fetchProjects()
}

function initNewProject() {
  resetWizard()
  showWizard.value = true
}

function openProjectWizard(proj, stageOrStep) {
  resetWizard()
  createdProjectId.value = proj.id_proyecto
  
  // Set basic form values
  projectForm.value = {
    ...proj,
    json_field: typeof proj.json_field === 'string' ? JSON.parse(proj.json_field || '{}') : (proj.json_field || {})
  }
  
  const j = projectForm.value.json_field || {}
  
  // Load drafts
  if (j.stage_drafts) {
    const d = j.stage_drafts
    if (d.general) {
      projectForm.value = { ...projectForm.value, ...d.general }
    }
    if (d.roster) {
      rosterRows.value = d.roster
    }
    if (d.teams) {
      createdTeams.value = d.teams
    }
    if (d.gantt) {
      if (Array.isArray(d.gantt)) {
        ganttTasks.value = d.gantt
        hseqSelection.value.avance = []
      } else {
        ganttTasks.value = d.gantt.tasks || []
        hseqSelection.value.avance = d.gantt.templates || []
      }
    }
    if (d.calidad) {
      hseqSelection.value.calidad = d.calidad.templates || []
      calidadKPIs.value = { ...calidadKPIs.value, ...d.calidad.kpis }
    }
    if (d.medioAmbiente) {
      hseqSelection.value.medioAmbiente = d.medioAmbiente.templates || []
      medioAmbienteKPIs.value = { ...medioAmbienteKPIs.value, ...d.medioAmbiente.kpis }
    }
    if (d.seguridad) {
      hseqSelection.value.seguridad = d.seguridad.templates || []
      seguridadKPIs.value = { ...seguridadKPIs.value, ...d.seguridad.kpis }
    }
  }

  // Resolve active step based on stage name clicked
  if (typeof stageOrStep === 'string') {
    const matchedStep = Object.keys(stepNameMapping).find(k => stepNameMapping[k] === stageOrStep)
    step.value = matchedStep ? Number(matchedStep) : 1
  } else {
    step.value = stageOrStep
  }
  
  showWizard.value = true
}

// --- Step Draft Saving & Sychronisation ---
async function saveDraft(stepVal) {
  if (stepVal === 1) {
    // Validate Step 1
    const isValid = formStep1.value ? await formStep1.value.validate() : { valid: true }
    if (!isValid.valid) return
  }

  savingProject.value = true
  try {
    const j = projectForm.value.json_field || {}
    if (!j.stage_drafts) j.stage_drafts = {}
    if (!j.stage_ok) j.stage_ok = {}

    const sName = stepNameMapping[stepVal]
    j.stage_ok[sName] = false // Marks draft state (not synchronized yet)

    // Collect data per step
    if (stepVal === 1) {
      j.stage_drafts.general = {
        nombre_proyecto: projectForm.value.nombre_proyecto,
        codi_proyecto: projectForm.value.codi_proyecto,
        centro_costo: projectForm.value.centro_costo,
        id_empresa_cliente: projectForm.value.id_empresa_cliente,
        id_proyecto_tipo: projectForm.value.id_proyecto_tipo,
        id_proyecto_estado: projectForm.value.id_proyecto_estado,
        fecha_plan_ini: projectForm.value.fecha_plan_ini,
        fecha_plan_fin: projectForm.value.fecha_plan_fin,
        objetivo_proyecto: projectForm.value.objetivo_proyecto
      }
    } else if (stepVal === 2) {
      j.stage_drafts.roster = rosterRows.value
    } else if (stepVal === 3) {
      j.stage_drafts.teams = createdTeams.value
    } else if (stepVal === 4) {
      j.stage_drafts.gantt = {
        tasks: ganttTasks.value,
        templates: hseqSelection.value.avance
      }
    } else if (stepVal === 5) {
      j.stage_drafts.calidad = {
        templates: hseqSelection.value.calidad,
        kpis: calidadKPIs.value
      }
    } else if (stepVal === 6) {
      j.stage_drafts.medioAmbiente = {
        templates: hseqSelection.value.medioAmbiente,
        kpis: medioAmbienteKPIs.value
      }
    } else if (stepVal === 7) {
      j.stage_drafts.seguridad = {
        templates: hseqSelection.value.seguridad,
        kpis: seguridadKPIs.value
      }
    }

    projectForm.value.json_field = j

    const payload = {
      ...projectForm.value,
      id_empresa: 1,
      id_user_creacion: userDetailStore.userDetail?.id_user || null,
      json_field: j
    }

    if (!createdProjectId.value) {
      // Create draft project record in DB first
      const { data } = await apiAxios.post('/proyectos', payload)
      createdProjectId.value = data?.proyecto?.id_proyecto || data?.proyecto?.id
      projectForm.value.id_proyecto = createdProjectId.value
    } else {
      // Update existing draft record
      await apiAxios.put(`/proyectos/${createdProjectId.value}`, payload)
    }

    alert('Borrador de etapa guardado exitosamente en Staging.')
  } catch (err) {
    console.error('Error guardando borrador:', err)
    alert('Error al guardar borrador: ' + (err?.response?.data?.error || err.message))
  } finally {
    savingProject.value = false
  }
}

async function confirmAndSync(stepVal) {
  // Save current status as draft first
  await saveDraft(stepVal)
  
  if (!createdProjectId.value) return
  
  savingProject.value = true
  try {
    const sName = stepNameMapping[stepVal]
    
    // Execute specific step promotions
    if (stepVal === 1) {
      // General data promotion: project metadata is already written during saveDraft.
      // Simply mark as OK.
    } else if (stepVal === 2) {
      // Roster promotion: trigger mass enrollment
      if (rosterRows.value.length) {
        await processMassEnrollment()
      }
    } else if (stepVal === 3) {
      // Teams promotion: create teams in database
      for (const t of createdTeams.value) {
        if (!t.id_equipo_proyecto) {
          // Create team
          const resp = await apiAxios.post('/proyectos/crearEquipoProyecto', {
            id_proyecto: Number(createdProjectId.value),
            nombre_equipo: t.nombre_equipo.trim(),
            descripcion_equipo: t.descripcion_equipo?.trim() || null,
            id_usuario_lider: t.id_usuario_lider,
            estado_equipo: 'ACTIVO',
            json_field: null
          })
          
          // Fetch members link
          const teamsResp = await apiAxios.get('/servicio/leanglobal/obtenerEquiposProyectosMiembros', {
            params: { id_proyecto: Number(createdProjectId.value) }
          })
          const matched = Array.isArray(teamsResp.data) ? teamsResp.data.find(x => x.nombre_equipo === t.nombre_equipo.trim()) : null
          const dbId = matched?.id_equipo_proyecto
          
          if (dbId) {
            t.id_equipo_proyecto = dbId
            if (t.miembros_ids?.length) {
              await apiAxios.put('/equipos/updEquipos', {
                id_equipo_proyecto: dbId,
                nombre_equipo: t.nombre_equipo.trim(),
                descripcion_equipo: t.descripcion_equipo?.trim() || null,
                ids_usuarios: t.miembros_ids.map(Number),
                id_usuario_modificacion: Number(userDetailStore.userDetail?.id_user)
              })
            }
          }
        }
      }
    } else if (stepVal === 4) {
      // Gantt promotion
      ganttStatusMsg.value = 'Sincronizando tareas Gantt con la planificación...'
      ganttStatusType.value = 'info'
      // Keep consolidated tasks in staging state
      ganttStatusMsg.value = 'Planificación Gantt sincronizada exitosamente.'
      ganttStatusType.value = 'success'
    } else if (stepVal === 5) {
      // Calidad HSEQ template link
    } else if (stepVal === 6) {
      // Medio Ambiente template link
    } else if (stepVal === 7) {
      // Seguridad template link
    }

    // Mark as OK and update json_field
    const j = projectForm.value.json_field || {}
    if (!j.stage_ok) j.stage_ok = {}
    j.stage_ok[sName] = true
    
    // Save updated stage_ok state
    const payload = {
      ...projectForm.value,
      id_empresa: 1,
      id_user_creacion: userDetailStore.userDetail?.id_user || null,
      json_field: j
    }
    
    await apiAxios.put(`/proyectos/${createdProjectId.value}`, payload)
    alert(`¡Etapa ${stepsList.find(s => s.val === stepVal)?.label} sincronizada y marcada como OK con éxito!`)
  } catch (err) {
    console.error('Error sincronizando etapa:', err)
    alert('Error al sincronizar etapa: ' + (err?.response?.data?.error || err.message))
  } finally {
    savingProject.value = false
  }
}

// --- Excel Template Generation & Downloader ---
function downloadRosterTemplate() {
  const data = [
    {
      'RUT': '12.345.678-9',
      'Nombre': 'Juan Pérez',
      'Correo': 'juan.perez@leanglobal.cl',
      'Roles': 'Supervisor'
    },
    {
      'RUT': '98.765.432-1',
      'Nombre': 'Ana María Silva',
      'Correo': 'ana.silva@leanglobal.cl',
      'Roles': 'Técnico / Operador'
    },
    {
      'RUT': '11.111.111-1',
      'Nombre': 'Carlos González',
      'Correo': 'carlos.g@leanglobal.cl',
      'Roles': 'Prevencionista'
    }
  ]
  const ws = XLSX.utils.json_to_sheet(data)
  ws['!cols'] = [
    { wch: 15 },
    { wch: 25 },
    { wch: 30 },
    { wch: 25 }
  ]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Nómina')
  XLSX.writeFile(wb, 'plantilla_nomina_trabajadores.xlsx')
}

function downloadGanttTemplate() {
  const start = new Date()
  const offset = (8 - start.getDay()) % 7
  start.setDate(start.getDate() + offset)

  const excelDates = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    excelDates.push(d)
  }

  const rows = []
  rows.push(['', 'CONSOLA SETUP - PLANTILLA DE PLANIFICACIÓN GANTT'])
  rows.push(['', 'Complete los campos a partir de la fila 7. La fila 5 contiene las fechas diarias del plan.'])
  rows.push([])
  rows.push([])

  const row5 = ['', 'EDT', 'Partida', 'Actividad', 'Unidad', 'Cantidad Total', 'Recurso', '']
  excelDates.forEach(d => {
    row5.push(d)
  })
  rows.push(row5)
  rows.push([])

  const row7 = ['', '1.1', 'Obras Civiles', 'Excavación de Trazado', 'm3', 150, 'Cuadrilla Excavación A', '', 30, 30, 30, 30, 30, 0, 0]
  rows.push(row7)
  const row8 = ['', '1.2', 'Obras Civiles', 'Hormigonado de Fundación', 'm3', 50, 'Cuadrilla Hormigón A', '', 10, 10, 10, 10, 10, 0, 0]
  rows.push(row8)

  const ws = XLSX.utils.aoa_to_sheet(rows, { cellDates: true })

  ws['!cols'] = [
    { wch: 3 },
    { wch: 10 },
    { wch: 25 },
    { wch: 35 },
    { wch: 10 },
    { wch: 15 },
    { wch: 25 },
    { wch: 3 }
  ]
  for (let i = 0; i < 7; i++) {
    ws['!cols'].push({ wch: 12 })
  }

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Planificacion')
  XLSX.writeFile(wb, 'plantilla_gantt_planificacion.xlsx')
}

// --- Step 2: Excel Roster Parser ---
function onRosterSelected(input) {
  if (!input) {
    rosterRows.value = []
    rosterStatusMsg.value = ''
    return
  }

  const file = Array.isArray(input) ? input[0] : input
  if (!(file instanceof Blob)) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const json = XLSX.utils.sheet_to_json(sheet, { defval: '' })

      if (!json.length) {
        rosterStatusMsg.value = 'El Excel viene vacío o no tiene encabezados.'
        rosterStatusType.value = 'error'
        return
      }

      rosterRows.value = json.map(raw => {
        const rut = raw.rut || raw.Rut || raw.RUT || ''
        const nombre = raw.nombre || raw.Nombre || raw.NOMBRE || ''
        const correo = raw.correo || raw.Correo || raw.CORREO || raw.email || raw.Email || ''
        const rolesRaw = raw.roles || raw.Roles || raw.ROLES || ''

        // Map roles
        const tokens = String(rolesRaw).split(',').map(x => x.trim().toUpperCase()).filter(Boolean)
        const matchedRoleIds = []
        tokens.forEach(t => {
          const match = rolesList.value.find(r => String(r.name_rol).toUpperCase().includes(t))
          if (match) matchedRoleIds.push(match.id_rol)
        })

        return {
          rut: normalizarRut(rut),
          nombre: String(nombre).trim(),
          correo: String(correo).trim(),
          rolesIds: matchedRoleIds.length ? matchedRoleIds : [14], // Default Technical role
          _status: 'PENDIENTE',
          _log: ''
        }
      }).filter(r => r.rut || r.nombre || r.correo)

      rosterStatusMsg.value = `Se detectaron ${rosterRows.value.length} filas en la nómina.`
      rosterStatusType.value = 'success'
    } catch (err) {
      console.error(err)
      rosterStatusMsg.value = 'Error al leer el archivo Excel.'
      rosterStatusType.value = 'error'
    }
  }
  reader.readAsArrayBuffer(file)
}

function normalizarRut(val) {
  if (!val) return ''
  const v = String(val).replace(/[^0-9Kk]/g, '').toUpperCase()
  if (v.length < 2) return v
  return `${v.slice(0, -1)}-${v.slice(-1)}`
}

async function processMassEnrollment() {
  processingRoster.value = true
  rosterStatusMsg.value = 'Iniciando enrolamiento masivo...'
  rosterStatusType.value = 'info'

  let okCount = 0
  let errCount = 0

  for (const row of rosterRows.value) {
    if (row._status === 'OK') {
      okCount++
      continue
    }

    if (!row.rut || !row.correo) {
      row._status = 'ERROR'
      row._log = 'Falta RUT o correo'
      errCount++
      continue
    }

    try {
      await apiAxios.post('/usuarios/inicioEnrolamiento/', {
        rut: row.rut,
        nombre: row.nombre,
        correo: row.correo,
        roles: row.rolesIds
      })
      row._status = 'OK'
      okCount++
    } catch (err) {
      console.error('Error enrolando user:', row.rut, err)
      const rawErr = err?.response?.data?.error || err?.response?.data?.message || err?.message || ''
      row._status = 'ERROR'
      row._log = String(rawErr).includes('rut_key') ? 'RUT ya enrolado' : (String(rawErr).includes('email_key') ? 'Correo ocupado' : rawErr)
      errCount++
    }
  }

  rosterStatusMsg.value = `Enrolamiento masivo completado. Éxito: ${okCount} | Fallidos: ${errCount}`
  rosterStatusType.value = errCount > 0 ? 'warning' : 'success'
  processingRoster.value = false

  await fetchUsers()
}

// --- Step 3: Teams Setup ---
function addTeamLocal() {
  if (!newTeam.value.nombre_equipo) return

  const leaderName = usersList.value.find(u => u.id_user === newTeam.value.id_usuario_lider)?.nombre_user || 'Sin lider'
  const memberNames = newTeam.value.miembros.map(mid => usersList.value.find(u => u.id_user === mid)?.nombre_user || 'Operador')

  createdTeams.value.push({
    id_equipo_proyecto: null, // Draft
    nombre_equipo: newTeam.value.nombre_equipo.trim(),
    descripcion_equipo: newTeam.value.descripcion_equipo?.trim() || null,
    id_usuario_lider: newTeam.value.id_usuario_lider,
    lider_nombre: leaderName,
    miembros_ids: [...newTeam.value.miembros],
    miembros_nombres: memberNames
  })

  // Clear form
  newTeam.value = {
    nombre_equipo: '',
    descripcion_equipo: '',
    id_usuario_lider: null,
    miembros: []
  }
}

function removeTeamLocal(idx) {
  createdTeams.value.splice(idx, 1)
}

// --- Step 4: Gantt Excel Parser ---
function onGanttSelected(input) {
  if (!input) {
    ganttTasks.value = []
    ganttStatusMsg.value = ''
    return
  }

  const file = Array.isArray(input) ? input[0] : input
  if (!(file instanceof Blob)) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const targetSheet = workbook.SheetNames.find(n => n.includes('Programacion') || n.includes('Copia')) || workbook.SheetNames[0]
      const sheet = workbook.Sheets[targetSheet]

      const range = XLSX.utils.decode_range(sheet['!ref'])
      const dates = {}
      for (let c = 8; c <= range.e.c; c++) {
        const cellRef = XLSX.utils.encode_cell({ r: 4, c: c })
        const val = sheet[cellRef]?.v
        if (val && typeof val === 'number' && val > 40000) {
          const dt = new Date((val - 25569) * 86400 * 1000)
          dates[c] = dt.toISOString().split('T')[0]
        }
      }

      const allDates = Object.values(dates).sort()
      ganttMinDate.value = allDates[0] || '—'
      ganttMaxDate.value = allDates[allDates.length - 1] || '—'

      const rows = []
      for (let r = 6; r <= range.e.r; r++) {
        const edt = String(sheet[XLSX.utils.encode_cell({ r: r, c: 1 })]?.v || '').trim()
        const partida = String(sheet[XLSX.utils.encode_cell({ r: r, c: 2 })]?.v || '').trim()
        const actividad = String(sheet[XLSX.utils.encode_cell({ r: r, c: 3 })]?.v || '').trim()
        const unidad = String(sheet[XLSX.utils.encode_cell({ r: r, c: 4 })]?.v || '').trim()
        const cantidadVal = Number(sheet[XLSX.utils.encode_cell({ r: r, c: 5 })]?.v || 0)
        const recurso = String(sheet[XLSX.utils.encode_cell({ r: r, c: 6 })]?.v || '').trim()

        if (!edt || (!partida && !actividad)) continue

        // Check resource validity locally
        const resourceExists = createdTeams.value.some(t => String(t.nombre_equipo).trim().toUpperCase() === recurso.toUpperCase())

        const dailyData = []
        for (let c = 8; c <= range.e.c; c++) {
          const val = Number(sheet[XLSX.utils.encode_cell({ r: r, c: c })]?.v || 0)
          if (val > 0 && dates[c]) {
            dailyData.push({ fecha: dates[c], value: val, real: 0 })
          }
        }

        rows.push({
          edt: edt.replace(',', '.'),
          nombre: actividad || partida,
          nivel: edt.split('.').length || 1,
          unidad,
          cantidad: cantidadVal,
          recurso,
          recursoValido: !recurso || resourceExists,
          jsonData: dailyData
        })
      }

      ganttTasks.value = rows
      const hasInvalidResources = rows.some(r => !r.recursoValido)
      if (hasInvalidResources) {
        ganttStatusMsg.value = 'Aviso: Hay cuadrillas en la Gantt que no coinciden con las del Paso 3.'
        ganttStatusType.value = 'warning'
      } else {
        ganttStatusMsg.value = `Excel leído correctamente. Se detectaron ${rows.length} actividades.`
        ganttStatusType.value = 'success'
      }
    } catch (err) {
      console.error(err)
      ganttStatusMsg.value = 'Error al parsear archivo de Gantt.'
      ganttStatusType.value = 'error'
    }
  }
  reader.readAsArrayBuffer(file)
}

// --- Step Navigation Buttons ---
function goToStep(val) {
  if (val < step.value) {
    step.value = val
  } else if (val > step.value) {
    if (!createdProjectId.value) {
      alert('Debes guardar los Datos Generales del proyecto antes de avanzar.')
      return
    }
    step.value = val
  }
}

async function nextStep() {
  if (step.value === 1) {
    const isValid = formStep1.value ? await formStep1.value.validate() : { valid: true }
    if (!isValid.valid) return

    savingProject.value = true
    try {
      const payload = {
        ...projectForm.value,
        id_empresa: 1,
        id_user_creacion: userDetailStore.userDetail?.id_user || null,
        json_field: {
          setup_status: 'in_progress',
          created_at: new Date().toISOString()
        }
      }

      if (!createdProjectId.value) {
        const { data } = await apiAxios.post('/proyectos', payload)
        createdProjectId.value = data?.proyecto?.id_proyecto || data?.proyecto?.id
        projectForm.value.id_proyecto = createdProjectId.value
      } else {
        await apiAxios.put(`/proyectos/${createdProjectId.value}`, payload)
      }
      step.value = 2
    } catch (err) {
      console.error(err)
      alert('Error guardando datos generales: ' + (err?.response?.data?.error || err.message))
    } finally {
      savingProject.value = false
    }
  } else {
    step.value++
  }
}

function prevStep() {
  if (step.value > 1) {
    step.value--
  }
}

// --- Step 7: Finalize ---
async function finalizeSetup() {
  if (!createdProjectId.value) return
  savingProject.value = true

  try {
    const j = projectForm.value.json_field || {}
    j.setup_status = 'completed'
    
    // Save template checklist selections
    const finalSetupJson = {
      ...j,
      completed_at: new Date().toISOString(),
      roster: rosterRows.value.map(r => ({ rut: r.rut, nombre: r.nombre, correo: r.correo, status: r._status })),
      teams: createdTeams.value.map(t => ({ id: t.id_equipo_proyecto, name: t.nombre_equipo, leader: t.id_usuario_lider })),
      gantt_meta: {
        total_tasks: ganttTasks.value.length,
        min_date: ganttMinDate.value,
        max_date: ganttMaxDate.value
      },
      calidad: {
        templates: hseqSelection.value.calidad,
        kpis: calidadKPIs.value
      },
      medioAmbiente: {
        templates: hseqSelection.value.medioAmbiente,
        kpis: medioAmbienteKPIs.value
      },
      seguridad: {
        templates: hseqSelection.value.seguridad,
        kpis: seguridadKPIs.value
      },
      avance: {
        templates: hseqSelection.value.avance
      }
    }

    const projectRecord = {
      ...projectForm.value,
      id_empresa: 1,
      id_user_creacion: userDetailStore.userDetail?.id_user || null,
      id_proyecto_estado: 3, // Active / In Execution
      json_field: finalSetupJson
    }

    await apiAxios.put(`/proyectos/${createdProjectId.value}`, projectRecord)
    successDialog.value = true
  } catch (err) {
    console.error('Error finalizando proyecto:', err)
    alert('Error al finalizar el setup del proyecto: ' + (err?.response?.data?.error || err.message))
  } finally {
    savingProject.value = false
  }
}

function resetWizard() {
  successDialog.value = false
  createdProjectId.value = null
  step.value = 1
  projectForm.value = {
    nombre_proyecto: '',
    codi_proyecto: '',
    centro_costo: '',
    id_empresa_cliente: companies.value[0]?.id_empresa || null,
    id_proyecto_tipo: 1,
    id_proyecto_estado: 2,
    fecha_plan_ini: '',
    fecha_plan_fin: '',
    objetivo_proyecto: '',
    observacion_proyecto: '',
    id_proyecto_padre: null,
    id_usuario_cliente: null,
    id_usuario_jefe_proyecto: null,
    duracion_plan: 0,
    avance_plan_proyecto: 0,
    json_field: {}
  }
  rosterFile.value = null
  rosterRows.value = []
  createdTeams.value = []
  ganttFile.value = null
  ganttTasks.value = []
  hseqSelection.value = { seguridad: [], calidad: [], medioAmbiente: [], avance: [] }
  calidadKPIs.value = { meta_cumplimiento_protocolos: 95, limite_desviaciones: 5, frecuencia_auditorias_dias: 30 }
  medioAmbienteKPIs.value = { meta_clasificacion_residuos: 90, limite_incidentes_ambientales: 0, frecuencia_inspecciones_dias: 15 }
  seguridadKPIs.value = { meta_asistencia_charlas: 100, meta_elaboracion_asts: 100, meta_inspecciones_seguridad: 90, frecuencia_inspeccion_herramientas_dias: 7 }
}

// --- Fetch Configurations ---
async function fetchCompanies() {
  const { data } = await apiAxios.get('/servicio/leanglobal/obtenerEmpresas')
  companies.value = Array.isArray(data) ? data.filter(c => {
    const name = String(c.name_empresa).toLowerCase()
    return !name.includes('terracon') && !name.includes('leanglobal')
  }) : []
  
  if (companies.value.length && !projectForm.value.id_empresa_cliente) {
    projectForm.value.id_empresa_cliente = companies.value[0].id_empresa
  }
}

async function fetchProjectTypes() {
  const customTypes = [
    { id_proyecto_tipo: 1, descripcion_tipo: 'Construcción y Montaje de Líneas' },
    { id_proyecto_tipo: 2, descripcion_tipo: 'Mantenimiento Mayor' },
    { id_proyecto_tipo: 3, descripcion_tipo: 'Mantenimiento Menor' },
    { id_proyecto_tipo: 4, descripcion_tipo: 'Obras Civiles' },
    { id_proyecto_tipo: 5, descripcion_tipo: 'Inspección' },
    { id_proyecto_tipo: 6, descripcion_tipo: 'Construcción Redes de Gas' },
    { id_proyecto_tipo: 7, descripcion_tipo: 'Conversión y Conexión de Artefactos' },
  ]
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerTipoProyecto')
    if (Array.isArray(data) && data.length > 1) {
      projectTypes.value = data
    } else {
      projectTypes.value = customTypes
    }
  } catch {
    projectTypes.value = customTypes
  }
}

async function fetchProjectStates() {
  const { data } = await apiAxios.get('/servicio/leanglobal/obtenerEstadoProyecto')
  projectStates.value = Array.isArray(data) ? data : []
}

async function fetchUsers() {
  const { data: usersData } = await apiAxios.get('/servicio/leanglobal/obtenerUsuarios')
  let rawUsers = Array.isArray(usersData) ? usersData.filter(u => u.nombre_user) : []
  
  try {
    const { data: rolesData } = await apiAxios.get('/servicio/leanglobal/obtenerRoles')
    const { data: uRolesData } = await apiAxios.get('/servicio/leanglobal/obtenerUsuariosRoles')
    const rawRoles = Array.isArray(rolesData) ? rolesData : []
    const rawURoles = Array.isArray(uRolesData) ? uRolesData : []
    
    rawUsers.forEach(u => {
      const userRolesIds = rawURoles.filter(ur => Number(ur.id_usuario) === Number(u.id_user)).map(ur => Number(ur.id_rol))
      u.roles = rawRoles.filter(r => userRolesIds.includes(Number(r.id_rol)))
    })
  } catch (err) {
    console.error('Error fetching roles for users:', err)
  }
  
  usersList.value = rawUsers
}

async function fetchRoles() {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerRoles')
    rolesList.value = Array.isArray(data) ? data : []
  } catch {
    rolesList.value = [
      { id_rol: 6, name_rol: 'Supervisor (CNX-TRC-SUP)' },
      { id_rol: 7, name_rol: 'Planificador (CNX-TRC-PLAN)' },
      { id_rol: 11, name_rol: 'Prevencionista (CNX-TRC-PREV)' },
      { id_rol: 14, name_rol: 'Técnico / Operador (CNX-TRC-TEC)' }
    ]
  }
}

async function loadDynamicTemplates(areaId) {
  try {
    const { data: families } = await apiAxios.get(`/servicio/leanglobal/obtenerTipoTemplate?id_area=${areaId}`)
    const list = []
    if (Array.isArray(families)) {
      for (const fam of families) {
        if (!fam.id_tipo_srv) continue
        try {
          const { data: templatesRaw } = await apiAxios.get(`/servicio/leanglobal/obtenerTemplates?id_tipo_srv=${fam.id_tipo_srv}`)
          if (Array.isArray(templatesRaw)) {
            for (const t of templatesRaw) {
              list.push({
                id: t.id_template,
                nombre: t.name_template_srv,
                codigo: t.codi_template_srv,
                desc: t.desc_template_srv,
                body_seed: t.body_seed,
                id_tipo_srv: fam.id_tipo_srv,
                nombre_familia: fam.name_tipo_srv || fam.desc_tipo_srv || fam.descripcion || 'General'
              })
            }
          }
        } catch (e) {
          console.warn(`Error loading templates for family ${fam.id_tipo_srv}`, e)
        }
      }
    }
    return list
  } catch (err) {
    console.error(`Error loading templates for area ${areaId}:`, err)
    return []
  }
}

function groupTemplatesByFamily(templatesList) {
  const groups = {}
  for (const t of (templatesList || [])) {
    const famName = t.nombre_familia || 'General'
    if (!groups[famName]) {
      groups[famName] = []
    }
    groups[famName].push(t)
  }
  return Object.keys(groups).sort().map(name => ({
    name,
    templates: groups[name].sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''))
  }))
}

async function fetchTemplates() {
  try {
    // 1. Calidad (Area 1)
    const quality = await loadDynamicTemplates(1)
    qualityTemplates.value = quality.length ? quality : [
      { id: 56, nombre: 'Protocolo de Excavaciones', body_seed: '{"segmentos":[]}' },
      { id: 10, nombre: 'Protocolo de Calicatas', body_seed: '{"segmentos":[]}' },
      { id: 53, nombre: 'Protocolo Soldadura Cañerías', body_seed: '{"segmentos":[]}' },
      { id: 190, nombre: 'Protocolo Mantención de Cámaras', body_seed: '{"segmentos":[]}' }
    ]

    // 2. Seguridad (Area 2)
    let sst = await loadDynamicTemplates(2)
    // OBS 8: Filtrar ID 99 si se repite "Observación de Conducta" con el 75
    sst = sst.filter(t => t.id !== 99 && t.id_template !== 99)

    sstTemplates.value = sst.length ? sst : [
      { id: 82, nombre: 'Charla Operacional Diaria', body_seed: '{"segmentos":[]}' },
      { id: 89, nombre: 'AST (Análisis Trabajo Seguro)', body_seed: '{"segmentos":[]}' },
      { id: 146, nombre: 'Permiso de Trabajo Altura', body_seed: '{"segmentos":[]}' },
      { id: 147, nombre: 'Permiso de Trabajo Excavación', body_seed: '{"segmentos":[]}' },
      { id: 150, nombre: 'Permiso de Bloqueo', body_seed: '{"segmentos":[]}' },
      { id: 197, nombre: 'Inspección de Extintores', body_seed: '{"segmentos":[]}' },
      { id: 108, nombre: 'Inspección de Camión', body_seed: '{"segmentos":[]}' },
      { id: 101, nombre: 'Inspección de Herramientas Manuales', body_seed: '{"segmentos":[]}' }
    ]

    // 3. Medio Ambiente (Area 3)
    const env = await loadDynamicTemplates(3)
    environmentTemplates.value = env.length ? env : [
      { id: 68, nombre: 'Inspección Medio Ambiente', body_seed: '{"segmentos":[]}' },
      { id: 69, nombre: 'Inspección Bodega Respel', body_seed: '{"segmentos":[]}' },
      { id: 65, nombre: 'Inspección Bodega Suspel', body_seed: '{"segmentos":[]}' },
      { id: 70, nombre: 'Registro Carga Combustible', body_seed: '{"segmentos":[]}' }
    ]

    // 4. Avance (Area 4)
    const av = await loadDynamicTemplates(4)
    avanceTemplates.value = av.length ? av : [
      { id: 87, nombre: 'Parte Producción Diaria', body_seed: '{"segmentos":[]}' }
    ]
  } catch (err) {
    console.error('Error fetching templates:', err)
  }
}

/* --- Preview System Helpers --- */
function openSurveyPreview(tmpl) {
  selectedPreviewTemplate.value = tmpl
  let seed = tmpl.body_seed || { segmentos: [] }
  if (typeof seed === 'string') {
    try { seed = JSON.parse(seed) } catch { seed = { segmentos: [] } }
  }
  
  surveyDetailStore.surveyDetail = [{
    id_survey: 999999,
    id_template: tmpl.id || tmpl.id_template || 999999,
    name_template_srv: tmpl.nombre || tmpl.name_template_srv || '',
    desc_template_srv: tmpl.nombre || tmpl.name_template_srv || '',
    codi_template_srv: tmpl.codigo || tmpl.codi_template_srv || 'PREVIEW',
    body_exec: seed,
    name_area: '',
    name_tipo_srv: '',
    name_empresa_cliente: 'Cliente Test',
    nombre_proyecto: 'Proyecto Test',
    fecha_plan_ini: '2026-01-01',
    fecha_plan_fin: '2026-12-31'
  }]
  
  previewReady.value = false
  previewDialog.value = true
  
  nextTick(() => {
    previewReady.value = true
  })
}

function getPreviewSegmentos(tmpl) {
  let seed = tmpl.body_seed || { segmentos: [] }
  if (typeof seed === 'string') {
    try { seed = JSON.parse(seed) } catch { seed = { segmentos: [] } }
  }
  return seed.segmentos || []
}

function getWeeklyItems(attr) {
  if (attr.checkBoby && attr.checkBoby.length) {
    return attr.checkBoby.map(x => x.label || x.text)
  }
  return [
    'Estado general de la herramienta',
    'Conexión eléctrica / enchufes',
    'Protecciones de seguridad',
    'Cables y aislaciones'
  ]
}

function getTruckItems(attr) {
  if (attr.checkBoby && attr.checkBoby.length) {
    return attr.checkBoby.map(x => ({ label: x.label || x.text, kind: x.kind || 'item' }))
  }
  return [
    { label: 'DOCUMENTACIÓN DEL VEHÍCULO', kind: 'group' },
    { label: 'Licencia de conducir vigente', kind: 'item' },
    { label: 'Revisión técnica al día', kind: 'item' },
    { label: 'Permiso de circulación', kind: 'item' },
    { label: 'ESTADO MECÁNICO', kind: 'group' },
    { label: 'Nivel de aceite de motor', kind: 'item' },
    { label: 'Líquido de frenos y dirección', kind: 'item' },
    { label: 'Presión y estado de neumáticos', kind: 'item' },
    { label: 'Luces altas, bajas y viraje', kind: 'item' }
  ]
}

const supervisors = computed(() => {
  return usersList.value.filter(u => {
    try {
      const roles = u.roles || []
      return roles.some(r => r.name_rol === 'CNX-TRC-SUP' || r.name_rol === 'CNX-TRC-PLAN' || String(r.name_rol).includes('SUP'))
    } catch {
      return false
    }
  })
})

const operators = computed(() => {
  return usersList.value.filter(u => {
    try {
      const roles = u.roles || []
      return roles.some(r => r.name_rol === 'CNX-TRC-TEC' || r.name_rol === 'CNX-TRC-JCUAD' || String(r.name_rol).includes('TEC') || String(r.name_rol).includes('OPER'))
    } catch {
      return true
    }
  })
})

function renderGanttPreview() {
  if (!ganttTasks.value || !ganttTasks.value.length) return

  nextTick(() => {
    if (!ganttChartContainer.value) return

    const seriesData = []
    const categories = []

    ganttTasks.value.forEach((task, idx) => {
      const dates = (task.jsonData || []).map(d => new Date(d.fecha).getTime()).sort()
      if (dates.length) {
        const start = dates[0]
        const end = dates[dates.length - 1] + 24 * 3600 * 1000

        seriesData.push({
          start,
          end,
          y: idx,
          name: task.nombre,
          color: '#2196F3'
        })
      }
      categories.push(`${task.edt} ${task.nombre}`)
    })

    if (!seriesData.length) return

    const allStarts = seriesData.map(s => s.start)
    const allEnds = seriesData.map(s => s.end)
    const minDate = Math.min(...allStarts)
    const maxDate = Math.max(...allEnds)

    if (ganttChartInstance.value) {
      try {
        ganttChartInstance.value.destroy()
      } catch (e) {
        console.warn('Error destroying chart:', e)
      }
    }

    ganttChartInstance.value = Highcharts.ganttChart(ganttChartContainer.value, {
      chart: {
        height: Math.max(250, seriesData.length * 35 + 80),
        backgroundColor: '#FFFFFF',
        style: { fontFamily: 'Roboto, sans-serif' }
      },
      title: {
        text: 'Vista Previa de la Planificación Gantt',
        style: { fontSize: '14px', fontWeight: 'bold', color: '#1565C0' }
      },
      xAxis: [
        {
          min: minDate,
          max: maxDate,
          labels: {
            style: { fontSize: '9px' },
            format: '{value:%d}'
          },
          grid: { cellHeight: 20 },
          tickInterval: 24 * 3600 * 1000
        },
        {
          min: minDate,
          max: maxDate,
          labels: {
            format: '{value:%b %Y}'
          },
          grid: { cellHeight: 20 }
        }
      ],
      yAxis: {
        categories: categories,
        uniqueNames: true,
        labels: {
          style: { fontSize: '11px', color: '#37474F', fontWeight: 'bold' }
        }
      },
      plotOptions: {
        series: {
          pointHeight: 12,
          borderRadius: 4,
          dataLabels: {
            enabled: true,
            format: '{point.name}',
            style: { fontSize: '9px', fontWeight: 'normal', textOutline: 'none' }
          }
        }
      },
      series: [{
        name: 'Planificado',
        data: seriesData
      }]
    })
  })
}

function selectAll(area) {
  if (area === 'calidad') {
    hseqSelection.value.calidad = qualityTemplates.value.map(t => t.id)
  } else if (area === 'medioAmbiente') {
    hseqSelection.value.medioAmbiente = environmentTemplates.value.map(t => t.id)
  } else if (area === 'seguridad') {
    hseqSelection.value.seguridad = sstTemplates.value.map(t => t.id)
  }
}

watch([step, ganttTasks], ([newStep]) => {
  if (newStep === 4 && ganttTasks.value.length) {
    renderGanttPreview()
  }
}, { deep: true })

onMounted(async () => {
  await fetchCompanies()
  await fetchProjectTypes()
  await fetchProjectStates()
  await fetchUsers()
  await fetchRoles()
  await fetchTemplates()
  await fetchProjects()
})
</script>

<style scoped>
.sombra-resaltada {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
  border-radius: 12px;
}
.border-l-primary {
  border-left: 6px solid #1867c0 !important;
}
.step-item {
  opacity: 0.65;
  transition: all 0.3s ease;
}
.step-active {
  opacity: 1;
  transform: scale(1.05);
}
.step-completed {
  opacity: 0.85;
}
.max-height-320 {
  max-height: 320px;
  overflow-y: auto;
}
.relative {
  position: relative;
}

/* Visualizer / Preview Frames */
.mobile-device-frame {
  width: 384px;
  height: 650px;
  border: 12px solid #2d3748 !important;
  border-radius: 36px;
  position: relative;
  background-color: #000;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
}
.mobile-notch {
  width: 140px;
  height: 18px;
  background-color: #2d3748;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  z-index: 10;
}
.mobile-screen-content {
  height: 100%;
  width: 100%;
  background-color: #f7fafc;
  padding-top: 8px !important;
}
.print-paper-sheet {
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  min-height: 800px;
}
.print-preview-table {
  border-collapse: collapse;
  width: 100%;
  margin-top: 5px;
  margin-bottom: 10px;
}
.print-preview-table th, .print-preview-table td {
  border: 1px solid #cbd5e1 !important;
  padding: 6px 8px;
  color: #334155;
}
.print-preview-table th {
  background-color: #f8fafc;
  color: #1e293b;
  font-weight: bold;
}
.min-height-24 {
  min-height: 24px;
}
</style>
