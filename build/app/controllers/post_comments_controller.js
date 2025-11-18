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
import PostCommentService from '#services/post_comment_service';
import { createPostValidator } from '#validators/post_comment';
let PostCommentsController = class PostCommentsController {
    postCommentService;
    constructor(postCommentService) {
        this.postCommentService = postCommentService;
    }
    async getPostComments({ request, response }) {
        try {
            const postId = request.param('postId');
            const { page = 1, limit = 5 } = request.qs();
            const postComment = await this.postCommentService.getPostComments(postId, page, limit);
            return response.ok({ data: postComment });
        }
        catch (error) {
            logger.error('Error on getting user comments: ', JSON.stringify(error, null, 2));
            return response.badRequest({
                message: 'Une erreur est survenue lors de la récupération des commentaires.',
                error: error.message,
            });
        }
    }
    async store({ request, auth, response }) {
        try {
            const postId = request.param('postId');
            const user = auth.getUserOrFail();
            const { comment } = await request.validateUsing(createPostValidator);
            const postComment = await this.postCommentService.create({
                postId,
                userId: user.id,
                comment,
            });
            return response.created({ data: postComment });
        }
        catch (error) {
            logger.error('Error on creating postComment: ' + error);
            return response.badRequest({
                message: 'Une erreur est survenue lors de la création du commentaire.',
                error: error.message,
            });
        }
    }
    async update({ request, response }) {
        try {
            const id = request.param('id');
            const { comment } = await request.validateUsing(createPostValidator);
            const postComment = await this.postCommentService.update(id, {
                comment,
            });
            return response.created({ data: postComment });
        }
        catch (error) {
            logger.error('Error on updating postComment: ' + error);
            return response.badRequest({
                message: 'Une erreur est survenue lors de la mise à jour du commentaire.',
                error: error.message,
            });
        }
    }
    async destroy({ params, response }) {
        try {
            const postCommentId = params.id;
            await this.postCommentService.delete(postCommentId);
            return response.ok({ message: 'Commentaire supprimé avec succès' });
        }
        catch (error) {
            logger.error('Error on deleting comment: ', JSON.stringify(error, null, 2));
            return response.badRequest({
                message: 'Une erreur est survenue lors de la suppression du comment.',
                error: error.message,
            });
        }
    }
};
PostCommentsController = __decorate([
    inject(),
    __metadata("design:paramtypes", [PostCommentService])
], PostCommentsController);
export default PostCommentsController;
//# sourceMappingURL=post_comments_controller.js.map