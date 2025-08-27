/**
 * Script to create fake data for testing purposes
 * 
 * Usage:
 * 1. Run this script using the Ace command:
 *    node ace repl
 *    Then execute:
 *    await import('./create_test_data.js')
 * 
 * 2. Or compile and run:
 *    npm run build
 *    node build/create_test_data.js
 * 
 * Note: Make sure you have:
 * - Users with role 'user' in your database
 * - Open jobs in your database
 */

import { createFakeCompanies } from '#utils/create_fake_companies'
import { createFakeCompanyServices } from '#utils/create_fake_company_services'
import { createFakeJobApplications, deleteAllJobApplications, getJobApplicationStatistics } from '#utils/create_fake_job_applications'
import { createFakeJobs } from '#utils/create_fake_jobs'
import { createFakePosts } from '#utils/create_fake_posts'

/**
 * Main function to create all fake data
 */
export async function createAllFakeData() {
  console.log('🚀 Starting fake data creation process...\n')
  
  try {
    // Create fake companies first (if needed)
    console.log('Step 1: Creating fake companies...')
    await createFakeCompanies()
    console.log()
    
    // Create fake jobs (if needed)
    console.log('Step 2: Creating fake jobs...')
    await createFakeJobs()
    console.log()
    
    // Create fake job applications
    console.log('Step 3: Creating fake job applications...')
    await createFakeJobApplications()
    console.log()
    
    // Optional: Create other fake data
    console.log('Step 4: Creating fake posts...')
    await createFakePosts()
    console.log()
    
    console.log('Step 5: Creating fake company services...')
    await createFakeCompanyServices()
    console.log()
    
    console.log('✅ All fake data created successfully!')
  } catch (error) {
    console.error('❌ Error creating fake data:', error.message)
    process.exit(1)
  }
}

/**
 * Create only job applications
 */
export async function createJobApplicationsOnly() {
  try {
    await createFakeJobApplications()
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

/**
 * Show statistics about existing job applications
 */
export async function showApplicationStatistics() {
  try {
    await getJobApplicationStatistics()
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

/**
 * Clean up all job applications
 */
export async function cleanupApplications() {
  try {
    await deleteAllJobApplications()
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

// If running this file directly
if (require.main === module) {
  // You can change this to run different functions
  createJobApplicationsOnly()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Fatal error:', error)
      process.exit(1)
    })
}
