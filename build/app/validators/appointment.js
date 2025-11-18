import { AppointmentStatus } from '#models/appointment';
import vine from '@vinejs/vine';
export const storeAppointmentValidator = vine.compile(vine.object({
    companyId: vine.string().trim().uuid(),
    date: vine.date({ formats: ['YYYY-MM-DD', 'YYYY-MM-DD HH:mm:ss'] }),
    time: vine
        .string()
        .trim()
        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    subject: vine.string().trim().minLength(3).maxLength(255),
    content: vine.string().trim().minLength(10).maxLength(2000),
    status: vine.enum(AppointmentStatus).optional(),
}));
export const updateAppointmentValidator = vine.compile(vine.object({
    date: vine.date({ formats: ['YYYY-MM-DD'] }).optional(),
    time: vine
        .string()
        .trim()
        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .optional(),
    subject: vine.string().trim().minLength(3).maxLength(255).optional(),
    content: vine.string().trim().minLength(10).maxLength(2000).optional(),
    status: vine.enum(AppointmentStatus).optional(),
    isRead: vine.boolean().optional(),
}));
export const updateAppointmentStatusValidator = vine.compile(vine.object({
    status: vine.enum(AppointmentStatus),
}));
//# sourceMappingURL=appointment.js.map