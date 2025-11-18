import PasswordResetSuccessNotification from '#mails/password_reset_success_notification';
import mail from '@adonisjs/mail/services/main';
export default class SendUserPasswordChangedEmail {
    async handle(event) {
        if (true)
            return;
        await mail.send(new PasswordResetSuccessNotification(event.user.email, event.user.firstName));
    }
}
//# sourceMappingURL=send_user_password_changed_email.js.map