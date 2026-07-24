<template>
  <div class="pa-3 bg-grey-lighten-4 rounded-lg border border-dashed text-center">
    <v-icon
      icon="mdi-power-plug"
      color="primary"
      class="mb-1"
    />
    <div class="text-caption font-weight-bold">
      {{ attr.label || 'Chequeo de Extensión Eléctrica' }}
    </div>
    <div class="text-caption text-grey">
      Formulario especializado para extensiones y conexiones
    </div>
  </div>
</template>
<script setup>
defineProps({
  attr: Object
})
</script>
