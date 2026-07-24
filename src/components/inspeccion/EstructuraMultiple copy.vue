<template>
  <div>
    <v-alert
      type="info"
      variant="tonal"
      density="compact"
      class="mb-2"
    >
      Puedes agregar una o más estructuras usando el botón <strong>+</strong>.
    </v-alert>

    <div
      v-if="!rows.length"
      class="text-center mb-3"
    >
      <v-btn
        color="primary"
        variant="tonal"
        @click="add()"
      >
        <v-icon
          class="mr-2"
          icon="mdi-plus"
        />
        Agregar primera estructura
      </v-btn>
    </div>

    <div
      v-for="(it, idx) in rows"
      :key="'estr-' + idx"
      class="mb-4"
    >
      <v-card
        variant="outlined"
        class="rounded-lg"
      >
        <v-card-title class="d-flex align-center justify-space-between">
          <span class="text-subtitle-2">
            {{ it.titulo?.trim() ? it.titulo : `Estructura ${idx + 1}` }}
          </span>

          <v-btn
            icon
            size="x-small"
            color="red"
            title="Eliminar"
            @click="remove(idx)"
          >
            <v-icon icon="mdi-delete-outline" />
          </v-btn>
        </v-card-title>

        <v-card-text class="pt-0">
          <v-table
            density="compact"
            class="tabla-estr"
          >
            <tbody>
              <!-- ITEM (label arriba + select abajo) -->
              <tr>
                <td class="campo-col">
                  <div class="field-block pt-2">                    
                    <v-select
                      v-model="it.itemId" 
                      label="Item: "
                      :items="itemsCatalogo"
                      item-title="nombre"
                      item-value="id"
                      density="compact"
                      variant="outlined"
                      hide-details
                      class="bg-white"
                      clearable
                      @update:model-value="touch()"
                    />
                  </div>
                </td>
              </tr>

              <!-- NMRO (se mantiene inline) -->
              <tr>
                <td class="campo-col">
                  <div class="row-line">
                    <div class="input-col pt-2">
                      <v-text-field
                        v-model="it.nmro"
                        type="number"
                        label="Nmro: " 
                        density="compact"
                        variant="outlined"
                        hide-details
                        class="bg-white"
                        @update:model-value="touch()"
                      />
                    </div>
                  </div>
                </td>
              </tr>

              <!-- CONDICIONES (label arriba + botones) -->
              <tr>
                <td class="campo-col">
                  <div class="field-block">
                    <div class="field-label">
                      Condiciones:
                    </div>
                    <v-btn-toggle
                      v-model="it.condiciones"
                      mandatory
                      density="compact"
                      class="mb-1"
                      @update:model-value="touch()"
                    >
                      <v-btn
                        value="SI"
                        size="small"
                        class="me-2"
                      >
                        SI
                      </v-btn>
                      <v-btn
                        value="NO"
                        size="small"
                        class="me-2"
                      >
                        NO
                      </v-btn>
                      <v-btn
                        value="N/A"
                        size="small"
                        class="me-2"
                      >
                        N/A
                      </v-btn>
                    </v-btn-toggle>
                  </div>
                </td>
              </tr>

              <!-- OBSERVACION (label arriba + input abajo) -->
              <tr>
                <td class="campo-col">
                  <div class="field-block pt-2">
                    <v-text-field
                      v-model="it.observacion"
                      label="Observación: "
                      density="compact"
                      variant="outlined"
                      hide-details
                      class="bg-white"
                      @update:model-value="touch()"
                    />
                  </div>
                </td>
              </tr>

              <!-- FOTO -->
              <tr>
                <td class="campo-col">
                  <div class="photo-block">
                    <div class="photo-title">
                      Foto (1)
                    </div>

                    <FotoCapture
                      v-model:galeria="it.galeria"
                      v-model:observacion="it.fotoObs"
                      :max-fotos="1"
                      :obligatorio-fotos="0"
                      :compression="compression"
                      @update:galeria="touch()"
                      @update:observacion="touch()"
                    />
                  </div>
                </td>
              </tr>

              <!-- + -->
              <tr>
                <td class="campo-col text-center">
                  <v-btn
                    icon
                    size="x-small"
                    color="green"
                    title="Agregar"
                    @click="add()"
                  >
                    <v-icon icon="mdi-plus" />
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup>
/* eslint-disable vue/no-mutating-props */
import { computed, watch } from 'vue'
import FotoCapture from '@/components/FotoCapture.vue'

const props = defineProps({
  attr: { type: Object, required: true }
})

watch(
  () => props.attr,
  (a) => {
    if (!a) return
    if (!Array.isArray(a.body)) a.body = []
  },
  { immediate: true, deep: false }
)

const itemsCatalogo = computed(() =>
  Array.isArray(props.attr?.itemsCatalogo) ? props.attr.itemsCatalogo : []
)

const compression = computed(() => {
  const c = Number(props.attr?.compression ?? 0.25)
  return Number.isFinite(c) ? c : 0.25
})

const rows = computed(() => (Array.isArray(props.attr?.body) ? props.attr.body : []))

function blankRow() {
  return {
    titulo: '',
    itemId: null,
    nmro: '',
    condiciones: 'SI',
    observacion: '',
    galeria: [],
    fotoObs: ''
  }
}

function add() {
  if (!Array.isArray(props.attr.body)) props.attr.body = []
  props.attr.body.push(blankRow())
  touch()
}

function remove(idx) {
  if (!Array.isArray(props.attr.body)) props.attr.body = []
  props.attr.body.splice(idx, 1)
  touch()
}

function touch() {
  props.attr.__touched = Date.now()
}
</script>

<style scoped>
.tabla-estr {
  border: 1px solid #d7dde3;
}
.tabla-estr td {
  border-bottom: 1px solid #e3e7eb;
  vertical-align: top;
  padding: 12px;
}
.campo-col {
  background: #ffffff;
}

.field-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-weight: 700;
  color: #1f2937;
}

/* Lo que ya tenías para inline */
.row-line {
  display: flex;
  align-items: center;
  gap: 18px;
}
.label-col {
  min-width: 140px;
  font-weight: 700;
  color: #1f2937;
}
.input-col {
  flex: 1;
}

.photo-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.photo-title {
  font-weight: 700;
  color: #1f2937;
}
</style>
