import { BaseSchema } from '@adonisjs/lucid/schema';
export default class extends BaseSchema {
    tableName = 'post_comment_responses';
    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'));
            table
                .uuid('post_comment_id')
                .references('id')
                .inTable('post_comments')
                .notNullable()
                .onDelete('CASCADE');
            table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
            table.text('comment').notNullable();
            table.timestamp('created_at');
            table.timestamp('updated_at');
            table.primary(['post_comment_id', 'user_id']);
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
//# sourceMappingURL=1759856868128_create_post_comment_responses_table.js.map