<template>
  <div>Crear Survey</div>
  <br>
  <v-row
    v-if="puedeCrear"
    dense
  >
    <v-col cols="2">
      <v-select
        v-model="areaSeleccionada"
        label="Area"
        :items="areas"
        variant="outlined"
        density="compact"
        bg-color="white"
        item-title="name_area"
        item-value="id_area"
        :disabled="bloquearArea"
        :clearable="!bloquearArea"
      />
    </v-col>

    <v-col cols="2">
      <v-select
        v-model="tipoSeleccionado"
        label="Familia"
        :items="tiposSurvey"
        variant="outlined"
        density="compact"
        bg-color="white"
        item-title="name_tipo_srv"
        item-value="id_tipo_srv"
        :disabled="medioAmbienteBloqueado"
        :clearable="!medioAmbienteBloqueado"
      />
    </v-col>
    <v-col cols="2">
      <v-select
        v-model="templateSeleccionado"
        label="Protocolo"
        :items="templatesOptions"
        variant="outlined"
        density="compact"
        bg-color="white"
        item-title="name_template_srv"
        item-value="id_template"
        clearable
      />
    </v-col>
    <v-col cols="2">
      <v-select
        v-model="clienteSeleccionado"
        label="Cliente"
        :items="clientes"
        item-title="name_empresa"
        item-value="id_empresa"
        variant="outlined"
        density="compact"
        bg-color="white"
        clearable
      />
    </v-col>
    <v-col cols="2">
      <v-select
        v-model="proyectoSeleccionado"
        label="Proyecto"
        :items="proyectos"
        item-title="nombre_proyecto"
        item-value="id_proyecto"
        variant="outlined"
        density="compact"
        bg-color="white"
        clearable
      />
    </v-col>
    <v-col cols="2">
      <!--v-select
          label="Usuario"
          :items="usuarios"
          variant="outlined"
          density="compact"
          bg-color="white"
          item-title="nombre_user"
          item-value="id_user"
          v-model="usuarioSeleccionado"
          clearable
        ></v-select-->
    </v-col>
    <v-col cols="2">
      <v-text-field
        v-model="fechaPlanInicio"
        label="Fecha Inicio Plan"
        type="date"
        density="compact"
        variant="outlined"
        hide-details
        bg-color="white"
        style="max-width: auto"
      />
    </v-col>
    <v-col cols="2">
      <v-text-field
        v-model="fechaPlanFin"
        label="Fecha Fin Plan"
        type="date"
        density="compact"
        variant="outlined"
        hide-details
        bg-color="white"
        style="max-width: auto"
      />
    </v-col>
    <v-col cols="2">
      <v-btn
        color="primary"
        :disabled="!puedeCrear"
        @click="crearSurvey"
      >
        Crear Survey
      </v-btn>
    </v-col>
  </v-row>
  <v-row dense>
    <v-col cols="12">
      <div>
        <v-table
          dense
          class="text-caption"
          fixed-header
          height="700px"
        >
          <thead>
            <tr>
              <th class="text-left">
                Id Protocolo
              </th>
              <!--th class="text-left">Tipo Documento</th>
                <th class="text-left">Area</th-->
              <th class="text-left">
                Familia
              </th>
              <th class="text-left">
                Nombre Protocolo
              </th>
              <th class="text-left">
                Cliente
              </th>
              <th class="text-left">
                Proyecto
              </th>
              <th class="text-left">
                Usuario
              </th>
              <th class="text-left">
                Empresa Cliente
              </th>
              <th class="text-left">
                Estado
              </th>

              <th class="text-left">
                Fecha Inicio Plan
              </th>
              <th class="text-left">
                Fecha Fin Plan
              </th>
              <th class="text-left">
                Fecha Inicio Real
              </th>
              <th class="text-left">
                Fecha Fin Real
              </th>
              <th class="text-left">
                Fecha Fin Ejec
              </th>
              <th class="text-left">
                Fecha Fin Verificación
              </th>
              <th class="text-left">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in surveys"
              :key="item.id_survey"
            >
              <td @click="abrirModalConSurvey(item.id_survey)">
                {{ item.id_survey }}
              </td>
              <!--td>{{ item.desc_template_srv }}</td>

                <td>{{ item.name_area }}</td-->
              <td @click="abrirModalConSurvey(item.id_survey)">
                {{ item.name_tipo_srv }}
              </td>
              <td @click="abrirModalConSurvey(item.id_survey)">
                {{ item.name_template_srv }}
              </td>
              <td @click="abrirModalConSurvey(item.id_survey)">
                {{ item.name_empresa_cliente }}
              </td>
              <td @click="abrirModalConSurvey(item.id_survey)">
                {{ item.nombre_proyecto }}
              </td>
              <td v-if="editingId === item.id_survey">
                <v-select
                  v-model="editCache.id_user"
                  :items="usuarios"
                  item-title="nombre_user"
                  item-value="id_user"
                  density="compact"
                  variant="underlined"
                  hide-details
                  style="min-width: 150px"
                />
              </td>
              <td v-else>
                {{ item.nombre_user }}
              </td>
              <td @click="abrirModalConSurvey(item.id_survey)">
                {{ item.name_empresa_cliente }}
              </td>
              <td @click="abrirModalConSurvey(item.id_survey)">
                {{ item.estado_srv }}
              </td>

              <td v-if="editingId === item.id_survey">
                <v-text-field
                  v-model="editCache.fecha_plan_ini"
                  type="date"
                  density="compact"
                  variant="underlined"
                  hide-details
                  style="min-width: 140px"
                />
              </td>
              <td v-else>
                {{ item.fecha_plan_ini }}
              </td>
              <td v-if="editingId === item.id_survey">
                <v-text-field
                  v-model="editCache.fecha_plan_fin"
                  type="date"
                  density="compact"
                  variant="underlined"
                  hide-details
                  style="min-width: 140px"
                />
              </td>
              <td v-else>
                {{ item.fecha_plan_fin }}
              </td>
              <td @click="abrirModalConSurvey(item.id_survey)">
                {{ item.fecha_real_ini }}
              </td>
              <td @click="abrirModalConSurvey(item.id_survey)">
                {{ item.fecha_real_fin }}
              </td>
              <td @click="abrirModalConSurvey(item.id_survey)">
                {{ item.fecha_ejec_fin }}
              </td>
              <td @click="abrirModalConSurvey(item.id_survey)">
                {{ item.fecha_verif_fin }}
              </td>

              <td>
                <div v-if="puedeCrear">
                  <template v-if="item.estado_srv === 'Creado'">
                    <!-- Si está editando -->
                    <template v-if="editingId === item.id_survey">
                      <v-icon
                        size="26"
                        color="green"
                        @click="guardarCambios(item)"
                      >
                        mdi-check
                      </v-icon>
                      <v-icon
                        size="26"
                        color="red"
                        @click="cancelarEdicion"
                      >
                        mdi-close
                      </v-icon>
                    </template>

                    <!-- Si no está editando -->
                    <template v-else>
                      <v-icon
                        size="26"
                        @click="editar(item)"
                      >
                        mdi-pencil
                      </v-icon>
                    </template>
                  </template>

                  <v-icon
                    size="26"
                    @click="showModalAsignarFlujo(item.id_survey)"
                  >
                    mdi-account-multiple
                  </v-icon>
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>
    </v-col>
  </v-row>
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
  <v-dialog
    v-model="showModalAsignar"
    max-width="700"
  >
    <v-card>
      <v-toolbar
        color="primary"
        dark
      >
        <v-toolbar-title>Asignar Survey Flujo</v-toolbar-title>
        <v-spacer />
        <v-btn
          icon
          @click="showModalAsignar = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text>
        <template
          v-for="flujo in flujos"
          :key="flujo.id_flow_stp"
        >
          <v-row dense>
            <v-col cols="4">
              <!--strong>Paso {{ flujo.flow_tmpl_step_orden }}:</strong> {{ flujo.name_rol }} - <em>{{ flujo.id_user }}</em> flow actual: {{ flujo.id_flow_stp }} <br-->
              <strong>Paso {{ flujo.flow_tmpl_step_orden }}:</strong> {{ flujo.name_rol }}
            </v-col>
            <v-col cols="8">
              <v-select
                v-model="flujo.id_user"
                :label="`Usuario (${flujo.name_rol})`"
                :items="usuariosPorRol(flujo.name_rol)"
                item-title="nombre_user"
                item-value="id_user"
                density="compact"
                variant="underlined"
                hide-details="auto"
                clearable
                @update:model-value="val => markDirty(flujo, val)"
              />
            </v-col>
          </v-row>
          <br>
        </template>

        <div class="d-flex justify-end gap-2 mt-4">
          <v-btn
            variant="text"
            color="grey-darken-2"
            @click="showModalAsignar = false"
          >
            <v-icon
              start
              icon="mdi-close"
            />
            Cancelar
          </v-btn>

          <v-btn
            type="submit"
            color="primary"
            @click="asignarSurveyFlujo"
          >
            <v-icon
              start
              icon="mdi-check"
            />
            Asignar
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import apiAxios from '@/services/api';
import { useUserDetailStore } from "@/stores/userDetail";

const userDetailStore = useUserDetailStore()

const medioAmbienteBloqueado = computed(() => !!props.medioAmbiente)
const bloquearArea = computed(() => !!props.medioAmbiente || !!props.calidad)

const props = defineProps({
  fechaDesde: String,
  fechaHasta: String,
  clienteId: [String, Number],
  proyectoId: [String, Number],
  medioAmbiente: Boolean,
  calidad: Boolean
})

const areas = ref([]);
const tiposSurvey = ref([]);
const templatesSurvey = ref([]);
const clientes = ref([]);
const proyectos = ref([]);
const usuarios = ref([]);
const usuariosFlow = ref([]);
const usuariosFlowSeleccionado = ref(null);
const selectedSurveyIdSeleccionado = ref(null);

const flujosAprobacion = ref([])
const flujos = ref([])

const areaSeleccionada = ref(null);
const tipoSeleccionado = ref(null);
const templateSeleccionado = ref(null);
const clienteSeleccionado = ref(null);
const proyectoSeleccionado = ref(null);
const usuarioSeleccionado = ref(null);

const surveys = ref([]);

const editingId = ref(null);
const editCache = ref({});

const emit = defineEmits(['surveyCreado']);

// Utilidad para fecha de hoy
const obtenerFechaHoy = () => {
  const hoy = new Date();
  return hoy.toISOString().split('T')[0];
}
const fechaPlanInicio = ref(obtenerFechaHoy());
const fechaPlanFin = ref(obtenerFechaHoy());

const selectedSurveyId = ref(null)
const showModal = ref(false)
const showModalAsignar = ref(false)

const roles = ref([])
const currentUserHasRol11 = ref(false);
const rolesLoading = ref(true)

let snapshotAsignaciones = new Map()
const guardando = ref(false)

const hasRol11 = computed(() => {
  const uid = Number(userDetailStore.userDetail?.id_user)
  return roles.value.some(r => Number(r.id_user) === uid && Number(r.id_rol) === 11)
})

const hasRol12 = computed(() => {
  const uid = Number(userDetailStore.userDetail?.id_user)
  return roles.value.some(r => Number(r.id_user) === uid && Number(r.id_rol) === 12)
})

// ✅ puede crear si (Calidad && rol 11) OR (MedioAmbiente && rol 12)
const puedeCrear = computed(() => {
  const okCalidad = !!props.calidad && hasRol11.value
  const okMA      = !!props.medioAmbiente && hasRol12.value
  return okCalidad || okMA
})

// Al montar: cargar catálogos
onMounted(() => {
  obtenerAreas();
  obtenerClientes();
  //obtenerProyectos();
  obtenerUsuarios();
  getSurveys();

  if (userDetailStore.userDetail?.id_user) {
    obtenerUsuariosRoles();
  }
});

async function showModalAsignarFlujo(surveyId) {
  selectedSurveyIdSeleccionado.value = surveyId;
  showModalAsignar.value = true;

  await obtenerFlujosAprobacion(surveyId);
  await obtenerFlujosByIdSurvey(flujosAprobacion.value);

  // normaliza tipos para comparar bien
  flujos.value = flujos.value.map(f => ({
    ...f,
    id_user: f.id_user == null || f.id_user === '' ? null : Number(f.id_user)
  }));

  prepararAsignaciones(); // 👈 ahora sí, con flujos cargados
  snapshotAsignaciones = new Map(
    flujos.value.map(f => [f.id_flow_stp, normaliza(f.id_user)])
  );

  console.log('Snapshot listo:', Array.from(snapshotAsignaciones.entries()));
}

function normaliza(v) {
  return v == null || v === '' ? null : Number(v)
}

// Llamar esto al abrir el modal (antes de editar)
function prepararAsignaciones () {
  flujos.value.forEach(f => {
    f._orig_user = f.id_user == null || f.id_user === '' ? null : Number(f.id_user)
    f._dirty = false
  })
}

// Se dispara cuando el usuario cambia el select de ESA fila
function markDirty (fila, nuevoVal) {
  const nuevo = normaliza(nuevoVal)
  if (fila._orig_user === undefined) fila._orig_user = normaliza(fila.id_user)
  fila._dirty = nuevo !== fila._orig_user
}

const tieneCambios = computed(() => flujos.value.some(f => f._dirty))

async function asignarSurveyFlujo () {
  const cambios = flujos.value.filter(f => f._dirty)
  if (!cambios.length) { showModalAsignar.value = false; return }

  console.table(cambios.map(f => ({
    step: f.id_flow_stp,
    orig: f._orig_user,
    nuevo: f.id_user
  })))

  const url = '/survey/UpdUserFlow'
  const reqs = cambios.map(f => axios.put(url, {
    id_flow_stp: f.id_flow_stp,
    id_user_flujo: Number(f.id_user)
  }))

  const urlNotf = '/notfqueue'
  const reqsNotf = cambios.map(f => axios.post(urlNotf, {
    id_user_target: Number(f.id_user),
    id_template: null,
    json_data: { 'id_survey': selectedSurveyIdSeleccionado.value, 'id_flow': flujosAprobacion.value, 'id_area': 6, 'tipo_notf': 'asignacion_firma', 'obs_notf': 'asignacion firma' },
    channels: {'channel': 'WEB'},
    estado: 'PENDING'
  }))

  const res = await Promise.allSettled(reqs)
  const resNotf = await Promise.allSettled(reqsNotf)

  res.forEach((r, i) => {
    const f = cambios[i]
    if (r.status === 'fulfilled') { f._orig_user = Number(f.id_user); f._dirty = false }
    else { console.error('Falló step', f.id_flow_stp, r.reason) }
  })

  showModalAsignar.value = false
  await getSurveys?.()
}

function abrirModalConSurvey(id) {
  console.log('Abrir modal para idInspeccion:', id);
  selectedSurveyId.value = id;
  showModal.value = true;
}

watch(() => userDetailStore.userDetail?.id_user, (val) => {
  if (val) obtenerUsuariosRoles();
});



// === estado ===
const rolesFlujoList = ref([])     // [{id_rol, name_rol, ...}]
const usuariosRolesList = ref([])  // [{id_user, id_rol}]
//const usuariosFlow = ref([])       // [{id_user, nombre_user}]  <-- ya lo tienes
// const flujos = ref([])          // [{ name_rol, ... }]       <-- ya lo tienes

// === fetchers ===
async function fetchRolesFlujo () {
  try {
    const { data } = await apiAxios.get(
      '/servicio/leanglobal/obtenerRoles'
    )
    rolesFlujoList.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('fetchRolesFlujo error:', e)
    rolesFlujoList.value = []
  }
}

async function fetchUsuariosRoles () {
  try {
    const { data } = await apiAxios.get(
      '/servicio/leanglobal/obtenerUsuariosRoles'
    )
    usuariosRolesList.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('fetchUsuariosRoles error:', e)
    usuariosRolesList.value = []
  }
}

// Cargar una vez
onMounted(() => Promise.all([fetchRolesFlujo(), fetchUsuariosRoles()]))

// === mapeos para filtrar rápido ===
const rolNameToId = computed(() => {
  const m = Object.create(null)
  for (const r of rolesFlujoList.value) m[r.name_rol] = r.id_rol
  return m
})

const usersByRolId = computed(() => {
  const m = new Map()
  for (const ur of usuariosRolesList.value) {
    if (!m.has(ur.id_rol)) m.set(ur.id_rol, new Set())
    m.get(ur.id_rol).add(Number(ur.id_user))
  }
  return m
})

// === función usada por el v-select ===
function usuariosPorRol (rolName) {
  const rolId = rolNameToId.value[rolName]
  if (!rolId) return []
  const ids = usersByRolId.value.get(rolId)
  if (!ids) return []
  // devuelve [{id_user, nombre_user}] de ese rol
  return usuariosFlow.value.filter(u => ids.has(Number(u.id_user)))
}


// ----------------------------
// GETs
// ----------------------------

const obtenerFlujosAprobacion = async (surveyId) => {
  try {
    const { data } = await apiAxios.get(
      '/servicio/leanglobal/flujosAprobacion'
    )
    flujosAprobacion.value = data.datos || []
    flujosAprobacion.value = flujosAprobacion.value.filter(f => f.id_survey === surveyId)
    flujosAprobacion.value = flujosAprobacion.value[0]?.id_flow || null
    console.log('flujosAprobacion:', flujosAprobacion.value)
  } catch (e) {
    console.error('flujosAprobacion error:', e)
    flujosAprobacion.value = []
  }
}

const obtenerFlujosByIdSurvey = async (flowId) => {
  try {
    if (!flowId || flowId === null) {
      flujos.value = []
      return
    }
    const { data } = await apiAxios.get(
      `/servicio/leanglobal/flujosAprobacionSteps?id_flow=${flowId}`
    )
    flujos.value = data || []
    flujos.value.sort(
      (a, b) => (a?.flow_tmpl_step_orden ?? Infinity) - (b?.flow_tmpl_step_orden ?? Infinity)
    );
  } catch (e) {
    console.error('flujosByIdSurvey error:', e)
    flujos.value = []
  }
}

const obtenerUsuariosRoles = async () => {
  try {
    const { data } = await apiAxios.get(
      '/servicio/leanglobal/obtenerUsuariosRoles'
    )
    roles.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('roles error:', e)
    roles.value = []
  } finally {
    rolesLoading.value = false
  }
}


function autoSelectCalidad () {
  if (!props.calidad) return;
  if ((areas.value?.length || 0) === 0) return;

  const target = 'calidad';
  let elegido =
    areas.value.find(a => normalize(a.name_area) === target) ||
    areas.value.find(a => normalize(a.name_area).startsWith(target)) ||
    areas.value.find(a => normalize(a.name_area).includes(target)) ||
    areas.value[0];

  areaSeleccionada.value = elegido?.id_area ?? null;
}

// Intenta seleccionar automáticamente el área “Medio Ambiente” y la primera familia
function autoSelectMedioAmbiente () {
  if (!props.medioAmbiente) return;

  if (!areaSeleccionada.value && (areas.value?.length || 0) > 0) {
    const ma =
      areas.value.find(a => /medio\s*ambiente/i.test(String(a.name_area))) ||
      areas.value[0];
    areaSeleccionada.value = ma?.id_area ?? null;
  }

  // Ya NO seleccionar familia aquí; se hace en obtenerTipos()
}

// Llamar al cambiar el prop (por si se activa después)
watch(() => props.medioAmbiente, (val) => {
  if (val) autoSelectMedioAmbiente()
})

// 🔧 Helper genérico para ordenar por texto (con tildes y números)
const sortByText = (arr, selector) =>
  [...(arr ?? [])].sort((a, b) =>
    String(selector(a) ?? '').localeCompare(String(selector(b) ?? ''), 'es', {
      sensitivity: 'base',
      numeric: true,
    })
  );

// 🧠 Aux para nombres de usuario (si no viene nombre_completo)
const fullName = u =>
  [u.primer_nombre, u.segundo_nombre, u.apellido_paterno, u.apellido_materno]
    .filter(Boolean)
    .join(' ');

// Llamar cuando llegue el catálogo de áreas
const obtenerAreas = async () => {
  try {
    const { data } = await apiAxios.get(
      '/servicio/leanglobal/obtenerAreas?id_empresa=2'
    )
    areas.value = sortByText(data, x => x.name_area)

    if (props.calidad) {
      autoSelectCalidad()
    } else if (props.medioAmbiente) {
      autoSelectMedioAmbiente()
    }
  } catch (err) {
    console.error('Error al obtener áreas:', err)
  }
}


watch(() => props.calidad, (val) => {
  if (val) autoSelectCalidad()
})

watch(areaSeleccionada, (nuevoArea) => {
  if (nuevoArea) {
    obtenerTipos(nuevoArea);
  } else {
    tiposSurvey.value = [];
    tipoSeleccionado.value = null;
    templatesSurvey.value = [];
    templateSeleccionado.value = null;
  }
});

// Llamar cuando lleguen los tipos (familias)
// helper para comparar textos sin acentos / case-insensitive
const normalize = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();

const obtenerTipos = async (id_area) => {
  try {
    const { data } = await apiAxios.get(
      `/servicio/leanglobal/obtenerTipoTemplate?id_area=${id_area}`
    );
    tiposSurvey.value = sortByText(data, x => x.name_tipo_srv);

    // Si medioAmbiente está activo, selecciona el tipo "Medio Ambiente"
    if (props.medioAmbiente && (tiposSurvey.value?.length || 0) > 0) {
      const target = 'medio ambiente';

      // 1) match exacto (sin acentos / case)
      let elegido = tiposSurvey.value.find(
        t => normalize(t.name_tipo_srv) === target
      );

      // 2) si no hay exacto, match por inicio
      if (!elegido) {
        elegido = tiposSurvey.value.find(
          t => normalize(t.name_tipo_srv).startsWith(target)
        );
      }

      // 3) si no hay por inicio, match por incluye
      if (!elegido) {
        elegido = tiposSurvey.value.find(
          t => normalize(t.name_tipo_srv).includes(target)
        );
      }

      // 4) fallback al primero
      elegido = elegido || tiposSurvey.value[0];

      tipoSeleccionado.value = elegido?.id_tipo_srv ?? null;
    } else {
      // comportamiento normal si no está medioAmbiente
      tipoSeleccionado.value = null;
      templatesSurvey.value = [];
    }
  } catch (err) {
    console.error('Error al obtener tipos:', err);
  }
};


watch(tipoSeleccionado, (nuevoTipo) => {
  if (nuevoTipo) {
    obtenerTemplates(nuevoTipo);
  } else {
    templatesSurvey.value = [];
    templateSeleccionado.value = null;
  }
});


// 🔎 Opciones para el select de protocolos:
// - Si medioAmbiente=false: muestra todo.
// - Si medioAmbiente=true: solo “Carga diaria combustible”.
const templatesOptions = computed(() => {
  const list = sortByText(templatesSurvey.value || [], x => x.name_template_srv)
  if (!props.medioAmbiente) return list

  const target = 'carga diaria combustible'
  return list.filter(t => normalize(t.name_template_srv).includes(target))
})

// (Opcional) autoseleccionar si queda una sola opción y aún no hay selección
watch([templatesOptions, () => props.medioAmbiente], ([opts, esMA]) => {
  if (esMA && !templateSeleccionado.value && opts.length === 1) {
    templateSeleccionado.value = opts[0].id_template
  }
})

const obtenerTemplates = async (id_tipo_srv) => {
  try {
    const { data } = await apiAxios.get(`/servicio/leanglobal/obtenerTemplates?id_tipo_srv=${id_tipo_srv}`);
    templatesSurvey.value = sortByText(data, x => x.name_template_srv);
  } catch (err) {
    console.error('Error al obtener templates:', err);
  }
};

const obtenerClientes = async () => {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerEmpresas');
    clientes.value = sortByText(data, x => x.name_empresa);
  } catch (err) {
    console.error(err);
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
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerProyectos?id_empresa_cliente=' + (id_cliente || ''));
    proyectos.value = sortByText(data, x => x.nombre_proyecto);
  } catch (err) {
    console.error(err);
  }
};

const obtenerUsuarios = async () => {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerUsuarios');
    usuarios.value = data;
    usuariosFlow.value = data;
  } catch (err) {
    console.error(err);
  }
};

// ----------------------------
// MAIN: GET SURVEYS
// ----------------------------
// Reemplaza tu getSurveys actual por este
async function getSurveys({ onlyLast = false } = {}) {
  try {
    const proyectoId = (props.proyectoId == null || String(props.proyectoId).trim().toLowerCase() === 'null' || String(props.proyectoId).trim() === '')
      ? ''
      : props.proyectoId;

    const clienteId = (props.clienteId == null || String(props.clienteId).trim().toLowerCase() === 'null' || String(props.clienteId).trim() === '')
      ? ''
      : props.clienteId;

    const url = `/servicio/leanglobal/procesosSurveyV3` +
      `?fecha_desde=${props.fechaDesde}` +
      `&fecha_hasta=${props.fechaHasta}` +
      `&ts.id_empresa_cliente=${clienteId}` +
      `&ts.id_proyecto=${proyectoId}`;

    const response = await apiAxios.get(url);

    const ordenados = (response.data.datos || []).sort(
      (a, b) => Number(b.id_survey) - Number(a.id_survey)
    );

    // 👇 si se pide solo el último (y además medioAmbiente es true), deja un solo registro
    surveys.value = (props.medioAmbiente && onlyLast && ordenados.length)
      ? [ordenados[0]]
      : ordenados;

  } catch (error) {
    console.error("❌ Error al obtener survey:", error);
    surveys.value = [];
  }
}

// ✅ Exponer para que el padre pueda llamarlo
defineExpose({ getSurveys });

// ----------------------------
// CRUD
// ----------------------------
const editar = (item) => {
  editingId.value = item.id_survey;
  editCache.value = { ...item };
};

const cancelarEdicion = () => {
  editingId.value = null;
  editCache.value = {};
};

const guardarCambios = async (originalItem) => {
  //console.log('Guardar cambios para item:', originalItem.id_survey);
  const data = {
    id_user: editCache.value.id_user,
    fecha_plan_ini: editCache.value.fecha_plan_ini,
    fecha_plan_fin: editCache.value.fecha_plan_fin
  };

  try {
    await apiAxios.put(`/survey/UpdPlan/${editCache.value.id_survey}`, data);
    console.log('✅ Cambios guardados');
    const urlNotf = '/notfqueue'
    await apiAxios.post(urlNotf, {
      id_user_target: Number(editCache.value.id_user),
      id_template: null,
      json_data: { 'id_survey': originalItem.id_survey, 'id_flow': originalItem.id_flow, 'id_area': 1, 'tipo_notf': 'asignacion_protocolo', 'obs_notf': 'asignacion protocolo' },
      channels: {'channel': 'WEB'},
      estado: 'PENDING'
    });
    getSurveys();
  } catch (error) {
    console.error('❌ Error al guardar cambios:', error);
  }

  editingId.value = null;
  editCache.value = {};
};

const crearSurvey = async () => {
  if (!tipoSeleccionado.value || !templateSeleccionado.value || !fechaPlanInicio.value || !fechaPlanFin.value) {
    console.error('Por favor, completa todos los campos requeridos.');
    return;
  }
  if (!userDetailStore.userDetail?.id_user) {
    console.error("El ID de usuario no está disponible.");
    return;
  }

  const header_seed   = templatesSurvey.value.find(t => t.id_template === templateSeleccionado.value)?.header_seed || {};
  const body_seed     = templatesSurvey.value.find(t => t.id_template === templateSeleccionado.value)?.body_seed || [];
  const approval_seed = templatesSurvey.value.find(t => t.id_template === templateSeleccionado.value)?.approval_seed || {};
  const id_flow_tmpl  = templatesSurvey.value.find(t => t.id_template === templateSeleccionado.value)?.id_flow_tmpl || null;

  // 👇 si medioAmbiente es true, forzamos el usuario logueado
  const idUser = props.medioAmbiente
    ? userDetailStore.userDetail.id_user
    : (usuarioSeleccionado.value ?? userDetailStore.userDetail.id_user);

  const data = {
    id_tipo_srv: tipoSeleccionado.value,
    id_template: templateSeleccionado.value,
    id_user: null,
    id_user_creacion: userDetailStore.userDetail.id_user,
    id_empresa_cliente: clienteSeleccionado.value,
    estado_srv: 'Creado',
    header_seed: JSON.stringify(header_seed),
    body_seed: JSON.stringify(body_seed),
    approval_seed: JSON.stringify(approval_seed),
    header_exec: JSON.stringify(header_seed),
    body_exec: JSON.stringify(body_seed),
    approval_exec: JSON.stringify(approval_seed),
    fecha_plan_ini: fechaPlanInicio.value,
    fecha_plan_fin: fechaPlanFin.value,
    fecha_real_ini: null,
    fecha_real_fin: null,
    fecha_upload: null,
    latitud: null,
    longitud: null,
    id_proyecto: proyectoSeleccionado.value,
    id_flow_tmpl
  };

  try {
    const resp = await apiAxios.post('/survey/', data);

    // 🟢 Si medioAmbiente es true, deja solo el último en la tabla (como ya tenías)
    if (props.medioAmbiente) {
      const creado =
        resp?.data?.datos?.[0] ||
        resp?.data?.survey ||
        (resp?.data && resp.data.id_survey ? resp.data : null);

      if (creado?.id_survey) {
        surveys.value = [creado];
        // 👇 EMITE EL ID AL PADRE
        emit('surveyCreado', {
          id: creado.id_survey,
          fechaDesde: fechaPlanInicio.value,
          fechaHasta: fechaPlanFin.value,
          clienteId: clienteSeleccionado.value ?? '',
          proyectoId: proyectoSeleccionado.value ?? ''
        });
      } else {
        await getSurveys({ onlyLast: true });
        // si llegaste acá y tienes surveys, emite el primero
        if (surveys.value?.[0]?.id_survey) {
          emit('surveyCreado', {
            id: surveys.value[0].id_survey,
            fechaDesde: fechaPlanInicio.value,
            fechaHasta: fechaPlanFin.value,
            clienteId: clienteSeleccionado.value ?? '',
            proyectoId: proyectoSeleccionado.value ?? ''
          });
        }
      }
    } else {
      await getSurveys();
      // si quieres, también puedes emitir el id en modo normal
      if (surveys.value?.[0]?.id_survey) {
        emit('surveyCreado', {
          id: surveys.value[0].id_survey,
          fechaDesde: fechaPlanInicio.value,
          fechaHasta: fechaPlanFin.value,
          clienteId: clienteSeleccionado.value ?? '',
          proyectoId: proyectoSeleccionado.value ?? ''
        });
      }
    }

  } catch (error) {
    console.error('Error al crear el survey:', error);
  }
};
</script>
