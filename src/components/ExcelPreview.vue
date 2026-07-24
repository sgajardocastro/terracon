<template>
  <div class="pa-2">
    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      class="mb-4"
    >
      {{ error }}
    </v-alert>

    <v-row
      dense
      class="align-center"
    >
      <v-col
        cols="12"
        md="9"
      >
        <v-file-input
          v-model="file"
          label="Selecciona archivo Excel"
          prepend-icon="mdi-paperclip"
          accept=".xlsx,.xls"
          variant="outlined"
          density="compact"
          hide-details
          :loading="loading"
          :disabled="loading"
          clearable
          @update:model-value="onFilePicked"
        />
      </v-col>
      <v-col
        cols="12"
        md="3"
      >
        <v-text-field
          v-model="fechaProyectada"
          label="Fecha proyectada ejecucion"
          type="date"
          variant="outlined"
          density="compact"
          hide-details
          :disabled="loading"
        />
      </v-col>
    </v-row>

    <v-row
      dense
      class="mt-2"
    >
      <v-col
        cols="12"
        md="12"
      >
        <v-textarea
          v-model="observaciones"
          label="Observaciones"
          rows="2"
          auto-grow
          variant="outlined"
          density="compact"
          hide-details
          :disabled="loading"
        />
      </v-col>
    </v-row>

    <div class="d-flex align-center justify-space-between mt-2 mb-2">
      <div class="text-caption text-grey-darken-1">
        <span v-if="rows.length">
          Filas: <b>{{ rows.length }}</b> · Columnas: <b>{{ columns.length }}</b>
          <span v-if="idDoc"> · id_doc: <b>{{ idDoc }}</b></span>
        </span>
        <span v-else-if="selectedSheet && !loading">
          No hay filas para mostrar.
        </span>
      </div>

      <div class="d-flex align-center ga-2">
        <v-progress-circular
          v-if="loading"
          indeterminate
          size="18"
          width="2"
        />
        <v-btn
          variant="outlined"
          color="primary"
          :disabled="loading || loadingUpload"
          @click="clear"
        >
          <v-icon
            start
            icon="mdi-broom"
          />
          Limpiar
        </v-btn>
        <v-btn
          color="primary"
          :loading="loadingUpload"
          :disabled="loading || loadingUpload || !canUpload"
          @click="subirExcelComoArchivo"
        >
          <v-icon
            start
            icon="mdi-cloud-upload"
          />
          Subir Excel
        </v-btn>
      </div>
    </div>

    <v-divider class="my-2" />

    <v-table
      v-if="rows.length"
      density="compact"
      fixed-header
      height="420"
      class="text-body-2"
    >
      <thead>
        <tr>
          <th
            class="text-left"
            style="width: 56px;"
          >
            #
          </th>
          <th
            v-for="col in columns"
            :key="col"
            class="text-left"
          >
            {{ col }}
          </th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="(r, idx) in rows"
          :key="idx"
        >
          <td class="text-left text-grey-darken-1">
            {{ idx + 1 }}
          </td>
          <td
            v-for="col in columns"
            :key="col"
            class="text-left"
          >
            {{ r[col] }}
          </td>
        </tr>
      </tbody>
    </v-table>

    <div
      v-else
      class="text-caption text-grey-darken-1 mt-3"
    >
      Carga un Excel para ver la tabla.
    </div>

    <!-- ✅ Preview link si quedó name_doc_interno -->
    <div
      v-if="fileUrl"
      class="mt-3 text-caption"
    >
      Archivo subido:
      <a
        :href="fileUrl"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ nameDocInterno }}
      </a>
      <div
        v-if="nameDocOrig"
        class="text-grey-darken-1"
      >
        Original: {{ nameDocOrig }}
      </div>
    </div>

    <!-- ✅ Draft / resultado cnx_load -->
    <v-alert
      v-if="cnxLoadDraft"
      type="info"
      variant="tonal"
      class="mt-3"
    >
      cnx_load registrado: id_doc={{ cnxLoadDraft.id_doc }},
      cant_total_excel={{ cnxLoadDraft.cant_total_excel }},
      fecha_proyectada_ejecucion={{ cnxLoadDraft.fecha_proyectada_ejecucion }}
      <span v-if="cnxLoadDraft.id_load"> · id_load={{ cnxLoadDraft.id_load }}</span>
    </v-alert>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import * as XLSX from 'xlsx'
import apiAxios from '@/services/api'
import { useUserDetailStore } from '@/stores/userDetail'

const userDetailStore = useUserDetailStore()
const props = defineProps({
  planMode: { type: String, default: 'conexion' } // 'conexion' | 'plan_c'
})

const API_BASE = (import.meta?.env?.VITE_API_BASE_URL || '').replace(/\/$/, '')

const loading = ref(false)
const loadingUpload = ref(false)
const error = ref('')

const file = ref(null)

const workbook = ref(null)
const workbookSheets = ref([])
const selectedSheet = ref('') // solo UI; el parse usa SIEMPRE la primera hoja

const rows = ref([])
const columns = ref([])

/** ✅ datos cnx_load */
const fechaProyectada = ref('')
const flagRecarga = ref(false)
const observaciones = ref('')

/** ✅ respuesta tfmg_file */
const idDoc = ref(null)
const nameDocInterno = ref('')
const nameDocOrig = ref('')
const serverUploadedAt = ref(null)

/** ✅ draft cnx_load */
const cnxLoadDraft = ref(null)

/** ✅ evita re-ejecución por eventos duplicados de v-file-input */
const lastFileKey = ref('')

const emit = defineEmits(['carga-ok'])
const FIXED_CLIENTE_NAME = 'METROGAS'
const FIXED_PROYECTO_NAME = 'PROYECTO PRUEBA METROGAS1'
const PLAN_C_OBS_TAG = '[PLAN_C]'

/** ========= Helpers ========= */

// ✅ Parse seguro de JSON
function safeJsonParse(v, fallback) {
  try {
    if (v === null || v === undefined) return fallback
    if (typeof v === 'string') return JSON.parse(v)
    if (typeof v === 'object') return v
    return fallback
  } catch {
    return fallback
  }
}

// ✅ CLONE SEGURO (mata proxies y cosas raras)
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj ?? {}))
}

function findAttrByLabel(seed, label) {
  const target = String(label ?? '').trim()
  for (const seg of seed.segmentos ?? []) {
    for (const attr of seg.attributes ?? []) {
      if (String(attr.label ?? '').trim() === target) return attr
    }
  }
  return null
}

function setTextAttrDefault(seed, label, value) {
  const attr = findAttrByLabel(seed, label)
  if (!attr) return false
  attr.default = value ?? ''
  return true
}

// Opcional: guardar toda la fila como segmento readOnly
function ensureExcelSegment(seed, fila, columnsList = []) {
  const exists = (seed.segmentos ?? []).some(s => String(s.label) === 'DATOS EXCEL (AUTO)')
  if (exists) return

  const headers = columnsList.length ? columnsList : Object.keys(fila || {})
  const attrs = headers.map((k, idx) => ({
    type: 'textField',
    label: String(k),
    default: String(fila?.[k] ?? ''),
    nullable: true,
    posicion: idx + 1,
    readOnly: true
  }))

  seed.segmentos = seed.segmentos ?? []
  seed.segmentos.push({
    label: 'DATOS EXCEL (AUTO)',
    touch: false,
    posicion: 999,
    collapsible: true,
    attributes: attrs
  })
}

function isPlanCMode() {
  return String(props.planMode || '').toLowerCase() === 'plan_c'
}

function buildObservacionCarga(rawObservaciones) {
  const base = String(rawObservaciones || '').trim()
  if (!isPlanCMode()) return base || null
  if (!base) return PLAN_C_OBS_TAG
  if (base.toUpperCase().includes(PLAN_C_OBS_TAG)) return base
  return `${PLAN_C_OBS_TAG} ${base}`.trim()
}

function isPlanCLoadFromObservaciones(obs) {
  return String(obs || '').toUpperCase().includes(PLAN_C_OBS_TAG)
}

/** ========= Computeds ========= */

const fileUrl = computed(() => {
  return nameDocInterno.value ? `${API_BASE}/archivo/terracon/${nameDocInterno.value}` : ''
})

const canUpload = computed(() => {
  const f = Array.isArray(file.value) ? file.value[0] : file.value
  return !!f && rows.value.length > 0 && !!fechaProyectada.value
})

function hoyYYYYMMDD() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function clear() {
  lastFileKey.value = ''

  error.value = ''
  loading.value = false
  loadingUpload.value = false

  file.value = null
  workbook.value = null
  workbookSheets.value = []
  selectedSheet.value = ''
  rows.value = []
  columns.value = []

  fechaProyectada.value = hoyYYYYMMDD()
  flagRecarga.value = false
  observaciones.value = ''

  idDoc.value = null
  nameDocInterno.value = ''
  nameDocOrig.value = ''
  serverUploadedAt.value = null

  cnxLoadDraft.value = null
}

async function onFilePicked(newVal) {
  const f = Array.isArray(newVal) ? newVal[0] : newVal
  if (!f) {
    clear()
    return
  }

  const key = `${f.name}|${f.size}|${f.lastModified}`
  if (lastFileKey.value === key) return
  lastFileKey.value = key

  error.value = ''
  rows.value = []
  columns.value = []
  workbook.value = null
  workbookSheets.value = []
  selectedSheet.value = ''

  idDoc.value = null
  nameDocInterno.value = ''
  nameDocOrig.value = ''
  serverUploadedAt.value = null
  cnxLoadDraft.value = null

  try {
    loading.value = true

    const buf = await f.arrayBuffer()
    const wb = XLSX.read(buf, { type: 'array', cellDates: true })

    workbook.value = wb
    workbookSheets.value = wb.SheetNames || []

    if (!workbookSheets.value.length) throw new Error('El archivo no trae hojas.')

    selectedSheet.value = workbookSheets.value[0] || ''

    parseSelectedSheet()
  } catch (e) {
    error.value = e?.message || 'Error leyendo el Excel.'
    workbook.value = null
    workbookSheets.value = []
    selectedSheet.value = ''
    rows.value = []
    columns.value = []
  } finally {
    loading.value = false
  }
}

function isEmptyCell(v) {
  if (v === null || v === undefined) return true
  return String(v).trim() === ''
}

function hasMeaningfulValue(v) {
  if (isEmptyCell(v)) return false
  const normalized = String(v).trim().toLowerCase()
  return !['null', 'undefined', 'nan'].includes(normalized)
}

function isRowEmpty(arr) {
  return (arr || []).every(isEmptyCell)
}

function normalizeExcelCellValue(v) {
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    return normalizeDateKey(v)
  }
  return v
}

function fillMergedCells(table, merges = [], rangeRef = null) {
  if (!Array.isArray(table) || !Array.isArray(merges) || !merges.length) return table

  const rowOffset = Number(rangeRef?.s?.r || 0)
  const colOffset = Number(rangeRef?.s?.c || 0)

  for (const merge of merges) {
    const startRow = Number(merge?.s?.r) - rowOffset
    const endRow = Number(merge?.e?.r) - rowOffset
    const startCol = Number(merge?.s?.c) - colOffset
    const endCol = Number(merge?.e?.c) - colOffset
    if (![startRow, endRow, startCol, endCol].every(Number.isFinite)) continue
    if (endRow < 0 || endCol < 0 || startRow >= table.length) continue

    const sourceValue = table?.[startRow]?.[startCol]
    if (isEmptyCell(sourceValue)) continue

    for (let r = startRow; r <= endRow; r++) {
      if (!Array.isArray(table[r])) table[r] = []
      for (let c = startCol; c <= endCol; c++) {
        if (isEmptyCell(table[r][c])) table[r][c] = sourceValue
      }
    }
  }

  return table
}

function makeUniqueHeaders(rawHeaders) {
  const seen = new Map()
  return rawHeaders.map((h, i) => {
    const base = String(h ?? '').trim() || `COL_${i + 1}`
    const n = (seen.get(base) ?? 0) + 1
    seen.set(base, n)
    return n === 1 ? base : `${base}_${n}`
  })
}

function parseSelectedSheet() {
  if (!workbook.value) {
    rows.value = []
    columns.value = []
    return
  }

  const sheetName = workbook.value.SheetNames?.[0]
  const ws = sheetName ? workbook.value.Sheets?.[sheetName] : null
  if (!ws) {
    rows.value = []
    columns.value = []
    return
  }

  const aoa = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    defval: '',
    raw: true
  })

  const rangeRef = XLSX.utils.decode_range(ws['!ref'] || 'A1')
  const table = fillMergedCells(Array.isArray(aoa) ? aoa : [], ws['!merges'], rangeRef)

  const headerIndexByContr = table.findIndex(row =>
    (row || []).some(c => String(c ?? '').toUpperCase().includes('CONTRATISTA'))
  )

  const headerIndex = headerIndexByContr !== -1
    ? headerIndexByContr
    : table.findIndex(row => !isRowEmpty(row))

  if (headerIndex === -1) {
    rows.value = []
    columns.value = []
    return
  }

  const headers = makeUniqueHeaders(table[headerIndex] || [])

  const dataRows = table.slice(headerIndex + 1)

  const objs = []
  for (const r of dataRows) {
    if (isRowEmpty(r)) break
    const obj = {}
    headers.forEach((h, i) => (obj[h] = normalizeExcelCellValue(r?.[i] ?? '')))
    objs.push(obj)
  }

  const parsedRows = objs.filter(obj => !headers.every(h => isEmptyCell(obj[h])))

  // Oculta columnas completamente vacías o con placeholders (ej.: COL_20 en adelante)
  const visibleHeaders = headers.filter(h => parsedRows.some(r => hasMeaningfulValue(r[h])))

  columns.value = visibleHeaders
  rows.value = parsedRows.map(r => {
    const trimmed = {}
    for (const h of visibleHeaders) trimmed[h] = r[h]
    return trimmed
  })
}

/** ✅ SUBIR EXCEL (tfmg_file) + REGISTRAR CARGA (tfmg_cnx_load) */
async function subirExcelComoArchivo() {
  const f = Array.isArray(file.value) ? file.value[0] : file.value
  if (!f) {
    error.value = 'Debes seleccionar un archivo.'
    return
  }
  if (!rows.value.length) {
    error.value = 'No hay filas detectadas para registrar.'
    return
  }
  if (!fechaProyectada.value) {
    error.value = 'Debes seleccionar la fecha proyectada de ejecución.'
    return
  }
  if (!clienteSeleccionado.value) {
    error.value = 'Debes seleccionar Cliente.'
    return
  }
  if (!proyectoSeleccionado.value) {
    error.value = 'Debes seleccionar Proyecto.'
    return
  }

  loadingUpload.value = true
  error.value = ''

  try {
    // 1) Subir archivo -> tfmg_file
    const formData = new FormData()
    formData.append('archivo', f)

    formData.append('tipo_doc', 'EXCEL_CNX')
    formData.append('mimetype', f.type || 'application/octet-stream')
    formData.append('name_doc_orig', f.name)
    formData.append('name_doc_interno', '')
    formData.append('path_doc', '/u05/LeanDocs/terracon')
    formData.append('id_user', String(Number(userDetailStore.userDetail?.id_user || 0)))
    formData.append('estado', '1')

    const response = await apiAxios.post('/archivo/imagen', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    const data = response?.data || {}
    const archivo = data.archivo || {}

    idDoc.value = archivo.id_doc ?? null
    nameDocInterno.value = archivo.name_doc_interno ?? ''
    nameDocOrig.value = archivo.name_doc_orig ?? f.name
    serverUploadedAt.value = data.server_uploaded_at ?? null

    if (!idDoc.value) throw new Error('El backend no devolvió id_doc.')

    // 2) Registrar cnx_load -> tfmg_cnx_load
    const fechasCarga = getFechasPlanFromRows(rows.value || [])
    const fechaCargaExcel = fechasCarga[0] || fechaProyectada.value
    const payloadCnxLoad = {
      id_doc: Number(idDoc.value),
      id_user: Number(userDetailStore.userDetail?.id_user || 0),
      fecha_proyectada_ejecucion: fechaCargaExcel,
      cant_total_excel: Number(rows.value.length),
      cant_cargados: 0,
      cant_rechazados: 0,
      flag_recarga: !!flagRecarga.value,
      geoloc_lat: null,
      geoloc_lng: null,
      estado_carga: 'CARGADO',
      observaciones: buildObservacionCarga(observaciones.value)
    }

    const respLoad = await apiAxios.post('/archivo/cnxload', payloadCnxLoad)
    const load = respLoad?.data?.load || respLoad?.data || {}

    cnxLoadDraft.value = {
      ...payloadCnxLoad,
      id_load: load.id_load ?? load.idLoad ?? null
    }

    // 3) Crear surveys por fila (solo TERRACON)
    const resultadoCarga = await crearSurveysDesdeExcel()
    if (!Number(resultadoCarga?.creados || 0)) {
      const detalle = (resultadoCarga?.errores || []).join(' ')
      throw new Error(detalle || 'No se creó ningun survey desde el Excel.')
    }

    // 4) Persistir contadores reales de la carga
    const idLoadActual = Number(cnxLoadDraft.value?.id_load || 0)
    if (idLoadActual > 0) {
      const cantCargadosReal = Number(resultadoCarga?.creados || 0)
      const cantRechazadosReal = Number(resultadoCarga?.fallados || 0) + Number(resultadoCarga?.duplicadas || 0)
      const totalExcel = Number(cnxLoadDraft.value?.cant_total_excel || 0)
      const cantRechazadosSafe = Math.max(0, Math.min(cantRechazadosReal, Math.max(totalExcel - cantCargadosReal, 0)))

      cnxLoadDraft.value = {
        ...cnxLoadDraft.value,
        cant_cargados: cantCargadosReal,
        cant_rechazados: cantRechazadosSafe,
        estado_carga: 'CARGADO'
      }
    }
  } catch (e) {
    console.error(e?.response || e)
    error.value =
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      e?.message ||
      'Error al subir el Excel o registrar la carga.'
  } finally {
    emit('carga-ok')

    // Enviar notificación al usuario que cargó el archivo (si no hubo error)
    if (!error.value) {
      try {
        await apiAxios.post('/notfqueue', {
          id_user_target: Number(userDetailStore.userDetail?.id_user || 0),
          id_template: null,
          json_data: {
            id_area: 8,
            tipo_notf: 'carga_excel_conexion',
            obs_notf: 'Carga masiva Excel (Conexión) completada'
          },
          channels: { channel: 'WEB' },
          estado: 'PENDING'
        })
      } catch (err) {
        console.error('Error al registrar notificación:', err)
      }
    }

    loadingUpload.value = false
  }
}

/** ========= Surveys por fila ========= */

function esTerracon(v) {
  return String(v ?? '').toUpperCase().includes('TERRACON')
}

const crearSurveyHijoDesdeFila = async (fila, idSurveyPadre) => {
  const tpl = templatesSurvey.value.find(t => Number(t.id_template) === 145) || {}

  const header_seed = tpl.header_seed || {}
  const approval_seed = tpl.approval_seed || {}
  const id_flow_tmpl = tpl.id_flow_tmpl || null

  const body_seed_obj = safeJsonParse(tpl.body_seed, { segmentos: [] })

  const body_seed = deepClone(body_seed_obj)
  const body_exec = deepClone(body_seed_obj)

  // ✅ MISMA FILA -> MISMA DATA al hijo
  applyExcelRowToBodyExec(body_exec, fila)

  const idLoadActual = Number(cnxLoadDraft.value?.id_load || 0) || null
  upsertIdLoadInBodyExec(body_exec, idLoadActual)
  const fechaPlanFila = getFechaPlanFromRow(fila)

  const payload = {
    id_tipo_srv: 36,
    id_template: 145,

    // 👇 esto es CLAVE
    id_survey_padre: Number(idSurveyPadre),

    id_user: userDetailStore.userDetail.id_user,
    id_user_creacion: userDetailStore.userDetail.id_user,
    id_empresa_cliente: clienteSeleccionado.value,
    estado_srv: 'Pre Creado',

    header_seed: JSON.stringify(header_seed),
    body_seed: JSON.stringify(body_seed),
    approval_seed: JSON.stringify(approval_seed),

    header_exec: JSON.stringify(header_seed),
    body_exec: JSON.stringify(body_exec),
    approval_exec: JSON.stringify(approval_seed),

    fecha_plan_ini: fechaPlanFila,
    fecha_plan_fin: fechaPlanFila,

    fecha_real_ini: null,
    fecha_real_fin: null,
    fecha_upload: null,

    latitud: null,
    longitud: null,
    id_proyecto: proyectoSeleccionado.value,
    id_flow_tmpl,
    id_load: idLoadActual
  }

  const resp = await apiAxios.post('/survey/', payload)
  return resp?.data?.idSurvey ?? resp?.data?.id_survey ?? null
}

const crearSurveyDesdeFila = async (fila) => {
  // 👇 tu padre (deja el template que estés usando de padre: 110 o el que corresponda)
  const tpl = templatesSurvey.value.find(t => Number(t.id_template) === 110) || {}

  const header_seed = tpl.header_seed || {}
  const approval_seed = tpl.approval_seed || {}
  const id_flow_tmpl = tpl.id_flow_tmpl || null

  const body_seed_obj = safeJsonParse(tpl.body_seed, { segmentos: [] })

  const body_seed = deepClone(body_seed_obj)
  const body_exec = deepClone(body_seed_obj)

  applyExcelRowToBodyExec(body_exec, fila)

  const idLoadActual = Number(cnxLoadDraft.value?.id_load || 0) || null
  upsertIdLoadInBodyExec(body_exec, idLoadActual)
  const fechaPlanFila = getFechaPlanFromRow(fila)

  const payloadPadre = {
    id_tipo_srv: 36,
    id_template: 110,

    id_user: userDetailStore.userDetail.id_user,
    id_user_creacion: userDetailStore.userDetail.id_user,
    id_empresa_cliente: clienteSeleccionado.value,
    estado_srv: 'Pre Creado',

    header_seed: JSON.stringify(header_seed),
    body_seed: JSON.stringify(body_seed),
    approval_seed: JSON.stringify(approval_seed),

    header_exec: JSON.stringify(header_seed),
    body_exec: JSON.stringify(body_exec),
    approval_exec: JSON.stringify(approval_seed),

    fecha_plan_ini: fechaPlanFila,
    fecha_plan_fin: fechaPlanFila,

    fecha_real_ini: null,
    fecha_real_fin: null,
    fecha_upload: null,

    latitud: null,
    longitud: null,
    id_proyecto: proyectoSeleccionado.value,
    id_flow_tmpl,
    id_load: idLoadActual
  }

  // 1) crear PADRE
  const respPadre = await apiAxios.post('/survey/', payloadPadre)
  const idPadre = respPadre?.data?.idSurvey ?? respPadre?.data?.id_survey ?? null
  if (!idPadre) throw new Error('No se pudo crear el survey padre')

  // 2) crear HIJO con template 145 y id_survey_padre = idPadre
  const idHijo = await crearSurveyHijoDesdeFila(fila, idPadre)

  return { idPadre, idHijo }
}

const crearSurveysDesdeExcel = async () => {
  const norm = (s) =>
    String(s ?? '')
      .trim()
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')

  const headers = columns.value || []
  const headersNorm = headers.map(h => norm(h))

  const idx = headersNorm.findIndex(h => h === 'CONTRATISTA' || h.includes('CONTRATISTA'))
  if (idx === -1) {
    console.warn('[ExcelPreview] No existe columna CONTRATISTA. Headers detectados:', headers)
    return { creados: 0, ids: [], motivo: 'SIN_CONTRATISTA' }
  }

  const colContratista = headers[idx]
  const contratistasDetectados = new Set(
    (rows.value || [])
      .map(r => String(r?.[colContratista] ?? '').trim())
      .filter(v => !!v)
      .map(v => normalizeMatch(v))
  )
  const permitirTerraconImplicito = contratistasDetectados.size === 1 && contratistasDetectados.has('TERRACON')

  const filasTerracon = (rows.value || []).filter((r) => {
    const vContratista = r?.[colContratista]
    if (esTerracon(vContratista)) return true
    if (!permitirTerraconImplicito) return false
    if (!isBlank(vContratista)) return false
    return filaPareceConexion(r)
  })

  if (!filasTerracon.length) {
    console.log('[ExcelPreview] No hay filas con TERRACON en CONTRATISTA.')
    return { creados: 0, ids: [], motivo: 'SIN_TERRACON' }
  }

  let keysExistentes = new Set()
  try {
    keysExistentes = await obtenerKeysExistentesIcOrden(filasTerracon)
  } catch (e) {
    console.error('[ExcelPreview] No se pudo validar duplicados existentes por IC+ORDEN:', e?.response?.data || e)
  }
  const keysProcesadas = new Set(keysExistentes)

  const idsPadre = []
  const idsHijo = []
  const errores = []
  let ok = 0
  let fail = 0
  let duplicadas = 0
  let omitidasSinDatos = 0

  for (const [idx, fila] of filasTerracon.entries()) {
    if (!filaConDatosMinimosParaCrear(fila)) {
      omitidasSinDatos++
      errores.push(`Fila ${idx + 1}: omitida por datos minimos incompletos.`)
      console.warn('[ExcelPreview] Fila omitida por no traer datos minimos (IC/ORDEN/DIRECCION/COMUNA).', fila)
      continue
    }

    const { fecha, ic, orden, key } = extractFechaIcOrdenFromRow(fila)
    if (key && keysProcesadas.has(key)) {
      duplicadas++
      errores.push(`Fila ${idx + 1}: duplicada para fecha ${fecha}, IC ${ic}, orden ${orden}.`)
      continue
    }

    try {
      const { idPadre, idHijo } = await crearSurveyDesdeFila(fila)
      idsPadre.push(idPadre)
      idsHijo.push(idHijo)
      if (key) keysProcesadas.add(key)
      ok++
    } catch (err) {
      fail++
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'error desconocido'
      errores.push(`Fila ${idx + 1}: error creando survey (${msg}).`)
      console.error('[ExcelPreview] Error creando padre/hijo:', fila, err?.response?.data || err)
    }
  }

  return { creados: ok, idsPadre, idsHijo, fallados: fail, duplicadas, omitidasSinDatos, errores }
}

/** ========= Cliente/Proyecto/Templates ========= */

const clientes = ref([])
const proyectos = ref([])
const proyectoSeleccionado = ref(null)
const clienteSeleccionado = ref(null)
const templatesSurvey = ref([])

function normalizeMatch(v) {
  return String(v ?? '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

const sortByText = (arr, selector) =>
  [...(arr ?? [])].sort((a, b) =>
    String(selector(a) ?? '').localeCompare(String(selector(b) ?? ''), 'es', { sensitivity: 'base', numeric: true })
  )

const obtenerClientes = async () => {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerEmpresas')
    clientes.value = sortByText(data, x => x.name_empresa)
  } catch (err) {
    console.error(err)
  }
}

const obtenerProyectos = async (id_cliente) => {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerProyectos?id_empresa_cliente=' + (id_cliente || ''))
    proyectos.value = sortByText(data, x => x.nombre_proyecto)
  } catch (err) {
    console.error(err)
  }
}

const setFixedClienteProyecto = async () => {
  const cliente = (clientes.value || []).find(c =>
    normalizeMatch(c?.name_empresa).includes(normalizeMatch(FIXED_CLIENTE_NAME))
  )

  if (!cliente?.id_empresa) {
    error.value = `No se encontró cliente fijo: ${FIXED_CLIENTE_NAME}`
    return
  }

  clienteSeleccionado.value = Number(cliente.id_empresa)
  await obtenerProyectos(clienteSeleccionado.value)

  const proyecto = (proyectos.value || []).find(p =>
    normalizeMatch(p?.nombre_proyecto) === normalizeMatch(FIXED_PROYECTO_NAME)
  ) || (proyectos.value || []).find(p =>
    normalizeMatch(p?.nombre_proyecto).includes(normalizeMatch(FIXED_PROYECTO_NAME))
  )

  if (!proyecto?.id_proyecto) {
    error.value = `No se encontró proyecto fijo: ${FIXED_PROYECTO_NAME}`
    return
  }

  proyectoSeleccionado.value = Number(proyecto.id_proyecto)
}

const obtenerTemplates = async () => {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerTemplates?id_tipo_srv=36')
    templatesSurvey.value = sortByText(data, x => x.name_template_srv)
  } catch (err) {
    console.error('Error al obtener templates:', err)
  }
}

onMounted(async () => {
  fechaProyectada.value = hoyYYYYMMDD()
  await Promise.all([obtenerClientes(), obtenerTemplates()])
  await setFixedClienteProyecto()
})



const norm = (s) =>
  String(s ?? '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

function getCellByHeader(fila, excelHeaderWanted) {
  const wanted = norm(excelHeaderWanted)
  const keys = Object.keys(fila || {})

  const exact = keys.find(k => norm(k) === wanted)
  if (exact) return fila[exact]

  const includes = keys.find(k => norm(k).includes(wanted))
  if (includes) return fila[includes]

  return ''
}

function getCellByAnyHeader(fila, wantedHeaders = []) {
  for (const h of wantedHeaders) {
    const v = getCellByHeader(fila, h)
    if (!isBlank(v)) return v
  }
  return ''
}

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '' || String(v).trim() === '-'
}

function getDireccionFromRow(fila) {
  return getCellByAnyHeader(fila, ['DIRECCION', 'DIRECCIÓN', 'DIR', 'CALLE'])
}

function getComunaFromRow(fila) {
  return getCellByAnyHeader(fila, ['COMUNA', 'COM'])
}

function getCamposMinimosFila(fila) {
  const ic = getCellByAnyHeader(fila, ['IC-SAP', 'IC SAP', 'IC SAP MG', 'IC_SAP MG', 'IC_SAP', 'IC'])
  const orden = getCellByAnyHeader(fila, ['NMRO ORDEN MG', 'NRO ORDEN', 'NRO_ORDEN', 'NUMERO ORDEN', 'ORDEN', 'NUMERO'])
  const direccion = getDireccionFromRow(fila)
  const comuna = getComunaFromRow(fila)

  const faltantes = []
  if (isBlank(ic)) faltantes.push('IC_SAP')
  if (isBlank(orden)) faltantes.push('ORDEN')
  if (isBlank(direccion)) faltantes.push('DIRECCION')
  if (isBlank(comuna)) faltantes.push('COMUNA')

  return { ic, orden, direccion, comuna, faltantes }
}

function filaConDatosMinimosParaCrear(fila) {
  const { ic, orden, direccion, comuna } = getCamposMinimosFila(fila)
  return [ic, orden, direccion, comuna].some(v => !isBlank(v))
}

function filaPareceConexion(fila) {
  const { ic, direccion, comuna } = getCamposMinimosFila(fila)
  const markers = [
    !isBlank(ic),
    !isBlank(direccion),
    !isBlank(comuna)
  ]
  return markers.filter(Boolean).length >= 2
}

function normalizeKeyPart(v) {
  return String(v ?? '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
}

function makeIcOrdenKey(ic, orden) {
  const icNorm = normalizeKeyPart(ic)
  const ordenNorm = normalizeKeyPart(orden)
  if (!icNorm || !ordenNorm) return ''
  return `${icNorm}||${ordenNorm}`
}

function normalizeDateKey(v) {
  const buildValidYmd = (yyyy, mm, dd) => {
    const year = String(yyyy || '').padStart(4, '0')
    const month = Number(mm)
    const day = Number(dd)
    if (!year || month < 1 || month > 12 || day < 1 || day > 31) return ''
    const date = new Date(Date.UTC(Number(year), month - 1, day))
    if (
      date.getUTCFullYear() !== Number(year) ||
      date.getUTCMonth() + 1 !== month ||
      date.getUTCDate() !== day
    ) return ''
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    const yyyy = v.getFullYear()
    const mm = String(v.getMonth() + 1).padStart(2, '0')
    const dd = String(v.getDate()).padStart(2, '0')
    return buildValidYmd(yyyy, mm, dd)
  }

  const raw = String(v ?? '').trim()
  if (!raw) return ''

  const excelSerial = Number(raw)
  if (Number.isFinite(excelSerial) && excelSerial > 20000 && excelSerial < 80000) {
    const utcDays = Math.floor(excelSerial - 25569)
    const d = new Date(utcDays * 86400 * 1000)
    if (!Number.isNaN(d.getTime())) {
      const yyyy = d.getUTCFullYear()
      const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
      const dd = String(d.getUTCDate()).padStart(2, '0')
      return `${yyyy}-${mm}-${dd}`
    }
  }

  const iso = raw.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:\D|$)/)
  if (iso) {
    const [, yyyy, mm, dd] = iso
    return buildValidYmd(yyyy, mm, dd)
  }

  const local = raw.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})(?:\D|$)/)
  if (local) {
    let [, dd, mm, rawYear] = local
    const yyyy = rawYear.length === 2 ? `20${rawYear}` : rawYear
    if (Number(mm) > 12 && Number(dd) <= 12) {
      const originalDd = dd
      dd = mm
      mm = originalDd
    }
    return buildValidYmd(yyyy, mm, dd)
  }

  return ''
}

function makeFechaIcOrdenKey(fecha, ic, orden) {
  const fechaNorm = normalizeDateKey(fecha)
  const icOrdenKey = makeIcOrdenKey(ic, orden)
  if (!fechaNorm || !icOrdenKey) return ''
  return `${fechaNorm}||${icOrdenKey}`
}

function getFechaPlanFromRow(fila) {
  const fechaExcel = getCellByAnyHeader(fila, ['FECHA', 'FECHA EJECUCION', 'FECHA_EJECUCION'])
  return normalizeDateKey(fechaExcel) || normalizeDateKey(fechaProyectada.value) || fechaProyectada.value
}

function getFechasPlanFromRows(filas = []) {
  const fechas = (filas || [])
    .map(fila => getFechaPlanFromRow(fila))
    .filter(Boolean)
    .sort()
  return fechas.length ? fechas : [normalizeDateKey(fechaProyectada.value)].filter(Boolean)
}

function extractIcOrdenFromRow(fila) {
  const ic = getCellByAnyHeader(fila, ['IC-SAP', 'IC SAP', 'IC SAP MG', 'IC_SAP MG', 'IC_SAP', 'IC'])
  const orden = getCellByAnyHeader(fila, ['NMRO ORDEN MG', 'NRO ORDEN', 'NRO_ORDEN', 'NUMERO ORDEN', 'ORDEN', 'NUMERO'])
  return { ic, orden, key: makeIcOrdenKey(ic, orden) }
}

function extractFechaIcOrdenFromRow(fila) {
  const { ic, orden } = extractIcOrdenFromRow(fila)
  const fecha = getFechaPlanFromRow(fila)
  return { fecha, ic, orden, key: makeFechaIcOrdenKey(fecha, ic, orden) }
}

function getBodyValuesLocal(raw) {
  if (!raw) return {}
  const res = {}
  try {
    const obj = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (obj?.segmentos) {
      for (const seg of obj.segmentos) {
        for (const attr of (seg.attributes || [])) {
          if (!attr?.label) continue
          const key = String(attr.label).trim().toUpperCase()
          let val = attr.value
          if (val === undefined || val === null) val = attr.answer
          if (val === undefined || val === null) val = attr.respuesta
          if (val === undefined || val === null) val = attr?.values?.selected
          if (val === undefined || val === null) val = attr.default
          res[key] = val !== undefined && val !== null ? String(val) : ''
        }
      }
    }
  } catch {
    return res
  }
  return res
}

function pickFirstValue(vals, keys = []) {
  for (const k of keys) {
    const v = vals?.[k]
    if (!isBlank(v)) return String(v)
  }
  return ''
}

async function obtenerKeysExistentesIcOrden(filas = []) {
  const fechas = getFechasPlanFromRows(filas)
  const fechaDesde = fechas[0] || fechaProyectada.value || ''
  const fechaHasta = fechas[fechas.length - 1] || fechaProyectada.value || ''
  const params = new URLSearchParams()
  params.append('fecha_desde', fechaDesde)
  params.append('fecha_hasta', fechaHasta)
  params.append('ts.id_empresa_cliente', String(clienteSeleccionado.value || ''))
  params.append('ts.id_proyecto', String(proyectoSeleccionado.value || ''))

  const [{ data }, { data: loadsData }] = await Promise.all([
    apiAxios.get(`/servicio/leanglobal/procesosSurveyV3?${params.toString()}`),
    apiAxios.get('/servicio/leanglobal/obtenerCNXLoad')
  ])
  const base = Array.isArray(data?.datos) ? data.datos : []
  const conexionBase = base.filter(s => Number(s?.id_area) === 8 && Number(s?.id_template) !== 153)
  const loadRows = Array.isArray(loadsData) ? loadsData : []
  const loadIdPlanC = new Set(
    loadRows
      .filter(r => isPlanCLoadFromObservaciones(r?.observaciones))
      .map(r => Number(r?.id_load || 0))
      .filter(v => v > 0)
  )
  const conexion = conexionBase.filter((s) => {
    const loadId = Number(s?.id_load || 0)
    if (!loadId) return false
    const belongsPlanC = loadIdPlanC.has(loadId)
    return isPlanCMode() ? belongsPlanC : !belongsPlanC
  })
  const keys = new Set()

  const sinClave = []
  for (const s of conexion) {
    const keyDirect = makeFechaIcOrdenKey(
      s?.fecha_plan_ini || s?.fecha_plan_fin || '',
      s?.ic_sap_mg || s?.ic_sap || '',
      s?.orden || s?.nmro_orden_mg || ''
    )
    if (keyDirect) keys.add(keyDirect)
    else sinClave.push(Number(s?.id_survey || 0))
  }

  if (!sinClave.length) return keys

  const detalles = await Promise.all(
    sinClave.map(async (id) => {
      if (!id) return null
      try {
        const resp = await apiAxios.get(`/servicio/leanglobal/procesosSurveyDetail?id_survey=${id}`)
        const d = Array.isArray(resp?.data) ? resp.data[0] : (resp?.data?.surveyDetail?.[0] || resp?.data)
        const vals = getBodyValuesLocal(d?.body_exec || d?.json_exec)
        const ic = pickFirstValue(vals, ['IC-SAP', 'IC SAP', 'IC SAP MG', 'IC_SAP MG', 'IC_SAP', 'IC'])
        const orden = pickFirstValue(vals, ['NMRO ORDEN MG', 'NRO ORDEN', 'NRO_ORDEN', 'NUMERO ORDEN', 'ORDEN'])
        const fecha = d?.fecha_plan_ini || d?.fecha_plan_fin || pickFirstValue(vals, ['FECHA PLAN', 'FECHA'])
        return makeFechaIcOrdenKey(fecha, ic, orden) || null
      } catch {
        return null
      }
    })
  )

  for (const k of detalles) {
    if (k) keys.add(k)
  }

  return keys
}

function setAttrPrefill(seed, label, value) {
  const attr = findAttrByLabel(seed, label)
  if (!attr) return false

  const v = String(value ?? '').trim()

  // comboBox: guardar en values.selected (value) para que quede consistente en body_exec
  if (String(attr.type || '').toLowerCase() === 'combobox' && attr.values && Array.isArray(attr.values.options)) {
    const options = attr.values.options || []
    const normalizedInput = norm(v)
    const byValue = options.find(o => norm(o?.value) === normalizedInput)
    const byLabel = options.find(o => norm(o?.label) === normalizedInput)
    const selected = (byValue || byLabel)?.value ?? v
    attr.values.selected = selected
  }

  attr.default = v
  attr.value = v
  attr.answer = v
  attr.respuesta = v

  return true
}

function setAttrIfNotBlank(seed, seedLabel, rawValue) {
  if (isBlank(rawValue)) return false
  return setAttrPrefill(seed, seedLabel, rawValue)
}

const EXCEL_TO_BODYEXEC = {
  'CONTRATISTA': 'CONTRATISTA',
  'CERTIFICADORA': 'Certificadora',
  'PROYECTO': 'Proyecto',
  'TIPO': 'Tipo',
  'IC_SAP': 'IC_SAP MG',
  'ORDEN': 'nmro orden MG',
  'GIO': 'GIO',
  'FECHA': 'FECHA',
  'DIRECCION': 'Dirección',
  'COMUNA': 'Comuna',
  'CLIENTE': 'Cliente',
  'FONO': 'Fonos',
  'OBSERVACION': 'Observación',
  'CODIGO': 'Códigos',
  'RUT': 'RUT'
}

function applyExcelRowToBodyExec(bodyExec, fila) {
  let cambios = 0
  const faltantes = []

  // Iteramos sobre nuestro mapa de "Header Excel" -> "Label Template"
  for (const [excelHeader, labelDestino] of Object.entries(EXCEL_TO_BODYEXEC)) {
    // Buscamos el valor en la fila del Excel usando fuzzy match
    const value = getCellByHeader(fila, excelHeader)

    // Si no encontramos valor, probamos variantes comunes para ciertos campos
    let finalValue = value
    if (isBlank(finalValue)) {
      if (excelHeader === 'ORDEN') finalValue = getCellByHeader(fila, 'NRO_ORDEN') || getCellByHeader(fila, 'NUMERO')
      if (excelHeader === 'FONO') finalValue = getCellByHeader(fila, 'TELEFONO') || getCellByHeader(fila, 'CELULAR')
      if (excelHeader === 'OBSERVACION') finalValue = getCellByHeader(fila, 'OBS') || getCellByHeader(fila, 'COMENTARIO')
      if (excelHeader === 'PROYECTO') finalValue = getCellByAnyHeader(fila, ['NOMBRE PROYECTO', 'PROY', 'PROYECT'])
      if (excelHeader === 'TIPO') finalValue = getCellByAnyHeader(fila, ['TIPO', 'TIPO CONEXION', 'TIPO_CONEXION'])
      if (excelHeader === 'IC_SAP') finalValue = getCellByAnyHeader(fila, ['IC-SAP', 'IC SAP', 'IC SAP MG', 'IC_SAP MG', 'IC'])
    }

    if (excelHeader === 'FECHA') finalValue = normalizeDateKey(finalValue) || finalValue

    // Si CLIENTE viene nulo/vacío en Excel, dejar explícitamente "-" en body_exec.
    if (excelHeader === 'CLIENTE' && isBlank(finalValue)) {
      const okBlankCliente = setAttrPrefill(bodyExec, labelDestino, '-')
      if (okBlankCliente) cambios++
      else faltantes.push(labelDestino)
      continue
    }

    if (isBlank(finalValue)) continue

    // Intentamos setear el atributo en el body_exec
    const ok = setAttrIfNotBlank(bodyExec, labelDestino, finalValue)
    if (ok) {
      cambios++
    } else {
      // Intento de fallback para etiquetas plurales/singulares si falla la exacta
      // (aunque 'labelDestino' debería ser exacta según el JSON del usuario)
      faltantes.push(labelDestino)
    }
  }

  // Debug: avisar si hay campos del mapa que no se pudieron volcar al template
  // (porque el template no tiene ese label, o porque el excel no traía dato)
  // if (faltantes.length) {
  //   console.warn('[ExcelPreview] Labels no encontrados en template o sin datos:', faltantes)
  // }

  return cambios
}

function upsertIdLoadInBodyExec(bodyExec, idLoad) {
  const idLoadNum = Number(idLoad || 0)
  if (!idLoadNum || !bodyExec || typeof bodyExec !== 'object') return false

  const labelCandidates = ['id_load', 'ID LOAD', 'ID_LOAD', 'LOAD ID']
  for (const label of labelCandidates) {
    if (setAttrPrefill(bodyExec, label, String(idLoadNum))) return true
  }

  if (!Array.isArray(bodyExec.segmentos)) bodyExec.segmentos = []
  let segmento = bodyExec.segmentos.find(s => String(s?.label || '').trim().toUpperCase() === 'DATOS CARGA')
  if (!segmento) {
    segmento = {
      label: 'DATOS CARGA',
      touch: false,
      posicion: 998,
      collapsible: true,
      attributes: []
    }
    bodyExec.segmentos.push(segmento)
  }
  if (!Array.isArray(segmento.attributes)) segmento.attributes = []

  segmento.attributes.push({
    type: 'textField',
    label: 'id_load',
    default: String(idLoadNum),
    value: String(idLoadNum),
    answer: String(idLoadNum),
    respuesta: String(idLoadNum),
    nullable: true,
    readOnly: true
  })
  return true
}

</script>
<style scoped>
tbody tr:hover {
  filter: brightness(0.97);
}
</style>
