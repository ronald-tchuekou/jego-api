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
import Job from './job.js';
import User from './user.js';
export var JobApplicationStatus;
(function (JobApplicationStatus) {
    JobApplicationStatus["PENDING"] = "pending";
    JobApplicationStatus["ACCEPTED"] = "accepted";
    JobApplicationStatus["REJECTED"] = "rejected";
})(JobApplicationStatus || (JobApplicationStatus = {}));
export default class JobApplication extends BaseModel {
}
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", String)
], JobApplication.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], JobApplication.prototype, "jobId", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], JobApplication.prototype, "userId", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], JobApplication.prototype, "status", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], JobApplication.prototype, "resumePath", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], JobApplication.prototype, "createdAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", DateTime)
], JobApplication.prototype, "updatedAt", void 0);
__decorate([
    belongsTo(() => Job),
    __metadata("design:type", Object)
], JobApplication.prototype, "job", void 0);
__decorate([
    belongsTo(() => User),
    __metadata("design:type", Object)
], JobApplication.prototype, "user", void 0);
//# sourceMappingURL=job_application.js.map