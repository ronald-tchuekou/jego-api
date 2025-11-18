import { UserRole } from '#models/user';
import { AuthorizationResponse, Bouncer } from '@adonisjs/bouncer';
export const createCompanyReview = Bouncer.ability((user) => {
    const accessToken = user.currentAccessToken;
    if (accessToken?.allows('company_review:create')) {
        if (user.role === UserRole.USER || user.role === UserRole.ADMIN)
            return true;
    }
    return AuthorizationResponse.deny("Vous n'avez pas les permissions pour créer un avis.", 403).t('not_allowed');
});
export const updateCompanyReview = Bouncer.ability((user, review) => {
    const accessToken = user.currentAccessToken;
    if (accessToken?.allows('company_review:update')) {
        if (user.role === UserRole.ADMIN)
            return true;
        if (user.role === UserRole.USER && user.id === review.userId)
            return true;
    }
    return AuthorizationResponse.deny("Vous n'avez pas les permissions pour modifier cet avis.", 403).t('not_allowed');
});
export const deleteCompanyReview = Bouncer.ability((user, review) => {
    const accessToken = user.currentAccessToken;
    if (accessToken?.allows('company_review:delete')) {
        if (user.role === UserRole.ADMIN)
            return true;
        if (user.role === UserRole.USER && user.id === review.userId)
            return true;
    }
    return AuthorizationResponse.deny("Vous n'avez pas les permissions pour supprimer cet avis.", 403).t('not_allowed');
});
//# sourceMappingURL=company_review_abilities.js.map