import type { GhAuthResponse } from '../../server/routes/auth'
import type { VerifyGhTokenResponse } from '../../server/utils'
import { useQuery } from '@pinia/colada'
import { StorageSerializers, useLocalStorage } from '@vueuse/core'
import ky from 'ky'
import { watch } from 'vue'

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

export async function useAuth<T extends AuthState>() {
  const { tokens, clear: clearTokens } = useTokens()
  const { data, refresh, refetch } = useQuery({
    key: ['auth'],
    query: (async () => {
      if (!tokens.value) {
        const newState: Unauthorized = {
          type: 'unauthorized',
          actions: ['login'],
        }
        return newState
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
        const { data } = res
        const newState: Authorized = {
          type: 'authorized',
          actions: ['logout', 'token expired'],
          user: {
            name: data.user.name,
            avatar: data.user.avatar,
          },
          membership: data.membership,
          token: tokens.value.access_token,
          refreshToken: tokens.value.refresh_token,
          expiresAt: tokens.value.expires_at,
          refreshExpiresAt: tokens.value.refresh_expires_at,
        }
        return newState
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
      catch (error) {
        const newState: Refreshing = {
          type: 'refreshing',
          actions: ['success', 'refresh token expired'],
          refreshToken: tokens.value.refresh_token,
          refreshExpiresAt: tokens.value.refresh_expires_at,
        }
        return newState
      }
    }) as () => Promise<T>,
  })

  if (!data.value) {
    await refresh()
  }

  watch(() => data.value, (value) => {
    if (!value || value.type === 'unauthorized')
      return
    if (Date.now() > value.refreshExpiresAt) {
      clearTokens()
    }
  })

  watch(() => tokens.value, () => {
    refetch()
  })
  return { data, refresh, refetch }
}
