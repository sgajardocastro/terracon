<template>
  <v-container>
    <v-row>
      <v-col
        cols="6"
        sm="6"
      >
        <v-combobox
          v-model="filtro"
          :items="filtros"
          item-value="ID"
          item-title="NOMBRE"
          label="Filtro Estados"
          variant="outlined"
          class="bg-white"
          density="compact"
          return-object
        />
      </v-col>

      <v-col
        cols="6"
        sm="6"
      >
        <v-combobox
          v-model="filtroDim"
          :items="filtroDimension"
          item-value="ID"
          item-title="NOMBRE"
          label="Filtro Dimensión"
          variant="outlined"
          class="bg-white"
          density="compact"
          return-object
        />
      </v-col>

      <v-col cols="12">
        <v-text-field
          v-model="filtroTexto"
          density="compact"
          variant="outlined"
          label="Buscar Texto"
          class="bg-white"
          required
        />
      </v-col>

      <v-col
        v-for="survey in filteredSurveys"
        :key="survey.id_survey"
        cols="12"
      >
        <v-card
          class="mx-auto sombra-resaltada"
          :subtitle="`${survey.name_empresa_cliente} / ${survey.nombre_proyecto}`"
          :title="`${survey.desc_template_srv }: ${survey.name_template_srv}`"
          @click="goToInspeccion(survey.id_survey, notifPrimaryId(survey.id_survey))"
        >
          <template #append>
            <v-icon
              v-if="hasNotif(survey.id_survey)"
              color="red-darken-2"
              icon="mdi-bell-ring"
              size="30"
            />
          </template>
          <v-chip
            :color="getEstadoColor(survey.estado_color).color"
            label
            size="large"
            class="ml-2 text-white"
            variant="flat"
          >
            {{ getEstadoColor(survey.estado_color).texto }}
          </v-chip>
          <v-card-text>
            {{ `${survey.codi_template_srv} (Id ${survey.id_survey})` }}<br>
            Fecha Planificada de Ejecución: {{ survey.fecha_plan_ini }}<br>
            Estado: {{ survey.estado_srv }}
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup>
import { onMounted, ref, computed } from "vue";
import apiAxios from '@/services/api';
import { useUserDetailStore } from "@/stores/userDetail";
import { useRouter } from 'vue-router'
const router = useRouter()
/* eslint-disable */
const props = defineProps({
  medioAmbiente: Boolean,
  seguridad: Boolean
})

const emit = defineEmits(['open-inspeccion'])
const userDetailStore = useUserDetailStore()
console.log("userDetailStore.userDetail", userDetailStore.userDetail.id_user);
const filtros = ref([
  { ID: 1, NOMBRE: 'Creado' },
  { ID: 2, NOMBRE: 'Ejecución' },
  { ID: 4, NOMBRE: 'VERIFICACION' },
  { ID: 5, NOMBRE: 'APROBADO' }
]);

const filtro = ref(null);
const filtroTexto = ref('');
const surveys = ref([]);
const filtroDim = ref(null);
const filtroDimension = ref([]);
const notificaciones = ref([]);

onMounted(() => {
  getSurvey();
  cargarNotificaciones();
});

async function goToInspeccion(id, notifId) {
  try {
    if (notifId) {
      await apiAxios.put(
        '/notfqueue/updNotfqueue',
        { id_notifcation: notifId, estado: 'DONE' }
      )
    }
  } catch (e) {
    console.error('❌ Error al actualizar la notificación:', e)
    // No bloqueamos la navegación interna por esto
  }

  // 👉 Enviamos el id al padre para que cargue el componente
  emit('open-inspeccion', { id, notifId })
}

/*async function goToInspeccion(id, tieneNotif) {
  console.log('Ir a inspección', id, tieneNotif)
  await apiAxios.put(
    '/notfqueue/updNotfqueue',
    {
      id_notifcation: tieneNotif,
      estado: 'DONE'
    }
  )
  .then(response => {
    console.log('✅ Notificación Actualizada:', response.data);
  })
  .catch(error => {
    console.error('❌ Error al actualizar la notificación:', error);
  })
  router.push({
    path: '/inspeccion',
    query: { idInspeccion: String(id) },
  })
}*/

async function getSurvey() {
  let name_area = '';
  /*if (props.medioAmbiente) {
    name_area = props.medioAmbiente ? 'Medio Ambiente' : '';
  }
  if(props.seguridad) {
    name_area = props.seguridad ? 'Seguridad' : '';
  }*/

  try {
    /*const { data } = await apiAxios.get(
      "/servicio/leanglobal/procesosSurvey?id_user=" +
      userDetailStore.userDetail.id_user + "&name_area=" + name_area
    );*/
    let { data } = await apiAxios.get(
      `/servicio/leanglobal/procesosSurveyV3`
    );
    data = Array.isArray(data.datos) ? data.datos : [];

    console.log("Datos obtenidos del API:", data);

    // 1) Filtra
    const filtrados = (data ?? []).filter(
      it => it.estado_srv !== "APROBADO" && it.estado_srv !== "VERIFICACION" && it.id_user == userDetailStore.userDetail.id_user
    );

    console.log("Surveys filtrados:", filtrados);

    // 2) Ordena desc por id_survey (robusto si viene como string)
    const toNum = v => (typeof v === 'number' ? v : parseInt(String(v), 10) || 0);
    surveys.value = filtrados.sort((a, b) => toNum(b.id_survey) - toNum(a.id_survey));

    // 3) Filtro de áreas (opcional, igual que antes)
    const uniqueAreas = [...new Set(surveys.value.map(it => it.name_area))];
    filtroDimension.value = uniqueAreas.map((area, i) => ({ ID: i + 1, NOMBRE: area }));

    console.log("Surveys obtenidos:", surveys.value);
  } catch (error) {
    console.error("Error al obtener survey:", error);
  }
}

const filteredSurveys = computed(() => {
  return (surveys.value ?? []).filter(s => {
    const coincideEstado = !filtro.value || s.estado_srv === filtro.value.NOMBRE;
    const coincideDimension = !filtroDim.value || s.name_area === filtroDim.value.NOMBRE;

    const texto = filtroTexto.value?.toLowerCase() ?? '';
    const coincideTexto =
      !texto ||
      s.name_template_srv?.toLowerCase().includes(texto) ||
      s.name_empresa_cliente?.toLowerCase().includes(texto) ||
      s.nombre_proyecto?.toLowerCase().includes(texto) ||
      s.codi_template_srv?.toLowerCase().includes(texto);

    return coincideEstado && coincideDimension && coincideTexto;
  });
});

function getEstadoColor(estado) {
  switch (estado) {
    case 'Azul':
      return {color: 'blue-darken-2', texto: 'A mas de un día según plan'};
    case 'Amarillo':
      return {color: 'amber-darken-2', texto: 'Vence en un día'};
    case 'Verde':
      return {color: 'green-darken-2', texto: 'Terminado'};
    case 'Rojo':
      return {color: 'red-darken-2', texto: 'Vencido según plan'};
    default:
      return {color: 'grey', texto: 'Desconocido'};
  }
}

// Llama tu endpoint y normaliza
async function cargarNotificaciones() {
  const { data } = await apiAxios.get(
    `/servicio/leanglobal/obtenerNortificaciones?id_user_target=${userDetailStore.userDetail.id_user}`
  )
  notificaciones.value = Array.isArray(data) ? data : []
}
const notifSet = computed(() => {
  const s = new Set()
  for (const n of notificaciones.value) {
    const id = Number(n?.json_data?.id_survey)
    if (!Number.isNaN(id)) s.add(id)
  }
  return s
})

const hasNotif = (id) => notifSet.value.has(Number(id))

const notifBySurvey = computed(() => {
  const m = new Map()
  for (const n of notificaciones.value) {
    const sid = Number(n?.json_data?.id_survey)
    if (!Number.isNaN(sid)) {
      if (!m.has(sid)) m.set(sid, [])
      m.get(sid).push(n)
    }
  }
  return m
})

const notifPrimaryId = (sid) => {
  const arr = notifBySurvey.value.get(Number(sid))
  return arr?.[0]?.id_notification ?? null
}

function getSurveys() {
  return getSurvey()
}

defineExpose({ getSurveys })
</script>
<style scoped>
tbody tr:nth-of-type(odd) {
  background-color: rgba(0, 0, 0, 0.05);
}
.sombra-resaltada {
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3) !important;
  border-radius: 12px;
}
</style>
