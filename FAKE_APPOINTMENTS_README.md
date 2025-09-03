# Fake Appointments Generator

This script creates realistic fake appointments between regular users and companies in your database.

## Features

- Creates 1-3 appointments per regular user with different companies
- Generates realistic appointment data including:
  - Professional subjects (Consultation Request, Service Inquiry, etc.)
  - Detailed content messages tailored to each company
  - Dates spread across ±30 days from today
  - Business hours time slots (9 AM - 5 PM)
  - Status based on appointment date (past=completed, future=pending/confirmed)
  - Random read/unread status (70% read, 30% unread)

## Prerequisites

Before running the script, ensure you have:
- **Regular users** with role `'user'` in your database
- **Active companies** (not blocked) in your database

## Usage Options

### Option 1: Standalone Script (Recommended)
```bash
# Run directly with ts-node
npx ts-node create_fake_appointments_standalone.ts

# Or compile and run
npm run build
node build/create_fake_appointments_standalone.js
```

### Option 2: Using AdonisJS REPL
```bash
node ace repl
```
Then in the REPL:
```javascript
// Import and run the standalone script
await import('./create_fake_appointments_standalone.js')

// Or import specific functions from the main script
const { createAppointmentsOnly, showAppointmentStatistics, cleanupAppointments } = await import('./create_test_data.js')

// Create only appointments
await createAppointmentsOnly()

// Show statistics
await showAppointmentStatistics()

// Clean up all appointments (if needed)
await cleanupAppointments()
```

### Option 3: Integrate with Main Test Data Script
```bash
node ace repl
```
Then:
```javascript
const { createAllFakeData } = await import('./create_test_data.js')
await createAllFakeData() // This will create companies, users, jobs, posts, services, AND appointments
```

## Script Output

The script provides detailed console output showing:
- Progress for each user's appointments
- Summary statistics
- Any errors encountered
- Final appointment statistics including:
  - Total appointments created
  - Breakdown by status
  - Top users and companies by appointment count

## Files Created

- `app/utils/create_fake_appointments.ts` - Core appointment generation logic
- `create_fake_appointments_standalone.ts` - Standalone script for easy execution
- `create_test_data.ts` - Updated to include appointment creation in the full data generation process

## Functions Available

### Core Functions (from `create_fake_appointments.ts`)
- `createFakeAppointments()` - Creates fake appointments
- `deleteAllAppointments()` - Removes all appointments (cleanup)
- `getAppointmentStatistics()` - Shows appointment statistics

### Wrapper Functions (from `create_test_data.ts`)
- `createAppointmentsOnly()` - Creates only appointments
- `showAppointmentStatistics()` - Shows appointment statistics
- `cleanupAppointments()` - Cleanup all appointments
- `createAllFakeData()` - Creates all fake data including appointments

## Sample Data Generated

Each appointment includes:
```typescript
{
  companyId: "uuid-of-company",
  userId: "uuid-of-user", 
  date: "2024-01-15T00:00:00.000Z",
  time: "14:30",
  status: "confirmed", // pending, confirmed, cancelled, completed
  subject: "Consultation Request",
  content: "Hello, I would like to schedule a meeting with [Company Name]...",
  isRead: true // 70% chance of being read
}
```

## Notes

- The script respects existing data and won't create duplicate appointments for the same user-company combination on the same date/time
- Appointment statuses are intelligently assigned based on the appointment date
- All generated content is professional and realistic
- The script handles errors gracefully and provides detailed feedback
