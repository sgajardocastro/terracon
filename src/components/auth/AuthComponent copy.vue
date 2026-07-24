<template>
  <v-container class="contenedor-form">
    <v-row
      class="ma-0"
      align="center"
      justify="center"
    >
      <v-col
        cols="12"
        sm="10"
        md="8"
        lg="6"
        xl="4"
      >
        <v-card class="elevation-12 card-form">
          <v-img
            src="@/assets/logo.png"
            alt="Logo Terracon"
            class="mx-auto my-6"
            max-width="200"
          />
          <v-card-text>
            <v-form
              class="d-grid ga-3"
              @submit.prevent="login"
            >
              <v-text-field
                v-model.trim="username"
                label="Usuario / Email"
                autocomplete="username"
                density="comfortable"
                variant="outlined"
                hide-details="auto"
                rounded="lg"
              >
                <template #prepend-inner>
                  <v-icon color="green-darken-2">
                    mdi-account
                  </v-icon>
                </template>
              </v-text-field>

              <v-text-field
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                label="Contraseña"
                autocomplete="current-password"
                density="comfortable"
                variant="outlined"
                hide-details="auto"
                rounded="lg"
              >
                <template #prepend-inner>
                  <v-icon color="green-darken-2">
                    mdi-lock
                  </v-icon>
                </template>
                <template #append-inner>
                  <v-icon
                    :icon="showPassword ? 'mdi-eye-off' : 'mdi-eye-outline'"
                    color="grey-darken-1"
                    class="cursor-pointer"
                    :title="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </v-text-field>

              <div class="mt-2 w-100">
                <v-btn
                  type="submit"
                  color="primary"
                  variant="flat"
                  :height="44"
                  class="w-100 rounded-lg btn-full"
                >
                  Iniciar Sesión
                </v-btn>
              </div>
            </v-form>

            <v-row
              class="my-6"
              align="center"
              no-gutters
            >
              <v-col><v-divider /></v-col>
              <span class="mx-4 text-medium-emphasis text-caption">O</span>
              <v-col><v-divider /></v-col>
            </v-row>

            <!-- Botón oficial GIS (se renderiza aquí) -->
            <div class="my-2 d-flex justify-center">
              <div ref="googleBtnRef" />
            </div>

            <!-- Botón custom para disparar One Tap (opcional) -->
            <!--v-btn
              block
              :height="44"
              variant="tonal"
              color="red-darken-1"
              class="text-none font-weight-semibold"
              @click="loginWithGoogle"
            >
              <template #prepend>
                <v-icon start>mdi-google</v-icon>
              </template>
              Acceder con Google
            </v-btn-->
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog
      v-model="dialogMSN"
      persistent
      max-width="420"
    >
      <v-card class="pa-4">
        <div class="d-flex align-center ga-4">
          <v-progress-circular
            indeterminate
            :size="28"
          />
          <div class="text-subtitle-1">
            Procesando login MSN...
          </div>
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import apiAxios from '@/services/api';
import { useRouter } from 'vue-router'
import { useUserDetailStore } from '@/stores/userDetail'

const userDetailStore = useUserDetailStore()
const username = ref('')
const password = ref('')
const JWT = ref('')
const router = useRouter()
const showPassword = ref(false)
const dialogMSN = ref(false)
const googleBtnRef = ref(null)
const proyectsIds = ref([])

const GOOGLE_CLIENT_ID = '900336188439-v2jr120b65dcvbi5j26kst05ldl73uou.apps.googleusercontent.com'

onMounted(() => {
  localStorage.setItem('isLogin', 'false')
  localStorage.setItem('hasRole13', 'false')

  // Asegurar que el script GIS esté cargado antes de inicializar
  const initGIS = () => {
    // eslint-disable-next-line no-undef
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential,
      auto_select: false,
      cancel_on_tap_outside: true
    })
    if (googleBtnRef.value) {
      // eslint-disable-next-line no-undef
      google.accounts.id.renderButton(googleBtnRef.value, {
        theme: 'outline',
        size: 'large',
        width: 280,
        type: 'standard',
        logo_alignment: 'left',
        text: 'signin_with'
      })
    }
    // (Opcional) Mostrar One Tap:
    // google.accounts.id.prompt()
  }

  // Si el script aún no está, esperamos un poco
  const waitForGIS = () => {
    if (window.google?.accounts?.id) {
      initGIS()
    } else {
      setTimeout(waitForGIS, 100)
    }
  }
  waitForGIS()
})

// Botón custom: dispara One Tap / flujo GIS
function loginWithGoogle() {
  if (!window.google?.accounts?.id) return
  // eslint-disable-next-line no-undef
  google.accounts.id.prompt()
}

// Respuesta de Google (ID Token en response.credential)
// Respuesta de Google (ID Token en response.credential)
async function handleGoogleCredential(response) {
  try {
    console.log('[GOOGLE] Credential recibida:', response)

    if (!response || !response.credential) {
      console.warn('[GOOGLE] No se recibió response.credential')
      return
    }

    // 1) Enviar SOLO el ID token al backend para verificación
    const res = await apiAxios.post(
      '/auth/login-google',
      { token: response.credential }
    )

    // 2) Validar respuesta del backend
    if (!res.data || !res.data.token) {
      console.error('[GOOGLE] Respuesta sin token desde backend:', res.data)
      return
    }

    // Tu backend devuelve TU JWT de sesión (ya cifrado)
    localStorage.setItem('token', res.data.token)
    JWT.value = res.data.token

    // 3) Email preferentemente desde backend
    let email = res.data.email

    // Respaldo: si por alguna razón no viene email en res.data,
    // lo sacamos del ID token de Google
    if (!email) {
      try {
        const base64Url = response.credential.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        )
        const googleUser = JSON.parse(jsonPayload)
        email = googleUser.email
        console.log('[GOOGLE] Email obtenido desde ID token:', email)
      } catch (e) {
        console.error('[GOOGLE] Error al decodificar ID token para obtener email:', e)
      }
    }

    if (!email) {
      console.error('[GOOGLE] No se pudo determinar el email del usuario')
      return
    }

    // 4) Flujo normal: llenar store y verificar enrolamiento
    await authorization(email)
    await verificarEnrolamiento(email)
  } catch (err) {
    console.error('❌ Error en login con Google:', err?.response || err)
  }
}

async function login() {
  try {
    const response = await apiAxios.post('/auth/login-email', {
      email: username.value,
      password: password.value
    })
    localStorage.setItem('token', response.data.token)
    JWT.value = response.data.token

    await authorization(username.value)
    await verificarEnrolamiento(username.value)
  } catch (error) {
    console.error('❌ Error en login POP3:', error.response || error)
    localStorage.setItem('isLogin', 'false')
  }
}

async function authorization(emailParam) {
  if (!JWT.value) {
    console.warn('⚠️ No hay token'); return
  }
  try {
    const response = await apiAxios.post('/auth/users/email', {
      email: emailParam || username.value
    })
    const user = Array.isArray(response.data) ? response.data[0] : response.data
    userDetailStore.userDetail = user
    // console.log('✅ userDetail:', userDetailStore.userDetail)
  } catch (error) {
    console.error('❌ Error en autorización:', error.response || error)
  }
}

// === Permisos por IDs (igual a lo que ya estabas usando en Sidebar) ===
const RBAC_SCOPE_ROLES = {
  calidad:       [14, 15, 16, 17, 18, 19],
  medioAmbiente: [20, 21, 22, 23, 24, 25],
  seguridad:     [26, 27, 28, 29, 30, 31],
  seguimiento:   [32, 33, 34, 35, 36, 37],
  general:       [38, 39, 40, 41, 42, 43],

  // columnas transversales (GCIA / ADMIN) por módulo
  gcia:          [18, 24, 30, 36, 42],
  admin:         [19, 25, 31, 37, 43],
}

const MENU_ORDER = [
  '/dashboard',
  '/dashboardCalidad2',
  '/medioAmbiente',
  '/seguridad',
  '/seguimiento',
  '/mantenedores',
  '/documentos',
]

// helpers
const hasAnyId = (rolesIds, ids) => ids.some(id => rolesIds.includes(id))

function canGoByIds(path, rolesIds, tieneRol13) {
  if (tieneRol13) return path === '/consulta'

  // Dashboard general: si tiene cualquier GCIA o ADMIN (de cualquier módulo)
  if (path === '/dashboard') {
    return hasAnyId(rolesIds, RBAC_SCOPE_ROLES.gcia) || hasAnyId(rolesIds, RBAC_SCOPE_ROLES.admin)
  }

  if (path === '/dashboardCalidad2') return hasAnyId(rolesIds, RBAC_SCOPE_ROLES.calidad)
  if (path === '/medioAmbiente')     return hasAnyId(rolesIds, RBAC_SCOPE_ROLES.medioAmbiente)
  if (path === '/seguridad')         return hasAnyId(rolesIds, RBAC_SCOPE_ROLES.seguridad)
  if (path === '/seguimiento')       return hasAnyId(rolesIds, RBAC_SCOPE_ROLES.seguimiento)

  // Mantenedores: normalmente es "general/admin" (ajusta si lo manejas distinto)
  if (path === '/mantenedores') {
    return hasAnyId(rolesIds, RBAC_SCOPE_ROLES.general) || hasAnyId(rolesIds, RBAC_SCOPE_ROLES.admin)
  }

  // Documentos: lo dejo abierto si está logeado (ajusta si quieres)
  if (path === '/documentos') return true

  return false
}

function resolveFirstAllowedRouteByIds({ rolesIds, tieneRol13 }) {
  for (const path of MENU_ORDER) {
    if (canGoByIds(path, rolesIds, tieneRol13)) return path
  }
  return '/sin-permisos'
}

async function verificarEnrolamiento(email) {
  try {
    // 1) Obtener usuario por email
    const respUser = await apiAxios.get(
      `/servicio/leanglobal/obtenerUsuarios?email=${encodeURIComponent(email)}`
    )

    const user = Array.isArray(respUser.data)
      ? respUser.data[0]
      : respUser.data

    // 2) Obtener TODOS los roles
    const respRoles = await apiAxios.get(
      '/servicio/leanglobal/obtenerUsuariosRoles'
    )

    const rolesAll = Array.isArray(respRoles.data)
      ? respRoles.data
      : []

    // 3) Roles del usuario (ids NUMÉRICOS + names STRING)
    const rolesUser = rolesAll.filter(
      r => Number(r.id_user) === Number(user.id_user)
    )

    const rolesIds = rolesUser.map(r => Number(r.id_rol))
    const rolesNames = rolesUser
      .map(r => String(r.name_rol || '').trim())
      .filter(Boolean)

    // 4) ProjectsIds (ANTES de guardar en store / localStorage)
    proyectsIds.value = await obtenerProjectsIds({
      userId: Number(user.id_user)
    })

    console.log('✅ projectsIds del usuario:', proyectsIds.value)

    // 5) Guardar en store
    userDetailStore.userDetail = {
      ...user,
      rolesIds,
      rolesNames,
      proyectsIds: proyectsIds.value
    }

    // 6) Ver si tiene rol 13 (NUMÉRICO)
    const tieneRol13 = rolesIds.includes(13)

    // 7) Flag de enrolamiento
    const rawFlag = user.flag_proc_enrol
    const flag =
      rawFlag === true ||
      rawFlag === 1 ||
      rawFlag === 'true' ||
      rawFlag === 't'

    // 8) Guardar en localStorage (fuente de verdad para permisos)
    localStorage.setItem('rolesIds', JSON.stringify(rolesIds))
    localStorage.setItem('rolesNames', JSON.stringify(rolesNames))
    localStorage.setItem('proyectsIds', JSON.stringify(proyectsIds.value))
    localStorage.setItem('flag_proc_enrol', String(flag))
    localStorage.setItem('isLogin', 'true')
    localStorage.setItem('hasRole13', tieneRol13 ? 'true' : 'false')

    // 9) Redirecciones (IGUAL QUE ANTES)
    if (tieneRol13) {
      return router.push('/consulta')
    }

    if (flag) {
      return router.push('/enrolamientoDatos')
    } else {
      const first = resolveFirstAllowedRouteByIds({ rolesIds, tieneRol13 })
      return router.push(first)
    }

  } catch (error) {
    console.error('❌ Error en verificación de enrolamiento:', error.response || error)
    localStorage.setItem('isLogin', 'false')
  }
}

async function obtenerProjectsIds({ userId }) {
  try {
    const resp = await apiAxios.get('/servicio/leanglobal/obtenerProyectoUser')
    console.log('[obtenerProyectoUser] raw:', resp.data)

    const arr = Array.isArray(resp.data) ? resp.data : (resp.data?.datos ?? [])
    const arrFiltered = arr.filter(item => Number(item.id_user) === Number(userId))

    return [...new Set(
      arrFiltered.map(x => Number(x.id_proyecto)).filter(Number.isFinite)
    )]
  } catch (e) {
    console.error('❌ Error obteniendo projectsIds:', e?.response || e)
    return []
  }
}
</script>

<style scoped>
.contenedor-form { min-height: 100dvh; display: flex; align-items: center; padding: 16px; }
.card-form { border-radius: 16px; overflow: hidden; }
.form-grid > * + * { margin-top: 12px; }
.google-btn { width: 100%; display: flex; justify-content: center; }
@media (max-width: 600px) {
  .card-form { border-radius: 12px; box-shadow: none; }
}
.btn-base :deep(.v-btn__content) { text-transform: none; letter-spacing: 0.3px; font-weight: 600; }
.btn-base { border-radius: 12px; }
.btn-full { min-width: 0; }
.d-grid { display: grid; gap: 12px; }
</style>
