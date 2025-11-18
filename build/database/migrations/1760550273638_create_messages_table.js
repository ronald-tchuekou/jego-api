import { BaseSchema } from '@adonisjs/lucid/schema';
export default class extends BaseSchema {
    tableName = 'messages';
    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'));
            table
                .uuid('conversation_id')
                .references('id')
                .inTable('conversations')
                .notNullable()
                .onDelete('CASCADE');
            table.uuid('sender_id').references('id').inTable('users').notNullable().onDelete('CASCADE');
            table.text('content');
            table.boolean('is_read').defaultTo(false);
            table.enum('type', ['text', 'attachment', 'text_attachment']).notNullable();
            table.timestamp('created_at');
            table.timestamp('updated_at');
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
//# sourceMappingURL=1760550273638_create_messages_table.js.map