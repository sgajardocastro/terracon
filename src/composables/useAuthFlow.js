import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import apiAxios from '@/services/api'
import { useUserDetailStore } from '@/stores/userDetail'

const GOOGLE_CLIENT_ID = '900336188439-v2jr120b65dcvbi5j26kst05ldl73uou.apps.googleusercontent.com'

const RBAC_SCOPE_ROLES = {
  calidad: [14, 15, 16, 17, 18, 19],
  medioAmbiente: [20, 21, 22, 23, 24, 25],
  seguridad: [26, 27, 28, 29, 30, 31],
  seguimiento: [32, 33, 34, 35, 36, 37],
  general: [38, 39, 40, 41, 42, 43],
  gcia: [18, 24, 30, 36, 42],
  admin: [19, 25, 31, 37, 43],
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

export function useAuthFlow() {
  const userDetailStore = useUserDetailStore()
  const router = useRouter()

  const loginTab = ref('interno')
  const username = ref('')
  const password = ref('')
  const showPassword = ref(false)
  const JWT = ref('')

  const rut = ref('')
  const rutHint = ref('')
  const loadingRut = ref(false)
  const externalEmail = ref('')
  const showGoogleDialog = ref(false)

  const googleBtnRefInterno = ref(null)
  const googleBtnRefExterno = ref(null)

  const dialogMSN = ref(false)
  const proyectsIds = ref([])

  function gisReady() {
    return !!window.google?.accounts?.id
  }

  function normalizeRut(input) {
    const r = String(input || '').trim()
    if (!r) return ''

    let out = r.replace(/\./g, '').replace(/\s+/g, '')
    out = out.replace(/k$/i, 'K')
    return out
  }

  function initializeGIS({ loginHint } = {}) {
    if (!gisReady()) return false

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential,
      auto_select: false,
      cancel_on_tap_outside: true,
      login_hint: loginHint || undefined,
    })

    return true
  }

  function renderButton(el) {
    if (!gisReady() || !el) return false
    el.innerHTML = ''

    window.google.accounts.id.renderButton(el, {
      theme: 'outline',
      size: 'large',
      width: 280,
      type: 'standard',
      logo_alignment: 'left',
      text: 'signin_with',
    })

    return true
  }

  function promptGoogleWithLogs() {
    if (!gisReady()) return { ok: false, reason: 'google_not_ready', shouldFallback: true }

    let shouldFallback = false

    window.google.accounts.id.prompt((n) => {
      if (n.isDisplayed?.()) {
        shouldFallback = false
        console.log('[GIS prompt]', { state: 'displayed', raw: n })
        return
      }

      if (n.isNotDisplayed?.()) {
        shouldFallback = true
        console.warn('[GIS prompt] not displayed:', n.getNotDisplayedReason?.())
      }
      if (n.isSkippedMoment?.()) {
        shouldFallback = true
        console.warn('[GIS prompt] skipped:', n.getSkippedReason?.())
      }
      if (n.isDismissedMoment?.()) {
        shouldFallback = true
        console.warn('[GIS prompt] dismissed:', n.getDismissedReason?.())
      }

      console.log('[GIS prompt]', { shouldFallback, raw: n })
    })

    return { ok: true, shouldFallback }
  }

  onMounted(() => {
    localStorage.setItem('isLogin', 'false')
    localStorage.setItem('hasRole13', 'false')
    localStorage.setItem('isExternalCompany', 'false')

    const waitForGIS = () => {
      if (gisReady()) {
        initializeGIS()
        renderButton(googleBtnRefInterno.value)
      } else {
        setTimeout(waitForGIS, 150)
      }
    }

    waitForGIS()
  })

  function toBoolFlag(v) {
    return v === true || v === 1 || v === '1' || v === 'true' || v === 't'
  }

  async function resolveIsExternalCompany(user) {
    try {
      const companyId = Number(user?.id_empresa)
      if (!Number.isFinite(companyId) || companyId <= 0) return false

      const { data } = await apiAxios.get('/servicio/leanglobal/obtenerEmpresas')
      const empresas = Array.isArray(data) ? data : (Array.isArray(data?.datos) ? data.datos : [])
      const empresaUsuario = empresas.find(e => Number(e?.id_empresa) === companyId)

      return toBoolFlag(empresaUsuario?.flag_externo)
    } catch (error) {
      console.error('❌ Error validando empresa externa:', error?.response || error)
      return false
    }
  }

  async function continuarConRut() {
    try {
      rutHint.value = ''
      externalEmail.value = ''
      showGoogleDialog.value = false

      const rutNorm = normalizeRut(rut.value)
      if (!rutNorm) {
        rutHint.value = 'Ingresa un RUT.'
        return
      }

      loadingRut.value = true

      const resp = await apiAxios.get(`/usuarios/mail-rut/${encodeURIComponent(rutNorm)}`)
      const email = resp.data?.data?.email || resp.data?.email

      if (!email) {
        rutHint.value = 'No se encontró correo asociado a ese RUT.'
        return
      }

      externalEmail.value = email
      rutHint.value = `Continuando con: ${email}`

      if (!gisReady()) {
        rutHint.value = 'Google no está listo aún, intenta de nuevo.'
        return
      }

      initializeGIS({ loginHint: email })

      await nextTick()
      renderButton(googleBtnRefExterno.value)

      promptGoogleWithLogs()
    } catch (e) {
      if (e?.response?.status === 404) {
        rutHint.value = 'No existe correo asociado a ese RUT.'
        return
      }
      console.error('❌ Error en continuarConRut:', e?.response || e)
      rutHint.value = 'Error al buscar el correo por RUT.'
    } finally {
      loadingRut.value = false
    }
  }

  async function handleGoogleCredential(response) {
    try {
      console.log('[GOOGLE] Credential recibida:', response)

      if (!response?.credential) return

      const res = await apiAxios.post('/auth/login-google', { token: response.credential })
      if (!res.data?.token) return

      localStorage.setItem('token', res.data.token)
      JWT.value = res.data.token

      let email = res.data.email

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
          email = JSON.parse(jsonPayload).email
        } catch (e) {
          console.error('[GOOGLE] Error al decodificar ID token para obtener email:', e)
        }
      }

      if (!email) return

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
        password: password.value,
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
      console.warn('⚠️ No hay token')
      return
    }

    try {
      const response = await apiAxios.post('/auth/users/email', { email: emailParam })
      const user = Array.isArray(response.data) ? response.data[0] : response.data
      const isExternalCompany = await resolveIsExternalCompany(user)

      userDetailStore.userDetail = {
        ...user,
        isExternalCompany,
      }
    } catch (error) {
      console.error('❌ Error en autorización:', error.response || error)
    }
  }

  const hasAnyId = (rolesIds, ids) => ids.some(id => rolesIds.includes(id))

  function hasConexionRoleByNames(roleNames = []) {
    return (roleNames || []).some((r) => {
      const n = String(r || '').trim().toUpperCase()
      return n.startsWith('CNX-') || n.startsWith('CON-') || n.includes('-CNX-') || n.includes('-CON-')
    })
  }

  function canGoByIds(path, rolesIds, tieneRol13) {
    if (tieneRol13) return path === '/consulta'

    if (path === '/dashboard') {
      return hasAnyId(rolesIds, RBAC_SCOPE_ROLES.gcia) || hasAnyId(rolesIds, RBAC_SCOPE_ROLES.admin)
    }

    if (path === '/dashboardCalidad2') return hasAnyId(rolesIds, RBAC_SCOPE_ROLES.calidad)
    if (path === '/medioAmbiente') return hasAnyId(rolesIds, RBAC_SCOPE_ROLES.medioAmbiente)
    if (path === '/seguridad') return hasAnyId(rolesIds, RBAC_SCOPE_ROLES.seguridad)
    if (path === '/seguimiento') return hasAnyId(rolesIds, RBAC_SCOPE_ROLES.seguimiento)

    if (path === '/mantenedores') {
      return hasAnyId(rolesIds, RBAC_SCOPE_ROLES.general) || hasAnyId(rolesIds, RBAC_SCOPE_ROLES.admin)
    }

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
      const respUser = await apiAxios.get(
        `/servicio/leanglobal/obtenerUsuarios?email=${encodeURIComponent(email)}`
      )

      const user = Array.isArray(respUser.data)
        ? respUser.data[0]
        : respUser.data

      const respRoles = await apiAxios.get('/servicio/leanglobal/obtenerUsuariosRoles')
      const rolesAll = Array.isArray(respRoles.data) ? respRoles.data : []

      const rolesUser = rolesAll.filter(
        r => Number(r.id_user) === Number(user.id_user)
      )

      // Obtener catálogo de roles para resolver los nombres ya que obtenerUsuariosRoles no los retorna en la API
      const respCatalog = await apiAxios.get('/servicio/leanglobal/obtenerRoles')
      const catalog = Array.isArray(respCatalog.data) ? respCatalog.data : []
      const roleMap = new Map(catalog.map(r => [Number(r.id_rol), String(r.name_rol || '').trim()]))

      const rolesIds = rolesUser.map(r => Number(r.id_rol))
      const rolesNames = rolesUser
        .map(r => roleMap.get(Number(r.id_rol)) || '')
        .filter(Boolean)
      const isExternalCompany = await resolveIsExternalCompany(user)

      proyectsIds.value = await obtenerProjectsIds({ userId: Number(user.id_user) })

      userDetailStore.userDetail = {
        ...user,
        rolesIds,
        rolesNames,
        proyectsIds: proyectsIds.value,
        isExternalCompany,
      }

      const tieneRol13 = rolesIds.includes(13)

      const rawFlag = user.flag_proc_enrol
      const flag =
        rawFlag === true ||
        rawFlag === 1 ||
        rawFlag === 'true' ||
        rawFlag === 't'

      localStorage.setItem('rolesIds', JSON.stringify(rolesIds))
      localStorage.setItem('rolesNames', JSON.stringify(rolesNames))
      localStorage.setItem('proyectsIds', JSON.stringify(proyectsIds.value))
      localStorage.setItem('flag_proc_enrol', String(flag))
      localStorage.setItem('isLogin', 'true')
      localStorage.setItem('hasRole13', tieneRol13 ? 'true' : 'false')
      localStorage.setItem('isExternalCompany', isExternalCompany ? 'true' : 'false')

      if (flag) {
        return router.push('/enrolamientoDatos')
      }

      const hasConexionRole = hasConexionRoleByNames(rolesNames)
      if (hasConexionRole) return router.push('/conexion')

      if (isExternalCompany) return router.push('/conexion')
      if (tieneRol13) return router.push('/consulta')

      const first = resolveFirstAllowedRouteByIds({ rolesIds, tieneRol13 })
      return router.push(first)
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

  return {
    loginTab,
    username,
    password,
    showPassword,
    rut,
    rutHint,
    loadingRut,
    externalEmail,
    showGoogleDialog,
    dialogMSN,
    googleBtnRefInterno,
    googleBtnRefExterno,
    login,
    continuarConRut,
    closeGoogleDialog: () => {
      showGoogleDialog.value = false
    },
  }
}
