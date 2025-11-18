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
import logger from '@adonisjs/core/services/logger';
import PostShareService from '#services/post_share_service';
let PostSharesController = class PostSharesController {
    postShareService;
    constructor(postShareService) {
        this.postShareService = postShareService;
    }
    async getUserShare({ request, response }) {
        try {
            const userId = request.param('userId');
            const postId = request.param('postId');
            const postShare = await this.postShareService.getUserShare(userId, postId);
            return response.ok({ data: postShare });
        }
        catch (error) {
            logger.error('Error on getting user share: ', JSON.stringify(error, null, 2));
            return response.badRequest({
                message: 'Une erreur est survenue lors de la récupération du share.',
                error: error.message,
            });
        }
    }
    async store({ request, auth, response }) {
        try {
            const postId = request.param('postId');
            const user = auth.getUserOrFail();
            const share = await this.postShareService.getUserShare(user.id, postId);
            if (share) {
                return response.ok({ data: share });
            }
            const postShare = await this.postShareService.create({
                postId,
                userId: user.id,
            });
            return response.created({ data: postShare });
        }
        catch (error) {
            logger.error('Error on creating postShare: ', JSON.stringify(error, null, 2));
            return response.badRequest({
                message: 'Une erreur est survenue lors de la création du share.',
                error: error.message,
            });
        }
    }
};
PostSharesController = __decorate([
    inject(),
    __metadata("design:paramtypes", [PostShareService])
], PostSharesController);
export default PostSharesController;
//# sourceMappingURL=post_shares_controller.js.map