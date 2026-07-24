<template>
  <v-card class="pa-3 tabla-wrapper">
    <h3 class="mb-3">
      % Cumplimiento programa de seguridad Individual
    </h3>

    <!-- CONTENEDOR CON SCROLL -->
    <div>
      <v-table
        density="comfortable"
        hover
        class="text-body-2 table-scroll"
      >
        <thead>
          <tr>
            <th class="text-center">
              Periodo
            </th>
            <th class="text-center">
              Nombre
            </th>
            <th class="text-center">
              Planificadas
            </th>
            <th class="text-center">
              Terminadas
            </th>
            <th class="text-center">
              Atrasadas
            </th>
            <th class="text-center">
              Pendientes
            </th>
            <th class="text-center">
              % Cumplimiento
            </th>
            <th
              class="text-center"
              style="width:56px;"
            />
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(item, i) in items"
            :key="i"
            style="cursor: pointer"
            @click="ver(item)"
          >
            <td class="text-center">
              {{ item.periodo }}
            </td>
            <td class="text-center">
              {{ item.nombre_user }}
            </td>
            <td class="text-center">
              {{ item.cantidad_inspecciones_planificadas }}
            </td>
            <td class="text-center">
              {{ item.cantidad_inspecciones_terminadas }}
            </td>
            <td class="text-center">
              {{ item.cantidad_inspecciones_atrasadas }}
            </td>
            <td class="text-center">
              {{ item.cantidad_inspecciones_pendientes }}
            </td>
            <td class="text-center">
              {{ item.porcentaje_cumplimiento }}%
            </td>
            <!--td class="text-center">
              <v-btn icon variant="text" @click="ver(item)">
                <v-icon icon="mdi-eye" />
              </v-btn>
            </td-->
          </tr>
        </tbody>
      </v-table>
    </div>
  </v-card>
</template>

<script setup>
import { ref, defineProps, defineEmits, onMounted } from 'vue'
import apiAxios from '@/services/api';

/*const props = defineProps({
  items: {
    type: Array,
    default: () => ([
      { nombre: 'Pedro Pérez',  cargo: 'Administrador de obra', cumplimiento: 99.5 },
      { nombre: 'Carla Cáceres', cargo: 'APR',                  cumplimiento: 89.5 },
      { nombre: 'Álvaro Alvarado', cargo: 'Jefe de Terreno',    cumplimiento: 100.0 },
      { nombre: 'Martín Martínez', cargo: 'Capataz',            cumplimiento: 72.0 },
    ])
  }
})*/
const props = defineProps({
  fechaDesde: String,
  fechaHasta: String,
  clienteId: [String, Number],
  proyectoId: [String, Number],
})
const items = ref([])
const obtenerPers = async () => {
  try {
    const response = await apiAxios.get('/servicio/seg/kpi/personalizadoPctCumplimPers'
     +
          `?fecha_desde=${props.fechaDesde}` +
          `&fecha_hasta=${props.fechaHasta}` +
          `&filtro=${props.clienteId ?? ''}` +
          `&secatrib=${props.proyectoId ?? ''}` )

    items.value = (response.data.datos ?? [])
      .sort((a, b) => Number(b.id_personalizado) - Number(a.id_personalizado))

    console.log('items (ordenado desc)', items.value)
  } catch (err) {
    console.error(err)
  }
}

const emit = defineEmits(['ver'])

function ver(row) {
  emit('ver', row)
}

// Formato porcentaje (1 decimal) + símbolo
function formatPct(v) {
  const n = Number(v ?? 0)
  return `${n.toFixed(1)} %`
}

// Color por umbral (≈ como tu imagen)
function pctClass(v) {
  const n = Number(v ?? 0)
  if (n >= 95) return 'text-success'  // verde
  if (n >= 80) return 'text-warning'  // ámbar
  return 'text-error'                 // rojo
}

onMounted(() => {
  obtenerPers();
});

// ✅ clave: recargar cuando cambien filtros
watch(
  () => [props.fechaDesde, props.fechaHasta, props.clienteId, props.proyectoId],
  () => obtenerPers(),
  { immediate: true }
)
</script>

<style scoped>
h3 {
  font-weight: 700;
  color: #2b2b2b;
  margin: 0;
}
thead th {
  background: #f5f5f5;
  color: #555;
  font-weight: 700;
}
tbody tr + tr td {
  border-top: 1px solid #eee;
}

.table-scroll {
  max-height: 317px;   /* 👈 AJUSTA este valor */
  overflow-y: auto;
}

/* Opcional: header fijo mientras haces scroll */
.table-scroll thead th {
  position: sticky;
  top: 0;
  background: #f5f5f5;
  z-index: 2;
}

/* Scroll más suave */
.table-scroll::-webkit-scrollbar {
  width: 6px;
}
.table-scroll::-webkit-scrollbar-thumb {
  background-color: #cfcfcf;
  border-radius: 4px;
}
</style>
