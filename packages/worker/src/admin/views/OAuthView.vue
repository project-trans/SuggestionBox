<script async setup lang="ts">
import type { GhAuthSuccess } from '../../server/routes/admin'
import { useRoute } from 'vue-router'

const route = useRoute()
const { code, state } = route.query as { code: string, state: string }
const res: GhAuthSuccess & { expires_at: number, refresh_expires_at: number } = await fetch(
  '/api/v1/admin/get_token',
  {
    method: 'POST',
    body: JSON.stringify({ code, state }),
    headers: { 'Content-Type': 'application/json' },
  },
).then(res => res.json())
</script>

<template>
  <div>
    <h1>OAuth</h1>
    <code>
      <pre>{{ JSON.stringify(res, null, 2) }}</pre>
    </code>
  </div>
</template>
