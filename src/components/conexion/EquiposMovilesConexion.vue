<template>
  <div class="d-flex flex-column ga-4 h-100">
    <!-- Indicadores -->
    <EquiposMovilesIndicadores />

    <!-- Header / Filtros -->
    <v-card
      class="surface-card pa-4"
      variant="outlined"
      style="border-color: #e2e8f0; border-radius: 12px; background-color: white;"
    >
      <div class="d-flex align-center flex-wrap ga-4">
        <!-- Título Sección -->
        <div class="d-flex align-center mr-4">
          <div class="icon-box mr-3">
            <v-icon
              color="primary"
              icon="mdi-truck-outline"
            />
          </div>
          <div>
            <div class="text-subtitle-1 font-weight-bold text-primary-dark">
              Documentación Equipos Móviles
            </div>
            <div class="text-caption text-medium-emphasis">
              Gestión de vehículos y conductores
            </div>
          </div>
        </div>

        <v-divider
          vertical
          class="mx-2 hidden-sm-and-down"
        />

        <!-- Buscador -->
        <div style="width: 280px;">
          <label class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary">Buscar Patente /
            Conductor</label>
          <v-text-field
            v-model="search"
            variant="outlined"
            density="compact"
            hide-details
            bg-color="grey-lighten-5"
            color="primary"
            class="sakai-input"
            clearable
            prepend-inner-icon="mdi-magnify"
            placeholder="AB-CD-12..."
          />
        </div>

        <v-spacer />

        <v-btn
          color="primary"
          class="text-none text-subtitle-2 px-6"
          height="40"
          elevation="0"
          rounded="lg"
          @click="crearEquipo"
        >
          <v-icon
            start
            size="18"
          >
            mdi-plus
          </v-icon>
          Nuevo Equipo
        </v-btn>
      </div>
    </v-card>

    <!-- Tabla (Manteniendo la lógica existente) -->
    <div
      class="flex-grow-1 overflow-hidden"
      style="min-height: 0;"
    >
      <DocumentosUsuariosConexion
        ref="docComponent"
        :search="search"
        :hide-header="true"
        :fecha-desde="fechaDesde"
        :fecha-hasta="fechaHasta"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import EquiposMovilesIndicadores from './EquiposMovilesIndicadores.vue';
import DocumentosUsuariosConexion from './DocumentosUsuariosConexion.vue';

defineProps({
    fechaDesde: { type: String, default: '' },
    fechaHasta: { type: String, default: '' }
});

const search = ref('');
const docComponent = ref(null);

function crearEquipo() {
    docComponent.value?.abrirDialogoEquipo(null);
}
</script>

<style scoped>
.surface-card {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02) !important;
}

.icon-box {
    width: 40px;
    height: 40px;
    background: #f1f5f9;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.text-primary-dark {
    color: #1e293b;
}

.sakai-input :deep(.v-field__outline) {
    --v-field-border-opacity: 0.15;
}

.sakai-input :deep(.v-field--focused .v-field__outline) {
    --v-field-border-opacity: 0.8;
}

.sakai-input :deep(.v-field) {
    border-radius: 8px;
}
</style>
