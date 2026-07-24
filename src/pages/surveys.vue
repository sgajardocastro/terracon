<template>
  <DashboardLayout>
    <v-row>
      <v-col
        cols="6"
        sm="6"
      >
        <v-combobox
          v-model="filtro"
          :items="filtros"
          item-value="ID"
          item-title="NOMBRE"
          label="Filtro Estados"
          variant="outlined"
          class="bg-white"
          density="compact"
          return-object
        />
      </v-col>

      <v-col
        cols="6"
        sm="6"
      >
        <v-combobox
          v-model="filtroDim"
          :items="filtroDimension"
          item-value="ID"
          item-title="NOMBRE"
          label="Filtro Dimensión"
          variant="outlined"
          class="bg-white"
          density="compact"
          return-object
        />
      </v-col>

      <v-col cols="12">
        <v-text-field
          v-model="filtroTexto"
          density="compact"
          variant="outlined"
          label="Buscar Texto"
          class="bg-white"
          required
        />
      </v-col>

      <v-col
        v-for="survey in filteredSurveys"
        :key="survey.id_survey"
        cols="12"
      >
        <v-card
          :to="`/survey2?idInspeccion=${survey.id_survey}`"
          class="mx-auto sombra-resaltada"
          :subtitle="`${survey.name_empresa_cliente} / ${survey.nombre_proyecto}`"
          :title="`${survey.desc_template_srv }: ${survey.name_template_srv}`"
        >
          <template #append>
            <v-icon
              :color="getEstadoColor(survey.estado_srv)"
              icon="mdi-circle"
            />
          </template>
          <v-card-text>
            {{ `${survey.codi_template_srv} (Id ${survey.id_survey})` }}<br>
            Fecha Planificada de Ejecución: {{ survey.fecha_plan_ini }}
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </DashboardLayout>
</template>
<script setup>
import DashboardLayout from '../layouts/dashboard.vue';
import { onMounted, ref, computed } from "vue";
import apiAxios from '@/services/api';
/* eslint-disable */
const filtros = ref([
  { ID: 1, NOMBRE: 'Creado' },
  { ID: 2, NOMBRE: 'Ejecución' },
  { ID: 3, NOMBRE: 'Retrasado' },
  { ID: 4, NOMBRE: 'Terminado' }
]);

const filtro = ref(null);
const filtroTexto = ref('');
const surveys = ref([]);
const filtroDim = ref(null);
const filtroDimension = ref([]);

onMounted(() => {
  getSurvey();
});

async function getSurvey() {
  try {
    const response = await apiAxios.get("/servicio/leanglobal/procesosSurvey");
    surveys.value = response.data;
    console.log("Surveys obtenidos:", surveys.value);

    const uniqueAreas = [...new Set(surveys.value.map(item => item.name_area))];
    filtroDimension.value = uniqueAreas.map((area, index) => ({
      ID: index + 1,
      NOMBRE: area
    }));
  } catch (error) {
    console.error("Error al obtener survey:", error);
  }
}

const filteredSurveys = computed(() => {
  return (surveys.value ?? []).filter(s => {
    const coincideEstado = !filtro.value || s.estado_srv === filtro.value.NOMBRE;
    const coincideDimension = !filtroDim.value || s.name_area === filtroDim.value.NOMBRE;

    const texto = filtroTexto.value?.toLowerCase() ?? '';
    const coincideTexto =
      !texto ||
      s.name_template_srv?.toLowerCase().includes(texto) ||
      s.name_empresa_cliente?.toLowerCase().includes(texto) ||
      s.nombre_proyecto?.toLowerCase().includes(texto) ||
      s.codi_template_srv?.toLowerCase().includes(texto);

    return coincideEstado && coincideDimension && coincideTexto;
  });
});

function getEstadoColor(estado) {
  switch (estado) {
    case 'Creado':
      return 'blue darken-2';
    case 'Ejecución':
      return 'yellow darken-2';
    case 'Terminado':
      return 'green darken-2';
    case 'Retrasado':
      return 'red darken-2';
    default:
      return 'grey';
  }
}
</script>
<style scoped>
tbody tr:nth-of-type(odd) {
  background-color: rgba(0, 0, 0, 0.05);
}
.sombra-resaltada {
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3) !important;
  border-radius: 12px;
}
</style>
