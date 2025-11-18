import vine from '@vinejs/vine'

// Schema for post media
const postMediaSchema = vine.object({
  name: vine.string().trim(),
  type: vine.string().trim(),
  url: vine.string().trim(),
  size: vine.number().positive(),
  thumbnailUrl: vine.string().trim().optional(),
  alt: vine.string().trim().optional(),
  metadata: vine
    .object({
      width: vine.number(),
      height: vine.number(),
      duration: vine.number().optional(),
      aspectRatio: vine.string().trim(),
    })
    .optional(),
})

export const storePostValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255),
    description: vine.string().trim().minLength(10),
    status: vine.string().trim(),
    type: vine.string().trim().in(['event', 'news']),
    category: vine.string().trim().minLength(2).maxLength(100),
    mediaType: vine.enum(['image', 'video']).optional(),
    medias: vine.array(postMediaSchema).optional(),
  })
)

export const updatePostValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255).optional(),
    description: vine.string().trim().minLength(10).optional(),
    status: vine.string().trim().optional(),
    type: vine.string().trim().in(['event', 'news']).optional(),
    category: vine.string().trim().minLength(2).maxLength(100).optional(),
    mediaType: vine.enum(['image', 'video']).optional(),
    medias: vine.array(postMediaSchema).optional(),
  })
)
