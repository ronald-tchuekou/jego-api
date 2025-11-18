import Company from '#models/company';
import db from '@adonisjs/lucid/services/db';
const doualaLocations = [
    { name: 'Centre Ville', lat: 4.0511, lng: 9.7679 },
    { name: 'Akwa', lat: 4.0556, lng: 9.7723 },
    { name: 'Bonanjo', lat: 4.0467, lng: 9.7634 },
    { name: 'Marché Central', lat: 4.0489, lng: 9.7656 },
    { name: 'Marché Sandaga', lat: 4.0534, lng: 9.7698 },
    { name: 'Boulevard de la République', lat: 4.0523, lng: 9.7712 },
    { name: 'Bonapriso', lat: 4.0589, lng: 9.7789 },
    { name: 'New Bell', lat: 4.0412, lng: 9.7543 },
    { name: 'Ndogpassi', lat: 4.0345, lng: 9.7489 },
    { name: 'Logpom', lat: 4.0678, lng: 9.7823 },
    { name: 'Makepe', lat: 4.0298, lng: 9.7367 },
    { name: 'Ndogbong', lat: 4.0456, lng: 9.7891 },
    { name: 'Port Autonome', lat: 4.0389, lng: 9.7234 },
    { name: 'Bonaberi', lat: 4.0123, lng: 9.6456 },
    { name: 'Pk8', lat: 4.0789, lng: 9.8234 },
    { name: 'Pk12', lat: 4.1234, lng: 9.8567 },
    { name: 'Pk17', lat: 4.1567, lng: 9.8789 },
    { name: 'Pk22', lat: 4.189, lng: 9.9012 },
    { name: 'Deido', lat: 4.0234, lng: 9.7456 },
    { name: 'Akwa Nord', lat: 4.0612, lng: 9.7734 },
    { name: 'Akwa Sud', lat: 4.0456, lng: 9.7678 },
    { name: 'Université de Douala', lat: 4.0678, lng: 9.789 },
    { name: 'ESSEC', lat: 4.0534, lng: 9.7767 },
    { name: 'Aéroport International', lat: 4.0123, lng: 9.7234 },
    { name: 'Marché Mokolo', lat: 4.0345, lng: 9.7567 },
    { name: 'Marché Central 2', lat: 4.0467, lng: 9.7634 },
    { name: 'Carrefour Trois Statues', lat: 4.0589, lng: 9.7789 },
    { name: 'Rond Point Deido', lat: 4.0234, lng: 9.7456 },
    { name: 'Carrefour Ndokotti', lat: 4.0678, lng: 9.7823 },
    { name: 'Kotto', lat: 4.0789, lng: 9.8234 },
    { name: 'Sable', lat: 4.0123, lng: 9.7234 },
    { name: 'Pk24', lat: 4.2123, lng: 9.9234 },
    { name: 'Mbanga', lat: 4.2567, lng: 9.9456 },
];
function getRandomDoualaLocation() {
    const randomIndex = Math.floor(Math.random() * doualaLocations.length);
    const location = doualaLocations[randomIndex];
    const latVariation = (Math.random() - 0.5) * 0.004;
    const lngVariation = (Math.random() - 0.5) * 0.004;
    return {
        lat: location.lat + latVariation,
        lng: location.lng + lngVariation,
    };
}
async function updateCompanyLocationsToDouala() {
    try {
        console.log('🚀 Starting to update company locations to Douala, Cameroon...');
        const companies = await Company.all();
        console.log(`📊 Found ${companies.length} companies to update`);
        if (companies.length === 0) {
            console.log('ℹ️  No companies found in the database');
            return;
        }
        let updatedCount = 0;
        for (const company of companies) {
            const newLocation = getRandomDoualaLocation();
            await company
                .merge({
                location: newLocation,
                city: 'Douala',
                state: 'Littoral',
                country: 'Cameroon',
            })
                .save();
            updatedCount++;
            console.log(`✅ Updated ${company.name} (ID: ${company.id}) - Location: ${newLocation.lat.toFixed(6)}, ${newLocation.lng.toFixed(6)}`);
        }
        console.log(`🎉 Successfully updated ${updatedCount} companies to Douala locations!`);
        console.log(`📍 All companies are now located in Douala, Littoral Region, Cameroon`);
        const locationStats = await db.from('companies').select('location').whereNotNull('location');
        console.log('\n📈 Summary Statistics:');
        console.log(`- Total companies with locations: ${locationStats.length}`);
        console.log(`- All companies are now in Douala, Cameroon`);
    }
    catch (error) {
        console.error('❌ Error updating company locations:', error);
        throw error;
    }
}
export default async function () {
    console.log('🎯 Company Location Updater for Douala, Cameroon');
    console.log('===============================================');
    await updateCompanyLocationsToDouala();
    console.log('\n✨ Script execution completed!');
}
//# sourceMappingURL=update_company_locations_to_douala.js.map