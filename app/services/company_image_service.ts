import Company from '#models/company'
import CompanyImage from '#models/company_image'

export default class CompanyImageService {
  /**
   * Create multiple images for a company
   * @param companyId - The ID of the company
   * @param imagesData - Array of image data objects containing name and path
   * @returns Array of created company images
   * @throws Error if company is not found or validation fails
   */
  async createMany(
    companyId: string,
    imagesData: Array<{ name: string; path: string }>
  ): Promise<CompanyImage[]> {
    // Verify company exists
    const company = await Company.findOrFail(companyId)

    if (!company) throw new Error("La company n'exist pas.")

    // Validate images data
    if (!imagesData || imagesData.length === 0) {
      throw new Error('Veuillez indiquer au moins une image.')
    }

    // Validate each image data
    imagesData.forEach((imageData, index) => {
      if (!imageData.name || !imageData.path) {
        throw new Error(`L'image à l'index ${index} dois avoir les champs path et name.`)
      }
    })

    // Create all images
    const createdImages: CompanyImage[] = []

    for (const imageData of imagesData) {
      const companyImage = new CompanyImage()
      companyImage.companyId = companyId
      companyImage.name = imageData.name
      companyImage.path = imageData.path

      const savedImage = await companyImage.save()
      createdImages.push(savedImage)
    }

    return createdImages
  }

  /**
   * Delete a specific company image
   * @param imageId - The ID of the image to delete
   * @returns True if deleted successfully
   * @throws Error if image is not found
   */
  async deleteImage(imageId: string): Promise<boolean> {
    const companyImage = await CompanyImage.findOrFail(imageId)
    await companyImage.delete()
    return true
  }

  /**
   * Get all images for a specific company
   * @param companyId - The ID of the company
   * @param options - Optional pagination and ordering options
   * @returns Array of company images
   * @throws Error if company is not found
   */
  async getCompanyImages(
    companyId: string,
    options: {
      page?: number
      limit?: number
    } = {}
  ): Promise<CompanyImage[]> {
    const { page = 1, limit = 10 } = options

    let query = CompanyImage.query().where('companyId', companyId)

    // Apply pagination if needed
    const paginatedResult = await query.orderBy('createdAt', 'desc').paginate(page, limit)

    return paginatedResult
  }

  /**
   * Get the total count of images for a company
   * @param companyId - The ID of the company
   * @returns The total number of images
   * @throws Error if company is not found
   */
  async getImageCount(companyId: string): Promise<number> {
    // Verify company exists
    await Company.findOrFail(companyId)

    const count = await CompanyImage.query().where('companyId', companyId).count('id as total')

    return (count[0] as any).total
  }
}
