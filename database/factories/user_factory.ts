import User, { UserRole } from '#models/user'
import factory from '@adonisjs/lucid/factories'
import { DateTime } from 'luxon'

export const UserFactory = factory
  .define(User, async ({ faker }) => ({
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    zipCode: faker.location.zipCode(),
    country: faker.location.country(),
    password: faker.internet.password(),
    role: faker.helpers.arrayElement(Object.values(UserRole)),
    verifiedAt: null,
    lastLoginAt: null,
    blockedAt: null,
  }))
  .state('admin', (user) => {
    user.role = UserRole.ADMIN
  })
  .state('company:admin', (user) => {
    user.role = UserRole.COMPANY_ADMIN
  })
  .state('company:agent', (user) => {
    user.role = UserRole.COMPANY_AGENT
  })
  .state('user', (user) => {
    user.role = UserRole.USER
  })
  .state('verified', (user) => {
    user.verifiedAt = DateTime.now()
  })
  .state('blocked', (user) => {
    user.blockedAt = DateTime.now()
  })
  .state('last_login', (user) => {
    user.lastLoginAt = DateTime.now()
  })
  .build()
