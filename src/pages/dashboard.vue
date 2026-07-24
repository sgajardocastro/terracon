<template>
  <DashboardLayout>
    <div>
      <v-row
        class="mb-0"
        dense
      >
        <v-col cols="12">
          <v-card class="pt-2">
            <!-- ✅ FILTROS (sin tabs) -->
            <!-- DESKTOP / TABLET -->
            <div v-if="mdAndUp">
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
                    :item-title="item => item.codi_proyecto ? `${item.codi_proyecto} ${item.nombre_proyecto}` : item.nombre_proyecto"
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
            </div>

            <!-- MOBILE -->
            <div v-else>
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
                    :item-title="item => item.codi_proyecto ? `${item.codi_proyecto} ${item.nombre_proyecto}` : item.nombre_proyecto"
                    item-value="id_proyecto"
                    label="Proyecto"
                    density="compact"
                    variant="outlined"
                    clearable
                  />
                </v-col>
                <v-col cols="12">
                  <v-btn
                    block
                    @click="filtrar()"
                  >
                    Filtrar
                  </v-btn>
                </v-col>
                <v-col cols="12">
                  <v-btn
                    block
                    :loading="exporting"
                    @click="exportarExcel"
                  >
                    Exportar
                  </v-btn>
                </v-col>
              </v-row>
            </div>

            <!-- ✅ SOLO INDICADORES (GrupoIndicador) -->
            <v-dialog
              v-model="dialogCrearActividades"
              max-width="1200"
              scrollable
              eager
              :retain-focus="false"
            >
              <v-card style="height: 85vh;">
                <v-toolbar
                  density="compact"
                  color="blue-darken-3"
                >
                  <v-toolbar-title class="text-white">
                    Crear Actividades
                  </v-toolbar-title>
                  <v-spacer />
                  <v-btn
                    icon
                    variant="text"
                    @click="dialogCrearActividades = false"
                  >
                    <v-icon class="text-white">
                      mdi-close
                    </v-icon>
                  </v-btn>
                </v-toolbar>

                <v-card-text style="height: calc(85vh - 48px); overflow:auto;">
                  <CrearActividades
                    v-if="dialogCrearActividades"
                    @guardar="(p) => { console.log(p); dialogCrearActividades=false }"
                  />
                </v-card-text>
              </v-card>
            </v-dialog>
            <v-card-text>
              <v-row dense>
                <v-col cols="6">
                  <div class="grupos">
                    <GrupoIndicador
                      v-if="jsonData?.[0]?.grupo?.[0]"
                      :grupo="jsonData[0].grupo[0]"
                      :fecha-desde="fechaDesde"
                      :fecha-hasta="fechaHasta"
                      :filtro="safeCliente"
                      :secatrib="safeProyecto"
                      :teratrib="teratrib"
                      :id-activo="idActivo"
                      @toggle="onToggle"
                    />
                  </div>
                </v-col>

                <v-col cols="6">
                  <div class="grupos">
                    <GrupoIndicador
                      v-if="jsonData?.[0]?.grupo?.[1]"
                      :grupo="jsonData[0].grupo[1]"
                      :fecha-desde="fechaDesde"
                      :fecha-hasta="fechaHasta"
                      :filtro="safeCliente"
                      :secatrib="safeProyecto"
                      :teratrib="teratrib"
                      :id-activo="idActivo"
                      @toggle="onToggle"
                    />
                  </div>
                </v-col>
                <v-col cols="12">
                  <TablaDashPrincipal
                    :fecha-desde="fechaDesde"
                    :fecha-hasta="fechaHasta"
                    :filtro="safeCliente"
                    :secatrib="safeProyecto"
                  />
                </v-col>
                <!--v-col cols="12">
                  <ExcelPreview
                    :fechaDesde="fechaDesde"
                    :fechaHasta="fechaHasta"
                    :filtro="safeCliente"
                    :secatrib="safeProyecto"
                  />
                </v-col-->
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </DashboardLayout>
</template>

<script setup>
import DashboardLayout from '../layouts/dashboard.vue';
import GrupoIndicador from '../components/GrupoIndicador.vue';
import ExcelPreview from '../components/ExcelPreview.vue';

import { ref, onMounted, computed, nextTick, watch } from 'vue';
import apiAxios from '@/services/api';

import { useRouter } from 'vue-router'
import { useUserDetailStore } from "@/stores/userDetail";

import * as XLSX from 'xlsx';

import { useDisplay } from 'vuetify'
import TablaDashPrincipal from '../components/TablaDashPrincipal.vue';
const { smAndDown } = useDisplay()
const { mdAndUp } = useDisplay()


const dialogCrearActividades = ref(false)


async function openCrearActividades() {
  dialogCrearActividades.value = true
  // opcional: asegura que el DOM del dialog exista antes de que componentes pesados se pinten
  await nextTick()
}

function onGuardarActividades(payload) {
  console.log('guardar actividades:', payload)
  dialogCrearActividades.value = false
}


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

const teratrib = ref();
const teratribSeleccionado = ref(3);
const jsonData = ref([]);

const idActivo = ref(null)
const tituloActivo = ref(null)
const estadoFiltro = ref(null)

const safeCliente = computed(() => {
  const v = cliente.value;
  return (v === null || v === undefined || v === 'null' || v === 'undefined' || v === '')
    ? ''
    : Number(v) || v; // si es número, que sea número
});

const safeProyecto = computed(() => {
  const v = proyecto.value;
  return (v === null || v === undefined || v === 'null' || v === 'undefined' || v === '')
    ? ''
    : Number(v) || v;
});

// mapa de títulos → estado backend
const estadoPorTitulo = {
  'Planificados': '',          // vacío
  'Aprobados': 'APROBADO',
  'Rechazados': 'RECHAZADO',
  'No Terminados': 'NO TERMINADO'
}

function onToggle(payload) {
  const newId = payload?.id ?? null
  const same = idActivo.value === newId

  // 1) alterna selección
  idActivo.value = same ? null : newId

  // 2) si hay activo, mapeamos; si no, limpiamos
  if (idActivo.value) {
    const titulo = payload?.titulo ?? ''
    const estado = estadoPorTitulo[titulo] ?? ''  // default a vacío si no matchea

    tituloActivo.value = titulo
    estadoFiltro.value = estado

    console.log('Titulo:', tituloActivo.value)
    console.log('Estado:', estadoFiltro.value)
    filtrar();

  } else {
    tituloActivo.value = null
    estadoFiltro.value = null
    console.log('Titulo:', tituloActivo.value)
    console.log('Estado:', estadoFiltro.value)
    filtrar();
  }
}

const exportConfig = ref() // 👈 REACTIVO

onMounted(async () => {
  console.log('userDetailStore.userDetail', userDetailStore.userDetail);

  // Mantengo solo lo necesario para filtros + indicadores
  await obtenerClientes();
  await obtenerProyectos();

  const resp = await fetch(import.meta.env.BASE_URL + 'dataDashboard.json');
  const data = await resp.json();
  jsonData.value = data;
  console.log('jsonData', jsonData.value);

  const exportNode = Array.isArray(data) ? data.find(o => o && o.export) : null
  if (exportNode?.export) {
    exportConfig.value = exportNode.export
  }

  await nextTick();
});

// Funciones para obtener datos desde API
const obtenerClientes = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await apiAxios.get('/servicio/leanglobal/obtenerEmpresas');
    const permitidas = ['sonacol', 'enap', 'metrogas', 'gasandes']
    clientes.value = (Array.isArray(response.data) ? response.data : []).filter(
      e => {
        const name = (e.name_empresa || '').toLowerCase().trim()
        const isInterno = !(e.flag_externo === true || e.flag_externo === 1 || e.flag_externo === '1' || e.flag_externo === 't' || e.flag_externo === 'true')
        return isInterno && permitidas.some(p => name.includes(p))
      }
    );
    const idActual = normalizeClienteId(clienteSeleccionado.value)
    if (idActual && !clientes.value.some(c => String(c?.id_empresa ?? '') === String(idActual))) {
      clienteSeleccionado.value = null
      proyectoSeleccionado.value = null
      proyectos.value = []
    }
  } catch (err) {
    error.value = 'Error al obtener clientes: ' + err.message;
    console.error(err);
  } finally {
    loading.value = false;
  }
};

function normalizeClienteId(v) {
  if (v === null || v === undefined || v === '') return null
  const candidate = typeof v === 'object' ? (v.id_empresa ?? v.value ?? v.id ?? null) : v
  if (candidate === null || candidate === undefined || candidate === '') return null
  const n = Number(candidate)
  if (Number.isFinite(n) && n > 0) return n
  const s = String(candidate).trim()
  return s ? s : null
}

watch(clienteSeleccionado, async (nuevoCliente) => {
  const clienteId = normalizeClienteId(nuevoCliente)
  if (clienteId !== null && nuevoCliente !== clienteId) clienteSeleccionado.value = clienteId

  // Limpia inmediatamente el select de proyecto
  proyectoSeleccionado.value = null
  proyecto.value = ''        // si usas este para filtrar abajo
  proyectos.value = []       // vacía la lista para que no quede “fantasma”

  if (clienteId) {
    await obtenerProyectos(clienteId)
  }
})

const BYPASS_ROLES = new Set(['PROG', 'GCIA', 'ADMIN', 'APRB'])

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
  return roles.some(r => {
    const u = String(r || '').trim().toUpperCase()
    if (BYPASS_ROLES.has(u)) return true
    return Array.from(BYPASS_ROLES).some(b => u.endsWith('_' + b) || u.endsWith('-' + b))
  })
}

const obtenerProyectos = async (id_cliente) => {
  console.log("Actualizacion de cliente ")
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

      // Si no hay lista de proyectos en sesión, no bloquear resultados de API.
      // Esto evita que el selector "Proyecto" quede vacío aun cuando el backend sí trae datos.
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

async function filtrar() {
  teratrib.value = teratribSeleccionado.value;
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
}

// =========================
// EXPORT (igual que el tuyo)
// =========================
console.log('Configuración de exportación:', exportConfig.value);

// Parámetros externos que ocupas en tus URLs
const pila = ref('')                  // this.pila
const filtro2 = ref('')               // this.filtro2
const textoSubAcopio = ref('')        // this.textoSubAcopio

// UI state
const exporting = ref(false)
const showDialog = ref(false)
const textoProgreso = ref('Preparando…')
const avance = ref(0)
const totalHojas = ref(0)
const cancelRequested = ref(false)
let abortController = null

const porcentaje = computed(() => {
  if (!totalHojas.value) return 0
  return Math.round((avance.value / totalHojas.value) * 100)
})

// Helpers
function sanitizeSheetName (name) {
  const s = String(name || 'Hoja')
  // SheetJS: máx 31 chars, sin: []:*?/\
  return s.replace(/[\[\]\:\*\?\/\\]/g, '').slice(0, 31) || 'Hoja'
}

function formatFecha (val) {
  if (!val) return ''
  // Acepta Date/ISO/epoch numérico:
  const d = (val instanceof Date) ? val : new Date(val)
  if (isNaN(d.getTime())) return String(val)
  // dd-mm-yyyy
  const dd = String(d.getDate()).padStart(2,'0')
  const mm = String(d.getMonth()+1).padStart(2,'0')
  const yyyy = d.getFullYear()
  return `${dd}-${mm}-${yyyy}`
}

const API_BASE = window.apiURIComun || '/';

// Construye la URL exacta como en tu script original
function buildUrl(hoja) {
  const base = API_BASE + hoja.url;

  const url = new URL(base, window.location.origin);
  const params = new URLSearchParams();

  params.set('fecha_desde', '2025-09-01');
  params.set('fecha_hasta', '2025-09-30');
  params.set('filtro',      '');      // cliente
  params.set('teratrib',    12);      // proyecto (igual que el legado)
  params.set('in',          '');      // si aplica

  url.search = params.toString();
  return url.toString();
}

function mapDatosAHoja(datos, campos) {
  const headers = []
  const keys = []
  for (const c of (campos || [])) {
    if (c.header) headers.push(c.header)
    if (c.nombre) keys.push(c)
  }

  const rows = []
  for (const item of (datos || [])) {
    const row = []
    for (const c of keys) {
      let v = item[c.nombre]
      if (c.tipo === 'fecha') v = formatFecha(v)
      row.push(v)
    }
    rows.push(row)
  }

  rows.unshift(headers)
  return rows
}

function cancelar() {
  cancelRequested.value = true
  if (abortController) abortController.abort()
  textoProgreso.value = 'Cancelando…'
}

// 👇 Función principal
async function exportarExcel() {
  if (!exportConfig.value || !Array.isArray(exportConfig.value.hojas) || !exportConfig.value.hojas.length) {
    return alert('No hay hojas configuradas para exportar.')
  }

  exporting.value = true
  showDialog.value = true
  cancelRequested.value = false
  avance.value = 0
  totalHojas.value = exportConfig.value.hojas.length
  textoProgreso.value = 'Iniciando…'

  const wb = XLSX.utils.book_new()

  try {
    for (const hoja of exportConfig.value.hojas) {
      if (cancelRequested.value) throw new Error('Exportación cancelada por el usuario.')
      avance.value++
      textoProgreso.value = `Generando hoja "${hoja.nombre}"…`

      abortController = new AbortController()
      const url = buildUrl(hoja)
      console.log('Fetch URL:', url)

      const resp = await apiAxios.get(url, {
        signal: abortController.signal,
        timeout: 120000
      })

      let payload = resp.data;
      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload);
        } catch (e) {
          console.warn('Respuesta no-JSON, usando string:', payload);
        }
      }

      const datos =
        Array.isArray(payload)            ? payload :
        Array.isArray(payload?.datos)     ? payload.datos :
        Array.isArray(payload?.data)      ? payload.data :
        [];

      console.log(`Datos hoja "${hoja.nombre}" (len=${datos.length}):`, datos);

      const aoa = mapDatosAHoja(datos, hoja.campos || [])
      const ws = XLSX.utils.aoa_to_sheet(aoa)
      const sheetName = sanitizeSheetName(hoja.nombre || `Hoja ${avance.value}`)
      XLSX.utils.book_append_sheet(wb, ws, sheetName)
    }

    const filename = exportConfig.value.filename || 'reporte.xlsx'
    XLSX.writeFile(wb, filename)
    textoProgreso.value = '¡Listo!'
  } catch (err) {
    console.error('❌ Error exportando:', err)
    alert(`Error exportando: ${err?.message || err}`)
  } finally {
    exporting.value = false
    showDialog.value = false
    abortController = null
  }
}
</script>

<style scoped>
.panel-titulo {
  padding-bottom: 10px;
  font-size: 16px;
}

.fill {
  width: 98%;
  height: 100%;
}

/* Ajustes de tarjetas en pantallas pequeñas */
@media (max-width: 600px) {
  .tabs-mobile .v-slide-group__content {
    flex-wrap: wrap;
  }
  .filters-block {
    padding-inline: 12px;
  }
  .grupo {
    min-height: 240px; /* asegura espacio mínimo */
  }
  .grupo2 {
    height: auto;      /* deja crecer con el contenido */
  }
  .card {
    min-height: 200px;
  }
}

/* Evita que los tabs generen scroll horizontal */
.tabs-mobile { overflow: hidden; }

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
