/*
|--------------------------------------------------------------------------
| Bouncer abilities
|--------------------------------------------------------------------------
|
| You may export multiple abilities from this file and pre-register them
| when creating the Bouncer instance.
|
| Pre-registered policies and abilities can be referenced as a string by their
| name. Also they are must if want to perform authorization inside Edge
| templates.
|
*/

import Job from '#models/job'
import JobApplication from '#models/job_application'
import User, { UserRole } from '#models/user'
import { AuthorizationResponse, Bouncer } from '@adonisjs/bouncer'

export const applyForJob = Bouncer.ability((user: User) => {
  // Check if user is blocked
  if (user.blockedAt) {
    return AuthorizationResponse.deny(
      'Votre compte est bloqué, vous ne pouvez pas postuler pour un emploi.',
      403
    ).t('account_blocked')
  }

  // Only regular users can apply for jobs
  if (user.role !== UserRole.USER) {
    return AuthorizationResponse.deny(
      "Seuls les utilisateurs peuvent postuler pour des offres d'emploi.",
      403
    ).t('not_allowed')
  }

  return true
})

export const editJobApplication = Bouncer.ability(
  async (user: User, application: JobApplication) => {
    // Check if user is blocked
    if (user.blockedAt) {
      return AuthorizationResponse.deny(
        'Votre compte est bloqué, vous ne pouvez pas modifier cette candidature.',
        403
      ).t('account_blocked')
    }

    // Admins can edit any application
    if (user.role === UserRole.ADMIN) return true

    // Company admins and agents can edit applications for their company's jobs
    if (user.role === UserRole.COMPANY_ADMIN || user.role === UserRole.COMPANY_AGENT) {
      if (user.companyId === application.job.user.companyId) {
        return true
      }
    }

    return AuthorizationResponse.deny(
      "Vous n'avez pas les permissions pour modifier cette candidature.",
      403
    ).t('not_allowed')
  }
)

export const deleteJobApplication = Bouncer.ability(
  async (user: User, application: JobApplication) => {
    // Check if user is blocked
    if (user.blockedAt) {
      return AuthorizationResponse.deny(
        'Votre compte est bloqué, vous ne pouvez pas supprimer cette candidature.',
        403
      ).t('account_blocked')
    }

    // Admins can delete any application
    if (user.role === UserRole.ADMIN) return true

    // Company admins can delete applications for their company's jobs
    if (user.role === UserRole.COMPANY_ADMIN) {
      if (user.companyId === application.job.user.companyId) {
        return true
      }
    }

    // Users can delete their own applications
    if (user.id === application.userId) {
      return true
    }

    return AuthorizationResponse.deny(
      "Vous n'avez pas les permissions pour supprimer cette candidature.",
      403
    ).t('not_allowed')
  }
)

export const viewJobApplicationStatistics = Bouncer.ability((user: User) => {
  // Only admins and company admins and agents can view statistics
  if (
    user.role === UserRole.ADMIN ||
    user.role === UserRole.COMPANY_ADMIN ||
    user.role === UserRole.COMPANY_AGENT
  ) {
    return true
  }

  return AuthorizationResponse.deny(
    'Seuls les administrateurs peuvent accéder aux statistiques des candidatures.',
    403
  ).t('admin_only')
})

export const viewJobApplication = Bouncer.ability(
  async (user: User, application: JobApplication) => {
    // Admins can view any application
    if (user.role === UserRole.ADMIN) return true

    // Users can view their own applications
    if (user.id === application.userId) return true

    // Company admins and agents can view applications for their company's jobs
    if (user.role === UserRole.COMPANY_ADMIN || user.role === UserRole.COMPANY_AGENT) {
      if (user.companyId === application.job.user.companyId) {
        return true
      }
    }

    return AuthorizationResponse.deny(
      "Vous n'avez pas les permissions pour voir cette candidature.",
      403
    ).t('not_allowed')
  }
)

export const viewJobApplicationsForJob = Bouncer.ability(async (user: User, job: Job) => {
  // Admins can view applications for any job
  if (user.role === UserRole.ADMIN) return true

  // Company admins and agents can view applications for their company's jobs
  if (user.role === UserRole.COMPANY_ADMIN || user.role === UserRole.COMPANY_AGENT) {
    if (user.companyId === job.user.companyId) {
      return true
    }
  }

  return AuthorizationResponse.deny(
    "Vous n'avez pas les permissions pour voir les candidatures pour cet emploi.",
    403
  ).t('not_allowed')
})
