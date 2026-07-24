<template>
  <div>
    <v-sheet
      class="d-flex"
      height="54"
      tile
    >
      <v-select
        v-model="type"
        :items="types"
        class="ma-2"
        density="compact"
        label="View Mode"
        variant="outlined"
        hide-details
      />
      <v-select
        v-model="weekday"
        :items="weekdays"
        class="ma-2"
        density="compact"
        label="weekdays"
        variant="outlined"
        hide-details
      />
    </v-sheet>
    <v-sheet>
      <v-calendar
        ref="calendar"
        v-model="value"
        :events="events"
        :view-mode="type"
        :weekdays="weekday"
        @click:event="onEventClick"
      >
        <template #event="{ event }">
          <v-tooltip location="top">
            <template #activator="{ props }">
              <div
                v-bind="props"
                class="px-1 py-1"
                :style="{ backgroundColor: event.color, borderRadius: '4px', color: 'white', cursor: 'pointer' }"
                @click.stop="onEventClick({ event })"
              >
                {{ event.title }}
              </div>
            </template>
            <div class="text-caption">
              <b>{{ event.title }}</b><br>
              <b>ID Survey:</b> {{ event.surveyId }}<br>
              <b>Estado:</b> {{ event.estado }}<br>
              <b>Inicio Plan:</b> {{ formatDate(event.start) }}<br>
              <b>Fin Plan:</b> {{ formatDate(event.end) }}<br>
              <b>Proyecto:</b> {{ event.proyecto }}<br>
              <b>Cliente:</b> {{ event.cliente }}
            </div>
          </v-tooltip>
        </template>
      </v-calendar>
    </v-sheet>
  </div>
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
import { ref, onMounted } from 'vue'
import { useDate } from 'vuetify'
import apiAxios from '@/services/api';
import VerSurvey from '../components/VerSurvey.vue'

// Composables
const adapter = useDate()

// Tipo de vista
const type = ref('month')
const types = ['month', 'week', 'day']

const surveys = ref([]);

// Días visibles
const weekday = ref([0, 1, 2, 3, 4, 5, 6])
const weekdays = [
  { title: 'Sun - Sat', value: [0, 1, 2, 3, 4, 5, 6] },
  { title: 'Mon - Sun', value: [1, 2, 3, 4, 5, 6, 0] },
  { title: 'Mon - Fri', value: [1, 2, 3, 4, 5] },
  { title: 'Mon, Wed, Fri', value: [1, 3, 5] },
]

// Fechas seleccionadas
const value = ref([new Date()])
const events = ref([])

// Opciones de colores y títulos
const colors = ['blue', 'indigo', 'deep-purple', 'cyan', 'green', 'orange', 'grey darken-1']
const titles = ['Meeting', 'Holiday', 'PTO', 'Travel', 'Event', 'Birthday', 'Conference', 'Party']

// Color para evento (puedes usarlo en el template)
const getEventColor = (event) => event.color

// Random
const rnd = (a, b) => Math.floor((b - a + 1) * Math.random()) + a

const selectedSurveyId = ref(null)
const showModal = ref(false)

// Al montar, generar eventos del mes actual
onMounted(() => {
  getSurveys();

})

const onEventClick = ({ event }) => {
  console.log('Evento clickeado:', event)
  selectedSurveyId.value = event.surveyId
  showModal.value = true
}

const formatDate = (date) => {
  if (!(date instanceof Date)) return ''
  return date.toISOString().split('T')[0]
}

const parseDate = (str) => {
  if (!str) return null
  // Forzar hora UTC para evitar desfases
  const iso = `${str}T12:00:00Z`
  const date = new Date(iso)
  return isNaN(date.getTime()) ? null : date
}

async function getSurveys() {
  try {
    const response = await apiAxios.get("/servicio/leanglobal/procesosSurveyV3");
    surveys.value = response.data.datos;
    console.log('✅ Surveys cargados:', surveys.value);

    // Limpiar eventos anteriores
    events.value = [];

    // Recorremos todos los surveys
    surveys.value.forEach((survey) => {
      if (survey.fecha_plan_ini && survey.fecha_plan_fin) {
        const start = parseDate(survey.fecha_plan_ini)
        const end = parseDate(survey.fecha_plan_fin)

        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          events.value.push({
            title: "ID: " + survey.id_survey + " - " + survey.name_template_srv  ?? 'Sin título',
            start,
            end,
            color: estadoColorMap(survey.estado_color),
            allDay: true,
            surveyId: survey.id_survey,
            estado: survey.estado_srv,
            proyecto: survey.nombre_proyecto,
            cliente: survey.name_empresa_cliente
          });
        } else {
          console.warn('❗ Fechas inválidas en survey omitido:', survey);
        }
      } else {
        console.warn('❗ Survey sin fechas omitido:', survey);
      }
    });

    console.log('✅ Todos los eventos generados:', events.value);

  } catch (error) {
    console.error("❌ Error al obtener surveys:", error);
  }
}

const estadoColorMap = (estadoColor) => {
  if (!estadoColor) return 'grey'
  switch (estadoColor.toLowerCase()) {
    case 'rojo': return 'red'
    case 'azul': return 'blue'
    case 'verde': return 'green'
    case 'amarillo': return 'orange'
    default: return 'grey'
  }
}
</script>
