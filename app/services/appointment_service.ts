import Appointment, { AppointmentStatus } from '#models/appointment'
import Company from '#models/company'
import User from '#models/user'
import { DateTime } from 'luxon'

export { AppointmentStatus }

export default class AppointmentService {
  private fields: (keyof Appointment)[] = [
    'companyId',
    'userId',
    'date',
    'time',
    'status',
    'subject',
    'content',
    'isRead',
  ]

  /**
   * Create a new appointment
   * @param data - The data to create the appointment
   * @param user - The user creating the appointment
   * @returns The created appointment
   * @throws Error if required fields are missing
   */
  async create(data: Partial<Appointment>, user: User): Promise<Appointment> {
    const appointment = new Appointment()

    // Validate required fields
    const requiredFields: (keyof Appointment)[] = [
      'companyId',
      'date',
      'time',
      'subject',
      'content',
    ]
    requiredFields.forEach((field) => {
      if (!data[field]) {
        throw new Error(`${field} is required to create an appointment`)
      }
    })

    // Verify the company exists
    const company = await Company.find(data.companyId!)
    if (!company) {
      throw new Error('Company not found')
    }

    // Set the user ID from the authenticated user
    appointment.userId = user.id

    // Set default status if not provided
    if (!data.status) {
      appointment.status = AppointmentStatus.PENDING
    }

    // Set default isRead to false
    appointment.isRead = false

    // Set other fields from data
    this.fields.forEach((field) => {
      if (field !== 'userId' && data[field] !== undefined) {
        appointment[field] = data[field] as never
      }
    })

    const savedAppointment = await appointment.save()
    await savedAppointment.load('user')
    await savedAppointment.load('company')

    return savedAppointment
  }

  /**
   * Update an existing appointment
   * @param appointmentId - The ID of the appointment to update
   * @param data - The data to update
   * @returns The updated appointment
   * @throws Error if the appointment is not found
   */
  async update(appointmentId: string, data: Partial<Appointment>): Promise<Appointment> {
    const appointment = await Appointment.findOrFail(appointmentId)

    this.fields.forEach((field) => {
      if (field !== 'userId' && data[field] !== undefined) {
        appointment[field] = data[field] as never
      }
    })

    const savedAppointment = await appointment.save()
    await savedAppointment.load('user')
    await savedAppointment.load('company')

    return savedAppointment
  }

  /**
   * Get appointments with pagination and filters
   * @param filters - The filters
   * @returns The appointments with pagination
   */
  async getAll(filters: {
    search?: string
    page?: number
    limit?: number
    userId?: string
    companyId?: string
    status?: AppointmentStatus
    dateFrom?: string
    dateTo?: string
  }) {
    const {
      search = '',
      page = 1,
      limit = 10,
      userId,
      companyId,
      status,
      dateFrom,
      dateTo,
    } = filters

    let queryBuilder = Appointment.query()
      .preload('user')
      .preload('company')
      .orderBy('date', 'desc')
      .orderBy('time', 'desc')

    // Apply search filter
    if (search) {
      queryBuilder = queryBuilder.where((query) => {
        query.whereILike('subject', `%${search}%`)
        query.orWhereILike('content', `%${search}%`)
      })
    }

    // Apply additional filters
    if (userId) {
      queryBuilder = queryBuilder.andWhere('userId', userId)
    }

    if (companyId) {
      queryBuilder = queryBuilder.andWhere('companyId', companyId)
    }

    if (status) {
      queryBuilder = queryBuilder.andWhere('status', status)
    }

    // Apply date range filters
    if (dateFrom) {
      queryBuilder = queryBuilder.andWhere('date', '>=', new Date(dateFrom))
    }

    if (dateTo) {
      queryBuilder = queryBuilder.andWhere('date', '<=', new Date(dateTo))
    }

    const appointments = await queryBuilder.paginate(page, limit)

    return appointments
  }

  /**
   * Get the total number of appointments
   * @param filters - The filters
   * @returns The total number of appointments
   */
  async getTotal(
    filters: { companyId?: string; userId?: string; status?: AppointmentStatus } = {}
  ): Promise<number> {
    const { companyId, userId, status } = filters

    let queryBuilder = Appointment.query()

    if (companyId) {
      queryBuilder = queryBuilder.where('companyId', companyId)
    }

    if (userId) {
      queryBuilder = queryBuilder.where('userId', userId)
    }

    if (status) {
      queryBuilder = queryBuilder.where('status', status)
    }

    const result = await queryBuilder.count('*', 'total')
    const item = result[0].$extras as { total: number }

    return item.total
  }

  /**
   * Find an appointment by ID
   * @param appointmentId - The ID of the appointment to find
   * @returns The appointment with relationships loaded
   */
  async findById(appointmentId: string): Promise<Appointment | null> {
    return Appointment.query().where('id', appointmentId).preload('user').preload('company').first()
  }

  /**
   * Find appointments by user ID
   * @param userId - The ID of the user
   * @param filters - Additional filters
   * @returns The user's appointments
   */
  async findByUserId(
    userId: string,
    filters: {
      page?: number
      limit?: number
      status?: AppointmentStatus
      dateFrom?: string
      dateTo?: string
    } = {}
  ) {
    const { page = 1, limit = 10, status, dateFrom, dateTo } = filters

    let queryBuilder = Appointment.query()
      .where('userId', userId)
      .preload('user')
      .preload('company')
      .orderBy('date', 'desc')
      .orderBy('time', 'desc')

    // Apply additional filters
    if (status) {
      queryBuilder = queryBuilder.andWhere('status', status)
    }

    // Apply date range filters
    if (dateFrom) {
      queryBuilder = queryBuilder.andWhere('date', '>=', new Date(dateFrom))
    }

    if (dateTo) {
      queryBuilder = queryBuilder.andWhere('date', '<=', new Date(dateTo))
    }

    const appointments = await queryBuilder.paginate(page, limit)

    return appointments
  }

  /**
   * Find appointments by company ID
   * @param companyId - The ID of the company
   * @param filters - Additional filters
   * @returns The company's appointments
   */
  async findByCompanyId(
    companyId: string,
    filters: {
      page?: number
      limit?: number
      status?: AppointmentStatus
      dateFrom?: string
      dateTo?: string
    } = {}
  ) {
    const { page = 1, limit = 10, status, dateFrom, dateTo } = filters

    let queryBuilder = Appointment.query()
      .where('companyId', companyId)
      .preload('user')
      .preload('company')
      .orderBy('date', 'desc')
      .orderBy('time', 'desc')

    // Apply additional filters
    if (status) {
      queryBuilder = queryBuilder.andWhere('status', status)
    }

    // Apply date range filters
    if (dateFrom) {
      queryBuilder = queryBuilder.andWhere('date', '>=', new Date(dateFrom))
    }

    if (dateTo) {
      queryBuilder = queryBuilder.andWhere('date', '<=', new Date(dateTo))
    }

    const appointments = await queryBuilder.paginate(page, limit)

    return appointments
  }

  /**
   * Delete an appointment by ID
   * @param appointmentId - The ID of the appointment to delete
   * @returns True if deleted successfully
   * @throws Error if appointment is not found
   */
  async delete(appointmentId: string): Promise<boolean> {
    const appointment = await Appointment.findOrFail(appointmentId)
    await appointment.delete()
    return true
  }

  /**
   * Update appointment status
   * @param appointmentId - The ID of the appointment to update
   * @param status - The new status
   * @returns The updated appointment
   * @throws Error if appointment is not found
   */
  async updateStatus(appointmentId: string, status: AppointmentStatus): Promise<Appointment> {
    const appointment = await Appointment.findOrFail(appointmentId)
    appointment.status = status
    const savedAppointment = await appointment.save()
    await savedAppointment.load('user')
    await savedAppointment.load('company')
    return savedAppointment
  }

  /**
   * Mark appointment as read
   * @param appointmentId - The ID of the appointment to mark as read
   * @returns The updated appointment
   * @throws Error if appointment is not found
   */
  async markAsRead(appointmentId: string): Promise<Appointment> {
    const appointment = await Appointment.findOrFail(appointmentId)
    appointment.isRead = true
    const savedAppointment = await appointment.save()
    await savedAppointment.load('user')
    await savedAppointment.load('company')
    return savedAppointment
  }

  /**
   * Get upcoming appointments
   * @param filters - Additional filters
   * @returns Upcoming appointments
   */
  async getUpcomingAppointments(
    filters: {
      page?: number
      limit?: number
      userId?: string
      companyId?: string
      days?: number
    } = {}
  ) {
    const { page = 1, limit = 10, userId, companyId, days = 7 } = filters

    const futureDate = DateTime.now().plus({ days }).toSQL()

    let queryBuilder = Appointment.query()
      .where('date', '>=', DateTime.now().toSQL())
      .andWhere('date', '<=', futureDate)
      .preload('user')
      .preload('company')
      .orderBy('date', 'asc')
      .orderBy('time', 'asc')

    if (userId) {
      queryBuilder = queryBuilder.andWhere('userId', userId)
    }

    if (companyId) {
      queryBuilder = queryBuilder.andWhere('companyId', companyId)
    }

    const appointments = await queryBuilder.paginate(page, limit)

    return appointments
  }

  /**
   * Get appointments statistics
   * @param companyId - Optional company ID to filter by
   * @returns Object with various appointment statistics
   */
  async getStatistics(companyId?: string): Promise<{
    total: number
    pending: number
    confirmed: number
    cancelled: number
    completed: number
    unread: number
  }> {
    let baseQuery = Appointment.query()

    if (companyId) {
      baseQuery = baseQuery.where('companyId', companyId)
    }

    const [
      totalResult,
      pendingResult,
      confirmedResult,
      cancelledResult,
      completedResult,
      unreadResult,
    ] = await Promise.all([
      baseQuery.clone().count('*', 'total'),
      baseQuery.clone().where('status', AppointmentStatus.PENDING).count('*', 'total'),
      baseQuery.clone().where('status', AppointmentStatus.CONFIRMED).count('*', 'total'),
      baseQuery.clone().where('status', AppointmentStatus.CANCELLED).count('*', 'total'),
      baseQuery.clone().where('status', AppointmentStatus.COMPLETED).count('*', 'total'),
      baseQuery.clone().where('isRead', false).count('*', 'total'),
    ])

    return {
      total: totalResult[0].$extras.total,
      pending: pendingResult[0].$extras.total,
      confirmed: confirmedResult[0].$extras.total,
      cancelled: cancelledResult[0].$extras.total,
      completed: completedResult[0].$extras.total,
      unread: unreadResult[0].$extras.total,
    }
  }
}
