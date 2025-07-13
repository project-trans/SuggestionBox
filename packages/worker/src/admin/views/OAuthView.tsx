import type { GhAuthResponse } from '../../server/routes/auth'
import ky from 'ky'
import { defineComponent, Suspense } from 'vue'
import { useRoute } from 'vue-router'
import ErrorBoundary from '@/components/ErrorBoundary.vue'
import { useTokens } from '@/composables/auth'

const OAuthViewInner = defineComponent(async () => {
  const tokens = useTokens()
  const route = useRoute()
  const { code, state } = route.query as { code: string, state: string }
  const res = await ky<{ code: 200, message: '', data: GhAuthResponse }>(
    '/api/v1/auth/get_token',
    {
      method: 'POST',
      json: { code, state },
    },
  ).json()
  tokens.value = res.data
  return () => (
    <div>
      <h1>OAuth</h1>
      <code>
        <pre>{JSON.stringify(res, null, 2)}</pre>
      </code>
    </div>
  )
})

const OAuthView = defineComponent(() => {
  return () => (
    <ErrorBoundary>
      {{
        default: () => <Suspense><OAuthViewInner /></Suspense>,
        error: () => <div>登录失败，可能是 token 已被使用</div>,
      }}
    </ErrorBoundary>
  )
})

export default OAuthView
