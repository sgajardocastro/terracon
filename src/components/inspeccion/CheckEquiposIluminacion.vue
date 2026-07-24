<template>
  <div class="pa-3 bg-grey-lighten-4 rounded-lg border border-dashed text-center">
    <v-icon
      icon="mdi-lightbulb-on"
      color="primary"
      class="mb-1"
    />
    <div class="text-caption font-weight-bold">
      {{ attr.label || 'Equipos de Iluminación' }}
    </div>
    <div class="text-caption text-grey">
      Formulario especializado para torres de iluminación
    </div>
  </div>
</template>
<script setup>
defineProps({
  attr: Object
})
</script>
