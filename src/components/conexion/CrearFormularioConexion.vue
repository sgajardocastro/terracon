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
              v-if="localIsVersionMode || localIsEditMode"
              cols="12"
            >
              <v-alert
                density="compact"
                type="info"
                variant="tonal"
                class="mb-2"
              >
                <span v-if="localIsVersionMode">Creando nueva versión para ID Doc: <strong>{{
                  formData.id_doc }}</strong></span>
                <span v-else>Editando registro ID Archivo: <strong>{{ formData.id_archivo
                }}</strong></span>
              </v-alert>
            </v-col>

            <!-- Tipo Documento -->
            <v-col cols="12">
              <label class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary">Tipo
                Documento</label>
              <v-select
                v-model="formData.tipo_documento"
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

            <!-- Archivo (Upload) -->
            <v-col cols="12">
              <label class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary">Archivo del
                Formulario</label>

              <!-- Documento Actual (Vista previa/Link) -->
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
                :placeholder="formData.name_doc_interno ? 'Reemplazar archivo actual' : 'Seleccionar archivo'"
                variant="outlined"
                density="compact"
                bg-color="grey-lighten-5"
                color="primary"
                class="sakai-input"
                prepend-icon=""
                prepend-inner-icon="mdi-paperclip"
                :show-size="true"
                :rules="!localIsEditMode ? [rules.required] : []"
              />
            </v-col>

            <!-- Nombre Original -->
            <v-col cols="12">
              <label class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary">Nombre
                Documento</label>
              <v-text-field
                v-model="formData.name_doc_orig"
                placeholder="Nombre del documento"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
                bg-color="grey-lighten-5"
                color="primary"
                class="sakai-input"
              />
            </v-col>

            <!-- Nombre Interno -->
            <v-col cols="12">
              <label class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary">Nombre Interno
                (Sistema)</label>
              <v-text-field
                v-model="formData.name_doc_interno"
                placeholder="Generado automáticamente si vacío"
                variant="outlined"
                density="compact"
                bg-color="grey-lighten-5"
                color="primary"
                class="sakai-input"
                hint="Dejar vacío para autogenerar UUID"
              />
            </v-col>

            <!-- Observaciones -->
            <v-col cols="12">
              <label
                class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary"
              >Observaciones</label>
              <v-textarea
                v-model="formData.observacion"
                placeholder="Detalles o cambios de la versión..."
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
import { ref, watch, computed, nextTick } from 'vue';
import api from '@/services/api';
import { useUserDetailStore } from "@/stores/userDetail";

const userDetailStore = useUserDetailStore();

const props = defineProps({
    modelValue: { type: Boolean, required: true },
    itemToEdit: { type: Object, default: () => null },
    isNewVersion: { type: Boolean, default: false },
    empresaId: { type: Number, default: 1 },
    proyectoId: { type: Number, default: 1 }
});

const emit = defineEmits(['update:modelValue', 'save']);

// Computed para modelValue (dialog visibility)
const dialog = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
});

// Estados reactivos
const valid = ref(false);
const loading = ref(false);
const formRef = ref(null);
const selectedFiles = ref([]);

const formData = ref({
    id_archivo: null,
    id_doc: null,
    name_doc_orig: '',
    name_doc_interno: '',
    observacion: '',
    version: 1,
    tipo_documento: 'Formularios PDR',
    json_data: {}
});

const tiposDocumento = ['Formularios DEN', 'Formularios PDR'];

const rules = {
    required: v => {
        if (Array.isArray(v)) return v.length > 0 || 'Requerido';
        return !!v || 'Requerido';
    }
};

// Modos locales calculados para evitar colisiones de nombres con props
const localIsEditMode = computed(() => !!props.itemToEdit && !props.isNewVersion);
const localIsVersionMode = computed(() => !!props.itemToEdit && props.isNewVersion);

const title = computed(() => {
    if (localIsVersionMode.value) return 'Nueva Versión de Formulario';
    if (localIsEditMode.value) return 'Editar Formulario';
    return 'Nuevo Formulario';
});

// Limpiar o cargar datos cuando se abre el modal
watch(() => props.modelValue, (isOpen) => {
    if (isOpen) {
        if (props.itemToEdit) {
            console.log('📝 Modo Edición/Versión detectado:', props.itemToEdit);
            const src = props.itemToEdit;

            // Logic for linking versions
            const currentJson = src.json_data || {};
            let nextJson = { ...currentJson };

            if (localIsVersionMode.value) {
                // If creating new version, establish link
                // If src already has root_id, keep it. Else src.id_archivo is the root.
                nextJson.root_id = currentJson.root_id || src.id_archivo;
            }

            formData.value = {
                id_archivo: localIsVersionMode.value ? null : (src.id_archivo || null),
                id_doc: src.id_doc || null,
                name_doc_orig: src.name_doc_orig || '',
                name_doc_interno: localIsVersionMode.value ? '' : (src.name_doc_interno || ''),
                observacion: localIsVersionMode.value ? '' : (src.observacion || ''),
                version: localIsVersionMode.value ? (Number(src.version || 0) + 1) : (src.version || 1),
                tipo_documento: src.tipo_documento || 'Formularios PDR',
                json_data: nextJson
            };
        } else {
            console.log('✨ Modo Creación detectado');
            resetForm();
        }
    }
}, { immediate: true });

function resetForm() {
    formData.value = {
        id_archivo: null,
        id_doc: null,
        name_doc_orig: '',
        name_doc_interno: '',
        observacion: '',
        version: 1,
        tipo_documento: 'Formularios PDR',
        json_data: {}
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
        const payload = {
            ...formData.value,
            id_empresa: props.empresaId || 1,
            id_proyecto: props.proyectoId || 1,
            id_usuario_creacion: userDetailStore.userDetail?.id_user || 1
        };

        // Autogenerar nombre interno si no existe y no hay archivo nuevo
        if (!payload.name_doc_interno && !selectedFiles.value?.length) {
            payload.name_doc_interno = crypto.randomUUID
                ? crypto.randomUUID()
                : (Date.now().toString(36) + Math.random().toString(36).substring(2));
        }

        const files = Array.isArray(selectedFiles.value)
            ? selectedFiles.value
            : (selectedFiles.value ? [selectedFiles.value] : []);

        if (files.length > 0) {
            const file = files[0];
            const uploadData = new FormData();
            uploadData.append('archivo', file);
            uploadData.append('tipo_doc', 'FORM_PDR_DOC');
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
                payload.name_doc_interno = arch.name_doc_interno;
                if (!payload.name_doc_orig) payload.name_doc_orig = arch.name_doc_orig || file.name;
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
        console.error('Error al guardar:', error);
        alert('Error al guardar el formulario');
    } finally {
        loading.value = false;
    }
}

function getFileUrl(item) {
    if (!item.name_doc_interno) return '#';
    const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
    return `${baseUrl}/archivo/terracon/${item.name_doc_interno}`;
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
