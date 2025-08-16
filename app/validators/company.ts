import vine from '@vinejs/vine'

export const storeCompanyValidator = vine.compile(
  vine.object({
    categoryId: vine.string().trim().minLength(1),
    name: vine.string().trim().minLength(1),
    email: vine.string().trim().email(),
    phone: vine.string().trim().minLength(1),
    address: vine.string().trim().optional(),
    city: vine.string().trim().optional(),
    state: vine.string().trim().optional(),
    zipCode: vine.string().trim().optional(),
    country: vine.string().trim().optional(),
    website: vine.string().trim().url().optional(),
    facebook: vine.string().trim().optional(),
    instagram: vine.string().trim().optional(),
    twitter: vine.string().trim().optional(),
    linkedin: vine.string().trim().optional(),
    youtube: vine.string().trim().optional(),
    tiktok: vine.string().trim().optional(),
    logo: vine.string().trim().optional(),
    bannerImage: vine.string().trim().optional(),
    description: vine.string().trim().optional(),
  })
)

export const updateCompanyValidator = vine.compile(
  vine.object({
    categoryId: vine.string().trim().minLength(1).optional(),
    name: vine.string().trim().minLength(1).optional(),
    email: vine.string().trim().email().optional(),
    phone: vine.string().trim().minLength(1).optional(),
    address: vine.string().trim().optional(),
    city: vine.string().trim().optional(),
    state: vine.string().trim().optional(),
    zipCode: vine.string().trim().optional(),
    country: vine.string().trim().optional(),
    website: vine.string().trim().url().optional(),
    facebook: vine.string().trim().optional(),
    instagram: vine.string().trim().optional(),
    twitter: vine.string().trim().optional(),
    linkedin: vine.string().trim().optional(),
    youtube: vine.string().trim().optional(),
    tiktok: vine.string().trim().optional(),
    logo: vine.string().trim().optional(),
    bannerImage: vine.string().trim().optional(),
    description: vine.string().trim().optional(),
  })
)

export const getCompaniesValidator = vine.compile(
  vine.object({
    search: vine.string().optional(),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(50).optional(),
    categoryId: vine.string().trim().optional(),
  })
)
