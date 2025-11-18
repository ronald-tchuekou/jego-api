import { BaseSchema } from '@adonisjs/lucid/schema';
export default class extends BaseSchema {
    tableName = 'company_followings';
    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('user_id').references('id').inTable('users').notNullable().onDelete('CASCADE');
            table.uuid('company_id').references('id').inTable('companies').onDelete('CASCADE');
            table.timestamp('created_at');
            table.timestamp('updated_at');
            table.primary(['user_id', 'company_id']);
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
//# sourceMappingURL=1759831896003_create_company_followings_table.js.map