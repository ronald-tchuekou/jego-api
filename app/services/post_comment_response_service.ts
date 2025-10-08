import PostCommentResponse from '#models/post_comment_response'
import PostComment from '#models/post_comment'

export default class PostCommentResponseService {
  private fields: (keyof PostCommentResponse)[] = ['postCommentId', 'userId', 'comment']

  async create(data: Partial<PostCommentResponse>) {
    const postCommentResponse = new PostCommentResponse()

    // Validate required fields
    const requiredFields: (keyof PostCommentResponse)[] = ['postCommentId', 'userId', 'comment']
    requiredFields.forEach((field) => {
      if (!data[field]) {
        throw new Error(`${field} is required to create a post commentResponse.`)
      }
    })

    this.fields.forEach((field) => {
      if (data[field] !== undefined) {
        postCommentResponse[field] = data[field] as never
      }
    })

    // Check if the postComment already exists
    const postComment = await PostComment.findOrFail(postCommentResponse.postCommentId)
    if (!postComment) {
      throw new Error("Ce commentaire n'existe pas.")
    }

    const commentResponse = await postCommentResponse.save()

    commentResponse.load('user')
    commentResponse.load('postComment')

    return commentResponse
  }

  async getPostCommentResponses(postCommentId: string, page: number = 1, limit: number = 5) {
    return PostCommentResponse.query()
      .where('postCommentId', postCommentId)
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)
  }

  async delete(postCommentResponseId: string): Promise<boolean> {
    const commentResponse = await PostCommentResponse.findOrFail(postCommentResponseId)
    await commentResponse.delete()
    return true
  }
}
