<template>
  <div class="pwa-container bg-grey-lighten-4 fill-height">
    <div
      v-for="survey in surveyDetailStore.surveyDetail"
      :key="survey.id_survey"
      class="pb-10"
    >
      <!-- Header Estilo Mobile -->
      <div class="pwa-header elevation-2 px-4 py-2 bg-primary text-white sticky-top">
        <div class="text-h6 line-height-1">
          {{ survey.desc_template_srv }}
        </div>
        <div class="text-caption opacity-80">
          {{ survey.name_area }} / {{ survey.name_tipo_srv }}
        </div>
      </div>

      <!-- Info General -->
      <v-card
        flat
        class="ma-2 rounded-lg elevation-1 border"
      >
        <v-card-text class="text-caption py-2">
          <div class="d-flex justify-space-between border-b pb-1 mb-1">
            <span class="font-weight-bold">ID:</span>
            <span>{{ survey.id_survey }}</span>
          </div>
          <div class="d-flex justify-space-between border-b pb-1 mb-1">
            <span class="font-weight-bold">Código:</span>
            <span>{{ survey.codi_template_srv }}</span>
          </div>
          <div class="d-flex justify-space-between">
            <span class="font-weight-bold">Proyecto:</span>
            <span class="text-right ml-2">{{ survey.nombre_proyecto }}</span>
          </div>
        </v-card-text>
      </v-card>

      <!-- Segmentos (como en InspeccionBHP.vue) -->
      <div class="px-2">
        <v-expansion-panels
          variant="accordion"
          class="rounded-lg border d-block overflow-hidden elevation-1"
        >
          <v-expansion-panel
            v-for="(segmento, index) in getSegmentos(survey)"
            :key="index"
            class="pwa-segment"
          >
            <v-expansion-panel-title class="bg-white font-weight-bold py-3">
              <v-icon
                start
                :icon="segmento.touch ? 'mdi-check-circle' : 'mdi-alert-circle-outline'"
                :color="segmento.touch ? 'success' : 'warning'"
              />
              {{ segmento.label || `Segmento ${index + 1}` }}
            </v-expansion-panel-title>

            <v-expansion-panel-text class="bg-grey-lighten-5">
              <v-row
                dense
                class="py-2"
              >
                <v-col
                  v-for="(attr, i) in segmento.attributes"
                  :key="i"
                  cols="12"
                  class="mb-2"
                >
                  <!-- Etiquetas y Controles Estilo PWA -->
                  <div class="text-caption font-weight-bold text-grey-darken-2 mb-1">
                    {{ (attr.type === 'comboBox' || attr.type === 'combobox') ? (attr.values?.quest || attr.quest || attr.label || attr.text || 'Sin etiqueta') : (attr.label || attr.text || 'Sin etiqueta') }}
                    <span
                      v-if="attr.nullable === false"
                      class="text-error ml-1"
                    >*</span>
                  </div>

                  <!-- TextField / Number / Decimal -->
                  <v-text-field
                    v-if="['textField', 'number', 'decimal'].includes(attr.type)"
                    v-model="attr.default"
                    variant="outlined"
                    density="compact"
                    hide-details
                    bg-color="white"
                    placeholder="Ingrese valor..."
                    :type="attr.type === 'number' ? 'number' : 'text'"
                  />

                  <!-- TextArea -->
                  <v-textarea
                    v-else-if="attr.type === 'textArea'"
                    v-model="attr.default"
                    variant="outlined"
                    density="compact"
                    rows="3"
                    hide-details
                    bg-color="white"
                  />

                  <!-- Date Picker -->
                  <v-text-field
                    v-else-if="attr.type === 'datePicker' || attr.type === 'dateHourPicker'"
                    v-model="attr.default"
                    variant="outlined"
                    density="compact"
                    hide-details
                    bg-color="white"
                    :type="attr.type === 'datePicker' ? 'date' : 'datetime-local'"
                  />

                  <!-- CheckList -->
                  <div
                    v-else-if="attr.type === 'checkList'"
                    class="border rounded bg-white pa-2"
                  >
                    <div
                      v-for="(item, checkIdx) in attr.checkBoby"
                      :key="checkIdx"
                      class="mb-3 border-b pb-2 last-no-border"
                    >
                      <div class="text-caption mb-1">
                        {{ item.label }}
                      </div>
                      <v-btn-toggle
                        v-model="item.default"
                        mandatory
                        density="compact"
                        selected-class="bg-primary text-white"
                        class="w-100 h-auto"
                      >
                        <v-btn
                          v-for="opt in item.options"
                          :key="opt.value"
                          :value="opt.value"
                          size="small"
                          class="flex-grow-1"
                        >
                          {{ opt.label || opt.value }}
                        </v-btn>
                      </v-btn-toggle>
                    </div>
                  </div>

                  <!-- ComboBox -->
                  <v-select
                    v-else-if="attr.type === 'comboBox' || attr.type === 'combobox'"
                    v-model="attr.values.selected"
                    :items="getSelectItems(attr.values.options)"
                    item-title="label"
                    item-value="value"
                    variant="outlined"
                    density="compact"
                    hide-details
                    bg-color="white"
                    label="Seleccione..."
                  />

                  <!-- FotoCapture -->
                  <div v-else-if="attr.type === 'photoCapture'">
                    <FotoCapture
                      v-model:galeria="attr.galeria"
                      v-model:observacion="attr.obs"
                      :max-fotos="attr.maxFotos"
                      :obligatorio-fotos="0"
                    />
                  </div>

                  <!-- GeoLocation -->
                  <div v-else-if="attr.type === 'geoLocation'">
                    <GeoLocation
                      :label="attr.label"
                      :model-value="attr.default"
                      @update:model-value="(val) => attr.default = val"
                    />
                  </div>

                  <!-- FileUpload -->
                  <div v-else-if="attr.type === 'fileUpload'">
                    <FileUpload
                      v-model:archivos="attr.archivos"
                      v-model:observacion="attr.obs"
                      :max-fotos="attr.maxArchivos"
                    />
                  </div>

                  <!-- PhotoCheck (Firma/Check con Foto) -->
                  <div v-else-if="attr.type === 'photoCheck'">
                    <FotoCheck
                      v-model="attr.default"
                      :label="attr.label"
                      :galeria="attr.galeria"
                      :observacion="attr.obs"
                      :options="attr.options"
                      @update:galeria="val => attr.galeria = val"
                      @update:observacion="val => attr.obs = val"
                    />
                  </div>

                  <div
                    v-else-if="attr.type === 'newLine'"
                    style="padding-top: 5px;"
                  >
                    <hr class="my-2 border-dashed">
                  </div>

                  <!-- QR Scan -->
                  <div v-else-if="attr.type === 'qr'">
                    <LeerQr />
                  </div>

                  <!-- Componentes de Seguridad / Específicos -->
                  <CheckListTecles
                    v-else-if="['checkListTecles', 'checkListTecle', 'CHECK LIST TECLES'].includes(attr.type)"
                    :attr="attr"
                  />

                  <IngresoZanja
                    v-else-if="attr.type === 'ingresoZanja'"
                    :attr="attr"
                  />
                  <ChequeoExtensionElectrica
                    v-else-if="attr.type === 'chequeoExtensionElectrica'"
                    :attr="attr"
                  />
                  <CheckMonofasicoTrifasico
                    v-else-if="attr.type === 'checkMonofasicoTrifasico'"
                    :attr="attr"
                  />
                  <Vibropison
                    v-else-if="attr.type === 'vibropison'"
                    :attr="attr"
                  />
                  <ChequeoSeguridadBetonera
                    v-else-if="attr.type === 'chequeoSeguridadBetonera'"
                    :attr="attr"
                  />
                  <CheckeoMartilloDemoledor
                    v-else-if="attr.type === 'checkeoMartilloDemoledor'"
                    :attr="attr"
                  />
                  <CheckEquiposIluminacion
                    v-else-if="attr.type === 'checkEquiposIluminacion'"
                    :attr="attr"
                  />
                  <CheckDispensadorAguaPotable
                    v-else-if="attr.type === 'checkDispensadorAguaPotable'"
                    :attr="attr"
                  />
                  <CheckListHerramientasManuales
                    v-else-if="['checkListHerramientasManuales', 'checklistHerramientasManuales', 'CHECK LIST HERRAMIENTAS MANUALES'].includes(attr.type)"
                    :attr="attr"
                  />
                  <ListaInspeccionCamion
                    v-else-if="['listaInspeccionCamion', 'LISTA INSPECCION CAMION'].includes(attr.type)"
                    :attr="attr"
                  />
                  
                  <MatrizMAObsyRecomenaciones
                    v-else-if="['matrizMAObsyRecomenaciones', 'matrizMAObsyRecomendaciones'].includes(attr.type)"
                    :attr="attr"
                  />

                  <!-- Matrices -->
                  <MatrizCombustible
                    v-else-if="attr.type === 'matrizCombustible'"
                    :attr="attr"
                  />
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
                  
                  <!-- Photo (Static image) -->
                  <div
                    v-else-if="attr.type === 'photo'"
                    class="pb-2"
                  >
                    <v-img
                      :src="attr.src"
                      width="100%"
                      class="rounded-lg border"
                      cover
                      aspect-ratio="16/9"
                    />
                  </div>

                  <!-- Asignación / Estructura Multiple -->
                  <AsignarEquipo
                    v-else-if="attr.type === 'asignarEquipo'"
                    :attr="attr"
                  />
                  <EstructuraMultiple
                    v-else-if="attr.type === 'resgistroAdd'"
                    :attr="attr"
                  />

                  <!-- Labels -->
                  <div
                    v-else-if="attr.type.startsWith('labelLine')"
                    class="pa-2 bg-grey-lighten-3 rounded border-s-lg border-primary"
                  >
                    <component
                      :is="getHeaderTag(attr.type)"
                      class="ma-0"
                    >
                      {{ attr.text }}
                    </component>
                  </div>

                  <!-- Otros (Placeholders) -->
                  <v-sheet
                    v-else
                    border
                    class="pa-4 d-flex align-center justify-center bg-grey-lighten-4 rounded dashed"
                  >
                    <div class="text-caption text-grey text-center">
                      <v-icon
                        :icon="getTypeIcon(attr.type)"
                        class="mb-1"
                      />
                      <div>Elemento: {{ attr.type }}</div>
                    </div>
                  </v-sheet>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useSurveyDetailStore } from '@/stores/surveyDetail'
import FotoCapture from '@/components/inspeccion/FotoCapture.vue'
import FotoCheck from '@/components/inspeccion/FotoCheck.vue'
import GeoLocation from '@/components/inspeccion/GeoLocation.vue'
import FileUpload from '@/components/inspeccion/FileUpload.vue'
import LeerQr from '@/components/inspeccion/LeerQr.vue'
import MatrizEditable from '@/components/inspeccion/MatrizEditable.vue'
import MatrizCombustible from '@/components/inspeccion/MatrizCombustible.vue'
import MatrizExcavaciones from '@/components/inspeccion/MatrizExcavaciones.vue'
import MatrizBorewrap from '@/components/inspeccion/MatrizBorewrap.vue'
import MatrizTransp from '@/components/inspeccion/MatrizTransp.vue'
import MatrizGranallado from '@/components/inspeccion/MatrizGranallado.vue'
import MatrizProtal from '@/components/inspeccion/MatrizProtal.vue'
import MatrizPolypipe from '@/components/inspeccion/MatrizPolypipe.vue'
import MatrizSoldadura from '@/components/inspeccion/MatrizSoldadura.vue'
import MatrizCheck from '@/components/inspeccion/MatrizCheck.vue'
import AsignarEquipo from '@/components/inspeccion/AsignarEquipo.vue'
import EstructuraMultiple from '@/components/inspeccion/EstructuraMultiple.vue'
import CheckListTecles from '@/components/inspeccion/CheckListTecles.vue'
import IngresoZanja from '@/components/inspeccion/IngresoZanja.vue'
import ChequeoExtensionElectrica from '@/components/inspeccion/ChequeoExtensionElectrica.vue'
import CheckMonofasicoTrifasico from '@/components/inspeccion/CheckMonofasicoTrifasico.vue'
import Vibropison from '@/components/inspeccion/Vibropison.vue'
import ChequeoSeguridadBetonera from '@/components/inspeccion/ChequeoSeguridadBetonera.vue'
import CheckeoMartilloDemoledor from '@/components/inspeccion/CheckeoMartilloDemoledor.vue'
import CheckEquiposIluminacion from '@/components/inspeccion/CheckEquiposIluminacion.vue'
import CheckDispensadorAguaPotable from '@/components/inspeccion/CheckDispensadorAguaPotable.vue'
import CheckListHerramientasManuales from '@/components/inspeccion/CheckListHerramientasManuales.vue'
import ListaInspeccionCamion from '@/components/inspeccion/ListaInspeccionCamion.vue'
import MatrizMAObsyRecomenaciones from '@/components/inspeccion/MatrizMAObsyRecomenaciones.vue'

const surveyDetailStore = useSurveyDetailStore()

const getSegmentos = (survey) => {
  try {
    const body = survey.body_exec
    return Array.isArray(body?.segmentos) ? body.segmentos : []
  } catch (e) {
    return []
  }
}

const getHeaderTag = (type) => {
  if (type === 'labelLineH1') return 'h1'
  if (type === 'labelLineH2') return 'h2'
  if (type === 'labelLineH3') return 'h3'
  if (type === 'labelLineH4') return 'h4'
  if (type === 'labelLineH5') return 'h5'
  return 'div'
}

const getSelectItems = (options) => {
  return (options || []).map(opt => {
    if (typeof opt === 'object') {
      return { label: opt.label || opt.name || opt.value, value: opt.value || opt.id }
    }
    return { label: String(opt), value: opt }
  })
}

const getTypeIcon = (type) => {
  if (type === 'photoCapture') return 'mdi-camera'
  if (type === 'photoCheck') return 'mdi-camera-check'
  if (type === 'geoLocation') return 'mdi-map-marker'
  if (type === 'fileUpload') return 'mdi-file-upload'
  if (type === 'qr') return 'mdi-qrcode-scan'
  if (type.includes('matriz')) return 'mdi-grid'
  return 'mdi-widgets-outline'
}
</script>

<style scoped>
.pwa-container {
  font-family: 'Roboto', sans-serif;
  user-select: none;
}

.pwa-header {
  height: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.sticky-top {
  position: sticky;
  top: 0;
  z-index: 10;
}

.line-height-1 {
  line-height: 1.1;
  font-size: 1.1rem;
}

.dashed {
  border-style: dashed !important;
  border-width: 2px !important;
}

.pwa-segment {
  border-bottom: 1px solid rgba(0,0,0,0.05) !important;
}

.last-no-border:last-child {
  border-bottom: none !important;
}

.opacity-80 {
  opacity: 0.8;
}

/* Custom Scrollbar */
.pwa-container::-webkit-scrollbar {
  width: 4px;
}
.pwa-container::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 2px;
}
</style>
