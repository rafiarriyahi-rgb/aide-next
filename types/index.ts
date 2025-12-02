import { Timestamp } from 'firebase/firestore';

// User Models
export interface UserProfile {
  userId: string;
  email: string;
  username: string;
}

// Device Models
export interface Device {
  id: string;              // Device unique identifier
  name: string;            // Custom user-defined name
  isOn: boolean;           // Power state
  user_id: string;         // Owner user ID
  energyLimit: number;     // Energy consumption limit
  last_updated: any;       // Last update timestamp
}

export interface FormData {
  itemname: string;        // Custom device name
  itemid: string;          // Device ID
}

// Reading Models
export interface DeviceReading {
  timestamp: string;
  voltage: number;
  current: number;
  frequency: number;
  power_factor: number;
  power: number;
  energy: number;          // Cumulative energy
}

export interface ChartReading {
  id: string;              // Timestamp-based document ID
  power: number;
  voltage: number;
  frequency: number;
  current: number;
  power_factor: number;
  energy: number;
}

export interface ChartDataPoint {
  name: string;            // Formatted timestamp
  power: number;
  voltage: number;
  frequency: number;
  current: number;
  powerFactor: number;
  timestamp: string;
  energy: number;
}

// Time ranges for charts
export type TimeRange = '24h' | '7d' | '1m' | '1y';

// Graph types for charts
export type GraphType = 'power' | 'voltage' | 'frequency' | 'current' | 'powerFactor' | 'energy';
