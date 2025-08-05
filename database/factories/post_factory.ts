import Post from '#models/post'
import factory from '@adonisjs/lucid/factories'

export const PostFactory = factory
  .define(Post, ({ faker }) => ({
    title: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
    status: faker.helpers.arrayElement(['active', 'inactive']),
    type: faker.helpers.arrayElement(['sale', 'rent']),
    category: faker.helpers.arrayElement(['house', 'apartment', 'land', 'commercial']),
  }))
  .build()
