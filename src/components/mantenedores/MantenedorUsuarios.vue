<template>
  <v-card
    class="mx-auto elevation-1"
    rounded="lg"
  >
    <!-- Eliminada la cabecera redundante aquí -->

    <v-card-text class="bg-grey-lighten-5 pa-4">
      <!-- 🔵 INDICADORES (PROYECTOS) -->
      <v-card
        border
        elevation="0"
        class="bg-white mb-4 rounded-lg overflow-hidden"
      >
        <v-toolbar
          density="compact"
          color="primary"
          dark
          flat
        >
          <v-btn
            icon
            variant="text"
            size="small"
            class="mr-2"
            @click="mostrarProyectos = !mostrarProyectos"
          >
            <v-icon>{{ mostrarProyectos ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
          </v-btn>
          <v-toolbar-title class="text-subtitle-2 font-weight-bold">
            <v-icon
              start
              size="small"
            >
              mdi-office-building
            </v-icon>
            RESUMEN DE USUARIOS POR PROYECTO
          </v-toolbar-title>
        </v-toolbar>
        <v-expand-transition>
          <div v-show="mostrarProyectos">
            <v-row
              dense
              class="pa-2"
            >
              <v-col
                v-for="stat in proyectosConUsuarios"
                :key="stat.id_proyecto"
                cols="12"
                sm="6"
                md="3"
                lg="2"
              >
                <v-card
                  :variant="filtroProyectoId === stat.id_proyecto ? 'flat' : 'tonal'"
                  :color="filtroProyectoId === stat.id_proyecto ? 'primary' : 'primary'"
                  :class="['pa-2 d-flex align-center justify-space-between cursor-pointer border', filtroProyectoId === stat.id_proyecto ? 'bg-primary-lighten-4' : '']"
                  style="height: 50px;"
                  @click="toggleFiltroProyecto(stat.id_proyecto)"
                >
                  <div
                    class="text-caption font-weight-bold truncate-text"
                    style="max-width: 70%;"
                    :title="stat.nombre_proyecto"
                  >
                    {{ stat.nombre_proyecto }}
                  </div>
                  <div class="text-h6 font-weight-black">
                    {{ stat.total_usuarios }}
                  </div>
                </v-card>
              </v-col>
              <v-col
                v-if="proyectoStats.length === 0"
                cols="12"
                class="text-center pa-2 italic text-grey"
              >
                No hay proyectos con usuarios asignados
              </v-col>
            </v-row>
          </div>
        </v-expand-transition>
      </v-card>

      <!-- 🟢 INDICADORES (HERO STATS) -->
      <v-row
        dense
        class="mb-4 align-center bg-white rounded-lg border pa-1 mx-0"
      >
        <!-- KPIs (Reducidos un poco para dar espacio) -->
        <v-col
          cols="12"
          md="2"
        >
          <v-card
            :class="['pa-2 border-0 cursor-pointer rounded-lg', filtroActual === 'activos' ? 'bg-success-lighten-5' : 'bg-transparent']"
            elevation="0"
            @click="toggleFiltro('activos')"
          >
            <div class="d-flex align-center">
              <v-avatar
                color="success-lighten-4"
                size="32"
                class="mr-2"
              >
                <v-icon
                  color="success"
                  size="18"
                >
                  mdi-account-check
                </v-icon>
              </v-avatar>
              <div>
                <div class="text-h6 font-weight-black text-success lh-1">
                  {{ stats.activos }}
                </div>
                <div
                  class="text-caption text-grey-darken-1 font-weight-bold"
                  style="font-size: 0.6rem !important;"
                >
                  ACTIVOS
                </div>
              </div>
            </div>
          </v-card>
        </v-col>

        <v-col
          cols="12"
          md="2"
        >
          <v-card
            :class="['pa-2 border-0 cursor-pointer rounded-lg', filtroActual === 'pendientes' ? 'bg-warning-lighten-5' : 'bg-transparent']"
            elevation="0"
            @click="toggleFiltro('pendientes')"
          >
            <div class="d-flex align-center">
              <v-avatar
                color="warning-lighten-4"
                size="32"
                class="mr-2"
              >
                <v-icon
                  color="warning"
                  size="18"
                >
                  mdi-draw-pen
                </v-icon>
              </v-avatar>
              <div>
                <div class="text-h6 font-weight-black text-warning lh-1">
                  {{ stats.pendientes }}
                </div>
                <div
                  class="text-caption text-grey-darken-1 font-weight-bold"
                  style="font-size: 0.6rem !important;"
                >
                  PIN FES PENDIENTE
                </div>
              </div>
            </div>
          </v-card>
        </v-col>

        <v-col
          cols="12"
          md="2"
        >
          <v-card
            :class="['pa-2 border-0 cursor-pointer rounded-lg', filtroActual === 'con-pin' ? 'bg-info-lighten-5' : 'bg-transparent']"
            elevation="0"
            @click="toggleFiltro('con-pin')"
          >
            <div class="d-flex align-center">
              <v-avatar
                color="info-lighten-4"
                size="32"
                class="mr-2"
              >
                <v-icon
                  color="info"
                  size="18"
                >
                  mdi-lock-check
                </v-icon>
              </v-avatar>
              <div>
                <div class="text-h6 font-weight-black text-info lh-1">
                  {{ stats.conPin }}
                </div>
                <div
                  class="text-caption text-grey-darken-1 font-weight-bold"
                  style="font-size: 0.6rem !important;"
                >
                  CON PIN FES
                </div>
              </div>
            </div>
          </v-card>
        </v-col>

        <v-spacer />

        <!-- PAGINACIÓN Y CONTROL -->
        <v-col
          cols="12"
          md="6"
          class="d-flex align-center justify-end ga-2"
        >
          <!-- Items por página -->
          <v-select
            v-model="itemsPerPage"
            :items="[10, 25, 50, 100, { title: 'Todos', value: -1 }]"
            label="Ver"
            density="compact"
            variant="outlined"
            hide-details
            style="max-width: 90px;"
            class="text-caption"
            @update:model-value="page = 1"
          />

          <v-divider
            vertical
            class="mx-1 my-2"
          />

          <!-- Control de Páginas -->
          <div
            v-if="itemsPerPage !== -1"
            class="d-flex align-center bg-grey-lighten-4 rounded px-2"
            style="height: 40px;"
          >
            <span class="text-caption text-grey-darken-3 font-weight-bold mr-2">
              {{ page }}/{{ pageCount || 1 }}
            </span>
            <v-pagination
              v-model="page"
              :length="pageCount"
              :total-visible="0"
              density="compact"
              size="x-small"
              active-color="primary"
            />
          </div>

          <v-divider
            vertical
            class="mx-1 my-2"
          />

          <v-btn
            variant="flat"
            color="primary"
            icon="mdi-refresh"
            size="small"
            :loading="cargando"
            title="Recargar Datos"
            @click="cargarTodo"
          />
        </v-col>
      </v-row>

      <!-- 🔵 TABLA DE USUARIOS -->
      <v-card
        border
        elevation="0"
        class="bg-white overflow-hidden"
      >
        <v-data-table
          v-model:page="page"
          :headers="headers"
          :items="usuariosFiltrados"
          :loading="cargando"
          :items-per-page="itemsPerPage"
          class="user-table"
          hover
          density="comfortable"
          hide-default-footer
        >
          <!-- Custom Slot: ID -->
          <template #[`item.id_user`]="{ item }">
            <span class="text-mono font-weight-bold text-grey-darken-1">#{{ item.id_user }}</span>
          </template>

          <!-- Custom Slot: Email -->
          <template #[`item.email`]="{ item }">
            <span class="text-caption">{{ item.email }}</span>
          </template>

          <!-- Custom Slot: Nombre Completo -->
          <template #[`item.nombre`]="{ item }">
            <div class="d-flex align-center py-1">
              <v-avatar
                color="primary-lighten-4"
                size="28"
                class="mr-2"
              >
                <span
                  class="text-primary font-weight-bold"
                  style="font-size: 0.7rem;"
                >{{ (item.name_frst || '?')[0].toUpperCase() }}</span>
              </v-avatar>
              <span class="text-caption font-weight-bold text-grey-darken-3">
                {{ item.name_frst }} {{ item.apellido_pat }} {{ item.apellido_mat }}
              </span>
            </div>
          </template>

          <!-- Custom Slot: Empresa -->
          <template #[`item.id_empresa`]="{ item }">
            <span class="text-caption font-weight-medium">
              {{ getCompanyName(item.id_empresa) }}
            </span>
          </template>

          <!-- Custom Slot: Proyectos -->
          <template #[`item.proyectos`]="{ item }">
            <div class="d-flex flex-wrap ga-1 py-1">
              <v-chip
                v-for="pId in userProjectsIdsMatch[item.id_user]"
                :key="pId"
                size="x-small"
                variant="flat"
                color="primary"
                class="text-uppercase font-weight-black"
                style="font-size: 0.65rem;"
                density="compact"
              >
                {{ getProjectName(pId) }}
              </v-chip>
              <span
                v-if="!userProjectsIdsMatch[item.id_user]?.length"
                class="text-caption text-grey"
              >-</span>
            </div>
          </template>

          <!-- Custom Slot: Estado -->
          <template #[`item.activo`]="{ item }">
            <v-chip
              :color="isActivo(item) ? 'success' : 'grey'"
              size="x-small"
              class="font-weight-black"
              variant="flat"
              label
            >
              {{ isActivo(item) ? 'ACTIVO' : 'INACTIVO' }}
            </v-chip>
          </template>

          <!-- Custom Slot: Cargo (JSON) -->
          <template #[`item.cargo`]="{ item }">
            <span
              class="text-caption text-truncate d-inline-block"
              style="max-width: 150px;"
            >
              {{ getJsonValue(item.json_data, 'cargo') }}
            </span>
          </template>

          <!-- Custom Slot: Fecha Nacimiento (JSON) -->
          <template #[`item.fecha_nac`]="{ item }">
            <span class="text-caption">
              {{ formatFecha(getJsonValue(item.json_data, 'fechaNacimiento')) }}
            </span>
          </template>

          <!-- Custom Slot: pass_hash_fes (Tick/X) -->
          <template #[`item.fes`]="{ item }">
            <v-icon
              v-if="item.pass_hash_fes"
              color="success"
              size="small"
              title="FES Registrada"
            >
              mdi-check-circle
            </v-icon>
            <v-icon
              v-else
              color="error"
              size="small"
              title="FES No Registrada"
            >
              mdi-close-circle
            </v-icon>
          </template>

          <!-- Custom Slot: Acciones -->
          <template #[`item.actions`]="{ item }">
            <div class="d-flex ga-1">
              <v-btn
                icon="mdi-matrix"
                variant="text"
                size="small"
                color="primary"
                title="Matriz de Roles"
                @click="abrirMatriz(item)"
              />
              <v-btn
                icon="mdi-pencil"
                variant="text"
                size="small"
                color="grey-darken-1"
                title="Editar Usuario"
                @click="openEdit(item)"
              />
            </div>
          </template>
        </v-data-table>
      </v-card>
    </v-card-text>

    <!-- Dialogs existentes se mantienen igual -->
    <EditUsuarioDialog
      v-model:show="editDialog"
      :usuario="usuarioEdit"
      :roles="roles"
      :permisos="permisos"
      @guardar="guardarUsuario"
      @abrir-matriz="abrirMatriz"
    />

    <RbacMatrixDialog
      v-model:show="rbacDialog.open"
      :usuario="rbacDialog.user"
      :roles-codes="accessMatrixRoleCodesPorUsuario(rbacDialog.user?.id_user)"
      :roles-catalog="roles"
      :permissions="permisos"
      @guardar="onGuardarRbac"
    />
  </v-card>
</template>

<script setup>
import { ref, computed, watch, onMounted, reactive } from 'vue'
import apiAxios from '@/services/api'
import EditUsuarioDialog from '@/components/EditUsuarioDialog.vue'
import RbacMatrixDialog from '@/components/mantenedores/RbacMatrixDialog.vue'

/* ================= PROPS ================= */
const props = defineProps({
  search: { type: String, default: '' },
  refreshKey: { type: Number, default: 0 },
})

/* ================= STATE ================= */
const cargando = ref(false)
const usuarios = ref([])
const roles = ref([])
const empresas = ref([])
const usuariosRoles = ref([])
const permisos = ref([])
const proyectoStats = ref([])
const userMemberships = ref([])
const mostrarProyectos = ref(true)
const filtroActual = ref(null) // 'activos', 'pendientes', 'sin-respuesta'
const filtroProyectoId = ref(null)

const page = ref(1)
const itemsPerPage = ref(25)

const editDialog = ref(false)
const usuarioEdit = ref(null)

const rbacDialog = reactive({
  open: false,
  user: null,
})

/* ================= TABLE HEADERS ================= */
const headers = [
  { title: 'ID', key: 'id_user', width: '70px', sortable: true },
  { title: 'EMAIL', key: 'email', sortable: true },
  { title: 'NOMBRE', key: 'nombre', sortable: true },
  { title: 'RUT', key: 'rut', sortable: true },
  { title: 'PROYECTOS', key: 'proyectos', sortable: false, width: '180px' },
  { title: 'EMPRESA', key: 'id_empresa', sortable: true },
  { title: 'ESTADO', key: 'activo', align: 'center', sortable: true },
  { title: 'CARGO', key: 'cargo', sortable: false },
  { title: 'NACIMIENTO', key: 'fecha_nac', sortable: false },
  { title: 'FES', key: 'fes', align: 'center', sortable: false },
  { title: '', key: 'actions', align: 'end', sortable: false },
]

/* ================= COMPUTED ================= */
const stats = computed(() => {
  const list = usuarios.value || []
  return {
    activos: list.filter(u => isActivo(u)).length,
    pendientes: list.filter(u => u.flag_proc_enrol === true || u.flag_proc_enrol === 1 || String(u.flag_proc_enrol) === '1').length,
    conPin: list.filter(u => u.pass_hash_fes != null).length
  }
})

const rolesPorUsuario = computed(() => {
  const map = {}
  ;(usuariosRoles.value || []).forEach(ur => {
    const uid = Number(ur.id_user)
    const rid = Number(ur.id_rol)
    if (!map[uid]) map[uid] = []
    map[uid].push(rid)
  })
  return map
})

const usuariosFiltrados = computed(() => {
  let list = usuarios.value || []

  // Filtro por KPI (indicador superior)
  if (filtroActual.value === 'activos') {
    list = list.filter(u => isActivo(u))
  } else if (filtroActual.value === 'pendientes') {
    list = list.filter(u => u.flag_proc_enrol === true || u.flag_proc_enrol === 1)
  } else if (filtroActual.value === 'con-pin') {
    list = list.filter(u => u.pass_hash_fes != null)
  }

  // Filtro por Proyecto (Click en indicadores superiores)
  if (filtroProyectoId.value) {
    const uidsInProject = userMemberships.value
      .filter(m => m.id_proyecto === filtroProyectoId.value && m.activo)
      .map(m => m.id_user)
    const set = new Set(uidsInProject)
    list = list.filter(u => set.has(u.id_user))
  }

  // Búsqueda de texto (si existe)
  const q = (props.search || '').trim().toLowerCase()
  if (!q) return list

  return list.filter(u => {
    const rbacCodes = rbacRoleCodesPorUsuario(u.id_user).join(' ')
    const prjNames = (userProjectsIdsMatch.value[u.id_user] || [])
      .map(pid => getProjectName(pid))
      .join(' ')
    const txt = `${u.id_user ?? ''} ${u.email ?? ''} ${u.rut ?? ''} ${u.nombre_user ?? ''} ${u.name_frst || ''} ${u.apellido_pat || ''} ${u.movil ?? ''} ${rbacCodes} ${prjNames}`
      .toLowerCase()
    return txt.includes(q)
  })
})

const userProjectsIdsMatch = computed(() => {
  const map = {}
  userMemberships.value.forEach(m => {
    if (!m.activo || !m.id_user) return
    if (!map[m.id_user]) map[m.id_user] = new Set()
    map[m.id_user].add(m.id_proyecto)
  })
  // Convertir sets a arrays
  const finalMap = {}
  for (const uid in map) {
    finalMap[uid] = Array.from(map[uid])
  }
  return finalMap
})

const proyectosConUsuarios = computed(() => {
  return proyectoStats.value.filter(stat => Number(stat.total_usuarios) > 0)
})

const pageCount = computed(() => {
  return Math.ceil(usuariosFiltrados.value.length / itemsPerPage.value)
})

/* ================= ACTIONS ================= */
function toggleFiltro(tipo) {
  page.value = 1 // Reset a primera página al filtrar
  filtroProyectoId.value = null // Limpiar filtro proyecto si se usa kpi
  if (filtroActual.value === tipo) filtroActual.value = null
  else filtroActual.value = tipo
}

function toggleFiltroProyecto(idPrj) {
  page.value = 1
  filtroActual.value = null // Limpiar filtro kpi si se usa proyecto
  if (filtroProyectoId.value === idPrj) filtroProyectoId.value = null
  else filtroProyectoId.value = idPrj
}

/* ================= RBAC MAPPING LOGIC (Mantenido) ================= */
const roleById = computed(() => {
  const map = new Map()
  for (const r of roles.value || []) map.set(Number(r.id_rol), r)
  return map
})

const rbacRoleCodeSet = computed(() => {
  const set = new Set()
  for (const p of permisos.value || []) {
    const idModule = Number(p?.id_module)
    const modCode = inferModuleCodeFromText(p?.description)
    const fnCode = String(p?.code_perm || '').trim().toUpperCase()
    if (!modCode || !fnCode) continue
    set.add(`${modCode}_${fnCode}`)
  }
  return set
})

function getRoleCode (r) {
  const raw = r?.codi_rol ?? r?.codigo ?? r?.code ?? r?.name_rol ?? ''
  return String(raw).trim()
}

function isCnxRoleCode(code) {
  return String(code || '').trim().toUpperCase().startsWith('CNX')
}

function inferModuleCodeFromText(text) {
  const s = String(text || '').toUpperCase()
  const m = s.match(/M[ÓO]DULO\s+([A-Z0-9_]+)/i)
  return m?.[1] ? String(m[1]).toUpperCase() : ''
}

function rbacRoleCodesPorUsuario (uid) {
  const ids = rolesPorUsuario.value[Number(uid)] || []
  return ids
    .map(id => getRoleCode(roleById.value.get(Number(id))))
    .filter(Boolean)
    .map(c => c.toUpperCase())
    .filter(code => rbacRoleCodeSet.value.has(code))
    .sort()
}

function accessMatrixRoleCodesPorUsuario (uid) {
  const ids = rolesPorUsuario.value[Number(uid)] || []
  return ids
    .map(id => getRoleCode(roleById.value.get(Number(id))))
    .filter(Boolean)
    .map(c => c.toUpperCase())
    .filter(code => rbacRoleCodeSet.value.has(code) || isCnxRoleCode(code))
    .sort()
}

function isActivo(item) {
  return item.activo === true || item.activo === 1 || String(item.activo) === '1' || String(item.activo).toLowerCase() === 'true'
}

function getJsonValue(json, key) {
  if (!json) return '-'
  try {
    const data = typeof json === 'string' ? JSON.parse(json) : json
    return data?.[key] || '-'
  } catch (e) {
    return '-'
  }
}

function formatFecha(val) {
  if (!val || val === '-') return '-'
  return val.split('-').reverse().join('/')
}

function getCompanyName(id) {
  if (!id) return '-'
  return empresas.value.find(e => Number(e.id_empresa) === Number(id))?.name_empresa || `E-${id}`
}

function getProjectName(id) {
  if (!id) return '-'
  const p = proyectoStats.value.find(s => Number(s.id_proyecto) === Number(id))
  return p?.nombre_proyecto || `P-${id}`
}

function getRoleName(idRol) {
  return roles.value.find(r => Number(r.id_rol) === Number(idRol))?.name_rol || `Rol ${idRol}`
}

/* ================= API ================= */
async function obtenerUsuarios() {
  const { data } = await apiAxios.get('/servicio/leanglobal/obtenerUsuarios')
  const arr = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : [])
  usuarios.value = arr.sort((a, b) => Number(b.id_user) - Number(a.id_user)) 
}

async function obtenerRoles() {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerRoles')
    const arr = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : [])
    roles.value = arr.map(r => ({
      ...r,
      id_rol: Number(r.id_rol ?? r.id ?? r.value),
      name_rol: r.name_rol ?? r.name ?? `Rol ${r.id_rol ?? r.id ?? r.value}`,
    }))
  } catch (e) {
    console.error('obtenerRoles', e)
    roles.value = []
  }
}

async function obtenerPermisos() {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerPermisos')
    permisos.value = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : [])
  } catch (e) {
    console.error('obtenerPermisos', e)
    permisos.value = []
  }
}

async function obtenerUsuariosRoles() {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerUsuariosRoles')
    const arr = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : [])
    usuariosRoles.value = arr
  } catch (e) {
    console.error('obtenerUsuariosRoles', e)
    usuariosRoles.value = []
  }
}

async function obtenerEmpresas() {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerEmpresas')
    empresas.value = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : [])
  } catch (e) {
    console.error('obtenerEmpresas', e)
    empresas.value = []
  }
}

async function obtenerStatsProyectos() {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerUsuariosPorProyecto')
    proyectoStats.value = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : [])
  } catch (e) {
    console.error('obtenerStatsProyectos', e)
  }
}

async function obtenerMemberships() {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerEquiposProyectosMiembros')
    userMemberships.value = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : [])
  } catch (e) {
    console.error('obtenerMemberships', e)
  }
}

async function cargarTodo() {
  cargando.value = true
  try {
    await Promise.all([
      obtenerUsuarios(),
      obtenerRoles(),
      obtenerUsuariosRoles(),
      obtenerPermisos(),
      obtenerEmpresas(),
      obtenerStatsProyectos(),
      obtenerMemberships()
    ])
  } finally {
    cargando.value = false
  }
}

/* ================= ACTIONS (Mantenidas) ================= */
function openEdit(u) {
  usuarioEdit.value = {
    ...u,
    rolesIds: rolesPorUsuario.value[Number(u.id_user)] || [],
  }
  editDialog.value = true
}

function abrirMatriz (u) {
  if (!u) return
  rbacDialog.user = u
  rbacDialog.open = true
}

async function onGuardarRbac (payload) {
  const uid = Number(payload.id_user)
  const user = usuarios.value.find(x => Number(x.id_user) === uid)
  if (!user) return

  const currentAllRoleIds = rolesPorUsuario.value[uid] || []
  const currentNonRbacIds = currentAllRoleIds.filter(rid => {
    const code = getRoleCode(roleById.value.get(Number(rid))).toUpperCase()
    return !rbacRoleCodeSet.value.has(code) && !isCnxRoleCode(code)
  })

  const newRbacIds = payload.rolesIds || []
  const finalIds = Array.from(new Set([...currentNonRbacIds, ...newRbacIds]))

  try {
    const body = {
      id_user: uid,
      email: user.email || null,
      rut: user.rut || null,
      name_frst: user.name_frst || null,
      name_sec: user.name_sec || null,
      apellido_pat: user.apellido_pat || null,
      apellido_mat: user.apellido_mat || null,
      movil: user.movil || null,
      activo: user.activo === true || user.activo === 1,
      roles: finalIds,
      json_data: user.json_data || null,
    }
    await apiAxios.post('/usuarios/updUsuario', body)
    await obtenerUsuariosRoles()
    
    if (usuarioEdit.value && Number(usuarioEdit.value.id_user) === uid) {
      usuarioEdit.value.rolesIds = finalIds
    }
    rbacDialog.open = false
  } catch (err) {
    console.error('onGuardarRbac', err)
  }
}

async function guardarUsuario(payloadFromDialog) {
  const body = {
    id_user: payloadFromDialog.id_user,
    email: payloadFromDialog.email || null,
    rut: payloadFromDialog.rut || null,
    name_frst: payloadFromDialog.name_frst || null,
    name_sec: payloadFromDialog.name_sec || null,
    apellido_pat: payloadFromDialog.apellido_pat || null,
    apellido_mat: payloadFromDialog.apellido_mat || null,
    movil: payloadFromDialog.movil || null,
    activo: payloadFromDialog.activo,
    roles: (payloadFromDialog.rolesIds || []).map(Number),
    json_data: payloadFromDialog.json_data || null,
    teams: payloadFromDialog.teams || []
  }

  try {
    await apiAxios.post('/usuarios/updUsuario', body)
    await Promise.all([obtenerUsuarios(), obtenerUsuariosRoles()])
    editDialog.value = false
    usuarioEdit.value = null
  } catch (err) {
    console.error('guardarUsuario', err)
    alert(err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Error al guardar usuario')
  }
}

/* ================= WATCHERS ================= */
watch(
  () => props.refreshKey,
  async () => {
    await cargarTodo()
  }
)

/* ================= MOUNT ================= */
onMounted(async () => {
  await cargarTodo()
})
</script>

<style scoped>
.user-table :deep(thead th) {
  background-color: #f8fafc !important;
  font-weight: 700 !important;
  color: #64748b !important;
  text-transform: uppercase;
  font-size: 0.75rem !important;
  letter-spacing: 0.05em;
}

.user-table :deep(tbody tr:hover) {
  background-color: #f1f5f9 !important;
}

.transition-swing {
  transition: all 0.2s ease-in-out;
}

.cursor-pointer {
  cursor: pointer;
}

.bg-success-lighten-5 { background-color: #f0fdf4 !important; border-color: #4ade80 !important; }
.bg-warning-lighten-5 { background-color: #fffbeb !important; border-color: #fbbf24 !important; }
.bg-info-lighten-5 { background-color: #f0f9ff !important; border-color: #38bdf8 !important; }

.text-mono {
  font-family: 'Roboto Mono', monospace;
  font-size: 0.85rem;
}

.truncate-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
