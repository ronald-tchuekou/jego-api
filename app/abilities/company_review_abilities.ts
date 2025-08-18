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

import CompanyReview from '#models/company_review'
import User, { UserRole } from '#models/user'
import { AuthorizationResponse, Bouncer } from '@adonisjs/bouncer'

export const createCompanyReview = Bouncer.ability((user: User) => {
  const accessToken = user.currentAccessToken

  if (accessToken?.allows('company_review:create')) {
    // All authenticated users can create reviews except company admins and agents
    if (user.role === UserRole.USER || user.role === UserRole.ADMIN) return true
  }

  return AuthorizationResponse.deny("Vous n'avez pas les permissions pour créer un avis.", 403).t(
    'not_allowed'
  )
})

export const updateCompanyReview = Bouncer.ability((user: User, review: CompanyReview) => {
  const accessToken = user.currentAccessToken

  if (accessToken?.allows('company_review:update')) {
    // Users can only update their own reviews, admins can update any review
    if (user.role === UserRole.ADMIN) return true
    if (user.role === UserRole.USER && user.id === review.userId) return true
  }

  return AuthorizationResponse.deny(
    "Vous n'avez pas les permissions pour modifier cet avis.",
    403
  ).t('not_allowed')
})

export const deleteCompanyReview = Bouncer.ability((user: User, review: CompanyReview) => {
  const accessToken = user.currentAccessToken

  if (accessToken?.allows('company_review:delete')) {
    // Only admins can delete reviews, not company admins or agents
    if (user.role === UserRole.ADMIN) return true
    // Users can delete their own reviews
    if (user.role === UserRole.USER && user.id === review.userId) return true
  }

  return AuthorizationResponse.deny(
    "Vous n'avez pas les permissions pour supprimer cet avis.",
    403
  ).t('not_allowed')
})
