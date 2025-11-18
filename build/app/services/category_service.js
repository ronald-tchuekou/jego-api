import Category from '#models/category';
export default class CategoryService {
    fields = ['name', 'description', 'slug'];
    async create(data) {
        const category = new Category();
        const requiredFields = ['name', 'slug'];
        requiredFields.forEach((field) => {
            if (!data[field]) {
                throw new Error(`${field} is required to create a user`);
            }
        });
        this.fields.forEach((field) => {
            if (data[field]) {
                category[field] = data[field];
            }
        });
        const existingCategory = await Category.query().where('name', category.name).first();
        if (existingCategory) {
            throw new Error('Cette catégorie existe déjà.');
        }
        const savedCategory = await category.save();
        return savedCategory;
    }
    async update(categoryId, data) {
        const category = await Category.findOrFail(categoryId);
        this.fields.forEach((field) => {
            if (data[field]) {
                category[field] = data[field];
            }
        });
        const savedCategory = await category.save();
        return savedCategory;
    }
    async getAll(filters) {
        const { search = '', page = 1, limit = 10 } = filters;
        let queryBuilder = Category.query().where((query) => {
            query.whereILike('name', `%${search}%`);
            query.orWhereILike('description', `%${search}%`);
            query.orWhereILike('slug', `%${search}%`);
        });
        const categories = await queryBuilder
            .orderBy('name', 'asc')
            .orderBy('slug', 'asc')
            .paginate(page, limit);
        return categories;
    }
    async getTotal(search = '') {
        let queryBuilder = Category.query();
        if (search) {
            queryBuilder = queryBuilder.where((query) => {
                query.whereILike('name', `%${query}%`);
                query.orWhereILike('description', `%${query}%`);
                query.orWhereILike('slug', `%${query}%`);
            });
        }
        const total = (await queryBuilder.count('id as total'));
        return total[0].total;
    }
    async findById(categoryId) {
        return Category.findOrFail(categoryId);
    }
    async findBySlug(slug) {
        return Category.query().where('slug', slug).first();
    }
    async delete(categoryId) {
        const category = await Category.findOrFail(categoryId);
        await category.delete();
        return true;
    }
}
//# sourceMappingURL=category_service.js.map