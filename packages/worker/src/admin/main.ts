import { PiniaColada } from '@pinia/colada'
import { injectGlobalStyle } from '@stylex-extend/core'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'virtual:stylex.css'

injectGlobalStyle({
  'body': { margin: 0 },
  ':root': {
    backgroundColor: '#FFF6D4',
    fontFamily: 'ChillDINGothic, ui-sans-serif, system-ui, sans-serif, \'Apple Color Emoji\', \'Segoe UI Emoji\', \'Segoe UI Symbol\', \'Noto Color Emoji\'',
  },
})

const app = createApp(App)

app.use(createPinia())
app.use(PiniaColada)
app.use(router)

app.mount('#app')
