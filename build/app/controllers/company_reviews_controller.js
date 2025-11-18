var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { createCompanyReview, deleteCompanyReview, updateCompanyReview, } from '#abilities/company_review_abilities';
import CompanyReviewService from '#services/company_review_service';
import { storeCompanyReviewValidator, updateCompanyReviewValidator, } from '#validators/company_review';
import { inject } from '@adonisjs/core';
let CompanyReviewsController = class CompanyReviewsController {
    companyReviewService;
    constructor(companyReviewService) {
        this.companyReviewService = companyReviewService;
    }
    async index({ request, response, params }) {
        try {
            const { companyId } = params;
            const { page = 1, limit = 10, search = '', isApproved } = request.qs();
            const reviews = await this.companyReviewService.getByCompany({
                companyId,
                page,
                limit,
                search,
                isApproved,
            });
            return response.ok(reviews);
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors de la récupération des avis.',
                error: error.message,
            });
        }
    }
    async store({ request, auth, bouncer, response }) {
        try {
            await bouncer.authorize(createCompanyReview);
            const reviewData = await request.validateUsing(storeCompanyReviewValidator);
            const user = auth.getUserOrFail();
            const reviewDataWithUser = { ...reviewData, userId: user.id };
            const savedReview = await this.companyReviewService.create(reviewDataWithUser);
            return response.created({ data: savedReview });
        }
        catch (error) {
            return response.badRequest({
                message: "Une erreur est survenue lors de la création de l'avis.",
                error: error.message,
            });
        }
    }
    async show({ params, response }) {
        try {
            const review = await this.companyReviewService.findById(params.id);
            return response.ok({ data: review });
        }
        catch (error) {
            return response.badRequest({
                message: "Une erreur est survenue lors de la récupération de l'avis.",
                error: error.message,
            });
        }
    }
    async update({ params, request, bouncer, response }) {
        try {
            const review = await this.companyReviewService.findById(params.id);
            await bouncer.authorize(updateCompanyReview, review);
            const reviewData = await request.validateUsing(updateCompanyReviewValidator);
            const updatedReview = await this.companyReviewService.update(params.id, reviewData);
            return response.ok({ data: updatedReview });
        }
        catch (error) {
            return response.badRequest({
                message: "Une erreur est survenue lors de la mise à jour de l'avis.",
                error: error.message,
            });
        }
    }
    async destroy({ params, bouncer, response }) {
        try {
            const review = await this.companyReviewService.findById(params.id);
            await bouncer.authorize(deleteCompanyReview, review);
            await this.companyReviewService.delete(params.id);
            return response.ok({ message: 'Avis supprimé avec succès' });
        }
        catch (error) {
            return response.badRequest({
                message: "Une erreur est survenue lors de la suppression de l'avis.",
                error: error.message,
            });
        }
    }
    async toggleApproval({ params, auth, response }) {
        try {
            const user = auth.getUserOrFail();
            if (user.role !== 'admin') {
                return response.forbidden({
                    message: "Vous n'avez pas les permissions pour approuver/rejeter un avis.",
                });
            }
            const updatedReview = await this.companyReviewService.toggleApproval(params.id);
            const action = updatedReview.isApproved ? 'approuvé' : 'rejeté';
            return response.ok({
                data: updatedReview,
                message: `Avis ${action} avec succès`,
            });
        }
        catch (error) {
            return response.badRequest({
                message: "Une erreur est survenue lors de la modification du statut de l'avis.",
                error: error.message,
            });
        }
    }
    async getCompanyStats({ params, response }) {
        try {
            const stats = await this.companyReviewService.getCompanyRatingStats(params.companyId);
            return response.ok({ data: stats });
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors de la récupération des statistiques.',
                error: error.message,
            });
        }
    }
};
CompanyReviewsController = __decorate([
    inject(),
    __metadata("design:paramtypes", [CompanyReviewService])
], CompanyReviewsController);
export default CompanyReviewsController;
//# sourceMappingURL=company_reviews_controller.js.map