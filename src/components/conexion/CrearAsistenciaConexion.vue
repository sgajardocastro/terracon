<template>
  <v-dialog
    v-model="dialog"
    max-width="600px"
    persistent
  >
    <v-card class="rounded-xl">
      <v-card-title class="text-h6 font-weight-bold pa-4 d-flex justify-space-between align-center">
        <span>{{ title }}</span>
        <v-btn
          icon="mdi-close"
          variant="text"
          density="compact"
          @click="close"
        />
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-4">
        <v-form
          ref="formRef"
          v-model="valid"
        >
          <v-row dense>
            <!-- Info Contextual -->
            <v-col
              v-if="localIsEditMode"
              cols="12"
            >
              <v-alert
                density="compact"
                type="info"
                variant="tonal"
                class="mb-2"
              >
                Editando registro ID Asistencia: <strong>{{ formData.id_archivo }}</strong>
              </v-alert>
            </v-col>

            <!-- Estado -->
            <v-col cols="12">
              <label class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary">Estado</label>
              <v-select
                v-model="formData.estado"
                :items="estadosPosibles"
                item-title="text"
                item-value="value"
                placeholder="Seleccionar estado"
                variant="outlined"
                density="compact"
                bg-color="grey-lighten-5"
                color="primary"
                class="sakai-input"
              >
                <template #selection="{ item }">
                  <v-chip
                    size="x-small"
                    :color="item.raw.color"
                    variant="tonal"
                    class="font-weight-bold"
                  >
                    {{ item.title }}
                  </v-chip>
                </template>
                <template #item="{ props, item }">
                  <v-list-item
                    v-bind="props"
                    :title="null"
                  >
                    <v-chip
                      size="small"
                      :color="item.raw.color"
                      variant="tonal"
                      class="font-weight-bold"
                    >
                      {{ item.title }}
                    </v-chip>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>

            <!-- Contratista -->
            <v-col cols="12">
              <label class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary">Empresa
                Contratista</label>
              <v-select
                v-model="formData.id_empresa_contratista"
                :items="empresas"
                item-title="name_empresa"
                item-value="id_empresa"
                placeholder="Seleccionar contratista"
                variant="outlined"
                density="compact"
                bg-color="grey-lighten-5"
                color="primary"
                class="sakai-input"
                :rules="[rules.required]"
              />
            </v-col>

            <!-- Archivo (Upload) -->
            <v-col cols="12">
              <label class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary">Evidencia /
                Documento</label>

              <!-- Componente de Fotos (Prioritario) -->
              <FotoCaptureConexion
                v-model:galeria="galeriaDoc"
                :max-fotos="1"
                class="mb-3"
              />

              <!-- Fallback: Input normal si prefieren subir archivo sin preview o PDF -->
              <v-expansion-panels
                v-if="galeriaDoc.length === 0"
                variant="accordion"
                class="mb-2"
              >
                <v-expansion-panel
                  elevation="0"
                  bg-color="transparent"
                >
                  <v-expansion-panel-title
                    class="text-caption pa-0"
                    style="min-height: 32px;"
                  >
                    O subir archivo (PDF / Otro)
                  </v-expansion-panel-title>
                  <v-expansion-panel-text class="pa-0">
                    <v-file-input
                      v-model="selectedFiles"
                      placeholder="Subir documento"
                      variant="outlined"
                      density="compact"
                      bg-color="grey-lighten-5"
                      color="primary"
                      class="sakai-input"
                      prepend-icon=""
                      prepend-inner-icon="mdi-paperclip"
                      :show-size="true"
                    />
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-col>

            <!-- Observaciones -->
            <v-col cols="12">
              <label
                class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary"
              >Observaciones</label>
              <v-textarea
                v-model="formData.observacion"
                placeholder="Detalles de la asistencia o novedades..."
                variant="outlined"
                density="compact"
                rows="3"
                bg-color="grey-lighten-5"
                color="primary"
                class="sakai-input"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-divider />

      <v-card-actions class="pa-4 d-flex justify-end ga-2">
        <v-btn
          variant="text"
          color="grey-darken-1"
          class="text-none font-weight-bold px-4"
          rounded="lg"
          @click="close"
        >
          Cancelar
        </v-btn>
        <v-btn
          color="primary"
          class="text-none font-weight-bold px-6"
          rounded="lg"
          elevation="0"
          :loading="loading"
          @click="handleSave"
        >
          Guardar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import api from '@/services/api';
import { useUserDetailStore } from "@/stores/userDetail";
import FotoCaptureConexion from './FotoCaptureConexion.vue';

const userDetailStore = useUserDetailStore();

const props = defineProps({
    modelValue: { type: Boolean, required: true },
    itemToEdit: { type: Object, default: () => null },
    empresaId: Number,
    proyectoId: Number
});

const emit = defineEmits(['update:modelValue', 'save']);

const dialog = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
});

const valid = ref(false);
const loading = ref(false);
const formRef = ref(null);
const selectedFiles = ref([]);
const galeriaDoc = ref([]);
const empresas = ref([]);

const estadosPosibles = [
    { text: 'PENDIENTE', value: 'PENDIENTE', color: 'warning' },
    { text: 'COMPLETADO', value: 'COMPLETADO', color: 'success' },
    { text: 'APROBADO', value: 'APROBADO', color: 'info' },
    { text: 'RECHAZADO', value: 'RECHAZADO', color: 'error' }
];

const formData = ref({
    id_archivo: null,
    id_doc: null,
    id_empresa_contratista: null,
    name_doc_orig: '',
    name_doc_interno: '',
    observacion: '',
    tipo_documento: 'REGISTRO DE ASISTENCIA',
    estado: 'COMPLETADO'
});

const rules = {
    required: v => !!v || 'Requerido'
};

const localIsEditMode = computed(() => !!props.itemToEdit);

const title = computed(() => localIsEditMode.value ? 'Editar Registro de Asistencia' : 'Nuevo Registro de Asistencia');

onMounted(() => {
    fetchEmpresas();
});

async function fetchEmpresas() {
    try {
        const res = await api.get('/servicio/leanglobal/obtenerEmpresas');
        empresas.value = res.data || [];
        empresas.value = empresas.value.filter(e => e.flag_externo === true);
    } catch (err) {
        console.error('Error fetching empresas', err);
    }
}

watch(() => props.modelValue, (isOpen) => {
    if (isOpen) {
        if (props.itemToEdit) {
            const src = props.itemToEdit;
            formData.value = {
                id_archivo: src.id_archivo,
                id_doc: src.id_doc,
                id_empresa_contratista: src.json_data?.id_empresa_contratista || null,
                name_doc_orig: src.name_doc_orig || '',
                name_doc_interno: src.name_doc_interno || '',
                observacion: src.observacion || '',
                tipo_documento: 'REGISTRO DE ASISTENCIA',
                estado: src.json_data?.estado || 'COMPLETADO'
            };

            // Populate gallery if image
            galeriaDoc.value = [];
            if (src.id_doc && isImage(src.name_doc_interno)) {
                galeriaDoc.value.push({
                    id_doc: src.id_doc,
                    url: getFileUrl(src),
                    nombre: src.name_doc_orig || 'Evidencia'
                });
            }
        } else {
            resetForm();
        }
    }
}, { immediate: true });

function resetForm() {
    formData.value = {
        id_archivo: null,
        id_doc: null,
        id_empresa_contratista: null,
        name_doc_orig: '',
        name_doc_interno: '',
        observacion: '',
        tipo_documento: 'REGISTRO DE ASISTENCIA',
        estado: 'COMPLETADO'
    };
    selectedFiles.value = [];
    galeriaDoc.value = [];
    if (formRef.value) formRef.value.resetValidation();
}

function close() {
    dialog.value = false;
    resetForm();
}

async function handleSave() {
    if (!formRef.value) return;
    const { valid: isFormValid } = await formRef.value.validate();
    if (!isFormValid) return;

    loading.value = true;
    try {
        const payload = {
            id_archivo: formData.value.id_archivo,
            id_doc: formData.value.id_doc,
            id_empresa: props.empresaId || 1,
            id_empresa_cliente: props.empresaId || 1, // Usualmente el mismo en este contexto
            id_proyecto: null, // Como pidió el usuario
            tipo_documento: 'REGISTRO DE ASISTENCIA',
            observacion: formData.value.observacion,
            version: null,
            id_usuario_creacion: userDetailStore.userDetail?.id_user || 1,
            json_data: {
                id_empresa_contratista: formData.value.id_empresa_contratista,
                estado: formData.value.estado
            }
        };

        const files = Array.isArray(selectedFiles.value) ? selectedFiles.value : (selectedFiles.value ? [selectedFiles.value] : []);

        // Priority 1: Galeria (FotoCapture)
        if (galeriaDoc.value.length > 0) {
            // New or existing photo in gallery
            const gMsg = galeriaDoc.value[0];
            if (gMsg.id_doc) {
                payload.id_doc = gMsg.id_doc;
                // Update internal name if available from response
                if (gMsg.response?.data?.archivo?.name_doc_interno) {
                    // handled in hydration, but we can assume id_doc is enough
                }
            }
        }
        // Priority 2: File Input (Manual upload)
        else if (files.length > 0) {
            const file = files[0];
            const uploadData = new FormData();
            uploadData.append('archivo', file);
            uploadData.append('tipo_doc', 'ASISTENCIA_DOC');
            uploadData.append('mimetype', file.type);
            uploadData.append('name_doc_orig', file.name);
            uploadData.append('name_doc_interno', '');
            uploadData.append('path_doc', '/u05/LeanDocs/terracon');
            uploadData.append('id_user', Number(userDetailStore.userDetail?.id_user) || 1);
            uploadData.append('estado', '1');

            const uploadRes = await api.post('/archivo/imagen', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (uploadRes.data?.archivo) {
                const arch = uploadRes.data.archivo;
                payload.id_doc = arch.id_doc;
            }
        }
        // Priority 3: Keep existing if editing and no changes
        else if (props.itemToEdit && formData.value.id_doc) {
            payload.id_doc = formData.value.id_doc;
        } else {
            // If creating and no file -> Error or logic?
            // Since we removed 'required' from file input in template (due to complex logic), 
            // we should check here if payload.id_doc is set.
            if (!payload.id_doc && !payload.id_archivo) { // if creating
                // If evidence is required:
                alert('Debe adjuntar una evidencia (foto o archivo).');
                loading.value = false;
                return;
            }
        }

        let result;
        if (localIsEditMode.value && payload.id_archivo) {
            result = await api.put(`/tfmg-archivos/${payload.id_archivo}`, payload);
        } else {
            result = await api.post('/tfmg-archivos', payload);
        }

        emit('save', result.data);
        close();
    } catch (error) {
        console.error('Error al guardar asistencia:', error);
        alert('Error al guardar el registro');
    } finally {
        loading.value = false;
    }
}

function getFileUrl(item) {
    if (!item.name_doc_interno) return '#';
    const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
    return `${baseUrl}/archivo/terracon/${item.name_doc_interno}`;
}

function isImage(filename) {
    if (!filename) return false;
    return /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(filename);
}
</script>

<style scoped>
.sakai-input :deep(.v-field__outline) {
    --v-field-border-opacity: 0.15;
}

.sakai-input :deep(.v-field--focused .v-field__outline) {
    --v-field-border-opacity: 0.8;
}
</style>
