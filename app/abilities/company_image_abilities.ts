/*
|--------------------------------------------------------------------------
| Bouncer abilities for Company Images
|--------------------------------------------------------------------------
|
| Company image access control:
| - Everyone can view company images (public access)
| - Only admins, company admins, and company agents can create/delete images
|
*/

import Company from '#models/company'
import User, { UserRole } from '#models/user'
import { AuthorizationResponse, Bouncer } from '@adonisjs/bouncer'

export const createCompanyImages = Bouncer.ability((user: User, company: Company) => {
  const accessToken = user.currentAccessToken

  if (accessToken?.allows('company-image:update')) {
    if (user.role === UserRole.ADMIN) return true
    if (user.role === UserRole.COMPANY_ADMIN && user.companyId === company.id) return true
    if (user.role === UserRole.COMPANY_AGENT && user.companyId === company.id) return true
  }

  return AuthorizationResponse.deny(
    "Vous n'avez pas les permissions pour ajouter des images à cette entreprise.",
    403
  ).t('not_allowed')
})

export const deleteCompanyImages = Bouncer.ability((user: User, company: Company) => {
  const accessToken = user.currentAccessToken

  if (accessToken?.allows('company-image:update')) {
    if (user.role === UserRole.ADMIN) return true
    if (user.role === UserRole.COMPANY_ADMIN && user.companyId === company.id) return true
    if (user.role === UserRole.COMPANY_AGENT && user.companyId === company.id) return true
  }

  return AuthorizationResponse.deny(
    "Vous n'avez pas les permissions pour supprimer les images de cette entreprise.",
    403
  ).t('not_allowed')
})
