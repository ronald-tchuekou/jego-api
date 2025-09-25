import { createUserCV, deleteUserCV, readUserCV, updateUserCV } from '#abilities/user_cv_abilities'
import UserCVService from '#services/user_cv_service'
import { storeUserCVValidator, updateUserCVValidator } from '#validators/user_cv'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class UserCVsController {
  constructor(protected userCVService: UserCVService) {}

  /**
   * Display a list of user CVs
   */
  async index({ request, response, auth }: HttpContext) {
    try {
      const { page = 1, limit = 10, search = '', userId } = request.qs()

      // If no userId is provided, use the authenticated user's ID
      const currentUser = auth.getUserOrFail()
      const targetUserId = userId || currentUser.id

      const userCVs = await this.userCVService.getUserCVs({
        userId: targetUserId,
        page,
        limit,
        search,
      })

      return response.ok(userCVs)
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors de la récupération des CVs.',
        error: error.message,
      })
    }
  }

  /**
   * Handle form submission for the creation action
   */
  async store({ request, response, auth, bouncer }: HttpContext) {
    try {
      const user = auth.getUserOrFail()

      // Check authorization
      await bouncer.authorize(createUserCV)

      const userCVData = await request.validateUsing(storeUserCVValidator)
      const savedUserCV = await this.userCVService.create(userCVData, user)

      return response.created({ data: savedUserCV })
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors de la création du CV.',
        error: error.message,
      })
    }
  }

  /**
   * Show individual user CV record
   */
  async show({ params, response, bouncer }: HttpContext) {
    try {
      const userCV = await this.userCVService.findById(params.id)

      if (!userCV) {
        return response.notFound({
          message: 'Aucun CV trouvé.',
        })
      }

      // Check authorization
      await bouncer.authorize(readUserCV, userCV)

      return response.ok({ data: userCV })
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors de la récupération du CV.',
        error: error.message,
      })
    }
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, response, bouncer }: HttpContext) {
    try {
      const userCV = await this.userCVService.findById(params.id)

      if (!userCV) {
        return response.notFound({
          message: 'Aucun CV trouvé.',
        })
      }

      // Check authorization
      await bouncer.authorize(updateUserCV, userCV)

      const userCVData = await request.validateUsing(updateUserCVValidator)
      const updatedUserCV = await this.userCVService.update(params.id, userCVData)

      return response.ok({ data: updatedUserCV })
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors de la mise à jour du CV.',
        error: error.message,
      })
    }
  }

  /**
   * Delete user CV record
   */
  async destroy({ params, response, bouncer }: HttpContext) {
    try {
      const userCV = await this.userCVService.findById(params.id)

      if (!userCV) {
        return response.notFound({
          message: 'Aucun CV trouvé.',
        })
      }

      // Check authorization
      await bouncer.authorize(deleteUserCV, userCV)

      await this.userCVService.delete(params.id)

      return response.ok({ message: 'CV supprimé avec succès' })
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors de la suppression du CV.',
        error: error.message,
      })
    }
  }

  /**
   * Get user CVs by user ID
   */
  async getByUser({ params, request, response }: HttpContext) {
    try {
      const { page = 1, limit = 10, search = '' } = request.qs()

      const userCVs = await this.userCVService.findByUserId(params.userId, {
        page,
        limit,
        search,
      })

      return response.ok(userCVs)
    } catch (error) {
      return response.badRequest({
        message: "Une erreur est survenue lors de la récupération des CVs de l'utilisateur.",
        error: error.message,
      })
    }
  }

  /**
   * Get total count of user CVs
   */
  async getTotal({ request, response, auth }: HttpContext) {
    try {
      const { userId } = request.qs()

      // If no userId is provided, use the authenticated user's ID
      const currentUser = auth.getUserOrFail()
      const targetUserId = userId || currentUser.id

      const total = await this.userCVService.getTotal(targetUserId)

      return response.ok({ count: total })
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors du comptage des CVs.',
        error: error.message,
      })
    }
  }
}
