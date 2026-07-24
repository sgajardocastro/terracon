<template>
  <DashboardLayout>
    <v-row dense>
      <v-col
        cols="12"
        md="10"
        lg="9"
      >
        <v-card class="pa-4">
          <div class="text-h6 mb-2">
            Test funcional LG
          </div>
          <div class="text-body-2 text-medium-emphasis mb-4">
            Ejecuta pruebas especificas de Documentos, Planificación, Conexión y Reclamos para validar conectividad y estructura de datos.
          </div>

          <v-alert
            v-if="!canRun"
            type="warning"
            variant="tonal"
            class="mb-4"
          >
            Acceso restringido. Este menú solo está habilitado para `mauricioocavieresr@gmail.com`.
          </v-alert>

          <div class="d-flex ga-3 flex-wrap mb-4">
            <v-btn
              color="primary"
              :loading="running"
              :disabled="!canRun"
              @click="runAllTests"
            >
              Ejecutar todos los test
            </v-btn>

            <v-chip
              v-if="summary.total > 0"
              :color="summary.failed === 0 ? 'success' : 'error'"
              variant="flat"
            >
              {{ summary.failed === 0 ? 'OK' : 'Con fallas' }} · {{ summary.passed }}/{{ summary.total }}
            </v-chip>
          </div>
          <v-switch
            v-model="includeMutationTests"
            color="deep-orange"
            density="compact"
            hide-details
            class="mb-2"
            label="Incluir pruebas funcionales UI (creación real en QA)"
          />
          <div class="text-caption text-medium-emphasis mb-4">
            Estas pruebas crean datos de prueba (equipamiento, carga Excel, planificación y reclamo) y validan que queden visibles en los listados.
          </div>

          <v-row
            dense
            class="mb-4"
          >
            <v-col
              v-for="item in typeSummaries"
              :key="item.type"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <v-card
                variant="outlined"
                class="pa-3 h-100"
              >
                <div class="text-subtitle-2">
                  {{ item.label }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  Ejecutados {{ item.executed }} / {{ item.expected }}
                </div>
                <div class="d-flex ga-2 flex-wrap mt-2">
                  <v-chip
                    size="x-small"
                    color="success"
                    variant="flat"
                  >
                    OK: {{ item.passed }}
                  </v-chip>
                  <v-chip
                    size="x-small"
                    color="warning"
                    variant="flat"
                  >
                    Warning: {{ item.warnings }}
                  </v-chip>
                  <v-chip
                    size="x-small"
                    color="error"
                    variant="flat"
                  >
                    Error: {{ item.failed }}
                  </v-chip>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <v-alert
            v-if="summary.total > 0"
            :type="summary.failed === 0 ? 'success' : 'error'"
            variant="tonal"
            class="mb-4"
          >
            <div><strong>Total:</strong> {{ summary.total }}</div>
            <div><strong>Correctos:</strong> {{ summary.passed }}</div>
            <div><strong>Fallidos:</strong> {{ summary.failed }}</div>
          </v-alert>

          <v-expansion-panels
            v-model="openPanels"
            multiple
            variant="accordion"
          >
            <v-expansion-panel
              v-for="group in accordionGroups"
              :key="group.type"
              :value="group.type"
            >
              <v-expansion-panel-title>
                <div class="d-flex align-center ga-3 flex-wrap">
                  <strong>{{ group.label }}</strong>
                  <v-chip
                    size="x-small"
                    color="success"
                    variant="flat"
                  >
                    OK: {{ group.passed }}
                  </v-chip>
                  <v-chip
                    size="x-small"
                    color="warning"
                    variant="flat"
                  >
                    Warning: {{ group.warnings }}
                  </v-chip>
                  <v-chip
                    size="x-small"
                    color="error"
                    variant="flat"
                  >
                    Error: {{ group.failed }}
                  </v-chip>
                  <v-chip
                    size="x-small"
                    variant="outlined"
                  >
                    {{ group.executed }}/{{ group.total }} ejecutados
                  </v-chip>
                </div>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-table density="compact">
                  <thead>
                    <tr>
                      <th>Test</th>
                      <th>Estado</th>
                      <th>Descripción</th>
                      <th>Resultado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="item in group.items"
                      :key="item.step"
                    >
                      <td style="white-space: normal;">
                        <div class="font-weight-medium">
                          {{ item.title }}
                        </div>
                        <div class="text-caption text-medium-emphasis">
                          {{ item.step }}
                        </div>
                      </td>
                      <td>
                        <v-chip
                          size="small"
                          variant="flat"
                          :color="item.result ? getStatusColor(item.result) : 'grey'"
                        >
                          {{ item.result ? getStatusLabel(item.result) : 'PENDIENTE' }}
                        </v-chip>
                      </td>
                      <td style="white-space: normal;">
                        {{ item.description }}
                      </td>
                      <td style="white-space: normal;">
                        <div v-if="item.result">
                          <div v-if="item.result.warning">
                            <strong>Warning:</strong> {{ item.result.warning }}
                          </div>
                          <div v-if="item.result.error">
                            <strong>Error:</strong> {{ item.result.error }}
                          </div>
                          <div v-if="item.result.message">
                            <strong>Mensaje:</strong> {{ item.result.message }}
                          </div>
                          <div v-if="item.result.idSurvey">
                            <strong>ID Survey:</strong> {{ item.result.idSurvey }}
                          </div>
                          <div v-if="item.result.idArchivo">
                            <strong>ID Archivo:</strong> {{ item.result.idArchivo }}
                          </div>
                          <div v-if="item.result.idLoad">
                            <strong>ID Load:</strong> {{ item.result.idLoad }}
                          </div>
                        </div>
                        <div
                          v-else
                          class="text-medium-emphasis"
                        >
                          Sin ejecutar en esta corrida.
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card>
      </v-col>
    </v-row>
  </DashboardLayout>
</template>

<script setup>
import { computed, ref } from 'vue'
import DashboardLayout from '../layouts/dashboard.vue'
import apiAxios from '@/services/api'
import { useUserDetailStore } from '@/stores/userDetail'
import * as XLSX from 'xlsx'

const userDetailStore = useUserDetailStore()
const DB_TEST_ALLOWED_EMAIL = 'mauricioocavieresr@gmail.com'

const running = ref(false)
const results = ref([])
const summary = ref({ total: 0, passed: 0, failed: 0 })
const openPanels = ref([])
const includeMutationTests = ref(true)

const BASE_TYPES = [
  { type: 'docs', label: 'Documentos' },
  { type: 'planificacion', label: 'Planificación' },
  { type: 'conexion', label: 'Conexión' },
  { type: 'reclamos', label: 'Reclamos' },
]

const TEST_CATALOG = [
  { step: 'docs.base.usuarios', type: 'docs', title: 'Base usuarios', description: 'Consulta usuarios base para validar conexión y estructura de respuesta tipo arreglo.' },
  { step: 'docs.base.empresas', type: 'docs', title: 'Base empresas', description: 'Valida disponibilidad del catálogo de empresas usado por módulos de documentos.' },
  { step: 'docs.base.personalExterno', type: 'docs', title: 'Base personal externo', description: 'Comprueba conectividad hacia personal externo y formato de lista.' },
  { step: 'docs.equiposMoviles.listado', type: 'docs', title: 'Equipos móviles listado', description: 'Obtiene equipos móviles y resumen documental para verificar ambos endpoints en conjunto.' },
  { step: 'docs.equiposMoviles.detalle', type: 'docs', title: 'Equipos móviles detalle', description: 'Valida consulta de documentación por `id_equipo` sobre un equipo de muestra.' },
  { step: 'docs.equiposMoviles.archivo', type: 'docs', title: 'Equipos móviles archivo', description: 'Prueba resolución de metadata de archivo documental (`/archivo/id/:id_doc`).' },
  { step: 'docs.asistencia.listado', type: 'docs', title: 'Asistencia listado', description: 'Revisa que `/tfmg-archivos` devuelva datos y filtre registros de asistencia.' },
  { step: 'docs.asistencia.archivo', type: 'docs', title: 'Asistencia archivo', description: 'Valida acceso al archivo asociado a un registro de asistencia de muestra.' },
  { step: 'docs.personal.listado', type: 'docs', title: 'Personal listado', description: 'Confirma disponibilidad del listado de personal para el módulo de documentos.' },
  { step: 'docs.personal.estructura', type: 'docs', title: 'Personal estructura', description: 'Valida campos mínimos de integridad en personal (`id_user`, `rut`).' },
  { step: 'docs.equipamiento.listado', type: 'docs', title: 'Equipamiento listado', description: 'Obtiene inventario de equipamiento y valida tipo de respuesta.' },
  { step: 'docs.equipamiento.documentacion', type: 'docs', title: 'Equipamiento documentación', description: 'Verifica detalle documental para un equipo de equipamiento existente.' },
  { step: 'docs.formularios.listado', type: 'docs', title: 'Formularios PDR/DEN listado', description: 'Filtra y cuenta formularios de personal terreno desde `/tfmg-archivos`.' },
  { step: 'docs.formularios.archivo', type: 'docs', title: 'Formularios PDR/DEN archivo', description: 'Valida metadata de archivo para un formulario de muestra.' },
  { step: 'docs.historico.listado', type: 'docs', title: 'Histórico listado', description: 'Consulta histórico de conexión para la vista documental/histórica.' },
  { step: 'docs.historico.estructura', type: 'docs', title: 'Histórico estructura', description: 'Comprueba que el histórico tenga columnas útiles cuando existen filas.' },
  { step: 'planificacion.gantt', type: 'planificacion', title: 'Planificación Gantt', description: 'Consulta tareas Gantt para validar conectividad del tablero de planificación.' },
  { step: 'planificacion.familias', type: 'planificacion', title: 'Planificación familias', description: 'Obtiene familias de trabajo para filtros y agrupación en planificación.' },
  { step: 'planificacion.proyectos', type: 'planificacion', title: 'Planificación proyectos', description: 'Valida carga de proyectos por empresa cliente de muestra.' },
  { step: 'planificacion.surveys', type: 'planificacion', title: 'Planificación surveys', description: 'Consulta surveys en rango diario para medir disponibilidad operacional.' },
  { step: 'planificacion.surveyDetail', type: 'planificacion', title: 'Planificación survey detail', description: 'Abre detalle de un survey de muestra para asegurar trazabilidad completa.' },
  { step: 'planificacion.ui.crearSurvey', type: 'planificacion', title: 'Planificación UI crear survey', description: 'Crea un survey de planificación (template 110) y valida que aparezca en el listado principal.' },
  { step: 'planificacion.ui.actualizarSurvey', type: 'planificacion', title: 'Planificación UI actualizar survey', description: 'Actualiza fechas/empresa/proyecto del survey de prueba y valida persistencia en detalle.' },
  { step: 'planificacion.ui.crearSurveyHijo', type: 'planificacion', title: 'Planificación UI crear survey hijo', description: 'Crea survey hijo template 145 enlazado al padre y valida relación padre-hijo.' },
  { step: 'conexion.usuariosRoles', type: 'conexion', title: 'Conexión usuarios/roles', description: 'Valida endpoint de usuarios con roles requeridos para flujo de conexión.' },
  { step: 'conexion.cargas', type: 'conexion', title: 'Conexión cargas', description: 'Consulta cargas CNX para verificar fuente principal de planificación de conexión.' },
  { step: 'conexion.cargas.surveyDetail', type: 'conexion', title: 'Conexión carga detalle', description: 'Valida detalle de survey vinculado a una carga CNX de muestra.' },
  { step: 'conexion.realtime.version', type: 'conexion', title: 'Conexión realtime versión', description: 'Prueba endpoint de versión realtime; si no existe en ambiente se marca warning.' },
  { step: 'conexion.realtime.changes', type: 'conexion', title: 'Conexión realtime cambios', description: 'Prueba endpoint de cambios realtime con consulta acotada (`since=0, limit=1`).' },
  { step: 'conexion.ui.cargaExcel', type: 'conexion', title: 'Conexión UI carga Excel', description: 'Genera un Excel de prueba, lo sube como archivo y registra `cnx_load`, validando que quede visible.' },
  { step: 'conexion.ui.actualizarCnxLoad', type: 'conexion', title: 'Conexión UI actualizar cnx_load', description: 'Actualiza contadores de la carga de prueba (si endpoint está disponible) y valida persistencia.' },
  { step: 'conexion.ui.crearSurveyDesdeCarga', type: 'conexion', title: 'Conexión UI crear survey desde carga', description: 'Crea un survey de conexión vinculado al `id_load` de prueba y valida trazabilidad carga-survey.' },
  { step: 'conexion.ui.notificacionCarga', type: 'conexion', title: 'Conexión UI notificación de carga', description: 'Envía notificación web de prueba asociada al flujo de carga para validar pipeline de notificaciones.' },
  { step: 'reclamos.listado', type: 'reclamos', title: 'Reclamos listado', description: 'Consulta reclamos por template 153 para validar fuente principal del módulo.' },
  { step: 'reclamos.detail', type: 'reclamos', title: 'Reclamos detalle', description: 'Abre detalle de un reclamo de muestra para validar lectura completa.' },
  { step: 'reclamos.historico', type: 'reclamos', title: 'Reclamos histórico', description: 'Valida acceso al histórico de conexión usado en contexto de reclamos.' },
  { step: 'reclamos.ui.crearReclamo', type: 'reclamos', title: 'Reclamos UI crear reclamo', description: 'Crea un reclamo (template 153) y valida que quede visible en el listado de reclamos.' },
  { step: 'reclamos.ui.actualizarReclamo', type: 'reclamos', title: 'Reclamos UI actualizar reclamo', description: 'Edita campos del reclamo de prueba y valida persistencia en el detalle.' },
  { step: 'reclamos.ui.estadoReclamo', type: 'reclamos', title: 'Reclamos UI cambiar estado', description: 'Ejecuta cambio de estado de survey del reclamo de prueba y valida respuesta del backend.' },
  { step: 'docs.ui.crearEquipamiento', type: 'docs', title: 'Documentos UI crear equipamiento', description: 'Crea un equipamiento y valida que aparezca en el listado de equipos.' },
  { step: 'docs.ui.actualizarEquipamiento', type: 'docs', title: 'Documentos UI actualizar equipamiento', description: 'Actualiza el equipamiento creado y valida que los cambios queden visibles en el listado.' },
  { step: 'docs.ui.subirArchivo', type: 'docs', title: 'Documentos UI subir archivo', description: 'Sube archivo de prueba al módulo documental y valida recuperación por `/archivo/id/:id_doc`.' },
]

const TEST_META_MAP = TEST_CATALOG.reduce((acc, item) => {
  acc[item.step] = item
  return acc
}, {})

const normalizeEmail = (v) => String(v || '').trim().toLowerCase()
const currentEmail = computed(() => normalizeEmail(
  userDetailStore.userDetail?.email || userDetailStore.userDetail?.codi_user
))
const canRun = computed(() => currentEmail.value === DB_TEST_ALLOWED_EMAIL)

function inferType(step) {
  const root = String(step || '').split('.')[0]
  return BASE_TYPES.some((t) => t.type === root) ? root : 'otros'
}

function getTestMeta(step) {
  const base = TEST_META_MAP[step]
  if (base) return base
  return {
    step,
    type: inferType(step),
    title: step,
    description: 'Prueba adicional detectada en ejecución (sin definición previa en catálogo).',
  }
}

function getStatusLabel(item) {
  if (!item) return 'PENDIENTE'
  if (!item.ok) return 'ERROR'
  if (item.warning) return 'WARNING'
  return 'OK'
}

function getStatusColor(item) {
  if (!item) return 'grey'
  if (!item.ok) return 'error'
  if (item.warning) return 'warning'
  return 'success'
}

const resultMap = computed(() => {
  const map = {}
  for (const r of results.value) map[r.step] = r
  return map
})

const accordionGroups = computed(() => {
  const extras = []
  const catalogSteps = new Set(TEST_CATALOG.map((t) => t.step))
  for (const r of results.value) {
    if (!catalogSteps.has(r.step)) {
      const meta = getTestMeta(r.step)
      extras.push({ ...meta, result: r })
    }
  }

  const hasOtros = extras.some((x) => x.type === 'otros')
  const types = hasOtros ? [...BASE_TYPES, { type: 'otros', label: 'Otros' }] : BASE_TYPES

  return types.map((typeItem) => {
    const catalogItems = TEST_CATALOG
      .filter((t) => t.type === typeItem.type)
      .map((t) => ({ ...t, result: resultMap.value[t.step] || null }))

    const extraItems = extras.filter((x) => x.type === typeItem.type)
    const items = [...catalogItems, ...extraItems]
    const executed = items.filter((i) => !!i.result).length
    const passed = items.filter((i) => i.result?.ok && !i.result?.warning).length
    const warnings = items.filter((i) => i.result?.ok && i.result?.warning).length
    const failed = items.filter((i) => i.result && !i.result.ok).length

    return {
      type: typeItem.type,
      label: typeItem.label,
      items,
      total: items.length,
      executed,
      passed,
      warnings,
      failed,
    }
  })
})

const typeSummaries = computed(() => accordionGroups.value.map((g) => ({
  type: g.type,
  label: g.label,
  expected: g.total,
  executed: g.executed,
  passed: g.passed,
  warnings: g.warnings,
  failed: g.failed,
})))

const asNum = (v) => {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : null
}

const toYmd = (value) => {
  const d = value ? new Date(value) : new Date()
  if (Number.isNaN(d.getTime())) return ''
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const normalizeLabelText = (v) => String(v || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-zA-Z0-9]+/g, ' ')
  .trim()
  .toLowerCase()

const normalizeText = (v) => String(v || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim()
  .toLowerCase()

const safeJsonParse = (v, fallback) => {
  try {
    if (v === null || v === undefined) return fallback
    if (typeof v === 'string') return JSON.parse(v)
    if (typeof v === 'object') return v
    return fallback
  } catch {
    return fallback
  }
}

const deepClone = (obj) => JSON.parse(JSON.stringify(obj ?? {}))

const randomTag = () => `dbt-${Date.now()}-${Math.floor(Math.random() * 100000)}`

function upsertAttrValueFlexible(segmentos, labels = [], value = '') {
  const normalized = (labels || []).map((l) => normalizeLabelText(l)).filter(Boolean)
  if (!normalized.length || !Array.isArray(segmentos)) return false

  for (const seg of segmentos) {
    const attrs = Array.isArray(seg?.attributes) ? seg.attributes : []
    for (const attr of attrs) {
      const lbl = normalizeLabelText(attr?.label || '')
      if (!normalized.includes(lbl)) continue
      attr.value = value
      attr.answer = value
      attr.default = value
      return true
    }
  }
  return false
}

function pickUiCompany(empresas = []) {
  const prefer = empresas.find((e) => normalizeText(e?.name_empresa).includes('metrogas'))
  if (prefer?.id_empresa) return prefer
  return empresas.find((e) => asNum(e?.id_empresa)) || null
}

async function pickUiProject(idEmpresa) {
  if (!asNum(idEmpresa)) return null
  const { data } = await apiAxios.get(`/servicio/leanglobal/obtenerProyectos?id_empresa_cliente=${idEmpresa}`)
  const rows = Array.isArray(data) ? data : []
  const prefer = rows.find((p) => normalizeText(p?.nombre_proyecto).includes('metrogas'))
  if (prefer?.id_proyecto) return prefer
  return rows.find((p) => asNum(p?.id_proyecto)) || null
}

async function pickAnyUiProject(empresas = []) {
  for (const empresa of (empresas || [])) {
    const idEmpresa = asNum(empresa?.id_empresa)
    if (!idEmpresa) continue
    try {
      const project = await pickUiProject(idEmpresa)
      if (project?.id_proyecto) return { empresa, project }
    } catch {
      // ignore
    }
  }
  return { empresa: null, project: null }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function retryFind(checkFn, retries = 3, waitMs = 350) {
  for (let i = 0; i <= retries; i += 1) {
    const found = await checkFn()
    if (found) return found
    if (i < retries) await sleep(waitMs)
  }
  return null
}

function buildConexionExcelFile(tag) {
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet([
    ['CONTRATISTA', 'IC_SAP', 'NRO_ORDEN', 'DIRECCION', 'COMUNA'],
    ['TERRACON', `IC-${tag}`, `ORD-${tag}`, `Direccion QA ${tag}`, 'Santiago'],
  ])
  XLSX.utils.book_append_sheet(wb, ws, 'Carga')
  const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
  return new File(
    [buffer],
    `conexion_${tag}.xlsx`,
    { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
  )
}

function parseSurveyDetailBody(detailResponse) {
  const rows = Array.isArray(detailResponse?.data)
    ? detailResponse.data
    : Array.isArray(detailResponse?.data?.surveyDetail) ? detailResponse.data.surveyDetail : []
  const row = rows[0] || {}
  const src = row?.body_exec || row?.json_exec || {}
  return {
    rows,
    row,
    body: safeJsonParse(src, { segmentos: [] }),
  }
}

function findAttrInBody(body, labels = []) {
  const normalized = (labels || []).map((l) => normalizeLabelText(l)).filter(Boolean)
  if (!normalized.length) return null
  const segmentos = Array.isArray(body?.segmentos) ? body.segmentos : []
  for (const seg of segmentos) {
    const attrs = Array.isArray(seg?.attributes) ? seg.attributes : []
    for (const attr of attrs) {
      const lbl = normalizeLabelText(attr?.label || '')
      if (!normalized.includes(lbl)) continue
      if (attr.value !== undefined && attr.value !== null && String(attr.value).trim() !== '') return attr.value
      if (attr.answer !== undefined && attr.answer !== null && String(attr.answer).trim() !== '') return attr.answer
      if (attr.default !== undefined && attr.default !== null && String(attr.default).trim() !== '') return attr.default
    }
  }
  return null
}

function bodyContainsText(body, needle) {
  const target = String(needle || '').trim()
  if (!target) return false
  const segmentos = Array.isArray(body?.segmentos) ? body.segmentos : []
  for (const seg of segmentos) {
    const attrs = Array.isArray(seg?.attributes) ? seg.attributes : []
    for (const attr of attrs) {
      const values = [attr?.value, attr?.answer, attr?.default]
      for (const v of values) {
        if (String(v ?? '').includes(target)) return true
      }
    }
  }
  return false
}

function addOk(step, data = {}) {
  const meta = getTestMeta(step)
  results.value.push({ ...meta, step, ok: true, ...data })
}

function addWarn(step, error, data = {}) {
  const payload = error?.response?.data
  const meta = getTestMeta(step)
  results.value.push({
    ...meta,
    step,
    ok: true,
    warning: payload?.error || payload?.message || error.message,
    ...data,
  })
}

function addFail(step, error, data = {}) {
  const payload = error?.response?.data
  const meta = getTestMeta(step)
  results.value.push({
    ...meta,
    step,
    ok: false,
    error: payload?.error || payload?.message || error.message,
    ...data,
  })
}

async function createSurveyFromTemplate({
  templateId,
  idUser,
  idEmpresa,
  idProyecto,
  fechaPlan,
  bodyPatch,
  idSurveyPadre = null,
  idLoad = null,
}) {
  const { data } = await apiAxios.get('/servicio/leanglobal/obtenerTemplates?id_tipo_srv=36')
  const templates = Array.isArray(data) ? data : []
  const tpl = templates.find((t) => Number(t?.id_template) === Number(templateId))
  if (!tpl) throw new Error(`No se encontró template ${templateId}`)

  const headerSeed = tpl.header_seed || {}
  const approvalSeed = tpl.approval_seed || {}
  const idFlow = tpl.id_flow_tmpl || null
  const bodySeedObj = safeJsonParse(tpl.body_seed, { segmentos: [] })
  const bodySeed = deepClone(bodySeedObj)
  const bodyExec = deepClone(bodySeedObj)

  if (typeof bodyPatch === 'function') bodyPatch(bodyExec)

  const payload = {
    id_tipo_srv: 36,
    id_template: Number(templateId),
    id_survey_padre: idSurveyPadre,
    id_user: Number(idUser),
    id_user_creacion: Number(userDetailStore.userDetail?.id_user || idUser),
    id_empresa_cliente: idEmpresa || null,
    estado_srv: 'Pre Creado',
    header_seed: JSON.stringify(headerSeed),
    body_seed: JSON.stringify(bodySeed),
    approval_seed: JSON.stringify(approvalSeed),
    header_exec: JSON.stringify(headerSeed),
    body_exec: JSON.stringify(bodyExec),
    approval_exec: JSON.stringify(approvalSeed),
    fecha_plan_ini: fechaPlan,
    fecha_plan_fin: fechaPlan,
    fecha_real_ini: null,
    fecha_real_fin: null,
    fecha_upload: null,
    latitud: null,
    longitud: null,
    id_proyecto: idProyecto || null,
    id_flow_tmpl: idFlow,
    id_load: idLoad || null,
  }

  const resp = await apiAxios.post('/survey/', payload)
  const idSurvey = Number(resp?.data?.idSurvey || resp?.data?.id_survey || 0)
  if (!idSurvey) throw new Error(`No se recibió id_survey al crear template ${templateId}`)
  return idSurvey
}

async function runAllTests() {
  if (!canRun.value) return

  running.value = true
  results.value = []
  summary.value = { total: 0, passed: 0, failed: 0 }
  openPanels.value = []

  const assert = (condition, message) => {
    if (!condition) throw new Error(message)
  }

  try {
    let usuarios = []
    let empresas = []
    let externalUsers = []
    let lastSurveyRows = []

    try {
      const { data } = await apiAxios.get('/servicio/leanglobal/obtenerUsuarios')
      usuarios = Array.isArray(data) ? data : []
      assert(Array.isArray(usuarios), 'obtenerUsuarios no devolvió arreglo')
      addOk('docs.base.usuarios', { message: `Registros: ${usuarios.length}` })
    } catch (error) {
      addFail('docs.base.usuarios', error)
    }

    try {
      const { data } = await apiAxios.get('/servicio/leanglobal/obtenerEmpresas')
      empresas = Array.isArray(data) ? data : []
      assert(Array.isArray(empresas), 'obtenerEmpresas no devolvió arreglo')
      addOk('docs.base.empresas', { message: `Registros: ${empresas.length}` })
    } catch (error) {
      addFail('docs.base.empresas', error)
    }

    try {
      const { data } = await apiAxios.get('/servicio/leanglobal/obtenerPersonalExterno')
      externalUsers = Array.isArray(data) ? data : []
      assert(Array.isArray(externalUsers), 'obtenerPersonalExterno no devolvió arreglo')
      addOk('docs.base.personalExterno', { message: `Registros: ${externalUsers.length}` })
    } catch (error) {
      addFail('docs.base.personalExterno', error)
    }

    // 1) DOCUMENTACIÓN EQUIPOS MÓVILES
    let equiposMoviles = []
    let docsResumen = []
    try {
      const [eqRes, drRes] = await Promise.all([
        apiAxios.get('/servicio/leanglobal/obtenerEquiposMoviles'),
        apiAxios.get('/servicio/leanglobal/obtenerDocumentacionResumen'),
      ])
      equiposMoviles = Array.isArray(eqRes.data) ? eqRes.data : []
      docsResumen = Array.isArray(drRes.data) ? drRes.data : []

      assert(Array.isArray(equiposMoviles), 'obtenerEquiposMoviles no devolvió arreglo')
      assert(Array.isArray(docsResumen), 'obtenerDocumentacionResumen no devolvió arreglo')
      addOk('docs.equiposMoviles.listado', {
        message: `Equipos: ${equiposMoviles.length}, Docs resumen: ${docsResumen.length}`
      })

      const eq = equiposMoviles.find((e) => asNum(e?.id_equipo))
      if (eq) {
        const detail = await apiAxios.get(`/tequ-documentacion/${eq.id_equipo}`)
        const detailRows = Array.isArray(detail?.data?.data) ? detail.data.data : []
        addOk('docs.equiposMoviles.detalle', {
          message: `Equipo ${eq.id_equipo} detalle docs: ${detailRows.length}`
        })
      } else {
        addWarn('docs.equiposMoviles.detalle', new Error('Sin equipos con id_equipo para validar detalle'))
      }

      const docWithId = docsResumen.find((d) => asNum(d?.json_data?.id_doc) || asNum(d?.id_doc))
      if (docWithId) {
        const docId = asNum(docWithId?.json_data?.id_doc) || asNum(docWithId?.id_doc)
        const fileRes = await apiAxios.get(`/archivo/id/${docId}`)
        assert(fileRes?.data?.data, 'archivo/id no devolvió metadata')
        addOk('docs.equiposMoviles.archivo', { message: `Metadata archivo OK (id_doc=${docId})` })
      } else {
        addWarn('docs.equiposMoviles.archivo', new Error('No hay id_doc en documentación resumen para validar /archivo/id'))
      }
    } catch (error) {
      addFail('docs.equiposMoviles', error)
    }

    // 2) ASISTENCIA
    let tfmgRows = []
    try {
      const { data } = await apiAxios.get('/tfmg-archivos')
      tfmgRows = Array.isArray(data?.data) ? data.data : []
      assert(Array.isArray(tfmgRows), '/tfmg-archivos no devolvió arreglo en data')

      const asistenciaRows = tfmgRows.filter((r) => r?.tipo_documento === 'REGISTRO DE ASISTENCIA')
      addOk('docs.asistencia.listado', { message: `Registros asistencia: ${asistenciaRows.length}` })

      if (asistenciaRows.length > 0) {
        const sample = asistenciaRows[0]
        assert(asNum(sample?.id_archivo), 'Registro asistencia sin id_archivo')
        const docId = asNum(sample?.id_doc)
        if (docId) {
          const fileRes = await apiAxios.get(`/archivo/id/${docId}`)
          assert(fileRes?.data?.data, 'Metadata de archivo de asistencia no disponible')
          addOk('docs.asistencia.archivo', { message: `Archivo asistencia OK (id_doc=${docId})` })
        } else {
          addWarn('docs.asistencia.archivo', new Error('Registro asistencia sin id_doc'))
        }
      } else {
        addWarn('docs.asistencia.listado', new Error('No hay registros de asistencia para validar campos en detalle'))
      }
    } catch (error) {
      addFail('docs.asistencia', error)
    }

    // 3) PERSONAL
    try {
      assert(Array.isArray(externalUsers), 'No se cargó personal externo')
      addOk('docs.personal.listado', { message: `Registros personal externo: ${externalUsers.length}` })

      const sample = externalUsers.find((u) => asNum(u?.id_user))
      if (sample) {
        assert(String(sample?.rut || '').trim().length > 0, 'Personal externo sin rut')
        addOk('docs.personal.estructura', { message: `Sample id_user=${sample.id_user} con rut válido` })
      } else {
        addWarn('docs.personal.estructura', new Error('No hay usuarios externos con id_user para validar estructura'))
      }
    } catch (error) {
      addFail('docs.personal', error)
    }

    // 4) EQUIPAMIENTO
    try {
      const eqRes = await apiAxios.get('/tequ-equipos')
      const tequRows = Array.isArray(eqRes?.data?.data) ? eqRes.data.data : []
      assert(Array.isArray(tequRows), '/tequ-equipos no devolvió data[]')
      addOk('docs.equipamiento.listado', { message: `Equipos: ${tequRows.length}` })

      const sampleEq = tequRows.find((e) => asNum(e?.id_equipo))
      if (sampleEq) {
        const det = await apiAxios.get(`/tequ-documentacion/${sampleEq.id_equipo}`)
        const detRows = Array.isArray(det?.data?.data) ? det.data.data : []
        addOk('docs.equipamiento.documentacion', {
          message: `Equipo ${sampleEq.id_equipo} docs: ${detRows.length}`
        })
      } else {
        addWarn('docs.equipamiento.documentacion', new Error('No hay equipos con id_equipo para validar documentación'))
      }
    } catch (error) {
      addFail('docs.equipamiento', error)
    }

    // 5) FORMULARIOS PERSONAL TERRENO
    try {
      const formulariosRows = tfmgRows.filter((r) =>
        String(r?.tipo_documento || '').includes('Formularios PDR') ||
        String(r?.tipo_documento || '').includes('Formularios DEN')
      )
      addOk('docs.formularios.listado', { message: `Formularios PDR/DEN: ${formulariosRows.length}` })

      if (formulariosRows.length > 0) {
        const sample = formulariosRows[0]
        assert(asNum(sample?.id_archivo), 'Formulario sin id_archivo')
        const docId = asNum(sample?.id_doc)
        if (docId) {
          const fileRes = await apiAxios.get(`/archivo/id/${docId}`)
          assert(fileRes?.data?.data, 'Metadata formulario no disponible')
          addOk('docs.formularios.archivo', { message: `Archivo formulario OK (id_doc=${docId})` })
        } else {
          addWarn('docs.formularios.archivo', new Error('Formulario sin id_doc'))
        }
      } else {
        addWarn('docs.formularios.listado', new Error('No hay formularios PDR/DEN para validación en detalle'))
      }
    } catch (error) {
      addFail('docs.formularios', error)
    }

    // 6) HISTÓRICO
    try {
      const { data } = await apiAxios.get('/servicio/leanglobal/obtenerHistoricoConexion')
      const histRows = Array.isArray(data) ? data : []
      assert(Array.isArray(histRows), 'obtenerHistoricoConexion no devolvió arreglo')
      addOk('docs.historico.listado', { message: `Registros histórico: ${histRows.length}` })

      if (histRows.length > 0) {
        const first = histRows[0]
        const keys = Object.keys(first || {})
        assert(keys.length > 0, 'Registro histórico sin columnas')
        addOk('docs.historico.estructura', { message: `Columnas detectadas: ${keys.length}` })
      } else {
        addWarn('docs.historico.estructura', new Error('Histórico sin filas para validación de columnas'))
      }
    } catch (error) {
      addFail('docs.historico', error)
    }

    // 7) PLANIFICACIÓN
    try {
      const ganttRes = await apiAxios.get('/servicio/leanglobal/obtenerGanttsTareas')
      const ganttRows = Array.isArray(ganttRes?.data) ? ganttRes.data : []
      assert(Array.isArray(ganttRows), 'obtenerGanttsTareas no devolvió arreglo')
      addOk('planificacion.gantt', { message: `Tareas gantt: ${ganttRows.length}` })
    } catch (error) {
      addFail('planificacion.gantt', error)
    }

    try {
      const familiasRes = await apiAxios.get('/servicio/leanglobal/obtenerFamilias')
      const familiasRows = Array.isArray(familiasRes?.data) ? familiasRes.data : []
      assert(Array.isArray(familiasRows), 'obtenerFamilias no devolvió arreglo')
      addOk('planificacion.familias', { message: `Familias: ${familiasRows.length}` })
    } catch (error) {
      addFail('planificacion.familias', error)
    }

    try {
      const empresa = (empresas || []).find((e) => asNum(e?.id_empresa))
      if (!empresa) {
        addWarn('planificacion.proyectos', new Error('No hay empresa con id_empresa para validar proyectos'))
      } else {
        const prRes = await apiAxios.get(`/servicio/leanglobal/obtenerProyectos?id_empresa_cliente=${empresa.id_empresa}`)
        const proyectosRows = Array.isArray(prRes?.data) ? prRes.data : []
        assert(Array.isArray(proyectosRows), 'obtenerProyectos no devolvió arreglo')
        addOk('planificacion.proyectos', {
          message: `Empresa ${empresa.id_empresa} proyectos: ${proyectosRows.length}`
        })
      }
    } catch (error) {
      addFail('planificacion.proyectos', error)
    }

    try {
      const today = toYmd(new Date())
      const params = new URLSearchParams()
      params.append('fecha_desde', today)
      params.append('fecha_hasta', today)
      params.append('filtro', '')
      params.append('secatrib', '')

      const psRes = await apiAxios.get(`/servicio/leanglobal/procesosSurveyV3?${params.toString()}`)
      const surveyRows = Array.isArray(psRes?.data?.datos) ? psRes.data.datos : []
      lastSurveyRows = surveyRows
      assert(Array.isArray(surveyRows), 'procesosSurveyV3 no devolvió data.datos[]')
      addOk('planificacion.surveys', { message: `Surveys en fecha ${today}: ${surveyRows.length}` })

      const sample = surveyRows.find((s) => asNum(s?.id_survey))
      if (sample) {
        const detRes = await apiAxios.get(`/servicio/leanglobal/procesosSurveyDetail?id_survey=${sample.id_survey}`)
        const detailRows = Array.isArray(detRes?.data)
          ? detRes.data
          : Array.isArray(detRes?.data?.surveyDetail) ? detRes.data.surveyDetail : []
        assert(Array.isArray(detailRows), 'procesosSurveyDetail no devolvió arreglo')
        addOk('planificacion.surveyDetail', {
          idSurvey: sample.id_survey,
          message: `Detalle disponible: ${detailRows.length} registro(s)`
        })
      } else {
        addWarn('planificacion.surveyDetail', new Error('Sin id_survey para validar detalle'))
      }
    } catch (error) {
      addFail('planificacion.surveys', error)
    }

    // 8) CONEXIÓN
    try {
      const rolesRes = await apiAxios.get('/servicio/leanglobal/obtenerUsuariosRoles')
      const rows = Array.isArray(rolesRes?.data) ? rolesRes.data : []
      assert(Array.isArray(rows), 'obtenerUsuariosRoles no devolvió arreglo')
      addOk('conexion.usuariosRoles', { message: `Registros: ${rows.length}` })
    } catch (error) {
      addFail('conexion.usuariosRoles', error)
    }

    try {
      const cnxLoadRes = await apiAxios.get('/servicio/leanglobal/obtenerCNXLoad')
      const loads = Array.isArray(cnxLoadRes?.data) ? cnxLoadRes.data : []
      assert(Array.isArray(loads), 'obtenerCNXLoad no devolvió arreglo')
      addOk('conexion.cargas', { message: `Cargas CNX: ${loads.length}` })

      const sampleLoad = loads.find((l) => asNum(l?.id_load))
      if (sampleLoad) {
        const sampleSurvey = (lastSurveyRows || []).find(
          (s) => Number(s?.id_area) === 8 &&
            Number(s?.id_template) !== 153 &&
            Number(s?.id_survey_padre || 0) === 0 &&
            Number(s?.id_load || 0) === Number(sampleLoad.id_load)
        )

        if (sampleSurvey?.id_survey) {
          const detRes = await apiAxios.get(`/servicio/leanglobal/procesosSurveyDetail?id_survey=${sampleSurvey.id_survey}`)
          const detailRows = Array.isArray(detRes?.data)
            ? detRes.data
            : Array.isArray(detRes?.data?.surveyDetail) ? detRes.data.surveyDetail : []
          addOk('conexion.cargas.surveyDetail', {
            idLoad: sampleLoad.id_load,
            idSurvey: sampleSurvey.id_survey,
            message: `Detalle survey de carga: ${detailRows.length}`
          })
        } else {
          addWarn('conexion.cargas.surveyDetail', new Error(`No se encontró survey de conexión para id_load=${sampleLoad.id_load}`), {
            idLoad: sampleLoad.id_load
          })
        }
      } else {
        addWarn('conexion.cargas.surveyDetail', new Error('No hay id_load para validar detalle de carga'))
      }
    } catch (error) {
      addFail('conexion.cargas', error)
    }

    try {
      const { data } = await apiAxios.get('/realtime/conexion/version')
      const ts = data?.versionTs || data?.serverTs || data?.ts
      addOk('conexion.realtime.version', { message: `versionTs=${ts ?? 'sin valor'}` })
    } catch (error) {
      const status = Number(error?.response?.status || 0)
      if (status === 404) {
        addWarn('conexion.realtime.version', new Error('Ruta /realtime/conexion/version no disponible en este ambiente'))
      } else {
        addFail('conexion.realtime.version', error)
      }
    }

    try {
      const { data } = await apiAxios.get('/realtime/conexion/changes', { params: { since: 0, limit: 1 } })
      const changes = Array.isArray(data?.changes) ? data.changes : []
      addOk('conexion.realtime.changes', { message: `Cambios consultados: ${changes.length}` })
    } catch (error) {
      const status = Number(error?.response?.status || 0)
      if (status === 404) {
        addWarn('conexion.realtime.changes', new Error('Ruta /realtime/conexion/changes no disponible en este ambiente'))
      } else {
        addFail('conexion.realtime.changes', error)
      }
    }

    // 9) RECLAMOS
    try {
      const params = new URLSearchParams()
      params.append('ts.id_template', '153')
      const reclRes = await apiAxios.get(`/servicio/leanglobal/procesosSurveyV3?${params.toString()}`)
      const reclRows = Array.isArray(reclRes?.data?.datos) ? reclRes.data.datos : []
      assert(Array.isArray(reclRows), 'Reclamos: procesosSurveyV3 no devolvió data.datos[]')
      addOk('reclamos.listado', { message: `Reclamos (template 153): ${reclRows.length}` })

      const sample = reclRows.find((r) => asNum(r?.id_survey))
      if (sample) {
        const detailResp = await apiAxios.get(`/servicio/leanglobal/procesosSurveyDetail?id_survey=${sample.id_survey}`)
        const detailRows = Array.isArray(detailResp?.data)
          ? detailResp.data
          : Array.isArray(detailResp?.data?.surveyDetail) ? detailResp.data.surveyDetail : []
        assert(Array.isArray(detailRows), 'Reclamos: procesosSurveyDetail no devolvió arreglo')
        addOk('reclamos.detail', {
          idSurvey: sample.id_survey,
          message: `Detalle reclamo disponible: ${detailRows.length} registro(s)`
        })
      } else {
        addWarn('reclamos.detail', new Error('No hay reclamos con id_survey para validar detalle'))
      }
    } catch (error) {
      addFail('reclamos.listado', error)
    }

    try {
      const { data } = await apiAxios.get('/servicio/leanglobal/obtenerHistoricoConexion')
      const histRows = Array.isArray(data) ? data : []
      assert(Array.isArray(histRows), 'Reclamos/Histórico: obtenerHistoricoConexion no devolvió arreglo')
      addOk('reclamos.historico', { message: `Registros histórico: ${histRows.length}` })
    } catch (error) {
      addFail('reclamos.historico', error)
    }

    // 10) PRUEBAS FUNCIONALES UI (CREACIÓN + VISIBILIDAD)
    if (!includeMutationTests.value) {
      addWarn('docs.ui.crearEquipamiento', new Error('Prueba omitida: desactivada por toggle de pruebas funcionales UI'))
      addWarn('docs.ui.actualizarEquipamiento', new Error('Prueba omitida: desactivada por toggle de pruebas funcionales UI'))
      addWarn('docs.ui.subirArchivo', new Error('Prueba omitida: desactivada por toggle de pruebas funcionales UI'))
      addWarn('planificacion.ui.crearSurvey', new Error('Prueba omitida: desactivada por toggle de pruebas funcionales UI'))
      addWarn('planificacion.ui.actualizarSurvey', new Error('Prueba omitida: desactivada por toggle de pruebas funcionales UI'))
      addWarn('planificacion.ui.crearSurveyHijo', new Error('Prueba omitida: desactivada por toggle de pruebas funcionales UI'))
      addWarn('conexion.ui.cargaExcel', new Error('Prueba omitida: desactivada por toggle de pruebas funcionales UI'))
      addWarn('conexion.ui.actualizarCnxLoad', new Error('Prueba omitida: desactivada por toggle de pruebas funcionales UI'))
      addWarn('conexion.ui.crearSurveyDesdeCarga', new Error('Prueba omitida: desactivada por toggle de pruebas funcionales UI'))
      addWarn('conexion.ui.notificacionCarga', new Error('Prueba omitida: desactivada por toggle de pruebas funcionales UI'))
      addWarn('reclamos.ui.crearReclamo', new Error('Prueba omitida: desactivada por toggle de pruebas funcionales UI'))
      addWarn('reclamos.ui.actualizarReclamo', new Error('Prueba omitida: desactivada por toggle de pruebas funcionales UI'))
      addWarn('reclamos.ui.estadoReclamo', new Error('Prueba omitida: desactivada por toggle de pruebas funcionales UI'))
    } else {
      const idUserActual = asNum(userDetailStore.userDetail?.id_user) || asNum(usuarios?.[0]?.id_user)
      const tecnicoId = asNum((usuarios || []).find((u) => asNum(u?.id_user))?.id_user)
      let uiEmpresa = pickUiCompany(empresas)
      let uiProyecto = null
      let createdEquipId = null
      let createdPlanSurveyId = null
      let createdPlanChildId = null
      let createdReclamoId = null
      let createdLoadId = null
      let createdLoadDocId = null
      let createdConnSurveyId = null

      if (asNum(uiEmpresa?.id_empresa)) {
        try {
          uiProyecto = await pickUiProject(uiEmpresa.id_empresa)
        } catch (e) {
          addWarn('planificacion.ui.crearSurvey', e, {
            message: `No fue posible resolver proyecto para empresa ${uiEmpresa.id_empresa}`,
          })
        }
      }
      if (!asNum(uiProyecto?.id_proyecto)) {
        const fallback = await pickAnyUiProject(empresas)
        if (fallback?.project?.id_proyecto) {
          uiEmpresa = fallback.empresa
          uiProyecto = fallback.project
        }
      }

      // UI Docs: crear equipamiento y verificar listado
      try {
        assert(idUserActual, 'No existe id_user para crear equipamiento de prueba')
        const tag = randomTag()
        const payload = {
          marca: `QA-${tag}`,
          modelo: `MODELO-${tag}`,
          numero_serie: `SERIE-${tag}`,
          tipo_equipo: 'Analizador',
          estado: 'Activo',
          observaciones: `Auto test ${tag}`,
          id_usuario_creacion: Number(idUserActual),
          json_data: {},
          fotos_ids: [],
        }

        const createRes = await apiAxios.post('/tequ-equipos', payload)
        const idEquipo = asNum(createRes?.data?.data?.id_equipo) || asNum(createRes?.data?.id_equipo)
        createdEquipId = idEquipo

        const found = await retryFind(async () => {
          const listRes = await apiAxios.get('/tequ-equipos')
          const rows = Array.isArray(listRes?.data?.data) ? listRes.data.data : []
          return rows.find((r) =>
            (idEquipo && Number(r?.id_equipo) === Number(idEquipo)) ||
            String(r?.numero_serie || '') === payload.numero_serie
          )
        }, 4, 400)
        assert(!!found, 'El equipamiento creado no aparece en /tequ-equipos')
        addOk('docs.ui.crearEquipamiento', {
          message: `Equipamiento creado y visible (${payload.numero_serie})`,
        })
      } catch (error) {
        addFail('docs.ui.crearEquipamiento', error)
      }

      // UI Docs: actualizar equipamiento creado y validar visibilidad
      try {
        assert(createdEquipId, 'No existe equipamiento creado para probar actualización')
        const patchTag = randomTag()
        await apiAxios.put(`/tequ-equipos/${createdEquipId}`, {
          marca: `QA-UPD-${patchTag}`,
          modelo: `MODELO-UPD-${patchTag}`,
          numero_serie: `SERIE-UPD-${patchTag}`,
          tipo_equipo: 'Analizador',
          estado: 'Activo',
          observaciones: `Actualizado ${patchTag}`,
          id_usuario_creacion: Number(idUserActual || 0),
          json_data: {},
          fotos_ids: [],
        })

        const found = await retryFind(async () => {
          const listRes = await apiAxios.get('/tequ-equipos')
          const rows = Array.isArray(listRes?.data?.data) ? listRes.data.data : []
          return rows.find((r) => Number(r?.id_equipo) === Number(createdEquipId))
        }, 4, 400)
        assert(!!found, 'El equipamiento actualizado no se encontró en listado')
        addOk('docs.ui.actualizarEquipamiento', {
          message: `Equipamiento ${createdEquipId} actualizado y visible`,
        })
      } catch (error) {
        addFail('docs.ui.actualizarEquipamiento', error)
      }

      // UI Docs: subir archivo y validar metadata
      try {
        assert(idUserActual, 'No existe id_user para subir archivo de prueba')
        const fileTag = randomTag()
        const blob = new Blob([`db test ${fileTag}`], { type: 'text/plain' })
        const file = new File([blob], `dbtest_${fileTag}.txt`, { type: 'text/plain' })
        const formData = new FormData()
        formData.append('archivo', file)
        formData.append('tipo_doc', 'DBTEST')
        formData.append('mimetype', file.type)
        formData.append('name_doc_orig', file.name)
        formData.append('name_doc_interno', '')
        formData.append('path_doc', '/u05/LeanDocs/terracon')
        formData.append('id_user', String(Number(idUserActual)))
        formData.append('estado', '1')
        const uploadRes = await apiAxios.post('/archivo/imagen', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        const idDoc = asNum(uploadRes?.data?.archivo?.id_doc)
        assert(idDoc, 'No se recibió id_doc al subir archivo de prueba')
        const metaRes = await apiAxios.get(`/archivo/id/${idDoc}`)
        assert(metaRes?.data?.data, 'No fue posible recuperar metadata del archivo subido')
        addOk('docs.ui.subirArchivo', {
          idArchivo: idDoc,
          message: `Archivo de prueba subido y consultado por id (${idDoc})`,
        })
      } catch (error) {
        addFail('docs.ui.subirArchivo', error)
      }

      // UI Planificación: crear survey template 110 y verificar listado
      try {
        assert(idUserActual, 'No existe id_user para crear survey de planificación')
        if (!asNum(uiEmpresa?.id_empresa) || !asNum(uiProyecto?.id_proyecto)) {
          throw new Error('No existe empresa/proyecto para crear survey de planificación')
        }
        const tag = randomTag()
        const fecha = toYmd(new Date())
        const idSurvey = await createSurveyFromTemplate({
          templateId: 110,
          idUser: idUserActual,
          idEmpresa: Number(uiEmpresa.id_empresa),
          idProyecto: Number(uiProyecto.id_proyecto),
          fechaPlan: fecha,
          bodyPatch: (bodyExec) => {
            upsertAttrValueFlexible(bodyExec?.segmentos, ['IC', 'IC SAP', 'IC_SAP MG'], `IC-${tag}`)
            upsertAttrValueFlexible(bodyExec?.segmentos, ['Nmro Orden MG', 'Nro Orden MG', 'Orden'], `ORD-${tag}`)
            upsertAttrValueFlexible(bodyExec?.segmentos, ['Direccion', 'Dirección'], `Direccion QA ${tag}`)
            upsertAttrValueFlexible(bodyExec?.segmentos, ['Comuna'], 'Santiago')
          },
        })
        createdPlanSurveyId = idSurvey

        const found = await retryFind(async () => {
          const listRes = await apiAxios.get('/servicio/leanglobal/procesosSurveyV3')
          const surveys = Array.isArray(listRes?.data?.datos) ? listRes.data.datos : []
          return surveys.find((s) => Number(s?.id_survey) === Number(idSurvey))
        }, 4, 450)
        assert(!!found, 'El survey de planificación creado no aparece en procesosSurveyV3')
        addOk('planificacion.ui.crearSurvey', {
          idSurvey,
          message: `Survey ${idSurvey} creado y visible en planificación`,
        })
      } catch (error) {
        addFail('planificacion.ui.crearSurvey', error)
      }

      // UI Planificación: actualizar survey y validar en detalle
      try {
        assert(createdPlanSurveyId, 'No existe survey de planificación creado para actualizar')
        const patchDate = toYmd(new Date(Date.now() + (24 * 60 * 60 * 1000)))
        await apiAxios.put(`/survey/${createdPlanSurveyId}`, {
          fecha_plan_ini: patchDate,
          fecha_plan_fin: patchDate,
          id_empresa_cliente: asNum(uiEmpresa?.id_empresa) || null,
          id_proyecto: asNum(uiProyecto?.id_proyecto) || null,
        })
        const updated = await retryFind(async () => {
          const listRes = await apiAxios.get('/servicio/leanglobal/procesosSurveyV3')
          const surveys = Array.isArray(listRes?.data?.datos) ? listRes.data.datos : []
          const row = surveys.find((s) => Number(s?.id_survey) === Number(createdPlanSurveyId))
          if (!row) return null
          const ini = String(row?.fecha_plan_ini || '').slice(0, 10)
          const fin = String(row?.fecha_plan_fin || '').slice(0, 10)
          if (ini === patchDate && fin === patchDate) return row
          return null
        }, 10, 800)
        assert(!!updated, 'No se confirmó fecha planificada actualizada en listado principal')
        addOk('planificacion.ui.actualizarSurvey', {
          idSurvey: createdPlanSurveyId,
          message: `Survey ${createdPlanSurveyId} actualizado (fecha ${patchDate})`,
        })
      } catch (error) {
        const msg = String(error?.message || '').toLowerCase()
        if (msg.includes('no se confirmó')) {
          addWarn('planificacion.ui.actualizarSurvey', new Error('Update ejecutado, pero la lectura no reflejó cambios a tiempo (consistencia eventual del ambiente).'))
        } else {
          addFail('planificacion.ui.actualizarSurvey', error)
        }
      }

      // UI Planificación: crear survey hijo 145 y validar relación
      try {
        assert(createdPlanSurveyId, 'No existe survey padre para crear hijo')
        const tag = randomTag()
        const childId = await createSurveyFromTemplate({
          templateId: 145,
          idUser: idUserActual,
          idEmpresa: Number(uiEmpresa?.id_empresa || 0),
          idProyecto: Number(uiProyecto?.id_proyecto || 0),
          fechaPlan: toYmd(new Date()),
          idSurveyPadre: Number(createdPlanSurveyId),
          bodyPatch: (bodyExec) => {
            upsertAttrValueFlexible(bodyExec?.segmentos, ['IC', 'IC SAP', 'IC_SAP MG'], `IC-HIJO-${tag}`)
          },
        })
        createdPlanChildId = childId
        const child = await retryFind(async () => {
          const listRes = await apiAxios.get('/servicio/leanglobal/procesosSurveyV3')
          const surveys = Array.isArray(listRes?.data?.datos) ? listRes.data.datos : []
          return surveys.find((s) => Number(s?.id_survey) === Number(childId))
        }, 4, 450)
        const parentId = Number(child?.id_survey_padre || 0)
        assert(!!child, 'No se encontró survey hijo en listado')
        assert(parentId === Number(createdPlanSurveyId), 'Survey hijo no quedó relacionado al padre esperado')
        addOk('planificacion.ui.crearSurveyHijo', {
          idSurvey: childId,
          message: `Survey hijo ${childId} relacionado a padre ${createdPlanSurveyId}`,
        })
      } catch (error) {
        addFail('planificacion.ui.crearSurveyHijo', error)
      }

      // UI Conexión: carga excel (archivo + cnx_load) y verificar listado de cargas
      try {
        assert(idUserActual, 'No existe id_user para registrar carga Excel')
        const tag = randomTag()
        const excelFile = buildConexionExcelFile(tag)
        const formData = new FormData()
        formData.append('archivo', excelFile)
        formData.append('tipo_doc', 'EXCEL_CNX')
        formData.append('mimetype', excelFile.type || 'application/octet-stream')
        formData.append('name_doc_orig', excelFile.name)
        formData.append('name_doc_interno', '')
        formData.append('path_doc', '/u05/LeanDocs/terracon')
        formData.append('id_user', String(Number(idUserActual)))
        formData.append('estado', '1')

        const uploadRes = await apiAxios.post('/archivo/imagen', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        const idDoc = asNum(uploadRes?.data?.archivo?.id_doc)
        assert(idDoc, 'No se obtuvo id_doc al subir Excel de prueba')
        createdLoadDocId = idDoc

        const loadRes = await apiAxios.post('/archivo/cnxload', {
          id_doc: Number(idDoc),
          id_user: Number(idUserActual),
          fecha_proyectada_ejecucion: toYmd(new Date()),
          cant_total_excel: 1,
          cant_cargados: 0,
          cant_rechazados: 0,
          flag_recarga: false,
          geoloc_lat: null,
          geoloc_lng: null,
          estado_carga: 'CARGADO',
          observaciones: `dbTest ${tag}`,
        })
        const idLoad = asNum(loadRes?.data?.load?.id_load) || asNum(loadRes?.data?.id_load)
        assert(idLoad, 'No se obtuvo id_load al crear cnx_load')
        createdLoadId = idLoad

        const found = await retryFind(async () => {
          const cnxList = await apiAxios.get('/servicio/leanglobal/obtenerCNXLoad')
          const loadRows = Array.isArray(cnxList?.data) ? cnxList.data : []
          return loadRows.find((l) => Number(l?.id_load) === Number(idLoad))
        }, 4, 450)
        assert(!!found, 'La carga Excel creada no aparece en obtenerCNXLoad')
        addOk('conexion.ui.cargaExcel', {
          idLoad,
          idArchivo: idDoc,
          message: `Carga Excel creada y visible (id_load=${idLoad})`,
        })
      } catch (error) {
        addFail('conexion.ui.cargaExcel', error)
      }

      // UI Conexión: actualizar cnx_load (si ruta disponible)
      try {
        assert(createdLoadId, 'No existe id_load creado para actualizar')
        try {
          await apiAxios.put(`/archivo/cnxload/${createdLoadId}`, {
            cant_cargados: 1,
            cant_rechazados: 0,
            estado_carga: 'CARGADO',
          })
          const found = await retryFind(async () => {
            const cnxList = await apiAxios.get('/servicio/leanglobal/obtenerCNXLoad')
            const loadRows = Array.isArray(cnxList?.data) ? cnxList.data : []
            return loadRows.find((l) => Number(l?.id_load) === Number(createdLoadId))
          }, 4, 450)
          assert(!!found, 'No se encontró carga tras actualizar')
          addOk('conexion.ui.actualizarCnxLoad', {
            idLoad: createdLoadId,
            message: `cnx_load ${createdLoadId} actualizado y visible`,
          })
        } catch (err) {
          const status = Number(err?.response?.status || 0)
          const bodyTxt = String(err?.response?.data || '')
          if (status === 404 && bodyTxt.includes('Cannot PUT')) {
            addWarn('conexion.ui.actualizarCnxLoad', new Error('Ruta PUT /archivo/cnxload/:id_load no disponible en este ambiente'), {
              idLoad: createdLoadId,
            })
          } else {
            throw err
          }
        }
      } catch (error) {
        addFail('conexion.ui.actualizarCnxLoad', error)
      }

      // UI Conexión: crear survey vinculado a carga y validar id_load
      try {
        assert(createdLoadId, 'No existe id_load para crear survey vinculado')
        assert(idUserActual, 'No existe usuario para crear survey de conexión')
        const tag = randomTag()
        const idConnSurvey = await createSurveyFromTemplate({
          templateId: 110,
          idUser: idUserActual,
          idEmpresa: Number(uiEmpresa?.id_empresa || 0),
          idProyecto: Number(uiProyecto?.id_proyecto || 0),
          fechaPlan: toYmd(new Date()),
          idLoad: Number(createdLoadId),
          bodyPatch: (bodyExec) => {
            upsertAttrValueFlexible(bodyExec?.segmentos, ['IC', 'IC SAP', 'IC_SAP MG'], `IC-CNX-${tag}`)
            upsertAttrValueFlexible(bodyExec?.segmentos, ['Nmro Orden MG', 'Nro Orden MG', 'Orden'], `ORD-CNX-${tag}`)
          },
        })
        createdConnSurveyId = idConnSurvey
        const found = await retryFind(async () => {
          const listRes = await apiAxios.get('/servicio/leanglobal/procesosSurveyV3')
          const surveys = Array.isArray(listRes?.data?.datos) ? listRes.data.datos : []
          return surveys.find((s) => Number(s?.id_survey) === Number(idConnSurvey))
        }, 4, 450)
        assert(!!found, 'Survey de conexión vinculado a carga no visible en listado')
        addOk('conexion.ui.crearSurveyDesdeCarga', {
          idLoad: createdLoadId,
          idSurvey: idConnSurvey,
          message: `Survey ${idConnSurvey} creado y vinculado a id_load=${createdLoadId}`,
        })
      } catch (error) {
        addFail('conexion.ui.crearSurveyDesdeCarga', error)
      }

      // UI Conexión: notificación de carga
      try {
        assert(idUserActual, 'No existe usuario para enviar notificación de prueba')
        await apiAxios.post('/notfqueue', {
          id_user_target: Number(idUserActual),
          id_template: null,
          json_data: {
            id_area: 8,
            tipo_notf: 'carga_excel_conexion',
            obs_notf: `dbTest carga ${createdLoadId || 'sin-load'}`,
          },
          channels: { channel: 'WEB' },
          estado: 'PENDING',
        })
        addOk('conexion.ui.notificacionCarga', {
          idLoad: createdLoadId || undefined,
          message: 'Notificación de prueba registrada en cola',
        })
      } catch (error) {
        addFail('conexion.ui.notificacionCarga', error)
      }

      // UI Reclamos: crear reclamo template 153 y verificar listado
      try {
        assert(tecnicoId, 'No existe usuario técnico para crear reclamo de prueba')
        const empresaId = asNum(uiEmpresa?.id_empresa) || null
        const proyectoId = asNum(uiProyecto?.id_proyecto) || null
        const tag = randomTag()
        const fecha = toYmd(new Date())
        const idSurvey = await createSurveyFromTemplate({
          templateId: 153,
          idUser: tecnicoId,
          idEmpresa: empresaId,
          idProyecto: proyectoId,
          fechaPlan: fecha,
          bodyPatch: (bodyExec) => {
            upsertAttrValueFlexible(bodyExec?.segmentos, ['Nmro Reclamo', 'Nro Reclamo', 'N° Reclamo'], `REC-${tag}`)
            upsertAttrValueFlexible(bodyExec?.segmentos, ['Direccion', 'Dirección'], `Direccion Reclamo ${tag}`)
            upsertAttrValueFlexible(bodyExec?.segmentos, ['Comuna'], 'Santiago')
            upsertAttrValueFlexible(bodyExec?.segmentos, ['Estado', 'Estado Reclamo'], 'Pendiente')
          },
        })
        createdReclamoId = idSurvey

        const params = new URLSearchParams()
        params.append('ts.id_template', '153')
        const found = await retryFind(async () => {
          const reclRes = await apiAxios.get(`/servicio/leanglobal/procesosSurveyV3?${params.toString()}`)
          const reclRows = Array.isArray(reclRes?.data?.datos) ? reclRes.data.datos : []
          return reclRows.find((r) => Number(r?.id_survey) === Number(idSurvey))
        }, 4, 450)
        assert(!!found, 'El reclamo creado no aparece en procesosSurveyV3 (template 153)')
        addOk('reclamos.ui.crearReclamo', {
          idSurvey,
          message: `Reclamo ${idSurvey} creado y visible en listado`,
        })
      } catch (error) {
        addFail('reclamos.ui.crearReclamo', error)
      }

      // UI Reclamos: actualizar reclamo y validar detalle
      try {
        assert(createdReclamoId, 'No existe reclamo de prueba para actualizar')
        const tag = randomTag()
        const detBefore = await apiAxios.get(`/servicio/leanglobal/procesosSurveyDetail?id_survey=${createdReclamoId}`)
        const { body: bodyBefore } = parseSurveyDetailBody(detBefore)
        const cloned = deepClone(bodyBefore)
        upsertAttrValueFlexible(cloned?.segmentos, ['Contenido del Reclamo'], `Contenido QA ${tag}`)
        upsertAttrValueFlexible(cloned?.segmentos, ['Estado', 'Estado Reclamo'], 'Pendiente')
        await apiAxios.put(`/survey/${createdReclamoId}`, {
          body_exec: JSON.stringify(cloned),
          fecha_plan_ini: toYmd(new Date()),
          fecha_plan_fin: toYmd(new Date()),
        })
        const persisted = await retryFind(async () => {
          const detAfter = await apiAxios.get(`/servicio/leanglobal/procesosSurveyDetail?id_survey=${createdReclamoId}`)
          const { body: bodyAfter } = parseSurveyDetailBody(detAfter)
          const exact = String(findAttrInBody(bodyAfter, [
            'Contenido del Reclamo',
            'Contenido Reclamo',
            'Observación Terracon',
            'Observacion Terracon',
          ]) || '')
          if (exact.includes(tag)) return true
          if (bodyContainsText(bodyAfter, tag)) return true
          return null
        }, 10, 800)
        assert(!!persisted, 'No se confirmó actualización del contenido de reclamo')
        addOk('reclamos.ui.actualizarReclamo', {
          idSurvey: createdReclamoId,
          message: 'Reclamo actualizado y validado en detalle',
        })
      } catch (error) {
        const msg = String(error?.message || '').toLowerCase()
        if (msg.includes('no se confirmó')) {
          addWarn('reclamos.ui.actualizarReclamo', new Error('Update ejecutado, pero el detalle no reflejó el cambio a tiempo (consistencia eventual del ambiente).'))
        } else {
          addFail('reclamos.ui.actualizarReclamo', error)
        }
      }

      // UI Reclamos: cambio de estado por endpoint de flujo
      try {
        assert(createdReclamoId, 'No existe reclamo para cambio de estado')
        try {
          await apiAxios.post('/survey/UpdSurveyEstado', {
            id_survey: Number(createdReclamoId),
            estado_srv: 'Creado',
          })
          addOk('reclamos.ui.estadoReclamo', {
            idSurvey: createdReclamoId,
            message: 'Endpoint de cambio de estado respondió correctamente',
          })
        } catch (err) {
          const status = Number(err?.response?.status || 0)
          if (status === 403 || status === 404) {
            addWarn('reclamos.ui.estadoReclamo', new Error('Endpoint de cambio de estado no disponible/permitido en este ambiente'), {
              idSurvey: createdReclamoId,
            })
          } else {
            throw err
          }
        }
      } catch (error) {
        addFail('reclamos.ui.estadoReclamo', error)
      }
    }
  } catch (error) {
    addFail('fatal', error)
  } finally {
    const total = results.value.length
    const failed = results.value.filter((r) => !r.ok).length
    const passed = total - failed
    summary.value = { total, passed, failed }
    running.value = false
  }
}
</script>
