import Company from '#models/company'
import CompanyReview from '#models/company_review'
import User from '#models/user'

export default class CompanyReviewService {
  private fields: (keyof CompanyReview)[] = [
    'companyId',
    'userId',
    'comment',
    'rating',
    'isApproved',
  ]

  /**
   * Create a new company review
   * @param data - The data to create the review
   * @returns The created review
   * @throws Error if the company or user doesn't exist, or if user already reviewed the company
   */
  async create(data: Partial<CompanyReview>): Promise<CompanyReview> {
    const review = new CompanyReview()

    // Validate required fields
    const requiredFields: (keyof CompanyReview)[] = ['companyId', 'userId', 'comment', 'rating']
    requiredFields.forEach((field) => {
      if (!data[field]) {
        throw new Error(`${field} is required to create a review`)
      }
    })

    // Check if company exists
    const company = await Company.find(data.companyId!)
    if (!company) {
      throw new Error('Entreprise introuvable.')
    }

    // Check if user exists
    const user = await User.find(data.userId!)
    if (!user) {
      throw new Error('Utilisateur introuvable.')
    }

    // Check if user already reviewed this company
    const existingReview = await CompanyReview.query()
      .where('companyId', data.companyId!)
      .where('userId', data.userId!)
      .first()

    if (existingReview) {
      throw new Error('Vous avez déjà laissé un avis pour cette entreprise.')
    }

    this.fields.forEach((field) => {
      if (data[field] !== undefined) {
        review[field] = data[field] as never
      }
    })

    // Set default approval status to false for new reviews
    if (review.isApproved === undefined) {
      review.isApproved = false
    }

    const savedReview = await review.save()
    await savedReview.load('user')
    await savedReview.load('company')

    return savedReview
  }

  /**
   * Update an existing company review
   * @param reviewId - The ID of the review to update
   * @param data - The data to update
   * @returns The updated review
   * @throws Error if the review is not found
   */
  async update(reviewId: string, data: Partial<CompanyReview>): Promise<CompanyReview> {
    const review = await CompanyReview.findOrFail(reviewId)

    // Only allow updating comment and rating
    const updatableFields: (keyof CompanyReview)[] = ['comment', 'rating']
    updatableFields.forEach((field) => {
      if (data[field] !== undefined) {
        review[field] = data[field] as never
      }
    })

    const savedReview = await review.save()
    await savedReview.load('user')
    await savedReview.load('company')

    return savedReview
  }

  /**
   * Get reviews for a specific company with pagination
   * @param filters - The filters including companyId, pagination, etc.
   * @returns The paginated reviews
   */
  async getByCompany(filters: {
    companyId: string
    search?: string
    page?: number
    limit?: number
    isApproved?: boolean
    userId?: string
  }) {
    const { companyId, search = '', page = 1, limit = 10, isApproved, userId } = filters

    // Verify company exists
    await Company.findOrFail(companyId)

    let queryBuilder = CompanyReview.query()
      .where('companyId', companyId)
      .preload('user', (userQuery) => {
        userQuery.select('id', 'firstName', 'lastName', 'profileImage')
      })

    // Apply search filter on comment
    if (search) {
      queryBuilder = queryBuilder.andWhereILike('comment', `%${search}%`)
    }

    // Filter by approval status if specified
    if (isApproved !== undefined) {
      queryBuilder = queryBuilder.andWhere('isApproved', isApproved)
    }

    // Filter by user if specified
    if (userId) {
      queryBuilder = queryBuilder.andWhere('userId', userId)
    }

    const reviews = await queryBuilder.orderBy('createdAt', 'desc').paginate(page, limit)

    return reviews
  }

  /**
   * Find a review by ID
   * @param reviewId - The ID of the review to find
   * @returns The review with user and company relations
   * @throws Error if review is not found
   */
  async findById(reviewId: string): Promise<CompanyReview> {
    const review = await CompanyReview.query()
      .where('id', reviewId)
      .preload('user', (userQuery) => {
        userQuery.select('id', 'firstName', 'lastName', 'profileImage')
      })
      .preload('company', (companyQuery) => {
        companyQuery.select('id', 'name', 'logo')
      })
      .firstOrFail()

    return review
  }

  /**
   * Delete a review by ID
   * @param reviewId - The ID of the review to delete
   * @returns True if deleted successfully
   * @throws Error if review is not found
   */
  async delete(reviewId: string): Promise<boolean> {
    const review = await CompanyReview.findOrFail(reviewId)
    await review.delete()
    return true
  }

  /**
   * Approve or reject a review (admin only)
   * @param reviewId - The ID of the review
   * @returns The updated review
   * @throws Error if review is not found
   */
  async toggleApproval(reviewId: string): Promise<CompanyReview> {
    const review = await CompanyReview.findOrFail(reviewId)
    review.isApproved = !review.isApproved
    await review.save()
    await review.load('user')
    await review.load('company')
    return review
  }

  /**
   * Get the average rating for a company
   * @param companyId - The ID of the company
   * @returns The average rating and total count of approved reviews
   */
  async getCompanyRatingStats(companyId: string): Promise<{
    averageRating: number
    totalReviews: number
  }> {
    const stats = await CompanyReview.query()
      .where('companyId', companyId)
      .where('isApproved', true)
      .select('rating')

    if (stats.length === 0) {
      return { averageRating: 0, totalReviews: 0 }
    }

    const totalRating = stats.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = Math.round((totalRating / stats.length) * 10) / 10 // Round to 1 decimal

    return {
      averageRating,
      totalReviews: stats.length,
    }
  }
}
