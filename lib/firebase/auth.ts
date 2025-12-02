import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './config';
import { UserProfile } from '@/types';

/**
 * Sign up a new user with email and password
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  username: string
): Promise<UserProfile> {
  try {
    // Create Firebase Auth account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create Firestore document for user
    const userDocRef = doc(db, 'user-data', user.uid);
    await setDoc(userDocRef, {
      email: email,
      username: username,
      devices: {},
    });

    return {
      userId: user.uid,
      email: email,
      username: username,
    };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign up');
  }
}

/**
 * Sign in an existing user with email and password
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<UserProfile> {
  try {
    // Authenticate with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Fetch user document from Firestore
    const userDocRef = doc(db, 'user-data', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      throw new Error('User profile not found');
    }

    const userData = userDoc.data();

    return {
      userId: user.uid,
      email: userData.email,
      username: userData.username,
    };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign in');
  }
}

/**
 * Sign out the current user
 */
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign out');
  }
}

/**
 * Get the current authenticated user
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}
