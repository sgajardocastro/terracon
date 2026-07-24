<template>
  <div class="metricas-v2-wrapper">
    <div class="d-flex align-center justify-space-between mb-2">
      <div class="d-flex align-center">
        <span class="text-caption font-weight-black text-slate-400 text-uppercase letter-spacing-1">Métricas de Control</span>
      </div>

      <v-select
        v-model="selectedTipo"
        :items="tipoOptions"
        density="compact"
        variant="plain"
        hide-details
        class="type-selector"
        label="Filtrar por tipo"
        item-title="label"
        item-value="value"
      >
        <template #selection="{ item }">
          <span class="text-caption font-weight-black text-blue-grey-darken-2">{{ item.title }}</span>
        </template>
      </v-select>
    </div>

    <div
      v-if="gruposVisibles.length"
      class="metrics-content"
    >
      <div
        v-for="(grupo, gi) in gruposVisibles"
        :key="`g-${gi}`"
        class="mb-4"
      >
        <GrupoIndicadorV2
          :grupo="grupo"
          :fecha-desde="fechaDesde"
          :fecha-hasta="fechaHasta"
          :filtro="safeCliente"
          :secatrib="safeProyecto"
          :teratrib="teratrib"
          :id-activo="idActivo"
          @toggle="onToggle"
        />
      </div>
    </div>

    <div
      v-else
      class="empty-metrics d-flex flex-column align-center justify-center pa-8 rounded-xl border-dashed"
    >
      <v-icon
        color="slate-200"
        size="48"
      >
        mdi-database-off-outline
      </v-icon>
      <span class="text-caption text-slate-400 mt-2">No hay métricas disponibles</span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, toRef } from 'vue'
import GrupoIndicadorV2 from './GrupoIndicadorV2.vue'

const props = defineProps({
  config: { type: [Object, Array], required: true },
  tipo: { type: String, default: '' },
  fechaDesde: String,
  fechaHasta: String,
  safeCliente: [String, Number],
  safeProyecto: [String, Number],
  teratrib: [String, Number],
  idActivo: [String, Number, null]
})

const emit = defineEmits(['update:tipo', 'toggle'])

const rawConfig = toRef(props, 'config')

const metricasList = computed(() => {
  if (Array.isArray(rawConfig.value?.metricas)) return rawConfig.value.metricas
  if (Array.isArray(rawConfig.value)) return rawConfig.value
  return []
})

const tipoOptions = computed(() => {
  const set = new Map()
  for (const m of metricasList.value) {
    const raw = (m.tipo ?? '').trim()
    const key = raw.toLowerCase()
    if (!set.has(key)) set.set(key, { value: raw, label: capitalizar(raw || 'Sin Categoría') })
  }
  return Array.from(set.values())
})

const selectedTipo = ref('')

watch([tipoOptions, () => props.tipo], ([opts, tipoProp]) => {
  if (tipoProp) {
    selectedTipo.value = tipoProp
  } else if (!selectedTipo.value && opts.length) {
    selectedTipo.value = opts[0].value
  }
}, { immediate: true })

watch(selectedTipo, (nv) => emit('update:tipo', nv))

const gruposVisibles = computed(() => {
  const t = (selectedTipo.value || '').toLowerCase()
  return metricasList.value.filter(m => (m.tipo || '').toLowerCase() === t)
})

function onToggle(payload) { emit('toggle', payload) }
function capitalizar(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s }
</script>

<style scoped>
.metricas-v2-wrapper {
  width: 100%;
}

.type-selector {
  max-width: 150px;
}

:deep(.v-field__input) {
  min-height: 32px !important;
  padding: 0 8px !important;
}

.letter-spacing-1 { letter-spacing: 1px; }
.text-slate-400 { color: #94a3b8; }
</style>
