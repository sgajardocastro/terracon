<template>
  <div class="auditoria-legal-app d-flex flex-column bg-slate-50 overflow-hidden">
    <!-- Panel GPS (Solo en Lista de Verificación) -->
    <v-fade-transition>
      <v-btn
        v-if="activeTab === 'audit' && !showGpsPanel"
        color="slate-900"
        icon="mdi-map-marker-path"
        size="large"
        elevation="8"
        class="fixed-gps-btn border-2 border-white"
        @click="showGpsPanel = true"
      />
    </v-fade-transition>

    <v-fade-transition>
      <v-card 
        v-if="activeTab === 'audit' && showGpsPanel" 
        width="320" 
        class="fixed-gps-panel rounded-2xl border-soft shadow-2xl overflow-hidden"
        :style="gpsStyle"
      >
        <v-sheet 
          class="bg-slate-900 pa-4 text-white d-flex align-center cursor-move" 
          @mousedown="startDrag"
        >
          <v-icon
            icon="mdi-cursor-move"
            class="mr-2"
            color="orange"
            size="18"
          />
          <span class="font-black text-[11px] uppercase tracking-widest pointer-events-none">AVANCE DE AUDITORÍA</span>
          <v-spacer class="pointer-events-none" />
          <v-btn
            icon="mdi-close"
            variant="text"
            size="x-small"
            color="white"
            @mousedown.stop
            @click="showGpsPanel = false"
          />
        </v-sheet>
        <v-card-text class="pa-4 bg-slate-50">
          <div class="d-flex justify-space-between align-center mb-3">
            <span class="text-[10px] font-black text-slate-400">PROGRESO TOTAL</span>
            <span class="text-[11px] font-black text-slate-900">{{ stats.evaluated }}/{{ stats.totalItems }}</span>
          </div>
          <v-progress-linear
            :model-value="stats.percent"
            color="orange"
            height="6"
            rounded
            class="mb-4"
          />
          <div class="gps-grid-modern">
            <div
              v-for="g in auditGroups"
              :key="g.id"
              class="gps-box-modern"
              :class="getSegmentStatus(g)"
              @click="scrollToSegment(g.id)"
            >
              {{ g.num.replace('S', '') }}
            </div>
          </div>
          <v-divider class="my-4" />
          <v-btn
            block
            size="small"
            variant="tonal"
            color="slate-700"
            class="text-[10px] font-black rounded-lg"
            @click="showGpsPanel = false"
          >
            OCULTAR PANEL
          </v-btn>
        </v-card-text>
      </v-card>
    </v-fade-transition>

    <!-- Header Refinado Homologado -->
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
          icon="mdi-shield-check-outline"
          color="white"
          size="24"
          class="mr-3"
        />
        <div class="flex-grow-1">
          <h2 class="text-subtitle-2 font-weight-black text-white letter-spacing-tight uppercase">
            AUDITORÍA LEGAL SST - ESTRUCTURA OFICIAL DE VERIFICACIÓN 2026
          </h2>
        </div>
        <div class="d-flex align-center ga-4 text-white">
          <div class="d-flex align-center bg-white/10 rounded-xl px-3 py-1 border border-white/20">
            <v-progress-circular 
              :model-value="stats.percent" 
              :size="32" 
              :width="3" 
              color="orange-lighten-2"
              class="mr-3"
            >
              <span class="text-[8px] font-black">{{ stats.percent }}%</span>
            </v-progress-circular>
            <div class="text-left">
              <div class="text-[9px] font-black text-blue-100 uppercase opacity-70 leading-none">
                PROGRESO
              </div>
              <div class="text-[10px] font-bold leading-none mt-1">
                {{ stats.evaluated }}/{{ stats.totalItems }}
              </div>
            </div>
          </div>

          <div class="text-right d-none d-md-block opacity-80">
            <div class="text-[10px] font-black text-blue-200 uppercase opacity-70">
              TRAMO MULTA
            </div>
            <div class="text-caption font-bold leading-none">
              {{ tramoActual }} TRAB.
            </div>
          </div>
          
          <v-chip
            v-if="isReadOnly"
            color="orange-darken-3"
            class="px-6 font-weight-black shadow-sm"
            prepend-icon="mdi-lock-outline"
            variant="elevated"
          >
            FINALIZADO - SOLO LECTURA
          </v-chip>

          <v-btn
            v-if="isReadOnly"
            color="blue-darken-3"
            variant="elevated"
            prepend-icon="mdi-lock-open-outline"
            size="small"
            class="text-none font-weight-bold rounded-lg px-4 shadow-sm"
            :loading="loadingAudit"
            @click="reabrirInforme"
          >
            Re-abrir para Edición
          </v-btn>



          <v-btn
            v-if="rawAuditData.url_pdf"
            color="red-darken-3"
            variant="elevated"
            prepend-icon="mdi-file-pdf-box"
            size="small"
            class="text-none font-weight-bold text-white rounded-lg px-4 shadow-sm"
            @click="openStoredPdf"
          >
            Ver PDF Oficial
          </v-btn>

          <v-btn
            v-if="!isReadOnly"
            color="white"
            variant="elevated"
            prepend-icon="mdi-content-save"
            size="small"
            class="text-none font-weight-bold rounded-lg px-4 shadow-sm"
            :loading="loadingAudit"
            @click="saveAudit"
          >
            Guardar Avance
          </v-btn>

          <v-btn
            v-if="!isReadOnly"
            color="blue-grey-darken-4"
            variant="elevated"
            prepend-icon="mdi-lock-check"
            size="small"
            class="text-none font-weight-bold rounded-lg px-4 text-white shadow-sm"
            :loading="loadingAudit"
            @click="closeInforme"
          >
            Finalizar y Firmar (FES)
          </v-btn>
        </div>
      </div>
      <v-tabs
        v-model="activeTab"
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
          </v-icon> Resultados
        </v-tab>
        <v-tab
          value="audit"
          class="tab-modern"
        >
          <v-icon
            start
            size="14"
          >
            mdi-clipboard-list-outline
          </v-icon> Lista de Verificación
        </v-tab>
      </v-tabs>
    </v-sheet>

    <div class="flex-grow-1 overflow-y-auto custom-scrollbar bg-[#f8fafc] content-scroller">
      <v-tabs-window
        v-model="activeTab"
        class="pa-6"
      >
        <v-tabs-window-item value="dash">
          <div class="max-w-[1280px] mx-auto py-4">
            <!-- Fila 1: Resumen Ejecutivo (Top) -->
            <v-row class="mb-6">
              <!-- Bloque Izquierdo: Métricas Globales -->
              <v-col
                cols="12"
                md="8"
              >
                <v-card
                  variant="outlined"
                  class="rounded-xl bg-white border-slate-200 overflow-hidden h-100"
                  elevation="2"
                >
                  <div class="pa-8">
                    <v-row align="center">
                      <v-col
                        cols="12"
                        md="5"
                        class="d-flex flex-column align-center justify-center border-r"
                      >
                        <div class="text-overline font-black text-slate-400 mb-6 tracking-widest">
                          CUMPLIMIENTO GLOBAL
                        </div>
                        <v-progress-circular
                          :model-value="stats.cumplePct"
                          :size="180"
                          :width="15"
                          :color="stats.cumplePct > 85 ? 'success' : (stats.cumplePct > 55 ? 'warning' : 'error')"
                        >
                          <div class="text-center">
                            <div class="text-h3 font-black text-slate-800 tracking-tighter">
                              {{ Math.round(stats.cumplePct) }}%
                            </div>
                            <div class="text-caption font-bold text-slate-400 uppercase leading-none">
                              ÓPTIMO
                            </div>
                          </div>
                        </v-progress-circular>
                        <v-chip
                          color="success"
                          size="small"
                          class="mt-6 font-weight-black"
                          variant="flat"
                        >
                          RESUMEN VIGENTE
                        </v-chip>
                      </v-col>

                      <v-col
                        cols="12"
                        md="7"
                        class="px-8"
                      >
                        <div class="text-overline font-black text-slate-400 mb-6 tracking-widest">
                          RESUMEN DE REQUISITOS
                        </div>
                        <div class="d-flex flex-column ga-3">
                          <div class="d-flex align-center justify-space-between pa-3 rounded-lg border bg-white shadow-sm">
                            <div class="d-flex align-center">
                              <v-icon
                                icon="mdi-check-circle"
                                color="success"
                                class="mr-3"
                              /><span class="text-caption font-black text-slate-600 uppercase">CUMPLE</span>
                            </div>
                            <span class="text-h6 font-black text-slate-800">{{ stats.cumple }}</span>
                          </div>
                          <div class="d-flex align-center justify-space-between pa-3 rounded-lg border bg-white shadow-sm">
                            <div class="d-flex align-center">
                              <v-icon
                                icon="mdi-close-circle"
                                color="error"
                                class="mr-3"
                              /><span class="text-caption font-black text-slate-600 uppercase">NO CUMPLE</span>
                            </div>
                            <span class="text-h6 font-black text-red-600">{{ stats.noCumple }}</span>
                          </div>
                          <div class="d-flex align-center justify-space-between pa-3 rounded-lg border bg-white shadow-sm">
                            <div class="d-flex align-center">
                              <v-icon
                                icon="mdi-minus-circle"
                                color="slate-300"
                                class="mr-3"
                              /><span class="text-caption font-black text-slate-600 uppercase">NO APLICA / OTROS</span>
                            </div>
                            <span class="text-h6 font-black text-slate-400">{{ stats.noAplica }}</span>
                          </div>
                        </div>
                      </v-col>
                    </v-row>
                  </div>
                </v-card>
              </v-col>

              <!-- Bloque Derecho: Financiero (Mismo alto que el anterior) -->
              <v-col
                cols="12"
                md="4"
              >
                <v-card
                  class="rounded-xl overflow-hidden h-100 shadow-lg"
                  elevation="4"
                  style="background-color: #0f172a; color: white;"
                >
                  <v-card-text class="pa-8 d-flex flex-column h-100">
                    <div class="text-overline font-black text-orange-400 tracking-widest mb-8">
                      VALORIZACIÓN DE RIESGO
                    </div>
                    
                    <div class="d-flex align-center bg-white/5 pa-6 rounded-xl border border-white/10 mb-8">
                      <v-icon
                        icon="mdi-scale-balance"
                        color="orange-accent-2"
                        size="40"
                        class="mr-4"
                      />
                      <div>
                        <div class="text-[10px] font-black opacity-40 uppercase tracking-widest">
                          SANCIÓN ESTIMADA
                        </div>
                        <div class="text-h4 font-black text-white italic leading-none">
                          {{ stats.totalUTM }} <span class="text-subtitle-1">UTM</span>
                        </div>
                      </div>
                    </div>

                    <!-- Nuevo: Valor UTM -->
                    <div class="d-flex align-center bg-white/5 pa-6 rounded-xl border border-white/10 mb-8 mt-n4">
                      <v-icon
                        icon="mdi-currency-usd"
                        color="orange-accent-2"
                        size="40"
                        class="mr-4"
                      />
                      <div>
                        <div class="text-[10px] font-black opacity-40 uppercase tracking-widest">
                          VALOR UTM (CLP) al {{ utmDate }}
                        </div>
                        <div class="text-h4 font-black text-white italic leading-none">
                          $ {{ valorUTM.toLocaleString() }}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div class="text-caption font-black text-orange-400/60 uppercase mb-2">
                        COSTO ESTIMADO EN CLP
                      </div>
                      <div class="text-h3 font-black text-white tracking-tighter mb-1">
                        $ {{ stats.totalCosto.toLocaleString() }}
                      </div>
                      <div class="text-[10px] font-bold text-slate-400 italic">
                        Fuente: {{ utmSource }} <span v-if="utmDate">({{ utmDate }})</span>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- Fila 2: Panel Técnico de Normativas (Dark Section) -->
            <v-card
              variant="flat"
              class="rounded-xl overflow-hidden"
              elevation="4"
              style="background-color: #0f172a; color: white;"
            >
              <div class="pa-8">
                <div class="text-overline font-black text-orange-400 mb-8 tracking-widest border-b border-white/10 pb-4">
                  CUMPLIMIENTO POR PUNTO DE EVALUACIÓN (17 PUNTOS)
                </div>
                <v-row>
                  <v-col
                    v-for="norm in normativaStats.filter(n => n.divisor > 0)"
                    :key="norm.id"
                    cols="12"
                    md="6"
                    class="pa-4"
                  >
                    <div class="mb-4">
                      <div class="d-flex justify-space-between align-center mb-2">
                        <span class="text-subtitle-2 font-black text-white uppercase tracking-tight">
                          <span class="text-orange-400 mr-2">{{ norm.num }}</span> {{ norm.norma }}
                        </span>
                        <div class="d-flex align-center ga-3 font-mono">
                          <span class="text-[10px] opacity-50">CUMPLE: <span class="text-green-accent-2">{{ norm.cumple }}</span></span>
                          <span class="text-[10px] opacity-50">TOTAL: {{ norm.divisor }}</span>
                          <span class="text-subtitle-2 font-black text-white">{{ norm.pct }}%</span>
                        </div>
                      </div>
                      <v-progress-linear
                        :model-value="norm.pct"
                        height="6"
                        rounded
                        bg-color="white"
                        bg-opacity="0.1"
                        :color="norm.pct > 85 ? 'green-accent-2' : (norm.pct > 60 ? 'orange-accent-2' : 'red-accent-2')"
                      />
                      <div
                        v-if="norm.noCumple > 0"
                        class="mt-4 pa-4 rounded-xl bg-red-900/10 border border-red-500/20"
                      >
                        <div class="text-[10px] font-black text-red-400 uppercase mb-3 d-flex align-center tracking-widest">
                          <v-icon
                            icon="mdi-alert-circle-outline"
                            size="14"
                            class="mr-1"
                          />
                          PLAN DE RESOLUCIÓN
                        </div>
                        <v-row dense>
                          <v-col
                            v-for="inc in norm.incumplimientos"
                            :key="inc.dt_code"
                            cols="12"
                            class="mb-3 border-b border-white/5 last:border-0 pb-2"
                          >
                            <div class="text-[11px] font-black text-white mb-1 uppercase tracking-tighter">
                              CÓDIGO: {{ inc.dt_code }}
                            </div>
                            <div class="d-flex ga-4 text-[10px] font-bold text-orange-200/80 mb-2 italic">
                              <span><v-icon
                                size="12"
                                icon="mdi-account-star"
                                class="mr-1"
                              />{{ inc.responsable || 'Sin responsable' }}</span>
                              <span><v-icon
                                size="12"
                                icon="mdi-calendar-clock"
                                class="mr-1"
                              />{{ inc.fecha_inicio_resolucion || '-' }} / {{ inc.fecha_fin_resolucion || '-' }}</span>
                            </div>
                            <div class="text-caption text-slate-300 italic opacity-80 pl-3 border-l-2 border-slate-700 leading-tight">
                              {{ inc.desc_resolucion || 'Sin descripción de resolución registrada.' }}
                            </div>
                          </v-col>
                        </v-row>
                      </div>
                    </div>
                  </v-col>
                </v-row>
              </div>
            </v-card>
          </div>
        </v-tabs-window-item>
        <v-tabs-window-item value="audit">
          <div class="max-w-[1200px] mx-auto">
            <!-- Loader Progresivo -->

            <div
              v-for="(group, gIdx) in visibleGroups"
              :id="group.id"
              :key="group.id"
              class="mb-8 group-transition"
            >
              <v-card
                class="rounded-xl border-soft overflow-hidden bg-white"
                elevation="0"
              >
                <v-sheet
                  class="pa-4 relative border-b-4 border-orange-600"
                  style="background-color: #0f172a !important;"
                >
                  <div class="d-flex align-center">
                    <div class="orange-square-icon mr-4">
                      {{ group.num }}
                    </div>
                    <div class="flex-grow-1">
                      <div
                        class="text-[11px] font-black uppercase tracking-wider leading-none mb-1"
                        style="color: #f97316 !important;"
                      >
                        {{ group.generic_desc }}
                      </div>
                      <div class="text-[13px] font-black text-white uppercase italic tracking-tighter leading-tight opacity-90">
                        {{ group.legal_body }}
                      </div>
                    </div>
                  </div>
                </v-sheet>
                <v-card-text class="pa-0">
                  <div
                    v-for="(item, iIdx) in group.items"
                    :key="iIdx" 
                    class="pa-6 border-b last:border-0 hover-bg transition-all" 
                    :class="{ 'bg-orange-50/30 border-l-[6px] border-l-orange-500': item.status === 'PENDIENTE' }"
                  >
                    <v-row>
                      <v-col
                        cols="12"
                        md="7"
                      >
                        <div class="d-flex align-center ga-2 mb-3">
                          <span class="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-black text-slate-500 uppercase">CÓDIGO DT: {{ item.dt_code }}</span>
                          <v-chip
                            v-if="item.status === 'PENDIENTE'"
                            size="x-small"
                            color="orange"
                            variant="flat"
                            class="font-weight-bold px-2"
                          >
                            PENDIENTE
                          </v-chip>
                        </div>
                        <h4 class="text-subtitle-1 font-weight-black text-slate-800 mb-2 leading-tight">
                          {{ item.description }}
                        </h4>
                        <div
                          v-if="item.criterio"
                          class="pa-4 rounded-xl bg-blue-50/50 border border-blue-100/50 mb-4"
                        >
                          <div class="d-flex ga-3">
                            <v-icon
                              icon="mdi-information-outline"
                              color="blue-darken-2"
                              size="20"
                            />
                            <div>
                              <div class="text-[9px] font-black text-blue-800 uppercase tracking-widest mb-1">
                                Criterio de Verificación
                              </div>
                              <div class="text-caption font-medium text-blue-900 line-height-tight">
                                {{ item.criterio }}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="field-label-min">
                          Observaciones en terreno
                        </div>
                        <v-textarea
                          v-model="item.observations"
                          :readonly="isReadOnly"
                          placeholder="Ingrese Observaciones..."
                          variant="solo-filled"
                          flat
                          density="compact"
                          rows="2"
                          hide-details
                          class="modern-input-min mb-4"
                        />

                        <!-- CAMPOS ADICIONALES PARA NO CUMPLE -->
                        <v-expand-transition>
                          <div
                            v-if="item.status === 'NO CUMPLE'"
                            class="pa-4 rounded-xl bg-red-50 border border-red-100 mt-2"
                          >
                            <div class="text-[10px] font-black text-red-800 uppercase tracking-widest mb-3">
                              PLAN DE RESOLUCIÓN (INCUMPLIMIENTO)
                            </div>
                            <v-row dense>
                              <v-col
                                cols="12"
                                md="6"
                              >
                                <div class="field-label-min">
                                  Responsable
                                </div>
                                <v-select
                                  v-model="item.responsable"
                                  :items="usuarios"
                                  :readonly="isReadOnly"
                                  density="compact"
                                  variant="solo-filled"
                                  flat
                                  placeholder="Seleccione..."
                                  class="modern-input-min"
                                  hide-details
                                />
                              </v-col>
                              <v-col
                                cols="12"
                                md="3"
                              >
                                <div class="field-label-min">
                                  Fecha Inicio
                                </div>
                                <v-text-field
                                  v-model="item.fecha_inicio_resolucion"
                                  type="date"
                                  :readonly="isReadOnly"
                                  density="compact"
                                  variant="solo-filled"
                                  flat
                                  class="modern-input-min"
                                  hide-details
                                />
                              </v-col>
                              <v-col
                                cols="12"
                                md="3"
                              >
                                <div class="field-label-min">
                                  Fecha Fin
                                </div>
                                <v-text-field
                                  v-model="item.fecha_fin_resolucion"
                                  type="date"
                                  :readonly="isReadOnly"
                                  density="compact"
                                  variant="solo-filled"
                                  flat
                                  class="modern-input-min"
                                  hide-details
                                />
                              </v-col>
                              <v-col
                                cols="12"
                                class="mt-2"
                              >
                                <div class="field-label-min">
                                  Breve descripción de la resolución
                                </div>
                                <v-textarea
                                  v-model="item.desc_resolucion"
                                  :readonly="isReadOnly"
                                  placeholder="Cómo se resolverá..."
                                  variant="solo-filled"
                                  flat
                                  density="compact"
                                  rows="2"
                                  hide-details
                                  class="modern-input-min"
                                />
                              </v-col>
                            </v-row>
                          </div>
                        </v-expand-transition>
                      </v-col>
                      <v-col
                        cols="12"
                        md="5"
                        class="pl-md-8 border-l-md border-slate-100"
                      >
                        <div class="field-label-min mb-2">
                          Calificación de cumplimiento
                        </div>
                        <div class="d-flex ga-2 mb-4">
                          <button
                            v-for="v in ['CUMPLE', 'NO CUMPLE', 'NO APLICA']"
                            :key="v"
                            class="btn-calif flex-1"
                            :class="[v.toLowerCase().replace(' ', '-'), { 'active': item.status === v, 'opacity-50 cursor-not-allowed': isReadOnly }]"
                            @click="!isReadOnly && updateItemStatus(item, v)"
                          >
                            <span class="truncate">{{ v }}</span>
                          </button>
                        </div>
                        <v-card
                          class="rounded-xl border-soft pa-4 mb-4 bg-slate-50/50"
                          elevation="0"
                        >
                          <div class="d-flex justify-space-between align-center mb-2">
                            <span class="text-[10px] font-bold text-slate-400 uppercase">Indicador:</span>
                            <span class="text-[11px] font-black text-slate-800 uppercase">{{ item.status === 'NO CUMPLE' ? 'CON INFRACCIÓN' : 'SIN INFRACCIÓN' }}</span>
                          </div>
                          <div class="d-flex justify-space-between align-center mb-2">
                            <span class="text-[10px] font-bold text-slate-400 uppercase">Tipo / Lista:</span>
                            <span class="text-[11px] font-black text-slate-800 uppercase">{{ item.norm_type }} / {{ item.status }}</span>
                          </div>
                          <v-divider class="my-2 opacity-50" />
                          <div class="d-flex justify-space-between align-center">
                            <span class="text-[10px] font-black text-slate-400 uppercase italic">Multa UTM Final:</span>
                            <span
                              class="text-subtitle-2 font-black italic tracking-tighter"
                              :class="item.final_utm > 0 ? 'text-red-600' : 'text-slate-300'"
                            >{{ item.final_utm }} UTM</span>
                          </div>
                        </v-card>
                        <v-row
                          v-if="!isReadOnly"
                          dense
                        >
                          <v-col cols="6">
                            <v-btn
                              block
                              height="48"
                              variant="text"
                              class="rounded-xl action-btn camera-btn"
                              @click="triggerUpload(item, 'CAMERA')"
                            >
                              <v-icon
                                icon="mdi-camera-outline"
                                class="mr-2"
                                size="20"
                              />
                              CÁMARA
                            </v-btn>
                          </v-col>
                          <v-col cols="6">
                            <v-btn
                              block
                              height="48"
                              variant="text"
                              class="rounded-xl action-btn docs-btn"
                              @click="triggerUpload(item, 'DOCS')"
                            >
                              <v-icon
                                icon="mdi-attachment"
                                class="mr-2"
                                size="20"
                              />
                              DOCS
                            </v-btn>
                          </v-col>
                        </v-row>

                        <!-- Visualización de Evidencia -->
                        <div
                          v-if="item.evidence && item.evidence.length > 0"
                          class="mt-4"
                        >
                          <div class="text-[10px] font-black text-slate-400 uppercase mb-2">
                            Evidencia adjunta
                          </div>
                          <div class="evidence-grid">
                            <div
                              v-for="(file, idx) in item.evidence"
                              :key="`${file.id_doc || file.name_doc_interno || 'file'}-${idx}`"
                              class="evidence-card"
                              :class="{ 'is-image': isImageFile(file), 'is-doc': !isImageFile(file) }"
                              @click="openFile(file)"
                            >
                              <v-btn
                                v-if="!isReadOnly"
                                icon="mdi-close"
                                size="x-small"
                                variant="flat"
                                color="red-lighten-4"
                                class="evidence-remove-btn"
                                @click.stop="removeEvidence(item, idx)"
                              />

                              <template v-if="isImageFile(file)">
                                <img
                                  :src="getFileUrl(file)"
                                  :alt="getFileName(file)"
                                  class="evidence-image"
                                >
                                <div class="evidence-meta">
                                  <v-icon
                                    size="14"
                                    color="blue-darken-2"
                                  >
                                    mdi-magnify-plus-outline
                                  </v-icon>
                                  <span>{{ trimFileName(getFileName(file), 22) }}</span>
                                </div>
                              </template>

                              <template v-else>
                                <div class="evidence-doc-icon-wrap">
                                  <v-icon
                                    :icon="getEvidenceIcon(file)"
                                    size="40"
                                    color="indigo-darken-2"
                                  />
                                </div>
                                <div class="evidence-meta">
                                  <span>{{ trimFileName(getFileName(file), 22) }}</span>
                                  <small class="evidence-ext">{{ getFileExtension(file).toUpperCase() || 'FILE' }}</small>
                                </div>
                              </template>
                            </div>
                          </div>
                        </div>
                      </v-col>
                    </v-row>
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </div>
        </v-tabs-window-item>
      </v-tabs-window>

      <!-- Input de archivo oculto -->
      <input
        ref="fileInput"
        type="file"
        class="d-none"
        :accept="uploadMode === 'CAMERA' ? 'image/*' : '*/*'"
        :capture="uploadMode === 'CAMERA' ? 'environment' : undefined"
        @change="onFileSelected"
      >

      <!-- Modal preview de imágenes -->
      <v-dialog
        v-model="previewDialog"
        max-width="980"
      >
        <v-card class="rounded-xl overflow-hidden">
          <v-toolbar
            color="blue-darken-3"
            density="compact"
          >
            <v-toolbar-title class="text-body-2 font-weight-bold">
              {{ previewImageName }}
            </v-toolbar-title>
            <v-spacer />
            <v-btn
              icon="mdi-download"
              variant="text"
              @click="downloadCurrentPreview"
            />
            <v-btn
              icon="mdi-close"
              variant="text"
              @click="previewDialog = false"
            />
          </v-toolbar>
          <v-card-text class="pa-2 bg-slate-900">
            <v-img
              :src="previewImageUrl"
              max-height="75vh"
              contain
              class="rounded-lg"
            />
          </v-card-text>
        </v-card>
      </v-dialog>

      <!-- Diálogo de Firma FES estándar para Auditoría Legal -->
      <FirmaDialog
        v-model="dialogFesSST"
        :pdf-url="pdfUrlParaFirma"
        :is-report="true"
        :detalle-flujo="mockDetalleFlujo"
        @firmado-directo="ejecutarGeneracionYCierre"
      />

      <!-- Overlay Loader al generar/guardar auditoría -->
      <v-overlay
        :model-value="loadingAudit || loadingPdf"
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
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import FirmaDialog from './FirmaDialog.vue';
import { sstService } from '@/services/sstService';
import { logoBase64 } from '@/assets/logoBase64';
import api from '@/services/api';
import axios from 'axios';
import { useUserDetailStore } from '@/stores/userDetail';

const props = defineProps({
  reportName: String,
  context: Object
});

const activeTab = ref('dash'); 
const loadingAudit = ref(false);
const loadingPdf = ref(false);
const informeStatus = ref('borrador');
const rawAuditData = ref({});
const pdfUrlStored = ref(null);
const dialogFesSST = ref(false);
const pdfUrlParaFirma = ref('');

const userDetailStore = useUserDetailStore();

const mockDetalleFlujo = computed(() => ({
  id_survey: 0,
  id_flow: 0,
  detalles_flujo: [{
    id_flow_stp: 0,
    flow_tmpl_step_orden: 1,
    id_rol: 0,
    name_rol: 'Auditor SST',
    nombre_user: userDetailStore.userDetail ? `${userDetailStore.userDetail.name_frst} ${userDetailStore.userDetail.apellido_pat}` : 'Usuario',
    id_user: userDetailStore.userDetail?.id_user,
    estado: 'PENDIENTE'
  }]
}));

const isReadOnly = computed(() => informeStatus.value === 'TERMINADO');
const idInforme = ref(null);
const visibleGroups = ref([]);
const employeeCount = ref(54);
const selectedProject = ref('Mantención Mayor de Oleoducto ENAP');
const valorUTM = ref(69889); // Valor Abril 2026 por defecto (evita ceros)
const utmDate = ref('01-04-2026');
const utmSource = ref('mindicador.cl');
const loadingUtm = ref(false);
const showGpsPanel = ref(true);
const usuarios = ref(['Administración Obra', 'Jefe de Terreno', 'Asesor Prevención Riesgos', 'Encargado Calidad', 'Bodeguero']);
const profesionalSST = ref("Jaime Contreras A."); // Firmante por defecto
const administrador = ref("Admin");
const expertoAsesor = ref("Lider Prev");

// --- LÓGICA DE PANEL DRAGGABLE (GPS) ---
const gpsX = ref(0);
const gpsY = ref(0);
const isDragging = ref(false);
let startX = 0;
let startY = 0;

const gpsStyle = computed(() => ({
  transform: `translate(${gpsX.value}px, ${gpsY.value}px)`,
  transition: isDragging.value ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
  zIndex: 1000
}));

const startDrag = (e) => {
  isDragging.value = true;
  startX = e.clientX - gpsX.value;
  startY = e.clientY - gpsY.value;
  window.addEventListener('mousemove', onDrag);
  window.addEventListener('mouseup', stopDrag);
};

const onDrag = (e) => {
  if (!isDragging.value) return;
  gpsX.value = e.clientX - startX;
  gpsY.value = e.clientY - startY;
};

const stopDrag = () => {
  isDragging.value = false;
  window.removeEventListener('mousemove', onDrag);
  window.removeEventListener('mouseup', stopDrag);
};

// --- LÓGICA DE SUBIDA DE ARCHIVOS ---
const fileInput = ref(null);
const currentItemUpload = ref(null);
const uploadMode = ref('DOCS');
const previewDialog = ref(false);
const previewImageUrl = ref('');
const previewImageName = ref('');

const triggerUpload = (item, mode) => {
  currentItemUpload.value = item;
  uploadMode.value = mode;
  fileInput.value.click();
};

const onFileSelected = async (event) => {
  const file = event.target.files[0];
  if (!file || !currentItemUpload.value) return;

  const formData = new FormData();
  formData.append('archivo', file);
  formData.append('tipo_doc', 'EVIDENCIA_AUDITORIA');
  formData.append('mimetype', file.type);
  formData.append('id_user', 1); // TODO: Obtener del contexto de usuario
  formData.append('path_doc', '/u05/LeanDocs/auditoria/evidencias/');
  formData.append('estado', 'ACTIVO');

  try {
    loadingAudit.value = true;
    const res = await api.post('/archivo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    if (!currentItemUpload.value.evidence) {
      currentItemUpload.value.evidence = [];
    }
    currentItemUpload.value.evidence.push(res.data.archivo);
    event.target.value = '';
  } catch (err) {
    console.error("Error subiendo archivo:", err);
    alert('Error al subir el archivo al servidor');
  } finally {
    loadingAudit.value = false;
  }
};

const removeEvidence = (item, idx) => {
  if (!item?.evidence) return;
  item.evidence.splice(idx, 1);
};

const getBaseFileUrl = () => import.meta.env.VITE_API_BASE_URL.replace('/api', '');

const getFileName = (file) => file?.name_doc_orig || file?.name_doc_interno || 'archivo';

const trimFileName = (name, max = 18) => {
  if (!name) return 'archivo';
  return name.length > max ? `${name.slice(0, max)}...` : name;
};

const getFileExtension = (file) => {
  const filename = getFileName(file);
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
};

const getFileUrl = (file) => {
  const baseUrl = getBaseFileUrl();
  return `${baseUrl}/api/archivo/auditoria/evidencias/${file.name_doc_interno}`;
};

const isImageFile = (file) => {
  const mime = (file?.mimetype || '').toLowerCase();
  if (mime.startsWith('image/')) return true;
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'heic', 'heif'].includes(getFileExtension(file));
};

const getEvidenceIcon = (file) => {
  const ext = getFileExtension(file);
  if (ext === 'pdf') return 'mdi-file-pdf-box';
  if (['doc', 'docx'].includes(ext)) return 'mdi-file-word-box';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'mdi-file-excel-box';
  if (['ppt', 'pptx'].includes(ext)) return 'mdi-file-powerpoint-box';
  if (['zip', 'rar', '7z'].includes(ext)) return 'mdi-folder-zip-outline';
  if (['txt', 'rtf'].includes(ext)) return 'mdi-file-document-outline';
  return 'mdi-file-outline';
};

const openFile = (file) => {
  if (isImageFile(file)) {
    previewImageUrl.value = getFileUrl(file);
    previewImageName.value = getFileName(file);
    previewDialog.value = true;
    return;
  }

  const url = getFileUrl(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = getFileName(file);
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const downloadCurrentPreview = () => {
  if (!previewImageUrl.value) return;
  const link = document.createElement('a');
  link.href = previewImageUrl.value;
  link.download = previewImageName.value || 'imagen';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const fetchUTM = async (periodo) => {
  if (!periodo || periodo.length !== 6) return;
  
  loadingUtm.value = true;
  try {
    const targetY = periodo.substring(0, 4);
    const targetM = periodo.substring(4, 6);
    
    console.log(`Buscando UTM para periodo: ${targetY}-${targetM}`);
    
    // Consultamos el endpoint general que es más estable
    const response = await axios.get(`https://mindicador.cl/api/utm`);
    
    if (response.data && response.data.serie) {
      // Buscamos en la serie el mes y año que coincidan
      const match = response.data.serie.find(item => {
        const itemDate = new Date(item.fecha);
        const itemY = itemDate.getUTCFullYear().toString();
        const itemM = (itemDate.getUTCMonth() + 1).toString().padStart(2, '0');
        return itemY === targetY && itemM === targetM;
      });

      if (match) {
        valorUTM.value = match.valor;
        const d = new Date(match.fecha);
        utmDate.value = d.getUTCDate().toString().padStart(2, '0') + '-' + 
                        (d.getUTCMonth() + 1).toString().padStart(2, '0') + '-' + 
                        d.getUTCFullYear();
        console.log("UTM encontrada:", valorUTM.value);
      } else {
        // Si no hay match exacto, tomamos el más reciente de la serie
        valorUTM.value = response.data.serie[0].valor;
        const d = new Date(response.data.serie[0].fecha);
        utmDate.value = d.getUTCDate().toString().padStart(2, '0') + '-' + 
                        (d.getUTCMonth() + 1).toString().padStart(2, '0') + '-' + 
                        d.getUTCFullYear();
      }
    }
  } catch (err) {
    console.error("Error fetching UTM, usando valor por defecto:", err);
  } finally {
    loadingUtm.value = false;
  }
};

const fetchAuditData = async () => {
  if (!props.context) return;
  loadingAudit.value = true;
  try {
    const { id_empresa, id_proyecto, id_periodo } = props.context;
    
    // 1. Obtener o crear cabecera tipo auditoría
    const informe = await sstService.getOrCreateInforme(id_empresa, id_proyecto, id_periodo, 'AUDITORIA');
    idInforme.value = informe.id_informe;
    informeStatus.value = informe.estado || 'borrador';

    // 2. Fetch UTM para el periodo
    await fetchUTM(id_periodo);

    // Formatear periodo YYYYMM a "Mes YYYY"
    if (id_periodo && id_periodo.length === 6) {
      const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
      const y = id_periodo.substring(0, 4);
      const m = parseInt(id_periodo.substring(4, 6)) - 1;
      periodoEvaluadoDisplay.value = `${monthNames[m]} ${y}`;
    } else {
      periodoEvaluadoDisplay.value = id_periodo;
    }
    selectedProject.value = props.context.nombre_proyecto || "Proyecto Desconocido";
    
    // Dotación para cálculo de UTM
    if (informe.promedio_trabajadores_dia) {
      employeeCount.value = informe.promedio_trabajadores_dia;
    }
    
    // Procesar data_json
    let parsedData = informe.data_json;
    if (typeof parsedData === 'string') {
      try { parsedData = JSON.parse(parsedData); } catch (e) { parsedData = {}; }
    }
    rawAuditData.value = parsedData;
    
    // Si hay datos previos en data_json, sincronizarlos con nuestra estructura de 17 puntos
    if (rawAuditData.value && rawAuditData.value.auditGroups) {
      const dbGroups = rawAuditData.value.auditGroups;
      
      // Mapear datos del DB a nuestra estructura fija (auditGroups ya tiene los 17 puntos inicializados)
      auditGroups.value.forEach(localGroup => {
        const dbGroup = dbGroups.find(dg => dg.id === localGroup.id || dg.num === localGroup.num);
        if (dbGroup) {
          localGroup.items.forEach(localItem => {
            const dbItem = dbGroup.items.find(di => di.dt_code === localItem.dt_code);
            if (dbItem) {
              // Solo propagamos el estado y las observaciones del usuario
              localItem.status = dbItem.status || 'PENDIENTE';
              localItem.observations = dbItem.observations || '';
              localItem.evidence = dbItem.evidence || [];
              localItem.final_utm = dbItem.final_utm || 0;
              // Nuevos campos de resolución
              localItem.responsable = dbItem.responsable || '';
              localItem.fecha_inicio_resolucion = dbItem.fecha_inicio_resolucion || '';
              localItem.fecha_fin_resolucion = dbItem.fecha_fin_resolucion || '';
              localItem.desc_resolucion = dbItem.desc_resolucion || '';
            }
          });
        }
      });

      // NO sobreescribimos auditGroups.value con djson.auditGroups directamente para evitar los 21 puntos
      if (activeTab.value === 'audit') {
        triggerProgressiveLoad();
      }
    }
  } catch (err) {
    console.error("Error cargando auditoría:", err);
  } finally {
    loadingAudit.value = false;
  }
};

// --- LÓGICA DE ALMACENAMIENTO Y CIERRE ---

const closeInforme = async () => {
  if (stats.value.evaluated < stats.value.totalItems) {
    alert(`No se puede cerrar el informe: Aún quedan ${stats.value.totalItems - stats.value.evaluated} puntos pendientes en la Lista de Verificación. Todos los puntos deben marcarse como Cumple, No cumple o No aplica.`);
    return;
  }
  
  try {
    loadingAudit.value = true;
    
    // 1. Guardamos progreso
    await saveAudit(true);

    // 2. Generar el reporte borrador (capturamos el HTML completo con FES habilitado)
    const reportHtml = getReportHtml(true); 

    // 3. Enviar al servidor para generar PDF
    const response = await api.post(`/sst/generate-pdf-html/${idInforme.value}`, { 
      htmlContent: reportHtml 
    });

    if (response.data && response.data.url_pdf) {
      pdfUrlStored.value = response.data.url_pdf;
      const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
      pdfUrlParaFirma.value = BASE_URL + response.data.url_pdf;
      dialogFesSST.value = true;
    } else {
      alert("No se pudo generar el borrador para firma.");
    }
  } catch (err) {
    console.error("Error al preparar firma:", err);
    alert(`Error al preparar el informe digital: ${err.message}`);
  } finally {
    loadingAudit.value = false;
  }
};

const ejecutarGeneracionYCierre = async () => {
  if (!idInforme.value) return;
  try {
    loadingAudit.value = true;
    const finalData = { 
      ...rawAuditData.value, 
      auditGroups: auditGroups.value, 
      url_pdf: pdfUrlStored.value, 
      closed_at: new Date().toISOString() 
    };
    await sstService.updateInforme(idInforme.value, { 
      estado: 'TERMINADO',
      data_json: finalData
    });
    rawAuditData.value = finalData;
    informeStatus.value = 'TERMINADO';
    window.dispatchEvent(new CustomEvent('report-status-updated'));
    alert("Informe cerrado y firmado correctamente. Ahora se encuentra en modo de solo lectura.");
  } catch (err) {
    console.error("Error al cerrar informe:", err);
    alert("Error al cerrar el informe.");
  } finally {
    loadingAudit.value = false;
  }
};

const reabrirInforme = async () => {
  if (!confirm("¿Está seguro de re-abrir el informe? Esto permitirá editarlo nuevamente.")) return;
  try {
    loadingAudit.value = true;
    await sstService.updateInforme(idInforme.value, { estado: 'borrador' });
    informeStatus.value = 'borrador';
    window.dispatchEvent(new CustomEvent('report-status-updated'));
    alert("Informe re-abierto correctamente.");
  } catch (err) {
    console.error("Error al re-abrir informe:", err);
    alert("Error al re-abrir el informe.");
  } finally {
    loadingAudit.value = false;
  }
};

const openStoredPdf = () => {
  if (rawAuditData.value.url_pdf) {
    const url = import.meta.env.VITE_API_BASE_URL + rawAuditData.value.url_pdf;
    window.open(url, '_blank');
  } else {
    alert("No hay un PDF oficial generado aún.");
  }
};

const openGeneratedPdf = () => {
  // Simular apertura del PDF local (previo almacenamiento)
  printAuditReport();
};

const saveAudit = async (silent = false) => {
  if (!idInforme.value) return;
  try {
    if (!silent) loadingAudit.value = true;
    const payload = {
      data_json: {
        ...rawAuditData.value,
        auditGroups: auditGroups.value
      }
    };
    await sstService.updateInforme(idInforme.value, payload);
    rawAuditData.value = payload.data_json;
    if (!silent) alert("Auditoría guardada correctamente.");
  } catch (err) {
    console.error("Error guardando auditoría:", err);
    if (!silent) alert("Error al guardar la auditoría");
    throw err;
  } finally {
    if (!silent) loadingAudit.value = false;
  }
};

const getReportHtml = (headless = false) => {
  // Bloque FES
  const validationCode = idInforme.value?.toString().substring(0,8).toUpperCase() || 'AUD-' + new Date().getTime();
  const fesHtml = `
    <div style="margin-top: 40pt; border-top: 2px solid #0f172a; padding-top: 20pt; page-break-inside: avoid;">
      <h3 style="font-size: 10pt; font-weight: 800; color: #0f172a; margin-bottom: 10pt; text-transform: uppercase;">Aprobado mediante Firma Electrónica Simple (FES)</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="width: 20%; text-align: center; vertical-align: middle; border: 1px solid #e2e8f0; padding: 10pt;">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=VALIDACION-AUDITORIA-${validationCode}" style="width: 80pt; height: 80pt;" />
          </td>
          <td style="width: 80%; border: 1px solid #e2e8f0; padding: 10pt; font-size: 8pt; color: #334155;">
            <div><strong>Firmante:</strong> ${profesionalSST.value || 'DEPARTAMENTO SST'}</div>
            <div><strong>RUT:</strong> VALIDADO POR SESIÓN LEAN</div>
            <div><strong>Fecha y Hora:</strong> ${new Date().toLocaleString()}</div>
            <div><strong>Hash de Verificación:</strong> <span style="font-family: monospace; color: #64748b;">${validationCode}</span></div>
          </td>
        </tr>
      </table>
    </div>
  `;

  // 1. GENERAR HOJA DE RESULTADOS (DASHBOARD)
  const dashboardHtml = `
    <div class="page-results">
      <table class="report-header-table">
        <tr>
          <td rowspan="4" class="logo-cell" style="width: 20%; text-align: center; vertical-align: middle; border: 1px solid #0f172a; padding: 10px;">
            <div style="height: 60pt; width: 100%; display: flex; align-items: center; justify-content: center; overflow: hidden;">
              <img src="data:image/png;base64,${logoBase64}" style="height: 100%; width: auto; max-width: 100%;" />
            </div>
          </td>
          <td class="title-cell" rowspan="2" style="width: 55%; text-align: center; font-weight: 800; font-size: 14pt; text-transform: uppercase; border: 1px solid #0f172a; padding: 10px; color: #0f172a;">
            Auditoría Legal del Tipificador de Multa
          </td>
          <td class="meta-cell" style="width: 25%; font-size: 8pt; border: 1px solid #0f172a; padding: 5px;"><strong>Versión:</strong> Rev.1 2026</td>
        </tr>
        <tr>
          <td class="meta-cell" style="border: 1px solid #0f172a; padding: 5px;"><strong>Código:</strong> AUD-PRR-001</td>
        </tr>
        <tr>
          <td style="border: 1px solid #0f172a; padding: 5px; font-size: 9pt;">
             <div style="margin-bottom: 2pt;"><strong>EMPRESA:</strong> Terracon Proyectos de Ingeniería</div>
             <div><strong>PROYECTO:</strong> ${props.context?.nombre_proyecto || 'S/I'}</div>
          </td>
          <td class="meta-cell" style="border: 1px solid #0f172a; padding: 5px;">
             <div style="margin-bottom: 2pt;"><strong>CLIENTE:</strong> ${props.context?.nombre_empresa || 'S/I'}</div>
             <div><strong>PERIODO:</strong> ${periodoEvaluadoDisplay.value}</div>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="border: 1px solid #0f172a; padding: 5px; font-size: 8pt; background: #f8fafc;">
            <strong>ADMINISTRADOR:</strong> ${administrador.value} | <strong>LIDER PREVENCIÓN:</strong> ${expertoAsesor.value}
          </td>
        </tr>
      </table>

      <div class="report-header-box" style="margin-top: 15pt; text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 5pt;">
        <div class="rpt-title" style="font-weight: 900; font-size: 11pt; color: #1e3a8a;">INFORME EJECUTIVO DE RESULTADOS</div>
      </div>

      <div class="dashboard-grid">
        <!-- Bloque Métricas -->
        <div class="card-white">
          <div class="card-title">CUMPLIMIENTO GLOBAL</div>
          <div class="compliance-row">
            <div class="gauge-box">
              <div class="gauge-value">${Math.round(stats.value.cumplePct)}%</div>
              <div class="gauge-label">ÓPTIMO</div>
            </div>
            <div class="counters-box">
              <div class="counter-item">
                <span class="dot green"></span>
                <span class="lbl">CUMPLE</span>
                <span class="val">${stats.value.cumple}</span>
              </div>
              <div class="counter-item">
                <span class="dot red"></span>
                <span class="lbl">NO CUMPLE</span>
                <span class="val">${stats.value.noCumple}</span>
              </div>
              <div class="counter-item">
                <span class="dot gray"></span>
                <span class="lbl">N/A - OTROS</span>
                <span class="val">${stats.value.noAplica}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Bloque Financiero -->
        <div class="card-dark">
          <div class="card-title-orange">VALORIZACIÓN DE RIESGO</div>
          
          <div class="risk-badge">
            <div class="risk-label">SANCIÓN ESTIMADA</div>
            <div class="risk-value">${stats.value.totalUTM} <span>UTM</span></div>
          </div>

          <div class="risk-badge" style="margin-top: 10pt;">
            <div class="risk-label">VALOR UTM (CLP) al ${utmDate.value}</div>
            <div class="risk-value">$ ${valorUTM.value.toLocaleString()}</div>
          </div>

          <div class="risk-cost">
            <div class="cost-lbl">COSTO ESTIMADO EN CLP</div>
            <div class="cost-val">$ ${stats.value.totalCosto.toLocaleString()}</div>
            <div class="cost-sub" style="margin-top: 4pt; font-size: 5.5pt;">
              Fuente: ${utmSource.value} ${utmDate.value ? `(${utmDate.value})` : ''}
            </div>
          </div>
        </div>
      </div>

      <div class="table-container">
        <div class="table-header">CUMPLIMIENTO POR PUNTO DE EVALUACIÓN (17 PUNTOS)</div>
        <div class="stats-grid">
          ${normativaStats.value.map(n => `
            <div class="stat-row">
              <div class="stat-info">
                <span class="stat-num">${n.num}</span>
                <span class="stat-name">${n.norma}</span>
              </div>
              <div class="stat-metrics">
                 <span class="stat-count">C: ${n.cumple} / T: ${n.divisor}</span>
                 <span class="stat-pct">${n.pct}%</span>
              </div>
              <div class="stat-bar-bg">
                <div class="stat-bar-fill" style="width: ${n.pct}%; background: ${n.pct > 85 ? '#10b981' : (n.pct > 60 ? '#f59e0b' : '#ef4444')};"></div>
              </div>
              
              ${n.incumplimientos.length > 0 ? `
                <div style="margin-top:5pt; background:rgba(239, 68, 68, 0.05); padding:5pt; border-radius:4pt; border:0.5pt solid rgba(239, 68, 68, 0.1);">
                  ${n.incumplimientos.map(inc => `
                    <div style="font-size:6.5pt; color:#334155; margin-bottom:4pt; padding-bottom:4pt; border-bottom:0.25pt solid rgba(255,255,255,0.2); last:border-0">
                      <div style="font-weight:900; color:#dc2626">CÓDIGO: ${inc.dt_code} / Plan de Resolución</div>
                      <div style="font-style:italic">Rep: ${inc.responsable || 'S/I'} | Plazo: ${inc.fecha_inicio_resolucion || '-'} al ${inc.fecha_fin_resolucion || '-'}</div>
                      <div style="margin-top:2pt">${inc.desc_resolucion || 'Sin descripción de resolución.'}</div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    </div>
    <div style="page-break-after: always;"></div>
  `;

  // 2. GENERAR HOJA DE DETALLE (LISTA)
  let cardsHtml = '';
  auditGroups.value.forEach(group => {
    let itemsHtml = '';
    group.items.forEach(item => {
      const statusClass = item.status.toLowerCase().replace(' ', '-');
      
      // Construir HTML de evidencia
      let evidenceHtml = '';
      if (item.evidence && item.evidence.length > 0) {
        const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '');
        evidenceHtml = `
          <div class="evidence-section" style="margin-top: 10pt;">
            <div class="obs-lbl" style="margin-bottom: 5pt; font-weight: 800; font-size: 7pt; color: #64748b;">EVIDENCIA ADJUNTA (${item.evidence.length}):</div>
            <table style="width: 100%; border-collapse: separate; border-spacing: 5pt;">
              <tr>
        `;
        
        item.evidence.forEach((f, index) => {
          if (index > 0 && index % 4 === 0) {
            evidenceHtml += '</tr><tr>';
          }

          const internalName = f.name_doc_interno || '';
          const originalName = f.name_doc_orig || internalName || 'Archivo';
          
          const url = `${baseUrl}/api/archivo/auditoria/evidencias/${internalName}`;
          // Regex ampliado para detectar imágenes de forma más robusta
          const imageRegex = /\.(jpg|jpeg|png|gif|webp|svg|heic|jfif)$/i;
          const isImage = imageRegex.test(originalName) || imageRegex.test(internalName);
          
          evidenceHtml += `<td style="width: 25%; vertical-align: top; border: 1px solid #e2e8f0; border-radius: 4pt; padding: 4pt; background: #f8fafc;">`;
          
          if (isImage && internalName) {
            evidenceHtml += `
              <div style="width: 100%; text-align: center;">
                <img src="${url}" style="width: 100%; max-height: 120pt; object-fit: contain; border-radius: 2pt; display: block; margin: 0 auto;" />
                <div style="font-size: 5pt; color: #94a3b8; margin-top: 3pt; font-weight: 700; word-break: break-all;">${originalName.substring(0, 20)}</div>
              </div>
            `;
          } else {
            evidenceHtml += `
              <div style="font-size: 7pt; color: #1e40af; font-weight: bold; text-align: center; padding: 10pt 0;">
                <div style="font-size: 15pt; margin-bottom: 4pt;">📄</div>
                <div style="word-break: break-all;">${originalName.substring(0, 25)}${originalName.length > 25 ? '...' : ''}</div>
              </div>
            `;
          }
          
          evidenceHtml += `</td>`;
        });

        // Completar celdas vacías si es necesario para mantener el diseño
        const remaining = 4 - (item.evidence.length % 4);
        if (remaining < 4) {
          for (let i = 0; i < remaining; i++) {
            evidenceHtml += '<td style="width: 25%;"></td>';
          }
        }

        evidenceHtml += `
              </tr>
            </table>
          </div>
        `;
      }

      itemsHtml += `
        <div class="item-row">
          <div class="item-main">
            <div class="code-badge">CÓDIGO DT: ${item.dt_code}</div>
            <div class="description">${item.description}</div>
            ${item.criterio ? `<div class="criterio-box"><strong>CRITERIO:</strong> ${item.criterio}</div>` : ''}
            <div class="obs-box">
              <div class="obs-lbl">OBSERVACIONES:</div>
              <div class="obs-val">${item.observations || 'Sin observaciones.'}</div>
            </div>
            ${evidenceHtml}
            ${item.status === 'NO CUMPLE' ? `
              <div style="margin-top:10pt; background:#fef2f2; border:1pt solid #fee2e2; border-radius:8pt; padding:10pt;">
                <div style="font-size:7pt; font-weight:900; color:#dc2626; text-transform:uppercase; letter-spacing:1pt; margin-bottom:5pt;">PLAN DE RESOLUCIÓN</div>
                <div style="display:flex; gap:15pt; margin-bottom:5pt;">
                  <div style="flex:1;"><div class="obs-lbl">RESPONSABLE:</div><div style="font-size:8pt; font-weight:700;">${item.responsable || 'No asignado'}</div></div>
                  <div style="flex:1;"><div class="obs-lbl">FECHAS COMPROMISO:</div><div style="font-size:8pt; font-weight:700;">${item.fecha_inicio_resolucion || '-'} al ${item.fecha_fin_resolucion || '-'}</div></div>
                </div>
                <div>
                  <div class="obs-lbl">DESCRIPCIÓN DE LA MEDIDA:</div>
                  <div style="font-size:8pt; color:#475569; font-style:italic; line-height:1.2;">${item.desc_resolucion || 'Sin descripción detallada.'}</div>
                </div>
              </div>
            ` : ''}
          </div>
          <div class="item-side">
            <div class="status-badge ${statusClass}">${item.status}</div>
            <div class="indicator-info">
              <div><strong>${item.norm_type}</strong></div>
              <div style="margin-top:4px">MULTA: <span class="${item.final_utm > 0 ? 'text-red' : ''}">${item.final_utm} UTM</span></div>
            </div>
          </div>
        </div>
      `;
    });

    cardsHtml += `
      <div class="group-card">
        <div class="group-header">
          <div class="orange-sq">${group.num}</div>
          <div class="header-texts">
            <div class="gen-desc">${group.generic_desc}</div>
            <div class="leg-body">${group.legal_body}</div>
          </div>
        </div>
        ${itemsHtml}
      </div>
    `;
  });

  const fullHtml = `
    <` + `!DOCTYPE html>
    <` + `html>
    <` + `head>
      <title>Reporte_Auditoria_Legal_SST</title>
      <style>
        body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 15mm; background: white; color: #0f172a; line-height: 1.3; }
        @page { size: A4; margin: 0; }
        
        /* HEADER COMÚN */
        .report-header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; color: #0f172a; }
        .report-header-table td { border: 1px solid #0f172a; padding: 5px; }
        .report-header-table .logo-cell { width: 25%; text-align: center; vertical-align: middle; padding: 10px; }
        .report-header-table .title-cell { width: 50%; text-align: center; font-weight: 800; font-size: 13pt; text-transform: uppercase; }
        .report-header-table .meta-cell { width: 25%; font-size: 8pt; }

        /* HOJA 1: RESULTADOS */
        .report-header-box { text-align: center; border-bottom: 2pt solid #ea580c; padding-bottom: 10pt; margin-bottom: 20pt; }
        .brand { font-size: 8pt; font-weight: 800; color: #64748b; letter-spacing: 2pt; margin-bottom: 5pt; }
        .rpt-title { font-size: 14pt; font-weight: 900; color: #0f172a; }
        .rpt-period { font-size: 10pt; font-weight: 800; color: #ea580c; margin-top: 2pt; }

        .dashboard-grid { display: flex; gap: 15pt; margin-bottom: 20pt; }
        .card-white { flex: 2; border: 1pt solid #e2e8f0; border-radius: 12pt; padding: 15pt; background: #fff; }
        .card-dark { flex: 1; background: #0f172a; border-radius: 12pt; padding: 15pt; color: white; display: flex; flex-direction: column; }
        
        .card-title { font-size: 7pt; font-weight: 900; color: #94a3b8; letter-spacing: 1pt; margin-bottom: 15pt; }
        .card-title-orange { font-size: 7pt; font-weight: 900; color: #fb923c; letter-spacing: 1pt; margin-bottom: 15pt; }

        .compliance-row { display: flex; align-items: center; gap: 20pt; }
        .gauge-box { width: 100pt; height: 100pt; border: 8pt solid #10b981; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .gauge-value { font-size: 24pt; font-weight: 900; color: #1e293b; line-height: 1; }
        .gauge-label { font-size: 6pt; font-weight: 900; color: #94a3b8; }

        .counters-box { flex: 1; display: flex; flex-direction: column; gap: 8pt; }
        .counter-item { display: flex; align-items: center; padding: 6pt; border: 1pt solid #f1f5f9; border-radius: 6pt; }
        .dot { width: 6pt; height: 6pt; border-radius: 50%; margin-right: 8pt; }
        .dot.green { background: #10b981; }
        .dot.red { background: #ef4444; }
        .dot.gray { background: #cbd5e1; }
        .lbl { font-size: 7pt; font-weight: 800; color: #64748b; flex: 1; }
        .val { font-size: 10pt; font-weight: 900; color: #1e293b; }

        .risk-badge { background: rgba(255,255,255,0.05); padding: 10pt; border-radius: 8pt; border: 1pt solid rgba(255,255,255,0.1); margin-bottom: 15pt; }
        .risk-label { font-size: 6pt; font-weight: 900; color: rgba(255,255,255,0.4); }
        .risk-value { font-size: 18pt; font-weight: 900; }
        .risk-value span { font-size: 8pt; opacity: 0.6; }

        .cost-lbl { font-size: 7pt; font-weight: 900; color: #fb923c; margin-bottom: 2pt; }
        .cost-val { font-size: 16pt; font-weight: 900; letter-spacing: -1pt; }
        .cost-sub { font-size: 6pt; font-weight: 700; color: #64748b; font-style: italic; }

        .table-container { background: #0f172a; border-radius: 12pt; padding: 15pt; color: white; }
        .table-header { font-size: 7pt; font-weight: 900; color: #fb923c; border-bottom: 1pt solid rgba(255,255,255,0.1); padding-bottom: 8pt; margin-bottom: 10pt; }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10pt; }
        .stat-row { margin-bottom: 5pt; }
        .stat-info { display: flex; font-size: 7.5pt; font-weight: 800; margin-bottom: 2pt; }
        .stat-num { color: #fb923c; margin-right: 5pt; }
        .stat-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180pt; }
        .stat-metrics { display: flex; justify-content: space-between; font-size: 6.5pt; font-weight: 900; opacity: 0.7; font-family: monospace; }
        .stat-bar-bg { background: rgba(255,255,255,0.1); height: 4pt; border-radius: 2pt; overflow: hidden; margin-top: 2pt; }
        .stat-bar-fill { height: 100%; border-radius: 2pt; }

        /* DETALLE */
        .group-card { border: 1pt solid #e2e8f0; border-radius: 12pt; overflow: hidden; margin-bottom: 20pt; break-inside: avoid; }
        .group-header { background: #0f172a; padding: 12pt; display: flex; align-items: center; border-bottom: 3pt solid #ea580c; color: white; }
        .orange-sq { width: 24pt; height: 24pt; background: #ea580c; color: white; font-weight: 900; font-size: 12pt; border-radius: 6pt; display: flex; align-items: center; justify-content: center; margin-right: 10pt; font-style: italic; }
        .gen-desc { color: #f97316; font-size: 7.5pt; font-weight: 900; text-transform: uppercase; }
        .leg-body { font-size: 8pt; font-weight: 500; opacity: 0.9; }
        .item-row { padding: 12pt 15pt; border-bottom: 1px solid #f1f5f9; display: flex; gap: 15pt; break-inside: avoid; }
        .item-main { flex: 7; }
        .item-side { flex: 3; border-left: 1px solid #f1f5f9; padding-left: 15pt; display: flex; flex-direction: column; }
        .code-badge { background: #f1f5f9; padding: 2pt 5pt; font-size: 6pt; font-weight: 900; color: #64748b; border-radius: 4pt; display: inline-block; margin-bottom: 5pt; }
        .description { font-size: 9pt; font-weight: 900; color: #1e293b; margin-bottom: 8pt; }
        .criterio-box { background: #eff6ff; border: 1px solid #dbeafe; border-radius: 6pt; padding: 8pt; margin-bottom: 8pt; font-size: 7.5pt; color: #1e40af; }
        .obs-lbl { font-size: 6pt; font-weight: 800; color: #94a3b8; margin-bottom: 2pt; }
        .obs-val { font-size: 8pt; color: #334155; font-style: italic; }
        .status-badge { padding: 6pt; text-align: center; border-radius: 8pt; font-weight: 900; font-size: 7.5pt; color: white; margin-bottom: 8pt; }
        .status-badge.cumple { background: #16a34a; }
        .status-badge.no-cumple { background: #dc2626; }
        .status-badge.no-aplica { background: #475569; }
        .status-badge.pendiente { background: #f97316; }
        .indicator-info { font-size: 7pt; color: #64748b; }
        .text-red { color: #dc2626; font-weight: bold; }
      <` + `/style>
    <` + `/head>
    <` + `body>
      ${dashboardHtml}
      ${cardsHtml}
      ${fesHtml}
      ${!headless ? `<scr`+`ipt>window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 700); };<`+`/script>` : ''}
    <` + `/body>
    <` + `/html>
  `;
  return fullHtml;
};

const printAuditReport = () => {
  const printWindow = window.open('', '_blank');
  const fullHtml = getReportHtml(false);
  printWindow.document.write(fullHtml);
  printWindow.document.close();
};

const fetchUsuarios = async () => {
  try {
    const res = await api.get('/m-usuario');
    if (res.data && Array.isArray(res.data)) {
       usuarios.value = res.data.map(u => `${u.name_user} ${u.last_name || ''}`.trim());
    }
  } catch (err) {
    console.error("Error fetching users:", err);
  }
};

onMounted(() => {
  fetchAuditData();
  fetchUsuarios();
});

watch(() => props.context, () => {
  fetchAuditData();
}, { deep: true });

const tramoActual = computed(() => {
  const count = employeeCount.value;
  if (count <= 49) return "1 A 49";
  if (count <= 199) return "50 A 199";
  return "200 Y MÁS";
});

const periodoEvaluadoDisplay = computed(() => {
  if (!props.context?.id_periodo) return 'S/I';
  const id_periodo = String(props.context.id_periodo);
  if (id_periodo.length === 6) {
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const y = id_periodo.substring(0, 4);
    const m = parseInt(id_periodo.substring(4, 6)) - 1;
    return `${monthNames[m]} ${y}`;
  }
  return id_periodo;
});

const getUtmValue = (category, tramo) => {
  const table = {
    "GRAVÍSIMA": { "1 A 49": 10, "50 A 199": 40, "200 Y MÁS": 60 },
    "GRAVE": { "1 A 49": 9, "50 A 199": 30, "200 Y MÁS": 40 }
  };
  return table[category]?.[tramo] || 0;
};

const auditGroups = ref([
  {
    "id": "S1",
    "num": "S1",
    "legal_body": "D. 44 01-02-2025 del Ministerio del Trabajo y Previsión Social.",
    "generic_desc": "Información y formación en seguridad y salud en el trabajo",
    "items": [
      {
        "dt_code": "2600 - w",
        "description": "No informar a las personas trabajadoras acerca de los riesgos que entrañan sus labores, las medidas preventivas y los métodos o procedimientos de trabajo correcto (ODI - IRL).",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS44",
        "final_utm": 0,
        "criterio": "Se revisa IRL / ODI Interna y de contratista según corresponda, cada vez que se genera un cambio de cargo en su contrato se debe ajustar la IRL / ODI en concordancia a sus nuevas funciones.\r\n(Mantener Carpeta OneDrive compartida con encargado de RRHH, además, la documentación de empresas contratistas deben ser administrados en su respectiva área de gestión)"
      },
      {
        "dt_code": "2600 - y",
        "description": "No realizar capacitación teórica-práctica a las personas trabajadoras en prevención de riesgos laborales considerando las principales medidas de seguridad y salud, con periodicidad de dos años y duración de 8 horas.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS44",
        "final_utm": 0,
        "criterio": "Registro de capacitación a personas trabajadoras personal propio y empresas contratistas, según contenidos mínimos detallados en el artículo 16 del decreto 44, (Inicialmente, se debe solicitar en la medida que se implemente)"
      }
    ]
  },
  {
    "id": "S2",
    "num": "S2",
    "legal_body": "D. 44  con entrada en vigencia el 01-02-2025 del Ministerio del Trabajo y Previsión Social.",
    "generic_desc": "Reglamento Interno de Orden, Higiene y Seguridad",
    "items": [
      {
        "dt_code": "2602 - h",
        "description": "No confeccionar reglamento interno de orden,  higiene y seguridad, según lo indicado en el Código del Trabajo y Decreto 44\r\n.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS44",
        "final_utm": 0,
        "criterio": "Reglamento Interno de empresa Constructora Terracon SPA y Empresas Contratistas, actualizado, vigencia 1 año"
      },
      {
        "dt_code": "2602 - i",
        "description": "No remitir copia del reglamento interno de orden higiene y seguridad a la Dirección del Trabajo y SEREMI de Salud",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS44",
        "final_utm": 0,
        "criterio": "Comprobante de ingreso del RIOHS  a la SEREMI y DT de Constructora  Terracon y Empresas Contratistas, acorde a última actualización del documento"
      },
      {
        "dt_code": "1114 - e",
        "description": "No entregar ejemplar escrito del reglamento interno de higiene y seguridad a cada uno de los trabajadores (Registro).",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS44",
        "final_utm": 0,
        "criterio": "Registro de entrega del RIOHS a personas trabajadoras, acorde a última actualización"
      },
      {
        "dt_code": "2602 - j",
        "description": "No  efectuar  las  modificaciones  al  Reglamento Interno de Orden, Higiene y Seguridad y/o realizar una revisión con una periodicidad no inferior a un año.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS44",
        "final_utm": 0,
        "criterio": "Reglamento Interno de empresa Constructora Terracon SPA y Empresas Contratistas, actualizado, vigencia 1 año"
      },
      {
        "dt_code": "2602 - k",
        "description": "No informar adecuadamente las modificaciones del  reglamento interno de orden, higiene y seguridad a CPHS y personas trabajadoras.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS44",
        "final_utm": 0,
        "criterio": "Registros de difusión del RIOHS, publicación en lugares visibles"
      }
    ]
  },
  {
    "id": "S3",
    "num": "S3",
    "legal_body": "Decreto 44 del Ministerio del Trabajo y Previsión Social\r\nArtículos 184, incisos 1° y 2°, y 506 del Código del Trabajo.",
    "generic_desc": "No tomar todas las medidas necesarias para proteger eficazmente la vida y salud de los trabajadores.",
    "items": [
      {
        "dt_code": "2600 - d",
        "description": "No Identificar los Peligros y Evaluar los Riesgos laborales asociados a los procesos, tareas y puestos de trabajo, estar disponible y ser informada a las personas trabajadoras",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "CDT",
        "final_utm": 0,
        "criterio": "Matriz IPER , actualización de la matriz\r\nrealizada por Asesor, supervisor, profesional de terreno o jefe de obra, aprobada por Administrador, PT y entregada a (supervisores y empresas contratistas en caso de ellas quien ejecuten la labor).\r\nParticipación y consulta de los trabajadores, validado a través del CPHS dejar estipulado en reunión mensual.\r\nImpresa y firmada por los involucrados, además de difundida al personal que ejecuta la labor."
      },
      {
        "dt_code": "2600 -j",
        "description": "No disponer de un programa de trabajo en prevención de los riesgos laborales  a partir de la matriz IPER, detallando medidas preventivas, correctivas y responsable de su ejecución, actualizado acorde a la revisión de la matriz, firmado por la máxima autoridad del centro de trabajo (Administrador) y difundido a través de medios oficiales en el centro de trabajo.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "CDT",
        "final_utm": 0,
        "criterio": "Programa de Trabajo firmado por el administrador, difundido a las personas trabajadoras, verificación de cumplimiento de las medidas. (inicialmente, auditado acorde al procesos de implementación)"
      },
      {
        "dt_code": "1127-c",
        "description": "No mantener los Procedimientos de Trabajo  adecuados de higiene y seguridad para que los trabajadores cumplan correctamente lo establecido por la empresa para el puesto de trabajo o proceso.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "CDT",
        "final_utm": 0,
        "criterio": "Se revisara procedimientos de trabajo impreso y/o a disposición para consulta.\r\nDebe existir registro de entrega de los procedimientos a cada supervisor, jefe de obra, PT, Administrador.\r\nEstos PTS deben estar ordenados y archivados de acuerdo a lo establecido (lomos)\r\nLa difusión será por parte del asesor al momento de ingreso de forma individualizada y luego el supervisor deberá difundir de forma especifica al personal relacionado con la actividad.\r\nEn el caso de no existir PTS y según el analice que se realice se requiera se debe confeccionar y enviar a validación."
      },
      {
        "dt_code": "1127 - a",
        "description": "No garantizar los elementos necesarios para que los trabajadores en caso de accidente o emergencia puedan acceder a una oportuna y adecuada atención médica (Procedimiento \"Que Hacer en caso de Accidente\").",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "CDT",
        "final_utm": 0,
        "criterio": "Procedimiento que hacer en caso de accidente\r\nInvestigación y difusión de accidente \r\nEn físico y/o a disposición para consulta, difundido a las personas trabajadoras."
      },
      {
        "dt_code": "1176-n",
        "description": "No realizar medidas preventivas ante enfermedades profesionales.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "CDT",
        "final_utm": 0,
        "criterio": "Identificación de fuentes emisoras de ruido, polvo, vibraciones, Manejo manual de carga, trastorno musculo esquelético etc., en Matriz\r\nCarta Gantt de los protocolos, verificación cumplimiento según programación.\r\nSeñalización del riesgo en obra se debe dejar registro fotográfico."
      },
      {
        "dt_code": "1177-l",
        "description": "No realizar las evaluaciones ambientales a los lugares de trabajo conforme al Protocolo de Sílice.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "CDT",
        "final_utm": 0,
        "criterio": "Cualitativa con Organismo Administrador\r\nSeguimiento y cierre del informe emitido por el organismo administrador y difusión del informe  al CPHSF, trabajadores y línea de control."
      },
      {
        "dt_code": "1177-n",
        "description": "No efectuar la periodicidad de la vigilancia de la salud a los trabajadores expuestos a sílice conforme al Protocolo de Sílice.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "CDT",
        "final_utm": 0,
        "criterio": "Identificación Inicial de trabajadores expuestos \r\nIngreso a vigilancia a Mutual, exámenes ocupacional, revisar plataforma con antecedentes, según corresponda."
      },
      {
        "dt_code": "2601 - e",
        "description": "No contar con el Plan de gestión, reducción y respuesta de riesgos en caso de emergencia, catástrofe o desastre",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "CDT",
        "final_utm": 0,
        "criterio": "Plan de GRD incorporando el almacenamiento de sustancias peligrosas, cronograma de implementación del plan (actualización), croquis de la ubicación de las sustancias al interior de la bodega, listado de sustancias almacenadas con sus especificaciones, mapas de amenazas externas e internas"
      },
      {
        "dt_code": "1177-p",
        "description": "No contar con las condiciones mínimas de seguridad en el almacenamiento de los cilindros de gas.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "CDT",
        "final_utm": 0,
        "criterio": "Deberán permanecer los cilindros de gas internos y de empresas contratistas en espacio separado, cerrado y ventilado, con acceso restringido, señalizados"
      },
      {
        "dt_code": "1177-q",
        "description": "No remitir el empleador listado actualizado de sus trabajadores al Organismo Administrador de la ley 16.744, para ser incorporados en el Programa de Vigilancia de la Salud por exposición a Sílice.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "CDT",
        "final_utm": 0,
        "criterio": "Listado de trabajadores que ingresan a vigilancia medica, solicitar a Mutual apertura del portal / cumplir con cronograma de trabajo ."
      },
      {
        "dt_code": "2601 - d",
        "description": "No adoptar las medidas para suspender inmediatamente las faenas por riesgo que no se pueda eliminar o atenuar.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "CDT",
        "final_utm": 0,
        "criterio": "Paralización de faena de acuerdo a los estipulado en PPA"
      },
      {
        "dt_code": "1127-m",
        "description": "No suspender las faenas en forma inmediata y evacuación de los trabajadores por emergencia, catástrofe o desastre.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "CDT",
        "final_utm": 0,
        "criterio": "Evidenciar algún hecho real de catástrofe o Simulacros con informe.\r\ncumplimiento cronograma Plan de emergencia"
      },
      {
        "dt_code": "1127-o",
        "description": "No contar con certificado médico o de aptitud en faenas calificadas como peligrosas o insalubres.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "CDT",
        "final_utm": 0,
        "criterio": "Informe de examen pre u ocupacional, Listado de examen de altura, Prohibición de trabajo en altura,  Instructivo de solicitud de examen de altura firmado, entregado y difundido a toda la línea de control.\r\n(Almacenamiento: Informes digitales en carpeta compartida de OneDrive con encargado de RRHH, informes físicos en archivador N°10 Salud Ocupacional)"
      },
      {
        "dt_code": "1127-p",
        "description": "No mantener las condiciones adecuadas de seguridad y salud laboral en el centro de trabajo/faena para la Vigilancia de los Riesgos Psicosociales en el Trabajo.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS54",
        "final_utm": 0,
        "criterio": "Carta Gantt del Protocolo Psicosocial verificación de cumplimiento / Constitución del Comité de aplicación / Actas de reunión."
      }
    ]
  },
  {
    "id": "S4",
    "num": "S4",
    "legal_body": "D. 44  con entrada en vigencia el 01-02-2025 del Ministerio del Trabajo y Previsión Social.",
    "generic_desc": "Comité Paritario de Higiene y Seguridad",
    "items": [
      {
        "dt_code": "2601 - h",
        "description": "No constituir Comité Paritario de Higiene y Seguridad en empresas / sucursales / faenas con mas de 25 trabajadores.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS54",
        "final_utm": 0,
        "criterio": "Acta de constitución del CPHS presentadas a la DT o correo donde solicita a supervisora de SST la gestión para ingreso a la DT la constitución o actualización del CPHS\r\nCarta donde se deja estipulado que es comité de faena."
      },
      {
        "dt_code": "1134-a",
        "description": "No realizar el Comité Paritario de Higiene y Seguridad al menos una reunión al mes.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS54",
        "final_utm": 0,
        "criterio": "Minuta de reunión del CPHS, verificar puntos principales (inspección, capacitación e investigación de accidentes)\r\nIncluir ítem de participación y consulta en programa del CPHS"
      },
      {
        "dt_code": "1135-a",
        "description": "No cumplir el Comité Paritario de Higiene y Seguridad las funciones encomendadas por la ley. (Comisiones de Trabajo)",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS54",
        "final_utm": 0,
        "criterio": "Minuta de reunión donde se definen las comisiones (Inspección, Investigación de accidentes, capacitación), Programa de trabajo y cumplimiento de sus actividades del PPA.\r\nCurso OPR Aprobado de sus 12 miembros y/o inscrito"
      },
      {
        "dt_code": "1136-a",
        "description": "No cumplir acuerdos del Comité Paritario de Higiene y Seguridad. (Verificación de Actas de Reunión por el empleador).",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS44",
        "final_utm": 0,
        "criterio": "Seguimiento de los acuerdos en la minuta siguiente o según fechas de compromiso, cierre de los acuerdos pendientes ( registro fotográfico adjunta a acta reunión)"
      },
      {
        "dt_code": "2601 - b",
        "description": "No asegurar la consulta y participación de las personas trabajadoras en la gestión de la seguridad y salud en el trabajo",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS44",
        "final_utm": 0,
        "criterio": "Implementación del buzón de consulta y participación, apertura y revisión de las sugerencias del buzón en reunión dejando registrado en minuta."
      }
    ]
  },
  {
    "id": "S5",
    "num": "S5",
    "legal_body": "D. 44 01-02-2025 del Ministerio del Trabajo y Previsión Social.",
    "generic_desc": "Departamento de Prevención de Riesgos",
    "items": [
      {
        "dt_code": "1137-b",
        "description": "No ser dirigido el Departamento de Prevención de Riesgos por un experto en prevención, conforme a las jornadas necesarias por el N° de trabajadores y riesgo de la empresa.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS44",
        "final_utm": 0,
        "criterio": "Contrato de trabajo del experto, copia de la resolución de SEREMI"
      },
      {
        "dt_code": "1137 - c",
        "description": "No asesorar y desarrollar el Departamento de Prevención de Riesgos lo pertinente con las funciones mínimas. (No poseer Plan de Trabajo)",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS44",
        "final_utm": 0,
        "criterio": "Sistema de Gestión Seguridad y Salud en el trabajo, \r\nPersonalizado a través de FOCO PREVENCIÓN, programa de capacitación SST y verificación de cumplimiento de cada uno."
      },
      {
        "dt_code": "1138 - a",
        "description": "No dar cumplimiento a las medidas de prevención de riesgos sugeridas por el Departamento de Prevención de Riesgos.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS44",
        "final_utm": 0,
        "criterio": "Informe semanal con cumplimiento de las actividades programadas, incluir las capacitaciones, casuística de reportabilidad e incidencia, verificar que estén ingresados los accidentes, incidentes, paralización y sanciones asociadas\r\nSeguimiento y cierre de las tolerancias cero. Lista chequeo coordinadora o correo durante  visita al centro de trabajo."
      }
    ]
  },
  {
    "id": "S6",
    "num": "S6",
    "legal_body": "Ley 16.744",
    "generic_desc": "Programa de Seguridad en Trabajo  (Empresa - Asociación Chilena de Seguridad)",
    "items": [
      {
        "dt_code": "2601 - s",
        "description": "No adoptar y/o poner en práctica las medidas prescritas por el organismo administrador de la Ley 16.744 en los informes técnicos entregados por MUTUAL (Evidencia de cumplimiento por parte de la empresa).",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "LEY 16744",
        "final_utm": 0,
        "criterio": "Asesoría y visitas del organismo administrador\r\nInforme de seguimiento y cierre de los hallazgos y/o recomendaciones."
      },
      {
        "dt_code": "1140-a",
        "description": "No denunciar al Organismo Administrador el accidente o enfermedad que pueda ocasionar incapacidad para el trabajo (generación de las DIAT cuando corresponda)",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "LEY 16744",
        "final_utm": 0,
        "criterio": "DIAT o DIEP según corresponda, ante accidentes o enfermedades profesionales, debe estar recepcionada físicamente o digital (mantener correo impreso comprobante de recepción de documentos)."
      }
    ]
  },
  {
    "id": "S7",
    "num": "S7",
    "legal_body": "D.S. 594 de 1999, del Ministerio del Trabajo y Previsión Social.",
    "generic_desc": "Programa de Trabajo en Higiene Industrial",
    "items": [
      {
        "dt_code": "1160-b",
        "description": "No adoptar las medidas de control para captar los agentes contaminantes desprendidos en su origen y evitar su dispersión.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS594",
        "final_utm": 0,
        "criterio": "Visualizar en terreno sistema de extracción o humectación en equipos, Matriz IPER señalar medidas ing.-adm., inspecciones de sílice y ruido, incluir el detalle en el programa los controles aplicados, registro de humectación, registro de sala de aspirado"
      },
      {
        "dt_code": "1174-b",
        "description": "No controlar el riesgo por exposición a sustancias químicas o a agentes físicos en los lugares de trabajo.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS594",
        "final_utm": 0,
        "criterio": "1.- Procedimiento de almacenamiento y manejo de sustancias peligrosas, difundido a todas las personas trabajadoras, incluyendo a empresas contratista\r\n2.- Procedimiento para la gestión de residuos peligrosos y no peligrosos, difundido a todas las personas trabajadoras, incluyendo a empresas contratistas\r\n3.- Matriz IPER, sean visual humectación, \r\n4.- Estación ambiental para control de derrame, \r\n5.- Estación de sombra e hidratación."
      },
      {
        "dt_code": "1174-c",
        "description": "No realizar evaluación de riesgos de las sustancias químicas o los agentes físicos presentes en los lugares de trabajo.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS594",
        "final_utm": 0,
        "criterio": "1.- Matriz de evaluación de aspectos e impactos ambientales\r\n 2.- Matriz IPER impresa, firmada y entregada a la jefatura correspondiente, difundida a las personas trabajadoras"
      }
    ]
  },
  {
    "id": "S8",
    "num": "S8",
    "legal_body": "D.S. 594 de 1999, del Ministerio del Trabajo y Previsión Social.",
    "generic_desc": "Aplicación de Protocolos de Salud Ocupacional (Ministerio de Salud)",
    "items": [
      {
        "dt_code": "1175-b",
        "description": "No contar con programa escrito teórico - práctico para controlar la exposición al ruido, conforme al Protocolo de exposición a ruido \"PREXOR\" (Decreto 1029 EXENTO).",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS594",
        "final_utm": 0,
        "criterio": "Se revisa Actividades del Programa Capacitación PREXOR, mantener actualizado durabilidad de obra."
      },
      {
        "dt_code": "1175-i",
        "description": "No contar con programa escrito teórico - practico de protección y prevención contra la exposición ocupacional a radiación UV solar.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS594",
        "final_utm": 0,
        "criterio": "Se revisa actividades del Programa Capacitación RUV, mantener actualizado durabilidad de obra."
      },
      {
        "dt_code": "1176-k",
        "description": "No evaluar los factores de riesgo asociados a trastornos músculo esqueléticos de las extremidades superiores y generar programa para su control.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS594",
        "final_utm": 0,
        "criterio": "Identificación Inicial de todos los puestos de trabajo, evaluación de los puestos expuesto en portal de Mutual de Seguridad, plan de acción para los puestos.\r\nPrograma  Musculo esquelético TMERT difundido a todo el personal interno, externo y línea de control.\r\nCronograma de actividades TMERT."
      }
    ]
  },
  {
    "id": "S9",
    "num": "S9",
    "legal_body": "D.S. Nº 63, de 2005, del Ministerio del Trabajo y Previsión Social.",
    "generic_desc": "Gestión de los Riesgos por Manejo Manual de Cargas",
    "items": [
      {
        "dt_code": "1179-f",
        "description": "No evaluar los riesgos derivados del manejo manual de carga. (Informe técnico de verificación).",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS63",
        "final_utm": 0,
        "criterio": "Identificación Inicial de todos los puestos de trabajo, Evaluación a través de la Planilla del MMC  o portal de Mutual de Seguridad."
      },
      {
        "dt_code": "1179-c",
        "description": "No contar con un programa de formación e instrucción satisfactorio para el manejo manual de carga de los trabajadores",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS63",
        "final_utm": 0,
        "criterio": "Programa de MMC /Procedimiento manejo manual de carga en físico y difundido"
      },
      {
        "dt_code": "1179-d",
        "description": "No capacitar a los trabajadores en los métodos correctos para el manejo manual de carga. (Registro de capacitación)",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS63",
        "final_utm": 0,
        "criterio": "Registros de capacitación ingreso de personal y programa de capacitación SST y CPHS"
      }
    ]
  },
  {
    "id": "S10",
    "num": "S10",
    "legal_body": "D.S. 594 de 1999, del Ministerio del Trabajo y Previsión Social.",
    "generic_desc": "Condiciones Básicas de Seguridad  en los Lugares de Trabajo",
    "items": [
      {
        "dt_code": "1142-a",
        "description": "No contar con pavimentos y revestimientos de los pisos en las secciones o áreas de trabajo.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS594",
        "final_utm": 0,
        "criterio": "Visual instalación de faena (vestidores, comedor, baños, oficinas, bodega) verificar que sean sólidos y no resbaladizos pasillo de tránsito expedito, ancho no menor 1,50 mts BODEGAS DE SUSTANCIAS CON PISOS DE MATERIAL RESISTENTE E IMPERMEABLE"
      },
      {
        "dt_code": "1142-b",
        "description": "No mantener en los lugares de trabajo las condiciones sanitarias y ambientales necesarias.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS594",
        "final_utm": 0,
        "criterio": "Registro de sanitización, visual (cantidad y distancia de baños, duchas, casilleros, luminaria, agua, sillas, mesones, refrigeración, calentador de alimentos, climatización)"
      },
      {
        "dt_code": "1144-a",
        "description": "No mantener los pisos y pasillos de tránsito libres de obstáculos para un seguro desplazamiento.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS594",
        "final_utm": 0,
        "criterio": "Visual instalación de faena (vestidores, comedor, baños, oficinas, bodega) verificar que sean solidos y no resbaladizos pasillo de transito expedito, no menor 150 cm.\r\nTerreno pasillos libres de obstáculos de preferencia cercados o delimitados"
      },
      {
        "dt_code": "1148-a",
        "description": "No mantener los lugares de trabajo en buenas condiciones de orden y limpieza.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS594",
        "final_utm": 0,
        "criterio": "Visual mantener despejada vías de acceso y áreas de trabajo, además  de mantener habilitado puntos de acopio según exigencia, prendas o artículos personales fuera de casilleros, consumir alimentos lugares autorizados)"
      },
      {
        "dt_code": "1162-a",
        "description": "No contar los lugares de trabajo con elementos estructurales  e instalaciones en condiciones seguras.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS594",
        "final_utm": 0,
        "criterio": "Visual, lockers, estanterías, escalas, dawer o estacas, tableros eléctricos, armado de losa, Postes, plataforma de trabajo, andamios, ring perimetral, carreras, trepas, cierre perimetrales ( excavaciones, generadores, grúa torres, perímetro de obra)etc."
      },
      {
        "dt_code": "1164 - a",
        "description": "No estar debidamente protegidas las partes móviles y otras de las maquinarias y equipos de trabajo.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS594",
        "final_utm": 0,
        "criterio": "Visual, código de colores equipos y herramientas, se considera extensión eléctrica, inspección de móviles  funcionamiento de los sistemas de seguridad de la maquinaria (sonoros y luminosos), sectorizar las zonas de trabajos de maquinarias."
      },
      {
        "dt_code": "1163 - d",
        "description": "No contar con señalización visible y permanente las zonas de peligro y en los equipos de trabajo críticos de la empresa.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS594",
        "final_utm": 0,
        "criterio": "Visual, excavación profunda, caída de material, trabajo en altura, espacios confinados, riesgos eléctricos,  tránsito de maquinaria, andamio colgante, señalética terracon en plataforma de trabajo establecida."
      },
      {
        "dt_code": "1152- d",
        "description": "No contar el o los servicios higiénicos en su interior, con jabón líquido para la limpieza de manos, sistemas higiénicos desechables para el secado de manos y papel higiénico en cantidad suficiente.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS594",
        "final_utm": 0,
        "criterio": "Visual"
      },
      {
        "dt_code": "1174-g",
        "description": "Realizar trabajo sin protección personal, en ambientes en que la atmosfera tenga menos de 18% de oxigeno",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS594",
        "final_utm": 0,
        "criterio": "Permiso de trabajo (revisar cual)"
      },
      {
        "dt_code": "1174-h",
        "description": "Realizar trabajos sin aplicar humectación u otro método de control, cuando exista sílice.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS594",
        "final_utm": 0,
        "criterio": "Visual, registro de humectación"
      }
    ]
  },
  {
    "id": "S11",
    "num": "S11",
    "legal_body": "D.S. 594 de 1999 / Decreto 44, del Ministerio del Trabajo y Previsión Social.",
    "generic_desc": "Elementos de Protección Personal",
    "items": [
      {
        "dt_code": "2600 - p",
        "description": "No proporcionar los elementos de protección personal necesarios para las labores efectuadas y/o no contar con el procedimiento que considere la utilización y mantenimiento de los elementos de protección persona, así como, su reposición y recambio.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS594",
        "final_utm": 0,
        "criterio": "Visual uso de EPP durante el recorrido, Registros entrega de epp"
      },
      {
        "dt_code": "2600 - t",
        "description": "No contar con la capacitación teórica - práctica del uso y mantención de los EPP, con duración mínima de 1 hora cronológica y vigencia de 1 año.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS594",
        "final_utm": 0,
        "criterio": "Procedimiento uso de epp en físico, firmado difundido / capacitación al ingreso / Capacitación teórico - práctico con evidencia fotográfica de la actividad práctica y vigencia de 1 año."
      },
      {
        "dt_code": "2600 - r",
        "description": "No proporcionar elementos de protección personal que cumplan con los requisitos, características y tipos que exige el riesgo a cubrir, deberán cumplir con las normas vigentes de certificación de calidad o encontrarse registrado en el instituto de salud pública de Chile.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS594",
        "final_utm": 0,
        "criterio": "Certificación de los epp / planilla de evaluación EPP"
      }
    ]
  },
  {
    "id": "S12",
    "num": "S12",
    "legal_body": "D.S. 594 de 1999, del Ministerio del Trabajo y Previsión Social.",
    "generic_desc": "Plan de Evacuación - Condiciones de Seguridad en Emergencia",
    "items": [
      {
        "dt_code": "1163-b",
        "description": "No mantener vías de escape o evacuación libre de obstrucciones y señalizadas adecuadamente.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS594",
        "final_utm": 0,
        "criterio": "Visual, la vías donde exista personal trabajando deben permanecer libres de obstáculos y estas deben estar señalizadas."
      },
      {
        "dt_code": "1163-c",
        "description": "Mantener con llaves u obstáculos las vías de escape que posee la empresa",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS594",
        "final_utm": 0,
        "criterio": "Visual"
      },
      {
        "dt_code": "1169-b",
        "description": "No contar con extintores suficientes de acuerdo a la superficie de metros cuadrados del local de trabajo y el tipo de estos.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS594",
        "final_utm": 0,
        "criterio": "Inspección de extintores, Planilla de ubicación de extintores, \r\nTrabajos en caliente y eléctrico panel sip con extintor PQS de 4 kg"
      },
      {
        "dt_code": "1171-a",
        "description": "No instruir ni entrenar a los trabajadores respecto de la manera de usar los extintores de incendio en caso de emergencia. (Capacitación uso de extintores).",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS594",
        "final_utm": 0,
        "criterio": "Capacitación de ingreso, anualmente coordinar capacitación con proveedor o bomberos según programa SST"
      },
      {
        "dt_code": "1167 - c",
        "description": "No mantener un plan detallado para enfrentar emergencias derivadas de sustancias peligrosas",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS594",
        "final_utm": 0,
        "criterio": "Plan de GRD, incorporando el almacenamiento de sustancias peligrosas\r\n Croquis actualizado y publicado al exterior de la bodega, que contemple la distribución de las sustancias almacenadas en su interior\r\nListado de sustancias almacenadas con sus especificaciones.\r\nSimulacro de derrame"
      }
    ]
  },
  {
    "id": "S13",
    "num": "S13",
    "legal_body": "Articulo 76 del Ley 16.744 del Ministerio del Trabajo y Previsión Social",
    "generic_desc": "Aplicación de Circular  en Accidentes Graves y Fatales",
    "items": [
      {
        "dt_code": "1140-b",
        "description": "No informar inmediatamente a la Inspección del Trabajo el accidente fatal y grave. (Procedimiento accidente fatal o grave)",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "C2345",
        "final_utm": 0,
        "criterio": "Verificar que se cumpla el Procedimiento ante un accidente grave o fatal\r\nRegistro de notificación a las entidades\r\nRegistro de alzamiento de paralización de faena"
      },
      {
        "dt_code": "1140-c",
        "description": "No suspender las faenas por accidente fatal y grave.  (Procedimiento accidente fatal o grave)",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "C2345",
        "final_utm": 0,
        "criterio": "Verificar que se cumpla el Procedimiento ante un accidente grave o fatal\r\nRegistro de notificación a las entidades\r\nRegistro de alzamiento de paralización de faena"
      },
      {
        "dt_code": "1140-d",
        "description": "No permitir a los trabajadores la evacuación del lugar de trabajo por accidente fatal y grave.  (Procedimiento accidente fatal o grave)",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "C2345",
        "final_utm": 0,
        "criterio": "Verificar que se cumpla el Procedimiento ante un accidente grave o fatal\r\nRegistro de notificación a las entidades\r\nRegistro de alzamiento de paralización de faena"
      },
      {
        "dt_code": "1140-e",
        "description": "Reanudar las faenas sin que se verifique que se han subsanado las deficiencias que provocó el accidente fatal y grave.  (Procedimiento accidente fatal o grave)",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "C2345",
        "final_utm": 0,
        "criterio": "Verificar que se cumpla el Procedimiento ante un accidente grave o fatal\r\nRegistro de notificación a las entidades\r\nRegistro de alzamiento de paralización de faena"
      }
    ]
  },
  {
    "id": "S14",
    "num": "S14",
    "legal_body": "D.S. Nº 76 de 18.01.2007, del MINTRAB, en relación con el artículo 66 bis de la ley Nº 16.744.",
    "generic_desc": "Sistema de Gestión de Seguridad y Salud en el Trabajo en Subcontratación.",
    "items": [
      {
        "dt_code": "1179 - o",
        "description": "No cumplir el Departamento de Prevención de Riesgos de Faena las funciones encomendadas por la ley.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS76",
        "final_utm": 0,
        "criterio": "Programa de control operacional para empresa contratista"
      },
      {
        "dt_code": "1178 - m",
        "description": "Comité Paritario de Faena, en régimen de subcontratación, no realiza las acciones mínimas.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS76",
        "final_utm": 0,
        "criterio": "Inspección, capacitación e investigación de accidentes"
      },
      {
        "dt_code": "1178-o",
        "description": "No cumplir el Comité Paritario de Higiene y Seguridad de Faena las funciones encomendadas por la Ley. (Plan de Trabajo)",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS76",
        "final_utm": 0,
        "criterio": "Reunión inicial con la invitación a participar a las empresas contratistas, reuniones mensual la participación de contratistas."
      },
      {
        "dt_code": "1178-s",
        "description": "No asumir el Departamento de Prevención de Riesgos Profesionales las funciones del Departamento de Prevención de Riesgos de Faena",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS76",
        "final_utm": 0,
        "criterio": "Plan de Seguridad y Salud Ocupacional, firmado por todos los representantes estipulado en portada."
      },
      {
        "dt_code": "1178-t",
        "description": "No contar el Departamento de Prevención de Riesgos de Faena con los medios y personal necesario",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS76",
        "final_utm": 0,
        "criterio": "Se mantendrá contratado Profesional de SST dando fiel cumplimiento a Plan de seguridad y Salud Ocupacional, Pauta de ingreso de Empresas contratistas"
      },
      {
        "dt_code": "1178-v",
        "description": "No captar o eliminar en forma tal que no causen peligros los gases, vapores, humos, polvo, emanaciones o contaminantes.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS76",
        "final_utm": 0,
        "criterio": "Visual, controles aplicados en obra, identificados en la Matriz"
      }
    ]
  },
  {
    "id": "S15",
    "num": "S15",
    "legal_body": "Lay 21.015 del Ministerio de Desarrollo Social",
    "generic_desc": "Inclusión Laboral",
    "items": [
      {
        "dt_code": "1115-d",
        "description": "No contratar o mantener contratado, la empresa…, al menos el 1% de personas con discapacidad o que sean asignatarios de pensión de invalidez, tratándose de una empresa que cuenta en la actualidad con 100 o más trabajadores. (Desde 01.04.2019, antes 200 trabajadores)",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "LEY 21015",
        "final_utm": 0,
        "criterio": "No aplica para obra"
      },
      {
        "dt_code": "1115-e",
        "description": "No cumplir con las medidas alternativas de celebración y ejecución de contratos de prestación de servicios con empresas que tengan contratadas personas con discapacidad, y que presten servicio en ella, en régimen de subcontratación o bajo modalidad de servicios transitorios; o haber efectuado donaciones en dinero a proyectos o programas de asociaciones o fundaciones que tengan por objetivo la capacitación, rehabilitación, promoción y fomento, creación de empleos, contratación o inserción de personas con discapacidad.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "LEY 21015",
        "final_utm": 0,
        "criterio": "No aplica para obra"
      }
    ]
  },
  {
    "id": "S16",
    "num": "S16",
    "legal_body": "D.S. Nº 76 de 18.01.2007, del MINTRAB, en relación con el artículo 66 bis de la ley Nº 16.744.",
    "generic_desc": "Sistema de Gestión de Seguridad y Salud en el Trabajo en Subcontratación.",
    "items": [
      {
        "dt_code": "1305-a",
        "description": "No implementar la empresa principal un sistema de gestión de la seguridad y salud en el trabajo, en la obra, faena o servicios propios de su giro.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS76",
        "final_utm": 0,
        "criterio": "Reunión inicial con la invitación a participar a las empresas contratistas en sistema de gestión de Terracon / Programa de control operacional para empresas contratista"
      },
      {
        "dt_code": "1305-b",
        "description": "No confeccionar la Empresa Principal un reglamento especial para empresas contratistas y subcontratistas.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS76",
        "final_utm": 0,
        "criterio": "Reglamento Especial de Empresas Contratista"
      },
      {
        "dt_code": "1305-i",
        "description": "No entregar la empresa principal, copia del Reglamento Especial a las Empresas Contratistas y Subcontratistas al inicio de labores.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS76",
        "final_utm": 0,
        "criterio": "Registro de entrega Reglamento Especial de Empresas Contratista"
      },
      {
        "dt_code": "1306-b",
        "description": "No contar la empresa principal en la faena, obra o servicio con un registro que contenga los antecedentes mínimos en materia de seguridad y salud en el trabajo.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS76",
        "final_utm": 0,
        "criterio": "1.- Registro de faena\r\n2.- Los primeros 5 días de ingreso de la empresa subcontratista se deberá generar Orden de subcontratación y una vez cumplido los 30 días desde la fecha de ingreso a obra se deberá  estar contrato civil firmado por representante legal de la EC y  firma de Rep. Legal de Terracon (la fecha de ingreso la pueden cotejar con fecha de enrolamiento de trabajadores en foco)\r\n3.- Solicitar las medidas prescritas por Organismo Administrador\r\n4.- Servicios transitorios deben tener orden de Subcontratación o contrato que los vincule entre sí"
      },
      {
        "dt_code": "1307-c",
        "description": "No formular la empresa contratista o subcontratista un Programa de Trabajo de seguridad y salud laboral aprobado por el representante legal, que incorpora las directrices que le entregue la empresa principal.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS76",
        "final_utm": 0,
        "criterio": "Reunión de inicio, programa de control operacional"
      },
      {
        "dt_code": "1307-d",
        "description": "No confeccionar la empresa principal un Programa de Trabajo de seguridad y salud laboral. .",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS76",
        "final_utm": 0,
        "criterio": "Reunión de inicio, programa de control operacional"
      },
      {
        "dt_code": "1307-e",
        "description": "No contener el Programa de Trabajo de seguridad y salud laboral, las cláusulas mínimas establecida por la ley.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS76",
        "final_utm": 0,
        "criterio": "Reunión de inicio, programa de control operacional"
      },
      {
        "dt_code": "1308-a",
        "description": "No mantener por escrito la información vinculada al Sistema de Gestión de la seguridad y salud en el trabajo.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS76",
        "final_utm": 0,
        "criterio": "Registros asociados a las actividades del personalizado, actualización del programa control operacional y hoja de ruta."
      },
      {
        "dt_code": "1309-a",
        "description": "No cumplir con los acuerdos adoptados por el Comité",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS76",
        "criterio": "Minuta de reunión del CPHS"
      },
      {
        "dt_code": "1311-a",
        "description": "No cumplir la empresa principal, contratista o subcontratista,  con las medidas de prevención indicadas por el Departamento de Prevención de Riesgos de Faena.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS76",
        "final_utm": 0,
        "criterio": "Planilla de Evaluación de Personalizados de contratistas"
      }
    ]
  },
  {
    "id": "S17",
    "num": "S17",
    "legal_body": "DS 18 / Artículo 152 Quáter, y 506 del Código del Trabajo",
    "generic_desc": "Teletrabajo o Trabajo a Distancia",
    "items": [
      {
        "dt_code": "1600-a",
        "description": "No Pactar modalidad de trabajo a distancia o teletrabajo.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS18",
        "final_utm": 0,
        "criterio": "no aplica para obra"
      },
      {
        "dt_code": "1601-a",
        "description": "No informar las condiciones de seguridad y salud que debe cumplir el puesto de trabajo a distancia o teletrabajo.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS18",
        "final_utm": 0,
        "criterio": "no aplica para obra"
      },
      {
        "dt_code": "1601-b",
        "description": "No cumplir con las condiciones de seguridad y salud del puesto de trabajo a distancia o teletrabajo.",
        "status": "PENDIENTE",
        "category": "GRAVE",
        "norm_type": "DS18",
        "final_utm": 0,
        "criterio": "no aplica para obra"
      }
    ]

  }
]);

const stats = computed(() => {
  let cumple = 0, noCumple = 0, noAplica = 0, totalUTM = 0, evaluated = 0, totalItems = 0;
  auditGroups.value.forEach(g => {
    g.items.forEach(i => {
      totalItems++;
      if (i.status !== 'PENDIENTE') evaluated++;
      const uVal = i.status === 'NO CUMPLE' ? getUtmValue(i.category, tramoActual.value) : 0;
      i.final_utm = uVal;
      if (i.status === 'CUMPLE') cumple++;
      else if (i.status === 'NO CUMPLE') { noCumple++; totalUTM += uVal; }
      else if (i.status === 'NO APLICA') noAplica++;
    });
  });
  const total = cumple + noCumple + noAplica || 1;
  return { cumple, noCumple, noAplica, totalUTM, totalCosto: totalUTM * valorUTM.value, percent: Math.round((evaluated/totalItems)*100), evaluated, totalItems, cumplePct: (cumple/total)*100, noCumplePct: (noCumple/total)*100, noAplicaPct: (noAplica/total)*100 };
});

const normativaStats = computed(() => {
  return auditGroups.value.map(g => {
    let cumple = 0, noCumple = 0, noAplica = 0, total = 0;
    g.items.forEach(i => {
      total++;
      if (i.status === 'CUMPLE') cumple++;
      else if (i.status === 'NO CUMPLE') noCumple++;
      else if (i.status === 'NO APLICA') noAplica++;
    });
    
    // El divisor para el % excluye No Aplica
    const divisor = total - noAplica || 1;
    const pct = Math.round((cumple / divisor) * 100);

    return {
      norma: g.generic_desc,
      id: g.id,
      num: g.num,
      cumple,
      noCumple,
      noAplica,
      total,
      divisor,
      pct,
      incumplimientos: g.items.filter(i => i.status === 'NO CUMPLE')
    };
  });
});

const updateItemStatus = (item, status) => { item.status = status; };
const scrollToSegment = (id) => {
  const container = document.querySelector('.content-scroller');
  const el = document.getElementById(id);
  if (el && container) {
    const top = el.offsetTop - 20;
    container.scrollTo({ top, behavior: 'smooth' });
  }
};
const getSegmentStatus = (g) => {
  const ev = g.items.filter(i => i.status !== 'PENDIENTE').length;
  if (ev === 0) return 'pending';
  return ev === g.items.length ? 'done' : 'partial';
};

const isBatching = ref(false);
const triggerProgressiveLoad = async () => {
  if (isBatching.value) return;
  isBatching.value = true;
  loadingAudit.value = true;
  visibleGroups.value = [];
  await nextTick();
  
  const groups = auditGroups.value || [];
  const batchSize = 2;
  
  if (groups.length === 0) {
    loadingAudit.value = false;
    isBatching.value = false;
    return;
  }

  for (let i = 0; i < groups.length; i += batchSize) {
    const batch = groups.slice(i, i + batchSize);
    visibleGroups.value.push(...batch);
    await new Promise(resolve => setTimeout(resolve, 30));
    if (i === 0) loadingAudit.value = false;
  }
  loadingAudit.value = false;
  isBatching.value = false;
};

// --- OPTIMIZACIÓN DE CARGA PROGRESIVA ---
watch(activeTab, async (newVal) => {
  if (newVal === 'audit' && visibleGroups.value.length === 0) {
    triggerProgressiveLoad();
  }
});

// También disparamos la carga si auditGroups cambia profundamente y estamos en la pestaña
watch(auditGroups, () => {
  if (activeTab.value === 'audit' && visibleGroups.value.length === 0) {
    triggerProgressiveLoad();
  }
}, { deep: false }); 

</script>

<style scoped>
.action-btn {
  background: white !important;
  border: 1px solid #e2e8f0 !important;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 1px;
  color: #64748b !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.camera-btn:hover {
  background: #f0f9ff !important;
  border-color: #7dd3fc !important;
  color: #0369a1 !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
}

.docs-btn:hover {
  background: #fdf2f8 !important;
  border-color: #f9a8d4 !important;
  color: #be185d !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
}

.evidence-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
}

.evidence-card {
  position: relative;
  border: 1px solid #dbe3ef;
  border-radius: 12px;
  background: #f8fafc;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 120px;
}

.evidence-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(15, 23, 42, 0.15);
}

.evidence-card.is-image {
  background: #0f172a;
  border-color: #1e293b;
}

.evidence-image {
  width: 100%;
  height: 94px;
  object-fit: cover;
  display: block;
}

.evidence-doc-icon-wrap {
  height: 94px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #eef2ff, #f8fafc);
}

.evidence-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 8px;
  font-size: 11px;
  font-weight: 800;
  color: #475569;
  background: white;
}

.evidence-card.is-image .evidence-meta {
  background: rgba(2, 6, 23, 0.92);
  color: #e2e8f0;
}

.evidence-ext {
  font-size: 9px;
  color: #64748b;
  font-weight: 900;
}

.evidence-remove-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 2;
}

.group-transition {
  animation: slideUp 0.4s ease-out forwards;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.auditoria-legal-app { font-family: 'Inter', sans-serif; color: #1e293b; height: 100dvh; display: flex; flex-direction: column; overflow: hidden; }
.header-gradient { background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); }
.tab-modern { text-transform: none; font-weight: 700; font-size: 0.75rem; color: rgba(255,255,255,0.7) !important; }
.tab-modern.v-tab--selected { color: white !important; border-bottom: 2px solid white; }
.field-label-min { font-size: 0.65rem; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
.border-soft { border: 1px solid #e2e8f0 !important; }
.modern-input-min :deep(.v-field) { background-color: #f1f5f9; border-radius: 12px; font-size: 0.8rem; font-weight: 600; }
.orange-square-icon { width: 48px; height: 48px; background: #e65100; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 1.2rem; font-style: italic; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2); }
.border-orange-600 { border-bottom: 4px solid #ea580c !important; }
.divider-v { width: 1px; height: 24px; background: rgba(255,255,255,0.2); }
.custom-scrollbar::-webkit-scrollbar { width: 8px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.btn-calif { padding: 10px 16px; border-radius: 12px; font-weight: 800; font-size: 0.65rem; border: 1px solid #e2e8f0; background: white; color: #94a3b8; transition: all 0.2s; text-transform: uppercase; }
.btn-calif.active.cumple { background: #16a34a; color: white; border-color: #15803d; }
.btn-calif.active.no-cumple { background: #dc2626; color: white; border-color: #b91c1c; }
.btn-calif.active.no-aplica { background: #475569; color: white; border-color: #1e293b; }
.border-l-md { border-left: 1px solid #f1f5f9; }
.fixed-gps-btn { position: fixed; right: 40px; bottom: 80px; z-index: 100; }
.fixed-gps-panel { position: fixed; right: 24px; bottom: 80px; z-index: 101; }
.gps-grid-modern { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; }
.gps-box-modern { aspect-ratio: 1; border-radius: 10px; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 900; cursor: pointer; transition: all 0.2s; background: white; color: #64748b; }
.gps-box-modern:hover { transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
.gps-box-modern.pending { background: #f8fafc; color: #cbd5e1; border-style: dashed; }
.gps-box-modern.partial { background: #fff7ed; color: #f97316; border-color: #fdba74; }
.gps-box-modern.done { background: #f0fdf4; color: #16a34a; border-color: #86efac; }
.letter-spacing-tight { letter-spacing: -0.025em; }
.modern-table :deep(th) { font-size: 0.65rem !important; }
.modern-table :deep(td) { font-size: 0.75rem !important; border-bottom: 1px solid #f1f5f9 !important; }
.content-scroller { scroll-behavior: smooth; }
@media (max-width: 960px) { .border-l-md { border-left: none; border-top: 1px solid #f1f5f9; padding-top: 2rem; } }



</style>
