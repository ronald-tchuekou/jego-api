import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import PostCommentResponseService from '#services/post_comment_response_service'

@inject()
export default class PostCommentResponsesController {
  constructor(protected postCommentResponseService: PostCommentResponseService) {}

  async getPostCommentResponses({ request, response }: HttpContext) {
    try {
      const postCommentId = request.param('postCommentId')
      const { page = 1, limit = 5 } = request.qs()

      const postComment = await this.postCommentResponseService.getPostCommentResponses(
        postCommentId,
        page,
        limit
      )
      return response.ok({ data: postComment })
    } catch (error) {
      logger.error('Error on getting user comment responses: ', JSON.stringify(error, null, 2))
      return response.badRequest({
        message: 'Une erreur est survenue lors de la récupération des réponses aux commentaires.',
        error: error.message,
      })
    }
  }

  async store({ request, auth, response }: HttpContext) {
    try {
      const postCommentId = request.param('postCommentId')
      const user = auth.getUserOrFail()
      const comment = request.input('comment')

      const postCommentResponse = await this.postCommentResponseService.create({
        postCommentId,
        userId: user.id,
        comment,
      })

      return response.created({ data: postCommentResponse })
    } catch (error) {
      logger.error('Error on creating postCommentResponse: ', JSON.stringify(error, null, 2))
      return response.badRequest({
        message: 'Une erreur est survenue lors de la création de la réponse au commentaire.',
        error: error.message,
      })
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      const postCommentResponseId = params.id
      await this.postCommentResponseService.delete(postCommentResponseId)
      return response.ok({ message: 'Réponse au commentaire supprimée avec succès' })
    } catch (error) {
      logger.error('Error on deleting commentResponse: ', JSON.stringify(error, null, 2))
      return response.badRequest({
        message: 'Une erreur est survenue lors de la suppression de la réponse au commentaire.',
        error: error.message,
      })
    }
  }
}
