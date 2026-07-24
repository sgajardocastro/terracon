<template>
  <div class="login-wrapper">
    <!-- Left panel: the background photo -->
    <div
      class="login-left-panel"
      :style="{ backgroundImage: 'url(' + loginBgUrl + ')' }"
    >
      <div class="login-left-overlay" />
    </div>

    <!-- Right panel: the login form -->
    <div class="login-right-panel">
      <div class="login-card-content">
        <div class="login-logo-wrap">
          <img
            src="@/assets/logo.png"
            alt="Logo Terracon"
            class="login-logo"
          >
        </div>

        <h2 class="login-heading">
          Bienvenido
        </h2>
        <p class="login-subheading">
          Inicia sesión para continuar
        </p>

        <v-tabs
          v-model="loginTab"
          density="compact"
          class="login-tabs mb-5"
          show-arrows
        >
          <v-tab
            value="interno"
            class="login-tab"
          >
            <v-icon
              start
              icon="mdi-account"
              size="16"
            />
            Interno
          </v-tab>
          <v-tab
            value="externo"
            class="login-tab"
          >
            <v-icon
              start
              icon="mdi-card-account-details-outline"
              size="16"
            />
            Externo (RUT)
          </v-tab>
        </v-tabs>

        <v-window v-model="loginTab">
          <v-window-item value="interno">
            <AuthInternoTab
              :username="username"
              :password="password"
              :show-password="showPassword"
              @update:username="username = $event"
              @update:password="password = $event"
              @toggle-password="showPassword = !showPassword"
              @submit="login"
            >
              <template #google-button>
                <div ref="googleBtnRefInterno" />
              </template>
            </AuthInternoTab>
          </v-window-item>

          <v-window-item value="externo">
            <AuthExternoTab
              :rut="rut"
              :rut-hint="rutHint"
              :loading-rut="loadingRut"
              :external-email="externalEmail"
              @update:rut="rut = $event"
              @submit="continuarConRut"
            >
              <template #google-button>
                <div ref="googleBtnRefExterno" />
              </template>
            </AuthExternoTab>
          </v-window-item>
        </v-window>

        <p class="login-footer">
          v{{ version }} · © {{ new Date().getFullYear() }} Terracon · Todos los derechos reservados
        </p>
      </div>
    </div>

    <!-- Dialogs -->
    <v-dialog
      v-model="dialogMSN"
      persistent
      max-width="420"
    >
      <v-card class="pa-4">
        <div class="d-flex align-center ga-4">
          <v-progress-circular
            indeterminate
            :size="28"
          />
          <div class="text-subtitle-1">
            Procesando login MSN...
          </div>
        </div>
      </v-card>
    </v-dialog>

    <AuthGoogleDialog
      v-model="showGoogleDialog"
      :external-email="externalEmail"
      @close="closeGoogleDialog"
    >
      <template #google-button>
        <div ref="googleBtnRefExterno" />
      </template>
    </AuthGoogleDialog>
  </div>
</template>

<script setup>
import AuthInternoTab from '@/components/auth/AuthInternoTab.vue'
import AuthExternoTab from '@/components/auth/AuthExternoTab.vue'
import AuthGoogleDialog from '@/components/auth/AuthGoogleDialog.vue'
import { useAuthFlow } from '@/composables/useAuthFlow'
import loginBgUrl from '@/assets/login-bg.jpg'
import { version } from '../../../package.json'

const {
  loginTab,
  username,
  password,
  showPassword,
  rut,
  rutHint,
  loadingRut,
  externalEmail,
  showGoogleDialog,
  dialogMSN,
  googleBtnRefInterno,
  googleBtnRefExterno,
  login,
  continuarConRut,
  closeGoogleDialog,
} = useAuthFlow()
</script>

<style scoped>
.login-wrapper {
  display: flex;
  min-height: 100vh;
  width: 100vw;
  overflow: hidden;
  font-family: 'Inter', 'Roboto', sans-serif;
  background-color: #f8fafc;
}

/* Left panel: 60% width, holds the background photo */
.login-left-panel {
  flex: 0 0 60%;
  position: relative;
  background-size: cover;
  background-position: center 40%;
  display: block;
}

.login-left-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(2, 15, 40, 0.70) 0%,
    rgba(2, 40, 80, 0.45) 60%,
    rgba(2, 10, 25, 0.75) 100%
  );
}

/* Right panel: 40% width, holds the form */
.login-right-panel {
  flex: 0 0 40%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #ffffff;
  padding: 48px 40px 32px;
  overflow-y: auto;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.08);
  z-index: 1;
}

.login-card-content {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
}

.login-logo-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.login-logo {
  width: 160px;
  object-fit: contain;
}

.login-heading {
  font-size: 24px;
  font-weight: 600;
  color: #0f172a;
  text-align: center;
  margin: 0 0 6px;
  letter-spacing: -0.01em;
}

.login-subheading {
  font-size: 14px;
  font-weight: 400;
  color: #64748b;
  text-align: center;
  margin: 0 0 28px;
}

.login-tabs {
  border-radius: 8px;
  overflow: hidden;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
}

.login-tab {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.01em;
  text-transform: none;
  min-width: 0;
  flex: 1;
  color: #475569;
}

.login-footer {
  margin-top: auto;
  padding-top: 32px;
  font-size: 11px;
  font-weight: 400;
  color: #94a3b8;
  text-align: center;
}

/* Responsive adjustment */
@media (max-width: 1200px) {
  .login-left-panel {
    flex: 0 0 50%;
  }
  .login-right-panel {
    flex: 0 0 50%;
  }
}

@media (max-width: 768px) {
  .login-left-panel {
    display: none;
  }
  .login-right-panel {
    flex: 0 0 100%;
    padding: 32px 24px;
  }
}
</style>
