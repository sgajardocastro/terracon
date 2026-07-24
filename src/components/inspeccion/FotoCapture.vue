<template>
  <div class="p-4">
    <div class="d-flex align-center gap-4">
      <v-file-input
        ref="fileInput"
        accept="image/*"
        label="Seleccionar fotos"
        prepend-icon="mdi-camera"
        capture="environment"
        show-size
        outlined
        multiple
        hide-details
        class="flex-grow-1 d-none"
        @change="onFileChange"
      />

      <div class="my-5">
        <v-btn
          icon
          :disabled="galeria.length >= maxFotos"
          class
          @click="triggerInput"
        >
          <v-icon>mdi-camera</v-icon>
        </v-btn>
      </div>
    </div>

    <v-row>
      <v-col
        v-for="(image, index) in galeria"
        :key="index"
        class="d-flex child-flex"
        cols="4"
      >
        <v-img
          :src="image.url || image.base64"
          aspect-ratio="1"
          class="bg-grey-lighten-2"
          cover
        >
          <!-- Loader mientras carga -->
          <template #placeholder>
            <v-row
              class="fill-height ma-0"
              justify="center"
              align="center"
            >
              <v-progress-circular
                color="grey-lighten-5"
                indeterminate
              />
            </v-row>
          </template>

          <!-- Botón de eliminar -->
          <template #default>
            <v-btn
              icon
              size="small"
              color="red"
              class="ma-2"
              style="position: absolute; top: 0; right: 0; z-index: 2;"
              @click.stop="removeImage(index)"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </template>
        </v-img>
      </v-col>
    </v-row>

    <!-- Sección de comentario -->
    <v-textarea
      v-model="localObs"
      label="Comentario General"
      auto-grow
      variant="outlined"
      class="mt-4 bg-white"
    />
    <!--v-btn color="primary" @click="actualizarComentario" class="mt-2">
      Actualizar comentarios
    </v-btn-->
  </div>
</template>

<script setup>
import { ref } from 'vue'
import apiAxios from '@/services/api';

const props = defineProps({
  maxFotos: Number,
  obligatorioFotos: Number,
  compression: Number,
  observacion: String,
  galeria: Array,
})

const emit = defineEmits(['update:galeria', 'update:observacion'])

const fileInput = ref(null)
const localObs = ref(props.observacion || '') // Ref local para comentario

async function onFileChange(event) {
  const file = event.target.files[0]
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = async (e) => {
      const img = new Image()
      img.onload = async () => {
        const canvas = document.createElement('canvas')
        const maxWidth = 800
        const scale = Math.min(1, maxWidth / img.width)

        canvas.width = img.width * scale
        canvas.height = img.height * scale

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        const compressedDataUrl = canvas.toDataURL('image/jpeg', props.compression || 0.1)

        // Subimos el archivo primero y esperamos la respuesta
        const dataArchivo = await uploadFileFromBase64(compressedDataUrl, file.name, file.type)
        console.log('Archivo subido:', dataArchivo)
        const nuevoObjeto = {
          base64: '',
          url: '/archivo/terracon/' + dataArchivo?.archivo.name_doc_interno,       // si viene la url desde el servidor
          nombre: dataArchivo?.archivo.name_doc_interno || file.name,
        }

        if (props.galeria.length < props.maxFotos) {
          emit('update:galeria', [...props.galeria, nuevoObjeto])
        }
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  }

  event.target.value = ''
}

function triggerInput() {
  // Esto abre el file input desde el botón
  fileInput.value?.$el?.querySelector('input')?.click()
}
function removeImage(index) {
  const nuevaGaleria = [...props.galeria]
  nuevaGaleria.splice(index, 1)
  emit('update:galeria', nuevaGaleria)
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
  formData.append('path_doc', '/u05/LeanDocs/terracon')
  formData.append('id_user', 1)
  formData.append('estado', '1')

  try {
    const response = await apiAxios.post('/archivo/imagen', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    console.log('Archivo subido correctamente:', response.data)
    return response.data;
  } catch (error) {
    console.error('Error al subir archivo:', error)
    return null;
  }
}
</script>
<style scoped>
input[type="file"] {
  display: block;
}
</style>
