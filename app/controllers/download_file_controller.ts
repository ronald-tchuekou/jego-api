import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { Logger } from '@adonisjs/core/logger'
import app from '@adonisjs/core/services/app'
import { sep } from 'node:path'

export default class DownloadFileController {
  @inject()
  async download({ response, request }: HttpContext, logger: Logger) {
    const filePath = request.param('*').join(sep)
    const absolutePath = app.makePath(`storage/uploads/${filePath}`)
    logger.info(`Downloading file: ${absolutePath}`)
    return response.download(absolutePath, true)
  }
}
