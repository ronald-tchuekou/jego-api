import PostComment from '#models/post_comment';
import Post from '#models/post';
export default class PostCommentService {
    fields = ['postId', 'userId', 'comment'];
    async create(data) {
        const postComment = new PostComment();
        const requiredFields = ['postId', 'userId', 'comment'];
        requiredFields.forEach((field) => {
            if (!data[field]) {
                throw new Error(`${field} is required to create a post comment.`);
            }
        });
        this.fields.forEach((field) => {
            if (data[field] !== undefined) {
                postComment[field] = data[field];
            }
        });
        const post = await Post.findOrFail(postComment.postId);
        if (!post) {
            throw new Error("Ce post n'existe pas.");
        }
        const comment = await postComment.save();
        post.commentCount = Math.max(post.commentCount + 1, 0);
        await post.save();
        await comment.load('user');
        await comment.load('post');
        return comment;
    }
    async getPostComments(postId, page = 1, limit = 5) {
        return PostComment.query()
            .where('postId', postId)
            .preload('user')
            .preload('post')
            .orderBy('createdAt', 'desc')
            .paginate(page, limit);
    }
    async delete(postCommentId) {
        const comment = await PostComment.findOrFail(postCommentId);
        await comment.delete();
        const post = await Post.findOrFail(comment.postId);
        post.commentCount = Math.max(post.commentCount - 1, 0);
        await post.save();
        return true;
    }
    async update(id, data) {
        const postComment = await PostComment.findOrFail(id);
        postComment.comment = data.comment;
        await postComment.save();
        return postComment;
    }
}
//# sourceMappingURL=post_comment_service.js.map