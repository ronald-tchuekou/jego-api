import Post from '#models/post'
import User, { UserRole } from '#models/user'
import { faker } from '@faker-js/faker'

interface FakePostData {
  userId: string
  title: string
  description: string
  status: string
  type: string
  category: string
  image: string | null
}

/**
 * Creates a minimum of 4 fake posts for each user that is connected to a company.
 * Only users with roles 'company:admin' or 'company:agent' will get posts created.
 */
export async function createFakePosts(): Promise<void> {
  console.log('🚀 Starting creation of fake posts for company users...')

  try {
    // Fetch users that are connected to companies
    const companyUsers = await User.query()
      .whereIn('role', [UserRole.COMPANY_ADMIN, UserRole.COMPANY_AGENT])
      .whereNotNull('companyId')
      .preload('company')

    if (companyUsers.length === 0) {
      console.log('⚠️ No company users found in database. Please create company users first.')
      return
    }

    console.log(`👥 Found ${companyUsers.length} company users`)

    let totalPostsCreated = 0

    // Post status options
    const postStatuses = ['active', 'inactive', 'pending', 'approved', 'rejected']

    // Post type options
    const postTypes = [
      'announcement',
      'news',
      'promotion',
      'event',
      'service_update',
      'company_update',
      'achievement',
      'testimonial',
    ]

    // Post category options
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
    ]

    // Create posts for each company user
    for (const user of companyUsers) {
      console.log(`📝 Creating posts for: ${user.displayName} (${user.company?.name})`)

      // Generate between 4-8 posts per user
      const postCount = faker.number.int({ min: 4, max: 8 })

      for (let i = 0; i < postCount; i++) {
        const postData: FakePostData = {
          userId: user.id,
          title: faker.lorem.sentence({ min: 4, max: 8 }),
          description: faker.lorem.paragraphs({ min: 2, max: 4 }, '\n\n'),
          status: faker.helpers.arrayElement(postStatuses),
          type: faker.helpers.arrayElement(postTypes),
          category: faker.helpers.arrayElement(postCategories),
          image: Math.random() > 0.5 ? faker.image.url({ width: 800, height: 600 }) : null, // 50% chance of having an image
        }

        try {
          const post = new Post()
          post.userId = postData.userId
          post.title = postData.title
          post.description = postData.description
          post.status = postData.status
          post.type = postData.type
          post.category = postData.category
          post.image = postData.image

          await post.save()
          totalPostsCreated++

          console.log(
            `  ✅ Created post: "${postData.title.substring(0, 50)}..." (${postData.type}/${postData.category})`
          )
        } catch (error) {
          console.log(
            `  ❌ Failed to create post "${postData.title}" for ${user.displayName}: ${error.message}`
          )
        }
      }

      console.log(`🎉 Completed ${postCount} posts for: ${user.displayName}`)
    }

    console.log('\n📊 Summary:')
    console.log(`✅ Successfully created ${totalPostsCreated} posts`)
    console.log(`👥 Posts distributed across ${companyUsers.length} company users`)
    console.log('✅ Each post includes:')
    console.log('   - Realistic title and multi-paragraph description')
    console.log('   - Random status (active, inactive, pending, approved, rejected)')
    console.log('   - Random type (announcement, news, promotion, event, etc.)')
    console.log('   - Random category (business, technology, services, etc.)')
    console.log('   - 50% chance of having an image URL')
    console.log('\n🎉 Fake posts creation completed successfully!')
  } catch (error) {
    console.error('❌ Error creating fake posts:', error.message)
    throw error
  }
}
