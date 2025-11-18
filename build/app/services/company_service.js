import Company from '#models/company';
import db from '@adonisjs/lucid/services/db';
import { DateTime } from 'luxon';
export default class CompanyService {
    fields = [
        'categoryId',
        'name',
        'email',
        'phone',
        'address',
        'city',
        'state',
        'zipCode',
        'country',
        'website',
        'facebook',
        'instagram',
        'twitter',
        'linkedin',
        'youtube',
        'tiktok',
        'logo',
        'bannerImage',
        'description',
        'location',
        'dailyProgram',
    ];
    async create(data) {
        const company = new Company();
        const requiredFields = ['name', 'email', 'phone', 'categoryId'];
        requiredFields.forEach((field) => {
            if (!data[field]) {
                throw new Error(`${field} is required to create a company`);
            }
        });
        this.fields.forEach((field) => {
            if (data[field] !== undefined) {
                company[field] = data[field];
            }
        });
        const existingCompany = await Company.query().where('name', company.name).first();
        if (existingCompany) {
            throw new Error('Cette entreprise existe déjà.');
        }
        const savedCompany = await company.save();
        await savedCompany.load('users');
        return savedCompany;
    }
    async update(companyId, data) {
        const company = await Company.findOrFail(companyId);
        this.fields.forEach((field) => {
            if (data[field] !== undefined) {
                company[field] = data[field];
            }
        });
        const savedCompany = await company.save();
        await savedCompany.load('users');
        return savedCompany;
    }
    async getAll(filters) {
        const { search = '', page = 1, limit = 10, categoryId, status } = filters;
        let queryBuilder = Company.query()
            .where((query) => {
            query.whereILike('name', `%${search}%`);
            query.orWhereILike('description', `%${search}%`);
            query.orWhereILike('email', `%${search}%`);
            query.orWhereILike('phone', `%${search}%`);
            query.orWhereILike('city', `%${search}%`);
        })
            .preload('category')
            .preload('appointmentRequests')
            .preload('reviews')
            .preload('services')
            .preload('images')
            .preload('docs')
            .preload('posts')
            .preload('users');
        if (categoryId) {
            queryBuilder = queryBuilder.andWhere('categoryId', categoryId);
        }
        if (status) {
            if (status === 'blocked')
                queryBuilder = queryBuilder.andWhereNotNull('blockedAt');
            if (status === 'active')
                queryBuilder = queryBuilder.andWhereNull('blockedAt');
        }
        const companies = await queryBuilder
            .orderBy('name', 'asc')
            .orderBy('createdAt', 'desc')
            .paginate(page, limit);
        return companies;
    }
    async getTotal(search = '') {
        let queryBuilder = Company.query();
        if (search) {
            queryBuilder = queryBuilder.where((query) => {
                query.whereILike('name', `%${search}%`);
                query.orWhereILike('description', `%${search}%`);
                query.orWhereILike('email', `%${search}%`);
                query.orWhereILike('phone', `%${search}%`);
                query.orWhereILike('city', `%${search}%`);
            });
        }
        const result = await queryBuilder.count('*', 'total');
        const item = result[0].$extras;
        return item.total;
    }
    async findById(companyId) {
        return Company.query()
            .where('id', companyId)
            .preload('category')
            .preload('appointmentRequests')
            .preload('reviews')
            .preload('services')
            .preload('images')
            .preload('docs')
            .preload('posts')
            .preload('users')
            .first();
    }
    async findByEmail(email) {
        return Company.query()
            .where('email', email)
            .preload('category')
            .preload('appointmentRequests')
            .preload('reviews')
            .preload('services')
            .preload('images')
            .preload('docs')
            .preload('posts')
            .preload('users')
            .first();
    }
    async delete(companyId) {
        const company = await Company.findOrFail(companyId);
        await company.delete();
        return true;
    }
    async toggleBlockedStatus(companyId) {
        const company = await Company.findOrFail(companyId);
        if (company.blockedAt) {
            company.blockedAt = null;
        }
        else {
            company.blockedAt = DateTime.now();
        }
        await company.save();
        return company;
    }
    async toggleApproveStatus(companyId) {
        const company = await Company.findOrFail(companyId);
        if (company.verifiedAt) {
            company.verifiedAt = null;
        }
        else {
            company.verifiedAt = DateTime.now();
        }
        await company.save();
        return company;
    }
    async getCompanyCountPerDay(startDate, endDate) {
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
      FROM companies
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
}
//# sourceMappingURL=company_service.js.map