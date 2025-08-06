import UserLoggedIn from '#events/user_logged_in'
import User from '#models/user'
import UserService from '#services/user_service'
import {
  forgotPasswordValidator,
  loginValidator,
  registerValidator,
  resetPasswordValidator,
  verifyEmail,
} from '#validators/auth'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  /**
   * Handle form submission for the edit action
   */
  async login({ request, response }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)
    const user = await User.verifyCredentials(email, password)

    const token = await User.accessTokens.create(user)

    if (token.value) {
      UserLoggedIn.dispatch(user)
    }

    return response.ok({
      token: token.value!.release(),
      user,
    })
  }

  @inject()
  async register({ request, response }: HttpContext, userService: UserService) {
    const data = await request.validateUsing(registerValidator)
    const user = await userService.create(data)

    const token = await User.accessTokens.create(user)

    UserLoggedIn.dispatch(user)

    return response.ok({
      token: token.value!.release(),
      user,
    })
  }

  async logout({ auth, response, request }: HttpContext) {
    // Invalidate the user's token
    await auth.use('api').invalidateToken()

    return response.ok({
      headers: request.headers,
      message: 'Logged out successfully',
    })
  }

  async revalidateToken({ auth, response }: HttpContext) {
    const user = auth.use('api').getUserOrFail()
    return response.ok({
      user,
      token: user.currentAccessToken.value?.release,
    })
  }

  /**
   * Request password reset
   */
  @inject()
  async forgotPassword({ request, response }: HttpContext, userService: UserService) {
    const { email } = await request.validateUsing(forgotPasswordValidator)

    await userService.requestPasswordReset(email)

    return response.ok({
      message: 'If the email exists in our system, you will receive a password reset link',
    })
  }

  /**
   * Reset password using token
   */
  @inject()
  async resetPassword({ request, response }: HttpContext, userService: UserService) {
    const data = await request.validateUsing(resetPasswordValidator)

    const user = await userService.resetPassword(data.token, data.password)

    const token = await User.accessTokens.create(user)

    return response.ok({
      message: 'Password has been reset successfully',
      token: token.value!.release(),
      user,
    })
  }

  @inject()
  async verifyEmail({ request, response }: HttpContext, userService: UserService) {
    const { token, userId } = await request.validateUsing(verifyEmail)

    const user = await userService.verify(userId, token)

    const accessToken = await User.accessTokens.create(user)

    return response.ok({
      message: 'Email has been verified successfully',
      user,
      token: accessToken.value!.release(),
    })
  }
}
