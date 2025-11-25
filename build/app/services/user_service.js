var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import UserPasswordReset from '#events/user_password_reset';
import UserPasswordResetRequested from '#events/user_password_reset_requested';
import UserRegistered from '#events/user_registered';
import UserUpdated from '#events/user_updated';
import UserVerified from '#events/user_verified';
import User, { UserRole } from '#models/user';
import { UserTokenService } from '#services/user_token_service';
import { inject } from '@adonisjs/core';
import db from '@adonisjs/lucid/services/db';
import { DateTime } from 'luxon';
let UserService = class UserService {
    fields = [
        'firstName',
        'lastName',
        'email',
        'password',
        'phone',
        'address',
        'city',
        'state',
        'zipCode',
        'country',
        'role',
        'profileImage',
        'companyId',
    ];
    async create(data) {
        const user = new User();
        const requiredFields = ['firstName', 'lastName', 'email', 'password'];
        requiredFields.forEach((field) => {
            if (!data[field]) {
                throw new Error(`${field} is required to create a user`);
            }
        });
        this.fields.forEach((field) => {
            if (data[field] && field !== 'displayName') {
                user[field] = data[field];
            }
        });
        if (!user.role)
            user['role'] = UserRole.USER;
        const existingUser = await User.query().where('email', user.email).first();
        if (existingUser) {
            throw new Error('User already exists');
        }
        const savedUser = await user.save();
        if (data.companyId)
            await savedUser.load('company');
        UserRegistered.dispatch(savedUser);
        return savedUser;
    }
    async update(userId, data) {
        const user = await User.findOrFail(userId);
        this.fields.forEach((field) => {
            if (data[field] && field !== 'displayName') {
                user[field] = data[field];
            }
        });
        const savedUser = await user.save();
        if (savedUser.companyId)
            await savedUser.load('company');
        UserUpdated.dispatch(savedUser);
        return savedUser;
    }
    async verify(userId, token) {
        let user = await User.findOrFail(userId);
        if (user.verifiedAt) {
            throw new Error('User is already verified');
        }
        const userTokenService = new UserTokenService();
        const userToken = await userTokenService.verify(token, user);
        if (!userToken) {
            throw new Error('Token de vérification invalide ou expiré');
        }
        user.verifiedAt = DateTime.now();
        user = await user.save();
        if (user.companyId)
            await user.load('company');
        await userTokenService.delete(token);
        UserVerified.dispatch(user);
        return user;
    }
    async verifyNewEmail(userId, token) {
        let user = await User.findOrFail(userId);
        if (user.companyId)
            await user.load('company');
        if (!user.updateEmailRequest) {
            throw new Error("Aucune demande de mise à jour d'email trouvée.");
        }
        const userTokenService = new UserTokenService();
        const userToken = await userTokenService.verify(token, user);
        if (!userToken) {
            throw new Error('Votre code de vérification est invalide ou a expiré.');
        }
        return user;
    }
    async updateLastLogin(userId) {
        let user = await User.findOrFail(userId);
        user.lastLoginAt = DateTime.now();
        user = await user.save();
        if (user.companyId)
            await user.load('company');
        return user;
    }
    async requestPasswordReset(email) {
        const user = await User.query().preload('company').where('email', email).first();
        if (!user) {
            return;
        }
        const userTokenService = new UserTokenService();
        const resetToken = await userTokenService.generateNumeric(user, 6, { hours: 1 });
        UserPasswordResetRequested.dispatch(user, resetToken);
    }
    async resetPassword(token, newPassword) {
        const userTokenService = new UserTokenService();
        const userToken = await userTokenService.findTokenWithUser(token);
        if (!userToken) {
            throw new Error('Le token est invalide ou à expiré.');
        }
        let user = userToken.user;
        user.password = newPassword;
        user = await user.save();
        await user.load('company');
        await userTokenService.delete(token);
        UserPasswordReset.dispatch(user);
        return user;
    }
    async getUsers(filters) {
        const { search = '', page = 1, limit = 10, companyId = '', role, status } = filters;
        let queryBuilder = User.query()
            .where((query) => {
            query.whereILike('firstName', `%${search}%`);
            query.orWhereILike('lastName', `%${search}%`);
            query.orWhereILike('email', `%${search}%`);
        })
            .preload('company')
            .preload('posts');
        if (companyId)
            queryBuilder = queryBuilder.andWhere('companyId', companyId);
        if (role)
            queryBuilder = queryBuilder.andWhere('role', role);
        if (status) {
            if (status === 'blocked')
                queryBuilder = queryBuilder.andWhereNotNull('blockedAt');
            if (status === 'active')
                queryBuilder = queryBuilder.andWhereNull('blockedAt');
        }
        const users = await queryBuilder
            .orderBy('firstName', 'asc')
            .orderBy('lastName', 'asc')
            .paginate(page, limit);
        return users;
    }
    async getTotalUsers(search = '') {
        let queryBuilder = User.query();
        if (search) {
            queryBuilder = queryBuilder.where((query) => {
                query.whereILike('firstName', `%${search}%`);
                query.orWhereILike('lastName', `%${search}%`);
                query.orWhereILike('email', `%${search}%`);
            });
        }
        const result = await queryBuilder.count('*', 'total');
        const item = result[0].$extras;
        return item.total;
    }
    async findById(userId) {
        const user = await User.query().preload('company').preload('posts').where('id', userId).first();
        return user;
    }
    async findByEmail(email) {
        const user = await User.query()
            .preload('company')
            .preload('posts')
            .where('email', email)
            .first();
        return user;
    }
    async delete(userId) {
        const user = await User.findOrFail(userId);
        await user.delete();
        return true;
    }
    async toggleBlockUser(userId) {
        const user = await User.findOrFail(userId);
        user.blockedAt = user.blockedAt ? null : DateTime.now();
        await user.save();
        await user.load('company');
        return user;
    }
    async getUserCountPerDay(startDate, endDate) {
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
      FROM users
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
};
UserService = __decorate([
    inject()
], UserService);
export default UserService;
//# sourceMappingURL=user_service.js.map