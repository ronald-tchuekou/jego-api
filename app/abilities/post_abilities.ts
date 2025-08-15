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
  const accentToken = user.currentAccessToken

  if (accentToken?.allows('post:create')) return true

  return AuthorizationResponse.deny("Vous n'avez pas les permissions pour créer un post.", 403).t(
    'not_allowed'
  )
})

export const editPost = Bouncer.ability((user: User, post: Post) => {
  const accentToken = user.currentAccessToken

  if (accentToken?.allows('post:edit')) {
    if (user.role === UserRole.ADMIN) return true
    if (user.id === post.userId || user.companyId === post.user.companyId) return true
  }

  return AuthorizationResponse.deny(
    "Vous n'avez pas les permissions pour modifier ce post.",
    403
  ).t('not_allowed')
})

export const deletePost = Bouncer.ability((user: User, post: Post) => {
  const accentToken = user.currentAccessToken

  if (accentToken?.allows('post:delete')) {
    if (user.role === UserRole.ADMIN) return true
    if (user.id === post.userId || user.companyId === post.user.companyId) return true
  }

  return AuthorizationResponse.deny(
    "Vous n'avez pas les permissions pour supprimer ce post.",
    403
  ).t('not_allowed')
})
