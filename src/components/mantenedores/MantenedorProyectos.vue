<template>
  <v-card
    class="mx-auto"
    elevation="1"
  >
    <!-- Barra de título simple -->
    <v-toolbar
      color="white"
      density="comfortable"
      class="border-b px-2"
    >
      <v-toolbar-title class="text-h6 font-weight-bold text-primary">
        Gestión de Proyectos
      </v-toolbar-title>
    </v-toolbar>

    <v-card-text
      class="bg-grey-lighten-5 pa-4"
      style="min-height: 500px;"
    >
      <v-window v-model="activeTab">
        <!-- ===================== -->
        <!-- 1) PROYECTOS -->
        <!-- ===================== -->
        <v-window-item value="projects">
          <div class="d-flex justify-space-between align-center mb-4">
            <p class="text-body-2 text-grey-darken-1 mb-0">
              Cartera de proyectos activos.
            </p>
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="openProjectDialog"
            >
              Nuevo Proyecto
            </v-btn>
          </div>

          <v-row>
            <v-col
              v-for="prj in projects"
              :key="prj.id_proyecto"
              cols="12"
            >
              <v-card
                variant="outlined"
                class="bg-white"
              >
                <div class="d-flex flex-wrap pa-4 align-center">
                  <div class="flex-grow-1">
                    <div class="d-flex align-center gap-2 mb-2">
                      <v-chip
                        color="blue-grey"
                        label
                        size="small"
                        class="mr-2 font-weight-bold"
                      >
                        {{ prj.codi_proyecto }}
                      </v-chip>

                      <span class="text-h6 font-weight-bold">{{ prj.nombre_proyecto }}</span>

                      <v-chip
                        :color="getStatusColor(prj.id_proyecto_estado)"
                        size="small"
                        class="ml-2"
                        variant="tonal"
                      >
                        {{ getStatusName(prj.id_proyecto_estado) }}
                      </v-chip>
                    </div>

                    <div class="d-flex flex-wrap text-caption text-grey-darken-1 gap-4">
                      <span
                        v-if="false"
                        class="d-flex align-center mr-4"
                      >
                        <v-icon
                          icon="mdi-account"
                          size="small"
                          class="mr-1"
                        />
                        Jefe: {{ getUserName(prj.id_usuario_jefe_proyecto) }}
                      </span>
                      <span
                        v-if="false"
                        class="d-flex align-center mr-4"
                      >
                        <v-icon
                          icon="mdi-calendar"
                          size="small"
                          class="mr-1"
                        />
                        Fin Plan: {{ prj.fecha_plan_fin || 'Sin fecha' }}
                      </span>
                      <span class="d-flex align-center">
                        <v-icon
                          icon="mdi-domain"
                          size="small"
                          class="mr-1"
                        />
                        Cliente: {{ getCompanyName(prj.id_empresa_cliente) }}
                      </span>
                    </div>
                  </div>

                  <div class="d-flex align-center mt-2 mt-sm-0">
                    <v-btn
                      variant="tonal"
                      color="primary"
                      class="mr-2"
                      size="small"
                      @click="emit('go-equipos', prj)"
                    >
                      Equipos
                      <v-icon
                        end
                        icon="mdi-arrow-right"
                      />
                    </v-btn>
                    <v-btn
                      icon="mdi-pencil"
                      variant="text"
                      size="small"
                      color="grey"
                      @click="openEditProjectDialog(prj)"
                    />

                    <v-btn
                      v-if="puedeEliminarProyecto(prj)"
                      icon="mdi-trash-can-outline"
                      variant="text"
                      size="small"
                      color="red"
                      @click="confirmarEliminarProyecto(prj)"
                    />
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-window-item>

        <!-- ===================== -->
        <!-- 2) EQUIPOS -->
        <!-- ===================== -->
        <v-window-item value="teams">
          <v-sheet class="mb-4 bg-transparent">
            <v-btn
              variant="text"
              size="small"
              prepend-icon="mdi-arrow-left"
              class="mb-2 pl-0"
              @click="goBackToProjects"
            >
              Volver a Proyectos
            </v-btn>

            <div class="d-flex align-center justify-space-between bg-white border rounded pa-3">
              <div>
                <div class="text-caption text-grey">
                  Proyecto Activo
                </div>
                <div class="text-h6 font-weight-bold primary--text">
                  {{ selectedProject?.nombre_proyecto }}
                </div>
              </div>
              <v-chip
                :color="getStatusColor(selectedProject?.id_proyecto_estado)"
                size="small"
              >
                {{ getStatusName(selectedProject?.id_proyecto_estado) }}
              </v-chip>
            </div>
          </v-sheet>

          <div v-if="selectedProject">
            <div class="d-flex justify-space-between align-center mb-4">
              <h3 class="text-subtitle-1 font-weight-bold">
                Equipos del Proyecto
              </h3>
              <v-btn
                color="success"
                size="small"
                prepend-icon="mdi-plus"
                @click="openTeamDialog"
              >
                Crear Equipo
              </v-btn>
            </div>

            <v-row v-if="filteredTeams.length > 0">
              <v-col
                v-for="team in filteredTeams"
                :key="team.id"
                cols="12"
                md="6"
                lg="4"
              >
                <v-card
                  hover
                  class="h-100 d-flex flex-column border"
                  @click="selectTeamAndGoToMembers(team)"
                >
                  <v-card-title class="d-flex justify-space-between align-start text-subtitle-2 font-weight-bold pt-4">
                    {{ team.name }}
                    <v-icon
                      v-if="team.status === 'Activo'"
                      color="success"
                      size="small"
                      icon="mdi-circle-slice-8"
                    />
                    <v-icon
                      v-else
                      color="error"
                      size="small"
                      icon="mdi-circle-outline"
                    />
                  </v-card-title>

                  <v-card-text class="flex-grow-1 text-body-2 text-grey-darken-1">
                    {{ team.description || 'Sin descripción' }}
                    <div class="mt-2 text-caption font-weight-bold text-primary">
                      Líder: {{ getUserName(team.leaderId) }}
                    </div>
                  </v-card-text>

                  <v-divider />

                  <v-card-actions
                    class="bg-grey-lighten-5 py-1 px-2"
                    style="min-height: 40px;"
                  >
                    <span class="text-caption text-grey">{{ getMemberCount(team.id) }} Miembros</span>
                    <v-spacer />
                    <v-icon
                      size="small"
                      color="grey"
                    >
                      mdi-chevron-right
                    </v-icon>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>

            <v-alert
              v-else
              type="info"
              variant="tonal"
              density="compact"
              class="mt-4"
            >
              No hay equipos creados en este proyecto.
            </v-alert>
          </div>
        </v-window-item>

        <!-- ===================== -->
        <!-- 3) MIEMBROS -->
        <!-- ===================== -->
        <v-window-item value="members">
          <v-breadcrumbs
            :items="breadcrumbItems"
            density="compact"
            class="pa-0 mb-4 text-caption"
          >
            <template #divider>
              <v-icon icon="mdi-chevron-right" />
            </template>

            <template #item="{ item, index }">
              <v-breadcrumbs-item
                :disabled="item.disabled"
                class="cursor-pointer"
                @click="!item.disabled && navigateBreadcrumb(index)"
              >
                {{ item.title }}
              </v-breadcrumbs-item>
            </template>
          </v-breadcrumbs>

          <v-card
            v-if="selectedTeam"
            variant="outlined"
            class="bg-white"
          >
            <v-toolbar
              color="transparent"
              density="compact"
            >
              <v-toolbar-title class="text-subtitle-2 font-weight-bold">
                Miembros: {{ selectedTeam.name }}
              </v-toolbar-title>
              <v-spacer />
              <v-btn
                color="primary"
                variant="text"
                size="small"
                prepend-icon="mdi-plus"
                @click="openMemberDialog"
              >
                Asignar
              </v-btn>
            </v-toolbar>

            <v-divider />

            <v-data-table
              :headers="memberHeaders"
              :items="filteredMembers"
              density="compact"
              class="text-caption"
            >
              <template #item.userId="{ item }">
                <div class="d-flex align-center py-1">
                  <v-avatar
                    color="primary"
                    size="24"
                    class="mr-2 text-caption"
                  >
                    {{ getUserInitials(item.userId) }}
                  </v-avatar>
                  <span class="font-weight-medium">{{ getUserName(item.userId) }}</span>
                </div>
              </template>

              <template #item.roleId="{ item }">
                <v-chip
                  size="x-small"
                  label
                  class="font-weight-bold"
                >
                  {{ getRoleName(item.roleId) }}
                </v-chip>
              </template>

              <template #item.actions="{ item }">
                <v-btn
                  icon="mdi-delete"
                  variant="text"
                  color="grey"
                  size="x-small"
                  @click.stop="removeMember(item)"
                />
              </template>
            </v-data-table>
          </v-card>
        </v-window-item>
      </v-window>
    </v-card-text>

    <!-- ================= DIALOGS ================= -->

    <!-- 1) Proyecto -->
    <v-dialog
      v-model="projectDialog"
      max-width="900px"
      scrollable
      persistent
    >
      <v-card>
        <v-toolbar
          :title="editMode ? 'Editar Proyecto' : 'Nuevo Proyecto'"
          color="primary"
          density="compact"
        >
          <template #append>
            <v-btn
              icon="mdi-close"
              variant="text"
              @click="projectDialog = false"
            />
          </template>
        </v-toolbar>

        <v-card-text
          class="pa-0"
          style="max-height: 70vh;"
        >
          <v-form ref="projectForm">
            <v-container
              fluid
              class="pa-4"
            >
              <!-- Identificación -->
              <div class="d-flex align-center mb-2">
                <v-icon
                  color="primary"
                  icon="mdi-card-account-details-outline"
                  class="mr-2"
                />
                <span class="text-subtitle-1 font-weight-bold">Identificación y Cliente</span>
              </div>
              <v-divider class="mb-4" />

              <v-row dense>
                <v-col cols="12">
                  <v-text-field
                    v-model="newProject.nombre_proyecto"
                    label="Nombre del Proyecto *"
                    variant="outlined"
                    density="compact"
                    hint="Nombre oficial del contrato"
                    persistent-hint
                  />
                </v-col>

                <v-col
                  cols="12"
                  md="6"
                >
                  <v-text-field
                    v-model="newProject.codi_proyecto"
                    label="Código Interno *"
                    variant="outlined"
                    density="compact"
                    placeholder="PRJ-XXX"
                  />
                </v-col>

                <v-col
                  cols="12"
                  md="6"
                >
                  <v-text-field
                    v-model="newProject.centro_costo"
                    label="Centro de Costo"
                    variant="outlined"
                    density="compact"
                    placeholder="CC-XXX"
                  />
                </v-col>

                <v-col
                  cols="12"
                  md="6"
                >
                  <v-select
                    v-model="newProject.id_empresa_cliente"
                    :items="filteredCompanies"
                    item-title="name_empresa"
                    item-value="id_empresa"
                    label="Empresa Cliente *"
                    variant="outlined"
                    density="compact"
                    :disabled="editMode"
                    :hint="editMode ? 'No se puede cambiar al editar' : ''"
                    persistent-hint
                  />
                </v-col>

                <v-col
                  cols="12"
                  md="6"
                >
                  <v-select
                    v-model="newProject.id_proyecto_padre"
                    :items="projectsList"
                    item-title="nombre_proyecto"
                    item-value="id_proyecto"
                    label="Proyecto Padre (Opcional)"
                    variant="outlined"
                    density="compact"
                    clearable
                  />
                </v-col>
              </v-row>

              <!-- Clasificación -->
              <div class="d-flex align-center mt-6 mb-2">
                <v-icon
                  color="primary"
                  icon="mdi-shape-outline"
                  class="mr-2"
                />
                <span class="text-subtitle-1 font-weight-bold">Clasificación y Responsables</span>
              </div>
              <v-divider class="mb-4" />

              <v-row dense>
                <v-col
                  cols="12"
                  md="6"
                >
                  <v-select
                    v-model="newProject.id_proyecto_tipo"
                    :items="projectTypes"
                    item-title="nombre_tipo"
                    item-value="id_proyecto_tipo"
                    label="Tipo de Proyecto *"
                    variant="outlined"
                    density="compact"
                  />
                </v-col>

                <v-col
                  cols="12"
                  md="6"
                >
                  <v-select
                    v-model="newProject.id_proyecto_estado"
                    :items="projectStates"
                    item-title="nombre_estado"
                    item-value="id_proyecto_estado"
                    label="Estado Inicial *"
                    variant="outlined"
                    density="compact"
                  />
                </v-col>

                <v-col
                  v-if="false"
                  cols="12"
                  md="6"
                >
                  <v-autocomplete
                    v-model="newProject.id_usuario_jefe_proyecto"
                    :items="users"
                    item-title="nombre_user"
                    item-value="id_user"
                    label="Jefe de Proyecto (Interno) *"
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-account-hard-hat"
                    clearable
                    auto-select-first
                    :menu-props="{ maxHeight: 320 }"
                  />
                </v-col>

                <v-col
                  cols="12"
                  md="6"
                >
                  <v-autocomplete
                    v-model="newProject.json_field.id_user_administrador"
                    :items="administratorsList"
                    item-title="fullName"
                    item-value="id_user"
                    label="Administrador de Contrato *"
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-account-tie"
                    clearable
                    auto-select-first
                  />
                </v-col>

                <v-col
                  cols="12"
                  md="6"
                >
                  <v-autocomplete
                    v-model="newProject.json_field.id_user_prevencionista"
                    :items="prevencionistasList"
                    item-title="fullName"
                    item-value="id_user"
                    label="Prevencionista Líder *"
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-account-star"
                    clearable
                    auto-select-first
                  />
                </v-col>

                <!--v-col cols="12" md="6">
                  <v-select
                    v-model="newProject.id_usuario_cliente"
                    :items="users"
                    item-title="name"
                    item-value="id"
                    label="Contraparte Cliente"
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-account-tie"
                  />
                </v-col-->
              </v-row>

              <!-- Planificación -->
              <template v-if="false">
                <div class="d-flex align-center mt-6 mb-2">
                  <v-icon
                    color="primary"
                    icon="mdi-calendar-clock"
                    class="mr-2"
                  />
                  <span class="text-subtitle-1 font-weight-bold">Planificación</span>
                </div>
                <v-divider class="mb-4" />

                <v-row dense>
                  <v-col
                    cols="12"
                    md="6"
                  >
                    <v-text-field
                      v-model="newProject.fecha_plan_ini"
                      label="Fecha Inicio Planificada *"
                      type="date"
                      variant="outlined"
                      density="compact"
                    />
                  </v-col>

                  <v-col
                    cols="12"
                    md="6"
                  >
                    <v-text-field
                      v-model="newProject.fecha_plan_fin"
                      label="Fecha Fin Planificada *"
                      type="date"
                      variant="outlined"
                      density="compact"
                    />
                  </v-col>

                  <v-col
                    cols="12"
                    md="4"
                  >
                    <v-text-field
                      v-model="newProject.duracion_plan"
                      label="Duración (Días)"
                      type="number"
                      variant="outlined"
                      density="compact"
                      suffix="días"
                    />
                  </v-col>

                  <v-col
                    cols="12"
                    md="4"
                  >
                    <v-text-field
                      v-model="newProject.avance_plan_proyecto"
                      label="Avance Inicial"
                      type="number"
                      variant="outlined"
                      density="compact"
                      suffix="%"
                    />
                  </v-col>
                </v-row>
              </template>

              <!-- Detalles -->
              <div class="d-flex align-center mt-6 mb-2">
                <v-icon
                  color="primary"
                  icon="mdi-text-box-outline"
                  class="mr-2"
                />
                <span class="text-subtitle-1 font-weight-bold">Detalles Adicionales</span>
              </div>
              <v-divider class="mb-4" />

              <v-row dense>
                <v-col cols="12">
                  <v-textarea
                    v-model="newProject.objetivo_proyecto"
                    label="Objetivo del Proyecto"
                    variant="outlined"
                    density="comfortable"
                    rows="3"
                    hint="Describa el propósito principal"
                    persistent-hint
                  />
                </v-col>

                <v-col cols="12">
                  <v-textarea
                    v-model="newProject.observacion_proyecto"
                    label="Observaciones Adicionales"
                    variant="outlined"
                    density="comfortable"
                    rows="2"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>

        <v-divider />
        <v-card-actions class="bg-grey-lighten-5">
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="projectDialog = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            prepend-icon="mdi-content-save"
            @click="saveProject"
          >
            Guardar Proyecto
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 2) Equipo -->
    <v-dialog
      v-model="teamDialog"
      max-width="400px"
    >
      <v-card>
        <v-toolbar
          title="Nuevo Equipo"
          color="primary"
          density="compact"
        />
        <v-card-text>
          <v-text-field
            v-model="newTeam.name"
            label="Nombre"
            variant="outlined"
            density="compact"
            class="mb-2"
          />
          <v-textarea
            v-model="newTeam.description"
            label="Descripción"
            variant="outlined"
            density="compact"
            rows="2"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey"
            variant="text"
            @click="teamDialog = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="saveTeam"
          >
            Crear
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 3) Miembro -->
    <v-dialog
      v-model="memberDialog"
      max-width="400px"
    >
      <v-card>
        <v-toolbar
          title="Asignar Miembro"
          color="primary"
          density="compact"
        />
        <v-card-text>
          <v-alert
            type="info"
            variant="tonal"
            density="compact"
            class="mb-3 text-caption"
          >
            Asignando permisos para: <strong>{{ selectedTeam?.name }}</strong>
          </v-alert>

          <v-select
            v-model="newMember.userId"
            :items="users"
            item-title="name"
            item-value="id"
            label="Usuario"
            variant="outlined"
            density="compact"
            class="mb-2"
          />

          <v-select
            v-model="newMember.roleId"
            :items="roles"
            item-title="name"
            item-value="id"
            label="Rol"
            variant="outlined"
            density="compact"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey"
            variant="text"
            @click="memberDialog = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="saveMember"
          >
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import apiAxios from '@/services/api';

const emit = defineEmits(['refresh', 'go-equipos'])

/* =========================
   MOCK DATA (puedes borrar y traer desde API)
========================= */
const MOCK_USERS = [
  { id: 101, name: 'Juan Pérez', email: 'juan@empresa.com' },
  { id: 102, name: 'María González', email: 'maria@empresa.com' },
  { id: 103, name: 'Carlos Ruiz', email: 'carlos@empresa.com' },
  { id: 104, name: 'Ana López', email: 'ana@empresa.com' },
]

const MOCK_ROLES = [
  { id: 1, name: 'Jefe de Proyecto' },
  { id: 2, name: 'Supervisor' },
  { id: 3, name: 'Visualizador' },
]

const MOCK_PROJECT_TYPES = [
  { id: 1, name: 'Construcción' },
  { id: 2, name: 'Mantenimiento' },
]

const MOCK_PROJECT_STATES = [
  { id: 1, name: 'Borrador' },
  { id: 2, name: 'Planificación' },
  { id: 3, name: 'En Ejecución' },
  { id: 4, name: 'Terminado' },
]

const MOCK_COMPANIES = [
  { id: 1, name: 'Minera Escondida' },
  { id: 2, name: 'MOP' },
]

const MOCK_TEAMS = [
  { id: 1, projectId: 1, name: 'Cuadrilla Norte', leaderId: 102, status: 'Activo', description: 'Obras civiles' },
  { id: 2, projectId: 1, name: 'Topografía', leaderId: 103, status: 'Activo', description: 'Levantamiento' },
]

const MOCK_MEMBERS = [{ id: 1, teamId: 1, userId: 103, roleId: 2, joinDate: '2024-02-01' }]

/* =========================
   STATE
========================= */
const activeTab = ref('projects')

const projectDialog = ref(false)
const teamDialog = ref(false)
const memberDialog = ref(false)

const users = ref([])
const roles = ref([...MOCK_ROLES])
const projects = ref([])
const projectsList = ref([])
const teams = ref([...MOCK_TEAMS])
const members = ref([...MOCK_MEMBERS])

const projectTypes = ref([])
const projectStates = ref([])
const companies = ref([])

const selectedProject = ref(null)
const selectedTeam = ref(null)

const projectForm = ref(null)

const newProject = ref({})
const newTeam = ref({})
const newMember = ref({})

const ESTADO_CREADO_ID = 1 // 👈 CAMBIA este ID si tu "CREADO" es otro

const editMode = ref(false)
const editProjectId = ref(null)
const silenciarWatchEmpresa = ref(false)

/* =========================
  GETERS
========================= */

const obtenerEstadosProyecto = async () => {
  try {
    const response = await apiAxios.get('/servicio/leanglobal/obtenerEstadoProyecto');
    projectStates.value = response.data;
    console.log('Project states fetched:', projectStates.value);
  } catch (error) {
    console.error('Error fetching project states:', error);
  }
};

const obtenerUsuarios = async () => {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerUsuarios')

    users.value = (Array.isArray(data) ? data : [])
      // ✅ filtra null / undefined / "" / "   "
      .filter(u => (u?.nombre_user ?? '').trim().length > 0)
      // ✅ orden alfabético (A→Z) respetando acentos
      .sort((a, b) =>
        (a.nombre_user ?? '').localeCompare((b.nombre_user ?? ''), 'es', { sensitivity: 'base' })
      )

    console.log('Users fetched:', users.value)
  } catch (error) {
    console.error('Error fetching users:', error)
  }
}

const obtenerTipoProyecto = async () => {
  const customTypes = [
    { id_proyecto_tipo: 1, nombre_tipo: 'Construcción y Montaje de Líneas' },
    { id_proyecto_tipo: 2, nombre_tipo: 'Mantenimiento Mayor' },
    { id_proyecto_tipo: 3, nombre_tipo: 'Mantenimiento Menor' },
    { id_proyecto_tipo: 4, nombre_tipo: 'Obras Civiles' },
    { id_proyecto_tipo: 5, nombre_tipo: 'Inspección' },
    { id_proyecto_tipo: 6, nombre_tipo: 'Construcción Redes de Gas' },
    { id_proyecto_tipo: 7, nombre_tipo: 'Conversión y Conexión de Artefactos' },
  ]
  try {
    const response = await apiAxios.get('/servicio/leanglobal/obtenerTipoProyecto');
    if (Array.isArray(response.data) && response.data.length > 1) {
      projectTypes.value = response.data;
    } else {
      projectTypes.value = customTypes;
    }
  } catch (error) {
    projectTypes.value = customTypes;
    console.error('Error fetching tipos de proyecto:', error);
  }
};

const obtenerClientes = async () => {
  try {
    const response = await apiAxios.get('/servicio/leanglobal/obtenerEmpresas');
    companies.value = response.data;
    console.log('Companies fetched:', companies.value);
  } catch (error) {
    console.error('Error fetching companies:', error);
  }
};

const getProyectos = async () => {
  try {
    const response = await apiAxios.get('/servicio/leanglobal/obtenerProyectos')
    projects.value = response.data || []

    // 👇 NO tocar projectsList acá
    console.log('Projects fetched:', projects.value)
  } catch (error) {
    console.error('Error fetching projects:', error)
  }
}

const filtrarProjectsPorEmpresa = (idEmpresa) => {
  if (!idEmpresa) {
    projectsList.value = []   // 👈 en blanco si no hay empresa
    return
  }

  const id = Number(idEmpresa)
  projectsList.value = projects.value.filter(
    p => Number(p.id_empresa_cliente) === id
  )
}

watch(
  () => newProject.value.id_empresa_cliente,
  (idEmpresa) => {
    if (silenciarWatchEmpresa.value) return
    newProject.value.id_proyecto_padre = null
    filtrarProjectsPorEmpresa(idEmpresa)
  }
)

/* =========================
   COMPUTED
========================= */
const filteredTeams = computed(() =>
  selectedProject.value ? teams.value.filter((t) => t.projectId === selectedProject.value.id) : []
)

const filteredMembers = computed(() =>
  selectedTeam.value ? members.value.filter((m) => m.teamId === selectedTeam.value.id) : []
)

const filteredCompanies = computed(() => {
  const permitidas = ['sonacol', 'enap', 'metrogas', 'gasandes']
  return (companies.value || []).filter(c => {
    const name = (c.name_empresa || '').toLowerCase().trim()
    // Retornamos true si el nombre de la empresa incluye alguno de los nombres permitidos
    return permitidas.some(p => name.includes(p))
  })
})

const breadcrumbItems = computed(() => {
  const items = [{ title: 'Proyectos', disabled: false }]
  if (selectedProject.value) items.push({ title: selectedProject.value.nombre_proyecto, disabled: false })
  if (selectedTeam.value) items.push({ title: selectedTeam.value.name, disabled: true })

  // si no hay team, el proyecto debe estar disabled
  if (items.length === 2 && !selectedTeam.value) items[1].disabled = true
  return items
})

const administratorsList = computed(() => {
  return users.value.filter(u => {
    try {
      const data = typeof u.json_data === 'string' ? JSON.parse(u.json_data) : u.json_data
      return String(data?.cargo).trim() === "Administrador de Contrato de terreno"
    } catch (e) { return false }
  }).map(u => ({
    fullName: `${u.name_frst || ''} ${u.apellido_pat || ''} ${u.apellido_mat || ''}`.trim() || u.nombre_user,
    id_user: u.id_user
  }))
})

const prevencionistasList = computed(() => {
  return users.value.filter(u => {
    try {
      const data = typeof u.json_data === 'string' ? JSON.parse(u.json_data) : u.json_data
      return String(data?.cargo).trim() === "Lider en Prevencion de Riesgos"
    } catch (e) { return false }
  }).map(u => ({
    fullName: `${u.name_frst || ''} ${u.apellido_pat || ''} ${u.apellido_mat || ''}`.trim() || u.nombre_user,
    id_user: u.id_user
  }))
})

const memberHeaders = [
  { title: 'Usuario', key: 'userId', align: 'start' },
  { title: 'Rol', key: 'roleId', align: 'start' },
  { title: '', key: 'actions', align: 'end' },
]

/* =========================
   HELPERS
========================= */
function getStatusName(id) {
  return projectStates.value.find(s => Number(s.id_proyecto_estado) === Number(id))?.nombre_estado || '-'
}

function getStatusColor(id) {
  if (id === 3) return 'success'
  if (id === 2) return 'warning'
  return 'grey'
}

function getUserName(id) {
  return users.value.find(u => Number(u.id_user) === Number(id))?.nombre_user || '-'
}

function getUserInitials(id) {
  const name = getUserName(id)
  return name?.trim()?.charAt(0) || '?'
}

function getCompanyName(id) {
  return companies.value.find(c => Number(c.id_empresa) === Number(id))?.name_empresa || '-'
}

function getRoleName(id) {
  return roles.value.find((r) => r.id === id)?.name || '-'
}

function getMemberCount(teamId) {
  return members.value.filter((m) => m.teamId === teamId).length
}

/* =========================
   ACTIONS
========================= */
function openProjectDialog() {
  editMode.value = false
  editProjectId.value = null

  newProject.value = {
    nombre_proyecto: '',
    codi_proyecto: '',
    centro_costo: '',
    id_proyecto_padre: null,
    id_empresa_cliente: null,
    id_usuario_cliente: null,
    id_usuario_jefe_proyecto: null,
    id_proyecto_tipo: null,
    id_proyecto_estado: ESTADO_CREADO_ID, // opcional: por defecto “CREADO”
    fecha_plan_ini: '',
    fecha_plan_fin: '',
    duracion_plan: 0,
    avance_plan_proyecto: 0,
    objetivo_proyecto: '',
    observacion_proyecto: '',
    json_field: {
      id_user_administrador: null,
      id_user_prevencionista: null
    }
  }

  projectsList.value = [] // parte en blanco hasta elegir empresa
  projectDialog.value = true
}

async function openEditProjectDialog(prj) {
  editMode.value = true
  editProjectId.value = prj?.id_proyecto

  silenciarWatchEmpresa.value = true

  // 1) setea TODO menos el padre (por ahora)
  newProject.value = {
    nombre_proyecto: prj?.nombre_proyecto ?? '',
    codi_proyecto: prj?.codi_proyecto ?? '',
    centro_costo: prj?.centro_costo ?? '',
    id_empresa_cliente: prj?.id_empresa_cliente ?? null,
    id_proyecto_padre: null, // 👈 lo seteamos después
    id_usuario_cliente: prj?.id_usuario_cliente ?? null,
    id_usuario_jefe_proyecto: prj?.id_usuario_jefe_proyecto ?? null,
    id_proyecto_tipo: prj?.id_proyecto_tipo ?? null,
    id_proyecto_estado: prj?.id_proyecto_estado ?? null,
    fecha_plan_ini: (prj?.fecha_plan_ini ?? '').slice(0, 10),
    fecha_plan_fin: (prj?.fecha_plan_fin ?? '').slice(0, 10),
    duracion_plan: prj?.duracion_plan ?? 0,
    avance_plan_proyecto: prj?.avance_plan_proyecto ?? 0,
    objetivo_proyecto: prj?.objetivo_proyecto ?? '',
    observacion_proyecto: prj?.observacion_proyecto ?? '',
    json_field: (() => {
      try {
        const raw = prj?.json_field || {}
        const data = typeof raw === 'string' ? JSON.parse(raw) : raw
        return {
          id_user_administrador: data.id_user_administrador || null,
          id_user_prevencionista: data.id_user_prevencionista || null
        }
      } catch (e) {
        return { id_user_administrador: null, id_user_prevencionista: null }
      }
    })()
  }

  // 2) carga lista filtrada por empresa
  filtrarProjectsPorEmpresa(newProject.value.id_empresa_cliente)

  // 3) saca el mismo proyecto (no puede ser su propio padre)
  projectsList.value = projectsList.value.filter(p => p.id_proyecto !== editProjectId.value)

  // 4) espera a que el v-select tenga items ya renderizados
  await nextTick()

  // 5) ahora sí setea el padre (forzando número)
  newProject.value.id_proyecto_padre = prj?.id_proyecto_padre != null
    ? Number(prj.id_proyecto_padre)
    : null

  silenciarWatchEmpresa.value = false

  projectDialog.value = true
}

async function saveProject() {
  try {
    if (!newProject.value.nombre_proyecto || !newProject.value.codi_proyecto) {
      console.log('Faltan campos obligatorios')
      return
    }

    const payload = { ...newProject.value }

    if (!editMode.value) {
      // ✅ CREAR
      const { data } = await apiAxios.post('/proyectos', payload)
      const created = data?.proyecto

      if (created) {
        projects.value.unshift(created)
      } else {
        await getProyectos()
      }
    } else {
      // ✅ EDITAR
      const id = editProjectId.value
      if (!id) return

      const { data } = await apiAxios.put(`/proyectos/${id}`, payload)
      const updated = data?.proyecto ?? payload

      // refresca lista local
      const idx = projects.value.findIndex(p => getProjectId(p) === id)
      if (idx >= 0) {
        projects.value[idx] = { ...projects.value[idx], ...updated, id_proyecto: id }
      } else {
        await getProyectos()
      }
    }

    projectDialog.value = false
    editMode.value = false
    editProjectId.value = null
  } catch (err) {
    console.error('Error guardando proyecto:', err)
    const msg = err?.response?.data?.error || err?.message || 'Error al guardar proyecto'
    alert(msg)
  }
}

function selectProjectAndGoToTeams(prj) {
  selectedProject.value = prj
  selectedTeam.value = null
  activeTab.value = 'teams'
}

function goBackToProjects() {
  activeTab.value = 'projects'
  selectedProject.value = null
  selectedTeam.value = null
}

function openTeamDialog() {
  newTeam.value = { name: '', leaderId: null, description: '' }
  teamDialog.value = true
}

function saveTeam() {
  if (!selectedProject.value) return
  teams.value.push({
    ...newTeam.value,
    id: Date.now(),
    projectId: selectedProject.value.id,
    status: 'Activo',
  })
  teamDialog.value = false
}

function selectTeamAndGoToMembers(team) {
  selectedTeam.value = team
  activeTab.value = 'members'
}

function openMemberDialog() {
  newMember.value = { userId: null, roleId: null }
  memberDialog.value = true
}

function saveMember() {
  if (!selectedTeam.value) return
  members.value.push({ ...newMember.value, id: Date.now(), teamId: selectedTeam.value.id })
  memberDialog.value = false
}

function removeMember(item) {
  members.value = members.value.filter((m) => m.id !== item.id)
}

function getProjectId(prj) {
  return prj?.id_proyecto ?? prj?.id
}

function puedeEliminarProyecto(prj) {
  return Number(prj?.id_proyecto_estado) === ESTADO_CREADO_ID && !!getProjectId(prj)
}

async function confirmarEliminarProyecto(prj) {
  if (!puedeEliminarProyecto(prj)) return

  const ok = confirm(`¿Eliminar el proyecto "${prj?.nombre_proyecto}"? Esta acción no se puede deshacer.`)
  if (!ok) return

  await eliminarProyecto(prj)
}

async function eliminarProyecto(prj) {
  const id = getProjectId(prj)
  if (!id) return

  try {
    // ✅ Ajusta si tu backend usa otra ruta:
    await apiAxios.delete(`/proyectos/${id}`)

    // ✅ actualiza UI sin recargar
    projects.value = projects.value.filter(p => getProjectId(p) !== id)
    projectsList.value = projectsList.value.filter(p => getProjectId(p) !== id)

    // si el usuario estaba mirando ese proyecto, vuelve
    if (selectedProject.value && getProjectId(selectedProject.value) === id) {
      goBackToProjects()
    }

    console.log('Proyecto eliminado:', id)
  } catch (err) {
    console.error('Error eliminando proyecto:', err)
    const msg = err?.response?.data?.error || err?.message || 'Error al eliminar proyecto'
    alert(msg)
  }
}

/**
 * Navegación breadcrumbs:
 * 0 = Proyectos
 * 1 = Equipos (proyecto)
 */
function navigateBreadcrumb(index) {
  if (index === 0) {
    goBackToProjects()
    return
  }

  if (index === 1 && selectedProject.value) {
    activeTab.value = 'teams'
    selectedTeam.value = null
  }
}

onMounted(async () => {
  await getProyectos();
  await obtenerClientes();
  await obtenerTipoProyecto();
  await obtenerUsuarios();
  await obtenerEstadosProyecto();
})
</script>
