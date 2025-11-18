import PostCommentResponse from '#models/post_comment_response';
import PostComment from '#models/post_comment';
export default class PostCommentResponseService {
    fields = ['postCommentId', 'userId', 'comment'];
    async create(data) {
        const postCommentResponse = new PostCommentResponse();
        const requiredFields = ['postCommentId', 'userId', 'comment'];
        requiredFields.forEach((field) => {
            if (!data[field]) {
                throw new Error(`${field} is required to create a post commentResponse.`);
            }
        });
        this.fields.forEach((field) => {
            if (data[field] !== undefined) {
                postCommentResponse[field] = data[field];
            }
        });
        const postComment = await PostComment.findOrFail(postCommentResponse.postCommentId);
        if (!postComment) {
            throw new Error("Ce commentaire n'existe pas.");
        }
        const commentResponse = await postCommentResponse.save();
        await commentResponse.load('user');
        await commentResponse.load('postComment');
        return commentResponse;
    }
    async getPostCommentResponses(postCommentId, page = 1, limit = 5) {
        return PostCommentResponse.query()
            .where('postCommentId', postCommentId)
            .preload('user')
            .preload('postComment')
            .orderBy('createdAt', 'desc')
            .paginate(page, limit);
    }
    async delete(postCommentResponseId) {
        const commentResponse = await PostCommentResponse.findOrFail(postCommentResponseId);
        await commentResponse.delete();
        return true;
    }
    async update(id, data) {
        const postComment = await PostCommentResponse.findOrFail(id);
        postComment.comment = data.comment;
        await postComment.save();
        return postComment;
    }
}
//# sourceMappingURL=post_comment_response_service.js.map