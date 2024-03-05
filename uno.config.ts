import { defineConfig, presetAttributify, presetIcons, presetUno } from 'unocss'
import unoPreset from './src/preset'

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
    unoPreset(),
  ],
})
