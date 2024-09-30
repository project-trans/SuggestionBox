import { Buffer } from 'node:buffer'
/* eslint-disable antfu/no-top-level-await */
import { readFile, writeFile } from 'node:fs/promises'
import { transform } from 'lightningcss'
import { createGenerator } from 'unocss'
import config from '../uno.config'

const generator = createGenerator(config)
const file = await readFile('./src/App.vue', 'utf-8')
const result = await generator.generate(file)
const { code } = transform({
  code: Buffer.from(result.css),
  filename: 'style.css',
  minify: true,
})
await writeFile('./dist/style.css', code)
