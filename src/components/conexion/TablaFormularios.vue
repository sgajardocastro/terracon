<template>
  <v-card
    class="sakai-table-card"
    variant="outlined"
    elevation="0"
  >
    <v-card-text class="pa-0">
      <v-table
        class="tabla-formularios text-caption"
        density="comfortable"
        hover
      >
        <thead>
          <tr>
            <!-- <th class="text-left th-expander" style="width: 50px;"></th> -->
            <th class="text-left th-header">
              ID Doc
            </th>
            <th class="text-left th-header">
              Tipo Documento
            </th>
            <th class="text-left th-header">
              Nombre Archivo
            </th>


            <th class="text-left th-header">
              Observación
            </th>
            <th class="text-center th-header">
              Versión
            </th>
            <th class="text-left th-header">
              Fecha Creación
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
            v-for="(item, i) in items"
            :key="item.id_archivo || i"
          >
            <tr
              class="row-hover cursor-pointer"
              @click="$emit('view-doc', item)"
            >
              <!-- <td class="text-center" @click.stop="toggleExpand(i)">
                                <v-btn icon variant="text" size="small"
                                    :color="isExpanded(i) ? 'primary' : 'medium-emphasis'">
                                    <v-icon>{{ isExpanded(i) ? 'mdi-chevron-down' : 'mdi-chevron-right' }}</v-icon>
                                </v-btn>
                            </td> -->
              <td class="text-caption font-weight-bold text-primary">
                {{ item.id_doc }}
              </td>
              <td class="text-caption">
                {{ item.tipo_documento }}
              </td>
              <td class="text-body-2 font-weight-medium text-primary">
                <a
                  v-if="item.name_doc_interno"
                  :href="getFileUrl(item)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-decoration-none d-flex align-center"
                  @click.stop
                >
                  <span class="text-decoration-underline text-primary">{{ item.name_doc_orig ||
                    `Documento #${item.id_doc}` }}</span>
                </a>
                <span
                  v-else
                  class="text-disabled font-italic"
                >Sin archivo</span>
              </td>
              <td
                class="text-body-2 text-truncate"
                style="max-width: 200px;"
              >
                {{ item.observacion }}
              </td>
              <td class="text-center">
                <v-chip
                  size="small"
                  variant="outlined"
                  class="bg-grey-lighten-5 font-weight-bold"
                >
                  v{{ item.version }}
                </v-chip>
              </td>
              <td class="text-caption text-medium-emphasis">
                {{ formatDate(item.fecha_creacion) }}
              </td>
              <td class="text-caption">
                {{ getUserName(item.id_usuario_creacion) }}
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
                    <v-list-item @click="$emit('edit', item)">
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
                    <v-list-item @click="$emit('new-version', item)">
                      <template #prepend>
                        <v-icon
                          icon="mdi-file-plus-outline"
                          size="small"
                          color="secondary"
                          class="mr-2"
                        />
                      </template>
                      <v-list-item-title class="text-caption font-weight-medium">
                        Nueva
                        Versión
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
                colspan="10"
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
                      Historial del Documento ID: <span class="text-primary">{{ item.id_doc
                      }}</span>
                    </span>
                  </div>

                  <v-table
                    v-if="!loadingHistory[item.id_doc]"
                    density="compact"
                    class="bg-transparent text-caption"
                  >
                    <thead>
                      <tr>
                        <th class="text-center font-weight-bold text-grey-darken-2">
                          Versión
                        </th>
                        <th class="text-left font-weight-bold text-grey-darken-2">
                          Fecha
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
                        v-for="(hist, hIdx) in getHistory(item.id_doc)"
                        :key="hIdx"
                        class="row-hover"
                      >
                        <td class="text-center">
                          <v-chip
                            size="x-small"
                            variant="tonal"
                            :color="hist.version === item.version ? 'primary' : 'grey'"
                            class="font-weight-bold"
                          >
                            v{{ hist.version }}
                          </v-chip>
                        </td>
                        <td>{{ formatDate(hist.fecha_creacion) }}</td>
                        <td>{{ hist.observacion }}</td>
                        <td>{{ getUserName(hist.id_usuario_creacion) }}</td>
                        <td class="text-center">
                          <v-btn
                            icon="mdi-eye"
                            variant="text"
                            size="x-small"
                            color="medium-emphasis"
                            @click="$emit('view-doc', hist)"
                          />
                        </td>
                      </tr>
                      <tr v-if="getHistory(item.id_doc).length === 0">
                        <td
                          colspan="5"
                          class="text-center text-grey py-4"
                        >
                          No hay historial previo
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

          <tr v-if="!items.length">
            <td
              colspan="10"
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
                <div>No hay formularios disponibles</div>
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
    <!-- Pagination logic can be added/enabled via props if needed -->
    </div>
  </v-card>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import api from '@/services/api';

const props = defineProps({
    items: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['view-doc', 'edit', 'new-version']);

const expanded = ref([]);
const historyMap = ref({}); // id_doc -> array of history records
const loadingHistory = ref({});
const usersMap = ref({});
const hydrating = ref(new Set()); // track ids being hydrated

onMounted(() => {
    fetchUsers();
    hydrateMissingDocInfo();
});

watch(() => props.items, () => {
    hydrateMissingDocInfo();
}, { immediate: true });

async function hydrateMissingDocInfo() {
    if (!props.items) return;

    for (const item of props.items) {
        if (item.id_doc && !item.name_doc_interno && !hydrating.value.has(item.id_doc)) {
            hydrating.value.add(item.id_doc);
            try {
                const res = await api.get(`/archivo/id/${item.id_doc}`);
                if (res.data && res.data.data) {
                    const doc = res.data.data;
                    // Reactively update the item properties
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

function getUserName(userId) {
    if (!userId) return '-';
    return usersMap.value[userId] || `Usuario ${userId}`;
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString();
}

function toggleExpand(index) {
    const item = props.items[index];
    if (expanded.value.includes(index)) {
        expanded.value = expanded.value.filter(i => i !== index);
    } else {
        expanded.value.push(index);
        if (item && item.id_doc) {
            fetchHistory(item.id_doc);
        }
    }
}

function isExpanded(index) {
    return expanded.value.includes(index);
}

async function fetchHistory(idDoc) {
    if (historyMap.value[idDoc]) return;

    loadingHistory.value[idDoc] = true;
    try {
        // Asumiendo endpoint para buscar por id_doc (historial)
        // Adjust endpoint as needed. If not available, we might need to filter client-side or use a specific query.
        // For now, let's assume filtering on /tfmg-archivo by id_doc might return all versions.
        // Or if we don't have a specific endpoint, maybe we already have all data?
        // Assuming we need to fetch specifically:
        // const response = await api.get(`/tfmg-archivos/${idDoc}`);
        // NOTE: User didn't specify history endpoint. I will assume standard filtering pattern or just GET with params.
        // Let's try to infer from typical usage: maybe GET /tfmg-archivo?id_doc=X
        // For safety I'll mock it or use a query. 
        // Let's rely on filtering existing items if possible, OR if backend supports it.
        // I will implement a query param approach for now.
        // const response = await api.get(`/tfmg-archivo`, { params: { id_doc: idDoc } });

        // However, user said "Al hacer click en la flecha se habre el hitorial".

        // Placeholder implementation for fetching history:
        // Attempt to fetch all files with same id_doc.
        // Usamos query param para filtrar por id_doc y obtener el historial
        const res = await api.get('/tfmg-archivos', { params: { id_doc: idDoc } });
        const allData = res.data.data || [];
        // Filtrar client-side por si acaso el backend no soporta filtro por query param
        historyMap.value[idDoc] = allData.filter(d => d.id_doc == idDoc);

    } catch (error) {
        console.warn(`Error fetching history for doc ${idDoc}. Using mock/empty for now.`, error);
        historyMap.value[idDoc] = [];
    } finally {
        loadingHistory.value[idDoc] = false;
    }
}

function getHistory(idDoc) {
    return historyMap.value[idDoc] || [];
}

function getFileUrl(item) {
    if (!item.name_doc_interno) return '#';
    const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
    return `${baseUrl}/archivo/terracon/${item.name_doc_interno}`;
}
</script>

<style scoped>
.sakai-table-card {
    border-color: #e2e8f0;
    border-radius: 12px;
    background-color: white;
}

.tabla-formularios :deep(thead th) {
    background: #f8fafc;
    color: #64748b;
    text-transform: uppercase;
    font-weight: 700;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
    height: 52px;
    border-bottom: 2px solid #e2e8f0;
}

.tabla-formularios :deep(tbody td) {
    height: 60px;
    border-bottom: 1px solid #f1f5f9;
}

.tabla-formularios :deep(tbody tr.row-hover:hover) {
    background-color: #f8fafc !important;
}
</style>
