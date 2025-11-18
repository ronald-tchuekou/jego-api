import { JobApplicationStatus } from '#models/job_application';
import vine from '@vinejs/vine';
export const storeJobApplicationValidator = vine.compile(vine.object({
    userId: vine.string().trim().uuid(),
    jobId: vine.string().trim().uuid(),
    resumePath: vine.string().trim().minLength(5).maxLength(500),
    status: vine.enum(JobApplicationStatus).optional(),
}));
export const updateJobApplicationValidator = vine.compile(vine.object({
    status: vine.enum(JobApplicationStatus).optional(),
    resumePath: vine.string().trim().minLength(5).maxLength(500).optional(),
}));
//# sourceMappingURL=job_application.js.map