var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import User from '#models/user';
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm';
import { DateTime } from 'luxon';
export default class UserToken extends BaseModel {
}
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", String)
], UserToken.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], UserToken.prototype, "userId", void 0);
__decorate([
    belongsTo(() => User),
    __metadata("design:type", Object)
], UserToken.prototype, "user", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], UserToken.prototype, "token", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], UserToken.prototype, "createdAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", DateTime)
], UserToken.prototype, "updatedAt", void 0);
__decorate([
    column.dateTime(),
    __metadata("design:type", DateTime)
], UserToken.prototype, "expiresAt", void 0);
//# sourceMappingURL=user_token.js.map