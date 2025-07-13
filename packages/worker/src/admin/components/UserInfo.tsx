import type { PropType } from 'vue'
import type { Authorized } from '@/composables/auth'
import { defineComponent, Suspense } from 'vue'
import { useAuth } from '@/composables/auth'
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

const UserInfo = defineComponent({
  props: {
    authState: { type: Object as PropType<Authorized>, required: true },
  },
  setup: (props) => {
    return () => (
      <div>
        <h2>User Information</h2>
        <p>
          Name:
          {props.authState.user.name}
        </p>
        <p>Avatar:</p>
        <img src={props.authState.user.avatar} alt="User Avatar" />
      </div>
    )
  },
})

const Switcher = defineComponent(async () => {
  const { data: authState } = await useAuth()
  return () => {
    if (authState.value?.type === 'authorized') {
      return <UserInfo authState={authState.value} />
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
