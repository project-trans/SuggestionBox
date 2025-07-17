import { sql } from 'drizzle-orm'
import { relations } from 'drizzle-orm/relations'
import { blob, index, numeric, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const ticket = sqliteTable('Ticket', {
  id: text().primaryKey().notNull(),
  ua: text().notNull(),
  ip: text().notNull(),
  referrer: text().notNull(),
  contact: text(),
  content: text().notNull(),
  status: text({ enum: ['OPEN', 'IN_PROGRESS', 'REJECTED', 'RESOLVED'] }).default('OPEN').notNull(),
  relatedTo: text(),
  createdAt: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
}, table => [
  index('ticket_updatedAt_index').on(table.updatedAt),
  index('ticket_createdAt_index').on(table.createdAt),
  index('ticket_status_index').on(table.status),
])

export const image = sqliteTable('Image', {
  id: text().primaryKey().notNull(),
  ticketId: text().notNull().references(() => ticket.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  content: blob({ mode: 'buffer' }),
  usedAt: numeric(),
  createdAt: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
}, table => [
  index('image_ticketId_idx').on(table.ticketId),
])

export const imageRelations = relations(image, ({ one }) => ({
  ticket: one(ticket, {
    fields: [image.ticketId],
    references: [ticket.id],
  }),
}))

export const ticketRelations = relations(ticket, ({ many }) => ({
  images: many(image),
}))
