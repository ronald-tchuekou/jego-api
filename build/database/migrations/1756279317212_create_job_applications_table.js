import { BaseSchema } from '@adonisjs/lucid/schema';
export default class extends BaseSchema {
    tableName = 'job_applications';
    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'));
            table.uuid('job_id').references('id').inTable('jobs').onDelete('CASCADE');
            table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
            table.enum('status', ['pending', 'accepted', 'rejected']).notNullable().defaultTo('pending');
            table.string('resume_path').notNullable();
            table.timestamp('created_at');
            table.timestamp('updated_at');
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
//# sourceMappingURL=1756279317212_create_job_applications_table.js.map