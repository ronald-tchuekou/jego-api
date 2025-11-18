import { BaseSchema } from '@adonisjs/lucid/schema';
export default class extends BaseSchema {
    tableName = 'post_comments';
    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'));
            table.uuid('user_id').references('id').inTable('users').notNullable().onDelete('CASCADE');
            table.uuid('post_id').references('id').inTable('posts').onDelete('CASCADE');
            table.text('comment').notNullable();
            table.integer('like_count').defaultTo(0).comment('Number of likes');
            table.timestamp('created_at');
            table.timestamp('updated_at');
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
//# sourceMappingURL=1759856504593_create_post_comments_table.js.map