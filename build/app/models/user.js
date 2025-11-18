var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import Company from '#models/company';
import Job from '#models/job';
import Post from '#models/post';
import UserCV from '#models/user_cv';
import UserToken from '#models/user_token';
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens';
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid';
import { compose } from '@adonisjs/core/helpers';
import hash from '@adonisjs/core/services/hash';
import { BaseModel, belongsTo, column, computed, hasMany } from '@adonisjs/lucid/orm';
import { DateTime } from 'luxon';
import Appointment from './appointment.js';
const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
    uids: ['email'],
    passwordColumnName: 'password',
});
export var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["USER"] = "user";
    UserRole["COMPANY_ADMIN"] = "company:admin";
    UserRole["COMPANY_AGENT"] = "company:agent";
})(UserRole || (UserRole = {}));
export default class User extends compose(BaseModel, AuthFinder) {
    get displayName() {
        return `${this.firstName || ''} ${this.lastName || ''}`.trim() || null;
    }
    static accessTokens = DbAccessTokensProvider.forModel(User);
    currentAccessToken;
}
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], User.prototype, "firstName", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], User.prototype, "lastName", void 0);
__decorate([
    computed(),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], User.prototype, "displayName", null);
__decorate([
    column(),
    __metadata("design:type", Object)
], User.prototype, "phone", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], User.prototype, "address", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], User.prototype, "city", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], User.prototype, "state", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], User.prototype, "zipCode", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], User.prototype, "country", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], User.prototype, "updateEmailRequest", void 0);
__decorate([
    column({ serializeAs: null }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], User.prototype, "companyId", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], User.prototype, "profileImage", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], User.prototype, "verifiedAt", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], User.prototype, "lastLoginAt", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], User.prototype, "blockedAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], User.prototype, "createdAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", DateTime)
], User.prototype, "updatedAt", void 0);
__decorate([
    belongsTo(() => Company),
    __metadata("design:type", Object)
], User.prototype, "company", void 0);
__decorate([
    hasMany(() => UserToken),
    __metadata("design:type", Object)
], User.prototype, "tokens", void 0);
__decorate([
    hasMany(() => Post),
    __metadata("design:type", Object)
], User.prototype, "posts", void 0);
__decorate([
    hasMany(() => Job),
    __metadata("design:type", Object)
], User.prototype, "jobs", void 0);
__decorate([
    hasMany(() => Appointment),
    __metadata("design:type", Object)
], User.prototype, "appointments", void 0);
__decorate([
    hasMany(() => UserCV),
    __metadata("design:type", Object)
], User.prototype, "cvs", void 0);
//# sourceMappingURL=user.js.map