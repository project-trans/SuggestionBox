import process from 'node:process'
import { fileURLToPath, URL } from 'node:url'
import { cloudflare } from '@cloudflare/vite-plugin'
import { stylex } from '@stylex-extend/vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import Icons from 'unplugin-icons/vite'
import { defineConfig } from 'vite'
import { analyzer } from 'vite-bundle-analyzer'
import vueDevTools from 'vite-plugin-vue-devtools'
import vueMacros from 'vue-macros/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vueMacros({
      plugins: { vue: vue(), vueJsx: vueJsx() },
      defineStyleX: true,
    }),
    vueDevTools(),
    cloudflare(),
    analyzer({
      analyzerMode: 'static',
      enabled: process.env.CI !== 'true',
    }),
    Icons({ compiler: 'vue3' }),
    stylex({ useCSSLayer: true, unstable_moduleResolution: { type: 'commonJS' } }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src/admin', import.meta.url)),
    },
  },
  server: { port: 8787 },
  build: {
    minify: true,
    // Expected, to make the source code be distributed with service.
    sourcemap: true,
  },
})
