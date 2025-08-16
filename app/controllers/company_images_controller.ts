import { createCompanyImages, deleteCompanyImages } from '#abilities/company_image_abilities'
import CompanyImageService from '#services/company_image_service'
import CompanyService from '#services/company_service'
import { storeCompanyImagesValidator } from '#validators/company_image'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { COMPANY_IMAGES_STORAGE_PATH } from './me_controller.js'

@inject()
export default class CompanyImagesController {
  constructor(
    protected companyImageService: CompanyImageService,
    protected companyService: CompanyService
  ) {}

  /**
   * Display a list of company images
   * Public access - everyone can view company images
   */
  async index({ params, request, response }: HttpContext) {
    try {
      const { companyId } = params
      const { limit = 10, page = 1 } = request.qs()

      // Verify company exists
      await this.companyService.findById(companyId)

      const result = await this.companyImageService.getCompanyImages(companyId, {
        limit,
        page,
      })

      return response.ok(result)
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors de la récupération des images.',
        error: error.message,
      })
    }
  }

  /**
   * Handle form submission for creating multiple company images
   * Access: Admins, Company Admins, Company Agents
   */
  async store({ request, bouncer, response }: HttpContext) {
    try {
      const { images, companyId } = await request.validateUsing(storeCompanyImagesValidator)
      const imagesData = []

      // Get company and verify access
      const company = await this.companyService.findById(companyId)
      await bouncer.authorize(createCompanyImages, company)

      for (const image of images) {
        const filename = `${Date.now()}_${company.name.toLowerCase().replace(/ /g, '_')}.${image.extname}`
        await image.move(COMPANY_IMAGES_STORAGE_PATH, {
          name: filename,
          overwrite: true,
        })

        imagesData.push({
          name: filename,
          path: `${COMPANY_IMAGES_STORAGE_PATH}/${filename}`,
        })
      }

      const createdImages = await this.companyImageService.createMany(companyId, imagesData)

      return response.created({
        data: createdImages,
        message: `${createdImages.length} image(s) ajoutée(s) avec succès`,
      })
    } catch (error) {
      return response.badRequest({
        message: 'Une erreur est survenue lors de la création des images.',
        error: error.message,
      })
    }
  }

  /**
   * Delete a specific company image
   * Access: Admins, Company Admins, Company Agents
   */
  async destroy({ params, bouncer, auth, response }: HttpContext) {
    try {
      const { imageId } = params

      // Get company and verify access
      const company = await this.companyService.findById(auth.user!.companyId || '')
      await bouncer.authorize(deleteCompanyImages, company)

      await this.companyImageService.deleteImage(imageId)

      return response.ok({
        message: 'Image supprimée avec succès',
      })
    } catch (error) {
      return response.badRequest({
        message: "Une erreur est survenue lors de la suppression de l'image.",
        error: error.message,
      })
    }
  }
}
