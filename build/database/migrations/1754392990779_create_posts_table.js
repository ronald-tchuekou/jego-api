import { BaseSchema } from '@adonisjs/lucid/schema';
export default class extends BaseSchema {
    tableName = 'posts';
    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'));
            table.uuid('user_id').references('id').inTable('users').notNullable().onDelete('CASCADE');
            table.string('title').notNullable();
            table.string('description').notNullable();
            table.string('status').notNullable();
            table.string('type').notNullable();
            table.string('category').notNullable();
            table.timestamp('created_at');
            table.timestamp('updated_at');
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
//# sourceMappingURL=1754392990779_create_posts_table.js.map