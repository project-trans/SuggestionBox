import type { ENV } from '../types'
import { type } from 'arktype'
import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { sign, verify } from 'hono/jwt'
import ky from 'ky'
import { nanoid } from 'nanoid'
import { createArktypeValidator, newErrorFormat400 } from '../utils'

const auth = new Hono<{ Bindings: ENV }>()

auth.get('/start_auth', async (c) => {
  const { JWT_SECRET, GH_APP_CLIENT_ID, SERVE_URL } = env(c)
  const state = nanoid()
  const cipheredState = await sign({ state, iat: Math.floor(Date.now() / 1000) }, JWT_SECRET)
  const query = new URLSearchParams({
    client_id: GH_APP_CLIENT_ID,
    redirect_uri: new URL('/oauth', SERVE_URL).toString(),
    state: cipheredState,
  })
  return c.json({
    code: 200,
    data: {
      url: `https://github.com/login/oauth/authorize?${query.toString()}`,
    },
  })
})

const getTokenRequest = type({
  code: 'string',
  state: 'string',
})

export interface GhAuthFailure {
  error: 'bad_verification_code'
  error_description: 'The code passed is incorrect or expired.'
  error_uri: 'https://docs.github.com/apps/managing-oauth-apps/troubleshooting-oauth-app-access-token-request-errors/#bad-verification-code'
}

export interface GhAuthSuccess {
  access_token: string
  expires_in: 28800
  refresh_token: string
  refresh_token_expires_in: 15897600
  token_type: 'bearer'
  scope: ''
}

export interface GhAuthResponse extends GhAuthSuccess {
  expires_at: number
  refresh_expires_at: number
}

auth.post('/get_token', createArktypeValidator(getTokenRequest), async (c) => {
  const { JWT_SECRET, GH_APP_CLIENT_ID, GH_APP_CLIENT_SECRET } = env(c)
  const { code, state: cipheredState } = c.req.valid('json')
  const state = await verify(cipheredState, JWT_SECRET)
  if (!state.iat || state.iat < Math.floor(Date.now() / 1000) - 60 * 5) {
    return c.json(newErrorFormat400('State is invalid or expired'), 400)
  }
  const query = new URLSearchParams({
    client_id: GH_APP_CLIENT_ID,
    client_secret: GH_APP_CLIENT_SECRET,
    code,
  })
  const response: GhAuthFailure | GhAuthSuccess = await fetch(`https://github.com/login/oauth/access_token?${query.toString()}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
  }).then(res => res.json())
  if ('error' in response) {
    return c.json(newErrorFormat400(response.error_description), 400)
  }
  const data: GhAuthResponse = {
    ...response,
    expires_at: Date.now() + response.expires_in * 1000,
    refresh_expires_at: Date.now() + response.refresh_token_expires_in * 1000,
  }
  return c.json({
    code: 200,
    message: '',
    data,
  }, 200)
})

const refreshTokenRequest = type({
  refreshToken: 'string',
})

auth.post('/refresh_token', createArktypeValidator(refreshTokenRequest), async (c) => {
  const { GH_APP_CLIENT_ID, GH_APP_CLIENT_SECRET } = env(c)
  const { refreshToken } = c.req.valid('json')
  const response: GhAuthFailure | GhAuthSuccess = await ky('https://github.com/login/oauth/access_token', {
    searchParams: {
      client_id: GH_APP_CLIENT_ID,
      client_secret: GH_APP_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    },
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
  }).then(res => res.json())
  if ('error' in response) {
    return c.json(newErrorFormat400(response.error_description), 400)
  }
  const data: GhAuthResponse = {
    ...response,
    expires_at: Date.now() + response.expires_in * 1000,
    refresh_expires_at: Date.now() + response.refresh_token_expires_in * 1000,
  }
  return c.json({
    code: 200,
    message: '',
    data,
  }, 200)
})

export default auth
