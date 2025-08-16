import vine from '@vinejs/vine'

export const storeCategoryValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1),
    description: vine.string().trim().optional(),
    slug: vine.string().trim().minLength(1),
  })
)

export const updateCategoryValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).optional(),
    description: vine.string().trim().minLength(1).optional(),
    slug: vine.string().trim().minLength(1).optional(),
  })
)
