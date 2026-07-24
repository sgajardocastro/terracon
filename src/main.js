/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'
import pinia from './stores/index'

// Components
import App from './App.vue'

import { VueTheMask } from 'vue-the-mask'

import ganttastic from '@infectoone/vue-ganttastic'

import Vue3GoogleLogin from 'vue3-google-login'

// Composables
import { createApp } from 'vue'

import './styles/dashboard.scss';

const app = createApp(App)

registerPlugins(app)

app.use(pinia)
app.use(ganttastic)
app.use(Vue3GoogleLogin, {
  clientId: '900336188439-v2jr120b65dcvbi5j26kst05ldl73uou.apps.googleusercontent.com',
})
app.directive('mask', VueTheMask)
app.mount('#app')
