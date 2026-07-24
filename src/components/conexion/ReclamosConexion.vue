<template>
  <div class="pa-0 d-flex flex-column ga-4">
    <!-- Indicadores -->
    <ReclamosConexionIndicadores />

    <!-- Header -->
    <!-- Header -->
    <v-card
      class="surface-card pa-4"
      variant="outlined"
      style="border-color: #e2e8f0; border-radius: 12px; background-color: white;"
    >
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <div class="icon-box mr-3">
            <v-icon
              color="primary"
              icon="mdi-alert-decagram-outline"
            />
          </div>
          <div>
            <div class="text-subtitle-1 font-weight-bold text-primary-dark">
              Reclamos Conexiones
            </div>
            <div class="text-caption text-medium-emphasis">
              Gestion y creacion de reclamos
            </div>
          </div>
        </div>

        <div class="d-flex align-center ga-2">
          <v-text-field
            v-model="searchQuery"
            density="compact"
            variant="outlined"
            hide-details
            placeholder="Buscar..."
            prepend-inner-icon="mdi-magnify"
            bg-color="grey-lighten-5"
            style="width: 240px;"
            clearable
            class="mr-2"
          />

          <v-btn
            icon
            variant="text"
            color="primary"
            :loading="loadingData"
            @click="fetchReclamos"
          >
            <v-icon>mdi-refresh</v-icon>
          </v-btn>

          <v-divider
            vertical
            class="mx-2"
          />

          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            @click="abrirCrearReclamo"
          >
            Crear Reclamo
          </v-btn>
        </div>
      </div>
    </v-card>
    <!-- Tabla de Reclamos -->
    <!-- Tabla de Reclamos -->
    <v-card
      class="surface-card flex-grow-1 d-flex flex-column"
      variant="outlined"
      style="border-color: #e2e8f0; border-radius: 12px; background-color: white;"
    >
      <div class="pa-3 d-flex align-center justify-space-between border-b bg-grey-lighten-5">
        <v-row
          dense
          class="align-center w-100"
        >
          <v-col
            cols="12"
            md="8"
            class="d-flex align-center flex-wrap ga-2"
          >
            <span class="text-caption text-medium-emphasis font-weight-medium">Estados visibles:</span>

            <v-chip
              size="small"
              :color="isEstadoActivo('TODOS') ? 'primary' : 'grey-lighten-1'"
              :variant="isEstadoActivo('TODOS') ? 'flat' : 'outlined'"
              class="font-weight-bold"
              @click="toggleEstadoFiltro('TODOS')"
            >
              <v-icon
                start
                size="16"
              >
                {{ isEstadoActivo('TODOS') ? 'mdi-check-circle' : 'mdi-circle-outline' }}
              </v-icon>
              Todos
            </v-chip>

            <v-chip
              v-for="estado in estadosDisponibles"
              :key="`estado-chip-${estado}`"
              size="small"
              :color="isEstadoActivo(estado) ? 'primary' : 'grey-lighten-1'"
              :variant="isEstadoActivo(estado) ? 'flat' : 'outlined'"
              class="font-weight-bold"
              @click="toggleEstadoFiltro(estado)"
            >
              <v-icon
                start
                size="16"
              >
                {{ isEstadoActivo(estado) ? 'mdi-check-circle' : 'mdi-circle-outline' }}
              </v-icon>
              {{ estado }}
            </v-chip>
          </v-col>
          <v-col
            cols="12"
            md="4"
            class="d-flex justify-end"
          >
            <div class="text-caption text-medium-emphasis font-weight-medium">
              Ordenado por creación: <strong>ID Survey DESC</strong>
            </div>
          </v-col>
        </v-row>
      </div>

      <v-table
        class="tabla-sakai text-caption bg-transparent"
        :class="{ 'editing-mode': editingId }"
        :density="editingId ? 'default' : 'compact'"
        hover
      >
        <thead>
          <tr>
            <th
              class="bg-grey-lighten-5 text-grey-darken-2 font-weight-bold text-center border-b"
              style="width: 50px;"
            >
              <v-icon size="small">
                mdi-eye
              </v-icon>
            </th>
            <th class="bg-grey-lighten-5 text-grey-darken-2 font-weight-bold text-uppercase border-b">
              IC
            </th>
            <th class="bg-grey-lighten-5 text-grey-darken-2 font-weight-bold text-uppercase border-b">
              N&deg; Reclamo
            </th>
            <th
              class="bg-grey-lighten-5 text-grey-darken-2 font-weight-bold text-uppercase border-b"
              style="min-width: 100px;"
            >
              Comuna
            </th>
            <th
              class="bg-grey-lighten-5 text-grey-darken-2 font-weight-bold text-uppercase border-b"
              style="min-width: 180px;"
            >
              Direcci&oacute;n
            </th>
            <th
              class="bg-grey-lighten-5 text-grey-darken-2 font-weight-bold text-uppercase border-b"
              style="min-width: 110px;"
            >
              Fecha Conexi&oacute;n
            </th>
            <th class="bg-grey-lighten-5 text-grey-darken-2 font-weight-bold text-uppercase border-b">
              T&eacute;cnico
            </th>
            <th class="bg-grey-lighten-5 text-grey-darken-2 font-weight-bold text-uppercase border-b">
              Estado Conexi&oacute;n
            </th>
            <th class="bg-grey-lighten-5 text-grey-darken-2 font-weight-bold text-uppercase border-b">
              A / NA
            </th>
            <th class="bg-grey-lighten-5 text-grey-darken-2 font-weight-bold text-uppercase border-b">
              Tipo Reclamo
            </th>
            <th class="bg-grey-lighten-5 text-grey-darken-2 font-weight-bold text-uppercase border-b">
              Fecha Llegada
            </th>
            <th class="bg-grey-lighten-5 text-grey-darken-2 font-weight-bold text-uppercase border-b">
              Fecha Soluci&oacute;n
            </th>
            <th
              class="bg-grey-lighten-5 text-grey-darken-2 font-weight-bold text-uppercase border-b text-center"
              style="min-width: 90px;"
            >
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in reclamosVista"
            :key="item.id_survey"
            class="row-hover transition-swing"
          >
            <td class="text-center border-b">
              <v-btn
                icon
                variant="text"
                size="x-small"
                color="primary"
                @click="abrirDetalle(item)"
              >
                <v-icon size="20">
                  mdi-eye-outline
                </v-icon>
              </v-btn>
            </td>
            <td class="border-b">
              {{ item.parsed?.ic || '-' }} ({{ item.id_survey || '-' }})
            </td>
            <td class="border-b">
              {{ item.parsed?.nro_reclamo || '-' }}
            </td>
            <td class="border-b">
              {{ item.parsed?.comuna || '-' }}
            </td>
            <td class="border-b">
              {{ item.parsed?.direccion || '-' }}
            </td>
            <td class="border-b text-caption">
              {{ formatDateNoT(item.parsed?.fecha_conexion || item.fecha_plan_ini) || '-' }}
            </td>
            <td class="border-b">
              {{ item.parsed?.tecnico || item.parsed?.tecnico_conexion_original || '-' }}
            </td>
            <td class="border-b">
              {{ item.parsed?.estado_conexion || item.parsed?.estado || '-' }}
            </td>
            <td class="border-b">
              {{ formatAplicaNoAplica(item.parsed?.aplica_no_aplica) }}
            </td>
            <td class="border-b">
              {{ item.parsed?.tipo_reclamo || '-' }}
            </td>
            <td class="border-b text-caption">
              {{ formatDateNoT(item.parsed?.fecha_recepcion_reclamo || item.parsed?.fecha_creacion || item.parsed?.sysdatehhmm) || '-' }}
            </td>
            <td class="border-b text-caption">
              {{ formatDateNoT(item.parsed?.fecha_cierre_gio || item.parsed?.fecha_cierre) || '-' }}
            </td>

            <td class="border-b text-center">
              <div class="d-flex justify-center align-center ga-3">
                <v-icon
                  size="22"
                  color="primary"
                  title="Editar reclamo"
                  @click.stop="abrirEditarReclamo(item)"
                >
                  mdi-square-edit-outline
                </v-icon>

                <!--
                <v-icon
                  size="22"
                  :color="item.id_user ? 'green' : 'red'"
                  title="Editar asignacion"
                  @click.stop="editar(item)"
                >
                  mdi-pencil
                </v-icon>
                -->
              </div>
            </td>
          </tr>
          <tr v-if="!reclamosVista.length && !loadingData">
            <td
              colspan="13"
              class="text-center pa-4 text-medium-emphasis"
            >
              No se encontraron reclamos en el periodo seleccionado.
            </td>
          </tr>
          <tr v-if="loadingData">
            <td
              colspan="13"
              class="text-center pa-4"
            >
              <v-progress-circular
                indeterminate
                color="primary"
                size="24"
              />
            </td>
          </tr>
        </tbody>
      </v-table>

      <v-divider class="my-2" />

      <!--v-card-text class="pt-2 pb-4">
        <v-row
          dense
          class="reclamo-cards-row"
        >
          <v-col
            v-for="item in reclamosVista"
            :key="`card-${item.id_survey}`"
            cols="12"
            md="4"
            lg="3"
            xl="3"
          >
            <v-card
              variant="outlined"
              class="reclamo-card h-100"
            >
              <v-card-title class="d-flex align-center justify-space-between py-1 px-2 border-b">
                <div class="text-subtitle-2 font-weight-bold text-primary-dark">
                  Reclamo #{{ item.parsed?.nro_reclamo || item.id_survey }}
                </div>
                <v-chip
                  size="x-small"
                  :color="getColorEstado(item.estado_srv)"
                  variant="flat"
                  class="font-weight-bold text-white"
                >
                  {{ item.estado_srv || '-' }}
                </v-chip>
              </v-card-title>

              <v-card-text class="py-2 px-2">
                <v-row dense>
                  <v-col cols="6">
                    <div class="card-k">IC</div>
                    <div class="card-v">{{ item.parsed?.ic || '-' }}</div>
                  </v-col>
                  <v-col cols="6">
                    <div class="card-k">Fecha Conexión</div>
                    <div class="card-v">{{ formatDateNoT(item.parsed?.fecha_conexion || item.fecha_plan_ini) || '-' }}</div>
                  </v-col>

                  <v-col cols="12">
                    <div class="card-k">Dirección</div>
                    <div class="card-v">{{ item.parsed?.direccion || '-' }}</div>
                  </v-col>
                  <v-col cols="6">
                    <div class="card-k">Comuna</div>
                    <div class="card-v">{{ item.parsed?.comuna || '-' }}</div>
                  </v-col>
                  <v-col cols="6">
                    <div class="card-k">Cliente</div>
                    <div class="card-v">{{ item.parsed?.nombre_cliente || '-' }}</div>
                  </v-col>

                  <v-col cols="6">
                    <div class="card-k">Supervisor TRC</div>
                    <div class="card-v">{{ item.parsed?.supervisor_trc || item.nombre_user || '-' }}</div>
                  </v-col>
                  <v-col cols="6">
                    <div class="card-k">Técnico Original</div>
                    <div class="card-v">{{ item.parsed?.tecnico_conexion_original || '-' }}</div>
                  </v-col>
                  <v-col cols="6">
                    <div class="card-k">Empresa</div>
                    <div class="card-v">{{ item.parsed?.empresa_conecto || '-' }}</div>
                  </v-col>
                  <v-col cols="6">
                    <div class="card-k">Recepción Reclamo</div>
                    <div class="card-v">{{ formatDateNoT(item.parsed?.fecha_recepcion_reclamo || item.parsed?.fecha_creacion || item.parsed?.sysdatehhmm) || '-' }}</div>
                  </v-col>

                  <v-col cols="6">
                    <div class="card-k">Teléfono</div>
                    <div class="card-v">{{ item.parsed?.telefono || '-' }}</div>
                  </v-col>
                  <v-col cols="6">
                    <div class="card-k">GIO</div>
                    <div class="card-v">{{ item.parsed?.gio || '-' }}</div>
                  </v-col>

                  <v-col cols="12">
                    <div class="card-k">Observación</div>
                    <div class="card-v card-v-multi">{{ item.parsed?.observacion || '-' }}</div>
                  </v-col>
                </v-row>
              </v-card-text>

              <v-card-actions class="px-2 pb-2 pt-0 justify-end ga-1">
                <v-btn
                  size="small"
                  variant="text"
                  prepend-icon="mdi-eye-outline"
                  @click="abrirDetalle(item)"
                >
                  Ver
                </v-btn>
                <v-btn
                  size="small"
                  color="primary"
                  variant="flat"
                  prepend-icon="mdi-square-edit-outline"
                  @click="abrirEditarReclamo(item)"
                >
                  Editar
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text-->
    </v-card>


    <!-- MODAL DETALLE -->
    <v-dialog
      v-model="dialogDetalle"
      max-width="800"
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
            mdi-text-box-search-outline
          </v-icon>
          <v-toolbar-title class="text-subtitle-1 font-weight-bold text-primary-dark">
            Detalle Reclamo #{{ selectedReclamo?.parsed?.nro_reclamo || selectedReclamo?.id_survey }}
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

        <v-card-text
          class="pa-4 bg-grey-lighten-5 h-100"
          style="max-height: 80vh; overflow-y: auto;"
        >
          <div v-if="selectedReclamo && selectedReclamo.parsed">
            <!-- Datos Principales -->
            <v-card
              variant="flat"
              border
              class="mb-4"
            >
              <v-card-title class="text-subtitle-2 font-weight-bold bg-grey-lighten-4 py-2 border-b">
                Informacion General
              </v-card-title>
              <v-card-text class="pa-3">
                <v-row dense>
                  <v-col
                    cols="6"
                    md="4"
                    class="text-caption text-medium-emphasis"
                  >
                    Cliente
                  </v-col>
                  <v-col
                    cols="6"
                    md="8"
                    class="text-body-2 font-weight-medium"
                  >
                    {{
                      selectedReclamo.parsed.nombre_cliente }}
                  </v-col>

                  <v-col
                    cols="6"
                    md="4"
                    class="text-caption text-medium-emphasis"
                  >
                    IC
                  </v-col>
                  <v-col
                    cols="6"
                    md="8"
                    class="text-body-2 font-weight-medium"
                  >
                    {{
                      selectedReclamo.parsed.ic
                    }}
                  </v-col>

                  <v-col
                    cols="6"
                    md="4"
                    class="text-caption text-medium-emphasis"
                  >
                    Direcci&oacute;n
                  </v-col>
                  <v-col
                    cols="6"
                    md="8"
                    class="text-body-2"
                  >
                    {{ selectedReclamo.parsed.direccion
                    }}
                  </v-col>

                  <v-col
                    cols="6"
                    md="4"
                    class="text-caption text-medium-emphasis"
                  >
                    Comuna
                  </v-col>
                  <v-col
                    cols="6"
                    md="8"
                    class="text-body-2"
                  >
                    {{ selectedReclamo.parsed.comuna
                    }}
                  </v-col>

                  <v-col
                    cols="6"
                    md="4"
                    class="text-caption text-medium-emphasis"
                  >
                    Tel&eacute;fono
                  </v-col>
                  <v-col
                    cols="6"
                    md="8"
                    class="text-body-2"
                  >
                    {{ selectedReclamo.parsed.telefono
                    }}
                  </v-col>

                  <v-col
                    cols="6"
                    md="4"
                    class="text-caption text-medium-emphasis"
                  >
                    Email
                  </v-col>
                  <v-col
                    cols="6"
                    md="8"
                    class="text-body-2"
                  >
                    {{ selectedReclamo.parsed.email
                    }}
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <!-- Gestion -->
            <v-card
              variant="flat"
              border
              class="mb-4"
            >
              <v-card-title class="text-subtitle-2 font-weight-bold bg-grey-lighten-4 py-2 border-b">
                Estado y Gestion
              </v-card-title>
              <v-card-text class="pa-3">
                <v-row dense>
                  <v-col
                    cols="6"
                    md="4"
                    class="text-caption text-medium-emphasis"
                  >
                    Estado
                    Actual
                  </v-col>
                  <v-col
                    cols="6"
                    md="8"
                  >
                    <v-chip
                      size="small"
                      :color="getColorEstado(selectedReclamo.parsed.estado)"
                      class="font-weight-bold text-white"
                    >
                      {{ selectedReclamo.parsed.estado }}
                    </v-chip>
                  </v-col>

                  <v-col
                    cols="6"
                    md="4"
                    class="text-caption text-medium-emphasis"
                  >
                    Nro Reclamo
                  </v-col>
                  <v-col
                    cols="6"
                    md="8"
                    class="text-body-2"
                  >
                    {{ selectedReclamo.parsed.nro_reclamo
                    }}
                  </v-col>

                  <v-col
                    cols="6"
                    md="4"
                    class="text-caption text-medium-emphasis"
                  >
                    GIO a Cargo
                  </v-col>
                  <v-col
                    cols="6"
                    md="8"
                    class="text-body-2"
                  >
                    {{ selectedReclamo.parsed.gio }}
                  </v-col>

                  <v-col
                    cols="12"
                    class="mt-2 text-caption text-medium-emphasis"
                  >
                    Observaci&oacute;n /
                    Descripci&oacute;n
                  </v-col>
                  <v-col
                    cols="12"
                    class="text-body-2 bg-grey-lighten-5 pa-2 border rounded"
                  >
                    {{ selectedReclamo.parsed.observacion || 'Sin observaciones' }}
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <v-card
              variant="flat"
              border
              class="mb-4"
            >
              <v-card-text class="pa-3">
                <v-row dense>
                  <v-col
                    cols="6"
                    md="4"
                    class="text-caption text-medium-emphasis"
                  >
                    Reclamo
                  </v-col>
                  <v-col
                    cols="6"
                    md="8"
                    class="text-body-2"
                  >
                    {{ selectedReclamo.parsed.nro_reclamo || '-' }}
                  </v-col>

                  <v-col
                    cols="6"
                    md="4"
                    class="text-caption text-medium-emphasis"
                  >
                    Fecha Conexi&oacute;n
                  </v-col>
                  <v-col
                    cols="6"
                    md="8"
                    class="text-body-2"
                  >
                    {{ formatDateNoT(selectedReclamo.parsed.fecha_conexion) || '-' }}
                  </v-col>

                  <v-col
                    cols="6"
                    md="4"
                    class="text-caption text-medium-emphasis"
                  >
                    Supervisor Terracon
                  </v-col>
                  <v-col
                    cols="6"
                    md="8"
                    class="text-body-2"
                  >
                    {{ selectedReclamo.parsed.supervisor_terracon || selectedReclamo.parsed.supervisor_trc || '-' }}
                  </v-col>

                  <v-col
                    cols="6"
                    md="4"
                    class="text-caption text-medium-emphasis"
                  >
                    Gestor
                  </v-col>
                  <v-col
                    cols="6"
                    md="8"
                    class="text-body-2"
                  >
                    {{ selectedReclamo.parsed.gestor || selectedReclamo.parsed.gio || '-' }}
                  </v-col>

                  <v-col
                    cols="6"
                    md="4"
                    class="text-caption text-medium-emphasis"
                  >
                    Empresa
                  </v-col>
                  <v-col
                    cols="6"
                    md="8"
                    class="text-body-2"
                  >
                    {{ selectedReclamo.parsed.empresa_conecto || '-' }}
                  </v-col>

                  <v-col
                    cols="6"
                    md="4"
                    class="text-caption text-medium-emphasis"
                  >
                    T&eacute;cnico
                  </v-col>
                  <v-col
                    cols="6"
                    md="8"
                    class="text-body-2"
                  >
                    {{ selectedReclamo.parsed.tecnico || selectedReclamo.parsed.tecnico_conexion_original || '-' }}
                  </v-col>

                  <v-col
                    cols="6"
                    md="4"
                    class="text-caption text-medium-emphasis"
                  >
                    Fecha Recepci&oacute;n Reclamo
                  </v-col>
                  <v-col
                    cols="6"
                    md="8"
                    class="text-body-2"
                  >
                    {{ formatDateNoT(selectedReclamo.parsed.fecha_recepcion_reclamo) || '-' }}
                  </v-col>

                  <v-col
                    cols="6"
                    md="4"
                    class="text-caption text-medium-emphasis"
                  >
                    Fecha Plazo Respuesta Metrogas
                  </v-col>
                  <v-col
                    cols="6"
                    md="8"
                    class="text-body-2"
                  >
                    {{ formatDateNoT(selectedReclamo.parsed.fecha_plazo_respuesta_metrogas) || '-' }}
                  </v-col>

                  <v-col
                    cols="6"
                    md="4"
                    class="text-caption text-medium-emphasis"
                  >
                    A&ntilde;o
                  </v-col>
                  <v-col
                    cols="6"
                    md="8"
                    class="text-body-2"
                  >
                    {{ selectedReclamo.parsed.anio || '-' }}
                  </v-col>

                  <v-col
                    cols="6"
                    md="4"
                    class="text-caption text-medium-emphasis"
                  >
                    Mes Recepci&oacute;n Reclamo
                  </v-col>
                  <v-col
                    cols="6"
                    md="8"
                    class="text-body-2"
                  >
                    {{ selectedReclamo.parsed.mes_recepcion_reclamo || '-' }}
                  </v-col>

                  <v-col
                    cols="6"
                    md="4"
                    class="text-caption text-medium-emphasis"
                  >
                    Fecha de Visita
                  </v-col>
                  <v-col
                    cols="6"
                    md="8"
                    class="text-body-2"
                  >
                    {{ formatDateNoT(selectedReclamo.parsed.fecha_visita) || '-' }}
                  </v-col>

                  <v-col
                    cols="6"
                    md="4"
                    class="text-caption text-medium-emphasis"
                  >
                    Fecha 1ra Solicitud
                  </v-col>
                  <v-col
                    cols="6"
                    md="8"
                    class="text-body-2"
                  >
                    {{ formatDateNoT(selectedReclamo.parsed.fecha_primera_solicitud) || '-' }}
                  </v-col>

                  <v-col
                    cols="6"
                    md="4"
                    class="text-caption text-medium-emphasis"
                  >
                    Fecha 2da Solicitud
                  </v-col>
                  <v-col
                    cols="6"
                    md="8"
                    class="text-body-2"
                  >
                    {{ formatDateNoT(selectedReclamo.parsed.fecha_segunda_solicitud) || '-' }}
                  </v-col>

                  <v-col
                    cols="6"
                    md="4"
                    class="text-caption text-medium-emphasis"
                  >
                    Estado Reclamo
                  </v-col>
                  <v-col
                    cols="6"
                    md="8"
                    class="text-body-2"
                  >
                    {{ selectedReclamo.parsed.estado || '-' }}
                  </v-col>

                  <v-col
                    cols="6"
                    md="4"
                    class="text-caption text-medium-emphasis"
                  >
                    Reclamo Pendiente por
                  </v-col>
                  <v-col
                    cols="6"
                    md="8"
                    class="text-body-2"
                  >
                    {{ selectedReclamo.parsed.reclamo_pendiente_por || '-' }}
                  </v-col>

                  <v-col
                    cols="6"
                    md="4"
                    class="text-caption text-medium-emphasis"
                  >
                    Fecha Correo Cierre a MTGS
                  </v-col>
                  <v-col
                    cols="6"
                    md="8"
                    class="text-body-2"
                  >
                    {{ formatDateNoT(selectedReclamo.parsed.fecha_correo_cierre_mtgs) || '-' }}
                  </v-col>

                  <v-col
                    cols="6"
                    md="4"
                    class="text-caption text-medium-emphasis"
                  >
                    Fecha Cierre GIO
                  </v-col>
                  <v-col
                    cols="6"
                    md="8"
                    class="text-body-2"
                  >
                    {{ formatDateNoT(selectedReclamo.parsed.fecha_cierre_gio) || '-' }}
                  </v-col>

                  <v-col
                    cols="6"
                    md="4"
                    class="text-caption text-medium-emphasis"
                  >
                    Aplica / No Aplica
                  </v-col>
                  <v-col
                    cols="6"
                    md="8"
                    class="text-body-2"
                  >
                    {{ formatAplicaNoAplica(selectedReclamo.parsed.aplica_no_aplica) }}
                  </v-col>

                  <v-col
                    cols="6"
                    md="4"
                    class="text-caption text-medium-emphasis"
                  >
                    Observaci&oacute;n Terracon
                  </v-col>
                  <v-col
                    cols="6"
                    md="8"
                    class="text-body-2"
                  >
                    {{ selectedReclamo.parsed.observacion_terracon || selectedReclamo.parsed.observacion || '-' }}
                  </v-col>

                  <v-col
                    cols="6"
                    md="4"
                    class="text-caption text-medium-emphasis"
                  >
                    Contenido del Reclamo
                  </v-col>
                  <v-col
                    cols="6"
                    md="8"
                    class="text-body-2"
                  >
                    {{ selectedReclamo.parsed.contenido_reclamo || '-' }}
                  </v-col>

                  <v-col
                    cols="6"
                    md="4"
                    class="text-caption text-medium-emphasis"
                  >
                    Reclamo Atribuible a
                  </v-col>
                  <v-col
                    cols="6"
                    md="8"
                    class="text-body-2"
                  >
                    {{ selectedReclamo.parsed.reclamo_atribuible_a || '-' }}
                  </v-col>

                  <v-col
                    cols="6"
                    md="4"
                    class="text-caption text-medium-emphasis"
                  >
                    Tipo Reclamo
                  </v-col>
                  <v-col
                    cols="6"
                    md="8"
                    class="text-body-2"
                  >
                    {{ selectedReclamo.parsed.tipo_reclamo || '-' }}
                  </v-col>

                  <v-col
                    cols="6"
                    md="4"
                    class="text-caption text-medium-emphasis"
                  >
                    Apertura de Reclamo
                  </v-col>
                  <v-col
                    cols="6"
                    md="8"
                    class="text-body-2"
                  >
                    {{ selectedReclamo.parsed.apertura_reclamo || '-' }}
                  </v-col>

                  <v-col
                    cols="6"
                    md="4"
                    class="text-caption text-medium-emphasis"
                  >
                    Detalle Apertura
                  </v-col>
                  <v-col
                    cols="6"
                    md="8"
                    class="text-body-2"
                  >
                    {{ selectedReclamo.parsed.apertura_reclamo_detalle || '-' }}
                  </v-col>

                  <v-col
                    cols="6"
                    md="4"
                    class="text-caption text-medium-emphasis"
                  >
                    Cuadrilla
                  </v-col>
                  <v-col
                    cols="6"
                    md="8"
                    class="text-body-2"
                  >
                    {{ selectedReclamo.parsed.cuadrilla || '-' }}
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <!-- Fechas -->
            <v-card
              variant="flat"
              border
              class="mb-4"
            >
              <v-card-title class="text-subtitle-2 font-weight-bold bg-grey-lighten-4 py-2 border-b">
                Tiempos y SLA
              </v-card-title>
              <v-card-text class="pa-3">
                <v-row dense>
                  <v-col
                    cols="6"
                    md="3"
                    class="text-caption text-medium-emphasis"
                  >
                    Creacion
                  </v-col>
                  <v-col
                    cols="6"
                    md="3"
                    class="text-body-2"
                  >
                    {{ formatDateNoT(selectedReclamo.parsed.fecha_creacion || selectedReclamo.parsed.sysdatehhmm) || '-'
                    }}
                  </v-col>

                  <v-col
                    cols="6"
                    md="3"
                    class="text-caption text-medium-emphasis"
                  >
                    Target
                    (+48h)
                  </v-col>
                  <v-col
                    cols="6"
                    md="3"
                    class="text-body-2"
                  >
                    {{ formatDateNoT(selectedReclamo.parsed.fecha_target) || '-'
                    }}
                  </v-col>

                  <v-col
                    cols="6"
                    md="3"
                    class="text-caption text-medium-emphasis"
                  >
                    Cierre Real
                  </v-col>
                  <v-col
                    cols="6"
                    md="3"
                    class="text-body-2"
                  >
                    {{ formatDateNoT(selectedReclamo.parsed.fecha_cierre) || '-'
                    }}
                  </v-col>

                  <v-col
                    cols="6"
                    md="3"
                    class="text-caption text-medium-emphasis"
                  >
                    SLA Real
                  </v-col>
                  <v-col
                    cols="6"
                    md="3"
                    class="text-body-2 font-weight-bold"
                  >
                    {{
                      selectedReclamo.parsed.sla_real }}
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <!-- Registro Complementario -->
            <div v-if="selectedReclamo.registroComplementarioSeg">
              <div class="text-subtitle-2 font-weight-bold mb-2 text-primary d-flex align-center">
                <v-icon
                  start
                  size="small"
                >
                  mdi-paperclip
                </v-icon> Registro Complementario
              </div>
              <v-card
                variant="outlined"
                border
                class="pa-3"
              >
                <template
                  v-for="(attr, i) in selectedReclamo.registroComplementarioSeg.attributes"
                  :key="i"
                >
                  <div v-if="attr.type === 'registroEventos'">
                    <div class="text-caption font-weight-bold mb-2">
                      {{ attr.label }}
                    </div>
                    <div v-if="attr.body && attr.body.length">
                      <div
                        v-for="(ev, k) in attr.body"
                        :key="k"
                        class="mb-3 pa-2 bg-grey-lighten-5 rounded border"
                      >
                        <div class="d-flex justify-space-between align-center mb-1">
                          <span class="text-caption font-weight-bold text-primary">{{
                            ev.comentarioInicial || 'Evento' }}</span>
                          <v-chip
                            size="x-small"
                            variant="flat"
                            color="grey-lighten-3"
                          >
                            {{
                              ev.hora }}
                          </v-chip>
                        </div>
                        <div
                          v-if="ev.observaciones"
                          class="text-caption mb-2 text-wrap"
                        >
                          Obs: {{
                            ev.observaciones }}
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
                                  width="60"
                                  height="60"
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
                    <div
                      v-else
                      class="text-caption text-disabled font-italic"
                    >
                      Sin eventos
                      registrados
                    </div>
                  </div>
                  <!-- Otros tipos si hubieran -->
                </template>
              </v-card>
            </div>
          </div>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-3 justify-end">
          <v-btn
            color="primary"
            variant="text"
            @click="dialogDetalle = false"
          >
            Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>


    <!-- MODAL GALERÍA -->
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
            Galería Fotografica
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

    <!-- MODAL EDITAR (COMPLETO) -->
    <v-dialog
      v-model="dialogEditar"
      max-width="800"
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
            Editar Reclamo #{{ editForm.nro_reclamo || editForm.id_survey }}
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
            v-if="editError"
            type="error"
            variant="tonal"
            class="mb-4"
            density="compact"
          >
            {{ editError }}
          </v-alert>

          <v-card
            class="pa-4 mb-3"
            variant="flat"
            border
          >
            <div class="text-caption font-weight-bold text-uppercase text-medium-emphasis mb-3">
              Asignación
              de Personal
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
                <v-select
                  v-model="editForm.id_user_supervisor"
                  :items="usuariosPorEmpresaContratista"
                  item-title="nombre_user"
                  item-value="id_user"
                  label="Supervisor"
                  density="compact"
                  variant="outlined"
                  color="primary"
                  hide-details="auto"
                  clearable
                  prepend-inner-icon="mdi-account-tie"
                  :disabled="!editForm.id_user_contratista"
                />
              </v-col>

              <v-col
                cols="12"
                md="4"
              >
                <v-select
                  v-model="editForm.id_user_tecnico"
                  :items="usuariosPorEmpresaContratista"
                  item-title="nombre_user"
                  item-value="id_user"
                  label="Tecnico"
                  density="compact"
                  variant="outlined"
                  color="primary"
                  hide-details="auto"
                  clearable
                  prepend-inner-icon="mdi-account-wrench"
                  :disabled="!editForm.id_user_contratista"
                />
              </v-col>
            </v-row>
          </v-card>

          <v-card
            class="pa-4"
            variant="flat"
            border
          >
            <div class="text-caption font-weight-bold text-uppercase text-medium-emphasis mb-3">
              Fechas de
              Planificación
            </div>
            <v-row dense>
              <v-col
                cols="12"
                md="6"
              >
                <v-text-field
                  v-model="editForm.fecha_plan_ini"
                  type="date"
                  label="Inicio Plan"
                  density="compact"
                  variant="outlined"
                  color="primary"
                  hide-details="auto"
                />
              </v-col>

              <v-col
                cols="12"
                md="6"
              >
                <v-text-field
                  v-model="editForm.fecha_plan_fin"
                  type="date"
                  label="Fin Plan"
                  density="compact"
                  variant="outlined"
                  color="primary"
                  hide-details="auto"
                />
              </v-col>
            </v-row>
          </v-card>
        </v-card-text>

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

    <!-- MODAL CREACIÃ“N (Mantengo igual) -->
    <v-dialog
      v-model="dialogCrear"
      max-width="800"
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
            {{ isEditMode ? 'mdi-square-edit-outline' : 'mdi-plus-circle-outline' }}
          </v-icon>
          <v-toolbar-title class="text-subtitle-1 font-weight-bold text-primary-dark">
            {{ isEditMode ? `Editar Reclamo #${editingReclamoId || ''}` : 'Crear Reclamo' }}
          </v-toolbar-title>
          <v-spacer />
          <v-btn
            icon
            variant="text"
            @click="cerrarModalCrear"
          >
            <v-icon color="medium-emphasis">
              mdi-close
            </v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text class="pa-4 bg-grey-lighten-5 modal-reclamo-body">
          <v-alert
            v-if="error"
            type="error"
            variant="tonal"
            class="mb-4"
            density="compact"
          >
            {{ error }}
          </v-alert>

          <v-card
            class="pa-4 reclamo-form-card"
            variant="flat"
            border
          >
            <div class="text-caption mb-3 d-flex flex-wrap ga-3">
              <span class="d-inline-flex align-center">
                <span class="legend-box legend-auto mr-2" />Celeste: autocompletado
              </span>
              <span class="d-inline-flex align-center">
                <span class="legend-box legend-manual mr-2" />Rojo: manual (opcional)
              </span>
            </div>
            <v-row dense>
              <v-col
                cols="12"
                md="8"
                class="field-auto"
              >
                <v-autocomplete
                  v-model="form.ic_busqueda"
                  v-model:search="icSearchText"
                  :items="icSapOptions"
                  item-title="label"
                  return-object
                  :loading="loadingIcSap"
                  label="Buscar IC SAP + HISTORICO"
                  placeholder="Buscar IC SAP + HISTORICO"
                  variant="outlined"
                  density="compact"
                  bg-color="white"
                  hide-details="auto"
                  class="mb-3"
                  clearable
                  no-filter
                />
              </v-col>

              <v-col
                cols="12"
                md="4"
                class="field-manual"
              >
                <v-text-field
                  v-model="form.fecha"
                  label="Fecha proyectada ejecuci&oacute;n (Opcional)"
                  type="date"
                  variant="outlined"
                  density="compact"
                  bg-color="white"
                  hide-details="auto"
                  class="mb-3"
                />
              </v-col>

              <!-- Cliente y Proyecto ocultos (se mantienen autocompletados/bloqueados en el modelo) -->

              <v-col
                cols="12"
                md="4"
                class="field-auto"
              >
                <v-text-field
                  v-model="form.ic"
                  label="IC"
                  variant="outlined"
                  density="compact"
                  bg-color="white"
                  hide-details="auto"
                  class="mb-3"
                />
              </v-col>
              <v-col
                cols="12"
                md="4"
                class="field-manual"
              >
                <v-text-field
                  v-model="form.nro_reclamo"
                  label="Reclamo"
                  variant="outlined"
                  density="compact"
                  bg-color="white"
                  hide-details="auto"
                  class="mb-3"
                />
              </v-col>
              <v-col
                cols="12"
                md="4"
                class="field-auto"
              >
                <v-text-field
                  v-model="form.comuna"
                  label="Comuna"
                  variant="outlined"
                  density="compact"
                  bg-color="white"
                  hide-details="auto"
                  class="mb-3"
                />
              </v-col>

              <v-col
                cols="12"
                md="8"
                class="field-auto"
              >
                <v-text-field
                  v-model="form.direccion"
                  label="Direccion"
                  variant="outlined"
                  density="compact"
                  bg-color="white"
                  hide-details="auto"
                  class="mb-3"
                />
              </v-col>

              <v-col
                cols="12"
                md="4"
                class="field-manual"
              >
                <v-text-field
                  v-model="form.fecha_conexion"
                  label="Fecha Conexion"
                  type="date"
                  variant="outlined"
                  density="compact"
                  bg-color="white"
                  hide-details="auto"
                  class="mb-3"
                />
              </v-col>

              <v-col
                cols="12"
                md="4"
                class="field-manual"
              >
                <v-autocomplete
                  v-model="form.supervisor_terracon"
                  :items="supervisoresTerraconOptions"
                  item-title="nombre_user"
                  item-value="nombre_user"
                  label="Supervisor Terracon"
                  variant="outlined"
                  density="compact"
                  bg-color="white"
                  :loading="loadingUsuarios || loadingRolesUsuarios"
                  hide-details="auto"
                  clearable
                  no-data-text="Sin usuarios con rol CNX-TRC-SUP"
                  class="mb-3"
                />
              </v-col>
              <v-col
                cols="12"
                md="4"
                class="field-manual"
              >
                <v-autocomplete
                  v-model="form.gestor"
                  :items="usuariosNombresUnicos"
                  item-title="nombre_user"
                  item-value="nombre_user"
                  label="Gestor"
                  variant="outlined"
                  density="compact"
                  bg-color="white"
                  :loading="loadingUsuarios"
                  hide-details="auto"
                  clearable
                  no-data-text="Sin usuarios"
                  class="mb-3"
                />
              </v-col>
              <v-col
                cols="12"
                md="4"
                class="field-manual"
              >
                <v-autocomplete
                  v-model="form.empresa_conecto"
                  :items="clientes"
                  item-title="name_empresa"
                  item-value="name_empresa"
                  label="Empresa"
                  variant="outlined"
                  density="compact"
                  bg-color="white"
                  hide-details="auto"
                  clearable
                  no-data-text="Sin empresas"
                  class="mb-3"
                />
              </v-col>

              <v-col
                cols="12"
                md="4"
                class="field-manual"
              >
                <v-autocomplete
                  v-model="form.tecnico"
                  :items="usuariosNombresUnicos"
                  item-title="nombre_user"
                  item-value="nombre_user"
                  label="Tecnico"
                  variant="outlined"
                  density="compact"
                  bg-color="white"
                  :loading="loadingUsuarios"
                  hide-details="auto"
                  clearable
                  no-data-text="Sin usuarios"
                  class="mb-3"
                />
              </v-col>

              <v-col
                cols="12"
                md="4"
                class="field-manual"
              >
                <v-text-field
                  v-model="form.fecha_recepcion_reclamo"
                  label="Fecha Recepcion Reclamo"
                  type="datetime-local"
                  variant="outlined"
                  density="compact"
                  bg-color="white"
                  hide-details="auto"
                  class="mb-3"
                />
              </v-col>

              <v-col
                cols="12"
                md="4"
                class="field-manual"
              >
                <v-text-field
                  v-model="form.fecha_plazo_respuesta_metrogas"
                  label="Fecha Plazo Respuesta Metrogas"
                  type="date"
                  variant="outlined"
                  density="compact"
                  bg-color="white"
                  hide-details="auto"
                  readonly
                  disabled
                  class="mb-3"
                />
              </v-col>

              <v-col
                cols="12"
                md="4"
                class="field-manual"
              >
                <v-text-field
                  v-model="form.fecha_visita"
                  label="Fecha de Visita"
                  type="date"
                  variant="outlined"
                  density="compact"
                  bg-color="white"
                  hide-details="auto"
                  class="mb-3"
                />
              </v-col>

              <v-col
                cols="12"
                md="4"
                class="field-manual"
              >
                <v-text-field
                  v-model="form.fecha_primera_solicitud"
                  label="Fecha 1ra Solicitud"
                  type="date"
                  variant="outlined"
                  density="compact"
                  bg-color="white"
                  hide-details="auto"
                  class="mb-3"
                />
              </v-col>

              <v-col
                cols="12"
                md="4"
                class="field-manual"
              >
                <v-text-field
                  v-model="form.fecha_segunda_solicitud"
                  label="Fecha 2da Solicitud"
                  type="date"
                  variant="outlined"
                  density="compact"
                  bg-color="white"
                  hide-details="auto"
                  class="mb-3"
                />
              </v-col>

              <v-col
                cols="12"
                md="4"
                class="field-manual"
              >
                <v-text-field
                  v-model="form.fecha_correo_cierre_mtgs"
                  label="Fecha Correo Cierre a MTGS"
                  type="date"
                  variant="outlined"
                  density="compact"
                  bg-color="white"
                  hide-details="auto"
                  class="mb-3"
                />
              </v-col>

              <v-col
                cols="12"
                md="4"
                class="field-manual"
              >
                <v-text-field
                  v-model="form.fecha_cierre_gio"
                  label="Fecha de Cierre GIO"
                  type="date"
                  variant="outlined"
                  density="compact"
                  bg-color="white"
                  hide-details="auto"
                  class="mb-3"
                />
              </v-col>

              <v-col
                cols="12"
                class="field-manual"
              >
                <v-textarea
                  v-model="form.observacion_terracon"
                  label="Observacion Terracon"
                  variant="outlined"
                  density="compact"
                  bg-color="white"
                  hide-details="auto"
                  rows="3"
                  class="mb-3"
                />
              </v-col>

              <v-col
                cols="12"
                class="field-manual"
              >
                <v-textarea
                  v-model="form.contenido_reclamo"
                  label="Contenido del Reclamo"
                  variant="outlined"
                  density="compact"
                  bg-color="white"
                  hide-details="auto"
                  rows="3"
                  class="mb-3"
                />
              </v-col>

              <v-col
                cols="12"
                md="6"
                class="field-manual"
              >
                <v-select
                  v-model="form.estado_reclamo"
                  :items="estadoReclamoOptions"
                  label="Estado"
                  variant="outlined"
                  density="compact"
                  bg-color="white"
                  hide-details="auto"
                  class="mb-3"
                  clearable
                />
              </v-col>

              <v-col
                cols="12"
                md="6"
                class="field-manual"
              >
                <v-select
                  v-model="form.reclamo_pendiente_por"
                  :items="reclamoPendientePorOptions"
                  label="Reclamo Pendiente por"
                  variant="outlined"
                  density="compact"
                  bg-color="white"
                  hide-details="auto"
                  class="mb-3"
                  clearable
                />
              </v-col>

              <v-col
                cols="12"
                md="6"
                class="field-manual"
              >
                <v-select
                  v-model="form.aplica_no_aplica"
                  :items="aplicaNoAplicaOptions"
                  label="Aplica / No Aplica (Opcional)"
                  variant="outlined"
                  density="compact"
                  bg-color="white"
                  hide-details="auto"
                  class="mb-3"
                  clearable
                />
              </v-col>

              <v-col
                cols="12"
                md="6"
                class="field-manual"
              >
                <v-select
                  v-model="form.tipo_reclamo"
                  :items="tipoReclamoOptions"
                  label="Tipo Reclamo"
                  variant="outlined"
                  density="compact"
                  bg-color="white"
                  hide-details="auto"
                  class="mb-3"
                  clearable
                />
              </v-col>

              <v-col
                cols="12"
                md="6"
                class="field-manual"
              >
                <v-select
                  v-model="form.reclamo_atribuible_a"
                  :items="reclamoAtribuibleAOptions"
                  label="Reclamo Atribuible a"
                  variant="outlined"
                  density="compact"
                  bg-color="white"
                  hide-details="auto"
                  class="mb-3"
                  clearable
                />
              </v-col>

              <v-col
                cols="12"
                md="6"
                class="field-manual"
              >
                <v-select
                  v-model="form.cuadrilla"
                  :items="cuadrillaOptions"
                  label="Cuadrilla"
                  variant="outlined"
                  density="compact"
                  bg-color="white"
                  hide-details="auto"
                  class="mb-3"
                  clearable
                />
              </v-col>

              <v-col
                cols="12"
                md="6"
                class="field-manual"
              >
                <v-select
                  v-model="form.apertura_reclamo"
                  :items="aperturaReclamoOptions"
                  label="Apertura de Reclamo"
                  variant="outlined"
                  density="compact"
                  bg-color="white"
                  hide-details="auto"
                  class="mb-3"
                  clearable
                />
              </v-col>
              <v-col
                cols="12"
                md="6"
                class="field-manual"
              >
                <v-select
                  v-model="form.apertura_reclamo_detalle"
                  :items="aperturaReclamoDetalleOptions"
                  label="Detalle Apertura (Opcional)"
                  variant="outlined"
                  density="compact"
                  bg-color="white"
                  hide-details="auto"
                  class="mb-3"
                  clearable
                  :disabled="!form.apertura_reclamo"
                />
              </v-col>
            </v-row>
          </v-card>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4 bg-white d-flex justify-end ga-2 border-t">
          <v-btn
            variant="text"
            color="medium-emphasis"
            :disabled="loading"
            @click="cerrarModalCrear"
          >
            Cancelar
          </v-btn>

          <v-btn
            color="primary"
            variant="flat"
            :loading="loading"
            @click="isEditMode ? actualizarReclamo() : crearReclamo()"
          >
            {{ isEditMode ? 'Guardar Cambios' : 'Crear y Guardar' }}
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

    <v-snackbar
      v-model="snackbar.open"
      :color="snackbar.color"
      location="top right"
    >
      {{ snackbar.text }}
      <template #actions>
        <v-btn
          color="white"
          variant="text"
          @click="snackbar.open = false"
        >
          Done
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import apiAxios from '@/services/api'
import { useUserDetailStore } from '@/stores/userDetail'
import ReclamosConexionIndicadores from './ReclamosConexionIndicadores.vue'

const props = defineProps({
    fechaDesde: { type: String, default: '' },
    fechaHasta: { type: String, default: '' }
})

const userDetailStore = useUserDetailStore()

const dialogCrear = ref(false)
const dialogDetalle = ref(false)
const dialogGaleria = ref(false)
const dialogEditar = ref(false)
const isEditMode = ref(false)
const editingReclamoId = ref(null)

const selectedReclamo = ref(null)
const fotosGaleria = ref([])

// Flow / Equipos Refs (Moved up for scope access)
const flujosAprobacion = ref(null)
const flujos = ref([])
const showModalAsignar = ref(false)
const selectedSurveyIdSeleccionado = ref(null)
const equiposProyectos = ref([])

const editForm = ref({
    id_survey: null,
    id_user_contratista: null,
    id_user_supervisor: null,
    id_user_tecnico: null,
    fecha_plan_ini: '',
    fecha_plan_fin: ''
})
const editError = ref('')
const guardandoEdicion = ref(false)

// Listas para edición
const contratistas = ref([])
const usuarios = ref([])
const loadingUsuarios = ref(false)
const loadingRolesUsuarios = computed(() => !rolesFlujoList.value.length || !usuariosRolesList.value.length)

const loading = ref(false)
const loadingData = ref(false)
const error = ref('')
const estadosFiltroTabla = ref(['TODOS'])
const searchQuery = ref('')

const editingId = ref(null)
const editCache = ref({})

const reclamos = ref([])

const usuariosOrdenados = computed(() => {
    return sortByText(usuarios.value, u => u.nombre_user)
})

const usuariosNombresUnicos = computed(() => {
    const unicos = new Map()
    for (const u of (usuarios.value || [])) {
        const nombre = String(
            u?.nombre_user ||
            `${u?.name_frst || ''} ${u?.apellido_pat || ''} ${u?.apellido_mat || ''}`
        ).trim()
        if (!nombre) continue
        const key = normalizeLabelText(nombre)
        if (!key || unicos.has(key)) continue
        unicos.set(key, { ...u, nombre_user: nombre })
    }
    return sortByText(Array.from(unicos.values()), x => x.nombre_user)
})

const normalizeRoleCode = value => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase()

const supervisoresTerraconOptions = computed(() => {
    const rolSupervisor = (rolesFlujoList.value || []).find(r => normalizeRoleCode(r?.name_rol) === 'CNX-TRC-SUP')
    if (!rolSupervisor?.id_rol) return []

    const idsSupervisores = new Set(
        (usuariosRolesList.value || [])
            .filter(ur => Number(ur?.id_rol) === Number(rolSupervisor.id_rol))
            .map(ur => Number(ur?.id_user))
            .filter(id => Number.isFinite(id) && id > 0)
    )

    if (!idsSupervisores.size) return []
    return usuariosNombresUnicos.value.filter(u => idsSupervisores.has(Number(u?.id_user)))
})


const clientes = ref([])
const proyectos = ref([])
const icSapOptions = ref([])
const icSapOptionsBase = ref([])
const icSapHistoricoCache = ref([])
const icSearchText = ref('')
const loadingIcSap = ref(false)

const CONEXION_RECLAMO_CLIENTE_ID = 4
const CONEXION_RECLAMO_PROYECTO_ID = 3

const form = reactive({
    ic_busqueda: null,
    fecha: '',
    id_cliente: CONEXION_RECLAMO_CLIENTE_ID,
    id_proyecto: CONEXION_RECLAMO_PROYECTO_ID,
    ic: '',
    fecha_conexion: '',
    supervisor_terracon: '',
    gestor: '',
    empresa_conecto: 'Metrogas',
    tecnico: '',
    fecha_recepcion_reclamo: '',
    fecha_plazo_respuesta_metrogas: '',
    anio: '',
    mes_recepcion_reclamo: '',
    fecha_visita: '',
    fecha_primera_solicitud: '',
    fecha_segunda_solicitud: '',
    direccion: '',
    comuna: '',
    nro_reclamo: '',
    observacion_terracon: '',
    contenido_reclamo: '',
    estado_reclamo: 'Pendiente',
    reclamo_pendiente_por: 'Metrogas',
    fecha_correo_cierre_mtgs: '',
    fecha_cierre_gio: '',
    aplica_no_aplica: 'Aplica',
    reclamo_atribuible_a: 'Metrogas',
    tipo_reclamo: 'Artefacto',
    apertura_reclamo: 'Artefacto',
    apertura_reclamo_detalle: 'Calefon',
    cuadrilla: 'Vigente'
})

const estadoReclamoOptions = ['Solucionado', 'Pendiente']
const reclamoPendientePorOptions = ['Metrogas', 'Contratista', 'Cliente']
const aplicaNoAplicaOptions = ['Aplica', 'No Aplica']
const reclamoAtribuibleAOptions = ['Contratista', 'Cliente', 'Metrogas']
const mesRecepcionOptions = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]
const tipoReclamoOptions = [
    'Artefacto',
    'Terminacion',
    'Documento',
    'Filtracion de agua',
    'Filtracion de gas',
    'Certificacion',
    'No corresponde',
    'Otros'
]
const aperturaReclamoOptions = ['Artefacto', 'Terminacion', 'Fuga de gas', 'Filtracion de agua']
const cuadrillaOptions = ['Vigente', 'No Vigente']
const aperturaReclamoDetalleMap = {
    Artefacto: ['Calefon', 'Cocina', 'Estufa', 'Caldera', 'Otros'],
    Terminacion: [
        'Sellado de ducto',
        'Flexible agua',
        'Visor en Muro',
        'Vidrio',
        'Pintura',
        'Instalacion Nicho Medidor',
        'Modificar trazado red',
        'Ceramica',
        'Compactacion',
        'Reposiciones',
        'Otros'
    ],
    'Fuga de gas': ['Conexion de artefacto', 'Flexible de gas', 'Red de gas', 'Conexion Medidor', 'Otro'],
    'Filtracion de agua': ['Conexion de artefacto', 'Flexible de agua', 'Red de agua']
}

const aperturaReclamoDetalleOptions = computed(() => {
    return aperturaReclamoDetalleMap[form.apertura_reclamo] || []
})

function applyConexionReclamoScope() {
    form.id_cliente = CONEXION_RECLAMO_CLIENTE_ID
    form.id_proyecto = CONEXION_RECLAMO_PROYECTO_ID
}

function getConexionReclamoClienteId() {
    return Number(form.id_cliente || CONEXION_RECLAMO_CLIENTE_ID)
}

function getConexionReclamoProyectoId() {
    return Number(form.id_proyecto || CONEXION_RECLAMO_PROYECTO_ID)
}

const snackbar = ref({
    open: false,
    text: '',
    color: 'success'
})

// === Helpers ===

function hoyYYYYMMDD() {
    const d = new Date()
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
}

function ahoraYYYYMMDDHHmm() {
    const d = new Date()
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const hh = String(d.getHours()).padStart(2, '0')
    const mi = String(d.getMinutes()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
}

function safeJsonParse(v, fallback) {
    try {
        if (v === null || v === undefined) return fallback
        if (typeof v === 'string') return JSON.parse(v)
        if (typeof v === 'object') return v
        return fallback
    } catch {
        return fallback
    }
}

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj ?? {}))
}

const sortByText = (arr, selector) =>
    [...(arr ?? [])].sort((a, b) =>
        String(selector(a) ?? '').localeCompare(String(selector(b) ?? ''), 'es', { sensitivity: 'base', numeric: true })
    )

function getColorEstado(est) {
    if (!est) return 'grey'
    const e = String(est).toLowerCase().trim()
    if (e === 'pendiente') return 'warning'
    if (e === 'asignado') return 'info'
    if (e === 'en ejecución' || e === 'en_ejecucion') return 'blue'
    if (e === 'terminado ok' || e === 'terminado_ok') return 'success'
    if (e === 'terminado no-ok' || e === 'terminado_no_ok') return 'error'

    // Estados de Flujo (Survey)
    if (e === 'pre creado' || e === 'pre_creado') return 'error'
    if (e === 'creado') return 'success'

    return 'grey'
}

// === API Reclamos ===

function normalizeLabelText(v) {
    return String(v || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]+/g, ' ')
        .trim()
        .toLowerCase()
}

function resolveTecnicoId(tecnicoValue) {
    if (tecnicoValue === undefined || tecnicoValue === null || tecnicoValue === '') return null
    const idDirecto = Number(tecnicoValue)
    if (Number.isFinite(idDirecto) && idDirecto > 0) return idDirecto

    const nombreNormalizado = normalizeLabelText(String(tecnicoValue))
    if (!nombreNormalizado) return null

    const tecnico = (usuariosNombresUnicos.value || []).find(u =>
        normalizeLabelText(u?.nombre_user) === nombreNormalizado
    )
    const idTecnico = Number(tecnico?.id_user)
    return Number.isFinite(idTecnico) && idTecnico > 0 ? idTecnico : null
}

function findAttr(segmentos, label) {
    if (!segmentos) return null
    const target = normalizeLabelText(label)

    for (const seg of segmentos) {
        if (seg.attributes) {
            for (const attr of seg.attributes) {
                if (normalizeLabelText(attr.label) === target) {
                    if (attr.value !== undefined && attr.value !== null) return attr.value
                    if (attr.answer !== undefined && attr.answer !== null) return attr.answer
                    if (attr.default !== undefined && attr.default !== null) return attr.default
                    return null
                }
            }
        }
    }
    return null
}

function findAttrFlexible(segmentos, labels = [], contains = []) {
    const exacts = (labels || []).map(v => normalizeLabelText(v)).filter(Boolean)
    const partials = (contains || []).map(v => normalizeLabelText(v)).filter(Boolean)

    for (const seg of (segmentos || [])) {
        for (const attr of (seg.attributes || [])) {
            const lbl = normalizeLabelText(attr?.label || '')
            const exactMatch = exacts.includes(lbl)
            const containsMatch = partials.some(p => lbl.includes(p))
            if (!exactMatch && !containsMatch) continue

            if (attr.value !== undefined && attr.value !== null && String(attr.value).trim() !== '') return attr.value
            if (attr.answer !== undefined && attr.answer !== null && String(attr.answer).trim() !== '') return attr.answer
            if (attr.default !== undefined && attr.default !== null && String(attr.default).trim() !== '') return attr.default
        }
    }
    return null
}
function setAttrValue(segmentos, label, value) {
    if (!segmentos) return
    const target = String(label).trim().toLowerCase()

    for (const seg of segmentos) {
        if (seg.attributes) {
            for (const attr of seg.attributes) {
                // Check exact match or partial match if needed, but strict is safer for labels like 'IC' vs 'IC SAP'
                // Here we use strict equality on lowercased trimmed label as per findAttr logic
                if (String(attr.label).trim().toLowerCase() === target) {
                    attr.value = value
                    attr.answer = value
                    attr.default = value // Update default too just in case
                    return
                }
            }
        }
    }
}

function setAttrValueFlexible(segmentos, labels, value) {
    if (!segmentos || value === undefined || value === null || value === '') return
    const targets = (labels || []).map(normalizeLabelText).filter(Boolean)
    if (!targets.length) return

    for (const seg of segmentos) {
        if (!seg?.attributes) continue
        for (const attr of seg.attributes) {
            if (targets.includes(normalizeLabelText(attr?.label))) {
                attr.value = value
                attr.answer = value
                attr.default = value
                return
            }
        }
    }
}

function upsertAttrValueFlexible(segmentos, labels, value) {
    if (!Array.isArray(segmentos) || value === undefined || value === null || value === '') return

    const targets = (labels || []).map(normalizeLabelText).filter(Boolean)
    if (!targets.length) return

    for (const seg of segmentos) {
        if (!Array.isArray(seg?.attributes)) continue
        for (const attr of seg.attributes) {
            if (targets.includes(normalizeLabelText(attr?.label))) {
                attr.value = value
                attr.answer = value
                attr.default = value
                return
            }
        }
    }

    if (!segmentos.length) segmentos.push({ attributes: [] })
    if (!Array.isArray(segmentos[0].attributes)) segmentos[0].attributes = []

    segmentos[0].attributes.push({
        label: labels[0],
        value,
        answer: value,
        default: value
    })
}

function parseBodyReclamo(body) {
    const segmentos = body?.segmentos || []
    return {
        ic: findAttr(segmentos, 'IC'),
        fecha_conexion: findAttrFlexible(
            segmentos,
            ['Fecha de Conexión', 'Fecha Conexion', 'Fecha Conexión', 'Fecha de Conexion'],
            ['fecha conexion', 'fecha de conexion']
        ),
        supervisor_terracon: findAttrFlexible(
            segmentos,
            ['Supervisor Terracon', 'Supervisor TRC', 'Supervisor de Terracon', 'Supervisor'],
            ['supervisor terracon', 'supervisor trc']
        ),
        gestor: findAttrFlexible(
            segmentos,
            ['Gestor', 'Gio a cargo del Reclamo'],
            ['gestor', 'gio']
        ),
        empresa_conecto: findAttrFlexible(
            segmentos,
            ['Empresa', 'Empresa que conectó', 'Empresa que conecto', 'Empresa Conectó', 'Empresa Conecto', 'Contratista'],
            ['empresa', 'contratista']
        ),
        tecnico: findAttrFlexible(
            segmentos,
            ['Tecnico', 'Técnico', 'Técnico conexión original', 'Tecnico conexion original'],
            ['tecnico']
        ),
        fecha_recepcion_reclamo: findAttrFlexible(
            segmentos,
            ['Fecha Recepcion Reclamo', 'Fecha Recepción Reclamo', 'Fecha de recepción del reclamo', 'Fecha de recepcion del reclamo', 'Fecha recepción reclamo', 'Fecha recepcion reclamo'],
            ['fecha recepcion reclamo', 'fecha de recepcion del reclamo']
        ),
        fecha_plazo_respuesta_metrogas: findAttrFlexible(
            segmentos,
            ['Fecha Plazo Respuesta Metrogas', 'Fecha plazo respuesta metrogas', 'Fecha Plazo Respuesta METROG'],
            ['plazo respuesta', 'metrog']
        ),
        anio: findAttrFlexible(
            segmentos,
            ['Año', 'Ano'],
            ['ano']
        ),
        mes_recepcion_reclamo: findAttrFlexible(
            segmentos,
            ['Mes Recepcion Reclamo', 'Mes Recepción Reclamo'],
            ['mes recepcion reclamo']
        ),
        fecha_visita: findAttrFlexible(
            segmentos,
            ['Fecha de Visita', 'Fecha Visita'],
            ['fecha visita']
        ),
        fecha_primera_solicitud: findAttrFlexible(
            segmentos,
            ['Fecha 1ra Solicitud', 'Fecha 1ra. Solicitud'],
            ['1ra solicitud']
        ),
        fecha_segunda_solicitud: findAttrFlexible(
            segmentos,
            ['Fecha 2da Solicitud', 'Fecha 2da. Solicitud'],
            ['2da solicitud']
        ),
        fecha_correo_cierre_mtgs: findAttrFlexible(
            segmentos,
            ['Fecha Correo Cierre a MTGS', 'Fecha Correo Cierre a MTG', 'Fecha Correo Cierre MTGS'],
            ['correo cierre', 'mtgs']
        ),
        fecha_cierre_gio: findAttrFlexible(
            segmentos,
            ['Fecha de Cierre GIO', 'Fecha Cierre GIO'],
            ['cierre gio']
        ),
        reclamo_pendiente_por: findAttrFlexible(segmentos, ['Reclamo Pendiente por'], ['pendiente por']),
        aplica_no_aplica: findAttrFlexible(segmentos, ['Aplica / No Aplica', 'Aplica/ No Aplica'], ['aplica no aplica']),
        observacion_terracon: findAttrFlexible(
            segmentos,
            ['Observación Terracon', 'Observacion Terracon', 'Observacion/descripcion del problema.', 'Observación/descripción del problema.', 'Observacion del problema'],
            ['observacion terracon', 'observacion']
        ),
        contenido_reclamo: findAttrFlexible(
            segmentos,
            ['Contenido del Reclamo'],
            ['contenido del reclamo']
        ),
        reclamo_atribuible_a: findAttrFlexible(segmentos, ['Reclamo Atribuible a'], ['atribuible']),
        tipo_reclamo: findAttrFlexible(segmentos, ['Tipo Reclamo'], ['tipo reclamo']),
        apertura_reclamo: findAttrFlexible(segmentos, ['Apertura de Reclamo'], ['apertura de reclamo']),
        apertura_reclamo_detalle: findAttrFlexible(segmentos, ['Detalle Apertura Reclamo', 'Apertura de Reclamo Detalle'], ['detalle apertura']),
        cuadrilla: findAttrFlexible(segmentos, ['Cuadrilla'], ['cuadrilla']),

        // Compatibilidad con vistas anteriores
        nombre_cliente: findAttr(segmentos, 'Nombre del Cliente'),
        telefono: findAttrFlexible(segmentos, ['Telefono Cliente', 'Teléfono Cliente'], ['telefono cliente']),
        email: findAttr(segmentos, 'email del cliente.'),
        gio: findAttrFlexible(segmentos, ['Gio a cargo del Reclamo', 'Gestor'], ['gio', 'gestor']),
        supervisor_trc: findAttrFlexible(segmentos, ['Supervisor TRC', 'Supervisor Terracon'], ['supervisor']),
        tecnico_conexion_original: findAttrFlexible(
            segmentos,
            ['Técnico conexión original', 'Tecnico conexion original', 'Tecnico', 'Técnico'],
            ['tecnico']
        ),
        observacion: findAttrFlexible(
            segmentos,
            ['Observacion/descripcion del problema.', 'Observación/descripción del problema.', 'Observacion Terracon', 'Observación Terracon'],
            ['observacion']
        ),

        direccion: findAttrFlexible(segmentos, ['Direccion', 'Dirección'], ['direccion']),
        comuna: findAttr(segmentos, 'Comuna'),
        nro_reclamo: findAttrFlexible(
            segmentos,
            ['Nro Reclamo', 'N° Reclamo', 'Nº Reclamo', 'Nmro Reclamo', 'Numero Reclamo', 'Número Reclamo'],
            ['nro reclamo', 'numero reclamo', 'nmro reclamo']
        ),
        estado_conexion: findAttrFlexible(
            segmentos,
            ['Estado Conexión', 'Estado Conexion', 'Estado de Conexión', 'Estado de Conexion'],
            ['estado conexion', 'estado de conexion']
        ),
        estado: findAttr(segmentos, 'Estado'),
        fecha_creacion: findAttrFlexible(
            segmentos,
            ['Fecha Creacion', 'Fecha Creación', 'Fecha de Creacion', 'Fecha de Creación'],
            ['fecha creaci', 'fecha creacion']
        ),
        sysdatehhmm: findAttrFlexible(
            segmentos,
            ['sysdatehhmm', 'sysdate hhmm', 'sysdate hh:mm', 'sysdate'],
            ['sysdate']
        ),
        fecha_target: findAttr(segmentos, 'Fecha Target Max (+48hrs)'),
        fecha_cierre: findAttr(segmentos, 'Fecha Cierre Real'),
        sla_real: findAttr(segmentos, 'SLA Real'),
    }
}

function normalizeDateToYMD(raw) {
    if (!raw) return ''
    const s = String(raw).trim()
    if (!s) return ''

    // Caso: viene con prefijo/texto como "sysdatehhmm ..." y la fecha está embebida
    const isoAnywhere = s.match(/(\d{4})-(\d{2})-(\d{2})/)
    if (isoAnywhere) return `${isoAnywhere[1]}-${isoAnywhere[2]}-${isoAnywhere[3]}`

    const dmyAnywhere = s.match(/(\d{2})[\/-](\d{2})[\/-](\d{4})/)
    if (dmyAnywhere) return `${dmyAnywhere[3]}-${dmyAnywhere[2]}-${dmyAnywhere[1]}`

    const compactAnywhere = s.match(/(\d{4})(\d{2})(\d{2})(\d{0,4})/)
    if (compactAnywhere) return `${compactAnywhere[1]}-${compactAnywhere[2]}-${compactAnywhere[3]}`

    const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`

    const dmy = s.match(/^(\d{2})[\/-](\d{2})[\/-](\d{4})/)
    if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`

    const compact = s.match(/^(\d{4})(\d{2})(\d{2})(\d{0,4})$/)
    if (compact) return `${compact[1]}-${compact[2]}-${compact[3]}`

    const d = new Date(s)
    if (!isNaN(d.getTime())) {
        const yyyy = d.getFullYear()
        const mm = String(d.getMonth() + 1).padStart(2, '0')
        const dd = String(d.getDate()).padStart(2, '0')
        return `${yyyy}-${mm}-${dd}`
    }
    return ''
}

function formatDateDMY(raw) {
    if (/sysdatehhmm|sysdate/i.test(String(raw ?? '').trim())) return ''
    const ymd = normalizeDateToYMD(raw)
    if (!ymd) return ''
    const [yyyy, mm, dd] = ymd.split('-')
    if (!yyyy || !mm || !dd) return ''
    return `${dd}-${mm}-${yyyy}`
}

function formatDateNoT(raw) {
    if (!raw) return ''
    const s = String(raw).trim()
    if (!s) return ''
    if (/sysdatehhmm|sysdate/i.test(s)) return ''

    const isoDateTime = s.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2}))?/)
    if (isoDateTime) {
        const yyyy = isoDateTime[1]
        const mm = isoDateTime[2]
        const dd = isoDateTime[3]
        const hh = isoDateTime[4]
        const mi = isoDateTime[5]
        return `${dd}-${mm}-${yyyy} ${hh}:${mi}`
    }

    const ymd = normalizeDateToYMD(s)
    if (ymd) {
        const [yyyy, mm, dd] = ymd.split('-')
        return `${dd}-${mm}-${yyyy}`
    }

    return s.replace('T', ' ')
}

function formatAplicaNoAplica(raw) {
    const s = String(raw ?? '').trim().toUpperCase()
    if (!s) return '-'
    if (s === 'A' || s === 'APLICA') return 'Aplica'
    if (s === 'NA' || s === 'NO APLICA') return 'No Aplica'
    return String(raw)
}

const reclamosFiltrados = computed(() => {
    if (!props.fechaDesde && !props.fechaHasta) return reclamos.value
    return (reclamos.value || []).filter(item => {
        const rawFecha = getFechaReclamoFiltro(item)
        const fecha = normalizeDateToYMD(rawFecha)

        if (!fecha) return false
        if (props.fechaDesde && fecha < props.fechaDesde) return false
        if (props.fechaHasta && fecha > props.fechaHasta) return false
        return true
    })
})

function getFechaReclamoFiltro(item) {
    return (
        item?.parsed?.fecha_recepcion_reclamo ||
        item?.parsed?.fecha_creacion ||
        item?.parsed?.sysdatehhmm ||
        item?.sysdatehhmm ||
        item?.fecha_plan_ini ||
        item?.fecha_plan_fin ||
        ''
    )
}

const estadosTablaOptions = computed(() => {
    const source = Array.isArray(reclamos.value) ? reclamos.value : []
    const estados = source
        .map(r => String(r?.parsed?.estado || r?.estado_srv || '').trim())
        .filter(Boolean)
    const uniq = [...new Set(estados)].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }))
    return ['TODOS', ...uniq]
})

const estadosDisponibles = computed(() => estadosTablaOptions.value.filter(e => e !== 'TODOS'))

function isEstadoActivo(estado) {
    return (estadosFiltroTabla.value || []).includes(estado)
}

function toggleEstadoFiltro(estado) {
    const current = new Set(estadosFiltroTabla.value || [])

    if (estado === 'TODOS') {
        estadosFiltroTabla.value = ['TODOS']
        return
    }

    current.delete('TODOS')
    if (current.has(estado)) current.delete(estado)
    else current.add(estado)

    estadosFiltroTabla.value = current.size ? Array.from(current) : ['TODOS']
}

const reclamosVista = computed(() => {
    const base = Array.isArray(reclamosFiltrados.value) ? [...reclamosFiltrados.value] : []
    const activos = Array.isArray(estadosFiltroTabla.value) ? estadosFiltroTabla.value : ['TODOS']
    const filtraTodos = activos.includes('TODOS')
    const filtroSet = new Set(activos.map(v => String(v || '').trim()).filter(Boolean))

    let filtrados = filtraTodos
        ? base
        : base.filter(r => filtroSet.has(String(r?.parsed?.estado || r?.estado_srv || '').trim()))

    // Filtro por texto abierto
    const rawQuery = searchQuery.value
    if (rawQuery !== null && rawQuery !== undefined && String(rawQuery).trim() !== '') {
        const query = normalizeLabelText(rawQuery)
        if (query) {
            filtrados = filtrados.filter(r => {
                const text = normalizeLabelText(
                    String(r.id_survey || '') + ' ' +
                    String(r.parsed?.nro_reclamo || '') + ' ' +
                    String(r.parsed?.ic || '') + ' ' +
                    String(r.parsed?.comuna || '') + ' ' +
                    String(r.parsed?.direccion || '') + ' ' +
                    String(r.parsed?.tecnico || '') + ' ' +
                    String(r.parsed?.tecnico_conexion_original || '') + ' ' +
                    String(r.parsed?.tipo_reclamo || '') + ' ' +
                    String(r.parsed?.estado_conexion || '') + ' ' +
                    String(r.parsed?.observacion || '') + ' ' +
                    String(r.parsed?.observacion_terracon || '')
                )
                return text.includes(query)
            })
        }
    }

    return filtrados.sort((a, b) => Number(b?.id_survey || 0) - Number(a?.id_survey || 0))
})
function findSegmentByLabel(body, labelKeyword) {
    if (!body?.segmentos) return null
    return body.segmentos.find(s => String(s.label).toLowerCase().includes(labelKeyword.toLowerCase()))
}

function extractFotos(body) {
    const fotos = []
    if (!body) return []

    // Helper recursivo o iterar segmentos
    const segmentos = body.segmentos || []
    for (const seg of segmentos) {
        if (!seg.attributes) continue
        for (const attr of seg.attributes) {
            // photoCapture
            if (attr.type === 'photoCapture' && Array.isArray(attr.galeria)) {
                fotos.push(...attr.galeria)
            }
            // registroEventos
            if (attr.type === 'registroEventos' && Array.isArray(attr.body)) {
                for (const ev of attr.body) {
                    if (Array.isArray(ev.galeria)) fotos.push(...ev.galeria)
                }
            }
        }
    }
    return fotos
}

async function fetchReclamos() {
    loadingData.value = true
    reclamos.value = []

    try {
        // Parametros para V3
        const params = new URLSearchParams()


        // Filtro por template ID 153 si el backend lo soporta, o traemos todo y filtramos
        // Intentamos pasar ts.id_template=153
        params.append('ts.id_template', 153)

        console.log('Fetching Reclamos with params:', params.toString())
        const { data } = await apiAxios.get(`/servicio/leanglobal/procesosSurveyV3?${params.toString()}`)

        console.log('Reclamos Raw Response:', data)
        const rawList = data.datos || []

        // Filtramos por si acaso el backend no tomó el filter
        const filtered = rawList.filter(r => Number(r.id_template) === 153)
        console.log('Reclamos Filtered by ID 153:', filtered)

        // Orden Desc por ID
        filtered.sort((a, b) => b.id_survey - a.id_survey)

        // Ahora enriquecemos con Detail (body_exec)
        // Hacemos llamadas en paralelo pero limitadas o todas si son pocas (paginación?)
        // Como no hay paginación obvia, asumimos volumen moderado.

        const promises = filtered.map(async (item) => {
            try {
                // Obtener detalle para parsear body_exec
                const detailResp = await apiAxios.get(`/servicio/leanglobal/procesosSurveyDetail?id_survey=${item.id_survey}`)
                const detailData = Array.isArray(detailResp.data) ? detailResp.data[0] : detailResp.data?.surveyDetail?.[0]

                const bodyJson = safeJsonParse(detailData?.body_exec || detailData?.json_exec, { segmentos: [] })

                // Parse fields
                const parsed = parseBodyReclamo(bodyJson)
                const registroComplementarioSeg = findSegmentByLabel(bodyJson, 'Registro complementario') || findSegmentByLabel(bodyJson, 'Antecedentes Complementarios')
                const fotos = extractFotos(bodyJson)

                return {
                    ...item,
                    body_exec: bodyJson,
                    parsed,
                    registroComplementarioSeg,
                    fotos
                }
            } catch (e) {
                console.error(`Error detalle survey ${item.id_survey}`, e)
                return { ...item, parsed: {}, error: true }
            }
        })

        reclamos.value = await Promise.all(promises)
        console.log('Reclamos Final List:', reclamos.value)

    } catch (e) {
        console.error('Error fetching reclamos:', e)
        error.value = 'Error al cargar los reclamos.'
    } finally {
        loadingData.value = false
    }
}


// === Actions ===

function abrirDetalle(item) {
    selectedReclamo.value = item
    dialogDetalle.value = true
}

function abrirGaleria(item) {
    fotosGaleria.value = item.fotos || []
    dialogGaleria.value = true
}

// === Edición Logic ===

const usuariosPorEmpresaContratista = computed(() => {
    const idEmpresa = Number(editForm.value.id_user_contratista)
    if (!idEmpresa) return []
    return sortByText(
        (usuarios.value ?? []).filter(u => Number(u.id_empresa) === idEmpresa),
        u => u.nombre_user
    )
})

async function fetchEmpresas() {
    try {
        const { data } = await apiAxios.get('/servicio/leanglobal/obtenerEmpresas')
        if (Array.isArray(data)) {
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
    if (loadingUsuarios.value) return
    loadingUsuarios.value = true
    try {
        const { data } = await apiAxios.get('/servicio/leanglobal/obtenerUsuarios')
        usuarios.value = Array.isArray(data) ? data : []
    } catch (err) {
        console.error(err)
        usuarios.value = []
    } finally {
        loadingUsuarios.value = false
    }
    await fetchEmpresas()
}

function normalizeToDateTimeLocal(raw) {
    if (!raw) return ''
    const s = String(raw).trim()
    if (!s || /sysdatehhmm|sysdate/i.test(s)) return ''

    const isoDateTime = s.match(/(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})/)
    if (isoDateTime) {
        return `${isoDateTime[1]}-${isoDateTime[2]}-${isoDateTime[3]}T${isoDateTime[4]}:${isoDateTime[5]}`
    }

    const dmyDateTime = s.match(/(\d{2})[\/-](\d{2})[\/-](\d{4})[T\s](\d{2}):(\d{2})/)
    if (dmyDateTime) {
        return `${dmyDateTime[3]}-${dmyDateTime[2]}-${dmyDateTime[1]}T${dmyDateTime[4]}:${dmyDateTime[5]}`
    }

    const ymd = normalizeDateToYMD(s)
    if (ymd) return `${ymd}T00:00`

    const d = new Date(s)
    if (!isNaN(d.getTime())) {
        const yyyy = d.getFullYear()
        const mm = String(d.getMonth() + 1).padStart(2, '0')
        const dd = String(d.getDate()).padStart(2, '0')
        const hh = String(d.getHours()).padStart(2, '0')
        const mi = String(d.getMinutes()).padStart(2, '0')
        return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
    }
    return ''
}

function extractYearFromDateInput(raw) {
    if (!raw) return ''
    const s = String(raw).trim()
    if (!s) return ''

    const ymd = s.match(/^(\d{4})-\d{2}-\d{2}/)
    if (ymd) return ymd[1]

    const dmy = s.match(/^\d{2}[\/-]\d{2}[\/-](\d{4})/)
    if (dmy) return dmy[1]

    const d = new Date(s)
    if (!isNaN(d.getTime())) return String(d.getFullYear())

    return ''
}

function extractMonthNameFromDateInput(raw) {
    if (!raw) return ''
    const s = String(raw).trim()
    if (!s) return ''

    const ymd = s.match(/^\d{4}-(\d{2})-\d{2}/)
    if (ymd) {
        const idx = Number(ymd[1]) - 1
        return mesRecepcionOptions[idx] || ''
    }

    const dmy = s.match(/^\d{2}[\/-](\d{2})[\/-]\d{4}/)
    if (dmy) {
        const idx = Number(dmy[1]) - 1
        return mesRecepcionOptions[idx] || ''
    }

    const d = new Date(s)
    if (!isNaN(d.getTime())) return mesRecepcionOptions[d.getMonth()] || ''

    return ''
}

function calcularFechaPlazoMetrogas(fechaRecepcionRaw) {
    const s = String(fechaRecepcionRaw || '').trim()
    if (!s) return ''

    const match = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (match) {
        const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
        if (!isNaN(d.getTime())) {
            d.setDate(d.getDate() + 2)
            const yyyy = d.getFullYear()
            const mm = String(d.getMonth() + 1).padStart(2, '0')
            const dd = String(d.getDate()).padStart(2, '0')
            return `${yyyy}-${mm}-${dd}`
        }
    }

    const normalized = normalizeDateToYMD(s)
    if (!normalized) return ''
    const d = new Date(`${normalized}T00:00:00`)
    if (isNaN(d.getTime())) return ''
    d.setDate(d.getDate() + 2)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
}

// === Helpers Edición (Igual que CrearInspeccionConexion) ===

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

function extraerAsignacionesDeDetail(detail) {
    const row =
        (Array.isArray(detail) ? detail?.[0] : null) ||
        (detail?.surveyDetail?.[0] ?? null) ||
        null

    if (!row) return { contratista: null, supervisor: null, tecnico: null }

    // lugares típicos
    const a1 = row?.asignaciones ?? row?.asignacion ?? null
    const a2 = row?.header_exec?.asignaciones ?? row?.header_exec?.asignacion ?? null
    const a3 = row?.body_exec?.asignaciones ?? row?.body_exec?.asignacion ?? null

    const pool = [a1, a2, a3, row].filter(Boolean)

    // claves posibles por rol
    const kContr = [
        'id_user_contratista', 'contratista', 'Contratista', 'id_contratista', 'id_user_contratista_asignado'
    ]
    const kSup = [
        'id_user_supervisor', 'supervisor', 'Supervisor', 'id_supervisor', 'id_user_supervisor_asignado'
    ]
    const kTec = [
        'id_user_tecnico', 'tecnico', 'Tecnico', 'Tecnico', 'id_tecnico', 'id_user_tecnico_asignado'
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

async function abrirEditar(item) {
    editError.value = ''
    const id = Number(item?.id_survey || 0) || null
    if (!id) return

    // Init form
    editForm.value = {
        id_survey: id,
        id_user_contratista: null,
        id_user_supervisor: null,
        id_user_tecnico: null,
        fecha_plan_ini: item.parsed?.fecha_plan_ini || '',
        fecha_plan_fin: ''
    }

    // Tratamos de obtener fechas del item raw si existen
    if (!editForm.value.fecha_plan_ini && item.fecha_plan_ini) editForm.value.fecha_plan_ini = item.fecha_plan_ini.split('T')[0]
    if (item.fecha_plan_fin) editForm.value.fecha_plan_fin = item.fecha_plan_fin.split('T')[0]

    dialogEditar.value = true

    // Cargar detalle para obtener asignaciones actuales de forma robusta
    try {
        const detailResp = await apiAxios.get(`/servicio/leanglobal/procesosSurveyDetail?id_survey=${id}`)

        // Usar helper robusto
        const asignaciones = extraerAsignacionesDeDetail(detailResp.data)

        editForm.value.id_user_contratista = asignaciones.contratista
        editForm.value.id_user_supervisor = asignaciones.supervisor
        editForm.value.id_user_tecnico = asignaciones.tecnico

        // Refrescar fechas desde el detail por precisión
        const row = Array.isArray(detailResp.data) ? detailResp.data[0] : detailResp.data?.surveyDetail?.[0]
        if (row?.fecha_plan_ini) editForm.value.fecha_plan_ini = row.fecha_plan_ini.split('T')[0]
        if (row?.fecha_plan_fin) editForm.value.fecha_plan_fin = row.fecha_plan_fin.split('T')[0]

    } catch (e) {
        console.error('Error cargando detalle edicion', e)
    }
}

function cerrarModalEdicion() {
    dialogEditar.value = false
    editError.value = ''
}

async function guardarEdicion() {
    const id = Number(editForm.value.id_survey || 0)
    if (!id) return

    guardandoEdicion.value = true
    editError.value = ''

    try {
        const payloadAsignaciones = {
            id_survey: id,
            asignaciones: {
                Contratista: Number(editForm.value.id_user_contratista || 0),
                Supervisor: Number(editForm.value.id_user_supervisor || 0),
                Tecnico: Number(editForm.value.id_user_tecnico || 0)
            }
        }
        await apiAxios.post('/survey/UpdSurveyAsignaciones', payloadAsignaciones)

        // TODO: Si hubiera endpoint para actualizar fechas tambien usarlo aqui
        // Por ahora asumimos solo asignaciones o si tienes endpoint para fechas.

        dialogEditar.value = false
        await fetchReclamos()

    } catch (e) {
        console.error('Error guardando edicion', e)
        editError.value = e?.response?.data?.error || e?.message || 'Error guardando.'
    } finally {
        guardandoEdicion.value = false
    }
}


// === Inline Editing (CrearInspeccion Style) ===

function editar(item) {
    editingId.value = item.id_survey
    editCache.value = {
        id_survey: item.id_survey,
        id_user: item.id_user,
        fecha_plan_ini: item.fecha_plan_ini ? item.fecha_plan_ini.split('T')[0] : '',
        fecha_plan_fin: item.fecha_plan_fin ? item.fecha_plan_fin.split('T')[0] : ''
    }
}

function cancelarEdicion() {
    editingId.value = null
    editCache.value = {}
}

async function guardarCambios(item) {
    const data = {
        id_user: editCache.value.id_user,
        fecha_plan_ini: editCache.value.fecha_plan_ini,
        fecha_plan_fin: editCache.value.fecha_plan_fin
    }

    try {
        await apiAxios.put(`/survey/UpdPlan/${editCache.value.id_survey}`, data)

        // Notificacion (Opcional, igual que en CrearInspeccion)
        // await apiAxios.post('/notfqueue', ...)

        // Refrescar
        await fetchReclamos()

        snackbar.value = {
            open: true,
            text: 'Cambios guardados exitosamente.',
            color: 'success'
        }

    } catch (error) {
        console.error('âŒ Error al guardar cambios:', error)
        snackbar.value = {
            open: true,
            text: 'Error al guardar cambios.',
            color: 'error'
        }
    }

    editingId.value = null
}

// === Logic Create (Restored) ===

const valueComparator = (a, b) => Number(a) === Number(b)

const equiposItems = computed(() =>
    (equiposProyectos.value ?? []).map(e => ({ ...e, id_equipo_proyecto: Number(e.id_equipo_proyecto) }))
)

const nombreEquipoById = (id) => {
    const m = new Map()
    for (const e of equiposItems.value) m.set(e.id_equipo_proyecto, e.nombre_equipo)
    return m.get(Number(id)) ?? id
}

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
        f._orig_id = asNum(f.id_user)
        f._dirty = false
    })
}

function markDirty(fila, nuevoVal) {
    const nuevo = asNum(nuevoVal)
    if (fila._orig_id === undefined) fila._orig_id = asNum(fila.id_user)
    fila._dirty = nuevo !== fila._orig_id
    fila.id_user = nuevo
}

function markDirtyEquipo(fila, nuevoVal) {
    const nuevo = asNum(nuevoVal)
    const nombre = nombreEquipoById(nuevo)
    if (nombre && nombre !== nuevo) fila.nombre_user = nombre

    if (fila._orig_id === undefined) fila._orig_id = asNum(fila.id_user)
    fila._dirty = nuevo !== fila._orig_id

    fila.id_user = nuevo
    fila._id_equipo_proyecto = nuevo
}

// Flow Roles Logic
const rolesFlujoList = ref([])
const usuariosRolesList = ref([])
const usuariosFlow = ref([]) // copia de usuarios

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
    try {
        selectedSurveyIdSeleccionado.value = surveyId

        await obtenerFlujosAprobacion(surveyId)
        await obtenerFlujosByIdSurvey(flujosAprobacion.value)

        // Ensure teams loaded
        if (!equiposProyectos.value.length) await obtenerEquiposProyectos()

        flujos.value = (flujos.value ?? []).map(f => {
            const esEquipo = !!f.flag_equipo || /eq-?\s*fescol/i.test(String(f.name_rol || ''))
            const out = { ...f, flag_equipo: esEquipo }

            if (out.flag_equipo) {
                out.id_user = asNum(f.id_user ?? f.id_equipo_proyecto ?? f._id_equipo_proyecto)
                out._id_equipo_proyecto = out.id_user
            } else {
                out.id_user = asNum(f.id_user)
                out._id_equipo_proyecto = null
            }
            return out
        })

        prepararAsignaciones()
        showModalAsignar.value = true
    } catch (e) {
        console.error('Error showModalAsignarFlujo:', e)
        alert('Error al abrir modal flujo: ' + e.message)
    }
}

function onClickAsignarFlujo(item) {
    if (!item?.id_survey) return
    showModalAsignarFlujo(item.id_survey)
}

function colorIconoGrupo(item) {
    // Need to check real props or parsed/estado
    const st = item.parsed?.estado || item.estado_srv // reclamos mapping might be different
    if (st === 'Pre Creado') return 'red'
    if (st === 'Creado') return 'green'
    return 'grey'
}

function titleIconoGrupo(item) {
    const st = item.parsed?.estado || item.estado_srv
    if (st === 'Pre Creado') return 'Flujo NO asignado'
    if (st === 'Creado') return 'Flujo asignado'
    return 'Estado'
}

async function actualizarEstadoSurveyCreado(surveyId) {
    try {
        await apiAxios.post('/survey/UpdSurveyEstado', { id_survey: surveyId, estado_srv: 'Creado' })
    } catch (e) {
        console.error('âŒ Error al actualizar estado a Creado:', e)
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

    // Notifications logic if needed (simplified here)
    // ...

    await Promise.allSettled(reqs)

    if (selectedSurveyIdSeleccionado.value) {
        await actualizarEstadoSurveyCreado(selectedSurveyIdSeleccionado.value)
    }

    showModalAsignar.value = false
    snackbar.value = { open: true, text: 'Flujo asignado correctamente', color: 'success' }
    await fetchReclamos()
}

function getBodyValues(raw) {
    if (!raw) return {}
    const res = {}
    try {
        const obj = typeof raw === 'string' ? JSON.parse(raw) : raw
        if (obj?.segmentos) {
            for (const seg of obj.segmentos) {
                for (const attr of (seg.attributes || [])) {
                    if (!attr?.label) continue
                    const key = String(attr.label).trim().toUpperCase()
                    let val = attr.value
                    if (val === undefined || val === null) val = attr.answer
                    if (val === undefined || val === null) val = attr.respuesta
                    if (val === undefined || val === null) val = attr.default
                    res[key] = val !== undefined && val !== null ? String(val) : ''
                }
            }
        }
    } catch { }
    return res
}

function pickBodyValue(vals, keys = []) {
    for (const k of keys) {
        const v = vals[String(k || '').toUpperCase()]
        if (v !== undefined && v !== null && String(v).trim() !== '') return String(v).trim()
    }
    return ''
}

function normText(v) {
    return String(v ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .trim()
}

function includesNorm(haystack, needle) {
    const h = normText(haystack)
    const n = normText(needle)
    if (!n) return true
    return h.includes(n)
}

function pickRowValueByCandidates(row, candidates = []) {
    const keys = Object.keys(row || {})
    for (const cand of candidates) {
        const k = keys.find(x => normText(x) === normText(cand))
        if (k && row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') return row[k]
    }
    for (const cand of candidates) {
        const k = keys.find(x => normText(x).includes(normText(cand)))
        if (k && row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') return row[k]
    }
    return ''
}

function findLikelyIcKey(row) {
    const keys = Object.keys(row || {})
    const priority = keys.find(k => {
        const n = normText(k)
        return n.includes('IC_SAP') || n === 'IC' || n.startsWith('IC_')
    })
    if (priority) return priority
    return keys.find(k => normText(k).includes('IC')) || null
}

function buildRowSearchText(row) {
    try {
        return Object.values(row || {})
            .map(v => {
                if (v === null || v === undefined) return ''
                if (typeof v === 'object') return JSON.stringify(v)
                return String(v)
            })
            .join(' | ')
    } catch {
        return ''
    }
}

function filterIcOptionsByTerm(options, term) {
    if (!term) return options
    return (options || []).filter(o =>
        includesNorm(o?.ic, term) ||
        includesNorm(o?.label, term) ||
        includesNorm(o?.nombre_cliente, term) ||
        includesNorm(o?.__searchText, term)
    )
}

async function ensureHistoricoIcCache() {
    if (icSapHistoricoCache.value.length) return

    try {
        const { data } = await apiAxios.get('/servicio/leanglobal/obtenerHistoricoConexion')
        const rows = Array.isArray(data)
            ? data
            : Array.isArray(data?.rows)
                ? data.rows
                : Array.isArray(data?.data)
                    ? data.data
                    : []

        const mapped = rows.map((r) => {
            const icDirect = String((r?.ic_sap ?? pickRowValueByCandidates(r, ['IC_SAP_MG', 'IC SAP MG', 'IC-SAP', 'IC SAP', 'IC'])) || '').trim()
            const icKey = findLikelyIcKey(r)
            const icFallback = icKey ? String(r?.[icKey] ?? '').trim() : ''
            const ic = icDirect || icFallback
            if (!ic) return null

            const direccion = String((r?.direccion ?? pickRowValueByCandidates(r, ['DIRECCION', 'DIRECCIÓN', 'DIRECCIÃ“N'])) || '').trim()
            const comuna = String((r?.comuna ?? pickRowValueByCandidates(r, ['COMUNA'])) || '').trim()
            const nombre_cliente = String((r?.cliente ?? pickRowValueByCandidates(r, ['CLIENTE', 'NOMBRE_CLIENTE', 'NOMBRE CLIENTE'])) || '').trim()
            const telefono = String((r?.fono_1 ?? r?.fono_2 ?? pickRowValueByCandidates(r, ['FONOS', 'TELEFONO', 'TELÃ‰FONO'])) || '').trim()
            const gio = String((r?.gio ?? pickRowValueByCandidates(r, ['GIO'])) || '').trim()
            const supervisor = String((r?.superv ?? pickRowValueByCandidates(r, ['SUPERV', 'SUPERVISOR', 'USUARIO'])) || '').trim()
            const tipo = String((r?.tipo ?? pickRowValueByCandidates(r, ['TIPO'])) || '').trim()
            const proyecto_nombre = String((r?.proyecto ?? pickRowValueByCandidates(r, ['PROYECTO'])) || '').trim()
            const id_cliente = Number((r?.id_empresa_cliente ?? pickRowValueByCandidates(r, ['ID_EMPRESA_CLIENTE', 'ID_CLIENTE'])) || 0) || null
            const id_proyecto = Number((r?.id_proyecto ?? pickRowValueByCandidates(r, ['ID_PROYECTO'])) || 0) || null

            return {
                id_survey: null,
                id_cliente,
                id_proyecto,
                ic,
                direccion,
                comuna,
                nombre_cliente,
                telefono,
                gio,
                supervisor,
                tipo,
                proyecto_nombre,
                label: `${ic}${nombre_cliente ? ` - ${nombre_cliente}` : ''}`,
                __searchText: buildRowSearchText(r)
            }
        }).filter(Boolean)

        const uniq = new Map()
        for (const row of mapped) {
            const key = normText(row.ic)
            if (!key) continue
            if (!uniq.has(key)) uniq.set(key, row)
        }
        icSapHistoricoCache.value = Array.from(uniq.values())
    } catch (e) {
        console.error('Error cargando IC SAP desde historico:', e)
        icSapHistoricoCache.value = []
    }
}

const obtenerIcSapInspecciones = async () => {
    loadingIcSap.value = true
    try {
        const { data } = await apiAxios.get('/servicio/leanglobal/procesosSurveyV3')
        const base = Array.isArray(data?.datos) ? data.datos : []
        const inspecciones = base
            .filter(s => Number(s.id_area) === 8 && Number(s.id_template) !== 153)
            .sort((a, b) => (Number(b.id_survey) || 0) - (Number(a.id_survey) || 0))

        const enriched = await Promise.all(inspecciones.map(async (s) => {
            let vals = {}
            try {
                const detailResp = await apiAxios.get(`/servicio/leanglobal/procesosSurveyDetail?id_survey=${s.id_survey}`)
                const detailData = Array.isArray(detailResp.data) ? detailResp.data[0] : detailResp.data?.surveyDetail?.[0]
                const raw = detailData?.body_exec || detailData?.json_exec
                vals = getBodyValues(raw)
            } catch { }

            const ic = pickBodyValue(vals, ['IC_SAP MG', 'IC SAP MG']) || s.ic_sap_mg || s.ic_sap || ''
            if (!ic) return null

            const direccion = pickBodyValue(vals, ['DIRECCIÓN', 'DIRECCIÃ“N', 'DIRECCION']) || s.direccion || ''
            const comuna = pickBodyValue(vals, ['COMUNA']) || s.comuna || ''
            const nombre_cliente = pickBodyValue(vals, ['CLIENTE']) || s.name_empresa_cliente || ''
            const telefono = pickBodyValue(vals, ['FONOS', 'TELÃ‰FONO CLIENTE', 'TELEFONO CLIENTE', 'TELÃ‰FONO', 'TELEFONO']) || ''
            const gio = pickBodyValue(vals, ['GIO']) || s.gio || ''

            return {
                id_survey: s.id_survey,
                id_cliente: s.id_empresa_cliente ?? null,
                id_proyecto: s.id_proyecto ?? null,
                ic,
                direccion,
                comuna,
                nombre_cliente,
                telefono,
                gio,
                label: `${ic}${nombre_cliente ? ` - ${nombre_cliente}` : ''}`
            }
        }))

        const uniqByIc = new Map()
        for (const row of enriched) {
            if (!row?.ic) continue
            const key = String(row.ic).trim().toUpperCase()
            if (!uniqByIc.has(key)) uniqByIc.set(key, row)
        }
        icSapOptionsBase.value = Array.from(uniqByIc.values())
        icSapOptions.value = [...icSapOptionsBase.value]
    } catch (e) {
        console.error('Error al obtener IC SAP de inspecciones:', e)
        icSapOptionsBase.value = []
        icSapOptions.value = []
    } finally {
        loadingIcSap.value = false
    }
}

const obtenerClientes = async () => {
    try {
        const { data } = await apiAxios.get('/servicio/leanglobal/obtenerEmpresas')
        clientes.value = sortByText(data, x => x.name_empresa)
    } catch (err) {
        console.error(err)
    }
}

const obtenerProyectos = async (id_cliente) => {
    try {
        const { data } = await apiAxios.get('/servicio/leanglobal/obtenerProyectos?id_empresa_cliente=' + (id_cliente || ''))
        proyectos.value = sortByText(data, x => x.nombre_proyecto)
    } catch (err) {
        console.error(err)
    }
}

watch(() => form.id_cliente, (nuevoCliente) => {
    if (nuevoCliente) {
        obtenerProyectos(nuevoCliente)
    } else {
        proyectos.value = []
        form.id_proyecto = null
    }
})

watch(() => form.ic_busqueda, async (seleccion) => {
    if (!seleccion || typeof seleccion !== 'object') return

    const pool = [...(icSapOptionsBase.value || []), ...(icSapHistoricoCache.value || [])]
    const byIc = pool.find(opt => String(opt?.ic || '').trim() === String(seleccion.ic || '').trim())
    const direccionSeleccion =
        seleccion.direccion ||
        seleccion['DIRECCIÓN'] ||
        seleccion.DIRECCION ||
        byIc?.direccion ||
        byIc?.['DIRECCIÓN'] ||
        byIc?.DIRECCION ||
        ''

    form.ic = seleccion.ic || ''
    form.direccion = direccionSeleccion
    form.comuna = seleccion.comuna || ''
    form.gestor = seleccion.gestor || seleccion.gio || ''
    form.nro_reclamo = seleccion.nro_reclamo || form.nro_reclamo

    applyConexionReclamoScope()
    await obtenerProyectos(CONEXION_RECLAMO_CLIENTE_ID)
})

watch(icSearchText, async (txt) => {
    const term = String(txt || '').trim()

    const localMatches = filterIcOptionsByTerm(icSapOptionsBase.value, term)
    if (localMatches.length || !term) {
        icSapOptions.value = localMatches.length ? localMatches : [...icSapOptionsBase.value]
        return
    }

    loadingIcSap.value = true
    await ensureHistoricoIcCache()
    const histMatches = filterIcOptionsByTerm(icSapHistoricoCache.value, term)
    loadingIcSap.value = false

    if (histMatches.length) {
        icSapOptions.value = histMatches
    } else {
        icSapOptions.value = localMatches
    }
})

watch(() => form.fecha_recepcion_reclamo, (fecha) => {
    form.anio = extractYearFromDateInput(fecha)
    form.mes_recepcion_reclamo = extractMonthNameFromDateInput(fecha)
    form.fecha_plazo_respuesta_metrogas = calcularFechaPlazoMetrogas(fecha)
})

watch(() => form.apertura_reclamo, (apertura) => {
    const opciones = aperturaReclamoDetalleMap[apertura] || []
    if (!opciones.length) {
        form.apertura_reclamo_detalle = ''
        return
    }
    if (!opciones.includes(form.apertura_reclamo_detalle)) {
        form.apertura_reclamo_detalle = opciones[0]
    }
})

function cerrarModalCrear() {
    dialogCrear.value = false
    isEditMode.value = false
    editingReclamoId.value = null
    error.value = ''
    const hoy = hoyYYYYMMDD()
    const ahora = ahoraYYYYMMDDHHmm()
    // Reset form
    form.ic_busqueda = null
    form.fecha = hoy
    applyConexionReclamoScope()
    form.ic = ''
    form.fecha_conexion = hoy
    form.supervisor_terracon = ''
    form.gestor = ''
    form.empresa_conecto = 'Metrogas'
    form.tecnico = ''
    form.fecha_recepcion_reclamo = ahora
    form.fecha_plazo_respuesta_metrogas = calcularFechaPlazoMetrogas(ahora)
    form.anio = ''
    form.mes_recepcion_reclamo = ''
    form.fecha_visita = ''
    form.fecha_primera_solicitud = ''
    form.fecha_segunda_solicitud = ''
    form.direccion = ''
    form.comuna = ''
    form.nro_reclamo = ''
    form.observacion_terracon = ''
    form.contenido_reclamo = ''
    form.estado_reclamo = 'Pendiente'
    form.reclamo_pendiente_por = 'Metrogas'
    form.fecha_correo_cierre_mtgs = ''
    form.fecha_cierre_gio = ''
    form.aplica_no_aplica = 'Aplica'
    form.reclamo_atribuible_a = 'Metrogas'
    form.tipo_reclamo = 'Artefacto'
    form.apertura_reclamo = 'Artefacto'
    form.apertura_reclamo_detalle = 'Calefon'
    form.cuadrilla = 'Vigente'
}

function abrirCrearReclamo() {
    isEditMode.value = false
    editingReclamoId.value = null
    const hoy = hoyYYYYMMDD()
    const ahora = ahoraYYYYMMDDHHmm()
    form.fecha = hoy
    applyConexionReclamoScope()
    form.fecha_conexion = hoy
    form.fecha_recepcion_reclamo = ahora
    form.fecha_plazo_respuesta_metrogas = calcularFechaPlazoMetrogas(ahora)
    form.empresa_conecto = 'Metrogas'
    form.estado_reclamo = 'Pendiente'
    form.reclamo_pendiente_por = 'Metrogas'
    form.aplica_no_aplica = 'Aplica'
    form.tipo_reclamo = 'Artefacto'
    form.reclamo_atribuible_a = 'Metrogas'
    form.cuadrilla = 'Vigente'
    form.apertura_reclamo = 'Artefacto'
    form.apertura_reclamo_detalle = 'Calefon'
    dialogCrear.value = true
    if (!usuarios.value.length) {
        obtenerUsuarios()
    }
}

async function abrirEditarReclamo(item) {
    error.value = ''
    isEditMode.value = true
    editingReclamoId.value = Number(item?.id_survey || 0) || null
    if (!usuarios.value.length) {
        obtenerUsuarios()
    }

    form.ic_busqueda = null
    form.fecha = normalizeDateToYMD(item?.fecha_plan_ini || item?.parsed?.fecha_creacion) || hoyYYYYMMDD()
    applyConexionReclamoScope()
    if (form.id_cliente) await obtenerProyectos(form.id_cliente)
    form.ic = item?.parsed?.ic || ''
    form.fecha_conexion = normalizeDateToYMD(item?.parsed?.fecha_conexion) || ''
    form.supervisor_terracon = item?.parsed?.supervisor_terracon || item?.parsed?.supervisor_trc || ''
    form.gestor = item?.parsed?.gestor || item?.parsed?.gio || ''
    form.empresa_conecto = item?.parsed?.empresa_conecto || ''
    form.tecnico = item?.parsed?.tecnico || item?.parsed?.tecnico_conexion_original || ''
    form.fecha_recepcion_reclamo = normalizeToDateTimeLocal(item?.parsed?.fecha_recepcion_reclamo) || ''
    form.fecha_plazo_respuesta_metrogas = calcularFechaPlazoMetrogas(form.fecha_recepcion_reclamo)
    const anioParsed = item?.parsed?.anio !== undefined && item?.parsed?.anio !== null
        ? String(item.parsed.anio).trim()
        : ''
    form.anio = extractYearFromDateInput(form.fecha_recepcion_reclamo) || anioParsed
    const mesParsed = item?.parsed?.mes_recepcion_reclamo || ''
    form.mes_recepcion_reclamo = extractMonthNameFromDateInput(form.fecha_recepcion_reclamo) || mesParsed
    form.fecha_visita = normalizeDateToYMD(item?.parsed?.fecha_visita) || ''
    form.fecha_primera_solicitud = normalizeDateToYMD(item?.parsed?.fecha_primera_solicitud) || ''
    form.fecha_segunda_solicitud = normalizeDateToYMD(item?.parsed?.fecha_segunda_solicitud) || ''
    form.direccion = item?.parsed?.direccion || ''
    form.comuna = item?.parsed?.comuna || ''
    form.nro_reclamo = item?.parsed?.nro_reclamo || ''
    form.observacion_terracon = item?.parsed?.observacion_terracon || item?.parsed?.observacion || ''
    form.contenido_reclamo = item?.parsed?.contenido_reclamo || ''
    form.estado_reclamo = item?.parsed?.estado || ''
    form.reclamo_pendiente_por = item?.parsed?.reclamo_pendiente_por || ''
    form.fecha_correo_cierre_mtgs = normalizeDateToYMD(item?.parsed?.fecha_correo_cierre_mtgs) || ''
    form.fecha_cierre_gio = normalizeDateToYMD(item?.parsed?.fecha_cierre_gio) || ''
    form.aplica_no_aplica = formatAplicaNoAplica(item?.parsed?.aplica_no_aplica) === '-' ? '' : formatAplicaNoAplica(item?.parsed?.aplica_no_aplica)
    form.reclamo_atribuible_a = item?.parsed?.reclamo_atribuible_a || ''
    form.tipo_reclamo = item?.parsed?.tipo_reclamo || ''
    form.apertura_reclamo = item?.parsed?.apertura_reclamo || ''
    form.apertura_reclamo_detalle = item?.parsed?.apertura_reclamo_detalle || ''
    form.cuadrilla = item?.parsed?.cuadrilla || ''

    dialogCrear.value = true
}

async function crearReclamo() {
    loading.value = true
    error.value = ''

    try {
        const idTecnicoAsignado = resolveTecnicoId(form.tecnico)
        if (!idTecnicoAsignado) {
            throw new Error('Debe seleccionar un Tecnico valido para asignar el ejecutor.')
        }

        const { data: templates } = await apiAxios.get('/servicio/leanglobal/obtenerTemplates?id_tipo_srv=36')
        const tpl = (templates || []).find(t => Number(t.id_template) === 153)

        if (!tpl) throw new Error('No se encontro el template ID 153 (Reclamo).')

        const header_seed = tpl.header_seed || {}
        const approval_seed = tpl.approval_seed || {}
        const id_flow_tmpl = tpl.id_flow_tmpl || null
        const body_seed_obj = safeJsonParse(tpl.body_seed, { segmentos: [] })

        const body_seed = deepClone(body_seed_obj)
        const body_exec = deepClone(body_seed_obj)

        const fechaPlan = form.fecha || hoyYYYYMMDD()
        const idEmpresaCliente = getConexionReclamoClienteId()
        const idProyecto = getConexionReclamoProyectoId()

        const payload = {
            id_tipo_srv: 36,
            id_template: 153,
            id_survey_padre: null,
            id_user: idTecnicoAsignado,
            id_user_creacion: userDetailStore.userDetail?.id_user,
            id_empresa_cliente: idEmpresaCliente,
            estado_srv: 'Pre Creado',

            header_seed: JSON.stringify(header_seed),
            body_seed: JSON.stringify(body_seed),
            approval_seed: JSON.stringify(approval_seed),

            header_exec: JSON.stringify(header_seed),
            body_exec: JSON.stringify(body_exec),
            approval_exec: JSON.stringify(approval_seed),

            fecha_plan_ini: fechaPlan,
            fecha_plan_fin: fechaPlan,

            fecha_real_ini: null,
            fecha_real_fin: null,
            fecha_upload: null,

            latitud: null,
            longitud: null,
            id_proyecto: idProyecto,
            id_flow_tmpl
        }

        // ===================================
        // PRE-FILL BODY_EXEC (Update simulation)
        // ===================================
        const safeSet = (label, val) => {
            if (val === undefined || val === null || val === '') return
            upsertAttrValueFlexible(body_exec?.segmentos, [label], val)
        }

        const safeSetFlexible = (labels, val) => {
            if (val === undefined || val === null || val === '') return
            upsertAttrValueFlexible(body_exec?.segmentos, labels, val)
        }

        safeSet('IC', form.ic)
        safeSetFlexible(['Fecha de Conexión', 'Fecha Conexion'], form.fecha_conexion)
        safeSetFlexible(['Supervisor Terracon', 'Supervisor TRC'], form.supervisor_terracon)
        safeSetFlexible(['Gestor', 'Gio a cargo del Reclamo'], form.gestor)
        safeSetFlexible(['Empresa', 'Empresa que conectó', 'Contratista'], form.empresa_conecto)
        safeSetFlexible(['Tecnico', 'Técnico', 'Técnico conexión original'], form.tecnico)
        safeSetFlexible(['Fecha Recepción Reclamo', 'Fecha de recepción del reclamo'], form.fecha_recepcion_reclamo)
        safeSetFlexible(['Fecha Plazo Respuesta Metrogas', 'Fecha Plazo Respuesta METROG'], form.fecha_plazo_respuesta_metrogas)
        safeSetFlexible(['Año'], form.anio)
        safeSetFlexible(['Mes Recepción Reclamo'], form.mes_recepcion_reclamo)
        safeSetFlexible(['Fecha de Visita', 'Fecha Visita'], form.fecha_visita)
        safeSetFlexible(['Fecha 1ra Solicitud', 'Fecha 1ra. Solicitud'], form.fecha_primera_solicitud)
        safeSetFlexible(['Fecha 2da Solicitud', 'Fecha 2da. Solicitud'], form.fecha_segunda_solicitud)
        safeSet('Direccion', form.direccion)
        safeSet('Comuna', form.comuna)
        safeSet('Nmro Reclamo', form.nro_reclamo)
        safeSetFlexible(['Observación Terracon', 'Observacion Terracon', 'Observacion/descripción del problema.'], form.observacion_terracon)
        safeSetFlexible(['Contenido del Reclamo'], form.contenido_reclamo)
        safeSetFlexible(['Estado'], form.estado_reclamo)
        safeSetFlexible(['Reclamo Pendiente por'], form.reclamo_pendiente_por)
        safeSetFlexible(['Fecha Correo Cierre a MTGS', 'Fecha Correo Cierre a MTG'], form.fecha_correo_cierre_mtgs)
        safeSetFlexible(['Fecha de Cierre GIO', 'Fecha Cierre GIO'], form.fecha_cierre_gio)
        safeSetFlexible(['Aplica / No Aplica', 'Aplica/ No Aplica'], form.aplica_no_aplica)
        safeSetFlexible(['Reclamo Atribuible a'], form.reclamo_atribuible_a)
        safeSetFlexible(['Tipo Reclamo'], form.tipo_reclamo)
        safeSetFlexible(['Apertura de Reclamo'], form.apertura_reclamo)
        safeSetFlexible(['Detalle Apertura Reclamo', 'Apertura de Reclamo Detalle'], form.apertura_reclamo_detalle)
        safeSetFlexible(['Cuadrilla'], form.cuadrilla)

        // Update payload with modified body_exec
        payload.body_exec = JSON.stringify(body_exec)

        // CAMBIO: Iniciar en estado Creado
        payload.estado_srv = 'Creado'

        const resp = await apiAxios.post('/survey/', payload)
        const newSurveyId = resp.data?.id_survey || resp.data?.id

        if (newSurveyId) {
            const idContratista = resolveTecnicoId(form.empresa_conecto)
            const idSupervisor = resolveTecnicoId(form.supervisor_terracon)
            await autoAsignarYActivarFlujo(newSurveyId, idTecnicoAsignado, idSupervisor, idContratista)
        }

        snackbar.value = {
            open: true,
            text: 'Reclamo creado y asignado exitosamente.',
            color: 'success'
        }
        cerrarModalCrear()

        // Refresh list
        await fetchReclamos()

    } catch (e) {
        console.error(e)
        error.value = e?.response?.data?.message || e?.message || 'Error al crear el reclamo.'
    } finally {
        loading.value = false
    }
}

async function actualizarReclamo() {
    if (!editingReclamoId.value) return

    loading.value = true
    error.value = ''

    try {
        const detailResp = await apiAxios.get(`/servicio/leanglobal/procesosSurveyDetail?id_survey=${editingReclamoId.value}`)
        const row = Array.isArray(detailResp.data) ? detailResp.data[0] : detailResp.data?.surveyDetail?.[0]
        const body_exec = deepClone(safeJsonParse(row?.body_exec || row?.json_exec, { segmentos: [] }))

        const safeSet = (label, val) => {
            if (val === undefined || val === null || val === '') return
            upsertAttrValueFlexible(body_exec?.segmentos, [label], val)
        }
        const safeSetFlexible = (labels, val) => {
            if (val === undefined || val === null || val === '') return
            upsertAttrValueFlexible(body_exec?.segmentos, labels, val)
        }

        safeSet('IC', form.ic)
        safeSetFlexible(['Fecha de Conexión', 'Fecha Conexion'], form.fecha_conexion)
        safeSetFlexible(['Supervisor Terracon', 'Supervisor TRC'], form.supervisor_terracon)
        safeSetFlexible(['Gestor', 'Gio a cargo del Reclamo'], form.gestor)
        safeSetFlexible(['Empresa', 'Empresa que conectó', 'Contratista'], form.empresa_conecto)
        safeSetFlexible(['Tecnico', 'Técnico', 'Técnico conexión original'], form.tecnico)
        safeSetFlexible(['Fecha Recepción Reclamo', 'Fecha de recepción del reclamo'], form.fecha_recepcion_reclamo)
        safeSetFlexible(['Fecha Plazo Respuesta Metrogas', 'Fecha Plazo Respuesta METROG'], form.fecha_plazo_respuesta_metrogas)
        safeSetFlexible(['Año'], form.anio)
        safeSetFlexible(['Mes Recepción Reclamo'], form.mes_recepcion_reclamo)
        safeSetFlexible(['Fecha de Visita', 'Fecha Visita'], form.fecha_visita)
        safeSetFlexible(['Fecha 1ra Solicitud', 'Fecha 1ra. Solicitud'], form.fecha_primera_solicitud)
        safeSetFlexible(['Fecha 2da Solicitud', 'Fecha 2da. Solicitud'], form.fecha_segunda_solicitud)
        safeSet('Direccion', form.direccion)
        safeSet('Comuna', form.comuna)
        safeSet('Nmro Reclamo', form.nro_reclamo)
        safeSetFlexible(['Observación Terracon', 'Observacion Terracon', 'Observacion/descripción del problema.'], form.observacion_terracon)
        safeSetFlexible(['Contenido del Reclamo'], form.contenido_reclamo)
        safeSetFlexible(['Estado'], form.estado_reclamo)
        safeSetFlexible(['Reclamo Pendiente por'], form.reclamo_pendiente_por)
        safeSetFlexible(['Fecha Correo Cierre a MTGS', 'Fecha Correo Cierre a MTG'], form.fecha_correo_cierre_mtgs)
        safeSetFlexible(['Fecha de Cierre GIO', 'Fecha Cierre GIO'], form.fecha_cierre_gio)
        safeSetFlexible(['Aplica / No Aplica', 'Aplica/ No Aplica'], form.aplica_no_aplica)
        safeSetFlexible(['Reclamo Atribuible a'], form.reclamo_atribuible_a)
        safeSetFlexible(['Tipo Reclamo'], form.tipo_reclamo)
        safeSetFlexible(['Apertura de Reclamo'], form.apertura_reclamo)
        safeSetFlexible(['Detalle Apertura Reclamo', 'Apertura de Reclamo Detalle'], form.apertura_reclamo_detalle)
        safeSetFlexible(['Cuadrilla'], form.cuadrilla)

        const fechaPlan = form.fecha || normalizeDateToYMD(row?.fecha_plan_ini) || hoyYYYYMMDD()
        await apiAxios.put(`/survey/${editingReclamoId.value}`, {
            body_exec: JSON.stringify(body_exec),
            id_empresa_cliente: getConexionReclamoClienteId(),
            id_proyecto: getConexionReclamoProyectoId(),
            fecha_plan_ini: fechaPlan,
            fecha_plan_fin: fechaPlan
        })

        const idTecnicoAsignado = resolveTecnicoId(form.tecnico)
        const idContratista = resolveTecnicoId(form.empresa_conecto)
        const idSupervisor = resolveTecnicoId(form.supervisor_terracon)
        if (idTecnicoAsignado) {
            await autoAsignarYActivarFlujo(editingReclamoId.value, idTecnicoAsignado, idSupervisor, idContratista)
        }

        snackbar.value = {
            open: true,
            text: 'Reclamo actualizado y asignado exitosamente.',
            color: 'success'
        }

        cerrarModalCrear()
        await fetchReclamos()
    } catch (e) {
        console.error(e)
        error.value = e?.response?.data?.message || e?.message || 'Error al actualizar el reclamo.'
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    form.fecha = hoyYYYYMMDD()
    obtenerClientes()
    obtenerEquiposProyectos()
    fetchRolesFlujo()
    fetchUsuariosRoles()

    // Sync usuariosFlow when usuarios changes
    watch(usuarios, (v) => {
        usuariosFlow.value = v
    })
    obtenerUsuarios() // Cargar usuarios y empresas
    obtenerIcSapInspecciones()
    fetchReclamos()
})

async function autoAsignarYActivarFlujo(surveyId, idTecnico, idSupervisor, idContratista) {
    try {
        const { data: dataFlujo } = await apiAxios.get('/servicio/leanglobal/flujosAprobacion')
        const row = (dataFlujo.datos || []).find(f => Number(f.id_survey) === Number(surveyId))
        const flowId = row?.id_flow
        if (!flowId) return

        const { data: dataSteps } = await apiAxios.get(`/servicio/leanglobal/flujosAprobacionSteps?id_flow=${flowId}`)
        const steps = Array.isArray(dataSteps) ? dataSteps : []

        const reqs = []
        for (const step of steps) {
            const roleName = String(step.name_rol || '').trim().toUpperCase()
            let idToAssign = null
            let isEquipo = !!step.flag_equipo

            if (roleName.includes('CNX-TRC-TEC') || roleName.includes('TECNICO')) {
                idToAssign = idTecnico
            } else if (roleName.includes('CNX-TRC-SUP') || roleName.includes('SUPERVISOR')) {
                idToAssign = idSupervisor
            } else if (roleName.includes('CNX-CTRA') || roleName.includes('CONTRATISTA')) {
                idToAssign = idContratista
            }

            if (idToAssign) {
                reqs.push(apiAxios.put('/survey/UpdUserFlow', {
                    id_flow_stp: step.id_flow_stp,
                    id_user_flujo: Number(idToAssign),
                    flag_equipo: isEquipo
                }))
            }
        }

        if (reqs.length > 0) {
            await Promise.allSettled(reqs)
        }

        await apiAxios.post('/survey/UpdSurveyEstado', { id_survey: surveyId, estado_srv: 'Creado' })
    } catch (e) {
        console.error('Error auto-asignando flujo:', e)
    }
}
</script>

<style scoped>
.surface-card {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02) !important;
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

.legend-box {
    width: 12px;
    height: 12px;
    border-radius: 3px;
    display: inline-block;
}

.legend-auto {
    background: #e0f2fe;
    border: 1px solid #38bdf8;
}

.legend-manual {
    background: #fee2e2;
    border: 1px solid #ef4444;
}

.field-auto :deep(.v-field) {
    background-color: #eef8ff !important;
    border-left: 3px solid #38bdf8;
}

.field-manual :deep(.v-field) {
    background-color: #fff5f5 !important;
    border-left: 3px solid #ef4444;
}

.modal-reclamo-body {
    max-height: 72vh;
    overflow-y: auto;
}

.reclamo-form-card {
    border-radius: 10px;
}

.reclamo-cards-row {
    row-gap: 10px;
}

.reclamo-card {
    border-color: #e2e8f0 !important;
    border-radius: 12px !important;
    background: #fff;
}

.card-k {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #64748b;
    font-weight: 700;
    margin-bottom: 2px;
}

.card-v {
    font-size: 12px;
    color: #0f172a;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.card-v-multi {
    white-space: normal;
    line-height: 1.2rem;
}

/* Tabla Sakai Styles */
.tabla-sakai :deep(.v-table__wrapper > table) {
    table-layout: fixed;
    width: 100%;
    border-spacing: 0;
}

.tabla-sakai.editing-mode :deep(.v-table__wrapper > table) {
    table-layout: auto !important;
    width: max-content !important;
    min-width: 100%;
}

.tabla-sakai :deep(thead th) {
    white-space: nowrap;
    padding: 0 8px !important;
    height: 40px !important;
    background: #f8fafc;
    /* Sakai header bg */
}

.tabla-sakai :deep(tbody td) {
    padding: 4px 8px !important;
    height: 48px !important;
    font-size: 11px !important;
}

.cell-1line {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    display: block;
}

.row-hover:hover {
    background-color: #f1f5f9 !important;
}

.border-error {
    border: 1px solid rgb(var(--v-theme-error));
}

.disabled-icon {
    opacity: 0.3;
    pointer-events: none;
}
</style>



