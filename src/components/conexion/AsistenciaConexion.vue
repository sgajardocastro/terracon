<template>
  <div class="pa-0 d-flex flex-column ga-4">
    <!-- Indicadores (Opcional, si existen para esta sección) -->
    <AsistenciaConexionIndicadores v-if="showIndicadores" />

    <!-- Header / Filtros -->
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
              icon="mdi-clipboard-check-outline"
            />
          </div>
          <div>
            <div class="text-subtitle-1 font-weight-bold text-primary-dark">
              Registro de Asistencia
            </div>
            <div class="text-caption text-medium-emphasis">
              Control de asistencia contratistas
            </div>
          </div>
        </div>

        <v-divider
          vertical
          class="mx-2 hidden-sm-and-down"
        />

        <!-- Selector Contratista (Filtro) -->
        <div style="width: 280px;">
          <label class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary">Filtrar por
            Contratista</label>
          <v-select
            v-model="contratistaFiltro"
            :items="empresasSimple"
            item-title="name_empresa"
            item-value="id_empresa"
            variant="outlined"
            density="compact"
            hide-details
            bg-color="grey-lighten-5"
            color="primary"
            class="sakai-input"
            clearable
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
          Nuevo Registro
        </v-btn>
      </div>
    </v-card>

    <!-- Tabla de Datos -->
    <TablaAsistencia
      :items="datosFiltrados"
      :loading="loading"
      @edit="handleEdit"
    />

    <!-- Modal Crear/Editar Asistencia -->
    <CrearAsistenciaConexion
      v-if="mostrarCrearModal"
      v-model="mostrarCrearModal"
      :item-to-edit="itemEditar"
      @save="handleGuardado"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '@/services/api';
import AsistenciaConexionIndicadores from './AsistenciaConexionIndicadores.vue';
import TablaAsistencia from './TablaAsistencia.vue';
import CrearAsistenciaConexion from './CrearAsistenciaConexion.vue';

const props = defineProps({
    fechaDesde: { type: String, default: '' },
    fechaHasta: { type: String, default: '' }
});

const showIndicadores = ref(true);
const mostrarCrearModal = ref(false);
const itemEditar = ref(null);
const contratistaFiltro = ref(null);
const empresasSimple = ref([]);

const items = ref([]);
const loading = ref(false);

async function cargarDatos() {
    loading.value = true;
    try {
        const response = await api.get('/tfmg-archivos');
        const dataRaw = response.data.data || [];

        // Filtrar por tipo_documento específico y asegurar que json_data sea objeto
        items.value = dataRaw
            .filter(i => i.tipo_documento === 'REGISTRO DE ASISTENCIA')
            .map(i => {
                if (typeof i.json_data === 'string') {
                    try { i.json_data = JSON.parse(i.json_data); } catch (e) { i.json_data = {}; }
                }
                return i;
            });
    } catch (error) {
        console.error('Error cargando asistencia:', error);
    } finally {
        loading.value = false;
    }
}

async function fetchEmpresas() {
    try {
        const res = await api.get('/servicio/leanglobal/obtenerEmpresas');
        empresasSimple.value = res.data || [];
        empresasSimple.value = empresasSimple.value.filter(e => e.flag_externo === true);
    } catch (err) {
        console.error('Error fetching empresas', err);
    }
}

const datosFiltrados = computed(() => {
    let filtered = items.value;
    if (contratistaFiltro.value) {
        filtered = filtered.filter(i => i.json_data?.id_empresa_contratista === contratistaFiltro.value);
    }
    if (props.fechaDesde || props.fechaHasta) {
        filtered = filtered.filter(i => {
            const raw = i.fecha_registro || i.fecha_creacion || i.fecha;
            if (!raw) return false;
            const fecha = String(raw).slice(0, 10);
            if (props.fechaDesde && fecha < props.fechaDesde) return false;
            if (props.fechaHasta && fecha > props.fechaHasta) return false;
            return true;
        });
    }

    // Group by id_empresa_contratista
    const grouped = {};
    filtered.forEach(item => {
        const contractorId = item.json_data?.id_empresa_contratista || 'unknown';
        if (!grouped[contractorId]) {
            grouped[contractorId] = {
                id_empresa_contratista: contractorId,
                latest: item,
                history: []
            };
        } else {
            // If this item is newer than the stored latest, move current latest to history
            if (item.id_archivo > grouped[contractorId].latest.id_archivo) {
                grouped[contractorId].history.push(grouped[contractorId].latest);
                grouped[contractorId].latest = item;
            } else {
                grouped[contractorId].history.push(item);
            }
        }
    });

    // Sort history by id_archivo desc for each group
    Object.values(grouped).forEach(g => {
        g.history.sort((a, b) => b.id_archivo - a.id_archivo);
    });

    // Sort the final list by the latest record's id_archivo desc
    return Object.values(grouped).sort((a, b) => b.latest.id_archivo - a.latest.id_archivo);
});

function openCreate() {
    itemEditar.value = null;
    mostrarCrearModal.value = true;
}

function handleEdit(item) {
    itemEditar.value = item;
    mostrarCrearModal.value = true;
}

function handleGuardado() {
    cargarDatos();
}

onMounted(() => {
    cargarDatos();
    fetchEmpresas();
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
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.text-primary-dark {
    color: #1e293b;
}

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
