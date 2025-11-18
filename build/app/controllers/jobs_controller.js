var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { createJob, deleteJob, editJob, manageJobStatus, readJobStatistics, } from '#abilities/job_abilities';
import JobService from '#services/job_service';
import { setExpirationValidator, storeJobValidator, updateJobValidator } from '#validators/job';
import { inject } from '@adonisjs/core';
import { DateTime } from 'luxon';
let JobsController = class JobsController {
    jobService;
    constructor(jobService) {
        this.jobService = jobService;
    }
    async index({ request, response }) {
        try {
            const { page = 1, limit = 10, search = '', userId, status, companyName, expiredOnly = false, activeOnly = false, } = request.qs();
            const jobs = await this.jobService.getAll({
                page,
                limit,
                search,
                userId,
                status,
                companyName,
                expiredOnly: expiredOnly === 'true',
                activeOnly: activeOnly === 'true',
            });
            return response.ok(jobs);
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors de la récupération des emplois.',
                error: error.message,
            });
        }
    }
    async store({ request, auth, bouncer, response }) {
        try {
            const user = auth.getUserOrFail();
            await bouncer.authorize(createJob);
            const jobData = await request.validateUsing(storeJobValidator);
            const savedJob = await this.jobService.create({
                ...jobData,
                expiresAt: jobData.expiresAt ? DateTime.fromJSDate(jobData.expiresAt) : null,
            }, user);
            return response.created({ data: savedJob });
        }
        catch (error) {
            console.log(error);
            return response.badRequest({
                message: "Une erreur est survenue lors de la création de l'emploi.",
                error: error.message,
            });
        }
    }
    async show({ params, response }) {
        try {
            const job = await this.jobService.findById(params.id);
            if (!job) {
                return response.notFound({
                    message: 'Aucun emploi trouvé.',
                });
            }
            return response.ok({ data: job });
        }
        catch (error) {
            return response.badRequest({
                message: "Une erreur est survenue lors de la récupération de l'emploi.",
                error: error.message,
            });
        }
    }
    async update({ params, request, auth, bouncer, response }) {
        try {
            auth.getUserOrFail();
            const job = await this.jobService.findById(params.id);
            if (!job) {
                return response.notFound({
                    message: 'Aucun emploi trouvé.',
                });
            }
            await job.load('user');
            await bouncer.authorize(editJob, job);
            const jobData = await request.validateUsing(updateJobValidator);
            const updatedJob = await this.jobService.update(params.id, {
                ...jobData,
                expiresAt: jobData.expiresAt ? DateTime.fromJSDate(jobData.expiresAt) : undefined,
            });
            return response.ok({ data: updatedJob });
        }
        catch (error) {
            console.log(error);
            return response.badRequest({
                message: "Une erreur est survenue lors de la mise à jour de l'emploi.",
                error: error.message,
            });
        }
    }
    async destroy({ params, bouncer, response }) {
        try {
            const job = await this.jobService.findById(params.id);
            if (!job) {
                return response.notFound({
                    message: 'Aucun emploi trouvé.',
                });
            }
            await job.load('user');
            await bouncer.authorize(deleteJob, job);
            await this.jobService.delete(params.id);
            return response.ok({ message: 'Emploi supprimé avec succès' });
        }
        catch (error) {
            return response.badRequest({
                message: "Une erreur est survenue lors de la suppression de l'emploi.",
                error: error.message,
            });
        }
    }
    async getByUser({ params, request, response }) {
        try {
            const { page = 1, limit = 10, status, expiredOnly = false, activeOnly = false } = request.qs();
            const jobs = await this.jobService.findByUserId(params.userId, {
                page,
                limit,
                status,
                expiredOnly: expiredOnly === 'true',
                activeOnly: activeOnly === 'true',
            });
            return response.ok(jobs);
        }
        catch (error) {
            return response.badRequest({
                message: "Une erreur est survenue lors de la récupération des emplois de l'utilisateur.",
                error: error.message,
            });
        }
    }
    async getExpired({ request, response }) {
        try {
            const { page = 1, limit = 10, userId } = request.qs();
            const jobs = await this.jobService.getExpiredJobs({
                page,
                limit,
                userId,
            });
            return response.ok(jobs);
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors de la récupération des emplois expirés.',
                error: error.message,
            });
        }
    }
    async getActive({ request, response }) {
        try {
            const { page = 1, limit = 10, userId, status, search } = request.qs();
            const jobs = await this.jobService.getActiveJobs({
                page,
                limit,
                userId,
                status,
                search,
            });
            return response.ok(jobs);
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors de la récupération des emplois actifs.',
                error: error.message,
            });
        }
    }
    async toggleStatus({ params, bouncer, response }) {
        try {
            const job = await this.jobService.findById(params.id);
            if (!job) {
                return response.notFound({
                    message: 'Aucun emploi trouvé.',
                });
            }
            await job.load('user');
            await bouncer.authorize(manageJobStatus, job);
            const updatedJob = await this.jobService.toggleStatus(params.id);
            const action = updatedJob.status === 'open' ? 'ouvert' : 'fermé';
            return response.ok({
                data: updatedJob,
                message: `Emploi ${action} avec succès`,
            });
        }
        catch (error) {
            return response.badRequest({
                message: "Une erreur est survenue lors du changement de statut de l'emploi.",
                error: error.message,
            });
        }
    }
    async close({ params, bouncer, response }) {
        try {
            const job = await this.jobService.findById(params.id);
            if (!job) {
                return response.notFound({
                    message: 'Aucun emploi trouvé.',
                });
            }
            await job.load('user');
            await bouncer.authorize(manageJobStatus, job);
            const updatedJob = await this.jobService.closeJob(params.id);
            return response.ok({
                data: updatedJob,
                message: 'Emploi fermé avec succès',
            });
        }
        catch (error) {
            return response.badRequest({
                message: "Une erreur est survenue lors de la fermeture de l'emploi.",
                error: error.message,
            });
        }
    }
    async reopen({ params, bouncer, response }) {
        try {
            const job = await this.jobService.findById(params.id);
            if (!job) {
                return response.notFound({
                    message: 'Aucun emploi trouvé.',
                });
            }
            await job.load('user');
            await bouncer.authorize(manageJobStatus, job);
            const updatedJob = await this.jobService.reopenJob(params.id);
            return response.ok({
                data: updatedJob,
                message: 'Emploi rouvert avec succès',
            });
        }
        catch (error) {
            return response.badRequest({
                message: "Une erreur est survenue lors de la réouverture de l'emploi.",
                error: error.message,
            });
        }
    }
    async setExpiration({ params, request, bouncer, response }) {
        try {
            const job = await this.jobService.findById(params.id);
            if (!job) {
                return response.notFound({
                    message: 'Aucun emploi trouvé.',
                });
            }
            await job.load('user');
            await bouncer.authorize(editJob, job);
            const { expiresAt } = await request.validateUsing(setExpirationValidator);
            const updatedJob = await this.jobService.setExpiration(params.id, expiresAt);
            const message = expiresAt
                ? `Date d'expiration définie avec succès`
                : `Date d'expiration supprimée avec succès`;
            return response.ok({
                data: updatedJob,
                message,
            });
        }
        catch (error) {
            return response.badRequest({
                message: "Une erreur est survenue lors de la définition de la date d'expiration.",
                error: error.message,
            });
        }
    }
    async getJobsByCompanyId({ request, response, params }) {
        try {
            const companyId = params.companyId;
            const { search, page = 1, limit = 10, status } = request.qs();
            if (!companyId) {
                return response.badRequest({
                    message: 'Le paramètre company est requis pour la recherche.',
                });
            }
            const jobs = await this.jobService.searchByCompany(companyId, {
                page,
                limit,
                status,
                search,
            });
            return response.ok(jobs);
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors de la recherche par entreprise.',
                error: error.message,
            });
        }
    }
    async getTotal({ request, response }) {
        try {
            const { companyId } = request.qs();
            const total = await this.jobService.getTotal(companyId);
            return response.ok({ count: total });
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors du comptage des emplois.',
                error: error.message,
            });
        }
    }
    async getJobsCountPerDay({ request, response }) {
        try {
            const { startDate, endDate } = request.qs();
            let sDate = startDate;
            let eDate = endDate;
            if (!startDate || !endDate) {
                sDate = DateTime.now().startOf('month').toFormat('yyyy-MM-dd');
                eDate = DateTime.now().endOf('month').toFormat('yyyy-MM-dd');
            }
            const jobsCountPerDay = await this.jobService.getJobCountPerDay(sDate, eDate);
            return response.ok({ data: jobsCountPerDay, startDate: sDate, endDate: eDate });
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors de la récupération des statistiques.',
                error: error.message,
            });
        }
    }
    async getStatistics({ response, bouncer }) {
        try {
            await bouncer.authorize(readJobStatistics);
            const statistics = await this.jobService.getStatistics();
            return response.ok({ data: statistics });
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors de la récupération des statistiques.',
                error: error.message,
            });
        }
    }
};
JobsController = __decorate([
    inject(),
    __metadata("design:paramtypes", [JobService])
], JobsController);
export default JobsController;
//# sourceMappingURL=jobs_controller.js.map