<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useSuggestion } from '@/composables/suggestion'

const { params: { id } } = useRoute()
const { data } = await useSuggestion(id as string)
</script>

<template>
  <div>
    {{ JSON.stringify(data, null, 2) }}
    <div v-html="data?.content" />
  </div>
</template>
