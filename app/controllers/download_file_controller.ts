import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { sep } from 'node:path'

export default class DownloadFileController {
  async download({ response, request }: HttpContext) {
    const filePath = request.param('*').join(sep)
    const absolutePath = app.makePath(`storage/${filePath}`)
    const allowedDir = app.makePath('storage')

    if (!absolutePath.startsWith(allowedDir)) {
      return response.status(403).send('Forbidden')
    }

    return response.download(absolutePath, true)
  }

  // async stream({ response, request }: HttpContext) {
  //   const filePath = request.param('*').join(sep)
  //   const absolutePath = `storage/${filePath}`
  //   return response.stream(createReadStream(absolutePath), (error) => {
  //     return [error.message, 400]
  //   })
  // }

  // async streamV2({ response, request }: HttpContext) {
  //   const filePath = request.param('*').join(sep)
  //   const absolutePath = `storage/${filePath}`

  //   try {
  //     const stats = await stat(absolutePath)
  //     const fileSize = stats.size
  //     const range = request.header('range')
  //     const contentType = extname(absolutePath).replace('.', '')

  //     if (range) {
  //       // Parse range header (e.g., "bytes=0-1024")
  //       const parts = range.replace(/bytes=/, '').split('-')
  //       const start = Number.parseInt(parts[0], 10)
  //       const end = parts[1] ? Number.parseInt(parts[1], 10) : fileSize - 1

  //       const chunkSize = end - start + 1
  //       const fileStream = createReadStream(absolutePath, { start, end })

  //       response.status(206) // Partial Content
  //       response.header('Content-Range', `bytes ${start}-${end}/${fileSize}`)
  //       response.header('Accept-Ranges', 'bytes')
  //       response.header('Content-Length', chunkSize)
  //       response.type(contentType)

  //       return response.stream(fileStream)
  //     } else {
  //       // No range requested, stream entire file
  //       response.header('Content-Length', fileSize)
  //       response.header('Accept-Ranges', 'bytes')
  //       response.type(contentType)

  //       return response.stream(createReadStream(absolutePath))
  //     }
  //   } catch (error) {
  //     return response.status(404).send('File not found')
  //   }
  // }
}
