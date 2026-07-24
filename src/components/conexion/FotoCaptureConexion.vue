<template>
  <div class="pa-0">
    <!-- Header visual auxiliar -->
    <div class="d-flex align-center justify-space-between mb-2">
      <label class="text-caption font-weight-bold ml-1 text-secondary">Fotografías del Equipo</label>
      <v-btn
        icon="mdi-camera"
        variant="text"
        density="comfortable"
        color="primary"
        :disabled="galeria.length >= maxFotos"
        title="Agregar Foto"
        @click="triggerInput"
      />
    </div>

    <!-- Input Oculto -->
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
      class="d-none"
      @change="onFileChange"
    />

    <!-- Galería -->
    <v-row dense>
      <v-col
        v-for="(image, index) in galeria"
        :key="index"
        cols="4"
        sm="3"
      >
        <v-card
          class="rounded-lg overflow-hidden"
          elevation="0"
          variant="outlined"
          style="border-color: #e2e8f0;"
        >
          <v-img
            :src="image.url || image.base64"
            aspect-ratio="1"
            cover
            class="bg-grey-lighten-4"
            style="cursor: pointer;"
            @click.stop="verFoto(image)"
          >
            <!-- Loader -->
            <template #placeholder>
              <div class="d-flex align-center justify-center fill-height">
                <v-progress-circular
                  indeterminate
                  color="grey-lighten-2"
                  size="20"
                />
              </div>
            </template>

            <!-- Botón Eliminar -->
            <v-btn
              icon="mdi-close"
              size="x-small"
              color="white"
              variant="flat"
              class="ma-1"
              style="position: absolute; top: 0; right: 0; z-index: 2; background-color: rgba(0,0,0,0.5);"
              @click.stop="removeImage(index)"
            />
          </v-img>
        </v-card>
      </v-col>

      <!-- Placeholder 'Agregar' si no hay fotos -->
      <v-col
        v-if="galeria.length === 0"
        cols="12"
      >
        <div
          class="d-flex flex-column align-center justify-center py-4 border-dashed rounded-lg bg-grey-lighten-5"
          style="border: 1px dashed #cbd5e1; cursor: pointer;"
          @click="triggerInput"
        >
          <v-icon
            color="grey-lighten-1"
            size="32"
            class="mb-1"
          >
            mdi-image-plus-outline
          </v-icon>
          <span class="text-caption text-medium-emphasis">Agregar Fotos</span>
        </div>
      </v-col>
    </v-row>

    <!-- Visor de Fotos en Grande -->
    <v-dialog
      v-model="dialogVisor"
      max-width="900"
    >
      <v-card class="rounded-xl overflow-hidden bg-grey-darken-4 text-white">
        <v-toolbar
          flat
          color="transparent"
          class="px-2"
        >
          <v-toolbar-title class="text-subtitle-1 font-weight-medium">
            Visualizador de Documento
          </v-toolbar-title>
          <v-spacer />
          <v-btn
            icon="mdi-open-in-new"
            variant="text"
            color="white"
            :href="urlVisor"
            target="_blank"
            title="Abrir en pestaña nueva"
          />
          <v-btn
            icon="mdi-close"
            variant="text"
            color="white"
            @click="dialogVisor = false"
          />
        </v-toolbar>
        <v-card-text
          class="d-flex align-center justify-center pa-4"
          style="min-height: 300px; background-color: #121212;"
        >
          <v-img
            :src="urlVisor"
            max-height="75vh"
            contain
            class="rounded-lg bg-grey-darken-4"
          >
            <template #placeholder>
              <div class="d-flex align-center justify-center fill-height">
                <v-progress-circular
                  indeterminate
                  color="primary"
                />
              </div>
            </template>
          </v-img>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/services/api';
import { useUserDetailStore } from "@/stores/userDetail";

const userDetailStore = useUserDetailStore();

const props = defineProps({
    maxFotos: {
        type: Number,
        default: 5
    },
    galeria: {
        type: Array,
        default: () => []
    },
    compression: {
        type: Number,
        default: 0.5
    }
})

const emit = defineEmits(['update:galeria'])

const fileInput = ref(null)
const dialogVisor = ref(false)
const urlVisor = ref('')

function verFoto(image) {
    const url = image.url || image.base64
    if (url) {
        urlVisor.value = url
        dialogVisor.value = true
    }
}

async function onFileChange(event) {
    const files = event.target.files
    if (!files || files.length === 0) return

    // Procesar cada archivo seleccionado
    for (const file of files) {
        if (props.galeria.length >= props.maxFotos) break // Respetar límite

        if (file.type.startsWith('image/')) {
            await processAndUpload(file)
        }
    }

    // Limpiar input para permitir seleccionar el mismo archivo nuevamente si se desea
    event.target.value = ''
}

function processAndUpload(file) {
    return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = async (e) => {
            const img = new Image()
            img.onload = async () => {
                const canvas = document.createElement('canvas')
                const maxWidth = 1024 // Un poco más grande para equipos
                const scale = Math.min(1, maxWidth / img.width)

                canvas.width = img.width * scale
                canvas.height = img.height * scale

                const ctx = canvas.getContext('2d')
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

                const compressedDataUrl = canvas.toDataURL('image/jpeg', props.compression)

                // Subir al servidor
                const dataArchivo = await uploadFileFromBase64(compressedDataUrl, file.name, file.type)

                if (dataArchivo && dataArchivo.archivo) {
                    const baseUrl = import.meta.env.VITE_API_BASE_URL;
                    const nuevoObjeto = {
                        id_doc: dataArchivo.archivo.id_doc,
                        url: `${baseUrl}/archivo/terracon/${dataArchivo.archivo.name_doc_interno}`, // Usar URL completa del servidor
                        nombre: dataArchivo.archivo.name_doc_interno || file.name,
                    }
                    emit('update:galeria', [...props.galeria, nuevoObjeto])
                }
                resolve()
            }
            img.src = e.target.result
        }
        reader.readAsDataURL(file)
    })
}


function triggerInput() {
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
    formData.append('tipo_doc', 'EQUIPO_FOTO') // Distinguir tipo
    formData.append('mimetype', file.type)
    formData.append('name_doc_orig', file.name)
    formData.append('name_doc_interno', '')
    formData.append('path_doc', '/u05/LeanDocs/terracon')
    formData.append('id_user', Number(userDetailStore.userDetail?.id_user) || 1)
    formData.append('estado', '1')

    try {
        const response = await api.post('/archivo/imagen', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        console.log('Foto equipo subida:', response.data)
        return response.data;
    } catch (error) {
        console.error('Error al subir foto:', error)
        return null;
    }
}
</script>

<style scoped>
/* Estilos adicionales si fueran necesarios */
</style>
