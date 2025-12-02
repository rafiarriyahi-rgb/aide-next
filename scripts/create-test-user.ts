/**
 * Script to create a test user for development
 * Run with: npx tsx scripts/create-test-user.ts
 */

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, set } from 'firebase/database';

// Load environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Test user credentials
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'test123456';
const TEST_USERNAME = 'testuser';

async function createTestUser() {
  try {
    console.log('🔥 Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getDatabase(app);

    console.log(`📧 Creating user: ${TEST_EMAIL}`);

    // Create Firebase Auth account
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      TEST_EMAIL,
      TEST_PASSWORD
    );
    const user = userCredential.user;

    console.log(`✅ Firebase Auth user created with UID: ${user.uid}`);

    // Create RTDB user profile
    const userRef = ref(db, `users/${user.uid}`);
    await set(userRef, {
      email: TEST_EMAIL,
      username: TEST_USERNAME,
      devices: {
        device_0: 'Living Room AC'
      },
    });

    console.log('✅ User profile created in RTDB');

    // Add user to device_0's user_ids
    const deviceUserRef = ref(db, `devices/device_0/user_ids/${user.uid}`);
    await set(deviceUserRef, true);

    console.log('✅ User linked to device_0');

    console.log('\n🎉 Test user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', TEST_EMAIL);
    console.log('🔑 Password:', TEST_PASSWORD);
    console.log('👤 Username:', TEST_USERNAME);
    console.log('🆔 UID:', user.uid);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\nYou can now login with these credentials!');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error creating test user:', error.message);

    if (error.code === 'auth/email-already-in-use') {
      console.log('\n💡 The test user already exists. You can login with:');
      console.log('📧 Email:', TEST_EMAIL);
      console.log('🔑 Password:', TEST_PASSWORD);
    } else if (error.code === 'auth/operation-not-allowed') {
      console.log('\n⚠️  Email/password authentication is not enabled in Firebase Console.');
      console.log('Please enable it at: https://console.firebase.google.com/');
      console.log('Go to: Authentication > Sign-in method > Email/Password > Enable');
    }

    process.exit(1);
  }
}

createTestUser();
