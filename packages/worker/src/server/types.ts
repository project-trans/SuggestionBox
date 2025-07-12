import type { D1Database } from '@cloudflare/workers-types'

// eslint-disable-next-line ts/consistent-type-definitions
export type ENV = {
  TG_BOT_TOKEN: string
  TG_GROUP_ID: string
  DB: D1Database
  GH_APP_CLIENT_ID: string
  GH_APP_CLIENT_SECRET: string
  JWT_SECRET: string
  SERVE_URL: string
}
