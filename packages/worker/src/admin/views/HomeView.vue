<script setup lang="ts">
import ky from 'ky'
import { RouterLink } from 'vue-router'
import Pagination from '@/components/Pagination.vue'
import { useTokens } from '@/composables/auth'
import { useSuggestions } from '@/composables/suggestion'
import { STATUS_MAP } from '@/utils'

const { data: tickets } = await useSuggestions()

const styles = defineStyleX({
  clamp: {
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
})

const { tokens } = useTokens()

function handleGC() {
  ky.delete('/api/v1/admin/images/gc', {
    headers: {
      Authorization: `Bearer ${tokens.value!.access_token}`,
    },
  })
}
</script>

<template>
  <main>
    <button @click.prevent="handleGC">
      GC cached images
    </button>
    <Pagination v-if="tickets" />
    <table v-if="tickets">
      <thead>
        <tr>
          <th>id</th>
          <th>内容</th>
          <th>提交时间</th>
          <th>状态</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="ticket in tickets.suggestions" :key="ticket.id">
          <td>
            <RouterLink :to="`/ticket/${ticket.id.substring(1)}`">
              {{ ticket.id }}
            </RouterLink>
          </td>
          <td v-stylex="styles.clamp">
            {{ ticket.content }}
          </td>
          <td>{{ new Date(ticket.createdAt).toISOString() }}</td>
          <td>{{ STATUS_MAP[ticket.status] }}</td>
        </tr>
      </tbody>
    </table>
    <Pagination v-if="tickets" />
  </main>
</template>
