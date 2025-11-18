import { BaseSchema } from '@adonisjs/lucid/schema';
export default class extends BaseSchema {
    tableName = 'users';
    async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.string('update_email_request').nullable();
        });
    }
    async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('update_email_request');
        });
    }
}
//# sourceMappingURL=1754930797674_create_add_update_email_request_field_in_users_table.js.map