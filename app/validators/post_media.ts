import vine from '@vinejs/vine'

// Schema for a single post media item
const postMediaItemSchema = vine.object({
  name: vine.string().trim().minLength(1),
  type: vine.string().trim().minLength(1),
  url: vine.string().trim().url(),
  size: vine.number().positive(),
  thumbnailUrl: vine.string().trim().url().optional(),
  alt: vine.string().trim().maxLength(255).optional(),
  metadata: vine.object({}).optional(),
})

// Validator for creating multiple media for a post
export const storePostMediaValidator = vine.compile(
  vine.object({
    medias: vine.array(postMediaItemSchema).minLength(1),
  })
)

// Validator for updating a single media
export const updatePostMediaValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).optional(),
    type: vine.string().trim().minLength(1).optional(),
    url: vine.string().trim().url().optional(),
    size: vine.number().positive().optional(),
    thumbnailUrl: vine.string().trim().url().optional(),
    alt: vine.string().trim().maxLength(255).optional(),
    metadata: vine.object({}).optional(),
  })
)
