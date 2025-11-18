import ResetPasswordNotification from '#mails/reset_password_notification';
import mail from '@adonisjs/mail/services/main';
export default class SendPasswordResetEmail {
    async handle(event) {
        if (true)
            return;
        await mail.send(new ResetPasswordNotification(event.user.email, event.resetToken));
    }
}
//# sourceMappingURL=send_password_reset_email.js.map