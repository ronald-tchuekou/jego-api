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
import User from '#models/user';
import UserService from '#services/user_service';
import { TokenUtil } from '#utils/token_util';
import { forgotPasswordValidator, loginValidator, registerValidator, resetPasswordValidator, verifyEmail, } from '#validators/auth';
import { inject } from '@adonisjs/core';
export default class AuthController {
    async login({ request, response }) {
        try {
            const { email, password } = await request.validateUsing(loginValidator);
            const user = await User.verifyCredentials(email, password);
            await user.load('company');
            const token = await User.accessTokens.create(user, TokenUtil.getUserAbilities(user), {
                expiresIn: '30d',
            });
            if (token.value) {
                UserLoggedIn.dispatch(user);
            }
            return response.ok({
                token: token.value.release(),
                user,
            });
        }
        catch (error) {
            return response.badRequest({
                message: 'Votre adresse e-mail ou mot de passe est incorrect.',
                error: error.message,
            });
        }
    }
    async register({ request, response }, userService) {
        const data = await request.validateUsing(registerValidator);
        const user = await userService.create(data);
        if (data.companyId)
            await user.load('company');
        const token = await User.accessTokens.create(user, TokenUtil.getUserAbilities(user), {
            expiresIn: '30d',
        });
        UserLoggedIn.dispatch(user);
        return response.ok({
            token: token.value.release(),
            user,
        });
    }
    async logout({ auth, response, request }) {
        await auth.use('api').invalidateToken();
        return response.ok({
            headers: request.headers,
            message: 'Logged out successfully',
        });
    }
    async revalidateToken({ auth, response }) {
        const user = auth.use('api').getUserOrFail();
        await user.load('company');
        const isExpired = auth.user?.currentAccessToken.isExpired();
        if (isExpired) {
            return response.unauthorized({
                error: 'Token expired',
                message: 'Token expired',
            });
        }
        return response.ok(user);
    }
    async forgotPassword({ request, response }, userService) {
        const { email } = await request.validateUsing(forgotPasswordValidator);
        const user = await userService.findByEmail(email);
        if (!user) {
            return response.ok({
                message: 'If the email exists in our system, you will receive a password reset link',
            });
        }
        await userService.requestPasswordReset(email);
        return response.ok({
            message: 'If the email exists in our system, you will receive a password reset link',
        });
    }
    async resetPassword({ request, response }, userService) {
        const data = await request.validateUsing(resetPasswordValidator);
        const user = await userService.resetPassword(data.token, data.password);
        await user.load('company');
        const token = await User.accessTokens.create(user, TokenUtil.getUserAbilities(user), {
            expiresIn: '30d',
        });
        return response.ok({
            message: 'Password has been reset successfully',
            token: token.value.release(),
            user,
        });
    }
    async verifyEmail({ request, response }, userService) {
        const { token, userId } = await request.validateUsing(verifyEmail);
        const user = await userService.verify(userId, token);
        await user.load('company');
        const accessToken = await User.accessTokens.create(user, TokenUtil.getUserAbilities(user), {
            expiresIn: '30d',
        });
        return response.ok({
            message: "L'email a été vérifié avec succès.",
            user,
            token: accessToken.value.release(),
        });
    }
}
__decorate([
    inject(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, UserService]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    inject(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, UserService]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    inject(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, UserService]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    inject(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, UserService]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmail", null);
//# sourceMappingURL=auth_controller.js.map