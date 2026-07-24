<template>
  <div>
    <!--h3 class="mb-2">{{ props.config?.titulo }}</h3-->

    <!-- Sub-indicadores como tarjetas -->
    <v-row
      dense
      class="mb-2"
    >
      <v-col cols="12">
        <GrupoIndicador
          :grupo="grupoHijos"
          :fecha-desde="fechaDesde"
          :fecha-hasta="fechaHasta"
          :id-activo="innerTab"
          @toggle="onIndicadorToggle"
        />
      </v-col>
    </v-row>

    <!-- Tabs internos (puedes ocultarlos si no los quieres visibles) -->
    <!--v-tabs v-model="innerTab" density="compact" grow>
      <v-tab v-for="t in innerTabs" :key="t.value" :value="t.value">
        {{ t.label }}
      </v-tab>
    </v-tabs-->

    <v-card-text class="pt-2">
      <v-tabs-window v-model="innerTab">
        <v-tabs-window-item
          v-for="t in innerTabs"
          :key="t.value"
          :value="t.value"
        >
          <IndicadorSimple
            :key="forceKey + '-' + t.value"
            :config="t.cfg"
            :fecha-desde="fechaDesde"
            :fecha-hasta="fechaHasta"
          />
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card-text>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import IndicadorSimple from './IndicadorSimple.vue'
import GrupoIndicador from './GrupoIndicador.vue'

const props = defineProps({
  config: { type: Object, required: true },   // { titulo, indicadores: [...] }
  fechaDesde: { type: String, default: '' },
  fechaHasta: { type: String, default: '' },
  forceKey:   { type: [String, Number], default: '' },
})

const innerTab = ref('')
const normVal  = (s) => String(s ?? '').replace(/\s+/g, '_')

// Normalizo los hijos: garantizo un id estable que usarán tanto GrupoIndicador como Tabs
const hijosNorm = computed(() =>
  (props.config?.indicadores ?? []).map((ind, idx) => {
    const rawId = ind?.id ?? ind?.titulo ?? `ind-${idx}`
    return {
      ...ind,
      id: rawId,           // para GrupoIndicador
      _value: normVal(rawId), // para tabs y Activación
    }
  })
)

// Armo un "grupo" compatible con tu <GrupoIndicador>
const grupoHijos = computed(() => ({
  nombreCorto: props.config?.titulo || 'Indicadores',
  indicadores: hijosNorm.value,
}))

// Tabs internos
const innerTabs = computed(() =>
  hijosNorm.value.map(h => ({
    value: h._value,
    label: h.titulo ?? h.id,
    cfg:   h,
  }))
)

onMounted(() => {
  if (!innerTab.value && innerTabs.value.length) {
    innerTab.value = innerTabs.value[0].value
  }
})

// Al hacer clic en una tarjeta del GrupoIndicador, activo su tab
function onIndicadorToggle(payload) {
  const raw = (payload && typeof payload === 'object') ? (payload.id || payload.titulo) : payload
  const wanted = normVal(raw)
  const found = innerTabs.value.find(t => t.value === wanted)
  if (found) innerTab.value = found.value
}
</script>
