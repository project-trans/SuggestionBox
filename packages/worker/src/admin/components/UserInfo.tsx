import type { GhAuthResponse } from '../../server/routes/auth'
import type { Authorized, Refreshing } from '@/composables/auth'
import ky from 'ky'
import { defineComponent, Suspense } from 'vue'
import { useAuth, useTokens } from '@/composables/auth'
import { useGitHubOAuthURL } from '@/composables/github'

const LoginButton = defineComponent({
  setup: async () => {
    const url = await useGitHubOAuthURL()
    return () => (
      <a href={url.value} rel="noopener noreferrer">
        Login
      </a>
    )
  },
})

const RefreshTokenButton = defineComponent(async () => {
  const { data: authState, refetch } = await useAuth<Refreshing>()
  const { set: setTokens } = useTokens()
  const handleRefresh = async () => {
    const res = await ky<{ code: 200, message: '', data: GhAuthResponse }>('/api/v1/auth/refresh_token', {
      method: 'POST',
      json: { refreshToken: authState.value!.refreshToken },
    }).json()
    setTokens(res.data)
    await refetch()
  }

  return () => <button type="button" onClick={handleRefresh}>Refresh</button>
})

const UserInfo = defineComponent(async () => {
  const { data: authState } = await useAuth<Authorized>()
  const { clear: clearTokens } = useTokens()
  return () => (
    <>
      <span>
        {authState.value!.user.name}
      </span>
      <button type="button" onClick={() => clearTokens()}>
        Logout
      </button>
    </>
  )
})

const Switcher = defineComponent(async () => {
  const { data: authState } = await useAuth()
  return () => {
    if (authState.value?.type === 'authorized') {
      return <UserInfo />
    }
    if (authState.value?.type === 'refreshing') {
      return <RefreshTokenButton />
    }
    return <LoginButton />
  }
})

const Wrapper = defineComponent(() => () => {
  return (
    <Suspense>
      {{ default: () => <Switcher /> }}
    </Suspense>
  )
})

export default Wrapper
