import PasswordResetSuccessNotification from '#mails/password_reset_success_notification';
import mail from '@adonisjs/mail/services/main';
export default class SendPasswordResetSuccessEmail {
    async handle(event) {
        if (true)
            return;
        await mail.send(new PasswordResetSuccessNotification(event.user.email, event.user.firstName));
    }
}
//# sourceMappingURL=send_password_reset_success_email.js.map