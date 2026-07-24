<template>
  <DashboardLayout>
    <v-container fluid>
      <v-card class="mt-4 sombra-resaltada">
        <!-- Título azul, igual estilo que otras pantallas -->
        <v-card-title class="bg-blue-darken-3 text-white py-3 enrol-title">
          <v-icon
            start
            icon="mdi-shield-check-outline"
          />
          Enrolamiento de Firma Electrónica
        </v-card-title>

        <v-card-text class="pt-4">
          <!-- Rut y Correo -->
          <v-row
            class="align-center"
            dense
          >
            <v-col
              cols="12"
              sm="4"
            >
              <v-text-field
                v-model="rut"
                label="Rut"
                variant="outlined"
                density="compact"
                hide-details
                :rules="[reglas.rut]"
                placeholder="12345678-9"
                readonly
              />
            </v-col>
            <v-col
              cols="12"
              sm="4"
            >
              <v-text-field
                v-model="correo"
                label="Correo"
                variant="outlined"
                density="compact"
                hide-details
                :rules="[reglas.correo]"
                placeholder="usuario@correo.cl"
                readonly
              />
            </v-col>
            <v-col
              cols="12"
              sm="4"
              class="d-flex align-center h-100"
            >
              <v-btn
                color="primary"
                class="w-100 enrol-btn"
                @click="completarEnrolamiento"
              >
                COMPLETAR ENROLAMIENTO
              </v-btn>
            </v-col>
          </v-row>

          <!-- Formulario -->
          <v-form
            ref="form"
            v-model="formValido"
            autocomplete="off"
            class="mt-2"
          >
            <!-- Honeypot para evitar autocompletado de Chrome -->
            <input
              type="text"
              name="username"
              style="display:none"
              autocomplete="username"
            >
            <input
              type="password"
              name="password"
              style="display:none"
              autocomplete="current-password"
            >

            <!-- Primer bloque de nombres -->
            <v-row dense>
              <v-col
                cols="12"
                sm="6"
              >
                <v-text-field
                  v-model="name_frst"
                  label="* Primer Nombre"
                  variant="outlined"
                  density="compact"
                  hide-details
                  :rules="[reglas.requerido]"
                  autocomplete="off"
                  name="fake-firstname"
                />
              </v-col>
              <v-col
                cols="12"
                sm="6"
              >
                <v-text-field
                  v-model="name_sec"
                  label="Segundo Nombre"
                  variant="outlined"
                  density="compact"
                  hide-details
                  autocomplete="off"
                  name="fake-secondname"
                />
              </v-col>
            </v-row>

            <!-- Apellidos -->
            <v-row dense>
              <v-col
                cols="12"
                sm="6"
              >
                <v-text-field
                  v-model="apellido_pat"
                  label="* Apellido Paterno"
                  variant="outlined"
                  density="compact"
                  hide-details
                  :rules="[reglas.requerido]"
                  autocomplete="off"
                  name="fake-lastname1"
                />
              </v-col>
              <v-col
                cols="12"
                sm="6"
              >
                <v-text-field
                  v-model="apellido_mat"
                  label="Apellido Materno"
                  variant="outlined"
                  density="compact"
                  hide-details
                  autocomplete="off"
                  name="fake-lastname2"
                />
              </v-col>
            </v-row>

            <!-- Correo alternativo y celular -->
            <v-row dense>
              <v-col
                cols="12"
                sm="6"
              >
                <v-text-field
                  v-model="email_alternativo"
                  label="* Correo Alternativo"
                  variant="outlined"
                  density="compact"
                  hide-details
                  :rules="[reglas.correo]"
                  autocomplete="off"
                  name="fake-alt-email"
                />
              </v-col>
              <v-col
                cols="12"
                sm="6"
              >
                <v-text-field
                  v-model="movil"
                  label="* Celular"
                  variant="outlined"
                  density="compact"
                  hide-details
                  :rules="[reglas.celular]"
                  placeholder="999999999"
                  inputmode="numeric"
                  autocomplete="tel"
                  name="fake-phone"
                />
              </v-col>
            </v-row>

            <!-- Clave FES -->
            <v-row dense>
              <v-col
                cols="12"
                sm="6"
              >
                <v-text-field
                  v-model="pass_hash_fes"
                  label="* Clave FES (4 dígitos)"
                  variant="outlined"
                  density="compact"
                  type="password"
                  hide-details
                  :rules="[reglas.claveFES]"
                  autocomplete="new-password"
                  name="fake-pass-fes"
                />
              </v-col>
            </v-row>

            <!-- Descripción -->
            <v-row>
              <v-col cols="12">
                <p class="text-caption">
                  Esta clave será encriptada y almacenada de forma segura, y es independiente de tu clave de correo.
                  Será utilizada cada vez que firmes un documento, por lo que debes conservarla.
                </p>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
      </v-card>
    </v-container>

    <!-- Dialog de proceso (estado / loading / mensajes) -->
    <v-dialog
      v-model="dialogConfirmacion"
      max-width="400"
    >
      <v-card>
        <v-card-text class="py-6 text-center">
          <v-progress-circular
            v-if="cargandoDialogo"
            indeterminate
            color="primary"
            size="48"
            class="mb-4"
          />
          <div>{{ mensajeDialogo }}</div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Firma de consentimiento (reutilizando el mismo FirmaDialog de gestiónDocumentos) -->
    <FirmaDialog
      v-model="dialogFirmaConsentimiento"
      :pdf-url="pdfUrlConsentimiento"
      :detalle-flujo="detalleConsentimiento"
      @firmado="onConsentimientoFirmado"
    />
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import DashboardLayout from '../layouts/dashboard.vue'
import { useUserDetailStore } from '@/stores/userDetail'
import apiAxios from '@/services/api'
import FirmaDialog from '@/components/FirmaDialog.vue'
import { useRouter } from 'vue-router';

const router = useRouter()

const userDetailStore = useUserDetailStore()

const form = ref(null)
const formValido = ref(false)

const id_user = ref('')
const rut = ref('')
const correo = ref('')
const name_frst = ref('')
const name_sec = ref('')
const apellido_pat = ref('')
const apellido_mat = ref('')
const email_alternativo = ref('')
const movil = ref('')
const pass_hash_fes = ref('')

const cargandoDialogo = ref(false)
const mensajeDialogo = ref('Enviando datos...')
const dialogConfirmacion = ref(false)

// Firma de consentimiento
const dialogFirmaConsentimiento = ref(false)
const detalleConsentimiento = ref(null)
const pdfUrlConsentimiento = ref('')

// Catálogos necesarios para FirmaDialog
const roles = ref([])
const motivosRechazo = ref([])

// URL base para armar el PDF
const ARCHIVO_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://servidor.leanglobal.cl'

const reglas = {
  requerido: v => !!v || 'Este campo es obligatorio',
  correo: v => /.+@.+\..+/.test(v) || 'Correo inválido',
  celular: v => /^\+56\d{9}$/.test(String(v ?? '').trim()) || 'Celular inválido (ej: +56912345678)',
  rut: v => /^[0-9]{7,8}-[0-9kK]$/.test(v) || 'Formato de RUT inválido',
  claveFES: v => {
    if (!/^\d{4}$/.test(v)) return 'Debe ser de 4 dígitos'
    if (/^(.)\1+$/.test(v)) return 'No puede tener todos los dígitos iguales'
    return true
  }
}

let lockMovil = false

watch(movil, (val) => {
  if (lockMovil) return
  lockMovil = true

  let v = String(val ?? '').trim()

  // Permitir solo + y números
  v = v.replace(/[^\d+]/g, '')

  // Si el usuario escribió +, dejamos SOLO uno al inicio
  if (v.includes('+')) {
    v = '+' + v.replace(/\+/g, '').replace(/\D/g, '')
  }

  // Caso 1: usuario escribe SOLO 9 dígitos -> lo transformamos a +569XXXXXXXX
  // Ej: 912345678 => +56912345678
  if (!v.startsWith('+')) {
    const digits = v.replace(/\D/g, '').slice(0, 9)
    movil.value = digits ? `+56${digits}` : ''
    lockMovil = false
    return
  }

  // Caso 2: ya viene con +56 (o algo parecido) -> normalizamos a +56 + 9 dígitos
  // Nos quedamos con los dígitos después del + y armamos +56 + 9 dígitos.
  let digits = v.slice(1).replace(/\D/g, '')

  // Si parte con 56, lo sacamos y lo volvemos a poner (normalización)
  if (digits.startsWith('56')) digits = digits.slice(2)

  // nos quedamos con 9 dígitos nacionales
  digits = digits.slice(0, 9)

  movil.value = digits ? `+56${digits}` : '+56'

  lockMovil = false
})

onMounted(async () => {
  console.log('userDetailStore.userDetail', userDetailStore.userDetail)

  id_user.value = userDetailStore.userDetail.id_user
  rut.value = userDetailStore.userDetail.rut
  correo.value = userDetailStore.userDetail.email

  // Limpiar campos de formulario
  name_frst.value = ''
  name_sec.value = ''
  apellido_pat.value = ''
  apellido_mat.value = ''
  email_alternativo.value = ''
  movil.value = ''
  pass_hash_fes.value = ''

  // Traer catálogos para FirmaDialog
  await Promise.all([
    obtenerRoles(),
    obtenerMotivoRechazo()
  ])
})

async function hashSHA256 (texto) {
  const encoder = new TextEncoder()
  const data = encoder.encode(texto)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

const obtenerRoles = async () => {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtenerRoles')
    roles.value = data
  } catch (error) {
    console.error('❌ Error al obtener roles:', error)
  }
}

const obtenerMotivoRechazo = async () => {
  try {
    const { data } = await apiAxios.get('/servicio/leanglobal/obtnerMotivosRechazo')
    motivosRechazo.value = data
  } catch (error) {
    console.error('❌ Error al obtener Motivos de Rechazo:', error)
  }
}

/**
 * Carga el survey de consentimiento que se debe firmar en el enrolamiento
 * y prepara los datos para el FirmaDialog (detalle + pdfUrl).
 *
 * Ajusta el mapeo según la estructura real que devuelva tu API.
 */
async function cargarSurveyConsentimiento () {
  const { data } = await apiAxios.post('/survey/consentimiento-enrolamiento', {
    id_user: id_user.value,
    rut: rut.value
  })

  detalleConsentimiento.value = data

  const step = data?.detalles?.[0] || null
  const docName =
    step?.name_doc_interno_in ||
    step?.name_doc_interno_out ||
    null

  pdfUrlConsentimiento.value = docName
    ? `${ARCHIVO_BASE_URL}/archivo/terracon/${docName}`
    : ''

  console.log('✅ Consentimiento creado y cargado para firma:', {
    detalle: detalleConsentimiento.value,
    pdfUrl: pdfUrlConsentimiento.value
  })
}

async function completarEnrolamiento () {
  // Validar formulario de Vuetify
  if (form.value) {
    const ok = await form.value.validate()
    if (!ok.valid) {
      alert('Por favor completa los datos obligatorios.')
      return
    }
  } else if (!formValido.value) {
    alert('Por favor completa los datos obligatorios.')
    return
  }

  cargandoDialogo.value = true
  mensajeDialogo.value = 'Enviando datos...'
  dialogConfirmacion.value = true

  try {
    const hash = await hashSHA256(pass_hash_fes.value)

    const data = {
      id_user: id_user.value,
      rut: rut.value,
      correo: correo.value,
      name_frst: name_frst.value,
      name_sec: name_sec.value,
      apellido_pat: apellido_pat.value,
      apellido_mat: apellido_mat.value,
      email_alternativo: email_alternativo.value,
      movil: movil.value,
      pass_hash_fes: hash
    }

    // 1️⃣ Guardar enrolamiento (datos + FES)
    await apiAxios.put('/usuarios/enrolamiento/', data)

    mensajeDialogo.value = '✅ Enrolamiento guardado. Preparando consentimiento para firma...'

    // 2️⃣ Cargar el consentimiento y abrir FirmaDialog
    await cargarSurveyConsentimiento()
    dialogConfirmacion.value = false
    dialogFirmaConsentimiento.value = true
  } catch (error) {
    console.error('❌ Error al completar el enrolamiento:', error)
    mensajeDialogo.value = '❌ Error al completar el enrolamiento.'
  } finally {
    cargandoDialogo.value = false
  }
}

// Callback cuando se termina de firmar el consentimiento en FirmaDialog
async function onConsentimientoFirmado () {
  dialogFirmaConsentimiento.value = false

  try {
    // Mensaje opcional antes de redirigir
    mensajeDialogo.value = '✅ Enrolamiento COMPLETADO y consentimiento firmado.'
    dialogConfirmacion.value = true
  } catch (error) {
    console.error('❌ Error al marcar enrolamiento completado:', error)
    mensajeDialogo.value = '⚠️ Se firmó el consentimiento pero hubo un problema al marcar el enrolamiento como completado.'
    dialogConfirmacion.value = true
  }

  //  👉 Aquí rediriges donde corresponda:
  //    - al index
  //    - al login
  //    - a la pantalla de firmas, etc.
  //
  // Ejemplo: al index
  router.push('/')
  // o router.push('/login')
}
</script>

<style scoped>
.sombra-resaltada {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.enrol-title {
  white-space: normal;
  line-height: 1.2;
}

.enrol-btn :deep(.v-btn__content) {
  white-space: normal;
  text-align: center;
}
</style>
