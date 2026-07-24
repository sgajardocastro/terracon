<template>
  <v-card
    class="mx-auto"
    elevation="1"
  >
    <!-- Barra título -->
    <v-toolbar
      color="white"
      density="comfortable"
      class="border-b px-2"
    >
      <v-toolbar-title class="text-h6 font-weight-bold text-primary">
        Matriz RBAC (Roles por Usuario)
      </v-toolbar-title>

      <v-spacer />

      <v-btn
        variant="tonal"
        color="primary"
        size="small"
        prepend-icon="mdi-refresh"
        :loading="cargando"
        @click="cargarTodo"
      >
        Recargar
      </v-btn>
    </v-toolbar>

    <v-card-text
      class="bg-grey-lighten-5 pa-4"
      style="min-height: 520px;"
    >
      <!-- Snackbar -->
      <v-snackbar
        v-model="snack.open"
        :color="snack.color"
        location="bottom end"
        timeout="2500"
      >
        {{ snack.msg }}
      </v-snackbar>

      <div class="d-flex justify-space-between align-center mb-4">
        <p class="text-body-2 text-grey-darken-1 mb-0">
          Configura roles RBAC por usuario (Módulo × Función).
        </p>

        <div class="text-caption text-grey">
          Total usuarios: <strong>{{ usuariosFiltrados.length }}</strong>
        </div>
      </div>

      <v-skeleton-loader
        v-if="cargando"
        type="list-item-two-line, list-item-two-line, list-item-two-line"
      />

      <template v-else>
        <v-alert
          v-if="usuariosFiltrados.length === 0"
          type="info"
          variant="tonal"
          density="compact"
        >
          No hay usuarios para mostrar.
        </v-alert>

        <v-row v-else>
          <v-col
            v-for="u in usuariosFiltrados"
            :key="u.id_user"
            cols="12"
          >
            <v-card
              variant="outlined"
              class="bg-white"
            >
              <div class="d-flex flex-wrap pa-4 align-center">
                <!-- Info -->
                <div class="flex-grow-1">
                  <div class="d-flex align-center gap-2 mb-2">
                    <v-chip
                      color="blue-grey"
                      label
                      size="small"
                      class="mr-2 font-weight-bold"
                    >
                      #{{ u.id_user }}
                    </v-chip>

                    <span class="text-h6 font-weight-bold">
                      {{ u.nombre_user || nombreCompleto(u) || '(Sin nombre)' }}
                    </span>

                    <v-chip
                      size="small"
                      variant="tonal"
                      :color="isActivo(u) ? 'success' : 'grey'"
                      class="ml-2"
                    >
                      {{ isActivo(u) ? 'Activo' : 'Inactivo' }}
                    </v-chip>
                  </div>

                  <div class="d-flex flex-wrap text-caption text-grey-darken-1 gap-4">
                    <span class="d-flex align-center mr-4">
                      <v-icon
                        icon="mdi-email-outline"
                        size="small"
                        class="mr-1"
                      />
                      {{ u.email || 'Sin correo' }}
                    </span>

                    <span class="d-flex align-center mr-4">
                      <v-icon
                        icon="mdi-card-account-details-outline"
                        size="small"
                        class="mr-1"
                      />
                      Rut: {{ u.rut || '—' }}
                    </span>

                    <span class="d-flex align-center">
                      <v-icon
                        icon="mdi-cellphone"
                        size="small"
                        class="mr-1"
                      />
                      Móvil: {{ u.movil || '—' }}
                    </span>
                  </div>

                  <!-- Chips RBAC actuales -->
                  <div class="d-flex flex-wrap ga-1 mt-3">
                    <template v-if="rbacRoleCodesPorUsuario(u.id_user).length">
                      <v-chip
                        v-for="code in rbacRoleCodesPorUsuario(u.id_user).slice(0, 6)"
                        :key="code"
                        size="x-small"
                        label
                        variant="tonal"
                      >
                        {{ code }}
                      </v-chip>

                      <v-chip
                        v-if="rbacRoleCodesPorUsuario(u.id_user).length > 6"
                        size="x-small"
                        label
                        variant="tonal"
                        color="grey"
                      >
                        +{{ rbacRoleCodesPorUsuario(u.id_user).length - 6 }}
                      </v-chip>
                    </template>

                    <span
                      v-else
                      class="text-caption text-grey"
                    >
                      Sin roles RBAC configurados
                    </span>
                  </div>
                </div>

                <!-- Acción -->
                <div class="d-flex align-center mt-2 mt-sm-0">
                  <v-btn
                    color="primary"
                    variant="tonal"
                    size="small"
                    prepend-icon="mdi-matrix"
                    @click="abrirMatriz(u)"
                  >
                    Matriz
                  </v-btn>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </template>
    </v-card-text>

    <!-- ===================== DIALOG MATRIZ ===================== -->
    <RbacMatrixDialog
      v-model:show="dialog.open"
      :usuario="dialog.user"
      :roles-codes="accessMatrixRoleCodesPorUsuario(dialog.user?.id_user)"
      :roles-catalog="roles"
      :permissions="permisos"
      @guardar="onGuardarRbac"
    />
  </v-card>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import apiAxios from '@/services/api'
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
const usuariosRoles = ref([])
const permisos = ref([])

/** dialog */
const dialog = reactive({
  open: false,
  saving: false,
  user: null,
})

/** set temporal RBAC codes */
const tempRoles = ref(new Set())

/** snackbar */
const snack = reactive({
  open: false,
  msg: '',
  color: 'green-darken-2',
})

function showSnack (msg, color = 'green-darken-2') {
  snack.msg = msg
  snack.color = color
  snack.open = true
}

/* ================= HELPERS ================= */
function nombreCompleto (u) {
  const parts = [u.name_frst, u.name_sec, u.apellido_pat, u.apellido_mat].filter(Boolean)
  return parts.join(' ').trim()
}

function isActivo (u) {
  return u.activo === true || u.activo === 1 || u.activo === 't' || u.activo === 'true'
}

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

/* ================= MAPAS ================= */
const roleById = computed(() => {
  const map = new Map()
  for (const r of roles.value || []) map.set(Number(r.id_rol), r)
  return map
})

const roleIdByCode = computed(() => {
  const map = new Map()
  for (const r of roles.value || []) {
    const code = getRoleCode(r)
    if (code) map.set(code.toUpperCase(), Number(r.id_rol))
  }
  return map
})

const moduloCodeById = computed(() => {
  const map = new Map()
  for (const p of permisos.value || []) {
    const idModule = Number(p?.id_module)
    if (!Number.isFinite(idModule) || idModule <= 0 || map.has(idModule)) continue
    const code = inferModuleCodeFromText(p?.description)
    if (code) map.set(idModule, code)
  }

  // segundo pase: intenta encontrar uno válido por cada módulo
  for (const p of permisos.value || []) {
    const idModule = Number(p?.id_module)
    if (!Number.isFinite(idModule) || idModule <= 0 || map.has(idModule)) continue
    const code = inferModuleCodeFromText(p?.description)
    if (code) map.set(idModule, code)
  }

  return map
})

const rbacRoleCodeSet = computed(() => {
  const set = new Set()
  for (const p of permisos.value || []) {
    const idModule = Number(p?.id_module)
    const modCode = moduloCodeById.value.get(idModule)
    const fnCode = String(p?.code_perm || '').trim().toUpperCase()
    if (!modCode || !fnCode) continue
    set.add(`${modCode}_${fnCode}`)
  }
  return set
})

const rolesPorUsuario = computed(() => {
  const map = new Map()
  for (const ur of usuariosRoles.value || []) {
    const uid = Number(ur.id_user)
    const rid = Number(ur.id_rol)
    if (!map.has(uid)) map.set(uid, [])
    map.get(uid).push(rid)
  }
  return map
})

function roleCodesUsuario (uid) {
  const ids = rolesPorUsuario.value.get(Number(uid)) || []
  return ids
    .map(id => getRoleCode(roleById.value.get(Number(id))))
    .filter(Boolean)
    .map(c => c.toUpperCase())
}

function rbacRoleCodesPorUsuario (uid) {
  return roleCodesUsuario(uid)
    .filter(code => rbacRoleCodeSet.value.has(String(code || '').toUpperCase()))
    .sort()
}

function accessMatrixRoleCodesPorUsuario (uid) {
  return roleCodesUsuario(uid)
    .filter(code => {
      const normalized = String(code || '').toUpperCase()
      return rbacRoleCodeSet.value.has(normalized) || isCnxRoleCode(normalized)
    })
    .sort()
}

/* ================= COMPUTED ================= */
const usuariosFiltrados = computed(() => {
  const q = (props.search || '').trim().toLowerCase()
  if (!q) return usuarios.value

  return usuarios.value.filter(u => {
    const txt = `${u.id_user ?? ''} ${u.email ?? ''} ${u.rut ?? ''} ${u.nombre_user ?? ''} ${nombreCompleto(u) ?? ''} ${u.movil ?? ''}`.toLowerCase()
    return txt.includes(q)
  })
})

/* ================= API ================= */
async function obtenerUsuarios() {
  const { data } = await apiAxios.get('/servicio/leanglobal/obtenerUsuarios')
  const arr = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : [])

  usuarios.value = arr.sort((a, b) => Number(b.id_user) - Number(a.id_user)) // ↓ mayor a menor
}

async function obtenerRoles () {
  const { data } = await apiAxios.get('/servicio/leanglobal/obtenerRoles')
  roles.value = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : [])
  console.log('Roles obtenidos:', roles.value)
}

async function obtenerUsuariosRoles () {
  const { data } = await apiAxios.get('/servicio/leanglobal/obtenerUsuariosRoles')
  usuariosRoles.value = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : [])
}

async function obtenerPermisos () {
  const { data } = await apiAxios.get('/servicio/leanglobal/obtenerPermisos')
  permisos.value = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : [])
}

async function cargarTodo () {
  cargando.value = true
  try {
    await Promise.all([obtenerUsuarios(), obtenerRoles(), obtenerUsuariosRoles(), obtenerPermisos()])
  } catch (e) {
    console.error(e)
    showSnack('Error cargando datos', 'red-darken-2')
  } finally {
    cargando.value = false
  }
}

/* ================= MATRIZ ================= */
function abrirMatriz (u) {
  dialog.user = u

  const currentCodes = accessMatrixRoleCodesPorUsuario(u.id_user)
  tempRoles.value = new Set(currentCodes.map(x => x.toUpperCase()))

  dialog.open = true
}

function cerrarMatriz () {
  dialog.open = false
  dialog.user = null
  tempRoles.value = new Set()
}

/**
 * Handler del RbacMatrixDialog
 * payload: { id_user, rolesCodes: string[] }
 */
async function onGuardarRbac (payload) {
  if (!dialog.user) return

  const uid = Number(dialog.user.id_user)

  // roles actuales (ids)
  const currentRoleIds = (rolesPorUsuario.value.get(uid) || []).map(Number)

  // mantener NO-RBAC actuales
  const currentNonRbacIds = currentRoleIds.filter(rid => {
    const code = getRoleCode(roleById.value.get(Number(rid))).toUpperCase()
    return !rbacRoleCodeSet.value.has(code) && !isCnxRoleCode(code)
  })

  // convertir codes seleccionados a ids
  const selectedCodes = (payload?.rolesCodes || []).map(x => String(x).toUpperCase())
  const selectedRbacIds = selectedCodes
    .map(code => roleIdByCode.value.get(code))
    .filter(Boolean)
    .map(Number)

  const finalRoleIds = Array.from(new Set([...currentNonRbacIds, ...selectedRbacIds]))

  dialog.saving = true
  try {
    await apiAxios.post('/usuarios/updUsuario', {
      id_user: uid,
      email: dialog.user.email ?? null,
      rut: dialog.user.rut ?? null,
      name_frst: dialog.user.name_frst ?? null,
      name_sec: dialog.user.name_sec ?? null,
      apellido_pat: dialog.user.apellido_pat ?? null,
      apellido_mat: dialog.user.apellido_mat ?? null,
      movil: dialog.user.movil ?? null,
      activo: isActivo(dialog.user),
      roles: finalRoleIds,
    })

    showSnack('Roles RBAC actualizados ✅')
    await obtenerUsuariosRoles()
    cerrarMatriz()
  } catch (e) {
    console.error(e)
    showSnack(
      e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Error guardando roles',
      'red-darken-2'
    )
  } finally {
    dialog.saving = false
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

/* 👇 Exporta helpers usados en template */
defineExpose({
  abrirMatriz,
  rbacRoleCodesPorUsuario,
  nombreCompleto,
  isActivo,
})
</script>

<style scoped>
.rbac-table {
  width: 100%;
}

.head-left,
.cell-left {
  min-width: 260px;
}

.head {
  min-width: 110px;
}

.sticky-left {
  position: sticky;
  left: 0;
  z-index: 2;
  background: white;
}

.head-left {
  z-index: 3;
  background: #fafafa;
}

thead th {
  background: #fafafa;
}
</style>
