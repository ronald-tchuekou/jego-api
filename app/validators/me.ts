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

export const updateMeEmailValidator = vine.compile(
  vine.object({
    password: vine.string(),
    email: vine.string().email(),
  })
)

export const verifyNewEmailValidator = vine.compile(
  vine.object({
    token: vine.string(),
  })
)

export const updateMePasswordValidator = vine.compile(
  vine.object({
    currentPassword: vine.string(),
    newPassword: vine.string(),
    confirmNewPassword: vine.string().sameAs('newPassword'),
  })
)

export const deleteAccountValidator = vine.compile(
  vine.object({
    password: vine.string(),
  })
)
