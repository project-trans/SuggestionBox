<script setup lang="ts">
import ky from 'ky'
import Pagination from '@/components/Pagination.vue'
import TableRow from '@/components/TableRow.vue'
import { useTokens } from '@/composables/auth'
import { useSuggestions } from '@/composables/suggestion'
import { black } from '@/utils/colors.stylex'

const { data: tickets } = await useSuggestions()

const styles = defineStyleX({
  table: {
    display: 'grid',
    gridTemplateColumns: 'fit-content(20rem) auto fit-content(15rem) min-content',
    borderColor: black.background,
    borderWidth: '4px',
    borderStyle: 'solid',
    maxWidth: '1280px',
    margin: 'auto',
  },
  tHead: {
    backgroundColor: black.background,
    color: black.contrast,
    fontSize: '2.5rem',
    fontWeight: 'bold',
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
    <div v-if="tickets" v-stylex="styles.table">
      <div v-stylex="styles.tHead">
        ID
      </div>
      <div v-stylex="styles.tHead">
        Content
      </div>
      <div v-stylex="styles.tHead">
        Time
      </div>
      <div v-stylex="styles.tHead">
        Status
      </div>
      <TableRow
        v-for="ticket in tickets.suggestions"
        :key="ticket.id"
        :ticket="ticket"
      />
    </div>
    <Pagination v-if="tickets" />
  </main>
</template>
