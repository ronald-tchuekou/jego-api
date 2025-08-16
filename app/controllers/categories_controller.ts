import { createCategory, deleteCategory, updateCategory } from '#abilities/category_abilities'
import CategoryService from '#services/category_service'
import { storeCategoryValidator, updateCategoryValidator } from '#validators/category'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class CategoriesController {
  constructor(protected categoryService: CategoryService) {}

  /**
   * Display a list of resource
   */
  async index({ request, response }: HttpContext) {
    const { search = '', page = 1, limit = 10 } = request.qs()

    try {
      const categories = await this.categoryService.getAll({ search, page, limit })

      return response.ok(categories)
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors de la récupération des catégories.',
        error: error.message,
      })
    }
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, bouncer, response }: HttpContext) {
    try {
      await bouncer.authorize(createCategory)

      const categoryData = await request.validateUsing(storeCategoryValidator)
      const savedCategory = await this.categoryService.create(categoryData)

      return response.created({ data: savedCategory })
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors de la création de la catégorie.',
        error: error.message,
      })
    }
  }

  /**
   * Show individual record
   */
  async show({ params, response }: HttpContext) {
    try {
      const category = await this.categoryService.findById(params.id)
      return response.ok({ data: category })
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors de la récupération de la catégorie.',
        error: error.message,
      })
    }
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, bouncer, response }: HttpContext) {
    try {
      await bouncer.authorize(updateCategory)

      const categoryData = await request.validateUsing(updateCategoryValidator)
      const updatedCategory = await this.categoryService.update(params.id, categoryData)
      return response.ok({ data: updatedCategory })
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors de la mise à jour de la catégorie.',
        error: error.message,
      })
    }
  }

  /**
   * Delete record
   */
  async destroy({ params, bouncer, response }: HttpContext) {
    try {
      await bouncer.authorize(deleteCategory)

      await this.categoryService.delete(params.id)
      return response.ok({ message: 'Catégorie supprimée avec succès' })
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors de la suppression de la catégorie.',
        error: error.message,
      })
    }
  }
}
