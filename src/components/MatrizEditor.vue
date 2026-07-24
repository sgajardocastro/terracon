<template>
  <div v-if="attr">
    <div class="d-flex align-center mb-2">
      <h4 class="mb-0">
        {{ attr.label || 'Matriz' }}
      </h4>
      <v-spacer />
      <v-btn
        size="small"
        color="primary"
        @click="openAdd()"
      >
        <v-icon start>
          mdi-plus
        </v-icon> Agregar fila
      </v-btn>
    </div>

    <v-table
      density="comfortable"
      class="text-caption"
    >
      <thead>
        <tr
          v-for="(hdrRow, rIdx) in (attr.headers || [])"
          :key="'hdr-'+rIdx"
        >
          <th
            v-for="(cell, cIdx) in hdrRow"
            :key="'hdr-cell-'+rIdx+'-'+cIdx"
            class="text-left"
            :style="{ width: cell.width || 'auto' }"
            :rowspan="cell.rowspan || 1"
            :colspan="cell.colspan || 1"
          >
            {{ cell.label ?? '' }}
          </th>
          <th
            v-if="rIdx === 0"
            class="text-center"
            :rowspan="headerRowspan"
          >
            Acciones
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-if="(attr.body?.length || 0) === 0">
          <td
            :colspan="colCount + 1"
            class="text-medium-emphasis"
          >
            No hay filas. Usa “Agregar fila”.
          </td>
        </tr>

        <tr
          v-for="(row, rIdx) in (attr.body || [])"
          :key="'row-'+rIdx"
        >
          <td
            v-for="(cell, cIdx) in normalizedRow(row)"
            :key="'cell-'+rIdx+'-'+cIdx"
            class="py-1"
          >
            <!-- editor por tipo -->
            <v-text-field
              v-if="cell.type === 'number'"
              v-model="editableBody[rIdx][cIdx].value"
              type="number"
              hide-details
              density="compact"
              variant="underlined"
              @change="commitEdit()"
            />

            <v-select
              v-else-if="cell.type === 'check'"
              v-model="editableBody[rIdx][cIdx].value"
              :items="checkOptions"
              item-title="label"
              item-value="id"
              hide-details
              density="compact"
              variant="underlined"
              @update:model-value="commitEdit()"
            />

            <!-- default: texto -->
            <v-text-field
              v-else
              v-model="editableBody[rIdx][cIdx].value"
              hide-details
              density="compact"
              variant="underlined"
              @change="commitEdit()"
            />
          </td>

          <td class="text-center">
            <v-btn
              size="x-small"
              variant="text"
              icon
              @click="openEdit(rIdx)"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              size="x-small"
              variant="text"
              icon
              color="error"
              @click="removeRow(rIdx)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>

    <!-- Dialog alta/edición -->
    <v-dialog
      v-model="dlg.open"
      max-width="700"
    >
      <v-card>
        <v-toolbar
          color="primary"
          density="compact"
          dark
        >
          <v-toolbar-title>{{ dlg.mode === 'add' ? 'Agregar fila' : 'Editar fila' }}</v-toolbar-title>
          <v-spacer />
          <v-btn
            icon
            @click="dlg.open = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text>
          <div class="text-medium-emphasis mb-2">
            {{ (attr.dialog?.[0]?.title) || 'Valores de la fila' }}
          </div>

          <v-row dense>
            <v-col
              v-for="(input, iIdx) in dialogInputs"
              :key="'dlg-inp-'+iIdx"
              cols="12"
              md="6"
            >
              <v-text-field
                v-if="input._type === 'number'"
                v-model="dlg.form[iIdx]"
                :label="input.label"
                type="number"
                density="compact"
                variant="outlined"
                hide-details
              />
              <v-select
                v-else-if="input._type === 'check'"
                v-model="dlg.form[iIdx]"
                :label="input.label"
                :items="checkOptions"
                item-title="label"
                item-value="id"
                density="compact"
                variant="outlined"
                hide-details
              />
              <v-text-field
                v-else
                v-model="dlg.form[iIdx]"
                :label="input.label"
                density="compact"
                variant="outlined"
                hide-details
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="dlg.open = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            @click="confirmDlg"
          >
            {{ dlg.mode === 'add' ? 'Agregar' : 'Guardar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>

  <div
    v-else
    class="text-medium-emphasis"
  >
    No se encontró un atributo de tipo <code>matriz</code>.
  </div>
</template>

<script setup>
import { computed, reactive, toRaw, watch, ref } from 'vue'

/**
 * v-model: JSON completo del survey (con segmentos/attributes).
 * Opcionalmente puedes forzar qué matriz editar con :segmento-index y :attr-index.
 */
const props = defineProps({
  modelValue: { type: Object, required: true },
  segmentoIndex: { type: Number, default: -1 },
  attrIndex: { type: Number, default: -1 },
})

const emit = defineEmits(['update:modelValue'])

// --- helpers
const checkOptions = [
  { id: 'si',  label: 'Sí' },
  { id: 'no',  label: 'No' },
  { id: 'n/a', label: 'N/A' },
]

/** Localiza el atributo 'matriz' a editar */
const attr = computed(() => {
  const segs = props.modelValue?.segmentos || []
  if (props.segmentoIndex >= 0 && props.attrIndex >= 0) {
    return segs?.[props.segmentoIndex]?.attributes?.[props.attrIndex] || null
  }
  // primer 'matriz' que encuentre
  for (const s of segs) {
    for (const a of (s.attributes || [])) {
      if (a?.type === 'matriz') return a
    }
  }
  return null
})

/** Número de columnas (tomadas de la primera fila de headers) */
const colCount = computed(() => {
  const firstRow = attr.value?.headers?.[0] || []
  // suma colspans si hay
  return firstRow.reduce((acc, c) => acc + (c.colspan || 1), 0)
})

/** rowspan de "Acciones" en thead (si tienes headers multinivel) */
const headerRowspan = computed(() => (attr.value?.headers?.length || 1))

/** Crea una copia editable del body para v-model directo en inputs */
const editableBody = ref([])

watch(
  () => attr.value?.body,
  (body) => {
    const rows = Array.isArray(body) ? body : []
    // clonar profundo y asegurar longitud colCount
    editableBody.value = rows.map(r => ensureRowWidth(clone(r), colCount.value))
  },
  { immediate: true, deep: true }
)

/** Normaliza una fila a colCount celdas */
function ensureRowWidth (row, nCols) {
  const r = Array.isArray(row) ? row.slice() : []
  while (r.length < nCols) r.push({ value: '' })
  if (r.length > nCols) r.length = nCols
  // asegurar shape {value, type?}
  for (let i = 0; i < r.length; i++) {
    const c = r[i] || {}
    r[i] = { value: c.value ?? '', type: c.type }
  }
  return r
}

/** Cuando cambias inputs en línea, persistimos al JSON y emitimos */
function commitEdit () {
  const nv = clone(props.modelValue)
  const target = resolveTargetAttr(nv)
  if (!target) return
  target.body = editableBody.value.map(r => r.map(c => ({ value: c.value, type: c.type })))
  emit('update:modelValue', nv)
}

/** diálogo alta/edición */
const dlg = reactive({
  open: false,
  mode: 'add', // add | edit
  rowIndex: -1,
  form: [], // valores por columna
})

/** Determinar tipos/labels para el dialog en base a attr.dialog[0].inputs o headers */
const dialogInputs = computed(() => {
  const base = attr.value?.dialog?.[0]?.inputs || []
  // si dialog no existe, usa headers como fallback
  if (base.length) {
    return base.map((i, idx) => ({
      label: i.label ?? `Columna ${idx + 1}`,
      _type: inferTypeFromHeader(idx), // intenta inferir tipo desde body/header
    }))
  }
  const hdrs = attr.value?.headers?.[0] || []
  return hdrs.map((h, idx) => ({
    label: h.label ?? `Columna ${idx + 1}`,
    _type: inferTypeFromHeader(idx),
  }))
})

function inferTypeFromHeader (cIdx) {
  // intenta ver si alguna fila tiene type para esta columna
  for (const r of (attr.value?.body || [])) {
    const cell = r?.[cIdx]
    if (cell?.type) return cell.type
  }
  // por defecto texto
  return 'text'
}

function openAdd () {
  dlg.mode = 'add'
  dlg.rowIndex = -1
  dlg.form = new Array(colCount.value).fill('')
  dlg.open = true
}

function openEdit (rowIdx) {
  dlg.mode = 'edit'
  dlg.rowIndex = rowIdx
  const row = editableBody.value[rowIdx] || []
  dlg.form = ensureRowWidth(row, colCount.value).map(c => c.value ?? '')
  dlg.open = true
}

function confirmDlg () {
  const newRow = dlg.form.map((val, i) => ({
    value: val ?? '',
    type: dialogInputs.value?.[i]?._type || undefined
  }))

  if (dlg.mode === 'add') {
    editableBody.value.push(newRow)
  } else if (dlg.mode === 'edit' && dlg.rowIndex >= 0) {
    editableBody.value.splice(dlg.rowIndex, 1, newRow)
  }
  dlg.open = false
  commitEdit()
}

function removeRow (idx) {
  editableBody.value.splice(idx, 1)
  commitEdit()
}

/** Utilidades */
function normalizedRow (row) {
  return ensureRowWidth(row, colCount.value)
}
function resolveTargetAttr (root) {
  const segs = root?.segmentos || []
  if (props.segmentoIndex >= 0 && props.attrIndex >= 0) {
    return segs?.[props.segmentoIndex]?.attributes?.[props.attrIndex] || null
  }
  for (const s of segs) {
    for (const a of (s.attributes || [])) {
      if (a?.type === 'matriz') return a
    }
  }
  return null
}
function clone (obj) {
  return JSON.parse(JSON.stringify(toRaw(obj)))
}

/**
 * Cuenta cuántas "columnas hoja" tiene la tabla.
 * - Si hay headers, usa la última fila de headers (sumando colspans).
 * - Si no hay headers, usa el largo de la primera fila del body.
 */
function getLeafColCount (headers = [], body = []) {
  if (!Array.isArray(headers) || headers.length === 0) {
    return Array.isArray(body) && body[0] ? body[0].length : 0
  }
  const sumCols = row =>
    (row || []).reduce((acc, c) => acc + (Number(c?.colspan) || 1), 0)

  const first = sumCols(headers[0])                       // por si te sirve
  const last  = sumCols(headers[headers.length - 1])      // fila hoja
  const byBody = Array.isArray(body) && body[0] ? body[0].length : 0

  return Math.max(first, last, byBody)
}

/** Crea una fila vacía de ancho `width`. */
function makeEmptyRow (width) {
  return Array.from({ length: width }, () => ({ value: '' }))
}

/** Asegura que cada fila tenga exactamente `width` celdas. */
function normalizeBodyRows (rows = [], width = 0) {
  return (rows || []).map(r => {
    const out = Array.isArray(r) ? [...r] : []
    if (out.length < width) {
      for (let i = out.length; i < width; i++) out.push({ value: '' })
    } else if (out.length > width) {
      out.length = width
    }
    return out
  })
}

// --- Acciones de la matriz -----------------------------------

/**
 * Entra al modo edición en línea.
 * - Copia el body a __draftBody normalizado.
 * - Si `actualizar !== true` y no hay filas, abre con 1 fila vacía.
 */
function startInlineUpdate (attr) {
  const width = getLeafColCount(attr.headers, attr.body)
  const base  = Array.isArray(attr.body) ? attr.body : []

  // Copia de trabajo
  attr.__draftBody = normalizeBodyRows(
    JSON.parse(JSON.stringify(base)),
    width
  )

  // Si NO es actualizable y no hay filas, empieza con una fila nueva
  if (attr.actualizar !== true && attr.__draftBody.length === 0) {
    attr.__draftBody.push(makeEmptyRow(width))
  }

  attr.__editing = true
}

/**
 * Acepta los cambios:
 * - Respeta celdas con { editable:false } del body original (no se modifican).
 */
function acceptInlineUpdate (attr) {
  const draft = (attr.__draftBody || []).map((row, rIdx) =>
    row.map((cell, cIdx) => {
      const original = attr.body?.[rIdx]?.[cIdx]
      if (original && original.editable === false) return original
      return cell
    })
  )

  attr.body = draft
  attr.__editing = false
  delete attr.__draftBody
}

/** Cancela edición en línea. */
function cancelInlineUpdate (attr) {
  attr.__editing = false
  delete attr.__draftBody
}

/**
 * Agrega una fila al body (fuera del flujo de edición en línea).
 * Útil cuando el usuario pulsa “Agregar fila”.
 */
function openAgregarFila (attr) {
  const width = getLeafColCount(attr.headers, attr.body)
  if (!Array.isArray(attr.body)) attr.body = []
  attr.body.push(makeEmptyRow(width))
}
</script>

<style scoped>
/* Ajustes visuales mínimos */
</style>
