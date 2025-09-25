import User from '#models/user'
import UserCV from '#models/user_cv'
import { inject } from '@adonisjs/core'

@inject()
export default class UserCVService {
  private fields: (keyof UserCV)[] = ['name', 'path', 'type']

  async create(data: Partial<UserCV>, user: User): Promise<UserCV> {
    // Create a new UserCV instance
    const userCV = new UserCV()

    // Validate required fields
    const requiredFields: (keyof UserCV)[] = ['name', 'path', 'type']
    requiredFields.forEach((field) => {
      if (!data[field]) {
        throw new Error(`${field} is required to create a user CV`)
      }
    })

    // Set user ID
    userCV.userId = user.id

    // Set other fields
    this.fields.forEach((field) => {
      if (data[field]) {
        userCV[field] = data[field] as never
      }
    })

    const savedUserCV = await userCV.save()
    await savedUserCV.load('user')

    return savedUserCV
  }

  /**
   * Update an existing user CV
   * @param userCVId - The ID of the user CV to update
   * @param data - The data to update
   * @returns The updated user CV
   * @throws Error if user CV is not found
   */
  async update(userCVId: string, data: Partial<UserCV>): Promise<UserCV> {
    const userCV = await UserCV.findOrFail(userCVId)

    this.fields.forEach((field) => {
      if (data[field]) {
        userCV[field] = data[field] as never
      }
    })

    const savedUserCV = await userCV.save()
    await savedUserCV.load('user')

    return savedUserCV
  }

  /**
   * Get user CVs with pagination
   * @param filters - Filter options
   * @returns The user CVs
   */
  async getUserCVs(filters: {
    userId?: string
    page?: number
    limit?: number
    search?: string
  }): Promise<UserCV[]> {
    const { userId, page = 1, limit = 10, search = '' } = filters

    let queryBuilder = UserCV.query().preload('user')

    if (userId) {
      queryBuilder = queryBuilder.where('userId', userId)
    }

    if (search) {
      queryBuilder = queryBuilder.where((query) => {
        query.whereILike('name', `%${search}%`)
        query.orWhereILike('type', `%${search}%`)
      })
    }

    const userCVs = await queryBuilder.orderBy('createdAt', 'desc').paginate(page, limit)

    return userCVs
  }

  /**
   * Find a user CV by ID
   * @param userCVId - The ID of the user CV to find
   * @returns The user CV
   * @throws Error if user CV is not found
   */
  async findById(userCVId: string): Promise<UserCV | null> {
    const userCV = await UserCV.query().preload('user').where('id', userCVId).first()
    return userCV
  }

  /**
   * Find user CVs by user ID
   * @param userId - The ID of the user
   * @param filters - Filter options
   * @returns The user CVs
   */
  async findByUserId(
    userId: string,
    filters: {
      page?: number
      limit?: number
      search?: string
    } = {}
  ): Promise<UserCV[]> {
    const { page = 1, limit = 10, search = '' } = filters

    let queryBuilder = UserCV.query().preload('user').where('userId', userId)

    if (search) {
      queryBuilder = queryBuilder.where((query) => {
        query.whereILike('name', `%${search}%`)
        query.orWhereILike('type', `%${search}%`)
      })
    }

    const userCVs = await queryBuilder.orderBy('createdAt', 'desc').paginate(page, limit)

    return userCVs
  }

  /**
   * Delete a user CV by ID
   * @param userCVId - The ID of the user CV to delete
   * @returns True if deleted successfully
   * @throws Error if user CV is not found
   */
  async delete(userCVId: string): Promise<boolean> {
    const userCV = await UserCV.findOrFail(userCVId)
    await userCV.delete()
    return true
  }

  /**
   * Get total count of user CVs
   * @param userId - Optional user ID to filter by
   * @returns Total count
   */
  async getTotal(userId?: string): Promise<number> {
    let queryBuilder = UserCV.query()

    if (userId) {
      queryBuilder = queryBuilder.where('userId', userId)
    }

    const result = await queryBuilder.count('*', 'total')
    const item = result[0].$extras as { total: number }

    return item.total
  }
}
