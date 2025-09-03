#!/usr/bin/env node

/**
 * Standalone script to create fake appointments
 * 
 * Usage:
 * 1. Run directly with ts-node:
 *    npx ts-node create_fake_appointments_standalone.ts
 * 
 * 2. Or compile and run:
 *    npm run build
 *    node build/create_fake_appointments_standalone.js
 * 
 * 3. Or use with AdonisJS REPL:
 *    node ace repl
 *    Then in REPL: await import('./create_fake_appointments_standalone.js')
 * 
 * Note: Make sure you have:
 * - Regular users (role: 'user') in your database
 * - Active companies in your database
 */

import { createFakeAppointments, getAppointmentStatistics } from '#utils/create_fake_appointments'

async function main() {
  console.log('🚀 Starting fake appointments creation...\n')
  
  try {
    await createFakeAppointments()
    console.log('\n📊 Final Statistics:')
    await getAppointmentStatistics()
    console.log('\n✅ Script completed successfully!')
  } catch (error) {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  }
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  })
