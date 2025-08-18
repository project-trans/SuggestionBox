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

const RefreshToken = defineComponent(async () => {
  const { data: authState } = await useAuth<Refreshing>()
  const { set: setTokens, clear: clearTokens } = useTokens()

  const handleRefresh = async () => {
    const res = await ky<{ code: 200, message: '', data: GhAuthResponse }>('/api/v1/auth/refresh_token', {
      method: 'POST',
      json: { refreshToken: authState.value!.refreshToken },
    }).json()
    setTokens(res.data)
  }

  const handleClear = () => {
    clearTokens()
  }

  handleRefresh()

  return () => (
    <>
      <span>重新登录中，如长时间无响应请</span>
      <button type="button" onClick={handleClear}>退出登录</button>
    </>
  )
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
        return <RefreshToken />
      case 'unauthorized':
        return <LoginButton />
      default:
        return <span>正在验证登录状态</span>
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
