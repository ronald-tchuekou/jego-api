import { BaseEvent } from '@adonisjs/core/events';
export default class UserPasswordChanged extends BaseEvent {
    user;
    constructor(user) {
        super();
        this.user = user;
    }
}
//# sourceMappingURL=user_password_changed.js.map