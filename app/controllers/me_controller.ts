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

  @inject()
  async uploadImageProfile({ request, response, auth }: HttpContext, userService: UserService) {
    const { image } = await request.validateUsing(imageProfileValidator)

    if (!image) {
      return response.badRequest('Une image est requise.')
    }

    const filename = `${auth.user!.id}_avatar.${image.extname}`
    await image.move(USER_PROFILE_STORAGE_PATH, {
      name: filename,
      overwrite: true,
    })

    const user = await userService.update(auth.user!.id, {
      profileImage: `${USER_PROFILE_STORAGE_PATH}/${filename}`,
    })

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

    const userToUpdate = await userService.findById(auth.user!.id)
    if (!userToUpdate) {
      return response.badRequest('Utilisateur non trouvé')
    }
    const isPasswordValid = await userToUpdate.verifyPassword(data.password)
    if (!isPasswordValid) {
      return response.badRequest('Mot de passe incorrect')
    }

    userToUpdate.updateEmailRequest = data.email
    await userToUpdate.save()

    UserUpdateEmailRequested.dispatch(userToUpdate)

    return response.ok({
      user: userToUpdate,
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

  @inject()
  async updatePassword({ request, response, auth }: HttpContext, userService: UserService) {
    const data = await request.validateUsing(updateMePasswordValidator)

    const userToUpdate = await userService.findById(auth.user!.id)
    if (!userToUpdate) {
      return response.badRequest('Utilisateur non trouvé')
    }

    const isPasswordValid = await userToUpdate.verifyPassword(data.currentPassword)
    if (!isPasswordValid) {
      return response.badRequest('Mot de passe incorrect')
    }

    userToUpdate.password = data.newPassword
    await userToUpdate.save()

    UserPasswordChanged.dispatch(userToUpdate)

    return response.ok({
      user: userToUpdate,
      message: 'Mot de passe mis à jour',
    })
  }

  @inject()
  async deleteAccount({ response, request, auth }: HttpContext, userService: UserService) {
    const data = await request.validateUsing(deleteAccountValidator)

    const user = await userService.findById(auth.user!.id)

    if (!user) {
      return response.badRequest('Utilisateur non trouvé')
    }

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
