import UserPasswordChanged from '#events/user_password_changed'
import UserUpdateEmailRequested from '#events/user_update_email_requested'
import UserService from '#services/user_service'
import { UserTokenService } from '#services/user_token_service'
import {
  deleteAccountValidator,
  imageProfileValidator,
  updateMeEmailValidator,
  updateMePasswordValidator,
  updateMeValidator,
  verifyNewEmailValidator,
} from '#validators/me'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

export const USER_PROFILE_STORAGE_PATH = 'storage/uploads/profile_images'
export const COMPANY_IMAGES_STORAGE_PATH = 'storage/uploads/company_images'

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

  async update({ response, request, auth }: HttpContext) {
    const user = auth.user!
    const data = await request.validateUsing(updateMeValidator)

    if (data.firstName) user.firstName = data.firstName
    if (data.lastName) user.lastName = data.lastName
    if (data.phone) user.phone = data.phone
    if (data.address) user.address = data.address
    if (data.city) user.city = data.city
    if (data.state) user.state = data.state
    if (data.zipCode) user.zipCode = data.zipCode
    if (data.country) user.country = data.country

    await user.save()

    return response.ok({
      user,
    })
  }

  @inject()
  async uploadImageProfile({ request, response, auth }: HttpContext) {
    const { image } = await request.validateUsing(imageProfileValidator)

    if (!image) {
      return response.badRequest('Une image est requise.')
    }

    const filename = `${auth.user!.id}_avatar.${image.extname}`
    await image.move(USER_PROFILE_STORAGE_PATH, {
      name: filename,
      overwrite: true,
    })

    const user = auth.user!

    user.profileImage = `${USER_PROFILE_STORAGE_PATH}/${filename}`

    await user.save()

    return response.ok({
      user,
    })
  }

  @inject()
  async updateEmail({ request, response, auth }: HttpContext, userService: UserService) {
    const data = await request.validateUsing(updateMeEmailValidator)

    // Check if the email is already in use
    const tempUser = await userService.findByEmail(data.email)
    if (tempUser) {
      return response.badRequest('Cette adresse e-mail est déjà utilisée.')
    }

    const user = auth.user!
    const isPasswordValid = await user.verifyPassword(data.password)
    if (!isPasswordValid) {
      return response.badRequest('Mot de passe incorrect')
    }

    user.updateEmailRequest = data.email

    await user.save()

    UserUpdateEmailRequested.dispatch(user)

    return response.ok({
      user,
      message: 'Email de mise à jour demandée',
    })
  }

  async resendVerificationEmail({ response, auth }: HttpContext) {
    UserUpdateEmailRequested.dispatch(auth.user!)

    return response.ok({
      user: auth.user,
      message: 'Email de vérification envoyé',
    })
  }

  @inject()
  async verifyNewEmail(
    { request, response, auth }: HttpContext,
    userService: UserService,
    userTokenService: UserTokenService
  ) {
    const data = await request.validateUsing(verifyNewEmailValidator)

    const user = await userService.verifyNewEmail(auth.user!.id, data.token)

    user.email = user.updateEmailRequest!
    user.updateEmailRequest = null

    await user.save()

    // Delete the used token
    await userTokenService.delete(data.token)

    return response.ok({
      user,
      message: 'Email mis à jour',
    })
  }

  async updatePassword({ request, response, auth }: HttpContext) {
    const data = await request.validateUsing(updateMePasswordValidator)

    const user = auth.user!

    const isPasswordValid = await user.verifyPassword(data.currentPassword)
    if (!isPasswordValid) {
      return response.badRequest('Mot de passe incorrect')
    }

    user.password = data.newPassword

    await user.save()

    UserPasswordChanged.dispatch(user)

    return response.ok({
      user,
      message: 'Mot de passe mis à jour',
    })
  }

  async deleteAccount({ response, request, auth }: HttpContext) {
    const data = await request.validateUsing(deleteAccountValidator)

    const user = auth.user!

    const isPasswordValid = await user.verifyPassword(data.password)
    if (!isPasswordValid) {
      return response.badRequest('Mot de passe incorrect')
    }

    user.firstName = 'Supprimé'
    user.lastName = 'Supprimé'
    user.email = `${new Date().getTime()}@supprime.com`
    user.phone = 'Supprimé'
    user.profileImage = null
    user.password = ''

    await user.save()

    return response.ok({
      user,
    })
  }
}
