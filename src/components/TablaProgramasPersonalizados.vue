<template>
  <div class="pa-4">
    <!-- Toasters -->
    <div class="toast-stack">
      <v-snackbar
        v-for="t in toasts"
        :key="t.id"
        v-model="t.open"
        location="bottom end"
        :timeout="t.timeout ?? 2500"
        :color="t.type === 'success' ? 'green-darken-2' : t.type === 'warning' ? 'amber-darken-2' : 'red-darken-2'"
        variant="flat"
        class="mb-2"
      >
        {{ t.message }}
      </v-snackbar>
    </div>

    <!-- Tabla de Personalizados -->
    <v-card elevation="10">
      <v-card-title class="text-h6 bg-blue-darken-3 text-white py-4 px-6">
        <v-icon
          icon="mdi-shield-check-outline"
          start
        />
        Asignación masiva por Personalizado
      </v-card-title>

      <v-card-text class="pa-0">
        <v-table
          density="compact"
          fixed-header
          height="360"
          class="text-body-2"
        >
          <thead>
            <tr>
              <th style="width: 48px;" />
              <th class="text-left">
                ID Personalizado
              </th>
              <th class="text-left">
                Cliente
              </th>
              <th class="text-left">
                Proyecto
              </th>
              <th class="text-left">
                Período
              </th>
              <th class="text-left">
                Rol
              </th>
              <th class="text-center">
                Usuario
              </th>
              <th class="text-center">
                Q Activ.
              </th>
              <th class="text-center">
                Act. Prog.
              </th>
              <th class="text-center">
                Act. Term.
              </th>
              <th class="text-center">
                % Avance
              </th>
              <th
                class="text-left"
                style="min-width: 120px;"
              >
                Progreso
              </th>
              <th class="text-left">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody>
            <template
              v-for="row in rows"
              :key="row.id_personalizado"
            >
              <!-- Fila principal -->
              <tr :class="{ 'bold-row': isExpanded(row.id_personalizado) }">
                <td>
                  <v-btn
                    icon
                    size="small"
                    variant="text"
                    @click="toggleExpand(row.id_personalizado, row)"
                  >
                    <v-icon>
                      {{ isExpanded(row.id_personalizado) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                    </v-icon>
                  </v-btn>
                </td>

                <td>{{ row.id_personalizado }}</td>
                <td>{{ row.nombre_cliente }}</td>
                <td class="pre-wrap">
                  {{ row.nombre_proyecto }}
                </td>
                <td>{{ row.periodo }}</td>
                <td class="pre-wrap">
                  {{ row.name_rol }}
                </td>
                <td class="text-center">
                  {{ row.nombre_user }}
                </td>
                <td class="text-center">
                  {{ row.cantidad_actividades }}
                </td>
                <td class="text-center">
                  {{ row.actividades_programadas }}
                </td>
                <td class="text-center">
                  {{ row.actividades_terminadas }}
                </td>

                <td class="text-center">
                  <v-chip
                    size="small"
                    label
                    :color="row.actividades_atrasadas > 0 ? 'amber' : 'green'"
                  >
                    {{ row.porcentaje_avance }}
                  </v-chip>
                </td>

                <td>
                  <v-progress-linear
                    :model-value="Number(row.porcentaje_avance) || 0"
                    height="10"
                    rounded
                    bg-color="grey-lighten-3"
                  />
                </td>

                <td class="icon-row">
                  <v-icon
                    size="22"
                    title="Asignar flujo a todos los surveys"
                    @click="showModalAsignarFlujo(row)"
                  >
                    mdi-account-multiple
                  </v-icon>

                  <v-btn
                    icon
                    variant="text"
                    title="Editar fila"
                    @click.stop="onEditar(row)"
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </td>
              </tr>

              <!-- Fila expandida -->
              <tr v-if="isExpanded(row.id_personalizado)">
                <td
                  :colspan="13"
                  class="expand-cell"
                >
                  <v-card
                    class="pa-0"
                    elevation="2"
                  >
                    <v-list
                      class="pa-0"
                      lines="two"
                    >
                      <!-- ===================== -->
                      <!-- CARGANDO -->
                      <!-- ===================== -->
                      <template v-if="loadingResumen[row.id_personalizado]">
                        <v-list-item class="py-6">
                          <v-list-item-title class="d-flex align-center ga-3">
                            <v-progress-circular
                              indeterminate
                              size="20"
                            />
                            Cargando resumen…
                          </v-list-item-title>
                        </v-list-item>
                      </template>

                      <!-- ===================== -->
                      <!-- ERROR -->
                      <!-- ===================== -->
                      <template v-else-if="errorResumen[row.id_personalizado]">
                        <v-list-item class="py-6">
                          <v-list-item-title class="text-red-darken-2">
                            {{ errorResumen[row.id_personalizado] }}
                          </v-list-item-title>
                        </v-list-item>
                      </template>

                      <!-- ===================== -->
                      <!-- VACÍO -->
                      <!-- ===================== -->
                      <template v-else-if="!getResumen(row.id_personalizado)?.actividades?.length">
                        <v-list-item class="text-center text-grey-darken-1 py-6">
                          <v-list-item-title>No hay actividades para mostrar.</v-list-item-title>
                        </v-list-item>
                      </template>

                      <!-- ===================== -->
                      <!-- CONTENIDO -->
                      <!-- ===================== -->
                      <template v-else>
                        <!-- NIVEL 1: ACTIVIDADES -->
                        <template
                          v-for="a in getResumen(row.id_personalizado).actividades"
                          :key="a.actividad"
                        >
                          <v-list-item
                            class="pa-4 py-0 border-b transition-all"
                            :class="{
                              'bg-red-lighten-5':
                                getExpandedAct(row.id_personalizado) === a.actividad
                            }"
                            @click="toggleAct(row.id_personalizado, a.actividad)"
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
                                  Programadas: {{ a.programadas }}
                                  · Terminadas: {{ a.terminadas }}
                                  · Atrasadas: {{ a.atrasadas }}
                                </div>
                              </v-col>

                              <v-col
                                cols="12"
                                md="6"
                                class="d-flex align-center"
                              >
                                <v-progress-linear
                                  :model-value="Number(a.avancePct) || 0"
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
                                  :color="
                                    getExpandedAct(row.id_personalizado) === a.actividad
                                      ? 'red-darken-3'
                                      : 'grey-darken-1'
                                  "
                                  :style="{
                                    transform:
                                      getExpandedAct(row.id_personalizado) === a.actividad
                                        ? 'rotate(180deg)'
                                        : 'rotate(0deg)'
                                  }"
                                  @click.stop
                                >
                                  <v-icon>mdi-chevron-down</v-icon>
                                </v-btn>
                              </v-col>
                            </v-row>
                          </v-list-item>

                          <!-- ===================== -->
                          <!-- NIVEL 2: USUARIOS -->
                          <!-- ===================== -->
                          <v-expand-transition>
                            <div
                              v-if="getExpandedAct(row.id_personalizado) === a.actividad"
                              class="bg-red-lighten-5"
                            >
                              <v-list class="bg-transparent">
                                <template
                                  v-for="u in a.usuarios || []"
                                  :key="a.actividad + '::' + u.id_user"
                                >
                                  <v-list-item
                                    class="pa-4 py-0 border-b"
                                    @click="
                                      toggleActUser(
                                        row.id_personalizado,
                                        a.actividad,
                                        u.id_user
                                      )
                                    "
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
                                          {{ row.nombre_proyecto || 'Proyecto' }}
                                          · {{ row.name_rol || 'Rol' }}
                                        </div>
                                      </v-col>

                                      <v-col
                                        cols="12"
                                        md="6"
                                        class="d-flex align-center"
                                      >
                                        <v-progress-linear
                                          :model-value="Number(u.avancePct) || 0"
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
                                          :color="
                                            getExpandedActUserKey(row.id_personalizado) ===
                                              a.actividad + '::' + u.id_user
                                              ? 'red-darken-3'
                                              : 'grey-darken-1'
                                          "
                                          :style="{
                                            transform:
                                              getExpandedActUserKey(row.id_personalizado) ===
                                              a.actividad + '::' + u.id_user
                                                ? 'rotate(180deg)'
                                                : 'rotate(0deg)'
                                          }"
                                          @click.stop
                                        >
                                          <v-icon>mdi-chevron-down</v-icon>
                                        </v-btn>
                                      </v-col>
                                    </v-row>
                                  </v-list-item>

                                  <!-- ===================== -->
                                  <!-- NIVEL 3: SURVEYS -->
                                  <!-- ===================== -->
                                  <v-expand-transition>
                                    <div
                                      v-if="
                                        getExpandedActUserKey(row.id_personalizado) ===
                                          a.actividad + '::' + u.id_user
                                      "
                                      class="px-4 pb-4 bg-red-lighten-5"
                                    >
                                      <v-list
                                        density="compact"
                                        class="bg-transparent"
                                      >
                                        <v-list-item
                                          v-for="s in u.surveys || []"
                                          :key="s.id_survey"
                                          class="pa-1 mb-1 rounded-lg bg-white elevation-1"
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
                                              Plan: {{ s.fecha_plan || '—' }}
                                              · Real: {{ s.fecha_real || '—' }}
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
                                                :href="
                                                  s.pdf
                                                    ? `/archivo/terracon/${s.pdf}`
                                                    : undefined
                                                "
                                                :disabled="!s.pdf"
                                                target="_blank"
                                                icon
                                                variant="text"
                                                size="small"
                                                color="red-darken-3"
                                                title="Ver PDF"
                                                @click.stop
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
                </td>
              </tr>
            </template>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>

    <!-- Modal: configurar plantilla una sola vez -->
    <v-dialog
      v-model="showModalAsignar"
      max-width="780"
    >
      <v-card>
        <v-toolbar
          color="primary"
          dark
        >
          <v-toolbar-title>Asignar Flujo (masivo)</v-toolbar-title>
          <v-spacer />
          <v-btn
            icon
            @click="onCerrarModal"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text class="pt-6">
          <div class="mb-3 text-caption text-medium-emphasis">
            Se aplicará a <strong>{{ idsSurveysAsociados.length }}</strong> survey(s) del personalizado
            <span v-if="personalizadoActual?.id_personalizado">#{{ personalizadoActual.id_personalizado }}</span>.
          </div>

          <template v-if="loadingPlantilla">
            <div class="d-flex align-center ga-3">
              <v-progress-circular indeterminate />
              <span>Cargando plantilla de pasos…</span>
            </div>
          </template>

          <template v-else>
            <template
              v-for="(flujo, idx) in flujosPlantilla"
              :key="idx"
            >
              <v-row dense>
                <v-col cols="4">
                  <strong>Paso {{ flujo.flow_tmpl_step_name }} ({{ flujo.name_rol }})</strong>
                </v-col>

                <v-col cols="8">
                  <v-row dense>
                    <v-col cols="8">
                      <!-- Selección de EQUIPO -->
                      <v-select
                        v-if="flujo.flag_equipo"
                        v-model="flujo.id_user"
                        :label="`Equipo (${flujo.name_rol})`"
                        :items="equiposItemsFiltrados"
                        item-title="nombre_equipo"
                        item-value="id_equipo_proyecto"
                        :value-comparator="valueComparator"
                        density="compact"
                        variant="underlined"
                        hide-details="auto"
                        clearable
                      />

                      <!-- Usuario (caso normal) -->
                      <v-select
                        v-else
                        v-model="flujo.id_user"
                        :label="`Usuario (${flujo.name_rol})`"
                        :items="usuariosPorRol(flujo.name_rol)"
                        :item-title="u => (String(u?.nombre_user ?? '').trim() || `— Sin nombre (#${u?.id_user})`)"
                        item-value="id_user"
                        density="compact"
                        variant="underlined"
                        hide-details="auto"
                        clearable
                      />
                    </v-col>

                    <!-- Botón + dialog de INTEGRANTES del equipo -->
                    <v-col
                      v-if="flujo.flag_equipo && flujo.id_user"
                      cols="4"
                      class="d-flex align-center justify-end"
                    >
                      <MantenedorIntegrantesEquipo
                        :id-equipo="flujo.id_user"
                        :nombre-equipo="nombreEquipoPorId(flujo.id_user)"
                        :usuarios="usuariosFlow"
                      />
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
              <v-divider class="my-2" />
            </template>

            <div class="d-flex justify-end ga-2 mt-4">
              <v-btn
                variant="text"
                color="grey-darken-2"
                @click="onCerrarModal"
              >
                <v-icon
                  start
                  icon="mdi-close"
                />
                Cancelar
              </v-btn>

              <v-btn
                :loading="guardando"
                :disabled="guardando"
                color="primary"
                @click="asignarSurveyFlujo"
              >
                <v-icon
                  start
                  icon="mdi-check"
                />
                Asignar a todos
              </v-btn>
            </div>
          </template>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import apiAxios from '@/services/api'
import MantenedorIntegrantesEquipo from '../components/MantenedorIntegrantesEquipo.vue'

const proyectoActualId = ref(null)

// =====================
// Toasters
// =====================
const toasts = ref([])
function pushToast (message, type = 'success', timeout = 2500) {
  toasts.value.push({ id: crypto.randomUUID(), open: true, message, type, timeout })
}

// =====================
// Tabla principal
// =====================
const rows = ref([])
const emit = defineEmits(['editar'])

// =====================
// Expand (filas tabla)
// =====================
const expanded = ref([])

function isExpanded (id) {
  return expanded.value.includes(id)
}

// Expand interno del resumen (por fila)
const expandedActByRow = ref({})        // { [pid]: 'actividad' | null }
const expandedActUserKeyByRow = ref({}) // { [pid]: 'actividad::id_user' | null }

function getExpandedAct (pid) {
  return expandedActByRow.value[pid] ?? null
}
function getExpandedActUserKey (pid) {
  return expandedActUserKeyByRow.value[pid] ?? null
}
function toggleAct (pid, actividad) {
  const cur = getExpandedAct(pid)
  expandedActByRow.value = { ...expandedActByRow.value, [pid]: cur === actividad ? null : actividad }
  expandedActUserKeyByRow.value = { ...expandedActUserKeyByRow.value, [pid]: null }
}
function toggleActUser (pid, actividad, idUser) {
  const key = `${actividad}::${idUser}`
  const cur = getExpandedActUserKey(pid)
  expandedActUserKeyByRow.value = { ...expandedActUserKeyByRow.value, [pid]: cur === key ? null : key }
}

// =====================
// Modal asignación masiva
// =====================
const personalizadoActual = ref(null)
const showModalAsignar = ref(false)
const loadingPlantilla = ref(false)
const guardando = ref(false)

const flujosPlantilla = ref([])     // plantilla a aplicar
const idsSurveysAsociados = ref([]) // surveys del personalizado actual

// =====================
// Catálogos / Usuarios / Equipos
// =====================
const equiposProyectos = ref([])
const usuariosFlow = ref([])
const rolesFlujoList = ref([])
const usuariosRolesList = ref([])

const valueComparator = (a, b) => Number(a) === Number(b)
const normalizaNum = (v) => (v == null || v === '' ? null : Number(v))

const rolNameToId = computed(() => {
  const m = Object.create(null)
  for (const r of rolesFlujoList.value) m[r.name_rol] = r.id_rol
  return m
})

const usersByRolId = computed(() => {
  const m = new Map()
  for (const ur of usuariosRolesList.value) {
    const rol = Number(ur.id_rol)
    const usr = Number(ur.id_user)
    if (!m.has(rol)) m.set(rol, new Set())
    m.get(rol).add(usr)
  }
  return m
})

function normName (u) {
  return String(u?.nombre_user ?? '').trim()
}

function usuariosPorRol (rolName) {
  const rolId = rolNameToId.value[rolName]
  if (!rolId) return []

  const ids = usersByRolId.value.get(rolId)
  if (!ids) return []

  return usuariosFlow.value
    .filter(u => ids.has(Number(u.id_user)))
    .slice()
    .sort((a, b) => {
      const na = normName(a)
      const nb = normName(b)

      // ✅ vacíos al final
      const aEmpty = !na
      const bEmpty = !nb
      if (aEmpty && !bEmpty) return 1
      if (!aEmpty && bEmpty) return -1
      if (aEmpty && bEmpty) return Number(a.id_user) - Number(b.id_user)

      // ✅ alfabético chileno-friendly
      return na.localeCompare(nb, 'es', { sensitivity: 'base' })
    })
}

const equiposItems = computed(() =>
  (equiposProyectos.value ?? []).map(e => ({
    ...e,
    id_equipo_proyecto: Number(e.id_equipo_proyecto),
    id_proyecto: Number(e.id_proyecto)
  }))
)

const equiposItemsFiltrados = computed(() => {
  const pid = Number(proyectoActualId.value)
  if (!pid) return []
  return equiposItems.value.filter(e => Number(e.id_proyecto) === pid)
})

function nombreEquipoPorId (idEquipo) {
  const id = Number(idEquipo)
  const eq = equiposItems.value.find(e => e.id_equipo_proyecto === id)
  return eq?.nombre_equipo || `Equipo #${id}`
}

// =====================
// Resumen Lazy + Cache
// =====================
const resumenByPid = ref({})   // { [pid]: resumen }
const loadingResumen = ref({}) // { [pid]: true/false }
const errorResumen = ref({})   // { [pid]: 'mensaje' | null }

function getResumen (pid) {
  return resumenByPid.value[pid] ?? null
}

// ⚠️ IMPORTANTE: este builder NO estaba en tu archivo.
// Lo dejamos aquí para que no reviente ensureResumen().
function buildResumenPersonalizado (tablaPer0, tablaAct, hoyStr = new Date().toISOString().slice(0, 10)) {
  const base = {
    id_personalizado: Number(tablaPer0.id_personalizado),
    periodo: tablaPer0.periodo,
    cliente: { id: Number(tablaPer0.id_empresa_cliente ?? 0), nombre: tablaPer0.nombre_cliente },
    proyecto: { id: Number(tablaPer0.id_proyecto ?? 0), nombre: tablaPer0.nombre_proyecto },
    rol: { id: Number(tablaPer0.id_rol ?? 0), nombre: tablaPer0.name_rol },
    actividades: []
  }

  const isTerminada = (s) =>
    (s.estado_srv && String(s.estado_srv).toLowerCase().includes('termin')) || !!s.fecha_real_fin

  const isAtrasada = (s, hoy) =>
    !isTerminada(s) && s.fecha_plan_ini && String(s.fecha_plan_ini).slice(0, 10) < hoy

  const byAct = new Map()

  for (const s of (tablaAct || [])) {
    const actName = s.name_template_srv || s.actividad || 'Actividad'
    const uid = Number(s.id_user ?? 0)
    const uname = s.nombre_user || s.name_user || `Usuario #${uid || '—'}`

    if (!byAct.has(actName)) {
      byAct.set(actName, { actividad: actName, programadas: 0, terminadas: 0, atrasadas: 0, _users: new Map() })
    }

    const a = byAct.get(actName)
    a.programadas += 1
    if (isTerminada(s)) a.terminadas += 1
    else if (isAtrasada(s, hoyStr)) a.atrasadas += 1

    if (!a._users.has(uid)) {
      a._users.set(uid, { id_user: uid, nombre_user: uname, surveys: [] })
    }

    a._users.get(uid).surveys.push({
      id_survey: Number(s.id_survey),
      fecha_plan: s.fecha_plan_ini || null,
      fecha_real: s.fecha_real_fin || null,
      estado: s.estado_srv || null,
      pdf: s.id_doc ? s.id_doc : null
    })
  }

  for (const [, a] of byAct) {
    const avancePct = a.programadas ? Math.round((a.terminadas / a.programadas) * 100) : 0

    const usuarios = []
    for (const [, uu] of a._users) {
      uu.surveys.sort((x, y) => String(x.fecha_plan || '').localeCompare(String(y.fecha_plan || '')))
      const programadasU = uu.surveys.length
      const terminadasU = uu.surveys.filter(sv =>
        (sv.estado || '').toLowerCase().includes('termin') || !!sv.fecha_real
      ).length
      const avancePctU = programadasU ? Math.round((terminadasU / programadasU) * 100) : 0
      usuarios.push({ ...uu, avancePct: avancePctU })
    }
    usuarios.sort((x, y) => String(x.nombre_user).localeCompare(String(y.nombre_user)))

    base.actividades.push({
      actividad: a.actividad,
      programadas: a.programadas,
      terminadas: a.terminadas,
      atrasadas: a.atrasadas,
      avancePct,
      usuarios
    })
  }

  base.actividades.sort((x, y) => String(x.actividad).localeCompare(String(y.actividad)))
  return base
}

async function ensureResumen (row) {
  const pid = Number(row?.id_personalizado)
  if (!pid) return null

  if (resumenByPid.value[pid]) return resumenByPid.value[pid]
  if (loadingResumen.value[pid]) return null

  loadingResumen.value = { ...loadingResumen.value, [pid]: true }
  errorResumen.value = { ...errorResumen.value, [pid]: null }

  try {
    console.log('[Resumen] pid=', pid, '→ cargando actividades...')
    const tablaAct = await obtenerActividadesSurvey(pid)

    console.log('[Resumen] pid=', pid, 'actividades recibidas:', Array.isArray(tablaAct) ? tablaAct.length : tablaAct)
    const resumen = buildResumenPersonalizado(row, tablaAct)

    resumenByPid.value = { ...resumenByPid.value, [pid]: resumen }
    return resumen
  } catch (e) {
    console.error('[Resumen] Error pid=', pid, e?.response?.data || e)
    errorResumen.value = {
      ...errorResumen.value,
      [pid]: (e?.response?.data?.message || e?.message || 'No se pudo cargar el resumen')
    }
    return null
  } finally {
    loadingResumen.value = { ...loadingResumen.value, [pid]: false }
  }
}

// Expansión fila + lazy load
async function toggleExpand (id, row) {
  const pid = Number(id)
  if (expanded.value.includes(pid)) {
    expanded.value = expanded.value.filter(e => e !== pid)

    // limpia estado interno accordion de esa fila
    const { [pid]: _, ...restA } = expandedActByRow.value
    expandedActByRow.value = restA
    const { [pid]: __, ...restU } = expandedActUserKeyByRow.value
    expandedActUserKeyByRow.value = restU
    return
  }

  expanded.value.push(pid)
  await ensureResumen(row)
}

// =====================
// Colores
// =====================
function getProgressColor (pct) {
  const n = Number(pct) || 0
  if (n >= 90) return 'green-darken-2'
  if (n >= 60) return 'light-green-darken-2'
  if (n >= 30) return 'amber-darken-2'
  return 'red-darken-2'
}

function getSurveyStatusColor (estado) {
  const s = String(estado || '').toLowerCase()
  if (s.includes('termin')) return 'green-darken-1'
  if (s.includes('verif')) return 'blue-darken-1'
  if (s.includes('ejec') || s.includes('proce')) return 'orange-darken-1'
  if (s.includes('pend')) return 'grey'
  return 'grey'
}

// =====================
// API (tabla + resumen)
// =====================
async function obtenerPersonalizados () {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/seguridad/obtenerPersonalizados')
    rows.value = (data?.datos || []).sort((a, b) => Number(b.id_personalizado) - Number(a.id_personalizado))
  } catch (err) {
    console.error(err)
    pushToast('Error al cargar personalizados', 'error')
  }
}

async function obtenerActividadesSurvey (id_personalizado) {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerActividadesSurvey?id_personalizado=' + id_personalizado)
    return Array.isArray(data) ? data : (data?.datos || data || [])
  } catch (err) {
    console.error(err)
    pushToast('Error al obtener actividades del personalizado', 'error')
    return []
  }
}

async function fetchUsuarios () {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerUsuarios')
    usuariosFlow.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('fetchUsuarios', e)
    usuariosFlow.value = []
  }
}

async function fetchRolesFlujo () {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerRoles')
    rolesFlujoList.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('fetchRolesFlujo', e)
    rolesFlujoList.value = []
  }
}

async function fetchUsuariosRoles () {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerUsuariosRoles')
    usuariosRolesList.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('fetchUsuariosRoles', e)
    usuariosRolesList.value = []
  }
}

async function obtenerEquiposProyectos () {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerEquiposProyectos')
    equiposProyectos.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error(err)
    equiposProyectos.value = []
  }
}

// =====================
// Flow helpers + modal masivo
// =====================
async function getFlowIdBySurvey (idSurvey) {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/flujosAprobacion')
    const lista = data?.datos || []
    return lista.find(f => Number(f.id_survey) === Number(idSurvey))?.id_flow || null
  } catch (e) {
    console.error('getFlowIdBySurvey', e)
    return null
  }
}

async function getStepsByFlow (flowId) {
  try {
    const { data } = await apiAxios.get(`/servicio/leanglobal/flujosAprobacionSteps?id_flow=${flowId}`)
    return Array.isArray(data) ? data : []
  } catch (e) {
    console.error('getStepsByFlow', e)
    return []
  }
}

function onEditar (row) {
  emit('editar', row)
}

function onCerrarModal () {
  showModalAsignar.value = false
  flujosPlantilla.value = []
  idsSurveysAsociados.value = []
  personalizadoActual.value = null
  proyectoActualId.value = null
}

async function showModalAsignarFlujo (row) {
  try {

    proyectoActualId.value = Number(row.id_proyecto)

    personalizadoActual.value = row
    loadingPlantilla.value = true

    const actividades = await obtenerActividadesSurvey(row.id_personalizado)
    idsSurveysAsociados.value = (actividades || []).map(a => Number(a.id_survey)).filter(Boolean)

    if (!idsSurveysAsociados.value.length) {
      pushToast('No hay surveys asociados a este personalizado', 'warning')
      return
    }

    const surveyEjemplo = idsSurveysAsociados.value[0]
    const flowId = await getFlowIdBySurvey(surveyEjemplo)
    if (!flowId) {
      pushToast('No se encontró flow para el primer survey', 'error')
      return
    }

    const stepsEjemplo = await getStepsByFlow(flowId)

    flujosPlantilla.value = (stepsEjemplo || [])
      .sort((a, b) => (a?.flow_tmpl_step_orden ?? 9999) - (b?.flow_tmpl_step_orden ?? 9999))
      .map(s => {
        const esEquipo = !!s.flag_equipo || /eq-?\s*fescol/i.test(String(s.name_rol || ''))
        return {
          id_rol: Number(s.id_rol ?? 0),
          name_rol: s.name_rol,
          flow_tmpl_step_orden: Number(s.flow_tmpl_step_orden ?? 0),
          flag_equipo: esEquipo,
          id_user: normalizaNum(s.id_user ?? null),
          flow_tmpl_step_name: s.flow_tmpl_step_name
        }
      })

    showModalAsignar.value = true
  } catch (e) {
    console.error(e)
    pushToast('Error al preparar la asignación masiva', 'error')
  } finally {
    loadingPlantilla.value = false
  }
}

async function asignarSurveyFlujo () {
  guardando.value = true
  const urlPut = '/survey/UpdUserFlow'
  const urlNotf = '/notfqueue'

  let totalPuts = 0
  let totalErrs = 0
  const surveysConEstadoActualizado = []

  try {
    for (const idSurvey of idsSurveysAsociados.value) {
      const flowId = await getFlowIdBySurvey(idSurvey)
      if (!flowId) {
        totalErrs++
        continue
      }

      const steps = await getStepsByFlow(flowId)

      let huboCambiosEnSurvey = false
      let todoOkSurvey = true

      for (const step of steps) {
        const claveRol = Number(step.id_rol ?? 0)
        const claveOrd = Number(step.flow_tmpl_step_orden ?? 0)

        const plantilla =
          flujosPlantilla.value.find(p => Number(p.id_rol) === claveRol) ||
          flujosPlantilla.value.find(p => Number(p.flow_tmpl_step_orden) === claveOrd)

        if (!plantilla) continue

        const idUserSel = normalizaNum(plantilla.id_user)
        const flagEquipo = !!plantilla.flag_equipo
        if (idUserSel == null) continue

        try {
          await apiAxios.put(urlPut, {
            id_flow_stp: step.id_flow_stp,
            id_user_flujo: Number(idUserSel),
            flag_equipo: flagEquipo
          })

          totalPuts++
          huboCambiosEnSurvey = true

          if (!flagEquipo && idUserSel) {
            try {
              await apiAxios.post(urlNotf, {
                id_user_target: Number(idUserSel),
                id_template: null,
                json_data: {
                  id_survey: idSurvey,
                  id_flow: flowId,
                  id_area: 6,
                  tipo_notf: 'asignacion_firma',
                  obs_notf: 'asignacion firma (masiva)'
                },
                channels: { channel: 'WEB' },
                estado: 'PENDING'
              })
            } catch (notfErr) {
              // ⚠️ Notificación fallida NO debería romper el proceso
              totalErrs++
              console.error('POST notfqueue error', notfErr)
            }
          }
        } catch (putErr) {
          totalErrs++
          todoOkSurvey = false
          console.error('PUT UpdUserFlow error', putErr)
        }
      }

      if (huboCambiosEnSurvey && todoOkSurvey) {
        try {
          await actualizarEstadoSurveyCreado(idSurvey)
          surveysConEstadoActualizado.push(idSurvey)
        } catch (estadoErr) {
          totalErrs++
          console.error('Error al actualizar estado a Creado', idSurvey, estadoErr)
        }
      }
    }

    pushToast(
      `Asignación masiva completada: ${totalPuts} cambios` +
        (surveysConEstadoActualizado.length
          ? `, ${surveysConEstadoActualizado.length} survey(s) pasaron a 'Creado'`
          : '') +
        (totalErrs ? `, ${totalErrs} error(es)` : ''),
      totalErrs ? 'warning' : 'success',
      4000
    )

    // ✅ refresco NO debe impedir cerrar modal
    try {
      await obtenerPersonalizados()
    } catch (refreshErr) {
      console.error('getSurveys() falló', refreshErr)
      // opcional: toast suave (o nada)
      pushToast('Se asignó, pero no pude refrescar el listado (recarga la página).', 'warning', 3500)
    }

  } catch (e) {
    console.error('asignarSurveyFlujo masivo', e)
    pushToast('Error al aplicar asignaciones masivas', 'error')
  } finally {
    // ✅ cierre garantizado
    onCerrarModal()
    guardando.value = false
  }
}

async function actualizarEstadoSurveyCreado (surveyId) {
  try {
    // 👇 AQUÍ pones tu endpoint real
    await apiAxios.post(
      '/survey/UpdSurveyEstado',
      {
        id_survey: surveyId,
        estado_srv: 'Creado'
      }
    )
  } catch (e) {
    console.error('❌ Error al actualizar estado a Creado:', e)
  }
}

// =====================
// Expose
// =====================
async function reload () {
  await obtenerPersonalizados()
}
defineExpose({ reload })

// =====================
// Mounted
// =====================
onMounted(async () => {
  await Promise.all([
    obtenerPersonalizados(),
    fetchUsuarios(),
    fetchRolesFlujo(),
    fetchUsuariosRoles(),
    obtenerEquiposProyectos()
  ])
})
</script>

<style scoped>
.pre-wrap { white-space: pre-line; }
.icon-row{
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
  white-space: nowrap;
}
.toast-stack { position: fixed; right: 16px; bottom: 16px; z-index: 4000; }
.text-truncate { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
