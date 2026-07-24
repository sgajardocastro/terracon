<template>
  <v-container class="pa-3">
    <v-card
      variant="outlined"
      class="mx-auto"
      max-width="720"
    >
      <v-card-title class="d-flex flex-column align-start ga-1">
        <span class="text-h6">Equipamiento</span>
        <span class="text-caption text-medium-emphasis">Ruta PWA: /equipamiento?id=XX</span>
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
              {{ equipo.nombre_equipo || '-' }}
            </div>
            <div class="text-body-2 text-medium-emphasis">
              Responsable: {{ equipo.nombre_responsable || '-' }}
            </div>
            <div class="d-flex align-center justify-space-between ga-2 flex-wrap">
              <v-chip
                size="small"
                variant="outlined"
              >
                Serie: {{ equipo.serie || '-' }}
              </v-chip>
              <v-chip
                size="small"
                variant="outlined"
              >
                Tipo: {{ equipo.tipo_equipo || '-' }}
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
                <span class="text-caption text-medium-emphasis">Estado Calibracion</span>
                <ResumenEstado :doc="getLatestDoc(equipo.id_equipo)" />
              </div>
            </div>
            <div class="estado-item">
              <div class="estado-line">
                <span class="text-caption text-medium-emphasis">Ultima Calibracion</span>
                <span class="text-caption">{{ formatDate(getLatestDoc(equipo.id_equipo)?.fecha_ult_calibracion) }}</span>
              </div>
            </div>
            <div class="estado-item">
              <div class="estado-line">
                <span class="text-caption text-medium-emphasis">Proxima Calibracion</span>
                <span class="text-caption">{{ formatDate(getLatestDoc(equipo.id_equipo)?.fecha_prox_calibracion) }}</span>
              </div>
            </div>
            <div class="estado-item">
              <div class="estado-line">
                <span class="text-caption text-medium-emphasis">Presion</span>
                <span class="text-caption">{{ getLatestDoc(equipo.id_equipo)?.json_data?.presion || 'NA' }}</span>
              </div>
            </div>
            <div class="estado-item">
              <div class="estado-line">
                <span class="text-caption text-medium-emphasis">Certificaciones</span>
                <span class="text-caption">{{ getDocsForEquipo(equipo.id_equipo).length }}</span>
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
const usersMap = ref({})

const idEquipamiento = computed(() => {
  const n = Number(route.query?.id)
  return Number.isFinite(n) ? n : null
})

onMounted(fetchEquipamientoByRoute)
watch(() => route.query?.id, fetchEquipamientoByRoute)

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

async function fetchEquipamientoByRoute() {
  const id = idEquipamiento.value
  if (!id) {
    equipo.value = null
    error.value = 'Debes indicar un id valido en la URL. Ejemplo: /equipamiento?id=8'
    return
  }

  loading.value = true
  error.value = ''
  equipo.value = null

  try {
    const [equiposRes, resumenRes, usuariosRes] = await Promise.all([
      apiAxios.get('/tequ-equipos'),
      apiAxios.get('/servicio/leanglobal/obtenerDocumentacionResumen'),
      apiAxios.get('/servicio/leanglobal/obtenerUsuarios')
    ])

    const equiposRaw = Array.isArray(equiposRes?.data?.data) ? equiposRes.data.data : []
    const resumenRaw = Array.isArray(resumenRes?.data) ? resumenRes.data : []
    const usuariosRaw = Array.isArray(usuariosRes?.data) ? usuariosRes.data : []

    const e = equiposRaw.find(x => Number(x.id_equipo) === id) || null

    if (!e) {
      equipo.value = null
      error.value = `No se encontro el equipamiento con id ${id}.`
      docsResumen.value = []
      docsDetail.value = {}
      return
    }

    const tipo = normalizeText(e?.tipo_equipo || e?.elemento || '')
    if (tipo.includes('equipo movil') || tipo.includes('vehiculo')) {
      error.value = `El id ${id} existe, pero corresponde a un equipo movil. Usa /vehiculos?id=${id}.`
      equipo.value = null
      docsResumen.value = []
      docsDetail.value = {}
      return
    }

    usersMap.value = {}
    for (const u of usuariosRaw) {
      usersMap.value[Number(u.id_user)] = `${u.name_frst || ''} ${u.apellido_pat || ''}`.trim() || `Usuario ${u.id_user}`
    }

    const responsableId = toNum(e?.json_data?.id_usuario_asignado) ?? toNum(e?.id_usuario_creacion)

    equipo.value = {
      id_equipo: id,
      nombre_equipo: e?.marca || e?.json_data?.nombre || e?.elemento || '',
      marca: e?.marca || '',
      serie: e?.numero_serie || '',
      tipo_equipo: e?.tipo_equipo || e?.elemento || '',
      nombre_responsable: usersMap.value[responsableId] || '-',
      id_usuario_asignado: toNum(e?.json_data?.id_usuario_asignado),
      id_usuario_creacion: toNum(e?.id_usuario_creacion)
    }

    docsResumen.value = resumenRaw.filter(d => Number(d.id_equipo) === id)
    await fetchDocsDetail(id)
  } catch (e) {
    console.error('Error cargando equipamiento:', e)
    error.value = 'No se pudo cargar el equipamiento.'
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

function getLatestDoc(idEquipo) {
  return getDocsForEquipo(idEquipo)[0] || null
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
  const latest = getLatestDoc(idEquipo)
  if (!latest) return 'grey'
  const st = getEstadoText(latest.fecha_prox_calibracion)
  if (st === 'VENCIDO') return 'error'
  if (st === 'POR VENCER') return 'warning'
  if (st === 'VIGENTE') return 'success'
  return 'grey'
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
