import UserPasswordChanged from '#events/user_password_changed'
import UserUpdateEmailRequested from '#events/user_update_email_requested'
import UserService from '#services/user_service'
import { updateMeEmailValidator, updateMeValidator, verifyNewEmailValidator } from '#validators/me'
import { inject } from '@adonisjs/core'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'

export const USER_PROFILE_STORAGE_PATH = 'uploads/profile_images'

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
    const image = request.file('image')

    if (!image) {
      return response.badRequest('Image is required')
    }

    const filename = `${Date.now()}_${cuid()}.${image.extname}`
    await image.move(app.makePath(`storage/${USER_PROFILE_STORAGE_PATH}`), { name: filename })

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

  @inject()
  async verifyNewEmail({ request, response, auth }: HttpContext, userService: UserService) {
    const data = await request.validateUsing(verifyNewEmailValidator)

    const user = await userService.verify(auth.user!.id, data.token)

    user.email = user.updateEmailRequest!
    user.updateEmailRequest = null
    await user.save()

    return response.ok({
      user,
      message: 'Email mis à jour',
    })
  }
}
