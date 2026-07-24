<template>
  <DashboardLayout>
    <div>
      <v-row
        class="mb-0"
        dense
      >
        <v-col cols="12">
          <v-card class="pt-2">
            <v-tabs v-model="tab">
              <v-tab
                value="one"
                @click="teratribSeleccionado = 10"
              >
                Dashboard Calidad
              </v-tab>
              <v-tab
                value="two"
                @click="teratribSeleccionado = 11"
              >
                Planificación Calidad
              </v-tab>
              <v-tab value="three">
                Agenda Protocolos
              </v-tab>
              <v-row
                class="px-1 pt-1"
                dense
              >
                <v-col cols="auto">
                  <v-text-field
                    v-model="fechaDesdeSeleccionada"
                    label="Fecha Inicio Plan"
                    type="date"
                    density="compact"
                    variant="outlined"
                    hide-details
                    style="max-width: 180px"
                  />
                </v-col>
                <v-col cols="auto">
                  <v-text-field
                    v-model="fechaHastaSeleccionada"
                    label="Fecha Fin Plan"
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
                    clearable
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
                    clearable
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
            </v-tabs>

            <v-card-text>
              <v-tabs-window v-model="tab">
                <v-tabs-window-item value="one">
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
                          style="padding-bottom: 4px;
                            font-size: 16px;
                          "
                        >
                          Perspectiva Geográfica
                        </div>
                        <Mapa
                          ref="mapaComp"
                          :fecha-desde="fechaDesde"
                          :fecha-hasta="fechaHasta"
                          :cliente-id="cliente"
                          :proyecto-id="proyecto"
                        />
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
                        <VerInspecciones
                          ref="verInspeccionesComp"
                          :fecha-desde="fechaDesde"
                          :fecha-hasta="fechaHasta"
                          :cliente-id="cliente"
                          :proyecto-id="proyecto"
                        />
                      </div>
                    </v-col>
                  </v-row>
                </v-tabs-window-item>

                <v-tabs-window-item value="two">
                  <v-row dense>
                    <v-col cols="12">
                      <div class="grupo">
                        <CrearInspeccion
                          ref="crearInspeccionComp"
                          :fecha-desde="fechaDesde"
                          :fecha-hasta="fechaHasta"
                          :cliente-id="cliente"
                          :proyecto-id="proyecto"
                          @survey-creado="onSurveyCreado"
                        />
                      </div>
                    </v-col>
                  </v-row>
                </v-tabs-window-item>

                <v-tabs-window-item value="three">
                  <VerCalendario />
                </v-tabs-window-item>
              </v-tabs-window>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </DashboardLayout>
  <v-dialog
    v-model="showModal"
    max-width="1000"
  >
    <v-card>
      <v-toolbar
        color="primary"
        dark
      >
        <v-toolbar-title>Detalle de Inspección</v-toolbar-title>
        <v-spacer />
        <v-btn
          icon
          @click="showModal = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text>
        <VerSurvey :Survey="selectedSurveyId" />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script setup>
import DashboardLayout from '../layouts/dashboard.vue';
import VerInspecciones from '../components/VerInspecciones.vue';
import CrearInspeccion from '../components/CrearInspeccion.vue';
import VerCalendario from '../components/VerCalendario.vue';
import Mapa from '../components/Mapa.vue';
import Highcharts from 'highcharts/highcharts-gantt'
import { ref, onMounted, computed, nextTick } from 'vue';
import apiAxios from '@/services/api';

import { useRouter } from 'vue-router'

import { useUserDetailStore } from "@/stores/userDetail";

const userDetailStore = useUserDetailStore()

const router = useRouter()

const clientes = ref([]);
const proyectos = ref([]);
const familias = ref([]);
const tareas = ref([]);

const cliente = ref(null);
const clienteSeleccionado = ref(null);
const proyecto = ref(null);
const proyectoSeleccionado = ref(null);

const loading = ref(false);
const error = ref(null);

const today = new Date()

// 2. Creamos una copia y le restamos 1 mes
const oneMonthAgo = new Date(today)
oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

// 3. La formateamos a ISO (YYYY-MM-DD)
const isoOneMonthAgo = oneMonthAgo.toISOString().split('T')[0]

// 4. Inicializamos las refs con esa fecha
const fechaDesde = ref(isoOneMonthAgo)
const fechaDesdeSeleccionada = ref(isoOneMonthAgo)

// (opcional) si quieres que hasta siga siendo hoy:
const isoToday = today.toISOString().split('T')[0]
const fechaHasta = ref(isoToday)
const fechaHastaSeleccionada = ref(isoToday)

const teratrib = ref(10);
const teratribSeleccionado = ref(10);
const jsonData = ref([]);

const chartContainer = ref(null);
const chartInstance = ref(null)

const tab = ref(null);

const showModal = ref(false);
const selectedSurveyId = ref(null);

const mapaComp = ref(null);

const crearInspeccionComp = ref(null)
const verInspeccionesComp = ref(null)

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
  console.log('userDetailStore.userDetail', userDetailStore.userDetail.id_user);
  // Obtener datos necesarios
  await obtenerClientes();
  await obtenerProyectos();
  await obtenerFamilias();
  await obtenerTareas();

  //const response = await fetch('/data.json');
  const response = await fetch('/data.json');
  const data = await response.json();
  jsonData.value = data;

  await nextTick();
  mapaComp.value?.refreshMap();

  initChart();
});

async function onSurveyCreado({ fechaDesde: fDesde, fechaHasta: fHasta, clienteId, proyectoId }) {
  // Asignamos a los campos seleccionados del filtro
  fechaDesdeSeleccionada.value = fDesde;
  fechaHastaSeleccionada.value = fHasta;
  clienteSeleccionado.value = clienteId;
  proyectoSeleccionado.value = proyectoId;

  // Luego filtramos con los nuevos valores
  await nextTick(); // Espera que Vue reactive los cambios
  filtrar();
}

function abrirModalConSurvey(id) {
  console.log('Abrir modal para idInspeccion:', id);
  selectedSurveyId.value = id;
  showModal.value = true;
}

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
watch(clienteSeleccionado, (nuevoCliente) => {
  if (nuevoCliente) {
    obtenerProyectos(nuevoCliente);
  } else {
    proyectoSeleccionado.value = null;
  }
});

const obtenerProyectos = async (id_cliente) => {
  loading.value = true;
  error.value = null;
  try {
    const response = await apiAxios.get('/servicio/leanglobal/obtenerProyectos?id_empresa_cliente=' + (id_cliente || ''));
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
    const response = await apiAxios.get('/servicio/leanglobal/procesosSurveyV3');

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

async function filtrar() {
  teratrib.value = teratribSeleccionado.value;
  fechaDesde.value = fechaDesdeSeleccionada.value;
  fechaHasta.value = fechaHastaSeleccionada.value;
  cliente.value = clienteSeleccionado.value;
  proyecto.value = proyectoSeleccionado.value;

  await nextTick();

  updateChart()

  crearInspeccionComp.value?.getSurveys();
  verInspeccionesComp.value?.getSurveys();

  const tareasFiltradas = tareas.value.filter(t => {
    const fecha = new Date(t.fecha_plan_ini)
    const desde = new Date(fechaDesde.value)
    const hasta = new Date(fechaHasta.value)
    const fechaOk = (!fechaDesde.value || fecha >= desde) && (!fechaHasta.value || fecha <= hasta)
    const clienteOk = !cliente.value || t.id_empresa_cliente == cliente.value
    const proyectoOk = !proyecto.value || t.id_proyecto == proyecto.value
    return fechaOk && clienteOk && proyectoOk
  })

  mapaComp.value?.setPuntos(tareasFiltradas)
}

function initChart() {
  // 1. Convertir las fechas seleccionadas a timestamps
  const minDate = new Date(fechaDesdeSeleccionada.value).getTime();
  const maxDate = new Date(fechaHastaSeleccionada.value).getTime();

  // 2. Inicializar el Gantt con Highcharts
  chartInstance.value = Highcharts.ganttChart(chartContainer.value, {
    chart: {
      height: 35 * tasksGantt.value.length  // ajusta la altura según nº de tareas
    },
    xAxis: [
      {
        // Eje de días
        min: minDate,
        max: maxDate,
        labels: {
          style: { fontSize: "9px" },
          format: "{value:%d}"   // día del mes
        },
        grid: {
          enabled: true,
          cellHeight: 20
        },
        tickInterval: 24 * 3600 * 1000  // un día en ms
      },
      {
        // Eje de meses
        min: minDate,
        max: maxDate,
        labels: {
          format: "{value:%b}"   // mes abreviado
        },
        grid: {
          enabled: true,
          cellHeight: 20
        },
        tickInterval: 30 * 24 * 3600 * 1000  // ~un mes en ms
      }
    ],
    yAxis: {
      categories: categoriasGantt.value,
      grid: { cellHeight: 30 },
      labels: {
        useHTML: true,
        style: { fontSize: '11px' }
      }
    },
    plotOptions: {
      series: {
        pointHeight: 10,
        borderRadius: 4,
        connectors: { enabled: false },
        dataLabels: { enabled: false },
        point: {
          events: {
            click() {
              // Al hacer clic en una barra, abre el modal
              this.series.chart.options.customOptions.onPointClick(this.id);
            }
          }
        }
      }
    },
    tooltip: {
      useHTML: true,
      formatter() {
        return `
          <b>${this.point.name}</b><br/>
          ${categoriasGantt.value[this.point.y]}<br/>
          <b>ID Survey:</b> ${this.point.id_survey}<br/>
          <b>Inicio Plan:</b> ${Highcharts.dateFormat('%Y-%m-%d', this.point.start)}<br/>
          <b>Fin Plan:</b> ${Highcharts.dateFormat('%Y-%m-%d', this.point.end)}
        `;
      }
    },
    customOptions: {
      onPointClick: abrirModalConSurvey
    },
    series: [{
      name: 'Tareas',
      data: tasksGantt.value
    }]
  });
}

function updateChart() {
  if (!chartInstance.value) return;

  // 1️⃣ convierte las fechas a timestamp
  const min = new Date(fechaDesde.value).getTime();
  const max = new Date(fechaHasta.value).getTime();

  // 2️⃣ Filtra usando todas las condiciones
  const filtered = tasksGantt.value.filter(pt => {
    const fechaOk = (!fechaDesde.value || pt.start >= min) && (!fechaHasta.value || pt.end <= max);
    const clienteOk = !cliente.value || pt.cliente == cliente.value;
    const proyectoOk = !proyecto.value || pt.nombre_proyecto == proyecto.value;
    return fechaOk && clienteOk && proyectoOk;
  });

  // 3️⃣ Actualiza extremos del eje X para el rango
  chartInstance.value.xAxis[0].setExtremes(min, max);

  // 4️⃣ Actualiza los datos de la serie
  chartInstance.value.series[0].setData(filtered);
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
