import { BaseEvent } from '@adonisjs/core/events';
export default class UserPasswordResetRequested extends BaseEvent {
    user;
    resetToken;
    constructor(user, resetToken) {
        super();
        this.user = user;
        this.resetToken = resetToken;
    }
}
//# sourceMappingURL=user_password_reset_requested.js.map