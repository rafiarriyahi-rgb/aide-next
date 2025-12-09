'use client';

import { useState, useEffect, useCallback } from 'react';
import { subscribeToDeviceLogs, getLogContext } from '@/lib/firebase/firestore';
import { LogEntry, LogsFilterOptions } from '@/types';

// Global cache for logs
const logsCache: {
  [deviceId: string]: LogEntry[];
} = {};

const activeSubscriptions: {
  [deviceId: string]: {
    unsubscribe: () => void;
    count: number;
  };
} = {};

/**
 * Hook to fetch and subscribe to device logs
 */
export function useLogs(deviceId: string | null, filterOptions: LogsFilterOptions = {}) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!deviceId) {
      return;
    }

    // Check if we have cached data
    if (logsCache[deviceId]) {
      const filtered = applyFilters(logsCache[deviceId], filterOptions);
      setLogs(filtered);
      setLoading(false);
    }

    // If there's already an active subscription, increment count
    if (activeSubscriptions[deviceId]) {
      activeSubscriptions[deviceId].count++;
      return () => {
        if (activeSubscriptions[deviceId]) {
          activeSubscriptions[deviceId].count--;
          if (activeSubscriptions[deviceId].count === 0) {
            activeSubscriptions[deviceId].unsubscribe();
            delete activeSubscriptions[deviceId];
            delete logsCache[deviceId];
          }
        }
      };
    }

    // Create new subscription
    const unsubscribe = subscribeToDeviceLogs(
      deviceId,
      {
        startDate: filterOptions.startDate,
        endDate: filterOptions.endDate,
      },
      100, // Max 100 logs
      (fetchedLogs) => {
        logsCache[deviceId] = fetchedLogs;
        setLogs(applyFilters(fetchedLogs, filterOptions));
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    // Store subscription
    activeSubscriptions[deviceId] = {
      unsubscribe,
      count: 1,
    };

    return () => {
      if (activeSubscriptions[deviceId]) {
        activeSubscriptions[deviceId].count--;
        if (activeSubscriptions[deviceId].count === 0) {
          activeSubscriptions[deviceId].unsubscribe();
          delete activeSubscriptions[deviceId];
          delete logsCache[deviceId];
        }
      }
    };
  }, [deviceId, filterOptions.startDate, filterOptions.endDate]);

  // Apply search filter when it changes
  useEffect(() => {
    if (deviceId && logsCache[deviceId]) {
      const filtered = applyFilters(logsCache[deviceId], filterOptions);
      setLogs(filtered);
    }
  }, [deviceId, filterOptions]);

  const refresh = useCallback(() => {
    if (deviceId && logsCache[deviceId]) {
      setLogs(applyFilters([...logsCache[deviceId]], filterOptions));
    }
  }, [deviceId, filterOptions]);

  return { logs, loading, error, refresh };
}

/**
 * Hook to fetch a single log with context
 */
export function useLogDetail(deviceId: string | null, logId: string | null) {
  const [logDetail, setLogDetail] = useState<{
    before: LogEntry[];
    target: LogEntry | null;
    after: LogEntry[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!deviceId || !logId) {
      return;
    }

    const fetchLogDetail = async () => {
      try {
        setLoading(true);
        const context = await getLogContext(deviceId, logId, 5);
        setLogDetail(context);
        setLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch log details';
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchLogDetail();
  }, [deviceId, logId]);

  return { logDetail, loading, error };
}

/**
 * Helper function to apply filters to logs
 */
function applyFilters(logs: LogEntry[], filters: LogsFilterOptions): LogEntry[] {
  let filtered = [...logs];

  // Apply search filter
  if (filters.searchQuery && filters.searchQuery.trim()) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (log) =>
        log.title.toLowerCase().includes(query) ||
        log.content.toLowerCase().includes(query)
    );
  }

  return filtered;
}
