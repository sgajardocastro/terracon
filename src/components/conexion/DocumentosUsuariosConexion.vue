<template>
  <div class="pa-0 d-flex flex-column h-100">
    <v-card
      class="surface-card d-flex flex-column flex-grow-1 overflow-hidden"
      variant="outlined"
      style="border-color: #e2e8f0; border-radius: 12px; background-color: white;"
    >
      <!-- Header -->
      <div
        v-if="!$props.search && !hideHeader"
        class="pa-4 d-flex align-center justify-space-between flex-wrap ga-4 border-b border-light"
      >
        <div class="d-flex align-center">
          <div class="icon-box mr-3">
            <v-icon
              color="primary"
              icon="mdi-file-document-multiple-outline"
            />
          </div>
          <div>
            <div class="text-subtitle-1 font-weight-bold text-primary-dark">
              Documentos por Usuario / Equipo
            </div>
            <div class="text-caption text-medium-emphasis">
              Estado de documentación
            </div>
          </div>
        </div>

        <div class="d-flex align-center ga-3">
          <v-text-field
            v-model="q"
            density="compact"
            variant="outlined"
            hide-details
            placeholder="Filtrar..."
            prepend-inner-icon="mdi-magnify"
            bg-color="grey-lighten-5"
            class="sakai-input"
            style="width: 250px;"
          />
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            class="text-none font-weight-bold"
            rounded="lg"
            @click="abrirDialogoEquipo(null)"
          >
            Nuevo Equipo
          </v-btn>
        </div>
      </div>

      <v-card-text
        class="pa-0 flex-grow-1 overflow-hidden"
        style="min-height: 0;"
      >
        <v-table
          class="tabla-sakai text-body-2"
          density="comfortable"
          fixed-header
          height="100%"
        >
          <thead>
            <tr>
              <th
                class="text-left th-expander"
                style="width: 50px"
              />

              <th class="text-left th-elem">
                Vehículo
              </th>
              <th class="text-left th-user">
                Responsable
              </th>
              <th class="text-left th-pat">
                Patente
              </th>

              <th class="text-left th-res">
                Revisión Técnica
              </th>
              <th class="text-left th-res">
                Permiso Circulación
              </th>
              <th class="text-left th-res">
                Seguro Obligatorio
              </th>
              <th class="text-left th-res">
                Cert Gases
              </th>
              <th class="text-left th-res">
                Póliza
              </th>
              <!-- <th class="text-left th-res">Licencia conducir</th> -->

              <th class="text-center th-doc">
                DOCUMENTACIÓN
              </th>
              <th
                class="text-center"
                style="width: 80px"
              >
                Acciones
              </th>
            </tr>
          </thead>

          <tbody>
            <template
              v-for="eq in equiposFiltrados"
              :key="eq.id_equipo"
            >
              <!-- FILA PADRE -->
              <tr
                class="row-hover cursor-pointer"
                @click="toggleExpand(eq.id_equipo)"
              >
                <td class="td-expander text-center">
                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    :color="isExpanded(eq.id_equipo) ? 'primary' : 'medium-emphasis'"
                  >
                    <v-icon>
                      {{ isExpanded(eq.id_equipo) ? 'mdi-chevron-down' : 'mdi-chevron-right' }}
                    </v-icon>
                  </v-btn>
                </td>

                <td><span class="font-weight-medium text-caption">{{ eq.json_data?.nombre || eq.elemento }}</span></td>
                <td><span class="font-weight-bold text-high-emphasis">{{ eq.nombre || 'Sin Responsable' }}</span></td>
                <td>
                  <v-chip
                    size="x-small"
                    variant="outlined"
                    class="font-weight-medium bg-grey-lighten-5"
                  >
                    {{ eq.patente
                    }}
                  </v-chip>
                </td>

                <td>
                  <ResumenEstado :doc="getDocSummary(eq.id_equipo, 'Revisión Técnica')" />
                </td>
                <td>
                  <ResumenEstado :doc="getDocSummary(eq.id_equipo, 'Permiso de Circulación')" />
                </td>
                <td>
                  <ResumenEstado :doc="getDocSummary(eq.id_equipo, 'Seguro Obligatorio')" />
                </td>
                <td>
                  <ResumenEstado :doc="getDocSummary(eq.id_equipo, 'Certificado de Gases')" />
                </td>
                <td>
                  <ResumenEstado :doc="getDocSummary(eq.id_equipo, 'Póliza')" />
                </td>
                <!-- <td>
                  <ResumenEstado :doc="getDocSummary(eq.id_equipo, 'Licencia Conducir')" />
                </td> -->

                <td class="text-center">
                  <v-chip
                    size="small"
                    variant="tonal"
                    class="font-weight-bold"
                    :color="chipColorGlobal(eq.id_equipo)"
                  >
                    {{ chipLabelGlobal(eq.id_equipo) }}
                  </v-chip>
                </td>
                <td class="text-center">
                  <v-menu location="bottom end">
                    <template #activator="{ props }">
                      <v-btn
                        icon
                        size="small"
                        variant="text"
                        color="medium-emphasis"
                        v-bind="props"
                      >
                        <v-icon>mdi-dots-vertical</v-icon>
                      </v-btn>
                    </template>
                    <v-list
                      density="compact"
                      elevation="2"
                      rounded="lg"
                    >
                      <v-list-item
                        value="edit"
                        prepend-icon="mdi-pencil"
                        @click="abrirDialogoEquipo(eq)"
                      >
                        <v-list-item-title>Editar Equipo</v-list-item-title>
                      </v-list-item>
                      <v-list-item
                        value="add_doc"
                        prepend-icon="mdi-file-plus-outline"
                        @click="abrirDialogoDoc(null, eq.id_equipo)"
                      >
                        <v-list-item-title>Agregar Documento</v-list-item-title>
                      </v-list-item>
                      <v-divider class="my-1" />
                      <v-list-item
                        value="delete"
                        prepend-icon="mdi-delete"
                        color="error"
                        class="text-error"
                        @click="eliminarEquipo(eq)"
                      >
                        <v-list-item-title>Eliminar Equipo</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </td>
              </tr>

              <!-- FILA EXPANDIDA -->
              <tr
                v-if="isExpanded(eq.id_equipo)"
                class="row-expanded bg-grey-lighten-5"
              >
                <td
                  colspan="12"
                  class="pa-4"
                >
                  <div class="detail-container bg-white border rounded-lg px-4 py-3">
                    <div class="d-flex justify-space-between align-center mb-3">
                      <div class="d-flex align-center ga-4">
                        <div class="text-overline font-weight-bold text-medium-emphasis">
                          Detalle Documentos: <span class="text-primary">{{ eq.patente }}</span>
                        </div>
                        <v-checkbox
                          v-model="showOnlyLatest"
                          density="compact"
                          hide-details
                          label="Ver solo últimos (Agrupado)"
                          color="primary"
                          class="ma-0 pa-0"
                        />
                      </div>

                      <v-btn
                        size="small"
                        color="primary"
                        variant="flat"
                        prepend-icon="mdi-plus"
                        class="text-none"
                        @click.stop="abrirDialogoDoc(null, eq.id_equipo)"
                      >
                        Ingresar Documento
                      </v-btn>
                    </div>

                    <v-table
                      density="compact"
                      class="tabla-detalle bg-transparent"
                    >
                      <thead>
                        <tr>
                          <th
                            class="text-left"
                            style="width: 40px"
                          >
                            #
                          </th>
                          <!-- <th class="text-left">Nombre Documento</th> -->
                          <!-- <th class="text-left">Usuario Resp.</th> -->
                          <!-- <th class="text-left">Fecha Carga</th> -->
                          <th class="text-left">
                            Vencimiento
                          </th>
                          <th class="text-center">
                            Estado
                          </th>
                          <th class="text-center">
                            Foto
                          </th>
                          <th class="text-center">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <template
                          v-for="(group, type) in getGroupedDocs(eq.id_equipo)"
                          :key="type"
                        >
                          <tr class="bg-grey-lighten-4">
                            <td
                              colspan="6"
                              class="py-1 px-4"
                            >
                              <div class="d-flex align-center">
                                <v-icon
                                  size="small"
                                  class="mr-2"
                                  color="primary"
                                >
                                  mdi-folder-outline
                                </v-icon>
                                <span class="text-caption font-weight-bold text-uppercase text-medium-emphasis">{{ type }}</span>
                                <v-chip
                                  size="x-small"
                                  class="ml-2"
                                  variant="flat"
                                >
                                  {{ group.length }}
                                </v-chip>
                              </div>
                            </td>
                          </tr>
                          <tr
                            v-for="(doc, idx) in group"
                            :key="doc.id_acreditacion || idx"
                          >
                            <td class="text-caption text-medium-emphasis pl-6">
                              {{ idx + 1 }}
                            </td>
                            <!-- <td class="font-weight-medium text-caption">{{ doc.registro_acreditacion }}</td> -->
                            <!-- <td class="text-caption">{{ doc.usuario_resp || '—' }}</td> -->
                            <!-- <td class="text-caption">{{ formatDate(doc.fecha_creacion) }}</td> -->
                            <td class="text-caption">
                              {{ formatDate(doc.fecha_prox_calibracion) }}
                            </td>
                            <td class="text-center">
                              <v-chip
                                size="x-small"
                                :color="getDisplayColor(doc, eq.id_equipo)"
                                variant="tonal"
                                class="font-weight-bold"
                              >
                                {{ getDisplayStatus(doc, eq.id_equipo) }}
                              </v-chip>
                            </td>
                            <td class="text-center">
                              <template v-if="doc.json_data?.id_doc">
                                <v-avatar
                                  v-if="isImage(doc.name_doc_orig || doc.json_data.name_doc_orig)"
                                  size="32"
                                  color="grey-lighten-4"
                                  class="ba-1"
                                  style="border: 1px solid #e2e8f0; cursor: pointer;"
                                >
                                  <v-img
                                    :key="getFileUrl(doc)"
                                    :src="getFileUrl(doc)"
                                    cover
                                    @click.stop="verFotoGrande(doc, eq.id_equipo)"
                                  />
                                </v-avatar>
                                <v-btn
                                  v-else
                                  size="small"
                                  variant="text"
                                  icon="mdi-file-document-outline"
                                  color="primary"
                                  :href="getFileUrl(doc)"
                                  target="_blank"
                                  title="Descargar"
                                />
                              </template>
                              <span
                                v-else
                                class="text-caption text-disabled"
                              >-</span>
                            </td>
                            <td class="text-center">
                              <v-btn
                                size="x-small"
                                variant="text"
                                icon="mdi-pencil-outline"
                                color="warning"
                                @click.stop="abrirDialogoDoc(doc, eq.id_equipo)"
                              />
                            </td>
                          </tr>
                        </template>
                        <tr v-if="!Object.keys(getGroupedDocs(eq.id_equipo)).length">
                          <td
                            colspan="6"
                            class="text-center text-caption text-medium-emphasis py-4"
                          >
                            Sin documentos detallados.
                          </td>
                        </tr>
                      </tbody>
                    </v-table>
                  </div>
                </td>
              </tr>
            </template>

            <tr v-if="!equiposFiltrados.length && !loading">
              <td
                colspan="12"
                class="text-center text-medium-emphasis py-8"
              >
                No se encontraron registros.
              </td>
            </tr>
            <tr v-if="loading">
              <td
                colspan="12"
                class="text-center py-8"
              >
                <v-progress-circular
                  indeterminate
                  color="primary"
                />
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>

    <!-- Dialogo Equipo -->
    <v-dialog
      v-model="dialogEquipo"
      max-width="500"
    >
      <v-card class="rounded-xl">
        <v-card-title class="pa-4 bg-grey-lighten-5 font-weight-bold">
          {{ formEquipo.id_equipo ? 'Editar Equipo' : 'Nuevo Equipo' }}
        </v-card-title>
        <v-card-text class="pa-4">
          <v-form ref="formEquipoRef">
            <v-text-field
              v-model="formEquipo.nombre"
              label="Nombre Vehículo"
              variant="outlined"
              density="compact"
              class="mb-3"
            />
            <v-text-field
              v-model="formEquipo.patente"
              label="Patente"
              variant="outlined"
              density="compact"
              class="mb-3"
            />
            <v-select
              v-model="formEquipo.id_usuario_asignado"
              :items="usersList"
              item-title="fullname"
              item-value="id_user"
              label="Responsable (Usuario Externo)"
              variant="outlined"
              density="compact"
              class="mb-3"
              clearable
            />
            <v-text-field
              v-model="formEquipo.marca"
              label="Marca"
              variant="outlined"
              density="compact"
              class="mb-3"
            />
            <v-text-field
              v-model="formEquipo.modelo"
              label="Modelo"
              variant="outlined"
              density="compact"
              class="mb-3"
            />
            <v-textarea
              v-model="formEquipo.observaciones"
              label="Observaciones"
              variant="outlined"
              density="compact"
              rows="3"
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            color="medium-emphasis"
            variant="text"
            @click="dialogEquipo = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="saving"
            @click="guardarEquipo"
          >
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialogo Documento -->
    <v-dialog
      v-model="dialogDoc"
      max-width="500"
    >
      <v-card class="rounded-xl">
        <v-card-title class="pa-4 bg-grey-lighten-5 font-weight-bold">
          {{ formDoc.id_acreditacion ? 'Editar Documento' : 'Nuevo Documento' }}
        </v-card-title>
        <v-card-text class="pa-4">
          <v-form ref="formDocRef">
            <v-select
              v-model="formDoc.registro_acreditacion"
              :items="docTypes"
              label="Tipo de Documento"
              variant="outlined"
              density="compact"
              class="mb-3"
            />
            <v-text-field
              v-model="formDoc.fecha_ult_calibracion"
              label="Fecha Emisión / Revisión"
              type="date"
              variant="outlined"
              density="compact"
              class="mb-3"
            />
            <v-text-field
              v-model="formDoc.fecha_prox_calibracion"
              label="Fecha Vencimiento"
              type="date"
              variant="outlined"
              density="compact"
              class="mb-3"
            />

            <label class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary">Fotografía</label>
            <FotoCaptureConexion
              v-model:galeria="galeriaDoc"
              :max-fotos="1"
              class="mb-3"
            />


            <v-textarea
              v-model="formDoc.observacion_registro"
              label="Comentario / Observación"
              variant="outlined"
              density="compact"
              rows="2"
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-btn
            v-if="formDoc.id_acreditacion"
            color="error"
            variant="text"
            prepend-icon="mdi-delete"
            @click="eliminarDoc"
          >
            Eliminar
          </v-btn>
          <v-spacer />
          <v-btn
            color="medium-emphasis"
            variant="text"
            @click="dialogDoc = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="savingDoc"
            @click="guardarDoc"
          >
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Visor de Fotos en Grande -->
    <v-dialog
      v-model="dialogVisor"
      max-width="900"
    >
      <v-card class="rounded-xl overflow-hidden bg-grey-darken-4 text-white">
        <v-toolbar
          flat
          color="transparent"
          class="px-2"
        >
          <v-toolbar-title class="text-subtitle-1 font-weight-medium">
            Visualizador de Documento
          </v-toolbar-title>
          <v-spacer />
          <v-btn
            icon="mdi-open-in-new"
            variant="text"
            color="white"
            :href="urlVisor"
            target="_blank"
            title="Abrir en pestaña nueva"
          />
          <v-btn
            icon="mdi-close"
            variant="text"
            color="white"
            @click="dialogVisor = false"
          />
        </v-toolbar>
        <v-card-text
          class="d-flex align-center justify-center pa-4"
          style="min-height: 300px; background-color: #121212;"
        >
          <v-img
            :src="urlVisor"
            max-height="75vh"
            contain
            class="rounded-lg bg-grey-darken-4"
          >
            <template #placeholder>
              <div class="d-flex align-center justify-center fill-height">
                <v-progress-circular
                  indeterminate
                  color="primary"
                />
              </div>
            </template>
          </v-img>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, h, defineComponent, onMounted, reactive } from 'vue'
import { useDisplay } from 'vuetify'
import api from '@/services/api';
import { useUserDetailStore } from "@/stores/userDetail";
import FotoCaptureConexion from './FotoCaptureConexion.vue';

const userDetailStore = useUserDetailStore();
const { height } = useDisplay()
const props = defineProps({
  search: { type: String, default: '' },
  hideHeader: { type: Boolean, default: false },
  fechaDesde: { type: String, default: '' },
  fechaHasta: { type: String, default: '' }
});

const emit = defineEmits(['edit']);

const q = ref('')
const expanded = ref([])
const loading = ref(false);
const saving = ref(false);
const savingDoc = ref(false);
const showOnlyLatest = ref(true);

const equipos = ref([]);
const docsResumen = ref([]);
const docsDetail = ref({}); // Cache full docs by id_equipo: { 101: [...] }



const usersList = ref([]); // For autocomplete
const galeriaDoc = ref([]); // For FotoCapture

// DIALOG STATES
const dialogEquipo = ref(false);
const dialogDoc = ref(false);
const dialogVisor = ref(false);
const urlVisor = ref('');
const currentEquipoId = ref(null); // For Doc creation

const formEquipo = reactive({
  id_equipo: null,
  nombre: '',
  patente: '',
  id_usuario_asignado: null,
  marca: '',
  modelo: '',
  observaciones: '',
  tipo_equipo: 'EQUIPO MOVIL'
});

const formDoc = reactive({
  id_acreditacion: null, // Edit mode
  registro_acreditacion: null,
  fecha_ult_calibracion: '',
  fecha_prox_calibracion: '',
  archivo: null,
  observacion_registro: '',
  json_data: {}
});

const docTypes = [
  'Revisión Técnica',
  'Permiso de Circulación',
  'Seguro Obligatorio',
  'Certificado de Gases',
  'Póliza'
];

onMounted(() => {
  fetchEquipos();
  fetchUsers();
  fetchResumenDocs();
});

// FETCH DATA
async function fetchEquipos() {
  loading.value = true;
  try {
    const res = await api.get('/servicio/leanglobal/obtenerEquiposMoviles');
    equipos.value = res.data || [];
  } catch (e) {
    console.error('Error fetching equipos', e);
  } finally {
    loading.value = false;
  }
}

async function fetchUsers() {
  try {
    const res = await api.get('/servicio/leanglobal/obtenerPersonalExterno');
    usersList.value = (res.data || []).map(u => ({
      id_user: u.id_user,
      fullname: `${u.name_frst || ''} ${u.apellido_pat || ''} (${u.rut})`.trim()
    }));
  } catch (e) {
    console.error('Error fetching users', e);
  }
}

async function fetchResumenDocs() {
  try {
    const res = await api.get('/servicio/leanglobal/obtenerDocumentacionResumen');
    docsResumen.value = res.data || [];
  } catch (e) {
    console.error('Error fetching resumen docs', e);
  }
}

async function fetchDocsDetail(id_equipo) {
  if (docsDetail.value[id_equipo]) return;
  try {
    const res = await api.get(`/tequ-documentacion/${id_equipo}`);
    const docs = res.data.data || [];
    console.log(`FETCH DOCS DETAIL [${id_equipo}]:`, docs);
    docsDetail.value[id_equipo] = docs;
    hydrateDocs(docs, id_equipo);
  } catch (e) {
    console.error('Error fetching doc detail', e);
  }
}

async function hydrateDocs(docs, id_equipo) {
  if (!docs) return;
  console.log("HYDRATE DOCS START (Parallel)", docs.length);

  const hydrationPromises = docs.map(async (doc) => {
    // 1. Hydrate File (id_doc)
    const id_doc = doc.json_data?.id_doc;

    // Optimistic: use json_data names if available to skip fetching
    if (doc.json_data?.name_doc_orig) doc.name_doc_orig = doc.json_data.name_doc_orig;
    if (doc.json_data?.name_doc_interno) doc.name_doc_interno = doc.json_data.name_doc_interno;

    // Only fetch if we have an ID but NO internal name (and it's not already in json_data)
    if (id_doc && !doc.name_doc_interno && !doc.json_data?.name_doc_interno) {
      try {
        const res = await api.get(`/archivo/id/${id_doc}`);
        if (res.data && res.data.data) {
          // Update the doc object
          doc.name_doc_interno = res.data.data.name_doc_interno;
          doc.name_doc_orig = res.data.data.name_doc_orig;

          // Also update json_data to persist in this session's view
          if (!doc.json_data) doc.json_data = {};
          doc.json_data.name_doc_interno = res.data.data.name_doc_interno;
          doc.json_data.name_doc_orig = res.data.data.name_doc_orig;
        }
      } catch (error) {
        console.warn(`Failed to hydrate doc ${id_doc}`, error);
      }
    }
  });

  await Promise.all(hydrationPromises);

  // Force reactivity update for the specific equipo
  if (id_equipo) {
    docsDetail.value = { ...docsDetail.value };
  }

  console.log("HYDRATE DOCS END - FINAL STATE:", JSON.stringify(docs, null, 2));
}


// COMPUTED
const equiposFiltrados = computed(() => {
  const s = (props.search || q.value).toLowerCase()
  const desde = props.fechaDesde || '';
  const hasta = props.fechaHasta || '';
  const filtrarPorFecha = Boolean(desde || hasta);

  return equipos.value.filter(e => {
    const patente = e.patente || '';
    const nombre = e.nombre || '';
    const coincideBusqueda = patente.toLowerCase().includes(s) || nombre.toLowerCase().includes(s);
    if (!coincideBusqueda) return false;
    if (!filtrarPorFecha) return true;

    const docsEquipo = docsResumen.value.filter(d => d.id_equipo === e.id_equipo);
    if (!docsEquipo.length) return true;

    const docsConFecha = docsEquipo.filter(d => !!d.fecha_prox_calibracion);
    if (!docsConFecha.length) return true;

    return docsConFecha.some(d => isFechaInRange(d.fecha_prox_calibracion, desde, hasta));
  });
});

function isFechaInRange(fechaISO, desde, hasta) {
  if (!fechaISO) return false;
  const fecha = String(fechaISO).split('T')[0];
  if (desde && fecha < desde) return false;
  if (hasta && fecha > hasta) return false;
  return true;
}

// HELPER FUNCTIONS
function toggleExpand(id) {
  if (expanded.value.includes(id)) {
    expanded.value = expanded.value.filter(x => x !== id)
  } else {
    expanded.value.push(id)
    fetchDocsDetail(id); // Fetch details on expand
  }
}
function isExpanded(id) {
  return expanded.value.includes(id)
}

function getDocsForEquipo(id_equipo) {
  let docs = [];
  // Prefer detail if available (more generic fields), fallback to summary filter
  if (docsDetail.value[id_equipo]) {
    docs = docsDetail.value[id_equipo];
  } else {
    docs = docsResumen.value.filter(d => d.id_equipo === id_equipo);
  }
  // Sort descending by ID (Newest first)
  return [...docs].sort((a, b) => (Number(b.id_acreditacion) || 0) - (Number(a.id_acreditacion) || 0));
}

function getGroupedDocs(id_equipo) {
  const docs = getDocsForEquipo(id_equipo);
  const groups = {};

  docs.forEach(doc => {
    const type = doc.registro_acreditacion || 'Otros';
    if (!groups[type]) groups[type] = [];
    groups[type].push(doc);
  });

  if (showOnlyLatest.value) {
    for (const type in groups) {
      if (groups[type].length > 0) {
        // Since getDocsForEquipo sorts by ID desc, the first one is the latest
        groups[type] = [groups[type][0]];
      }
    }
  }

  return groups;
}

function getDocSummary(id_equipo, tipo) {
  // Find docs in summary list
  const docs = docsResumen.value.filter(d => d.id_equipo === id_equipo && d.registro_acreditacion === tipo);
  if (!docs.length) return null;
  // Sort descending by ID to match the grouped view
  docs.sort((a, b) => (Number(b.id_acreditacion) || 0) - (Number(a.id_acreditacion) || 0));
  return docs[0];
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString();
}

function getFileUrl(docOrId) {
  // Returns URL for the standard document (id_doc)
  if (!docOrId) return null;
  if (typeof docOrId === 'object') {
    // 1. Try root property
    if (docOrId.name_doc_interno) {
      return `${import.meta.env.VITE_API_BASE_URL}/archivo/terracon/${docOrId.name_doc_interno}`;
    }
    // 2. Try json_data property (faster hydration)
    if (docOrId.json_data?.name_doc_interno) {
      return `${import.meta.env.VITE_API_BASE_URL}/archivo/terracon/${docOrId.json_data.name_doc_interno}`;
    }
    // 3. Fallback to ID (legacy/unhydrated) - REMOVED to avoid JSON response in v-img
    // if (docOrId.json_data?.id_doc) {
    //   return `${import.meta.env.VITE_API_BASE_URL}/archivo/id/${docOrId.json_data.id_doc}`;
    // }
    return null;
  }
  // Fallback for direct string ID
  return `${import.meta.env.VITE_API_BASE_URL}/archivo/id/${docOrId}`;
}



function isImage(filename) {
  if (!filename) return false;
  return /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(filename);
}

// STATUS HELPERS
function getEstadoText(fechaVence) {
  if (!fechaVence) return 'NA'; // No date = not applicable or missing?
  const today = new Date();
  const venc = new Date(fechaVence);
  const diffTime = venc - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'VENCIDO';
  if (diffDays <= 30) return 'POR VENCER';
  return 'VIGENTE';
}

function getEstadoColor(fechaVence) {
  const status = getEstadoText(fechaVence);
  if (status === 'VENCIDO') return 'error';
  if (status === 'POR VENCER') return 'warning';
  if (status === 'VIGENTE') return 'success';
  return 'grey';
}

function getDisplayStatus(doc, id_equipo) {
  if (!isLatestOfItsType(doc, id_equipo)) return 'N/A';
  return getEstadoText(doc.fecha_prox_calibracion);
}

function getDisplayColor(doc, id_equipo) {
  if (!isLatestOfItsType(doc, id_equipo)) return 'grey';
  return getEstadoColor(doc.fecha_prox_calibracion);
}

function isLatestOfItsType(doc, id_equipo) {
  const docs = getDocsForEquipo(id_equipo);
  if (!docs || !docs.length) return true;

  // Filter by same type
  const sameType = docs.filter(d => d.registro_acreditacion === doc.registro_acreditacion);
  if (sameType.length <= 1) return true;

  // Sort descending by ID to find the latest
  // We use [...sameType] to avoid mutating the filtered array if we were using it elsewhere,
  // though filter() returns a new array so it's safe.
  sameType.sort((a, b) => (Number(b.id_acreditacion) || 0) - (Number(a.id_acreditacion) || 0));

  // The first one is the latest
  return Number(sameType[0].id_acreditacion) === Number(doc.id_acreditacion);
}

// ResumenEstado Component Logic (extracted)
function chipColorGlobal(id_equipo) {
  const docs = docsResumen.value.filter(d => d.id_equipo === id_equipo);
  // If any required doc is missing or expired?
  // We check all 'docTypes'.
  let hasAlert = false;
  let hasWarning = false;

  // Check known types
  for (const type of docTypes) {
    const doc = docs.find(d => d.registro_acreditacion === type);
    if (!doc) {
      // Missing doc -> Incomplete (grey) or Warning? User preference. Let's say Incomplete.
      return 'grey';
    }
    const st = getEstadoText(doc.fecha_prox_calibracion);
    if (st === 'VENCIDO') hasAlert = true;
    if (st === 'POR VENCER') hasWarning = true;
  }

  if (hasAlert) return 'error';
  if (hasWarning) return 'warning';
  return 'success';
}

function chipLabelGlobal(id_equipo) {
  const color = chipColorGlobal(id_equipo);
  if (color === 'error') return 'Revisar';
  if (color === 'warning') return 'Atención';
  if (color === 'grey') return 'Incompleto';
  return 'Completo';
}


// ACTIONS - EQUIPO
function abrirDialogoEquipo(eq) {
  if (eq) {
    formEquipo.id_equipo = eq.id_equipo;
    formEquipo.nombre = eq.json_data?.nombre || '';
    formEquipo.patente = eq.patente;
    formEquipo.id_usuario_asignado = eq.id_usuario_asignado ? Number(eq.id_usuario_asignado) : null;
    formEquipo.observaciones = eq.observaciones;
    formEquipo.marca = eq.marca || eq.json_data?.marca || '';
    formEquipo.modelo = eq.modelo || eq.json_data?.modelo || '';
  } else {
    formEquipo.id_equipo = null;
    formEquipo.nombre = '';
    formEquipo.patente = '';
    formEquipo.id_usuario_asignado = null;
    formEquipo.observaciones = '';
    formEquipo.marca = '';
    formEquipo.modelo = '';
  }
  dialogEquipo.value = true;
}

async function guardarEquipo() {
  saving.value = true;
  try {
    const payload = {
      tipo_equipo: 'EQUIPO MOVIL',
      marca: formEquipo.marca,
      modelo: formEquipo.modelo,
      numero_serie: formEquipo.patente,
      json_data: {
        nombre: formEquipo.nombre,
        patente: formEquipo.patente,
        id_usuario_asignado: formEquipo.id_usuario_asignado,
        marca: formEquipo.marca,
        modelo: formEquipo.modelo
      },
      observaciones: formEquipo.observaciones,
      id_usuario_creacion: userDetailStore.userDetail?.id_user || 1
    };

    if (formEquipo.id_equipo) {
      // Update
      await api.put(`/tequ-equipos/${formEquipo.id_equipo}`, payload);
    } else {
      // Create
      await api.post('/tequ-equipos', payload);
    }
    dialogEquipo.value = false;
    fetchEquipos();
  } catch (e) {
    console.error("Error guardar equipo", e);
  } finally {
    saving.value = false;
  }
}

// ACTIONS - DOC
function abrirDialogoDoc(doc, id_equipo) {
  currentEquipoId.value = id_equipo;
  if (doc) {
    formDoc.id_acreditacion = doc.id_acreditacion;
    formDoc.registro_acreditacion = doc.registro_acreditacion;
    formDoc.fecha_ult_calibracion = doc.fecha_ult_calibracion ? doc.fecha_ult_calibracion.split('T')[0] : '';
    formDoc.fecha_prox_calibracion = doc.fecha_prox_calibracion ? doc.fecha_prox_calibracion.split('T')[0] : '';
    formDoc.observacion_registro = doc.observacion_registro;
    formDoc.json_data = doc.json_data || {};
    formDoc.documentos_adjuntos = doc.documentos_adjuntos || [];
    formDoc.name_doc_interno = doc.name_doc_interno || '';
    formDoc.name_doc_orig = doc.name_doc_orig || '';
    formDoc.name_doc_orig = doc.name_doc_orig || '';
    formDoc.archivo = null; // Reset file input

    // Populate gallery if it is an image (using id_doc)
    galeriaDoc.value = [];
    if (doc.json_data?.id_doc) {
      galeriaDoc.value.push({
        id_doc: doc.json_data.id_doc,
        url: getFileUrl(doc),
        nombre: doc.json_data.name_doc_orig || 'Foto'
      });
    }

    console.log("OPEN DIALOG (Edit)", formDoc);
  } else {
    formDoc.id_acreditacion = null;
    formDoc.registro_acreditacion = null;
    formDoc.fecha_ult_calibracion = '';
    formDoc.fecha_prox_calibracion = '';
    formDoc.observacion_registro = '';
    formDoc.json_data = {};
    formDoc.documentos_adjuntos = [];
    formDoc.name_doc_interno = '';
    formDoc.name_doc_orig = '';
    formDoc.archivo = null;
    formDoc.archivo = null;

    // Populate gallery if it is an image
    galeriaDoc.value = [];

    console.log("OPEN DIALOG (New)");
  }
  dialogDoc.value = true;
}

function verFotoGrande(doc, id_equipo) {
  const url = getFileUrl(doc);
  if (url) {
    urlVisor.value = url;
    dialogVisor.value = true;
  }
}

async function guardarDoc() {
  if (!currentEquipoId.value) return;
  savingDoc.value = true;
  console.log("guardarDoc INIT");
  try {
    // 1. Handle Photo (use id_doc from gallery)
    let id_doc = formDoc.json_data?.id_doc;
    let name_doc_orig = formDoc.json_data?.name_doc_orig;

    // Check if ID changed to clear internal name cache
    let current_internal = formDoc.json_data?.name_doc_interno;

    if (galeriaDoc.value.length > 0) {
      const gItem = galeriaDoc.value[0];
      // If we have a new ID in the gallery, use it.
      // Note: check for 'id_doc' or 'id' depending on what FotoCapture returns.
      // Usually it returns { id_doc: ..., nombre: ..., ... }
      if (gItem.id_doc) {
        if (gItem.id_doc !== id_doc) {
          // New Image!
          id_doc = gItem.id_doc;
          current_internal = null; // Clear old internal name so we re-fetch or use new one

          // Try to grab internal name if available in typical response structure
          if (gItem.response?.data?.archivo?.name_doc_interno) {
            current_internal = gItem.response.data.archivo.name_doc_interno;
          } else if (gItem.name_doc_interno) {
            current_internal = gItem.name_doc_interno;
          }
        }
        name_doc_orig = gItem.nombre || name_doc_orig;
      }
    } else {
      if (formDoc.id_acreditacion) {
        id_doc = null;
        name_doc_orig = null;
        current_internal = null;
      }
    }

    const payload = {
      id_equipo: currentEquipoId.value,
      registro_acreditacion: formDoc.registro_acreditacion,
      fecha_ult_calibracion: formDoc.fecha_ult_calibracion,
      fecha_prox_calibracion: formDoc.fecha_prox_calibracion,
      observacion_registro: formDoc.observacion_registro,
      id_usuario_responsable: userDetailStore.userDetail?.id_user || 1,
      documentos_adjuntos: [],
      json_data: {
        ...formDoc.json_data,
        id_doc: id_doc,
        name_doc_orig: name_doc_orig,
        // Save internal name to avoid hydration race conditions
        // Save internal name to avoid hydration race conditions
        name_doc_interno: current_internal,
        // Explicitly nullify old fields to avoid confusion
        id_doc_img: null,
        name_doc_img_orig: null,
        tipo: formDoc.registro_acreditacion
      }
    };

    if (formDoc.id_acreditacion) {
      await api.put(`/tequ-documentacion/${formDoc.id_acreditacion}`, payload);
    } else {
      payload.id_usuario_registro = userDetailStore.userDetail?.id_user || 1;
      await api.post('/tequ-documentacion', payload);
    }

    dialogDoc.value = false;

    // Clear cache to force refresh
    docsDetail.value[currentEquipoId.value] = null;

    // Pass currentEquipoId.value to fetchDocsDetail
    await fetchDocsDetail(currentEquipoId.value);

    // Force refresh summary as well
    fetchResumenDocs();
  } catch (e) {
    console.error("Error saving doc", e);
  } finally {
    savingDoc.value = false;
  }
}

async function eliminarDoc() {
  if (!confirm('¿Estás seguro de eliminar este documento?')) return;
  savingDoc.value = true;
  try {
    const id = formDoc.id_acreditacion;
    if (id) {
      await api.delete(`/tequ-documentacion/${id}`);
      dialogDoc.value = false;
      docsDetail.value[currentEquipoId.value] = null; // force refresh
      await fetchDocsDetail(currentEquipoId.value);
      fetchResumenDocs();
    }
  } catch (e) {
    console.error('Error deleting doc', e);
  } finally {
    savingDoc.value = false;
  }
}

async function eliminarEquipo(eq) {
  if (!eq) return;
  const nombreElemento = eq.json_data?.nombre || eq.elemento || eq.patente;
  if (!confirm(`¿Estás seguro de eliminar el equipo "${nombreElemento}" (${eq.patente}) y toda su documentación asociada?`)) {
    return;
  }
  
  loading.value = true;
  try {
    await api.delete(`/tequ-equipos/${eq.id_equipo}`);
    await fetchEquipos();
    await fetchResumenDocs();
  } catch (e) {
    console.error('Error al eliminar equipo', e);
    alert('Ocurrió un error al intentar eliminar el equipo.');
  } finally {
    loading.value = false;
  }
}


// Componente Interno ResumenEstado (Using functional component or plain VNode)
const ResumenEstado = defineComponent({
  props: ['doc'],
  setup(props) {
    return () => {
      const doc = props.doc;
      if (!doc) {
        return h('div', { class: 'd-flex flex-column align-start' }, [
          h('div', { class: 'text-caption text-grey' }, [
            // h('i', { class: 'mdi mdi-cancel v-icon--size-x-small' }),
            h('span', 'NA')
          ])
        ]);
      }

      const status = getEstadoText(doc.fecha_prox_calibracion);
      let color = 'text-medium-emphasis';
      let icon = 'mdi-minus-circle-outline';

      if (status === 'VIGENTE') { color = 'text-green-darken-1 font-weight-bold'; icon = 'mdi-check-circle-outline' }
      else if (status === 'VENCIDO') { color = 'text-red-darken-1 font-weight-bold'; icon = 'mdi-alert-circle-outline' }
      else if (status === 'POR VENCER') { color = 'text-orange-darken-2 font-weight-bold'; icon = 'mdi-clock-alert-outline' }

      const fecha = doc.fecha_prox_calibracion ? formatDate(doc.fecha_prox_calibracion) : '';

      return h('div', { class: 'd-flex flex-column align-start' }, [
        h('div', { class: `text-caption d-flex align-center ga-1 ${color}` }, [
          h('span', status)
        ]),
        h('div', { class: 'text-caption text-disabled', style: 'font-size: 0.7rem !important' }, fecha)
      ])
    }
  }
})

defineExpose({
  abrirDialogoEquipo
});
</script>

<style scoped>
.surface-card {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02) !important;
}

.icon-box {
  width: 40px;
  height: 40px;
  background: #f1f5f9;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-primary-dark {
  color: #1e293b;
}

.border-b {
  border-bottom: 1px solid #e2e8f0 !important;
}

/* Sakai Table Styles */
.tabla-sakai :deep(thead th) {
  background: #f8fafc;
  color: #64748b;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 0.7rem;
  letter-spacing: 0.05em;
  height: 48px;
  border-bottom: 2px solid #e2e8f0;
  white-space: nowrap;
}

.tabla-sakai :deep(tbody td) {
  height: 54px;
  border-bottom: 1px solid #f1f5f9;
  padding: 0 8px;
}

.tabla-sakai :deep(tbody tr.row-hover:hover) {
  background-color: #f8fafc !important;
}

/* Sakai Input Overrides */
.sakai-input :deep(.v-field__outline) {
  --v-field-border-opacity: 0.15;
}

.sakai-input :deep(.v-field--focused .v-field__outline) {
  --v-field-border-opacity: 0.8;
}

.sakai-input :deep(.v-field) {
  border-radius: 8px;
}
</style>

