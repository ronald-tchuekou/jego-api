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
import Company from './company.js';
import User from './user.js';
export var AppointmentStatus;
(function (AppointmentStatus) {
    AppointmentStatus["PENDING"] = "pending";
    AppointmentStatus["CONFIRMED"] = "confirmed";
    AppointmentStatus["CANCELLED"] = "cancelled";
    AppointmentStatus["COMPLETED"] = "completed";
})(AppointmentStatus || (AppointmentStatus = {}));
export default class Appointment extends BaseModel {
}
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", String)
], Appointment.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Appointment.prototype, "companyId", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Appointment.prototype, "userId", void 0);
__decorate([
    column(),
    __metadata("design:type", DateTime)
], Appointment.prototype, "date", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Appointment.prototype, "time", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Appointment.prototype, "status", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Appointment.prototype, "subject", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Appointment.prototype, "content", void 0);
__decorate([
    column(),
    __metadata("design:type", Boolean)
], Appointment.prototype, "isRead", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], Appointment.prototype, "createdAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", DateTime)
], Appointment.prototype, "updatedAt", void 0);
__decorate([
    belongsTo(() => Company),
    __metadata("design:type", Object)
], Appointment.prototype, "company", void 0);
__decorate([
    belongsTo(() => User),
    __metadata("design:type", Object)
], Appointment.prototype, "user", void 0);
//# sourceMappingURL=appointment.js.map