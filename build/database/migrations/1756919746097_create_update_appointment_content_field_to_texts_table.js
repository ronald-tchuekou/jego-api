import { BaseSchema } from '@adonisjs/lucid/schema';
export default class extends BaseSchema {
    tableName = 'appointments';
    async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.text('content').alter().notNullable();
        });
    }
    async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.string('content').alter().notNullable();
        });
    }
}
//# sourceMappingURL=1756919746097_create_update_appointment_content_field_to_texts_table.js.map