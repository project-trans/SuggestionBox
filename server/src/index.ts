import type { ENV } from './types'
import { PrismaD1 } from '@prisma/adapter-d1'
import { Bot } from 'grammy'
import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { cors } from 'hono/cors'
import { PrismaClient } from './generated/prisma'
import { decodeTicket } from './middlewares/ticket'
import { getImagesID, newError500, newErrorFormat400, newSuccess } from './utils'

const app = new Hono<{ Bindings: ENV }>()

app.onError((err, c) => {
  console.error(String(err))
  return c.json(newError500(), 500)
})

app.get('/', (c) => {
  return c.text('Hello, Project Trans SuggestionBox!')
})

app.use('/api/*', cors())

app.get('/api/v1/image/:id', async (c) => {
  const { DB } = env(c)
  if (!DB) {
    throw new Error('DB is not binded')
  }
  const id = c.req.param('id')
  const adapter = new PrismaD1(DB)
  const prisma = new PrismaClient({ adapter })
  const image = await prisma.image.findUnique({ where: { id } })
  if (!image) {
    return c.json(newErrorFormat400('Image not found'), 400)
  }
  const buffer = (image.content)
  return new Response(buffer)
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
  const adapter = new PrismaD1(DB)
  const prisma = new PrismaClient({ adapter })
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
    await prisma.ticket.create({
      data: {
        id: ticket.id,
        ua: ticket.ua,
        ip: ticket.ip,
        referrer: ticket.referrer,
        contact: ticket.contact,
        content: ticket.content,
        images: { create: images.map(image => ({ id: image })) },
      },
    })
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
