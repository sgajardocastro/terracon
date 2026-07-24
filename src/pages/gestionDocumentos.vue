<template>
  <DashboardLayout>
    <div>
      <v-row
        class="mb-0"
        dense
      >
        <v-col cols="12">
          <v-card
            ref="mainCardRef"
            class="pt-2 d-flex flex-column"
            :style="{ height: `${mainCardHeight}px` }"
          >
            <v-tabs v-model="tab">
              <v-tab value="one">
                Vista Administrador
              </v-tab>
              <v-tab value="two">
                Firma de Documentos
              </v-tab>
              <v-row
                class="px-1 pt-1"
                dense
              >
                <v-col cols="auto">
                  <v-text-field
                    v-model="fechaDesdeSeleccionada"
                    label="Fecha Inicio Plan"
                    type="date"
                    density="compact"
                    variant="outlined"
                    hide-details
                    style="max-width: 180px"
                  />
                </v-col>
                <v-col cols="auto">
                  <v-text-field
                    v-model="fechaHastaSeleccionada"
                    label="Fecha Fin Plan"
                    type="date"
                    density="compact"
                    variant="outlined"
                    hide-details
                    style="max-width: 180px"
                  />
                </v-col>
                <v-col cols="auto">
                  <v-select
                    v-model="clienteSeleccionado"
                    :items="clientes"
                    item-title="name_empresa"
                    item-value="id_empresa"
                    label="Cliente"
                    density="compact"
                    variant="outlined"
                    style="width: 180px"
                    clearable
                  />
                </v-col>
                <v-col cols="auto">
                  <v-select
                    v-model="proyectoSeleccionado"
                    :items="proyectos"
                    item-title="nombre_proyecto"
                    item-value="id_proyecto"
                    label="Proyecto"
                    density="compact"
                    variant="outlined"
                    style="width: 180px"
                    clearable
                  />
                </v-col>
                <v-col cols="auto">
                  <v-btn @click="filtrar()">
                    Filtrar
                  </v-btn>
                </v-col>
                <v-col cols="auto">
                  <v-btn>Exportar</v-btn>
                </v-col>
              </v-row>
            </v-tabs>

            <v-card-text class="gestion-card-text">
              <v-tabs-window v-model="tab">
                <v-tabs-window-item value="one">
                  <v-row
                    dense
                    class="mb-1 mt-1 mx-0"
                  >
                    <v-col
                      cols="12"
                      class="d-flex flex-wrap align-center ga-2 filtros-estado-wrap px-2"
                    >
                      <span class="filtros-estado-title text-caption font-weight-medium mr-2">Estados visibles:</span>
                      <v-chip
                        :color="estadoAdminAll ? 'blue-darken-2' : 'grey-darken-1'"
                        :variant="estadoAdminAll ? 'flat' : 'outlined'"
                        size="x-small"
                        class="estado-chip"
                        @click="onToggleEstadoAll(!(estadoAdminAprobado && estadoAdminCreado && estadoAdminVerificacion && estadoAdminPendiente && estadoAdminRechazado))"
                      >
                        <v-icon
                          start
                          size="12"
                        >
                          {{ estadoAdminAll ? 'mdi-checkbox-marked' : 'mdi-checkbox-blank-outline' }}
                        </v-icon>
                        Todos
                      </v-chip>

                      <v-chip
                        :color="estadoAdminAprobado ? 'green-darken-2' : 'grey-darken-1'"
                        :variant="estadoAdminAprobado ? 'flat' : 'outlined'"
                        size="x-small"
                        class="estado-chip"
                        @click="estadoAdminAprobado = !estadoAdminAprobado"
                      >
                        <v-icon
                          start
                          size="12"
                        >
                          {{ estadoAdminAprobado ? 'mdi-checkbox-marked' : 'mdi-checkbox-blank-outline' }}
                        </v-icon>
                        Aprobado
                      </v-chip>

                      <v-chip
                        :color="estadoAdminCreado ? 'indigo-darken-2' : 'grey-darken-1'"
                        :variant="estadoAdminCreado ? 'flat' : 'outlined'"
                        size="x-small"
                        class="estado-chip"
                        @click="estadoAdminCreado = !estadoAdminCreado"
                      >
                        <v-icon
                          start
                          size="12"
                        >
                          {{ estadoAdminCreado ? 'mdi-checkbox-marked' : 'mdi-checkbox-blank-outline' }}
                        </v-icon>
                        Creado
                      </v-chip>

                      <v-chip
                        :color="estadoAdminVerificacion ? 'amber-darken-3' : 'grey-darken-1'"
                        :variant="estadoAdminVerificacion ? 'flat' : 'outlined'"
                        size="x-small"
                        class="estado-chip"
                        @click="estadoAdminVerificacion = !estadoAdminVerificacion"
                      >
                        <v-icon
                          start
                          size="12"
                        >
                          {{ estadoAdminVerificacion ? 'mdi-checkbox-marked' : 'mdi-checkbox-blank-outline' }}
                        </v-icon>
                        Verificacion
                      </v-chip>

                      <v-chip
                        :color="estadoAdminPendiente ? 'blue-darken-1' : 'grey-darken-1'"
                        :variant="estadoAdminPendiente ? 'flat' : 'outlined'"
                        size="x-small"
                        class="estado-chip"
                        @click="estadoAdminPendiente = !estadoAdminPendiente"
                      >
                        <v-icon
                          start
                          size="12"
                        >
                          {{ estadoAdminPendiente ? 'mdi-checkbox-marked' : 'mdi-checkbox-blank-outline' }}
                        </v-icon>
                        Pendiente
                      </v-chip>

                      <v-chip
                        :color="estadoAdminRechazado ? 'red-darken-2' : 'grey-darken-1'"
                        :variant="estadoAdminRechazado ? 'flat' : 'outlined'"
                        size="x-small"
                        class="estado-chip"
                        @click="estadoAdminRechazado = !estadoAdminRechazado"
                      >
                        <v-icon
                          start
                          size="12"
                        >
                          {{ estadoAdminRechazado ? 'mdi-checkbox-marked' : 'mdi-checkbox-blank-outline' }}
                        </v-icon>
                        Rechazado
                      </v-chip>
                    </v-col>
                  </v-row>

                  <div
                    ref="tablaAdminWrap"
                    class="tabla-admin-wrap"
                  >
                    <v-table
                      dense
                      fixed-header
                      :height="adminTableHeight"
                      class="parent-table compact-explorer-table text-caption"
                    >
                      <thead>
                        <tr class="bg-grey-lighten-4">
                          <th style="min-width: 250px;">
                            Nombre / Expediente
                          </th>
                          <th>Fecha de Generación</th>
                          <th>Registrado Por</th>
                          <th
                            class="text-center"
                            style="width: 130px;"
                          >
                            Estado de Gestión
                          </th>
                          <th
                            class="text-center"
                            style="width: 160px;"
                          >
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="row in treeRows"
                          :key="row.id"
                          :class="{
                            'bg-blue-grey-lighten-5 font-weight-bold text-blue-darken-4': row.type === 'proyecto',
                            'bg-blue-grey-lighten-5 font-weight-medium text-blue-darken-3': row.type === 'proyecto-child',
                            'bg-grey-lighten-4 font-weight-medium text-grey-darken-4': row.type === 'area',
                            'font-weight-medium text-grey-darken-3': row.type === 'family'
                          }"
                        >
                          <td class="py-1 text-left">
                            <span
                              class="d-inline-flex align-center"
                              :style="{ marginLeft: `${row.level * 16}px` }"
                            >
                              <!-- Toggle Button for folders -->
                              <v-btn
                                v-if="row.hasChildren"
                                icon
                                size="x-small"
                                variant="text"
                                class="mr-1"
                                style="margin-left: -8px; width: 20px; height: 20px;"
                                @click="toggleNode(row.id)"
                              >
                                <v-icon size="12">
                                  {{ row.expanded ? 'mdi-chevron-down' : 'mdi-chevron-right' }}
                                </v-icon>
                              </v-btn>
                              <!-- Spacer for leaves -->
                              <span
                                v-else
                                class="mr-4"
                              />

                              <!-- Icon -->
                              <v-icon
                                :color="getNodeIcon(row).color"
                                size="15"
                                class="mr-2"
                              >
                                {{ getNodeIcon(row).icon }}
                              </v-icon>

                              <span>{{ row.nombre }}</span>
                            </span>
                          </td>

                          <!-- Fecha de Generación -->
                          <td class="text-left py-1">
                            {{ row.type === 'file' ? fmtFecha(row.data.fecha_plan_fin) : (row.type === 'setup-file' ? row.date : '') }}
                          </td>

                          <!-- Registrado Por -->
                          <td class="text-left py-1">
                            {{ row.type === 'file' ? row.data.nombre_user : (row.type === 'setup-file' ? row.user : '') }}
                          </td>

                          <!-- Estado de Gestión -->
                          <td class="text-center py-1">
                            <v-chip
                              v-if="row.type === 'file'"
                              size="x-small"
                              variant="flat"
                              :color="getEstadoFlujoColor(row.data.estado_srv)"
                              class="text-white font-weight-bold"
                            >
                              {{ row.data.estado_srv }}
                            </v-chip>
                            <v-chip
                              v-else-if="row.type === 'setup-file'"
                              size="x-small"
                              variant="flat"
                              :color="row.statusColor"
                              class="text-white font-weight-bold"
                            >
                              {{ row.statusLabel }}
                            </v-chip>
                          </td>

                          <!-- Acciones -->
                          <td class="text-center py-1">
                            <div
                              v-if="row.type === 'file'"
                              class="d-flex justify-center ga-1 align-center"
                            >
                              <v-btn
                                size="x-small"
                                variant="flat"
                                color="blue-darken-3"
                                class="text-white text-x-small px-1"
                                style="height: 20px;"
                                prepend-icon="mdi-eye-outline"
                                @click="abrirSurveyModal(row.data.id_survey)"
                              >
                                Ver Doc
                              </v-btn>
                              <v-btn
                                v-if="tieneDocumento(row.data)"
                                size="x-small"
                                variant="text"
                                color="grey-darken-2"
                                icon="mdi-download"
                                style="width: 20px; height: 20px;"
                                :href="`${ARCHIVO_BASE_URL}/archivo/terracon/${resolverDocumentoFirmas(row.data)}`"
                                target="_blank"
                                title="Descargar PDF original firmado"
                              />
                            </div>
                            <div
                              v-else-if="row.type === 'setup-file'"
                              class="d-flex justify-center align-center"
                            >
                              <v-btn
                                v-if="row.href"
                                size="x-small"
                                variant="outlined"
                                color="success"
                                class="text-x-small px-1"
                                style="height: 20px;"
                                prepend-icon="mdi-download"
                                :href="row.href"
                                target="_blank"
                              >
                                Descargar
                              </v-btn>
                              <v-btn
                                v-else
                                size="x-small"
                                variant="outlined"
                                color="success"
                                class="text-x-small px-1"
                                style="height: 20px;"
                                prepend-icon="mdi-download"
                                @click="row.action()"
                              >
                                Descargar
                              </v-btn>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </v-table>
                  </div>
                </v-tabs-window-item>
                <v-tabs-window-item value="two">
                  <v-row
                    dense
                    style="padding: 10px;"
                  >
                    <v-col
                      v-for="survey in flujosDocumentos"
                      :key="survey.id_survey"
                      cols="12"
                      md="4"
                      xl="3"
                    >
                      <v-card
                        class="mx-auto sombra-resaltada"
                        :subtitle="`${survey.name_empresa_cliente} / ${survey.nombre_proyecto}`"
                        :title="`${survey.desc_template_srv}: ${survey.name_template_srv}`"
                      >
                        <template #append>
                          <v-icon
                            v-if="hasNotif(survey.id_survey)"
                            color="red-darken-2"
                            icon="mdi-bell-ring"
                            size="30"
                          />
                        </template>

                        <v-chip
                          :color="getEstadoColor(survey.estado_color).color"
                          label
                          size="large"
                          class="ml-2 text-white"
                          variant="flat"
                        >
                          {{ getEstadoColor(survey.estado_color).texto }}
                        </v-chip>

                        <v-card-text>
                          <div class="d-flex justify-space-between">
                            <!-- Texto izquierdo -->
                            <div>
                              {{ `${survey.name_area} - ${survey.name_tipo_srv}` }}<br>
                              {{ `${survey.codi_template_srv} (Id ${survey.id_survey})` }}<br>
                              Fecha Plan Fin: {{ survey.fecha_plan_ini }}
                            </div>

                            <!-- Acciones derecha: PDF arriba, FIRMAR abajo -->
                            <div class="d-flex flex-column align-end">
                              <!-- Botón PDF pequeño -->
                              <v-btn
                                icon
                                variant="text"
                                color="red-darken-2"
                                :disabled="!tieneDocumento(survey)"
                                @click="abrirPdf(survey)"
                              >
                                <v-icon>mdi-file-pdf-box</v-icon>
                              </v-btn>

                              <!-- Botón FIRMAR morado -->
                              <v-btn
                                color="deep-purple-accent-4"
                                variant="outlined"
                                size="small"
                                class="text-uppercase font-weight-bold"
                                @click="abrirModal(survey, notifPrimaryId(survey.id_survey))"
                              >
                                <v-icon start>
                                  mdi-pen
                                </v-icon>
                                {{ textoBotonFirmar(survey) }}
                              </v-btn>
                            </div>
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-tabs-window-item>
              </v-tabs-window>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <FirmaDialog
      v-model="dialogConfirmarTerminar"
      :pdf-url="pdfUrl"
      :detalle-flujo="detalleCrearFirma"
      :roles="roles"
      :motivos-rechazo="motivosRechazo"
      @firmado="filtrar"
    />
    <v-dialog
      v-model="dialogSurvey"
      max-width="1200"
      scrollable
    >
      <v-card style="height: 85vh;">
        <v-toolbar density="compact">
          <v-toolbar-title>Vista Protocolo</v-toolbar-title>
          <v-spacer />
          <v-btn
            icon
            variant="text"
            :disabled="!surveyModalUrl"
            @click="abrirSurveyNuevaPestana"
          >
            <v-icon>mdi-open-in-new</v-icon>
          </v-btn>
          <v-btn
            icon
            variant="text"
            @click="dialogSurvey = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text style="padding:0; height: calc(85vh - 48px);">
          <iframe
            v-if="surveyModalUrl"
            :src="surveyModalUrl"
            style="border:0; width:100%; height:100%;"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </DashboardLayout>
</template>

<script setup>
import DashboardLayout from '../layouts/dashboard.vue';
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import apiAxios from '@/services/api';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';

import { useUserDetailStore } from "@/stores/userDetail";
import DialogCambiarFES from '@/components/DialogCambiarFES.vue'
import FirmaDialog from '@/components/FirmaDialog.vue'

const userDetailStore = useUserDetailStore()

const tab = ref('one');
const mainCardRef = ref(null)
const mainCardHeight = ref(640)
const tablaAdminWrap = ref(null)
const adminTableHeight = ref(380)

const estadoAdminAll = ref(true)
const estadoAdminAprobado = ref(true)
const estadoAdminCreado = ref(true)
const estadoAdminVerificacion = ref(true)
const estadoAdminPendiente = ref(true)
const estadoAdminRechazado = ref(true)

const today = new Date();

const dialogCambiarFes = ref(false)

const abrirDialogFES = () => {
  dialogCambiarFes.value = true
}

const onFesCambiada = () => {
  console.log('✅ FES actualizada')
  // acá podrías recargar algo si es necesario
}

// 🔹 3 años antes (historial completo de documentos)
const fifteenDaysAgo = new Date(today);
fifteenDaysAgo.setFullYear(fifteenDaysAgo.getFullYear() - 3);

// 🔹 1 año después
const fifteenDaysLater = new Date(today);
fifteenDaysLater.setFullYear(fifteenDaysLater.getFullYear() + 1);

// 🔹 Convertir a YYYY-MM-DD
const isoFifteenDaysAgo = fifteenDaysAgo.toISOString().split('T')[0];
const isoFifteenDaysLater = fifteenDaysLater.toISOString().split('T')[0];

// 🔹 Inicializar refs
const fechaDesde = ref(isoFifteenDaysAgo);
const fechaDesdeSeleccionada = ref(isoFifteenDaysAgo);

const fechaHasta = ref(isoFifteenDaysLater);
const fechaHastaSeleccionada = ref(isoFifteenDaysLater);

const clientes = ref([]);
const cliente = ref(null);
const clienteSeleccionado = ref(null);
const proyectos = ref([]);
const proyecto = ref(null);
const proyectoSeleccionado = ref(null);
const flujos = ref([]);
const flujosDocumentos = ref([]);
const detalles = ref([]);
const informesEstadosSST = ref([]);

const loading = ref(false);
const error = ref(null);

const dialogConfirmarTerminar = ref(false);
const observaciones = ref('')
const decision = ref('APRUEBA')
const pdfUrl = ref('')
const motivosRechazo = ref([]);
const motivoRechazo = ref(null);
const detalleCrearFirma = ref(null);
const roles = ref([]);
const areas = ref([]);
const equiposProyectosMiembros = ref([]);
const equiposProyectosMiembrosFES = ref([]);

const loadingFirma = ref(false);

const passFes = ref('');

const jsonData = ref([]);

const dialogSurvey = ref(false)
const surveyModalUrl = ref('')
const expanded = ref([]);

const normalizeEstado = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toUpperCase()
    .trim()

const flujosAdminFiltrados = computed(() => {
  const base = Array.isArray(flujos.value) ? flujos.value : []
  return base.filter((f) => {
    const estado = normalizeEstado(f?.estado_srv)
    if (estadoAdminAprobado.value && estado === 'APROBADO') return true
    if (estadoAdminCreado.value && estado === 'CREADO') return true
    if (estadoAdminVerificacion.value && estado.includes('VERIFICACION')) return true
    if (estadoAdminPendiente.value && (estado === 'PENDIENTE' || estado === 'EN ESPERA' || estado === '')) return true
    if (estadoAdminRechazado.value && estado === 'RECHAZADO') return true
    return false
  })
})

// --- Tree Table (FileManager Tree) logic ---
const expandedNodes = ref(new Set())

function toggleNode(id) {
  if (expandedNodes.value.has(id)) {
    expandedNodes.value.delete(id)
  } else {
    expandedNodes.value.add(id)
  }
}

function getNodeIcon(row) {
  if (row.type === 'proyecto') {
    return { icon: 'mdi-domain', color: 'blue-darken-4' }
  }
  if (row.type === 'proyecto-child') {
    return { icon: 'mdi-briefcase-outline', color: 'blue-darken-2' }
  }
  if (row.type === 'area' || row.type === 'family') {
    const hasDocs = !row.isEmpty
    return {
      icon: row.expanded ? 'mdi-folder-open' : 'mdi-folder',
      color: hasDocs ? 'amber-darken-2' : 'grey-darken-1'
    }
  }
  if (row.type === 'file') {
    return { icon: 'mdi-file-pdf-box', color: 'red' }
  }
  if (row.type === 'setup-file') {
    const isPdf = String(row.nombre).toLowerCase().endsWith('.pdf')
    return {
      icon: isPdf ? 'mdi-file-pdf-box' : 'mdi-file-excel-box',
      color: isPdf ? 'red-darken-1' : 'green-darken-2'
    }
  }
  return { icon: 'mdi-file-outline', color: 'grey' }
}

function downloadRosterTemplate() {
  const data = [
    {
      'RUT': '12.345.678-9',
      'Nombre': 'Juan Pérez',
      'Correo': 'juan.perez@leanglobal.cl',
      'Roles': 'Supervisor'
    },
    {
      'RUT': '98.765.432-1',
      'Nombre': 'Ana María Silva',
      'Correo': 'ana.silva@leanglobal.cl',
      'Roles': 'Técnico / Operador'
    }
  ]
  const ws = XLSX.utils.json_to_sheet(data)
  ws['!cols'] = [{ wch: 15 }, { wch: 25 }, { wch: 30 }, { wch: 25 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Nómina')
  XLSX.writeFile(wb, 'plantilla_nomina_trabajadores.xlsx')
}

function downloadGanttTemplate() {
  const start = new Date()
  const offset = (8 - start.getDay()) % 7
  start.setDate(start.getDate() + offset)

  const excelDates = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    excelDates.push(d)
  }

  const rows = []
  rows.push(['', 'CONSOLA SETUP - PLANTILLA DE PLANIFICACIÓN GANTT'])
  rows.push(['', 'Complete los campos a partir de la fila 7. La fila 5 contiene las fechas diarias del plan.'])
  rows.push([])
  rows.push([])

  const row5 = ['', 'EDT', 'Partida', 'Actividad', 'Unidad', 'Cantidad Total', 'Recurso', '']
  excelDates.forEach(d => {
    row5.push(d)
  })
  rows.push(row5)
  rows.push([])

  const row7 = ['', '1.1', 'Obras Civiles', 'Excavación de Trazado', 'm3', 150, 'Cuadrilla Excavación A', '', 30, 30, 30, 30, 30, 0, 0]
  rows.push(row7)

  const ws = XLSX.utils.aoa_to_sheet(rows, { cellDates: true })
  ws['!cols'] = [{ wch: 3 }, { wch: 10 }, { wch: 25 }, { wch: 35 }, { wch: 10 }, { wch: 15 }, { wch: 25 }, { wch: 3 }]
  for (let i = 0; i < 7; i++) {
    ws['!cols'].push({ wch: 12 })
  }

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Planificacion')
  XLSX.writeFile(wb, 'plantilla_gantt_planificacion.xlsx')
}

const treeRows = computed(() => {
  const rows = []
  
  const baseFlujos = Array.isArray(flujosAdminFiltrados.value) ? flujosAdminFiltrados.value : []
  
  const projIdMap = {}
  const projClientMap = {}
  
  proyectos.value.forEach(p => {
    if (p.nombre_proyecto) {
      projIdMap[p.nombre_proyecto] = p.id_proyecto
      const clientObj = clientes.value.find(c => Number(c.id_empresa) === Number(p.id_empresa_cliente))
      projClientMap[p.nombre_proyecto] = clientObj ? clientObj.name_empresa : 'Otros Clientes'
    }
  })
  
  baseFlujos.forEach(f => {
    const projName = f.nombre_proyecto || 'Sin Proyecto'
    if (!projIdMap[projName]) {
      projIdMap[projName] = f.id_proyecto || 9999
    }
    if (!projClientMap[projName]) {
      projClientMap[projName] = f.name_empresa_cliente || 'Otros Clientes'
    }
  })

  const clientProjects = {}
  Object.keys(projIdMap).forEach(projName => {
    const clientName = projClientMap[projName] || 'Otros Clientes'
    if (!clientProjects[clientName]) {
      clientProjects[clientName] = []
    }
    clientProjects[clientName].push(projName)
  })

  const projectFlows = {}
  baseFlujos.forEach(flow => {
    const projName = flow.nombre_proyecto || 'Sin Proyecto'
    if (!projectFlows[projName]) {
      projectFlows[projName] = {}
      // Initialize keys for all real db areas
      areas.value.forEach(a => {
        projectFlows[projName][a.name_area] = {}
      })
      // Fallback keys
      const defaults = ['Calidad', 'Medio Ambiente', 'Seguridad', 'Avance']
      defaults.forEach(d => {
        if (!projectFlows[projName][d]) {
          projectFlows[projName][d] = {}
        }
      })
    }
    
    const templateIdVal = Number(flow.id_template_srv)
    const isReport = [102, 106, 144, 107, 180].includes(templateIdVal)

    if (isReport) {
      return // Skip: monthly reports are loaded dynamically from /sst/informes-estados instead
    }

    // Match exact area from database
    const matchingArea = areas.value.find(
      a => Number(a.id_area) === Number(flow.id_area) ||
           String(a.name_area).toLowerCase() === String(flow.name_area).toLowerCase()
    )
    const areaKey = matchingArea ? matchingArea.name_area : (flow.name_area || 'Calidad')
    
    const famName = flow.name_tipo_srv || 'Inspecciones Generales'
    if (!projectFlows[projName][areaKey][famName]) {
      projectFlows[projName][areaKey][famName] = []
    }
    projectFlows[projName][areaKey][famName].push(flow)
  })

  const sortedClients = Object.keys(clientProjects).sort((a, b) => a.localeCompare(b, 'es'))

  sortedClients.forEach(clientName => {
    const clientNodeId = `client-${clientName.replace(/\s+/g, '_')}`
    const isClientExpanded = expandedNodes.value.has(clientNodeId)
    
    rows.push({
      id: clientNodeId,
      nombre: clientName,
      type: 'proyecto',
      level: 0,
      expanded: isClientExpanded,
      hasChildren: true
    })
    
    if (isClientExpanded) {
      const projNames = clientProjects[clientName].sort((a, b) => a.localeCompare(b, 'es'))
      
      projNames.forEach(projName => {
        const projIdVal = projIdMap[projName]
        const projNodeId = `${clientNodeId}-proj-${projIdVal}`
        const isProjExpanded = expandedNodes.value.has(projNodeId)
        
        rows.push({
          id: projNodeId,
          nombre: projName,
          type: 'proyecto-child',
          level: 1,
          expanded: isProjExpanded,
          hasChildren: true
        })
        
        if (isProjExpanded) {
          let areasList = []
          if (areas.value && areas.value.length > 0) {
            const sorted = [...areas.value].sort((a, b) => Number(a.id_area || 0) - Number(b.id_area || 0))
            areasList = sorted.map(a => ({
              name: a.name_area,
              key: a.name_area,
              id_area: a.id_area
            }))
          } else {
            areasList = [
              { name: '01. Calidad (HSEC)', key: 'Calidad', id_area: 1 },
              { name: '02. Medio Ambiente (HSEC)', key: 'Medio Ambiente', id_area: 3 },
              { name: '03. Seguridad (SST)', key: 'Seguridad', id_area: 2 },
              { name: '04. Avance Operacional', key: 'Avance', id_area: 4 }
            ]
          }
          
          areasList.forEach((area) => {
            const areaNodeId = `${projNodeId}-area-${area.key}`
            const isAreaExpanded = expandedNodes.value.has(areaNodeId)
            
            const flowGroups = projectFlows[projName]?.[area.key] || {}
            const sstReports = informesEstadosSST.value.filter(
              inf => Number(inf.id_proyecto) === Number(projIdVal)
            )
            let hasFiles = false
            Object.keys(flowGroups).forEach(k => {
              if (flowGroups[k] && flowGroups[k].length > 0) hasFiles = true
            })
            if ((area.key === 'Seguridad' || Number(area.id_area) === 2) && sstReports.length > 0) {
              hasFiles = true
            }

            if (!hasFiles) {
              return
            }

            rows.push({
              id: areaNodeId,
              nombre: area.name,
              type: 'area',
              level: 2,
              expanded: isAreaExpanded,
              hasChildren: true,
              isEmpty: false
            })
            
            if (isAreaExpanded) {
              Object.keys(flowGroups).forEach(famName => {
                const famNodeId = `${areaNodeId}-fam-${famName}`
                const isFamExpanded = expandedNodes.value.has(famNodeId)
                
                rows.push({
                  id: famNodeId,
                  nombre: famName,
                  type: 'family',
                  level: 3,
                  expanded: isFamExpanded,
                  hasChildren: true,
                  isEmpty: false
                })
                
                if (isFamExpanded) {
                  const items = flowGroups[famName] || []
                  items.forEach(flow => {
                    const fileId = `${famNodeId}-file-${flow.id_survey}`
                    rows.push({
                      id: fileId,
                      nombre: `${flow.name_template_srv} (ID: ${flow.id_survey})`,
                      type: 'file',
                      level: 4,
                      hasChildren: false,
                      data: flow
                    })
                  })
                }
              })
              
              if (area.key === 'Seguridad' || Number(area.id_area) === 2) {
                const reportsForProject = informesEstadosSST.value.filter(
                  inf => Number(inf.id_proyecto) === Number(projIdVal)
                )
                
                if (reportsForProject.length > 0) {
                  const reportsFolderId = `${areaNodeId}-reports-folder`
                  const isReportsFolderExpanded = expandedNodes.value.has(reportsFolderId)
                  
                  rows.push({
                    id: reportsFolderId,
                    nombre: 'Informes de Auditoría y Reportes SST',
                    type: 'family',
                    level: 3,
                    expanded: isReportsFolderExpanded,
                    hasChildren: true,
                    isEmpty: false
                  })
                  
                  if (isReportsFolderExpanded) {
                    reportsForProject.forEach(rep => {
                      const fileId = `${reportsFolderId}-file-${rep.id_informe}`
                      
                      const displayName = rep.tipo_informe === 'SST'
                        ? `Informe Mensual SST - ${rep.id_periodo}.pdf`
                        : `Auditoría Legal SST - ${rep.id_periodo}.pdf`
                        
                      const pDate = rep.fecha_finalizacion || rep.updated_at || rep.created_at
                      const isTerminado = String(rep.estado).toUpperCase() === 'TERMINADO'
                      const statusLabel = isTerminado ? 'Cerrado' : 'Abierto / Borrador'
                      const statusColor = isTerminado ? 'grey-darken-1' : 'success'
                      
                      // Build download URL
                      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://servidor.leanglobal.cl'
                      const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
                      
                      let pdfPath = rep.url_pdf
                      if (!pdfPath) {
                        let djson = rep.data_json
                        if (typeof djson === 'string') {
                          try { djson = JSON.parse(djson) } catch(e) {}
                        }
                        if (djson && djson.url_pdf) {
                          pdfPath = djson.url_pdf
                        }
                      }
                      
                      if (!pdfPath) {
                        pdfPath = `/archivo/sst_informes/${rep.id_informe}.pdf`
                      }
                      
                      let cleanPath = pdfPath.startsWith('/') ? pdfPath : '/' + pdfPath
                      if (cleanPath.startsWith('/api/')) {
                        cleanPath = cleanPath.slice(4)
                      }
                      const downloadUrl = pdfPath.startsWith('http') ? pdfPath : cleanBase + cleanPath
                      
                      rows.push({
                        id: fileId,
                        nombre: displayName,
                        type: 'setup-file',
                        level: 4,
                        date: pDate ? fmtFecha(pDate) : 'Pendiente',
                        user: rep.usuario_responsable || 'Prevencionista',
                        statusColor: statusColor,
                        statusLabel: statusLabel,
                        href: isTerminado ? downloadUrl : null,
                        action: () => {
                          if (!isTerminado) {
                            alert('Este informe aún se encuentra en estado borrador y no tiene un PDF oficial generado en el servidor.')
                          }
                        }
                      })
                    })
                  }
                }
              }
            }
          })
        }
      })
    }
  })
  return rows
})

function onToggleEstadoAll (value) {
  const next = !!value
  estadoAdminAprobado.value = next
  estadoAdminCreado.value = next
  estadoAdminVerificacion.value = next
  estadoAdminPendiente.value = next
  estadoAdminRechazado.value = next
}

function updateAdminTableHeight () {
  if (!tablaAdminWrap.value) return
  const cardRect = mainCardRef.value?.$el?.getBoundingClientRect?.() ||
    mainCardRef.value?.getBoundingClientRect?.()
  const wrapRect = tablaAdminWrap.value.getBoundingClientRect()
  if (!cardRect) return
  const topInsideCard = wrapRect.top - cardRect.top
  const available = Math.floor(mainCardHeight.value - topInsideCard - 12)
  adminTableHeight.value = Math.max(240, available)
}

function updateMainCardHeight () {
  const cardEl = mainCardRef.value?.$el || mainCardRef.value
  if (!cardEl?.getBoundingClientRect) return
  const rect = cardEl.getBoundingClientRect()
  const available = Math.floor(window.innerHeight - rect.top - 10)
  mainCardHeight.value = Math.max(520, available)
}

// abre modal con la URL del print
function buildSurveyPrintUrl(idSurvey) {
  const appBasePath = import.meta.env.BASE_URL || '/'
  const appBaseUrl = new URL(appBasePath, window.location.origin)
  const url = new URL('verSurveyPrint', appBaseUrl)
  url.searchParams.set('idInspeccion', String(idSurvey))
  return url.toString()
}

function abrirSurveyModal(idSurvey) {
  if (!idSurvey) return

  surveyModalUrl.value = buildSurveyPrintUrl(idSurvey)

  console.log(buildSurveyPrintUrl(idSurvey))

  dialogSurvey.value = true
}

function abrirSurveyNuevaPestana() {
  if (!surveyModalUrl.value) return
  window.open(surveyModalUrl.value, '_blank', 'noopener,noreferrer')
}

onMounted(async () => {
  console.log('ARCHIVO_BASE_URL:', ARCHIVO_BASE_URL)
  const resp = await fetch(import.meta.env.BASE_URL + 'dataDocumentos.json');
  const data = await resp.json();
  jsonData.value = data;

  await obtenerClientes();
  await obtenerAreas();
  await obtenerProyectos();
  await obtenerFlujos();
  await obtenerMotivoRechazo();
  await obtenerRoles();
  await filtrar();
  await cargarNotificaciones();
  await obtenerEquiposProyectosMiembros();
  await obtenerEquiposProyectosMiembrosFES();
  await nextTick()
  updateMainCardHeight()
  updateAdminTableHeight()
  window.addEventListener('resize', updateMainCardHeight)
  window.addEventListener('resize', updateAdminTableHeight)
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateMainCardHeight)
  window.removeEventListener('resize', updateAdminTableHeight)
})

watch(tab, async (val) => {
  if (val === 'one') {
    await nextTick()
    updateMainCardHeight()
    updateAdminTableHeight()
  }
})

watch(
  [flujosAdminFiltrados, expanded],
  async () => {
    if (tab.value !== 'one') return
    await nextTick()
    updateAdminTableHeight()
  },
  { deep: true }
)

watch(
  [estadoAdminAprobado, estadoAdminCreado, estadoAdminVerificacion, estadoAdminPendiente, estadoAdminRechazado],
  ([a, c, v, p, r]) => {
    estadoAdminAll.value = a && c && v && p && r
  }
)

// Toma el nombre de documento desde el primer paso pendiente
function resolverDocumentoFirmas (detalle) {
  const step = detalle?.detalles?.[0] || null
  if (!step) return null

  return (
    step.name_doc_interno_in ||
    step.name_doc_interno_out ||
    null
  )
}

function tieneDocumento (detalle) {
  return !!resolverDocumentoFirmas(detalle)
}

function abrirPdf (detalle) {
  const docName = resolverDocumentoFirmas(detalle)
  if (!docName) {
    console.warn('⚠️ No hay documento asociado a este flujo:', detalle)
    return
  }

  const url = `${ARCHIVO_BASE_URL}/archivo/terracon/${docName}`
  console.log('📄 Abriendo PDF:', url)
  globalThis.open(url, '_blank')
}

const fmtFecha = (iso, tz = 'America/Santiago') => {
  if (!iso) return ''
  const d = new Date(iso) // acepta string/Date
  return new Intl.DateTimeFormat('es-CL', {
    timeZone: tz,
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  }).format(d)               // → "03-10-2025 13:18:55" (ejemplo)
}

const ARCHIVO_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://servidor.leanglobal.cl'

function getDetallePasoFirmante(detalle) {
  const detalles = Array.isArray(detalle?.detalles) ? detalle.detalles : []
  if (!detalles.length) return null

  const currentUserId = Number(userDetailStore.userDetail?.id_user)
  const isPending = (estado) => {
    const e = String(estado ?? '').toUpperCase()
    return e === '' || e === 'PENDIENTE' || e === 'EN ESPERA'
  }

  const pasoPendienteDelUsuario = detalles.find(
    (d) => Number(d?.id_user) === currentUserId && isPending(d?.estado)
  )
  if (pasoPendienteDelUsuario) return pasoPendienteDelUsuario

  const pasoDelUsuario = detalles.find(
    (d) => Number(d?.id_user) === currentUserId
  )
  if (pasoDelUsuario) return pasoDelUsuario

  return detalles[0] || null
}

function abrirModal(detalle, notifMeta) {
  console.log('Abrir modal:', notifMeta)

  // Por si notifMeta viene como objeto o como id directo
  const idNotificacion =
    typeof notifMeta === 'object' && notifMeta !== null
      ? (notifMeta.id_notifcation || notifMeta.id || notifMeta.id_notificacion)
      : notifMeta

  if (idNotificacion) {
    apiAxios
      .put('/notfqueue/updNotfqueue', {
        id_notifcation: idNotificacion,
        estado: 'DONE'
      })
      .then(response => {
        console.log('✅ Notificación Actualizada:', response.data)
      })
      .catch(error => {
        console.error('❌ Error al actualizar la notificación:', error)
      })
  } else {
    console.warn('⚠️ No se pudo determinar id_notifcation desde notifMeta:', notifMeta)
  }

  console.log('Abrir modal para detalle:', detalle)


  // 🔹 Sacamos el nombre del doc con seguridad
  const pasoFirmante = getDetallePasoFirmante(detalle)
  const docName = pasoFirmante?.name_doc_interno_in || null

  if (docName) {
    // 🔹 URL COMPLETA, no relativa
    pdfUrl.value = `${ARCHIVO_BASE_URL}/archivo/terracon/${docName}`
    console.log('PDF URL:', pdfUrl.value)
  } else {
    console.warn('⚠️ detalle.detalles[0].name_doc_interno_in viene vacío:', detalle)
    pdfUrl.value = null
  }
  dialogConfirmarTerminar.value = true
  detalleCrearFirma.value = detalle
  observaciones.value = ''
  decision.value = ''
  motivoRechazo.value = null
  passFes.value = ''
}

async function filtrar() {
  fechaDesde.value = fechaDesdeSeleccionada.value;
  fechaHasta.value = fechaHastaSeleccionada.value;
  cliente.value = clienteSeleccionado.value;
  proyecto.value = proyectoSeleccionado.value;
  await obtenerFlujos();
}

// Devuelve los nombres del equipo como string (si quieres seguir mostrando una lista)
const getEquipoNombres = (detalle) => {
  if (!detalle?.flag_equipo) return ''
  const teamId = detalle.id_user
  const miembros = equiposProyectosMiembros.value.filter(
    m => m.id_equipo_proyecto === teamId && m.id_proyecto === detalle.id_proyecto
  )
  return miembros.map(m => m.nombre_user).join(', ')
}

// Devuelve el arreglo de miembros para la tabla interna
const miembrosPorEquipo = (detalle) => {
  console.log(detalle);
  if (!detalle?.flag_equipo) return []
  const teamId = detalle.id_user
  return equiposProyectosMiembros.value.filter(
    m => m.id_equipo_proyecto === teamId && m.id_flow === detalle.id_flow
  )
}

const obtenerEquiposProyectosMiembros = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await apiAxios.get('/servicio/leanglobal/obtenerEquiposProyectosMiembrosFES');
    equiposProyectosMiembros.value = response.data;
    console.log(equiposProyectosMiembros.value)
  } catch (err) {
    error.value = 'Error al obtener equipos y proyectos: ' + err.message;
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const obtenerEquiposProyectosMiembrosFES = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await apiAxios.get('/servicio/leanglobal/obtenerEquiposProyectosMiembrosFES');
    equiposProyectosMiembrosFES.value = response.data;
    console.log(equiposProyectosMiembrosFES.value)
  } catch (err) {
    error.value = 'Error al obtener equipos y proyectos: ' + err.message;
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// Funciones para obtener datos desde API
const obtenerClientes = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await apiAxios.get('/servicio/leanglobal/obtenerEmpresas');
    clientes.value = response.data;
  } catch (err) {
    error.value = 'Error al obtener clientes: ' + err.message;
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const obtenerAreas = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await apiAxios.get('/servicio/leanglobal/obtenerAreas?id_empresa=2');
    areas.value = response.data || [];
  } catch (err) {
    error.value = 'Error al obtener áreas: ' + err.message;
    console.error(err);
  } finally {
    loading.value = false;
  }
};

watch(clienteSeleccionado, (nuevoCliente) => {
  if (nuevoCliente) {
    obtenerProyectos(nuevoCliente);
  } else {
    proyectoSeleccionado.value = null;
  }
});

const obtenerMotivoRechazo = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await apiAxios.get('/servicio/leanglobal/obtnerMotivosRechazo');
    motivosRechazo.value = response.data;
  } catch (err) {
    error.value = 'Error al obtener Motivos: ' + err.message;
    console.error(err);
  } finally {
    loading.value = false;
  }
};


const obtenerProyectos = async (id_cliente) => {
  loading.value = true;
  error.value = null;
  try {
    const response = await apiAxios.get('/servicio/leanglobal/obtenerProyectos?id_empresa_cliente=' + (id_cliente || ''));
    proyectos.value = response.data;
  } catch (err) {
    error.value = 'Error al obtener proyectos: ' + err.message;
    console.error(err);
  } finally {
    loading.value = false;
  }
};
const obtenerRoles = async (id_cliente) => {
  loading.value = true;
  error.value = null;
  try {
    const response = await apiAxios.get('/servicio/leanglobal/obtenerRoles');
    roles.value = response.data;
  } catch (err) {
    error.value = 'Error al obtener roles: ' + err.message;
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const obtenerFlujos = async () => {
  try {
    // 1️⃣ Obtener flujos con filtros de fecha, cliente y proyecto
    const responseFlujos = await apiAxios.get(
      `/servicio/leanglobal/flujosAprobacion` +
      `?fecha_desde=${fechaDesde.value}` +
      `&fecha_hasta=${fechaHasta.value}` +
      `&ts.id_empresa_cliente=${cliente.value || ''}` +
      `&ts.id_proyecto=${proyecto.value || ''}`
    );

    // 2️⃣ Obtener todos los detalles
    const responseDetalles = await apiAxios.get(
      `/servicio/leanglobal/flujosAprobacionSteps`
    );

    // 3️⃣ Obtener roles del usuario
    const responseUsuariosRoles = await apiAxios.get(
      `/servicio/leanglobal/obtenerUsuariosRoles`
    );

    // 4️⃣ Obtener estados de los informes SST
    let responseSstEstados = { data: [] };
    try {
      responseSstEstados = await apiAxios.get('/sst/informes-estados');
    } catch (e) {
      console.warn("Error fetching SST report states in document manager:", e);
    }
    informesEstadosSST.value = responseSstEstados.data || [];

    const flujosData = responseFlujos.data.datos || [];
    const detallesData = responseDetalles.data || [];

    console.log('✅ flujosData:', flujosData);
    console.log('✅ detallesData:', detallesData);

    if (!Array.isArray(detallesData)) {
      console.log('❌ No hay detalles válidos');
      return;
    }

    // 🔹 Roles del usuario actual (comparación robusta por tipo)
    const currentUserId = Number(userDetailStore.userDetail?.id_user)
    if (!Number.isFinite(currentUserId) || currentUserId <= 0) {
      flujosDocumentos.value = []
      return
    }

    const rolesUsuario = responseUsuariosRoles.data
      .filter(ur => String(ur.id_user) === String(currentUserId))
      .map(ur => Number(ur.id_rol))
      .filter(Number.isFinite);

    // 🔹 Mezclar detalles en cada flujo
    const flujosConDetalles = flujosData.map(flujo => ({
      ...flujo,
      detalles: detallesData.filter(det => det.id_flow === flujo.id_flow)
    }));

    // 🔹 Ordenar por id_survey descendente
    flujosConDetalles.sort((a, b) => Number(b.id_survey) - Number(a.id_survey));

    // ✅ flujos: todos los flujos con detalles
    flujos.value = flujosConDetalles;

    console.log('✅ flujosConDetalles:', flujosConDetalles);

    const isStepForCurrentUser = (det) => {
      // Paso de equipo: sigue visible para gestión colectiva
      if (det?.flag_equipo === true) return true
      // Si el paso no tiene usuario asignado aún, se considera disponible
      if (det?.id_user == null || det?.id_user === '') return true
      return Number(det.id_user) === currentUserId
    }

    const canCurrentUserSign = (det) => {
      const byEstado = det.estado === 'PENDIENTE'
      const idRol = Number(det?.id_rol)
      const byRol = rolesUsuario.includes(idRol) || idRol === 0
      const byUsuario = isStepForCurrentUser(det)
      return byEstado && byRol && byUsuario
    }

    const esSurveyTerminal = (flujo) => {
      const estado = String(flujo?.estado_srv ?? '').toUpperCase().trim()
      return estado === 'APROBADO' || estado === 'RECHAZADO'
    }

    const primerPasoPendiente = (flujo) => {
      const pasos = Array.isArray(flujo?.detalles) ? [...flujo.detalles] : []
      pasos.sort(
        (a, b) =>
          Number(a?.flow_tmpl_step_orden ?? Number.MAX_SAFE_INTEGER) -
          Number(b?.flow_tmpl_step_orden ?? Number.MAX_SAFE_INTEGER)
      )
      return pasos.find(det => String(det?.estado ?? '').toUpperCase().trim() === 'PENDIENTE') || null
    }

    // ✅ tab two:
    // 1) excluye estados terminales de survey
    // 2) considera solo el primer paso pendiente del flujo
    // 3) ese primer paso debe estar habilitado para el usuario logeado
    flujosDocumentos.value = flujosConDetalles
      .map(flujo => {
        const detallesFlujo = Array.isArray(flujo?.detalles)
          ? [...flujo.detalles].sort(
            (a, b) =>
              Number(a?.flow_tmpl_step_orden ?? Number.MAX_SAFE_INTEGER) -
              Number(b?.flow_tmpl_step_orden ?? Number.MAX_SAFE_INTEGER)
          )
          : []
        const primerPendiente = primerPasoPendiente({ ...flujo, detalles: detallesFlujo })
        return { flujo, primerPendiente, detallesFlujo }
      })
      .filter(x => !esSurveyTerminal(x.flujo))
      .filter(x => !!x.primerPendiente && canCurrentUserSign(x.primerPendiente))
      .map(x => ({
        ...x.flujo,
        detalles_flujo: x.detallesFlujo,
        detalles: [x.primerPendiente]
      }))

    // 🔹 También ordenar flujosDocumentos descendente
    flujosDocumentos.value.sort((a, b) => Number(b.id_survey) - Number(a.id_survey));

    console.log('✅ flujos:', flujos.value);
    console.log('✅ flujosDocumentos:', flujosDocumentos.value);
  } catch (error) {
    console.error('❌ Error al obtener flujos:', error);
  }
};

const notificaciones = ref([])

// Llama tu endpoint y normaliza
async function cargarNotificaciones() {
  const { data } = await apiAxios.get(
    `/servicio/leanglobal/obtenerNortificaciones?id_user_target=${userDetailStore.userDetail.id_user}`
  )
  notificaciones.value = Array.isArray(data) ? data : []
}
const notifSet = computed(() => {
  const s = new Set()
  for (const n of notificaciones.value) {
    const id = Number(n?.json_data?.id_survey)
    if (!Number.isNaN(id)) s.add(id)
  }
  return s
})

const hasNotif = (id) => notifSet.value.has(Number(id))

const notifBySurvey = computed(() => {
  const m = new Map()
  for (const n of notificaciones.value) {
    const sid = Number(n?.json_data?.id_survey)
    if (!Number.isNaN(sid)) {
      if (!m.has(sid)) m.set(sid, [])
      m.get(sid).push(n)
    }
  }
  return m
})

const hasIdNotif = (sid) => notifBySurvey.value.has(Number(sid))

const notifPrimaryId = (sid) => {
  const arr = notifBySurvey.value.get(Number(sid))
  return arr?.[0]?.id_notification ?? null
}

function resolverPasoActualFirma (detalle) {
  const detalles = Array.isArray(detalle?.detalles_flujo)
    ? detalle.detalles_flujo
    : (Array.isArray(detalle?.detalles) ? detalle.detalles : [])

  if (!detalles.length) return null

  const currentUserId = Number(userDetailStore.userDetail?.id_user)

  const pasoUsuario = detalles.find(det => {
    if (det?.flag_equipo) return false
    const stepUserId = Number(det?.id_user)
    return Number.isFinite(stepUserId) && stepUserId === currentUserId
  })
  if (pasoUsuario) return pasoUsuario

  const pasoEquipo = detalles.find(det => det?.flag_equipo === true)
  if (pasoEquipo) return pasoEquipo

  return detalles[0]
}

function esUltimoFirmanteUsuario (detalle) {
  const pasoActual = resolverPasoActualFirma(detalle)
  const detalles = Array.isArray(detalle?.detalles_flujo)
    ? detalle.detalles_flujo
    : (Array.isArray(detalle?.detalles) ? detalle.detalles : [])

  if (!pasoActual || !detalles.length) return false

  const stepUserId = Number(pasoActual?.id_user)
  const currentUserId = Number(userDetailStore.userDetail?.id_user)
  const isStepForCurrentUser =
    Number.isFinite(stepUserId) && stepUserId === currentUserId
  if (!isStepForCurrentUser) return false

  const ordenPasoActual = Number(pasoActual?.flow_tmpl_step_orden)
  if (!Number.isFinite(ordenPasoActual)) return false

  const ordenMaximo = Math.max(
    ...detalles.map(det => Number(det?.flow_tmpl_step_orden || 0))
  )

  return ordenPasoActual === ordenMaximo
}

function textoBotonFirmar (detalle) {
  return esUltimoFirmanteUsuario(detalle) ? 'Firmar (Último)' : 'Firmar'
}



function getEstadoColor(estado) {
  switch (estado) {
    case 'Azul':
      return {color: 'blue-darken-2', texto: 'A mas de un día según plan'};
    case 'Amarillo':
      return {color: 'amber-darken-2', texto: 'Vence en un día'};
    case 'Verde':
      return {color: 'green-darken-2', texto: 'Terminado'};
    case 'Rojo':
      return {color: 'red-darken-2', texto: 'Vencido según plan'};
    default:
      return {color: 'grey', texto: 'Desconocido'};
  }
}

function getEstadoFlujoColor (estado) {
  const e = normalizeEstado(estado)
  if (e === 'APROBADO') return 'green-darken-2'
  if (e === 'CREADO') return 'indigo-darken-2'
  if (e.includes('VERIFICACION')) return 'amber-darken-3'
  return 'grey-darken-1'
}

async function hashSHA256(texto) {
  const encoder = new TextEncoder();
  const data = encoder.encode(texto);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

const crearFirmaSurvey = async () => {

  const hash = await hashSHA256(passFes.value)
  const pasoFirmante = getDetallePasoFirmante(detalleCrearFirma.value)

  if (!pasoFirmante) {
    alert('No se encontró el paso de firma para el usuario actual.');
    return;
  }

  if (!decision.value) {
    alert('Debes seleccionar Aprueba o Rechaza.');
    console.error('❌ Debes seleccionar Aprueba o Rechaza.');
    return;
  }

  if (decision.value === 'RECHAZA' && !motivoRechazo.value) {
    alert('Debes seleccionar un motivo de rechazo.');
    console.error('❌ Debes seleccionar un motivo de rechazo.');
    return;
  }

  // ✅ Requerir pass_fes (ajústalo a tu regla de negocio)
  if (!hash || !hash.trim()) {
    alert('Debes ingresar tu clave FES.');
    console.error('❌ Debes ingresar tu clave FES.');
    return;
  }

  const filenameQr = uuidv4() + '.pdf';
  const dataApproval = {
    id_survey: detalleCrearFirma.value.id_survey,
    nuevaFirma: {
      firma:{
        nombre: userDetailStore.userDetail.name_frst + ' ' + userDetailStore.userDetail.name_sec + ' ' + userDetailStore.userDetail.apellido_pat + ' ' + userDetailStore.userDetail.apellido_mat,
        rut: userDetailStore.userDetail.rut,
        rol: roles.value.find(r => r.id_rol === pasoFirmante.id_rol)?.name_rol || null,
        fecha: null,
        metodo_autenticacion: "OPT",
        aprueba_rechaza: decision.value,
        observaciones: observaciones.value || 'Sin observaciones',
        id_user: userDetailStore.userDetail.id_user,
        ip_firma: 'DESCONOCIDA',
        user_agent: 'DESCONOCIDO',
        geo_latitude: -33.456,
        geo_longitude: -70.648,
        qrUrl: filenameQr,
      }
    }
  }

  console.log('✅ Datos para actualizar Approval Exec:', dataApproval);

  await apiAxios.post(
    '/signature/UpdApprovalExec',
    dataApproval
  )
  .then(response => {
    console.log('✅ Approval Exec Actualizado:', response.data);
    //dialogConfirmarTerminar.value = false;
    //filtrar();
  })
  .catch(error => {
    console.error('❌ Error al crear la firma:', error);
    alert(error?.response?.data?.error || 'Error desconocido');
  })
  .finally(() => {
    loadingFirma.value = false; // 🔴 Ocultar spinner
  });

  // Generar UUID para codigo_validacion
  //const codigoValidacion = uuidv4();

  // Construir el payload
  const hashPdfGenerado = "SHA256_1234567890ABCDEF";
  const codigoValidacion = uuidv4();
  console.log('✅ Datos para crear Crear Firma:',  userDetailStore.userDetail);
  const data = {
    origenPath: '/u05/LeanDocs/terracon/' + pasoFirmante.name_doc_interno_in,
    destinoFolder: '/u05/LeanDocs/terracon/',
    id_flow_stp: pasoFirmante.id_flow_stp,
    id_flow: detalleCrearFirma.value.id_flow,
    id_user: userDetailStore.userDetail.id_user,
    id_doc: pasoFirmante.id_doc_in,
    hash_pdf: hashPdfGenerado,
    codigo_validacion: codigoValidacion,
    observaciones: observaciones.value,
    aprueba_rechaza: decision.value,
    id_motivo_rechazo: motivoRechazo.value,
    text_motivo_rechazo: motivoRechazo.value ? motivosRechazo.value.find(m => m.id_motivo_rechazo === motivoRechazo.value).motivo_rechazo : null,
    geo_latitude: -33.456,
    geo_longitude: -70.648,
    metodo_autenticacion: "OTP",
    rol: pasoFirmante.id_rol || null,
    rol_nombre: roles.value.find(r => r.id_rol === pasoFirmante.id_rol)?.name_rol || null,
    rut: userDetailStore.userDetail.rut,
    nombre: userDetailStore.userDetail.name_frst + ' ' + userDetailStore.userDetail.name_sec + ' ' + userDetailStore.userDetail.apellido_pat + ' ' + userDetailStore.userDetail.apellido_mat,
    id_survey: detalleCrearFirma.value.id_survey,
    pass_fes: hash,
    filenameQr: filenameQr
  };

  console.log('✅ Datos para crear firma:', data);

  /*try {
    const response = await apiAxios.post(
      '/signature/',
      data
    );

    console.log('✅ Firma creada:', response.data);

  } catch (error) {
    console.error('❌ Error al crear la firma:', error);
  }*/

  loadingFirma.value = true; // 🔵 Mostrar spinner

  await apiAxios.post(
    '/signature/',
    data
  )
  .then(response => {
    console.log('✅ Firma creada:', response.data);
    dialogConfirmarTerminar.value = false;
    filtrar();
  })
  .catch(error => {
    console.error('❌ Error al crear la firma:', error);
    alert(error?.response?.data?.error || 'Error desconocido');
  })
  .finally(() => {
    loadingFirma.value = false; // 🔴 Ocultar spinner
  });

};























function toggleExpand(id) {
  if (expanded.value.includes(id)) {
    expanded.value = expanded.value.filter(e => e !== id);
  } else {
    expanded.value.push(id);
  }
}

function isExpanded(id) {
  return expanded.value.includes(id);
}

const protocolos = ref([
  {
    id_survey: 1,
    id_flow: 1001,
    cliente: 'Empresa A',
    estado: 'Activo',
    avance: 60,
    detalles: [
      { usuario: 'Juan', fechaFirma: '2024-06-01', documento: 'Doc1', estado: 'Ok', avance: 60 },
      { usuario: 'Pedro', fechaFirma: '2024-06-02', documento: 'Doc2', estado: 'Pend', avance: 30 }
    ]
  },
  {
    id_survey: 2,
    id_flow: 1002,
    cliente: 'Empresa B',
    estado: 'Pendiente',
    avance: 30,
    detalles: [
      { usuario: 'Ana', fechaFirma: '2024-06-05', documento: 'Doc3', estado: 'Ok', avance: 100 },
    ]
  }
]);
</script>

<style scoped>
.tabla-admin-wrap {
  width: 100%;
  overflow: hidden;
  min-height: 0;
}

.gestion-card-text {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

.gestion-card-text :deep(.v-window) {
  height: 100%;
}

.gestion-card-text :deep(.v-window__container) {
  height: 100%;
}

.gestion-card-text :deep(.v-window-item) {
  height: 100%;
}

.filtros-estado-wrap {
  padding: 4px 2px 8px 2px;
}

.filtros-estado-title {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  margin-right: 6px;
}

.estado-chip {
  font-weight: 600;
  letter-spacing: 0.2px;
}

.tabla-admin-wrap :deep(.v-table__wrapper) {
  min-height: 0;
}

.parent-table,
.child-table {
  width: 100%;
  border-collapse: collapse;
}

.parent-table th,
.parent-table td,
.child-table th,
.child-table td {
  padding: 4px;
  padding-left: 8px;
  text-align: left;
}

.expand-button-cell {
  text-align: center;
  width: 48px;
}

.expand-cell {
  padding: 0;
  background-color: #fafafa;
}

.child-table {
  margin: 0;
  width: 100%;
}

.child-table th {
  background-color: #f5f5f5;
}

.expand-wrapper {
  padding-left: 48px;
  width: 100%;
  box-sizing: border-box;
}

.bold-row td {
  font-weight: bold;
}

.compact-explorer-table th,
.compact-explorer-table td {
  padding: 4px 8px !important;
  height: 28px !important;
  font-size: 0.77rem !important;
  line-height: 1.2 !important;
}

.compact-explorer-table .v-btn {
  height: 20px !important;
  min-width: 20px !important;
}

.text-x-small {
  font-size: 0.65rem !important;
}
</style>
