#!/usr/bin/env node
import { createFakeAppointments, getAppointmentStatistics } from '#utils/create_fake_appointments';
async function main() {
    console.log('🚀 Starting fake appointments creation...\n');
    try {
        await createFakeAppointments();
        console.log('\n📊 Final Statistics:');
        await getAppointmentStatistics();
        console.log('\n✅ Script completed successfully!');
    }
    catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    }
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
});
//# sourceMappingURL=create_fake_appointments_standalone.js.map