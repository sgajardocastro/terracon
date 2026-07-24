// src/utils/perm.js

// Orden EXACTO como tu menú (ajusta si cambian tus rutas)
const MENU_ORDER = [
  '/dashboard',
  '/dashboardCalidad2',
  '/medioAmbiente',
  '/seguridad',
  '/seguimiento',
  '/mantenedores',
  '/surveys',
  '/documentos',
  '/consulta',
  '/enrolamientoDatos',
]

const normalizeRoles = (rolesNames = []) =>
  (rolesNames || [])
    .map(r => String(r || '').trim().toUpperCase())
    .filter(Boolean)

export function getStoredRoles() {
  let rolesNames = []
  try {
    rolesNames = JSON.parse(localStorage.getItem('rolesNames') || '[]')
  } catch {}
  return { rolesNames: normalizeRoles(rolesNames) }
}

export function hasRoleName(roleName) {
  const { rolesNames } = getStoredRoles()
  const want = String(roleName || '').trim().toUpperCase()
  return rolesNames.includes(want)
}

export function hasAnyProgRole() {
  const { rolesNames } = getStoredRoles()
  return rolesNames.some(r => r.endsWith('_PROG'))
}

// ✅ Match robusto: si allowed="GCIA" permite "GCIA" y también "*_GCIA"
function roleMatchesAllowed(roles, allowedList) {
  const rolesSet = new Set(normalizeRoles(roles))
  const allowed = (allowedList || []).map(x => String(x || '').trim().toUpperCase()).filter(Boolean)

  // exact match
  for (const a of allowed) {
    if (rolesSet.has(a)) return true
  }

  // sufijo match: *_GCIA, *_ADMIN, etc (solo si allowed no trae "_" ya)
  for (const a of allowed) {
    if (a.includes('_')) continue
    for (const r of rolesSet) {
      if (r.endsWith('_' + a)) return true
    }
  }

  return false
}

function hasAnyProg(roles) {
  return normalizeRoles(roles).some(r => r.endsWith('_PROG'))
}

/**
 * Permisos basados en meta:
 * - meta.anyProg => cualquier *_PROG
 * - meta.rolesAny => OR (acepta exacto y sufijo *_ROL)
 */
function canAccessByMeta(roles, meta) {
  if (meta?.anyProg) return hasAnyProg(roles)

  if (Array.isArray(meta?.rolesAny)) {
    return roleMatchesAllowed(roles, meta.rolesAny)
  }

  // si no define roles, es "ok" (solo requiere login si corresponde)
  return true
}

/**
 * Devuelve el PRIMER route del menú que el usuario pueda usar.
 */
export function resolveHomeRoute({ router, tieneRol13, flagProcEnrol, rolesNames }) {
  const roles = normalizeRoles(rolesNames)

  // Prioridades tuyas
  if (tieneRol13) return '/consulta'
  if (flagProcEnrol) return '/enrolamientoDatos'

  // meta real desde el router
  const routes = router.getRoutes()
  const metaByPath = new Map(routes.map(r => [r.path, r.meta || {}]))

  for (const path of MENU_ORDER) {
    const meta = metaByPath.get(path)
    if (!meta) continue
    if (canAccessByMeta(roles, meta)) return path
  }

  return '/sin-permisos'
}

/**
 * Verifica acceso a ruta según meta:
 * - meta.public => true
 * - meta.requiresAuth / meta.requireAuth => necesita login
 * - meta.anyProg => cualquier *_PROG
 * - meta.rolesAny => OR (acepta exacto y sufijo *_ROL)
 */
export function canAccessRoute(to) {
  if (to.meta?.public) return true

  const isLogin = localStorage.getItem('isLogin') === 'true'
  const needsAuth = !!(to.meta?.requiresAuth || to.meta?.requireAuth)

  if (needsAuth && !isLogin) return false

  // si no define reglas de roles, con estar logeado basta
  if (!to.meta?.anyProg && !to.meta?.rolesAny) return true

  const { rolesNames } = getStoredRoles()

  if (to.meta?.anyProg) return hasAnyProg(rolesNames)

  if (Array.isArray(to.meta?.rolesAny)) {
    return roleMatchesAllowed(rolesNames, to.meta.rolesAny)
  }

  return false
}
