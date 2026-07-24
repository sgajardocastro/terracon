<template>
  <v-container
    fluid
    class="p-4"
  >
    <!-- Título y Flujo de Aprobación -->
    <!--
    <v-card flat class="mb-4 border rounded-lg">
      <v-card-text class="d-flex flex-wrap align-center justify-space-between gap-4">
        <div>
          <h1 class="text-h5 font-weight-bold text-gray-800">Seguimiento de Proyecto</h1>
          <div class="d-flex align-center mt-2">
            <span class="font-weight-bold mr-2">Estado:</span>
            <v-chip :color="statusInfo.color" variant="flat" size="small">
              <v-icon start :icon="statusInfo.icon" />
              {{ viewingVersion !== null ? 'Viendo Historial' : projectInfo.status }}
            </v-chip>

            <span class="font-weight-bold ml-4 mr-2">Versión:</span>
            <v-chip color="blue-grey" variant="tonal" size="small" class="font-weight-bold">
              {{ viewingVersion !== null ? viewingVersion : projectInfo.version }}
            </v-chip>
          </div>
        </div>

        <div class="d-flex gap-2 align-center">
          <v-menu>
            <template #activator="{ props }">
              <v-btn v-bind="props" prepend-icon="mdi-history">Ver Historial</v-btn>
            </template>
            <v-list density="compact">
              <v-list-item v-if="versionHistory.length === 0">
                <v-list-item-title>No hay versiones aprobadas</v-list-item-title>
              </v-list-item>
              <v-list-item
                v-for="version in versionHistory"
                :key="version.version"
                @click="viewVersion(version)"
              >
                <v-list-item-title>Versión {{ version.version }}</v-list-item-title>
                <v-list-item-subtitle>{{ version.approvedAt }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-menu>

          <v-btn
            v-if="viewingVersion !== null"
            color="primary"
            prepend-icon="mdi-arrow-left-circle"
            @click="viewCurrentVersion"
          >
            Volver a Versión Actual
          </v-btn>

          <div v-if="viewingVersion === null" class="d-flex gap-2">
            <v-btn
              v-if="projectInfo.status === 'Carga Inicial'"
              color="blue"
              prepend-icon="mdi-send"
              @click="handleStateChange('En Aprobación')"
            >
              Enviar a Aprobación
            </v-btn>
            <v-btn
              v-if="projectInfo.status === 'En Aprobación'"
              color="green"
              prepend-icon="mdi-check-circle"
              @click="approveBaseline"
            >
              Aprobar Línea Base
            </v-btn>
            <v-btn
              v-if="projectInfo.status === 'Cambios en Aprobación'"
              color="green"
              prepend-icon="mdi-check-circle"
              @click="approveChanges"
            >
              Aprobar Cambios
            </v-btn>
            <v-btn
              v-if="['En Aprobación', 'Cambios en Aprobación'].includes(projectInfo.status)"
              color="red"
              prepend-icon="mdi-close-circle"
              @click="rejectChanges"
            >
              Rechazar
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>
    -->

    <!-- Panel de Indicadores -->
    <!--
    <v-card flat class="mb-4 border rounded-lg">
      <v-card-title class="d-flex align-center justify-space-between">
        <span class="text-lg font-weight-bold text-gray-700">
          Panel de Indicadores {{ viewingVersion !== null ? `(Versión ${viewingVersion})` : ''}}
        </span>
        <v-btn
          v-if="viewingVersion === null"
          color="primary"
          variant="tonal"
          @click="generateExecutiveSummary"
        >
          ✨ Generar Resumen Ejecutivo
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-row dense>
          <v-col cols="12" sm="6" md="3">
            <v-sheet rounded="lg" class="p-3 fill-height d-flex flex-column" color="blue-lighten-5">
              <div class="text-sm font-weight-medium text-blue-darken-4">% Avance Planificado</div>
              <div class="text-h5 font-weight-bold text-blue-darken-2 mt-1">{{ summaryStats.avancePlan.toFixed(2) }}%</div>
            </v-sheet>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-sheet rounded="lg" class="p-3 fill-height d-flex flex-column" color="green-lighten-5">
              <div class="text-sm font-weight-medium text-green-darken-4">% Avance Real</div>
              <div class="text-h5 font-weight-bold text-green-darken-2 mt-1">{{ summaryStats.avanceReal.toFixed(2) }}%</div>
            </v-sheet>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-sheet
              rounded="lg"
              class="p-3 fill-height d-flex flex-column"
              :color="summaryStats.retraso > 0 ? 'orange-lighten-5' : 'teal-lighten-5'"
            >
              <div
                class="text-sm font-weight-medium"
                :class="summaryStats.retraso > 0 ? 'text-orange-darken-4' : 'text-teal-darken-4'"
              >
                % Desviación
              </div>
              <div
                class="text-h5 font-weight-bold mt-1"
                :class="summaryStats.retraso > 0 ? 'text-orange-darken-2' : 'text-teal-darken-2'"
              >
                {{ summaryStats.retraso.toFixed(2) }}%
              </div>
            </v-sheet>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-sheet rounded="lg" class="p-3 fill-height d-flex flex-column" color="red-lighten-5">
              <div class="text-sm font-weight-medium text-red-darken-4">N° Incumplimientos</div>
              <div class="text-h5 font-weight-bold text-red-darken-2 mt-1">{{ summaryStats.incumplimientos }}</div>
            </v-sheet>
          </v-col>

          <v-col cols="12" class="mt-3">
            <div class="text-md font-weight-bold text-gray-700 mb-2">Avance por Familia</div>
            <v-row dense>
              <v-col
                v-for="(avance, familia) in summaryStats.avancePorFamilia"
                :key="familia"
                cols="12"
                sm="4"
                md="3"
              >
                <v-sheet rounded="lg" class="p-2 border">
                  <div class="text-xs font-weight-medium text-gray-600 truncate">{{ familia }}</div>
                  <v-progress-linear :model-value="avance" height="8" rounded class="my-1" />
                  <div class="text-xs font-weight-bold text-right text-gray-800">{{ avance.toFixed(1) }}%</div>
                </v-sheet>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    -->

    <!-- Filtros -->
    <v-card
      flat
      class="mb-4 border rounded-lg"
    >
      <v-card-text>
        <v-row
          align="center"
          dense
        >
          <v-col
            cols="12"
            md="4"
          >
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Filtrar por Familia, Partida o Cuadrilla..."
              variant="outlined"
              density="comfortable"
              hide-details
              clearable
            />
          </v-col>
          <v-col
            cols="6"
            md="2"
          >
            <v-text-field
              v-model="filterStartDate"
              type="date"
              label="Fecha Desde"
              variant="outlined"
              hide-details
            />
          </v-col>
          <v-col
            cols="6"
            md="2"
          >
            <v-text-field
              v-model="filterEndDate"
              type="date"
              label="Fecha Hasta"
              variant="outlined"
              hide-details
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Tabla de Datos -->
    <div class="overflow-x-auto border rounded-lg bg-white">
      <v-data-table
        :headers="dynamicHeaders"
        :items="processedData"
        :search="search"
        item-value="id"
        density="compact"
        class="text-xs"
        :items-per-page="-1"
        hide-default-footer
      >
        <template #item="{ item }">
          <tr
            :class="[
              getRowClass(item),
              {
                expanded:
                  (item.isFamiliaSummary && isFamiliaExpanded(item.familiaId)) ||
                  (item.isPartidaSummary && isPartidaExpanded(item.partidaId))
              }
            ]"
            @click="handleRowClick(item)"
          >
            <!-- Columna de Edición / Expansión -->
            <td class="sticky-left sticky-edit-icon text-center">
              <v-icon
                v-if="item.isFamiliaSummary"
                size="small"
                class="expand-icon mr-1"
              >
                {{ isFamiliaExpanded(item.familiaId) ? 'mdi-chevron-down' : 'mdi-chevron-right' }}
              </v-icon>
              <v-icon
                v-else-if="item.isPartidaSummary"
                size="small"
                class="expand-icon ml-2 mr-1"
              >
                {{ isPartidaExpanded(item.partidaId) ? 'mdi-chevron-down' : 'mdi-chevron-right' }}
              </v-icon>
              <v-btn
                v-else-if="item.type === 'CuadrillaPlan'"
                icon="mdi-pencil"
                variant="text"
                size="x-small"
                :disabled="viewingVersion !== null"
                @click.stop="openEditDialog(item.originalItem)"
              />
            </td>

            <!-- Columnas Fijas (NUEVA JERARQUÍA) -->
            <td class="sticky-left sticky-familia font-weight-medium text-left nowrap">
              <span class="linklike">
                {{ item.isFamiliaSummary ? item.familia : '' }}
              </span>
            </td>
            <td class="sticky-left sticky-partida text-left indent-partida nowrap">
              {{ item.isPartidaSummary ? item.partida : '' }}
            </td>
            <td class="sticky-left sticky-unidad text-left nowrap bold-unit">
              {{ (item.isFamiliaSummary || item.isPartidaSummary) ? item.unidad : '' }}
            </td>
            <td class="sticky-left sticky-ponderado font-weight-bold nowrap">
              {{ (item.isFamiliaSummary || item.isPartidaSummary) ? item.ponderado : '' }}
            </td>
            <td class="sticky-left sticky-cuadrilla text-left indent-cuadrilla nowrap">
              {{ item.isCuadrilla ? item.cuadrilla : '' }}
            </td>
            <!-- Av. Plan % -->
            <td class="sticky-left sticky-plan nowrap">
              <div
                v-if="item.isFamiliaSummary || item.isPartidaSummary"
                class="cell-progress"
              >
                <v-progress-linear
                  :model-value="item.avance_plan"
                  height="10"
                  rounded
                />
                <span class="cell-progress__label">{{ item.avance_plan.toFixed(0) }}%</span>
              </div>
              <div
                v-else-if="item.type === 'CuadrillaPlan'"
                class="cell-progress"
              >
                <v-progress-linear
                  :model-value="item.avance_plan"
                  height="10"
                  rounded
                  color="blue-lighten-2"
                />
                <span class="cell-progress__label">{{ item.avance_plan }}%</span>
              </div>
            </td>

            <!-- Av. Real % -->
            <td class="sticky-left sticky-real nowrap">
              <div
                v-if="item.isFamiliaSummary || item.isPartidaSummary"
                class="cell-progress"
              >
                <v-progress-linear
                  :model-value="item.avance_real"
                  height="10"
                  rounded
                  :color="item.avance_real >= 90 ? 'green-darken-2' : (item.avance_real >= 50 ? 'amber-darken-2' : 'red-darken-2')"
                />
                <span class="cell-progress__label">{{ item.avance_real.toFixed(0) }}%</span>
              </div>
              <div
                v-else-if="item.type === 'CuadrillaReal'"
                class="cell-progress"
              >
                <v-progress-linear
                  :model-value="item.avance_real"
                  height="10"
                  rounded
                  :color="item.avance_real >= 90 ? 'green' : (item.avance_real >= 50 ? 'amber' : 'red')"
                />
                <span class="cell-progress__label">{{ item.avance_real }}%</span>
              </div>
            </td>

            <!-- Tipo -->
            <td
              class="text-left font-weight-bold nowrap type-col"
              :class="{
                'text-blue-darken-2': item.type === 'CuadrillaPlan',
                'text-green-darken-2': item.type === 'CuadrillaReal',
                'text-blue-grey-darken-4': item.isFamiliaSummary,
                'text-blue-grey-darken-2': item.isPartidaSummary
              }"
              style="min-width: 140px; max-width: 140px;"
            >
              <span v-if="item.isFamiliaSummary">RESUMEN FAMILIA</span>
              <span v-else-if="item.isPartidaSummary">RESUMEN PARTIDA</span>
              <span v-else-if="item.type === 'CuadrillaPlan'">Planificado</span>
              <span v-else-if="item.type === 'CuadrillaReal'">Real</span>
            </td>

            <!-- Columnas de Fechas Dinámicas (Visual de Gantt) -->
            <td
              v-for="header in dateHeaders"
              :key="header.key"
              class="gantt-bar-cell"
              :class="{ 'incumplimiento-celda': checkIncumplimiento(item, header.key) }"
            >
              <v-sheet
                v-if="item.isCuadrilla && isDateActive(item, header.key)"
                :color="item.type === 'CuadrillaPlan' ? 'blue-lighten-4' : 'green-lighten-4'"
                height="12"
                rounded="xl"
                class="mx-auto gantt-pill"
                style="width: 80%; border: 1px solid rgba(0,0,0,0.06);"
              />
            </td>
          </tr>
        </template>

        <template #no-data>
          <div class="text-center py-4">
            No hay datos para mostrar.
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- Diálogo de Edición -->
    <v-dialog
      v-model="editDialog"
      max-width="800px"
    >
      <v-card>
        <v-card-title>
          <span class="text-h5">Editar Tarea</span>
        </v-card-title>
        <v-card-subtitle>
          {{ editedItem.familia }} / {{ editedItem.partida }} / {{ editedItem.cuadrilla }}
        </v-card-subtitle>
        <v-card-text>
          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <v-container>
                <v-row>
                  <v-col
                    cols="12"
                    sm="6"
                  >
                    <v-text-field
                      v-model="editedItem.inicio_plan"
                      label="Inicio Plan"
                      type="date"
                    />
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                  >
                    <v-text-field
                      v-model="editedItem.fin_plan"
                      label="Fin Plan"
                      type="date"
                    />
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                  >
                    <v-text-field
                      v-model="editedItem.inicio_real"
                      label="Inicio Real"
                      type="date"
                    />
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                  >
                    <v-text-field
                      v-model="editedItem.fin_real"
                      label="Fin Real"
                      type="date"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-slider
                      v-model="editedItem.avance"
                      label="% Avance Real"
                      thumb-label
                      step="1"
                      class="mt-4"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-slider
                      v-model="editedItem.avance_plan"
                      label="% Avance Plan"
                      thumb-label
                      step="1"
                      class="mt-1"
                    />
                  </v-col>
                </v-row>
              </v-container>
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <v-sheet
                class="pa-4 rounded-lg fill-height"
                color="grey-lighten-4"
              >
                <div class="d-flex justify-space-between align-center mb-3">
                  <span class="font-weight-bold">Asistente IA</span>
                  <v-btn
                    color="secondary"
                    size="small"
                    :loading="geminiSuggestions.loading"
                    @click="getCorrectiveActions"
                  >
                    ✨ Sugerir Acciones
                  </v-btn>
                </div>
                <v-divider class="mb-3" />

                <div
                  v-if="geminiSuggestions.loading"
                  class="text-center"
                >
                  <v-progress-circular
                    indeterminate
                    color="primary"
                  />
                  <p class="text-caption mt-2">
                    Analizando tarea...
                  </p>
                </div>
                <div
                  v-else-if="geminiSuggestions.error"
                  class="text-red"
                >
                  {{ geminiSuggestions.error }}
                </div>
                <div
                  v-else-if="!geminiSuggestions.text"
                  class="text-caption text-center"
                >
                  Presiona "Sugerir Acciones" para obtener recomendaciones si la tarea está atrasada.
                </div>
                <div
                  v-else
                  class="text-body-2 gemini-suggestions"
                >
                  {{ geminiSuggestions.text }}
                </div>
              </v-sheet>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="blue-darken-1"
            variant="text"
            @click="closeEditDialog"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="blue-darken-1"
            variant="tonal"
            @click="saveEditDialog"
          >
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo Resumen Ejecutivo IA -->
    <v-dialog
      v-model="geminiSummary.dialog"
      max-width="700px"
    >
      <v-card>
        <v-card-title class="d-flex align-center">
          ✨ Resumen Ejecutivo del Proyecto
          <v-spacer />
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="geminiSummary.dialog = false"
          />
        </v-card-title>
        <v-card-text>
          <div
            v-if="geminiSummary.loading"
            class="text-center pa-8"
          >
            <v-progress-circular
              indeterminate
              size="64"
              color="primary"
            />
            <p class="mt-4">
              Generando análisis con IA...
            </p>
          </div>
          <div
            v-else-if="geminiSummary.error"
            class="text-red"
          >
            {{ geminiSummary.error }}
          </div>
          <v-sheet
            v-else
            class="pa-4 rounded-lg"
            color="blue-lighten-5"
          >
            <p style="white-space: pre-wrap;">
              {{ geminiSummary.text }}
            </p>
          </v-sheet>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

/***** PROPS (opcionales) *****/
// Puedes inyectar datos iniciales o una API key desde el padre si quieres.
// const props = defineProps<{ initialData?: any[]; apiKey?: string }>()

/***** ESTADO BASE *****/
const rawData = ref([
  {
    familia: 'Movimiento de tierras',
    partidas: [
      {
        partida: 'Excavaciones',
        cuadrillas: [
          {
            id: 1,
            cuadrilla: 'C-01',
            unidad: 'm³',
            ponderado: 20,
            avance_plan: 100,
            inicio_plan: '2025-10-20',
            fin_plan: '2025-10-25',
            inicio_real: '2025-10-20',
            fin_real: '2025-10-26',
            avance: 80,
            daily_plan: {
              '2025-10-20': 8,
              '2025-10-21': 8,
              '2025-10-22': 8,
              '2025-10-23': 8,
              '2025-10-24': 8,
              '2025-10-25': 8
            },
            daily_real: {
              '2025-10-20': 8,
              '2025-10-21': 7,
              '2025-10-22': 8,
              '2025-10-24': 8,
              '2025-10-25': 8,
              '2025-10-26': 5
            }
          },
          {
            id: 2,
            cuadrilla: 'C-02',
            unidad: 'm³',
            ponderado: 15,
            avance_plan: 50,
            inicio_plan: '2025-10-22',
            fin_plan: '2025-10-27',
            inicio_real: '2025-10-23',
            fin_real: null,
            avance: 30,
            daily_plan: {
              '2025-10-22': 10,
              '2025-10-23': 10,
              '2025-10-24': 10,
              '2025-10-25': 10,
              '2025-10-26': 10,
              '2025-10-27': 10
            },
            daily_real: {
              '2025-10-23': 8,
              '2025-10-24': 9
            }
          }
        ]
      },
      {
        partida: 'Instalación de Faena',
        cuadrillas: [
          {
            id: 3,
            cuadrilla: 'C-03',
            unidad: 'Glb',
            ponderado: 5,
            avance_plan: 100,
            inicio_plan: '2025-10-21',
            fin_plan: '2025-10-22',
            inicio_real: '2025-10-21',
            fin_real: '2025-10-22',
            avance: 100,
            daily_plan: { '2025-10-21': 4, '2025-10-22': 4 },
            daily_real: { '2025-10-21': 4, '2025-10-22': 4 }
          }
        ]
      }
    ]
  },
  {
    familia: 'Área Mecánica',
    partidas: [
      {
        partida: 'Soldadura Cañerías',
        cuadrillas: [
          {
            id: 4,
            cuadrilla: 'S-01',
            unidad: 'Ml',
            ponderado: 30,
            avance_plan: 60,
            inicio_plan: '2025-10-26',
            fin_plan: '2025-11-02',
            inicio_real: '2025-10-26',
            fin_real: null,
            avance: 50,
            daily_plan: {
              '2025-10-26': 1,
              '2025-10-27': 2,
              '2025-10-28': 2,
              '2025-10-29': 2,
              '2025-10-30': 2,
              '2025-10-31': 2,
              '2025-11-01': 2,
              '2025-11-02': 1
            },
            daily_real: {
              '2025-10-26': 1,
              '2025-10-27': 2,
              '2025-10-28': 2,
              '2025-10-29': 2
            }
          },
          {
            id: 5,
            cuadrilla: 'S-02',
            unidad: 'Ml',
            ponderado: 30,
            avance_plan: 0,
            inicio_plan: '2025-10-28',
            fin_plan: '2025-11-05',
            inicio_real: null,
            fin_real: null,
            avance: 0,
            daily_plan: {
              '2025-10-28': 3,
              '2025-10-29': 3,
              '2025-10-30': 3,
              '2025-10-31': 3,
              '2025-11-01': 3,
              '2025-11-02': 3,
              '2025-11-03': 3,
              '2025-11-04': 3,
              '2025-11-05': 3
            },
            daily_real: {}
          }
        ]
      }
    ]
  }
])

const search = ref('')
const filterStartDate = ref(null)
const filterEndDate = ref(null)

// Gestión de estado y versión del proyecto
const projectInfo = ref({ status: 'Carga Inicial', version: 0 })
const baselineData = ref(null)
const isReverting = ref(false)
const versionHistory = ref([])
const viewingVersion = ref(null)

// Expansión jerárquica
const expandedFamilias = ref(new Set())
const expandedPartidas = ref(new Set())

const statusInfo = computed(() => {
  if (viewingVersion.value !== null) return { color: 'info', icon: 'mdi-history' }
  switch (projectInfo.value.status) {
    case 'Carga Inicial':
      return { color: 'grey', icon: 'mdi-file-upload' }
    case 'En Aprobación':
      return { color: 'orange', icon: 'mdi-clock-alert-outline' }
    case 'Aprobada':
      return { color: 'green', icon: 'mdi-check-decagram' }
    case 'Cambios en Aprobación':
      return { color: 'amber', icon: 'mdi-pencil-circle' }
    default:
      return { color: 'primary', icon: 'mdi-help-circle' }
  }
})

// Gemini (placeholder)
const geminiSummary = ref({ dialog: false, loading: false, text: '', error: '' })
const geminiSuggestions = ref({ loading: false, text: '', error: '' })
const apiKey = ''

// Data a mostrar (histórico/actual)
const displayData = computed(() => {
  if (viewingVersion.value === null) return rawData.value
  const historyEntry = versionHistory.value.find(v => v.version === viewingVersion.value)
  return historyEntry ? historyEntry.data : []
})

// Procesamiento a filas planas con niveles: Familia -> Partida -> Cuadrillas (Plan/Real)
const processedData = computed(() => {
  const flat = []
  displayData.value.forEach(familia => {
    const familiaId = familia.familia
    const partidas = familia.partidas || []

    // Resumen familia (ponderado)
    let pondFam = 0,
      pondPlan = 0,
      pondReal = 0
    let unidadRep = ''

    partidas.forEach(p => {
      p.cuadrillas?.forEach(c => {
        pondFam += c.ponderado
        pondPlan += c.ponderado * (c.avance_plan / 100)
        pondReal += c.ponderado * (c.avance / 100)
        if (!unidadRep && c.unidad) unidadRep = c.unidad
      })
    })

    const avgPlanFam = pondFam > 0 ? (pondPlan / pondFam) * 100 : 0
    const avgRealFam = pondFam > 0 ? (pondReal / pondFam) * 100 : 0

    flat.push({
      id: `${familiaId}-summary`,
      familiaId,
      type: 'FamiliaSummary',
      familia: familia.familia,
      partida: '',
      unidad: unidadRep,
      ponderado: pondFam,
      cuadrilla: '',
      avance_plan: avgPlanFam,
      avance_real: avgRealFam,
      isFamiliaSummary: true,
      isPartidaSummary: false,
      isCuadrilla: false
    })

    // Hijos solo si la familia está expandida
    if (expandedFamilias.value.has(familiaId)) {
      partidas.forEach(p => {
        const cuadrillas = p.cuadrillas || []
        const pondPar = cuadrillas.reduce((a, c) => a + c.ponderado, 0)
        const pondPlanPar = cuadrillas.reduce((a, c) => a + c.ponderado * (c.avance_plan / 100), 0)
        const pondRealPar = cuadrillas.reduce((a, c) => a + c.ponderado * (c.avance / 100), 0)
        const avgPlanPar = pondPar > 0 ? (pondPlanPar / pondPar) * 100 : 0
        const avgRealPar = pondPar > 0 ? (pondRealPar / pondPar) * 100 : 0
        const unidadPar = cuadrillas[0]?.unidad || ''
        const partidaId = `${familiaId}-${p.partida}`

        flat.push({
          id: `${partidaId}-summary`,
          familiaId,
          partidaId,
          type: 'PartidaSummary',
          familia: '',
          partida: p.partida,
          unidad: unidadPar,
          ponderado: pondPar,
          cuadrilla: '',
          avance_plan: avgPlanPar,
          avance_real: avgRealPar,
          daily_plan: {},
          daily_real: {},
          isFamiliaSummary: false,
          isPartidaSummary: true,
          isCuadrilla: false
        })

        // Cuadrillas solo si la partida está expandida
        if (expandedPartidas.value.has(partidaId)) {
          cuadrillas.forEach(c => {
            flat.push({
              id: `${c.id}-plan`,
              familiaId,
              partidaId,
              type: 'CuadrillaPlan',
              originalItem: c,
              familia: '',
              partida: '',
              unidad: '',
              ponderado: '',
              cuadrilla: c.cuadrilla,
              avance_plan: c.avance_plan,
              avance_real: '',
              daily_plan: c.daily_plan,
              daily_real: {},
              isFamiliaSummary: false,
              isPartidaSummary: false,
              isCuadrilla: true
            })
            flat.push({
              id: `${c.id}-real`,
              familiaId,
              partidaId,
              type: 'CuadrillaReal',
              originalItem: c,
              familia: '',
              partida: '',
              unidad: '',
              ponderado: '',
              cuadrilla: c.cuadrilla,
              avance_plan: '',
              avance_real: c.avance,
              daily_plan: c.daily_plan,
              daily_real: c.daily_real,
              isFamiliaSummary: false,
              isPartidaSummary: false,
              isCuadrilla: true
            })
          })
        }
      })
    }
  })
  return flat
})

const getRowClass = item => {
  if (item.isFamiliaSummary) return 'row-familia-summary'
  if (item.isPartidaSummary) return 'row-partida-summary'
  if (item.type === 'CuadrillaPlan') return 'row-cuadrilla-plan'
  if (item.type === 'CuadrillaReal') return 'row-cuadrilla-real'
  return ''
}

// Toggle expansión
const isFamiliaExpanded = familiaId => expandedFamilias.value.has(familiaId)
const isPartidaExpanded = partidaId => expandedPartidas.value.has(partidaId)
const toggleFamilia = familiaId => {
  if (expandedFamilias.value.has(familiaId)) {
    expandedFamilias.value.delete(familiaId)
    // Colapsa partidas hijas
    processedData.value
      .filter(i => i.isPartidaSummary && i.familiaId === familiaId)
      .forEach(i => expandedPartidas.value.delete(i.partidaId))
  } else {
    expandedFamilias.value.add(familiaId)
  }
}
const togglePartida = partidaId => {
  if (expandedPartidas.value.has(partidaId)) expandedPartidas.value.delete(partidaId)
  else expandedPartidas.value.add(partidaId)
}
const handleRowClick = item => {
  if (item.isFamiliaSummary) toggleFamilia(item.familiaId)
  else if (item.isPartidaSummary) togglePartida(item.partidaId)
}

// Rango de fechas
const allDates = computed(() => {
  const dates = new Set()
  displayData.value.forEach(f =>
    f.partidas.forEach(p =>
      p.cuadrillas.forEach(c => {
        if (c.inicio_plan) dates.add(c.inicio_plan)
        if (c.fin_plan) dates.add(c.fin_plan)
        if (c.inicio_real) dates.add(c.inicio_real)
        if (c.fin_real) dates.add(c.fin_real)
      })
    )
  )
  const sorted = Array.from(dates).sort()
  if (sorted.length === 0) return []
  const start = new Date(sorted[0] + 'T00:00:00')
  const end = new Date(sorted[sorted.length - 1] + 'T00:00:00')
  const arr = []
  let cur = start
  while (cur <= end) {
    arr.push(cur.toISOString().slice(0, 10))
    cur.setDate(cur.getDate() + 1)
  }
  return arr
})

const filteredDates = computed(() => {
  if (!filterStartDate.value && !filterEndDate.value) return allDates.value
  return allDates.value.filter(d => {
    const afterStart = !filterStartDate.value || d >= filterStartDate.value
    const beforeEnd = !filterEndDate.value || d <= filterEndDate.value
    return afterStart && beforeEnd
  })
})

const dateHeaders = computed(() =>
  filteredDates.value.map(date => ({
    key: date,
    title: new Date(date + 'T00:00:00').toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit'
    }),
    sortable: false,
    align: 'center',
    class: 'date-header'
  }))
)

const dynamicHeaders = computed(() => {
  const base = [
    { key: 'edit', title: '', sortable: false, width: '50px', class: 'sticky-left-header sticky-edit-icon' },
    { key: 'familia', title: 'Familia', sortable: false, width: '150px', class: 'sticky-left-header sticky-familia' },
    { key: 'partida', title: 'Partida', sortable: false, width: '150px', class: 'sticky-left-header sticky-partida' },
    { key: 'unidad', title: 'Unidad', sortable: false, width: '70px', class: 'sticky-left-header sticky-unidad' },
    { key: 'ponderado', title: 'Pond.', sortable: false, width: '70px', class: 'sticky-left-header sticky-ponderado' },
    { key: 'cuadrilla', title: 'Cuadrilla', sortable: false, width: '100px', class: 'sticky-left-header sticky-cuadrilla' },
    { key: 'avance_plan', title: 'Av. Plan %', sortable: false, width: '90px', class: 'sticky-left-header sticky-plan' },
    { key: 'avance_real', title: 'Av. Real %', sortable: false, width: '90px', class: 'sticky-left-header sticky-real' },
    { key: 'type', title: 'Tipo', sortable: false, width: '100px' }
  ]
  return [...base, ...dateHeaders.value]
})

const summaryStats = computed(() => {
  let totalPlanVal = 0,
    totalRealVal = 0,
    incumple = 0
  const planFam = {},
    realFam = {}
  const today = new Date().toISOString().split('T')[0]

  displayData.value.forEach(f => {
    if (!planFam[f.familia]) {
      planFam[f.familia] = 0
      realFam[f.familia] = 0
    }
    f.partidas.forEach(p =>
      p.cuadrillas.forEach(c => {
        // incumplimiento: había plan y no hubo real (fecha pasada)
        Object.entries(c.daily_plan || {}).forEach(([date, val]) => {
          if (date < today && val > 0 && (!c.daily_real || !c.daily_real[date] || c.daily_real[date] <= 0)) {
            incumple++
          }
        })
        const planVal = c.ponderado * (c.avance_plan / 100)
        const realVal = c.ponderado * (c.avance / 100)
        totalPlanVal += planVal
        totalRealVal += realVal
        planFam[f.familia] += planVal
        realFam[f.familia] += realVal
      })
    )
  })

  const avanceFamilia = {}
  Object.keys(planFam).forEach(fam => {
    let pondTotalFam = 0
    const famData = displayData.value.find(f => f.familia === fam)
    famData?.partidas.forEach(p => p.cuadrillas.forEach(c => (pondTotalFam += c.ponderado)))
    avanceFamilia[fam] = pondTotalFam > 0 ? (realFam[fam] / pondTotalFam) * 100 : 0
  })

  const pondTotal = displayData.value.reduce(
    (acc, f) => acc + f.partidas.reduce((pAcc, p) => pAcc + p.cuadrillas.reduce((cAcc, c) => cAcc + c.ponderado, 0), 0),
    0
  )

  const avanceReal = pondTotal > 0 ? (totalRealVal / pondTotal) * 100 : 0
  const avancePlanEsperado = pondTotal > 0 ? (totalPlanVal / pondTotal) * 100 : 0

  return {
    avancePlan: avancePlanEsperado,
    avanceReal,
    retraso: avancePlanEsperado - avanceReal,
    incumplimientos: incumple,
    avancePorFamilia: avanceFamilia
  }
})

const getAvanceColor = avance => {
  if (avance >= 90) return 'success'
  if (avance >= 50) return 'warning'
  return 'error'
}

const isDateActive = (item, date) => {
  if (!item.isCuadrilla) return false
  if (item.type === 'CuadrillaPlan') return item.daily_plan && item.daily_plan[date] > 0
  if (item.type === 'CuadrillaReal') return item.daily_real && item.daily_real[date] > 0
  return false
}

const checkIncumplimiento = (item, date) => {
  if (!item.isCuadrilla) return false
  if (item.type === 'CuadrillaReal') {
    const today = new Date().toISOString().slice(0, 10)
    const planValue = item.daily_plan?.[date]
    const realValue = item.daily_real?.[date]
    return date < today && planValue && planValue > 0 && (!realValue || realValue <= 0)
  }
  return false
}

// Diálogo edición
const editDialog = ref(false)
const editedItem = ref({})
const originalItemRef = ref(null)

const openEditDialog = item => {
  originalItemRef.value = item
  editedItem.value = JSON.parse(JSON.stringify(item))
  // Lookup familia/partida para el subtítulo
  for (const f of rawData.value) {
    for (const p of f.partidas) {
      if (p.cuadrillas.some(c => c.id === item.id)) {
        editedItem.value.familia = f.familia
        editedItem.value.partida = p.partida
        break
      }
    }
    if (editedItem.value.familia) break
  }
  geminiSuggestions.value = { loading: false, text: '', error: '' }
  editDialog.value = true
}

const closeEditDialog = () => {
  editDialog.value = false
}

const saveEditDialog = () => {
  if (originalItemRef.value) {
    const toSave = { ...editedItem.value }
    delete toSave.familia
    delete toSave.partida
    Object.assign(originalItemRef.value, toSave)
  }
  closeEditDialog()
}

// Flujo de aprobación
const handleStateChange = newState => {
  projectInfo.value.status = newState
}

const approveBaseline = () => {
  projectInfo.value.status = 'Aprobada'
  projectInfo.value.version = 1
  baselineData.value = JSON.parse(JSON.stringify(rawData.value))
  versionHistory.value.push({
    version: 1,
    approvedAt: new Date().toLocaleString('es-CL'),
    data: baselineData.value
  })
}

const approveChanges = () => {
  projectInfo.value.status = 'Aprobada'
  projectInfo.value.version++
  baselineData.value = JSON.parse(JSON.stringify(rawData.value))
  versionHistory.value.push({
    version: projectInfo.value.version,
    approvedAt: new Date().toLocaleString('es-CL'),
    data: baselineData.value
  })
}

const rejectChanges = () => {
  isReverting.value = true
  if (baselineData.value) rawData.value = JSON.parse(JSON.stringify(baselineData.value))
  projectInfo.value.status = 'Aprobada'
  nextTick(() => (isReverting.value = false))
}

const viewVersion = version => {
  viewingVersion.value = version.version
  expandedFamilias.value.clear()
  expandedPartidas.value.clear()
}

const viewCurrentVersion = () => {
  viewingVersion.value = null
  expandedFamilias.value.clear()
  expandedPartidas.value.clear()
}

watch(
  rawData,
  () => {
    if (projectInfo.value.status === 'Aprobada' && !isReverting.value && viewingVersion.value === null) {
      projectInfo.value.status = 'Cambios en Aprobación'
    }
  },
  { deep: true }
)

// Llamadas Gemini (placeholder seguro)
async function callGemini(prompt) {
  if (!apiKey) throw new Error('API key no configurada')
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`
  const payload = { contents: [{ parts: [{ text: prompt }] }] }
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error(`Error en la API: ${res.statusText}`)
  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No se pudo obtener una respuesta.'
}

const generateExecutiveSummary = async () => {
  geminiSummary.value = { ...geminiSummary.value, dialog: true, loading: true, error: '' }
  const stats = summaryStats.value
  const prompt = `Actúa como un jefe de proyectos de construcción. Basado en los siguientes indicadores clave (KPIs) de un proyecto, redacta un resumen ejecutivo conciso y profesional en un solo párrafo. Sé directo y claro.\n- Porcentaje de Avance Planificado a la fecha (basado en ponderación): ${stats.avancePlan.toFixed(
    2
  )}%\n- Porcentaje de Avance Real total (basado en ponderación): ${stats.avanceReal.toFixed(
    2
  )}%\n- Desviación (positivo es adelanto, negativo es retraso): ${(-stats.retraso).toFixed(
    2
  )}%\n- Número de Incumplimientos diarios: ${stats.incumplimientos}\nFinaliza con una recomendación general breve.`
  try {
    const result = await callGemini(prompt)
    geminiSummary.value.text = result
  } catch (e) {
    geminiSummary.value.error = 'No se pudo generar el resumen. Configura la API key y reintenta.'
  } finally {
    geminiSummary.value.loading = false
  }
}

const getCorrectiveActions = async () => {
  geminiSuggestions.value = { loading: true, text: '', error: '' }
  const item = editedItem.value
  const prompt = `Actúa como un asesor experto en gestión de proyectos de construcción. La siguiente tarea presenta un retraso o problemas de avance. Proporciona 3 sugerencias de acciones correctivas concretas y aplicables. Sé breve y directo en cada sugerencia.\n- Tarea: ${
    item.familia
  } - ${item.partida} - Cuadrilla: ${item.cuadrilla}\n- % Avance Planificado: ${item.avance_plan}%\n- % Avance Real Actual: ${item.avance}%\n- Ponderación de la tarea: ${item.ponderado}\nFormato de respuesta: una lista numerada.`
  try {
    const result = await callGemini(prompt)
    geminiSuggestions.value.text = result
  } catch (e) {
    geminiSuggestions.value.error = 'No se pudieron generar las sugerencias. Configura la API key y reintenta.'
  } finally {
    geminiSuggestions.value.loading = false
  }
}
</script>

<style scoped>
/* Fondo general */
:global(body),
:global(#app) {
  background-color: #f8fafc;
}

/* Forzamos layout estable en la tabla */
.v-table__wrapper > table { table-layout: fixed; }

.v-data-table-header__content {
  font-size: 0.75rem !important;
  text-align: center;
  justify-content: center;
}

.date-header {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  white-space: nowrap;
  padding-bottom: 8px;
  font-weight: 600;
}

.v-data-table__td {
  font-size: 0.75rem !important;
  text-align: center !important;
  padding: 0 4px !important;
  height: 32px !important;
  min-width: 35px;
  white-space: nowrap;
}
.v-data-table__td, .v-data-table__th {
  word-break: keep-all;
}

/* --- Estilos de Fila Jerárquicos --- */
.row-familia-summary {
  background-color: #b0bec5 !important;
  font-weight: 900;
  cursor: pointer;
}
.row-familia-summary td { color: #263238 !important; }

.row-partida-summary {
  background-color: #eceff1 !important;
  font-weight: 700;
  cursor: pointer;
}
.row-partida-summary td { color: #37474f !important; }

.row-cuadrilla-plan { background-color: #e3f2fd !important; }
.row-cuadrilla-real { background-color: #e8f5e9 !important; }

.incumplimiento-celda { background-color: #ffcdd2 !important; }

.gantt-bar-cell { padding: 4px 1px !important; }

/* --- Columnas Fijas (Sticky) --- */
.sticky-left { position: sticky; left: 0; z-index: 3; background-color: inherit; }
.sticky-left-header { position: sticky; left: 0; z-index: 4; }
.sticky-edit-icon { left: 0; min-width: 32px; max-width: 32px; }
.sticky-familia { left: 50px; min-width: 180px; max-width: 220px; }
.sticky-partida { left: 200px; min-width: 180px; max-width: 220px; }
.sticky-unidad { left: 350px; min-width: 70px; max-width: 80px; }
.sticky-ponderado { left: 420px; min-width: 70px; max-width: 80px; }
.sticky-cuadrilla { left: 490px; min-width: 100px; max-width: 120px; }
.sticky-plan { left: 590px; min-width: 90px; max-width: 110px; }
.sticky-real { left: 680px; min-width: 90px; max-width: 110px; }

.gemini-suggestions { white-space: pre-wrap; }
.expand-icon { transition: transform 0.2s ease-in-out; }
.expanded .expand-icon { transform: rotate(90deg); }

.indent-partida { padding-left: 20px !important; }
.indent-cuadrilla { padding-left: 40px !important; }

/* utilidades */
.nowrap { white-space: nowrap; }
.type-col { font-variant-numeric: tabular-nums; }
.bold-unit { font-weight: 800; }
.linklike { color: #1e88e5; text-decoration: none; }
.linklike:hover { text-decoration: underline; }

/* Encabezado tipo listado */
:global(.v-data-table .v-table__wrapper thead tr th) {
  background: #f5f7fb;
  color: #4b5563;
  font-weight: 700;
  border-bottom: 1px solid #e5e7eb;
}

/* Líneas suaves y hover */
:global(.v-data-table .v-table__wrapper tbody tr) {
  border-bottom: 1px solid #f0f2f5;
}
:global(.v-data-table .v-table__wrapper tbody tr:hover) {
  background: #f9fafb;
}

/* Celdas compactas y sin corte extraño de palabras */
.v-table__wrapper > table { table-layout: fixed; border-collapse: separate; border-spacing: 0; }
.v-data-table__td, .v-data-table__th { word-break: keep-all; }
.v-data-table__td { white-space: nowrap; }

/* Progreso dentro de celda (como tu ejemplo) */
.cell-progress { display: flex; align-items: center; gap: 8px; }
.cell-progress .v-progress-linear { flex: 1; }
.cell-progress__label { font-size: 0.75rem; color: #6b7280; min-width: 34px; text-align: right; }

/* Pastillas Gantt */
.gantt-pill { box-shadow: 0 1px 0 rgba(0,0,0,0.06); }

/* Ajuste visual de filas jerárquicas (más parecido al mock) */
.row-familia-summary { background-color: #eef2f5 !important; font-weight: 800; }
.row-familia-summary td { color: #374151 !important; }
.row-partida-summary { background-color: #f6f9fc !important; font-weight: 700; }
.row-partida-summary td { color: #4b5563 !important; }
.row-cuadrilla-plan { background-color: #f8fbff !important; }
.row-cuadrilla-real { background-color: #f7fcf8 !important; }

/* Encabezados de fechas más suaves */
.date-header { color: #6b7280; }

/* (opcional) Anchos más cómodos (solo style, no cambia estructura) */
.sticky-edit-icon { min-width: 36px; max-width: 36px; }
.sticky-familia { min-width: 220px; max-width: 260px; }
.sticky-partida { min-width: 260px; max-width: 320px; }
.sticky-unidad  { min-width: 80px;  max-width: 90px;  font-weight: 700; }
.sticky-ponderado { min-width: 80px; max-width: 90px; }
.sticky-cuadrilla { min-width: 110px; max-width: 120px; }
.sticky-plan   { min-width: 130px; max-width: 160px; }
.sticky-real   { min-width: 130px; max-width: 160px; }
</style>
