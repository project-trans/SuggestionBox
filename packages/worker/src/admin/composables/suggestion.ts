import { useQuery } from '@pinia/colada'
import ky from 'ky'
import { useAuth } from './auth'

interface Ticket {
  id: string
  referrer: string
  contact: string | null
  content: string
  status: 'OPEN' | 'IN_PROGRESS' | 'REJECTED' | 'RESOLVED'
  relatedTo: string | null
  createdAt: string
  updatedAt: string
  images: {
    id: string
  }[]
}

interface TicketAdmin extends Ticket {
  ip: string
  ua: string
}

export async function useSuggestion(id: string) {
  const { data, refresh, refetch } = useQuery({
    key: ['suggestion', id],
    query: async () => {
      const res = await ky.get<{ code: number, message: string, data: Ticket }>(`/api/v1/suggestion/${id}`).json()
      return res.data
    },
    staleTime: Infinity,
  })
  if (!data.value) {
    await refresh()
  }

  return { data, refresh, refetch }
}

export async function useSuggestions(offset: number, limit: number) {
  const { data: auth } = await useAuth()
  const { data, refresh, refetch } = useQuery({
    key: ['suggestions', offset, limit],
    query: async () => {
      // Theoretically, the auth state should be checked before this function is called
      if (auth.value?.type !== 'authorized')
        throw new Error('Unauthorized')
      const res = await ky.get<{
        code: number
        message: string
        data: { total: number, suggestions: TicketAdmin[] }
      }>(
        '/api/v1/admin/suggestions',
        {
          searchParams: { offset, limit },
          headers: { Authorization: `Bearer ${auth.value.token}` },
        },
      ).json()
      return res.data
    },
    enabled: auth.value?.type === 'authorized',
  })
  if (!data.value) {
    await refresh()
  }

  return { data, refresh, refetch }
}
