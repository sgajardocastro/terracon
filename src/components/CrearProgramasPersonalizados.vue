<!-- GestorSeguridad.vue -->
<template>
  <div class="pa-4">
    <!-- Toasters -->
    <div class="toast-stack">
      <v-snackbar
        v-for="t in toasts"
        :key="t.id"
        v-model="t.open"
        location="bottom end"
        :timeout="2500"
        :color="t.type === 'success' ? 'green-darken-2' : 'red-darken-2'"
        variant="flat"
        class="mb-2"
      >
        {{ t.message }}
      </v-snackbar>
    </div>

    <v-card
      class="main-card"
      elevation="10"
    >
      <v-card-title class="text-h5 bg-blue-darken-3 text-white py-4 px-6">
        <v-icon
          icon="mdi-shield-check-outline"
          start
        />
        Gestor de Programas de Seguridad
      </v-card-title>

      <v-card-text class="pa-6">
        <v-stepper
          v-model="currentStep"
          :items="['Definición del Plan', 'Asignación de Actividades']"
          flat
        >
          <!-- Paso 1 -->
          <template #item.1>
            <v-card-title class="text-h6 pa-0 mb-4">
              Paso 1: Parámetros del Personalizado
            </v-card-title>

            <v-row
              class="pa-4 rounded-lg"
              :class="isStep1Valid ? 'bg-blue-lighten-5' : 'bg-red-lighten-5'"
            >
              <v-col
                cols="12"
                md="3"
              >
                <v-select
                  v-model="personalizado.periodo"
                  :items="mockPeriodos"
                  item-title="periodo"
                  item-value="periodo"
                  label="Periodo Mensual *"
                  variant="outlined"
                  density="compact"
                  hide-details
                  @update:model-value="updatePlan('periodo', $event)"
                />
              </v-col>

              <v-col
                cols="12"
                md="3"
              >
                <v-select
                  v-model="personalizado.id_empresa_cliente"
                  :items="mockClientes"
                  item-title="name_empresa"
                  item-value="id_empresa"
                  label="Cliente *"
                  variant="outlined"
                  density="compact"
                  hide-details
                  :disabled="!personalizado.periodo"
                  @update:model-value="updatePlan('id_empresa_cliente', $event)"
                />
              </v-col>

              <v-col
                cols="12"
                md="3"
              >
                <v-select
                  v-model="personalizado.id_proyecto"
                  :items="mockProyectos"
                  item-title="nombre_proyecto"
                  item-value="id_proyecto"
                  label="Proyecto *"
                  variant="outlined"
                  density="compact"
                  hide-details
                  :disabled="!personalizado.periodo"
                  @update:model-value="updatePlan('id_proyecto', $event)"
                />
              </v-col>

              <v-col
                cols="12"
                md="3"
              >
                <v-select
                  v-model="personalizado.id_cargo"
                  :items="cargos"
                  item-title="nombre_cargo"
                  item-value="id_cargo"
                  label="Cargo a Personalizar *"
                  variant="outlined"
                  density="compact"
                  hide-details
                  :disabled="!personalizado.id_proyecto"
                  @update:model-value="updatePlan('id_cargo', $event)"
                />
              </v-col>
            </v-row>

            <!-- Usuarios del cargo -->
            <v-card
              class="mt-6 pa-4"
              :class="hasSelectedUsers ? 'bg-blue-lighten-5' : 'bg-red-lighten-5'"
              :disabled="!personalizado.id_cargo"
              flat
            >
              <v-card-title class="text-subtitle-1 pa-0 mb-3">
                Usuarios del Cargo (Selección Múltiple)
              </v-card-title>

              <v-row>
                <v-col
                  v-for="user in allMockUsuariosFiltrados"
                  :key="user.id_user"
                  cols="12"
                  sm="6"
                  lg="3"
                >
                  <v-card
                    class="pa-2 d-flex align-center"
                    elevation="2"
                  >
                    <v-checkbox-btn
                      :model-value="isUserSelected(user.id_user)"
                      color="blue-darken-2"
                      density="compact"
                      class="mr-2"
                      @update:model-value="val => toggleUserSelection(user, val)"
                    />
                    <div>
                      <div class="text-sm font-weight-medium">
                        {{ user.name_frst }} {{ user.apellido_pat }}
                      </div>
                      <div class="text-xs text-grey-darken-1">
                        {{ user.email }}
                      </div>
                    </div>
                  </v-card>
                </v-col>

                <v-col
                  v-if="!personalizado.id_cargo"
                  cols="12"
                >
                  <p class="text-center text-grey-darken-1">
                    Seleccione un Cargo para cargar los usuarios disponibles.
                  </p>
                </v-col>
              </v-row>

              <v-divider class="mt-3" />
              <v-card-text class="pa-0 pt-2 text-sm font-weight-bold">
                Usuarios seleccionados: {{ personalizado.assignedUsers.length }}
              </v-card-text>
            </v-card>

            <v-btn
              v-if="!isEditing"
              color="blue-darken-3"
              class="mt-6"
              :disabled="!isStep1Valid"
              append-icon="mdi-arrow-right"
              @click="goToStep(2)"
            >
              Crear Personalizado
            </v-btn>
          </template>

          <!-- Paso 2 -->
          <template #item.2>
            <v-card-title class="text-h6 pa-0 mb-4">
              Paso 2: Definición de Actividades
            </v-card-title>

            <v-alert
              v-if="selectedPeriod"
              type="info"
              density="compact"
              variant="tonal"
              class="mb-6"
              color="red-darken-3"
            >
              <span class="font-weight-bold">Plan para:</span>
              {{ selectedPeriod.name }}
              | Proyecto: {{ selectedProject ? selectedProject.nombre_proyecto : 'N/A' }}
              | Cargo: {{ selectedCargo ? selectedCargo.nombre_cargo : 'N/A' }}
              | Usuarios Asignados: {{ personalizado.assignedUsers.length }}
            </v-alert>

            <!-- Nueva actividad -->
            <v-card
              class="pa-4 mb-8 bg-green-lighten-5"
              flat
            >
              <v-card-title class="text-subtitle-1 pa-0 mb-3">
                Agregar Nueva Actividad
              </v-card-title>

              <v-form @submit.prevent="addActivity">
                <v-row>
                  <v-col
                    cols="12"
                    sm="3"
                  >
                    <v-select
                      v-model="activityForm.periodicity"
                      :items="periodicidades"
                      label="Periodicidad *"
                      variant="outlined"
                      density="compact"
                      hide-details
                      required
                    />
                  </v-col>

                  <v-col
                    cols="12"
                    sm="3"
                  >
                    <v-select
                      v-model="personalizadoUsuarios.id_familia"
                      :items="mockFamilias"
                      item-title="name_tipo_srv"
                      item-value="id_tipo_srv"
                      label="Actividad *"
                      variant="outlined"
                      density="compact"
                      hide-details
                      required
                    />
                  </v-col>

                  <v-col
                    cols="12"
                    sm="3"
                  >
                    <v-select
                      v-model="personalizadoUsuarios.id_template"
                      :items="mockTemplates"
                      item-title="name_template_srv"
                      item-value="id_template"
                      label="Inspección *"
                      variant="outlined"
                      density="compact"
                      hide-details
                      required
                    />
                  </v-col>

                  <v-col
                    cols="12"
                    sm="3"
                  >
                    <v-text-field
                      v-model.number="activityForm.meta"
                      label="Meta (Cantidad) *"
                      type="number"
                      variant="outlined"
                      density="compact"
                      :min="1"
                      hide-details
                      required
                    />
                  </v-col>

                  <v-col
                    cols="12"
                    sm="9"
                  >
                    <v-dialog
                      v-model="isCalendarOpen"
                      max-width="600"
                      eager
                      :retain-focus="false"
                    >
                      <template #activator="{ props }">
                        <v-btn
                          v-bind="props"
                          color="green-darken-3"
                          block
                          height="40"
                          prepend-icon="mdi-calendar-range"
                        >
                          {{ selectedCalendarDates.length }} fechas seleccionadas (Meta: {{ activityForm.meta }})
                        </v-btn>
                      </template>

                      <v-card>
                        <v-card-title class="bg-red-darken-3 text-white">
                          Seleccionar Fechas ({{ selectedPeriod ? selectedPeriod.name : '' }})
                        </v-card-title>

                        <v-card-text>
                          <v-date-picker
                            v-model="selectedCalendarDates"
                            multiple
                            :min="selectedPeriod?.dateStart"
                            :max="selectedPeriod?.dateEnd"
                            show-adjacent-months
                            @update:model-value="onDatesChange"
                          >
                            <!-- Deja vacíos los encabezados -->
                            <template #header />
                            <template #title />
                          </v-date-picker>
                          <div class="mt-2 text-right text-caption">
                            Seleccionadas: {{ selectedCalendarDates.length }} / {{ activityForm.meta }}
                          </div>

                          <v-alert
                            v-if="calendarError"
                            type="error"
                            density="compact"
                            class="mt-3"
                          >
                            {{ calendarError }}
                          </v-alert>
                        </v-card-text>

                        <v-card-actions>
                          <v-spacer />
                          <v-btn
                            variant="text"
                            @click="selectedCalendarDates = []; calendarError = ''"
                          >
                            Limpiar
                          </v-btn>
                          <v-btn
                            color="red-darken-3"
                            @click="isCalendarOpen = false"
                          >
                            Cerrar
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>

                    <p class="text-caption text-grey-darken-1 mt-1 text-right">
                      Debe seleccionar exactamente la cantidad de fechas definida en la Meta.
                    </p>
                  </v-col>
                </v-row>

                <v-divider class="my-4" />

                <v-btn
                  type="submit"
                  color="green-darken-3"
                  prepend-icon="mdi-plus"
                  :disabled="!canAddActivity"
                >
                  Añadir Actividad
                </v-btn>
              </v-form>
            </v-card>

            <!-- Listado actividades -->
            <v-card-title class="text-subtitle-1 pa-0 mb-3">
              Actividades Programadas
            </v-card-title>

            <!--v-card class="pa-0" elevation="2">
              <v-list lines="two" class="pa-0">
                <template v-if="personalizado.activities.length === 0">
                  <v-list-item class="text-center text-grey-darken-1 py-6">
                    <v-list-item-title>Aún no hay actividades asignadas.</v-list-item-title>
                  </v-list-item>
                </template>

                <template v-for="act in personalizado.activities" :key="act.id_personalizado">

                  <v-list-item
                    @click="toggleAccordion(act.id_personalizado)"
                    :class="{ 'bg-red-lighten-5': expandedActivityId === act.id_personalizado }"
                    class="pa-4 border-b transition-all"
                  >
                    <v-row align="center" no-gutters>
                      <v-col cols="12" sm="5">
                        <v-list-item-title class="font-weight-bold text-red-darken-3">
                          {{ act.nombre_cliente }}
                        </v-list-item-title>
                        <v-list-item-subtitle>{{ act.nombre_cliente }}</v-list-item-subtitle>
                      </v-col>

                      <v-col cols="6" sm="2" class="d-none d-sm-block">
                        <v-chip :color="getBadgeColor(act.periodicity)" size="small" label class="mr-2">
                          {{ act.nombre_cliente }}
                        </v-chip>
                        <v-chip color="red-darken-3" size="small" label>{{ act.nombre_cliente }}</v-chip>
                      </v-col>

                      <v-col cols="6" sm="3" class="text-subtitle-2 text-grey-darken-2 d-none d-sm-block">
                        {{ act.nombre_cliente }} Fechas
                      </v-col>

                      <v-col cols="12" sm="2" class="d-flex justify-end align-center">
                        <v-btn
                          icon
                          variant="text"
                          size="small"
                          :color="expandedActivityId === act.id ? 'red-darken-3' : 'grey-darken-1'"
                          :style="{ transform: expandedActivityId === act.id ? 'rotate(180deg)' : 'rotate(0deg)' }"
                          class="transition-transform mr-2"
                        >
                          <v-icon>mdi-chevron-down</v-icon>
                        </v-btn>

                        <v-btn
                          icon
                          variant="tonal"
                          size="small"
                          color="red"
                          @click.stop="removeActivity(act.id)"
                        >
                          <v-icon>mdi-close</v-icon>
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-list-item>


                  <v-expand-transition>
                    <v-list-item v-if="expandedActivityId === act.id_personalizado" class="pa-0 bg-red-lighten-5">
                      <v-card flat class="pa-4 w-100">
                        <v-card-title class="text-subtitle-2 pa-0 mb-3 text-grey-darken-3 border-b pb-1">
                          Inspecciones Programadas ({{ act.surveys.length }})
                        </v-card-title>

                        <v-list density="compact" class="bg-transparent">
                          <v-list-item
                            v-for="survey in act.surveys"
                            :key="survey.id_survey"
                            class="pa-2 mb-2 rounded-lg bg-white elevation-1"
                          >
                            <v-row align="center" no-gutters>
                              <v-col cols="12" sm="3" class="text-caption font-weight-bold">
                                Fecha: {{ survey.fecha_plan_ini }}
                              </v-col>
                              <v-col cols="12" sm="4" class="text-caption text-grey-darken-2">
                                ID: <span class="font-weight-black">{{ survey.id_survey }}</span>
                              </v-col>
                              <v-col cols="6" sm="3">
                                <v-chip :color="getSurveyStatusColor(survey.status)" size="small" label class="font-weight-bold">
                                  {{ survey.fecha_plan_ini }}
                                </v-chip>
                              </v-col>
                              <v-col cols="6" sm="2" class="text-right">
                                <v-btn
                                  :href="survey.pdf_url"
                                  target="_blank"
                                  icon
                                  variant="text"
                                  size="small"
                                  color="red-darken-3"
                                  title="Ver PDF"
                                >
                                  <v-icon>mdi-file-pdf-box</v-icon>
                                </v-btn>
                              </v-col>
                            </v-row>
                          </v-list-item>
                        </v-list>
                      </v-card>
                    </v-list-item>
                  </v-expand-transition>
                </template>
              </v-list>
            </v-card>

            <v-divider class="my-6" /-->

            <v-card
              class="pa-0"
              elevation="2"
            >
              <v-list
                class="pa-0"
                lines="two"
              >
                <!-- vacío -->
                <template v-if="!personalizado.resumen || !personalizado.resumen.actividades || personalizado.resumen.actividades.length === 0">
                  <v-list-item class="text-center text-grey-darken-1 py-6">
                    <v-list-item-title>No hay actividades para mostrar.</v-list-item-title>
                  </v-list-item>
                </template>

                <!-- ACTIVIDAD -->
                <template v-else>
                  <v-list-subheader class="text-subtitle-1 font-weight-bold">
                    Resumen por Actividad y Usuario
                  </v-list-subheader>

                  <!-- nivel 1: actividades -->
                  <template
                    v-for="a in personalizado.resumen.actividades"
                    :key="a.actividad"
                  >
                    <v-list-item
                      class="pa-4 border-b transition-all"
                      :class="{ 'bg-red-lighten-5': expandedAct === a.actividad }"
                      @click="toggleAct(a.actividad)"
                    >
                      <v-row
                        no-gutters
                        class="w-100"
                      >
                        <v-col
                          cols="12"
                          md="6"
                        >
                          <div class="font-weight-bold">
                            {{ a.actividad }}
                          </div>
                          <div class="text-caption text-grey-darken-1">
                            Programadas: {{ a.programadas }} · Terminadas: {{ a.terminadas }} · Atrasadas: {{ a.atrasadas }}
                          </div>
                        </v-col>
                        <v-col
                          cols="12"
                          md="6"
                          class="d-flex align-center"
                        >
                          <v-progress-linear
                            :model-value="a.avancePct"
                            :color="getProgressColor(a.avancePct)"
                            height="10"
                            rounded
                            class="w-100 mr-3"
                          />
                          <div class="text-subtitle-2 font-weight-bold">
                            {{ a.avancePct }}%
                          </div>
                          <v-btn
                            icon
                            variant="text"
                            size="small"
                            class="ml-2"
                            :color="expandedAct === a.actividad ? 'red-darken-3' : 'grey-darken-1'"
                            :style="{ transform: expandedAct === a.actividad ? 'rotate(180deg)' : 'rotate(0deg)' }"
                          >
                            <v-icon>mdi-chevron-down</v-icon>
                          </v-btn>
                        </v-col>
                      </v-row>
                    </v-list-item>

                    <!-- nivel 2: usuarios dentro de la actividad -->
                    <v-expand-transition>
                      <div
                        v-if="expandedAct === a.actividad"
                        class="bg-red-lighten-5"
                      >
                        <v-list class="bg-transparent">
                          <template
                            v-for="u in a.usuarios"
                            :key="a.actividad + '::' + u.id_user"
                          >
                            <v-list-item
                              class="pa-4 border-b"
                              @click="toggleActUser(a.actividad, u.id_user)"
                            >
                              <v-row
                                align="center"
                                no-gutters
                              >
                                <v-col
                                  cols="12"
                                  md="6"
                                >
                                  <div class="font-weight-bold text-red-darken-3">
                                    {{ u.nombre_user }}
                                  </div>
                                  <div class="text-caption text-grey-darken-1">
                                    {{ selectedProject ? selectedProject.nombre_proyecto : 'Proyecto' }} ·
                                    {{ selectedRole ? selectedRole.name_rol : 'Rol' }}
                                  </div>
                                </v-col>
                                <v-col
                                  cols="12"
                                  md="6"
                                  class="d-flex align-center"
                                >
                                  <v-progress-linear
                                    :model-value="u.avancePct"
                                    :color="getProgressColor(u.avancePct)"
                                    height="8"
                                    rounded
                                    class="w-100 mr-3"
                                  />
                                  <div class="text-subtitle-2 font-weight-bold">
                                    {{ u.avancePct }}%
                                  </div>
                                  <v-btn
                                    icon
                                    variant="text"
                                    size="small"
                                    class="ml-2"
                                    :color="expandedActUserKey === (a.actividad + '::' + u.id_user) ? 'red-darken-3' : 'grey-darken-1'"
                                    :style="{ transform: expandedActUserKey === (a.actividad + '::' + u.id_user) ? 'rotate(180deg)' : 'rotate(0deg)' }"
                                  >
                                    <v-icon>mdi-chevron-down</v-icon>
                                  </v-btn>
                                </v-col>
                              </v-row>
                            </v-list-item>

                            <!-- nivel 3: surveys del usuario para esta actividad -->
                            <v-expand-transition>
                              <div
                                v-if="expandedActUserKey === (a.actividad + '::' + u.id_user)"
                                class="px-4 pb-4 bg-red-lighten-5"
                              >
                                <v-list
                                  density="compact"
                                  class="bg-transparent"
                                >
                                  <v-list-item
                                    v-for="s in u.surveys"
                                    :key="s.id_survey"
                                    class="pa-2 mb-2 rounded-lg bg-white elevation-1"
                                  >
                                    <v-row
                                      align="center"
                                      no-gutters
                                    >
                                      <v-col
                                        cols="12"
                                        sm="3"
                                        class="text-caption font-weight-bold"
                                      >
                                        ID: {{ s.id_survey }}
                                      </v-col>
                                      <v-col
                                        cols="12"
                                        sm="4"
                                        class="text-caption"
                                      >
                                        Plan: {{ s.fecha_plan || '—' }} · Real: {{ s.fecha_real || '—' }}
                                      </v-col>
                                      <v-col
                                        cols="6"
                                        sm="3"
                                      >
                                        <v-chip
                                          :color="getSurveyStatusColor(s.estado)"
                                          size="small"
                                          label
                                          class="font-weight-bold"
                                        >
                                          {{ s.estado || '—' }}
                                        </v-chip>
                                      </v-col>
                                      <v-col
                                        cols="6"
                                        sm="2"
                                        class="text-right"
                                      >
                                        <v-btn
                                          :href="s.pdf ? ('/archivo/terracon/' + s.pdf) : undefined"
                                          :disabled="!s.pdf"
                                          target="_blank"
                                          icon
                                          variant="text"
                                          size="small"
                                          color="red-darken-3"
                                          title="Ver PDF"
                                        >
                                          <v-icon>mdi-file-pdf-box</v-icon>
                                        </v-btn>
                                      </v-col>
                                    </v-row>
                                  </v-list-item>
                                </v-list>
                              </div>
                            </v-expand-transition>
                          </template>
                        </v-list>
                      </div>
                    </v-expand-transition>
                  </template>
                </template>
              </v-list>
            </v-card>

            <v-divider class="my-6" />

            <div class="d-flex justify-space-between">
              <!--
              <v-btn
                color="grey-darken-1"
                variant="tonal"
                prepend-icon="mdi-arrow-left"
                @click="goToStep(1)"
              >
                Volver a Definición
              </v-btn>
              -->
              <!--v-btn
                color="blue-darken-3"
                @click="savePersonalizado"
                :disabled="personalizado.activities.length === 0"
                prepend-icon="mdi-content-save-check"
            -->
              <!--v-btn
                color="blue-darken-3"
                @click="savePersonalizado"
                prepend-icon="mdi-content-save-check"
              >
                Finalizar y Guardar Plan
              </v-btn-->
            </div>
          </template>
          <template #actions="{ next, prev, isNextDisabled, isPrevDisabled }">
            <div class="d-flex justify-space-between mt-4">
              <!-- ANTERIOR: solo visible en el paso 2 -->
              <v-btn
                v-if="currentStep !== 1"
                variant="tonal"
                color="grey-darken-1"
                :disabled="isPrevDisabled"
                @click="goToStep(1)"
              >
                ANTERIOR
              </v-btn>

              <!-- pequeño espacio cuando no hay botón anterior -->
              <div v-else />

              <!-- SIGUIENTE: solo visible en el paso 1 -->
              <v-btn
                v-if="currentStep !== 2 && isEditing"
                color="blue-darken-3"
                :disabled="isNextDisabled"
                @click="onStepperNext(next)"
              >
                SIGUIENTE
              </v-btn>
            </div>
          </template>
        </v-stepper>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import apiAxios from '@/services/api';
import { useUserDetailStore } from "@/stores/userDetail";
// 👇 importa el date-picker de Vuetify Labs
//import { VDatePicker } from 'vuetify/labs/VDatePicker'

const emit = defineEmits(['guardado', 'cerrar']);

const userDetailStore = useUserDetailStore()
const mockPeriodos = ref([]);
const mockClientes = ref([]);
const mockProyectos = ref([]);
const allMockUsuarios = ref([]);
const allMockUsuariosFiltrados = ref([]);
const roles = ref([]);
const cargos = ref([]);
const usuariosRoles = ref([]);
const mockFamilias = ref([]);
const mockTemplates = ref([]);
const templatesSurvey = ref([]);
const templatesPorFamiliaCache = new Map();
const tablaPersonalizados = ref([]);
const tablaActividadesSurvey = ref([]);

const currentStep = ref(1)
const activityForm = ref({
  activityType: 'No bloqueante',
  inspection: '',
  meta: 1,
  periodicity: '',
})

const selectedCalendarDates = ref([]) // ['YYYY-MM-DD', ...]
const isCalendarOpen = ref(false)
const calendarError = ref('')
const expandedActivityId = ref(null)

const expandedAct = ref(null)
const expandedActUserKey = ref(null)
const toggleAct = (actividad) => { expandedAct.value = expandedAct.value === actividad ? null : actividad }
const toggleActUser = (actividad, idUser) => {
  const key = `${actividad}::${idUser}`
  expandedActUserKey.value = expandedActUserKey.value === key ? null : key
}

const getInitialPersonalizado = () => ({
  id_personalizado: null,
  id_empresa: 2,
  id_empresa_cliente: null,
  periodo: null,
  id_proyecto: null,
  id_rol: null,
  id_cargo: null,
  assignedUsers: [],
  activities: [],
  isComplete: false,
  id_user_creacion: userDetailStore.userDetail.id_user,
  resumen: null,
});

const personalizado = ref(getInitialPersonalizado());

// 👇 Función para limpiar estados secundarios
const resetSecondaryState = () => {
    currentStep.value = 1
    activityForm.value = { activityType: 'No bloqueante', inspection: '', meta: 1, periodicity: '' }
    personalizadoUsuarios.value = { id_familia: null, id_template: null }
    selectedCalendarDates.value = []
    isCalendarOpen.value = false
    expandedActivityId.value = null
}

const personalizadoUsuarios = ref({
  id_familia: null,
  id_template: null,
})

const isHydratingEdit = ref(false)

// Expand control
const expandedUserId = ref(null)            // usuario abierto
const expandedUAKey = ref(null)             // clave "userId::actividad" abierta

const toggleUser = (uid) => {
  expandedUserId.value = expandedUserId.value === uid ? null : uid
  // cuando cambias de usuario, colapsa la actividad abierta
  expandedUAKey.value = null
}

const toggleUA = (uid, actividad) => {
  const key = `${uid}::${actividad}`
  expandedUAKey.value = expandedUAKey.value === key ? null : key
}

// Color de progreso (ajústalo a tu gusto)
const getProgressColor = (pct) => {
  if (pct >= 90) return 'green-darken-2'
  if (pct >= 60) return 'light-green-darken-2'
  if (pct >= 30) return 'amber-darken-2'
  return 'red-darken-2'
}

onMounted(async () => {
  await obtenerPeriodos();
  await obtenerClientes();
  //await obtenerProyectos();
  await obtenerRoles();
  await obtenerCargos();
  await obtenerUsuarioRoles();
  await obtenerUsuarios();
  await obtenerFamilias();
  await obtenerPersonalizados();
  await obtenerActividadesSurvey();
})

const onStepperNext = async (next) => {
  // Si vas a pasar del Paso 1 al 2, valida y crea el personalizado
  if(!isEditing.value){
    if (currentStep.value === 1) {
      if (!isStep1Valid.value) {
        showFeedbackMessage('Debe completar Periodo, Proyecto, Cargo y al menos un Usuario.', 'error')
        return
      }
      const created = await postProgramaPersonalizado()
      if (!created) return
      emit('guardado', { id_personalizado: personalizado.value.id_personalizado, action: 'created-or-ensured' });
    }
  }
  next()
}

// 👇 ADD: recibe el row desde el padre
const props = defineProps({
  // el padre te pasa el row completo del personalizado (o null si creas uno nuevo)
  personalizado: { type: Object, default: null }
})

const isEditing = computed(() =>
  Boolean(props.personalizado?.id_personalizado ?? props.personalizado?.id ?? personalizado.value.id_personalizado)
)

// 👇 helper para clonar seguro
const deepClone = (obj) => JSON.parse(JSON.stringify(obj || {}))

const lastLoadedPid = ref(null)

// 👇 ADD: cuando llega un row desde el padre, inyecta los valores sobre tu estado local
watch(
  () => props.personalizado,
  async (val) => {
    // 1) MODO CREACIÓN
    if (!val || Object.keys(val).length === 0) {
      personalizado.value = getInitialPersonalizado()
      resetSecondaryState()
      currentStep.value = 1
      return
    }

    const incoming = deepClone(val)

    const pid = Number(incoming.id_personalizado ?? incoming.id ?? null)

    // ⛔ evita recargar el mismo personalizado varias veces
    if (pid && lastLoadedPid.value === pid) return
    lastLoadedPid.value = pid

    // 🔒 evitar que el watch de id_empresa_cliente borre id_proyecto durante hidratación
    isHydratingEdit.value = true

    // 🔹 Normaliza ids entrantes
    const incomingIdPersonalizado = Number(incoming.id_personalizado ?? incoming.id ?? null) || null
    const incomingPeriodo = incoming.periodo ?? null
    const incomingCliente = Number(incoming.id_empresa_cliente ?? incoming.id_cliente ?? null) || null
    const incomingProyecto = Number(incoming.id_proyecto ?? null) || null
    const incomingRol = Number(incoming.id_rol ?? null) || null
    const incomingCargo = Number(incoming.id_cargo ?? null) || null

    // 2) Primero setea cliente (sin reventar proyecto) y carga proyectos del cliente
    //    (no uses el spread completo aquí porque puede pisar cosas con null)
    personalizado.value.id_personalizado = incomingIdPersonalizado
    personalizado.value.periodo = incomingPeriodo
    personalizado.value.id_empresa_cliente = incomingCliente

    if (incomingCliente) {
      await obtenerProyectos(incomingCliente) // 👈 clave: cargar items antes
    } else {
      mockProyectos.value = []
    }

    // 3) Ahora sí setea proyecto/rol (ya con items cargados)
    personalizado.value.id_proyecto = incomingProyecto
    personalizado.value.id_rol = incomingRol
    personalizado.value.id_cargo = incomingCargo

    isHydratingEdit.value = false

    // ==========================
    // Lo que ya tenías (igual)
    // ==========================
    await obtenerPersonalizados()
    await obtenerActividadesSurvey()
    console.log(tablaActividadesSurvey.value)
    console.log(tablaPersonalizados.value)

    // 1) Saca todos los id_user únicos desde la tabla de actividades
    const userIds = new Set(
      (tablaActividadesSurvey.value ?? [])
        .filter(a => Number(a.id_personalizado) === pid && a.id_user != null)
        .map(a => Number(a.id_user))
    )

    // 3) Pobla assignedUsers con los objetos de usuario completos
    personalizado.value.assignedUsers = (allMockUsuarios.value ?? [])
      .filter(u => userIds.has(Number(u.id_user)))

    const users = Array.isArray(personalizado.value.assignedUsers)
      ? new Set(personalizado.value.assignedUsers.map(u => Number(u.id_user)))
      : new Set()

    const tablaPer = Array.isArray(tablaPersonalizados.value)
      ? tablaPersonalizados.value.filter(per => Number(per.id_personalizado) === pid)
      : []

    const tablaAct = Array.isArray(tablaActividadesSurvey.value)
      ? tablaActividadesSurvey.value.filter(act =>
          Number(act.id_personalizado) === pid && users.has(Number(act.id_user))
        )
      : []

    console.log('tablaPer', tablaPer[0])
    console.log('tablaAct', tablaAct)

    if (tablaPer.length === 0) {
      console.warn('No hay personalizados que coincidan')
      return
    }

    // asegura surveys en el objeto
    tablaPer[0].surveys = tablaAct

    const idx = tablaPersonalizados.value.findIndex(p => Number(p.id_personalizado) === pid)
    if (idx !== -1) {
      tablaPersonalizados.value[idx] = {
        ...tablaPersonalizados.value[idx],
        surveys: tablaAct
      }
    }

    // ⚠️ evita duplicar si re-abres el mismo personalizado
    personalizado.value.activities = []
    personalizado.value.activities = []

    if (tablaPer[0]) {
      personalizado.value.activities = [{
        ...tablaPer[0],
        surveys: tablaAct
      }]
    }
    const resumen = buildResumenPersonalizado(tablaPer[0], tablaAct)
    console.log(resumen)
    personalizado.value.resumen = resumen
  },
  { immediate: true }
)

// Regla de estados (ajústala a tu negocio):
const isTerminada = (s) =>
  (s.estado_srv && s.estado_srv.toLowerCase().includes('termin')) || !!s.fecha_real_fin;

const isAtrasada = (s, hoy) =>
  !isTerminada(s) && s.fecha_plan_ini && s.fecha_plan_ini < hoy; // YYYY-MM-DD

function buildResumenPersonalizado(tablaPer0, tablaAct, hoyStr = new Date().toISOString().slice(0,10)) {
  const base = {
    id_personalizado: Number(tablaPer0.id_personalizado),
    periodo: tablaPer0.periodo,
    cliente: { id: Number(tablaPer0.id_empresa_cliente), nombre: tablaPer0.nombre_cliente },
    proyecto: { id: Number(tablaPer0.id_proyecto), nombre: tablaPer0.nombre_proyecto },
    rol: { id: Number(tablaPer0.id_rol), nombre: tablaPer0.name_rol },
    usuarios: [],
    actividades: []   // 👈 NUEVO
  };

  // helpers
  const isTerminada = (s) =>
    (s.estado_srv && s.estado_srv.toLowerCase().includes('termin')) || !!s.fecha_real_fin;
  const isAtrasada = (s, hoy) => !isTerminada(s) && s.fecha_plan_ini && s.fecha_plan_ini < hoy;

  // --- índices de agregación ---
  const byUser = new Map(); // uid -> { id_user, nombre_user, actividades: Map(nombre -> {...}) }
  const byAct  = new Map(); // actNombre -> { actividad, programadas, terminadas, atrasadas, usuarios: [] (luego), _users: Map(uid -> {...}) }

  for (const s of (tablaAct || []).filter(a => Number(a.id_personalizado) === base.id_personalizado)) {
    const uid = Number(s.id_user);
    const uname = s.nombre_user;
    const actName = s.name_template_srv;

    // ====== Aggregación por USUARIO -> ACTIVIDAD ======
    if (!byUser.has(uid)) {
      byUser.set(uid, { id_user: uid, nombre_user: uname, actividades: new Map() });
    }
    const u = byUser.get(uid);
    if (!u.actividades.has(actName)) {
      u.actividades.set(actName, { actividad: actName, programadas: 0, terminadas: 0, atrasadas: 0, surveys: [] });
    }
    const actU = u.actividades.get(actName);
    actU.surveys.push({
      id_survey: Number(s.id_survey),
      fecha_plan: s.fecha_plan_ini || null,
      fecha_real: s.fecha_real_fin || null,
      estado: s.estado_srv || null,
      pdf: s.id_doc ? s.id_doc : null
    });
    actU.programadas += 1;
    if (isTerminada(s)) actU.terminadas += 1;
    else if (isAtrasada(s, hoyStr)) actU.atrasadas += 1;

    // ====== Aggregación por ACTIVIDAD -> USUARIO ======
    if (!byAct.has(actName)) {
      byAct.set(actName, {
        actividad: actName,
        programadas: 0,
        terminadas: 0,
        atrasadas: 0,
        _users: new Map() // uid -> { id_user, nombre_user, avancePct, surveys[] }
      });
    }
    const a = byAct.get(actName);
    a.programadas += 1;
    if (isTerminada(s)) a.terminadas += 1;
    else if (isAtrasada(s, hoyStr)) a.atrasadas += 1;

    if (!a._users.has(uid)) {
      a._users.set(uid, { id_user: uid, nombre_user: uname, surveys: [] });
    }
    a._users.get(uid).surveys.push({
      id_survey: Number(s.id_survey),
      fecha_plan: s.fecha_plan_ini || null,
      fecha_real: s.fecha_real_fin || null,
      estado: s.estado_srv || null,
      pdf: s.id_doc ? s.id_doc : null
    });
  }

  // --- salida: USUARIOS ---
  for (const [, u] of byUser) {
    const acts = [];
    for (const [, a] of u.actividades) {
      a.surveys.sort((x, y) => String(x.fecha_plan).localeCompare(String(y.fecha_plan)));
      const avancePct = a.programadas ? Math.round((a.terminadas / a.programadas) * 100) : 0;
      acts.push({ ...a, avancePct });
    }
    acts.sort((x, y) => x.actividad.localeCompare(y.actividad));
    base.usuarios.push({ id_user: u.id_user, nombre_user: u.nombre_user, actividades: acts });
  }
  base.usuarios.sort((a, b) => a.nombre_user.localeCompare(b.nombre_user));

  // --- salida: ACTIVIDADES ---
  for (const [, a] of byAct) {
    // calcula avance global de la actividad
    const avancePct = a.programadas ? Math.round((a.terminadas / a.programadas) * 100) : 0;

    // arma usuarios dentro de esta actividad
    const usuarios = [];
    for (const [, uu] of a._users) {
      uu.surveys.sort((x, y) => String(x.fecha_plan).localeCompare(String(y.fecha_plan)));
      // si quieres un avance por usuario, estimación simple:
      const programadasU = uu.surveys.length;
      const terminadasU  = uu.surveys.filter(sv => (sv.estado || '').toLowerCase().includes('termin') || sv.fecha_real).length;
      const avancePctU   = programadasU ? Math.round((terminadasU / programadasU) * 100) : 0;
      usuarios.push({ ...uu, avancePct: avancePctU });
    }
    usuarios.sort((x, y) => x.nombre_user.localeCompare(y.nombre_user));

    base.actividades.push({
      actividad: a.actividad,
      programadas: a.programadas,
      terminadas: a.terminadas,
      atrasadas: a.atrasadas,
      avancePct,
      usuarios
    });
  }
  base.actividades.sort((x, y) => x.actividad.localeCompare(y.actividad));

  return base;
}

/* ===========================
   Mock data (puedes reemplazar por API)
   =========================== */
async function obtenerActividadesSurvey(){
try {
    const response = await apiAxios.get('/servicio/leanglobal/obtenerActividadesSurvey');
    tablaActividadesSurvey.value = response.data;
  } catch (err) {
    console.error(err);
  }
}

async function obtenerPersonalizados(){
try {
    const response = await apiAxios.get('/servicio/leanglobal/seguridad/obtenerPersonalizados');
    tablaPersonalizados.value = response.data.datos;
  } catch (err) {
    console.error(err);
  }
}

async function obtenerFamilias(){
  try {
    const response = await apiAxios.get('/servicio/leanglobal/obtenerFamilias?id_area=2&flag_personalizado=true');
    const familias = Array.isArray(response.data) ? response.data : []

    const ordenadas = [...familias].sort((a, b) =>
      String(a?.name_tipo_srv ?? '').localeCompare(String(b?.name_tipo_srv ?? ''), 'es', { sensitivity: 'base' })
    )

    const familiasConInspecciones = await Promise.all(
      ordenadas.map(async (familia) => {
        try {
          const templates = await obtenerTemplatesDeFamilia(familia?.id_tipo_srv)
          return templates.length > 0 ? familia : null
        } catch (err) {
          console.error('Error validando inspecciones de actividad:', familia?.id_tipo_srv, err)
          return null
        }
      })
    )

    mockFamilias.value = familiasConInspecciones.filter(Boolean)

    if (
      personalizadoUsuarios.value.id_familia &&
      !mockFamilias.value.some(f => Number(f.id_tipo_srv) === Number(personalizadoUsuarios.value.id_familia))
    ) {
      personalizadoUsuarios.value.id_familia = null
      personalizadoUsuarios.value.id_template = null
      mockTemplates.value = []
    }
  } catch (err) {
    console.error(err);
  }
};

watch(
  () => personalizadoUsuarios.value.id_familia,
  (nuevoTipo) => {
    if (nuevoTipo) {
      personalizadoUsuarios.value.id_template = null
      obtenerTemplates(nuevoTipo)
    } else {
      mockTemplates.value = []
      personalizadoUsuarios.value.id_template = null
    }
  }
)

async function obtenerTemplates(id_tipo_srv){
  try {
    mockTemplates.value = await obtenerTemplatesDeFamilia(id_tipo_srv)
  } catch (err) {
    console.error(err);
  }
};

async function obtenerTemplatesDeFamilia(id_tipo_srv) {
  const key = Number(id_tipo_srv)
  if (!key) return []

  if (templatesPorFamiliaCache.has(key)) {
    return templatesPorFamiliaCache.get(key)
  }

  const response = await apiAxios.get(`/servicio/leanglobal/obtenerTemplates?id_tipo_srv=${id_tipo_srv}`)
  const templates = Array.isArray(response.data) ? response.data : []
  const ordenados = [...templates].sort((a, b) =>
    String(a?.name_template_srv ?? '').localeCompare(String(b?.name_template_srv ?? ''), 'es', { sensitivity: 'base' })
  )

  templatesPorFamiliaCache.set(key, ordenados)
  return ordenados
}

async function obtenerClientes(){
  try {
    const response = await apiAxios.get('/servicio/leanglobal/obtenerEmpresas');
    const empresas = Array.isArray(response.data) ? response.data : []
    mockClientes.value = empresas.filter(
      e => !(e.flag_externo === true || e.flag_externo === 1 || e.flag_externo === '1' || e.flag_externo === 't' || e.flag_externo === 'true')
    )
    console.log(mockClientes.value)
  } catch (err) {
    console.error(err);
  }
};

async function obtenerUsuarios(){
  try {
    const response = await apiAxios.get('/servicio/leanglobal/obtenerUsuarios');
    const usuarios = Array.isArray(response.data) ? response.data : []
    allMockUsuarios.value = usuarios.filter(isTerraconUser)
  } catch (err) {
    console.error(err);
  }
}

async function obtenerUsuarioRoles(){
  try {
    const response = await apiAxios.get('/servicio/leanglobal/obtenerUsuariosRoles');
    usuariosRoles.value = response.data;
  } catch (err) {
    console.error(err);
  }
}

async function obtenerPeriodos(){
  try {
    const response = await apiAxios.get('/servicio/leanglobal/obtenerPeriodos');
    const periodos = response.data?.datos || response.data || [];
    mockPeriodos.value = periodos.filter(
      (p) => String(p?.estado || '').trim().toLowerCase() === 'abierto'
    );
    console.log("mockPeriodos.value", mockPeriodos.value);
  } catch (err) {
    console.error(err);
  }
}

async function obtenerRoles(){
  try {
    const response = await apiAxios.get('/servicio/leanglobal/obtenerRoles');
    roles.value = response.data;
  } catch (err) {
    console.error(err);
  }
}

async function obtenerCargos(){
  try {
    const response = await apiAxios.get('/servicio/leanglobal/obtenerCargos');
    cargos.value = response.data;
  } catch (err) {
    console.error(err);
  }
}

watch(
  () => personalizado.value?.id_empresa_cliente ?? null,
  async (nuevoCliente, oldCliente) => {
    if (isHydratingEdit.value) return

    // solo si cambió de verdad
    if (Number(nuevoCliente) !== Number(oldCliente)) {
      personalizado.value.id_proyecto = null
      mockProyectos.value = []
    }

    if (nuevoCliente) {
      await obtenerProyectos(nuevoCliente)
    }
  }
)

async function obtenerProyectos(idCliente) {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerProyectos?id_empresa_cliente=' + (idCliente || ''))
    mockProyectos.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('Error al obtener proyectos:', err)
    mockProyectos.value = []
  }
}

const periodicidades = ['Diaria', 'Semanal', 'Quincenal', 'Mensual', 'Calendario']
const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

/* ===========================
   Utils fechas (sin Moment)
   =========================== */
const pad2 = n => String(n).padStart(2, '0')
const toDateStr = d => `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`
const fromISO = (s) => {
  const [y,m,d] = s.split('-').map(Number)
  return new Date(y, m-1, d)
}

/* ===========================
   Toast sencillo
   =========================== */
const toasts = reactive([])
const showFeedbackMessage = (message, type='success') => {
  const id = Date.now() + Math.random()
  toasts.unshift({ id, message, type, open: true })
  setTimeout(() => {
    const i = toasts.findIndex(t => t.id === id)
    if (i > -1) toasts.splice(i, 1)
  }, 2700)
}

/* ===========================
   Estado principal
   =========================== */



/* ===========================
   Computed
   =========================== */
const selectedPeriod = computed(() => {
  const raw = mockPeriodos.value?.find(p => p.periodo === personalizado.value.periodo)
  console.log("selectedPeriod raw", raw);
  if (!raw) return null
  return {
    name: raw.periodo,
    // Usa tus defaults o los campos reales del API:
    dateStart: raw.dateStart || raw.date_start || raw.fecha_ini,
    dateEnd:   raw.dateEnd   || raw.date_end   || raw.fecha_fin,
    //dateStart: '2025-10-01',
    //dateEnd: '2025-10-31',
  }
})

const selectedProject = computed(() =>
  mockProyectos.value.find(p => p.id_proyecto === personalizado.value.id_proyecto)
)

const selectedClient = computed(() =>
  mockClientes.value.find(c => Number(c.id_empresa) === Number(personalizado.value.id_empresa_cliente))
)

const selectedRole = computed(() =>
  roles.value.find(p => p.id_rol === personalizado.value.id_rol)
)

const selectedCargo = computed(() =>
  cargos.value.find(c => Number(c.id_cargo) === Number(personalizado.value.id_cargo))
)

const isStep1Valid = computed(() =>
  !!personalizado.value.periodo &&
  !!personalizado.value.id_proyecto &&
  !!personalizado.value.id_cargo &&
  personalizado.value.assignedUsers.length > 0
)

const hasSelectedUsers = computed(() =>
  personalizado.value.assignedUsers.length > 0
)

const resolveRoleIdFromCargo = (cargoId) => {
  const cid = Number(cargoId)
  if (!cid) return null

  const selectedCargoItem = (cargos.value ?? []).find(c => Number(c.id_cargo) === cid)
  if (!selectedCargoItem) return null

  const roleCandidates = [
    selectedCargoItem.id_rol,
    selectedCargoItem.idRol,
    selectedCargoItem.rol_id,
    selectedCargoItem.id_role
  ]

  for (const candidate of roleCandidates) {
    const rid = Number(candidate)
    if (Number.isFinite(rid) && rid > 0) return rid
  }

  return null
}

const resolveRoleIdFromFirstSelectedUser = () => {
  const firstUser = (personalizado.value.assignedUsers ?? [])[0]
  const firstUserId = Number(firstUser?.id_user ?? firstUser?.id)
  if (!Number.isFinite(firstUserId)) return null

  const roleRow = (usuariosRoles.value ?? []).find(r => Number(r.id_user) === firstUserId)
  const roleId = Number(roleRow?.id_rol)
  return Number.isFinite(roleId) && roleId > 0 ? roleId : null
}

const canAddActivity = computed(() =>
  !!activityForm.value.periodicity &&
  !!personalizadoUsuarios.value.id_familia &&
  !!personalizadoUsuarios.value.id_template &&
  Number(activityForm.value.meta) > 0 &&
  selectedCalendarDates.value.length === Number(activityForm.value.meta)
)

/* ===========================
   Métodos
   =========================== */
const goToStep = async (step) => {
  if (step === 2 && !isStep1Valid.value) {
    showFeedbackMessage('Debe completar Periodo, Proyecto, Cargo y al menos un Usuario.', 'error')
    return
  }
  if(step === 2){
    console.log("personalizado", personalizado.value);
    const created = await postProgramaPersonalizado();
    if (!created) return
  }
  currentStep.value = step
}

function normalizeText(v) {
  return String(v ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

function isTerraconUser(user) {
  const idEmpresa = Number(user?.id_empresa ?? user?.id_empresa_usuario ?? user?.empresa_id ?? null)
  if (idEmpresa === 2) return true

  const empresaNombre = normalizeText(user?.name_empresa ?? user?.nombre_empresa ?? user?.empresa ?? '')
  if (empresaNombre.includes('terracon')) return true

  const email = String(user?.email ?? user?.correo ?? '').trim().toLowerCase()
  return email.endsWith('@terracon.cl')
}

function parseUserJsonData(user) {
  const raw = user?.json_data
  if (!raw) return {}
  if (typeof raw === 'object') return raw
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw)
    } catch {
      return {}
    }
  }
  return {}
}

function matchesUserByCargo(user, selectedCargoItem) {
  if (!selectedCargoItem) return false

  const json = parseUserJsonData(user)

  const selectedIdCargo = Number(selectedCargoItem?.id_cargo ?? NaN)
  const selectedNombreCargo = normalizeText(selectedCargoItem?.nombre_cargo ?? '')

  const userIdCargo = Number(json?.idCargo ?? json?.id_cargo ?? NaN)
  const userNombreCargo = normalizeText(json?.cargo ?? json?.nombre_cargo ?? '')

  const matchById = Number.isFinite(selectedIdCargo) && Number.isFinite(userIdCargo) && selectedIdCargo === userIdCargo
  const matchByNombre = !!selectedNombreCargo && !!userNombreCargo && selectedNombreCargo === userNombreCargo

  return matchById || matchByNombre
}

// 1) Helper centralizado
function refreshCargoUsers (cargoId) {
  const cid = Number(cargoId)
  if (!cid) {
    allMockUsuariosFiltrados.value = []
    return
  }

  const selectedCargoItem = (cargos.value ?? []).find(c => Number(c.id_cargo) === cid)
  if (!selectedCargoItem) {
    allMockUsuariosFiltrados.value = []
    return
  }

  // todos los usuarios que cumplen por idCargo o cargo en json_data
  const filtrados = (allMockUsuarios.value ?? []).filter(
    u => isTerraconUser(u) && matchesUserByCargo(u, selectedCargoItem)
  )
  allMockUsuariosFiltrados.value = filtrados

  //  🧹 depura los seleccionados que ya no están en el cargo
  if (Array.isArray(personalizado.value.assignedUsers)) {
    const validIds = new Set(filtrados.map(u => Number(u.id_user)))
    personalizado.value.assignedUsers = personalizado.value.assignedUsers.filter(
      u => validIds.has(Number(u.id_user ?? u.id))
    )
  }
}

// 2) Watch que cubre “editar” y datos que llegan asíncronos
watch(
  [() => personalizado.value.id_cargo, cargos, usuariosRoles, allMockUsuarios],
  () => {
    refreshCargoUsers(personalizado.value.id_cargo)
  },
  { immediate: true }  // ejecuta al montar, útil en modo editar
)

// 3) Llama también desde tu updatePlan cuando cambie id_rol
const updatePlan = (field, value) => {
  const finalValue = field === 'periodo' ? value : (field.startsWith('id_') ? Number(value) : value)
  personalizado.value[field] = finalValue

  if (field === 'id_proyecto') {
    personalizado.value.id_rol = null
    personalizado.value.id_cargo = null
    personalizado.value.assignedUsers = []
    allMockUsuariosFiltrados.value = []
  }

  if (field === 'id_cargo') {
    if (!personalizado.value.id_rol) {
      const derivedRoleId = resolveRoleIdFromCargo(finalValue)
      if (derivedRoleId) {
        personalizado.value.id_rol = derivedRoleId
      }
    }

    // si quieres limpiar siempre al cambiar cargo:
    // personalizado.value.assignedUsers = []
    refreshCargoUsers(finalValue)  // 👈 recalcula disponibles
  }

  if (field === 'periodo') {
    selectedCalendarDates.value = []
    isCalendarOpen.value = false
  }
}

// (opcional) asegura tipos también aquí:
const isUserSelected = (id) =>
  personalizado.value.assignedUsers.some(u => Number(u.id_user ?? u.id) === Number(id))

const toggleUserSelection = (user, checked) => {
  const id = Number(user.id_user ?? user.id)
  const idx = personalizado.value.assignedUsers.findIndex(u => Number(u.id_user ?? u.id) === id)
  if (checked && idx === -1) {
    personalizado.value.assignedUsers.push(user)
  } else if (!checked && idx > -1) {
    personalizado.value.assignedUsers.splice(idx, 1)
  }
}

/* ========= v-date-picker: control de múltiple y tope por meta ========= */
const onDatesChange = (val) => {
  if (Array.isArray(val)) {
    if (val.length > activityForm.value.meta) {
      showFeedbackMessage(`Solo puedes elegir ${activityForm.value.meta} fecha(s).`, 'error')
      val = val.slice(0, activityForm.value.meta)
    }
    selectedCalendarDates.value = [...val].sort()
    calendarError.value =
      selectedCalendarDates.value.length !== activityForm.value.meta
        ? `Debe seleccionar exactamente ${activityForm.value.meta} fechas.`
        : ''
  }
}

const handleDateClick = (dateStr) => {
  // (ya no se usa con v-date-picker, lo dejo si lo referencias en otra parte)
  const meta = activityForm.value.meta
  const i = selectedCalendarDates.value.indexOf(dateStr)
  if (i > -1) {
    selectedCalendarDates.value.splice(i, 1)
  } else {
    if (selectedCalendarDates.value.length < meta) {
      selectedCalendarDates.value.push(dateStr)
      selectedCalendarDates.value.sort()
    } else {
      showFeedbackMessage(`Error: Ya ha seleccionado el límite de ${meta} fechas.`, 'error')
    }
  }
}

const generateMockSurveys = (activityId, dates) => {
  const statuses = ['Pendiente', 'En Ejecución', 'En Verificación', 'Terminada']
  const sorted = [...dates].sort()
  return sorted.map((date, idx) => ({
    date,
    id_survey: `INS-${activityId}-${idx + 1}`,
    status: statuses[idx % statuses.length],
    pdf_url: `https://mockup.corp.cl/documentos/${activityId}-${date}.pdf`,
  }))
}

const toYMD = (d) => {
  const date = (typeof d === 'string') ? new Date(d) : d
  return `${date.getFullYear()}-${pad2(date.getMonth()+1)}-${pad2(date.getDate())}`
}

const obtenerTemplatesData = async (id_tipo_srv) => {
  try {
    const { data } = await apiAxios.get(`/servicio/leanglobal/obtenerTemplates?id_tipo_srv=${id_tipo_srv}`);
    templatesSurvey.value = data;
    console.log(templatesSurvey.value, id_tipo_srv);
  } catch (err) {
    console.error('Error al obtener templates:', err);
  }
};

const addActivity = async () => {
  const { meta } = activityForm.value
  const id_tipo_srv = personalizadoUsuarios.value.id_familia
  const dates = selectedCalendarDates.value.map(toYMD)

  if (!activityForm.value.periodicity) {
    showFeedbackMessage('Seleccione la periodicidad antes de añadir.', 'error')
    return
  }

  if (!id_tipo_srv) {
    showFeedbackMessage('Seleccione la actividad antes de añadir.', 'error')
    return
  }

  if (!personalizadoUsuarios.value.id_template) {
    showFeedbackMessage('Seleccione la inspección antes de añadir.', 'error')
    return
  }

  if (!Number(meta) || Number(meta) < 1) {
    showFeedbackMessage('La meta debe ser mayor a 0.', 'error')
    return
  }

  await obtenerTemplatesData(id_tipo_srv)

  const tpl = templatesSurvey.value.find(t => t.id_template === personalizadoUsuarios.value.id_template)
  const header_seed   = tpl?.header_seed ?? {}
  const body_seed     = tpl?.body_seed   ?? []
  const approval_seed = tpl?.approval_seed ?? {}
  const id_flow_tmpl  = tpl?.id_flow_tmpl ?? null

  console.log(tpl, id_flow_tmpl)

  if (dates.length !== meta) {
    showFeedbackMessage(`Error: La Meta es ${meta}, pero seleccionó ${dates.length} fechas.`, 'error')
    return
  }

  // 🔹 Loop por usuarios y fechas
  for (const user of personalizado.value.assignedUsers) {
    for (const fecha of dates) {
      const data = {
        id_tipo_srv,
        id_template: personalizadoUsuarios.value.id_template,
        id_user: user.id_user, // usuario asignado
        id_user_creacion: userDetailStore.userDetail.id_user,
        id_empresa_cliente: Number(personalizado.value.id_empresa_cliente) || null,
        estado_srv: 'Pre Creado',
        header_seed: JSON.stringify(header_seed),
        body_seed: JSON.stringify(body_seed),
        approval_seed: JSON.stringify(approval_seed),
        header_exec: JSON.stringify(header_seed),
        body_exec: JSON.stringify(body_seed),
        approval_exec: JSON.stringify(approval_seed),
        fecha_plan_ini: fecha,
        fecha_plan_fin: fecha,
        fecha_real_ini: null,
        fecha_real_fin: null,
        fecha_upload: null,
        latitud: null,
        longitud: null,
        id_proyecto: Number(personalizado.value.id_proyecto) || null,
        id_flow_tmpl,
        id_personalizado: personalizado.value.id_personalizado
      }

      try {
        // 1) Crear survey
        const resp = await apiAxios.post('/survey/', data)

        const creado =
          resp?.data?.datos?.[0] ||
          resp?.data?.survey ||
          (resp?.data?.id_survey ? resp.data : null)

        const idSurvey = creado?.id_survey ?? resp?.data?.idSurvey

        console.log('Creado survey', creado, 'idSurvey:', idSurvey)

        // 2) 🔹 Asignar automáticamente el id_user y fechas usando el mismo endpoint que en guardarCambios
        if (idSurvey) {
          const dataUpd = {
            id_user: Number(user.id_user),
            fecha_plan_ini: fecha,
            fecha_plan_fin: fecha
          }

          await apiAxios.put(`/survey/UpdPlan/${idSurvey}`, dataUpd)
          console.log(`Survey ${idSurvey} actualizado con id_user ${user.id_user}`)
        } else {
          console.log('No se pudo obtener id_survey del response para actualizar el plan.')
        }

        // 🔴 IMPORTANTE:
        // 👉 Aquí ANTES tenías el código de notificaciones /notfqueue.
        // 👉 Como pediste "omite las notificaciones", lo eliminamos.

      } catch (err) {
        console.error('Error al crear/asignar el survey:', err?.response?.data || err.message)
      }
    }
  }

  // 🔹 Actualizas tablas/resumen como ya lo hacías
  await obtenerPersonalizados()
  await obtenerActividadesSurvey()
  console.log(tablaActividadesSurvey.value)

  const pid = Number(personalizado.value.id_personalizado)
  const users = Array.isArray(personalizado.value.assignedUsers)
    ? new Set(personalizado.value.assignedUsers.map(u => Number(u.id_user)))
    : new Set()

  const tablaPer = Array.isArray(tablaPersonalizados.value)
    ? tablaPersonalizados.value.filter(per => Number(per.id_personalizado) === pid)
    : []

  const tablaAct = Array.isArray(tablaActividadesSurvey.value)
    ? tablaActividadesSurvey.value.filter(
        act => Number(act.id_personalizado) === pid && users.has(Number(act.id_user))
      )
    : []

  console.log('tablaPer', tablaPer[0])
  console.log('tablaAct', tablaAct)

  const fallbackPer = {
    id_personalizado: pid,
    periodo: personalizado.value.periodo,
    id_empresa_cliente: personalizado.value.id_empresa_cliente,
    nombre_cliente: selectedClient.value?.name_empresa || '',
    id_proyecto: personalizado.value.id_proyecto,
    nombre_proyecto: selectedProject.value?.nombre_proyecto || '',
    id_rol: personalizado.value.id_rol,
    name_rol: selectedRole.value?.name_rol || ''
  }
  const perSource = tablaPer[0] || fallbackPer

  if (tablaPer.length === 0) {
    console.warn('No hay personalizados que coincidan en obtenerPersonalizados; usando datos locales para el resumen.')
  } else {
    const pid = Number(personalizado.value.id_personalizado)
    const idx = tablaPersonalizados.value.findIndex(p => Number(p.id_personalizado) === pid)
    if (idx !== -1) {
      tablaPersonalizados.value[idx] = {
        ...tablaPersonalizados.value[idx],
        surveys: tablaAct,
      }
    }
  }

  // Resumen (NO push, reasignar siempre)
  if (perSource) {
    personalizado.value.activities = [{
      ...perSource,
      surveys: tablaAct
    }]

    const resumen = buildResumenPersonalizado(perSource, tablaAct)
    console.log(resumen)
    personalizado.value.resumen = resumen
  } else {
    personalizado.value.activities = []
    personalizado.value.resumen = null
  }

  // Reset UI actividad
  activityForm.value = { activityType: 'No bloqueante', inspection: '', meta: 1, periodicity: '' }
  selectedCalendarDates.value = []
  isCalendarOpen.value = false

  showFeedbackMessage('Actividad añadida al plan (surveys creados y asignados).', 'success')

  emit('guardado', {
    id_personalizado: personalizado.value.id_personalizado,
    action: 'surveys-created'
  })
}

const removeActivity = (id) => {
  personalizado.value.activities = personalizado.value.activities.filter(a => a.id !== id)
  if (expandedActivityId.value === id) expandedActivityId.value = null
  showFeedbackMessage('Actividad eliminada del plan.', 'error')
}

const toggleAccordion = (id) => {
  expandedActivityId.value = expandedActivityId.value === id ? null : id
}

const savePersonalizado = async () => {
  personalizado.value.isComplete = true
  console.log('Plan Guardado:', JSON.parse(JSON.stringify(personalizado.value)))

  try {
    const response = await apiAxios.post('/personalizados/', JSON.parse(JSON.stringify(personalizado.value)));
    console.log('postProgramaPersonalizado', response);
  } catch (error) {
    console.log(error);
    console.error(error.response);
  } finally {
    console.log("finally");
  }

  showFeedbackMessage('¡Programa Personalizado Guardado con Éxito!', 'success')

  setTimeout(() => {
    // Reset
    personalizado.value = {
      id: Date.now(),
      periodoId: null,
      proyectoId: null,
      rolId: null,
      assignedUsers: [],
      activities: [],
      isComplete: false,
    }
    currentStep.value = 1
    activityForm.value = { activityType: 'No bloqueante', inspection: '', meta: 1, periodicity: '' }
    selectedCalendarDates.value = []
    isCalendarOpen.value = false
    expandedActivityId.value = null
  }, 1200)
}

/* ===========================
   Colores chips
   =========================== */
const getBadgeColor = (periodicity) => {
  switch (periodicity) {
    case 'Diaria': return 'red'
    case 'Semanal':
    case 'Quincenal': return 'amber-darken-1'
    case 'Mensual': return 'green'
    case 'Calendario': return 'blue-darken-1'
    default: return 'grey'
  }
}

const getSurveyStatusColor = (status) => {
  switch (status) {
    case 'Pendiente': return 'grey'
    case 'En Ejecución': return 'orange-darken-1'
    case 'En Verificación': return 'blue-darken-1'
    case 'Terminada': return 'green-darken-1'
    default: return 'grey'
  }
}

async function postProgramaPersonalizado() {
  try {
    if (!personalizado.value.id_rol && personalizado.value.id_cargo) {
      const derivedRoleId = resolveRoleIdFromCargo(personalizado.value.id_cargo)
      if (derivedRoleId) {
        personalizado.value.id_rol = derivedRoleId
      }
    }

    // Fallback de prueba solicitado: usa el rol del primer usuario seleccionado.
    if (!personalizado.value.id_rol) {
      const derivedRoleFromUser = resolveRoleIdFromFirstSelectedUser()
      if (derivedRoleFromUser) {
        personalizado.value.id_rol = derivedRoleFromUser
      }
    }

    if (!personalizado.value.id_rol) {
      showFeedbackMessage('No se pudo determinar el Rol desde Cargo ni desde el primer usuario seleccionado.', 'error')
      return false
    }

    const creatorId =
      Number(userDetailStore.userDetail?.id_user) ||
      Number(personalizado.value.id_user_creacion) ||
      Number((personalizado.value.assignedUsers ?? [])[0]?.id_user ?? (personalizado.value.assignedUsers ?? [])[0]?.id) ||
      null

    if (!creatorId) {
      showFeedbackMessage('No se pudo determinar id_user_creacion para el personalizado.', 'error')
      return false
    }

    const payload = {
      personalizado: {
        ...personalizado.value,
        id_user_creacion: creatorId,
        assignedUsers: undefined
      },
      // Mantener formato original por compatibilidad con backend.
      userIds: personalizado.value.assignedUsers
    }

    const requiredFkFields = ['id_empresa', 'id_empresa_cliente', 'id_proyecto', 'id_rol', 'id_cargo', 'id_user_creacion']
    const missingFkFields = requiredFkFields.filter(k => !Number(payload.personalizado?.[k]))
    if (missingFkFields.length > 0) {
      showFeedbackMessage(`Faltan FKs requeridas: ${missingFkFields.join(', ')}`, 'error')
      return false
    }

    const response = await apiAxios.post('/personalizados/', payload);

    personalizado.value.id_personalizado = response.data.id_personalizado;
    console.log("personalizado.value.id_personalizado", personalizado.value.id_personalizado);
    return true
  } catch (error) {
    console.log(personalizado.value, personalizado.value.assignedUsers)
    console.log(error);
    console.error(error.response);
    showFeedbackMessage(
      error?.response?.data?.message || error?.response?.data?.error || 'No se pudo crear el personalizado (400). Revisa datos requeridos por backend.',
      'error'
    )
    return false
  } finally {
    console.log("finally");
  }
}
</script>

<style scoped>
.main-card {
  border-radius: 12px;
  max-width: auto;
  margin: 0 auto;
}

.calendar-day-btn {
  min-width: 32px;
  height: 32px;
  font-size: 12px;
  border-radius: 4px;
  margin: 1px;
}

.toast-stack {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 60;
}
</style>


