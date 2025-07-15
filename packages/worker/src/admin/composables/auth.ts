import type { ShallowRef } from 'vue'
import type { GhAuthResponse } from '../../server/routes/auth'
import type { VerifyGhTokenResponse } from '../../server/utils'
import { useQuery } from '@pinia/colada'
import { StorageSerializers, useLocalStorage } from '@vueuse/core'
import ky from 'ky'

interface StateBase {
  type: 'unauthorized' | 'authorized' | 'refreshing'
  actions: string[]
}

interface Unauthorized extends StateBase {
  type: 'unauthorized'
  actions: ['login']
}

export interface Authorized extends StateBase {
  type: 'authorized'
  actions: ['logout', 'token expired']
  user: { name: string, avatar: string }
  membership: { role: string }
  token: string
  refreshToken: string
  expiresAt: number
  refreshExpiresAt: number
}

export interface Refreshing extends StateBase {
  type: 'refreshing'
  actions: ['success', 'refresh token expired']
  refreshToken: string
  refreshExpiresAt: number
}

type AuthState = Unauthorized | Authorized | Refreshing

export function useTokens() {
  const tokens = useLocalStorage<GhAuthResponse | null>(
    'tokens',
    null,
    { serializer: StorageSerializers.object },
  )
  return {
    tokens,
    clear: () => { tokens.value = null },
    set: (data: GhAuthResponse) => { tokens.value = data },
  }
}

function createUnauthorizedState(): Unauthorized {
  return {
    type: 'unauthorized',
    actions: ['login'],
  }
}

function createAuthorizedState(data: VerifyGhTokenResponse, tokens: GhAuthResponse): Authorized {
  return {
    type: 'authorized',
    actions: ['logout', 'token expired'],
    user: {
      name: data.user.name,
      avatar: data.user.avatar,
    },
    membership: data.membership,
    token: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: tokens.expires_at,
    refreshExpiresAt: tokens.refresh_expires_at,
  }
}

function createRefreshingState(tokens: GhAuthResponse): Refreshing {
  return {
    type: 'refreshing',
    actions: ['success', 'refresh token expired'],
    refreshToken: tokens.refresh_token,
    refreshExpiresAt: tokens.refresh_expires_at,
  }
}

export async function useAuth<T extends AuthState>() {
  const { tokens, clear: clearTokens } = useTokens()

  const { data, refresh, refetch } = useQuery({
    key: () => ['auth', { token: tokens.value?.access_token, refreshToken: tokens.value?.refresh_token }],
    query: (async () => {
      if (!tokens.value) {
        return createUnauthorizedState()
      }
      try {
        const res = await ky<{ code: 200, message: '', data: VerifyGhTokenResponse }>(
          '/api/v1/admin/auth_state',
          {
            headers: {
              Authorization: `Bearer ${tokens.value.access_token}`,
            },
          },
        ).json()
        return createAuthorizedState(res.data, tokens.value)
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
      catch (error) {
        if (tokens.value.refresh_expires_at > Date.now()) {
          clearTokens()
          return createUnauthorizedState()
        }
        return createRefreshingState(tokens.value)
      }
    }) as () => Promise<T>,
  })

  if (!data.value) {
    await refresh()
  }

  return { data: data as ShallowRef<T>, refresh, refetch }
}
