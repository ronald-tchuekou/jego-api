import vine from '@vinejs/vine'

export const updateMeValidator = vine.compile(
  vine.object({
    firstName: vine.string().optional(),
    lastName: vine.string().optional(),
    phone: vine.string().optional(),
    address: vine.string().optional(),
    city: vine.string().optional(),
    state: vine.string().optional(),
    zipCode: vine.string().optional(),
    country: vine.string().optional(),
    password: vine.string().optional(),
    passwordConfirm: vine.string().sameAs('password').optional().requiredIfExists('password'),
  })
)
