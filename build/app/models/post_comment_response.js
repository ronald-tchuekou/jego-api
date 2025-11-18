var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { DateTime } from 'luxon';
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm';
import User from '#models/user';
import PostComment from '#models/post_comment';
export default class PostCommentResponse extends BaseModel {
}
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", String)
], PostCommentResponse.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], PostCommentResponse.prototype, "postCommentId", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], PostCommentResponse.prototype, "userId", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], PostCommentResponse.prototype, "comment", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], PostCommentResponse.prototype, "createdAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", DateTime)
], PostCommentResponse.prototype, "updatedAt", void 0);
__decorate([
    belongsTo(() => User),
    __metadata("design:type", Object)
], PostCommentResponse.prototype, "user", void 0);
__decorate([
    belongsTo(() => PostComment),
    __metadata("design:type", Object)
], PostCommentResponse.prototype, "postComment", void 0);
//# sourceMappingURL=post_comment_response.js.map