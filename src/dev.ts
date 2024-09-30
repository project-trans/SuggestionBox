import { createApp } from 'vue'

import App from './App.vue'
import '@unocss/reset/tailwind.css'

import 'virtual:uno.css'

createApp(App, { sendText: '发送', targetUrl: '/api/v1/suggestion' }).mount(
  '#app',
)

export default App
