<template>
  <CrearInspeccionConexion
    ref="baseRef"
    :fecha-desde="props.fechaDesde"
    :fecha-hasta="props.fechaHasta"
    :cliente-id="props.clienteId"
    :proyecto-id="props.proyectoId"
    :registro-informes="props.registroInformes"
    :hide-header="props.hideHeader"
    plan-mode="plan_c"
    @open-excel="emit('open-excel')"
    @open-cargas="emit('open-cargas')"
  />
</template>

<script setup>
import { ref } from 'vue'
import CrearInspeccionConexion from '@/components/conexion/CrearInspeccionConexion.vue'

const props = defineProps({
  fechaDesde: { type: [String, Date], default: '' },
  fechaHasta: { type: [String, Date], default: '' },
  clienteId: { type: [String, Number], default: '' },
  proyectoId: { type: [String, Number], default: '' },
  registroInformes: { type: Boolean, default: false },
  hideHeader: { type: Boolean, default: false }
})

const emit = defineEmits(['open-excel', 'open-cargas'])
const baseRef = ref(null)

defineExpose({
  filtrarPorCarga(payload) {
    return baseRef.value?.filtrarPorCarga?.(payload)
  },
  getSurveys() {
    return baseRef.value?.getSurveys?.()
  },
  applyRealtimeChange(change) {
    return baseRef.value?.applyRealtimeChange?.(change)
  },
  getRowsForExport() {
    return baseRef.value?.getRowsForExport?.() || []
  }
})
</script>
