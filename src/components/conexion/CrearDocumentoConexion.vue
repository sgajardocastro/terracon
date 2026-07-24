<template>
  <div class="pa-4 d-flex flex-column ga-4">
    <!-- Header / Actions Card -->
    <v-card
      class="surface-card pa-4"
      variant="outlined"
      style="border-color: #e2e8f0; border-radius: 12px; background-color: white;"
    >
      <div class="d-flex align-center justify-space-between flex-wrap ga-4">
        <div class="d-flex align-center">
          <div class="icon-box mr-3">
            <v-icon
              color="primary"
              icon="mdi-folder-text-outline"
            />
          </div>
          <div>
            <div class="text-subtitle-1 font-weight-bold text-primary-dark">
              Documentos Conexión
            </div>
            <div class="text-caption text-medium-emphasis">
              Gestión documental
            </div>
          </div>
        </div>

        <v-btn
          color="primary"
          class="text-none text-subtitle-2 px-6"
          height="40"
          elevation="0"
          rounded="lg"
          @click=""
        >
          <v-icon
            start
            size="18"
          >
            mdi-plus
          </v-icon>
          Ingresar documento
        </v-btn>
      </div>
    </v-card>
  </div>
</template>

<script setup>

</script>

<style scoped>
.surface-card {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02) !important;
}

.icon-box {
  width: 40px;
  height: 40px;
  background: #f1f5f9;
  /* Slate 100 */
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-primary-dark {
  color: #1e293b;
  /* Slate 800 */
}

.meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.meta-item {
  display: flex;
  flex-direction: column;
}

.meta-item--full {
  grid-column: span 2;
}

.meta-label {
  font-size: 0.7rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
}

.meta-value {
  font-size: 0.8125rem;
  color: #1e293b;
  font-weight: 500;
}

.meta-value--doc {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: #475569;
}
</style>
