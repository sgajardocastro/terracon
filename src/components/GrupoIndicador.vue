<template>
  <div class="grupo">
    <label>{{ grupo.nombreCorto }}</label>

    <div class="horizontal-layout">
      <AtpIndicador
        v-for="(indicador, index) in grupo.indicadores"
        :id="indicador.id ?? `${grupo.nombreCorto}-${index}`"
        :key="indicador.id ?? `${grupo.nombreCorto}-${index}`"
        :id-activo="idActivo"
        :indicador="indicador"
        :icon="indicador.icono"
        :color="indicador.color"
        :grupo="grupo.nombreCorto"
        :titulo="indicador.titulo"
        :fecha-desde="fechaDesde"
        :fecha-hasta="fechaHasta"
        :filtro="filtro"
        :filtro1="filtro1"
        :filtro2="filtro2"
        :in-prop="inProp"
        :url="indicador.uri"
        :secatrib="secatrib"
        :teratrib="teratrib"
        @toggle="onToggle"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, computed } from 'vue'
import AtpIndicador from './Indicador.vue'

// ✅ Recibir idActivo desde el padre superior
const props = defineProps({
  grupo: { type: Object, required: true },
  fechaDesde: String,
  fechaHasta: String,
  filtro: [Number, String],     // cliente id
  secatrib: [Number, String],   // proyecto id
  teratrib: [Number, String],   // tu dimensión/selector
  idActivo: { type: [String, Number, null], default: null }  // 👈 agregado
})

const emit = defineEmits(['toggle'])

// ✅ reemitir el id clickeado hacia el padre superior
function onToggle(idIndicador) {
  // console.log('[GrupoIndicador] reemit toggle:', idIndicador)
  console.log('reemit grupo', idIndicador)
  emit('toggle', idIndicador)
}

// Estado local (si lo usas)
const filtro1 = ref('')
const filtro2 = ref('')
const inProp  = ref('')

</script>
<style scoped>
.grupo {
  margin: 5px;
  padding: 5px;
  border-radius: 5px;
  background-color: #eaeded;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
              0 1px 5px 0 rgba(0, 0, 0, 0.12),
              0 3px 1px -2px rgba(0, 0, 0, 0.2);
  width: 100%;
}

.small-date {
  font-size: 0.75rem;
  width: 9em;
}

.horizontal-layout {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 0px;
}
</style>
