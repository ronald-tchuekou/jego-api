import vine from '@vinejs/vine'

export const storeUserCVValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1),
    path: vine.string().trim().minLength(1),
    type: vine.string().trim().minLength(1),
  })
)

export const updateUserCVValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).optional(),
    path: vine.string().trim().minLength(1).optional(),
    type: vine.string().trim().minLength(1).optional(),
  })
)
