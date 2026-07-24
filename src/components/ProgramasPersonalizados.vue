<template>
  <v-row
    dense
    class="align-center"
  >
    <v-col
      cols="12"
      class="d-flex justify-end"
    >
      <v-btn
        color="primary"
        variant="flat"
        @click="crearProgramas"
      >
        CREAR PERSONALIZADOS
      </v-btn>
    </v-col>
  </v-row>
  <!-- Indicadores -->
  <v-row dense>
    <v-col cols="12">
      <div class="grupos">
        <div
          v-for="(item, i) in jsonData"
          :key="i"
        >
          <div
            v-for="(grupo, gi) in item.grupo"
            :key="gi"
          >
            <GrupoIndicador
              :grupo="grupo"
              :fecha-desde="fechaDesde"
              :fecha-hasta="fechaHasta"
              :id-activo="idActivoMA"
              @toggle="onIndicadorToggle"
            />
          </div>
        </div>
      </div>
    </v-col>
  </v-row>
  <br>
  <!-- Tabla -->
  <v-row dense>
    <v-col cols="12">
      <TablaProgramasPersonalizados
        ref="tablaRef"
        :key="tablaKey"
        @editar="onEditarPersonalizado"
      />
    </v-col>
  </v-row>
  <v-dialog
    v-model="showCrearProgramas"
    :fullscreen="smAndDown"
    scroll-strategy="reposition"
    eager
    :retain-focus="false"
    class="dialog--wide"
  >
    <v-card
      class="d-flex flex-column"
      style="max-height: 100vh;"
    >
      <!--v-toolbar density="comfortable" color="primary" dark>
        <v-toolbar-title>Crear Programas Personalizados</v-toolbar-title>
        <v-spacer />
        <v-btn icon @click="showCrearProgramas = false"><v-icon>mdi-close</v-icon></v-btn>
      </v-toolbar-->

      <!-- zona scrolleable -->
      <v-card-text
        class="pa-0"
        style="overflow-y:auto; max-height: calc(100vh - 56px);"
      >
        <CrearProgramasPersonalizados
          :key="crearKey"
          :personalizado="personalizadoSeleccionado"
          @guardado="onPersonalizadoGuardado"
          @cerrar="showCrearProgramas = false"
        />
      </v-card-text>

      <!-- (opcional) acciones fijas abajo -->
      <!--
      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="showCrearProgramas = false">Cerrar</v-btn>
      </v-card-actions>
      -->
    </v-card>
  </v-dialog>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import apiAxios from '@/services/api';
import CrearProgramasPersonalizados from './CrearProgramasPersonalizados.vue';

import { useDisplay } from 'vuetify'
const { smAndDown } = useDisplay()

const jsonData = ref([])
const showCrearProgramas = ref(false)

const personalizadoSeleccionado = ref(null) // 👈 aquí guardamos el row

const tablaRef = ref(null);
// plan A: si la tabla expone un método reload(), lo usamos;
// plan B: si no, usamos un :key para forzar re-montaje
const tablaKey = ref(0);

const crearKey = ref(0)

function refreshTabla() {
  if (tablaRef.value?.reload) {
    tablaRef.value.reload(); // <- si tu Tabla defineExpose({ reload })
  } else {
    tablaKey.value++;        // <- fallback universal
  }
}

function onPersonalizadoGuardado(payload) {
  // payload puede traer id_personalizado, etc. si te sirve
  refreshTabla();
  //showCrearProgramas.value = false; // opcional: cerrar el diálogo al guardar
}

function onEditarPersonalizado(row) {
  // si vas a editar, conviene clonar para no mutar directo la prop en el form:
  personalizadoSeleccionado.value = JSON.parse(JSON.stringify(row))
  showCrearProgramas.value = true
}

function crearProgramas() {
  personalizadoSeleccionado.value = null;
  crearKey.value++;
  showCrearProgramas.value = true;
}

onMounted(async () => {
  const resp = await fetch(import.meta.env.BASE_URL + 'dataProgramasPersonalizados.json');
  const data = await resp.json()
  jsonData.value = data
})
</script>
<style scoped>
/* Ancho del overlay del diálogo en desktop */
:deep(.dialog--wide .v-overlay__content) {
  width: min(95vw, 1700px); /* ajusta a gusto: 95% viewport hasta 1700px */
}

/* Si quieres un pelín más de respiro en mobile fullscreen */
@media (max-width: 600px) {
  :deep(.dialog--wide .v-card) {
    border-radius: 0; /* fullscreen real en mobile */
  }
}
</style>
