import UserPasswordReset from '#events/user_password_reset'
import UserPasswordResetRequested from '#events/user_password_reset_requested'
import UserRegistered from '#events/user_registered'
import UserUpdated from '#events/user_updated'
import UserVerified from '#events/user_verified'
import User from '#models/user'
import { UserTokenService } from '#services/user_token_service'
import { inject } from '@adonisjs/core'
import { DateTime } from 'luxon'

@inject()
export default class UserService {
  private fields: (keyof User)[] = [
    'firstName',
    'lastName',
    'email',
    'password',
    'phone',
    'address',
    'city',
    'state',
    'zipCode',
    'country',
    'role',
    'profileImage',
    'companyId',
  ]

  async create(data: Partial<User>) {
    // Create a new user instance
    const user = new User()

    // Validate required fields
    const requiredFields: (keyof User)[] = ['firstName', 'lastName', 'email', 'password']
    requiredFields.forEach((field) => {
      if (!data[field]) {
        throw new Error(`${field} is required to create a user`)
      }
    })

    this.fields.forEach((field) => {
      if (data[field] && field !== 'displayName') {
        user[field] = data[field] as never
      }
    })

    await user.save()

    UserRegistered.dispatch(user)

    return user
  }

  /**
   * Update an existing user
   * @param userId - The ID of the user to update
   * @param data - The data to update (email cannot be updated)
   * @returns The updated user
   * @throws Error if user is not found
   */
  async update(userId: string, data: Partial<User>): Promise<User> {
    const user = await User.findOrFail(userId)

    this.fields.forEach((field) => {
      if (data[field] && field !== 'displayName') {
        user[field] = data[field] as never
      }
    })

    await user.save()

    UserUpdated.dispatch(user)

    return user
  }

  /**
   * Verify a user using a token
   * @param userId - The ID of the user to verify
   * @param token - The verification token
   * @returns The verified user
   * @throws Error if user is not found or token is invalid/expired
   */
  async verify(userId: string, token: string): Promise<User> {
    const user = await User.findOrFail(userId)

    // Check if user is already verified
    if (user.verifiedAt) {
      throw new Error('User is already verified')
    }
    const userTokenService = new UserTokenService()
    const userToken = await userTokenService.verify(token, user)

    if (!userToken) {
      throw new Error('Invalid or expired verification token')
    }

    // Set verifiedAt to current timestamp
    user.verifiedAt = DateTime.now()

    await user.save()

    // Delete the used token
    await userTokenService.delete(token)

    // Dispatch an event for user verification
    UserVerified.dispatch(user)

    return user
  }

  async updateLastLogin(userId: string): Promise<User> {
    const user = await User.findOrFail(userId)

    user.lastLoginAt = DateTime.now()

    await user.save()

    return user
  }

  /**
   * Request password reset for a user
   * @param email - The email address of the user
   * @throws Error if user is not found
   */
  async requestPasswordReset(email: string): Promise<void> {
    // Find user by email - don't throw error for security reasons
    const user = await User.query().where('email', email).first()

    if (!user) {
      // Don't reveal if email exists or not for security
      return
    }

    const userTokenService = new UserTokenService()

    // Generate a reset token (6 digits, valid for 1 hour)
    const resetToken = await userTokenService.generateNumeric(user, 6, { hours: 1 })

    // Dispatch event to send reset email
    UserPasswordResetRequested.dispatch(user, resetToken)
  }

  /**
   * Reset password using a token
   * @param token - The reset token
   * @param newPassword - The new password
   * @returns The updated user
   * @throws Error if token is invalid/expired or user not found
   */
  async resetPassword(token: string, newPassword: string): Promise<User> {
    const userTokenService = new UserTokenService()

    // Find the token first to get the associated user
    const userToken = await userTokenService.findTokenWithUser(token)

    if (!userToken) {
      throw new Error('Invalid or expired reset token')
    }

    const user = userToken.user

    // Update the password
    user.password = newPassword
    await user.save()

    // Delete the used token
    await userTokenService.delete(token)

    // Dispatch events
    UserPasswordReset.dispatch(user)

    return user
  }
}
