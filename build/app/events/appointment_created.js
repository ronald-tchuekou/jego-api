import { BaseEvent } from '@adonisjs/core/events';
export default class AppointmentCreated extends BaseEvent {
    appointment;
    constructor(appointment) {
        super();
        this.appointment = appointment;
    }
}
//# sourceMappingURL=appointment_created.js.map