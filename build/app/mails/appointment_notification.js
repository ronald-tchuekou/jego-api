import env from '#start/env';
import { BaseMail } from '@adonisjs/mail';
export default class AppointmentNotification extends BaseMail {
    companyEmail;
    companyName;
    userDisplayName;
    userEmail;
    appointmentDate;
    appointmentTime;
    appointmentSubject;
    appointmentContent;
    from = `JeGo <${env.get('SMTP_FROM')}>`;
    replyTo = env.get('SMTP_FROM');
    subject = 'New Appointment Request';
    constructor(companyEmail, companyName, userDisplayName, userEmail, appointmentDate, appointmentTime, appointmentSubject, appointmentContent) {
        super();
        this.companyEmail = companyEmail;
        this.companyName = companyName;
        this.userDisplayName = userDisplayName;
        this.userEmail = userEmail;
        this.appointmentDate = appointmentDate;
        this.appointmentTime = appointmentTime;
        this.appointmentSubject = appointmentSubject;
        this.appointmentContent = appointmentContent;
    }
    prepare() {
        this.message.to(this.companyEmail);
        this.message.subject(`${this.subject} - ${this.appointmentSubject}`);
        this.message.htmlView('emails/appointment_notification/html', {
            companyName: this.companyName,
            userDisplayName: this.userDisplayName,
            userEmail: this.userEmail,
            appointmentDate: this.appointmentDate.toFormat('DDDD'),
            appointmentTime: this.appointmentTime,
            appointmentSubject: this.appointmentSubject,
            appointmentContent: this.appointmentContent,
            dashboardUrl: env.get('FRONTEND_URL'),
        });
    }
}
//# sourceMappingURL=appointment_notification.js.map