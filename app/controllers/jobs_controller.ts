import {
  createJob,
  deleteJob,
  editJob,
  manageJobStatus,
  readJobStatistics,
} from '#abilities/job_abilities'
import JobService from '#services/job_service'
import { setExpirationValidator, storeJobValidator, updateJobValidator } from '#validators/job'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

@inject()
export default class JobsController {
  constructor(protected jobService: JobService) {}

  /**
   * Display a list of jobs
   */
  async index({ request, response }: HttpContext) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        userId,
        status,
        companyName,
        expiredOnly = false,
        activeOnly = false,
      } = request.qs()

      const jobs = await this.jobService.getAll({
        page,
        limit,
        search,
        userId,
        status,
        companyName,
        expiredOnly: expiredOnly === 'true',
        activeOnly: activeOnly === 'true',
      })

      return response.ok(jobs)
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors de la récupération des emplois.',
        error: error.message,
      })
    }
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, auth, bouncer, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()

      // Check authorization
      await bouncer.authorize(createJob)

      const jobData = await request.validateUsing(storeJobValidator)
      const savedJob = await this.jobService.create(
        {
          ...jobData,
          expiresAt: jobData.expiresAt ? DateTime.fromJSDate(jobData.expiresAt) : null,
        },
        user
      )

      return response.created({ data: savedJob })
    } catch (error) {
      console.log(error)
      return response.badRequest({
        message: "Une erreur est survenue lors de la création de l'emploi.",
        error: error.message,
      })
    }
  }

  /**
   * Show individual job record
   */
  async show({ params, response }: HttpContext) {
    try {
      const job = await this.jobService.findById(params.id)

      if (!job) {
        return response.notFound({
          message: 'Aucun emploi trouvé.',
        })
      }

      return response.ok({ data: job })
    } catch (error) {
      return response.badRequest({
        message: "Une erreur est survenue lors de la récupération de l'emploi.",
        error: error.message,
      })
    }
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, auth, bouncer, response }: HttpContext) {
    try {
      auth.getUserOrFail()
      const job = await this.jobService.findById(params.id)

      if (!job) {
        return response.notFound({
          message: 'Aucun emploi trouvé.',
        })
      }

      // Load the job user relationship for authorization
      await job.load('user')

      // Check authorization
      await bouncer.authorize(editJob, job)

      const jobData = await request.validateUsing(updateJobValidator)
      const updatedJob = await this.jobService.update(params.id, {
        ...jobData,
        expiresAt: jobData.expiresAt ? DateTime.fromJSDate(jobData.expiresAt) : undefined,
      })

      return response.ok({ data: updatedJob })
    } catch (error) {
      console.log(error)
      return response.badRequest({
        message: "Une erreur est survenue lors de la mise à jour de l'emploi.",
        error: error.message,
      })
    }
  }

  /**
   * Delete job record
   */
  async destroy({ params, bouncer, response }: HttpContext) {
    try {
      const job = await this.jobService.findById(params.id)

      if (!job) {
        return response.notFound({
          message: 'Aucun emploi trouvé.',
        })
      }

      // Load the job user relationship for authorization
      await job.load('user')

      // Check authorization
      await bouncer.authorize(deleteJob, job)

      await this.jobService.delete(params.id)

      return response.ok({ message: 'Emploi supprimé avec succès' })
    } catch (error) {
      return response.badRequest({
        message: "Une erreur est survenue lors de la suppression de l'emploi.",
        error: error.message,
      })
    }
  }

  /**
   * Get jobs by user ID
   */
  async getByUser({ params, request, response }: HttpContext) {
    try {
      const { page = 1, limit = 10, status, expiredOnly = false, activeOnly = false } = request.qs()

      const jobs = await this.jobService.findByUserId(params.userId, {
        page,
        limit,
        status,
        expiredOnly: expiredOnly === 'true',
        activeOnly: activeOnly === 'true',
      })

      return response.ok(jobs)
    } catch (error) {
      return response.badRequest({
        message: "Une erreur est survenue lors de la récupération des emplois de l'utilisateur.",
        error: error.message,
      })
    }
  }

  /**
   * Get expired jobs
   */
  async getExpired({ request, response }: HttpContext) {
    try {
      const { page = 1, limit = 10, userId } = request.qs()

      const jobs = await this.jobService.getExpiredJobs({
        page,
        limit,
        userId,
      })

      return response.ok(jobs)
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors de la récupération des emplois expirés.',
        error: error.message,
      })
    }
  }

  /**
   * Get active jobs
   */
  async getActive({ request, response }: HttpContext) {
    try {
      const { page = 1, limit = 10, userId, status } = request.qs()

      const jobs = await this.jobService.getActiveJobs({
        page,
        limit,
        userId,
        status,
      })

      return response.ok(jobs)
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors de la récupération des emplois actifs.',
        error: error.message,
      })
    }
  }

  /**
   * Toggle job status between OPEN and CLOSED
   */
  async toggleStatus({ params, bouncer, response }: HttpContext) {
    try {
      const job = await this.jobService.findById(params.id)

      if (!job) {
        return response.notFound({
          message: 'Aucun emploi trouvé.',
        })
      }

      // Load the job user relationship for authorization
      await job.load('user')

      // Check authorization
      await bouncer.authorize(manageJobStatus, job)

      const updatedJob = await this.jobService.toggleStatus(params.id)

      const action = updatedJob.status === 'open' ? 'ouvert' : 'fermé'

      return response.ok({
        data: updatedJob,
        message: `Emploi ${action} avec succès`,
      })
    } catch (error) {
      return response.badRequest({
        message: "Une erreur est survenue lors du changement de statut de l'emploi.",
        error: error.message,
      })
    }
  }

  /**
   * Close a job
   */
  async close({ params, bouncer, response }: HttpContext) {
    try {
      const job = await this.jobService.findById(params.id)

      if (!job) {
        return response.notFound({
          message: 'Aucun emploi trouvé.',
        })
      }

      // Load the job user relationship for authorization
      await job.load('user')

      // Check authorization
      await bouncer.authorize(manageJobStatus, job)

      const updatedJob = await this.jobService.closeJob(params.id)

      return response.ok({
        data: updatedJob,
        message: 'Emploi fermé avec succès',
      })
    } catch (error) {
      return response.badRequest({
        message: "Une erreur est survenue lors de la fermeture de l'emploi.",
        error: error.message,
      })
    }
  }

  /**
   * Reopen a job
   */
  async reopen({ params, bouncer, response }: HttpContext) {
    try {
      const job = await this.jobService.findById(params.id)

      if (!job) {
        return response.notFound({
          message: 'Aucun emploi trouvé.',
        })
      }

      // Load the job user relationship for authorization
      await job.load('user')

      // Check authorization
      await bouncer.authorize(manageJobStatus, job)

      const updatedJob = await this.jobService.reopenJob(params.id)

      return response.ok({
        data: updatedJob,
        message: 'Emploi rouvert avec succès',
      })
    } catch (error) {
      return response.badRequest({
        message: "Une erreur est survenue lors de la réouverture de l'emploi.",
        error: error.message,
      })
    }
  }

  /**
   * Set expiration date for a job
   */
  async setExpiration({ params, request, bouncer, response }: HttpContext) {
    try {
      const job = await this.jobService.findById(params.id)

      if (!job) {
        return response.notFound({
          message: 'Aucun emploi trouvé.',
        })
      }

      // Load the job user relationship for authorization
      await job.load('user')

      // Check authorization
      await bouncer.authorize(editJob, job)

      const { expiresAt } = await request.validateUsing(setExpirationValidator)
      const updatedJob = await this.jobService.setExpiration(params.id, expiresAt)

      const message = expiresAt
        ? `Date d'expiration définie avec succès`
        : `Date d'expiration supprimée avec succès`

      return response.ok({
        data: updatedJob,
        message,
      })
    } catch (error) {
      return response.badRequest({
        message: "Une erreur est survenue lors de la définition de la date d'expiration.",
        error: error.message,
      })
    }
  }

  /**
   * Search jobs by company
   */
  async searchByCompany({ request, response }: HttpContext) {
    try {
      const {
        company: companyQuery,
        page = 1,
        limit = 10,
        status,
        activeOnly = false,
      } = request.qs()

      if (!companyQuery) {
        return response.badRequest({
          message: 'Le paramètre company est requis pour la recherche.',
        })
      }

      const jobs = await this.jobService.searchByCompany(companyQuery, {
        page,
        limit,
        status,
        activeOnly: activeOnly === 'true',
      })

      return response.ok(jobs)
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors de la recherche par entreprise.',
        error: error.message,
      })
    }
  }

  /**
   * Get total count of jobs
   */
  async getTotal({ request, response }: HttpContext) {
    try {
      const {
        search = '',
        userId,
        status,
        companyName,
        expiredOnly = false,
        activeOnly = false,
      } = request.qs()

      const total = await this.jobService.getTotal({
        search,
        userId,
        status,
        companyName,
        expiredOnly: expiredOnly === 'true',
        activeOnly: activeOnly === 'true',
      })

      return response.ok({ count: total })
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors du comptage des emplois.',
        error: error.message,
      })
    }
  }

  /**
   * Get jobs count per day
   */
  async getJobsCountPerDay({ request, response }: HttpContext) {
    try {
      const { startDate, endDate } = request.qs()
      let sDate = startDate
      let eDate = endDate

      if (!startDate || !endDate) {
        sDate = DateTime.now().startOf('month').toFormat('yyyy-MM-dd')
        eDate = DateTime.now().endOf('month').toFormat('yyyy-MM-dd')
      }

      const jobsCountPerDay = await this.jobService.getJobCountPerDay(sDate, eDate)

      return response.ok({ data: jobsCountPerDay, startDate: sDate, endDate: eDate })
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors de la récupération des statistiques.',
        error: error.message,
      })
    }
  }

  /**
   * Get job statistics
   */
  async getStatistics({ response, bouncer }: HttpContext) {
    try {
      await bouncer.authorize(readJobStatistics)

      const statistics = await this.jobService.getStatistics()

      return response.ok({ data: statistics })
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors de la récupération des statistiques.',
        error: error.message,
      })
    }
  }
}
