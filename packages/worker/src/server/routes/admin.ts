import type { ENV } from '../types'
import type { VerifyGhTokenResponse } from '../utils'
import { Hono } from 'hono'
import { protectWithAuthorization } from '../middlewares/authorization'

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

export default admin
