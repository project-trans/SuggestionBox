<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useSuggestions } from '@/composables/suggestion'
import { STATUS_MAP } from '@/utils'

const {
  data: tickets,
  page,
  totalPages,
  prev,
  next,
  canPrev,
  canNext,
} = await useSuggestions()
</script>

<template>
  <main>
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
          <td>
            {{ ticket.content }}
          </td>
          <td>{{ new Date(ticket.createdAt).toISOString() }}</td>
          <td>{{ STATUS_MAP[ticket.status] }}</td>
        </tr>
      </tbody>
    </table>
    <button :disabled="!canPrev" @click="prev">
      上一页
    </button>
    {{ page + 1 }} / {{ totalPages }}
    <button :disabled="!canNext" @click="next">
      下一页
    </button>
  </main>
</template>
