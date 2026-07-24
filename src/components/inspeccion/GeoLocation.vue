<template>
  <div>
    <v-btn 
      color="#2A3C67" 
      style="box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.3);"
      class="w-100"
      @click="obtenerUbicacion"
    >
      Obtener ubicación
    </v-btn>

    <div
      v-if="local.lat && local.lng"
      class="mt-4"
    >
      <p><strong>Latitud:</strong> {{ local.lat }}</p>
      <p><strong>Longitud:</strong> {{ local.lng }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ lat: null, lng: null })
  }
})

const emit = defineEmits(['update:modelValue'])

const local = ref({ ...props.modelValue })

watch(local, (val) => {
  emit('update:modelValue', val)
}, { deep: true })

function obtenerUbicacion() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        local.value.lat = pos.coords.latitude
        local.value.lng = pos.coords.longitude
      },
      (err) => {
        console.error('Error al obtener ubicación:', err.message)
      }
    )
  } else {
    console.warn('La geolocalización no está soportada en este navegador.')
  }
}
</script>