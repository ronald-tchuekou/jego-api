import { BaseEvent } from '@adonisjs/core/events';
export default class UserLoggedIn extends BaseEvent {
    user;
    constructor(user) {
        super();
        this.user = user;
    }
}
//# sourceMappingURL=user_logged_in.js.map