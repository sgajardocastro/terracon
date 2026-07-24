<template>
  <v-card
    variant="outlined"
    class="modern-grupo-card rounded-lg bg-white overflow-hidden mb-6"
    style="border-color: #e2e8f0 !important;"
  >
    <v-toolbar
      flat
      density="compact"
      color="grey-lighten-4"
      class="border-bottom"
    >
      <v-toolbar-title class="text-caption font-weight-black text-grey-darken-3 text-uppercase letter-spacing-1">
        {{ grupo.nombreShort ?? grupo.nombreCorto }}
      </v-toolbar-title>
    </v-toolbar>

    <v-card-text class="pa-4">
      <div class="indicators-grid">
        <IndicadorV2 
          v-for="(indicador, index) in grupo.indicadores" 
          :id="indicador.id ?? `${grupo.nombreCorto}-${index}`"
          :key="indicador.id ?? `${grupo.nombreCorto}-${index}`"
          :id-activo="idActivo"
          :icon="indicador.icono"
          :color="indicador.color"
          :titulo="indicador.titulo"
          :url="indicador.uri"
          :fecha-desde="fechaDesde"
          :fecha-hasta="fechaHasta"
          :filtro="filtro"
          :secatrib="secatrib"
          :teratrib="teratrib"
          @toggle="onToggle"
        />
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import IndicadorV2 from './IndicadorV2.vue'

const props = defineProps({
  grupo: { type: Object, required: true },
  fechaDesde: String,
  fechaHasta: String,
  filtro: [Number, String],
  secatrib: [Number, String],
  teratrib: [Number, String],
  idActivo: { type: [String, Number, null], default: null }
})

const emit = defineEmits(['toggle'])

function onToggle(idIndicador) {
  emit('toggle', idIndicador)
}
</script>

<style scoped>
.modern-grupo-card {
  width: 100%;
}
.border-bottom {
  border-bottom: 1px solid #e2e8f0 !important;
}
.indicators-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
@media (min-width: 600px) {
  .indicators-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (min-width: 960px) {
  .indicators-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
@media (min-width: 1264px) {
  .indicators-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
}
.letter-spacing-1 { letter-spacing: 1px; }
</style>
