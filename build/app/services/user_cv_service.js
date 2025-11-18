var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import UserCV from '#models/user_cv';
import { inject } from '@adonisjs/core';
let UserCVService = class UserCVService {
    fields = ['name', 'path', 'type'];
    async create(data, user) {
        const userCV = new UserCV();
        const requiredFields = ['name', 'path', 'type'];
        requiredFields.forEach((field) => {
            if (!data[field]) {
                throw new Error(`${field} is required to create a user CV`);
            }
        });
        userCV.userId = user.id;
        this.fields.forEach((field) => {
            if (data[field]) {
                userCV[field] = data[field];
            }
        });
        const savedUserCV = await userCV.save();
        await savedUserCV.load('user');
        return savedUserCV;
    }
    async update(userCVId, data) {
        const userCV = await UserCV.findOrFail(userCVId);
        this.fields.forEach((field) => {
            if (data[field]) {
                userCV[field] = data[field];
            }
        });
        const savedUserCV = await userCV.save();
        await savedUserCV.load('user');
        return savedUserCV;
    }
    async getUserCVs(filters) {
        const { userId, page = 1, limit = 10, search = '' } = filters;
        let queryBuilder = UserCV.query().preload('user');
        if (userId) {
            queryBuilder = queryBuilder.where('userId', userId);
        }
        if (search) {
            queryBuilder = queryBuilder.where((query) => {
                query.whereILike('name', `%${search}%`);
                query.orWhereILike('type', `%${search}%`);
            });
        }
        const userCVs = await queryBuilder.orderBy('createdAt', 'desc').paginate(page, limit);
        return userCVs;
    }
    async findById(userCVId) {
        const userCV = await UserCV.query().preload('user').where('id', userCVId).first();
        return userCV;
    }
    async findByUserId(userId, filters = {}) {
        const { page = 1, limit = 10, search = '' } = filters;
        let queryBuilder = UserCV.query().preload('user').where('userId', userId);
        if (search) {
            queryBuilder = queryBuilder.where((query) => {
                query.whereILike('name', `%${search}%`);
                query.orWhereILike('type', `%${search}%`);
            });
        }
        const userCVs = await queryBuilder.orderBy('createdAt', 'desc').paginate(page, limit);
        return userCVs;
    }
    async delete(userCVId) {
        const userCV = await UserCV.findOrFail(userCVId);
        await userCV.delete();
        return true;
    }
    async getTotal(userId) {
        let queryBuilder = UserCV.query();
        if (userId) {
            queryBuilder = queryBuilder.where('userId', userId);
        }
        const result = await queryBuilder.count('*', 'total');
        const item = result[0].$extras;
        return item.total;
    }
};
UserCVService = __decorate([
    inject()
], UserCVService);
export default UserCVService;
//# sourceMappingURL=user_cv_service.js.map