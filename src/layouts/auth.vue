<!-- src/layouts/auth.vue — pass-through limpio, sin v-main -->
<template>
  <div class="auth-layout-root">
    <slot>
      <router-view />
    </slot>
  </div>
</template>

<script setup>
// sin lógica — el diseño lo maneja AuthComponent.vue
</script>

<style scoped>
.auth-layout-root {
  min-height: 100dvh;
  width: 100%;
  display: contents; /* completamente transparente al flex del hijo */
}
</style>
