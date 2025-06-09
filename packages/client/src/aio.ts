import { defineCustomElement, h, onUnmounted, ref } from 'vue'
import App from './App.vue'

export const SuggestionBox = defineCustomElement({
  props: {
    attachImageButtonText: String,
    sendButtonText: String,
    sendingButtonText: String,
    sentSuccessButtonText: String,
    sentFailedButtonText: String,
    textContentPlaceholder: String,
    contactContentPlaceholder: String,
    targetUrl: String,
  },
  setup: (props) => {
    const body = document.body
    const classes = ref(body.className)
    const observer = new MutationObserver(() => {
      classes.value = body.className
    })
    observer.observe(body, { attributes: true })
    onUnmounted(() => observer.disconnect())
    return () =>
      h('div', { class: classes.value }, h(App, { ...props }))
  },
})

customElements.define('suggestion-box', SuggestionBox)
