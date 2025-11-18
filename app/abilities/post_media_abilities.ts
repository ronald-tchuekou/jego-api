/*
|--------------------------------------------------------------------------
| Bouncer abilities for Post Media
|--------------------------------------------------------------------------
|
| Post media access control:
| - Everyone can view post media (public access)
| - Only the post owner or authorized users can manage media
|
*/

import Post from '#models/post'
import User, { UserRole } from '#models/user'
import { AuthorizationResponse, Bouncer } from '@adonisjs/bouncer'

export const createPostMedia = Bouncer.ability((user: User, post: Post) => {
  const accessToken = user.currentAccessToken

  if (accessToken?.allows('post:create')) {
    // Admin can add media to any post
    if (user.role === UserRole.ADMIN) return true

    // Company admin or agent can add media to posts in their company
    if (
      (user.role === UserRole.COMPANY_ADMIN || user.role === UserRole.COMPANY_AGENT) &&
      post.userId === user.id
    ) {
      return true
    }

    // Post owner can add media to their own post
    if (post.userId === user.id) return true
  }

  return AuthorizationResponse.deny(
    "Vous n'avez pas les permissions pour ajouter des médias à ce post.",
    403
  ).t('not_allowed')
})

export const updatePostMedia = Bouncer.ability((user: User) => {
  const accessToken = user.currentAccessToken

  if (accessToken?.allows('post:update')) {
    // Admin can update any media
    if (user.role === UserRole.ADMIN) return true

    // Need to check if user owns the post associated with this media
    // This will be checked in the controller by loading the post relationship
    return true
  }

  return AuthorizationResponse.deny(
    "Vous n'avez pas les permissions pour modifier ce média.",
    403
  ).t('not_allowed')
})

export const deletePostMedia = Bouncer.ability((user: User, post: Post) => {
  const accessToken = user.currentAccessToken

  if (accessToken?.allows('post:update')) {
    // Admin can delete any media
    if (user.role === UserRole.ADMIN) return true

    // Company admin or agent can delete media from posts in their company
    if (
      (user.role === UserRole.COMPANY_ADMIN || user.role === UserRole.COMPANY_AGENT) &&
      post.userId === user.id
    ) {
      return true
    }

    // Post owner can delete media from their own post
    if (post.userId === user.id) return true
  }

  return AuthorizationResponse.deny(
    "Vous n'avez pas les permissions pour supprimer ce média.",
    403
  ).t('not_allowed')
})
