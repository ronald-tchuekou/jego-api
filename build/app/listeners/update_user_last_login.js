var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import UserLoggedIn from '#events/user_logged_in';
import UserService from '#services/user_service';
import { inject } from '@adonisjs/core';
export default class UpdateUserLastLogin {
    async handle(event, userService) {
        if (true)
            return;
        const { user } = event;
        await userService.updateLastLogin(user.id);
    }
}
__decorate([
    inject(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UserLoggedIn, UserService]),
    __metadata("design:returntype", Promise)
], UpdateUserLastLogin.prototype, "handle", null);
//# sourceMappingURL=update_user_last_login.js.map