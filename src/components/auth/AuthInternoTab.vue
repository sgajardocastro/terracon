<template>
  <v-form
    class="d-grid ga-3 pt-2"
    @submit.prevent="$emit('submit')"
  >
    <v-text-field
      :model-value="username"
      label="Usuario / Email"
      autocomplete="username"
      density="comfortable"
      variant="outlined"
      hide-details="auto"
      rounded="lg"
      @update:model-value="$emit('update:username', $event)"
    >
      <template #prepend-inner>
        <v-icon color="green-darken-2">
          mdi-account
        </v-icon>
      </template>
    </v-text-field>

    <v-text-field
      :model-value="password"
      :type="showPassword ? 'text' : 'password'"
      label="Contraseña"
      autocomplete="current-password"
      density="comfortable"
      variant="outlined"
      hide-details="auto"
      rounded="lg"
      @update:model-value="$emit('update:password', $event)"
    >
      <template #prepend-inner>
        <v-icon color="green-darken-2">
          mdi-lock
        </v-icon>
      </template>
      <template #append-inner>
        <v-icon
          :icon="showPassword ? 'mdi-eye-off' : 'mdi-eye-outline'"
          color="grey-darken-1"
          class="cursor-pointer"
          :title="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
          @click="$emit('toggle-password')"
        />
      </template>
    </v-text-field>

    <div class="mt-2 w-100">
      <v-btn
        type="submit"
        color="primary"
        variant="flat"
        :height="44"
        class="w-100 rounded-lg btn-full"
      >
        Iniciar Sesión
      </v-btn>
    </div>
  </v-form>

  <v-row
    class="my-6"
    align="center"
    no-gutters
  >
    <v-col><v-divider /></v-col>
    <span class="mx-4 text-medium-emphasis text-caption">O</span>
    <v-col><v-divider /></v-col>
  </v-row>

  <div class="my-2 d-flex justify-center">
    <slot name="google-button" />
  </div>
</template>

<script setup>
defineProps({
  username: { type: String, default: '' },
  password: { type: String, default: '' },
  showPassword: { type: Boolean, default: false },
})

defineEmits([
  'submit',
  'update:username',
  'update:password',
  'toggle-password',
])
</script>

<style scoped>
.d-grid { display: grid; gap: 12px; }
</style>
