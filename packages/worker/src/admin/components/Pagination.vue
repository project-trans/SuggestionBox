<script setup lang="ts">
import { useSuggestions } from '@/composables/suggestion'

const {
  page,
  totalPages,
  prev,
  next,
  canPrev,
  canNext,
} = await useSuggestions()
</script>

<template>
  <button :disabled="!canPrev" @click="prev">
    上一页
  </button>
  {{ page + 1 }} / {{ totalPages }}
  <button :disabled="!canNext" @click="next">
    下一页
  </button>
</template>
