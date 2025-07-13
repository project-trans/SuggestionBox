import { useQuery } from '@pinia/colada'
import { computed } from 'vue'

export async function useGitHubOAuthURL() {
  const { data, refresh } = useQuery({
    key: ['start auth url'],
    query: async () => {
      const res = await fetch('/api/v1/auth/start_auth')
      const data: { code: number, data: { url: string } } = await res.json()
      return data
    },
    staleTime: 5000 * 60,
  })
  await refresh()
  return computed(() => data.value!.data.url)
}
