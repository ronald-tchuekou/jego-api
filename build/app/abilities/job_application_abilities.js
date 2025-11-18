import { UserRole } from '#models/user';
import { AuthorizationResponse, Bouncer } from '@adonisjs/bouncer';
export const applyForJob = Bouncer.ability((user) => {
    if (user.blockedAt) {
        return AuthorizationResponse.deny('Votre compte est bloqué, vous ne pouvez pas postuler pour un emploi.', 403).t('account_blocked');
    }
    if (user.role !== UserRole.USER) {
        return AuthorizationResponse.deny("Seuls les utilisateurs peuvent postuler pour des offres d'emploi.", 403).t('not_allowed');
    }
    return true;
});
export const editJobApplication = Bouncer.ability(async (user, application) => {
    if (user.blockedAt) {
        return AuthorizationResponse.deny('Votre compte est bloqué, vous ne pouvez pas modifier cette candidature.', 403).t('account_blocked');
    }
    if (user.role === UserRole.ADMIN)
        return true;
    if (user.role === UserRole.COMPANY_ADMIN || user.role === UserRole.COMPANY_AGENT) {
        if (user.companyId === application.job.user.companyId) {
            return true;
        }
    }
    return AuthorizationResponse.deny("Vous n'avez pas les permissions pour modifier cette candidature.", 403).t('not_allowed');
});
export const deleteJobApplication = Bouncer.ability(async (user, application) => {
    if (user.blockedAt) {
        return AuthorizationResponse.deny('Votre compte est bloqué, vous ne pouvez pas supprimer cette candidature.', 403).t('account_blocked');
    }
    if (user.role === UserRole.ADMIN)
        return true;
    if (user.role === UserRole.COMPANY_ADMIN) {
        if (user.companyId === application.job.user.companyId) {
            return true;
        }
    }
    if (user.id === application.userId) {
        return true;
    }
    return AuthorizationResponse.deny("Vous n'avez pas les permissions pour supprimer cette candidature.", 403).t('not_allowed');
});
export const viewJobApplicationStatistics = Bouncer.ability((user) => {
    if (user.role === UserRole.ADMIN ||
        user.role === UserRole.COMPANY_ADMIN ||
        user.role === UserRole.COMPANY_AGENT) {
        return true;
    }
    return AuthorizationResponse.deny('Seuls les administrateurs peuvent accéder aux statistiques des candidatures.', 403).t('admin_only');
});
export const viewJobApplication = Bouncer.ability(async (user, application) => {
    if (user.role === UserRole.ADMIN)
        return true;
    if (user.id === application.userId)
        return true;
    if (user.role === UserRole.COMPANY_ADMIN || user.role === UserRole.COMPANY_AGENT) {
        if (user.companyId === application.job.user.companyId) {
            return true;
        }
    }
    return AuthorizationResponse.deny("Vous n'avez pas les permissions pour voir cette candidature.", 403).t('not_allowed');
});
export const viewJobApplicationsForJob = Bouncer.ability(async (user, job) => {
    if (user.role === UserRole.ADMIN)
        return true;
    if (user.role === UserRole.COMPANY_ADMIN || user.role === UserRole.COMPANY_AGENT) {
        if (user.companyId === job.user.companyId) {
            return true;
        }
    }
    return AuthorizationResponse.deny("Vous n'avez pas les permissions pour voir les candidatures pour cet emploi.", 403).t('not_allowed');
});
//# sourceMappingURL=job_application_abilities.js.map