import type { ENV } from './types'
import { fileTypeFromBuffer } from 'file-type'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { etag } from 'hono/etag'
import { getImage } from './middlewares'
import admin from './routes/admin'
import auth from './routes/auth'
import suggestion from './routes/suggestion'
import { newError500 } from './utils'

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

app.route('/api/v1/auth', auth)
app.route('/api/v1/admin', admin)
app.route('/api/v1/suggestion', suggestion)

app.onError((err, c) => {
  console.error('Error:', err)
  return c.json({ code: 500, message: 'Internal Server Error' }, 500)
})

export default app
