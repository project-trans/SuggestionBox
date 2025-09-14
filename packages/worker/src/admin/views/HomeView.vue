<script setup lang="ts">
import ky from 'ky'
import Pagination from '@/components/Pagination.vue'
import TableRow from '@/components/TableRow.vue'
import { useTokens } from '@/composables/auth'
import { useSuggestions } from '@/composables/suggestion'

const { data: tickets } = await useSuggestions()

const styles = defineStyleX({
  table: {
    display: 'grid',
    gridTemplateColumns: 'fit-content(20rem) auto fit-content(15rem) min-content',
    borderColor: 'black',
    borderWidth: '4px',
    borderStyle: 'solid',
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
    <div v-if="tickets" v-stylex="styles.table">
      <div v-stylex="styles.tHead">
        id
      </div>
      <div v-stylex="styles.tHead">
        内容
      </div>
      <div v-stylex="styles.tHead">
        提交时间
      </div>
      <div v-stylex="styles.tHead">
        状态
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
