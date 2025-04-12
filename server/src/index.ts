import type { InputMediaPhoto } from 'grammy/types'
import type { ENV } from './types'
import { PrismaD1 } from '@prisma/adapter-d1'
import { Bot, InputFile, InputMediaBuilder } from 'grammy'
import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { cors } from 'hono/cors'
import { customAlphabet } from 'nanoid'
import { PrismaClient } from './generated/prisma'

export interface Env {
  DB: D1Database
}

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890', 8)

const IP_HEADER = 'CF-Connecting-IP'

const newSuccess = (message = 'success') => ({ code: 0, message })
const newError500 = (message = 'server internal error') => ({ code: 500.001, message })
function newErrorFormat400(message = 'The data format of the request is invalid. Please check and use the correct data format.') {
  return { code: 400.001, message }
}

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
  const image = await prisma.image.findUnique({ where: { id: Number(id) } })
  if (!image) {
    return c.json(newErrorFormat400('Image not found'), 400)
  }
  const buffer = (image.content)
  return new Response(buffer)
})

app.post('/api/v1/suggestion', async (c) => {
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

  let metaUA = ''
  let metaIP = ''
  let metaReferrer = ''
  let contactContent = ''
  let textContent = ''
  const reqImages: File[] = []
  const msgImages: InputMediaPhoto[] = []

  try {
    const form = await c.req.formData()

    metaIP = c.req.header(IP_HEADER) || ''
    metaReferrer = form.get('referrer') || c.req.header('Referer') || ''
    metaUA = c.req.header('User-Agent') || ''
    textContent = form.get('textContent') || ''
    contactContent = form.get('contactContent') || ''

    reqImages.push(...(form.getAll('images') as unknown as File[]))
    for (const image of reqImages) {
      const buffer = new Uint8Array(await image.arrayBuffer())
      const tgInputFile = new InputFile(buffer, image.name)
      msgImages.push(InputMediaBuilder.photo(tgInputFile))
    }
  }
  catch (error) {
    // TODO log error
    console.error(error)
    return c.json(newErrorFormat400(), 400)
  }

  const ticketNumber = `#TN-${nanoid()}`

  try {
    const images = await Promise.all(reqImages.map(async (image) => {
      const buffer = new Uint8Array(await image.arrayBuffer())
      return buffer
    }))
    await prisma.ticket.create({
      data: {
        id: ticketNumber,
        ua: metaUA,
        ip: metaIP,
        referrer: metaReferrer,
        contact: contactContent,
        content: textContent,
        images: { create: images.map(image => ({ content: image })) },
      },
    })
  }
  // eslint-disable-next-line unused-imports/no-unused-vars
  catch (e) {}

  const msgs = [`<b>意见箱收到新消息</b> ${ticketNumber}\n`]
  msgs.push(`${replaceHtmlTag(textContent)}\n`)
  contactContent
  && msgs.push(
    `<b>联系方式</b>\n<blockquote><code>${replaceHtmlTag(
      contactContent,
    )}</code></blockquote>`,
  )
  metaReferrer
  && msgs.push(
    `<b>Referrer</b>\n<blockquote>${replaceHtmlTag(
      metaReferrer,
    )}</blockquote>`,
  )
  if (metaIP) {
    msgs.push(
      `<b>IP</b>    <i><a href="https://ip.sb/ip/${encodeURIComponent(
        metaIP,
      )}">View in Web</a></i>\n<blockquote><code>${replaceHtmlTag(
        metaIP,
      )}</code></blockquote>`,
    )
  }
  if (metaUA) {
    msgs.push(
      `<b>UA</b>    <i><a href="https://uaparser.js.org/?ua=${encodeURIComponent(
        metaUA,
      )}">View in Web</a></i>\n<pre><code>${replaceHtmlTag(
        metaUA,
      )}</code></pre>`,
    )
  }
  const message = msgs.join('\n')

  if (msgImages.length) {
    msgImages[0].caption = message
    msgImages[0].parse_mode = 'HTML'
  }

  try {
    if (msgImages.length) {
      await bot.api.sendMediaGroup(TG_GROUP_ID, msgImages)
    }
    else {
      await bot.api.sendMessage(TG_GROUP_ID, message, { parse_mode: 'HTML' })
    }
    return c.json(newSuccess(ticketNumber))
  }
  catch (error) {
    // TODO handle error
    // TODO log error
    console.error(error)
    throw error
  }
})

export default app

function replaceHtmlTag(str: string) {
  return str
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('&', '&amp;')
}
