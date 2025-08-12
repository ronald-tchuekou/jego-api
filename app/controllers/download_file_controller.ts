import type { HttpContext } from '@adonisjs/core/http'
import { sep } from 'node:path'

export default class DownloadFileController {
  async download({ response, request }: HttpContext) {
    const filePath = request.param('*').join(sep)
    const absolutePath = `storage/uploads/${filePath}`
    return response.download(absolutePath, true)
  }
}
