import type { ENV } from '../types'
import type { VerifyGhTokenResponse } from '../utils'
import { arktypeValidator } from '@hono/arktype-validator'
import { type } from 'arktype'
import { lt, sql, count as sqlCount } from 'drizzle-orm'
import { Hono } from 'hono'
import { image, ticket } from '../db/schema'
import { withDrizzle } from '../middlewares'
import { protectWithAuthorization } from '../middlewares/authorization'
import { newErrorFormat400 } from '../utils'

const admin = new Hono<{
  Bindings: ENV
  Variables: {
    auth: VerifyGhTokenResponse
  }
}>()

admin.use('*', protectWithAuthorization)

admin.get('/auth_state', (c) => {
  return c.json({
    code: 200,
    message: '',
    data: c.get('auth'),
  }, 200)
})

const getSuggestionsQuery = type({
  limit: 'string?',
  offset: 'string?',
})

admin.get('/suggestions', arktypeValidator('query', getSuggestionsQuery, (res, c) => {
  if (!res.success)
    return c.json(newErrorFormat400('Invalid request format'), 400)
}), withDrizzle, async (c) => {
  const limit = c.req.query('limit') || '10'
  const offset = c.req.query('offset') || '0'
  const db = c.get('drizzle')
  const suggestionsPms = db.query.ticket.findMany({
    limit: Number(limit),
    offset: Number(offset),
    orderBy: (s, { desc }) => [desc(s.createdAt)],
  })
  const totalPms = db.select({ total: sqlCount() }).from(ticket).execute()
  const [suggestions, total] = await Promise.all([suggestionsPms, totalPms])
  return c.json({
    code: 200,
    message: '',
    data: { suggestions, total: total[0].total },
  })
})

admin.delete('/images/gc', withDrizzle, async (c) => {
  const db = c.get('drizzle')
  await db.update(image).set({ content: null, updatedAt: sql`CURRENT_TIMESTAMP` }).where(
    lt(image.usedAt, sql`datetime(CURRENT_TIMESTAMP, '-1 days')`),
  ).execute()
  c.status(204)
  return c.res
})

export default admin
