import Category from '#models/category'

export default class CategoryService {
  private fields: (keyof Category)[] = ['name', 'description', 'slug']

  /**
   * Create a new category
   * @param data - The data to create the category
   * @returns The created category
   * @throws Error if the category already exists
   */
  async create(data: Partial<Category>) {
    const category = new Category()

    // Validate required fields
    const requiredFields: (keyof Category)[] = ['name', 'slug']
    requiredFields.forEach((field) => {
      if (!data[field]) {
        throw new Error(`${field} is required to create a user`)
      }
    })

    this.fields.forEach((field) => {
      if (data[field]) {
        category[field] = data[field] as never
      }
    })

    // Check if the user already exists
    const existingCategory = await Category.query().where('name', category.name).first()
    if (existingCategory) {
      throw new Error('Cette catégorie existe déjà.')
    }

    const savedCategory = await category.save()

    return savedCategory
  }

  /**
   * Update an existing user
   * @param categoryId - The ID of the category to update
   * @param data - The data to update
   * @returns The updated category
   * @throws Error if the category is not found
   */
  async update(categoryId: string, data: Partial<Category>): Promise<Category> {
    const category = await Category.findOrFail(categoryId)

    this.fields.forEach((field) => {
      if (data[field]) {
        category[field] = data[field] as never
      }
    })

    const savedCategory = await category.save()

    return savedCategory
  }

  /**
   * Get categories with pagination
   * @param filters - The filters
   * @returns The categories
   */
  async getAll(filters: { search?: string; page?: number; limit?: number }): Promise<Category[]> {
    const { search = '', page = 1, limit = 10 } = filters

    let queryBuilder = Category.query().where((query) => {
      query.whereILike('name', `%${search}%`)
      query.orWhereILike('description', `%${search}%`)
      query.orWhereILike('slug', `%${search}%`)
    })

    const categories = await queryBuilder
      .orderBy('name', 'asc')
      .orderBy('slug', 'asc')
      .paginate(page, limit)

    return categories
  }

  /**
   * Get the total number of categories
   * @param search - The search query
   * @returns The total number of categories
   */
  async getTotal(search: string = ''): Promise<number> {
    let queryBuilder = Category.query()

    if (search) {
      queryBuilder = queryBuilder.where((query) => {
        query.whereILike('name', `%${query}%`)
        query.orWhereILike('description', `%${query}%`)
        query.orWhereILike('slug', `%${query}%`)
      })
    }

    const total = (await queryBuilder.count('id as total')) as (Category & { total: number })[]

    return total[0].total
  }

  /**
   * Find a category by ID
   * @param categoryId - The ID of the category to find
   * @returns The category
   * @throws Error if category is not found
   */
  async findById(categoryId: string): Promise<Category> {
    return Category.findOrFail(categoryId)
  }

  /**
   * Find a category by slug
   * @param slug - The slug of the category to find
   * @returns The category
   * @throws Error if category is not found
   */
  async findBySlug(slug: string): Promise<Category | null> {
    return Category.query().where('slug', slug).first()
  }

  /**
   * Delete a category by ID
   * @param categoryId - The ID of the category to delete
   * @returns True if deleted successfully
   * @throws Error if category is not found
   */
  async delete(categoryId: string): Promise<boolean> {
    const category = await Category.findOrFail(categoryId)
    await category.delete()
    return true
  }
}
