import env from '#start/env'
import { BaseMail } from '@adonisjs/mail'
import { DateTime } from 'luxon'

export default class AppointmentNotification extends BaseMail {
  from = `JeGo <${env.get('SMTP_FROM')}>`
  replyTo = env.get('SMTP_FROM')
  subject = 'New Appointment Request'

  constructor(
    private companyEmail: string,
    private companyName: string,
    private userDisplayName: string,
    private userEmail: string,
    private appointmentDate: DateTime,
    private appointmentTime: string,
    private appointmentSubject: string,
    private appointmentContent: string
  ) {
    super()
  }

  /**
   * The "prepare" method is called automatically when
   * the email is sent or queued.
   */
  prepare() {
    this.message.to(this.companyEmail)
    this.message.subject(`${this.subject} - ${this.appointmentSubject}`)
    this.message.htmlView('emails/appointment_notification/html', {
      companyName: this.companyName,
      userDisplayName: this.userDisplayName,
      userEmail: this.userEmail,
      appointmentDate: this.appointmentDate.toFormat('DDDD'), // Full date format
      appointmentTime: this.appointmentTime,
      appointmentSubject: this.appointmentSubject,
      appointmentContent: this.appointmentContent,
      dashboardUrl: env.get('FRONTEND_URL'),
    })
  }
}
