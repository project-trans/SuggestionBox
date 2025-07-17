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
  const { data: authState } = await useAuth<Refreshing>()
  const { set: setTokens } = useTokens()
  const handleRefresh = async () => {
    const res = await ky<{ code: 200, message: '', data: GhAuthResponse }>('/api/v1/auth/refresh_token', {
      method: 'POST',
      json: { refreshToken: authState.value!.refreshToken },
    }).json()
    setTokens(res.data)
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
    switch (authState.value?.type) {
      case 'authorized':
        return <UserInfo />
      case 'refreshing':
        return <RefreshTokenButton />
      default:
        return <LoginButton />
    }
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
