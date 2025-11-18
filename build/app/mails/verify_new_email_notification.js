import env from '#start/env';
import { BaseMail } from '@adonisjs/mail';
export default class VerifyNewEmailNotification extends BaseMail {
    newEmail;
    token;
    from = `JeGo <${env.get('SMTP_FROM')}>`;
    replyTo = env.get('SMTP_FROM');
    subject = 'Verify new email address';
    constructor(newEmail, token) {
        super();
        this.newEmail = newEmail;
        this.token = token;
    }
    prepare() {
        this.message.to(this.newEmail);
        this.message.subject(this.subject);
        this.message.htmlView('emails/verify_new_email/html', {
            token: this.token,
        });
    }
}
//# sourceMappingURL=verify_new_email_notification.js.map