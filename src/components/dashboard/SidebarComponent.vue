<template>
  <nav
    id="sidebar"
    class="sidebar show-sidebar"
  >
    <div class="sidebar__container">
      <div class="sidebar__user">
        <div class="sidebar__img">
          <img
            src="../../assets/logo.png"
            alt="image"
          >
        </div>

        <div class="sidebar__info">
          <h3>Lean Global</h3>
          <span>leanglobal@leanglobal.cl</span>
        </div>
      </div>

      <div class="sidebar__content">
        <div>
          <h3 class="sidebar__title">
            ÁMBITOS
          </h3>
          <!-- MENÚ COMPLETO SOLO SI NO ES ROL 13 -->
          <div
            v-if="isEnrolled && !isRole13 && !isExternalCompany"
            class="sidebar__list"
          >
            <RouterLink
              v-if="!isCnxOnlyMenu && (isGlobalAdmin || canAccessScope('gcia'))"
              to="/dashboard"
              class="sidebar__link"
              :class="{ 'active-link': isActiveRoute('/dashboard') }"
            >
              <v-badge
                class="icon-badge"
                :content="fmt(counts.principal)"
                :model-value="counts.principal > 0"
                color="error"
                location="top end"
                floating
                offset-x="2"
                offset-y="2"
              >
                <v-icon
                  icon="mdi-view-dashboard"
                  size="35"
                />
                <v-tooltip
                  v-if="isCollapsed"
                  activator="parent"
                  location="end"
                  :text="'Dashboard'"
                  open-delay="150"
                />
              </v-badge>
              <span class="sidebar__label">Dashboard</span>
            </RouterLink>
            <RouterLink
              v-if="!isCnxOnlyMenu && (isGlobalAdmin || canAccessScope('calidad'))"
              to="/dashboardCalidad2"
              class="sidebar__link"
              :class="{ 'active-link': isActiveRoute('/dashboardCalidad2') }"
            >
              <v-badge
                class="icon-badge"
                :content="fmt(counts.calidad)"
                :model-value="counts.calidad > 0"
                color="error"
                location="top end"
                floating
                offset-x="2"
                offset-y="2"
              >
                <v-icon
                  icon="mdi-medal"
                  size="35"
                />
                <v-tooltip
                  v-if="isCollapsed"
                  activator="parent"
                  location="end"
                  :text="'Gestión Calidad'"
                  open-delay="150"
                />
              </v-badge>
              <span class="sidebar__label">Gestión Calidad</span>
            </RouterLink>

            <RouterLink
              v-if="!isCnxOnlyMenu && (isGlobalAdmin || canAccessScope('medioAmbiente'))"
              to="/medioAmbiente"
              class="sidebar__link"
              :class="{ 'active-link': isActiveRoute('/medioAmbiente') }"
            >
              <v-badge
                class="icon-badge"
                :content="fmt(counts.medioAmbiente)"
                :model-value="counts.medioAmbiente > 0"
                color="error"
                location="top end"
                floating
                offset-x="2"
                offset-y="2"
              >
                <v-icon
                  icon="mdi-leaf-circle-outline"
                  size="35"
                />
                <v-tooltip
                  v-if="isCollapsed"
                  activator="parent"
                  location="end"
                  :text="'Medio Ambiente'"
                  open-delay="150"
                />
              </v-badge>
              <span class="sidebar__label">Medio Ambiente</span>
            </RouterLink>

            <RouterLink
              v-if="!isCnxOnlyMenu && (isGlobalAdmin || canAccessScope('seguridad'))"
              to="/seguridad"
              class="sidebar__link"
              :class="{ 'active-link': isActiveRoute('/seguridad') }"
            >
              <v-badge
                class="icon-badge"
                :content="fmt(counts.seguridad)"
                :model-value="counts.seguridad > 0"
                color="error"
                location="top end"
                floating
                offset-x="2"
                offset-y="2"
              >
                <v-icon
                  icon="mdi-security"
                  size="35"
                />
                <v-tooltip
                  v-if="isCollapsed"
                  activator="parent"
                  location="end"
                  :text="'Gestión de Seguridad'"
                  open-delay="150"
                />
              </v-badge>
              <span class="sidebar__label">Gestión de Seguridad</span>
            </RouterLink>

            <RouterLink
              v-if="!isCnxOnlyMenu && (isGlobalAdmin || canAccessScope('seguimiento'))"
              to="/seguimiento"
              class="sidebar__link"
              :class="{ 'active-link': isActiveRoute('/seguimiento') }"
            >
              <v-badge
                class="icon-badge"
                :content="fmt(counts.seguimiento)"
                :model-value="counts.seguimiento > 0"
                color="error"
                location="top end"
                floating
                offset-x="2"
                offset-y="2"
              >
                <v-icon
                  icon="mdi-chart-timeline"
                  size="35"
                />
                <v-tooltip
                  v-if="isCollapsed"
                  activator="parent"
                  location="end"
                  :text="'Seguimiento y Avance'"
                  open-delay="150"
                />
              </v-badge>
              <span class="sidebar__label">Seguimiento y Avance</span>
            </RouterLink>

            <RouterLink
              v-if="!isCnxOnlyMenu && canSeePpd2"
              to="/ppd2"
              class="sidebar__link"
              :class="{ 'active-link': isActiveRoute('/ppd2') }"
            >
              <v-icon
                icon="mdi-card-text-outline"
                size="35"
              />
              <span class="sidebar__label">PPD2</span>
            </RouterLink>

            <RouterLink
              to="/documentos"
              class="sidebar__link"
              :class="{ 'active-link': isActiveRoute('/documentos') }"
            >
              <v-badge
                class="icon-badge"
                :content="fmt(counts.documentos)"
                :model-value="counts.documentos > 0"
                color="error"
                location="top end"
                floating
                offset-x="2"
                offset-y="2"
              >
                <v-icon
                  icon="mdi-file-document-multiple-outline"
                  size="35"
                />
                <v-tooltip
                  v-if="isCollapsed"
                  activator="parent"
                  location="end"
                  :text="'Biblioteca Documental'"
                  open-delay="150"
                />
              </v-badge>
              <span class="sidebar__label">Biblioteca Documental</span>
            </RouterLink>

            <!--RouterLink
              to="/enrolamiento"
              class="sidebar__link"
              :class="{ 'active-link': isActiveRoute('/enrolamiento') }"
            >
              <v-badge class="icon-badge"
                :content="fmt(counts.enrolamiento)"
                :model-value="counts.enrolamiento > 0"
                color="error"
                location="top end"
                floating
                offset-x="2"
                offset-y="2"
              >
                <v-icon icon="mdi-human-capacity-increase" size="35" />
                <v-tooltip
                  v-if="isCollapsed"
                  activator="parent"
                  location="end"
                  :text="'Enrolamiento'"
                  open-delay="150"
                />
              </v-badge>
              <span class="sidebar__label">Enrolamiento</span>
            </RouterLink-->

            <RouterLink
              v-if="!isCnxOnlyMenu && !hasCnxRole"
              to="/consulta"
              class="sidebar__link"
              :class="{ 'active-link': isActiveRoute('/consulta') }"
            >
              <v-badge
                class="icon-badge"
                :content="fmt(counts.consulta)"
                :model-value="counts.consulta > 0"
                color="error"
                location="top end"
                floating
                offset-x="2"
                offset-y="2"
              >
                <v-icon
                  icon="mdi-database-search"
                  size="35"
                />
                <v-tooltip
                  v-if="isCollapsed"
                  activator="parent"
                  location="end"
                  :text="'Consulta'"
                  open-delay="150"
                />
              </v-badge>
              <span class="sidebar__label">Consulta</span>
            </RouterLink>

            <RouterLink
              to="/mantenedores"
              class="sidebar__link"
              :class="{ 'active-link': isActiveRoute('/mantenedores') }"
            >
              <v-badge
                class="icon-badge"
                :content="fmt(counts.mantenedores)"
                :model-value="counts.mantenedores > 0"
                color="error"
                location="top end"
                floating
                offset-x="2"
                offset-y="2"
              >
                <v-icon
                  icon="mdi-folder-wrench-outline"
                  size="35"
                />
                <v-tooltip
                  v-if="isCollapsed"
                  activator="parent"
                  location="end"
                  :text="'Mantenedores'"
                  open-delay="150"
                />
              </v-badge>
              <span class="sidebar__label">Mantenedores</span>
            </RouterLink>

            <RouterLink
              to="/setupProyecto"
              class="sidebar__link"
              :class="{ 'active-link': isActiveRoute('/setupProyecto') }"
            >
              <v-badge
                class="icon-badge"
                :model-value="false"
                color="error"
                location="top end"
                floating
                offset-x="2"
                offset-y="2"
              >
                <v-icon
                  icon="mdi-rocket-launch-outline"
                  size="35"
                />
                <v-tooltip
                  v-if="isCollapsed"
                  activator="parent"
                  location="end"
                  :text="'Setup Proyecto'"
                  open-delay="150"
                />
              </v-badge>
              <span class="sidebar__label">Setup Proyecto</span>
            </RouterLink>


            <RouterLink
              v-if="true"
              to="/conexion"
              class="sidebar__link"
              :class="{ 'active-link': isActiveRoute('/conexion') }"
            >
              <v-badge
                class="icon-badge"
                :content="fmt(counts.conexion)"
                :model-value="counts.conexion > 0"
                color="error"
                location="top end"
                floating
                offset-x="2"
                offset-y="2"
              >
                <v-icon
                  icon="mdi-connection"
                  size="35"
                />
                <v-tooltip
                  v-if="isCollapsed"
                  activator="parent"
                  location="end"
                  :text="'Conexión Metrogas'"
                  open-delay="150"
                />
              </v-badge>
              <span class="sidebar__label">Conexión Metrogas</span>
            </RouterLink>

            <RouterLink
              v-if="canSeeDbTest"
              to="/db-test"
              class="sidebar__link"
              :class="{ 'active-link': isActiveRoute('/db-test') }"
            >
              <v-icon
                icon="mdi-database-check"
                size="35"
              />
              <span class="sidebar__label">Test DB</span>
            </RouterLink>
          </div>

          <!-- CONSULTA SIEMPRE VISIBLE (PARA TODOS LOS ROLES QUE ESTÉN ENROLADOS) -->
          <div
            v-if="isEnrolled && isRole13 && !isExternalCompany"
            class="sidebar__list"
          >
            <RouterLink
              v-if="!hasCnxRole"
              to="/consulta"
              class="sidebar__link"
              :class="{ 'active-link': isActiveRoute('/consulta') }"
            >
              <v-badge
                class="icon-badge"
                :content="fmt(counts.consulta)"
                :model-value="counts.consulta > 0"
                color="error"
                location="top end"
                floating
                offset-x="2"
                offset-y="2"
              >
                <v-icon
                  icon="mdi-database-search"
                  size="35"
                />
                <v-tooltip
                  v-if="isCollapsed"
                  activator="parent"
                  location="end"
                  :text="'Consulta'"
                  open-delay="150"
                />
              </v-badge>
              <span class="sidebar__label">Consulta</span>
            </RouterLink>

            <RouterLink
              v-if="true"
              to="/conexion"
              class="sidebar__link"
              :class="{ 'active-link': isActiveRoute('/conexion') }"
            >
              <v-badge
                class="icon-badge"
                :content="fmt(counts.conexion)"
                :model-value="counts.conexion > 0"
                color="error"
                location="top end"
                floating
                offset-x="2"
                offset-y="2"
              >
                <v-icon
                  icon="mdi-connection"
                  size="35"
                />
                <v-tooltip
                  v-if="isCollapsed"
                  activator="parent"
                  location="end"
                  :text="'Conexión Metrogas'"
                  open-delay="150"
                />
              </v-badge>
              <span class="sidebar__label">Conexión Metrogas</span>
            </RouterLink>

            <RouterLink
              v-if="canSeeDbTest"
              to="/db-test"
              class="sidebar__link"
              :class="{ 'active-link': isActiveRoute('/db-test') }"
            >
              <v-icon
                icon="mdi-database-check"
                size="35"
              />
              <span class="sidebar__label">Test DB</span>
            </RouterLink>
          </div>

          <div
            v-if="isEnrolled && isExternalCompany"
            class="sidebar__list"
          >
            <RouterLink
              v-if="hasCnxRole"
              to="/conexion"
              class="sidebar__link"
              :class="{ 'active-link': isActiveRoute('/conexion') }"
            >
              <v-badge
                class="icon-badge"
                :content="fmt(counts.documentos)"
                :model-value="counts.documentos > 0"
                color="error"
                location="top end"
                floating
                offset-x="2"
                offset-y="2"
              >
                <v-icon
                  icon="mdi-file-document-multiple-outline"
                  size="35"
                />
                <v-tooltip
                  v-if="isCollapsed"
                  activator="parent"
                  location="end"
                  :text="'Documentos'"
                  open-delay="150"
                />
              </v-badge>
              <span class="sidebar__label">Documentos</span>
            </RouterLink>

            <RouterLink
              v-if="canSeeDbTest"
              to="/db-test"
              class="sidebar__link"
              :class="{ 'active-link': isActiveRoute('/db-test') }"
            >
              <v-icon
                icon="mdi-database-check"
                size="35"
              />
              <span class="sidebar__label">Test DB</span>
            </RouterLink>
          </div>
        </div>
      </div>

      <div class="sidebar__actions">
        <RouterLink
          to="/login"
          class="sidebar__link"
        >
          <v-icon icon="mdi-logout" />
          <span class="sidebar__label">Log Out</span>
        </RouterLink>
      </div>
    </div>
  </nav>
</template>
<script setup>
import { ref, onMounted, reactive, watchEffect, computed } from 'vue'
import { useApiWatcher } from '/src/useApiWatcher.js'
import apiAxios from '@/services/api';
import { useRoute } from 'vue-router'
import { useUserDetailStore } from "@/stores/userDetail";

const userDetailStore = useUserDetailStore()

const darkTheme = 'dark-theme'
const themeButton = ref(null)
const themeIcon = ref('mdi-white-balance-sunny');

const route = useRoute()
const isEnrolled = ref(true)     // lo tuyo
const isCollapsed = ref(true)    // â† colapsado: muestra tooltip

const areas = ref([])
const roles = ref([])
const rolesCatalog = ref([])

const RBAC_SCOPE_ROLES = {
  calidad: [14, 15, 16, 17, 18, 19], // QLTY_*
  medioAmbiente: [20, 21, 22, 23, 24, 25], // MEAM_*
  seguridad: [26, 27, 28, 29, 30, 31], // SECU_*
  seguimiento: [32, 33, 34, 35, 36, 37], // AVAN_*
  general: [38, 39, 40, 41, 42, 43], // GRAL_*

  // âœ… Solo GCIA (visualización gerencial) de cualquier módulo
  gcia: [18, 24, 30, 36, 42],     // *_GCIA
}

const userRolesIds = computed(() => {
  const fromStore = Array.isArray(userDetailStore.userDetail?.rolesIds)
    ? userDetailStore.userDetail.rolesIds
    : []
  let fromStorage = []
  try {
    fromStorage = JSON.parse(localStorage.getItem('rolesIds') || '[]')
  } catch {
    fromStorage = []
  }
  return Array.from(new Set([...(fromStore || []), ...(fromStorage || [])]))
    .map(v => Number(v))
    .filter(n => Number.isFinite(n) && n > 0)
})

const userRolesNames = computed(() => {
  const fromStore = Array.isArray(userDetailStore.userDetail?.rolesNames)
    ? userDetailStore.userDetail.rolesNames
    : []

  let fromStorage = []
  try {
    fromStorage = JSON.parse(localStorage.getItem('rolesNames') || '[]')
  } catch {
    fromStorage = []
  }

  return Array.from(new Set([...(fromStore || []), ...(fromStorage || [])]))
    .map(r => String(r || '').trim().toUpperCase())
    .filter(Boolean)
})

const hasCnxRole = computed(() => {
  if (userRolesNames.value.some(r => r.startsWith('CNX-'))) return true

  const cnxRoleIds = new Set(
    (rolesCatalog.value || [])
      .filter(r => String(r?.name_rol || '').trim().toUpperCase().startsWith('CNX-'))
      .map(r => Number(r.id_rol))
      .filter(Number.isFinite)
  )
  if (cnxRoleIds.size && userRolesIds.value.some(id => cnxRoleIds.has(Number(id)))) return true

  const uid = Number(userDetailStore.userDetail?.id_user)
  if (!uid) return false

  return (roles.value || []).some(r =>
    Number(r.id_user) === uid && (
      String(r.name_rol || '').trim().toUpperCase().startsWith('CNX-') ||
      cnxRoleIds.has(Number(r.id_rol))
    )
  )
})

const currentUserRoleNames = computed(() => {
  const fromStore = (userRolesNames.value || [])
  const uid = Number(userDetailStore.userDetail?.id_user || 0)
  const fromApi = (roles.value || [])
    .filter(r => Number(r?.id_user) === uid)
    .map(r => String(r?.name_rol || '').trim().toUpperCase())
    .filter(Boolean)
  return Array.from(new Set([...(fromStore || []), ...(fromApi || [])]))
})

const isCnxOnlyMenu = computed(() => {
  const names = currentUserRoleNames.value || []
  if (!names.length) return false
  const hasAnyCnx = names.some(n => String(n || '').trim().toUpperCase().startsWith('CNX-'))
  if (!hasAnyCnx && !hasCnxRole.value) return false
  if (!names.length) return false
  return names.every(n => String(n || '').trim().toUpperCase().startsWith('CNX-'))
})

const normalizeRoleName = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim()
  .toUpperCase()

const canSeePpd2 = computed(() => {
  return currentUserRoleNames.value.some((roleName) => normalizeRoleName(roleName) === 'AVAN_EJEC')
})

function canAccessScope(scopeKey) {
  const requiredRoles = RBAC_SCOPE_ROLES[scopeKey] || []
  return requiredRoles.some(rid => userRolesIds.value.includes(rid))
}

const isGlobalAdmin = computed(() =>
  userRolesIds.value.some(rid => RBAC_SCOPE_ROLES.general.includes(rid))
)

const isRole13 = computed(() => {
  return localStorage.getItem('hasRole13') === 'true'
})

const isExternalCompany = computed(() => {
  return (
    userDetailStore.userDetail?.isExternalCompany === true ||
    localStorage.getItem('isExternalCompany') === 'true'
  )
})

const DB_TEST_ALLOWED_EMAIL = 'mauricioocavieresr@gmail.com'
const normalizeEmail = (v) => String(v || '').trim().toLowerCase()
const canSeeDbTest = computed(() => {
  const byStore = normalizeEmail(
    userDetailStore.userDetail?.email ||
    userDetailStore.userDetail?.codi_user
  )
  if (byStore === DB_TEST_ALLOWED_EMAIL) return true

  try {
    const persisted = JSON.parse(localStorage.getItem('userDetail') || '{}')
    const byLocal = normalizeEmail(
      persisted?.userDetail?.email ||
      persisted?.userDetail?.codi_user
    )
    return byLocal === DB_TEST_ALLOWED_EMAIL
  } catch {
    return false
  }
})
// ðŸ”§ Helper genérico para ordenar por texto (con tildes y números)
const sortByText = (arr, selector) =>
  [...(arr ?? [])].sort((a, b) =>
    String(selector(a) ?? '').localeCompare(String(selector(b) ?? ''), 'es', {
      sensitivity: 'base',
      numeric: true,
    })
  );

const obtenerAreas = async () => {
  try {
    const { data } = await apiAxios.get(
      '/servicio/leanglobal/obtenerAreas?id_empresa=2'
    )
    areas.value = sortByText(data, x => x.name_area)
    console.log('Áreas obtenidas:', areas.value)
  } catch (err) {
    console.error('Error al obtener áreas:', err)
  }
}

const watcher = useApiWatcher({
  url: '/servicio/leanglobal/obtenerNortificaciones',   // ðŸ‘ˆ solo la ruta
  method: 'get',
  params: {
    id_user_target: userDetailStore.userDetail?.id_user // ðŸ‘ˆ va como query param
  },
  axiosInstance: apiAxios,
  intervalMs: 10000,
  maxIntervalMs: 60000,
  backoffFactor: 2,
  immediate: true,
})

// ðŸ‘‰ Cada vez que llegue un snapshot nuevo, lo copias a counts
watchEffect(() => {
  const snap = watcher.data.value

  if (snap?.counts) {
    // si el backend ya te entrega counts listos
    counts.calidad = Number(snap.counts.calidad || 0)
    counts.documentos = Number(snap.counts.documentos || 0)
    counts.enrolamiento = Number(snap.counts.enrolamiento || 0)
    counts.medioAmbiente = Number(snap.counts.medioAmbiente || 0)
    counts.seguridad = Number(snap.counts.seguridad || 0)
    counts.conexion = Number(snap.counts.conexion || 0)
  } else if (Array.isArray(snap)) {
    // si viene como array de notificaciones, contamos por id_area
    aplicarCountsDesdeNotifs(snap)
  }
})

function isActiveRoute(path) {
  return route.path === path
}

const counts = reactive({
  calidad: 0,
  documentos: 0,
  enrolamiento: 0,
  medioAmbiente: 0,
  seguridad: 0,
  conexion: 0,
})

// nombre de Ã¡rea (de la API) â†’ clave en counts
const AREA_ID_TO_KEY = {
  1: 'calidad',
  2: 'seguridad',
  3: 'medioAmbiente',
  4: 'enrolamiento',
  6: 'documentos',        // ðŸ‘ˆ aquÃ­ documentos = id_area 6
  8: 'conexion',
}


function aplicarCountsDesdeNotifs(notifs) {
  counts.calidad = counts.documentos = counts.enrolamiento = counts.medioAmbiente = counts.seguridad = counts.conexion = 0

  for (const n of (notifs || [])) {
    const idArea = Number(n?.json_data?.id_area)
    const key = AREA_ID_TO_KEY[idArea]
    if (key) counts[key]++
  }
}

// id_area -> nombre_area (en minúscula)
const areasById = computed(() => {
  const m = new Map()
  for (const a of (areas.value || [])) {
    m.set(Number(a.id_area), String(a.name_area || '').toLowerCase())
  }
  return m
})

// Devuelve string y â€œ99+â€ para más de 99
const fmt = (n) => (n > 99 ? '99+' : String(n))

const toggleTheme = () => {
  document.body.classList.toggle(darkTheme)
  themeIcon.value = document.body.classList.contains(darkTheme) ? 'mdi-moon-waxing-crescent' : 'mdi-white-balance-sunny'
}

onMounted(async () => {
  await obtenerUsuariosRoles();
  await obtenerRolesCatalog();
  await obtenerAreas();
  // Al cargar, aseguramos que el tema claro estÃ© activo
  document.body.classList.remove(darkTheme);
  themeIcon.value = 'mdi-white-balance-sunny';

  isEnrolled.value = localStorage.getItem('flag_proc_enrol') === 'false';
})

const obtenerUsuariosRoles = async () => {
  try {
    const { data } = await apiAxios.get(
      '/servicio/leanglobal/obtenerUsuariosRoles'
    )
    roles.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('roles error:', e)
    roles.value = []
  }
}

const obtenerRolesCatalog = async () => {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerRoles')
    rolesCatalog.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('roles catalog error:', e)
    rolesCatalog.value = []
  }
}
</script>

<style scoped>
@import '@/styles/dashboard.scss';

/* Oculta nombre/correo cuando el sidebar está colapsado, sin importar el tamaÃ±o */
.sidebar.show-sidebar .sidebar__info {
  display: none !important;
}


.sidebar__img {
  width: 72px !important;
  height: 72px !important;
  background-color: transparent !important;
  border-radius: 0 !important;
}

.sidebar__img img {
  position: static !important;
  width: 100% !important;
  height: 100% !important;
  object-fit: contain;
  border-radius: 0 !important;
}

.sidebar.show-sidebar .sidebar__user {
  display: flex !important;
  justify-content: center;
  align-items: center;
  padding-left: 0 !important;
}

/* sin tooltip â€œcaseroâ€ â€” solo ocultamos el texto cuando está colapsado */
</style>




