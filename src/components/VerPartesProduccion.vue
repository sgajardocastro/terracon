<template>
  <div
    v-if="props.calidad"
    style="margin-bottom: 10px;"
  >
    Protocolos
  </div>
  <div
    v-else
    style="margin-bottom: 10px;"
  >
    Partes Diarios
  </div>
  <v-row dense>
    <v-col cols="12">
      <v-table
        dense
        class="card text-caption table3"
        fixed-header
      >
        <thead>
          <tr>
            <th class="text-left">
              Id Survey
            </th>
            <th class="text-left">
              Nombre Area
            </th>
            <th class="text-left">
              Template
            </th>
            <th class="text-left">
              Código
            </th>
            <th class="text-left">
              Descripción
            </th>
            <th class="text-left">
              Proyecto
            </th>
            <th class="text-left">
              Empresa Cliente
            </th>
            <th class="text-left">
              Fecha Inicio
            </th>
            <th class="text-left">
              Estado
            </th>
            <th class="text-left">
              Doc
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in surveysConDocs"
            :key="item.id_survey"
            style="cursor: pointer;"
          >
            <td>{{ item.id_survey }}</td>
            <td>{{ item.name_area }}</td>
            <td>{{ item.name_template_srv }}</td>
            <td>{{ item.codi_template_srv }}</td>
            <td>{{ item.desc_template_srv }}</td>
            <td>{{ item.nombre_proyecto }}</td>
            <td>{{ item.name_empresa_cliente }}</td>
            <td>{{ item.fecha_plan_ini }}</td>
            <td>{{ item.estado_srv }}</td>
            <td>
              <template v-if="item.id_doc">
                <a
                  :href="`/archivo/terracon/${item.id_doc}`"
                  target="_blank"
                  rel="noopener"
                  title="Abrir PDF"
                  style="display:inline-flex;align-items:center;justify-content:center"
                >
                  <v-icon size="26">mdi-file-pdf-box</v-icon>
                </a>
              </template>
              <template v-else>
                —
              </template>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-col>
  </v-row>
  <v-dialog
    v-model="showModal"
    max-width="1000"
  >
    <v-card>
      <v-toolbar
        color="primary"
        dark
      >
        <v-toolbar-title>Detalle de Inspección</v-toolbar-title>
        <v-spacer />
        <v-btn
          icon
          @click="showModal = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text>
        <VerSurvey :Survey="selectedSurveyId" />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script setup>
import { onMounted, ref } from 'vue';
import apiAxios from '@/services/api';

import { useRouter } from 'vue-router';

const props = defineProps({
  fechaDesde: String,
  fechaHasta: String,
  clienteId: [String, Number],
  proyectoId: [String, Number],
  estadoSurvey: String,
  calidad: Boolean
})

const router = useRouter()

const surveys = ref([]);
const archivos = ref([]);

const selectedSurveyId = ref(null)
const showModal = ref(false)

const surveysConDocs = ref([]);  // aquí pondremos las encuestas con sus docs

defineExpose({
  getSurveys
})

onMounted(() => {
  getSurveys()
});

watch(
  [() => props.fechaDesde, () => props.fechaHasta, () => props.clienteId, () => props.proyectoId],
  () => {
    console.log('🔄 Algún filtro cambió:', props.fechaDesde, props.fechaHasta, props.clienteId, props.proyectoId)
    getSurveys()
  }
)


function abrirModalConSurvey(id) {
  console.log('Abrir modal para idInspeccion:', id);
  selectedSurveyId.value = id;
  showModal.value = true;
}

function irAlSurvey(id) {
  router.push(`/survey2?idInspeccion=${id}`) // Cambia esta ruta según tu app
}

async function getSurveys() {
  try {
    // 👉 Solo traemos los surveys
    const respSurveys = await apiAxios.get(
      `/servicio/leanglobal/procesosSurveyV3` +
        `?fecha_desde=${props.fechaDesde}` +
        `&fecha_hasta=${props.fechaHasta}` +
        `&ts.id_empresa_cliente=${props.clienteId ?? ''}` +
        `&ts.id_proyecto=${props.proyectoId ?? ''}`
    );

    // Lista base
    surveys.value = respSurveys.data.datos || [];

    // Filtro por estado (igual que antes)
    if (props.estadoSurvey != null && props.estadoSurvey !== '') {
      if (props.estadoSurvey === 'APROBADO' || props.estadoSurvey === 'RECHAZADO') {
        surveys.value = surveys.value.filter(s => s.estado_srv === props.estadoSurvey);
      } else {
        surveys.value = surveys.value.filter(s => s.estado_srv !== 'APROBADO' && s.estado_srv !== 'RECHAZADO');
      }
    }

    surveys.value = surveys.value.filter(s => s.id_proyecto === 1 && s.codi_template_srv === 'PPD');

    if(props.calidad){
      surveys.value = surveys.value.filter(s => s.id_area === 1)
    }

    // Orden descendente por id
    surveys.value.sort((a, b) => Number(b.id_survey) - Number(a.id_survey));

    // Mantener compatibilidad: la UI puede seguir leyendo surveysConDocs
    // (si en algún lugar antes usabas s.documentos, ahora ya no se carga aquí)
    surveysConDocs.value = surveys.value.map(s => ({ ...s }));

    // ⬇️ Si más adelante quieres armar un link con el id_doc (que ya viene en V3),
    // puedes agregar un campo calculado acá, por ejemplo:
    // surveysConDocs.value = surveys.value.map(s => ({
    //   ...s,
    //   docUrl: s.id_doc ? `/tu/endpoint/de/descarga?id_doc=${s.id_doc}` : null
    // }));

  } catch (error) {
    console.error("Error al obtener surveys:", error);
  }
}
</script>
<style scoped>
.card {
  margin: 5px;
  padding: 5px;
  color: #757575;
  border-radius: 5px;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
}
.card {
  margin: 5px;
  padding: 5px;
  color: #757575;
  border-radius: 5px;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
              0 1px 5px 0 rgba(0, 0, 0, 0.12),
              0 3px 1px -2px rgba(0, 0, 0, 0.2);
}

.fixed-header thead th {
  position: sticky;
  top: 0;
  background-color: white; /* o el fondo de tu tema */
  z-index: 1;              /* para que quede por encima de las filas */
}
.table3 {
  height: calc(100vh - 250px);
}
</style>
