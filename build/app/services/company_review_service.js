import Company from '#models/company';
import CompanyReview from '#models/company_review';
import User from '#models/user';
export default class CompanyReviewService {
    fields = [
        'companyId',
        'userId',
        'comment',
        'rating',
        'isApproved',
    ];
    async create(data) {
        const review = new CompanyReview();
        const requiredFields = ['companyId', 'userId', 'comment', 'rating'];
        requiredFields.forEach((field) => {
            if (!data[field]) {
                throw new Error(`${field} is required to create a review`);
            }
        });
        const company = await Company.find(data.companyId);
        if (!company) {
            throw new Error('Entreprise introuvable.');
        }
        const user = await User.find(data.userId);
        if (!user) {
            throw new Error('Utilisateur introuvable.');
        }
        const existingReview = await CompanyReview.query()
            .where('companyId', data.companyId)
            .where('userId', data.userId)
            .first();
        if (existingReview) {
            throw new Error('Vous avez déjà laissé un avis pour cette entreprise.');
        }
        this.fields.forEach((field) => {
            if (data[field] !== undefined) {
                review[field] = data[field];
            }
        });
        if (review.isApproved === undefined) {
            review.isApproved = false;
        }
        const savedReview = await review.save();
        await savedReview.load('user');
        await savedReview.load('company');
        return savedReview;
    }
    async update(reviewId, data) {
        const review = await CompanyReview.findOrFail(reviewId);
        const updatableFields = ['comment', 'rating'];
        updatableFields.forEach((field) => {
            if (data[field] !== undefined) {
                review[field] = data[field];
            }
        });
        const savedReview = await review.save();
        await savedReview.load('user');
        await savedReview.load('company');
        return savedReview;
    }
    async getByCompany(filters) {
        const { companyId, search = '', page = 1, limit = 10, isApproved, userId } = filters;
        await Company.findOrFail(companyId);
        let queryBuilder = CompanyReview.query()
            .where('companyId', companyId)
            .preload('user', (userQuery) => {
            userQuery.select('id', 'firstName', 'lastName', 'profileImage');
        });
        if (search) {
            queryBuilder = queryBuilder.andWhereILike('comment', `%${search}%`);
        }
        if (isApproved !== undefined) {
            queryBuilder = queryBuilder.andWhere('isApproved', isApproved);
        }
        if (userId) {
            queryBuilder = queryBuilder.andWhere('userId', userId);
        }
        const reviews = await queryBuilder.orderBy('createdAt', 'desc').paginate(page, limit);
        return reviews;
    }
    async findById(reviewId) {
        const review = await CompanyReview.query()
            .where('id', reviewId)
            .preload('user', (userQuery) => {
            userQuery.select('id', 'firstName', 'lastName', 'profileImage');
        })
            .preload('company', (companyQuery) => {
            companyQuery.select('id', 'name', 'logo');
        })
            .firstOrFail();
        return review;
    }
    async delete(reviewId) {
        const review = await CompanyReview.findOrFail(reviewId);
        await review.delete();
        return true;
    }
    async toggleApproval(reviewId) {
        const review = await CompanyReview.findOrFail(reviewId);
        review.isApproved = !review.isApproved;
        await review.save();
        await review.load('user');
        await review.load('company');
        return review;
    }
    async getCompanyRatingStats(companyId) {
        const stats = await CompanyReview.query()
            .where('companyId', companyId)
            .where('isApproved', true)
            .select('rating');
        if (stats.length === 0) {
            return { averageRating: 0, totalReviews: 0 };
        }
        const totalRating = stats.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = Math.round((totalRating / stats.length) * 10) / 10;
        return {
            averageRating,
            totalReviews: stats.length,
        };
    }
}
//# sourceMappingURL=company_review_service.js.map