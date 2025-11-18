var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import Category from '#models/category';
import CompanyImage from '#models/company_image';
import Job from '#models/job';
import Post from '#models/post';
import User from '#models/user';
import { BaseModel, belongsTo, column, hasMany, hasManyThrough } from '@adonisjs/lucid/orm';
import { DateTime } from 'luxon';
import Appointment from './appointment.js';
import CompanyAppointmentRequest from './company_appointment_request.js';
import CompanyDoc from './company_doc.js';
import CompanyReview from './company_review.js';
import CompanyService from './company_service.js';
export default class Company extends BaseModel {
}
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", String)
], Company.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], Company.prototype, "categoryId", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Company.prototype, "name", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Company.prototype, "email", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Company.prototype, "phone", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], Company.prototype, "address", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], Company.prototype, "city", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], Company.prototype, "state", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], Company.prototype, "zipCode", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], Company.prototype, "country", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], Company.prototype, "website", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], Company.prototype, "facebook", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], Company.prototype, "instagram", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], Company.prototype, "twitter", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], Company.prototype, "linkedin", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], Company.prototype, "youtube", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], Company.prototype, "tiktok", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], Company.prototype, "logo", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], Company.prototype, "bannerImage", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], Company.prototype, "description", void 0);
__decorate([
    column(),
    __metadata("design:type", Number)
], Company.prototype, "followingCount", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], Company.prototype, "verifiedAt", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], Company.prototype, "blockedAt", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], Company.prototype, "location", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], Company.prototype, "dailyProgram", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], Company.prototype, "createdAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", DateTime)
], Company.prototype, "updatedAt", void 0);
__decorate([
    hasManyThrough([() => Post, () => User]),
    __metadata("design:type", Object)
], Company.prototype, "posts", void 0);
__decorate([
    hasMany(() => User),
    __metadata("design:type", Object)
], Company.prototype, "users", void 0);
__decorate([
    hasMany(() => CompanyImage),
    __metadata("design:type", Object)
], Company.prototype, "images", void 0);
__decorate([
    belongsTo(() => Category),
    __metadata("design:type", Object)
], Company.prototype, "category", void 0);
__decorate([
    hasMany(() => CompanyDoc),
    __metadata("design:type", Object)
], Company.prototype, "docs", void 0);
__decorate([
    hasMany(() => CompanyService),
    __metadata("design:type", Object)
], Company.prototype, "services", void 0);
__decorate([
    hasMany(() => CompanyReview),
    __metadata("design:type", Object)
], Company.prototype, "reviews", void 0);
__decorate([
    hasMany(() => CompanyAppointmentRequest),
    __metadata("design:type", Object)
], Company.prototype, "appointmentRequests", void 0);
__decorate([
    hasManyThrough([() => Job, () => User]),
    __metadata("design:type", Object)
], Company.prototype, "jobs", void 0);
__decorate([
    hasMany(() => Appointment),
    __metadata("design:type", Object)
], Company.prototype, "appointments", void 0);
//# sourceMappingURL=company.js.map