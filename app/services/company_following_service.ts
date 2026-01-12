import Company from '#models/company'
import CompanyFollowing from '#models/company_following'

export default class CompanyFollowingService {
  private fields: (keyof CompanyFollowing)[] = ['companyId', 'userId']

  /**
   * Create a new company
   * @param data - The data to create the company following
   * @returns The created company following
   * @throws Error
   */
  async create(data: Partial<CompanyFollowing>) {
    const companyFollowing = new CompanyFollowing()

    // Validate required fields
    const requiredFields: (keyof CompanyFollowing)[] = ['companyId', 'userId']
    requiredFields.forEach((field) => {
      if (!data[field]) {
        throw new Error(`${field} is required to create a company following.`)
      }
    })

    this.fields.forEach((field) => {
      if (data[field] !== undefined) {
        companyFollowing[field] = data[field] as never
      }
    })

    // Check if the company already exists
    const company = await Company.findOrFail(companyFollowing.companyId)
    if (!company) {
      throw new Error("Cette entreprise n'existe pas.")
    }

    await companyFollowing.save()

    // Increment company following count
    company.followingCount = Math.max(company.followingCount + 1, 0)
    await company.save()

    return companyFollowing
  }

  /**
   * Get company followers
   * @param filters - The filters
   * @returns The companies
   */
  async getCompanyFollowers(filters: {
    companyId: string
    search?: string
    page?: number
    limit?: number
  }) {
    const { companyId, search = '', page = 1, limit = 10 } = filters

    let queryBuilder = CompanyFollowing.query()
      .where('companyId', companyId)
      .andWhere((query) => {
        query.whereILike('name', `%${search}%`)
        query.orWhereILike('description', `%${search}%`)
        query.orWhereILike('email', `%${search}%`)
        query.orWhereILike('phone', `%${search}%`)
        query.orWhereILike('city', `%${search}%`)
      })
      .preload('user')
      .preload('company')

    const followings = await queryBuilder
      .orderBy('name', 'asc')
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)

    const result = followings.toJSON()

    return {
      ...result,
      data: (result.data as CompanyFollowing[]).map((item) => item.user),
    }
  }

  /**
   * Get companies followed by a user
   * @param filters - The filters
   * @returns The companies
   */
  async getUserFollowings(filters: {
    userId: string
    search?: string
    page?: number
    limit?: number
  }) {
    const { userId, search = '', page = 1, limit = 10 } = filters

    let queryBuilder = CompanyFollowing.query()
      .where('userId', userId)
      .whereHas('company', (query) => {
        if (search) {
          query.whereILike('name', `%${search}%`)
          query.orWhereILike('description', `%${search}%`)
          query.orWhereILike('email', `%${search}%`)
          query.orWhereILike('phone', `%${search}%`)
          query.orWhereILike('city', `%${search}%`)
        }
      })
      .preload('company', (query) => {
        query.preload('category')
      })

    const followings = await queryBuilder.orderBy('createdAt', 'desc').paginate(page, limit)

    const result = followings.toJSON()

    return {
      ...result,
      data: (result.data as CompanyFollowing[]).map((item) => item.company),
    }
  }

  async getUserFollowing(userId: string, companyId: string) {
    return CompanyFollowing.findBy({ companyId, userId })
  }

  /**
   * Delete a company following by company and user ID
   * @param companyId - The ID of the company to delete
   * @param userId - The ID of the user to delete
   * @returns True if deleted successfully
   * @throws Error if company is not found
   */
  async delete(companyId: string, userId: string): Promise<boolean> {
    const following = await CompanyFollowing.findByOrFail({ companyId, userId })
    await following.delete()

    // Decrement company following count
    const company = await Company.findOrFail(companyId)
    company.followingCount = Math.max(company.followingCount - 1, 0)
    await company.save()

    return true
  }
}
