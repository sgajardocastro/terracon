<template>
  <div
    ref="rootRef"
    class="ganttA"
  >
    <!-- ===== CABECERA (arriba) ===== -->
    <div class="topbar">
      <div class="top-left top-left-row">
        <!-- IZQ: Usuario + Personalizado -->
        <div class="user-line">
          <div class="user-name">
            {{ headerUsuario }}
          </div>
          <div class="user-meta">
            <span class="muted">Personalizado: {{ headerIdPer }}</span>
          </div>
        </div>

        <div class="user-line">
          <div class="user-name">
            {{ headerPeriodo }}
          </div>
          <div class="user-meta">
            <span class="muted">{{ headerSub }}</span>
          </div>
        </div>
      </div>

      <!-- KPI chips (colores tipo dots) -->
      <div class="top-kpis">
        <div
          class="kpi kpi-plan"
          :style="chipStyle('PLAN')"
        >
          <div class="kpi-val">
            {{ kpi.plan }}
          </div>
          <div class="kpi-lbl">
            Plan
          </div>
        </div>
        <div
          class="kpi kpi-term"
          :style="chipStyle('TERM')"
        >
          <div class="kpi-val">
            {{ kpi.term }}
          </div>
          <div class="kpi-lbl">
            Term
          </div>
        </div>
        <div
          class="kpi kpi-atras"
          :style="chipStyle('ATRAS')"
        >
          <div class="kpi-val">
            {{ kpi.atras }}
          </div>
          <div class="kpi-lbl">
            Atras
          </div>
        </div>
        <div
          class="kpi kpi-pend"
          :style="chipStyle('PEND')"
        >
          <div class="kpi-val">
            {{ kpi.pend }}
          </div>
          <div class="kpi-lbl">
            Pend
          </div>
        </div>

        <div class="kpi kpi-pct">
          <div
            class="pct-pill"
            :style="chipStyle('PCT')"
          >
            <div class="kpi-val">
              {{ formatPct1(kpi.pct) }}%
            </div>
          </div>
          <div class="pct-track">
            <div
              class="pct-fill"
              :style="{ width: clamp01(kpi.pct) + '%', background: pastelColor('Verde') }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- ===== GRILLA (tabla servicios + timeline) ===== -->
    <div class="gridgantt">
      <!-- HEADER IZQUIERDA -->
      <div class="left-header">
        <div class="cell w-srv" />
      </div>

      <!-- HEADER DÍAS -->
      <div
        ref="rightHeaderViewport"
        class="right-header-viewport"
      >
        <div
          class="right-header-track"
          :style="[ { width: headerTrackWidthPx + 'px' }, bgStripeStyle ]"
        >
          <div
            v-for="d in days"
            :key="'H'+d.key"
            class="day-header"
            :class="{ wknd: d.isWeekend }"
            :style="{ width: dayW + 'px' }"
            :title="d.labelFull"
          >
            {{ d.label }}
          </div>
        </div>
      </div>

      <!-- CUERPO -->
      <div
        ref="rowsScroller"
        class="rows-scroller"
      >
        <!-- IZQUIERDA: SOLO SERVICIO -->
        <div class="left-body">
          <div
            v-for="(row, i) in visibleRows"
            :key="'L'+i"
            class="left-row"
            :class="{ even: i%2===1 }"
            :style="{ height: rowHeight+'px' }"
            :title="row.name_template_srv"
          >
            <div class="cell w-srv">
              <span class="srv-title">{{ row.name_template_srv }}</span>
            </div>
          </div>
        </div>

        <!-- DERECHA: TIMELINE -->
        <div
          class="right-side"
          :style="{ width: totalWidthPx + 'px' }"
        >
          <div class="right-body">
            <!-- Rejilla -->
            <div
              class="grid-lines"
              :style="bgStripeStyle"
            >
              <div
                v-for="d in days"
                :key="'G'+d.key"
                class="grid-col"
                :class="{ wknd: d.isWeekend }"
                :style="{ width: dayW + 'px' }"
              />
            </div>

            <!-- Línea hoy -->
            <div
              v-if="todayLeftPx !== null"
              class="today-line"
              :style="{ left: todayLeftPx + 'px' }"
            />

            <!-- Filas -->
            <div
              v-for="(row, i) in visibleRows"
              :key="'T'+i"
              class="t-row"
              :class="{ even: i%2===1 }"
              :style="{ height: rowHeight+'px' }"
            >
              <!-- bar/dot por día (sin número) -->
              <div
                v-for="dIdx in dayIndicesWithData(row)"
                :key="'D'+i+'-'+dIdx"
                class="dot dot-clickable"
                :style="{
                  ...dotPosStyle(dIdx),
                  ...dotStyle(row, dIdx)
                }"
                :title="dotTooltip(row, dIdx)"
                @click="onDotClick(row, dIdx)"
              />
            </div>
          </div>
        </div>
      </div><!-- /rows-scroller -->
    </div><!-- /gridgantt -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'

const props = defineProps({
  tareasGantt: { type: Array, required: true },
  surveys: { type: Array, default: () => [] }
})

/* ===== UI refs ===== */
const rootRef = ref(null)
const rowsScroller = ref(null)
const rightHeaderViewport = ref(null)
const headerPadRight = ref(0)

/* ===== Helpers ===== */
const trunc = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())
const addDays = (date, n) => { const nd = new Date(date); nd.setDate(nd.getDate() + n); return nd }
const ymd = (date) => {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
const formatPct1 = (v) => {
  const n = Number(String(v ?? 0).replace(',', '.'))
  if (!Number.isFinite(n)) return '0.0'
  return n.toFixed(1)
}
const clamp01 = (v) => {
  const n = Number(String(v ?? 0).replace(',', '.'))
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(100, n))
}
const toNum0 = (v) => {
  if (v == null || v === '') return 0
  const n = Number(String(v).replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}
const formatNum0 = (v) =>
  new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 }).format(toNum0(v))

/* ===== estado_color -> pastel (tipo Ganttastic) ===== */
function isHexColor(c) {
  return typeof c === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(c.trim())
}
function pastelColor(estadoColor) {
  const raw = String(estadoColor ?? '').trim()
  if (!raw) return '#cbd5e1' // slate-300
  if (isHexColor(raw)) return raw

  const key = raw.toLowerCase()
  // Pasteles
  if (key.includes('rojo')) return '#fecaca'     // red-200
  if (key.includes('verde')) return '#bbf7d0'    // green-200
  if (key.includes('amarillo')) return '#fef3c7' // amber-200
  if (key.includes('azul')) return '#bfdbfe'     // blue-200
  if (key.includes('naran')) return '#fed7aa'    // orange-200
  if (key.includes('morado') || key.includes('viole')) return '#ddd6fe' // violet-200
  if (key.includes('gris')) return '#e2e8f0'     // slate-200

  return '#cbd5e1'
}

/* ===== Merge por servicio (una fila por name_template_srv) ===== */
function getSurveyDayKey(s) {
  const raw =
    s?.fecha_plan_ini ??
    s?.fecha_plan ??
    s?.fecha ??
    s?.fecha_plan_fin ??
    null
  if (!raw) return null
  return String(raw).slice(0, 10)
}

function matchServicio(s, tarea) {
  const a = String(s?.name_template_srv ?? '').trim()
  const b = String(tarea?.name_template_srv ?? '').trim()
  return !!a && !!b && a === b
}

const rowHeight = 44

const visibleRows = computed(() => {
  const tareas = Array.isArray(props.tareasGantt) ? props.tareasGantt : []
  const surveys = Array.isArray(props.surveys) ? props.surveys : []

  // Agrupar tareas por name_template_srv (por si vienen repetidas)
  const mapT = new Map()
  for (const t of tareas) {
    const key = String(t?.name_template_srv ?? '').trim()
    if (!key) continue

    if (!mapT.has(key)) {
      mapT.set(key, {
        name_template_srv: key,
        id_user: t?.id_user,
        nombre_user: t?.nombre_user,
        id_personalizado: t?.id_personalizado,
        periodo: t?.periodo,
        cantidad_inspecciones_planificadas: toNum0(t?.cantidad_inspecciones_planificadas),
        cantidad_inspecciones_terminadas: toNum0(t?.cantidad_inspecciones_terminadas),
        cantidad_inspecciones_atrasadas: toNum0(t?.cantidad_inspecciones_atrasadas),
        cantidad_inspecciones_pendientes: toNum0(t?.cantidad_inspecciones_pendientes),
        porcentaje_cumplimiento: Number(String(t?.porcentaje_cumplimiento ?? 0).replace(',', '.')) || 0,
      })
    } else {
      const acc = mapT.get(key)
      acc.cantidad_inspecciones_planificadas += toNum0(t?.cantidad_inspecciones_planificadas)
      acc.cantidad_inspecciones_terminadas += toNum0(t?.cantidad_inspecciones_terminadas)
      acc.cantidad_inspecciones_atrasadas += toNum0(t?.cantidad_inspecciones_atrasadas)
      acc.cantidad_inspecciones_pendientes += toNum0(t?.cantidad_inspecciones_pendientes)
      // pct: si te interesa ponderado, cámbialo; por ahora tomo max (se ve mejor en UI)
      acc.porcentaje_cumplimiento = Math.max(acc.porcentaje_cumplimiento, Number(String(t?.porcentaje_cumplimiento ?? 0).replace(',', '.')) || 0)
      mapT.set(key, acc)
    }
  }

  const rows = Array.from(mapT.values())

  return rows.map(t => {
    const misSurveys = surveys.filter(s =>
      Number(s?.id_user) === Number(t?.id_user) &&
      matchServicio(s, t)
    )

    const dailyStatus = {}
    for (const s of misSurveys) {
      const key = getSurveyDayKey(s)
      if (!key) continue
      if (!dailyStatus[key]) dailyStatus[key] = { items: [] }
      dailyStatus[key].items.push(s)
    }

    return {
      ...t,
      dailyStatus,
      surveys: misSurveys
    }
  })
})

/* ===== Header data ===== */
const headerBase = computed(() => {
  const t0 = Array.isArray(props.tareasGantt) ? props.tareasGantt[0] : null
  const s0 = Array.isArray(props.surveys) ? props.surveys[0] : null
  return {
    nombre_user: s0?.nombre_user ?? t0?.nombre_user ?? '-',
    id_user: s0?.id_user ?? t0?.id_user ?? '-',
    id_personalizado: s0?.id_personalizado ?? t0?.id_personalizado ?? '-',
    periodo: t0?.periodo ?? '',
    servicio: t0?.name_template_srv ?? '',
  }
})

const headerUsuario = computed(() => String(headerBase.value.nombre_user ?? '-'))
const headerIdUser = computed(() => headerBase.value.id_user ?? '-')
const headerIdPer = computed(() => headerBase.value.id_personalizado ?? '-')
const headerPeriodo = computed(() => headerBase.value.periodo ? String(headerBase.value.periodo) : 'Periodo')
const headerSub = computed(() => {
  // si querís algo tipo "Diciembre 2025" lo podís mandar desde backend en periodo,
  // o derivarlo desde fechas.
  const minK = minDate.value ? ymd(minDate.value) : ''
  const maxK = maxDate.value ? ymd(maxDate.value) : ''
  return (minK && maxK) ? `${minK} → ${maxK}` : ''
})

const uniqueSurveys = computed(() => {
  const arr = Array.isArray(props.surveys) ? props.surveys : []
  const map = new Map()
  for (const s of arr) {
    const id = Number(s?.id_survey)
    if (!id) continue
    map.set(id, s) // dedupe
  }
  return Array.from(map.values())
})

const kpi = computed(() => {
  const list = uniqueSurveys.value
  const hoy = new Date().toISOString().slice(0, 10)

  const plan = list.length

  const term = list.filter(s =>
    (s.estado_srv || '').toLowerCase().includes('termin') || !!s.fecha_real_fin
  ).length

  const atras = list.filter(s => {
    const terminada =
      (s.estado_srv || '').toLowerCase().includes('termin') || !!s.fecha_real_fin
    const f = (s.fecha_plan_ini || '').slice(0,10)
    return !terminada && f && f < hoy
  }).length

  const pend = plan - term

  const pct = plan > 0 ? (term / plan) * 100 : 0

  return { plan, term, atras, pend, pct }
})

/* colores KPI (igual lógica pastel que dots) */
function chipStyle(kind) {
  // Puedes ajustar si querís que cada KPI tenga su propio color fijo,
  // pero pediste "con colores iguales a los dots", así que uso el set:
  if (kind === 'PLAN')  return { background: '#eef2ff', borderColor: '#c7d2fe' } // indigo pastel
  if (kind === 'TERM')  return { background: pastelColor('Verde'), borderColor: '#86efac' }
  if (kind === 'ATRAS') return { background: pastelColor('Rojo'), borderColor: '#fca5a5' }
  if (kind === 'PEND')  return { background: pastelColor('Amarillo'), borderColor: '#fcd34d' }
  if (kind === 'PCT')   return { background: '#ccfbf1', borderColor: '#5eead4' } // teal pastel
  return { background: '#e2e8f0', borderColor: '#cbd5e1' }
}

/* ===== Days range ===== */
const pxPerDay = ref(56)
const dayW = computed(() => Math.round(pxPerDay.value))

const minDate = computed(() => {
  const all = (props.surveys ?? [])
    .map(getSurveyDayKey)
    .filter(Boolean)
    .map(k => new Date(k + 'T00:00:00'))
  if (!all.length) return trunc(new Date())
  const m = new Date(Math.min(...all))
  return addDays(trunc(m), -2)
})

const maxDate = computed(() => {
  const all = (props.surveys ?? [])
    .map(getSurveyDayKey)
    .filter(Boolean)
    .map(k => new Date(k + 'T00:00:00'))
  if (!all.length) return addDays(trunc(new Date()), 7)
  const M = new Date(Math.max(...all))
  return addDays(trunc(M), 2)
})

const days = computed(() => {
  const out = []
  let cur = new Date(minDate.value)
  while (cur <= maxDate.value) {
    const label = `${String(cur.getDate()).padStart(2,'0')}/${String(cur.getMonth()+1).padStart(2,'0')}`
    out.push({
      key: ymd(cur),
      date: new Date(cur),
      label,
      labelFull: cur.toDateString(),
      isWeekend: [0,6].includes(cur.getDay())
    })
    cur = addDays(cur, 1)
  }
  return out
})

const headerTrackWidthPx = computed(() => days.value.length * dayW.value)
const totalWidthPx = computed(() => days.value.length * dayW.value)

const bgStripeStyle = computed(() => ({
  backgroundImage: `repeating-linear-gradient(
    to right,
    transparent 0,
    transparent ${dayW.value - 1}px,
    #edf0f3 ${dayW.value - 1}px,
    #edf0f3 ${dayW.value}px
  )`,
  backgroundPositionX: '0px',
  backgroundRepeat: 'repeat-x',
  backgroundSize: `${dayW.value}px 100%`
}))

const todayLeftPx = computed(() => {
  const t = trunc(new Date())
  if (t < minDate.value || t > maxDate.value) return null
  const idx = Math.round((t - minDate.value) / 86_400_000)
  return Math.round(idx * dayW.value + dayW.value / 2)
})

/* ===== Timeline dots/bars ===== */
function dayIndicesWithData(row) {
  const map = row?.dailyStatus || {}
  const keys = Object.keys(map)
  if (!keys.length) return []
  return keys
    .map(k => days.value.findIndex(d => d.key === k))
    .filter(i => i >= 0)
    .sort((a, b) => a - b)
}

function dotPosStyle(dIdx) {
  const gap = 10
  const width = Math.max(dayW.value - gap, 14)  // mantiene ancho del día, sin achicar raro
  const height = 14
  const left = dIdx * dayW.value + Math.round((dayW.value - width) / 2) + 6
  const top = Math.round((rowHeight - height) / 2)

  return {
    left: left + 'px',
    top: top + 'px',
    width: width + 'px',
    height: height + 'px',
    borderRadius: Math.round(height / 2) + 'px'
  }
}

function dotStyle(row, dIdx) {
  const key = days.value[dIdx]?.key
  const items = row?.dailyStatus?.[key]?.items ?? []
  if (!items.length) return { display: 'none' }

  // estado_color viene como "Rojo/Verde/Amarillo/Azul..."
  const colors = items
    .map(s => pastelColor(s?.estado_color))
    .filter(Boolean)

  // 1 survey -> color directo
  if (colors.length === 1) {
    return {
      background: colors[0],
      border: '1px solid rgba(0,0,0,.08)'
    }
  }

  // varios surveys mismo día -> franjas
  const step = 100 / colors.length
  const stops = colors.map((c, i) => {
    const a = (i * step).toFixed(2)
    const b = ((i + 1) * step).toFixed(2)
    return `${c} ${a}%, ${c} ${b}%`
  }).join(', ')

  return {
    background: `linear-gradient(90deg, ${stops})`,
    border: '1px solid rgba(0,0,0,.08)'
  }
}

function dotTooltip(row, dIdx) {
  const key = days.value[dIdx]?.key
  const cell = row?.dailyStatus?.[key]
  if (!cell?.items?.length) return 'Sin datos'
  const n = cell.items.length
  const est = cell.items[0]?.estado_srv ?? ''
  return `${key} | ${row.name_template_srv} | ${n} inspección(es)${est ? ' | ' + est : ''}`
}

function onDotClick(row, dIdx) {
  const key = days.value[dIdx]?.key
  const first = row?.dailyStatus?.[key]?.items?.[0]
  if (!first) return
  // aquí podís emitir evento si querís abrir inspección/pdf
  // emit('open', first)
  // console.log('click', first)
}

/* ===== Scroll sync ===== */
function measureScrollbarWidth() {
  if (!rowsScroller.value || !rootRef.value) return
  const sbw = rowsScroller.value.offsetWidth - rowsScroller.value.clientWidth
  rootRef.value.style.setProperty('--sbw', `${Math.max(0, sbw)}px`)
}

onMounted(async () => {
  console.log("props.surveys", props.surveys)
  const syncHeader = () => {
    if (!rowsScroller.value || !rightHeaderViewport.value) return
    rightHeaderViewport.value.scrollLeft = rowsScroller.value.scrollLeft
  }

  rowsScroller.value?.addEventListener('scroll', syncHeader, { passive: true })
  await nextTick()
  measureScrollbarWidth()

  const ro = new ResizeObserver(() => measureScrollbarWidth())
  if (rowsScroller.value) ro.observe(rowsScroller.value)
  window.addEventListener('resize', measureScrollbarWidth)
  syncHeader()
})
</script>

<style scoped>
*{ box-sizing: border-box; }

.ganttA{
  background: #ffffff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 10px 28px rgba(0,0,0,.10);
}

/* ===== TOPBAR ===== */
.topbar{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap: 16px;
  padding: 16px 18px;
  background: #ffffff;
}

.top-left{
  min-width: 360px;
  display:flex;
  flex-direction:column;
  gap: 10px;
}

.user-line{
  display:flex;
  flex-direction:column;
  gap: 4px;
}
.user-name{
  font-weight: 800;
  font-size: 16px;
  color: #0f172a;
}
.user-meta{
  display:flex;
  gap: 10px;
  align-items:center;
  font-size: 12px;
}

.srv-line{
  display:flex;
  flex-direction:column;
  gap: 2px;
}
.srv-title{
  font-weight: 700;
  color: #0f172a;
  font-size: 13px;
}
.srv-sub{
  font-size: 12px;
}

.muted{ color:#64748b; }

/* KPI chips */
.top-kpis{
  display:flex;
  align-items:stretch;
  gap: 10px;
  flex-wrap: wrap;
  justify-content:flex-end;
}
.kpi{
  min-width: 70px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 10px 12px;
  background: #f8fafc;
  text-align:center;
}
.kpi-val{
  font-weight: 900;
  font-size: 15px;
  color: #0f172a;
  line-height: 1.1;
}
.kpi-lbl{
  font-size: 11px;
  color:#64748b;
  margin-top: 4px;
}

.kpi-pct{
  min-width: 110px;
  border: none;
  padding: 0;
  background: transparent;
}
.pct-pill{
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  padding: 10px 12px;
  text-align:center;
}
.pct-track{
  margin-top: 8px;
  height: 10px;
  border-radius: 999px;
  background: #eef2f7;
  overflow:hidden;
}
.pct-fill{
  height: 100%;
  border-radius: 999px;
}

/* ===== Grid principal ===== */
.gridgantt{
  --left-w: 320px;
  background: #f8fafc;
  overflow: hidden;
  display: grid;
  grid-template-columns: var(--left-w) minmax(0, 1fr);
  grid-template-rows: 44px 1fr;
  border-top: 1px solid #eef2f7;
}

/* ===== Header izquierda ===== */
.left-header{
  grid-column: 1; grid-row: 1;
  display: grid;
  grid-template-columns: 1fr;
  align-items: center; height: 44px;
  background: #eef2f7; color: #334155; font-weight: 800;
  border-bottom: 1px solid #e5e7eb;
  position: sticky; left: 0; z-index: 6;
}
.left-header .cell{ justify-content: flex-start; }

/* ===== Header días ===== */
.right-header-viewport{
  grid-column: 2; grid-row: 1;
  overflow: hidden;
  background: #eef2f7;
  border-bottom: 1px solid #e5e7eb;
  position: relative;
  height: 44px;

  /* ✅ para reservar el espacio del scrollbar igual que abajo */
  padding-right: var(--sbw, 0px);
}
.right-header-track{
  /* ⛔ NO absoluto */
  position: relative;
  left: auto;
  top: auto;
  bottom: auto;

  display: inline-flex;
  height: 44px;

  /* ✅ clave: que respete el padding del viewport */
  width: max-content;
}
.day-header{
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:12px;
  color:#334155;
  padding:0;        /* ✅ deja 0 */
  line-height: 44px;/* ✅ antes 48px */
}
.day-header,
.grid-col{
  box-sizing: border-box;
}
.day-header.wknd{ background:#e8eef5; color:#475569; }

/* ===== Scroller ===== */
.rows-scroller{
  grid-column: 1 / 3; grid-row: 2;
  display: grid;
  grid-template-columns: var(--left-w) minmax(0, 1fr);
  overflow: auto;
  min-height: 0;
  background: #ffffff;
}

/* ===== Izquierda: Servicios ===== */
.left-body{
  position: sticky; left: 0; z-index: 4;
  background: #ffffff;
  box-shadow: 1px 0 0 #e5e7eb;
}
.left-row{
  display: grid;
  grid-template-columns: 1fr;
}
.left-row.even .cell{ background:#fafbff; }

.cell{
  padding: 0 12px; height: 44px;
  display:flex; align-items:center; gap:10px;
  border-bottom:1px solid #eef2f7; color:#0f172a; font-size:13px;
}
.w-srv .srv-title{
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 280px;
}
.w-srv .srv-sub{
  font-size: 11px;
  margin-left: auto;
}

/* ===== Timeline derecha ===== */
.right-side{ min-width: 0; background:#ffffff; }
.right-body{ position: relative; }

.grid-lines{
  position:absolute; inset:0;
  display:inline-flex; pointer-events:none; z-index:0;
}
.grid-col{ height: 100%; background: transparent; }
.grid-col.wknd{ background: rgba(15,23,42,.02); }

.t-row{
  position: relative;
  border-bottom: 1px solid #eef2f7;
}
.t-row.even{ background:#fafbff; }

/* Línea de hoy */
.today-line{
  position:absolute; top:0; bottom:0;
  width:2px; background:#f59e0b;
  box-shadow:0 0 0 2px rgba(245,158,11,.20);
  pointer-events:none; z-index:3;
}

/* DOT/BAR */
.dot{
  position: absolute;
  box-shadow: 0 1px 4px rgba(0,0,0,.18);
  opacity: .98;
}
.dot{
  transform: translateY(0.5px);
}
.dot-clickable{ cursor: pointer; }

/* top-left en fila */
.top-left-row{
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 18px;
  min-width: 360px;
}

/* evita que se “apilen” si hay poco espacio: que bajen bonito */
.top-left-row{
  flex-wrap: wrap;
}

.user-line{
  display:flex;
  flex-direction:column;
  gap: 4px;
  min-width: 180px;
}

.srv-line{
  display:flex;
  flex-direction:column;
  gap: 2px;
  min-width: 180px;
}

/* opcional: que el periodo quede un poquito más “alineado” */
.srv-title{
  font-weight: 800;
  font-size: 13px;
  color: #0f172a;
}
</style>
