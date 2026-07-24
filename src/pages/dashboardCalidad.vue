<template>
  <DashboardLayout>
    <div>
      <v-row
        class="mb-0"
        dense
      >
        <v-col cols="auto">
          <v-card>
            <v-tabs density="compact">
              <v-tab @click="teratribSeleccionado = 10">
                Dashboard Calidad
              </v-tab>
              <v-tab @click="teratribSeleccionado = 11">
                Planificación Calidad
              </v-tab>
              <!--v-tab @click="teratribSeleccionado = 12">Zona Sur</v-tab>
              <v-tab @click="teratribSeleccionado = 13">Metropolitana</v-tab-->
            </v-tabs>
          </v-card>
        </v-col>
        <v-col cols="auto">
          <v-text-field
            v-model="fechaDesde"
            label="Fecha desde"
            type="date"
            density="compact"
            variant="outlined"
            hide-details
            style="max-width: 180px"
          />
        </v-col>
        <v-col cols="auto">
          <v-text-field
            v-model="fechaHasta"
            label="Fecha hasta"
            type="date"
            density="compact"
            variant="outlined"
            hide-details
            style="max-width: 180px"
          />
        </v-col>
        <v-col cols="auto">
          <v-select
            v-model="clienteSeleccionado"
            :items="clientes"
            item-title="name_empresa"
            item-value="id_empresa"
            label="Cliente"
            density="compact"
            variant="outlined"
            style="width: 180px"
          />
        </v-col>
        <v-col cols="auto">
          <v-select
            v-model="proyectoSeleccionado"
            :items="proyectos"
            item-title="nombre_proyecto"
            item-value="id_proyecto"
            label="Proyecto"
            density="compact"
            variant="outlined"
            style="width: 180px"
          />
        </v-col>
        <v-col cols="auto">
          <v-btn @click="filtrar()">
            Filtrar
          </v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn>Exportar</v-btn>
        </v-col>
      </v-row>
      <v-row dense>
        <v-col cols="6">
          <div class="grupos">
            <div
              v-for="(item, index) in jsonData"
              :key="index"
            >
              <div
                v-for="(grupo, gIndex) in item.grupo"
                :key="gIndex"
              >
                <GrupoIndicador
                  :grupo="grupo"
                  :fecha-desde="fechaDesde"
                  :fecha-hasta="fechaHasta"
                  :filtro="filtro"
                  :filtro1="filtro1"
                  :filtro2="filtro2"
                  :in-prop="inProp"
                  :teratrib="teratrib"
                />
              </div>
            </div>
          </div>
        </v-col>
        <v-col cols="6">
          <div class="grupo">
            <div
              style="padding-bottom: 10px;
                font-size: 16px;
              "
            >
              Perspectiva Geográfica
            </div>
            <Mapa />
          </div>
        </v-col>
      </v-row>
      <v-row dense>
        <v-col cols="6">
          <div
            class="grupo"
            style="height: 345px;"
          >
            <div style="padding-bottom: 10px; font-size: 16px;">
              Perspectiva Temporal
            </div>
            <!--Gantt></Gantt-->
            <!--v-timeline direction="horizontal">
              <v-timeline-item
                v-for="(tarea, index) in tareas"
                :key="tarea.id_survey"
                :dot-color="mapColor(tarea.estado_color)"
              >
                <template v-slot:opposite>
                  {{ new Date(tarea.fecha_plan_ini).toLocaleDateString() }}
                </template>

                <div>
                  <div class="text-h6">{{ tarea.name_template_srv }}</div>
                  <div class="text-caption">{{ tarea.name_tipo_srv }}</div>
                </div>
              </v-timeline-item>
            </v-timeline-->
            <!--div v-for="(grupo, familia) in tareasPorFamilia" :key="familia" class="mb-10">
              <h3 class="text-subtitle-1 font-weight-bold mb-3">{{ familia }}</h3>

              <v-timeline
                direction="horizontal"
                side="end"
                align="start"
                style="overflow: visible; position: relative;"
              >
                <v-timeline-item
                  v-for="(tarea, index) in grupo"
                  :key="tarea.id_survey"
                  :dot-color="mapColor(tarea.estado_color)"
                >

                  <v-tooltip location="bottom" open-on-hover>
                    <template #activator="{ props }">
                      <div v-bind="props" style="display: inline-block; cursor: pointer;">
                        {{ tarea.name_template_srv }}
                      </div>
                    </template>
                    <span>{{ new Date(tarea.fecha_plan_fin).toLocaleDateString() }}</span>
                  </v-tooltip>

                </v-timeline-item>
              </v-timeline>
            </div-->
            <div
              ref="chartContainer"
              class="card"
            />
          </div>
        </v-col>
        <v-col
          cols="6"
          class="d-flex"
        >
          <div class="grupo grupo2 flex-grow-1">
            <VerInspecciones />
          </div>
        </v-col>
      </v-row>
    </div>
  </DashboardLayout>
</template>
<script setup>
import DashboardLayout from '../layouts/dashboard.vue';
import VerInspecciones from '../components/VerInspecciones.vue';
import Mapa from '../components/Mapa.vue';
//import Gantt from '../components/Gantt.vue';
import Highcharts from 'highcharts/highcharts-gantt'
import { ref, onMounted, computed } from 'vue';
import apiAxios from '@/services/api';

import { useRouter } from 'vue-router'

const router = useRouter()

const clientes = ref([]);
const proyectos = ref([]);
const familias = ref([]);
const tareas = ref([]);

const clienteSeleccionado = ref(null);
const proyectoSeleccionado = ref(null);

const loading = ref(false);
const error = ref(null);

const hoy = new Date().toISOString().split('T')[0];
const fechaDesde = ref(hoy);
const fechaHasta = ref(hoy);

const teratrib = ref(10);
const teratribSeleccionado = ref(10);
const jsonData = ref([]);

const chartContainer = ref(null)

const tasks = [
  {
    id: '1',
    name: 'Diseño',
    start: Date.UTC(2025, 5, 20),
    end: Date.UTC(2025, 5, 25),
    color: '#81C784'
  },
  {
    id: '2',
    name: 'Desarrollo',
    start: Date.UTC(2025, 5, 26),
    end: Date.UTC(2025, 6, 2),
    color: '#64B5F6'
  },
  {
    id: '3',
    name: 'Testing',
    start: Date.UTC(2025, 6, 3),
    end: Date.UTC(2025, 6, 6),
    color: '#64B5F6'
  }
];

const dtmin = Math.min(...tasks.map(t => t.start))
const dtmax = Math.max(...tasks.map(t => t.end))

onMounted(async () => {
  // Obtener datos necesarios
  await obtenerClientes();
  await obtenerProyectos();
  await obtenerFamilias();
  await obtenerTareas();

  const response = await fetch('/data.json');
  //const response = await fetch('/data.json');
  const data = await response.json();
  jsonData.value = data;

  Highcharts.ganttChart(chartContainer.value, {
    chart: {
      height: 20 * tasksGantt.value.length // autoajuste según cantidad
    },
    /*title: {
      text: 'Cronograma de Encuestas'
    },*/
    exporting: {
      enabled: true
    },
    credits: {
      enabled: false
    },
    xAxis: [
      {
        labels: {
          style: { fontSize: "9px" },
          format: '{value:%d}' // Día del mes
        },
        grid: {
          enabled: true,
          cellHeight: 20
        },
        tickInterval: 1000 * 60 * 60 * 24 // Un día
      },
      {
        labels: {
          format: '{value:%b}' // Mes abreviado
        },
        grid: {
          enabled: true,
          cellHeight: 20
        },
        tickInterval: 1000 * 60 * 60 * 24 * 30 // Un mes
      }
    ],
    yAxis: {
      categories: categoriasGantt.value,
      grid: {
        cellHeight: 30
      },
      labels: {
        useHTML: true,
        style: {
          fontSize: '11px'
        }
      }
    },
    plotOptions: {
      series: {
        pointHeight: 10,
        borderRadius: 4,
        connectors: {
          enabled: false // sin flechas
        },
        dataLabels: {
          enabled: false // sin texto dentro de las barras
        },
         point: {
          events: {
            click: function () {
              // Redirige usando Vue Router
              router.push(`/survey2?idInspeccion=${this.id}`);
            }
          }
        }
      }
    },
    tooltip: {
      useHTML: true,
      formatter: function () {
        return `
          <b>${this.point.name}</b><br/>
          ${categoriasGantt.value[this.point.y]}<br/>
          <b>ID Survey:</b> ${this.point.id_survey}<br/>
          <b>Estado:</b> ${this.point.estado_srv}<br/>
          <b>Inicio Plan:</b> ${Highcharts.dateFormat('%Y-%m-%d', this.point.start)}<br/>
          <b>Fin Plan:</b> ${Highcharts.dateFormat('%Y-%m-%d', this.point.end)}<br/>
          <b>Proyecto:</b> ${this.point.nombre_proyecto}<br/>
          <b>Cliente:</b> ${this.point.cliente}
        `;
      }
    },
    series: [{
      name: 'Tareas',
      data: tasksGantt.value
    }]
  });
});

const tareasPorFamilia = computed(() => {
  const grupos = {}

  for (const tarea of tareas.value) {
    const familia = tarea.name_tipo_srv ?? 'Sin familia'

    if (!grupos[familia]) grupos[familia] = []
    grupos[familia].push(tarea)
  }

  return grupos
})

// Funciones para obtener datos desde API
const obtenerClientes = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await apiAxios.get('/servicio/leanglobal/obtenerEmpresas');
    clientes.value = (Array.isArray(response.data) ? response.data : []).filter(
      e => !(e.flag_externo === true || e.flag_externo === 1 || e.flag_externo === '1' || e.flag_externo === 't' || e.flag_externo === 'true')
    );
  } catch (err) {
    error.value = 'Error al obtener clientes: ' + err.message;
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const obtenerProyectos = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await apiAxios.get('/servicio/leanglobal/obtenerProyectos');
    proyectos.value = response.data;
  } catch (err) {
    error.value = 'Error al obtener proyectos: ' + err.message;
    console.error(err);
  } finally {
    loading.value = false;
  }
};

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

const tasksGantt = ref([]);
const categoriasGantt = ref([]);

const obtenerTareas = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await apiAxios.get('/servicio/leanglobal/procesosSurveyV2');

    // Ordenar por fecha_plan_ini ascendente
    const tareasOrdenadas = response.data.sort((a, b) => {
      return new Date(a.fecha_plan_ini) - new Date(b.fecha_plan_ini);
    });

    tareas.value = tareasOrdenadas;

    // Agrupar por name_tipo_srv (sin duplicados)
    const tiposUnicos = [
      ...new Set(tareasOrdenadas.map(t => t.name_tipo_srv))
    ];

    // Guardamos las categorías para el eje Y
    categoriasGantt.value = tiposUnicos;

    const tareasPorFechaYTipo = {};

    tasksGantt.value = tareasOrdenadas.map(item => {
      const fechaFin = item.fecha_plan_fin;
      const year = Number(fechaFin.slice(0, 4));
      const month = Number(fechaFin.slice(5, 7)) - 1;
      const day = Number(fechaFin.slice(8, 10));

      const tipo = item.name_tipo_srv;
      const keyGrupo = `${tipo}_${fechaFin}`;

      // Contador de cuántas tareas ya hay en esa fecha y grupo
      if (!tareasPorFechaYTipo[keyGrupo]) {
        tareasPorFechaYTipo[keyGrupo] = 0;
      }

      const bloque = tareasPorFechaYTipo[keyGrupo];
      tareasPorFechaYTipo[keyGrupo]++;

      const horaInicio = bloque * 6;
      const horaFin = horaInicio + 6;

      return {
        id: String(item.id_survey),
        name: item.name_template_srv,
        start: Date.UTC(year, month, day, horaInicio, 0),
        end:   Date.UTC(year, month, day, horaFin, 0),
        y: tiposUnicos.indexOf(tipo),
        color: colorMap[item.estado_color] || '#BDBDBD',
        nombre_proyecto: item.nombre_proyecto,
        cliente: item.name_empresa_cliente,
        estado_srv: item.estado_srv,
        id_survey: item.id_survey
      };
    });

  } catch (err) {
    error.value = 'Error al obtener tareas: ' + err.message;
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const colorMap = {
  Rojo: '#EF5350',
  Azul: '#64B5F6',
  Amarillo: '#FFD54F'
};

function mapColor(color) {
  switch ((color || '').toLowerCase()) {
    case 'rojo':
      return 'red'
    case 'azul':
      return 'blue'
    case 'amarillo':
      return 'amber darken-2'
    case 'verde':
      return 'green'
    case 'gris':
      return 'grey'
    default:
      return 'grey'
  }
}

function filtrar() {
  teratrib.value = teratribSeleccionado.value;
}

</script>
<style scoped>
.grupo {
  margin: 5px;
  padding: 5px;
  border-radius: 5px;
  background-color: #eaeded;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
              0 1px 5px 0 rgba(0, 0, 0, 0.12),
              0 3px 1px -2px rgba(0, 0, 0, 0.2);
  width: 100%;
}

.grupo2 {
  display: flex;
  flex-direction: column;
  height: 345px;
}

.card {
  margin: 5px;
  padding: 5px;
  color: #757575;
  border-radius: 5px;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
}

.card.indicador {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  background: white;
}
</style>
