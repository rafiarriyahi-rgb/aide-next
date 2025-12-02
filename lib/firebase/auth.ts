import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
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

    // Create RTDB document for user
    const userRef = ref(db, `users/${user.uid}`);
    await set(userRef, {
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
    // Provide more specific error messages
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('An account with this email already exists. Please sign in instead.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email format. Please check your email.');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password is too weak. Please use at least 6 characters.');
    } else if (error.code === 'auth/operation-not-allowed') {
      throw new Error('Email/password accounts are not enabled. Contact support.');
    }
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

    // Fetch user document from RTDB
    const userRef = ref(db, `users/${user.uid}`);
    const userSnapshot = await get(userRef);

    if (!userSnapshot.exists()) {
      throw new Error('User profile not found');
    }

    const userData = userSnapshot.val();

    return {
      userId: user.uid,
      email: userData.email,
      username: userData.username,
    };
  } catch (error: any) {
    // Provide more specific error messages
    if (error.code === 'auth/invalid-credential') {
      throw new Error('Invalid email or password. Please check your credentials.');
    } else if (error.code === 'auth/user-not-found') {
      throw new Error('No account found with this email. Please sign up first.');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password. Please try again.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email format. Please check your email.');
    } else if (error.code === 'auth/user-disabled') {
      throw new Error('This account has been disabled. Contact support.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed login attempts. Please try again later.');
    }
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
