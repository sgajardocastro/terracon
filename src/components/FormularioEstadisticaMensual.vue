<template>
  <div class="formulario-moderno d-flex flex-column bg-slate-50 overflow-hidden">
    <!-- Contenedor para Impresión (Sólo visible en PDF) -->
    <div
      id="print-area"
      class="d-none d-print-block print-view"
    >
      <!-- Cabecera Premium -->
      <div class="pdf-header">
        <div class="header-logo">
          <img
            :src="logoTerracon"
            alt="Terracon"
            class="logo-img"
          >
        </div>
        <div class="header-titles">
          <div class="main-title">
            ESTADÍSTICA MENSUAL
          </div>
          <div class="sub-title">
            GESTIÓN DE SEGURIDAD Y SALUD EN EL TRABAJO
          </div>
        </div>
        <div class="header-meta">
          <div class="meta-row border-b">
            <span class="meta-label">Versión:</span>
            <span class="meta-value">Rev.2 marzo 2025</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Código:</span>
            <span class="meta-value">TPI-PRR-INF-001</span>
          </div>
        </div>
      </div>
      
      <!-- Sub-cabecera con detalles -->
      <div class="pdf-subheader">
        <div class="subheader-box border-r">
          <div class="sh-label">
            Norma Aplicable
          </div>
          <div class="sh-value font-bold">
            NCH ISO 9001:14001;45001
          </div>
        </div>
        <div class="subheader-box border-r">
          <div class="sh-label">
            Gerencia
          </div>
          <div class="sh-value font-bold">
            Gerencia de Operaciones
          </div>
        </div>
        <div class="subheader-box">
          <div class="sh-label">
            Departamento
          </div>
          <div class="sh-value font-bold">
            Prevención de Riesgos y Medio Ambiente
          </div>
        </div>
      </div>

      <!-- Aquí iría el contenido dinámico del reporte clonado o referenciado -->
      <!-- Contenido de Datos -->
      <div class="pdf-content">
        <!-- SECCIÓN 1: ANTECEDENTES -->
        <div class="pdf-section-title">
          1. ANTECEDENTES GENERALES
        </div>
        <div class="pdf-grid-4">
          <div class="grid-item">
            <span class="grid-label">Proyecto</span>
            <span class="grid-value">{{ proyectoEjecucion }}</span>
          </div>
          <div class="grid-item">
            <span class="grid-label">Periodo</span>
            <span class="grid-value">{{ periodoEvaluado }}</span>
          </div>
          <div class="grid-item">
            <span class="grid-label">Administrador</span>
            <span class="grid-value">{{ administrador }}</span>
          </div>
          <div class="grid-item">
            <span class="grid-label">Experto Asesor</span>
            <span class="grid-value">{{ expertoAsesor }}</span>
          </div>
        </div>

        <div class="pdf-grid-4 mt-2">
          <div class="grid-item">
            <span class="grid-label">HH Mes</span>
            <span class="grid-value font-bold">{{ horasHombrePeriodo }}</span>
          </div>
          <div class="grid-item">
            <span class="grid-label">IF Periodo</span>
            <span class="grid-value">{{ indicesObra[0].value }}</span>
          </div>
          <div class="grid-item">
            <span class="grid-label">IG Periodo</span>
            <span class="grid-value">{{ indicesObra[1].value }}</span>
          </div>
          <div class="grid-item">
            <span class="grid-label">Tasa Acc.</span>
            <span class="grid-value">{{ indicesObra[2].value }}</span>
          </div>
        </div>

        <!-- SECCIÓN 2: MÉTRICAS -->
        <div class="pdf-section-title mt-4">
          2. MÉTRICAS DE CUMPLIMIENTO
        </div>
        <table class="pdf-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Cargo</th>
              <th>Evaluación</th>
              <th>Promedio</th>
              <th>% Cumpl.</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="m in metricasCumplimiento"
              :key="m.nombre"
            >
              <td>{{ m.nombre }}</td>
              <td>{{ m.cargo }}</td>
              <td>{{ m.evaluacion }}</td>
              <td>{{ m.promedio }}</td>
              <td>{{ m.cumplimiento }}</td>
            </tr>
          </tbody>
        </table>

        <!-- SECCIÓN 2.1: MÉTRICA ACCIDENTABILIDAD (NUEVA) -->
        <div class="pdf-section-title mt-4">
          2.1 MÉTRICA ACCIDENTABILIDAD DEL PERIODO
        </div>
        <table class="pdf-table">
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Jefatura</th>
              <th class="text-center">
                Días Acum.
              </th>
              <th class="text-center">
                Días Mes
              </th>
              <th class="text-center">
                Total Días
              </th>
              <th class="text-center">
                % Cumpl.
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="m in metricasAccidentabilidad"
              :key="m.descripcion"
            >
              <td>{{ m.descripcion }}</td>
              <td>{{ m.jefatura }}</td>
              <td class="text-center">
                {{ m.diasAcum }}
              </td>
              <td class="text-center">
                {{ m.diasPeriodo }}
              </td>
              <td class="text-center font-bold">
                {{ m.total }}
              </td>
              <td class="text-center">
                {{ m.cumplimiento }}%
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="bg-gray-100 font-bold">
              <td
                colspan="4"
                class="text-right"
              >
                Total Días Perdidos (Asignación bono)
              </td>
              <td class="text-center">
                {{ totalMetricaAccidentabilidad.dias }}
              </td>
              <td class="text-center">
                {{ totalMetricaAccidentabilidad.cumplimiento }}%
              </td>
            </tr>
          </tfoot>
        </table>

        <!-- SECCIÓN 3: CAPACITACIONES -->
        <div class="pdf-section-title mt-4">
          3. CAPACITACIONES DEL PERIODO
        </div>
        <table class="pdf-table">
          <thead>
            <tr>
              <th>Nombre Capacitación</th>
              <th>Grupo</th>
              <th>Horas</th>
              <th>N° Trab.</th>
              <th>Total HH</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="c in capacitaciones"
              :key="c.nombre"
            >
              <td>{{ c.nombre }}</td>
              <td>{{ c.grupo }}</td>
              <td class="text-center">
                {{ c.horas }}
              </td>
              <td class="text-center">
                {{ c.trabajadores }}
              </td>
              <td class="text-center font-bold">
                {{ (c.horas * c.trabajadores).toFixed(1) }}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="bg-gray-100 font-bold">
              <td
                colspan="4"
                class="text-right"
              >
                Total HH Capacitadas
              </td>
              <td class="text-center">
                {{ totalHHCapacitacion }}
              </td>
            </tr>
          </tfoot>
        </table>

        <!-- SECCIÓN 4: PROTOCOLOS MINSAL -->
        <div class="pdf-section-title mt-4">
          4. SEGUIMIENTO PROTOCOLOS MINSAL
        </div>
        <table class="pdf-table">
          <thead>
            <tr>
              <th>Protocolo</th>
              <th>Aplica</th>
              <th>Estado</th>
              <th>Prog.</th>
              <th>Real</th>
              <th>% Cumpl.</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="p in protocolosMinsal"
              :key="p.nombre"
            >
              <td>{{ p.nombre }}</td>
              <td class="text-center">
                {{ p.aplica }}
              </td>
              <td class="text-center">
                {{ p.cronograma }}
              </td>
              <td class="text-center">
                {{ p.programado }}
              </td>
              <td class="text-center">
                {{ p.real }}
              </td>
              <td class="text-center font-bold">
                {{ calculateCumplimientoProtocolo(p) }}%
              </td>
            </tr>
          </tbody>
        </table>

        <!-- SECCIÓN 5: ACCIDENTABILIDAD Y CONTRATISTAS -->
        <div class="pdf-row mt-4">
          <div class="pdf-col">
            <div class="pdf-section-title">
              5. AUDITORÍAS MANDANTE
            </div>
            <table class="pdf-table">
              <thead>
                <tr>
                  <th>Auditoría</th>
                  <th>Estándar</th>
                  <th>Cumpl.</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="a in auditoriasMandante"
                  :key="a.nombre"
                >
                  <td>{{ a.nombre }}</td>
                  <td class="text-center">
                    {{ a.estandar }}%
                  </td>
                  <td class="text-center font-bold">
                    {{ a.cumplimiento }}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="pdf-col ml-4">
            <div class="pdf-section-title">
              6. EMPRESAS CONTRATISTAS
            </div>
            <table class="pdf-table">
              <tbody>
                <tr
                  v-for="item in empresasContratistasTable"
                  :key="item.label"
                >
                  <td class="text-xs font-bold">
                    {{ item.label }}
                  </td>
                  <td class="text-right font-bold">
                    {{ item.value }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- SECCIÓN 7: NOMINA DE INCIDENTES -->
        <div class="pdf-section-title mt-4">
          7. NÓMINA DE INCIDENTES Y SUCESOS PELIGROSOS
        </div>
        <div v-if="nominaIncidentes.length > 0">
          <table class="pdf-table">
            <thead>
              <tr>
                <th style="width: 10%">
                  Fecha
                </th>
                <th style="width: 25%">
                  Nombre / Empresa
                </th>
                <th style="width: 30%">
                  Descripción
                </th>
                <th style="width: 35%">
                  Causa / Medidas
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="inc in nominaIncidentes"
                :key="inc.id_incidente"
              >
                <td class="text-xs">
                  {{ displayDate(inc.fecha) }}
                </td>
                <td class="text-xs">
                  <strong>{{ inc.nombre }}</strong><br>{{ inc.empresa }}
                </td>
                <td class="text-xs">
                  {{ inc.descripcion }}
                </td>
                <td class="text-xs">
                  <strong>Causa:</strong> {{ inc.causa }}<br><strong>Medidas:</strong> {{ inc.medidas }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div
          v-else
          class="text-xs italic pa-2 border mb-4"
        >
          No se registran incidentes en el periodo.
        </div>

        <!-- FIRMAS -->
        <div class="pdf-signatures mt-12">
          <div class="signature-box">
            <div class="sig-line" />
            <div class="sig-name">
              {{ expertoAsesor }}
            </div>
            <div class="sig-role">
              Experto en Prevención de Riesgos
            </div>
          </div>
          <div class="signature-box">
            <div class="sig-line" />
            <div class="sig-name">
              {{ administrador }}
            </div>
            <div class="sig-role">
              Administrador de Contrato
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Header Refinado Premium (Homologado con Auditoría Legal) -->
    <v-sheet
      class="pa-0 header-gradient shadow-md flex-shrink-0"
      elevation="2"
    >
      <div class="pa-2 px-6 d-flex align-center">
        <v-btn
          icon="mdi-arrow-left"
          variant="text"
          color="white"
          density="compact"
          class="mr-3"
          @click="$emit('close')"
        />
        <v-icon
          icon="mdi-file-chart-check"
          color="white"
          size="24"
          class="mr-4"
        />
        <div class="flex-grow-1">
          <h2 class="text-subtitle-2 font-weight-black text-white letter-spacing-tight uppercase">
            ESTADÍSTICA MENSUAL SST - GESTIÓN DE SEGURIDAD Y SALUD 2026
          </h2>
        </div>

        <div class="d-flex align-center ga-3 text-white">
          <v-chip
            v-if="isReadOnly"
            color="orange-darken-3"
            class="px-6 font-weight-black"
            prepend-icon="mdi-lock-outline"
            variant="elevated"
          >
            FINALIZADO - SOLO LECTURA
          </v-chip>

          <v-btn
            color="red-darken-3"
            variant="elevated"
            prepend-icon="mdi-file-pdf-box"
            size="small"
            class="text-none font-weight-bold text-white rounded-lg px-4 shadow-sm"
            :disabled="!urlStoredPdf"
            @click="openStoredPdf"
          >
            Ver PDF
          </v-btn>

          <v-btn
            v-if="!isReadOnly"
            color="orange-darken-3"
            variant="elevated"
            prepend-icon="mdi-shield-check"
            size="small"
            class="text-none font-weight-bold text-white rounded-lg px-4 shadow-sm"
            :loading="loading"
            @click="abrirDialogFesSST"
          >
            Generar Informe
          </v-btn>

          <v-btn
            v-else
            color="blue-darken-3"
            variant="elevated"
            prepend-icon="mdi-lock-open-outline"
            size="small"
            class="text-none font-weight-bold text-white rounded-lg px-4 shadow-sm"
            :loading="loading"
            @click="reabrirInforme"
          >
            Abrir para Editar
          </v-btn>

          <v-btn
            v-if="!isReadOnly"
            color="white"
            variant="elevated"
            prepend-icon="mdi-content-save"
            size="small"
            class="text-none font-weight-bold text-slate-800 rounded-lg px-4 shadow-sm"
            :loading="loading"
            @click="saveFullReport"
          >
            Guardar
          </v-btn>
        </div>
      </div>

      <v-tabs
        v-model="formTab"
        class="px-6"
        bg-color="transparent"
        color="white"
        density="compact"
        hide-slider
        height="32"
      >
        <v-tab
          value="dash"
          class="tab-modern mr-2"
        >
          <v-icon
            start
            size="14"
          >
            mdi-chart-bar
          </v-icon> Resumen Ejecutivo
        </v-tab>
        <v-tab
          value="one"
          class="tab-modern mr-2"
        >
          <v-icon
            start
            size="14"
          >
            mdi-information-outline
          </v-icon> Informe Detallado
        </v-tab>
        <v-tab
          value="four"
          class="tab-modern mr-2"
        >
          <v-icon
            start
            size="14"
          >
            mdi-card-text-outline
          </v-icon> Accidentabilidad
        </v-tab>
        <v-tab
          value="three"
          class="tab-modern"
        >
          <v-icon
            start
            size="14"
          >
            mdi-shield-search
          </v-icon> Incidentes
        </v-tab>
      </v-tabs>
    </v-sheet>

    <div class="flex-grow-1 overflow-y-auto custom-scrollbar content-scroller">
      <v-form :disabled="isReadOnly">
        <v-tabs-window v-model="formTab">
          <!-- TAB 0: RESUMEN EJECUTIVO (Dashboard V2) -->
          <v-tabs-window-item value="dash">
            <div class="max-w-[1400px] mx-auto pa-6">
              <v-row>
                <!-- Info General y Periodo -->
                <v-col
                  cols="12"
                  md="8"
                >
                  <v-card
                    class="rounded-xl border-soft bg-white mb-6 overflow-hidden"
                    elevation="4"
                  >
                    <div class="pa-6">
                      <div class="d-flex align-center mb-6">
                        <div class="bg-blue-600 rounded-lg pa-2 mr-4">
                          <v-icon
                            icon="mdi-office-building-cog"
                            color="white"
                          />
                        </div>
                        <div>
                          <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            PROYECTO EN EJECUCIÓN
                          </div>
                          <div class="text-h6 font-black text-slate-900 leading-tight uppercase">
                            {{ proyectoEjecucion }}
                          </div>
                        </div>
                        <v-spacer />
                        <div class="text-right">
                          <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            PERIODO EVALUADO
                          </div>
                          <div class="text-h6 font-black text-orange-600 leading-tight">
                            {{ periodoEvaluado }}
                          </div>
                        </div>
                      </div>
                      
                      <v-row dense>
                        <v-col
                          cols="12"
                          md="3"
                        >
                          <div class="pa-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                            <v-icon
                              icon="mdi-account-hard-hat-outline"
                              color="slate-400"
                              size="20"
                              class="mb-1"
                            />
                            <div class="text-[9px] font-black text-slate-400 uppercase">
                              ADMINISTRADOR
                            </div>
                            <div class="text-[11px] font-bold text-slate-700 truncate">
                              {{ administrador }}
                            </div>
                          </div>
                        </v-col>
                        <v-col
                          cols="12"
                          md="3"
                        >
                          <div class="pa-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                            <v-icon
                              icon="mdi-shield-account-outline"
                              color="slate-400"
                              size="20"
                              class="mb-1"
                            />
                            <div class="text-[9px] font-black text-slate-400 uppercase">
                              EXPERTO ASESOR
                            </div>
                            <div class="text-[11px] font-bold text-slate-700 truncate">
                              {{ expertoAsesor }}
                            </div>
                          </div>
                        </v-col>
                        <v-col
                          cols="12"
                          md="3"
                        >
                          <div class="pa-4 rounded-xl bg-orange-50 border border-orange-100 text-center">
                            <v-icon
                              icon="mdi-clock-fast"
                              color="orange-600"
                              size="20"
                              class="mb-1"
                            />
                            <div class="text-[9px] font-black text-orange-400 uppercase">
                              HH PERIODO
                            </div>
                            <div class="text-[11px] font-black text-orange-700">
                              {{ horasHombrePeriodo.toLocaleString() }}
                            </div>
                          </div>
                        </v-col>
                        <v-col
                          cols="12"
                          md="3"
                        >
                          <div class="pa-4 rounded-xl bg-blue-50 border border-blue-100 text-center">
                            <v-icon
                              icon="mdi-account-group-outline"
                              color="blue-600"
                              size="20"
                              class="mb-1"
                            />
                            <div class="text-[9px] font-black text-blue-400 uppercase">
                              PROM. TRAB.
                            </div>
                            <div class="text-[11px] font-black text-blue-700">
                              {{ promedioTrabajadoresDia }}
                            </div>
                          </div>
                        </v-col>
                      </v-row>
                    </div>
                  </v-card>
                </v-col>

                <!-- Card Sanción / Riesgo Potencial (Placeholder Estético) -->
                <v-col
                  cols="12"
                  md="4"
                >
                  <v-card
                    class="rounded-xl overflow-hidden h-100 shadow-lg"
                    elevation="4"
                    style="background-color: #0f172a; color: white;"
                  >
                    <v-card-text class="pa-6 d-flex flex-column justify-center align-center h-100 text-center">
                      <div class="text-overline font-black text-orange-400 tracking-widest mb-4">
                        ESTADO GENERAL SST
                      </div>
                      <div class="rounded-full border-4 border-white/10 pa-6 mb-4">
                        <v-progress-circular
                          :model-value="totalMetricaAccidentabilidad.cumplimiento"
                          :size="100"
                          :width="10"
                          color="orange-accent-2"
                        >
                          <span class="text-h5 font-black">{{ totalMetricaAccidentabilidad.cumplimiento }}%</span>
                        </v-progress-circular>
                      </div>
                      <div class="text-caption font-bold text-white/60 mb-1 uppercase">
                        CUMPLIMIENTO BONO OBRA
                      </div>
                      <div class="text-h6 font-black italic">
                        {{ totalMetricaAccidentabilidad.dias }} DÍAS PERDIDOS
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>

                <!-- Índices Críticos -->
                <v-col
                  v-for="(indice, idx) in indicesObra"
                  :key="idx"
                  cols="12"
                  md="4"
                >
                  <v-card
                    class="rounded-xl border-soft bg-white pa-5 text-center transition-all hover:scale-[1.02]"
                    elevation="2"
                  >
                    <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      {{ indice.label }}
                    </div>
                    <div class="text-h4 font-black text-slate-900 border-b-2 border-slate-100 pb-2 mb-2 italic">
                      {{ indice.value }}
                    </div>
                    <div class="d-flex align-center justify-center ga-2">
                      <v-icon
                        :icon="parseFloat(indice.value) === 0 ? 'mdi-check-circle' : 'mdi-alert-circle'"
                        :color="parseFloat(indice.value) === 0 ? 'green-darken-1' : 'red-darken-1'"
                        size="16"
                      />
                      <span class="text-[10px] font-bold text-slate-500">{{ parseFloat(indice.value) === 0 ? 'ESTADO ÓPTIMO' : 'ALERTA DE SEGURIDAD' }}</span>
                    </div>
                  </v-card>
                </v-col>

                <!-- KPIs Secundarios -->
                <v-col
                  cols="12"
                  md="3"
                >
                  <v-card
                    class="rounded-xl bg-header-dark text-white pa-6"
                    elevation="4"
                  >
                    <div class="d-flex align-center ga-3 mb-4">
                      <v-icon
                        icon="mdi-school"
                        color="orange-accent-2"
                        size="24"
                      />
                      <span class="text-[10px] font-black uppercase tracking-wider">CAPACITACIONES</span>
                    </div>
                    <div class="text-h5 font-black mb-1">
                      {{ totalHHCapacitacion }} HH
                    </div>
                    <div class="text-caption font-bold text-slate-400">
                      TOTAL HH CAPACITADAS EN PERIODO
                    </div>
                  </v-card>
                </v-col>

                <v-col
                  cols="12"
                  md="3"
                >
                  <v-card
                    class="rounded-xl bg-white border-soft pa-6"
                    elevation="2"
                  >
                    <div class="d-flex align-center ga-3 mb-4">
                      <v-icon
                        icon="mdi-bullhorn"
                        color="blue-600"
                        size="24"
                      />
                      <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider">CAMPAÑAS</span>
                    </div>
                    <div class="text-h5 font-black text-slate-900 mb-1">
                      {{ campanasSST.length }} ACTIVAS
                    </div>
                    <div class="text-caption font-bold text-slate-500">
                      CAMPAÑAS SST EN CURSO
                    </div>
                  </v-card>
                </v-col>

                <v-col
                  cols="12"
                  md="3"
                >
                  <v-card
                    class="rounded-xl bg-white border-soft pa-6"
                    elevation="2"
                  >
                    <div class="d-flex align-center ga-3 mb-4">
                      <v-icon
                        icon="mdi-shield-alert"
                        color="red-600"
                        size="24"
                      />
                      <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider">INCIDENTES</span>
                    </div>
                    <div class="text-h5 font-black text-slate-900 mb-1">
                      {{ totalIncidentes }} REGISTROS
                    </div>
                    <div class="text-caption font-bold text-slate-500">
                      EVENTOS REPORTADOS EN EL MES
                    </div>
                  </v-card>
                </v-col>

                <v-col
                  cols="12"
                  md="3"
                >
                  <v-card
                    class="rounded-xl bg-white border-soft pa-6"
                    elevation="2"
                  >
                    <div class="d-flex align-center ga-3 mb-4">
                      <v-icon
                        icon="mdi-truck-check"
                        color="green-600"
                        size="24"
                      />
                      <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider">CONTRATISTAS</span>
                    </div>
                    <div class="text-h5 font-black text-slate-900 mb-1">
                      {{ contratistasData.totalEmpresas }} EMPRESAS
                    </div>
                    <div class="text-caption font-bold text-slate-500">
                      GESTIÓN DE SUBCONTRATACIÓN
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </v-tabs-window-item>

          <!-- TAB 1: INFORME COMPLETO (Estructura Detallada) -->
          <v-tabs-window-item value="one">
            <v-row dense>
              <!-- 1.- ANTECEDENTES GENERALES -->
              <v-col cols="12">
                <v-card
                  class="rounded-xl border-soft mb-6 overflow-hidden"
                  elevation="4"
                >
                  <v-sheet class="pa-4 relative border-b-4 border-slate-900 bg-header-dark">
                    <div class="d-flex align-center">
                      <div class="bg-orange-600 rounded-lg pa-2 mr-4">
                        <v-icon
                          icon="mdi-file-document-outline"
                          color="white"
                        />
                      </div>
                      <div class="flex-grow-1">
                        <div class="text-[10px] font-black text-orange-400 uppercase tracking-widest leading-none mb-1">
                          PROYECTO: {{ proyectoEjecucion }}
                        </div>
                        <div class="text-subtitle-1 font-black text-white uppercase italic tracking-tighter leading-tight">
                          1. ANTECEDENTES GENERALES
                        </div>
                      </div>
                    </div>
                  </v-sheet>
                  <v-card-text class="pa-5">
                    <v-row dense>
                      <v-col
                        cols="12"
                        md="3"
                      >
                        <div class="field-label-min">
                          TASA ACCIDENTABILIDAD
                        </div>
                        <v-text-field
                          density="compact"
                          variant="solo-filled"
                          flat
                          hide-details
                          readonly
                          :model-value="tasaAccidentabilidad || '-'"
                          suffix="%"
                          class="modern-input-min mb-2"
                        />
                        <div class="field-label-min">
                          TASA SINIESTRALIDAD
                        </div>
                        <v-text-field
                          density="compact"
                          variant="solo-filled"
                          flat
                          hide-details
                          readonly
                          :model-value="tasaSiniestralidad || '-'"
                          class="modern-input-min mb-2"
                        />
                        <div class="field-label-min">
                          INDICE FRECUENCIA
                        </div>
                        <v-text-field
                          density="compact"
                          variant="solo-filled"
                          flat
                          hide-details
                          readonly
                          :model-value="indiceFrecuencia || '-'"
                          class="modern-input-min mb-2"
                        />
                        <div class="field-label-min">
                          PROM. TRABAJADORES TERRACON
                        </div>
                        <v-text-field
                          density="compact"
                          variant="solo-filled"
                          flat
                          hide-details
                          readonly
                          :model-value="promedioTrabajadoresTerracon || '-'"
                          class="modern-input-min"
                        />
                      </v-col>
                      <v-col
                        cols="12"
                        md="3"
                      >
                        <div class="field-label-min">
                          PROYECTO EN EJECUCIÓN
                        </div>
                        <v-text-field
                          v-model="proyectoEjecucion"
                          density="compact"
                          variant="solo-filled"
                          flat
                          hide-details
                          readonly
                          class="modern-input-min mb-2"
                        />
                        <div class="field-label-min">
                          PERIODO EVALUADO
                        </div>
                        <v-text-field
                          v-model="periodoEvaluado"
                          density="compact"
                          variant="solo-filled"
                          flat
                          hide-details
                          readonly
                          class="modern-input-min mb-2"
                        />
                        <div class="field-label-min">
                          ADMINISTRADOR
                        </div>
                        <v-text-field
                          v-model="administrador"
                          density="compact"
                          variant="solo-filled"
                          flat
                          hide-details
                          class="modern-input-min mb-2"
                        />
                        <div class="field-label-min">
                          EXPERTO ASESOR
                        </div>
                        <v-text-field
                          v-model="expertoAsesor"
                          density="compact"
                          variant="solo-filled"
                          flat
                          hide-details
                          class="modern-input-min"
                        />
                      </v-col>
                      <v-col
                        cols="12"
                        md="3"
                      >
                        <div class="field-label-min">
                          DÍAS TRABAJADOS MES
                        </div>
                        <v-text-field
                          v-model="diasTrabajados"
                          density="compact"
                          variant="solo-filled"
                          flat
                          hide-details
                          readonly
                          class="modern-input-min mb-2"
                        />
                        <div class="field-label-min">
                          HORAS TRABAJADAS (H/DÍA)
                        </div>
                        <v-text-field
                          v-model.number="horasTrabajadasDia"
                          density="compact"
                          variant="solo-filled"
                          flat
                          hide-details
                          type="number"
                          class="modern-input-min mb-2"
                          @keypress="onlyIntegers"
                        />
                        <div class="field-label-min">
                          PROM. TRABAJADORES / DÍA
                        </div>
                        <v-text-field
                          v-model.number="promedioTrabajadoresDia"
                          density="compact"
                          variant="solo-filled"
                          flat
                          hide-details
                          type="number"
                          class="modern-input-min mb-2"
                          @keypress="onlyIntegers"
                        />
                        <div class="field-label-min">
                          TOTAL HHT PERIODO
                        </div>
                        <v-text-field
                          v-model="horasHombrePeriodo"
                          density="compact"
                          variant="solo-filled"
                          flat
                          hide-details
                          readonly
                          class="modern-input-min bg-blue-lighten-5 font-weight-bold"
                        />
                      </v-col>
                      <v-col
                        cols="12"
                        md="3"
                      >
                        <div class="field-label-min">
                          NÚMERO DE INCIDENTES
                        </div>
                        <v-text-field
                          v-model="totalIncidentes"
                          density="compact"
                          variant="solo-filled"
                          flat
                          hide-details
                          readonly
                          class="modern-input-min mb-2 font-weight-bold"
                        />
                        <div class="field-label-min">
                          NÚMERO DE ACCIDENTES
                        </div>
                        <v-text-field
                          v-model="totalAccidentes"
                          density="compact"
                          variant="solo-filled"
                          flat
                          hide-details
                          readonly
                          class="modern-input-min mb-2 font-weight-bold"
                        />
                        <div class="field-label-min">
                          NÚMERO DE DÍAS PERDIDOS
                        </div>
                        <v-text-field
                          v-model="totalDiasPerdidos"
                          density="compact"
                          variant="solo-filled"
                          flat
                          hide-details
                          readonly
                          class="modern-input-min font-weight-bold text-red"
                        />
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- 2.- METRICA CUMPLIMIENTO PERSONALIZADOS -->
              <v-col cols="12">
                <v-card
                  class="rounded-xl border-soft mb-6 overflow-hidden"
                  elevation="4"
                >
                  <v-sheet class="pa-4 relative border-b-4 border-slate-900 bg-header-dark">
                    <div class="d-flex align-center">
                      <div class="bg-blue-600 rounded-lg pa-2 mr-4">
                        <v-icon
                          icon="mdi-chart-areaspline"
                          color="white"
                        />
                      </div>
                      <div class="flex-grow-1">
                        <div class="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">
                          MÉTRICAS DE DESEMPEÑO
                        </div>
                        <div class="text-subtitle-1 font-black text-white uppercase italic tracking-tighter leading-tight">
                          2. CUMPLIMIENTO PROGRAMA DE TRABAJO PREVENTIVO
                        </div>
                      </div>
                    </div>
                  </v-sheet>
                  <v-card-text class="pa-0">
                    <v-table
                      density="compact"
                      class="modern-table-min"
                    >
                      <thead class="bg-slate-50">
                        <tr>
                          <th class="text-left font-weight-bold py-2">
                            Nombre
                          </th>
                          <th class="text-left font-weight-bold py-2">
                            Cargo
                          </th>
                          <th class="text-center font-weight-bold py-2">
                            Eval.
                          </th>
                          <th class="text-center font-weight-bold py-2">
                            Prom.
                          </th>
                          <th class="text-center font-weight-bold py-2">
                            Cumplimiento
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="item in metricasCumplimiento"
                          :key="item.nombre"
                        >
                          <td class="text-caption font-weight-bold">
                            {{ item.nombre }}
                          </td>
                          <td class="text-caption text-slate-500">
                            {{ item.cargo }}
                          </td>
                          <td class="text-center text-caption">
                            {{ item.evaluacion }}
                          </td>
                          <td class="text-center font-weight-bold">
                            {{ item.promedio }}
                          </td>
                          <td class="text-center">
                            <v-chip
                              size="x-small"
                              color="green"
                              variant="flat"
                              class="font-weight-bold"
                            >
                              {{ item.cumplimiento }}
                            </v-chip>
                          </td>
                        </tr>
                      </tbody>
                    </v-table>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- 3.- METRICA ACCIDENTABILIDAD DEL PERIODO -->
              <v-col cols="12">
                <v-card
                  class="rounded-xl border-soft mb-6 overflow-hidden"
                  elevation="0"
                >
                  <v-sheet class="pa-4 relative border-b-4 border-orange-600 bg-header-dark">
                    <div class="d-flex align-center">
                      <div class="orange-square-icon mr-4">
                        3
                      </div>
                      <div class="flex-grow-1">
                        <div class="text-subtitle-1 font-black text-white uppercase italic tracking-tighter leading-tight">
                          MÉTRICA ACCIDENTABILIDAD DEL PERIODO
                        </div>
                      </div>
                    </div>
                  </v-sheet>
                  <v-card-text class="pa-0">
                    <v-table
                      density="compact"
                      class="modern-table-min"
                    >
                      <thead class="bg-slate-50">
                        <tr>
                          <th
                            class="text-left font-weight-bold py-2"
                            style="width: 35%"
                          >
                            Descripción
                          </th>
                          <th class="text-left font-weight-bold py-2">
                            Jefatura Directa
                          </th>
                          <th class="text-center font-weight-bold py-2">
                            Días Perdidos Acum.
                          </th>
                          <th class="text-center font-weight-bold py-2">
                            Días Perdidos Periodo
                          </th>
                          <th class="text-center font-weight-bold py-2">
                            Total días perdidos Acumulado
                          </th>
                          <th class="text-center font-weight-bold py-2">
                            EVALUACIÓN CUMPLIMIENTO
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(item, idx) in metricasAccidentabilidad"
                          :key="idx"
                        >
                          <td class="text-caption py-2 border-r">
                            {{ item.descripcion || '-' }}
                          </td>
                          <td class="text-caption border-r">
                            {{ item.jefatura || '-' }}
                          </td>
                          <td class="text-center border-r">
                            {{ item.diasAcum }}
                          </td>
                          <td class="text-center border-r">
                            {{ item.diasPeriodo }}
                          </td>
                          <td class="text-center border-r font-weight-bold bg-slate-50">
                            {{ item.total }}
                          </td>
                          <td
                            class="text-center font-weight-bold"
                            :class="getColorCumplimiento(item.cumplimiento)"
                          >
                            {{ item.cumplimiento }}%
                          </td>
                        </tr>
                        <tr class="bg-slate-100 font-weight-black italic">
                          <td
                            colspan="4"
                            class="text-left text-caption py-3 px-4"
                          >
                            Total de días Perdidos (asignación de bono a obra)
                          </td>
                          <td class="text-center py-3">
                            {{ totalMetricaAccidentabilidad.dias }}
                          </td>
                          <td class="text-center py-3 text-blue-darken-4">
                            {{ totalMetricaAccidentabilidad.cumplimiento }}%
                          </td>
                        </tr>
                      </tbody>
                    </v-table>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- 4.- CAPACITACION -->
              <v-col cols="12">
                <v-card
                  class="rounded-xl border-soft mb-6 overflow-hidden"
                  elevation="0"
                >
                  <v-sheet class="pa-4 relative border-b-4 border-orange-600 bg-header-dark">
                    <div class="d-flex align-center">
                      <div class="orange-square-icon mr-4">
                        4
                      </div>
                      <div class="flex-grow-1">
                        <div class="text-subtitle-1 font-black text-white uppercase italic tracking-tighter leading-tight">
                          CAPACITACIÓN
                        </div>
                      </div>
                    </div>
                  </v-sheet>
                  <v-card-text class="pa-0">
                    <v-table
                      density="compact"
                      class="modern-table-min"
                    >
                      <thead class="bg-slate-50">
                        <tr>
                          <th
                            class="text-left font-weight-bold py-2"
                            style="width: 25%"
                          >
                            Nombre de la Capacitación
                          </th>
                          <th
                            class="text-left font-weight-bold py-2"
                            style="width: 20%"
                          >
                            Grupo
                          </th>
                          <th
                            class="text-left font-weight-bold py-2"
                            style="width: 15%"
                          >
                            Dirigido a
                          </th>
                          <th
                            class="text-center font-weight-bold py-2"
                            style="width: 8%"
                          >
                            Hrs
                          </th>
                          <th
                            class="text-left font-weight-bold py-2"
                            style="width: 12%"
                          >
                            Relatoría
                          </th>
                          <th
                            class="text-center font-weight-bold py-2"
                            style="width: 10%"
                          >
                            N° Trab.
                          </th>
                          <th
                            class="text-center font-weight-bold py-2"
                            style="width: 10%"
                          >
                            Total HH
                          </th>
                          <th
                            class="text-center py-2"
                            style="width: 5%"
                          />
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(cap, idx) in capacitaciones"
                          :key="idx"
                        >
                          <td class="pa-1">
                            <v-text-field
                              v-model="cap.nombre"
                              density="compact"
                              variant="plain"
                              hide-details
                              class="text-caption custom-input-table"
                            />
                          </td>
                          <td class="pa-1">
                            <v-combobox
                              v-model="cap.grupo"
                              :items="gruposCapacitacion"
                              density="compact"
                              variant="plain"
                              hide-details
                              class="text-caption custom-input-table"
                            />
                          </td>
                          <td class="pa-1">
                            <v-text-field
                              v-model="cap.dirigido"
                              density="compact"
                              variant="plain"
                              hide-details
                              class="text-caption custom-input-table"
                            />
                          </td>
                          <td class="pa-1">
                            <v-text-field
                              v-model.number="cap.horas"
                              type="number"
                              step="0.1"
                              density="compact"
                              variant="plain"
                              hide-details
                              class="text-caption text-center custom-input-table"
                            />
                          </td>
                          <td class="pa-1">
                            <v-select
                              v-model="cap.relatoria"
                              :items="relatoriasCapacitacion"
                              density="compact"
                              variant="plain"
                              hide-details
                              class="text-caption custom-input-table"
                            />
                          </td>
                          <td class="pa-1">
                            <v-text-field
                              v-model.number="cap.trabajadores"
                              type="number"
                              density="compact"
                              variant="plain"
                              hide-details
                              class="text-caption text-center custom-input-table"
                              @keypress="onlyIntegers"
                            />
                          </td>
                          <td class="pa-1 text-center font-weight-bold text-blue-darken-2">
                            {{ (Number(cap.horas || 0) * Number(cap.trabajadores || 0)).toFixed(1) }}
                          </td>
                          <td class="pa-1 text-center">
                            <v-btn
                              icon="mdi-delete"
                              size="x-small"
                              color="red-lighten-4"
                              flat
                              @click="removeCapacitacion(idx)"
                            />
                          </td>
                        </tr>
                        <!-- Fila para agregar -->
                        <tr class="bg-blue-grey-lighten-5">
                          <td colspan="7" />
                          <td class="text-center">
                            <v-btn
                              icon="mdi-plus"
                              size="x-small"
                              color="primary"
                              flat
                              @click="addCapacitacion"
                            />
                          </td>
                        </tr>
                      </tbody>
                      <tfoot class="bg-slate-100 font-weight-black">
                        <tr>
                          <td
                            colspan="6"
                            class="text-right py-2"
                          >
                            Total HH capacitados en el Periodo
                          </td>
                          <td class="text-center py-2 text-blue-darken-4 text-subtitle-2">
                            {{ totalHHCapacitacion }}
                          </td>
                          <td />
                        </tr>
                      </tfoot>
                    </v-table>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- 5.- CAMPAÑAS SST -->
              <v-col cols="12">
                <v-card
                  class="rounded-xl border-soft mb-6 overflow-hidden"
                  elevation="0"
                >
                  <v-sheet class="pa-4 relative border-b-4 border-orange-600 bg-header-dark">
                    <div class="d-flex align-center">
                      <div class="orange-square-icon mr-4">
                        5
                      </div>
                      <div class="flex-grow-1">
                        <div class="text-subtitle-1 font-black text-white uppercase italic tracking-tighter leading-tight">
                          CAMPAÑAS DE SST
                        </div>
                      </div>
                    </div>
                  </v-sheet>
                  <v-card-text class="pa-0">
                    <v-table
                      density="compact"
                      class="modern-table-min"
                    >
                      <thead class="bg-slate-50">
                        <tr>
                          <th
                            class="text-left font-weight-bold py-2"
                            style="width: 25%"
                          >
                            Nombre de la Campaña
                          </th>
                          <th
                            class="text-left font-weight-bold py-2"
                            style="width: 15%"
                          >
                            Valorización $
                          </th>
                          <th
                            class="text-left font-weight-bold py-2"
                            style="width: 20%"
                          >
                            Objetivo
                          </th>
                          <th
                            class="text-center font-weight-bold py-2"
                            style="width: 10%"
                          >
                            HH Estimada
                          </th>
                          <th
                            class="text-center font-weight-bold py-2"
                            style="width: 10%"
                          >
                            Cant. Personas
                          </th>
                          <th
                            class="text-center font-weight-bold py-2"
                            style="width: 10%"
                          >
                            Fecha Inicio
                          </th>
                          <th
                            class="text-center font-weight-bold py-2"
                            style="width: 10%"
                          >
                            Fecha Término
                          </th>
                          <th
                            class="text-center py-2"
                            style="width: 5%"
                          />
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(camp, idx) in campanasSST"
                          :key="idx"
                        >
                          <td class="pa-1">
                            <v-text-field
                              v-model="camp.nombre"
                              density="compact"
                              variant="plain"
                              hide-details
                              class="text-caption custom-input-table"
                            />
                          </td>
                          <td class="pa-1">
                            <div class="d-flex align-center px-1">
                              <span class="text-caption mr-1">$</span>
                              <v-text-field
                                v-model="camp.valorizacion"
                                density="compact"
                                variant="plain"
                                hide-details
                                class="text-caption custom-input-table"
                                @input="formatCurrency(idx)"
                                @keypress="onlyIntegers"
                              />
                            </div>
                          </td>
                          <td class="pa-1">
                            <v-text-field
                              v-model="camp.objetivo"
                              density="compact"
                              variant="plain"
                              hide-details
                              class="text-caption custom-input-table"
                            />
                          </td>
                          <td class="pa-1">
                            <v-text-field
                              v-model.number="camp.hhEstimada"
                              type="number"
                              step="0.1"
                              density="compact"
                              variant="plain"
                              hide-details
                              class="text-caption text-center custom-input-table"
                            />
                          </td>
                          <td class="pa-1">
                            <v-text-field
                              v-model.number="camp.cantidadPersonas"
                              type="number"
                              density="compact"
                              variant="plain"
                              hide-details
                              class="text-caption text-center custom-input-table"
                              @keypress="onlyIntegers"
                            />
                          </td>
                          <td class="pa-1">
                            <v-text-field
                              v-model="camp.fechaInicio"
                              type="date"
                              density="compact"
                              variant="plain"
                              hide-details
                              class="text-caption text-center custom-input-table"
                            />
                          </td>
                          <td class="pa-1">
                            <v-text-field
                              v-model="camp.fechaTermino"
                              type="date"
                              density="compact"
                              variant="plain"
                              hide-details
                              class="text-caption text-center custom-input-table"
                            />
                          </td>
                          <td class="pa-1 text-center">
                            <v-btn
                              icon="mdi-delete"
                              size="x-small"
                              color="red-lighten-4"
                              flat
                              @click="removeCampana(idx)"
                            />
                          </td>
                        </tr>
                        <!-- Fila para agregar -->
                        <tr class="bg-blue-grey-lighten-5">
                          <td colspan="7" />
                          <td class="text-center py-1">
                            <v-btn
                              icon="mdi-plus"
                              size="x-small"
                              color="primary"
                              flat
                              @click="addCampana"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </v-table>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- 6.- SEGUIMIENTO PROTOCOLOS MINSAL -->
              <v-col cols="12">
                <v-card
                  class="rounded-xl border-soft mb-6 overflow-hidden"
                  elevation="0"
                >
                  <v-sheet class="pa-4 relative border-b-4 border-orange-600 bg-header-dark">
                    <div class="d-flex align-center">
                      <div class="orange-square-icon mr-4">
                        6
                      </div>
                      <div class="flex-grow-1">
                        <div class="text-subtitle-1 font-black text-white uppercase italic tracking-tighter leading-tight">
                          SEGUIMIENTO PROTOCOLOS MINSAL
                        </div>
                      </div>
                    </div>
                  </v-sheet>
                  <v-card-text class="pa-0">
                    <v-table
                      density="compact"
                      class="modern-table-min"
                    >
                      <thead class="bg-slate-50">
                        <tr>
                          <th
                            class="text-left font-weight-bold py-2"
                            style="width: 15%"
                          >
                            PROTOCOLO
                          </th>
                          <th
                            class="text-center font-weight-bold py-2"
                            style="width: 10%"
                          >
                            APLICA SI / NO
                          </th>
                          <th
                            class="text-center font-weight-bold py-2"
                            style="width: 15%"
                          >
                            CRONOGRAMA (esta programado Si / No / NA)
                          </th>
                          <th
                            class="text-center font-weight-bold py-2"
                            style="width: 15%"
                          >
                            FECHA INICIO
                            <v-tooltip
                              activator="parent"
                              location="top"
                              max-width="250"
                            >
                              Debe ingresar fecha en la que inicia con actividades en cumplimiento a la implementación del protocolo
                            </v-tooltip>
                          </th>
                          <th
                            class="text-center font-weight-bold py-2"
                            style="width: 8%"
                          >
                            PROGRAMA
                            <v-tooltip
                              activator="parent"
                              location="top"
                              max-width="250"
                            >
                              Ingresar N° de actividades Programadas en cronograma, desde el inicio a la fecha de emisión del informe
                            </v-tooltip>
                          </th>
                          <th
                            class="text-center font-weight-bold py-2"
                            style="width: 10%"
                          >
                            REAL EJECUTADO
                            <v-tooltip
                              activator="parent"
                              location="top"
                              max-width="250"
                            >
                              Ingresar N° de actividades realizadas según programación en el cronograma desde la fecha de inicio
                            </v-tooltip>
                          </th>
                          <th
                            class="text-center font-weight-bold py-2"
                            style="width: 12%"
                          >
                            % CUMPLIMIENTO AL PERIODO
                          </th>
                          <th
                            class="text-center font-weight-bold py-2"
                            style="width: 10%"
                          >
                            % AVANCE TOTAL
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(prot, idx) in protocolosMinsal"
                          :key="idx"
                        >
                          <td class="pa-2 font-weight-bold text-caption">
                            <v-text-field
                              v-model="prot.nombre"
                              density="compact"
                              variant="plain"
                              hide-details
                              class="text-caption custom-input-table font-weight-bold"
                            />
                          </td>
                          <td class="pa-1">
                            <v-select
                              v-model="prot.aplica"
                              :items="['Si', 'No', 'NA']"
                              density="compact"
                              variant="plain"
                              hide-details
                              class="text-caption text-center custom-input-table"
                            />
                          </td>
                          <td class="pa-1">
                            <v-select
                              v-model="prot.cronograma"
                              :items="['Si', 'No', 'NA']"
                              density="compact"
                              variant="plain"
                              hide-details
                              class="text-caption text-center custom-input-table"
                            />
                          </td>
                          <td class="pa-1">
                            <v-text-field
                              v-model="prot.fechaInicio"
                              type="date"
                              density="compact"
                              variant="plain"
                              hide-details
                              class="text-caption text-center custom-input-table"
                            />
                          </td>
                          <td class="pa-1">
                            <v-text-field
                              v-model.number="prot.programado"
                              type="number"
                              density="compact"
                              variant="plain"
                              hide-details
                              class="text-caption text-center custom-input-table"
                              @keypress="onlyIntegers"
                            />
                          </td>
                          <td class="pa-1">
                            <v-text-field
                              v-model.number="prot.real"
                              type="number"
                              density="compact"
                              variant="plain"
                              hide-details
                              class="text-caption text-center custom-input-table"
                              @keypress="onlyIntegers"
                            />
                          </td>
                          <td class="pa-1 text-center">
                            <v-chip
                              size="x-small"
                              :color="calculateCumplimientoProtocolo(prot) >= 100 ? 'green' : 'grey'"
                              variant="flat"
                            >
                              {{ calculateCumplimientoProtocolo(prot) }}%
                            </v-chip>
                          </td>
                          <td class="pa-1 text-center">
                            <v-btn
                              icon="mdi-delete"
                              size="x-small"
                              color="red-lighten-4"
                              flat
                              @click="removeProtocolo(idx)"
                            />
                          </td>
                        </tr>
                        <!-- Fila para agregar -->
                        <tr class="bg-blue-grey-lighten-5">
                          <td colspan="7" />
                          <td class="text-center">
                            <v-btn
                              icon="mdi-plus"
                              size="x-small"
                              color="primary"
                              flat
                              @click="addProtocolo"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </v-table>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- 7.- INDICES OBRA -->
              <v-col cols="12">
                <v-card
                  class="rounded-xl border-soft mb-6 overflow-hidden"
                  elevation="0"
                  height="auto"
                >
                  <v-sheet class="pa-4 relative border-b-4 border-orange-600 bg-header-dark">
                    <div class="d-flex align-center">
                      <div class="orange-square-icon mr-4">
                        7
                      </div>
                      <div class="flex-grow-1">
                        <div class="text-subtitle-1 font-black text-white uppercase italic tracking-tighter leading-tight">
                          MEDICIÓN DE ÍNDICES DE LA OBRA
                        </div>
                      </div>
                    </div>
                  </v-sheet>
                  <v-card-text class="pa-0">
                    <v-table
                      density="compact"
                      class="modern-table-min"
                    >
                      <tbody>
                        <tr
                          v-for="indice in indicesObra"
                          :key="indice.label"
                        >
                          <td class="text-caption font-weight-bold py-3 px-4">
                            {{ indice.label }}
                          </td>
                          <td class="text-right font-weight-black py-3 pr-6 bg-green-lighten-5 text-subtitle-1 text-green-darken-4 italic">
                            {{ indice.value }}
                          </td>
                        </tr>
                      </tbody>
                    </v-table>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- 8.- EVALUACIONES / AUDITORIAS DEL MANDANTE -->
              <v-col cols="12">
                <v-card
                  class="rounded-xl border-soft mb-6 overflow-hidden"
                  elevation="0"
                >
                  <v-sheet class="pa-4 relative border-b-4 border-orange-600 bg-header-dark">
                    <div class="d-flex align-center">
                      <div class="orange-square-icon mr-4">
                        8
                      </div>
                      <div class="flex-grow-1">
                        <div class="text-subtitle-1 font-black text-white uppercase italic tracking-tighter leading-tight">
                          EVALUACIONES / AUDITORIAS DEL MANDANTE
                          <v-tooltip
                            activator="parent"
                            location="top"
                            max-width="400"
                          >
                            Ingresar los resultados de las evaluaciones y /o auditorias que realicen los mandantes en los distintos centros de trabajo asociados al contrato, tales como Evaluación EECC IV contrato Metrogas / Zygth Contratos Sonacol / Auditorias Contratos ENAP
                          </v-tooltip>
                        </div>
                      </div>
                    </div>
                  </v-sheet>
                  <v-card-text class="pa-0">
                    <v-table
                      density="compact"
                      class="modern-table-min"
                    >
                      <thead class="bg-slate-50">
                        <tr>
                          <th
                            class="text-left font-weight-bold py-2"
                            style="width: 50%"
                          >
                            Auditoria / Evaluación
                          </th>
                          <th
                            class="text-center font-weight-bold py-2"
                            style="width: 20%"
                          >
                            Estándar
                          </th>
                          <th
                            class="text-center font-weight-bold py-2"
                            style="width: 25%"
                          >
                            % Cumplimiento Obtenido
                          </th>
                          <th
                            class="text-center py-2"
                            style="width: 5%"
                          />
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(aud, idx) in auditoriasMandante"
                          :key="idx"
                        >
                          <td class="pa-1">
                            <v-text-field
                              v-model="aud.nombre"
                              density="compact"
                              variant="plain"
                              hide-details
                              class="text-caption custom-input-table"
                            />
                          </td>
                          <td class="pa-1">
                            <v-text-field
                              v-model.number="aud.estandar"
                              type="number"
                              step="0.01"
                              density="compact"
                              variant="plain"
                              hide-details
                              class="text-caption text-center custom-input-table"
                            />
                          </td>
                          <td class="pa-1">
                            <v-text-field
                              v-model.number="aud.cumplimiento"
                              type="number"
                              step="0.01"
                              density="compact"
                              variant="plain"
                              hide-details
                              class="text-caption text-center custom-input-table"
                            />
                          </td>
                          <td class="pa-1 text-center">
                            <v-btn
                              icon="mdi-delete"
                              size="x-small"
                              color="red-lighten-4"
                              flat
                              @click="removeAuditoria(idx)"
                            />
                          </td>
                        </tr>
                        <!-- Fila para agregar -->
                        <tr class="bg-blue-grey-lighten-5">
                          <td colspan="3" />
                          <td class="text-center py-1">
                            <v-btn
                              icon="mdi-plus"
                              size="x-small"
                              color="primary"
                              flat
                              @click="addAuditoria"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </v-table>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- 10.- EMPRESAS CONTRATISTAS -->
              <v-col cols="12">
                <v-card
                  class="rounded-xl border-soft mb-6 overflow-hidden"
                  elevation="0"
                >
                  <v-sheet class="pa-4 relative border-b-4 border-orange-600 bg-header-dark">
                    <div class="d-flex align-center">
                      <div class="orange-square-icon mr-4">
                        10
                      </div>
                      <div class="flex-grow-1">
                        <div class="text-subtitle-1 font-black text-white uppercase italic tracking-tighter leading-tight">
                          EMPRESAS CONTRATISTAS
                        </div>
                      </div>
                    </div>
                  </v-sheet>
                  <v-card-text class="pa-0">
                    <v-table
                      density="compact"
                      class="modern-table-min"
                    >
                      <tbody>
                        <tr
                          v-for="item in empresasContratistasTable"
                          :key="item.label"
                        >
                          <td
                            class="text-caption font-weight-bold py-3 px-4 shadow-sm"
                            style="width: 60%"
                          >
                            {{ item.label }}
                          </td>
                          <td
                            class="pa-0 text-center font-weight-black"
                            :class="item.type === 'calc' ? 'bg-green-lighten-5 text-green-darken-4' : ''"
                            style="width: 40%"
                          >
                            <v-text-field 
                              v-if="item.type === 'manual'" 
                              v-model.number="contratistasData[item.key]" 
                              type="number" 
                              density="compact" 
                              variant="plain" 
                              hide-details 
                              class="text-caption text-center custom-input-table font-weight-bold" 
                              @keypress="onlyIntegers"
                            />
                            <span
                              v-else
                              class="text-caption font-weight-black italic"
                            >{{ item.value }}</span>
                          </td>
                        </tr>
                      </tbody>
                    </v-table>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- OBSERVACIONES -->
              <v-col cols="12">
                <v-card
                  class="rounded-xl border-soft mb-12 overflow-hidden"
                  elevation="0"
                >
                  <v-sheet class="pa-4 relative border-b-4 border-orange-600 bg-header-dark">
                    <div class="d-flex align-center">
                      <div class="orange-square-icon mr-4">
                        <v-icon
                          icon="mdi-comment-text-outline"
                          color="white"
                          size="24"
                        />
                      </div>
                      <div class="flex-grow-1">
                        <div class="text-subtitle-1 font-black text-white uppercase italic tracking-tighter leading-tight">
                          OBSERVACIONES
                        </div>
                      </div>
                    </div>
                  </v-sheet>
                  <v-card-text class="pa-4">
                    <v-textarea
                      v-model="observacionesInforme"
                      variant="solo-filled"
                      flat
                      hide-details
                      placeholder="Sin observaciones relevantes..."
                      rows="6"
                      class="modern-input-min"
                    />
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-tabs-window-item>


          <v-tabs-window-item value="four">
            <div class="max-w-[1200px] mx-auto pa-4">
              <v-sheet class="pa-4 relative border-b-4 border-red-600 bg-header-dark rounded-xl mb-6 shadow-lg">
                <div class="d-flex align-center">
                  <div class="bg-red-600 rounded-lg pa-2 mr-4">
                    <v-icon
                      icon="mdi-account-alert"
                      color="white"
                    />
                  </div>
                  <div class="flex-grow-1">
                    <div class="text-[10px] font-black text-red-100 uppercase tracking-widest leading-none mb-1">
                      GESTIÓN DE EVENTOS
                    </div>
                    <div class="text-subtitle-1 font-black text-white uppercase italic tracking-tighter leading-tight">
                      REGISTRO DE ACCIDENTABILIDAD CON TIEMPO PERDIDO (CTP)
                    </div>
                  </div>
                  <v-spacer />
                  <v-btn
                    color="orange-accent-2"
                    variant="elevated"
                    size="small"
                    prepend-icon="mdi-plus"
                    class="text-none font-weight-black rounded-lg px-6"
                    :disabled="isReadOnly"
                    @click="openDialog()"
                  >
                    Agregar Registro
                  </v-btn>
                </div>
              </v-sheet>

              <v-row dense>
                <v-col
                  v-for="(accident, idx) in nominaAccidentes"
                  :key="idx"
                  cols="12"
                  class="mb-3"
                >
                  <v-card
                    class="rounded-xl border-soft overflow-hidden"
                    elevation="0"
                  >
                    <v-card-text class="pa-0">
                      <!-- Resumen Visible -->
                      <div
                        class="pa-4 d-flex align-center cursor-pointer hover-bg"
                        @click="toggleExpand(idx)"
                      >
                        <div
                          class="mr-4 text-center"
                          style="min-width: 60px"
                        >
                          <div class="text-caption font-weight-black text-slate-400">
                            {{ displayDate(accident.fecha).split('/')[0] }}
                          </div>
                          <div class="text-h6 font-weight-black leading-none">
                            {{ displayMonthName(accident.fecha) }}
                          </div>
                          <div class="text-caption font-weight-black text-slate-400">
                            {{ displayDate(accident.fecha).split('/')[2] }}
                          </div>
                        </div>
                        <v-divider
                          vertical
                          class="mr-4"
                        />
                        <div class="flex-grow-1">
                          <div class="d-flex align-center mb-1">
                            <span class="text-subtitle-2 font-weight-black mr-2">{{ accident.nombre }}</span>
                            <v-chip
                              size="x-small"
                              :color="accident.calificacion === 'Aceptado' ? 'green' : 'orange'"
                              variant="flat"
                            >
                              {{ accident.calificacion }}
                            </v-chip>
                          </div>
                          <div class="text-caption text-slate-500">
                            <v-icon
                              size="12"
                              class="mr-1"
                            >
                              mdi-account-hard-hat
                            </v-icon> {{ accident.cargo }} • 
                            <v-icon
                              size="12"
                              class="mr-1"
                            >
                              mdi-domain
                            </v-icon> {{ accident.empresa }}
                          </div>
                        </div>
                        <div class="text-right mr-6">
                          <div class="text-caption font-weight-bold text-slate-400">
                            DÍAS PERDIDOS
                          </div>
                          <div
                            class="text-h5 font-weight-black"
                            :class="accident.diasPerdidos > 0 ? 'text-red' : 'text-slate-300'"
                          >
                            {{ accident.diasPerdidos }}
                          </div>
                        </div>
                        <v-btn
                          icon
                          variant="text"
                          color="slate-400"
                          @click.stop="toggleExpand(idx)"
                        >
                          <v-icon>{{ expandedId === idx ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                        </v-btn>
                      </div>

                      <!-- Detalle Expandido -->
                      <v-expand-transition>
                        <div
                          v-if="expandedId === idx"
                          class="border-t bg-slate-50 pa-6"
                        >
                          <v-row dense>
                            <v-col
                              cols="12"
                              md="4"
                            >
                              <span class="text-caption font-weight-black text-slate-400 d-block mb-3">ANTECEDENTES</span>
                              <div class="v2-detail-box">
                                <div class="v2-label">
                                  RUT
                                </div><div class="v2-value">
                                  {{ accident.rut }}
                                </div>
                                <div class="v2-label">
                                  SEXO
                                </div><div class="v2-value">
                                  {{ accident.sexo }}
                                </div>
                                <div class="v2-label">
                                  TIPO SUCESO
                                </div><div class="v2-value">
                                  {{ accident.tipoSuceso }}
                                </div>
                                <div class="v2-label text-red">
                                  ZONA AFECTADA
                                </div><div class="v2-value font-weight-black">
                                  {{ accident.zona }}
                                </div>
                              </div>
                            </v-col>
                            <v-col
                              cols="12"
                              md="4"
                            >
                              <span class="text-caption font-weight-black text-slate-400 d-block mb-3">GESTIÓN MÉDICA</span>
                              <div class="v2-detail-box">
                                <div class="v2-label">
                                  INGRESO ACHS
                                </div><div class="v2-value">
                                  {{ displayDate(accident.fechaIngreso) }}
                                </div>
                                <div class="v2-label">
                                  FECHA ALTA
                                </div><div class="v2-value">
                                  {{ displayDate(accident.fechaAlta) }}
                                </div>
                                <div class="v2-label">
                                  ESTADO
                                </div><div class="v2-value">
                                  {{ accident.stp_ctp }}
                                </div>
                              </div>
                            </v-col>
                            <v-col
                              cols="12"
                              md="4"
                            >
                              <span class="text-caption font-weight-black text-slate-400 d-block mb-3">OBRA / JEFATURA</span>
                              <div class="v2-detail-box">
                                <div class="v2-label">
                                  OBRA
                                </div><div class="v2-value">
                                  {{ accident.obra }}
                                </div>
                                <div class="v2-label">
                                  JEFATURA
                                </div><div class="v2-value">
                                  {{ accident.jefatura }}
                                </div>
                                <div class="v2-label">
                                  ADMIN
                                </div><div class="v2-value">
                                  {{ accident.administrador }}
                                </div>
                              </div>
                            </v-col>
                            <v-col
                              cols="12"
                              class="mt-4"
                            >
                              <v-card
                                variant="flat"
                                border
                                class="pa-4 bg-white rounded-lg"
                              >
                                <div class="text-caption font-weight-bold text-slate-400 mb-1">
                                  BREVE DESCRIPCIÓN DE LOS HECHOS
                                </div>
                                <div class="text-body-2 text-slate-700 italic border-l-4 pl-3 border-primary mb-4">
                                  {{ accident.descripcion }}
                                </div>
                              
                                <v-row>
                                  <v-col
                                    cols="12"
                                    md="6"
                                  >
                                    <div class="text-caption font-weight-bold text-red-darken-2 mb-1">
                                      CAUSA RAÍZ
                                    </div>
                                    <div class="text-caption text-slate-600">
                                      {{ accident.causa }}
                                    </div>
                                  </v-col>
                                  <v-col
                                    cols="12"
                                    md="6"
                                  >
                                    <div class="text-caption font-weight-bold text-green-darken-2 mb-1">
                                      MEDIDAS CORRECTIVAS
                                    </div>
                                    <div class="text-caption text-slate-600">
                                      {{ accident.medidas }}
                                    </div>
                                  </v-col>
                                </v-row>
                              </v-card>
                            </v-col>
                            <v-col
                              cols="12"
                              class="text-right mt-4"
                            >
                              <v-btn
                                variant="text"
                                density="compact"
                                color="error"
                                prepend-icon="mdi-trash-can-outline"
                                class="mr-2"
                                :disabled="isReadOnly"
                                @click="eliminarAccidente(accident)"
                              >
                                Eliminar
                              </v-btn>
                              <v-btn
                                variant="tonal"
                                density="compact"
                                color="primary"
                                prepend-icon="mdi-pencil"
                                :disabled="isReadOnly"
                                @click="openDialog(accident)"
                              >
                                Editar Registro
                              </v-btn>
                            </v-col>
                          </v-row>
                        </div>
                      </v-expand-transition>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </v-tabs-window-item>

          <v-tabs-window-item value="three">
            <div class="max-w-[1200px] mx-auto pa-4">
              <v-sheet class="pa-4 relative border-b-4 border-orange-600 bg-header-dark rounded-xl mb-6 shadow-lg">
                <div class="d-flex align-center">
                  <div class="bg-orange-600 rounded-lg pa-2 mr-4">
                    <v-icon
                      icon="mdi-shield-alert"
                      color="white"
                    />
                  </div>
                  <div class="flex-grow-1">
                    <div class="text-[10px] font-black text-orange-100 uppercase tracking-widest leading-none mb-1">
                      GESTIÓN DE RIESGOS
                    </div>
                    <div class="text-subtitle-1 font-black text-white uppercase italic tracking-tighter leading-tight">
                      REGISTRO DE INCIDENTES Y SUCESOS PELIGROSOS
                    </div>
                  </div>
                  <v-spacer />
                  <v-btn
                    color="blue-darken-3"
                    variant="elevated"
                    size="small"
                    prepend-icon="mdi-plus"
                    class="text-none font-weight-black rounded-lg px-6 text-white"
                    :disabled="isReadOnly"
                    @click="openDialogIncidente()"
                  >
                    Registrar Incidente
                  </v-btn>
                </div>
              </v-sheet>

              <v-row dense>
                <v-col
                  v-for="(incidente, idx) in nominaIncidentes"
                  :key="idx"
                  cols="12"
                  class="mb-3"
                >
                  <v-card
                    class="rounded-xl border-soft overflow-hidden"
                    elevation="0"
                  >
                    <v-card-text class="pa-0">
                      <!-- Resumen Visible (Homologado a Accidentes) -->
                      <div
                        class="pa-4 d-flex align-center cursor-pointer hover-bg"
                        @click="toggleExpandInc(idx)"
                      >
                        <div
                          class="mr-4 text-center"
                          style="min-width: 60px"
                        >
                          <div class="text-caption font-weight-black text-slate-400">
                            {{ displayDate(incidente.fecha).split('/')[0] }}
                          </div>
                          <div class="text-h6 font-weight-black leading-none">
                            {{ displayMonthName(incidente.fecha) }}
                          </div>
                          <div class="text-caption font-weight-black text-slate-400">
                            {{ displayDate(incidente.fecha).split('/')[2] }}
                          </div>
                        </div>
                        <v-divider
                          vertical
                          class="mr-4"
                        />
                        <div class="flex-grow-1">
                          <div class="d-flex align-center mb-1">
                            <span class="text-subtitle-2 font-weight-black mr-2">{{ incidente.nombre }}</span>
                            <v-chip
                              size="x-small"
                              color="orange"
                              variant="flat"
                              class="text-uppercase"
                            >
                              INCIDENTE
                            </v-chip>
                          </div>
                          <div class="text-caption text-slate-500">
                            <v-icon
                              size="12"
                              class="mr-1"
                            >
                              mdi-clock-outline
                            </v-icon> {{ incidente.hora }} • 
                            <v-icon
                              size="12"
                              class="mr-1"
                            >
                              mdi-map-marker-outline
                            </v-icon> {{ incidente.lugar }}
                          </div>
                        </div>
                        <div class="text-right mr-6">
                          <div class="text-caption font-weight-bold text-slate-400">
                            EMPRESA
                          </div>
                          <div class="text-subtitle-2 font-weight-black">
                            {{ incidente.empresa }}
                          </div>
                        </div>
                        <v-btn
                          icon
                          variant="text"
                          color="slate-400"
                          @click.stop="toggleExpandInc(idx)"
                        >
                          <v-icon>{{ expandedIdInc === idx ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                        </v-btn>
                      </div>

                      <!-- Detalle Expandido -->
                      <v-expand-transition>
                        <div
                          v-if="expandedIdInc === idx"
                          class="border-t bg-slate-50 pa-6"
                        >
                          <v-row dense>
                            <v-col
                              cols="12"
                              md="4"
                            >
                              <span class="text-caption font-weight-black text-slate-400 d-block mb-3">ANTECEDENTES TRABAJADOR</span>
                              <div class="v2-detail-box">
                                <div class="v2-label">
                                  RUT
                                </div><div class="v2-value">
                                  {{ incidente.rut }}
                                </div>
                                <div class="v2-label">
                                  SEXO / CARGO
                                </div><div class="v2-value">
                                  {{ incidente.sexo }} / {{ incidente.cargo }}
                                </div>
                                <div class="v2-label">
                                  TAREA
                                </div><div class="v2-value">
                                  {{ incidente.tarea }}
                                </div>
                              </div>
                            </v-col>
                            <v-col
                              cols="12"
                              md="4"
                            >
                              <span class="text-caption font-weight-black text-slate-400 d-block mb-3">UBICACIÓN Y JEFATURAS</span>
                              <div class="v2-detail-box">
                                <div class="v2-label">
                                  OBRA / ÁREA
                                </div><div class="v2-value">
                                  {{ incidente.obra }} / {{ incidente.area }}
                                </div>
                                <div class="v2-label">
                                  JEFATURA DIRECTA
                                </div><div class="v2-value">
                                  {{ incidente.jefatura }}
                                </div>
                                <div class="v2-label">
                                  ADMINISTRADOR
                                </div><div class="v2-value">
                                  {{ incidente.administrador }}
                                </div>
                              </div>
                            </v-col>
                            <v-col
                              cols="12"
                              md="4"
                            >
                              <v-card
                                variant="flat"
                                border
                                class="pa-4 bg-white rounded-lg h-100"
                              >
                                <div class="text-caption font-weight-bold text-slate-400 mb-1">
                                  REGISTRO
                                </div>
                                <div class="v2-label">
                                  FECHA REGISTRO
                                </div><div class="v2-value">
                                  {{ displayDate(new Date().toISOString()) }}
                                </div>
                                <div class="v2-label">
                                  PROFECIONAL SST
                                </div><div class="v2-value">
                                  {{ profesionalSST }}
                                </div>
                              </v-card>
                            </v-col>
                            <v-col
                              cols="12"
                              class="mt-4"
                            >
                              <v-card
                                variant="flat"
                                border
                                class="pa-4 bg-white rounded-lg"
                              >
                                <div class="text-caption font-weight-bold text-slate-400 mb-1">
                                  DESCRIPCIÓN DE LOS HECHOS
                                </div>
                                <div class="text-body-2 text-slate-700 italic border-l-4 pl-3 border-orange-darken-3 mb-4">
                                  {{ incidente.descripcion }}
                                </div>
                              
                                <v-row>
                                  <v-col
                                    cols="12"
                                    md="6"
                                  >
                                    <div class="text-caption font-weight-bold text-red-darken-2 mb-1">
                                      CAUSA RAÍZ
                                    </div>
                                    <div class="text-caption text-slate-600">
                                      {{ incidente.causa }}
                                    </div>
                                  </v-col>
                                  <v-col
                                    cols="12"
                                    md="6"
                                  >
                                    <div class="text-caption font-weight-bold text-green-darken-2 mb-1">
                                      MEDIDAS CORRECTIVAS
                                    </div>
                                    <div class="text-caption text-slate-600">
                                      {{ incidente.medidas }}
                                    </div>
                                  </v-col>
                                </v-row>
                              </v-card>
                            </v-col>
                            <v-col
                              cols="12"
                              class="text-right mt-4"
                            >
                              <v-btn
                                variant="text"
                                density="compact"
                                color="error"
                                prepend-icon="mdi-trash-can-outline"
                                class="mr-2"
                                :disabled="isReadOnly"
                                @click="eliminarIncidente(incidente)"
                              >
                                Eliminar
                              </v-btn>
                              <v-btn
                                variant="tonal"
                                density="compact"
                                color="orange-darken-3"
                                prepend-icon="mdi-pencil"
                                :disabled="isReadOnly"
                                @click="openDialogIncidente(incidente)"
                              >
                                Editar Incidente
                              </v-btn>
                            </v-col>
                          </v-row>
                        </div>
                      </v-expand-transition>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col
                  v-if="nominaIncidentes.length === 0"
                  cols="12"
                >
                  <div class="pa-12 text-center text-slate-400 bg-slate-100 rounded-xl border-dashed">
                    No se registran incidentes o sucesos peligrosos en el periodo evaluado
                  </div>
                </v-col>
              </v-row>
            </div>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-form>
    </div>

    <!-- Footer Fijo Simplificado -->
    <v-sheet
      border="t"
      class="px-6 py-3 d-flex align-center bg-slate-50 mt-auto flex-shrink-0"
    >
      <v-icon
        icon="mdi-shield-check"
        color="slate-400"
        size="14"
        class="mr-2"
      />
      <span class="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-slate-500">
        TERRACON SST MANAGEMENT SYSTEM • VER. 2026.1 • TPI-PRR-INF-001
      </span>
      <v-spacer />
      <div class="d-flex align-center ga-4">
        <div class="text-[9px] font-black text-slate-300">
          ESTADO DOCUMENTO: <span class="text-orange-600 italic">EN PROCESO</span>
        </div>
      </div>
    </v-sheet>

    <!-- Diálogo de Agregar/Editar Registro -->
    <v-dialog
      v-model="dialogAccidente"
      max-width="900"
      persistent
      scrollable
    >
      <v-card class="rounded-xl overflow-hidden">
        <v-toolbar
          color="orange-darken-3"
          flat
        >
          <v-icon
            icon="mdi-account-alert"
            class="mx-4"
          />
          <v-toolbar-title class="text-subtitle-1 font-weight-black">
            {{ editMode ? 'EDITAR ACCIDENTE' : 'REGISTRO DE ACCIDENTE' }}
          </v-toolbar-title>
          <v-spacer />
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="dialogAccidente = false"
          />
        </v-toolbar>

        <v-card-text class="pa-6 bg-slate-50">
          <v-form
            :disabled="isReadOnly"
            @submit.prevent="guardarAccidente"
          >
            <!-- SECCIÓN 1: DATOS PERSONALES -->
            <div class="field-label-min mb-4 text-primary">
              I. IDENTIFICACIÓN Y ANTECEDENTES
            </div>
            <v-row dense>
              <v-col
                cols="12"
                md="3"
              >
                <v-text-field 
                  v-model="formAccidente.fecha" 
                  label="Fecha Suceso" 
                  type="date"
                  density="compact" 
                  variant="outlined" 
                  bg-color="white" 
                  hide-details 
                  class="mb-2"
                />
              </v-col>
              <v-col
                cols="12"
                md="3"
              >
                <v-text-field 
                  v-model="formAccidente.rut" 
                  label="RUT (Sin puntos con guión)" 
                  density="compact" 
                  variant="outlined" 
                  bg-color="white" 
                  :hide-details="!rutError"
                  :error-messages="rutError"
                  class="mb-2"
                  :loading="loadingUserLookup"
                  placeholder="12345678-K"
                  @blur="validarYBuscarRut"
                />
              </v-col>
              <v-col
                cols="12"
                md="6"
              >
                <v-text-field 
                  v-model="formAccidente.nombre" 
                  label="Nombre Trabajador" 
                  density="compact" 
                  variant="outlined" 
                  bg-color="white" 
                  hide-details 
                  class="mb-2" 
                  :loading="loadingUserLookup"
                />
              </v-col>
              
              <v-col
                cols="12"
                md="3"
              >
                <v-select
                  v-model="formAccidente.sexo"
                  :items="['M', 'F', 'Otro']"
                  label="Sexo"
                  density="compact"
                  variant="outlined"
                  bg-color="white"
                  hide-details
                  class="mb-2"
                />
              </v-col>
              <v-col
                cols="12"
                md="5"
              >
                <v-text-field
                  v-model="formAccidente.cargo"
                  label="Cargo"
                  density="compact"
                  variant="outlined"
                  bg-color="white"
                  hide-details
                  class="mb-2"
                />
              </v-col>
              <v-col
                cols="12"
                md="4"
              >
                <v-text-field
                  v-model="formAccidente.empresa"
                  label="Empresa"
                  density="compact"
                  variant="outlined"
                  bg-color="white"
                  hide-details
                  class="mb-2"
                />
              </v-col>
            </v-row>

            <!-- SECCIÓN 2: CALIFICACIÓN -->
            <div class="field-label-min mt-4 mb-4 text-primary">
              II. CALIFICACIÓN Y GESTIÓN MÉDICA
            </div>
            <v-row dense>
              <v-col
                cols="12"
                md="4"
              >
                <v-select
                  v-model="formAccidente.calificacion"
                  :items="['Aceptado', 'Rechazado', 'Pendiente']"
                  label="Calificación"
                  density="compact"
                  variant="outlined"
                  bg-color="white"
                  hide-details
                  class="mb-2"
                />
              </v-col>
              <v-col
                cols="12"
                md="4"
              >
                <v-text-field
                  v-model="formAccidente.fechaCalif"
                  label="Fecha Calificación"
                  type="date"
                  density="compact"
                  variant="outlined"
                  bg-color="white"
                  hide-details
                  class="mb-2"
                />
              </v-col>
              <v-col
                cols="12"
                md="4"
              >
                <v-select 
                  v-model="formAccidente.tipoSuceso" 
                  :items="['Accidente de Trabajo', 'Accidente Común', 'Accidente de Trayecto', 'Enfermedad Profesional', 'Enfermedad Común']" 
                  label="Tipo de Suceso" 
                  density="compact" 
                  variant="outlined" 
                  bg-color="white" 
                  hide-details 
                  class="mb-2"
                />
              </v-col>
              <v-col
                cols="12"
                md="4"
              >
                <v-select
                  v-model="formAccidente.zona"
                  :items="zonasCorporales"
                  label="Zona Corporal Afectada"
                  density="compact"
                  variant="outlined"
                  bg-color="white"
                  hide-details
                  multiple
                  chips
                  class="mb-2"
                />
              </v-col>
              
              <v-col
                cols="12"
                md="3"
              >
                <v-text-field
                  v-model="formAccidente.fechaIngreso"
                  label="Ingreso ACHS"
                  type="date"
                  density="compact"
                  variant="outlined"
                  bg-color="white"
                  hide-details
                  class="mb-2"
                />
              </v-col>
              <v-col
                cols="12"
                md="3"
              >
                <v-text-field
                  v-model="formAccidente.fechaAlta"
                  label="Fecha Alta"
                  type="date"
                  density="compact"
                  variant="outlined"
                  bg-color="white"
                  hide-details
                  class="mb-2"
                />
              </v-col>
              <v-col
                cols="12"
                md="4"
              >
                <v-select
                  v-model="formAccidente.stp_ctp"
                  :items="['Con Tiempo Perdido', 'Sin Tiempo Perdido']"
                  label="Estado"
                  density="compact"
                  variant="outlined"
                  bg-color="white"
                  hide-details
                  class="mb-2"
                />
              </v-col>
              <v-col
                cols="12"
                md="2"
              >
                <v-text-field
                  v-model.number="formAccidente.diasPerdidos"
                  label="Días Perd."
                  type="number"
                  density="compact"
                  variant="outlined"
                  bg-color="white"
                  hide-details
                  class="mb-2"
                  :error="formAccidente.stp_ctp === 'Con Tiempo Perdido' && formAccidente.diasPerdidos <= 0"
                />
              </v-col>
            </v-row>

            <!-- SECCIÓN 3: EL SUCESO -->
            <div class="field-label-min mt-4 mb-4 text-primary">
              III. DESCRIPCIÓN Y CAUSAS
            </div>
            <v-row dense>
              <v-col cols="12">
                <v-textarea
                  v-model="formAccidente.descripcion"
                  label="Breve descripción de los hechos"
                  density="compact"
                  variant="outlined"
                  bg-color="white"
                  rows="3"
                  hide-details
                  class="mb-2"
                />
              </v-col>
              <v-col
                cols="12"
                md="6"
              >
                <v-textarea
                  v-model="formAccidente.causa"
                  label="Causa Raíz"
                  density="compact"
                  variant="outlined"
                  bg-color="white"
                  rows="2"
                  hide-details
                  class="mb-2"
                />
              </v-col>
              <v-col
                cols="12"
                md="6"
              >
                <v-textarea
                  v-model="formAccidente.medidas"
                  label="Medidas Correctivas"
                  density="compact"
                  variant="outlined"
                  bg-color="white"
                  rows="2"
                  hide-details
                  class="mb-2"
                />
              </v-col>
            </v-row>
            
            <v-row dense>
              <v-col
                cols="12"
                md="3"
              >
                <v-text-field
                  v-model="formAccidente.obra"
                  label="Obra"
                  density="compact"
                  variant="outlined"
                  bg-color="white"
                  hide-details
                />
              </v-col>
              <v-col
                cols="12"
                md="3"
              >
                <v-text-field
                  v-model="formAccidente.jefatura"
                  label="Jefatura"
                  density="compact"
                  variant="outlined"
                  bg-color="white"
                  hide-details
                />
              </v-col>
              <v-col
                cols="12"
                md="3"
              >
                <v-text-field
                  v-model="formAccidente.administrador"
                  label="Administrador"
                  density="compact"
                  variant="outlined"
                  bg-color="white"
                  hide-details
                />
              </v-col>
              <v-col
                cols="12"
                md="3"
              >
                <v-text-field
                  v-model="formAccidente.area"
                  label="Área"
                  density="compact"
                  variant="outlined"
                  bg-color="white"
                  hide-details
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-divider />
        <v-card-actions class="pa-4 bg-white">
          <v-spacer />
          <v-btn
            variant="text"
            color="slate-500"
            class="text-none font-weight-bold"
            @click="dialogAccidente = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            prepend-icon="mdi-content-save"
            class="text-none font-weight-bold px-6"
            :disabled="isReadOnly"
            @click="guardarAccidente"
          >
            {{ editMode ? 'Guardar Cambios' : 'Crear Registro' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo de Agregar/Editar Incidente -->
    <v-dialog
      v-model="dialogIncidente"
      max-width="900"
      persistent
      scrollable
    >
      <v-card class="rounded-xl overflow-hidden">
        <v-toolbar
          color="orange-darken-3"
          flat
        >
          <v-icon
            icon="mdi-shield-alert"
            class="mx-4"
          />
          <v-toolbar-title class="text-subtitle-1 font-weight-black">
            {{ editMode ? 'EDITAR INCIDENTE' : 'REGISTRO DE INCIDENTE - SUCESO PELIGROSO' }}
          </v-toolbar-title>
          <v-spacer />
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="dialogIncidente = false"
          />
        </v-toolbar>

        <v-card-text class="pa-6 bg-slate-50">
          <v-form
            :disabled="isReadOnly"
            @submit.prevent="guardarIncidente"
          >
            <div class="field-label-min mb-4 text-orange-darken-4">
              I. IDENTIFICACIÓN DEL EVENTO
            </div>
            <v-row dense>
              <v-col
                cols="12"
                md="3"
              >
                <v-text-field
                  v-model="formIncidente.fecha"
                  label="Fecha Incidente"
                  type="date"
                  density="compact"
                  variant="outlined"
                  bg-color="white"
                  hide-details
                  class="mb-2"
                />
              </v-col>
              <v-col
                cols="12"
                md="2"
              >
                <v-text-field
                  v-model="formIncidente.hora"
                  label="Hora"
                  type="time"
                  density="compact"
                  variant="outlined"
                  bg-color="white"
                  hide-details
                  class="mb-2"
                />
              </v-col>
              <v-col
                cols="12"
                md="3"
              >
                <v-text-field 
                  v-model="formIncidente.rut" 
                  label="RUT (Sin puntos con guión)" 
                  density="compact" 
                  variant="outlined" 
                  bg-color="white" 
                  :hide-details="!rutErrorInc"
                  :error-messages="rutErrorInc"
                  class="mb-2" 
                  :loading="loadingUserLookup" 
                  placeholder="12345678-K" 
                  @blur="validarYBuscarRutInc"
                />
              </v-col>
              <v-col
                cols="12"
                md="4"
              >
                <v-text-field
                  v-model="formIncidente.nombre"
                  label="Nombre Trabajador/es"
                  density="compact"
                  variant="outlined"
                  bg-color="white"
                  hide-details
                  class="mb-2"
                  :loading="loadingUserLookup"
                />
              </v-col>
              
              <v-col
                cols="12"
                md="2"
              >
                <v-select
                  v-model="formIncidente.sexo"
                  :items="['M', 'F', 'Otro']"
                  label="Sexo"
                  density="compact"
                  variant="outlined"
                  bg-color="white"
                  hide-details
                  class="mb-2"
                />
              </v-col>
              <v-col
                cols="12"
                md="5"
              >
                <v-text-field
                  v-model="formIncidente.cargo"
                  label="Cargo"
                  density="compact"
                  variant="outlined"
                  bg-color="white"
                  hide-details
                  class="mb-2"
                />
              </v-col>
              <v-col
                cols="12"
                md="5"
              >
                <v-text-field
                  v-model="formIncidente.empresa"
                  label="Empresa"
                  density="compact"
                  variant="outlined"
                  bg-color="white"
                  hide-details
                  class="mb-2"
                />
              </v-col>
            </v-row>

            <div class="field-label-min mt-4 mb-4 text-orange-darken-4">
              II. DETALLES Y DESCRIPCIÓN
            </div>
            <v-row dense>
              <v-col
                cols="12"
                md="6"
              >
                <v-text-field
                  v-model="formIncidente.lugar"
                  label="Lugar del Incidente"
                  density="compact"
                  variant="outlined"
                  bg-color="white"
                  hide-details
                  class="mb-2"
                />
              </v-col>
              <v-col
                cols="12"
                md="6"
              >
                <v-text-field
                  v-model="formIncidente.tarea"
                  label="Tarea que desarrollaba"
                  density="compact"
                  variant="outlined"
                  bg-color="white"
                  hide-details
                  class="mb-2"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="formIncidente.descripcion"
                  label="Breve descripción de los hechos"
                  density="compact"
                  variant="outlined"
                  bg-color="white"
                  rows="2"
                  hide-details
                  class="mb-2"
                />
              </v-col>
              <v-col
                cols="12"
                md="6"
              >
                <v-textarea
                  v-model="formIncidente.causa"
                  label="Causa Raíz"
                  density="compact"
                  variant="outlined"
                  bg-color="white"
                  rows="2"
                  hide-details
                  class="mb-2"
                />
              </v-col>
              <v-col
                cols="12"
                md="6"
              >
                <v-textarea
                  v-model="formIncidente.medidas"
                  label="Medidas Correctivas"
                  density="compact"
                  variant="outlined"
                  bg-color="white"
                  rows="2"
                  hide-details
                  class="mb-2"
                />
              </v-col>
            </v-row>
            
            <v-row dense>
              <v-col
                cols="12"
                md="3"
              >
                <v-text-field
                  v-model="formIncidente.obra"
                  label="Obra"
                  density="compact"
                  variant="outlined"
                  bg-color="white"
                  hide-details
                />
              </v-col>
              <v-col
                cols="12"
                md="3"
              >
                <v-text-field
                  v-model="formIncidente.jefatura"
                  label="Jefatura Directa"
                  density="compact"
                  variant="outlined"
                  bg-color="white"
                  hide-details
                />
              </v-col>
              <v-col
                cols="12"
                md="3"
              >
                <v-text-field
                  v-model="formIncidente.administrador"
                  label="Administrador Obra"
                  density="compact"
                  variant="outlined"
                  bg-color="white"
                  hide-details
                />
              </v-col>
              <v-col
                cols="12"
                md="3"
              >
                <v-text-field
                  v-model="formIncidente.area"
                  label="Área"
                  density="compact"
                  variant="outlined"
                  bg-color="white"
                  hide-details
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-divider />
        <v-card-actions class="pa-4 bg-white">
          <v-spacer />
          <v-btn
            variant="text"
            color="slate-500"
            class="text-none font-weight-bold"
            @click="dialogIncidente = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="orange-darken-3"
            variant="elevated"
            prepend-icon="mdi-content-save"
            class="text-none font-weight-bold px-6"
            :disabled="isReadOnly"
            @click="guardarIncidente"
          >
            {{ editMode ? 'Guardar Cambios' : 'Registrar Incidente' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo para firma FES al generar informe (estándar del sistema) -->
    <FirmaDialog
      v-model="dialogFesSST"
      :pdf-url="pdfUrlParaFirma"
      :is-report="true"
      :detalle-flujo="mockDetalleFlujo"
      @firmado-directo="ejecutarGeneracionYCierre"
    />

    <!-- Overlay Loader al generar/guardar informe -->
    <v-overlay
      :model-value="loading"
      class="align-center justify-center"
      persistent
    >
      <v-progress-circular
        color="primary"
        indeterminate
        size="64"
      />
    </v-overlay>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import FirmaDialog from './FirmaDialog.vue';
import { sstService } from '@/services/sstService';
import api from '@/services/api';
import { useUserDetailStore } from '@/stores/userDetail';
import { logoBase64 } from '@/assets/logoBase64';
import logoTerracon from '@/assets/logo.png';
import QRCode from 'qrcode';

const props = defineProps({
  reportName: String,
  context: Object
});

const loading = ref(false);
const idInforme = ref(null);
const loadingUserLookup = ref(false);
const rutError = ref('');
const rutErrorInc = ref('');
const formTab = ref('one');
const expandedIdInc = ref(null);
const urlStoredPdf = ref(null);
const expandedId = ref(null);

const toggleExpand = (id) => {
  expandedId.value = expandedId.value === id ? null : id;
};

const toggleExpandInc = (id) => {
  expandedIdInc.value = expandedIdInc.value === id ? null : id;
};

// DATA MOCK / REAL
// DATA MOCK / REAL
const tasaAccidentabilidad = ref(null);
const tasaSiniestralidad = ref(null);
const indiceFrecuencia = ref(null);
const promedioTrabajadoresTerracon = ref(null);
const proyectoEjecucion = ref("");
const periodoEvaluado = ref("");
const administrador = ref("Cargando...");
const expertoAsesor = ref("Cargando...");
const diasTrabajados = ref(0);
const horasTrabajadasDia = ref(9);
const promedioTrabajadoresDia = ref(0);
const estadoInforme = ref("borrador");
const urlPdfGenerado = ref(null);
const isFinalizado = computed(() => estadoInforme.value === "finalizado" || estadoInforme.value === "TERMINADO");
const isReadOnly = computed(() => isFinalizado.value);

// Helper para validar solo enteros
const onlyIntegers = (event) => {
  if (!/[0-9]/.test(event.key)) {
    event.preventDefault();
  }
};

const parsePeriodo = (periodoStr) => {
  if (!periodoStr) return { year: new Date().getFullYear(), month: new Date().getMonth() };
  
  const str = String(periodoStr).trim();
  
  // Caso 1: YYYYMM (ej: 202603)
  if (/^\d{6}$/.test(str)) {
    return {
      year: parseInt(str.substring(0, 4)),
      month: parseInt(str.substring(4, 6)) - 1
    };
  }
  
  // Caso 2: YYYY-MM (ej: 2026-03)
  if (/^\d{4}-\d{2}$/.test(str)) {
    const p = str.split('-');
    return { year: parseInt(p[0]), month: parseInt(p[1]) - 1 };
  }

  // Caso 3: "Mes Año" (ej: "Marzo 2026")
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const parts = str.split(' ');
  if (parts.length === 2) {
    const mesIndex = meses.indexOf(parts[0].toLowerCase());
    const year = parseInt(parts[1]);
    if (mesIndex !== -1 && !isNaN(year)) {
      return { year, month: mesIndex };
    }
  }

  // Fallback
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
};

const calculateBusinessDays = (periodoStr) => {
  const { year, month } = parsePeriodo(periodoStr);
  
  let count = 0;
  const lastDay = new Date(year, month + 1, 0).getDate();
  
  for (let i = 1; i <= lastDay; i++) {
    const day = new Date(year, month, i).getDay();
    if (day !== 0 && day !== 6) count++; // Lunes a Viernes
  }
  return count;
};

const fetchReportData = async () => {
  console.log("Cargando reporte con contexto:", props.context);
  if (!props.context) return;
  loading.value = true;
  try {
    const { id_empresa, id_proyecto, id_periodo } = props.context;
    
    // 1. Obtener o crear cabecera
    console.log("Llamando a getOrCreateInforme...");
    const informe = await sstService.getOrCreateInforme(id_empresa, id_proyecto, id_periodo);
    console.log("Informe obtenido/creado:", informe);
    idInforme.value = informe.id_informe;
    estadoInforme.value = informe.estado || "borrador";
    
    // Parsear data_json para ver si tiene URL del PDF
    let dashJson = informe.data_json;
    if (typeof dashJson === "string") {
        try { dashJson = JSON.parse(dashJson); } catch(e) {}
    }
    if (dashJson && dashJson.url_pdf) {
        urlStoredPdf.value = dashJson.url_pdf;
        // Si tienes una ref para el path físico también podrías usarla
    }

    // Mapeo de datos reales desde el informe obtenido/creado
    promedioTrabajadoresDia.value = informe.promedio_trabajadores_dia || 0;
    diasTrabajados.value = calculateBusinessDays(id_periodo);
    horasTrabajadasDia.value = informe.horas_trabajadas_dia || 9;
    
    // Tasas e Índices (deben ser nulos según requerimiento)
    tasaAccidentabilidad.value = null;
    tasaSiniestralidad.value = null;
    indiceFrecuencia.value = null;
    promedioTrabajadoresTerracon.value = null;
    
    // Contextos visuales
    // Formatear periodo YYYYMM a "Mes YYYY" para vista
    if (id_periodo && id_periodo.length === 6) {
      const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
      const y = id_periodo.substring(0, 4);
      const m = parseInt(id_periodo.substring(4, 6)) - 1;
      periodoEvaluado.value = `${monthNames[m]} ${y}`;
    } else {
      periodoEvaluado.value = id_periodo;
    }
    proyectoEjecucion.value = props.context.nombre_proyecto || "Proyecto Desconocido";
    
    // Roles dinámicos
    administrador.value = ""; 
    expertoAsesor.value = "";
    
    // Carga de datos dinámicos desde data_json
    let djson = informe.data_json;
    if (typeof djson === 'string') {
      try { djson = JSON.parse(djson); } catch (e) { djson = {}; }
    }
    
    if (djson) {
      if (djson.administrador !== undefined) administrador.value = djson.administrador;
      if (djson.expertoAsesor !== undefined) expertoAsesor.value = djson.expertoAsesor;
      if (djson.observaciones) observacionesInforme.value = djson.observaciones;
      if (djson.capacitaciones) capacitaciones.value = djson.capacitaciones;
      if (djson.campanasSST) campanasSST.value = djson.campanasSST;
      if (djson.protocolosMinsal) protocolosMinsal.value = djson.protocolosMinsal;
      if (djson.auditoriasMandante) auditoriasMandante.value = djson.auditoriasMandante;
      if (djson.contratistasData) contratistasData.value = djson.contratistasData;
      if (djson.metricasCumplimiento) metricasCumplimiento.value = djson.metricasCumplimiento;
      if (djson.profesionalSST) profesionalSST.value = djson.profesionalSST;
    }
    
    // Si no venían en djson, intentamos extraerlos del equipo del proyecto
    if (!administrador.value || !expertoAsesor.value) {
      try {
        const teamsResp = await api.get('/servicio/leanglobal/obtenerEquiposProyectosMiembros', { params: { id_proyecto: id_proyecto } });
        const members = teamsResp.data || [];
        
        if (!administrador.value) {
          const admin = members.find(m => m.name_role && (m.name_role.toLowerCase().includes('administrador de contrato de terreno') || m.name_role.toLowerCase().includes('administrador')));
          if (admin) administrador.value = `${admin.name_user} ${admin.apellidos_user}`.trim();
        }
        if (!expertoAsesor.value) {
          const prev = members.find(m => m.name_role && (
            m.name_role.toLowerCase().includes('lider de prevención de riesgos') ||
            m.name_role.toLowerCase().includes('lider de prevencion') ||
            m.name_role.toLowerCase().includes('prevención') || 
            m.name_role.toLowerCase().includes('prevencion') || 
            m.name_role.toLowerCase().includes('experto') || 
            m.name_role.toLowerCase().includes('prp')
          ));
          if (prev) expertoAsesor.value = `${prev.name_user} ${prev.apellidos_user}`.trim();
        }
      } catch(e) {
        console.warn("No se pudo cargar el equipo del proyecto", e);
      }
    }
    const accidentes = await sstService.getAccidentabilidad(idInforme.value);
    if (accidentes) {
      nominaAccidentes.value = accidentes.map(a => ({
        id_accidentabilidad: a.id_accidentabilidad,
        fecha: a.fecha_suceso ? new Date(a.fecha_suceso).toISOString().split('T')[0] : '',
        empresa: a.empresa_trabajador,
        nombre: a.nombre_trabajador,
        rut: a.rut,
        sexo: a.sexo === 'O' ? 'Otro' : a.sexo,
        cargo: a.cargo,
        calificacion: a.calificacion,
        fechaCalif: a.fecha_calificacion,
        zona: a.zona_afectada,
        tipoSuceso: a.tipo_suceso,
        fechaIngreso: a.fecha_ingreso_mutual,
        fechaAlta: a.fecha_alta_mutual,
        stp_ctp: a.stp_ctp,
        diasPerdidos: a.dias_perdidos,
        descripcion: a.descripcion_hechos,
        causa: a.causa_raiz,
        medidas: a.medidas_correctivas,
        obra: a.obra_fase,
        jefatura: a.jefatura,
        administrador: a.administrador_contrato,
        area: a.area
      }));

      // Poblamos la tabla de métricas basada en los accidentes del periodo
      metricasAccidentabilidad.value = nominaAccidentes.value.map(acc => {
        const { diasPeriodo, diasAcum } = calculateAccidentDays(acc, id_periodo);
        const total = diasAcum + diasPeriodo;
        return {
          descripcion: acc.descripcion,
          jefatura: acc.jefatura,
          diasAcum: diasAcum,
          diasPeriodo: diasPeriodo,
          total: total,
          cumplimiento: calculateEvaluacionCumplimiento(total)
        };
      });
    }

    const incidentes = await sstService.getIncidentes(idInforme.value);
    if (incidentes) {
      nominaIncidentes.value = incidentes.map(i => ({
        id_incidente: i.id_incidente,
        fecha: i.fecha_incidente ? new Date(i.fecha_incidente).toISOString().split('T')[0] : '',
        hora: i.hora_incidente,
        empresa: i.empresa_trabajador,
        nombre: i.nombre_trabajador,
        rut: i.rut,
        sexo: i.sexo === 'O' ? 'Otro' : i.sexo,
        cargo: i.cargo,
        lugar: i.lugar_incidente,
        tarea: i.tarea_desarrollada,
        descripcion: i.descripcion_hechos,
        causa: i.causa_raiz,
        medidas: i.medidas_correctivas,
        area: i.area,
        obra: i.obra,
        jefatura: i.jefatura_directa,
        administrador: i.administrador_obra
      }));
    }
  } catch (err) {
    console.error("Error cargando informe:", err);
  } finally {
    loading.value = false;
  }
};

const generateAndStoreSSTPdf = async () => {
  if (!idInforme.value) return;
  try {
    loading.value = true;
    alert('Generando Informe Estadístico SST. Por favor espere...');
    
    // 1. Guardar cambios actuales de forma silenciosa
    await saveFullReport(true); 

    // 2. Generar HTML completo (ahora siempre con FES si el usuario lo solicita en informes)
    const fullHtml = getSecurityReportHtml(true, true);

    // 3. Enviar al backend (Usando servicio homologado que apunta a generate-pdf-html)
    const result = await sstService.savePDFFromHtml(idInforme.value, fullHtml);

    if (result.url_pdf) {
      urlStoredPdf.value = result.url_pdf;
      alert('Informe generado exitosamente.');
    }
  } catch (err) {
    console.error("Error al generar/guardar PDF SST:", err);
    alert("No se pudo completar la generación del informe.");
  } finally {
    loading.value = false;
  }
};

const saveFullReport = async (quiet = false) => {
  if (!idInforme.value) return;
  try {
    loading.value = true;
    const payload = {
      promedio_trabajadores_dia: promedioTrabajadoresDia.value,
      horas_trabajadas_dia: horasTrabajadasDia.value,
      horas_hombre_periodo: horasHombrePeriodo.value,
      data_json: {
        capacitaciones: capacitaciones.value,
        campanasSST: campanasSST.value,
        protocolosMinsal: protocolosMinsal.value,
        auditoriasMandante: auditoriasMandante.value,
        contratistasData: contratistasData.value,
        metricasCumplimiento: metricasCumplimiento.value,
        observaciones: observacionesInforme.value,
        profesionalSST: profesionalSST.value,
        totalMetricaAccidentabilidad: totalMetricaAccidentabilidad.value,
        indicesObra: indicesObra.value,
        url_pdf: urlStoredPdf.value,
        administrador: administrador.value,
        expertoAsesor: expertoAsesor.value
      }
    };
    await sstService.updateInforme(idInforme.value, payload);
    if (!quiet) alert("Informe guardado correctamente.");

  } catch (err) {
    console.error("Error guardando informe completo:", err);
    if (!quiet) alert("Hubo un problema al guardar los datos.");
  } finally {
    loading.value = false;
  }
};

const finalizarInforme = async () => {
  if (!idInforme.value) return;
  if (!confirm("¿Está seguro de finalizar el informe? Una vez finalizado no podrá ser editado y quedará como versión final.")) return;
  
  try {
    loading.value = true;
    
    // 1. Guardar última versión de datos
    await saveFullReport(); 
    
    // 2. Generar y Subir PDF al servidor (FES Way)
    const reportHtml = getSecurityReportHtml(true);
    const response = await api.post(`/sst/generate-pdf-html/${idInforme.value}`, { 
      htmlContent: reportHtml 
    });

    // 3. Marcar como TERMINADO
    await sstService.updateInforme(idInforme.value, { estado: 'TERMINADO', fecha_finalizacion: new Date() });
    estadoInforme.value = 'TERMINADO';
    
    alert("Informe finalizado y guardado en el servidor correctamente.");

  } catch (err) {
    console.error("Error finalizando informe:", err);
    alert("Error al finalizar el informe.");
  } finally {
    loading.value = false;
  }
};

const openStoredPdf = () => {
  if (urlStoredPdf.value) {
    let url = urlStoredPdf.value;
    // Si no es una URL absoluta, le anteponemos la base de la API
    if (!url.startsWith('http')) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      // Evitar doble slash al concatenar
      const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      const cleanPath = url.startsWith('/') ? url : '/' + url;
      url = cleanBase + cleanPath;
    }
    window.open(url, '_blank');
  } else {
    alert("No hay un PDF oficial generado aún.");
  }
};

const reabrirInforme = async () => {
  if (!idInforme.value) return;
  if (!confirm("¿Está seguro de re-abrir el informe? Esto permitirá editar los datos nuevamente.")) return;
  
  try {
    loading.value = true;
    urlStoredPdf.value = null;
    await sstService.updateInforme(idInforme.value, { estado: "borrador" });
    await saveFullReport(true);
    estadoInforme.value = "borrador";
    window.dispatchEvent(new CustomEvent('report-status-updated'));
    alert("El informe ha sido habilitado para edición.");
  } catch (err) {
    console.error("Error reabriendo informe:", err);
    alert("No se pudo re-abrir el informe.");
  } finally {
    loading.value = false;
  }
};


const getSecurityReportHtml = (withFes = false, headless = false) => {
  // 0. Dashboard / Portada
  const dashboardHtml = `
    <div class="pdf-dashboard">
      <div class="dash-header">
        <div class="dash-title">RESUMEN EJECUTIVO SST</div>
        <div class="dash-period">${periodoEvaluado.value}</div>
      </div>
      <div class="dash-main-row">
        <div class="dash-card flex-2">
          <div class="dash-label">PROYECTO</div>
          <div class="dash-value-lg">${proyectoEjecucion.value}</div>
          <div class="dash-grid-inner">
            <div class="inner-item">
              <div class="inner-label">ADMINISTRADOR</div>
              <div class="inner-val">${administrador.value}</div>
            </div>
            <div class="inner-item">
              <div class="inner-label">EXPERTO ASESOR</div>
              <div class="inner-val">${expertoAsesor.value}</div>
            </div>
          </div>
        </div>
        <div class="dash-card flex-1 tc shadow-inner">
          <div class="dash-label">CUMPLIMIENTO BONO OBRA</div>
          <div class="dash-circle-container">
             <div class="dash-circle">
               <span class="circle-main">${totalMetricaAccidentabilidad.value.cumplimiento}%</span>
             </div>
          </div>
          <div class="dash-footer-val">${totalMetricaAccidentabilidad.value.dias} DÍAS PERDIDOS</div>
        </div>
      </div>

      <div class="dash-stats-row">
        <div class="dash-stat-item">
          <div class="stat-label">INDICE FRECUENCIA</div>
          <div class="stat-val ${parseFloat(indicesObra.value[0]?.value) > 0 ? 'text-red' : ''}">${indicesObra.value[0]?.value || '0.00'}</div>
        </div>
        <div class="dash-stat-item">
          <div class="stat-label">INDICE GRAVEDAD</div>
          <div class="stat-val ${parseFloat(indicesObra.value[1]?.value) > 0 ? 'text-red' : ''}">${indicesObra.value[1]?.value || '0.00'}</div>
        </div>
        <div class="dash-stat-item">
          <div class="stat-label">TASA ACCIDENTAB.</div>
          <div class="stat-val ${parseFloat(indicesObra.value[2]?.value) > 0 ? 'text-red' : ''}">${indicesObra.value[2]?.value || '0.00'}</div>
        </div>
        <div class="dash-stat-item">
          <div class="stat-label">SINIESTRABILIDAD</div>
          <div class="stat-val">0.00</div>
        </div>
      </div>

      <div class="dash-bottom-row">
        <div class="dash-card flex-1">
          <div class="dash-label">HOMBRES MES (PROM)</div>
          <div class="dash-value-md">${promedioTrabajadoresDia?.value || 0}</div>
        </div>
        <div class="dash-card flex-1">
          <div class="dash-label">HORAS HOMBRE</div>
          <div class="dash-value-md">${(horasHombrePeriodo?.value || 0).toLocaleString()}</div>
        </div>
        <div class="dash-card flex-1">
          <div class="dash-label">ACCIDENTES CTP</div>
          <div class="dash-value-md">${totalAccidentes?.value || 0}</div>
        </div>
      </div>
    </div>
    <div style="page-break-after: always;"></div>
  `;

  // 1. Antecedentes (This section is now part of the main HTML structure, not a separate variable)

  // 2. Métricas Cumplimiento (This is now part of the main HTML structure)

  // 2.1 Métrica Accidentabilidad
  let accidHtml = '';
  metricasAccidentabilidad.value.forEach(m => {
    accidHtml += `<tr><td>${m.descripcion}</td><td>${m.jefatura}</td><td class="tc">${m.diasAcum}</td><td class="tc">${m.diasPeriodo}</td><td class="tc font-bold">${m.total}</td><td class="tc">${m.cumplimiento}%</td></tr>`;
  });

  // 3. Capacitaciones
  let capacitacionesHtml = '';
  capacitaciones.value.forEach(c => {
    capacitacionesHtml += `<tr><td>${c.nombre}</td><td>${c.grupo}</td><td class="tc">${c.horas}</td><td class="tc">${c.trabajadores}</td><td class="tc font-bold">${(c.horas * c.trabajadores).toFixed(1)}</td></tr>`;
  });

  // 4. Protocolos
  let protocolosHtml = '';
  protocolosMinsal.value.forEach(p => {
    protocolosHtml += `<tr><td>${p.nombre}</td><td class="tc">${p.aplica || '-'}</td><td class="tc">${p.cronograma || '-'}</td><td class="tc">${p.programado}</td><td class="tc">${p.real}</td><td class="tc font-bold">${calculateCumplimientoProtocolo(p)}%</td></tr>`;
  });

  // 5. Auditorias
  let auditoriasHtml = '';
  auditoriasMandante.value.forEach(a => {
    auditoriasHtml += `<tr><td>${a.nombre}</td><td class="tc">${a.estandar}%</td><td class="tc font-bold">${a.cumplimiento}%</td></tr>`;
  });

  // 6. Contratistas
  let contratistasTableHtml = '';
  empresasContratistasTable.value.forEach(item => {
    contratistasTableHtml += `<tr><td class="font-bold">${item.label}</td><td class="tr font-bold">${item.value}</td></tr>`;
  });

  // 7. Incidentes
  let incidentesHtml = '';
  if (nominaIncidentes.value.length > 0) {
    incidentesHtml = `
      <table class="report-table">
        <thead>
          <tr><th style="width:12%">Fecha</th><th style="width:25%">Nombre / Empresa</th><th style="width:30%">Descripción</th><th style="width:33%">Causa / Medidas</th></tr>
        </thead>
        <tbody>
          ${nominaIncidentes.value.map(inc => `
            <tr>
              <td class="text-xs">${displayDate(inc.fecha)}</td>
              <td class="text-xs"><strong>${inc.nombre}</strong><br>${inc.empresa}</td>
              <td class="text-xs">${inc.descripcion}</td>
              <td class="text-xs"><strong>Causa:</strong> ${inc.causa}<br><strong>Medidas:</strong> ${inc.medidas}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } else {
    incidentesHtml = `<div class="empty-box">No se registran incidentes en el periodo.</div>`;
  }

  let fesHtml = '';
  if (withFes) {
    const validationCode = idInforme.value?.substring(0,8).toUpperCase() || 'SST-' + new Date().getTime();
    fesHtml = `
      <div style="margin-top: 40pt; border-top: 2px solid #0f172a; padding-top: 20pt; page-break-inside: avoid;">
        <h3 style="font-size: 10pt; font-weight: 800; color: #0f172a; margin-bottom: 10pt; text-transform: uppercase;">Aprobado mediante Firma Electrónica Simple (FES)</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 20%; text-align: center; vertical-align: middle; border: 1px solid #e2e8f0; padding: 10pt;">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=VALIDACION-SST-${validationCode}" style="width: 80pt; height: 80pt;" />
            </td>
            <td style="width: 80%; border: 1px solid #e2e8f0; padding: 10pt; font-size: 8pt; color: #334155;">
              <div><strong>Firmante:</strong> ${profesionalSST.value || 'FIRMADO DIGITALMENTE'}</div>
              <div><strong>RUT:</strong> VALIDADO POR SESIÓN LEAN</div>
              <div><strong>Fecha y Hora:</strong> ${new Date().toLocaleString()}</div>
              <div><strong>Hash de Verificación:</strong> <span style="font-family: monospace; color: #64748b;">${validationCode}</span></div>
            </td>
          </tr>
        </table>
      </div>
    `;
  }

  const fullHtml = `
    <!DOCTYPE html>
    <head>
      <title>Informe_Seguridad_SST</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 10mm; background: #fff; color: #1e293b; line-height: 1.2; }
        @page { size: A4; margin: 0; }
        .report-header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .report-header-table td { border: 1px solid #0f172a; padding: 5px; }
        .report-header-table .logo-cell { width: 25%; text-align: center; vertical-align: middle; padding: 10px; }
        .report-header-table .title-cell { width: 50%; text-align: center; font-weight: 800; font-size: 13pt; text-transform: uppercase; }
        .report-header-table .meta-cell { width: 25%; font-size: 8pt; }
        .report-title { font-size: 16pt; font-weight: 900; margin: 15px 0; color: #0f172a; text-transform: uppercase; text-align: center; }
        .section-title { font-size: 9pt; font-weight: 800; background: #f1f5f9; padding: 5px 10px; border-left: 4px solid #0f172a; margin: 15px 0 10px 0; text-transform: uppercase; }
        .report-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 8pt; }
        .report-table th { background: #0f172a; color: #fff; border: 1px solid #0f172a; padding: 6px; text-align: left; }
        .report-table td { border: 1px solid #e2e8f0; padding: 6px; vertical-align: top; }
        .tc { text-align: center; } .tr { text-align: right; } .font-bold { font-weight: 700; } .text-xs { font-size: 7pt; } .text-red { color: #dc2626; font-weight: bold; }
        .empty-box { border: 1px dashed #cbd5e1; padding: 15px; text-align: center; color: #94a3b8; font-style: italic; font-size: 8pt; border-radius: 4px; }
        .pdf-dashboard { background: #f8fafc; border-radius: 8px; padding: 20px; border: 1px solid #e2e8f0; margin-bottom: 20px; }
        .dash-header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 5px; margin-bottom: 15px; }
        .dash-title { font-size: 14pt; font-weight: 900; }
        .dash-main-row { display: flex; gap: 15px; margin-bottom: 15px; }
        .dash-card { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; }
        .flex-1 { flex: 1; } .flex-2 { flex: 2; }
        .dash-label { font-size: 7pt; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 5px; }
        .dash-value-lg { font-size: 13pt; font-weight: 800; color: #0f172a; }
        .dash-value-md { font-size: 14pt; font-weight: 800; color: #0f172a; text-align: center; }
        .dash-circle-container { display: flex; justify-content: center; margin: 10px 0; }
        .dash-circle { width: 60pt; height: 60pt; border-radius: 50%; border: 5px solid #10b981; display: flex; align-items: center; justify-content: center; }
        .circle-main { font-size: 15pt; font-weight: 900; }
        .dash-stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 15px; }
        .dash-stat-item { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; text-align: center; }
        .dash-bottom-row { display: flex; gap: 10px; }
        .dash-grid-inner { display: flex; gap: 20px; margin-top: 10px; border-top: 1px solid #f1f5f9; padding-top: 5px; }
        .inner-label { font-size: 6pt; font-weight: 700; color: #94a3b8; }
        .inner-val { font-size: 8pt; font-weight: 600; }
      <` + `/style>
    <` + `/head>
    <body` + `>
      <table class="report-header-table">
        <tr>
          <td rowspan="4" class="logo-cell" style="width: 20%; text-align: center; vertical-align: middle; border: 1px solid #0f172a; padding: 10px;">
            <div style="height: 60pt; width: 100%; display: flex; align-items: center; justify-content: center; overflow: hidden;">
              <img src="data:image/png;base64,${logoBase64}" style="height: 100%; width: auto; max-width: 100%;" />
            </div>
          </td>
          <td class="title-cell" rowspan="2" style="width: 55%; text-align: center; font-weight: 800; font-size: 14pt; text-transform: uppercase; border: 1px solid #0f172a; padding: 10px; color: #0f172a;">
            Informe Mensual de Seguridad
          </td>
          <td class="meta-cell" style="width: 25%; font-size: 8pt; border: 1px solid #0f172a; padding: 5px;"><strong>Versión:</strong> Rev.2 marzo 2025</td>
        </tr>
        <tr>
          <td class="meta-cell" style="border: 1px solid #0f172a; padding: 5px;"><strong>Código:</strong> TPI-PRR-INF-001</td>
        </tr>
        <tr>
          <td style="border: 1px solid #0f172a; padding: 5px; font-size: 9pt;">
             <div style="margin-bottom: 2pt;"><strong>EMPRESA:</strong> Terracon Proyectos de Ingeniería</div>
             <div><strong>PROYECTO:</strong> ${proyectoEjecucion.value}</div>
          </td>
          <td class="meta-cell" style="border: 1px solid #0f172a; padding: 5px;">
             <div style="margin-bottom: 2pt;"><strong>CLIENTE:</strong> ${props.context?.nombre_empresa || 'S/I'}</div>
             <div><strong>PERIODO:</strong> ${periodoEvaluado.value}</div>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="border: 1px solid #0f172a; padding: 5px; font-size: 8pt; background: #f8fafc;">
            <strong>ADMINISTRADOR:</strong> ${administrador.value} | <strong>LIDER PREVENCIÓN:</strong> ${expertoAsesor.value}
          </td>
        </tr>
      </table>
      <div class="report-title">Informe Estadístico Mensual SST</div>
      ${dashboardHtml}
      <div class="section-title">1. RESUMEN EJECUTIVO</div>
      <div style="font-size: 9pt; border: 1px solid #e2e8f0; padding: 10pt; min-height: 40pt; border-radius: 4px;">
        ${observacionesInforme.value || 'Sin observaciones registradas.'}
      </div>
      <div class="section-title">2. CUMPLIMIENTO PROGRAMA PREVENTIVO</div>
      <table class="report-table">
        <thead><tr><th>Nombre</th><th>Cargo</th><th class="tc">Eval.</th><th class="tc">Prom.</th><th class="tc font-bold">Cumpl.</th></tr></thead>
        <tbody>
          ${metricasCumplimiento.value.map(m => `<tr><td>${m.nombre}</td><td>${m.cargo}</td><td class="tc">${m.evaluacion}</td><td class="tc">${m.promedio}%</td><td class="tc font-bold">${m.cumplimiento}</td></tr>`).join('')}
        </tbody>
      </table>
      <div class="section-title">3. ACCIDENTABILIDAD (DÍAS PERDIDOS)</div>
      <table class="report-table">
        <thead><tr><th>Descripción</th><th>Jefatura</th><th class="tc">Días Acum.</th><th class="tc">Días Mes</th><th class="tc font-bold">Total</th><th class="tc">Cumpl.%</th></tr></thead>
        <tbody>${accidHtml}</tbody>
      </table>
      <div class="section-title">4. CAPACITACIONES</div>
      <table class="report-table">
        <thead><tr><th>Capacitación</th><th>Grupo</th><th class="tc">Horas</th><th class="tc">N° Trab.</th><th class="tc font-bold">HH Total</th></tr></thead>
        <tbody>${capacitacionesHtml}</tbody>
      </table>
      <div class="section-title">5. PROTOCOLOS MINSAL</div>
      <table class="report-table">
        <thead><tr><th>Protocolo</th><th class="tc">Aplica</th><th class="tc">Estado</th><th class="tc">Prog.</th><th class="tc">Real</th><th class="tc font-bold">% Cumpl.</th></tr></thead>
        <tbody>${protocolosHtml}</tbody>
      </table>
      <div class="section-title">6. AUDITORÍAS / 7. CONTRATISTAS</div>
      <div style="display: flex; gap: 20px;">
        <div style="flex: 1;"><table class="report-table"><thead><tr><th>Auditoría</th><th class="tc">Estándar%</th><th class="tc font-bold">Cumpl.%</th></tr></thead><tbody>${auditoriasHtml}</tbody></table></div>
        <div style="flex: 1;"><table class="report-table"><tbody>${contratistasTableHtml}</tbody></table></div>
      </div>
      <div class="section-title">8. NÓMINA DE INCIDENTES</div>
      ${incidentesHtml}
      ${fesHtml}
      ${!headless ? `<scr` + `ipt>window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 700); };<` + `/script>` : ''}
    <` + `/body>
    <` + `/html>
  `;
  return fullHtml;
};

const generateAndStoreSSTPdfFes = async () => {
  if (!idInforme.value) {
    alert('No se puede generar FES: ID del informe no encontrado.');
    return;
  }
  try {
    loading.value = true;
    alert('Iniciando generación con Firma Electrónica (FES). Espere unos segundos...');
    const fullHtml = getSecurityReportHtml(true, true);
    const result = await sstService.savePDFFromHtml(idInforme.value, fullHtml);

    if (result.url_pdf) {
      // Guardamos la ruta física/url devuelta por el servidor tal cual
      urlStoredPdf.value = result.url_pdf;
      alert('SST Report GENERATED and SIGNED (FES) successfully.');
    }
  } catch (error) {
    console.error('Error generating FES PDF:', error);
    alert('Failed to generate FES signed report.');
  } finally {
    loading.value = false;
  }
};

const calculateCumplimientoProtocolo = (p) => {
  if (!p.programado || p.programado === 0) return 0;
  return Math.round((p.real / p.programado) * 100);
};

const calculateCumplimientoAuditoria = (a) => {
  if (!a.programado || a.programado === 0) return 0;
  return Math.round((a.real / a.programado) * 100);
};

const printSecurityReport = () => {
  const printWindow = window.open('', '_blank');
  const fullHtml = getSecurityReportHtml(false);
  printWindow.document.write(fullHtml);
  printWindow.document.close();
};

onMounted(() => {
  fetchReportData();
});

watch(() => props.context, () => {
  fetchReportData();
}, { deep: true });

const calculateEvaluacionCumplimiento = (totalDias) => {
  // Formula: =SI(H26>=95;100%;SI(Y(H26>79;H26<95);65%;SI(Y(H26>=65;H26<80);50%;SI(H26<=64;0%;0))))
  if (totalDias >= 95) return 100;
  if (totalDias > 79 && totalDias < 95) return 65;
  if (totalDias >= 65 && totalDias < 80) return 50;
  if (totalDias <= 64) return 0;
  return 0;
};

const getColorCumplimiento = (pct) => {
  if (pct >= 100) return 'text-green-darken-2';
  if (pct >= 50) return 'text-orange-darken-2';
  return 'text-red-darken-2';
};

const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length === 3) {
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  }
  return new Date(dateStr);
};

const calculateAccidentDays = (acc, periodoInput) => {
  if (!acc.fechaIngreso || !periodoInput) return { diasPeriodo: 0, diasAcum: 0 };
  
  const { year, month } = parsePeriodo(periodoInput);
  const startMonth = new Date(year, month, 1);
  const endMonth = new Date(year, month + 1, 0);

  const dateIngreso = parseLocalDate(acc.fechaIngreso);
  const dateAlta = acc.fechaAlta ? parseLocalDate(acc.fechaAlta) : new Date(year, month + 1, 0);

  if (!dateIngreso) return { diasPeriodo: 0, diasAcum: 0 };

  // 1. Días del Periodo (Solapamiento con el mes actual)
  const overlapStart = new Date(Math.max(dateIngreso.getTime(), startMonth.getTime()));
  const overlapEnd = new Date(Math.min(dateAlta.getTime(), endMonth.getTime()));
  
  let diasPeriodo = 0;
  if (overlapStart <= overlapEnd) {
    diasPeriodo = Math.round((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)) + 1;
  }

  // 2. Días Acumulados (Días antes del inicio del mes actual)
  const acumStart = dateIngreso;
  const acumEnd = new Date(Math.min(dateAlta.getTime(), startMonth.getTime() - (1000 * 60 * 60 * 24)));
  
  let diasAcum = 0;
  if (acumStart <= acumEnd) {
    diasAcum = Math.round((acumEnd - acumStart) / (1000 * 60 * 60 * 24)) + 1;
  }

  return { diasPeriodo, diasAcum };
};

const horasHombrePeriodo = computed(() => (diasTrabajados.value || 0) * (horasTrabajadasDia.value || 0) * (promedioTrabajadoresDia.value || 0));

const totalIncidentes = computed(() => nominaIncidentes.value.length);
const totalAccidentes = computed(() => nominaAccidentes.value.length);
const totalDiasPerdidos = computed(() => {
  // Sumar los días perdidos directamente de los datos de accidentabilidad (nómina de accidentes)
  return nominaAccidentes.value.reduce((acc, curr) => acc + (parseInt(curr.diasPerdidos) || 0), 0);
});

const metricasCumplimiento = ref([
  { nombre: 'Cristian Aguilera', cargo: 'Admin. Contrato', evaluacion: 'Mensual', promedio: 100, cumplimiento: '100%' },
  { nombre: 'Luciano Ortiz', cargo: 'Jefe Terreno', evaluacion: 'Mensual', promedio: 100, cumplimiento: '100%' },
  { nombre: 'Jaime Contreras', cargo: 'APR Líder', evaluacion: 'Mensual', promedio: 100, cumplimiento: '100%' },
]);

const metricasAccidentabilidad = ref([]);

const totalMetricaAccidentabilidad = computed(() => {
  const totalDias = metricasAccidentabilidad.value.reduce((acc, curr) => acc + (parseInt(curr.total) || 0), 0);
  
  // Formula H44: =SI(H44=0;100%;SI(Y(H44>0;H44<5);50%;SI(Y(H44>=5;H44<8);25%;SI(H44>7;0%;0))))
  let cumplimiento = 0;
  if (totalDias === 0) cumplimiento = 100;
  else if (totalDias > 0 && totalDias < 5) cumplimiento = 50;
  else if (totalDias >= 5 && totalDias < 8) cumplimiento = 25;
  else if (totalDias > 7) cumplimiento = 0;

  return {
    dias: totalDias,
    cumplimiento: cumplimiento
  };
});

const gruposCapacitacion = [
  'Prevención',
  'CPHS',
  'Organismo Administrador',
  'Proveedor',
  'Otec',
  'Otro'
];

const relatoriasCapacitacion = [
  'APR Faenas',
  'Mutual',
  'APR/CPHS'
];

const capacitaciones = ref([
  { nombre: 'Charla diaria', grupo: '', dirigido: '', horas: 0, relatoria: '', trabajadores: 0 },
  { nombre: 'Difusion HAP Semanales bajados por Enap de sus contratistas', grupo: '', dirigido: '', horas: 0, relatoria: '', trabajadores: 0 },
  { nombre: 'Curso Control riesgo laboral', grupo: '', dirigido: '', horas: 0, relatoria: '', trabajadores: 0 },
  { nombre: 'Difusion Reportes Flash Terracon', grupo: '', dirigido: '', horas: 0, relatoria: '', trabajadores: 0 },
  { nombre: 'Difusion Alerta de incidente Enap', grupo: '', dirigido: '', horas: 0, relatoria: '', trabajadores: 0 },
  { nombre: 'Difusion entrega de Buzones de Consulta y participación en faenas.', grupo: '', dirigido: '', horas: 0, relatoria: '', trabajadores: 0 },
]);

const addCapacitacion = () => {
  capacitaciones.value.push({ nombre: '', grupo: '', dirigido: '', horas: 0, relatoria: '', trabajadores: 0 });
};

const removeCapacitacion = (idx) => {
  capacitaciones.value.splice(idx, 1);
};

const totalHHCapacitacion = computed(() => {
  return capacitaciones.value.reduce((acc, curr) => acc + (Number(curr.horas || 0) * Number(curr.trabajadores || 0)), 0).toFixed(1);
});

const campanasSST = ref([
  { nombre: '', valorizacion: '', objetivo: '', hhEstimada: 0, cantidadPersonas: 0, fechaInicio: '', fechaTermino: '' }
]);

const formatCurrency = (idx) => {
  let val = campanasSST.value[idx].valorizacion.replace(/\D/g, "");
  campanasSST.value[idx].valorizacion = val.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const addCampana = () => {
  campanasSST.value.push({ nombre: '', valorizacion: '', objetivo: '', hhEstimada: 0, cantidadPersonas: 0, fechaInicio: '', fechaTermino: '' });
};

const removeCampana = (idx) => {
  if (campanasSST.value.length > 1) {
    campanasSST.value.splice(idx, 1);
  } else {
    // Si es la última, solo la limpiamos para mantener al menos un registro vacío como se pidió
    campanasSST.value[0] = { nombre: '', valorizacion: '', objetivo: '', hhEstimada: 0, cantidadPersonas: 0, fechaInicio: '', fechaTermino: '' };
  }
};

const protocolosMinsal = ref([
  { nombre: 'PSICOSOCIAL', aplica: null, cronograma: null, fechaInicio: '', programado: 0, real: 0 },
  { nombre: 'TMERT', aplica: null, cronograma: null, fechaInicio: '', programado: 0, real: 0 },
  { nombre: 'MMC', aplica: null, cronograma: null, fechaInicio: '', programado: 0, real: 0 },
  { nombre: 'PREXOR', aplica: null, cronograma: null, fechaInicio: '', programado: 0, real: 0 },
  { nombre: 'PLANESIS', aplica: null, cronograma: null, fechaInicio: '', programado: 0, real: 0 },
  { nombre: 'RADIACION UV', aplica: null, cronograma: null, fechaInicio: '', programado: 0, real: 0 }
]);

const addProtocolo = () => {
  protocolosMinsal.value.push({ nombre: '', aplica: 'NA', cronograma: 'NA', fechaInicio: '', programado: 0, real: 0 });
};

const removeProtocolo = (idx) => {
  protocolosMinsal.value.splice(idx, 1);
};



const indicesObra = computed(() => {
  const hh = Number(horasHombrePeriodo.value) || 0;
  const promTrab = Number(promedioTrabajadoresDia.value) || 0;
  
  // Para IF y TA se consideran accidentes Con Tiempo Perdido (CTP)
  const nAccidentesCTP = nominaAccidentes.value.filter(a => a.stp_ctp === 'Con Tiempo Perdido').length;
  
  // Para IG se consideran los días perdidos de los datos de accidentabilidad del periodo reportado
  const diasPerdidosPeriodo = nominaAccidentes.value.reduce((sum, m) => sum + (Number(m.diasPerdidos) || 0), 0);

  const ifPeriodo = hh > 0 ? (nAccidentesCTP * 1000000) / hh : 0;
  const igPeriodo = hh > 0 ? (diasPerdidosPeriodo * 1000000) / hh : 0;
  const taPeriodo = promTrab > 0 ? (nAccidentesCTP / promTrab) * 100 : 0;

  return [
    { label: 'ÍNDICE DE FRECUENCIA DEL PERIODO', value: ifPeriodo.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
    { label: 'ÍNDICE DE GRAVEDAD DEL PERIODO', value: igPeriodo.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
    { label: 'TASA DE ACCIDENTABILIDAD DEL PERIODO', value: taPeriodo.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
  ];
});

const nominaAccidentes = ref([
  {
    fecha: '18-11-23', empresa: 'Terracon LTDA', nombre: 'Andrés Navarro Diez', rut: '16.388.776-0', sexo: 'M',
    cargo: 'M1', calificacion: 'Aceptado', fechaCalif: '18-11-2023', zona: 'Tobillo Izquierdo', tipoSuceso: 'Accidente de Trabajo',
    fechaIngreso: '18-11-2023', fechaAlta: '28-11-2023', stp_ctp: 'Con Tiempo Perdido', diasPerdidos: 10,
    tarea: 'Retirando material a segundo nivel', lugar: 'Pasillo de alojamiento',
    descripcion: 'En momentos en que se dirigía a su habitación en el segundo piso de la casa-habitación, al subir la escalera se resbaló...',
    causa: 'Distracción en la tarea, no estar atento a las condiciones por donde transita.',
    medidas: 'Charla de difusión a la totalidad de las faenas', area: 'Fixing', obra: 'Ena-01', jefatura: 'David Lobos', administrador: 'Cristian Aguilera'
  },
  {
    fecha: '27-02-23', empresa: 'Terracon SPA', nombre: 'Gabriel Orellana Ramírez', rut: '18.888.650-4', sexo: 'M',
    cargo: 'M1', calificacion: 'Aceptado', fechaCalif: '27-02-2023', zona: 'Ojo Derecho', tipoSuceso: 'Accidente de Trabajo',
    fechaIngreso: '27-02-2023', fechaAlta: '20-03-2023', stp_ctp: 'Sin Tiempo Perdido', diasPerdidos: 0,
    tarea: 'Trasladando material de faena', lugar: 'Contenedor de residuos',
    descripcion: 'Al manipular un contenedor de residuos, éste se rompe y al momento de intentar levantarlo...',
    causa: 'La caja no tiene la resistencia necesaria para el residuo que contenía.',
    medidas: 'Se cambian los depósitos de residuos por unos de mayor resistencia.', area: 'Fixing', obra: 'Ena-01', jefatura: 'David Lobos', administrador: 'Cristian Aguilera'
  }
]);

const auditoriasMandante = ref([
  { nombre: '10 Elementos de Seguridad ENAP', estandar: 120.00, cumplimiento: 120.00 },
  { nombre: 'Carpeta de Arranque', estandar: 100.00, cumplimiento: 100.00 },
  { nombre: '594', estandar: 100.00, cumplimiento: 100.00 },
  { nombre: 'Protocolos Minsal', estandar: 100.00, cumplimiento: 100.00 },
  { nombre: 'Medioambiental ENAP', estandar: 100.00, cumplimiento: 100.00 },
]);

const addAuditoria = () => {
  auditoriasMandante.value.push({ nombre: '', estandar: 100.00, cumplimiento: 0 });
};

const removeAuditoria = (idx) => {
  auditoriasMandante.value.splice(idx, 1);
};

const contratistasData = ref({
  totalEmpresas: 1,
  trabajadores: 9,
  accidentes: 0,
  diasPerdidos: 0
});

const empresasContratistasTable = computed(() => {
  const c = contratistasData.value;
  const hh = c.trabajadores * 180;
  const ifp = hh > 0 ? (c.accidentes * 1000000) / hh : 0;
  const igp = hh > 0 ? (c.diasPerdidos * 1000000) / hh : 0;
  const ta = c.trabajadores > 0 ? (c.accidentes / c.trabajadores) * 100 : 0;

  return [
    { label: 'Total Empresas Contratistas asociadas al Contrato', value: c.totalEmpresas, key: 'totalEmpresas', type: 'manual' },
    { label: 'N° total de trabajadores asociados a empresas contratistas', value: c.trabajadores, key: 'trabajadores', type: 'manual' },
    { label: 'Horas Hombres asociadas a Contratistas', value: hh, type: 'calc' },
    { label: 'N° de accidentes del periodo', value: c.accidentes, key: 'accidentes', type: 'manual' },
    { label: 'N° de días perdidos del periodo', value: c.diasPerdidos, key: 'diasPerdidos', type: 'manual' },
    { label: 'Indice de Frecuencia del periodo', value: ifp.toLocaleString('es-CL', { minimumFractionDigits: 1, maximumFractionDigits: 1 }), type: 'calc' },
    { label: 'Indice de Gravedad del periodo', value: igp.toLocaleString('es-CL', { minimumFractionDigits: 1, maximumFractionDigits: 1 }), type: 'calc' },
    { label: 'Tasa de Accidentabilidad del periodo', value: ta.toLocaleString('es-CL', { minimumFractionDigits: 1, maximumFractionDigits: 1 }), type: 'calc' }
  ];
});

const nominaIncidentes = ref([]);

const zonasCorporales = [
  'Cabeza',
  'Ojos',
  'Oídos',
  'Boca/dientes',
  'Cuello',
  'Pecho',
  'Espalda (dorsal/lumbar)',
  'Abdomen',
  'Pelvis',
  'Hombro',
  'Brazo',
  'Mano',
  'Dedos',
  'Rodilla',
  'Pierna',
  'Tobillo',
  'Pie',
  'Dedos del pie',
  'Múltiples partes del cuerpo'
];

const profesionalSST = ref("Jaime Contreras A.");

const observacionesInforme = ref("");

// --- LOGICA DIÁLOGOS Y V2 ---
const dialogAccidente = ref(false);
const editMode = ref(false);
const formAccidente = ref({
  fecha: '', empresa: '', nombre: '', rut: '', sexo: 'M', cargo: '',
  calificacion: 'Aceptado', fechaCalif: '', zona: [], tipoSuceso: 'Accidente de Trabajo',
  fechaIngreso: '', fechaAlta: '', stp_ctp: 'Sin Tiempo Perdido', diasPerdidos: 0,
  tarea: '', lugar: '', descripcion: '', causa: '', medidas: '',
  area: '', obra: '', jefatura: '', administrador: ''
});

const validarYBuscarRut = () => {
  const rut = formAccidente.value.rut;
  if (!rut) {
    rutError.value = '';
    return;
  }
  
  // Limpiar y formatear a mayúsculas
  formAccidente.value.rut = rut.trim().toUpperCase();
  
  // Regex: 7 a 8 números, guión, y dígito (0-9 o K)
  const rutRegex = /^[0-9]{7,8}-[0-9Kk]{1}$/;
  
  if (!rutRegex.test(formAccidente.value.rut)) {
    rutError.value = 'Formato inválido: 12345678-K';
    return;
  }
  
  rutError.value = '';
  buscarUsuarioPorRut();
};

const buscarUsuarioPorRut = async () => {
  if (!formAccidente.value.rut || rutError.value) return;
  
  loadingUserLookup.value = true;
  try {
    const response = await api.get(`/usuarios/by-rut/${formAccidente.value.rut}`);
    if (response.data) {
      const user = response.data;
      // Auto-poblamiento de campos si están vacíos o si es un nuevo registro
      // Esto evita "reescribir" si el usuario ya modificó algo manualmente
      const fetchedNombre = `${user.name_frst || ''} ${user.name_sec || ''} ${user.apellido_pat || ''} ${user.apellido_mat || ''}`.trim();
      
      if (!formAccidente.value.nombre || editMode.value === false) {
        formAccidente.value.nombre = fetchedNombre;
      }
      
      if (!formAccidente.value.sexo || editMode.value === false) {
        const mappedSexo = user.sexo || (user.genero === 'Masculino' ? 'M' : user.genero === 'Femenino' ? 'F' : '');
        formAccidente.value.sexo = mappedSexo === 'O' ? 'Otro' : mappedSexo;
      }

      if (!formAccidente.value.empresa || editMode.value === false) {
        formAccidente.value.empresa = user.nombre_empresa || '';
      }

      if (!formAccidente.value.cargo || editMode.value === false) {
        formAccidente.value.cargo = user.cargo_ext || '';
      }
    }
  } catch (err) {
    console.warn("Usuario no encontrado en la base de datos central.");
  } finally {
    loadingUserLookup.value = false;
  }
};

const openDialog = (item = null) => {
  if (item) {
    editMode.value = true;
    let initialZona = [];
    if (Array.isArray(item.zona)) {
      initialZona = [...item.zona];
    } else if (typeof item.zona === 'string' && item.zona.trim() !== '') {
      initialZona = item.zona.split(',').map(s => s.trim());
    }
    let initialSexo = item.sexo;
    if (initialSexo === 'O' || initialSexo === 'Otro') {
      initialSexo = 'Otro';
    }
    formAccidente.value = { ...item, zona: initialZona, sexo: initialSexo };
  } else {
    editMode.value = false;
    formAccidente.value = {
      id_accidentabilidad: null,
      fecha: new Date().toISOString().split('T')[0],
      nombre: '', rut: '', sexo: '', cargo: '', empresa: '',
      calificacion: 'Pendiente', fechaCalif: '', zona: [], tipoSuceso: '',
      fechaIngreso: '', fechaAlta: '', stp_ctp: 'Sin Tiempo Perdido', diasPerdidos: 0,
      tarea: '', lugar: '', descripcion: '', causa: '', medidas: '',
      area: '', obra: '', jefatura: '', administrador: ''
    };
  }
  dialogAccidente.value = true;
};

const guardarAccidente = async () => {
  if (!idInforme.value) return;

  // Validación: Si es con tiempo perdido, días debe ser > 0
  if (formAccidente.value.stp_ctp === 'Con Tiempo Perdido' && formAccidente.value.diasPerdidos <= 0) {
    alert("Para casos 'Con Tiempo Perdido', el número de días perdidos debe ser mayor que cero.");
    return;
  }

  if (rutError.value) {
    alert("Por favor corrija el formato del RUT antes de guardar.");
    return;
  }
  
  try {
    loading.value = true;
    const payload = {
      id_informe: idInforme.value,
      id_accidentabilidad: formAccidente.value.id_accidentabilidad,
      nombre_trabajador: formAccidente.value.nombre,
      rut: formAccidente.value.rut,
      sexo: formAccidente.value.sexo === 'Otro' ? 'O' : formAccidente.value.sexo,
      cargo: formAccidente.value.cargo,
      empresa_trabajador: formAccidente.value.empresa,
      fecha_suceso: formAccidente.value.fecha,
      tipo_suceso: formAccidente.value.tipoSuceso,
      calificacion: formAccidente.value.calificacion,
      fecha_calificacion: formAccidente.value.fechaCalif || null,
      zona_afectada: Array.isArray(formAccidente.value.zona)
        ? formAccidente.value.zona.join(', ')
        : (formAccidente.value.zona || ''),
      fecha_ingreso_mutual: formAccidente.value.fechaIngreso || null,
      fecha_alta_mutual: formAccidente.value.fechaAlta || null,
      stp_ctp: formAccidente.value.stp_ctp,
      dias_perdidos: formAccidente.value.diasPerdidos,
      tarea_realizada: formAccidente.value.tarea,
      lugar_especifico: formAccidente.value.lugar,
      descripcion_hechos: formAccidente.value.descripcion,
      causa_raiz: formAccidente.value.causa,
      medidas_correctivas: formAccidente.value.medidas,
      obra_fase: formAccidente.value.obra,
      jefatura: formAccidente.value.jefatura,
      administrador_contrato: formAccidente.value.administrador,
      area: formAccidente.value.area
    };

    await sstService.saveAccidentabilidad(payload);
    await fetchReportData(); // Recargar lista
    dialogAccidente.value = false;
  } catch (err) {
    console.error("Error guardando accidente:", err);
  } finally {
    loading.value = false;
  }
};

const eliminarAccidente = async (item) => {
  if (!item.id_accidentabilidad) return;
  if (!confirm("¿Está seguro de eliminar este registro?")) return;
  
  try {
    loading.value = true;
    await sstService.deleteAccidentabilidad(item.id_accidentabilidad);
    await fetchReportData();
  } catch (err) {
    console.error("Error eliminando accidente:", err);
  } finally {
    loading.value = false;
  }
};

// Aux para fechas
const displayDate = (dateStr) => {
  if (!dateStr) return '';
  // Si ya tiene formato dd/mm/yyyy o similar no tocamos, 
  // pero asumimos ISO YYYY-MM-DD para compatibilidad
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

const displayMonthName = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T12:00:00');
  const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  return months[date.getMonth()];
};

// --- LOGICA INCIDENTES ---
const dialogIncidente = ref(false);
const formIncidente = ref({
  id_incidente: null,
  fecha: '', hora: '', empresa: '', nombre: '', rut: '', sexo: 'M', cargo: '',
  lugar: '', tarea: '', descripcion: '', causa: '', medidas: '',
  area: '', obra: '', jefatura: '', administrador: ''
});

const openDialogIncidente = (item = null) => {
  if (item) {
    editMode.value = true;
    let initialSexo = item.sexo;
    if (initialSexo === 'O' || initialSexo === 'Otro') {
      initialSexo = 'Otro';
    }
    formIncidente.value = { ...item, sexo: initialSexo };
  } else {
    editMode.value = false;
    formIncidente.value = {
      id_incidente: null,
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false }),
      empresa: '', nombre: '', rut: '', sexo: 'M', cargo: '',
      lugar: '', tarea: '', descripcion: '', causa: '', medidas: '',
      area: '', obra: '', jefatura: '', administrador: ''
    };
  }
  dialogIncidente.value = true;
};

const validarYBuscarRutInc = () => {
  const rut = formIncidente.value.rut;
  if (!rut) {
    rutErrorInc.value = '';
    return;
  }
  
  formIncidente.value.rut = rut.trim().toUpperCase();
  const rutRegex = /^[0-9]{7,8}-[0-9Kk]{1}$/;
  
  if (!rutRegex.test(formIncidente.value.rut)) {
    rutErrorInc.value = 'Formato inválido: 12345678-K';
    return;
  }
  
  rutErrorInc.value = '';
  buscarUsuarioPorRutInc();
};

const buscarUsuarioPorRutInc = async () => {
  if (!formIncidente.value.rut || rutErrorInc.value) return;
  
  loadingUserLookup.value = true;
  try {
    const response = await api.get(`/usuarios/by-rut/${formIncidente.value.rut}`);
    if (response.data) {
      const user = response.data;
      const fetchedNombre = `${user.name_frst || ''} ${user.name_sec || ''} ${user.apellido_pat || ''} ${user.apellido_mat || ''}`.trim();
      
      if (!formIncidente.value.nombre || editMode.value === false) {
        formIncidente.value.nombre = fetchedNombre;
      }
      
      if (!formIncidente.value.sexo || editMode.value === false) {
        const mappedSexo = user.sexo || (user.genero === 'Masculino' ? 'M' : user.genero === 'Femenino' ? 'F' : 'M');
        formIncidente.value.sexo = mappedSexo === 'O' ? 'Otro' : mappedSexo;
      }

      if (!formIncidente.value.empresa || editMode.value === false) {
        formIncidente.value.empresa = user.nombre_empresa || '';
      }

      if (!formIncidente.value.cargo || editMode.value === false) {
        formIncidente.value.cargo = user.cargo_ext || '';
      }
    }
  } catch (err) {
    console.warn("Usuario no encontrado.");
  } finally {
    loadingUserLookup.value = false;
  }
};

const guardarIncidente = async () => {
  console.log("Iniciando guardarIncidente...");
  if (!idInforme.value) {
    alert("No se puede guardar: El informe base no ha sido cargado. Por favor, espere a que la página termine de cargar o refresque.");
    return;
  }

  if (rutErrorInc.value) {
    alert("Por favor corrija el formato del RUT antes de guardar.");
    return;
  }
  
  try {
    loading.value = true;
    const payload = {
      id_informe: idInforme.value,
      id_incidente: formIncidente.value.id_incidente,
      fecha_incidente: formIncidente.value.fecha,
      hora_incidente: formIncidente.value.hora,
      empresa_trabajador: formIncidente.value.empresa,
      nombre_trabajador: formIncidente.value.nombre,
      rut: formIncidente.value.rut,
      sexo: formIncidente.value.sexo === 'Otro' ? 'O' : formIncidente.value.sexo,
      cargo: formIncidente.value.cargo,
      lugar_incidente: formIncidente.value.lugar,
      tarea_desarrollada: formIncidente.value.tarea,
      descripcion_hechos: formIncidente.value.descripcion,
      causa_raiz: formIncidente.value.causa,
      medidas_correctivas: formIncidente.value.medidas,
      area: formIncidente.value.area,
      obra: formIncidente.value.obra,
      jefatura_directa: formIncidente.value.jefatura,
      administrador_obra: formIncidente.value.administrador
    };

    console.log("Enviando payload al API:", payload);
    const result = await sstService.saveIncidente(payload);
    console.log("Respuesta de saveIncidente:", result);
    
    await fetchReportData();
    dialogIncidente.value = false;
  } catch (err) {
    console.error("Error guardando incidente:", err);
    const msg = err.response?.data?.details || err.message || "Error desconocido";
    alert("Error al guardar el incidente: " + msg);
  } finally {
    loading.value = false;
  }
};

const eliminarIncidente = async (item) => {
  if (!item.id_incidente) return;
  if (!confirm("¿Seguro de eliminar este incidente?")) return;
  try {
    loading.value = true;
    await sstService.deleteIncidente(item.id_incidente);
    await fetchReportData();
  } catch (err) {
    console.error("Error eliminando incidente:", err);
  } finally {
    loading.value = false;
  }
};

const userDetailStore = useUserDetailStore();
const dialogFesSST = ref(false);
const pdfUrlParaFirma = ref('');

const mockDetalleFlujo = computed(() => ({
  id_survey: 0,
  id_flow: 0,
  detalles_flujo: [{
    id_flow_stp: 0,
    flow_tmpl_step_orden: 1,
    id_rol: 0,
    name_rol: 'Líder SST',
    nombre_user: userDetailStore.userDetail ? `${userDetailStore.userDetail.name_frst} ${userDetailStore.userDetail.apellido_pat}` : 'Usuario',
    id_user: userDetailStore.userDetail?.id_user,
    estado: 'PENDIENTE'
  }]
}));

const abrirDialogFesSST = async () => {
  if (!idInforme.value) return;
  try {
    loading.value = true;
    
    // 1. Guardar última versión de datos
    await saveFullReport(true);
    
    // 2. Generar el PDF del reporte con FES habilitado
    const fullHtml = getSecurityReportHtml(true, true);
    
    // 3. Guardar el PDF en el servidor
    const result = await sstService.savePDFFromHtml(idInforme.value, fullHtml);
    
    if (result.url_pdf) {
      urlStoredPdf.value = result.url_pdf;
      const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
      pdfUrlParaFirma.value = BASE_URL + result.url_pdf;
      dialogFesSST.value = true;
    } else {
      alert("No se pudo generar el borrador para firma.");
    }
  } catch (err) {
    console.error("Error al preparar firma:", err);
    alert("Error al preparar la firma digital del informe.");
  } finally {
    loading.value = false;
  }
};

const ejecutarGeneracionYCierre = async () => {
  if (!idInforme.value) return;
  try {
    loading.value = true;
    
    // Marcar el informe como TERMINADO
    await sstService.updateInforme(idInforme.value, { 
      estado: 'TERMINADO', 
      fecha_finalizacion: new Date(),
      data_json: {
        capacitaciones: capacitaciones.value,
        campanasSST: campanasSST.value,
        protocolosMinsal: deRawProtocolos(protocolosMinsal.value),
        auditoriasMandante: auditoriasMandante.value,
        contratistasData: contratistasData.value,
        metricasCumplimiento: metricasCumplimiento.value,
        observaciones: observacionesInforme.value,
        profesionalSST: profesionalSST.value,
        totalMetricaAccidentabilidad: totalMetricaAccidentabilidad.value,
        indicesObra: indicesObra.value,
        url_pdf: urlStoredPdf.value,
        administrador: administrador.value,
        expertoAsesor: expertoAsesor.value
      }
    });
    
    estadoInforme.value = 'TERMINADO';
    window.dispatchEvent(new CustomEvent('report-status-updated'));
    alert("Informe firmado, generado y finalizado con éxito.");
  } catch (err) {
    console.error("Error al finalizar y generar informe con FES:", err);
    alert("No se pudo completar la finalización del informe.");
  } finally {
    loading.value = false;
  }
};

const deRawProtocolos = (pVal) => {
  // Asegura retornar el valor correcto de protocolosMinsal
  return pVal;
};

async function hashSHA256(texto) {
  const encoder = new TextEncoder();
  const data = encoder.encode(texto);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
</script>

<style scoped>

/* Estilos para Impresión PDF */


@media print {
  @page {
    size: A4 portrait; 
    margin: 10mm; 
  }
  
  /* OCULTAR TODO EL SHELL DE LA APLICACIÓN Y OVERLAYS */
  nav, .v-navigation-drawer, .v-app-bar, .v-footer, .v-system-bar, 
  .v-overlay-container, .v-overlay, .no-print, .header-gradient, 
  .v-tabs, .header-fijo, .v-btn, .footer-fijo, .v-card-actions, 
  .field-label-min, .v-tabs-window, .content-scroller > div:not(.print-view),
  .v-main__scroller { 
    display: none !important; 
  }

  /* RESET DE CONTENEDORES */
  body, html { background: white !important; margin: 0 !important; padding: 0 !important; }
  .v-application, .v-main { background: white !important; padding: 0 !important; margin: 0 !important; }
  .formulario-moderno { background: white !important; height: auto !important; overflow: visible !important; display: block !important; }
  .content-scroller { padding: 0 !important; background: white !important; overflow: visible !important; height: auto !important; position: static !important; }
  
  /* FORZAR COLORES */
  * { 
    -webkit-print-color-adjust: exact !important; 
    print-color-adjust: exact !important; 
  }

  /* VISTA DE IMPRESIÓN */
  .print-view { 
    display: block !important; 
    visibility: visible !important;
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
    font-family: 'Inter', sans-serif;
    background: white !important;
  }
  
  .pdf-header { 
    display: flex !important;
    border: 1.5px solid #000; 
    border-radius: 0; 
    overflow: hidden; 
    height: 70px; 
    margin-bottom: 0;
  }
  .header-logo { width: 100px; border-right: 1.5px solid #000; display: flex; align-items: center; justify-content: center; padding: 5px; }
  .logo-img { max-height: 45px; width: auto; }
  .header-titles { flex-grow: 1; border-right: 1.5px solid #000; display: flex; flex-direction: column; justify-content: center; text-align: center; }
  .main-title { font-size: 1.1rem; font-weight: 900; color: #000; line-height: 1.1; }
  .sub-title { font-size: 0.7rem; font-weight: 700; color: #333; }
  .header-meta { width: 180px; display: flex; flex-direction: column; }
  .meta-row { flex: 1; display: flex; align-items: center; padding: 0 8px; font-size: 0.6rem; border-bottom: 1px solid #000; }
  .meta-row:last-child { border-bottom: none; }
  .meta-label { font-weight: 800; width: 45px; }
  
  .pdf-subheader { 
    display: flex !important; 
    border: 1.5px solid #000; 
    border-top: none; 
    background: #fff; 
    margin-bottom: 15px; 
  }
  .subheader-box { flex: 1; padding: 4px 10px; border-right: 1.5px solid #000; }
  .subheader-box:last-child { border-right: none; }
  .sh-label { font-size: 0.55rem; font-weight: 800; color: #555; text-transform: uppercase; }
  .sh-value { font-size: 0.7rem; font-weight: 700; color: #000; }

  .pdf-section-title { 
    background: #eee !important; 
    color: #000 !important; 
    border: 1px solid #000;
    padding: 3px 8px; 
    font-size: 0.7rem; 
    font-weight: 900; 
    margin-bottom: 4px; 
  }

  .pdf-grid-4 { 
    display: grid !important; 
    grid-template-columns: repeat(4, 1fr); 
    border: 1px solid #000; 
  }
  .grid-item { border: 0.5px solid #000; padding: 4px 8px; }

  .pdf-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
  .pdf-table th { background: #f0f0f0 !important; border: 1px solid #000; padding: 4px; font-size: 0.6rem; font-weight: 800; }
  .pdf-table td { border: 1px solid #000; padding: 3px 6px; font-size: 0.65rem; color: #000; }
  
  .pdf-signatures { margin-top: 50px; display: flex; justify-content: space-around; page-break-inside: avoid; }
  .signature-box { width: 40%; text-align: center; }
  .sig-line { border-top: 1px solid #000; margin-bottom: 5px; }
  .sig-name { font-size: 0.75rem; font-weight: 800; }
  .sig-role { font-size: 0.6rem; color: #444; }
}

.orange-square-icon { width: 42px; height: 42px; background: #e65100; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 1.1rem; font-style: italic; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2); }
.border-orange-600 { border-bottom: 4px solid #ea580c !important; }
.bg-header-dark { background-color: #0f172a !important; }
.text-orange-500 { color: #f97316 !important; }
.formulario-moderno { font-family: 'Inter', sans-serif; color: #1e293b; height: 100dvh; display: flex; flex-direction: column; overflow: hidden; }
.content-scroller { scroll-behavior: smooth; padding: 24px; background-color: #f8fafc; }
.header-gradient { background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); }
.tab-modern { text-transform: none; font-weight: 700; font-size: 0.75rem; color: rgba(255,255,255,0.7) !important; }
.tab-modern.v-tab--selected { color: white !important; border-bottom: 2px solid white; }
.field-label-min { font-size: 0.65rem; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
.border-soft { border: 1px solid #e2e8f0 !important; }
.modern-input-min :deep(.v-field) { background-color: #f1f5f9; border-radius: 8px; font-size: 0.8rem; }
.hht-input-field { width: 55px; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px 6px; font-weight: bold; background: white; }
.modern-table-min { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
.modern-table-min thead th { background-color: #f8fafc; font-size: 0.7rem !important; font-weight: 800; color: #475569 !important; height: 36px !important; text-transform: uppercase; border-bottom: 2px solid #e2e8f0 !important; }
.modern-table-min tbody td { font-size: 0.8rem !important; color: #334155; }
.custom-input-table { font-size: 0.8rem !important; }
.custom-input-table :deep(.v-field__input) {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  min-height: 28px !important;
  font-size: 0.8rem !important;
  display: flex !important;
  align-items: center !important;
}
.custom-input-table :deep(.v-input__details) { display: none !important; }
.custom-input-table :deep(.v-field__field) { align-items: center !important; }
.custom-input-table :deep(.v-field) { border-radius: 0 !important; }

/* Estilos de Detalle V2 (Homologados) */
.v2-detail-box { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; display: flex; flex-direction: column; gap: 8px; }
.v2-label { font-size: 0.6rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1; }
.v2-value { font-size: 0.75rem; font-weight: 700; color: #334155; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px; margin-bottom: 2px; }
.v2-value:last-child { border-bottom: none; }
.hover-bg:hover { background-color: #f8fafc; transition: background 0.2s ease; }

.fes-otp-mask :deep(input) {
  -webkit-text-security: disc;
  text-security: disc;
}
</style>
