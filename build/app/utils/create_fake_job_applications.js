import Job, { JobStatus } from '#models/job';
import JobApplication, { JobApplicationStatus } from '#models/job_application';
import User, { UserRole } from '#models/user';
import { faker } from '@faker-js/faker';
import { DateTime } from 'luxon';
export async function createFakeJobApplications() {
    console.log('🚀 Starting creation of fake job applications...');
    try {
        const simpleUsers = await User.query().where('role', UserRole.USER).orderBy('created_at', 'asc');
        if (simpleUsers.length === 0) {
            console.log('⚠️ No simple users found in database. Please create users with role "user" first.');
            return;
        }
        console.log(`👥 Found ${simpleUsers.length} simple users`);
        const now = DateTime.now();
        const availableJobs = await Job.query()
            .where('status', JobStatus.OPEN)
            .andWhere((query) => {
            query.whereNull('expires_at').orWhere('expires_at', '>', now.toSQL());
        })
            .preload('user')
            .orderBy('created_at', 'asc');
        if (availableJobs.length === 0) {
            console.log('⚠️ No open jobs found in database. Please create jobs first.');
            return;
        }
        console.log(`💼 Found ${availableJobs.length} open jobs available for applications`);
        if (availableJobs.length < 3) {
            console.log('⚠️ Need at least 3 open jobs to create meaningful applications. Please create more jobs.');
            return;
        }
        let totalApplicationsCreated = 0;
        let totalDuplicatesSkipped = 0;
        const resumeTypes = [
            { weight: 7, value: { ext: 'pdf', weight: 3 } },
            { weight: 2, value: { ext: 'docx', weight: 2 } },
            { weight: 1, value: { ext: 'doc', weight: 1 } },
        ];
        const generateResumePath = (user) => {
            const fileType = faker.helpers.weightedArrayElement(resumeTypes);
            const timestamp = Date.now();
            const randomString = faker.string.alphanumeric(8);
            const sanitizedName = `${user.firstName}_${user.lastName}`.toLowerCase().replace(/\s+/g, '_');
            const patterns = [
                `resumes/${sanitizedName}_resume_${timestamp}.${fileType.ext}`,
                `uploads/resumes/${sanitizedName}_cv_${randomString}.${fileType.ext}`,
                `documents/applications/${user.id}/${sanitizedName}_resume.${fileType.ext}`,
                `storage/resumes/${timestamp}_${sanitizedName}.${fileType.ext}`,
                `files/job-applications/${sanitizedName}_${faker.date.recent().getFullYear()}.${fileType.ext}`,
            ];
            return faker.helpers.arrayElement(patterns);
        };
        for (const user of simpleUsers) {
            const userName = user.displayName || user.email;
            console.log(`📝 Creating job applications for: ${userName}`);
            const minApplications = 3;
            const maxApplications = Math.min(8, availableJobs.length);
            const applicationCount = faker.number.int({ min: minApplications, max: maxApplications });
            const selectedJobs = faker.helpers.arrayElements(availableJobs, applicationCount);
            const existingApplications = await JobApplication.query()
                .where('userId', user.id)
                .select('jobId');
            const existingJobIds = new Set(existingApplications.map((app) => app.jobId));
            let userApplicationsCreated = 0;
            for (const job of selectedJobs) {
                if (existingJobIds.has(job.id)) {
                    totalDuplicatesSkipped++;
                    console.log(`  ⏩ Skipped duplicate: User already applied to "${job.title}"`);
                    continue;
                }
                const applicationStatus = faker.helpers.weightedArrayElement([
                    { weight: 60, value: JobApplicationStatus.PENDING },
                    { weight: 25, value: JobApplicationStatus.ACCEPTED },
                    { weight: 15, value: JobApplicationStatus.REJECTED },
                ]);
                const applicationData = {
                    jobId: job.id,
                    userId: user.id,
                    status: applicationStatus,
                    resumePath: generateResumePath(user),
                };
                try {
                    const application = new JobApplication();
                    application.jobId = applicationData.jobId;
                    application.userId = applicationData.userId;
                    application.status = applicationData.status;
                    application.resumePath = applicationData.resumePath;
                    if (applicationStatus !== JobApplicationStatus.PENDING) {
                        const daysAgo = faker.number.int({ min: 1, max: 30 });
                        application.createdAt = DateTime.now().minus({ days: daysAgo });
                        const decisionDaysAgo = faker.number.int({ min: 0, max: daysAgo - 1 });
                        application.updatedAt = DateTime.now().minus({ days: decisionDaysAgo });
                    }
                    await application.save();
                    userApplicationsCreated++;
                    totalApplicationsCreated++;
                    const jobCompany = job.companyName || 'Unknown Company';
                    const statusEmoji = applicationStatus === JobApplicationStatus.PENDING
                        ? '⏳'
                        : applicationStatus === JobApplicationStatus.ACCEPTED
                            ? '✅'
                            : '❌';
                    console.log(`  ${statusEmoji} Applied to: "${job.title}" at ${jobCompany} (${applicationStatus})`);
                }
                catch (error) {
                    console.log(`  ❌ Failed to create application for job "${job.title}": ${error.message}`);
                }
            }
            if (userApplicationsCreated > 0) {
                console.log(`  ✅ Created ${userApplicationsCreated} applications for: ${userName}`);
            }
            else if (existingJobIds.size >= availableJobs.length) {
                console.log(`  ℹ️ User ${userName} has already applied to all available jobs`);
            }
        }
        const applicationStats = await JobApplication.query()
            .select('status')
            .count('* as count')
            .groupBy('status');
        const statsByStatus = applicationStats.reduce((acc, stat) => {
            acc[stat.status] = Number(stat.$extras.count);
            return acc;
        }, {});
        console.log('\n📊 Summary:');
        console.log(`✅ Successfully created ${totalApplicationsCreated} job applications`);
        console.log(`⏩ Skipped ${totalDuplicatesSkipped} duplicate applications`);
        console.log(`👥 Applications distributed across ${simpleUsers.length} simple users`);
        console.log(`💼 Users applied to ${availableJobs.length} different jobs`);
        console.log(`📝 Each user applied to minimum 3 jobs (where possible)`);
        console.log('\n📈 Application Status Distribution:');
        console.log(`   ⏳ Pending: ${statsByStatus[JobApplicationStatus.PENDING] || 0}`);
        console.log(`   ✅ Accepted: ${statsByStatus[JobApplicationStatus.ACCEPTED] || 0}`);
        console.log(`   ❌ Rejected: ${statsByStatus[JobApplicationStatus.REJECTED] || 0}`);
        console.log('\n✅ Each application includes:');
        console.log('   - Valid job and user references');
        console.log('   - Realistic resume file path');
        console.log('   - Weighted status distribution (60% pending, 25% accepted, 15% rejected)');
        console.log("   - No duplicate applications (user can't apply to same job twice)");
        console.log('   - Historical dates for accepted/rejected applications');
        console.log('\n🎉 Fake job applications creation completed successfully!');
    }
    catch (error) {
        console.error('❌ Error creating fake job applications:', error.message);
        throw error;
    }
}
export async function deleteAllJobApplications() {
    console.log('🗑️ Starting deletion of all job applications...');
    try {
        const count = await JobApplication.query().count('* as total');
        const totalCount = Number(count[0].$extras.total);
        if (totalCount === 0) {
            console.log('ℹ️ No job applications found in the database.');
            return;
        }
        console.log(`Found ${totalCount} job applications to delete...`);
        await JobApplication.query().delete();
        console.log(`✅ Successfully deleted ${totalCount} job applications`);
    }
    catch (error) {
        console.error('❌ Error deleting job applications:', error.message);
        throw error;
    }
}
export async function getJobApplicationStatistics() {
    console.log('📊 Fetching job application statistics...');
    try {
        const totalApplications = await JobApplication.query().count('* as total');
        const totalCount = Number(totalApplications[0].$extras.total);
        if (totalCount === 0) {
            console.log('ℹ️ No job applications found in the database.');
            return;
        }
        const statusStats = await JobApplication.query()
            .select('status')
            .count('* as count')
            .groupBy('status');
        const userApplicationStats = await JobApplication.query()
            .select('user_id')
            .count('* as application_count')
            .groupBy('user_id')
            .orderBy('application_count', 'desc')
            .limit(5);
        const jobApplicationStats = await JobApplication.query()
            .select('job_id')
            .count('* as application_count')
            .groupBy('job_id')
            .orderBy('application_count', 'desc')
            .limit(5);
        const topUserIds = userApplicationStats.map((stat) => stat.userId);
        const topUsers = await User.query().whereIn('id', topUserIds);
        const userMap = new Map(topUsers.map((user) => [user.id, user]));
        const topJobIds = jobApplicationStats.map((stat) => stat.jobId);
        const topJobs = await Job.query().whereIn('id', topJobIds);
        const jobMap = new Map(topJobs.map((job) => [job.id, job]));
        console.log('\n📊 Job Application Statistics:');
        console.log(`📝 Total Applications: ${totalCount}`);
        console.log('\n📈 Status Distribution:');
        statusStats.forEach((stat) => {
            const emoji = stat.status === JobApplicationStatus.PENDING
                ? '⏳'
                : stat.status === JobApplicationStatus.ACCEPTED
                    ? '✅'
                    : '❌';
            console.log(`   ${emoji} ${stat.status}: ${stat.$extras.count}`);
        });
        console.log('\n👥 Top 5 Most Active Applicants:');
        userApplicationStats.forEach((stat) => {
            const user = userMap.get(stat.userId);
            const userName = user ? user.displayName || user.email : 'Unknown User';
            console.log(`   • ${userName}: ${stat.$extras.application_count} applications`);
        });
        console.log('\n💼 Top 5 Most Applied Jobs:');
        jobApplicationStats.forEach((stat) => {
            const job = jobMap.get(stat.jobId);
            const jobTitle = job
                ? `${job.title} at ${job.companyName || 'Unknown Company'}`
                : 'Unknown Job';
            console.log(`   • ${jobTitle}: ${stat.$extras.application_count} applications`);
        });
    }
    catch (error) {
        console.error('❌ Error fetching job application statistics:', error.message);
        throw error;
    }
}
//# sourceMappingURL=create_fake_job_applications.js.map