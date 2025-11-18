import env from '#start/env';
import { BaseMail } from '@adonisjs/mail';
export default class VerifyEmailNotification extends BaseMail {
    userEmail;
    userId;
    token;
    from = `JeGo <${env.get('SMTP_FROM')}>`;
    replyTo = env.get('SMTP_FROM');
    subject = 'Verify email address';
    constructor(userEmail, userId, token) {
        super();
        this.userEmail = userEmail;
        this.userId = userId;
        this.token = token;
    }
    prepare() {
        this.message.to(this.userEmail);
        this.message.subject(this.subject);
        this.message.htmlView('emails/verify_email/html', {
            tokenLink: `${env.get('FRONTEND_URL_VERIFY')}?token=${this.token}&userId=${this.userId}`,
        });
    }
}
//# sourceMappingURL=verify_email_notification.js.map