import { JobApplicationStatus } from '#models/job_application'
import vine from '@vinejs/vine'

/**
 * Validator for creating a new job application
 */
export const storeJobApplicationValidator = vine.compile(
  vine.object({
    userId: vine.string().trim().uuid(),
    jobId: vine.string().trim().uuid(),
    resumePath: vine.string().trim().minLength(5).maxLength(500),
    status: vine.enum(JobApplicationStatus).optional(),
  })
)

/**
 * Validator for updating a job application
 * Only status and resume path can be updated
 */
export const updateJobApplicationValidator = vine.compile(
  vine.object({
    status: vine.enum(JobApplicationStatus).optional(),
    resumePath: vine.string().trim().minLength(5).maxLength(500).optional(),
  })
)
