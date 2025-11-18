import Post from '#models/post';
import PostMedia from '#models/post_media';
export default class PostMediaService {
    async createMany(postId, mediasData) {
        const post = await Post.findOrFail(postId);
        if (!post) {
            throw new Error("Le post n'existe pas.");
        }
        if (!mediasData || mediasData.length === 0) {
            throw new Error('Veuillez indiquer au moins un média.');
        }
        mediasData.forEach((mediaData, index) => {
            if (!mediaData.name || !mediaData.url || !mediaData.type || !mediaData.size) {
                throw new Error(`Le média à l'index ${index} doit avoir les champs name, url, type et size.`);
            }
        });
        const firstMediaType = mediasData[0].type;
        const mediaType = firstMediaType.startsWith('image/') ? 'image' : 'video';
        post.mediaType = mediaType;
        await post.save();
        const createdMedias = [];
        for (const mediaData of mediasData) {
            const postMedia = new PostMedia();
            postMedia.postId = postId;
            postMedia.name = mediaData.name;
            postMedia.type = mediaData.type;
            postMedia.url = mediaData.url;
            postMedia.size = mediaData.size;
            postMedia.thumbnailUrl = mediaData.thumbnailUrl || '';
            postMedia.alt = mediaData.alt || '';
            postMedia.metadata = mediaData.metadata || {};
            const savedMedia = await postMedia.save();
            createdMedias.push(savedMedia);
        }
        return createdMedias;
    }
    async updatePostMedias(postId, mediasData) {
        const post = await Post.findOrFail(postId);
        await PostMedia.query().where('postId', postId).delete();
        if (!mediasData || mediasData.length === 0) {
            post.mediaType = null;
            await post.save();
            return [];
        }
        return this.createMany(postId, mediasData);
    }
    async deleteMedia(mediaId) {
        const postMedia = await PostMedia.findOrFail(mediaId);
        const postId = postMedia.postId;
        await postMedia.delete();
        const remainingMedia = await PostMedia.query().where('postId', postId).first();
        if (!remainingMedia) {
            const post = await Post.find(postId);
            if (post) {
                post.mediaType = null;
                await post.save();
            }
        }
        return true;
    }
    async deleteAllPostMedias(postId) {
        await PostMedia.query().where('postId', postId).delete();
        const post = await Post.find(postId);
        if (post) {
            post.mediaType = null;
            await post.save();
        }
        return true;
    }
    async getPostMedias(postId, options = {}) {
        const { page = 1, limit = 10 } = options;
        const query = PostMedia.query().where('postId', postId);
        const paginatedResult = await query.orderBy('createdAt', 'asc').paginate(page, limit);
        return paginatedResult;
    }
    async getMediaById(mediaId) {
        return PostMedia.find(mediaId);
    }
    async getMediaCount(postId) {
        const count = await PostMedia.query().where('postId', postId).count('id as total');
        return Number(count[0].$extras.total);
    }
    async updateMedia(mediaId, data) {
        const postMedia = await PostMedia.findOrFail(mediaId);
        if (data.name !== undefined)
            postMedia.name = data.name;
        if (data.type !== undefined)
            postMedia.type = data.type;
        if (data.url !== undefined)
            postMedia.url = data.url;
        if (data.size !== undefined)
            postMedia.size = data.size;
        if (data.thumbnailUrl !== undefined)
            postMedia.thumbnailUrl = data.thumbnailUrl;
        if (data.alt !== undefined)
            postMedia.alt = data.alt;
        if (data.metadata !== undefined)
            postMedia.metadata = data.metadata;
        await postMedia.save();
        return postMedia;
    }
}
//# sourceMappingURL=post_media_service.js.map