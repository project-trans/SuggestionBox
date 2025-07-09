import type { ENV } from './types'
import { drizzle } from 'drizzle-orm/d1'
import { fileTypeFromBuffer } from 'file-type'
import { Bot } from 'grammy'
import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { cors } from 'hono/cors'
import { image as imageTable, ticket as ticketTable } from './db/schema'
import { decodeTicket, getImage } from './middlewares'
import { getImagesID, newError500, newSuccess } from './utils'

const app = new Hono<{ Bindings: ENV }>()

app.onError((err, c) => {
  console.error(String(err))
  return c.json(newError500(), 500)
})

app.get('/', (c) => {
  return c.text('Hello, Project Trans SuggestionBox!')
})

app.use('/api/*', cors())

app.get('/api/v1/image/:id', getImage, async (c) => {
  const buffer = c.get('image')
  const type = await fileTypeFromBuffer(buffer)
  return new Response(buffer, { headers: type ? { 'Content-Type': type.mime } : undefined })
})

app.post('/api/v1/suggestion', decodeTicket, async (c) => {
  const { TG_BOT_TOKEN, TG_GROUP_ID, DB } = env(c)
  if (!TG_BOT_TOKEN) {
    throw new Error('TG_BOT_TOKEN is not set')
  }
  if (!TG_GROUP_ID) {
    throw new Error('TG_GROUP_ID is not set')
  }
  if (!DB) {
    throw new Error('DB is not binded')
  }
  const db = drizzle(DB)
  const bot = new Bot(TG_BOT_TOKEN)

  const ticket = c.get('ticket')

  try {
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
    await db.insert(ticketTable).values(newTicket)
    const newImages: typeof imageTable.$inferInsert[] = images.map(image => ({ id: image, ticketId: ticket.id }))
    await db.insert(imageTable).values(newImages)
    return c.json(newSuccess(ticket.id))
  }
  catch (error) {
    // TODO handle error
    // TODO log error
    console.error(error)
    throw error
  }
})

export default app
