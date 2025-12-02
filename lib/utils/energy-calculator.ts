import { ChartReading } from '@/types';
import { parseTimestampFromDocId } from './date-parser';

/**
 * Calculate current month energy consumption
 */
export function calculateCurrentMonthEnergy(readings: ChartReading[]): number {
  if (readings.length === 0) return 0;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Filter readings for current month
  const currentMonthReadings = readings.filter((reading) => {
    const date = parseTimestampFromDocId(reading.id);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  if (currentMonthReadings.length === 0) return 0;

  // Energy is cumulative, so get the difference between last and first reading of the month
  const firstReading = currentMonthReadings[0];
  const lastReading = currentMonthReadings[currentMonthReadings.length - 1];

  return Math.max(0, lastReading.energy - firstReading.energy);
}

/**
 * Calculate last month energy consumption
 */
export function calculateLastMonthEnergy(readings: ChartReading[]): number {
  if (readings.length === 0) return 0;

  const now = new Date();
  const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
  const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

  // Filter readings for last month
  const lastMonthReadings = readings.filter((reading) => {
    const date = parseTimestampFromDocId(reading.id);
    return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
  });

  if (lastMonthReadings.length === 0) return 0;

  // Energy is cumulative, so get the difference between last and first reading of the month
  const firstReading = lastMonthReadings[0];
  const lastReading = lastMonthReadings[lastMonthReadings.length - 1];

  return Math.max(0, lastReading.energy - firstReading.energy);
}

/**
 * Calculate total energy consumption
 */
export function calculateTotalEnergy(readings: ChartReading[]): number {
  if (readings.length === 0) return 0;

  // Total energy is the cumulative value from the latest reading
  const latestReading = readings[readings.length - 1];
  return latestReading.energy;
}

/**
 * Calculate average power factor
 */
export function calculateAveragePowerFactor(readings: ChartReading[]): number {
  if (readings.length === 0) return 0;

  const sum = readings.reduce((acc, reading) => acc + reading.power_factor, 0);
  return sum / readings.length;
}

/**
 * Get the latest reading for a device
 */
export function getLatestReading(readings: ChartReading[]): ChartReading | null {
  if (readings.length === 0) return null;
  return readings[readings.length - 1];
}

/**
 * Calculate energy consumption statistics
 */
export interface EnergyStats {
  currentMonth: number;
  lastMonth: number;
  total: number;
  averagePowerFactor: number;
  latestPower: number;
  latestVoltage: number;
  latestCurrent: number;
}

export function calculateEnergyStats(readings: ChartReading[]): EnergyStats {
  const latest = getLatestReading(readings);

  return {
    currentMonth: calculateCurrentMonthEnergy(readings),
    lastMonth: calculateLastMonthEnergy(readings),
    total: calculateTotalEnergy(readings),
    averagePowerFactor: calculateAveragePowerFactor(readings),
    latestPower: latest?.power || 0,
    latestVoltage: latest?.voltage || 0,
    latestCurrent: latest?.current || 0,
  };
}
