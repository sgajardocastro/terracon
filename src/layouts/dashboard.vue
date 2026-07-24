<!-- src/layouts/dashboard.vue -->
<template>
  <div class="contenedor-principal">
    <HeaderComponent />
    <SidebarComponent />
    <v-main>
      <div
        id="main"
        class="main container left-pd"
      >
        <slot>
          <router-view />
        </slot>
      </div>
    </v-main>
  </div>
</template>

<script setup>
import HeaderComponent from '../components/dashboard/HeaderComponent.vue';
import SidebarComponent from '../components/dashboard/SidebarComponent.vue';
</script>
