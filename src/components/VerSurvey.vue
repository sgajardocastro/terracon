<template>
  <v-row class="d-flex align-center justify-center">
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
      <v-card class="px-10">
        <div class="d-flex flex-no-wrap justify-space-between align-center">
          <div>
            <v-card-title class="text-h5">
              {{ surveyDetailStore.surveyDetail[0]?.desc_template_srv ?? 'Survey Details' }}
            </v-card-title>
            <v-card-subtitle class="text-subtitle-1">
              <strong>Área:</strong> {{ surveyDetailStore.surveyDetail[0]?.name_area ?? '' }}
            </v-card-subtitle>
            <v-card-subtitle class="text-subtitle-1">
              <strong>Familia:</strong> {{ surveyDetailStore.surveyDetail[0]?.name_tipo_srv ?? '' }} ({{ surveyDetailStore.surveyDetail[0]?.codi_tipo_srv ?? '' }})
            </v-card-subtitle>
            <v-card-subtitle class="text-subtitle-1">
              <strong>{{ surveyDetailStore.surveyDetail[0]?.desc_template_srv ?? '' }}:</strong> {{ surveyDetailStore.surveyDetail[0]?.codi_template_srv ?? '' }}
            </v-card-subtitle>
            <v-card-subtitle class="text-subtitle-1">
              <strong>Nombre:</strong> {{ surveyDetailStore.surveyDetail[0]?.name_template_srv ?? '' }}
            </v-card-subtitle>
            <v-card-subtitle class="text-subtitle-1">
              <strong>Id Documento:</strong> {{ surveyDetailStore.surveyDetail[0]?.id_survey ?? '' }}
            </v-card-subtitle>
            <v-card-subtitle class="text-subtitle-1">
              <strong>{{ surveyDetailStore.surveyDetail[0]?.name_empresa_cliente ?? '' }}</strong> / {{ surveyDetailStore.surveyDetail[0]?.nombre_proyecto ?? '' }}
            </v-card-subtitle>
            <v-card-subtitle class="text-subtitle-1">
              <strong>Fechas Plan:</strong> {{ surveyDetailStore.surveyDetail[0]?.fecha_plan_ini ?? '' }} - {{ surveyDetailStore.surveyDetail[0]?.fecha_plan_fin ?? '' }}
            </v-card-subtitle>
            <v-card-subtitle class="text-subtitle-1">
              <strong>Fechas Real:</strong> {{ surveyDetailStore.surveyDetail[0]?.fecha_real_ini ?? '' }} - {{ surveyDetailStore.surveyDetail[0]?.fecha_real_fin ?? '' }}
            </v-card-subtitle>
          </div>
        </div>
      </v-card>
    </v-col>

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
      style="width: 100%;"
    >
      <v-card
        class="sombra-resaltada"
        color="#2A3C67"
        :title="segmento.label ?? `Segmento ${index + 1}`"
        style="padding: 10px;"
      />

      <v-table
        v-if="segmento.attributes?.length"
        class="elevation-1 mt-2"
        style="font-size: 18px;"
      >
        <tbody>
          <!-- 🎯 Agrupación inteligente en pares por tipo -->
          <tr
            v-for="(fila, filaIndex) in agruparPorTipoPares(segmento.attributes.filter(attr =>
              ['textField','textArea','datePicker','dateHourPicker','comboBox','fileUpload'].includes(attr.type)
            ))"
            :key="'fila-' + filaIndex"
            :class="filaIndex % 2 === 0 ? 'fila-par' : 'fila-impar'"
          >
            <!-- Renderiza cada celda del par -->
            <template
              v-for="(attr, i) in fila"
              :key="'attr-' + i"
            >
              <td style="width: 20%;">
                {{ attr.label ?? '' }}
              </td>
              <td style="width: 30%;">
                <template v-if="attr.type === 'comboBox'">
                  {{
                    getSelectItems(attr.values?.options ?? [])
                      .find(opt => opt.value === attr.values?.selected)?.label ?? ''
                  }}
                </template>
                <template v-else>
                  {{ attr.default ?? '' }}
                </template>
              </td>
            </template>

            <!-- Si es impar, completa con celdas vacías -->
            <template v-if="fila.length === 1">
              <td />
              <td />
            </template>
          </tr>

          <!-- ✅ Otros tipos especiales se quedan como antes -->

          <!-- photo -->
          <tr
            v-for="(attr, index) in segmento.attributes.filter(attr => attr.type === 'photo')"
            :key="'photo-' + index"
            :class="index % 2 === 0 ? 'fila-par' : 'fila-impar'"
          >
            <td>{{ attr.label ?? '' }}</td>
            <td colspan="3">
              <v-img
                :src="attr.src"
                max-width="150"
                aspect-ratio="16/9"
                cover
                class="mx-auto rounded"
              />
            </td>
          </tr>

          <!-- photoCheck -->
          <tr
            v-for="(attr, index) in segmento.attributes.filter(attr => attr.type === 'photoCheck')"
            :key="'photoCheck-' + index"
            :class="index % 2 === 0 ? 'fila-par' : 'fila-impar'"
          >
            <td>{{ attr.label ?? '' }}</td>
            <td>
              <v-btn-toggle
                v-model="attr.default"
                mandatory
                density="compact"
                class="mb-2"
                style="pointer-events: none; user-select: none;"
                @update:model-value="segmentosCompletos"
              >
                <v-btn
                  v-for="option in attr.options"
                  :key="option.id ?? option.value"
                  :value="option.id ?? option.value"
                  size="small"
                  class="me-2"
                >
                  {{ option.label ?? option.value }}
                </v-btn>
              </v-btn-toggle>
            </td>
            <td>
              <v-img
                v-if="attr.galeria?.[0]"
                :src="attr.galeria[0].url || attr.galeria[0].base64"
                aspect-ratio="1"
                width="80"
                cover
                class="rounded"
              />
            </td>
            <td>
              <span v-if="attr.obs">{{ attr.obs }}</span>
            </td>
          </tr>

          <!-- photoCapture -->
          <tr
            v-for="(attr, index) in segmento.attributes.filter(attr => attr.type === 'photoCapture')"
            :key="'photoCapture-' + index"
            :class="index % 2 === 0 ? 'fila-par' : 'fila-impar'"
          >
            <td>{{ attr.label ?? '' }}</td>
            <td>
              <div
                v-if="attr.galeria?.length"
                style="display: flex; gap: 4px; flex-wrap: wrap;"
              >
                <v-img
                  v-for="(image, i) in attr.galeria"
                  :key="i"
                  :src="image.url || image.base64"
                  width="60"
                  height="80"
                  class="rounded"
                />
              </div>
            </td>
            <td>{{ attr.galeria?.length ?? 0 }} foto(s)</td>
            <td>
              <span v-if="attr.obs">{{ attr.obs }}</span>
            </td>
          </tr>

          <!-- checkList -->
          <template
            v-for="(attr, aIndex) in segmento.attributes.filter(attr => attr.type === 'checkList')"
            :key="'checkList-' + aIndex"
          >
            <tr
              v-for="(item, index) in attr.checkBoby"
              :key="'checkListItem-' + index"
              :class="index % 2 === 0 ? 'fila-par' : 'fila-impar'"
            >
              <td>{{ item.label ?? '' }}</td>
              <td>
                <v-btn-toggle
                  v-model="item.default"
                  mandatory
                  density="compact"
                  class="mb-2"
                  style="pointer-events: none; user-select: none;"
                  @update:model-value="(val) => { attr.default = val; segmentosCompletos(); }"
                >
                  <v-btn
                    v-for="option in item.options"
                    :key="option.id ?? option.value"
                    :value="option.id ?? option.value"
                    size="small"
                    class="me-2"
                  >
                    {{ option.label ?? option.value }}
                  </v-btn>
                </v-btn-toggle>
              </td>
              <td colspan="2">
                <span v-if="item.obs">{{ item.obs }}</span>
              </td>
            </tr>
          </template>

          <!-- geoLocation -->
          <tr
            v-for="(attr, index) in segmento.attributes.filter(attr => attr.type === 'geoLocation')"
            :key="'geoLocation-' + index"
            :class="index % 2 === 0 ? 'fila-par' : 'fila-impar'"
          >
            <td>Latitud:</td>
            <td>{{ attr.default?.lat ?? '' }}</td>
            <td>Longitud:</td>
            <td>{{ attr.default?.lng ?? '' }}</td>
          </tr>
        </tbody>
      </v-table>
    </div>
  </div>
</template>
<script setup>
import DashboardLayout from '../layouts/dashboard.vue';
import { ref } from 'vue'
import { useSurveyDetailStore } from "@/stores/surveyDetail";
import apiAxios from '@/services/api';
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

const props = defineProps({
  Survey: {
    type: [String, Number],
    required: true
  }
})

console.log('idSurvey recibido:', props.Survey)
idSurvey.value = props.Survey;

//idSurvey.value = route.query.idInspeccion;
//console.log(idSurvey.value);

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
    const responseObtenerTerracon = await apiAxios.get("/servicio/leanglobal/obtenerEmpresas?id_empresa=1");
    console.log("responseObtenerTerracon", responseObtenerTerracon.data);
    imagenEmpresaTerracon.value = responseObtenerTerracon.data[0]?.logo_empresa;

  } catch (error) {
    console.error("Error al obtener survey:", error);
    throw error;
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

const agruparEnPares = (lista) => {
  const pares = [];
  for (let i = 0; i < lista.length; i += 2) {
    pares.push(lista.slice(i, i + 2));
  }
  return pares;
};

function agruparPorTipoPares(lista) {
  const resultado = [];
  let i = 0;

  while (i < lista.length) {
    const actual = lista[i];
    const siguiente = lista[i + 1];

    // Si siguiente existe y es del mismo tipo, agrupar
    if (siguiente && actual.type === siguiente.type) {
      resultado.push([actual, siguiente]);
      i += 2;
    } else {
      // Sino, queda solo
      resultado.push([actual]);
      i += 1;
    }
  }

  return resultado;
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

function getSelectItems(options) {
  return options.map(opt => {
    if (typeof opt === 'object') {
      return {
        label: opt.label || opt.name || opt.value || '—',
        value: opt.value || opt.id || opt.label || '—'
      }
    } else {
      return {
        label: String(opt),
        value: opt
      }
    }
  })
}

const getOptionLabel = (options, selectedId) => {
  const found = options?.find(opt => opt.id === selectedId)
  return found ? found.label : '—'
}
</script>
<style scoped>
.fila-par {
  background-color: #f0f0f0;
}
.fila-impar {
  background-color: #ffffff;
}

.left-border {
  border-left: 1px solid #ccc;
}

.right-border {
  border-right: 1px solid #ccc;
}
</style>
