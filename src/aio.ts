import { createApp } from 'vue'
import App from './App.vue'

function mount(props: {
  attachImageButtonText?: string
  sendButtonText?: string
  sendingButtonText?: string
  sentSuccessButtonText?: string
  sentFailedButtonText?: string
  targetUrl?: string
  textContentPlaceholder?: string
  contactContentPlaceholder?: string
}, rootContainer: string | Element) {
  createApp(App, props).mount(rootContainer)
}

export default mount
