import { BaseEvent } from '@adonisjs/core/events';
export default class UserUpdated extends BaseEvent {
    user;
    constructor(user) {
        super();
        this.user = user;
    }
}
//# sourceMappingURL=user_updated.js.map