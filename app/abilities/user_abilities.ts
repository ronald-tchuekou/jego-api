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

export const readUsers = Bouncer.ability((user: User) => {
  const accentToken = user.currentAccessToken

  if (accentToken?.allows('user:read')) return true

  return AuthorizationResponse.deny(
    "Vous n'avez pas les permissions pour lire les utilisateurs.",
    403
  ).t('not_allowed')
})

export const createUser = Bouncer.ability((user: User) => {
  const accentToken = user.currentAccessToken

  if (accentToken?.allows('user:create')) return true

  return AuthorizationResponse.deny(
    "Vous n'avez pas les permissions pour créer un utilisateur.",
    403
  ).t('not_allowed')
})

export const updateUser = Bouncer.ability((user: User) => {
  const accentToken = user.currentAccessToken

  if (accentToken?.allows('user:update')) return true

  return AuthorizationResponse.deny(
    "Vous n'avez pas les permissions pour modifier un utilisateur.",
    403
  ).t('not_allowed')
})

export const deleteUser = Bouncer.ability((user: User) => {
  const accentToken = user.currentAccessToken

  if (accentToken?.allows('user:delete')) return true

  return AuthorizationResponse.deny(
    "Vous n'avez pas les permissions pour supprimer un utilisateur.",
    403
  ).t('not_allowed')
})
