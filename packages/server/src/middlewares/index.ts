import type { InputMediaPhoto } from 'grammy/types'
import type { ENV } from '../types'
import { PrismaD1 } from '@prisma/adapter-d1'
import { Bot, InputFile, InputMediaBuilder } from 'grammy'
import { env } from 'hono/adapter'
import { createMiddleware } from 'hono/factory'
import { PrismaClient } from '../generated/prisma'
import { getTicketId, newErrorFormat400, replaceHtmlTag } from '../utils'

interface Ticket {
  id: string
  ua: string
  ip: string
  referrer: string
  contact: string
  content: string
  images: InputMediaPhoto[]
  /** Telegram message */
  message: string
}

const IP_HEADER = 'CF-Connecting-IP'

export const decodeTicket = createMiddleware<{ Variables: { ticket: Ticket } }>(
  async (c, next) => {
    try {
      const form = await c.req.formData()

      const ticketId = getTicketId()
      const metaIP = c.req.header(IP_HEADER) || ''
      const metaReferrer = form.get('referrer') || c.req.header('Referer') || ''
      const metaUA = c.req.header('User-Agent') || ''
      const textContent = form.get('textContent') || ''
      const contactContent = form.get('contactContent') || ''

      const reqImages = form.getAll('images') as unknown as File[]
      const msgImages = await Promise.all(reqImages.map(async (image) => {
        const buffer = new Uint8Array(await image.arrayBuffer())
        const file = new InputFile(buffer, image.name)
        return InputMediaBuilder.photo(file)
      }))

      const msgs = [`<b>意见箱收到新消息</b> ${ticketId}\n`]
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

      const ticket: Ticket = {
        id: ticketId,
        ua: metaUA,
        ip: metaIP,
        referrer: metaReferrer,
        contact: contactContent,
        content: textContent,
        images: msgImages,
        message,
      }
      c.set('ticket', ticket)
    }
    catch (error) {
      // TODO log error
      console.error(error)
      return c.json(newErrorFormat400(), 400)
    }
    await next()
  },
)

export const getImage = createMiddleware<{ Bindings: ENV, Variables: { image: Uint8Array } }>(
  async (c, next) => {
    const { TG_BOT_TOKEN, DB } = env(c)
    const id = c.req.param('id')
    if (!TG_BOT_TOKEN) {
      throw new Error('TG_BOT_TOKEN is not set')
    }
    if (!DB) {
      throw new Error('DB is not binded')
    }
    if (!id)
      return c.json(newErrorFormat400('Image id is required'), 400)

    const bot = new Bot(TG_BOT_TOKEN)
    const adapter = new PrismaD1(DB)
    const prisma = new PrismaClient({ adapter })
    const image = await prisma.image.findUnique({ where: { id } })
    if (!image) {
      return c.json(newErrorFormat400('Image not found'), 404)
    }
    if (!image.content) {
      const file = await bot.api.getFile(id)
      const filePath = file.file_path
      if (!filePath) {
        return c.json(newErrorFormat400('Image not found'), 404)
      }
      const buffer = await fetch(`https://api.telegram.org/file/bot${TG_BOT_TOKEN}/${filePath}`).then(r => r.arrayBuffer())
      const content = new Uint8Array(buffer)
      await prisma.image.update({ where: { id }, data: { content, usedAt: new Date() } })
      c.set('image', content)
    }
    else {
      await prisma.image.update({ where: { id }, data: { usedAt: new Date() } })
      c.set('image', image.content)
    }
    await next()
  },
)
