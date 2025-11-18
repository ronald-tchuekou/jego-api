import { UserRole } from '#models/user';
export class TokenUtil {
    static numeric(length = 6) {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += Math.floor(Math.random() * 10).toString();
        }
        return result;
    }
    static alphanumeric(length = 6) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }
    static getUserAbilities(user) {
        if (user.role === UserRole.ADMIN) {
            return ['*'];
        }
        if (user.role === UserRole.COMPANY_ADMIN) {
            return [
                'company:read',
                'company:create',
                'company:update',
                'company:delete',
                'company-image:update',
                'company-image:delete',
                'post:read',
                'post:edit',
                'post:create',
                'post:delete',
            ];
        }
        if (user.role === UserRole.COMPANY_AGENT) {
            return [
                'company:read',
                'company:update',
                'company-image:update',
                'company-image:delete',
                'post:read',
                'post:edit',
                'post:create',
                'post:delete',
            ];
        }
        return ['company:read', 'post:read'];
    }
}
//# sourceMappingURL=token_util.js.map