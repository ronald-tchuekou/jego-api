import {
  applyForJob,
  deleteJobApplication,
  editJobApplication,
  viewJobApplication,
  viewJobApplicationsForJob,
  viewJobApplicationStatistics,
} from '#abilities/job_application_abilities'
import { UserRole } from '#models/user'
import JobApplicationService from '#services/job_application_service'
import JobService from '#services/job_service'
import {
  storeJobApplicationValidator,
  updateJobApplicationValidator,
} from '#validators/job_application'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

@inject()
export default class JobApplicationsController {
  constructor(
    protected jobApplicationService: JobApplicationService,
    protected jobService: JobService
  ) {}

  /**
   * Display a list of job applications
   */
  async index({ request, response }: HttpContext) {
    try {
      const { page = 1, limit = 10, search = '', userId, jobId, status, companyId } = request.qs()

      const applications = await this.jobApplicationService.getAll({
        page,
        limit,
        search,
        userId,
        jobId,
        status,
        companyId,
      })

      return response.ok(applications)
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors de la récupération des candidatures.',
        error: error.message,
      })
    }
  }

  /**
   * Create a new job application
   */
  async store({ request, auth, bouncer, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()

      // Check authorization - only regular users can apply
      await bouncer.authorize(applyForJob)

      const applicationData = await request.validateUsing(storeJobApplicationValidator)

      // Override userId with authenticated user's ID for security
      const savedApplication = await this.jobApplicationService.create({
        ...applicationData,
        userId: user.id,
      })

      return response.created({ data: savedApplication })
    } catch (error) {
      console.log(error)
      return response.badRequest({
        message: 'Une erreur est survenue lors de la création de la candidature.',
        error: error.message,
      })
    }
  }

  /**
   * Show individual job application
   */
  async show({ params, auth, bouncer, response }: HttpContext) {
    try {
      auth.getUserOrFail()
      const application = await this.jobApplicationService.findById(params.id)

      if (!application) {
        return response.notFound({
          message: 'Aucune candidature trouvée.',
        })
      }

      // Check authorization
      await bouncer.authorize(viewJobApplication, application)

      return response.ok({ data: application })
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors de la récupération de la candidature.',
        error: error.message,
      })
    }
  }

  /**
   * Update a job application (mainly status)
   */
  async update({ params, request, auth, bouncer, response }: HttpContext) {
    try {
      auth.getUserOrFail()
      const application = await this.jobApplicationService.findById(params.id)

      if (!application) {
        return response.notFound({
          message: 'Aucune candidature trouvée.',
        })
      }

      // Check authorization
      await bouncer.authorize(editJobApplication, application)

      const applicationData = await request.validateUsing(updateJobApplicationValidator)
      const updatedApplication = await this.jobApplicationService.update(params.id, applicationData)

      return response.ok({ data: updatedApplication })
    } catch (error) {
      console.log(error)
      return response.badRequest({
        message: 'Une erreur est survenue lors de la mise à jour de la candidature.',
        error: error.message,
      })
    }
  }

  /**
   * Delete a job application
   */
  async destroy({ params, auth, bouncer, response }: HttpContext) {
    try {
      auth.getUserOrFail()
      const application = await this.jobApplicationService.findById(params.id)

      if (!application) {
        return response.notFound({
          message: 'Aucune candidature trouvée.',
        })
      }

      // Check authorization
      await bouncer.authorize(deleteJobApplication, application)

      await this.jobApplicationService.delete(params.id)

      return response.ok({ message: 'Candidature supprimée avec succès' })
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors de la suppression de la candidature.',
        error: error.message,
      })
    }
  }

  /**
   * Get applications by user ID
   */
  async getByUser({ params, request, auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const { page = 1, limit = 10, status } = request.qs()

      // Users can only view their own applications unless they're admin
      if (user.role !== UserRole.ADMIN && user.id !== params.userId) {
        return response.forbidden({
          message: 'Vous ne pouvez voir que vos propres candidatures.',
        })
      }

      const applications = await this.jobApplicationService.findByUserId(params.userId, {
        page,
        limit,
        status,
      })

      return response.ok(applications)
    } catch (error) {
      return response.badRequest({
        message:
          "Une erreur est survenue lors de la récupération des candidatures de l'utilisateur.",
        error: error.message,
      })
    }
  }

  /**
   * Get applications by job ID
   */
  async getByJob({ params, auth, bouncer, response, request }: HttpContext) {
    try {
      auth.getUserOrFail()
      const { page = 1, limit = 10, status } = request.qs()

      // Find the job to check authorization
      const job = await this.jobService.findById(params.jobId)

      if (!job) {
        return response.notFound({
          message: 'Aucun emploi trouvé.',
        })
      }

      // Check authorization
      await bouncer.authorize(viewJobApplicationsForJob, job)

      const applications = await this.jobApplicationService.findByJobId(params.jobId, {
        page,
        limit,
        status,
      })

      return response.ok(applications)
    } catch (error) {
      return response.badRequest({
        message:
          'Une erreur est survenue lors de la récupération des candidatures pour cet emploi.',
        error: error.message,
      })
    }
  }

  /**
   * Check if user has already applied for a job
   */
  async hasApplied({ params, auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const { jobId } = params

      const application = await this.jobApplicationService.hasUserApplied(user.id, jobId)

      return response.ok({
        hasApplied: !!application,
        application: application || null,
      })
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors de la vérification de la candidature.',
        error: error.message,
      })
    }
  }

  /**
   * Get total count of applications
   */
  async getTotal({ request, auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const { userId, jobId, status, companyId } = request.qs()

      // Non-admins can only see counts for their own data
      if (user.role !== UserRole.ADMIN) {
        if (userId && userId !== user.id) {
          return response.forbidden({
            message: 'Vous ne pouvez voir que vos propres statistiques.',
          })
        }
      }

      const total = await this.jobApplicationService.getTotal({
        userId,
        jobId,
        status,
        companyId,
      })

      return response.ok({ count: total })
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors du comptage des candidatures.',
        error: error.message,
      })
    }
  }

  /**
   * Get applications count per day
   */
  async getApplicationsCountPerDay({ request, bouncer, response }: HttpContext) {
    try {
      // Check authorization
      await bouncer.authorize(viewJobApplicationStatistics)

      const { startDate, endDate } = request.qs()
      let sDate = startDate
      let eDate = endDate

      if (!startDate || !endDate) {
        sDate = DateTime.now().startOf('month').toFormat('yyyy-MM-dd')
        eDate = DateTime.now().endOf('month').toFormat('yyyy-MM-dd')
      }

      const applicationsCountPerDay = await this.jobApplicationService.getApplicationCountPerDay(
        sDate,
        eDate
      )

      return response.ok({
        data: applicationsCountPerDay,
        startDate: sDate,
        endDate: eDate,
      })
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors de la récupération des statistiques.',
        error: error.message,
      })
    }
  }

  /**
   * Get applications statistics
   */
  async getStatistics({ bouncer, response }: HttpContext) {
    try {
      // Check authorization
      await bouncer.authorize(viewJobApplicationStatistics)

      const statistics = await this.jobApplicationService.getStatistics()

      return response.ok({ data: statistics })
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors de la récupération des statistiques.',
        error: error.message,
      })
    }
  }

  /**
   * Get statistics for a specific job
   */
  async getJobStatistics({ params, auth, bouncer, response }: HttpContext) {
    try {
      auth.getUserOrFail()

      // Find the job to check authorization
      const job = await this.jobService.findById(params.jobId)

      if (!job) {
        return response.notFound({
          message: 'Aucun emploi trouvé.',
        })
      }

      // Check authorization
      await bouncer.authorize(viewJobApplicationsForJob, job)

      const statistics = await this.jobApplicationService.getJobStatistics(params.jobId)

      return response.ok({ data: statistics })
    } catch (error) {
      return response.badRequest({
        message: "Une erreur est survenue lors de la récupération des statistiques de l'emploi.",
        error: error.message,
      })
    }
  }

  /**
   * Get statistics for a specific user
   */
  async getUserStatistics({ params, auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()

      // Users can only view their own statistics unless they're admin
      if (user.role !== UserRole.ADMIN && user.id !== params.userId) {
        return response.forbidden({
          message: 'Vous ne pouvez voir que vos propres statistiques.',
        })
      }

      const statistics = await this.jobApplicationService.getUserStatistics(params.userId)

      return response.ok({ data: statistics })
    } catch (error) {
      return response.badRequest({
        message:
          "Une erreur est survenue lors de la récupération des statistiques de l'utilisateur.",
        error: error.message,
      })
    }
  }

  /**
   * Get recent applications
   */
  async getRecent({ request, bouncer, response }: HttpContext) {
    try {
      // Check authorization - only admins can see all recent applications
      await bouncer.authorize(viewJobApplicationStatistics)

      const { limit = 10, companyId } = request.qs()

      const applications = await this.jobApplicationService.getRecentApplications({
        limit,
        companyId,
      })

      return response.ok({ data: applications })
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors de la récupération des candidatures récentes.',
        error: error.message,
      })
    }
  }

  /**
   * Get applications for company's jobs
   */
  async getCompanyApplications({ params, request, auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const { page = 1, limit = 10, search, status } = request.qs()

      // Check if user belongs to the company or is admin
      if (user.role !== UserRole.ADMIN && user.companyId !== params.companyId) {
        return response.forbidden({
          message: 'Vous ne pouvez voir que les candidatures de votre entreprise.',
        })
      }

      const applications = await this.jobApplicationService.getCompanyJobApplications(
        params.companyId,
        {
          search,
          page,
          limit,
          status,
        }
      )

      return response.ok(applications)
    } catch (error) {
      return response.badRequest({
        message:
          "Une erreur est survenue lors de la récupération des candidatures de l'entreprise.",
        error: error.message,
      })
    }
  }
}
