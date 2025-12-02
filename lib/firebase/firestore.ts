import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';
import { ChartReading } from '@/types';

/**
 * Subscribe to user devices in real-time
 */
export function subscribeToUserDevices(
  userId: string,
  onUpdate: (devices: any) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const userDocRef = doc(db, 'user-data', userId);

  return onSnapshot(
    userDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.data();
        onUpdate(userData.devices || {});
      } else {
        onUpdate({});
      }
    },
    (error) => {
      onError(new Error(error.message || 'Failed to fetch devices'));
    }
  );
}

/**
 * Subscribe to daily readings for a device
 */
export function subscribeToDailyReadings(
  deviceId: string,
  maxResults: number,
  onUpdate: (readings: ChartReading[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const dailyCollectionRef = collection(db, 'item-data', deviceId, 'daily');
  const q = query(dailyCollectionRef, orderBy('timestamp', 'desc'), limit(maxResults));

  return onSnapshot(
    q,
    (snapshot) => {
      const readings: ChartReading[] = [];
      snapshot.forEach((doc) => {
        readings.push({
          id: doc.id,
          ...doc.data(),
        } as ChartReading);
      });
      onUpdate(readings.reverse()); // Reverse to get chronological order
    },
    (error) => {
      onError(new Error(error.message || 'Failed to fetch daily readings'));
    }
  );
}

/**
 * Subscribe to weekly readings for a device
 */
export function subscribeToWeeklyReadings(
  deviceId: string,
  maxResults: number,
  onUpdate: (readings: ChartReading[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const weeklyCollectionRef = collection(db, 'item-data', deviceId, 'weekly');
  const q = query(weeklyCollectionRef, orderBy('timestamp', 'desc'), limit(maxResults));

  return onSnapshot(
    q,
    (snapshot) => {
      const readings: ChartReading[] = [];
      snapshot.forEach((doc) => {
        readings.push({
          id: doc.id,
          ...doc.data(),
        } as ChartReading);
      });
      onUpdate(readings.reverse());
    },
    (error) => {
      onError(new Error(error.message || 'Failed to fetch weekly readings'));
    }
  );
}

/**
 * Subscribe to yearly readings for a device
 */
export function subscribeToYearlyReadings(
  deviceId: string,
  maxResults: number,
  onUpdate: (readings: ChartReading[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const yearlyCollectionRef = collection(db, 'item-data', deviceId, 'yearly');
  const q = query(yearlyCollectionRef, orderBy('timestamp', 'desc'), limit(maxResults));

  return onSnapshot(
    q,
    (snapshot) => {
      const readings: ChartReading[] = [];
      snapshot.forEach((doc) => {
        readings.push({
          id: doc.id,
          ...doc.data(),
        } as ChartReading);
      });
      onUpdate(readings.reverse());
    },
    (error) => {
      onError(new Error(error.message || 'Failed to fetch yearly readings'));
    }
  );
}

/**
 * Get device metadata
 */
export async function getDeviceMetadata(deviceId: string) {
  const deviceDocRef = doc(db, 'item-data', deviceId);
  const deviceDoc = await getDoc(deviceDocRef);

  if (!deviceDoc.exists()) {
    throw new Error('Device not found');
  }

  return deviceDoc.data();
}

/**
 * Add a new device for the user
 */
export async function addDevice(
  userId: string,
  deviceId: string,
  customName: string
): Promise<void> {
  try {
    // Check if device exists
    const deviceDocRef = doc(db, 'item-data', deviceId);
    const deviceDoc = await getDoc(deviceDocRef);

    if (!deviceDoc.exists()) {
      throw new Error('Device ID does not exist');
    }

    // Add device to user's device list
    const userDocRef = doc(db, 'user-data', userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    const devices = userData.devices || {};
    devices[deviceId] = customName;

    await updateDoc(userDocRef, { devices });

    // Add user to device's user_ids array
    const deviceData = deviceDoc.data();
    const userIds = deviceData.user_ids || [];
    if (!userIds.includes(userId)) {
      userIds.push(userId);
      await updateDoc(deviceDocRef, { user_ids: userIds });
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to add device');
  }
}

/**
 * Update device name for the user
 */
export async function updateDevice(
  userId: string,
  deviceId: string,
  newName: string
): Promise<void> {
  try {
    const userDocRef = doc(db, 'user-data', userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    const devices = userData.devices || {};

    if (!devices[deviceId]) {
      throw new Error('Device not found in user devices');
    }

    devices[deviceId] = newName;
    await updateDoc(userDocRef, { devices });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update device');
  }
}

/**
 * Delete a device from the user's list
 */
export async function deleteDevice(
  userId: string,
  deviceId: string
): Promise<void> {
  try {
    const userDocRef = doc(db, 'user-data', userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    const devices = userData.devices || {};

    if (!devices[deviceId]) {
      throw new Error('Device not found in user devices');
    }

    delete devices[deviceId];
    await updateDoc(userDocRef, { devices });

    // Remove user from device's user_ids array
    const deviceDocRef = doc(db, 'item-data', deviceId);
    const deviceDoc = await getDoc(deviceDocRef);

    if (deviceDoc.exists()) {
      const deviceData = deviceDoc.data();
      const userIds = deviceData.user_ids || [];
      const updatedUserIds = userIds.filter((id: string) => id !== userId);
      await updateDoc(deviceDocRef, { user_ids: updatedUserIds });
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to delete device');
  }
}

/**
 * Set energy limit for a device
 */
export async function setEnergyLimit(
  deviceId: string,
  limit: number
): Promise<void> {
  try {
    const deviceDocRef = doc(db, 'item-data', deviceId);
    await updateDoc(deviceDocRef, { energyLimit: limit });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to set energy limit');
  }
}

/**
 * Toggle device on/off state
 */
export async function toggleDevice(
  deviceId: string,
  newState: boolean
): Promise<void> {
  try {
    const deviceDocRef = doc(db, 'item-data', deviceId);
    await updateDoc(deviceDocRef, { isOn: newState });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to toggle device');
  }
}
