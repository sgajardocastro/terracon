<template>
  <div class="mb-4">
    <!-- Wrapper visual opcional si se quiere agrupar todo, o direct cards -->
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
        Asistencia</span>
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
            <!-- Content -->
            <div class="d-flex flex-column">
              <div
                class="text-caption font-weight-bold text-medium-emphasis text-uppercase mb-1 tracking-wide"
              >
                {{ kpi.title }}
              </div>
              <div class="text-h4 font-weight-bold text-high-emphasis">
                {{ kpi.value }}
              </div>
              <!-- Trend / Subtitle mockup -->
              <div
                v-if="kpi.trend"
                class="d-flex align-center mt-2"
              >
                <v-icon
                  :color="kpi.trendColor"
                  size="small"
                  class="mr-1"
                >
                  {{ kpi.trendIcon }}
                </v-icon>
                <span
                  class="text-caption font-weight-medium"
                  :class="`text-${kpi.trendColor}`"
                >
                  {{ kpi.trendText }}
                </span>
                <span class="text-caption text-medium-emphasis ml-1">vs mes anterior</span>
              </div>
            </div>

            <!-- Icon Box -->
            <div
              class="kpi-icon-box"
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

        // Find the group related to 'DocumentacionAsistenciaConexion'
        const groupData = data[0]?.grupo?.find(g => g.titulo === 'DocumentacionAsistenciaConexion');

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
    border-radius: 16px;
    background-color: white;
    transition: transform 0.2s, box-shadow 0.2s;
}

.kpi-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025);
}

.tracking-wide {
    letter-spacing: 0.05em;
}

.kpi-icon-box {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Shortcuts for bg colors based on standard vuetify colors if not replacing themes */
.bg-blue-lighten-5 {
    background-color: #e3f2fd !important;
}

.bg-green-lighten-5 {
    background-color: #e8f5e9 !important;
}

.bg-red-lighten-5 {
    background-color: #ffebee !important;
}

.bg-orange-lighten-5 {
    background-color: #fff3e0 !important;
}
</style>
