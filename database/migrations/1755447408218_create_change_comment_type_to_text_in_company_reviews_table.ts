import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'company_reviews'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('comment').alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('comment').alter()
    })
  }
}
