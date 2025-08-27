import Job, { JobStatus } from '#models/job'
import JobApplication, { JobApplicationStatus } from '#models/job_application'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export default class JobApplicationService {
  private fields: (keyof JobApplication)[] = ['jobId', 'userId', 'status', 'resumePath']

  /**
   * Create a new job application
   * @param data - The data to create the job application
   * @returns The created job application
   * @throws Error if required fields are missing or if application already exists
   */
  async create(data: Partial<JobApplication>): Promise<JobApplication> {
    const application = new JobApplication()

    // Validate required fields
    const requiredFields: (keyof JobApplication)[] = ['jobId', 'resumePath', 'userId']
    requiredFields.forEach((field) => {
      if (!data[field]) {
        throw new Error(`${field} is required to create a job application`)
      }
    })

    // Check if the job exists and is open
    const job = await Job.findOrFail(data.jobId!)
    if (job.status !== JobStatus.OPEN) {
      throw new Error("Ce offre d'emploi n'est pas ouvert à la candidature.")
    }

    // Check if the job is expired
    if (job.expiresAt && job.expiresAt < DateTime.now()) {
      throw new Error("Ce offre d'emploi est expirée.")
    }

    // Check if user has already applied for this job
    const existingApplication = await JobApplication.query()
      .where('jobId', data.jobId!)
      .where('userId', data.userId!)
      .first()

    if (existingApplication) {
      throw new Error("Vous avez déjà postulé pour cette offre d'emploi.")
    }

    // Set the user ID from the authenticated user
    application.userId = data.userId!
    application.jobId = data.jobId!

    // Set default status if not provided
    if (!data.status) {
      application.status = JobApplicationStatus.PENDING
    }

    // Set other fields from data
    this.fields.forEach((field) => {
      if (field !== 'userId' && data[field] !== undefined) {
        application[field] = data[field] as never
      }
    })

    const savedApplication = await application.save()
    await savedApplication.load('job')
    await savedApplication.load('user')

    return savedApplication
  }

  /**
   * Update an existing job application
   * @param applicationId - The ID of the application to update
   * @param data - The data to update
   * @returns The updated job application
   * @throws Error if the application is not found
   */
  async update(applicationId: string, data: Partial<JobApplication>): Promise<JobApplication> {
    const application = await JobApplication.findOrFail(applicationId)

    // Only allow updating status and resume path
    const allowedFields: (keyof JobApplication)[] = ['status', 'resumePath']
    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        application[field] = data[field] as never
      }
    })

    const savedApplication = await application.save()
    await savedApplication.load('job')
    await savedApplication.load('user')

    return savedApplication
  }

  /**
   * Get job applications with pagination and filters
   * @param filters - The filters
   * @returns The applications with pagination
   */
  async getAll(filters: {
    search?: string
    page?: number
    limit?: number
    userId?: string
    jobId?: string
    status?: JobApplicationStatus
    companyId?: string
  }) {
    const { search = '', page = 1, limit = 10, userId, jobId, status, companyId } = filters

    let queryBuilder = JobApplication.query()
      .preload('job', (jobQuery) => {
        jobQuery.preload('user')
      })
      .preload('user')
      .orderBy('created_at', 'asc')

    // Apply search filter (search in job title and user name)
    if (search) {
      queryBuilder = queryBuilder
        .whereHas('job', (jobQuery) => {
          jobQuery.whereILike('title', `%${search}%`)
        })
        .orWhereHas('user', (userQuery) => {
          userQuery.whereILike('name', `%${search}%`).orWhereILike('email', `%${search}%`)
        })
    }

    // Apply additional filters
    if (userId) {
      queryBuilder = queryBuilder.andWhere('userId', userId)
    }

    if (jobId) {
      queryBuilder = queryBuilder.andWhere('jobId', jobId)
    }

    if (status) {
      queryBuilder = queryBuilder.andWhere('status', status)
    }

    // Filter by company (through job's user's company)
    if (companyId) {
      queryBuilder = queryBuilder.whereHas('job', (jobQuery) => {
        jobQuery.whereHas('user', (userQuery) => {
          userQuery.where('companyId', companyId)
        })
      })
    }

    const applications = await queryBuilder.paginate(page, limit)

    return applications
  }

  /**
   * Get the total number of job applications
   * @param filters - The filters
   * @returns The total number of applications
   */
  async getTotal(
    filters: {
      userId?: string
      jobId?: string
      status?: JobApplicationStatus
      companyId?: string
    } = {}
  ): Promise<number> {
    const { userId, jobId, status, companyId } = filters

    let queryBuilder = JobApplication.query()

    if (userId) {
      queryBuilder = queryBuilder.where('userId', userId)
    }

    if (jobId) {
      queryBuilder = queryBuilder.where('jobId', jobId)
    }

    if (status) {
      queryBuilder = queryBuilder.where('status', status)
    }

    if (companyId) {
      queryBuilder = queryBuilder.whereHas('job', (jobQuery) => {
        jobQuery.whereHas('user', (userQuery) => {
          userQuery.where('companyId', companyId)
        })
      })
    }

    const result = await queryBuilder.count('*', 'total')
    const item = result[0].$extras as { total: number }

    return item.total
  }

  /**
   * Find a job application by ID
   * @param applicationId - The ID of the application to find
   * @returns The application with job and user relationships loaded
   */
  async findById(applicationId: string): Promise<JobApplication | null> {
    return JobApplication.query().where('id', applicationId).preload('job').preload('user').first()
  }

  /**
   * Find applications by user ID
   * @param userId - The ID of the user
   * @param filters - Additional filters
   * @returns The user's applications
   */
  async findByUserId(
    userId: string,
    filters: {
      page?: number
      limit?: number
      status?: JobApplicationStatus
    } = {}
  ) {
    const { page = 1, limit = 10, status } = filters

    let queryBuilder = JobApplication.query()
      .where('userId', userId)
      .preload('job')
      .preload('user')
      .orderBy('created_at', 'desc')

    if (status) {
      queryBuilder = queryBuilder.andWhere('status', status)
    }

    const applications = await queryBuilder.paginate(page, limit)

    return applications
  }

  /**
   * Find applications by job ID
   * @param jobId - The ID of the job
   * @param filters - Additional filters
   * @returns The job's applications
   */
  async findByJobId(
    jobId: string,
    filters: {
      page?: number
      limit?: number
      status?: JobApplicationStatus
    } = {}
  ) {
    const { page = 1, limit = 10, status } = filters

    let queryBuilder = JobApplication.query()
      .where('jobId', jobId)
      .preload('job')
      .preload('user')
      .orderBy('created_at', 'asc')

    if (status) {
      queryBuilder = queryBuilder.andWhere('status', status)
    }

    const applications = await queryBuilder.paginate(page, limit)

    return applications
  }

  /**
   * Check if a user has already applied for a specific job
   * @param userId - The ID of the user
   * @param jobId - The ID of the job
   * @returns The existing application or null
   */
  async hasUserApplied(userId: string, jobId: string): Promise<JobApplication | null> {
    return JobApplication.query()
      .where('userId', userId)
      .where('jobId', jobId)
      .preload('job')
      .preload('user')
      .first()
  }

  /**
   * Delete a job application by ID
   * @param applicationId - The ID of the application to delete
   * @returns True if deleted successfully
   * @throws Error if application is not found
   */
  async delete(applicationId: string): Promise<boolean> {
    const application = await JobApplication.findOrFail(applicationId)
    await application.delete()
    return true
  }

  /**
   * Get application count per day within a date range
   * @param startDate - The start date (YYYY-MM-DD format)
   * @param endDate - The end date (YYYY-MM-DD format)
   * @returns Array of objects with date and count
   */
  async getApplicationCountPerDay(
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

    // Query to get application count per day using raw SQL
    const result = await db.rawQuery(
      `
      SELECT
        DATE(created_at) as date,
        COUNT(*) as count
      FROM job_applications
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
   * Get applications statistics
   * @returns Object with various application statistics
   */
  async getStatistics(): Promise<{
    total: number
    pending: number
    accepted: number
    rejected: number
    averagePerJob: number
    averagePerUser: number
  }> {
    const [
      totalResult,
      pendingResult,
      acceptedResult,
      rejectedResult,
      jobCountResult,
      userCountResult,
    ] = await Promise.all([
      db.rawQuery('SELECT COUNT(*) as count FROM job_applications'),
      db.rawQuery('SELECT COUNT(*) as count FROM job_applications WHERE status = ?', [
        JobApplicationStatus.PENDING,
      ]),
      db.rawQuery('SELECT COUNT(*) as count FROM job_applications WHERE status = ?', [
        JobApplicationStatus.ACCEPTED,
      ]),
      db.rawQuery('SELECT COUNT(*) as count FROM job_applications WHERE status = ?', [
        JobApplicationStatus.REJECTED,
      ]),
      db.rawQuery('SELECT COUNT(DISTINCT job_id) as count FROM job_applications'),
      db.rawQuery('SELECT COUNT(DISTINCT user_id) as count FROM job_applications'),
    ])

    const total = totalResult.rows[0].count
    const jobCount = jobCountResult.rows[0].count
    const userCount = userCountResult.rows[0].count

    return {
      total,
      pending: pendingResult.rows[0].count,
      accepted: acceptedResult.rows[0].count,
      rejected: rejectedResult.rows[0].count,
      averagePerJob: jobCount > 0 ? Math.round(total / jobCount) : 0,
      averagePerUser: userCount > 0 ? Math.round(total / userCount) : 0,
    }
  }

  /**
   * Get statistics for a specific job
   * @param jobId - The ID of the job
   * @returns Object with job application statistics
   */
  async getJobStatistics(jobId: string): Promise<{
    total: number
    pending: number
    accepted: number
    rejected: number
  }> {
    const [totalResult, pendingResult, acceptedResult, rejectedResult] = await Promise.all([
      db.rawQuery('SELECT COUNT(*) as count FROM job_applications WHERE job_id = ?', [jobId]),
      db.rawQuery(
        'SELECT COUNT(*) as count FROM job_applications WHERE job_id = ? AND status = ?',
        [jobId, JobApplicationStatus.PENDING]
      ),
      db.rawQuery(
        'SELECT COUNT(*) as count FROM job_applications WHERE job_id = ? AND status = ?',
        [jobId, JobApplicationStatus.ACCEPTED]
      ),
      db.rawQuery(
        'SELECT COUNT(*) as count FROM job_applications WHERE job_id = ? AND status = ?',
        [jobId, JobApplicationStatus.REJECTED]
      ),
    ])

    return {
      total: totalResult.rows[0].count,
      pending: pendingResult.rows[0].count,
      accepted: acceptedResult.rows[0].count,
      rejected: rejectedResult.rows[0].count,
    }
  }

  /**
   * Get statistics for a specific user
   * @param userId - The ID of the user
   * @returns Object with user application statistics
   */
  async getUserStatistics(userId: string): Promise<{
    total: number
    pending: number
    accepted: number
    rejected: number
  }> {
    const [totalResult, pendingResult, acceptedResult, rejectedResult] = await Promise.all([
      db.rawQuery('SELECT COUNT(*) as count FROM job_applications WHERE user_id = ?', [userId]),
      db.rawQuery(
        'SELECT COUNT(*) as count FROM job_applications WHERE user_id = ? AND status = ?',
        [userId, JobApplicationStatus.PENDING]
      ),
      db.rawQuery(
        'SELECT COUNT(*) as count FROM job_applications WHERE user_id = ? AND status = ?',
        [userId, JobApplicationStatus.ACCEPTED]
      ),
      db.rawQuery(
        'SELECT COUNT(*) as count FROM job_applications WHERE user_id = ? AND status = ?',
        [userId, JobApplicationStatus.REJECTED]
      ),
    ])

    return {
      total: totalResult.rows[0].count,
      pending: pendingResult.rows[0].count,
      accepted: acceptedResult.rows[0].count,
      rejected: rejectedResult.rows[0].count,
    }
  }

  /**
   * Get recent applications
   * @param limit - The number of recent applications to retrieve
   * @returns Recent job applications
   */
  async getRecentApplications(limit: number = 10): Promise<JobApplication[]> {
    return JobApplication.query()
      .preload('job')
      .preload('user')
      .orderBy('created_at', 'asc')
      .limit(limit)
  }

  /**
   * Get applications for jobs posted by a specific company
   * @param companyId - The ID of the company
   * @param filters - Additional filters
   * @returns Applications for the company's jobs
   */
  async getCompanyJobApplications(
    companyId: string,
    filters: {
      page?: number
      limit?: number
      status?: JobApplicationStatus
    } = {}
  ) {
    const { page = 1, limit = 10, status } = filters

    let queryBuilder = JobApplication.query()
      .preload('job')
      .preload('user')
      .whereHas('job', (jobQuery) => {
        jobQuery.whereHas('user', (userQuery) => {
          userQuery.where('companyId', companyId)
        })
      })
      .orderBy('created_at', 'asc')

    if (status) {
      queryBuilder = queryBuilder.andWhere('status', status)
    }

    const applications = await queryBuilder.paginate(page, limit)

    return applications
  }

  /**
   * Check if a job has any applications
   * @param jobId - The ID of the job
   * @returns True if the job has applications
   */
  async jobHasApplications(jobId: string): Promise<boolean> {
    const count = await JobApplication.query().where('jobId', jobId).count('*', 'total')
    const result = count[0].$extras as { total: number }
    return result.total > 0
  }
}
