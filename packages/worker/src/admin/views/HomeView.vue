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
    minWidth: 0,
  },
  table: {
    borderColor: 'black',
    borderWidth: '4px',
    borderStyle: 'solid',
    borderCollapse: 'collapse',
    maxWidth: '1280px',
    margin: 'auto',
  },
  tHead: {
    backgroundColor: 'black',
    color: '#FEF3DE',
    fontSize: '1.5rem',
    textWrap: 'nowrap',
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
    <table v-if="tickets" v-stylex="styles.table">
      <thead v-stylex="styles.tHead">
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
          <td>{{ ticket.createdAt }}</td>
          <td>{{ STATUS_MAP[ticket.status] }}</td>
        </tr>
      </tbody>
    </table>
    <Pagination v-if="tickets" />
  </main>
</template>
