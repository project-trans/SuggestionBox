<script setup lang="ts">
import ky from 'ky'
import MaterialSymbolsChevronLeft from '~icons/material-symbols/chevron-left'
import MaterialSymbolsChevronRight from '~icons/material-symbols/chevron-right'
import Circle from '@/components/Circle.vue'
import TableRow from '@/components/TableRow.vue'
import { useTokens } from '@/composables/auth'
import { useSuggestions } from '@/composables/suggestion'
import { black, yellow } from '@/utils/colors.stylex'
import { fonts } from '@/utils/fonts.stylex'

const { data: tickets, page, totalPages, prev, next, canPrev, canNext } = await useSuggestions()

const styles = defineStyleX({
  table: {
    display: 'grid',
    gridTemplateColumns: 'fit-content(20rem) auto fit-content(15rem) min-content',
    borderColor: black.background,
    borderInlineWidth: '4px',
    borderStyle: 'solid',
    maxInlineSize: '1280px',
    marginInline: 'auto',
    marginBlockStart: '2rem',
    position: 'relative',
    zIndex: 1,
    backgroundColor: yellow.background,
  },
  tHead: {
    backgroundColor: black.background,
    color: black.contrast,
    fontSize: '2.5rem',
    fontWeight: 'bold',
    textWrap: 'nowrap',
  },
  forward: {
    position: 'absolute',
    top: '2rem',
    left: '6rem',
  },
  btn: {
    background: 'none',
    outline: 'none',
    border: 'none',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    cursor: 'pointer',
    zIndex: 1,
    fontSize: '2rem',
    fontFamily: fonts.chillDinGothic,
    fontWeight: 500,
    color: black.contrast2,
  },
  btnPrev: {
    transform: 'rotate(-12.5deg)',
    position: 'absolute',
    top: '12rem',
    left: '1.5rem',
  },
  backward: {
    position: 'relative',
    bottom: '12rem',
    left: '80%',
  },
  btnNext: {
    transform: 'rotate(12.5deg)',
    position: 'absolute',
    bottom: '12rem',
    right: '1.5rem',
  },
  pageInfo: {
    marginInline: 'auto',
    inlineSize: 'fit-content',
    backgroundColor: black.background,
    color: black.contrast2,
    fontWeight: 500,
    fontSize: '2rem',
    letterSpacing: '5%',
    marginBlockStart: '2.25rem',
    padding: '0.25rem',
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

    <div v-if="tickets">
      <Circle v-stylex="styles.forward" color="black">
        <button v-if="canPrev" v-stylex="(styles.btn, styles.btnPrev)" @click.prevent="prev">
          <MaterialSymbolsChevronLeft /> Prev
        </button>
      </Circle>
      <div v-stylex="styles.table">
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
      <div v-stylex="styles.pageInfo">
        Page {{ page + 1 }} / {{ totalPages }}
      </div>
      <Circle v-stylex="styles.backward" color="black">
        <button v-if="canNext" v-stylex="(styles.btn, styles.btnNext)" @click.prevent="next">
          Next <MaterialSymbolsChevronRight />
        </button>
      </Circle>
    </div>
  </main>
</template>
