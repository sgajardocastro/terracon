<template>
  <v-card
    class="mt-4"
    outlined
  >
    <v-card-title class="text-subtitle-1">
      📥 Enrolamiento masivo desde Excel (roles por nombre)
    </v-card-title>

    <v-card-text>
      <v-file-input
        v-model="archivo"
        label="Seleccionar archivo Excel"
        accept=".xlsx,.xls"
        prepend-icon="mdi-file-excel"
        density="compact"
        variant="outlined"
        clearable
      />

      <!-- Resumen resultado -->
      <v-alert
        v-if="resumen.mostrable"
        :type="resumen.tipo"
        variant="tonal"
        density="compact"
        class="mt-3"
      >
        <div class="d-flex flex-column ga-1">
          <div>
            <strong>Resultado:</strong>
            OK: <strong>{{ resumen.ok }}</strong> ·
            Error: <strong>{{ resumen.err }}</strong> ·
            Omitidos: <strong>{{ resumen.skip }}</strong>
          </div>

          <div
            v-if="resumen.err && resumen.detalles.length"
            class="mt-2"
          >
            <strong>Fallidos:</strong>
            <ul class="pl-4 mb-0">
              <li
                v-for="(d, i) in resumen.detalles"
                :key="i"
              >
                {{ d.rut || '—' }} / {{ d.correo || '—' }} — {{ d.motivo }}
              </li>
            </ul>
          </div>
        </div>
      </v-alert>

      <!-- Warning general (parseo/excel) -->
      <v-alert
        v-if="warning"
        type="warning"
        variant="tonal"
        density="compact"
        class="mt-3"
      >
        {{ warning }}
      </v-alert>

      <v-table
        v-if="filas.length"
        class="mt-4 text-caption"
        density="compact"
        fixed-header
        height="420"
      >
        <thead>
          <tr>
            <th>Rut</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Roles (editables)</th>
            <th>Roles no encontrados</th>
            <th>Estado</th>
            <th>Detalle</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(row, i) in filas"
            :key="i"
          >
            <td style="white-space: nowrap;">
              {{ row.rut }}
            </td>
            <td>{{ row.nombre }}</td>
            <td>{{ row.correo }}</td>

            <td style="min-width: 320px">
              <v-select
                v-model="row.rolesIds"
                :items="roles"
                item-title="name_rol"
                item-value="id_rol"
                multiple
                chips
                density="compact"
                variant="outlined"
                hide-details
                clearable
              />
            </td>

            <td style="min-width: 220px">
              <div
                v-if="row.rolesInvalidos?.length"
                class="d-flex flex-wrap ga-1"
              >
                <v-chip
                  v-for="r in row.rolesInvalidos"
                  :key="r"
                  size="x-small"
                  color="red-darken-2"
                  variant="tonal"
                >
                  {{ r }}
                </v-chip>
              </div>
              <span
                v-else
                class="text-disabled"
              >—</span>
            </td>

            <td style="min-width: 120px">
              <v-chip
                v-if="row._estado"
                size="small"
                :color="row._estado === 'OK' ? 'green-darken-2' : (row._estado === 'ERROR' ? 'red-darken-2' : 'grey-darken-1')"
                variant="tonal"
              >
                {{ row._estado }}
              </v-chip>
              <span
                v-else
                class="text-disabled"
              >—</span>
            </td>

            <td style="min-width: 260px">
              <span
                v-if="row._error"
                class="text-red-darken-2"
              >
                {{ row._error }}
              </span>
              <span
                v-else
                class="text-disabled"
              >—</span>
            </td>
          </tr>
        </tbody>
      </v-table>

      <div
        v-if="filas.length"
        class="mt-3 text-caption text-disabled"
      >
        Formato Excel esperado:
        <strong>rut</strong>, <strong>nombre</strong>, <strong>correo</strong>, <strong>roles</strong>
        (roles separados por coma: <em>SUP, PLAN, ITO</em>)
      </div>
    </v-card-text>

    <v-card-actions class="justify-end">
      <v-btn
        color="primary"
        :disabled="!filas.length || loading"
        :loading="loading"
        @click="enviarMasivo"
      >
        Enviar Enrolamiento (Excel)
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import * as XLSX from 'xlsx'
import apiAxios from '@/services/api'

const props = defineProps({
  roles: { type: Array, required: true }, // [{id_rol, name_rol}, ...]
})

const emit = defineEmits(['finalizado'])

const archivo = ref(null)
const filas = ref([])
const loading = ref(false)
const warning = ref('')

// Resultado masivo
const bulkResult = ref({
  ok: 0,
  err: 0,
  skip: 0,
  detalles: [], // {rut, correo, motivo}
  listo: false,
})

const resumen = computed(() => ({
  mostrable: bulkResult.value.listo,
  tipo: bulkResult.value.err ? 'error' : (bulkResult.value.skip ? 'warning' : 'success'),
  ok: bulkResult.value.ok,
  err: bulkResult.value.err,
  skip: bulkResult.value.skip,
  detalles: bulkResult.value.detalles,
}))

watch(archivo, (val) => {
  if (!val) {
    filas.value = []
    warning.value = ''
    resetBulk()
    return
  }
  leerExcel(val)
})

function resetBulk() {
  bulkResult.value = { ok: 0, err: 0, skip: 0, detalles: [], listo: false }
}

function leerExcel(input) {
  warning.value = ''
  filas.value = []
  resetBulk()

  const file = Array.isArray(input) ? input[0] : input

  if (!(file instanceof Blob)) {
    console.error('No es Blob/File:', file)
    warning.value = 'No pude leer el archivo. Vuelve a seleccionarlo (debe ser .xlsx/.xls).'
    return
  }

  const reader = new FileReader()

  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const json = XLSX.utils.sheet_to_json(sheet, { defval: '' })

      if (!json.length) {
        warning.value = 'El Excel viene vacío o no tiene encabezados.'
        return
      }

      filas.value = json
        .map((raw) => {
          const rut = pick(raw, ['rut', 'Rut', 'RUT'])
          const nombre = pick(raw, ['nombre', 'Nombre', 'NOMBRE'])
          const correo = pick(raw, ['correo', 'Correo', 'CORREO', 'email', 'Email', 'EMAIL'])
          const rolesRaw = pick(raw, ['roles', 'Roles', 'ROLES'])

          const { rolesIds, rolesInvalidos } = mapearRolesPorNombre(rolesRaw)

          return {
            rut: normalizarRut(rut),
            nombre: String(nombre ?? '').trim(),
            correo: String(correo ?? '').trim(),
            rolesIds,
            rolesInvalidos,

            // estado de proceso
            _estado: null, // OK | ERROR | OMITIDO
            _error: '',
          }
        })
        .filter(r => r.rut || r.nombre || r.correo || (r.rolesIds?.length))

      if (!filas.value.length) {
        warning.value = 'No encontré filas válidas. Revisa que haya datos bajo los encabezados.'
      }
    } catch (err) {
      console.error('Error parseando Excel', err)
      warning.value = 'No pude interpretar el Excel. Revisa que sea un .xlsx válido.'
    }
  }

  reader.onerror = (err) => {
    console.error('FileReader error', err)
    warning.value = 'Error leyendo el archivo. Intenta nuevamente.'
  }

  reader.readAsArrayBuffer(file)
}

function pick(obj, keys) {
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) return obj[k]
  }
  return ''
}

function normalizarRut(val) {
  if (!val) return ''
  const v = String(val).replace(/[^0-9Kk]/g, '').toUpperCase()
  if (v.length < 2) return v
  return `${v.slice(0, -1)}-${v.slice(-1)}`
}

function mapearRolesPorNombre(rolesRaw) {
  if (!rolesRaw) return { rolesIds: [], rolesInvalidos: [] }

  const tokens = String(rolesRaw)
    .split(',')
    .map(x => x.trim())
    .filter(Boolean)

  const rolesMap = new Map(
    (props.roles || []).map(r => [
      String(r.name_rol || '').trim().toUpperCase(),
      Number(r.id_rol),
    ])
  )

  const rolesIds = []
  const rolesInvalidos = []

  for (const t of tokens) {
    const key = t.toUpperCase()
    const id = rolesMap.get(key)
    if (id) rolesIds.push(id)
    else rolesInvalidos.push(t)
  }

  return { rolesIds: Array.from(new Set(rolesIds)), rolesInvalidos }
}

/** Traduce errores típicos del back/postgres a mensajes amigables */
function humanizeEnrollError(e) {
  const raw =
    e?.response?.data?.message ||
    e?.response?.data?.error ||
    e?.message ||
    ''

  const s = String(raw).toLowerCase()

  if (s.includes('tsec_users_email_key') || s.includes('email_key')) {
    return 'Correo ya está ocupado'
  }
  if (s.includes('tsec_users_rut_key') || s.includes('rut_key')) {
    return 'RUT ya está enrolado'
  }
  if (s.includes('llave duplicada') || s.includes('restricción de unicidad') || s.includes('duplicate key')) {
    return 'Dato duplicado (usuario ya existe)'
  }

  // fallback
  return String(raw || 'Error desconocido')
}

// -------- envío masivo --------
async function enviarMasivo() {
  loading.value = true
  warning.value = ''
  resetBulk()

  try {
    for (const row of filas.value) {
      row._estado = null
      row._error = ''

      // Saltar filas totalmente vacías
      if (!row.rut && !row.correo) {
        row._estado = 'OMITIDO'
        row._error = 'Fila sin RUT ni correo'
        bulkResult.value.skip++
        continue
      }

      // Validaciones mínimas
      if (!row.correo) {
        row._estado = 'OMITIDO'
        row._error = 'Falta correo'
        bulkResult.value.skip++
        continue
      }
      if (!Array.isArray(row.rolesIds) || !row.rolesIds.length) {
        row._estado = 'OMITIDO'
        row._error = 'Sin roles asignados'
        bulkResult.value.skip++
        continue
      }

      try {
        await apiAxios.post('/usuarios/inicioEnrolamiento/', {
          rut: row.rut,
          nombre: row.nombre,
          correo: row.correo,
          roles: row.rolesIds,
        })

        row._estado = 'OK'
        bulkResult.value.ok++
      } catch (e) {
        const msg = humanizeEnrollError(e)
        row._estado = 'ERROR'
        row._error = msg
        bulkResult.value.err++
        bulkResult.value.detalles.push({
          rut: row.rut,
          correo: row.correo,
          motivo: msg,
        })
        // ✅ sigue con el siguiente
        continue
      }
    }

    bulkResult.value.listo = true

    // Si quieres limpiar solo cuando todo ok:
    // if (!bulkResult.value.err) { archivo.value = null; filas.value = [] }

    emit('finalizado', {
      ok: bulkResult.value.ok,
      err: bulkResult.value.err,
      skip: bulkResult.value.skip,
      detalles: bulkResult.value.detalles,
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.sombra-resaltada {
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3) !important;
  border-radius: 12px;
}
</style>
