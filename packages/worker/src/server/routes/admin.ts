import type { ENV } from '../types'
import type { VerifyGhTokenResponse } from '../utils'
import { arktypeValidator } from '@hono/arktype-validator'
import { type } from 'arktype'
import { Hono } from 'hono'
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
  count: 'string?',
  page: 'string?',
})

admin.get('/suggestions', arktypeValidator('query', getSuggestionsQuery, (res, c) => {
  if (!res.success)
    return c.json(newErrorFormat400('Invalid request format'), 400)
}), withDrizzle, async (c) => {
  const count = c.req.query('count') || '10'
  const page = c.req.query('page') || '1'
  const db = c.get('drizzle')
  const suggestions = await db.query.ticket.findMany({
    limit: Number(count),
    offset: (Number(page) - 1) * Number(count),
    orderBy: (s, { desc }) => [desc(s.createdAt)],
  })
  return c.json({
    code: 200,
    message: '',
    data: suggestions,
  })
})

export default admin
