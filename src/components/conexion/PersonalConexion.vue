<template>
  <div class="personal-conexion-root pa-0 d-flex flex-column ga-4">
    <!-- Indicadores -->
    <div class="personal-conexion-indicadores">
      <PersonalConexionIndicadores />
    </div>

    <!-- Header / Actions Card -->
    <v-card
      class="surface-card personal-conexion-header-card pa-4"
      variant="outlined"
      style="border-color: #e2e8f0; border-radius: 12px; background-color: white;"
    >
      <div class="personal-conexion-header d-flex align-center justify-space-between flex-wrap ga-4">
        <!-- Title -->
        <div class="d-flex align-center">
          <div class="icon-box mr-3">
            <v-icon
              color="primary"
              icon="mdi-account-group"
            />
          </div>
          <div>
            <div class="text-subtitle-1 font-weight-bold text-primary-dark">
              Personal Conexión
            </div>
            <div class="text-caption text-medium-emphasis">
              Gestión de trabajadores externos
            </div>
          </div>
        </div>

        <div class="personal-conexion-actions d-flex align-center ga-3 flex-wrap">
          <v-btn
            color="primary"
            variant="flat"
            rounded="lg"
            prepend-icon="mdi-account-plus-outline"
            class="text-none"
            @click="abrirDialogoCrearNoEnrolado"
          >
            Crear no enrolado
          </v-btn>

          <!-- Search -->
          <div class="personal-conexion-search">
            <v-text-field
              v-model="q"
              density="compact"
              variant="outlined"
              hide-details
              placeholder="Buscar personal..."
              prepend-inner-icon="mdi-magnify"
              bg-color="grey-lighten-5"
              class="sakai-input"
              clearable
            />
          </div>
        </div>
      </div>
    </v-card>

    <!-- Table Card -->
    <v-card
      class="surface-card personal-conexion-table-card flex-grow-1 d-flex flex-column"
      variant="outlined"
      style="border-color: #e2e8f0; border-radius: 12px; background-color: white; overflow: hidden;"
    >
      <v-card-text class="personal-conexion-table-body pa-0 flex-grow-1 overflow-hidden">
        <v-table
          class="tabla-sakai text-body-2"
          density="comfortable"
          fixed-header
          hover
          height="100%"
        >
          <thead>
            <tr>
              <th class="text-left th-sticky-left">
                Nombre
                / Rut
              </th>
              <th class="text-left">
                Contr / Sub
              </th>
              <th class="text-left">
                Cargo
              </th>
              <th class="text-left">
                Enrol.
              </th>
              <th class="text-center">
                Cred
              </th>
              <th class="text-left">
                Contrato
              </th>
              <th class="text-left">
                Tipo Contrato
              </th>
              <th class="text-left">
                Examen Altura
              </th>
              <th class="text-left">
                Clase 3
              </th>
              <th class="text-left">
                Licencia Cond.
              </th>
              <th class="text-left">
                Cédula
              </th>
              <th class="text-left">
                Soldadura
              </th>
              <th class="text-left">
                Contacto
              </th>
              <th class="text-left">
                Otros Datos
              </th>
              <th class="text-center">
                Foto
              </th>
              <th
                class="text-center"
                style="min-width: 80px;"
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="p in personalFiltrado"
              :key="p.id_user"
            >
              <!-- Nombre / Rut (Sticky) -->
              <td class="td-sticky-left">
                <div class="d-flex flex-column py-2">
                  <span class="font-weight-bold text-high-emphasis">{{ nombreCompleto(p) }}</span>
                  <span class="text-caption text-medium-emphasis">{{ p.rut }}</span>
                </div>
              </td>

              <!-- Contratista / Sub -->
              <td>
                <div class="d-flex flex-column py-2">
                  <span class="font-weight-medium text-body-2">{{ p.contratista || 'S/E' }}</span>
                  <span
                    v-if="p.subcontrato"
                    class="text-caption text-medium-emphasis"
                  >{{
                    p.subcontrato }}</span>
                </div>
              </td>

              <!-- Cargo -->
              <td>
                <v-chip
                  size="x-small"
                  variant="tonal"
                  color="slate"
                  class="font-weight-medium text-caption"
                >
                  {{ getJson(p).cargo || 'S/I' }}
                </v-chip>
              </td>

              <!-- Enrolamiento -->
              <td>
                <v-chip
                  size="x-small"
                  variant="tonal"
                  :color="getEnrolamientoColor(p)"
                  class="font-weight-bold text-caption"
                >
                  {{ getEnrolamientoLabel(p) }}
                </v-chip>
              </td>

              <!-- Credencial -->
              <td class="text-center">
                <div
                  v-if="getJson(p).credencial_filename"
                  class="d-flex justify-center"
                >
                  <v-avatar
                    size="24"
                    class="cursor-pointer"
                    style="border: 1px solid #e2e8f0;"
                    color="grey-lighten-4"
                    @click="verFotoGrande({ photo_filename: getJson(p).credencial_filename })"
                  >
                    <v-img
                      :src="getFileUrlByFilename(getJson(p).credencial_filename)"
                      cover
                    />
                  </v-avatar>
                </div>
                <v-avatar
                  v-else
                  size="24"
                  :color="getJson(p).credencial ? 'green-lighten-4' : 'red-lighten-4'"
                >
                  <v-icon
                    size="16"
                    :color="getJson(p).credencial ? 'green-darken-2' : 'red-darken-2'"
                  >
                    {{ getJson(p).credencial ? 'mdi-check' : 'mdi-close' }}
                  </v-icon>
                </v-avatar>
              </td>

              <!-- Fechas Contrato -->
              <td>
                <div
                  class="d-flex flex-column text-caption"
                  style="min-width: 90px;"
                >
                  <div class="text-medium-emphasis">
                    Ini: <span class="text-high-emphasis">{{
                      formatDateDMY(getJson(p).fechaContrato) || '-' }}</span>
                  </div>
                  <div
                    v-if="getJson(p).fechaDesvinculacion"
                    class="text-red"
                  >
                    Fin: {{
                      formatDateDMY(getJson(p).fechaDesvinculacion) }}
                  </div>
                </div>
              </td>

              <!-- Tipo Contrato -->
              <td>
                <span class="text-body-2">{{ getJson(p).tipoContrato || '—' }}</span>
              </td>

              <!-- Examen Altura -->
              <td>
                <div class="d-flex flex-column align-start">
                  <div class="d-flex align-center ga-1">
                    <v-chip
                      size="x-small"
                      variant="flat"
                      :color="getStatusColor(getExamen(p, 'examenAltura').estado)"
                      class="font-weight-bold mb-1 align-self-start text-white"
                    >
                      {{ getExamen(p, 'examenAltura').estado || 'NA' }}
                    </v-chip>
                    <v-btn
                      v-if="getExamen(p, 'examenAltura').filename"
                      icon="mdi-file-document-outline"
                      size="x-small"
                      density="compact"
                      variant="text"
                      color="primary"
                      :href="getFileUrlByFilename(getExamen(p, 'examenAltura').filename)"
                      target="_blank"
                      title="Ver Documento"
                      @click.stop
                    />
                  </div>
                  <div
                    v-if="getExamen(p, 'examenAltura').fechaVence"
                    class="text-caption text-medium-emphasis"
                  >
                    {{ formatDateDMY(getExamen(p, 'examenAltura').fechaVence) }}
                  </div>
                </div>
              </td>

              <!-- Clase 3 -->
              <td>
                <div class="d-flex flex-column align-start">
                  <div class="d-flex align-center ga-1">
                    <v-chip
                      size="x-small"
                      variant="flat"
                      :color="getStatusColor(getExamen(p, 'clase3').estado)"
                      class="font-weight-bold mb-1 align-self-start text-white"
                    >
                      {{ getExamen(p, 'clase3').estado || 'NA' }}
                    </v-chip>
                    <v-btn
                      v-if="getExamen(p, 'clase3').filename"
                      icon="mdi-file-document-outline"
                      size="x-small"
                      density="compact"
                      variant="text"
                      color="primary"
                      :href="getFileUrlByFilename(getExamen(p, 'clase3').filename)"
                      target="_blank"
                      title="Ver Documento"
                      @click.stop
                    />
                  </div>
                  <div
                    v-if="getExamen(p, 'clase3').fechaVence"
                    class="text-caption text-medium-emphasis"
                  >
                    {{ formatDateDMY(getExamen(p, 'clase3').fechaVence) }}
                  </div>
                </div>
              </td>

              <!-- Soldadura -->
              <td>
                <div class="d-flex flex-column align-start">
                  <div class="d-flex align-center ga-1">
                    <v-chip
                      size="x-small"
                      variant="flat"
                      :color="getStatusColor(getExamen(p, 'soldadura').estado)"
                      class="font-weight-bold mb-1 align-self-start text-white"
                    >
                      {{ getExamen(p, 'soldadura').estado || 'NA' }}
                    </v-chip>
                    <v-btn
                      v-if="getExamen(p, 'soldadura').filename"
                      icon="mdi-file-document-outline"
                      size="x-small"
                      density="compact"
                      variant="text"
                      color="primary"
                      :href="getFileUrlByFilename(getExamen(p, 'soldadura').filename)"
                      target="_blank"
                      title="Ver Documento"
                      @click.stop
                    />
                  </div>
                  <div
                    v-if="getExamen(p, 'soldadura').fechaVence"
                    class="text-caption text-medium-emphasis"
                  >
                    {{ formatDateDMY(getExamen(p, 'soldadura').fechaVence) }}
                  </div>
                </div>
              </td>

              <!-- Licencia Conducir -->
              <td>
                <div class="d-flex flex-column align-start">
                  <div class="d-flex align-center ga-1">
                    <v-chip
                      size="x-small"
                      variant="flat"
                      :color="getStatusColor(getExamen(p, 'licenciaConducir').estado)"
                      class="font-weight-bold mb-1 align-self-start text-white"
                    >
                      {{ getExamen(p, 'licenciaConducir').estado || 'NA' }}
                    </v-chip>
                    <v-btn
                      v-if="getExamen(p, 'licenciaConducir').filename"
                      icon="mdi-file-document-outline"
                      size="x-small"
                      density="compact"
                      variant="text"
                      color="primary"
                      :href="getFileUrlByFilename(getExamen(p, 'licenciaConducir').filename)"
                      target="_blank"
                      title="Ver Documento"
                      @click.stop
                    />
                  </div>
                  <div
                    v-if="getExamen(p, 'licenciaConducir').fechaVence"
                    class="text-caption text-medium-emphasis"
                  >
                    {{ formatDateDMY(getExamen(p, 'licenciaConducir').fechaVence) }}
                  </div>
                </div>
              </td>

              <!-- Cédula Identidad -->
              <td>
                <div class="d-flex flex-column align-start">
                  <div class="d-flex align-center ga-1">
                    <v-chip
                      size="x-small"
                      variant="flat"
                      :color="getStatusColor(getExamen(p, 'cedulaIdentidad').estado)"
                      class="font-weight-bold mb-1 align-self-start text-white"
                    >
                      {{ getExamen(p, 'cedulaIdentidad').estado || 'NA' }}
                    </v-chip>
                    <v-btn
                      v-if="getExamen(p, 'cedulaIdentidad').filename"
                      icon="mdi-file-document-outline"
                      size="x-small"
                      density="compact"
                      variant="text"
                      color="primary"
                      :href="getFileUrlByFilename(getExamen(p, 'cedulaIdentidad').filename)"
                      target="_blank"
                      title="Ver Documento"
                      @click.stop
                    />
                  </div>
                  <div
                    v-if="getExamen(p, 'cedulaIdentidad').fechaVence"
                    class="text-caption text-medium-emphasis"
                  >
                    {{ formatDateDMY(getExamen(p, 'cedulaIdentidad').fechaVence) }}
                  </div>
                </div>
              </td>

              <!-- Contacto -->
              <td>
                <div
                  class="d-flex flex-column text-caption ga-1"
                  style="min-width: 140px;"
                >
                  <div
                    v-if="p.email"
                    class="d-flex align-center ga-2 text-medium-emphasis"
                  >
                    <v-icon size="14">
                      mdi-email-outline
                    </v-icon>
                    <span
                      class="text-truncate text-high-emphasis"
                      style="max-width: 120px;"
                      :title="p.email"
                    >{{ p.email }}</span>
                  </div>
                  <div
                    v-if="p.movil"
                    class="d-flex align-center ga-2 text-medium-emphasis"
                  >
                    <v-icon size="14">
                      mdi-phone-outline
                    </v-icon>
                    <span class="text-high-emphasis">{{ p.movil }}</span>
                  </div>
                  <div
                    v-if="getJson(p).telefonoEmergencia"
                    class="d-flex align-center ga-2 text-error"
                  >
                    <v-icon size="14">
                      mdi-alert-circle-outline
                    </v-icon>
                    <span class="text-caption font-weight-bold">{{ getJson(p).telefonoEmergencia
                    }}</span>
                  </div>
                </div>
              </td>

              <!-- Otros Datos -->
              <td>
                <div
                  class="d-flex flex-column text-caption text-medium-emphasis"
                  style="min-width: 110px;"
                >
                  <div v-if="getJson(p).fechaNacimiento">
                    Nac: {{ formatDateDMY(getJson(p).fechaNacimiento) }}
                  </div>
                  <div v-if="getJson(p).patente">
                    Pat: <span
                      class="font-weight-bold text-high-emphasis"
                    >{{
                      getJson(p).patente }}</span>
                  </div>
                  <div v-if="getJson(p).comuna">
                    Com: {{ getJson(p).comuna }}
                  </div>
                </div>
              </td>

              <!-- Foto -->
              <td class="text-center">
                <v-avatar
                  v-if="p.photo_filename"
                  size="36"
                  class="cursor-pointer"
                  color="grey-lighten-4"
                  style="border: 1px solid #e2e8f0;"
                  @click.stop="verFotoGrande(p)"
                >
                  <v-img
                    :src="thumbUrl(p)"
                    cover
                  />
                </v-avatar>
                <v-avatar
                  v-else
                  size="32"
                  color="grey-lighten-4"
                  class="ba-1"
                  style="border: 1px solid #e2e8f0;"
                >
                  <v-icon
                    color="grey"
                    size="18"
                  >
                    mdi-account
                  </v-icon>
                </v-avatar>
              </td>

              <!-- Actions -->
              <td class="text-center">
                <v-btn
                  icon
                  size="small"
                  variant="text"
                  color="medium-emphasis"
                  @click="abrirDialogoEditar(p)"
                >
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </td>
            </tr>
            <tr v-if="!personalFiltrado.length && !loading">
              <td
                colspan="16"
                class="text-center text-medium-emphasis py-8"
              >
                <div class="d-flex flex-column align-center">
                  <v-icon
                    size="40"
                    color="grey-lighten-2"
                    class="mb-2"
                  >
                    mdi-account-search-outline
                  </v-icon>
                  <div>No se encontraron trabajadores</div>
                </div>
              </td>
            </tr>
            <tr v-if="loading">
              <td
                colspan="16"
                class="text-center py-8"
              >
                <v-progress-circular
                  indeterminate
                  color="primary"
                />
                <div class="mt-2 text-caption">
                  Cargando personal...
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>

    <!-- Dialog Edit -->
    <v-dialog
      v-model="dialogCrear"
      max-width="900"
      scrollable
    >
      <v-card class="rounded-xl">
        <v-card-title class="pa-4 bg-grey-lighten-5 d-flex justify-space-between align-center">
          <span class="font-weight-bold text-h6">{{ dialogTitle }}</span>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            @click="dialogCrear = false"
          />
        </v-card-title>

        <v-divider />

        <v-card-text
          class="pa-4"
          style="max-height: 70vh;"
        >
          <v-alert
            v-if="saveError"
            type="error"
            variant="tonal"
            density="compact"
            class="mb-4"
          >
            {{ saveError }}
          </v-alert>

          <v-form ref="formRef">
            <!-- SECTION 1: Personal Data (Read-only mostly) -->
            <div class="text-subtitle-2 font-weight-bold text-primary mb-3">
              Datos Básicos
            </div>
            <v-row dense>
              <v-col
                cols="12"
                md="4"
              >
                <label
                  class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary"
                >RUT</label>
                <v-text-field
                  v-model="form.rut"
                  :readonly="!isCreatingNoEnrolado"
                  variant="outlined"
                  density="compact"
                  :bg-color="isCreatingNoEnrolado ? 'grey-lighten-5' : 'grey-lighten-3'"
                  class="sakai-input"
                />
              </v-col>
              <v-col
                cols="12"
                md="4"
              >
                <label
                  class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary"
                >Nombres</label>
                <v-text-field
                  v-model="form.nombres"
                  variant="outlined"
                  density="compact"
                  bg-color="grey-lighten-5"
                  class="sakai-input"
                />
              </v-col>
              <v-col
                cols="12"
                md="4"
              >
                <label
                  class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary"
                >Correo</label>
                <v-text-field
                  v-model="form.correo"
                  placeholder="correo@empresa.cl"
                  density="compact"
                  variant="outlined"
                  bg-color="grey-lighten-5"
                  class="sakai-input"
                />
              </v-col>
              <v-col
                cols="12"
                md="4"
              >
                <label
                  class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary"
                >Apellidos</label>
                <v-text-field
                  v-model="form.apellidos"
                  variant="outlined"
                  density="compact"
                  bg-color="grey-lighten-5"
                  class="sakai-input"
                />
              </v-col>
              <v-col
                cols="12"
                md="4"
                class="d-flex align-center"
              >
                <v-switch
                  v-model="form.no_enrolado"
                  color="warning"
                  label="No requiere enrolamiento"
                  hide-details
                  class="ml-2"
                />
              </v-col>
              <v-col
                cols="12"
                md="4"
              >
                <label class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary">Fecha
                  Nacimiento</label>
                <v-text-field
                  v-model="form.fechaNacimiento"
                  type="date"
                  variant="outlined"
                  density="compact"
                  bg-color="grey-lighten-5"
                  class="sakai-input"
                />
              </v-col>
              <v-col
                cols="12"
                md="4"
              >
                <label
                  class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary"
                >Teléfono</label>
                <v-text-field
                  v-model="form.telefono"
                  placeholder="+569..."
                  density="compact"
                  variant="outlined"
                  bg-color="grey-lighten-5"
                  class="sakai-input"
                />
              </v-col>
              <v-col
                cols="12"
                md="4"
                class="d-flex align-center"
              >
                <v-switch
                  v-model="form.credencial"
                  color="primary"
                  label="Posee Credencial"
                  hide-details
                  class="ml-2"
                />
                <!-- Credential Upload Button -->
                <v-btn
                  v-if="form.credencial"
                  icon="mdi-camera"
                  variant="text"
                  size="small"
                  color="primary"
                  title="Subir Foto Credencial"
                  class="ml-2"
                  @click="triggerCredencialUpload"
                />
                <div
                  v-if="form.credencial_filename"
                  class="text-caption text-success ml-2"
                >
                  <v-icon
                    size="small"
                    color="success"
                  >
                    mdi-check-circle
                  </v-icon>
                  Foto OK
                </div>
                <input
                  ref="credencialInput"
                  type="file"
                  class="d-none"
                  accept="image/*"
                  @change="onCredencialFileChange"
                >
              </v-col>
            </v-row>

            <v-divider class="my-4" />

            <!-- SECTION 2: Work Data -->
            <div class="text-subtitle-2 font-weight-bold text-primary mb-3">
              Información Laboral
            </div>
            <v-row dense>
              <v-col
                cols="12"
                md="6"
              >
                <label class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary">Empresa /
                  Contratista</label>
                <v-select
                  v-model="form.id_empresa"
                  :items="empresas"
                  item-title="name_empresa"
                  item-value="id_empresa"
                  density="compact"
                  variant="outlined"
                  bg-color="grey-lighten-5"
                  class="sakai-input"
                />
              </v-col>
              <v-col
                cols="12"
                md="6"
              >
                <label class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary">Proyecto /
                  Subcontrato</label>
                <v-select
                  v-model="form.id_proyecto"
                  :items="proyectos"
                  item-title="nombre_proyecto"
                  item-value="id_proyecto"
                  density="compact"
                  variant="outlined"
                  bg-color="grey-lighten-5"
                  class="sakai-input"
                />
              </v-col>
              <v-col
                cols="12"
                md="6"
              >
                <label
                  class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary"
                >Cargo</label>
                <v-select
                  v-model="form.cargo"
                  :items="cargosPersonal"
                  density="compact"
                  variant="outlined"
                  bg-color="grey-lighten-5"
                  class="sakai-input"
                />
              </v-col>
              <v-col
                cols="12"
                md="6"
              >
                <label class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary">Tipo
                  Contrato</label>
                <v-select
                  v-model="form.tipoContrato"
                  :items="['Indefinido', 'Plazo Fijo']"
                  density="compact"
                  variant="outlined"
                  bg-color="grey-lighten-5"
                  class="sakai-input"
                />
              </v-col>
              <v-col
                cols="12"
                md="6"
              >
                <label class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary">Inicio
                  Contrato</label>
                <v-text-field
                  v-model="form.fechaContrato"
                  type="date"
                  density="compact"
                  variant="outlined"
                  bg-color="grey-lighten-5"
                  class="sakai-input"
                />
              </v-col>
              <v-col
                cols="12"
                md="6"
              >
                <label class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary">Fin
                  Contrato</label>
                <v-text-field
                  v-model="form.fechaTerminoContrato"
                  type="date"
                  density="compact"
                  variant="outlined"
                  bg-color="grey-lighten-5"
                  class="sakai-input"
                />
              </v-col>
            </v-row>

            <v-divider class="my-4" />

            <!-- SECTION 3: Exams -->
            <div class="text-subtitle-2 font-weight-bold text-primary mb-3">
              Certificaciones y Exámenes
            </div>
            <v-row
              dense
              class="mb-2"
            >
              <v-col
                cols="3"
                class="text-caption font-weight-bold text-secondary"
              >
                Item
              </v-col>
              <v-col
                cols="3"
                class="text-caption font-weight-bold text-secondary"
              >
                Estado
              </v-col>
              <v-col
                cols="3"
                class="text-caption font-weight-bold text-secondary"
              >
                Vencimiento
              </v-col>
              <v-col
                cols="3"
                class="text-caption font-weight-bold text-secondary"
              >
                Documento
              </v-col>
            </v-row>

            <v-row
              v-for="ex in examenesConfig"
              :key="ex.key"
              dense
              class="mb-2 align-center"
            >
              <v-col
                cols="3"
                class="d-flex align-center"
              >
                <span class="text-body-2">{{ ex.label
                }}</span>
              </v-col>
              <v-col cols="3">
                <v-select
                  v-model="form[ex.key].estado"
                  :items="['Aprobado', 'Rechazado', 'Pendiente', 'NA']"
                  density="compact"
                  variant="outlined"
                  bg-color="grey-lighten-5"
                  class="sakai-input"
                  hide-details
                >
                  <template #selection="{ item }">
                    <v-chip
                      size="small"
                      :color="getStatusColor(item.raw)"
                      variant="tonal"
                      class="font-weight-bold"
                    >
                      {{ item.raw }}
                    </v-chip>
                  </template>
                  <template #item="{ props, item }">
                    <v-list-item
                      v-bind="props"
                      title=""
                    >
                      <v-chip
                        size="small"
                        :color="getStatusColor(item.raw)"
                        variant="tonal"
                        class="font-weight-bold"
                      >
                        {{ item.raw }}
                      </v-chip>
                    </v-list-item>
                  </template>
                </v-select>
              </v-col>
              <v-col cols="3">
                <v-text-field
                  v-model="form[ex.key].fechaVence"
                  type="date"
                  density="compact"
                  variant="outlined"
                  bg-color="grey-lighten-5"
                  class="sakai-input"
                  hide-details
                />
              </v-col>
              <v-col
                cols="3"
                class="d-flex align-center justify-center"
              >
                <div
                  v-if="form[ex.key].id_doc"
                  class="d-flex align-center ga-2"
                >
                  <v-btn
                    icon="mdi-file-eye"
                    size="x-small"
                    color="primary"
                    variant="text"
                    :href="getFileUrlByFilename(form[ex.key].filename)"
                    target="_blank"
                    title="Ver Documento"
                  />
                  <v-btn
                    icon="mdi-close"
                    size="x-small"
                    color="error"
                    variant="text"
                    title="Eliminar"
                    @click="removeExamDoc(ex.key)"
                  />
                  <div
                    class="text-caption text-truncate"
                    style="max-width: 60px;"
                  >
                    {{
                      form[ex.key].filename }}
                  </div>
                </div>
                <v-btn
                  v-else
                  icon="mdi-paperclip"
                  size="small"
                  color="medium-emphasis"
                  variant="text"
                  title="Adjuntar Documento"
                  @click="triggerExamUpload(ex.key)"
                />
                <input
                  :ref="el => fileInputs[ex.key] = el"
                  type="file"
                  class="d-none"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  @change="(e) => onExamFileChange(e, ex.key)"
                >
              </v-col>
            </v-row>

            <v-divider class="my-4" />

            <!-- SECTION 4: Location & Photo -->
            <div class="text-subtitle-2 font-weight-bold text-primary mb-3">
              Ubicación, Fotos y Otros
            </div>
            <v-row dense>
              <v-col
                cols="12"
                md="6"
              >
                <label
                  class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary"
                >Dirección</label>
                <v-text-field
                  v-model="form.direccion"
                  density="compact"
                  variant="outlined"
                  bg-color="grey-lighten-5"
                  class="sakai-input"
                />
              </v-col>
              <v-col
                cols="12"
                md="6"
              >
                <label
                  class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary"
                >Comuna</label>
                <v-text-field
                  v-model="form.comuna"
                  density="compact"
                  variant="outlined"
                  bg-color="grey-lighten-5"
                  class="sakai-input"
                />
              </v-col>
              <v-col
                cols="6"
                md="3"
              >
                <label class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary">Fecha
                  C4</label>
                <v-text-field
                  v-model="form.fechaC4"
                  type="date"
                  density="compact"
                  variant="outlined"
                  bg-color="grey-lighten-5"
                  class="sakai-input"
                />
              </v-col>
              <v-col
                cols="6"
                md="3"
              >
                <label
                  class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary"
                >Patente</label>
                <v-text-field
                  v-model="form.patente"
                  density="compact"
                  variant="outlined"
                  bg-color="grey-lighten-5"
                  class="sakai-input"
                />
              </v-col>
              <v-col
                cols="12"
                md="6"
              >
                <label class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary">Teléfono
                  Emergencia</label>
                <v-text-field
                  v-model="form.telefonoEmergencia"
                  placeholder="+569..."
                  density="compact"
                  variant="outlined"
                  bg-color="grey-lighten-5"
                  class="sakai-input"
                />
              </v-col>

              <!-- Photo -->
              <v-col cols="12">
                <label class="text-caption font-weight-bold ml-1 mb-1 d-block text-secondary">Fotografía
                  Personal</label>
                <FotoCaptureConexion
                  v-model:galeria="galeriaFoto"
                  :max-fotos="1"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            color="medium-emphasis"
            variant="text"
            class="text-none"
            @click="dialogCrear = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            rounded="lg"
            :loading="saving"
            class="text-none px-6"
            @click="guardarPersonal"
          >
            {{ saveButtonText }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>


    <!-- Dialogo Ver Foto -->
    <v-dialog
      v-model="dialogFoto"
      max-width="800"
    >
      <v-card class="bg-black">
        <v-card-title class="d-flex justify-end pa-2">
          <v-btn
            icon="mdi-close"
            variant="text"
            color="white"
            @click="dialogFoto = false"
          />
        </v-card-title>
        <v-img
          :src="fotoUrl"
          contain
          max-height="80vh"
        />
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, defineComponent, h, reactive, onMounted, resolveComponent } from 'vue';
import PersonalConexionIndicadores from './PersonalConexionIndicadores.vue';
import FotoCaptureConexion from './FotoCaptureConexion.vue';
import api from '@/services/api';
import { useUserDetailStore } from "@/stores/userDetail";

const props = defineProps({
    fechaDesde: { type: String, default: '' },
    fechaHasta: { type: String, default: '' }
});

const userDetailStore = useUserDetailStore();
const q = ref('');
const dialogCrear = ref(false);
const isCreatingNoEnrolado = ref(false);
const loading = ref(false);
const saving = ref(false);
const saveError = ref('');
const personalList = ref([]);
const externalUsers = ref([]);
// Removed userSelected as we are not selecting new users
const empresas = ref([]);
const proyectos = ref([]);
const galeriaFoto = ref([]);

const examenesConfig = [
    { key: 'examenAltura', label: 'Examen Altura' },
    { key: 'clase3', label: 'Licencia Clase 3' },
    { key: 'soldadura', label: 'Calif. Soldadura' },
    { key: 'licenciaConducir', label: 'Licencia de Conducir' },
    { key: 'cedulaIdentidad', label: 'Cédula de Identidad' }
];

const cargosPersonal = [
    'Albañil',
    'Ayudante',
    'Capataz',
    'Chofer',
    'Excavador',
    'Excavadores',
    'Gasfiter',
    'Operador Maquinaria',
    'Soldador',
    'Supervisor',
    'Técnico Fusionador'
].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));

const form = reactive({
    id_user: null,
    rut: '',
    nombres: '',
    apellidos: '',
    fechaNacimiento: '',
    credencial: false,
    no_enrolado: false,
    id_empresa: null,
    id_proyecto: null,
    cargo: null,
    tipoContrato: null,
    fechaContrato: '',
    fechaTerminoContrato: '',
    fechaDesvinculacion: '',
    fechaDesvinculacion: '',
    examenAltura: { estado: 'NA', fechaVence: '', id_doc: null, filename: '' },
    clase3: { estado: 'NA', fechaVence: '', id_doc: null, filename: '' },
    soldadura: { estado: 'NA', fechaVence: '', id_doc: null, filename: '' },
    licenciaConducir: { estado: 'NA', fechaVence: '', id_doc: null, filename: '' },
    cedulaIdentidad: { estado: 'NA', fechaVence: '', id_doc: null, filename: '' },
    correo: '',
    telefono: '',
    telefonoEmergencia: '',
    id_doc_credencial: null,
    credencial_filename: '',
    direccion: '',
    comuna: '',
    fechaC4: '',
    patente: '',
    roles_ids: [],
    id_doc_photo: null
});

const dialogTitle = computed(() => isCreatingNoEnrolado.value ? 'Crear trabajador no enrolado' : 'Editar Trabajador');
const saveButtonText = computed(() => isCreatingNoEnrolado.value ? 'Crear no enrolado' : 'Guardar Cambios');

const fileInputs = ref({});

function getStatusColor(status) {
    const s = (status || '').toString().trim().toLowerCase();
    if (s === 'aprobado') return 'info'; // Blue
    if (s === 'rechazado') return 'error'; // Red
    if (s === 'pendiente') return 'warning'; // Orange
    if (s === 'completado') return 'success'; // Green
    if (s === 'na') return 'grey';
    return 'grey';
}

function triggerExamUpload(key) {
    const input = fileInputs.value[key];
    if (input) input.click();
}

async function onExamFileChange(event, key) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const formData = new FormData();
        formData.append('archivo', file);
        formData.append('tipo_doc', 'CERT_DOC');
        formData.append('mimetype', file.type);
        formData.append('name_doc_orig', file.name);
        formData.append('path_doc', '/u05/LeanDocs/terracon');
        formData.append('id_user', Number(userDetailStore.userDetail?.id_user) || 1);
        formData.append('estado', '1');

        saving.value = true; // Show generic loading of the form or add specific loading
        const res = await api.post('/archivo/imagen', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (res.data && res.data.archivo) {
            form[key].id_doc = res.data.archivo.id_doc;
            form[key].filename = res.data.archivo.name_doc_interno;
        }
    } catch (e) {
        console.error('Error uploading doc', e);
    } finally {
        saving.value = false;
        event.target.value = ''; // Reset input
    }
}

function removeExamDoc(key) {
    if (confirm('¿Eliminar documento adjunto?')) {
        form[key].id_doc = null;
        form[key].filename = '';
    }
}

function getFileUrlByFilename(filename) {
    if (!filename) return '#';
    const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
    return `${baseUrl}/archivo/terracon/${filename}`;
}

const credencialInput = ref(null);

function triggerCredencialUpload() {
    if (credencialInput.value) credencialInput.value.click();
}

async function onCredencialFileChange(event) {
    const file = event.target.files[0];
    if (!file) return;
    try {
        const formData = new FormData();
        formData.append('archivo', file);
        formData.append('tipo_doc', 'CREDENCIAL_FOTO');
        formData.append('mimetype', file.type);
        formData.append('name_doc_orig', file.name);
        formData.append('path_doc', '/u05/LeanDocs/terracon');
        formData.append('id_user', Number(userDetailStore.userDetail?.id_user) || 1);
        formData.append('estado', '1');

        saving.value = true;
        const res = await api.post('/archivo/imagen', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (res.data && res.data.archivo) {
            form.id_doc_credencial = res.data.archivo.id_doc;
            form.credencial_filename = res.data.archivo.name_doc_interno;
        }
    } catch (e) {
        console.error('Error uploading credential', e);
    } finally {
        saving.value = false;
        event.target.value = '';
    }
}

onMounted(() => {
    fetchPersonal();
    fetchInitialData();
});

async function fetchInitialData() {
    try {
        const [resEmp, resPry] = await Promise.all([
            api.get('/servicio/leanglobal/obtenerEmpresas'),
            api.get('/servicio/leanglobal/obtenerProyectos')
        ]);
        empresas.value = resEmp.data || [];
        proyectos.value = resPry.data || [];
    } catch (e) {
        console.error('Error fetching initial data', e);
    }
}

async function fetchPersonal() {
    loading.value = true;
    try {
        // Updated to use the new query which returns user data directly
        const res = await api.get('/servicio/leanglobal/obtenerPersonalExterno');
        console.log('fetchPersonal res:', res);
        if (Array.isArray(res.data)) {
            personalList.value = res.data;
        } else if (res.data && Array.isArray(res.data.data)) {
            personalList.value = res.data.data;
        } else {
            console.warn('fetchPersonal: res.data is not an array', res.data);
            personalList.value = [];
        }
    } catch (e) {
        console.error('Error fetching personal', e);
        personalList.value = [];
    } finally {
        loading.value = false;
    }
}

function nombreCompleto(p) {
    if (p.nombre) return p.nombre;
    return `${p.name_frst || ''} ${p.name_sec || ''} ${p.apellido_pat || ''} ${p.apellido_mat || ''}`.trim();
}

function getJson(p) {
    // If json_data exists in the user record, use it. Otherwise return empty object.
    const data = p.json_data || {};
    return typeof data === 'string' ? JSON.parse(data) : data;
}

function isNoEnrolado(p) {
    return getJson(p).no_enrolado === true;
}

function getEnrolamientoLabel(p) {
    if (isNoEnrolado(p)) return 'No enrolado';
    if (p.flag_proc_enrol === true || p.flag_proc_enrol === 1) return 'Pendiente';
    return 'Enrolado';
}

function getEnrolamientoColor(p) {
    if (isNoEnrolado(p)) return 'warning';
    if (p.flag_proc_enrol === true || p.flag_proc_enrol === 1) return 'info';
    return 'success';
}

function formatDateDMY(raw) {
    if (!raw) return '';
    const value = String(raw).trim();
    if (!value || value.toLowerCase() === 'sysdatehhmm') return '-';

    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) return `${match[3]}-${match[2]}-${match[1]}`;

    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
        const dd = String(parsed.getDate()).padStart(2, '0');
        const mm = String(parsed.getMonth() + 1).padStart(2, '0');
        const yyyy = parsed.getFullYear();
        return `${dd}-${mm}-${yyyy}`;
    }
    return value;
}

function getExamen(p, key) {
    const json = getJson(p);
    return json[key] || { estado: 'NA', fechaVence: '', id_doc: null, filename: '' };
}

function getInicioContrato(p) {
    const json = getJson(p);
    const raw = json?.inicio_contrato || json?.fechaContrato || '';
    return raw ? String(raw).slice(0, 10) : '';
}

function thumbUrl(p) {
    // We try to get image from json_data id_doc_photo if available
    const json = getJson(p);
    // If we have a filename in p, use it (from a join), otherwise currently we might not have it unless we fetch it.
    // The simplified query removed tfmg_file join basically.
    // We rely on json_data.id_doc_photo. To show it, we need the filename or a direct stream endpoint.
    // Terracon usually accesses by filename. If we don't have filename, we can't show it easily without another fetch.
    // Assuming for now we might not show the photo unless `p.photo_filename` is somehow populated or we fix the query later to join again.
    // But the user only asked to "recuerda las fotos" in the update.
    if (!p.photo_filename) return null;
    const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
    return `${baseUrl}/archivo/terracon/${p.photo_filename}`;
}

const dialogFoto = ref(false);
const fotoUrl = ref('');

function verFotoGrande(p) {
    if (!p.photo_filename) return;
    fotoUrl.value = thumbUrl(p);
    dialogFoto.value = true;
}

function emptyExam() {
    return { estado: 'NA', fechaVence: '', id_doc: null, filename: '' };
}

function resetForm() {
    Object.assign(form, {
        id_user: null,
        rut: '',
        nombres: '',
        apellidos: '',
        fechaNacimiento: '',
        credencial: false,
        no_enrolado: true,
        id_empresa: null,
        id_proyecto: null,
        cargo: null,
        tipoContrato: null,
        fechaContrato: '',
        fechaTerminoContrato: '',
        fechaDesvinculacion: '',
        examenAltura: emptyExam(),
        clase3: emptyExam(),
        soldadura: emptyExam(),
        licenciaConducir: emptyExam(),
        cedulaIdentidad: emptyExam(),
        correo: '',
        telefono: '',
        direccion: '',
        comuna: '',
        fechaC4: '',
        patente: '',
        roles_ids: [],
        id_doc_photo: null,
        telefonoEmergencia: '',
        id_doc_credencial: null,
        credencial_filename: ''
    });
    galeriaFoto.value = [];
}

function abrirDialogoCrearNoEnrolado() {
    resetForm();
    saveError.value = '';
    isCreatingNoEnrolado.value = true;
    dialogCrear.value = true;
}

function abrirDialogoEditar(p) {
    const json = getJson(p);
    saveError.value = '';
    isCreatingNoEnrolado.value = false;

    // Populate form with user data
    Object.assign(form, {
        id_user: p.id_user,
        rut: p.rut,
        nombres: `${p.name_frst || ''} ${p.name_sec || ''}`.trim(),
        apellidos: `${p.apellido_pat || ''} ${p.apellido_mat || ''}`.trim(),
        fechaNacimiento: json.fechaNacimiento || '',
        credencial: json.credencial || false,
        no_enrolado: json.no_enrolado === true,
        id_empresa: p.id_empresa,
        id_proyecto: json.id_proyecto || null,
        cargo: json.cargo || null,
        tipoContrato: json.tipoContrato || null,
        fechaContrato: json.fechaContrato || '',
        fechaTerminoContrato: json.fechaTerminoContrato || '',
        fechaDesvinculacion: json.fechaDesvinculacion || '',
        examenAltura: json.examenAltura || { estado: 'NA', fechaVence: '', id_doc: null, filename: '' },
        clase3: json.clase3 || { estado: 'NA', fechaVence: '', id_doc: null, filename: '' },
        soldadura: json.soldadura || { estado: 'NA', fechaVence: '', id_doc: null, filename: '' },
        licenciaConducir: json.licenciaConducir || { estado: 'NA', fechaVence: '', id_doc: null, filename: '' },
        cedulaIdentidad: json.cedulaIdentidad || { estado: 'NA', fechaVence: '', id_doc: null, filename: '' },
        correo: p.email,
        telefono: p.movil,
        direccion: json.direccion || '',
        comuna: json.comuna || '',
        fechaC4: json.fechaC4 || '',
        patente: json.patente || '',
        patente: json.patente || '',
        roles_ids: (typeof (p.roles_ids || p.roles) === 'string'
            ? tryParseRoles(p.roles_ids || p.roles)
            : (p.roles_ids || p.roles)) || [],
        id_doc_photo: json.id_doc_photo || null,
        telefonoEmergencia: json.telefonoEmergencia || '',
        id_doc_credencial: json.id_doc_credencial || null,
        credencial_filename: json.credencial_filename || ''
    });

    // Populate gallery if photo exists
    galeriaFoto.value = [];
    if (p.photo_filename && json.id_doc_photo) {
        galeriaFoto.value.push({
            id_doc: json.id_doc_photo,
            url: thumbUrl(p),
            nombre: p.photo_filename
        });
    }

    dialogCrear.value = true;
}

async function guardarPersonal() {
    saving.value = true;
    saveError.value = '';
    try {
        // Split names roughly
        const nombresParts = form.nombres.split(' ').filter(x => x);
        const name_frst = nombresParts[0] || '';
        const name_sec = nombresParts.slice(1).join(' ') || '';

        const apellidosParts = form.apellidos.split(' ').filter(x => x);
        const apellido_pat = apellidosParts[0] || '';
        const apellido_mat = apellidosParts.slice(1).join(' ') || '';

        if (!form.rut) {
            throw new Error('Debe ingresar RUT');
        }

        if (!form.correo) {
            throw new Error('Debe ingresar correo');
        }

        if (isCreatingNoEnrolado.value && !form.id_empresa) {
            throw new Error('Debe seleccionar empresa/contratista');
        }

        const payload = {
            email: form.correo,
            rut: form.rut,
            name_frst,
            name_sec,
            apellido_pat,
            apellido_mat,
            movil: form.telefono,
            activo: true, // Assuming active if editing
            id_empresa: form.id_empresa,
            id_user_creacion: Number(userDetailStore.userDetail?.id_user) || null,
            roles: (Array.isArray(form.roles_ids) ? form.roles_ids : [])
                .map(r => parseInt(r))
                .filter(n => !isNaN(n) && n > 0), // Sanitize to valid IDs
            json_data: {
                no_enrolado: form.no_enrolado === true,
                origen_registro: form.no_enrolado ? 'PERSONAL_CONEXION' : undefined,
                cargo: form.cargo,
                credencial: form.credencial,
                fechaNacimiento: form.fechaNacimiento,
                fechaContrato: form.fechaContrato,
                fechaTerminoContrato: form.fechaTerminoContrato,
                fechaDesvinculacion: form.fechaDesvinculacion,
                tipoContrato: form.tipoContrato,
                examenAltura: form.examenAltura,
                clase3: form.clase3,
                soldadura: form.soldadura,
                licenciaConducir: form.licenciaConducir,
                cedulaIdentidad: form.cedulaIdentidad,
                direccion: form.direccion,
                comuna: form.comuna,
                fechaC4: form.fechaC4,
                patente: form.patente,
                id_proyecto: form.id_proyecto, // Stored in json_data
                id_doc_photo: galeriaFoto.value[0]?.id_doc || form.id_doc_photo,
                telefonoEmergencia: form.telefonoEmergencia,
                id_doc_credencial: form.id_doc_credencial,
                credencial_filename: form.credencial_filename
            }
        };

        if (isCreatingNoEnrolado.value) {
            await api.post('/usuarios/crearNoEnrolado', payload);
        } else {
            if (!form.id_user) {
                throw new Error('Falta id_user para editar');
            }
            await api.post('/usuarios/updUsuario', {
                ...payload,
                id_user: form.id_user
            });
        }

        dialogCrear.value = false;
        isCreatingNoEnrolado.value = false;
        fetchPersonal();
    } catch (e) {
        console.error('Error saving personal record', e);
        saveError.value =
            e?.response?.data?.error ||
            e?.response?.data?.message ||
            e?.message ||
            'No se pudo guardar el registro.';
    } finally {
        saving.value = false;
    }
}

const personalFiltrado = computed(() => {
    const s = q.value?.toLowerCase() || '';
    return personalList.value.filter(p => {
        const coincideBusqueda =
            nombreCompleto(p).toLowerCase().includes(s) ||
            p.rut?.toLowerCase().includes(s) ||
            (p.contratista || '').toLowerCase().includes(s);

        if (!coincideBusqueda) return false;

        if (!props.fechaDesde && !props.fechaHasta) return true;

        const inicioContrato = getInicioContrato(p);
        //if (!inicioContrato) return false;
        //if (props.fechaDesde && inicioContrato < props.fechaDesde) return false;
        //if (props.fechaHasta && inicioContrato > props.fechaHasta) return false;
        return true;
    });
});

function tryParseRoles(str) {
    try {
        const parsed = JSON.parse(str);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}
</script>

<style scoped>
.personal-conexion-root {
    min-height: calc(100dvh - 230px);
    overflow: visible;
    min-width: 0;
}

.personal-conexion-indicadores,
.personal-conexion-header-card {
    flex: 0 0 auto;
}

.personal-conexion-header-card {
    overflow: visible;
}

.personal-conexion-header {
    row-gap: 12px;
}

.personal-conexion-actions {
    min-width: min(100%, 280px);
}

.personal-conexion-search {
    width: clamp(240px, 22vw, 320px);
    max-width: 100%;
}

.personal-conexion-table-card,
.personal-conexion-table-body {
    min-height: 0;
}

.personal-conexion-table-card {
    flex: 1 1 auto;
    min-height: 380px;
    height: clamp(380px, calc(100dvh - 455px), 720px);
}

.tabla-sakai {
    height: 100%;
    min-width: 1280px;
}

.tabla-sakai :deep(.v-table__wrapper) {
    height: 100%;
    overflow: auto;
    scrollbar-gutter: stable;
}

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

/* Sakai Table Styles */
.tabla-sakai :deep(thead th) {
    background: #f8fafc;
    color: #64748b;
    text-transform: uppercase;
    font-weight: 700;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
    height: 52px;
    border-bottom: 2px solid #e2e8f0;
}

.tabla-sakai :deep(tbody td) {
    height: 56px;
    border-bottom: 1px solid #f1f5f9;
}

.tabla-sakai :deep(tbody tr:hover) {
    background-color: #f8fafc !important;
}

/* Sticky Column Styling */
.tabla-sakai :deep(.th-sticky-left) {
    position: sticky !important;
    left: 0 !important;
    z-index: 10 !important;
    background: #f8fafc !important;
    border-right: 1px solid #e2e8f0;
    min-width: 180px;
    /* Ensure width */
}

.tabla-sakai :deep(.td-sticky-left) {
    position: sticky !important;
    left: 0 !important;
    z-index: 9 !important;
    background: #fff !important;
    border-right: 1px solid #f1f5f9;
    box-shadow: 2px 0 4px rgba(0, 0, 0, 0.02);
}

.sakai-input :deep(.v-field__outline) {
    --v-field-border-opacity: 0.15;
}

.sakai-input :deep(.v-field--focused .v-field__outline) {
    --v-field-border-opacity: 0.8;
}

.sakai-input :deep(.v-field) {
    border-radius: 8px;
}

@media (max-width: 960px) {
    .personal-conexion-root {
        min-height: auto;
    }

    .personal-conexion-header {
        align-items: stretch !important;
    }

    .personal-conexion-actions,
    .personal-conexion-search {
        width: 100%;
    }

    .personal-conexion-table-card {
        height: 65dvh;
        min-height: 360px;
    }
}
</style>
