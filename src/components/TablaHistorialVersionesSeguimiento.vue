<template>
  <v-card variant="flat">
    <v-table
      dense
      class="card text-caption compact-table"
      height="220px"
      fixed-header
      density="compact"
    >
      <thead>
        <tr>
          <th class="text-left">
            Proyecto
          </th>
          <th class="text-left">
            Versión
          </th>
          <th class="text-left">
            Estado
          </th>
          <th class="text-left">
            Observación
          </th>
          <th class="text-left">
            Ref a documento adjunto
          </th>
          <th class="text-left">
            Fecha ini plan
          </th>
          <th class="text-left">
            Fecha fin plan
          </th>
          <th class="text-left">
            Fecha ini real
          </th>
          <th class="text-left">
            Fecha fin real
          </th>
          <th class="text-left">
            Avance plan
          </th>
          <th class="text-left">
            Avance real
          </th>
          <th class="text-left">
            Usuario Creación
          </th>
          <th class="text-left">
            Fecha creación
          </th>
          <th class="text-left">
            Usuario Modificación
          </th>
          <th class="text-left">
            Fecha modificación
          </th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="row in rows"
          :key="row.id"
        >
          <td>{{ row.id_proyecto }}</td>
          <td>{{ row.version }}</td>
          <td>{{ row.estado }}</td>
          <td>{{ row.observacion }}</td>
          <td>{{ row.id_doc }}</td>
          <td>{{ formatDate(row.fecha_ini_plan) }}</td>
          <td>{{ formatDate(row.fecha_fin_plan) }}</td>
          <td>{{ formatDate(row.fecha_ini_real) }}</td>
          <td>{{ formatDate(row.fecha_fin_real) }}</td>
          <td>{{ formatPct(row.avance_plan) }}</td>
          <td>{{ formatPct(row.avance_real) }}</td>
          <td>{{ row.id_usuario_creacion }}</td>
          <td>{{ formatDate(row.fecha_creacion) }}</td>
          <td>{{ row.id_usuario_modificacion }}</td>
          <td>{{ formatDate(row.fecha_modificacion) }}</td>
        </tr>
      </tbody>
    </v-table>
  </v-card>
</template>

<script setup>
/**
 * Props existentes
 */
const props = defineProps({
  fechaDesde: { type: String, default: "" },
  fechaHasta: { type: String, default: "" },
  filtro: { type: [String, Number, Object, Array], default: null },
  secatrib: { type: [String, Number, Object, Array], default: null },
  teratrib: { type: [String, Number, Object, Array], default: null },
  titulo: { type: String, default: "Historial de Versiones" },
})

/**
 * Datos de ejemplo (5 filas)
 */
const rows = [
  {
    id: 1,
    id_proyecto: "PRY-001",
    version: 1,
    estado: "Borrador",
    observacion: "Creación del seguimiento",
    id_doc: "DOC-1001",
    fecha_ini_plan: "2025-09-10",
    fecha_fin_plan: "2025-10-10",
    fecha_ini_real: "2025-09-12",
    fecha_fin_real: "",
    avance_plan: 10,
    avance_real: 5,
    id_usuario_creacion: "Sistema",
    fecha_creacion: "2025-09-12",
    id_usuario_modificacion: "Sistema",
    fecha_modificacion: "2025-09-12",
  },
  {
    id: 2,
    id_proyecto: "PRY-001",
    version: 2,
    estado: "En Ejecución",
    observacion: "Ajuste de hitos",
    id_doc: "DOC-1002",
    fecha_ini_plan: "2025-09-10",
    fecha_fin_plan: "2025-10-20",
    fecha_ini_real: "2025-09-12",
    fecha_fin_real: "",
    avance_plan: 25,
    avance_real: 18,
    id_usuario_creacion: "Mauricio",
    fecha_creacion: "2025-09-15",
    id_usuario_modificacion: "Mauricio",
    fecha_modificacion: "2025-09-15",
  },
  {
    id: 3,
    id_proyecto: "PRY-001",
    version: 3,
    estado: "En Ejecución",
    observacion: "Se agregan adjuntos",
    id_doc: "DOC-1003",
    fecha_ini_plan: "2025-09-10",
    fecha_fin_plan: "2025-10-25",
    fecha_ini_real: "2025-09-12",
    fecha_fin_real: "",
    avance_plan: 40,
    avance_real: 32,
    id_usuario_creacion: "Caty",
    fecha_creacion: "2025-09-20",
    id_usuario_modificacion: "Caty",
    fecha_modificacion: "2025-09-20",
  },
  {
    id: 4,
    id_proyecto: "PRY-001",
    version: 4,
    estado: "Verificación",
    observacion: "Comentarios QA",
    id_doc: "DOC-1004",
    fecha_ini_plan: "2025-09-10",
    fecha_fin_plan: "2025-10-28",
    fecha_ini_real: "2025-09-12",
    fecha_fin_real: "",
    avance_plan: 65,
    avance_real: 58,
    id_usuario_creacion: "Sofía",
    fecha_creacion: "2025-10-01",
    id_usuario_modificacion: "Sofía",
    fecha_modificacion: "2025-10-01",
  },
  {
    id: 5,
    id_proyecto: "PRY-001",
    version: 5,
    estado: "Cerrado",
    observacion: "Cierre provisional",
    id_doc: "DOC-1005",
    fecha_ini_plan: "2025-09-10",
    fecha_fin_plan: "2025-10-30",
    fecha_ini_real: "2025-09-12",
    fecha_fin_real: "2025-10-29",
    avance_plan: 100,
    avance_real: 100,
    id_usuario_creacion: "Sistema",
    fecha_creacion: "2025-10-15",
    id_usuario_modificacion: "Sistema",
    fecha_modificacion: "2025-10-29",
  },
]

/** Formateadores */
const formatDate = (iso) => {
  if (!iso) return ""
  const d = new Date(iso)
  return Number.isNaN(d) ? iso : d.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" })
}
const formatPct = (n) => (n ?? n === 0 ? `${Number(n).toFixed(0)}%` : "")
</script>

<style scoped>
/* Compacto y legible */
th, td {
  white-space: nowrap;
  font-size: 0.7rem;
  padding: 2px 4px;
}

.card {
  margin: 5px;
  padding: 5px;
  color: #757575;
  border-radius: 5px;
  box-shadow:
    0 2px 2px 0 rgba(0,0,0,0.14),
    0 1px 5px 0 rgba(0,0,0,0.12),
    0 3px 1px -2px rgba(0,0,0,0.2);
}

/* header fijo */
.fixed-header thead th {
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
}
</style>
