import type { Message, PhotoSize } from 'grammy/types'
import type { Context } from 'hono'
import type { ENV } from '../types'
import { drizzle } from 'drizzle-orm/d1'
import { env } from 'hono/adapter'
import ky from 'ky'
import { customAlphabet } from 'nanoid'
import * as schema from '../db/schema'

export function getDrizzle(c: Context<{ Bindings: ENV, Variables: any }>) {
  const { DB } = env(c)
  if (!DB) {
    throw new Error('DB is not binded')
  }
  return drizzle(DB, { schema })
}

function getLargestImage(images: PhotoSize[]): PhotoSize {
  return images.reduce((largest, current) => {
    if (current.file_size && largest.file_size && (current.file_size > largest.file_size)) {
      return current
    }
    if (current.width > largest.width) {
      return current
    }
    if (current.height > largest.height) {
      return current
    }
    return largest
  })
}

export function getImagesID(messages:
(
  Message.PhotoMessage
  | Message.AudioMessage
  | Message.DocumentMessage
  | Message.VideoMessage)[]) {
  const photoMessages = messages.filter(message => 'photo' in message)
  const images = photoMessages.map(message => getLargestImage(message.photo))
  return images.map(image => image.file_id)
}

export const newSuccess = (message = 'success') => ({ code: 0, message })
export const newError500 = (message = 'server internal error') => ({ code: 500.001, message })
export function newErrorFormat400(message = 'The data format of the request is invalid. Please check and use the correct data format.') {
  return { code: 400.001, message }
}

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890', 8)

export const getTicketId = () => `#TN-${nanoid()}`

export function replaceHtmlTag(str: string) {
  return str
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('&', '&amp;')
}

export interface VerifyGhTokenResponse {
  user: {
    name: string
    avatar: string
  }
  membership: {
    role: string
  }
}

function getGhClient(token: string) {
  return ky.create({
    prefixUrl: 'https://api.github.com',
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'SuggestionBox-Backend',
      'Authorization': `Bearer ${token}`,
    },
  })
}

export async function verifyGhToken(token: string, orgName: string): Promise<{
  success: true
  data: VerifyGhTokenResponse
} | {
  success: false
  data: null
}> {
  try {
    const ghClient = getGhClient(token)
    const userRes = await ghClient('user').json<{ login: string, avatar_url: string }>()
    const membershipRes = await ghClient(`orgs/${orgName}/memberships/${userRes.login}`).json<{ role: string }>()
    return {
      success: true,
      data: {
        user: { name: userRes.login, avatar: userRes.avatar_url },
        membership: { role: membershipRes.role },
      },
    }
  }

  catch (e) {
    console.error(e)
    return { success: false, data: null }
  }
}
