import { JobStatus } from '#models/job'
import vine from '@vinejs/vine'

export const storeJobValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255),
    description: vine.string().trim().minLength(10),
    companyName: vine.string().trim().minLength(2).maxLength(255).optional(),
    companyLogo: vine.string().trim().optional(),
    companyWebsite: vine.string().trim().url().optional(),
    companyEmail: vine.string().trim().email().optional(),
    companyPhone: vine.string().trim().minLength(9).maxLength(20).optional(),
    companyAddress: vine.string().trim().maxLength(255).optional(),
    companyCity: vine.string().trim().minLength(2).maxLength(100).optional(),
    companyState: vine.string().trim().minLength(2).maxLength(100).optional(),
    companyZip: vine.string().trim().minLength(3).maxLength(20).optional(),
    companyCountry: vine.string().trim().minLength(2).maxLength(100).optional(),
    expiresAt: vine.date({ formats: ['YYYY-MM-DD', 'YYYY-MM-DD HH:mm:ss'] }).optional(),
    status: vine.enum(JobStatus).optional(),
  })
)

export const updateJobValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255).optional(),
    description: vine.string().trim().minLength(10).optional(),
    companyName: vine.string().trim().minLength(2).maxLength(255).optional(),
    companyLogo: vine.string().trim().optional(),
    companyWebsite: vine.string().trim().url().optional(),
    companyEmail: vine.string().trim().email().optional(),
    companyPhone: vine.string().trim().minLength(9).maxLength(20).optional(),
    companyAddress: vine.string().trim().maxLength(255).optional(),
    companyCity: vine.string().trim().minLength(2).maxLength(100).optional(),
    companyState: vine.string().trim().minLength(2).maxLength(100).optional(),
    companyZip: vine.string().trim().minLength(3).maxLength(20).optional(),
    companyCountry: vine.string().trim().minLength(2).maxLength(100).optional(),
    expiresAt: vine.date({ formats: ['YYYY-MM-DD', 'YYYY-MM-DD HH:mm:ss'] }).optional(),
    status: vine.enum(JobStatus).optional(),
  })
)

export const setExpirationValidator = vine.compile(
  vine.object({
    expiresAt: vine.date({ formats: ['YYYY-MM-DD', 'YYYY-MM-DD HH:mm:ss'] }).nullable(),
  })
)
