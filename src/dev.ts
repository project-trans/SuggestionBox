import { createApp } from 'vue';
import App from './App.vue';
import 'virtual:uno.css';

createApp(App, { sendText: '发送', targetURL: 'http://localhost:5173' }).mount('#app');

export default App;
