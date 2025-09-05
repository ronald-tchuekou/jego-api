import Job, { JobStatus } from '#models/job'
import User, { UserRole } from '#models/user'
import { faker } from '@faker-js/faker'
import { DateTime } from 'luxon'

interface FakeJobData {
  userId: string
  title: string
  description: string
  companyName: string | null
  companyLogo: string | null
  companyWebsite: string | null
  companyEmail: string | null
  companyPhone: string | null
  companyAddress: string | null
  companyCity: string | null
  companyState: string | null
  companyZip: string | null
  companyCountry: string | null
  expiresAt: DateTime | null
  status: JobStatus
}

/**
 * Creates fake jobs in the database.
 * Only users with roles 'admin', 'company:admin', or 'company:agent' can create jobs.
 * Creates 3-6 jobs per eligible user with realistic job data.
 */
export async function createFakeJobs(): Promise<void> {
  console.log('🚀 Starting creation of fake jobs...')

  try {
    // Fetch users that can create jobs (admin, company:admin, company:agent)
    const eligibleUsers = await User.query()
      .whereIn('role', [UserRole.ADMIN, UserRole.COMPANY_ADMIN, UserRole.COMPANY_AGENT])
      .preload('company')

    if (eligibleUsers.length === 0) {
      console.log(
        '⚠️ No eligible users found in database. Please create admin or company users first.'
      )
      return
    }

    console.log(`👥 Found ${eligibleUsers.length} eligible users`)

    let totalJobsCreated = 0

    // Job titles for different categories
    const jobTitles = [
      'Software Engineer',
      'Frontend Developer',
      'Backend Developer',
      'Full Stack Developer',
      'DevOps Engineer',
      'Data Scientist',
      'Product Manager',
      'UX/UI Designer',
      'Marketing Manager',
      'Sales Representative',
      'Customer Support Specialist',
      'Business Analyst',
      'Project Manager',
      'Quality Assurance Engineer',
      'Technical Writer',
      'Digital Marketing Specialist',
      'Content Creator',
      'Social Media Manager',
      'Account Manager',
      'Operations Manager',
      'Financial Analyst',
      'HR Specialist',
      'Graphic Designer',
      'Mobile App Developer',
      'Machine Learning Engineer',
      'Cybersecurity Analyst',
      'Network Administrator',
      'Database Administrator',
      'Cloud Architect',
      'Scrum Master',
    ]

    // Job description templates
    const getJobDescription = (title: string, company: string | null) => {
      const responsibilities = faker.helpers.arrayElements(
        [
          'Develop and maintain high-quality software applications',
          'Collaborate with cross-functional teams to deliver projects on time',
          'Participate in code reviews and maintain coding standards',
          'Design and implement scalable solutions',
          'Troubleshoot and debug applications',
          'Write comprehensive documentation',
          'Mentor junior team members',
          'Stay up-to-date with latest industry trends and technologies',
          'Participate in agile development processes',
          'Optimize application performance and security',
          'Contribute to architectural decisions',
          'Work closely with product managers and stakeholders',
          'Implement automated testing strategies',
          'Manage and deploy applications to production environments',
          'Analyze user requirements and translate them into technical solutions',
        ],
        faker.number.int({ min: 4, max: 8 })
      )

      const requirements = faker.helpers.arrayElements(
        [
          "Bachelor's degree in Computer Science or related field",
          '3+ years of professional experience',
          'Strong problem-solving and analytical skills',
          'Excellent communication and teamwork abilities',
          'Experience with modern development frameworks',
          'Knowledge of database design and management',
          'Familiarity with version control systems (Git)',
          'Understanding of software development lifecycle',
          'Experience with cloud platforms (AWS, Azure, GCP)',
          'Knowledge of containerization technologies (Docker, Kubernetes)',
          'Understanding of CI/CD pipelines',
          'Experience with automated testing',
          'Strong attention to detail',
          'Ability to work in a fast-paced environment',
          'Experience with agile methodologies',
        ],
        faker.number.int({ min: 5, max: 10 })
      )

      const benefits = faker.helpers.arrayElements(
        [
          'Competitive salary and benefits package',
          'Health, dental, and vision insurance',
          'Flexible working hours and remote work options',
          'Professional development opportunities',
          '401(k) retirement plan with company matching',
          'Paid time off and holidays',
          'Modern office environment with latest technology',
          'Team building activities and company events',
          'Learning and development budget',
          'Gym membership or wellness programs',
          'Free lunch and snacks',
          'Stock options or equity participation',
          'Parental leave policies',
          'Commuter benefits',
          'Collaborative and inclusive work culture',
        ],
        faker.number.int({ min: 5, max: 10 })
      )

      return `We are seeking a talented ${title} to join our ${company ? `team at ${company}` : 'growing team'}. This is an exciting opportunity to work on innovative projects and make a significant impact.

**Key Responsibilities:**
${responsibilities.map((r) => `• ${r}`).join('\n')}

**Requirements:**
${requirements.map((r) => `• ${r}`).join('\n')}

**What We Offer:**
${benefits.map((b) => `• ${b}`).join('\n')}

Join us and be part of a dynamic team that values innovation, collaboration, and professional growth!`
    }

    // Create jobs for each eligible user
    for (const user of eligibleUsers) {
      const userName = user.displayName || user.email
      console.log(`💼 Creating jobs for: ${userName} (${user.role})`)

      // Generate between 3-6 jobs per user
      const jobCount = faker.number.int({ min: 3, max: 6 })

      for (let i = 0; i < jobCount; i++) {
        const jobTitle = faker.helpers.arrayElement(jobTitles)

        // Use company data if user is associated with a company
        const companyData = user.company
          ? {
              companyName: user.company.name,
              companyLogo: user.company.logo || null,
              companyWebsite: user.company.website,
              companyEmail: user.company.email,
              companyPhone: user.company.phone,
              companyAddress: user.company.address,
              companyCity: user.company.city,
              companyState: user.company.state,
              companyZip: user.company.zipCode,
              companyCountry: user.company.country,
            }
          : {
              companyName: faker.company.name(),
              companyLogo:
                Math.random() > 0.7 ? faker.image.url({ width: 200, height: 200 }) : null,
              companyWebsite: faker.internet.url(),
              companyEmail: faker.internet.email(),
              companyPhone: faker.phone.number(),
              companyAddress: faker.location.streetAddress(),
              companyCity: faker.location.city(),
              companyState: faker.location.state(),
              companyZip: faker.location.zipCode(),
              companyCountry: faker.location.country(),
            }

        // Random expiration date (between 1-90 days from now, or null for permanent)
        const expiresAt =
          Math.random() > 0.3
            ? DateTime.now().plus({ days: faker.number.int({ min: 1, max: 90 }) })
            : null

        const jobData: FakeJobData = {
          userId: user.id,
          title: jobTitle,
          description: getJobDescription(jobTitle, companyData.companyName),
          ...companyData,
          expiresAt,
          status: faker.helpers.weightedArrayElement([
            { weight: 8, value: JobStatus.OPEN },
            { weight: 2, value: JobStatus.CLOSED },
          ]),
        }

        try {
          const job = new Job()
          job.userId = jobData.userId
          job.title = jobData.title
          job.description = jobData.description
          job.companyName = jobData.companyName
          job.companyLogo = jobData.companyLogo
          job.companyWebsite = jobData.companyWebsite
          job.companyEmail = jobData.companyEmail
          job.companyPhone = jobData.companyPhone
          job.companyAddress = jobData.companyAddress
          job.companyCity = jobData.companyCity
          job.companyState = jobData.companyState
          job.companyZip = jobData.companyZip
          job.companyCountry = jobData.companyCountry
          job.expiresAt = jobData.expiresAt
          job.status = jobData.status

          await job.save()
          totalJobsCreated++

          const expiryInfo = jobData.expiresAt
            ? `expires ${jobData.expiresAt.toRelativeCalendar()}`
            : 'permanent'

          console.log(
            `  ✅ Created job: "${jobData.title}" at ${jobData.companyName} (${jobData.status}, ${expiryInfo})`
          )
        } catch (error) {
          console.log(
            `  ❌ Failed to create job "${jobData.title}" for ${userName}: ${error.message}`
          )
        }
      }

      console.log(`🎉 Completed ${jobCount} jobs for: ${userName}`)
    }

    console.log('\n📊 Summary:')
    console.log(`✅ Successfully created ${totalJobsCreated} jobs`)
    console.log(`👥 Jobs distributed across ${eligibleUsers.length} eligible users`)
    console.log(`🔑 Eligible roles: admin, company:admin, company:agent`)
    console.log('✅ Each job includes:')
    console.log('   - Realistic job title and comprehensive description')
    console.log("   - Complete company information (from user's company or generated)")
    console.log('   - Random expiration date (70% temporary, 30% permanent)')
    console.log('   - Status (80% open, 20% closed)')
    console.log('   - Detailed responsibilities, requirements, and benefits')
    console.log('\n🎉 Fake jobs creation completed successfully!')
  } catch (error) {
    console.error('❌ Error creating fake jobs:', error.message)
    throw error
  }
}
