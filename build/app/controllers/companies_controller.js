var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { blockCompany, deleteCompany, updateCompany } from '#abilities/company_abilities';
import CompanyService from '#services/company_service';
import { storeCompanyValidator, updateCompanyValidator } from '#validators/company';
import { inject } from '@adonisjs/core';
import { DateTime } from 'luxon';
let CompaniesController = class CompaniesController {
    companyService;
    constructor(companyService) {
        this.companyService = companyService;
    }
    async getTotal({ request, response }) {
        const { search = '' } = request.qs();
        const total = await this.companyService.getTotal(search);
        return response.ok({ count: total });
    }
    async index({ request, response }) {
        try {
            const { page = 1, limit = 10, search = '', categoryId, status } = request.qs();
            const companies = await this.companyService.getAll({
                page,
                limit,
                search,
                categoryId,
                status,
            });
            return response.ok(companies);
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors de la récupération des entreprises.',
                error: error.message,
            });
        }
    }
    async store({ request, response }) {
        try {
            const companyData = await request.validateUsing(storeCompanyValidator);
            const savedCompany = await this.companyService.create(companyData);
            return response.created({ data: savedCompany });
        }
        catch (error) {
            return response.badRequest({
                message: "Une erreur est survenue lors de la création de l'entreprise.",
                error: error.message,
            });
        }
    }
    async show({ params, response }) {
        try {
            const company = await this.companyService.findById(params.id);
            return response.ok({ data: company });
        }
        catch (error) {
            return response.badRequest({
                message: "Une erreur est survenue lors de la récupération de l'entreprise.",
                error: error.message,
            });
        }
    }
    async update({ params, request, bouncer, response }) {
        try {
            const company = await this.companyService.findById(params.id);
            if (!company) {
                return response.notFound({
                    message: 'Aucune entreprise trouvée.',
                });
            }
            await bouncer.authorize(updateCompany, company);
            const companyData = await request.validateUsing(updateCompanyValidator);
            const updatedCompany = await this.companyService.update(params.id, companyData);
            return response.ok({ data: updatedCompany });
        }
        catch (error) {
            return response.badRequest({
                message: "Une erreur est survenue lors de la mise à jour de l'entreprise.",
                error: error.message,
            });
        }
    }
    async destroy({ params, bouncer, response }) {
        try {
            const company = await this.companyService.findById(params.id);
            if (!company) {
                return response.notFound({
                    message: 'Aucune entreprise trouvée.',
                });
            }
            await bouncer.authorize(deleteCompany, company);
            await this.companyService.delete(params.id);
            return response.ok({ message: 'Entreprise supprimée avec succès' });
        }
        catch (error) {
            return response.badRequest({
                message: "Une erreur est survenue lors de la suppression de l'entreprise.",
                error: error.message,
            });
        }
    }
    async findByEmail({ request, response }) {
        try {
            const { email } = request.qs();
            if (!email) {
                return response.badRequest({
                    message: "L'email est requis.",
                });
            }
            const company = await this.companyService.findByEmail(email);
            if (!company) {
                return response.notFound({
                    message: 'Aucune entreprise trouvée avec cet email.',
                });
            }
            return response.ok({ data: company });
        }
        catch (error) {
            return response.badRequest({
                message: "Une erreur est survenue lors de la recherche de l'entreprise.",
                error: error.message,
            });
        }
    }
    async count({ request, response }) {
        try {
            const { search = '' } = request.qs();
            const total = await this.companyService.getTotal(search);
            return response.ok({ total });
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors du comptage des entreprises.',
                error: error.message,
            });
        }
    }
    async toggleBlockedStatus({ params, bouncer, response }) {
        try {
            await bouncer.authorize(blockCompany);
            const updatedCompany = await this.companyService.toggleBlockedStatus(params.id);
            const action = updatedCompany.blockedAt ? 'bloquée' : 'débloquée';
            return response.ok({
                data: updatedCompany,
                message: `Entreprise ${action} avec succès`,
            });
        }
        catch (error) {
            return response.badRequest({
                message: "Une erreur est survenue lors du changement de statut de l'entreprise.",
                error: error.message,
            });
        }
    }
    async toggleApproveStatus({ params, response }) {
        try {
            const company = await this.companyService.findById(params.id);
            if (!company) {
                return response.notFound({
                    message: 'Aucune entreprise trouvée.',
                });
            }
            const updatedCompany = await this.companyService.toggleApproveStatus(params.id);
            const action = updatedCompany.verifiedAt ? 'approuvée' : 'désapprouvée';
            return response.ok({
                data: updatedCompany,
                message: `Entreprise ${action} avec succès`,
            });
        }
        catch (error) {
            return response.badRequest({
                message: "Une erreur est survenue lors du changement de statut de l'entreprise.",
                error: error.message,
            });
        }
    }
    async getCompaniesCountPerDay({ request, response }) {
        const { startDate, endDate } = request.qs();
        let sDate = startDate;
        let eDate = endDate;
        if (!startDate || !endDate) {
            sDate = DateTime.now().startOf('month').toFormat('yyyy-MM-dd');
            eDate = DateTime.now().endOf('month').toFormat('yyyy-MM-dd');
        }
        const companiesCountPerDay = await this.companyService.getCompanyCountPerDay(sDate, eDate);
        return response.ok({ data: companiesCountPerDay, startDate: sDate, endDate: eDate });
    }
};
CompaniesController = __decorate([
    inject(),
    __metadata("design:paramtypes", [CompanyService])
], CompaniesController);
export default CompaniesController;
//# sourceMappingURL=companies_controller.js.map