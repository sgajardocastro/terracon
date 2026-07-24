<template>
  <v-dialog
    v-model="dialog"
    max-width="600px"
    persistent
  >
    <v-card class="rounded-xl">
      <v-card-title class="text-h6 font-weight-bold pa-4 d-flex justify-space-between align-center">
        <span>{{ isEditing ? 'Editar Equipo' : 'Nuevo Equipo' }}</span>
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
          ref="form"
          v-model="valid"
        >
          <v-row dense>
            <!-- Marca -->
            <v-col
              cols="12"
              md="6"
            >
              <label class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary">Marca</label>
              <v-text-field
                v-model="equipo.marca"
                placeholder="Ej: WINTERS"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
                bg-color="grey-lighten-5"
                color="primary"
                class="sakai-input"
              />
            </v-col>

            <!-- Modelo -->
            <v-col
              cols="12"
              md="6"
            >
              <label class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary">Modelo</label>
              <v-text-field
                v-model="equipo.modelo"
                placeholder="Ej: PFQ-802"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
                bg-color="grey-lighten-5"
                color="primary"
                class="sakai-input"
              />
            </v-col>

            <!-- Tipo Equipo -->
            <v-col
              cols="12"
              md="6"
            >
              <label class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary">Tipo
                Equipo</label>
              <v-select
                v-model="equipo.tipo_equipo"
                :items="tipos"
                placeholder="Seleccione Tipo"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
                bg-color="grey-lighten-5"
                color="primary"
                class="sakai-input"
              />
            </v-col>

            <!-- Presión (Condicional) -->
            <v-col
              v-if="['Manómetro Media Presión', 'Manómetro Baja Presión'].includes(equipo.tipo_equipo)"
              cols="12"
              md="6"
            >
              <label
                class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary"
              >Presión</label>
              <v-text-field
                v-model="equipo.presion"
                placeholder="Ej: 0-10 bar"
                variant="outlined"
                density="compact"
                bg-color="grey-lighten-5"
                color="primary"
                class="sakai-input"
              />
            </v-col>

            <!-- Número Serie -->
            <v-col
              cols="12"
              md="6"
            >
              <label class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary">Número
                Serie</label>
              <v-text-field
                v-model="equipo.numero_serie"
                placeholder="Ej: 123456789"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
                bg-color="grey-lighten-5"
                color="primary"
                class="sakai-input"
              />
            </v-col>

            <!-- Estado -->
            <v-col
              cols="12"
              md="6"
            >
              <label class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary">Estado</label>
              <v-select
                v-model="equipo.estado"
                :items="['Activo', 'Inactivo']"
                placeholder="Seleccione Estado"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
                bg-color="grey-lighten-5"
                color="primary"
                class="sakai-input"
              />
            </v-col>

            <!-- ID Usuario (Simulado por ahora, debería venir del auth) -->
            <!-- Observaciones -->
            <v-col cols="12">
              <label
                class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary"
              >Observaciones</label>
              <v-textarea
                v-model="equipo.observaciones"
                placeholder="Detalles adicionales..."
                variant="outlined"
                density="compact"
                rows="3"
                bg-color="grey-lighten-5"
                color="primary"
                class="sakai-input"
              />
            </v-col>

            <!-- Fotos -->
            <v-col cols="12">
              <FotoCaptureConexion
                v-model:galeria="equipo.galeria"
                :max-fotos="10"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4 d-flex justify-end">
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
          class="text-none font-weight-bold px-6 ml-2"
          rounded="lg"
          elevation="0"
          :loading="loading"
          @click="save"
        >
          {{ isEditing ? 'Actualizar' : 'Guardar Equipo' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue';

import api from '@/services/api';
import { useUserDetailStore } from "@/stores/userDetail";
import FotoCaptureConexion from './FotoCaptureConexion.vue';

const userDetailStore = useUserDetailStore()

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    equipoToEdit: {
        type: Object,
        default: null
    }
});

const emit = defineEmits(['update:modelValue', 'save']);

const dialog = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
});

const valid = ref(false);
const loading = ref(false);
const form = ref(null);

const tipos = [
    'Manómetro Media Presión',
    'Manómetro Baja Presión',
    'Detector de Gas',
    'Registrador de presión',
    'Chuzo Dielectrico',
    'Electrofusionadora',
    'Analizador'
];

const equipo = ref({
    marca: '',
    modelo: '',
    numero_serie: '',
    tipo_equipo: null,
    estado: '',
    observaciones: '',
    galeria: [] // Array de objetos { id_doc, url, nombre }
    // json_data y id_usuario_creacion se manejarían al enviar
});

const rules = {
    required: v => !!v || 'Requerido'
};

const isEditing = computed(() => !!props.equipoToEdit);

watch(dialog, (val) => {
    if (val) {
        if (isEditing.value) {
            const src = props.equipoToEdit;
            equipo.value = {
                marca: src.marca,
                modelo: src.modelo,
                numero_serie: src.numero_serie,
                tipo_equipo: src.tipo_equipo,
                estado: src.estado,
                observaciones: src.observaciones,
                galeria: []
            };

            // Hydrate galeria
            const fotosIds = src.fotos_ids || [];
            // Parse if string (though likely array)
            const parsedFotos = (typeof fotosIds === 'string') ? JSON.parse(fotosIds) : fotosIds;

            if (Array.isArray(parsedFotos)) {
                hydrateDocs(parsedFotos).then(docs => {
                    equipo.value.galeria = docs;
                });
            }
        } else {
            resetForm();
        }
    }
});

async function hydrateDocs(docs) {
    if (!docs || docs.length === 0) return [];

    const hydrated = [];
    for (const doc of docs) {
        let id = doc.id || doc.id_doc;
        if (!id && (typeof doc === 'number' || typeof doc === 'string')) {
            id = doc;
        }

        if (!id) continue;

        try {
            const res = await api.get(`/archivo/id/${id}`);
            if (res.data && res.data.data) {
                const f = res.data.data;
                const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, ''); // Remove trailing slash
                // Force timestamp to avoid caching issues
                const timestamp = new Date().getTime();
                hydrated.push({
                    id_doc: f.id_doc,
                    // Ensure name_doc_interno is used (UUID filename)
                    url: `${baseUrl}/archivo/terracon/${f.name_doc_interno}?t=${timestamp}`,
                    nombre: f.name_doc_orig || f.name_doc_interno,
                    mimetype: f.mimetype,
                    tipo: 'Foto'
                });
            }
        } catch (e) {
            console.error(`Failed to hydrate doc ${id}`, e);
        }
    }
    return hydrated;
}

function close() {
    dialog.value = false;
    resetForm();
}

function resetForm() {
    equipo.value = {
        marca: '',
        modelo: '',
        numero_serie: '',
        tipo_equipo: null,
        estado: '',
        observaciones: '',
        galeria: []
    };
    if (form.value) form.value.resetValidation();
}

async function save() {
    const { valid } = await form.value.validate();
    if (!valid) return;

    loading.value = true;
    try {
        // Excluir galería del spread para evitar payload grande
        const { galeria, ...equipoData } = equipo.value;

        const payload = {
            ...equipoData,
            id_usuario_creacion: Number(userDetailStore.userDetail?.id_user), // Hardcoded por ahora
            json_data: {},
            fotos_ids: galeria.map(f => ({ "id": Number(f.id_doc) })).filter(item => item.id)
        };



        let response;
        if (isEditing.value) {
            const id = props.equipoToEdit.id_equipo;
            response = await api.put(`/tequ-equipos/${id}`, payload);
            console.log('Equipo actualizado:', response.data);
            emit('save', response.data.data);
        } else {
            response = await api.post('/tequ-equipos', payload);
            console.log('Equipo guardado:', response.data);
            emit('save', response.data.data); // Asumiendo estructura estándar { data: ... }
        }

        close();
    } catch (error) {
        console.error('Error al guardar:', error);
        // Aquí podrías agregar una notificación de error al usuario
    } finally {
        loading.value = false;
    }
}
</script>

<style scoped>
.sakai-input :deep(.v-field__outline) {
    --v-field-border-opacity: 0.15;
}

.sakai-input :deep(.v-field--focused .v-field__outline) {
    --v-field-border-opacity: 0.8;
}

.sakai-input :deep(.v-field) {
    border-radius: 8px;
}
</style>
