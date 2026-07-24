<template>
  <div class="mb-2">
    <!-- Título de Indicadores -->
    <div class="d-flex align-center mb-3">
      <div class="icon-box-small mr-2">
        <v-icon
          color="primary"
          size="20"
        >
          mdi-chart-bar
        </v-icon>
      </div>
      <span class="text-subtitle-2 font-weight-bold text-primary-dark uppercase-lite">Indicadores de
        Equipamiento</span>
    </div>

    <v-row dense>
      <v-col
        v-for="(kpi, i) in indicators"
        :key="i"
        cols="12"
        sm="6"
        md="3"
      >
        <v-card
          class="kpi-card h-100"
          variant="outlined"
          elevation="0"
        >
          <v-card-text class="pa-4 d-flex align-center justify-space-between h-100">
            <!-- Content Left -->
            <div class="d-flex flex-column justify-center">
              <div
                class="text-caption font-weight-bold text-medium-emphasis text-uppercase mb-1 tracking-wider"
              >
                {{ kpi.title }}
              </div>
              <div class="text-h4 font-weight-bold text-high-emphasis">
                {{ kpi.value }}
              </div>
              <!-- Trend Info -->
              <div
                v-if="kpi.trend"
                class="d-flex align-center mt-2"
              >
                <v-icon
                  :color="kpi.trendColor"
                  size="16"
                  class="mr-1"
                >
                  {{ kpi.trendIcon }}
                </v-icon>
                <span
                  class="text-caption font-weight-bold"
                  :class="`text-${kpi.trendColor}`"
                >
                  {{ kpi.trendText }}
                </span>
                <span class="text-caption text-disabled ml-1">vs mes anterior</span>
              </div>
            </div>

            <!-- Icon Box Right -->
            <div
              class="kpi-icon-container"
              :class="`bg-${kpi.color}-lighten-5`"
            >
              <v-icon
                :color="kpi.color"
                size="28"
              >
                {{ kpi.icon }}
              </v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiAxios from '@/services/api';

const indicators = ref([]);

async function fetchIndicatorValue(indicator) {
    if (!indicator?.uri) return 0;
    try {
        const { data } = await apiAxios.get('/servicio' + indicator.uri, {
            params: {
                fecha_desde: '1900-01-01',
                fecha_hasta: '2999-12-31',
                filtro: '',
                secatrib: '',
                teratrib: ''
            }
        });
        const numeric = Number(data?.indicador);
        return Number.isFinite(numeric) ? numeric : 0;
    } catch (error) {
        console.error(`Error loading indicator ${indicator?.titulo}:`, error);
        return 0;
    }
}

const loadIndicators = async () => {
    try {
        const response = await fetch('/dataConexionDocumentos.json');
        const data = await response.json();

        // Find the group related to 'DocumentacionEquipamientoConexion'
        const groupData = data[0]?.grupo?.find(g => g.titulo === 'DocumentacionEquipamientoConexion');

        if (groupData && groupData.indicadores) {
            indicators.value = groupData.indicadores.map(ind => ({
                title: ind.titulo,
                value: 0,
                uri: ind.uri,
                icon: ind.icono,
                color: ind.color.toLowerCase(), // Ensure lowercase for CSS classes
                trend: false, // Default to false until data connection
                trendIcon: '',
                trendColor: '',
                trendText: ''
            }));
            const values = await Promise.all(groupData.indicadores.map(ind => fetchIndicatorValue(ind)));
            indicators.value = indicators.value.map((kpi, idx) => ({ ...kpi, value: values[idx] ?? 0 }));
        }
    } catch (error) {
        console.error('Error loading Indicators from dataConexionDocumentos.json:', error);
    }
};

onMounted(() => {
    loadIndicators();
});
</script>

<style scoped>
.text-primary-dark {
    color: #1e293b;
}

.uppercase-lite {
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.02em;
}

.icon-box-small {
    width: 28px;
    height: 28px;
    background: #f1f5f9;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.kpi-card {
    border-color: #e2e8f0;
    border-radius: 12px;
    background-color: white;
    transition: all 0.25s ease;
}

.kpi-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 20px -8px rgba(0, 0, 0, 0.1) !important;
    border-color: #cbd5e1;
}

.tracking-wider {
    letter-spacing: 0.08em;
}

.kpi-icon-container {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Background helpers for Sakai look */
.bg-blue-lighten-5 {
    background-color: #eff6ff !important;
}

.bg-green-lighten-5 {
    background-color: #f0fdf4 !important;
}

.bg-orange-lighten-5 {
    background-color: #fffaf0 !important;
}

.bg-red-lighten-5 {
    background-color: #fef2f2 !important;
}

.bg-amber-lighten-5 {
    background-color: #fffbeb !important;
}

.text-disabled {
    color: #94a3b8 !important;
}
</style>
