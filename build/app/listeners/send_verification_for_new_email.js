var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import UserUpdateEmailRequested from '#events/user_update_email_requested';
import VerifyNewEmailNotification from '#mails/verify_new_email_notification';
import { UserTokenService } from '#services/user_token_service';
import { inject } from '@adonisjs/core';
import mail from '@adonisjs/mail/services/main';
export default class SendVerificationForNewEmail {
    async handle(event, userTokensService) {
        if (true)
            return;
        const token = await userTokensService.generateNumeric(event.user);
        await mail.send(new VerifyNewEmailNotification(event.user.updateEmailRequest, token));
    }
}
__decorate([
    inject(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UserUpdateEmailRequested, UserTokenService]),
    __metadata("design:returntype", Promise)
], SendVerificationForNewEmail.prototype, "handle", null);
//# sourceMappingURL=send_verification_for_new_email.js.map