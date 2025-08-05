import Company from '#models/company'
import factory from '@adonisjs/lucid/factories'

export const CompanyFactory = factory
  .define(Company, async ({ faker }) => ({
    name: faker.company.name(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    zip_code: faker.location.zipCode(),
    country: faker.location.country(),
    website: faker.internet.url(),
    logo: faker.image.url(),
    description: faker.lorem.paragraph(),
  }))
  .build()
