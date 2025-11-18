import { BaseSchema } from '@adonisjs/lucid/schema';
export default class extends BaseSchema {
    async up() {
        this.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    }
    async down() {
        this.raw('DROP EXTENSION IF EXISTS "uuid-ossp"');
    }
}
//# sourceMappingURL=1754341984972_create_setup_extensions_table.js.map