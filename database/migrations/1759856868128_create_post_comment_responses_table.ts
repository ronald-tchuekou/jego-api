import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'post_comment_responses'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))

      table
        .uuid('post_comment_id')
        .references('id')
        .inTable('post_comments')
        .notNullable()
        .onDelete('CASCADE')
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE')

      table.text('comment').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Set the primary key
      table.primary(['post_comment_id', 'user_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
