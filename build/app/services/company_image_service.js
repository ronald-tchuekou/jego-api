import Company from '#models/company';
import CompanyImage from '#models/company_image';
export default class CompanyImageService {
    async createMany(companyId, imagesData) {
        const company = await Company.findOrFail(companyId);
        if (!company)
            throw new Error("La company n'exist pas.");
        if (!imagesData || imagesData.length === 0) {
            throw new Error('Veuillez indiquer au moins une image.');
        }
        imagesData.forEach((imageData, index) => {
            if (!imageData.name || !imageData.path) {
                throw new Error(`L'image à l'index ${index} dois avoir les champs path et name.`);
            }
        });
        const createdImages = [];
        for (const imageData of imagesData) {
            const companyImage = new CompanyImage();
            companyImage.companyId = companyId;
            companyImage.name = imageData.name;
            companyImage.path = imageData.path;
            const savedImage = await companyImage.save();
            createdImages.push(savedImage);
        }
        return createdImages;
    }
    async deleteImage(imageId) {
        const companyImage = await CompanyImage.findOrFail(imageId);
        await companyImage.delete();
        return true;
    }
    async getCompanyImages(companyId, options = {}) {
        const { page = 1, limit = 10 } = options;
        let query = CompanyImage.query().where('companyId', companyId);
        const paginatedResult = await query.orderBy('createdAt', 'desc').paginate(page, limit);
        return paginatedResult;
    }
    async getImageCount(companyId) {
        await Company.findOrFail(companyId);
        const count = await CompanyImage.query().where('companyId', companyId).count('id as total');
        return count[0].total;
    }
}
//# sourceMappingURL=company_image_service.js.map