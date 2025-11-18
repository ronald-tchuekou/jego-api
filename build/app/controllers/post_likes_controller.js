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
import PostLikeService from '#services/post_like_service';
let PostLikesController = class PostLikesController {
    postLikeService;
    constructor(postLikeService) {
        this.postLikeService = postLikeService;
    }
    async getUserLike({ request, response }) {
        try {
            const userId = request.param('userId');
            const postId = request.param('postId');
            const postLike = await this.postLikeService.getUserLike(userId, postId);
            return response.ok({ data: postLike });
        }
        catch (error) {
            logger.error('Error on getting user like: ', JSON.stringify(error, null, 2));
            return response.badRequest({
                message: 'Une erreur est survenue lors de la récupération du like.',
                error: error.message,
            });
        }
    }
    async store({ request, auth, response }) {
        try {
            const postId = request.param('postId');
            const user = auth.getUserOrFail();
            const postLike = await this.postLikeService.create({
                postId,
                userId: user.id,
            });
            return response.created({ data: postLike });
        }
        catch (error) {
            logger.error('Error on creating postLike: ', JSON.stringify(error, null, 2));
            return response.badRequest({
                message: 'Une erreur est survenue lors de la création du like.',
                error: error.message,
            });
        }
    }
    async destroy({ request, response, auth }) {
        try {
            const user = auth.getUserOrFail();
            const postId = request.param('postId');
            await this.postLikeService.delete(postId, user.id);
            return response.ok({ message: 'Like supprimé avec succès' });
        }
        catch (error) {
            logger.error('Error on deleting like: ', JSON.stringify(error, null, 2));
            return response.badRequest({
                message: 'Une erreur est survenue lors de la suppression du like.',
                error: error.message,
            });
        }
    }
};
PostLikesController = __decorate([
    inject(),
    __metadata("design:paramtypes", [PostLikeService])
], PostLikesController);
export default PostLikesController;
//# sourceMappingURL=post_likes_controller.js.map