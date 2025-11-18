import vine from '@vinejs/vine'

export const createPostValidator = vine.compile(
  vine.object({
    comment: vine.string(),
  })
)
