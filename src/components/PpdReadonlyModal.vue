<template>
  <div class="ppd-readonly-wrap">
    <!-- Header -->
    <div class="ppd-readonly-header">
      <div class="ppd-readonly-header__info">
        <v-icon
          color="teal-darken-2"
          size="20"
          class="mr-2"
        >
          mdi-calendar-check
        </v-icon>
        <span class="ppd-readonly-header__fecha">
          {{ fechaFormateada }}
        </span>
      </div>
      <div class="ppd-readonly-header__kpis">
        <v-chip
          size="small"
          color="teal"
          variant="tonal"
          class="mr-2"
        >
          <v-icon
            start
            size="14"
          >
            mdi-check-circle
          </v-icon>
          {{ tarjetas.length }} actividad{{ tarjetas.length !== 1 ? 'es' : '' }}
        </v-chip>
      </div>
    </div>

    <!-- Loading -->
    <div
      v-if="cargando"
      class="ppd-readonly-loading"
    >
      <v-progress-circular
        indeterminate
        color="teal"
        size="40"
      />
      <p class="text-body-2 text-slate-500 mt-3">
        Cargando detalle del día…
      </p>
    </div>

    <!-- Error -->
    <v-alert
      v-else-if="error"
      type="error"
      variant="tonal"
      class="ma-4"
    >
      {{ error }}
    </v-alert>

    <!-- Sin datos -->
    <div
      v-else-if="!tarjetas.length"
      class="ppd-readonly-empty"
    >
      <v-icon
        size="48"
        color="grey-lighten-2"
      >
        mdi-clipboard-text-off-outline
      </v-icon>
      <p class="text-body-2 text-slate-400 mt-2">
        Sin actividades registradas para este día.
      </p>
    </div>

    <!-- Tarjetas por actividad -->
    <div
      v-else
      class="ppd-readonly-cards"
    >
      <div
        v-for="(tarjeta, tIdx) in tarjetas"
        :key="tIdx"
        class="ppd-readonly-card"
      >
        <!-- Cabecera de la tarjeta -->
        <div class="ppd-readonly-card__header">
          <v-chip
            v-if="tarjeta.codigoEdt"
            size="x-small"
            color="indigo"
            variant="tonal"
            label
            class="mr-2 font-weight-bold"
          >
            {{ tarjeta.codigoEdt }}
          </v-chip>
          <span class="ppd-readonly-card__nombre">{{ tarjeta.nombreTarea }}</span>
          <v-chip
            size="x-small"
            :color="tarjeta.segmento === 'camaras' ? 'purple' : tarjeta.segmento === 'actividad' ? 'orange' : 'teal'"
            variant="tonal"
            class="ml-auto"
          >
            {{ tarjeta.segmentoLabel }}
          </v-chip>
        </div>

        <!-- Campos como label + chip, 1 por fila -->
        <div class="ppd-readonly-card__fields">
          <div
            v-for="(campo, cIdx) in tarjeta.campos"
            :key="cIdx"
            class="ppd-readonly-field"
          >
            <span class="ppd-readonly-field__label">{{ campo.label }}</span>
            <v-chip
              size="small"
              :color="campo.color || 'blue-grey'"
              variant="tonal"
              class="ppd-readonly-field__chip font-weight-medium"
            >
              {{ campo.valor || '—' }}
            </v-chip>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import apiAxios from '@/services/api'

const props = defineProps({
  fecha: { type: String, required: true },
  proyectoId: { type: [String, Number], default: '' },
  clienteId: { type: [String, Number], default: '' },
})

const PPD_TEMPLATE_ID = 87

const cargando = ref(false)
const error = ref('')
const tarjetas = ref([])

const fechaFormateada = computed(() => {
  if (!props.fecha) return ''
  const d = new Date(props.fecha + 'T12:00:00')
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
})

function safeJsonParse(val, fallback = null) {
  if (!val) return fallback
  if (typeof val === 'object') return val
  try { return JSON.parse(val) } catch { return fallback }
}

function toYmd(val) {
  if (!val) return ''
  const s = String(val).trim().substring(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : ''
}

function normalizarPayload(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.datos)) return data.datos
  if (Array.isArray(data?.data)) return data.data
  if (data && typeof data === 'object') return [data]
  return []
}

function inferSegmento(taskName = '') {
  const text = taskName.toLowerCase()
  if (/(camara|cámara)/.test(text)) return 'camaras'
  if (/(actividad|otros)/.test(text)) return 'actividad'
  return 'servidumbre'
}

function segmentoLabel(seg) {
  if (seg === 'camaras') return 'Cámaras'
  if (seg === 'actividad') return 'Actividad'
  return 'Servidumbre'
}

function buildCamposServidumbre(draft) {
  const pm = Array.isArray(draft?.primeraMantencion) ? draft.primeraMantencion[0] : null
  const campos = []

  if (draft?.patrullas?.length) {
    campos.push({ label: 'Patrullas', valor: Array.isArray(draft.patrullas) ? draft.patrullas.join(', ') : draft.patrullas, color: 'indigo' })
  }

  if (pm) {
    if (pm.horasTraslado !== undefined && pm.horasTraslado !== '')
      campos.push({ label: 'Horas traslado', valor: String(pm.horasTraslado), color: 'blue-grey' })
    if (pm.oleoducto)
      campos.push({ label: 'Oleoducto', valor: String(pm.oleoducto), color: 'teal' })
    if (pm.pkInicio)
      campos.push({ label: 'PK inicio', valor: String(pm.pkInicio), color: 'teal' })
    if (pm.pkFinal)
      campos.push({ label: 'PK final', valor: String(pm.pkFinal), color: 'teal' })
    if (pm.horasPlanificadas !== undefined && pm.horasPlanificadas !== '')
      campos.push({ label: 'Horas planificadas', valor: String(pm.horasPlanificadas), color: 'blue' })
    if (pm.totalHorasActividad !== undefined && pm.totalHorasActividad !== '')
      campos.push({ label: 'Horas realizadas', valor: String(pm.totalHorasActividad), color: 'green' })
    if (pm.pkAvanceDiario !== undefined && pm.pkAvanceDiario !== '')
      campos.push({ label: 'PK avance diario', valor: String(pm.pkAvanceDiario), color: 'orange' })
  }

  // Cámaras en segmento servidumbre
  const camaras = Array.isArray(draft?.camarasRealizadas)
    ? draft.camarasRealizadas
    : (draft?.camarasRealizadasCount !== undefined ? [{ count: draft.camarasRealizadasCount }] : [])
  if (camaras.length)
    campos.push({ label: 'Cámaras realizadas', valor: String(camaras.length), color: 'purple' })

  const obs = pm?.observaciones || draft?.observaciones
  if (obs)
    campos.push({ label: 'Observaciones', valor: String(obs), color: 'grey' })

  return campos
}

function buildCamposCamaras(draft) {
  const cm = Array.isArray(draft?.camaraMantencion) ? draft.camaraMantencion[0] : null
  const campos = []

  if (draft?.patrullas?.length)
    campos.push({ label: 'Patrullas', valor: Array.isArray(draft.patrullas) ? draft.patrullas.join(', ') : draft.patrullas, color: 'indigo' })

  if (cm) {
    if (cm.horasTraslado !== undefined && cm.horasTraslado !== '')
      campos.push({ label: 'Horas traslado', valor: String(cm.horasTraslado), color: 'blue-grey' })
    if (cm.oleoducto)
      campos.push({ label: 'Oleoducto', valor: String(cm.oleoducto), color: 'teal' })
    if (cm.pkInicio)
      campos.push({ label: 'PK inicio', valor: String(cm.pkInicio), color: 'teal' })
    if (cm.pkFinal)
      campos.push({ label: 'PK final', valor: String(cm.pkFinal), color: 'teal' })
    if (cm.horasPlanificadas !== undefined && cm.horasPlanificadas !== '')
      campos.push({ label: 'Horas planificadas', valor: String(cm.horasPlanificadas), color: 'blue' })
    if (cm.totalHorasActividad !== undefined && cm.totalHorasActividad !== '')
      campos.push({ label: 'Horas realizadas', valor: String(cm.totalHorasActividad), color: 'green' })
    if (cm.camarasRealizadas !== undefined && cm.camarasRealizadas !== '')
      campos.push({ label: 'Cámaras realizadas', valor: String(cm.camarasRealizadas), color: 'purple' })

    const camarasSel = Array.isArray(cm.camarasSeleccionadas) ? cm.camarasSeleccionadas : []
    if (camarasSel.length)
      campos.push({ label: 'Cámaras (detalle)', valor: camarasSel.map(c => c?.label || c?.id || String(c)).filter(Boolean).join(', '), color: 'deep-purple' })

    const obs = cm?.observaciones || draft?.observaciones
    if (obs)
      campos.push({ label: 'Observaciones', valor: String(obs), color: 'grey' })
  }

  return campos
}

function buildCamposActividad(draft) {
  const act = draft?.actividad
  const campos = []

  if (draft?.patrullas?.length)
    campos.push({ label: 'Patrullas', valor: Array.isArray(draft.patrullas) ? draft.patrullas.join(', ') : draft.patrullas, color: 'indigo' })

  if (!act) return campos

  if (act.actividad)
    campos.push({ label: 'Actividad', valor: String(act.actividad), color: 'orange' })
  if (act.pkInicio)
    campos.push({ label: 'PK inicio', valor: String(act.pkInicio), color: 'teal' })
  if (act.pkFinal)
    campos.push({ label: 'PK final', valor: String(act.pkFinal), color: 'teal' })
  if (act.horasTraslado !== undefined && act.horasTraslado !== '')
    campos.push({ label: 'Horas traslado', valor: String(act.horasTraslado), color: 'blue-grey' })
  if (act.horasPlanificadas !== undefined && act.horasPlanificadas !== '')
    campos.push({ label: 'Horas planificadas', valor: String(act.horasPlanificadas), color: 'blue' })
  if (act.totalHorasActividad !== undefined && act.totalHorasActividad !== '')
    campos.push({ label: 'Horas realizadas', valor: String(act.totalHorasActividad), color: 'green' })
  if (act.pkAvanceDiario !== undefined && act.pkAvanceDiario !== '')
    campos.push({ label: 'PK avance diario', valor: String(act.pkAvanceDiario), color: 'orange' })
  if (act.totalHitosInstalados !== undefined && act.totalHitosInstalados !== '')
    campos.push({ label: 'Hitos instalados', valor: String(act.totalHitosInstalados), color: 'amber' })
  if (act.totalHitosPintados !== undefined && act.totalHitosPintados !== '')
    campos.push({ label: 'Hitos pintados', valor: String(act.totalHitosPintados), color: 'amber' })
  if (act.totalLogotiposCambiados !== undefined && act.totalLogotiposCambiados !== '')
    campos.push({ label: 'Logotipos cambiados', valor: String(act.totalLogotiposCambiados), color: 'amber' })
  if (act.kmRecorridosInspeccion !== undefined && act.kmRecorridosInspeccion !== '')
    campos.push({ label: 'KM recorridos inspección', valor: String(act.kmRecorridosInspeccion), color: 'cyan' })
  if (act.totalCalicatasRealizadas !== undefined && act.totalCalicatasRealizadas !== '')
    campos.push({ label: 'Calicatas realizadas', valor: String(act.totalCalicatasRealizadas), color: 'brown' })
  if (act.observaciones)
    campos.push({ label: 'Observaciones', valor: String(act.observaciones), color: 'grey' })

  return campos
}

function parseSurveysTarjetas(surveys) {
  const result = []
  for (const survey of surveys) {
    const body = safeJsonParse(survey.__ppd_body_exec ?? survey.body_exec, {})
    if (!body) continue

    const tasks = Array.isArray(body?.tasks) ? body.tasks : (body?.tarea ? [body.tarea] : [])
    const ppdWeb = body?.ppd_web?.tasks || {}

    for (const task of tasks) {
      const idTarea = String(task?.id_tarea ?? task?.id ?? '')
      const nombreTarea = String(task?.nombre_tarea || task?.actividad_nombre || 'Sin nombre').trim()
      const codigoEdt = String(task?.codigo_edt || '').trim()

      // Obtener draft del ppdWeb si existe, sino desde body directo
      const draft = ppdWeb[idTarea] || body?.ppd_web || null

      const segmento = inferSegmento(nombreTarea)
      let campos = []

      if (draft) {
        if (segmento === 'camaras') {
          campos = buildCamposCamaras(draft)
        } else if (segmento === 'actividad') {
          campos = buildCamposActividad(draft)
        } else {
          campos = buildCamposServidumbre(draft)
        }
      }

      // Si no hay draft en ppd_web, intentar leer datos desde el body directamente
      if (!campos.length && body) {
        // Fallback: leer campos genéricos del body
        const keys = ['horasTraslado', 'oleoducto', 'pkInicio', 'pkFinal',
          'horasPlanificadas', 'totalHorasActividad', 'camarasRealizadas', 'observaciones']
        for (const key of keys) {
          if (body[key] !== undefined && body[key] !== '' && body[key] !== null) {
            campos.push({ label: key.replace(/([A-Z])/g, ' $1').trim(), valor: String(body[key]), color: 'blue-grey' })
          }
        }
      }

      result.push({ idTarea, nombreTarea, codigoEdt, segmento, segmentoLabel: segmentoLabel(segmento), campos })
    }
  }
  return result
}

async function cargarDetalle() {
  if (!props.fecha || !props.proyectoId) {
    tarjetas.value = []
    return
  }

  cargando.value = true
  error.value = ''
  tarjetas.value = []

  try {
    const params = {
      fecha_desde: props.fecha,
      fecha_hasta: props.fecha,
      'ts.id_proyecto': String(props.proyectoId),
      'ts.id_template': PPD_TEMPLATE_ID,
    }
    if (props.clienteId) params['ts.id_empresa_cliente'] = String(props.clienteId)

    const resp = await apiAxios.get('/servicio/leanglobal/procesosSurveyV3', { params })
    const rows = normalizarPayload(resp.data).filter(s => Number(s?.id_template) === PPD_TEMPLATE_ID)

    // Parsear body_exec de cada survey
    for (const s of rows) {
      s.__ppd_body_exec = safeJsonParse(s.body_exec, null)
    }

    // Si no tiene body_exec inline, obtener detalle
    const sinDetalle = rows.filter(s => !s.__ppd_body_exec)
    if (sinDetalle.length) {
      const results = await Promise.allSettled(
        sinDetalle.map(s => apiAxios.get(`/servicio/leanglobal/procesosSurveyDetail?id_survey=${Number(s.id_survey || 0)}`))
      )
      for (let i = 0; i < sinDetalle.length; i++) {
        const res = results[i]
        if (res.status === 'fulfilled') {
          const detailRows = normalizarPayload(res.value?.data)
          const detail = detailRows[0] || null
          if (detail) {
            sinDetalle[i].__ppd_body_exec = safeJsonParse(detail.body_exec, null)
          }
        }
      }
    }

    tarjetas.value = parseSurveysTarjetas(rows)
  } catch (e) {
    error.value = `Error al cargar el detalle: ${e?.message || String(e)}`
  } finally {
    cargando.value = false
  }
}

onMounted(() => cargarDetalle())
watch(() => [props.fecha, props.proyectoId, props.clienteId], () => cargarDetalle())
</script>

<style scoped>
.ppd-readonly-wrap {
  font-family: 'Inter', sans-serif;
  background: #f8fafc;
  min-height: 200px;
}

.ppd-readonly-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 12px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
}

.ppd-readonly-header__info {
  display: flex;
  align-items: center;
}

.ppd-readonly-header__fecha {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  text-transform: capitalize;
}

.ppd-readonly-loading,
.ppd-readonly-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  text-align: center;
}

.ppd-readonly-cards {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.ppd-readonly-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.ppd-readonly-card__header {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  background: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
  gap: 6px;
  flex-wrap: wrap;
}

.ppd-readonly-card__nombre {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
  flex: 1;
  min-width: 0;
}

.ppd-readonly-card__fields {
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ppd-readonly-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 0;
  border-bottom: 1px solid #f1f5f9;
}

.ppd-readonly-field:last-child {
  border-bottom: none;
}

.ppd-readonly-field__label {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  flex: 1;
  padding-right: 12px;
}

.ppd-readonly-field__chip {
  flex-shrink: 0;
  max-width: 60%;
  white-space: normal;
  height: auto !important;
  min-height: 24px;
  line-height: 1.3;
}
</style>
