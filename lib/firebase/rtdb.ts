import {
  ref,
  get,
  set,
  remove,
  onValue,
  query,
  orderByKey,
  limitToLast,
  off,
} from 'firebase/database';
import { db } from './config';
import { ChartReading } from '@/types';

/**
 * Subscribe to user devices in real-time
 */
export function subscribeToUserDevices(
  userId: string,
  onUpdate: (devices: any) => void,
  onError: (error: Error) => void
): () => void {
  const userDevicesRef = ref(db, `users/${userId}/devices`);

  const unsubscribe = onValue(
    userDevicesRef,
    (snapshot) => {
      const devices = snapshot.val() || {};
      onUpdate(devices);
    },
    (error) => {
      onError(new Error(error.message || 'Failed to fetch devices'));
    }
  );

  // Return cleanup function
  return () => off(userDevicesRef);
}

/**
 * Subscribe to daily readings for a device
 */
export function subscribeToDailyReadings(
  deviceId: string,
  maxResults: number,
  onUpdate: (readings: ChartReading[]) => void,
  onError: (error: Error) => void
): () => void {
  const readingsRef = ref(db, `readings_daily/${deviceId}`);
  const readingsQuery = query(
    readingsRef,
    orderByKey(),
    limitToLast(maxResults)
  );

  const unsubscribe = onValue(
    readingsQuery,
    (snapshot) => {
      const readings: ChartReading[] = [];
      snapshot.forEach((childSnapshot) => {
        readings.push({
          id: childSnapshot.key as string,
          ...childSnapshot.val(),
        });
      });
      // Data is already in chronological order with limitToLast + orderByKey
      onUpdate(readings);
    },
    (error) => {
      onError(new Error(error.message || 'Failed to fetch daily readings'));
    }
  );

  return () => off(readingsQuery);
}

/**
 * Subscribe to weekly readings for a device
 */
export function subscribeToWeeklyReadings(
  deviceId: string,
  maxResults: number,
  onUpdate: (readings: ChartReading[]) => void,
  onError: (error: Error) => void
): () => void {
  const readingsRef = ref(db, `readings_weekly/${deviceId}`);
  const readingsQuery = query(
    readingsRef,
    orderByKey(),
    limitToLast(maxResults)
  );

  const unsubscribe = onValue(
    readingsQuery,
    (snapshot) => {
      const readings: ChartReading[] = [];
      snapshot.forEach((childSnapshot) => {
        readings.push({
          id: childSnapshot.key as string,
          ...childSnapshot.val(),
        });
      });
      onUpdate(readings);
    },
    (error) => {
      onError(new Error(error.message || 'Failed to fetch weekly readings'));
    }
  );

  return () => off(readingsQuery);
}

/**
 * Subscribe to yearly readings for a device
 */
export function subscribeToYearlyReadings(
  deviceId: string,
  maxResults: number,
  onUpdate: (readings: ChartReading[]) => void,
  onError: (error: Error) => void
): () => void {
  const readingsRef = ref(db, `readings_yearly/${deviceId}`);
  const readingsQuery = query(
    readingsRef,
    orderByKey(),
    limitToLast(maxResults)
  );

  const unsubscribe = onValue(
    readingsQuery,
    (snapshot) => {
      const readings: ChartReading[] = [];
      snapshot.forEach((childSnapshot) => {
        readings.push({
          id: childSnapshot.key as string,
          ...childSnapshot.val(),
        });
      });
      onUpdate(readings);
    },
    (error) => {
      onError(new Error(error.message || 'Failed to fetch yearly readings'));
    }
  );

  return () => off(readingsQuery);
}

/**
 * Get device metadata
 */
export async function getDeviceMetadata(deviceId: string) {
  const deviceRef = ref(db, `devices/${deviceId}`);
  const snapshot = await get(deviceRef);

  if (!snapshot.exists()) {
    throw new Error('Device not found');
  }

  return snapshot.val();
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
    const deviceRef = ref(db, `devices/${deviceId}`);
    const deviceSnapshot = await get(deviceRef);

    if (!deviceSnapshot.exists()) {
      throw new Error('Device ID does not exist');
    }

    // Add device to user's list
    const userDeviceRef = ref(db, `users/${userId}/devices/${deviceId}`);
    await set(userDeviceRef, customName);

    // Add user to device's user_ids
    const deviceUserRef = ref(db, `devices/${deviceId}/user_ids/${userId}`);
    await set(deviceUserRef, true);
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
    const userDeviceRef = ref(db, `users/${userId}/devices/${deviceId}`);
    const snapshot = await get(userDeviceRef);

    if (!snapshot.exists()) {
      throw new Error('Device not found in user devices');
    }

    await set(userDeviceRef, newName);
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
    // Remove from user's devices
    const userDeviceRef = ref(db, `users/${userId}/devices/${deviceId}`);
    await remove(userDeviceRef);

    // Remove user from device's user_ids
    const deviceUserRef = ref(db, `devices/${deviceId}/user_ids/${userId}`);
    await remove(deviceUserRef);
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
    const energyLimitRef = ref(db, `devices/${deviceId}/energyLimit`);
    await set(energyLimitRef, limit);
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
    const isOnRef = ref(db, `devices/${deviceId}/isOn`);
    await set(isOnRef, newState);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to toggle device');
  }
}
