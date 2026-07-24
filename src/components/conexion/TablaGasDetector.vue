<template>
  <v-card
    class="sakai-table-card d-flex flex-column h-100"
    variant="outlined"
    elevation="0"
  >
    <v-card-text class="pa-0 flex-grow-1 overflow-auto">
      <v-table
        class="tabla-sakai text-body-2"
        density="comfortable"
        hover
        fixed-header
        height="100%"
      >
        <thead>
          <tr>
            <th
              class="text-left th-expander"
              style="width: 50px;"
            />
            <th class="text-left">
              Tarea
            </th>
            <th class="text-center">
              Num
            </th>
            <th class="text-left">
              Marca
            </th>
            <th class="text-left">
              N° Serie
            </th>
            <th class="text-left">
              Fecha Calib
            </th>
            <th class="text-left">
              Próxima Calib
            </th>
            <th class="text-center">
              Estado
            </th>
            <th
              class="text-center"
              style="width: 50px;"
            />
          </tr>
        </thead>
        <tbody>
          <template
            v-for="(item, i) in items"
            :key="i"
          >
            <tr
              class="row-hover cursor-pointer"
              @click="toggleExpand(i)"
            >
              <td class="text-center">
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  :color="isExpanded(i) ? 'primary' : 'medium-emphasis'"
                >
                  <v-icon>{{ isExpanded(i) ? 'mdi-chevron-down' : 'mdi-chevron-right' }}</v-icon>
                </v-btn>
              </td>
              <td>
                <div class="d-flex align-center ga-2">
                  <span class="font-weight-bold text-high-emphasis">{{ item.tarea }}</span>
                </div>
              </td>
              <td class="text-center text-medium-emphasis">
                {{ item.num }}
              </td>
              <td class="text-body-2">
                {{ item.marca }}
              </td>
              <td class="text-body-2">
                <v-chip
                  v-if="item.serie"
                  size="x-small"
                  variant="outlined"
                  class="font-weight-medium bg-grey-lighten-5"
                >
                  {{ item.serie }}
                </v-chip>
              </td>
              <td class="text-body-2 text-medium-emphasis">
                {{ item.fechaCalib }}
              </td>
              <td class="text-body-2 text-medium-emphasis">
                {{ item.proximaCalib }}
              </td>
              <td class="text-center">
                <v-chip
                  size="small"
                  variant="tonal"
                  :color="getColor(item.estado)"
                  class="font-weight-bold px-3"
                >
                  {{ item.estado }}
                </v-chip>
              </td>
              <td class="text-center">
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  color="medium-emphasis"
                  @click.stop
                >
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </td>
            </tr>

            <!-- Expanded History Row -->
            <tr
              v-if="isExpanded(i)"
              class="bg-grey-lighten-5"
            >
              <td
                colspan="9"
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
                      Calibraciones: <span class="text-primary">{{ item.marca }} {{ item.serie
                      }}</span></span>
                  </div>

                  <v-table
                    density="compact"
                    class="bg-transparent text-caption"
                  >
                    <thead>
                      <tr>
                        <th class="text-left font-weight-bold text-grey-darken-2">
                          Año
                        </th>
                        <th class="text-left font-weight-bold text-grey-darken-2">
                          Fecha
                          Calibración
                        </th>
                        <th class="text-left font-weight-bold text-grey-darken-2">
                          Certificado
                        </th>
                        <th class="text-left font-weight-bold text-grey-darken-2">
                          Laboratorio
                        </th>
                        <th class="text-center font-weight-bold text-grey-darken-2">
                          Estado
                        </th>
                        <th class="text-center font-weight-bold text-grey-darken-2">
                          Documento
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(hist, hIdx) in getHistory(item)"
                        :key="hIdx"
                      >
                        <td class="font-weight-bold">
                          {{ hist.anio }}
                        </td>
                        <td>{{ hist.fecha }}</td>
                        <td>{{ hist.certificado }}</td>
                        <td>{{ hist.laboratorio }}</td>
                        <td class="text-center">
                          <v-chip
                            size="x-small"
                            :color="hist.estado === 'Aprobado' ? 'success' : 'error'"
                            variant="tonal"
                            class="font-weight-bold"
                          >
                            {{ hist.estado }}
                          </v-chip>
                        </td>
                        <td class="text-center">
                          <v-btn
                            size="x-small"
                            variant="text"
                            color="primary"
                            icon="mdi-file-pdf-box"
                            title="Ver Certificado"
                          />
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
              colspan="9"
              class="text-center text-medium-emphasis py-8"
            >
              <div class="d-flex flex-column align-center">
                <v-icon
                  size="40"
                  color="grey-lighten-2"
                  class="mb-2"
                >
                  mdi-gas-station-off-outline
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
    <div class="d-flex align-center justify-space-between px-4 py-3 bg-grey-lighten-5 mt-auto">
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
  </v-card>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
    items: {
        type: Array,
        default: () => []
    }
});

const expanded = ref([]);

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

function getColor(estado) {
    const e = (estado || '').toLowerCase();
    if (e === 'cumple') return 'success';
    if (e === 'no cumple') return 'error';
    if (e.includes('calibra')) return 'warning';
    return 'grey';
}

function getHistory(item) {
    // Generate mock history
    return [
        { anio: 2025, fecha: '15-10-2025', certificado: 'CAL-25-001', laboratorio: 'LAB-GAS', estado: 'Aprobado' },
        { anio: 2024, fecha: '12-10-2024', certificado: 'CAL-24-992', laboratorio: 'LAB-GAS', estado: 'Aprobado' }
    ];
}
</script>

<style scoped>
.sakai-table-card {
    border-color: #e2e8f0;
    border-radius: 12px;
    background-color: white;
}

.tabla-sakai :deep(thead th) {
    background: #f8fafc;
    color: #64748b;
    text-transform: uppercase;
    font-weight: 700;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
    height: 52px;
    border-bottom: 2px solid #e2e8f0;
}

.tabla-sakai :deep(tbody td) {
    height: 60px;
    border-bottom: 1px solid #f1f5f9;
}

.tabla-sakai :deep(tbody tr.row-hover:hover) {
    background-color: #f8fafc !important;
}
</style>
