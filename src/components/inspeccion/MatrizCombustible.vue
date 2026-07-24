<template>
  <div>
    <div style="max-height: 420px; overflow: auto;">
      <v-table
        density="compact"
        class="text-caption"
      >
        <thead>
          <tr>
            <th
              class="text-center"
              style="vertical-align: middle; font-weight: 600;"
            >
              NOMBRE
            </th>
            <th
              class="text-center"
              style="vertical-align: middle; font-weight: 600;"
            >
              TIPO DE COMBUSTIBLE
            </th>
            <th
              class="text-center"
              style="vertical-align: middle; font-weight: 600;"
            >
              CANTIDAD (lt)
            </th>
            <th
              class="text-center"
              style="vertical-align: middle; font-weight: 600;"
            >
              HORAS FUNCIONAMIENTO
            </th>
            <th
              class="text-center"
              style="vertical-align: middle; font-weight: 600;"
            >
              OBSERVACIONES
            </th>
            <th
              class="text-center"
              style="vertical-align: middle; font-weight: 600; width: 56px;"
            />
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(row, rIdx) in attr.body"
            :key="row?.[0]?._rowId || rIdx"
          >
            <!-- NOMBRE: Grupo + (N° si GE) -->
            <td class="text-center">
              <div class="nombre-wrap">
                <!-- Grupo -->
                <v-select
                  v-model="rowNameGroup[rIdx]"
                  :items="grupoOptions"
                  density="compact"
                  variant="underlined"
                  hide-details
                  clearable
                  placeholder="Equipo"
                  class="sel-grupo"
                  @update:model-value="onGroupChange(rIdx)"
                />

                <!-- Número GE (oculto si no es GE) -->
                <v-select
                  v-if="rowNameGroup[rIdx] === 'GE'"
                  v-model="rowGeNumber[rIdx]"
                  :items="geNumberOptions"
                  density="compact"
                  variant="underlined"
                  hide-details
                  clearable
                  placeholder="N°"
                  class="sel-num"
                  @update:model-value="onGeNumberChange(rIdx)"
                />
              </div>
            </td>

            <!-- TIPO COMBUSTIBLE -->
            <td class="text-center">
              <v-select
                v-model="attr.body[rIdx][1].value"
                :items="combustibleOptions"
                density="compact"
                variant="underlined"
                hide-details
                clearable
                placeholder="Seleccione"
              />
            </td>

            <!-- CANTIDAD -->
            <td class="text-center">
              <v-text-field
                v-model="attr.body[rIdx][2].value"
                density="compact"
                variant="underlined"
                hide-details
                inputmode="decimal"
                placeholder="0,00"
                class="text-right"
                @blur="onBlurDecimal(rIdx, 2, decimalsCantidad)"
              />
            </td>

            <!-- HORAS -->
            <td class="text-center">
              <v-text-field
                v-model="attr.body[rIdx][3].value"
                density="compact"
                variant="underlined"
                hide-details
                inputmode="decimal"
                placeholder="0,00"
                class="text-right"
                @blur="onBlurDecimal(rIdx, 3, decimalsHoras)"
              />
            </td>

            <!-- OBS -->
            <td class="text-center">
              <v-text-field
                v-model="attr.body[rIdx][4].value"
                density="compact"
                variant="underlined"
                hide-details
                placeholder="Observación"
              />
            </td>

            <!-- MENOS -->
            <td class="text-center">
              <v-btn
                icon="mdi-minus"
                size="x-small"
                variant="tonal"
                color="red"
                :disabled="attr.body.length === 1"
                @click="removeRow(rIdx)"
              />
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>

    <!-- MÁS -->
    <div class="mt-2 d-flex justify-end">
      <v-btn
        size="small"
        color="green"
        variant="tonal"
        prepend-icon="mdi-plus"
        @click="addRow()"
      >
        Agregar fila
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import { toRef, onMounted, ref } from 'vue'

const props = defineProps({
  attr: { type: Object, required: true },
  decimalsCantidad: { type: Number, default: 2 },
  decimalsHoras: { type: Number, default: 2 },
})

const attr = toRef(props, 'attr')
const combustibleOptions = ['Diesel', 'Parafina', 'Gasolina']
const COLS = 5

// Grupo: GE o equipos sueltos
const grupoOptions = [
  'GE',
  'Placa Compactadora',
  'Rodillo Compactador',
  'Motobomba 3',
  'Motobomba 4',
  'Motosierra',
  'Compresor',
  'Desbrozadora',
  'Grupo Electrógeno',
  'Otro'
]

// Números GE: 01..15
const geNumberOptions = Array.from({ length: 15 }, (_, i) => String(i + 1).padStart(2, '0'))

// estado UI por fila (solo UI)
const rowNameGroup = ref([])
const rowGeNumber = ref([])

onMounted(() => {
  if (!Array.isArray(attr.value.body)) attr.value.body = []
  attr.value.body = normalizeBody(attr.value.body)
  if (attr.value.body.length === 0) attr.value.body.push(makeRow())
  syncUiFromBody()
})

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function makeRow() {
  return [
    { value: '', _rowId: uid() }, // nombre final (GE-xx o texto)
    { value: '' },                // tipo
    { value: '' },                // cantidad
    { value: '' },                // horas
    { value: '' }                 // obs
  ]
}

function normalizeBody(body = []) {
  const base = Array.isArray(body) ? body : []
  return base.map(r => {
    const row = Array.isArray(r) ? r.slice() : []
    while (row.length < COLS) row.push({ value: '' })

    const fixed = row.slice(0, COLS).map((c) => {
      if (c && typeof c === 'object') return c
      return { value: String(c ?? '') }
    })

    if (!fixed[0]._rowId) fixed[0]._rowId = uid()
    return fixed
  })
}

function addRow() {
  attr.value.body = normalizeBody(attr.value.body)
  attr.value.body.push(makeRow())
  syncUiFromBody()
}

function removeRow(idx) {
  attr.value.body = normalizeBody(attr.value.body)
  attr.value.body.splice(idx, 1)
  if (attr.value.body.length === 0) attr.value.body.push(makeRow())
  syncUiFromBody()
}

function syncUiFromBody() {
  const b = attr.value.body || []
  rowNameGroup.value = b.map((row) => inferGroupFromName(row?.[0]?.value))
  rowGeNumber.value = b.map((row) => inferGeNumberFromName(row?.[0]?.value))
}

function inferGroupFromName(name) {
  const s = String(name || '').trim()
  if (/^GE-\d{2}$/i.test(s)) return 'GE'
  if (grupoOptions.includes(s)) return s
  return s ? 'Otro' : null
}

function inferGeNumberFromName(name) {
  const s = String(name || '').trim()
  const m = s.match(/^GE-(\d{2})$/i)
  return m ? m[1] : null
}

function onGroupChange(rIdx) {
  const group = rowNameGroup.value[rIdx]

  if (group === 'GE') {
    if (!rowGeNumber.value[rIdx]) rowGeNumber.value[rIdx] = '01'
    attr.value.body[rIdx][0].value = `GE-${rowGeNumber.value[rIdx]}`
  } else {
    rowGeNumber.value[rIdx] = null
    attr.value.body[rIdx][0].value = group || ''
  }
}

function onGeNumberChange(rIdx) {
  if (rowNameGroup.value[rIdx] !== 'GE') return
  const num = rowGeNumber.value[rIdx]
  attr.value.body[rIdx][0].value = num ? `GE-${num}` : 'GE-01'
}

/* ===== Decimales (coma/punto) ===== */
function parseDecimal(val) {
  const s = String(val ?? '').trim()
  if (!s) return null
  const cleaned = s.replace(/[^\d,.-]/g, '')
  const normalized = cleaned.replace(',', '.')
  const n = Number(normalized)
  return Number.isFinite(n) ? n : null
}

function formatDecimal(val, decimals = 2) {
  const n = parseDecimal(val)
  if (n === null) return ''
  return n.toFixed(Number(decimals ?? 2)).replace('.', ',')
}

function onBlurDecimal(rIdx, cIdx, decimals) {
  const cur = attr.value.body?.[rIdx]?.[cIdx]?.value
  attr.value.body[rIdx][cIdx].value = formatDecimal(cur, decimals)
}
</script>

<style scoped>
.text-right :deep(input) {
  text-align: right;
}

/* Contenedor del "Nombre" */
.nombre-wrap{
  display:flex;
  align-items:center;
  gap: 8px;
  min-width: 240px;
}

/* Select de grupo (equipo) */
.sel-grupo{
  min-width: 160px;
}

/* Select de número: MÁS ANGOSTO */
.sel-num{
  width: 120px;
  min-width: 120px;
  max-width: 120px;
}

/* achica el input del select número */
.sel-num :deep(input){
  text-align: center;
  padding-left: 0 !important;
  padding-right: 0 !important;
}

/* achica el icono/flecha del select número */
.sel-num :deep(.v-field__append-inner){
  padding-left: 0 !important;
  padding-right: 0 !important;
}
</style>
