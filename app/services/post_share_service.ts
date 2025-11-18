import PostShare from '#models/post_share'
import Post from '#models/post'

export default class PostShareService {
  private fields: (keyof PostShare)[] = ['postId', 'userId']

  async create(data: Partial<PostShare>) {
    const postShare = new PostShare()

    // Validate required fields
    const requiredFields: (keyof PostShare)[] = ['postId', 'userId']
    requiredFields.forEach((field) => {
      if (!data[field]) {
        throw new Error(`${field} is required to create a post share.`)
      }
    })

    this.fields.forEach((field) => {
      if (data[field] !== undefined) {
        postShare[field] = data[field] as never
      }
    })

    // Check if the post already exists
    const post = await Post.findOrFail(postShare.postId)
    if (!post) {
      throw new Error("Ce post n'existe pas.")
    }

    const share = await postShare.save()

    // Increment company share count
    post.shareCount = Math.max(post.shareCount + 1, 0)
    await post.save()

    return share
  }

  async getUserShare(userId: string, postId: string) {
    return PostShare.findBy({ postId, userId })
  }
}
