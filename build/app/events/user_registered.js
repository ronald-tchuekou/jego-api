import { BaseEvent } from '@adonisjs/core/events';
export default class UserRegistered extends BaseEvent {
    user;
    constructor(user) {
        super();
        this.user = user;
    }
}
//# sourceMappingURL=user_registered.js.map