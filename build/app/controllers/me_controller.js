var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import UserPasswordChanged from '#events/user_password_changed';
import UserUpdateEmailRequested from '#events/user_update_email_requested';
import UserService from '#services/user_service';
import { UserTokenService } from '#services/user_token_service';
import { deleteAccountValidator, imageProfileValidator, updateMeEmailValidator, updateMePasswordValidator, updateMeValidator, verifyNewEmailValidator, } from '#validators/me';
import { inject } from '@adonisjs/core';
export const USER_PROFILE_STORAGE_PATH = 'storage/uploads/profile_images';
export default class MeController {
    async get({ auth, response }) {
        const user = auth.user;
        if (!user) {
            return { error: 'User not authenticated' };
        }
        return response.ok({
            user,
        });
    }
    async update({ response, request, auth }) {
        const user = auth.user;
        const data = await request.validateUsing(updateMeValidator);
        if (data.firstName)
            user.firstName = data.firstName;
        if (data.lastName)
            user.lastName = data.lastName;
        if (data.phone)
            user.phone = data.phone;
        if (data.address)
            user.address = data.address;
        if (data.city)
            user.city = data.city;
        if (data.state)
            user.state = data.state;
        if (data.zipCode)
            user.zipCode = data.zipCode;
        if (data.country)
            user.country = data.country;
        await user.save();
        return response.ok({
            user,
        });
    }
    async uploadImageProfile({ request, response, auth }) {
        const { image } = await request.validateUsing(imageProfileValidator);
        if (!image) {
            return response.badRequest({ message: 'Une image est requise.' });
        }
        const filename = `${auth.user.id}_avatar.${image.extname}`;
        await image.move(USER_PROFILE_STORAGE_PATH, {
            name: filename,
            overwrite: true,
        });
        const user = auth.user;
        user.profileImage = `${USER_PROFILE_STORAGE_PATH}/${filename}`;
        await user.save();
        return response.ok({
            user,
        });
    }
    async updateEmail({ request, response, auth }, userService) {
        const data = await request.validateUsing(updateMeEmailValidator);
        const tempUser = await userService.findByEmail(data.email);
        if (tempUser) {
            return response.badRequest({ message: 'Cette adresse e-mail est déjà utilisée.' });
        }
        const user = auth.user;
        const isPasswordValid = await user.verifyPassword(data.password);
        if (!isPasswordValid) {
            return response.badRequest({ message: 'Mot de passe incorrect' });
        }
        user.updateEmailRequest = data.email;
        await user.save();
        UserUpdateEmailRequested.dispatch(user);
        return response.ok({
            user,
            message: 'Email de mise à jour demandée',
        });
    }
    async resendVerificationEmail({ response, auth }) {
        UserUpdateEmailRequested.dispatch(auth.user);
        return response.ok({
            user: auth.user,
            message: 'Email de vérification envoyé',
        });
    }
    async verifyNewEmail({ request, response, auth }, userService, userTokenService) {
        const data = await request.validateUsing(verifyNewEmailValidator);
        const user = await userService.verifyNewEmail(auth.user.id, data.token);
        user.email = user.updateEmailRequest;
        user.updateEmailRequest = null;
        await user.save();
        await userTokenService.delete(data.token);
        return response.ok({
            user,
            message: 'Email mis à jour',
        });
    }
    async updatePassword({ request, response, auth }) {
        const data = await request.validateUsing(updateMePasswordValidator);
        const user = auth.user;
        const isPasswordValid = await user.verifyPassword(data.currentPassword);
        if (!isPasswordValid) {
            return response.badRequest({ message: 'Mot de passe incorrect' });
        }
        user.password = data.newPassword;
        await user.save();
        UserPasswordChanged.dispatch(user);
        return response.ok({
            user,
            message: 'Mot de passe mis à jour',
        });
    }
    async deleteAccount({ response, request, auth }) {
        const data = await request.validateUsing(deleteAccountValidator);
        const user = auth.user;
        const isPasswordValid = await user.verifyPassword(data.password);
        if (!isPasswordValid) {
            return response.badRequest({ message: 'Mot de passe incorrect' });
        }
        user.firstName = 'Supprimé';
        user.lastName = 'Supprimé';
        user.email = `${new Date().getTime()}@supprime.com`;
        user.phone = 'Supprimé';
        user.profileImage = null;
        user.password = '';
        await user.save();
        return response.ok({
            user,
        });
    }
}
__decorate([
    inject(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", Promise)
], MeController.prototype, "uploadImageProfile", null);
__decorate([
    inject(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, UserService]),
    __metadata("design:returntype", Promise)
], MeController.prototype, "updateEmail", null);
__decorate([
    inject(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, UserService,
        UserTokenService]),
    __metadata("design:returntype", Promise)
], MeController.prototype, "verifyNewEmail", null);
//# sourceMappingURL=me_controller.js.map