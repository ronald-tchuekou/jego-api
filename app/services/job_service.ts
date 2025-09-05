import Job, { JobStatus } from '#models/job'
import User from '#models/user'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export default class JobService {
  private fields: (keyof Job)[] = [
    'userId',
    'title',
    'description',
    'companyName',
    'companyLogo',
    'companyWebsite',
    'companyEmail',
    'companyPhone',
    'companyAddress',
    'companyCity',
    'companyState',
    'companyZip',
    'companyCountry',
    'expiresAt',
    'status',
  ]

  /**
   * Create a new job
   * @param data - The data to create the job
   * @param user - The user creating the job
   * @returns The created job
   * @throws Error if required fields are missing
   */
  async create(data: Partial<Job>, user: User): Promise<Job> {
    const job = new Job()

    // Validate required fields
    const requiredFields: (keyof Job)[] = ['title', 'description']
    requiredFields.forEach((field) => {
      if (!data[field]) {
        throw new Error(`${field} is required to create a job`)
      }
    })

    // Set the user ID from the authenticated user
    job.userId = user.id

    // Set default status if not provided
    if (!data.status) {
      job.status = JobStatus.OPEN
    }

    // Set other fields from data
    this.fields.forEach((field) => {
      if (field !== 'userId' && data[field] !== undefined && field !== 'applicationCount') {
        job[field] = data[field] as never
      }
    })

    const savedJob = await job.save()
    await savedJob.load('user')
    await savedJob.load('applications')

    return savedJob
  }

  /**
   * Update an existing job
   * @param jobId - The ID of the job to update
   * @param data - The data to update
   * @returns The updated job
   * @throws Error if the job is not found
   */
  async update(jobId: string, data: Partial<Job>): Promise<Job> {
    const job = await Job.findOrFail(jobId)

    this.fields.forEach((field) => {
      if (field !== 'userId' && data[field] !== undefined && field !== 'applicationCount') {
        job[field] = data[field] as never
      }
    })

    const savedJob = await job.save()
    await savedJob.load('user')
    await savedJob.load('applications')

    return savedJob
  }

  /**
   * Get jobs with pagination and filters
   * @param filters - The filters
   * @returns The jobs with pagination
   */
  async getAll(filters: {
    search?: string
    page?: number
    limit?: number
    userId?: string
    status?: JobStatus
    companyName?: string
    expiredOnly?: boolean
    activeOnly?: boolean
  }) {
    const {
      search = '',
      page = 1,
      limit = 10,
      userId,
      status,
      companyName,
      expiredOnly = false,
      activeOnly = false,
    } = filters

    let queryBuilder = Job.query()
      .preload('user')
      .preload('applications')
      .orderBy('created_at', 'desc')

    // Apply search filter
    if (search) {
      queryBuilder = queryBuilder.where((query) => {
        query.whereILike('title', `%${search}%`)
        query.orWhereILike('description', `%${search}%`)
        query.orWhereILike('company_name', `%${search}%`)
        query.orWhereILike('company_email', `%${search}%`)
        query.orWhereILike('company_city', `%${search}%`)
      })
    }

    // Apply additional filters
    if (userId) {
      queryBuilder = queryBuilder.andWhere('userId', userId)
    }

    if (status) {
      queryBuilder = queryBuilder.andWhere('status', status)
    }

    if (companyName) {
      queryBuilder = queryBuilder.andWhereILike('company_name', `%${companyName}%`)
    }

    // Filter by expiration status
    if (expiredOnly) {
      queryBuilder = queryBuilder.andWhere('expires_at', '<', DateTime.now().toSQL())
    }

    if (activeOnly) {
      queryBuilder = queryBuilder.andWhere((query) => {
        query.whereNull('expires_at').orWhere('expires_at', '>', DateTime.now().toSQL())
      })
    }

    const jobs = await queryBuilder.paginate(page, limit)

    return jobs
  }

  /**
   * Get the total number of jobs
   * @param filters - The filters
   * @returns The total number of jobs
   */
  async getTotal(companyId?: string): Promise<number> {
    let queryBuilder = Job.query()

    if (companyId) {
      queryBuilder
        .join('users', 'jobs.user_id', 'users.id')
        .join('companies', 'users.company_id', 'companies.id')
        .where('companies.id', companyId)
    }

    const result = await queryBuilder.count('*', 'total')
    const item = result[0].$extras as { total: number }

    return item.total
  }

  /**
   * Find a job by ID
   * @param jobId - The ID of the job to find
   * @returns The job with user relationship loaded
   */
  async findById(jobId: string): Promise<Job | null> {
    return Job.query().where('id', jobId).preload('user').preload('applications').first()
  }

  /**
   * Find jobs by user ID
   * @param userId - The ID of the user
   * @param filters - Additional filters
   * @returns The user's jobs
   */
  async findByUserId(
    userId: string,
    filters: {
      page?: number
      limit?: number
      status?: JobStatus
      expiredOnly?: boolean
      activeOnly?: boolean
    } = {}
  ) {
    const { page = 1, limit = 10, status, expiredOnly = false, activeOnly = false } = filters

    let queryBuilder = Job.query()
      .where('userId', userId)
      .preload('user')
      .preload('applications')
      .orderBy('created_at', 'desc')

    // Apply additional filters
    if (status) {
      queryBuilder = queryBuilder.andWhere('status', status)
    }

    // Filter by expiration status
    if (expiredOnly) {
      queryBuilder = queryBuilder.andWhere('expires_at', '<', DateTime.now().toSQL())
    }

    if (activeOnly) {
      queryBuilder = queryBuilder.andWhere((query) => {
        query.whereNull('expires_at').orWhere('expires_at', '>', DateTime.now().toSQL())
      })
    }

    const jobs = await queryBuilder.paginate(page, limit)

    return jobs
  }

  /**
   * Delete a job by ID
   * @param jobId - The ID of the job to delete
   * @returns True if deleted successfully
   * @throws Error if job is not found
   */
  async delete(jobId: string): Promise<boolean> {
    const job = await Job.findOrFail(jobId)
    await job.delete()
    return true
  }

  /**
   * Toggle job status between OPEN and CLOSED
   * @param jobId - The ID of the job to toggle
   * @returns The updated job
   * @throws Error if job is not found
   */
  async toggleStatus(jobId: string): Promise<Job> {
    const job = await Job.findOrFail(jobId)
    job.status = job.status === JobStatus.OPEN ? JobStatus.CLOSED : JobStatus.OPEN
    const savedJob = await job.save()
    await savedJob.load('user')
    await savedJob.load('applications')
    return savedJob
  }

  /**
   * Close a job (set status to CLOSED)
   * @param jobId - The ID of the job to close
   * @returns The updated job
   * @throws Error if job is not found
   */
  async closeJob(jobId: string): Promise<Job> {
    const job = await Job.findOrFail(jobId)
    job.status = JobStatus.CLOSED
    const savedJob = await job.save()
    await savedJob.load('user')
    await savedJob.load('applications')
    return savedJob
  }

  /**
   * Reopen a job (set status to OPEN)
   * @param jobId - The ID of the job to reopen
   * @returns The updated job
   * @throws Error if job is not found
   */
  async reopenJob(jobId: string): Promise<Job> {
    const job = await Job.findOrFail(jobId)
    job.status = JobStatus.OPEN
    const savedJob = await job.save()
    await savedJob.load('user')
    await savedJob.load('applications')
    return savedJob
  }

  /**
   * Set expiration date for a job
   * @param jobId - The ID of the job
   * @param expiresAt - The expiration date
   * @returns The updated job
   * @throws Error if job is not found
   */
  async setExpiration(jobId: string, expiresAt: Date | null): Promise<Job> {
    const job = await Job.findOrFail(jobId)
    job.expiresAt = expiresAt ? DateTime.fromJSDate(expiresAt) : null
    const savedJob = await job.save()
    await savedJob.load('user')
    await savedJob.load('applications')
    return savedJob
  }

  /**
   * Get expired jobs
   * @param filters - Additional filters
   * @returns Expired jobs
   */
  async getExpiredJobs(
    filters: {
      page?: number
      limit?: number
      userId?: string
    } = {}
  ) {
    const { page = 1, limit = 10, userId } = filters

    let queryBuilder = Job.query()
      .where('expires_at', '<', DateTime.now().toSQL())
      .preload('user')
      .preload('applications')
      .orderBy('expires_at', 'asc')

    if (userId) {
      queryBuilder = queryBuilder.andWhere('userId', userId)
    }

    const jobs = await queryBuilder.paginate(page, limit)

    return jobs
  }

  /**
   * Get active jobs (not expired)
   * @param filters - Additional filters
   * @returns Active jobs
   */
  async getActiveJobs(
    filters: {
      page?: number
      limit?: number
      userId?: string
      status?: JobStatus
    } = {}
  ) {
    const { page = 1, limit = 10, userId, status } = filters

    let queryBuilder = Job.query()
      .where((query) => {
        query.whereNull('expires_at').orWhere('expires_at', '>', DateTime.now().toSQL())
      })
      .preload('user')
      .preload('applications')
      .orderBy('created_at', 'desc')

    if (userId) {
      queryBuilder = queryBuilder.andWhere('userId', userId)
    }

    if (status) {
      queryBuilder = queryBuilder.andWhere('status', status)
    }

    const jobs = await queryBuilder.paginate(page, limit)

    return jobs
  }

  /**
   * Get job count per day within a date range
   * @param startDate - The start date (YYYY-MM-DD format)
   * @param endDate - The end date (YYYY-MM-DD format)
   * @returns Array of objects with date and count
   */
  async getJobCountPerDay(
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

    // Query to get job count per day using raw SQL
    const result = await db.rawQuery(
      `
      SELECT
        DATE(created_at) as date,
        COUNT(*) as count
      FROM jobs
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

  /**
   * Get jobs statistics
   * @returns Object with various job statistics
   */
  async getStatistics(): Promise<{
    total: number
    open: number
    closed: number
    expired: number
    active: number
    withCompany: number
    withoutCompany: number
  }> {
    const now = DateTime.now().toSQL()

    const [
      totalResult,
      openResult,
      closedResult,
      expiredResult,
      activeResult,
      withCompanyResult,
      withoutCompanyResult,
    ] = await Promise.all([
      db.rawQuery('SELECT COUNT(*) as count FROM jobs'),
      db.rawQuery('SELECT COUNT(*) as count FROM jobs WHERE status = ?', [JobStatus.OPEN]),
      db.rawQuery('SELECT COUNT(*) as count FROM jobs WHERE status = ?', [JobStatus.CLOSED]),
      db.rawQuery('SELECT COUNT(*) as count FROM jobs WHERE expires_at < ?', [now]),
      db.rawQuery('SELECT COUNT(*) as count FROM jobs WHERE expires_at > ? OR expires_at IS NULL', [
        now,
      ]),
      db.rawQuery('SELECT COUNT(*) as count FROM jobs WHERE company_name IS NOT NULL'),
      db.rawQuery('SELECT COUNT(*) as count FROM jobs WHERE company_name IS NULL'),
    ])

    return {
      total: totalResult.rows[0].count,
      open: openResult.rows[0].count,
      closed: closedResult.rows[0].count,
      expired: expiredResult.rows[0].count,
      active: activeResult.rows[0].count,
      withCompany: withCompanyResult.rows[0].count,
      withoutCompany: withoutCompanyResult.rows[0].count,
    }
  }

  /**
   * Search jobs by company information
   * @param companyQuery - The company search query
   * @param filters - Additional filters
   * @returns Jobs matching the company search
   */
  async searchByCompany(
    companyId: string,
    filters: {
      search?: string
      page?: number
      limit?: number
      status?: JobStatus
    } = {}
  ) {
    const { page = 1, limit = 10, status, search = '' } = filters

    let queryBuilder = Job.query()
      .select('jobs.*')
      .join('users', 'jobs.user_id', 'users.id')
      .join('companies', 'users.company_id', 'companies.id')
      .where('companies.id', companyId)
      .andWhere((query) => {
        query.whereILike('company_name', `%${search}%`)
        query.orWhereILike('company_email', `%${search}%`)
        query.orWhereILike('company_website', `%${search}%`)
        query.orWhereILike('company_city', `%${search}%`)
        query.orWhereILike('company_address', `%${search}%`)
      })
      .preload('user')
      .preload('applications')
      .orderBy('created_at', 'desc')

    if (status) {
      queryBuilder = queryBuilder.andWhere('status', status)
    }

    const jobs = await queryBuilder.paginate(page, limit)

    return jobs
  }
}
