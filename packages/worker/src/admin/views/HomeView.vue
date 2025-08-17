<script setup lang="ts">
import { useSuggestions } from '@/composables/suggestion'

const { data: tickets } = await useSuggestions(0, 10)
const STATUS_MAP = {
  OPEN: '开启',
  IN_PROGRESS: '进行中',
  REJECTED: '已拒绝',
  RESOLVED: '已完成',
} as const
</script>

<template>
  <main>
    <table>
      <thead>
        <tr>
          <th>内容</th>
          <th>提交时间</th>
          <th>状态</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="ticket in tickets?.suggestions" :key="ticket.id">
          <td>{{ ticket.content }}</td>
          <td>{{ new Date(ticket.createdAt).toISOString() }}</td>
          <td>{{ STATUS_MAP[ticket.status] }}</td>
        </tr>
      </tbody>
    </table>
  </main>
</template>
