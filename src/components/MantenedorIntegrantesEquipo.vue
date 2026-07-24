<template>
  <div>
    <!-- Botón que abre el mantenedor -->
    <v-btn
      size="small"
      variant="outlined"
      color="primary"
      @click="abrirDialog"
    >
      <v-icon
        start
        icon="mdi-account-multiple"
      />
      Integrantes
    </v-btn>

    <!-- Dialog Mantenedor de Integrantes -->
    <v-dialog
      v-model="open"
      max-width="800"
    >
      <v-card>
        <v-toolbar
          color="primary"
          dark
        >
          <v-toolbar-title>
            Integrantes de {{ nombreEquipo || ('Equipo #' + idEquipo) }}
          </v-toolbar-title>
          <v-spacer />
          <v-btn
            icon
            @click="open = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text>
          <!-- Toaster local -->
          <v-snackbar
            v-model="snackbar.open"
            :color="snackbar.color"
            location="bottom end"
            timeout="2500"
          >
            {{ snackbar.message }}
          </v-snackbar>

          <!-- Alta de integrantes -->
          <v-form @submit.prevent="guardarIntegrantes">
            <v-row dense>
              <v-col
                cols="12"
                md="6"
              >
                <v-text-field
                  v-model="localNombre"
                  label="Nombre del equipo"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-account-group-outline"
                />
              </v-col>
              <v-col
                cols="12"
                md="6"
              >
                <v-textarea
                  v-model="localDescripcion"
                  label="Descripción"
                  variant="outlined"
                  density="compact"
                  rows="1"
                  auto-grow
                />
              </v-col>

              <v-col cols="12">
                <v-autocomplete
                  v-model="miembrosSeleccionados"
                  :items="usuarios"
                  item-title="nombre_user"
                  item-value="id_user"
                  label="Integrantes del equipo"
                  multiple
                  chips
                  closable-chips
                  density="compact"
                  variant="outlined"
                  hide-details="auto"
                  :custom-filter="filtrarUsuario"
                  :menu-props="{ maxHeight: 300 }"
                />
              </v-col>
            </v-row>

            <div class="d-flex justify-end mt-3">
              <v-btn
                type="submit"
                color="primary"
                :loading="guardando"
                :disabled="guardando || !miembrosSeleccionados.length"
              >
                <v-icon
                  start
                  icon="mdi-content-save"
                />
                Guardar integrantes
              </v-btn>
            </div>
          </v-form>

          <v-divider class="my-4" />

          <!-- Tabla de integrantes actuales -->
          <v-data-table
            :items="integrantes"
            :headers="headers"
            density="compact"
          >
            <template #item.nombre="{ item }">
              {{ item.nombre_user }}
            </template>

            <template #item.acciones="{ item }">
              <v-btn
                size="small"
                icon
                variant="text"
                color="red"
                @click="eliminarIntegrante(item)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import apiAxios from '@/services/api';
import { useUserDetailStore } from "@/stores/userDetail";

const userDetailStore = useUserDetailStore()

const props = defineProps({
  idEquipo: {
    type: [Number, String],
    required: true
  },
  nombreEquipo: {
    type: String,
    default: ''
  },
  descripcionEquipo: {
    type: String,
    default: ''
  },
  // Lista completa de usuarios del sistema/proyecto
  usuarios: {
    type: Array,
    default: () => []
  }
})

const quitarTildes = (str = '') =>
  str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

const filtrarUsuario = (value, queryText, item) => {
  // value = item-title => nombre_user
  const textoItem = quitarTildes(String(value ?? '')).toLowerCase()
  const textoBusqueda = quitarTildes(String(queryText ?? '')).toLowerCase()

  // item.raw es el objeto original que tú pasaste en :items
  const raw = item?.raw ?? item ?? {}

  const extra = quitarTildes(
    `${raw.email_user ?? ''} ${raw.rut ?? ''}`
  ).toLowerCase()

  return (
    textoItem.includes(textoBusqueda) ||
    extra.includes(textoBusqueda)
  )
}

const emit = defineEmits(['actualizado'])

const open = ref(false)
const integrantes = ref([])           // [{ id_user, nombre_user, email_user }]
const miembrosSeleccionados = ref([]) // ids de usuarios a agregar
const localNombre = ref('')
const localDescripcion = ref('')
const guardando = ref(false)

// Snackbar local
const snackbar = ref({
  open: false,
  message: '',
  color: 'green-darken-2'
})

const headers = [
  { title: 'Nombre', value: 'nombre' },
  { title: 'Acciones', value: 'acciones', sortable: false }
]

const idEquipoNumber = computed(() => Number(props.idEquipo) || 0)

// usuarios que aún NO son integrantes
const usuariosNoIntegrantes = computed(() => {
  const idsIntegrantes = new Set(integrantes.value.map(i => Number(i.id_user)))
  return (props.usuarios || []).filter(u => !idsIntegrantes.has(Number(u.id_user)))
})

function showSnack (message, color = 'green-darken-2') {
  snackbar.value.message = message
  snackbar.value.color = color
  snackbar.value.open = true
}

function abrirDialog () {
  if (!idEquipoNumber.value) {
    showSnack('Debe seleccionar un equipo primero', 'amber-darken-2')
    return
  }
  localNombre.value = props.nombreEquipo
  localDescripcion.value = props.descripcionEquipo
  open.value = true
  cargarIntegrantes()
}

watch(idEquipoNumber, () => {
  if (open.value) {
    cargarIntegrantes()
  }
})

// ====== API: ajusta las URLs a tu backend real ======

async function cargarIntegrantes () {
  if (!idEquipoNumber.value) return
  try {
    const { data } = await apiAxios.get(
      '/servicio/leanglobal/obtenerEquiposProyectosMiembros?id_equipo_proyecto=' + idEquipoNumber.value
    )

    const lista = Array.isArray(data?.datos) ? data.datos : (Array.isArray(data) ? data : [])

    console.log('cargarIntegrantes: datos recibidos', lista)

    // 🔍 Filtrar SOLO los activos (distintos formatos posibles)
    const activos = lista.filter(i =>
      i.activo === true ||
      i.activo === 1 ||
      i.activo === 't' ||   // típico en PostgreSQL si se serializa así
      i.activo === 'true'
    )

    integrantes.value = activos.map(i => ({
      id_user: Number(i.id_user),
      nombre_user: i.nombre_user,
      email_user: i.email_user
    }))

    // v-select preseleccionado solo con los activos
    miembrosSeleccionados.value = integrantes.value.map(i => i.id_user)

  } catch (err) {
    console.error('cargarIntegrantes', err)
    showSnack('Error al cargar integrantes del equipo', 'red-darken-2')
  }
}

async function guardarIntegrantes () {
  if (!idEquipoNumber.value) return

  guardando.value = true
  try {
    await apiAxios.put(
      '/equipos/updEquipos',
      {
        id_equipo_proyecto: idEquipoNumber.value,
        nombre_equipo: localNombre.value?.trim() || props.nombreEquipo,
        descripcion_equipo: localDescripcion.value?.trim() || null,
        ids_usuarios: miembrosSeleccionados.value.map(Number), // 👈 lo que está seleccionado
        id_usuario_modificacion: Number(userDetailStore.userDetail?.id_user)
      }
    )

    showSnack('Integrantes actualizados correctamente')
    await cargarIntegrantes()
    emit('actualizado', { id_equipo_proyecto: idEquipoNumber.value })
  } catch (err) {
    console.error('guardarIntegrantes', err)
    showSnack('Error al guardar integrantes', 'red-darken-2')
  } finally {
    guardando.value = false
  }
}

async function eliminarIntegrante (itemData) {
  // En Vuetify 3, el objeto recibido puede ser el raw o estar envuelto
  const item = itemData?.raw || itemData;
  const idUser = item?.id_user;
  const nombre = item?.nombre_user || 'el usuario';

  if (!idUser) {
    console.error('eliminarIntegrante: No se encontró id_user en el objeto', itemData);
    return;
  }

  if (!confirm(`¿Quitar a ${nombre} del equipo?`)) return;

  try {
    await apiAxios.put(
      '/api/equipos/delEquiposMiembro', // 👈 aseguramos prefijo /api si es necesario
      {
        id_equipo_proyecto: idEquipoNumber.value,
        id_user: idUser,
        id_usuario_modificacion: Number(userDetailStore.userDetail?.id_user)
      }
    );
    showSnack('Integrante eliminado');
    await cargarIntegrantes();
    emit('actualizado', { id_equipo_proyecto: idEquipoNumber.value });
  } catch (err) {
    console.error('eliminarIntegrante', err);
    // Si falla /api, intentamos sin prefijo (según baseURL config)
    try {
      await apiAxios.put(
        '/equipos/delEquiposMiembro',
        {
          id_equipo_proyecto: idEquipoNumber.value,
          id_user: idUser,
          id_usuario_modificacion: Number(userDetailStore.userDetail?.id_user)
        }
      );
      showSnack('Integrante eliminado');
      await cargarIntegrantes();
      emit('actualizado', { id_equipo_proyecto: idEquipoNumber.value });
    } catch(err2) {
      showSnack('Error al eliminar integrante: ' + (err2?.response?.data?.message || err2.message), 'red-darken-2');
    }
  }
}
</script>
