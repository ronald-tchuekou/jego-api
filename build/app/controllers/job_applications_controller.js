var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { applyForJob, deleteJobApplication, editJobApplication, viewJobApplication, viewJobApplicationsForJob, viewJobApplicationStatistics, } from '#abilities/job_application_abilities';
import { UserRole } from '#models/user';
import JobApplicationService from '#services/job_application_service';
import JobService from '#services/job_service';
import { storeJobApplicationValidator, updateJobApplicationValidator, } from '#validators/job_application';
import { inject } from '@adonisjs/core';
import { DateTime } from 'luxon';
let JobApplicationsController = class JobApplicationsController {
    jobApplicationService;
    jobService;
    constructor(jobApplicationService, jobService) {
        this.jobApplicationService = jobApplicationService;
        this.jobService = jobService;
    }
    async index({ request, response }) {
        try {
            const { page = 1, limit = 10, search = '', userId, jobId, status, companyId } = request.qs();
            const applications = await this.jobApplicationService.getAll({
                page,
                limit,
                search,
                userId,
                jobId,
                status,
                companyId,
            });
            return response.ok(applications);
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors de la récupération des candidatures.',
                error: error.message,
            });
        }
    }
    async store({ request, auth, bouncer, response }) {
        try {
            const user = auth.getUserOrFail();
            await bouncer.authorize(applyForJob);
            const applicationData = await request.validateUsing(storeJobApplicationValidator);
            const savedApplication = await this.jobApplicationService.create({
                ...applicationData,
                userId: user.id,
            });
            return response.created({ data: savedApplication });
        }
        catch (error) {
            console.log(error);
            return response.badRequest({
                message: 'Une erreur est survenue lors de la création de la candidature.',
                error: error.message,
            });
        }
    }
    async show({ params, auth, bouncer, response }) {
        try {
            auth.getUserOrFail();
            const application = await this.jobApplicationService.findById(params.id);
            if (!application) {
                return response.notFound({
                    message: 'Aucune candidature trouvée.',
                });
            }
            await bouncer.authorize(viewJobApplication, application);
            return response.ok({ data: application });
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors de la récupération de la candidature.',
                error: error.message,
            });
        }
    }
    async update({ params, request, auth, bouncer, response }) {
        try {
            auth.getUserOrFail();
            const application = await this.jobApplicationService.findById(params.id);
            if (!application) {
                return response.notFound({
                    message: 'Aucune candidature trouvée.',
                });
            }
            await bouncer.authorize(editJobApplication, application);
            const applicationData = await request.validateUsing(updateJobApplicationValidator);
            const updatedApplication = await this.jobApplicationService.update(params.id, applicationData);
            return response.ok({ data: updatedApplication });
        }
        catch (error) {
            console.log(error);
            return response.badRequest({
                message: 'Une erreur est survenue lors de la mise à jour de la candidature.',
                error: error.message,
            });
        }
    }
    async destroy({ params, auth, bouncer, response }) {
        try {
            auth.getUserOrFail();
            const application = await this.jobApplicationService.findById(params.id);
            if (!application) {
                return response.notFound({
                    message: 'Aucune candidature trouvée.',
                });
            }
            await bouncer.authorize(deleteJobApplication, application);
            await this.jobApplicationService.delete(params.id);
            return response.ok({ message: 'Candidature supprimée avec succès' });
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors de la suppression de la candidature.',
                error: error.message,
            });
        }
    }
    async getByUser({ params, request, auth, response }) {
        try {
            const user = auth.getUserOrFail();
            const { page = 1, limit = 10, status } = request.qs();
            if (user.role !== UserRole.ADMIN && user.id !== params.userId) {
                return response.forbidden({
                    message: 'Vous ne pouvez voir que vos propres candidatures.',
                });
            }
            const applications = await this.jobApplicationService.findByUserId(params.userId, {
                page,
                limit,
                status,
            });
            return response.ok(applications);
        }
        catch (error) {
            return response.badRequest({
                message: "Une erreur est survenue lors de la récupération des candidatures de l'utilisateur.",
                error: error.message,
            });
        }
    }
    async getByJob({ params, auth, bouncer, response, request }) {
        try {
            auth.getUserOrFail();
            const { page = 1, limit = 10, status } = request.qs();
            const job = await this.jobService.findById(params.jobId);
            if (!job) {
                return response.notFound({
                    message: 'Aucun emploi trouvé.',
                });
            }
            await bouncer.authorize(viewJobApplicationsForJob, job);
            const applications = await this.jobApplicationService.findByJobId(params.jobId, {
                page,
                limit,
                status,
            });
            return response.ok(applications);
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors de la récupération des candidatures pour cet emploi.',
                error: error.message,
            });
        }
    }
    async hasApplied({ params, auth, response }) {
        try {
            const user = auth.getUserOrFail();
            const { jobId } = params;
            const application = await this.jobApplicationService.hasUserApplied(user.id, jobId);
            return response.ok({
                hasApplied: !!application,
                application: application || null,
            });
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors de la vérification de la candidature.',
                error: error.message,
            });
        }
    }
    async getTotal({ request, auth, response }) {
        try {
            const user = auth.getUserOrFail();
            const { userId, jobId, status, companyId } = request.qs();
            if (user.role !== UserRole.ADMIN) {
                if (userId && userId !== user.id) {
                    return response.forbidden({
                        message: 'Vous ne pouvez voir que vos propres statistiques.',
                    });
                }
            }
            const total = await this.jobApplicationService.getTotal({
                userId,
                jobId,
                status,
                companyId,
            });
            return response.ok({ count: total });
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors du comptage des candidatures.',
                error: error.message,
            });
        }
    }
    async getApplicationsCountPerDay({ request, bouncer, response }) {
        try {
            await bouncer.authorize(viewJobApplicationStatistics);
            const { startDate, endDate } = request.qs();
            let sDate = startDate;
            let eDate = endDate;
            if (!startDate || !endDate) {
                sDate = DateTime.now().startOf('month').toFormat('yyyy-MM-dd');
                eDate = DateTime.now().endOf('month').toFormat('yyyy-MM-dd');
            }
            const applicationsCountPerDay = await this.jobApplicationService.getApplicationCountPerDay(sDate, eDate);
            return response.ok({
                data: applicationsCountPerDay,
                startDate: sDate,
                endDate: eDate,
            });
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors de la récupération des statistiques.',
                error: error.message,
            });
        }
    }
    async getStatistics({ bouncer, response }) {
        try {
            await bouncer.authorize(viewJobApplicationStatistics);
            const statistics = await this.jobApplicationService.getStatistics();
            return response.ok({ data: statistics });
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors de la récupération des statistiques.',
                error: error.message,
            });
        }
    }
    async getJobStatistics({ params, auth, bouncer, response }) {
        try {
            auth.getUserOrFail();
            const job = await this.jobService.findById(params.jobId);
            if (!job) {
                return response.notFound({
                    message: 'Aucun emploi trouvé.',
                });
            }
            await bouncer.authorize(viewJobApplicationsForJob, job);
            const statistics = await this.jobApplicationService.getJobStatistics(params.jobId);
            return response.ok({ data: statistics });
        }
        catch (error) {
            return response.badRequest({
                message: "Une erreur est survenue lors de la récupération des statistiques de l'emploi.",
                error: error.message,
            });
        }
    }
    async getUserStatistics({ params, auth, response }) {
        try {
            const user = auth.getUserOrFail();
            if (user.role !== UserRole.ADMIN && user.id !== params.userId) {
                return response.forbidden({
                    message: 'Vous ne pouvez voir que vos propres statistiques.',
                });
            }
            const statistics = await this.jobApplicationService.getUserStatistics(params.userId);
            return response.ok({ data: statistics });
        }
        catch (error) {
            return response.badRequest({
                message: "Une erreur est survenue lors de la récupération des statistiques de l'utilisateur.",
                error: error.message,
            });
        }
    }
    async getRecent({ request, bouncer, response }) {
        try {
            await bouncer.authorize(viewJobApplicationStatistics);
            const { limit = 10, companyId } = request.qs();
            const applications = await this.jobApplicationService.getRecentApplications({
                limit,
                companyId,
            });
            return response.ok({ data: applications });
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors de la récupération des candidatures récentes.',
                error: error.message,
            });
        }
    }
    async getCompanyApplications({ params, request, auth, response }) {
        try {
            const user = auth.getUserOrFail();
            const { page = 1, limit = 10, search, status } = request.qs();
            if (user.role !== UserRole.ADMIN && user.companyId !== params.companyId) {
                return response.forbidden({
                    message: 'Vous ne pouvez voir que les candidatures de votre entreprise.',
                });
            }
            const applications = await this.jobApplicationService.getCompanyJobApplications(params.companyId, {
                search,
                page,
                limit,
                status,
            });
            return response.ok(applications);
        }
        catch (error) {
            return response.badRequest({
                message: "Une erreur est survenue lors de la récupération des candidatures de l'entreprise.",
                error: error.message,
            });
        }
    }
};
JobApplicationsController = __decorate([
    inject(),
    __metadata("design:paramtypes", [JobApplicationService,
        JobService])
], JobApplicationsController);
export default JobApplicationsController;
//# sourceMappingURL=job_applications_controller.js.map