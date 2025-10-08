import PostComment from '#models/post_comment'
import Post from '#models/post'

export default class PostCommentService {
  private fields: (keyof PostComment)[] = ['postId', 'userId', 'comment']

  async create(data: Partial<PostComment>) {
    const postComment = new PostComment()

    // Validate required fields
    const requiredFields: (keyof PostComment)[] = ['postId', 'userId', 'comment']
    requiredFields.forEach((field) => {
      if (!data[field]) {
        throw new Error(`${field} is required to create a post comment.`)
      }
    })

    this.fields.forEach((field) => {
      if (data[field] !== undefined) {
        postComment[field] = data[field] as never
      }
    })

    // Check if the post already exists
    const post = await Post.findOrFail(postComment.postId)
    if (!post) {
      throw new Error("Ce post n'existe pas.")
    }

    const comment = await postComment.save()

    // Increment company comment count
    post.commentCount = Math.max(post.commentCount + 1, 0)
    await post.save()

    comment.load('user')
    comment.load('post')

    return comment
  }

  async getPostComments(postId: string, page: number = 1, limit: number = 5) {
    return PostComment.query()
      .where('postId', postId)
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)
  }

  async delete(postCommentId: string): Promise<boolean> {
    const comment = await PostComment.findOrFail(postCommentId)
    await comment.delete()

    // Decrement the post-comment count
    const post = await Post.findOrFail(comment.postId)
    post.commentCount = Math.max(post.commentCount - 1, 0)
    await post.save()

    return true
  }
}
