import Appointment, { AppointmentStatus } from '#models/appointment';
import Company from '#models/company';
import { DateTime } from 'luxon';
export { AppointmentStatus };
export default class AppointmentService {
    fields = [
        'companyId',
        'userId',
        'date',
        'time',
        'status',
        'subject',
        'content',
        'isRead',
    ];
    async create(data, user) {
        const appointment = new Appointment();
        const requiredFields = [
            'companyId',
            'date',
            'time',
            'subject',
            'content',
        ];
        requiredFields.forEach((field) => {
            if (!data[field]) {
                throw new Error(`${field} is required to create an appointment`);
            }
        });
        const company = await Company.find(data.companyId);
        if (!company) {
            throw new Error('Company not found');
        }
        appointment.userId = user.id;
        if (!data.status) {
            appointment.status = AppointmentStatus.PENDING;
        }
        appointment.isRead = false;
        this.fields.forEach((field) => {
            if (field !== 'userId' && data[field] !== undefined) {
                appointment[field] = data[field];
            }
        });
        const savedAppointment = await appointment.save();
        await savedAppointment.load('user');
        await savedAppointment.load('company');
        return savedAppointment;
    }
    async update(appointmentId, data) {
        const appointment = await Appointment.findOrFail(appointmentId);
        this.fields.forEach((field) => {
            if (field !== 'userId' && data[field] !== undefined) {
                appointment[field] = data[field];
            }
        });
        const savedAppointment = await appointment.save();
        await savedAppointment.load('user');
        await savedAppointment.load('company');
        return savedAppointment;
    }
    async getAll(filters) {
        const { search = '', page = 1, limit = 10, userId, companyId, status, dateFrom, dateTo, } = filters;
        let queryBuilder = Appointment.query()
            .preload('user')
            .preload('company')
            .orderBy('date', 'desc')
            .orderBy('time', 'desc');
        if (search) {
            queryBuilder = queryBuilder.where((query) => {
                query.whereILike('subject', `%${search}%`);
                query.orWhereILike('content', `%${search}%`);
            });
        }
        if (userId) {
            queryBuilder = queryBuilder.andWhere('userId', userId);
        }
        if (companyId) {
            queryBuilder = queryBuilder.andWhere('companyId', companyId);
        }
        if (status) {
            queryBuilder = queryBuilder.andWhere('status', status);
        }
        if (dateFrom) {
            queryBuilder = queryBuilder.andWhere('date', '>=', new Date(dateFrom));
        }
        if (dateTo) {
            queryBuilder = queryBuilder.andWhere('date', '<=', new Date(dateTo));
        }
        const appointments = await queryBuilder.paginate(page, limit);
        return appointments;
    }
    async getTotal(filters = {}) {
        const { companyId, userId, status } = filters;
        let queryBuilder = Appointment.query();
        if (companyId) {
            queryBuilder = queryBuilder.where('companyId', companyId);
        }
        if (userId) {
            queryBuilder = queryBuilder.where('userId', userId);
        }
        if (status) {
            queryBuilder = queryBuilder.where('status', status);
        }
        const result = await queryBuilder.count('*', 'total');
        const item = result[0].$extras;
        return item.total;
    }
    async findById(appointmentId) {
        return Appointment.query().where('id', appointmentId).preload('user').preload('company').first();
    }
    async findByUserId(userId, filters = {}) {
        const { page = 1, limit = 10, status, dateFrom, dateTo } = filters;
        let queryBuilder = Appointment.query()
            .where('userId', userId)
            .preload('user')
            .preload('company')
            .orderBy('date', 'desc')
            .orderBy('time', 'desc');
        if (status) {
            queryBuilder = queryBuilder.andWhere('status', status);
        }
        if (dateFrom) {
            queryBuilder = queryBuilder.andWhere('date', '>=', new Date(dateFrom));
        }
        if (dateTo) {
            queryBuilder = queryBuilder.andWhere('date', '<=', new Date(dateTo));
        }
        const appointments = await queryBuilder.paginate(page, limit);
        return appointments;
    }
    async findByCompanyId(companyId, filters = {}) {
        const { page = 1, limit = 10, status, dateFrom, dateTo } = filters;
        let queryBuilder = Appointment.query()
            .where('companyId', companyId)
            .preload('user')
            .preload('company')
            .orderBy('date', 'desc')
            .orderBy('time', 'desc');
        if (status) {
            queryBuilder = queryBuilder.andWhere('status', status);
        }
        if (dateFrom) {
            queryBuilder = queryBuilder.andWhere('date', '>=', new Date(dateFrom));
        }
        if (dateTo) {
            queryBuilder = queryBuilder.andWhere('date', '<=', new Date(dateTo));
        }
        const appointments = await queryBuilder.paginate(page, limit);
        return appointments;
    }
    async delete(appointmentId) {
        const appointment = await Appointment.findOrFail(appointmentId);
        await appointment.delete();
        return true;
    }
    async updateStatus(appointmentId, status) {
        const appointment = await Appointment.findOrFail(appointmentId);
        appointment.status = status;
        const savedAppointment = await appointment.save();
        await savedAppointment.load('user');
        await savedAppointment.load('company');
        return savedAppointment;
    }
    async markAsRead(appointmentId) {
        const appointment = await Appointment.findOrFail(appointmentId);
        appointment.isRead = true;
        const savedAppointment = await appointment.save();
        await savedAppointment.load('user');
        await savedAppointment.load('company');
        return savedAppointment;
    }
    async getUpcomingAppointments(filters = {}) {
        const { page = 1, limit = 10, userId, companyId, days = 7 } = filters;
        const futureDate = DateTime.now().plus({ days }).toSQL();
        let queryBuilder = Appointment.query()
            .where('date', '>=', DateTime.now().toSQL())
            .andWhere('date', '<=', futureDate)
            .preload('user')
            .preload('company')
            .orderBy('date', 'asc')
            .orderBy('time', 'asc');
        if (userId) {
            queryBuilder = queryBuilder.andWhere('userId', userId);
        }
        if (companyId) {
            queryBuilder = queryBuilder.andWhere('companyId', companyId);
        }
        const appointments = await queryBuilder.paginate(page, limit);
        return appointments;
    }
    async getStatistics(companyId) {
        let baseQuery = Appointment.query();
        if (companyId) {
            baseQuery = baseQuery.where('companyId', companyId);
        }
        const [totalResult, pendingResult, confirmedResult, cancelledResult, completedResult, unreadResult,] = await Promise.all([
            baseQuery.clone().count('*', 'total'),
            baseQuery.clone().where('status', AppointmentStatus.PENDING).count('*', 'total'),
            baseQuery.clone().where('status', AppointmentStatus.CONFIRMED).count('*', 'total'),
            baseQuery.clone().where('status', AppointmentStatus.CANCELLED).count('*', 'total'),
            baseQuery.clone().where('status', AppointmentStatus.COMPLETED).count('*', 'total'),
            baseQuery.clone().where('isRead', false).count('*', 'total'),
        ]);
        return {
            total: totalResult[0].$extras.total,
            pending: pendingResult[0].$extras.total,
            confirmed: confirmedResult[0].$extras.total,
            cancelled: cancelledResult[0].$extras.total,
            completed: completedResult[0].$extras.total,
            unread: unreadResult[0].$extras.total,
        };
    }
}
//# sourceMappingURL=appointment_service.js.map