import { createUser, deleteUser, readUsers, updateUser } from '#abilities/user_abilities'
import UserService from '#services/user_service'
import { storeUserValidator, updateUserValidator } from '#validators/user'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

export default class UserController {
  /**
   * Display a list of resource
   */
  @inject()
  async index({ response, request, bouncer }: HttpContext, userService: UserService) {
    const { search = '', page = 1, limit = 10, companyId, role, status } = request.qs()

    try {
      await bouncer.authorize(readUsers)

      const users = await userService.getUsers({ search, page, limit, companyId, role, status })

      return response.ok(users)
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors de la récupération des utilisateurs.',
        error: error.message,
      })
    }
  }

  /**
   * Handle form submission for the creation action
   */
  @inject()
  async store({ request, response, bouncer }: HttpContext, userService: UserService) {
    try {
      await bouncer.authorize(createUser)

      const userData = await request.validateUsing(storeUserValidator)
      const savedUser = await userService.create(userData)
      return response.created({ data: savedUser })
    } catch (error) {
      return response.badRequest({
        message: "Une erreur est survenue lors de la création de l'utilisateur.",
        error: error.message,
      })
    }
  }

  /**
   * Show individual record
   */
  @inject()
  async show({ params, response }: HttpContext, userService: UserService) {
    try {
      const user = await userService.findById(params.id)
      return response.ok({ data: user })
    } catch (error) {
      return response.notFound({
        message: "L'utilisateur n'a pas été trouvé.",
        error: error.message,
      })
    }
  }

  /**
   * Handle form submission for the edit action
   */
  @inject()
  async update({ params, request, response, bouncer }: HttpContext, userService: UserService) {
    try {
      await bouncer.authorize(updateUser)

      const userData = await request.validateUsing(updateUserValidator)
      const updatedUser = await userService.update(params.id, userData)
      return response.ok({ data: updatedUser })
    } catch (error) {
      return response.badRequest({
        message: "Une erreur est survenue lors de la mise à jour de l'utilisateur.",
        error: error.message,
      })
    }
  }

  @inject()
  async toggleBlockUser({ params, response, bouncer }: HttpContext, userService: UserService) {
    try {
      await bouncer.authorize(updateUser)

      const updatedUser = await userService.toggleBlockUser(params.id)
      return response.ok({ data: updatedUser })
    } catch (error) {
      return response.badRequest({
        message: "Une erreur est survenue lors de la modification du statut de l'utilisateur.",
        error: error.message,
      })
    }
  }

  /**
   * Delete record
   */
  @inject()
  async destroy({ params, response, bouncer }: HttpContext, userService: UserService) {
    try {
      await bouncer.authorize(deleteUser)

      const result = await userService.delete(params.id)

      if (!result) return response.notFound({ message: "L'utilisateur n'a pas été trouvé." })

      return response.ok({ message: "L'utilisateur a été supprimé avec succès." })
    } catch (error) {
      return response.badRequest({
        message: "Une erreur est survenue lors de la suppression de l'utilisateur.",
        error: error.message,
      })
    }
  }
}
