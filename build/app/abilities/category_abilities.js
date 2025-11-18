import { AuthorizationResponse, Bouncer } from '@adonisjs/bouncer';
export const createCategory = Bouncer.ability((user) => {
    const accentToken = user.currentAccessToken;
    if (accentToken?.allows('category:create'))
        return true;
    return AuthorizationResponse.deny("Vous n'avez pas les permissions pour créer une catégorie.", 403).t('not_allowed');
});
export const updateCategory = Bouncer.ability((user) => {
    const accentToken = user.currentAccessToken;
    if (accentToken?.allows('category:update'))
        return true;
    return AuthorizationResponse.deny("Vous n'avez pas les permissions pour modifier une catégorie.", 403).t('not_allowed');
});
export const deleteCategory = Bouncer.ability((user) => {
    const accentToken = user.currentAccessToken;
    if (accentToken?.allows('category:delete'))
        return true;
    return AuthorizationResponse.deny("Vous n'avez pas les permissions pour supprimer une catégorie.", 403).t('not_allowed');
});
//# sourceMappingURL=category_abilities.js.map