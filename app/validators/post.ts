import vine from '@vinejs/vine'

export const storePostValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255),
    description: vine.string().trim().minLength(10),
    status: vine.string().trim().in(['draft', 'published', 'archived']),
    type: vine.string().trim().in(['job', 'service', 'announcement', 'news', 'other']),
    category: vine.string().trim().minLength(2).maxLength(100),
    image: vine.string().trim().optional(),
  })
)

export const updatePostValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255).optional(),
    description: vine.string().trim().minLength(10).optional(),
    status: vine.string().trim().in(['draft', 'published', 'archived']).optional(),
    type: vine.string().trim().in(['job', 'service', 'announcement', 'news', 'other']).optional(),
    category: vine.string().trim().minLength(2).maxLength(100).optional(),
    image: vine.string().trim().optional(),
  })
)
