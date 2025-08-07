/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const AuthController = () => import('#controllers/auth_controller')
const MeController = () => import('#controllers/me_controller')
const UserController = () => import('#controllers/user_controller')

router.get('/', async () => {
  return {
    hello: 'JeGo API is health.',
  }
})

router
  .group(() => {
    router
      .group(() => {
        router.post('logout', [AuthController, 'logout']).middleware([middleware.auth()])
        router.post('register', [AuthController, 'register'])
        router.post('login', [AuthController, 'login'])
        router.post('verify-email', [AuthController, 'verifyEmail'])
        router.post('forgot-password', [AuthController, 'forgotPassword'])
        router.post('reset-password', [AuthController, 'resetPassword'])
      })
      .prefix('auth')

    router
      .group(() => {
        router.get('/', [MeController, 'get'])
        router.put('/', [MeController, 'update'])
        router.get('/revalidate-token', [AuthController, 'revalidateToken'])
      })
      .prefix('me')
      .middleware([middleware.auth()])

    router
      .group(() => {
        router.resource('users', UserController).apiOnly()
      })
      .middleware([middleware.auth()])
  })
  .prefix('v1')
