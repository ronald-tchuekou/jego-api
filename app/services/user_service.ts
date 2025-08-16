import UserPasswordReset from '#events/user_password_reset'
import UserPasswordResetRequested from '#events/user_password_reset_requested'
import UserRegistered from '#events/user_registered'
import UserUpdated from '#events/user_updated'
import UserVerified from '#events/user_verified'
import User, { UserRole } from '#models/user'
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

    if (!user.role) user['role'] = UserRole.USER

    // Check if the user already exists
    const existingUser = await User.query().where('email', user.email).first()
    if (existingUser) {
      throw new Error('User already exists')
    }

    const savedUser = await user.save()

    UserRegistered.dispatch(savedUser)

    return savedUser
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

    const savedUser = await user.save()

    UserUpdated.dispatch(savedUser)

    return savedUser
  }

  /**
   * Verify a user using a token
   * @param userId - The ID of the user to verify
   * @param token - The verification token
   * @returns The verified user
   * @throws Error if user is not found or token is invalid/expired
   */
  async verify(userId: string, token: string): Promise<User> {
    let user = await User.findOrFail(userId)

    // Check if user is already verified
    if (user.verifiedAt) {
      throw new Error('User is already verified')
    }
    const userTokenService = new UserTokenService()
    const userToken = await userTokenService.verify(token, user)

    if (!userToken) {
      throw new Error('Token de vérification invalide ou expiré')
    }

    // Set verifiedAt to current timestamp
    user.verifiedAt = DateTime.now()

    user = await user.save()

    // Delete the used token
    await userTokenService.delete(token)

    // Dispatch an event for user verification
    UserVerified.dispatch(user)

    return user
  }

  async verifyNewEmail(userId: string, token: string): Promise<User> {
    let user = await User.findOrFail(userId)

    if (!user.updateEmailRequest) {
      throw new Error("Aucune demande de mise à jour d'email trouvée.")
    }

    const userTokenService = new UserTokenService()
    const userToken = await userTokenService.verify(token, user)

    if (!userToken) {
      throw new Error('Votre code de vérification est invalide ou a expiré.')
    }

    return user
  }

  async updateLastLogin(userId: string): Promise<User> {
    let user = await User.findOrFail(userId)

    user.lastLoginAt = DateTime.now()

    user = await user.save()

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

    let user = userToken.user

    // Update the password
    user.password = newPassword
    user = await user.save()

    // Delete the used token
    await userTokenService.delete(token)

    // Dispatch events
    UserPasswordReset.dispatch(user)

    return user
  }

  /**
   * Get users with pagination
   * @param query - The search query
   * @param page - The page number
   * @param limit - The number of users per page
   * @returns The users
   */
  async getUsers(filters: {
    search?: string
    page?: number
    limit?: number
    companyId?: string
    role?: UserRole
    status?: 'active' | 'blocked'
  }): Promise<User[]> {
    const { search = '', page = 1, limit = 10, companyId = '', role, status } = filters

    let queryBuilder = User.query().where((query) => {
      query.whereILike('firstName', `%${search}%`)
      query.orWhereILike('lastName', `%${search}%`)
      query.orWhereILike('email', `%${search}%`)
    })

    if (companyId) queryBuilder = queryBuilder.andWhere('companyId', companyId)

    if (role) queryBuilder = queryBuilder.andWhere('role', role)

    if (status) {
      if (status === 'blocked') queryBuilder = queryBuilder.andWhereNotNull('blockedAt')
      if (status === 'active') queryBuilder = queryBuilder.andWhereNull('blockedAt')
    }

    const users = await queryBuilder
      .orderBy('firstName', 'asc')
      .orderBy('lastName', 'asc')
      .paginate(page, limit)

    return users
  }

  async getTotalUsers(search: string = ''): Promise<number> {
    let queryBuilder = User.query()

    if (search) {
      queryBuilder = queryBuilder.where((query) => {
        query.whereILike('firstName', `%${search}%`)
        query.orWhereILike('lastName', `%${search}%`)
        query.orWhereILike('email', `%${search}%`)
      })
    }

    const total = (await queryBuilder.count('id as total')) as (User & { total: number })[]

    return total[0].total
  }

  /**
   * Find a user by ID
   * @param userId - The ID of the user to find
   * @returns The user
   * @throws Error if user is not found
   */
  async findById(userId: string): Promise<User> {
    const user = await User.findOrFail(userId)
    return user
  }

  /**
   * Find a user by email
   * @param email - The email of the user to find
   * @returns The user
   * @throws Error if user is not found
   */
  async findByEmail(email: string): Promise<User | null> {
    const user = await User.query().where('email', email).first()
    return user
  }

  /**
   * Delete a user by ID
   * @param userId - The ID of the user to delete
   * @returns True if deleted successfully
   * @throws Error if user is not found
   */
  async delete(userId: string): Promise<boolean> {
    const user = await User.findOrFail(userId)
    await user.delete()
    return true
  }

  /**
   * Toggle the block status of a user
   * @param userId - The ID of the user to toggle the block status
   * @returns The updated user
   * @throws Error if user is not found
   */
  async toggleBlockUser(userId: string): Promise<User> {
    const user = await User.findOrFail(userId)
    user.blockedAt = user.blockedAt ? null : DateTime.now()
    await user.save()
    return user
  }
}
