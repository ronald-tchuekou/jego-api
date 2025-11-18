import { BaseEvent } from '@adonisjs/core/events';
export default class UserPasswordReset extends BaseEvent {
    user;
    constructor(user) {
        super();
        this.user = user;
    }
}
//# sourceMappingURL=user_password_reset.js.map