<script setup lang="ts">
import { computed, onErrorCaptured, ref } from 'vue'

const error = ref<Error | null>(null)
const hasError = computed(() => Boolean(error.value))

onErrorCaptured((e) => {
  error.value = e
})
</script>

<template>
  <div v-if="hasError">
    <slot name="error" :error="error" />
  </div>
  <div v-else>
    <slot />
  </div>
</template>
