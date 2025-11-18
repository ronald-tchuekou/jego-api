var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { inject } from '@adonisjs/core';
import CompanyFollowingService from '#services/company_following_service';
import logger from '@adonisjs/core/services/logger';
let CompanyFollowingsController = class CompanyFollowingsController {
    companyFollowingService;
    constructor(companyFollowingService) {
        this.companyFollowingService = companyFollowingService;
    }
    async getUserFollowing({ request, response }) {
        try {
            const userId = request.param('userId');
            const companyId = request.param('companyId');
            const following = await this.companyFollowingService.getUserFollowing(userId, companyId);
            return response.ok({ data: following });
        }
        catch (error) {
            logger.error('Error on getting user following: ', JSON.stringify(error, null, 2));
            return response.badRequest({
                message: 'Une erreur est survenue lors de la récupération des followers.',
                error: error.message,
            });
        }
    }
    async getCompanyFollowers({ request, response }) {
        try {
            const companyId = request.param('companyId');
            const { page = 1, limit = 10, search = '' } = request.qs();
            const followers = await this.companyFollowingService.getCompanyFollowers({
                companyId,
                page,
                limit,
                search,
            });
            return response.ok(followers);
        }
        catch (error) {
            logger.error('Error on getting company followers: ', JSON.stringify(error, null, 2));
            return response.badRequest({
                message: 'Une erreur est survenue lors de la récupération des followers.',
                error: error.message,
            });
        }
    }
    async store({ request, auth, response }) {
        try {
            const companyId = request.param('companyId');
            const user = auth.getUserOrFail();
            const companyFollowing = await this.companyFollowingService.create({
                companyId,
                userId: user.id,
            });
            return response.created({ data: companyFollowing });
        }
        catch (error) {
            logger.error('Error on creating following: ', JSON.stringify(error, null, 2));
            return response.badRequest({
                message: 'Une erreur est survenue lors de la création du post.',
                error: error.message,
            });
        }
    }
    async destroy({ params, response, auth }) {
        try {
            const user = auth.getUserOrFail();
            const companyId = params.companyId;
            await this.companyFollowingService.delete(companyId, user.id);
            return response.ok({ message: 'Following supprimé avec succès' });
        }
        catch (error) {
            logger.error('Error on deleting following: ', JSON.stringify(error, null, 2));
            return response.badRequest({
                message: 'Une erreur est survenue lors de la suppression du post.',
                error: error.message,
            });
        }
    }
};
CompanyFollowingsController = __decorate([
    inject(),
    __metadata("design:paramtypes", [CompanyFollowingService])
], CompanyFollowingsController);
export default CompanyFollowingsController;
//# sourceMappingURL=company_followings_controller.js.map