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
const PostsController = () => import('#controllers/posts_controller')
const FilesController = () => import('#controllers/files_controller')
const JobsController = () => import('#controllers/jobs_controller')
const JobApplicationsController = () => import('#controllers/job_applications_controller')

router.get('', async () => {
  return {
    hello: 'JeGo API is health.',
  }
})

router
  .group(() => {
    /**
     * Auth routes
     */
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

    /**
     * Me routes
     */
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

    /**
     * User routes
     */
    router
      .group(() => {
        // Protected
        router
          .group(() => {
            router.get('', [UserController, 'index'])
            router.get('count', [UserController, 'getTotal'])
            router.get('count-per-day', [UserController, 'getUserCountPerDay'])
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

    /**
     * Categories routes
     */
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

    /**
     * Companies routes
     */
    router
      .group(() => {
        // Protected
        router
          .group(() => {
            router.get('count', [CompaniesController, 'getTotal'])
            router.get('count-per-day', [CompaniesController, 'getCompaniesCountPerDay'])
            router.put(':id', [CompaniesController, 'update'])
            router.delete(':id', [CompaniesController, 'destroy'])
            router.patch(':id/toggle-block', [CompaniesController, 'toggleBlockedStatus'])
            router.patch(':id/toggle-approve', [CompaniesController, 'toggleApproveStatus'])
          })
          .middleware([middleware.auth()])

        // Public
        router.get('', [CompaniesController, 'index'])
        router.post('', [CompaniesController, 'store'])
        router.get(':id', [CompaniesController, 'show'])
      })
      .prefix('companies')

    /**
     * Company Images routes
     */
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

    /**
     * Company Reviews routes
     */
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
        router.get(':id', [CompanyReviewsController, 'show'])
        router.get('company/:companyId', [CompanyReviewsController, 'index'])
        router.get(':companyId/stats', [CompanyReviewsController, 'getCompanyStats'])
      })
      .prefix('company-reviews')

    /**
     * Posts routes
     */
    router
      .group(() => {
        // Protected
        router
          .group(() => {
            router.post('', [PostsController, 'store'])
            router.put(':id', [PostsController, 'update'])
            router.delete(':id', [PostsController, 'destroy'])
          })
          .middleware([middleware.auth()])

        // Public
        router.get('', [PostsController, 'index'])
        router.get('count', [PostsController, 'getTotal'])
        router.get('count-per-day', [PostsController, 'getPostsCountPerDay'])
        router.get(':id', [PostsController, 'show'])
        router.get('user/:userId', [PostsController, 'getByUser'])
        router.get('company/:companyId', [PostsController, 'getByCompanyId'])
        router.get('category/:category', [PostsController, 'getByCategory'])
      })
      .prefix('posts')

    /**
     * Files routes
     */
    router
      .group(() => {
        router.post('upload-single', [FilesController, 'uploadSingle'])
        router.post('upload-multiple', [FilesController, 'uploadMultiple'])
        router.get('load', [FilesController, 'load'])
        router.delete('revert', [FilesController, 'revert'])
      })
      .prefix('files')

    /**
     * Jobs routes
     */
    router
      .group(() => {
        // Protected
        router
          .group(() => {
            router.post('', [JobsController, 'store'])
            router.put(':id', [JobsController, 'update'])
            router.delete(':id', [JobsController, 'destroy'])
            router.patch(':id/toggle-status', [JobsController, 'toggleStatus'])
            router.patch(':id/close', [JobsController, 'close'])
            router.patch(':id/reopen', [JobsController, 'reopen'])
            router.patch(':id/set-expiration', [JobsController, 'setExpiration'])
          })
          .middleware([middleware.auth()])

        // Public
        router.get('', [JobsController, 'index'])
        router.get('count', [JobsController, 'getTotal'])
        router.get('count-per-day', [JobsController, 'getJobsCountPerDay'])
        router.get('expired', [JobsController, 'getExpired'])
        router.get('active', [JobsController, 'getActive'])
        router.get('user/:userId', [JobsController, 'getByUser'])
        router.get('company/:companyId', [JobsController, 'getJobsByCompanyId'])
        router.get('stats', [JobsController, 'getStatistics'])
        router.get(':id', [JobsController, 'show'])
      })
      .prefix('jobs')

    /**
     * Job Applications routes
     */
    router
      .group(() => {
        // Protected
        router
          .group(() => {
            router.get('', [JobApplicationsController, 'index'])
            router.post('', [JobApplicationsController, 'store'])
            router.put(':id', [JobApplicationsController, 'update'])
            router.delete(':id', [JobApplicationsController, 'destroy'])
            router.get('count', [JobApplicationsController, 'getTotal'])
            router.get('count-per-day', [JobApplicationsController, 'getApplicationsCountPerDay'])
            router.get('stats', [JobApplicationsController, 'getStatistics'])
            router.get('recent', [JobApplicationsController, 'getRecent'])
            router.get('user/:userId', [JobApplicationsController, 'getByUser'])
            router.get('user/:userId/stats', [JobApplicationsController, 'getUserStatistics'])
            router.get('job/:jobId', [JobApplicationsController, 'getByJob'])
            router.get('job/:jobId/stats', [JobApplicationsController, 'getJobStatistics'])
            router.get('job/:jobId/check', [JobApplicationsController, 'hasApplied'])
            router.get('company/:companyId', [JobApplicationsController, 'getCompanyApplications'])
            router.get(':id', [JobApplicationsController, 'show'])
          })
          .middleware([middleware.auth()])
      })
      .prefix('job-applications')

    router.get('storage/*', [DownloadFileController, 'download'])
  })
  .prefix('v1')
