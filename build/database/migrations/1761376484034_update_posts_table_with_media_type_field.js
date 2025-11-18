import { BaseSchema } from '@adonisjs/lucid/schema';
export default class extends BaseSchema {
    tableName = 'posts';
    async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.enum('media_type', ['image', 'video']);
        });
    }
    async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('media_type');
        });
    }
}
//# sourceMappingURL=1761376484034_update_posts_table_with_media_type_field.js.map