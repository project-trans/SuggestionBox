import { defineConfig, presetAttributify, presetIcons, presetUno } from 'unocss'

export default defineConfig({
  presets: [
    presetUno({
      dark: 'class',
    }),
    presetAttributify(),
    presetIcons({
      prefix: 'i-',
      warn: true,
    }),
  ],
})
