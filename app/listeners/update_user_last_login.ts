import UserLoggedIn from '#events/user_logged_in'
import UserService from '#services/user_service'
import { inject } from '@adonisjs/core'

export default class UpdateUserLastLogin {
  @inject()
  async handle(event: UserLoggedIn, userService: UserService) {
    if (true) return
    const { user } = event
    await userService.updateLastLogin(user.id)
  }
}
