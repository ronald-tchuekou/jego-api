import { UserRole } from '#models/user';
import { AuthorizationResponse, Bouncer } from '@adonisjs/bouncer';
export const updateCompany = Bouncer.ability((user, company) => {
    if (user.role === UserRole.ADMIN)
        return true;
    if ((user.role === UserRole.COMPANY_ADMIN || user.role === UserRole.COMPANY_AGENT) &&
        user.companyId === company.id)
        return true;
    return AuthorizationResponse.deny("Vous n'avez pas les permissions pour modifier une entreprise.", 403).t('not_allowed');
});
export const deleteCompany = Bouncer.ability((user, company) => {
    const accessToken = user.currentAccessToken;
    if (accessToken?.allows('company:delete')) {
        if (user.role === UserRole.ADMIN)
            return true;
        if (user.role === UserRole.COMPANY_ADMIN && user.companyId === company.id)
            return true;
    }
    return AuthorizationResponse.deny("Vous n'avez pas les permissions pour supprimer une entreprise.", 403).t('not_allowed');
});
export const blockCompany = Bouncer.ability((user) => {
    const accessToken = user.currentAccessToken;
    if (accessToken?.allows('company:block'))
        return true;
    return AuthorizationResponse.deny("Vous n'avez pas les permissions pour bloquer/débloquer une entreprise.", 403).t('not_allowed');
});
//# sourceMappingURL=company_abilities.js.map