import Job, { JobStatus } from '#models/job';
import JobApplication, { JobApplicationStatus } from '#models/job_application';
import db from '@adonisjs/lucid/services/db';
import { DateTime } from 'luxon';
export default class JobApplicationService {
    fields = ['jobId', 'userId', 'status', 'resumePath'];
    async create(data) {
        const application = new JobApplication();
        const requiredFields = ['jobId', 'resumePath', 'userId'];
        requiredFields.forEach((field) => {
            if (!data[field]) {
                throw new Error(`${field} is required to create a job application`);
            }
        });
        const job = await Job.findOrFail(data.jobId);
        if (job.status !== JobStatus.OPEN) {
            throw new Error("Ce offre d'emploi n'est pas ouvert à la candidature.");
        }
        if (job.expiresAt && job.expiresAt < DateTime.now()) {
            throw new Error("Ce offre d'emploi est expirée.");
        }
        const existingApplication = await JobApplication.query()
            .where('jobId', data.jobId)
            .where('userId', data.userId)
            .first();
        if (existingApplication) {
            throw new Error("Vous avez déjà postulé pour cette offre d'emploi.");
        }
        application.userId = data.userId;
        application.jobId = data.jobId;
        if (!data.status) {
            application.status = JobApplicationStatus.PENDING;
        }
        this.fields.forEach((field) => {
            if (field !== 'userId' && data[field] !== undefined) {
                application[field] = data[field];
            }
        });
        const savedApplication = await application.save();
        await savedApplication.load('job');
        await savedApplication.load('user');
        return savedApplication;
    }
    async update(applicationId, data) {
        const application = await JobApplication.findOrFail(applicationId);
        const allowedFields = ['status', 'resumePath'];
        allowedFields.forEach((field) => {
            if (data[field] !== undefined) {
                application[field] = data[field];
            }
        });
        const savedApplication = await application.save();
        await savedApplication.load('job');
        await savedApplication.load('user');
        return savedApplication;
    }
    async getAll(filters) {
        const { search = '', page = 1, limit = 10, userId, jobId, status, companyId } = filters;
        let queryBuilder = JobApplication.query()
            .preload('job', (jobQuery) => {
            jobQuery.preload('user');
        })
            .preload('user')
            .where((query) => {
            query
                .whereHas('user', (userQuery) => {
                userQuery
                    .whereILike('first_name', `%${search}%`)
                    .orWhereILike('last_name', `%${search}%`)
                    .orWhereILike('email', `%${search}%`);
            })
                .orWhereHas('job', (jobQuery) => {
                jobQuery.whereILike('title', `%${search}%`);
            });
        })
            .orderBy('created_at', 'desc');
        if (userId) {
            queryBuilder = queryBuilder.andWhere('userId', userId);
        }
        if (jobId) {
            queryBuilder = queryBuilder.andWhere('jobId', jobId);
        }
        if (status) {
            queryBuilder = queryBuilder.andWhere('status', status);
        }
        if (companyId) {
            queryBuilder = queryBuilder.andWhereHas('job', (jobQuery) => {
                jobQuery.whereHas('user', (userQuery) => {
                    userQuery.where('companyId', companyId);
                });
            });
        }
        const applications = await queryBuilder.paginate(page, limit);
        return applications;
    }
    async getTotal(filters = {}) {
        const { userId, jobId, status, companyId } = filters;
        let queryBuilder = JobApplication.query();
        if (userId) {
            queryBuilder = queryBuilder.where('userId', userId);
        }
        if (jobId) {
            queryBuilder = queryBuilder.where('jobId', jobId);
        }
        if (status) {
            queryBuilder = queryBuilder.where('status', status);
        }
        if (companyId) {
            queryBuilder = queryBuilder.whereHas('job', (jobQuery) => {
                jobQuery.whereHas('user', (userQuery) => {
                    userQuery.where('companyId', companyId);
                });
            });
        }
        const result = await queryBuilder.count('*', 'total');
        const item = result[0].$extras;
        return item.total;
    }
    async findById(applicationId) {
        return JobApplication.query()
            .where('id', applicationId)
            .preload('job', (jobQuery) => {
            jobQuery.preload('user');
        })
            .preload('user')
            .first();
    }
    async findByUserId(userId, filters = {}) {
        const { page = 1, limit = 10, status } = filters;
        let queryBuilder = JobApplication.query()
            .where('userId', userId)
            .preload('job')
            .preload('user')
            .orderBy('created_at', 'desc');
        if (status) {
            queryBuilder = queryBuilder.andWhere('status', status);
        }
        const applications = await queryBuilder.paginate(page, limit);
        return applications;
    }
    async findByJobId(jobId, filters = {}) {
        const { page = 1, limit = 10, status } = filters;
        let queryBuilder = JobApplication.query()
            .where('jobId', jobId)
            .preload('job')
            .preload('user')
            .orderBy('created_at', 'desc');
        if (status) {
            queryBuilder = queryBuilder.andWhere('status', status);
        }
        const applications = await queryBuilder.paginate(page, limit);
        return applications;
    }
    async hasUserApplied(userId, jobId) {
        return JobApplication.query()
            .where('userId', userId)
            .where('jobId', jobId)
            .preload('job')
            .preload('user')
            .first();
    }
    async delete(applicationId) {
        const application = await JobApplication.findOrFail(applicationId);
        await application.delete();
        return true;
    }
    async getApplicationCountPerDay(startDate, endDate) {
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
      FROM job_applications
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
        const [totalResult, pendingResult, acceptedResult, rejectedResult, jobCountResult, userCountResult,] = await Promise.all([
            db.rawQuery('SELECT COUNT(*) as count FROM job_applications'),
            db.rawQuery('SELECT COUNT(*) as count FROM job_applications WHERE status = ?', [
                JobApplicationStatus.PENDING,
            ]),
            db.rawQuery('SELECT COUNT(*) as count FROM job_applications WHERE status = ?', [
                JobApplicationStatus.ACCEPTED,
            ]),
            db.rawQuery('SELECT COUNT(*) as count FROM job_applications WHERE status = ?', [
                JobApplicationStatus.REJECTED,
            ]),
            db.rawQuery('SELECT COUNT(DISTINCT job_id) as count FROM job_applications'),
            db.rawQuery('SELECT COUNT(DISTINCT user_id) as count FROM job_applications'),
        ]);
        const total = totalResult.rows[0].count;
        const jobCount = jobCountResult.rows[0].count;
        const userCount = userCountResult.rows[0].count;
        return {
            total,
            pending: pendingResult.rows[0].count,
            accepted: acceptedResult.rows[0].count,
            rejected: rejectedResult.rows[0].count,
            averagePerJob: jobCount > 0 ? Math.round(total / jobCount) : 0,
            averagePerUser: userCount > 0 ? Math.round(total / userCount) : 0,
        };
    }
    async getJobStatistics(jobId) {
        const [totalResult, pendingResult, acceptedResult, rejectedResult] = await Promise.all([
            db.rawQuery('SELECT COUNT(*) as count FROM job_applications WHERE job_id = ?', [jobId]),
            db.rawQuery('SELECT COUNT(*) as count FROM job_applications WHERE job_id = ? AND status = ?', [jobId, JobApplicationStatus.PENDING]),
            db.rawQuery('SELECT COUNT(*) as count FROM job_applications WHERE job_id = ? AND status = ?', [jobId, JobApplicationStatus.ACCEPTED]),
            db.rawQuery('SELECT COUNT(*) as count FROM job_applications WHERE job_id = ? AND status = ?', [jobId, JobApplicationStatus.REJECTED]),
        ]);
        return {
            total: totalResult.rows[0].count,
            pending: pendingResult.rows[0].count,
            accepted: acceptedResult.rows[0].count,
            rejected: rejectedResult.rows[0].count,
        };
    }
    async getUserStatistics(userId) {
        const [totalResult, pendingResult, acceptedResult, rejectedResult] = await Promise.all([
            db.rawQuery('SELECT COUNT(*) as count FROM job_applications WHERE user_id = ?', [userId]),
            db.rawQuery('SELECT COUNT(*) as count FROM job_applications WHERE user_id = ? AND status = ?', [userId, JobApplicationStatus.PENDING]),
            db.rawQuery('SELECT COUNT(*) as count FROM job_applications WHERE user_id = ? AND status = ?', [userId, JobApplicationStatus.ACCEPTED]),
            db.rawQuery('SELECT COUNT(*) as count FROM job_applications WHERE user_id = ? AND status = ?', [userId, JobApplicationStatus.REJECTED]),
        ]);
        return {
            total: totalResult.rows[0].count,
            pending: pendingResult.rows[0].count,
            accepted: acceptedResult.rows[0].count,
            rejected: rejectedResult.rows[0].count,
        };
    }
    async getRecentApplications(filters) {
        const { limit = 10, companyId } = filters;
        let queryBuilder = JobApplication.query()
            .preload('job')
            .preload('user')
            .orderBy('created_at', 'desc')
            .limit(limit);
        if (companyId) {
            queryBuilder = queryBuilder.whereHas('job', (jobQuery) => {
                jobQuery.whereHas('user', (userQuery) => {
                    userQuery.where('companyId', companyId);
                });
            });
        }
        const applications = await queryBuilder.paginate(1, limit);
        return applications;
    }
    async getCompanyJobApplications(companyId, filters = {}) {
        const { search = '', page = 1, limit = 10, status } = filters;
        let queryBuilder = JobApplication.query()
            .preload('job')
            .preload('user')
            .whereHas('job', (jobQuery) => {
            jobQuery.whereHas('user', (userQuery) => {
                userQuery.where('companyId', companyId);
            });
        })
            .andWhere((query) => {
            query
                .whereHas('user', (userQuery) => {
                userQuery
                    .whereILike('first_name', `%${search}%`)
                    .orWhereILike('last_name', `%${search}%`)
                    .orWhereILike('email', `%${search}%`);
            })
                .orWhereHas('job', (jobQuery) => {
                jobQuery.whereILike('title', `%${search}%`);
            });
        })
            .orderBy('created_at', 'desc');
        if (status) {
            queryBuilder = queryBuilder.andWhere('status', status);
        }
        const applications = await queryBuilder.paginate(page, limit);
        return applications;
    }
    async jobHasApplications(jobId) {
        const count = await JobApplication.query().where('jobId', jobId).count('*', 'total');
        const result = count[0].$extras;
        return result.total > 0;
    }
}
//# sourceMappingURL=job_application_service.js.map