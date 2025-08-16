import User, { UserRole } from '#models/user'

export class TokenUtil {
  static numeric(length: number = 6): string {
    let result = ''
    for (let i = 0; i < length; i++) {
      result += Math.floor(Math.random() * 10).toString()
    }
    return result
  }

  static alphanumeric(length: number = 6): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
  }

  static getUserAbilities(user: User) {
    if (user.role === UserRole.ADMIN) {
      return ['*']
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
      ]
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
      ]
    }

    return ['company:read', 'post:read']
  }
}
