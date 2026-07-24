<template>
  <v-hover v-slot="{ isHovering, props: hoverProps }">
    <v-card
      v-bind="hoverProps"
      :class="['modern-indicator-card', { active: isActive, hovered: isHovering }]"
      variant="outlined"
      class="text-center d-flex flex-column justify-center"
      @click="toggle"
    >
      <v-card-text class="pa-2 d-flex flex-column justify-center align-center h-100">
        <div class="kpi-title mb-1">
          {{ titulo }}
        </div>
        
        <div
          v-if="loading"
          class="mt-2 w-100 px-4"
        >
          <v-progress-linear
            indeterminate
            height="2"
            :color="color"
            class="rounded-pill"
          />
        </div>
        <div
          v-else
          class="kpi-value"
          :style="{ color: color || '#000000' }"
        >
          {{ valorDisplay }}
        </div>
      </v-card-text>
    </v-card>
  </v-hover>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import apiAxios from '@/services/api';

const props = defineProps({
  id: { type: [String, Number], required: true },
  idActivo: { type: [String, Number, null] },
  icon: { type: String, default: 'mdi-help' },
  color: { type: String, default: '#64748b' },
  titulo: { type: String, default: '' },
  url: { type: String, default: '' },
  
  // Filtros
  fechaDesde: String,
  fechaHasta: String,
  filtro: [String, Number],
  secatrib: [String, Number],
  teratrib: [String, Number]
})

const emit = defineEmits(['toggle'])

const valor = ref(null)
const loading = ref(false)

const isActive = computed(() => String(props.idActivo ?? '') === String(props.id ?? ''))
const valorDisplay = computed(() => {
  if (valor.value === null || valor.value === undefined) return '--'
  return typeof valor.value === 'number' ? valor.value.toLocaleString('es-CL') : valor.value
})

const fetchData = async () => {
  if (!props.url) {
    valor.value = 0;
    return;
  }
  loading.value = true
  try {
    const params = {
      fecha_desde: props.fechaDesde || '',
      fecha_hasta: props.fechaHasta || '',
      filtro: props.filtro || '',
      secatrib: props.secatrib || '',
      teratrib: props.teratrib || ''
    }
    
    // Si la URL es un JSON local
    if (props.url.endsWith('.json')) {
        const base = import.meta.env.BASE_URL || '/'
        const urlJson = base.replace(/\/$/, '') + '/' + props.url.replace(/^\//, '')
        const resp = await fetch(urlJson)
        const json = await resp.json()
        valor.value = json.indicador ?? 0
        return
    }

    const url = props.url.startsWith('/') ? props.url : `/${props.url}`
    const { data } = await apiAxios.get(`/servicio${url}`, { params })
    
    if (data && typeof data === 'object') {
      valor.value = data.indicador ?? data.total ?? data.valor ?? data.valor_actual ?? 0
    } else {
      valor.value = data ?? 0
    }
  } catch (e) {
    console.error(`Error fetching KPI ${props.titulo}:`, e)
    valor.value = 0
  } finally {
    loading.value = false
  }
}

watch(() => [props.fechaDesde, props.fechaHasta, props.filtro, props.secatrib, props.teratrib], fetchData)

onMounted(fetchData)

const toggle = () => emit('toggle', props.id)
</script>

<style scoped>
.modern-indicator-card {
  width: 100%;
  min-width: 140px;
  height: 90px;
  background-color: #ffffff;
  border-radius: 8px !important;
  border: 1px solid #e2e8f0 !important;
  transition: all 0.2s ease;
  cursor: pointer;
}

.modern-indicator-card.hovered {
  border-color: #cbd5e1 !important;
  background-color: #f8fafc;
  transform: translateY(-2px);
}

.modern-indicator-card.active {
  border: 2px solid v-bind(color) !important;
}

.kpi-title {
  font-size: 0.65rem;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1.2;
}

.kpi-value {
  font-size: 1.6rem;
  font-weight: 800;
  line-height: 1;
}
</style>
