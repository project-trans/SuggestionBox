import type { ENV } from '../types'
import type { VerifyGhTokenResponse } from '../utils'
import { env } from 'hono/adapter'
import { createMiddleware } from 'hono/factory'
import { verifyGhToken } from '../utils'

export const protectWithAuthorization = createMiddleware<{
  Bindings: ENV
  Variables: { auth: VerifyGhTokenResponse }
}>(async (c, next) => {
  const { ORG_NAME } = env(c)
  if (!ORG_NAME) {
    throw new Error('ORG_NAME is not set in environment variables')
  }
  const token = (c.req.header('Authorization'))?.replace('Bearer ', '')
  if (!token) {
    c.status(401)
    return c.json({ error: 'Unauthorized' })
  }
  const res = await verifyGhToken(token, ORG_NAME)
  if (!res.success) {
    c.status(401)
    return c.json({ error: 'Unauthorized' })
  }
  c.set('auth', res.data!)
  await next()
})
