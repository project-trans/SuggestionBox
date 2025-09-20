import path from 'node:path'
import process from 'node:process'
import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

const envPath = path.resolve(__dirname, '.dev.vars')
const schemaPath = path.resolve(__dirname, './src/server/db/schema.ts')

config({ path: envPath })

export default defineConfig({
  schema: schemaPath,
  out: path.resolve(schemaPath, '../migrations'),
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
    token: process.env.CLOUDFLARE_D1_TOKEN!,
  },
})
