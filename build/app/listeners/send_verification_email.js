var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import UserRegistered from '#events/user_registered';
import VerifyEmailNotification from '#mails/verify_email_notification';
import { UserTokenService } from '#services/user_token_service';
import { inject } from '@adonisjs/core';
import mail from '@adonisjs/mail/services/main';
export default class SendVerificationEmail {
    async handle(event, userTokensService) {
        if (true)
            return;
        const token = await userTokensService.generateNumeric(event.user);
        await mail.send(new VerifyEmailNotification(event.user.email, event.user.id, token));
    }
}
__decorate([
    inject(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UserRegistered, UserTokenService]),
    __metadata("design:returntype", Promise)
], SendVerificationEmail.prototype, "handle", null);
//# sourceMappingURL=send_verification_email.js.map