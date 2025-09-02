import AppointmentCreated from '#events/appointment_created'
import AppointmentNotification from '#mails/appointment_notification'
import User, { UserRole } from '#models/user'
import { inject } from '@adonisjs/core'
import mail from '@adonisjs/mail/services/main'

export default class SendAppointmentNotification {
  @inject()
  async handle(event: AppointmentCreated) {
    const appointment = event.appointment

    // Load the user and company relationships if not already loaded
    if (!appointment.user) {
      await appointment.load('user')
    }
    if (!appointment.company) {
      await appointment.load('company')
    }

    // Find company admins to notify
    const companyAdmins = await User.query()
      .where('companyId', appointment.companyId)
      .where('role', UserRole.COMPANY_ADMIN)

    // Send notification to each company admin
    for (const admin of companyAdmins) {
      await mail.send(
        new AppointmentNotification(
          admin.email,
          appointment.company.name,
          appointment.user.displayName ||
            `${appointment.user.firstName} ${appointment.user.lastName}`.trim(),
          appointment.user.email,
          appointment.date,
          appointment.time,
          appointment.subject,
          appointment.content
        )
      )
    }

    // Also send to the company's main email if different from admin emails
    const adminEmails = companyAdmins.map((admin) => admin.email)
    if (appointment.company.email && !adminEmails.includes(appointment.company.email)) {
      await mail.send(
        new AppointmentNotification(
          appointment.company.email,
          appointment.company.name,
          appointment.user.displayName ||
            `${appointment.user.firstName} ${appointment.user.lastName}`.trim(),
          appointment.user.email,
          appointment.date,
          appointment.time,
          appointment.subject,
          appointment.content
        )
      )
    }
  }
}
