import vine from '@vinejs/vine'

export const storeCompanyReviewValidator = vine.compile(
  vine.object({
    companyId: vine.string().trim().minLength(1),
    comment: vine.string().trim().minLength(1).maxLength(1000),
    rating: vine.number().min(1).max(5),
  })
)

export const updateCompanyReviewValidator = vine.compile(
  vine.object({
    comment: vine.string().trim().minLength(1).maxLength(1000).optional(),
    rating: vine.number().min(1).max(5).optional(),
  })
)
