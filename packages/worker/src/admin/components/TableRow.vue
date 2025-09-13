<script setup lang="ts">
import type { TicketAdmin } from '@/composables/suggestion'
import {
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from 'reka-ui'
import MaterialSymbolsArrowCircleRightOutline from '~icons/material-symbols/arrow-circle-right-outline'
import MaterialSymbolsCancelOutline from '~icons/material-symbols/cancel-outline'
import MaterialSymbolsCheckCircleOutline from '~icons/material-symbols/check-circle-outline'
import MaterialSymbolsCircleOutline from '~icons/material-symbols/circle-outline'
import { STATUS_MAP } from '@/utils'
import { brown, gray, green } from '@/utils/colors.stylex'

const props = defineProps<{ ticket: TicketAdmin }>()

const styles = defineStyleX({
  clamp: {
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
  },
  status: {
    width: '100%',
    fontSize: '1.2rem',
    fontWeight: 700,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusOpen: {
    backgroundColor: gray[9],
    color: gray[1],
  },
  statusInProcess: {
    backgroundColor: brown[7],
    color: gray[1],
  },
  statusRejected: {
    backgroundColor: gray[5],
    color: '#FEF3DE',
  },
  statusResolved: {
    backgroundColor: green[6],
    color: gray[1],
  },
  selectItemText: {
    justifyContent: 'flex-start',
  },
})
</script>

<template>
  <tr>
    <td>
      <RouterLink :to="`/ticket/${ticket.id.substring(1)}`">
        {{ props.ticket.id }}
      </RouterLink>
    </td>
    <td v-stylex="styles.clamp">
      {{ props.ticket.content }}
    </td>
    <td>{{ props.ticket.createdAt }}</td>
    <td :title="STATUS_MAP[props.ticket.status]">
      <SelectRoot :model-value="props.ticket.status">
        <SelectTrigger
          as="div"
        >
          <SelectValue
            v-slot="{ modelValue }" v-stylex="(
              styles.status,
              props.ticket.status === 'OPEN' && styles.statusOpen,
              props.ticket.status === 'IN_PROGRESS' && styles.statusInProcess,
              props.ticket.status === 'REJECTED' && styles.statusRejected,
              props.ticket.status === 'RESOLVED' && styles.statusResolved
            )"
          >
            <MaterialSymbolsCircleOutline v-if="modelValue === 'OPEN'" />
            <MaterialSymbolsArrowCircleRightOutline v-else-if="modelValue === 'IN_PROGRESS'" />
            <MaterialSymbolsCancelOutline v-else-if="modelValue === 'REJECTED'" />
            <MaterialSymbolsCheckCircleOutline v-else-if="modelValue === 'RESOLVED'" />
          </SelectValue>
        </SelectTrigger>
        <SelectPortal>
          <SelectContent style="flex-direction: row;">
            <SelectViewport>
              <SelectItem
                v-for="status in Object.keys(STATUS_MAP) as (keyof typeof STATUS_MAP)[]"
                :key="status"
                :value="status"
              >
                <SelectItemText
                  v-stylex="(
                    styles.status,
                    styles.selectItemText,
                    status === 'OPEN' && styles.statusOpen,
                    status === 'IN_PROGRESS' && styles.statusInProcess,
                    status === 'REJECTED' && styles.statusRejected,
                    status === 'RESOLVED' && styles.statusResolved
                  )"
                >
                  <MaterialSymbolsCircleOutline v-if="status === 'OPEN'" />
                  <MaterialSymbolsArrowCircleRightOutline v-else-if="status === 'IN_PROGRESS'" />
                  <MaterialSymbolsCancelOutline v-else-if="status === 'REJECTED'" />
                  <MaterialSymbolsCheckCircleOutline v-else-if="status === 'RESOLVED'" />
                  {{ STATUS_MAP[status] }}
                </SelectItemText>
              </SelectItem>
            </SelectViewport>
          </SelectContent>
        </SelectPortal>
      </SelectRoot>
    </td>
  </tr>
</template>
