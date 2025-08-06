import vine from '@vinejs/vine'

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string(),
  })
)

export const registerValidator = vine.compile(
  vine.object({
    firstName: vine.string(),
    lastName: vine.string(),
    companyId: vine.string().optional(),
    phone: vine.string().optional(),
    address: vine.string().optional(),
    city: vine.string().optional(),
    state: vine.string().optional(),
    zipCode: vine.string().optional(),
    country: vine.string().optional(),
    email: vine.string().email(),
    password: vine.string(),
  })
)

export const forgotPasswordValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
  })
)

export const resetPasswordValidator = vine.compile(
  vine.object({
    token: vine.string().minLength(6),
    password: vine.string().minLength(8),
    passwordConfirmation: vine.string().sameAs('password'),
  })
)

export const verifyEmail = vine.compile(
  vine.object({
    token: vine.string().minLength(6),
    userId: vine.string().uuid(),
  })
)
