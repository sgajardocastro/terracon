<!-- CrearInspeccionYActividades.vue -->
<template>
  <div :class="{ 'conexion-root': props.conexion }">
    <br>

    <div class="mt-2">
      <!-- ===================== -->
      <!-- CREAR INSPECCIÓN -->
      <!-- ===================== -->
      <div>
        <!-- ✅ si props.conexion = true => NO mostrar bloque de creación -->
        <v-row
          v-if="puedeCrear && !props.conexion"
          dense
        >
          <v-col cols="2">
            <v-select
              v-model="areaSeleccionada"
              label="Area"
              :items="areas"
              variant="outlined"
              density="compact"
              bg-color="white"
              item-title="name_area"
              item-value="id_area"
              :disabled="bloquearArea"
              :clearable="!bloquearArea"
            />
          </v-col>

          <v-col cols="2">
            <v-select
              v-model="tipoSeleccionado"
              label="Familia"
              :items="tiposSurvey"
              variant="outlined"
              density="compact"
              bg-color="white"
              item-title="name_tipo_srv"
              item-value="id_tipo_srv"
            />
          </v-col>

          <v-col cols="2">
            <v-select
              v-model="templateSeleccionado"
              label="Protocolo"
              :items="templatesOptions"
              variant="outlined"
              density="compact"
              bg-color="white"
              item-title="name_template_srv"
              item-value="id_template"
              clearable
            />
          </v-col>

          <v-col cols="2">
            <v-select
              v-model="clienteSeleccionado"
              label="Cliente"
              :items="clientes"
              item-title="name_empresa"
              item-value="id_empresa"
              variant="outlined"
              density="compact"
              bg-color="white"
              clearable
            />
          </v-col>

          <v-col cols="2">
            <v-select
              v-model="proyectoSeleccionado"
              label="Proyecto"
              :items="proyectos"
              item-title="nombre_proyecto"
              item-value="id_proyecto"
              variant="outlined"
              density="compact"
              bg-color="white"
              clearable
            />
          </v-col>

          <v-col cols="2" />

          <v-col cols="2">
            <v-text-field
              v-model="fechaPlanInicio"
              label="Fecha Inicio Plan"
              type="date"
              density="compact"
              variant="outlined"
              hide-details
              bg-color="white"
              style="max-width: auto"
            />
          </v-col>

          <v-col cols="2">
            <v-text-field
              v-model="fechaPlanFin"
              label="Fecha Fin Plan"
              type="date"
              density="compact"
              variant="outlined"
              hide-details
              bg-color="white"
              style="max-width: auto"
            />
          </v-col>

          <v-col cols="3">
            <v-btn
              color="primary"
              :disabled="!puedeCrear || props.conexion"
              @click="crearSurvey"
            >
              Crear Inspección / Registro
            </v-btn>
          </v-col>
        </v-row>

        <!-- ===================== -->
        <!-- TABLA: modo REGISTRO INFORMES -->
        <!-- ===================== -->
        <v-row
          v-if="props.registroInformes"
          dense
        >
          <v-col cols="12">
            <v-table
              dense
              class="card text-caption"
              :height="tableHeight"
              fixed-header
            >
              <thead>
                <tr>
                  <th class="text-left">
                    Id Registro
                  </th>
                  <th class="text-left">
                    Familia
                  </th>
                  <th class="text-left">
                    Nombre Registro
                  </th>
                  <th class="text-left">
                    Código
                  </th>
                  <th class="text-left">
                    Proyecto
                  </th>
                  <th class="text-left">
                    Empresa Cliente
                  </th>

                  <th class="text-left">
                    Usuario
                  </th>
                  <th class="text-left">
                    Estado
                  </th>

                  <th class="text-center">
                    Registro Subida
                  </th>
                  <th class="text-center">
                    Informe
                  </th>

                  <th class="text-left">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="item in surveysConDocs"
                  :key="item.id_survey"
                  style="cursor: default;"
                >
                  <td>{{ item.id_survey }}</td>
                  <td>{{ item.name_tipo_srv ?? '—' }}</td>
                  <td>{{ item.name_template_srv ?? '—' }}</td>
                  <td>{{ item.codi_template_srv ?? '—' }}</td>
                  <td>{{ item.nombre_proyecto ?? '—' }}</td>
                  <td>{{ item.name_empresa_cliente ?? '—' }}</td>

                  <!-- ✅ Usuario -->
                  <td v-if="editingId === item.id_survey">
                    <v-select
                      v-model="editCache.id_user"
                      :items="usuariosOrdenados"
                      item-title="nombre_user"
                      item-value="id_user"
                      density="compact"
                      variant="underlined"
                      hide-details
                      style="min-width: 150px"
                      @click.stop
                    />
                  </td>
                  <td v-else>
                    <template v-if="item.id_user">
                      {{ item.nombre_user }}
                    </template>
                    <template v-else>
                      <div class="d-flex align-center">
                        <v-icon
                          color="red"
                          size="18"
                          class="mr-1"
                          title="Sin usuario asignado"
                        >
                          mdi-account-off
                        </v-icon>
                        <span class="text-error">Sin asignar</span>
                      </div>
                    </template>
                  </td>

                  <!-- ✅ Estado -->
                  <td>
                    <div class="d-flex align-center">
                      <v-icon
                        v-if="item.estado_srv === 'Pre Creado' && !item.id_user"
                        color="red"
                        size="18"
                        class="mr-1"
                        title="Sin usuario asignado"
                      >
                        mdi-account-alert
                      </v-icon>

                      <v-icon
                        v-if="item.estado_srv === 'Pre Creado' && !item.id_flow"
                        color="red"
                        size="18"
                        class="mr-1"
                        title="Sin flujo asignado"
                      >
                        mdi-source-branch
                      </v-icon>

                      <span
                        :class="{
                          'text-error': item.estado_srv === 'Pre Creado' && (!item.id_user || !item.id_flow)
                        }"
                      >
                        {{ item.estado_srv ?? '—' }}
                      </span>
                    </div>
                  </td>

                  <!-- ✅ Registro Subida -->
                  <td style="text-align: center;">
                    <template v-if="item.id_doc">
                      <a
                        :href="`${ARCHIVO_BASE_URL}/archivo/terracon/${item.id_doc}`"
                        target="_blank"
                        rel="noopener"
                        title="Abrir PDF"
                        style="display:inline-flex;align-items:center;justify-content:center"
                        @click.stop
                      >
                        <v-icon size="26">mdi-file-pdf-box</v-icon>
                      </a>
                    </template>
                    <template v-else>
                      —
                    </template>
                  </td>

                  <!-- ✅ Informe -->
                  <td style="text-align: center;">
                    <template v-if="item.url_doc_registro">
                      <a
                        :href="item.url_doc_registro"
                        target="_blank"
                        rel="noopener"
                        title="Abrir archivo"
                        style="display:inline-flex;align-items:center;justify-content:center"
                        @click.stop
                      >
                        <v-icon
                          color="green"
                          size="26"
                        >mdi-file-excel-box</v-icon>
                      </a>
                    </template>
                    <template v-else>
                      —
                    </template>
                  </td>

                  <!-- ✅ Acciones -->
                  <td>
                    <!-- ✅ EN CONEXION: cualquiera puede editar -->
                    <div
                      v-if="puedeEditar"
                      class="icon-row"
                      @click.stop
                    >
                      <!-- <v-icon
                        size="22"
                        :color="colorIconoGrupo(item)"
                        :class="{ 'disabled-icon': !item.id_user || esTemplateFesDirecta(item.id_template) }"
                        :title="esTemplateFesDirecta(item.id_template) ? 'FES_DIRECTA: flujo automático con usuario survey' : titleIconoGrupo(item)"
                        @click.stop="onClickAsignarFlujo(item)"
                      >
                        mdi-account-multiple
                      </v-icon> -->

                      <v-icon
                        size="22"
                        color="blue-darken-2"
                        title="Asignación completa"
                        @click.stop="abrirModalAsignacionCompleta(item)"
                      >
                        mdi-account-switch
                      </v-icon>

                      <template v-if="item.estado_srv === 'Creado' || item.estado_srv === 'Pre Creado'">
                        <template v-if="editingId === item.id_survey">
                          <v-icon
                            size="26"
                            color="green"
                            title="Guardar"
                            @click.stop="guardarCambios(item)"
                          >
                            mdi-check
                          </v-icon>
                          <v-icon
                            size="26"
                            color="red"
                            title="Cancelar"
                            @click.stop="cancelarEdicion"
                          >
                            mdi-close
                          </v-icon>
                        </template>

                        <template v-else>
                          <!-- <v-icon
                            size="22"
                            :color="item.id_user ? 'green' : 'red'"
                            title="Editar asignación"
                            @click.stop="editar(item)"
                          >
                            mdi-pencil
                          </v-icon> -->

                          <!-- ✅ en conexion NO eliminar -->
                          <v-icon
                            size="22"
                            title="Eliminar"
                            :class="{ 'disabled-icon': props.conexion }"
                            :style="props.conexion ? 'pointer-events:none;' : ''"
                            @click.stop="deleteSurvey(item)"
                          >
                            mdi-delete
                          </v-icon>
                        </template>
                      </template>
                    </div>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-col>
        </v-row>

        <!-- ===================== -->
        <!-- TABLA: modo NORMAL -->
        <!-- ===================== -->
        <v-row
          v-else
          dense
        >
          <v-col cols="12">
            <v-table
              dense
              class="text-caption"
              fixed-header
              height="700px"
            >
              <thead>
                <tr>
                  <th class="text-left">
                    Id Protocolo
                  </th>
                  <th class="text-left">
                    Familia
                  </th>
                  <th class="text-left">
                    Nombre Protocolo
                  </th>
                  <th class="text-left">
                    Cliente
                  </th>
                  <th class="text-left">
                    Proyecto
                  </th>
                  <th class="text-left">
                    Usuario
                  </th>
                  <th class="text-left">
                    Empresa Cliente
                  </th>
                  <th class="text-left">
                    Estado
                  </th>
                  <th class="text-left">
                    Fecha Inicio Plan
                  </th>
                  <th class="text-left">
                    Fecha Fin Plan
                  </th>
                  <th class="text-left">
                    Fecha Inicio Real
                  </th>
                  <th class="text-left">
                    Fecha Fin Real
                  </th>
                  <th class="text-left">
                    Fecha Fin Ejec
                  </th>
                  <th class="text-left">
                    Fecha Fin Verificación
                  </th>
                  <th class="text-left">
                    PDF
                  </th>
                  <th class="text-left">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="item in surveys"
                  :key="item.id_survey"
                >
                  <td>{{ item.id_survey }}</td>
                  <td>{{ item.name_tipo_srv }}</td>
                  <td>{{ item.name_template_srv }}</td>
                  <td>{{ item.name_empresa_cliente }}</td>
                  <td>{{ item.nombre_proyecto }}</td>

                  <td v-if="editingId === item.id_survey">
                    <v-select
                      v-model="editCache.id_user"
                      :items="usuariosOrdenados"
                      item-title="nombre_user"
                      item-value="id_user"
                      density="compact"
                      variant="underlined"
                      hide-details
                      style="min-width: 150px"
                    />
                  </td>
                  <td v-else>
                    <template v-if="item.id_user">
                      {{ item.nombre_user }}
                    </template>
                    <template v-else>
                      <div class="d-flex align-center">
                        <v-icon
                          color="red"
                          size="18"
                          class="mr-1"
                          title="Sin usuario asignado"
                        >
                          mdi-account-off
                        </v-icon>
                        <span class="text-error">Sin asignar</span>
                      </div>
                    </template>
                  </td>

                  <td>{{ item.name_empresa_cliente }}</td>

                  <td>
                    <div class="d-flex align-center">
                      <v-icon
                        v-if="item.estado_srv === 'Pre Creado' && !item.id_user"
                        color="red"
                        size="18"
                        class="mr-1"
                        title="Sin usuario asignado"
                      >
                        mdi-account-alert
                      </v-icon>

                      <v-icon
                        v-if="item.estado_srv === 'Pre Creado' && !item.id_flow"
                        color="red"
                        size="18"
                        class="mr-1"
                        title="Sin flujo asignado"
                      >
                        mdi-source-branch
                      </v-icon>

                      <span
                        :class="{
                          'text-error': item.estado_srv === 'Pre Creado' && (!item.id_user || !item.id_flow)
                        }"
                      >
                        {{ item.estado_srv }}
                      </span>
                    </div>
                  </td>

                  <td v-if="editingId === item.id_survey">
                    <v-text-field
                      v-model="editCache.fecha_plan_ini"
                      type="date"
                      density="compact"
                      variant="underlined"
                      hide-details
                      style="min-width: 140px"
                    />
                  </td>
                  <td v-else>
                    {{ item.fecha_plan_ini }}
                  </td>

                  <td v-if="editingId === item.id_survey">
                    <v-text-field
                      v-model="editCache.fecha_plan_fin"
                      type="date"
                      density="compact"
                      variant="underlined"
                      hide-details
                      style="min-width: 140px"
                    />
                  </td>
                  <td v-else>
                    {{ item.fecha_plan_fin }}
                  </td>

                  <td>{{ item.fecha_real_ini }}</td>
                  <td>{{ item.fecha_real_fin }}</td>
                  <td>{{ item.fecha_ejec_fin }}</td>
                  <td>{{ item.fecha_verif_fin }}</td>

                  <!-- ✅ PDF -->
                  <td style="text-align: center;">
                    <template v-if="item.id_doc">
                      <a
                        :href="`${ARCHIVO_BASE_URL}/archivo/terracon/${item.id_doc}`"
                        target="_blank"
                        rel="noopener"
                        title="Abrir PDF"
                        style="display:inline-flex;align-items:center;justify-content:center"
                        @click.stop
                      >
                        <v-icon size="26">mdi-file-pdf-box</v-icon>
                      </a>
                    </template>
                    <template v-else>
                      —
                    </template>
                  </td>

                  <td>
                    <!-- ✅ EN CONEXION: cualquiera puede editar -->
                    <div
                      v-if="puedeEditar"
                      class="icon-row"
                    >
                      <!-- <v-icon
                        size="22"
                        :color="colorIconoGrupo(item)"
                        :class="{ 'disabled-icon': !item.id_user || esTemplateFesDirecta(item.id_template) }"
                        :title="esTemplateFesDirecta(item.id_template) ? 'FES_DIRECTA: flujo automático con usuario survey' : titleIconoGrupo(item)"
                        @click="onClickAsignarFlujo(item)"
                      >
                        mdi-account-multiple
                      </v-icon> -->

                      <v-icon
                        size="22"
                        color="blue-darken-2"
                        title="Asignación completa"
                        @click="abrirModalAsignacionCompleta(item)"
                      >
                        mdi-account-switch
                      </v-icon>

                      <template v-if="item.estado_srv === 'Creado' || item.estado_srv === 'Pre Creado'">
                        <template v-if="editingId === item.id_survey">
                          <v-icon
                            size="26"
                            color="green"
                            title="Guardar"
                            @click="guardarCambios(item)"
                          >
                            mdi-check
                          </v-icon>
                          <v-icon
                            size="26"
                            color="red"
                            title="Cancelar"
                            @click="cancelarEdicion"
                          >
                            mdi-close
                          </v-icon>
                        </template>

                        <template v-else>
                          <!-- <v-icon
                            size="22"
                            :color="item.id_user ? 'green' : 'red'"
                            title="Editar asignación"
                            @click="editar(item)"
                          >
                            mdi-pencil
                          </v-icon> -->

                          <!-- ✅ en conexion NO eliminar -->
                          <v-icon
                            size="22"
                            title="Eliminar"
                            :class="{ 'disabled-icon': props.conexion }"
                            :style="props.conexion ? 'pointer-events:none;' : ''"
                            @click="deleteSurvey(item)"
                          >
                            mdi-delete
                          </v-icon>
                        </template>
                      </template>
                    </div>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-col>
        </v-row>

        <!-- Modales -->
        <v-dialog
          v-model="showModal"
          max-width="1000"
        >
          <v-card>
            <v-toolbar
              color="primary"
              dark
            >
              <v-toolbar-title>Detalle de Inspección</v-toolbar-title>
              <v-spacer />
              <v-btn
                icon
                @click="showModal = false"
              >
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-toolbar>
            <v-card-text>
              <VerSurvey :Survey="selectedSurveyId" />
            </v-card-text>
          </v-card>
        </v-dialog>

        <v-dialog
          v-model="showModalAsignar"
          max-width="700"
        >
          <v-card>
            <v-toolbar
              color="primary"
              dark
            >
              <v-toolbar-title>Asignar Flujo</v-toolbar-title>
              <v-spacer />
              <v-btn
                icon
                @click="showModalAsignar = false"
              >
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-toolbar>

            <v-card-text>
              <template
                v-for="flujo in flujos"
                :key="flujo.id_flow_stp"
              >
                <v-row dense>
                  <v-col cols="4">
                    <strong>Paso {{ flujo.flow_tmpl_step_orden }}:</strong> {{ flujo.name_rol }}
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
                      variant="underlined"
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
                      variant="underlined"
                      hide-details="auto"
                      clearable
                      @update:model-value="val => markDirty(flujo, val)"
                    />
                  </v-col>
                </v-row>
                <br>
              </template>

              <div class="d-flex justify-end gap-2 mt-4">
                <v-btn
                  variant="text"
                  color="grey-darken-2"
                  @click="showModalAsignar = false"
                >
                  <v-icon
                    start
                    icon="mdi-close"
                  />
                  Cancelar
                </v-btn>

                <v-btn
                  type="submit"
                  color="primary"
                  @click="asignarSurveyFlujo"
                >
                  <v-icon
                    start
                    icon="mdi-check"
                  />
                  Asignar
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-dialog>

        <v-dialog
          v-model="showModalAsignacionCompleta"
          max-width="760"
        >
          <v-card>
            <v-toolbar
              color="primary"
              dark
            >
              <v-toolbar-title>Asignación Completa</v-toolbar-title>
              <v-spacer />
              <v-btn
                icon
                @click="showModalAsignacionCompleta = false"
              >
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-toolbar>

            <v-card-text>
              <v-row dense>
                <v-col cols="12">
                  <v-alert
                    type="info"
                    variant="tonal"
                    density="compact"
                  >
                    Selecciona usuario del protocolo y, si corresponde, usuarios de flujo.
                  </v-alert>
                </v-col>

                <v-col
                  cols="12"
                  md="6"
                >
                  <v-select
                    v-model="asignacionCompleta.id_user_survey"
                    :items="usuariosOrdenados"
                    item-title="nombre_user"
                    item-value="id_user"
                    label="Usuario"
                    density="compact"
                    variant="outlined"
                    clearable
                  />
                </v-col>

                <v-col
                  cols="12"
                  md="3"
                >
                  <v-text-field
                    v-model="asignacionCompleta.fecha_plan_ini"
                    label="Fecha Inicio Plan"
                    type="date"
                    density="compact"
                    variant="outlined"
                  />
                </v-col>

                <v-col
                  cols="12"
                  md="3"
                >
                  <v-text-field
                    v-model="asignacionCompleta.fecha_plan_fin"
                    label="Fecha Fin Plan"
                    type="date"
                    density="compact"
                    variant="outlined"
                  />
                </v-col>

                <v-col cols="12">
                  <v-alert
                    type="info"
                    variant="tonal"
                    density="compact"
                  >
                    {{ asignacionCompletaEsFesDirecta ? 'FES_DIRECTA: los pasos de usuario toman automaticamente el usuario del survey.' : 'Flujo: asigna usuario por cada paso.' }}
                  </v-alert>
                </v-col>

                <v-col
                  v-for="flujo in flujosAsignacionCompleta"
                  :key="`ac-${flujo.id_flow_stp}`"
                  cols="12"
                >
                  <v-row dense>
                    <v-col
                      cols="12"
                      md="4"
                    >
                      <strong>Paso {{ flujo.flow_tmpl_step_name }}:</strong> ({{ flujo.name_rol }})
                    </v-col>
                    <v-col
                      cols="12"
                      md="8"
                    >
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
                        hide-details="auto"
                        clearable
                        :disabled="false"
                        @update:model-value="val => markDirtyEquipoCompleta(flujo, val)"
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
                        hide-details="auto"
                        clearable
                        :disabled="asignacionCompletaEsFesDirecta"
                        @update:model-value="val => markDirtyCompleta(flujo, val)"
                      />
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>

              <div class="d-flex justify-end gap-2 mt-4">
                <v-btn
                  variant="text"
                  color="grey-darken-2"
                  @click="showModalAsignacionCompleta = false"
                >
                  <v-icon
                    start
                    icon="mdi-close"
                  />
                  Cancelar
                </v-btn>

                <v-btn
                  color="primary"
                  :loading="guardandoAsignacionCompleta"
                  :disabled="!puedeGuardarAsignacionCompleta || cargandoFlujoAsignacionCompleta"
                  @click="guardarAsignacionCompleta"
                >
                  <v-icon
                    start
                    icon="mdi-check"
                  />
                  Asignar
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-dialog>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch, onActivated } from 'vue'
import apiAxios from '@/services/api'
import { useUserDetailStore } from "@/stores/userDetail"

const userDetailStore = useUserDetailStore()

const props = defineProps({
  fechaDesde: String,
  fechaHasta: String,
  clienteId: [String, Number],
  proyectoId: [String, Number],
  medioAmbiente: Boolean,
  calidad: Boolean,
  seguridad: Boolean,
  seguimiento: Boolean,

  // ✅ NUEVO: si true => NO crear (solo actualizar/editar)
  conexion: { type: Boolean, default: false },

  // ✅ mantiene compatibilidad con el flujo de registro de informes
  registroInformes: { type: Boolean, default: false }
})

const ARCHIVO_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://servidor.leanglobal.cl'
const tableHeight = computed(() => (props.seguridad ? undefined : '280px'))

const bloquearArea = computed(() => !!props.medioAmbiente || !!props.calidad || !!props.seguridad)

// data
const areas = ref([])
const tiposSurvey = ref([])
const templatesSurvey = ref([])
const templatesPorTipoCache = new Map()
const clientes = ref([])
const proyectos = ref([])
const usuarios = ref([])
const usuariosFlow = ref([])

const flujosAprobacion = ref([])
const flujos = ref([])

const areaSeleccionada = ref(null)
const tipoSeleccionado = ref(null)
const templateSeleccionado = ref(null)
const clienteSeleccionado = ref(null)
const proyectoSeleccionado = ref(null)
const usuarioSeleccionado = ref(null)

const surveys = ref([])

/** ✅ para tabla registro-informes */
const surveysConDocs = ref([])

const editingId = ref(null)
const editCache = ref({})

const emit = defineEmits(['surveyCreado'])

// fechas
const obtenerFechaHoy = () => new Date().toISOString().split('T')[0]
const fechaPlanInicio = ref(obtenerFechaHoy())
const fechaPlanFin = ref(obtenerFechaHoy())

const selectedSurveyId = ref(null)
const selectedSurveyIdSeleccionado = ref(null)
const showModal = ref(false)
const showModalAsignar = ref(false)
const showModalAsignacionCompleta = ref(false)
const guardandoAsignacionCompleta = ref(false)
const cargandoFlujoAsignacionCompleta = ref(false)
const flujosAsignacionCompleta = ref([])
const asignacionCompleta = ref({
  id_survey: null,
  id_template: null,
  id_user_survey: null,
  fecha_plan_ini: obtenerFechaHoy(),
  fecha_plan_fin: obtenerFechaHoy()
})
const asignacionCompletaEsFesDirecta = computed(() =>
  esTemplateFesDirecta(asignacionCompleta.value.id_template)
)
const flujoAsignacionCompletaIncompleto = computed(() => {
  if (asignacionCompletaEsFesDirecta.value) return false
  if (!flujosAsignacionCompleta.value.length) return false
  return flujosAsignacionCompleta.value.some(f => !normalizaNum(f.id_user))
})
const puedeGuardarAsignacionCompleta = computed(() => {
  const sid = Number(asignacionCompleta.value.id_survey)
  const idUserSurvey = normalizaNum(asignacionCompleta.value.id_user_survey)
  const fechasOk = !!asignacionCompleta.value.fecha_plan_ini && !!asignacionCompleta.value.fecha_plan_fin
  if (!sid || !idUserSurvey || !fechasOk) return false
  return !flujoAsignacionCompletaIncompleto.value
})

function abrirModalConSurvey(id) {
  selectedSurveyId.value = id
  showModal.value = true
}

// =========================
// PERMISOS: cualquier _PROG
// =========================
const rolesUsuario = ref([])
const rolesCatalogo = ref([])

const ADMIN_CREADOR = 11

async function obtenerRolesCatalogo () {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerRoles')
    rolesCatalogo.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('obtenerRolesCatalogo error', e)
    rolesCatalogo.value = []
  }
}

async function obtenerUsuariosRoles () {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerUsuariosRoles')
    rolesUsuario.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('obtenerUsuariosRoles error', e)
    rolesUsuario.value = []
  }
}

const progRoleIds = computed(() => {
  return new Set(
    (rolesCatalogo.value ?? [])
      .filter(r => /_PROG$/i.test(String(r.name_rol || '').trim()))
      .map(r => Number(r.id_rol))
      .filter(Number.isFinite)
  )
})

const hasAnyProg = computed(() => {
  const uid = Number(userDetailStore.userDetail?.id_user)
  if (!uid) return false
  return (rolesUsuario.value ?? []).some(r =>
    Number(r.id_user) === uid && progRoleIds.value.has(Number(r.id_rol))
  )
})

const hasAdminCreador = computed(() => {
  const uid = Number(userDetailStore.userDetail?.id_user)
  if (!uid) return false
  return (rolesUsuario.value ?? []).some(r =>
    Number(r.id_user) === uid && Number(r.id_rol) === ADMIN_CREADOR
  )
})

const puedeCrear = computed(() => {
  const can = hasAdminCreador.value || hasAnyProg.value
  const okCalidad = !!props.calidad       && can
  const okMA      = !!props.medioAmbiente && can
  const okSeg     = !!props.seguridad     && can
  const okSegui   = !!props.seguimiento   && can
  return okCalidad || okMA || okSeg || okSegui
})

/** ✅ EN CONEXION: cualquiera puede editar */
const puedeEditar = computed(() => props.conexion || puedeCrear.value)

// helpers
const normalizaNum = (v) => (v == null || v === '' ? null : Number(v))
const TEMPLATES_FES_DIRECTA = new Set([101, 103, 104, 105])
const esTemplateFesDirecta = (idTemplate) => TEMPLATES_FES_DIRECTA.has(Number(idTemplate))
const normalize = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()

function onClickAsignarFlujo(item) {
  if (!item.id_user) {
    alert('Primero debes asignar un usuario a la inspección antes de configurar el flujo.')
    return
  }
  if (esTemplateFesDirecta(item?.id_template)) {
    alert('En FES_DIRECTA el usuario de flujo se asigna automÃ¡ticamente igual al usuario del survey.')
    return
  }
  showModalAsignarFlujo(item.id_survey)
}

watch(
  () => [asignacionCompleta.value.id_user_survey, asignacionCompleta.value.id_template],
  async ([nuevo]) => {
    const uidSurvey = normalizaNum(nuevo)

    if (!flujosAsignacionCompleta.value.length && showModalAsignacionCompleta.value) {
      await cargarFlujoAsignacionCompleta({ asegurarSurvey: true })
    }

    if (asignacionCompletaEsFesDirecta.value && uidSurvey) {
      flujosAsignacionCompleta.value = flujosAsignacionCompleta.value.map(f => {
        if (f.flag_equipo) return f
        const next = { ...f, id_user: uidSurvey }
        next._dirty = normalizaNum(next.id_user) !== normalizaNum(next._orig_id)
        return next
      })
    }
  }
)

async function abrirModalAsignacionCompleta(item) {
  const sid = Number(item?.id_survey)
  if (!sid) return

  asignacionCompleta.value = {
    id_survey: sid,
    id_template: normalizaNum(item?.id_template),
    id_user_survey: normalizaNum(item?.id_user),
    fecha_plan_ini: item?.fecha_plan_ini || obtenerFechaHoy(),
    fecha_plan_fin: item?.fecha_plan_fin || obtenerFechaHoy()
  }

  flujosAsignacionCompleta.value = []
  await cargarFlujoAsignacionCompleta({ asegurarSurvey: false })
  showModalAsignacionCompleta.value = true
}

async function cargarFlujoAsignacionCompleta({ asegurarSurvey = false } = {}) {
  const sid = Number(asignacionCompleta.value.id_survey)
  const uidSurvey = normalizaNum(asignacionCompleta.value.id_user_survey)
  if (!sid) return
  if (cargandoFlujoAsignacionCompleta.value) return

  cargandoFlujoAsignacionCompleta.value = true

  try {
    await obtenerFlujosAprobacion(sid)
    if (!flujosAprobacion.value && asegurarSurvey && uidSurvey) {
      await apiAxios.put(`/survey/UpdPlan/${sid}`, {
        id_user: uidSurvey,
        fecha_plan_ini: asignacionCompleta.value.fecha_plan_ini,
        fecha_plan_fin: asignacionCompleta.value.fecha_plan_fin
      })
      await obtenerFlujosAprobacion(sid)
    }

    await obtenerFlujosByIdSurvey(flujosAprobacion.value)
    flujosAsignacionCompleta.value = (flujos.value ?? []).map(f => {
      const esEquipo = !!f.flag_equipo || /eq-?\s*fescol/i.test(String(f.name_rol || ''))
      const out = { ...f, flag_equipo: esEquipo }
      out.id_user = normalizaNum(f.id_user ?? f.id_equipo_proyecto ?? f._id_equipo_proyecto)
      out._orig_id = normalizaNum(out.id_user)
      out._dirty = false
      out._id_equipo_proyecto = esEquipo ? out.id_user : null
      return out
    })

    if (asignacionCompletaEsFesDirecta.value && normalizaNum(asignacionCompleta.value.id_user_survey)) {
      const uid = normalizaNum(asignacionCompleta.value.id_user_survey)
      flujosAsignacionCompleta.value = flujosAsignacionCompleta.value.map(f => {
        if (f.flag_equipo) return f
        const next = { ...f, id_user: uid }
        next._dirty = normalizaNum(next.id_user) !== normalizaNum(next._orig_id)
        return next
      })
    }
  } catch (e) {
    console.error('Error abriendo modal de asignacion completa:', e)
    flujosAsignacionCompleta.value = []
  } finally {
    cargandoFlujoAsignacionCompleta.value = false
  }
}

// === Equipos ===
const equiposProyectos = ref([])

async function obtenerEquiposProyectos () {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerEquiposProyectos')
    equiposProyectos.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error(err)
    equiposProyectos.value = []
  }
}

const equiposItems = computed(() =>
  (equiposProyectos.value ?? []).map(e => ({ ...e, id_equipo_proyecto: Number(e.id_equipo_proyecto) }))
)

const equiposMap = computed(() => {
  const m = new Map()
  for (const e of equiposItems.value) m.set(e.id_equipo_proyecto, e.nombre_equipo)
  return m
})
const nombreEquipoById = (id) => equiposMap.value.get(Number(id)) ?? id
const valueComparator = (a, b) => Number(a) === Number(b)

// mount/activate
onMounted(async () => {
  await Promise.all([obtenerRolesCatalogo(), obtenerUsuariosRoles()])
  await Promise.all([obtenerAreas(), obtenerClientes(), obtenerUsuarios(), obtenerEquiposProyectos()])
  await getSurveys()
})

onActivated(() => { getSurveys() })

// === Modal Asignación ===
async function showModalAsignarFlujo(surveyId) {
  selectedSurveyIdSeleccionado.value = surveyId

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

function prepararAsignaciones () {
  flujos.value.forEach(f => {
    f._orig_id = normalizaNum(f.id_user)
    f._dirty = false
  })
}

function markDirty (fila, nuevoVal) {
  const nuevo = normalizaNum(nuevoVal)
  if (fila._orig_id === undefined) fila._orig_id = normalizaNum(fila.id_user)
  fila._dirty = nuevo !== fila._orig_id
  fila.id_user = nuevo
}

function markDirtyEquipo (fila, nuevoVal) {
  const nuevo = normalizaNum(nuevoVal)
  const nombre = nombreEquipoById(nuevo)
  if (nombre && nombre !== nuevo) fila.nombre_user = nombre

  if (fila._orig_id === undefined) fila._orig_id = normalizaNum(fila.id_user)
  fila._dirty = nuevo !== fila._orig_id

  fila.id_user = nuevo
  fila._id_equipo_proyecto = nuevo
}

function markDirtyCompleta (fila, nuevoVal) {
  const nuevo = normalizaNum(nuevoVal)
  if (fila._orig_id === undefined) fila._orig_id = normalizaNum(fila.id_user)
  fila._dirty = nuevo !== fila._orig_id
  fila.id_user = nuevo
}

function markDirtyEquipoCompleta (fila, nuevoVal) {
  const nuevo = normalizaNum(nuevoVal)
  const nombre = nombreEquipoById(nuevo)
  if (nombre && nombre !== nuevo) fila.nombre_user = nombre
  if (fila._orig_id === undefined) fila._orig_id = normalizaNum(fila.id_user)
  fila._dirty = nuevo !== fila._orig_id
  fila.id_user = nuevo
  fila._id_equipo_proyecto = nuevo
}

// ----------------------------
// Roles/Usuarios por rol
// ----------------------------
const rolesFlujoList = ref([])
const usuariosRolesList = ref([])

async function fetchRolesFlujo () {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerRoles')
    rolesFlujoList.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('fetchRolesFlujo error:', e)
    rolesFlujoList.value = []
  }
}

async function fetchUsuariosRoles () {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerUsuariosRoles')
    usuariosRolesList.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('fetchUsuariosRoles error:', e)
    usuariosRolesList.value = []
  }
}

onMounted(() => Promise.all([fetchRolesFlujo(), fetchUsuariosRoles()]))

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

function usuariosPorRol (rolName) {
  console.log('🔍 usuariosPorRol:', rolName)
  if(rolName == 'FES_DIRECTA') return usuariosFlowOrdenados.value
  const rolId = rolNameToId.value[rolName]
  if (!rolId) return []
  const ids = usersByRolId.value.get(rolId)
  if (!ids) return []
  return usuariosFlowOrdenados.value.filter(u => ids.has(Number(u.id_user)))
}

// ----------------------------
// GETs
// ----------------------------
const obtenerFlujosAprobacion = async (surveyId) => {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/flujosAprobacion')
    const sid = Number(surveyId)
    const row = (data.datos || []).find(f => Number(f.id_survey) === sid)
    flujosAprobacion.value = row?.id_flow ?? null
  } catch (e) {
    console.error('flujosAprobacion error:', e)
    flujosAprobacion.value = []
  }
}

const obtenerFlujosByIdSurvey = async (flowId) => {
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

// auto-selects de área
function autoSelectCalidad () {
  if (!props.calidad) return
  if ((areas.value?.length || 0) === 0) return

  const target = 'calidad'
  let elegido =
    areas.value.find(a => normalize(a.name_area) === target) ||
    areas.value.find(a => normalize(a.name_area).startsWith(target)) ||
    areas.value.find(a => normalize(a.name_area).includes(target)) ||
    areas.value[0]

  areaSeleccionada.value = elegido?.id_area ?? null
}

function autoSelectMedioAmbiente () {
  if (!props.medioAmbiente) return
  if ((areas.value?.length || 0) === 0) return

  const ma = areas.value.find(a => Number(a.id_area) === 3)
  if (ma) {
    areaSeleccionada.value = ma.id_area
  }
}

watch(
  () => areas.value,
  () => {
    if (props.medioAmbiente) autoSelectMedioAmbiente()
  },
  { immediate: true }
)

function autoSelectSeguridad () {
  if (!props.seguridad) return
  if (!areaSeleccionada.value && (areas.value?.length || 0) > 0) {
    const seg =
      areas.value.find(a => /seguridad/i.test(String(a.name_area))) ||
      areas.value[0]
    areaSeleccionada.value = seg?.id_area ?? null
  }
}

watch(() => props.medioAmbiente, (val) => { if (val) autoSelectMedioAmbiente() })
watch(() => props.seguridad, (val) => { if (val) autoSelectSeguridad() })
watch(() => props.calidad, (val) => { if (val) autoSelectCalidad() })

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

const obtenerTemplatesPorTipo = async (id_tipo_srv) => {
  const key = Number(id_tipo_srv)
  if (templatesPorTipoCache.has(key)) return templatesPorTipoCache.get(key)

  const { data } = await apiAxios.get(`/servicio/leanglobal/obtenerTemplates?id_tipo_srv=${id_tipo_srv}`)
  const templatesOrdenados = sortByText(Array.isArray(data) ? data : [], x => x.name_template_srv)
  templatesPorTipoCache.set(key, templatesOrdenados)
  return templatesOrdenados
}

// áreas
const obtenerAreas = async () => {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerAreas?id_empresa=2')
    areas.value = sortByText(data, x => x.name_area)

    if (props.calidad) autoSelectCalidad()
    else if (props.medioAmbiente) autoSelectMedioAmbiente()
    else if (props.seguridad) autoSelectSeguridad()
  } catch (err) {
    console.error('Error al obtener áreas:', err)
  }
}

watch(areaSeleccionada, (nuevoArea) => {
  if (nuevoArea) obtenerTipos(nuevoArea)
  else {
    tiposSurvey.value = []
    tipoSeleccionado.value = null
    templatesSurvey.value = []
    templateSeleccionado.value = null
  }
})

// tipos
const obtenerTipos = async (id_area) => {
  try {
    let data
    if (Number(id_area) === 2) {
      ({ data } = await apiAxios.get(`/servicio/leanglobal/obtenerTipoTemplate?id_area=${id_area}`))
    } else {
      ({ data } = await apiAxios.get(`/servicio/leanglobal/obtenerTipoTemplate?id_area=${id_area}&flag_personalizado=false`))
    }
    const tiposOrdenados = sortByText(Array.isArray(data) ? data : [], x => x.name_tipo_srv)
    const tiposConProtocolos = await Promise.all(
      tiposOrdenados.map(async (tipo) => {
        try {
          const templates = await obtenerTemplatesPorTipo(tipo.id_tipo_srv)
          return templates.length > 0 ? tipo : null
        } catch (err) {
          console.error('Error validando templates para tipo:', tipo?.id_tipo_srv, err)
          return null
        }
      })
    )
    tiposSurvey.value = tiposConProtocolos.filter(Boolean)

    if (props.medioAmbiente && (tiposSurvey.value?.length || 0) > 0) {
      const target = 'medio ambiente'
      let elegido = tiposSurvey.value.find(t => normalize(t.name_tipo_srv) === target)
      if (!elegido) elegido = tiposSurvey.value.find(t => normalize(t.name_tipo_srv).startsWith(target))
      if (!elegido) elegido = tiposSurvey.value.find(t => normalize(t.name_tipo_srv).includes(target))
      tipoSeleccionado.value = (elegido || tiposSurvey.value[0])?.id_tipo_srv ?? null
    } else {
      tipoSeleccionado.value = null
      templatesSurvey.value = []
    }
  } catch (err) {
    console.error('Error al obtener tipos:', err)
  }
}

watch(tipoSeleccionado, (nuevoTipo) => {
  if (nuevoTipo) {
    templateSeleccionado.value = null
    templatesSurvey.value = []
    obtenerTemplates(nuevoTipo)
  }
  else {
    templatesSurvey.value = []
    templateSeleccionado.value = null
  }
})

// templates
const templatesOptions = computed(() => sortByText(templatesSurvey.value || [], x => x.name_template_srv))

watch([templatesOptions, () => props.medioAmbiente], ([opts, esMA]) => {
  if (esMA && !templateSeleccionado.value && opts.length === 1) {
    templateSeleccionado.value = opts[0].id_template
  }
})

const obtenerTemplates = async (id_tipo_srv) => {
  try {
    templatesSurvey.value = await obtenerTemplatesPorTipo(id_tipo_srv)
  } catch (err) {
    console.error('Error al obtener templates:', err)
  }
}

// clientes/proyectos/usuarios
const obtenerClientes = async () => {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerEmpresas')
    clientes.value = sortByText(data, x => x.name_empresa)
  } catch (err) {
    console.error(err)
  }
}

watch(clienteSeleccionado, (nuevoCliente) => {
  if (nuevoCliente) obtenerProyectos(nuevoCliente)
  else proyectoSeleccionado.value = null
})

const obtenerProyectos = async (id_cliente) => {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerProyectos?id_empresa_cliente=' + (id_cliente || ''))
    proyectos.value = sortByText(data, x => x.nombre_proyecto)
  } catch (err) {
    console.error(err)
  }
}

const obtenerUsuarios = async () => {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerUsuarios')
    usuarios.value = data
    usuariosFlow.value = data
  } catch (err) {
    console.error(err)
  }
}

// ----------------------------
// MAIN: GET SURVEYS
// ----------------------------
async function getSurveys({ onlyLast = false } = {}) {
  try {
    const proyectoId = (props.proyectoId == null || String(props.proyectoId).trim().toLowerCase() === 'null' || String(props.proyectoId).trim() === '')
      ? ''
      : props.proyectoId

    const clienteId = (props.clienteId == null || String(props.clienteId).trim().toLowerCase() === 'null' || String(props.clienteId).trim() === '')
      ? ''
      : props.clienteId

    const url = `/servicio/leanglobal/procesosSurveyV3` +
      `?fecha_desde=${props.fechaDesde}` +
      `&fecha_hasta=${props.fechaHasta}` +
      `&ts.id_empresa_cliente=${clienteId}` +
      `&ts.id_proyecto=${proyectoId}`

    const response = await apiAxios.get(url)
    const ordenados = (response.data.datos || []).sort((a, b) => Number(b.id_survey) - Number(a.id_survey))

    surveys.value = ((props.medioAmbiente || props.calidad || props.seguridad) && onlyLast && ordenados.length)
      ? [ordenados[0]]
      : ordenados

    if (props.calidad) surveys.value = surveys.value.filter(s => s.id_area == 1)
    if (props.seguridad) surveys.value = surveys.value.filter(s => s.id_area == 2)
    if (props.seguridad && props.registroInformes) surveys.value = surveys.value.filter(s => s.id_area == 2 && s.flag_registro == true)
    if (props.medioAmbiente) surveys.value = surveys.value.filter(s => s.id_area == 3)
    if (props.seguimiento) surveys.value = surveys.value.filter(s => s.id_area == 4)
    if (props.conexion) surveys.value = surveys.value.filter(s => s.id_area == 8)

    const base = surveys.value ?? []
    const enriched = await Promise.all(
      base.map(async (s) => {
        try {
          const detail = await getSurvey(s.id_survey)
          const { id_doc_registro, url_doc_registro, nombre_doc_registro } = extraerDocRegistro(detail)
          return { ...s, id_doc_registro, url_doc_registro, nombre_doc_registro }
        } catch (e) {
          console.error('Error obteniendo detail', s.id_survey, e)
          return { ...s, id_doc_registro: null, url_doc_registro: '', nombre_doc_registro: '' }
        }
      })
    )
    surveysConDocs.value = enriched
    surveys.value = enriched

  } catch (error) {
    console.error("❌ Error al obtener survey:", error)
    surveys.value = []
    surveysConDocs.value = []
  }
}

async function getSurvey(idSurvey) {
  const response = await apiAxios.get(`/servicio/leanglobal/procesosSurveyDetail?id_survey=${idSurvey}`)
  return response.data
}

function extraerDocRegistro(detail) {
  const row = Array.isArray(detail) ? detail?.[0] : detail?.surveyDetail?.[0]
  const segmentos = row?.body_exec?.segmentos ?? []

  let archivos = []
  for (const seg of segmentos) {
    for (const a of (seg?.attributes ?? [])) {
      if (a?.type === 'fileUpload' && Array.isArray(a?.archivos) && a.archivos.length) {
        archivos = a.archivos
      }
    }
  }

  const file = archivos?.at(-1) ?? null
  return {
    id_doc_registro: file?.id_doc ?? null,
    url_doc_registro: file?.url ?? '',
    nombre_doc_registro: file?.name ?? file?.nombre ?? '',
    archivo_registro: file ?? null,
  }
}

defineExpose({ getSurveys })

// ----------------------------
// CRUD
// ----------------------------
const editar = (item) => {
  editingId.value = item.id_survey
  editCache.value = { ...item }
}

const cancelarEdicion = () => {
  editingId.value = null
  editCache.value = {}
}

const guardarCambios = async (originalItem) => {
  const data = {
    id_user: editCache.value.id_user,
    fecha_plan_ini: editCache.value.fecha_plan_ini,
    fecha_plan_fin: editCache.value.fecha_plan_fin
  }

  try {
    await apiAxios.put(`/survey/UpdPlan/${editCache.value.id_survey}`, data)

    await apiAxios.post('/notfqueue', {
      id_user_target: Number(editCache.value.id_user),
      id_template: null,
      json_data: {
        id_survey: originalItem.id_survey,
        id_flow: originalItem.id_flow,
        id_area: 1,
        tipo_notf: 'asignacion_protocolo',
        obs_notf: 'asignacion protocolo'
      },
      channels: { channel: 'WEB' },
      estado: 'PENDING'
    })

    // ✅ primero asigna flujo si es 101
    if ((Number(originalItem.id_template) === 101 || Number(originalItem.id_template) === 103 || Number(originalItem.id_template) === 104 || Number(originalItem.id_template) === 105) && Number(editCache.value.id_user)) {
      const r = await asignarFlujoAutoParaSurvey({
        surveyId: originalItem.id_survey,
        idUserAsignado: editCache.value.id_user
      })
      console.log('✅ asignación flujo auto:', r)
    }

    // ✅ ahora recién refrescas
    await getSurveys()

  } catch (error) {
    console.error('❌ Error al guardar cambios:', error)
  }

  editingId.value = null
  editCache.value = {}
}

async function guardarAsignacionCompleta () {
  const sid = Number(asignacionCompleta.value.id_survey)
  const idUserSurvey = normalizaNum(asignacionCompleta.value.id_user_survey)

  if (!sid) return
  if (!idUserSurvey) {
    alert('Debes seleccionar un usuario para la inspeccion.')
    return
  }
  if (!asignacionCompleta.value.fecha_plan_ini || !asignacionCompleta.value.fecha_plan_fin) {
    alert('Debes completar las fechas plan.')
    return
  }
  if (flujoAsignacionCompletaIncompleto.value) {
    alert('Debes asignar todos los pasos del flujo antes de pinchar Asignar.')
    return
  }

  guardandoAsignacionCompleta.value = true
  try {
    await apiAxios.put(`/survey/UpdPlan/${sid}`, {
      id_user: idUserSurvey,
      fecha_plan_ini: asignacionCompleta.value.fecha_plan_ini,
      fecha_plan_fin: asignacionCompleta.value.fecha_plan_fin
    })

    await apiAxios.post('/notfqueue', {
      id_user_target: Number(idUserSurvey),
      id_template: null,
      json_data: {
        id_survey: sid,
        id_flow: flujosAprobacion.value || null,
        id_area: 1,
        tipo_notf: 'asignacion_protocolo',
        obs_notf: 'asignacion protocolo'
      },
      channels: { channel: 'WEB' },
      estado: 'PENDING'
    })

    if (!flujosAsignacionCompleta.value.length) {
      await cargarFlujoAsignacionCompleta({ asegurarSurvey: false })
    }

    if (asignacionCompletaEsFesDirecta.value) {
      flujosAsignacionCompleta.value = flujosAsignacionCompleta.value.map(f => {
        if (f.flag_equipo) return f
        const next = { ...f, id_user: idUserSurvey }
        next._dirty = normalizaNum(next.id_user) !== normalizaNum(next._orig_id)
        return next
      })
    }

    const cambiosFlujo = flujosAsignacionCompleta.value.filter(f => f._dirty)
    if (cambiosFlujo.length) {
      const reqsFlujo = cambiosFlujo.map(f => apiAxios.put('/survey/UpdUserFlow', {
        id_flow_stp: f.id_flow_stp,
        id_user_flujo: Number(f.id_user),
        flag_equipo: f.flag_equipo
      }))

      const reqsNotf = cambiosFlujo
        .filter(f => !f.flag_equipo && normalizaNum(f.id_user))
        .map(f => apiAxios.post('/notfqueue', {
          id_user_target: Number(f.id_user),
          id_template: null,
          json_data: {
            id_survey: sid,
            id_flow: flujosAprobacion.value || null,
            id_area: 6,
            tipo_notf: 'asignacion_firma',
            obs_notf: 'asignacion firma'
          },
          channels: { channel: 'WEB' },
          estado: 'PENDING'
        }))

      const resFlujo = await Promise.allSettled(reqsFlujo)
      await Promise.allSettled(reqsNotf)
      const fail = resFlujo.filter(r => r.status === 'rejected')
      if (fail.length) {
        console.warn('Asignacion de flujo incompleta:', fail)
      } else {
        flujosAsignacionCompleta.value = flujosAsignacionCompleta.value.map(f => ({
          ...f,
          _orig_id: normalizaNum(f.id_user),
          _dirty: false
        }))
      }
    }

    await actualizarEstadoSurveyCreado(sid)
    showModalAsignacionCompleta.value = false
    await getSurveys()
  } catch (error) {
    console.error('Error en asignacion completa:', error)
  } finally {
    guardandoAsignacionCompleta.value = false
  }
}
async function asignarFlujoAutoParaSurvey({ surveyId, idUserAsignado }) {
  const sid = Number(surveyId)
  const uid = Number(idUserAsignado)

  if (!sid || !uid) return { ok: false, motivo: 'SIN_IDS' }

  // 1) Obtener id_flow de ese survey
  await obtenerFlujosAprobacion(sid)
  const flowId = Number(flujosAprobacion.value || 0)
  if (!flowId) return { ok: false, motivo: 'SIN_FLOW' }

  // 2) Obtener steps del flow
  await obtenerFlujosByIdSurvey(flowId)
  const steps = Array.isArray(flujos.value) ? flujos.value : []
  if (!steps.length) return { ok: false, motivo: 'SIN_STEPS' }

  // 3) asigna el mismo usuario a todos los pasos NO-equipo
  const cambios = steps
    .map(s => {
      const esEquipo = !!s.flag_equipo || /eq-?\s*fescol/i.test(String(s.name_rol || ''))
      return {
        id_flow_stp: s.id_flow_stp,
        flag_equipo: esEquipo,
        id_user: esEquipo ? (s.id_user ?? null) : uid
      }
    })
    .filter(s => !s.flag_equipo && Number(s.id_user)) // solo pasos usuario

  // 4) Ejecutar UpdUserFlow
  const url = '/survey/UpdUserFlow'
  const reqs = cambios.map(s =>
    apiAxios.put(url, {
      id_flow_stp: s.id_flow_stp,
      id_user_flujo: Number(s.id_user),
      flag_equipo: false
    })
  )

  const res = await Promise.allSettled(reqs)
  const fail = res.filter(r => r.status === 'rejected')
  if (fail.length) return { ok: false, motivo: 'FAIL_UPDUSERFLOW', fail }

  // 5) Notificación (igual que modal, pero a uid)
  await apiAxios.post('/notfqueue', {
    id_user_target: uid,
    id_template: null,
    json_data: {
      id_survey: sid,
      id_flow: flowId,
      id_area: 6,
      tipo_notf: 'asignacion_firma',
      obs_notf: 'asignacion firma'
    },
    channels: { channel: 'WEB' },
    estado: 'PENDING'
  })

  // 6) Cambiar estado a Creado
  await actualizarEstadoSurveyCreado(sid)

  return { ok: true, flowId, steps: steps.length, asignados: cambios.length }
}

const crearSurvey = async () => {
  // ✅ Modo conexión: no crear
  if (props.conexion) return

  if (!tipoSeleccionado.value || !templateSeleccionado.value || !fechaPlanInicio.value || !fechaPlanFin.value) {
    console.error('Por favor, completa todos los campos requeridos.')
    return
  }
  if (!userDetailStore.userDetail?.id_user) {
    console.error("El ID de usuario no está disponible.")
    return
  }

  const tpl = templatesSurvey.value.find(t => t.id_template === templateSeleccionado.value) || {}

  const header_seed   = tpl.header_seed || {}
  const body_seed     = tpl.body_seed || []
  const approval_seed = tpl.approval_seed || {}
  const id_flow_tmpl  = tpl.id_flow_tmpl || null

  const data = {
    id_tipo_srv: tipoSeleccionado.value,
    id_template: templateSeleccionado.value,
    id_user: null,
    id_user_creacion: userDetailStore.userDetail.id_user,
    id_empresa_cliente: clienteSeleccionado.value,
    estado_srv: 'Pre Creado',
    header_seed: JSON.stringify(header_seed),
    body_seed: JSON.stringify(body_seed),
    approval_seed: JSON.stringify(approval_seed),
    header_exec: JSON.stringify(header_seed),
    body_exec: JSON.stringify(body_seed),
    approval_exec: JSON.stringify(approval_seed),
    fecha_plan_ini: fechaPlanInicio.value,
    fecha_plan_fin: fechaPlanFin.value,
    fecha_real_ini: null,
    fecha_real_fin: null,
    fecha_upload: null,
    latitud: null,
    longitud: null,
    id_proyecto: proyectoSeleccionado.value,
    id_flow_tmpl
  }

  try {
    await apiAxios.post('/survey/', data)
    await getSurveys()

    const first = (props.registroInformes ? surveysConDocs.value?.[0] : surveys.value?.[0]) || null
    if (first?.id_survey) {
      emit('surveyCreado', {
        id: first.id_survey,
        fechaDesde: fechaPlanInicio.value,
        fechaHasta: fechaPlanFin.value,
        clienteId: clienteSeleccionado.value ?? '',
        proyectoId: proyectoSeleccionado.value ?? ''
      })
    }
  } catch (error) {
    console.error('Error al crear el survey:', error)
  }
}

const deleteSurvey = async (item) => {
  // ✅ Modo conexión: no eliminar
  if (props.conexion) return

  try {
    await apiAxios.post(`/survey/DelSurvey/`, { id_survey: item.id_survey })
    await getSurveys()
    alert("Survey eliminado correctamente.")
  } catch (error) {
    console.error('❌ Error al eliminar survey:', error)
  }
}

async function actualizarEstadoSurveyCreado (surveyId) {
  try {
    await apiAxios.post('/survey/UpdSurveyEstado', { id_survey: surveyId, estado_srv: 'Creado' })
  } catch (e) {
    console.error('❌ Error al actualizar estado a Creado:', e)
  }
}

// ----------------------------
// Asignación flujo (guardar)
// ----------------------------
async function asignarSurveyFlujo () {
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
        id_area: 6,
        tipo_notf: 'asignacion_firma',
        obs_notf: 'asignacion firma'
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
    await actualizarEstadoSurveyCreado(selectedSurveyIdSeleccionado.value)
  }

  showModalAsignar.value = false
  await getSurveys()
}

// ----------------------------
// UI helpers (iconos)
// ----------------------------
function colorIconoGrupo(item) {
  if (item.estado_srv === 'Pre Creado') return 'red'
  if (item.estado_srv === 'Creado') return 'green'
  return 'gray'
}

function titleIconoGrupo(item) {
  if (item.estado_srv === 'Pre Creado') return 'Flujo NO asignado'
  if (item.estado_srv === 'Creado') return 'Flujo asignado'
  return 'Estado desconocido'
}
</script>

<style scoped>
.icon-row{
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
  white-space: nowrap;
}
.icon-row :deep(.v-icon){
  cursor: pointer;
}
.disabled-icon {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: auto;
}
</style>
