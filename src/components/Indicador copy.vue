<template>
  <div
    id="contenedor"
    class="contenedor"
  >
    <div class="card indicador">
      <div class="indicador-header">
        <div
          id="iconbox"
          class="card icono"
          :style="{ background: color }"
          @click="consultar"
        >
          <v-icon class="icon">
            {{ icon }}
          </v-icon>
        </div>
        <label class="titulo">{{ titulo }}</label>
      </div>

      <div class="detalle">
        <div class="dato">
          {{ formatNumero(dato) }} {{ indicador.unidad }}
        </div>

        <div class="acciones">
          <!--v-icon
            class="icono-accion"
            v-if="!soloTabla"
            icon="mdi-chart-bar"
            @click="vergrafico"
          ></v-icon>

          <v-icon
            class="icono-accion"
            icon="mdi-table"
            @click="verdatos"
          ></v-icon-->

          <v-icon
            v-if="!soloTabla"
            class="icono-accion"
            icon="mdi-chart-box"
            @click="verambos"
          />
        </div>
      </div>
    </div>
  </div>
  <v-dialog
    v-model="isActive"
    max-width="1000"
  >
    <v-card>
      <v-card-text class="px-2 py-3">
        <v-row>
          <v-col cols="6">
            <div
              id="grafico"
              style="height: 400px; overflow-y: auto; background: #f5f5f5; padding: 10px; border-radius: 4px;"
            />
          </v-col>
          <v-col cols="6">
            <div
              id="tabla"
              style="height: 400px; overflow-y: auto; background: #f5f5f5; padding: 10px; border-radius: 4px;"
            >
              <v-table
                density="compact"
                class="elevation-1"
              >
                <thead>
                  <tr>
                    <th
                      v-for="(col, index) in props.indicador.columnas"
                      :key="index"
                    >
                      {{ col.header }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(fila, i) in data.datos"
                    :key="i"
                  >
                    <td
                      v-for="(col, j) in props.indicador.columnas"
                      :key="j"
                    >
                      {{ fila[col.nombre], col.tipo }}
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
      <!--v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text="Cerrar" @click="isActive = false"></v-btn>
      </v-card-actions-->
    </v-card>
  </v-dialog>
</template>

<script setup>
import { defineProps, ref, onMounted, watch, nextTick } from 'vue';
import moment from 'moment';
import Highcharts from 'highcharts';
import exportingInit from 'highcharts/modules/exporting'
import exportDataInit from 'highcharts/modules/export-data'

// Asegúrate de invocar las funciones SOLO si no han sido inicializadas antes
if (typeof Highcharts.Chart.prototype.exportChart === 'undefined') {
  exportingInit(Highcharts)
}

if (typeof Highcharts.Chart.prototype.downloadCSV === 'undefined') {
  exportDataInit(Highcharts)
}

const props = defineProps({
  icon: String,
  titulo: String,
  color: String,
  indicador: Object,
  acciones: Boolean,
  soloTabla: Boolean,
  url: String,
  fechaDesde: String,
  fechaHasta: String,
  teratrib: Number,
})

const dato = ref(0);
const isActive = ref(false);
const data = ref([]);

function formatNumero(n) {
  return n.toLocaleString('es-CL')
}

const headers = computed(() => {
  console.log(props.indicador.columnas);
  console.log(props.indicador.columnas?.map(col => ({
    text: col.header,
    value: col.nombre
  })) || []);
  return props.indicador.columnas?.map(col => ({
    text: col.header,
    value: col.nombre
  })) || [];
});

const items = computed(() => {
  console.log(data.value.datos || []);
  return data.value.datos || [];
});

async function cargarDato() {
  try {
    console.log(props.indicador);
    const response = await fetch("https://servidor.leanglobal.cl/api" + props.url + "?fecha_desde=" + props.fechaDesde + "&fecha_hasta=" + props.fechaHasta + "&teratrib=" + props.teratrib)
    data.value = await response.json()
    dato.value = parseFloat(data.value.indicador ?? 0);
    console.log(data.value);
  } catch (error) {
    console.error('Error al cargar dato del indicador:', error)
  }
}

// Ejecutar al montar el componente
onMounted(cargarDato)

// Volver a ejecutar cuando cambien las fechas
watch(
  () => [props.fechaDesde, props.fechaHasta, props.teratrib],
  () => {
    cargarDato()
  }
)

watch(isActive, async (val) => {
  if (val) {
    await nextTick()
    renderGrafico()
  }
})

function consultar() {
  // Lógica de consulta
  console.log('consultar')
}

function vergrafico() {
  // Lógica para mostrar gráfico
  console.log('vergrafico')
}

function verdatos() {
  // Lógica para mostrar tabla
  console.log('verdatos')
}

function verambos() {
  // Lógica para mostrar gráfico + tabla
  console.log('verambos');
  isActive.value = true; // Abre el diálogo
}

function renderGrafico() {
  let titulo = props.indicador.titulo;
  let grafico = props.indicador.grafico;
  let datos = data.value.datos;
  let categoriaNoDate = props.indicador.categoriaNoDate;
  let categorias = [];

  grafico.series.forEach(function (serie) {
    serie.data=[];
  });

  datos.forEach(function (item) {
    grafico.series.forEach(function (serie, index) {
      //series[index].data.push(item[serie.campo])
      serie.data.push(item[serie.campo])
    });
    if(categoriaNoDate){
      categorias.push(item[grafico.categoria]);
    }
    else{
      categorias.push(moment(item[grafico.categoria]).format("DD/MM"));
    }
  });

  Highcharts.chart('grafico', {
    exporting: {
      enabled: true
    },
    chart: {
      type: 'column'
    },
    title: {
      text: titulo,
      align: "left"
    },
    tooltip: {
      shared: true,
      headerFormat: '<span style="font-size: 10px">{point.key}</span><br/>',
      pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y}</b><br/>'
    },
    xAxis: {
      categories: categorias,
      labels: {
        AArotation: 45
      }
    },
    series: grafico.series,
    exporting: {
      enabled: true,
      buttons: {
        contextButton: {
          menuItems: [
            'viewFullscreen',      // Pantalla completa
            'printChart',          // Imprimir
            'downloadPNG',
            'downloadJPEG',
            'downloadPDF',
            'downloadSVG',
            'downloadCSV',
            'downloadXLS',
            'viewData'
          ],
        },
      },
    },
    navigation: {
      buttonOptions: {
        align: 'right',
        verticalAlign: 'top',
        x: -10,
        y: 10
      }
    }
  })
}
</script>

<style scoped>
.contenedor{
  width: 210px;
  padding-top: 20px;
  --cursor: pointer;
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
  height: auto;
}

.indicador-header {
  display: flex;
  align-items: start;
  height: 40px;
  margin-top: -5px;
}
.titulo {
  width: 130px;
  /*height: 35px;*/
  overflow-wrap: break-word;
  line-height: 15px;
}

.indicador {
  height: 90px;
}

.icono {
  position: relative;
  top: -25px;
  left: -10px;
  color: white;
  width: 40px;
  height: 40px;
}

.icon {
  font-size: 30px;
}

.detalle .dato {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.acciones {
  display: flex;
  justify-content: end;
  height: 10px;
  gap: 0px;
}

.icono-accion {
  position: relative;
  top: 0px;
  right: -10px;
  cursor: pointer;
  font-size: 24px;
}

.dato {
  font-size: 21px;
  font-weight: bold;
  width: -webkit-fill-available;
  height: 30px;
  text-align: center;
  /*width: max-content;*/
}
</style>
