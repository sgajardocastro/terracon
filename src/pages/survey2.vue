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
        <v-card class="px-10">
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
                <strong>Nombre:</strong> {{ surveyDetailStore.surveyDetail[0]?.name_template_srv }}
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
        style="width: 100%;"
      >
        <v-card
          class="sombra-resaltada"
          color="#2A3C67"
          :title="segmento.label || `Segmento ${index + 1}`"
          style="padding: 10px;"
        />

        <v-table
          v-if="segmento.attributes?.length"
          class="elevation-1 mt-2"
          style="font-size: 18px;"
        >
          <tbody>
            <template
              v-for="(attr, index) in [...segmento.attributes].sort((a, b) => (a.posicion ?? 0) - (b.posicion ?? 0))"
              :key="'attr-' + index"
            >
              <!-- textField -->
              <tr
                v-if="attr.type === 'textField'"
                :class="index % 2 === 0 ? 'fila-par' : 'fila-impar'"
              >
                <td style="width: 20%;">
                  {{ attr.label }}
                </td>
                <td colspan="3">
                  {{ attr.default || '—' }}
                </td>
              </tr>

              <!-- textArea -->
              <tr
                v-else-if="attr.type === 'textArea'"
                :class="index % 2 === 0 ? 'fila-par' : 'fila-impar'"
              >
                <td style="width: 20%;">
                  {{ attr.label }}
                </td>
                <td colspan="3">
                  {{ attr.default || '—' }}
                </td>
              </tr>

              <!-- datePicker -->
              <tr
                v-else-if="attr.type === 'datePicker'"
                :class="index % 2 === 0 ? 'fila-par' : 'fila-impar'"
              >
                <td style="width: 20%;">
                  {{ attr.label }}
                </td>
                <td colspan="3">
                  {{ attr.default || '—' }}
                </td>
              </tr>

              <!-- dateHourPicker -->
              <tr
                v-else-if="attr.type === 'dateHourPicker'"
                :class="index % 2 === 0 ? 'fila-par' : 'fila-impar'"
              >
                <td style="width: 20%;">
                  {{ attr.label }}
                </td>
                <td colspan="3">
                  {{ attr.default || '—' }}
                </td>
              </tr>

              <!-- comboBox -->
              <tr
                v-else-if="attr.type === 'comboBox'"
                :class="index % 2 === 0 ? 'fila-par' : 'fila-impar'"
              >
                <td>{{ attr.values?.quest || '' }}</td>
                <td colspan="3">
                  {{
                    getSelectItems(attr.values?.options || []).find(opt => opt.value === attr.values?.selected)?.label || '—'
                  }}
                </td>
              </tr>

              <!-- fileUpload -->
              <tr
                v-else-if="attr.type === 'fileUpload'"
                :class="index % 2 === 0 ? 'fila-par' : 'fila-impar'"
              >
                <td>{{ attr.label || 'Documento' }}</td>
                <td colspan="3">
                  <div v-if="attr.archivos?.length">
                    <div
                      v-for="(archivo, idx) in attr.archivos"
                      :key="idx"
                      class="mb-1"
                    >
                      <a
                        :href="archivo.url"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {{ archivo.name }}
                      </a>
                    </div>
                  </div>
                  <span
                    v-else
                    class="text-grey"
                  >Sin archivos</span>
                </td>
              </tr>

              <!-- photo -->
              <tr
                v-else-if="attr.type === 'photo'"
                :class="index % 2 === 0 ? 'fila-par' : 'fila-impar'"
              >
                <td>{{ attr.label }}</td>
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
                v-else-if="attr.type === 'photoCheck'"
                :class="index % 2 === 0 ? 'fila-par' : 'fila-impar'"
              >
                <td>{{ attr.label }}</td>
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
                      :key="option.id || option.value"
                      :value="option.id || option.value"
                      size="small"
                      class="me-2"
                    >
                      {{ option.label || option.value }}
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
                  <span v-else>—</span>
                </td>
                <td>{{ attr.obs || '—' }}</td>
              </tr>

              <!-- photoCapture -->
              <tr
                v-else-if="attr.type === 'photoCapture'"
                :class="index % 2 === 0 ? 'fila-par' : 'fila-impar'"
              >
                <td>{{ attr.label }}</td>
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
                  <span v-else>—</span>
                </td>
                <td>{{ attr.galeria?.length || 0 }} foto(s)</td>
                <td>{{ attr.obs || '—' }}</td>
              </tr>

              <!-- checkList -->
              <template v-else-if="attr.type === 'checkList'">
                <tr
                  v-for="(item, i) in attr.checkBoby"
                  :key="'checkListItem-' + i"
                  :class="i % 2 === 0 ? 'fila-par' : 'fila-impar'"
                >
                  <td>{{ item.label }}</td>
                  <td>
                    <v-btn-toggle
                      v-model="item.default"
                      mandatory
                      density="compact"
                      class="mb-2"
                      style="pointer-events: none; user-select: none;"
                      @update:model-value="(val) => {
                        attr.default = val;
                        segmentosCompletos();
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
                  </td>
                  <td colspan="2">
                    {{ item.obs || '—' }}
                  </td>
                </tr>
              </template>

              <!-- geoLocation -->
              <tr
                v-else-if="attr.type === 'geoLocation'"
                :class="index % 2 === 0 ? 'fila-par' : 'fila-impar'"
              >
                <td>Latitud:</td>
                <td>{{ attr.default?.lat || '—' }}</td>
                <td>Longitud:</td>
                <td>{{ attr.default?.lng || '—' }}</td>
              </tr>

              <!-- etiquetas o separadores -->
              <tr
                v-else-if="['labelLine', 'labelLineH1', 'labelLineH2', 'labelLineH3', 'labelLineH4', 'labelLineH5'].includes(attr.type)"
              >
                <td colspan="4">
                  <component
                    :is="attr.type.replace('labelLine', 'h')"
                    v-if="attr.type !== 'labelLine'"
                  >
                    {{ attr.text }}
                  </component>
                  <span v-else>{{ attr.text }}</span>
                </td>
              </tr>

              <!-- línea horizontal -->
              <tr v-else-if="attr.type === 'newLine'">
                <td colspan="4">
                  <hr>
                </td>
              </tr>
            </template>
          </tbody>
        </v-table>

        <!--v-table class="elevation-1 mt-2" v-if="segmento.attributes?.length" style="font-size: 18px;">
          <tbody>
            <tr
              v-for="(fila, filaIndex) in agruparEnPares(segmento.attributes.filter(attr => attr.type === 'textField'))"
              :key="'textField-' + filaIndex"
              :class="filaIndex % 2 === 0 ? 'fila-par' : 'fila-impar'"
            >
              <template v-for="(attr, i) in fila" :key="i">
                <td style="width: 20%; vertical-align: middle;">
                  {{ attr.label }}
                </td>
                <td style="width: 30%; text-align: center;" class="right-border">
                  {{ attr.default || '—' }}
                  {{ attr.default || '' }}
                </td>
              </template>

              <template v-if="fila.length === 1">
                <td colspan="2"></td>
              </template>
            </tr>

            <tr
              v-for="(fila, filaIndex) in agruparEnPares(segmento.attributes.filter(attr => attr.type === 'datePicker'))"
              :key="'datePicker-' + filaIndex"
              :class="filaIndex % 2 === 0 ? 'fila-par' : 'fila-impar'"
            >
              <template v-for="(attr, i) in fila" :key="i">
                <td style="width: 20%; vertical-align: middle;">
                  {{ attr.label }}
                </td>
                <td style="width: 30%; text-align: center;">
                  {{ attr.default || '' }}
                </td>
              </template>

              <template v-if="fila.length === 1">
                <td colspan="2"></td>
              </template>
            </tr>


            <tr
              v-for="(fila, filaIndex) in agruparEnPares(segmento.attributes.filter(attr => attr.type === 'dateHourPicker'))"
              :key="'dateHourPicker-' + filaIndex"
              :class="filaIndex % 2 === 0 ? 'fila-par' : 'fila-impar'"
            >
              <template v-for="(attr, i) in fila" :key="i">
                <td style="width: 20%; vertical-align: middle;">
                  {{ attr.label }}
                </td>
                <td style="width: 30%; text-align: center;">
                  {{ attr.default || '' }}
                </td>
              </template>

              <template v-if="fila.length === 1">
                <td colspan="2"></td>
              </template>
            </tr>

            <template
              v-for="(attr, aIndex) in segmento.attributes.filter(attr => attr.type === 'checkList')"
              :key="'checkList-' + aIndex"
            >
              <tr
                v-for="(item, index) in attr.checkBoby"
                :key="item.id"
                :class="index % 2 === 0 ? 'fila-par' : 'fila-impar'"
              >
                <td>{{ item.label }}</td>
                <td>
                  <v-btn-toggle
                    v-model="item.default"
                    mandatory
                    density="compact"
                    class="mb-2"
                    @update:model-value="(val) => {
                      attr.default = val;
                      segmentosCompletos();
                    }"
                    style="pointer-events: none; user-select: none;"
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
                </td>
                <td colspan="2">
                  <span v-if="item.obs !== undefined">{{ item.obs }}</span>
                </td>
              </tr>
            </template>

            <tr
              v-for="(fila, filaIndex) in agruparEnPares(segmento.attributes.filter(attr => attr.type === 'comboBox'))"
              :key="'comboBox-' + filaIndex"
              :class="filaIndex % 2 === 0 ? 'fila-par' : 'fila-impar'"
            >
              <template v-for="(attr, i) in fila" :key="i">
                <td>{{ attr.values?.quest || '' }}</td>
                <td>
                  {{
                    getSelectItems(attr.values?.options || []).find(opt => opt.value === attr.values?.selected)?.label || ''
                  }}
                </td>
              </template>
            </tr>

            <tr
              v-for="(fila, filaIndex) in agruparEnPares(segmento.attributes.filter(attr => attr.type === 'textArea'))"
              :key="'textArea-' + filaIndex"
              :class="filaIndex % 2 === 0 ? 'fila-par' : 'fila-impar'"
            >
              <template v-for="(attr, i) in fila" :key="i">
                <td style="width: 20%; vertical-align: middle;">
                  {{ attr.label }}
                </td>
                <td style="width: 30%; text-align: center;">
                  {{ attr.default || '—' }}
                </td>
              </template>

              <template v-if="fila.length === 1">
                <td colspan="2"></td>
              </template>
            </tr>

            <tr
              v-for="(fila, filaIndex) in agruparEnPares(segmento.attributes.filter(attr => attr.type === 'photo'))"
              :key="'photo-' + filaIndex"
              :class="filaIndex % 2 === 0 ? 'fila-par' : 'fila-impar'"
            >
              <template v-for="(attr, i) in fila" :key="i">
                <td style="width: 20%; vertical-align: middle;">{{ attr.label || '' }}</td>
                <td style="width: 30%; text-align: center;">
                  <v-img
                    :src="attr.src"
                    max-width="150"
                    aspect-ratio="16/9"
                    cover
                    class="mx-auto rounded"
                  />
                </td>
              </template>


              <template v-if="fila.length === 1">
                <td colspan="2"></td>
              </template>
            </tr>

            <tr
              v-for="(attr, index) in segmento.attributes.filter(attr => attr.type === 'geoLocation')"
              :key="'geoLocation-' + index"
              :class="index % 2 === 0 ? 'fila-par' : 'fila-impar'"
            >
              <td>Latitud:</td>
              <td class="right-border">{{ attr.default?.lat || '—' }}</td>
              <td>Longitud:</td>
              <td>{{ attr.default?.lng || '—' }}</td>
            </tr>

            <tr
              v-for="(fila, filaIndex) in agruparEnPares(segmento.attributes.filter(attr => attr.type === 'fileUpload'))"
              :key="'fileUpload-' + filaIndex"
              :class="filaIndex % 2 === 0 ? 'fila-par' : 'fila-impar'"
            >
              <template v-for="(attr, i) in fila" :key="i">
                <td>
                  {{ attr.label || 'Documento' }}
                </td>
                <td class="right-border">
                  <div v-if="attr.archivos?.length">
                    <div
                      v-for="(archivo, index) in attr.archivos"
                      :key="index"
                      class="mb-1"
                    >
                      <a
                        :href="archivo.url"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {{ archivo.name }}
                      </a>
                    </div>
                  </div>
                  <span v-else class="text-grey">Sin archivos</span>
                </td>
              </template>

              <template v-if="fila.length === 1">
                <td colspan="2"></td>
              </template>
            </tr>

            <tr
              v-for="(attr, index) in segmento.attributes.filter(attr => attr.type === 'photoCheck')"
              :key="'photoCheck-' + index"
              :class="index % 2 === 0 ? 'fila-par' : 'fila-impar'"
            >

              <td style="width: 20%; vertical-align: middle;">
                {{ attr.label }}
              </td>

              <td style="width: 30%;">
                <v-btn-toggle
                  v-model="attr.default"
                  mandatory
                  density="compact"
                  class="mb-2"
                  @update:model-value="segmentosCompletos"
                  style="pointer-events: none; user-select: none;"
                >
                  <v-btn
                    v-for="option in attr.options"
                    :key="option.id || option.value"
                    :value="option.id || option.value"
                    size="small"
                    class="me-2"
                  >
                    {{ option.label || option.value }}
                  </v-btn>
                </v-btn-toggle>
              </td>

              <td style="width: 25%; text-align: center;">
                <v-img
                  v-if="attr.galeria?.[0]"
                  :src="attr.galeria[0].url || attr.galeria[0].base64"
                  aspect-ratio="1"
                  width="80"
                  cover
                  class="rounded"
                />
                <span v-else>—</span>
              </td>

              <td style="width: 25%;">
                <span v-if="attr.obs">{{ attr.obs }}</span>
                <span v-else>—</span>
              </td>
            </tr>


            <tr
              v-for="(attr, index) in segmento.attributes.filter(attr => attr.type === 'photoCapture')"
              :key="'photoCapture-' + index"
              :class="index % 2 === 0 ? 'fila-par' : 'fila-impar'"
            >

              <td>{{ attr.label }}</td>

              <td>
                <div v-if="attr.galeria?.length" style="display: flex; gap: 4px; flex-wrap: wrap;">
                  <v-img
                    v-for="(image, i) in attr.galeria"
                    :key="i"
                    :src="image.url || image.base64"
                    width="60"
                    height="500"

                    class="rounded"
                  />
                </div>
                <span v-else>—</span>
              </td>

              <td>
                {{ attr.galeria?.length || 0 }} foto(s)
              </td>

              <td>
                <span v-if="attr.obs">{{ attr.obs }}</span>
                <span v-else>—</span>
              </td>
            </tr>

            <tr
              v-for="(attr, index) in segmento.attributes.filter(attr =>
                ['newLine', 'labelLine', 'labelLineH1', 'labelLineH2', 'labelLineH3', 'labelLineH4', 'labelLineH5'].includes(attr.type)
              )"
              :key="'label-line-' + index"
            >
              <td colspan="4">
                <template v-if="attr.type === 'newLine'">
                  <hr />
                </template>
                <template v-else-if="attr.type === 'labelLine'">
                  <span>{{ attr.text }}</span>
                </template>
                <template v-else-if="attr.type === 'labelLineH1'">
                  <h1>{{ attr.text }}</h1>
                </template>
                <template v-else-if="attr.type === 'labelLineH2'">
                  <h2>{{ attr.text }}</h2>
                </template>
                <template v-else-if="attr.type === 'labelLineH3'">
                  <h3>{{ attr.text }}</h3>
                </template>
                <template v-else-if="attr.type === 'labelLineH4'">
                  <h4>{{ attr.text }}</h4>
                </template>
                <template v-else-if="attr.type === 'labelLineH5'">
                  <h5>{{ attr.text }}</h5>
                </template>
              </td>
            </tr>
          </tbody>
        </v-table-->
      </div>
    </div>
  </DashboardLayout>
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

idSurvey.value = route.query.idInspeccion;

console.log(idSurvey.value);

const surveys = ref(null);

onMounted(async () => {
  await getSurvey();
  segmentosCompletos();
  //exportarInspeccion(idSurvey.value);
});

const exportarInspeccion = async (idInspeccion) => {
  try {
    const response = await apiAxios.post(
      `/exportar?idInspeccion=${idInspeccion}`
    );

    console.log('✅ Exportación exitosa:', response.data);
    // Podrías mostrar al usuario:
    alert(`PDF generado: ${response.data.archivo}`);
  } catch (error) {
    console.error('❌ Error al exportar:', error.response?.data || error.message);
    alert('Error al exportar');
  }
};

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
