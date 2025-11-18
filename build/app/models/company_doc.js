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
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm';
import { DateTime } from 'luxon';
export var CompanyDocStatus;
(function (CompanyDocStatus) {
    CompanyDocStatus["WAITING"] = "waiting";
    CompanyDocStatus["APPROVED"] = "approved";
    CompanyDocStatus["REJECTED"] = "rejected";
})(CompanyDocStatus || (CompanyDocStatus = {}));
export default class CompanyDoc extends BaseModel {
}
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", String)
], CompanyDoc.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], CompanyDoc.prototype, "companyId", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], CompanyDoc.prototype, "name", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], CompanyDoc.prototype, "path", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], CompanyDoc.prototype, "type", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], CompanyDoc.prototype, "size", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], CompanyDoc.prototype, "status", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], CompanyDoc.prototype, "createdAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", DateTime)
], CompanyDoc.prototype, "updatedAt", void 0);
__decorate([
    belongsTo(() => Company),
    __metadata("design:type", Object)
], CompanyDoc.prototype, "company", void 0);
//# sourceMappingURL=company_doc.js.map