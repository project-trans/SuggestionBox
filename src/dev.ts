import { createApp } from 'vue';

import '@unocss/reset/tailwind.css';
import 'virtual:uno.css';

import App from './App.vue';

createApp(App, { sendText: '发送', targetUrl: 'http://localhost:8787/api/v1/suggestion' }).mount(
  '#app',
);

export default App;
