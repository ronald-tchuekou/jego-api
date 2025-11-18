import { BaseSchema } from '@adonisjs/lucid/schema';
export default class extends BaseSchema {
    tableName = 'companies';
    async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.integer('following_count').defaultTo(0).after('description');
        });
    }
    async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('following_count');
        });
    }
}
//# sourceMappingURL=1759831896004_update_company_table_with_following_count_field.js.map