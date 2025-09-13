import type { AuthState } from './auth'
import { defineQueryOptions, useQuery, useQueryCache } from '@pinia/colada'
import { createSharedComposable } from '@vueuse/core'
import ky from 'ky'
import { computed, ref, watchEffect } from 'vue'
import { useAuth } from './auth'

interface Ticket {
  id: string
  referrer: string
  content: string
  status: 'OPEN' | 'IN_PROGRESS' | 'REJECTED' | 'RESOLVED'
  relatedTo: string | null
  createdAt: string
  updatedAt: string
  images: {
    id: string
  }[]
}

export interface TicketAdmin extends Ticket {
  ip: string
  ua: string
}

export async function useSuggestion(id: string) {
  const { data, refresh, refetch } = useQuery({
    key: ['suggestion', id],
    query: async (ctx) => {
      const res = await ky.get<{ code: number, message: string, data: Ticket }>(
        `/api/v1/suggestion/${id}`,
        { signal: ctx.signal },
      ).json()
      return res.data
    },
    staleTime: Infinity,
  })
  if (!data.value) {
    await refresh()
  }

  return { data, refresh, refetch }
}

function getSuggestionQk(offset: number, limit: number, token: string) {
  return ['suggestions', offset, limit, token] as const
}

const suggestionQuery = defineQueryOptions(
  (param: { page: number, limit: number, auth?: AuthState }) => {
    const { page, limit, auth } = param
    const offset = page * limit
    const token = auth?.type === 'authorized' ? auth.token : 'unauthorized'
    return {
      key: getSuggestionQk(offset, limit, token),
      query: async (ctx) => {
      // Theoretically, the auth state should be checked before this function is called
        const res = await ky.get<{
          code: number
          message: string
          data: { total: number, suggestions: TicketAdmin[] }
        }>(
          '/api/v1/admin/suggestions',
          {
            searchParams: { offset, limit },
            headers: { Authorization: `Bearer ${token}` },
            signal: ctx.signal,
          },
        ).json()
        return res.data
      },
      enabled: auth?.type === 'authorized',
    }
  },
)

async function useSuggestionsInner() {
  const limit = 10
  const page = ref(0)
  const { data: auth } = await useAuth()
  const { data, refresh, refetch } = useQuery(suggestionQuery, () => ({ page: page.value, limit, auth: auth.value }))
  if (!data.value) {
    await refresh()
  }

  const prev = () => {
    page.value -= 1
  }
  const next = () => {
    page.value += 1
  }

  const totalPages = computed(() => {
    if (!data.value)
      return 0
    return Math.ceil(data.value.total / limit)
  })

  const canPrev = computed(() => page.value > 0)
  const canNext = computed(() => page.value < totalPages.value - 1)
  const queryCache = useQueryCache()
  watchEffect(() => {
    if (!auth.value || auth.value.type !== 'authorized')
      return
    if (canPrev.value) {
      queryCache.refresh(
        queryCache.ensure(suggestionQuery({
          page: page.value - 1,
          limit,
          auth: auth.value,
        })),
      )
    }
    if (canNext.value) {
      queryCache.refresh(
        queryCache.ensure(suggestionQuery({
          page: page.value + 1,
          limit,
          auth: auth.value,
        })),
      )
    }
  })

  return { data, refresh, refetch, page, prev, next, totalPages, canPrev, canNext }
}

export const useSuggestions = createSharedComposable(useSuggestionsInner)
