import Job, { JobStatus } from '#models/job';
import db from '@adonisjs/lucid/services/db';
import { DateTime } from 'luxon';
export default class JobService {
    fields = [
        'userId',
        'title',
        'description',
        'companyName',
        'companyLogo',
        'companyWebsite',
        'companyEmail',
        'companyPhone',
        'companyAddress',
        'companyCity',
        'companyState',
        'companyZip',
        'companyCountry',
        'expiresAt',
        'status',
    ];
    async create(data, user) {
        const job = new Job();
        const requiredFields = ['title', 'description'];
        requiredFields.forEach((field) => {
            if (!data[field]) {
                throw new Error(`${field} is required to create a job`);
            }
        });
        job.userId = user.id;
        if (!data.status) {
            job.status = JobStatus.OPEN;
        }
        this.fields.forEach((field) => {
            if (field !== 'userId' && data[field] !== undefined && field !== 'applicationCount') {
                job[field] = data[field];
            }
        });
        const savedJob = await job.save();
        await savedJob.load('user');
        await savedJob.load('applications');
        return savedJob;
    }
    async update(jobId, data) {
        const job = await Job.findOrFail(jobId);
        this.fields.forEach((field) => {
            if (field !== 'userId' && data[field] !== undefined && field !== 'applicationCount') {
                job[field] = data[field];
            }
        });
        const savedJob = await job.save();
        await savedJob.load('user');
        await savedJob.load('applications');
        return savedJob;
    }
    async getAll(filters) {
        const { search = '', page = 1, limit = 10, userId, status, companyName, expiredOnly = false, activeOnly = false, } = filters;
        let queryBuilder = Job.query()
            .preload('user')
            .preload('applications')
            .orderBy('created_at', 'desc');
        if (search) {
            queryBuilder = queryBuilder.where((query) => {
                query.whereILike('title', `%${search}%`);
                query.orWhereILike('description', `%${search}%`);
                query.orWhereILike('company_name', `%${search}%`);
                query.orWhereILike('company_email', `%${search}%`);
                query.orWhereILike('company_city', `%${search}%`);
            });
        }
        if (userId) {
            queryBuilder = queryBuilder.andWhere('userId', userId);
        }
        if (status) {
            queryBuilder = queryBuilder.andWhere('status', status);
        }
        if (companyName) {
            queryBuilder = queryBuilder.andWhereILike('company_name', `%${companyName}%`);
        }
        if (expiredOnly) {
            queryBuilder = queryBuilder.andWhere('expires_at', '<', DateTime.now().toSQL());
        }
        if (activeOnly) {
            queryBuilder = queryBuilder.andWhere((query) => {
                query.whereNull('expires_at').orWhere('expires_at', '>', DateTime.now().toSQL());
            });
        }
        const jobs = await queryBuilder.paginate(page, limit);
        return jobs;
    }
    async getTotal(companyId) {
        let queryBuilder = Job.query();
        if (companyId) {
            queryBuilder
                .join('users', 'jobs.user_id', 'users.id')
                .join('companies', 'users.company_id', 'companies.id')
                .where('companies.id', companyId);
        }
        const result = await queryBuilder.count('*', 'total');
        const item = result[0].$extras;
        return item.total;
    }
    async findById(jobId) {
        return Job.query().where('id', jobId).preload('user').preload('applications').first();
    }
    async findByUserId(userId, filters = {}) {
        const { page = 1, limit = 10, status, expiredOnly = false, activeOnly = false } = filters;
        let queryBuilder = Job.query()
            .where('userId', userId)
            .preload('user')
            .preload('applications')
            .orderBy('created_at', 'desc');
        if (status) {
            queryBuilder = queryBuilder.andWhere('status', status);
        }
        if (expiredOnly) {
            queryBuilder = queryBuilder.andWhere('expires_at', '<', DateTime.now().toSQL());
        }
        if (activeOnly) {
            queryBuilder = queryBuilder.andWhere((query) => {
                query.whereNull('expires_at').orWhere('expires_at', '>', DateTime.now().toSQL());
            });
        }
        const jobs = await queryBuilder.paginate(page, limit);
        return jobs;
    }
    async delete(jobId) {
        const job = await Job.findOrFail(jobId);
        await job.delete();
        return true;
    }
    async toggleStatus(jobId) {
        const job = await Job.findOrFail(jobId);
        job.status = job.status === JobStatus.OPEN ? JobStatus.CLOSED : JobStatus.OPEN;
        const savedJob = await job.save();
        await savedJob.load('user');
        await savedJob.load('applications');
        return savedJob;
    }
    async closeJob(jobId) {
        const job = await Job.findOrFail(jobId);
        job.status = JobStatus.CLOSED;
        const savedJob = await job.save();
        await savedJob.load('user');
        await savedJob.load('applications');
        return savedJob;
    }
    async reopenJob(jobId) {
        const job = await Job.findOrFail(jobId);
        job.status = JobStatus.OPEN;
        const savedJob = await job.save();
        await savedJob.load('user');
        await savedJob.load('applications');
        return savedJob;
    }
    async setExpiration(jobId, expiresAt) {
        const job = await Job.findOrFail(jobId);
        job.expiresAt = expiresAt ? DateTime.fromJSDate(expiresAt) : null;
        const savedJob = await job.save();
        await savedJob.load('user');
        await savedJob.load('applications');
        return savedJob;
    }
    async getExpiredJobs(filters = {}) {
        const { page = 1, limit = 10, userId } = filters;
        let queryBuilder = Job.query()
            .where('expires_at', '<', DateTime.now().toSQL())
            .preload('user')
            .preload('applications')
            .orderBy('expires_at', 'asc');
        if (userId) {
            queryBuilder = queryBuilder.andWhere('userId', userId);
        }
        const jobs = await queryBuilder.paginate(page, limit);
        return jobs;
    }
    async getActiveJobs(filters = {}) {
        const { page = 1, limit = 10, userId, status, search = '' } = filters;
        let queryBuilder = Job.query()
            .where((query) => {
            query.whereNull('expires_at').orWhere('expires_at', '>', DateTime.now().toSQL());
        })
            .preload('user')
            .preload('applications')
            .orderBy('created_at', 'desc');
        if (search) {
            queryBuilder = queryBuilder.where((query) => {
                query.whereILike('title', `%${search}%`);
                query.orWhereILike('description', `%${search}%`);
                query.orWhereILike('company_name', `%${search}%`);
                query.orWhereILike('company_email', `%${search}%`);
                query.orWhereILike('company_city', `%${search}%`);
            });
        }
        if (userId) {
            queryBuilder = queryBuilder.andWhere('userId', userId);
        }
        if (status) {
            queryBuilder = queryBuilder.andWhere('status', status);
        }
        const jobs = await queryBuilder.paginate(page, limit);
        return jobs;
    }
    async getJobCountPerDay(startDate, endDate) {
        const start = DateTime.fromISO(startDate).startOf('day');
        const end = DateTime.fromISO(endDate).endOf('day');
        if (!start.isValid || !end.isValid) {
            throw new Error('Invalid date format. Please use YYYY-MM-DD format.');
        }
        if (start > end) {
            throw new Error('Start date must be before or equal to end date.');
        }
        const result = await db.rawQuery(`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as count
      FROM jobs
      WHERE created_at between ? AND ?
      GROUP BY DATE(created_at)
      ORDER BY date ASC
      `, [start.toSQL(), end.toSQL()]);
        const resultMap = new Map();
        result.rows.forEach((row) => {
            const date = DateTime.fromJSDate(row.date).toFormat('yyyy-MM-dd');
            resultMap.set(date, row.count);
        });
        const finalResult = [];
        let currentDate = DateTime.fromISO(startDate);
        while (currentDate <= DateTime.fromISO(endDate)) {
            const dateString = currentDate.toFormat('yyyy-MM-dd');
            finalResult.push({
                date: dateString,
                count: resultMap.get(dateString) || 0,
            });
            currentDate = currentDate.plus({ days: 1 });
        }
        return finalResult;
    }
    async getStatistics() {
        const now = DateTime.now().toSQL();
        const [totalResult, openResult, closedResult, expiredResult, activeResult, withCompanyResult, withoutCompanyResult,] = await Promise.all([
            db.rawQuery('SELECT COUNT(*) as count FROM jobs'),
            db.rawQuery('SELECT COUNT(*) as count FROM jobs WHERE status = ?', [JobStatus.OPEN]),
            db.rawQuery('SELECT COUNT(*) as count FROM jobs WHERE status = ?', [JobStatus.CLOSED]),
            db.rawQuery('SELECT COUNT(*) as count FROM jobs WHERE expires_at < ?', [now]),
            db.rawQuery('SELECT COUNT(*) as count FROM jobs WHERE expires_at > ? OR expires_at IS NULL', [
                now,
            ]),
            db.rawQuery('SELECT COUNT(*) as count FROM jobs WHERE company_name IS NOT NULL'),
            db.rawQuery('SELECT COUNT(*) as count FROM jobs WHERE company_name IS NULL'),
        ]);
        return {
            total: totalResult.rows[0].count,
            open: openResult.rows[0].count,
            closed: closedResult.rows[0].count,
            expired: expiredResult.rows[0].count,
            active: activeResult.rows[0].count,
            withCompany: withCompanyResult.rows[0].count,
            withoutCompany: withoutCompanyResult.rows[0].count,
        };
    }
    async searchByCompany(companyId, filters = {}) {
        const { page = 1, limit = 10, status, search = '' } = filters;
        let queryBuilder = Job.query()
            .select('jobs.*')
            .join('users', 'jobs.user_id', 'users.id')
            .join('companies', 'users.company_id', 'companies.id')
            .where('companies.id', companyId)
            .andWhere((query) => {
            query.whereILike('company_name', `%${search}%`);
            query.orWhereILike('company_email', `%${search}%`);
            query.orWhereILike('company_website', `%${search}%`);
            query.orWhereILike('company_city', `%${search}%`);
            query.orWhereILike('company_address', `%${search}%`);
        })
            .preload('user')
            .preload('applications')
            .orderBy('created_at', 'desc');
        if (status) {
            queryBuilder = queryBuilder.andWhere('status', status);
        }
        const jobs = await queryBuilder.paginate(page, limit);
        return jobs;
    }
}
//# sourceMappingURL=job_service.js.map