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

import Post from '#models/post'
import User, { UserRole } from '#models/user'
import { AuthorizationResponse, Bouncer } from '@adonisjs/bouncer'

export const createPost = Bouncer.ability((user: User) => {
  // Every user can create a post except simple users (UserRole.USER)
  if (user.role !== UserRole.USER) return true

  return AuthorizationResponse.deny(
    "Seuls les administrateurs et les utilisateurs d'entreprise peuvent créer des posts.",
    403
  ).t('not_allowed')
})

export const editPost = Bouncer.ability((user: User, post: Post) => {
  // Admins can edit any post
  if (user.role === UserRole.ADMIN) return true

  // Users can edit their own posts
  if (user.id === post.userId) return true

  // Company admins and agents can edit posts from their company
  if (
    (user.role === UserRole.COMPANY_ADMIN || user.role === UserRole.COMPANY_AGENT) &&
    user.companyId === post.user.companyId
  )
    return true

  return AuthorizationResponse.deny(
    "Vous n'avez pas les permissions pour modifier ce post.",
    403
  ).t('not_allowed')
})

export const deletePost = Bouncer.ability((user: User) => {
  // Only admins, company admins and company agents can delete a post
  if (
    user.role === UserRole.ADMIN ||
    user.role === UserRole.COMPANY_ADMIN ||
    user.role === UserRole.COMPANY_AGENT
  ) {
    return true
  }

  return AuthorizationResponse.deny(
    "Seuls les administrateurs et les utilisateurs d'entreprise peuvent supprimer des posts.",
    403
  ).t('not_allowed')
})
