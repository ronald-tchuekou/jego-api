import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import CompanyFollowingService from '#services/company_following_service'
import logger from '@adonisjs/core/services/logger'

@inject()
export default class CompanyFollowingsController {
  constructor(protected companyFollowingService: CompanyFollowingService) {}

  async getUserFollowing({ request, response }: HttpContext) {
    try {
      const userId = request.param('userId')
      const companyId = request.param('companyId')
      const following = await this.companyFollowingService.getUserFollowing(userId, companyId)
      return response.ok({ data: following })
    } catch (error) {
      logger.error('Error on getting user following: ', JSON.stringify(error, null, 2))
      return response.badRequest({
        message: 'Une erreur est survenue lors de la récupération des followers.',
        error: error.message,
      })
    }
  }

  async getCompanyFollowers({ request, response }: HttpContext) {
    try {
      const companyId = request.param('companyId')
      const { page = 1, limit = 10, search = '' } = request.qs()

      const followers = await this.companyFollowingService.getCompanyFollowers({
        companyId,
        page,
        limit,
        search,
      })

      return response.ok(followers)
    } catch (error) {
      logger.error('Error on getting company followers: ', JSON.stringify(error, null, 2))
      return response.badRequest({
        message: 'Une erreur est survenue lors de la récupération des followers.',
        error: error.message,
      })
    }
  }

  async store({ request, auth, response }: HttpContext) {
    try {
      const companyId = request.param('companyId')
      const user = auth.getUserOrFail()

      const companyFollowing = await this.companyFollowingService.create({
        companyId,
        userId: user.id,
      })

      return response.created({ data: companyFollowing })
    } catch (error) {
      logger.error('Error on creating following: ', JSON.stringify(error, null, 2))
      return response.badRequest({
        message: 'Une erreur est survenue lors de la création du post.',
        error: error.message,
      })
    }
  }

  async destroy({ params, response, auth }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const companyId = params.companyId
      await this.companyFollowingService.delete(companyId, user.id)
      return response.ok({ message: 'Following supprimé avec succès' })
    } catch (error) {
      logger.error('Error on deleting following: ', JSON.stringify(error, null, 2))
      return response.badRequest({
        message: 'Une erreur est survenue lors de la suppression du post.',
        error: error.message,
      })
    }
  }
}
