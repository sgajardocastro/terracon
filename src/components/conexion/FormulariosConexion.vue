<template>
  <div class="pa-4 d-flex flex-column ga-4">
    <!-- Indicadores (Placeholder por ahora, o reutilizar si aplica) -->
    <!-- <EquipamientoConexionIndicadores /> -->

    <!-- Header / Filtros en Card "Sakai" style -->
    <v-card
      class="surface-card pa-4"
      variant="outlined"
      style="border-color: #e2e8f0; border-radius: 12px; background-color: white;"
    >
      <div class="d-flex align-center flex-wrap ga-4">
        <!-- Título Sección -->
        <div class="d-flex align-center mr-4">
          <div class="icon-box mr-3">
            <v-icon
              color="primary"
              icon="mdi-clipboard-text-outline"
            />
          </div>
          <div>
            <div class="text-subtitle-1 font-weight-bold text-primary-dark">
              Formularios personal terreno
            </div>
            <div class="text-caption text-medium-emphasis">
              Gestión de formularios
            </div>
          </div>
        </div>

        <v-divider
          vertical
          class="mx-2 hidden-sm-and-down"
        />

        <!-- Selector Tipo -->
        <div style="width: 250px;">
          <label class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary">Tipo
            Formulario</label>
          <v-select
            v-model="tipoSeleccionado"
            :items="tipos"
            variant="outlined"
            density="compact"
            hide-details
            bg-color="grey-lighten-5"
            color="primary"
            class="sakai-input"
            @update:model-value="cargarDatos"
          />
        </div>

        <!-- Search Filter -->
        <div style="width: 250px;">
          <label class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary">Buscar
            Documento</label>
          <v-text-field
            v-model="searchText"
            density="compact"
            variant="outlined"
            hide-details
            placeholder="ID, Nombre..."
            prepend-inner-icon="mdi-magnify"
            bg-color="grey-lighten-5"
            class="sakai-input"
            clearable
          />
        </div>

        <!-- Show Past Versions Checkbox -->
        <div class="d-flex align-center mt-6">
          <v-checkbox
            v-model="mostrarVersionesPasadas"
            label="Historial"
            density="compact"
            hide-details
            color="primary"
            class="ml-2"
          />
        </div>

        <v-spacer />

        <v-btn
          color="primary"
          class="text-none text-subtitle-2 px-6"
          height="40"
          elevation="0"
          rounded="lg"
          @click="openCreate"
        >
          <v-icon
            start
            size="18"
          >
            mdi-plus
          </v-icon>
          Nuevo Formulario
        </v-btn>
      </div>
    </v-card>

    <!-- Tabla de Datos -->
    <TablaFormularios
      :items="datosFiltrados"
      @view-doc="handleViewDoc"
      @edit="handleEdit"
      @new-version="handleNewVersion"
    />

    <!-- Modal Crear/Editar Formulario -->
    <CrearFormularioConexion
      v-if="mostrarCrearFormulario"
      v-model="mostrarCrearFormulario"
      :item-to-edit="itemEditar"
      :is-new-version="esNuevaVersion"
      @save="handleGuardado"
    />

    <!-- Dialogo para ver JSON (Simple) -->
    <v-dialog
      v-model="mostrarVisor"
      max-width="600"
    >
      <v-card title="Detalle Documento">
        <v-card-text>
          <pre class="bg-grey-lighten-4 pa-4 rounded">{{ visorContent }}</pre>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text="Cerrar"
            @click="mostrarVisor = false"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import api from '@/services/api';
import TablaFormularios from './TablaFormularios.vue';
import CrearFormularioConexion from './CrearFormularioConexion.vue';

const props = defineProps({
    fechaDesde: { type: String, default: '' },
    fechaHasta: { type: String, default: '' }
});
const emit = defineEmits(['historial-change']);

const mostrarCrearFormulario = ref(false);
const itemEditar = ref(null);
const esNuevaVersion = ref(false);

const mostrarVisor = ref(false);
const visorContent = ref('');

const tipos = [
    'Formularios DEN',
    'Formularios PDR',
    'Todos'
];
const tipoSeleccionado = ref('Formularios PDR'); // Default solicitado
const searchText = ref('');
const mostrarVersionesPasadas = ref(false);

const items = ref([]);
const loading = ref(false);

async function cargarDatos() {
    loading.value = true;
    try {
        const response = await api.get('/tfmg-archivos');
        // Filtrado básico cliente por ahora si el backend devuelve todo
        // Si el backend soporta filtros, pasar params
        const data = response.data.data || [];
        // Filter only requested types: PDR and DEN
        items.value = data.filter(i =>
            (i.tipo_documento || '').includes('Formularios PDR') ||
            (i.tipo_documento || '').includes('Formularios DEN')
        );
        console.log("items filtered:", items.value.length);
    } catch (error) {
        console.error('Error cargando formularios:', error);
        items.value = [];
    } finally {
        loading.value = false;
    }
}

const datosFiltrados = computed(() => {
    let filtered = items.value;

    // Date Filter by fecha_creacion
    if (props.fechaDesde || props.fechaHasta) {
        filtered = filtered.filter(i => {
            const fecha = String(i.fecha_creacion || '').slice(0, 10);
            if (!fecha) return false;
            if (props.fechaDesde && fecha < props.fechaDesde) return false;
            if (props.fechaHasta && fecha > props.fechaHasta) return false;
            return true;
        });
    }

    // Type Filter
    if (tipoSeleccionado.value && tipoSeleccionado.value !== 'Todos') {
        filtered = filtered.filter(i => i.tipo_documento === tipoSeleccionado.value);
    }

    // Text Search Filter
    if (searchText.value) {
        const s = searchText.value.toLowerCase();
        filtered = filtered.filter(i =>
            (i.id_doc && i.id_doc.toString().includes(s)) ||
            (i.name_doc_orig && i.name_doc_orig.toLowerCase().includes(s)) ||
            (i.observacion && i.observacion.toLowerCase().includes(s))
        );
    }

    // Version Filtering logic
    if (mostrarVersionesPasadas.value) {
        // Show ALL versions (flattened)
        return filtered.sort((a, b) => b.id_archivo - a.id_archivo);
    } else {
        // Show ONLY latest version per "family"
        const grouped = {};
        filtered.forEach(item => {
            // Use root_id if available (explicit link), otherwise default to using id_archivo as root
            const key = item.json_data?.root_id || item.id_archivo;

            if (!grouped[key] || Number(item.version) > Number(grouped[key].version)) {
                grouped[key] = item;
            }
        });
        return Object.values(grouped).sort((a, b) => b.id_archivo - a.id_archivo);
    }
});

function openCreate() {
    itemEditar.value = null;
    esNuevaVersion.value = false;
    mostrarCrearFormulario.value = true;
}

function handleEdit(item) {
    itemEditar.value = item;
    esNuevaVersion.value = false;
    mostrarCrearFormulario.value = true;
}

function handleNewVersion(item) {
    itemEditar.value = item;
    esNuevaVersion.value = true;
    mostrarCrearFormulario.value = true;
}

function handleViewDoc(item) {
    visorContent.value = JSON.stringify(item.json_data || {}, null, 2);
    mostrarVisor.value = true;
}

function handleGuardado() {
    cargarDatos();
    itemEditar.value = null;
    esNuevaVersion.value = false;
}

function getRowsForExport() {
    return datosFiltrados.value.map(i => ({
        id_doc: i.id_doc ?? '',
        tipo_documento: i.tipo_documento || '',
        nombre_archivo: i.name_doc_orig || (i.id_doc ? `Documento #${i.id_doc}` : 'Sin archivo'),
        observacion: i.observacion || '',
        version: i.version ?? '',
        fecha_creacion: String(i.fecha_creacion || '').slice(0, 10),
        usuario_id: i.id_usuario_creacion || null
    }));
}

watch(mostrarVersionesPasadas, (val) => {
    emit('historial-change', !!val);
}, { immediate: true });

defineExpose({ getRowsForExport });

onMounted(() => {
    cargarDatos();
});
</script>

<style scoped>
.surface-card {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02) !important;
}

.icon-box {
    width: 40px;
    height: 40px;
    background: #f1f5f9;
    /* Slate 100 */
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.text-primary-dark {
    color: #1e293b;
    /* Slate 800 */
}

/* Sakai-like Input overrides */
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
