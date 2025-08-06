import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('first_name').notNullable()
      table.string('last_name').notNullable()
      table.string('phone').nullable()
      table.string('address').nullable()
      table.string('city').nullable()
      table.string('state').nullable()
      table.string('zip_code').nullable()
      table.string('country').nullable()
      table.string('email', 254).notNullable().unique()
      table.string('password').notNullable()
      table
        .enum('role', ['admin', 'user', 'company:admin', 'company:agent'])
        .notNullable()
        .defaultTo('user')

      table.uuid('company_id').references('id').inTable('companies').nullable().onDelete('CASCADE')

      table.timestamp('verified_at').nullable()
      table.timestamp('last_login_at').nullable()
      table.timestamp('blocked_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
