import '@unocss/reset/tailwind.css'
import './aio'

// import 'virtual:uno.css'

const e = document.createElement('suggestion-box')

const attr = document.createAttribute('target-url')
attr.value = 'http://localhost:8787/api/v1/suggestion'
e.attributes.setNamedItem(attr)

document.body.appendChild(e)

export { }
