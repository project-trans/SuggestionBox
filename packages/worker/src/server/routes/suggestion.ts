import type { ENV } from '../types'
import { eq } from 'drizzle-orm'
import { Bot } from 'grammy'
import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { image as imageTable, ticket as ticketTable } from '../db/schema'
import { decodeTicket, withDrizzle } from '../middlewares'
import { getImagesID, newSuccess } from '../utils'

const router = new Hono<{ Bindings: ENV }>()

router.post('/', decodeTicket, withDrizzle, async (c) => {
  const { TG_BOT_TOKEN, TG_GROUP_ID } = env(c)
  if (!TG_BOT_TOKEN) {
    throw new Error('TG_BOT_TOKEN is not set')
  }
  if (!TG_GROUP_ID) {
    throw new Error('TG_GROUP_ID is not set')
  }
  const db = c.get('drizzle')
  const bot = new Bot(TG_BOT_TOKEN)

  const ticket = c.get('ticket')

  let images: string[] = []
  if (ticket.images.length) {
    const msg = await bot.api.sendMediaGroup(TG_GROUP_ID, ticket.images)
    images = getImagesID(msg)
  }
  else {
    await bot.api.sendMessage(TG_GROUP_ID, ticket.message, { parse_mode: 'HTML' })
  }
  const newTicket: typeof ticketTable.$inferInsert = {
    id: ticket.id,
    ua: ticket.ua,
    ip: ticket.ip,
    referrer: ticket.referrer,
    contact: ticket.contact,
    content: ticket.content,
  }
  const newImages: typeof imageTable.$inferInsert[] = images.map(image => ({ id: image, ticketId: ticket.id }))
  await db.insert(ticketTable).values(newTicket)
  if (newImages.length !== 0)
    await db.insert(imageTable).values(newImages)
  return c.json(newSuccess(ticket.id))
})

router.get('/:id', withDrizzle, async (c) => {
  const db = c.get('drizzle')
  const id = c.req.param('id')
  const ticket = await db.query.ticket.findFirst({ where: eq(ticketTable.id, `#${id}`), with: { images: true } })
  if (!ticket) {
    return c.json({ code: 404, message: 'Ticket not found' }, 404)
  }
  return c.json({
    code: 200,
    message: '',
    data: ticket,
  })
})

export default router
