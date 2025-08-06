import env from '#start/env'
import { BaseMail } from '@adonisjs/mail'

export default class VerifyEmailNotification extends BaseMail {
  from = `JeGo <${env.get('SMTP_FROM')}>`
  replyTo = env.get('SMTP_FROM')
  subject = 'Verify email address'

  constructor(
    private userEmail: string,
    private userId: string,
    private token: string
  ) {
    super()
  }

  /**
   * The "prepare" method is called automatically when
   * the email is sent or queued.
   */
  prepare() {
    this.message.to(this.userEmail)
    this.message.subject(this.subject)
    this.message.htmlView('emails/verify_email/html', {
      tokenLink: `${env.get('FRONTEND_URL_VERIFY')}?token=${this.token}&userId=${this.userId}`,
    })
  }
}
