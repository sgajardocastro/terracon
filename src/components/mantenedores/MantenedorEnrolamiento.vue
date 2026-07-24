<template>
  <!-- ❌ Sin DashboardLayout acá, porque ya lo pone el DashboardMantenedores -->
  <v-card class="mt-2 sombra-resaltada">
    <v-toolbar
      color="primary"
      dark
    >
      <v-toolbar-title>Enrolamiento</v-toolbar-title>

      <v-spacer />

      <!-- opcional: botón refresh manual -->
      <v-btn
        icon
        variant="text"
        :loading="loading"
        @click="reloadAll"
      >
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </v-toolbar>

    <v-card-text class="pb-0">
      <!-- Filtros / alta rápida -->
      <v-row
        class="align-center"
        dense
      >
        <v-col
          cols="12"
          md="2"
        >
          <v-text-field
            v-model="rut"
            label="Rut"
            variant="outlined"
            density="compact"
            hide-details
            placeholder="12345678-9"
          />
        </v-col>

        <v-col
          cols="12"
          md="2"
        >
          <v-text-field
            v-model="nombre"
            label="Nombre General"
            variant="outlined"
            density="compact"
            hide-details
          />
        </v-col>

        <v-col
          cols="12"
          md="2"
        >
          <v-text-field
            v-model="correo"
            label="Correo"
            variant="outlined"
            density="compact"
            hide-details
            :rules="[emailRule]"
            placeholder="usuario@correo.cl"
          />
        </v-col>

        <v-col
          cols="12"
          md="2"
        >
          <v-select
            v-model="rolesSeleccionados"
            :items="rolesFiltrados"
            item-title="name_rol"
            item-value="id_rol"
            label="Seleccionar Roles"
            multiple
            chips
            variant="outlined"
            density="compact"
            hide-details
            clearable
          />
        </v-col>

        <!-- ✅ NUEVO: Select de Empresas (solo si algún rol seleccionado es externo) -->
        <v-col
          cols="12"
          md="2"
        >
          <v-select
            v-if="showEmpresas"
            v-model="empresaSeleccionada"
            :items="empresas"
            item-title="name_empresa"
            item-value="id_empresa"
            label="Empresa"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            :disabled="loadingEmpresas"
            :loading="loadingEmpresas"
          />
        </v-col>

        <v-col
          cols="12"
          md="2"
          class="d-flex align-center justify-end"
        >
          <v-btn
            color="primary"
            :loading="loadingEnroll"
            @click="enviarIniciarEnrolamiento"
          >
            ENVIAR ENROLAMIENTO
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>

    <EnrolamientoExcel
      :roles="roles"
      @finalizado="reloadAll"
    />

    <!-- TABLA USUARIOS -->
    <v-card-text class="pt-2">
      <div class="tabla-container">
        <v-table
          density="compact"
          class="text-caption"
          height="700px"
          fixed-header
        >
          <thead>
            <tr>
              <th class="text-left">
                ID
              </th>
              <th class="text-left">
                Roles
              </th>
              <th class="text-left">
                Correo
              </th>
              <th class="text-left">
                Primer Nombre
              </th>
              <th class="text-left">
                Segundo Nombre
              </th>
              <th class="text-left">
                Apellido Pat
              </th>
              <th class="text-left">
                Apellido Mat
              </th>
              <th class="text-left">
                Rut
              </th>
              <th class="text-left">
                Móvil
              </th>
              <th class="text-center">
                Activo
              </th>
              <th class="text-left">
                Creación
              </th>
              <th class="text-left">
                Actualización
              </th>
              <th class="text-left">
                Código
              </th>
              <th class="text-left">
                En Enrolamiento
              </th>
              <th
                v-if="esSup2"
                class="text-left"
              >
                Acciones
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="item in usuariosFiltrados"
              :key="item.id_user"
            >
              <td>{{ item.id_user }}</td>

              <td>
                <div class="d-flex flex-wrap roles-cell">
                  <v-chip
                    v-for="rolNombre in obtenerNombresRolesUsuario(item.id_user)"
                    :key="rolNombre"
                    size="x-small"
                    label
                    class="mr-1 mb-1"
                    color="primary"
                    variant="flat"
                  >
                    {{ rolNombre }}
                  </v-chip>
                </div>
              </td>

              <td>{{ item.email }}</td>
              <td>{{ item.name_frst }}</td>
              <td>{{ item.name_sec }}</td>
              <td>{{ item.apellido_pat }}</td>
              <td>{{ item.apellido_mat }}</td>
              <td>{{ item.rut }}</td>
              <td>{{ item.movil }}</td>

              <!-- ✅ ACTIVO -->
              <td class="text-center">
                <v-icon
                  v-if="item.activo"
                  size="18"
                  color="green-darken-2"
                >
                  mdi-check-circle
                </v-icon>
                <v-icon
                  v-else
                  size="18"
                  color="red-darken-2"
                >
                  mdi-close-circle
                </v-icon>
              </td>

              <td>{{ formatearFecha(item.fecha_creacion) }}</td>
              <td>{{ formatearFecha(item.fecha_actualizacion) }}</td>

              <td>{{ item.codi_user }}</td>
              <td>{{ item.flag_proc_enrol ? 'Sí' : 'No' }}</td>

              <td v-if="esSup2">
                <div class="d-flex align-center ga-1">
                  <v-icon
                    size="18"
                    class="icon-action"
                    @click="abrirDialogEdicion(item)"
                  >
                    mdi-pencil
                  </v-icon>
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>
    </v-card-text>

    <!-- Dialog de mensaje genérico -->
    <v-dialog
      v-model="dialogConfirmacion"
      max-width="500"
    >
      <v-card>
        <v-card-text class="py-6 text-center">
          <v-progress-circular
            v-if="cargandoDialogo"
            indeterminate
            color="primary"
            size="48"
            class="mb-4"
          />
          <div>{{ mensajeDialogo }}</div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            v-if="!cargandoDialogo"
            color="primary"
            @click="dialogConfirmacion = false"
          >
            Aceptar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de edición -->
    <EditUsuarioDialog
      v-if="esSup2"
      v-model:show="dialogEditar"
      :usuario="usuarioSeleccionado"
      :roles="roles"
      @guardar="guardarUsuarioEditado"
    />
  </v-card>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import apiAxios from '@/services/api'
import EditUsuarioDialog from '@/components/EditUsuarioDialog.vue'
import { useUserDetailStore } from '@/stores/userDetail'

/**
 * Props para integrarse con el mantenedor:
 * - search: búsqueda global (desde DashboardMantenedores)
 * - refreshKey: cuando cambia, recargamos data (patrón de tus otros tabs)
 */
const props = defineProps({
  search: { type: String, default: '' },
  refreshKey: { type: Number, default: 0 },
})
const emit = defineEmits(['refresh'])

const userDetailStore = useUserDetailStore()

const ROLES_EXCLUIDOS = [
  'USR-CONSEN', 'Eq-FESCOL', 'SUP', 'JTRR', 'ADCO',
  'ITO', 'TOPG', 'PRRS', 'PRLD', 'JOFT', 'JQLT',
  'AQLT', 'PR-QLTY', 'PR-MAM', 'DT-CONS', 'FES_DIRECTA'
]

const rut = ref('')
const nombre = ref('')
const correo = ref('')
const rolesSeleccionados = ref([])

const usuarios = ref([])
const usuariosRoles = ref([])
const roles = ref([])

/** ✅ NUEVO: empresas */
const empresas = ref([])
const empresaSeleccionada = ref(null)
const loadingEmpresas = ref(false)

const loading = ref(false)
const loadingEnroll = ref(false)

const cargandoDialogo = ref(false)
const mensajeDialogo = ref('Enviando datos...')
const dialogConfirmacion = ref(false)

const dialogEditar = ref(false)
const usuarioSeleccionado = ref(null)

const emailRule = value => /.+@.+\..+/.test(value) || 'Correo inválido'

watch(rut, (val) => {
  let v = String(val ?? '')
    .toUpperCase()
    .replace(/[^0-9K]/g, '')

  if (v.length > 9) v = v.slice(0, 9)

  if (v.length <= 1) {
    rut.value = v
    return
  }

  const cuerpo = v.slice(0, -1)
  const dv = v.slice(-1)
  rut.value = `${cuerpo}-${dv}`
})

const hasRol11 = computed(() => {
  const uid = Number(userDetailStore.userDetail?.id_user)
  return usuariosRoles.value.some(
    r => Number(r.id_user) === uid && Number(r.id_rol) === 11
  )
})

const esSup2 = computed(() => hasRol11.value)

const tieneRolExternoSeleccionado = computed(() => {
  const ids = (rolesSeleccionados.value || []).map(n => Number(n))
  if (!ids.length) return false

  return roles.value.some(r => {
    if (!ids.includes(Number(r.id_rol))) return false
    const name = String(r.name_rol || '').trim().toUpperCase()
    return name.startsWith('CNX-CON')
  })
})

const rolesFiltrados = computed(() => {
  return (roles.value || []).filter(r => !ROLES_EXCLUIDOS.includes(r.name_rol))
})

/** ✅ NUEVO: define si mostrar el select empresas */
const showEmpresas = computed(() => tieneRolExternoSeleccionado.value)

const rolesPorUsuario = computed(() => {
  const map = {}
    ; (usuariosRoles.value || []).forEach(ur => {
      if (!map[ur.id_user]) map[ur.id_user] = []
      map[ur.id_user].push(ur.id_rol)
    })
  return map
})

function obtenerNombresRolesUsuario(id_user) {
  const idsRoles = rolesPorUsuario.value[id_user] || []
  return idsRoles
    .map(idRol => {
      const rol = roles.value.find(r => Number(r.id_rol) === Number(idRol))
      return rol ? rol.name_rol : null
    })
    .filter(Boolean)
}

function formatearFecha(fecha) {
  if (!fecha) return ''
  return String(fecha).slice(0, 10)
}

const usuariosFiltrados = computed(() => {
  const q = String(props.search || '').trim().toLowerCase()
  const list = usuarios.value || []
  if (!q) return list

  return list.filter(u => {
    const hay = [
      u?.id_user,
      u?.email,
      u?.name_frst,
      u?.name_sec,
      u?.apellido_pat,
      u?.apellido_mat,
      u?.rut,
      u?.movil,
      u?.codi_user,
      u?.flag_proc_enrol ? 'si' : 'no',
      ...obtenerNombresRolesUsuario(u?.id_user),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return hay.includes(q)
  })
})

onMounted(async () => {
  await reloadAll()
})

watch(() => props.refreshKey, async () => {
  await reloadAll()
})

/** ✅ NUEVO: cuando cambia la condición, limpiamos/cargamos empresas */
watch(showEmpresas, async (val) => {
  if (!val) {
    empresaSeleccionada.value = null
    return
  }
  // Si se activa por primera vez y no hay empresas cargadas, cargamos
  if (!empresas.value.length) {
    await obtenerEmpresas()
  }
})

async function reloadAll() {
  loading.value = true
  try {
    await Promise.all([
      obtenerUsuarios(),
      obtenerRoles(),
      obtenerUsuariosRoles(),
      // opcional: precargar empresas; yo lo dejo bajo demanda con showEmpresas
      // obtenerEmpresas(),
    ])
  } finally {
    loading.value = false
  }
}

async function obtenerRoles() {
  try {
    const response = await apiAxios.get('/servicio/leanglobal/obtenerRoles')
    roles.value = response.data || []
    console.log(roles.value)
  } catch (error) {
    console.error(error?.response || error)
  }
}

async function obtenerUsuarios() {
  try {
    const response = await apiAxios.get('/servicio/leanglobal/obtenerUsuarios')
    usuarios.value = (response.data || []).sort((a, b) => b.id_user - a.id_user)
  } catch (error) {
    console.error(error?.response || error)
  }
}

async function obtenerUsuariosRoles() {
  try {
    const response = await apiAxios.get('/servicio/leanglobal/obtenerUsuariosRoles')
    usuariosRoles.value = response.data || []
  } catch (error) {
    console.error(error?.response || error)
  }
}

/** ✅ NUEVO: obtener empresas (ajusta URI/item-title/item-value según tu backend) */
async function obtenerEmpresas() {
  loadingEmpresas.value = true
  try {
    const response = await apiAxios.get('/servicio/leanglobal/obtenerEmpresas')
    empresas.value = response.data || []
    empresas.value = empresas.value.filter(e => e.flag_externo === true || Number(e.flag_externo) === 1)
    console.log('Empresas cargadas:', empresas.value)
  } catch (error) {
    console.error(error?.response || error)
    empresas.value = []
  } finally {
    loadingEmpresas.value = false
  }
}

async function enviarIniciarEnrolamiento() {
  loadingEnroll.value = true
  cargandoDialogo.value = true
  mensajeDialogo.value = 'Enviando datos...'
  dialogConfirmacion.value = true

  // ✅ VERIFICAR: si aplica empresa, debe estar seleccionada
  if (showEmpresas.value && !empresaSeleccionada.value) {
    mensajeDialogo.value = '❌ Debe seleccionar una empresa para roles externos.'
    cargandoDialogo.value = false
    loadingEnroll.value = false
    return
  }

  const idRolConsent = (roles.value || []).find(r => r.name_rol === 'USR-CONSEN')?.id_rol
  const finalRoles = [...rolesSeleccionados.value]
  if (idRolConsent && !finalRoles.includes(idRolConsent)) {
    finalRoles.push(idRolConsent)
  }

  const data = {
    rut: rut.value,
    nombre: nombre.value,
    correo: correo.value,
    roles: finalRoles,
    // ✅ NUEVO: enviamos empresa solo si aplica
    id_empresa: showEmpresas.value ? empresaSeleccionada.value : null,
  }

  console.log('Enviando datos:', data)

  try {
    await apiAxios.post('/usuarios/inicioEnrolamiento/', data)
    mensajeDialogo.value = '✅ Enrolamiento completado correctamente.'
    emit('refresh') // por si quieres que el padre también aumente refreshKey
  } catch (error) {
    console.error(error?.response || error)
    mensajeDialogo.value = '❌ Error al completar el enrolamiento.'
  } finally {
    cargandoDialogo.value = false
    loadingEnroll.value = false
    await obtenerUsuarios()
    await obtenerUsuariosRoles()
  }
}

function abrirDialogEdicion(item) {
  usuarioSeleccionado.value = {
    ...item,
    rolesIds: rolesPorUsuario.value[item.id_user] || [],
  }
  dialogEditar.value = true
}

async function guardarUsuarioEditado(payload) {
  try {
    const body = {
      id_user: payload.id_user,
      email: payload.email || null,
      rut: payload.rut || null,
      name_frst: payload.name_frst || null,
      name_sec: payload.name_sec || null,
      apellido_pat: payload.apellido_pat || null,
      apellido_mat: payload.apellido_mat || null,
      movil: payload.movil || null,
      activo: payload.activo,
      roles: payload.rolesIds || [],
    }

    await apiAxios.post('/usuarios/updUsuario', body)

    await obtenerUsuarios()
    await obtenerUsuariosRoles()

    dialogEditar.value = false
    usuarioSeleccionado.value = null

    emit('refresh')
  } catch (error) {
    console.error('Error al actualizar usuario/roles', error?.response || error)
  }
}
</script>

<style scoped>
.tabla-container {
  overflow: auto;
}

:deep(.v-table th:nth-child(8)),
:deep(.v-table td:nth-child(8)) {
  white-space: nowrap;
}

.roles-cell {
  gap: 4px;
}

.icon-action {
  cursor: pointer;
}
</style>
