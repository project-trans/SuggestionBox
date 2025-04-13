import antfu from '@antfu/eslint-config'

export default antfu({
  unocss: true,
  vue: true,
  formatters: { css: true, html: true },
  ignores: [
    '**/*.md',
    '**/*.yaml',
    '**/*.yml',
    '**/generated/**',
    'node_modules',
    '.yarn',
    'dist',
  ],
})
