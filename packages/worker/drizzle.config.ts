import path from 'node:path'
import process from 'node:process'
import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

const envPath = path.resolve(__dirname, '.dev.vars')

config({ path: envPath })

export default defineConfig({
  schema: './src/server/db/schema.ts',
  out: './src/server/db',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
    token: process.env.CLOUDFLARE_D1_TOKEN!,
  },
})
