import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'companies'

  private stringFields = [
    { field: 'name', nullable: false },
    { field: 'email', nullable: false },
    { field: 'phone', nullable: false },
    { field: 'website', nullable: true },
    { field: 'facebook', nullable: true },
    { field: 'instagram', nullable: true },
    { field: 'twitter', nullable: true },
    { field: 'linkedin', nullable: true },
    { field: 'youtube', nullable: true },
    { field: 'tiktok', nullable: true },
    { field: 'address', nullable: true },
    { field: 'city', nullable: true },
    { field: 'state', nullable: true },
    { field: 'zip_code', nullable: true },
    { field: 'country', nullable: true },
    { field: 'banner_image', nullable: true },
  ]

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      this.stringFields.forEach((field) => {
        const column = table.string(field.field)
        if (!field.nullable) {
          column.notNullable()
        } else {
          column.nullable()
        }
      })
      table.uuid('category_id').references('id').inTable('categories').onDelete('SET NULL')
      table.jsonb('location').nullable()
      table.jsonb('daily_program').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      this.stringFields.forEach((field) => {
        table.dropColumn(field.field)
      })
      table.dropColumn('category_id')
      table.dropColumn('location')
      table.dropColumn('daily_program')
    })
  }
}
