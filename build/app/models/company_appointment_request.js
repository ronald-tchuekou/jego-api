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
import User from '#models/user';
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm';
import { DateTime } from 'luxon';
export default class CompanyAppointmentRequest extends BaseModel {
}
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", String)
], CompanyAppointmentRequest.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], CompanyAppointmentRequest.prototype, "companyId", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], CompanyAppointmentRequest.prototype, "userId", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], CompanyAppointmentRequest.prototype, "object", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], CompanyAppointmentRequest.prototype, "content", void 0);
__decorate([
    column(),
    __metadata("design:type", Boolean)
], CompanyAppointmentRequest.prototype, "isRead", void 0);
__decorate([
    column(),
    __metadata("design:type", DateTime)
], CompanyAppointmentRequest.prototype, "date", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], CompanyAppointmentRequest.prototype, "createdAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", DateTime)
], CompanyAppointmentRequest.prototype, "updatedAt", void 0);
__decorate([
    belongsTo(() => Company),
    __metadata("design:type", Object)
], CompanyAppointmentRequest.prototype, "company", void 0);
__decorate([
    belongsTo(() => User),
    __metadata("design:type", Object)
], CompanyAppointmentRequest.prototype, "user", void 0);
//# sourceMappingURL=company_appointment_request.js.map