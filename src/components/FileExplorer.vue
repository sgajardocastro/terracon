<template>
  <div class="file-explorer-modern d-flex flex-column h-100 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
    <div class="pa-4 border-b border-slate-100 bg-slate-50 flex-shrink-0">
      <h3 class="text-subtitle-2 font-bold text-slate-800 uppercase tracking-wider mb-3 d-flex align-center">
        <v-icon
          icon="mdi-folder-account-outline"
          size="small"
          class="mr-2 text-blue-600"
        />
        Generador de Informes
      </h3>
      <v-text-field
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        label="Buscar cliente o proyecto..."
        variant="solo-filled"
        density="compact"
        flat
        hide-details
        class="search-modern"
        bg-color="white"
      />
    </div>

    <div class="flex-grow-1 overflow-y-auto custom-scrollbar bg-slate-50/30">
      <div
        v-if="loading"
        class="pa-8 d-flex flex-column align-center justify-center h-100"
      >
        <v-progress-circular
          indeterminate
          color="blue-600"
          size="32"
          width="3"
        />
        <div class="text-[10px] font-black mt-4 text-slate-400 uppercase tracking-widest">
          Cargando Estructura...
        </div>
      </div>
      <div
        v-else-if="filteredTree.length === 0"
        class="pa-8 text-center text-slate-400"
      >
        <v-icon
          icon="mdi-folder-search-outline"
          size="48"
          class="mb-3 opacity-50"
        />
        <div class="text-caption font-bold">
          No se encontraron resultados
        </div>
      </div>
      
      <v-expansion-panels
        v-else
        v-model="panelCliente"
        variant="accordion"
        class="modern-panels"
      >
        <v-expansion-panel
          v-for="cliente in filteredTree"
          :key="cliente.id_empresa"
          :value="cliente.id_empresa"
          elevation="0"
          class="border-b border-slate-100 bg-white"
        >
          <v-expansion-panel-title class="pa-3 text-slate-700 font-bold hover-bg-slate">
            <div class="d-flex align-center w-100 pr-2">
              <v-icon
                icon="mdi-domain"
                size="small"
                class="mr-3 text-slate-400"
              />
              <span class="text-caption text-truncate font-weight-black flex-grow-1">{{ cliente.name_empresa }}</span>
              <v-chip
                size="x-small"
                color="slate-100"
                class="text-slate-600 font-black px-2 shadow-sm rounded-md"
              >
                {{ cliente.proyectos.length }}
              </v-chip>
            </div>
          </v-expansion-panel-title>
          
          <v-expansion-panel-text class="pa-0 bg-slate-50/50">
            <v-expansion-panels
              v-model="cliente.panelProyecto"
              variant="accordion"
              class="modern-panels-inner"
            >
              <v-expansion-panel
                v-for="proy in cliente.proyectos"
                :key="proy.id_proyecto"
                :value="proy.id_proyecto"
                elevation="0"
                class="bg-transparent border-t border-slate-100"
              >
                <v-expansion-panel-title class="px-4 py-2 min-h-0 text-slate-600 hover-bg-white">
                  <div class="d-flex align-center w-100 pt-1 pb-1">
                    <div class="w-1.5 h-1.5 rounded-full bg-blue-400 mr-3" />
                    <span class="text-[11px] font-bold text-truncate leading-tight flex-grow-1">{{ proy.nombre_proyecto }}</span>
                  </div>
                </v-expansion-panel-title>
                
                <v-expansion-panel-text class="pa-0">
                  <div class="pl-8 pr-4 py-3 bg-white border-y border-slate-100 inner-shadow-sm">
                    <div
                      v-for="per in proy.periodos"
                      :key="per.periodo"
                      class="mb-5 last:mb-1"
                    >
                      <div class="d-flex align-center justify-space-between mb-2 border-b border-slate-100 pb-1">
                        <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">{{ per.periodo }}</span>
                      </div>
                      
                      <div class="d-flex flex-column ga-2">
                        <v-btn
                          block
                          size="small"
                          variant="tonal"
                          color="blue-darken-2"
                          class="text-none font-bold text-[11px] rounded-lg border border-transparent hover-border-blue animate-fade-in"
                          prepend-icon="mdi-chart-areaspline"
                          @click="emitSelectFile(cliente, proy, per, 'sst')"
                        >
                          <div class="d-flex align-center justify-space-between w-100">
                            <span class="truncate text-left">Informe Mensual SST</span>
                            <v-chip
                              size="x-small"
                              :color="getReportState(proy.id_proyecto, per.periodo, 'SST') === 'TERMINADO' ? 'grey-darken-1' : 'success'"
                              class="ml-2 font-black text-[9px] uppercase tracking-wider text-white px-2 shadow-sm rounded-md"
                              variant="flat"
                            >
                              <v-icon
                                start
                                :icon="getReportState(proy.id_proyecto, per.periodo, 'SST') === 'TERMINADO' ? 'mdi-lock' : 'mdi-lock-open-variant-outline'"
                                size="10"
                                class="mr-1"
                              />
                              {{ getReportState(proy.id_proyecto, per.periodo, 'SST') === 'TERMINADO' ? 'Cerrado' : 'Abierto' }}
                            </v-chip>
                          </div>
                        </v-btn>
                        <v-btn
                          block
                          size="small"
                          variant="tonal"
                          color="orange-darken-3"
                          class="text-none font-bold text-[11px] rounded-lg border border-transparent hover-border-orange animate-fade-in"
                          prepend-icon="mdi-shield-check"
                          @click="emitSelectFile(cliente, proy, per, 'audit')"
                        >
                          <div class="d-flex align-center justify-space-between w-100">
                            <span class="truncate text-left">Auditoría Legal SST</span>
                            <v-chip
                              size="x-small"
                              :color="getReportState(proy.id_proyecto, per.periodo, 'AUDITORIA') === 'TERMINADO' ? 'grey-darken-1' : 'success'"
                              class="ml-2 font-black text-[9px] uppercase tracking-wider text-white px-2 shadow-sm rounded-md"
                              variant="flat"
                            >
                              <v-icon
                                start
                                :icon="getReportState(proy.id_proyecto, per.periodo, 'AUDITORIA') === 'TERMINADO' ? 'mdi-lock' : 'mdi-lock-open-variant-outline'"
                                size="10"
                                class="mr-1"
                              />
                              {{ getReportState(proy.id_proyecto, per.periodo, 'AUDITORIA') === 'TERMINADO' ? 'Cerrado' : 'Abierto' }}
                            </v-chip>
                          </div>
                        </v-btn>
                      </div>
                    </div>
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import api from '@/services/api';

const search = ref('');
const loading = ref(false);
const treeData = ref([]);
const informesEstados = ref([]);

const panelCliente = ref(null);

const emit = defineEmits(['select']);

const getReportState = (id_proyecto, id_periodo, tipo_informe) => {
  if (!informesEstados.value) return 'borrador';
  const found = informesEstados.value.find(
    inf => Number(inf.id_proyecto) === Number(id_proyecto) &&
           String(inf.id_periodo).trim() === String(id_periodo).trim() &&
           inf.tipo_informe === tipo_informe
  );
  return found ? found.estado : 'borrador';
};

const fetchTreeData = async () => {
  loading.value = true;
  try {
    const [resEmpresas, resProyectos, resPeriodos] = await Promise.all([
      api.get('/servicio/leanglobal/obtenerEmpresas'),
      api.get('/servicio/leanglobal/obtenerProyectos'),
      api.get('/servicio/leanglobal/obtenerPeriodos')
    ]);

    let resEstados = { data: [] };
    try {
      resEstados = await api.get('/sst/informes-estados');
    } catch (e) {
      console.error("Error fetching report states:", e);
    }
    informesEstados.value = resEstados.data || [];

    const empresas = resEmpresas.data;
    const proyectos = resProyectos.data;
    const periodosRaw = resPeriodos.data; // [{ periodo: "Julio 2025", estado: "ABIERTO" }]

    // Ordenar periodos descendentemente (más reciente primero)
    const monthMap = {
      'Enero': 0, 'Febrero': 1, 'Marzo': 2, 'Abril': 3, 'Mayo': 4, 'Junio': 5,
      'Julio': 6, 'Agosto': 7, 'Septiembre': 8, 'Octubre': 9, 'Noviembre': 10, 'Diciembre': 11
    };

    const periodos = [...periodosRaw].sort((a, b) => {
      const partsA = a.periodo.split(' ');
      const partsB = b.periodo.split(' ');
      const dateA = new Date(parseInt(partsA[1]), monthMap[partsA[0]] || 0);
      const dateB = new Date(parseInt(partsB[1]), monthMap[partsB[0]] || 0);
      return dateB - dateA;
    });

    // Construir estructura anidada: Empresa -> Proyecto -> Periodos
    treeData.value = empresas.map(emp => {
      const proyEmpresa = proyectos.filter(p => p.id_empresa_cliente === emp.id_empresa);
      
      return {
        id_empresa: emp.id_empresa,
        name_empresa: emp.name_empresa,
        panelProyecto: null, // Control de expansión de proyectos
        proyectos: proyEmpresa.map(proy => {
          return {
            id_proyecto: proy.id_proyecto,
            nombre_proyecto: proy.nombre_proyecto,
            periodos: [...periodos],
            showCerrados: false
          };
        })
      };
    }).filter(emp => emp.proyectos.length > 0);
    
    // Todo inicia colapsado por defecto
    panelCliente.value = null;
    
  } catch (error) {
    console.error("Error cargando estructura:", error);
  } finally {
    loading.value = false;
  }
};

const handleStatusUpdate = () => {
  fetchTreeData();
};

onMounted(() => {
  fetchTreeData();
  window.addEventListener('report-status-updated', handleStatusUpdate);
});

onBeforeUnmount(() => {
  window.removeEventListener('report-status-updated', handleStatusUpdate);
});

const filteredTree = computed(() => {
  if (!search.value) return treeData.value;
  
  const searchLower = search.value.toLowerCase();
  
  return treeData.value.reduce((acc, emp) => {
    if (emp.name_empresa.toLowerCase().includes(searchLower)) {
      acc.push({ ...emp });
      return acc;
    }
    
    const filteredProyectos = emp.proyectos.filter(proy => 
      proy.nombre_proyecto.toLowerCase().includes(searchLower)
    );
    
    if (filteredProyectos.length > 0) {
      acc.push({ ...emp, proyectos: filteredProyectos });
    }
    
    return acc;
  }, []);
});

const emitSelectFile = (cliente, proyecto, periodo, type) => {
  const context = {
    id_empresa: cliente.id_empresa,
    nombre_empresa: cliente.name_empresa,
    id_proyecto: proyecto.id_proyecto,
    nombre_proyecto: proyecto.nombre_proyecto,
    id_periodo: periodo.periodo
  };

  const cleanPeriod = periodo.periodo.replace(/\s+/g, '-');

  if (type === 'sst') {
    emit('select', {
      id: `file-sst-${proyecto.id_proyecto}-${cleanPeriod}`,
      name: 'ESTADISTICA MENSUAL GESTION DE SEGURIDAD Y SALUD EN EL TRABAJO - TPI-PRR-INF-001',
      type: 'file',
      extension: 'pdf',
      context
    });
  } else {
    emit('select', {
      id: `file-aud-${proyecto.id_proyecto}-${cleanPeriod}`,
      name: 'AUDITORÍA DE CUMPLIMIENTO LEGAL SST - TPI-AUD-LGL-001',
      type: 'file',
      extension: 'pdf',
      context
    });
  }
};
</script>

<style scoped>
.modern-panels :deep(.v-expansion-panel-title__overlay) {
  opacity: 0 !important;
}
.modern-panels :deep(.v-expansion-panel-title:active .v-expansion-panel-title__overlay),
.modern-panels :deep(.v-expansion-panel-title:focus .v-expansion-panel-title__overlay) {
  opacity: 0 !important;
}

.hover-bg-slate:hover {
  background-color: #f8fafc !important;
}
.hover-bg-white:hover {
  background-color: #ffffff !important;
}

.inner-shadow-sm {
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.02);
}

.hover-border-blue:hover {
  border-color: #93c5fd !important;
}
.hover-border-orange:hover {
  border-color: #fdba74 !important;
}

.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.search-modern :deep(.v-field) {
  border-radius: 8px;
  font-size: 0.85rem;
  border: 1px solid #e2e8f0;
  box-shadow: none !important;
  background-color: white !important;
}
</style>
