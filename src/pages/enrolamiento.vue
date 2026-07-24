<template>
  <DashboardLayout>
    <!-- CARD PRINCIPAL COMO EN LA FOTO -->
    <v-card class="mt-2 sombra-resaltada">
      <v-toolbar
        color="primary"
        dark
      >
        <v-toolbar-title>Enrolamiento</v-toolbar-title>
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
              :items="roles"
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

          <v-col
            cols="12"
            md="2"
          >
            <v-select
              v-if="showEmpresas"
              v-model="empresaSeleccionada"
              :items="empresasExternas"
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
            md="3"
            class="d-flex align-center justify-end"
          >
            <v-btn
              color="primary"
              @click="enviarIniciarEnrolamiento"
            >
              ENVIAR ENROLAMIENTO
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>

      <!-- TABLA USUARIOS -->
      <v-card-text class="pt-2">
        <div class="tabla-container">
          <v-table
            dense
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
                  Empresa
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
                v-for="item in usuarios"
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
                <td>{{ obtenerNombreEmpresa(item) }}</td>
                <td>{{ item.name_frst }}</td>
                <td>{{ item.name_sec }}</td>
                <td>{{ item.apellido_pat }}</td>
                <td>{{ item.apellido_mat }}</td>
                <td>{{ item.rut }}</td>
                <td>{{ item.movil }}</td>

                <!-- ✅ ACTIVO: TICKET VERDE / CRUZ ROJA -->
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

                <!-- ✅ SOLO FECHA (SIN HORA) -->
                <td>{{ formatearFecha(item.fecha_creacion) }}</td>
                <td>{{ formatearFecha(item.fecha_actualizacion) }}</td>

                <td>{{ item.codi_user }}</td>
                <td>{{ item.flag_proc_enrol ? 'Sí' : 'No' }}</td>

                <!-- ✅ Botón lápiz solo si es sup2 -->
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
    </v-card>

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
            @click="irAPantallaInicio"
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
  </DashboardLayout>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import DashboardLayout from '../layouts/dashboard.vue'
import apiAxios from '@/services/api';
import EditUsuarioDialog from '../components/EditUsuarioDialog.vue'
import { useUserDetailStore } from '@/stores/userDetail'

const userDetailStore = useUserDetailStore()

const rut = ref('')
const nombre = ref('')
const correo = ref('')

const emailRule = value =>
  /.+@.+\..+/.test(value) || 'Correo inválido'

watch(rut, (val) => {
  let v = String(val ?? '')
    .toUpperCase()
    // ⛔️ SOLO permite números y la letra K
    .replace(/[^0-9K]/g, '')

  // Máximo: 8 dígitos de cuerpo + 1 DV
  if (v.length > 9) v = v.slice(0, 9)

  // Si aún no hay DV, dejamos escribir normal
  if (v.length <= 1) {
    rut.value = v
    return
  }

  const cuerpo = v.slice(0, -1)
  const dv = v.slice(-1)

  rut.value = `${cuerpo}-${dv}`
})

const usuarios = ref([])
const usuariosRoles = ref([])
const roles = ref([])
const empresas = ref([])
const rolesSeleccionados = ref([])
const empresaSeleccionada = ref(null)
const loadingEmpresas = ref(false)

const cargandoDialogo = ref(false)
const mensajeDialogo = ref('Enviando datos...')
const dialogConfirmacion = ref(false)

const dialogEditar = ref(false)
const usuarioSeleccionado = ref(null)

// ✅ rol 11 = sup2
const hasRol11 = computed(() => {
  const uid = Number(userDetailStore.userDetail?.id_user)
  return usuariosRoles.value.some(
    r => Number(r.id_user) === uid && Number(r.id_rol) === 11
  )
})

const esSup2 = computed(() => hasRol11.value)

onMounted(async () => {
  await obtenerUsuarios()
  await obtenerRoles()
  await obtenerEmpresas()
  await obtenerUsuariosRoles()
})

const rolesSeleccionadosData = computed(() => {
  const ids = new Set((rolesSeleccionados.value || []).map(n => Number(n)))
  return (roles.value || []).filter(r => ids.has(Number(r.id_rol)))
})

const tieneRolExternoSeleccionado = computed(() => {
  return rolesSeleccionadosData.value.some(
    r => r.flag_externo === true || Number(r.flag_externo) === 1
  )
})

const showEmpresas = computed(() => tieneRolExternoSeleccionado.value)

const empresasExternas = computed(() =>
  (empresas.value || []).filter(
    e => e.flag_externo === true || Number(e.flag_externo) === 1
  )
)

const empresaById = computed(() => {
  const map = new Map()
  for (const e of empresas.value || []) {
    map.set(Number(e.id_empresa), e)
  }
  return map
})

const rolesPorUsuario = computed(() => {
  const map = {}
  ;(usuariosRoles.value || []).forEach(ur => {
    if (!map[ur.id_user]) {
      map[ur.id_user] = []
    }
    map[ur.id_user].push(ur.id_rol)
  })
  return map
})

watch(showEmpresas, async (visible) => {
  if (!visible) {
    empresaSeleccionada.value = null
    return
  }

  if (!empresas.value.length) {
    await obtenerEmpresas()
  }
})

function obtenerNombresRolesUsuario(id_user) {
  const idsRoles = rolesPorUsuario.value[id_user] || []
  return idsRoles
    .map(idRol => {
      const rol = roles.value.find(r => r.id_rol === idRol)
      return rol ? rol.name_rol : null
    })
    .filter(Boolean)
}

// ✅ helper para mostrar solo fecha
function formatearFecha(fecha) {
  if (!fecha) return ''
  return String(fecha).slice(0, 10) // yyyy-mm-dd
}

async function obtenerRoles() {
  await apiAxios
    .get(
      '/servicio/leanglobal/obtenerRoles'
    )
    .then(response => {
      roles.value = response.data
    })
    .catch(error => {
      console.log(error)
      console.error(error?.response)
    })
}

async function obtenerEmpresas() {
  loadingEmpresas.value = true
  await apiAxios
    .get('/servicio/leanglobal/obtenerEmpresas')
    .then(response => {
      const data = response.data
      empresas.value = Array.isArray(data) ? data : (Array.isArray(data?.datos) ? data.datos : [])
    })
    .catch(error => {
      console.log(error)
      console.error(error?.response)
      empresas.value = []
    })
    .finally(() => {
      loadingEmpresas.value = false
    })
}

async function obtenerUsuarios() {
  await apiAxios
    .get(
      '/servicio/leanglobal/obtenerUsuarios'
    )
    .then(response => {
      usuarios.value = (response.data || []).sort(
        (a, b) => b.id_user - a.id_user
      )
    })
    .catch(error => {
      console.log(error)
      console.error(error?.response)
    })
}

async function obtenerUsuariosRoles() {
  await apiAxios
    .get(
      '/servicio/leanglobal/obtenerUsuariosRoles'
    )
    .then(response => {
      usuariosRoles.value = response.data || []
    })
    .catch(error => {
      console.log(error)
      console.error(error?.response)
    })
}

function irAPantallaInicio() {
  dialogConfirmacion.value = false
}

async function enviarIniciarEnrolamiento() {
  cargandoDialogo.value = true
  mensajeDialogo.value = 'Enviando datos...'
  dialogConfirmacion.value = true

  if (showEmpresas.value && !empresaSeleccionada.value) {
    mensajeDialogo.value = '❌ Debe seleccionar una empresa para roles externos.'
    cargandoDialogo.value = false
    return
  }

  const data = {
    rut: rut.value,
    nombre: nombre.value,
    correo: correo.value,
    roles: rolesSeleccionados.value,
    id_empresa: showEmpresas.value ? empresaSeleccionada.value : null
  }

  try {
    const response = await apiAxios.post(
      '/usuarios/inicioEnrolamiento/',
      data
    )
    console.log('inicioEnrolamiento', response)
    mensajeDialogo.value = '✅ Enrolamiento completado correctamente.'
  } catch (error) {
    console.log(error)
    console.error(error?.response)
    mensajeDialogo.value = '❌ Error al completar el enrolamiento.'
  } finally {
    cargandoDialogo.value = false
    await obtenerUsuarios()
    await obtenerUsuariosRoles()
  }
}

function abrirDialogEdicion(item) {
  usuarioSeleccionado.value = {
    ...item,
    rolesIds: rolesPorUsuario.value[item.id_user] || []
  }
  dialogEditar.value = true
}

function obtenerNombreEmpresa(item) {
  const fromRow =
    item?.name_empresa ||
    item?.empresa ||
    item?.razon_social ||
    item?.nom_empresa
  if (fromRow) return fromRow

  const idEmpresa = Number(item?.id_empresa)
  if (Number.isFinite(idEmpresa) && idEmpresa > 0) {
    const emp = empresaById.value.get(idEmpresa)
    return emp?.name_empresa || emp?.empresa || emp?.razon_social || emp?.nom_empresa || '-'
  }
  return '-'
}

async function guardarUsuarioEditado(payload) {
  try {
    // Armamos el body que espera el servicio /updUsuario
    const body = {
      id_user: payload.id_user,
      email: payload.email || null,
      rut: payload.rut || null,
      name_frst: payload.name_frst || null,
      name_sec: payload.name_sec || null,
      apellido_pat: payload.apellido_pat || null,
      apellido_mat: payload.apellido_mat || null,
      movil: payload.movil || null,
      activo: payload.activo,          // boolean true/false
      roles: payload.rolesIds || []    // array de id_rol
    }

    await apiAxios.post(
      '/usuarios/updUsuario',
      body
    )

    // Refrescamos tablas
    await obtenerUsuarios()
    await obtenerUsuariosRoles()

    dialogEditar.value = false
    usuarioSeleccionado.value = null
  } catch (error) {
    console.error('Error al actualizar usuario/roles', error)
  }
}
</script>

<style scoped>
/* Columna Rut en una sola línea (ajusta índices si cambian) */
:deep(.v-table th:nth-child(9)),
:deep(.v-table td:nth-child(9)) {
  white-space: nowrap;
}

.roles-cell {
  gap: 4px;
}

.icon-action {
  cursor: pointer;
}
</style>
