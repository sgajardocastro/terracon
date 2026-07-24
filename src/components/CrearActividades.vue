<!-- src/components/CrearActividades.vue -->
<template>
  <div>
    <v-alert
      type="info"
      density="compact"
      variant="tonal"
      class="mb-4"
      color="blue-darken-3"
    >
      Por ahora: seleccionar <b>1 usuario</b> y <b>fechas</b>. Lo demás lo vemos después.
    </v-alert>

    <v-row class="pa-4 rounded-lg bg-blue-lighten-5">
      <!-- Usuario -->
      <v-col
        cols="12"
        md="6"
      >
        <v-select
          v-model="form.id_user"
          :items="usuarios"
          item-title="label"
          item-value="id_user"
          label="Usuario *"
          variant="outlined"
          density="compact"
          hide-details
          clearable
        />
        <div class="text-caption text-grey-darken-1 mt-1">
          Selecciona un usuario para asignar actividades.
        </div>
      </v-col>

      <!-- Modo fechas -->
      <v-col
        cols="12"
        md="6"
      >
        <v-select
          v-model="form.modoFechas"
          :items="modosFechas"
          label="Modo de fechas *"
          variant="outlined"
          density="compact"
          hide-details
        />
        <div class="text-caption text-grey-darken-1 mt-1">
          Usa rango (desde/hasta) o selección múltiple.
        </div>
      </v-col>

      <!-- RANGO -->
      <template v-if="form.modoFechas === 'RANGO'">
        <v-col
          cols="12"
          md="3"
        >
          <v-text-field
            v-model="form.fecha_desde"
            label="Fecha desde *"
            type="date"
            variant="outlined"
            density="compact"
            hide-details
          />
        </v-col>

        <v-col
          cols="12"
          md="3"
        >
          <v-text-field
            v-model="form.fecha_hasta"
            label="Fecha hasta *"
            type="date"
            variant="outlined"
            density="compact"
            hide-details
            :min="form.fecha_desde || undefined"
          />
        </v-col>

        <v-col
          cols="12"
          md="6"
          class="d-flex align-center"
        >
          <v-alert
            v-if="rangoError"
            type="error"
            density="compact"
            variant="tonal"
            class="w-100"
          >
            {{ rangoError }}
          </v-alert>
          <v-alert
            v-else
            type="success"
            density="compact"
            variant="tonal"
            class="w-100"
          >
            Rango OK.
          </v-alert>
        </v-col>
      </template>

      <!-- MULTIPLE -->
      <template v-else>
        <v-col
          cols="12"
          md="6"
        >
          <!-- ✅ v-menu en vez de v-dialog (evita dialog dentro de dialog) -->
          <v-menu
            v-model="menuCalendar"
            :close-on-content-click="false"
            location="bottom"
            offset="6"
          >
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                color="blue-darken-3"
                block
                height="40"
                prepend-icon="mdi-calendar-range"
                variant="flat"
              >
                {{ form.fechas.length }} fecha(s) seleccionada(s)
              </v-btn>
            </template>

            <v-card min-width="640">
              <v-card-title class="bg-blue-darken-3 text-white">
                Seleccionar Fechas
              </v-card-title>

              <v-card-text>
                <v-date-picker
                  :model-value="form.fechas"
                  multiple
                  show-adjacent-months
                  @update:model-value="(val) => (form.fechas = normalizeToDateArray(val))"
                >
                  <template #header />
                  <template #title />
                </v-date-picker>

                <div class="mt-2 text-right text-caption">
                  Seleccionadas: {{ form.fechas.length }}
                </div>

                <v-alert
                  v-if="multiError"
                  type="error"
                  density="compact"
                  variant="tonal"
                  class="mt-3"
                >
                  {{ multiError }}
                </v-alert>
              </v-card-text>

              <v-card-actions>
                <v-spacer />
                <v-btn
                  variant="text"
                  @click="form.fechas = []"
                >
                  Limpiar
                </v-btn>
                <v-btn
                  color="blue-darken-3"
                  @click="menuCalendar = false"
                >
                  Listo
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-menu>

          <div class="text-caption text-grey-darken-1 mt-1">
            Tip: selecciona varias fechas en el calendario.
          </div>
        </v-col>

        <v-col
          cols="12"
          md="6"
          class="d-flex align-center"
        >
          <v-alert
            v-if="multiError"
            type="error"
            density="compact"
            variant="tonal"
            class="w-100"
          >
            {{ multiError }}
          </v-alert>
          <v-alert
            v-else
            type="success"
            density="compact"
            variant="tonal"
            class="w-100"
          >
            Fechas OK.
          </v-alert>
        </v-col>

        <v-col cols="12">
          <v-chip
            v-for="d in fechasISO"
            :key="d"
            class="ma-1"
            size="small"
            label
            color="blue-darken-1"
            variant="tonal"
          >
            {{ d }}
          </v-chip>
        </v-col>
      </template>
    </v-row>

    <v-divider class="my-5" />

    <div class="d-flex justify-end">
      <v-btn
        color="green-darken-3"
        prepend-icon="mdi-content-save-check"
        :disabled="!isValid"
        @click="guardarMock"
      >
        Guardar (Mock)
      </v-btn>
    </div>

    <div class="text-caption text-grey-darken-1 mt-3">
      Emite: <code>{ id_user, modoFechas, fechas }</code>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const emit = defineEmits(['guardar'])

const props = defineProps({
  usuariosProp: { type: Array, default: () => [] }
})

const modosFechas = ['RANGO', 'MULTIPLE']
const menuCalendar = ref(false)

/* Usuarios (mock o props) */
const usuarios = computed(() => {
  if (props.usuariosProp?.length) {
    return props.usuariosProp.map(u => ({
      id_user: u.id_user,
      label: `${u.name_frst ?? ''} ${u.apellido_pat ?? ''}`.trim() || u.email || `Usuario ${u.id_user}`
    }))
  }
  return [
    { id_user: 101, label: 'Juan Pérez' },
    { id_user: 102, label: 'Ana Soto' },
    { id_user: 103, label: 'Pedro Rojas' }
  ]
})

/* Form */
const form = ref({
  id_user: null,
  modoFechas: 'RANGO',
  fecha_desde: '',
  fecha_hasta: '',
  fechas: [] // ✅ Date[]
})

/* Helpers fechas */
const pad2 = (n) => String(n).padStart(2, '0')
const dateToISO = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`

function normalizeToDateArray(val) {
  if (!Array.isArray(val)) return []
  return val
    .map(x => (x instanceof Date ? x : new Date(x)))
    .filter(d => d instanceof Date && !isNaN(d))
}

const fechasISO = computed(() =>
  (form.value.fechas || []).filter(d => d instanceof Date && !isNaN(d)).map(dateToISO).sort()
)

/* Validaciones */
const rangoError = computed(() => {
  if (form.value.modoFechas !== 'RANGO') return ''
  if (!form.value.fecha_desde || !form.value.fecha_hasta) return 'Debe seleccionar fecha desde y hasta.'
  if (form.value.fecha_hasta < form.value.fecha_desde) return 'La fecha hasta no puede ser menor que fecha desde.'
  return ''
})

const multiError = computed(() => {
  if (form.value.modoFechas !== 'MULTIPLE') return ''
  if (!form.value.fechas || form.value.fechas.length === 0) return 'Debe seleccionar al menos 1 fecha.'
  return ''
})

const isValid = computed(() => {
  if (!form.value.id_user) return false
  return form.value.modoFechas === 'RANGO' ? !rangoError.value : !multiError.value
})

/* Limpieza al cambiar modo */
watch(
  () => form.value.modoFechas,
  (mode) => {
    if (mode === 'RANGO') {
      form.value.fechas = []
      menuCalendar.value = false
    } else {
      form.value.fecha_desde = ''
      form.value.fecha_hasta = ''
    }
  }
)

function guardarMock() {
  const payload = {
    id_user: form.value.id_user,
    modoFechas: form.value.modoFechas,
    fechas: form.value.modoFechas === 'RANGO'
      ? { desde: form.value.fecha_desde, hasta: form.value.fecha_hasta }
      : fechasISO.value
  }
  emit('guardar', payload)
  console.log('CrearActividades payload:', payload)
}
</script>
