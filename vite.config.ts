import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';
import UnoCSS from 'unocss/vite';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), UnoCSS()],
  build: {
    lib: {
      entry: [
        resolve(import.meta.dirname, 'src/index.ts'),
        resolve(import.meta.dirname, 'src/preset.ts'),
      ],
      name: 'SuggestionBox',
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'umd.cjs'}`,
    },
    rollupOptions: { external: ['vue'], output: { globals: { vue: 'Vue' } } },
  },
});
