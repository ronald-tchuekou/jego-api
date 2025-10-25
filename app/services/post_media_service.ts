import Post from '#models/post'
import PostMedia from '#models/post_media'

export interface PostMediaData {
  name: string
  type: string
  url: string
  size: string
  thumbnailUrl?: string
  alt?: string
  metadata?: Record<string, any>
}

export default class PostMediaService {
  /**
   * Create multiple media files for a post
   * @param postId - The ID of the post
   * @param mediasData - Array of media data objects
   * @returns Array of created post media
   * @throws Error if post is not found or validation fails
   */
  async createMany(postId: string, mediasData: PostMediaData[]): Promise<PostMedia[]> {
    // Verify post exists
    const post = await Post.findOrFail(postId)

    if (!post) {
      throw new Error("Le post n'existe pas.")
    }

    // Validate medias data
    if (!mediasData || mediasData.length === 0) {
      throw new Error('Veuillez indiquer au moins un média.')
    }

    // Validate each media data
    mediasData.forEach((mediaData, index) => {
      if (!mediaData.name || !mediaData.url || !mediaData.type || !mediaData.size) {
        throw new Error(
          `Le média à l'index ${index} doit avoir les champs name, url, type et size.`
        )
      }
    })

    // Determine media type (image or video) from the first media's type
    const firstMediaType = mediasData[0].type
    const mediaType = firstMediaType.startsWith('image/') ? 'image' : 'video'

    // Update post media type
    post.mediaType = mediaType
    await post.save()

    // Create all media
    const createdMedias: PostMedia[] = []

    for (const mediaData of mediasData) {
      const postMedia = new PostMedia()
      postMedia.postId = postId
      postMedia.name = mediaData.name
      postMedia.type = mediaData.type
      postMedia.url = mediaData.url
      postMedia.size = mediaData.size
      postMedia.thumbnailUrl = mediaData.thumbnailUrl || ''
      postMedia.alt = mediaData.alt || ''
      postMedia.metadata = mediaData.metadata || {}

      const savedMedia = await postMedia.save()
      createdMedias.push(savedMedia)
    }

    return createdMedias
  }

  /**
   * Update media files for a post (replaces existing media)
   * @param postId - The ID of the post
   * @param mediasData - Array of media data objects
   * @returns Array of created post media
   * @throws Error if post is not found
   */
  async updatePostMedias(postId: string, mediasData: PostMediaData[]): Promise<PostMedia[]> {
    // Verify post exists
    const post = await Post.findOrFail(postId)

    // Delete existing media
    await PostMedia.query().where('postId', postId).delete()

    // If no new media provided, clear mediaType and return empty array
    if (!mediasData || mediasData.length === 0) {
      post.mediaType = null
      await post.save()
      return []
    }

    // Create new media
    return this.createMany(postId, mediasData)
  }

  /**
   * Delete a specific post media
   * @param mediaId - The ID of the media to delete
   * @returns True if deleted successfully
   * @throws Error if media is not found
   */
  async deleteMedia(mediaId: string): Promise<boolean> {
    const postMedia = await PostMedia.findOrFail(mediaId)
    const postId = postMedia.postId

    await postMedia.delete()

    // Check if post has any remaining media
    const remainingMedia = await PostMedia.query().where('postId', postId).first()

    // If no media left, clear the post's mediaType
    if (!remainingMedia) {
      const post = await Post.find(postId)
      if (post) {
        post.mediaType = null
        await post.save()
      }
    }

    return true
  }

  /**
   * Delete all media for a specific post
   * @param postId - The ID of the post
   * @returns True if deleted successfully
   */
  async deleteAllPostMedias(postId: string): Promise<boolean> {
    await PostMedia.query().where('postId', postId).delete()

    // Clear the post's mediaType
    const post = await Post.find(postId)
    if (post) {
      post.mediaType = null
      await post.save()
    }

    return true
  }

  /**
   * Get all media for a specific post
   * @param postId - The ID of the post
   * @param options - Optional pagination and ordering options
   * @returns Array of post media
   */
  async getPostMedias(
    postId: string,
    options: {
      page?: number
      limit?: number
    } = {}
  ) {
    const { page = 1, limit = 10 } = options

    const query = PostMedia.query().where('postId', postId)

    // Apply pagination
    const paginatedResult = await query.orderBy('createdAt', 'asc').paginate(page, limit)

    return paginatedResult
  }

  /**
   * Get a single media by ID
   * @param mediaId - The ID of the media
   * @returns The post media or null if not found
   */
  async getMediaById(mediaId: string): Promise<PostMedia | null> {
    return PostMedia.find(mediaId)
  }

  /**
   * Get the total count of media for a post
   * @param postId - The ID of the post
   * @returns The total number of media files
   */
  async getMediaCount(postId: string): Promise<number> {
    const count = await PostMedia.query().where('postId', postId).count('id as total')

    return Number(count[0].$extras.total)
  }

  /**
   * Update a single media's metadata
   * @param mediaId - The ID of the media
   * @param data - Partial media data to update
   * @returns The updated post media
   * @throws Error if media is not found
   */
  async updateMedia(mediaId: string, data: Partial<PostMediaData>): Promise<PostMedia> {
    const postMedia = await PostMedia.findOrFail(mediaId)

    if (data.name !== undefined) postMedia.name = data.name
    if (data.type !== undefined) postMedia.type = data.type
    if (data.url !== undefined) postMedia.url = data.url
    if (data.size !== undefined) postMedia.size = data.size
    if (data.thumbnailUrl !== undefined) postMedia.thumbnailUrl = data.thumbnailUrl
    if (data.alt !== undefined) postMedia.alt = data.alt
    if (data.metadata !== undefined) postMedia.metadata = data.metadata

    await postMedia.save()
    return postMedia
  }
}
