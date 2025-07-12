import { defineComponent, Suspense } from 'vue'
import { useGitHubOAuthURL } from '@/composables/github'

const LoginButtonInner = defineComponent({
  setup: async () => {
    const url = await useGitHubOAuthURL()
    return () => (
      <a href={url.value} rel="noopener noreferrer">
        Login
      </a>
    )
  },
})

function LoginButton() {
  return (
    <Suspense>
      {{ default: () => <LoginButtonInner /> }}
    </Suspense>
  )
}

export default LoginButton
