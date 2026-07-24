<template>
  <div class="d-flex flex-column gap-4">
    <div
      v-for="(group, gIndex) in computedGroups"
      :key="gIndex"
    >
      <h2
        v-if="group.nombreCorto"
        class="text-subtitle-1 font-weight-bold text-primary-dark mb-3 d-flex align-center px-1"
      >
        <v-icon
          icon="mdi-chart-box-outline"
          class="mr-2"
          color="primary"
        />
        {{ group.nombreCorto }}
      </h2>

      <v-row dense>
        <v-col
          v-for="(indicador, i) in group.indicadores"
          :key="i"
          cols="12"
          sm="6"
          md="6"
          lg="3"
        >
          <v-card
            v-ripple
            class="kpi-card h-100 cursor-pointer"
            variant="outlined"
            elevation="0"
            :class="{ 'card-active': activeId === getUniqueId(group, i) }"
            @click="toggle(getUniqueId(group, i), indicador)"
          >
            <v-card-text class="pa-4 d-flex align-center justify-space-between h-100">
              <!-- Datos -->
              <div class="d-flex flex-column">
                <div
                  class="text-caption font-weight-bold text-medium-emphasis text-uppercase mb-1 tracking-wide"
                >
                  {{ indicador.titulo }}
                </div>
                <div class="d-flex align-baseline">
                  <span class="text-h4 font-weight-bold text-high-emphasis">
                    {{ formatNumber(indicador.value) }}
                  </span>
                  <span
                    v-if="indicador.unidad"
                    class="text-caption text-medium-emphasis ml-1"
                  >
                    {{ indicador.unidad }}
                  </span>
                </div>

                <!-- Loading state -->
                <div
                  v-if="indicador.loading"
                  class="mt-2"
                  style="width: 40px"
                >
                  <v-progress-linear
                    indeterminate
                    color="primary"
                    height="2"
                    rounded
                  />
                </div>
              </div>

              <!-- Icono -->
              <div
                class="kpi-icon-box elevation-0"
                :style="{ backgroundColor: getColorBg(indicador.color), color: getColorText(indicador.color) }"
              >
                <v-icon size="28">
                  {{ indicador.icono }}
                </v-icon>
              </div>
            </v-card-text>

            <!-- Active Indicator -->
            <div
              v-if="activeId === getUniqueId(group, i)"
              class="active-indicator"
            />
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import apiAxios from '@/services/api'

const props = defineProps({
    fechaDesde: String,
    fechaHasta: String,
    clienteId: [String, Number],
    proyectoId: [String, Number],
    // Optional if we want to pass data from parent
    jsonData: { type: Array, default: () => [] }
})

const emit = defineEmits(['toggle-indicator'])

const activeId = ref(null)
const internalData = ref([])

// Combine props.jsonData with internal state (values)
const computedGroups = computed(() => {
    const source = internalData.value.length ? internalData.value : props.jsonData
    if (!source || !source.length) return []

    const groups = []
    source.forEach(item => {
        if (item.grupo && Array.isArray(item.grupo)) {
            item.grupo.forEach(g => {
                groups.push(g)
            })
        }
    })
    return groups
})

// Helper to generate unique ID for toggle
function getUniqueId(group, index) {
    return `${group.nombreCorto}-${index}`
}

function getColorBg(colorName) {
    const map = {
        'Green': '#dcfce7', // green-100/200 like
        'Indigo': '#e0e7ff',
        'Teal': '#ccfbf1',
        'Orange': '#ffedd5',
        'Blue': '#dbeafe',
        'Red': '#fee2e2'
    }
    // Asistencia uses lighter backgrounds often, similar to these tailwind defaults
    return map[colorName] || '#f1f5f9'
}

function getColorText(colorName) {
    const map = {
        'Green': '#15803d', // green-700
        'Indigo': '#4338ca',
        'Teal': '#0f766e',
        'Orange': '#c2410c',
        'Blue': '#1d4ed8',
        'Red': '#b91c1c'
    }
    return map[colorName] || '#334155'
}

function formatNumber(val) {
    if (val === undefined || val === null) return '-'
    return Number(val).toLocaleString('es-CL')
}

// Fetch logic
async function fetchData() {
    if (!internalData.value.length && props.jsonData.length) {
        internalData.value = JSON.parse(JSON.stringify(props.jsonData))
    }

    for (const item of internalData.value) {
        if (item.grupo && Array.isArray(item.grupo)) {
            for (const g of item.grupo) {
                if (g.indicadores && Array.isArray(g.indicadores)) {
                    for (const ind of g.indicadores) {
                        fetchIndicatorValue(ind)
                    }
                }
            }
        }
    }
}

async function fetchIndicatorValue(ind) {
    if (!ind.uri) return

    ind.loading = true
    try {
        const params = {
            fecha_desde: props.fechaDesde || '',
            fecha_hasta: props.fechaHasta || '',
            filtro: props.clienteId ?? '',   // cliente
            secatrib: props.proyectoId ?? '', // proyecto
            teratrib: ''
        }

        const url = '/servicio' + ind.uri
        const { data } = await apiAxios.get(url, { params })

        ind.value = parseFloat(data.indicador ?? 0)

    } catch (e) {
        console.error(`Error fetching ${ind.titulo}`, e)
        ind.value = 0
    } finally {
        ind.loading = false
    }
}

function toggle(id, indicator) {
    if (activeId.value === id) {
        activeId.value = null
        emit('toggle-indicator', null)
    } else {
        activeId.value = id
        emit('toggle-indicator', { id, ...indicator })
    }
}

watch(() => [props.fechaDesde, props.fechaHasta, props.clienteId, props.proyectoId], () => {
    fetchData()
}, { deep: true })

watch(() => props.jsonData, (newVal) => {
    if (newVal && newVal.length) {
        internalData.value = JSON.parse(JSON.stringify(newVal))
        fetchData()
    }
}, { immediate: true })

onMounted(() => {
    fetchData()
})

</script>

<style scoped>
.text-primary-dark {
    color: #1e293b;
}

.kpi-card {
    border-color: #e2e8f0 !important;
    border-radius: 16px !important;
    background-color: white !important;
    position: relative;
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
}

.kpi-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025) !important;
}

.card-active {
    border-color: #3b82f6 !important;
    /* blue-500 */
    background-color: #eff6ff !important;
    /* blue-50 */
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5) !important;
}

.kpi-icon-box {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.tracking-wide {
    letter-spacing: 0.05em;
}

.active-indicator {
    position: absolute;
    top: 0;
    right: 0;
    width: 0;
    height: 0;
    border-left: 12px solid transparent;
    border-top: 12px solid #3b82f6;
}

.gap-4 {
    gap: 16px;
}
</style>
