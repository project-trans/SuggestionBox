import { relations } from 'drizzle-orm/relations'
import { image, ticket } from './schema'

export const imageRelations = relations(image, ({ one }) => ({
  ticket: one(ticket, {
    fields: [image.ticketId],
    references: [ticket.id],
  }),
}))

export const ticketRelations = relations(ticket, ({ many }) => ({
  images: many(image),
}))
