import vine from '@vinejs/vine'

export const storeCompanyImagesValidator = vine.compile(
  vine.object({
    images: vine
      .array(
        vine.file({
          size: '10mb',
          extnames: ['jpg', 'png', 'jpeg', 'webp', 'gif', 'mp4', 'mov', 'avi', 'mkv', 'webm'],
        })
      )
      .minLength(1),
    companyId: vine.string().trim().minLength(1),
  })
)

export const getCompanyImagesValidator = vine.compile(
  vine.object({
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)

export const deleteCompanyImageValidator = vine.compile(
  vine.object({
    imageId: vine.string().trim().minLength(1),
  })
)
