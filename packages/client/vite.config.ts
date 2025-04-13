import process from 'node:process'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: process.env.NODE_ENV === 'development'
    ? [
        vue({ features: { customElement: true, optionsAPI: false } }),
        UnoCSS({
          mode: 'shadow-dom',
        }),
      ]
    : [],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
  build: {
    cssMinify: 'lightningcss',
  },
})
