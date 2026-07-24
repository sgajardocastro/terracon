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
                Editando documento: <strong>{{ formData.name_doc_orig }}</strong>
              </v-alert>
            </v-col>

            <!-- Vehículo / Conductor -->
            <v-col cols="12">
              <label class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary">Vehículo /
                Conductor</label>
              <v-select
                v-model="formData.id_conductor"
                :items="conductores"
                item-title="label"
                item-value="id"
                placeholder="Seleccionar vehículo o responsable"
                variant="outlined"
                density="compact"
                bg-color="grey-lighten-5"
                color="primary"
                class="sakai-input"
                :rules="[rules.required]"
              />
            </v-col>

            <!-- Tipo de Documento -->
            <v-col
              cols="12"
              sm="6"
            >
              <label class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary">Tipo de
                Documento</label>
              <v-select
                v-model="formData.tipo_detalle"
                :items="tiposDocumento"
                placeholder="Seleccionar tipo"
                variant="outlined"
                density="compact"
                bg-color="grey-lighten-5"
                color="primary"
                class="sakai-input"
                :rules="[rules.required]"
              />
            </v-col>

            <!-- Fecha Vencimiento -->
            <v-col
              cols="12"
              sm="6"
            >
              <label class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary">Fecha
                Vencimiento</label>
              <v-text-field
                v-model="formData.fecha_vencimiento"
                type="date"
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
              <label class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary">Documento
                (PDF/Imagen)</label>

              <!-- Documento Actual -->
              <div
                v-if="formData.name_doc_interno"
                class="mb-3 pa-2 border rounded bg-light d-flex align-center"
              >
                <v-icon
                  color="primary"
                  class="mr-2"
                >
                  mdi-file-eye-outline
                </v-icon>
                <div class="flex-grow-1">
                  <div class="text-caption font-weight-bold">
                    Archivo actual:
                  </div>
                  <a
                    :href="getFileUrl(formData)"
                    target="_blank"
                    class="text-caption text-primary text-decoration-underline"
                  >
                    {{ formData.name_doc_orig || 'Ver documento' }}
                  </a>
                </div>
              </div>

              <v-file-input
                v-model="selectedFiles"
                :placeholder="formData.name_doc_interno ? 'Reemplazar documento' : 'Subir archivo'"
                accept=".pdf,image/*"
                variant="outlined"
                density="compact"
                bg-color="grey-lighten-5"
                color="primary"
                class="sakai-input"
                prepend-icon=""
                prepend-inner-icon="mdi-upload"
                :show-size="true"
                :rules="localIsEditMode ? [rules.allowedFile] : [rules.requiredFile, rules.allowedFile]"
              />
            </v-col>

            <!-- Observaciones -->
            <v-col cols="12">
              <label
                class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary"
              >Observaciones</label>
              <v-textarea
                v-model="formData.observacion"
                placeholder="Detalles adicionales..."
                variant="outlined"
                density="compact"
                rows="2"
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
import { ref, watch, computed } from 'vue';
import api from '@/services/api';
import { useUserDetailStore } from "@/stores/userDetail";

const userDetailStore = useUserDetailStore();

const props = defineProps({
    modelValue: { type: Boolean, required: true },
    itemToEdit: { type: Object, default: () => null }
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

// Datos de prueba para conductores/vehículos
const conductores = [
    { id: 101, label: 'JUAN PEREZ (AB-CD-12) - CAMIONETA' },
    { id: 102, label: 'MARIA LOPEZ (ZX-99-88) - CAMION' },
    { id: 103, label: 'CARLOS DIAZ (DD-FF-55) - AUTO' }
];

const tiposDocumento = [
    'Revisión Técnica',
    'Permiso Circulación',
    'Seguro Obligatorio',
    'Certificado de Gases',
    'Póliza de Seguro',
    'Licencia de Conducir'
];

const formData = ref({
    id_archivo: null,
    id_conductor: null,
    tipo_detalle: null,
    fecha_vencimiento: '',
    name_doc_orig: '',
    name_doc_interno: '',
    observacion: '',
    tipo_documento: 'EQUIPOS MOVILES',
});

const rules = {
    required: v => !!v || 'Requerido',
    requiredFile: v => hasSelectedFile(v) || 'Debe adjuntar un archivo',
    allowedFile: v => {
        const file = getFirstSelectedFile(v);
        return !file || isAllowedDocumentFile(file) || 'Solo se permiten archivos PDF o imágenes';
    }
};

const localIsEditMode = computed(() => !!props.itemToEdit);
const title = computed(() => localIsEditMode.value ? 'Editar Documento Equipo' : 'Nuevo Documento Equipo Móvil');

watch(() => props.modelValue, (isOpen) => {
    if (isOpen) {
        if (props.itemToEdit) {
            const src = props.itemToEdit;
            formData.value = {
                id_archivo: src.id_archivo || null,
                id_conductor: src.id_conductor || null,
                tipo_detalle: src.tipo_detalle || null,
                fecha_vencimiento: src.fecha_vencimiento || '',
                name_doc_orig: src.name_doc_orig || '',
                name_doc_interno: src.name_doc_interno || '',
                observacion: src.observacion || '',
                tipo_documento: 'EQUIPOS MOVILES'
            };
        } else {
            resetForm();
        }
    }
}, { immediate: true });

function resetForm() {
    formData.value = {
        id_archivo: null,
        id_conductor: null,
        tipo_detalle: null,
        fecha_vencimiento: '',
        name_doc_orig: '',
        name_doc_interno: '',
        observacion: '',
        tipo_documento: 'EQUIPOS MOVILES'
    };
    selectedFiles.value = [];
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
        // Simulando guardado por ahora como no hay endpoint específico
        // Pero siguiendo la lógica de tfmg-archivos

        const payload = {
            id_archivo: formData.value.id_archivo,
            id_empresa: 1,
            id_empresa_cliente: 1,
            tipo_documento: 'EQUIPOS MOVILES',
            observacion: formData.value.observacion,
            id_usuario_creacion: userDetailStore.userDetail?.id_user || 1,
            json_data: {
                id_conductor: formData.value.id_conductor,
                tipo_detalle: formData.value.tipo_detalle,
                fecha_vencimiento: formData.value.fecha_vencimiento
            }
        };

        // Lógica de archivos si se subió uno
        if (hasSelectedFile(selectedFiles.value)) {
            const file = getFirstSelectedFile(selectedFiles.value);
            if (!isAllowedDocumentFile(file)) {
                alert('Solo se permiten archivos PDF o imágenes.');
                return;
            }

            const uploadData = new FormData();
            uploadData.append('archivo', file);
            uploadData.append('tipo_doc', 'EQUIPO_DOC');
            uploadData.append('mimetype', file.type);
            uploadData.append('name_doc_orig', file.name);
            uploadData.append('name_doc_interno', '');
            uploadData.append('path_doc', '/u05/LeanDocs/terracon');
            uploadData.append('id_user', Number(userDetailStore.userDetail?.id_user) || 1);
            uploadData.append('estado', '1');

            const uploadRes = await api.post('/archivo/imagen', uploadData);
            if (uploadRes.data?.archivo) {
                payload.id_doc = uploadRes.data.archivo.id_doc;
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
        console.error('Error al guardar documento equipo:', error);
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

function getFirstSelectedFile(value) {
    if (Array.isArray(value)) return value[0] || null;
    if (value instanceof File) return value;
    return null;
}

function hasSelectedFile(value) {
    return !!getFirstSelectedFile(value);
}

function isAllowedDocumentFile(file) {
    if (!file) return true;
    const type = String(file.type || '').toLowerCase();
    const name = String(file.name || '').toLowerCase();
    return type === 'application/pdf'
        || type.startsWith('image/')
        || /\.(pdf|jpe?g|png|gif|webp|bmp)$/i.test(name);
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
