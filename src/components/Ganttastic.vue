<template>
  <div
    class="mb-2"
    style="display:flex; gap:8px; align-items:center;"
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

    <v-switch
      v-model="verDeps"
      inset
      color="primary"
      class="ml-6"
      :label="verDeps ? 'Ver dependencias' : 'Ocultar dependencias'"
    />
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
      <!-- 🔥 Eliminada la columna Plan / Real -->
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
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  class="mr-2"
                  title="Editar"
                  @click="openEdit(row)"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
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

          <!-- 🔥 Columna Plan / Real ELIMINADA -->

          <!-- Cant. Avance Plan : Real -->
          <div class="cell w-obj">
            <template v-if="row.kind === 'data'">
              <span v-if="row.showLeft">
                {{ formatNum(row.cantAvancePlan) }}
                <span class="cant-sep">:</span>
                {{ formatNum(row.cantAvanceReal) }}
              </span>
            </template>
          </div>

          <!-- % Cant. Avance (Real) -->
          <div class="cell w-av">
            <template v-if="row.kind === 'data'">
              <template v-if="row.showLeft && row.avanceRealPct != null">
                <div class="pct-bar is-real">
                  <div
                    class="pct-bar__fill"
                    :style="{ width: clamp01(row.avanceRealPct).toFixed(1) + '%' }"
                  />
                  <span class="pct-bar__text">
                    {{ formatPct1(row.avanceRealPct) }}%
                  </span>
                </div>
              </template>
            </template>
          </div>

          <!-- % Avance Ponderado (Real) -->
          <div class="cell w-av">
            <template v-if="row.kind === 'data'">
              <template v-if="row.showLeft && row.avancePondReal != null">
                <div class="pct-bar is-real">
                  <div
                    class="pct-bar__fill"
                    :style="{ width: pondWidthReal(row) }"
                  />
                  <span class="pct-bar__text">{{ pondLabelReal(row) }}</span>
                </div>
              </template>
            </template>
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
            v-if="verDeps"
            class="deps"
            :width="totalWidthPx"
            :height="totalRowsHeightPx"
            style="position:absolute; left:0; top:0; pointer-events:none; z-index:2;"
          >
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

            <!-- Barra/ pastillas por día (Plan pintado con Real) -->
            <div
              v-else-if="row.kind==='data' && row.start && row.end"
              class="bar-strip"
              :style="barTotalStyle(row.start, row.end)"
            >
              <!-- Fondo celeste suave del rango -->
              <div class="bar-bg" />

              <!-- Pastillas Plan (pintadas según Real) -->
              <div
                v-for="dIdx in barDayIndices(row).days"
                :key="'D'+dIdx"
                class="bar"
                :class="[
                  planBaseClass(row, dIdx),
                  planProgressClass(row, dIdx),
                  { 'dot-clickable': row.id_survey }
                ]"
                :style="planBarStyle(row, dIdx, barDayIndices(row).i0)"
                :title="tooltipText(row, dIdx)"
                @click="onDotClick(row)"
              >
                <span class="dot-value">
                  {{ formatNumShort(dotValue(row, dIdx)) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div><!-- /rows-scroller -->
  </div>

  <!-- Diálogo de edición -->
  <v-dialog
    v-model="editOpen"
    max-width="1200"
  >
    <v-card>
      <v-toolbar
        flat
        density="comfortable"
      >
        <v-toolbar-title>Editar Tarea</v-toolbar-title>
        <v-spacer />
        <v-btn
          icon
          @click="editOpen = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-divider />

      <v-card-text class="pa-4">
        <v-row dense>
          <v-col
            cols="12"
            md="4"
          >
            <v-card-title>Detalles Tarea</v-card-title>
            <v-table
              density="compact"
              class="plain-table"
            >
              <tbody>
                <tr>
                  <td class="k">
                    Cuadrilla
                  </td><td class="v">
                    {{ editRow?.cuadrilla || '—' }}
                  </td>
                </tr>
                <tr>
                  <td class="k">
                    Partida
                  </td><td class="v">
                    {{ editRow?.partida || '—' }}
                  </td>
                </tr>
                <tr>
                  <td class="k">
                    Unidad
                  </td><td class="v">
                    {{ editRow?.unidad || '—' }}
                  </td>
                </tr>
                <tr>
                  <td class="k">
                    Cant. Objetivo
                  </td><td class="v">
                    {{ formatNum(editRow?.cantObjetivo) }}
                  </td>
                </tr>
                <tr>
                  <td class="k">
                    Cant. Avance
                  </td><td class="v">
                    {{ formatNum(editRow?.cantAvance) }}
                  </td>
                </tr>
                <tr>
                  <td class="k">
                    % Cant. Avance
                  </td><td class="v">
                    {{ clampPct(editRow?.avance) }}
                  </td>
                </tr>
                <tr>
                  <td class="k">
                    % Avance Pond.
                  </td><td class="v">
                    {{ pondLabel(editRow) }}
                  </td>
                </tr>
                <tr>
                  <td class="k">
                    Tipo
                  </td><td class="v">
                    {{ shortTipo(editRow?.tipo) }}
                  </td>
                </tr>
                <tr>
                  <td class="k">
                    Rango
                  </td>
                  <td class="v">
                    {{ editRow?.start || '—' }} → {{ editRow?.end || '—' }}
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-col>

          <v-col
            cols="12"
            md="8"
          >
            <GanttEditarTareas
              ref="editorRef"
              :row="editRow"
              :plan-daily="editRow?.planOriginalDaily || {}"
              :show-actions="false"
              @save="onSaveReal"
              @cancel="editOpen=false"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider />

      <v-card-actions class="justify-end">
        <v-btn
          variant="text"
          @click="editOpen=false"
        >
          Cerrar
        </v-btn>
        <v-btn
          color="primary"
          @click="editorRef?.save()"
        >
          Guardar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import GanttEditarTareas from '../components/GanttEditarTareas.vue'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import apiAxios from '@/services/api';

const props = defineProps({
  tareas: { type: Array, required: true },
  fechaDesde: String,
  fechaHasta: String,
  clienteId: [String, Number],
  proyectoId: [String, Number]
})

const emit = defineEmits(['refresh'])

/* ======= Estado diálogo ======= */
const editOpen = ref(false)
const editRow  = ref(null)
const editorRef = ref(null)

/* ======= Estado UI ======= */
const verDeps = ref(false)

const scrollLeftPx = ref(0)
const gridRef = ref(null)
const rowsScroller = ref(null)
const rightHeaderViewport = ref(null)

/* ====== Helpers base ====== */
const parse = (s) => new Date(s.replace(' ', 'T'))
const trunc = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())
const addDays = (date, n) => { const nd = new Date(date); nd.setDate(nd.getDate() + n); return nd }
const ymd = (date) => {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
const formatNum = (v) =>
  (v == null || v === '' ? '—'
    : new Intl.NumberFormat('es-CL', { maximumFractionDigits: 2 }).format(v))
const formatNumShort = (v) =>
  (v == null || v === '' ? ''
    : new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 }).format(v))
const shortTipo = (t) => (t === 'Real' ? 'Real' : 'Plan')
const clampPct = (v) =>
  (v == null ? '0%' : `${Math.max(0, Math.min(100, Math.round(v)))}%`)
const clamp01 = (v) => {
  const n = Number(v ?? 0)
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(100, n))
}

/* ====== Editor: abrir ====== */
function getCuadrillaName(idPadre) {
  const p = props.tareas.find(t => t.id_tarea === idPadre)
  return p ? p.nombre_tarea : ''
}

function openEdit(row) {
  const tareaSrc = props.tareas.find(t =>
    t.nivel === 2 &&
    t.nombre_tarea === row.partida &&
    getCuadrillaName(t.id_tarea_padre) === row.cuadrilla
  )

  const planOriginalDaily = {}
  const reasignadoDaily   = {}
  const obsDaily          = {}

  if (Array.isArray(tareaSrc?.json_data)) {
    for (const it of tareaSrc.json_data) {
      const k = it.fecha
      if (it.value !== null && it.value !== undefined && it.value !== '') {
        planOriginalDaily[k] = Number(it.value) || 0
      }
      if (
        Object.prototype.hasOwnProperty.call(it, 'plan_reasignado') &&
        it.plan_reasignado !== null &&
        it.plan_reasignado !== '' &&
        Number(it.plan_reasignado) !== 0
      ) {
        reasignadoDaily[k] = Number(it.plan_reasignado) || 0
      }
      if (it.observacion != null && String(it.observacion).trim() !== '') {
        obsDaily[k] = String(it.observacion)
      }
    }
  }

  editRow.value = {
    ...row,
    planOriginalDaily,
    reasignadoDaily,
    obsDaily
  }

  editOpen.value = true
}

/* ====== JSON reasignado ====== */
function buildJsonDataActualizado(
  jsonDataActual = [],
  reasignadoDaily = {},
  obsDaily = {}
) {
  const map = new Map(jsonDataActual.map(it => [it.fecha, { ...it }]))

  for (const [fecha, val] of Object.entries(reasignadoDaily || {})) {
    const n = Number(val ?? 0)
    const cur = map.get(fecha)

    if (cur) {
      map.set(fecha, {
        ...cur,
        plan_reasignado: n,
        observacion:
          Object.prototype.hasOwnProperty.call(obsDaily || {}, fecha)
            ? (obsDaily[fecha] ?? null)
            : (cur.observacion ?? null),
      })
    } else {
      map.set(fecha, {
        fecha,
        value: null,
        real: null,
        fotos: [],
        observacion:
          Object.prototype.hasOwnProperty.call(obsDaily || {}, fecha)
            ? (obsDaily[fecha] ?? null)
            : null,
        motivo_rechazo: null,
        plan_reasignado: n
      })
    }
  }

  for (const [fecha, txt] of Object.entries(obsDaily || {})) {
    if (map.has(fecha)) {
      const cur = map.get(fecha)
      map.set(fecha, { ...cur, observacion: txt ?? null })
    } else {
      map.set(fecha, {
        fecha,
        value: null,
        real: null,
        fotos: [],
        observacion: txt ?? null,
        motivo_rechazo: null,
        plan_reasignado: 0
      })
    }
  }

  return Array.from(map.values()).sort((a, b) => a.fecha.localeCompare(b.fecha))
}

async function guardarJsonDataTarea(id_tarea, jsonDataNuevo) {
  const payload = { id_tarea, json_data: jsonDataNuevo }

  try {
    const { data } = await apiAxios.put(
      '/tareas/updTareas',
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    )
    console.log('Tareas actualizadas OK:', data)
  } catch (error) {
    console.error('Error al actualizar tareas:', error?.response?.data || error)
    throw error
  }
}

async function onSaveReal({ reasignadoDaily, obsDaily, row }) {
  const tarea = props.tareas.find(t =>
    t.nivel === 2 &&
    t.nombre_tarea === row.partida &&
    getCuadrillaName(t.id_tarea_padre) === row.cuadrilla
  )
  if (!tarea) return

  const jsonDataNuevo = buildJsonDataActualizado(
    Array.isArray(tarea.json_data) ? tarea.json_data : [],
    reasignadoDaily,
    obsDaily
  )

  const backup = Array.isArray(tarea.json_data) ? [...tarea.json_data] : []
  tarea.json_data = jsonDataNuevo

  try {
    await guardarJsonDataTarea(tarea.id_tarea, jsonDataNuevo)
    editOpen.value = false
    emit('refresh')
  } catch (e) {
    tarea.json_data = backup
  }
}

/* ====== EXPORT EXCEL ====== */
const ymdToDMY = (key) => {
  if (!key || key.length < 10) return key
  const [Y, M, D] = key.split('-')
  return `${D}-${M}-${Y}`
}

async function exportarExcelCompleto() {
  // 🔥 Sacamos 'Tipo' porque ya no hay columna Plan / Real
  const fixed = [
    'Cuadrilla','Partida','Unidad','Pond.','Cant. Objetivo',
    'Cant. Avance','% Cant. Avance','% Avance Pond.'
  ]
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
      '% Cant. Avance': row.kind === 'data' ? Math.round(row.avance ?? 0) : '',
      '% Avance Pond.': row.kind === 'data' ? (pondPct(row) ?? '') : ''
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
        const label = dayLabels[i]
        const val = (i >= i0 && i <= i1) ? dotValue(row, i) : ''
        perDay[label] = (val === '' || val == null) ? '' : Number(val)
      }
    } else {
      for (const label of dayLabels) perDay[label] = ''
    }

    data.push({ ...base, ...perDay })
  }

  const ws = XLSX.utils.json_to_sheet(data, { header })
  // 🔥 8 columnas fijas en vez de 9
  ws['!cols'] = [
    { wch: 18 }, // Cuadrilla
    { wch: 32 }, // Partida
    { wch: 8 },  // Unidad
    { wch: 8 },  // Pond.
    { wch: 14 }, // Cant. Objetivo
    { wch: 14 }, // Cant. Avance
    { wch: 16 }, // % Cant. Avance
    { wch: 10 }, // % Avance Pond.
    ...dayLabels.map(() => ({ wch: 11 }))
  ]
  ws['!freeze'] = { xSplit: 8, ySplit: 1 }

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Gantt')
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), 'Gantt_completo.xlsx')
}

/* ====== EXPORT PDF ====== */
function toggleExportMode(on) {
  const el = gridRef.value || document.querySelector('.gridgantt')
  if (!el) return
  el.classList.toggle('exporting', !!on)
}

async function exportarPDF() {
  const el = gridRef.value || document.querySelector('.gridgantt')
  if (!el) return

  // 👇 1) Activar modo “exporting” (ya lo tienes)
  toggleExportMode(true)

  // 👇 2) Guardar configuración actual y comprimir el Gantt
  const oldPxPerDay = pxPerDay.value
  pxPerDay.value = 32 // o 28 / 24, prueba qué se ve mejor

  await nextTick() // esperamos a que Vue re-renderice con el nuevo ancho

  // 👇 3) Llevar los scrollers al inicio
  const scroller = el.querySelector('.rows-scroller')
  const hdr = el.querySelector('.right-header-viewport')
  if (scroller) scroller.scrollLeft = 0
  if (hdr) hdr.scrollLeft = 0
  if (document.fonts?.ready) { try { await document.fonts.ready } catch {} }

  // 👇 4) Captura con html2canvas
  const width = el.scrollWidth
  const height = el.scrollHeight
  const scale = Math.max(2, Math.ceil(window.devicePixelRatio || 1))

  const canvas = await html2canvas(el, {
    backgroundColor: '#ffffff',
    scale,
    useCORS: true,
    allowTaint: true,
    width,
    height,
    windowWidth: width,
    windowHeight: height,
    scrollX: 0,
    scrollY: 0
  })

  // 👇 5) Crear PDF (ver siguiente bloque para A2/A3)
  const pdf = new jsPDF('l', 'mm', 'a2') // o 'a2' abajo te muestro
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()

  const pxToMm = (px) => px * 25.4 / 96
  const imgWmm = pxToMm(canvas.width)
  const imgHmm = pxToMm(canvas.height)
  const ratio = Math.min(pageW / imgWmm, pageH / imgHmm)
  const pagePxH = Math.floor((pageH / ratio) * 96 / 25.4)

  let y = 0
  let page = 0
  while (y < canvas.height) {
    const slice = document.createElement('canvas')
    slice.width = canvas.width
    slice.height = Math.min(pagePxH, canvas.height - y)
    const ctx = slice.getContext('2d')
    ctx.drawImage(
      canvas,
      0, y, canvas.width, slice.height,
      0, 0, canvas.width, slice.height
    )
    const img = slice.toDataURL('image/png')

    if (page > 0) pdf.addPage() // ya está en landscape y tamaño correcto
    const w = imgWmm * ratio
    const h = pxToMm(slice.height) * ratio
    pdf.addImage(img, 'PNG', 0, 0, w, h)

    y += pagePxH
    page++
  }

  pdf.save('Gantt.pdf')

  // 👇 6) Restaurar estado
  pxPerDay.value = oldPxPerDay
  toggleExportMode(false)
}

/* ====== Construcción de rows desde tareas ====== */
function buildRowsFromTareas(tareas = []) {
  const padres = new Map()
  const hijos = []

  for (const t of tareas) {
    if (t.nivel === 1) {
      padres.set(t.id_tarea, {
        nombre: t.nombre_tarea,
        ponderado: t.ponderado != null ? Number(t.ponderado) : null
      })
    } else if (t.nivel === 2) {
      hijos.push(t)
    }
  }

  hijos.sort((a, b) => {
    const pa = a.id_tarea_padre ?? 0
    const pb = b.id_tarea_padre ?? 0
    if (pa !== pb) return pa - pb
    return (a.id_tarea ?? 0) - (b.id_tarea ?? 0)
  })

  const rows = []

  for (const h of hijos) {
    const padre = padres.get(h.id_tarea_padre)
    if (!padre) continue

    const pondTarea = h.ponderado != null ? Number(h.ponderado) : null
    const json = Array.isArray(h.json_data) ? h.json_data : []

    const dailyPlan = {}
    const dailyReal = {}

    let dMinPlan = null, dMaxPlan = null
    let dMinReal = null, dMaxReal = null

    let planTotal = 0
    let realTotal = 0

    const planReasigDaily = {}

    for (const it of json) {
      const key = it.fecha
      if (!key) continue

      // PLAN
      let valPlan = null
      const tieneReasigNoCero =
        Object.prototype.hasOwnProperty.call(it, 'plan_reasignado') &&
        it.plan_reasignado !== null &&
        it.plan_reasignado !== '' &&
        Number(it.plan_reasignado) !== 0

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

      // REAL
      if (Object.prototype.hasOwnProperty.call(it, 'real')) {
        const valR = Number(it.real ?? 0)
        const d = new Date(key + 'T00:00:00')

        dailyReal[key] = (dailyReal[key] ?? 0) + (Number.isFinite(valR) ? valR : 0)
        dMinReal = dMinReal ? (d < dMinReal ? d : dMinReal) : d
        dMaxReal = dMaxReal ? (d > dMaxReal ? d : dMaxReal) : d

        if (Number.isFinite(valR)) realTotal += valR
      }
    }

    const cantObjetivo = h.cantidad_objetivo != null ? Number(h.cantidad_objetivo) : null

    const avancePlanPct = 0
    const avanceRealPct = h.cantidad_avance_pct != null
      ? Number(h.cantidad_avance_pct)
      : 0

    const avancePonderadoPct = h.avance_ponderado_pct != null
      ? Number(h.avance_ponderado_pct)
      : null

    const cantAvanceTotal = h.cantidad_avance != null
      ? Number(h.cantidad_avance)
      : null

    // FILA ÚNICA (Plan + Real)
    if (planTotal > 0 || Object.keys(dailyPlan).length) {
      rows.push({
        id_tarea: h.id_tarea,
        id_tarea_predecesora: h.id_tarea_predecesora ?? h.id_tarea_predesesora ?? null,

        cuadrilla: padre.nombre,
        partida: h.nombre_tarea,
        unidad: h.unidad,
        tipo: 'Plan',

        cantidad: planTotal,
        avance: avancePlanPct,
        ponderado: pondTarea,
        pond: pondTarea,
        ponderadoCuad: padre.ponderado,

        cantObjetivo,
        cantAvance: cantAvanceTotal,
        cantAvancePlan: planTotal,
        cantAvanceReal: cantAvanceTotal,

        avanceRealPct,
        avancePondReal: avancePonderadoPct,

        x: dMinPlan
          ? `${dMinPlan.getFullYear()}-${String(dMinPlan.getMonth()+1).padStart(2,'0')}-${String(dMinPlan.getDate()).padStart(2,'0')} 00:00`
          : null,
        x2: dMaxPlan
          ? `${dMaxPlan.getFullYear()}-${String(dMaxPlan.getMonth()+1).padStart(2,'0')}-${String(dMaxPlan.getDate()).padStart(2,'0')} 00:00`
          : null,

        // diarios
        valores: Object.keys(dailyPlan).length ? dailyPlan : null,
        daily:   Object.keys(dailyPlan).length ? dailyPlan : null,
        dailyPlan: Object.keys(dailyPlan).length ? dailyPlan : null,
        dailyReal: Object.keys(dailyReal).length ? dailyReal : null,
        reasigDaily: Object.keys(planReasigDaily).length ? planReasigDaily : null,

        avancePond: avancePonderadoPct,
        id_survey: h.id_survey ?? null
      })
    }
  }

  return rows
}

/* ====== Estado y árbol ====== */
const rowHeight = 44
const headerRowHeight = 36
const pxPerDay = ref(56)
const dayW = computed(() => Math.round(pxPerDay.value))

const rows = computed(() => buildRowsFromTareas(props.tareas))

const treeByCuad = computed(() => {
  const mapa = new Map()
  for (const r of rows.value) {
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

    out.push({
      kind: 'cuad',
      cuadrilla,
      pondMostrar: pondHeader,
      spanStart,
      spanEnd
    })

    if (!isCuadOpen(cuadrilla)) continue

    // una sola fila por partida
    for (const [partida, recs] of porPartida.entries()) {
      const rec = recs[0]

      out.push({
        kind: 'data',
        tipo: rec.tipo,
        unidad: rec.unidad,
        pondMostrar: rec.ponderado ?? rec.pond ?? null,
        pondWeight:  rec.ponderado ?? rec.pond ?? null,
        cantObjetivo: rec.cantObjetivo ?? null,

        cantAvance:      rec.cantAvanceReal ?? rec.cantAvance ?? null,
        cantAvancePlan:  rec.cantAvancePlan ?? rec.cantAvance ?? null,
        cantAvanceReal:  rec.cantAvanceReal ?? null,
        avanceRealPct:   rec.avanceRealPct ?? null,
        avancePondReal:  rec.avancePondReal ?? rec.avancePond ?? null,

        cantidad: rec.cantidad,
        avance:   rec.avanceRealPct ?? rec.avance ?? null,

        start: rec.x,
        end:   rec.x2,

        daily:      rec.dailyPlan ?? rec.daily ?? null,
        dailyPlan:  rec.dailyPlan ?? rec.daily ?? null,
        dailyReal:  rec.dailyReal ?? null,
        reasigDaily: rec.reasigDaily ?? null,

        cuadrilla,
        partida,
        showLeft: true,
        avancePond: rec.avancePondReal ?? rec.avancePond ?? null,

        id_tarea: rec.id_tarea,
        id_tarea_predecesora: rec.id_tarea_predecesora ?? null,
        id_survey: rec.id_survey ?? null
      })
    }
  }

  return out
})

/* ====== Dependencias (arrows) ====== */
const totalRowsHeightPx = computed(() =>
  visibleRows.value.reduce(
    (acc, r) => acc + (r.kind === 'data' ? rowHeight : headerRowHeight),
    0
  )
)

function rowCenterY(idx) {
  let y = 0
  for (let k = 0; k < idx; k++) {
    y += (visibleRows.value[k].kind === 'data' ? rowHeight : headerRowHeight)
  }
  const h = (visibleRows.value[idx].kind === 'data' ? rowHeight : headerRowHeight)
  return y + h / 2
}

function barDays(start, end) {
  const i0 = dayIndex(start)
  const i1 = dayIndex(end)
  const arr = []
  for (let i = i0; i <= i1; i++) arr.push(i)
  return { i0, i1, days: arr }
}

function barDayIndices(row) {
  if (row?.daily && Object.keys(row.daily).length) {
    const idxs = Object.keys(row.daily)
      .map(k => days.value.findIndex(d => d.key === k))
      .filter(i => i >= 0)
      .sort((a, b) => a - b)

    if (idxs.length) {
      return { i0: idxs[0], i1: idxs[idxs.length - 1], days: idxs }
    }
  }
  return barDays(row.start, row.end)
}

function barDotStyle(i0, dIdx) {
  const innerIdx = dIdx - i0
  const gap = 10
  const width = Math.max(dayW.value - gap, 12)
  const left  = innerIdx * dayW.value + Math.round((dayW.value - width) / 2)
  return { left: left + 'px', width: width + 'px' }
}

const dependencies = computed(() => {
  const deps = []

  const indexById = new Map()
  visibleRows.value.forEach((r, idx) => {
    if (r.kind === 'data' && r.id_tarea != null) {
      indexById.set(r.id_tarea, idx)
    }
  })

  visibleRows.value.forEach((row, idxTo) => {
    if (row.kind !== 'data') return
    if (row.id_tarea_predecesora == null || row.id_tarea_predecesora === '') return

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
      if (fromIdx === idxTo) continue

      deps.push({ from: fromIdx, to: idxTo })
    }
  })

  return deps
})

function depAnchorX(idx, side = 'center') {
  const row = visibleRows.value[idx]
  if (!row || row.kind !== 'data' || !row.start || !row.end) return null

  const { i0, i1 } = barDayIndices(row)
  const dIdx = side === 'start' ? i0 : i1
  if (dIdx == null || dIdx < 0) return null

  const gap   = 10
  const width = Math.max(dayW.value - gap, 12)
  const center = dIdx * dayW.value + dayW.value / 2 + 6

  if (side === 'start') return center - width / 2
  if (side === 'end')   return center + width / 2
  return center
}

function depPath(fromIdx, toIdx) {
  const x1 = depAnchorX(fromIdx, 'end')
  const y1 = rowCenterY(fromIdx)
  const x2 = depAnchorX(toIdx, 'start')
  const y2 = rowCenterY(toIdx)

  if (x1 == null || x2 == null) return null

  const dx = x2 - x1
  const ctrlOffset = Math.max(40, Math.abs(dx) / 2)

  const cx1 = x1 + ctrlOffset
  const cx2 = x2 - ctrlOffset

  return `M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`
}

/* ====== Calendario / days ====== */
const minDate = computed(() => {
  const all = rows.value
    .flatMap(r => [r.x, r.x2].filter(Boolean))
    .map(parse)
  if (!all.length) return trunc(new Date())
  const m = new Date(Math.min(...all)); m.setDate(m.getDate() - 1); return trunc(m)
})
const maxDate = computed(() => {
  const all = rows.value
    .flatMap(r => [r.x, r.x2].filter(Boolean))
    .map(parse)
  if (!all.length) return addDays(trunc(new Date()), 7)
  const M = new Date(Math.max(...all)); M.setDate(M.getDate() + 1); return trunc(M)
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

const dayIndex = (dt) => {
  const dx = trunc(typeof dt === 'string' ? parse(dt) : dt)
  return Math.max(0, Math.min(days.value.length - 1,
    Math.round((dx - minDate.value) / 86_400_000)))
}

const spanStyle = (start, end) => {
  if (!start || !end) return { display: 'none' }
  const i0 = dayIndex(start), i1 = dayIndex(end)
  const left = i0 * dayW.value + 6
  const width = Math.max(dayW.value * (i1 - i0 + 1) - 12, 12)
  return { left: left + 'px', width: width + 'px' }
}

const barTotalStyle = (start, end) => {
  if (!start || !end) return { display: 'none' }
  const i0 = dayIndex(start), i1 = dayIndex(end)
  const left = i0 * dayW.value + 6
  const width = Math.max(dayW.value * (i1 - i0 + 1) - 12, 12)
  return {
    position: 'absolute',
    left: left + 'px',
    width: width + 'px',
    top: 0,
    bottom: 0
  }
}

const dotValue = (row, dIdx) => {
  const key = days.value[dIdx]?.key
  if (!key) return null
  const map = row.dailyPlan ?? row.daily ?? {}
  if (!Object.prototype.hasOwnProperty.call(map, key)) return null
  const v = map[key]
  if (v === '' || v == null) return null
  return Number(v)
}

const todayLeftPx = computed(() => {
  const t = trunc(new Date())
  if (t < minDate.value || t > maxDate.value) return null
  const idx = dayIndex(t)
  return Math.round(idx * dayW.value + dayW.value / 2)
})

/* ====== Stripe BG y scroll sync ====== */
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

const headerPadRight = ref(0)
function measureScrollbarWidth() {
  if (!rowsScroller.value) return
  const sbw = rowsScroller.value.offsetWidth - rowsScroller.value.clientWidth
  headerPadRight.value = Math.max(0, sbw)
}

/* ====== % Avance Ponderado ====== */
const formatPct1 = (v) => {
  const n = Number(v)
  if (!Number.isFinite(n)) return '0.0'
  return n.toFixed(1)
}
const pondPct = (row) => {
  const v = row?.avancePond
  if (v == null) return null
  const n = Number(v)
  if (!Number.isFinite(n)) return null
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
const pondWidthReal = (row) => pondWidth({ avancePond: row.avancePondReal })
const pondLabelReal = (row) => pondLabel({ avancePond: row.avancePondReal })

/* ====== Plan vs Real por día (para la pastilla) ====== */
function getDailyPlanRealForPlanRow(row, dIdx) {
  const key = days.value[dIdx]?.key
  if (!key) return { plan: 0, real: 0, isReasig: false }

  const planMap = row.dailyPlan ?? row.daily ?? {}
  let valPlan = 0
  if (Object.prototype.hasOwnProperty.call(planMap, key)) {
    const raw = planMap[key]
    if (raw !== '' && raw != null) {
      const n = Number(raw)
      if (Number.isFinite(n)) valPlan = n
    }
  }

  const realMap = row.dailyReal ?? {}
  let valReal = 0
  if (Object.prototype.hasOwnProperty.call(realMap, key)) {
    const rawR = realMap[key]
    if (rawR !== '' && rawR != null) {
      const n = Number(rawR)
      if (Number.isFinite(n)) valReal = n
    }
  }

  const isReasig = !!row.reasigDaily?.[key]

  return { plan: valPlan, real: valReal, isReasig }
}

function planBaseClass(row, dIdx) {
  const { isReasig } = getDailyPlanRealForPlanRow(row, dIdx)
  return isReasig ? 'bar-plan-reasig' : 'bar-plan'
}

function planProgressClass(row, dIdx) {
  const { plan, real } = getDailyPlanRealForPlanRow(row, dIdx)

  if (real <= 0) return 'prog-zero'
  if (plan <= 0) return 'prog-ok'
  if (real < plan) return 'prog-warn'
  return 'prog-ok'
}

function planBarStyle(row, dIdx, i0) {
  const base = barDotStyle(i0, dIdx)

  const { plan, real } = getDailyPlanRealForPlanRow(row, dIdx)
  let prog = 0
  if (plan > 0) {
    prog = Math.max(0, Math.min(1, real / plan))
  } else if (real > 0) {
    prog = 1
  }

  return {
    ...base,
    '--prog': prog
  }
}

function tooltipText(row, dIdx) {
  const key = days.value[dIdx]?.key
  if (!key) return ''

  const parts = []

  const planMap = row.dailyPlan ?? row.daily ?? {}
  if (Object.prototype.hasOwnProperty.call(planMap, key)) {
    const raw = planMap[key]
    if (raw !== '' && raw != null) {
      const n = Number(raw)
      if (Number.isFinite(n)) {
        const isReasig = !!row.reasigDaily?.[key]
        const label = isReasig ? 'Plan (Reasignado)' : 'Plan'
        parts.push(`${label}: ${formatNumShort(n)}`)
      }
    }
  }

  const realMap = row.dailyReal ?? {}
  if (Object.prototype.hasOwnProperty.call(realMap, key)) {
    const rawR = realMap[key]
    if (rawR !== '' && rawR != null) {
      const n = Number(rawR)
      if (Number.isFinite(n) && n > 0) {
        parts.push(`Real: ${formatNumShort(n)}`)
      }
    }
  }

  return parts.join(' | ') || 'Sin datos'
}

/* ====== Surveys / click en dot ====== */
const PDF_BASE_URL = '/archivo/terracon/'
const surveysConDocs = ref([])
const surveys = ref([])

async function getSurveys(id_survey) {
  try {
    const respSurveys = await apiAxios.get(
      `/servicio/leanglobal/procesosSurveyV3` +
      `?fecha_desde=${props.fechaDesde ?? ''}` +
      `&fecha_hasta=${props.fechaHasta ?? ''}` +
      `&ts.id_empresa_cliente=${props.clienteId ?? ''}` +
      `&ts.id_proyecto=${props.proyectoId ?? ''}`
    )

    surveys.value = respSurveys.data.datos || []
    surveysConDocs.value = surveys.value
      .map(s => ({ ...s }))
      .filter(s => s.id_survey === id_survey)
  } catch (error) {
    console.error('Error al obtener surveys:', error)
  }
}

async function onDotClick(row) {
  if (!row?.id_survey) {
    console.warn('Esta tarea no tiene id_survey asociado')
    return
  }

  await getSurveys(row.id_survey)
  if (!surveysConDocs.value.length) return
  const url = `${PDF_BASE_URL}${surveysConDocs.value[0].id_doc}`
  window.open(url, '_blank')
}

/* ====== Mounted / sync scroll ====== */
onMounted(async () => {
  for (const c of treeByCuad.value.keys()) openCuads.value.add(c)

  if (todayLeftPx.value != null && rowsScroller.value) {
    rowsScroller.value.scrollLeft = Math.max(0, todayLeftPx.value - 6 * dayW.value)
  }

  const syncHeader = () => {
    if (!rowsScroller.value || !rightHeaderViewport.value) return
    rightHeaderViewport.value.scrollLeft = rowsScroller.value.scrollLeft
    scrollLeftPx.value = rowsScroller.value.scrollLeft
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

/* ===== Grid principal ===== */
.gridgantt{
  /* 🔥 8 columnas ahora: 110+220+60+60+90+120+120+90 = 870 */
  --left-w: 870px;
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
  /* 🔥 8 columnas en vez de 9 (sin Plan/Real) */
  grid-template-columns: 110px 220px 60px 60px 90px 120px 120px 90px;
  align-items: center; height: 48px;
  background: #eef2f7; color: #374151; font-weight: 600;
  border-bottom: 1px solid #e5e7eb;
  position: sticky; left: 0; z-index: 6;
}
.left-header .cell{ justify-content: center; text-align: center; }
.left-header .w-partida{ text-overflow: ellipsis; white-space: nowrap; overflow: hidden; }

/* ===== Header días ===== */
.right-header-viewport{
  grid-column: 2; grid-row: 1;
  overflow: hidden; background: #eef2f7;
  border-bottom: 1px solid #e5e7eb; position: relative; height: 48px;
}
.right-header-track{
  position: absolute; left: 15px; top: 0; bottom: 0;
  display: inline-flex; height: 48px;
}
.day-header{
  display:flex; align-items:center; justify-content:center;
  font-size:12px; color:#374151; padding:0 4px;
}
.day-header.wknd{ background:#e8eef5; color:#475569; }

/* ===== Scroller ===== */
.rows-scroller{
  grid-column: 1 / 3; grid-row: 2;
  display: grid; grid-template-columns: var(--left-w) minmax(0, 1fr);
  overflow: auto; min-height: 0; scrollbar-gutter: stable both-edges;
}

/* ===== Izquierda ===== */
.left-body{
  position: sticky; left: 0; z-index: 4;
  background: #f8fafc; box-shadow: 1px 0 0 #e5e7eb;
}
.left-row{
  display: grid;
  /* 🔥 mismo layout de 8 columnas que el header */
  grid-template-columns: 110px 220px 60px 60px 90px 120px 120px 90px;
}
.left-row.even .cell{ background:#fafbff; }
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

/* ===== Barra % ===== */
.w-av .pct-bar{
  --track: #e8f4fb;
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
  background: var(--fill); border-radius: 9999px;
  transition: width .25s ease;
}
.w-av .pct-bar__text{
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 13px; color: #000;
  text-shadow: 0 1px 0 rgba(0,0,0,.18);
  pointer-events: none;
}
.w-av .pct-bar.is-real{ --track: #d9f3f0; --fill: #2a9d8f; }

.tipo-gap { margin-left: 6px; }
.cant-sep {
  margin: 0 4px;
  color: #6b7280;
  font-weight: 600;
}

/* ===== Timeline derecha ===== */
.right-side{ min-width: 0; }
.right-body{ position: relative; }
.grid-lines{
  position:absolute; inset:0;
  display:inline-flex; pointer-events:none; z-index:0;
}
.grid-col{ height: 100%; background: transparent; }
.grid-col.wknd{ background: rgba(15,23,42,.02); }

.t-row{ position: relative; border-bottom: 1px solid #eef2f7; }
.t-row.even{ background:#fafbff; }
.t-row.cuad{ height: 36px !important; }

/* Pastillas */
.bar{
  position:absolute;
  top: 8px;
  height: 28px;
  border-radius: 14px;
  box-shadow: 0 2px 6px rgba(0,0,0,.15);
  display:flex;
  align-items:center;
  justify-content:center;
  /* padding: 0 10px;  👈 opcional, lo acortamos abajo */
  padding: 0 8px;
  color:#fff;
  font-weight:800;
  letter-spacing:.2px;
  z-index:2;
}
.bar-plan{ background:#8ecae6; }
.bar-plan-reasig{ background:#1f84d6; }

/* NÚMERO DENTRO DE LA PASTILLA */
.dot-value {
  font-size: 12px;
  line-height: 1;
  white-space: nowrap;
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  /* 👇 sin transform aquí, para que en la web se vea tal como lo tienes */
}

/* Rango azul claro detrás */
.bar-strip{
  position: absolute;
  top: 0;
  bottom: 0;
}
.bar-bg{
  position: absolute;
  inset: 0;
  border-radius: 4px;
  background: rgba(56, 189, 248, 0.2);
  z-index: 0;
}

/* Línea de hoy */
.today-line{
  position:absolute; top:0; bottom:0;
  width:2px; background:#ffd166;
  box-shadow:0 0 0 2px rgba(255,209,102,.25);
  pointer-events:none; z-index:3;
}

/* Span cuadrilla */
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

/* ===== Export mode ===== */
.gridgantt.exporting { box-shadow: none !important; background: #fff !important; }
.gridgantt.exporting .left-header,
.gridgantt.exporting .right-header-viewport { position: static !important; overflow: visible !important; }
.gridgantt.exporting .right-header-track { position: static !important; }
.gridgantt.exporting .rows-scroller { overflow: visible !important; }
.gridgantt.exporting .left-body { position: static !important; box-shadow: none !important; }
.gridgantt.exporting .t-row .bar,
.gridgantt.exporting .cuad-span { box-shadow: none !important; text-shadow: none !important; }
.gridgantt.exporting .w-av .pct-bar,
.gridgantt.exporting .w-av .pct-bar__fill,
.gridgantt.exporting .badge { box-shadow: none !important; text-shadow: none !important; }

/* ===== Dependencias ===== */
.deps { z-index: 3 !important; }
.dep-line{
  fill: none;
  stroke: #9a9a9a;
  stroke-width: 2;
  stroke-linecap: butt;
  stroke-linejoin: miter;
}
.dep-arrow { fill: #9a9a9a; }

.dot-clickable { cursor: pointer; }

/* Tabla simple diálogo */
.plain-table {
  background: transparent !important;
  box-shadow: none !important;
  border-collapse: collapse;
  width: 100%;
}
.plain-table tbody tr td {
  border-bottom: 1px solid #eee;
  padding: 8px 10px;
  font-size: 14px;
}
.plain-table .k { width: 45%; color: #455a64; font-weight: 600; }
.plain-table .v { width: 55%; color: #111827; }

/* ===== Relleno Plan según Real (más clarito) ===== */
.bar-plan,
.bar-plan-reasig{
  overflow: hidden;
}

.bar-plan::after,
.bar-plan-reasig::after{
  content:''; position:absolute; inset:0;
  border-radius: inherit;
  width: calc(var(--prog, 0) * 100%);
}

.bar-plan.prog-ok::after,
.bar-plan-reasig.prog-ok::after{
  background: rgba(42, 157, 143, 0.8);
}
.bar-plan.prog-warn::after,
.bar-plan-reasig.prog-warn::after{
  background: rgba(255, 209, 102, 0.7);
}
.bar-plan.prog-zero::after,
.bar-plan-reasig.prog-zero::after{
  background: rgba(230, 57, 70, 0.7);
}

/* Rojo: solo una rayita fina */
.bar-plan.prog-zero::after,
.bar-plan-reasig.prog-zero::after{
  width: 3px;
}

.gridgantt.exporting .cell {
  height: 36px;
  font-size: 11px;
}

.gridgantt.exporting .bar {
  height: 24px;
  font-size: 11px;
}

/* Ajuste fino solo para la exportación a PDF */
.gridgantt.exporting .dot-value {
  transform: translateY(3px);  /* prueba 2px o 3px según se vea el PDF */
  font-size: 11px;             /* un pelito más chico para que respire */
}
</style>
