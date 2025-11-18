import { BaseSchema } from '@adonisjs/lucid/schema';
export default class extends BaseSchema {
    tableName = 'appointments';
    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'));
            table.uuid('company_id').references('id').inTable('companies').onDelete('CASCADE');
            table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
            table.timestamp('date').notNullable();
            table.string('time').notNullable();
            table.string('status').notNullable();
            table.string('subject').notNullable();
            table.string('content').notNullable();
            table.boolean('is_read').defaultTo(false);
            table.timestamp('created_at');
            table.timestamp('updated_at');
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
//# sourceMappingURL=1756851792723_create_appointments_table.js.map