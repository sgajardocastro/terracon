<template>
  <div class="grupo">
    <div>Evidencia Integración Autenticación con Correo Terracon</div>
    <br>
    <v-form>
      <v-row>
        <v-col cols="2">
          <v-text-field
            v-model="username"
            density="compact"
            prepend-icon="mdi-account"
            name="login"
            label="Rut"
            type="text"
            bg-color="white"
            variant="outlined"
          />

          <v-text-field
            v-model="password"
            :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
            :type="visible ? 'text' : 'password'"
            density="compact"
            prepend-icon="mdi-lock"
            name="password"
            label="Password"
            type="password"
            bg-color="white"
            variant="outlined"
            @click:append-inner="visible = !visible"
          />

          <v-btn
            color="primary"
            @click="login()"
          >
            Autenticar Correo
          </v-btn>
        </v-col>
        <v-col cols="10">
          <div style="white-space: pre-wrap; word-break: break-all;">
            <strong>JWT Generado:</strong>
            {{ JWT }}
          </div>
        </v-col>
      </v-row>
    </v-form>
  </div>
</template>
<script setup>
import { ref } from 'vue';
import apiAxios from '@/services/api';
import { useRouter } from 'vue-router';

const username = ref('');
const password = ref('');
const router = useRouter();
const JWT = ref('');
const visible = ref(false);

function login() {
  JWT.value = '';
  axios.post('/auth/login', {
    rut: username.value,
    password: password.value,
  })
  .then(function (response) {
    console.log(response);
    localStorage.setItem('token', response.data.token);
    JWT.value = response.data.token;
  })
  .catch(function (error) {
    console.log(error);
    console.error(error.response);
  });
}
</script>
<style scoped>
.contenedor-form {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.card-form {
  width: 50%;
}
.grupo {
  margin: 5px;
  padding: 5px;
  border-radius: 5px;
  background-color: #eaeded;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
              0 1px 5px 0 rgba(0, 0, 0, 0.12),
              0 3px 1px -2px rgba(0, 0, 0, 0.2);
  width: 100%;
}
</style>
