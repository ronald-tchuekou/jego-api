import env from '#start/env';
import { BaseMail } from '@adonisjs/mail';
export default class ResetPasswordNotification extends BaseMail {
    email;
    resetToken;
    from = `JeGo <${env.get('SMTP_FROM')}>`;
    subject = 'Reset Your Password';
    constructor(email, resetToken) {
        super();
        this.email = email;
        this.resetToken = resetToken;
    }
    prepare() {
        this.message.to(this.email).htmlView('emails/reset_password/html', {
            resetToken: this.resetToken,
            resetUrl: `${env.get('FRONTEND_URL_RESET_PASSWORD')}?token=${this.resetToken}`,
        });
    }
}
//# sourceMappingURL=reset_password_notification.js.map