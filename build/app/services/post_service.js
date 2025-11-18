import Post from '#models/post';
import db from '@adonisjs/lucid/services/db';
import { DateTime } from 'luxon';
import PostMediaService from './post_media_service.js';
export default class PostService {
    postMediaService;
    constructor() {
        this.postMediaService = new PostMediaService();
    }
    async create(data, user) {
        const post = new Post();
        post.userId = user.id;
        Object.keys(data).forEach((key) => {
            if (key !== 'medias' && data[key] !== undefined) {
                post[key] = data[key];
            }
        });
        const savedPost = await post.save();
        if (data.medias && data.medias.length > 0) {
            await this.postMediaService.createMany(savedPost.id, data.medias);
        }
        await savedPost.load('user', (userQuery) => userQuery.preload('company'));
        await savedPost.load('medias');
        return savedPost;
    }
    async update(postId, data) {
        const post = await Post.findOrFail(postId);
        const savedPost = await post.save();
        if (data.medias !== undefined) {
            if (data.medias.length > 0) {
                await this.postMediaService.updatePostMedias(savedPost.id, data.medias);
            }
            else {
                await this.postMediaService.deleteAllPostMedias(savedPost.id);
            }
        }
        await savedPost.load('user', (userQuery) => userQuery.preload('company'));
        await savedPost.load('medias');
        return savedPost;
    }
    async getAll(filters) {
        const { search = '', page = 1, limit = 10, userId, status, type, category } = filters;
        let queryBuilder = Post.query()
            .preload('user', (userQuery) => userQuery.preload('company'))
            .preload('medias')
            .orderBy('created_at', 'desc');
        if (search) {
            queryBuilder = queryBuilder.where((query) => {
                query.whereILike('title', `%${search}%`);
                query.orWhereILike('description', `%${search}%`);
                query.orWhereILike('category', `%${search}%`);
            });
        }
        if (userId) {
            queryBuilder = queryBuilder.andWhere('userId', userId);
        }
        if (status) {
            queryBuilder = queryBuilder.andWhere('status', status);
        }
        if (type) {
            queryBuilder = queryBuilder.andWhere('type', type);
        }
        if (category) {
            queryBuilder = queryBuilder.andWhere('category', category);
        }
        const posts = await queryBuilder.paginate(page, limit);
        return posts;
    }
    async getTotal(companyId) {
        let queryBuilder = Post.query();
        if (companyId) {
            queryBuilder
                .join('users', 'posts.user_id', 'users.id')
                .join('companies', 'users.company_id', 'companies.id')
                .where('companies.id', companyId);
        }
        const result = await queryBuilder.count('*', 'total');
        const item = result[0].$extras;
        return item.total;
    }
    async findById(postId) {
        return Post.query()
            .where('id', postId)
            .preload('user', (userQuery) => userQuery.preload('company'))
            .preload('medias')
            .first();
    }
    async findByUserId(userId, filters = {}) {
        const { page = 1, limit = 10, status, type, category } = filters;
        let queryBuilder = Post.query()
            .where('userId', userId)
            .preload('user', (userQuery) => userQuery.preload('company'))
            .preload('medias')
            .orderBy('created_at', 'desc');
        if (status) {
            queryBuilder = queryBuilder.andWhere('status', status);
        }
        if (type) {
            queryBuilder = queryBuilder.andWhere('type', type);
        }
        if (category) {
            queryBuilder = queryBuilder.andWhere('category', category);
        }
        const posts = await queryBuilder.paginate(page, limit);
        return posts;
    }
    async delete(postId) {
        const post = await Post.findOrFail(postId);
        await post.delete();
        return true;
    }
    async getByCategory(category, filters = {}) {
        const { page = 1, limit = 10, search = '', status, type } = filters;
        let queryBuilder = Post.query()
            .where('category', category)
            .preload('user', (userQuery) => userQuery.preload('company'))
            .preload('medias')
            .orderBy('created_at', 'desc');
        if (search) {
            queryBuilder = queryBuilder.where((query) => {
                query.whereILike('title', `%${search}%`);
                query.orWhereILike('description', `%${search}%`);
            });
        }
        if (status) {
            queryBuilder = queryBuilder.andWhere('status', status);
        }
        if (type) {
            queryBuilder = queryBuilder.andWhere('type', type);
        }
        const posts = await queryBuilder.paginate(page, limit);
        return posts;
    }
    async getPostCountPerDay(startDate, endDate) {
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
      FROM posts
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
    async getByCompanyId(companyId, filters = {}) {
        const { page = 1, limit = 10, search = '' } = filters;
        let queryBuilder = Post.query()
            .select('posts.*')
            .join('users', 'posts.user_id', 'users.id')
            .join('companies', 'users.company_id', 'companies.id')
            .where('companies.id', companyId)
            .preload('user')
            .preload('medias')
            .orderBy('created_at', 'desc');
        if (search) {
            queryBuilder = queryBuilder.where((query) => {
                query.whereILike('title', `%${search}%`);
                query.orWhereILike('description', `%${search}%`);
            });
        }
        const posts = await queryBuilder.paginate(page, limit);
        return posts;
    }
}
//# sourceMappingURL=post_service.js.map