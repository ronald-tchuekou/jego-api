import {
  createCompanyReview,
  deleteCompanyReview,
  updateCompanyReview,
} from '#abilities/company_review_abilities'
import CompanyReviewService from '#services/company_review_service'
import {
  storeCompanyReviewValidator,
  updateCompanyReviewValidator,
} from '#validators/company_review'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class CompanyReviewsController {
  constructor(protected companyReviewService: CompanyReviewService) {}

  /**
   * Display a list of reviews for a specific company
   */
  async index({ request, response, params }: HttpContext) {
    try {
      const { companyId } = params

      const { page = 1, limit = 10, search = '', isApproved } = request.qs()

      const reviews = await this.companyReviewService.getByCompany({
        companyId,
        page,
        limit,
        search,
        isApproved,
      })

      return response.ok(reviews)
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors de la récupération des avis.',
        error: error.message,
      })
    }
  }

  /**
   * Handle form submission for creating a new review
   */
  async store({ request, auth, bouncer, response }: HttpContext) {
    try {
      await bouncer.authorize(createCompanyReview)

      const reviewData = await request.validateUsing(storeCompanyReviewValidator)
      const user = auth.getUserOrFail()

      // Set the userId from authenticated user
      const reviewDataWithUser = { ...reviewData, userId: user.id }

      const savedReview = await this.companyReviewService.create(reviewDataWithUser)

      return response.created({ data: savedReview })
    } catch (error) {
      return response.badRequest({
        message: "Une erreur est survenue lors de la création de l'avis.",
        error: error.message,
      })
    }
  }

  /**
   * Show individual review record
   */
  async show({ params, response }: HttpContext) {
    try {
      const review = await this.companyReviewService.findById(params.id)
      return response.ok({ data: review })
    } catch (error) {
      return response.badRequest({
        message: "Une erreur est survenue lors de la récupération de l'avis.",
        error: error.message,
      })
    }
  }

  /**
   * Handle form submission for updating a review
   */
  async update({ params, request, bouncer, response }: HttpContext) {
    try {
      const review = await this.companyReviewService.findById(params.id)
      await bouncer.authorize(updateCompanyReview, review)

      const reviewData = await request.validateUsing(updateCompanyReviewValidator)
      const updatedReview = await this.companyReviewService.update(params.id, reviewData)

      return response.ok({ data: updatedReview })
    } catch (error) {
      return response.badRequest({
        message: "Une erreur est survenue lors de la mise à jour de l'avis.",
        error: error.message,
      })
    }
  }

  /**
   * Delete review record
   */
  async destroy({ params, bouncer, response }: HttpContext) {
    try {
      const review = await this.companyReviewService.findById(params.id)
      await bouncer.authorize(deleteCompanyReview, review)

      await this.companyReviewService.delete(params.id)
      return response.ok({ message: 'Avis supprimé avec succès' })
    } catch (error) {
      return response.badRequest({
        message: "Une erreur est survenue lors de la suppression de l'avis.",
        error: error.message,
      })
    }
  }

  /**
   * Toggle approval status of a review (admin only)
   */
  async toggleApproval({ params, auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()

      // Only admins can approve/reject reviews
      if (user.role !== 'admin') {
        return response.forbidden({
          message: "Vous n'avez pas les permissions pour approuver/rejeter un avis.",
        })
      }

      const updatedReview = await this.companyReviewService.toggleApproval(params.id)

      const action = updatedReview.isApproved ? 'approuvé' : 'rejeté'

      return response.ok({
        data: updatedReview,
        message: `Avis ${action} avec succès`,
      })
    } catch (error) {
      return response.badRequest({
        message: "Une erreur est survenue lors de la modification du statut de l'avis.",
        error: error.message,
      })
    }
  }

  /**
   * Get rating statistics for a company
   */
  async getCompanyStats({ params, response }: HttpContext) {
    try {
      const stats = await this.companyReviewService.getCompanyRatingStats(params.companyId)
      return response.ok({ data: stats })
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors de la récupération des statistiques.',
        error: error.message,
      })
    }
  }
}
