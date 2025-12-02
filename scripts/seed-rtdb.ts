import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, set } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Test users
const TEST_USERS = [
  { email: 'user1@test.com', password: 'Test123!', username: 'user1' },
  { email: 'user2@test.com', password: 'Test123!', username: 'user2' },
  { email: 'user3@test.com', password: 'Test123!', username: 'user3' },
];

// Device names
const DEVICE_NAMES = [
  'Living Room AC',
  'Kitchen Refrigerator',
  'Bedroom Heater',
  'Office Computer',
  'Washing Machine',
];

// Generate realistic sensor readings
function generateReading(baseValues: {
  voltage: number;
  current: number;
  frequency: number;
  power_factor: number;
}) {
  // Add some random variation
  const variation = (base: number, percent: number) => {
    return base + (Math.random() - 0.5) * 2 * base * percent;
  };

  const voltage = variation(baseValues.voltage, 0.02); // ±2%
  const current = variation(baseValues.current, 0.1); // ±10%
  const frequency = variation(baseValues.frequency, 0.01); // ±1%
  const power_factor = Math.min(
    1,
    Math.max(0.7, variation(baseValues.power_factor, 0.05))
  ); // ±5%, clamped

  const power = voltage * current * power_factor; // Watts

  return {
    voltage: parseFloat(voltage.toFixed(2)),
    current: parseFloat(current.toFixed(2)),
    frequency: parseFloat(frequency.toFixed(2)),
    power_factor: parseFloat(power_factor.toFixed(2)),
    power: parseFloat(power.toFixed(2)),
  };
}

// Format timestamp for RTDB key
function formatTimestamp(date: Date, includeTime: boolean = true): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  if (!includeTime) {
    return `${year}${month}${day}`;
  }

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

// Generate daily readings (288 readings for 24 hours, every 5 minutes)
async function generateDailyReadings(deviceId: string, baseValues: any) {
  const readings: any = {};
  const now = new Date();
  let cumulativeEnergy = Math.random() * 100; // Start with random base energy

  for (let i = 0; i < 288; i++) {
    const timestamp = new Date(now.getTime() - (288 - i) * 5 * 60 * 1000); // 5 minutes apart
    const reading = generateReading(baseValues);

    // Calculate energy increment (kWh)
    // energy = power (W) × time (hours) / 1000
    const energyIncrement = (reading.power * 5) / 60 / 1000; // 5 minutes in hours
    cumulativeEnergy += energyIncrement;

    readings[formatTimestamp(timestamp)] = {
      ...reading,
      energy: parseFloat(cumulativeEnergy.toFixed(3)),
      timestamp: timestamp.getTime(),
    };
  }

  await set(ref(db, `readings_daily/${deviceId}`), readings);
  console.log(`✓ Generated ${Object.keys(readings).length} daily readings for ${deviceId}`);
}

// Generate weekly readings (2016 readings for 7 days, every 5 minutes)
async function generateWeeklyReadings(deviceId: string, baseValues: any) {
  const readings: any = {};
  const now = new Date();
  let cumulativeEnergy = Math.random() * 500; // Start with random base energy

  for (let i = 0; i < 2016; i++) {
    const timestamp = new Date(now.getTime() - (2016 - i) * 5 * 60 * 1000);
    const reading = generateReading(baseValues);

    const energyIncrement = (reading.power * 5) / 60 / 1000;
    cumulativeEnergy += energyIncrement;

    readings[formatTimestamp(timestamp)] = {
      ...reading,
      energy: parseFloat(cumulativeEnergy.toFixed(3)),
      timestamp: timestamp.getTime(),
    };
  }

  await set(ref(db, `readings_weekly/${deviceId}`), readings);
  console.log(`✓ Generated ${Object.keys(readings).length} weekly readings for ${deviceId}`);
}

// Generate yearly readings (365 readings for 1 year, one per day)
async function generateYearlyReadings(deviceId: string, baseValues: any) {
  const readings: any = {};
  const now = new Date();
  let cumulativeEnergy = Math.random() * 2000; // Start with random base energy

  for (let i = 0; i < 365; i++) {
    const timestamp = new Date(now.getTime() - (365 - i) * 24 * 60 * 60 * 1000);
    const reading = generateReading(baseValues);

    // Daily energy (24 hours)
    const energyIncrement = (reading.power * 24) / 1000;
    cumulativeEnergy += energyIncrement;

    readings[formatTimestamp(timestamp, false)] = {
      ...reading,
      energy: parseFloat(cumulativeEnergy.toFixed(3)),
      timestamp: timestamp.getTime(),
    };
  }

  await set(ref(db, `readings_yearly/${deviceId}`), readings);
  console.log(`✓ Generated ${Object.keys(readings).length} yearly readings for ${deviceId}`);
}

// Main seeding function
async function seedDatabase() {
  console.log('🌱 Starting RTDB seed process...\n');

  try {
    for (const testUser of TEST_USERS) {
      console.log(`\n👤 Creating user: ${testUser.email}`);

      // Create user in Firebase Auth
      let userId: string;
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          testUser.email,
          testUser.password
        );
        userId = userCredential.user.uid;
        console.log(`✓ User created with ID: ${userId}`);
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          console.log(`⚠ User already exists, skipping...`);
          continue;
        }
        throw error;
      }

      // Create user profile in RTDB
      const userDevices: any = {};

      // Create 5 devices for each user
      for (let i = 0; i < 5; i++) {
        const deviceId = `device_${userId}_${i}`;
        const deviceName = DEVICE_NAMES[i];

        userDevices[deviceId] = deviceName;

        // Define base values for this device type
        const baseValues = {
          voltage: 220 + Math.random() * 10, // 220-230V
          current: 2 + Math.random() * 8, // 2-10A
          frequency: 50, // 50Hz
          power_factor: 0.85 + Math.random() * 0.1, // 0.85-0.95
        };

        // Create device metadata
        await set(ref(db, `devices/${deviceId}`), {
          isOn: Math.random() > 0.3, // 70% chance of being on
          energyLimit: Math.floor(Math.random() * 500) + 500, // 500-1000 kWh limit
          last_updated: Date.now(),
          user_ids: {
            [userId]: true,
          },
        });

        console.log(`  📱 Creating device: ${deviceName} (${deviceId})`);

        // Generate readings for this device
        await generateDailyReadings(deviceId, baseValues);
        await generateWeeklyReadings(deviceId, baseValues);
        await generateYearlyReadings(deviceId, baseValues);
      }

      // Create user document in RTDB
      await set(ref(db, `users/${userId}`), {
        email: testUser.email,
        username: testUser.username,
        devices: userDevices,
      });

      console.log(`✓ User profile created with ${Object.keys(userDevices).length} devices`);
    }

    console.log('\n\n✅ Seed process completed successfully!');
    console.log('\n📝 Test credentials:');
    TEST_USERS.forEach((user) => {
      console.log(`   ${user.email} / ${user.password}`);
    });
    console.log('');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run the seed script
seedDatabase()
  .then(() => {
    console.log('🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
