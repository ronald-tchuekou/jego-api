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
import User, { UserRole } from '#models/user'
import { AuthorizationResponse, Bouncer } from '@adonisjs/bouncer'

export const createJob = Bouncer.ability((user: User) => {
  // Everyone can create a job except blocked users
  if (user.blockedAt) {
    return AuthorizationResponse.deny(
      "Votre compte est bloqué, vous ne pouvez pas créer d'emploi.",
      403
    ).t('account_blocked')
  }

  if (user.role === UserRole.USER) {
    return AuthorizationResponse.deny(
      "Vous n'avez pas les permissions pour créer un emploi.",
      403
    ).t('not_allowed')
  }

  return true
})

export const editJob = Bouncer.ability((user: User, job: Job) => {
  // Check if user is blocked
  if (user.blockedAt) {
    return AuthorizationResponse.deny(
      'Votre compte est bloqué, vous ne pouvez pas modifier cet emploi.',
      403
    ).t('account_blocked')
  }

  // Admins can edit any job
  if (user.role === UserRole.ADMIN) return true

  // Employees can edit their own jobs
  if (user.companyId === job.user.companyId) return true

  return AuthorizationResponse.deny(
    "Vous n'avez pas les permissions pour modifier cet emploi.",
    403
  ).t('not_allowed')
})

export const deleteJob = Bouncer.ability((user: User, job: Job) => {
  // Check if user is blocked
  if (user.blockedAt) {
    return AuthorizationResponse.deny(
      'Votre compte est bloqué, vous ne pouvez pas supprimer cet emploi.',
      403
    ).t('account_blocked')
  }

  // Admins can delete any job
  if (user.role === UserRole.ADMIN) return true

  // Employees can delete their own jobs
  if (user.companyId === job.user.companyId) return true

  return AuthorizationResponse.deny(
    "Vous n'avez pas les permissions pour supprimer cet emploi.",
    403
  ).t('not_allowed')
})

export const manageJobStatus = Bouncer.ability((user: User, job: Job) => {
  // Check if user is blocked
  if (user.blockedAt) {
    return AuthorizationResponse.deny(
      'Votre compte est bloqué, vous ne pouvez pas modifier le statut de cet emploi.',
      403
    ).t('account_blocked')
  }

  // Admins can manage any job status
  if (user.role === UserRole.ADMIN) return true

  // Employees can manage their own job status
  if (user.companyId === job.user.companyId) return true

  return AuthorizationResponse.deny(
    "Vous n'avez pas les permissions pour modifier le statut de cet emploi.",
    403
  ).t('not_allowed')
})

export const readJobStatistics = Bouncer.ability((user: User) => {
  // Only admins can access job statistics
  if (user.role === UserRole.ADMIN) return true

  return AuthorizationResponse.deny(
    'Seuls les administrateurs peuvent accéder aux statistiques des emplois.',
    403
  ).t('admin_only')
})
