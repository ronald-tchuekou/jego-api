import Post from '#models/post'
import User from '#models/user'

export default class PostService {
  private fields: (keyof Post)[] = [
    'userId',
    'title',
    'description',
    'status',
    'type',
    'category',
    'image',
  ]

  /**
   * Create a new post
   * @param data - The data to create the post
   * @param user - The user creating the post
   * @returns The created post
   * @throws Error if required fields are missing
   */
  async create(data: Partial<Post>, user: User): Promise<Post> {
    const post = new Post()

    // Validate required fields
    const requiredFields: (keyof Post)[] = ['title', 'description', 'status', 'type', 'category']
    requiredFields.forEach((field) => {
      if (!data[field]) {
        throw new Error(`${field} est requis pour créer un post`)
      }
    })

    // Set the user ID from the authenticated user
    post.userId = user.id

    // Set other fields from data
    this.fields.forEach((field) => {
      if (field !== 'userId' && data[field] !== undefined) {
        post[field] = data[field] as never
      }
    })

    const savedPost = await post.save()
    await savedPost.load('user', (userQuery) => userQuery.preload('company'))

    return savedPost
  }

  /**
   * Update an existing post
   * @param postId - The ID of the post to update
   * @param data - The data to update
   * @returns The updated post
   * @throws Error if the post is not found
   */
  async update(postId: string, data: Partial<Post>): Promise<Post> {
    const post = await Post.findOrFail(postId)

    this.fields.forEach((field) => {
      if (field !== 'userId' && data[field] !== undefined) {
        post[field] = data[field] as never
      }
    })

    const savedPost = await post.save()
    await savedPost.load('user', (userQuery) => userQuery.preload('company'))

    return savedPost
  }

  /**
   * Get posts with pagination and filters
   * @param filters - The filters
   * @returns The posts with pagination
   */
  async getAll(filters: {
    search?: string
    page?: number
    limit?: number
    userId?: string
    status?: string
    type?: string
    category?: string
  }) {
    const { search = '', page = 1, limit = 10, userId, status, type, category } = filters

    let queryBuilder = Post.query()
      .preload('user', (userQuery) => userQuery.preload('company'))
      .orderBy('createdAt', 'desc')

    // Apply search filter
    if (search) {
      queryBuilder = queryBuilder.where((query) => {
        query.whereILike('title', `%${search}%`)
        query.orWhereILike('description', `%${search}%`)
        query.orWhereILike('category', `%${search}%`)
      })
    }

    // Apply additional filters
    if (userId) {
      queryBuilder = queryBuilder.andWhere('userId', userId)
    }

    if (status) {
      queryBuilder = queryBuilder.andWhere('status', status)
    }

    if (type) {
      queryBuilder = queryBuilder.andWhere('type', type)
    }

    if (category) {
      queryBuilder = queryBuilder.andWhere('category', category)
    }

    const posts = await queryBuilder.paginate(page, limit)

    return posts
  }

  /**
   * Get the total number of posts
   * @param filters - The filters
   * @returns The total number of posts
   */
  async getTotal(
    filters: {
      search?: string
      userId?: string
      status?: string
      type?: string
      category?: string
    } = {}
  ): Promise<number> {
    const { search = '', userId, status, type, category } = filters

    let queryBuilder = Post.query()

    // Apply search filter
    if (search) {
      queryBuilder = queryBuilder.where((query) => {
        query.whereILike('title', `%${search}%`)
        query.orWhereILike('description', `%${search}%`)
        query.orWhereILike('category', `%${search}%`)
      })
    }

    // Apply additional filters
    if (userId) {
      queryBuilder = queryBuilder.andWhere('userId', userId)
    }

    if (status) {
      queryBuilder = queryBuilder.andWhere('status', status)
    }

    if (type) {
      queryBuilder = queryBuilder.andWhere('type', type)
    }

    if (category) {
      queryBuilder = queryBuilder.andWhere('category', category)
    }

    const total = (await queryBuilder.count('id as total')) as (Post & { total: number })[]

    return total[0].total
  }

  /**
   * Find a post by ID
   * @param postId - The ID of the post to find
   * @returns The post with user relationship loaded
   */
  async findById(postId: string): Promise<Post | null> {
    return Post.query()
      .where('id', postId)
      .preload('user', (userQuery) => userQuery.preload('company'))
      .first()
  }

  /**
   * Find posts by user ID
   * @param userId - The ID of the user
   * @param filters - Additional filters
   * @returns The user's posts
   */
  async findByUserId(
    userId: string,
    filters: {
      page?: number
      limit?: number
      status?: string
      type?: string
      category?: string
    } = {}
  ) {
    const { page = 1, limit = 10, status, type, category } = filters

    let queryBuilder = Post.query()
      .where('userId', userId)
      .preload('user', (userQuery) => userQuery.preload('company'))
      .orderBy('createdAt', 'desc')

    // Apply additional filters
    if (status) {
      queryBuilder = queryBuilder.andWhere('status', status)
    }

    if (type) {
      queryBuilder = queryBuilder.andWhere('type', type)
    }

    if (category) {
      queryBuilder = queryBuilder.andWhere('category', category)
    }

    const posts = await queryBuilder.paginate(page, limit)

    return posts
  }

  /**
   * Delete a post by ID
   * @param postId - The ID of the post to delete
   * @returns True if deleted successfully
   * @throws Error if post is not found
   */
  async delete(postId: string): Promise<boolean> {
    const post = await Post.findOrFail(postId)
    await post.delete()
    return true
  }

  /**
   * Get posts by category
   * @param category - The category to filter by
   * @param filters - Additional filters
   * @returns Posts in the specified category
   */
  async getByCategory(
    category: string,
    filters: {
      page?: number
      limit?: number
      search?: string
      status?: string
      type?: string
    } = {}
  ) {
    const { page = 1, limit = 10, search = '', status, type } = filters

    let queryBuilder = Post.query()
      .where('category', category)
      .preload('user', (userQuery) => userQuery.preload('company'))
      .orderBy('createdAt', 'desc')

    // Apply search filter
    if (search) {
      queryBuilder = queryBuilder.where((query) => {
        query.whereILike('title', `%${search}%`)
        query.orWhereILike('description', `%${search}%`)
      })
    }

    // Apply additional filters
    if (status) {
      queryBuilder = queryBuilder.andWhere('status', status)
    }

    if (type) {
      queryBuilder = queryBuilder.andWhere('type', type)
    }

    const posts = await queryBuilder.paginate(page, limit)

    return posts
  }
}
