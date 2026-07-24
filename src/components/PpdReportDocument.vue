<template>
  <div class="ppd-report-document-container">
    <!-- Toolbar Controls (optional, shown if hideControls is false) -->
    <div
      v-if="!hideControls"
      class="d-flex align-center justify-end mb-4 gap-2 no-print"
    >
      <v-btn
        v-if="signedPdfFullUrl"
        prepend-icon="mdi-file-pdf-box"
        color="success"
        variant="flat"
        size="small"
        class="ml-2 font-weight-bold text-white"
        :href="signedPdfFullUrl"
        target="_blank"
      >
        Ver PDF
      </v-btn>

      <v-btn
        v-if="canSign && !isAlreadySigned"
        :disabled="loadingSignatureFlow"
        :loading="loadingSignatureFlow"
        prepend-icon="mdi-pen"
        color="deep-purple-accent-4"
        variant="flat"
        size="small"
        class="ml-2 font-weight-bold text-white"
        @click="iniciarFirma"
      >
        Firmar Parte de Producción
      </v-btn>

      <v-btn
        v-if="canReopen && isAlreadySigned"
        :disabled="loadingSignatureFlow"
        :loading="loadingSignatureFlow"
        prepend-icon="mdi-lock-open-variant"
        color="warning"
        variant="flat"
        size="small"
        class="ml-2 font-weight-bold text-white"
        @click="reabrirPpd"
      >
        Reabrir Parte de Producción
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
      class="pa-4 bg-white rounded-lg border"
    >
      <!-- 1) Official Protocol Header Grid (V1 vs V2) -->
      <table
        v-if="reportVersion === 'v1'"
        class="ppd-table-grid mb-4"
        style="border: 2px solid #000000; width: 100%; border-collapse: collapse;"
      >
        <tbody>
          <tr>
            <td
              rowspan="2"
              class="text-center"
              style="width: 25%; padding: 12px; border: 1px solid #000000; vertical-align: middle;"
            >
              <v-icon
                size="36"
                color="primary"
                class="mb-1"
              >
                mdi-home-analytics
              </v-icon>
              <div style="font-size: 16px; font-weight: 900; color: #1e3a8a; letter-spacing: 0.05em;">
                TERRACON
              </div>
            </td>
            <td
              class="text-center"
              style="width: 50%; font-weight: bold; font-size: 12px; border: 1px solid #000000; padding: 4px; text-transform: uppercase; letter-spacing: 0.1em; color: #475569;"
            >
              PROTOCOLO
            </td>
            <td style="width: 25%; border: 1px solid #000000; padding: 6px; font-size: 10px;">
              <strong>Revisión:</strong> 1/Dic.2025
            </td>
          </tr>
          <tr>
            <td
              class="text-center"
              style="font-weight: 900; font-size: 16px; border: 1px solid #000000; padding: 6px; color: #000000;"
            >
              PARTE DE PRODUCCIÓN DIARIA
            </td>
            <td style="width: 25%; border: 1px solid #000000; padding: 6px; font-size: 10px;">
              <strong>Código:</strong> TPI-OTC-PRT-563-Rev.1
            </td>
          </tr>
          <tr>
            <td style="border: 1px solid #000000; padding: 6px; font-size: 10px; font-weight: bold; background-color: #f8fafc;">
              Norma Aplicable
            </td>
            <td
              class="text-center"
              style="font-weight: bold; font-size: 12px; border: 1px solid #000000; padding: 4px; text-transform: uppercase; color: #1e293b;"
            >
              MANTENCIÓN DE SERVIDUMBRE 2026
            </td>
            <td style="width: 25%; border: 1px solid #000000; padding: 6px; font-size: 10px;">
              <strong>Página:</strong> 1 de 1
            </td>
          </tr>
          <tr>
            <td style="border: 1px solid #000000; padding: 6px; font-size: 10px; font-weight: bold; color: #000000;">
              NCH ISO 9001:14001;45001
            </td>
            <td
              class="text-center"
              style="font-weight: bold; font-size: 12px; border: 1px solid #000000; padding: 4px; color: #475569;"
            >
              Ingeniería Control y Gestión
            </td>
            <td style="width: 25%; border: 1px solid #000000; padding: 6px; font-size: 10px;">
              <strong>DA Mandante:</strong> GO-08-2022
            </td>
          </tr>
        </tbody>
      </table>

      <table
        v-else
        class="ppd-table-grid mb-4"
        style="border: 2px solid #000000; width: 100%; border-collapse: collapse;"
      >
        <tbody>
          <tr>
            <td
              rowspan="3"
              class="text-center"
              style="width: 25%; padding: 12px; border: 1px solid #000000; vertical-align: middle;"
            >
              <v-icon
                size="36"
                color="primary"
                class="mb-1"
              >
                mdi-home-analytics
              </v-icon>
              <div style="font-size: 16px; font-weight: 900; color: #1e3a8a; letter-spacing: 0.05em;">
                TERRACON
              </div>
            </td>
            <td
              class="text-center"
              style="width: 50%; font-weight: bold; font-size: 12px; border: 1px solid #000000; padding: 4px; text-transform: uppercase; letter-spacing: 0.1em; color: #475569;"
            >
              PROTOCOLO
            </td>
            <td style="width: 25%; border: 1px solid #000000; padding: 6px; font-size: 10px;">
              <strong>Revisión:</strong> 1/Dic.2025
            </td>
          </tr>
          <tr>
            <td
              class="text-center"
              style="font-weight: 900; font-size: 16px; border: 1px solid #000000; padding: 6px; color: #000000;"
            >
              PARTE DE PRODUCCIÓN DIARIA
            </td>
            <td style="width: 25%; border: 1px solid #000000; padding: 6px; font-size: 10px;">
              <strong>Fecha:</strong> {{ fecha ? formatDateString(fecha) : '—' }}
            </td>
          </tr>
          <tr>
            <td
              class="text-center"
              style="font-weight: bold; font-size: 12px; border: 1px solid #000000; padding: 4px; text-transform: uppercase; color: #1e293b;"
            >
              MANTENCIÓN DE SERVIDUMBRE 2026
            </td>
            <td style="width: 25%; border: 1px solid #000000; padding: 6px; font-size: 10px;">
              <strong>Código:</strong> TPI-OTC-PRT-563-Rev.1
            </td>
          </tr>
          <tr>
            <td style="border: 1px solid #000000; padding: 6px; font-size: 10px; font-weight: bold; background-color: #f8fafc;">
              Norma Aplicable
            </td>
            <td
              class="text-center"
              style="font-weight: bold; font-size: 12px; border: 1px solid #000000; padding: 4px; color: #475569;"
            >
              Ingeniería Control y Gestión
            </td>
            <td style="width: 25%; border: 1px solid #000000; padding: 6px; font-size: 10px;">
              <strong>Página:</strong> 1 de 1
            </td>
          </tr>
          <tr>
            <td style="border: 1px solid #000000; padding: 6px; font-size: 10px; font-weight: bold; color: #000000;">
              NCH ISO 9001:14001;45001
            </td>
            <td
              class="text-center"
              style="font-weight: bold; font-size: 11px; border: 1px solid #000000; padding: 4px; color: #475569;"
            >
              —
            </td>
            <td style="width: 25%; border: 1px solid #000000; padding: 6px; font-size: 10px;">
              <strong>DA Mandante:</strong> GO-08-2022
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 2) V1 General Info Grid vs V2 Apertura Table -->
      <table
        v-if="reportVersion === 'v1'"
        class="ppd-table-grid mb-6"
        style="border: 2px solid #000000; width: 100%; border-collapse: collapse;"
      >
        <thead>
          <tr style="background-color: #f1f5f9;">
            <th style="width: 20%; border: 1px solid #000000; padding: 6px; font-size: 10px; font-weight: bold; text-align: center;">
              Fecha
            </th>
            <th style="width: 15%; border: 1px solid #000000; padding: 6px; font-size: 10px; font-weight: bold; text-align: center;">
              Oleoducto
            </th>
            <th style="width: 30%; border: 1px solid #000000; padding: 6px; font-size: 10px; font-weight: bold; text-align: center;">
              Ubicación
            </th>
            <th style="width: 15%; border: 1px solid #000000; padding: 6px; font-size: 10px; font-weight: bold; text-align: center;">
              Patrulla
            </th>
            <th style="width: 20%; border: 1px solid #000000; padding: 6px; font-size: 10px; font-weight: bold; text-align: center;">
              Período
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td
              class="text-center"
              style="border: 1px solid #000000; padding: 10px; font-size: 11px; font-weight: bold; text-align: center; vertical-align: middle;"
            >
              {{ fecha ? formatDateLong(fecha) : '—' }}
            </td>
            <td
              class="text-center"
              style="border: 1px solid #000000; padding: 10px; font-size: 11px; font-weight: bold; text-align: center; color: #1e3a8a; vertical-align: middle;"
            >
              {{ uniqueOleoductos }}
            </td>
            <td
              class="pa-1 text-center"
              style="border: 1px solid #000000; vertical-align: middle; min-width: 180px;"
            >
              <div
                v-if="geoActivities.length"
                style="display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 4px; padding: 2px;"
              >
                <div
                  v-for="(act, idx) in geoActivities"
                  :key="idx"
                  style="position: relative; height: 80px; border: 1px solid #cbd5e1; border-radius: 4px; overflow: hidden; background:#e8f0fe;"
                >
                  <iframe
                    :src="osmEmbedUrl(act.lat, act.lon)"
                    style="position: absolute; top: -30px; left: -20px; width: 140px; height: 140px; border: 0; pointer-events: none;"
                    sandbox="allow-scripts allow-same-origin"
                    loading="lazy"
                    title="mapa-actividad"
                  />
                  <!-- Label overlay indicating the activity abbreviation or type -->
                  <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(15, 23, 42, 0.75); color: #ffffff; font-size: 8px; font-weight: bold; padding: 1px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.1; z-index: 5;">
                    {{ act.label }}
                  </div>
                </div>
              </div>
              <span
                v-else
                style="font-size: 10px; color: #94a3b8; font-style: italic;"
              >Sin GPS</span>
            </td>
            <td
              class="text-center"
              style="border: 1px solid #000000; padding: 10px; font-size: 10px; text-align: center; color: #475569; vertical-align: middle;"
            >
              {{ uniquePatrullas }}
            </td>
            <td
              class="text-center"
              style="border: 1px solid #000000; padding: 10px; font-size: 10px; text-align: center; color: #475569; vertical-align: middle; font-weight: bold;"
            >
              SEGUNDA MANTENCIÓN DE SERVIDUMBRES
            </td>
          </tr>
        </tbody>
      </table>

      <template v-else>
        <div class="text-subtitle-2 font-weight-bold text-slate-800 mb-2">
          APERTURA DE ACTIVIDADES DIARIAS
        </div>
        <table
          class="ppd-table-grid mb-6"
          style="border: 2px solid #000000; width: 100%; border-collapse: collapse;"
        >
          <thead>
            <tr style="background-color: #f1f5f9; font-weight: bold;">
              <th style="width: 12%; border: 1px solid #000000; padding: 6px; font-size: 10px; text-align: left;">
                Supervisor
              </th>
              <th style="width: 12%; border: 1px solid #000000; padding: 6px; font-size: 10px; text-align: left;">
                Patrulla
              </th>
              <th style="width: 8%; border: 1px solid #000000; padding: 6px; font-size: 10px; text-align: center;">
                EDP
              </th>
              <th style="width: 15%; border: 1px solid #000000; padding: 6px; font-size: 10px; text-align: left;">
                Partida
              </th>
              <th style="width: 15%; border: 1px solid #000000; padding: 6px; font-size: 10px; text-align: left;">
                Actividad
              </th>
              <th style="width: 8%; border: 1px solid #000000; padding: 6px; font-size: 10px; text-align: center;">
                Línea/Oleoducto
              </th>
              <th style="width: 30%; border: 1px solid #000000; padding: 6px; font-size: 10px; text-align: left;">
                Observación
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in selectedDateRows"
              :key="'apertura-' + row.idTarea + '-' + row.fecha"
            >
              <td style="border: 1px solid #000000; padding: 6px; font-size: 10px; vertical-align: middle;">
                {{ row.entry?.nombre || row.entry?.nombre_user || getFirmaByRol('Supervisor')?.nombre || 'Sin registrar' }}
              </td>
              <td style="border: 1px solid #000000; padding: 6px; font-size: 10px; vertical-align: middle;">
                {{ row.patrullas }}
              </td>
              <td
                class="text-center"
                style="border: 1px solid #000000; padding: 6px; font-size: 10px; font-weight: bold; vertical-align: middle;"
              >
                {{ row.segment === 'actividad' ? '—' : (row.codigoEdt || '—') }}
              </td>
              <td style="border: 1px solid #000000; padding: 6px; font-size: 10px; vertical-align: middle;">
                {{ row.partida }}
              </td>
              <td style="border: 1px solid #000000; padding: 6px; font-size: 10px; vertical-align: middle; font-weight: bold;">
                {{ row.actividad }}
              </td>
              <td
                class="text-center"
                style="border: 1px solid #000000; padding: 6px; font-size: 10px; vertical-align: middle;"
              >
                {{ [row.oleoducto, row.linea].filter(v => v && v !== 'N/A').join(' / ') || 'N/A' }}
              </td>
              <td
                style="border: 1px solid #000000; padding: 6px; font-size: 10px; vertical-align: middle; white-space: pre-wrap; text-align: left;"
              >
                {{ row.entry?.observaciones || row.entry?.observacion || '—' }}
              </td>
            </tr>
          </tbody>
        </table>
      </template>

      <!-- 3) Activities Table -->
      <div class="text-subtitle-2 font-weight-bold text-slate-800 mb-2">
        DETALLE DE ACTIVIDADES DE MANTENCIÓN Y PRODUCCIÓN
      </div>
      
      <table
        class="ppd-table-grid mb-6"
        style="border: 2px solid #000000; width: 100%; border-collapse: collapse;"
      >
        <thead>
          <tr style="background-color: #f1f5f9; font-weight: bold;">
            <th
              rowspan="2"
              style="width: 20%; border: 1px solid #000000; padding: 6px; text-align: left;"
            >
              Actividad de Mantención
            </th>
            <th
              rowspan="2"
              style="width: 15%; border: 1px solid #000000; padding: 6px; text-align: left;"
            >
              Actividad de Cámara
            </th>
            <th
              rowspan="2"
              style="width: 15%; border: 1px solid #000000; padding: 6px; text-align: left;"
            >
              Otras Actividades
            </th>
            <th
              colspan="2"
              style="border: 1px solid #000000; padding: 4px; text-align: center;"
            >
              CCM (PK)
            </th>
            <th
              colspan="2"
              style="border: 1px solid #000000; padding: 4px; text-align: center;"
            >
              SFM (PK)
            </th>
            <th
              colspan="2"
              style="border: 1px solid #000000; padding: 4px; text-align: center;"
            >
              QCC (PK)
            </th>
            <th
              colspan="2"
              style="border: 1px solid #000000; padding: 4px; text-align: center;"
            >
              MAA MB (PK)
            </th>
          </tr>
          <tr style="background-color: #f8fafc; font-size: 9px;">
            <th style="border: 1px solid #000000; padding: 4px; text-align: center; width: 6.25%;">
              Inicio
            </th>
            <th style="border: 1px solid #000000; padding: 4px; text-align: center; width: 6.25%;">
              Término
            </th>
            <th style="border: 1px solid #000000; padding: 4px; text-align: center; width: 6.25%;">
              Inicio
            </th>
            <th style="border: 1px solid #000000; padding: 4px; text-align: center; width: 6.25%;">
              Término
            </th>
            <th style="border: 1px solid #000000; padding: 4px; text-align: center; width: 6.25%;">
              Inicio
            </th>
            <th style="border: 1px solid #000000; padding: 4px; text-align: center; width: 6.25%;">
              Término
            </th>
            <th style="border: 1px solid #000000; padding: 4px; text-align: center; width: 6.25%;">
              Inicio
            </th>
            <th style="border: 1px solid #000000; padding: 4px; text-align: center; width: 6.25%;">
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
            <td style="border: 1px solid #000000; padding: 6px; font-size: 11px;">
              <span
                v-if="row.segment === 'servidumbre'"
                class="font-weight-bold text-slate-800"
              >{{ row.actividad }}</span>
              <span
                v-else
                class="text-slate-300"
              >—</span>
            </td>
            <!-- Actividad de Cámara -->
            <td style="border: 1px solid #000000; padding: 6px; font-size: 11px;">
              <span
                v-if="row.segment === 'camaras'"
                class="font-weight-bold text-slate-800"
              >{{ row.actividad }}</span>
              <span
                v-else
                class="text-slate-300"
              >—</span>
            </td>
            <!-- Otras Actividades -->
            <td style="border: 1px solid #000000; padding: 6px; font-size: 11px;">
              <span
                v-if="row.segment === 'actividad'"
                class="text-slate-600"
              >{{ row.actividad }}</span>
              <span
                v-else
                class="text-slate-300"
              >—</span>
            </td>
            
            <!-- CCM (PK) -->
            <td
              class="text-center"
              style="border: 1px solid #000000; padding: 4px; font-size: 10px;"
            >
              {{ isOleoducto(row.oleoducto, 'ccm') && row.pkInicio ? row.pkInicio : '—' }}
            </td>
            <td
              class="text-center"
              style="border: 1px solid #000000; padding: 4px; font-size: 10px;"
            >
              {{ isOleoducto(row.oleoducto, 'ccm') && row.pkFinal ? row.pkFinal : '—' }}
            </td>
            
            <!-- SFM (PK) -->
            <td
              class="text-center"
              style="border: 1px solid #000000; padding: 4px; font-size: 10px;"
            >
              {{ isOleoducto(row.oleoducto, 'sfm') && row.pkInicio ? row.pkInicio : '—' }}
            </td>
            <td
              class="text-center"
              style="border: 1px solid #000000; padding: 4px; font-size: 10px;"
            >
              {{ isOleoducto(row.oleoducto, 'sfm') && row.pkFinal ? row.pkFinal : '—' }}
            </td>
            
            <!-- QCC (PK) -->
            <td
              class="text-center"
              style="border: 1px solid #000000; padding: 4px; font-size: 10px;"
            >
              {{ isOleoducto(row.oleoducto, 'qcc') && row.pkInicio ? row.pkInicio : '—' }}
            </td>
            <td
              class="text-center"
              style="border: 1px solid #000000; padding: 4px; font-size: 10px;"
            >
              {{ isOleoducto(row.oleoducto, 'qcc') && row.pkFinal ? row.pkFinal : '—' }}
            </td>
            
            <!-- MAA MB (PK) -->
            <td
              class="text-center"
              style="border: 1px solid #000000; padding: 4px; font-size: 10px;"
            >
              {{ isOleoducto(row.oleoducto, 'maa') && row.pkInicio ? row.pkInicio : '—' }}
            </td>
            <td
              class="text-center"
              style="border: 1px solid #000000; padding: 4px; font-size: 10px;"
            >
              {{ isOleoducto(row.oleoducto, 'maa') && row.pkFinal ? row.pkFinal : '—' }}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Tabla 2: Totales y métricas detalladas -->
      <div class="text-subtitle-2 font-weight-bold text-slate-800 mb-2">
        KPI Y TOTALES DETALLADOS POR ACTIVIDAD
      </div>

      <table
        class="ppd-table-totals mb-6"
        style="border: 2px solid #000000; width: 100%; border-collapse: collapse;"
      >
        <thead>
          <tr style="background-color: #f1f5f9;">
            <th
              rowspan="2"
              style="text-align: left; padding: 8px; font-weight: bold; border: 1px solid #000000; width: 25%;"
            >
              Actividades
            </th>
            <th
              class="vertical-header"
              style="border: 1px solid #000000;"
            >
              <div>Total hrs. Realizadas por actividad</div>
            </th>
            <th
              class="vertical-header"
              style="border: 1px solid #000000;"
            >
              <div>Horas de traslados</div>
            </th>
            <th
              class="vertical-header"
              style="border: 1px solid #000000;"
            >
              <div>PK de avance Diario</div>
            </th>
            <th
              class="vertical-header"
              style="border: 1px solid #000000;"
            >
              <div>Total de hitos inst.</div>
            </th>
            <th
              class="vertical-header"
              style="border: 1px solid #000000;"
            >
              <div>Total de hitos pintados</div>
            </th>
            <th
              class="vertical-header"
              style="border: 1px solid #000000;"
            >
              <div>Total de logotipos cambiados</div>
            </th>
            <th
              class="vertical-header"
              style="border: 1px solid #000000;"
            >
              <div>Reposición de Plancheta</div>
            </th>
            <th
              class="vertical-header"
              style="border: 1px solid #000000;"
            >
              <div>Reposición de pilar</div>
            </th>
            <th
              class="vertical-header"
              style="border: 1px solid #000000;"
            >
              <div>Inst. señalética nueva</div>
            </th>
            <th
              class="vertical-header"
              style="border: 1px solid #000000;"
            >
              <div>Total de cámaras realizadas</div>
            </th>
            <th
              class="vertical-header"
              style="border: 1px solid #000000;"
            >
              <div>KM recorridos en inspección</div>
            </th>
            <th
              class="vertical-header"
              style="border: 1px solid #000000;"
            >
              <div>Total N° de calicatas realizadas</div>
            </th>
            <th
              class="vertical-header"
              style="border: 1px solid #000000;"
            >
              <div>Cámaras QCC</div>
            </th>
            <th
              class="vertical-header"
              style="border: 1px solid #000000;"
            >
              <div>Cámaras CCM</div>
            </th>
            <th
              class="vertical-header"
              style="border: 1px solid #000000;"
            >
              <div>Cámaras SFM</div>
            </th>
            <th
              class="vertical-header"
              style="border: 1px solid #000000;"
            >
              <div>Cámaras MAA MB</div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in selectedDateRows"
            :key="'total-' + row.idTarea + '-' + row.fecha"
          >
            <td style="text-align: left; padding: 6px; font-weight: bold; font-size: 11px; border: 1px solid #000000;">
              {{ row.actividad }}
            </td>
            <td
              class="text-center"
              style="border: 1px solid #000000; padding: 4px; font-size: 11px; font-weight: bold;"
            >
              {{ row.horasRealizadas || '—' }}
            </td>
            <td
              class="text-center"
              style="border: 1px solid #000000; padding: 4px; font-size: 11px;"
            >
              {{ row.horasTraslado || '—' }}
            </td>
            <td
              class="text-center"
              style="border: 1px solid #000000; padding: 4px; font-size: 11px; font-weight: bold;"
            >
              {{ row.entry?.pk_avance_diario ?? row.entry?.pkAvanceDiario ?? '—' }}
            </td>
            <td
              class="text-center"
              style="border: 1px solid #000000; padding: 4px; font-size: 11px;"
            >
              {{ row.entry?.totalHitosInstalados ?? row.entry?.total_hitos_instalados ?? '—' }}
            </td>
            <td
              class="text-center"
              style="border: 1px solid #000000; padding: 4px; font-size: 11px;"
            >
              {{ row.entry?.totalHitosPintados ?? row.entry?.total_hitos_pintados ?? '—' }}
            </td>
            <td
              class="text-center"
              style="border: 1px solid #000000; padding: 4px; font-size: 11px;"
            >
              {{ row.entry?.totalLogotiposCambiados ?? row.entry?.total_logotipos_cambiados ?? '—' }}
            </td>
            <td
              class="text-center"
              style="border: 1px solid #000000; padding: 4px; font-size: 11px;"
            >
              {{ row.entry?.reposicionPlancheta ?? row.entry?.reposicion_plancheta ?? '—' }}
            </td>
            <td
              class="text-center"
              style="border: 1px solid #000000; padding: 4px; font-size: 11px;"
            >
              {{ row.entry?.reposicionPilar ?? row.entry?.reposicion_pilar ?? '—' }}
            </td>
            <td
              class="text-center"
              style="border: 1px solid #000000; padding: 4px; font-size: 11px;"
            >
              {{ row.entry?.instalacionSenaleticaNueva ?? row.entry?.instalacion_senaletica_nueva ?? '—' }}
            </td>
            <td
              class="text-center"
              style="border: 1px solid #000000; padding: 4px; font-size: 11px; font-weight: bold; color: #0d9488;"
            >
              {{ row.camarasRealizadas || '—' }}
            </td>
            <td
              class="text-center"
              style="border: 1px solid #000000; padding: 4px; font-size: 11px;"
            >
              {{ row.entry?.kmRecorridosInspeccion ?? row.entry?.km_recorridos_inspeccion ?? '—' }}
            </td>
            <td
              class="text-center"
              style="border: 1px solid #000000; padding: 4px; font-size: 11px; font-weight: bold;"
            >
              {{ row.entry?.totalCalicatasRealizadas ?? row.entry?.total_calicatas_realizadas ?? '—' }}
            </td>
            
            <!-- Cámaras por oleoducto -->
            <td
              class="text-center"
              style="border: 1px solid #000000; padding: 4px; font-size: 11px;"
            >
              {{ (row.segment === 'camaras' && isOleoducto(row.oleoducto, 'qcc')) ? row.camarasRealizadas : '—' }}
            </td>
            <td
              class="text-center"
              style="border: 1px solid #000000; padding: 4px; font-size: 11px;"
            >
              {{ (row.segment === 'camaras' && isOleoducto(row.oleoducto, 'ccm')) ? row.camarasRealizadas : '—' }}
            </td>
            <td
              class="text-center"
              style="border: 1px solid #000000; padding: 4px; font-size: 11px;"
            >
              {{ (row.segment === 'camaras' && isOleoducto(row.oleoducto, 'sfm')) ? row.camarasRealizadas : '—' }}
            </td>
            <td
              class="text-center"
              style="border: 1px solid #000000; padding: 4px; font-size: 11px;"
            >
              {{ (row.segment === 'camaras' && isOleoducto(row.oleoducto, 'maa')) ? row.camarasRealizadas : '—' }}
            </td>
          </tr>
        </tbody>
      </table>



      <!-- VALIDACIÓN Y FIRMAS DIGITALES DEL PROTOCOLO (Solo si hay firmas aprobadas) -->
      <div
        v-if="computedFirmas.some(f => f.aprueba_rechaza === 'APROBADO')"
        class="mt-4"
      >
        <div class="text-subtitle-2 font-weight-bold text-slate-800 mb-2">
          VALIDACIÓN Y FIRMAS DIGITALES DEL PROTOCOLO
        </div>
        <table
          class="ppd-table-signatures mb-6"
          style="border: 2px solid #000000; width: 100%; border-collapse: collapse; font-family: Arial, sans-serif;"
        >
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th
                v-for="firma in computedFirmas.filter(f => f.aprueba_rechaza === 'APROBADO')"
                :key="firma.rol"
                style="border: 1px solid #000000; padding: 8px; font-weight: bold; font-size: 11px; text-align: center; text-transform: uppercase;"
              >
                {{ firma.rol }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                v-for="firma in computedFirmas.filter(f => f.aprueba_rechaza === 'APROBADO')"
                :key="firma.rol + '-cell'"
                class="signature-cell"
                style="border: 1px solid #000000; height: 90px; text-align: center; vertical-align: middle; padding: 8px;"
              >
                <div
                  class="signature-container"
                  style="display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 12px; padding: 4px;"
                >
                  <div style="flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                    <img 
                      v-if="firma.qrUrl"
                      :src="`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(apiBaseUrl + '/archivo/ppd/' + firma.qrUrl)}`" 
                      style="width: 70px; height: 70px; border: 1px solid #cbd5e1; padding: 2px; background: white;"
                      alt="QR Validación"
                    >
                  </div>
                  <div
                    class="signature-svg"
                    style="text-align: left; flex-grow: 1;"
                  >
                    <div class="signed-text">
                      Firmado Electrónicamente
                    </div>
                    <div class="signed-by">
                      {{ firma.nombre }}
                    </div>
                    <div class="signed-date">
                      Fecha: {{ firma.fecha }}
                    </div>
                  </div>
                </div>
              </td>
            </tr>
            <tr class="signature-names">
              <td
                v-for="firma in computedFirmas.filter(f => f.aprueba_rechaza === 'APROBADO')"
                :key="firma.rol + '-names'"
                style="border: 1px solid #000000; padding: 8px; font-size: 10px; background-color: #f8fafc; line-height: 1.4; color: #000000;"
              >
                <strong>Nombre:</strong> {{ firma.nombre || '—' }}<br>
                <strong>RUT:</strong> {{ firma.rut || '—' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
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

    <FirmaDialog
      v-model="dialogConfirmarTerminar"
      :pdf-url="pdfUrlFirma"
      :is-report="true"
      :detalle-flujo="detalleCrearFirma"
      :roles="roles"
      :motivos-rechazo="motivosRechazo"
      @firmado-directo="ejecutarGeneracionYCierrePpd"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import apiAxios from '@/services/api'
import { useUserDetailStore } from '@/stores/userDetail'
import FirmaDialog from './FirmaDialog.vue'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://servidor.leanglobal.cl/lean-services-dev/api'

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

const signedPdfUrl = computed(() => {
  // 1) Leer de firmasHistorial si hay alguna firma con qrUrl (nuevo flujo directo)
  const historial = firmasHistorial.value || []
  for (const f of historial) {
    if (f.qrUrl) return f.qrUrl
  }
  // 2) Fallback a flowSteps
  const steps = flowStepsActuales.value || []
  if (!steps.length) return null
  const sorted = [...steps].sort((a, b) => Number(b.flow_tmpl_step_orden) - Number(a.flow_tmpl_step_orden))
  for (const st of sorted) {
    if (st.name_doc_interno_out) {
      return st.name_doc_interno_out
    }
    if (st.name_doc_interno_in) {
      return st.name_doc_interno_in
    }
  }
  return null
})

const signedPdfFullUrl = computed(() => {
  const name = signedPdfUrl.value
  if (!name) return null
  const ARCHIVO_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://servidor.leanglobal.cl'
  // Si viene de firmasHistorial/nuevo flujo, o es el fallback, usamos la subcarpeta ppd
  return `${ARCHIVO_BASE_URL}/archivo/ppd/${name}`
})

const emit = defineEmits(['signed'])
const userDetailStore = useUserDetailStore()

const dialogConfirmarTerminar = ref(false)
const pdfUrlFirma = ref('')
const detalleCrearFirma = ref(null)
const loadingSignatureFlow = ref(false)
const roles = ref([])
const motivosRechazo = ref([])

const canSign = computed(() => {
  const fromStoreIds = Array.isArray(userDetailStore.userDetail?.rolesIds)
    ? userDetailStore.userDetail.rolesIds
    : []
  let fromStorageIds = []
  try {
    fromStorageIds = JSON.parse(localStorage.getItem('rolesIds') || '[]')
  } catch {
    fromStorageIds = []
  }
  const allIds = Array.from(new Set([...fromStoreIds, ...fromStorageIds])).map(Number)
  
  if (allIds.includes(35)) return true

  const fromStoreNames = Array.isArray(userDetailStore.userDetail?.rolesNames)
    ? userDetailStore.userDetail.rolesNames
    : []
  let fromStorageNames = []
  try {
    fromStorageNames = JSON.parse(localStorage.getItem('rolesNames') || '[]')
  } catch {
    fromStorageNames = []
  }
  const allNames = Array.from(new Set([...fromStoreNames, ...fromStorageNames]))
    .map(r => String(r || '').trim().toUpperCase())
  
  return allNames.includes('AVAN_APRB')
})

const canReopen = computed(() => {
  const fromStoreIds = Array.isArray(userDetailStore.userDetail?.rolesIds)
    ? userDetailStore.userDetail.rolesIds
    : []
  let fromStorageIds = []
  try {
    fromStorageIds = JSON.parse(localStorage.getItem('rolesIds') || '[]')
  } catch {
    fromStorageIds = []
  }
  const allIds = Array.from(new Set([...fromStoreIds, ...fromStorageIds])).map(Number)
  
  if (allIds.includes(34)) return true

  const fromStoreNames = Array.isArray(userDetailStore.userDetail?.rolesNames)
    ? userDetailStore.userDetail.rolesNames
    : []
  let fromStorageNames = []
  try {
    fromStorageNames = JSON.parse(localStorage.getItem('rolesNames') || '[]')
  } catch {
    fromStorageNames = []
  }
  const allNames = Array.from(new Set([...fromStoreNames, ...fromStorageNames]))
    .map(r => String(r || '').trim().toUpperCase())
  
  return allNames.includes('AVAN_VERIF')
})

const isAlreadySigned = computed(() => {
  const estado = String(reportSurveyData.value?.estado_srv || '').toUpperCase().trim()
  return ['APROBADO', 'FIRMADO', 'TERMINADO', 'VERIFICACION'].includes(estado)
})

async function fetchCatalogs() {
  try {
    const [rolesResp, motivosResp] = await Promise.all([
      apiAxios.get('/servicio/leanglobal/obtenerRoles'),
      apiAxios.get('/servicio/leanglobal/obtnerMotivosRechazo')
    ])
    roles.value = rolesResp.data || []
    motivosRechazo.value = motivosResp.data || []
  } catch (err) {
    console.error('Error fetching catalogs for signature:', err)
  }
}

function getPpdReportHtml() {
  const printElement = document.getElementById('ppd-document-print-area')
  if (!printElement) {
    throw new Error('No se encontró el elemento #ppd-document-print-area')
  }

  // Clonar para no modificar la vista del usuario
  const clone = printElement.cloneNode(true)

  // Remover cualquier elemento no-print o controles
  const noPrintEls = clone.querySelectorAll('.no-print')
  noPrintEls.forEach((el) => el.remove())

  // Quitar v-icon (que no se renderizan en PDF) o reemplazarlos por texto descriptivo si es necesario
  const icons = clone.querySelectorAll('.v-icon')
  icons.forEach((el) => el.remove())

  const htmlContent = clone.innerHTML

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Parte de Producción Diaria</title>
        <style>
          body {
            font-family: Arial, Helvetica, sans-serif;
            background-color: #ffffff;
            color: #000000;
            margin: 0;
            padding: 20px;
          }
          
          .ppd-table-grid, .ppd-table-totals, .ppd-table-signatures {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            background-color: #ffffff;
            border: 2px solid #000000 !important;
            font-family: Arial, Helvetica, sans-serif;
          }
          
          .ppd-table-grid th, .ppd-table-grid td,
          .ppd-table-totals th, .ppd-table-totals td,
          .ppd-table-signatures th, .ppd-table-signatures td {
            border: 1px solid #000000 !important;
            padding: 6px;
            font-size: 11px;
            color: #000000;
            vertical-align: middle;
          }
          
          .ppd-table-grid th, .ppd-table-totals th, .ppd-table-signatures th {
            background-color: #f1f5f9;
            font-weight: bold;
            text-align: center;
            text-transform: uppercase;
          }
          
          .ppd-table-grid .sub-headers th {
            padding: 2px 4px;
            font-size: 9px;
          }
          
          .vertical-header {
            height: 140px;
            width: 35px;
            min-width: 35px;
            max-width: 35px;
            vertical-align: bottom;
            padding: 8px 2px !important;
          }
          
          .vertical-header > div {
            writing-mode: vertical-rl;
            transform: rotate(180deg);
            white-space: nowrap;
            font-size: 10px;
            font-weight: bold;
            text-align: left;
            margin: 0 auto;
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
        </style>
      </head>
      <body>
        <div id="ppd-document-print-area">
          ${htmlContent}
        </div>
      </body>
    </html>
  `;
}

async function clearPdfFromGanttTasks() {
  const targetDate = toYmd(props.fecha) || toYmd(reportSurveyData.value?.fecha_plan_ini) || toYmd(reportSurveyData.value?.body_exec?.meta?.fecha)
  if (!targetDate) return

  const tasks = props.ganttTasks || []
  for (const task of tasks) {
    const isTaskInSurvey = (() => {
      const surveyTasks = reportSurveyData.value?.body_exec?.tasks || []
      const taskIdStr = String(task.id_tarea || task.idTarea || '').trim()
      return surveyTasks.some(st => String(st.id_tarea || st.idTarea || '').trim() === taskIdStr)
    })()

    if (!isTaskInSurvey) continue

    let diarios = []
    if (Array.isArray(task.json_data)) {
      diarios = task.json_data.map(d => ({ ...d }))
    } else if (typeof task.json_data === 'string') {
      try {
        const parsed = JSON.parse(task.json_data)
        diarios = Array.isArray(parsed) ? parsed.map(d => ({ ...d })) : []
      } catch {
        diarios = []
      }
    }

    let updated = false
    for (let i = 0; i < diarios.length; i++) {
      const entryDate = toYmd(diarios[i].fecha || diarios[i].date || diarios[i].dia || '')
      if (entryDate === targetDate) {
        if (diarios[i].pdf || diarios[i].pdf_name || diarios[i].name_doc_interno) {
          diarios[i].pdf = null
          diarios[i].pdf_name = null
          diarios[i].name_doc_interno = null
          updated = true
        }
      }
    }

    if (updated) {
      const payload = {
        id_tarea: Number(task.id_tarea) || task.id_tarea,
        json_data: diarios,
        replace_json_data: true
      }
      try {
        console.log(`[PpdReportDocument] Clearing PDF fields from task ${task.id_tarea} for date ${targetDate}`)
        await apiAxios.put('/tareas/updTareasV3', payload, {
          headers: { 'Content-Type': 'application/json' }
        })
        task.json_data = diarios
      } catch (err) {
        console.error(`Error clearing task ${task.id_tarea} PDF in database:`, err)
      }
    }
  }
}

async function reabrirPpd() {
  if (!props.surveyId) return
  const confirmed = confirm('¿Está seguro de reabrir este Parte de Producción Diario para editarlo de nuevo? Esto eliminará las firmas actuales.')
  if (!confirmed) return

  loadingSignatureFlow.value = true
  try {
    // 1) Llamar al backend para reabrir el survey y limpiar firmas
    await apiAxios.post('/survey/ReopenSurvey', {
      id_survey: props.surveyId
    })

    // 2) Limpiar los campos PDF de las tareas Gantt asociadas a esta fecha
    await clearPdfFromGanttTasks()

    // 3) Refrescar vista
    alert('Parte de Producción reabierto con éxito.')
    fetchSurveyDetail()
    emit('signed')
  } catch (err) {
    console.error('Error al reabrir PPD:', err)
    alert(err.message || 'Ocurrió un error al reabrir el Parte de Producción.')
  } finally {
    loadingSignatureFlow.value = false
  }
}

async function iniciarFirma() {
  if (!props.surveyId) return
  loadingSignatureFlow.value = true
  try {
    // 1) Generar HTML del reporte web PPD
    const ppdHtml = getPpdReportHtml()

    // 2) Generar y Guardar PDF desde HTML
    console.log('Sending export/generar-desde-html request for survey:', props.surveyId)
    const { data: genData } = await apiAxios.post('/exportar/generar-desde-html', {
      htmlContent: ppdHtml,
      idInspeccion: props.surveyId,
      tipo_doc: 'DOCUMENTO',
      mimetype: 'application/pdf',
      path_doc: '/u05/LeanDocs/ppd/',
      id_user: userDetailStore.userDetail?.id_user || 1,
      estado: '1'
    })

    if (!genData?.status) {
      throw new Error(genData?.error || 'Error al generar o registrar el PDF en el servidor.')
    }

    console.log('PDF generated/updated successfully from HTML:', genData)

    const pdfDocName = genData.name_doc_interno || `${props.surveyId}.pdf`
    savePdfToGanttTasks(pdfDocName)

    const ARCHIVO_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://servidor.leanglobal.cl'
    pdfUrlFirma.value = `${ARCHIVO_BASE_URL}/archivo/ppd/${pdfDocName}`

    // 3) Preparar mock de flujo para FirmaDialog
    detalleCrearFirma.value = {
      id_survey: props.surveyId,
      id_flow: genData.idDoc || 0, // guardamos el id_doc como id_flow para compatibilidad
      detalles_flujo: [{
        id_flow_stp: 0,
        flow_tmpl_step_orden: 1,
        id_rol: 35,
        name_rol: 'AVAN_APRB',
        flow_tmpl_step_name: 'Aprobación Avance',
        nombre_user: userDetailStore.userDetail ? `${userDetailStore.userDetail.name_frst} ${userDetailStore.userDetail.apellido_pat}` : 'Usuario',
        id_user: userDetailStore.userDetail?.id_user,
        estado: 'PENDIENTE'
      }]
    }

    // 4) Abrir el modal de Firma
    dialogConfirmarTerminar.value = true

  } catch (err) {
    console.error('Error al iniciar el proceso de firma:', err)
    alert(err.message || 'Ocurrió un error al iniciar el proceso de firma. Inténtelo de nuevo.')
  } finally {
    loadingSignatureFlow.value = false
  }
}

async function ejecutarGeneracionYCierrePpd(firmaData) {
  if (!props.surveyId) return
  loadingSignatureFlow.value = true
  const originalExec = reportSurveyData.value?.approval_exec
  try {
    const rolNombre = 'AVAN_APRB'

    // Pre-generar UUID para que el QR pueda renderizarse antes de enviar a compilar el PDF
    const preGeneratedUuid = generateUuid()
    const pdfDocName = `${preGeneratedUuid}.pdf`

    // 1) Inyectar firma localmente para que se dibuje en el DOM del reporte
    const nuevaFirmaItem = {
      firma: {
        nombre: `${userDetailStore.userDetail.name_frst} ${userDetailStore.userDetail.name_sec || ''} ${userDetailStore.userDetail.apellido_pat} ${userDetailStore.userDetail.apellido_mat || ''}`.replace(/\s+/g, ' ').trim(),
        rut: userDetailStore.userDetail.rut,
        rol: rolNombre,
        fecha: new Date().toLocaleString(),
        metodo_autenticacion: 'FES',
        aprueba_rechaza: 'APROBADO',
        observaciones: firmaData?.observaciones || 'Sin observaciones',
        id_user: userDetailStore.userDetail.id_user,
        ip_firma: 'DESCONOCIDA',
        user_agent: 'DESCONOCIDO',
        geo_latitude: -33.456,
        geo_longitude: -70.648,
        qrUrl: pdfDocName // ya tiene la URL pre-configurada!
      }
    }

    let currentExec = []
    if (reportSurveyData.value.approval_exec) {
      try {
        currentExec = typeof reportSurveyData.value.approval_exec === 'string'
          ? JSON.parse(reportSurveyData.value.approval_exec)
          : reportSurveyData.value.approval_exec
        if (!Array.isArray(currentExec)) currentExec = []
      } catch {
        currentExec = []
      }
    }

    // Filtrar firmas anteriores del mismo rol para evitar duplicados
    currentExec = currentExec.filter(item => {
      const f = item?.firma ?? item
      return String(f?.rol || '').trim().toUpperCase() !== 'AVAN_APRB'
    })
    currentExec.push(nuevaFirmaItem)

    // Actualizar reactivamente
    reportSurveyData.value.approval_exec = currentExec

    // Esperar a que Vue redibuje la tabla de firmas con los datos inyectados
    await nextTick()

    // 2) Generar HTML del reporte firmado
    const ppdHtmlFirmado = getPpdReportHtml()

    // 3) Generar PDF final firmado en /u05/LeanDocs/ppd/
    console.log('[PpdReportDocument] Generating final signed PDF from HTML...')
    const { data: genData } = await apiAxios.post('/exportar/generar-desde-html', {
      htmlContent: ppdHtmlFirmado,
      idInspeccion: props.surveyId,
      tipo_doc: 'DOCUMENTO',
      mimetype: 'application/pdf',
      path_doc: '/u05/LeanDocs/ppd/',
      id_user: userDetailStore.userDetail?.id_user || 1,
      estado: '1',
      name_doc_interno: pdfDocName // pasar el UUID pre-generado
    })

    if (!genData?.status) {
      throw new Error(genData?.error || 'Error al generar o registrar el PDF en el servidor.')
    }

    console.log('[PpdReportDocument] PDF signed generated successfully:', pdfDocName)

    // 4) Guardar la firma en la base de datos (POST /signature/UpdApprovalExec)
    const dataApproval = {
      id_survey: props.surveyId,
      nuevaFirma: nuevaFirmaItem
    }

    console.log('[PpdReportDocument] Updating approval_exec:', dataApproval)
    await apiAxios.post('/signature/UpdApprovalExec', dataApproval)

    // 5) Actualizar estado del survey a 'APROBADO'
    console.log('[PpdReportDocument] Updating survey status to APROBADO')
    await apiAxios.post('/survey/UpdSurveyEstado', {
      id_survey: props.surveyId,
      estado_srv: 'APROBADO'
    })

    // 6) Guardar en tareas Gantt
    await savePdfToGanttTasks(pdfDocName)

    // 7) Refrescar vista
    alert('Firma registrada y reporte cerrado con éxito.')
    dialogConfirmarTerminar.value = false
    fetchSurveyDetail()
    emit('signed')

  } catch (err) {
    if (reportSurveyData.value) {
      reportSurveyData.value.approval_exec = originalExec
    }
    console.error('Error al finalizar y generar PPD:', err)
    alert(err.message || 'Error al finalizar el reporte.')
  } finally {
    loadingSignatureFlow.value = false
  }
}

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

async function savePdfToGanttTasks(pdfDocName) {
  if (!pdfDocName) return
  const targetDate = toYmd(props.fecha) || toYmd(reportSurveyData.value?.fecha_plan_ini) || toYmd(reportSurveyData.value?.body_exec?.meta?.fecha)
  if (!targetDate) return

  const tasks = props.ganttTasks || []
  for (const task of tasks) {
    const isTaskInSurvey = (() => {
      const surveyTasks = reportSurveyData.value?.body_exec?.tasks || []
      const taskIdStr = String(task.id_tarea || task.idTarea || '').trim()
      return surveyTasks.some(st => String(st.id_tarea || st.idTarea || '').trim() === taskIdStr)
    })()

    if (!isTaskInSurvey) continue

    let diarios = []
    if (Array.isArray(task.json_data)) {
      diarios = task.json_data.map(d => ({ ...d }))
    } else if (typeof task.json_data === 'string') {
      try {
        const parsed = JSON.parse(task.json_data)
        diarios = Array.isArray(parsed) ? parsed.map(d => ({ ...d })) : []
      } catch {
        diarios = []
      }
    }

    let entry = diarios.find(d => toYmd(d.fecha || d.date || d.dia || '') === targetDate)
    if (!entry) {
      entry = {
        fecha: targetDate,
        date: targetDate,
        dia: targetDate,
        real: 0,
        value: 1
      }
      diarios.push(entry)
    }

    let updated = false
    if (entry.pdf !== pdfDocName || entry.pdf_name !== pdfDocName || entry.name_doc_interno !== pdfDocName) {
      entry.pdf = pdfDocName
      entry.pdf_name = pdfDocName
      entry.name_doc_interno = pdfDocName
      updated = true
    }

    if (updated) {
      const payload = {
        id_tarea: Number(task.id_tarea) || task.id_tarea,
        json_data: diarios,
        replace_json_data: true
      }
      try {
        console.log(`[PpdReportDocument] Saving PDF name to task ${task.id_tarea} for date ${targetDate}:`, pdfDocName)
        await apiAxios.put('/tareas/updTareasV3', payload, {
          headers: { 'Content-Type': 'application/json' }
        })
        task.json_data = diarios
      } catch (err) {
        console.error(`Error updating task ${task.id_tarea} in database:`, err)
      }
    }
  }
}

const normalizeText = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()

const generateUuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

const toNumberSafe = (v) => {
  if (v === null || v === undefined) return 0
  const n = parseFloat(String(v).replace(',', '.'))
  return Number.isFinite(n) ? n : 0
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
    if (historial.length > 0) {
      return historial.map((h) => ({
        rol: h.rol || 'APROBADOR AVANCE',
        nombre: h.nombre || 'Sin registrar',
        rut: h.rut || '—',
        fecha: h.fecha ? formatDateString(h.fecha.slice(0, 10)) : '—',
        aprueba_rechaza: ['APROBADO', 'APRUEBA'].includes(String(h.aprueba_rechaza).toUpperCase()) ? 'APROBADO' : 'PENDIENTE',
        qrUrl: h.qrUrl ?? ''
      }))
    }
    return [
      { rol: 'APROBADOR AVANCE', nombre: 'Sin registrar', rut: '—', aprueba_rechaza: 'PENDIENTE', fecha: '—', qrUrl: '' }
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
      aprueba_rechaza: estado,
      qrUrl: hit?.qrUrl ?? ''
    }
  })
})

const getFirmaByRol = (rolName) => {
  const cleanRol = normalizeText(rolName)
  
  // 1) Buscar en computedFirmas (mapeado de pasos de flujo)
  let hit = computedFirmas.value.find(f => {
    const cleanFirmaRol = normalizeText(f.rol)
    return cleanFirmaRol.includes(cleanRol) && f.aprueba_rechaza !== 'PENDIENTE'
  })
  if (hit) return hit

  // 2) Buscar en firmasHistorial (leído de approval_exec directamente)
  const rawHit = firmasHistorial.value.find(f => {
    const cleanFirmaRol = normalizeText(f.rol)
    return cleanFirmaRol.includes(cleanRol)
  })
  if (rawHit) {
    return {
      rol: rawHit.rol,
      nombre: rawHit.nombre,
      rut: rawHit.rut,
      fecha: rawHit.fecha ? formatDateString(rawHit.fecha.slice(0, 10)) : '—',
      aprueba_rechaza: ['APROBADO', 'APRUEBA'].includes(String(rawHit.aprueba_rechaza).toUpperCase()) ? 'APROBADO' : 'PENDIENTE',
      qrUrl: rawHit.qrUrl ?? ''
    }
  }
  return null
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
        linea: entry.linea || '',
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
        linea: act.linea || '',
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
          let sortedSteps = Array.isArray(steps)
            ? [...steps].sort(
                (a, b) =>
                  Number(a?.flow_tmpl_step_orden ?? Number.MAX_SAFE_INTEGER) -
                  Number(b?.flow_tmpl_step_orden ?? Number.MAX_SAFE_INTEGER)
              )
            : []
          
          const firstStep = sortedSteps.find(s => s.flow_tmpl_step_orden === 1) || sortedSteps[0]
          if (firstStep) {
            flowStepsActuales.value = [{
              ...firstStep,
              id_rol: 35,
              name_rol: 'AVAN_APRB',
              flow_tmpl_step_name: 'Aprobación Avance'
            }]
          } else {
            flowStepsActuales.value = sortedSteps
          }

          let pdfDocName = null
          for (const st of sortedSteps) {
            if (st.name_doc_interno_out) {
              pdfDocName = st.name_doc_interno_out
              break
            }
            if (st.name_doc_interno_in) {
              pdfDocName = st.name_doc_interno_in
              break
            }
          }
          if (pdfDocName && !['EJECUCIÓN', 'PRE CREADO'].includes(String(detail.estado_srv || '').toUpperCase().trim())) {
            savePdfToGanttTasks(pdfDocName)
          }
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
  fetchCatalogs()
})

watch(() => props.surveyId, () => {
  fetchSurveyDetail()
})
</script>

<style scoped>
/* Tablas formales para el reporte PPD */
.ppd-table-grid, .ppd-table-totals, .ppd-table-signatures {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  background-color: #ffffff;
  border: 1.5px solid #000000;
  font-family: Arial, Helvetica, sans-serif;
}

.ppd-table-grid :deep(th), .ppd-table-grid :deep(td),
.ppd-table-totals :deep(th), .ppd-table-totals :deep(td),
.ppd-table-signatures :deep(th), .ppd-table-signatures :deep(td) {
  border: 1px solid #000000 !important;
  padding: 6px;
  font-size: 11px;
  color: #000000;
  vertical-align: middle;
}

.ppd-table-grid :deep(th), .ppd-table-totals :deep(th), .ppd-table-signatures :deep(th) {
  background-color: #f1f5f9;
  font-weight: bold;
  text-align: center;
  text-transform: uppercase;
}

.ppd-table-grid .sub-headers th {
  padding: 2px 4px;
  font-size: 9px;
}

.vertical-header {
  height: 140px;
  width: 35px;
  min-width: 35px;
  max-width: 35px;
  vertical-align: bottom;
  padding: 8px 2px !important;
}

.vertical-header > div {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  white-space: nowrap;
  font-size: 10px;
  font-weight: bold;
  text-align: left;
  margin: 0 auto;
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
  }
  
  .ppd-table-grid, .ppd-table-totals, .ppd-table-signatures {
    border: 2px solid #000000 !important;
  }
  .ppd-table-grid th, .ppd-table-grid td,
  .ppd-table-totals th, .ppd-table-totals td,
  .ppd-table-signatures th, .ppd-table-signatures td {
    border: 1px solid #000000 !important;
  }
  .no-print {
    display: none !important;
  }
}
</style>
