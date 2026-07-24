<template>
  <div
    v-if="props.calidad"
    style="margin-bottom: 10px;"
  >
    Protocolos
  </div>
  <div
    v-else
    style="margin-bottom: 10px;"
  >
    Partes Diarios
  </div>
  <div v-if="props.seguridad">
    <v-row
      v-if="puedeCrear"
      dense
    >
      <v-col cols="2">
        <v-select
          v-model="areaSeleccionada"
          label="Area"
          :items="areas"
          variant="outlined"
          density="compact"
          bg-color="white"
          item-title="name_area"
          item-value="id_area"
          :disabled="bloquearArea"
          :clearable="!bloquearArea"
        />
      </v-col>

      <v-col cols="2">
        <v-select
          v-model="tipoSeleccionado"
          label="Familia"
          :items="tiposSurvey"
          variant="outlined"
          density="compact"
          bg-color="white"
          item-title="name_tipo_srv"
          item-value="id_tipo_srv"
        />
      </v-col>

      <v-col cols="2">
        <v-select
          v-model="templateSeleccionado"
          label="Protocolo"
          :items="templatesOptions"
          variant="outlined"
          density="compact"
          bg-color="white"
          item-title="name_template_srv"
          item-value="id_template"
          clearable
        />
      </v-col>

      <v-col cols="2">
        <v-select
          v-model="clienteSeleccionado"
          label="Cliente"
          :items="clientes"
          item-title="name_empresa"
          item-value="id_empresa"
          variant="outlined"
          density="compact"
          bg-color="white"
          clearable
        />
      </v-col>

      <v-col cols="2">
        <v-select
          v-model="proyectoSeleccionado"
          label="Proyecto"
          :items="proyectos"
          item-title="nombre_proyecto"
          item-value="id_proyecto"
          variant="outlined"
          density="compact"
          bg-color="white"
          clearable
        />
      </v-col>

      <v-col cols="2">
        <v-text-field
          v-model="fechaPlanInicio"
          label="Fecha Inicio Plan"
          type="date"
          density="compact"
          variant="outlined"
          hide-details
          bg-color="white"
          style="max-width: auto"
        />
      </v-col>

      <v-col cols="2">
        <v-text-field
          v-model="fechaPlanFin"
          label="Fecha Fin Plan"
          type="date"
          density="compact"
          variant="outlined"
          hide-details
          bg-color="white"
          style="max-width: auto"
        />
      </v-col>

      <v-col cols="3">
        <v-btn
          color="primary"
          :disabled="!puedeCrear"
          @click="crearSurvey"
        >
          Crear Inspección / Registro
        </v-btn>
      </v-col>
    </v-row>
  </div>

  <v-row dense>
    <v-col cols="12">
      <v-table
        dense
        class="card text-caption"
        :height="tableHeight"
        fixed-header
      >
        <thead>
          <tr>
            <th class="text-left">
              Id Registro
            </th>
            <th class="text-left">
              Familia
            </th>
            <th class="text-left">
              Nombre Registro
            </th>
            <th class="text-left">
              Código
            </th>
            <th class="text-left">
              Proyecto
            </th>
            <th class="text-left">
              Empresa Cliente
            </th>
            <th class="text-left">
              Fecha Inicio
            </th>
            <th class="text-left">
              Estado
            </th>
            <th class="text-center">
              Registro Subida
            </th>
            <th class="text-center">
              Informe
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="item in surveysConDocs"
            :key="item.id_survey"
            style="cursor: pointer;"
          >
            <td>{{ item.id_survey }}</td>

            <!-- Familia (ajusta el campo si en tu API se llama distinto) -->
            <td>{{ item.name_tipo_srv ?? '—' }}</td>

            <!-- Template -> Nombre Registro -->
            <td>{{ item.name_template_srv }}</td>

            <!-- Código -->
            <td>{{ item.codi_template_srv }}</td>

            <td>{{ item.nombre_proyecto }}</td>
            <td>{{ item.name_empresa_cliente }}</td>
            <td>{{ item.fecha_plan_ini }}</td>
            <td>{{ item.estado_srv }}</td>

            <!-- Doc (sin td anidado) -->
            <td style="text-align: center;">
              <template v-if="item.id_doc">
                <a
                  :href="`${ARCHIVO_BASE_URL}/archivo/terracon/${item.id_doc}`"
                  target="_blank"
                  rel="noopener"
                  title="Abrir PDF"
                  style="display:inline-flex;align-items:center;justify-content:center"
                >
                  <v-icon size="26">mdi-file-pdf-box</v-icon>
                </a>
              </template>
              <template v-else>
                —
              </template>
            </td>
            <td style="text-align: center;">
              <template v-if="item.url_doc_registro">
                <a
                  :href="item.url_doc_registro"
                  target="_blank"
                  rel="noopener"
                  title="Abrir archivo"
                  style="display:inline-flex;align-items:center;justify-content:center"
                >
                  <v-icon
                    color="green"
                    size="26"
                  >mdi-file-excel-box</v-icon>
                </a>
              </template>
              <template v-else>
                —
              </template>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-col>
  </v-row>

  <v-dialog
    v-model="showModal"
    max-width="1000"
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
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import apiAxios from '@/services/api'
import { useRouter } from 'vue-router'
import { useUserDetailStore } from "@/stores/userDetail"

const userDetailStore = useUserDetailStore()

const props = defineProps({
  fechaDesde: String,
  fechaHasta: String,
  clienteId: [String, Number],
  proyectoId: [String, Number],
  estadoSurvey: String,
  familiaSurvey: String,
  calidad: Boolean,
  seguimiento: Boolean,
  seguridad: Boolean
})

const ARCHIVO_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://servidor.leanglobal.cl'
const tableHeight = computed(() => (props.seguridad ? undefined : '280px'))

const router = useRouter()

const surveys = ref([])
const archivos = ref([])

const selectedSurveyId = ref(null)
const showModal = ref(false)

const surveysConDocs = ref([])

const rolesUsuario = ref([])   // obtenerUsuariosRoles
const rolesCatalogo = ref([])  // obtenerRoles (catálogo)

const ADMIN_CREADOR = 11

// data
const areas = ref([])
const tiposSurvey = ref([])
const templatesSurvey = ref([])
const clientes = ref([])
const proyectos = ref([])
const usuarios = ref([])
const usuariosFlow = ref([])

const areaSeleccionada = ref(null)
const tipoSeleccionado = ref(null)
const templateSeleccionado = ref(null)
const clienteSeleccionado = ref(null)
const proyectoSeleccionado = ref(null)
const usuarioSeleccionado = ref(null)

// fechas
const obtenerFechaHoy = () => new Date().toISOString().split('T')[0]
const fechaPlanInicio = ref(obtenerFechaHoy())
const fechaPlanFin = ref(obtenerFechaHoy())

function autoSelectSeguridad () {
  if (!props.seguridad) return
  if (!areaSeleccionada.value && (areas.value?.length || 0) > 0) {
    const seg =
      areas.value.find(a => /seguridad/i.test(String(a.name_area))) ||
      areas.value[0]
    areaSeleccionada.value = seg?.id_area ?? null
  }
}

const emit = defineEmits(['refresh-crear-inspeccion', 'surveyCreado'])

function notifyRefreshCrear () {
  emit('refresh-crear-inspeccion')
}

watch(() => props.seguridad, (val) => { if (val) autoSelectSeguridad() })

const sortByText = (arr, selector) =>
  [...(arr ?? [])].sort((a, b) =>
    String(selector(a) ?? '').localeCompare(String(selector(b) ?? ''), 'es', { sensitivity: 'base', numeric: true })
  )

const usuariosOrdenados = computed(() =>
  sortByText(
    (usuarios.value ?? []).filter(u => (u.nombre_user ?? '').trim().length > 0),
    u => u.nombre_user
  )
)

const usuariosFlowOrdenados = computed(() =>
  sortByText(
    (usuariosFlow.value ?? []).filter(u => (u.nombre_user ?? '').trim().length > 0),
    u => u.nombre_user
  )
)

// áreas
const obtenerAreas = async () => {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerAreas?id_empresa=2')
    areas.value = sortByText(data, x => x.name_area)

    if (props.calidad) autoSelectCalidad()
    else if (props.medioAmbiente) autoSelectMedioAmbiente()
    else if (props.seguridad) autoSelectSeguridad()
  } catch (err) {
    console.error('Error al obtener áreas:', err)
  }
}

watch(areaSeleccionada, (nuevoArea) => {
  if (nuevoArea) obtenerTipos(nuevoArea)
  else {
    tiposSurvey.value = []
    tipoSeleccionado.value = null
    templatesSurvey.value = []
    templateSeleccionado.value = null
  }
})

// tipos
const obtenerTipos = async (id_area) => {
  try {
    const { data } = await apiAxios.get(`/servicio/leanglobal/obtenerTipoTemplate?id_area=${id_area}&flag_personalizado=false`)
    tiposSurvey.value = sortByText(data, x => x.name_tipo_srv)

    if (props.medioAmbiente && (tiposSurvey.value?.length || 0) > 0) {
      const target = 'medio ambiente'
      let elegido = tiposSurvey.value.find(t => normalize(t.name_tipo_srv) === target)
      if (!elegido) elegido = tiposSurvey.value.find(t => normalize(t.name_tipo_srv).startsWith(target))
      if (!elegido) elegido = tiposSurvey.value.find(t => normalize(t.name_tipo_srv).includes(target))
      tipoSeleccionado.value = (elegido || tiposSurvey.value[0])?.id_tipo_srv ?? null
    } else {
      tipoSeleccionado.value = null
      templatesSurvey.value = []
    }
  } catch (err) {
    console.error('Error al obtener tipos:', err)
  }
}

watch(tipoSeleccionado, (nuevoTipo) => {
  if (nuevoTipo) obtenerTemplates(nuevoTipo)
  else {
    templatesSurvey.value = []
    templateSeleccionado.value = null
  }
})

// templates
const templatesOptions = computed(() => sortByText(templatesSurvey.value || [], x => x.name_template_srv))

const obtenerTemplates = async (id_tipo_srv) => {
  try {
    const { data } = await apiAxios.get(`/servicio/leanglobal/obtenerTemplates?id_tipo_srv=${id_tipo_srv}`)
    templatesSurvey.value = sortByText(data, x => x.name_template_srv)
  } catch (err) {
    console.error('Error al obtener templates:', err)
  }
}

// clientes/proyectos/usuarios
const obtenerClientes = async () => {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerEmpresas')
    clientes.value = sortByText(data, x => x.name_empresa)
  } catch (err) {
    console.error(err)
  }
}

watch(clienteSeleccionado, (nuevoCliente) => {
  if (nuevoCliente) obtenerProyectos(nuevoCliente)
  else proyectoSeleccionado.value = null
})

const obtenerProyectos = async (id_cliente) => {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerProyectos?id_empresa_cliente=' + (id_cliente || ''))
    proyectos.value = sortByText(data, x => x.nombre_proyecto)
  } catch (err) {
    console.error(err)
  }
}

const obtenerUsuarios = async () => {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerUsuarios')
    usuarios.value = data
    usuariosFlow.value = data
  } catch (err) {
    console.error(err)
  }
}

async function obtenerRolesCatalogo () {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerRoles')
    rolesCatalogo.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('obtenerRolesCatalogo error', e)
    rolesCatalogo.value = []
  }
}

async function obtenerUsuariosRoles () {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerUsuariosRoles')
    rolesUsuario.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('obtenerUsuariosRoles error', e)
    rolesUsuario.value = []
  }
}

const progRoleIds = computed(() => {
  return new Set(
    (rolesCatalogo.value ?? [])
      .filter(r => /_PROG$/i.test(String(r.name_rol || '').trim()))
      .map(r => Number(r.id_rol))
      .filter(Number.isFinite)
  )
})

const hasAnyProg = computed(() => {
  const uid = Number(userDetailStore.userDetail?.id_user)
  if (!uid) return false

  return (rolesUsuario.value ?? []).some(r =>
    Number(r.id_user) === uid && progRoleIds.value.has(Number(r.id_rol))
  )
})

const hasAdminCreador = computed(() => {
  const uid = Number(userDetailStore.userDetail?.id_user)
  if (!uid) return false

  return (rolesUsuario.value ?? []).some(r =>
    Number(r.id_user) === uid && Number(r.id_rol) === ADMIN_CREADOR
  )
})

// ✅ puede crear: admin creador (11) O cualquier _PROG
const puedeCrear = computed(() => {
  const can = hasAdminCreador.value || hasAnyProg.value
  const okCalidad = !!props.calidad       && can
  const okMA      = !!props.medioAmbiente && can
  const okSeg     = !!props.seguridad     && can
  const okSegui   = !!props.seguimiento   && can
  return okCalidad || okMA || okSeg || okSegui
})

defineExpose({
  getSurveys
})

onMounted(async () => {
  await Promise.all([obtenerRolesCatalogo(), obtenerUsuariosRoles()])
  await Promise.all([obtenerAreas(), obtenerClientes(), obtenerUsuarios()])
  await getSurveys()
})

watch(
  [() => props.fechaDesde, () => props.fechaHasta, () => props.clienteId, () => props.proyectoId, () => props.estadoSurvey, () => props.familiaSurvey],
  () => {
    console.log('🔄 Algún filtro cambió:', props.fechaDesde, props.fechaHasta, props.clienteId, props.proyectoId)
    getSurveys()
  }
)

function normalizeText(v) {
  return String(v ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

function abrirModalConSurvey(id) {
  console.log('Abrir modal para idInspeccion:', id)
  selectedSurveyId.value = id
  showModal.value = true
}

function irAlSurvey(id) {
  router.push(`/survey2?idInspeccion=${id}`)
}

async function getSurveys() {
  try {
    const respSurveys = await apiAxios.get(
      `/servicio/leanglobal/procesosSurveyV3` +
        `?fecha_desde=${props.fechaDesde}` +
        `&fecha_hasta=${props.fechaHasta}` +
        `&filtro=${props.clienteId ?? ''}` +
        `&secatrib=${props.proyectoId ?? ''}`
    )

    surveys.value = respSurveys.data.datos || []

    // Filtro por estado
    if (props.estadoSurvey != null && props.estadoSurvey !== '') {
      if (props.estadoSurvey === 'APROBADO' || props.estadoSurvey === 'RECHAZADO') {
        surveys.value = surveys.value.filter(s => s.estado_srv === props.estadoSurvey)
      } else {
        surveys.value = surveys.value.filter(
          s => s.estado_srv !== 'APROBADO' && s.estado_srv !== 'RECHAZADO'
        )
      }
    }

    if (props.calidad) {
      surveys.value = surveys.value.filter(s => s.id_area === 1)
    }

    if (props.familiaSurvey != null && props.familiaSurvey !== '') {
      const familiaNorm = normalizeText(props.familiaSurvey)
      surveys.value = surveys.value.filter(s => {
        const rowFam = normalizeText(s?.name_tipo_srv)
        return rowFam === familiaNorm || rowFam.includes(familiaNorm) || familiaNorm.includes(rowFam)
      })
    }

    if (props.seguimiento) {
      surveys.value = surveys.value.filter(s => s.id_area === 4)
    }

    if (props.seguridad) {
      surveys.value = surveys.value.filter(s => s.id_area === 2 && s.flag_registro == true)
    }

    // Orden descendente por id
    surveys.value.sort((a, b) => Number(b.id_survey) - Number(a.id_survey))

    const surveysConDetail = await Promise.all(
    surveys.value.map(async (s) => {
      try {
        const detail = await getSurvey(s.id_survey)

        const { id_doc_registro, url_doc_registro, nombre_doc_registro } =
          extraerDocRegistro(detail)

        return {
          ...s,
          id_doc_registro,       // ✅ numérico (1488)
          url_doc_registro,      // ✅ URL completa (https://servidor...)
          nombre_doc_registro,   // ✅ nombre original (xlsx)
        }
      } catch (e) {
        console.error('Error obteniendo detail', s.id_survey, e)
        return { ...s, id_doc_registro: null, url_doc_registro: '', nombre_doc_registro: '' }
      }
    })
  )

  surveysConDocs.value = surveysConDetail
  } catch (error) {
    console.error('Error al obtener surveys:', error)
  }
}

async function getSurvey(idSurvey) {
  const response = await apiAxios.get(
    `/servicio/leanglobal/procesosSurveyDetail?id_survey=${idSurvey}`
  )
  console.log('Detail survey obtenido:', response.data)
  return response.data
}

function extraerDocRegistro(detail) {
  const row = Array.isArray(detail) ? detail?.[0] : detail?.surveyDetail?.[0]
  const segmentos = row?.body_exec?.segmentos ?? []

  let archivos = []

  for (const seg of segmentos) {
    for (const a of (seg?.attributes ?? [])) {
      if (a?.type === 'fileUpload' && Array.isArray(a?.archivos) && a.archivos.length) {
        archivos = a.archivos
        // si quieres SOLO el primer fileUpload encontrado, descomenta:
        // break
      }
    }
    // if (archivos.length) break
  }

  const file = archivos?.at(-1) ?? null // último
  return {
    id_doc_registro: file?.id_doc ?? null,
    url_doc_registro: file?.url ?? '',
    nombre_doc_registro: file?.name ?? file?.nombre ?? '',
    archivo_registro: file ?? null,
  }
}

const crearSurvey = async () => {
  if (!tipoSeleccionado.value || !templateSeleccionado.value || !fechaPlanInicio.value || !fechaPlanFin.value) {
    console.error('Por favor, completa todos los campos requeridos.')
    return
  }
  if (!userDetailStore.userDetail?.id_user) {
    console.error("El ID de usuario no está disponible.")
    return
  }

  const tpl = templatesSurvey.value.find(t => t.id_template === templateSeleccionado.value) || {}

  const header_seed   = tpl.header_seed || {}
  const body_seed     = tpl.body_seed || []
  const approval_seed = tpl.approval_seed || {}
  const id_flow_tmpl  = tpl.id_flow_tmpl || null

  const idUser = props.medioAmbiente
    ? userDetailStore.userDetail.id_user
    : (usuarioSeleccionado.value ?? userDetailStore.userDetail.id_user)

  const data = {
    id_tipo_srv: tipoSeleccionado.value,
    id_template: templateSeleccionado.value,
    id_user: null,
    id_user_creacion: userDetailStore.userDetail.id_user,
    id_empresa_cliente: clienteSeleccionado.value,
    estado_srv: 'Pre Creado',
    header_seed: JSON.stringify(header_seed),
    body_seed: JSON.stringify(body_seed),
    approval_seed: JSON.stringify(approval_seed),
    header_exec: JSON.stringify(header_seed),
    body_exec: JSON.stringify(body_seed),
    approval_exec: JSON.stringify(approval_seed),
    fecha_plan_ini: fechaPlanInicio.value,
    fecha_plan_fin: fechaPlanFin.value,
    fecha_real_ini: null,
    fecha_real_fin: null,
    fecha_upload: null,
    latitud: null,
    longitud: null,
    id_proyecto: proyectoSeleccionado.value,
    id_flow_tmpl
  }

  try {
    const resp = await apiAxios.post('/survey/', data)

    if (props.medioAmbiente) {
      const creado =
        resp?.data?.datos?.[0] ||
        resp?.data?.survey ||
        (resp?.data && resp.data.id_survey ? resp.data : null)

      if (creado?.id_survey) {
        surveys.value = [creado]
        notifyRefreshCrear()
        emit('surveyCreado', {
          id: creado.id_survey,
          fechaDesde: fechaPlanInicio.value,
          fechaHasta: fechaPlanFin.value,
          clienteId: clienteSeleccionado.value ?? '',
          proyectoId: proyectoSeleccionado.value ?? ''
        })
      } else {
        await getSurveys({ onlyLast: true })
        notifyRefreshCrear()
        if (surveys.value?.[0]?.id_survey) {
          emit('surveyCreado', {
            id: surveys.value[0].id_survey,
            fechaDesde: fechaPlanInicio.value,
            fechaHasta: fechaPlanFin.value,
            clienteId: clienteSeleccionado.value ?? '',
            proyectoId: proyectoSeleccionado.value ?? ''
          })
        }
      }
    } else {
      await getSurveys()

      // ✅ AQUÍ (justo después de refrescar tu tabla)
      notifyRefreshCrear()

      if (surveys.value?.[0]?.id_survey) {
        emit('surveyCreado', {
          id: surveys.value[0].id_survey,
          fechaDesde: fechaPlanInicio.value,
          fechaHasta: fechaPlanFin.value,
          clienteId: clienteSeleccionado.value ?? '',
          proyectoId: proyectoSeleccionado.value ?? ''
        })
      }
    }
  } catch (error) {
    console.error('Error al crear el survey:', error)
  }
}
</script>

<style scoped>
.card {
  margin: 5px;
  padding: 5px;
  color: #757575;
  border-radius: 5px;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
              0 1px 5px 0 rgba(0, 0, 0, 0.12),
              0 3px 1px -2px rgba(0, 0, 0, 0.2);
}

.fixed-header thead th {
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
}
</style>
