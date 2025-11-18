import { BaseSchema } from '@adonisjs/lucid/schema';
export default class extends BaseSchema {
    tableName = 'participants';
    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'));
            table
                .uuid('conversation_id')
                .references('id')
                .inTable('conversations')
                .notNullable()
                .onDelete('CASCADE');
            table.uuid('user_id').references('id').inTable('users').notNullable().onDelete('CASCADE');
            table.timestamp('created_at');
            table.timestamp('updated_at');
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
//# sourceMappingURL=1760550253979_create_participants_table.js.map