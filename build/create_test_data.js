import { createFakeAppointments, deleteAllAppointments, getAppointmentStatistics, } from '#utils/create_fake_appointments';
import { createFakeCompanies } from '#utils/create_fake_companies';
import { createFakeCompanyServices } from '#utils/create_fake_company_services';
import { createFakeJobApplications, deleteAllJobApplications, getJobApplicationStatistics, } from '#utils/create_fake_job_applications';
import { createFakeJobs } from '#utils/create_fake_jobs';
import { createFakePosts } from '#utils/create_fake_posts';
export async function createAllFakeData() {
    console.log('🚀 Starting fake data creation process...\n');
    try {
        console.log('Step 1: Creating fake companies...');
        await createFakeCompanies();
        console.log();
        console.log('Step 2: Creating fake jobs...');
        await createFakeJobs();
        console.log();
        console.log('Step 3: Creating fake job applications...');
        await createFakeJobApplications();
        console.log();
        console.log('Step 4: Creating fake posts...');
        await createFakePosts();
        console.log();
        console.log('Step 5: Creating fake company services...');
        await createFakeCompanyServices();
        console.log();
        console.log('Step 6: Creating fake appointments...');
        await createFakeAppointments();
        console.log();
        console.log('✅ All fake data created successfully!');
    }
    catch (error) {
        console.error('❌ Error creating fake data:', error.message);
        process.exit(1);
    }
}
export async function createJobApplicationsOnly() {
    try {
        await createFakeJobApplications();
    }
    catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}
export async function showApplicationStatistics() {
    try {
        await getJobApplicationStatistics();
    }
    catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}
export async function cleanupApplications() {
    try {
        await deleteAllJobApplications();
    }
    catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}
export async function createAppointmentsOnly() {
    try {
        await createFakeAppointments();
    }
    catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}
export async function showAppointmentStatistics() {
    try {
        await getAppointmentStatistics();
    }
    catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}
export async function cleanupAppointments() {
    try {
        await deleteAllAppointments();
    }
    catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}
//# sourceMappingURL=create_test_data.js.map