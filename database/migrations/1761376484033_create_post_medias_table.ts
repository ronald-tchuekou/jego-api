import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'post_medias'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))

      table.uuid('post_id').references('id').inTable('posts').notNullable().onDelete('CASCADE')
      table.string('name').notNullable()
      table.string('type').notNullable()
      table.string('url').notNullable()
      table.string('size').notNullable()
      table.string('thumbnail_url')
      table.string('alt')
      table.json('metadata')

      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Index
      table.index('post_id', 'post_media_post_id_index')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
