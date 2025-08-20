import { HttpContext } from '@adonisjs/core/http'
import { unlink } from 'node:fs'

export const FILES_STORAGE_PATH = 'storage/uploads/files'

export default class FilesController {
  async uploadMultiple({ response, request }: HttpContext) {
    const files = request.files('files')

    if (!files || (files && files.length === 0)) {
      return response.badRequest({
        message: 'Pas de fichiers téléchargés.',
        error: 'No files uploaded',
      })
    }

    const filesData = []

    for (const file of files) {
      const filename = `${Date.now()}_${file.extname}.${file.extname}`
      await file.move(FILES_STORAGE_PATH, {
        name: filename,
        overwrite: true,
      })

      filesData.push({
        name: filename,
        path: `${FILES_STORAGE_PATH}/${filename}`,
      })
    }

    return response.ok({ message: 'Fichiers téléchargés avec succès.', data: filesData })
  }

  async uploadSingle({ response, request }: HttpContext) {
    const files = request.files('files')

    if (!files || (files && files.length === 0)) {
      return response.badRequest({
        message: 'Pas de fichiers téléchargés.',
        error: 'No files uploaded',
      })
    }

    const file = files[0]
    const filename = `${Date.now()}_${file.extname}.${file.extname}`
    await file.move(FILES_STORAGE_PATH, {
      name: filename,
      overwrite: true,
    })

    return response.ok(`${FILES_STORAGE_PATH}/${filename}`)
  }

  async load({ response, request }: HttpContext) {
    const { filePath } = request.qs()

    if (!filePath) {
      return response.badRequest({
        message: 'The filePath query field is required.',
        error: 'The filePath query field is required.',
      })
    }

    return response.download(filePath, true)
  }

  async revert({ response, request }: HttpContext) {
    const { filePath } = request.qs()

    if (!filePath) {
      return response.badRequest({
        message: 'The filePath query field is required.',
        error: 'The filePath query field is required.',
      })
    }

    unlink(filePath, (err) => {
      if (err) {
        return response.badRequest({
          message: "Le fichier n'a pas pu être supprimé.",
          error: 'The file could not be deleted.',
        })
      }
    })

    return response.ok({
      message: 'Fichier supprimé avec succès.',
    })
  }
}
