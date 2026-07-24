<template>
  <v-dialog
    :model-value="show"
    max-width="1100"
    scrollable
    @update:model-value="val => emit('update:show', val)"
  >
    <v-card>
      <!-- 🔵 HEADER IGUAL AL OTRO DIALOG -->
      <v-toolbar
        color="primary"
        dark
      >
        <v-toolbar-title>Editar Usuario</v-toolbar-title>
        <v-spacer />
        <v-btn
          icon
          @click="cerrar"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <!-- TEXTO SUPERIOR (OPCIONAL, TIPO "Se aplicará a X...") -->
      <v-card-text class="pt-6">
        <div
          v-if="localUser"
          class="mb-4 text-caption text-medium-emphasis"
        >
          Editando usuario <strong>#{{ localUser.id_user }}</strong>
          — {{ localUser.email || 'sin correo' }}
        </div>

        <v-row
          v-if="localUser"
          dense
        >
          <v-col
            cols="12"
            md="6"
          >
            <v-text-field
              v-model="localUser.email"
              label="Correo"
              variant="outlined"
              density="compact"
              hide-details="auto"
            />
          </v-col>

          <v-col
            cols="12"
            md="6"
          >
            <v-text-field
              v-model="localUser.rut"
              label="Rut"
              variant="outlined"
              density="compact"
              hide-details="auto"
            />
          </v-col>

          <v-col
            cols="12"
            md="6"
          >
            <v-text-field
              v-model="localUser.name_frst"
              label="Primer Nombre"
              variant="outlined"
              density="compact"
              hide-details="auto"
            />
          </v-col>

          <v-col
            cols="12"
            md="6"
          >
            <v-text-field
              v-model="localUser.name_sec"
              label="Segundo Nombre"
              variant="outlined"
              density="compact"
              hide-details="auto"
            />
          </v-col>

          <v-col
            cols="12"
            md="6"
          >
            <v-text-field
              v-model="localUser.apellido_pat"
              label="Apellido Paterno"
              variant="outlined"
              density="compact"
              hide-details="auto"
            />
          </v-col>

          <v-col
            cols="12"
            md="6"
          >
            <v-text-field
              v-model="localUser.apellido_mat"
              label="Apellido Materno"
              variant="outlined"
              density="compact"
              hide-details="auto"
            />
          </v-col>

          <v-col
            cols="12"
            md="6"
          >
            <v-text-field
              v-model="localUser.movil"
              label="Móvil"
              variant="outlined"
              density="compact"
              hide-details="auto"
            />
          </v-col>

          <v-col
            cols="12"
            md="6"
            class="d-flex align-center"
          >
            <v-switch
              v-model="localUser.activo"
              label="Usuario Activo"
              color="primary"
              hide-details
            />
          </v-col>

          <v-col cols="12">
            <v-divider class="my-4" />
            <div class="mb-2">
              <span class="text-subtitle-2 font-weight-bold text-primary">Información Adicional (RR.HH)</span>
            </div>
          </v-col>

          <v-col
            cols="12"
            md="6"
          >
            <v-select
              v-model="jsonData.cargo"
              :items="CARGOS_LIST"
              label="Cargo"
              variant="outlined"
              density="compact"
              hide-details="auto"
              clearable
            />
          </v-col>

          <v-col
            cols="12"
            md="3"
          >
            <v-select
              v-model="jsonData.genero"
              :items="[
                { title: 'Hombre', value: 'H' },
                { title: 'Mujer', value: 'M' }
              ]"
              label="Género"
              variant="outlined"
              density="compact"
              hide-details="auto"
            />
          </v-col>

          <v-col
            cols="12"
            md="3"
          >
            <v-text-field
              v-model="jsonData.fechaNacimiento"
              label="Fecha Nacimiento"
              type="date"
              variant="outlined"
              density="compact"
              hide-details="auto"
            />
          </v-col>

          <v-col cols="12">
            <RbacMatrixTable
              v-model="selectedRolesCodes"
              :roles-catalog="roles"
              :permissions="permisos"
            />
          </v-col>

          <!-- 🟠 PROYECTOS Y EQUIPOS -->
          <v-col cols="12">
            <v-divider class="my-4" />
            <div class="mb-4 d-flex align-center">
              <span class="text-subtitle-2 font-weight-bold text-primary">Pertenencia a Proyectos y Equipos</span>
              <v-spacer />
              <v-btn
                color="primary"
                variant="tonal"
                size="small"
                prepend-icon="mdi-plus"
                @click="agregarNuevaPertenencia"
              >
                Vincular a Proyecto/Equipo
              </v-btn>
            </div>

            <v-card
              v-if="pertenencias.length > 0"
              border
              flat
            >
              <v-table density="compact">
                <thead>
                  <tr>
                    <th>Proyecto</th>
                    <th>Equipo</th>
                    <th width="50px" />
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(p, i) in pertenencias"
                    :key="i"
                  >
                    <td>
                      <v-select
                        v-model="p.id_proyecto"
                        :items="proyectos"
                        item-title="nombre_proyecto"
                        item-value="id_proyecto"
                        variant="plain"
                        density="compact"
                        hide-details
                        @update:model-value="() => p.id_equipo_proyecto = null"
                      />
                    </td>
                    <td>
                      <v-select
                        v-model="p.id_equipo_proyecto"
                        :items="getEquiposDelProyecto(p.id_proyecto)"
                        item-title="nombre_equipo"
                        item-value="id_equipo_proyecto"
                        variant="plain"
                        density="compact"
                        hide-details
                        placeholder="Selecciona Equipo"
                      />
                    </td>
                    <td class="text-right">
                      <v-btn
                        icon="mdi-delete"
                        variant="text"
                        size="x-small"
                        color="error"
                        @click="pertenencias.splice(i, 1)"
                      />
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-card>
            <v-alert
              v-else
              type="info"
              variant="tonal"
              density="compact"
            >
              El usuario no tiene proyectos asignados actualmente.
            </v-alert>
          </v-col>
        </v-row>
      </v-card-text>

      <!-- FOOTER IGUAL ESTILO: CANCELAR + BOTÓN AZUL -->
      <v-card-actions class="justify-end">
        <v-btn
          variant="text"
          @click="cerrar"
        >
          CANCELAR
        </v-btn>

        <v-btn
          color="primary"
          @click="guardar"
        >
          <v-icon start>
            mdi-content-save
          </v-icon>
          GUARDAR
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import apiAxios from '@/services/api'
import RbacMatrixTable from './mantenedores/RbacMatrixTable.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  usuario: {
    type: Object,
    default: null
  },
  roles: {
    type: Array,
    default: () => []
  },
  permisos: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:show', 'guardar', 'abrir-matriz'])

const CARGOS_LIST = [
  'Administrador de Contrato de terreno',
  'Asistente Administrativo',
  'Encargado Adquisiones',
  'Encargado Calidad',
  'Encargado Control de Proyectos en terreno',
  'Encargado de Mantención y Logística',
  'Encargado en Prevención de Riesgos',
  'Encargado RR.HH',
  'Jefe de Terreno',
  'Lider en Prevencion de Riesgos',
  'Maestro Mayor Piping',
  'Maestro Primera',
  'Maestro Primera Piping',
  'Maestro Primera Rigger',
  'Operador Camión Pluma',
  'Operador de Maquinaria',
  'Operador de Terreno',
  'Operador Excavadora',
  'Prevencionista de Riesgos de Terreno (Pipping)',
  'Soldador Calificado',
  'Supervisor',
  'Supervisor Terreno',
  'Jefe Cuadrilla'
].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }))

const localUser = ref(null)
const selectedRolesCodes = ref([])
const jsonData = ref({
  cargo: null,
  genero: null,
  fechaNacimiento: null
})

const proyectos = ref([])
const equipos = ref([])
const pertenencias = ref([]) // { id_proyecto, id_equipo_proyecto }

// Roles que NO son RBAC (los guardamos para no perderlos al editar la matriz)
const nonRbacRolesIds = ref([])

function getRoleCode(r) {
  const raw = r?.codi_rol ?? r?.codigo ?? r?.code ?? r?.name_rol ?? ''
  return String(raw).trim()
}

// Inferir cuáles roles del catálogo son parte de la matriz RBAC
const rbacRoleCodeSet = computed(() => {
  const set = new Set()
  for (const p of props.permisos || []) {
    const modCode = inferModuleCodeFromText(p?.description)
    const fnCode = String(p?.code_perm || '').trim().toUpperCase()
    if (!modCode || !fnCode) continue
    set.add(`${modCode}_${fnCode}`)
  }
  return set
})

function inferModuleCodeFromText(text) {
  const s = String(text || '').toUpperCase()
  const m = s.match(/M[ÓO]DULO\s+([A-Z0-9_]+)/i)
  return m?.[1] ? String(m[1]).toUpperCase() : ''
}

const roleIdByCode = computed(() => {
  const map = new Map()
  for (const r of props.roles || []) {
    const code = getRoleCode(r).toUpperCase()
    if (code) map.set(code, Number(r.id_rol))
  }
  return map
})

/* ================= ACTIONS ================= */
async function cargarProyectosEquipos() {
  try {
    const [{ data: prjs }, { data: eqs }] = await Promise.all([
      apiAxios.get('/servicio/leanglobal/obtenerProyectos'),
      apiAxios.get('/servicio/leanglobal/obtenerEquiposProyectos')
    ])
    proyectos.value = Array.isArray(prjs) ? prjs : (prjs.data || [])
    equipos.value = Array.isArray(eqs) ? eqs : (eqs.data || [])
  } catch (err) {
    console.error('Error cargando proyectos/equipos en dialog', err)
  }
}

async function cargarPertenencia(uid) {
  if (!uid) return
  try {
    const { data } = await apiAxios.get(`/usuarios/${uid}/equipos`)
    pertenencias.value = (data.data || []).map(p => ({
      id_proyecto: p.id_proyecto,
      id_equipo_proyecto: p.id_equipo_proyecto
    }))
  } catch (err) {
    console.error('Error cargando pertenencia del usuario', err)
  }
}

function getEquiposDelProyecto(idPrj) {
  if (!idPrj) return []
  return equipos.value.filter(e => Number(e.id_proyecto) === Number(idPrj))
}

function agregarNuevaPertenencia() {
  pertenencias.value.push({ id_proyecto: null, id_equipo_proyecto: null })
}

onMounted(() => {
  cargarProyectosEquipos()
})

watch(
  () => [props.usuario, rbacRoleCodeSet.value.size],
  ([val]) => {
    if (val) {
      localUser.value = { ...val }
      
      const allIds = val.rolesIds || []
      const rbacCodes = []
      const nonRbacIds = []

      allIds.forEach(id => {
        const r = props.roles.find(x => Number(x.id_rol) === Number(id))
        if (!r) return
        
        const code = getRoleCode(r).toUpperCase()
        if (rbacRoleCodeSet.value.has(code)) {
          rbacCodes.push(code)
        } else {
          nonRbacIds.push(id)
        }
      })

      selectedRolesCodes.value = rbacCodes
      nonRbacRolesIds.value = nonRbacIds

      // ✅ Cargar json_data si existe
      try {
        const raw = val.json_data || {}
        const data = typeof raw === 'string' ? JSON.parse(raw) : raw
        jsonData.value = {
          cargo: data.cargo || null,
          genero: data.genero || null,
          fechaNacimiento: data.fechaNacimiento || null
        }
      } catch (e) {
        console.error('Error parseando json_data', e)
        jsonData.value = { cargo: null, genero: null, fechaNacimiento: null }
      }

      // ✅ Cargar pertenencia
      cargarPertenencia(val.id_user)
    } else {
      localUser.value = null
      selectedRolesCodes.value = []
      nonRbacRolesIds.value = []
      pertenencias.value = []
      jsonData.value = { cargo: null, genero: null, fechaNacimiento: null }
    }
  },
  { immediate: true }
)

function cerrar() {
  emit('update:show', false)
}

function guardar() {
  if (!localUser.value) return

  // Re-mapear códigos de matriz a IDs
  const rbacIds = selectedRolesCodes.value
    .map(c => roleIdByCode.value.get(c))
    .filter(id => id != null)

  // Combinar con los no-RBAC que ya tenía
  const finalRolesIds = Array.from(new Set([...nonRbacRolesIds.value, ...rbacIds]))

  emit('guardar', {
    ...localUser.value,
    rolesIds: finalRolesIds,
    json_data: { ...jsonData.value },
    teams: pertenencias.value
      .map(p => p.id_equipo_proyecto)
      .filter(id => id != null)
  })
}
</script>
