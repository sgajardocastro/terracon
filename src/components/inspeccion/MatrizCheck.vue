<template>
  <div class="py-2">
    <v-table
      density="compact"
      class="text-caption"
      fixed-header
    >
      <!-- Anchos por columna (omitimos Puntaje usando leaf indices) -->
      <colgroup>
        <col
          v-for="(w, i) in columnWidths(attr)"
          :key="'col-'+i"
          :style="w ? { width: w } : null"
        >
      </colgroup>

      <!-- CABECERA -->
      <thead>
        <tr
          v-for="(hdrRow, rIdx) in attr.headers"
          :key="'hdr-' + rIdx"
        >
          <th
            v-for="(cell, cIdx) in hdrRow"
            v-if="!isPuntajeHeaderCell(cell)"
            :key="'hdr-cell-' + rIdx + '-' + cIdx"
            class="text-center"
            :rowspan="cell.rowspan || 1"
            :colspan="cell.colspan || 1"
            :style="{
              verticalAlign: 'middle',
              fontWeight: 600,
              ...(cell.width ? { width: cell.width } : {})
            }"
          >
            {{ cell.label }}
          </th>
        </tr>
      </thead>

      <!-- CUERPO -->
      <tbody>
        <tr
          v-for="(row, rIdx) in (attr.__editing ? attr.__draftBody : attr.body)"
          :key="'row-' + rIdx"
        >
          <td
            v-for="(cell, cIdx) in row"
            v-if="!isHiddenLeafIndex(attr, cIdx)"
            :key="'cell-' + rIdx + '-' + cIdx"
            :style="{ textAlign: cellAlign(cell) }"
          >
            <!-- EDICIÓN -->
            <template v-if="attr.__editing">
              <!-- No editable: texto -->
              <template v-if="!isEditable(cell)">
                {{ cell?.value ?? '' }}
              </template>

              <!-- Editable por tipo -->
              <template v-else>
                <!-- SELECT SI/NO/N/A -->
                <v-select
                  v-if="cell?.type === 'check'"
                  v-model="attr.__draftBody[rIdx][cIdx].value"
                  :items="['SI','NO','N/A']"
                  density="compact"
                  hide-details
                  variant="underlined"
                  clearable
                  @update:model-value="val => { onCheckChange(attr.__draftBody[rIdx][cIdx], val); recomputeAndPersistMCheck(attr); }"
                />

                <!-- NUMÉRICO (aunque se oculte la columna, si está en datos no molesta) -->
                <v-text-field
                  v-else-if="cell?.type === 'number'"
                  v-model.number="attr.__draftBody[rIdx][cIdx].value"
                  type="number"
                  inputmode="decimal"
                  step="any"
                  :min="0"
                  density="compact"
                  hide-details
                  variant="underlined"
                  @keypress="onlyNumberKeypress"
                  @blur="() => { sanitizeNumber(attr.__draftBody[rIdx][cIdx]); recomputeAndPersistMCheck(attr); }"
                />

                <!-- IMAGEN -->
                <template v-else-if="cell?.type === 'image'">
                  <div
                    v-if="cell.galeria?.length"
                    class="img-wrap"
                  >
                    <v-img
                      :src="cell.galeria[0].url || cell.galeria[0].base64"
                      aspect-ratio="1"
                      cover
                      class="rounded-lg"
                      style="width: 120px; height: 120px;"
                    >
                      <template #default>
                        <v-btn
                          icon
                          size="small"
                          color="red"
                          class="ma-2"
                          style="position: absolute; top: 0; right: 0; z-index: 2;"
                          @click.stop="removeImageMatriz(attr, rIdx, cIdx)"
                        >
                          <v-icon>mdi-close</v-icon>
                        </v-btn>
                      </template>
                    </v-img>

                    <v-btn
                      icon
                      size="small"
                      variant="text"
                      :disabled="!!cell.galeria.length"
                      :title="'Tomar foto'"
                      @click="openCameraForCell(rIdx, cIdx)"
                    >
                      <v-icon>mdi-camera</v-icon>
                    </v-btn>

                    <input
                      :id="imageInputId(rIdx, cIdx)"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      style="display:none"
                      @change="(e) => onPickImageMatriz(e, attr, rIdx, cIdx)"
                    >
                  </div>

                  <div
                    v-else
                    class="img-empty"
                  >
                    <v-btn
                      icon
                      size="small"
                      variant="text"
                      :title="'Tomar foto'"
                      @click="openCameraForCell(rIdx, cIdx)"
                    >
                      <v-icon>mdi-camera</v-icon>
                    </v-btn>
                    <input
                      :id="imageInputId(rIdx, cIdx)"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      style="display:none"
                      @change="(e) => onPickImageMatriz(e, attr, rIdx, cIdx)"
                    >
                  </div>
                </template>

                <!-- TEXTO por defecto -->
                <v-text-field
                  v-else
                  v-model="attr.__draftBody[rIdx][cIdx].value"
                  density="compact"
                  variant="underlined"
                  hide-details
                />
              </template>
            </template>

            <!-- LECTURA -->
            <template v-else>
              {{ cell?.value ?? '' }}
            </template>
          </td>
        </tr>
      </tbody>

      <!-- PIE -->
      <tfoot>
        <!-- Caso 1: SÍ existe "Puntaje" en el header (mismo layout de antes) -->
        <template v-if="hasPuntajeHeader(attr)">
          <!-- Puntaje Obtenido -->
          <tr>
            <td
              v-if="puntajeColIndexVisible(attr) > 0"
              :colspan="puntajeColIndexVisible(attr)"
              style="text-align:right; font-weight:600;"
            >
              Puntaje Obtenido
            </td>
            <td style="text-align:center; font-weight:600;">
              {{ mcheckMetrics(attr).obtenido }}
            </td>
            <td
              v-if="getVisibleColCount(attr) - puntajeColIndexVisible(attr) - 1 > 0"
              :colspan="getVisibleColCount(attr) - puntajeColIndexVisible(attr) - 1"
            />
          </tr>

          <!-- Puntaje Máximo -->
          <tr>
            <td
              v-if="puntajeColIndexVisible(attr) > 0"
              :colspan="puntajeColIndexVisible(attr)"
              style="text-align:right; font-weight:600;"
            >
              Puntaje Máximo
            </td>
            <td style="text-align:center; font-weight:600;">
              {{ mcheckMetrics(attr).maximo }}
            </td>
            <td
              v-if="getVisibleColCount(attr) - puntajeColIndexVisible(attr) - 1 > 0"
              :colspan="getVisibleColCount(attr) - puntajeColIndexVisible(attr) - 1"
            />
          </tr>

          <!-- Desempeño -->
          <tr>
            <td
              v-if="puntajeColIndexVisible(attr) > 0"
              :colspan="puntajeColIndexVisible(attr)"
              style="text-align:right; font-weight:600;"
            >
              Desempeño
            </td>
            <td style="text-align:center; font-weight:600;">
              {{ mcheckMetrics(attr).desempeno }}
            </td>
            <td
              v-if="getVisibleColCount(attr) - puntajeColIndexVisible(attr) - 1 > 0"
              :colspan="getVisibleColCount(attr) - puntajeColIndexVisible(attr) - 1"
            />
          </tr>
        </template>

        <!-- Caso 2: NO existe "Puntaje" en el header -->
        <template v-else>
          <tr>
            <td
              :colspan="getVisibleColCount(attr)"
              style="text-align:center;"
            >
              <table
                class="text-caption"
                style="width:100%; border-collapse:collapse; table-layout:fixed; margin:0 auto;"
                role="presentation"
              >
                <tr>
                  <td style="text-align:right; width:50%; padding:6px 8px; white-space:nowrap;">
                    <strong>Puntaje Obtenido:</strong>
                  </td>
                  <td style="text-align:left; width:50%; padding:6px 8px;">
                    {{ mcheckMetrics(attr).obtenido }}
                  </td>
                </tr>
                <tr>
                  <td style="text-align:right; width:50%; padding:6px 8px; white-space:nowrap;">
                    <strong>Puntaje Máximo:</strong>
                  </td>
                  <td style="text-align:left; width:50%; padding:6px 8px;">
                    {{ mcheckMetrics(attr).maximo }}
                  </td>
                </tr>
                <tr>
                  <td style="text-align:right; width:50%; padding:6px 8px; white-space:nowrap;">
                    <strong>Desempeño:</strong>
                  </td>
                  <td style="text-align:left; width:50%; padding:6px 8px;">
                    {{ mcheckMetrics(attr).desempeno }}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </template>
      </tfoot>
    </v-table>

    <!-- BOTONES -->
    <div class="mt-2 d-flex ga-2">
      <template v-if="attr.__editing">
        <v-btn
          size="small"
          variant="text"
          @click="cancelInlineUpdate(attr)"
        >
          Cancelar
        </v-btn>
        <v-btn
          size="small"
          color="primary"
          @click="acceptInlineUpdate(attr)"
        >
          Aceptar
        </v-btn>
      </template>
      <template v-else>
        <v-btn
          size="small"
          color="primary"
          @click="startInlineUpdate(attr)"
        >
          Editar
        </v-btn>
      </template>
    </div>
  </div>
</template>

<script setup>
import { toRef, onMounted, toRaw } from 'vue'

/* ===== Props ===== */
const props = defineProps({
  attr: { type: Object, required: true }
})
const attr = toRef(props, 'attr')

/* ===== Helpers visuales ===== */
const checkItems = ['SI','NO','N/A']
const isFalseyEditFlag = (v) => v === false || v === 'false' || v === 0 || v === '0'
const isEditable = (cell) => !isFalseyEditFlag(cell?.editable)
function onCheckChange(cell, val){ cell.value = (val ?? '').toString().trim().toUpperCase() }
function onlyNumberKeypress(e){
  const ch = e.key
  const ok = /[0-9.,]/.test(ch) || ['Backspace','Delete','ArrowLeft','ArrowRight','Tab'].includes(ch)
  if (!ok) e.preventDefault()
}
function sanitizeNumber(cell){
  let s = String(cell?.value ?? '').trim()
  if (s === '') { cell.value = ''; return }
  s = s.replace(/\s+/g, '').replace(/\./g, '').replace(',', '.')
  const n = parseFloat(s)
  cell.value = Number.isFinite(n) ? n : ''
}
function cellAlign(cell){
  const v = cell?.['text-align'] ?? cell?.textAlign ?? cell?.['text-aling']
  if (v === 'left') return 'left'
  if (v === 'right') return 'right'
  return 'center'
}

/* ===== Cálculo columnas / ancho ===== */
function sumCols(row = []){ return row.reduce((acc, c) => acc + (Number(c?.colspan) || 1), 0) }
function getLeafColCount(headers = [], body = []){
  if (!Array.isArray(headers)) headers = []
  if (!Array.isArray(body)) body = []
  const first = headers[0] ? sumCols(headers[0]) : 0
  const last  = headers[headers.length - 1] ? sumCols(headers[headers.length - 1]) : 0
  const byBody = body[0]?.length || 0
  return Math.max(first, last, byBody)
}
function makeEmptyRow(w){ return Array.from({ length: w }, () => ({ value: '' })) }
function normalizeBodyRows(body = [], w){
  return body.map(r => {
    const row = Array.isArray(r) ? r.slice() : []
    if (row.length < w) return row.concat(Array.from({ length: w - row.length }, () => ({ value: '' })))
    if (row.length > w) return row.slice(0, w)
    return row
  })
}

/* ========== OCULTAR “Puntaje” (robusto con colspans) ========== */
// Expande la fila hoja del header a labels por índice de columna real
function leafLabels(localAttr){
  const hdrs = localAttr?.headers || []
  const leaf = hdrs[hdrs.length - 1] || []
  const labels = []
  for (const c of leaf){
    const span = Number(c?.colspan ?? 1) || 1
    const label = (c?.label ?? '').toString().trim().toLowerCase()
    for (let i=0;i<span;i++) labels.push(label)
  }
  return labels
}
// Índices hoja a ocultar (todas las columnas “puntaje”)
function puntajeLeafIndexes(localAttr){
  const labels = leafLabels(localAttr)
  const idxs = []
  labels.forEach((l, i) => { if (l === 'puntaje') idxs.push(i) })
  return idxs
}
function isHiddenLeafIndex(localAttr, idx){
  const set = new Set(puntajeLeafIndexes(localAttr))
  return set.has(idx)
}
function hasPuntajeHeader(localAttr){
  return puntajeLeafIndexes(localAttr).length > 0
}
function puntajeColIndex(localAttr){
  const arr = puntajeLeafIndexes(localAttr)
  return arr.length ? arr[0] : -1
}
function puntajeColIndexVisible(localAttr){
  return Math.max(puntajeColIndex(localAttr), 0)
}
function getVisibleColCount(localAttr){
  const totalLeaf = leafLabels(localAttr).length
  const hidden = puntajeLeafIndexes(localAttr).length
  return Math.max(totalLeaf - hidden, 0)
}
// Para header (celda con label “puntaje”, sin importar colspan)
function isPuntajeHeaderCell(cell){
  const lbl = (cell?.label ?? '').toString().trim().toLowerCase()
  return lbl === 'puntaje'
}
// Colgroup basado en la fila hoja, omitiendo “puntaje”
function columnWidths(localAttr){
  const hdrs = localAttr?.headers || []
  const leaf = hdrs[hdrs.length - 1] || []
  const widths = []
  for (const cell of leaf){
    const span = Number(cell?.colspan ?? 1) || 1
    const w = cell?.width || ''
    const lbl = (cell?.label ?? '').toString().trim().toLowerCase()
    if (lbl === 'puntaje') continue // omite todas sus “slots”
    for (let i=0;i<span;i++) widths.push(w)
  }
  return widths
}

/* ===== IMAGEN ===== */
const imageInputId = (rIdx, cIdx) => `matrizcheck-img-input-${rIdx}-${cIdx}`
function openCameraForCell(rIdx, cIdx){
  const el = document.getElementById(imageInputId(rIdx, cIdx))
  if (el) el.click()
}
function removeImageMatriz(localAttr, rIdx, cIdx){
  const cell = localAttr.__editing ? localAttr.__draftBody?.[rIdx]?.[cIdx] : localAttr.body?.[rIdx]?.[cIdx]
  if (!cell) return
  cell.galeria = []
  cell.value = ''
}
async function onPickImageMatriz(event, localAttr, rIdx, cIdx){
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file || !file.type.startsWith('image/')) return
  const cell = localAttr.__editing ? localAttr.__draftBody?.[rIdx]?.[cIdx] : localAttr.body?.[rIdx]?.[cIdx]
  if (!cell) return
  const quality = (() => {
    const q = Number(cell.compression ?? 0.1)
    if (q <= 1) return Math.max(0.1, Math.min(1, q))
    return Math.max(0.1, Math.min(1, q / 100))
  })()
  try {
    const dataUrl = await compressImageToDataURL(file, quality, 800, 800)
    const dataArchivo = await uploadFileFromBase64(dataUrl, file.name, file.type)
    if (dataArchivo?.archivo?.name_doc_interno) {
      const obj = {
        base64: '',
        url: '/archivo/terracon/' + dataArchivo.archivo.name_doc_interno,
        nombre: dataArchivo.archivo.name_doc_interno
      }
      cell.galeria = [obj]
      cell.value = obj.nombre || 'foto'
    }
  } catch (e) { console.error(e) }
}
function compressImageToDataURL(file, quality=0.1, maxW=800, maxH=800){
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()
    reader.onload = (e) => {
      img.onload = () => {
        let { width, height } = img
        const scale = Math.min(1, maxW/width, maxH/height)
        const w = Math.round(width * scale), h = Math.round(height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w; canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
function base64ToFile(base64, filename, mime){
  const arr = base64.split(',')
  const bstr = atob(arr[1] || '')
  const u8 = new Uint8Array(bstr.length)
  for (let i=0;i<bstr.length;i++) u8[i] = bstr.charCodeAt(i)
  return new File([u8], filename, { type: mime || 'image/jpeg' })
}
async function uploadFileFromBase64(base64Data, originalName, mimeType){
  const file = base64ToFile(base64Data, originalName, mimeType)
  const formData = new FormData()
  formData.append('archivo', file)
  formData.append('tipo_doc', 'DOCUMENTO')
  formData.append('mimetype', file.type)
  formData.append('name_doc_orig', file.name)
  formData.append('name_doc_interno', '')
  formData.append('path_doc', '/u05/LeanDocs/terracon/')
  formData.append('id_user', 1)
  formData.append('estado', '1')
  try {
    const { data } = await apiAxios.post(
      '/archivo/imagen',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return data
  } catch (e){ console.error('Upload error:', e); return null }
}

/* ===== Métricas (SI=10, NO=0, N/A no cuenta) ===== */
const MCHECK_MAX_PER_ITEM = 10
function normalizeCheck(v){
  const s = (v ?? '').toString().trim().toLowerCase()
  if (['si','sí'].includes(s)) return 'si'
  if (s === 'no') return 'no'
  if (s === 'n/a' || s === 'na') return 'n/a'
  return s
}
function toNumber(val){
  if (val === null || val === undefined) return 0
  const s = String(val).trim().replace(/\./g, '').replace(',', '.')
  const n = parseFloat(s)
  return Number.isFinite(n) ? n : 0
}
function mcheckMetrics(localAttr){
  const rows = localAttr?.__editing ? (localAttr.__draftBody || []) : (localAttr?.body || [])
  const firstRow = rows?.[0] || []
  let checkIdx = firstRow.findIndex(c => (c?.type || '').toLowerCase() === 'check')
  if (checkIdx < 0) checkIdx = 0

  const maxPorItem = Number(localAttr.maxScore ?? localAttr.maxPuntaje ?? MCHECK_MAX_PER_ITEM)

  let obtenido = 0, maximo = 0
  for (const row of rows){
    if (!Array.isArray(row)) continue
    const chk = normalizeCheck(row?.[checkIdx]?.value)
    if (chk === 'si'){
      obtenido += maxPorItem
      maximo   += maxPorItem
    } else if (chk === 'no'){
      maximo   += maxPorItem
    }
  }
  const desempeno = maximo > 0 ? `${Math.round((obtenido / maximo) * 100)}%` : '0%'
  return { obtenido, maximo, desempeno }
}
function getMCheckColCount(localAttr){
  const leafCount = leafLabels(localAttr).length
  return leafCount
}
// Compatibilidad
function getMCheckIndexes(localAttr){
  const firstRow = (localAttr.__editing ? localAttr.__draftBody : localAttr.body)?.[0] || []
  let checkIdx = firstRow.findIndex(c => (c?.type || '').toLowerCase() === 'check')
  let numIdx   = -1
  if (checkIdx < 0) checkIdx = 2
  return { checkIdx, numIdx }
}
function ensureFooter(localAttr){
  if (!Array.isArray(localAttr.footer)) localAttr.footer = []
  const def = [
    { label: 'Puntaje Obtenido', value: 0, colspan: 2, puntajeObtenido: 0 },
    { label: 'Puntaje Máximo',   value: 0, colspan: 2, puntajeMaximo: 0 },
    { label: 'Desempeño',        value: '0%', colspan: 2, desempeno: '0%' }
  ]
  for (let i=0;i<def.length;i++){
    if (!localAttr.footer[i]) localAttr.footer[i] = { ...def[i] }
    localAttr.footer[i] = { ...def[i], ...localAttr.footer[i] }
  }
  return localAttr.footer
}
function recomputeAndPersistMCheck(localAttr){
  const rows = localAttr?.__editing ? (localAttr.__draftBody || []) : (localAttr?.body || [])
  const firstRow = rows?.[0] || []
  let checkIdx = firstRow.findIndex(c => (c?.type || '').toLowerCase() === 'check')
  if (checkIdx < 0) checkIdx = 0
  const maxPorItem = Number(localAttr.maxPuntaje || localAttr.maxScore || 10)

  let obtenido = 0, maximo = 0
  for (const row of rows){
    if (!Array.isArray(row)) continue
    const c = (row?.[checkIdx]?.value ?? '').toString().trim().toUpperCase()
    if (c === 'SI'){
      obtenido += maxPorItem
      maximo   += maxPorItem
    } else if (c === 'NO'){
      maximo   += maxPorItem
    }
  }

  const porc = maximo > 0 ? Math.round((obtenido / maximo) * 100) : 0
  const f = ensureFooter(localAttr)
  f[0].value = obtenido;  f[0].puntajeObtenido = obtenido
  f[1].value = maximo;    f[1].puntajeMaximo   = maximo
  f[2].value = `${porc}%`; f[2].desempeno      = `${porc}%`; f[2].desempenoNum = porc
}

/* ===== Edición inline ===== */
function deepClone(o){ return o ? JSON.parse(JSON.stringify(o)) : o }
function ensureDraftForAttr(localAttr){
  const body = Array.isArray(localAttr.body) ? localAttr.body : []
  localAttr.__draftBody = body.map(row =>
    (Array.isArray(row) ? row : []).map(cell => ({
      ...cell, value: cell?.value ?? ''
    }))
  )
  if (localAttr.__draftBody.length === 0){
    localAttr.__draftBody = [[{ value: '', type: 'text', editable: true }]]
  }
}
function startInlineUpdate(localAttr){ ensureDraftForAttr(localAttr); localAttr.__editing = true }
function cancelInlineUpdate(localAttr){ localAttr.__editing = false; delete localAttr.__draftBody }
function acceptInlineUpdate(localAttr){
  localAttr.body = deepClone(localAttr.__draftBody)
  localAttr.__editing = false
  delete localAttr.__draftBody
  recomputeAndPersistMCheck(localAttr)
}
function openAgregarFila(localAttr){
  const w = getLeafColCount(localAttr.headers, localAttr.__editing ? localAttr.__draftBody : localAttr.body)
  if (localAttr.__editing){
    localAttr.__draftBody ||= []
    localAttr.__draftBody = normalizeBodyRows(localAttr.__draftBody, w)
    localAttr.__draftBody.push(makeEmptyRow(w))
  } else {
    localAttr.body ||= []
    localAttr.body = normalizeBodyRows(localAttr.body, w)
    localAttr.body.push(makeEmptyRow(w))
  }
  recomputeAndPersistMCheck(localAttr)
}

// 2) helper para stringify seguro (evita ciclos y BigInt)
function safeStringify(obj){
  const seen = new WeakSet()
  return JSON.stringify(
    obj,
    (k, v) => {
      if (typeof v === 'bigint') return v.toString()
      if (v && typeof v === 'object'){
        if (seen.has(v)) return '[Circular]'
        seen.add(v)
      }
      return v
    },
    2 // pretty print
  )
}

// --- helpers para limpiar el JSON sin tocar el template ---
function normLabel(x){
  return (x ?? '')
    .toString()
    .replace(/\s+/g, ' ') // colapsa espacios / saltos
    .trim()
    .toLowerCase()
}

function findHeaderPuntajeIndex(localAttr){
  const row0 = Array.isArray(localAttr?.headers?.[0]) ? localAttr.headers[0] : []
  return row0.findIndex(c => normLabel(c?.label) === 'puntaje')
}

function findNumberColIndex(localAttr){
  const pick = (rows) => Array.isArray(rows) && rows[0]
    ? rows[0].findIndex(c => (c?.type || '').toLowerCase() === 'number')
    : -1
  const i1 = pick(localAttr?.body)
  if (i1 >= 0) return i1
  const i2 = pick(localAttr?.__draftBody)
  return i2
}

/** Quita "Puntaje" del header y la col "number" del body/draft (si existen). */
function stripPuntajeFromJson(localAttr){
  if (!localAttr || typeof localAttr !== 'object') return

  // 1) header
  const hIdx = findHeaderPuntajeIndex(localAttr)
  if (hIdx >= 0 && Array.isArray(localAttr.headers?.[0])) {
    localAttr.headers[0].splice(hIdx, 1)
  }

  // 2) body / draft: por índice del header si existe; si no, por 1ra columna "number"
  const colIdx = hIdx >= 0 ? hIdx : findNumberColIndex(localAttr)
  if (colIdx >= 0) {
    if (Array.isArray(localAttr.body)) {
      localAttr.body = localAttr.body.map(r => Array.isArray(r) ? r.filter((_, i) => i !== colIdx) : r)
    }
    if (Array.isArray(localAttr.__draftBody)) {
      localAttr.__draftBody = localAttr.__draftBody.map(r => Array.isArray(r) ? r.filter((_, i) => i !== colIdx) : r)
    }
  }
}
/* ===== Init ===== */
onMounted(() => {
  const rawAttr = toRaw(attr.value)
  console.log('MatrizCheck mounted (raw JSON):\n', safeStringify(rawAttr))
  stripPuntajeFromJson(attr.value)
  ensureFooter(attr.value)
  recomputeAndPersistMCheck(attr.value)
  startInlineUpdate(attr.value)
})
</script>

<style scoped>
.img-wrap{ display:flex; flex-direction:column; align-items:center; gap:6px; }
.img-empty{ display:flex; justify-content:center; }
</style>
