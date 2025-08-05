import UserPasswordChanged from '#events/user_password_changed'
import UserService from '#services/user_service'
import { updateMeValidator } from '#validators/me'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

export default class MeController {
  async get({ auth, response }: HttpContext) {
    // Retrieve the authenticated user
    const user = auth.user

    // If no user is authenticated, return an error response
    if (!user) {
      return { error: 'User not authenticated' }
    }

    // Return the authenticated user's details
    return response.ok({
      user,
    })
  }

  @inject()
  async update({ response, request, auth }: HttpContext, userService: UserService) {
    const data = await request.validateUsing(updateMeValidator)

    const user = await userService.update(auth.user!.id, data)

    if (data.password !== undefined) UserPasswordChanged.dispatch(user)

    return response.ok({
      user,
    })
  }
}
