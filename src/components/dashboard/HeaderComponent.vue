<template>
  <header
    id="header"
    class="header left-pd"
  >
    <div class="header__container">
      <!-- ✅ HAMBURGUESA -->
      <button
        id="header-toggle"
        class="header__toggle"
        type="button"
        @click="toggleMenu"
      >
        <v-icon
          class="header__menu-icon"
          icon="mdi-menu"
        />
        <span
          v-if="AMBIENTE"
          :class="ambienteColorClass"
        >
          {{ AMBIENTE }}
        </span>
      </button>

      <!-- ✅ DERECHA: versión + usuario -->
      <div class="header__right">
        <span class="app-version">{{ appVersion }}</span>

        <v-menu
          location="bottom end"
          offset="10"
          :close-on-content-click="false"
        >
          <template #activator="{ props }">
            <button
              class="user-activator"
              v-bind="props"
              type="button"
            >
              <v-icon
                icon="mdi-account-circle-outline"
                size="22"
              />
              <v-icon
                icon="mdi-menu-down"
                size="22"
              />
            </button>
          </template>

          <v-card
            class="user-menu-card"
            elevation="10"
          >
            <v-card-text class="py-3">
              <div class="user-name">
                {{ fullName || 'Usuario' }}
              </div>
              <div class="user-email">
                {{ userEmail || '-' }}
              </div>
            </v-card-text>

            <v-divider />

            <v-card-text class="py-3">
              <div class="roles-title">
                Roles
              </div>
              <div class="roles-wrap">
                <v-chip
                  v-for="r in roles"
                  :key="r"
                  class="role-chip"
                  variant="outlined"
                  color="deep-purple-accent-4"
                  size="small"
                >
                  {{ r }}
                </v-chip>
                <span
                  v-if="!roles.length"
                  class="muted"
                >Sin roles</span>
              </div>
            </v-card-text>

            <v-divider />

            <v-list class="py-0">
              <v-list-item
                class="logout-item"
                @click="logout"
              >
                <template #prepend>
                  <v-icon
                    icon="mdi-logout"
                    class="logout-icon"
                  />
                </template>
                <v-list-item-title class="logout-text">
                  Cerrar Sesión
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserDetailStore } from '@/stores/userDetail'
import apiAxios from '@/services/api'

const router = useRouter()
const userDetailStore = useUserDetailStore()

const menuExpand = ref('')
const menuExpanded = ref(false)

const appVersion = computed(() => import.meta.env.VITE_APP_VERSION || 'v1.0.4')

const fullName = computed(() => {
  const n = userDetailStore.userDetail?.name_frst ?? ''
  const a = userDetailStore.userDetail?.apellido_pat ?? ''
  return `${n} ${a}`.trim()
})

const userEmail = computed(() => {
  const u = userDetailStore.userDetail || {}
  return u.email || u.correo || u.mail || u.user_email || u.username || ''
})

const rolesFromApi = ref([])
const rolesCatalog = ref([])

function normalizeRoles(raw) {
  if (Array.isArray(raw)) {
    return raw
      .map(r => {
        if (typeof r === 'string') return r
        if (r && typeof r === 'object') return r.name_rol || r.rol || r.nombre || ''
        return ''
      })
      .map(r => String(r || '').trim().toUpperCase())
      .filter(Boolean)
  }
  if (typeof raw === 'string') {
    return raw
      .split(',')
      .map(r => String(r || '').trim().toUpperCase())
      .filter(Boolean)
  }
  return []
}

function normalizeRoleIds(raw) {
  if (Array.isArray(raw)) {
    return raw
      .map(v => Number(v))
      .filter(n => Number.isFinite(n) && n > 0)
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return normalizeRoleIds(parsed)
    } catch {}
    return raw
      .split(',')
      .map(v => Number(String(v).trim()))
      .filter(n => Number.isFinite(n) && n > 0)
  }
  return []
}

const roles = computed(() => {
  const u = userDetailStore.userDetail || {}
  const fromStore = normalizeRoles(u.rolesNames || u.roles || u.roles_name || [])
  let arr = [...fromStore]

  if (!arr.length) {
    try {
      const lsNames = JSON.parse(localStorage.getItem('rolesNames') || '[]')
      arr = normalizeRoles(lsNames)
    } catch {}
  }

  if (!arr.length) {
    arr = normalizeRoles(rolesFromApi.value)
  }

  if (!arr.length) {
    const idsFromStore = normalizeRoleIds(u.rolesIds || u.roles_ids || [])
    let ids = [...idsFromStore]
    if (!ids.length) {
      try {
        ids = normalizeRoleIds(localStorage.getItem('rolesIds') || '[]')
      } catch {}
    }

    if (ids.length && rolesCatalog.value.length) {
      const byId = new Map(
        rolesCatalog.value.map(r => [Number(r.id_rol), String(r.name_rol || '').trim().toUpperCase()])
      )
      arr = ids.map(id => byId.get(Number(id))).filter(Boolean)
    }
  }

  return Array.from(new Set(arr))
})

async function hydrateRolesFallback() {
  if (roles.value.length) return
  try {
    const uid = Number(userDetailStore.userDetail?.id_user || 0)
    const [{ data: rolesData }, { data: userRolesData }] = await Promise.all([
      apiAxios.get('/servicio/leanglobal/obtenerRoles'),
      apiAxios.get('/servicio/leanglobal/obtenerUsuariosRoles')
    ])

    rolesCatalog.value = Array.isArray(rolesData) ? rolesData : []
    const allUserRoles = Array.isArray(userRolesData) ? userRolesData : []
    const mine = uid
      ? allUserRoles.filter(r => Number(r.id_user) === uid)
      : []

    const directNames = mine
      .map(r => String(r.name_rol || '').trim().toUpperCase())
      .filter(Boolean)

    if (directNames.length) {
      rolesFromApi.value = directNames
      return
    }

    const byId = new Map(
      rolesCatalog.value.map(r => [Number(r.id_rol), String(r.name_rol || '').trim().toUpperCase()])
    )
    const fromIds = mine
      .map(r => byId.get(Number(r.id_rol)))
      .filter(Boolean)

    rolesFromApi.value = Array.from(new Set(fromIds))
  } catch (e) {
    console.error('Error cargando roles para header:', e)
  }
}

const logout = async () => {
  localStorage.removeItem('token')
  localStorage.removeItem('rolesNames')
  localStorage.removeItem('rolesIds')
  localStorage.removeItem('proyectsIds')
  localStorage.removeItem('projectsIds')
  localStorage.removeItem('userDetail')
  localStorage.removeItem('isLogin')
  localStorage.removeItem('isExternalCompany')
  localStorage.removeItem('hasRole13')
  await router.push('/login')
}


const AMBIENTE = import.meta.env.VITE_APP_BASE_AMBIENTE || ''
const API = import.meta.env.VITE_API_BASE_URL || ''

// ✅ color automático según URL (dev/qa/prod)
const ambienteColorClass = computed(() => {
  const u = API.toLowerCase()
  if (u.includes('dev')) return 'text-red-darken-2'
  if (u.includes('qa') || u.includes('test')) return 'text-orange-darken-3'
  return 'text-green-darken-2' // prod
})
// ===== TU ORIGINAL =====
onMounted(() => {
  console.log('userDetailStore', userDetailStore.userDetail.name_frst)
  hydrateRolesFallback()
})

watch(
  () => userDetailStore.userDetail?.id_user,
  () => {
    hydrateRolesFallback()
  }
)

const BREAKPOINT = 1150

onMounted(() => {
  const sidebar = document.getElementById('sidebar')
  const header  = document.getElementById('header')
  const main    = document.getElementById('main')

  if (!sidebar) return

  const isMobile = window.innerWidth < BREAKPOINT

  if (isMobile) {
    sidebar.classList.remove('show-sidebar')
    header?.classList.remove('left-pd')
    main?.classList.remove('left-pd')
  } else {
    sidebar.classList.add('show-sidebar')
    header?.classList.add('left-pd')
    main?.classList.add('left-pd')
  }
})

const toggleMenu = () => {
  menuExpanded.value = !menuExpanded.value

  const sidebar = document.getElementById('sidebar')
  const header = document.getElementById('header')
  const main = document.getElementById('main')

  sidebar.classList.toggle('show-sidebar')
  header.classList.toggle('left-pd')
  main.classList.toggle('left-pd')
}
</script>

<style scoped>
/* Layout base */
.header__container{
  display:flex;
  align-items:center;
  width:100%;
}

/* Derecha siempre pegada a la derecha */
.header__right{
  display:flex;
  align-items:center;
  gap:10px;
  margin-left:auto;
}

/* ✅ Comportamiento "como antes":
   - Desktop: hamburguesa a la izquierda
   - Mobile: hamburguesa al final (derecha) */
.header__toggle{ order: 1; }
.header__right{ order: 2; }

@media (max-width: 1150px){
  .header__right{ order: 2; }
  .header__toggle{ order: 3; } /* se va a la derecha */
}

/* Tamaño hamburguesa (más grande en desktop) */
.header__menu-icon{ font-size: 30px; }
@media (max-width: 1150px){
  .header__menu-icon{ font-size: 26px; }
}

.app-version{
  font-weight:600;
  font-size:13px;
  opacity:.9;
}

.user-activator{
  display:inline-flex;
  align-items:center;
  gap:2px;
  padding:6px 6px;
  border-radius:10px;
  background:transparent;
  border:0;
  cursor:pointer;
}
.user-activator:hover{ background: rgba(0,0,0,.06); }

.user-menu-card{ width:280px; border-radius:12px; }
.user-name{ font-weight:700; font-size:16px; line-height:1.2; }
.user-email{ margin-top:2px; font-size:13px; opacity:.75; }

.roles-title{ font-size:12px; font-weight:700; opacity:.7; margin-bottom:8px; }
.roles-wrap{ display:flex; flex-wrap:wrap; gap:8px; }
.role-chip{ border-width:2px; font-weight:700; }
.muted{ font-size:13px; opacity:.6; }

.logout-item{ cursor:pointer; }
.logout-icon, .logout-text{ color:#e53935; font-weight:700; }
</style>
