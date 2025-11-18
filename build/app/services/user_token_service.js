var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import UserToken from '#models/user_token';
import { TokenUtil } from '#utils/token_util';
import { inject } from '@adonisjs/core';
import { DateTime } from 'luxon';
let UserTokenService = class UserTokenService {
    async generateNumeric(user, length = 6, duration = { hours: 24 }) {
        const token = await user.related('tokens').create({
            token: TokenUtil.numeric(length),
            expiresAt: DateTime.now().plus(duration),
        });
        return token.token;
    }
    async verify(token, user) {
        const now = DateTime.now().toISO();
        const userToken = await user
            .related('tokens')
            .query()
            .where('token', token)
            .where('expiresAt', '>', now)
            .first();
        if (!userToken) {
            return false;
        }
        return userToken;
    }
    async delete(token) {
        const userToken = await UserToken.query().where('token', token).first();
        if (userToken) {
            await userToken.delete();
        }
    }
    async deleteExpired() {
        const now = DateTime.now().toISO();
        await UserToken.query().where('expiresAt', '<=', now).delete();
    }
    async findTokenWithUser(token) {
        const now = DateTime.now().toISO();
        const userToken = await UserToken.query()
            .where('token', token)
            .where('expiresAt', '>', now)
            .preload('user')
            .first();
        return userToken || null;
    }
};
UserTokenService = __decorate([
    inject()
], UserTokenService);
export { UserTokenService };
//# sourceMappingURL=user_token_service.js.map