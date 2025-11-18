var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm';
import { DateTime } from 'luxon';
import Post from './post.js';
export default class PostMedia extends BaseModel {
}
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", String)
], PostMedia.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], PostMedia.prototype, "postId", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], PostMedia.prototype, "name", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], PostMedia.prototype, "type", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], PostMedia.prototype, "url", void 0);
__decorate([
    column(),
    __metadata("design:type", Number)
], PostMedia.prototype, "size", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], PostMedia.prototype, "thumbnailUrl", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], PostMedia.prototype, "alt", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], PostMedia.prototype, "metadata", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], PostMedia.prototype, "createdAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", DateTime)
], PostMedia.prototype, "updatedAt", void 0);
__decorate([
    belongsTo(() => Post),
    __metadata("design:type", Object)
], PostMedia.prototype, "post", void 0);
//# sourceMappingURL=post_media.js.map