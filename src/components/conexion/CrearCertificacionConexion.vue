<template>
  <v-dialog
    v-model="dialog"
    max-width="800px"
    persistent
  >
    <v-card class="rounded-xl">
      <v-card-title class="text-h6 font-weight-bold pa-4 d-flex justify-space-between align-center">
        <span>{{ isEditing ? 'Editar Certificación' : 'Nueva Certificación' }}</span>
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
            <!-- Equipo Info (Solo lectura) -->
            <v-col
              cols="12"
              class="mb-2"
            >
              <v-alert
                density="compact"
                type="info"
                variant="tonal"
                class="text-caption"
              >
                <strong>Equipo:</strong> {{ equipo?.marca }} {{ equipo?.modelo }} (SN: {{
                  equipo?.numero_serie }})
              </v-alert>
            </v-col>

            <!-- Registro Acreditación -->
            <v-col
              cols="12"
              md="4"
            >
              <label class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary">Registro
                Acreditación</label>
              <v-text-field
                v-model="certificacion.registro_acreditacion"
                placeholder="Ej: CERT-2026-001"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
                bg-color="grey-lighten-5"
                color="primary"
                class="sakai-input"
                :disabled="isEditing"
              />
            </v-col>

            <!-- Fecha Última Calibración -->
            <v-col
              cols="12"
              md="4"
            >
              <label class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary">Fecha
                Calibración</label>
              <v-text-field
                v-model="certificacion.fecha_ult_calibracion"
                type="date"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
                bg-color="grey-lighten-5"
                color="primary"
                class="sakai-input"
              />
            </v-col>

            <!-- Fecha Próxima Calibración -->
            <v-col
              cols="12"
              md="4"
            >
              <label class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary">Próxima
                Calibración</label>
              <v-text-field
                v-model="certificacion.fecha_prox_calibracion"
                type="date"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
                bg-color="grey-lighten-5"
                color="primary"
                class="sakai-input"
              />
            </v-col>

            <!-- Responsable -->
            <v-col
              cols="12"
              :md="isManometro ? 6 : 12"
            >
              <label
                class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary"
              >Responsable</label>
              <v-autocomplete
                v-model="certificacion.id_usuario_responsable"
                :items="usuarios"
                item-title="nombre_completo"
                item-value="id_user"
                placeholder="Seleccionar responsable"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
                bg-color="grey-lighten-5"
                color="primary"
                class="sakai-input"
                :loading="loadingUsuarios"
              />
            </v-col>

            <!-- Presión (Solo para Manómetros - Al lado de Responsable) -->
            <v-col
              v-if="isManometro"
              cols="12"
              md="6"
            >
              <label class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary">Presión
                (psi)</label>
              <v-text-field
                v-model="certificacion.presion"
                type="number"
                placeholder="Ej: 100"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
                bg-color="grey-lighten-5"
                color="primary"
                class="sakai-input"
              />
            </v-col>

            <!-- Observaciones -->
            <v-col cols="12">
              <label
                class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary"
              >Observaciones</label>
              <v-textarea
                v-model="certificacion.observacion_registro"
                placeholder="Detalles adicionales..."
                variant="outlined"
                density="compact"
                rows="2"
                bg-color="grey-lighten-5"
                color="primary"
                class="sakai-input"
              />
            </v-col>

            <!-- Documentos Adjuntos (Fotos) -->
            <v-col cols="12">
              <FotoCaptureConexion
                v-model:galeria="certificacion.galeria"
                :max-fotos="5"
                label="Fotografías de Respaldo"
              />
            </v-col>

            <!-- Documentos PDF u otros -->
            <v-col cols="12">
              <DocumentCaptureConexion
                v-model:items="certificacion.documentos"
                :max-items="3"
                label="Certificados (PDF/Doc)"
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
          {{ isEditing ? 'Actualizar' : 'Guardar Certificación' }}
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
import DocumentCaptureConexion from './DocumentCaptureConexion.vue';

const userDetailStore = useUserDetailStore();

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    equipo: {
        type: Object,
        default: () => ({})
    },
    certificacionToEdit: {
        type: Object,
        default: null
    }
});

const emit = defineEmits(['update:modelValue', 'save']);

const dialog = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
});

const isEditing = computed(() => !!props.certificacionToEdit);
const isManometro = computed(() => {
    const tipo = (props.equipo?.tipo_equipo || '').toLowerCase();
    return tipo.includes('manometro') || tipo.includes('manómetro');
});

const valid = ref(false);
const loading = ref(false);
const loadingUsuarios = ref(false);
const form = ref(null);
const usuarios = ref([]);

const certificacion = ref({
    registro_acreditacion: '',
    fecha_ult_calibracion: '',
    fecha_prox_calibracion: '',
    observacion_registro: '',
    id_usuario_responsable: null,
    galeria: [],
    documentos: [],
    presion: null
});

const rules = {
    required: v => !!v || 'Requerido'
};

function toArray(data) {
    if (Array.isArray(data?.data)) return data.data;
    return Array.isArray(data) ? data : [];
}

function getRoleCode(role) {
    return String(role?.codi_rol ?? role?.codigo ?? role?.code ?? role?.name_rol ?? '').trim();
}

function isCnxRoleCode(code) {
    const c = String(code || '').trim().toUpperCase();
    return c.startsWith('CNX') || c.startsWith('CON') || c.includes('-CNX-') || c.includes('-CON-');
}

function buildNombreCompleto(u) {
    const nombreRol = String(u?.nombre_user || '').trim();
    const nombreCompleto = [
        u?.name_frst,
        u?.name_sec,
        u?.apellido_pat,
        u?.apellido_mat
    ].filter(Boolean).join(' ').trim();
    const nombreCorto = [u?.name_frst, u?.apellido_pat].filter(Boolean).join(' ').trim();
    return nombreRol || nombreCompleto || nombreCorto || String(u?.email || '').trim() || String(u?.rut || '').trim() || `Usuario #${u?.id_user}`;
}

async function obtenerUsuarios() {
    loadingUsuarios.value = true;
    try {
        const [usuariosRes, usuariosRolesRes, rolesRes] = await Promise.all([
            api.get('/servicio/leanglobal/obtenerUsuarios'),
            api.get('/servicio/leanglobal/obtenerUsuariosRoles'),
            api.get('/servicio/leanglobal/obtenerRoles')
        ]);

        const usuariosRaw = toArray(usuariosRes?.data);
        const usuariosRolesRaw = toArray(usuariosRolesRes?.data);
        const rolesRaw = toArray(rolesRes?.data);

        const cnxRoleIds = new Set(
            rolesRaw
                .filter(r => isCnxRoleCode(getRoleCode(r)))
                .map(r => Number(r.id_rol ?? r.id ?? r.value))
                .filter(Number.isFinite)
        );

        const cnxUserIds = new Set(
            usuariosRolesRaw
                .filter(ur => {
                    const roleId = Number(ur.id_rol);
                    if (Number.isFinite(roleId) && cnxRoleIds.has(roleId)) return true;
                    return isCnxRoleCode(ur?.name_rol || ur?.codi_rol || ur?.codigo || ur?.code);
                })
                .map(ur => Number(ur.id_user))
                .filter(Number.isFinite)
        );

        usuarios.value = usuariosRaw
            .filter(u => cnxUserIds.has(Number(u.id_user)))
            .map(u => ({
                id_user: u.id_user,
                nombre_completo: buildNombreCompleto(u)
            }))
            .sort((a, b) => b.id_user - a.id_user);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        usuarios.value = [];
    } finally {
        loadingUsuarios.value = false;
    }
}

watch(dialog, (val) => {
    if (val && usuarios.value.length === 0) {
        obtenerUsuarios();
    }
    if (val) {
        if (isEditing.value) {
            // Populate form for editing
            const src = props.certificacionToEdit;
            certificacion.value = {
                registro_acreditacion: src.registro_acreditacion,
                // Ensure dates are formatted for input type="date" (YYYY-MM-DD)
                fecha_ult_calibracion: src.fecha_ult_calibracion ? new Date(src.fecha_ult_calibracion).toISOString().substr(0, 10) : '',
                fecha_prox_calibracion: src.fecha_prox_calibracion ? new Date(src.fecha_prox_calibracion).toISOString().substr(0, 10) : '',
                observacion_registro: src.observacion_registro || '',
                id_usuario_responsable: src.id_usuario_responsable,
                // Parse JSON strings if necessary or assign direct arrays
                galeria: [],
                documentos: [],
                presion: src.json_data?.presion || null
            };

            // Hydrate async
            hydrateDocs(parseDocs(src.fotografias)).then(docs => {
                certificacion.value.galeria = docs;
            });
            hydrateDocs(parseDocs(src.documentos_adjuntos)).then(docs => {
                certificacion.value.documentos = docs;
            });
        } else {
            // Reset for new creation handling defaults
            if (!certificacion.value.id_usuario_responsable) {
                certificacion.value.id_usuario_responsable = Number(userDetailStore.userDetail?.id_user);
            }
        }
    }
});

function parseDocs(docs) {
    if (!docs) return [];
    if (Array.isArray(docs)) return docs;
    try {
        return JSON.parse(docs);
    } catch (e) {
        console.warn('Error parsing docs:', e);
        return [];
    }
}

async function hydrateDocs(docs) {
    console.log('hydrateDocs input:', docs);
    if (!docs || docs.length === 0) return [];

    // Return immediately if already hydrated (has url)
    // But we need to check if we have enough info. 
    // If it has 'url', we assume it's good.

    const hydrated = [];
    for (const doc of docs) {
        const id = doc.id || doc.id_doc;
        console.log('Hydrating doc id:', id, doc);
        if (!id) continue;

        if (doc.url && doc.nombre) {
            hydrated.push({
                ...doc,
                id_doc: id // ensure id_doc is set
            });
            continue;
        }

        try {
            console.log(`Fetching /archivo/id/${id}`);
            const res = await api.get(`/archivo/id/${id}`);
            console.log('Hydration response:', res.data);
            if (res.data && res.data.data) {
                const f = res.data.data;
                const baseUrl = import.meta.env.VITE_API_BASE_URL;
                hydrated.push({
                    id_doc: f.id_doc,
                    url: `${baseUrl}/archivo/terracon/${f.name_doc_interno}`,
                    nombre: f.name_doc_orig || f.name_doc_interno,
                    mimetype: f.mimetype,
                    tipo: f.tipo_doc === 'EQUIPO_FOTO' ? 'Foto' : 'Adjunto'
                });
            }
        } catch (e) {
            console.error(`Failed to hydrate doc ${id}`, e);
        }
    }
    console.log('Hydrated result:', hydrated);
    return hydrated;
}

function close() {
    dialog.value = false;
    resetForm();
}

function resetForm() {
    certificacion.value = {
        registro_acreditacion: '',
        fecha_ult_calibracion: '',
        fecha_prox_calibracion: '',
        observacion_registro: '',
        id_usuario_responsable: null,
        galeria: [],
        documentos: [],
        presion: null
    };
    if (form.value) form.value.resetValidation();
}

async function save() {
    const { valid } = await form.value.validate();
    if (!valid) return;

    loading.value = true;
    try {
        const { galeria, documentos, ...certData } = certificacion.value;

        const payload = {
            ...certData,
            id_equipo: props.equipo?.id_equipo,
            id_usuario_registro: Number(userDetailStore.userDetail?.id_user),
            // id_usuario_responsable ya viene en certData
            // id_usuario_responsable ya viene en certData
            // Save minimalist structure for DB but enough for UI if we decide to use it in future without hydration
            // For now, let's stick to saving { id } or { id, nombre, url }
            // To maintain compatibility with existing assumption that it might be just {id}, let's save:
            fotografias: galeria.map(f => ({
                id: Number(f.id_doc),
                name_doc_interno: f.name_doc_interno || f.filename || (f.url ? f.url.split('/').pop() : '')
            })).filter(item => item.id),

            documentos_adjuntos: documentos.map(d => ({
                id: Number(d.id_doc),
                name_doc_interno: d.name_doc_interno || d.filename || (d.url ? d.url.split('/').pop() : '')
            })).filter(item => item.id),

            json_data: {
                presion: certificacion.value.presion
            }
        };


        // documentos_adjuntos (jsonb?) y fotografias (jsonb?)
        // Revisando el modelo: "documentos_adjuntos || [], fotografias || []" en VALUES.
        // Si la columna es jsonb, deberiamos enviar string JSON si usas node-postgres sin auto-cast, o array si hay cast.
        // Asumiremos la misma corrección que en equipos: enviar string JSON con estructura correcta si es necesario,
        // O array si el driver lo soporta. Probemos con stringify primero ya que vimos el fix anterior.

        let response;
        if (isEditing.value) {
            // Update
            const idDoc = props.certificacionToEdit.id_acreditacion;
            response = await api.put(`/tequ-documentacion/${idDoc}`, payload);
            console.log('Certificación actualizada:', response.data);
        } else {
            // Create
            response = await api.post('/tequ-documentacion', payload);
            console.log('Certificación guardada:', response.data);
        }

        emit('save', response.data);
        close();
    } catch (error) {
        console.error('Error al guardar certificación:', error);
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
