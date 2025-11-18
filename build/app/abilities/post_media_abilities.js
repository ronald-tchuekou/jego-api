import { UserRole } from '#models/user';
import { AuthorizationResponse, Bouncer } from '@adonisjs/bouncer';
export const createPostMedia = Bouncer.ability((user, post) => {
    const accessToken = user.currentAccessToken;
    if (accessToken?.allows('post:create')) {
        if (user.role === UserRole.ADMIN)
            return true;
        if ((user.role === UserRole.COMPANY_ADMIN || user.role === UserRole.COMPANY_AGENT) &&
            post.userId === user.id) {
            return true;
        }
        if (post.userId === user.id)
            return true;
    }
    return AuthorizationResponse.deny("Vous n'avez pas les permissions pour ajouter des médias à ce post.", 403).t('not_allowed');
});
export const updatePostMedia = Bouncer.ability((user) => {
    const accessToken = user.currentAccessToken;
    if (accessToken?.allows('post:update')) {
        if (user.role === UserRole.ADMIN)
            return true;
        return true;
    }
    return AuthorizationResponse.deny("Vous n'avez pas les permissions pour modifier ce média.", 403).t('not_allowed');
});
export const deletePostMedia = Bouncer.ability((user, post) => {
    const accessToken = user.currentAccessToken;
    if (accessToken?.allows('post:update')) {
        if (user.role === UserRole.ADMIN)
            return true;
        if ((user.role === UserRole.COMPANY_ADMIN || user.role === UserRole.COMPANY_AGENT) &&
            post.userId === user.id) {
            return true;
        }
        if (post.userId === user.id)
            return true;
    }
    return AuthorizationResponse.deny("Vous n'avez pas les permissions pour supprimer ce média.", 403).t('not_allowed');
});
//# sourceMappingURL=post_media_abilities.js.map