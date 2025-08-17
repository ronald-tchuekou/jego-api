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
const CategoriesController = () => import('#controllers/categories_controller')
const CompaniesController = () => import('#controllers/companies_controller')
const CompanyImagesController = () => import('#controllers/company_images_controller')
const CompanyReviewsController = () => import('#controllers/company_reviews_controller')

router.get('', async () => {
  return {
    hello: 'JeGo API is health.',
  }
})

router
  .group(() => {
    // Auth routes
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

    // Me routes
    router
      .group(() => {
        router.get('', [MeController, 'get'])
        router.put('', [MeController, 'update'])
        router.get('revalidate-token', [AuthController, 'revalidateToken'])
        router.post('image-profile', [MeController, 'uploadImageProfile'])
        router.post('update-email', [MeController, 'updateEmail'])
        router.get('resend-verification-email', [MeController, 'resendVerificationEmail'])
        router.post('verify-new-email', [MeController, 'verifyNewEmail'])
        router.post('update-password', [MeController, 'updatePassword'])
        router.post('delete-account', [MeController, 'deleteAccount'])
      })
      .prefix('me')
      .middleware([middleware.auth()])

    // User routes
    router
      .group(() => {
        // Protected
        router
          .group(() => {
            router.get('', [UserController, 'index'])
            router.post('', [UserController, 'store'])
            router.put(':id', [UserController, 'update'])
            router.delete(':id', [UserController, 'destroy'])
            router.patch(':id/toggle-block', [UserController, 'toggleBlockUser'])
          })
          .middleware([middleware.auth()])

        // Public
        router.get(':id', [UserController, 'show'])
      })
      .prefix('users')

    // Categories routes
    router
      .group(() => {
        // Protected
        router
          .group(() => {
            router.post('', [CategoriesController, 'store'])
            router.put(':id', [CategoriesController, 'update'])
            router.delete(':id', [CategoriesController, 'destroy'])
          })
          .middleware([middleware.auth()])

        // Public
        router.get('', [CategoriesController, 'index'])
        router.get(':id', [CategoriesController, 'show'])
      })
      .prefix('categories')

    // Companies routes
    router
      .group(() => {
        // Protected
        router
          .group(() => {
            router.put(':id', [CompaniesController, 'update'])
            router.delete(':id', [CompaniesController, 'destroy'])
            router.patch(':id/toggle-block', [CompaniesController, 'toggleBlockedStatus'])
            router.patch(':id/toggle-approve', [CompaniesController, 'toggleApproveStatus'])
          })
          .middleware([middleware.auth()])

        // Public
        router.get(':id', [CompaniesController, 'show'])
        router.get('', [CompaniesController, 'index'])
        router.post('', [CompaniesController, 'store'])
      })
      .prefix('companies')

    // Company Images routes
    router
      .group(() => {
        // Protected
        router
          .group(() => {
            router.post('', [CompanyImagesController, 'store'])
            router.delete(':imageId', [CompanyImagesController, 'destroy'])
          })
          .middleware([middleware.auth()])

        // Public
        router.get(':companyId', [CompanyImagesController, 'index'])
      })
      .prefix('company-images')

    // Company Reviews routes
    router
      .group(() => {
        // Protected
        router
          .group(() => {
            router.post('', [CompanyReviewsController, 'store'])
            router.put(':id', [CompanyReviewsController, 'update'])
            router.delete(':id', [CompanyReviewsController, 'destroy'])
            router.patch(':id/toggle-approval', [CompanyReviewsController, 'toggleApproval'])
          })
          .middleware([middleware.auth()])

        // Public
        router.get(':companyId', [CompanyReviewsController, 'index'])
        router.get(':id', [CompanyReviewsController, 'show'])
        router.get(':companyId/stats', [CompanyReviewsController, 'getCompanyStats'])
      })
      .prefix('company-reviews')

    router.get('storage/*', [DownloadFileController, 'download'])
  })
  .prefix('v1')
