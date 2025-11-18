import PostShare from '#models/post_share';
import Post from '#models/post';
export default class PostShareService {
    fields = ['postId', 'userId'];
    async create(data) {
        const postShare = new PostShare();
        const requiredFields = ['postId', 'userId'];
        requiredFields.forEach((field) => {
            if (!data[field]) {
                throw new Error(`${field} is required to create a post share.`);
            }
        });
        this.fields.forEach((field) => {
            if (data[field] !== undefined) {
                postShare[field] = data[field];
            }
        });
        const post = await Post.findOrFail(postShare.postId);
        if (!post) {
            throw new Error("Ce post n'existe pas.");
        }
        const share = await postShare.save();
        post.shareCount = Math.max(post.shareCount + 1, 0);
        await post.save();
        return share;
    }
    async getUserShare(userId, postId) {
        return PostShare.findBy({ postId, userId });
    }
}
//# sourceMappingURL=post_share_service.js.map