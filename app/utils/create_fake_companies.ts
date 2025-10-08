import Category from '#models/category'
import Company from '#models/company'
import User, { UserRole } from '#models/user'
import CompanyImageService from '#services/company_image_service'
import CompanyReviewService from '#services/company_review_service'
import CompanyService from '#services/company_service'
import UserService from '#services/user_service'
import { faker } from '@faker-js/faker'

interface FakeCompanyData {
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  website: string
  facebook?: string
  instagram?: string
  twitter?: string
  linkedin?: string
  description: string
  categoryId: string
}

interface FakeUserData {
  firstName: string
  lastName: string
  email: string
  password: string
  role: UserRole
  companyId: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
}

/**
 * Creates 20 fake companies with their associated data:
 * - Each company has 1 admin and 1-2 agents with password "password"
 * - Each company has 2-5 random images
 * - Each company has 3-8 reviews from fake users
 */
export async function createFakeCompanies(): Promise<void> {
  console.log('🚀 Starting creation of fake companies...')

  try {
    // Initialize services
    const companyService = new CompanyService()
    const userService = new UserService()
    const companyImageService = new CompanyImageService()
    const companyReviewService = new CompanyReviewService()

    // Get all categories to assign to companies
    const categories = await Category.all()
    if (categories.length === 0) {
      throw new Error('No categories found. Please create categories first.')
    }

    console.log(`📋 Found ${categories.length} categories`)

    // Create some fake regular users for reviews (not related to companies)
    console.log('👥 Creating fake users for reviews...')
    const reviewUsers: User[] = []
    for (let i = 0; i < 20; i++) {
      const userData: Partial<User> = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        password: 'password',
        role: UserRole.USER,
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
        country: faker.location.country(),
      }

      try {
        const user = await userService.create(userData)
        reviewUsers.push(user)
      } catch (error) {
        // Skip if user already exists (email collision)
        console.log(`⚠️ Skipping user creation (email may already exist): ${userData.email}`)
      }
    }

    console.log(`✅ Created ${reviewUsers.length} fake users for reviews`)

    // Create 50 companies
    console.log('🏢 Creating 50 fake companies...')
    const createdCompanies: Company[] = []

    for (let i = 0; i < 20; i++) {
      const companyData: FakeCompanyData = {
        name: faker.company.name(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
        country: faker.location.country(),
        website: faker.internet.url(),
        facebook: Math.random() > 0.5 ? faker.internet.url() : undefined,
        instagram: Math.random() > 0.5 ? faker.internet.username() : undefined,
        twitter: Math.random() > 0.5 ? faker.internet.username() : undefined,
        linkedin: Math.random() > 0.5 ? faker.internet.url() : undefined,
        description: faker.lorem.paragraph(),
        categoryId: faker.helpers.arrayElement(categories).id,
      }

      try {
        const company = await companyService.create(companyData)
        createdCompanies.push(company)
        console.log(`✅ Created company ${i + 1}/50: ${company.name}`)

        // Create admin for this company
        const adminData: FakeUserData = {
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          email: faker.internet.email(),
          password: 'password',
          role: UserRole.COMPANY_ADMIN,
          companyId: company.id,
          phone: faker.phone.number(),
          address: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          zipCode: faker.location.zipCode(),
          country: faker.location.country(),
        }

        try {
          await userService.create(adminData)
          console.log(`  👤 Created admin for ${company.name}`)
        } catch (error) {
          console.log(`  ⚠️ Failed to create admin for ${company.name}: ${error.message}`)
        }

        // Create 1-2 agents for this company
        const agentCount = faker.number.int({ min: 1, max: 2 })
        for (let j = 0; j < agentCount; j++) {
          const agentData: FakeUserData = {
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: faker.internet.email(),
            password: 'password',
            role: UserRole.COMPANY_AGENT,
            companyId: company.id,
            phone: faker.phone.number(),
            address: faker.location.streetAddress(),
            city: faker.location.city(),
            state: faker.location.state(),
            zipCode: faker.location.zipCode(),
            country: faker.location.country(),
          }

          try {
            await userService.create(agentData)
            console.log(`  👤 Created agent ${j + 1}/${agentCount} for ${company.name}`)
          } catch (error) {
            console.log(`  ⚠️ Failed to create agent for ${company.name}: ${error.message}`)
          }
        }

        // Create 2-5 images for this company
        const imageCount = faker.number.int({ min: 2, max: 5 })
        const imagesData = []
        for (let k = 0; k < imageCount; k++) {
          imagesData.push({
            name: `${faker.lorem.word()}-${k + 1}.jpg`,
            path: faker.image.url({ width: 800, height: 600 }),
          })
        }

        try {
          await companyImageService.createMany(company.id, imagesData)
          console.log(`  🖼️ Created ${imageCount} images for ${company.name}`)
        } catch (error) {
          console.log(`  ⚠️ Failed to create images for ${company.name}: ${error.message}`)
        }

        // Create 3-8 reviews for this company
        const reviewCount = faker.number.int({ min: 3, max: 8 })
        for (let l = 0; l < reviewCount && l < reviewUsers.length; l++) {
          const reviewer = faker.helpers.arrayElement(reviewUsers)
          const reviewData = {
            companyId: company.id,
            userId: reviewer.id,
            comment: faker.lorem.paragraph(),
            rating: faker.number.int({ min: 1, max: 5 }),
            isApproved: Math.random() > 0.2, // 80% chance of being approved
          }

          try {
            await companyReviewService.create(reviewData)
            console.log(`  ⭐ Created review for ${company.name} (rating: ${reviewData.rating})`)
          } catch (error) {
            // Skip if user already reviewed this company
            console.log(`  ⚠️ Skipped review for ${company.name} (user may have already reviewed)`)
          }
        }

        console.log(`🎉 Completed setup for company: ${company.name}`)
      } catch (error) {
        console.log(`❌ Failed to create company ${i + 1}: ${error.message}`)
      }
    }

    console.log('\n📊 Summary:')
    console.log(`✅ Successfully created ${createdCompanies.length}/50 companies`)
    console.log('✅ Each company has:')
    console.log('   - 1 admin user with password "password"')
    console.log('   - 1-2 agent users with password "password"')
    console.log('   - 2-5 random images')
    console.log('   - 3-8 reviews from fake users')
    console.log('\n🎉 Fake company creation completed successfully!')
  } catch (error) {
    console.error('❌ Error creating fake companies:', error.message)
    throw error
  }
}
