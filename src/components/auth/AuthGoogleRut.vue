<template>
  <v-form
    class="d-grid ga-3"
    @submit.prevent="handleRut"
  >
    <v-text-field
      v-model.trim="rut"
      label="RUT"
      placeholder="12345678-9"
      autocomplete="username"
      density="comfortable"
      variant="outlined"
      hide-details="auto"
      rounded="lg"
    >
      <template #prepend-inner>
        <v-icon color="green-darken-2">
          mdi-card-account-details-outline
        </v-icon>
      </template>
    </v-text-field>

    <div class="mt-2 w-100">
      <v-btn
        :loading="loading"
        type="submit"
        color="primary"
        variant="flat"
        :height="44"
        class="w-100 rounded-lg btn-full"
      >
        Continuar con Google
      </v-btn>
    </div>

    <v-alert
      v-if="rutHint"
      type="info"
      variant="tonal"
      density="compact"
      class="mt-2"
    >
      {{ rutHint }}
    </v-alert>
  </v-form>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import apiAxios from '@/services/api'

const props = defineProps({
  googleClientId: { type: String, required: true },
  // si tu API está montada con prefijo (ej /auth), lo pasas acá: apiPrefix="/auth"
  apiPrefix: { type: String, default: '' },
  // tab inicial
  modelValue: { type: String, default: 'interno' }, // 'interno' | 'externo'
})

const emit = defineEmits([
  'update:modelValue',
  // emite el credential a tu Login.vue para que uses tu handleGoogleCredential tal cual
  'google-credential',
])

const tab = ref(props.modelValue)
watch(tab, v => emit('update:modelValue', v))

const googleBtnRef = ref(null)
const rut = ref('')
const rutHint = ref('')
const internalHint = ref('')
const loading = ref(false)

function initGIS({ loginHint } = {}) {
  if (!window.google?.accounts?.id) return

  // eslint-disable-next-line no-undef
  google.accounts.id.initialize({
    client_id: props.googleClientId,
    callback: (resp) => emit('google-credential', resp),
    auto_select: false,
    cancel_on_tap_outside: true,
    login_hint: loginHint || undefined,
  })

  // Render botón oficial solo en tab interno
  if (googleBtnRef.value) {
    // eslint-disable-next-line no-undef
    google.accounts.id.renderButton(googleBtnRef.value, {
      theme: 'outline',
      size: 'large',
      width: 280,
      type: 'standard',
      logo_alignment: 'left',
      text: 'signin_with'
    })
  }
}

function promptGoogle() {
  if (!window.google?.accounts?.id) return

  // eslint-disable-next-line no-undef
  google.accounts.id.prompt((notification) => {
    console.log('[GIS prompt]', notification)

    if (notification.isNotDisplayed?.()) {
      console.warn('GIS no se mostró:', notification.getNotDisplayedReason?.())
    }
    if (notification.isSkippedMoment?.()) {
      console.warn('GIS skipped:', notification.getSkippedReason?.())
    }
    if (notification.isDismissedMoment?.()) {
      console.warn('GIS dismissed:', notification.getDismissedReason?.())
    }
  })
}

onMounted(() => {
  const waitForGIS = () => {
    if (window.google?.accounts?.id) {
      initGIS() // sin hint al inicio
    } else {
      setTimeout(waitForGIS, 100)
    }
  }
  waitForGIS()
})

async function handleRut() {
  try {
    rutHint.value = ''
    internalHint.value = ''

    if (!rut.value?.trim()) {
      rutHint.value = 'Ingresa un RUT.'
      return
    }

    loading.value = true

    // Backend: GET /mail-rut/:rut  (si hay prefijo, ej /auth/mail-rut/:rut)
    const url = `${props.apiPrefix}/mail-rut/${encodeURIComponent(rut.value.trim())}`
    const resp = await apiAxios.get(url)

    const email = resp.data?.email || resp.data?.data?.email
    if (!email) {
      rutHint.value = 'No se encontró correo asociado a ese RUT.'
      return
    }

    // Re-init GIS con hint + prompt
    if (!window.google?.accounts?.id) {
      rutHint.value = 'Google no está listo aún, intenta de nuevo.'
      return
    }

    initGIS({ loginHint: email })
    promptGoogle()

    rutHint.value = `Continuando con: ${email}`
  } catch (e) {
    if (e?.response?.status === 404) {
      rutHint.value = 'No existe correo asociado a ese RUT.'
      return
    }
    console.error('❌ Error en handleRut:', e?.response || e)
    rutHint.value = 'Error al buscar el correo por RUT.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.d-grid { display: grid; gap: 12px; }
</style>
