import Appointment, { AppointmentStatus } from '#models/appointment'
import Company from '#models/company'
import User, { UserRole } from '#models/user'
import { faker } from '@faker-js/faker'
import { DateTime } from 'luxon'

interface FakeAppointmentData {
  companyId: string
  userId: string
  date: DateTime
  time: string
  status: AppointmentStatus
  subject: string
  content: string
  isRead: boolean
}

/**
 * Creates fake appointments between regular users and companies.
 * Each regular user will have 1-3 appointments with different companies.
 * Appointments will be spread across past, present, and future dates.
 */
export async function createFakeAppointments(): Promise<void> {
  console.log('🚀 Starting creation of fake appointments...')

  try {
    // Fetch regular users (not company users)
    const regularUsers = await User.query().where('role', UserRole.USER).whereNull('companyId')

    if (regularUsers.length === 0) {
      console.log('⚠️ No regular users found in database. Please create regular users first.')
      return
    }

    // Fetch all companies
    const companies = await Company.query().whereNull('blockedAt') // Only active companies

    if (companies.length === 0) {
      console.log('⚠️ No companies found in database. Please create companies first.')
      return
    }

    console.log(`👥 Found ${regularUsers.length} regular users`)
    console.log(`🏢 Found ${companies.length} companies`)

    let totalAppointmentsCreated = 0

    // Appointment subjects for different types of businesses
    const appointmentSubjects = [
      'Consultation Request',
      'Service Inquiry',
      'Product Information',
      'Business Meeting',
      'Technical Support',
      'Quote Request',
      'Follow-up Meeting',
      'Project Discussion',
      'Contract Review',
      'Service Appointment',
      'Initial Consultation',
      'Maintenance Request',
      'Upgrade Discussion',
      'Partnership Meeting',
      'Training Session',
    ]

    // Generate time slots (business hours: 9 AM to 5 PM)
    const timeSlots = [
      '09:00',
      '09:30',
      '10:00',
      '10:30',
      '11:00',
      '11:30',
      '12:00',
      '12:30',
      '13:00',
      '13:30',
      '14:00',
      '14:30',
      '15:00',
      '15:30',
      '16:00',
      '16:30',
      '17:00',
    ]

    // Create appointments for each regular user
    for (const user of regularUsers) {
      console.log(`📅 Creating appointments for: ${user.displayName} (${user.email})`)

      // Generate between 1-3 appointments per user
      const appointmentCount = faker.number.int({ min: 1, max: 3 })

      // Randomly select companies for this user (no duplicates)
      const selectedCompanies = faker.helpers.arrayElements(companies, appointmentCount)

      for (let i = 0; i < appointmentCount; i++) {
        const company = selectedCompanies[i]

        // Generate a date within the last 30 days or next 30 days
        const today = DateTime.now()
        const startDate = today.minus({ days: 30 })
        const endDate = today.plus({ days: 30 })
        const appointmentDate = DateTime.fromJSDate(
          faker.date.between({ from: startDate.toJSDate(), to: endDate.toJSDate() })
        )

        // Determine status based on date
        let status: AppointmentStatus
        if (appointmentDate < today.minus({ days: 1 })) {
          // Past appointments are mostly completed or cancelled
          status = faker.helpers.weightedArrayElement([
            { weight: 0.7, value: AppointmentStatus.COMPLETED },
            { weight: 0.2, value: AppointmentStatus.CANCELLED },
            { weight: 0.1, value: AppointmentStatus.CONFIRMED },
          ])
        } else if (appointmentDate < today.plus({ days: 7 })) {
          // Near future appointments are mostly confirmed
          status = faker.helpers.weightedArrayElement([
            { weight: 0.8, value: AppointmentStatus.CONFIRMED },
            { weight: 0.15, value: AppointmentStatus.PENDING },
            { weight: 0.05, value: AppointmentStatus.CANCELLED },
          ])
        } else {
          // Far future appointments are mostly pending or confirmed
          status = faker.helpers.weightedArrayElement([
            { weight: 0.6, value: AppointmentStatus.PENDING },
            { weight: 0.35, value: AppointmentStatus.CONFIRMED },
            { weight: 0.05, value: AppointmentStatus.CANCELLED },
          ])
        }

        const appointmentData: FakeAppointmentData = {
          companyId: company.id,
          userId: user.id,
          date: appointmentDate,
          time: faker.helpers.arrayElement(timeSlots),
          status: status,
          subject: faker.helpers.arrayElement(appointmentSubjects),
          content: generateAppointmentContent(company.name || 'the company'),
          isRead: faker.helpers.weightedArrayElement([
            { weight: 0.7, value: true }, // 70% chance of being read
            { weight: 0.3, value: false }, // 30% chance of being unread
          ]),
        }

        try {
          const appointment = new Appointment()
          appointment.companyId = appointmentData.companyId
          appointment.userId = appointmentData.userId
          appointment.date = appointmentData.date
          appointment.time = appointmentData.time
          appointment.status = appointmentData.status
          appointment.subject = appointmentData.subject
          appointment.content = appointmentData.content
          appointment.isRead = appointmentData.isRead

          await appointment.save()
          totalAppointmentsCreated++

          const dateStr = appointmentData.date.toFormat('yyyy-MM-dd')
          console.log(
            `  ✅ Created appointment: "${appointmentData.subject}" with ${company.name} on ${dateStr} at ${appointmentData.time} (${appointmentData.status})`
          )
        } catch (error) {
          console.log(
            `  ❌ Failed to create appointment for ${user.displayName} with ${company.name}: ${error.message}`
          )
        }
      }

      console.log(`🎉 Completed ${appointmentCount} appointments for: ${user.displayName}`)
    }

    console.log('\n📊 Summary:')
    console.log(`✅ Successfully created ${totalAppointmentsCreated} appointments`)
    console.log(`👥 Appointments distributed across ${regularUsers.length} regular users`)
    console.log(`🏢 Appointments with ${companies.length} available companies`)
    console.log('✅ Each appointment includes:')
    console.log('   - Realistic subject and detailed content')
    console.log('   - Random date within ±30 days from today')
    console.log('   - Business hours time slots (9 AM - 5 PM)')
    console.log('   - Status based on appointment date (past=completed, future=pending/confirmed)')
    console.log('   - Random read/unread status (70% read, 30% unread)')
    console.log('\n🎉 Fake appointments creation completed successfully!')
  } catch (error) {
    console.error('❌ Error creating fake appointments:', error.message)
    throw error
  }
}

/**
 * Generate realistic appointment content based on the company name
 */
function generateAppointmentContent(companyName: string): string {
  const contentTemplates = [
    `Hello, I would like to schedule a meeting with ${companyName} to discuss your services. I'm particularly interested in learning more about what you offer and how it might benefit my needs. Please let me know your availability for the coming weeks.`,

    `Hi there, I'm reaching out to ${companyName} because I've heard great things about your work. I would appreciate the opportunity to meet and discuss a potential collaboration or service engagement. Could we arrange a consultation at your earliest convenience?`,

    `Good day, I am interested in the services provided by ${companyName} and would like to schedule an appointment to discuss my requirements in detail. I believe your expertise could be exactly what I'm looking for. Please advise on suitable meeting times.`,

    `Hello ${companyName} team, I would like to request a meeting to explore how your services might help with my current project. I've done some research and your company seems like a perfect fit for what I need. Looking forward to hearing from you.`,

    `Hi, I'm writing to inquire about scheduling a consultation with ${companyName}. I have some specific requirements that I'd like to discuss in person. Would it be possible to arrange a meeting sometime next week?`,

    `Dear ${companyName}, I hope this message finds you well. I'm interested in learning more about your offerings and would appreciate the chance to meet with someone from your team. Please let me know when would be a good time for a brief consultation.`,

    `Hello, I've been recommended to contact ${companyName} regarding my upcoming project needs. I would like to schedule a meeting to discuss the scope and see how your services align with my requirements. Thank you for your time.`,

    `Good morning, I'm reaching out to ${companyName} to request an appointment. I have some questions about your services and would prefer to discuss them face-to-face rather than over email. Could we arrange something for this week or next?`,
  ]

  return faker.helpers.arrayElement(contentTemplates)
}

/**
 * Delete all existing appointments (useful for cleanup during testing)
 */
export async function deleteAllAppointments(): Promise<void> {
  console.log('🗑️ Deleting all existing appointments...')

  try {
    const deletedCount = await Appointment.query().delete()
    console.log(`✅ Successfully deleted ${deletedCount} appointments`)
  } catch (error) {
    console.error('❌ Error deleting appointments:', error.message)
    throw error
  }
}

/**
 * Show statistics about existing appointments
 */
export async function getAppointmentStatistics(): Promise<void> {
  console.log('📊 Gathering appointment statistics...')

  try {
    const total = await Appointment.query().count('* as total')
    const totalCount = total[0].$extras.total

    const statusStats = await Appointment.query()
      .preload('user')
      .preload('company')
      .groupBy('status')
      .count('* as count')
      .select('status')

    const userStats = await Appointment.query()
      .preload('user')
      .preload('company')
      .join('users', 'appointments.user_id', 'users.id')
      .groupBy('users.id', 'users.first_name', 'users.last_name')
      .count('* as count')
      .select('users.first_name', 'users.last_name')
      .orderBy('count', 'desc')
      .limit(10)

    const companyStats = await Appointment.query()
      .preload('company')
      .preload('user')
      .join('companies', 'appointments.company_id', 'companies.id')
      .groupBy('companies.id', 'companies.name')
      .count('* as count')
      .select('companies.name')
      .orderBy('count', 'desc')
      .limit(10)

    console.log(`\n📈 Total appointments: ${totalCount}`)

    console.log('\n📊 By status:')
    statusStats.forEach((stat) => {
      console.log(`  ${stat.status}: ${stat.$extras.count}`)
    })

    console.log('\n👥 Top 10 users by appointments:')
    userStats.forEach((stat, index) => {
      console.log(
        `  ${index + 1}. ${stat.user.firstName} ${stat.user.lastName}: ${stat.$extras.count}`
      )
    })

    console.log('\n🏢 Top 10 companies by appointments:')
    companyStats.forEach((stat, index) => {
      console.log(`  ${index + 1}. ${stat.company.name}: ${stat.$extras.count}`)
    })
  } catch (error) {
    console.error('❌ Error gathering appointment statistics:', error.message)
    throw error
  }
}
