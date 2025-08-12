import UserService from '#services/user_service'
import { getUsersValidator, storeUserValidator, updateUserValidator } from '#validators/user'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

export default class UserController {
  /**
   * Display a list of resource
   */
  @inject()
  async index({ response, request }: HttpContext, userService: UserService) {
    const {
      params: { query = '', page = 1, limit = 10 },
    } = await request.validateUsing(getUsersValidator)

    try {
      const users = await userService.getUsers(query, page, limit)

      return response.ok(users)
    } catch (error) {
      return response.badRequest({
        message: 'Failed to retrieve users',
        error: error.message,
      })
    }
  }

  /**
   * Handle form submission for the creation action
   */
  @inject()
  async store({ request, response }: HttpContext, userService: UserService) {
    try {
      const userData = await request.validateUsing(storeUserValidator)
      const savedUser = await userService.create(userData)
      return response.created({ data: savedUser })
    } catch (error) {
      return response.badRequest({
        message: 'Failed to create user',
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
        message: 'User not found',
        error: error.message,
      })
    }
  }

  /**
   * Handle form submission for the edit action
   */
  @inject()
  async update({ params, request, response }: HttpContext, userService: UserService) {
    try {
      const userData = await request.validateUsing(updateUserValidator)
      const updatedUser = await userService.update(params.id, userData)
      return response.ok({ data: updatedUser })
    } catch (error) {
      return response.badRequest({
        message: 'Failed to update user',
        error: error.message,
      })
    }
  }

  /**
   * Delete record
   */
  @inject()
  async destroy({ params, response }: HttpContext, userService: UserService) {
    try {
      const result = await userService.delete(params.id)

      if (!result) return response.notFound({ message: 'User not found' })

      return response.ok({ message: 'User deleted successfully' })
    } catch (error) {
      return response.badRequest({
        message: 'Failed to delete user',
        error: error.message,
      })
    }
  }
}
