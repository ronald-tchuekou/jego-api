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

import User, { UserRole } from '#models/user'
import UserCV from '#models/user_cv'
import { AuthorizationResponse, Bouncer } from '@adonisjs/bouncer'

export const createUserCV = Bouncer.ability((user: User) => {
  // All authenticated users can create CVs
  if (user.role === UserRole.USER) return true
  return AuthorizationResponse.deny("Vous n'avez pas les permissions pour créer ce CV.", 403).t(
    'not_allowed'
  )
})

export const readUserCV = Bouncer.ability((user: User, userCV: UserCV) => {
  // Users can read their own CVs
  if (user.id === userCV.userId) return true

  // Admins can read any CV
  if (user.role === UserRole.ADMIN) return true

  return AuthorizationResponse.deny("Vous n'avez pas les permissions pour lire ce CV.", 403).t(
    'not_allowed'
  )
})

export const updateUserCV = Bouncer.ability((user: User, userCV: UserCV) => {
  // Users can update their own CVs
  if (user.id === userCV.userId) return true

  // Admins can update any CV
  if (user.role === UserRole.ADMIN) return true

  return AuthorizationResponse.deny("Vous n'avez pas les permissions pour modifier ce CV.", 403).t(
    'not_allowed'
  )
})

export const deleteUserCV = Bouncer.ability((user: User, userCV: UserCV) => {
  // Users can delete their own CVs
  if (user.id === userCV.userId) return true

  // Admins can delete any CV
  if (user.role === UserRole.ADMIN) return true

  return AuthorizationResponse.deny("Vous n'avez pas les permissions pour supprimer ce CV.", 403).t(
    'not_allowed'
  )
})
