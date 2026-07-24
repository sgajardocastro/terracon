<template>
  <DashboardLayout>
    <div>
      <v-row
        class="px-1 pt-1"
        dense
      >
        <!-- Tabs scrollables en mobile -->
        <!-- TABS: sin flechas en móvil y vertical en móvil -->
        <!-- DESKTOP / TABLET (como antes) -->
        <div v-if="mdAndUp">
          <v-tabs
            v-model="tabMenu"
            show-arrows
          >
            <v-tab
              v-show="canSeeDashboardMedioAmbiente"
              value="one"
            >
              Dashboard Medio Ambiente
            </v-tab>
            <v-tab value="two">
              Planificación Medio Ambiente
            </v-tab>
            <v-tab value="three">
              Ejecución
            </v-tab>

            <!-- Filtros en fila, como antes -->
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
                  style="max-width:180px"
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
                  style="max-width:180px"
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
                  style="width:180px"
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
                  style="width:180px"
                  clearable
                />
              </v-col>
              <v-col cols="auto">
                <v-btn @click="filtrar()">
                  Filtrar
                </v-btn>
              </v-col>
              <v-col cols="auto">
                <v-btn
                  :loading="exporting"
                  @click="exportarExcel"
                >
                  Exportar
                </v-btn>
              </v-col>
            </v-row>
          </v-tabs>
        </div>

        <!-- MOBILE (sin scroll, todo apilado) -->
        <div v-else>
          <!-- Tabs en columna, sin flechas -->
          <v-tabs
            v-model="tabMenu"
            class="tabs-mobile"
            :show-arrows="false"
            direction="vertical"
          >
            <v-tab
              v-show="canSeeDashboardMedioAmbiente"
              value="one"
            >
              Dashboard Medio Ambiente
            </v-tab>
            <v-tab
              value="two"
              @click="teratribSeleccionado = 11"
            >
              Planificación Medio Ambiente
            </v-tab>
            <v-tab value="three">
              Ejecución
            </v-tab>
          </v-tabs>

          <!-- Filtros uno bajo otro -->
          <v-row
            class="px-3 pt-3 ga-2"
            dense
          >
            <v-col cols="12">
              <v-text-field
                v-model="fechaDesdeSeleccionada"
                label="Fecha Inicio Plan"
                type="date"
                density="compact"
                variant="outlined"
                hide-details
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="fechaHastaSeleccionada"
                label="Fecha Fin Plan"
                type="date"
                density="compact"
                variant="outlined"
                hide-details
              />
            </v-col>
            <v-col cols="12">
              <v-select
                v-model="clienteSeleccionado"
                :items="clientes"
                item-title="name_empresa"
                item-value="id_empresa"
                label="Cliente"
                density="compact"
                variant="outlined"
                clearable
              />
            </v-col>
            <v-col cols="12">
              <v-select
                v-model="proyectoSeleccionado"
                :items="proyectos"
                item-title="nombre_proyecto"
                item-value="id_proyecto"
                label="Proyecto"
                density="compact"
                variant="outlined"
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
            <v-col cols="auto">
              <v-btn @click="abrirDialog()">
                Agregar Datos
              </v-btn>
            </v-col>
          </v-row>
        </div>

        <v-card-text>
          <v-tabs-window v-model="tabMenu">
            <!-- TAB 1 -->
            <v-tabs-window-item value="one">
              <!-- Indicadores -->
              <v-row dense>
                <v-col cols="12">
                  <div class="grupos">
                    <div
                      v-for="(item, i) in jsonData"
                      :key="i"
                    >
                      <div
                        v-for="(grupo, gi) in item.grupo"
                        :key="gi"
                      >
                        <GrupoIndicador
                          :grupo="grupo"
                          :fecha-desde="fechaDesde"
                          :fecha-hasta="fechaHasta"
                          :id-activo="idActivoMA"
                          @toggle="onIndicadorToggle"
                        />
                      </div>
                    </div>
                  </div>
                </v-col>
              </v-row>

              <!-- Tabs dinámicos -->
              <v-card class="mt-2">
                <!--v-tabs v-model="tab" grow>
                  <v-tab v-for="t in tabs" :key="t.value" :value="t.value">
                    {{ t.label }}
                  </v-tab>
                </v-tabs-->

                <v-card-text>
                  <v-tabs-window v-model="tab">
                    <v-tabs-window-item
                      v-for="t in tabs"
                      :key="t.value"
                      :value="t.value"
                    >
                      <!-- Si NO hay sub-indicadores -->
                      <IndicadorSimple
                        v-if="!(t.indicador?.indicadores?.length)"
                        :key="refreshSeq + '-S-' + t.value"
                        :config="t.indicador"
                        :fecha-desde="fechaDesde"
                        :fecha-hasta="fechaHasta"
                      />

                      <!-- Si SÍ hay sub-indicadores (segundo nivel) -->
                      <IndicadorCompuesto
                        v-else
                        :key="refreshSeq + '-C-' + t.value"
                        :force-key="refreshSeq + '-' + t.value"
                        :config="t.indicador"
                        :fecha-desde="fechaDesde"
                        :fecha-hasta="fechaHasta"
                      />
                    </v-tabs-window-item>
                  </v-tabs-window>
                </v-card-text>
              </v-card>
            </v-tabs-window-item>

            <!-- TAB 2 -->
            <v-tabs-window-item value="two">
              <v-row dense>
                <v-col cols="12">
                  <v-row dense>
                    <v-col cols="12">
                      <div class="grupo">
                        <CrearInspeccion
                          ref="crearInspeccionComp"
                          :fecha-desde="fechaDesde"
                          :fecha-hasta="fechaHasta"
                          :cliente-id="cliente"
                          :proyecto-id="proyecto"
                          :medio-ambiente="true"
                          @survey-creado="onSurveyCreado"
                        />
                      </div>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-tabs-window-item>

            <!-- TAB 3 -->
            <v-tabs-window-item value="three">
              <keep-alive>
                <template v-if="!selectedSurveyId">
                  <Surveys
                    :medio-ambiente="true"
                    @open-inspeccion="handleOpenInspeccion"
                  />
                </template>

                <template v-else>
                  <!-- Pásale el id al componente -->
                  <Inspeccion
                    :id-inspeccion="selectedSurveyId"
                    @close="closeInspeccion"
                  />
                </template>
              </keep-alive>
            </v-tabs-window-item>
          </v-tabs-window>
        </v-card-text>
      </v-row>
    </div>
    <v-dialog
      v-model="dialogCargarDatos"
      max-width="1400"
    >
      <v-card class="dlg-lleno">
        <v-toolbar
          color="primary"
          dark
        >
          <v-toolbar-title>Crear inspección y editar matriz</v-toolbar-title>
          <v-spacer />
          <v-btn
            icon
            @click="dialogCargarDatos = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text class="dlg-contenido">
          <div class="split-vertical-50">
            <!-- 50% superior: CrearInspeccion -->
            <section class="panel panel-superior">
              <div class="panel-scroll">
                <CrearInspeccion
                  ref="crearInspeccionComp"
                  :fecha-desde="fechaDesde"
                  :fecha-hasta="fechaHasta"
                  :cliente-id="cliente"
                  :proyecto-id="proyecto"
                  :medio-ambiente="true"
                  @survey-creado="onSurveyCreado"
                />
              </div>
            </section>

            <!-- 50% inferior: MatrizEditor -->
            <section class="panel panel-inferior">
              <div class="panel-scroll">
                <MatrizEditor
                  v-if="matrizJson"
                  v-model="matrizJson"
                />
                <div
                  v-else
                  class="text-medium-emphasis text-body-2"
                >
                  Crea o selecciona una inspección para cargar su matriz…
                </div>
              </div>
            </section>
          </div>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="dialogCargarDatos = false"
          >
            Cerrar
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!matrizJson || !selectedSurveyId"
            :loading="savingMatriz"
            @click="guardarMatriz"
          >
            Guardar matriz
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </DashboardLayout>
</template>

<script setup>
import DashboardLayout from '../layouts/dashboard.vue';
import { ref, onMounted, watch, nextTick } from 'vue';
import apiAxios from '@/services/api';
import MatrizEditor from '@/components/MatrizEditor.vue';
import GrupoIndicador from '@/components/GrupoIndicador.vue';
import IndicadorSimple from '@/components/IndicadorSimple.vue';
import IndicadorCompuesto from '@/components/IndicadorCompuesto.vue';
import CrearInspeccion from '@/components/CrearInspeccion.vue';
import Surveys from '@/components/Surveys.vue';
import Inspeccion from '@/components/Inspeccion.vue';

import { useUserDetailStore } from "@/stores/userDetail";
import { useDisplay } from 'vuetify'

const { smAndDown } = useDisplay()
const { mdAndUp } = useDisplay()

const userDetailStore = useUserDetailStore()
const tab  = ref('')     // <- sin 'admin'
const tabs = ref([])     // <- solo tabs dinámicos
const jsonData = ref([])
const refreshSeq = ref(0) // 👈 contador de “refresh” sin watchers

const dialogCargarDatos = ref(false)
const crearInspeccionComp = ref(null)
const idActivoMA = ref(null)

const tabMenu = ref('one') // para tabs fijos (Dashboard, Planificación, Agenda)

function handleOpenInspeccion({ id /*, notifId*/ }) {
  selectedSurveyId.value = id
}

function closeInspeccion() {
  selectedSurveyId.value = null
}

// Normaliza id (usa el id del indicador o <nombreGrupo>-<index> como fallback)
const normVal = (id) => String(id).replace(/\s+/g, '_')

onMounted(async () => {
  console.log(import.meta.env.BASE_URL + 'dataMedioAmbiente.json')
  const resp = await fetch(import.meta.env.BASE_URL + 'dataMedioAmbiente.json');
  const data = await resp.json()
  jsonData.value = data
  buildTabsFromData()
  await obtenerClientes()
  await obtenerProyectos()
  await obtenerMotivoRechazo()
  await obtenerRoles()
  await obtenerUsuariosRoles()
  await filtrar()

  // ✅ setea tabMenu UNA vez según permiso real
  if (!tabMenu.value) {
    tabMenu.value = canSeeDashboardMedioAmbiente.value ? 'one' : 'two'
  }

  tabMenu.value = canSeeDashboardMedioAmbiente.value ? 'one' : 'two'
  await nextTick()

  if (tabMenu.value !== 'three') {
    await filtrar()
  }
})

// 🔐 ID del rol (igual que hiciste con QLTY_PROG en Calidad)
const ID_MEAM_PROG = 20 // <-- usa el ID real
const rolesUsuario = ref([])
// ✅ Computed simple (MISMO patrón que Calidad)
const canSeeDashboardMedioAmbiente = computed(() => {
  const userId = Number(userDetailStore.userDetail?.id_user)
  if (!userId) return false

  console.log('rolesUsuario', userId)

  return rolesUsuario.value.some(
    r =>
      Number(r.id_user) === userId &&
      Number(r.id_rol) === ID_MEAM_PROG
  )
})

const obtenerUsuariosRoles = async () => {
  const { data } = await apiAxios.get('/servicio/leanglobal/obtenerUsuariosRoles')
  rolesUsuario.value = Array.isArray(data) ? data : []
  console.log('rolesUsuario', rolesUsuario.value)
}

watch(jsonData, buildTabsFromData, { deep: true })

function abrirDialog() {
  dialogCargarDatos.value = true
}

function buildTabsFromData() {
  const acc = []
  ;(jsonData.value ?? []).forEach(item => {
    (item.grupo ?? []).forEach(grupo => {
      (grupo.indicadores ?? []).forEach((ind, idx) => {
        const rawId = ind?.id ?? `${grupo?.nombreCorto ?? 'grupo'}-${idx}`
        acc.push({
          value: normVal(rawId),
          label: ind?.titulo ?? ind?.nombre ?? ind?.id ?? `Indicador ${idx + 1}`,
          indicador: ind,
          _rawId: rawId,
        })
      })
    })
  })

  tabs.value = dedupeBy(t => t.value, acc)
  // seleccionar el primero si el actual ya no existe
  if (!tabs.value.some(t => t.value === tab.value)) {
    tab.value = tabs.value[0]?.value || ''
  }
}

function dedupeBy(keyFn, arr) {
  const s = new Set()
  return arr.filter(x => {
    const k = keyFn(x)
    if (s.has(k)) return false
    s.add(k); return true
  })
}

// ⬅️ Activar el tab del indicador clickeado
function onIndicadorToggle(payload) {
  const rawId = (payload && typeof payload === 'object') ? payload.id : payload
  const wanted = normVal(rawId)

  // 🔹 Toggle de resaltado (mismo comportamiento que la otra vista)
  idActivoMA.value = (idActivoMA.value === rawId ? null : rawId)

  const found  = tabs.value.find(t => t.value === wanted)
  if (found) tab.value = found.value
  else console.log('No hay tab para:', wanted)
}

const today = new Date();

// 🔹 15 días antes
const fifteenDaysAgo = new Date(today);
fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

// 🔹 15 días después
const fifteenDaysLater = new Date(today);
fifteenDaysLater.setDate(fifteenDaysLater.getDate() + 15);

// 🔹 Convertir a YYYY-MM-DD
const isoFifteenDaysAgo = fifteenDaysAgo.toISOString().split('T')[0];
const isoFifteenDaysLater = fifteenDaysLater.toISOString().split('T')[0];

// 🔹 Inicializar refs
const fechaDesde = ref(isoFifteenDaysAgo);
const fechaDesdeSeleccionada = ref(isoFifteenDaysAgo);

const fechaHasta = ref(isoFifteenDaysLater);
const fechaHastaSeleccionada = ref(isoFifteenDaysLater);

const clientes = ref([]);
const cliente = ref(null);
const clienteSeleccionado = ref(null);
const proyectos = ref([]);
const proyecto = ref(null);
const proyectoSeleccionado = ref(null);

const loading = ref(false);
const error = ref(null);

const motivosRechazo = ref([]);
const roles = ref([]);

/*async function filtrar () {
  fechaDesde.value = fechaDesdeSeleccionada.value
  fechaHasta.value = fechaHastaSeleccionada.value
  cliente.value    = clienteSeleccionado.value
  proyecto.value   = proyectoSeleccionado.value

  refreshSeq.value++   // fuerza re-montaje de IndicadorSimple
}*/

async function filtrar() {
  fechaDesde.value = fechaDesdeSeleccionada.value;
  fechaHasta.value = fechaHastaSeleccionada.value;

  // fuerza a number o deja undefined
  cliente.value = (clienteSeleccionado.value === null || clienteSeleccionado.value === undefined || clienteSeleccionado.value === '')
    ? ''
    : Number(clienteSeleccionado.value);

  proyecto.value = (proyectoSeleccionado.value === null || proyectoSeleccionado.value === undefined || proyectoSeleccionado.value === '')
    ? ''
    : Number(proyectoSeleccionado.value);

  await nextTick();

  crearInspeccionComp.value?.getSurveys();
}

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

const obtenerMotivoRechazo = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await apiAxios.get('/servicio/leanglobal/obtnerMotivosRechazo');
    motivosRechazo.value = response.data;
  } catch (err) {
    error.value = 'Error al obtener Motivos: ' + err.message;
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const BYPASS_ROLES = new Set(['MEAM_PROG', 'MEAM_GCIA', 'MEAM_ADMIN', 'MEAM_APRB', 'GRAL_PROG', 'GRAL_GCIA', 'GRAL_ADMIN', 'GRAL_APRB'])

function getRolesNames() {
  try {
    const raw = JSON.parse(localStorage.getItem('rolesNames') || '[]')
    return Array.isArray(raw)
      ? raw.map(r => String(r || '').trim().toUpperCase()).filter(Boolean)
      : []
  } catch {
    return []
  }
}

function getProjectsIds() {
  try {
    const raw = JSON.parse(localStorage.getItem('proyectsIds') || '[]')
    return Array.isArray(raw) ? raw.map(Number).filter(Number.isFinite) : []
  } catch {
    return []
  }
}

function canSeeAllProjects() {
  const roles = getRolesNames()
  return roles.some(r => BYPASS_ROLES.has(String(r || '').trim().toUpperCase()))
}

const obtenerProyectos = async (id_cliente) => {
  loading.value = true
  error.value = null

  try {
    const response = await apiAxios.get(
      '/servicio/leanglobal/obtenerProyectos?id_empresa_cliente=' + (id_cliente || '')
    )

    let data = Array.isArray(response.data) ? response.data : []

    // 🔐 Si NO es PROG/GCIA/ADMIN → filtrar por projectsIds solo cuando existan
    if (!canSeeAllProjects()) {
      const projectsIds = getProjectsIds()

      if (projectsIds.length) {
        data = data.filter(p => projectsIds.includes(Number(p.id_proyecto)))
      }
    }

    proyectos.value = data
  } catch (err) {
    error.value = 'Error al obtener proyectos: ' + err.message
    console.error(err)
  } finally {
    loading.value = false
  }
}

const obtenerRoles = async (id_cliente) => {
  loading.value = true;
  error.value = null;
  try {
    const response = await apiAxios.get('/servicio/leanglobal/obtenerRoles');
    roles.value = response.data;
  } catch (err) {
    error.value = 'Error al obtener roles: ' + err.message;
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const selectedSurveyId = ref(null)
const matrizJson = ref(null)
const savingMatriz = ref(false)

// llamado por <CrearInspeccion @survey-creado="onSurveyCreado">
async function onSurveyCreado (payload) {
  // payload = { id: <id_survey> }
  if (!payload?.id) return
  selectedSurveyId.value = payload.id
  await cargarMatrizDeSurvey(payload.id) // 👈 esto setea matrizJson
}

// Carga body_exec (o body_seed) del survey
async function cargarMatrizDeSurvey (id) {
  try {
    const { data } = await apiAxios.get(
      "/servicio/leanglobal/procesosSurveyDetail?id_survey=" + id
      // si tu GET real es otro, cámbialo (p.ej. .../leanglobal/surveyById?id=${id})
    )

    const bodyExec =
      data?.body_exec ||
      data?.datos?.[0]?.body_exec ||
      data?.survey?.body_exec

    if (bodyExec) {
      matrizJson.value = typeof bodyExec === 'string'
        ? JSON.parse(bodyExec)
        : bodyExec
    } else {
      // fallback con tu matriz vacía
      matrizJson.value = {
        "segmentos": [
          {
            "label": "CONTROL DE ABASTECIMIENTO DE GENERADOR (MODELO - TIPO COMBUSTIBLE)",
            "touch": true,
            "posicion": 1,
            "attributes": [
              {
                "type": "matriz",
                "label": "CONTROL DE ABASTECIMIENTO DE GENERADOR (MODELO - TIPO COMBUSTIBLE)",
                "headers": [[
                  {"label":"Nombre"}, {"label":"Tipo Combustible"},
                  {"label":"Cantidad (lt)"}, {"label":"Horas Funcionando"},
                  {"label":"Observación"}
                ]],
                "dialog": [{
                  "title": "COTA PROFUNDIDAD DE SELLO",
                  "inputs": [
                    {"label":"Nombre"},{"label":"Tipo Combustible"},
                    {"label":"Cantidad (lt)"},{"label":"Horas Funcionando"},
                    {"label":"Observación"}
                  ]
                }],
                "body":[]
              }
            ],
            "collapsible": false
          }
        ]
      }
    }
  } catch (e) {
    console.error('Error cargando matriz:', e)
    matrizJson.value = null
  }
}

watch(canSeeDashboardMedioAmbiente, (canSee) => {
  // si no puede ver el dashboard y está en one → lo sacamos
  if (!canSee && tabMenu.value === 'one') tabMenu.value = 'two'

  // si SÍ puede ver y aún no hay tab válido o quedó en two por default → lo llevamos a one
  if (canSee && (!tabMenu.value || tabMenu.value === 'two')) tabMenu.value = 'one'
}, { immediate: true })

// Guarda la matriz editada
async function guardarMatriz () {
  if (!selectedSurveyId.value || !matrizJson.value) return
  savingMatriz.value = true
  try {
    await apiAxios.put(
      `/survey/UpdBody/${selectedSurveyId.value}`,
      { body_exec: JSON.stringify(matrizJson.value) }
    )
  } catch (e) {
    console.error('Error guardando matriz:', e)
  } finally {
    savingMatriz.value = false
  }
}

</script>

<style scoped>
.parent-table,
.child-table {
  width: 100%;
  border-collapse: collapse;
}

.parent-table th,
.parent-table td,
.child-table th,
.child-table td {
  padding: 4px;
  padding-left: 8px;
  text-align: left;
}

.expand-button-cell {
  text-align: center;
  width: 48px;
}

.expand-cell {
  padding: 0;
  background-color: #fafafa;
}

.child-table {
  margin: 0;
  width: 100%;
}

.child-table th {
  background-color: #f5f5f5;
}

.expand-wrapper {
  padding-left: 48px;
  width: 100%;
  box-sizing: border-box;
}

.bold-row td {
  font-weight: bold;
}
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

.dlg-lleno {
  height: 90vh;               /* alto total del diálogo */
  display: flex;
  flex-direction: column;
}

.dlg-contenido {
  flex: 1;                    /* ocupa todo entre toolbar y actions */
  display: flex;
  padding: 16px;
}

/* 2 filas, 50/50, con gap */
.split-vertical-50 {
  display: grid;
  grid-template-rows: 1fr 1fr;  /* 50% / 50% */
  gap: 16px;
  width: 100%;
  height: 100%;
}

.panel {
  min-height: 0;              /* importante para que el scroll funcione */
  display: flex;
  flex-direction: column;
}

.panel-scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;             /* scroll interior */
}

.indicador--active {
  outline: 2px solid #1976d2;    /* azul Vuetify */
  border-radius: 6px;
}
</style>
