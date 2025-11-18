import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'posts'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('like_count').defaultTo(0).comment('Number of likes')
      table.integer('comment_count').defaultTo(0).comment('Number of comments')
      table.integer('share_count').defaultTo(0).comment('Number of shares')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('like_count')
      table.dropColumn('comment_count')
      table.dropColumn('share_count')
    })
  }
}
