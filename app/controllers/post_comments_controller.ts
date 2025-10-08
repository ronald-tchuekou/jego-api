import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import PostCommentService from '#services/post_comment_service'
import { createPostValidator } from '#validators/post_comment'

@inject()
export default class PostCommentsController {
  constructor(protected postCommentService: PostCommentService) {}

  async getPostComments({ request, response }: HttpContext) {
    try {
      const postId = request.param('postId')
      const { page = 1, limit = 5 } = request.qs()

      const postComment = await this.postCommentService.getPostComments(postId, page, limit)
      return response.ok({ data: postComment })
    } catch (error) {
      logger.error('Error on getting user comments: ', JSON.stringify(error, null, 2))
      return response.badRequest({
        message: 'Une erreur est survenue lors de la récupération des commentaires.',
        error: error.message,
      })
    }
  }

  async store({ request, auth, response }: HttpContext) {
    try {
      const postId = request.param('postId')
      const user = auth.getUserOrFail()
      const { comment } = await request.validateUsing(createPostValidator)

      const postComment = await this.postCommentService.create({
        postId,
        userId: user.id,
        comment,
      })

      return response.created({ data: postComment })
    } catch (error) {
      logger.error('Error on creating postComment: ' + error)
      return response.badRequest({
        message: 'Une erreur est survenue lors de la création du commentaire.',
        error: error.message,
      })
    }
  }

  async update({ request, response }: HttpContext) {
    try {
      const id = request.param('id')
      const { comment } = await request.validateUsing(createPostValidator)

      const postComment = await this.postCommentService.update(id, {
        comment,
      })

      return response.created({ data: postComment })
    } catch (error) {
      logger.error('Error on updating postComment: ' + error)
      return response.badRequest({
        message: 'Une erreur est survenue lors de la mise à jour du commentaire.',
        error: error.message,
      })
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      const postCommentId = params.id
      await this.postCommentService.delete(postCommentId)
      return response.ok({ message: 'Commentaire supprimé avec succès' })
    } catch (error) {
      logger.error('Error on deleting comment: ', JSON.stringify(error, null, 2))
      return response.badRequest({
        message: 'Une erreur est survenue lors de la suppression du comment.',
        error: error.message,
      })
    }
  }
}
