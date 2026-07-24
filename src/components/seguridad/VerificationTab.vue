<!-- src/components/seguridad/VerificationTab.vue -->
<template>
  <v-container
    fluid
    class="pa-2 custom-bg"
  >
    <!-- Compact Header / Toolbar -->
    <v-card
      flat
      class="compact-header mb-2 pa-2 d-flex align-center justify-space-between flex-wrap ga-2 border-bottom"
    >
      <div class="d-flex align-center ga-2">
        <v-avatar
          color="primary"
          size="32"
        >
          <v-icon
            size="18"
            icon="mdi-shield-check-outline"
            class="text-white"
          />
        </v-avatar>
        <div>
          <h1 class="text-subtitle-2 font-weight-bold mb-0">
            Trazabilidad de Seguridad (BD ref. gestion.md)
          </h1>
          <div class="text-caption text-grey-darken-1">
            Base de datos: tpar_area (2) ➔ tsrv_tipo_template ➔ tstv_templates
          </div>
        </div>
      </div>

      <!-- Compact Stats summary inline -->
      <div class="d-flex align-center ga-2 text-caption">
        <v-chip
          size="x-small"
          color="primary"
          variant="flat"
        >
          Total: {{ totalCount }}
        </v-chip>
        <v-chip
          size="x-small"
          color="info"
          variant="flat"
        >
          Evidencias: {{ evidenceCount }}
        </v-chip>
        <v-chip
          size="x-small"
          color="success"
          variant="flat"
        >
          PDF OK: {{ pdfOkCount }}
        </v-chip>
        <v-chip
          size="x-small"
          color="error"
          variant="flat"
        >
          Con Obs Excel: {{ obsExcelCount }}
        </v-chip>
      </div>

      <!-- Action tools -->
      <div class="d-flex align-center ga-1">
        <v-btn
          size="x-small"
          color="primary"
          variant="outlined"
          prepend-icon="mdi-export-variant"
          class="text-none font-weight-bold"
          @click="exportState"
        >
          Exportar JSON
        </v-btn>
        <v-btn
          size="x-small"
          color="primary"
          variant="outlined"
          prepend-icon="mdi-import"
          class="text-none font-weight-bold"
          @click="triggerImport"
        >
          Importar JSON
        </v-btn>
        
        <v-chip
          v-if="isServerConnected"
          color="success"
          variant="flat"
          size="x-small"
          prepend-icon="mdi-server"
        >
          Servidor (Compartido /data)
        </v-chip>
        <v-chip
          v-else
          color="grey-darken-1"
          variant="tonal"
          size="x-small"
          prepend-icon="mdi-database-outline"
        >
          Navegador (Local)
        </v-chip>

        <v-chip
          v-if="autoSaveSuccess"
          color="success"
          variant="tonal"
          size="x-small"
          class="ml-1"
        >
          Guardado OK
        </v-chip>
        
        <input
          ref="fileInput"
          type="file"
          style="display: none;"
          accept=".json"
          @change="importState"
        >
      </div>
    </v-card>

    <!-- Global Filter and Search Bar -->
    <v-card
      flat
      class="mb-3 pa-2 border"
    >
      <v-row
        dense
        align="center"
      >
        <v-col
          cols="12"
          sm="6"
          md="4"
        >
          <v-text-field
            v-model="searchQuery"
            label="Buscar por template, código u observación..."
            density="compact"
            variant="outlined"
            prepend-inner-icon="mdi-magnify"
            hide-details
            clearable
          />
        </v-col>
        <v-col
          cols="12"
          sm="6"
          md="3"
        >
          <v-checkbox
            v-model="filterOnlyObs"
            label="Ver solo con observaciones de Excel"
            density="compact"
            hide-details
            class="mt-0"
          />
        </v-col>
        <v-spacer />
        <v-col
          cols="auto"
          class="d-flex ga-1"
        >
          <v-btn
            size="x-small"
            variant="text"
            color="primary"
            @click="expandAll(true)"
          >
            Expandir Todo (excl. 37)
          </v-btn>
          <v-btn
            size="x-small"
            variant="text"
            color="primary"
            @click="expandAll(false)"
          >
            Colapsar Todo
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- 1. SECCIÓN: Inspecciones y Checklist -->
    <v-card
      flat
      class="mb-4 pa-2 border rounded-xl bg-section-inspecciones"
    >
      <div class="d-flex align-center px-2 py-1 mb-2">
        <v-icon
          color="primary"
          icon="mdi-clipboard-check-multiple-outline"
          class="mr-2"
        />
        <h2 class="text-subtitle-2 font-weight-bold mb-0">
          Inspecciones y Checklist
        </h2>
      </div>

      <v-expansion-panels
        v-model="expandedPanels"
        multiple
        variant="accordion"
        class="compact-panels"
      >
        <v-expansion-panel
          v-for="family in groupedTemplates"
          v-show="family.templates.length > 0"
          :key="family.id"
          :value="family.id"
          class="mb-1 border rounded-lg"
          :class="{ 'panel-auxiliar': family.id === 37 }"
        >
          <v-expansion-panel-title
            hide-actions
            class="py-2 px-3 text-caption font-weight-bold"
          >
            <template #default="{ expanded }">
              <div class="d-flex align-center w-100">
                <!-- Chevron on the left -->
                <v-icon
                  size="16"
                  :icon="expanded ? 'mdi-chevron-down' : 'mdi-chevron-right'"
                  class="mr-2 text-primary"
                />
                <v-icon
                  size="16"
                  icon="mdi-folder-outline"
                  class="mr-2 text-grey-darken-1"
                />
                <span>Familia {{ family.name }}</span>
                <v-chip
                  v-if="family.id === 37"
                  size="x-small"
                  color="grey"
                  variant="flat"
                  class="ml-2 font-weight-bold"
                >
                  Auxiliar (Comprimido)
                </v-chip>
                <v-spacer />
                <v-chip
                  size="x-small"
                  color="primary"
                  variant="tonal"
                  class="font-weight-bold"
                >
                  {{ family.templates.length }} templates
                </v-chip>
                <v-chip
                  v-if="family.hasObs && family.id !== 37"
                  size="x-small"
                  color="error"
                  variant="flat"
                  class="ml-2 font-weight-bold"
                >
                  Tiene Obs
                </v-chip>
              </div>
            </template>
          </v-expansion-panel-title>
          
          <v-expansion-panel-text class="pa-0">
            <v-table
              density="compact"
              class="dense-table"
            >
              <thead>
                <tr>
                  <th
                    class="text-center font-weight-bold"
                    style="width: 50px;"
                  >
                    ID Temp
                  </th>
                  <th
                    class="text-left font-weight-bold"
                    style="width: 180px;"
                  >
                    Template / Checklist
                  </th>
                  <th
                    class="text-left font-weight-bold"
                    style="width: 110px;"
                  >
                    Código
                  </th>
                  <th
                    class="text-left font-weight-bold"
                    style="width: 130px;"
                  >
                    Render en PWA
                  </th>
                  <th
                    class="text-left font-weight-bold"
                    style="width: 280px;"
                  >
                    Observación del Cliente (Excel)
                  </th>
                  <th class="text-left font-weight-bold">
                    Notas Dev / Solución (Puntos)
                  </th>
                  <th
                    class="text-left font-weight-bold"
                    style="width: 110px;"
                  >
                    Evidencia (ID)
                  </th>
                  <th
                    class="text-center font-weight-bold"
                    style="width: 70px;"
                  >
                    PDF OK?
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="t in family.templates"
                  :key="t.template_id"
                  :class="{ 
                    'row-has-obs': t.excelObs && family.id !== 37 && !t.isFullyResolved, 
                    'row-pdf-ok': t.pdfOk || t.isFullyResolved, 
                    'row-excel-green': t.isExcelGreen && family.id !== 37
                  }"
                >
                  <!-- ID Template -->
                  <td class="text-center text-caption font-weight-bold">
                    {{ t.template_id }}
                  </td>
                  
                  <!-- Template Nombre -->
                  <td class="text-caption font-weight-medium text-grey-darken-4">
                    {{ t.template_nombre }}
                  </td>
                  
                  <!-- Template Código -->
                  <td class="text-caption text-mono">
                    {{ t.template_codigo }}
                  </td>
                  
                  <!-- Render PWA Mode -->
                  <td class="text-caption">
                    <v-chip
                      size="x-small"
                      :color="t.isCustom ? 'indigo' : 'grey'"
                      variant="tonal"
                      class="font-weight-medium"
                    >
                      {{ t.renderModeLabel }}
                    </v-chip>
                  </td>
                  
                  <!-- Excel Observation (CLIENT) -->
                  <td class="text-caption py-1">
                    <div
                      v-if="t.excelObs && family.id !== 37"
                      class="d-flex align-start ga-1 cell-obs"
                    >
                      <v-icon
                        size="14"
                        :icon="t.isExcelGreen ? 'mdi-check-decagram' : 'mdi-alert-circle'"
                        :color="t.isExcelGreen ? 'success' : 'error'"
                        class="mt-0-5"
                      />
                      <div
                        class="obs-text"
                        :class="{ 'text-success-dark': t.isExcelGreen }"
                        :title="t.excelObs.comentarios"
                      >
                        <strong>Obs {{ t.excelObs.num }}:</strong> 
                        <span v-html="formatComment(t.excelObs.comentarios)" />
                        <v-chip
                          v-if="t.isExcelGreen"
                          size="x-small"
                          color="success"
                          variant="flat"
                          class="ml-1 px-1 py-0 height-14 text-9"
                        >
                          Resuelto
                        </v-chip>
                      </div>
                    </div>
                    <span
                      v-else
                      class="text-grey-lighten-1 d-flex align-center ga-1 text-xs"
                    >
                      <v-icon
                        size="12"
                        icon="mdi-check-circle-outline"
                        color="success"
                      />
                      Sin observaciones
                    </span>
                  </td>
                  
                  <!-- Notes Dev / Solución (Puntos del Excel) -->
                  <td class="py-1">
                    <div
                      v-if="t.excelObs && family.id !== 37"
                      class="d-flex flex-column ga-2 py-1"
                    >
                      <!-- Badge indicating resolved status -->
                      <div class="d-flex align-center ga-2 mb-1">
                        <v-chip
                          v-if="t.isFullyResolved"
                          size="x-small"
                          color="success"
                          variant="flat"
                          class="font-weight-bold"
                        >
                          🟢 Resuelto en Notas Dev
                        </v-chip>
                        <v-chip
                          v-else
                          size="x-small"
                          color="error"
                          variant="tonal"
                          class="font-weight-bold"
                        >
                          🔴 Pendiente
                        </v-chip>
                      </div>
                      
                      <div 
                        v-for="(pointText, pIdx) in t.excelObsPoints" 
                        :key="pIdx"
                        class="d-flex flex-column border-bottom-dashed pb-1"
                      >
                        <div class="d-flex align-center ga-2 mb-1">
                          <v-btn
                            size="x-small"
                            :color="t.pointsState[pIdx]?.resolved ? 'success' : 'error'"
                            variant="flat"
                            class="px-2 py-0 height-18 font-weight-bold text-9 text-none rounded-pill"
                            @click="togglePointState(t.template_id, pIdx)"
                          >
                            {{ t.pointsState[pIdx]?.resolved ? '🟢 Resuelto' : '🔴 Pendiente' }}
                          </v-btn>
                          <span class="text-caption font-weight-medium text-grey-darken-3">
                            Punto {{ pIdx + 1 }}: {{ pointText }}
                          </span>
                        </div>
                        <v-text-field
                          v-model="t.pointsState[pIdx].note"
                          density="compact"
                          variant="outlined"
                          hide-details
                          placeholder="Nota de solución del punto..."
                          class="compact-point-input text-caption"
                          @update:model-value="val => updatePointNote(t.template_id, pIdx, val)"
                        />
                      </div>
                    </div>
                    <div v-else>
                      <div
                        v-if="t.isFullyResolved"
                        class="d-flex align-center ga-2 mb-1"
                      >
                        <v-chip
                          size="x-small"
                          color="success"
                          variant="flat"
                          class="font-weight-bold"
                        >
                          🟢 Resuelto
                        </v-chip>
                      </div>
                      <v-textarea
                        v-model="t.notes"
                        rows="1"
                        auto-grow
                        density="compact"
                        variant="outlined"
                        hide-details
                        placeholder="Notas generales..."
                        class="compact-textarea text-caption"
                        @update:model-value="val => updateState(t.template_id, 'notes', val)"
                      />
                    </div>
                  </td>
                  
                  <!-- Evidencia Input -->
                  <td class="py-1">
                    <v-text-field
                      v-model="t.evidenceId"
                      density="compact"
                      variant="outlined"
                      hide-details
                      placeholder="ID Survey"
                      class="compact-input text-caption"
                      @update:model-value="val => updateState(t.template_id, 'evidenceId', val)"
                    >
                      <template
                        v-if="t.evidenceId"
                        #append-inner
                      >
                        <v-icon
                          size="14"
                          icon="mdi-open-in-new"
                          color="primary"
                          class="cursor-pointer"
                          @click.stop="openSurveyLink(t.evidenceId)"
                        />
                      </template>
                    </v-text-field>
                  </td>
                  
                  <!-- PDF OK Checkbox -->
                  <td class="text-center py-1">
                    <v-checkbox
                      v-model="t.pdfOk"
                      density="compact"
                      hide-details
                      color="success"
                      class="d-inline-flex justify-center"
                      @update:model-value="val => updateState(t.template_id, 'pdfOk', val)"
                    />
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card>

    <!-- 2. SECCIÓN: Informes (SST y Auditoría) -->
    <v-card
      flat
      class="mb-4 pa-2 border rounded-xl bg-section-informes"
    >
      <div class="d-flex align-center px-2 py-1 mb-2">
        <v-icon
          color="secondary"
          icon="mdi-file-document-multiple-outline"
          class="mr-2"
        />
        <h2 class="text-subtitle-2 font-weight-bold mb-0">
          Informes (Seguridad)
        </h2>
      </div>

      <v-expansion-panels
        v-model="expandedInformesPanels"
        multiple
        variant="accordion"
        class="compact-panels"
      >
        <v-expansion-panel
          v-for="group in informesGroups"
          v-show="group.templates.length > 0"
          :key="group.id"
          :value="group.id"
          class="mb-1 border rounded-lg"
        >
          <v-expansion-panel-title
            hide-actions
            class="py-2 px-3 text-caption font-weight-bold"
          >
            <template #default="{ expanded }">
              <div class="d-flex align-center w-100">
                <!-- Chevron on the left -->
                <v-icon
                  size="16"
                  :icon="expanded ? 'mdi-chevron-down' : 'mdi-chevron-right'"
                  class="mr-2 text-secondary"
                />
                <v-icon
                  size="16"
                  icon="mdi-file-document-outline"
                  class="mr-2 text-grey-darken-1"
                />
                <span>{{ group.name }}</span>
                <v-spacer />
                <v-chip
                  size="x-small"
                  color="secondary"
                  variant="tonal"
                  class="font-weight-bold"
                >
                  {{ group.templates.length }} reportes
                </v-chip>
              </div>
            </template>
          </v-expansion-panel-title>

          <v-expansion-panel-text class="pa-0">
            <v-table
              density="compact"
              class="dense-table"
            >
              <thead>
                <tr>
                  <th
                    class="text-center font-weight-bold"
                    style="width: 50px;"
                  >
                    ID Temp
                  </th>
                  <th
                    class="text-left font-weight-bold"
                    style="width: 180px;"
                  >
                    Template / Checklist
                  </th>
                  <th
                    class="text-left font-weight-bold"
                    style="width: 110px;"
                  >
                    Código
                  </th>
                  <th
                    class="text-left font-weight-bold"
                    style="width: 130px;"
                  >
                    Render en PWA
                  </th>
                  <th
                    class="text-left font-weight-bold"
                    style="width: 280px;"
                  >
                    Observación del Cliente (Excel)
                  </th>
                  <th class="text-left font-weight-bold">
                    Notas Dev / Solución (Puntos)
                  </th>
                  <th
                    class="text-left font-weight-bold"
                    style="width: 110px;"
                  >
                    Evidencia (ID)
                  </th>
                  <th
                    class="text-center font-weight-bold"
                    style="width: 70px;"
                  >
                    PDF OK?
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="t in group.templates"
                  :key="t.template_id"
                  :class="{ 
                    'row-has-obs': t.excelObs && !t.isFullyResolved, 
                    'row-pdf-ok': t.pdfOk || t.isFullyResolved, 
                    'row-excel-green': t.isExcelGreen 
                  }"
                >
                  <!-- ID Template -->
                  <td class="text-center text-caption font-weight-bold">
                    {{ t.template_id }}
                  </td>
                  
                  <!-- Template Nombre -->
                  <td class="text-caption font-weight-medium text-grey-darken-4">
                    {{ t.template_nombre }}
                  </td>
                  
                  <!-- Template Código -->
                  <td class="text-caption text-mono">
                    {{ t.template_codigo }}
                  </td>
                  
                  <!-- Render PWA Mode -->
                  <td class="text-caption">
                    <v-chip
                      size="x-small"
                      :color="t.isCustom ? 'indigo' : 'grey'"
                      variant="tonal"
                      class="font-weight-medium"
                    >
                      {{ t.renderModeLabel }}
                    </v-chip>
                  </td>
                  
                  <!-- Excel Observation (CLIENT) -->
                  <td class="text-caption py-1">
                    <div
                      v-if="t.excelObs"
                      class="d-flex align-start ga-1 cell-obs"
                    >
                      <v-icon
                        size="14"
                        :icon="t.isExcelGreen ? 'mdi-check-decagram' : 'mdi-alert-circle'"
                        :color="t.isExcelGreen ? 'success' : 'error'"
                        class="mt-0-5"
                      />
                      <div
                        class="obs-text"
                        :class="{ 'text-success-dark': t.isExcelGreen }"
                        :title="t.excelObs.comentarios"
                      >
                        <strong>Obs {{ t.excelObs.num }}:</strong> 
                        <span v-html="formatComment(t.excelObs.comentarios)" />
                        <v-chip
                          v-if="t.isExcelGreen"
                          size="x-small"
                          color="success"
                          variant="flat"
                          class="ml-1 px-1 py-0 height-14 text-9"
                        >
                          Resuelto
                        </v-chip>
                      </div>
                    </div>
                    <span
                      v-else
                      class="text-grey-lighten-1 d-flex align-center ga-1 text-xs"
                    >
                      <v-icon
                        size="12"
                        icon="mdi-check-circle-outline"
                        color="success"
                      />
                      Sin observaciones
                    </span>
                  </td>
                  
                  <!-- Notes Dev / Solución (Puntos del Excel) -->
                  <td class="py-1">
                    <div
                      v-if="t.excelObs"
                      class="d-flex flex-column ga-2 py-1"
                    >
                      <!-- Badge indicating resolved status -->
                      <div class="d-flex align-center ga-2 mb-1">
                        <v-chip
                          v-if="t.isFullyResolved"
                          size="x-small"
                          color="success"
                          variant="flat"
                          class="font-weight-bold"
                        >
                          🟢 Resuelto en Notas Dev
                        </v-chip>
                        <v-chip
                          v-else
                          size="x-small"
                          color="error"
                          variant="tonal"
                          class="font-weight-bold"
                        >
                          🔴 Pendiente
                        </v-chip>
                      </div>
                      
                      <div 
                        v-for="(pointText, pIdx) in t.excelObsPoints" 
                        :key="pIdx"
                        class="d-flex flex-column border-bottom-dashed pb-1"
                      >
                        <div class="d-flex align-center ga-2 mb-1">
                          <v-btn
                            size="x-small"
                            :color="t.pointsState[pIdx]?.resolved ? 'success' : 'error'"
                            variant="flat"
                            class="px-2 py-0 height-18 font-weight-bold text-9 text-none rounded-pill"
                            @click="togglePointState(t.template_id, pIdx)"
                          >
                            {{ t.pointsState[pIdx]?.resolved ? '🟢 Resuelto' : '🔴 Pendiente' }}
                          </v-btn>
                          <span class="text-caption font-weight-medium text-grey-darken-3">
                            Punto {{ pIdx + 1 }}: {{ pointText }}
                          </span>
                        </div>
                        <v-text-field
                          v-model="t.pointsState[pIdx].note"
                          density="compact"
                          variant="outlined"
                          hide-details
                          placeholder="Nota de solución del punto..."
                          class="compact-point-input text-caption"
                          @update:model-value="val => updatePointNote(t.template_id, pIdx, val)"
                        />
                      </div>
                    </div>
                    <div v-else>
                      <div
                        v-if="t.isFullyResolved"
                        class="d-flex align-center ga-2 mb-1"
                      >
                        <v-chip
                          size="x-small"
                          color="success"
                          variant="flat"
                          class="font-weight-bold"
                        >
                          🟢 Resuelto
                        </v-chip>
                      </div>
                      <v-textarea
                        v-model="t.notes"
                        rows="1"
                        auto-grow
                        density="compact"
                        variant="outlined"
                        hide-details
                        placeholder="Notas generales..."
                        class="compact-textarea text-caption"
                        @update:model-value="val => updateState(t.template_id, 'notes', val)"
                      />
                    </div>
                  </td>
                  
                  <!-- Evidencia Input -->
                  <td class="py-1">
                    <v-text-field
                      v-model="t.evidenceId"
                      density="compact"
                      variant="outlined"
                      hide-details
                      placeholder="ID Survey"
                      class="compact-input text-caption"
                      @update:model-value="val => updateState(t.template_id, 'evidenceId', val)"
                    >
                      <template
                        v-if="t.evidenceId"
                        #append-inner
                      >
                        <v-icon
                          size="14"
                          icon="mdi-open-in-new"
                          color="primary"
                          class="cursor-pointer"
                          @click.stop="openSurveyLink(t.evidenceId)"
                        />
                      </template>
                    </v-text-field>
                  </td>
                  
                  <!-- PDF OK Checkbox -->
                  <td class="text-center py-1">
                    <v-checkbox
                      v-model="t.pdfOk"
                      density="compact"
                      hide-details
                      color="success"
                      class="d-inline-flex justify-center"
                      @update:model-value="val => updateState(t.template_id, 'pdfOk', val)"
                    />
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card>


    <!-- Import Dialog -->
    <v-dialog
      v-model="importDialog"
      max-width="400"
      rounded="xl"
    >
      <v-card class="pa-4 text-center">
        <v-icon
          size="48"
          color="primary"
          icon="mdi-file-import-outline"
          class="mb-2"
        />
        <h3 class="text-subtitle-1 font-weight-bold">
          Importar trazabilidad
        </h3>
        <p class="text-caption text-grey-darken-1 mt-2">
          Esto reemplazará todos tus IDs de evidencia, notas y estados de la sesión actual. ¿Deseas continuar?
        </p>
        <v-card-actions class="justify-center mt-3">
          <v-btn
            size="small"
            color="grey"
            variant="text"
            @click="cancelImport"
          >
            Cancelar
          </v-btn>
          <v-btn
            size="small"
            color="primary"
            variant="flat"
            rounded="pill"
            @click="confirmImport"
          >
            Confirmar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import apiAxios from '@/services/api'

// Data sources
import rawDbTemplates from '../../assets/database_templates.json'
const rawExcelObs = ref([])

const router = useRouter()
const fileInput = ref(null)
const importDialog = ref(false)
const importFileContent = ref(null)
const autoSaveSuccess = ref(false)

const searchQuery = ref('')
const filterOnlyObs = ref(false)

// Expansion panels model arrays
const expandedPanels = ref([])
const expandedInformesPanels = ref([])

// Shared Server Mode Configuration
const isServerConnected = ref(false)
const apiUrl = ref('')

// Define virtual IDs for the actual Web Modules
const sstTemplateIds = ['WEB-SST']
const auditoriaTemplateIds = ['WEB-AUD']
const informesTemplateIds = [...sstTemplateIds, ...auditoriaTemplateIds]

// Safety Templates mappings
const customTemplatesMap = {
  169: 'Custom: <Vibropison>',
  170: 'Custom: <ChequeoSeguridadBetonera>',
  165: 'Custom: <CheckListTecles>',
  171: 'Custom: <checkeoMartilloDemoledor>',
  172: 'Custom: <checkEquiposIluminacion>',
  167: 'Custom: <chequeoExtensionElectrica>',
  168: 'Custom: <checkMonofasicoTrifasico>',
  108: 'Custom: <ListaInspeccionCamion>',
  86: 'Custom: <inspeccionCamion>',
  200: 'Custom: <checkBanosInstalaciones>',
  173: 'Custom: <checkDispensadorAguaPotable>',
  174: 'Custom: <checkListHerramientasManuales>',
  101: 'Custom: <checkListHerramientasManuales>',
  109: 'Custom: <checkEpp>',
  199: 'Custom: <checkEpp>',
  166: 'Custom: <ingresoZanja>',
  89: 'Custom: <atsBloquesToggle>',
  201: 'Custom: <atsBloquesToggle>',
  180: 'Custom: <condicionesSeguridadTrabajo>',
  202: 'Custom: <EstructuraMultiple>',
  175: 'Custom: <ArtefactosCheck> (BHP)'
}

// Map database templates name or code to Excel Observations row index
const templateToExcelMapping = {
  169: '9',
  170: '3',
  165: '8',
  171: '7',
  172: '5',
  167: '11',
  168: '10',
  108: '27',
  86: '20',
  200: '26',
  173: '4',
  174: '6',
  101: '30',
  109: '38',
  199: '28',
  166: '12',
  89: '1',
  201: '24',
  180: '33',
  175: '13',
  82: '21',
  94: '21',
  194: '23',
  195: '22',
  74: '42',
  78: '41',
  77: '40',
  76: '43',
  96: '14',
  100: '15',
  146: '45',
  147: '48',
  148: '46',
  149: '47',
  150: '44',
  143: '49',
  'WEB-SST': '16',
  'WEB-AUD': '51',
  187: '25',
  197: '29',
  189: '32',
  186: '31',
  198: '35',
  104: '34',
  105: '36'
}

// Full reactived template list
const dbTemplates = ref([])

onMounted(async () => {
  await loadData()
})

// Splits Excel comments into structured points
function parseCommentsIntoPoints(commentText) {
  if (!commentText) return [];
  const normalized = commentText.replace(/\r\n/g, '\n');
  const rawLines = normalized.split(/\n/);
  const points = [];
  let currentPoint = '';

  for (const line of rawLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Split by numbered list "1.", "2." or asterisks
    const isNewPoint = /^\d+\s*[\.\)]/.test(trimmed) || trimmed.startsWith('*');
    
    if (isNewPoint) {
      if (currentPoint) {
        points.push(currentPoint);
      }
      currentPoint = trimmed;
    } else {
      if (currentPoint) {
        currentPoint += ' ' + trimmed;
      } else {
        currentPoint = trimmed;
      }
    }
  }
  
  if (currentPoint) {
    points.push(currentPoint);
  }
  
  if (points.length === 0 && commentText.trim()) {
    points.push(commentText.trim());
  }
  
  return points.map(p => p.trim());
}

// Load and process templates
async function loadData() {
  // Load excel observations dynamically
  try {
    const responseExcel = await fetch('./excel_observations.json?t=' + Date.now())
    if (responseExcel.ok) {
      rawExcelObs.value = await responseExcel.json()
    } else {
      console.error('Failed to load excel_observations.json')
    }
  } catch (excelErr) {
    console.error('Error fetching excel_observations.json:', excelErr)
  }

  let savedState = {}
  isServerConnected.value = false

  try {
    const res = await apiAxios.get('/observaciones', { timeout: 2500 })
    if (res.data && Array.isArray(res.data)) {
      res.data.forEach(item => {
        if (item.template_id) {
          savedState[String(item.template_id)] = {
            evidenceId: item.evidenceId || '',
            pdfOk: item.pdfOk || false,
            notes: item.notes || '',
            pointsState: item.pointsState || {}
          }
        }
      })
      isServerConnected.value = true
    }
  } catch (err) {
    console.warn('Using LocalStorage fallback:', err.message || err);
  }

  if (!isServerConnected.value) {
    try {
      const saved = localStorage.getItem('terracon_survey_trazabilidad')
      if (saved) {
        savedState = JSON.parse(saved)
      }
    } catch (err) {
      console.error('Error loading stored traces:', err)
    }
  }

  const filteredRaw = [...rawDbTemplates.filter(t => t.area_id === 2 || t.area_nombre === 'Seguridad'), 
    { template_id: 'WEB-SST', template_nombre: 'Módulo Web: Informe Mensual SST', template_codigo: 'WEB-MOD-SST', familia_id: 999, familia_nombre: 'Módulos Web' },
    { template_id: 'WEB-AUD', template_nombre: 'Módulo Web: Auditoría Legal SST', template_codigo: 'WEB-MOD-AUD', familia_id: 999, familia_nombre: 'Módulos Web' }
  ]

  dbTemplates.value = filteredRaw.map(t => {
    const key = String(t.template_id)
    const stored = savedState[key] || {}
    
    // Find mapped Excel observation
    const excelRowStr = templateToExcelMapping[key]
    
    let matchedObs = null
    if (key === 'WEB-SST') {
      matchedObs = {
        num: 'QA-WEB-SST',
        comentarios: '1.- <b>Registro de accidente:</b> zona corporal afectada falta incluir la lista desplegable de las zonas\n2.- Sexo: incluir la alternativa de otro\n3.- Ingreso a mutualidad dice Mutual, debe indicar ACHS\n4.- <b>Registro incidente y sucesos peligrosos:</b> El botón para generar aparece en blanco\n5.- Sexo: incluir otro\n6.- No permite asignar al grupo de procesos\n7.- <b>Informe detallado:</b> En antecedentes generales no permite ingresar nombre de administrador y prevención (quedan en blanco)\n8.- En antecedentes generales no suman los días perdidos\n9.- En antecedentes generales no esta automatizado los datos de la tasa\n10.- En métrica de accidente no suma los días perdidos, el % de ev. de cumplimiento no arroja datos\n11.- En el punto de capacitaciones, columna de relatoría indica mutual, se abrir la selección a: Prevención, CPHS, Organismo Administrador, Proveedor, Otec, Otro), en el caso de seleccionar otro ingresar cuál.\n12.- En el punto campaña SST, evaluar si se puede cargar alguna evidencia al reporte (imagen, pdf, excel)\n13.- Punto Protocolos, no arroja dato de avance total, para lo cual, previo al programa se debe incluir el total de actividades.\n14.- En el punto medición de índice, no arroja el índice de gravedad\n15.- Finalmente, al generar el informe NO está alimentando el dashboard',
        isGreen: false
      }
    } else if (key === 'WEB-AUD') {
      matchedObs = {
        num: 'QA-WEB-AUD',
        comentarios: '1.- No reconoce la dotación del contrato para definición de la categoría para las multa (Primera hasta 49 trabajadores, segunda de 5 a 199 trabajadores, tercera mas de 200 trabajadores)\n2.- El resultado de la auditoria no alimenta el dashboard\n3.- Se aplica la auditoría revisando puntos normativos y criterios, en el informe PDF adjunto quedaron registrado como NO CUMPLE todos los puntos que requieren cambios, en el plan de resolución se ingresaron los comentarios de los ajustes que se deben realizar.',
        isGreen: false
      }
    } else if (excelRowStr) {
      matchedObs = rawExcelObs.value.find(row => String(row.num) === excelRowStr)
    }

    // Excel green logic
    const isExcelGreen = matchedObs ? !!matchedObs.isGreen : false

    const customLabel = customTemplatesMap[t.template_id]
    const isCustom = !!customLabel || key.startsWith('WEB-')

    // Parse Excel comments to sub-points
    const excelObsPoints = matchedObs ? parseCommentsIntoPoints(matchedObs.comentarios) : []
    
    // Initialize sub-point states (default resolved = isExcelGreen)
    const pointsState = {}
    excelObsPoints.forEach((pt, pIdx) => {
      const storedPt = stored.pointsState?.[pIdx] || {}
      pointsState[pIdx] = {
        resolved: storedPt.resolved !== undefined ? storedPt.resolved : isExcelGreen,
        note: storedPt.note || (matchedObs && matchedObs.pointsState && matchedObs.pointsState[pIdx] ? matchedObs.pointsState[pIdx].note : '')
      }
    })

    // Pre-fill fields from local storage or matchedObs
    let finalEvidenceId = stored.evidenceId
    if (finalEvidenceId === undefined || finalEvidenceId === '') {
      finalEvidenceId = (matchedObs && matchedObs.evidenceId) ? String(matchedObs.evidenceId) : ''
    }

    let isPdfOk = stored.pdfOk
    if (isPdfOk === undefined) {
      if (matchedObs && matchedObs.pdfOk !== undefined) {
        isPdfOk = !!matchedObs.pdfOk
      } else {
        isPdfOk = isExcelGreen
      }
    }

    // Set notes
    let defaultNotes = stored.notes
    if (defaultNotes === undefined || defaultNotes === '') {
      if (matchedObs && matchedObs.notes) {
        defaultNotes = matchedObs.notes
      } else if (excelObsPoints.length > 0) {
        const allPointsResolved = Object.values(pointsState).every(pt => pt.resolved)
        if (allPointsResolved) {
          defaultNotes = 'Resuelto'
          isPdfOk = true
        } else {
          defaultNotes = ''
        }
      } else if (isExcelGreen) {
        defaultNotes = 'Resuelto'
      } else {
        defaultNotes = ''
      }
    }

    return {
      template_id: t.template_id,
      template_nombre: t.template_nombre,
      template_codigo: t.template_codigo,
      template_descripcion: t.template_descripcion,
      familia_id: t.familia_id,
      familia_nombre: t.familia_nombre,
      familia_codigo: t.familia_codigo,
      
      isCustom: isCustom,
      renderModeLabel: customLabel || (key.startsWith('WEB-') ? 'Aplicación Web Nativa' : 'Dinámico (Pure DB)'),
      excelObs: matchedObs,
      excelObsPoints: excelObsPoints,
      isExcelGreen: isExcelGreen,
      
      // Tracer states
      evidenceId: finalEvidenceId,
      pdfOk: isPdfOk,
      notes: defaultNotes,
      pointsState: pointsState
    }
  })

  // Expand all panels by default at load (except Family 37 and Informes panels)
  expandAll(true)
}

// Expand/Collapse all helpers
function expandAll(expand) {
  if (expand) {
    // 1. Expand Inspections except Family 37
    const familyIds = new Set(
      dbTemplates.value
        .filter(t => !informesTemplateIds.includes(t.template_id))
        .map(t => t.familia_id)
        .filter(id => id !== 37)
    )
    expandedPanels.value = Array.from(familyIds)

    // 2. Expand Informes
    expandedInformesPanels.value = ['sst', 'auditoria']
  } else {
    expandedPanels.value = []
    expandedInformesPanels.value = []
  }
}

// Group templates by family for rendering (EXCLUDING Informes)
const groupedTemplates = computed(() => {
  const groups = {}
  
  dbTemplates.value.forEach(t => {
    // Exclude templates mapped to "Informes"
    if (informesTemplateIds.includes(t.template_id)) return

    // Apply filters
    const matchesSearch = !searchQuery.value ||
      t.template_nombre.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      t.template_codigo.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (t.excelObs && t.excelObs.comentarios.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
      t.notes.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesObsFilter = !filterOnlyObs.value || !!t.excelObs

    if (matchesSearch && matchesObsFilter) {
      if (!groups[t.familia_id]) {
        groups[t.familia_id] = {
          id: t.familia_id,
          name: `${t.familia_id} - ${t.familia_nombre} (${t.familia_codigo})`,
          templates: [],
          hasObs: false
        }
      }
      groups[t.familia_id].templates.push(t)
      if (t.excelObs) {
        groups[t.familia_id].hasObs = true
      }
    }
  })

  // Setup resolution states
  Object.values(groups).forEach(g => {
    g.templates.forEach(t => {
      if (t.excelObs && g.id !== 37 && t.excelObsPoints.length > 0) {
        t.isFullyResolved = Object.values(t.pointsState).every(pt => pt.resolved)
        if (t.isFullyResolved) {
          t.pdfOk = true
          t.notes = 'Resuelto'
        }
      } else {
        t.isFullyResolved = t.pdfOk
        if (t.pdfOk) {
          t.notes = 'Resuelto'
        }
      }
    })
  })

  return Object.values(groups).sort((a, b) => a.id - b.id)
})

// Group templates for "Informes" Section (SST & Auditoría)
const informesGroups = computed(() => {
  const sstTemplates = dbTemplates.value.filter(t => sstTemplateIds.includes(t.template_id))
  const auditoriaTemplates = dbTemplates.value.filter(t => auditoriaTemplateIds.includes(t.template_id))

  const setupTemplateState = (t) => {
    if (t.excelObs && t.excelObsPoints.length > 0) {
      t.isFullyResolved = Object.values(t.pointsState).every(pt => pt.resolved)
      if (t.isFullyResolved) {
        t.pdfOk = true
        t.notes = 'Resuelto'
      }
    } else {
      t.isFullyResolved = t.pdfOk
      if (t.pdfOk) {
        t.notes = 'Resuelto'
      }
    }
  }

  sstTemplates.forEach(setupTemplateState)
  auditoriaTemplates.forEach(setupTemplateState)

  return [
    {
      id: 'sst',
      name: 'SST (Seguridad y Salud en el Trabajo)',
      templates: sstTemplates.filter(t => {
        const matchesSearch = !searchQuery.value ||
          t.template_nombre.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          t.template_codigo.toLowerCase().includes(searchQuery.value.toLowerCase())
        const matchesObsFilter = !filterOnlyObs.value || !!t.excelObs
        return matchesSearch && matchesObsFilter;
      })
    },
    {
      id: 'auditoria',
      name: 'Auditoría de Seguridad',
      templates: auditoriaTemplates.filter(t => {
        const matchesSearch = !searchQuery.value ||
          t.template_nombre.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          t.template_codigo.toLowerCase().includes(searchQuery.value.toLowerCase())
        const matchesObsFilter = !filterOnlyObs.value || !!t.excelObs
        return matchesSearch && matchesObsFilter;
      })
    }
  ]
})
// Metrics
const totalCount = computed(() => dbTemplates.value.length)
const evidenceCount = computed(() => dbTemplates.value.filter(t => t.evidenceId.trim() !== '').length)
const pdfOkCount = computed(() => dbTemplates.value.filter(t => t.pdfOk).length)
const obsExcelCount = computed(() => dbTemplates.value.filter(t => !!t.excelObs && t.familia_id !== 37).length)

// State Update
async function updateState(id, key, value) {
  const idx = dbTemplates.value.findIndex(t => t.template_id === id)
  if (idx !== -1) {
    dbTemplates.value[idx][key] = value
    
    // Automatically set notes to 'Resuelto' if pdfOk is checked
    if (key === 'pdfOk') {
      if (value) {
        dbTemplates.value[idx].notes = 'Resuelto'
      } else if (dbTemplates.value[idx].notes === 'Resuelto') {
        dbTemplates.value[idx].notes = ''
      }
    }
    
    await saveStateData()
  }
}

// Point specific updates
async function togglePointState(templateId, pointIdx) {
  const idx = dbTemplates.value.findIndex(t => t.template_id === templateId)
  if (idx !== -1) {
    const t = dbTemplates.value[idx]
    if (t.pointsState[pointIdx]) {
      t.pointsState[pointIdx].resolved = !t.pointsState[pointIdx].resolved
      
      const allResolved = Object.values(t.pointsState).every(pt => pt.resolved)
      if (allResolved) {
        t.pdfOk = true
        t.notes = 'Resuelto'
      } else {
        t.pdfOk = false
        if (t.notes === 'Resuelto') {
          t.notes = ''
        }
      }
      
      await saveStateData()
    }
  }
}

async function updatePointNote(templateId, pointIdx, noteValue) {
  const idx = dbTemplates.value.findIndex(t => t.template_id === templateId)
  if (idx !== -1) {
    const t = dbTemplates.value[idx]
    if (t.pointsState[pointIdx]) {
      t.pointsState[pointIdx].note = noteValue
      await saveStateData()
    }
  }
}

async function saveStateData() {
  const saveState = {}
  const rawArray = dbTemplates.value.map(t => ({
    template_id: t.template_id,
    template_nombre: t.template_nombre,
    template_codigo: t.template_codigo,
    familia_id: t.familia_id,
    familia_nombre: t.familia_nombre,
    evidenceId: t.evidenceId,
    pdfOk: t.pdfOk,
    notes: t.notes,
    pointsState: t.pointsState
  }))

  if (isServerConnected.value) {
    try {
      const res = await apiAxios.post('/observaciones', rawArray)
      if (res.status === 200 || res.status === 201) {
        autoSaveSuccess.value = true
        setTimeout(() => { autoSaveSuccess.value = false }, 1000)
        return
      }
    } catch (err) {
      console.error('Error saving to server:', err.message || err)
      isServerConnected.value = false
    }
  }

  dbTemplates.value.forEach(t => {
    saveState[String(t.template_id)] = {
      evidenceId: t.evidenceId,
      pdfOk: t.pdfOk,
      notes: t.notes,
      pointsState: t.pointsState
    }
  })
  localStorage.setItem('terracon_survey_trazabilidad', JSON.stringify(saveState))
  
  autoSaveSuccess.value = true
  setTimeout(() => { autoSaveSuccess.value = false }, 1000)
}

// Redirection
function openSurveyLink(id) {
  if (!id) return
  const href = router.resolve({
    name: 'verSurveyPrint',
    query: { idInspeccion: id }
  }).href
  window.open(href, '_blank')
}

// Excel formatter helper
function formatComment(comment) {
  if (!comment) return ''
  return comment.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>')
}

// Export trace log
function exportState() {
  const exportData = dbTemplates.value.map(t => ({
    template_id: t.template_id,
    template_nombre: t.template_nombre,
    template_codigo: t.template_codigo,
    familia_id: t.familia_id,
    familia_nombre: t.familia_nombre,
    evidenceId: t.evidenceId,
    pdfOk: t.pdfOk,
    notes: t.notes,
    pointsState: t.pointsState
  }))
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = 'terracon_trazabilidad_QA.json'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Import tracer log
function triggerImport() {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

function importState(event) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result)
      if (Array.isArray(parsed)) {
        importFileContent.value = parsed
        importDialog.value = true
      } else {
        alert('Archivo inválido. Debe ser una lista JSON.')
      }
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }
  reader.readAsText(file)
  event.target.value = ''
}

async function confirmImport() {
  if (importFileContent.value) {
    const importObj = {}
    importFileContent.value.forEach(item => {
      const id = item.template_id || item.id
      if (id) {
        importObj[String(id)] = {
          evidenceId: item.evidenceId || '',
          pdfOk: item.pdfOk || false,
          notes: item.notes || '',
          pointsState: item.pointsState || {}
        }
      }
    })
    
    if (isServerConnected.value) {
      try {
        await fetch(apiUrl.value, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(importFileContent.value)
        })
      } catch (err) {
        console.error('Error saving imported data to server:', err.message)
      }
    } else {
      localStorage.setItem('terracon_survey_trazabilidad', JSON.stringify(importObj))
    }

    await loadData()
    importDialog.value = false
    importFileContent.value = null
  }
}

function cancelImport() {
  importDialog.value = false
  importFileContent.value = null
}
</script>

<style scoped>
.custom-bg {
  background-color: #fcfdfe;
  min-height: 100vh;
  font-size: 12px;
}

.compact-header {
  border-bottom: 2px solid #e0e0e0;
}

.text-mono {
  font-family: monospace;
  font-size: 11px;
}

.text-xs {
  font-size: 10px;
}

.text-9 {
  font-size: 9px !important;
}

.height-14 {
  height: 14px !important;
}

.height-18 {
  height: 18px !important;
}

/* Section styling */
.bg-section-inspecciones {
  background-color: #fbfcfe !important;
}

.bg-section-informes {
  background-color: #fdfbfc !important;
}

/* Custom super compact table styling */
.dense-table {
  font-size: 11px !important;
}

.dense-table th {
  font-size: 11px !important;
  color: #555555 !important;
  background-color: #f1f3f5 !important;
  height: 28px !important;
  padding: 0 6px !important;
}

.dense-table td {
  height: auto !important;
  padding: 3px 6px !important;
  border-bottom: 1px solid #eef0f2 !important;
}

.dense-table tr:hover {
  background-color: #f8fafc !important;
}

.row-has-obs {
  background-color: #fff8f8; /* subtle reddish tint for rows with active pending observations */
}

.row-excel-green {
  background-color: #f4faf6 !important; /* light green for resolved in Excel */
}

.row-pdf-ok {
  background-color: #ebf7ee !important; /* green tint for validated rows */
}

/* Compact input styling */
.compact-input :deep(.v-field__input) {
  min-height: 24px !important;
  padding-top: 1px !important;
  padding-bottom: 1px !important;
  font-size: 11px !important;
}

.compact-input :deep(.v-field) {
  --v-input-control-height: 24px !important;
  border-radius: 4px !important;
}

.compact-point-input :deep(.v-field__input) {
  min-height: 20px !important;
  padding-top: 1px !important;
  padding-bottom: 1px !important;
  font-size: 10px !important;
}

.compact-point-input :deep(.v-field) {
  --v-input-control-height: 20px !important;
  border-radius: 4px !important;
}

.compact-textarea :deep(.v-field__input) {
  min-height: 24px !important;
  padding-top: 2px !important;
  padding-bottom: 2px !important;
  font-size: 11px !important;
  line-height: 1.2 !important;
}

.compact-textarea :deep(.v-field) {
  border-radius: 4px !important;
}

.border-bottom-dashed {
  border-bottom: 1px dashed rgba(0, 0, 0, 0.08);
}

.cell-obs {
  max-width: 280px;
}

.obs-text {
  font-size: 11px;
  line-height: 1.25;
  color: #c62828; /* clear red color for pending observations */
}

.text-success-dark {
  color: #2e7d32 !important;
}

.mt-0-5 {
  margin-top: 2px;
}

.cursor-pointer {
  cursor: pointer;
}

/* Specific styling to compress the Auxiliar family panel visual weight */
.panel-auxiliar :deep(.v-expansion-panel-title) {
  background-color: #fafafa !important;
  color: #757575 !important;
}
</style>
