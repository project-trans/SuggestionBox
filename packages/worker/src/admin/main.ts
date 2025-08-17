import { PiniaColada } from '@pinia/colada'
import { createPinia } from 'pinia'

import { createApp } from 'vue'
import App from './App.vue'

import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(PiniaColada)
app.use(router)

app.mount('#app')
