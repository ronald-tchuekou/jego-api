import { createPost, deletePost, editPost } from '#abilities/post_abilities'
import PostService from '#services/post_service'
import { storePostValidator, updatePostValidator } from '#validators/post'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

@inject()
export default class PostsController {
  constructor(protected postService: PostService) {}

  /**
   * Display a list of posts
   */
  async index({ request, response }: HttpContext) {
    try {
      const { page = 1, limit = 10, search = '', userId, status, type, category } = request.qs()

      const posts = await this.postService.getAll({
        page,
        limit,
        search,
        userId,
        status,
        type,
        category,
      })

      return response.ok(posts)
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors de la récupération des posts.',
        error: error.message,
      })
    }
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, auth, bouncer, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()

      // Check authorization - everyone can create except simple users
      await bouncer.authorize(createPost)

      const postData = await request.validateUsing(storePostValidator)
      const savedPost = await this.postService.create(postData, user)

      return response.created({ data: savedPost })
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors de la création du post.',
        error: error.message,
      })
    }
  }

  /**
   * Show individual post record
   */
  async show({ params, response }: HttpContext) {
    try {
      const post = await this.postService.findById(params.id)

      if (!post) {
        return response.notFound({
          message: 'Aucun post trouvé.',
        })
      }

      return response.ok({ data: post })
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors de la récupération du post.',
        error: error.message,
      })
    }
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, auth, bouncer, response }: HttpContext) {
    try {
      auth.getUserOrFail()
      const post = await this.postService.findById(params.id)

      if (!post) {
        return response.notFound({
          message: 'Aucun post trouvé.',
        })
      }

      // Load the post user relationship for authorization
      await post.load('user')

      // Check authorization
      await bouncer.authorize(editPost, post)

      const postData = await request.validateUsing(updatePostValidator)
      const updatedPost = await this.postService.update(params.id, postData)

      return response.ok({ data: updatedPost })
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors de la mise à jour du post.',
        error: error.message,
      })
    }
  }

  /**
   * Delete post record
   */
  async destroy({ params, bouncer, response }: HttpContext) {
    try {
      const post = await this.postService.findById(params.id)

      if (!post) {
        return response.notFound({
          message: 'Aucun post trouvé.',
        })
      }

      // Load the post user relationship for authorization
      await post.load('user')

      // Check authorization - only admins, company admins and company agents
      await bouncer.authorize(deletePost)

      await this.postService.delete(params.id)

      return response.ok({ message: 'Post supprimé avec succès' })
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors de la suppression du post.',
        error: error.message,
      })
    }
  }

  /**
   * Get posts by user ID
   */
  async getByUser({ params, request, response }: HttpContext) {
    try {
      const { page = 1, limit = 10, status, type, category } = request.qs()

      const posts = await this.postService.findByUserId(params.userId, {
        page,
        limit,
        status,
        type,
        category,
      })

      return response.ok(posts)
    } catch (error) {
      return response.badRequest({
        message: "Une erreur est survenue lors de la récupération des posts de l'utilisateur.",
        error: error.message,
      })
    }
  }

  /**
   * Get posts by category
   */
  async getByCategory({ params, request, response }: HttpContext) {
    try {
      const { page = 1, limit = 10, search = '', status, type } = request.qs()

      const posts = await this.postService.getByCategory(params.category, {
        page,
        limit,
        search,
        status,
        type,
      })

      return response.ok(posts)
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors de la récupération des posts par catégorie.',
        error: error.message,
      })
    }
  }

  /**
   * Get total count of posts
   */
  async getTotal({ request, response }: HttpContext) {
    try {
      const { search = '', userId, status, type, category } = request.qs()

      const total = await this.postService.getTotal({
        search,
        userId,
        status,
        type,
        category,
      })

      return response.ok({ count: total })
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors du comptage des posts.',
        error: error.message,
      })
    }
  }

  /**
   * Get posts count per day
   */
  async getPostsCountPerDay({ request, response }: HttpContext) {
    const { startDate, endDate } = request.qs()
    let sDate = startDate
    let eDate = endDate

    if (!startDate || !endDate) {
      sDate = DateTime.now().startOf('month').toFormat('yyyy-MM-dd')
      eDate = DateTime.now().endOf('month').toFormat('yyyy-MM-dd')
    }

    const postsCountPerDay = await this.postService.getPostCountPerDay(sDate, eDate)

    return response.ok({ data: postsCountPerDay, startDate: sDate, endDate: eDate })
  }
}
