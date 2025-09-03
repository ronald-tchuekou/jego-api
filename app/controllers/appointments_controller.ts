import {
  createAppointment,
  deleteAppointment,
  editAppointment,
  manageAppointmentStatus,
  readAppointment,
  readAppointmentStatistics,
} from '#abilities/appointment_abilities'
import AppointmentCreated from '#events/appointment_created'
import AppointmentService from '#services/appointment_service'
import {
  storeAppointmentValidator,
  updateAppointmentStatusValidator,
  updateAppointmentValidator,
} from '#validators/appointment'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

@inject()
export default class AppointmentsController {
  constructor(protected appointmentService: AppointmentService) {}

  /**
   * Display a list of appointments
   */
  async index({ request, response, auth, bouncer }: HttpContext) {
    try {
      await bouncer.authorize(readAppointment)

      const {
        search = '',
        page = 1,
        limit = 10,
        userId,
        companyId,
        status,
        dateFrom,
        dateTo,
      } = request.qs()

      const user = auth.getUserOrFail()

      // Apply user-specific filters based on role
      let filters: any = { search, page, limit, status, dateFrom, dateTo }

      if (user.role === 'user') {
        filters.userId = user.id
      } else if (user.role === 'company:admin' || user.role === 'company:agent') {
        filters.companyId = user.companyId
      } else if (user.role === 'admin') {
        // Admins can see all, but can filter by userId or companyId if provided
        if (userId) filters.userId = userId
        if (companyId) filters.companyId = companyId
      }

      const appointments = await this.appointmentService.getAll(filters)

      return response.ok(appointments)
    } catch (error) {
      return response.badRequest({
        message: 'Failed to retrieve appointments',
        error: error.message,
      })
    }
  }

  /**
   * Create a new appointment
   */
  async store({ request, response, auth, bouncer }: HttpContext) {
    try {
      await bouncer.authorize(createAppointment)

      const user = auth.getUserOrFail()
      const payload = await request.validateUsing(storeAppointmentValidator)

      const appointment = await this.appointmentService.create(
        { ...payload, date: DateTime.fromJSDate(payload.date) },
        user
      )

      // Emit event for email notification
      AppointmentCreated.dispatch(appointment)

      return response.created({
        message: 'Appointment created successfully',
        data: appointment,
      })
    } catch (error) {
      return response.badRequest({
        message: 'Failed to create appointment',
        error: error.message,
      })
    }
  }

  /**
   * Show a specific appointment
   */
  async show({ params, response, bouncer }: HttpContext) {
    try {
      const appointment = await this.appointmentService.findById(params.id)

      if (!appointment) {
        return response.notFound({
          message: 'Appointment not found',
        })
      }

      await bouncer.authorize(readAppointment, appointment)

      return response.ok({
        message: 'Appointment retrieved successfully',
        data: appointment,
      })
    } catch (error) {
      return response.badRequest({
        message: 'Failed to retrieve appointment',
        error: error.message,
      })
    }
  }

  /**
   * Update an appointment
   */
  async update({ params, request, response, bouncer }: HttpContext) {
    try {
      const appointment = await this.appointmentService.findById(params.id)

      if (!appointment) {
        return response.notFound({
          message: 'Appointment not found',
        })
      }

      await bouncer.authorize(editAppointment, appointment)

      const payload = await request.validateUsing(updateAppointmentValidator)
      const updatedAppointment = await this.appointmentService.update(params.id, {
        ...payload,
        date: payload.date ? DateTime.fromJSDate(payload.date) : undefined,
      })

      return response.ok({
        message: 'Appointment updated successfully',
        data: updatedAppointment,
      })
    } catch (error) {
      return response.badRequest({
        message: 'Failed to update appointment',
        error: error.message,
      })
    }
  }

  /**
   * Delete an appointment
   */
  async destroy({ params, response, bouncer }: HttpContext) {
    try {
      const appointment = await this.appointmentService.findById(params.id)

      if (!appointment) {
        return response.notFound({
          message: 'Appointment not found',
        })
      }

      await bouncer.authorize(deleteAppointment, appointment)

      await this.appointmentService.delete(params.id)

      return response.ok({
        message: 'Appointment deleted successfully',
      })
    } catch (error) {
      return response.badRequest({
        message: 'Failed to delete appointment',
        error: error.message,
      })
    }
  }

  /**
   * Get total appointments count
   */
  async getTotal({ request, response, auth, bouncer }: HttpContext) {
    try {
      await bouncer.authorize(readAppointmentStatistics)

      const { companyId, userId, status } = request.qs()
      const user = auth.getUserOrFail()

      let filters: any = { status }

      // Apply user-specific filters based on role
      if (user.role === 'user') {
        filters.userId = user.id
      } else if (user.role === 'company:admin' || user.role === 'company:agent') {
        filters.companyId = user.companyId
      } else if (user.role === 'admin') {
        if (userId) filters.userId = userId
        if (companyId) filters.companyId = companyId
      }

      const total = await this.appointmentService.getTotal(filters)

      return response.ok({
        message: 'Total appointments count retrieved successfully',
        count: total,
      })
    } catch (error) {
      return response.badRequest({
        message: 'Failed to get total appointments count',
        error: error.message,
      })
    }
  }

  /**
   * Get appointments by user ID
   */
  async getByUser({ params, request, response, auth, bouncer }: HttpContext) {
    try {
      await bouncer.authorize(readAppointment)

      const user = auth.getUserOrFail()
      const userId = params.userId

      // Users can only see their own appointments unless they're admin or company staff
      if (user.role === 'user' && user.id !== userId) {
        return response.forbidden({
          message: 'You can only view your own appointments',
        })
      }

      const { page = 1, limit = 10, status, dateFrom, dateTo } = request.qs()

      const appointments = await this.appointmentService.findByUserId(userId, {
        page,
        limit,
        status,
        dateFrom,
        dateTo,
      })

      return response.ok({
        message: 'User appointments retrieved successfully',
        data: appointments,
      })
    } catch (error) {
      return response.badRequest({
        message: 'Failed to retrieve user appointments',
        error: error.message,
      })
    }
  }

  /**
   * Get appointments by company ID
   */
  async getByCompany({ params, request, response, auth, bouncer }: HttpContext) {
    try {
      await bouncer.authorize(readAppointment)

      const user = auth.getUserOrFail()
      const companyId = params.companyId

      // Company staff can only see their own company's appointments
      if (
        (user.role === 'company:admin' || user.role === 'company:agent') &&
        user.companyId !== companyId
      ) {
        return response.forbidden({
          message: 'You can only view appointments for your company',
        })
      }

      const { page = 1, limit = 10, status, dateFrom, dateTo } = request.qs()

      const appointments = await this.appointmentService.findByCompanyId(companyId, {
        page,
        limit,
        status,
        dateFrom,
        dateTo,
      })

      return response.ok(appointments)
    } catch (error) {
      return response.badRequest({
        message: 'Failed to retrieve company appointments',
        error: error.message,
      })
    }
  }

  /**
   * Update appointment status
   */
  async updateStatus({ params, request, response, bouncer }: HttpContext) {
    try {
      const appointment = await this.appointmentService.findById(params.id)

      if (!appointment) {
        return response.notFound({
          message: 'Appointment not found',
        })
      }

      await bouncer.authorize(manageAppointmentStatus, appointment)

      const payload = await request.validateUsing(updateAppointmentStatusValidator)
      const updatedAppointment = await this.appointmentService.updateStatus(
        params.id,
        payload.status
      )

      return response.ok({
        message: 'Appointment status updated successfully',
        data: updatedAppointment,
      })
    } catch (error) {
      return response.badRequest({
        message: 'Failed to update appointment status',
        error: error.message,
      })
    }
  }

  /**
   * Mark appointment as read
   */
  async markAsRead({ params, response, bouncer }: HttpContext) {
    try {
      const appointment = await this.appointmentService.findById(params.id)

      if (!appointment) {
        return response.notFound({
          message: 'Appointment not found',
        })
      }

      await bouncer.authorize(readAppointment, appointment)

      const updatedAppointment = await this.appointmentService.markAsRead(params.id)

      return response.ok({
        message: 'Appointment marked as read successfully',
        data: updatedAppointment,
      })
    } catch (error) {
      return response.badRequest({
        message: 'Failed to mark appointment as read',
        error: error.message,
      })
    }
  }

  /**
   * Get upcoming appointments
   */
  async getUpcoming({ request, response, auth, bouncer }: HttpContext) {
    try {
      await bouncer.authorize(readAppointment)

      const user = auth.getUserOrFail()
      const { page = 1, limit = 10, days = 7 } = request.qs()

      let filters: any = { page, limit, days }

      // Apply user-specific filters based on role
      if (user.role === 'user') {
        filters.userId = user.id
      } else if (user.role === 'company:admin' || user.role === 'company:agent') {
        filters.companyId = user.companyId
      }

      const appointments = await this.appointmentService.getUpcomingAppointments(filters)

      return response.ok(appointments)
    } catch (error) {
      return response.badRequest({
        message: 'Failed to retrieve upcoming appointments',
        error: error.message,
      })
    }
  }

  /**
   * Get appointment statistics
   */
  async getStatistics({ request, response, auth, bouncer }: HttpContext) {
    try {
      await bouncer.authorize(readAppointmentStatistics)

      const user = auth.getUserOrFail()
      const { companyId } = request.qs()

      let filterCompanyId = companyId

      // Apply user-specific filters based on role
      if (user.role === 'company:admin' || user.role === 'company:agent') {
        filterCompanyId = user.companyId
      }

      const statistics = await this.appointmentService.getStatistics(filterCompanyId)

      return response.ok({ data: statistics })
    } catch (error) {
      return response.badRequest({
        message: 'Failed to retrieve appointment statistics',
        error: error.message,
      })
    }
  }
}
