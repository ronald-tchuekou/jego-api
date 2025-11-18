var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { createCompanyImages, deleteCompanyImages } from '#abilities/company_image_abilities';
import CompanyImageService from '#services/company_image_service';
import CompanyService from '#services/company_service';
import { storeCompanyImagesValidator } from '#validators/company_image';
import { inject } from '@adonisjs/core';
export const COMPANY_IMAGES_STORAGE_PATH = 'storage/uploads/company_images';
let CompanyImagesController = class CompanyImagesController {
    companyImageService;
    companyService;
    constructor(companyImageService, companyService) {
        this.companyImageService = companyImageService;
        this.companyService = companyService;
    }
    async index({ params, request, response }) {
        try {
            const { companyId } = params;
            const { limit = 10, page = 1 } = request.qs();
            await this.companyService.findById(companyId);
            const result = await this.companyImageService.getCompanyImages(companyId, {
                limit,
                page,
            });
            return response.ok(result);
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors de la récupération des images.',
                error: error.message,
            });
        }
    }
    async store({ request, bouncer, response }) {
        try {
            const { images, companyId } = await request.validateUsing(storeCompanyImagesValidator);
            const imagesData = [];
            const company = await this.companyService.findById(companyId);
            if (!company) {
                return response.notFound({
                    message: 'Aucune entreprise trouvée.',
                });
            }
            await bouncer.authorize(createCompanyImages, company);
            for (const image of images) {
                const filename = `${Date.now()}_${company.name.toLowerCase().replace(/ /g, '_')}.${image.extname}`;
                await image.move(COMPANY_IMAGES_STORAGE_PATH, {
                    name: filename,
                    overwrite: true,
                });
                imagesData.push({
                    name: filename,
                    path: `${COMPANY_IMAGES_STORAGE_PATH}/${filename}`,
                });
            }
            const createdImages = await this.companyImageService.createMany(companyId, imagesData);
            return response.created({
                data: createdImages,
                message: `${createdImages.length} image(s) ajoutée(s) avec succès`,
            });
        }
        catch (error) {
            return response.badRequest({
                message: 'Une erreur est survenue lors de la création des images.',
                error: error.message,
            });
        }
    }
    async destroy({ params, bouncer, auth, response }) {
        try {
            const { imageId } = params;
            const company = await this.companyService.findById(auth.user.companyId || '');
            if (!company) {
                return response.notFound({
                    message: 'Aucune entreprise trouvée.',
                });
            }
            await bouncer.authorize(deleteCompanyImages, company);
            await this.companyImageService.deleteImage(imageId);
            return response.ok({
                message: 'Image supprimée avec succès',
            });
        }
        catch (error) {
            return response.badRequest({
                message: "Une erreur est survenue lors de la suppression de l'image.",
                error: error.message,
            });
        }
    }
};
CompanyImagesController = __decorate([
    inject(),
    __metadata("design:paramtypes", [CompanyImageService,
        CompanyService])
], CompanyImagesController);
export default CompanyImagesController;
//# sourceMappingURL=company_images_controller.js.map