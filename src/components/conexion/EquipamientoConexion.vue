<template>
  <div class="pa-0 d-flex flex-column ga-4">
    <!-- Indicadores -->
    <EquipamientoConexionIndicadores />

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
              icon="mdi-gauge"
            />
          </div>
          <div>
            <div class="text-subtitle-1 font-weight-bold text-primary-dark">
              Gestión de Equipamiento
            </div>
            <div class="text-caption text-medium-emphasis">
              Control de instrumentos y equipos
            </div>
          </div>
        </div>

        <v-divider
          vertical
          class="mx-2 hidden-sm-and-down"
        />



        <!-- Selector Tipo -->
        <div style="width: 280px;">
          <label class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary">Tipo
            Instrumento</label>
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
          Nuevo Equipo
        </v-btn>
      </div>
    </v-card>

    <!-- Tabla de Datos -->
    <TablaEquipamiento
      :items="datosFiltrados"
      @edit-equipo="handleEditEquipo"
    />

    <!-- Modal Crear Equipo -->
    <CrearEquipoConexion
      v-model="mostrarCrearEquipo"
      :equipo-to-edit="equipoEditar"
      @save="handleEquipoCreado"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import TablaEquipamiento from './TablaEquipamiento.vue';
import EquipamientoConexionIndicadores from './EquipamientoConexionIndicadores.vue';
import CrearEquipoConexion from './CrearEquipoConexion.vue';
import api from '@/services/api';

const props = defineProps({
    fechaDesde: { type: String, default: '' },
    fechaHasta: { type: String, default: '' }
});

const mostrarCrearEquipo = ref(false);
const equipoEditar = ref(null);

const anio = 2026;
const tipos = [
    'Manometro Media Presion',
    'Manómetro Baja Presión',
    'Detector de Gas',
    'En Proceso de Calibración',
    'Registrador de presion',
    'Chuzo Dielectrico',
    'Electrofusionadora',
    'Analizador',
    'Todos'
];
const tipoSeleccionado = ref(tipos[tipos.length - 1]); // Todos por defecto

const equipos = ref([]);
const loading = ref(false);

function normalizeTipo(value) {
    return String(value ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

async function loadEquipos() {
    loading.value = true;
    try {
        const response = await api.get('/tequ-equipos');
        // Mapear datos del backend a la estructura de la tabla
        equipos.value = (response.data.data || []).map(e => ({
            ...e,
            serie: e.numero_serie,
            tipo: e.tipo_equipo,
            presion: 'NA', // No viene en el modelo actual
            fechaRegistroIso: e.fecha_registro ? String(e.fecha_registro).slice(0, 10) : '',
            fechaRegistro: e.fecha_registro ? new Date(e.fecha_registro).toLocaleDateString() : 'NA',
            fechaUltimaCalib: 'NA',
            fechaProximaCalib: 'NA',
            id_doc: 'NA',
            usuario: 'Usuario ' + e.id_usuario_creacion,
            contratista: 'NA'
        }));
    } catch (error) {
        console.error('Error al cargar equipos:', error);
    } finally {
        loading.value = false;
    }
}

const datosFiltrados = computed(() => {
    let filtered = equipos.value;

    if (tipoSeleccionado.value && tipoSeleccionado.value !== 'Todos') {
        const tipoFiltro = normalizeTipo(tipoSeleccionado.value);
        filtered = filtered.filter(e => normalizeTipo(e.tipo) === tipoFiltro);
    }

    return filtered;
});

function cargarDatos() {
    // Si quisieramos filtrar en backend podriamos llamar a loadEquipos con params
    // Por ahora filtramos en frontend
}

function openCreate() {
    equipoEditar.value = null;
    mostrarCrearEquipo.value = true;
}

function handleEditEquipo(item) {
    equipoEditar.value = item;
    mostrarCrearEquipo.value = true;
}

function handleEquipoCreado(equipo) {
    console.log('Equipo creado/editado:', equipo);
    loadEquipos(); // Recargar lista
    equipoEditar.value = null;
}

onMounted(() => {
    loadEquipos();
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
