import { BaseSchema } from '@adonisjs/lucid/schema';
export default class extends BaseSchema {
    tableName = 'post_shares';
    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('user_id').references('id').inTable('users').notNullable().onDelete('CASCADE');
            table.uuid('post_id').references('id').inTable('posts').onDelete('CASCADE');
            table.timestamp('created_at');
            table.timestamp('updated_at');
            table.primary(['user_id', 'post_id']);
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
//# sourceMappingURL=1759856300274_create_post_shares_table.js.map