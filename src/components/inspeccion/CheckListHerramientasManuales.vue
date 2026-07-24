<template>
  <div class="pa-3 bg-grey-lighten-4 rounded-lg border border-dashed text-center">
    <v-icon
      icon="mdi-wrench"
      color="primary"
      class="mb-1"
    />
    <div class="text-caption font-weight-bold">
      {{ attr.label || 'Herramientas Manuales' }}
    </div>
    <div class="text-caption text-grey">
      Formulario especializado de herramientas manuales
    </div>
  </div>
</template>
<script setup>
defineProps({
  attr: Object
})
</script>
