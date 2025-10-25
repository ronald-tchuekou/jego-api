import Post from '#models/post'
import User from '#models/user'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import PostMediaService from './post_media_service.js'

type CreatePostDto = {
  title: string
  description: string
  status: string
  type: string
  category: string
  mediaType?: 'image' | 'video'
  medias?: {
    name: string
    type: string
    url: string
    size: string
    thumbnailUrl?: string
    alt?: string
    metadata?: Record<string, any>
  }[]
}

export default class PostService {
  private postMediaService: PostMediaService

  constructor() {
    this.postMediaService = new PostMediaService()
  }

  /**
   * Create a new post
   * @param data - The data to create the post (including optional medias array)
   * @param user - The user creating the post
   * @returns The created post
   * @throws Error if required fields are missing
   */
  async create(data: CreatePostDto, user: User): Promise<Post> {
    const post = new Post()

    // Set the user ID from the authenticated user
    post.userId = user.id

    const savedPost = await post.save()

    // Handle media creation if provided
    if (data.medias && data.medias.length > 0) {
      await this.postMediaService.createMany(savedPost.id, data.medias)
    }

    // Reload post with all relationships
    await savedPost.load('user', (userQuery) => userQuery.preload('company'))
    await savedPost.load('medias')

    return savedPost
  }

  /**
   * Update an existing post
   * @param postId - The ID of the post to update
   * @param data - The data to update (including optional medias array)
   * @returns The updated post
   * @throws Error if the post is not found
   */
  async update(postId: string, data: Partial<CreatePostDto>): Promise<Post> {
    const post = await Post.findOrFail(postId)

    const savedPost = await post.save()

    // Handle media update if provided
    if (data.medias !== undefined) {
      if (data.medias.length > 0) {
        // Replace existing media with new ones
        await this.postMediaService.updatePostMedias(savedPost.id, data.medias)
      } else {
        // Delete all media if empty array provided
        await this.postMediaService.deleteAllPostMedias(savedPost.id)
      }
    }

    // Reload post with all relationships
    await savedPost.load('user', (userQuery) => userQuery.preload('company'))
    await savedPost.load('medias')

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
      .preload('medias')
      .orderBy('created_at', 'desc')

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
  async getTotal(companyId?: string): Promise<number> {
    let queryBuilder = Post.query()

    if (companyId) {
      queryBuilder
        .join('users', 'posts.user_id', 'users.id')
        .join('companies', 'users.company_id', 'companies.id')
        .where('companies.id', companyId)
    }

    const result = await queryBuilder.count('*', 'total')
    const item = result[0].$extras as { total: number }

    return item.total
  }

  /**
   * Find a post by ID
   * @param postId - The ID of the post to find
   * @returns The post with user and medias relationships loaded
   */
  async findById(postId: string): Promise<Post | null> {
    return Post.query()
      .where('id', postId)
      .preload('user', (userQuery) => userQuery.preload('company'))
      .preload('medias')
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
      .preload('medias')
      .orderBy('created_at', 'desc')

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
      .preload('medias')
      .orderBy('created_at', 'desc')

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

  /**
   * Get post count per day within a date range
   * @param startDate - The start date (YYYY-MM-DD format)
   * @param endDate - The end date (YYYY-MM-DD format)
   * @returns Array of objects with date and count
   */
  async getPostCountPerDay(
    startDate: string,
    endDate: string
  ): Promise<{ date: string; count: number }[]> {
    const start = DateTime.fromISO(startDate).startOf('day')
    const end = DateTime.fromISO(endDate).endOf('day')

    if (!start.isValid || !end.isValid) {
      throw new Error('Invalid date format. Please use YYYY-MM-DD format.')
    }

    if (start > end) {
      throw new Error('Start date must be before or equal to end date.')
    }

    // Query to get post count per day using raw SQL
    const result = await db.rawQuery(
      `
      SELECT
        DATE(created_at) as date,
        COUNT(*) as count
      FROM posts
      WHERE created_at between ? AND ?
      GROUP BY DATE(created_at)
      ORDER BY date ASC
      `,
      [start.toSQL(), end.toSQL()]
    )
    // Create a map of existing results
    const resultMap = new Map<string, number>()
    result.rows.forEach((row: any) => {
      const date = DateTime.fromJSDate(row.date).toFormat('yyyy-MM-dd')
      resultMap.set(date, row.count)
    })

    // Fill in missing dates with count 0
    const finalResult: { date: string; count: number }[] = []
    let currentDate = DateTime.fromISO(startDate)

    while (currentDate <= DateTime.fromISO(endDate)) {
      const dateString = currentDate.toFormat('yyyy-MM-dd')
      finalResult.push({
        date: dateString,
        count: resultMap.get(dateString) || 0,
      })
      currentDate = currentDate.plus({ days: 1 })
    }

    return finalResult
  }

  /**
   * Get posts by company id
   */
  async getByCompanyId(
    companyId: string,
    filters: {
      page?: number
      limit?: number
      search?: string
    } = {}
  ) {
    const { page = 1, limit = 10, search = '' } = filters

    let queryBuilder = Post.query()
      .select('posts.*')
      .join('users', 'posts.user_id', 'users.id')
      .join('companies', 'users.company_id', 'companies.id')
      .where('companies.id', companyId)
      .preload('user')
      .preload('medias')
      .orderBy('created_at', 'desc')

    if (search) {
      queryBuilder = queryBuilder.where((query) => {
        query.whereILike('title', `%${search}%`)
        query.orWhereILike('description', `%${search}%`)
      })
    }

    const posts = await queryBuilder.paginate(page, limit)

    return posts
  }
}
