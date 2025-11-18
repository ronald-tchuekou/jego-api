import env from '#start/env';
import { BaseMail } from '@adonisjs/mail';
export default class PasswordResetSuccessNotification extends BaseMail {
    email;
    firstName;
    from = `JeGo <${env.get('SMTP_FROM')}>`;
    subject = 'Password Reset Successful';
    constructor(email, firstName) {
        super();
        this.email = email;
        this.firstName = firstName;
    }
    prepare() {
        this.message.to(this.email).htmlView('emails/password_reset_success/html', {
            firstName: this.firstName,
        });
    }
}
//# sourceMappingURL=password_reset_success_notification.js.map