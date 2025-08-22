import Company from '#models/company'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export default class CompanyService {
  private fields: (keyof Company)[] = [
    'categoryId',
    'name',
    'email',
    'phone',
    'address',
    'city',
    'state',
    'zipCode',
    'country',
    'website',
    'facebook',
    'instagram',
    'twitter',
    'linkedin',
    'youtube',
    'tiktok',
    'logo',
    'bannerImage',
    'description',
    'location',
    'daily_program',
  ]

  /**
   * Create a new company
   * @param data - The data to create the company
   * @returns The created company
   * @throws Error if the company already exists
   */
  async create(data: Partial<Company>) {
    const company = new Company()

    // Validate required fields
    const requiredFields: (keyof Company)[] = ['name', 'email', 'phone', 'categoryId']
    requiredFields.forEach((field) => {
      if (!data[field]) {
        throw new Error(`${field} is required to create a company`)
      }
    })

    this.fields.forEach((field) => {
      if (data[field] !== undefined) {
        company[field] = data[field] as never
      }
    })

    // Check if the company already exists
    const existingCompany = await Company.query().where('name', company.name).first()
    if (existingCompany) {
      throw new Error('Cette entreprise existe déjà.')
    }

    const savedCompany = await company.save()

    return savedCompany
  }

  /**
   * Update an existing company
   * @param companyId - The ID of the company to update
   * @param data - The data to update
   * @returns The updated company
   * @throws Error if the company is not found
   */
  async update(companyId: string, data: Partial<Company>): Promise<Company> {
    const company = await Company.findOrFail(companyId)

    this.fields.forEach((field) => {
      if (data[field] !== undefined) {
        company[field] = data[field] as never
      }
    })

    const savedCompany = await company.save()

    return savedCompany
  }

  /**
   * Get companies with pagination
   * @param filters - The filters
   * @returns The companies
   */
  async getAll(filters: {
    search?: string
    page?: number
    limit?: number
    categoryId?: string
    status?: 'blocked' | 'active'
  }): Promise<Company[]> {
    const { search = '', page = 1, limit = 10, categoryId, status } = filters

    let queryBuilder = Company.query()
      .where((query) => {
        query.whereILike('name', `%${search}%`)
        query.orWhereILike('description', `%${search}%`)
        query.orWhereILike('email', `%${search}%`)
        query.orWhereILike('phone', `%${search}%`)
        query.orWhereILike('city', `%${search}%`)
      })
      .preload('category')
      .preload('appointmentRequests')
      .preload('reviews')
      .preload('services')
      .preload('images')
      .preload('docs')
      .preload('posts')

    if (categoryId) {
      queryBuilder = queryBuilder.andWhere('categoryId', categoryId)
    }

    if (status) {
      if (status === 'blocked') queryBuilder = queryBuilder.andWhereNotNull('blockedAt')
      if (status === 'active') queryBuilder = queryBuilder.andWhereNull('blockedAt')
    }

    const companies = await queryBuilder
      .orderBy('name', 'asc')
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)

    return companies
  }

  /**
   * Get the total number of companies
   * @param search - The search query
   * @returns The total number of companies
   */
  async getTotal(search: string = ''): Promise<number> {
    let queryBuilder = Company.query()

    if (search) {
      queryBuilder = queryBuilder.where((query) => {
        query.whereILike('name', `%${search}%`)
        query.orWhereILike('description', `%${search}%`)
        query.orWhereILike('email', `%${search}%`)
        query.orWhereILike('phone', `%${search}%`)
        query.orWhereILike('city', `%${search}%`)
      })
    }

    const result = await queryBuilder.count('*', 'total')
    const item = result[0].$extras as { total: number }

    return item.total
  }

  /**
   * Find a company by ID
   * @param companyId - The ID of the company to find
   * @returns The company
   * @throws Error if company is not found
   */
  async findById(companyId: string): Promise<Company | null> {
    return Company.query()
      .where('id', companyId)
      .preload('category')
      .preload('appointmentRequests')
      .preload('reviews')
      .preload('services')
      .preload('images')
      .preload('docs')
      .preload('posts')
      .first()
  }

  /**
   * Find a company by email
   * @param email - The email of the company to find
   * @returns The company
   * @throws Error if company is not found
   */
  async findByEmail(email: string): Promise<Company | null> {
    return Company.query()
      .where('email', email)
      .preload('category')
      .preload('appointmentRequests')
      .preload('reviews')
      .preload('services')
      .preload('images')
      .preload('docs')
      .preload('posts')
      .first()
  }

  /**
   * Delete a company by ID
   * @param companyId - The ID of the company to delete
   * @returns True if deleted successfully
   * @throws Error if company is not found
   */
  async delete(companyId: string): Promise<boolean> {
    const company = await Company.findOrFail(companyId)
    await company.delete()
    return true
  }

  /**
   * Toggle the blocked status of a company.
   * If the company is currently blocked, unblock it (set blockedAt to null).
   * If the company is not blocked, block it (set blockedAt to current date).
   * @param companyId - The ID of the company to toggle
   * @returns The updated company
   * @throws Error if company is not found
   */
  async toggleBlockedStatus(companyId: string): Promise<Company> {
    const company = await Company.findOrFail(companyId)
    if (company.blockedAt) {
      company.blockedAt = null
    } else {
      company.blockedAt = DateTime.now()
    }
    await company.save()
    return company
  }

  /**
   * Toggle the approve status of a company.
   * If the company is currently approved, un-approve it (set verifiedAt to null).
   * If the company is not approved, approve it (set verifiedAt to current date).
   * @param companyId - The ID of the company to toggle
   * @returns The updated company
   * @throws Error if company is not found
   */
  async toggleApproveStatus(companyId: string): Promise<Company> {
    const company = await Company.findOrFail(companyId)
    if (company.verifiedAt) {
      company.verifiedAt = null
    } else {
      company.verifiedAt = DateTime.now()
    }
    await company.save()
    return company
  }

  /**
   * Get company count per day within a date range
   * @param startDate - The start date (YYYY-MM-DD format)
   * @param endDate - The end date (YYYY-MM-DD format)
   * @returns Array of objects with date and count
   */
  async getCompanyCountPerDay(
    startDate: string,
    endDate: string
  ): Promise<{ date: string; count: number }[]> {
    const start = DateTime.fromISO(startDate).startOf('day')
    const end = DateTime.fromISO(endDate).endOf('day')

    if (!start.isValid || !end.isValid) {
      throw new Error('Invalid date format. Please use YYYY-MM-DD format.')
    }

    if (start > end) {
      throw new Error('Start date must be before or equal to end date.')
    }

    // Query to get company count per day using raw SQL
    const result = await db.rawQuery(
      `
      SELECT
        DATE(created_at) as date,
        COUNT(*) as count
      FROM companies
      WHERE created_at between ? AND ?
      GROUP BY DATE(created_at)
      ORDER BY date ASC
      `,
      [start.toSQL(), end.toSQL()]
    )
    // Create a map of existing results
    const resultMap = new Map<string, number>()
    result.rows.forEach((row: any) => {
      const date = DateTime.fromJSDate(row.date).toFormat('yyyy-MM-dd')
      resultMap.set(date, row.count)
    })

    // Fill in missing dates with count 0
    const finalResult: { date: string; count: number }[] = []
    let currentDate = DateTime.fromISO(startDate)

    while (currentDate <= DateTime.fromISO(endDate)) {
      const dateString = currentDate.toFormat('yyyy-MM-dd')
      finalResult.push({
        date: dateString,
        count: resultMap.get(dateString) || 0,
      })
      currentDate = currentDate.plus({ days: 1 })
    }

    return finalResult
  }
}
