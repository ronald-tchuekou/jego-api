import { createUser, deleteUser, readUsers, updateUser } from '#abilities/user_abilities'
import UserService from '#services/user_service'
import { storeUserValidator, updateUserValidator } from '#validators/user'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

@inject()
export default class UserController {
  constructor(protected userService: UserService) {}

  /**
   * Get the total number of users
   */
  async getTotal({ request, response }: HttpContext) {
    const { search = '' } = request.qs()
    const total = await this.userService.getTotalUsers(search)
    return response.ok({ count: total })
  }

  /**
   * Display a list of resource
   */
  async index({ response, request, bouncer }: HttpContext) {
    const { search = '', page = 1, limit = 10, companyId, role, status } = request.qs()

    try {
      await bouncer.authorize(readUsers)

      const users = await this.userService.getUsers({
        search,
        page,
        limit,
        companyId,
        role,
        status,
      })

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
  async store({ request, response, bouncer }: HttpContext) {
    try {
      await bouncer.authorize(createUser)

      const userData = await request.validateUsing(storeUserValidator)
      const savedUser = await this.userService.create(userData)
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
  async show({ params, response }: HttpContext) {
    try {
      const user = await this.userService.findById(params.id)
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
  async update({ params, request, response, bouncer }: HttpContext) {
    try {
      await bouncer.authorize(updateUser)

      const userData = await request.validateUsing(updateUserValidator)
      const updatedUser = await this.userService.update(params.id, userData)
      return response.ok({ data: updatedUser })
    } catch (error) {
      return response.badRequest({
        message: "Une erreur est survenue lors de la mise à jour de l'utilisateur.",
        error: error.message,
      })
    }
  }

  async toggleBlockUser({ params, response, bouncer }: HttpContext) {
    try {
      await bouncer.authorize(updateUser)

      const updatedUser = await this.userService.toggleBlockUser(params.id)
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
  async destroy({ params, response, bouncer }: HttpContext) {
    try {
      await bouncer.authorize(deleteUser)

      const result = await this.userService.delete(params.id)

      if (!result) return response.notFound({ message: "L'utilisateur n'a pas été trouvé." })

      return response.ok({ message: "L'utilisateur a été supprimé avec succès." })
    } catch (error) {
      return response.badRequest({
        message: "Une erreur est survenue lors de la suppression de l'utilisateur.",
        error: error.message,
      })
    }
  }

  /**
   * Get the number of users per day
   */
  async getUserCountPerDay({ request, response }: HttpContext) {
    const { startDate, endDate } = request.qs()
    let sDate = startDate
    let eDate = endDate

    if (!startDate || !endDate) {
      sDate = DateTime.now().startOf('month').toFormat('yyyy-MM-dd')
      eDate = DateTime.now().endOf('month').toFormat('yyyy-MM-dd')
    }

    const userCountPerDay = await this.userService.getUserCountPerDay(sDate, eDate)

    return response.ok({ data: userCountPerDay, startDate: sDate, endDate: eDate })
  }
}
