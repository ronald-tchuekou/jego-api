import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import PostLikeService from '#services/post_like_service'

@inject()
export default class PostLikesController {
  constructor(protected postLikeService: PostLikeService) {}

  async getUserLike({ request, response }: HttpContext) {
    try {
      const userId = request.param('userId')
      const postId = request.param('postId')
      const postLike = await this.postLikeService.getUserLike(userId, postId)
      return response.ok({ data: postLike })
    } catch (error) {
      logger.error('Error on getting user like: ', JSON.stringify(error, null, 2))
      return response.badRequest({
        message: 'Une erreur est survenue lors de la récupération du like.',
        error: error.message,
      })
    }
  }

  async store({ request, auth, response }: HttpContext) {
    try {
      const postId = request.param('postId')
      const user = auth.getUserOrFail()

      const postLike = await this.postLikeService.create({
        postId,
        userId: user.id,
      })

      return response.created({ data: postLike })
    } catch (error) {
      logger.error('Error on creating postLike: ', JSON.stringify(error, null, 2))
      return response.badRequest({
        message: 'Une erreur est survenue lors de la création du like.',
        error: error.message,
      })
    }
  }

  async destroy({ request, response, auth }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const postId = request.param('postId')
      await this.postLikeService.delete(postId, user.id)
      return response.ok({ message: 'Like supprimé avec succès' })
    } catch (error) {
      logger.error('Error on deleting like: ', JSON.stringify(error, null, 2))
      return response.badRequest({
        message: 'Une erreur est survenue lors de la suppression du like.',
        error: error.message,
      })
    }
  }
}
