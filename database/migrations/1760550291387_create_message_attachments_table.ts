import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'message_attachments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))

      table
        .uuid('message_id')
        .references('id')
        .inTable('messages')
        .notNullable()
        .onDelete('CASCADE')
      table.string('name').notNullable()
      table.string('url').notNullable()
      table.string('type').notNullable()
      table.string('size').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
