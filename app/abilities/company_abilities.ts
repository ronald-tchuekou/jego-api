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

import Company from '#models/company'
import User, { UserRole } from '#models/user'
import { AuthorizationResponse, Bouncer } from '@adonisjs/bouncer'

export const updateCompany = Bouncer.ability((user: User, company: Company) => {
  if (user.role === UserRole.ADMIN) return true
  if (
    (user.role === UserRole.COMPANY_ADMIN || user.role === UserRole.COMPANY_AGENT) &&
    user.companyId === company.id
  )
    return true

  return AuthorizationResponse.deny(
    "Vous n'avez pas les permissions pour modifier une entreprise.",
    403
  ).t('not_allowed')
})

export const deleteCompany = Bouncer.ability((user: User, company: Company) => {
  const accessToken = user.currentAccessToken

  if (accessToken?.allows('company:delete')) {
    if (user.role === UserRole.ADMIN) return true
    if (user.role === UserRole.COMPANY_ADMIN && user.companyId === company.id) return true
  }
  return AuthorizationResponse.deny(
    "Vous n'avez pas les permissions pour supprimer une entreprise.",
    403
  ).t('not_allowed')
})

export const blockCompany = Bouncer.ability((user: User) => {
  const accessToken = user.currentAccessToken

  if (accessToken?.allows('company:block')) return true

  return AuthorizationResponse.deny(
    "Vous n'avez pas les permissions pour bloquer/débloquer une entreprise.",
    403
  ).t('not_allowed')
})
