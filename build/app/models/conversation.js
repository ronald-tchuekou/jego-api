var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm';
import { DateTime } from 'luxon';
import Message from './message.js';
import Participant from './participant.js';
export default class Conversation extends BaseModel {
}
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", String)
], Conversation.prototype, "id", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], Conversation.prototype, "createdAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", DateTime)
], Conversation.prototype, "updatedAt", void 0);
__decorate([
    hasMany(() => Participant),
    __metadata("design:type", Object)
], Conversation.prototype, "participants", void 0);
__decorate([
    hasMany(() => Message),
    __metadata("design:type", Object)
], Conversation.prototype, "messages", void 0);
//# sourceMappingURL=conversation.js.map