<template>
  <div class="pa-4">
    <v-card elevation="10">
      <v-card-title class="text-h6 bg-blue-darken-3 text-white py-4 px-6">
        <v-icon
          icon="mdi-shield-check-outline"
          start
        />
        Resumen Proyectos
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
              <th class="text-left">
                Código
              </th>
              <th class="text-left">
                Nombre Proyecto
              </th>
              <th class="text-left">
                Empresa
              </th>
              <th class="text-left">
                Administrador de Contrato
              </th>

              <th class="text-left">
                Inicio Plan
              </th>
              <th class="text-left">
                Fin Plan
              </th>
              <th class="text-left">
                Inicio Real
              </th>
              <th class="text-left">
                Fin Real
              </th>

              <th class="text-center">
                Avance Planificado
              </th>
              <th class="text-center">
                Avance Real
              </th>
              <th class="text-center">
                % Desviación
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(r, i) in rowsFiltradas"
              :key="i"
              style="cursor:pointer"
              @click="abrirCurvaS(r)"
            >
              <!-- ID Proyecto -->
              <td>{{ r.codi_proyecto }}</td>

              <!-- Nombre Proyecto -->
              <td>{{ r.nombre_proyecto }}</td>

              <!-- Empresa Cliente -->
              <td>{{ r.name_empresa_cliente ?? '—' }}</td>

              <!-- Usuario (Jefe de Proyecto) -->
              <td>{{ r.nombre_jefe_proyecto ?? '—' }}</td>

              <!-- Fechas Plan -->
              <td>
                {{ r.fecha_plan_ini ? r.fecha_plan_ini.slice(0, 10) : '—' }}
              </td>
              <td>
                {{ r.fecha_plan_fin ? r.fecha_plan_fin.slice(0, 10) : '—' }}
              </td>

              <!-- Fechas Reales -->
              <td>
                {{ r.fecha_real_ini ? r.fecha_real_ini.slice(0, 10) : '—' }}
              </td>
              <td>
                {{ r.fecha_real_fin ? r.fecha_real_fin.slice(0, 10) : '—' }}
              </td>

              <!-- Avances -->
              <td class="text-center">
                {{ r.unidades_planificadas ?? '—' }}
              </td>

              <td class="text-center">
                {{ r.unidades_reales ?? '-' }}
              </td>

              <!-- % Desviación -->
              <td class="text-center">
                {{ (r.pct_desviacion != null && String(r.pct_desviacion).trim() !== '') ? r.pct_desviacion : '—' }}
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>
  </div>

  <!-- ✅ Dialog Vuetify -->
  <v-dialog
    v-model="dlgCurvaS"
    max-width="1100"
  >
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <div class="text-h6">
          Curva S — {{ proyectoSel?.nombre_proyecto ?? '' }}
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="dlgCurvaS=false"
        />
      </v-card-title>

      <v-card-text>
        <CurvaS
          ref="curvaSRef"
          titulo="Curva S Plan / Real (Gantt)"
          :default-series="{ categories:[], plan:[], real:[] }"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import apiAxios from '@/services/api'
import { useRouter } from 'vue-router'
import CurvaS from '../components/GraficoSeguimiento.vue'

const router = useRouter()

const props = defineProps({
  fechaDesde: { type: String, default: '' }, // 'YYYY-MM-DD'
  fechaHasta: { type: String, default: '' }, // 'YYYY-MM-DD'
  filtro: { type: [Number, String], default: '' },   // id_empresa_cliente (valor)
  secatrib: { type: [Number, String], default: '' }  // id_proyecto (valor)
})

const dlgCurvaS = ref(false)
const proyectoSel = ref(null)
const curvaSRef = ref(null)

// Igual que tu Seguimiento, pero filtrando por proyecto seleccionado
async function cargarCurvaSPlanRealProyecto (idProyecto) {
  const url = '/servicio/leanglobal/obtenerGanttPlanReal'
  const { data } = await apiAxios.get(url)

  const rows = Array.isArray(data) ? data : []
  const filtrado = idProyecto
    ? rows.filter(r => Number(r.id_proyecto ?? r.proyecto_id ?? 0) === Number(idProyecto))
    : rows

  if (!filtrado.length) {
    return { categories: [], plan: [], real: [] }
  }

  const ordenado = [...filtrado].sort(
    (a, b) => new Date(a.fecha_registro ?? a.fecha) - new Date(b.fecha_registro ?? b.fecha)
  )

  const porDia = {}

  for (const r of ordenado) {
    let fecha = null

    if (typeof r.fecha_registro === 'string') fecha = r.fecha_registro.slice(0, 10)
    else if (r.fecha_registro instanceof Date) fecha = r.fecha_registro.toISOString().slice(0, 10)
    else if (typeof r.fecha === 'string') fecha = r.fecha.slice(0, 10)
    else if (r.fecha instanceof Date) fecha = r.fecha.toISOString().slice(0, 10)

    if (!fecha) continue

    const plan = Number(r.unidades_planificadas ?? 0) || 0
    const real = Number(r.unidades_reales ?? 0) || 0

    if (!porDia[fecha]) porDia[fecha] = { plan: 0, real: 0 }
    porDia[fecha].plan += plan
    porDia[fecha].real += real
  }

  const fechas = Object.keys(porDia).sort()
  const planDiario = fechas.map(f => porDia[f].plan)
  const realDiario = fechas.map(f => porDia[f].real)

  let accPlan = 0
  let accReal = 0

  const planAcum = planDiario.map(v => (accPlan += v))
  const realAcum = realDiario.map(v => (accReal += v))

  const categories = fechas.map(f => {
    const d = new Date(f)
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = d.toLocaleString('es-ES', { month: 'short' })
    return `${dd}-${mm}`
  })

  return { categories, plan: planAcum, real: realAcum }
}

async function abrirCurvaS (r) {
  proyectoSel.value = r
  dlgCurvaS.value = true

  await nextTick()

  const datos = await cargarCurvaSPlanRealProyecto(r?.id_proyecto)

  curvaSRef.value?.setSeries({
    categories: datos.categories,
    plan: datos.plan,
    real: datos.real
  })
}

watch(
  () => [props.fechaDesde, props.fechaHasta, props.filtro, props.secatrib],
  ([d1, d2, f, s]) => {
    console.log('Filtros hijo:', { d1, d2, f, s })
  },
  { immediate: true }
)

const rowsAll = ref([]) // datos completos
const loading = ref(false)

function irSeguimiento (r) {
  router.push({
    path: '/seguimiento',
    query: { id_proyecto: r?.id_proyecto ?? r?.codi_proyecto }
  })
}

function toDateOnly (v) {
  // v puede venir '2025-12-01T...' o '2025-12-01'
  if (!v) return null
  return String(v).slice(0, 10)
}

// ✅ filas filtradas (sin mutar rowsAll)
const rowsFiltradas = computed(() => {
  const desde = props.fechaDesde || null
  const hasta = props.fechaHasta || null

  const idEmp = Number(props.filtro ?? 0) || 0
  const idProy = Number(props.secatrib ?? 0) || 0

  return (rowsAll.value || []).filter(r => {
    // 1) filtra por empresa
    if (idEmp && Number(r.id_empresa_cliente ?? 0) !== idEmp) return false

    // 2) filtra por proyecto
    if (idProy && Number(r.id_proyecto ?? 0) !== idProy) return false

    // 3) filtra por fecha usando solape de rango:
    // proyecto entra si [ini, fin] cruza [desde, hasta]
    const ini = toDateOnly(r.fecha_plan_ini)
    const fin = toDateOnly(r.fecha_plan_fin)
    if (desde || hasta) {
      // si faltan fechas del proyecto y hay filtro de fecha, no se puede evaluar cruce
      if (!ini || !fin) return false
      if (hasta && ini > hasta) return false   // empieza después del rango
      if (desde && fin < desde) return false   // termina antes del rango
    }

    return true
  })
})

async function obtenerProyectosRows () {
  loading.value = true
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerProyectos')
    const arr = Array.isArray(data) ? data : (data?.datos ?? [])
    rowsAll.value = Array.isArray(arr) ? arr : []

    // si querís orden por id desc
    rowsAll.value.sort((a, b) => Number(b.id_proyecto ?? 0) - Number(a.id_proyecto ?? 0))

    console.log('rowsAll', rowsAll.value.length)
  } catch (err) {
    console.error('Error al obtener proyectos:', err?.response?.data || err.message)
    rowsAll.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  obtenerProyectosRows()
})
</script>

<style scoped>
tbody tr:hover {
  filter: brightness(0.97);
}
</style>
