var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { createPost, deletePost, editPost } from '#abilities/post_abilities';
import PostService from '#services/post_service';
import { storePostValidator, updatePostValidator } from '#validators/post';
import { inject } from '@adonisjs/core';
import { DateTime } from 'luxon';
let PostsController = class PostsController {
    postService;
    constructor(postService) {
        this.postService = postService;
    }
    async index({ request, response }) {
        try {
            const { page = 1, limit = 10, search = '', userId, status, type, category } = request.qs();
            const posts = await this.postService.getAll({
                page,
                limit,
                search,
                userId,
                status,
                type,
                category,
            });
            return response.ok(posts);
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors de la récupération des posts.',
                error: error.message,
            });
        }
    }
    async store({ request, auth, bouncer, response }) {
        try {
            const user = auth.getUserOrFail();
            await bouncer.authorize(createPost);
            const postData = await request.validateUsing(storePostValidator);
            const savedPost = await this.postService.create(postData, user);
            return response.created({ data: savedPost });
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors de la création du post.',
                error: error.message,
            });
        }
    }
    async show({ params, response }) {
        try {
            const post = await this.postService.findById(params.id);
            if (!post) {
                return response.notFound({
                    message: 'Aucun post trouvé.',
                });
            }
            return response.ok({ data: post });
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors de la récupération du post.',
                error: error.message,
            });
        }
    }
    async update({ params, request, auth, bouncer, response }) {
        try {
            auth.getUserOrFail();
            const post = await this.postService.findById(params.id);
            if (!post) {
                return response.notFound({
                    message: 'Aucun post trouvé.',
                });
            }
            await post.load('user');
            await bouncer.authorize(editPost, post);
            const postData = await request.validateUsing(updatePostValidator);
            const updatedPost = await this.postService.update(params.id, postData);
            return response.ok({ data: updatedPost });
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors de la mise à jour du post.',
                error: error.message,
            });
        }
    }
    async destroy({ params, bouncer, response }) {
        try {
            const post = await this.postService.findById(params.id);
            if (!post) {
                return response.notFound({
                    message: 'Aucun post trouvé.',
                });
            }
            await post.load('user');
            await bouncer.authorize(deletePost);
            await this.postService.delete(params.id);
            return response.ok({ message: 'Post supprimé avec succès' });
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors de la suppression du post.',
                error: error.message,
            });
        }
    }
    async getByUser({ params, request, response }) {
        try {
            const { page = 1, limit = 10, status, type, category } = request.qs();
            const posts = await this.postService.findByUserId(params.userId, {
                page,
                limit,
                status,
                type,
                category,
            });
            return response.ok(posts);
        }
        catch (error) {
            return response.badRequest({
                message: "Une erreur est survenue lors de la récupération des posts de l'utilisateur.",
                error: error.message,
            });
        }
    }
    async getByCategory({ params, request, response }) {
        try {
            const { page = 1, limit = 10, search = '', status, type } = request.qs();
            const posts = await this.postService.getByCategory(params.category, {
                page,
                limit,
                search,
                status,
                type,
            });
            return response.ok(posts);
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors de la récupération des posts par catégorie.',
                error: error.message,
            });
        }
    }
    async getTotal({ request, response }) {
        try {
            const { companyId } = request.qs();
            const total = await this.postService.getTotal(companyId);
            return response.ok({ count: total });
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors du comptage des posts.',
                error: error.message,
            });
        }
    }
    async getPostsCountPerDay({ request, response }) {
        const { startDate, endDate } = request.qs();
        let sDate = startDate;
        let eDate = endDate;
        if (!startDate || !endDate) {
            sDate = DateTime.now().startOf('month').toFormat('yyyy-MM-dd');
            eDate = DateTime.now().endOf('month').toFormat('yyyy-MM-dd');
        }
        const postsCountPerDay = await this.postService.getPostCountPerDay(sDate, eDate);
        return response.ok({ data: postsCountPerDay, startDate: sDate, endDate: eDate });
    }
    async getByCompanyId({ params, request, response }) {
        const { page = 1, limit = 10, search = '' } = request.qs();
        const posts = await this.postService.getByCompanyId(params.companyId, {
            page,
            limit,
            search,
        });
        return response.ok(posts);
    }
};
PostsController = __decorate([
    inject(),
    __metadata("design:paramtypes", [PostService])
], PostsController);
export default PostsController;
//# sourceMappingURL=posts_controller.js.map