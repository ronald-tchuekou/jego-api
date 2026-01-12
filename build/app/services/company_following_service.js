import Company from '#models/company';
import CompanyFollowing from '#models/company_following';
export default class CompanyFollowingService {
    fields = ['companyId', 'userId'];
    async create(data) {
        const companyFollowing = new CompanyFollowing();
        const requiredFields = ['companyId', 'userId'];
        requiredFields.forEach((field) => {
            if (!data[field]) {
                throw new Error(`${field} is required to create a company following.`);
            }
        });
        this.fields.forEach((field) => {
            if (data[field] !== undefined) {
                companyFollowing[field] = data[field];
            }
        });
        const company = await Company.findOrFail(companyFollowing.companyId);
        if (!company) {
            throw new Error("Cette entreprise n'existe pas.");
        }
        await companyFollowing.save();
        company.followingCount = Math.max(company.followingCount + 1, 0);
        await company.save();
        return companyFollowing;
    }
    async getCompanyFollowers(filters) {
        const { companyId, search = '', page = 1, limit = 10 } = filters;
        let queryBuilder = CompanyFollowing.query()
            .where('companyId', companyId)
            .andWhere((query) => {
            query.whereILike('name', `%${search}%`);
            query.orWhereILike('description', `%${search}%`);
            query.orWhereILike('email', `%${search}%`);
            query.orWhereILike('phone', `%${search}%`);
            query.orWhereILike('city', `%${search}%`);
        })
            .preload('user')
            .preload('company');
        const followings = await queryBuilder
            .orderBy('name', 'asc')
            .orderBy('createdAt', 'desc')
            .paginate(page, limit);
        const result = followings.toJSON();
        return {
            ...result,
            data: result.data.map((item) => item.user),
        };
    }
    async getUserFollowings(filters) {
        const { userId, search = '', page = 1, limit = 10 } = filters;
        let queryBuilder = CompanyFollowing.query()
            .where('userId', userId)
            .whereHas('company', (query) => {
            if (search) {
                query.whereILike('name', `%${search}%`);
                query.orWhereILike('description', `%${search}%`);
                query.orWhereILike('email', `%${search}%`);
                query.orWhereILike('phone', `%${search}%`);
                query.orWhereILike('city', `%${search}%`);
            }
        })
            .preload('company', (query) => {
            query.preload('category');
        });
        const followings = await queryBuilder.orderBy('createdAt', 'desc').paginate(page, limit);
        const result = followings.toJSON();
        return {
            ...result,
            data: result.data.map((item) => item.company),
        };
    }
    async getUserFollowing(userId, companyId) {
        return CompanyFollowing.findBy({ companyId, userId });
    }
    async delete(companyId, userId) {
        const following = await CompanyFollowing.findByOrFail({ companyId, userId });
        await following.delete();
        const company = await Company.findOrFail(companyId);
        company.followingCount = Math.max(company.followingCount - 1, 0);
        await company.save();
        return true;
    }
}
//# sourceMappingURL=company_following_service.js.map