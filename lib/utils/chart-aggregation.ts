import { ChartReading, ChartDataPoint } from '@/types';
import { parseTimestampFromDocId, formatChartLabel } from './date-parser';

/**
 * Aggregate readings to hourly averages
 * Used for 7-day view (2016 readings → 168 hourly points)
 */
export function aggregateToHourlyAverages(readings: ChartReading[]): ChartReading[] {
  const hourlyGroups: { [key: string]: ChartReading[] } = {};

  // Group readings by hour
  readings.forEach((reading) => {
    const date = parseTimestampFromDocId(reading.id);
    const hourKey = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}${String(date.getHours()).padStart(2, '0')}`;

    if (!hourlyGroups[hourKey]) {
      hourlyGroups[hourKey] = [];
    }
    hourlyGroups[hourKey].push(reading);
  });

  // Calculate averages for each hour
  const aggregated: ChartReading[] = [];

  Object.keys(hourlyGroups).sort().forEach((hourKey) => {
    const group = hourlyGroups[hourKey];
    const count = group.length;

    // Average all parameters except energy
    const avgPower = group.reduce((sum, r) => sum + r.power, 0) / count;
    const avgVoltage = group.reduce((sum, r) => sum + r.voltage, 0) / count;
    const avgFrequency = group.reduce((sum, r) => sum + r.frequency, 0) / count;
    const avgCurrent = group.reduce((sum, r) => sum + r.current, 0) / count;
    const avgPowerFactor = group.reduce((sum, r) => sum + r.power_factor, 0) / count;

    // For energy, use the last reading's value (it's cumulative)
    const lastEnergy = group[group.length - 1].energy;

    aggregated.push({
      id: group[0].id, // Use first reading's ID for timestamp
      power: avgPower,
      voltage: avgVoltage,
      frequency: avgFrequency,
      current: avgCurrent,
      power_factor: avgPowerFactor,
      energy: lastEnergy,
    });
  });

  return aggregated;
}

/**
 * Aggregate readings to daily averages
 * Used for 1-month view (8640 readings → 30 daily points)
 */
export function aggregateToDailyAverages(readings: ChartReading[]): ChartReading[] {
  const dailyGroups: { [key: string]: ChartReading[] } = {};

  // Group readings by day
  readings.forEach((reading) => {
    const date = parseTimestampFromDocId(reading.id);
    const dayKey = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;

    if (!dailyGroups[dayKey]) {
      dailyGroups[dayKey] = [];
    }
    dailyGroups[dayKey].push(reading);
  });

  // Calculate averages for each day
  const aggregated: ChartReading[] = [];

  Object.keys(dailyGroups).sort().forEach((dayKey) => {
    const group = dailyGroups[dayKey];
    const count = group.length;

    // Average all parameters except energy
    const avgPower = group.reduce((sum, r) => sum + r.power, 0) / count;
    const avgVoltage = group.reduce((sum, r) => sum + r.voltage, 0) / count;
    const avgFrequency = group.reduce((sum, r) => sum + r.frequency, 0) / count;
    const avgCurrent = group.reduce((sum, r) => sum + r.current, 0) / count;
    const avgPowerFactor = group.reduce((sum, r) => sum + r.power_factor, 0) / count;

    // For energy, use the last reading's value (it's cumulative)
    const lastEnergy = group[group.length - 1].energy;

    aggregated.push({
      id: group[0].id, // Use first reading's ID for timestamp
      power: avgPower,
      voltage: avgVoltage,
      frequency: avgFrequency,
      current: avgCurrent,
      power_factor: avgPowerFactor,
      energy: lastEnergy,
    });
  });

  return aggregated;
}

/**
 * Transform chart readings to data points for visualization
 */
export function transformToChartData(
  readings: ChartReading[],
  timeRange: '24h' | '7d' | '1m' | '1y'
): ChartDataPoint[] {
  return readings.map((reading) => ({
    name: formatChartLabel(reading.id, timeRange),
    power: reading.power,
    voltage: reading.voltage,
    frequency: reading.frequency,
    current: reading.current,
    powerFactor: reading.power_factor,
    timestamp: reading.id,
    energy: reading.energy,
  }));
}

/**
 * Calculate energy consumption from readings
 * Energy is cumulative, so consumption = last - first
 */
export function calculateEnergyConsumption(readings: ChartReading[]): number {
  if (readings.length === 0) return 0;
  if (readings.length === 1) return readings[0].energy;

  const firstReading = readings[0];
  const lastReading = readings[readings.length - 1];

  return lastReading.energy - firstReading.energy;
}

/**
 * Calculate energy consumption per time period (for bar charts)
 */
export function calculateEnergyPerPeriod(readings: ChartReading[]): ChartDataPoint[] {
  if (readings.length === 0) return [];

  const result: ChartDataPoint[] = [];

  for (let i = 1; i < readings.length; i++) {
    const prevReading = readings[i - 1];
    const currReading = readings[i];

    const consumption = currReading.energy - prevReading.energy;

    result.push({
      name: formatChartLabel(currReading.id, '1m'), // Adjust based on time range
      power: currReading.power,
      voltage: currReading.voltage,
      frequency: currReading.frequency,
      current: currReading.current,
      powerFactor: currReading.power_factor,
      timestamp: currReading.id,
      energy: Math.max(0, consumption), // Ensure non-negative
    });
  }

  return result;
}
