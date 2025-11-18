var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { createUserCV, deleteUserCV, readUserCV, updateUserCV } from '#abilities/user_cv_abilities';
import UserCVService from '#services/user_cv_service';
import { storeUserCVValidator, updateUserCVValidator } from '#validators/user_cv';
import { inject } from '@adonisjs/core';
let UserCVsController = class UserCVsController {
    userCVService;
    constructor(userCVService) {
        this.userCVService = userCVService;
    }
    async index({ request, response, auth }) {
        try {
            const { page = 1, limit = 10, search = '', userId } = request.qs();
            const currentUser = auth.getUserOrFail();
            const targetUserId = userId || currentUser.id;
            const userCVs = await this.userCVService.getUserCVs({
                userId: targetUserId,
                page,
                limit,
                search,
            });
            return response.ok(userCVs);
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors de la récupération des CVs.',
                error: error.message,
            });
        }
    }
    async store({ request, response, auth, bouncer }) {
        try {
            const user = auth.getUserOrFail();
            await bouncer.authorize(createUserCV);
            const userCVData = await request.validateUsing(storeUserCVValidator);
            const savedUserCV = await this.userCVService.create(userCVData, user);
            return response.created({ data: savedUserCV });
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors de la création du CV.',
                error: error.message,
            });
        }
    }
    async show({ params, response, bouncer }) {
        try {
            const userCV = await this.userCVService.findById(params.id);
            if (!userCV) {
                return response.notFound({
                    message: 'Aucun CV trouvé.',
                });
            }
            await bouncer.authorize(readUserCV, userCV);
            return response.ok({ data: userCV });
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors de la récupération du CV.',
                error: error.message,
            });
        }
    }
    async update({ params, request, response, bouncer }) {
        try {
            const userCV = await this.userCVService.findById(params.id);
            if (!userCV) {
                return response.notFound({
                    message: 'Aucun CV trouvé.',
                });
            }
            await bouncer.authorize(updateUserCV, userCV);
            const userCVData = await request.validateUsing(updateUserCVValidator);
            const updatedUserCV = await this.userCVService.update(params.id, userCVData);
            return response.ok({ data: updatedUserCV });
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors de la mise à jour du CV.',
                error: error.message,
            });
        }
    }
    async destroy({ params, response, bouncer }) {
        try {
            const userCV = await this.userCVService.findById(params.id);
            if (!userCV) {
                return response.notFound({
                    message: 'Aucun CV trouvé.',
                });
            }
            await bouncer.authorize(deleteUserCV, userCV);
            await this.userCVService.delete(params.id);
            return response.ok({ message: 'CV supprimé avec succès' });
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors de la suppression du CV.',
                error: error.message,
            });
        }
    }
    async getByUser({ params, request, response }) {
        try {
            const { page = 1, limit = 10, search = '' } = request.qs();
            const userCVs = await this.userCVService.findByUserId(params.userId, {
                page,
                limit,
                search,
            });
            return response.ok(userCVs);
        }
        catch (error) {
            return response.badRequest({
                message: "Une erreur est survenue lors de la récupération des CVs de l'utilisateur.",
                error: error.message,
            });
        }
    }
    async getTotal({ request, response, auth }) {
        try {
            const { userId } = request.qs();
            const currentUser = auth.getUserOrFail();
            const targetUserId = userId || currentUser.id;
            const total = await this.userCVService.getTotal(targetUserId);
            return response.ok({ count: total });
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors du comptage des CVs.',
                error: error.message,
            });
        }
    }
};
UserCVsController = __decorate([
    inject(),
    __metadata("design:paramtypes", [UserCVService])
], UserCVsController);
export default UserCVsController;
//# sourceMappingURL=user_cvs_controller.js.map