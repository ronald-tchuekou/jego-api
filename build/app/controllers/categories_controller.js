var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { createCategory, deleteCategory, updateCategory } from '#abilities/category_abilities';
import CategoryService from '#services/category_service';
import { storeCategoryValidator, updateCategoryValidator } from '#validators/category';
import { inject } from '@adonisjs/core';
let CategoriesController = class CategoriesController {
    categoryService;
    constructor(categoryService) {
        this.categoryService = categoryService;
    }
    async index({ request, response }) {
        const { search = '', page = 1, limit = 10 } = request.qs();
        try {
            const categories = await this.categoryService.getAll({ search, page, limit });
            return response.ok(categories);
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors de la récupération des catégories.',
                error: error.message,
            });
        }
    }
    async store({ request, bouncer, response }) {
        try {
            await bouncer.authorize(createCategory);
            const categoryData = await request.validateUsing(storeCategoryValidator);
            const savedCategory = await this.categoryService.create(categoryData);
            return response.created({ data: savedCategory });
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors de la création de la catégorie.',
                error: error.message,
            });
        }
    }
    async show({ params, response }) {
        try {
            const category = await this.categoryService.findById(params.id);
            return response.ok({ data: category });
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors de la récupération de la catégorie.',
                error: error.message,
            });
        }
    }
    async update({ params, request, bouncer, response }) {
        try {
            await bouncer.authorize(updateCategory);
            const categoryData = await request.validateUsing(updateCategoryValidator);
            const updatedCategory = await this.categoryService.update(params.id, categoryData);
            return response.ok({ data: updatedCategory });
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors de la mise à jour de la catégorie.',
                error: error.message,
            });
        }
    }
    async destroy({ params, bouncer, response }) {
        try {
            await bouncer.authorize(deleteCategory);
            await this.categoryService.delete(params.id);
            return response.ok({ message: 'Catégorie supprimée avec succès' });
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors de la suppression de la catégorie.',
                error: error.message,
            });
        }
    }
};
CategoriesController = __decorate([
    inject(),
    __metadata("design:paramtypes", [CategoryService])
], CategoriesController);
export default CategoriesController;
//# sourceMappingURL=categories_controller.js.map