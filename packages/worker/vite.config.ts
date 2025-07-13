import process from 'node:process'
import { fileURLToPath, URL } from 'node:url'
import { cloudflare } from '@cloudflare/vite-plugin'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vite'
import { analyzer } from 'vite-bundle-analyzer'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    cloudflare(),
    analyzer({
      analyzerMode: 'static',
      enabled: process.env.CI !== 'true',
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src/admin', import.meta.url)),
    },
  },
  server: { port: 8787 },
  build: { minify: true },
})
