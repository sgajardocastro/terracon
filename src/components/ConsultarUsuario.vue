<template>
  <v-container
    class="pa-4"
    fluid
  >
    <v-row>
      <!-- LADO IZQUIERDO: BUSCADOR + SELECT USUARIOS -->
      <v-col
        cols="12"
        md="6"
      >
        <v-card
          class="pa-4"
          elevation="2"
        >
          <div class="text-subtitle-1 font-weight-bold mb-2">
            Lista de usuarios (rut - correo - nombre)
          </div>

          <!-- Estado de carga -->
          <div
            v-if="loadingUsuarios"
            class="d-flex align-center ga-2 mb-3"
          >
            <v-progress-circular
              indeterminate
              :size="22"
            />
            <span class="text-body-2">Cargando usuarios...</span>
          </div>

          <!-- Error -->
          <v-alert
            v-if="errorUsuarios"
            type="error"
            variant="tonal"
            class="mb-3"
          >
            {{ errorUsuarios }}
          </v-alert>

          <!-- BUSCADOR + SELECT EN LA MISMA FILA (md y up) -->
          <v-row
            dense
            class="mb-3"
          >
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                v-model="filtro"
                label="Buscar por rut, correo o nombre"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-magnify"
                clearable
                hide-details="auto"
              />
            </v-col>

            <v-col
              cols="12"
              md="6"
            >
              <v-select
                v-model="usuarioSeleccionado"
                :items="usuariosFiltrados"
                :loading="loadingUsuarios"
                item-title="nombreCompleto"
                item-value="id_user"
                label="Selecciona un usuario"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-account-search"
                clearable
                hide-details="auto"
                return-object
              />
            </v-col>
          </v-row>
        </v-card>
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <!-- Mini detalle del usuario escogido -->
        <v-expand-transition>
          <div
            v-if="usuarioSeleccionado"
            class="mt-2"
          >
            <div class="text-caption text-medium-emphasis mb-1">
              Usuario seleccionado
            </div>
            <v-card
              variant="tonal"
              class="pa-3"
            >
              <div class="font-weight-medium">
                {{ usuarioSeleccionado.nombre || 'Sin nombre' }}
              </div>
              <div class="text-body-2">
                <strong>RUT:</strong> {{ usuarioSeleccionado.rut || '—' }}
              </div>
              <div class="text-body-2">
                <strong>Correo:</strong> {{ usuarioSeleccionado.correo || '—' }}
              </div>
            </v-card>
          </div>
        </v-expand-transition>
      </v-col>

      <!-- LADO DERECHO: FUTURA TABLA DE DOCUMENTOS -->
      <v-col cols="12">
        <div class="tabla-container">
          <v-table
            dense
            class="text-caption"
            height="650px"
            fixed-header
          >
            <thead>
              <tr>
                <th class="text-left">
                  ID
                </th>
                <th class="text-left">
                  Correo
                </th>
                <th class="text-left">
                  Primer Nombre
                </th>
                <th class="text-left">
                  Segundo Nombre
                </th>
                <th class="text-left">
                  Apellido Pat
                </th>
                <th class="text-left">
                  Apellido Mat
                </th>
                <th class="text-left">
                  Rut
                </th>
                <th class="text-left">
                  Móvil
                </th>
                <th class="text-left">
                  Activo
                </th>
                <th class="text-left">
                  Creación
                </th>
                <th class="text-left">
                  Actualización
                </th>
                <th class="text-left">
                  Código
                </th>
                <!--th class="text-left">pass_hash_fes</th-->
                <th class="text-left">
                  En Enrolamiento
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in usuarios"
                :key="item.id_user"
              >
                <td>{{ item.id_user }}</td>
                <td>{{ item.email }}</td>
                <td>{{ item.name_frst }}</td>
                <td>{{ item.name_sec }}</td>
                <td>{{ item.apellido_pat }}</td>
                <td>{{ item.apellido_mat }}</td>
                <td>{{ item.rut }}</td>
                <td>{{ item.movil }}</td>
                <td>{{ item.activo ? 'Activo' : 'Inactivo' }}</td>
                <td>{{ item.fecha_creacion }}</td>
                <td>{{ item.fecha_actualizacion }}</td>
                <td>{{ item.codi_user }}</td>
                <!--td>{{ item.pass_hash_fes }}</td-->
                <td>{{ item.flag_proc_enrol ? 'Sí' : 'No' }}</td>
              </tr>
            </tbody>
          </v-table>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import apiAxios from '@/services/api';

const usuarios = ref([])
const loadingUsuarios = ref(false)
const errorUsuarios = ref('')
const filtro = ref('')
const usuarioSeleccionado = ref(null)

/**
 * Normaliza los campos que nos interesan para la UI
 * porque el backend puede venir con nombres distintos.
 */
const mapUsuario = (u) => ({
  id_user: u.id_user,
  rut: u.rut || u.rut_user || u.rut_usr || '',
  correo: u.email || u.correo || u.mail || '',
  nombre: u.nombre || u.name_user || u.nombre_completo || u.nombre_usr || '',
})

async function obtenerUsuarios () {
  loadingUsuarios.value = true
  errorUsuarios.value = ''
  try {
    const { data } = await apiAxios.get(
      '/servicio/leanglobal/obtenerUsuarios'
    )

    const lista = Array.isArray(data) ? data : []

    usuarios.value = lista
      .map(mapUsuario)
      .sort((a, b) => Number(b.id_user) - Number(a.id_user))

  } catch (error) {
    console.error('❌ Error al obtener usuarios:', error)
    errorUsuarios.value = 'No se pudieron cargar los usuarios.'
  } finally {
    loadingUsuarios.value = false
  }
}

onMounted(() => {
  obtenerUsuarios()
})

// Filtrado por rut / correo / nombre
const usuariosFiltrados = computed(() => {
  if (!filtro.value) return usuarios.value

  const f = filtro.value.toLowerCase().trim()

  return usuarios.value.filter(u =>
    (u.rut || '').toLowerCase().includes(f) ||
    (u.correo || '').toLowerCase().includes(f) ||
    (u.nombre || '').toLowerCase().includes(f)
  )
})

// Agregamos un campo "nombreCompleto" para mostrar bonito en el select
watch(
  usuarios,
  (lista) => {
    lista.forEach(u => {
      u.nombreCompleto = `${u.rut || '—'} - ${u.correo || '—'} - ${u.nombre || 'Sin nombre'}`
    })
  },
  { immediate: true }
)

// Más adelante aquí mismo puedes ver el usuarioSeleccionado
// y disparar una petición para cargar sus documentos.
</script>

<style scoped>
/* Ajustes suaves para que se vea ordenado */
</style>
