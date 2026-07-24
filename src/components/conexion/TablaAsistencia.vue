<template>
  <v-card
    class="sakai-table-card"
    variant="outlined"
    elevation="0"
  >
    <v-card-text class="pa-0">
      <v-table
        class="tabla-asistencia text-caption"
        density="comfortable"
        hover
      >
        <thead>
          <tr>
            <th
              class="text-left th-header"
              style="width: 50px;"
            />
            <th
              class="text-left th-header"
              style="width: 80px;"
            >
              ID
            </th>
            <th class="text-left th-header">
              Contratista
            </th>
            <th class="text-left th-header">
              Fecha Registro
            </th>
            <th class="text-center th-header">
              Evidencia
            </th>
            <th class="text-center th-header">
              Estado
            </th>
            <th class="text-left th-header">
              Observación
            </th>
            <th class="text-left th-header">
              Usuario
            </th>
            <th
              class="text-center th-header"
              style="width: 50px;"
            />
          </tr>
        </thead>
        <tbody>
          <template
            v-for="(group, i) in items"
            :key="group.id_empresa_contratista || i"
          >
            <!-- Main Group Row (Latest Record) -->
            <tr
              class="row-hover cursor-pointer"
              @click="$emit('view-doc', group.latest)"
            >
              <td
                class="text-center"
                @click.stop="toggleExpand(i)"
              >
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  :color="isExpanded(i) ? 'primary' : 'medium-emphasis'"
                >
                  <v-icon>{{ isExpanded(i) ? 'mdi-chevron-down' : 'mdi-chevron-right' }}</v-icon>
                </v-btn>
              </td>
              <td class="text-caption font-weight-bold text-primary">
                {{ group.latest.id_archivo }}
              </td>
              <td class="text-subtitle-2 font-weight-bold">
                {{ getContratistaName(group.id_empresa_contratista) }}
              </td>
              <td class="text-caption text-medium-emphasis">
                {{ formatDate(group.latest.fecha_creacion) }}
              </td>
              <td class="text-center">
                <v-avatar
                  v-if="isImage(group.latest.name_doc_interno)"
                  size="36"
                  class="cursor-pointer"
                  color="grey-lighten-4"
                  style="border: 1px solid #e2e8f0;"
                  @click.stop="verFotoGrande(group.latest)"
                >
                  <v-img
                    :src="getFileUrl(group.latest)"
                    cover
                  />
                </v-avatar>
                <v-btn
                  v-else-if="group.latest.name_doc_interno"
                  icon="mdi-file-document-outline"
                  variant="text"
                  size="small"
                  color="primary"
                  :href="getFileUrl(group.latest)"
                  target="_blank"
                  @click.stop
                />
                <span
                  v-else
                  class="text-disabled"
                >-</span>
              </td>
              <td class="text-center">
                <v-chip
                  size="x-small"
                  :color="getStatusColor(group.latest.json_data?.estado)"
                  variant="tonal"
                  class="font-weight-bold"
                >
                  {{ group.latest.json_data?.estado || 'COMPLETADO' }}
                </v-chip>
              </td>
              <td
                class="text-body-2 text-truncate"
                style="max-width: 250px;"
              >
                {{ group.latest.observacion }}
              </td>
              <td class="text-caption">
                {{ getUserName(group.latest.id_usuario_creacion) }}
              </td>
              <td
                class="text-center"
                @click.stop
              >
                <v-menu location="bottom end">
                  <template #activator="{ props }">
                    <v-btn
                      icon
                      variant="text"
                      size="small"
                      color="medium-emphasis"
                      v-bind="props"
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
                    <v-list-item @click="$emit('edit', group.latest)">
                      <template #prepend>
                        <v-icon
                          icon="mdi-pencil-outline"
                          size="small"
                          color="primary"
                          class="mr-2"
                        />
                      </template>
                      <v-list-item-title
                        class="text-caption font-weight-medium"
                      >
                        Editar
                      </v-list-item-title>
                    </v-list-item>

                    <v-divider
                      v-if="group.latest.name_doc_interno"
                      class="my-1"
                    />

                    <v-list-item
                      v-if="group.latest.name_doc_interno"
                      :href="getFileUrl(group.latest)"
                      target="_blank"
                    >
                      <template #prepend>
                        <v-icon
                          icon="mdi-file-download-outline"
                          size="small"
                          color="success"
                          class="mr-2"
                        />
                      </template>
                      <v-list-item-title class="text-caption font-weight-medium">
                        Descargar
                        PDF
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </td>
            </tr>

            <!-- Expanded History Row -->
            <tr
              v-if="isExpanded(i)"
              class="bg-grey-lighten-5"
            >
              <td
                colspan="8"
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
                    <span class="text-subtitle-2 font-weight-bold text-medium-emphasis">
                      Historial de Asistencia: <span class="text-primary">{{
                        getContratistaName(group.id_empresa_contratista) }}</span>
                    </span>
                  </div>

                  <v-table
                    density="compact"
                    class="bg-transparent text-caption"
                  >
                    <thead>
                      <tr>
                        <th class="text-left font-weight-bold text-grey-darken-2">
                          Fecha
                        </th>
                        <th class="text-center font-weight-bold text-grey-darken-2">
                          Evidencia
                        </th>
                        <th class="text-center font-weight-bold text-grey-darken-2">
                          Estado
                        </th>
                        <th class="text-left font-weight-bold text-grey-darken-2">
                          Observación
                        </th>
                        <th class="text-left font-weight-bold text-grey-darken-2">
                          Usuario
                        </th>
                        <th
                          class="text-center font-weight-bold text-grey-darken-2"
                          style="width: 50px;"
                        />
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="hist in group.history"
                        :key="hist.id_archivo"
                        class="row-hover"
                      >
                        <td>{{ formatDate(hist.fecha_creacion) }}</td>
                        <td class="text-center">
                          <v-avatar
                            v-if="isImage(hist.name_doc_interno)"
                            size="32"
                            class="cursor-pointer"
                            color="grey-lighten-4"
                            style="border: 1px solid #e2e8f0;"
                            @click.stop="verFotoGrande(hist)"
                          >
                            <v-img
                              :src="getFileUrl(hist)"
                              cover
                            />
                          </v-avatar>
                          <v-btn
                            v-else-if="hist.name_doc_interno"
                            icon="mdi-file-document-outline"
                            variant="text"
                            size="x-small"
                            color="primary"
                            :href="getFileUrl(hist)"
                            target="_blank"
                            @click.stop
                          />
                          <span
                            v-else
                            class="text-disabled"
                          >-</span>
                        </td>
                        <td class="text-center">
                          <v-chip
                            size="x-small"
                            :color="getStatusColor(hist.json_data?.estado)"
                            variant="tonal"
                            class="font-weight-bold"
                          >
                            {{ hist.json_data?.estado || 'COMPLETADO' }}
                          </v-chip>
                        </td>
                        <td>{{ hist.observacion }}</td>
                        <td>{{ getUserName(hist.id_usuario_creacion) }}</td>
                        <td class="text-center">
                          <div class="d-flex ga-1 justify-center">
                            <v-btn
                              icon="mdi-eye-outline"
                              variant="text"
                              size="x-small"
                              color="primary"
                              @click="$emit('view-doc', hist)"
                            />
                            <v-btn
                              icon="mdi-pencil-outline"
                              variant="text"
                              size="x-small"
                              color="grey"
                              @click="$emit('edit', hist)"
                            />
                            <v-btn
                              v-if="hist.name_doc_interno"
                              icon="mdi-download-outline"
                              variant="text"
                              size="x-small"
                              color="success"
                              :href="getFileUrl(hist)"
                              target="_blank"
                            />
                          </div>
                        </td>
                      </tr>
                      <tr v-if="group.history.length === 0">
                        <td
                          colspan="4"
                          class="text-center text-grey py-4"
                        >
                          No hay registros adicionales
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                </div>
              </td>
            </tr>
          </template>

          <tr v-if="!items.length">
            <td
              colspan="8"
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
                <div>No hay registros de asistencia disponibles</div>
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
    <v-divider />
    <div class="d-flex align-center justify-space-between px-4 py-3 bg-grey-lighten-5">
      <div class="text-caption text-medium-emphasis">
        Mostrando {{ items.length }} contratistas
      </div>
    </div>
  </v-card>

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
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import api from '@/services/api';

const props = defineProps({
    items: {
        type: Array, // Array of Groups: { id_empresa_contratista, latest, history }
        default: () => []
    }
});

const emit = defineEmits(['view-doc', 'edit']);

const usersMap = ref({});
const empresasMap = ref({});
const hydrating = ref(new Set());
const expanded = ref([]);

onMounted(() => {
    fetchUsers();
    fetchEmpresas();
});

watch(() => props.items, () => {
    hydrateAll();
}, { immediate: true });

async function hydrateAll() {
    if (!props.items) return;
    for (const group of props.items) {
        await hydrateItem(group.latest);
        for (const hist of group.history) {
            await hydrateItem(hist);
        }
    }
}

async function hydrateItem(item) {
    if (item.id_doc && !item.name_doc_interno && !hydrating.value.has(item.id_doc)) {
        hydrating.value.add(item.id_doc);
        try {
            const res = await api.get(`/archivo/id/${item.id_doc}`);
            if (res.data?.data) {
                const doc = res.data.data;
                item.name_doc_interno = doc.name_doc_interno;
                item.name_doc_orig = doc.name_doc_orig || item.name_doc_orig;
            }
        } catch (err) {
            console.error(`Error hydrating doc ${item.id_doc}`, err);
        } finally {
            hydrating.value.delete(item.id_doc);
        }
    }
}

async function fetchUsers() {
    try {
        const response = await api.get('/servicio/leanglobal/obtenerUsuarios');
        (response.data || []).forEach(u => {
            usersMap.value[u.id_user] = `${u.name_frst || ''} ${u.apellido_pat || ''}`.trim() || `User ${u.id_user}`;
        });
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

async function fetchEmpresas() {
    try {
        const response = await api.get('/servicio/leanglobal/obtenerEmpresas');
        (response.data || []).forEach(e => {
            empresasMap.value[e.id_empresa] = e.name_empresa || `Empresa ${e.id_empresa}`;
        });
    } catch (error) {
        console.error('Error fetching empresas:', error);
    }
}

function getUserName(userId) {
    if (!userId) return '-';
    return usersMap.value[userId] || `ID: ${userId}`;
}

function getContratistaName(id) {
    if (!id || id === 'unknown') return 'No especificado';
    return empresasMap.value[id] || `Contratista ${id}`;
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString();
}

function getFileUrl(item) {
    if (!item.name_doc_interno) return '#';
    const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
    return `${baseUrl}/archivo/terracon/${item.name_doc_interno}`;
}

function isImage(filename) {
    if (!filename) return false;
    return /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(filename);
}

const dialogFoto = ref(false);
const fotoUrl = ref('');

function verFotoGrande(item) {
    if (!item.name_doc_interno) return;
    fotoUrl.value = getFileUrl(item);
    dialogFoto.value = true;
}

function toggleExpand(index) {
    if (expanded.value.includes(index)) {
        expanded.value = expanded.value.filter(i => i !== index);
    } else {
        expanded.value.push(index);
    }
}

function isExpanded(index) {
    return expanded.value.includes(index);
}

function getStatusColor(status) {
    const s = (status || 'COMPLETADO').toUpperCase();
    if (s === 'PENDIENTE') return 'warning';
    if (s === 'RECHAZADO') return 'error';
    if (s === 'APROBADO') return 'info';
    return 'success'; // COMPLETADO y otros
}
</script>

<style scoped>
.sakai-table-card {
    border-color: #e2e8f0;
    border-radius: 12px;
    background-color: white;
}

.tabla-asistencia :deep(thead th) {
    background: #f8fafc;
    color: #64748b;
    text-transform: uppercase;
    font-weight: 700;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
    height: 52px;
    border-bottom: 2px solid #e2e8f0;
}

.tabla-asistencia :deep(tbody td) {
    height: 60px;
    border-bottom: 1px solid #f1f5f9;
}

.tabla-asistencia :deep(tbody tr.row-hover:hover) {
    background-color: #f8fafc !important;
}
</style>
