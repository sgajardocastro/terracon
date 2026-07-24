<template>
  <DashboardLayout>
    <ConsultarUsuario />
  </DashboardLayout>
</template>
<script setup>
import { onMounted } from 'vue';
import DashboardLayout from '../layouts/dashboard.vue';
import ConsultarUsuario from '@/components/ConsultarUsuario.vue';
import { ref } from 'vue'

</script>
<style scoped>
</style>
