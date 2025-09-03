import Appointment from '#models/appointment'
import User, { UserRole } from '#models/user'
import { Bouncer } from '@adonisjs/bouncer'

export const createAppointment = Bouncer.ability((user: User) => {
  return user.role === UserRole.USER || user.role === UserRole.ADMIN
})

export const readAppointment = Bouncer.ability((user: User, appointment?: Appointment) => {
  // Admins can read any appointment
  if (user.role === UserRole.ADMIN) {
    return true
  }

  // If no specific appointment is provided, allow general read access for authenticated users
  if (!appointment) {
    return true
  }

  // Users can read their own appointments
  if (user.id === appointment.userId) {
    return true
  }

  // Company admins and agents can read appointments for their company
  if (
    (user.role === UserRole.COMPANY_ADMIN || user.role === UserRole.COMPANY_AGENT) &&
    user.companyId === appointment.companyId
  ) {
    return true
  }

  return false
})

export const editAppointment = Bouncer.ability((user: User, appointment: Appointment) => {
  // Admins can edit any appointment
  if (user.role === UserRole.ADMIN) {
    return true
  }

  // Users can edit their own appointments (only if not confirmed/completed)
  if (
    user.id === appointment.userId &&
    appointment.status !== 'confirmed' &&
    appointment.status !== 'completed'
  ) {
    return true
  }

  // Company admins can edit appointments for their company
  if (user.role === UserRole.COMPANY_ADMIN && user.companyId === appointment.companyId) {
    return true
  }

  return false
})

export const deleteAppointment = Bouncer.ability((user: User, appointment: Appointment) => {
  // Admins can delete any appointment
  if (user.role === UserRole.ADMIN) {
    return true
  }

  // Users can delete their own appointments (only if not confirmed/completed)
  if (
    user.id === appointment.userId &&
    appointment.status !== 'confirmed' &&
    appointment.status !== 'completed'
  ) {
    return true
  }

  // Company admins can delete appointments for their company
  if (user.role === UserRole.COMPANY_ADMIN && user.companyId === appointment.companyId) {
    return true
  }

  return false
})

export const manageAppointmentStatus = Bouncer.ability((user: User, appointment: Appointment) => {
  // Admins can manage any appointment status
  if (user.role === UserRole.ADMIN) {
    return true
  }

  // Company admins and agents can manage appointment status for their company
  if (
    (user.role === UserRole.COMPANY_ADMIN || user.role === UserRole.COMPANY_AGENT) &&
    user.companyId === appointment.companyId
  ) {
    return true
  }

  return false
})

export const readAppointmentStatistics = Bouncer.ability((user: User) => {
  return (
    user.role === UserRole.ADMIN ||
    user.role === UserRole.COMPANY_ADMIN ||
    user.role === UserRole.COMPANY_AGENT
  )
})
