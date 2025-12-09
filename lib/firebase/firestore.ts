import {
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteField,
  collection,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  Unsubscribe,
} from 'firebase/firestore';
import { firestore } from './config';
import { ChartReading, LogEntry } from '@/types';

/**
 * Subscribe to user devices in real-time
 */
export function subscribeToUserDevices(
  userId: string,
  onUpdate: (devices: Record<string, string>) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const userDocRef = doc(firestore, `user-data/${userId}`);

  return onSnapshot(
    userDocRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onUpdate({});
        return;
      }
      const userData = snapshot.data();
      const devices = userData?.devices || {};
      onUpdate(devices);
    },
    (error) => {
      onError(new Error(error.message || 'Failed to fetch devices'));
    }
  );
}

/**
 * Subscribe to a specific device's metadata in real-time
 */
export function subscribeToDeviceMetadata(
  itemId: string,
  onUpdate: (metadata: Record<string, unknown>) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const itemDocRef = doc(firestore, `item-data/${itemId}`);

  return onSnapshot(
    itemDocRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onUpdate({});
        return;
      }
      const metadata = snapshot.data();
      onUpdate(metadata);
    },
    (error) => {
      onError(new Error(error.message || 'Failed to fetch device metadata'));
    }
  );
}

/**
 * Subscribe to daily readings for a device
 */
export function subscribeToDailyReadings(
  itemId: string,
  maxResults: number,
  onUpdate: (readings: ChartReading[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const dailyRef = collection(firestore, `item-data/${itemId}/daily`);

  return onSnapshot(
    dailyRef,
    (snapshot) => {
      const readings: ChartReading[] = [];
      snapshot.docs.forEach((doc) => {
        readings.push({
          id: doc.id,
          ...doc.data(),
        } as ChartReading);
      });

      // Sort by document ID (timestamp) in descending order
      readings.sort((a, b) => {
        if (a.id > b.id) return -1;
        if (a.id < b.id) return 1;
        return 0;
      });

      // Limit to maxResults
      const limitedReadings = readings.slice(0, maxResults);

      // Reverse to get chronological order (oldest to newest)
      onUpdate(limitedReadings.reverse());
    },
    (error) => {
      onError(new Error(error.message || 'Failed to fetch daily readings'));
    }
  );
}

/**
 * Get device metadata
 */
export async function getDeviceMetadata(itemId: string) {
  const itemRef = doc(firestore, `item-data/${itemId}`);
  const snapshot = await getDoc(itemRef);

  if (!snapshot.exists()) {
    throw new Error('Device not found');
  }

  return snapshot.data();
}

/**
 * Add a new device for the user
 */
export async function addDevice(
  userId: string,
  itemId: string,
  customName: string
): Promise<void> {
  try {
    // Check if device exists
    const itemRef = doc(firestore, `item-data/${itemId}`);
    const itemSnapshot = await getDoc(itemRef);

    if (!itemSnapshot.exists()) {
      throw new Error('Device ID does not exist');
    }

    // Add device to user's devices map
    const userRef = doc(firestore, `user-data/${userId}`);
    await updateDoc(userRef, {
      [`devices.${itemId}`]: customName,
    });

    // Add user to device's user_ids array
    await updateDoc(itemRef, {
      user_ids: arrayUnion(userId),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add device';
    throw new Error(message);
  }
}

/**
 * Update device name for the user
 */
export async function updateDevice(
  userId: string,
  itemId: string,
  newName: string
): Promise<void> {
  try {
    const userRef = doc(firestore, `user-data/${userId}`);
    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
      throw new Error('User not found');
    }

    const userData = userSnapshot.data();
    if (!userData?.devices?.[itemId]) {
      throw new Error('Device not found in user devices');
    }

    await updateDoc(userRef, {
      [`devices.${itemId}`]: newName,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update device';
    throw new Error(message);
  }
}

/**
 * Delete a device from the user's list
 */
export async function deleteDevice(
  userId: string,
  itemId: string
): Promise<void> {
  try {
    // Remove from user's devices
    const userRef = doc(firestore, `user-data/${userId}`);
    await updateDoc(userRef, {
      [`devices.${itemId}`]: deleteField(),
    });

    // Remove user from device's user_ids array
    const itemRef = doc(firestore, `item-data/${itemId}`);
    await updateDoc(itemRef, {
      user_ids: arrayRemove(userId),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete device';
    throw new Error(message);
  }
}

/**
 * Set energy limit for a device
 */
export async function setEnergyLimit(
  itemId: string,
  limit: number
): Promise<void> {
  try {
    const itemRef = doc(firestore, `item-data/${itemId}`);
    await updateDoc(itemRef, {
      energyLimit: limit,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to set energy limit';
    throw new Error(message);
  }
}

/**
 * Toggle device on/off state
 */
export async function toggleDevice(
  itemId: string,
  newState: boolean
): Promise<void> {
  try {
    const itemRef = doc(firestore, `item-data/${itemId}`);
    await updateDoc(itemRef, {
      isOn: newState,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to toggle device';
    throw new Error(message);
  }
}

/**
 * Parse timestamp from log document ID
 * @param logId - Document ID in format: 20251209T122423
 */
function parseLogTimestamp(logId: string): Date {
  // Format: YYYYMMDDTHHmmss
  const year = parseInt(logId.substring(0, 4));
  const month = parseInt(logId.substring(4, 6)) - 1; // JS months are 0-indexed
  const day = parseInt(logId.substring(6, 8));
  const hour = parseInt(logId.substring(9, 11));
  const minute = parseInt(logId.substring(11, 13));
  const second = parseInt(logId.substring(13, 15));

  return new Date(year, month, day, hour, minute, second);
}

/**
 * Subscribe to logs for a device in real-time
 * @param itemId - Device ID
 * @param options - Filter options for date range
 * @param maxResults - Maximum number of logs to fetch (default: 100)
 * @param onUpdate - Callback with log entries
 * @param onError - Error callback
 */
export function subscribeToDeviceLogs(
  itemId: string,
  options: { startDate?: Date; endDate?: Date } = {},
  maxResults: number = 100,
  onUpdate: (logs: LogEntry[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const logsRef = collection(firestore, `item-data/${itemId}/logs`);

  return onSnapshot(
    logsRef,
    (snapshot) => {
      const logs: LogEntry[] = [];

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const timestamp = parseLogTimestamp(doc.id);

        // Apply date filtering
        if (options.startDate && timestamp < options.startDate) return;
        if (options.endDate && timestamp > options.endDate) return;

        logs.push({
          id: doc.id,
          title: data.title || '',
          content: data.content || '',
          timestamp,
          deviceId: itemId,
        });
      });

      // Sort by timestamp descending (newest first)
      logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      // Limit results
      const limitedLogs = logs.slice(0, maxResults);

      onUpdate(limitedLogs);
    },
    (error) => {
      onError(new Error(error.message || 'Failed to fetch device logs'));
    }
  );
}

/**
 * Get a specific log entry
 */
export async function getLogEntry(itemId: string, logId: string): Promise<LogEntry | null> {
  const logRef = doc(firestore, `item-data/${itemId}/logs/${logId}`);
  const snapshot = await getDoc(logRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();
  return {
    id: snapshot.id,
    title: data.title || '',
    content: data.content || '',
    timestamp: parseLogTimestamp(snapshot.id),
    deviceId: itemId,
  };
}

/**
 * Get logs surrounding a specific log entry (for context timeline)
 * @param itemId - Device ID
 * @param logId - Target log ID
 * @param contextCount - Number of logs before and after (default: 5)
 */
export async function getLogContext(
  itemId: string,
  logId: string,
  contextCount: number = 5
): Promise<{ before: LogEntry[]; target: LogEntry | null; after: LogEntry[] }> {
  const logsRef = collection(firestore, `item-data/${itemId}/logs`);

  // Get target log
  const target = await getLogEntry(itemId, logId);
  if (!target) {
    return { before: [], target: null, after: [] };
  }

  // Get all logs and filter manually (Firestore doesn't support reverse ordering well)
  const allLogsSnapshot = await getDocs(logsRef);
  const allLogs: LogEntry[] = [];

  allLogsSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    allLogs.push({
      id: doc.id,
      title: data.title || '',
      content: data.content || '',
      timestamp: parseLogTimestamp(doc.id),
      deviceId: itemId,
    });
  });

  // Sort chronologically
  allLogs.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  // Find target index
  const targetIndex = allLogs.findIndex(log => log.id === logId);

  const before = allLogs.slice(Math.max(0, targetIndex - contextCount), targetIndex);
  const after = allLogs.slice(targetIndex + 1, targetIndex + 1 + contextCount);

  return { before, target, after };
}
