<template>
  <div>
    <!-- DIALOG PRINCIPAL DE FIRMA -->
    <v-dialog
      v-model="dialog"
      width="1200"
    >
      <v-card>
        <v-card-title class="text-h6">
          Confirmar
        </v-card-title>

        <v-card-text>
          <v-row>
            <!-- Columna izquierda: inputs -->
            <v-col
              cols="12"
              md="4"
            >
              <!-- Observaciones -->
              <v-textarea
                v-model="observaciones"
                label="Observaciones"
                variant="outlined"
                density="compact"
                rows="2"
                class="mb-4"
              />

              <!-- Aprueba/Rechaza -->
              <v-radio-group
                v-model="decision"
                label="¿Aprueba o Rechaza?"
                class="mb-4"
              >
                <v-radio
                  label="Aprueba"
                  value="APRUEBA"
                />
                <v-radio
                  label="Rechaza"
                  value="RECHAZA"
                />
              </v-radio-group>

              <!-- Motivo de rechazo -->
              <v-select
                v-if="decision === 'RECHAZA'"
                v-model="motivoRechazo"
                :items="motivosRechazoComputed"
                item-title="motivo_rechazo"
                item-value="id_motivo_rechazo"
                label="Motivo de Rechazo"
                variant="outlined"
                density="compact"
                class="mb-4"
              />

              <div>Contraseña FES</div>
              <div>
                <v-otp-input
                  v-model="passFes"
                  length="4"
                  type="password"
                  inputmode="numeric"
                  class="fes-otp-mask"
                />
                <a
                  href="#"
                  class="mt-1"
                  @click.prevent="abrirDialogFES"
                >
                  ¿Olvidaste tu FES?
                </a>
              </div>

              <br>

              <div
                v-if="detallesFlujo.length"
                class="mb-4"
              >
                <div class="text-subtitle-2 mb-1">
                  Estructura de firmas
                </div>
                <v-table
                  density="compact"
                  class="text-caption"
                >
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Rol</th>
                      <th>Firmante</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="st in detallesFlujo"
                      :key="`dlg-stp-${st.id_flow_stp}`"
                    >
                      <td>{{ st.flow_tmpl_step_orden ?? '—' }}</td>
                      <td>{{ st.name_rol ?? '—' }}</td>
                      <td>{{ st.nombre_user || 'Sin asignar' }}</td>
                      <td>{{ estadoPasoLabel(st.estado) }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </div>

              <div class="text-center">
                <v-btn
                  text
                  @click="cerrar"
                >
                  Cancelar
                </v-btn>

                <v-btn
                  style="margin-left: 8px;"
                  :color="colorBotonFirmar"
                  :disabled="loadingFirma"
                  @click="crearFirmaSurvey"
                >
                  {{ textoBotonFirmar }}
                </v-btn>
              </div>
            </v-col>

            <!-- Columna derecha: visor PDF -->
            <v-col
              cols="12"
              md="8"
            >
              <div
                class="mb-4"
                style="position: relative; height: 700px; display: flex; align-items: center; justify-content: center; background: #f1f5f9; border-radius: 8px; overflow: hidden;"
              >
                <v-progress-circular
                  v-if="loadingPdf"
                  indeterminate
                  color="primary"
                  size="50"
                />
                <iframe
                  v-else-if="iframeUrl"
                  :src="iframeUrl"
                  style="width: 100%; height: 100%; border: none;"
                />
                <div
                  v-else
                  class="text-grey-darken-1 text-center pa-4"
                >
                  <v-icon
                    size="48"
                    color="grey-lighten-1"
                    class="mb-2"
                  >
                    mdi-file-alert
                  </v-icon>
                  <div>No se pudo cargar la vista previa del documento.</div>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- DIALOG LOADING FIRMA -->
    <v-dialog
      v-model="loadingFirma"
      persistent
      width="300"
    >
      <v-card
        color="primary"
        dark
      >
        <v-card-text class="text-center">
          <v-progress-circular
            indeterminate
            color="white"
            class="mb-4"
          />
          <div>Procesando firma...</div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- DIALOG CAMBIAR FES -->
    <DialogCambiarFES
      v-model="dialogCambiarFes"
      @fes-cambiada="onFesCambiada"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import apiAxios from '@/services/api'
import { useUserDetailStore } from '@/stores/userDetail'
import DialogCambiarFES from '@/components/DialogCambiarFES.vue'

/**
 * Props:
 *  - modelValue: Boolean → v-model para abrir/cerrar dialog
 *  - pdfUrl: String → URL del PDF a mostrar
 *  - detalleFlujo: Object → flujo + detalles (lo que hoy guardas en detalleCrearFirma)
 *  - roles: Array → listado de roles (para nombre de rol)
 *  - motivosRechazo: Array → catálogo de motivos
 */
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  pdfUrl: {
    type: String,
    default: ''
  },
  detalleFlujo: {
    type: Object,
    default: () => null
  },
  roles: {
    type: Array,
    default: () => []
  },
  motivosRechazo: {
    type: Array,
    default: () => []
  },
  isReport: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'firmado', 'firmadoDirecto'])

const userDetailStore = useUserDetailStore()

// v-model wrapper
const dialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// Estado interno del formulario
const observaciones = ref('')
const decision = ref('APRUEBA')
const motivoRechazo = ref(null)
const passFes = ref('')

const loadingFirma = ref(false)
const dialogCambiarFes = ref(false)

const iframeUrl = ref('')
const loadingPdf = ref(false)

watch(() => props.pdfUrl, async (newUrl) => {
  if (iframeUrl.value) {
    URL.revokeObjectURL(iframeUrl.value)
    iframeUrl.value = ''
  }
  if (!newUrl) return

  try {
    loadingPdf.value = true
    const response = await apiAxios.get(newUrl, { responseType: 'blob' })
    const blob = new Blob([response.data], { type: 'application/pdf' })
    iframeUrl.value = URL.createObjectURL(blob)
  } catch (error) {
    console.error('❌ Error al cargar PDF en visor:', error)
    // Fallback to original URL
    iframeUrl.value = newUrl
  } finally {
    loadingPdf.value = false
  }
}, { immediate: true })

watch(dialog, (isOpen) => {
  if (!isOpen && iframeUrl.value) {
    URL.revokeObjectURL(iframeUrl.value)
    iframeUrl.value = ''
  }
})

const rolesComputed = computed(() => props.roles || [])
const motivosRechazoComputed = computed(() => props.motivosRechazo || [])
const detalle = computed(() => props.detalleFlujo)
const currentUserId = computed(() => Number(userDetailStore.userDetail?.id_user))
const detallesFlujo = computed(() =>
  Array.isArray(detalle.value?.detalles_flujo)
    ? detalle.value.detalles_flujo
    : (Array.isArray(detalle.value?.detalles) ? detalle.value.detalles : [])
)

const pasoActual = computed(() => {
  const detalles = detallesFlujo.value
  if (!detalles.length) return null

  const pasoUsuario = detalles.find(det => {
    if (det?.flag_equipo) return false
    const stepUserId = Number(det?.id_user)
    return Number.isFinite(stepUserId) && stepUserId === currentUserId.value
  })
  if (pasoUsuario) return pasoUsuario

  const pasoEquipo = detalles.find(det => det?.flag_equipo === true)
  if (pasoEquipo) return pasoEquipo

  return detalles[0]
})

const esUltimoPaso = computed(() => {
  if (!pasoActual.value || !detallesFlujo.value.length) return false

  const ordenPasoActual = Number(pasoActual.value.flow_tmpl_step_orden)
  if (!Number.isFinite(ordenPasoActual)) return false

  const ordenMaximo = Math.max(
    ...detallesFlujo.value.map(det => Number(det?.flow_tmpl_step_orden || 0))
  )

  return ordenPasoActual === ordenMaximo
})

const esPasoDelUsuarioLogeado = computed(() => {
  if (!pasoActual.value) return false
  const stepUserId = Number(pasoActual.value?.id_user)
  return Number.isFinite(stepUserId) && stepUserId === currentUserId.value
})

const esUltimoFirmanteUsuario = computed(() =>
  esUltimoPaso.value && esPasoDelUsuarioLogeado.value
)

const colorBotonFirmar = computed(() => {
  if (props.isReport) return 'success'
  return esUltimoPaso.value ? 'deep-purple-accent-4' : 'primary'
})

const textoBotonFirmar = computed(() => {
  if (props.isReport) return 'Firmar y Finalizar'
  return esUltimoFirmanteUsuario.value ? 'Firmar (Último)' : 'Firmar'
})

/**
 * Cada vez que se abre el diálogo, reseteamos el formulario
 */
watch(dialog, (val) => {
  if (val) {
    observaciones.value = ''
    decision.value = 'APRUEBA'
    motivoRechazo.value = null
    passFes.value = ''
  }
})

const abrirDialogFES = () => {
  dialogCambiarFes.value = true
}

const onFesCambiada = () => {
  console.log('✅ FES actualizada (desde FirmaDialog)')
}

// Cerrar dialog
const cerrar = () => {
  dialog.value = false
}

function estadoPasoLabel (estado) {
  const e = String(estado || '').toUpperCase()
  if (!e) return 'PENDIENTE'
  return e
}

/**
 * Hash SHA256 para la pass_fes
 */
async function hashSHA256 (texto) {
  const encoder = new TextEncoder()
  const data = encoder.encode(texto)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

/**
 * Lógica de firma (UpdApprovalExec + /signature/)
 * Igual a la que tenías en gestionDocumentos.vue, pero encapsulada
 */
const crearFirmaSurvey = async () => {
  if (props.isReport) {
    const hash = await hashSHA256(passFes.value || '')
    if (!hash || !hash.trim()) {
      alert('Debes ingresar tu clave FES.')
      return
    }
    loadingFirma.value = true
    try {
      await apiAxios.post('/usuarios/verifyFes', {
        id_user: userDetailStore.userDetail.id_user,
        pass_fes: hash
      })
      dialog.value = false
      emit('firmadoDirecto', { 
        passFesHash: hash, 
        observaciones: observaciones.value,
        decision: decision.value,
        motivoRechazo: motivoRechazo.value 
      })
    } catch (error) {
      console.error('❌ Error al verificar FES:', error)
      alert(error?.response?.data?.error || 'Clave FES incorrecta')
    } finally {
      loadingFirma.value = false
    }
    return
  }

  if (!detalle.value || !detallesFlujo.value.length) {
    alert('No hay detalle de flujo para firmar.')
    console.error('❌ detalleFlujo vacío en FirmaDialog')
    return
  }

  const hash = await hashSHA256(passFes.value || '')

  if (!decision.value) {
    alert('Debes seleccionar Aprueba o Rechaza.')
    console.error('❌ Debes seleccionar Aprueba o Rechaza.')
    return
  }

  if (decision.value === 'RECHAZA' && !motivoRechazo.value) {
    alert('Debes seleccionar un motivo de rechazo.')
    console.error('❌ Debes seleccionar un motivo de rechazo.')
    return
  }

  if (!hash || !hash.trim()) {
    alert('Debes ingresar tu clave FES.')
    console.error('❌ Debes ingresar tu clave FES.')
    return
  }

  const detallePaso = pasoActual.value || detalle.value?.detalles?.[0] || detallesFlujo.value[0]

  const filenameQr = uuidv4() + '.pdf'

  const rolNombre =
    rolesComputed.value.find(r => r.id_rol === detallePaso.id_rol)?.name_rol || null

  // 1) Actualizar Approval Exec
  const dataApproval = {
    id_survey: detalle.value.id_survey,
    nuevaFirma: {
      firma: {
        nombre: `${userDetailStore.userDetail.name_frst} ${userDetailStore.userDetail.name_sec} ${userDetailStore.userDetail.apellido_pat} ${userDetailStore.userDetail.apellido_mat}`,
        rut: userDetailStore.userDetail.rut,
        rol: rolNombre,
        fecha: null,
        metodo_autenticacion: 'OPT',
        aprueba_rechaza: decision.value,
        observaciones: observaciones.value || 'Sin observaciones',
        id_user: userDetailStore.userDetail.id_user,
        ip_firma: 'DESCONOCIDA',
        user_agent: 'DESCONOCIDO',
        geo_latitude: -33.456,
        geo_longitude: -70.648,
        qrUrl: filenameQr
      }
    }
  }

  console.log('✅ Datos para actualizar Approval Exec (FirmaDialog):', dataApproval)

  loadingFirma.value = true

  try {
    await apiAxios.post('/signature/UpdApprovalExec', dataApproval)
    console.log('✅ Approval Exec Actualizado (FirmaDialog)')
  } catch (error) {
    console.error('❌ Error al actualizar Approval Exec:', error)
    alert(error?.response?.data?.error || 'Error al actualizar Approval Exec')
    loadingFirma.value = false
    return
  }

  // 2) Crear firma en /signature/
  const hashPdfGenerado = 'SHA256_1234567890ABCDEF'
  const codigoValidacion = uuidv4()

  const textoMotivoRechazo = motivoRechazo.value
    ? motivosRechazoComputed.value.find(m => m.id_motivo_rechazo === motivoRechazo.value)?.motivo_rechazo || null
    : null

  const data = {
    origenPath: '/u05/LeanDocs/terracon/' + (detallePaso.name_doc_interno_in || ''),
    destinoFolder: '/u05/LeanDocs/terracon/',
    id_flow_stp: detallePaso.id_flow_stp,
    id_flow: detalle.value.id_flow,
    id_user: userDetailStore.userDetail.id_user,
    id_doc: detallePaso.id_doc_in,
    hash_pdf: hashPdfGenerado,
    codigo_validacion: codigoValidacion,
    observaciones: observaciones.value,
    aprueba_rechaza: decision.value,
    id_motivo_rechazo: motivoRechazo.value,
    text_motivo_rechazo: textoMotivoRechazo,
    geo_latitude: -33.456,
    geo_longitude: -70.648,
    metodo_autenticacion: 'OTP',
    rol: detallePaso.id_rol || null,
    rol_nombre: rolNombre,
    rut: userDetailStore.userDetail.rut,
    nombre: `${userDetailStore.userDetail.name_frst} ${userDetailStore.userDetail.name_sec} ${userDetailStore.userDetail.apellido_pat} ${userDetailStore.userDetail.apellido_mat}`,
    id_survey: detalle.value.id_survey,
    pass_fes: hash,
    filenameQr: filenameQr
  }

  console.log('✅ Datos para crear firma (FirmaDialog):', data)

  try {
    const resp = await apiAxios.post('/signature/', data)
    console.log('✅ Firma creada (FirmaDialog):', resp.data)
    dialog.value = false
    emit('firmado') // <- el padre decide qué hacer: filtrar(), recargar, etc.
  } catch (error) {
    console.error('❌ Error al crear la firma:', error)
    alert(error?.response?.data?.error || 'Error al crear la firma')
  } finally {
    loadingFirma.value = false
  }
}
</script>

<style scoped>
.fes-otp-mask :deep(input) {
  -webkit-text-security: disc;
  text-security: disc;
}
</style>
