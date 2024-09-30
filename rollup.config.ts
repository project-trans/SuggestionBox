import { nodeResolve } from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'rollup'
import esbuild from 'rollup-plugin-esbuild'

const plugins = [
  replace({
    'preventAssignment': false,
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env["NODE_ENV"]': JSON.stringify('production'),
    'process.env[\'NODE_ENV\']': JSON.stringify('production'),
    '__VUE_OPTIONS_API__': false,
    '__VUE_PROD_DEVTOOLS__': false,
    '__VUE_PROD_HYDRATION_MISMATCH_DETAILS__': false,
  }),
  vue({ isProduction: true, template: { compilerOptions: { comments: false } } }),
  esbuild({ minify: true }),
  nodeResolve({
    preferBuiltins: true,
    browser: true,
  }),
]

export default defineConfig([
  {
    input: './src/index.ts',
    plugins,
    output: [
      {
        file: './dist/aio.umd.cjs',
        format: 'umd',
        name: 'PjtsSuggestionBox',
        sourcemap: true,
      },
      { file: './dist/aio.js', format: 'esm', sourcemap: true },
    ],
  },
  {
    input: './src/index.ts',
    plugins,
    output: [
      {
        file: './dist/index.umd.cjs',
        format: 'umd',
        name: 'PjtsSuggestionBox',
        globals: { vue: 'Vue' },
        sourcemap: true,
      },
      { file: './dist/index.js', format: 'esm', sourcemap: true },
    ],
    external: ['vue'],
  },
  {
    input: './src/preset.ts',
    plugins,
    output: [
      {
        file: './dist/preset.umd.cjs',
        format: 'umd',
        name: 'PjtsSuggestionBox',
        globals: { vue: 'Vue' },
        sourcemap: true,
      },
      { file: './dist/preset.js', format: 'esm', sourcemap: true },
    ],
    external: ['vue'],
  },
])
