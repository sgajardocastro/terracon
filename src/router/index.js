import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  // 👇 esto toma el base que le pasa Vite según el build (--base o vite.config.js)
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/', // antes: '/lg-terracon'
      name: 'Home',
      component: () => import('@/pages/login.vue'),
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/pages/login.vue'),
    },
    {
      path: '/surveys',
      name: 'Surveys',
      component: () => import('@/pages/surveys.vue'),
      meta: { requireAuth: true },
    },
    {
      path: '/survey',
      name: 'survey',
      component: () => import('@/pages/survey.vue'),
      meta: { requireAuth: true },
    },
    {
      path: '/survey2',
      name: 'survey2',
      component: () => import('@/pages/survey2.vue'),
      meta: { requireAuth: true },
    },
    {
      path: '/dashboardCalidad',
      name: 'dashboardCalidad',
      component: () => import('@/pages/dashboardCalidad.vue'),
      meta: { requireAuth: true },
    },
    {
      path: '/verSurveyPrint',
      name: 'verSurveyPrint',
      component: () => import('@/pages/verSurveyPrint.vue'),
    },
    {
      path: '/vehiculos',
      name: 'vehiculosPublic',
      component: () => import('@/pages/EquiposMoviles.vue'),
      meta: { public: true },
    },
    {
      path: '/equipamiento',
      name: 'equipamiento',
      component: () => import('@/pages/Equipamiento.vue'),
      meta: { public: true },
    },
    {
      path: '/documentos',
      alias: ['/gestion-documentos', '/gestionDocumentos'],
      name: 'documentos',
      component: () => import('@/pages/gestionDocumentos.vue'),
      meta: { requireAuth: true },
    },
    {
      path: '/enrolamiento',
      name: 'enrolamiento',
      component: () => import('@/pages/enrolamiento.vue'),
      meta: { requireAuth: true },
    },
    {
      path: '/enrolamientoDatos',
      name: 'enrolamientoDatos',
      component: () => import('@/pages/enrolamientoDatos.vue'),
    },
    {
      path: '/dashboardCalidad2',
      name: 'dashboardCalidad2',
      component: () => import('@/pages/dashboardCalidad2.vue'),
      meta: { requireAuth: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/pages/dashboard.vue'),
      meta: { requireAuth: true },
    },
    {
      path: '/conexion',
      name: 'conexion',
      component: () => import('@/pages/conexion.vue'),
      meta: { requireAuth: true },
    },
    {
      path: '/db-test',
      name: 'dbTest',
      component: () => import('@/pages/dbTest.vue'),
      meta: { requireAuth: true },
    },
    {
      path: '/medioAmbiente',
      name: 'medioAmbiente',
      component: () => import('@/pages/medioAmbiente.vue'),
      meta: { requireAuth: true },
    },
    {
      path: '/seguridad',
      name: 'seguridad',
      component: () => import('@/pages/dashboardSeguridad.vue'),
      meta: { requireAuth: true },
    },
    {
      path: '/seguimiento',
      name: 'seguimiento',
      component: () => import('@/pages/dashboardSeguimiento.vue'),
      meta: { requireAuth: true },
    },
    {
      path: '/ppd2',
      name: 'ppd2',
      component: () => import('@/pages/ppd2.vue'),
      meta: { requireAuth: true },
    },
    {
      path: '/consulta',
      name: 'consulta',
      component: () => import('@/pages/consulta.vue'),
      meta: { requireAuth: true },
    },
    {
      path: '/mantenedores',
      name: 'mantenedores',
      component: () => import('@/pages/DashboardMantenedores.vue'),
      meta: { requireAuth: true },
    },
    {
      path: '/gestionObservaciones',
      name: 'gestionObservaciones',
      component: () => import('@/pages/gestionObservaciones.vue'),
      meta: { requireAuth: true },
    },
    {
      path: '/setupProyecto',
      name: 'setupProyecto',
      component: () => import('@/pages/setupProyecto.vue'),
      meta: { requireAuth: true },
    },
  ],
})

// guard queda igual
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('isLogin') === 'true'
  const hasRole13 = localStorage.getItem('hasRole13') === 'true'
  const isExternalCompany = localStorage.getItem('isExternalCompany') === 'true'
  const flagProcEnrol = localStorage.getItem('flag_proc_enrol') === 'true'
  const dbTestAllowedEmail = 'mauricioocavieresr@gmail.com'

  const normalizeEmail = (v) => String(v || '').trim().toLowerCase()
  const canAccessDbTest = (() => {
    try {
      const persisted = JSON.parse(localStorage.getItem('userDetail') || '{}')
      const email = normalizeEmail(
        persisted?.userDetail?.email ||
        persisted?.userDetail?.codi_user
      )
      return email === dbTestAllowedEmail
    } catch {
      return false
    }
  })()

  if (to.meta.requireAuth) {
    if (!isAuthenticated) {
      return next({ name: 'Login' })
    }

    if (to.name === 'dbTest' && !canAccessDbTest) {
      return next({ name: 'conexion' })
    }

    // Si está en proceso de enrolamiento, siempre va primero a enrolamientoDatos.
    if (flagProcEnrol && to.name !== 'enrolamientoDatos') {
      return next({ name: 'enrolamientoDatos' })
    }

    if (isExternalCompany && to.name !== 'conexion') {
      return next({ name: 'conexion' })
    }

    if (hasRole13 && to.name !== 'consulta') {
      return next({ name: 'consulta' })
    }

    return next()
  }

  next()
})

export default router
