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

// Telegram Models
export interface TelegramChat {
  chatId: number;
  username?: string;
  firstName?: string;
  lastActive: number;
  addedAt: number;
}

export interface EnergyAlertData {
  deviceId: string;
  deviceName: string;
  currentEnergy: number;
  limit: number;
  timestamp: number;
  owners: string[];  // List of usernames/names
}

// Log Models
export interface LogEntry {
  id: string;              // Document ID (timestamp-based: 20251209T122423)
  title: string;           // e.g., "Event: Reboot (Exception/Panic)"
  content: string;         // Detailed log message
  timestamp: Date;         // Parsed from ID
  deviceId: string;        // Parent device ID
}

export interface LogsFilterOptions {
  startDate?: Date;
  endDate?: Date;
  searchQuery?: string;
}

export interface DeviceMetadata {
  id: string;
  name: string;
  isOn: boolean;
  energyLimit: number;
  last_updated?: any;
  user_ids?: string[];
}
