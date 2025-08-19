<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useSuggestion } from '@/composables/suggestion'
import { STATUS_MAP } from '@/utils'

const { params: { id } } = useRoute()
const { data } = await useSuggestion(id as string)
</script>

<template>
  <div v-if="data">
    <p>
      <code>{{ data.id }}</code> {{ STATUS_MAP[data.status] }}
    </p>
    <p>
      <a :href="data.referrer" target="_blank">{{ data.referrer }}</a>
    </p>
    <div v-html="data.content" />
    <p>ct {{ data.createdAt }}</p>
    <p>mt {{ data.updatedAt }}</p>
    <img v-for="image in data.images" :key="image.id" :src="`/api/v1/image/${image.id}`">
  </div>
</template>
