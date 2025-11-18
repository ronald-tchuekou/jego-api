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
import PostCommentResponseService from '#services/post_comment_response_service';
import { createPostValidator } from '#validators/post_comment';
let PostCommentResponsesController = class PostCommentResponsesController {
    postCommentResponseService;
    constructor(postCommentResponseService) {
        this.postCommentResponseService = postCommentResponseService;
    }
    async getPostCommentResponses({ request, response }) {
        try {
            const postCommentId = request.param('postCommentId');
            const { page = 1, limit = 5 } = request.qs();
            const postComment = await this.postCommentResponseService.getPostCommentResponses(postCommentId, page, limit);
            return response.ok({ data: postComment });
        }
        catch (error) {
            logger.error('Error on getting user comment responses: ', JSON.stringify(error, null, 2));
            return response.badRequest({
                message: 'Une erreur est survenue lors de la récupération des réponses aux commentaires.',
                error: error.message,
            });
        }
    }
    async store({ request, auth, response }) {
        try {
            const postCommentId = request.param('postCommentId');
            const user = auth.getUserOrFail();
            const comment = request.input('comment');
            const postCommentResponse = await this.postCommentResponseService.create({
                postCommentId,
                userId: user.id,
                comment,
            });
            return response.created({ data: postCommentResponse });
        }
        catch (error) {
            logger.error('Error on creating postCommentResponse: ', JSON.stringify(error, null, 2));
            return response.badRequest({
                message: 'Une erreur est survenue lors de la création de la réponse au commentaire.',
                error: error.message,
            });
        }
    }
    async update({ request, response }) {
        try {
            const id = request.param('id');
            const { comment } = await request.validateUsing(createPostValidator);
            const postComment = await this.postCommentResponseService.update(id, {
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
            const postCommentResponseId = params.id;
            await this.postCommentResponseService.delete(postCommentResponseId);
            return response.ok({ message: 'Réponse au commentaire supprimée avec succès' });
        }
        catch (error) {
            logger.error('Error on deleting commentResponse: ', JSON.stringify(error, null, 2));
            return response.badRequest({
                message: 'Une erreur est survenue lors de la suppression de la réponse au commentaire.',
                error: error.message,
            });
        }
    }
};
PostCommentResponsesController = __decorate([
    inject(),
    __metadata("design:paramtypes", [PostCommentResponseService])
], PostCommentResponsesController);
export default PostCommentResponsesController;
//# sourceMappingURL=post_comment_responses_controller.js.map