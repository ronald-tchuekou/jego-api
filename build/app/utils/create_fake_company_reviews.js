import Company from '#models/company';
import CompanyReview from '#models/company_review';
import User, { UserRole } from '#models/user';
import { faker } from '@faker-js/faker';
export async function createFakeCompanyReviews() {
    console.log('🚀 Starting creation of fake company reviews...');
    try {
        const companies = await Company.all();
        if (companies.length === 0) {
            console.log('⚠️ No companies found in database. Please create companies first.');
            return;
        }
        const users = await User.query().where('role', UserRole.USER);
        if (users.length === 0) {
            console.log("⚠️ No users with role 'user' found in database. Please create regular users first.");
            return;
        }
        console.log(`🏢 Found ${companies.length} companies`);
        console.log(`👤 Found ${users.length} regular users`);
        let totalReviewsCreated = 0;
        function shuffledUsers() {
            return faker.helpers.shuffle(users);
        }
        for (const company of companies) {
            const desiredCount = faker.number.int({ min: 3, max: 8 });
            const reviewers = shuffledUsers().slice(0, Math.min(desiredCount, users.length));
            if (reviewers.length === 0) {
                console.log(`⚠️ Skipping ${company.name}: not enough users to create reviews`);
                continue;
            }
            console.log(`📝 Creating ${reviewers.length} reviews for: ${company.name}`);
            for (const reviewer of reviewers) {
                const reviewData = {
                    companyId: company.id,
                    userId: reviewer.id,
                    comment: faker.lorem.paragraphs({ min: 1, max: 2 }, '\n\n'),
                    rating: faker.number.int({ min: 1, max: 5 }),
                    isApproved: Math.random() > 0.2,
                };
                try {
                    const review = new CompanyReview();
                    review.companyId = reviewData.companyId;
                    review.userId = reviewData.userId;
                    review.comment = reviewData.comment;
                    review.rating = reviewData.rating;
                    review.isApproved = reviewData.isApproved;
                    await review.save();
                    totalReviewsCreated++;
                    console.log(`  ✅ Created review by ${reviewer.displayName || reviewer.email} — ${reviewData.rating}/5`);
                }
                catch (error) {
                    console.log(`  ❌ Failed to create review for ${company.name} by ${reviewer.displayName || reviewer.email}: ${error.message}`);
                }
            }
            console.log(`🎉 Completed reviews for: ${company.name}`);
        }
        console.log('\n📊 Summary:');
        console.log(`✅ Successfully created ${totalReviewsCreated} company reviews`);
        console.log(`🏢 Reviews distributed across ${companies.length} companies`);
        console.log('✅ Each review includes:');
        console.log('   - Comment (1–2 paragraphs)');
        console.log('   - Rating between 1 and 5');
        console.log('   - Approval status (80% approved)');
        console.log('\n🎉 Fake company reviews creation completed successfully!');
    }
    catch (error) {
        console.error('❌ Error creating fake company reviews:', error.message);
        throw error;
    }
}
//# sourceMappingURL=create_fake_company_reviews.js.map