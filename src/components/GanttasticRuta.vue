<template>
  <div
    class="mb-2"
    style="display:flex; gap:8px;"
  >
    <v-btn
      color="green"
      @click="exportarExcelCompleto"
    >
      Excel completo
    </v-btn>
    <v-btn
      color="red"
      @click="exportarPDF"
    >
      Exportar PDF
    </v-btn>
  </div>

  <div
    ref="gridRef"
    class="gridgantt"
  >
    <!-- HEADER IZQUIERDA -->
    <div class="left-header">
      <div class="cell w-cuadrilla">
        Cuadrilla
      </div>
      <div class="cell w-partida">
        Partida
      </div>
      <div class="cell w-unidad">
        Unidad
      </div>
      <div class="cell w-pond">
        Pond.
      </div>
      <div class="cell w-obj">
        Cant. Objetivo
      </div>
      <div class="cell w-obj">
        Cant. Avance
      </div>
      <div class="cell w-av">
        % Cant. Avance
      </div>
      <div class="cell w-av">
        % Avance Pond.
      </div>
    </div>

    <!-- HEADER DÍAS (sincronizado) -->
    <div
      ref="rightHeaderViewport"
      class="right-header-viewport"
      :style="{ paddingRight: headerPadRight + 'px' }"
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
      style="z-index:1000;"
    >
      <!-- IZQUIERDA: TABLA -->
      <div class="left-body">
        <div
          v-for="(row, i) in visibleRows"
          :key="'L'+i+'-'+row.kind"
          class="left-row"
          :class="[{ even: i%2===1 }, row.kind]"
          :style="{ height: row.kind==='data' ? rowHeight+'px' : headerRowHeight+'px' }"
        >
          <!-- Cuadrilla -->
          <div class="cell w-cuadrilla">
            <template v-if="row.kind==='cuad'">
              <button
                class="chev"
                :aria-expanded="isCuadOpen(row.cuadrilla)"
                @click="toggleCuad(row.cuadrilla)"
              >
                <span :class="['arrow', { open: isCuadOpen(row.cuadrilla) }]">▶</span>
              </button>
              <span class="linklike">{{ row.cuadrilla }}</span>
            </template>
            <template v-else>
              <template v-if="row.showLeft">
                <!-- (sin icono de editar; se eliminó) -->
              </template>
            </template>
          </div>

          <!-- Partida -->
          <div class="cell w-partida">
            <template v-if="row.kind==='data'">
              <span
                v-if="row.showLeft"
                class="partida-title"
              >{{ row.partida }}</span>
            </template>
            <template v-else>
              <span class="muted" />
            </template>
          </div>

          <!-- Unidad / Pond / Cantidades -->
          <div class="cell w-unidad">
            <template v-if="row.kind==='data'">
              <span v-if="row.showLeft">{{ row.unidad ?? '—' }}</span>
            </template>
          </div>
          <div class="cell w-pond">
            <template v-if="row.kind==='data'">
              <span v-if="row.showLeft">{{ formatNum(row.pondMostrar) }}</span>
            </template>
          </div>
          <div class="cell w-obj">
            <template v-if="row.kind==='data'">
              <span v-if="row.showLeft">{{ formatNum(row.cantObjetivo) }}</span>
            </template>
          </div>

          <!-- Cant. Avance -->
          <div class="cell w-obj">
            {{ formatNum(row.cantAvance) }}
          </div>

          <!-- % Cant. Avance (celeste si Plan) -->
          <div class="cell w-av">
            <template v-if="row.kind==='data'">
              <div class="pct-bar is-plan">
                <div
                  class="pct-bar__fill"
                  :style="{ width: clamp01(row.avance) + '%' }"
                />
                <span class="pct-bar__text">{{ formatPct1(row.avance) }}%</span>
              </div>
            </template>
            <span v-else>—</span>
          </div>

          <!-- % Avance Ponderado (celeste si Plan) -->
          <div class="cell w-av">
            <template v-if="row.kind==='data'">
              <div class="pct-bar is-plan">
                <div
                  class="pct-bar__fill"
                  :style="{ width: pondWidth(row) }"
                />
                <span class="pct-bar__text">{{ pondLabel(row) }}</span>
              </div>
            </template>
            <span v-else>—</span>
          </div>
        </div>
      </div>

      <!-- DERECHA: TIMELINE con DOTS -->
      <div
        class="right-side"
        :style="{ width: totalWidthPx + 'px' }"
      >
        <div class="right-body">
          <!-- Rejilla de días -->
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
          <!-- Línea de hoy -->
          <div
            v-if="todayLeftPx !== null"
            class="today-line"
            :style="{ left: todayLeftPx + 'px' }"
          />

          <!-- Overlay de dependencias -->
          <svg
            class="deps"
            :width="totalWidthPx"
            :height="totalRowsHeightPx"
            style="position:absolute; left:0; top:0; pointer-events:none; z-index:2;"
          >
            <!-- Definición de la punta de flecha -->
            <defs>
              <marker
                id="depArrow"
                viewBox="0 0 8 8"
                refX="7"
                refY="4"
                markerWidth="8"
                markerHeight="8"
                orient="auto"
              >
                <path
                  d="M0,0 L8,4 L0,8 Z"
                  class="dep-arrow"
                />
              </marker>
            </defs>

            <template
              v-for="(dep, di) in dependencies"
              :key="'dep'+di"
            >
              <path
                v-if="depPath(dep.from, dep.to)"
                :d="depPath(dep.from, dep.to)"
                class="dep-line"
                marker-end="url(#depArrow)"
              />
            </template>
          </svg>

          <!-- Filas timeline -->
          <div
            v-for="(row, i) in visibleRows"
            :key="'T'+i+'-'+row.kind"
            class="t-row"
            :class="[{ even: i%2===1 }, row.kind]"
            :style="{ height: row.kind==='data' ? rowHeight+'px' : headerRowHeight+'px' }"
          >
            <!-- Línea continua de cuadrilla -->
            <div
              v-if="row.kind==='cuad' && row.spanStart && row.spanEnd"
              class="cuad-span"
              :style="spanStyle(row.spanStart, row.spanEnd)"
              :title="`${row.cuadrilla}: ${row.spanStart} → ${row.spanEnd}`"
            />

            <!-- Dots por día (solo Plan) + pista continua -->
            <div
              v-else-if="row.kind==='data' && row.x && row.x2"
              class="bar-strip"
              :style="barTotalStyle(row.x, row.x2)"
            >
              <!-- Fondo celeste muy pálido en toda la celda del rango (start → end) -->
              <div class="bar-bg" />

              <!-- Dots diarios -->
              <div
                v-for="dIdx in barDayIndices(row).days"
                :key="'D'+dIdx"
                class="bar"
                :class="planDotClass(row, dIdx)"
                :style="barDotStyle(barDayIndices(row).i0, dIdx)"
                :title="dotTitle(row, dIdx)"
              >
                <span class="dot-value">{{ formatNumShort(dotValue(row, dIdx)) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div><!-- /rows-scroller -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

/* ====== Helpers base ====== */
const parse = (s) => new Date(s.replace(' ', 'T'))
const trunc = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())
const ymd = (date) => {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
const addDays = (date, n) => { const nd = new Date(date); nd.setDate(nd.getDate() + n); return nd }
const formatNum = (v) => (v == null || v === '' ? '—' : new Intl.NumberFormat('es-CL', { maximumFractionDigits: 2 }).format(v))
const formatNumShort = (v) => (v == null || v === '' ? '' : new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 }).format(v))
const clampPct = (v) => (v == null ? '0%' : `${Math.max(0, Math.min(100, Math.round(v)))}%`)
const clamp01 = (v) => Math.max(0, Math.min(100, Math.round(v ?? 0)))

/* ====== Props ====== */
const props = defineProps({ tareas: { type: Array, required: true } })

/* ====== CPM / dependencias ====== */
function buildDepGraphs(hijos) {
  const succ = new Map()
  const preds = new Map()
  const idSet = new Set(hijos.map(h => h.id_tarea))

  const ensureNode = (id) => {
    if (!succ.has(id)) succ.set(id, new Set())
    if (!preds.has(id)) preds.set(id, new Set())
  }

  for (const h of hijos) {
    if (!h.id_tarea) continue
    ensureNode(h.id_tarea)

    let prevIds = []

    // Usamos id_tarea_predecesora si viene
    if (h.id_tarea_predecesora != null && h.id_tarea_predecesora !== '') {
      if (Array.isArray(h.id_tarea_predecesora)) {
        prevIds = h.id_tarea_predecesora
      } else {
        prevIds = String(h.id_tarea_predecesora)
          .split(',')
          .map(x => Number(x.trim()))
          .filter(v => !Number.isNaN(v))
      }
    }

    // Construir arcos: predecesor -> tarea actual
    for (const pid of prevIds) {
      if (!idSet.has(pid)) continue
      ensureNode(pid)
      succ.get(pid).add(h.id_tarea)    // pid → h.id_tarea
      preds.get(h.id_tarea).add(pid)   // h.id_tarea tiene como predecessor a pid
    }
  }

  // Garantizar que todos los nodos existen en los mapas
  for (const id of idSet) {
    ensureNode(id)
  }

  return { succ, preds }
}

function topoSort(nodes, preds, succ) {
  const inDeg = new Map(nodes.map(id => [id, (preds.get(id)?.size || 0)]))
  const q = []
  for (const [id, deg] of inDeg) if (deg === 0) q.push(id)
  const order = []
  while (q.length) {
    const u = q.shift()
    order.push(u)
    for (const v of succ.get(u) || []) {
      inDeg.set(v, inDeg.get(v) - 1)
      if (inDeg.get(v) === 0) q.push(v)
    }
  }
  if (order.length !== nodes.length) throw new Error('Ciclo en dependencias')
  return order
}

function computeCPM(hijos, preds, succ, durById) {
  const ids = hijos.map(h => h.id_tarea)
  const order = topoSort(ids, preds, succ)

  const ES = new Map(), EF = new Map()
  for (const id of order) {
    const es = Math.max(0, ...(Array.from(preds.get(id) || []).map(p => EF.get(p) || 0)))
    ES.set(id, es)
    EF.set(id, es + (durById.get(id) || 1))
  }
  const projectEF = Math.max(...Array.from(EF.values()))
  const LS = new Map(), LF = new Map()
  const rev = [...order].reverse()
  for (const id of rev) {
    const lf = (succ.get(id)?.size)
      ? Math.min(...Array.from(succ.get(id)).map(s => LS.get(s)))
      : projectEF
    LF.set(id, lf)
    LS.set(id, lf - (durById.get(id) || 1))
  }
  const slack = new Map(ids.map(id => [id, (LS.get(id) - ES.get(id))]))
  const critical = new Map(ids.map(id => [id, (slack.get(id) === 0)]))
  return { ES, EF, LS, LF, slack, critical, projectEF }
}

/* ====== Transformador payload -> rows internos (solo PLAN) ====== */
function buildRowsFromTareas(tareas = []) {
  const padres = new Map()
  const hijosNivel2 = []         // antes: const hijos = []
  for (const t of tareas) {
    if (t.nivel === 1) {
      padres.set(t.id_tarea, {
        nombre: t.nombre_tarea,
        ponderado: t.ponderado != null ? Number(t.ponderado) : null
      })
    } else if (t.nivel === 2) {
      hijosNivel2.push(t)
    }
  }

  // Ordenar hijos por (id_tarea_padre, id_tarea)
  hijosNivel2.sort((a, b) => {
    const pa = a.id_tarea_padre ?? 0
    const pb = b.id_tarea_padre ?? 0
    if (pa !== pb) return pa - pb
    return (a.id_tarea ?? 0) - (b.id_tarea ?? 0)
  })

  const rows = []
  const metaById = new Map()

  // Construcción de filas PLAN y metadatos
  for (const h of hijosNivel2) {
    const padre = padres.get(h.id_tarea_padre)
    if (!padre) continue

    const json = Array.isArray(h.json_data) ? h.json_data : []

    const pondTarea = h.ponderado != null ? Number(h.ponderado) : null

    const dailyPlan = {}
    const planReasigDaily = {}

    // rango, totales
    let dMinPlan = null, dMaxPlan = null
    let planTotal = 0

    for (const it of json) {
      const key = it?.fecha
      if (!key) continue

      const tieneReasigNoCero =
        Object.prototype.hasOwnProperty.call(it, 'plan_reasignado') &&
        it.plan_reasignado !== null &&
        it.plan_reasignado !== '' &&
        Number(it.plan_reasignado) !== 0

      let valPlan = null
      if (tieneReasigNoCero) {
        valPlan = Number(it.plan_reasignado)
        planReasigDaily[key] = true
      } else if (it.value !== null && it.value !== '') {
        valPlan = Number(it.value) || 0
      }

      if (valPlan !== null) {
        planTotal += valPlan
        dailyPlan[key] = (dailyPlan[key] ?? 0) + valPlan
        const d = new Date(key + 'T00:00:00')
        dMinPlan = dMinPlan ? (d < dMinPlan ? d : dMinPlan) : d
        dMaxPlan = dMaxPlan ? (d > dMaxPlan ? d : dMaxPlan) : d
      }
    }

    const cantObjetivo = h.cantidad_objetivo != null ? Number(h.cantidad_objetivo) : null

    // Esto ya no lo usaremos para mostrar, pero puedes dejarlo para metaById si quieres
    const avancePlanPct = cantObjetivo && cantObjetivo > 0 ? (planTotal / cantObjetivo) * 100 : 0

    // ⬅️ NUEVO: viene directo desde el backend
    const avanceCantPct = h.cantidad_avance_pct != null
      ? Number(h.cantidad_avance_pct)
      : null

    if (planTotal > 0 || Object.keys(dailyPlan).length) {
      const startStr = dMinPlan ? ymd(dMinPlan) : null
      const endStr   = dMaxPlan ? ymd(dMaxPlan) : null

      // dur para CPM
      let durCalc = 1
      if (startStr && endStr) {
        durCalc = Math.max(1, Math.round((new Date(endStr) - new Date(startStr)) / 86400000) + 1)
      } else {
        const keys = Object.keys(dailyPlan).sort()
        if (keys.length) {
          durCalc = Math.max(1, Math.round((new Date(keys.at(-1)) - new Date(keys[0])) / 86400000) + 1)
        }
      }

      // NUEVO: Cant. Avance directo desde el backend
      const cantAvanceTotal = h.cantidad_avance != null
        ? Number(h.cantidad_avance)
        : null

      rows.push({
        kind: 'data',
        id_tarea: h.id_tarea,
        cuadrilla: padre.nombre,
        partida: h.nombre_tarea,
        unidad: h.unidad,
        tipo: 'Plan',
        cantidad: planTotal,
        avance: avanceCantPct,
        ponderado: pondTarea,
        pond: pondTarea,
        pondWeight: pondTarea,
        ponderadoCuad: padre.ponderado,
        cantObjetivo,
        cantAvance: cantAvanceTotal ?? planTotal,

        // ⬇️ NUEVO: % Avance Pond. tal como viene desde BD
        avancePond: h.avance_ponderado_pct != null
          ? Number(h.avance_ponderado_pct)
          : null,

        // NUEVO: guardar el predecesor que viene del backend
        id_tarea_predecesora: h.id_tarea_predesesora ?? null,

        // ⬇️ mantener x/x2 si quieres, PERO agrega start/end que usa el template
        x: startStr ? `${startStr} 00:00` : null,
        x2: endStr ? `${endStr} 00:00` : null,
        start: startStr ?? null,     // ⬅️ NUEVO
        end: endStr ?? null,         // ⬅️ NUEVO

        valores: Object.keys(dailyPlan).length ? dailyPlan : null,
        daily: Object.keys(dailyPlan).length ? dailyPlan : null,
        reasigDaily: Object.keys(planReasigDaily).length ? planReasigDaily : null
      })

      metaById.set(h.id_tarea, {
        start: startStr,
        end: endStr,
        dur: durCalc,
        total: planTotal,
        cantObjetivo,
        pct: avancePlanPct,
        completed: (avancePlanPct >= 100)
      })
    }
  }

  // Header de cuadrilla con span y ponderado visible
  const out = []
  const treeByCuad = new Map()
  for (const r of rows) {
    if (!treeByCuad.has(r.cuadrilla)) treeByCuad.set(r.cuadrilla, [])
    treeByCuad.get(r.cuadrilla).push(r)
  }
  for (const [cuadrilla, recs] of treeByCuad.entries()) {
    const pondHeader =
      recs.find(r => r.ponderadoHeader != null)?.ponderadoHeader ??
      recs.find(r => r.ponderadoCuad   != null)?.ponderadoCuad   ??
      recs.find(r => r.ponderado       != null)?.ponderado       ??
      null

    const starts = recs.map(r => r.x).filter(Boolean).map(parse)
    const ends   = recs.map(r => r.x2).filter(Boolean).map(parse)
    const spanStart = starts.length ? new Date(Math.min(...starts)) : null
    const spanEnd   = ends.length   ? new Date(Math.max(...ends))   : null

    out.push({ kind:'cuad', cuadrilla, pondMostrar: pondHeader, spanStart, spanEnd })

    // “Agrupar” por partida para showLeft
    const porPartida = new Map()
    for (const r of recs) {
      if (!porPartida.has(r.partida)) porPartida.set(r.partida, [])
      porPartida.get(r.partida).push(r)
    }
    for (const [partida, lista] of porPartida.entries()) {
      let first = true
      for (const r of lista) {
        out.push({ ...r, showLeft: first })
        first = false
      }
    }
  }

  // === Dependencias, bloqueo y ruta crítica ===
  const hijosArr = hijosNivel2
  const { succ, preds } = buildDepGraphs(hijosArr)

  // Dur por id_tarea (desde meta o fallback 1)
  const durById = new Map()
  for (const h of hijosArr) {
    const m = metaById.get(h.id_tarea)
    let dur = 1
    if (m?.start && m?.end) {
      dur = Math.max(1, Math.round((new Date(m.end) - new Date(m.start)) / 86400000) + 1)
    } else {
      const keys = (Array.isArray(h.json_data) ? h.json_data : [])
        .map(x => x?.fecha).filter(Boolean).sort()
      if (keys.length) {
        dur = Math.max(1, Math.round((new Date(keys.at(-1)) - new Date(keys[0])) / 86400000) + 1)
      }
    }
    durById.set(h.id_tarea, dur)
  }

  let cpm = null
  try {
    cpm = computeCPM(hijosArr, preds, succ, durById)
  } catch (e) {
    console.warn('CPM: ciclo o error, se omite highlighting crítico.', e)
  }

  const completedById = new Map()
  for (const [id, m] of metaById) completedById.set(id, !!m?.completed)

  const latestPredEndDate = (id) => {
    const pr = Array.from(preds.get(id) || [])
    if (!pr.length) return null
    const ends = pr
      .map(p => metaById.get(p)?.end)
      .filter(Boolean)
      .map(d => new Date(d))
    if (!ends.length) return null
    return new Date(Math.max(...ends.map(d => d.getTime())))
  }

  // Marca rows (kind:'data') con flags: critical, blocked, unblockDate
  for (const r of out) {
    if (r.kind !== 'data') continue
    const id = r.id_tarea
    r.critical = cpm ? !!cpm.critical.get(id) : false
    const pr = Array.from(preds.get(id) || [])
    const allPredsDone = pr.every(pid => completedById.get(pid))
    if (allPredsDone) {
      r.blocked = false
      r.unblockDate = null
    } else {
      r.blocked = true
      const lp = latestPredEndDate(id)
      r.unblockDate = lp ? ymd(new Date(lp.getFullYear(), lp.getMonth(), lp.getDate() + 1)) : null
    }
  }

  return out
}

/* ====== Estado/UI, calendario, render ====== */
const rowHeight = 44
const headerRowHeight = 36
const pxPerDay = ref(56)
const dayW = computed(() => Math.round(pxPerDay.value))

const rowsScroller = ref(null)
const rightHeaderViewport = ref(null)
const headerPadRight = ref(0)
function measureScrollbarWidth() {
  if (!rowsScroller.value) return
  const sbw = rowsScroller.value.offsetWidth - rowsScroller.value.clientWidth
  headerPadRight.value = Math.max(0, sbw)
}

const rows = computed(() => buildRowsFromTareas(props.tareas))

const treeByCuad = computed(() => {
  const mapa = new Map()
  for (const r of rows.value) {
    if (r.kind !== 'data') continue
    if (!mapa.has(r.cuadrilla)) mapa.set(r.cuadrilla, new Map())
    const porPartida = mapa.get(r.cuadrilla)
    if (!porPartida.has(r.partida)) porPartida.set(r.partida, [])
    porPartida.get(r.partida).push(r)
  }
  return mapa
})

const openCuads = ref(new Set())
const isCuadOpen = (c) => openCuads.value.has(c)
const toggleCuad = (c) => {
  const s = new Set(openCuads.value)
  s.has(c) ? s.delete(c) : s.add(c)
  openCuads.value = s
}

const visibleRows = computed(() => {
  const out = []
  for (const [cuadrilla, porPartida] of treeByCuad.value.entries()) {
    const allRecs = Array.from(porPartida.values()).flat()
    const pondHeader =
      allRecs.find(r => r.ponderadoHeader != null)?.ponderadoHeader ??
      allRecs.find(r => r.ponderadoCuad   != null)?.ponderadoCuad   ??
      allRecs.find(r => r.ponderado       != null)?.ponderado       ??
      null

    const starts = allRecs.map(r => r.x).filter(Boolean).map(parse)
    const ends   = allRecs.map(r => r.x2).filter(Boolean).map(parse)
    const spanStart = starts.length ? new Date(Math.min(...starts)) : null
    const spanEnd   = ends.length   ? new Date(Math.max(...ends))   : null

    out.push({ kind:'cuad', cuadrilla, pondMostrar: pondHeader, spanStart, spanEnd })

    if (!isCuadOpen(cuadrilla)) continue

    for (const [partida, recs] of porPartida.entries()) {
      let firstForPartida = true
      for (const rec of recs) {
        const pondBase = rec.ponderado ?? rec.pond ?? null
        out.push({ ...rec, showLeft: firstForPartida,
          pondMostrar: pondBase,
          pondWeight: rec.pondWeight ?? pondBase
         })
        firstForPartida = false
      }
    }
  }
  return out
})

/* Líneas verticales compartidas por header/body */
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

const headerTrackWidthPx = computed(() => days.value.length * dayW.value)
const totalWidthPx = computed(() => days.value.length * dayW.value)

const minDate = computed(() => {
  const all = rows.value.flatMap(r => [r.x, r.x2].filter(Boolean)).map(parse)
  if (!all.length) return trunc(new Date())
  const m = new Date(Math.min(...all)); m.setDate(m.getDate() - 1); return trunc(m)
})
const maxDate = computed(() => {
  const all = rows.value.flatMap(r => [r.x, r.x2].filter(Boolean)).map(parse)
  if (!all.length) return addDays(trunc(new Date()), 7)
  const M = new Date(Math.max(...all)); M.setDate(M.getDate() + 1); return trunc(M)
})

const days = computed(() => {
  const out = []; let cur = new Date(minDate.value)
  while (cur <= maxDate.value) {
    const label = `${String(cur.getDate()).padStart(2,'0')}/${String(cur.getMonth()+1).padStart(2,'0')}`
    out.push({ key: ymd(cur), date: new Date(cur), label, labelFull: cur.toDateString(), isWeekend: [0,6].includes(cur.getDay()) })
    cur = addDays(cur, 1)
  }
  return out
})

/* Dots y posiciones */
const spanStyle = (start, end) => {
  if (!start || !end) return { display: 'none' }
  const i0 = dayIndex(start), i1 = dayIndex(end)
  const left = i0 * dayW.value + 6
  const width = Math.max(dayW.value * (i1 - i0 + 1) - 12, 12)
  return { left: left + 'px', width: width + 'px' }
}
const dayIndex = (dt) => {
  const dx = trunc(typeof dt === 'string' ? parse(dt) : dt)
  return Math.max(0, Math.min(days.value.length - 1, Math.round((dx - minDate.value) / 86_400_000)))
}
const barTotalStyle = (start, end) => {
  if (!start || !end) return { display: 'none' }
  const i0 = dayIndex(start), i1 = dayIndex(end)
  const left = i0 * dayW.value + 6
  const width = Math.max(dayW.value * (i1 - i0 + 1) - 12, 12)
  return { position: 'absolute', left: left + 'px', width: width + 'px', top: 0, bottom: 0 }
}
const barDays = (start, end) => {
  const i0 = dayIndex(start), i1 = dayIndex(end)
  const arr = []
  for (let i = i0; i <= i1; i++) arr.push(i)
  return { i0, i1, days: arr }
}
const barDotStyle = (i0, dIdx) => {
  const innerIdx = dIdx - i0
  const gap = 10
  const width = Math.max(dayW.value - gap, 12)
  const left  = innerIdx * dayW.value + Math.round((dayW.value - width) / 2)
  return { left: left + 'px', width: width + 'px' }
}

function barDayIndices(row) {
  // Si hay "daily" (mapa {fecha->valor}), usar exactamente esas fechas,
  // así los dots quedan no-contiguos si el plan salta días.
  if (row?.daily && Object.keys(row.daily).length) {
    const idxs = Object.keys(row.daily)
      .map(k => days.value.findIndex(d => d.key === k))
      .filter(i => i >= 0)
      .sort((a, b) => a - b)

    if (idxs.length) {
      return { i0: idxs[0], i1: idxs[idxs.length - 1], days: idxs }
    }
  }
  // Fallback: continuo entre start/end
  return barDays(row.start, row.end)
}

/* Gating por bloqueo + título */
function planDotClass(row, dIdx) {
  const key = days.value[dIdx]?.key
  if (!key) return 'bar-plan'

  // Bloqueados siguen grises
  if (row.blocked && (!row.unblockDate || key < row.unblockDate)) {
    return 'bar-blocked'
  }

  // Si ese día tiene plan_reasignado -> azul oscuro
  if (row.reasigDaily && row.reasigDaily[key]) {
    return 'bar-plan-reasig'
  }

  // Resto de días de plan -> celeste normal
  return 'bar-plan'
}
function dotValue(row, dIdx) {
  const key = days.value[dIdx]?.key
  if (!key) return null
  if (row.blocked && (!row.unblockDate || key < row.unblockDate)) return null
  if (row?.daily && Object.prototype.hasOwnProperty.call(row.daily, key)) {
    const v = row.daily[key]
    return (v === '' || v == null) ? null : Number(v)
  }
  return null
}
function dotTitle(row, dIdx) {
  const key = days.value[dIdx]?.key
  if (!key) return ''
  if (row.blocked && (!row.unblockDate || key < row.unblockDate)) {
    return 'Bloqueado por predecesoras'
  }
  const v = dotValue(row, dIdx)
  return v == null ? '' : `Plan: ${v}`
}

/* Hoy + sync + medir scrollbar */
const todayLeftPx = computed(() => {
  const t = trunc(new Date()); if (t < minDate.value || t > maxDate.value) return null
  const idx = dayIndex(t); return Math.round(idx * dayW.value + dayW.value / 2)
})

onMounted(async () => {
  for (const r of rows.value) if (r.kind === 'cuad') openCuads.value.add(r.cuadrilla)
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
})

const formatPct1 = (v) => {
  const n = Number(v)
  if (!Number.isFinite(n)) return '0.0'
  return n.toFixed(1)   // siempre 1 decimal
}

/* ====== % Avance ponderado ====== */
const pondPct = (row) => {
  const v = row?.avancePond
  if (v == null) return null
  const n = Number(v)
  if (!Number.isFinite(n)) return null
  // ⬅️ clamp 0–100, pero SIN redondear
  return Math.max(0, Math.min(100, n))
}

const pondWidth = (row) => {
  const v = pondPct(row)
  return v == null ? '0%' : `${v.toFixed(1)}%`
}

const pondLabel = (row) => {
  const v = pondPct(row)
  return v == null ? '—' : `${v.toFixed(1)}%`
}

/* ====== Export Excel/PDF ====== */
const gridRef = ref(null)
function toggleExportMode(on) {
  const el = gridRef.value || document.querySelector('.gridgantt')
  if (!el) return
  el.classList.toggle('exporting', !!on)
}
async function exportarPDF() {
  const el = gridRef.value || document.querySelector('.gridgantt')
  if (!el) return
  toggleExportMode(true)

  const scroller = el.querySelector('.rows-scroller')
  const hdr = el.querySelector('.right-header-viewport')
  if (scroller) scroller.scrollLeft = 0
  if (hdr) hdr.scrollLeft = 0
  if (document.fonts?.ready) { try { await document.fonts.ready } catch {} }

  const width = el.scrollWidth
  const height = el.scrollHeight
  const scale = Math.max(2, Math.ceil(window.devicePixelRatio || 1))
  const canvas = await html2canvas(el, {
    backgroundColor: '#ffffff',
    scale,
    useCORS: true,
    allowTaint: true,
    width, height, windowWidth: width, windowHeight: height,
    scrollX: 0, scrollY: 0
  })

  const pdf = new jsPDF('l', 'mm', 'a3')
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()

  const pxToMm = (px) => px * 25.4 / 96
  const imgWmm = pxToMm(canvas.width)
  const imgHmm = pxToMm(canvas.height)
  const ratio = Math.min(pageW / imgWmm, pageH / imgHmm)
  const pagePxH = Math.floor((pageH / ratio) * 96 / 25.4)

  let y = 0, page = 0
  while (y < canvas.height) {
    const slice = document.createElement('canvas')
    slice.width = canvas.width
    slice.height = Math.min(pagePxH, canvas.height - y)
    const ctx = slice.getContext('2d')
    ctx.drawImage(canvas, 0, y, canvas.width, slice.height, 0, 0, canvas.width, slice.height)
    const img = slice.toDataURL('image/png')

    if (page > 0) pdf.addPage('a3', 'landscape')
    const w = imgWmm * ratio
    const h = pxToMm(slice.height) * ratio
    pdf.addImage(img, 'PNG', 0, 0, w, h)

    y += pagePxH
    page++
  }

  pdf.save('Gantt.pdf')
  toggleExportMode(false)
}

const ymdToDMY = (key) => {
  if (!key || key.length < 10) return key
  const [Y, M, D] = key.split('-')
  return `${D}-${M}-${Y}`
}
async function exportarExcelCompleto() {
  const fixed = ['Cuadrilla','Partida','Unidad','Pond.','Cant. Objetivo','Cant. Avance','% Cant. Avance','% Avance Pond.','Tipo']
  const dayKeys   = days.value.map(d => d.key)
  const dayLabels = dayKeys.map(ymdToDMY)
  const header    = [...fixed, ...dayLabels]

  const data = []
  for (const row of visibleRows.value) {
    const base = {
      'Cuadrilla': row.kind === 'cuad' ? row.cuadrilla : '',
      'Partida':   row.kind === 'data' ? row.partida   : '',
      'Unidad':    row.unidad ?? '',
      'Pond.':     row.pondMostrar ?? '',
      'Cant. Objetivo': row.cantObjetivo ?? '',
      'Cant. Avance':   row.cantAvance   ?? '',
      '% Cant. Avance': row.kind === 'data'
        ? (row.avance != null ? Number(row.avance).toFixed(2) : '')
        : '',
      '% Avance Pond.': row.kind === 'data'
        ? (row.avancePond != null ? Math.round(row.avancePond) : '')
        : '',
      'Tipo':      row.kind === 'data' ? 'Plan' : ''
    }

    const perDay = {}
    if (row.kind === 'cuad') {
      const ini = row.spanStart ? ymd(row.spanStart) : null
      const fin = row.spanEnd   ? ymd(row.spanEnd)   : null
      for (let i = 0; i < dayKeys.length; i++) {
        const key = dayKeys[i], label = dayLabels[i]
        perDay[label] = (ini && fin && key >= ini && key <= fin) ? '◼' : ''
      }
    } else if (row.kind === 'data' && row.start && row.end) {
      const { i0, i1 } = barDays(row.start, row.end)
      for (let i = 0; i < dayKeys.length; i++) {
        const key = dayKeys[i], label = dayLabels[i]
        let val = ''
        if (i >= i0 && i <= i1) {
          // respeta bloqueo
          if (!(row.blocked && (!row.unblockDate || key < row.unblockDate))) {
            const v = row?.daily?.[key]
            val = (v === '' || v == null) ? '' : Number(v)
          }
        }
        perDay[label] = val
      }
    } else {
      for (const label of dayLabels) perDay[label] = ''
    }

    data.push({ ...base, ...perDay })
  }

  const ws = XLSX.utils.json_to_sheet(data, { header })
  ws['!cols'] = [
    { wch: 18 }, { wch: 32 }, { wch: 8 }, { wch: 8 },
    { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 10 },
    ...dayLabels.map(() => ({ wch: 11 }))
  ]
  ws['!freeze'] = { xSplit: 9, ySplit: 1 }

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Gantt')
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), 'Gantt_completo.xlsx')
}

// Alto total de todas las filas visibles (para el alto del SVG)
const totalRowsHeightPx = computed(() =>
  visibleRows.value.reduce((acc, r) => acc + (r.kind === 'data' ? rowHeight : headerRowHeight), 0)
)

// Y del centro de una fila visible por índice
function rowCenterY(idx) {
  let y = 0
  for (let k = 0; k < idx; k++) {
    y += (visibleRows.value[k].kind === 'data' ? rowHeight : headerRowHeight)
  }
  const h = (visibleRows.value[idx].kind === 'data' ? rowHeight : headerRowHeight)
  return y + h / 2
}

// X del centro de un día para la fila idx (usa primer o último día del plan)
function dayCenterXForRow(idx, which = 'end') {
  const row = visibleRows.value[idx]
  if (!row || row.kind !== 'data' || !row.start || !row.end) return null
  const { i0, i1 } = barDayIndices(row)
  const dIdx = which === 'start' ? i0 : i1
  if (dIdx == null || dIdx < 0) return null
  return dIdx * dayW.value + dayW.value / 2
}

// Dependencias DEMO: del primer "data" al cuarto "data"
// Dependencias reales basadas en id_tarea_predecesora
const dependencies = computed(() => {
  const deps = []

  // Mapa id_tarea -> índice en visibleRows
  const indexById = new Map()
  visibleRows.value.forEach((r, idx) => {
    if (r.kind === 'data' && r.id_tarea != null) {
      indexById.set(r.id_tarea, idx)
    }
  })

  visibleRows.value.forEach((row, idxTo) => {
    if (row.kind !== 'data') return
    if (row.id_tarea_predecesora == null || row.id_tarea_predecesora === '') return

    // Soporta 1 o varios predecesores
    let prevIds = []
    if (Array.isArray(row.id_tarea_predecesora)) {
      prevIds = row.id_tarea_predecesora
    } else {
      prevIds = String(row.id_tarea_predecesora)
        .split(',')
        .map(x => Number(x.trim()))
        .filter(v => !Number.isNaN(v))
    }

    for (const pid of prevIds) {
      const fromIdx = indexById.get(pid)
      if (fromIdx == null) continue
      if (fromIdx === idxTo) continue  // evitar loops raros

      deps.push({
        from: fromIdx,
        to: idxTo,
        type: 'FS'   // Finish → Start (semántica visual)
      })
    }
  })

  return deps
})

// Devuelve un path 'C' con codo suave entre dos puntos
function depPath(fromIdx, toIdx) {
  const x1 = depAnchorX(fromIdx, 'end')    // borde derecho tarea origen
  const y1 = rowCenterY(fromIdx)
  const x2 = depAnchorX(toIdx, 'start')   // borde izquierdo tarea destino
  const y2 = rowCenterY(toIdx)

  if (x1 == null || x2 == null) return null

  // Distancia horizontal
  const dx = x2 - x1

  // Cuánto separar los puntos de control (mínimo 40px para que se note la curva)
  const ctrlOffset = Math.max(40, Math.abs(dx) / 2)

  // Puntos de control de la curva de Bézier cúbica
  const cx1 = x1 + ctrlOffset
  const cx2 = x2 - ctrlOffset

  // Path suave: arranca en (x1,y1), curva y termina en (x2,y2)
  return `M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`
}

// X en píxeles del borde del dot (start = borde izquierdo, end = borde derecho)
function depAnchorX(idx, side = 'center') {
  const row = visibleRows.value[idx]
  if (!row || row.kind !== 'data' || !row.start || !row.end) return null

  const { i0, i1 } = barDayIndices(row)
  const dIdx = side === 'start' ? i0 : i1  // start: primer día, end: último día
  if (dIdx == null || dIdx < 0) return null

  const gap   = 10
  const width = Math.max(dayW.value - gap, 12)

  // centro del dot (ojo: esos +6 px vienen de barTotalStyle)
  const center = dIdx * dayW.value + dayW.value / 2 + 6

  if (side === 'start') return center - width / 2     // borde izquierdo del dot
  if (side === 'end')   return center + width / 2     // borde derecho del dot
  return center
}
</script>

<style scoped>
*{ box-sizing: border-box; }

/* ===== Grid principal ===== */
.gridgantt{
  --left-w: 870px; /* 110+220+60+60+90+90+120+120+90 */
  background: #f8fafc;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0,0,0,.06);
  overflow: hidden;
  display: grid;
  grid-template-columns: var(--left-w) minmax(0, 1fr);
  grid-template-rows: 48px 1fr;
}

/* ===== Header izquierda ===== */
.left-header{
  grid-column: 1; grid-row: 1;
  display: grid;
  grid-template-columns: 110px 220px 60px 60px 90px 90px 120px 120px;
  align-items: center; height: 48px;
  background: #eef2f7; color: #374151; font-weight: 600;
  border-bottom: 1px solid #e5e7eb;
  position: sticky; left: 0; z-index: 6;
}
.left-header .cell{ justify-content: center; text-align: center; }
.left-header .w-partida{ text-overflow: ellipsis; white-space: nowrap; overflow: hidden; }

/* ===== Header días (alineado) ===== */
.right-header-viewport{
  grid-column: 2; grid-row: 1;
  overflow: hidden; background: #eef2f7;
  border-bottom: 1px solid #e5e7eb; position: relative; height: 48px;
}
.right-header-track{ position: absolute; left: 15px; top: 0; bottom: 0; display: inline-flex; height: 48px; }
.day-header{ display:flex; align-items:center; justify-content:center; font-size:12px; color:#374151; padding:0 4px; }
.day-header.wknd{ background:#e8eef5; color:#475569; }

/* ===== Scroller combinado ===== */
.rows-scroller{
  grid-column: 1 / 3; grid-row: 2;
  display: grid; grid-template-columns: var(--left-w) minmax(0, 1fr);
  overflow: auto; min-height: 0; scrollbar-gutter: stable both-edges;
}

/* ===== Izquierda (filas) ===== */
.left-body{
  position: sticky; left: 0; z-index: 4; background: #f8fafc; box-shadow: 1px 0 0 #e5e7eb;
}
.left-row{
  display: grid;
  grid-template-columns: 110px 220px 60px 60px 90px 90px 120px 120px;
}
.left-row.even .cell{ background:#e0e2e9; }
.left-row.cuad .cell{ height: 36px; }

.cell{
  padding: 0 12px; height: 44px;
  display:flex; align-items:center; gap:8px;
  border-bottom:1px solid #eef2f7; color:#111827; font-size:14px;
}
.linklike{ color:#0f62fe; font-weight:600; cursor:pointer; }
.linklike:hover{ text-decoration: underline; }
.muted{ color:#4b5563; }
.partida-title{ font-weight:600; color:#111827; }

.chev{ border:none; background:transparent; cursor:pointer; padding:0 4px; }
.arrow{ display:inline-block; transition: transform .2s ease; }
.arrow.open{ transform: rotate(90deg); }

/* ===== Barra de avance (píldora) ===== */
.w-av .pct-bar{
  --track: #dff1fb;
  --fill:  #8ecae6;
  position: relative;
  display: inline-block;
  width: 140px;
  height: 26px;
  border-radius: 9999px;
  background: var(--track);
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,.04);
}
.w-av .pct-bar__fill{
  position: absolute; left: 0; top: 0; bottom: 0;
  background: var(--fill); border-radius: 9999px; transition: width .25s ease;
}
.w-av .pct-bar__text{
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 13px; color: #000; text-shadow: 0 1px 0 rgba(0,0,0,.18);
  pointer-events: none;
}

/* ===== Badges Tipo ===== */
.badge{ display:inline-block; padding:2px 8px; border-radius:999px; font-weight:700; font-size:12px; color:#fff !important; text-shadow:0 1px 0 rgba(0,0,0,.15); }
.b-plan{ background:#8ecae6 !important; }

/* ===== Timeline (derecha) ===== */
.right-side{ min-width: 0; }
.right-body{ position: relative; }
.grid-lines{ position:absolute; inset:0; display:inline-flex; pointer-events:none; z-index:0; }
.grid-col{ height: 100%; border-right:1px solid #edf0f3; background: transparent; }
.grid-col.wknd{ background: rgba(15,23,42,.02); }

.t-row{ position: relative; border-bottom: 1px solid #eef2f7; }
.t-row.even{ background:#fafbff; }
.t-row.cuad{ height: 36px !important; }

/* Dots por día */
.bar{
  position:absolute; top: 8px; height: 28px;
  border-radius: 14px; box-shadow: 0 2px 6px rgba(0,0,0,.15);
  display:flex; align-items:center; justify-content:center;
  padding: 0 10px; color:#fff; font-weight:800; letter-spacing:.2px; z-index:2;
}
.bar-plan{ background:#8ecae6; }
.bar-plan-reasig{ background:#1f84d6; }
.bar-blocked{
  background: #cbd5e1 !important;
  color: #1f2937 !important;
  box-shadow: none !important;
  opacity: 0.9;
  border: 1px dashed #94a3b8;
}
.bar-critical{
  outline: 2px solid #0ea5e9;
  box-shadow: 0 0 0 2px rgba(14,165,233,.25);
}
.dot-value{ font-size:12px; line-height:1; white-space:nowrap; }
.bar-progress{ position:absolute; left:0; top:0; bottom:0; background: rgba(255,255,255,.35); border-radius: 14px; z-index: 1; }
.critical-progress{ box-shadow: inset 0 0 0 2px rgba(14,165,233,.35); }

/* Línea de hoy */
.today-line{ position:absolute; top:0; bottom:0; width:2px; background:#ffd166; box-shadow:0 0 0 2px rgba(255,209,102,.25); pointer-events:none; z-index:3; }

/* Span de cuadrilla */
.cuad-span{
  position: absolute;
  top: 10px;
  height: 15px;
  border-radius: 999px;
  background: rgba(22, 91, 241, 0.55);
  box-shadow: 0 1px 2px rgba(0,0,0,.08) inset;
  pointer-events: none;
  z-index: 1;
}

/* ===== Modo exportación ===== */
.gridgantt.exporting { box-shadow: none !important; filter: none !important; background: #fff !important; }
.gridgantt.exporting .left-header,
.gridgantt.exporting .right-header-viewport { position: static !important; overflow: visible !important; }
.gridgantt.exporting .right-header-track { position: static !important; }
.gridgantt.exporting .rows-scroller { overflow: visible !important; }
.gridgantt.exporting .left-body { position: static !important; box-shadow: none !important; }
.gridgantt.exporting .t-row .bar, .gridgantt.exporting .cuad-span { box-shadow: none !important; text-shadow: none !important; }
.gridgantt.exporting .w-av .pct-bar, .gridgantt.exporting .w-av .pct-bar__fill, .gridgantt.exporting .badge { box-shadow: none !important; text-shadow: none !important; }
.dep-line{
  fill: none;
  stroke: #00080c;         /* celestito */
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: drop-shadow(0 1px 0 rgba(14,165,233,0.25));
}
.dep-head{
  fill: #0ea5e9;
  stroke: #ffffff;
  stroke-width: 1;
}

/* Pista continua (start→end) detrás de los dots */
/* antes
.bar-lane{
  position: absolute;
  left: 10px; right: 0;
  top: 18px;
  height: 6px;
  border-radius: 999px;
  background: rgba(14,165,233, .18);
  outline: 2px solid rgba(14,165,233, .45);
  box-shadow: inset 0 0 0 1px rgba(14,165,233,.12);
  z-index: 0;
}
*/

.bar-progress { display: none !important; }
.critical-progress { box-shadow: none !important; }

.bar-progress,
.critical-progress {
  display: none !important;
  box-shadow: none !important;
}

.deps {
  z-index: 3 !important;
}

.dep-line{
  fill: none;
  stroke: #9a9a9a;
  stroke-width: 2;
  stroke-linecap: butt;
  stroke-linejoin: miter;
}

.dep-arrow {
  fill: #9a9a9a;      /* mismo color de la línea */
}

.bar-strip{
  position: absolute;  /* por si acaso, aunque ya viene en el style inline */
  top: 0;
  bottom: 0;
}

/* Fondo celeste muy pálido bajo las tareas (entre start y end) */
.bar-bg{
  position: absolute;
  inset: 0;                     /* top:0; right:0; bottom:0; left:0 */
  border-radius: 4px;
  background: rgba(56, 189, 248, 0.2); /* celestito MUY suave */
  z-index: 0;                   /* debajo de los dots */
}
</style>
