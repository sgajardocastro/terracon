<template>
  <v-card
    class="mx-auto"
    elevation="1"
  >
    <!-- ================= HEADER ================= -->
    <v-toolbar
      color="white"
      density="comfortable"
      class="border-b px-2"
    >
      <v-toolbar-title class="text-h6 font-weight-bold text-primary">
        Gestión de Equipos
      </v-toolbar-title>

      <v-spacer />

      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        :disabled="!selectedProjectIdLocal"
        @click="openTeamDialog"
      >
        Nuevo Equipo
      </v-btn>
    </v-toolbar>

    <v-card-text
      class="bg-grey-lighten-5 pa-4"
      style="min-height: 520px;"
    >
      <!-- ================= PROYECTO ACTIVO ================= -->
      <v-card
        variant="outlined"
        class="bg-white mb-4"
      >
        <div class="pa-3">
          <div class="d-flex flex-wrap align-center justify-space-between ga-3">
            <div class="d-flex align-center ga-3 flex-wrap">
              <div class="text-caption text-grey">
                PROYECTO ACTIVO
              </div>

              <v-autocomplete
                v-model="selectedProjectIdLocal"
                :items="projects"
                item-title="nombre_proyecto"
                item-value="id_proyecto"
                variant="outlined"
                density="compact"
                hide-details
                clearable
                style="min-width: 320px"
                prepend-inner-icon="mdi-briefcase-outline"
                placeholder="Selecciona un proyecto"
                :menu-props="{ maxHeight: 320 }"
                @update:model-value="onSelectProject"
              />

              <v-chip
                v-if="selectedProject"
                size="small"
                variant="tonal"
                :color="getStatusColor(selectedProject.id_proyecto_estado)"
              >
                {{ getStatusName(selectedProject.id_proyecto_estado) }}
              </v-chip>
            </div>

            <v-btn
              variant="tonal"
              color="primary"
              size="small"
              prepend-icon="mdi-refresh"
              :disabled="!selectedProjectIdLocal || cargando"
              @click="reloadEquipos"
            >
              Recargar
            </v-btn>
          </div>
        </div>
      </v-card>

      <!-- ================= SIN PROYECTO ================= -->
      <v-alert
        v-if="!selectedProjectIdLocal"
        type="info"
        variant="tonal"
        density="compact"
      >
        Selecciona un proyecto para ver sus equipos.
      </v-alert>

      <!-- ================= LISTADO EQUIPOS ================= -->
      <template v-else>
        <v-skeleton-loader
          v-if="cargando"
          type="list-item-two-line, list-item-two-line"
        />

        <v-row v-else>
          <v-col
            v-for="team in equiposUnicos"
            :key="team.id_equipo_proyecto"
            cols="12"
          >
            <v-card
              variant="outlined"
              class="bg-white"
            >
              <div class="d-flex flex-wrap pa-4 align-center">
                <div class="flex-grow-1">
                  <div class="d-flex align-center gap-2 mb-2">
                    <div class="d-flex flex-column">
                      <span class="text-h6 font-weight-bold">
                        {{ team.nombre_equipo || ('Equipo #' + team.id_equipo_proyecto) }}
                      </span>
                      <span class="text-caption text-grey">
                        ID Equipo: {{ team.id_equipo_proyecto }}
                      </span>
                    </div>
                  </div>

                  <div class="text-caption text-grey-darken-1">
                    {{ team.cantidad }} integrantes
                  </div>

                  <div
                    v-if="team.nombre_equipo"
                    class="text-body-2 mt-1"
                  >
                    <strong>{{ team.nombre_equipo }}</strong>
                    <span
                      v-if="team.descripcion_equipo"
                      class="text-grey-darken-1"
                    >
                      — {{ team.descripcion_equipo }}
                    </span>
                  </div>
                </div>

                <!-- BOTÓN INTEGRANTES (REUTILIZA COMPONENTE REAL) -->
                <MantenedorIntegrantesEquipo
                  :id-equipo="team.id_equipo_proyecto"
                  :nombre-equipo="team.nombre_equipo || ('Equipo #' + team.id_equipo_proyecto)"
                  :descripcion-equipo="team.descripcion_equipo || ''"
                  :usuarios="users"
                  @actualizado="onEquipoActualizado"
                />
              </div>
            </v-card>
          </v-col>

          <v-col
            v-if="equiposUnicos.length === 0"
            cols="12"
          >
            <v-alert
              type="info"
              variant="tonal"
              density="compact"
            >
              Este proyecto no tiene equipos registrados.
            </v-alert>
          </v-col>
        </v-row>
      </template>
    </v-card-text>

    <!-- ================= MODAL CREAR EQUIPO ================= -->
    <v-dialog
      v-model="teamDialog"
      max-width="780"
      persistent
    >
      <v-card>
        <v-toolbar
          density="comfortable"
          color="white"
          class="border-b"
        >
          <v-toolbar-title class="text-h6 font-weight-bold">
            Nuevo Equipo
          </v-toolbar-title>
          <v-spacer />
          <v-btn
            icon="mdi-close"
            variant="text"
            :disabled="savingTeam"
            @click="closeTeamDialog"
          />
        </v-toolbar>

        <v-card-text class="pa-4">
          <v-alert
            v-if="teamError"
            type="error"
            variant="tonal"
            density="compact"
            class="mb-3"
          >
            {{ teamError }}
          </v-alert>

          <v-row dense>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="teamForm.nombre_equipo"
                label="Nombre del equipo *"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-account-group-outline"
                :error="teamTouched && !teamForm.nombre_equipo"
                :error-messages="teamTouched && !teamForm.nombre_equipo ? ['Requerido'] : []"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="teamForm.id_usuario_lider"
                :items="users"
                item-title="nombre_user"
                item-value="id_user"
                label="Supervisor / Líder"
                variant="outlined"
                density="compact"
                clearable
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="teamForm.descripcion_equipo"
                label="Descripción"
                variant="outlined"
                density="compact"
                rows="2"
                auto-grow
              />
            </v-col>

            <v-col cols="12">
              <v-alert
                type="info"
                density="compact"
                variant="tonal"
              >
                Proyecto seleccionado: <strong>{{ selectedProject?.nombre_proyecto || selectedProjectIdLocal }}</strong>
              </v-alert>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="justify-end px-4 pb-4">
          <v-btn
            variant="tonal"
            :disabled="savingTeam"
            @click="closeTeamDialog"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            :loading="savingTeam"
            @click="guardarEquipo"
          >
            Guardar Equipo
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import apiAxios from '@/services/api'
import MantenedorIntegrantesEquipo from '@/components/MantenedorIntegrantesEquipo.vue'

/* ================= PROPS ================= */
const props = defineProps({
  search: { type: String, default: '' },
  refreshKey: { type: Number, default: 0 },
  selectedProjectId: { type: [Number, String], default: null },
})

/* ================= STATE ================= */
const projects = ref([])
const users = ref([])

const selectedProjectIdLocal = ref(null)
const cargando = ref(false)
const filas = ref([])

/* ================= MODAL STATE ================= */
const teamDialog = ref(false)
const savingTeam = ref(false)
const teamError = ref('')
const teamTouched = ref(false)

const teamForm = ref({
  nombre_equipo: '',
  descripcion_equipo: '',
})

/* ================= COMPUTED ================= */
const selectedProject = computed(() =>
  projects.value.find(p => Number(p.id_proyecto) === Number(selectedProjectIdLocal.value)) || null
)

const equiposUnicos = computed(() => {
  const map = new Map()

  for (const f of filas.value) {
    const id = Number(f?.id_equipo_proyecto)
    if (!id) continue

    if (!map.has(id)) {
      map.set(id, {
        id_equipo_proyecto: id,
        cantidad: 0,
        nombre_equipo: f?.nombre_equipo ?? null,
        descripcion_equipo: f?.descripcion_equipo ?? null,
        estado_equipo: f?.estado_equipo ?? 'ACTIVO',
      })
    }

    map.get(id).cantidad++
  }

  return Array.from(map.values()).sort((a, b) => a.id_equipo_proyecto - b.id_equipo_proyecto)
})

/* ================= API ================= */
async function getProyectos () {
  const { data } = await apiAxios.get('/servicio/leanglobal/obtenerProyectos')
  projects.value = Array.isArray(data) ? data : []
}

async function obtenerUsuarios () {
  const { data } = await apiAxios.get('/servicio/leanglobal/obtenerUsuarios')
  users.value = (Array.isArray(data) ? data : [])
    .filter(u => (u?.nombre_user ?? '').trim().length > 0)
    .sort((a, b) =>
      (a.nombre_user ?? '').localeCompare((b.nombre_user ?? ''), 'es', { sensitivity: 'base' })
    )
}

async function cargarEquipos (idProyecto, silencioso = false) {
  const pid = Number(idProyecto)
  if (!pid) {
    filas.value = []
    return
  }

  if (!silencioso) cargando.value = true
  try {
    const { data } = await apiAxios.get(
      '/servicio/leanglobal/obtenerEquiposProyectosMiembros',
      { params: { id_proyecto: pid } }
    )
    filas.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('Error cargarEquipos:', e)
    filas.value = []
  } finally {
    if (!silencioso) cargando.value = false
  }
}

/* ================= ACTIONS ================= */
async function onSelectProject (id) {
  selectedProjectIdLocal.value = (id === '' || id === undefined) ? null : id
  filas.value = []
  if (!selectedProjectIdLocal.value) return
  await cargarEquipos(selectedProjectIdLocal.value)
}

async function reloadEquipos (silencioso = false) {
  if (!selectedProjectIdLocal.value) return
  await cargarEquipos(selectedProjectIdLocal.value, silencioso)
}

function onEquipoActualizado () {
  reloadEquipos(true) // 👈 recarga silenciosa
}

function openTeamDialog () {
  if (!selectedProjectIdLocal.value) return
  teamError.value = ''
  teamTouched.value = false

  // reset form
  teamForm.value = {
    nombre_equipo: '',
    descripcion_equipo: '',
    id_usuario_lider: null,
  }

  teamDialog.value = true
}

function closeTeamDialog () {
  if (savingTeam.value) return
  teamDialog.value = false
}


function humanizePgError(e) {
  const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || ''
  const s = String(msg).toLowerCase()

  // unique (id_proyecto, nombre_equipo)
  if (s.includes('uq_equipo_por_proyecto') || s.includes('duplicate') || s.includes('unicidad') || s.includes('llave duplicada')) {
    return 'Ya existe un equipo con ese nombre en este proyecto.'
  }

  return String(msg || 'Error al crear equipo.')
}

async function guardarEquipo () {
  teamTouched.value = true
  teamError.value = ''

  if (!selectedProjectIdLocal.value) {
    teamError.value = 'Debes seleccionar un proyecto.'
    return
  }
  if (!teamForm.value.nombre_equipo?.trim()) {
    teamError.value = 'El nombre del equipo es obligatorio.'
    return
  }

  savingTeam.value = true
  try {
    await apiAxios.post('/proyectos/crearEquipoProyecto', {
      id_proyecto: Number(selectedProjectIdLocal.value),
      nombre_equipo: teamForm.value.nombre_equipo.trim(),
      descripcion_equipo: teamForm.value.descripcion_equipo?.trim() || null,
      id_usuario_lider: teamForm.value.id_usuario_lider || null,
      estado_equipo: 'ACTIVO',
      json_field: null,
    })

    teamDialog.value = false
    await reloadEquipos()
  } catch (e) {
    console.error('Error guardarEquipo:', e?.response || e)
    teamError.value = humanizePgError(e)
  } finally {
    savingTeam.value = false
  }
}

/* ================= WATCHERS ================= */
watch(
  () => props.selectedProjectId,
  async (id) => {
    if (id == null || id === '') return
    await onSelectProject(id)
  },
  { immediate: true }
)

watch(
  () => props.refreshKey,
  async () => {
    await reloadEquipos()
  }
)

/* ================= HELPERS ================= */
function getStatusName (id) {
  if (Number(id) === 3) return 'En Ejecución'
  if (Number(id) === 2) return 'Planificación'
  return '—'
}
function getStatusColor (id) {
  if (Number(id) === 3) return 'success'
  if (Number(id) === 2) return 'warning'
  return 'grey'
}

/* ================= MOUNT ================= */
onMounted(async () => {
  await getProyectos()
  await obtenerUsuarios()

  if (props.selectedProjectId != null && props.selectedProjectId !== '') {
    await onSelectProject(props.selectedProjectId)
  }
})
</script>
