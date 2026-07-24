<template>
  <div class="pa-0">
    <!-- Header visual -->
    <div class="d-flex align-center justify-space-between mb-2">
      <label class="text-caption font-weight-bold ml-1 text-secondary">{{ label }}</label>
      <v-btn
        icon="mdi-paperclip"
        variant="text"
        density="comfortable"
        color="primary"
        :disabled="items.length >= maxItems"
        title="Adjuntar Documento"
        @click="triggerInput"
      />
    </div>

    <!-- Input Oculto -->
    <v-file-input
      ref="fileInput"
      :accept="accept"
      label="Seleccionar documentos"
      prepend-icon="mdi-paperclip"
      show-size
      outlined
      multiple
      hide-details
      class="d-none"
      @change="onFileChange"
    />

    <!-- Lista de Documentos -->
    <v-list
      v-if="items.length > 0"
      density="compact"
      class="bg-grey-lighten-5 rounded-lg border"
      style="border-color: #e2e8f0 !important;"
    >
      <v-list-item
        v-for="(doc, index) in items"
        :key="index"
        :title="doc.nombre"
        :subtitle="doc.tipo || 'Documento'"
        class="pa-2"
      >
        <template #prepend>
          <v-avatar
            color="primary"
            variant="tonal"
            size="32"
            class="mr-2"
          >
            <v-icon size="18">
              {{ getIcon(doc.mimetype) }}
            </v-icon>
          </v-avatar>
        </template>

        <template #append>
          <v-btn
            icon="mdi-close"
            size="small"
            variant="text"
            color="grey-darken-1"
            @click="removeItem(index)"
          />
        </template>
      </v-list-item>
    </v-list>

    <!-- Placeholder si no hay documentos -->
    <div
      v-else
      class="d-flex flex-column align-center justify-center py-4 border-dashed rounded-lg bg-grey-lighten-5"
      style="border: 1px dashed #cbd5e1; cursor: pointer;"
      @click="triggerInput"
    >
      <v-icon
        color="grey-lighten-1"
        size="28"
        class="mb-1"
      >
        mdi-file-document-plus-outline
      </v-icon>
      <span class="text-caption text-medium-emphasis">Sin documentos adjuntos</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import api from '@/services/api';
import { useUserDetailStore } from "@/stores/userDetail";

const userDetailStore = useUserDetailStore();

const props = defineProps({
    maxItems: {
        type: Number,
        default: 5
    },
    items: {
        type: Array, // Array of { id_doc, url, nombre, mimetype, tipo }
        default: () => []
    },
    label: {
        type: String,
        default: 'Documentos Adjuntos'
    },
    accept: {
        type: String,
        default: '*/*' // .pdf, .doc, .docx, image/*
    }
});

const emit = defineEmits(['update:items']);

const fileInput = ref(null);

async function onFileChange(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    for (const file of files) {
        if (props.items.length >= props.maxItems) break;
        await uploadFile(file);
    }

    event.target.value = '';
}

function triggerInput() {
    fileInput.value?.$el?.querySelector('input')?.click();
}

function removeItem(index) {
    const newItems = [...props.items];
    newItems.splice(index, 1);
    emit('update:items', newItems);
}

function getIcon(mime) {
    if (!mime) return 'mdi-file-document-outline';
    if (mime.includes('pdf')) return 'mdi-file-pdf-box';
    if (mime.includes('image')) return 'mdi-file-image';
    if (mime.includes('word') || mime.includes('doc')) return 'mdi-file-word';
    if (mime.includes('excel') || mime.includes('sheet')) return 'mdi-file-excel';
    return 'mdi-file-document-outline';
}

async function uploadFile(file) {
    const formData = new FormData();
    formData.append('archivo', file);
    formData.append('tipo_doc', 'CERT_DOC'); // Tipo diferenciado
    formData.append('mimetype', file.type);
    formData.append('name_doc_orig', file.name);
    formData.append('name_doc_interno', '');
    formData.append('path_doc', '/u05/LeanDocs/terracon'); // Path unificado
    formData.append('id_user', Number(userDetailStore.userDetail?.id_user) || 1);
    formData.append('estado', '1');

    try {
        // Reusamos endpoint de archivo (suele ser polimorfico para subida)
        // El nombre del endpoint '/archivo/imagen' puede ser confuso si es genérico,
        // pero validamos que funcione para docs. Si hay uno específico de docs, usarlo.
        // Asumiendo que /archivo/imagen maneja multipart para guardar en disco:
        const response = await api.post('/archivo/imagen', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        console.log('Documento subido:', response.data);
        const dataArchivo = response.data;

        if (dataArchivo && dataArchivo.archivo) {
            const baseUrl = import.meta.env.VITE_API_BASE_URL;
            const nuevoDoc = {
                id_doc: dataArchivo.archivo.id_doc,
                url: `${baseUrl}/archivo/terracon/${dataArchivo.archivo.name_doc_interno}`,
                nombre: dataArchivo.archivo.name_doc_orig || file.name,
                mimetype: file.type,
                tipo: 'Adjunto'
            };
            emit('update:items', [...props.items, nuevoDoc]);
        }
    } catch (error) {
        console.error('Error al subir documento:', error);
    }
}
</script>

<style scoped>
/* Estilos adicionales */
</style>
