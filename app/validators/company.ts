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
    location: vine
      .object({
        lat: vine.number().optional(),
        lng: vine.number().optional(),
      })
      .optional(),
    dailyProgram: vine
      .object({
        Lundi: vine.object({
          open: vine.string().trim().optional(),
          close: vine.string().trim().optional(),
        }),
        Mardi: vine.object({
          open: vine.string().trim().optional(),
          close: vine.string().trim().optional(),
        }),
        Mercredi: vine.object({
          open: vine.string().trim().optional(),
          close: vine.string().trim().optional(),
        }),
        Jeudi: vine.object({
          open: vine.string().trim().optional(),
          close: vine.string().trim().optional(),
        }),
        Vendredi: vine.object({
          open: vine.string().trim().optional(),
          close: vine.string().trim().optional(),
        }),
        Samedi: vine.object({
          open: vine.string().trim().optional(),
          close: vine.string().trim().optional(),
        }),
        Dimanche: vine.object({
          open: vine.string().trim().optional(),
          close: vine.string().trim().optional(),
        }),
      })
      .optional(),
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
    location: vine
      .object({
        lat: vine.number().optional(),
        lng: vine.number().optional(),
      })
      .optional(),
    dailyProgram: vine
      .object({
        Lundi: vine.object({
          open: vine.string().trim().optional(),
          close: vine.string().trim().optional(),
        }),
        Mardi: vine.object({
          open: vine.string().trim().optional(),
          close: vine.string().trim().optional(),
        }),
        Mercredi: vine.object({
          open: vine.string().trim().optional(),
          close: vine.string().trim().optional(),
        }),
        Jeudi: vine.object({
          open: vine.string().trim().optional(),
          close: vine.string().trim().optional(),
        }),
        Vendredi: vine.object({
          open: vine.string().trim().optional(),
          close: vine.string().trim().optional(),
        }),
        Samedi: vine.object({
          open: vine.string().trim().optional(),
          close: vine.string().trim().optional(),
        }),
        Dimanche: vine.object({
          open: vine.string().trim().optional(),
          close: vine.string().trim().optional(),
        }),
      })
      .optional(),
  })
)
