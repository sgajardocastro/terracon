<template>
  <div class="gstc-wrap">
    <div
      ref="el"
      class="gstc-container"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import GSTC from 'gantt-schedule-timeline-calendar'
import 'gantt-schedule-timeline-calendar/dist/style.css'

// ==== util fechas (de tu ejemplo) ====
const d = (y, m, day) => Date.UTC(y, m - 1, day)
const toMDY = (ts) => {
  const dt = new Date(ts)
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const dd = String(dt.getDate()).padStart(2, '0')
  const yy = dt.getFullYear()
  return `${mm}-${dd}-${yy}`
}
const toDMY = (ts) => {
  const dt = new Date(ts)
  const dd = String(dt.getDate()).padStart(2, '0')
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const yy = dt.getFullYear()
  return `${dd}-${mm}-${yy}`
}
const diffDays = (startTs, endTs) =>
  Math.max(0, Math.round((endTs - startTs) / 86400000))

// ==== tus datos base (un registro por barra) ====
const rowsInput = [
  { familia: 'Movimiento de tierras', partida: 'Excavaciones [MI]',         cuadrilla: 'C-01', tipo: 'Real',        cantidad: 200.50, avance: 50, x:d(2025,10,18), x2:d(2025,10,18) },
  { familia: 'Movimiento de tierras', partida: 'Instalación de Faena [ud]', cuadrilla: 'C-02', tipo: 'Planificado', cantidad: 500.0,  avance:100, x:d(2025,10,18), x2:d(2025,10,22) },
  { familia: 'Area Mecánica',         partida: 'Tendido Cable Ánodo [m²]',  cuadrilla: 'C-03', tipo: 'Planificado', cantidad: 50.0,   avance: 80, x:d(2025,10,19), x2:d(2025,10,21) },
  { familia: 'Area Mecánica',         partida: 'Soldadura Cañerías [m³]',   cuadrilla: 'C-04', tipo: 'Planificado', cantidad: 14.0,   avance:  0, x:d(2025,10,26), x2:d(2025,10,28) },
  { familia: 'Area Mecánica',         partida: 'Soldadura Cañerías [ud]',   cuadrilla: 'C-05', tipo: 'Planificado', cantidad: 35.0,   avance:  0, x:d(2025,10,18), x2:d(2025,10,18) },
  { familia: 'Cierre y Restitución',  partida: 'Servidumbre [m²]',          cuadrilla: 'C-06', tipo: 'Planificado', cantidad: 4.0,    avance:  0, x:d(2025,10,21), x2:d(2025,10,21) },
]

// ==== mapeo a GSTC ====
// 1 fila de GSTC por combinación (familia, partida, cuadrilla)
function buildRowsAndItems(input) {
  // construir filas
  const rows = {}
  const items = {}

  input.forEach((r, idx) => {
    const key = `${r.familia} | ${r.partida} | ${r.cuadrilla}`
    const rowId = `row-${key}`

    // crea fila si no existe
    if (!rows[rowId]) {
      rows[rowId] = {
        id: rowId,
        label: r.partida, // etiqueta base visible (título de la fila)
        // data extra para columnas
        data: {
          familia: r.familia,
          partida: r.partida,
          cuadrilla: r.cuadrilla,
          // guardamos también primer inicio/fin para columnas
          startTs: r.x,
          endTs: r.x2,
          duracion: diffDays(r.x, r.x2),
          avance: r.avance,
        },
      }
    } else {
      // si ya existe, actualiza rango resumen (para columnas Inicio/Final/Duración)
      rows[rowId].data.startTs = Math.min(rows[rowId].data.startTs, r.x)
      rows[rowId].data.endTs   = Math.max(rows[rowId].data.endTs,   r.x2)
      rows[rowId].data.duracion = diffDays(rows[rowId].data.startTs, rows[rowId].data.endTs)
      rows[rowId].data.avance = r.avance // (puedes promediar si quieres)
    }

    // crea item (barra) dentro de esa fila
    const itemId = `item-${idx + 1}`
    items[itemId] = {
      id: itemId,
      label: `${r.tipo} (${r.cantidad})`,
      time: {
        start: r.x,
        end: r.x2,
      },
      rowId,
      // puedes guardar más datos para tooltips o templates
      data: {
        tipo: r.tipo,
        cantidad: r.cantidad,
        avance: r.avance,
      },
    }
  })

  // convierte objetos a mapas de GSTC
  const rowsMap = GSTC.api.fromArray(Object.values(rows))
  const itemsMap = GSTC.api.fromArray(Object.values(items))

  return { rowsMap, itemsMap }
}
const { rowsMap, itemsMap } = buildRowsAndItems(rowsInput)

// rango de tiempo visible
const timelineStart = Math.min(...rowsInput.map(r => r.x))
const timelineEnd   = Math.max(...rowsInput.map(r => r.x2))

// ==== columnas de la tabla (en español) ====
// Tomamos datos desde row.data
const columns = {
  data: GSTC.api.fromArray([
    {
      id: 'col-tarea',
      width: 260,
      header: { content: 'Tarea' }, // título en español
      // usamos el label de la fila (la "partida")
      data: ({ row }) => row.label || '',
    },
    {
      id: 'col-familia',
      width: 200,
      header: { content: 'Familia' },
      data: ({ row }) => row?.data?.familia ?? '',
    },
    {
      id: 'col-partida',
      width: 260,
      header: { content: 'Partida' },
      data: ({ row }) => row?.data?.partida ?? '',
    },
    {
      id: 'col-cuadrilla',
      width: 110,
      header: { content: 'Cuadrilla' },
      data: ({ row }) => row?.data?.cuadrilla ?? '',
    },
    {
      id: 'col-inicio',
      width: 110,
      header: { content: 'Inicio' },
      data: ({ row }) => toDMY(row?.data?.startTs ?? ''),
    },
    {
      id: 'col-final',
      width: 110,
      header: { content: 'Final' },
      data: ({ row }) => toDMY(row?.data?.endTs ?? ''),
    },
    {
      id: 'col-duracion',
      width: 95,
      header: { content: 'Duración' },
      data: ({ row }) => {
        const d = row?.data?.duracion ?? 0
        return `${d} d`
      },
    },
    {
      id: 'col-avance',
      width: 90,
      header: { content: 'Avance' },
      data: ({ row }) => {
        const a = row?.data?.avance ?? 0
        return `${a}%`
      },
    },
  ]),
}

// ==== configuración GSTC ====
const config = {
  licenseKey: 'YOUR_KEY_HERE', // si usas la versión comercial; si no, omite
  list: {
    rows: rowsMap,
    columns,
    // tamaño de filas
    row: { height: 38 },
  },
  chart: {
    items: itemsMap,
    time: {
      // niveles del header en español con formatos
      levels: [
        // Mes
        {
          unit: 'month',
          format: { month: 'short', year: 'numeric' }, // ej: oct 2025
          main: true,
        },
        // Día
        {
          unit: 'day',
          format: { day: '2-digit' }, // 18, 19, 20...
        },
      ],
      from: timelineStart,
      to: timelineEnd + 24 * 3600 * 1000, // incluye el último día completo
      zoom: 18, // ajusta zoom si quieres
    },
    // altura de cada barra
    item: {
      height: 16,
    },
  },
  // desactiva columnas por defecto y deja las tuyas
  // (en GSTC moderno, basta con definir columns.data)
}

// ==== montar / destruir ====
const el = ref(null)
let gstc, state

onMounted(() => {
  state = GSTC.api.stateFromConfig(config)
  gstc = GSTC({
    element: el.value,
    state,
  })
})

onBeforeUnmount(() => {
  if (gstc) gstc.destroy()
  if (state) state.destroy()
})
</script>

<style scoped>
.gstc-wrap {
  width: 100%;
  height: 480px;      /* ajusta a gusto */
  min-height: 360px;
}
.gstc-container {
  width: 100%;
  height: 100%;
}
</style>
