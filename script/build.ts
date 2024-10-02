import { resolve } from 'node:path'
/* eslint-disable antfu/no-top-level-await */
import vue from '@vitejs/plugin-vue'
import { presetUno } from 'unocss'
import UnoCSS from 'unocss/vite'
import { build } from 'vite'

// const generator = createGenerator(config)
// const file = await readFile('./src/App.vue', 'utf-8')
// const result = await generator.generate(file)
// const { code } = transform({
//   code: Buffer.from(result.css),
//   filename: 'style.css',
//   minify: true,
// })
// await writeFile('./dist/style.css', code)
await build({
  plugins: [vue({ features: { optionsAPI: false } }), UnoCSS()],
  build: {
    lib: {
      entry: [
        resolve(import.meta.dirname, '../src/index.ts'),
      ],
      name: 'SuggestionBox',
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'umd.cjs'}`,
    },
    rollupOptions: { external: ['vue'], output: { globals: { vue: 'Vue' } } },
  },
})

await build({
  plugins: [
    vue({ features: { customElement: true, optionsAPI: false } }),
    UnoCSS({
      mode: 'shadow-dom',
      presets: [presetUno({ dark: 'class' })],
    }),
  ],
  build: {
    emptyOutDir: false,
    lib: {
      entry: [
        resolve(import.meta.dirname, '../src/aio.ts'),
      ],
      name: 'SuggestionBox',
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'umd.cjs'}`,
    },
  },
})
