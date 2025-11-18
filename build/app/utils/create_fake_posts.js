import Post from '#models/post';
import PostMedia from '#models/post_media';
import User, { UserRole } from '#models/user';
import { faker } from '@faker-js/faker';
export async function createFakePosts() {
    console.log('🚀 Starting creation of fake posts for company users...');
    try {
        const companyUsers = await User.query()
            .whereIn('role', [UserRole.COMPANY_ADMIN, UserRole.COMPANY_AGENT])
            .whereNotNull('companyId')
            .preload('company');
        if (companyUsers.length === 0) {
            console.log('⚠️ No company users found in database. Please create company users first.');
            return;
        }
        console.log(`👥 Found ${companyUsers.length} company users`);
        let totalPostsCreated = 0;
        const postStatuses = ['active', 'inactive', 'pending', 'approved', 'rejected'];
        const postTypes = [
            'announcement',
            'news',
            'promotion',
            'event',
            'service_update',
            'company_update',
            'achievement',
            'testimonial',
        ];
        const postCategories = [
            'business',
            'technology',
            'services',
            'community',
            'events',
            'promotions',
            'news',
            'updates',
            'achievements',
            'testimonials',
        ];
        for (const user of companyUsers) {
            console.log(`📝 Creating posts for: ${user.displayName} (${user.company?.name})`);
            const postCount = faker.number.int({ min: 4, max: 8 });
            for (let i = 0; i < postCount; i++) {
                const mediaRandom = Math.random();
                let mediaType = null;
                if (mediaRandom > 0.6) {
                    mediaType = 'image';
                }
                else if (mediaRandom > 0.4) {
                    mediaType = 'video';
                }
                const postData = {
                    userId: user.id,
                    title: faker.lorem.sentence({ min: 4, max: 8 }),
                    description: faker.lorem.paragraphs({ min: 2, max: 4 }, '\n\n'),
                    status: faker.helpers.arrayElement(postStatuses),
                    type: faker.helpers.arrayElement(postTypes),
                    category: faker.helpers.arrayElement(postCategories),
                    mediaType,
                };
                try {
                    const post = new Post();
                    post.userId = postData.userId;
                    post.title = postData.title;
                    post.description = postData.description;
                    post.status = postData.status;
                    post.type = postData.type;
                    post.category = postData.category;
                    post.mediaType = postData.mediaType;
                    await post.save();
                    totalPostsCreated++;
                    if (mediaType) {
                        const mediaCount = faker.number.int({ min: 1, max: 3 });
                        for (let j = 0; j < mediaCount; j++) {
                            const media = new PostMedia();
                            media.postId = post.id;
                            if (mediaType === 'image') {
                                const width = faker.number.int({ min: 800, max: 1920 });
                                const height = faker.number.int({ min: 600, max: 1080 });
                                media.name = `${faker.word.noun()}_${Date.now()}_${j}.jpg`;
                                media.type = 'image/jpeg';
                                media.url = faker.image.url({ width, height });
                                media.size = faker.number.int({ min: 50000, max: 2000000 });
                                media.thumbnailUrl = faker.image.url({ width: 300, height: 300 });
                                media.alt = faker.lorem.sentence();
                                media.metadata = {
                                    width,
                                    height,
                                    aspectRatio: Number((width / height).toFixed(2)),
                                };
                            }
                            else {
                                const width = faker.number.int({ min: 1280, max: 1920 });
                                const height = faker.number.int({ min: 720, max: 1080 });
                                const duration = faker.number.int({ min: 10, max: 300 });
                                media.name = `${faker.word.noun()}_${Date.now()}_${j}.mp4`;
                                media.type = 'video/mp4';
                                media.url = faker.image.url({ width, height });
                                media.size = faker.number.int({ min: 5000000, max: 50000000 });
                                media.thumbnailUrl = faker.image.url({ width: 640, height: 360 });
                                media.alt = faker.lorem.sentence();
                                media.metadata = {
                                    width,
                                    height,
                                    duration,
                                    aspectRatio: Number((width / height).toFixed(2)),
                                };
                            }
                            await media.save();
                        }
                    }
                    console.log(`  ✅ Created post: "${postData.title.substring(0, 50)}..." (${postData.type}/${postData.category})${mediaType ? ` with ${mediaType} media` : ''}`);
                }
                catch (error) {
                    console.log(`  ❌ Failed to create post "${postData.title}" for ${user.displayName}: ${error.message}`);
                }
            }
            console.log(`🎉 Completed ${postCount} posts for: ${user.displayName}`);
        }
        console.log('\n📊 Summary:');
        console.log(`✅ Successfully created ${totalPostsCreated} posts`);
        console.log(`👥 Posts distributed across ${companyUsers.length} company users`);
        console.log('✅ Each post includes:');
        console.log('   - Realistic title and multi-paragraph description');
        console.log('   - Random status (active, inactive, pending, approved, rejected)');
        console.log('   - Random type (announcement, news, promotion, event, etc.)');
        console.log('   - Random category (business, technology, services, etc.)');
        console.log('   - Media type (40% no media, 40% image, 20% video)');
        console.log('   - Posts with media have 1-3 PostMedia records with realistic metadata');
        console.log('\n🎉 Fake posts creation completed successfully!');
    }
    catch (error) {
        console.error('❌ Error creating fake posts:', error.message);
        throw error;
    }
}
//# sourceMappingURL=create_fake_posts.js.map