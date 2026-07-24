<template>
  <div class="metricas-wrapper">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-3 gap-3">
      <h3 class="text-h6 text-medium-emphasis m-0">
        Métricas
      </h3>

      <v-select
        v-model="selectedTipo"
        :items="tipoOptions"
        density="compact"
        variant="outlined"
        hide-details
        class="max-w-240"
        label="Tipo"
        item-title="label"
        item-value="value"
      />
    </div>

    <!-- Grupos -->
    <div v-if="gruposVisibles.length">
      <v-row
        v-for="(grupo, gi) in gruposVisibles"
        :key="`g-${gi}`"
        class="mb-2"
        align="stretch"
        no-gutters
      >
        <!-- Indicadores -->
        <v-col
          cols="12"
          md="12"
        >
          <v-row dense>
            <!-- 👇 Pasamos el indicador tal cual y los mismos props que antes -->
            <v-col
              cols="12"
              md="12"
            >
              <GrupoIndicador
                :grupo="grupo"
                :fecha-desde="fechaDesde"
                :fecha-hasta="fechaHasta"
                :filtro="safeCliente"
                :secatrib="safeProyecto"
                :teratrib="teratrib"
                :id-activo="idActivo"
                @toggle="onToggle"
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </div>

    <v-alert
      v-else
      type="info"
      density="comfortable"
      variant="tonal"
    >
      No hay indicadores para el tipo seleccionado.
    </v-alert>
  </div>
</template>

<script setup>
import { computed, ref, watch, toRef } from 'vue'
import GrupoIndicador from '@/components/GrupoIndicador.vue'

const props = defineProps({
  // Acepta { metricas:[...] } o un arreglo directo [...]
  config: { type: [Object, Array], required: true },
  tipo: { type: String, default: '' },

  // Props que el padre ya usa y que necesita GrupoIndicador
  fechaDesde: [String, Number, Date],
  fechaHasta: [String, Number, Date],
  safeCliente: [String, Number, Object, Array],
  safeProyecto: [String, Number, Object, Array],
  teratrib: [String, Number, Object, Array],
  idActivo: [String, Number, Object]
})
const emit = defineEmits(['update:tipo', 'toggle'])

const rawConfig = toRef(props, 'config')

// Normaliza lista
const metricasList = computed(() => {
  if (Array.isArray(rawConfig.value?.metricas)) return rawConfig.value.metricas
  if (Array.isArray(rawConfig.value)) return rawConfig.value
  return []
})

// Opciones del select (únicas)
const tipoOptions = computed(() => {
  const set = new Map()
  for (const m of metricasList.value) {
    const raw = (m.tipo ?? '').trim()
    const key = raw.toLowerCase()
    if (!set.has(key)) set.set(key, { value: raw, label: capitalizar(raw || '—') })
  }
  return Array.from(set.values())
})

const selectedTipo = ref('')

// Inicializa tipo cuando hay opciones o cambia :tipo
watch([tipoOptions, () => props.tipo], ([opts, tipoProp]) => {
  if (tipoProp) {
    selectedTipo.value = tipoProp
  } else if (!selectedTipo.value && opts.length) {
    selectedTipo.value = opts[0].value
  }
}, { immediate: true })

watch(selectedTipo, (nv) => emit('update:tipo', nv))

// Filtra grupos por tipo
const gruposVisibles = computed(() => {
  const t = (selectedTipo.value || '').toLowerCase()
  return metricasList.value.filter(m => (m.tipo || '').toLowerCase() === t)
})

// reemitir toggle hacia arriba (mismo contrato de antes)
function onToggle(payload) { emit('toggle', payload) }

function capitalizar(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s }
</script>

<style scoped>
.max-w-240 { max-width: 240px; }
.grupo-label {
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.6);
  white-space: nowrap;
}
</style>
