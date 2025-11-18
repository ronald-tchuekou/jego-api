import { createPostMedia, deletePostMedia } from '#abilities/post_media_abilities'
import Post from '#models/post'
import PostMedia from '#models/post_media'
import PostMediaService from '#services/post_media_service'
import { storePostMediaValidator, updatePostMediaValidator } from '#validators/post_media'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class PostMediasController {
  constructor(protected postMediaService: PostMediaService) {}

  /**
   * Get all media for a specific post
   */
  async index({ params, request, response }: HttpContext) {
    try {
      const { page = 1, limit = 10 } = request.qs()

      const medias = await this.postMediaService.getPostMedias(params.postId, {
        page,
        limit,
      })

      return response.ok(medias)
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors de la récupération des médias.',
        error: error.message,
      })
    }
  }

  /**
   * Show a single media
   */
  async show({ params, response }: HttpContext) {
    try {
      const media = await this.postMediaService.getMediaById(params.id)

      if (!media) {
        return response.notFound({
          message: 'Média non trouvé.',
        })
      }

      return response.ok({ data: media })
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors de la récupération du média.',
        error: error.message,
      })
    }
  }

  /**
   * Create media for a post
   */
  async store({ params, request, auth, bouncer, response }: HttpContext) {
    try {
      auth.getUserOrFail()

      // Verify post exists and load it
      const post = await Post.findOrFail(params.postId)

      // Check authorization
      await bouncer.authorize(createPostMedia, post)

      // Validate request data
      const { medias } = await request.validateUsing(storePostMediaValidator)

      const createdMedias = await this.postMediaService.createMany(params.postId, medias)

      return response.created({ data: createdMedias })
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors de la création des médias.',
        error: error.message,
      })
    }
  }

  /**
   * Update a single media's metadata
   */
  async update({ params, request, auth, response }: HttpContext) {
    try {
      auth.getUserOrFail()

      const media = await PostMedia.findOrFail(params.id)
      await media.load('post')

      // Check if user owns the post
      if (media.post.userId !== auth.user?.id) {
        return response.forbidden({
          message: "Vous n'avez pas les permissions pour modifier ce média.",
        })
      }

      // Validate request data
      const mediaData = await request.validateUsing(updatePostMediaValidator)

      const updatedMedia = await this.postMediaService.updateMedia(params.id, mediaData)

      return response.ok({ data: updatedMedia })
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors de la mise à jour du média.',
        error: error.message,
      })
    }
  }

  /**
   * Delete a single media
   */
  async destroy({ params, auth, bouncer, response }: HttpContext) {
    try {
      auth.getUserOrFail()

      const media = await PostMedia.findOrFail(params.id)
      await media.load('post')

      // Check authorization
      await bouncer.authorize(deletePostMedia, media.post)

      await this.postMediaService.deleteMedia(params.id)

      return response.ok({ message: 'Média supprimé avec succès' })
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors de la suppression du média.',
        error: error.message,
      })
    }
  }

  /**
   * Delete all media for a post
   */
  async destroyAll({ params, auth, bouncer, response }: HttpContext) {
    try {
      auth.getUserOrFail()

      const post = await Post.findOrFail(params.postId)

      // Check authorization
      await bouncer.authorize(deletePostMedia, post)

      await this.postMediaService.deleteAllPostMedias(params.postId)

      return response.ok({ message: 'Tous les médias ont été supprimés avec succès' })
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors de la suppression des médias.',
        error: error.message,
      })
    }
  }

  /**
   * Get media count for a post
   */
  async getCount({ params, response }: HttpContext) {
    try {
      const count = await this.postMediaService.getMediaCount(params.postId)

      return response.ok({ count })
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors du comptage des médias.',
        error: error.message,
      })
    }
  }
}
