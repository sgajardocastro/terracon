<template>
  <div
    class="h-100 d-flex flex-column"
    :class="props.hideHeader ? 'pa-0' : 'pa-1'"
  >
    <v-card
      class="surface-card flex-grow-1 d-flex flex-column"
      variant="outlined"
      style="border-color: #e2e8f0; border-radius: 12px; background-color: white;"
    >
      <!-- Header Sakai -->
      <div
        v-if="!props.hideHeader"
        class="pa-3 d-flex align-center justify-space-between border-b"
      >
        <div class="d-flex align-center">
          <div class="icon-box mr-3">
            <v-icon
              color="primary"
              icon="mdi-clipboard-check-outline"
            />
          </div>
          <div>
            <div class="text-subtitle-2 font-weight-bold text-primary-dark">
              Asignaciones
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ subtituloAsignaciones }}
            </div>
          </div>
        </div>

        <v-chip
          size="small"
          color="primary"
          variant="flat"
          class="font-weight-bold"
        >
          {{ tablaPadresFiltrada.length }} registros
        </v-chip>
      </div>

      <div class="px-2 pt-1 pb-1 border-b bg-grey-lighten-5">
        <v-row
          dense
          class="align-center"
        >
          <v-col
            cols="12"
            md="5"
          >
            <v-text-field
              v-model="searchAsignaciones"
              class="buscador-asignaciones"
              density="compact"
              variant="outlined"
              hide-details
              clearable
              prepend-inner-icon="mdi-magnify"
              placeholder="Buscar en asignaciones (IC, Orden, Proyecto, GIO, Cliente, Dirección, Estado, etc.)"
            />
          </v-col>
          <v-col
            cols="12"
            md="5"
          >
            <div class="d-flex flex-wrap align-center ga-1">
              <v-chip
                size="x-small"
                class="estado-chip-filter"
                :style="estadoFiltroAll ? estadoFilterStyles.TODOS : estadoFilterStyles.OFF"
                @click="onToggleEstadoAll(!estadoFiltroAll)"
              >
                <v-icon
                  start
                  size="16"
                >
                  {{ estadoFiltroAll ? 'mdi-checkbox-marked' : 'mdi-checkbox-blank-outline' }}
                </v-icon>
                Todos
              </v-chip>
              <v-chip
                v-for="estadoFiltro in estadoFiltrosDisponibles"
                :key="estadoFiltro.key"
                size="x-small"
                class="estado-chip-filter"
                :style="isEstadoFiltroActivo(estadoFiltro.key) ? estadoFilterStyles[estadoFiltro.key] : estadoFilterStyles.OFF"
                @click="toggleEstadoFiltro(estadoFiltro.key)"
              >
                <v-icon
                  start
                  size="16"
                >
                  {{ isEstadoFiltroActivo(estadoFiltro.key) ? 'mdi-checkbox-marked' : 'mdi-checkbox-blank-outline' }}
                </v-icon>
                {{ estadoFiltro.label }}
              </v-chip>
            </div>
          </v-col>
          <v-col
            cols="12"
            md="2"
            class="d-flex justify-end align-center ga-2"
          >
            <v-btn
              color="primary"
              size="small"
              prepend-icon="mdi-file-excel"
              @click="emit('open-excel')"
            >
              {{ cargarExcelLabel }}
            </v-btn>
            <v-tooltip
              text="Ver cargas"
              location="top"
            >
              <template #activator="{ props: tip }">
                <v-btn
                  v-bind="tip"
                  icon
                  variant="text"
                  color="primary"
                  size="small"
                  @click="emit('open-cargas')"
                >
                  <v-icon>mdi-table-eye</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
          </v-col>
        </v-row>
      </div>

      <v-card-text class="pa-0 flex-grow-1 position-relative">
        <v-overlay
          :model-value="cargandoAsignaciones"
          contained
          persistent
          class="align-center justify-center"
          scrim="rgba(255,255,255,0.6)"
        >
          <div class="d-flex flex-column align-center">
            <v-progress-circular
              indeterminate
              color="primary"
              size="36"
              width="4"
            />
            <div class="text-caption text-medium-emphasis mt-2">
              Procesando asignaciones...
            </div>
          </div>
        </v-overlay>

        <div
          ref="topScrollRef"
          class="x-scroll x-scroll-top"
          @scroll="onScroll('top')"
        >
          <div :style="{ width: scrollContentWidth, height: '1px' }" />
        </div>

        <div class="table-scroll-wrap">
          <v-table
            ref="tableRef"
            class="tabla-sakai text-caption bg-transparent"
            density="compact"
            fixed-header
            :height="tableHeight"
            hover
          >
            <thead>
              <tr>
                <th class="bg-grey-lighten-5 text-grey-darken-2 font-weight-bold th-expander border-b" />

                <th class="bg-grey-lighten-5 text-grey-darken-2 font-weight-bold text-uppercase border-b th-certificadora">
                  CERTIF.
                </th>
                <th class="bg-grey-lighten-5 text-grey-darken-2 font-weight-bold text-uppercase border-b th-proyecto">
                  PROYECTO
                </th>
                <th class="bg-grey-lighten-5 text-grey-darken-2 font-weight-bold text-uppercase border-b th-ic-sap">
                  IC_SAP MG
                </th>
                <th class="bg-grey-lighten-5 text-grey-darken-2 font-weight-bold text-uppercase border-b th-id">
                  N° ORDEN
                </th>
                <th class="bg-grey-lighten-5 text-grey-darken-2 font-weight-bold text-uppercase border-b th-gio">
                  GIO
                </th>
                <th class="bg-grey-lighten-5 text-grey-darken-2 font-weight-bold text-uppercase border-b th-supervisor">
                  SUP. TERRACON
                </th>
                <th class="bg-grey-lighten-5 text-grey-darken-2 font-weight-bold text-uppercase border-b th-tecnico">
                  TÉCNICO
                </th>
                <th class="bg-grey-lighten-5 text-grey-darken-2 font-weight-bold text-uppercase border-b th-fecha">
                  FECHA
                </th>
                <th class="bg-grey-lighten-5 text-grey-darken-2 font-weight-bold text-uppercase border-b th-direccion">
                  DIRECCIÓN Y COMUNA
                </th>
                <th class="bg-grey-lighten-5 text-grey-darken-2 font-weight-bold text-uppercase border-b text-center th-hora-llegada">
                  HORA LLEGADA T.
                </th>
                <th class="bg-grey-lighten-5 text-grey-darken-2 font-weight-bold text-uppercase border-b th-estado-cnx">
                  ESTADO
                </th>
                <th class="bg-grey-lighten-5 text-grey-darken-2 font-weight-bold text-uppercase border-b th-proyecto">
                  CLIENTE
                </th>
                <th class="bg-grey-lighten-5 text-grey-darken-2 font-weight-bold text-uppercase border-b th-supervisor">
                  FONOS
                </th>
                <th class="bg-grey-lighten-5 text-grey-darken-2 font-weight-bold text-uppercase border-b th-charla">
                  CHARLA
                </th>
                <th class="bg-grey-lighten-5 text-grey-darken-2 font-weight-bold text-uppercase border-b th-charla">
                  ATS
                </th>
                <th class="bg-grey-lighten-5 text-grey-darken-2 font-weight-bold text-uppercase border-b th-charla">
                  T. ALTURA
                </th>
                <th class="bg-grey-lighten-5 text-grey-darken-2 font-weight-bold text-uppercase border-b th-cliente-obs">
                  OBSERVACIÓN
                </th>

                <th
                  class="bg-grey-lighten-5 text-grey-darken-2 font-weight-bold text-uppercase border-b text-center th-pdf"
                >
                  PDF
                </th>
                <th
                  v-if="props.registroInformes"
                  class="bg-grey-lighten-5 text-grey-darken-2 font-weight-bold text-uppercase border-b text-center th-informe"
                >
                  Informe
                </th>
              </tr>
            </thead>

            <tbody>
              <template
                v-for="item in tablaPadresFiltrada"
                :key="item.id_survey"
              >
                <!-- =======================
                   FILA PADRE
                   ======================= -->
                <tr class="row-hover transition-swing">
                  <!-- Chevron -->
                  <td class="td-expander border-b">
                    <div class="d-flex align-center justify-center">
                      <v-btn
                        v-if="tieneHijos(item.id_survey)"
                        icon
                        variant="text"
                        size="x-small"
                        color="primary"
                        @click.stop="abrirModalDetalle(item)"
                      >
                        <v-icon size="20">
                          mdi-eye-outline
                        </v-icon>
                      </v-btn>
                      <v-tooltip
                        text="Editar"
                        location="top"
                      >
                        <template #activator="{ props }">
                          <v-btn
                            v-bind="props"
                            icon
                            variant="text"
                            size="x-small"
                            :color="colorIconoEditar(item)"
                            @click.stop="abrirModalEditar(item)"
                          >
                            <v-icon
                              size="20"
                              :class="{ 'blink-red-pencil': isPreCreado(item) }"
                            >
                              mdi-pencil-outline
                            </v-icon>
                          </v-btn>
                        </template>
                      </v-tooltip>
                    </div>
                  </td>

                  <td class="border-b text-medium-emphasis text-center">
                    <span class="cell-1line">{{ item.certificadora || '—' }}</span>
                  </td>
                  <td class="border-b text-medium-emphasis">
                    <span class="cell-1line">{{ item.proyecto || '—' }}</span>
                  </td>
                  <td class="border-b text-medium-emphasis">
                    <span class="cell-1line">{{ item.ic_sap_mg || '—' }}</span>
                  </td>
                  <td class="border-b font-weight-bold text-medium-emphasis">
                    {{ item.orden || item.id_survey }}
                  </td>
                  <td class="border-b text-medium-emphasis">
                    <v-tooltip
                      v-if="item.gio"
                      location="top"
                    >
                      <template #activator="{ props: tip }">
                        <span
                          v-bind="tip"
                          class="cell-1line text-center"
                        >{{ item.gio }}</span>
                      </template>
                      <span>{{ item.gio }}</span>
                    </v-tooltip>
                    <span
                      v-else
                      class="cell-1line text-center"
                    >&#8212;</span>
                  </td>
                  <td class="border-b text-medium-emphasis">
                    <v-tooltip
                      v-if="item.nombre_supervisor"
                      location="top"
                    >
                      <template #activator="{ props: tip }">
                        <span
                          v-bind="tip"
                          class="cell-1line"
                        >{{ item.nombre_supervisor }}</span>
                      </template>
                      <span>{{ item.nombre_supervisor }}</span>
                    </v-tooltip>
                    <span
                      v-else
                      class="cell-1line"
                    >&#8212;</span>
                  </td>
                  <td class="border-b text-medium-emphasis">
                    <v-tooltip
                      v-if="getNombreTecnicoAsignado(item)"
                      location="top"
                    >
                      <template #activator="{ props: tip }">
                        <span
                          v-bind="tip"
                          class="cell-1line"
                        >{{ getNombreTecnicoAsignado(item) }}</span>
                      </template>
                      <span>{{ getNombreTecnicoAsignado(item) }}</span>
                    </v-tooltip>
                    <span
                      v-else
                      class="cell-1line"
                    >&#8212;</span>
                  </td>
                  <td class="border-b text-medium-emphasis">
                    <span class="cell-1line">{{ formatDateDisplay(item.fecha_tabla)
                    }}</span>
                  </td>
                  <td class="border-b text-medium-emphasis">
                    <v-tooltip
                      v-if="item.direccion_comuna"
                      location="top"
                    >
                      <template #activator="{ props: tip }">
                        <span
                          v-bind="tip"
                          class="cell-1line"
                        >{{ item.direccion_comuna }}</span>
                      </template>
                      <span>{{ item.direccion_comuna }}</span>
                    </v-tooltip>
                    <span
                      v-else
                      class="cell-1line"
                    >&#8212;</span>
                  </td>
                  <td class="border-b text-medium-emphasis td-hora-llegada">
                    <v-tooltip
                      v-if="item.hora_llegada_tecnico"
                      location="top"
                    >
                      <template #activator="{ props: tip }">
                        <span
                          v-bind="tip"
                          class="cell-1line text-center"
                        >{{ formatGenericDisplay(item.hora_llegada_tecnico) }}</span>
                      </template>
                      <span>{{ formatGenericDisplay(item.hora_llegada_tecnico) }}</span>
                    </v-tooltip>
                    <span
                      v-else
                      class="cell-1line text-center"
                    >&#8212;</span>
                  </td>
                  <td class="border-b text-medium-emphasis">
                    <v-tooltip
                      v-if="getEstadoInternoConexion(item)"
                      location="top"
                    >
                      <template #activator="{ props: tip }">
                        <v-chip
                          v-bind="tip"
                          size="x-small"
                          variant="flat"
                          class="font-weight-bold"
                          :style="getEstadoChipStyle(getEstadoInternoConexion(item))"
                        >
                          {{ getEstadoUiLabel(getEstadoInternoConexion(item)) }}
                        </v-chip>
                      </template>
                      <span>{{ getEstadoInternoConexion(item) }}</span>
                    </v-tooltip>
                    <span
                      v-else
                      class="cell-1line"
                    >&#8212;</span>
                  </td>
                  <td class="border-b text-medium-emphasis">
                    <v-tooltip
                      v-if="item.cliente"
                      location="top"
                    >
                      <template #activator="{ props: tip }">
                        <span
                          v-bind="tip"
                          class="cell-1line"
                        >{{ item.cliente }}</span>
                      </template>
                      <span>{{ item.cliente }}</span>
                    </v-tooltip>
                    <span
                      v-else
                      class="cell-1line"
                    >&#8212;</span>
                  </td>
                  <td class="border-b text-medium-emphasis">
                    <span class="cell-1line">{{ item.fonos || '—' }}</span>
                  </td>
                  <td class="border-b text-medium-emphasis">
                    <span class="cell-1line">{{ formatSiODash(item.charla) }}</span>
                  </td>
                  <td class="border-b text-medium-emphasis">
                    <span class="cell-1line">{{ formatSiODash(item.ats) }}</span>
                  </td>
                  <td class="border-b text-medium-emphasis">
                    <span class="cell-1line">{{ formatSiODash(item.t_altura) }}</span>
                  </td>
                  <td class="border-b text-medium-emphasis">
                    <v-tooltip
                      v-if="item.observacion"
                      location="top"
                    >
                      <template #activator="{ props: tip }">
                        <span
                          v-bind="tip"
                          class="cell-1line"
                        >{{ item.observacion }}</span>
                      </template>
                      <span>{{ item.observacion }}</span>
                    </v-tooltip>
                    <span
                      v-else
                      class="cell-1line"
                    >&#8212;</span>
                  </td>

                  <!-- PDF -->
                  <td class="border-b text-center">
                    <v-btn
                      v-if="getPdfUrl(item)"
                      icon
                      size="x-small"
                      variant="text"
                      color="error"
                      :href="getPdfUrl(item)"
                      target="_blank"
                      rel="noopener"
                    >
                      <v-icon size="20">
                        mdi-file-pdf-box
                      </v-icon>
                    </v-btn>
                    <span
                      v-else
                      class="text-disabled"
                    >—</span>
                  </td>

                  <!-- Informe -->
                  <td
                    v-if="props.registroInformes"
                    class="border-b text-center"
                  >
                    <v-btn
                      v-if="item.url_doc_registro"
                      icon
                      size="x-small"
                      variant="text"
                      color="success"
                      :href="item.url_doc_registro"
                      target="_blank"
                      rel="noopener"
                    >
                      <v-icon size="20">
                        mdi-file-excel-box
                      </v-icon>
                    </v-btn>
                    <span
                      v-else
                      class="text-disabled"
                    >—</span>
                  </td>
                </tr>

                <!-- =======================
                   FILA HIJOS (se despliega)
                   ======================= -->
                <tr
                  v-if="isExpanded(item.id_survey) && (hijosByPadre.get(Number(item.id_survey))?.length)"
                  class="bg-grey-lighten-5"
                >
                  <td
                    :colspan="props.registroInformes
                      ? 20
                      : 19"
                    class="pa-0 border-b"
                  >
                    <div class="pa-3 pl-10">
                      <v-card
                        variant="outlined"
                        style="border-color: #e2e8f0; border-radius: 8px;"
                      >
                        <v-table
                          density="compact"
                          class="text-caption bg-white"
                        >
                          <thead>
                            <tr>
                              <th class="bg-grey-lighten-4 text-grey-darken-1 font-weight-bold child-th-id">
                                Id
                              </th>
                              <th class="bg-grey-lighten-4 text-grey-darken-1 font-weight-bold child-th-nombre">
                                Nombre
                              </th>
                              <th class="bg-grey-lighten-4 text-grey-darken-1 font-weight-bold child-th-codigo">
                                Código
                              </th>
                              <th class="bg-grey-lighten-4 text-grey-darken-1 font-weight-bold child-th-usuario">
                                Usuario
                              </th>
                              <th class="bg-grey-lighten-4 text-grey-darken-1 font-weight-bold child-th-estado">
                                Estado
                              </th>
                              <th class="bg-grey-lighten-4 text-grey-darken-1 font-weight-bold child-th-fecha">
                                Inicio
                              </th>
                              <th class="bg-grey-lighten-4 text-grey-darken-1 font-weight-bold child-th-fecha">
                                Fin
                              </th>
                              <th class="bg-grey-lighten-4 text-grey-darken-1 font-weight-bold child-th-acciones">
                                Asignar
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            <tr
                              v-for="h in hijosByPadre.get(Number(item.id_survey))"
                              :key="h.id_survey"
                            >
                              <td class="text-medium-emphasis">
                                {{ h.id_survey }}
                              </td>

                              <td>
                                <v-tooltip location="top">
                                  <template #activator="{ props: tip }">
                                    <span
                                      v-bind="tip"
                                      class="cell-1line font-weight-medium"
                                    >{{ h.name_template_srv ?? '—' }}</span>
                                  </template>
                                  <span>{{ h.name_template_srv ?? '—' }}</span>
                                </v-tooltip>
                              </td>

                              <td class="text-medium-emphasis">
                                {{ h.codi_template_srv ?? '—' }}
                              </td>

                              <td>
                                <template v-if="h.id_user">
                                  <div class="d-flex align-center">
                                    <v-icon
                                      size="14"
                                      color="medium-emphasis"
                                      class="mr-1"
                                    >
                                      mdi-account
                                    </v-icon>
                                    <span class="text-high-emphasis">{{ h.nombre_user }}</span>
                                  </div>
                                </template>
                                <span
                                  v-else
                                  class="text-error font-weight-medium"
                                >Sin asignar</span>
                              </td>

                              <td>
                                <v-chip
                                  size="x-small"
                                  variant="flat"
                                  class="font-weight-bold"
                                  :style="getEstadoChipStyle(getEstadoInternoConexion(h))"
                                >
                                  {{ getEstadoUiLabel(getEstadoInternoConexion(h)) || '—' }}
                                </v-chip>
                              </td>
                              <td class="text-medium-emphasis">
                                {{ formatDateDisplay(h.fecha_plan_ini) }}
                              </td>
                              <td class="text-medium-emphasis">
                                {{ formatDateDisplay(h.fecha_plan_fin) }}
                              </td>

                              <td>
                                <div class="d-flex align-center">
                                  <v-btn
                                    icon
                                    variant="text"
                                    size="x-small"
                                    :color="colorIconoEditar(h)"
                                    @click.stop="abrirModalEditar(h)"
                                  >
                                    <v-icon
                                      size="18"
                                      :class="{ 'blink-red-pencil': isPreCreado(h) }"
                                    >
                                      mdi-pencil-outline
                                    </v-icon>
                                  </v-btn>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </v-table>
                      </v-card>
                    </div>
                  </td>
                </tr>
              </template>

              <tr v-if="!tablaPadres.length">
                <td
                  :colspan="props.registroInformes
                    ? 19
                    : 18"
                  class="text-center py-10"
                >
                  <div class="d-flex flex-column align-center">
                    <v-icon
                      icon="mdi-clipboard-text-off-outline"
                      size="40"
                      class="mb-2 text-disabled"
                    />
                    <div class="text-medium-emphasis">
                      No hay inspecciones para mostrar.
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>

        <div
          ref="bottomScrollRef"
          class="x-scroll x-scroll-bottom"
          @scroll="onScroll('bottom')"
        >
          <div :style="{ width: scrollContentWidth, height: '1px' }" />
        </div>
      </v-card-text>
    </v-card>

    <!-- =========================
         MODAL EDICIÓN
         ========================= -->
    <v-dialog
      v-model="dialogEditar"
      max-width="720"
      persistent
    >
      <v-card class="rounded-xl">
        <v-toolbar
          density="compact"
          color="white"
          class="border-b pl-2"
        >
          <v-icon
            color="primary"
            class="ml-2 mr-2"
          >
            mdi-pencil-circle-outline
          </v-icon>
          <v-toolbar-title class="text-subtitle-1 font-weight-bold text-primary-dark">
            Editar Asignación #{{ editForm.id_survey || '—' }}
          </v-toolbar-title>
          <v-spacer />
          <v-btn
            icon
            variant="text"
            @click="cerrarModalEdicion"
          >
            <v-icon color="medium-emphasis">
              mdi-close
            </v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text class="pa-4 bg-grey-lighten-5">
          <v-alert
            type="info"
            variant="tonal"
            density="compact"
            class="mb-3"
          >
            <strong>Dirección en edición:</strong>
            {{ editForm.direccion_comuna || 'Sin dirección' }}
          </v-alert>

          <v-alert
            v-if="editError"
            type="error"
            variant="tonal"
            class="mb-4 border-error"
            density="compact"
          >
            {{ editError }}
          </v-alert>

          <v-card
            class="pa-4 mb-2"
            variant="flat"
            border
          >
            <div class="text-caption font-weight-bold text-uppercase text-medium-emphasis mb-3">
              Asignación de Personal
            </div>
            <v-row dense>
              <v-col
                cols="12"
                md="4"
              >
                <v-select
                  v-model="editForm.id_user_contratista"
                  :items="contratistas"
                  item-title="name_empresa"
                  item-value="id_empresa"
                  label="Contratista (Empresa)"
                  density="compact"
                  variant="outlined"
                  color="primary"
                  hide-details="auto"
                  clearable
                  prepend-inner-icon="mdi-domain"
                />
              </v-col>

              <v-col
                cols="12"
                md="4"
              >
                <v-autocomplete
                  v-model="editForm.id_user_supervisor"
                  :items="usuariosSupervisorEdicion"
                  item-title="nombre_user"
                  item-value="id_user"
                  label="Supervisor"
                  density="compact"
                  variant="outlined"
                  color="primary"
                  hide-details="auto"
                  clearable
                  prepend-inner-icon="mdi-account-tie"
                />
              </v-col>

              <v-col
                cols="12"
                md="4"
              >
                <v-autocomplete
                  v-model="editForm.id_user_tecnico"
                  :items="usuariosTecnicoEdicion"
                  item-title="nombre_user"
                  item-value="id_user"
                  label="Técnico"
                  density="compact"
                  variant="outlined"
                  color="primary"
                  hide-details="auto"
                  clearable
                  prepend-inner-icon="mdi-account-wrench"
                />
              </v-col>
            </v-row>
          </v-card>

          <v-card
            v-if="false"
            class="pa-4"
            variant="flat"
            border
          >
            <div class="text-caption font-weight-bold text-uppercase text-medium-emphasis mb-3">
              Fechas Plan
            </div>
            <v-row dense>
              <v-col
                cols="12"
                md="6"
              >
                <v-text-field
                  v-model="editForm.fecha_plan_ini"
                  type="date"
                  label="Fecha Inicio Plan"
                  density="compact"
                  variant="outlined"
                  color="primary"
                  hide-details="auto"
                  clearable
                  prepend-inner-icon="mdi-calendar-start"
                  @click:clear="editForm.fecha_plan_ini = ''"
                />
              </v-col>
              <v-col
                cols="12"
                md="6"
              >
                <v-text-field
                  v-model="editForm.fecha_plan_fin"
                  type="date"
                  label="Fecha Fin Plan"
                  density="compact"
                  variant="outlined"
                  color="primary"
                  hide-details="auto"
                  clearable
                  prepend-inner-icon="mdi-calendar-end"
                  @click:clear="editForm.fecha_plan_fin = ''"
                />
              </v-col>
            </v-row>
          </v-card>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4 bg-white d-flex justify-end ga-2">
          <v-btn
            variant="text"
            color="medium-emphasis"
            :disabled="guardandoEdicion"
            @click="cerrarModalEdicion"
          >
            Cancelar
          </v-btn>

          <v-btn
            color="primary"
            variant="flat"
            :loading="guardandoEdicion"
            @click="guardarEdicion"
          >
            Guardar Cambios
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>


    <!-- Modal Galería -->
    <v-dialog
      v-model="dialogGaleria"
      max-width="900"
    >
      <v-card class="rounded-xl">
        <v-toolbar
          density="compact"
          color="white"
          class="border-b pl-2"
        >
          <v-icon
            color="indigo"
            class="ml-2 mr-2"
          >
            mdi-camera-burst
          </v-icon>
          <v-toolbar-title class="text-subtitle-1 font-weight-bold text-primary-dark">
            Galería Fotográfica
          </v-toolbar-title>
          <v-spacer />
          <v-btn
            icon
            variant="text"
            @click="dialogGaleria = false"
          >
            <v-icon color="medium-emphasis">
              mdi-close
            </v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text class="pa-4 bg-grey-lighten-5">
          <div
            v-if="fotosGaleria.length"
            class="d-flex flex-wrap ga-4 justify-center"
          >
            <v-card
              v-for="(foto, i) in fotosGaleria"
              :key="i"
              elevation="2"
              class="rounded-lg overflow-hidden"
              width="200"
            >
              <a
                :href="foto.url"
                target="_blank"
              >
                <v-img
                  :src="foto.url"
                  height="200"
                  cover
                  class="bg-grey-lighten-3"
                />
              </a>
              <div class="pa-2 text-caption text-medium-emphasis text-center text-truncate">
                {{ foto.timestamp || 'Foto ' + (i + 1) }}
              </div>
            </v-card>
          </div>
          <div
            v-else
            class="text-center pa-10 text-medium-emphasis"
          >
            No hay fotos disponibles.
          </div>
        </v-card-text>
        <v-card-actions class="bg-white justify-end pa-4">
          <v-btn
            color="primary"
            variant="flat"
            @click="dialogGaleria = false"
          >
            Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal Asignar Flujo -->
    <v-dialog
      v-model="showModalAsignar"
      max-width="700"
    >
      <v-card class="rounded-xl">
        <v-toolbar
          density="compact"
          color="white"
          class="border-b pl-2"
        >
          <v-icon
            color="primary"
            class="ml-2 mr-2"
          >
            mdi-sitemap-outline
          </v-icon>
          <v-toolbar-title class="text-subtitle-1 font-weight-bold text-primary-dark">
            Asignar Flujo de Aprobación
          </v-toolbar-title>
          <v-spacer />
          <v-btn
            icon
            variant="text"
            @click="showModalAsignar = false"
          >
            <v-icon color="medium-emphasis">
              mdi-close
            </v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text class="pa-4 bg-grey-lighten-5">
          <v-card
            variant="flat"
            border
            class="pa-0"
          >
            <v-list
              density="compact"
              lines="two"
              class="bg-transparent"
            >
              <template
                v-for="(flujo, i) in flujos"
                :key="flujo.id_flow_stp"
              >
                <v-list-item>
                  <template #prepend>
                    <v-avatar
                      color="primary-lighten-4"
                      class="text-primary font-weight-bold"
                      size="32"
                    >
                      {{ flujo.flow_tmpl_step_orden }}
                    </v-avatar>
                  </template>

                  <v-row
                    dense
                    class="ml-2 align-center w-100"
                  >
                    <v-col
                      cols="4"
                      class="text-caption font-weight-bold text-uppercase text-medium-emphasis"
                    >
                      {{ flujo.name_rol }}
                    </v-col>
                    <v-col cols="8">
                      <v-select
                        v-if="flujo.flag_equipo"
                        v-model="flujo.id_user"
                        :label="`Equipo (${flujo.name_rol})`"
                        :items="equiposItems"
                        item-title="nombre_equipo"
                        item-value="id_equipo_proyecto"
                        :value-comparator="valueComparator"
                        density="compact"
                        variant="outlined"
                        color="primary"
                        bg-color="white"
                        hide-details="auto"
                        clearable
                        @update:model-value="val => markDirtyEquipo(flujo, val)"
                      />

                      <v-select
                        v-else
                        v-model="flujo.id_user"
                        :label="`Usuario (${flujo.name_rol})`"
                        :items="usuariosPorRol(flujo.name_rol)"
                        item-title="nombre_user"
                        item-value="id_user"
                        density="compact"
                        variant="outlined"
                        color="primary"
                        bg-color="white"
                        hide-details="auto"
                        clearable
                        @update:model-value="val => markDirty(flujo, val)"
                      />
                    </v-col>
                  </v-row>
                </v-list-item>
                <v-divider
                  v-if="i < flujos.length - 1"
                  class="my-1 border-dashed"
                />
              </template>
            </v-list>
          </v-card>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4 bg-white d-flex justify-end ga-2">
          <v-btn
            variant="text"
            color="medium-emphasis"
            @click="showModalAsignar = false"
          >
            Cancelar
          </v-btn>

          <v-btn
            color="primary"
            variant="flat"
            @click="asignarSurveyFlujo"
          >
            Confirmar Asignación
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal Simulación Correo -->
    <v-dialog
      v-model="dialogEmail"
      max-width="500"
    >
      <v-card class="rounded-xl">
        <v-toolbar
          density="compact"
          color="white"
          class="border-b pl-2"
        >
          <v-icon
            color="indigo"
            class="ml-2 mr-2"
          >
            mdi-email-fast-outline
          </v-icon>
          <v-toolbar-title class="text-subtitle-1 font-weight-bold text-primary-dark">
            Envío de Correo
          </v-toolbar-title>
          <v-spacer />
          <v-btn
            icon
            variant="text"
            @click="dialogEmail = false"
          >
            <v-icon color="medium-emphasis">
              mdi-close
            </v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text class="pa-4 bg-grey-lighten-5">
          <v-card
            variant="outlined"
            class="pa-4 bg-white"
            style="border-color: #e2e8f0;"
          >
            <div class="mb-3 text-body-2">
              <span class="font-weight-bold text-medium-emphasis">De:</span>
              <span class="text-primary font-weight-bold ml-1">{{ emailData.de }}</span>
            </div>

            <v-divider class="mb-3 border-dashed" />

            <div class="text-body-1 font-weight-bold text-high-emphasis mb-4">
              {{ emailData.cuerpo }}
            </div>

            <div class="text-body-2 text-medium-emphasis font-italic">
              {{ emailData.footer }}
            </div>
          </v-card>
        </v-card-text>

        <v-card-actions class="bg-white justify-end pa-4">
          <v-btn
            color="primary"
            variant="flat"
            @click="dialogEmail = false"
          >
            Enviar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal Detalle Parent/Children -->
    <v-dialog
      v-model="dialogDetalle"
      max-width="1000"
    >
      <v-card class="rounded-xl">
        <v-toolbar
          density="compact"
          color="white"
          class="border-b pl-2"
        >
          <v-icon
            color="primary"
            class="ml-2 mr-2"
          >
            mdi-chart-tree
          </v-icon>
          <v-toolbar-title class="text-subtitle-1 font-weight-bold text-primary-dark">
            Detalle de Relación Asignación (ID: {{ detallePadre?.id_survey }})
          </v-toolbar-title>
          <v-spacer />
          <v-btn
            icon
            variant="text"
            @click="dialogDetalle = false"
          >
            <v-icon color="medium-emphasis">
              mdi-close
            </v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text class="pa-4 bg-grey-lighten-5">
          <v-row>
            <!-- Tarjeta Padre -->
            <v-col
              cols="12"
              md="6"
            >
              <div class="text-subtitle-2 font-weight-bold mb-2 text-primary d-flex align-center">
                <v-icon
                  start
                  size="small"
                >
                  mdi-domain
                </v-icon> Asignación Supervisor
              </div>
              <v-card
                class="h-100"
                variant="outlined"
                style="border-color: #e2e8f0; border-radius: 8px; overflow: hidden;"
              >
                <div
                  v-if="detallePadre"
                  class="pa-4"
                  style="max-height: 60vh; overflow-y: auto;"
                >
                  <v-list
                    density="compact"
                    class="pa-0"
                  >
                    <!-- ... existing items ... -->

                    <v-list-item class="px-0">
                      <template #prepend>
                        <v-icon
                          size="small"
                          class="mr-2 text-medium-emphasis"
                        >
                          mdi-identifier
                        </v-icon>
                      </template>
                      <v-list-item-title class="text-caption font-weight-bold">
                        Orden
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-body-2 pt-1">
                        <div
                          v-if="canEditAsignacionSupervisor"
                          class="d-flex align-center"
                        >
                          <v-text-field
                            v-model="detallePadre.orden"
                            density="compact"
                            variant="outlined"
                            hide-details
                            bg-color="white"
                            class="mr-2"
                            style="max-width: 240px;"
                          />
                          <v-btn
                            color="primary"
                            icon
                            size="x-small"
                            variant="flat"
                            title="Guardar datos de asignación"
                            @click="updatePadreDatosAsignacion(detallePadre)"
                          >
                            <v-icon>mdi-content-save</v-icon>
                          </v-btn>
                        </div>
                        <span v-else>
                          {{ detallePadre.orden || detallePadre.id_survey }}
                        </span>
                      </v-list-item-subtitle>
                    </v-list-item>

                    <v-divider class="my-1 border-dashed" />

                    <v-list-item class="px-0">
                      <template #prepend>
                        <v-icon
                          size="small"
                          class="mr-2 text-medium-emphasis"
                        >
                          mdi-hard-hat
                        </v-icon>
                      </template>
                      <v-list-item-title class="text-caption font-weight-bold">
                        Contratista
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-body-2 text-high-emphasis">
                        {{ detallePadre.contratista || '—'
                        }}
                      </v-list-item-subtitle>
                    </v-list-item>

                    <v-divider class="my-1 border-dashed" />

                    <v-list-item class="px-0">
                      <template #prepend>
                        <v-icon
                          size="small"
                          class="mr-2 text-medium-emphasis"
                        >
                          mdi-shape
                        </v-icon>
                      </template>
                      <v-list-item-title class="text-caption font-weight-bold">
                        Tipo
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-body-2 text-high-emphasis">
                        {{ detallePadre.name_tipo_srv || '—'
                        }}
                      </v-list-item-subtitle>
                    </v-list-item>

                    <v-divider class="my-1 border-dashed" />

                    <v-list-item class="px-0">
                      <template #prepend>
                        <v-icon
                          size="small"
                          class="mr-2 text-medium-emphasis"
                        >
                          mdi-certificate
                        </v-icon>
                      </template>
                      <v-list-item-title class="text-caption font-weight-bold">
                        Certificadora
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-body-2 text-high-emphasis">
                        {{ detallePadre.certificadora || '—'
                        }}
                      </v-list-item-subtitle>
                    </v-list-item>

                    <v-divider class="my-1 border-dashed" />

                    <v-list-item class="px-0">
                      <template #prepend>
                        <v-icon
                          size="small"
                          class="mr-2 text-medium-emphasis"
                        >
                          mdi-briefcase
                        </v-icon>
                      </template>
                      <v-list-item-title class="text-caption font-weight-bold">
                        Proyecto
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-body-2 pt-1">
                        <div
                          v-if="canEditAsignacionSupervisor"
                          class="d-flex align-center"
                        >
                          <v-text-field
                            v-model="detallePadre.proyecto"
                            density="compact"
                            variant="outlined"
                            hide-details
                            bg-color="white"
                            class="mr-2"
                            style="max-width: 240px;"
                          />
                          <v-btn
                            color="primary"
                            icon
                            size="x-small"
                            variant="flat"
                            title="Guardar datos de asignación"
                            @click="updatePadreDatosAsignacion(detallePadre)"
                          >
                            <v-icon>mdi-content-save</v-icon>
                          </v-btn>
                        </div>
                        <span
                          v-else
                          class="text-high-emphasis"
                        >
                          {{ detallePadre.proyecto || detallePadre.nombre_proyecto || '—' }}
                        </span>
                      </v-list-item-subtitle>
                    </v-list-item>
                    <v-divider class="my-1 border-dashed" />

                    <v-list-item class="px-0">
                      <template #prepend>
                        <v-icon
                          size="small"
                          class="mr-2 text-medium-emphasis"
                        >
                          mdi-database
                        </v-icon>
                      </template>
                      <v-list-item-title class="text-caption font-weight-bold">
                        IC SAP
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-body-2 pt-1">
                        <div
                          v-if="canEditAsignacionSupervisor"
                          class="d-flex align-center"
                        >
                          <v-text-field
                            v-model="detallePadre.ic_sap_mg"
                            density="compact"
                            variant="outlined"
                            hide-details
                            bg-color="white"
                            class="mr-2"
                            style="max-width: 240px;"
                          />
                          <v-btn
                            color="primary"
                            icon
                            size="x-small"
                            variant="flat"
                            title="Guardar datos de asignación"
                            @click="updatePadreDatosAsignacion(detallePadre)"
                          >
                            <v-icon>mdi-content-save</v-icon>
                          </v-btn>
                        </div>
                        <span
                          v-else
                          class="text-high-emphasis"
                        >
                          {{ detallePadre.ic_sap_mg || '—' }}
                        </span>
                      </v-list-item-subtitle>
                    </v-list-item>

                    <v-divider class="my-1 border-dashed" />

                    <v-list-item class="px-0">
                      <template #prepend>
                        <v-icon
                          size="small"
                          class="mr-2 text-medium-emphasis"
                        >
                          mdi-clipboard-list
                        </v-icon>
                      </template>
                      <v-list-item-title class="text-caption font-weight-bold">
                        GIO
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-body-2 pt-1">
                        <div
                          v-if="canEditAsignacionSupervisor"
                          class="d-flex align-center"
                        >
                          <v-text-field
                            v-model="detallePadre.gio"
                            density="compact"
                            variant="outlined"
                            hide-details
                            bg-color="white"
                            class="mr-2"
                            style="max-width: 240px;"
                          />
                          <v-btn
                            color="primary"
                            icon
                            size="x-small"
                            variant="flat"
                            title="Guardar datos de asignación"
                            @click="updatePadreDatosAsignacion(detallePadre)"
                          >
                            <v-icon>mdi-content-save</v-icon>
                          </v-btn>
                        </div>
                        <span
                          v-else
                          class="text-high-emphasis"
                        >
                          {{ detallePadre.gio || '—' }}
                        </span>
                      </v-list-item-subtitle>
                    </v-list-item>

                    <v-divider class="my-1 border-dashed" />

                    <v-list-item class="px-0">
                      <template #prepend>
                        <v-icon
                          size="small"
                          class="mr-2 text-medium-emphasis"
                        >
                          mdi-account-tie
                        </v-icon>
                      </template>
                      <v-list-item-title class="text-caption font-weight-bold">
                        Nombre Cliente
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-body-2 pt-1">
                        <div
                          v-if="canEditAsignacionSupervisor"
                          class="d-flex align-center"
                        >
                          <v-text-field
                            v-model="detallePadre.cliente"
                            density="compact"
                            variant="outlined"
                            hide-details
                            bg-color="white"
                            class="mr-2"
                            style="max-width: 240px;"
                          />
                          <v-btn
                            color="primary"
                            icon
                            size="x-small"
                            variant="flat"
                            title="Guardar datos de asignación"
                            @click="updatePadreDatosAsignacion(detallePadre)"
                          >
                            <v-icon>mdi-content-save</v-icon>
                          </v-btn>
                        </div>
                        <span
                          v-else
                          class="text-high-emphasis"
                        >
                          {{ detallePadre.cliente || '—' }}
                        </span>
                      </v-list-item-subtitle>
                    </v-list-item>

                    <v-divider class="my-1 border-dashed" />

                    <v-list-item class="px-0">
                      <template #prepend>
                        <v-icon
                          size="small"
                          class="mr-2 text-medium-emphasis"
                        >
                          mdi-phone
                        </v-icon>
                      </template>
                      <v-list-item-title class="text-caption font-weight-bold">
                        Telefono Cliente
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-body-2 pt-1">
                        <div
                          v-if="canEditAsignacionSupervisor"
                          class="d-flex align-center"
                        >
                          <v-text-field
                            v-model="detallePadre.fonos"
                            density="compact"
                            variant="outlined"
                            hide-details
                            bg-color="white"
                            class="mr-2"
                            style="max-width: 240px;"
                          />
                          <v-btn
                            color="primary"
                            icon
                            size="x-small"
                            variant="flat"
                            title="Guardar datos de asignación"
                            @click="updatePadreDatosAsignacion(detallePadre)"
                          >
                            <v-icon>mdi-content-save</v-icon>
                          </v-btn>
                        </div>
                        <span
                          v-else
                          class="text-high-emphasis"
                        >
                          {{ detallePadre.fonos || '—' }}
                        </span>
                      </v-list-item-subtitle>
                    </v-list-item>

                    <v-divider class="my-1 border-dashed" />

                    <v-list-item class="px-0">
                      <template #prepend>
                        <v-icon
                          size="small"
                          class="mr-2 text-medium-emphasis"
                        >
                          mdi-map-marker
                        </v-icon>
                      </template>
                      <v-list-item-title class="text-caption font-weight-bold">
                        Dirección / Comuna
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-body-2 pt-1">
                        <div
                          v-if="canEditAsignacionSupervisor"
                          class="d-flex align-center"
                        >
                          <v-text-field
                            v-model="detallePadre.direccion_comuna"
                            density="compact"
                            variant="outlined"
                            hide-details
                            bg-color="white"
                            class="mr-2"
                            style="max-width: 240px;"
                          />
                          <v-btn
                            color="primary"
                            icon
                            size="x-small"
                            variant="flat"
                            title="Guardar datos de asignación"
                            @click="updatePadreDatosAsignacion(detallePadre)"
                          >
                            <v-icon>mdi-content-save</v-icon>
                          </v-btn>
                        </div>
                        <span
                          v-else
                          class="text-high-emphasis text-wrap"
                        >
                          {{ detallePadre.direccion_comuna || '—' }}
                        </span>
                      </v-list-item-subtitle>
                    </v-list-item>

                    <v-divider class="my-1 border-dashed" />

                    <v-list-item class="px-0">
                      <template #prepend>
                        <v-icon
                          size="small"
                          class="mr-2 text-medium-emphasis"
                        >
                          mdi-account-tie
                        </v-icon>
                      </template>
                      <v-list-item-title class="text-caption font-weight-bold">
                        Cliente / Obs
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-body-2 text-high-emphasis text-wrap">
                        {{
                          detallePadre.cliente_fonos_obs || '—' }}
                      </v-list-item-subtitle>
                    </v-list-item>

                    <v-divider class="my-1 border-dashed" />

                    <v-list-item class="px-0">
                      <template #prepend>
                        <v-icon
                          size="small"
                          class="mr-2 text-medium-emphasis"
                        >
                          mdi-account
                        </v-icon>
                      </template>
                      <v-list-item-title class="text-caption font-weight-bold">
                        Usuario Asignado
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-body-2 text-high-emphasis">
                        <v-chip
                          v-if="getNombreSupervisorAsignadoDetalle(detallePadre)"
                          size="small"
                          color="primary"
                          variant="flat"
                        >
                          {{ getNombreSupervisorAsignadoDetalle(detallePadre) }}
                        </v-chip>
                        <span
                          v-else
                          class="text-error"
                        >Sin asignar</span>
                      </v-list-item-subtitle>
                    </v-list-item>

                    <v-divider class="my-1 border-dashed" />

                    <v-list-item class="px-0">
                      <template #prepend>
                        <v-icon
                          size="small"
                          class="mr-2 text-medium-emphasis"
                        >
                          mdi-list-status
                        </v-icon>
                      </template>
                      <v-list-item-title class="text-caption font-weight-bold">
                        Estado
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-body-2 pt-1">
                        <!-- EDITABLE -->
                        <div
                          v-if="canEditAsignacionSupervisor"
                          class="d-flex align-center"
                        >
                          <v-select
                            v-model="detallePadre.estado_srv"
                            :items="estadosPosibles"
                            density="compact"
                            variant="outlined"
                            hide-details
                            bg-color="white"
                            class="mr-2"
                            style="width: 180px;"
                          >
                            <template #selection="{ item }">
                              <span :class="['estado-select-label', getEstadoOptionClass(getEstadoItemValue(item))]">
                                {{ getEstadoItemLabel(item) }}
                              </span>
                            </template>
                            <template #item="{ props, item }">
                              <v-list-item
                                v-bind="props"
                                :class="getEstadoOptionClass(getEstadoItemValue(item))"
                              />
                            </template>
                          </v-select>
                          <v-btn
                            color="primary"
                            icon
                            size="x-small"
                            variant="flat"
                            title="Guardar"
                            @click="updateEstado(detallePadre, detallePadre.estado_srv)"
                          >
                            <v-icon>mdi-content-save</v-icon>
                          </v-btn>
                        </div>

                        <!-- READONLY -->
                        <v-chip
                          v-else
                          size="x-small"
                          variant="flat"
                          class="font-weight-bold"
                          :style="getEstadoChipStyle(getEstadoInternoConexion(detallePadre))"
                        >
                          {{ getEstadoUiLabel(getEstadoInternoConexion(detallePadre)) }}
                        </v-chip>
                      </v-list-item-subtitle>
                    </v-list-item>

                    <v-divider
                      v-if="canManageValorServicio"
                      class="my-1 border-dashed"
                    />

                    <v-list-item
                      v-if="canManageValorServicio"
                      class="px-0"
                    >
                      <template #prepend>
                        <v-icon
                          size="small"
                          class="mr-2 text-medium-emphasis"
                        >
                          mdi-cash-edit
                        </v-icon>
                      </template>
                      <v-list-item-title class="text-caption font-weight-bold">
                        Valor Servicio
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-body-2 pt-1">
                        <div class="d-flex align-center">
                          <v-text-field
                            v-model="detallePadre.valor_servicio"
                            density="compact"
                            variant="outlined"
                            hide-details
                            bg-color="white"
                            class="mr-2"
                            style="max-width: 240px;"
                          />
                          <v-btn
                            color="primary"
                            icon
                            size="x-small"
                            variant="flat"
                            title="Guardar valor servicio"
                            @click="updatePadreValorServicio(detallePadre, detallePadre.valor_servicio)"
                          >
                            <v-icon>mdi-content-save</v-icon>
                          </v-btn>
                        </div>
                      </v-list-item-subtitle>
                    </v-list-item>

                    <v-divider
                      v-if="canManageValorServicio"
                      class="my-1 border-dashed"
                    />

                    <v-list-item
                      v-if="canManageValorServicio"
                      class="px-0"
                    >
                      <template #prepend>
                        <v-icon
                          size="small"
                          class="mr-2 text-medium-emphasis"
                        >
                          mdi-swap-horizontal
                        </v-icon>
                      </template>
                      <v-list-item-title class="text-caption font-weight-bold">
                        Tipo Empalme/Gasificar
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-body-2 pt-1">
                        <div class="d-flex align-center">
                          <v-select
                            v-model="detallePadre.tipoEmpalmeGasificar"
                            :items="tipoEmpalmeGasificarOptions"
                            density="compact"
                            variant="outlined"
                            hide-details
                            bg-color="white"
                            class="mr-2"
                            style="max-width: 240px;"
                          />
                          <v-btn
                            color="primary"
                            icon
                            size="x-small"
                            variant="flat"
                            title="Guardar tipo Empalme/Gasificar"
                            @click="updatePadreTipoEmpalmeGasificar(detallePadre, detallePadre.tipoEmpalmeGasificar)"
                          >
                            <v-icon>mdi-content-save</v-icon>
                          </v-btn>
                        </div>
                      </v-list-item-subtitle>
                    </v-list-item>

                    <v-divider class="my-1 border-dashed" />

                    <v-list-item class="px-0">
                      <template #prepend>
                        <v-icon
                          size="small"
                          class="mr-2 text-medium-emphasis"
                        >
                          mdi-calendar-range
                        </v-icon>
                      </template>
                      <v-list-item-title class="text-caption font-weight-bold">
                        Fechas Planificadas
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-body-2 text-high-emphasis">
                        Ini: {{ formatDateDisplay(detallePadre.fecha_plan_ini) }} <br>
                        Fin: {{ formatDateDisplay(detallePadre.fecha_plan_fin) }}
                      </v-list-item-subtitle>
                    </v-list-item>

                    <v-divider class="my-1 border-dashed" />

                    <!-- PDF -->
                    <v-list-item class="px-0">
                      <template #prepend>
                        <v-icon
                          size="small"
                          class="mr-2 text-medium-emphasis"
                        >
                          mdi-file-pdf-box
                        </v-icon>
                      </template>
                      <v-list-item-title class="text-caption font-weight-bold">
                        PDF
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-body-2 text-high-emphasis">
                        <v-btn
                          v-if="getPdfUrl(detallePadre)"
                          variant="text"
                          color="error"
                          size="small"
                          class="px-0"
                          :href="getPdfUrl(detallePadre)"
                          target="_blank"
                          rel="noopener"
                        >
                          Abrir PDF
                          <v-icon
                            end
                            icon="mdi-open-in-new"
                            size="small"
                          />
                        </v-btn>
                        <span
                          v-else
                          class="text-disabled"
                        >—</span>
                      </v-list-item-subtitle>
                    </v-list-item>

                    <!-- Informe -->
                    <template v-if="props.registroInformes">
                      <v-divider class="my-1 border-dashed" />
                      <v-list-item class="px-0">
                        <template #prepend>
                          <v-icon
                            size="small"
                            class="mr-2 text-medium-emphasis"
                          >
                            mdi-file-excel-box
                          </v-icon>
                        </template>
                        <v-list-item-title class="text-caption font-weight-bold">
                          Informe
                        </v-list-item-title>
                        <v-list-item-subtitle class="text-body-2 text-high-emphasis">
                          <v-btn
                            v-if="detallePadre.url_doc_registro"
                            variant="text"
                            color="success"
                            size="small"
                            class="px-0"
                            :href="detallePadre.url_doc_registro"
                            target="_blank"
                            rel="noopener"
                          >
                            Descargar
                            <v-icon
                              end
                              icon="mdi-download"
                              size="small"
                            />
                          </v-btn>
                          <span
                            v-else
                            class="text-disabled"
                          >—</span>
                        </v-list-item-subtitle>
                      </v-list-item>
                    </template>

                    <!-- Campos Extras -->
                    <template
                      v-for="(info, i) in informacionExtra"
                      :key="i"
                    >
                      <template v-if="shouldShowPadreInfoExtra(detallePadre, info.key)">
                        <v-divider class="my-1 border-dashed" />

                        <!-- EDITABLE: atributos del JSON del survey padre/SUP -->
                        <v-list-item
                          v-if="canEditPadreInfoExtra(info.key)"
                          :class="isSupervisorArtefactosRootKey(info.key) ? 'px-0 supervisor-artefactos-list-item' : 'px-0'"
                        >
                          <template
                            v-if="!isSupervisorArtefactosRootKey(info.key)"
                            #prepend
                          >
                            <v-icon
                              size="small"
                              class="mr-2 text-medium-emphasis"
                            >
                              mdi-information-outline
                            </v-icon>
                          </template>
                          <v-list-item-title
                            v-if="!isSupervisorArtefactosRootKey(info.key)"
                            class="text-caption font-weight-bold"
                          >
                            {{ info.label }}
                          </v-list-item-title>
                          <v-list-item-subtitle class="text-body-2 text-high-emphasis pt-1">
                            <div
                              v-if="isSupervisorArtefactosRootKey(info.key)"
                              class="supervisor-artefactos-editor"
                            >
                              <v-card
                                v-for="grupoArtefacto in getSupervisorArtefactosGroups(detallePadre)"
                                :key="grupoArtefacto.key"
                                class="mb-3 supervisor-artefactos-card"
                                variant="outlined"
                              >
                                <v-card-title class="text-subtitle-2 font-weight-bold py-2">
                                  {{ grupoArtefacto.label }}
                                </v-card-title>
                                <v-card-text class="pt-1">
                                  <v-table
                                    density="compact"
                                    class="supervisor-artefactos-table"
                                  >
                                    <thead>
                                      <tr>
                                        <th>Artefacto</th>
                                        <th class="text-center">
                                          Si / No
                                        </th>
                                        <th class="text-center">
                                          Cantidad
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr
                                        v-for="itemArtefacto in grupoArtefacto.items"
                                        :key="`${grupoArtefacto.key}-${itemArtefacto.label}`"
                                      >
                                        <td class="font-weight-medium">
                                          {{ itemArtefacto.label }}
                                        </td>
                                        <td class="text-center">
                                          <v-btn-toggle
                                            v-model="itemArtefacto.respuesta"
                                            mandatory
                                            density="compact"
                                            :disabled="!canEditSupervisorArtefactos"
                                            @update:model-value="(val) => onSupervisorArtefactoRespuestaChange(itemArtefacto, val)"
                                          >
                                            <v-btn
                                              value="SI"
                                              size="small"
                                            >
                                              Si
                                            </v-btn>
                                            <v-btn
                                              value="NO"
                                              size="small"
                                            >
                                              No
                                            </v-btn>
                                          </v-btn-toggle>
                                        </td>
                                        <td
                                          class="text-center"
                                          style="max-width: 120px;"
                                        >
                                          <v-text-field
                                            v-model="itemArtefacto.cantidad"
                                            type="number"
                                            min="0"
                                            density="compact"
                                            variant="underlined"
                                            hide-details
                                            placeholder="0"
                                            :disabled="!canEditSupervisorArtefactos || itemArtefacto.respuesta !== 'SI'"
                                          />
                                        </td>
                                      </tr>
                                    </tbody>
                                  </v-table>
                                  <div class="d-flex justify-end mt-2">
                                    <v-btn
                                      v-if="canEditSupervisorArtefactos"
                                      color="primary"
                                      size="small"
                                      variant="flat"
                                      prepend-icon="mdi-content-save"
                                      @click="updatePadreArtefactosAttr(detallePadre, grupoArtefacto.key)"
                                    >
                                      Guardar
                                    </v-btn>
                                  </div>
                                </v-card-text>
                              </v-card>
                            </div>

                            <div
                              v-else
                              class="d-flex align-center"
                            >
                              <v-text-field
                                :model-value="getPadreInfoExtraValue(detallePadre, info.key)"
                                :type="info.key === 'HR INICIO' ? 'datetime-local' : 'text'"
                                variant="outlined"
                                density="compact"
                                hide-details
                                bg-color="white"
                                class="mr-2"
                                style="max-width: 220px;"
                                @update:model-value="(val) => setPadreInfoExtraValue(detallePadre, info.key, val)"
                              />
                              <v-btn
                                color="primary"
                                icon
                                size="x-small"
                                variant="flat"
                                title="Guardar atributo SUP"
                                @click="updatePadreJsonAttr(detallePadre, info.key, getPadreInfoExtraValue(detallePadre, info.key))"
                              >
                                <v-icon>mdi-content-save</v-icon>
                              </v-btn>
                            </div>
                            <div
                              v-if="['CHARLA', 'ATS', 'T. ALTURA'].includes(info.key) && Array.isArray(detallePadre?.evidenciaHijo?.[info.key]) && detallePadre.evidenciaHijo[info.key].length"
                              class="d-flex align-center ga-2 mt-2"
                            >
                              <v-img
                                :src="toAbsolutePhotoUrl(detallePadre.evidenciaHijo[info.key][0]?.url || detallePadre.evidenciaHijo[info.key][0]?.base64 || detallePadre.evidenciaHijo[info.key][0]?.src || '')"
                                width="84"
                                height="64"
                                cover
                                class="rounded border cursor-pointer"
                                @click="abrirGaleriaFotos(detallePadre.evidenciaHijo[info.key])"
                              />
                              <span class="text-caption text-medium-emphasis">
                                {{ detallePadre.evidenciaHijo[info.key].length }} foto(s)
                              </span>
                            </div>
                          </v-list-item-subtitle>
                        </v-list-item>

                        <!-- READONLY -->
                        <v-list-item
                          v-else
                          class="px-0"
                        >
                          <template #prepend>
                            <v-icon
                              size="small"
                              class="mr-2 text-medium-emphasis"
                            >
                              mdi-information-outline
                            </v-icon>
                          </template>
                          <v-list-item-title class="text-caption font-weight-bold">
                            {{ info.label }}
                          </v-list-item-title>
                          <v-list-item-subtitle class="text-body-2 text-high-emphasis text-wrap supervisor-evidencia-subtitle">
                            {{ formatGenericDisplay(getPadreInfoExtraValue(detallePadre, info.key)) }}
                            <div
                              v-if="['CHARLA', 'ATS', 'T. ALTURA'].includes(info.key) && Array.isArray(detallePadre?.evidenciaHijo?.[info.key]) && detallePadre.evidenciaHijo[info.key].length"
                              class="d-flex align-center ga-2 mt-2"
                            >
                              <v-img
                                :src="toAbsolutePhotoUrl(detallePadre.evidenciaHijo[info.key][0]?.url || detallePadre.evidenciaHijo[info.key][0]?.base64 || detallePadre.evidenciaHijo[info.key][0]?.src || '')"
                                width="84"
                                height="64"
                                cover
                                class="rounded border cursor-pointer"
                                @click="abrirGaleriaFotos(detallePadre.evidenciaHijo[info.key])"
                              />
                              <span class="text-caption text-medium-emphasis">
                                {{ detallePadre.evidenciaHijo[info.key].length }} foto(s)
                              </span>
                            </div>
                          </v-list-item-subtitle>
                        </v-list-item>
                      </template>
                      <template v-if="shouldRenderSupervisorArtefactosAfter(info.key)">
                        <v-divider class="my-3 border-dashed" />
                        <v-list-item class="px-0 supervisor-artefactos-list-item">
                          <v-list-item-subtitle class="text-body-2 text-high-emphasis pt-1">
                            <div class="supervisor-artefactos-editor">
                              <v-card
                                v-for="grupoArtefacto in getSupervisorArtefactosGroups(detallePadre)"
                                :key="grupoArtefacto.key"
                                class="mb-3 supervisor-artefactos-card"
                                variant="outlined"
                              >
                                <v-card-title class="text-subtitle-2 font-weight-bold py-2">
                                  {{ grupoArtefacto.label }}
                                </v-card-title>
                                <v-card-text class="pt-1">
                                  <v-table
                                    density="compact"
                                    class="supervisor-artefactos-table"
                                  >
                                    <thead>
                                      <tr>
                                        <th>Artefacto</th>
                                        <th class="text-center">
                                          Si / No
                                        </th>
                                        <th class="text-center">
                                          Cantidad
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr
                                        v-for="itemArtefacto in grupoArtefacto.items"
                                        :key="`${grupoArtefacto.key}-${itemArtefacto.label}`"
                                      >
                                        <td class="font-weight-medium">
                                          {{ itemArtefacto.label }}
                                        </td>
                                        <td class="text-center">
                                          <v-btn-toggle
                                            v-model="itemArtefacto.respuesta"
                                            mandatory
                                            density="compact"
                                            :disabled="!canEditSupervisorArtefactos"
                                            @update:model-value="(val) => onSupervisorArtefactoRespuestaChange(itemArtefacto, val)"
                                          >
                                            <v-btn
                                              value="SI"
                                              size="small"
                                            >
                                              Si
                                            </v-btn>
                                            <v-btn
                                              value="NO"
                                              size="small"
                                            >
                                              No
                                            </v-btn>
                                          </v-btn-toggle>
                                        </td>
                                        <td
                                          class="text-center"
                                          style="max-width: 120px;"
                                        >
                                          <v-text-field
                                            v-model="itemArtefacto.cantidad"
                                            type="number"
                                            min="0"
                                            density="compact"
                                            variant="underlined"
                                            hide-details
                                            placeholder="0"
                                            :disabled="!canEditSupervisorArtefactos || itemArtefacto.respuesta !== 'SI'"
                                          />
                                        </td>
                                      </tr>
                                    </tbody>
                                  </v-table>
                                  <div class="d-flex justify-end mt-2">
                                    <v-btn
                                      v-if="canEditSupervisorArtefactos"
                                      color="primary"
                                      size="small"
                                      variant="flat"
                                      prepend-icon="mdi-content-save"
                                      @click="updatePadreArtefactosAttr(detallePadre, grupoArtefacto.key)"
                                    >
                                      Guardar
                                    </v-btn>
                                  </div>
                                </v-card-text>
                              </v-card>
                            </div>
                          </v-list-item-subtitle>
                        </v-list-item>
                      </template>
                    </template>

                    <v-divider class="my-3 border-dashed" />
                    <v-list-item class="px-0 supervisor-antecedentes-list-item">
                      <v-list-item-subtitle class="text-body-2 text-high-emphasis pt-1">
                        <v-card
                          class="supervisor-antecedentes-card"
                          variant="outlined"
                        >
                          <v-card-title class="d-flex align-center justify-space-between flex-wrap ga-2 py-3">
                            <span class="text-subtitle-2 font-weight-bold text-primary-dark">
                              Antecedentes Complementarios
                            </span>
                          </v-card-title>
                          <v-card-text class="pt-1">
                            <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-3">
                              <div class="text-caption font-weight-bold text-medium-emphasis">
                                Eventos
                              </div>
                              <v-btn
                                v-if="canEditAsignacionSupervisor"
                                size="x-small"
                                variant="outlined"
                                color="primary"
                                class="text-none"
                                @click="agregarEventoSupervisor(detallePadre)"
                              >
                                Agregar evento
                              </v-btn>
                            </div>

                            <div
                              v-if="getSupervisorAntecedentesEventos(detallePadre).length"
                              class="d-flex flex-column ga-2"
                            >
                              <v-card
                                v-for="(ev, evIdx) in getSupervisorAntecedentesEventos(detallePadre)"
                                :key="`sup-evento-${evIdx}`"
                                variant="outlined"
                                class="pa-2 supervisor-evento-card"
                              >
                                <div class="d-flex align-center justify-space-between mb-2">
                                  <div class="text-caption font-weight-bold">
                                    Evento {{ evIdx + 1 }}
                                  </div>
                                  <v-btn
                                    v-if="canEditAsignacionSupervisor"
                                    size="x-small"
                                    variant="text"
                                    color="error"
                                    @click="eliminarEventoSupervisor(detallePadre, evIdx)"
                                  >
                                    Eliminar
                                  </v-btn>
                                </div>

                                <v-text-field
                                  v-model="ev.comentarioInicial"
                                  label="Comentario inicial"
                                  density="compact"
                                  variant="outlined"
                                  hide-details
                                  bg-color="white"
                                  class="mb-2"
                                  :readonly="!canEditAsignacionSupervisor"
                                />
                                <v-text-field
                                  v-model="ev.hora"
                                  label="Hora"
                                  density="compact"
                                  variant="outlined"
                                  hide-details
                                  bg-color="white"
                                  class="mb-2"
                                  :readonly="!canEditAsignacionSupervisor"
                                />
                                <v-textarea
                                  v-model="ev.observaciones"
                                  label="Observaciones"
                                  rows="2"
                                  auto-grow
                                  density="compact"
                                  variant="outlined"
                                  hide-details
                                  bg-color="white"
                                  class="mb-2"
                                  :readonly="!canEditAsignacionSupervisor"
                                />

                                <template v-if="canEditAsignacionSupervisor">
                                  <div class="text-caption font-weight-bold text-medium-emphasis mb-1">
                                    Fotos del evento
                                  </div>
                                  <FotoCaptureConexion
                                    v-model:galeria="ev.galeria"
                                    :max-fotos="10"
                                  />
                                </template>
                                <div
                                  v-else-if="Array.isArray(ev.galeria) && ev.galeria.length"
                                  class="d-flex flex-wrap ga-2"
                                >
                                  <v-img
                                    v-for="(foto, fotoIdx) in ev.galeria"
                                    :key="`sup-evento-foto-${evIdx}-${fotoIdx}`"
                                    :src="toAbsolutePhotoUrl(foto?.url || foto?.base64 || foto?.src || '')"
                                    width="84"
                                    height="64"
                                    cover
                                    class="rounded border cursor-pointer"
                                    @click="abrirGaleriaFotos(ev.galeria)"
                                  />
                                </div>
                              </v-card>
                            </div>
                            <div
                              v-else
                              class="text-caption text-medium-emphasis"
                            >
                              Sin eventos aún.
                            </div>

                            <div
                              v-if="canEditAsignacionSupervisor"
                              class="d-flex justify-end mt-3"
                            >
                              <v-btn
                                color="primary"
                                size="small"
                                variant="flat"
                                prepend-icon="mdi-content-save"
                                @click="guardarSupervisorAntecedentes(detallePadre)"
                              >
                                Guardar antecedentes
                              </v-btn>
                            </div>
                          </v-card-text>
                        </v-card>
                      </v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </div>
              </v-card>
            </v-col>

            <!-- Tarjetas Hijos (Iterativo) -->
            <v-col
              cols="12"
              md="6"
            >
              <div class="text-subtitle-2 font-weight-bold mb-2 text-secondary d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <v-icon
                    start
                    size="small"
                  >
                    mdi-file-tree
                  </v-icon> Asignación Técnico
                </div>
                <div class="d-flex align-center ga-2">
                  <v-btn
                    v-if="canEditAsignacionDetalle"
                    color="secondary"
                    size="small"
                    variant="outlined"
                    @click="abrirModalEdicionTecnicaDesdeDetalle"
                  >
                    Editar
                    <v-icon
                      end
                      size="small"
                      icon="mdi-pencil-outline"
                    />
                  </v-btn>
                  <v-btn
                    color="primary"
                    size="small"
                    variant="outlined"
                    :loading="downloadingFotosZip"
                    :disabled="downloadingFotosZip"
                    @click="descargarFotosAsignacionTecnico"
                  >
                    Descargar fotos
                    <v-icon
                      end
                      size="small"
                      icon="mdi-download"
                    />
                  </v-btn>
                </div>
              </div>

              <div
                v-if="detalleHijos.length > 0"
                class="h-100 pr-1 custom-scroll"
                style="max-height: 60vh; overflow-y: auto;"
              >
                <v-card
                  v-for="hijo in detalleHijos"
                  :key="hijo.id_survey"
                  class="pa-4 mb-3"
                  variant="outlined"
                  style="border-color: #e2e8f0; border-radius: 8px; border-left: 4px solid #64748b;"
                >
                  <v-list
                    density="compact"
                    class="pa-0"
                  >
                    <v-list-item class="px-0">
                      <template #prepend>
                        <v-icon
                          size="small"
                          class="mr-2 text-medium-emphasis"
                        >
                          mdi-identifier
                        </v-icon>
                      </template>
                      <v-list-item-title class="text-caption font-weight-bold">
                        Orden
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-body-2 text-high-emphasis">
                        {{ hijo.orden || hijo.id_survey
                        }}
                      </v-list-item-subtitle>
                    </v-list-item>

                    <v-divider class="my-1 border-dashed" />

                    <v-list-item class="px-0">
                      <template #prepend>
                        <v-icon
                          size="small"
                          class="mr-2 text-medium-emphasis"
                        >
                          mdi-format-list-checks
                        </v-icon>
                      </template>
                      <v-list-item-title class="text-caption font-weight-bold">
                        Nombre
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-body-2 text-high-emphasis text-wrap">
                        {{ hijo.name_template_srv
                        }}
                      </v-list-item-subtitle>
                    </v-list-item>

                    <v-divider class="my-1 border-dashed" />

                    <v-list-item class="px-0">
                      <template #prepend>
                        <v-icon
                          size="small"
                          class="mr-2 text-medium-emphasis"
                        >
                          mdi-barcode
                        </v-icon>
                      </template>
                      <v-list-item-title class="text-caption font-weight-bold">
                        Código
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-body-2 text-high-emphasis">
                        {{ hijo.codi_template_srv
                        }}
                      </v-list-item-subtitle>
                    </v-list-item>

                    <v-divider class="my-1 border-dashed" />

                    <v-list-item class="px-0">
                      <template #prepend>
                        <v-icon
                          size="small"
                          class="mr-2 text-medium-emphasis"
                        >
                          mdi-domain
                        </v-icon>
                      </template>
                      <v-list-item-title class="text-caption font-weight-bold">
                        Proyecto / Cliente
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-body-2 text-high-emphasis">
                        {{ hijo.nombre_proyecto }} / {{
                          (String(hijo.cliente || '').trim() || '-') }}
                      </v-list-item-subtitle>
                    </v-list-item>

                    <v-divider class="my-1 border-dashed" />

                    <v-list-item class="px-0">
                      <template #prepend>
                        <v-icon
                          size="small"
                          class="mr-2 text-medium-emphasis"
                        >
                          mdi-account
                        </v-icon>
                      </template>
                      <v-list-item-title class="text-caption font-weight-bold">
                        Usuario Asignado
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-body-2 text-high-emphasis">
                        <v-chip
                          v-if="getNombreTecnicoAsignadoDetalle(hijo)"
                          size="small"
                          color="primary"
                          variant="flat"
                        >
                          {{ getNombreTecnicoAsignadoDetalle(hijo) }}
                        </v-chip>
                        <span
                          v-else
                          class="text-error"
                        >Sin asignar</span>
                      </v-list-item-subtitle>
                    </v-list-item>

                    <v-divider class="my-1 border-dashed" />

                    <v-list-item class="px-0">
                      <template #prepend>
                        <v-icon
                          size="small"
                          class="mr-2 text-medium-emphasis"
                        >
                          mdi-list-status
                        </v-icon>
                      </template>
                      <v-list-item-title class="text-caption font-weight-bold">
                        Estado
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-body-2">
                        <v-chip
                          size="x-small"
                          variant="flat"
                          class="font-weight-bold"
                          :style="getEstadoChipStyle(getEstadoInternoConexion(hijo))"
                        >
                          {{ getEstadoUiLabel(getEstadoInternoConexion(hijo)) }}
                        </v-chip>
                      </v-list-item-subtitle>
                    </v-list-item>

                    <v-divider class="my-1 border-dashed" />

                    <v-list-item class="px-0">
                      <template #prepend>
                        <v-icon
                          size="small"
                          class="mr-2 text-medium-emphasis"
                        >
                          mdi-calendar-range
                        </v-icon>
                      </template>
                      <v-list-item-title class="text-caption font-weight-bold">
                        Fechas Planificadas
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-body-2 text-high-emphasis">
                        Ini: {{ formatDateDisplay(hijo.fecha_plan_ini) }} <br>
                        Fin: {{ formatDateDisplay(hijo.fecha_plan_fin) }}
                      </v-list-item-subtitle>
                    </v-list-item>
                  </v-list>

                  <!-- DETALLE BODY EXEC (Visualización completa) -->
                  <div
                    v-if="hasVisibleExecutionSegments(hijo)"
                    class="mt-3 pt-2 border-t"
                  >
                    <div class="text-subtitle-2 font-weight-bold text-primary-dark mb-2">
                      Detalle de Ejecución
                    </div>

                    <div
                      v-for="(seg, si) in getVisibleExecutionSegments(hijo)"
                      :key="si"
                      class="mb-4"
                    >
                      <div
                        class="bg-grey-lighten-4 px-3 py-1 rounded-lg text-caption font-weight-bold mb-2 text-uppercase text-medium-emphasis border"
                      >
                        {{ seg.label }}
                      </div>

                      <div
                        v-for="(attr, ai) in seg.attributes"
                        :key="ai"
                        class="pl-2 mb-3 ml-1"
                        style="border-left: 2px solid #e2e8f0;"
                      >
                        <!-- FOTOS (photoCapture) -->
                        <template v-if="attr.type === 'photoCapture'">
                          <div class="text-caption font-weight-bold text-high-emphasis pl-2">
                            {{ attr.label }}
                          </div>
                          <div
                            v-if="attr.obs"
                            class="text-caption text-medium-emphasis mb-1 pl-2"
                          >
                            Nota: {{ attr.obs }}
                          </div>
                          <div
                            v-if="attr.galeria && attr.galeria.length"
                            class="d-flex flex-wrap ga-2 mt-2 pl-2"
                          >
                            <div
                              v-for="(foto, fi) in attr.galeria"
                              :key="fi"
                              class="position-relative"
                            >
                              <a
                                :href="foto.url"
                                target="_blank"
                                class="d-block cursor-pointer"
                              >
                                <v-img
                                  :src="foto.url"
                                  width="70"
                                  height="70"
                                  cover
                                  class="rounded bg-grey-lighten-3 border shadow-sm"
                                />
                              </a>
                            </div>
                          </div>
                          <div
                            v-else
                            class="text-caption text-disabled font-italic pl-2"
                          >
                            Sin registros fotográficos
                          </div>
                        </template>

                        <!-- FECHA HORA (dateHourPicker) -->
                        <template v-else-if="attr.type === 'dateHourPicker'">
                          <!-- Editable para Supervisor -->
                          <div
                            v-if="isSupervisor && isHrInicio(attr)"
                            class="pl-2 mb-1"
                          >
                            <div class="text-caption font-weight-bold text-high-emphasis">
                              {{ attr.label }}
                            </div>
                            <div class="d-flex align-center mt-1">
                              <v-text-field
                                v-model="attr.default"
                                type="datetime-local"
                                variant="outlined"
                                density="compact"
                                hide-details
                                bg-color="white"
                                style="max-width: 220px;"
                                class="mr-2"
                              />
                              <v-btn
                                color="primary"
                                size="x-small"
                                icon
                                variant="flat"
                                title="Guardar Hr Inicio"
                                @click="guardarHrInicio(hijo, attr, attr.default)"
                              >
                                <v-icon>mdi-content-save</v-icon>
                              </v-btn>
                            </div>
                          </div>

                          <div v-else>
                            <div class="text-caption font-weight-bold text-high-emphasis pl-2">
                              {{ attr.label }}
                            </div>
                            <div class="text-body-2 pl-2 font-weight-medium">
                              <v-icon
                                start
                                size="small"
                                class="text-medium-emphasis"
                              >
                                mdi-clock-outline
                              </v-icon>
                              {{ formatDateTimeDisplay(attr.default) }}
                            </div>
                          </div>
                        </template>

                        <!-- EVENTOS (registroEventos) -->
                        <template v-else-if="attr.type === 'registroEventos'">
                          <div class="text-caption font-weight-bold mb-1 pl-2">
                            {{ attr.label }}
                          </div>
                          <div class="pl-2">
                            <div
                              v-for="(ev, ei) in attr.body"
                              :key="ei"
                              class="mb-2 pa-3 bg-grey-lighten-5 rounded border"
                            >
                              <div class="d-flex justify-space-between mb-1 align-center border-b pb-1">
                                <span class="text-caption font-weight-bold text-primary">{{ ev.comentarioInicial }}</span>
                                <v-chip
                                  size="x-small"
                                  variant="flat"
                                  color="grey-lighten-3"
                                >
                                  {{ ev.hora }}
                                </v-chip>
                              </div>
                              <div
                                v-if="ev.observaciones"
                                class="text-caption mb-2 text-wrap"
                              >
                                Obs: {{ ev.observaciones }}
                              </div>

                              <!-- Fotos evento -->
                              <div
                                v-if="ev.galeria && ev.galeria.length"
                                class="mb-2"
                              >
                                <div
                                  v-if="ev.fotoObs"
                                  class="text-caption text-medium-emphasis mb-1"
                                >
                                  {{ ev.fotoObs }}
                                </div>
                                <div class="d-flex flex-wrap ga-2">
                                  <div
                                    v-for="(foto, fi) in ev.galeria"
                                    :key="fi"
                                  >
                                    <a
                                      :href="foto.url"
                                      target="_blank"
                                      class="d-block"
                                    >
                                      <v-img
                                        :src="foto.url"
                                        width="50"
                                        height="50"
                                        cover
                                        class="rounded bg-grey-lighten-3 border"
                                      />
                                    </a>
                                  </div>
                                </div>
                              </div>

                              <!-- Documentos evento -->
                              <div v-if="ev.documentos && ev.documentos.length">
                                <div
                                  v-if="ev.docsObs"
                                  class="text-caption text-medium-emphasis mb-1"
                                >
                                  {{ ev.docsObs }}
                                </div>
                                <div class="d-flex flex-column gap-1">
                                  <div
                                    v-for="(doc, di) in ev.documentos"
                                    :key="di"
                                    class="d-flex align-center"
                                  >
                                    <v-icon
                                      size="small"
                                      color="success"
                                      class="mr-1"
                                    >
                                      mdi-file-excel-box
                                    </v-icon>
                                    <a
                                      :href="doc.url"
                                      target="_blank"
                                      class="text-caption text-decoration-underline text-primary text-truncate"
                                      style="max-width: 220px;"
                                    >
                                      {{ doc.name || doc.nombre || 'Documento Adjunto' }}
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </template>

                        <!-- DEFAULT -->
                        <template v-else>
                          <!-- Bloque especial para Hr inicio editable por Supervisor -->
                          <div
                            v-if="isSupervisor && attr.label && attr.label.trim().toLowerCase() === 'hr inicio'"
                            class="pl-2 mb-1"
                          >
                            <div class="text-caption font-weight-bold text-high-emphasis">
                              {{ attr.label }}
                            </div>
                            <div class="d-flex align-center mt-1">
                              <v-text-field
                                v-model="attr.default"
                                type="time"
                                variant="outlined"
                                density="compact"
                                hide-details
                                bg-color="white"
                                style="max-width: 140px;"
                                class="mr-2"
                              />
                              <v-btn
                                color="primary"
                                size="x-small"
                                icon
                                variant="flat"
                                title="Guardar Hr Inicio"
                                @click="guardarHrInicio(hijo, attr, attr.default)"
                              >
                                <v-icon>mdi-content-save</v-icon>
                              </v-btn>
                            </div>
                          </div>

                          <div v-else>
                            <div class="text-caption font-weight-bold pl-2">
                              {{ attr.label }}
                            </div>
                            <div class="text-caption text-medium-emphasis pl-2 text-wrap">
                              {{ formatGenericDisplay(attr.value
                                ?? attr.answer ?? attr.respuesta ?? attr.default) }}
                            </div>
                          </div>
                        </template>
                      </div>
                    </div>
                  </div>
                </v-card>
              </div>
              <div
                v-else
                class="d-flex justify-center align-center h-100 border text-medium-emphasis rounded-lg bg-white"
                style="border-style: dashed !important; min-height: 200px;"
              >
                <div class="text-center">
                  <v-icon
                    size="large"
                    color="grey-lighten-2"
                  >
                    mdi-file-tree-outline
                  </v-icon>
                  <div class="text-caption mt-2">
                    No hay inspecciones hijas
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="bg-white justify-end pa-4">
          <v-btn
            color="primary"
            variant="flat"
            @click="dialogDetalle = false"
          >
            Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="dialogEditarTecnicoEjecucion"
      max-width="920"
      persistent
    >
      <v-card class="rounded-xl">
        <v-toolbar
          density="compact"
          color="white"
          class="border-b pl-2"
        >
          <v-icon
            color="secondary"
            class="ml-2 mr-2"
          >
            mdi-file-document-edit-outline
          </v-icon>
          <v-toolbar-title class="text-subtitle-1 font-weight-bold text-primary-dark">
            Editar Detalle de Ejecución y Antecedentes Complementarios
          </v-toolbar-title>
          <v-spacer />
          <v-btn
            icon
            variant="text"
            @click="cerrarModalEdicionTecnica"
          >
            <v-icon color="medium-emphasis">
              mdi-close
            </v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text class="pa-4 bg-grey-lighten-5">
          <v-alert
            v-if="tecnicoEjecucionEditError"
            type="error"
            variant="tonal"
            density="compact"
            class="mb-3"
          >
            {{ tecnicoEjecucionEditError }}
          </v-alert>
          <v-alert
            type="info"
            variant="tonal"
            density="compact"
            class="mb-3"
          >
            Survey técnico: <strong>#{{ tecnicoEjecucionSurveyId || '—' }}</strong>
          </v-alert>

          <div
            v-if="tecnicoEjecucionSegmentos.length"
            class="d-flex flex-column ga-3"
          >
            <v-card
              v-for="(seg, idx) in tecnicoEjecucionSegmentos"
              :key="`${idx}-${seg.label || 'SEG'}`"
              variant="outlined"
              class="pa-3"
            >
              <div class="text-subtitle-2 font-weight-bold mb-3 text-primary-dark">
                {{ seg.label || `Segmento ${idx + 1}` }}
              </div>

              <div
                v-for="(attr, ai) in seg.attributes || []"
                :key="`${idx}-${ai}-${attr.label || 'attr'}`"
                class="mb-3"
              >
                <template v-if="isPhotoTypeAttr(attr)">
                  <div class="text-caption font-weight-bold text-medium-emphasis mb-2">
                    {{ attr.label || 'Evidencia fotográfica' }}
                  </div>
                  <FotoCaptureConexion
                    v-model:galeria="attr.galeria"
                    :max-fotos="10"
                  />
                </template>
                <template v-else-if="isRegistroEventosTypeAttr(attr)">
                  <div class="d-flex align-center justify-space-between mb-2">
                    <div class="text-caption font-weight-bold text-medium-emphasis">
                      {{ attr.label || 'Eventos' }}
                    </div>
                    <v-btn
                      size="x-small"
                      variant="outlined"
                      color="primary"
                      @click="agregarEventoRegistro(attr)"
                    >
                      Agregar evento
                    </v-btn>
                  </div>

                  <div
                    v-if="Array.isArray(attr.body) && attr.body.length"
                    class="d-flex flex-column ga-2"
                  >
                    <v-card
                      v-for="(ev, ei) in attr.body"
                      :key="`${idx}-${ai}-ev-${ei}`"
                      variant="outlined"
                      class="pa-2"
                    >
                      <div class="d-flex align-center justify-space-between mb-2">
                        <div class="text-caption font-weight-bold">
                          Evento {{ ei + 1 }}
                        </div>
                        <v-btn
                          size="x-small"
                          variant="text"
                          color="error"
                          @click="eliminarEventoRegistro(attr, ei)"
                        >
                          Eliminar
                        </v-btn>
                      </div>

                      <v-text-field
                        v-model="ev.comentarioInicial"
                        label="Comentario inicial"
                        density="compact"
                        variant="outlined"
                        hide-details
                        bg-color="white"
                        class="mb-2"
                      />
                      <v-text-field
                        v-model="ev.hora"
                        label="Hora"
                        density="compact"
                        variant="outlined"
                        hide-details
                        bg-color="white"
                        class="mb-2"
                      />
                      <v-textarea
                        v-model="ev.observaciones"
                        label="Observaciones"
                        rows="2"
                        auto-grow
                        density="compact"
                        variant="outlined"
                        hide-details
                        bg-color="white"
                        class="mb-2"
                      />
                      <div class="text-caption font-weight-bold text-medium-emphasis mb-1">
                        Fotos del evento
                      </div>
                      <FotoCaptureConexion
                        v-model:galeria="ev.galeria"
                        :max-fotos="10"
                      />
                    </v-card>
                  </div>
                  <div
                    v-else
                    class="text-caption text-medium-emphasis"
                  >
                    Sin eventos aún.
                  </div>
                </template>
                <template v-else-if="isEditableAttrTecnico(attr)">
                  <v-select
                    v-if="isComboTypeAttr(attr)"
                    v-model="attr.values.selected"
                    :label="attr.label || 'Campo'"
                    :items="getComboItems(attr.values?.options || [])"
                    item-title="label"
                    item-value="value"
                    density="compact"
                    variant="outlined"
                    hide-details
                    bg-color="white"
                  />
                  <div
                    v-else-if="isChecklistTypeAttr(attr)"
                    class="border rounded bg-white pa-2"
                  >
                    <div
                      v-for="(item, ci) in attr.checkBoby"
                      :key="`${idx}-${ai}-chk-${ci}`"
                      class="mb-2"
                    >
                      <div class="text-caption mb-1">
                        {{ item.label || `Item ${ci + 1}` }}
                      </div>
                      <v-btn-toggle
                        v-model="item.default"
                        mandatory
                        density="compact"
                        class="w-100"
                      >
                        <v-btn
                          v-for="opt in item.options || []"
                          :key="String(opt?.value ?? opt)"
                          :value="opt?.value ?? opt"
                          size="small"
                          class="flex-grow-1"
                        >
                          {{ opt?.label || opt?.value || opt }}
                        </v-btn>
                      </v-btn-toggle>
                    </div>
                  </div>
                  <v-text-field
                    v-else-if="isTimeTypeAttr(attr)"
                    :model-value="getAttrEditorValue(attr)"
                    :label="attr.label || 'Campo'"
                    type="time"
                    density="compact"
                    variant="outlined"
                    hide-details
                    bg-color="white"
                    @update:model-value="setAttrCurrentValue(attr, $event)"
                  />
                  <v-text-field
                    v-else-if="isDateTimeTypeAttr(attr)"
                    :model-value="getAttrEditorValue(attr)"
                    :label="attr.label || 'Campo'"
                    type="datetime-local"
                    density="compact"
                    variant="outlined"
                    hide-details
                    bg-color="white"
                    @update:model-value="setAttrCurrentValue(attr, $event)"
                  />
                  <v-text-field
                    v-else-if="isDateTypeAttr(attr)"
                    :model-value="getAttrEditorValue(attr)"
                    :label="attr.label || 'Campo'"
                    type="date"
                    density="compact"
                    variant="outlined"
                    hide-details
                    bg-color="white"
                    @update:model-value="setAttrCurrentValue(attr, $event)"
                  />
                  <v-text-field
                    v-else-if="isNumberTypeAttr(attr)"
                    :model-value="getAttrEditorValue(attr)"
                    :label="attr.label || 'Campo'"
                    type="number"
                    density="compact"
                    variant="outlined"
                    hide-details
                    bg-color="white"
                    @update:model-value="setAttrCurrentValue(attr, $event)"
                  />
                  <v-textarea
                    v-else-if="isTextAreaTypeAttr(attr)"
                    :model-value="getAttrEditorValue(attr)"
                    :label="attr.label || 'Campo'"
                    rows="2"
                    auto-grow
                    density="compact"
                    variant="outlined"
                    hide-details
                    bg-color="white"
                    @update:model-value="setAttrCurrentValue(attr, $event)"
                  />
                  <v-textarea
                    v-else
                    :model-value="getAttrEditorValue(attr)"
                    :label="attr.label || 'Campo'"
                    rows="2"
                    auto-grow
                    density="compact"
                    variant="outlined"
                    hide-details
                    bg-color="white"
                    @update:model-value="setAttrCurrentValue(attr, $event)"
                  />
                </template>
                <template v-else>
                  <div class="text-caption font-weight-bold text-medium-emphasis">
                    {{ attr.label || 'Campo' }}
                  </div>
                  <div
                    class="text-caption text-medium-emphasis"
                  >
                    {{ formatGenericDisplay(getAttrCurrentValue(attr)) }}
                  </div>
                </template>
              </div>
            </v-card>
          </div>
          <div
            v-else
            class="text-caption text-medium-emphasis"
          >
            No se encontraron campos editables en Detalle de Ejecución / Antecedentes Complementarios.
          </div>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4 bg-white d-flex justify-end ga-2">
          <v-btn
            variant="text"
            color="medium-emphasis"
            :disabled="guardandoEdicionTecnica"
            @click="cerrarModalEdicionTecnica"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="guardandoEdicionTecnica"
            @click="guardarEdicionTecnica"
          >
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar
      v-model="snackbar.open"
      :color="snackbar.color"
      timeout="3000"
      location="top right"
    >
      {{ snackbar.text }}

      <template #actions>
        <v-btn
          color="white"
          variant="text"
          @click="snackbar.open = false"
        >
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, onActivated, watch, nextTick, onBeforeUnmount } from 'vue'
import apiAxios from '@/services/api'
import { useUserDetailStore } from "@/stores/userDetail"
import FotoCaptureConexion from '@/components/conexion/FotoCaptureConexion.vue'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

const userDetailStore = useUserDetailStore()
const API_BASE_URL =
  String(
    apiAxios?.defaults?.baseURL ||
    import.meta?.env?.VITE_API_BASE_URL ||
    import.meta?.env?.VUE_APP_API_BASE_URL ||
    'https://servidor.leanglobal.cl/lean-services-dev/api'
  ).replace(/\/$/, '')
const USE_CONEXION_V4 = String(import.meta?.env?.VITE_USE_CONEXION_V4 ?? 'true').trim().toLowerCase() !== 'false'
const conexionSurveyServiceInUse = ref(USE_CONEXION_V4 ? 'V4' : 'V3')
const docUrlCache = ref({})
const flowPdfBySurveyCache = ref({})
const cnxLoadIndexCache = ref(null)
const cnxLoadTimelineCache = ref([])
const PLAN_C_OBS_TAG = '[PLAN_C]'

const snackbar = ref({
  open: false,
  text: '',
  color: 'success'
})

const informacionExtra = [
  { label: 'Hora de llegada', key: 'HORA DE LLEGADA' },
  { label: 'Charla', key: 'CHARLA' },
  { label: 'ATS', key: 'ATS' },
  { label: 'Hr inicio', key: 'HR INICIO' },
  { label: 'Llegada Supervisor', key: 'LLEGADA SUPERVISOR' },
  { label: 'Llegada Sup Terracon', key: 'LLEGADA SUP TERRACON' },
  { label: 'Llegada Certificador', key: 'LLEGADA CERTIFICADOR' },
  { label: 'Fusionista', key: 'FUSIONISTA' },
  { label: 'Sol Hr Fusionista', key: 'SOL HR FUSIONISTA' },
  { label: 'Estado', key: 'ESTADO' },
  { label: 'T. Altura', key: 'T. ALTURA' },
  { label: 'Kit Conversión', key: 'KIT CONVERSIÓN' },
  { label: 'Medidor/Capsula', key: 'MEDIDOR/CAPSULA' },
  { label: 'Ducto', key: 'DUCTO' },
  { label: 'Retiro Artef', key: 'RETIRO ARTEF' },
  { label: 'Retiro Kit', key: 'RETIRO KIT' },
  { label: 'PHI', key: 'PHI' },
  { label: 'PHF', key: 'PHF' },
  { label: 'Cierre Supervisor', key: 'CIERRE SUPERVISOR' },
  { label: 'R.U.V.', key: 'R.U.V.' },
  { label: 'Cierre Cliente', key: 'CIERRE CLIENTE' },
  { label: 'Observaciones', key: 'OBSERVACIONES' },
  { label: 'mts Cañería', key: 'MTS CAÑERÍA' },
  { label: 'Día Ejec', key: 'DÍA EJEC' },
  { label: 'Artefac', key: 'ARTEFAC' },
  { label: 'Convers Artefac', key: 'CONVERS ARTEFAC' },
  { label: 'Estado Pend', key: 'ESTADO PEND' },
  { label: 'Evaluación', key: 'EVALUACIÓN' },
  { label: 'Costo Contratista Neto UF', key: 'COSTO CONTRATISTA NETO UF' },
]

// ==================================
// FILTRO CARGA (por fecha LOCAL)
// ==================================
const filtroCarga = ref(null)

function isPlanCMode() {
  return String(props?.planMode || '').toLowerCase() === 'plan_c'
}

function isPlanCLoadFromObservaciones(obs) {
  return String(obs || '').toUpperCase().includes(PLAN_C_OBS_TAG)
}

function surveyMatchesPlanMode(survey, cnxLoadIndex) {
  const loadId = Number(survey?.id_load || 0)
  if (!loadId) return !isPlanCMode()
  const meta = cnxLoadIndex?.get?.(loadId) || null
  const belongsPlanC = !!meta?.is_plan_c
  return isPlanCMode() ? belongsPlanC : !belongsPlanC
}

function normalizeLoadName(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

function extractDateFromExcelName(name) {
  const s = String(name || '').trim()
  if (!s) return ''
  const m = s.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/)
  if (!m) return ''
  const dd = String(Number(m[1])).padStart(2, '0')
  const mm = String(Number(m[2])).padStart(2, '0')
  const yy = String(m[3] || '')
  const yyyy = yy.length === 2 ? `20${yy}` : yy
  if (!yyyy || Number(mm) < 1 || Number(mm) > 12 || Number(dd) < 1 || Number(dd) > 31) return ''
  return `${yyyy}-${mm}-${dd}`
}

function extractLoadMetaFromRaw(raw) {
  const obj = typeof raw === 'string' ? (() => {
    try { return JSON.parse(raw) } catch { return null }
  })() : raw
  if (!obj || typeof obj !== 'object') return { id_load: 0, nombre: '' }

  const visited = new Set()
  let idLoad = 0
  let nombre = ''
  const nameKeySet = new Set([
    'namedocorig', 'namedocinterno', 'name_doc_orig', 'name_doc_interno',
    'nombreexcel', 'nombrecarga', 'archivoorigen', 'nombrearchivo'
  ])

  const walk = (node) => {
    if (!node || typeof node !== 'object') return
    if (visited.has(node)) return
    visited.add(node)

    if (Array.isArray(node)) {
      for (const it of node) walk(it)
      return
    }

    for (const [k, v] of Object.entries(node)) {
      const kNorm = String(k || '').toLowerCase().replace(/[^a-z0-9_]/g, '')
      if (!idLoad && (kNorm === 'idload' || kNorm === 'id_load' || kNorm === 'loadid')) {
        const n = Number(v || 0)
        if (n > 0) idLoad = n
      }
      if (!nombre && nameKeySet.has(kNorm)) {
        const t = String(v || '').trim()
        if (t) nombre = t
      }
      if (typeof v === 'object' && v !== null) walk(v)
    }
  }

  walk(obj)
  return { id_load: Number(idLoad || 0), nombre: String(nombre || '').trim() }
}

function toYYYYMMDDLocal(input) {
  if (!input) return ''
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) return input

  if (typeof input === 'string') {
    const s = input.trim()
    const sLow = s.toLowerCase()

    // dd-mm-yyyy | dd/mm/yyyy (con o sin hora)
    const dmyNum = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:\b|[ t])/)
    if (dmyNum) {
      const dd = String(Number(dmyNum[1])).padStart(2, '0')
      const mm = String(Number(dmyNum[2])).padStart(2, '0')
      const yyyy = dmyNum[3]
      if (Number(mm) >= 1 && Number(mm) <= 12 && Number(dd) >= 1 && Number(dd) <= 31) {
        return `${yyyy}-${mm}-${dd}`
      }
    }

    const m = s.match(/^(\d{1,2})-([a-zñ]{3,})-(\d{2}|\d{4})$/i)
    if (m) {
      const dd = String(Number(m[1])).padStart(2, '0')
      const monTxt = sLow.match(/^(\d{1,2})-([a-zñ]{3,})-(\d{2}|\d{4})$/i)?.[2]?.slice(0, 3) || m[2].toLowerCase().slice(0, 3)
      const yyRaw = m[3]
      const months = {
        ene: '01', feb: '02', mar: '03', abr: '04', may: '05', jun: '06',
        jul: '07', ago: '08', sep: '09', set: '09', oct: '10', nov: '11', dic: '12'
      }
      const mm = months[monTxt]
      if (!mm) return ''
      const yyyy = yyRaw.length === 2 ? `20${yyRaw}` : yyRaw
      return `${yyyy}-${mm}-${dd}`
    }
  }

  const d = new Date(input)
  if (Number.isNaN(d.getTime())) return ''
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function parseDateSafe(input) {
  if (!input) return null
  const d = new Date(input)
  if (!Number.isNaN(d.getTime())) return d

  const normalized = toYYYYMMDDLocal(input)
  if (normalized) {
    const dNorm = new Date(`${normalized}T00:00:00`)
    if (!Number.isNaN(dNorm.getTime())) return dNorm
  }
  return null
}

async function getCnxLoadIndex() {
  if (cnxLoadIndexCache.value) return cnxLoadIndexCache.value
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerCNXLoad')
    const rows = Array.isArray(data) ? data : []
    const byId = new Map()
    const timeline = []
    for (const r of rows) {
      const id = Number(r?.id_load || 0)
      if (!id) continue
      const meta = {
        id_load: id,
        nombre: String(r?.name_doc_orig || r?.name_doc_interno || '').trim(),
        nombre_norm: normalizeLoadName(r?.name_doc_orig || r?.name_doc_interno || ''),
        fecha_ts: parseDateSafe(r?.fecha_carga),
        fecha_iso: r?.fecha_carga || '',
        observaciones: String(r?.observaciones || ''),
        is_plan_c: isPlanCLoadFromObservaciones(r?.observaciones)
      }
      byId.set(id, meta)
      if (meta.fecha_ts) timeline.push(meta)
    }
    timeline.sort((a, b) => (a.fecha_ts?.getTime?.() || 0) - (b.fecha_ts?.getTime?.() || 0))
    cnxLoadIndexCache.value = byId
    cnxLoadTimelineCache.value = timeline
    return byId
  } catch (e) {
    console.error('[CNXLoadIndex] Error:', e)
    cnxLoadIndexCache.value = new Map()
    cnxLoadTimelineCache.value = []
    return cnxLoadIndexCache.value
  }
}

function cumpleFiltroFechaPlan(s) {
  const loadIdFiltro = Number(filtroCarga.value?.id_load || 0)
  const loadIdsEquivalentes = new Set(
    (Array.isArray(filtroCarga.value?.ids_load_equivalentes) ? filtroCarga.value.ids_load_equivalentes : [])
      .map(v => Number(v || 0))
      .filter(v => v > 0)
  )
  const loadIdSurvey = Number(s?.id_load || 0)
  const fechaSurvey = parseDateSafe(
    s?.fecha_creacion_raw ||
    s?.fecha_creacion ||
    s?.fecha_upload ||
    s?.fecha_plan_ini_raw ||
    s?.fecha_plan_ini ||
    null
  )
  const diaSurveyCreacion =
    toYYYYMMDDLocal(s?.fecha_creacion_raw) ||
    toYYYYMMDDLocal(s?.fecha_creacion) ||
    toYYYYMMDDLocal(s?.fecha_upload) ||
    ''
  const diaSurveyPlan =
    toYYYYMMDDLocal(s?.fecha_plan_ini_raw) ||
    toYYYYMMDDLocal(s?.fecha_plan_ini) ||
    ''
  const diaSurveyBodyExec =
    toYYYYMMDDLocal(s?.fecha_tabla) ||
    toYYYYMMDDLocal(s?.fecha) ||
    ''
  const diaCarga = filtroCarga.value?.fecha_dia || ''
  const diaNombreExcel = String(filtroCarga.value?.fecha_nombre_excel || '').trim()
  const rangoDesdeIso = filtroCarga.value?.rango_desde || ''
  const rangoHastaIso = filtroCarga.value?.rango_hasta || ''
  const rangoDesde = rangoDesdeIso ? parseDateSafe(rangoDesdeIso) : null
  const rangoHasta = rangoHastaIso ? parseDateSafe(rangoHastaIso) : null
  const desde = toYYYYMMDDLocal(props.fechaDesde)
  const hasta = toYYYYMMDDLocal(props.fechaHasta)

  if (diaCarga) {
    // Filtro por fila de carga seleccionada:
    // 1) Si existe id_load de filtro, aplicar match por id_load equivalente (mismo nombre + fecha).
    // 2) Fallback fecha solo para históricos sin id_load seleccionado.
    if (loadIdFiltro > 0) {
      if (loadIdsEquivalentes.size) return loadIdsEquivalentes.has(loadIdSurvey)
      return loadIdSurvey === loadIdFiltro
    }

    const fechaRef = parseDateSafe(
      s?.load_fecha_carga_iso ||
      s?.fecha_creacion_raw ||
      s?.fecha_creacion ||
      s?.fecha_upload ||
      null
    ) || fechaSurvey

    if (fechaRef && rangoDesde && rangoHasta) {
      const ts = fechaRef.getTime()
      const okDesde = ts >= rangoDesde.getTime()
      const okHasta = !rangoHasta || ts < rangoHasta.getTime()
      if (okDesde && okHasta) return true
    }

    if (fechaRef && rangoDesde && !rangoHasta) {
      const ts = fechaRef.getTime()
      const inicio = rangoDesde.getTime() - (30 * 60 * 1000)    // -30 min
      const fin = rangoDesde.getTime() + (36 * 60 * 60 * 1000)  // +36 h
      if (ts >= inicio && ts <= fin) return true
    }

    return (
      (!!diaSurveyCreacion && diaSurveyCreacion === diaCarga) ||
      (!!diaSurveyPlan && (diaSurveyPlan === diaCarga || (diaNombreExcel && diaSurveyPlan === diaNombreExcel)))
    )
  }

  if (!desde && !hasta) {
    return true
  }

  // Para Asignaciones la fecha visible en tabla (body_exec -> fecha_tabla)
  // debe tener prioridad sobre fecha de creación/plan.
  const diaSurvey = diaSurveyBodyExec || diaSurveyCreacion || diaSurveyPlan
  if (!diaSurvey) {
    return false
  }

  const cumpleDesde = !desde || diaSurvey >= desde
  const cumpleHasta = !hasta || diaSurvey <= hasta
  return cumpleDesde && cumpleHasta
}

async function filtrarPorCarga({ id_load, fecha_carga, fecha_carga_texto, nombre_carga, rango_desde, rango_hasta }) {
  const idLoadNum = Number(id_load || 0)
  if (!idLoadNum) {
    filtroCarga.value = null
    await getSurveys()
    return
  }

  const fecha_dia = toYYYYMMDDLocal(fecha_carga)
  const byId = await getCnxLoadIndex()
  const selectedMeta = byId.get(idLoadNum) || null
  const targetNombreNorm = normalizeLoadName(nombre_carga || selectedMeta?.nombre || '')
  const targetFechaDia = fecha_dia || toYYYYMMDDLocal(selectedMeta?.fecha_iso || '')
  const idsLoadEquivalentes = []

  for (const meta of (byId?.values?.() || [])) {
    const idMeta = Number(meta?.id_load || 0)
    if (!idMeta) continue
    const nombreNorm = normalizeLoadName(meta?.nombre || '')
    const fechaMetaDia = toYYYYMMDDLocal(meta?.fecha_iso || '')
    if (targetNombreNorm && targetFechaDia && nombreNorm === targetNombreNorm && fechaMetaDia === targetFechaDia) {
      idsLoadEquivalentes.push(idMeta)
    }
  }

  if (!idsLoadEquivalentes.length) idsLoadEquivalentes.push(idLoadNum)
  filtroCarga.value = {
    id_load: idLoadNum,
    ids_load_equivalentes: idsLoadEquivalentes,
    fecha_carga,
    fecha_dia,
    fecha_carga_texto: String(fecha_carga_texto || ''),
    nombre_carga: String(nombre_carga || ''),
    nombre_norm: normalizeLoadName(nombre_carga),
    fecha_nombre_excel: extractDateFromExcelName(nombre_carga),
    rango_desde: rango_desde || null,
    rango_hasta: rango_hasta || null
  }
  await getSurveys()
}

// ==================================
// PROPS / UI
// ==================================
const props = defineProps({
  fechaDesde: String,
  fechaHasta: String,
  clienteId: [String, Number],
  proyectoId: [String, Number],
  registroInformes: { type: Boolean, default: false },
  hideHeader: { type: Boolean, default: false },
  planMode: { type: String, default: 'conexion' } // 'conexion' | 'plan_c'
})
const emit = defineEmits(['open-excel', 'open-cargas'])
const cargarExcelLabel = computed(() => (isPlanCMode() ? 'Cargar Excel C' : 'Cargar Excel'))

const tableHeight = computed(() => {
  const offset = props.hideHeader ? 300 : 420
  const h = window.innerHeight - offset
  return Math.min(Math.max(h, 320), 760)
})

const topScrollRef = ref(null)
const tableRef = ref(null)
const bottomScrollRef = ref(null)
const scrollContentWidth = ref('0px')
const middleScrollEl = ref(null)
let resizeObserver = null
let isSyncing = false
const subtituloAsignaciones = computed(() => {
  const tituloBase = isPlanCMode() ? 'Gestión de procesos plan C' : 'Gestión de procesos de conexión'
  const nombre = String(filtroCarga.value?.nombre_carga || '').trim()
  const fechaTxt = String(filtroCarga.value?.fecha_carga_texto || '').trim()
  const fechaIso = String(filtroCarga.value?.fecha_carga || '').trim()
  const fecha = fechaTxt || (fechaIso ? formatDateTimeDisplay(fechaIso) : '')

  if (nombre || fecha) {
    return `${tituloBase} | Carga: ${fecha || '-'}${nombre ? ` - ${nombre}` : ''}`
  }
  return tituloBase
})

// =====================
// Tabla
// =====================
const tabla = ref([])
const tablaFull = ref([])
const searchAsignaciones = ref('')
const cargandoAsignaciones = ref(false)
const estadoFiltrosDisponibles = [
  { key: 'CREADO', label: 'Creado' },
  { key: 'CONEXION', label: 'Conexión' },
  { key: 'TRABAJO_ESPECIAL', label: 'Trabajo Especial' },
  { key: 'EJECUCION', label: 'Ejecución' },
  { key: 'REACTIVACION', label: 'Reactivación' },
  { key: 'PRODORAL', label: 'Prodoral' },
  { key: 'EN_CONTINUACION', label: 'En Continuación' },
  { key: 'NO_SE_EJECUTA', label: 'No se ejecuta' }
]
const activeEstadoFiltros = ref(estadoFiltrosDisponibles.map((x) => x.key))
const estadoFiltroAll = computed(() =>
  activeEstadoFiltros.value.length === estadoFiltrosDisponibles.length
)

const estadoFilterStyles = {
  TODOS: { backgroundColor: '#e3f2fd', color: '#0d47a1', border: '1px solid #90caf9' },
  APROBADO: { backgroundColor: '#e8f5e9', color: '#1b5e20', border: '1px solid #a5d6a7' },
  CREADO: { backgroundColor: '#e8eaf6', color: '#283593', border: '1px solid #9fa8da' },
  VERIFICACION: { backgroundColor: '#fff3e0', color: '#e65100', border: '1px solid #ffcc80' },
  CONEXION: { backgroundColor: '#e8f5e9', color: '#1b5e20', border: '1px solid #a5d6a7' },
  TRABAJO_ESPECIAL: { backgroundColor: '#e8eaf6', color: '#283593', border: '1px solid #9fa8da' },
  EJECUCION: { backgroundColor: '#fff3e0', color: '#e65100', border: '1px solid #ffcc80' },
  REACTIVACION: { backgroundColor: '#e8f5e9', color: '#1b5e20', border: '1px solid #a5d6a7' },
  PRODORAL: { backgroundColor: '#fbe9e7', color: '#bf360c', border: '1px solid #ffab91' },
  EN_CONTINUACION: { backgroundColor: '#e0f7fa', color: '#006064', border: '1px solid #80deea' },
  NO_SE_EJECUTA: { backgroundColor: '#ffebee', color: '#b71c1c', border: '1px solid #ef9a9a' },
  EXTERNO: { backgroundColor: '#fff8e1', color: '#5d4037', border: '1px solid #ffe082' },
  OFF: { backgroundColor: '#f5f5f5', color: '#616161', border: '1px solid #e0e0e0' }
}

// =====================
// Expand (padre -> hijos)
// =====================
const expanded = ref(new Set())

function isExpanded(id) {
  return expanded.value.has(Number(id))
}
function toggleExpand(id) {
  const key = Number(id)
  const next = new Set(expanded.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  expanded.value = next
}

// 👇 Agrupa hijos por padre
const hijosByPadre = computed(() => {
  const m = new Map()
  for (const s of (tablaFull.value ?? [])) {
    const padreId = Number(s?.id_survey_padre || 0)
    if (!padreId) continue
    if (!m.has(padreId)) m.set(padreId, [])
    m.get(padreId).push(s)
  }
  for (const [k, arr] of m.entries()) {
    arr.sort((a, b) => Number(a.id_survey) - Number(b.id_survey))
    m.set(k, arr)
  }
  return m
})

function tieneHijos(idPadre) {
  return (hijosByPadre.value.get(Number(idPadre))?.length || 0) > 0
}

function getNombreTecnicoDesdeHijo(itemPadre) {
  const hijos = hijosByPadre.value.get(Number(itemPadre?.id_survey)) || []
  const hijoConTecnicoAsignado = hijos.find(h => Number(h?.id_user_tecnico || 0) > 0)
  if (hijoConTecnicoAsignado) {
    return (
      String(hijoConTecnicoAsignado?.nombre_tecnico || '').trim() ||
      getUserNameById(hijoConTecnicoAsignado?.id_user_tecnico) ||
      ''
    )
  }
  return ''
}

function getNombreTecnicoAsignado(item) {
  // Prioridad: técnico asignado del hijo (regla operativa de Conexión)
  const tecnicoHijo = getNombreTecnicoDesdeHijo(item)
  if (tecnicoHijo) return tecnicoHijo

  // Fallback: técnico del propio survey (si aplica)
  return String(item?.nombre_tecnico || '').trim()
}

function getNombreSupervisorAsignadoDetalle(item) {
  return String(
    item?.nombre_supervisor ||
    getUserNameById(item?.id_user_supervisor) ||
    item?.nombre_user ||
    ''
  ).trim()
}

function getNombreTecnicoAsignadoDetalle(item) {
  return String(
    item?.nombre_tecnico ||
    getUserNameById(item?.id_user_tecnico) ||
    item?.nombre_user ||
    ''
  ).trim()
}

// ✅ Solo PADRES: aquellos sin id_survey_padre
const tablaPadres = computed(() => {
  return (tabla.value ?? []).filter(s => !Number(s?.id_survey_padre || 0))
})

function normalizeSearchText(v) {
  return String(v ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function normalizeEstado(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim()
}

function isInvalidEstadoValue(value) {
  const raw = String(value ?? '').trim()
  if (!raw) return true
  const normalized = raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '')
    .toUpperCase()
  return raw === '-' || raw === '—' || ['NULL', 'UNDEFINED', 'NA', 'NAN'].includes(normalized)
}

function getEstadoInternoConexion(item) {
  const valores = item?.valores && typeof item.valores === 'object' ? item.valores : {}
  const estado = String(
    item?.estado_conexion ||
    item?.estado_conexion_detalle ||
    valores['ESTADO CONEXION'] ||
    valores['ESTADO CONEXIÓN'] ||
    valores.ESTADO ||
    ''
  ).trim()
  if (!isInvalidEstadoValue(estado)) return estado

  const estadoSurvey = String(item?.estado_srv || '').trim()
  return isInvalidEstadoValue(estadoSurvey) ? '' : estadoSurvey
}

function getEstadoUiLabel(value) {
  const estado = normalizeEstado(value)
  if (!estado) return ''
  if (estado === 'PRE CREADO') return 'Creado'
  if (estado === 'CREADO') return 'Creado'
  if (estado === 'ASIGNADO') return 'Asignado'
  if (estado.includes('VERIFICACION')) return 'Verificación'
  if (estado === 'APROBADO') return 'Aprobado'
  if (estado === 'EN EJECUCION') return 'En Ejecución'
  if (estado === 'NO SE EJECUTA') return 'No se ejecuta'
  if (estado === 'TERMINADO OK') return 'Terminado OK'
  if (estado === 'TERMINADO NO-OK') return 'Terminado No-OK'
  return String(value ?? '')
}

function getEstadoUiKey(value) {
  const estado = normalizeEstado(value)
  if (estado === 'PRE CREADO' || estado === 'CREADO') return 'CREADO'
  if (estado === 'ASIGNADO') return 'ASIGNADO'
  if (estado.includes('VERIFICACION')) return 'VERIFICACION'
  if (estado === 'APROBADO' || estado === 'TERMINADO OK') return 'APROBADO'
  if (estado === 'EN EJECUCION' || estado === 'EJECUCION') return 'EJECUCION'
  if (estado === 'NO SE EJECUTA') return 'NO_SE_EJECUTA'
  if (estado === 'TERMINADO NO-OK') return 'NO_OK'
  if (estado === 'CONEXION') return 'CONEXION'
  if (estado === 'TRABAJO ESPECIAL') return 'TRABAJO_ESPECIAL'
  if (estado === 'REACTIVACION') return 'REACTIVACION'
  if (estado === 'PRODORAL') return 'PRODORAL'
  if (estado === 'EN CONTINUACION') return 'EN_CONTINUACION'
  if (estado === 'MEDIA PRESION') return 'MEDIA_PRESION'
  if (estado === 'EXTERNO' || estado === 'EXTENSO') return 'EXTERNO'
  return 'OTRO'
}

function getEstadoChipStyle(value) {
  const key = getEstadoUiKey(value)
  if (key === 'APROBADO') return { backgroundColor: '#e8f5e9', color: '#1b5e20', border: '1px solid #a5d6a7' }
  if (key === 'CREADO') return { backgroundColor: '#e8eaf6', color: '#283593', border: '1px solid #9fa8da' }
  if (key === 'ASIGNADO') return { backgroundColor: '#e0f2f1', color: '#004d40', border: '1px solid #80cbc4' }
  if (key === 'VERIFICACION') return { backgroundColor: '#fff3e0', color: '#e65100', border: '1px solid #ffcc80' }
  if (key === 'CONEXION') return { backgroundColor: '#e8f5e9', color: '#1b5e20', border: '1px solid #a5d6a7' }
  if (key === 'TRABAJO_ESPECIAL') return { backgroundColor: '#e8eaf6', color: '#283593', border: '1px solid #9fa8da' }
  if (key === 'EJECUCION') return { backgroundColor: '#fff3e0', color: '#e65100', border: '1px solid #ffcc80' }
  if (key === 'REACTIVACION') return { backgroundColor: '#e8f5e9', color: '#1b5e20', border: '1px solid #a5d6a7' }
  if (key === 'PRODORAL') return { backgroundColor: '#fbe9e7', color: '#bf360c', border: '1px solid #ffab91' }
  if (key === 'EN_CONTINUACION') return { backgroundColor: '#e0f7fa', color: '#006064', border: '1px solid #80deea' }
  if (key === 'MEDIA_PRESION') return { backgroundColor: '#eceff1', color: '#263238', border: '1px solid #b0bec5' }
  if (key === 'NO_SE_EJECUTA') return { backgroundColor: '#ffebee', color: '#b71c1c', border: '1px solid #ef9a9a' }
  if (key === 'NO_OK') return { backgroundColor: '#ffebee', color: '#b71c1c', border: '1px solid #ef9a9a' }
  if (key === 'EXTERNO') return { backgroundColor: '#fff8e1', color: '#5d4037', border: '1px solid #ffe082' }
  return { backgroundColor: '#f5f5f5', color: '#424242', border: '1px solid #e0e0e0' }
}

function getEstadoOptionClass(value) {
  const key = getEstadoUiKey(value)
  if (key === 'CONEXION') return 'estado-option--conexion'
  if (key === 'TRABAJO_ESPECIAL') return 'estado-option--trabajo-especial'
  if (key === 'EJECUCION') return 'estado-option--ejecucion'
  if (key === 'REACTIVACION') return 'estado-option--reactivacion'
  if (key === 'PRODORAL') return 'estado-option--prodoral'
  if (key === 'EN_CONTINUACION') return 'estado-option--en-continuacion'
  if (key === 'MEDIA_PRESION') return 'estado-option--media-presion'
  if (key === 'NO_SE_EJECUTA') return 'estado-option--no-se-ejecuta'
  return ''
}

function getEstadoItemValue(item) {
  return item?.raw ?? item?.value ?? item?.title ?? ''
}

function getEstadoItemLabel(item) {
  return item?.title ?? item?.raw ?? item?.value ?? ''
}

function isEstadoFiltroActivo(key) {
  return activeEstadoFiltros.value.includes(key)
}

function toggleEstadoFiltro(key) {
  const current = new Set(activeEstadoFiltros.value)
  if (current.has(key)) current.delete(key)
  else current.add(key)
  activeEstadoFiltros.value = Array.from(current)
}

function onToggleEstadoAll(value) {
  const next = !!value
  activeEstadoFiltros.value = next ? estadoFiltrosDisponibles.map((x) => x.key) : []
}

function matchEstadoFiltros(item) {
  if (estadoFiltroAll.value) return true
  const key = getEstadoUiKey(getEstadoInternoConexion(item))
  if (key === 'ASIGNADO') return isEstadoFiltroActivo('CREADO')
  return isEstadoFiltroActivo(key)
}

function rowToSearchBlob(item) {
  const fechaTablaRaw = String(item?.fecha_tabla ?? '')
  const fechaTablaFmt = formatDateDisplay(fechaTablaRaw)
  const base = [
    item?.id_survey,
    item?.orden,
    item?.certificadora,
    item?.proyecto,
    item?.ic_sap_mg,
    item?.gio,
    item?.nombre_supervisor,
    getNombreTecnicoAsignado(item),
    item?.fecha_tabla,
    fechaTablaFmt,
    toYYYYMMDDLocal(fechaTablaRaw),
    item?.direccion_comuna,
    item?.estado_conexion,
    item?.estado_conexion_detalle,
    item?.cliente,
    item?.fonos,
    item?.hora_llegada_tecnico,
    item?.charla,
    item?.ats,
    item?.t_altura,
    item?.observacion,
    item?.rut
  ]

  const vals = Object.values(item?.valores || {})
  return normalizeSearchText([...base, ...vals].map(v => String(v ?? '')).join(' | '))
}

function parseSearchDateQuery(rawQuery) {
  const txt = String(rawQuery ?? '').trim()
  if (!txt) return null

  const iso = txt.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/)
  if (iso) {
    const y = Number(iso[1]); const m = Number(iso[2]); const d = Number(iso[3])
    if (y > 1900 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      const ymd = `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const dmy = `${String(d).padStart(2, '0')}-${String(m).padStart(2, '0')}-${String(y).padStart(4, '0')}`
      return { ymd, dmy }
    }
  }

  const dmy = txt.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})$/)
  if (dmy) {
    const d = Number(dmy[1]); const m = Number(dmy[2]); let y = Number(dmy[3])
    if (y < 100) y += 2000
    if (y > 1900 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      const ymd = `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const dmyFmt = `${String(d).padStart(2, '0')}-${String(m).padStart(2, '0')}-${String(y).padStart(4, '0')}`
      return { ymd, dmy: dmyFmt }
    }
  }

  return null
}

function matchSearchByFechaTabla(item, parsedDate) {
  const fechaTablaRaw = String(item?.fecha_tabla ?? '')
  const tokens = [
    normalizeSearchText(fechaTablaRaw),
    normalizeSearchText(formatDateDisplay(fechaTablaRaw)),
    normalizeSearchText(toYYYYMMDDLocal(fechaTablaRaw))
  ]
  return tokens.includes(normalizeSearchText(parsedDate?.ymd)) || tokens.includes(normalizeSearchText(parsedDate?.dmy))
}

const tablaPadresFiltrada = computed(() => {
  const baseEstado = (tablaPadres.value || []).filter(matchEstadoFiltros)
  const q = normalizeSearchText(searchAsignaciones.value)
  if (!q) return baseEstado
  const parsedDate = parseSearchDateQuery(searchAsignaciones.value)
  if (parsedDate) return baseEstado.filter(item => matchSearchByFechaTabla(item, parsedDate))
  return baseEstado.filter(item => rowToSearchBlob(item).includes(q))
})

function getRowsForExport() {
  const isSysdateLikeExportToken = (value) => {
    const s = String(value ?? '').trim()
    if (!s) return false
    return isSysdateToken(s) || /sys\s*[_-]*\s*date/i.test(s)
  }

  const sanitizeExportValue = (value) => {
    const s = String(value ?? '').trim()
    if (!s) return ''
    return isSysdateLikeExportToken(s) ? '' : s
  }

  const formatDateForExport = (value) => {
    const raw = sanitizeExportValue(value)
    if (!raw) return ''
    const formatted = String(formatDateDisplay(raw) || '').trim()
    if (!formatted || isSysdateLikeExportToken(formatted)) return ''
    return formatted === '-' ? '' : formatted
  }

  const formatGenericForExport = (value) => {
    const raw = sanitizeExportValue(value)
    if (!raw) return ''
    const formatted = String(formatGenericDisplay(raw) || '').trim()
    if (!formatted || isSysdateLikeExportToken(formatted)) return ''
    return formatted === '-' ? '' : formatted
  }

  const normalizeExportFieldName = (label = '') => {
    return String(label || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Za-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .toUpperCase()
  }

  const isMediaAttribute = (attr = {}) => {
    const type = normalizeTextLocal(attr?.type)
    if (['FILEUPLOAD', 'PHOTOCAPTURE', 'SIGNATURE', 'SIGNATUREPAD', 'FIRMA'].includes(type)) return true
    if (Array.isArray(attr?.archivos) && attr.archivos.length) return true
    if (Array.isArray(attr?.galeria) && attr.galeria.length) return true
    return false
  }

  const resolveAttrExportValue = (attr = {}) => {
    const scalarCandidates = [
      attr?.value,
      attr?.default,
      attr?.answer,
      attr?.respuesta,
      attr?.values?.selected
    ]
    for (const candidate of scalarCandidates) {
      if (candidate !== undefined && candidate !== null && String(candidate).trim() !== '') {
        const sanitized = sanitizeExportValue(candidate)
        if (!sanitized) continue
        return sanitized
      }
    }

    if (Array.isArray(attr?.checkBoby) && attr.checkBoby.length) {
      const selected = attr.checkBoby
        .map(it => {
          const val = String(it?.default ?? it?.value ?? '').trim()
          if (!val || isSysdateLikeExportToken(val)) return ''
          const lbl = String(it?.label || '').trim()
          return lbl ? `${lbl}: ${val}` : val
        })
        .filter(Boolean)
      if (selected.length) return selected.join(' | ')
    }

    return ''
  }

  const formatArtefactosCheckGroupForExport = (group = {}) => {
    const items = Array.isArray(group?.items) ? group.items : []
    return items
      .map(item => {
        const label = String(item?.label || '').trim()
        if (!label) return ''
        const respuesta = normalizeSupervisorArtefactoRespuesta(item?.respuesta)
        const cantidad = normalizeSupervisorArtefactoCantidad(item?.cantidad)
        return respuesta === 'SI' && cantidad
          ? `${label}: ${respuesta} (${cantidad})`
          : `${label}: ${respuesta}`
      })
      .filter(Boolean)
      .join(' | ')
  }

  const assignArtefactosGroupExportFields = (out, prefix, group = {}) => {
    const groupLabel = String(group?.label || '').trim()
    const normalizedGroup = normalizeExportFieldName(groupLabel)
    if (!normalizedGroup) return ''

    out[`${prefix}_${normalizedGroup}`] = formatArtefactosCheckGroupForExport(group)

    return normalizeBodyValueKey(groupLabel)
  }

  const getArtefactosGroupFromValores = (valores = {}, key) => {
    const k = String(key || '').trim().toUpperCase()
    const label = SUPERVISOR_ARTEFACTOS_LABELS[k] || k
    const candidates = [
      valores?.[k],
      valores?.[normalizeBodyValueKey(k)],
      valores?.[label],
      valores?.[normalizeBodyValueKey(label)]
    ].filter(value => value !== undefined && value !== null && String(value).trim() !== '')

    for (const raw of candidates) {
      let parsed = raw
      if (typeof raw === 'string') {
        try {
          parsed = JSON.parse(raw)
        } catch {
          continue
        }
      }

      if (parsed && typeof parsed === 'object') {
        return buildSupervisorArtefactosGroup(k, parseSupervisorArtefactosValue(parsed))
      }
    }

    return null
  }

  const buildSurveyExportFields = (rawBody, prefix = 'SUP', valores = {}) => {
    const out = {}
    const artefactosGroupsExported = new Set()
    const obj = parseBodyExecLocal(rawBody)
    const segmentos = Array.isArray(obj?.segmentos) ? obj.segmentos : []
    for (const seg of segmentos) {
      const attrs = Array.isArray(seg?.attributes) ? seg.attributes : []
      for (const attr of attrs) {
        if (isArtefactosCheckAttr(attr)) {
          const groups = Array.isArray(attr?.groups) ? attr.groups : []
          for (const group of groups) {
            const exportedKey = assignArtefactosGroupExportFields(out, prefix, group)
            if (exportedKey) artefactosGroupsExported.add(exportedKey)
          }
          continue
        }

        const label = String(attr?.label || '').trim()
        if (!label) continue
        if (isMediaAttribute(attr)) continue
        const normalized = normalizeExportFieldName(label)
        if (!normalized) continue
        const key = `${prefix}_${normalized}`
        const value = resolveAttrExportValue(attr)
        out[key] = value
      }
    }

    for (const artefactosKey of ['CONVERS ARTEFAC', 'ARTEFAC']) {
      const expectedGroupLabel = SUPERVISOR_ARTEFACTOS_LABELS[artefactosKey]
      const expectedNorm = normalizeBodyValueKey(expectedGroupLabel)
      if (artefactosGroupsExported.has(expectedNorm)) continue

      const group = getArtefactosGroupFromValores(valores, artefactosKey)
      if (!group) continue

      const exportedKey = assignArtefactosGroupExportFields(out, prefix, group)
      if (exportedKey) artefactosGroupsExported.add(exportedKey)
    }

    return out
  }

  const getEstadoDesdeBodyExec = (item) => {
    const desdeMapeo = String(item?.estado_conexion || '').trim()
    if (desdeMapeo) return desdeMapeo
    const desdeValores = String(item?.valores?.ESTADO || item?.valores?.['ESTADO CONEXION'] || '').trim()
    return desdeValores
  }

  return (tablaPadresFiltrada.value ?? []).map(item => {
    const hijos = hijosByPadre.value.get(Number(item?.id_survey || 0)) || []
    const hijoPreferido = hijos.find(h => Number(h?.id_user_tecnico || 0) > 0) || hijos[0] || null
    const supSurvey = buildSurveyExportFields(item?.body_exec || item?.json_exec, 'SUP', item?.valores || {})
    const tecSurvey = buildSurveyExportFields(hijoPreferido?.body_exec || hijoPreferido?.json_exec, 'TEC', hijoPreferido?.valores || {})

    return {
      id_survey: item.id_survey ?? '',
      certificadora: item.certificadora ?? '',
      proyecto: item.proyecto ?? '',
      ic_sap_mg: item.ic_sap_mg ?? '',
      orden: item.orden || item.id_survey || '',
      gio: item.gio ?? '',
      supervisor_terracon: item.nombre_supervisor ?? '',
      tecnico: getNombreTecnicoAsignado(item) ?? '',
      fecha: formatDateForExport(item.fecha_tabla),
      direccion_comuna: item.direccion_comuna ?? '',
      hora_llegada_tecnico: formatGenericForExport(item.hora_llegada_tecnico),
      estado: getEstadoUiLabel(getEstadoInternoConexion(item)),
      estado_detalle: getEstadoDesdeBodyExec(item),
      cliente: item.cliente ?? '',
      fonos: item.fonos ?? '',
      charla: item.charla ?? '',
      ats: item.ats ?? '',
      t_altura: item.t_altura ?? '',
      observacion: item.observacion ?? '',
      pdf: getPdfUrl(item) || '',
      informe: item.url_doc_registro || '',
      SUP_ID_SURVEY: item.id_survey ?? '',
      TEC_ID_SURVEY: hijoPreferido?.id_survey ?? '',
      ...supSurvey,
      ...tecSurvey
    }
  })
}

function resolveRealtimeSurveyId(change = {}) {
  const candidates = [
    change?.id_survey,
    change?.idSurvey,
    change?.survey_id,
    change?.surveyId,
    change?.sid,
    change?.patch?.id_survey,
    change?.patch?.idSurvey,
    change?.patch?.survey_id,
    change?.patch?.surveyId,
    change?.payload?.id_survey,
    change?.payload?.idSurvey,
    change?.payload?.survey_id,
    change?.payload?.surveyId
  ]
  for (const c of candidates) {
    const id = Number(c || 0)
    if (id > 0) return id
  }
  return 0
}

function normalizeRealtimeEventName(change = {}) {
  return String(
    change?.eventName ||
    change?.event_name ||
    change?.event ||
    change?.type ||
    ''
  ).toLowerCase()
}

function applyRealtimeChange(change = {}) {
  const sid = resolveRealtimeSurveyId(change)
  if (!sid) return false

  const exists = (tablaFull.value || []).some((row) => Number(row?.id_survey || 0) === sid)
  if (!exists) return false

  const eventName = normalizeRealtimeEventName(change)
  const patchIn = change?.patch && typeof change.patch === 'object' ? change.patch : {}
  const patch = {}

  if (typeof patchIn.estado_srv === 'string' && patchIn.estado_srv.trim()) {
    const estado = patchIn.estado_srv.trim()
    patch.estado_srv = estado
  }

  if (patchIn.asignaciones && typeof patchIn.asignaciones === 'object') {
    patch.asignaciones = { ...patchIn.asignaciones }
  }

  const horaPatchDirecta = String(
    patchIn?.hora_llegada_tecnico ||
    patchIn?.hora_llegada_t ||
    patchIn?.hora_llegada ||
    ''
  ).trim()
  const horaPatchBody = extractHoraLlegadaFromBody(patchIn?.body_exec || patchIn?.json_exec)
  const horaPatch = !isInvalidHoraValue(horaPatchDirecta)
    ? horaPatchDirecta
    : (!isInvalidHoraValue(horaPatchBody) ? horaPatchBody : '')
  if (!isInvalidHoraValue(horaPatch)) {
    patch.hora_llegada_tecnico = horaPatch
  }

  const evidenciaPatchDirecta = buildEvidenciaResumenPatchDesdeBody(patchIn?.body_exec || patchIn?.json_exec)
  Object.assign(patch, evidenciaPatchDirecta)

  const detallePadreId = Number(detallePadre.value?.id_survey || 0)
  const detalleHijoIds = new Set((detalleHijos.value || []).map((h) => Number(h?.id_survey || 0)))
  const afectaDetalleAbierto = dialogDetalle.value && (sid === detallePadreId || detalleHijoIds.has(sid))

  // Si viene un update de ejecución desde otro cliente (ej: PWA), refrescamos solo el detalle abierto.
  // No recarga la tabla completa.
  const esUpdateEjecucion =
    eventName.includes('survey.updated') ||
    eventName.includes('fechaejecfin') ||
    eventName.startsWith('pwa.survey.')

  if (afectaDetalleAbierto && esUpdateEjecucion) {
    void refrescarRegistroTrasGuardado(sid, { forceReloadTable: false })
  }

  if (!horaPatch && !Object.keys(evidenciaPatchDirecta).length && esUpdateEjecucion) {
    void refreshHoraLlegadaDesdeDetalleEnCaliente(sid)
  }

  if (!Object.keys(patch).length) {
    return afectaDetalleAbierto && esUpdateEjecucion
  }

  actualizarFilaTablaLocal(sid, patch)
  const rowUpdated = (tablaFull.value || []).find(r => Number(r?.id_survey || 0) === sid)
  const idPadre = Number(rowUpdated?.id_survey_padre || 0)
  if (idPadre && patch.hora_llegada_tecnico) {
    syncHoraLlegadaPadreDesdeHijos(idPadre)
  }
  if (idPadre && (patch.charla || patch.ats || patch.t_altura)) {
    syncEvidenciaPadreDesdeHijos(idPadre)
  }
  return true
}

defineExpose({ getSurveys, filtrarPorCarga, getRowsForExport, applyRealtimeChange })

watch(
  tablaPadres,
  (padres) => {
    const ids = new Set((padres ?? []).map(x => Number(x.id_survey)))
    expanded.value = new Set([...expanded.value].filter(id => ids.has(id)))
  },
  { immediate: true }
)

watch([tablaPadres, () => props.registroInformes], async () => {
  await nextTick()
  recalcScrollWidth()
})

function onScroll(source) {
  if (isSyncing) return
  isSyncing = true

  const top = topScrollRef.value
  const mid = middleScrollEl.value
  const bot = bottomScrollRef.value

  const left =
    source === 'top' ? top?.scrollLeft || 0
      : source === 'bottom' ? bot?.scrollLeft || 0
        : mid?.scrollLeft || 0

  if (top) top.scrollLeft = left
  if (mid) mid.scrollLeft = left
  if (bot) bot.scrollLeft = left

  requestAnimationFrame(() => { isSyncing = false })
}

function onMiddleScroll() {
  onScroll('middle')
}

function recalcScrollWidth() {
  const mid = middleScrollEl.value
  if (!mid) {
    scrollContentWidth.value = '0px'
    return
  }
  const width = Math.max(mid.scrollWidth || 0, mid.clientWidth || 0)
  scrollContentWidth.value = `${width}px`
}

function initTableScrollSync() {
  if (middleScrollEl.value) return
  middleScrollEl.value = tableRef.value?.$el?.querySelector('.v-table__wrapper') || null
  if (!middleScrollEl.value) return
  middleScrollEl.value.addEventListener('scroll', onMiddleScroll, { passive: true })
}


// =====================
// Detalles Modal (Padre/Hijo)
// =====================
const dialogDetalle = ref(false)
const detallePadre = ref(null)
const detalleHijos = ref([])
const downloadingFotosZip = ref(false)

function getEstadoCanonicoAsignacion(item) {
  return getEstadoInternoConexion(item)
}

async function abrirModalDetalle(item) {
  const estadoPadreCanonico = getEstadoCanonicoAsignacion(item)
  let padreBase = {
    ...item,
    estado_srv: estadoPadreCanonico,
    estado_conexion: estadoPadreCanonico,
    estado_conexion_detalle: estadoPadreCanonico,
    cliente: item?.cliente ?? '',
    fonos: item?.fonos ?? '',
    valor_servicio: getValorServicioText(item),
    tipoEmpalmeGasificar: getTipoEmpalmeGasificarText(item)
  }

  try {
      const detailPadre = await getSurveyDetailLocal(item?.id_survey)
      if (detailPadre) {
        const valsPadre = getBodyValues(detailPadre?.body_exec || detailPadre?.json_exec)
        const estadoPadreBody = getFirstBodyValue(valsPadre, ['ESTADO CONEXION', 'ESTADO CONEXIÓN', 'ESTADO'])
        const estadoPadreInterno = !isInvalidEstadoValue(estadoPadreBody)
          ? estadoPadreBody
          : (!isInvalidEstadoValue(detailPadre?.estado_srv) ? detailPadre.estado_srv : estadoPadreCanonico)
        const asigPadre = extraerAsignacionesDeDetail({ surveyDetail: [detailPadre] })
      const idSupPadre = Number(
        item?.id_user_supervisor ||
        detailPadre?.id_user_supervisor ||
        asigPadre?.supervisor ||
        detailPadre?.id_user ||
        0
      ) || null

      padreBase = {
        ...padreBase,
        ...detailPadre,
        estado_srv: estadoPadreInterno,
        estado_conexion: estadoPadreInterno,
        estado_conexion_detalle: estadoPadreInterno,
        orden: getFirstBodyValue(valsPadre, ['NMRO ORDEN MG', 'NRO ORDEN MG', 'ORDEN']) || padreBase.orden || detailPadre?.orden || '',
        proyecto: getSupervisorProyectoFromVals(valsPadre, padreBase),
        nombre_proyecto: getSupervisorProyectoFromVals(valsPadre, padreBase),
        ic_sap_mg: getFirstBodyValue(valsPadre, ['IC-SAP', 'IC SAP', 'IC SAP MG', 'IC_SAP MG']) || padreBase.ic_sap_mg || detailPadre?.ic_sap_mg || '',
        gio: getFirstBodyValue(valsPadre, ['GIO']) || padreBase.gio || detailPadre?.gio || '',
        cliente: getSupervisorClienteFromVals(valsPadre, padreBase),
        fonos: getFirstBodyValue(valsPadre, ['TELEFONO CLIENTE', 'FONOS', 'FONO', 'TELEFONO']) || padreBase.fonos || detailPadre?.fonos || '',
        direccion_comuna: getSupervisorDireccionComunaFromVals(valsPadre, padreBase),
        valores: valsPadre,
        id_user_supervisor: idSupPadre,
        nombre_supervisor: String(
          item?.nombre_supervisor ||
          detailPadre?.nombre_supervisor_asignado ||
          getUserNameById(idSupPadre) ||
          ''
        ).trim()
      }
    }
  } catch (e) {
    console.error('Error fetching detail padre:', item?.id_survey, e)
  }

  detallePadre.value = padreBase

  // Obtener la lista base de hijos
  const listaBase = hijosByPadre.value.get(Number(item.id_survey)) || []

  // Re-obtener detalle fresco para cada hijo para asegurar datos completos
  const hijosFull = await Promise.all(listaBase.map(async (h) => {
    const estadoHijoCanonico = getEstadoCanonicoAsignacion(h)
    try {
      const detail = await getSurveyDetailLocal(h.id_survey)
      if (detail) {
        // Recalcular valores extras si es necesario
        const raw = detail.body_exec || detail.json_exec
        const vals = getBodyValues(raw)
        const estadoHijoBody = getFirstBodyValue(vals, ['ESTADO CONEXION', 'ESTADO CONEXIÓN', 'ESTADO'])
        const estadoHijoInterno = !isInvalidEstadoValue(estadoHijoBody)
          ? estadoHijoBody
          : (!isInvalidEstadoValue(detail?.estado_srv) ? detail.estado_srv : estadoHijoCanonico)
        const asigHijo = extraerAsignacionesDeDetail({ surveyDetail: [detail] })
        const idTecHijo = Number(
          h?.id_user_tecnico ||
          detail?.id_user_tecnico ||
          asigHijo?.tecnico ||
          detail?.id_user ||
          0
        ) || null

        // Fusionar data existente con el detalle fresco
        return {
          ...h,
          ...detail, // sobreescribe campos simples
          estado_srv: estadoHijoInterno,
          estado_conexion: estadoHijoInterno,
          estado_conexion_detalle: estadoHijoInterno,
          valores: vals, // asegura valores parseados
          id_user_tecnico: idTecHijo,
          nombre_tecnico: String(
            h?.nombre_tecnico ||
            detail?.nombre_tecnico_asignado ||
            getUserNameById(idTecHijo) ||
            ''
          ).trim(),
          // Asegurar campos calculados si el detalle trajo info nueva que getSurveys no tenía
          body_exec: detail.body_exec,
          json_exec: detail.json_exec
        }
      }
      return h
    } catch (e) {
      console.error('Error fetching detail hijo:', h.id_survey, e)
      return h
    }
  }))

  console.log("=== DATOS HIJOS (JSON STRINGIFY) ===")
  console.log(JSON.stringify(hijosFull, null, 2))

  // Reflejar en la columna "Asignación Supervisor" el estado/evidencia de Charla, ATS y T. Altura tomados del/los hijo(s).
  // Así, al abrir "ojo", no queda '-' en esos campos cuando el técnico ya cargó evidencia.
  const valoresPadre = { ...(detallePadre.value?.valores || {}) }
  const resumenCharla = buildResumenEvidenciaDesdeHijos(hijosFull, 'CHARLA')
  const resumenAts = buildResumenEvidenciaDesdeHijos(hijosFull, 'ATS')
  const resumenTAltura = buildResumenEvidenciaDesdeHijos(hijosFull, 'T. ALTURA')
  const fotosCharla = collectFotosEvidenciaDesdeHijos(hijosFull, 'CHARLA')
  const fotosAts = collectFotosEvidenciaDesdeHijos(hijosFull, 'ATS')
  const fotosTAltura = collectFotosEvidenciaDesdeHijos(hijosFull, 'T. ALTURA')
  if (resumenCharla) valoresPadre['CHARLA'] = resumenCharla
  if (resumenAts) valoresPadre['ATS'] = resumenAts
  if (resumenTAltura) valoresPadre['T. ALTURA'] = resumenTAltura
  detallePadre.value = {
    ...detallePadre.value,
    valores: valoresPadre,
    evidenciaHijo: {
      CHARLA: fotosCharla,
      ATS: fotosAts,
      'T. ALTURA': fotosTAltura
    }
  }

  detalleHijos.value = hijosFull
  dialogDetalle.value = true
}

async function refrescarRegistroTrasGuardado(idSurveyModificado, options = {}) {
  const forceReloadTable = options?.forceReloadTable !== false
  if (forceReloadTable) {
    await getSurveys()
  }
  if (!dialogDetalle.value) return

  let idPadre = Number(detallePadre.value?.id_survey || 0)
  const idMod = Number(idSurveyModificado || 0)

  if (idMod) {
    const rowMod = (tablaFull.value || []).find(r => Number(r?.id_survey) === idMod)
    if (rowMod) {
      const padreMod = Number(rowMod?.id_survey_padre || 0)
      idPadre = padreMod || Number(rowMod?.id_survey || idPadre)
    }
  }

  if (!idPadre) return

  const padreActualizado = (tablaFull.value || []).find(
    r => Number(r?.id_survey) === idPadre && !Number(r?.id_survey_padre || 0)
  )
  if (padreActualizado) {
    await abrirModalDetalle(padreActualizado)
  }
}

function parseBodyExecLocal(raw) {
  if (!raw) return null
  if (typeof raw === 'object') return raw
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch { return null }
  }
  return null
}

const HORA_LLEGADA_KEYS = [
  'HORA DE LLEGADA TECNICO',
  'HORA DE LLEGADA TÉCNICO',
  'HORA LLEGADA TECNICO',
  'HORA LLEGADA T',
  'HORA LLEGADA T.',
  'HORA_LLEGADA',
  'LLEGADA TECNICO',
  'LLEGADA TÉCNICO',
  'HORA DE LLEGADA',
  'HORA LLEGADA',
  'LLEGADA AL DOMICILIO',
  'HORA LLEGADA DOMICILIO'
]

const HORA_LLEGADA_LABEL_ALIASES = [
  'HORA DE LLEGADA TECNICO',
  'HORA DE LLEGADA TÉCNICO',
  'HORA LLEGADA T',
  'HORA LLEGADA T.',
  'LLEGADA TECNICO',
  'LLEGADA TÉCNICO',
  'LLEGADA AL DOMICILIO',
  'REGISTRO FOTOGRAFICO LLEGADA AL DOMICILIO',
  'REGISTRO FOTOGRÁFICO LLEGADA AL DOMICILIO',
  'REGISTRO LLEGADA AL DOMICILIO'
]

function extractDateTimeFromText(value) {
  const s = String(value || '').trim()
  if (!s) return ''

  const iso = s.match(/\b\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}(?::\d{2})?\b/)
  if (iso) return iso[0]

  const dmy = s.match(/\b\d{2}[/-]\d{2}[/-]\d{4}[T\s]\d{2}:\d{2}(?::\d{2})?\b/)
  if (dmy) return dmy[0]

  return ''
}

function extractDateTimeCandidatesFromText(value) {
  const s = String(value || '').trim()
  if (!s) return []
  const out = []

  const iso = [...s.matchAll(/\b\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}(?::\d{2})?\b/g)].map(m => m[0])
  const dmy = [...s.matchAll(/\b\d{2}[/-]\d{2}[/-]\d{4}[T\s]\d{2}:\d{2}(?::\d{2})?\b/g)].map(m => m[0])

  out.push(...iso, ...dmy)
  return out
}

function parseDateTimeFlexible(value) {
  const s = String(value || '').trim()
  if (!s) return null

  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2}))?$/)
  if (iso) {
    const d = new Date(
      Number(iso[1]),
      Number(iso[2]) - 1,
      Number(iso[3]),
      Number(iso[4]),
      Number(iso[5]),
      Number(iso[6] || 0)
    )
    return Number.isNaN(d.getTime()) ? null : d
  }

  const dmy = s.match(/^(\d{2})[/-](\d{2})[/-](\d{4})[T\s](\d{2}):(\d{2})(?::(\d{2}))?$/)
  if (dmy) {
    const d = new Date(
      Number(dmy[3]),
      Number(dmy[2]) - 1,
      Number(dmy[1]),
      Number(dmy[4]),
      Number(dmy[5]),
      Number(dmy[6] || 0)
    )
    return Number.isNaN(d.getTime()) ? null : d
  }

  const fallback = new Date(s)
  return Number.isNaN(fallback.getTime()) ? null : fallback
}

function pickLatestDateTimeCandidate(candidates = []) {
  let bestRaw = ''
  let bestTs = -1

  for (const c of candidates) {
    const raw = String(c || '').trim()
    if (isInvalidHoraValue(raw)) continue
    const dt = parseDateTimeFlexible(raw)
    if (!dt) continue
    const ts = dt.getTime()
    if (ts > bestTs) {
      bestTs = ts
      bestRaw = raw
    }
  }

  return bestRaw
}

function isInvalidHoraValue(value) {
  const s = String(value ?? '').trim().toLowerCase()
  if (!s) return true
  return s === '-' || s === '—' || s === 'null' || s === 'undefined' || /sysdatehhmm|sysdate/.test(s)
}

function extractHoraLlegadaFromBody(rawBody) {
  const obj = parseBodyExecLocal(rawBody)
  if (!obj) return ''

  const vals = getBodyValues(obj)
  const direct = getFirstBodyValue(vals, HORA_LLEGADA_KEYS)
  if (!isInvalidHoraValue(direct)) return String(direct).trim()

  const targetLabels = new Set(HORA_LLEGADA_LABEL_ALIASES.map(normalizeTextLocal))
  const segmentos = Array.isArray(obj?.segmentos) ? obj.segmentos : []
  const candidates = []
  const shortHourCandidates = []

  for (const seg of segmentos) {
    const attrs = Array.isArray(seg?.attributes) ? seg.attributes : []
    for (const attr of attrs) {
      const labelNorm = normalizeTextLocal(attr?.label)
      if (!targetLabels.has(labelNorm)) continue

      const fields = [
        attr?.hora_llegada,
        attr?.default,
        attr?.value,
        attr?.answer,
        attr?.respuesta
      ]
      for (const c of fields) {
        const list = extractDateTimeCandidatesFromText(c)
        if (list.length) candidates.push(...list)
        const hhmm = String(c || '').trim()
        if (/^\d{2}:\d{2}$/.test(hhmm)) shortHourCandidates.push(hhmm)
      }

      const galeria = Array.isArray(attr?.galeria) ? attr.galeria : []
      for (const foto of galeria) {
        const fotoCandidates = [
          foto?.fecha_hora,
          foto?.fecha,
          foto?.created_at,
          foto?.createdAt,
          foto?.fecha_upload,
          foto?.timestamp,
          foto?.ts,
          foto?.hora
        ]
        for (const fc of fotoCandidates) {
          const list = extractDateTimeCandidatesFromText(fc)
          if (list.length) candidates.push(...list)
          const hhmm = String(fc || '').trim()
          if (/^\d{2}:\d{2}$/.test(hhmm)) shortHourCandidates.push(hhmm)
        }
      }
    }
  }

  const latest = pickLatestDateTimeCandidate(candidates)
  if (latest) return latest
  return shortHourCandidates.length ? shortHourCandidates[shortHourCandidates.length - 1] : ''
}

function normalizeSegmentLabel(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase()
}

function isDatosCargaSegment(seg) {
  const label = normalizeSegmentLabel(seg?.label)
  return label === 'DATOS CARGA'
}

function getVisibleExecutionSegments(hijo) {
  const segmentos = Array.isArray(hijo?.body_exec?.segmentos) ? hijo.body_exec.segmentos : []
  return segmentos.filter(seg => !isDatosCargaSegment(seg))
}

function hasVisibleExecutionSegments(hijo) {
  return getVisibleExecutionSegments(hijo).length > 0
}

function normalizeTextLocal(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase()
}

function getEvidenciaLabelAliases(labelBase) {
  const key = normalizeTextLocal(labelBase)
  if (key === 'ATS') {
    return [
      'ATS',
      'ANALISIS DE TRABAJO SEGURO',
      'ANALISIS SEGURO DE TRABAJO',
      'REGISTRO FOTOGRAFICO ATS',
      'REGISTRO FOTOGRAFICO DEL ATS',
      'REGISTRO FOTOGRAFICO DE ATS',
      'FOTO ATS',
      'FOTO DEL TECNICO EN EL ATS',
      'FOTO DEL TECNICO EN ATS'
    ]
  }
  if (key === 'CHARLA') {
    return [
      'CHARLA',
      'CHARLA DE SEGURIDAD',
      'CHARLA 5 MINUTOS',
      'CHARLA DE 5 MINUTOS',
      'REGISTRO FOTOGRAFICO CHARLA',
      'REGISTRO FOTOGRAFICO DE CHARLA',
      'REGISTRO FOTOGRAFICO CHARLA 5 MINUTOS',
      'FOTO CHARLA',
      'FOTO DE CHARLA'
    ]
  }
  if (key === 'T. ALTURA') {
    return [
      'T. ALTURA',
      'T ALTURA',
      'TRABAJO EN ALTURA',
      'CHECK TRABAJO EN ALTURA',
      'CHECK LIST TRABAJO EN ALTURA',
      'CHECK LIST TRABAJOS EN ALTURA',
      'REGISTRO FOTOGRAFICO T. ALTURA',
      'REGISTRO FOTOGRAFICO T ALTURA',
      'REGISTRO FOTOGRAFICO TRABAJO EN ALTURA',
      'REGISTRO FOTOGRAFICO TRABAJOS EN ALTURA',
      'REGISTRO FOTOGRAFICO CHECK LIST TRABAJO EN ALTURA',
      'REGISTRO FOTOGRAFICO CHECK LIST TRABAJOS EN ALTURA',
      'REGISTRO FOTOGRÁFICO CHECK LIST TRABAJO EN ALTURA',
      'REGISTRO FOTOGRÁFICO CHECK LIST TRABAJOS EN ALTURA',
      'FOTO TRABAJO EN ALTURA',
      'FOTO TRABAJOS EN ALTURA',
      'FOTO DEL TECNICO EN T. ALTURA',
      'FOTO DEL TECNICO EN T ALTURA',
      'FOTO DEL TECNICO EN TRABAJO EN ALTURA',
      'FOTO DEL TECNICO EN TRABAJOS EN ALTURA'
    ]
  }
  return [key]
}

function evidenciaLabelMatches(label, labelBase) {
  const key = normalizeTextLocal(labelBase)
  const labelNorm = normalizeTextLocal(label)
  if (!labelNorm) return false

  const aliases = getEvidenciaLabelAliases(key).map(normalizeTextLocal)
  if (aliases.includes(labelNorm)) return true

  const compact = labelNorm.replace(/[^A-Z0-9]/g, '')
  if (key === 'CHARLA') return compact.includes('CHARLA')
  if (key === 'ATS') {
    return /\bATS\b/.test(labelNorm) ||
      compact.includes('ANALISISDETRABAJOSEGURO') ||
      compact.includes('ANALISISSEGURODETRABAJO')
  }
  if (key === 'T. ALTURA') {
    return compact.includes('TALTURA') ||
      compact.includes('TRABAJOENALTURA') ||
      compact.includes('TRABAJOSENALTURA') ||
      compact.includes('TRABAJOALTURA')
  }
  return aliases.some((target) => labelNorm.includes(target) || target.includes(labelNorm))
}

function extractChecklistEstado(attr) {
  const items = Array.isArray(attr?.checkBoby) ? attr.checkBoby : []
  const seleccionados = []
  for (const it of items) {
    const value = String(it?.default ?? it?.value ?? '').trim()
    if (!value) continue
    const label = String(it?.label || '').trim()
    if (label) {
      seleccionados.push(`${label}: ${value}`)
    } else {
      seleccionados.push(value)
    }
  }
  return seleccionados.join(' | ')
}

function extractAttrEvidenciaByLabel(rawBody, labelBase) {
  const obj = parseBodyExecLocal(rawBody)
  const segmentos = Array.isArray(obj?.segmentos) ? obj.segmentos : []
  const fotos = []
  let obs = ''
  let estado = ''

  for (const seg of segmentos) {
    const attrs = Array.isArray(seg?.attributes) ? seg.attributes : []
    for (const attr of attrs) {
      if (!evidenciaLabelMatches(attr?.label, labelBase)) continue

      const fotosAttr = Array.isArray(attr?.galeria) ? attr.galeria : []
      if (fotosAttr.length) fotos.push(...fotosAttr)

      if (!obs) {
        const obsAttr = String(attr?.obs ?? attr?.observacion ?? '').trim()
        if (obsAttr) obs = obsAttr
      }

      if (!estado) {
        const estadoAttr = String(attr?.default ?? attr?.value ?? attr?.respuesta ?? '').trim()
        if (estadoAttr) estado = estadoAttr
      }

      if (!estado) {
        const estadoChecklist = extractChecklistEstado(attr)
        if (estadoChecklist) estado = estadoChecklist
      }
    }
  }

  if (!fotos.length && !obs && !estado) return null
  return { fotos, fotosCount: fotos.length, obs, estado }
}

function collectFotosEvidenciaDesdeHijos(hijos = [], labelBase = '') {
  const fotos = []
  for (const h of (hijos || [])) {
    const raw = h?.body_exec || h?.json_exec
    const ev = extractAttrEvidenciaByLabel(raw, labelBase)
    if (!ev || !Array.isArray(ev.fotos) || !ev.fotos.length) continue
    fotos.push(...ev.fotos)
  }
  return fotos
}

function buildResumenEvidenciaDesdeHijos(hijos = [], labelBase = '') {
  for (const h of (hijos || [])) {
    const raw = h?.body_exec || h?.json_exec
    const ev = extractAttrEvidenciaByLabel(raw, labelBase)
    if (!ev) continue

    const parts = []
    if (ev.estado) parts.push(ev.estado.toUpperCase())
    if (ev.fotosCount > 0) parts.push(`${ev.fotosCount} foto(s)`)
    if (ev.obs) parts.push(`Obs: ${ev.obs}`)
    if (parts.length) return parts.join(' | ')
  }
  return ''
}

function sanitizeFilePart(input) {
  return String(input || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w.-]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function inferExtFromUrl(url = '') {
  const clean = String(url).split('?')[0].split('#')[0]
  const m = clean.match(/\.([a-zA-Z0-9]{2,6})$/)
  if (!m) return 'jpg'
  return String(m[1] || 'jpg').toLowerCase()
}

function toAbsolutePhotoUrl(url) {
  const u = String(url || '').trim()
  if (!u) return ''
  if (/^https?:\/\//i.test(u) || /^blob:/i.test(u) || /^data:/i.test(u)) return u
  if (u.startsWith('/')) return `${window.location.origin}${u}`
  return u
}

function collectFotosAsignacionTecnico() {
  const collected = []

  for (const hijo of (detalleHijos.value || [])) {
    const body = parseBodyExecLocal(hijo?.body_exec || hijo?.json_exec)
    const segmentos = Array.isArray(body?.segmentos) ? body.segmentos : []

    for (const seg of segmentos) {
      for (const attr of (seg?.attributes || [])) {
        if (attr?.type === 'photoCapture' && Array.isArray(attr?.galeria)) {
          for (const foto of attr.galeria) {
            const url = toAbsolutePhotoUrl(foto?.url || foto?.src || '')
            if (!url) continue
            collected.push({
              label: attr?.label || 'Foto',
              url
            })
          }
        }

        if (attr?.type === 'registroEventos' && Array.isArray(attr?.body)) {
          for (const ev of attr.body) {
            const galeria = Array.isArray(ev?.galeria) ? ev.galeria : []
            for (const foto of galeria) {
              const url = toAbsolutePhotoUrl(foto?.url || foto?.src || '')
              if (!url) continue
              collected.push({
                label: ev?.comentarioInicial || attr?.label || 'Evento',
                url
              })
            }
          }
        }
      }
    }
  }

  return collected
}

function nowStampForFile() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}${mm}${dd}_${hh}${mi}`
}

async function downloadPhotoBlob(url) {
  try {
    const res = await fetch(url, { credentials: 'include' })
    if (!res.ok) throw new Error(`No se pudo descargar foto (${res.status})`)
    return await res.blob()
  } catch {
    const resp = await apiAxios.get(url, { responseType: 'blob' })
    return resp?.data
  }
}

async function descargarFotosAsignacionTecnico() {
  try {
    const fotos = collectFotosAsignacionTecnico()
    if (!fotos.length) {
      snackbar.value = { open: true, text: 'No hay fotos para descargar en Asignación Técnico.', color: 'warning' }
      return
    }

    downloadingFotosZip.value = true
    const stamp = nowStampForFile()
    const baseName = `Fotos_${stamp}`
    const zip = new JSZip()
    const folder = zip.folder(baseName)
    const usedNames = new Map()

    for (const foto of fotos) {
      const blob = await downloadPhotoBlob(foto.url)
      const ext = inferExtFromUrl(foto.url)
      const label = sanitizeFilePart(foto.label) || 'Foto'
      const n = (usedNames.get(label) || 0) + 1
      usedNames.set(label, n)
      const fileName = `${label}_${String(n).padStart(2, '0')}.${ext}`
      folder.file(fileName, blob)
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' })
    saveAs(zipBlob, `${baseName}.zip`)
    snackbar.value = { open: true, text: `Se descargaron ${fotos.length} fotos.`, color: 'success' }
  } catch (e) {
    console.error('descargarFotosAsignacionTecnico error:', e)
    snackbar.value = { open: true, text: 'No se pudo generar el ZIP de fotos.', color: 'error' }
  } finally {
    downloadingFotosZip.value = false
  }
}

// =====================
// usuarios (sin filtros, todos)
// =====================
const usuarios = ref([])
const usuariosFlow = ref([])

const sortByText = (arr, selector) =>
  [...(arr ?? [])].sort((a, b) =>
    String(selector(a) ?? '').localeCompare(String(selector(b) ?? ''), 'es', { sensitivity: 'base', numeric: true })
  )

const usuariosOrdenados = computed(() =>
  sortByText(
    (usuarios.value ?? []).filter(u => (u.nombre_user ?? '').trim().length > 0),
    u => u.nombre_user
  )
)



// =====================
// Galería
// =====================
const dialogGaleria = ref(false)
const fotosGaleria = ref([])

function abrirGaleria(item) {
  fotosGaleria.value = item.fotos || []
  dialogGaleria.value = true
}

function abrirGaleriaFotos(fotos = []) {
  fotosGaleria.value = (fotos || [])
    .map((f) => ({
      ...f,
      url: f?.url || f?.base64 || f?.src || ''
    }))
    .filter((f) => String(f?.url || '').trim() !== '')
  dialogGaleria.value = true
}

// (usuariosExternosOrdenados eliminados para evitar duplicado)

// =====================
// MODAL EDICIÓN
// =====================
const dialogEditar = ref(false)
const guardandoEdicion = ref(false)
const editError = ref('')
const dialogEditarTecnicoEjecucion = ref(false)
const guardandoEdicionTecnica = ref(false)
const tecnicoEjecucionEditError = ref('')
const tecnicoEjecucionSurveyId = ref(null)
const tecnicoEjecucionBodyExec = ref(null)
const tecnicoEjecucionSegmentos = ref([])

// ✅ cache simple para no pedir 10 veces el detail si editas varias veces el mismo
const surveyDetailCache = ref(new Map()) // Map<number, any>

const editForm = ref({
  id_survey: null,
  id_user_contratista: null,
  id_user_supervisor: null,
  id_user_tecnico: null,
  direccion_comuna: '',
  fecha_plan_ini: '',
  fecha_plan_fin: ''
})

function asNum(v) {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : null
}

function pickFirst(obj, keys) {
  for (const k of keys) {
    const v = obj?.[k]
    const n = asNum(v)
    if (n) return n
  }
  return null
}

/**
 * ✅ Intenta extraer asignaciones desde distintos lugares del detail.
 * Ajusta aquí si tu backend usa llaves distintas.
 */
function extraerAsignacionesDeDetail(detail) {
  const row =
    (Array.isArray(detail) ? detail?.[0] : null) ||
    (detail?.surveyDetail?.[0] ?? null) ||
    null

  if (!row) return { contratista: null, supervisor: null, tecnico: null }

  const parseObj = (raw) => {
    if (!raw) return null
    if (typeof raw === 'object') return raw
    if (typeof raw === 'string') {
      try { return JSON.parse(raw) } catch { return null }
    }
    return null
  }
  const bodyObj = parseObj(row?.body_exec || row?.json_exec)
  const segAsignaciones = Array.isArray(bodyObj?.segmentos)
    ? bodyObj.segmentos.flatMap(seg => {
      const attrs = Array.isArray(seg?.attributes) ? seg.attributes : []
      return attrs
        .map(a => a?.asignaciones ?? null)
        .filter(Boolean)
    })
    : []

  // lugares típicos
  const a1 = row?.asignaciones ?? row?.asignacion ?? null
  const a2 = row?.header_exec?.asignaciones ?? row?.header_exec?.asignacion ?? null
  const a3 = row?.body_exec?.asignaciones ?? row?.body_exec?.asignacion ?? null
  const a4 = bodyObj?.asignaciones ?? bodyObj?.asignacion ?? null

  const rawPool = [a1, a2, a3, a4, ...segAsignaciones, row].filter(Boolean)
  const pool = rawPool.flatMap(src => (Array.isArray(src) ? src.filter(Boolean) : [src]))

  // claves posibles por rol
  const kContr = [
    'id_user_contratista', 'contratista', 'Contratista', 'id_contratista', 'id_user_contratista_asignado'
  ]
  const kSup = [
    'id_user_supervisor', 'supervisor', 'Supervisor', 'id_supervisor', 'id_user_supervisor_asignado'
  ]
  const kTec = [
    'id_user_tecnico', 'tecnico', 'Tecnico', 'Técnico', 'id_tecnico', 'id_user_tecnico_asignado'
  ]

  let contratista = null
  let supervisor = null
  let tecnico = null

  for (const src of pool) {
    contratista = contratista || pickFirst(src, kContr)
    supervisor = supervisor || pickFirst(src, kSup)
    tecnico = tecnico || pickFirst(src, kTec)
  }

  return { contratista, supervisor, tecnico }
}

async function getSurveyDetailCached(idSurvey) {
  const id = Number(idSurvey || 0)
  if (!id) return null

  if (surveyDetailCache.value.has(id)) {
    return surveyDetailCache.value.get(id)
  }

  const detail = await getSurvey(id)
  surveyDetailCache.value.set(id, detail)
  return detail
}

async function abrirModalEdicion(item) {
  editError.value = ''
  const id = Number(item?.id_survey || 0) || null
  if (!id) return
  const { idPadre, idHijo } = resolverPadreHijoDesdeSurveyEditado(id)

  // ✅ carga base (para que el modal abra rápido)
  editForm.value = {
    id_survey: id,
    id_user_contratista: null,
    id_user_supervisor: null,
    id_user_tecnico: null,
    direccion_comuna: item?.direccion_comuna ?? '',
    fecha_plan_ini: item?.fecha_plan_ini ?? '',
    fecha_plan_fin: item?.fecha_plan_fin ?? ''
  }

  dialogEditar.value = true

  try {
    const detail = await getSurvey(id)
    const row = Array.isArray(detail) ? detail?.[0] : detail?.surveyDetail?.[0]
    const [detailPadre, detailHijo] = await Promise.all([
      idPadre ? getSurveyDetailCached(idPadre) : Promise.resolve(null),
      idHijo ? getSurveyDetailCached(idHijo) : Promise.resolve(null)
    ])
    const asigPadre = extraerAsignacionesDeDetail(detailPadre)
    const asigHijo = extraerAsignacionesDeDetail(detailHijo)

    editForm.value = {
      ...editForm.value,
      id_user_contratista: Number(asigPadre?.contratista || asigHijo?.contratista || 0) || null,
      // Regla de negocio: Supervisor viene del survey padre
      id_user_supervisor: Number(asigPadre?.supervisor || 0) || null,
      // Regla de negocio: Tecnico viene del survey hijo
      id_user_tecnico: Number((isPlanCMode() ? (asigPadre?.tecnico || asigHijo?.tecnico || 0) : (asigHijo?.tecnico || 0)) || 0) || null,
      direccion_comuna: item?.direccion_comuna ?? editForm.value.direccion_comuna ?? '',

      // ✅ si quieres: usar las fechas del detail (por si cambian)
      fecha_plan_ini: row?.fecha_plan_ini ?? editForm.value.fecha_plan_ini,
      fecha_plan_fin: row?.fecha_plan_fin ?? editForm.value.fecha_plan_fin
    }
    normalizarAsignacionPorContratista()
  } catch (e) {
    console.error('❌ abrirModalEdicion detail', e)
    editError.value =
      e?.response?.data?.error ||
      e?.response?.data?.message ||
      e?.message ||
      'No se pudo cargar el detalle.'
  }
}

function abrirModalEditar(item) { abrirModalEdicion(item) }

function isSegmentTecnicoEditable(seg) {
  const label = normalizeSegmentLabel(seg?.label)
  if (!label) return false
  return (
    label.includes('DETALLE DE EJECUCION') ||
    label.includes('ANTECEDENTES COMPLEMENTARIOS') ||
    label.includes('REGISTRO OBLIGATORIO TECNICO')
  )
}

function getAttrType(attr) {
  return String(attr?.type || '').trim().toLowerCase()
}

function isPhotoTypeAttr(attr) {
  return getAttrType(attr) === 'photocapture'
}

function isComboTypeAttr(attr) {
  const t = getAttrType(attr)
  return t === 'combobox' || t === 'comboBox'.toLowerCase()
}

function isChecklistTypeAttr(attr) {
  return getAttrType(attr) === 'checklist'
}

function isRegistroEventosTypeAttr(attr) {
  return getAttrType(attr) === 'registroeventos'
}

function isTextAreaTypeAttr(attr) {
  return getAttrType(attr) === 'textarea'
}

function isDateTypeAttr(attr) {
  return getAttrType(attr) === 'datepicker'
}

function isNumberTypeAttr(attr) {
  const t = getAttrType(attr)
  return t === 'number' || t === 'decimal'
}

function isTimeTypeAttr(attr) {
  const t = getAttrType(attr)
  return t === 'time' || t === 'timepicker'
}

function isDateTimeTypeAttr(attr) {
  const t = getAttrType(attr)
  return t === 'datehourpicker' || t === 'datetime-local' || t === 'datetime'
}

function isEditableAttrTecnico(attr) {
  return !isPhotoTypeAttr(attr)
}

function getAttrCurrentValue(attr) {
  if (attr?.value !== undefined && attr?.value !== null) return attr.value
  if (attr?.answer !== undefined && attr?.answer !== null) return attr.answer
  if (attr?.respuesta !== undefined && attr?.respuesta !== null) return attr.respuesta
  if (attr?.default !== undefined && attr?.default !== null) return attr.default
  return ''
}

function getAttrEditorValue(attr) {
  const raw = getAttrCurrentValue(attr)
  if (raw === null || raw === undefined) return ''
  if (typeof raw === 'object') {
    try {
      return JSON.stringify(raw, null, 2)
    } catch {
      return String(raw)
    }
  }
  return String(raw)
}

function setAttrCurrentValue(attr, value) {
  let v = value ?? ''
  const prev = getAttrCurrentValue(attr)

  if (typeof prev === 'object' && prev !== null && typeof v === 'string') {
    try {
      v = JSON.parse(v)
    } catch {
      // Si no es JSON válido, se guarda como texto para no bloquear la edición.
    }
  }

  attr.default = v
  attr.value = v
  attr.answer = v
  attr.respuesta = v
}

function getComboItems(options = []) {
  return (options || []).map(opt => {
    if (opt && typeof opt === 'object') {
      return {
        label: String(opt.label ?? opt.name ?? opt.value ?? ''),
        value: opt.value ?? opt.id ?? opt.label ?? ''
      }
    }
    return { label: String(opt ?? ''), value: opt }
  })
}

function normalizePhotoItemForEdit(item) {
  const rawUrl = item?.url || item?.src || ''
  const absUrl = toAbsolutePhotoUrl(rawUrl)
  return {
    ...item,
    url: absUrl || rawUrl || '',
    base64: item?.base64 || '',
    src: item?.src || ''
  }
}

function prepareBodyExecForEdit(bodyExec) {
  if (!bodyExec || !Array.isArray(bodyExec.segmentos)) return
  for (const seg of bodyExec.segmentos) {
    if (!Array.isArray(seg?.attributes)) continue
    for (const attr of seg.attributes) {
      if (isPhotoTypeAttr(attr)) {
        if (!Array.isArray(attr.galeria)) attr.galeria = []
        attr.galeria = attr.galeria.map(normalizePhotoItemForEdit)
      }
      if (isComboTypeAttr(attr)) {
        if (!attr.values || typeof attr.values !== 'object') attr.values = {}
        if (!Array.isArray(attr.values.options)) attr.values.options = []
        if (attr.values.selected === undefined || attr.values.selected === null) {
          const first = attr.values.options?.[0]
          attr.values.selected = (first && typeof first === 'object') ? (first.value ?? first.id ?? '') : (first ?? '')
        }
      }
      if (isChecklistTypeAttr(attr) && !Array.isArray(attr.checkBoby)) {
        attr.checkBoby = []
      }
      if (isRegistroEventosTypeAttr(attr)) {
        if (!Array.isArray(attr.body)) attr.body = []
        attr.body = attr.body.map(ev => ({
          ...ev,
          galeria: Array.isArray(ev?.galeria) ? ev.galeria.map(normalizePhotoItemForEdit) : []
        }))
      }
    }
  }
}

function agregarEventoRegistro(attr) {
  if (!Array.isArray(attr.body)) attr.body = []
  attr.body.push({
    comentarioInicial: '',
    hora: '',
    observaciones: '',
    galeria: []
  })
}

function eliminarEventoRegistro(attr, idx) {
  if (!Array.isArray(attr.body)) return
  if (idx < 0 || idx >= attr.body.length) return
  attr.body.splice(idx, 1)
}

function cerrarModalEdicionTecnica() {
  dialogEditarTecnicoEjecucion.value = false
  tecnicoEjecucionEditError.value = ''
}

async function abrirModalEdicionTecnicaDesdeDetalle() {
  tecnicoEjecucionEditError.value = ''
  const hijos = Array.isArray(detalleHijos.value) ? detalleHijos.value : []
  const hijoPreferido = hijos.find(h => Number(h?.id_user_tecnico || 0) > 0) || hijos[0] || null
  const idSurvey = Number(hijoPreferido?.id_survey || 0)
  if (!idSurvey) {
    snackbar.value = {
      open: true,
      text: 'No se encontró survey hijo para editar.',
      color: 'warning'
    }
    return
  }

  try {
    const detail = await getSurvey(idSurvey)
    const row = Array.isArray(detail) ? detail?.[0] : detail?.surveyDetail?.[0]
    const parsed = parseBodyExecLocal(row?.body_exec || row?.json_exec)
    if (!parsed || !Array.isArray(parsed.segmentos)) {
      throw new Error('No se encontro body_exec editable para el tecnico.')
    }

    const cloned = JSON.parse(JSON.stringify(parsed))
    prepareBodyExecForEdit(cloned)
    tecnicoEjecucionBodyExec.value = cloned
    tecnicoEjecucionSurveyId.value = idSurvey
    tecnicoEjecucionSegmentos.value = (cloned.segmentos || []).filter(isSegmentTecnicoEditable)
    dialogEditarTecnicoEjecucion.value = true
  } catch (e) {
    console.error('Error abriendo edicion tecnica:', e)
    tecnicoEjecucionEditError.value =
      e?.response?.data?.error ||
      e?.response?.data?.message ||
      e?.message ||
      'No se pudo abrir la edición técnica.'
    snackbar.value = {
      open: true,
      text: tecnicoEjecucionEditError.value,
      color: 'error'
    }
  }
}

async function guardarEdicionTecnica() {
  const sid = Number(tecnicoEjecucionSurveyId.value || 0)
  if (!sid || !tecnicoEjecucionBodyExec.value) return

  guardandoEdicionTecnica.value = true
  tecnicoEjecucionEditError.value = ''
  try {
    await apiAxios.put(`/survey/${sid}`, {
      body_exec: JSON.stringify(tecnicoEjecucionBodyExec.value)
    })
    await refrescarRegistroTrasGuardado(sid, { forceReloadTable: false })
    dialogEditarTecnicoEjecucion.value = false
    snackbar.value = {
      open: true,
      text: 'Detalle técnico actualizado con exito',
      color: 'success'
    }
  } catch (e) {
    console.error('Error guardando edicion tecnica:', e)
    tecnicoEjecucionEditError.value =
      e?.response?.data?.error ||
      e?.response?.data?.message ||
      e?.message ||
      'No se pudo guardar la edición técnica.'
  } finally {
    guardandoEdicionTecnica.value = false
  }
}

function cerrarModalEdicion() {
  dialogEditar.value = false
  editError.value = ''
}

function getNombreContratistaById(idEmpresa) {
  const id = Number(idEmpresa || 0)
  if (!id) return ''
  const emp = (contratistas.value || []).find(e => Number(e?.id_empresa || 0) === id)
  return String(emp?.name_empresa || '').trim()
}

function actualizarFilaTablaLocal(idSurvey, patch = {}) {
  const sid = Number(idSurvey || 0)
  if (!sid) return
  const next = (tablaFull.value || []).map((row) => {
    if (Number(row?.id_survey || 0) !== sid) return row
    return { ...row, ...patch }
  })
  tablaFull.value = next
  tabla.value = next
}

function aplicarEdicionAsignacionLocal({ idPadre, idHijo, idEmpresa, idSupervisor, idTecnico }) {
  const sidPadre = Number(idPadre || 0)
  const sidHijo = Number(idHijo || 0)
  const empresaId = Number(idEmpresa || 0)
  const supId = Number(idSupervisor || 0)
  const tecId = Number(idTecnico || 0)

  const nombreEmpresa = getNombreContratistaById(empresaId)
  const nombreSup = supId ? (getUserNameById(supId) || '') : ''
  const nombreTec = tecId ? (getUserNameById(tecId) || '') : ''

  let huboCambios = false
  const next = (tablaFull.value || []).map((row) => {
    const sid = Number(row?.id_survey || 0)
    if (sid !== sidPadre && sid !== sidHijo) return row

    const updated = { ...row }

    // Contratista se aplica en ambos (padre/hijo) solo si se seleccionó uno explícitamente.
    if (empresaId > 0) {
      updated.id_user_contratista = empresaId
      if (nombreEmpresa) updated.contratista = nombreEmpresa
    }

    // Supervisor vive en PADRE.
    if (sidPadre && sid === sidPadre) {
      updated.id_user_supervisor = supId || null
      updated.nombre_supervisor = nombreSup
      if (isPlanCMode()) {
        updated.id_user_tecnico = tecId || null
        updated.nombre_tecnico = nombreTec
      }
    }

    // Técnico vive en HIJO.
    if (sidHijo && sid === sidHijo) {
      updated.id_user_tecnico = tecId || null
      updated.nombre_tecnico = nombreTec
    }

    huboCambios = true
    return updated
  })

  if (huboCambios) {
    tablaFull.value = next
    tabla.value = next
  }

  // Si el modal de detalle está abierto, reflejar el cambio de inmediato sin recargar la tabla completa.
  if (dialogDetalle.value && detallePadre.value) {
    if (sidPadre && Number(detallePadre.value?.id_survey || 0) === sidPadre) {
      const nextPadre = { ...detallePadre.value }
      if (empresaId > 0) {
        nextPadre.id_user_contratista = empresaId
        if (nombreEmpresa) nextPadre.contratista = nombreEmpresa
      }
      nextPadre.id_user_supervisor = supId || null
      nextPadre.nombre_supervisor = nombreSup
      if (isPlanCMode()) {
        nextPadre.id_user_tecnico = tecId || null
        nextPadre.nombre_tecnico = nombreTec
      }
      detallePadre.value = nextPadre
    }

    if (sidHijo && Array.isArray(detalleHijos.value)) {
      detalleHijos.value = detalleHijos.value.map((h) => {
        if (Number(h?.id_survey || 0) !== sidHijo) return h
        const nextHijo = { ...h }
        if (empresaId > 0) {
          nextHijo.id_user_contratista = empresaId
          if (nombreEmpresa) nextHijo.contratista = nombreEmpresa
        }
        nextHijo.id_user_tecnico = tecId || null
        nextHijo.nombre_tecnico = nombreTec
        return nextHijo
      })
    }
  }
}

async function guardarEdicion() {
  const id = Number(editForm.value.id_survey || 0)
  if (!id) return

  guardandoEdicion.value = true
  editError.value = ''

  try {
    const idEmpresa = Number(editForm.value.id_user_contratista || 0)
    const idSupervisor = Number(editForm.value.id_user_supervisor || 0)
    const idTecnico = Number(editForm.value.id_user_tecnico || 0)
    const { idPadre, idHijo } = resolverPadreHijoDesdeSurveyEditado(id)

    if (idSupervisor && !idPadre) {
      throw new Error('No se encontro survey padre para reasignar Supervisor.')
    }

    console.log('[AUTO-FLOW][guardarEdicion] id_survey:', id, {
      idPadre,
      idHijo,
      contratista: idEmpresa,
      supervisor: idSupervisor,
      tecnico: idTecnico
    })

    const obtenerContextoSurveyActual = async (surveyId) => {
      if (!surveyId) {
        return {
          asig: { contratista: null, supervisor: null, tecnico: null },
          plan: { fecha_plan_ini: '', fecha_plan_fin: '' }
        }
      }
      const detail = await getSurveyDetailCached(surveyId)
      const row = Array.isArray(detail) ? detail?.[0] : detail?.surveyDetail?.[0]
      return {
        asig: extraerAsignacionesDeDetail(detail),
        plan: {
          fecha_plan_ini: row?.fecha_plan_ini || '',
          fecha_plan_fin: row?.fecha_plan_fin || ''
        }
      }
    }

    const upds = []
    const updsPlan = []

    const [ctxPadre, ctxHijo] = await Promise.all([
      idPadre ? obtenerContextoSurveyActual(idPadre) : Promise.resolve(null),
      idHijo ? obtenerContextoSurveyActual(idHijo) : Promise.resolve(null)
    ])

    if (idPadre) {
      const asigPadre = ctxPadre?.asig || { contratista: null, supervisor: null, tecnico: null }
      const planPadre = ctxPadre?.plan || { fecha_plan_ini: '', fecha_plan_fin: '' }
      upds.push(
        apiAxios.post('/survey/UpdSurveyAsignaciones', {
          id_survey: idPadre,
          asignaciones: {
            Contratista: Number(idEmpresa || asigPadre.contratista || 0),
            Supervisor: Number(idSupervisor || 0),
            Tecnico: Number(idTecnico || asigPadre.tecnico || 0)
          }
        })
      )
      // Usuario asignado del PADRE => Tecnico si no hay hijo, o Supervisor si hay hijo / Plan C
      const idUserAsignadoPadre = Number(
        (isPlanCMode() ? (idTecnico || idSupervisor || 0) : (!idHijo && idTecnico ? idTecnico : (idSupervisor || 0))) || 0
      )
      updsPlan.push(
        apiAxios.put(`/survey/UpdPlan/${idPadre}`, {
          id_user: idUserAsignadoPadre,
          fecha_plan_ini: planPadre.fecha_plan_ini || editForm.value.fecha_plan_ini || '',
          fecha_plan_fin: planPadre.fecha_plan_fin || editForm.value.fecha_plan_fin || ''
        })
      )
    }

    if (idHijo) {
      const asigHijo = ctxHijo?.asig || { contratista: null, supervisor: null, tecnico: null }
      const planHijo = ctxHijo?.plan || { fecha_plan_ini: '', fecha_plan_fin: '' }
      upds.push(
        apiAxios.post('/survey/UpdSurveyAsignaciones', {
          id_survey: idHijo,
          asignaciones: {
            Contratista: Number(idEmpresa || asigHijo.contratista || 0),
            Supervisor: Number(asigHijo.supervisor || 0),
            Tecnico: Number(idTecnico || 0)
          }
        })
      )
      // Usuario asignado del HIJO => Tecnico
      updsPlan.push(
        apiAxios.put(`/survey/UpdPlan/${idHijo}`, {
          id_user: Number(idTecnico || 0),
          fecha_plan_ini: planHijo.fecha_plan_ini || editForm.value.fecha_plan_ini || '',
          fecha_plan_fin: planHijo.fecha_plan_fin || editForm.value.fecha_plan_fin || ''
        })
      )
    }

    if (!upds.length) {
      throw new Error('No se pudo resolver survey padre/hijo para guardar asignaciones.')
    }

    await Promise.all(upds)
    await Promise.all(updsPlan)

    // Al guardar edicion tambien gatillamos asignacion de flujo:
    // Supervisor -> survey padre, Tecnico -> survey hijo.
    if (!isPlanCMode()) {
      await asignarFlujoDesdeEdicion({
        idSurveyEditado: id,
        idSupervisor,
        idTecnico
      })
    }

    // ✅ invalidar cache del detail para que al reabrir esté actualizado
    surveyDetailCache.value.delete(id)
    if (idPadre) surveyDetailCache.value.delete(idPadre)
    if (idHijo) surveyDetailCache.value.delete(idHijo)

    aplicarEdicionAsignacionLocal({
      idPadre,
      idHijo,
      idEmpresa,
      idSupervisor,
      idTecnico
    })

    dialogEditar.value = false
    if (dialogDetalle.value) {
      await refrescarRegistroTrasGuardado(id, { forceReloadTable: false })
    }
  } catch (e) {
    console.error('❌ guardarEdicion', e)
    editError.value =
      e?.response?.data?.error ||
      e?.response?.data?.message ||
      e?.message ||
      'Error guardando.'
  } finally {
    guardandoEdicion.value = false
  }
}

function normalizaRolFlow(nameRol) {
  return String(nameRol || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase()
}

function resolverPadreHijoDesdeSurveyEditado(idSurveyEditado) {
  const idEdit = Number(idSurveyEditado || 0)
  if (isPlanCMode()) {
    return { idPadre: idEdit || null, idHijo: null }
  }
  const item = (tablaFull.value || []).find(s => Number(s?.id_survey) === idEdit)

  if (!item) {
    console.log('[AUTO-FLOW][resolverPadreHijo] item no encontrado, usa editado como padre', { idEdit })
    return { idPadre: idEdit || null, idHijo: null }
  }

  const idPadreDirecto = Number(item?.id_survey_padre || 0)
  if (idPadreDirecto) {
    console.log('[AUTO-FLOW][resolverPadreHijo] editado es HIJO', {
      idEdit,
      idPadre: idPadreDirecto,
      idHijo: idEdit
    })
    return { idPadre: idPadreDirecto, idHijo: idEdit }
  }

  const hijos = hijosByPadre.value.get(idEdit) || []
  const primerHijo = hijos[0] || null
  console.log('[AUTO-FLOW][resolverPadreHijo] editado es PADRE', {
    idEdit,
    idPadre: idEdit || null,
    idHijo: primerHijo ? Number(primerHijo.id_survey) : null,
    hijosCount: hijos.length
  })
  return {
    idPadre: idEdit || null,
    idHijo: primerHijo ? Number(primerHijo.id_survey) : null
  }
}

function buscarStepPorRol(flujosLista, exactRoles = [], containsTokens = []) {
  const exactNorm = (exactRoles || []).map(normalizaRolFlow).filter(Boolean)
  const tokensNorm = (containsTokens || []).map(normalizaRolFlow).filter(Boolean)

  const porExact = (flujosLista || []).find(s =>
    !s?.flag_equipo && exactNorm.includes(normalizaRolFlow(s?.name_rol))
  )
  if (porExact) return porExact

  return (flujosLista || []).find(s => {
    if (s?.flag_equipo) return false
    const rol = normalizaRolFlow(s?.name_rol)
    return tokensNorm.some(t => rol.includes(t))
  }) || null
}

async function asignarFlujoAutomaticoPorRoles(surveyId, roleAssignments = []) {
  const sid = Number(surveyId || 0)
  if (!sid || !Array.isArray(roleAssignments) || !roleAssignments.length) return false

  console.log('[AUTO-FLOW][inicio]', { sid, roleAssignments })

  selectedSurveyIdSeleccionado.value = sid

  await obtenerFlujosAprobacion(sid)
  await obtenerFlujosByIdSurvey(flujosAprobacion.value)
  await obtenerEquiposProyectos()

  console.log('[AUTO-FLOW][flow-datos]', {
    sid,
    id_flow: flujosAprobacion.value,
    stepsCount: (flujos.value || []).length
  })

  flujos.value = (flujos.value ?? []).map(f => {
    const esEquipo = !!f.flag_equipo || /eq-?\s*fescol/i.test(String(f.name_rol || ''))
    const out = { ...f, flag_equipo: esEquipo }
    if (out.flag_equipo) {
      out.id_user = normalizaNum(f.id_user ?? f.id_equipo_proyecto ?? f._id_equipo_proyecto)
      out._id_equipo_proyecto = out.id_user
    } else {
      out.id_user = normalizaNum(f.id_user)
      out._id_equipo_proyecto = null
    }
    return out
  })

  prepararAsignaciones()

  for (const a of roleAssignments) {
    const uid = Number(a?.userId || 0)
    if (!uid) continue
    const step = buscarStepPorRol(flujos.value, a?.exactRoles || [], a?.containsTokens || [])
    console.log('[AUTO-FLOW][buscar-step]', {
      sid,
      userId: uid,
      exactRoles: a?.exactRoles || [],
      containsTokens: a?.containsTokens || [],
      stepEncontrado: step
        ? { id_flow_stp: step.id_flow_stp, name_rol: step.name_rol, flag_equipo: !!step.flag_equipo, id_user_actual: step.id_user }
        : null
    })
    if (!step) {
      // Fallback: si no calza por rol, replicar comportamiento del flujo auto
      // asignando el usuario a todos los pasos de usuario (no equipo).
      const fallbackSteps = (flujos.value || []).filter(s => !s?.flag_equipo)
      console.log('[AUTO-FLOW][fallback-all-user-steps]', {
        sid,
        userId: uid,
        stepsCount: fallbackSteps.length,
        steps: fallbackSteps.map(s => ({
          id_flow_stp: s.id_flow_stp,
          name_rol: s.name_rol,
          id_user_actual: s.id_user
        }))
      })

      fallbackSteps.forEach(s => {
        const before = s.id_user
        markDirty(s, uid)
        console.log('[AUTO-FLOW][mark-dirty-fallback]', {
          sid,
          id_flow_stp: s.id_flow_stp,
          name_rol: s.name_rol,
          before,
          after: s.id_user,
          dirty: s._dirty
        })
      })
      continue
    }

    const before = step.id_user
    if (step.flag_equipo) markDirtyEquipo(step, uid)
    else markDirty(step, uid)
    console.log('[AUTO-FLOW][mark-dirty]', {
      sid,
      id_flow_stp: step.id_flow_stp,
      name_rol: step.name_rol,
      before,
      after: step.id_user,
      dirty: step._dirty
    })
  }

  const cambios = flujos.value.filter(f => f._dirty)
  console.log('[AUTO-FLOW][cambios]', {
    sid,
    cambios: cambios.map(c => ({
      id_flow_stp: c.id_flow_stp,
      name_rol: c.name_rol,
      id_user: c.id_user,
      flag_equipo: !!c.flag_equipo
    }))
  })
  if (!cambios.length) return false

  const reqs = cambios.map(f => apiAxios.put('/survey/UpdUserFlow', {
    id_flow_stp: f.id_flow_stp,
    id_user_flujo: Number(f.id_user),
    flag_equipo: f.flag_equipo
  }))

  const reqsNotf = cambios
    .filter(f => !f.flag_equipo && normalizaNum(f.id_user))
    .map(f => apiAxios.post('/notfqueue', {
      id_user_target: Number(f.id_user),
      id_template: null,
      json_data: {
        id_survey: sid,
        id_flow: flujosAprobacion.value,
        id_area: 8,
        tipo_notf: 'asignacion_firma',
        obs_notf: 'asignacion firma (conexion)'
      },
      channels: { channel: 'WEB' },
      estado: 'PENDING'
    }))

  const res = await Promise.allSettled(reqs)
  await Promise.allSettled(reqsNotf)

  let todoOk = true
  res.forEach((r, i) => {
    const f = cambios[i]
    if (r.status === 'fulfilled') {
      f._orig_id = Number(f.id_user)
      f._dirty = false
      console.log('[AUTO-FLOW][UpdUserFlow OK]', {
        sid,
        id_flow_stp: f.id_flow_stp,
        name_rol: f.name_rol,
        id_user: f.id_user
      })
    } else {
      todoOk = false
      console.error('Fallo step auto', f.id_flow_stp, r.reason)
    }
  })

  if (todoOk) {
    const estadoActualizado = await actualizarEstadoSurveyAsignado(sid)
    console.log('[AUTO-FLOW][estado->Asignado]', { sid, actualizado: estadoActualizado })
  }
  console.log('[AUTO-FLOW][fin]', { sid, todoOk })
  return todoOk
}

async function asignarFlujoDesdeEdicion({ idSurveyEditado, idSupervisor, idTecnico }) {
  const { idPadre, idHijo } = resolverPadreHijoDesdeSurveyEditado(idSurveyEditado)
  const resultados = { supervisor: false, tecnico: false }
  console.log('[AUTO-FLOW][padre-hijo]', {
    idSurveyEditado,
    idPadre,
    idHijo,
    idSupervisor: Number(idSupervisor || 0),
    idTecnico: Number(idTecnico || 0)
  })

  const buildPreparedSteps = (rawSteps = []) => {
    return (rawSteps || []).map((f) => {
      const esEquipo = !!f.flag_equipo || /eq-?\s*fescol/i.test(String(f.name_rol || ''))
      const out = { ...f, flag_equipo: esEquipo }
      if (out.flag_equipo) {
        out.id_user = normalizaNum(f.id_user ?? f.id_equipo_proyecto ?? f._id_equipo_proyecto)
        out._id_equipo_proyecto = out.id_user
      } else {
        out.id_user = normalizaNum(f.id_user)
        out._id_equipo_proyecto = null
      }
      out._orig_id = normalizaNum(out.id_user)
      out._dirty = false
      return out
    })
  }

  const applyAssignmentsToPreparedSteps = (steps = [], roleAssignments = []) => {
    for (const a of roleAssignments) {
      const uid = Number(a?.userId || 0)
      if (!uid) continue
      const step = buscarStepPorRol(steps, a?.exactRoles || [], a?.containsTokens || [])

      if (!step) {
        const fallbackSteps = (steps || []).filter(s => !s?.flag_equipo)
        fallbackSteps.forEach(s => {
          s._dirty = normalizaNum(uid) !== normalizaNum(s._orig_id)
          s.id_user = normalizaNum(uid)
        })
        continue
      }

      if (step.flag_equipo) {
        step.id_user = normalizaNum(uid)
        step._id_equipo_proyecto = step.id_user
        step._dirty = normalizaNum(step.id_user) !== normalizaNum(step._orig_id)
      } else {
        step.id_user = normalizaNum(uid)
        step._dirty = normalizaNum(step.id_user) !== normalizaNum(step._orig_id)
      }
    }

    return steps.filter(s => s._dirty)
  }

  const persistPreparedFlowChanges = async ({ sid, idFlow, cambios = [] }) => {
    if (!cambios.length) return false

    const reqs = cambios.map(f => apiAxios.put('/survey/UpdUserFlow', {
      id_flow_stp: f.id_flow_stp,
      id_user_flujo: Number(f.id_user),
      flag_equipo: f.flag_equipo
    }))

    const reqsNotf = cambios
      .filter(f => !f.flag_equipo && normalizaNum(f.id_user))
      .map(f => apiAxios.post('/notfqueue', {
        id_user_target: Number(f.id_user),
        id_template: null,
        json_data: {
          id_survey: sid,
          id_flow: idFlow,
          id_area: 8,
          tipo_notf: 'asignacion_firma',
          obs_notf: 'asignacion firma (conexion)'
        },
        channels: { channel: 'WEB' },
        estado: 'PENDING'
      }))

    const res = await Promise.allSettled(reqs)
    await Promise.allSettled(reqsNotf)
    const ok = res.every(r => r.status === 'fulfilled')
    if (ok) {
      await actualizarEstadoSurveyAsignado(sid)
    }
    return ok
  }

  const runAutoFlowTarget = async ({ sid, roleAssignments, flowBySurvey, stepsByFlow }) => {
    const idFlow = Number(flowBySurvey.get(Number(sid)) || 0)
    if (!idFlow) return false
    const rawSteps = stepsByFlow.get(idFlow) || []
    const prepared = buildPreparedSteps(rawSteps)
    const cambios = applyAssignmentsToPreparedSteps(prepared, roleAssignments)
    if (!cambios.length) return false
    return persistPreparedFlowChanges({ sid: Number(sid), idFlow, cambios })
  }

  try {
    const targets = []
    if (idPadre && idSupervisor) {
      targets.push({
        key: 'supervisor',
        sid: Number(idPadre),
        roleAssignments: [
          { userId: idSupervisor, exactRoles: ['CNX-TRC-SUP'], containsTokens: ['SUP'] }
        ]
      })
    }
    if (idHijo && idTecnico) {
      targets.push({
        key: 'tecnico',
        sid: Number(idHijo),
        roleAssignments: [
          { userId: idTecnico, exactRoles: ['CNX-TRC-ENAR', 'CNX-TRC-TEC', 'CNX-TRC-TECNICO'], containsTokens: ['ENAR', 'TECNICO', 'TEC'] }
        ]
      })
    }
    if (!targets.length) return resultados

    const { data: flowData } = await apiAxios.get('/servicio/leanglobal/flujosAprobacion')
    const flowRows = Array.isArray(flowData?.datos) ? flowData.datos : []
    const flowBySurvey = new Map()
    for (const row of flowRows) {
      const sid = Number(row?.id_survey || 0)
      const fid = Number(row?.id_flow || 0)
      if (sid && fid) flowBySurvey.set(sid, fid)
    }

    const flowIds = Array.from(new Set(
      targets
        .map(t => Number(flowBySurvey.get(t.sid) || 0))
        .filter(Boolean)
    ))
    const flowStepsPairs = await Promise.all(
      flowIds.map(async (fid) => {
        const { data } = await apiAxios.get(`/servicio/leanglobal/flujosAprobacionSteps?id_flow=${fid}`)
        return [fid, Array.isArray(data) ? data : []]
      })
    )
    const stepsByFlow = new Map(flowStepsPairs)

    const settled = await Promise.allSettled(
      targets.map(async (t) => {
        const ok = await runAutoFlowTarget({
          sid: t.sid,
          roleAssignments: t.roleAssignments,
          flowBySurvey,
          stepsByFlow
        })
        return { key: t.key, ok }
      })
    )

    for (const entry of settled) {
      if (entry.status !== 'fulfilled') continue
      const k = String(entry.value?.key || '')
      if (k === 'supervisor') resultados.supervisor = !!entry.value?.ok
      if (k === 'tecnico') resultados.tecnico = !!entry.value?.ok
    }

    console.log('[AUTO-FLOW][resultado-final]', resultados)
  } catch (e) {
    console.error('Error asignando flujo desde edicion:', e)
    snackbar.value = {
      open: true,
      text: 'Se guardo la edicion, pero fallo la asignacion de flujo',
      color: 'warning'
    }
  }

  return resultados
}

// =====================
// Flow + modal (igual que tenías)
// =====================
const flujosAprobacion = ref(null)
const flujos = ref([])
const showModalAsignar = ref(false)
const selectedSurveyIdSeleccionado = ref(null)

const equiposProyectos = ref([])
const valueComparator = (a, b) => Number(a) === Number(b)
const normalizaNum = (v) => (v == null || v === '' ? null : Number(v))

const equiposItems = computed(() =>
  (equiposProyectos.value ?? []).map(e => ({ ...e, id_equipo_proyecto: Number(e.id_equipo_proyecto) }))
)

const equiposMap = computed(() => {
  const m = new Map()
  for (const e of equiposItems.value) m.set(e.id_equipo_proyecto, e.nombre_equipo)
  return m
})
const nombreEquipoById = (id) => equiposMap.value.get(Number(id)) ?? id

async function obtenerEquiposProyectos() {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerEquiposProyectos')
    equiposProyectos.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error(err)
    equiposProyectos.value = []
  }
}

function prepararAsignaciones() {
  flujos.value.forEach(f => {
    f._orig_id = normalizaNum(f.id_user)
    f._dirty = false
  })
}

function markDirty(fila, nuevoVal) {
  const nuevo = normalizaNum(nuevoVal)
  if (fila._orig_id === undefined) fila._orig_id = normalizaNum(fila.id_user)
  fila._dirty = nuevo !== fila._orig_id
  fila.id_user = nuevo
}

function markDirtyEquipo(fila, nuevoVal) {
  const nuevo = normalizaNum(nuevoVal)
  const nombre = nombreEquipoById(nuevo)
  if (nombre && nombre !== nuevo) fila.nombre_user = nombre

  if (fila._orig_id === undefined) fila._orig_id = normalizaNum(fila.id_user)
  fila._dirty = nuevo !== fila._orig_id

  fila.id_user = nuevo
  fila._id_equipo_proyecto = nuevo
}

const rolesFlujoList = ref([])
const usuariosRolesList = ref([])

async function fetchRolesFlujo() {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerRoles')
    rolesFlujoList.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('fetchRolesFlujo error:', e)
    rolesFlujoList.value = []
  }
}

async function fetchUsuariosRoles() {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerUsuariosRoles')
    usuariosRolesList.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('fetchUsuariosRoles error:', e)
    usuariosRolesList.value = []
  }
}

const rolNameToId = computed(() => {
  const m = Object.create(null)
  for (const r of rolesFlujoList.value) m[r.name_rol] = r.id_rol
  return m
})

const usersByRolId = computed(() => {
  const m = new Map()
  for (const ur of usuariosRolesList.value) {
    if (!m.has(ur.id_rol)) m.set(ur.id_rol, new Set())
    m.get(ur.id_rol).add(Number(ur.id_user))
  }
  return m
})

const usuariosFlowOrdenados = computed(() =>
  sortByText(
    (usuariosFlow.value ?? []).filter(u => (u.nombre_user ?? '').trim().length > 0),
    u => u.nombre_user
  )
)

function usuariosPorRol(rolName) {
  if (rolName === 'FES_DIRECTA') return usuariosFlowOrdenados.value
  const rolId = rolNameToId.value[rolName]
  if (!rolId) return []
  const ids = usersByRolId.value.get(rolId)
  if (!ids) return []
  return usuariosFlowOrdenados.value.filter(u => ids.has(Number(u.id_user)))
}

// =====================
// GETS
// =====================
const contratistas = ref([])

async function fetchEmpresas() {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerEmpresas')
    if (Array.isArray(data)) {
      // Filtra las que tengan flag_externo en true/1
      contratistas.value = data.filter(e => e.flag_externo === true || e.flag_externo === 1 || e.flag_externo === 't' || e.flag_externo === 'true')
        .sort((a, b) => (a.name_empresa || '').localeCompare(b.name_empresa || ''))
    } else {
      contratistas.value = []
    }
  } catch (e) {
    console.error('fetchEmpresas error:', e)
    contratistas.value = []
  }
}

async function obtenerUsuarios() {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerUsuarios')
    usuarios.value = Array.isArray(data) ? data : []
    usuariosFlow.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error(err)
    usuarios.value = []
    usuariosFlow.value = []
  }
  // Cargar también empresas (contratistas)
  await fetchEmpresas()
}

// Usuarios filtrados por la empresa seleccionada en "Contratista"
const usuariosPorEmpresaContratista = computed(() => {
  return usuariosOrdenados.value
});

function toBoolFlag(value) {
  return value === true || value === 1 || value === '1' || value === 't' || value === 'true'
}

const roleNameById = computed(() => {
  const m = new Map()
  for (const r of (rolesFlujoList.value || [])) {
    const rid = Number(r?.id_rol)
    if (!rid) continue
    m.set(rid, String(r?.name_rol || '').trim().toUpperCase())
  }
  return m
})

function isConexionRoleName(roleNameRaw) {
  const roleName = String(roleNameRaw || '').trim().toUpperCase()
  if (!roleName) return false
  // En ambientes hay variantes: CON* y CNX* para conexión.
  return roleName.startsWith('CON') || roleName.startsWith('CNX') || roleName.includes('-CON-') || roleName.includes('-CNX-')
}

const conRoleUserIds = computed(() => {
  const ids = new Set()
  for (const ur of (usuariosRolesList.value || [])) {
    const uid = Number(ur?.id_user)
    const rid = Number(ur?.id_rol)
    if (!uid || !rid) continue
    const roleName = roleNameById.value.get(rid) || ''
    if (isConexionRoleName(roleName)) ids.add(uid)
  }
  return ids
})

const usuariosSupervisorEdicion = computed(() => {
  return (usuariosPorEmpresaContratista.value || [])
    .filter(u =>
      conRoleUserIds.value.has(Number(u?.id_user)) &&
      !isUsuarioExterno(u)
    )
})

const empresasExternasIds = computed(() => {
  return new Set((contratistas.value || []).map(e => Number(e?.id_empresa)).filter(id => id > 0))
})

function isUsuarioExterno(user) {
  if (toBoolFlag(user?.flag_externo)) return true
  const idEmpresaUser = Number(user?.id_empresa || 0)
  return idEmpresaUser > 0 && empresasExternasIds.value.has(idEmpresaUser)
}

const usuariosTecnicoEdicion = computed(() => {
  return (usuariosPorEmpresaContratista.value || [])
    .filter(u =>
      conRoleUserIds.value.has(Number(u?.id_user)) &&
      isUsuarioExterno(u)
    )
})

function userPerteneceAEmpresa(idUser, idEmpresa) {
  const uid = Number(idUser || 0)
  const eid = Number(idEmpresa || 0)
  if (!uid || !eid) return false
  return (usuarios.value ?? []).some(
    u => Number(u.id_user) === uid && Number(u.id_empresa) === eid
  )
}

function normalizarAsignacionPorContratista() {
  // Se desactiva restricción por contratista: se permiten todos los usuarios.
  return
}

// En edición, cuando cambia contratista, Supervisor/Técnico deben respetar esa empresa.
watch(
  () => editForm.value.id_user_contratista,
  () => {
    normalizarAsignacionPorContratista()
  }
)

watch(usuariosSupervisorEdicion, (lista) => {
  const current = Number(editForm.value?.id_user_supervisor || 0)
  if (!current) return
  const permitido = (lista || []).some(u => Number(u?.id_user) === current)
  if (!permitido) editForm.value.id_user_supervisor = null
})

watch(usuariosTecnicoEdicion, (lista) => {
  const current = Number(editForm.value?.id_user_tecnico || 0)
  if (!current) return
  const permitido = (lista || []).some(u => Number(u?.id_user) === current)
  if (!permitido) editForm.value.id_user_tecnico = null
})




/* Helper local */
async function getSurveyDetailLocal(id) {
  try {
    const { data } = await apiAxios.get("/servicio/leanglobal/procesosSurveyDetail?id_survey=" + id)
    return Array.isArray(data) ? data[0] : (data?.surveyDetail?.[0] || data)
  } catch (e) {
    return null
  }
}

async function resolveDocUrlByIdDoc(idDoc) {
  const id = Number(idDoc || 0)
  if (!id) return ''

  if (docUrlCache.value[id]) return docUrlCache.value[id]

  try {
    const resp = await apiAxios.get(`/servicio/leanglobal/obtenerTFMGFile?id_doc=${id}`)
    const row = Array.isArray(resp.data) ? resp.data[0] : resp.data
    const name = row?.name_doc_interno || ''
    const url = name ? `${API_BASE_URL}/archivo/terracon/${name}` : ''
    docUrlCache.value = { ...docUrlCache.value, [id]: url }
    return url
  } catch (e) {
    console.error('[PDF-DEBUG][resolveDocUrlByIdDoc]', { id_doc: id, error: e })
    docUrlCache.value = { ...docUrlCache.value, [id]: '' }
    return ''
  }
}

function getPdfUrl(row) {
  if (!row) return ''
  const id = Number(row?.id_doc || 0)
  if (id) return `${API_BASE_URL}/archivo/terracon/${id}`
  const byRegistro = String(row?.url_doc_registro || '').trim()
  if (byRegistro) return byRegistro
  return String(row?.pdf_flujo_url || '').trim()
}

async function getFlowPdfBySurvey({ fechaDesde, fechaHasta, clienteId, proyectoId }) {
  try {
    const queryFlujos =
      `/servicio/leanglobal/flujosAprobacion` +
      `?fecha_desde=${encodeURIComponent(fechaDesde || '')}` +
      `&fecha_hasta=${encodeURIComponent(fechaHasta || '')}` +
      `&ts.id_empresa_cliente=${encodeURIComponent(clienteId || '')}` +
      `&ts.id_proyecto=${encodeURIComponent(proyectoId || '')}`

    const [respFlujos, respSteps] = await Promise.all([
      apiAxios.get(queryFlujos),
      apiAxios.get('/servicio/leanglobal/flujosAprobacionSteps')
    ])

    const flujosData = respFlujos?.data?.datos || []
    const stepsData = Array.isArray(respSteps?.data) ? respSteps.data : []

    const stepsByFlow = new Map()
    for (const st of stepsData) {
      const idFlow = Number(st?.id_flow || 0)
      if (!idFlow) continue
      if (!stepsByFlow.has(idFlow)) stepsByFlow.set(idFlow, [])
      stepsByFlow.get(idFlow).push(st)
    }

    const out = {}

    for (const f of flujosData) {
      const sid = Number(f?.id_survey || 0)
      const idFlow = Number(f?.id_flow || 0)
      if (!sid || !idFlow) continue

      const steps = (stepsByFlow.get(idFlow) || []).slice().sort(
        (a, b) => Number(b?.id_flow_stp || 0) - Number(a?.id_flow_stp || 0)
      )

      // Prioridad: documento salida -> documento origen
      const stepWithDocOut = steps.find(s => String(s?.name_doc_interno_out || '').trim() !== '')
      const stepWithDocIn = steps.find(s => String(s?.name_doc_interno_in || '').trim() !== '')

      const docNameOut = String(stepWithDocOut?.name_doc_interno_out || '').trim()
      const docNameIn = String(stepWithDocIn?.name_doc_interno_in || '').trim()
      const docName = docNameOut || docNameIn
      const pdfUrl = docName ? `${API_BASE_URL}/archivo/terracon/${docName}` : ''

      out[sid] = {
        pdf_flujo_url: pdfUrl,
        name_doc_interno_out: docNameOut,
        name_doc_interno_in: docNameIn
      }

      if ([1574, 1575, 1754].includes(sid)) {
        console.log('[PDF-DEBUG][FlujoPDF]', {
          id_survey: sid,
          id_flow: idFlow,
          stepDocOut: stepWithDocOut?.id_flow_stp || null,
          stepDocIn: stepWithDocIn?.id_flow_stp || null,
          pdf_flujo_url: pdfUrl
        })
      }
    }

    flowPdfBySurveyCache.value = out
    return out
  } catch (e) {
    console.error('[PDF-DEBUG][getFlowPdfBySurvey]', e)
    flowPdfBySurveyCache.value = {}
    return {}
  }
}

async function fetchConexionRowsBase({ fechaDesde, fechaHasta, clienteId, proyectoId }) {
  const params = new URLSearchParams()
  if (fechaDesde) params.append('fecha_desde', String(fechaDesde))
  if (fechaHasta) params.append('fecha_hasta', String(fechaHasta))
  params.append('ts.id_empresa_cliente', String(clienteId || ''))
  params.append('ts.id_proyecto', String(proyectoId || ''))

  if (USE_CONEXION_V4) {
    try {
      const respV4 = await apiAxios.get(`/servicio/leanglobal/procesosSurveyV4?${params.toString()}`)
      const rowsV4 = Array.isArray(respV4?.data?.datos) ? respV4.data.datos : []
      conexionSurveyServiceInUse.value = 'V4'
      return rowsV4
    } catch (err) {
      console.warn('[CONEXION][V4] fallback a V3 por error:', err?.response?.status || err?.message || err)
    }
  }

  const respV3 = await apiAxios.get(`/servicio/leanglobal/procesosSurveyV3?${params.toString()}`)
  const rowsV3 = Array.isArray(respV3?.data?.datos) ? respV3.data.datos : []
  conexionSurveyServiceInUse.value = 'V3'
  return rowsV3
}

async function getSurveys() {
  cargandoAsignaciones.value = true
  tabla.value = []
  tablaFull.value = []
  try {
    const proyectoId = (props.proyectoId == null || String(props.proyectoId).trim().toLowerCase() === 'null' || String(props.proyectoId).trim() === '')
      ? ''
      : props.proyectoId

    const clienteId = (props.clienteId == null || String(props.clienteId).trim().toLowerCase() === 'null' || String(props.clienteId).trim().toLowerCase() === '' || String(props.clienteId).trim() === '')
      ? ''
      : props.clienteId

    const [rowsBase, cnxLoadIndex] = await Promise.all([
      fetchConexionRowsBase({
        fechaDesde: props.fechaDesde,
        fechaHasta: props.fechaHasta,
        clienteId,
        proyectoId
      }),
      getCnxLoadIndex()
    ])
    const cnxLoadTimeline = cnxLoadTimelineCache.value || []
    const ordenados = (rowsBase || []).sort((a, b) => Number(b.id_survey) - Number(a.id_survey))

    const conexion = ordenados.filter(s => Number(s.id_area) === 8 && Number(s.id_template) !== 153)
    const conexionByMode = conexion.filter(s => surveyMatchesPlanMode(s, cnxLoadIndex))
    const hayFiltroCargaEspecifico = Number(filtroCarga.value?.id_load || 0) > 0
    const conexionBase = hayFiltroCargaEspecifico ? conexionByMode : conexionByMode.filter(cumpleFiltroFechaPlan)
    const flowPdfBySurvey = await getFlowPdfBySurvey({
      fechaDesde: props.fechaDesde,
      fechaHasta: props.fechaHasta,
      clienteId,
      proyectoId
    })

    // ✅ ENRIQUECIMIENTO SIEMPRE
    const enriched = await Promise.all(
      conexionBase.map(async (s) => {
        let final = {
          ...s,
          estado_srv: getEstadoUiLabel(s?.estado_srv) || s?.estado_srv || '',
          url_doc_registro: '',
          id_doc: Number(s?.id_doc || 0) || null,
          header_exec: s?.header_exec,
          body_exec: s?.body_exec,
          json_exec: s?.json_exec,
          id_load: Number(s?.id_load || 0) || 0,
          load_nombre_origen: String(s?.name_doc_orig || s?.name_doc_interno || s?.name_doc || '').trim(),
          load_fecha_carga_iso: '',
          pdf_flujo_url: flowPdfBySurvey?.[Number(s?.id_survey || 0)]?.pdf_flujo_url || ''
        }
        const debugPdf = [1574, 1575, 1754].includes(Number(s?.id_survey))
        if (debugPdf) {
          console.log('[PDF-DEBUG][SurveyV3]', s)
        }
        try {
          const detail = (final.body_exec || final.json_exec) ? final : await getSurveyDetailLocal(s.id_survey)
          if (detail) {
            if (debugPdf) {
              console.log('[PDF-DEBUG][Detail]', detail)
            }
            // 1. Doc Registro (siempre, se usa en columna PDF)
            try {
              const { url_doc_registro } = extraerDocRegistro(detail)
              final.url_doc_registro = url_doc_registro
              if (debugPdf) {
                console.log('[PDF-DEBUG][DetailDoc]', {
                  id_survey: s.id_survey,
                  url_doc_registro
                })
              }
            } catch (e) { }

            // 2. Body/JSON exec
            final.body_exec = detail.body_exec
            final.json_exec = detail.json_exec

            // 3. Extraer ORDEN
            // 3. Extraer Datos Completos (Copia de ResumenCarga)
            const raw = detail.body_exec || detail.json_exec
            const vals = getBodyValues(raw)
            const rawLoadMeta = extractLoadMetaFromRaw(raw)
            final.id_load = Number(
              getFirstBodyValue(vals, ['ID LOAD', 'ID_LOAD', 'LOAD ID', 'IDLOAD']) ||
              rawLoadMeta.id_load ||
              detail?.id_load ||
              s?.id_load ||
              0
            ) || 0
            const fromValsNombre = getFirstBodyValue(vals, [
              'NAME_DOC_ORIG',
              'NAME DOC ORIG',
              'NOMBRE EXCEL',
              'NOMBRE CARGA',
              'ARCHIVO ORIGEN',
              'NOMBRE ARCHIVO'
            ])
            const loadMeta = cnxLoadIndex.get(final.id_load) || null
            final.load_nombre_origen = String(
              fromValsNombre ||
              loadMeta?.nombre ||
              detail?.name_doc_orig ||
              detail?.name_doc_interno ||
              rawLoadMeta.nombre ||
              s?.name_doc_orig ||
              s?.name_doc_interno ||
              final.load_nombre_origen ||
              ''
            ).trim()
            final.load_fecha_carga_iso = String(loadMeta?.fecha_iso || '')

            // Inferencia para datos históricos: si no trae id_load en survey/body,
            // intentamos asignar por ventana temporal de cargas.
            if (!final.id_load) {
              const fechaRefCarga = parseDateSafe(
                detail?.fecha_creacion ||
                s?.fecha_creacion ||
                s?.fecha_upload ||
                detail?.fecha_plan_ini ||
                s?.fecha_plan_ini
              )
              if (fechaRefCarga && cnxLoadTimeline.length) {
                const ts = fechaRefCarga.getTime()
                for (let i = 0; i < cnxLoadTimeline.length; i++) {
                  const cur = cnxLoadTimeline[i]
                  const next = cnxLoadTimeline[i + 1]
                  const tCur = cur?.fecha_ts?.getTime?.() || 0
                  const tNext = next?.fecha_ts?.getTime?.() || Number.POSITIVE_INFINITY
                  if (ts >= tCur && ts < tNext) {
                    final.id_load = Number(cur.id_load || 0) || 0
                    if (!final.load_nombre_origen) final.load_nombre_origen = String(cur.nombre || '').trim()
                    if (!final.load_fecha_carga_iso) final.load_fecha_carga_iso = String(cur.fecha_iso || '')
                    break
                  }
                }
              }
            }

            // Mapeo
            // Orden (si no vino antes, o pisar si el body manda)
            if (vals['NMRO ORDEN MG']) final.orden = vals['NMRO ORDEN MG']
            else if (vals['ORDEN']) final.orden = vals['ORDEN']

            final.contratista = vals['CONTRATISTA'] || s.contratista || s.codi_tipo_srv || ''
            final.certificadora = getFirstBodyValue(vals, ['CERTIFICADORA']) || s.certificadora || ''
            final.proyecto = getSupervisorProyectoFromVals(vals, s)
            final.ic_sap_mg = getFirstBodyValue(vals, ['IC-SAP', 'IC SAP', 'IC SAP MG', 'IC_SAP MG']) || s.ic_sap_mg || s.ic_sap || ''
            final.gio = vals['GIO'] || s.gio || ''
            final.tipo_conexion = getFirstBodyValue(vals, ['ESTADO', 'TIPO']) || ''
            final.valor_servicio = getFirstBodyValue(vals, ['VALOR SERVICIO', 'VALOR SERVCIO']) || s.valor_servicio || ''
            const estadoBody = getFirstBodyValue(vals, ['ESTADO CONEXION', 'ESTADO CONEXIÓN', 'ESTADO'])
            const estadoCnx = !isInvalidEstadoValue(estadoBody)
              ? estadoBody
              : (!isInvalidEstadoValue(s.estado_srv) ? s.estado_srv : '')
            const horaDirecta = getFirstBodyValue(vals, HORA_LLEGADA_KEYS)
            const horaFallback = extractHoraLlegadaFromBody(raw)
            const horaLlegadaTec = !isInvalidHoraValue(horaDirecta)
              ? horaDirecta
              : (!isInvalidHoraValue(horaFallback) ? horaFallback : '')
            const charlaCnx = getFirstBodyValue(vals, ['CHARLA']) || ''
            const atsCnx = getFirstBodyValue(vals, ['ATS']) || ''
            const tAlturaCnx = getFirstBodyValue(vals, ['T. ALTURA', 'T ALTURA', 'TRABAJO ALTURA']) || ''
            final.estado_conexion = estadoCnx
            final.hora_llegada_tecnico = horaLlegadaTec
            final.charla = charlaCnx
            final.ats = atsCnx
            final.t_altura = tAlturaCnx
            // "Estado detalle" debe mostrar solo el estado obtenido del body_exec.
            final.estado_conexion_detalle = estadoCnx
            final.fecha_tabla =
              getFirstBodyValue(vals, ['FECHA', 'FECHA CONEXION', 'FECHA DE CONEXION', 'FECHA DE CONEXIÓN']) ||
              s.fecha_plan_ini ||
              s.fecha_plan_fin ||
              ''

            const asig = extraerAsignacionesDeDetail({ surveyDetail: [detail] })
            const idSup = Number(s?.id_user_supervisor || asig?.supervisor || 0) || null
            const idTec = Number(s?.id_user_tecnico || asig?.tecnico || 0) || null
            final.id_user_supervisor = idSup
            final.id_user_tecnico = idTec
            final.nombre_supervisor = String(s?.nombre_supervisor_asignado || '').trim() || getUserNameById(idSup)
            final.nombre_tecnico = String(s?.nombre_tecnico_asignado || '').trim() || getUserNameById(idTec)

            const dirComuna = getSupervisorDireccionComunaFromVals(vals, s)
            const { direccion: dir, comuna: com } = splitDireccionComuna(dirComuna)
            const direccionFinal = dir || dirComuna
            const comunaFinal = com || getFirstBodyValue(vals, ['COMUNA']) || s.comuna || ''
            final.direccion_comuna = direccionFinal + (direccionFinal && comunaFinal ? ' / ' : '') + comunaFinal
            if (!final.direccion_comuna && s.direccion_comuna) final.direccion_comuna = s.direccion_comuna

            // Respetar el campo del JSON de Conexión: "Cliente".
            // No priorizar "NOMBRE CLIENTE" porque puede traer otro valor (p.ej. Terracon).
            const cliBody = getSupervisorClienteFromVals(vals, s)
            const cli = String(cliBody || '').trim() || '-'
            const fon = getFirstBodyValue(vals, ['TELEFONO CLIENTE', 'FONOS', 'FONO', 'TELEFONO']) || ''
            const obs = getFirstBodyValue(vals, ['OBSERVACIÓN', 'OBSERVACION']) || ''
            const rut = getFirstBodyValue(vals, ['RUT']) || ''
            final.cliente = cli
            final.fonos = fon
            final.observacion = obs
            final.rut = rut
            final.cliente_fonos_obs = cli + (fon ? ' - F: ' + fon : '') + (obs ? ' - Obs: ' + obs : '')
            if (!final.cliente_fonos_obs && s.cliente_fonos_obs) {
              final.cliente_fonos_obs = s.cliente_fonos_obs
            }
            final.valores = vals
            final.fotos = extractFotos(detail)
          }
          if (!final.url_doc_registro && final.id_doc) {
            final.url_doc_registro = await resolveDocUrlByIdDoc(final.id_doc)
          }
          if (debugPdf) {
            console.log('[PDF-DEBUG][AsignacionesPDF]', {
              id_survey: s.id_survey,
              id_doc: final.id_doc,
              url_doc_registro: final.url_doc_registro
            })
          }
        } catch (e) {
          console.error('Error detail', s.id_survey, e)
        }
        return final
      })
    )

    // Para columnas operativas del técnico: si el padre no trae dato fresco,
    // reflejar lo ejecutado en el/los survey(s) hijo(s).
    const hijosPorPadre = new Map()
    for (const row of (enriched || [])) {
      const idPadre = Number(row?.id_survey_padre || 0)
      if (!idPadre) continue
      if (!hijosPorPadre.has(idPadre)) hijosPorPadre.set(idPadre, [])
      hijosPorPadre.get(idPadre).push(row)
    }
    for (const row of (enriched || [])) {
      if (Number(row?.id_survey_padre || 0)) continue
      const actual = String(row?.hora_llegada_tecnico || '').trim()
      const hijos = hijosPorPadre.get(Number(row?.id_survey || 0)) || []
      if (isInvalidEstadoValue(getEstadoInternoConexion(row))) {
        const hijoConEstado = hijos.find(h => !isInvalidEstadoValue(getEstadoInternoConexion(h)))
        if (hijoConEstado) {
          const estadoHijo = getEstadoInternoConexion(hijoConEstado)
          row.estado_conexion = estadoHijo
          row.estado_conexion_detalle = estadoHijo
        }
      }
      if (isInvalidHoraValue(actual)) {
        const hijoConDato = hijos.find(h => !isInvalidHoraValue(h?.hora_llegada_tecnico))
        if (hijoConDato) row.hora_llegada_tecnico = String(hijoConDato.hora_llegada_tecnico || '').trim()
      }

      const evidenciaPatch = buildEvidenciaResumenPatchDesdeHijos(hijos)
      row.charla = evidenciaPatch.charla || ''
      row.ats = evidenciaPatch.ats || ''
      row.t_altura = evidenciaPatch.t_altura || ''
    }

    const idsEquiv = Array.isArray(filtroCarga.value?.ids_load_equivalentes) ? filtroCarga.value.ids_load_equivalentes : []
    const aplicaMergeIncremental = hayFiltroCargaEspecifico && idsEquiv.length > 1
    const enrichedDepurado = aplicaMergeIncremental ? dedupeIncrementalByBusinessKey(enriched) : enriched
    const enrichedFiltrado = (Array.isArray(enrichedDepurado) ? enrichedDepurado : []).filter(cumpleFiltroFechaPlan)
    tablaFull.value = [...enrichedFiltrado]
    tabla.value = tablaFull.value
  } catch (error) {
    console.error('❌ Error al obtener survey:', error)
    tabla.value = []
    tablaFull.value = []
  } finally {
    cargandoAsignaciones.value = false
  }
}

async function getSurvey(idSurvey) {
  const response = await apiAxios.get(`/servicio/leanglobal/procesosSurveyDetail?id_survey=${idSurvey}`)
  console.log('DETAIL RAW:', response.data)
  console.log('DETAIL ROW:', Array.isArray(response.data) ? response.data?.[0] : response.data?.surveyDetail?.[0])
  return response.data
}

function extraerDocRegistro(detail) {
  const row = Array.isArray(detail) ? detail?.[0] : detail?.surveyDetail?.[0]
  const raw = row?.body_exec ?? row?.json_exec
  const obj = typeof raw === 'string' ? JSON.parse(raw) : raw
  const segmentos = obj?.segmentos ?? []

  let archivos = []
  for (const seg of segmentos) {
    for (const a of (seg?.attributes ?? [])) {
      if (a?.type === 'fileUpload' && Array.isArray(a?.archivos) && a.archivos.length) {
        archivos = a.archivos
      }
    }
  }

  const file = archivos?.at(-1) ?? null
  return { url_doc_registro: file?.url ?? '' }
}

function extractFotos(detail) {
  const fotos = []
  const row = Array.isArray(detail) ? detail?.[0] : detail?.surveyDetail?.[0]
  const raw = row?.body_exec || row?.json_exec
  if (!raw) return []

  const obj = typeof raw === 'string' ? JSON.parse(raw) : raw

  if (obj?.segmentos) {
    for (const seg of obj.segmentos) {
      for (const attr of (seg.attributes || [])) {
        if (attr.type === 'photoCapture' && Array.isArray(attr.galeria)) {
          fotos.push(...attr.galeria)
        }
        if (attr.type === 'registroEventos' && Array.isArray(attr.body)) {
          for (const ev of attr.body) {
            if (Array.isArray(ev.galeria)) fotos.push(...ev.galeria)
          }
        }
      }
    }
  }
  return fotos
}

function buildIncrementalBusinessKey(row) {
  const idPadre = Number(row?.id_survey_padre || 0)
  const orden = String(row?.orden || '').trim()
  const ic = String(row?.ic_sap_mg || '').trim()
  const proyecto = normalizeLoadName(row?.proyecto || '')
  const direccion = normalizeLoadName(row?.direccion_comuna || '')

  if (idPadre > 0) {
    const plantilla = String(row?.id_template || row?.name_template_srv || '').trim()
    const baseHijo = orden || ic || String(row?.id_survey || '')
    return `H|${idPadre}|${plantilla}|${baseHijo}`
  }

  if (orden) return `P|ORD|${orden}`
  if (ic && direccion) return `P|ICDIR|${ic}|${direccion}`
  if (ic && proyecto) return `P|ICPROY|${ic}|${proyecto}`
  return `P|ID|${Number(row?.id_survey || 0)}`
}

function dedupeIncrementalByBusinessKey(rows) {
  const list = Array.isArray(rows) ? rows : []
  const byKey = new Map()

  for (const row of list) {
    const key = buildIncrementalBusinessKey(row)
    const current = byKey.get(key)
    if (!current) {
      byKey.set(key, row)
      continue
    }
    const idCurrent = Number(current?.id_survey || 0)
    const idNext = Number(row?.id_survey || 0)
    if (idNext >= idCurrent) byKey.set(key, row)
  }

  return Array.from(byKey.values()).sort((a, b) => Number(b?.id_survey || 0) - Number(a?.id_survey || 0))
}

function getBodyValues(raw) {
  if (!raw) return {}
  const res = {}
  try {
    const obj = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (obj?.segmentos) {
      for (const seg of obj.segmentos) {
        for (const attr of (seg.attributes || [])) {
          if (isArtefactosCheckAttr(attr)) {
            for (const key of ['CONVERS ARTEFAC', 'ARTEFAC']) {
              const group = getSupervisorArtefactosGroupFromAttr(attr, key)
              if (!group) continue
              const value = JSON.stringify(group)
              res[key] = value
              const keyNorm = normalizeBodyValueKey(key)
              if (keyNorm && res[keyNorm] === undefined) res[keyNorm] = value
            }
          }
          if (attr.label) {
            const label = String(attr.label).trim()
            const key = label.toUpperCase()
            const keyNorm = normalizeBodyValueKey(label)
            let val = attr.value
            if (val === undefined || val === null) val = attr.answer
            if (val === undefined || val === null) val = attr.respuesta
            if (val === undefined || val === null) val = attr?.values?.selected
            if (val === undefined || val === null) val = attr.default
            const strVal = val !== undefined && val !== null ? String(val) : ''
            res[key] = strVal
            if (keyNorm && res[keyNorm] === undefined) res[keyNorm] = strVal
          }
        }
      }
    }
  } catch (e) { }
  for (const info of informacionExtra) {
    if (!info?.key || res[info.key] !== undefined) continue
    const normalizedKey = normalizeBodyValueKey(info.key)
    if (normalizedKey && res[normalizedKey] !== undefined) res[info.key] = res[normalizedKey]
  }
  return res
}

function normalizeBodyValueKey(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]+/gi, ' ')
    .trim()
    .toUpperCase()
}

function getFirstBodyValue(vals, keys = []) {
  for (const k of keys) {
    const directKey = String(k || '').trim().toUpperCase()
    const normalizedKey = normalizeBodyValueKey(k)
    const v = vals?.[directKey] ?? vals?.[normalizedKey]
    if (v !== undefined && v !== null && String(v).trim() !== '') return String(v)
  }
  return ''
}

function getSupervisorProyectoFromVals(vals, row = {}) {
  const direct = getFirstBodyValue(vals, [
    'PROYECTO',
    'NOMBRE PROYECTO',
    'NOMBRE_PROYECTO',
    'PROYECTO CLIENTE',
    'PROYECTO / CLIENTE',
    'PROYECTO/CLIENTE'
  ])
  if (direct) return String(direct).split(/\s+\/\s+/)[0].trim()
  return String(row?.nombre_proyecto || row?.proyecto || '').trim()
}

function getSupervisorDireccionComunaFromVals(vals, row = {}) {
  const direccion = getFirstBodyValue(vals, [
    'DIRECCIÓN',
    'DIRECCION',
    'DIRECCION CLIENTE',
    'DIRECCIÓN CLIENTE',
    'DIRECCION / CLIENTE',
    'DIRECCIÓN / CLIENTE',
    'DIRECCION Y COMUNA',
    'DIRECCIÓN Y COMUNA',
    'DIRECCION / COMUNA',
    'DIRECCIÓN / COMUNA',
    'DIRECCION COMUNA',
    'DIRECCIÓN COMUNA'
  ])
  const comuna = getFirstBodyValue(vals, ['COMUNA'])
  if (direccion && comuna && !String(direccion).includes('/')) return `${direccion} / ${comuna}`
  if (direccion) return direccion
  return String(row?.direccion_comuna || row?.direccion || '').trim()
}

function getSupervisorClienteFromVals(vals, row = {}) {
  const cliente = getFirstBodyValue(vals, [
    'CLIENTE',
    'NOMBRE CLIENTE',
    'NOMBRE_CLIENTE',
    'CLIENTE / OBS',
    'CLIENTE OBS'
  ])
  return String(cliente || row?.cliente || '').trim()
}

function hasSiValue(value) {
  const s = String(value ?? '').trim()
  if (!s) return false
  const normalized = s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase()
  return !['-', '—', 'NO', 'N/A', 'NA', 'NULL', 'UNDEFINED', 'FALSE', '0'].includes(normalized)
}

function formatSiODash(value) {
  return hasSiValue(value) ? 'SI' : '—'
}

function buildEvidenciaResumenPatchDesdeHijos(hijos = []) {
  const patch = {}
  const resumenCharla = buildResumenEvidenciaDesdeHijos(hijos, 'CHARLA')
  const resumenAts = buildResumenEvidenciaDesdeHijos(hijos, 'ATS')
  const resumenTAltura = buildResumenEvidenciaDesdeHijos(hijos, 'T. ALTURA')
  if (resumenTieneFotos(resumenCharla)) patch.charla = 'SI'
  if (resumenTieneFotos(resumenAts)) patch.ats = 'SI'
  if (resumenTieneFotos(resumenTAltura)) patch.t_altura = 'SI'
  return patch
}

function buildEvidenciaResumenPatchDesdeBody(rawBody) {
  const patch = {}
  const evCharla = extractAttrEvidenciaByLabel(rawBody, 'CHARLA')
  const evAts = extractAttrEvidenciaByLabel(rawBody, 'ATS')
  const evTAltura = extractAttrEvidenciaByLabel(rawBody, 'T. ALTURA')

  const toResumen = (ev) => ev && ev.fotosCount > 0 ? 'SI' : ''

  const resumenCharla = toResumen(evCharla)
  const resumenAts = toResumen(evAts)
  const resumenTAltura = toResumen(evTAltura)
  if (resumenCharla) patch.charla = resumenCharla
  if (resumenAts) patch.ats = resumenAts
  if (resumenTAltura) patch.t_altura = resumenTAltura
  return patch
}

function resumenTieneFotos(value) {
  return /\b[1-9]\d*\s*foto\(s\)/i.test(String(value || ''))
}

function syncHoraLlegadaPadreDesdeHijos(idPadre) {
  const pid = Number(idPadre || 0)
  if (!pid) return

  const parent = (tablaFull.value || []).find(r => Number(r?.id_survey || 0) === pid && !Number(r?.id_survey_padre || 0))
  if (!parent) return

  const hijos = hijosByPadre.value.get(pid) || []
  const hijoConHora = hijos.find(h => !isInvalidHoraValue(h?.hora_llegada_tecnico))
  const hora = String(hijoConHora?.hora_llegada_tecnico || '').trim()
  if (isInvalidHoraValue(hora)) return

  const horaPadreActual = String(parent?.hora_llegada_tecnico || '').trim()
  if (horaPadreActual === hora) return
  actualizarFilaTablaLocal(pid, { hora_llegada_tecnico: hora })
}

function syncEvidenciaPadreDesdeHijos(idPadre) {
  const pid = Number(idPadre || 0)
  if (!pid) return

  const parent = (tablaFull.value || []).find(r => Number(r?.id_survey || 0) === pid && !Number(r?.id_survey_padre || 0))
  if (!parent) return

  const hijos = hijosByPadre.value.get(pid) || []
  const patch = buildEvidenciaResumenPatchDesdeHijos(hijos)
  if (!Object.keys(patch).length) return

  actualizarFilaTablaLocal(pid, patch)
}

async function refreshHoraLlegadaDesdeDetalleEnCaliente(idSurvey) {
  const sid = Number(idSurvey || 0)
  if (!sid) return false

  const row = (tablaFull.value || []).find(r => Number(r?.id_survey || 0) === sid)
  if (!row) return false

  try {
    const detail = await getSurveyDetailLocal(sid)
    const raw = detail?.body_exec || detail?.json_exec
    const hora = extractHoraLlegadaFromBody(raw)
    const idPadre = Number(row?.id_survey_padre || 0)
    if (!isInvalidHoraValue(hora)) {
      actualizarFilaTablaLocal(sid, {
        hora_llegada_tecnico: String(hora).trim(),
        ...buildEvidenciaResumenPatchDesdeBody(raw)
      })
    } else {
      const evidenciaPatch = buildEvidenciaResumenPatchDesdeBody(raw)
      if (Object.keys(evidenciaPatch).length) actualizarFilaTablaLocal(sid, evidenciaPatch)
    }
    if (idPadre) {
      syncHoraLlegadaPadreDesdeHijos(idPadre)
      syncEvidenciaPadreDesdeHijos(idPadre)
    }
    return !isInvalidHoraValue(hora) || Object.keys(buildEvidenciaResumenPatchDesdeBody(raw)).length > 0
  } catch (e) {
    console.error('Error refrescando hora llegada en caliente:', sid, e)
    return false
  }
}

function normalizeRoleText(v) {
  return String(v || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase()
}

function isValorServicioLabel(label) {
  const n = normalizeRoleText(label).replace(/[^A-Z0-9]/g, '')
  return n === 'VALORSERVICIO' || n === 'VALORSERVCIO'
}

function isTipoEmpalmeGasificarLabel(label) {
  const n = normalizeRoleText(label).replace(/[^A-Z0-9]/g, '')
  return n === 'TIPOEMPALMEGASIFICAR'
}

function isOrdenLabel(label) {
  const n = normalizeRoleText(label).replace(/[^A-Z0-9]/g, '')
  return n === 'ORDEN' || n === 'NMROORDENMG' || n === 'NROORDENMG'
}

function isIcSapLabel(label) {
  const n = normalizeRoleText(label).replace(/[^A-Z0-9]/g, '')
  return n === 'ICSAP' || n === 'ICSAPMG'
}

function isGioLabel(label) {
  const n = normalizeRoleText(label).replace(/[^A-Z0-9]/g, '')
  return n === 'GIO'
}

function isProyectoLabel(label) {
  const n = normalizeRoleText(label).replace(/[^A-Z0-9]/g, '')
  return n === 'PROYECTO' || n === 'NOMBREPROYECTO' || n === 'PROYECTOCLIENTE'
}

function isDireccionLabel(label) {
  const n = normalizeRoleText(label).replace(/[^A-Z0-9]/g, '')
  return n === 'DIRECCION' ||
    n === 'DIRECCIONCLIENTE' ||
    n === 'DIRECCIONCOMUNA' ||
    n === 'DIRECCIONYCOMUNA'
}

function isDireccionComunaCombinedLabel(label) {
  const n = normalizeRoleText(label).replace(/[^A-Z0-9]/g, '')
  return n === 'DIRECCIONCOMUNA' || n === 'DIRECCIONYCOMUNA'
}

function isEstadoConexionLabel(label) {
  const n = normalizeRoleText(label).replace(/[^A-Z0-9]/g, '')
  return n === 'ESTADO' || n === 'ESTADOCONEXION'
}

function isComunaLabel(label) {
  const n = normalizeRoleText(label).replace(/[^A-Z0-9]/g, '')
  return n === 'COMUNA'
}

function isClienteNombreLabel(label) {
  const n = normalizeRoleText(label).replace(/[^A-Z0-9]/g, '')
  return n === 'CLIENTE' || n === 'NOMBRECLIENTE' || n === 'CLIENTEOBS'
}

function isClienteTelefonoLabel(label) {
  const n = normalizeRoleText(label).replace(/[^A-Z0-9]/g, '')
  return n === 'FONOS' || n === 'FONO' || n === 'TELEFONO' || n === 'TELEFONOCLIENTE'
}

function setBodyAttrValue(attr, value) {
  const val = value ?? ''
  attr.default = val
  attr.value = val
  attr.answer = val
  attr.respuesta = val
  if (attr.values && typeof attr.values === 'object' && Object.prototype.hasOwnProperty.call(attr.values, 'selected')) {
    attr.values.selected = val
  }
}

function ensureEditableBodyExec(target) {
  const parsed = parseBodyExecLocal(target?.body_exec || target?.json_exec)
  if (parsed && typeof parsed === 'object') {
    target.body_exec = parsed
  } else if (!target?.body_exec || typeof target.body_exec !== 'object') {
    target.body_exec = { segmentos: [] }
  }
  if (!Array.isArray(target.body_exec.segmentos)) target.body_exec.segmentos = []
  return target.body_exec
}

function ensureBodyExecSegmentos(padre) {
  ensureEditableBodyExec(padre)
  let seg = padre.body_exec.segmentos.find(s => Array.isArray(s?.attributes))
  if (!seg) {
    seg = { label: 'General', attributes: [] }
    padre.body_exec.segmentos.push(seg)
  }
  return seg
}

function ensureBodyExecSegmentByLabel(padre, label) {
  ensureEditableBodyExec(padre)
  const labelNorm = normalizeBodyValueKey(label)
  let seg = padre.body_exec.segmentos.find(s => normalizeBodyValueKey(s?.label) === labelNorm)
  if (!seg) {
    seg = { label, attributes: [] }
    padre.body_exec.segmentos.push(seg)
  }
  if (!Array.isArray(seg.attributes)) seg.attributes = []
  return seg
}

function setOrCreateAttrValue(padre, matcher, createLabel, value) {
  let found = false
  for (const seg of padre.body_exec.segmentos) {
    if (!Array.isArray(seg?.attributes)) continue
    for (const attr of seg.attributes) {
      if (!matcher(attr?.label)) continue
      setBodyAttrValue(attr, value)
      found = true
    }
  }
  if (!found) {
    const segTarget = ensureBodyExecSegmentos(padre)
    segTarget.attributes.push({
      type: 'textField',
      label: createLabel,
      default: value ?? '',
      value: value ?? '',
      answer: value ?? '',
      respuesta: value ?? ''
    })
  }
}

function setDireccionComunaAttrValues(padre, direccion, comuna, direccionComuna) {
  let foundDireccion = false
  for (const seg of padre.body_exec.segmentos) {
    if (!Array.isArray(seg?.attributes)) continue
    for (const attr of seg.attributes) {
      if (!isDireccionLabel(attr?.label)) continue
      setBodyAttrValue(attr, isDireccionComunaCombinedLabel(attr?.label) ? direccionComuna : direccion)
      foundDireccion = true
    }
  }
  if (!foundDireccion) {
    const segTarget = ensureBodyExecSegmentos(padre)
    segTarget.attributes.push({
      type: 'textField',
      label: 'DIRECCIÓN',
      default: direccion ?? '',
      value: direccion ?? '',
      answer: direccion ?? '',
      respuesta: direccion ?? ''
    })
  }
  setOrCreateAttrValue(padre, isComunaLabel, 'COMUNA', comuna)
}

function setEstadoInternoConexionBody(target, estado) {
  ensureEditableBodyExec(target)
  ensureBodyExecSegmentos(target)

  const value = String(estado ?? '').trim()
  let encontrado = false

  for (const seg of target.body_exec.segmentos) {
    if (!Array.isArray(seg?.attributes)) continue
    for (const attr of seg.attributes) {
      if (!isEstadoConexionLabel(attr?.label)) continue
      setBodyAttrValue(attr, value)
      encontrado = true
    }
  }

  if (!encontrado) {
    const segTarget = ensureBodyExecSegmentos(target)
    segTarget.attributes.push({
      type: 'select',
      label: 'ESTADO CONEXION',
      default: value,
      value,
      answer: value,
      respuesta: value
    })
  }
}

function getBodyAttrLabelMatchesKey(label, key) {
  const labelNorm = normalizeBodyValueKey(label)
  const keyNorm = normalizeBodyValueKey(key)
  return !!labelNorm && !!keyNorm && labelNorm === keyNorm
}

function splitDireccionComuna(value) {
  const raw = String(value ?? '').trim()
  if (!raw) return { direccion: '', comuna: '' }
  const parts = raw.split(/\s*\/\s*/)
  if (parts.length < 2) return { direccion: raw, comuna: '' }
  return {
    direccion: parts[0].trim(),
    comuna: parts.slice(1).join(' / ').trim()
  }
}

function normalizeTipoEmpalmeGasificarValue(value) {
  const n = normalizeRoleText(value)
  if (!n) return ''
  if (n.includes('GASIFICAR')) return 'Gasificar'
  if (n.includes('EMPALME')) return 'Empalme Existente'
  return ''
}

function getValorServicioText(survey) {
  if (!survey) return ''
  const direct = survey?.valor_servicio
  if (direct !== undefined && direct !== null && String(direct).trim() !== '') return String(direct)

  const vals = survey?.valores || {}
  for (const [key, value] of Object.entries(vals)) {
    if (isValorServicioLabel(key) && value !== undefined && value !== null && String(value).trim() !== '') {
      return String(value)
    }
  }
  return ''
}

function getTipoEmpalmeGasificarText(survey) {
  if (!survey) return ''
  const direct = normalizeTipoEmpalmeGasificarValue(survey?.tipoEmpalmeGasificar)
  if (direct) return direct

  const vals = survey?.valores || {}
  for (const [key, value] of Object.entries(vals)) {
    if (!isTipoEmpalmeGasificarLabel(key)) continue
    const normalized = normalizeTipoEmpalmeGasificarValue(value)
    if (normalized) return normalized
  }
  return ''
}

const tipoEmpalmeGasificarOptions = ['Empalme Existente', 'Gasificar']

function formatTipo(v) {
  const s = String(v ?? '').trim()
  if (!s) return ''
  return s
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase())
}

function isSysdateToken(v) {
  return /sysdatehhmm|sysdate/i.test(String(v ?? '').trim())
}

function pad2(n) {
  return String(n).padStart(2, '0')
}

function formatDateDisplay(raw) {
  const s = String(raw ?? '').trim()
  if (!s || isSysdateToken(s)) return '-'

  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return `${iso[3]}-${iso[2]}-${iso[1]}`

  const dmy = s.match(/^(\d{2})[/-](\d{2})[/-](\d{4})/)
  if (dmy) return `${dmy[1]}-${dmy[2]}-${dmy[3]}`

  const dt = new Date(s)
  if (!Number.isNaN(dt.getTime())) {
    return `${pad2(dt.getDate())}-${pad2(dt.getMonth() + 1)}-${dt.getFullYear()}`
  }
  return s
}

function formatDateTimeDisplay(raw) {
  const s = String(raw ?? '').trim()
  if (!s || isSysdateToken(s)) return '-'

  const isoDt = s.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})/)
  if (isoDt) return `${isoDt[3]}-${isoDt[2]}-${isoDt[1]} ${isoDt[4]}:${isoDt[5]}`

  const dmyDt = s.match(/^(\d{2})[/-](\d{2})[/-](\d{4})[T\s](\d{2}):(\d{2})/)
  if (dmyDt) return `${dmyDt[1]}-${dmyDt[2]}-${dmyDt[3]} ${dmyDt[4]}:${dmyDt[5]}`

  return formatDateDisplay(s)
}

function formatGenericDisplay(raw) {
  const s = String(raw ?? '').trim()
  if (!s || isSysdateToken(s)) return '-'
  const hasDate = /\d{4}-\d{2}-\d{2}|\d{2}[/-]\d{2}[/-]\d{4}/.test(s)
  return hasDate ? formatDateTimeDisplay(s) : s
}

function getUserNameById(idUser) {
  const id = Number(idUser || 0)
  if (!id) return ''
  const u = (usuarios.value ?? []).find(x => Number(x.id_user) === id)
  return u?.nombre_user || ''
}

// =====================
// Flujo (igual)
// =====================
async function obtenerFlujosAprobacion(surveyId) {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/flujosAprobacion')
    const sid = Number(surveyId)
    const row = (data.datos || []).find(f => Number(f.id_survey) === sid)
    flujosAprobacion.value = row?.id_flow ?? null
  } catch (e) {
    console.error('flujosAprobacion error:', e)
    flujosAprobacion.value = null
  }
}

async function obtenerFlujosByIdSurvey(flowId) {
  try {
    if (!flowId) {
      flujos.value = []
      return
    }
    const { data } = await apiAxios.get(`/servicio/leanglobal/flujosAprobacionSteps?id_flow=${flowId}`)
    flujos.value = Array.isArray(data) ? data : []
    flujos.value.sort((a, b) => (a?.flow_tmpl_step_orden ?? Infinity) - (b?.flow_tmpl_step_orden ?? Infinity))
  } catch (e) {
    console.error('flujosByIdSurvey error:', e)
    flujos.value = []
  }
}

async function showModalAsignarFlujo(surveyId) {
  selectedSurveyIdSeleccionado.value = surveyId

  // Fallback: si no se cargaron usuarios por error/race, cargarlos antes de abrir.
  if (!usuariosFlow.value?.length) {
    await obtenerUsuarios()
  }

  await obtenerFlujosAprobacion(surveyId)
  await obtenerFlujosByIdSurvey(flujosAprobacion.value)
  await obtenerEquiposProyectos()

  flujos.value = (flujos.value ?? []).map(f => {
    const esEquipo = !!f.flag_equipo || /eq-?\s*fescol/i.test(String(f.name_rol || ''))
    const out = { ...f, flag_equipo: esEquipo }

    if (out.flag_equipo) {
      out.id_user = normalizaNum(f.id_user ?? f.id_equipo_proyecto ?? f._id_equipo_proyecto)
      out._id_equipo_proyecto = out.id_user
    } else {
      out.id_user = normalizaNum(f.id_user)
      out._id_equipo_proyecto = null
    }
    return out
  })

  prepararAsignaciones()
  showModalAsignar.value = true
}

function onClickAsignarFlujo(item) {
  if (!item.id_user) return
  showModalAsignarFlujo(item.id_survey)
}

function getEstadoActualPorSurveyId(surveyId) {
  const sid = Number(surveyId || 0)
  if (!sid) return ''

  const row = (tablaFull.value || []).find(r => Number(r?.id_survey || 0) === sid)
  if (row) {
    return getEstadoInternoConexion(row)
  }

  if (Number(detallePadre.value?.id_survey || 0) === sid) {
    return getEstadoInternoConexion(detallePadre.value)
  }

  const hijo = (detalleHijos.value || []).find(h => Number(h?.id_survey || 0) === sid)
  if (hijo) {
    return getEstadoInternoConexion(hijo)
  }

  return ''
}

function puedeMarcarAsignadoDesdeEstadoActual(surveyId) {
  const estadoActual = getEstadoActualPorSurveyId(surveyId)
  if (isInvalidEstadoValue(estadoActual)) return true
  const key = getEstadoUiKey(estadoActual)
  return key === 'CREADO' || key === 'ASIGNADO'
}

async function actualizarEstadoSurveyAsignado(surveyId) {
  if (!puedeMarcarAsignadoDesdeEstadoActual(surveyId)) {
    console.log('[Asignacion] Estado conservado al asignar usuarios:', {
      id_survey: surveyId,
      estado_actual: getEstadoActualPorSurveyId(surveyId)
    })
    return false
  }

  try {
    await apiAxios.post('/survey/UpdSurveyEstado', { id_survey: surveyId, estado_srv: 'Asignado' })
    return true
  } catch (e) {
    console.error('❌ Error al actualizar estado a Asignado:', e)
    return false
  }
}

async function asignarSurveyFlujo() {
  const cambios = flujos.value.filter(f => f._dirty)
  if (!cambios.length) {
    showModalAsignar.value = false
    return
  }

  const url = '/survey/UpdUserFlow'
  const reqs = cambios.map(f => apiAxios.put(url, {
    id_flow_stp: f.id_flow_stp,
    id_user_flujo: Number(f.id_user),
    flag_equipo: f.flag_equipo
  }))

  const urlNotf = '/notfqueue'
  const reqsNotf = cambios
    .filter(f => !f.flag_equipo && normalizaNum(f.id_user))
    .map(f => apiAxios.post(urlNotf, {
      id_user_target: Number(f.id_user),
      id_template: null,
      json_data: {
        id_survey: selectedSurveyIdSeleccionado.value,
        id_flow: flujosAprobacion.value,
        id_area: 8,
        tipo_notf: 'asignacion_firma',
        obs_notf: 'asignacion firma (conexion)'
      },
      channels: { channel: 'WEB' },
      estado: 'PENDING'
    }))

  const res = await Promise.allSettled(reqs)
  await Promise.allSettled(reqsNotf)

  let todoOk = true
  res.forEach((r, i) => {
    const f = cambios[i]
    if (r.status === 'fulfilled') {
      f._orig_id = Number(f.id_user)
      f._dirty = false
    } else {
      console.error('Falló step', f.id_flow_stp, r.reason)
      todoOk = false
    }
  })

  if (todoOk && selectedSurveyIdSeleccionado.value) {
    await actualizarEstadoSurveyAsignado(selectedSurveyIdSeleccionado.value)
  }

  showModalAsignar.value = false
}

// =====================
// UI helpers
// =====================
function colorIconoGrupo(item) {
  const key = getEstadoUiKey(getEstadoInternoConexion(item))
  if (key === 'CREADO') return 'indigo'
  if (key === 'ASIGNADO') return 'teal'
  if (key === 'APROBADO') return 'green'
  if (key === 'VERIFICACION') return 'orange'
  return 'grey'
}

function colorIconoEditar(item) {
  const key = getEstadoUiKey(getEstadoInternoConexion(item))
  if (key === 'CREADO') return 'indigo-darken-1'
  if (key === 'ASIGNADO') return 'teal-darken-1'
  if (key === 'APROBADO') return 'green-darken-1'
  if (key === 'VERIFICACION') return 'orange-darken-1'
  return 'blue-grey-darken-1'
}

function isPreCreado(item) {
  return false
}

function titleIconoGrupo(item) {
  return getEstadoUiLabel(getEstadoInternoConexion(item)) || 'Estado'
}

// =====================
// EDICIÓN EJECUCIÓN (CONEXION)
// =====================
const isSupervisor = computed(() => {
  const uid = Number(userDetailStore.userDetail?.id_user)
  if (!uid) return false

  const rolSup = (rolesFlujoList.value || []).find(r => r.name_rol === 'CNX-TRC-SUP')
  if (!rolSup) return false

  // check if user has role
  return (usuariosRolesList.value || []).some(ur =>
    Number(ur.id_user) === uid && Number(ur.id_rol) === Number(rolSup.id_rol)
  )
})

const canEditAsignacionSupervisor = computed(() => {
  return Number(userDetailStore.userDetail?.id_user || 0) > 0
})

const PADRE_INFO_EXTRA_EDITABLE_KEYS = new Set([
  'HR INICIO',
  'KIT CONVERSIÓN',
  'MEDIDOR/CAPSULA',
  'DUCTO',
  'RETIRO ARTEF',
  'RETIRO KIT'
])

const PADRE_INFO_EXTRA_GERENCIA_EDITABLE_KEYS = new Set([
  'MTS CAÑERÍA',
  'MTS CANERIA',
  'DÍA EJEC',
  'DIA EJEC'
])

const SUPERVISOR_ARTEFACTOS_ITEMS = ['Calefont', 'Caldera', 'Cocina', 'Encimera', 'Secadora', 'Otros']
const SUPERVISOR_ARTEFACTOS_LABELS = {
  ARTEFAC: 'Artefactos en Comodato',
  'CONVERS ARTEFAC': 'Conversión de Artefactos'
}

const canEditSupervisorArtefactos = computed(() => {
  return canEditAsignacionSupervisor.value && !isSupervisor.value
})

function getCurrentUserRoleNames() {
  const names = []
  if (Array.isArray(userDetailStore.userDetail?.rolesNames)) {
    names.push(...userDetailStore.userDetail.rolesNames)
  }

  try {
    const fromStorage = JSON.parse(localStorage.getItem('rolesNames') || '[]')
    if (Array.isArray(fromStorage)) names.push(...fromStorage)
  } catch {
    // ignore malformed localStorage roles
  }

  const uid = Number(userDetailStore.userDetail?.id_user || 0)
  if (uid) {
    const roleNameById = new Map(
      (rolesFlujoList.value || []).map(role => [
        Number(role?.id_rol || 0),
        String(role?.name_rol || '').trim()
      ])
    )
    for (const userRole of usuariosRolesList.value || []) {
      if (Number(userRole?.id_user || 0) !== uid) continue
      const roleName = roleNameById.get(Number(userRole?.id_rol || 0))
      if (roleName) names.push(roleName)
    }
  }

  return Array.from(new Set(
    names
      .map(role => String(role || '').trim().toUpperCase())
      .filter(Boolean)
  ))
}

const canEditGerenciaConexionFields = computed(() => {
  const user = userDetailStore.userDetail || {}
  const identityValues = [
    user?.codi_user,
    user?.username,
    user?.name_user,
    user?.email
  ].map(value => String(value || '').trim().toUpperCase())

  if (identityValues.some(value => value === 'XADMIN' || value.includes('XADMIN'))) return true

  const roles = getCurrentUserRoleNames()
  return roles.some(role =>
    role === 'CNX-TRC-GTE' ||
    role === 'CNX-TRC-ADMIN' ||
    role.includes('GERENTE') ||
    role.includes('ADMIN')
  )
})

function canEditPadreInfoExtra(key) {
  const k = String(key || '').trim().toUpperCase()
  if (PADRE_INFO_EXTRA_EDITABLE_KEYS.has(k)) return canEditAsignacionSupervisor.value
  if (PADRE_INFO_EXTRA_GERENCIA_EDITABLE_KEYS.has(k)) return canEditGerenciaConexionFields.value
  return false
}

function isSupervisorArtefactosKey(key) {
  const k = String(key || '').trim().toUpperCase()
  return k === 'ARTEFAC' || k === 'CONVERS ARTEFAC'
}

function hasPadreInfoExtraValue(padre, key) {
  const vals = padre?.valores || {}
  const k = String(key || '').trim().toUpperCase()
  const nk = normalizeBodyValueKey(k)
  return vals[k] !== undefined || (nk && vals[nk] !== undefined)
}

function getPadreInfoExtraValue(padre, key) {
  const vals = padre?.valores || {}
  const k = String(key || '').trim().toUpperCase()
  const nk = normalizeBodyValueKey(k)
  if (vals[k] !== undefined) return vals[k]
  if (nk && vals[nk] !== undefined) return vals[nk]
  return ''
}

function setPadreInfoExtraValue(padre, key, value) {
  if (!padre) return
  if (!padre.valores || typeof padre.valores !== 'object') padre.valores = {}
  const k = String(key || '').trim().toUpperCase()
  const nk = normalizeBodyValueKey(k)
  padre.valores[k] = value
  if (nk) padre.valores[nk] = value
}

function shouldShowPadreInfoExtra(padre, key) {
  const k = String(key || '').trim().toUpperCase()
  if (isSupervisorArtefactosKey(k)) return false
  if (!hasPadreInfoExtraValue(padre, k)) return false
  return true
}

function isSupervisorArtefactosRootKey(key) {
  return isSupervisorArtefactosKey(key)
}

function shouldRenderSupervisorArtefactosAfter(key) {
  return String(key || '').trim().toUpperCase() === 'RETIRO KIT'
}

function normalizeSupervisorArtefactoRespuesta(value) {
  const v = String(value ?? '').trim().toUpperCase()
  return v === 'SI' ? 'SI' : 'NO'
}

function normalizeSupervisorArtefactoCantidad(value) {
  if (value === '' || value === null || value === undefined) return ''
  const n = Number(value)
  if (!Number.isFinite(n) || n < 0) return ''
  return String(Math.trunc(n))
}

function buildDefaultSupervisorArtefactosItems() {
  return SUPERVISOR_ARTEFACTOS_ITEMS.map(label => ({
    label,
    respuesta: 'NO',
    cantidad: ''
  }))
}

function isArtefactosCheckAttr(attr) {
  return String(attr?.type || '').trim().toLowerCase() === 'artefactoscheck'
}

function buildSupervisorArtefactosGroup(key, items = []) {
  const k = String(key || '').trim().toUpperCase()
  const baseItems = Array.isArray(items) && items.length ? items : buildDefaultSupervisorArtefactosItems()
  return {
    label: SUPERVISOR_ARTEFACTOS_LABELS[k] || k,
    items: baseItems.map(item => ({
      label: String(item?.label || '').trim(),
      respuesta: normalizeSupervisorArtefactoRespuesta(item?.respuesta),
      cantidad: normalizeSupervisorArtefactoRespuesta(item?.respuesta) === 'SI'
        ? normalizeSupervisorArtefactoCantidad(item?.cantidad)
        : ''
    }))
  }
}

function getSupervisorArtefactosGroupFromAttr(attr, key) {
  if (!isArtefactosCheckAttr(attr) || !Array.isArray(attr?.groups)) return null
  const target = normalizeBodyValueKey(SUPERVISOR_ARTEFACTOS_LABELS[String(key || '').trim().toUpperCase()] || key)
  return attr.groups.find(group => normalizeBodyValueKey(group?.label) === target) || null
}

function getSupervisorArtefactosValueFromBody(padre, key) {
  const body = ensureEditableBodyExec(padre)
  for (const seg of body.segmentos || []) {
    if (!Array.isArray(seg?.attributes)) continue
    for (const attr of seg.attributes) {
      const group = getSupervisorArtefactosGroupFromAttr(attr, key)
      if (group) return JSON.stringify(group)
    }
  }
  return ''
}

function ensureSupervisorArtefactosCheckAttr(padre) {
  const body = ensureEditableBodyExec(padre)
  for (const seg of body.segmentos || []) {
    if (!Array.isArray(seg?.attributes)) continue
    const attr = seg.attributes.find(isArtefactosCheckAttr)
    if (attr) {
      if (!Array.isArray(attr.groups)) {
        attr.groups = [
          buildSupervisorArtefactosGroup('CONVERS ARTEFAC'),
          buildSupervisorArtefactosGroup('ARTEFAC')
        ]
      }
      return attr
    }
  }

  const segTarget = ensureBodyExecSegmentos(padre)
  const attr = {
    type: 'ArtefactosCheck',
    label: 'Bloque Artefactos Check',
    actualizar: false,
    groups: [
      buildSupervisorArtefactosGroup('CONVERS ARTEFAC'),
      buildSupervisorArtefactosGroup('ARTEFAC')
    ]
  }
  segTarget.attributes.push(attr)
  return attr
}

function syncSupervisorArtefactosCheckGroup(padre, key, items) {
  const k = String(key || '').trim().toUpperCase()
  const attr = ensureSupervisorArtefactosCheckAttr(padre)
  const nextGroup = buildSupervisorArtefactosGroup(k, items)
  const target = normalizeBodyValueKey(nextGroup.label)
  const groups = Array.isArray(attr.groups) ? [...attr.groups] : []
  const index = groups.findIndex(group => normalizeBodyValueKey(group?.label) === target)
  if (index >= 0) groups[index] = { ...groups[index], ...nextGroup }
  else groups.push(nextGroup)

  for (const defaultKey of ['CONVERS ARTEFAC', 'ARTEFAC']) {
    const labelNorm = normalizeBodyValueKey(SUPERVISOR_ARTEFACTOS_LABELS[defaultKey])
    if (!groups.some(group => normalizeBodyValueKey(group?.label) === labelNorm)) {
      groups.push(buildSupervisorArtefactosGroup(defaultKey))
    }
  }

  attr.groups = groups.sort((a, b) => {
    const order = ['CONVERSION DE ARTEFACTOS', 'ARTEFACTOS EN COMODATO']
    const ai = order.indexOf(normalizeBodyValueKey(a?.label))
    const bi = order.indexOf(normalizeBodyValueKey(b?.label))
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })
}

function parseSupervisorArtefactosValue(raw) {
  const fallback = buildDefaultSupervisorArtefactosItems()
  if (raw === undefined || raw === null || String(raw).trim() === '') return fallback

  let parsed = raw
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw)
    } catch {
      return fallback
    }
  }

  let items = []
  if (Array.isArray(parsed)) {
    items = parsed
  } else if (Array.isArray(parsed?.items)) {
    items = parsed.items
  } else if (Array.isArray(parsed?.groups)) {
    items = parsed.groups.flatMap(group => Array.isArray(group?.items) ? group.items : [])
  }

  const byLabel = new Map()
  for (const item of items) {
    const label = String(item?.label || item?.artefacto || item?.nombre || '').trim()
    if (!label) continue
    byLabel.set(normalizeBodyValueKey(label), item)
  }

  return SUPERVISOR_ARTEFACTOS_ITEMS.map(label => {
    const current = byLabel.get(normalizeBodyValueKey(label)) || {}
    return {
      label,
      respuesta: normalizeSupervisorArtefactoRespuesta(current?.respuesta ?? current?.valor ?? current?.si_no ?? current?.siNo),
      cantidad: normalizeSupervisorArtefactoCantidad(current?.cantidad)
    }
  })
}

function ensureSupervisorArtefactosState(padre, key) {
  if (!padre) return []
  if (!padre.artefactosSupervisor || typeof padre.artefactosSupervisor !== 'object') {
    padre.artefactosSupervisor = {}
  }
  const k = String(key || '').trim().toUpperCase()
  if (!Array.isArray(padre.artefactosSupervisor[k])) {
    padre.artefactosSupervisor[k] = parseSupervisorArtefactosValue(
      padre?.valores?.[k] ??
      padre?.valores?.[normalizeBodyValueKey(k)] ??
      getSupervisorArtefactosValueFromBody(padre, k)
    )
  }
  return padre.artefactosSupervisor[k]
}

function getSupervisorArtefactosItems(padre, key) {
  return ensureSupervisorArtefactosState(padre, key)
}

function getSupervisorArtefactosGroups(padre) {
  return ['CONVERS ARTEFAC', 'ARTEFAC'].map(key => ({
    key,
    label: SUPERVISOR_ARTEFACTOS_LABELS[key] || key,
    items: getSupervisorArtefactosItems(padre, key)
  }))
}

function onSupervisorArtefactoRespuestaChange(item, value) {
  item.respuesta = normalizeSupervisorArtefactoRespuesta(value)
  if (item.respuesta !== 'SI') item.cantidad = ''
}

function serializeSupervisorArtefactosValue(key, items = []) {
  const k = String(key || '').trim().toUpperCase()
  return JSON.stringify({
    label: SUPERVISOR_ARTEFACTOS_LABELS[k] || k,
    items: (items || []).map(item => ({
      label: String(item?.label || '').trim(),
      respuesta: normalizeSupervisorArtefactoRespuesta(item?.respuesta),
      cantidad: normalizeSupervisorArtefactoRespuesta(item?.respuesta) === 'SI'
        ? normalizeSupervisorArtefactoCantidad(item?.cantidad)
        : ''
    }))
  })
}

function ensureSupervisorAntecedentesAttr(padre) {
  if (!padre) return { type: 'registroEventos', label: 'Eventos', body: [] }
  const seg = ensureBodyExecSegmentByLabel(padre, 'Antecedentes Complementarios')
  let attr = seg.attributes.find(item =>
    isRegistroEventosTypeAttr(item) &&
    normalizeBodyValueKey(item?.label || 'Eventos') === normalizeBodyValueKey('Eventos')
  )

  if (!attr) {
    attr = {
      type: 'registroEventos',
      label: 'Eventos',
      body: []
    }
    seg.attributes.push(attr)
  }

  if (!Array.isArray(attr.body)) attr.body = []
  attr.body = attr.body.map(ev => ({
    comentarioInicial: ev?.comentarioInicial || '',
    hora: ev?.hora || '',
    observaciones: ev?.observaciones || '',
    ...ev,
    galeria: Array.isArray(ev?.galeria) ? ev.galeria.map(normalizePhotoItemForEdit) : []
  }))

  return attr
}

function findSupervisorAntecedentesAttr(padre) {
  const body = parseBodyExecLocal(padre?.body_exec || padre?.json_exec)
  const segmentos = Array.isArray(body?.segmentos) ? body.segmentos : []
  for (const seg of segmentos) {
    if (normalizeBodyValueKey(seg?.label) !== normalizeBodyValueKey('Antecedentes Complementarios')) continue
    const attrs = Array.isArray(seg?.attributes) ? seg.attributes : []
    const attr = attrs.find(item =>
      isRegistroEventosTypeAttr(item) &&
      normalizeBodyValueKey(item?.label || 'Eventos') === normalizeBodyValueKey('Eventos')
    )
    if (attr) return attr
  }
  return null
}

function getSupervisorAntecedentesEventos(padre) {
  const attr = findSupervisorAntecedentesAttr(padre)
  return Array.isArray(attr?.body) ? attr.body : []
}

function agregarEventoSupervisor(padre) {
  const attr = ensureSupervisorAntecedentesAttr(padre)
  agregarEventoRegistro(attr)
}

function eliminarEventoSupervisor(padre, idx) {
  const attr = ensureSupervisorAntecedentesAttr(padre)
  eliminarEventoRegistro(attr, idx)
}

async function guardarSupervisorAntecedentes(padre) {
  if (!padre?.id_survey) return
  ensureSupervisorAntecedentesAttr(padre)

  try {
    await apiAxios.put(`/survey/${padre.id_survey}`, {
      body_exec: JSON.stringify(padre.body_exec)
    })

    actualizarFilaTablaLocal(padre.id_survey, {
      body_exec: padre.body_exec
    })

    snackbar.value = {
      open: true,
      text: 'Antecedentes complementarios actualizados con éxito',
      color: 'success'
    }
  } catch (e) {
    console.error('Error guardando antecedentes complementarios SUP:', e)
    snackbar.value = {
      open: true,
      text: 'Error al guardar antecedentes complementarios',
      color: 'error'
    }
  }
}

const canManageValorServicio = computed(() => {
  const uid = Number(userDetailStore.userDetail?.id_user)
  if (!uid) return false

  const allowedRoleNames = new Set(['CNX-TRC-PLAN', 'CNX-TRC-ENAR', 'CNX-TRC-GTE'])
  const allowedRoleIds = new Set(
    (rolesFlujoList.value || [])
      .filter(r => allowedRoleNames.has(String(r?.name_rol || '').trim().toUpperCase()))
      .map(r => Number(r.id_rol))
      .filter(Number.isFinite)
  )
  if (!allowedRoleIds.size) return false

  return (usuariosRolesList.value || []).some(ur =>
    Number(ur.id_user) === uid && allowedRoleIds.has(Number(ur.id_rol))
  )
})

const canEditAsignacionDetalle = computed(() => {
  const uid = Number(userDetailStore.userDetail?.id_user || 0)
  if (!uid) return false

  const planRoleId = Number(
    (rolesFlujoList.value || []).find(
      r => String(r?.name_rol || '').trim().toUpperCase() === 'CNX-TRC-PLAN'
    )?.id_rol || 0
  )

  if (planRoleId > 0) {
    const hasPlanByApi = (usuariosRolesList.value || []).some(ur =>
      Number(ur?.id_user) === uid && Number(ur?.id_rol) === planRoleId
    )
    if (hasPlanByApi) return true
  }

  const fromStore = Array.isArray(userDetailStore.userDetail?.rolesNames)
    ? userDetailStore.userDetail.rolesNames
    : []
  if (fromStore.some(r => String(r || '').trim().toUpperCase() === 'CNX-TRC-PLAN')) return true

  try {
    const fromStorage = JSON.parse(localStorage.getItem('rolesNames') || '[]')
    return Array.isArray(fromStorage) &&
      fromStorage.some(r => String(r || '').trim().toUpperCase() === 'CNX-TRC-PLAN')
  } catch {
    return false
  }
})

function isHrInicio(attr) {
  return attr?.label && String(attr.label).trim().toLowerCase() === 'hr inicio'
}

async function guardarHrInicio(hijo, attr, nuevoVal) {
  if (!hijo?.id_survey) return
  ensureEditableBodyExec(hijo)

  // Actualizar valores en el objeto para consistencia local
  attr.default = nuevoVal
  attr.value = nuevoVal
  attr.respuesta = nuevoVal

  try {
    const payload = {
      body_exec: JSON.stringify(hijo.body_exec)
    }
    // Envio PUT al survey
    await apiAxios.put(`/survey/${hijo.id_survey}`, payload)
    await refrescarRegistroTrasGuardado(hijo.id_survey, { forceReloadTable: false })

    // Feedback visual
    snackbar.value = {
      open: true,
      text: 'Hr Inicio actualizado con éxito',
      color: 'success'
    }
  } catch (e) {
    console.error('Error actualizando Hr Inicio:', e)
    snackbar.value = {
      open: true,
      text: 'Error al actualizar Hr Inicio',
      color: 'error'
    }
  }
}

async function updatePadreHrInicio(padre, nuevoVal) {
  if (!padre?.id_survey) return
  ensureEditableBodyExec(padre)
  if (!padre.body_exec || !padre.body_exec.segmentos) return

  // Buscar el atributo "Hr Inicio" en el body_exec del padre
  let encontrado = false
  for (const seg of padre.body_exec.segmentos) {
    if (seg.attributes) {
      for (const attr of seg.attributes) {
        if (isHrInicio(attr)) {
          attr.default = nuevoVal
          attr.value = nuevoVal
          encontrado = true
        }
      }
    }
  }

  if (encontrado) {
    try {
      const payload = {
        body_exec: JSON.stringify(padre.body_exec)
      }
      await apiAxios.put(`/survey/${padre.id_survey}`, payload)

      snackbar.value = {
        open: true,
        text: 'Hr Inicio actualizado con éxito',
        color: 'success'
      }
    } catch (e) {
      console.error('Error actualizando Hr Inicio padre:', e)
      snackbar.value = {
        open: true,
        text: 'Error al actualizar Hr Inicio',
        color: 'error'
      }
    }
  } else {
    console.warn('No se encontró el atributo Hr Inicio en el body_exec del padre')
  }
}

async function updatePadreJsonAttr(padre, key, nuevoVal) {
  if (!padre?.id_survey) return
  ensureEditableBodyExec(padre)
  ensureBodyExecSegmentos(padre)

  const value = String(nuevoVal ?? '').trim()
  let encontrado = false

  for (const seg of padre.body_exec.segmentos) {
    if (!Array.isArray(seg?.attributes)) continue
    for (const attr of seg.attributes) {
      if (!getBodyAttrLabelMatchesKey(attr?.label, key)) continue
      setBodyAttrValue(attr, value)
      encontrado = true
    }
  }

  if (!encontrado) {
    const segTarget = ensureBodyExecSegmentos(padre)
    segTarget.attributes.push({
      type: 'textField',
      label: key,
      default: value,
      value,
      answer: value,
      respuesta: value
    })
  }

  try {
    await apiAxios.put(`/survey/${padre.id_survey}`, {
      body_exec: JSON.stringify(padre.body_exec)
    })

    if (!padre.valores || typeof padre.valores !== 'object') padre.valores = {}
    padre.valores[key] = value
    const keyNorm = normalizeBodyValueKey(key)
    if (keyNorm) padre.valores[keyNorm] = value

    actualizarFilaTablaLocal(padre.id_survey, {
      valores: { ...(padre.valores || {}) }
    })

    snackbar.value = {
      open: true,
      text: 'Dato SUP actualizado con éxito',
      color: 'success'
    }
  } catch (e) {
    console.error('Error actualizando dato SUP:', e)
    snackbar.value = {
      open: true,
      text: 'Error al actualizar dato SUP',
      color: 'error'
    }
  }
}

async function updatePadreArtefactosAttr(padre, key) {
  if (!canEditSupervisorArtefactos.value) return

  if (!padre?.id_survey) return
  const k = String(key || '').trim().toUpperCase()
  const items = ensureSupervisorArtefactosState(padre, k)
  syncSupervisorArtefactosCheckGroup(padre, k, items)
  const value = serializeSupervisorArtefactosValue(k, items)
  await updatePadreJsonAttr(padre, k, value)
}

async function updatePadreValorServicio(padre, nuevoVal) {
  if (!padre?.id_survey) return
  ensureEditableBodyExec(padre)
  if (!padre.body_exec || !padre.body_exec.segmentos) return

  let encontrado = false
  for (const seg of padre.body_exec.segmentos) {
    if (!seg?.attributes) continue
    for (const attr of seg.attributes) {
      if (!isValorServicioLabel(attr?.label)) continue
      attr.default = nuevoVal
      attr.value = nuevoVal
      attr.answer = nuevoVal
      attr.respuesta = nuevoVal
      encontrado = true
    }
  }

  if (!encontrado) {
    console.warn('No se encontro el atributo Valor Servicio en el body_exec del padre')
    snackbar.value = { open: true, text: 'No existe campo Valor Servicio en este formulario', color: 'warning' }
    return
  }

  try {
    await apiAxios.put(`/survey/${padre.id_survey}`, { body_exec: JSON.stringify(padre.body_exec) })
    padre.valor_servicio = nuevoVal
    if (!padre.valores) padre.valores = {}
    padre.valores['VALOR SERVICIO'] = nuevoVal
    padre.valores['VALOR SERVCIO'] = nuevoVal
    actualizarFilaTablaLocal(padre.id_survey, {
      valor_servicio: nuevoVal,
      valores: { ...(padre.valores || {}) }
    })

    snackbar.value = {
      open: true,
      text: 'Valor Servicio actualizado con exito',
      color: 'success'
    }
  } catch (e) {
    console.error('Error actualizando Valor Servicio:', e)
    snackbar.value = {
      open: true,
      text: 'Error al actualizar Valor Servicio',
      color: 'error'
    }
  }
}

async function updatePadreTipoEmpalmeGasificar(padre, nuevoVal) {
  if (!padre?.id_survey) return

  const nuevoValNorm = normalizeTipoEmpalmeGasificarValue(nuevoVal)
  if (!nuevoValNorm) {
    snackbar.value = { open: true, text: 'Seleccione Empalme Existente o Gasificar', color: 'warning' }
    return
  }

  ensureEditableBodyExec(padre)

  let encontrado = false
  for (const seg of padre.body_exec.segmentos) {
    if (!Array.isArray(seg?.attributes)) continue
    for (const attr of seg.attributes) {
      if (!isTipoEmpalmeGasificarLabel(attr?.label)) continue
      attr.default = nuevoValNorm
      attr.value = nuevoValNorm
      attr.answer = nuevoValNorm
      attr.respuesta = nuevoValNorm
      if (!attr.values || typeof attr.values !== 'object') attr.values = {}
      attr.values.selected = nuevoValNorm
      encontrado = true
    }
  }

  if (!encontrado) {
    let segTarget = padre.body_exec.segmentos.find(seg => Array.isArray(seg?.attributes))
    if (!segTarget) {
      segTarget = { label: 'General', attributes: [] }
      padre.body_exec.segmentos.push(segTarget)
    }
    segTarget.attributes.push({
      type: 'select',
      label: 'tipoEmpalmeGasificar',
      default: nuevoValNorm,
      value: nuevoValNorm,
      answer: nuevoValNorm,
      respuesta: nuevoValNorm,
      values: {
        selected: nuevoValNorm
      },
      options: [...tipoEmpalmeGasificarOptions]
    })
  }

  try {
    await apiAxios.put(`/survey/${padre.id_survey}`, { body_exec: JSON.stringify(padre.body_exec) })
    padre.tipoEmpalmeGasificar = nuevoValNorm
    if (!padre.valores) padre.valores = {}
    padre.valores.TIPOEMPALMEGASIFICAR = nuevoValNorm
    actualizarFilaTablaLocal(padre.id_survey, {
      tipoEmpalmeGasificar: nuevoValNorm,
      valores: { ...(padre.valores || {}) }
    })

    snackbar.value = {
      open: true,
      text: 'Tipo Empalme/Gasificar actualizado con exito',
      color: 'success'
    }
  } catch (e) {
    console.error('Error actualizando tipoEmpalmeGasificar:', e)
    snackbar.value = {
      open: true,
      text: 'Error al actualizar Tipo Empalme/Gasificar',
      color: 'error'
    }
  }
}

async function updatePadreDatosAsignacion(padre) {
  if (!padre?.id_survey) return
  await nextTick()

  const orden = String(padre?.orden ?? '').trim()
  const ic = String(padre?.ic_sap_mg ?? '').trim()
  const gio = String(padre?.gio ?? '').trim()
  const proyecto = String(padre?.proyecto ?? padre?.nombre_proyecto ?? '').trim()
  const direccionComuna = String(padre?.direccion_comuna ?? '').trim()
  const { direccion, comuna } = splitDireccionComuna(direccionComuna)
  const cliente = String(padre?.cliente ?? '').trim()
  const fono = String(padre?.fonos ?? '').trim()

  ensureEditableBodyExec(padre)
  ensureBodyExecSegmentos(padre)
  setOrCreateAttrValue(padre, isOrdenLabel, 'ORDEN', orden)
  setOrCreateAttrValue(padre, isIcSapLabel, 'IC SAP MG', ic)
  setOrCreateAttrValue(padre, isGioLabel, 'GIO', gio)
  setOrCreateAttrValue(padre, isProyectoLabel, 'PROYECTO', proyecto)
  setDireccionComunaAttrValues(padre, direccion, comuna, direccionComuna)
  setOrCreateAttrValue(padre, isClienteNombreLabel, 'NOMBRE CLIENTE', cliente)
  setOrCreateAttrValue(padre, isClienteTelefonoLabel, 'TELEFONO CLIENTE', fono)

  try {
    await apiAxios.put(`/survey/${padre.id_survey}`, { body_exec: JSON.stringify(padre.body_exec) })

    padre.orden = orden
    padre.ic_sap_mg = ic
    padre.gio = gio
    padre.proyecto = proyecto
    padre.nombre_proyecto = proyecto
    padre.direccion_comuna = direccionComuna
    padre.cliente = cliente
    padre.fonos = fono
    const obs = String(padre?.observacion ?? '').trim()
    padre.cliente_fonos_obs = cliente + (fono ? ` - F: ${fono}` : '') + (obs ? ` - Obs: ${obs}` : '')

    if (!padre.valores || typeof padre.valores !== 'object') padre.valores = {}
    padre.valores.ORDEN = orden
    padre.valores['IC SAP MG'] = ic
    padre.valores.GIO = gio
    padre.valores.PROYECTO = proyecto
    padre.valores['NOMBRE PROYECTO'] = proyecto
    padre.valores['DIRECCIÓN'] = direccion
    padre.valores.DIRECCION = direccion
    padre.valores.COMUNA = comuna
    padre.valores.CLIENTE = cliente
    padre.valores['NOMBRE CLIENTE'] = cliente
    padre.valores.FONOS = fono
    padre.valores['TELEFONO CLIENTE'] = fono
    actualizarFilaTablaLocal(padre.id_survey, {
      orden,
      ic_sap_mg: ic,
      gio,
      proyecto,
      nombre_proyecto: proyecto,
      direccion_comuna: direccionComuna,
      cliente,
      fonos: fono,
      cliente_fonos_obs: padre.cliente_fonos_obs,
      valores: { ...(padre.valores || {}) }
    })

    snackbar.value = {
      open: true,
      text: 'Datos de asignación actualizados con exito',
      color: 'success'
    }
  } catch (e) {
    console.error('Error actualizando datos de asignacion:', e)
    snackbar.value = {
      open: true,
      text: 'Error al actualizar datos de asignación',
      color: 'error'
    }
  }
}
const estadosPosibles = [
  'Conexión',
  'Trabajo Especial',
  'Ejecución',
  'Reactivación',
  'Prodoral',
  'En Continuación',
  'No se ejecuta',
  'Levantamiento Reclamo',
  'Ejecutado',
  'Plan CIIGE',
  'PD Terminado',
  'CCT',
  'Rechazos Serviu',
  'PD En continuación',
  'Contingencia',
  'Retiro de Empalme Existente',
  'Gasificación',
  'Evaluación Técnica',
  'Solo Empalme Existente',
  'Media Presión'
]

const dialogEmail = ref(false)
const emailData = ref({})

async function updateEstado(survey, nuevoEstado) {
  if (!survey?.id_survey) return

  try {
    // Lógica específica para Conexión
    if (nuevoEstado === 'Conexión') {
      /*
      // "Cuando el estado pasa a "Conexión", los supervisores deben completar la información durante la jornada.
      // Notificación a los Supervisores involucrados. Alerta 10:00 AM día siguiente si hay pendientes."
      // LOGICA DE ENVIO DE CORREO COMENTADA
      await apiAxios.post('/notificaciones/alertar_conexion', {
          id_survey: survey.id_survey,
          mensaje: 'Estado Conexión activado'
      })
      */

      // Seteamos datos para la simulación
      emailData.value = {
        de: survey.nombre_user || 'Usuario Actual',
        para: 'Freddy (Supervisor)',
        asunto: `Aviso de Conexión - Inspección #${survey.id_survey}`,
        cuerpo: 'Verificar Con Freddy',
        footer: 'Saludos Cordiales'
      }
      dialogEmail.value = true
      console.log('Logica Conexión: Alerta y notificaciones pendientes de activar.')
    }

    setEstadoInternoConexionBody(survey, nuevoEstado)
    await apiAxios.put(`/survey/${survey.id_survey}`, {
      body_exec: JSON.stringify(survey.body_exec)
    })

    // Sincronizar estado interno local para modal + tabla.
    survey.estado_srv = nuevoEstado
    survey.estado_conexion = nuevoEstado
    survey.estado_conexion_detalle = nuevoEstado
    if (!survey.valores || typeof survey.valores !== 'object') survey.valores = {}
    survey.valores.ESTADO = nuevoEstado
    survey.valores['ESTADO CONEXION'] = nuevoEstado
    survey.valores['ESTADO CONEXIÓN'] = nuevoEstado

    actualizarFilaTablaLocal(survey.id_survey, {
      estado_conexion: nuevoEstado,
      estado_conexion_detalle: nuevoEstado,
      body_exec: survey.body_exec,
      valores: { ...(survey.valores || {}) }
    })

    snackbar.value = {
      open: true,
      text: 'Guardado con éxito',
      color: 'success'
    }
  } catch (e) {
    console.error('Error actualizando estado:', e)
    snackbar.value = {
      open: true,
      text: 'Error al actualizar estado',
      color: 'error'
    }
  }
}

// =====================
// lifecycle
// =====================
onMounted(async () => {
  // Primero cargamos la data necesaria
  await Promise.all([
    fetchRolesFlujo(),
    fetchUsuariosRoles(),
    obtenerUsuarios(),
    obtenerEquiposProyectos()
  ])

  // LUEGO logueamos para verificar
  const uid = userDetailStore.userDetail?.id_user;
  console.log("=== DEBUG PERMISOS ===");
  console.log("Usuario ID (Store):", uid);

  const rolSup = rolesFlujoList.value.find(r => r.name_rol === 'CNX-TRC-SUP');
  console.log("Rol Objetivo 'CNX-TRC-SUP':", rolSup);

  if (rolSup && uid) {
    const userRoles = usuariosRolesList.value.filter(ur => Number(ur.id_user) === Number(uid));
    console.log("Roles asignados al usuario:", userRoles);

    const hasRole = userRoles.some(ur => Number(ur.id_rol) === Number(rolSup.id_rol));
    console.log("¿Tiene el rol de Supervisor?", hasRole);
  } else {
    console.log("Datos insuficientes para verificar rol (falta UID o Rol no encontrado)");
  }
  console.log("isSupervisor Computed Value:", isSupervisor.value);

  // Carga inicial de surveys
  await getSurveys()
  await nextTick()
  initTableScrollSync()
  recalcScrollWidth()

  if (middleScrollEl.value) {
    resizeObserver = new ResizeObserver(() => recalcScrollWidth())
    resizeObserver.observe(middleScrollEl.value)
  }
  window.addEventListener('resize', recalcScrollWidth)
})

onActivated(async () => {
  await getSurveys()
  await nextTick()
  recalcScrollWidth()
})

onBeforeUnmount(() => {
  if (middleScrollEl.value) {
    middleScrollEl.value.removeEventListener('scroll', onMiddleScroll)
  }
  if (resizeObserver) resizeObserver.disconnect()
  window.removeEventListener('resize', recalcScrollWidth)
})
</script>

<style scoped>
.pre-wrap {
  white-space: pre-line;
}

.icon-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.card-personalizados {
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, .08);
}

.card-title-personalizados {
  background: #1565c0;
  color: #fff;
  padding: 12px 14px;
  font-weight: 700;
  letter-spacing: .2px;
}

.chip-contador {
  background: rgba(255, 255, 255, .15);
  color: white;
  font-weight: 600;
}

/* ✅ SOLO la tabla principal */
.tabla-personalizados :deep(> .v-table__wrapper > table) {
  table-layout: fixed;
  width: 100%;
}

/* TABLA PADRE */
.tabla-personalizados :deep(thead th) {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #f5f7fb;
  color: rgba(0, 0, 0, .75);
  font-weight: 700;
  font-size: 11px;
  border-bottom: 1px solid rgba(0, 0, 0, .10);
  white-space: nowrap;
  padding: 4px 6px;
}

.tabla-personalizados :deep(> .v-table__wrapper > table > tbody > tr > td) {
  border-bottom: 1px solid rgba(0, 0, 0, .06);
  padding: 3px 6px;
  vertical-align: middle;
  font-size: 11px;
  line-height: 1.05rem;
}

.tabla-personalizados :deep(tbody tr:nth-child(even)) {
  background: rgba(0, 0, 0, .015);
}

.tabla-personalizados :deep(tbody tr:hover) {
  background: rgba(21, 101, 192, .06);
}

/* acciones */
.td-actions {
  width: 110px;
  white-space: nowrap;
  padding-right: 6px;
}

.pre-wrap {
  white-space: pre-line;
}

.icon-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.surface-card {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02) !important;
  overflow: hidden;
}

.estado-chip-filter {
  height: 20px !important;
  padding-inline: 6px !important;
  font-size: 10px !important;
}

.estado-chip-filter :deep(.v-chip__content) {
  line-height: 1 !important;
  gap: 2px !important;
}

.estado-chip-filter :deep(.v-icon) {
  font-size: 12px !important;
}

.estado-select-label {
  font-weight: 700;
}

.estado-option--conexion {
  color: #15803d !important;
  font-weight: 700;
}

.estado-option--no-se-ejecuta {
  color: #dc2626 !important;
  font-weight: 700;
}

.estado-option--trabajo-especial {
  color: #3949ab !important;
}

.estado-option--ejecucion {
  color: #ef6c00 !important;
}

.estado-option--reactivacion {
  color: #2e7d32 !important;
}

.estado-option--prodoral {
  color: #d84315 !important;
}

.estado-option--en-continuacion {
  color: #00838f !important;
}

.estado-option--media-presion {
  color: #455a64 !important;
}

:deep(.estado-option--conexion) {
  color: #15803d !important;
  font-weight: 700;
}

:deep(.estado-option--no-se-ejecuta) {
  color: #dc2626 !important;
  font-weight: 700;
}

:deep(.estado-option--trabajo-especial) {
  color: #3949ab !important;
}

:deep(.estado-option--ejecucion) {
  color: #ef6c00 !important;
}

:deep(.estado-option--reactivacion) {
  color: #2e7d32 !important;
}

:deep(.estado-option--prodoral) {
  color: #d84315 !important;
}

:deep(.estado-option--en-continuacion) {
  color: #00838f !important;
}

:deep(.estado-option--media-presion) {
  color: #455a64 !important;
}

.buscador-asignaciones {
  max-width: 520px;
}

.buscador-asignaciones :deep(.v-field) {
  min-height: 34px !important;
}

.buscador-asignaciones :deep(.v-field__input) {
  min-height: 34px !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  font-size: 12px !important;
}

.buscador-asignaciones :deep(.v-field__prepend-inner .v-icon),
.buscador-asignaciones :deep(.v-field__clearable .v-icon) {
  font-size: 16px !important;
}

.icon-box {
  width: 40px;
  height: 40px;
  background: #f1f5f9;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-primary-dark {
  color: #1e293b;
}

.selected-carga-banner {
  display: inline-flex;
  align-items: center;
  background: #dbeafe;
  color: #1e3a8a;
  border: 1px solid #93c5fd;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 0.82rem;
}

.supervisor-evidencia-subtitle {
  display: block !important;
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: initial !important;
}

.supervisor-artefactos-editor {
  max-width: 100%;
}

.supervisor-artefactos-card {
  border: 1px solid #1f2937 !important;
  border-radius: 12px !important;
  overflow: hidden;
}

.supervisor-artefactos-table {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.supervisor-artefactos-table :deep(th) {
  color: #475569;
  font-size: 0.74rem;
  font-weight: 700;
}

.supervisor-artefactos-table :deep(td) {
  font-size: 0.78rem;
}

.supervisor-artefactos-table :deep(.v-btn-toggle) {
  height: 32px;
}

.supervisor-artefactos-table :deep(.v-btn) {
  min-width: 42px;
}

.table-scroll-wrap {
  overflow: hidden;
}

.x-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  height: 16px;
}

.x-scroll-top {
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.x-scroll-bottom {
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

/* Tabla Sakai Custom Overrides (if any) */
.tabla-sakai :deep(.v-table__wrapper > table) {
  table-layout: auto;
  width: max-content;
  min-width: 100%;
  border-spacing: 0;
}

.tabla-sakai :deep(.v-table__wrapper) {
  overflow-x: hidden !important;
  overflow-y: auto !important;
}

.tabla-sakai :deep(thead th) {
  white-space: nowrap;
  padding: 0 6px !important;
  height: 25px !important;
  font-size: 10px !important;
  line-height: 1.1 !important;
}

.tabla-sakai :deep(tbody td) {
  padding: 0 6px !important;
  height: 22px !important;
  font-size: 10px !important;
  line-height: 1.1 !important;
}

/* Row Hover */
.row-hover:hover {
  background-color: #f8fafc !important;
}

/* Expander */
.th-expander {
  width: 32px;
  padding: 0 !important;
}

.td-expander {
  width: 32px;
  padding: 0 !important;
  text-align: center;
}

.desplegar-btn :deep(.v-icon) {
  font-size: 20px;
}

/* Children Box */
.children-box {
  background: transparent;
  padding: 0;
}

/* Anchos PADRE - Ajustados para ser compactos pero legibles */
.th-id {
  width: 90px;
}

/* Anchos Custom */
.th-contratista {
  width: 90px;
}

.th-tipo {
  width: 100px;
}

.th-certificadora {
  width: 95px;
}

.th-ic-sap {
  width: 100px;
}

.th-proyecto {
  width: 160px;
}

.th-gio {
  width: 100px;
}

.th-supervisor {
  width: 140px;
}

.th-charla {
  width: 95px;
}

.th-hora-llegada {
  width: 95px;
  text-align: center !important;
}

.td-hora-llegada {
  text-align: center !important;
}

.td-hora-llegada .cell-1line {
  text-align: center !important;
  width: 100%;
}

.th-tecnico {
  width: 160px;
}

.th-estado-cnx {
  width: 95px;
}

.th-valor-servicio {
  width: 120px;
}

.th-direccion {
  width: 180px;
}

.th-cliente-obs {
  width: 150px;
}

.th-usuario {
  width: 110px;
}

.th-estado {
  width: 80px;
}

.th-fecha {
  width: 85px;
}

.th-fotos {
  width: 32px;
}
.th-pdf {
  width: 40px;
}

.th-informe {
  width: 50px;
}

.th-acciones {
  width: 90px;
}

/* Anchos HIJOS */
.child-th-id {
  width: 50px;
}

.child-th-nombre {
  width: 150px;
}

.child-th-codigo {
  width: 60px;
}

.child-th-usuario {
  width: 120px;
}

.child-th-estado {
  width: 90px;
}

.child-th-fecha {
  width: 90px;
}

.child-th-acciones {
  width: 100px;
}

.cell-1line {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  display: block;
}

.cell-2lines {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  /* Standard property */
  -webkit-box-orient: vertical;
  line-height: 1.1rem;
  max-height: 2.3rem;
}

.blink-red-pencil {
  animation: blink-red-pencil 1s steps(2, start) infinite;
}

@keyframes blink-red-pencil {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.2;
  }
  100% {
    opacity: 1;
  }
}
</style>







