import { createApp } from 'vue';

import '@unocss/reset/tailwind.css';
import 'virtual:uno.css';

import App from './App.vue';

createApp(App, { sendText: '发送', targetURL: 'http://localhost:5173' }).mount('#app');

export default App;
