<template>
  <div class="pa-4">
    <v-card elevation="2">
      <!-- Header / Tabs -->
      <div v-if="mdAndUp">
        <v-tabs
          v-model="tab"
          show-arrows
          bg-color="white"
          class="px-2"
        >
          <v-tab
            v-if="!isExternalCompany"
            value="agregar"
          >
            <v-icon
              start
              icon="mdi-truck-outline"
            />
            Documentación Equipos Móviles
          </v-tab>
          <v-tab value="asistencia">
            <v-icon
              start
              icon="mdi-calendar-check-outline"
            />
            Asistencia
          </v-tab>
          <v-tab
            v-if="!isExternalCompany"
            value="personal"
          >
            <v-icon
              start
              icon="mdi-account-group-outline"
            />
            Personal
          </v-tab>
          <v-tab
            v-if="!isExternalCompany"
            value="manometro"
          >
            <v-icon
              start
              icon="mdi-gauge"
            />
            Equipamiento
          </v-tab>
          <v-tab
            v-if="!isExternalCompany"
            value="formularios"
          >
            <v-icon
              start
              icon="mdi-clipboard-text-outline"
            />
            Formularios personal terreno
          </v-tab>
          <v-tab
            v-if="!isExternalCompany"
            value="historico"
          >
            <v-icon
              start
              icon="mdi-history"
            />
            HISTORICO
          </v-tab>
        </v-tabs>
      </div>

      <!-- MOBILE -->
      <div v-else>
        <v-tabs
          v-model="tab"
          bg-color="white"
          direction="vertical"
          class="px-2"
        >
          <v-tab
            v-if="!isExternalCompany"
            value="agregar"
          >
            <v-icon
              start
              icon="mdi-truck-outline"
            />
            Documentación Equipos Móviles
          </v-tab>
          <v-tab value="asistencia">
            <v-icon
              start
              icon="mdi-calendar-check-outline"
            />
            Asistencia
          </v-tab>
          <v-tab
            v-if="!isExternalCompany"
            value="personal"
          >
            <v-icon
              start
              icon="mdi-account-group-outline"
            />
            Personal
          </v-tab>
          <v-tab
            v-if="!isExternalCompany"
            value="manometro"
          >
            <v-icon
              start
              icon="mdi-gauge"
            />
            Equipamiento
          </v-tab>
          <v-tab
            v-if="!isExternalCompany"
            value="formularios"
          >
            <v-icon
              start
              icon="mdi-clipboard-text-outline"
            />
            Formularios personal terreno
          </v-tab>
          <v-tab
            v-if="!isExternalCompany"
            value="historico"
          >
            <v-icon
              start
              icon="mdi-history"
            />
            HISTORICO
          </v-tab>
        </v-tabs>
      </div>

      <v-divider />

      <!-- Content -->
      <v-card-text>
        <v-window v-model="tab">
          <!-- Tab 1: Equipos Móviles (Estandarizado) -->
          <v-window-item
            v-if="!isExternalCompany"
            value="agregar"
          >
            <EquiposMovilesConexion />
          </v-window-item>

          <!-- Tab 2: Asistencia -->
          <v-window-item value="asistencia">
            <AsistenciaConexion
              :fecha-desde="fechaDesde"
              :fecha-hasta="fechaHasta"
            />
          </v-window-item>

          <!-- Tab 3: Personal -->
          <v-window-item
            v-if="!isExternalCompany"
            value="personal"
          >
            <PersonalConexion
              :fecha-desde="fechaDesde"
              :fecha-hasta="fechaHasta"
            />
          </v-window-item>

          <!-- Tab 4: Manometro -->
          <v-window-item
            v-if="!isExternalCompany"
            value="manometro"
          >
            <EquipamientoConexion
              :fecha-desde="fechaDesde"
              :fecha-hasta="fechaHasta"
            />
          </v-window-item>

          <!-- Tab 5: Formularios -->
          <v-window-item
            v-if="!isExternalCompany"
            value="formularios"
          >
            <FormulariosConexion
              :fecha-desde="fechaDesde"
              :fecha-hasta="fechaHasta"
              @historial-change="onHistorialChange"
            />
          </v-window-item>

          <v-window-item
            v-if="!isExternalCompany"
            value="historico"
          >
            <HistoricoConexion
              :fecha-desde="fechaDesde"
              :fecha-hasta="fechaHasta"
            />
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useDisplay } from 'vuetify';
import { useUserDetailStore } from '@/stores/userDetail';

import EquiposMovilesConexion from '@/components/conexion/EquiposMovilesConexion.vue';
import AsistenciaConexion from '@/components/conexion/AsistenciaConexion.vue';
import PersonalConexion from '@/components/conexion/PersonalConexion.vue';
import EquipamientoConexion from '@/components/conexion/EquipamientoConexion.vue';
import FormulariosConexion from '@/components/conexion/FormulariosConexion.vue';
import HistoricoConexion from '@/components/conexion/HistoricoConexion.vue';

defineProps({
  fechaDesde: { type: String, default: '' },
  fechaHasta: { type: String, default: '' }
});

const { mdAndUp } = useDisplay();
const userDetailStore = useUserDetailStore();
const isExternalCompany = computed(() =>
  userDetailStore.userDetail?.isExternalCompany === true ||
  localStorage.getItem('isExternalCompany') === 'true'
);
const tab = ref('agregar');
const emit = defineEmits(['formularios-historial-change']);

function onHistorialChange(value) {
  emit('formularios-historial-change', !!value);
}

watch(isExternalCompany, (isExternal) => {
  tab.value = isExternal ? 'asistencia' : 'agregar';
}, { immediate: true });
</script>


