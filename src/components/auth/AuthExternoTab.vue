<template>
  <v-form
    class="d-grid ga-3 pt-2"
    @submit.prevent="$emit('submit')"
  >
    <v-text-field
      :model-value="rut"
      label="RUT"
      placeholder="12345678-9"
      autocomplete="username"
      density="comfortable"
      variant="outlined"
      hide-details="auto"
      rounded="lg"
      @update:model-value="$emit('update:rut', $event)"
    >
      <template #prepend-inner>
        <v-icon color="green-darken-2">
          mdi-card-account-details-outline
        </v-icon>
      </template>
    </v-text-field>

    <div class="mt-2 w-100">
      <v-btn
        :loading="loadingRut"
        type="submit"
        color="primary"
        variant="flat"
        :height="44"
        class="w-100 rounded-lg btn-full"
      >
        Continuar con Google
      </v-btn>
    </div>

    <v-alert
      v-if="rutHint"
      type="info"
      variant="tonal"
      density="compact"
      class="mt-2"
    >
      {{ rutHint }}
    </v-alert>

    <div
      v-if="externalEmail"
      class="my-2 d-flex justify-center"
    >
      <slot name="google-button" />
    </div>
  </v-form>
</template>

<script setup>
defineProps({
  rut: { type: String, default: '' },
  rutHint: { type: String, default: '' },
  loadingRut: { type: Boolean, default: false },
  externalEmail: { type: String, default: '' },
})

defineEmits(['submit', 'update:rut'])
</script>

<style scoped>
.d-grid { display: grid; gap: 12px; }
</style>
