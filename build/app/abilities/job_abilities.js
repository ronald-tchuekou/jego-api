import { UserRole } from '#models/user';
import { AuthorizationResponse, Bouncer } from '@adonisjs/bouncer';
export const createJob = Bouncer.ability((user) => {
    if (user.blockedAt) {
        return AuthorizationResponse.deny("Votre compte est bloqué, vous ne pouvez pas créer d'emploi.", 403).t('account_blocked');
    }
    if (user.role === UserRole.USER) {
        return AuthorizationResponse.deny("Vous n'avez pas les permissions pour créer un emploi.", 403).t('not_allowed');
    }
    return true;
});
export const editJob = Bouncer.ability((user, job) => {
    if (user.blockedAt) {
        return AuthorizationResponse.deny('Votre compte est bloqué, vous ne pouvez pas modifier cet emploi.', 403).t('account_blocked');
    }
    if (user.role === UserRole.ADMIN)
        return true;
    if (user.companyId === job.user.companyId)
        return true;
    return AuthorizationResponse.deny("Vous n'avez pas les permissions pour modifier cet emploi.", 403).t('not_allowed');
});
export const deleteJob = Bouncer.ability((user, job) => {
    if (user.blockedAt) {
        return AuthorizationResponse.deny('Votre compte est bloqué, vous ne pouvez pas supprimer cet emploi.', 403).t('account_blocked');
    }
    if (user.role === UserRole.ADMIN)
        return true;
    if (user.companyId === job.user.companyId)
        return true;
    return AuthorizationResponse.deny("Vous n'avez pas les permissions pour supprimer cet emploi.", 403).t('not_allowed');
});
export const manageJobStatus = Bouncer.ability((user, job) => {
    if (user.blockedAt) {
        return AuthorizationResponse.deny('Votre compte est bloqué, vous ne pouvez pas modifier le statut de cet emploi.', 403).t('account_blocked');
    }
    if (user.role === UserRole.ADMIN)
        return true;
    if (user.companyId === job.user.companyId)
        return true;
    return AuthorizationResponse.deny("Vous n'avez pas les permissions pour modifier le statut de cet emploi.", 403).t('not_allowed');
});
export const readJobStatistics = Bouncer.ability((user) => {
    if (user.role === UserRole.ADMIN)
        return true;
    return AuthorizationResponse.deny('Seuls les administrateurs peuvent accéder aux statistiques des emplois.', 403).t('admin_only');
});
//# sourceMappingURL=job_abilities.js.map