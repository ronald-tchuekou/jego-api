import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Drop existing foreign key constraint
      table.dropForeign(['company_id'])
    })

    this.schema.alterTable(this.tableName, (table) => {
      // Alter column with default value
      table.uuid('company_id').nullable().defaultTo(null).alter()
    })

    this.schema.alterTable(this.tableName, (table) => {
      // Re-add foreign key constraint
      table.foreign('company_id').references('id').inTable('companies').onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      // Drop the foreign key constraint
      table.dropForeign(['company_id'])
    })

    this.schema.alterTable(this.tableName, (table) => {
      // Alter column to remove default value
      table.uuid('company_id').nullable().alter()
    })

    this.schema.alterTable(this.tableName, (table) => {
      // Re-add foreign key constraint
      table.foreign('company_id').references('id').inTable('companies').onDelete('CASCADE')
    })
  }
}
