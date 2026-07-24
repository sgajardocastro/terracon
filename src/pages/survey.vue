<template>
  <DashboardLayout>
    <v-row
      class="d-flex align-center justify-center"
    >
      <v-col
        cols="12"
        md="3"
        class="d-flex align-center justify-center"
      >
        <v-img
          max-height="300"
          max-width="300"
          contain
          :src="`/archivo/terracon/${imagenEmpresaTerracon}`"
        />
      </v-col>

      <v-col
        cols="12"
        md="6"
        class="d-flex align-center justify-center"
      >
        <v-card>
          <div class="d-flex flex-no-wrap justify-space-between align-center">
            <div>
              <v-card-title class="text-h5">
                {{ surveyDetailStore.surveyDetail[0]?.desc_template_srv || 'Survey Details' }}
              </v-card-title>
              <v-card-subtitle class="text-subtitle-1">
                <strong>Área:</strong> {{ surveyDetailStore.surveyDetail[0]?.name_area || '' }}
              </v-card-subtitle>
              <v-card-subtitle class="text-subtitle-1">
                <strong>Familia:</strong> {{ surveyDetailStore.surveyDetail[0]?.name_tipo_srv }} ({{ surveyDetailStore.surveyDetail[0]?.codi_tipo_srv }})
              </v-card-subtitle>
              <v-card-subtitle class="text-subtitle-1">
                <strong>{{ surveyDetailStore.surveyDetail[0]?.desc_template_srv }}:</strong> {{ surveyDetailStore.surveyDetail[0]?.codi_template_srv }}
              </v-card-subtitle>
              <v-card-subtitle class="text-subtitle-1">
                <strong>Id Documento:</strong> {{ surveyDetailStore.surveyDetail[0]?.id_survey }}
              </v-card-subtitle>
              <v-card-subtitle class="text-subtitle-1">
                <strong>{{ surveyDetailStore.surveyDetail[0]?.name_empresa_cliente }}</strong> / {{ surveyDetailStore.surveyDetail[0]?.nombre_proyecto }}
              </v-card-subtitle>
              <v-card-subtitle class="text-subtitle-1">
                <strong>Fechas Plan:</strong> {{ surveyDetailStore.surveyDetail[0]?.fecha_plan_ini }} - {{ surveyDetailStore.surveyDetail[0]?.fecha_plan_fin }}
              </v-card-subtitle>
              <v-card-subtitle class="text-subtitle-1">
                <strong>Fechas Real:</strong> {{ surveyDetailStore.surveyDetail[0]?.fecha_real_ini ?? '---' }} - {{ surveyDetailStore.surveyDetail[0]?.fecha_real_fin ?? '---' }}
              </v-card-subtitle>
            </div>
          </div>
        </v-card>
      </v-col>

      <!-- Imagen derecha -->
      <v-col
        cols="12"
        md="3"
        class="d-flex align-center justify-center"
      >
        <v-img
          max-height="300"
          max-width="300"
          contain
          :src="`/archivo/terracon/${imagenEmpresa}`"
        />
      </v-col>
    </v-row>
    <div
      v-for="survey in surveyDetailStore.surveyDetail"
      :key="survey.id_survey"
      style="display: flex; flex-wrap: wrap; gap: 16px; padding: 16px;"
    >
      <div
        v-for="(segmento, index) in getSegmentos(survey)"
        :key="segmento.posicion ?? index"
        style="width: 48%;"
      >
        <v-card
          class="sombra-resaltada"
          :color="segmento.touch ? 'green lighten-4' : 'red lighten-4'"
          :title="segmento.label || `Segmento ${index + 1}`"
          style="padding: 10px;"
        />
        <div style="background-color: #CFD8DD;">
          <v-row class="py-5">
            <v-col
              v-for="(attr, i) in segmento.attributes || []"
              :key="i"
              cols="12"
            >
              <div v-if="attr.type === 'textField'">
                <v-text-field
                  v-model="attr.default"
                  variant="outlined"
                  :label="attr.label"
                  dense
                  hide-details
                  density="compact"
                  class="bg-white"
                  :class="attr.nullable === false && !attr.default ? 'text-custom-red' : ''"
                  @update:model-value="(val) => {
                    attr.default = val;
                    segmentosCompletos(); // tu función
                  }"
                />
              </div>

              <div v-else-if="attr.type === 'datePicker'">
                <v-text-field
                  v-model="attr.default"
                  variant="outlined"
                  :label="attr.label"
                  type="date"
                  dense
                  hide-details
                  density="compact"
                  class="bg-white"
                  :class="attr.nullable === false && !attr.default ? 'text-red' : ''"
                  @update:model-value="(val) => {
                    attr.default = val;
                    segmentosCompletos(); // tu función
                  }"
                />
              </div>

              <div v-else-if="attr.type === 'dateHourPicker'">
                <v-text-field
                  v-model="attr.default"
                  variant="outlined"
                  :label="attr.label"
                  type="datetime-local"
                  dense
                  density="compact"
                  hide-details
                  class="bg-white"
                  :class="attr.nullable === false && attr.default == 'sysdatehhmm' ? 'text-red' : ''"
                  @update:model-value="(val) => {
                    attr.default = val;
                    segmentosCompletos(); // tu función
                  }"
                />
              </div>

              <div v-else-if="attr.type === 'checkList'">
                <v-row dense>
                  <v-col
                    v-for="(item) in attr.checkBoby"
                    :key="item.id"
                    cols="12"
                  >
                    <div style="display: flex; gap: 1rem;">
                      <div
                        style="flex: 1;"
                        class="font-weight-medium mb-1"
                      >
                        {{ item.label }}
                      </div>
                      <div style="flex: 2;">
                        <v-btn-toggle
                          v-model="item.default"
                          mandatory
                          density="compact"
                          class="mb-2"
                          @update:model-value="(val) => {
                            attr.default = val;
                            segmentosCompletos(); // tu función
                          }"
                        >
                          <v-btn
                            v-for="option in item.options"
                            :key="option.id || option.value"
                            :value="option.id || option.value"
                            size="small"

                            class="me-2"
                          >
                            {{ option.label || option.value }}
                          </v-btn>
                        </v-btn-toggle>
                      </div>
                    </div>
                    <v-textarea
                      v-if="item.obs !== undefined"
                      v-model="item.obs"
                      variant="outlined"
                      label="Observaciones"
                      rows="2"
                      auto-grow
                      hide-details
                      class="bg-white"
                    />
                  </v-col>
                </v-row>
              </div>

              <div v-else-if="attr.type === 'comboBox'">
                <v-row dense>
                  <v-col
                    v-if="attr.values"
                    :key="attr.values.id"
                    cols="12"
                  >
                    <div style="display: flex; gap: 1rem;">
                      <div
                        style="flex: 1;"
                        class="font-weight-medium mb-1"
                      >
                        {{ attr.values.quest || 'Seleccione una opción' }}
                      </div>
                      <div style="flex: 2;">
                        <v-select
                          v-model="attr.values.selected"
                          density="compact"
                          variant="outlined"
                          :items="getSelectItems(attr.values.options)"
                          item-title="label"
                          item-value="value"
                          dense
                          hide-details
                          label="Selecciona una opción"
                          class="bg-white"
                          @update:model-value="(val) => {
                            attr.default = val;
                            segmentosCompletos(); // tu función
                          }"
                        />
                      </div>
                    </div>
                  </v-col>
                </v-row>
              </div>

              <div v-else-if="attr.type === 'photoCapture'">
                <v-row>
                  <v-col class="pb-12">
                    <div>
                      <FotoCapture
                        v-model:galeria="attr.galeria"
                        v-model:observacion="attr.obs"
                        :max-fotos="attr.maxFotos"
                        :obligatorio-fotos="attr.obligatorioFotos"
                        :compression="attr.compression"
                        @update:galeria="() => segmentosCompletos()"
                      />
                    </div>
                  </v-col>
                </v-row>
              </div>

              <div v-else-if="attr.type === 'geoLocation'">
                <v-row>
                  <v-col class="pb-12">
                    <div>
                      <GeoLocation
                        :label="attr.label"
                        :model-value="attr.default"
                        @update:model-value="(value) => attr.default = value"
                      />
                    </div>
                  </v-col>
                </v-row>
              </div>

              <div
                v-else-if="attr.type === 'textArea'"
                style="padding-top: 5px;"
              >
                <v-textarea
                  v-model="attr.default"
                  variant="outlined"
                  :label="attr.label"
                  dense
                  hide-details
                  class="bg-white"
                  :class="attr.nullable === false && !attr.default ? 'text-custom-red' : ''"
                  @update:model-value="(val) => {
                    attr.default = val;
                    segmentosCompletos(); // tu función
                  }"
                />
              </div>

              <div
                v-else-if="attr.type === 'photo'"
                class="pb-5"
              >
                <div class="font-weight-medium mb-1">
                  {{ attr.label || 'Picture' }}
                </div>
                <v-img
                  width="100%"
                  aspect-ratio="16/9"
                  cover
                  :src="attr.src"
                />
              </div>

              <div v-else-if="attr.type === 'fileUpload'">
                <v-row>
                  <v-col class="pb-12">
                    <div>
                      <FileUpload
                        v-model:archivos="attr.archivos"
                        v-model:observacion="attr.obs"
                        :max-fotos="attr.maxArchivos"
                        @update:archivos="() => segmentosCompletos()"
                      />
                    </div>
                  </v-col>
                </v-row>
              </div>

              <div
                v-else-if="attr.type === 'newLine'"
                style="padding-top: 5px;"
              >
                <hr>
              </div>

              <div
                v-else-if="attr.type === 'labelLine'"
                style="padding-top: 5px;"
              >
                <span>{{ attr.text }}</span>
              </div>

              <div
                v-else-if="attr.type === 'labelLineH1'"
                style="padding-top: 5px;"
              >
                <h1>{{ attr.text }}</h1>
              </div>

              <div
                v-else-if="attr.type === 'labelLineH2'"
                style="padding-top: 5px;"
              >
                <h2>{{ attr.text }}</h2>
              </div>

              <div
                v-else-if="attr.type === 'labelLineH3'"
                style="padding-top: 5px;"
              >
                <h3>{{ attr.text }}</h3>
              </div>

              <div
                v-else-if="attr.type === 'labelLineH4'"
                style="padding-top: 5px;"
              >
                <h4>{{ attr.text }}</h4>
              </div>

              <div
                v-else-if="attr.type === 'labelLineH5'"
                style="padding-top: 5px;"
              >
                <h5>{{ attr.text }}</h5>
              </div>

              <div
                v-else-if="attr.type === 'photoCheck'"
                style="padding-top: 5px;"
              >
                <FotoCeck
                  v-if="attr.type === 'photoCheck'"
                  v-model="attr.default"
                  :label="attr.label"
                  :galeria="attr.galeria"
                  :observacion="attr.obs"
                  :options="attr.options"
                  :compression="attr.compression || 10"
                  @update:galeria="val => attr.galeria = val"
                  @update:observacion="val => attr.obs = val"
                />
              </div>

              <div v-else>
                <em>Tipo {{ attr.type }} no implementado</em>
                <em>{{ attr }}</em>
              </div>
            </v-col>
          </v-row>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
<script setup>
import DashboardLayout from '../layouts/dashboard.vue';
import { useRoute, useRouter } from "vue-router";
import { ref, onMounted } from 'vue';
import apiAxios from '@/services/api';
import FotoCapture from '@/components/FotoCapture.vue'
import FotoCeck from '@/components/FotoCheck.vue'
import GeoLocation from "@/components/GeoLocation.vue";
import FileUpload from "@/components/FileUpload.vue";
import { useSurveyDetailStore } from "@/stores/surveyDetail";
/* eslint-disable */

const surveyDetailStore = useSurveyDetailStore()

// Puedes leer el valor
const router = useRouter();
const route = useRoute();
const idSurvey = ref(null);
const show = ref(false);
const errores = ref({});
const imagenEmpresa = ref('');
const imagenEmpresaTerracon = ref('');

idSurvey.value = route.query.idInspeccion;

console.log(idSurvey.value);

const surveys = ref(null);

onMounted(async () => {
  await getSurvey();
  segmentosCompletos();
});

async function getSurvey() {
  try {
    const response = await apiAxios.get("/servicio/leanglobal/procesosSurveyDetail?id_survey=" + idSurvey.value);
    console.log(response.data);
    surveys.value = response.data;
    surveyDetailStore.surveyDetail = response.data;
    console.log("surveyDetail", surveyDetailStore.surveyDetail);
    const responseObtenerEmpresa = await apiAxios.get("/servicio/leanglobal/obtenerEmpresas?name_empresa=" + surveyDetailStore.surveyDetail[0]?.name_empresa_cliente);
    console.log(surveyDetailStore.surveyDetail[0]?.name_empresa_cliente);
    console.log("responseObtenerEmpresa", responseObtenerEmpresa.data);
    imagenEmpresa.value = responseObtenerEmpresa.data[0]?.logo_empresa;
    const responseObtenerTerracon = await apiAxios.get("/servicio/leanglobal/obtenerEmpresas?id_empresa=2");
    console.log("responseObtenerTerracon", responseObtenerTerracon.data);
    imagenEmpresaTerracon.value = responseObtenerTerracon.data[0]?.logo_empresa;

  } catch (error) {
    console.error("Error al obtener survey:", error);
    throw error;
  }
}

function getEstadoColor(estado) {
  switch (estado) {
    case 'Creado':
      return 'yellow darken-2'; // Amarillo
    case 'Ejecución':
      return 'orange darken-2'; // Naranjo
    case 'Terminado':
      return 'green darken-2'; // Verde
    case 'Retrasado':
      return 'red darken-2'; // Verde
    default:
      return 'grey';
  }
}

const getSegmentos = (survey) => {
  try {
    const body = typeof survey.body_exec === 'string'
      ? JSON.parse(survey.body_exec)
      : survey.body_exec;

    let segmentos = Array.isArray(body?.segmentos) ? body.segmentos : [];

    console.log(segmentos);

    return segmentos;
  } catch (error) {
    console.log(error);
    return [];
  }
};

function getSelectItems(options) {
  if (!options) return [];
  return options.map(opt => ({
    id: opt.id ?? opt.value,
    label: opt.label ?? opt.value,
    value: opt.value ?? opt.id
  }));
}

const guardarSurvey = () => {
  // Aquí va tu lógica real
  /*console.log('Guardando survey...');
  if (!validarCampos()) {
    alert('Por favor completa todos los campos obligatorios');
    return;
  }
  else{*/
    putSurvey(surveyDetailStore.surveyDetail[0].id_survey);
    alert('Survey Guardado Correctamente');
    console.log(surveyDetailStore.surveyDetail);
  //}
};

async function putSurvey(id_survey) {
  const formData = new FormData();

  const coordenadas = obtenerCoordenadas(surveyDetailStore.surveyDetail[0]);

  console.log(id_survey);
  console.log(JSON.stringify(surveyDetailStore.surveyDetail[0].body_exec));

  formData.append('estado_srv', 'Ejecución');
  formData.append('body_exec', JSON.stringify(surveyDetailStore.surveyDetail[0].body_exec));
  formData.append('fecha_real_ini', new Date().toISOString());

  // Si coordenadas existen, usa lat/lng, si no, manda null o vacío
  formData.append('latitud', coordenadas?.lat ?? '');
  formData.append('longitud', coordenadas?.lng ?? '');

  try {
    const response = await apiAxios.put(`/survey/${id_survey}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Survey actualizado correctamente:', response.data);
  } catch (error) {
    console.error('Error al actualizar survey:', error);
  }

}

function obtenerCoordenadas(survey) {
  const segmentos = getSegmentos(survey);
  for (const segmento of segmentos) {
    const attrGeo = (segmento.attributes || []).find(attr => attr.type === 'geoLocation');
    if (attrGeo && attrGeo.default && attrGeo.default.lat && attrGeo.default.lng) {
      return {
        lat: attrGeo.default.lat,
        lng: attrGeo.default.lng
      };
    }
  }
  return null; // No se encontró geoLocation
}

function validarCampos() {
  errores.value = {}; // limpiar errores
  let esValido = true;

  surveyDetailStore.surveyDetail.forEach((survey, idxSurvey) => {
    const segmentos = getSegmentos(survey);

    segmentos.forEach((segmento, idxSegmento) => {
      segmento.attributes?.forEach((attr, idxAttr) => {
        if (attr.nullable !== false) return;

        let valor = true;

        switch (attr.type) {
          case 'textField':
          case 'textArea':
          case 'datePicker':
          case 'dateHourPicker':
            valor = attr.default !== null && attr.default !== undefined && attr.default !== '';
            break;

          case 'comboBox':
            valor =
              attr.values?.selected !== null &&
              attr.values?.selected !== undefined &&
              attr.values?.selected !== '';
            break;

          case 'geoLocation':
            valor =
              attr.default?.lat !== null &&
              attr.default?.lng !== null &&
              attr.default?.lat !== undefined &&
              attr.default?.lng !== undefined;
            break;

          case 'photoCapture':
            valor =
              Array.isArray(attr.galeria) &&
              attr.galeria.length >= (attr.obligatorioFotos || 1);
            break;

          case 'fileUpload':
            valor =
              Array.isArray(attr.archivos) &&
              attr.archivos.length > 0;
            break;

          default:
            valor = true;
        }

        if (!valor) {
          esValido = false;
          // Guardamos el error en una estructura para saber dónde está
          if (!errores.value[`survey-${idxSurvey}`]) {
            errores.value[`survey-${idxSurvey}`] = [];
          }
          errores.value[`survey-${idxSurvey}`].push({
            segmento: idxSegmento,
            atributo: idxAttr,
            label: attr.label,
            tipo: attr.type
          });
        }
      });
    });
  });

  console.log('Errores de validación:', errores.value);
  return esValido;
}

function segmentosCompletos() {

  //console.log("segmentosCompletos");
  surveyDetailStore.surveyDetail.forEach((survey, idxSurvey) => {
    const segmentos = getSegmentos(survey);
    console.log("segmentos", segmentos);
    segmentos.forEach((segmento, idxSegmento) => {
      segmento.attributes?.forEach((attr, idxAttr) => {
        if (attr.nullable == true) return;
        console.log("segmento.type", attr.type);
        if (['textField', 'datePicker', 'dateHourPicker', 'textArea'].includes(attr.type)) {
          if (attr.default != '') {
            segmento.touch = true;
            console.log("segmento.touch", segmento.touch)
          }
          else{
            segmento.touch = false;
            console.log("segmento.touch", segmento.touch)
          }
        }
        if (['checkList'].includes(attr.type)) {
          console.log(attr.checkBoby)
          attr.checkBoby.forEach((check) => {
            if (check.nullable == true) return;
            if (check.default != '') {
              segmento.touch = true;
              console.log("segmento.touch", segmento.touch)
            }
            else{
              segmento.touch = false;
              console.log("segmento.touch", segmento.touch)
            }
          })
        }

        if (['comboBox'].includes(attr.type)) {
          console.log("segmento.type", attr.type);
          if (attr.values.selected != '') {
            segmento.touch = true;
            console.log("segmento.touch", segmento.touch)
          }
          else{
            segmento.touch = false;
            console.log("segmento.touch", segmento.touch)
          }
        }

        if (['photoCapture'].includes(attr.type)) {
          console.log(attr)
          if (attr.galeria.length >= attr.obligatorioFotos) {
            segmento.touch = true;
            console.log("segmento.touch", segmento.touch)
          }
          else{
            segmento.touch = false;
            console.log("segmento.touch", segmento.touch)
          }
        }

        if (['fileUpload'].includes(attr.type)) {
          console.log(attr)
          if (attr.archivos.length >= attr.maxArchivos) {
            segmento.touch = true;
            console.log("segmento.touch", segmento.touch)
          }
          else{
            segmento.touch = false;
            console.log("segmento.touch", segmento.touch)
          }
        }

      })
    })
  });
}

</script>
<style scoped>
.sombra-resaltada {
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3) !important;
  border-radius: 12px;
}

/* Quitar padding en el expansion panel */
/*::v-deep(.v-expansion-panel-text__wrapper) {
  padding-left: 5px !important;
  padding-top: 0px !important;
  padding-bottom: 0px !important;
  padding-right: 5px !important;
}*/
.color-red input {
  border-color: red !important;
}
.text-custom-red {
  color: #f87171 !important;
}
</style>

