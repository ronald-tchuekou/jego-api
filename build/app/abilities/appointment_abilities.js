import { UserRole } from '#models/user';
import { Bouncer } from '@adonisjs/bouncer';
export const createAppointment = Bouncer.ability((user) => {
    return user.role === UserRole.USER || user.role === UserRole.ADMIN;
});
export const readAppointment = Bouncer.ability((user, appointment) => {
    if (user.role === UserRole.ADMIN) {
        return true;
    }
    if (!appointment) {
        return true;
    }
    if (user.id === appointment.userId) {
        return true;
    }
    if ((user.role === UserRole.COMPANY_ADMIN || user.role === UserRole.COMPANY_AGENT) &&
        user.companyId === appointment.companyId) {
        return true;
    }
    return false;
});
export const editAppointment = Bouncer.ability((user, appointment) => {
    if (user.role === UserRole.ADMIN) {
        return true;
    }
    if (user.id === appointment.userId &&
        appointment.status !== 'confirmed' &&
        appointment.status !== 'completed') {
        return true;
    }
    if (user.role === UserRole.COMPANY_ADMIN && user.companyId === appointment.companyId) {
        return true;
    }
    return false;
});
export const deleteAppointment = Bouncer.ability((user, appointment) => {
    if (user.role === UserRole.ADMIN) {
        return true;
    }
    if (user.id === appointment.userId &&
        appointment.status !== 'confirmed' &&
        appointment.status !== 'completed') {
        return true;
    }
    if (user.role === UserRole.COMPANY_ADMIN && user.companyId === appointment.companyId) {
        return true;
    }
    return false;
});
export const manageAppointmentStatus = Bouncer.ability((user, appointment) => {
    if (user.role === UserRole.ADMIN) {
        return true;
    }
    if ((user.role === UserRole.COMPANY_ADMIN || user.role === UserRole.COMPANY_AGENT) &&
        user.companyId === appointment.companyId) {
        return true;
    }
    return false;
});
export const readAppointmentStatistics = Bouncer.ability((user) => {
    return (user.role === UserRole.ADMIN ||
        user.role === UserRole.COMPANY_ADMIN ||
        user.role === UserRole.COMPANY_AGENT);
});
//# sourceMappingURL=appointment_abilities.js.map