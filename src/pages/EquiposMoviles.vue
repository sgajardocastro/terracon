<template>
  <v-container class="pa-3">
    <v-card
      variant="outlined"
      class="mx-auto"
      max-width="720"
    >
      <v-card-title class="d-flex flex-column align-start ga-1">
        <span class="text-h6">Equipo Movil</span>
        <span class="text-caption text-medium-emphasis">Ruta publica: /vehiculos?id=XX</span>
      </v-card-title>

      <v-card-text>
        <div
          v-if="loading"
          class="text-center py-8"
        >
          <v-progress-circular
            indeterminate
            color="primary"
          />
        </div>

        <v-alert
          v-else-if="error"
          type="warning"
          variant="tonal"
          density="comfortable"
        >
          {{ error }}
        </v-alert>

        <template v-else-if="equipo">
          <div class="d-flex flex-column ga-2 mb-4">
            <div class="text-subtitle-1 font-weight-bold">
              {{ equipo.nombre_vehiculo || '-' }}
            </div>
            <div class="text-body-2 text-medium-emphasis">
              Responsable: {{ equipo.nombre_responsable || '-' }}
            </div>
            <div class="d-flex align-center justify-space-between ga-2 flex-wrap">
              <v-chip
                size="small"
                variant="outlined"
              >
                Patente: {{ equipo.patente || '-' }}
              </v-chip>
              <v-chip
                size="small"
                variant="tonal"
                :color="chipColorGlobal(equipo.id_equipo)"
              >
                {{ chipLabelGlobal(equipo.id_equipo) }}
              </v-chip>
            </div>
          </div>

          <div class="estado-grid mb-4">
            <div class="estado-item">
              <div class="estado-line">
                <span class="text-caption text-medium-emphasis">Revision Tecnica</span>
                <ResumenEstado :doc="getDocSummary(equipo.id_equipo, 'Revision Tecnica')" />
              </div>
            </div>
            <div class="estado-item">
              <div class="estado-line">
                <span class="text-caption text-medium-emphasis">Permiso Circulacion</span>
                <ResumenEstado :doc="getDocSummary(equipo.id_equipo, 'Permiso de Circulacion')" />
              </div>
            </div>
            <div class="estado-item">
              <div class="estado-line">
                <span class="text-caption text-medium-emphasis">Seguro Obligatorio</span>
                <ResumenEstado :doc="getDocSummary(equipo.id_equipo, 'Seguro Obligatorio')" />
              </div>
            </div>
            <div class="estado-item">
              <div class="estado-line">
                <span class="text-caption text-medium-emphasis">Cert Gases</span>
                <ResumenEstado :doc="getDocSummary(equipo.id_equipo, 'Certificado de Gases')" />
              </div>
            </div>
            <div class="estado-item">
              <div class="estado-line">
                <span class="text-caption text-medium-emphasis">Poliza</span>
                <ResumenEstado :doc="getDocSummary(equipo.id_equipo, 'Poliza')" />
              </div>
            </div>
          </div>

          <v-divider class="mb-3" />
          <div class="text-subtitle-2 mb-2">
            Detalle documentos
          </div>

          <template
            v-for="(group, type) in getGroupedDocs(equipo.id_equipo)"
            :key="type"
          >
            <v-card
              variant="tonal"
              class="mb-2"
            >
              <v-card-title class="text-body-2 font-weight-bold py-2">
                {{ type }}
              </v-card-title>
              <v-card-text class="pt-0">
                <div
                  v-for="doc in group"
                  :key="doc.id_acreditacion"
                  class="mb-2"
                >
                  <div class="d-flex align-center justify-space-between ga-2 flex-wrap mb-2">
                    <span class="text-caption">{{ doc.registro_acreditacion || '-' }}</span>
                    <ResumenEstado :doc="doc" />
                  </div>
                  <v-img
                    v-if="getDocPreviewUrl(doc)"
                    :src="getDocPreviewUrl(doc)"
                    width="96"
                    height="96"
                    cover
                    class="doc-thumb"
                    @click="openImagePreview(doc)"
                  />
                  <span
                    v-else
                    class="text-medium-emphasis text-caption"
                  >Sin imagen</span>
                </div>
              </v-card-text>
            </v-card>
          </template>

          <div
            v-if="!Object.keys(getGroupedDocs(equipo.id_equipo)).length"
            class="text-medium-emphasis text-caption"
          >
            Sin documentos.
          </div>
        </template>
      </v-card-text>
    </v-card>

    <v-dialog
      v-model="previewDialog"
      max-width="900"
    >
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between">
          <span class="text-subtitle-1">{{ previewImageName || 'Vista previa' }}</span>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="previewDialog = false"
          />
        </v-card-title>
        <v-card-text class="d-flex justify-center">
          <v-img
            v-if="previewImageUrl"
            :src="previewImageUrl"
            max-width="100%"
            max-height="75vh"
            contain
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import apiAxios from '@/services/api'

const route = useRoute()

const loading = ref(false)
const error = ref('')
const equipo = ref(null)
const docsResumen = ref([])
const docsDetail = ref({})
const docMetaById = ref({})
const previewDialog = ref(false)
const previewImageUrl = ref('')
const previewImageName = ref('')

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
const showOnlyLatest = ref(true)

const docTypes = [
  'Revision Tecnica',
  'Permiso de Circulacion',
  'Seguro Obligatorio',
  'Certificado de Gases',
  'Poliza'
]

const idVehiculo = computed(() => {
  const n = Number(route.query?.id)
  return Number.isFinite(n) ? n : null
})

onMounted(fetchVehiculoByRoute)
watch(() => route.query?.id, fetchVehiculoByRoute)

function normalizeText(v) {
  return String(v ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function toNum(v) {
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

async function fetchVehiculoByRoute() {
  const id = idVehiculo.value
  if (!id) {
    equipo.value = null
    error.value = 'Debes indicar un id valido en la URL. Ejemplo: /vehiculos?id=8'
    return
  }

  loading.value = true
  error.value = ''
  equipo.value = null

  try {
    const [equiposRes, movilesRes, resumenRes] = await Promise.all([
      apiAxios.get('/tequ-equipos'),
      apiAxios.get('/servicio/leanglobal/obtenerEquiposMoviles'),
      apiAxios.get('/servicio/leanglobal/obtenerDocumentacionResumen')
    ])

    const equiposRaw = Array.isArray(equiposRes?.data?.data) ? equiposRes.data.data : []
    const movilesRaw = Array.isArray(movilesRes?.data) ? movilesRes.data : []
    const resumenRaw = Array.isArray(resumenRes?.data) ? resumenRes.data : []

    const e = equiposRaw.find(x => Number(x.id_equipo) === id) || null
    const m = movilesRaw.find(x => Number(x.id_equipo) === id) || null

    if (!e && !m) {
      equipo.value = null
      error.value = `No se encontro el vehiculo con id ${id}.`
      docsResumen.value = []
      docsDetail.value = {}
      return
    }

    const tipo = normalizeText(e?.tipo_equipo || e?.elemento || m?.elemento || '')
    if (e && !tipo.includes('equipo movil') && !tipo.includes('vehiculo')) {
      error.value = `El id ${id} existe, pero no corresponde a un equipo movil.`
      equipo.value = null
      docsResumen.value = []
      docsDetail.value = {}
      return
    }

    equipo.value = {
      id_equipo: id,
      nombre_vehiculo: m?.json_data?.nombre || m?.elemento || e?.json_data?.nombre || '',
      patente: m?.patente || m?.json_data?.patente || e?.json_data?.patente || e?.numero_serie || '',
      nombre_responsable: m?.nombre || '',
      id_usuario_asignado: toNum(m?.id_usuario_asignado ?? e?.json_data?.id_usuario_asignado),
      id_usuario_creacion: toNum(e?.id_usuario_creacion)
    }

    docsResumen.value = resumenRaw.filter(d => Number(d.id_equipo) === id)
    await fetchDocsDetail(id)
  } catch (e) {
    console.error('Error cargando vehiculo:', e)
    error.value = 'No se pudo cargar el vehiculo.'
    equipo.value = null
    docsResumen.value = []
    docsDetail.value = {}
  } finally {
    loading.value = false
  }
}

async function fetchDocsDetail(idEquipo) {
  try {
    const { data } = await apiAxios.get(`/tequ-documentacion/${idEquipo}`)
    docsDetail.value[idEquipo] = Array.isArray(data?.data) ? data.data : []
    await hydrateDocMeta(docsDetail.value[idEquipo])
  } catch (e) {
    console.error(`Error cargando docs de equipo ${idEquipo}:`, e)
    docsDetail.value[idEquipo] = []
  }
}

function getDocId(doc) {
  return Number(doc?.json_data?.id_doc || doc?.json_data?.id_doc_img || 0) || null
}

function isImageFile(name) {
  return /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(String(name || ''))
}

async function hydrateDocMeta(docs) {
  const ids = [...new Set((docs || []).map(getDocId).filter(Boolean))]
  const missing = ids.filter(id => !docMetaById.value[id])
  if (!missing.length) return

  await Promise.all(
    missing.map(async (id) => {
      try {
        const { data } = await apiAxios.get(`/servicio/leanglobal/obtenerTFMGFile?id_doc=${id}`)
        const row = Array.isArray(data) ? data[0] : data
        if (row) docMetaById.value[id] = row
      } catch {
        // ignore
      }
    })
  )
}

function getDocPreviewUrl(doc) {
  const idDoc = getDocId(doc)
  if (!idDoc) return ''

  const meta = docMetaById.value[idDoc]
  const nameOrig = meta?.name_doc_orig || doc?.json_data?.name_doc_orig || doc?.name_doc_orig
  const nameInterno = meta?.name_doc_interno

  if (!isImageFile(nameOrig) || !nameInterno || !API_BASE) return ''
  return `${API_BASE}/archivo/terracon/${nameInterno}`
}

function openImagePreview(doc) {
  const url = getDocPreviewUrl(doc)
  if (!url) return

  const idDoc = getDocId(doc)
  const meta = docMetaById.value[idDoc] || {}
  previewImageUrl.value = url
  previewImageName.value = meta?.name_doc_orig || doc?.json_data?.name_doc_orig || 'Imagen'
  previewDialog.value = true
}

function formatDate(v) {
  if (!v) return '-'
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('es-CL')
}

function getDocsForEquipo(idEquipo) {
  const detail = docsDetail.value[idEquipo]
  const docs = Array.isArray(detail) && detail.length
    ? detail
    : docsResumen.value.filter((d) => Number(d.id_equipo) === Number(idEquipo))
  return [...docs].sort((a, b) => Number(b.id_acreditacion || 0) - Number(a.id_acreditacion || 0))
}

function getGroupedDocs(idEquipo) {
  const groups = {}
  for (const doc of getDocsForEquipo(idEquipo)) {
    const type = doc?.registro_acreditacion || 'Otros'
    if (!groups[type]) groups[type] = []
    groups[type].push(doc)
  }
  if (showOnlyLatest.value) {
    for (const k of Object.keys(groups)) groups[k] = groups[k].slice(0, 1)
  }
  return groups
}

function getDocSummary(idEquipo, tipo) {
  const tipoNorm = normalizeText(tipo)
  const docs = docsResumen.value
    .filter((d) => Number(d.id_equipo) === Number(idEquipo) && normalizeText(d.registro_acreditacion) === tipoNorm)
    .sort((a, b) => Number(b.id_acreditacion || 0) - Number(a.id_acreditacion || 0))
  return docs[0] || null
}

function getEstadoText(fechaVence) {
  if (!fechaVence) return 'NA'
  const hoy = new Date()
  const venc = new Date(fechaVence)
  if (Number.isNaN(venc.getTime())) return 'NA'

  const diffMs = venc.getTime() - hoy.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return 'VENCIDO'
  if (diffDays <= 30) return 'POR VENCER'
  return 'VIGENTE'
}

function chipColorGlobal(idEquipo) {
  const docs = docsResumen.value.filter((d) => Number(d.id_equipo) === Number(idEquipo))

  let hasAlert = false
  let hasWarning = false
  for (const type of docTypes) {
    const doc = docs
      .filter((d) => normalizeText(d.registro_acreditacion) === normalizeText(type))
      .sort((a, b) => Number(b.id_acreditacion || 0) - Number(a.id_acreditacion || 0))[0]

    if (!doc) return 'grey'
    const st = getEstadoText(doc.fecha_prox_calibracion)
    if (st === 'VENCIDO') hasAlert = true
    if (st === 'POR VENCER') hasWarning = true
  }

  if (hasAlert) return 'error'
  if (hasWarning) return 'warning'
  return 'success'
}

function chipLabelGlobal(idEquipo) {
  const c = chipColorGlobal(idEquipo)
  if (c === 'error') return 'Revisar'
  if (c === 'warning') return 'Atencion'
  if (c === 'grey') return 'Incompleto'
  return 'Completo'
}

const ResumenEstado = defineComponent({
  props: {
    doc: { type: Object, default: null }
  },
  setup(props) {
    return () => {
      if (!props.doc) return h('span', { class: 'text-medium-emphasis text-caption' }, 'NA')

      const status = getEstadoText(props.doc.fecha_prox_calibracion)
      const colorClass =
        status === 'VIGENTE'
          ? 'text-success'
          : status === 'POR VENCER'
            ? 'text-warning'
            : status === 'VENCIDO'
              ? 'text-error'
              : 'text-medium-emphasis'

      return h('div', { class: 'd-flex align-center flex-wrap' }, [
        h('span', { class: `text-caption font-weight-bold ${colorClass}` }, status),
        h('span', { class: 'text-caption text-medium-emphasis', style: 'margin-left: 8px; white-space: nowrap;' }, formatDate(props.doc.fecha_prox_calibracion))
      ])
    }
  }
})
</script>

<style scoped>
.estado-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.estado-item {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  padding: 8px;
}

.estado-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: nowrap;
}

.doc-thumb {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  cursor: pointer;
}
</style>
