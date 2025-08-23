import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'jobs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))

      table.uuid('user_id').references('id').inTable('users').notNullable().onDelete('CASCADE')

      table.string('title').notNullable()
      table.text('description').notNullable()
      table.string('company_name')
      table.string('company_logo')
      table.string('company_website')
      table.string('company_email')
      table.string('company_phone')
      table.string('company_address')
      table.string('company_city')
      table.string('company_state')
      table.string('company_zip')
      table.string('company_country')
      table.timestamp('expires_at')
      table.enum('status', ['open', 'closed']).notNullable().defaultTo('open')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
