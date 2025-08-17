import vine from '@vinejs/vine'

export const postValidator = vine.compile(
  vine.object({
    id: vine.string().trim(),
    userId: vine.string().trim(),
    title: vine.string().trim(),
    description: vine.string().trim(),
    status: vine.string().trim(),
    type: vine.string().trim(),
    category: vine.string().trim(),
    image: vine.string().trim().optional(),
    createdAt: vine.date({ formats: { utc: true } }),
    updatedAt: vine.date({ formats: { utc: true } }),
    user: vine.object({}),
  })
)
