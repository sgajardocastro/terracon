<template>
  <v-dialog
    :model-value="modelValue"
    max-width="420"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="pa-5">
      <div class="text-subtitle-1 font-weight-medium mb-2">
        Continuar con Google
      </div>

      <v-alert
        v-if="externalEmail"
        type="info"
        variant="tonal"
        density="compact"
        class="mb-4"
      >
        Continuando con: <strong>{{ externalEmail }}</strong>
      </v-alert>

      <div class="d-flex justify-center">
        <slot name="google-button" />
      </div>

      <div class="mt-4 d-flex justify-end">
        <v-btn
          variant="text"
          @click="$emit('close')"
        >
          Cerrar
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  externalEmail: { type: String, default: '' },
})

defineEmits(['update:modelValue', 'close'])
</script>
