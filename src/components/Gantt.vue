<template>
  <div style="max-height: 300px; overflow-y: auto; border: 1px solid #ccc;">
    <g-gantt-chart
      :chart-start="fechaDesde + ' 12:00'"
      :chart-end="fechaHasta + ' 12:00'"
      precision="day"
      bar-start="startDate"
      bar-end="endDate"
    >
      <!--g-gantt-row label="Proyecto 1" :bars="row1BarList" />
      <g-gantt-row label="Proyecto 9" :bars="row2BarList" /-->
      <g-gantt-row
        v-for="(row, index) in ganttRows"
        :key="index"
        :label="row.label"
        :bars="row.bars"
      />
    </g-gantt-chart>
  </div>
</template>
<script setup>
import apiAxios from '@/services/api';
import { ref, onMounted, computed } from 'vue';
const ganttRows = ref([]);
const tareas = ref([]);
const tareasAgrupadas = ref({});

const hoy = new Date().toISOString().split('T')[0];
const fechaDesde = ref(hoy);
const fechaHasta = ref(hoy);

const loading = ref(false);
const error = ref(null);

const familias = ref([]);

onMounted(async () => {
  await obtenerTareas();
  await tareasGrupos();
  await obtenerFamilias();

  ganttRows.value = generarGanttRows(familias.value);

  console.log('Tareas:', tareas.value);
});


const obtenerFamilias = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await apiAxios.get('/servicio/leanglobal/obtenerFamilias');
    familias.value = response.data;
  } catch (err) {
    error.value = 'Error al obtener familias: ' + err.message;
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const obtenerTareas = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await apiAxios.get('/servicio/leanglobal/procesosSurveyV2');
    tareas.value = response.data;
  } catch (err) {
    error.value = 'Error al obtener tareas: ' + err.message;
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const generarGanttRows = (familias) => {
  return familias.map((srv, i) => {
    const baseDate = new Date('2025-06-01T08:00:00');
    baseDate.setDate(baseDate.getDate() + i);

    const endDate = new Date(baseDate);
    endDate.setHours(endDate.getHours() + 6);

    const myBeginDate = baseDate.toISOString().split('.')[0].replace('T', ' ');
    const myEndDate = endDate.toISOString().split('.')[0].replace('T', ' ');

    return {
      label: srv.name_tipo_srv,
      bars: [
        {
          myBeginDate,
          myEndDate,
          ganttBarConfig: {
            id: `bar-${srv.id_tipo_srv}`,
            label: srv.name_area,
            style: {
              background: '#a5d6a7',
              borderRadius: '4px',
              color: '#000',
            },
          },
        },
      ],
    };
  });
};

// Rango del Gantt
const startDate = new Date('2025-06-17')
const endDate = new Date('2025-06-30')

// Agrupar por `name_tipo_srv`
async function tareasGrupos() {
  const grupos = {}
  console.log(tareas.value);

  for (const tarea of tareas.value) {
    const familia = tarea.name_tipo_srv
    console.log(tarea.name_tipo_srv);
    const inicio = new Date(tarea.fecha_plan_fin)
    const fin = new Date(tarea.fecha_plan_fin)

    // Validación de fechas
    if (isNaN(inicio) || isNaN(fin) || inicio > fin) continue

    if (!grupos[familia]) grupos[familia] = []

    grupos[familia].push({
      id: tarea.id_survey,
      label: tarea.name_template_srv,
      color: tarea.estado_color,
      startDate: inicio,
      endDate: fin
    })
  }
  console.log(grupos);

  tareasAgrupadas.value = grupos;
}

</script>
