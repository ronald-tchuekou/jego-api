import PostLike from '#models/post_like'
import Post from '#models/post'

export default class PostLikeService {
  private fields: (keyof PostLike)[] = ['postId', 'userId']

  async create(data: Partial<PostLike>) {
    const postLike = new PostLike()

    // Validate required fields
    const requiredFields: (keyof PostLike)[] = ['postId', 'userId']
    requiredFields.forEach((field) => {
      if (!data[field]) {
        throw new Error(`${field} is required to create a post like.`)
      }
    })

    this.fields.forEach((field) => {
      if (data[field] !== undefined) {
        postLike[field] = data[field] as never
      }
    })

    // Check if the post already exists
    const post = await Post.findOrFail(postLike.postId)
    if (!post) {
      throw new Error("Ce post n'existe pas.")
    }

    const like = await postLike.save()

    // Increment company like count
    post.likeCount = Math.max(post.likeCount + 1, 0)
    await post.save()

    return like
  }

  async getUserLike(userId: string, postId: string) {
    return PostLike.findBy({ postId, userId })
  }

  async delete(postId: string, userId: string): Promise<boolean> {
    const like = await PostLike.query().where('postId', postId).andWhere('userId', userId).first()
    console.info('Delete like: ', like, ', postId: ', postId, ', userId: ', userId, '')

    if (!like) {
      throw new Error('Like not found')
    }

    await like.delete()

    // Decrement post like count
    const post = await Post.findOrFail(postId)
    post.likeCount = Math.max(post.likeCount - 1, 0)
    await post.save()

    return true
  }
}
