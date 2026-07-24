<template>
  <v-container
    fluid
    class="pa-0 fill-height bg-white"
    style="height: 752px !important; overflow: hidden;"
  >
    <v-row
      no-gutters
      class="fill-height"
      style="height: 100%; border-radius: 12px; overflow: hidden;"
    >
      <!-- 👈 COLUMNA 1: JERARQUÍA Area / Familia / Templates -->
      <v-col
        cols="12"
        md="4"
        class="fill-height border-right bg-white d-flex flex-column"
      >
        <v-toolbar
          color="primary"
          density="compact"
          flat
        >
          <v-icon
            start
            icon="mdi-file-tree"
            class="ml-2"
          />
          <v-toolbar-title
            v-if="$vuetify.display.mdAndUp"
            class="text-subtitle-2 font-weight-bold"
          >
            TEMPLATES
          </v-toolbar-title>
          <v-spacer />
          <!-- BUSCADOR EN TOOLBAR (NUEVO) -->
          <v-text-field
            v-model="searchTemplate"
            placeholder="Filtrar..."
            density="compact"
            variant="solo"
            prepend-inner-icon="mdi-magnify"
            hide-details
            clearable
            flat
            class="mx-1"
            style="max-width: 160px; font-size: 0.75rem;"
          />
        </v-toolbar>

        <!-- SELECCIÓN Y BÚSQUEDA (FIJO AL TOP) -->
        <div class="pa-3 border-b bg-grey-lighten-4">
          <v-label class="text-caption mb-1 font-weight-black text-primary">
            1. ÁREA
          </v-label>
          <v-select
            v-model="selectedArea"
            :items="areasFiltradas"
            :item-title="item => `${item.name_area} (${item.count_templates || 0})`"
            item-value="id_area"
            variant="outlined"
            density="compact"
            bg-color="white"
            class="mb-2"
            hide-details
          />

          <v-label class="text-caption mb-1 font-weight-black text-primary">
            2. FAMILIA
          </v-label>
          <v-select
            v-model="selectedFamily"
            :items="families"
            :loading="loadingFamilies"
            :disabled="!selectedArea"
            :item-title="item => `${item.name_tipo_srv} (${item.count_templates || 0})`"
            item-value="id_tipo_srv"
            variant="outlined"
            density="compact"
            bg-color="white"
            class="mb-0"
            hide-details
          />
        </div>

        <!-- LISTA SCROLLABLE -->
        <div class="flex-grow-1 overflow-y-auto pa-2 bg-white">
          <div class="px-2 pb-2 d-flex justify-space-between align-center">
            <span class="text-caption font-weight-bold text-primary">
              TEMPLATES ({{ templatesFiltered.length }})
            </span>
          </div>

          <v-list
            v-if="templatesFiltered.length"
            density="compact"
            nav
            class="pa-0"
          >
            <v-list-item
              v-for="tmpl in templatesFiltered"
              :key="tmpl.id_template"
              :value="tmpl.id_template"
              :active="selectedTemplate?.id_template === tmpl.id_template"
              color="primary"
              variant="tonal"
              class="mb-1 rounded-lg border"
              @click="selectTemplate(tmpl)"
            >
              <template #prepend>
                <div class="bg-primary-lighten-4 text-primary px-2 py-1 rounded text-caption font-weight-bold mr-2">
                  ID: {{ tmpl.id_template }}
                </div>
              </template>
              
              <v-list-item-title class="text-caption font-weight-bold">
                {{ tmpl.name_template_srv }}
              </v-list-item-title>
              
              <v-list-item-subtitle
                class="text-tiny d-flex align-center flex-wrap mt-1"
                style="font-size: 0.7rem;"
              >
                <span class="mr-1 mb-1">Flujo:</span>
                <v-chip
                  size="x-small"
                  color="deep-purple-accent-3"
                  variant="flat"
                  class="px-2 mb-1 text-white font-weight-bold mr-2"
                  @click.stop="openFlowDetail(tmpl)"
                >
                  {{ tmpl.id_flow_tmpl || tmpl.id_flow || 'N/A' }}
                  <span
                    v-if="tmpl.flow_tmpl_name"
                    class="ml-1 opacity-90 border-l pl-1 ml-1"
                  >
                    {{ tmpl.flow_tmpl_name }}
                  </span>
                </v-chip>
                
                <v-btn
                  size="x-small"
                  color="primary"
                  variant="tonal"
                  class="mb-1 px-2 font-weight-bold"
                  prepend-icon="mdi-pencil"
                  @click.stop="openEditDialog(tmpl)"
                >
                  MODIFICAR ATRIBUTOS
                </v-btn>
                
                <v-chip
                  v-if="tmpl.flag_autonomo"
                  size="x-small"
                  color="success"
                  variant="flat"
                  class="ml-2 mb-1 px-2 font-weight-bold"
                >
                  <v-icon
                    start
                    icon="mdi-cellphone-wireless"
                    size="12"
                    class="mr-1"
                  />
                  Ejecución no Programada
                </v-chip>
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
          
          <div
            v-else-if="selectedFamily"
            class="text-center pa-5 text-grey"
          >
            <v-icon
              icon="mdi-file-hidden"
              size="48"
              class="mb-2"
              color="grey-lighten-1"
            />
            <div class="text-caption">
              No hay templates en esta familia
            </div>
          </div>
          
          <div
            v-else
            class="text-center pa-5 text-grey"
          >
            <v-icon
              icon="mdi-arrow-up-bold-outline"
              size="48"
              class="mb-2"
              color="grey-lighten-2"
            />
            <div class="text-caption">
              Seleccione jerarquía arriba
            </div>
          </div>
        </div>
      </v-col>

      <!-- 📝 COLUMNA 2: JSON body_seed View -->
      <v-col
        cols="12"
        md="4"
        class="fill-height border-right d-flex flex-column bg-grey-lighten-5"
      >
        <v-toolbar
          color="grey-darken-3"
          density="compact"
          flat
        >
          <v-icon
            start
            icon="mdi-code-json"
            class="ml-2"
            color="warning"
          />
          <v-toolbar-title class="text-subtitle-2 font-weight-bold text-white">
            ESTRUCTURA (BODY_SEED)
          </v-toolbar-title>
          <v-spacer />
          <v-btn
            v-if="selectedTemplate"
            icon="mdi-content-copy"
            size="x-small"
            variant="text"
            color="white"
            @click="copyJson"
          />
        </v-toolbar>

        <div
          v-if="selectedTemplate"
          class="flex-grow-1 overflow-auto pa-2 d-flex justify-center"
        >
          <!-- Visor Editable de JSON -->
          <div class="json-frame shadow-lg rounded-lg border">
            <v-textarea
              v-model="localJson"
              class="json-editor-textarea h-100"
              variant="plain"
              density="compact"
              spellcheck="false"
              hide-details
              no-resize
            />
          </div>
        </div>
        
        <v-sheet
          v-else
          class="flex-grow-1 d-flex align-center justify-center bg-transparent"
        >
          <div class="text-center text-grey">
            <v-icon
              icon="mdi-xml"
              size="64"
              color="grey-lighten-3"
            />
            <p>Seleccione un template para ver su JSON</p>
          </div>
        </v-sheet>
      </v-col>

      <!-- 👁️ COLUMNA 3: VISTA WEB (PREVIEW) -->
      <v-col
        cols="12"
        md="4"
        class="fill-height d-flex flex-column bg-white"
      >
        <v-toolbar
          color="blue-grey-darken-3"
          density="compact"
          flat
        >
          <v-icon
            start
            icon="mdi-cellphone"
            class="ml-2"
            color="success"
          />
          <v-toolbar-title class="text-subtitle-2 font-weight-bold text-white">
            VISTA PREVIA APP
          </v-toolbar-title>
        </v-toolbar>

        <div
          v-if="selectedTemplate"
          class="flex-grow-1 overflow-auto bg-grey-lighten-3 pa-2"
        >
          <!-- Solo Vista App (PWA) por ahora -->
          <div class="pwa-preview-container d-flex justify-center">
            <div class="mobile-frame elevation-10 shadow-lg">
              <PwaPreview
                v-if="readyForPreview"
                key="template-preview-pwa"
              />
            </div>
          </div>
        </div>
        
        <v-sheet
          v-else
          class="flex-grow-1 d-flex align-center justify-center bg-transparent"
        >
          <div class="text-center text-grey">
            <v-icon
              icon="mdi-web"
              size="64"
              color="grey-lighten-3"
            />
            <p>Vista previa del documento</p>
          </div>
        </v-sheet>
      </v-col>
    </v-row>
    <!-- 🔍 DIALOG: DETALLE DE FLUJO -->
    <v-dialog
      v-model="showFlowDialog"
      max-width="500"
    >
      <v-card class="rounded-xl overflow-hidden shadow-2xl">
        <v-toolbar
          color="deep-purple-accent-3"
          density="compact"
          flat
        >
          <v-icon
            start
            icon="mdi-source-branch"
            class="ml-2"
            color="white"
          />
          <v-toolbar-title class="text-subtitle-2 font-weight-bold text-white uppercase tracking-wider">
            DETALLE DE FLUJO #{{ selectedFlowId }}
          </v-toolbar-title>
          <v-spacer />
          <v-btn
            icon="mdi-close"
            size="small"
            variant="text"
            color="white"
            @click="showFlowDialog = false"
          />
        </v-toolbar>

        <v-card-text class="bg-grey-lighten-4 pa-4">
          <!-- 🏷️ CABECERA: NOMBRE Y DESC -->
          <v-sheet
            v-if="selectedTemplateFlow"
            class="pa-3 mb-4 rounded-lg bg-white elevation-1 border-b-2 border-deep-purple-accent-3"
          >
            <div class="text-subtitle-1 font-weight-black text-deep-purple-accent-3 mb-1">
              {{ selectedTemplateFlow.flow_tmpl_name || 'Sin Nombre' }}
            </div>
            <div class="text-caption text-grey-darken-2 italic lh-tight">
              {{ selectedTemplateFlow.flow_tmpl_desc || 'Sin descripción disponible para este flujo.' }}
            </div>
          </v-sheet>

          <v-divider class="mb-4" />

          <div
            v-if="loadingFlow"
            class="d-flex justify-center py-10"
          >
            <v-progress-circular
              indeterminate
              color="deep-purple-accent-3"
            />
          </div>

          <div
            v-else-if="!flowSteps.length"
            class="text-center py-10 grey--text italic"
          >
            No se encontraron pasos para este flujo.
          </div>

          <div v-else>
            <div 
              v-for="(step, idx) in flowSteps" 
              :key="idx" 
              class="bg-white pa-3 mb-2 rounded-lg border-l-4 border-deep-purple-accent-3 elevation-1 d-flex align-center shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div
                class="bg-deep-purple-lighten-5 text-deep-purple-accent-3 rounded-circle d-flex align-center justify-center mr-3 font-weight-black"
                style="width: 28px; height: 28px; font-size: 0.8rem;"
              >
                {{ step.flow_tmpl_step_orden }}
              </div>
              <div>
                <div class="text-subtitle-2 font-weight-bold text-grey-darken-3">
                  {{ step.flow_tmpl_step_name }}:
                </div>
                <div class="text-caption text-indigo-darken-1 font-weight-medium">
                  ({{ step.name_rol || 'Sin Rol' }})
                </div>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 🖌️ DIALOG: MODIFICAR ATRIBUTOS -->
    <v-dialog
      v-model="showEditDialog"
      max-width="500"
    >
      <v-card class="rounded-xl overflow-hidden shadow-2xl">
        <v-toolbar
          color="primary"
          density="compact"
          flat
        >
          <v-icon
            start
            icon="mdi-pencil"
            class="ml-2"
          />
          <v-toolbar-title class="text-subtitle-2 font-weight-bold uppercase tracking-wider">
            MODIFICAR ATRIBUTOS
          </v-toolbar-title>
          <v-spacer />
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            @click="showEditDialog = false"
          />
        </v-toolbar>

        <v-card-text class="pa-6">
          <div class="mb-4">
            <span class="text-caption font-weight-bold text-grey">ID TEMPLATE:</span>
            <span class="ml-2 text-subtitle-2 font-weight-black text-primary">{{ editFormData.id_template }}</span>
          </div>

          <v-label class="text-caption mb-1 font-weight-black text-primary">
            Nombre del Template
          </v-label>
          <v-text-field
            v-model="editFormData.name_template_srv"
            variant="outlined"
            density="compact"
            class="mb-3"
            hide-details
          />

          <v-label class="text-caption mb-1 font-weight-black text-primary">
            Código
          </v-label>
          <v-text-field
            v-model="editFormData.codi_template_srv"
            variant="outlined"
            density="compact"
            class="mb-3"
            hide-details
          />

          <v-label class="text-caption mb-1 font-weight-black text-primary">
            Descripción
          </v-label>
          <v-textarea
            v-model="editFormData.desc_template_srv"
            variant="outlined"
            density="compact"
            rows="3"
            class="mb-3"
            hide-details
          />

          <v-label class="text-caption mb-1 font-weight-black text-primary">
            Familia (Tipo Template)
          </v-label>
          <v-select
            v-model="editFormData.id_tipo_srv"
            :items="families"
            item-title="name_tipo_srv"
            item-value="id_tipo_srv"
            variant="outlined"
            density="compact"
            hide-details
          />
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-spacer />
          <v-btn
            variant="text"
            class="text-none"
            @click="showEditDialog = false"
          >
            Cancelar
          </v-btn>
          <v-btn 
            color="primary" 
            variant="flat" 
            class="text-none px-6" 
            height="40"
            :loading="savingAttributes"
            @click="saveTemplateAttributes"
          >
            Guardar Cambios
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar para notificaciones -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3000"
      rounded="pill"
    >
      {{ snackbar.text }}
      <template #actions>
        <v-btn
          variant="text"
          @click="snackbar.show = false"
        >
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, watch, computed, onMounted, reactive } from 'vue'
import apiAxios from '@/services/api'
import { useSurveyDetailStore } from '@/stores/surveyDetail'
import PwaPreview from './PwaPreview.vue'

const surveyDetailStore = useSurveyDetailStore()

/* --- State --- */
const areas = ref([])
const selectedArea = ref(null)

const families = ref([])
const selectedFamily = ref(null)
const loadingFamilies = ref(false)

const templates = ref([])
const selectedTemplate = ref(null)
const loadingTemplates = ref(false)
const searchTemplate = ref('')

const localJson = ref('')
const readyForPreview = ref(false)

// Estado del Flujo
const showFlowDialog = ref(false)
const selectedFlowId = ref(null)
const selectedTemplateFlow = ref(null)
const flowSteps = ref([])
const loadingFlow = ref(false)

// Estado para Edición de Atributos
const showEditDialog = ref(false)
const savingAttributes = ref(false)
const editFormData = reactive({
  id_template: null,
  name_template_srv: '',
  codi_template_srv: '',
  desc_template_srv: '',
  id_tipo_srv: null
})

// Snackbar
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

/* --- Computed --- */
const areasFiltradas = computed(() => {
  return areas.value
})

const templatesFiltered = computed(() => {
  const list = templates.value || []
  if (!searchTemplate.value) return list
  const search = searchTemplate.value.toLowerCase()
  return list.filter(t => 
    String(t.id_template || '').toLowerCase().includes(search) || 
    (t.name_template_srv || '').toLowerCase().includes(search)
  )
})

const formattedJson = computed(() => {
  if (!selectedTemplate.value?.body_seed) return ''
  try {
    const obj = typeof selectedTemplate.value.body_seed === 'string' 
      ? JSON.parse(selectedTemplate.value.body_seed) 
      : selectedTemplate.value.body_seed
    return JSON.stringify(obj, null, 2)
  } catch (e) {
    return 'JSON Inválido o vacío'
  }
})

/* --- Watchers --- */
watch(selectedArea, async (val) => {
  selectedFamily.value = null
  selectedTemplate.value = null
  families.value = []
  templates.value = []
  readyForPreview.value = false
  if (val) await fetchFamilies(val)
})

watch(selectedFamily, async (val) => {
  selectedTemplate.value = null
  templates.value = []
  readyForPreview.value = false
  if (val) await fetchTemplates(val)
})

/* --- Methods --- */
async function fetchAreas() {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerAreas?id_empresa=2')
    areas.value = (data || []).sort((a, b) => 
      (a.name_area || '').localeCompare(b.name_area || '')
    )
  } catch (e) {
    console.error('fetchAreas', e)
  }
}

async function fetchFamilies(areaId) {
  loadingFamilies.value = true
  try {
    const { data } = await apiAxios.get(`/servicio/leanglobal/obtenerTipoTemplate?id_area=${areaId}`)
    families.value = (data || [])
      .sort((a, b) => (a.name_tipo_srv || '').localeCompare(b.name_tipo_srv || ''))
  } catch (e) {
    console.error('fetchFamilies', e)
  } finally {
    loadingFamilies.value = false
  }
}

async function fetchTemplates(familyId) {
  loadingTemplates.value = true
  try {
    const { data } = await apiAxios.get(`/servicio/leanglobal/obtenerTemplates?id_tipo_srv=${familyId}`)
    templates.value = (data || []).sort((a, b) => 
      (a.name_template_srv || '').localeCompare(b.name_template_srv || '')
    )
  } catch (e) {
    console.error('fetchTemplates', e)
  } finally {
    loadingTemplates.value = false
  }
}

function selectTemplate(tmpl) {
  selectedTemplate.value = tmpl
  const body = tmpl.body_seed ? (typeof tmpl.body_seed === 'string' ? JSON.parse(tmpl.body_seed) : tmpl.body_seed) : {}
  localJson.value = JSON.stringify(body, null, 2)
  updatePreview(body)
}

function updatePreview(bodyObj) {
  readyForPreview.value = false
  
  const tmpl = selectedTemplate.value
  
  surveyDetailStore.surveyDetail = [{
    id_survey: 999999,
    id_template: tmpl.id_template,
    name_template_srv: tmpl.name_template_srv,
    desc_template_srv: tmpl.desc_template_srv || tmpl.name_template_srv,
    codi_template_srv: tmpl.codi_template_srv || 'TMPL-PREVIEW',
    name_area: areas.value.find(a => Number(a.id_area) === Number(selectedArea.value))?.name_area || '',
    name_tipo_srv: families.value.find(f => Number(f.id_tipo_srv) === Number(selectedFamily.value))?.name_tipo_srv || '',
    name_empresa_cliente: 'Vista Previa Genérica',
    nombre_proyecto: 'Proyecto Demo',
    body_exec: bodyObj, 
    fecha_plan_ini: '2024-01-01',
    fecha_plan_fin: '2024-12-31'
  }]
  
  setTimeout(() => {
    readyForPreview.value = true
  }, 100)
}

// Watcher para edición en vivo del JSON
let debounceTimer = null
watch(localJson, (newVal) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    try {
      const obj = JSON.parse(newVal)
      updatePreview(obj)
    } catch (e) {
      // JSON inválido mientras se escribe, no actualizamos la preview
    }
  }, 500) // 500ms de espera antes de refrescar
})

async function copyJson() {
  await navigator.clipboard.writeText(localJson.value)
}

async function openFlowDetail(template) {
  const flowId = template.id_flow_tmpl || template.id_flow
  if (!flowId || flowId === 'N/A') return
  
  selectedFlowId.value = flowId
  selectedTemplateFlow.value = { ...template } // Base inicial por si ya tiene datos
  showFlowDialog.value = true
  loadingFlow.value = true
  flowSteps.value = []
  
  try {
    // 1. Obtener metadatos (Nombre y Desc) si no los tiene
    if (!template.flow_tmpl_name) {
      try {
        const { data: meta } = await apiAxios.get(`/servicio/leanglobal/obtenerFlujoTemplates?id_flow_tmpl=${flowId}`)
        if (Array.isArray(meta) && meta.length > 0) {
          selectedTemplateFlow.value = { ...selectedTemplateFlow.value, ...meta[0] }
        }
      } catch (e) {
        console.warn('Metadata fetch failed, using defaults', e)
      }
    }

    // 2. Obtener pasos desde la tabla de plantillas (tflw_template_steps)
    const { data: stepsTmpl } = await apiAxios.get(`/servicio/leanglobal/obtenerFlujoTemplateSteps?id_flow_tmpl=${flowId}`)
    
    let finalSteps = Array.isArray(stepsTmpl) ? stepsTmpl : []
    
    // Fallback por si la tabla de plantillas está vacía pero hay una instancia ejecutada
    if (finalSteps.length === 0) {
      const { data: stepsExec } = await apiAxios.get(`/servicio/leanglobal/flujosAprobacionSteps?id_flow=${flowId}`)
      finalSteps = Array.isArray(stepsExec) ? stepsExec : []
    }

    // Ordenar por flow_tmpl_step_orden
    flowSteps.value = finalSteps.sort((a, b) => 
      (Number(a.flow_tmpl_step_orden) || 0) - (Number(b.flow_tmpl_step_orden) || 0)
    )
  } catch (e) {
    console.error('Error fetching flow details:', e)
  } finally {
    loadingFlow.value = false
  }
}

function openEditDialog(template) {
  editFormData.id_template = template.id_template
  editFormData.name_template_srv = template.name_template_srv || ''
  editFormData.codi_template_srv = template.codi_template_srv || ''
  editFormData.desc_template_srv = template.desc_template_srv || ''
  editFormData.id_tipo_srv = template.id_tipo_srv
  showEditDialog.value = true
}

async function saveTemplateAttributes() {
  if (!editFormData.id_template) return
  
  savingAttributes.value = true
  try {
    const payload = { ...editFormData }
    const { data } = await apiAxios.put(`/templates/${payload.id_template}`, payload)
    
    snackbar.value = {
      show: true,
      text: `Template "${payload.name_template_srv}" actualizado correctamente.`,
      color: 'success'
    }

    // Actualizar en la lista local
    const index = templates.value.findIndex(t => t.id_template === payload.id_template)
    if (index !== -1) {
      // Si el id_tipo_srv cambió y ya no coincide con la familia seleccionada, lo sacamos de la vista
      if (selectedFamily.value && Number(payload.id_tipo_srv) !== Number(selectedFamily.value)) {
        templates.value.splice(index, 1)
        if (selectedTemplate.value?.id_template === payload.id_template) {
          selectedTemplate.value = null
          localJson.value = ''
          readyForPreview.value = false
        }
      } else {
        // Actualizar datos del item en la lista
        templates.value[index] = { ...templates.value[index], ...data.data }
        
        // Si es el que está seleccionado, actualizar la vista principal
        if (selectedTemplate.value?.id_template === payload.id_template) {
           selectedTemplate.value = { ...selectedTemplate.value, ...data.data }
        }
      }
    }
    
    showEditDialog.value = false
  } catch (e) {
    console.error('Error updating template attributes:', e)
    snackbar.value = {
      show: true,
      text: 'Error al actualizar los atributos del template',
      color: 'error'
    }
  } finally {
    savingAttributes.value = false
  }
}

onMounted(() => {
  fetchAreas()
})
</script>

<style scoped>
.border-right {
  border-right: 1px solid rgba(0, 0, 0, 0.12);
}

.pwa-preview-container {
  width: 100%;
}

.mobile-frame {
  width: 320px; 
  height: 640px; /* Reducido de 720px */
  background: #f5f5f5;
  border-radius: 30px;
  border: 10px solid #222; 
  overflow-y: auto;
  overflow-x: hidden;
  margin: 10px auto;
  position: relative;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.mobile-frame::-webkit-scrollbar {
  width: 4px;
}
.mobile-frame::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.2);
  border-radius: 2px;
}

.json-frame {
  width: 100%; 
  height: 640px; /* Reducido de 720px */
  background-color: #1e1e1e;
  overflow: auto;
  margin: 10px 0;
}

.json-viewer, .json-editor-textarea :deep(textarea) {
  font-family: 'Roboto Mono', monospace !important;
  font-size: 0.75rem !important;
  background-color: #1e1e1e !important;
  color: #dcdcdc !important;
  white-space: pre !important; 
  word-wrap: normal !important;
  overflow: auto !important;
  height: 640px !important;
  line-height: 1.4 !important;
}

.json-editor-textarea :deep(.v-field__input) {
  padding: 12px !important;
}

.text-tiny {
  font-size: 0.65rem;
}

.lh-1 {
  line-height: 1;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-thumb {
  background: #bbb;
  border-radius: 3px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
}
</style>
