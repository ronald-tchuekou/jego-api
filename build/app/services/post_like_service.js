import PostLike from '#models/post_like';
import Post from '#models/post';
export default class PostLikeService {
    fields = ['postId', 'userId'];
    async create(data) {
        const postLike = new PostLike();
        const requiredFields = ['postId', 'userId'];
        requiredFields.forEach((field) => {
            if (!data[field]) {
                throw new Error(`${field} is required to create a post like.`);
            }
        });
        this.fields.forEach((field) => {
            if (data[field] !== undefined) {
                postLike[field] = data[field];
            }
        });
        const post = await Post.findOrFail(postLike.postId);
        if (!post) {
            throw new Error("Ce post n'existe pas.");
        }
        await postLike.save();
        post.likeCount = Math.max(post.likeCount + 1, 0);
        await post.save();
        return postLike;
    }
    async getUserLike(userId, postId) {
        return PostLike.findBy({ postId, userId });
    }
    async delete(postId, userId) {
        const postLike = await PostLike.findByOrFail({ postId, userId });
        await postLike.deleteQuietly();
        const post = await Post.findOrFail(postId);
        post.likeCount = Math.max(post.likeCount - 1, 0);
        await post.save();
        return true;
    }
}
//# sourceMappingURL=post_like_service.js.map