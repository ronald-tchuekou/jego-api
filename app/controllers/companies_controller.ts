import { blockCompany, deleteCompany, updateCompany } from '#abilities/company_abilities'
import CompanyService from '#services/company_service'
import { storeCompanyValidator, updateCompanyValidator } from '#validators/company'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

@inject()
export default class CompaniesController {
  constructor(protected companyService: CompanyService) {}

  /**
   * Get the total number of companies
   */
  async getTotal({ request, response }: HttpContext) {
    const { search = '' } = request.qs()
    const total = await this.companyService.getTotal(search)
    return response.ok({ count: total })
  }

  /**
   * Display a list of companies
   */
  async index({ request, response }: HttpContext) {
    try {
      const { page = 1, limit = 10, search = '', categoryId, status } = request.qs()
      const companies = await this.companyService.getAll({
        page,
        limit,
        search,
        categoryId,
        status,
      })

      return response.ok(companies)
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors de la récupération des entreprises.',
        error: error.message,
      })
    }
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, response }: HttpContext) {
    try {
      const companyData = await request.validateUsing(storeCompanyValidator)
      const savedCompany = await this.companyService.create(companyData)

      return response.created({ data: savedCompany })
    } catch (error) {
      return response.badRequest({
        message: "Une erreur est survenue lors de la création de l'entreprise.",
        error: error.message,
      })
    }
  }

  /**
   * Show individual company record
   */
  async show({ params, response }: HttpContext) {
    try {
      const company = await this.companyService.findById(params.id)
      return response.ok({ data: company })
    } catch (error) {
      return response.badRequest({
        message: "Une erreur est survenue lors de la récupération de l'entreprise.",
        error: error.message,
      })
    }
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, bouncer, response }: HttpContext) {
    try {
      const company = await this.companyService.findById(params.id)

      if (!company) {
        return response.notFound({
          message: 'Aucune entreprise trouvée.',
        })
      }

      await bouncer.authorize(updateCompany, company)

      const companyData = await request.validateUsing(updateCompanyValidator)
      const updatedCompany = await this.companyService.update(params.id, companyData)
      return response.ok({ data: updatedCompany })
    } catch (error) {
      return response.badRequest({
        message: "Une erreur est survenue lors de la mise à jour de l'entreprise.",
        error: error.message,
      })
    }
  }

  /**
   * Delete company record
   */
  async destroy({ params, bouncer, response }: HttpContext) {
    try {
      const company = await this.companyService.findById(params.id)

      if (!company) {
        return response.notFound({
          message: 'Aucune entreprise trouvée.',
        })
      }
      await bouncer.authorize(deleteCompany, company)

      await this.companyService.delete(params.id)
      return response.ok({ message: 'Entreprise supprimée avec succès' })
    } catch (error) {
      return response.badRequest({
        message: "Une erreur est survenue lors de la suppression de l'entreprise.",
        error: error.message,
      })
    }
  }

  /**
   * Find company by email
   */
  async findByEmail({ request, response }: HttpContext) {
    try {
      const { email } = request.qs()

      if (!email) {
        return response.badRequest({
          message: "L'email est requis.",
        })
      }

      const company = await this.companyService.findByEmail(email)

      if (!company) {
        return response.notFound({
          message: 'Aucune entreprise trouvée avec cet email.',
        })
      }

      return response.ok({ data: company })
    } catch (error) {
      return response.badRequest({
        message: "Une erreur est survenue lors de la recherche de l'entreprise.",
        error: error.message,
      })
    }
  }

  /**
   * Get total count of companies
   */
  async count({ request, response }: HttpContext) {
    try {
      const { search = '' } = request.qs()
      const total = await this.companyService.getTotal(search)

      return response.ok({ total })
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors du comptage des entreprises.',
        error: error.message,
      })
    }
  }

  /**
   * Toggle blocked status of a company
   */
  async toggleBlockedStatus({ params, bouncer, response }: HttpContext) {
    try {
      await bouncer.authorize(blockCompany)

      const updatedCompany = await this.companyService.toggleBlockedStatus(params.id)

      const action = updatedCompany.blockedAt ? 'bloquée' : 'débloquée'

      return response.ok({
        data: updatedCompany,
        message: `Entreprise ${action} avec succès`,
      })
    } catch (error) {
      return response.badRequest({
        message: "Une erreur est survenue lors du changement de statut de l'entreprise.",
        error: error.message,
      })
    }
  }

  /**
   * Toggle approve status of a company
   */
  async toggleApproveStatus({ params, response }: HttpContext) {
    try {
      const company = await this.companyService.findById(params.id)

      if (!company) {
        return response.notFound({
          message: 'Aucune entreprise trouvée.',
        })
      }

      const updatedCompany = await this.companyService.toggleApproveStatus(params.id)

      const action = updatedCompany.verifiedAt ? 'approuvée' : 'désapprouvée'

      return response.ok({
        data: updatedCompany,
        message: `Entreprise ${action} avec succès`,
      })
    } catch (error) {
      return response.badRequest({
        message: "Une erreur est survenue lors du changement de statut de l'entreprise.",
        error: error.message,
      })
    }
  }

  /**
   * Get companies count per day
   */
  async getCompaniesCountPerDay({ request, response }: HttpContext) {
    const { startDate, endDate } = request.qs()
    let sDate = startDate
    let eDate = endDate

    if (!startDate || !endDate) {
      sDate = DateTime.now().startOf('month').toFormat('yyyy-MM-dd')
      eDate = DateTime.now().endOf('month').toFormat('yyyy-MM-dd')
    }

    const companiesCountPerDay = await this.companyService.getCompanyCountPerDay(sDate, eDate)
    return response.ok({ data: companiesCountPerDay, startDate: sDate, endDate: eDate })
  }
}
