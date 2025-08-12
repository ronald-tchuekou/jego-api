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
const DownloadFileController = () => import('#controllers/download_file_controller')

router.get('/', async () => {
  return {
    hello: 'JeGo API is health.',
  }
})

router
  .group(() => {
    router
      .group(() => {
        router.post('/logout', [AuthController, 'logout']).middleware([middleware.auth()])
        router.post('/register', [AuthController, 'register'])
        router.post('/login', [AuthController, 'login'])
        router.post('/verify-email', [AuthController, 'verifyEmail'])
        router.post('/forgot-password', [AuthController, 'forgotPassword'])
        router.post('/reset-password', [AuthController, 'resetPassword'])
      })
      .prefix('auth')

    router
      .group(() => {
        router.get('/', [MeController, 'get'])
        router.put('/', [MeController, 'update'])
        router.get('/revalidate-token', [AuthController, 'revalidateToken'])
        router.post('/image-profile', [MeController, 'uploadImageProfile'])
        router.post('/update-email', [MeController, 'updateEmail'])
        router.get('/resend-verification-email', [MeController, 'resendVerificationEmail'])
        router.post('/verify-new-email', [MeController, 'verifyNewEmail'])
        router.post('/update-password', [MeController, 'updatePassword'])
        router.post('/delete-account', [MeController, 'deleteAccount'])
      })
      .prefix('me')
      .middleware([middleware.auth()])

    router
      .group(() => {
        router.resource('/users', UserController).apiOnly()
      })
      .middleware([middleware.auth()])

    router.get('/uploads/*', [DownloadFileController, 'download'])
  })
  .prefix('v1')
