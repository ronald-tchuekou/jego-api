import { BaseSchema } from '@adonisjs/lucid/schema';
export default class extends BaseSchema {
    tableName = 'posts';
    async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.string('image').nullable();
        });
    }
    async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('image');
        });
    }
}
//# sourceMappingURL=1755446065214_create_add_image_field_in_posts_table.js.map