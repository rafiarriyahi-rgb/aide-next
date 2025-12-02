import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

// Generate realistic sensor readings
function generateReading(baseValues: {
  voltage: number;
  current: number;
  frequency: number;
  power_factor: number;
}) {
  const variation = (base: number, percent: number) => {
    return base + (Math.random() - 0.5) * 2 * base * percent;
  };

  const voltage = variation(baseValues.voltage, 0.02);
  const current = variation(baseValues.current, 0.1);
  const frequency = variation(baseValues.frequency, 0.01);
  const power_factor = Math.min(1, Math.max(0.7, variation(baseValues.power_factor, 0.05)));
  const power = voltage * current * power_factor;

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

function generateReadings(count: number, intervalMinutes: number, baseValues: any, dailyMode: boolean = true) {
  const readings: any = {};
  const now = new Date();
  let cumulativeEnergy = Math.random() * 100;

  for (let i = 0; i < count; i++) {
    const timestamp = dailyMode
      ? new Date(now.getTime() - (count - i) * intervalMinutes * 60 * 1000)
      : new Date(now.getTime() - (count - i) * 24 * 60 * 60 * 1000);

    const reading = generateReading(baseValues);
    const energyIncrement = dailyMode
      ? (reading.power * intervalMinutes) / 60 / 1000
      : (reading.power * 24) / 1000;
    cumulativeEnergy += energyIncrement;

    readings[formatTimestamp(timestamp, dailyMode)] = {
      ...reading,
      energy: parseFloat(cumulativeEnergy.toFixed(3)),
      timestamp: timestamp.getTime(),
    };
  }

  return readings;
}

function generateJSON() {
  console.log('🌱 Generating RTDB JSON file (1 user, 1 device)...\n');

  const outputDir = resolve(process.cwd(), 'rtdb-import');
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const userId = 'YOUR_FIREBASE_USER_ID';
  const deviceId = 'device_0';
  const deviceName = 'Living Room AC';

  console.log(`👤 User: test@example.com`);
  console.log(`📱 Device: ${deviceName} (${deviceId})\n`);

  const baseValues = {
    voltage: 220 + Math.random() * 10,
    current: 2 + Math.random() * 8,
    frequency: 50,
    power_factor: 0.85 + Math.random() * 0.1,
  };

  console.log('Generating readings...');
  const daily = generateReadings(288, 5, baseValues, true);
  console.log(`✓ Daily: ${Object.keys(daily).length} readings`);

  const weekly = generateReadings(2016, 5, baseValues, true);
  console.log(`✓ Weekly: ${Object.keys(weekly).length} readings`);

  const yearly = generateReadings(365, 0, baseValues, false);
  console.log(`✓ Yearly: ${Object.keys(yearly).length} readings\n`);

  const rtdbData = {
    users: {
      [userId]: {
        email: 'test@example.com',
        username: 'testuser',
        devices: {
          [deviceId]: deviceName,
        },
      },
    },
    devices: {
      [deviceId]: {
        isOn: true,
        energyLimit: 1000,
        last_updated: Date.now(),
        user_ids: {
          [userId]: true,
        },
      },
    },
    readings_daily: {
      [deviceId]: daily,
    },
    readings_weekly: {
      [deviceId]: weekly,
    },
    readings_yearly: {
      [deviceId]: yearly,
    },
  };

  console.log('📝 Writing JSON file...');
  writeFileSync(
    resolve(outputDir, 'rtdb-data.json'),
    JSON.stringify(rtdbData, null, 2),
    'utf-8'
  );

  console.log('✅ rtdb-data.json created!\n');
  console.log(`📁 Location: ${resolve(outputDir, 'rtdb-data.json')}`);
  console.log('\n📖 Import Instructions:');
  console.log('1. Create user in Firebase Auth: test@example.com / Test123!');
  console.log('2. Copy the UID and replace "YOUR_FIREBASE_USER_ID" in rtdb-data.json');
  console.log('3. Firebase Console → Realtime Database → Import JSON');
  console.log('4. Select rtdb-data.json and import to root (/)\n');
}

try {
  generateJSON();
  console.log('🎉 Done!');
} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}
