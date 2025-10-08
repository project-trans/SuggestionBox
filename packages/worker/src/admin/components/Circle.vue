<script setup lang="ts">
import { black, indigo } from '@/utils/colors.stylex'

const props = defineProps<{ color: 'black' | 'indigo' }>()
const styles = defineStyleX({
  circle: {
    inlineSize: '18.75rem',
    blockSize: '18.75rem',
    borderRadius: '50%',
  },
  black: { backgroundColor: black.background, color: black.contrast2 },
  indigo: { backgroundColor: indigo.background, color: indigo.contrast },
})
</script>

<template>
  <div v-stylex="(styles.circle, props.color === 'black' ? styles.black : styles.indigo)">
    <slot />
  </div>
</template>
