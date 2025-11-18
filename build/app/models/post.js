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
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm';
import { DateTime } from 'luxon';
import PostMedia from './post_media.js';
export default class Post extends BaseModel {
}
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", String)
], Post.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Post.prototype, "userId", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Post.prototype, "title", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Post.prototype, "description", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Post.prototype, "status", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Post.prototype, "type", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Post.prototype, "category", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], Post.prototype, "mediaType", void 0);
__decorate([
    column(),
    __metadata("design:type", Number)
], Post.prototype, "likeCount", void 0);
__decorate([
    column(),
    __metadata("design:type", Number)
], Post.prototype, "commentCount", void 0);
__decorate([
    column(),
    __metadata("design:type", Number)
], Post.prototype, "shareCount", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], Post.prototype, "createdAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", DateTime)
], Post.prototype, "updatedAt", void 0);
__decorate([
    belongsTo(() => User),
    __metadata("design:type", Object)
], Post.prototype, "user", void 0);
__decorate([
    hasMany(() => PostMedia),
    __metadata("design:type", Object)
], Post.prototype, "medias", void 0);
//# sourceMappingURL=post.js.map