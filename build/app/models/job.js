var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { BaseModel, belongsTo, column, computed, hasMany } from '@adonisjs/lucid/orm';
import { DateTime } from 'luxon';
import JobApplication from './job_application.js';
import User from './user.js';
export var JobStatus;
(function (JobStatus) {
    JobStatus["OPEN"] = "open";
    JobStatus["CLOSED"] = "closed";
})(JobStatus || (JobStatus = {}));
export default class Job extends BaseModel {
    get applicationCount() {
        return this.applications?.length || 0;
    }
}
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", String)
], Job.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Job.prototype, "userId", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Job.prototype, "title", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Job.prototype, "description", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], Job.prototype, "companyName", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], Job.prototype, "companyLogo", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], Job.prototype, "companyWebsite", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], Job.prototype, "companyEmail", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], Job.prototype, "companyPhone", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], Job.prototype, "companyAddress", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], Job.prototype, "companyCity", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], Job.prototype, "companyState", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], Job.prototype, "companyZip", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], Job.prototype, "companyCountry", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], Job.prototype, "expiresAt", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Job.prototype, "status", void 0);
__decorate([
    belongsTo(() => User),
    __metadata("design:type", Object)
], Job.prototype, "user", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], Job.prototype, "createdAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", DateTime)
], Job.prototype, "updatedAt", void 0);
__decorate([
    hasMany(() => JobApplication),
    __metadata("design:type", Object)
], Job.prototype, "applications", void 0);
__decorate([
    computed(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], Job.prototype, "applicationCount", null);
//# sourceMappingURL=job.js.map