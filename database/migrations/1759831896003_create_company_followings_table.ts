import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'company_followings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('user_id').references('id').inTable('users').notNullable().onDelete('CASCADE')
      table.uuid('company_id').references('id').inTable('companies').onDelete('CASCADE')

      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Set the primary key
      table.primary(['user_id', 'company_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
