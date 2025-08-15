import { UserRole } from '#models/user'
import vine from '@vinejs/vine'

export const storeUserValidator = vine.compile(
  vine.object({
    firstName: vine.string().trim().minLength(1),
    lastName: vine.string().trim().minLength(1),
    email: vine.string().email(),
    password: vine.string().minLength(8),
    phone: vine.string().optional(),
    address: vine.string().optional(),
    city: vine.string().optional(),
    state: vine.string().optional(),
    zipCode: vine.string().optional(),
    country: vine.string().optional(),
    companyId: vine.string().uuid().optional(),
    role: vine.enum(Object.values(UserRole)).optional(),
    profileImage: vine.string().optional(),
  })
)

export const updateUserValidator = vine.compile(
  vine.object({
    firstName: vine.string().trim().minLength(1).optional(),
    lastName: vine.string().trim().minLength(1).optional(),
    password: vine.string().minLength(8).optional(),
    phone: vine.string().optional(),
    address: vine.string().optional(),
    city: vine.string().optional(),
    state: vine.string().optional(),
    zipCode: vine.string().optional(),
    country: vine.string().optional(),
    companyId: vine.string().uuid().optional(),
    role: vine.enum(Object.values(UserRole)).optional(),
    profileImage: vine.string().optional(),
  })
)
