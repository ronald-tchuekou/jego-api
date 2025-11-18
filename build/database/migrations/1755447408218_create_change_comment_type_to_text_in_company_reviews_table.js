import { BaseSchema } from '@adonisjs/lucid/schema';
export default class extends BaseSchema {
    tableName = 'company_reviews';
    async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.text('comment').alter();
        });
    }
    async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.string('comment').alter();
        });
    }
}
//# sourceMappingURL=1755447408218_create_change_comment_type_to_text_in_company_reviews_table.js.map