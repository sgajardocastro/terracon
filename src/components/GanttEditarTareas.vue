<template>
  <v-card
    elevation="0"
    variant="flat"
    class="pa-0"
  >
    <!-- sin borde, plano -->
    <v-card-title>
      Ajuste de Plan por Día
    </v-card-title>

    <v-card-text class="pt-2">
      <v-table
        density="compact"
        class="text-body-2 plan-table"
      >
        <thead>
          <tr>
            <th class="col-fecha">
              Fecha
            </th>
            <th class="col-num">
              Plan
            </th>
            <th class="col-num">
              Plan Reasignado
            </th>
            <th class="col-obs">
              Obs.
            </th>
            <th class="col-act" />
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(r, i) in grid"
            :key="r.fecha"
          >
            <!-- Fecha -->
            <td class="col-fecha">
              <v-text-field
                v-model="grid[i].fecha"
                type="date"
                :min="todayYMD"
                density="compact"
                hide-details
                @update:model-value="onEditFecha(i, $event)"
              />
            </td>

            <!-- Plan (solo lectura) -->
            <td class="col-num text-right non-edit-cell">
              {{ fmt(grid[i].plan) }}
            </td>

            <!-- Plan Reasignado (editable) -->
            <td class="col-num">
              <v-text-field
                v-model.number="grid[i].reasignado"
                type="number"
                min="0"
                step="1"
                density="compact"
                hide-details
                class="text-right"
                :disabled="isPast(grid[i].fecha)"
                @update:model-value="onEditReasignado(i, $event)"
              />
            </td>

            <!-- Observación (más ancho) -->
            <td class="col-obs">
              <v-text-field
                v-model="grid[i].obs"
                density="compact"
                hide-details
                placeholder="Observación"
                :disabled="isPast(grid[i].fecha)"
              />
            </td>

            <!-- Eliminar -->
            <td class="col-act text-right">
              <v-btn
                icon
                size="small"
                variant="text"
                :disabled="isPast(r.fecha)"
                @click="delRow(r.fecha)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </td>
          </tr>

          <tr v-if="!grid.length">
            <td
              colspan="5"
              class="text-medium-emphasis text-caption py-4"
            >
              No hay datos. Agrega una fila.
            </td>
          </tr>
        </tbody>
      </v-table>

      <!-- Agregar fila -->
      <div
        class="d-flex align-center mt-3 add-row"
        style="gap:8px;"
      >
        <v-text-field
          v-model="newFecha"
          type="date"
          :min="todayYMD"
          label="Nueva fecha"
          density="compact"
          hide-details
        />
        <v-text-field
          v-model.number="newReasig"
          type="number"
          min="0"
          step="0.01"
          label="Plan Reasignado"
          density="compact"
          hide-details
          class="col-num"
        />
        <v-text-field
          v-model="newObs"
          label="Obs."
          density="compact"
          hide-details
          class="col-obs"
        />
        <v-btn
          size="small"
          variant="tonal"
          prepend-icon="mdi-plus"
          @click="addRow"
        >
          Agregar fila
        </v-btn>
      </div>
    </v-card-text>

    <v-card-actions
      v-if="showActions"
      class="justify-end"
    >
      <v-btn
        variant="text"
        @click="$emit('cancel')"
      >
        Cancelar
      </v-btn>
      <v-btn
        color="primary"
        @click="save"
      >
        Guardar
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// === HOY (YYYY-MM-DD) ===
const pad = n => String(n).padStart(2,'0')
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
const todayYMD = ref( ymd(new Date()) )

const isPast = (fechaYMD) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(fechaYMD||''))) return false
  return fechaYMD < todayYMD.value
}

const props = defineProps({
  row: { type: Object, required: true },
  planDaily: { type: Object, default: () => ({}) },
  showActions: { type: Boolean, default: true }   // 👈 nuevo
})

const emit = defineEmits(['save','cancel'])

/* === Helpers === */
const fmt = (v) =>
  v == null || v === '' ? '' :
  new Intl.NumberFormat('es-CL', { maximumFractionDigits: 2 }).format(Number(v))

const normMap = (obj) => {
  const out = {}
  if (!obj) return out
  for (const [k, v] of Object.entries(obj)) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(k)) out[k] = Number(v ?? 0)
  }
  return out
}

/* Plan original */
const planMapIn = computed(() => normMap(props.planDaily))

/* 🔹 Plan Reasignado y observaciones */
const reasignadoMapIn = computed(() => {
  const r = props.row || {}
  // ✅ Prioriza plan_reasignado, ignora realDaily
  return normMap(r.plan_reasignadoDaily || r.reasignadoDaily || {})
})

const obsMapIn = computed(() => {
  const r = props.row || {}
  const out = {}
  for (const [k, v] of Object.entries(r.obsDaily || {})) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(k)) out[k] = String(v ?? '')
  }
  return out
})

/* Grilla: [{ fecha, plan, reasignado, obs }] */
const grid = ref([])
const newFecha = ref('')
const newReasig = ref(0)
const newObs = ref('')


// ⚠️ Opcional: si quieres que la grilla NO muestre pasados, filtra acá:
function rebuildGrid() {
  const keys = new Set([
    ...Object.keys(planMapIn.value || {}),
    ...Object.keys(reasignadoMapIn.value || {}),
    ...Object.keys(obsMapIn.value || {})
  ])
  const arr = Array.from(keys).sort().map(k => ({
    fecha: k,
    plan: Number(planMapIn.value[k] ?? 0),
    reasignado: Number(reasignadoMapIn.value[k] ?? 0),
    obs: String(obsMapIn.value[k] ?? '')
  }))
  // ⬇️ Si solo quieres bloquear edición (no ocultar), NO hagas este filter.
  // grid.value = arr.filter(r => !isPast(r.fecha))
  grid.value = arr
}

watch(() => [props.row, props.planDaily], rebuildGrid, { immediate: true, deep: true })

/* Edición */
function onEditReasignado(idx, val) {
  grid.value[idx].reasignado = Number(val ?? 0)
}

/* CRUD filas */
function delRow(ymdStr) {
  if (isPast(ymdStr)) return // no borrar pasado
  grid.value = grid.value.filter(r => r.fecha !== ymdStr)
}

function addRow() {
  const f = String(newFecha.value || '')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(f)) return
  if (isPast(f)) return // no permitir fechas pasadas
  if (grid.value.some(r => r.fecha === f)) return
  grid.value.push({
    fecha: f,
    plan: Number(planMapIn.value[f] ?? 0),
    reasignado: Number(newReasig.value ?? 0),
    obs: String(newObs.value ?? '')
  })
  sortGrid()
  newReasig.value = 0
  newObs.value = ''
}

function onEditFecha(idx, ymdStr) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymdStr)) return
  if (isPast(ymdStr)) return // no mover al pasado
  if (grid.value.some((r,i) => i!==idx && r.fecha === ymdStr)) return
  grid.value[idx].fecha = ymdStr
  sortGrid()
}

function sortGrid() {
  grid.value.sort((a, b) => a.fecha.localeCompare(b.fecha))
}

/* Guardar */
function save() {
  const reasignadoDaily = {}
  const obsDaily = {}
  for (const r of grid.value) {
    if (isPast(r.fecha)) continue
    reasignadoDaily[r.fecha] = Number(r.reasignado ?? 0)
    if (r.obs && String(r.obs).trim() !== '') obsDaily[r.fecha] = String(r.obs)
  }
  emit('save', { reasignadoDaily, obsDaily, row: props.row })
}

// expone el método para el padre
defineExpose({ save })
</script>


<style scoped>
.non-edit-cell { background: #f5f7fa; }

/* anchos compactos */
.plan-table .col-fecha { width: 200px; min-width: 200px; }
.plan-table .col-num   { width: 50px; min-width: 50px; }
.plan-table .col-obs   { width: auto; }        /* toma el resto del espacio */
.plan-table .col-act   { width: 44px; min-width: 44px; }

/* inputs ajustan al ancho de la celda */
.plan-table .v-field,
.plan-table .v-text-field,
.plan-table .v-textarea { width: 100%; }

/* celda de solo lectura un poco sombreada */
.non-edit-cell { background: #f5f7fa; }

/* fila “agregar” con mismas proporciones */
.add-row .col-fecha { width: 200px; min-width: 200px; }
.add-row .col-num   { width: 50px; min-width: 50px; }
.add-row .col-obs   { flex: 1 1 auto; min-width: 220px; }

/* responsive: compacta más en pantallas chicas */
@media (max-width: 960px) {
  .plan-table .col-fecha { width: 150px; }
  .plan-table .col-num   { width: 90px; }
}
</style>
