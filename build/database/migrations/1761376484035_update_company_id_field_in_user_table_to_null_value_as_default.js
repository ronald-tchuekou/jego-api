import { BaseSchema } from '@adonisjs/lucid/schema';
export default class extends BaseSchema {
    tableName = 'users';
    async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropForeign(['company_id']);
        });
        this.schema.alterTable(this.tableName, (table) => {
            table.uuid('company_id').nullable().defaultTo(null).alter();
        });
        this.schema.alterTable(this.tableName, (table) => {
            table.foreign('company_id').references('id').inTable('companies').onDelete('CASCADE');
        });
    }
    async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropForeign(['company_id']);
        });
        this.schema.alterTable(this.tableName, (table) => {
            table.uuid('company_id').nullable().alter();
        });
        this.schema.alterTable(this.tableName, (table) => {
            table.foreign('company_id').references('id').inTable('companies').onDelete('CASCADE');
        });
    }
}
//# sourceMappingURL=1761376484035_update_company_id_field_in_user_table_to_null_value_as_default.js.map