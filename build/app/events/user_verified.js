import { BaseEvent } from '@adonisjs/core/events';
export default class UserVerified extends BaseEvent {
    user;
    constructor(user) {
        super();
        this.user = user;
    }
}
//# sourceMappingURL=user_verified.js.map