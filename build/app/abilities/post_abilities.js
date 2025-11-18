import { UserRole } from '#models/user';
import { AuthorizationResponse, Bouncer } from '@adonisjs/bouncer';
export const createPost = Bouncer.ability((user) => {
    if (user.role !== UserRole.USER)
        return true;
    return AuthorizationResponse.deny("Seuls les administrateurs et les utilisateurs d'entreprise peuvent créer des posts.", 403).t('not_allowed');
});
export const editPost = Bouncer.ability((user, post) => {
    if (user.role === UserRole.ADMIN)
        return true;
    if (user.id === post.userId)
        return true;
    if ((user.role === UserRole.COMPANY_ADMIN || user.role === UserRole.COMPANY_AGENT) &&
        user.companyId === post.user.companyId)
        return true;
    return AuthorizationResponse.deny("Vous n'avez pas les permissions pour modifier ce post.", 403).t('not_allowed');
});
export const deletePost = Bouncer.ability((user) => {
    if (user.role === UserRole.ADMIN ||
        user.role === UserRole.COMPANY_ADMIN ||
        user.role === UserRole.COMPANY_AGENT) {
        return true;
    }
    return AuthorizationResponse.deny("Seuls les administrateurs et les utilisateurs d'entreprise peuvent supprimer des posts.", 403).t('not_allowed');
});
//# sourceMappingURL=post_abilities.js.map