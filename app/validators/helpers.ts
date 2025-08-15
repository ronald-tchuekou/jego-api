import vine from '@vinejs/vine'

export const paginateValidatorHelper = vine.object({
  search: vine.string().optional(),
  page: vine.number().min(1).optional(),
  limit: vine.number().min(1).max(50).optional(),
})
