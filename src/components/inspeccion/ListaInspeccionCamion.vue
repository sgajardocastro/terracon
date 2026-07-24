<template>
  <div class="pa-3 bg-grey-lighten-4 rounded-lg border border-dashed text-center">
    <v-icon
      icon="mdi-truck"
      color="primary"
      class="mb-1"
    />
    <div class="text-caption font-weight-bold">
      {{ attr.label || 'Inspección de Camión' }}
    </div>
    <div class="text-caption text-grey">
      Formulario especializado para camiones y vehículos pesados
    </div>
  </div>
</template>
<script setup>
defineProps({
  attr: Object
})
</script>
