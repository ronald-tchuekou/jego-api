import vine from '@vinejs/vine';
const postMediaItemSchema = vine.object({
    name: vine.string().trim().minLength(1),
    type: vine.string().trim().minLength(1),
    url: vine.string().trim().url(),
    size: vine.number().positive(),
    thumbnailUrl: vine.string().trim().url().optional(),
    alt: vine.string().trim().maxLength(255).optional(),
    metadata: vine.object({}).optional(),
});
export const storePostMediaValidator = vine.compile(vine.object({
    medias: vine.array(postMediaItemSchema).minLength(1),
}));
export const updatePostMediaValidator = vine.compile(vine.object({
    name: vine.string().trim().minLength(1).optional(),
    type: vine.string().trim().minLength(1).optional(),
    url: vine.string().trim().url().optional(),
    size: vine.number().positive().optional(),
    thumbnailUrl: vine.string().trim().url().optional(),
    alt: vine.string().trim().maxLength(255).optional(),
    metadata: vine.object({}).optional(),
}));
//# sourceMappingURL=post_media.js.map