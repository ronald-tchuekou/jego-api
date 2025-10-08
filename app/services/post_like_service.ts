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

    await postLike.save()

    // Increment company like count
    post.likeCount = Math.max(post.likeCount + 1, 0)
    await post.save()

    return postLike
  }

  async getUserLike(userId: string, postId: string) {
    return PostLike.findBy({ postId, userId })
  }

  async delete(postId: string, userId: string): Promise<boolean> {
    const postLike = await PostLike.findByOrFail({ postId, userId })
    await postLike.delete()

    // Decrement post like count
    const post = await Post.findOrFail(postId)
    post.likeCount = Math.max(post.likeCount - 1, 0)
    await post.save()

    return true
  }
}
