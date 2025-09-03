import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'appointments'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('content').alter().notNullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('content').alter().notNullable()
    })
  }
}
