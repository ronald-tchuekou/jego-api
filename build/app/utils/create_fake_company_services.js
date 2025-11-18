import Company from '#models/company';
import CompanyService from '#models/company_service';
import { faker } from '@faker-js/faker';
export async function createFakeCompanyServices() {
    console.log('🚀 Starting creation of fake company services...');
    try {
        const companies = await Company.all();
        if (companies.length === 0) {
            console.log('⚠️ No companies found in database. Please create companies first.');
            return;
        }
        console.log(`🏢 Found ${companies.length} companies`);
        let totalServicesCreated = 0;
        const serviceCategories = [
            'Consultation',
            'Installation',
            'Maintenance',
            'Repair',
            'Design',
            'Assessment',
            'Training',
            'Support',
            'Customization',
            'Planning',
        ];
        const serviceTypes = [
            'Basic',
            'Premium',
            'Standard',
            'Express',
            'Emergency',
            'On-site',
            'Remote',
            'Comprehensive',
        ];
        for (const company of companies) {
            console.log(`📋 Creating services for: ${company.name}`);
            const serviceCount = faker.number.int({ min: 5, max: 10 });
            for (let i = 0; i < serviceCount; i++) {
                const serviceCategory = faker.helpers.arrayElement(serviceCategories);
                const serviceType = faker.helpers.arrayElement(serviceTypes);
                const serviceData = {
                    companyId: company.id,
                    label: `${serviceType} ${serviceCategory}`,
                    description: faker.lorem.paragraph({ min: 2, max: 4 }),
                    price: Math.random() > 0.2 ? faker.commerce.price({ min: 50, max: 2000, dec: 0 }) : null,
                    image: Math.random() > 0.6 ? faker.image.url({ width: 400, height: 300 }) : null,
                };
                try {
                    const service = new CompanyService();
                    service.companyId = serviceData.companyId;
                    service.label = serviceData.label;
                    service.description = serviceData.description;
                    service.price = serviceData.price;
                    service.image = serviceData.image;
                    await service.save();
                    totalServicesCreated++;
                    console.log(`  ✅ Created service: ${serviceData.label} (${serviceData.price ? '$' + serviceData.price : 'Price on request'})`);
                }
                catch (error) {
                    console.log(`  ❌ Failed to create service "${serviceData.label}" for ${company.name}: ${error.message}`);
                }
            }
            console.log(`🎉 Completed ${serviceCount} services for: ${company.name}`);
        }
        console.log('\n📊 Summary:');
        console.log(`✅ Successfully created ${totalServicesCreated} company services`);
        console.log(`🏢 Services distributed across ${companies.length} companies`);
        console.log('✅ Each service includes:');
        console.log('   - Realistic service label and description');
        console.log('   - 80% chance of having a price (50-2000 range)');
        console.log('   - 40% chance of having an image URL');
        console.log('\n🎉 Fake company services creation completed successfully!');
    }
    catch (error) {
        console.error('❌ Error creating fake company services:', error.message);
        throw error;
    }
}
//# sourceMappingURL=create_fake_company_services.js.map