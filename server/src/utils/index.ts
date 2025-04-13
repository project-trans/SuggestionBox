import type { Message, PhotoSize } from 'grammy/types'
import { customAlphabet } from 'nanoid'

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
  Message.PhotoMessage |
  Message.AudioMessage |
  Message.DocumentMessage |
  Message.VideoMessage)[]) {
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
