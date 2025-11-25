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

/**
 
 make the verify-token and reset-password forms, base on the sign-in form.
 to verify the email, the user will provide the received token, and this will be send to /auth/verify-token endpoint as post request.
 when the token is valid, the user id from the data response that looks like {message: string, user: User} will stored in the local storage and the user will be redirected to the reset-password page.

 reset-password form will be the same as the sign-in form.
 in that form, the user will provide the new password, and the password confirmation.
 when the form is submitted, the information will be send to /auth/reset-password endpoint as post request.
 the response will be a message that the password has been reset successfully, the data result that looks like: {...user, token: string} will be store in the cookie. akt like sign-in action.
 
 
 */
