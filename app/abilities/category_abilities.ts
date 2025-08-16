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

import User from '#models/user'
import { AuthorizationResponse, Bouncer } from '@adonisjs/bouncer'

export const createCategory = Bouncer.ability((user: User) => {
  const accentToken = user.currentAccessToken

  if (accentToken?.allows('category:create')) return true

  return AuthorizationResponse.deny(
    "Vous n'avez pas les permissions pour créer une catégorie.",
    403
  ).t('not_allowed')
})

export const updateCategory = Bouncer.ability((user: User) => {
  const accentToken = user.currentAccessToken

  if (accentToken?.allows('category:update')) return true

  return AuthorizationResponse.deny(
    "Vous n'avez pas les permissions pour modifier une catégorie.",
    403
  ).t('not_allowed')
})

export const deleteCategory = Bouncer.ability((user: User) => {
  const accentToken = user.currentAccessToken

  if (accentToken?.allows('category:delete')) return true

  return AuthorizationResponse.deny(
    "Vous n'avez pas les permissions pour supprimer une catégorie.",
    403
  ).t('not_allowed')
})
