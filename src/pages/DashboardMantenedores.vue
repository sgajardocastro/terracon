<!-- src/views/DashboardMantenedores.vue -->
<template>
  <DashboardLayout>
    <v-container
      fluid
      class="pa-2"
    >
      <v-card
        elevation="10"
        rounded="lg"
      >
        <!-- Header -->
        <v-card-title class="d-flex align-center justify-space-between flex-wrap ga-2">
          <div class="d-flex align-center ga-2">
            <v-icon icon="mdi-cog-outline" />
            <div class="text-h6">
              Mantenedores
            </div>
          </div>

          <v-text-field
            v-model="search"
            label="Buscar (global)"
            density="compact"
            variant="outlined"
            hide-details
            clearable
            prepend-inner-icon="mdi-magnify"
            style="max-width: 320px;"
          />
        </v-card-title>

        <v-divider />

        <!-- Tabs -->
        <v-tabs
          v-model="tab"
          show-arrows
          class="px-2"
          density="compact"
        >
          <v-tab value="usuarios">
            <v-icon
              start
              icon="mdi-account-multiple-outline"
            />
            Usuarios
          </v-tab>

          <v-tab value="proyectos">
            <v-icon
              start
              icon="mdi-briefcase-outline"
            />
            Proyectos
          </v-tab>

          <v-tab value="equipos">
            <v-icon
              start
              icon="mdi-account-group-outline"
            />
            Equipos
          </v-tab>

          <v-tab value="roles">
            <v-icon
              start
              icon="mdi-shield-account-outline"
            />
            Roles
          </v-tab>
          <v-tab value="enrolamiento">
            <v-icon
              start
              icon="mdi-account-plus-outline"
            />
            Enrolamiento
          </v-tab>
        </v-tabs>

        <v-divider />

        <!-- Content -->
        <v-card-text class="pa-2">
          <v-window
            v-model="tab"
            class="mt-2"
          >
            <v-window-item value="usuarios">
              <keep-alive>
                <MantenedorUsuarios
                  :search="search"
                  :refresh-key="refreshKey.usuarios"
                  @refresh="refresh('usuarios')"
                />
              </keep-alive>
            </v-window-item>

            <v-window-item value="proyectos">
              <keep-alive>
                <MantenedorProyectos
                  :search="search"
                  :refresh-key="refreshKey.proyectos"
                  @refresh="refresh('proyectos')"
                  @go-equipos="goEquipos"
                />
              </keep-alive>
            </v-window-item>

            <v-window-item value="equipos">
              <keep-alive>
                <MantenedorEquipos
                  :search="search"
                  :refresh-key="refreshKey.equipos"
                  :selected-project-id="equiposContext.projectId"
                  @refresh="refresh('equipos')"
                />
              </keep-alive>
            </v-window-item>

            <v-window-item value="roles">
              <keep-alive>
                <MantenedorRoles
                  :search="search"
                  :refresh-key="refreshKey.roles"
                  @refresh="refresh('roles')"
                />
              </keep-alive>
            </v-window-item>

            <v-window-item value="enrolamiento">
              <keep-alive>
                <MantenedorEnrolamiento
                  :search="search"
                  :refresh-key="refreshKey.enrolamiento"
                  @refresh="refresh('enrolamiento')"
                />
              </keep-alive>
            </v-window-item>
          </v-window>
        </v-card-text>
      </v-card>
    </v-container>
  </DashboardLayout>
</template>

<script setup>
import { reactive, ref } from 'vue'
import DashboardLayout from '../layouts/dashboard.vue'

import MantenedorUsuarios from '../components/mantenedores/MantenedorUsuarios.vue'
import MantenedorProyectos from '../components/mantenedores/MantenedorProyectos.vue'
import MantenedorEquipos from '../components/mantenedores/MantenedorEquipos.vue'
import MantenedorRoles from '../components/mantenedores/MantenedorRoles.vue'
import MantenedorEnrolamiento from '../components/mantenedores/MantenedorEnrolamiento.vue'

const tab = ref('usuarios')
const search = ref('')

const refreshKey = reactive({
  usuarios: 0,
  proyectos: 0,
  equipos: 0,
  roles: 0,
  enrolamiento: 0,
})

const equiposContext = reactive({
  projectId: null,
})

function refresh(which) {
  if (refreshKey[which] !== undefined) refreshKey[which]++
}

/**
 * ✅ Viene desde MantenedorProyectos al apretar "EQUIPOS"
 * Espera recibir el proyecto completo o al menos { id_proyecto }
 */
function goEquipos(prj) {
  const id = Number(prj?.id_proyecto ?? prj?.id ?? 0) || null
  equiposContext.projectId = id
  tab.value = 'equipos'
  refresh('equipos') // opcional, pero ayuda si queda cacheado con keep-alive
}
</script>

<style scoped>
/* Si quieres compactar más aún */
</style>
