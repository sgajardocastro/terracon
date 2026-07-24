<template>
  <div class="ppd-report-document-container modern-theme">
    <!-- Toolbar Controls (optional, shown if hideControls is false) -->
    <div
      v-if="!hideControls"
      class="d-flex align-center justify-end mb-5 gap-2 no-print"
    >
      <v-btn
        prepend-icon="mdi-printer"
        color="primary"
        variant="flat"
        size="small"
        class="ml-2 font-weight-bold rounded-lg elevation-1"
        @click="printReport"
      >
        Imprimir Reporte
      </v-btn>
    </div>

    <!-- Spinner Loading Detail -->
    <div
      v-if="loading"
      class="d-flex justify-center align-center py-12"
    >
      <v-progress-circular
        indeterminate
        color="primary"
        size="48"
      />
    </div>

    <!-- Document Print Container -->
    <div
      v-else-if="reportSurveyData"
      id="ppd-document-print-area"
      class="pa-6 bg-white rounded-xl border border-slate-200 shadow-sm"
    >
      <!-- 1) Sleek Glassmorphic Header Card -->
      <div class="modern-header-card pa-5 mb-6 rounded-xl border border-slate-100 bg-slate-50">
        <v-row
          align="center"
          no-gutters
        >
          <v-col
            cols="12"
            sm="4"
            class="text-center text-sm-left mb-4 mb-sm-0"
          >
            <div class="d-flex align-center justify-center justify-sm-start">
              <v-avatar
                color="primary-lighten-5"
                size="44"
                class="mr-3"
              >
                <v-icon
                  size="24"
                  color="primary"
                >
                  mdi-home-analytics
                </v-icon>
              </v-avatar>
              <div>
                <div
                  class="text-subtitle-1 font-weight-black text-slate-800 tracking-wide"
                  style="font-family: 'Outfit', sans-serif;"
                >
                  TERRACON
                </div>
                <div class="text-caption text-slate-500 font-weight-bold">
                  INGENIERÍA CONTROL Y GESTIÓN
                </div>
              </div>
            </div>
          </v-col>
          
          <v-col
            cols="12"
            sm="4"
            class="text-center mb-4 mb-sm-0"
          >
            <div
              class="text-subtitle-2 font-weight-black text-slate-900 tracking-widest text-uppercase"
              style="font-family: 'Outfit', sans-serif;"
            >
              PARTE DE PRODUCCIÓN DIARIA
            </div>
            <div class="text-caption text-slate-600 font-weight-bold mt-1 text-uppercase">
              MANTENCIÓN DE SERVIDUMBRE 2026
            </div>
          </v-col>
          
          <v-col
            cols="12"
            sm="4"
            class="d-flex flex-wrap gap-2 justify-center justify-sm-end"
          >
            <v-chip
              size="small"
              variant="flat"
              color="teal-lighten-5"
              class="text-teal-darken-2 font-weight-bold"
            >
              Fecha: {{ fecha ? formatDateString(fecha) : '—' }}
            </v-chip>
            <v-chip
              size="small"
              variant="flat"
              color="slate-100"
              class="text-slate-700 font-weight-bold"
            >
              Código: TPI-OTC-PRT-563-Rev.1
            </v-chip>
            <v-chip
              size="small"
              variant="flat"
              color="slate-100"
              class="text-slate-700 font-weight-bold"
            >
              Rev: 1/Dic.2025
            </v-chip>
            <v-chip
              size="small"
              variant="flat"
              color="slate-100"
              class="text-slate-700 font-weight-bold"
            >
              Página: 1 de 1
            </v-chip>
          </v-col>
        </v-row>
      </div>

      <!-- 2) Apertura de Actividades Diarias -->
      <div class="section-title d-flex align-center mb-3">
        <v-icon
          color="primary"
          class="mr-2"
          size="20"
        >
          mdi-table-headers-eye
        </v-icon>
        <span class="text-subtitle-2 font-weight-bold text-slate-800">APERTURA DE ACTIVIDADES DIARIAS</span>
      </div>
      
      <div class="table-container mb-6">
        <table class="modern-table">
          <thead>
            <tr>
              <th style="width: 15%;">
                Supervisor
              </th>
              <th style="width: 15%;">
                Patrulla
              </th>
              <th style="width: 8%; text-align: center;">
                EDP
              </th>
              <th style="width: 15%;">
                Partida
              </th>
              <th style="width: 15%;">
                Actividad
              </th>
              <th style="width: 10%; text-align: center;">
                Línea/Oleoducto
              </th>
              <th style="width: 22%;">
                Observación
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in selectedDateRows"
              :key="'apertura-' + row.idTarea + '-' + row.fecha"
            >
              <td class="font-weight-medium">
                {{ row.entry?.nombre || row.entry?.nombre_user || getFirmaByRol('Supervisor')?.nombre || 'Sin registrar' }}
              </td>
              <td>
                <span class="text-slate-600">{{ row.patrullas }}</span>
              </td>
              <td class="text-center">
                <v-chip
                  v-if="row.segment !== 'actividad' && row.codigoEdt"
                  size="x-small"
                  color="blue-lighten-5"
                  class="text-blue-darken-2 font-weight-bold"
                >
                  {{ row.codigoEdt }}
                </v-chip>
                <span
                  v-else
                  class="text-slate-300"
                >—</span>
              </td>
              <td>{{ row.partida }}</td>
              <td class="font-weight-bold text-slate-800">
                {{ row.actividad }}
              </td>
              <td class="text-center">
                <v-chip
                  size="x-small"
                  color="slate-100"
                  class="text-slate-700 font-weight-medium"
                >
                  {{ row.oleoducto }}
                </v-chip>
              </td>
              <td class="observation-cell">
                {{ row.entry?.observaciones || row.entry?.observacion || '—' }}
              </td>
            </tr>
            <tr v-if="!selectedDateRows.length">
              <td
                colspan="7"
                class="text-center py-6 text-slate-400 italic"
              >
                Sin actividades registradas para esta fecha.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 3) Detalle de Actividades de Mantención y Producción -->
      <div class="section-title d-flex align-center mb-3">
        <v-icon
          color="primary"
          class="mr-2"
          size="20"
        >
          mdi-clipboard-list-outline
        </v-icon>
        <span class="text-subtitle-2 font-weight-bold text-slate-800">DETALLE DE ACTIVIDADES DE MANTENCIÓN Y PRODUCCIÓN</span>
      </div>

      <div class="table-container mb-6">
        <table class="modern-table text-center-cells">
          <thead>
            <tr>
              <th
                rowspan="2"
                style="width: 22%; text-align: left;"
              >
                Actividad de Mantención
              </th>
              <th
                rowspan="2"
                style="width: 18%; text-align: left;"
              >
                Actividad de Cámara
              </th>
              <th
                rowspan="2"
                style="width: 18%; text-align: left;"
              >
                Otras Actividades
              </th>
              <th
                colspan="2"
                class="border-cell text-center header-group"
              >
                CCM (PK)
              </th>
              <th
                colspan="2"
                class="border-cell text-center header-group"
              >
                SFM (PK)
              </th>
              <th
                colspan="2"
                class="border-cell text-center header-group"
              >
                QCC (PK)
              </th>
              <th
                colspan="2"
                class="text-center header-group"
              >
                MAA MB (PK)
              </th>
            </tr>
            <tr class="sub-headers">
              <th class="text-center font-weight-medium text-slate-500">
                Inicio
              </th>
              <th class="text-center font-weight-medium text-slate-500 border-cell">
                Término
              </th>
              <th class="text-center font-weight-medium text-slate-500">
                Inicio
              </th>
              <th class="text-center font-weight-medium text-slate-500 border-cell">
                Término
              </th>
              <th class="text-center font-weight-medium text-slate-500">
                Inicio
              </th>
              <th class="text-center font-weight-medium text-slate-500 border-cell">
                Término
              </th>
              <th class="text-center font-weight-medium text-slate-500">
                Inicio
              </th>
              <th class="text-center font-weight-medium text-slate-500">
                Término
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in selectedDateRows"
              :key="row.idTarea + '-' + row.fecha"
            >
              <!-- Actividad de Mantención -->
              <td style="text-align: left;">
                <span
                  v-if="row.segment === 'servidumbre'"
                  class="font-weight-bold text-slate-800"
                >
                  {{ row.actividad }}
                </span>
                <span
                  v-else
                  class="text-slate-300"
                >—</span>
              </td>
              <!-- Actividad de Cámara -->
              <td style="text-align: left;">
                <span
                  v-if="row.segment === 'camaras'"
                  class="font-weight-bold text-slate-800"
                >
                  {{ row.actividad }}
                </span>
                <span
                  v-else
                  class="text-slate-300"
                >—</span>
              </td>
              <!-- Otras Actividades -->
              <td style="text-align: left;">
                <span
                  v-if="row.segment === 'actividad'"
                  class="text-slate-600"
                >
                  {{ row.actividad }}
                </span>
                <span
                  v-else
                  class="text-slate-300"
                >—</span>
              </td>
              
              <!-- CCM (PK) -->
              <td>{{ isOleoducto(row.oleoducto, 'ccm') && row.pkInicio ? row.pkInicio : '—' }}</td>
              <td class="border-cell">
                {{ isOleoducto(row.oleoducto, 'ccm') && row.pkFinal ? row.pkFinal : '—' }}
              </td>
              
              <!-- SFM (PK) -->
              <td>{{ isOleoducto(row.oleoducto, 'sfm') && row.pkInicio ? row.pkInicio : '—' }}</td>
              <td class="border-cell">
                {{ isOleoducto(row.oleoducto, 'sfm') && row.pkFinal ? row.pkFinal : '—' }}
              </td>
              
              <!-- QCC (PK) -->
              <td>{{ isOleoducto(row.oleoducto, 'qcc') && row.pkInicio ? row.pkInicio : '—' }}</td>
              <td class="border-cell">
                {{ isOleoducto(row.oleoducto, 'qcc') && row.pkFinal ? row.pkFinal : '—' }}
              </td>
              
              <!-- MAA MB (PK) -->
              <td>{{ isOleoducto(row.oleoducto, 'maa') && row.pkInicio ? row.pkInicio : '—' }}</td>
              <td>{{ isOleoducto(row.oleoducto, 'maa') && row.pkFinal ? row.pkFinal : '—' }}</td>
            </tr>
            <tr v-if="!selectedDateRows.length">
              <td
                colspan="11"
                class="text-center py-6 text-slate-400 italic"
              >
                Sin datos detallados registrados para esta fecha.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 4) KPI Summary Dashboard Grid -->
      <div class="section-title d-flex align-center mb-3">
        <v-icon
          color="primary"
          class="mr-2"
          size="20"
        >
          mdi-chart-box-outline
        </v-icon>
        <span class="text-subtitle-2 font-weight-bold text-slate-800">RESUMEN DE AVANCES E INDICADORES KPI</span>
      </div>

      <v-row
        dense
        class="mb-5"
      >
        <v-col
          cols="6"
          sm="3"
        >
          <v-card
            variant="flat"
            class="kpi-card pa-4 rounded-xl border border-slate-100 bg-slate-50 text-center h-100 d-flex flex-column justify-center"
          >
            <v-icon
              color="blue-darken-1"
              size="24"
              class="mx-auto mb-2"
            >
              mdi-clock-fast
            </v-icon>
            <div class="text-caption text-slate-500 font-weight-bold text-uppercase tracking-wider">
              Total Horas Hombre
            </div>
            <div class="text-h6 font-weight-black text-slate-800 mt-1">
              {{ kpiTotals.totalHoras }} hrs
            </div>
            <div class="text-caption text-slate-400 mt-1">
              Field: {{ kpiTotals.horasRealizadas }}h | Travel: {{ kpiTotals.horasTraslado }}h
            </div>
          </v-card>
        </v-col>
        <v-col
          cols="6"
          sm="3"
        >
          <v-card
            variant="flat"
            class="kpi-card pa-4 rounded-xl border border-slate-100 bg-slate-50 text-center h-100 d-flex flex-column justify-center"
          >
            <v-icon
              color="teal-darken-1"
              size="24"
              class="mx-auto mb-2"
            >
              mdi-camera-metering-matrix
            </v-icon>
            <div class="text-caption text-slate-500 font-weight-bold text-uppercase tracking-wider">
              Cámaras Realizadas
            </div>
            <div class="text-h6 font-weight-black text-teal-darken-2 mt-1">
              {{ kpiTotals.camarasRealizadas }} und
            </div>
            <div class="text-caption text-slate-400 mt-1">
              Inspección técnica
            </div>
          </v-card>
        </v-col>
        <v-col
          cols="6"
          sm="3"
        >
          <v-card
            variant="flat"
            class="kpi-card pa-4 rounded-xl border border-slate-100 bg-slate-50 text-center h-100 d-flex flex-column justify-center"
          >
            <v-icon
              color="orange-darken-1"
              size="24"
              class="mx-auto mb-2"
            >
              mdi-map-marker-distance
            </v-icon>
            <div class="text-caption text-slate-500 font-weight-bold text-uppercase tracking-wider">
              Avance de Trazado
            </div>
            <div class="text-h6 font-weight-black text-orange-darken-2 mt-1">
              {{ kpiTotals.pkAvance ? formatNumber(kpiTotals.pkAvance, 2) : '0' }} km
            </div>
            <div class="text-caption text-slate-400 mt-1">
              Avance lineal diario
            </div>
          </v-card>
        </v-col>
        <v-col
          cols="6"
          sm="3"
        >
          <v-card
            variant="flat"
            class="kpi-card pa-4 rounded-xl border border-slate-100 bg-slate-50 text-center h-100 d-flex flex-column justify-center"
          >
            <v-icon
              color="purple-darken-1"
              size="24"
              class="mx-auto mb-2"
            >
              mdi-shield-check-outline
            </v-icon>
            <div class="text-caption text-slate-500 font-weight-bold text-uppercase tracking-wider">
              Hitos de Servidumbre
            </div>
            <div class="text-h6 font-weight-black text-purple-darken-2 mt-1">
              {{ kpiTotals.hitosInstalados + kpiTotals.hitosPintados }} und
            </div>
            <div class="text-caption text-slate-400 mt-1">
              Inst: {{ kpiTotals.hitosInstalados }} | Pint: {{ kpiTotals.hitosPintados }}
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Detailed KPI Scrollable Table -->
      <div class="table-container scrollable-table mb-6">
        <table class="modern-table compact text-center-cells">
          <thead>
            <tr>
              <th style="text-align: left; min-width: 180px;">
                Actividades
              </th>
              <th>Horas Realizadas</th>
              <th>Horas Traslado</th>
              <th>Avance PK (Km)</th>
              <th>Hitos Inst.</th>
              <th>Hitos Pint.</th>
              <th>Logos Camb.</th>
              <th>Planchetas</th>
              <th>Pilares</th>
              <th>Señaléticas</th>
              <th>Total Cámaras</th>
              <th>KM Insp.</th>
              <th>Calicatas</th>
              <th>QCC</th>
              <th>CCM</th>
              <th>SFM</th>
              <th>MAA MB</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in selectedDateRows"
              :key="'total-' + row.idTarea + '-' + row.fecha"
            >
              <td
                class="font-weight-medium"
                style="text-align: left;"
              >
                {{ row.actividad }}
              </td>
              <td class="font-weight-bold">
                {{ row.horasRealizadas || '—' }}
              </td>
              <td>{{ row.horasTraslado || '—' }}</td>
              <td class="font-weight-bold text-orange-darken-2">
                {{ row.entry?.pk_avance_diario ?? row.entry?.pkAvanceDiario ?? '—' }}
              </td>
              <td>{{ row.entry?.totalHitosInstalados ?? row.entry?.total_hitos_instalados ?? '—' }}</td>
              <td>{{ row.entry?.totalHitosPintados ?? row.entry?.total_hitos_pintados ?? '—' }}</td>
              <td>{{ row.entry?.totalLogotiposCambiados ?? row.entry?.total_logotipos_cambiados ?? '—' }}</td>
              <td>{{ row.entry?.reposicionPlancheta ?? row.entry?.reposicion_plancheta ?? '—' }}</td>
              <td>{{ row.entry?.reposicionPilar ?? row.entry?.reposicion_pilar ?? '—' }}</td>
              <td>{{ row.entry?.instalacionSenaleticaNueva ?? row.entry?.instalacion_senaletica_nueva ?? '—' }}</td>
              <td class="font-weight-bold text-teal-darken-1">
                {{ row.camarasRealizadas || '—' }}
              </td>
              <td>{{ row.entry?.kmRecorridosInspeccion ?? row.entry?.km_recorridos_inspeccion ?? '—' }}</td>
              <td class="font-weight-bold">
                {{ row.entry?.totalCalicatasRealizadas ?? row.entry?.total_calicatas_realizadas ?? '—' }}
              </td>
              
              <!-- Cámaras por oleoducto -->
              <td>{{ (row.segment === 'camaras' && isOleoducto(row.oleoducto, 'qcc')) ? row.camarasRealizadas : '—' }}</td>
              <td>{{ (row.segment === 'camaras' && isOleoducto(row.oleoducto, 'ccm')) ? row.camarasRealizadas : '—' }}</td>
              <td>{{ (row.segment === 'camaras' && isOleoducto(row.oleoducto, 'sfm')) ? row.camarasRealizadas : '—' }}</td>
              <td>{{ (row.segment === 'camaras' && isOleoducto(row.oleoducto, 'maa')) ? row.camarasRealizadas : '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 5) Observaciones y Comentarios -->
      <v-card
        variant="flat"
        class="rounded-xl border border-slate-200 bg-white pa-5 mb-6"
      >
        <div class="d-flex align-center mb-3">
          <v-icon
            color="primary"
            class="mr-2"
            size="20"
          >
            mdi-comment-text-outline
          </v-icon>
          <span class="text-subtitle-2 font-weight-bold text-slate-800">Observaciones y Comentarios del Día</span>
        </div>
        <div class="text-body-2 text-slate-600 pl-8 style-quote">
          {{ reportObservations || 'Sin observaciones registradas para este día.' }}
        </div>
      </v-card>

      <!-- 6) Traditional V2 Signatures Layout (Unchanged structure) -->
      <div class="section-title d-flex align-center mb-3">
        <v-icon
          color="primary"
          class="mr-2"
          size="20"
        >
          mdi-text-box-check-outline
        </v-icon>
        <span class="text-subtitle-2 font-weight-bold text-slate-800">VALIDACIÓN Y FIRMAS DIGITALES DEL PROTOCOLO</span>
      </div>
      
      <div
        v-if="loadingSignatures"
        class="d-flex justify-center align-center py-6"
      >
        <v-progress-circular
          indeterminate
          color="primary"
          class="mr-2"
          size="24"
        />
        <span class="text-caption text-slate-500">Cargando firmas del flujo...</span>
      </div>

      <table
        v-else
        class="ppd-table-signatures mb-6"
        style="border: 2px solid #000000; width: 100%; border-collapse: collapse; font-family: Arial, sans-serif;"
      >
        <thead>
          <tr style="background-color: #f1f5f9;">
            <th style="width: 33.3%; border: 1px solid #000000; padding: 8px; font-weight: bold; font-size: 11px; text-align: center; text-transform: uppercase;">
              Supervisor
            </th>
            <th style="width: 33.3%; border: 1px solid #000000; padding: 8px; font-weight: bold; font-size: 11px; text-align: center; text-transform: uppercase;">
              Planificador y control
            </th>
            <th style="width: 33.3%; border: 1px solid #000000; padding: 8px; font-weight: bold; font-size: 11px; text-align: center; text-transform: uppercase;">
              Administrador Contrato / Inspector Mandante
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td
              class="signature-cell"
              style="border: 1px solid #000000; height: 90px; text-align: center; vertical-align: middle; padding: 8px;"
            >
              <div class="signature-container">
                <div
                  v-if="getFirmaByRol('Supervisor')?.aprueba_rechaza === 'APROBADO'"
                  class="signature-svg"
                >
                  <div class="signed-text">
                    Firmado Electrónicamente
                  </div>
                  <div class="signed-by">
                    {{ getFirmaByRol('Supervisor')?.nombre }}
                  </div>
                  <div class="signed-date">
                    Fecha: {{ getFirmaByRol('Supervisor')?.fecha }}
                  </div>
                </div>
                <div
                  v-else
                  class="pending-signature"
                >
                  Pendiente de firma
                </div>
              </div>
            </td>
            <td
              class="signature-cell"
              style="border: 1px solid #000000; height: 90px; text-align: center; vertical-align: middle; padding: 8px;"
            >
              <div class="signature-container">
                <div
                  v-if="getFirmaByRol('Planificador')?.aprueba_rechaza === 'APROBADO'"
                  class="signature-svg"
                >
                  <div class="signed-text">
                    Firmado Electrónicamente
                  </div>
                  <div class="signed-by">
                    {{ getFirmaByRol('Planificador')?.nombre }}
                  </div>
                  <div class="signed-date">
                    Fecha: {{ getFirmaByRol('Planificador')?.fecha }}
                  </div>
                </div>
                <div
                  v-else
                  class="pending-signature"
                >
                  Pendiente de firma
                </div>
              </div>
            </td>
            <td
              class="signature-cell"
              style="border: 1px solid #000000; height: 90px; text-align: center; vertical-align: middle; padding: 8px;"
            >
              <div class="signature-container">
                <div
                  v-if="getFirmaByRol('Administrador')?.aprueba_rechaza === 'APROBADO' || getFirmaByRol('Inspector')?.aprueba_rechaza === 'APROBADO'"
                  class="signature-svg"
                >
                  <div class="signed-text">
                    Firmado Electrónicamente
                  </div>
                  <div class="signed-by">
                    {{ getFirmaByRol('Administrador')?.nombre || getFirmaByRol('Inspector')?.nombre }}
                  </div>
                  <div class="signed-date">
                    Fecha: {{ getFirmaByRol('Administrador')?.fecha || getFirmaByRol('Inspector')?.fecha }}
                  </div>
                </div>
                <div
                  v-else
                  class="pending-signature"
                >
                  Pendiente de firma
                </div>
              </div>
            </td>
          </tr>
          <tr class="signature-names">
            <td style="border: 1px solid #000000; padding: 8px; font-size: 10px; background-color: #f8fafc; line-height: 1.4; color: #000000;">
              <strong>Nombre:</strong> {{ getFirmaByRol('Supervisor')?.nombre || '—' }}<br>
              <strong>RUT:</strong> {{ getFirmaByRol('Supervisor')?.rut || '—' }}
            </td>
            <td style="border: 1px solid #000000; padding: 8px; font-size: 10px; background-color: #f8fafc; line-height: 1.4; color: #000000;">
              <strong>Nombre:</strong> {{ getFirmaByRol('Planificador')?.nombre || '—' }}<br>
              <strong>RUT:</strong> {{ getFirmaByRol('Planificador')?.rut || '—' }}
            </td>
            <td style="border: 1px solid #000000; padding: 8px; font-size: 10px; background-color: #f8fafc; line-height: 1.4; color: #000000;">
              <strong>Nombre:</strong> {{ getFirmaByRol('Administrador')?.nombre || getFirmaByRol('Inspector')?.nombre || '—' }}<br>
              <strong>RUT:</strong> {{ getFirmaByRol('Administrador')?.rut || getFirmaByRol('Inspector')?.rut || '—' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Sin datos / Error -->
    <div
      v-else
      class="text-center py-12 text-grey"
    >
      <v-icon
        size="48"
        color="grey-lighten-2"
      >
        mdi-clipboard-text-off-outline
      </v-icon>
      <p class="mt-2 text-body-2">
        No se pudo cargar la información del reporte.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import apiAxios from '@/services/api'

const props = defineProps({
  surveyId: {
    type: [Number, String],
    required: true
  },
  fecha: {
    type: String,
    required: true
  },
  ganttTasks: {
    type: Array,
    default: () => []
  },
  hideControls: {
    type: Boolean,
    default: false
  }
})

const reportVersion = ref('v2')
const loading = ref(false)
const loadingSignatures = ref(false)
const reportSurveyData = ref(null)
const flowStepsActuales = ref([])

const geoActivities = computed(() => {
  const list = []
  const rows = selectedDateRows.value || []
  for (const r of rows) {
    if (r.lat && r.lon) {
      let label = 'Actividad'
      if (r.segment === 'servidumbre') label = 'Mantención'
      else if (r.segment === 'camaras') label = 'Cámaras'
      else if (r.segment === 'actividad') {
        label = r.actividad.split(' ').slice(0, 2).join(' ')
      }
      list.push({
        lat: Number(r.lat),
        lon: Number(r.lon),
        label
      })
    }
  }
  return list
})

const osmEmbedUrl = (lat, lon) => {
  const delta = 0.005
  const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`
}

// Utility Date & Text helpers
const toYmd = (v) => {
  if (!v) return ''
  const s = String(v).trim()
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (m) return `${m[1]}-${m[2]}-${m[3]}`
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

const normalizeText = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()

const toNumberSafe = (v) => {
  if (v === null || v === undefined) return 0
  const n = parseFloat(String(v).replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

const formatNumber = (num, decimals = 0) => {
  const value = toNumberSafe(num)
  return value.toLocaleString('es-CL', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

const formatDateString = (dateStr) => {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }
  return dateStr
}

const formatDateLong = (dateStr) => {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length === 3) {
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ]
    const day = parseInt(parts[2], 10)
    const month = months[parseInt(parts[1], 10) - 1]
    const year = parts[0]
    return `${day} de ${month} de ${year}`
  }
  return dateStr
}

const isOleoducto = (val, type) => {
  if (!val) return false
  const clean = normalizeText(val)
  if (type === 'maa') {
    return clean.includes('maa') || clean.includes('amb')
  }
  return clean.includes(type)
}

// Signature Helpers
const firmasHistorial = computed(() => {
  let raw = reportSurveyData.value?.approval_exec
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw)
    } catch {
      raw = []
    }
  }
  const arr = Array.isArray(raw) ? raw : []
  return arr.map((it) => it?.firma ?? it).filter((f) => f && (f.nombre || f.rut))
})

function findFirmaByStep(step, historial) {
  return (historial || [])
    .slice()
    .reverse()
    .find(
      (h) =>
        String(h?.rol || '').trim().toUpperCase() === String(step?.name_rol || '').trim().toUpperCase() ||
        (Number.isFinite(Number(h?.id_user)) && Number(h?.id_user) === Number(step?.id_user))
    ) || null
}

const computedFirmas = computed(() => {
  const historial = firmasHistorial.value
  const steps = flowStepsActuales.value || []
  if (!steps.length) {
    return [
      { rol: 'SUPERVISOR', nombre: 'Sin registrar', rut: '—', aprueba_rechaza: 'PENDIENTE', fecha: '—' },
      { rol: 'CONTROL Y PLANIFICACIÓN', nombre: 'Sin registrar', rut: '—', aprueba_rechaza: 'PENDIENTE', fecha: '—' },
      { rol: 'ADMINISTRADOR DE CONTRATO', nombre: 'Sin registrar', rut: '—', aprueba_rechaza: 'PENDIENTE', fecha: '—' }
    ]
  }
  return steps.map((st) => {
    const hit = findFirmaByStep(st, historial)
    const estado = hit?.aprueba_rechaza
      ? String(hit.aprueba_rechaza).toUpperCase()
      : String(st?.estado || 'PENDIENTE').toUpperCase()
    return {
      rol: st?.name_rol ?? 'Sin asignar',
      nombre: hit?.nombre ?? st?.nombre_user ?? 'Sin registrar',
      rut: hit?.rut ?? '—',
      fecha: hit?.fecha ? formatDateString(hit.fecha.slice(0, 10)) : '—',
      aprueba_rechaza: estado
    }
  })
})

const getFirmaByRol = (rolName) => {
  const cleanRol = normalizeText(rolName)
  const hit = computedFirmas.value.find(f => {
    const cleanFirmaRol = normalizeText(f.rol)
    return cleanFirmaRol.includes(cleanRol)
  })
  return hit || null
}

// Resources parsing
const parseRecursos = (raw) => {
  const recursos = Array.isArray(raw)
    ? raw
    : typeof raw === 'string'
      ? (() => {
          try {
            const parsed = JSON.parse(raw)
            return Array.isArray(parsed) ? parsed : []
          } catch {
            return []
          }
        })()
      : []
  return recursos.map((r) => String(r?.nombre_excel || '').trim()).filter(Boolean)
}

const normalizePatrullaName = (value) => String(value ?? '').trim()

const dedupePatrullas = (items) => {
  const seen = new Set()
  const out = []
  for (const item of Array.isArray(items) ? items : []) {
    const nombre = normalizePatrullaName(item)
    if (!nombre) continue
    const key = normalizeText(nombre)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(nombre)
  }
  return out
}

const inferSegmentByTask = (task) => {
  if (String(task?.manualSegment || '').trim().toLowerCase() === 'actividad') return 'actividad'
  const text = normalizeText([
    task?.nombre_tarea ?? task?.nombreTarea,
    task?.contexto_contrato ?? task?.contextoContrato,
    task?.contexto_nivel ?? task?.contextoNivel,
    task?.codigo_edt ?? task?.codigoEdt
  ].filter(Boolean).join(' '))
  if (!text) return 'servidumbre'

  if (/(otros|otras)/.test(text)) return 'actividad'

  const isCamara = /(camara|camaras|cámara|cámaras)/.test(text)
  const isServidumbre = /(servidumbre|desmalezado|acceso|porton|portón|senalet|señalet|pk)/.test(text)

  if (isCamara && !isServidumbre) return 'camaras'
  if (isCamara && isServidumbre) return 'camaras'
  if (isServidumbre) return 'servidumbre'
  return 'servidumbre'
}

const getTaskHierarchy = (task, tasksMap) => {
  const visited = new Set()
  let current = task
  const names = []
  let guard = 0
  while (current && guard < 10) {
    guard++
    const key = String(current.id_tarea ?? '')
    if (!key || visited.has(key)) break
    visited.add(key)
    const name = String(current.nombre_tarea ?? '').trim()
    if (name) names.unshift(name)
    const parentId = current.id_tarea_padre
    if (parentId === null || parentId === undefined || parentId === '') break
    current = tasksMap.get(String(parentId))
  }
  return names
}

// Compute the rows for this report
const selectedDateRows = computed(() => {
  if (!props.fecha) return []
  const baseRows = []
  const tasks = props.ganttTasks || []
  const tasksMap = new Map(tasks.map((t) => [String(t.id_tarea), t]))

  for (const task of tasks) {
    let diarios = task.json_data
    if (typeof diarios === 'string') {
      try {
        diarios = JSON.parse(diarios)
      } catch {
        diarios = []
      }
    }
    if (!Array.isArray(diarios)) continue

    const hierarchy = getTaskHierarchy(task, tasksMap)
    const contrato = hierarchy[0] || ''
    const nivel2 = hierarchy[1] || ''
    const segment = inferSegmentByTask(task)

    const taskResources = Array.isArray(task.recursos) ? task.recursos : []
    const equiposJson = parseRecursos(task.equipos_json)
    const taskPatrullas = dedupePatrullas([...taskResources, ...equiposJson])

    for (const entry of diarios) {
      const rawDate = entry.fecha || entry.date || entry.dia || ''
      if (!rawDate) continue

      const dateStr = toYmd(rawDate)
      if (dateStr !== props.fecha) continue

      const pkAvance = entry.pk_avance_diario ?? entry.pkAvanceDiario ?? entry.pk_avance ?? entry.pkAvance ?? ''
      const pkInicio = entry.pk_inicio ?? entry.pkInicio ?? entry.pk_ini ?? ''
      const pkFinal = entry.pk_final ?? entry.pk_fin ?? entry.pkFinal ?? ''
      const oleoducto = entry.oleoducto || ''
      const horasRealizadas = toNumberSafe(entry.horas_realizadas ?? entry.horasRealizadas ?? entry.totalHorasActividad ?? entry.real)
      const horasTraslado = toNumberSafe(entry.horas_traslado ?? entry.horasTraslado ?? 0)
      const lat = entry.latitud ?? entry.lat ?? null
      const lon = entry.longitud ?? entry.long ?? entry.lon ?? entry.lng ?? null
      const camarasRealizadasVal = entry.camaras_realizadas ?? entry.camarasRealizadas ?? ''
      const camarasSeleccionadas = Array.isArray(entry.camaras_seleccionadas)
        ? entry.camaras_seleccionadas
        : Array.isArray(entry.camarasSeleccionadas)
          ? entry.camarasSeleccionadas
          : []

      baseRows.push({
        idTarea: task.id_tarea,
        fecha: dateStr,
        codigoEdt: task.codigo_edt || '',
        partida: nivel2 || contrato || 'Sin partida',
        actividad: (segment === 'actividad' && (entry.actividad || entry.actividad_nombre)) ? (entry.actividad || entry.actividad_nombre) : (task.nombre_tarea || 'Sin actividad'),
        segment,
        patrullas: taskPatrullas.join(', ') || 'Sin patrulla',
        oleoducto: oleoducto || 'N/A',
        pkInicio,
        pkFinal,
        kmMantencion: pkAvance !== '' ? pkAvance : (pkInicio && pkFinal ? String(Math.abs(toNumberSafe(pkFinal) - toNumberSafe(pkInicio)) / 1000) : ''),
        camarasRealizadas: camarasRealizadasVal !== '' ? camarasRealizadasVal : (camarasSeleccionadas.length ? String(camarasSeleccionadas.length) : ''),
        horasRealizadas,
        horasTraslado,
        lat,
        lon,
        entry: {
          ...entry,
          total_calicatas_realizadas: entry.total_calicatas_realizadas ?? entry.totalCalicatasRealizadas ?? 0,
          reposicion_pilar: entry.reposicion_pilar ?? entry.reposicionPilar ?? 0,
          total_hitos_pintados: entry.total_hitos_pintados ?? entry.totalHitosPintados ?? 0,
          instalacion_senaletica_nueva: entry.instalacion_senaletica_nueva ?? entry.instalacionSenaleticaNueva ?? 0
        },
        task
      })
    }
  }

  const survey = reportSurveyData.value
  if (survey && survey.body_exec) {
    const body = survey.body_exec || {}
    const tasksList = Array.isArray(body.tasks) ? body.tasks : []
    const manualTasks = tasksList.filter((t) => String(t.id_tarea).startsWith('__manual_n3__:'))
    
    for (const t of manualTasks) {
      if (baseRows.some(r => String(r.idTarea) === String(t.id_tarea))) continue

      const draft = body.ppd_web?.tasks?.[t.id_tarea] || {}
      const act = draft.actividad || {}

      const horasRealizadas = toNumberSafe(act.totalHorasActividad ?? act.real ?? 0)
      const horasTraslado = toNumberSafe(act.horasTraslado ?? 0)

      baseRows.push({
        idTarea: t.id_tarea,
        fecha: props.fecha,
        codigoEdt: t.codigo_edt || '',
        partida: t.contexto_nivel || t.contexto_contrato || 'Sin partida',
        actividad: act.actividad || t.actividad_nombre || t.nombre_tarea || 'Sin actividad',
        segment: 'actividad',
        patrullas: Array.isArray(draft.patrullas) ? draft.patrullas.join(', ') : (draft.patrullas || 'Sin patrulla'),
        oleoducto: act.oleoducto || 'N/A',
        pkInicio: act.pkInicio || '',
        pkFinal: act.pkFinal || '',
        kmMantencion: act.pkAvanceDiario !== '' ? act.pkAvanceDiario : (act.pkInicio && act.pkFinal ? String(Math.abs(toNumberSafe(act.pkFinal) - toNumberSafe(act.pkInicio)) / 1000) : ''),
        camarasRealizadas: '',
        horasRealizadas,
        horasTraslado,
        lat: draft.lat || null,
        lon: draft.lon || null,
        entry: {
          ...act,
          total_calicatas_realizadas: act.totalCalicatasRealizadas ?? 0,
          reposicion_pilar: act.reposicionPilar ?? 0,
          total_hitos_pintados: act.totalHitosPintados ?? 0,
          instalacion_senaletica_nueva: act.instalacionSenaleticaNueva ?? 0,
          observacion: act.observaciones || ''
        },
        task: t
      })
    }
  }

  return baseRows.sort((a, b) => a.codigoEdt.localeCompare(b.codigoEdt, 'es', { numeric: true }))
})

// KPI Totals Computation
const kpiTotals = computed(() => {
  const rows = selectedDateRows.value || []
  let horasRealizadas = 0
  let horasTraslado = 0
  let pkAvance = 0
  let hitosInstalados = 0
  let hitosPintados = 0
  let logotiposCambiados = 0
  let camarasRealizadas = 0
  let calicatas = 0

  for (const r of rows) {
    horasRealizadas += toNumberSafe(r.horasRealizadas)
    horasTraslado += toNumberSafe(r.horasTraslado)
    
    const entry = r.entry || {}
    pkAvance += toNumberSafe(entry.pk_avance_diario ?? entry.pkAvanceDiario ?? 0)
    hitosInstalados += toNumberSafe(entry.totalHitosInstalados ?? entry.total_hitos_instalados ?? 0)
    hitosPintados += toNumberSafe(entry.totalHitosPintados ?? entry.total_hitos_pintados ?? 0)
    logotiposCambiados += toNumberSafe(entry.totalLogotiposCambiados ?? entry.total_logotipos_cambiados ?? 0)
    camarasRealizadas += toNumberSafe(r.camarasRealizadas)
    calicatas += toNumberSafe(entry.totalCalicatasRealizadas ?? entry.total_calicatas_realizadas ?? 0)
  }

  return {
    horasRealizadas,
    horasTraslado,
    totalHoras: horasRealizadas + horasTraslado,
    pkAvance,
    hitosInstalados,
    hitosPintados,
    logotiposCambiados,
    camarasRealizadas,
    calicatas
  }
})

const uniqueOleoductos = computed(() => {
  const list = selectedDateRows.value.map((r) => r.oleoducto).filter((o) => o && o !== 'N/A')
  return [...new Set(list)].join(', ') || 'N/A'
})

const uniquePatrullas = computed(() => {
  const list = selectedDateRows.value.map((r) => r.patrullas).filter((p) => p && p !== 'Sin patrulla')
  return [...new Set(list)].join(', ') || 'Sin patrulla'
})

const reportObservations = computed(() => {
  for (const row of selectedDateRows.value) {
    const obs = row.entry?.observacion ?? row.entry?.observaciones
    if (obs) return obs
  }
  return ''
})

async function fetchSurveyDetail() {
  if (!props.surveyId) return
  loading.value = true
  try {
    const { data } = await apiAxios.get(`/servicio/leanglobal/procesosSurveyDetail?id_survey=${props.surveyId}`)
    const detailRows = data?.datos ?? data ?? []
    const detail = detailRows[0]
    if (detail) {
      let bodyExec = detail.body_exec
      if (typeof bodyExec === 'string') {
        try {
          bodyExec = JSON.parse(bodyExec)
        } catch {
          bodyExec = {}
        }
      }
      detail.body_exec = bodyExec
      reportSurveyData.value = detail

      if (detail.id_flow) {
        loadingSignatures.value = true
        try {
          const stepsResp = await apiAxios.get(`/servicio/leanglobal/flujosAprobacionSteps?id_flow=${detail.id_flow}`)
          const steps = stepsResp.data
          flowStepsActuales.value = Array.isArray(steps)
            ? [...steps].sort(
                (a, b) =>
                  Number(a?.flow_tmpl_step_orden ?? Number.MAX_SAFE_INTEGER) -
                  Number(b?.flow_tmpl_step_orden ?? Number.MAX_SAFE_INTEGER)
              )
            : []
        } catch (e) {
          console.error('Error al cargar firmas del flujo:', e)
        } finally {
          loadingSignatures.value = false
        }
      }
    }
  } catch (err) {
    console.error('Error al cargar el detalle del PPD:', err)
  } finally {
    loading.value = false
  }
}

function printReport() {
  window.print()
}

onMounted(() => {
  fetchSurveyDetail()
})

watch(() => props.surveyId, () => {
  fetchSurveyDetail()
})
</script>

<style scoped>
/* Modern Theme Typography & Colors */
.modern-theme {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #334155;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.modern-header-card {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
}

.section-title {
  border-left: 3px solid #0f766e;
  padding-left: 10px;
  line-height: 1.2;
}

/* Modern Tables Styling */
.table-container {
  width: 100%;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  background-color: #ffffff;
}

.scrollable-table {
  overflow-x: auto;
}

/* Customize horizontal scrollbar */
.scrollable-table::-webkit-scrollbar {
  height: 6px;
}
.scrollable-table::-webkit-scrollbar-track {
  background: #f1f5f9;
}
.scrollable-table::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}
.scrollable-table::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.modern-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.modern-table th {
  background-color: #f8fafc;
  color: #475569;
  font-weight: 700;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 10px 12px;
  border-bottom: 2px solid #f1f5f9;
  text-align: left;
}

.modern-table th.header-group {
  border-bottom: 1px solid #e2e8f0;
}

.modern-table th.border-cell, .modern-table td.border-cell {
  border-right: 1px solid #e2e8f0;
}

.modern-table td {
  padding: 10px 12px;
  font-size: 11px;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  text-align: left;
}

.modern-table.compact th {
  padding: 8px 10px;
  font-size: 9px;
  white-space: nowrap;
}

.modern-table.compact td {
  padding: 8px 10px;
  font-size: 10px;
}

.modern-table tr:last-child td {
  border-bottom: none;
}

.modern-table.text-center-cells th.text-center, 
.modern-table.text-center-cells td {
  text-align: center;
}

.modern-table.text-center-cells td:first-child,
.modern-table.text-center-cells th:first-child,
.modern-table.text-center-cells td:nth-child(2),
.modern-table.text-center-cells th:nth-child(2),
.modern-table.text-center-cells td:nth-child(3),
.modern-table.text-center-cells th:nth-child(3) {
  text-align: left;
}

.observation-cell {
  color: #64748b !important;
  font-style: italic;
  font-size: 10px !important;
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.observation-cell:hover {
  white-space: normal;
  overflow: visible;
  word-break: break-word;
}

/* KPI Summary Cards */
.kpi-card {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease-in-out;
}

.style-quote {
  border-left: 3px solid #0f766e;
  padding-left: 12px;
  font-style: italic;
  line-height: 1.6;
}

/* Traditional Signatures (Untouched table styles) */
.ppd-table-signatures {
  background-color: #ffffff;
  border: 1.5px solid #000000;
}

.signature-cell {
  height: 90px;
  vertical-align: middle;
  text-align: center;
}

.signature-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.signature-svg {
  border: 1px dashed #2563eb;
  padding: 6px 10px;
  border-radius: 4px;
  background-color: #eff6ff;
  color: #1e40af;
  font-size: 10px;
  line-height: 1.3;
}

.signed-text {
  font-weight: bold;
  color: #1d4ed8;
}

.signed-by {
  font-weight: 900;
  margin-top: 2px;
}

.signed-date {
  font-size: 9px;
  color: #475569;
}

.pending-signature {
  color: #94a3b8;
  font-style: italic;
  font-size: 11px;
}

.signature-names td {
  font-size: 10px;
  line-height: 1.4;
  background-color: #f8fafc;
}

@media print {
  body * {
    visibility: hidden !important;
  }
  #ppd-document-print-area,
  #ppd-document-print-area * {
    visibility: visible !important;
  }
  #ppd-document-print-area {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    background-color: #ffffff !important;
    padding: 10px !important;
    border: none !important;
  }
  
  .table-container {
    border: 1px solid #cbd5e1 !important;
    border-radius: 0 !important;
  }
  
  .modern-table th {
    background-color: #f8fafc !important;
    border-bottom: 2px solid #e2e8f0 !important;
  }
  
  .modern-table td {
    border-bottom: 1px solid #e2e8f0 !important;
  }
  
  .kpi-card {
    border: 1px solid #e2e8f0 !important;
    background-color: #f8fafc !important;
    border-radius: 6px !important;
  }

  .ppd-table-signatures {
    border: 2px solid #000000 !important;
  }
  .ppd-table-signatures th, .ppd-table-signatures td {
    border: 1px solid #000000 !important;
  }
  
  .no-print {
    display: none !important;
  }
}
</style>
