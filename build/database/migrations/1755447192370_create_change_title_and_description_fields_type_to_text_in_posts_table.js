import { BaseSchema } from '@adonisjs/lucid/schema';
export default class extends BaseSchema {
    tableName = 'posts';
    async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.text('title').alter();
            table.text('description').alter();
        });
    }
    async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.string('title').alter();
            table.string('description').alter();
        });
    }
}
//# sourceMappingURL=1755447192370_create_change_title_and_description_fields_type_to_text_in_posts_table.js.map