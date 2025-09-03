import Appointment from '#models/appointment'
import { BaseEvent } from '@adonisjs/core/events'

export default class AppointmentCreated extends BaseEvent {
  constructor(public appointment: Appointment) {
    super()
  }
}
