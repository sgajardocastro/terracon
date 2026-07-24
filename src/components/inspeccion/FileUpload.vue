<template>
  <div class="p-4">
    <div class="d-flex align-center gap-4">
      <v-file-input
        ref="fileInput"
        accept="*/*"
        label="Seleccionar archivos"
        prepend-icon="mdi-paperclip"
        show-size
        outlined
        multiple
        hide-details
        class="flex-grow-1 d-none"
        @change="onFileChange"
      />

      <v-btn
        icon
        :disabled="archivos.length >= maxArchivos"
        @click="triggerInput"
      >
        <v-icon>mdi-paperclip</v-icon>
      </v-btn>
    </div>

    <v-list
      v-if="archivos.length"
      class="mt-4"
    >
      <v-list-item
        v-for="(archivo, index) in archivos"
        :key="index"
      >
        <div class="d-flex align-center justify-space-between">
          <div class="flex-grow-1">
            <a
              :href="archivo.url"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ archivo.name }}
            </a>
          </div>
          <v-btn
            icon
            size="small"
            color="red"
            @click="removeArchivo(index)"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-list-item>
    </v-list>


    <!-- Comentario -->
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

const props = defineProps({
  maxArchivos: Number,
  observacion: String,
  archivos: {
    type: Array,
    default: () => [] // Array de { name, url }
  },
})

const emit = defineEmits(['update:archivos', 'update:observacion'])

const fileInput = ref(null)
const localObs = ref(props.observacion || '')

function onFileChange(event) {
  const files = Array.from(event.target.files)
  const nuevosArchivos = []

  for (const file of files) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const fileUrl = e.target.result
      nuevosArchivos.push({ name: file.name, url: fileUrl })

      if (nuevosArchivos.length === files.length) {
        const actualizados = [...props.archivos, ...nuevosArchivos].slice(0, props.maxArchivos)
        emit('update:archivos', actualizados)
      }
    }
    reader.readAsDataURL(file)
  }

  event.target.value = ''
}

function triggerInput() {
  fileInput.value?.$el?.querySelector('input')?.click()
}

function removeArchivo(index) {
  const nuevaLista = [...props.archivos]
  nuevaLista.splice(index, 1)
  emit('update:archivos', nuevaLista)
}

/*function actualizarComentario() {
  emit('update:observacion', localObs.value)
}*/
</script>