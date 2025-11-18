import { BaseEvent } from '@adonisjs/core/events';
export default class UserUpdateEmailRequested extends BaseEvent {
    user;
    constructor(user) {
        super();
        this.user = user;
    }
}
//# sourceMappingURL=user_update_email_requested.js.map