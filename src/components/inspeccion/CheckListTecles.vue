<template>
  <div class="pa-3 bg-grey-lighten-4 rounded-lg border border-dashed text-center">
    <v-icon
      icon="mdi-tools"
      color="primary"
      class="mb-1"
    />
    <div class="text-caption font-weight-bold">
      {{ attr.label || 'Checklist de Tecles' }}
    </div>
    <div class="text-caption text-grey">
      Formulario de inspección especializada de tecles
    </div>
  </div>
</template>
<script setup>
defineProps({
  attr: Object
})
</script>
