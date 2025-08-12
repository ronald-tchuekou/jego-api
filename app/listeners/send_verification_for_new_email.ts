import UserUpdateEmailRequested from '#events/user_update_email_requested'
import VerifyNewEmailNotification from '#mails/verify_new_email_notification'
import { UserTokenService } from '#services/user_token_service'
import { inject } from '@adonisjs/core'
import mail from '@adonisjs/mail/services/main'

export default class SendVerificationForNewEmail {
  @inject()
  async handle(event: UserUpdateEmailRequested, userTokensService: UserTokenService) {
    const token = await userTokensService.generateNumeric(event.user)
    await mail.send(new VerifyNewEmailNotification(event.user.updateEmailRequest!, token))
  }
}
