import { AuthorizationResponse, Bouncer } from '@adonisjs/bouncer';
export const readUsers = Bouncer.ability((user) => {
    const accentToken = user.currentAccessToken;
    if (accentToken?.allows('user:read'))
        return true;
    return AuthorizationResponse.deny("Vous n'avez pas les permissions pour lire les utilisateurs.", 403).t('not_allowed');
});
export const createUser = Bouncer.ability((user) => {
    const accentToken = user.currentAccessToken;
    if (accentToken?.allows('user:create'))
        return true;
    return AuthorizationResponse.deny("Vous n'avez pas les permissions pour créer un utilisateur.", 403).t('not_allowed');
});
export const updateUser = Bouncer.ability((user) => {
    const accentToken = user.currentAccessToken;
    if (accentToken?.allows('user:update'))
        return true;
    return AuthorizationResponse.deny("Vous n'avez pas les permissions pour modifier un utilisateur.", 403).t('not_allowed');
});
export const deleteUser = Bouncer.ability((user) => {
    const accentToken = user.currentAccessToken;
    if (accentToken?.allows('user:delete'))
        return true;
    return AuthorizationResponse.deny("Vous n'avez pas les permissions pour supprimer un utilisateur.", 403).t('not_allowed');
});
//# sourceMappingURL=user_abilities.js.map