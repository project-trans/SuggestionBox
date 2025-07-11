import type { ENV } from './types'
import { fileTypeFromBuffer } from 'file-type'
import { Bot } from 'grammy'
import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { cors } from 'hono/cors'
import { etag } from 'hono/etag'
import { image as imageTable, ticket as ticketTable } from './db/schema'
import { decodeTicket, getImage, withDrizzle } from './middlewares'
import admin from './routes/admin'
import { getImagesID, newError500, newSuccess } from './utils'

const app = new Hono<{ Bindings: ENV }>()

app.onError((err, c) => {
  console.error(String(err))
  return c.json(newError500(), 500)
})

app.use('*', etag())

app.use('/api/*', cors())

app.get('/api', (c) => {
  return c.text('Hello, Project Trans SuggestionBox!')
})

app.get('/api/v1/image/:id', getImage, async (c) => {
  const buffer = c.get('image')
  const type = await fileTypeFromBuffer(buffer)
  if (type)
    c.header('Content-Type', type.mime)
  return new Response(buffer)
})

app.post('/api/v1/suggestion', decodeTicket, withDrizzle, async (c) => {
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

app.route('/api/v1/admin', admin)

app.onError((err, c) => {
  console.error('Error:', err)
  return c.json({ code: 500, message: 'Internal Server Error' }, 500)
})

export default app
