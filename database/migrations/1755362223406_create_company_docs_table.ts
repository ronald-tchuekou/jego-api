import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'company_docs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))

      table.uuid('company_id').references('id').inTable('companies').onDelete('CASCADE')

      table.string('name').notNullable()
      table.string('path').nullable()
      table.string('type').nullable()
      table.string('size').nullable()
      table.enum('status', ['waiting', 'approved', 'rejected']).notNullable().defaultTo('waiting')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
