var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { createPostMedia, deletePostMedia } from '#abilities/post_media_abilities';
import Post from '#models/post';
import PostMedia from '#models/post_media';
import PostMediaService from '#services/post_media_service';
import { storePostMediaValidator, updatePostMediaValidator } from '#validators/post_media';
import { inject } from '@adonisjs/core';
let PostMediasController = class PostMediasController {
    postMediaService;
    constructor(postMediaService) {
        this.postMediaService = postMediaService;
    }
    async index({ params, request, response }) {
        try {
            const { page = 1, limit = 10 } = request.qs();
            const medias = await this.postMediaService.getPostMedias(params.postId, {
                page,
                limit,
            });
            return response.ok(medias);
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors de la récupération des médias.',
                error: error.message,
            });
        }
    }
    async show({ params, response }) {
        try {
            const media = await this.postMediaService.getMediaById(params.id);
            if (!media) {
                return response.notFound({
                    message: 'Média non trouvé.',
                });
            }
            return response.ok({ data: media });
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors de la récupération du média.',
                error: error.message,
            });
        }
    }
    async store({ params, request, auth, bouncer, response }) {
        try {
            auth.getUserOrFail();
            const post = await Post.findOrFail(params.postId);
            await bouncer.authorize(createPostMedia, post);
            const { medias } = await request.validateUsing(storePostMediaValidator);
            const createdMedias = await this.postMediaService.createMany(params.postId, medias);
            return response.created({ data: createdMedias });
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors de la création des médias.',
                error: error.message,
            });
        }
    }
    async update({ params, request, auth, response }) {
        try {
            auth.getUserOrFail();
            const media = await PostMedia.findOrFail(params.id);
            await media.load('post');
            if (media.post.userId !== auth.user?.id) {
                return response.forbidden({
                    message: "Vous n'avez pas les permissions pour modifier ce média.",
                });
            }
            const mediaData = await request.validateUsing(updatePostMediaValidator);
            const updatedMedia = await this.postMediaService.updateMedia(params.id, mediaData);
            return response.ok({ data: updatedMedia });
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors de la mise à jour du média.',
                error: error.message,
            });
        }
    }
    async destroy({ params, auth, bouncer, response }) {
        try {
            auth.getUserOrFail();
            const media = await PostMedia.findOrFail(params.id);
            await media.load('post');
            await bouncer.authorize(deletePostMedia, media.post);
            await this.postMediaService.deleteMedia(params.id);
            return response.ok({ message: 'Média supprimé avec succès' });
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors de la suppression du média.',
                error: error.message,
            });
        }
    }
    async destroyAll({ params, auth, bouncer, response }) {
        try {
            auth.getUserOrFail();
            const post = await Post.findOrFail(params.postId);
            await bouncer.authorize(deletePostMedia, post);
            await this.postMediaService.deleteAllPostMedias(params.postId);
            return response.ok({ message: 'Tous les médias ont été supprimés avec succès' });
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors de la suppression des médias.',
                error: error.message,
            });
        }
    }
    async getCount({ params, response }) {
        try {
            const count = await this.postMediaService.getMediaCount(params.postId);
            return response.ok({ count });
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors du comptage des médias.',
                error: error.message,
            });
        }
    }
};
PostMediasController = __decorate([
    inject(),
    __metadata("design:paramtypes", [PostMediaService])
], PostMediasController);
export default PostMediasController;
//# sourceMappingURL=post_medias_controller.js.map