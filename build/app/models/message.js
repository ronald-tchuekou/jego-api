var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm';
import { DateTime } from 'luxon';
import Conversation from './conversation.js';
import MessageAttachment from './message_attachment.js';
import User from './user.js';
export var MessageType;
(function (MessageType) {
    MessageType["TEXT"] = "text";
    MessageType["ATTACHMENT"] = "attachment";
    MessageType["TEXT_ATTACHMENT"] = "text_attachment";
})(MessageType || (MessageType = {}));
export default class Message extends BaseModel {
}
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", String)
], Message.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Message.prototype, "conversationId", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Message.prototype, "senderId", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Message.prototype, "content", void 0);
__decorate([
    column(),
    __metadata("design:type", Boolean)
], Message.prototype, "isRead", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Message.prototype, "type", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], Message.prototype, "createdAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", DateTime)
], Message.prototype, "updatedAt", void 0);
__decorate([
    belongsTo(() => Conversation),
    __metadata("design:type", Object)
], Message.prototype, "conversation", void 0);
__decorate([
    belongsTo(() => User, {
        foreignKey: 'senderId',
    }),
    __metadata("design:type", Object)
], Message.prototype, "sender", void 0);
__decorate([
    hasMany(() => MessageAttachment),
    __metadata("design:type", Object)
], Message.prototype, "attachments", void 0);
//# sourceMappingURL=message.js.map