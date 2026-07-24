<template>
  <v-container style="padding-bottom: 80px;">
    <v-row dense>
      <!-- Botón para volver a la lista -->
      <v-btn
        variant="text"
        prepend-icon="mdi-arrow-left"
        @click="emit('close')"
      >
        Volver a Surveys
      </v-btn>
      <br>
      <v-col
        v-for="survey in surveyDetailStore.surveyDetail"
        :key="survey.id_survey"
        cols="12"
      >
        <!-- Panel principal del documento -->
        <v-expansion-panels multiple>
          <v-expansion-panel class="sombra-resaltada">
            <v-expansion-panel-title color="#2A3C67">
              <div class="d-flex align-center justify-space-between w-100">
                <div class="text-subtitle-1 font-weight-bold">
                  {{ survey.desc_template_srv }}
                </div>

                <v-icon
                  :color="getEstadoColor(survey.estado_srv)"
                  icon="mdi-circle"
                />
              </div>
            </v-expansion-panel-title>

            <v-expansion-panel-text>
              <!-- Info general del survey -->
              <v-row dense>
                <v-col cols="12">
                  <strong>Área:</strong> {{ survey.name_area }}<br>
                  <strong>Familia:</strong> {{ survey.name_tipo_srv }} ({{ survey.codi_tipo_srv }})<br>
                  <strong>{{ survey.desc_template_srv }}:</strong> {{ survey.name_template_srv }}<br>
                  <strong>Código:</strong> {{ survey.codi_template_srv }}<br>
                  <strong>Id Documento:</strong> {{ survey.id_survey }}<br>
                  <strong>{{ survey.name_empresa_cliente }}</strong> / {{ survey.nombre_proyecto }}<br>
                  <strong>Fechas Plan:</strong> {{ survey.fecha_plan_ini }} - {{ survey.fecha_plan_fin }}<br>
                  <strong>Fechas Real:</strong> {{ survey.fecha_real_ini ?? '---' }} - {{ survey.fecha_real_fin ?? '---'
                  }}
                </v-col>
              </v-row>

              <!-- Paneles por segmento -->
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
        <br>
        <v-expansion-panels multiple>
          <v-expansion-panel
            v-for="(segmento, index) in getSegmentos(survey)"
            :key="segmento.posicion ?? index"
            class="mb-5"
          >
            <v-expansion-panel-title
              class="font-weight-bold"
              style="background-color: #CCD7DD; font-size: 16px;"
            >
              <template v-if="segmento.touch">
                <!-- Cuando touch es TRUE -->
                <v-icon
                  style="color: #107B13;"
                  icon="mdi-check-circle"
                  class="mr-2"
                />
              </template>
              <template v-if="segmento.touch == false">
                <!-- Cuando touch es FALSE -->
                <v-icon
                  style="color: #E4430D;"
                  icon="mdi-check-circle"
                  class="mr-2"
                />
              </template>
              {{ segmento.label || `Segmento ${index + 1}` }}
            </v-expansion-panel-title>

            <v-expansion-panel-text style="background-color: #CFD8DD;">
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

                  <div v-if="attr.type === 'number'">
                    <v-text-field
                      v-model="attr.default"
                      variant="outlined"
                      :label="attr.label"
                      dense
                      hide-details
                      density="compact"
                      type="number"
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
                              :items="getSelectItems(attr.values.options, attr, survey)"
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
                            >
                              <template #selection="{ item }">
                                <span :class="['estado-select-label', getEstadoOptionClass(getEstadoItemValue(item))]">
                                  {{ getEstadoItemLabel(item) }}
                                </span>
                              </template>
                              <template #item="{ props, item }">
                                <v-list-item
                                  v-bind="props"
                                  :class="getEstadoItemClass(item, attr, survey)"
                                />
                              </template>
                            </v-select>
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

                  <div
                    v-else-if="attr.type === 'qr'"
                    style="padding-top: 5px;"
                  >
                    <LeerQr />
                  </div>

                  <MatrizEditable
                    v-else-if="attr.type === 'matriz'"
                    :attr="attr"
                  />

                  <MatrizExcavaciones
                    v-else-if="attr.type === 'matrizExcavaciones'"
                    :attr="attr"
                  />

                  <MatrizBorewrap
                    v-else-if="attr.type === 'matrizBorewrap'"
                    :attr="attr"
                  />

                  <MatrizTransp
                    v-else-if="attr.type === 'matrizTransp'"
                    :attr="attr"
                  />

                  <MatrizGranallado
                    v-else-if="attr.type === 'matrizGranallado'"
                    :attr="attr"
                  />

                  <MatrizProtal
                    v-else-if="attr.type === 'matrizProtal'"
                    :attr="attr"
                  />

                  <MatrizPolypipe
                    v-else-if="attr.type === 'matrizPolypipe'"
                    :attr="attr"
                  />

                  <MatrizSoldadura
                    v-else-if="attr.type === 'matrizSoldadura'"
                    :attr="attr"
                  />

                  <MatrizCheck
                    v-else-if="attr.type === 'matrizCheck'"
                    :attr="attr"
                  />

                  <AsignarEquipo
                    v-else-if="attr.type === 'asignarEquipo'"
                    :attr="attr"
                  />


                  <EstructuraMultiple
                    v-else-if="attr.type === 'resgistroAdd'"
                    :attr="attr"
                  />

                  <div
                    v-else-if="attr.type === 'registroEventos'"
                    class="registro-eventos"
                  >
                    <div class="d-flex align-center justify-space-between mb-3">
                      <div class="font-weight-bold">
                        {{ attr.label || 'Eventos' }}
                      </div>
                      <v-btn
                        size="small"
                        color="primary"
                        variant="outlined"
                        prepend-icon="mdi-plus"
                        @click="agregarEventoRegistro(attr)"
                      >
                        Agregar evento
                      </v-btn>
                    </div>

                    <v-card
                      v-for="(evento, evIdx) in getRegistroEventos(attr)"
                      :key="`registro-evento-${evIdx}`"
                      variant="outlined"
                      class="mb-3"
                    >
                      <v-card-title class="d-flex align-center justify-space-between py-2">
                        <span class="text-subtitle-2 font-weight-bold">
                          Evento {{ evIdx + 1 }}
                        </span>
                        <v-btn
                          size="small"
                          variant="text"
                          color="error"
                          icon="mdi-delete"
                          @click="eliminarEventoRegistro(attr, evIdx)"
                        />
                      </v-card-title>
                      <v-card-text>
                        <v-text-field
                          v-model="evento.comentarioInicial"
                          label="Comentario inicial"
                          density="compact"
                          variant="outlined"
                          hide-details
                          class="bg-white mb-2"
                          @update:model-value="segmentosCompletos"
                        />
                        <v-text-field
                          v-model="evento.hora"
                          label="Hora"
                          density="compact"
                          variant="outlined"
                          hide-details
                          class="bg-white mb-2"
                          @update:model-value="segmentosCompletos"
                        />
                        <v-textarea
                          v-model="evento.observaciones"
                          label="Observaciones"
                          rows="2"
                          auto-grow
                          density="compact"
                          variant="outlined"
                          hide-details
                          class="bg-white mb-2"
                          @update:model-value="segmentosCompletos"
                        />
                        <FotoCapture
                          v-model:galeria="evento.galeria"
                          v-model:observacion="evento.comentarioFotos"
                          :max-fotos="10"
                          :obligatorio-fotos="0"
                          :compression="0.25"
                          @update:galeria="segmentosCompletos"
                          @update:observacion="segmentosCompletos"
                        />
                      </v-card-text>
                    </v-card>

                    <div
                      v-if="!getRegistroEventos(attr).length"
                      class="text-caption text-medium-emphasis"
                    >
                      Sin eventos aún.
                    </div>
                  </div>

                  <div v-else>
                    <em>Tipo {{ attr.type }} no implementado</em>
                    <em>{{ attr }}</em>
                  </div>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <!-- DIALOG: usa tu JSON attr.dialog -->
        <v-dialog
          v-model="dialogAgregar.open"
          max-width="520"
        >
          <v-card>
            <v-card-title class="text-h6">
              {{ dialogAgregar.title }}
            </v-card-title>

            <v-card-text>
              <v-row dense>
                <v-col
                  v-for="(input, iIdx) in dialogAgregar.inputs"
                  :key="'dlg-inp-' + iIdx"
                  cols="12"
                >
                  <v-text-field
                    v-model="input.value"
                    :label="input.label"
                    density="compact"
                    variant="underlined"
                    hide-details
                    @keyup.enter="confirmAgregarFila"
                  />
                </v-col>
              </v-row>
            </v-card-text>

            <v-card-actions class="justify-end">
              <v-btn
                variant="text"
                @click="cancelAgregarFila"
              >
                Cancelar
              </v-btn>
              <v-btn
                color="primary"
                @click="confirmAgregarFila"
              >
                Aceptar
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-btn
          color="#2A3C67"
          style="box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.3);"
          size="large"
          class="w-100"
          @click="guardarSurvey"
        >
          <v-icon left>
            mdi-content-save
          </v-icon>
          Guardar Survey
        </v-btn>
      </v-col>
      <v-col>
        <v-btn
          color="#2A3C67"
          style="box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.3);"
          size="large"
          class="w-100"
          @click="confirmarTerminarSurvey"
        >
          <v-icon left>
            mdi-content-save
          </v-icon>
          Aprobar Survey
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
  <v-dialog
    v-model="dialogConfirmarTerminar"
    width="400"
  >
    <v-card>
      <v-card-title class="text-h6">
        Confirmar
      </v-card-title>
      <v-card-text>
        ¿Estás seguro de que quieres terminar este survey? Esta acción no se puede deshacer.
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn
          text
          @click="dialogConfirmarTerminar = false"
        >
          Cancelar
        </v-btn>
        <v-btn
          color="primary"
          @click="handleTerminarSurvey"
        >
          Confirmar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <!-- Dialogo de carga con spinner -->
  <!--v-dialog v-model="dialogLoading" persistent width="300">
      <v-card>
        <v-card-text>
          <v-row align="center" justify="center">
            <v-progress-circular indeterminate size="60" />
            <span class="ml-3">Procesando...</span>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog-->
  <v-dialog
    v-model="dialogLoading"
    persistent
    width="300"
  >
    <v-card
      color="primary"
      dark
    >
      <v-card-text class="text-center">
        <v-progress-circular
          indeterminate
          color="white"
          class="mb-4"
        />
        <div>Procesando...</div>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Dialogo de resultado -->
  <v-dialog
    v-model="dialogResultado"
    width="400"
  >
    <v-card>
      <v-card-title class="text-h6">
        Survey Aprobado
      </v-card-title>
      <v-card-text>
        Survey aprobado correctamente.
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn
          color="primary"
          @click="handleResultadoAceptar"
        >
          Aceptar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup>
import { useRoute, useRouter } from "vue-router";
import { reactive, ref, onMounted, watch } from 'vue';
import apiAxios from '@/services/api';
import FotoCapture from '@/components/inspeccion/FotoCapture.vue'
import FotoCeck from '@/components/inspeccion/FotoCheck.vue'
import GeoLocation from "@/components/inspeccion/GeoLocation.vue";
import FileUpload from "@/components/inspeccion/FileUpload.vue";
import LeerQr from "@/components/inspeccion/LeerQr.vue";
import MatrizEditable from '@/components/inspeccion/MatrizEditable.vue'
import MatrizExcavaciones from "@/components/inspeccion/MatrizExcavaciones.vue";
import MatrizBorewrap from "@/components/inspeccion/MatrizBorewrap.vue";
import MatrizTransp from "@/components/inspeccion/MatrizTransp.vue";
import MatrizGranallado from "@/components/inspeccion/MatrizGranallado.vue";
import MatrizProtal from "@/components/inspeccion/MatrizProtal.vue";
import MatrizCheck from '@/components/inspeccion/MatrizCheck.vue';
import MatrizPolypipe from '@/components/inspeccion/MatrizPolypipe.vue';
import MatrizSoldadura from '@/components/inspeccion/MatrizSoldadura.vue';
import AsignarEquipo from '@/components/inspeccion/AsignarEquipo.vue';
import EstructuraMultiple from '@/components/inspeccion/EstructuraMultiple.vue';

import { DateTime } from 'luxon';
import { usePersistenciaStore } from '@/stores/persistencia'
import { useSurveyDetailStore } from "@/stores/surveyDetail";
import { useUserDetailStore } from "@/stores/userDetail";

const props = defineProps({
  idInspeccion: {
    type: [String, Number],
    required: true
  }
})

const userDetailStore = useUserDetailStore()
console.log("userDetailStore.userDetail", userDetailStore.userDetail.id_user);

const persistencia = usePersistenciaStore()
const surveyDetailStore = useSurveyDetailStore()


// Puedes leer el valor
console.log(persistencia.id)
const router = useRouter();
const route = useRoute();
const idSurvey = ref(null);
const show = ref(false);
const errores = ref({});

idSurvey.value = props.idInspeccion;

console.log(idSurvey.value);

const surveys = ref(null);

const dialogConfirmarTerminar = ref(false);
const dialogLoading = ref(false);
const dialogResultado = ref(false);



const emit = defineEmits(['close'])

async function cargarInspeccion(id) {
  try {
    // Llama tu API con el id
    // const { data } = await apiAxios.get(`/api/inspeccion?id=${id}`)
    // ...
  } catch (e) {
    console.error('Error cargando inspección', e)
  }
}

onMounted(() => cargarInspeccion(props.idInspeccion))

watch(() => props.idInspeccion, (nuevo) => {
  if (nuevo) cargarInspeccion(nuevo)
})

const rows = ref([
  { nro: 1, pk: '10', prof: 2, anchoSello: 1.2, anchoSup: 1.5, cotaSello: 'A' },
  { nro: 2, pk: '12', prof: 2.5, anchoSello: 1.3, anchoSup: 1.6, cotaSello: 'B' },
])

// Guarda el attr actual que abrió el diálogo para saber dónde agregar la fila
const currentAttrRef = ref(null)

// Estado del diálogo “Agregar fila”
const dialogAgregar = reactive({
  open: false,
  title: 'Agregar fila',
  inputs: []  // [{label:'', value:''}, ...]
})

// Construye el estado del diálogo desde attr.dialog[0]
function makeDialogStateFromAttr(attr) {
  const dlg = (attr?.dialog && attr.dialog[0]) ? attr.dialog[0] : { title: 'Agregar fila', inputs: [] }
  return {
    title: dlg.title || 'Agregar fila',
    inputs: (dlg.inputs || []).map(inp => ({ label: inp.label ?? '', value: inp.value ?? '' }))
  }
}

function openAgregarFila(attr) {
  currentAttrRef.value = attr
  const fresh = makeDialogStateFromAttr(attr)
  dialogAgregar.title = fresh.title
  dialogAgregar.inputs = fresh.inputs
  dialogAgregar.open = true
}

function cancelAgregarFila() {
  dialogAgregar.open = false
  currentAttrRef.value = null
}

function confirmAgregarFila() {
  const attr = currentAttrRef.value
  if (!attr) { dialogAgregar.open = false; return }

  if (!Array.isArray(attr.body)) attr.body = []

  // Cada input -> una celda { value }
  const nuevaFila = dialogAgregar.inputs.map(inp => ({ value: inp.value }))
  attr.body.push(nuevaFila)

  dialogAgregar.open = false
  currentAttrRef.value = null

  // Recalcular al tiro
  recalcular(attr)
}
/*function confirmAgregarFila() {
  const attr = currentAttrRef.value;
  if (!attr) return;

  const cols = getMatrixColumnCount(attr);
  // Partimos los inputs en filas del tamaño de columnas de la matriz
  const filas = chunk(dialogAgregar.inputs, cols);

  // Transformamos a formato de body ([[{value},{value},...], ...])
  const newRows = filas.map(rowInputs =>
    rowInputs.map(inp => ({ value: (inp?.value ?? '') }))
  );

  if (attr.actualizar) {
    // REEMPLAZA COMPLETO
    attr.body = JSON.parse(JSON.stringify(newRows));
  } else {
    // AGREGA AL FINAL
    const curr = Array.isArray(attr.body) ? attr.body : [];
    attr.body = [...curr, ...JSON.parse(JSON.stringify(newRows))];
    recalcular(attr);
  }

  dialogAgregar.open = false;
}*/

// Clon seguro y simple
function deepClone(obj) {
  return obj ? JSON.parse(JSON.stringify(obj)) : obj;
}

// Prepara un borrador editable con misma forma MxN
function ensureDraftForAttr(attr) {
  const body = Array.isArray(attr.body) ? attr.body : [];
  attr.__draftBody = body.map(row =>
    (Array.isArray(row) ? row : []).map(cell => ({
      ...cell,           // ← conserva type, editable, etc.
      value: cell?.value ?? ''
    }))
  );
  if (attr.__draftBody.length === 0) {
    attr.__draftBody = [[{ value: '', type: 'text', editable: true }]];
  }
}

function promedioDesdeBodyCol(attr, colIndex) {
  const rows = Array.isArray(attr?.body) ? attr.body : []
  const nums = rows
    .map(r => Number(r?.[colIndex]?.value ?? NaN))
    .filter(v => !Number.isNaN(v))
  if (!nums.length) return ''
  const avg = nums.reduce((s, n) => s + n, 0) / nums.length
  return Number.isFinite(avg) ? Number(avg.toFixed(2)) : ''
}

function recalcular(attr) {
  const footer = Array.isArray(attr?.footer) ? attr.footer : []
  for (const row of footer) {
    const promCells = row.filter(c => c?.cal === 'prom')
    if (promCells.length >= 1) {
      // Layout: 0:N°, 1:PK, 2:a, 3:b, 4:c, 5:cota
      if (promCells[0]) promCells[0].value = promedioDesdeBodyCol(attr, 2) // a
      if (promCells[1]) promCells[1].value = promedioDesdeBodyCol(attr, 3) // b
      if (promCells[2]) promCells[2].value = promedioDesdeBodyCol(attr, 4) // c
      if (promCells[3]) promCells[3].value = promedioDesdeBodyCol(attr, 5) // cota
      break
    }
  }
}




const eliminarFila = (index) => {
  rows.value.splice(index, 1)
  actualizarNumeros()
}

const agregarFila = () => {
  rows.value.push({
    nro: rows.value.length + 1,
    pk: '',
    prof: '',
    anchoSello: '',
    anchoSup: '',
    cotaSello: ''
  })
}

const actualizarNumeros = () => {
  rows.value.forEach((fila, index) => {
    fila.nro = index + 1
  })
}

function acceptInlineUpdate(attr) {
  attr.body = deepClone(attr.__draftBody);
  attr.__editing = false;
  delete attr.__draftBody;
  recomputeAndPersistMCheck(attr); // <-- persiste al guardar
}

onMounted(async () => {
  await getSurvey();
  // Inicializa métricas para todas las matrices check que existan
  surveyDetailStore.surveyDetail.forEach(srv => {
    const segs = getSegmentos(srv);
    segs.forEach(seg => (seg.attributes || [])
      .filter(a => a.type === 'matrizCheck')
      .forEach(a => recomputeAndPersistMCheck(a)));
  });
  segmentosCompletos();
});

// Si el diálogo de resultado se cierra de cualquier forma, navega igual
watch(dialogResultado, (newVal) => {
  if (!newVal) {
    //router.push({ path: '/censo' });
    emit('close')
  }
});

async function getSurvey() {
  try {
    const response = await apiAxios.get("/servicio/leanglobal/procesosSurveyDetail?id_survey=" + idSurvey.value);
    console.log(response.data);
    surveys.value = response.data;
    surveyDetailStore.surveyDetail = response.data;
    console.log("surveyDetail", surveyDetailStore.surveyDetail);


  } catch (error) {
    console.error("Error al obtener survey:", error);
    throw error;
  }
}

function getEstadoColor(estado) {
  const colorConexion = getEstadoConexionColor(estado);
  if (colorConexion) return colorConexion;

  switch (estado) {
    case 'Creado':
      return 'yellow darken-2'; // Amarillo
    case 'Terminado':
      return 'green darken-2'; // Verde
    case 'Retrasado':
      return 'red darken-2'; // Verde
    default:
      return 'grey';
  }
}

const getSegmentos = (survey) => {
  console.log(survey);
  try {
    const body = typeof survey.body_exec === 'string'
      ? JSON.parse(survey.body_exec)
      : survey.body_exec;

    if (body && typeof body === 'object') {
      survey.body_exec = body;
      ensureAntecedentesComplementariosSegment(survey, body);
    }

    let segmentos = Array.isArray(body?.segmentos) ? body.segmentos : [];

    /*if (!segmentos.some(s => s.label === 'Bloque 6')) {
      segmentos.push({
        posicion: 6,
        label: "Bloque 6",
        collapsible: false,
        touch: true,
        cantidad: 3,
        attributes: [
          {
            type: "qr",
            nullable: true,
          }
        ]
      })
    }*/
    /*if (!segmentos.some(s => s.label === 'Bloque 6')) {
      segmentos.push({
        posicion: 6,
        label: "Bloque 6",
        collapsible: false,
        touch: true,
        cantidad: 3,
        attributes: [
          {
            text: "Texto de prueba",
            type: "labelLine",
            nullable: true,
          },
          {
            text: "Texto de prueba H1",
            type: "labelLineH1",
            nullable: true,
          },
          {
            text: "Texto de prueba H2",
            type: "labelLineH2",
            nullable: true,
          },
          {
            text: "Texto de prueba H3",
            type: "labelLineH3",
            nullable: true,
          },
          {
            text: "Texto de prueba H4",
            type: "labelLineH4",
            nullable: true,
          },
          {
            text: "Texto de prueba H5",
            type: "labelLineH5",
            nullable: true,
          }
        ]
      });
    }

    if (!segmentos.some(s => s.label === 'Bloque 7')) {
      segmentos.push({
        posicion: 7,
        label: "Bloque 7",
        collapsible: false,
        touch: true,
        cantidad: 3,
        attributes: [{
          type: 'photoCheck',
          posicion: 1,
          label: 'Uso excavadora nivelación camino',
          default: '',
          options: [
            { id: 'si', label: 'Sí' },
            { id: 'no', label: 'No' },
            { id: 'n/a', label: 'N/A' },
          ],
          nullable: false,
          galeria: [],
          compression: 10,
          obs: ''
        },
        {
          type: 'photoCheck',
          posicion: 1,
          label: 'Uso excavadora nivelación camino',
          default: '',
          options: [
            { id: 'si', label: 'Sí' },
            { id: 'no', label: 'No' },
            { id: 'n/a', label: 'N/A' },
          ],
          nullable: false,
          galeria: [],
          compression: 10,
        },
        {
          type: 'photoCheck',
          posicion: 1,
          label: 'Uso excavadora nivelación camino',
          default: '',
          options: [
            { id: 'si', label: 'Sí' },
            { id: 'no', label: 'No' },
            { id: 'n/a', label: 'N/A' },
          ],
          nullable: false,
        },
        ]
      });
    }*/

    /*if (!segmentos.some(s => s.label === 'Bloque 15')) {
       segmentos.push({
        posicion: 12,
        label: 'Bloque 15',
        touch: true,
        posicion: '15',
        collapsible: false,
        attributes: [{
          type: 'photo',
          label: 'Layout Planta Carguío',
          src: '/archivo/adc172bd-fb2a-4f6e-9ca3-1749adb8ebe7.png',
        }]
      });
    }*/
    /*
    if (!segmentos.some(s => s.label === 'Bloque XX')) {
       segmentos.push({
        posicion: 13,
        label: 'Bloque XX',
        touch: true,
        posicion: '16',
        collapsible: false,
        attributes: [{
          type: 'matriz',
          label: 'Tabla Multi Nivel',
          headers:
          [
            [
              {
                label: 'N°',
                rowspan: 2,
              },
              {
                label: 'PK (Km)',
                rowspan: 2,
              },
              {
                label: 'PROFUNDID.'
              },
              {
                label: 'ANCHO SELLO'
              },
              {
                label: 'ANCHO SUP.'
              },
              {
                label: 'COTA SELLO',
                rowspan: 2,
              },
            ],
            [
              {
                label: 'a'
              },
              {
                label: 'b'
              },
              {
                label: 'c'
              },
            ]
          ],
          body: [
            [
              {
                value: '1'
              },
              {
                value: '2'
              },
              {
                value: '3'
              },
              {
                value: '4'
              },
              {
                value: '5'
              },
              {
                value: '6'
              },
            ],
            [
              {
                value: '1'
              },
              {
                value: '2'
              },
              {
                value: '3'
              },
              {
                value: '4'
              },
              {
                value: '5'
              },
              {
                value: '6'
              },
            ]
          ],
          footer: [
            [
              {
                label: 'PROMEDIOS (m)',
                colspan: 2
              },
              {
                cal: 'prom',
                value:''
              },
              {
                cal: 'prom',
                value:''
              },
              {
                cal: 'prom',
                value:''
              },
              {
                cal: 'prom',
                value:''
              }
            ],
            [
              {
                label: 'VOLÚMEN DE EXCAVACIÓN (M3)',
                rowspan: 2,
                colspan: 2,
              },
              {
                value:''
              }
            ]
          ],
          dialog: [
            {
              title: 'Detalles de la Tabla',
              inputs: [
                {
                  label: 'N°',
                  value: '',
                },
                {
                  label: 'PK (Km)',
                  value: '',
                },
                {
                  label: 'PROFUNDID.',
                  value: '',
                },
                {
                  label: 'ANCHO SELLO',
                  value: '',
                },
                {
                  label: 'ANCHO SUP.',
                  value: '',
                },
                {
                  label: 'COTA SELLO',
                  value: '',
                }
              ]
            }
          ]
        }]
      });
    }

    if (!segmentos.some(s => s.label === 'Bloque XXX')) {
       segmentos.push({
        posicion: 14,
        label: 'Bloque XXX',
        touch: true,
        posicion: '16',
        collapsible: false,
        attributes: [{
          type: 'matriz',
          label: 'Tabla Multi Nivel',
          headers:
          [
            [
              {
                label: 'N°'
              },
              {
                label: 'PK'
              },
              {
                label: 'Ancho sup.'
              },
              {
                label: 'Ancho inf.'
              },
              {
                label: 'Profundidad'
              },
              {
                label: 'Profundidad'
              },
              {
                label: 'Largo'
              },
              {
                label: 'Acumulado'
              },
              {
                label: 'Volumen'
              },
            ]
          ],
          body: [
            [
              {
                value: '1'
              },
              {
                value: '2'
              },
              {
                value: '3'
              },
              {
                value: '4'
              },
              {
                value: '5'
              },
              {
                value: '6'
              },
              {
                value: '7'
              },
              {
                value: '8'
              },
              {
                value: '9'
              },
            ]
          ],
          dialog: [
            {
              title: 'Detalles de la Tabla',
              inputs: [
                {
                  label: 'N°',
                  value: '',
                },
                {
                  label: 'PK',
                  value: ''
                },
                {
                  label: 'Ancho sup.',
                  value: ''
                },
                {
                  label: 'Ancho inf.',
                  value: ''
                },
                {
                  label: 'Profundidad',
                  value: ''
                },
                {
                  label: 'Profundidad',
                  value: ''
                },
                {
                  label: 'Largo',
                  value: ''
                },
                {
                  label: 'Acumulado',
                  value: ''
                },
                {
                  label: 'Volumen',
                  value: ''
                },
              ]
            }
          ]
        }]
      });
    }
    if (!segmentos.some(s => s.label === 'Bloque XXXX')) {
       segmentos.push({
        "posicion": 20,
        "label": "Bloque XXXX",
        "touch": true,
        "collapsible": false,
        "attributes": [
          {
            "type": "matriz",
            "label": "Bloque XXXX",
            "headers": [
              [
                { "label": "" },
                { "label": "ELABORA" },
                { "label": "REVISÓ" },
                { "label": "APROBÓ" },
                { "label": "APROBÓ" }
              ]
            ],
            "body": [
              [
                { "value": "NOMBRE" },
                { "value": "" },
                { "value": "GUIDO REYES" },
                { "value": "" },
                { "value": "" }
              ],
              [
                { "value": "CARGO" },
                { "value": "" },
                { "value": "JEFE DE TERRENO" },
                { "value": "" },
                { "value": "ITO SONACOL P&A" }
              ],
              [
                { "value": "FIRMA" },
                { "value": "" },
                { "value": "" },
                { "value": "" },
                { "value": "" }
              ],
              [
                { "value": "FECHA" },
                { "value": "" },
                { "value": "." },
                { "value": "" },
                { "value": "" }
              ]
            ],
            "dialog": [
              {
                "title": "Firmas y Aprobaciones",
                "inputs": [
                  { "label": "ELABORA - NOMBRE", "value": "" },
                  { "label": "ELABORA - CARGO",  "value": "" },
                  { "label": "ELABORA - FIRMA",  "value": "" },
                  { "label": "ELABORA - FECHA",  "value": "" },

                  { "label": "REVISÓ - NOMBRE", "value": "" },
                  { "label": "REVISÓ - CARGO",  "value": "" },
                  { "label": "REVISÓ - FIRMA",  "value": "" },
                  { "label": "REVISÓ - FECHA",  "value": "" },

                  { "label": "APROBÓ - NOMBRE", "value": "" },
                  { "label": "APROBÓ - CARGO",  "value": "" },
                  { "label": "APROBÓ - FIRMA",  "value": "" },
                  { "label": "APROBÓ - FECHA",  "value": "" },

                  { "label": "APROBÓ (2) - NOMBRE", "value": "" },
                  { "label": "APROBÓ (2) - CARGO",  "value": "" },
                  { "label": "APROBÓ (2) - FIRMA",  "value": "" },
                  { "label": "APROBÓ (2) - FECHA",  "value": "" }
                ]
              }
            ]
          }
        ]
      });
    }

    if (!segmentos.some(s => s.label === 'Bloque XXXXX')) {
       segmentos.push({
        "posicion": 17,
        "label": "Bloque XXXXX",
        "touch": true,
        "collapsible": false,
        "attributes": [
          {
            "type": "matriz",
            "label": "Bloque XXXXX",
            "headers": [
              [
                { "label": "n° de medición/ distancia" },
                { "label": "" },
                { "label": "" },
                { "label": "" },
                { "label": "" },
                { "label": "PROMEDIO" }
              ]
            ],
            "body": [
              [
                { "value": "1" },
                { "value": "2" },
                { "value": "3" },
                { "value": "4" },
                { "value": "5" },
                { "value": "7" }
              ],
              [
                { "value": "2" },
                { "value": "" },
                { "value": "" },
                { "value": "" },
                { "value": "" },
                { "value": "" }
              ],
              [
                { "value": "3" },
                { "value": "" },
                { "value": "" },
                { "value": "" },
                { "value": "" },
                { "value": "" }
              ],
              [
                { "value": "4" },
                { "value": "" },
                { "value": "" },
                { "value": "" },
                { "value": "" },
                { "value": "" }
              ]
            ],
            "dialog": [
              {
                "title": "Detalles de la Tabla",
                "inputs": [
                  { "label": "n° de medición/ distancia", "value": "" },
                  { "label": "", "value": "" },
                  { "label": "", "value": "" },
                  { "label": "", "value": "" },
                  { "label": "", "value": "" },
                  { "label": "PROMEDIO", "value": "" }
                ]
              }
            ]
          }
        ]
      });
    }

    if (!segmentos.some(s => s.label === 'Bloque XXXXXX')) {
       segmentos.push({
        "posicion": 18,
        "label": "Bloque XXXXXX",
        "touch": true,
        "collapsible": false,
        "attributes": [
          {
            "type": "matriz",
            "label": "Bloque XXXXXX",
            "headers": [
              [
                { "label": "N°" },
                { "label": "PK (KM)" },
                { "label": "PROFUNDIDAD" },
                { "label": "COTA CLAVE" },
                { "label": "COTA TERRENO" }
              ]
            ],
            "body": [
            ],
            "dialog": [
              {
                "title": "Detalles de la Tabla",
                "inputs": [
                  { "label": "N°", "value": "" },
                  { "label": "PK (KM)", "value": "" },
                  { "label": "PROFUNDIDAD", "value": "" },
                  { "label": "COTA CLAVE", "value": "" },
                  { "label": "COTA TERRENO", "value": "" }
                ]
              }
            ]
          }
        ]
      });
    }

    if (!segmentos.some(s => s.label === 'Bloque XXXXXXX')) {
       segmentos.push({
        "posicion": "8",
        "label": "Bloque XXXXXXX",
        "touch": true,
        "collapsible": false,
        "attributes": [
          {
            "type": "matriz",
            "label": "Bloque XXXXXXX",
            "headers": [
              [
                { "label": "" },
                { "label": "ELABORA" },
                { "label": "REVISÓ" },
                { "label": "VALIDA" },
                { "label": "APROBÓ" }
              ]
            ],
            "body": [
              [
                { "value": "NOMBRE" },
                { "value": "" },
                { "value": "" },
                { "value": "" },
                { "value": "" }
              ],
              [
                { "value": "CARGO" },
                { "value": "" },
                { "value": "" },
                { "value": "" },
                { "value": "" }
              ],
              [
                { "value": "FIRMA" },
                { "value": "" },
                { "value": "" },
                { "value": "" },
                { "value": "" }
              ],
              [
                { "value": "FECHA" },
                { "value": "" },
                { "value": "" },
                { "value": "" },
                { "value": "" }
              ]
            ],
            "dialog": [
              {
                "title": "Firmas y Aprobaciones",
                "inputs": [
                  { "label": "ELABORA - NOMBRE", "value": "" },
                  { "label": "ELABORA - CARGO",  "value": "" },
                  { "label": "ELABORA - FIRMA",  "value": "" },
                  { "label": "ELABORA - FECHA",  "value": "" },

                  { "label": "REVISÓ - NOMBRE", "value": "" },
                  { "label": "REVISÓ - CARGO",  "value": "" },
                  { "label": "REVISÓ - FIRMA",  "value": "" },
                  { "label": "REVISÓ - FECHA",  "value": "" },

                  { "label": "VALIDA - NOMBRE", "value": "" },
                  { "label": "VALIDA - CARGO",  "value": "" },
                  { "label": "VALIDA - FIRMA",  "value": "" },
                  { "label": "VALIDA - FECHA",  "value": "" },

                  { "label": "APROBÓ (2) - NOMBRE", "value": "" },
                  { "label": "APROBÓ (2) - CARGO",  "value": "" },
                  { "label": "APROBÓ (2) - FIRMA",  "value": "" },
                  { "label": "APROBÓ (2) - FECHA",  "value": "" }
                ]
              }
            ]
          }
        ]
      });
    }

    if (!segmentos.some(s => s.label === 'Bloque XXXXXXXX')) {
       segmentos.push({
        "posicion": 19,
        "label": "Bloque XXXXXXXX",
        "touch": true,
        "collapsible": false,
        "attributes": [
          {
            "type": "matriz",
            "label": "Bloque XXXXXXXX",
            "headers": [
              [
                { "label": " " },
                { "label": "SOLDADOR" },
                { "label": "TIPO DE ELECTRODO" },
                { "label": "TIPO DE PROCESO" },
                { "label": "AVANCE" }
              ]
            ],
            "body": [
              [
                { "value": "RAIZ" },
                { "value": "" },
                { "value": "" },
                { "value": "" },
                { "value": "" }
              ],
              [
                { "value": "CORDÓN N°2" },
                { "value": "" },
                { "value": "" },
                { "value": "" },
                { "value": "" }
              ],
              [
                { "value": "CORDÓN N°3" },
                { "value": "" },
                { "value": "" },
                { "value": "" },
                { "value": "" }
              ],
              [
                { "value": "CORDÓN DE REMATE" },
                { "value": "" },
                { "value": "" },
                { "value": "" },
                { "value": "" }
              ]
            ],
            "dialog": [
              {
                "title": "Detalles de RAIZ",
                "inputs": [
                  { "label": "RAIZ - SOLDADOR", "value": "" },
                  { "label": "RAIZ - TIPO DE ELECTRODO", "value": "" },
                  { "label": "RAIZ - TIPO DE PROCESO", "value": "" },
                  { "label": "RAIZ - AVANCE", "value": "" },

                  { "label": "CORDÓN N°2 - SOLDADOR", "value": "" },
                  { "label": "CORDÓN N°2 - TIPO DE ELECTRODO", "value": "" },
                  { "label": "CORDÓN N°2 - TIPO DE PROCESO", "value": "" },
                  { "label": "CORDÓN N°2 - AVANCE", "value": "" },

                  { "label": "CORDÓN N°3 - SOLDADOR", "value": "" },
                  { "label": "CORDÓN N°3 - TIPO DE ELECTRODO", "value": "" },
                  { "label": "CORDÓN N°3 - TIPO DE PROCESO", "value": "" },
                  { "label": "CORDÓN N°3 - AVANCE", "value": "" },

                  { "label": "CORDÓN DE REMATE - SOLDADOR", "value": "" },
                  { "label": "CORDÓN DE REMATE - TIPO DE ELECTRODO", "value": "" },
                  { "label": "CORDÓN DE REMATE - TIPO DE PROCESO", "value": "" },
                  { "label": "CORDÓN DE REMATE - AVANCE", "value": "" }
                ]
              }
            ]
          }
        ]
      });
    }

    if (!segmentos.some(s => s.label === 'Bloque XXXXXXXXX')) {
       segmentos.push({
        "posicion": 21,
        "label": "Bloque XXXXXXXXX",
        "touch": true,
        "collapsible": false,
        "attributes": [
          {
            "type": "matriz",
            "label": "Bloque XXXXXXXXX",
            "headers": [
              [
                { "label": "SECTOR" },
                { "label": "ESPESOR" },
                { "label": "IQI REQUERIDO" },
                { "label": "IQI OBTENIDO" },
                { "label": "DENSIDAD" },
                { "label": "TIPO DEFECTO" },
                { "label": "CALIF." },
                { "label": "OBSERVACIONES" }
              ]
            ],
            "body": [

            ],
            "dialog": [
              {
                "title": "Resultados Radiografía",
                "inputs": [
                  { "label": "SECTOR", "value": "" },
                  { "label": "ESPESOR", "value": "" },
                  { "label": "IQI REQUERIDO", "value": "" },
                  { "label": "IQI OBTENIDO", "value": "" },
                  { "label": "DENSIDAD", "value": "" },
                  { "label": "TIPO DEFECTO", "value": "" },
                  { "label": "CALIF.", "value": "" },
                  { "label": "OBSERVACIONES", "value": "" }
                ]
              }
            ]
          }
        ]
      });
    } */
    /*if (!segmentos.some(s => s.label === 'Bloque XXXXXXXXXX')) {
      segmentos.push({
        "posicion": 1,
        "label": "Bloque XXXXXXXXXX",
        "touch": true,
        "collapsible": false,
        "attributes": [
          {
            "type": "matriz",
            "label": "Bloque XXXXXXXXXX",
            "headers": [
              [
                { "label": "PASADA", "rowspan": 2 },
                { "label": "COPLA SUPERIOR", "colspan": 3 }
              ],
              [
                { "label": "T° PRECAL" },
                { "label": "AMPERAJE PROMEDIO" },
                { "label": "ESTAMPA DE SOLDADOR" }
              ]
            ],
            "body": [
              [
                { "value": "CORDÓN CAÑERÍA" },
                { "value": "" },
                { "value": "" },
                { "value": "" }
              ],
              [
                { "value": "RAÍZ / RELLENO" },
                { "value": "" },
                { "value": "" },
                { "value": "" }
              ],
              [
                { "value": "REMATE" },
                { "value": "" },
                { "value": "" },
                { "value": "" }
              ]
            ],
            "dialog": [
              {
                "title": "Detalles COPLA SUPERIOR",
                "inputs": [
                  { "label": "PASADA", "value": "" },
                  { "label": "T° PRECAL", "value": "" },
                  { "label": "AMPERAJE PROMEDIO", "value": "" },
                  { "label": "ESTAMPA DE SOLDADOR", "value": "" }
                ]
              }
            ]
          }
        ]
      });
    }*/
    /*if (!segmentos.some(s => s.label === 'Bloque XXXXXXXXXXX')) {
      segmentos.push({
        "posicion": 1,
        "label": "Bloque XXXXXXXXXXX",
        "touch": true,
        "collapsible": false,
        "attributes": [
          {
            "type": "matriz",
            "label": "Bloque XXXXXXXXXXX",
            "actualizar": true,
            "headers": [
              [
                { "label": "PASADA", "rowspan": 2 },
                { "label": "COPLA INFERIOR", "colspan": 3 }
              ],
              [
                { "label": "T° PRECAL" },
                { "label": "AMPERAJE PROMEDIO" },
                { "label": "ESTAMPA DE SOLDADOR" }
              ]
            ],
            "body": [
              [
                { "value": "CORDÓN CAÑERÍA", "editable": false },
                { "value": "" },
                { "value": "" },
                { "value": "" }
              ],
              [
                { "value": "RAÍZ / RELLENO", "editable": false },
                { "value": "" },
                { "value": "" },
                { "value": "" }
              ],
              [
                { "value": "REMATE", "editable": false },
                { "value": "" },
                { "value": "" },
                { "value": "" }
              ]
            ],
            "dialog": [
              {
                "title": "Detalles COPLA SUPERIOR",
                "inputs": [
                  { "label": "CORDÓN CAÑERÍA - T° PRECAL", "value": "" },
                  { "label": "CORDÓN CAÑERÍA - AMPERAJE PROMEDIO", "value": "" },
                  { "label": "CORDÓN CAÑERÍA - ESTAMPA DE SOLDADOR", "value": "" },

                  { "label": "RAÍZ / RELLENO - T° PRECAL", "value": "" },
                  { "label": "RAÍZ / RELLENO - AMPERAJE PROMEDIO", "value": "" },
                  { "label": "RAÍZ / RELLENO - ESTAMPA DE SOLDADOR", "value": "" },

                  { "label": "REMATE - T° PRECAL", "value": "" },
                  { "label": "REMATE - AMPERAJE PROMEDIO", "value": "" },
                  { "label": "REMATE - ESTAMPA DE SOLDADOR", "value": "" }
                ]
              }
            ]
          }
        ]
      });
    }*/

    if (!segmentos.some(s => s.label === 'Bloque Matriz Check')) {
       segmentos.push({
        "posicion": 21,
        "label": "Bloque Matriz Check",
        "touch": true,
        "collapsible": false,
        "attributes": [
          {
            "type": "matrizCheck",
            "label": "Bloque Matriz Check",
            "actualizar": false,
            "headers": [
              [
                { "label": "N°", "width": "5%" },
                { "label": "ELEMENTOS A INSPECCIONAR", "width": "30%" },
                { "label": "SI NO N/A", "width": "10%", "options": [
                    { id: 'si', label: 'Sí' },
                    { id: 'no', label: 'No' },
                    { id: 'n/a', label: 'N/A' },
                  ]
                },
                { "label": "Puntaje", "width": "10%" },
                { "label": "Observación", "width": "20%" },
                { "label": "Imagen", "width": "25%" }
              ]
            ],
            "body": [
              [
                { "value": 1, "editable": false },
                { "value": "¿Dispone de bodega para almacenamiento de residuos peligrosos?", "editable": false, "text-align": "left" },
                { "value": "", "type": "check" },
                { "value": "", "type": "number" },
                { "value": "" },
                { "value": "", "type": "image", "galeria": [], "compression": 10 }
              ],
              [
                { "value": 2,  "editable": false },
                { "value": "La bodega, ¿esta construida según se indica en procedimiento TPI-MAM-PRO-002?", "editable": false, "text-align": "left" },
                { "value": "NO", "type": "check" },
                { "value": 0,    "type": "number" },
                { "value": "" },
                { "value": "",   "type": "image", "galeria": [], "compression": 10 }
              ],
              [
                { "value": 3,  "editable": false },
                { "value": "¿La bodega cuenta con la siguiente señalización: uso de epp, no fumar, ingreso personal autorizado, pictogramas de peligrosidades, informativo NFPA?", "editable": false, "text-align": "left" },
                { "value": "NO", "type": "check" },
                { "value": 0,    "type": "number" },
                { "value": "" },
                { "value": "",   "type": "image", "galeria": [], "compression": 10 }
              ],
              [
                { "value": 4,  "editable": false },
                { "value": "¿La bodega dispone de sistema de ventilación natural o forzada?", "editable": false, "text-align": "left" },
                { "value": "NO", "type": "check" },
                { "value": 0,    "type": "number" },
                { "value": "" },
                { "value": "",   "type": "image", "galeria": [], "compression": 10 }
              ],
              [
                { "value": 5,  "editable": false },
                { "value": "¿La bodega cuenta con contenedores herméticos para la segregación de residuos?", "editable": false, "text-align": "left" },
                { "value": "NO", "type": "check" },
                { "value": 0,    "type": "number" },
                { "value": "" },
                { "value": "",   "type": "image", "galeria": [], "compression": 10 }
              ],
              [
                { "value": 6,  "editable": false },
                { "value": "¿Los contenedores se encuentran debidamente rotulados y  señalizados?", "editable": false, "text-align": "left" },
                { "value": "NO", "type": "check" },
                { "value": 0,    "type": "number" },
                { "value": "" },
                { "value": "",   "type": "image", "galeria": [], "compression": 10 }
              ],
              [
                { "value": 7,  "editable": false },
                { "value": "La bodega, ¿se encuentra ordenada y clasificada según compatibilidad?", "editable": false, "text-align": "left" },
                { "value": "NO", "type": "check" },
                { "value": 0,    "type": "number" },
                { "value": "" },
                { "value": "",   "type": "image", "galeria": [], "compression": 10 }
              ],
              [
                { "value": 8,  "editable": false },
                { "value": "¿Existen medios para contener el derrame de residuos peligrosos?", "editable": false, "text-align": "left" },
                { "value": "NO", "type": "check" },
                { "value": 0,    "type": "number" },
                { "value": "" },
                { "value": "",   "type": "image", "galeria": [], "compression": 10 }
              ],
              [
                { "value": 9,  "editable": false },
                { "value": "¿Dispone extintor de polvo químico seco, según capacidad de eximición?", "editable": false, "text-align": "left" },
                { "value": "NO", "type": "check" },
                { "value": 0,    "type": "number" },
                { "value": "" },
                { "value": "",   "type": "image", "galeria": [], "compression": 10 }
              ],
              [
                { "value": 10, "editable": false },
                { "value": "¿Dispone de listados de residuos peligrosos actualizado de bodega?", "editable": false, "text-align": "left" },
                { "value": "NO", "type": "check" },
                { "value": 0,    "type": "number" },
                { "value": "" },
                { "value": "",   "type": "image", "galeria": [], "compression": 10 }
              ],
              [
                { "value": 11, "editable": false },
                { "value": "¿Dispone del croquis de residuos peligrosos actualizado y publicado al exterior de la bodega?", "editable": false, "text-align": "left" },
                { "value": "NO", "type": "check" },
                { "value": 0,    "type": "number" },
                { "value": "" },
                { "value": "",   "type": "image", "galeria": [], "compression": 10 }
              ],
              [
                { "value": 12, "editable": false },
                { "value": "¿Dispone de matriz de incompatiblidad actualizado y publicado al exterior de la bodega?", "editable": false, "text-align": "left" },
                { "value": "NO", "type": "check" },
                { "value": 0,    "type": "number" },
                { "value": "" },
                { "value": "",   "type": "image", "galeria": [], "compression": 10 }
              ],
              [
                { "value": 13, "editable": false },
                { "value": "¿El personal a cargo de la bodega de sustancias peligrosas cuenta con la capacitación específica?", "editable": false, "text-align": "left" },
                { "value": "NO", "type": "check" },
                { "value": 0,    "type": "number" },
                { "value": "" },
                { "value": "",   "type": "image", "galeria": [], "compression": 10 }
              ],
              [
                { "value": 14, "editable": false },
                { "value": "¿Los accesos a la bodega se encuentran despejados y libre de obstáculos para el ingreso de personal de emergencia?", "editable": false, "text-align": "left" },
                { "value": "NO", "type": "check" },
                { "value": 0,    "type": "number" },
                { "value": "" },
                { "value": "",   "type": "image", "galeria": [], "compression": 10 }
              ],
              [
                { "value": 15, "editable": false },
                { "value": "La bodega, ¿se encuentra aisladas de fuentes de calor o fuentes de ignición de fuego tales como madera, cartón, plásticos, etc?", "editable": false, "text-align": "left" },
                { "value": "NO", "type": "check" },
                { "value": 0,    "type": "number" },
                { "value": "" },
                { "value": "",   "type": "image", "galeria": [], "compression": 10 }
              ]
            ],
            "footer":
              [
                { "label": "Puntaje Obtenido", "value": 0, "colspan": 2, "puntajeObtenido": 0 },
                { "label": "Puntaje Máximo", "value": 0, "colspan": 2, "puntajeMaximo": 0 },
                { "label": "Desempeño", "value": "0%", "colspan": 2, "desempeno": "0%" }
              ]
          }
        ]
      });
    }

    /*if (!segmentos.some(s => s.label === 'Matriz Excavaciones')) {
       segmentos.push({
         "label": "Matriz Excavaciones",
         "touch": false,
         "posicion": 2,
         "attributes": [
           {
             "body": [],
             "type": "matrizExcavaciones",
             "label": "Matriz Excavaciones",
             "dialog": [
               {
                 "title": "Perfiles de Zanja",
                 "inputs": [
                   {
                     "label": "N°",
                     "value": ""
                   },
                   {
                     "label": "PK",
                     "value": ""
                   },
                   {
                     "label": "Ancho sup. (a)",
                     "value": ""
                   },
                   {
                     "label": "Ancho inf. (b)",
                     "value": ""
                   },
                   {
                     "label": "Profundidad (c) ",
                     "value": ""
                   },
                   {
                     "label": "Largo (L)",
                     "value": ""
                   },
                   {
                     "label": "Acumulado L (m)",
                     "value": ""
                   },
                   {
                     "label": "Volumen V (m3)",
                     "value": ""
                   }
                 ]
               }
             ],
             "headers": [
               [
                 {
                   "label": "N°"
                 },
                 {
                   "label": "PK"
                 },
                 {
                   "label": "Ancho sup. (a)"
                 },
                 {
                   "label": "Ancho inf. (b)"
                 },
                 {
                   "label": "Profundidad (c) "
                 },
                 {
                   "label": "Largo (L)"
                 },
                 {
                   "label": "Acumulado L (m)"
                 },
                 {
                   "label": "Volumen V (m3)"
                 }
               ]
             ]
           }
         ],
         "collapsible": false
       });
    }*/

    /*if (!segmentos.some(s => s.label === 'matrizBorewrap')) {
      segmentos.push({
        "label": "matrizBorewrap",
        "touch": true,
        "posicion": 7,
        "attributes": [
          {
            "body": [],
            "type": "matrizBorewrap",
            "label": "CARGUIO DE AGUAS",
            "dialog": [
              {
                "title": "CONDICIONES AMBIENTALES",
                "inputs": [
                  {
                    "label": "(HR) % de húmedad relativa",
                    "value": ""
                  },
                  {
                    "label": "(Ts) Temperatura de Superficie",
                    "value": ""
                  },
                  {
                    "label": "(Ta) Temperatura aire del ambiente",
                    "value": ""
                  },
                  {
                    "label": "(Td) Punto de Rocío",
                    "value": ""
                  },
                  {
                    "label": "(T∆) Diferencia entre Td y Ts",
                    "value": ""
                  },
                  {
                    "label": "Hora de medición",
                    "value": ""
                  }
                ]
              }
            ],
            "headers": [
              [
                {
                  "label": "(HR) % de húmedad relativa"
                },
                {
                  "label": "(Ts) Temperatura de Superficie"
                },
                {
                  "label": "(Ta) Temperatura aire del ambiente"
                },
                {
                  "label": "(Td) Punto de Rocío"
                },
                {
                  "label": "(T∆) Diferencia entre Td y Ts"
                },
                {
                  "label": "Hora de medición"
                }
              ]
            ]
          }
        ],
        "collapsible": false
      });
    }

    if (!segmentos.some(s => s.label === 'matrizTransp')) {
      segmentos.push({
        "label": "matrizTransp",
        "touch": true,
        "posicion": 2,
        "attributes": [
          {
            "body": [],
            "type": "matrizTransp",
            "label": "2. LISTADO DE CAÑERIAS",
            "dialog": [
              {
                "title": "Detalles de Cañerías",
                "inputs": [
                  {
                    "label": "Item",
                    "value": ""
                  },
                  {
                    "label": "Número de Cañería",
                    "value": ""
                  },
                  {
                    "label": "N° SCI.",
                    "value": ""
                  },
                  {
                    "label": "Largo (m)",
                    "value": ""
                  }
                ]
              }
            ],
            "headers": [
              [
                {
                  "label": "Item"
                },
                {
                  "label": "Número de Cañería"
                },
                {
                  "label": "N° SCI."
                },
                {
                  "label": "Largo (m)"
                }
              ]
            ],
            footer: [
              {
                label: 'TOTAL METRO LINEALES = ',
                value: 0,
                colspan: 2,
                totalLargo: 0
              }
            ]
          }
        ],
        "collapsible": false
      })
    }

    if (!segmentos.some(s => s.label === 'matrizGranallado')) {
      segmentos.push({
        "label": "matrizGranallado",
        "touch": true,
        "posicion": 2,
        "attributes": [
          {
            "body": [],
            "type": "matrizGranallado",
            "label": "matrizGranallado",
            "dialog": [
              {
                "title": "COTA PROFUNDIDAD DE SELLO",
                "inputs": [
                  {
                    "label": "N° de medición ",
                    "value": ""
                  },
                  {
                    "label": "0°",
                    "value": ""
                  },
                  {
                    "label": "90°",
                    "value": ""
                  },
                  {
                    "label": "180°",
                    "value": ""
                  },
                  {
                    "label": "270°",
                    "value": ""
                  },
                  {
                    "label": "Promedio",
                    "value": ""
                  }
                ]
              }
            ],
            "headers": [
              [
                {
                  "label": "N° de medición "
                },
                {
                  "label": "0°"
                },
                {
                  "label": "90°"
                },
                {
                  "label": "180°"
                },
                {
                  "label": "270°"
                },
                {
                  "label": "Promedio"
                }
              ]
            ]
          }
        ],
        "collapsible": false
      })
    };


    if (!segmentos.some(s => s.label === 'matrizProtal')) {
      segmentos.push({
          "label": "matrizProtal",
          "touch": true,
          "posicion": 2,
          "attributes": [
            {
              "type": "matrizProtal",
              "label": "matrizProtal",
              "dialog": [
                {
                  "title": "Detalles de la Tabla",
                  "inputs": [
                    {
                      "label": "n° de medición/ distancia",
                      "value": ""
                    },
                    {
                      "label": "0°",
                      "value": ""
                    },
                    {
                      "label": "90°",
                      "value": ""
                    },
                    {
                      "label": "180°",
                      "value": ""
                    },
                    {
                      "label": "270°",
                      "value": ""
                    },
                    {
                      "label": "PROMEDIO",
                      "value": ""
                    }
                  ]
                }
              ],
              "headers": [
                [
                  {
                    "label": "N° de medición/ distancia"
                  },
                  {
                    "label": "0°"
                  },
                  {
                    "label": "90°"
                  },
                  {
                    "label": "180°"
                  },
                  {
                    "label": "270°"
                  },
                  {
                    "label": "PROMEDIO"
                  }
                ]
              ]
            }
          ],
          "collapsible": false
        },
        {
          "label": "matrizProtal",
          "touch": true,
          "posicion": 5,
          "attributes": [
            {
              "type": "matrizProtal",
              "label": "matrizProtal",
              "dialog": [
                {
                  "title": "Detalles de la Tabla",
                  "inputs": [
                    {
                      "label": "n° de medición/ distancia",
                      "value": ""
                    },
                    {
                      "label": "0°",
                      "value": ""
                    },
                    {
                      "label": "90°",
                      "value": ""
                    },
                    {
                      "label": "180°",
                      "value": ""
                    },
                    {
                      "label": "270°",
                      "value": ""
                    },
                    {
                      "label": "PROMEDIO",
                      "value": ""
                    }
                  ]
                }
              ],
              "headers": [
                [
                  {
                    "label": "N° de medición/ distancia"
                  },
                  {
                    "label": "0°"
                  },
                  {
                    "label": "90°"
                  },
                  {
                    "label": "180°"
                  },
                  {
                    "label": "270°"
                  },
                  {
                    "label": "PROMEDIO"
                  }
                ]
              ]
            }
          ],
          "collapsible": false
        })
    };

    if (!segmentos.some(s => s.label === 'matrizPolypipe')) {
      segmentos.push({
        "label": "matrizPolypipe",
        "touch": false,
        "posicion": 2,
        "attributes": [
          {
            "type": "matrizPolypipe",
            "label": "matrizPolypipe",
            "dialog": [
              {
                "title": "Detalles de la Tabla",
                "inputs": [
                  {
                    "label": "(HR) % de húmedad relativa",
                    "value": ""
                  },
                  {
                    "label": "(Ts) Temperatura de Superficie",
                    "value": ""
                  },
                  {
                    "label": "(Ta) Temperatura aire del ambiente",
                    "value": ""
                  },
                  {
                    "label": "(Td) Punto de Rocío",
                    "value": ""
                  },
                  {
                    "label": "(T∆) Diferencia entre Td y Ts",
                    "value": ""
                  },
                  {
                    "label": "Hora de medición",
                    "value": ""
                  }
                ]
              }
            ],
            "headers": [
              [
                {
                  "label": "(HR) % de húmedad relativa"
                },
                {
                  "label": "(Ts) Temperatura de Superficie"
                },
                {
                  "label": "(Ta) Temperatura aire del ambiente"
                },
                {
                  "label": "(Td) Punto de Rocío"
                },
                {
                  "label": "(T∆) Diferencia entre Td y Ts"
                },
                {
                  "label": "Hora de medición"
                }
              ]
            ]
          }
        ],
        "collapsible": false
      })
    };

    if (!segmentos.some(s => s.label === 'matrizSoldadura')) {
      segmentos.push(
        {
          "label": "matrizSoldadura",
          "touch": true,
          "posicion": "9",
          "attributes": [
            {
              "body": [],
              "type": "matrizSoldadura",
              "label": "matrizSoldadura",
              "headers": [
                [
                  { "label": "SECTOR" },
                  { "label": "ESPESOR" },
                  { "label": "IQI REQUERIDO" },
                  { "label": "IQI OBTENIDO" },
                  { "label": "DENSIDAD" },
                  { "label": "TIPO DEFECTO" },
                  { "label": "CALIF." },
                  { "label": "OBSERVACIONES" }
                ]
              ]
            }
          ],
          "collapsible": false
        }
      )
    }*/

    console.log(segmentos);

    return segmentos;
  } catch (error) {
    console.log(error);
    return [];
  }
};

const ESTADOS_CONEXION_COLOR_MAP = Object.freeze({
  conexion: 'blue-darken-2',
  trabajoespecial: 'indigo-darken-1',
  ejecucion: 'orange-darken-2',
  reactivacion: 'green-darken-2',
  prodoral: 'deep-orange-darken-2',
  encontinuacion: 'cyan-darken-2'
});

const ESTADOS_CONEXION_CLASS_MAP = Object.freeze({
  conexion: 'estado-option--conexion',
  trabajoespecial: 'estado-option--trabajo-especial',
  ejecucion: 'estado-option--ejecucion',
  reactivacion: 'estado-option--reactivacion',
  prodoral: 'estado-option--prodoral',
  encontinuacion: 'estado-option--en-continuacion'
});

function normalizeTextValue(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function normalizeEstadoLookup(value) {
  return normalizeTextValue(value).replace(/[^a-z]/g, '');
}

function isConexionEstadoSelect(attr, survey) {
  if (Number(survey?.id_area || 0) !== 8) return false;
  if (attr?.type !== 'comboBox') return false;

  const label = normalizeTextValue(attr?.label);
  const question = normalizeTextValue(attr?.values?.quest);
  const isEstadoField = label.includes('estado') || question.includes('estado');
  if (!isEstadoField) return false;

  const rawOptions = Array.isArray(attr?.values?.options) ? attr.values.options : [];
  const joined = normalizeTextValue(rawOptions.map((o) => o?.label ?? o?.value ?? o).join(' '));
  return joined.includes('conexion') || joined.includes('trabajo especial') || joined.includes('ciige');
}

function getEstadoConexionColor(estado) {
  return ESTADOS_CONEXION_COLOR_MAP[normalizeEstadoLookup(estado)] || '';
}

function getEstadoOptionClass(estado) {
  return ESTADOS_CONEXION_CLASS_MAP[normalizeEstadoLookup(estado)] || '';
}

function getEstadoItemValue(item) {
  return item?.raw?.value ?? item?.value ?? item?.title ?? item?.raw?.label ?? '';
}

function getEstadoItemLabel(item) {
  return item?.raw?.label ?? item?.title ?? item?.value ?? '';
}

function getEstadoItemClass(item, attr, survey) {
  if (!isConexionEstadoSelect(attr, survey)) return '';
  return getEstadoOptionClass(getEstadoItemValue(item));
}

function getSelectItems(options) {
  if (!options) return [];
  return options.map(opt => ({
    id: opt.id ?? opt.value,
    label: opt.label ?? opt.value,
    value: opt.value ?? opt.id
  }));
}

function normalizeBodyKey(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function isConexionSurvey(survey) {
  const area = Number(survey?.id_area || 0)
  const templateText = [
    survey?.desc_template_srv,
    survey?.name_template_srv,
    survey?.codi_template_srv,
    survey?.name_tipo_srv
  ].join(' ')

  return area === 8 || normalizeBodyKey(templateText).includes('CONEXION')
}

function ensureRegistroEventosAttr(segmento) {
  if (!Array.isArray(segmento.attributes)) segmento.attributes = []

  let attr = segmento.attributes.find(item =>
    item?.type === 'registroEventos' &&
    normalizeBodyKey(item?.label || 'Eventos') === normalizeBodyKey('Eventos')
  )

  if (!attr) {
    attr = {
      type: 'registroEventos',
      label: 'Eventos',
      nullable: true,
      body: []
    }
    segmento.attributes.push(attr)
  }

  if (!Array.isArray(attr.body)) attr.body = []
  attr.body = attr.body.map(evento => ({
    comentarioInicial: evento?.comentarioInicial || '',
    hora: evento?.hora || '',
    observaciones: evento?.observaciones || '',
    comentarioFotos: evento?.comentarioFotos || '',
    ...evento,
    galeria: Array.isArray(evento?.galeria) ? evento.galeria : []
  }))

  return attr
}

function ensureAntecedentesComplementariosSegment(survey, body) {
  if (!isConexionSurvey(survey)) return
  if (!Array.isArray(body.segmentos)) body.segmentos = []

  let segmento = body.segmentos.find(seg =>
    normalizeBodyKey(seg?.label) === normalizeBodyKey('Antecedentes Complementarios')
  )

  if (!segmento) {
    segmento = {
      touch: true,
      label: 'Antecedentes Complementarios',
      collapsible: true,
      attributes: []
    }
    body.segmentos.push(segmento)
  }

  ensureRegistroEventosAttr(segmento)
}

function getRegistroEventos(attr) {
  if (!Array.isArray(attr.body)) attr.body = []
  return attr.body
}

function agregarEventoRegistro(attr) {
  const eventos = getRegistroEventos(attr)
  eventos.push({
    comentarioInicial: '',
    hora: DateTime.now().setZone('America/Santiago').toFormat('HH:mm'),
    observaciones: '',
    comentarioFotos: '',
    galeria: []
  })
  segmentosCompletos()
}

function eliminarEventoRegistro(attr, index) {
  const eventos = getRegistroEventos(attr)
  eventos.splice(index, 1)
  segmentosCompletos()
}

// 2) MODIFICADO: validar antes de guardar
const guardarSurvey = () => {
  // si faltan fotos obligatorias, no continúa
  if (!validarFotosRequeridas()) return;

  putSurvey(surveyDetailStore.surveyDetail[0].id_survey);
  alert('Survey Guardado Correctamente');
  console.log(surveyDetailStore.surveyDetail);
};

function roundStableNumber(value, decimals = 3) {
  const n = Number(value)
  if (!Number.isFinite(n)) return value
  const p = 10 ** decimals
  return Math.round((n + Number.EPSILON) * p) / p
}

function sanitizePPDBodyExec(body) {
  const cloned = JSON.parse(JSON.stringify(body ?? null))
  if (!cloned || typeof cloned !== 'object' || !Array.isArray(cloned.task)) return cloned

  cloned.task = cloned.task.map((t) => {
    if (!t || typeof t !== 'object') return t
    const out = { ...t }

    if (Object.prototype.hasOwnProperty.call(out, 'plan')) out.plan = roundStableNumber(out.plan, 3)
    if (Object.prototype.hasOwnProperty.call(out, 'real')) out.real = roundStableNumber(out.real, 3)

    if (Array.isArray(out.assigned_personnel)) {
      out.assigned_personnel = out.assigned_personnel.map((p) => {
        if (!p || typeof p !== 'object') return p
        if (!Object.prototype.hasOwnProperty.call(p, 'horas')) return p
        return { ...p, horas: roundStableNumber(p.horas, 3) }
      })
    }

    return out
  })

  return cloned
}

async function putSurvey(id_survey) {
  const formData = new FormData();

  const coordenadas = obtenerCoordenadas(surveyDetailStore.surveyDetail[0]);

  console.log(id_survey);
  console.log(JSON.stringify(surveyDetailStore.surveyDetail[0].body_exec));

  formData.append('estado_srv', 'Ejecución');
  formData.append('body_exec', JSON.stringify(sanitizePPDBodyExec(surveyDetailStore.surveyDetail[0].body_exec)));
  formData.append('fecha_real_ini', DateTime.now().setZone('America/Santiago').toFormat("yyyy-MM-dd'T'HH:mm:ss"));
  formData.append('fecha_ejec_fin', null);
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

const local = ref({ lat: null, lng: null });

function confirmarTerminarSurvey() {
  dialogConfirmarTerminar.value = true;
}

function handleResultadoAceptar() {
  dialogResultado.value = false;
}

// 3) MODIFICADO: validar antes de terminar
async function handleTerminarSurvey() {
  // si faltan fotos, NO seguimos
  if (!validarFotosRequeridas()) {
    // si quieres, vuelve a mostrar el diálogo de confirmar:
    // dialogConfirmarTerminar.value = true;
    return;
  }

  dialogConfirmarTerminar.value = false;
  dialogLoading.value = true;
  try {
    await putSurveyFechaEjecFin(surveyDetailStore.surveyDetail[0].id_survey);
    console.log('Survey terminado:', surveyDetailStore.surveyDetail[0].id_survey);
    dialogLoading.value = false;
    dialogResultado.value = true;
  } catch (error) {
    dialogLoading.value = false;
    console.error('Error al terminar survey:', error);
  }
}

async function putSurveyFechaEjecFin(id_survey) {
  await putSurvey(surveyDetailStore.surveyDetail[0].id_survey);
  const formData = new FormData();
  await obtenerUbicacion();

  const localCL = DateTime
    .fromISO(DateTime.now().toISO())           // o desde tu valor
    .setZone('America/Santiago')
    .toSQL({ includeOffset: false })

  formData.append('estado_srv', 'VERIFICACION');
  formData.append('body_exec', JSON.stringify(sanitizePPDBodyExec(surveyDetailStore.surveyDetail[0].body_exec)));
  formData.append('fecha_real_ini', surveyDetailStore.surveyDetail[0].fecha_plan_ini || DateTime.now().setZone('America/Santiago').toISO());
  //formData.append('fecha_ejec_fin', DateTime.now().setZone('America/Santiago').toISO());
  formData.append('fecha_ejec_fin', localCL)
  formData.append('latitud', local.value.lat || '');
  formData.append('longitud', local.value.lng || '');

  console.log('FD:', Array.from(formData.entries()));

  try {
    const response = await apiAxios.put(`/survey/UpdFechaEjecFin/${id_survey}`, formData);

    await exportarInspeccion(id_survey);
    console.log('Survey actualizado correctamente:', response.data);
  } catch (error) {
    console.error('Error al actualizar survey:', error);
  }

}

/*async function putSurveyFechaEjecFin(id_survey) {
  const formData = new FormData();

  //const coordenadas = obtenerCoordenadas(surveyDetailStore.surveyDetail[0]);

  await obtenerUbicacion()

  console.log("id_survey", id_survey);
  //console.log(JSON.stringify(surveyDetailStore.surveyDetail[0].body_exec));
  console.log("surveyDetailStore", surveyDetailStore.surveyDetail[0]);

  formData.append('estado_srv', 'VERIFICACION');
  formData.append('body_exec', JSON.stringify(sanitizePPDBodyExec(surveyDetailStore.surveyDetail[0].body_exec)));
  formData.append('fecha_real_ini', surveyDetailStore.surveyDetail[0].fecha_plan_ini ?? DateTime.now().setZone('America/Santiago').toFormat("yyyy-MM-dd'T'HH:mm:ss"));
  formData.append('fecha_ejec_fin', DateTime.now().setZone('America/Santiago').toFormat("yyyy-MM-dd'T'HH:mm:ss"));
  // Si coordenadas existen, usa lat/lng, si no, manda null o vacío
  formData.append('latitud', local.value.lat ?? '');
  formData.append('longitud', local.value.lng ?? '');
  for (let pair of formData.entries()) {
    console.log(pair[0]+ ': ' + pair[1]);
  }

  try {
    const response = await apiAxios.put(/survey/${id_survey}, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    await exportarInspeccion(id_survey);
    console.log('Survey actualizado correctamente:', response.data);
  } catch (error) {
    console.error('Error al actualizar survey:', error);
  }

}*/


async function obtenerUbicacion() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          local.value.lat = pos.coords.latitude;
          local.value.lng = pos.coords.longitude;
          console.log('✅ Coordenadas obtenidas:', local.value);
          resolve();
        },
        (err) => {
          console.error('❌ Error al obtener ubicación:', err.message);
          // puedes poner valores por defecto o null
          local.value.lat = '';
          local.value.lng = '';
          resolve();  // resolvemos igual para que el flujo siga
        }
      )
    } else {
      console.warn('⚠️ Geolocalización no soportada en este navegador.');
      local.value.lat = '';
      local.value.lng = '';
      resolve();
    }
  });
}

const exportarInspeccion = async (idInspeccion) => {
  const formData = new FormData()
  //formData.append('archivo', file)
  formData.append('idInspeccion', idInspeccion);
  formData.append('tipo_doc', 'DOCUMENTO')
  formData.append('mimetype', 'application/pdf');
  formData.append('name_doc_orig', '')
  formData.append('name_doc_interno', '')
  formData.append('path_doc', '/u05/LeanDocs/terracon/')
  formData.append('id_user', userDetailStore.userDetail.id_user)
  formData.append('estado', '1')
  try {
    const response = await apiAxios.post(
      `/exportar/generar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    console.log('✅ Exportación exitosa:', response.data);
    // Podrías mostrar al usuario:
    //alert(`PDF generado: ${response.data.archivo}`);
  } catch (error) {
    console.error('❌ Error al exportar:', error.response?.data || error.message);
    alert('Error al exportar');
  }
};

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

// Opciones del combo
const isFalseyEditFlag = (v) => v === false || v === 'false' || v === 0 || v === '0';
const isEditable = (cell) => !isFalseyEditFlag(cell?.editable);
const canEdit = (cell) => cell?.editable !== false;
const checkItems = ['SI','NO','N/A'];

function onCheckChange(cell, val) {
  cell.value = (val ?? '').toString().trim().toUpperCase();
}
function onlyNumberKeypress(e) {
  const ch = e.key;
  const ok = /[0-9.,]/.test(ch) || ['Backspace','Delete','ArrowLeft','ArrowRight','Tab'].includes(ch);
  if (!ok) e.preventDefault();
}
function sanitizeNumber(cell) {
  let s = String(cell?.value ?? '').trim();
  if (s === '') { cell.value = ''; return; }
  s = s.replace(/\s+/g, '').replace(/\./g, '').replace(',', '.');
  const n = parseFloat(s);
  cell.value = Number.isFinite(n) ? n : '';
}

// Devuelve un array de anchos por columna expandiendo los colspan del primer header row
function columnWidths(attr) {
  const firstRow = (attr?.headers?.[0] ?? []);
  const widths = [];
  for (const cell of firstRow) {
    const span = Number(cell.colspan || 1);
    const w = cell.width || '';
    for (let i = 0; i < span; i++) widths.push(w);
  }
  return widths;
}

// ==== Helpers IMAGEN (idéntico comportamiento a FotoCheck) ====

// genera un id único por celda para el input file oculto
const imageInputId = (rIdx, cIdx) => `matrizcheck-img-input-${rIdx}-${cIdx}`;

function openCameraForCell(attr, rIdx, cIdx) {
  const el = document.getElementById(imageInputId(rIdx, cIdx));
  if (el) el.click();
}

// limpia la imagen de la celda
function removeImageMatriz(attr, rIdx, cIdx) {
  const cell = attr.__editing ? attr.__draftBody?.[rIdx]?.[cIdx] : attr.body?.[rIdx]?.[cIdx];
  if (!cell) return;
  cell.galeria = [];
  cell.value = '';
}

async function onPickImageMatriz(event, attr, rIdx, cIdx) {
  const file = event.target.files?.[0];
  event.target.value = ''; // permite volver a elegir
  if (!file || !file.type.startsWith('image/')) return;

  const cell = attr.__editing ? attr.__draftBody?.[rIdx]?.[cIdx] : attr.body?.[rIdx]?.[cIdx];
  if (!cell) return;

  // compresión: si config viene como "10" => calidad 0.1
  const quality = (() => {
    const q = Number(cell.compression ?? 0.1);
    if (q <= 1) return Math.max(0.1, Math.min(1, q));
    return Math.max(0.1, Math.min(1, q / 100));
  })();

  try {
    const compressedDataUrl = await compressImageToDataURL(file, quality, 800, 800);
    // sube al backend y obtiene URL
    const dataArchivo = await uploadFileFromBase64(compressedDataUrl, file.name, file.type);
    if (dataArchivo?.archivo?.name_doc_interno) {
      const obj = {
        base64: '',
        url: '/archivo/terracon/' + dataArchivo.archivo.name_doc_interno,
        nombre: dataArchivo.archivo.name_doc_interno
      };
      cell.galeria = [obj];   // igual que FotoCheck: una imagen
      cell.value = obj.nombre || 'foto';
    } else {
      console.error('No se pudo subir el archivo correctamente.');
    }
  } catch (err) {
    console.error('Error procesando imagen:', err);
  }
}

// comprime a dataURL con canvas (como FotoCheck)
function compressImageToDataURL(file, quality = 0.1, maxW = 800, maxH = 800) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        // escala manteniendo proporción
        let { width, height } = img;
        const scale = Math.min(1, maxW / width, maxH / height);
        const w = Math.round(width * scale);
        const h = Math.round(height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function base64ToFile(base64, filename, mime) {
  const arr = base64.split(',');
  const bstr = atob(arr[1] || '');
  const u8arr = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
  return new File([u8arr], filename, { type: mime || 'image/jpeg' });
}

async function uploadFileFromBase64(base64Data, originalName, mimeType) {
  const file = base64ToFile(base64Data, originalName, mimeType);
  const formData = new FormData();
  formData.append('archivo', file);
  formData.append('tipo_doc', 'DOCUMENTO');
  formData.append('mimetype', file.type);
  formData.append('name_doc_orig', file.name);
  formData.append('name_doc_interno', '');
  formData.append('path_doc', '/u05/LeanDocs/terracon/');
  formData.append('id_user', 1); // ajusta si corresponde
  formData.append('estado', '1');

  try {
    const { data } = await apiAxios.post(
      '/archivo/imagen',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return data;
  } catch (error) {
    console.error('Error al subir archivo:', error);
    return null;
  }
}


// Máximo por ítem (si quieres parametrizarlo, lee attr.maxScore || 10)
const MCHECK_MAX_PER_ITEM = 10;

function normalizeCheck(v) {
  const s = (v ?? '').toString().trim().toLowerCase();
  // soporta 'si', 'sí', 'no', 'n/a' y variantes
  if (['si','sí'].includes(s)) return 'si';
  if (s === 'no') return 'no';
  if (s === 'n/a' || s === 'na') return 'n/a';
  return s;
}

function toNumber(val) {
  if (val === null || val === undefined) return 0;
  const s = String(val).trim().replace(/\./g, '').replace(',', '.');
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

// Calcula métricas en vivo (usa draft si estás editando)
function mcheckMetrics(attr) {
  const rows = attr?.__editing ? (attr.__draftBody || []) : (attr?.body || []);
  let obtenido = 0;
  let cuentaMax = 0;

  for (const row of rows) {
    if (!Array.isArray(row)) continue;

    const cellCheck  = row.find(c => c?.type === 'check');
    const cellNumber = row.find(c => c?.type === 'number');

    // Puntaje obtenido: suma de la columna number
    obtenido += toNumber(cellNumber?.value);

    // Máximo: cuenta SI/NO (descarta N/A)
    const chk = normalizeCheck(cellCheck?.value);
    if (chk === 'si' || chk === 'no') cuentaMax += 1;
  }

  const maxPorItem = attr?.maxScore ?? MCHECK_MAX_PER_ITEM;
  const maximo = cuentaMax * maxPorItem;
  const desempeno = maximo > 0 ? `${Math.round((obtenido / maximo) * 100)}%` : '0%';

  return { obtenido, maximo, desempeno };
}

// total de columnas de la matriz (suma colspans de la primera fila del header)
function getMCheckColCount(attr) {
  const hdr = (attr?.headers?.[0] ?? []);
  return hdr.reduce((sum, c) => sum + (Number(c?.colspan ?? 1) || 1), 0);
}

// índice (0-based) de la columna cuyo label coincide (case-insensitive) con "Puntaje"
function puntajeColIndex(attr) {
  const hdr = (attr?.headers?.[0] ?? []);
  let idx = 0;
  for (const c of hdr) {
    const span = Number(c?.colspan ?? 1) || 1;
    const label = (c?.label ?? '').toString().trim().toLowerCase();
    if (label === 'puntaje') return idx;   // primer índice ocupado por esa celda
    idx += span;
  }
  // fallback si no se encuentra el header "Puntaje": por defecto 3 (N°, Elementos, Check, Puntaje)
  return 3;
}

function cellAlign(cell) {
  // soporta "text-align", "textAlign" y el typo "text-aling"
  const v = cell?.['text-align'] ?? cell?.textAlign ?? cell?.['text-aling'];
  if (v === 'left') return 'left';
  if (v === 'right') return 'right';
  // por defecto centrado
  return 'center';
}

// === helpers para matrizCheck ===
function getMCheckIndexes(attr) {
  // intenta detectar dinámicamente
  const firstRow = (attr.__editing ? attr.__draftBody : attr.body)?.[0] || [];
  let checkIdx = firstRow.findIndex(c => (c?.type || '').toLowerCase() === 'check');
  let numIdx   = firstRow.findIndex(c => (c?.type || '').toLowerCase() === 'number');
  if (checkIdx < 0) checkIdx = 2;   // fallback
  if (numIdx   < 0) numIdx   = 3;   // fallback
  return { checkIdx, numIdx };
}

function ensureFooter(attr) {
  if (!Array.isArray(attr.footer)) attr.footer = [];
  // Garantiza 3 filas/objetos
  const def = [
    { label: 'Puntaje Obtenido', value: 0, colspan: 2, puntajeObtenido: 0 },
    { label: 'Puntaje Máximo',   value: 0, colspan: 2, puntajeMaximo: 0 },
    { label: 'Desempeño',        value: '0%', colspan: 2, desempeno: '0%' }
  ];
  for (let i = 0; i < def.length; i++) {
    if (!attr.footer[i]) attr.footer[i] = { ...def[i] };
    // llena claves si faltan
    attr.footer[i] = { ...def[i], ...attr.footer[i] };
  }
  return attr.footer;
}

function recomputeAndPersistMCheck(attr) {
  const body = (attr.__editing ? attr.__draftBody : attr.body) || [];
  const { checkIdx, numIdx } = getMCheckIndexes(attr);
  const maxPorItem = Number(attr.maxPuntaje || 10);

  let obtenido = 0;
  let maximo   = 0;

  for (const row of body) {
    const c = (row?.[checkIdx]?.value ?? '').toString().trim().toUpperCase();
    const n = Number(row?.[numIdx]?.value ?? 0);
    if (Number.isFinite(n)) obtenido += n;
    if (c === 'SI' || c === 'NO') maximo += maxPorItem; // descuenta N/A
  }

  const porc = maximo > 0 ? Math.round((obtenido / maximo) * 100) : 0;

  const f = ensureFooter(attr);
  // fila 0: obtenido
  f[0].value            = obtenido;
  f[0].puntajeObtenido  = obtenido;

  // fila 1: máximo
  f[1].value            = maximo;
  f[1].puntajeMaximo    = maximo;

  // fila 2: desempeño
  f[2].value            = `${porc}%`;
  f[2].desempeno        = `${porc}%`;
  // opcional: valor numérico sin símbolo, por si lo quieres manipular luego
  f[2].desempenoNum     = porc;
}

// 1) NUEVO: valida que TODOS los photoCapture tengan al menos 1 foto
function validarFotosRequeridas () {
  const faltantes = [];

  surveyDetailStore.surveyDetail.forEach(survey => {
    const segmentos = getSegmentos(survey);
    (segmentos || []).forEach(seg => {
      (seg.attributes || []).forEach(attr => {
        if (attr?.type === 'photoCapture') {
          const req   = Number(attr.obligatorioFotos ?? 1);      // por defecto 1
          const tiene = Array.isArray(attr.galeria) ? attr.galeria.length : 0;

          // Si quieres que solo sea obligatorio cuando req > 0, usa: if (req > 0 && tiene < req)
          if (tiene < req) {
            faltantes.push(`• ${seg.label} (mín: ${req}, tiene: ${tiene})`);
          }
        }
      });
    });
  });

  if (faltantes.length) {
    alert(
      'Faltan fotos obligatorias en los siguientes ítems:\n\n' +
      faltantes.join('\n')
    );
    return false;
  }
  return true;
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

.estado-select-label {
  font-weight: 700;
}

.estado-option--conexion {
  color: #1565c0 !important;
}

.estado-option--trabajo-especial {
  color: #3949ab !important;
}

.estado-option--ejecucion {
  color: #ef6c00 !important;
}

.estado-option--reactivacion {
  color: #2e7d32 !important;
}

.estado-option--prodoral {
  color: #d84315 !important;
}

.estado-option--en-continuacion {
  color: #00838f !important;
}

:deep(.estado-option--conexion) {
  color: #1565c0 !important;
}

:deep(.estado-option--trabajo-especial) {
  color: #3949ab !important;
}

:deep(.estado-option--ejecucion) {
  color: #ef6c00 !important;
}

:deep(.estado-option--reactivacion) {
  color: #2e7d32 !important;
}

:deep(.estado-option--prodoral) {
  color: #d84315 !important;
}

:deep(.estado-option--en-continuacion) {
  color: #00838f !important;
}

</style>
