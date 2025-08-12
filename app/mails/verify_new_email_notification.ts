import env from '#start/env'
import { BaseMail } from '@adonisjs/mail'

export default class VerifyNewEmailNotification extends BaseMail {
  from = `JeGo <${env.get('SMTP_FROM')}>`
  replyTo = env.get('SMTP_FROM')
  subject = 'Verify new email address'

  constructor(
    private newEmail: string,
    private token: string
  ) {
    super()
  }

  /**
   * The "prepare" method is called automatically when
   * the email is sent or queued.
   */
  prepare() {
    this.message.to(this.newEmail)
    this.message.subject(this.subject)
    this.message.htmlView('emails/verify_new_email/html', {
      token: this.token,
    })
  }
}
