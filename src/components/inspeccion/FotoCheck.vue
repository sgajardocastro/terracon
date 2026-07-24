<template>
  <div class="p-4">
    <div style="display: flex; gap: 1rem;">
      <div
        style="flex: 1;"
        class="font-weight-medium mb-1"
      >
        {{ localLabel }}
      </div>
      <div style="flex: 2;">
        <v-btn-toggle
          v-model="checkActivo"
          mandatory
          density="compact"
          class="mb-2"
          @update:model-value="(val) => {
            emit('update:modelValue', val)
          }"
        >
          <v-btn
            v-for="option in options"
            :key="option.id"
            :value="option.id"
            size="small"
            class="me-2"
          >
            {{ option.label }}
          </v-btn>
        </v-btn-toggle>
      </div>
    </div>

    <div v-if="galeria">
      <br>
      <v-btn
        icon
        :disabled="!!galeria.length"
        class="mb-3"
        @click="triggerInput"
      >
        <v-icon>mdi-camera</v-icon>
      </v-btn>

      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        @change="onFileChange"
      >

      <div
        v-if="galeria.length"
        class="mb-3"
      >
        <v-img
          :src="galeria[0].url || galeria[0].base64"
          aspect-ratio="1"
          cover
          class="rounded-lg"
        >
          <template #default>
            <v-btn
              icon
              size="small"
              color="red"
              class="ma-2"
              style="position: absolute; top: 0; right: 0; z-index: 2;"
              @click.stop="removeImage"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </template>
        </v-img>
      </div>
    </div>

    <v-textarea
      v-if="props.observacion !== undefined"
      v-model="localObs"
      label="Comentario"
      rows="2"
      auto-grow
      variant="outlined"
      hide-details
      class="bg-white"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import apiAxios from '@/services/api';

const props = defineProps({
  label: String,
  modelValue: {
    type: String,
    default: ''
  },
  galeria: Array,
  observacion: String,
  compression: Number,
  options: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'update:galeria', 'update:observacion'])

const localObs = ref(props.observacion || '')
const localLabel = ref(props.label || '')
const fileInput = ref(null)
const checkActivo = ref(props.modelValue || '')

watch(checkActivo, (val) => {
  emit('update:modelValue', val)
})
watch(checkActivo, (val) => emit('update:modelValue', val))
watch(localObs, (val) => emit('update:observacion', val))

function triggerInput() {
  fileInput.value?.click()
}

async function onFileChange(event) {
  const file = event.target.files[0]
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = async (e) => {
      const img = new Image()
      img.onload = async () => {
        const canvas = document.createElement('canvas')
        const scale = Math.min(1, 800 / img.width)
        canvas.width = img.width * scale
        canvas.height = img.height * scale

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        const compressed = canvas.toDataURL('image/jpeg', props.compression || 0.1)

        // Subimos el archivo y esperamos la respuesta
        const dataArchivo = await uploadFileFromBase64(compressed, file.name, file.type)

        if (dataArchivo?.archivo?.name_doc_interno) {
          const nuevoObjeto = {
            base64: '',
            url: '/archivo/terracon/' + dataArchivo.archivo.name_doc_interno,
            nombre: dataArchivo.archivo.name_doc_interno
          }
          emit('update:galeria', [nuevoObjeto])
        } else {
          console.error('No se pudo subir el archivo correctamente.')
        }
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  }
  event.target.value = ''
}

function base64ToFile(base64, filename, mime) {
  const arr = base64.split(',')
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

async function uploadFileFromBase64(base64Data, originalName, mimeType) {
  const file = base64ToFile(base64Data, originalName, mimeType)

  const formData = new FormData()
  formData.append('archivo', file)
  formData.append('tipo_doc', 'DOCUMENTO')
  formData.append('mimetype', file.type)
  formData.append('name_doc_orig', file.name)
  formData.append('name_doc_interno', '')
  formData.append('path_doc', '/u05/LeanDocs/terracon/')
  formData.append('id_user', 1)
  formData.append('estado', '1')

  try {
    const response = await apiAxios.post('/archivo/imagen', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  } catch (error) {
    console.error('Error al subir archivo:', error)
    return null
  }
}

function removeImage() {
  emit('update:galeria', [])
}
</script>
