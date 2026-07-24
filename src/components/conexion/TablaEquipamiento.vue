<template>
  <v-card
    class="sakai-table-card"
    variant="outlined"
    elevation="0"
  >
    <div class="pa-3 border-b">
      <v-text-field
        v-model="searchUser"
        density="compact"
        variant="outlined"
        hide-details
        placeholder="Filtrar por usuario..."
        prepend-inner-icon="mdi-account-search"
        bg-color="white"
        class="sakai-input"
        style="max-width: 300px;"
      />
    </div>
    <v-card-text class="pa-0">
      <v-table
        class="tabla-manometro text-caption"
        density="comfortable"
        hover
      >
        <thead>
          <tr>
            <th
              class="text-left th-expander"
              style="width: 50px;"
            />
            <th class="text-left th-header">
              Marca
            </th>
            <th class="text-left th-header">
              Serie
            </th>
            <th class="text-left th-header">
              Tipo
            </th>
            <th class="text-left th-header">
              Estado
            </th>
            <th class="text-left th-header">
              Presión
            </th>
            <th class="text-left th-header">
              F. Registro
            </th>
            <th class="text-left th-header">
              Ult. Calib
            </th>
            <th class="text-left th-header">
              Prox. Calib
            </th>
            <th class="text-left th-header">
              Usuario
            </th>
            <th class="text-center th-header">
              Cant.
            </th>
            <th
              class="text-center th-header"
              style="width: 50px;"
            />
          </tr>
        </thead>
        <tbody>
          <template
            v-for="(item, i) in filteredItems"
            :key="item.id_equipo || i"
          >
            <tr
              class="row-hover cursor-pointer"
              @click="toggleExpand(item)"
            >
              <td class="text-center">
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  :color="isExpanded(item) ? 'primary' : 'medium-emphasis'"
                >
                  <v-icon>{{ isExpanded(item) ? 'mdi-chevron-down' : 'mdi-chevron-right' }}</v-icon>
                </v-btn>
              </td>
              <td class="text-body-2 font-weight-bold">
                {{ item.marca }}
              </td>
              <td class="text-body-2">
                <v-chip
                  size="x-small"
                  variant="outlined"
                  class="bg-grey-lighten-5"
                >
                  {{ item.serie }}
                </v-chip>
              </td>
              <td class="text-caption">
                {{ item.tipo }}
              </td>
              <td class="text-caption">
                <v-chip
                  size="x-small"
                  :color="getDisplayEstadoColor(item)"
                  class="font-weight-bold text-white"
                  variant="flat"
                >
                  {{ getDisplayEstado(item) }}
                </v-chip>
              </td>
              <td class="text-body-2">
                {{ getDisplayPresion(item) }}
              </td>
              <td class="text-body-2 text-medium-emphasis">
                {{ item.fechaRegistro }}
              </td>
              <td class="text-body-2 text-medium-emphasis">
                {{ getDisplayUltCalib(item) }}
              </td>
              <td class="text-body-2 text-medium-emphasis">
                {{ getDisplayProxCalib(item) }}
              </td>
              <td class="text-caption">
                {{ getDisplayUsuario(item) }}
              </td>
              <td class="text-center text-caption">
                {{ getCertCount(item) }}
              </td>
              <td class="text-center">
                <v-menu location="bottom end">
                  <template #activator="{ props }">
                    <v-btn
                      icon
                      variant="text"
                      size="small"
                      color="medium-emphasis"
                      v-bind="props"
                      @click.stop
                    >
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>
                  <v-list
                    density="compact"
                    class="py-1"
                    elevation="2"
                    rounded="lg"
                  >
                    <v-list-item @click="$emit('edit-equipo', item)">
                      <template #prepend>
                        <v-icon
                          icon="mdi-pencil-outline"
                          size="small"
                          color="primary"
                          class="mr-2"
                        />
                      </template>
                      <v-list-item-title class="text-caption font-weight-medium">
                        Editar
                        Equipo
                      </v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="openCertModal(item)">
                      <template #prepend>
                        <v-icon
                          icon="mdi-certificate-outline"
                          size="small"
                          color="primary"
                          class="mr-2"
                        />
                      </template>
                      <v-list-item-title class="text-caption font-weight-medium">
                        Crear
                        Certificación
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </td>
            </tr>

            <!-- Expanded History Row -->
            <tr
              v-if="isExpanded(item)"
              class="bg-grey-lighten-5"
            >
              <td
                colspan="13"
                class="pa-4"
              >
                <div class="px-4 py-3 border rounded-lg bg-white elevation-1">
                  <div class="d-flex align-center mb-3">
                    <v-icon
                      color="primary"
                      class="mr-2"
                      size="20"
                    >
                      mdi-history
                    </v-icon>
                    <span class="text-subtitle-2 font-weight-bold text-medium-emphasis">Historial de
                      Certificaciones: <span class="text-primary">{{ item.marca }} {{ item.serie
                      }}</span></span>
                  </div>

                  <v-table
                    v-if="!loadingCerts[item.id_equipo]"
                    density="compact"
                    class="bg-transparent text-caption"
                  >
                    <thead>
                      <tr>
                        <th class="text-left font-weight-bold text-grey-darken-2">
                          Fecha
                          Calibración
                        </th>
                        <th class="text-left font-weight-bold text-grey-darken-2">
                          Próx. Calib
                        </th>
                        <th class="text-left font-weight-bold text-grey-darken-2">
                          Presión
                        </th>
                        <th class="text-left font-weight-bold text-grey-darken-2">
                          Estado
                        </th>
                        <th class="text-left font-weight-bold text-grey-darken-2">
                          Certificado
                        </th>
                        <th class="text-left font-weight-bold text-grey-darken-2">
                          Responsable
                        </th>
                        <th class="text-center font-weight-bold text-grey-darken-2">
                          Fotos
                        </th>
                        <th class="text-center font-weight-bold text-grey-darken-2">
                          Documentos
                        </th>
                        <th
                          class="text-center font-weight-bold text-grey-darken-2"
                          style="width: 50px;"
                        />
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(hist, hIdx) in getHistory(item)"
                        :key="hIdx"
                      >
                        <td>{{ getCertDate(hist.fecha_ult_calibracion) }}</td>
                        <td>{{ getCertDate(hist.fecha_prox_calibracion) }}</td>
                        <td>{{ hist.json_data?.presion || '-' }}</td>
                        <td>
                          <v-chip
                            size="x-small"
                            :color="getCalibrationStatusColor(hist.fecha_prox_calibracion)"
                            class="font-weight-bold text-white"
                            variant="flat"
                          >
                            {{ getCalibrationStateLabel(hist.fecha_prox_calibracion) }}
                          </v-chip>
                        </td>
                        <td>{{ hist.registro_acreditacion }}</td>
                        <td>{{ getUserName(hist.id_usuario_responsable) }}</td>
                        <td class="text-center">
                          <div
                            v-if="getParsedDocs(hist.fotografias).length > 0"
                            class="d-flex flex-wrap justify-center ga-2"
                          >
                            <template
                              v-for="(photo, idx) in getParsedDocs(hist.fotografias)"
                              :key="idx"
                            >
                              <v-avatar
                                size="32"
                                class="cursor-pointer"
                                style="border: 1px solid #e2e8f0;"
                                color="grey-lighten-4"
                                @click="verFotoGrande(photo)"
                              >
                                <v-img
                                  :src="getFileUrl(photo)"
                                  cover
                                />
                              </v-avatar>
                            </template>
                          </div>
                          <span
                            v-else
                            class="text-grey"
                          >-</span>
                        </td>
                        <td class="text-center">
                          <div
                            v-if="getParsedDocs(hist.documentos_adjuntos).length > 0"
                            class="d-flex flex-wrap justify-center ga-1"
                          >
                            <v-btn
                              v-for="(doc, idx) in getParsedDocs(hist.documentos_adjuntos)"
                              :key="idx"
                              icon="mdi-file-document-outline"
                              size="small"
                              density="compact"
                              variant="text"
                              color="primary"
                              :href="getFileUrl(doc)"
                              target="_blank"
                              title="Descargar Documento"
                            />
                          </div>
                          <span
                            v-else
                            class="text-grey"
                          >-</span>
                        </td>
                        <td class="text-center">
                          <v-menu location="bottom end">
                            <template #activator="{ props }">
                              <v-btn
                                icon
                                variant="text"
                                size="small"
                                color="medium-emphasis"
                                v-bind="props"
                                @click.stop
                              >
                                <v-icon>mdi-dots-vertical</v-icon>
                              </v-btn>
                            </template>
                            <v-list
                              density="compact"
                              class="py-1"
                              elevation="2"
                              rounded="lg"
                            >
                              <v-list-item @click="openCertModal(item, hist)">
                                <template #prepend>
                                  <v-icon
                                    icon="mdi-pencil-outline"
                                    size="small"
                                    color="primary"
                                    class="mr-2"
                                  />
                                </template>
                                <v-list-item-title class="text-caption font-weight-medium">
                                  Editar
                                  Certificación
                                </v-list-item-title>
                              </v-list-item>
                              <v-list-item
                                :disabled="deletingCerts[hist.id_acreditacion]"
                                @click="eliminarCertificacion(item, hist)"
                              >
                                <template #prepend>
                                  <v-icon
                                    icon="mdi-delete-outline"
                                    size="small"
                                    color="error"
                                    class="mr-2"
                                  />
                                </template>
                                <v-list-item-title class="text-caption font-weight-medium text-error">
                                  Eliminar
                                  Certificación
                                </v-list-item-title>
                              </v-list-item>
                            </v-list>
                          </v-menu>
                        </td>
                      </tr>
                      <tr v-if="getHistory(item).length === 0">
                        <td
                          colspan="9"
                          class="text-center text-grey py-4"
                        >
                          No hay certificaciones
                          registradas
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                  <div
                    v-else
                    class="d-flex justify-center pa-4"
                  >
                    <v-progress-circular
                      indeterminate
                      color="primary"
                      size="24"
                    />
                  </div>
                </div>
              </td>
            </tr>
          </template>
          <tr v-if="!filteredItems.length">
            <td
              colspan="13"
              class="text-center text-grey py-8"
            >
              <div class="d-flex flex-column align-center">
                <v-icon
                  size="40"
                  color="grey-lighten-2"
                  class="mb-2"
                >
                  mdi-database-off
                </v-icon>
                <div>No hay registros disponibles</div>
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>

    <!-- Paginator Footer (Mock) -->
    <v-divider />
    <div class="d-flex align-center justify-space-between px-4 py-3 bg-grey-lighten-5">
      <div class="text-caption text-medium-emphasis">
        Mostrando {{ items.length }} registros
      </div>
      <div class="d-flex ga-2">
        <v-btn
          icon
          variant="text"
          size="small"
          disabled
        >
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        <v-btn
          icon
          variant="tonal"
          size="small"
          color="primary"
          class="font-weight-bold"
        >
          1
        </v-btn>
        <v-btn
          icon
          variant="text"
          size="small"
        >
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
      </div>
    </div>
    <CrearCertificacionConexion
      v-model="showCertModal"
      :equipo="selectedItem"
      :certificacion-to-edit="selectedCert"
      @save="handleCertCreated"
    />

    <!-- Dialogo Ver Foto -->
    <v-dialog
      v-model="dialogFoto"
      max-width="800"
    >
      <v-card class="bg-black">
        <v-card-title class="d-flex justify-end pa-2">
          <v-btn
            icon="mdi-close"
            variant="text"
            color="white"
            @click="dialogFoto = false"
          />
        </v-card-title>
        <v-img
          :src="fotoUrl"
          contain
          max-height="80vh"
        />
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/services/api';
import CrearCertificacionConexion from './CrearCertificacionConexion.vue';

const props = defineProps({
    items: {
        type: Array,
        default: () => []
    }
});

const showCertModal = ref(false);
const selectedItem = ref(null);
const selectedCert = ref(null);
const expanded = ref([]);
const route = useRoute();

const certificationsMap = ref({});
const usersMap = ref({});
const loadingCerts = ref({});
const deletingCerts = ref({});
const searchUser = ref('');

const simulatedUserId = computed(() => {
    const raw = route.query?.id_user ?? route.query?.idUser;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
});

function normalizeText(value) {
    return String(value ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

const filteredItems = computed(() => {
    return props.items.filter(item => {
        const tipo = normalizeText(item.tipo);
        // Excluir equipos moviles/vehiculos para dejar solo equipamiento fijo.
        const isMovil = tipo.includes('movil') || tipo.includes('vehiculo');
        if (isMovil) return false;

        // Simulación PWA por query ?id_user=XXX:
        // prioriza responsable en certificaciones y fallback a responsables del equipo.
        const uid = simulatedUserId.value;
        if (uid) {
            const certs = certificationsMap.value[item.id_equipo] || [];
            const hasCertMatch = certs.some(c => Number(c?.id_usuario_responsable || 0) === uid);
            const last = getLatestHistoryData(item);
            const fallbackMatch =
                Number(last?.id_usuario_responsable || 0) === uid ||
                Number(item?.id_usuario_asignado || 0) === uid ||
                Number(item?.id_usuario_creacion || 0) === uid;
            if (!hasCertMatch && !fallbackMatch) return false;
        }

        const s = normalizeText(searchUser.value);
        if (!s) return true;
        return normalizeText(getDisplayUsuario(item)).includes(s);
    }).sort((a, b) => (b.id_equipo || 0) - (a.id_equipo || 0));
});

onMounted(() => {
    fetchUsers();
    // Cargar certificaciones iniciales para poblar la tabla principal
    loadAllCerts();
});

watch(() => props.items, () => {
    loadAllCerts();
}, { deep: true });

async function loadAllCerts() {
    // Evitar saturación si son muchos items, cargamos en background
    if (!props.items || props.items.length === 0) return;

    for (const item of props.items) {
        // Solo cargar si no está en caché para no repetir llamadas innecesarias
        if (item.id_equipo && !certificationsMap.value[item.id_equipo]) {
            // Llamada "fire and forget" o secuencial rápida para no bloquear UI
            fetchCertifications(item.id_equipo).catch(e => console.error(e));
            // Pequeña pausa para no ahorcar la red si son muchos
            await new Promise(r => setTimeout(r, 50));
        }
    }
}

async function fetchUsers() {
    try {
        const response = await api.get('/servicio/leanglobal/obtenerUsuarios');
        (response.data || []).forEach(u => {
            usersMap.value[u.id_user] = `${u.name_frst || ''} ${u.apellido_pat || ''}`.trim() || `Usuario ${u.id_user}`;
        });
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

async function fetchCertifications(equipoId) {
    if (certificationsMap.value[equipoId]) return; // Cache hit

    loadingCerts.value[equipoId] = true;
    try {
        const response = await api.get(`/tequ-documentacion/${equipoId}`);
        const certs = response.data.data || [];

        // Hydrate docs asynchronously
        for (const cert of certs) {
            cert.fotografias = await hydrateDocField(cert.fotografias);
            cert.documentos_adjuntos = await hydrateDocField(cert.documentos_adjuntos);
        }

        certificationsMap.value[equipoId] = certs;
    } catch (error) {
        console.error(`Error fetching certs for equipment ${equipoId}:`, error);
        certificationsMap.value[equipoId] = [];
    } finally {
        loadingCerts.value[equipoId] = false;
    }
}

async function hydrateDocField(fieldValue) {
    if (!fieldValue) return [];
    let docs = [];
    try {
        docs = typeof fieldValue === 'string' ? JSON.parse(fieldValue) : fieldValue;
    } catch { return []; }

    if (!Array.isArray(docs)) return [];

    const hydrated = await Promise.all(docs.map(async (doc) => {
        if (doc.name_doc_interno) {
            return doc;
        }

        if (doc.id || doc.id_doc) {
            try {
                const id = doc.id || doc.id_doc;
                const res = await api.get(`/archivo/id/${id}`);
                if (res.data && res.data.data) {
                    return {
                        ...doc,
                        name_doc_interno: res.data.data.name_doc_interno
                    };
                }
                return doc;
            } catch {
                return doc;
            }
        }

        return doc;
    }));

    return hydrated;
}

function openCertModal(item, cert = null) {
    selectedItem.value = item;
    selectedCert.value = cert;
    showCertModal.value = true;
}

function handleCertCreated() {
    // Refresh certifications for the specific equipment
    if (selectedItem.value) {
        // Clear cache to force refresh
        delete certificationsMap.value[selectedItem.value.id_equipo];
        fetchCertifications(selectedItem.value.id_equipo);
    }
}

async function eliminarCertificacion(item, cert) {
    const equipoId = Number(item?.id_equipo || 0);
    const certId = Number(cert?.id_acreditacion || 0);
    if (!equipoId || !certId) return;

    const label = `${item?.marca || ''} ${item?.serie || ''}`.trim() || `equipo ${equipoId}`;
    const tipo = String(cert?.registro_acreditacion || 'esta certificación').trim();
    if (!confirm(`¿Eliminar ${tipo} de ${label}? Esta acción no se puede deshacer.`)) return;

    deletingCerts.value[certId] = true;
    try {
        await api.delete(`/tequ-documentacion/${certId}`);

        certificationsMap.value[equipoId] = (certificationsMap.value[equipoId] || [])
            .filter(item => Number(item?.id_acreditacion || 0) !== certId);
    } catch (error) {
        console.error(`Error eliminando certificación ${certId}:`, error);
        delete certificationsMap.value[equipoId];
        await fetchCertifications(equipoId);
    } finally {
        deletingCerts.value[certId] = false;
    }
}

function toggleExpand(item) {
    const id = Number(item?.id_equipo);
    if (!id) return;

    if (expanded.value.includes(id)) {
        expanded.value = expanded.value.filter(i => i !== id);
    } else {
        expanded.value.push(id);
        fetchCertifications(id);
    }
}

function isExpanded(item) {
    const id = Number(item?.id_equipo);
    return id ? expanded.value.includes(id) : false;
}

function getUserName(userId) {
    if (!userId) return '-';
    return usersMap.value[userId] || `Usuario ${userId}`;
}

function getCertDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('es-CL');
}

function getCalibrationStatusColor(dateStr) {
    if (!dateStr) return 'grey';
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'red'; // Ya pasó o es hoy (User said "si ya es la fecha o ya paso")
    if (diffDays <= 14) return 'amber'; // Entre 2 semanas (14 días)
    return 'green'; // Más de 2 semanas
}

function getCalibrationStateLabel(dateStr) {
    if (!dateStr) return 'NA';
    const color = getCalibrationStatusColor(dateStr);
    if (color === 'red') return 'Vencido';
    if (color === 'amber') return 'Por Vencer';
    return 'Vigente';
}


function getLatestHistoryData(item) {
    const certs = certificationsMap.value[item.id_equipo];
    if (!certs || certs.length === 0) return null;

    const sorted = [...certs].sort((a, b) => (b.id_acreditacion || 0) - (a.id_acreditacion || 0));

    return sorted[0];
}

function getDisplayPresion(item) {
    const last = getLatestHistoryData(item);
    if (last && last.json_data && last.json_data.presion) {
        return last.json_data.presion;
    }
    return item.presion || 'NA';
}

function getDisplayEstado(item) {
    const last = getLatestHistoryData(item);
    if (last && last.fecha_prox_calibracion) {
        return getCalibrationStateLabel(last.fecha_prox_calibracion);
    }
    if (item.fechaProximaCalib && item.fechaProximaCalib !== 'NA' && item.fechaProximaCalib !== '-') {
        return getCalibrationStateLabel(item.fechaProximaCalib);
    }
    return 'NA';
}

function getDisplayEstadoColor(item) {
    const last = getLatestHistoryData(item);
    if (last && last.fecha_prox_calibracion) {
        return getCalibrationStatusColor(last.fecha_prox_calibracion);
    }
    if (item.fechaProximaCalib && item.fechaProximaCalib !== 'NA' && item.fechaProximaCalib !== '-') {
        return getCalibrationStatusColor(item.fechaProximaCalib);
    }
    return 'grey';
}

function getDisplayUsuario(item) {
    const last = getLatestHistoryData(item);
    if (last && last.id_usuario_responsable) {
        return getUserName(last.id_usuario_responsable);
    }
    return item.usuario || (item.nombre_responsable || '-');
}

function getDisplayUltCalib(item) {
    const last = getLatestHistoryData(item);
    if (last && last.fecha_ult_calibracion) {
        return getCertDate(last.fecha_ult_calibracion);
    }
    return item.fechaUltimaCalib || '-';
}

function getDisplayProxCalib(item) {
    const last = getLatestHistoryData(item);
    // Use proper property name
    if (last && last.fecha_prox_calibracion) {
        return getCertDate(last.fecha_prox_calibracion);
    }
    return item.fechaProximaCalib || '-';
}

function getCertCount(item) {
    const list = certificationsMap.value[item.id_equipo];
    return list ? list.length : 0;
}

function getParsedDocs(docs) {
    if (!docs) return [];
    if (Array.isArray(docs)) return docs;
    try {
        const parsed = JSON.parse(docs);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function getHistory(item) {
    const list = certificationsMap.value[item.id_equipo] || [];
    // Sort by id_acreditacion descending suitable for display
    return [...list].sort((a, b) => (b.id_acreditacion || 0) - (a.id_acreditacion || 0));
}

const dialogFoto = ref(false);
const fotoUrl = ref('');

function getFileUrl(doc) {
    if (!doc) return '#';
    const filename = (typeof doc === 'string' ? doc : (doc.name_doc_interno || doc.filename || doc.file));
    if (!filename) return '#';
    const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
    return `${baseUrl}/archivo/terracon/${filename}`;
}

function verFotoGrande(doc) {
    const url = getFileUrl(doc);
    if (!url || url === '#') return;
    fotoUrl.value = url;
    dialogFoto.value = true;
}

</script>

<style scoped>
.sakai-table-card {
    border-color: #e2e8f0;
    border-radius: 12px;
    background-color: white;
}

.tabla-manometro :deep(thead th) {
    background: #f8fafc;
    /* Slate 50 */
    color: #64748b;
    /* Slate 500 */
    text-transform: uppercase;
    font-weight: 700;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
    height: 52px;
    border-bottom: 2px solid #e2e8f0;
}

.tabla-manometro :deep(tbody td) {
    height: 54px;
    border-bottom: 1px solid #f1f5f9;
}

.tabla-manometro :deep(tbody tr.row-hover:hover) {
    background-color: #f8fafc !important;
}
</style>


