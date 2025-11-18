import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import PostShareService from '#services/post_share_service'

@inject()
export default class PostSharesController {
  constructor(protected postShareService: PostShareService) {}

  async getUserShare({ request, response }: HttpContext) {
    try {
      const userId = request.param('userId')
      const postId = request.param('postId')
      const postShare = await this.postShareService.getUserShare(userId, postId)
      return response.ok({ data: postShare })
    } catch (error) {
      logger.error('Error on getting user share: ', JSON.stringify(error, null, 2))
      return response.badRequest({
        message: 'Une erreur est survenue lors de la récupération du share.',
        error: error.message,
      })
    }
  }

  async store({ request, auth, response }: HttpContext) {
    try {
      const postId = request.param('postId')
      const user = auth.getUserOrFail()

      const share = await this.postShareService.getUserShare(user.id, postId)
      if (share) {
        return response.ok({ data: share })
      }

      const postShare = await this.postShareService.create({
        postId,
        userId: user.id,
      })

      return response.created({ data: postShare })
    } catch (error) {
      logger.error('Error on creating postShare: ', JSON.stringify(error, null, 2))
      return response.badRequest({
        message: 'Une erreur est survenue lors de la création du share.',
        error: error.message,
      })
    }
  }
}
