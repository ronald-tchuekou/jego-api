var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import AppointmentCreated from '#events/appointment_created';
import AppointmentNotification from '#mails/appointment_notification';
import User, { UserRole } from '#models/user';
import { inject } from '@adonisjs/core';
import mail from '@adonisjs/mail/services/main';
export default class SendAppointmentNotification {
    async handle(event) {
        if (true)
            return;
        const appointment = event.appointment;
        if (!appointment.user) {
            await appointment.load('user');
        }
        if (!appointment.company) {
            await appointment.load('company');
        }
        const companyAdmins = await User.query()
            .where('companyId', appointment.companyId)
            .where('role', UserRole.COMPANY_ADMIN);
        for (const admin of companyAdmins) {
            await mail.send(new AppointmentNotification(admin.email, appointment.company.name, appointment.user.displayName ||
                `${appointment.user.firstName} ${appointment.user.lastName}`.trim(), appointment.user.email, appointment.date, appointment.time, appointment.subject, appointment.content));
        }
        const adminEmails = companyAdmins.map((admin) => admin.email);
        if (appointment.company.email && !adminEmails.includes(appointment.company.email)) {
            await mail.send(new AppointmentNotification(appointment.company.email, appointment.company.name, appointment.user.displayName ||
                `${appointment.user.firstName} ${appointment.user.lastName}`.trim(), appointment.user.email, appointment.date, appointment.time, appointment.subject, appointment.content));
        }
    }
}
__decorate([
    inject(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AppointmentCreated]),
    __metadata("design:returntype", Promise)
], SendAppointmentNotification.prototype, "handle", null);
//# sourceMappingURL=send_appointment_notification.js.map