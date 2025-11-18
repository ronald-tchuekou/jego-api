import { UserRole } from '#models/user';
import { AuthorizationResponse, Bouncer } from '@adonisjs/bouncer';
export const createUserCV = Bouncer.ability((user) => {
    if (user.role === UserRole.USER)
        return true;
    return AuthorizationResponse.deny("Vous n'avez pas les permissions pour créer ce CV.", 403).t('not_allowed');
});
export const readUserCV = Bouncer.ability((user, userCV) => {
    if (user.id === userCV.userId)
        return true;
    if (user.role === UserRole.ADMIN)
        return true;
    return AuthorizationResponse.deny("Vous n'avez pas les permissions pour lire ce CV.", 403).t('not_allowed');
});
export const updateUserCV = Bouncer.ability((user, userCV) => {
    if (user.id === userCV.userId)
        return true;
    if (user.role === UserRole.ADMIN)
        return true;
    return AuthorizationResponse.deny("Vous n'avez pas les permissions pour modifier ce CV.", 403).t('not_allowed');
});
export const deleteUserCV = Bouncer.ability((user, userCV) => {
    if (user.id === userCV.userId)
        return true;
    if (user.role === UserRole.ADMIN)
        return true;
    return AuthorizationResponse.deny("Vous n'avez pas les permissions pour supprimer ce CV.", 403).t('not_allowed');
});
//# sourceMappingURL=user_cv_abilities.js.map