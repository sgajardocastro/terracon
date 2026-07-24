<template>
  <div class="gantt-table-wrap">
    <v-table
      density="compact"
      class="gantt-table"
      fixed-header
    >
      <thead>
        <tr>
          <th class="col-edit">
            Editar
          </th>
          <th class="col-familia">
            Familia
          </th>
          <th class="col-partida">
            Partida
          </th>
          <th class="col-cuadrilla">
            Cuadrilla
          </th>
          <th class="col-tipo">
            Tipo
          </th>
          <th class="col-cantidad">
            Cantidad
          </th>
          <th class="col-avance">
            % Avance
          </th>

          <!-- columnas de días -->
          <th
            v-for="d in days"
            :key="d.key"
            class="col-dia"
          >
            {{ d.label }}
          </th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="(r, i) in paintedRows"
          :key="i"
          :class="[{ zebra: i % 2 === 1 }]"
        >
          <td class="col-edit">
            <v-icon
              size="16"
              color="primary"
            >
              mdi-pencil
            </v-icon>
          </td>
          <td class="col-familia">
            {{ r.familia }}
          </td>
          <td class="col-partida">
            {{ r.partida }}
          </td>
          <td class="col-cuadrilla">
            {{ r.cuadrilla }}
          </td>
          <td class="col-tipo">
            <span :class="['tipo', r.tipo === 'Planificado' ? 'plan' : 'real']">
              {{ r.tipo }}
            </span>
          </td>
          <td class="col-cantidad">
            {{ formatNumber(r.cantidad) }}
          </td>

          <td class="col-avance">
            <div class="bar-outer">
              <div
                class="bar-inner"
                :style="{
                  width: (Math.max(0, Math.min(100, Number(r.avance))) || 0) + '%',
                  background: r.tipo === 'Planificado' ? '#7ABAFF' : '#3CB371'
                }"
              />
              <span class="bar-text">
                {{ (Number(r.avance) || 0) }}%
              </span>
            </div>
          </td>

          <!-- celdas por día con “mini barra” si cae dentro del rango -->
          <td
            v-for="d in days"
            :key="d.key"
            class="col-dia"
          >
            <div class="cell">
              <div
                v-if="d.ts >= r.x && d.ts <= r.x2"
                class="day-bar"
                :style="{
                  background: r.tipo === 'Planificado' ? '#7ABAFF' : '#3CB371'
                }"
              />
              <!-- opcional: número/lote diario -->
              <div
                v-if="showNumbers"
                class="cell-val"
              >
                {{ perDay(r, d.ts) }}
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

/* === utils fecha === */
const d = (y, m, day) => Date.UTC(y, m - 1, day)
const fmt = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 2 })
const formatNumber = v => fmt.format(Number(v) || 0)

/* === datos de ejemplo (puedes reemplazar con los tuyos) === */
const rows = ref([
  { familia: 'Movimiento de tierras', partida: 'Excavaciones [MI]',         cuadrilla: 'C-01', tipo: 'Planificado', cantidad: 2.00,  avance: 25, x:d(2025,10,20), x2:d(2025,10,21) },
  { familia: 'Movimiento de tierras', partida: 'Excavaciones [MI]',         cuadrilla: 'C-01', tipo: 'Real', cantidad: 2.00,  avance: 25, x:d(2025,10,20), x2:d(2025,10,21) },
  { familia: 'Movimiento de tierras', partida: 'Instalación de Faena [ud]', cuadrilla: 'C-02', tipo: 'Planificado', cantidad: 500.0, avance:100, x:d(2025,10,18), x2:d(2025,10,22) },
  { familia: 'Movimiento de tierras', partida: 'Instalación de Faena [ud]', cuadrilla: 'C-02', tipo: 'Real',        cantidad: 400.0, avance:100, x:d(2025,10,19), x2:d(2025,10,24) },
  { familia: 'Area Mecánica',         partida: 'Tendido Cable Ánodo [m²]',  cuadrilla: 'C-03', tipo: 'Planificado', cantidad: 50.0,  avance: 80, x:d(2025,10,19), x2:d(2025,10,21) },
  { familia: 'Area Mecánica',         partida: 'Tendido Cable Ánodo [m²]',  cuadrilla: 'C-03', tipo: 'Real',        cantidad: 37.5,  avance: 80, x:d(2025,10,20), x2:d(2025,10,22) },
  { familia: 'Area Mecánica',         partida: 'Soldadura Cañerías [m³]',   cuadrilla: 'C-04', tipo: 'Planificado', cantidad: 14.0,  avance:  0, x:d(2025,10,26), x2:d(2025,10,28) },
  { familia: 'Area Mecánica',         partida: 'Soldadura Cañerías [m³]',   cuadrilla: 'C-04', tipo: 'Real',        cantidad:  8.0,  avance: 30, x:d(2025,10,21), x2:d(2025,10,21) },
  { familia: 'Area Mecánica',         partida: 'Soldadura Cañerías [ud]',   cuadrilla: 'C-05', tipo: 'Planificado', cantidad: 35.0,  avance:  0, x:d(2025,10,18), x2:d(2025,10,18) },
  { familia: 'Area Mecánica',         partida: 'Soldadura Cañerías [ud]',   cuadrilla: 'C-05', tipo: 'Real',        cantidad:  0.0,  avance:  0, x:d(2025,10,19), x2:d(2025,10,19) },
  { familia: 'Cierre y Restitución',  partida: 'Servidumbre [m²]',          cuadrilla: 'C-06', tipo: 'Planificado', cantidad:  4.0,  avance:  0, x:d(2025,10,21), x2:d(2025,10,21) },
  { familia: 'Cierre y Restitución',  partida: 'Servidumbre [m²]',          cuadrilla: 'C-06', tipo: 'Real',        cantidad:  0.0,  avance:  0, x:d(2025,10,20), x2:d(2025,10,20) },
])

/* === rango de días (cabeceras) === */
const minTs = computed(() => Math.min(...rows.value.map(r => r.x)))
const maxTs = computed(() => Math.max(...rows.value.map(r => r.x2)))
const days = computed(() => {
  const out = []
  const one = 24*3600*1000
  for (let ts = minTs.value; ts <= maxTs.value; ts += one) {
    const dd = new Date(ts).getUTCDate().toString().padStart(2,'0')
    const mm = (new Date(ts).getUTCMonth()+1).toString().padStart(2,'0')
    out.push({ ts, key: ts, label: `${dd}/${mm}` })
  }
  return out
})

/* === filas “pintables” (puedes reordenar/filtrar aquí) === */
const paintedRows = computed(() => rows.value)

/* === número por día (opcional) — aquí solo demo === */
const showNumbers = ref(false)
// Demo: reparte cantidad uniforme por día del rango
function perDay (r, ts) {
  const days = Math.max(1, Math.round((r.x2 - r.x)/(24*3600*1000)) + 1)
  const each = (Number(r.cantidad) || 0) / days
  // muestra solo si cae dentro del rango
  return ts >= r.x && ts <= r.x2 ? Math.round(each*100)/100 : ''
}
</script>

<style scoped>
.gantt-table-wrap{
  overflow:auto;
  border-radius:8px;
  border:1px solid #e0e0e0;
  background:#fff;
}

/* sticky headers + scroll horizontal bonito */
.gantt-table :deep(table){
  min-width: 1100px;
}
.gantt-table :deep(thead th){
  position: sticky;
  top: 0;
  z-index: 2;
  background: #f7f9fb;
  border-bottom: 1px solid #e0e0e0 !important;
  white-space: nowrap;
}

/* columnas izquierdas “congeladas” (opcionales):
   si las quisieras sticky en X, se puede con position: sticky; left:... */
.col-edit     { width: 42px;  text-align: center; }
.col-familia  { width: 180px; }
.col-partida  { width: 230px; }
.col-cuadrilla{ width: 80px;  text-align:center; }
.col-tipo     { width: 110px; }
.col-cantidad { width: 90px;  text-align:right; }
.col-avance   { width: 120px; }

.col-dia{
  width: 64px;
  text-align: center;
  color:#666;
  font-weight: 500;
}

/* zebra */
tbody tr.zebra { background: #f9fcff; }

/* celda día con barrita */
.cell{
  position: relative;
  height: 20px;
  line-height: 20px;
}
.day-bar{
  position: absolute;
  inset: 4px 6px;
  border-radius: 3px;
  opacity: .6;
}
.cell-val{
  position: relative;
  font-size: 11px;
}

/* etiqueta tipo */
.tipo.plan { color:#1565c0; font-weight:600; }
.tipo.real { color:#2e7d32; font-weight:600; }

/* barra % avance */
.bar-outer{
  position: relative;
  height: 10px;
  background:#e0e0e0;
  border-radius: 6px;
}
.bar-inner{
  position:absolute; inset:0 auto 0 0;
  border-radius:6px;
}
.bar-text{
  position:absolute; right:0; top:-14px;
  font-size:11px; color:#666;
}
</style>
