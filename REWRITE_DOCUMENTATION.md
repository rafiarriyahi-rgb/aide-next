# AIDE Energy Monitor - Next.js + Tailwind Rewrite Documentation

## Table of Contents
1. [Application Overview](#application-overview)
2. [Current Tech Stack](#current-tech-stack)
3. [Firebase Configuration](#firebase-configuration)
4. [Database Schema](#database-schema)
5. [Data Models & Types](#data-models--types)
6. [Authentication Flow](#authentication-flow)
7. [Core Features & Pages](#core-features--pages)
8. [Component Architecture](#component-architecture)
9. [Data Flow & State Management](#data-flow--state-management)
10. [Styling System](#styling-system)
11. [Chart Visualizations](#chart-visualizations)
12. [Utilities & Business Logic](#utilities--business-logic)
13. [Migration Strategy](#migration-strategy)

---

## Application Overview

**Application Name:** AIDE (AI-Driven Energy Monitor)
**Purpose:** Real-time IoT energy monitoring dashboard for tracking electrical device consumption

**Main Functionality:**
- Multi-user device management with real-time data
- Live monitoring of electrical parameters (power, voltage, current, frequency, power factor)
- Historical data visualization with multiple time ranges (24h, 7d, 1m, 1y)
- Energy consumption tracking and limits
- Device on/off control
- Ranking and comparison across devices

---

## Current Tech Stack

### Framework & Core
- **React:** 19.2.0 with TypeScript 4.9.5
- **Build Tool:** Create React App (react-scripts 5.0.1)
- **Styling:** SASS/SCSS 1.93.2

### Backend & Database
- **Firebase:** 12.5.0
  - Firestore (NoSQL database)
  - Firebase Authentication (email/password)

### UI & Visualization
- **Charts:** Recharts 3.3.0
- **UI Components:** shadcn/ui (Next.js compatible components)
- **Icons:** Lucide React (for standard icons)
- **Custom Icons:** Custom SVG components for branded logos (appLogoWithText, AppIcon)

### State Management
- React Context API (UserContext)
- Custom hooks with global caching

### Routing
- Manual state-based routing (no React Router)
- Uses `activeItem` state to switch between pages

---

## Firebase Configuration

### Project Details
```typescript
const firebaseConfig = {
  apiKey: "AIzaSyDQMScg_4fbsEMaDTCSx0bv_lSijm3f5Lo",
  authDomain: "energy-monitor-67b43.firebaseapp.com",
  projectId: "energy-monitor-67b43",
  storageBucket: "energy-monitor-67b43.firebasestorage.app",
  messagingSenderId: "260444272867",
  appId: "1:260444272867:web:d73966a13f2ae8c9696dd6",
  measurementId: "G-JWTJTF24JJ"
};
```

**Services Used:**
- Firebase Authentication (`getAuth`)
- Firestore Database (`getFirestore`)

**Migration Note:** Move to environment variables in Next.js:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

---

## Database Schema

### Collection: `user-data`

**Document ID:** `{userId}` (Firebase Auth UID)

**Structure:**
```typescript
{
  email: string,                    // User email address
  username: string,                 // Display name
  devices: {                        // Map of device IDs to custom names
    [deviceId: string]: string      // e.g., "device001": "Living Room AC"
  }
}
```

### Collection: `item-data`

**Document ID:** `{deviceId}` (unique device identifier)

**Structure:**
```typescript
{
  isOn: boolean,                    // Device power state
  energyLimit: number,              // Energy consumption limit (kWh)
  last_updated: Timestamp,          // Last update timestamp
  user_ids: string[]                // Array of user IDs with access
}
```

#### Subcollection: `item-data/{deviceId}/daily`

**Document ID Format:** `"YYYYMMDDTHHmmss"` (e.g., `"20251030T074839"`)
**Update Frequency:** Every 15 minutes

**Structure:**
```typescript
{
  power: number,           // Instantaneous power (Watts)
  voltage: number,         // Voltage (Volts)
  frequency: number,       // Frequency (Hertz)
  current: number,         // Current (Amperes)
  power_factor: number,    // Power factor (0-1)
  energy: number,          // Cumulative energy (kWh)
  timestamp: string        // ISO timestamp
}
```

#### Subcollection: `item-data/{deviceId}/weekly`

**Document ID Format:** `"YYYYMMDDTHHmm"` (e.g., `"20251024T0943"`)
**Same fields as daily subcollection**

#### Subcollection: `item-data/{deviceId}/yearly`

**Document ID Format:** `"YYYYMMDD"` (e.g., `"20241101"`)
**Same fields as daily subcollection**

### Multi-tenant Architecture
- Devices can be shared across multiple users
- Each user has custom device names stored in their `user-data` document
- Device access controlled via `user_ids` array in `item-data`
- Soft delete: removing user association doesn't delete device data

---

## Data Models & Types

### User Models
```typescript
interface UserProfile {
  userId: string;
  email: string;
  username: string;
}
```

### Device Models
```typescript
interface Device {
  id: string;              // Device unique identifier
  name: string;            // Custom user-defined name
  isOn: boolean;           // Power state
  user_id: string;         // Owner user ID
  energyLimit: number;     // Energy consumption limit
  last_updated: any;       // Last update timestamp
}

interface FormData {
  itemname: string;        // Custom device name
  itemid: string;          // Device ID
}
```

### Reading Models
```typescript
interface DeviceReading {
  timestamp: string;
  voltage: number;
  current: number;
  frequency: number;
  power_factor: number;
  power: number;
  energy: number;          // Cumulative energy
}

interface ChartReading {
  id: string;              // Timestamp-based document ID
  power: number;
  voltage: number;
  frequency: number;
  current: number;
  power_factor: number;
  energy: number;
}

interface ChartDataPoint {
  name: string;            // Formatted timestamp
  power: number;
  voltage: number;
  frequency: number;
  current: number;
  powerFactor: number;
  timestamp: string;
  energy: number;
}
```

---

## Authentication Flow

### Sign Up
```typescript
// Function: signUpWithEmail(email, password, username)
1. Create Firebase Auth account with email/password
2. Get new user's UID
3. Create Firestore document at user-data/{uid}:
   {
     email: email,
     username: username,
     devices: {}
   }
4. Return UserProfile object

// Validation Rules:
- All fields required
- Password minimum 6 characters
- Password confirmation must match
```

### Sign In
```typescript
// Function: signInWithEmail(email, password)
1. Authenticate with Firebase Auth
2. Fetch user document from user-data/{uid}
3. Return UserProfile with merged data
```

### Sign Out
```typescript
// Function: signOutUser()
1. Call Firebase signOut()
2. Clear user session and cache
```

### Auth State Persistence
- Uses `onAuthStateChanged()` listener
- Auto-fetches user profile on authentication
- Persists user profile to localStorage
- Loading screen while checking auth state
- Redirects unauthenticated users to login

---

## Core Features & Pages

### 1. Home Dashboard (`/home`)

**Layout:**
- 2-column grid (auto-fit, minmax(600px, 1fr))
- HomeCard components in carousel format
- RankingCard below

**Features:**
- **Energy Distribution Cards:**
  - Current Monthly Energy (pie chart)
  - Last Monthly Energy (pie chart)
  - Total Energy (pie chart)
- **Device Rankings:**
  - Current Monthly ranking
  - Last Monthly ranking
  - Total Energy ranking
  - Power Factor ranking

**Data Sources:**
- Aggregated energy data from all user devices
- Monthly calculations from daily readings
- Total cumulative energy from latest readings

### 2. Analytics Page (`/analytic`)

**Layout:**
- Grid of AnalyticCard components (auto-fill, minmax(400px, 1fr))
- Add device button
- Filter/sort options

**Features:**
- **Per-Device Cards:**
  - 6 graph types (carousel):
    1. Power (W) - Line chart
    2. Voltage (V) - Line chart
    3. Frequency (Hz) - Line chart
    4. Current (A) - Line chart
    5. Power Factor - Line chart
    6. Energy Consumption (kWh) - Bar chart
  - Time range selector: 24h, 7d, 1m, 1y
  - On/Off toggle switch
  - Action buttons: Edit, Refresh, Set Limit, Delete
  - Latest readings info table
- **Expandable View:**
  - Full-screen modal with larger charts
  - Multiple time ranges
  - Statistics cards

**Actions:**
- Add device (by device ID)
- Rename device
- Set energy limit
- Toggle device on/off
- Delete device
- Refresh data

### 3. Account Page (`/account`)

**Features:**
- User profile information
- Email and username display
- Settings options
- Logout button

### 4. Authentication Pages

**Login Page (`/login`):**
- Email input
- Password input
- "Remember me" option
- Link to signup page
- Error message display

**Signup Page (`/signup`):**
- Email input
- Username input
- Password input
- Confirm password input
- Link to login page
- Error message display

---

## Component Architecture

### Navigation
**Navbar Component**
- Fixed sidebar (left side)
- Collapsible: 240px open, 70px closed
- Navigation items:
  - Home (icon + label)
  - Analytics (icon + label)
  - Account (icon + label)
- Active state highlighting
- Hover effects with background color
- Toggle button at bottom

### Dashboard Components

**HomeCard**
- Pie chart visualization (Recharts)
- 3 card types (carousel):
  - Current Monthly Energy
  - Last Monthly Energy
  - Total Energy
- Device breakdown with colors
- Custom tooltips
- Carousel indicators
- Max 5 slices (rest grouped as "Others")

**RankingCard**
- Scrollable device list
- 4 ranking types (carousel):
  - Current Monthly
  - Last Monthly
  - Total Energy
  - Power Factor
- Number badges (1st, 2nd, 3rd)
- Energy values display
- Custom scrollbar styling

### Analytics Components

**AnalyticCard**
- Compact device view
- 6 graph types (carousel with arrow navigation)
- Line/bar charts (Recharts)
- Toggle switch for on/off
- Action buttons row
- Latest readings table
- Loading states
- Error handling

**AnalyticCardExpanded**
- Full-screen modal overlay
- Larger charts (400px height)
- Time range tabs (24h, 1m, 1y)
- Graph type selector
- Statistics grid
- Close button

### Popup/Modal Components

**AddSystemPopup**
- Modal form overlay
- Device ID input
- Custom name input
- Submit/Cancel buttons
- Validation

**EditSystemPopup**
- Similar to Add popup
- Pre-filled device name
- Update functionality

**SetLimitPopup**
- Energy limit input
- Number validation
- Unit display (kWh)

**DeleteSystemConfirmation**
- Confirmation dialog
- Device name display
- Destructive action warning
- Confirm/Cancel buttons
- Shake animation on appear

---

## Data Flow & State Management

### Global State (React Context)
```typescript
// UserContext
interface UserContextType {
  user: User | null;                    // Firebase User
  userProfile: UserProfile | null;      // App user data
  loading: boolean;
  error: string | null;
  login: (email, password) => Promise<void>;
  signup: (email, password, username) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data) => Promise<void>;
}
```

### Custom Hooks

**useDevices()**
```typescript
// Returns: { devices, loading, error, addDevice, updateDevice,
//           deleteDevice, setEnergyLimit, toggleDevice }

// Features:
- Global subscription sharing (prevents duplicate Firebase listeners)
- Device list caching
- Real-time updates via Firestore onSnapshot
- Automatic cleanup
- Reference counting for subscriptions
```

**useChartData(deviceId, timeRange)**
```typescript
// Returns: { data, loading, refresh }

// Time Ranges:
- '24h': 288 readings (15-min intervals) from daily subcollection
- '7d': 2016 readings → aggregated to 168 hourly points
- '1m': 8640 readings → aggregated to 30 daily points
- '1y': 365 readings from yearly subcollection

// Features:
- Per-device, per-timeRange caching
- Subscription sharing
- Automatic aggregation
- Energy consumption calculation
```

**useAllDevicesChartData(devices)**
```typescript
// Returns: { devicesData, loading }
// Fetches chart data for all devices simultaneously
// Used for home dashboard pie charts
```

### Firebase Service Layer

**firebaseService.ts** - Database operations
```typescript
// Real-time Subscriptions
subscribeToUserDevices(onUpdate, onError) → Unsubscribe
subscribeToDailyReadings(deviceId, maxResults, onUpdate, onError) → Unsubscribe
subscribeToWeeklyReadings(deviceId, maxResults, onUpdate, onError) → Unsubscribe
subscribeToYearlyReadings(deviceId, maxResults, onUpdate, onError) → Unsubscribe

// Write Operations
addDevice(deviceId, customName) → Promise<void>
updateDevice(deviceId, newName) → Promise<void>
deleteDevice(deviceId) → Promise<void>
setEnergyLimit(deviceId, limit) → Promise<void>
toggleDevice(deviceId, newState) → Promise<void>
```

**authService.ts** - Authentication
```typescript
signUpWithEmail(email, password, username) → Promise<UserProfile>
signInWithEmail(email, password) → Promise<UserProfile>
signOutUser() → Promise<void>
getCurrentUser() → User | null
```

### Caching Strategy

**Device Cache:**
```typescript
let cachedDevices: Device[] | null = null;
let activeDeviceSubscription: Unsubscribe | null = null;
let subscriberCount = 0;
```

**Chart Data Cache:**
```typescript
const chartDataCache: {
  [deviceId: string]: {
    [timeRange: string]: ChartReading[]
  }
} = {};

const activeSubscriptions: {
  [deviceId: string]: {
    [timeRange: string]: Unsubscribe
  }
} = {};
```

### Real-time Update Flow
```
1. Component mounts → calls useDevices() or useChartData()
2. Hook checks cache → if exists, return cached data
3. If no cache → create Firestore listener (onSnapshot)
4. Data updates → Firebase triggers callback
5. Hook updates cache → notifies all subscribers
6. React re-renders components with new data
7. Component unmounts → decrement subscriber count
8. If count === 0 → cleanup subscription
```

---

## Styling System

### Color Palette

**Primary Colors:**
- Cyan/Blue: `#00E0FF`, `#4A90E2`, `#1ae6e6`
- Purple/Pink: `#FF6DDF`, `#9B51E0`, `#764ba2`, `#667eea`
- Success Green: `#10B981`, `#50C878`
- Warning Orange: `#FFB549`, `#F59E0B`
- Danger Red: `#FF6B6B`, `#EF4444`, `#f44336`, `#d32f2f`
- Yellow: `#fff200`

**Chart Colors:**
```typescript
['#4A90E2', '#50C878', '#FFB549', '#FF6B6B', '#9B51E0', '#94A3B8']
```

**Gradients:**
```css
/* Primary gradient (buttons, backgrounds) */
linear-gradient(135deg, #667eea 0%, #764ba2 100%)

/* Header border */
linear-gradient(to right, white, #00E0FF, #00E0FF, #FF6DDF, #FF6DDF, white)

/* Toggle button */
linear-gradient(135deg, #00E0FF, #4A90E2)

/* Submit button */
linear-gradient(135deg, #4A90E2, #9013FE)
```

**Neutral Colors:**
- Dark: `#1e293b`, `#334155`, `#475569`
- Medium: `#64748b`, `#94a3b8`
- Light: `#cbd5e1`, `#e2e8f0`, `#f1f5f9`, `#f8fafc`

### Tailwind Equivalents

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          cyan: '#00E0FF',
          blue: '#4A90E2',
          purple: '#9B51E0',
          pink: '#FF6DDF',
        },
        accent: {
          green: '#10B981',
          orange: '#FFB549',
          red: '#FF6B6B',
          yellow: '#fff200',
        },
        sidebar: '#1e293b',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-toggle': 'linear-gradient(135deg, #00E0FF, #4A90E2)',
        'gradient-submit': 'linear-gradient(135deg, #4A90E2, #9013FE)',
      },
    },
  },
}
```

### Typography

**Font Families:**
- Default: System fonts (Segoe UI, Roboto, etc.)
- Navbar: Poppins with letter-spacing: 3px
- Monospace: Courier New (for device IDs)

**Font Sizes:**
- Headings: text-2xl (2rem), text-3xl (1.75rem)
- Body: text-base (1rem), text-sm (0.875rem)
- Small: text-xs (0.75rem)

**Font Weights:**
- Regular: font-normal (400)
- Medium: font-semibold (600)
- Bold: font-bold (700)

### Spacing System
- Padding/Margin: 0.5rem, 1rem, 1.5rem, 2rem, 3rem increments
- Border radius: rounded-lg (8px), rounded-xl (12px), rounded-2xl (16px)

### Box Shadows
```css
shadow-sm:   0 1px 3px rgba(0,0,0,0.1)
shadow-md:   0 2px 8px rgba(0,0,0,0.05)
shadow-lg:   0 4px 12px rgba(0,0,0,0.1)
shadow-2xl:  0 20px 60px rgba(0,0,0,0.3)
```

### Animations

**Keyframes:**
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes shake {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
}
```

**Tailwind Classes:**
- `animate-fade-in`, `animate-slide-up`, `animate-spin`, `animate-shake`
- Hover: `hover:-translate-y-0.5`, `hover:scale-105`
- Transitions: `transition-all duration-200`, `transition-transform duration-300`

### Responsive Breakpoints
- Primary: `md:` (768px)
- Mobile adjustments: single columns, reduced padding, smaller fonts

---

## Chart Visualizations

### Library: Recharts 3.3.0

### Pie Chart (HomeCard)
```tsx
<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie
      data={pieData}
      cx="50%"
      cy="50%"
      outerRadius={100}
      innerRadius={60}        // Donut style
      fill="#8884d8"
      dataKey="value"
      label={false}
    >
      {pieData.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={entry.color} />
      ))}
    </Pie>
    <Tooltip content={<CustomTooltip />} />
    <Legend
      layout="vertical"
      align="right"
      verticalAlign="middle"
    />
  </PieChart>
</ResponsiveContainer>
```

**Data Format:**
```typescript
{
  name: string,      // Device name
  value: number,     // Energy consumption
  color: string      // Chart color
}
```

### Line Chart (Power, Voltage, etc.)
```tsx
<ResponsiveContainer width="100%" height={250}>
  <LineChart data={chartData}>
    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
    <XAxis
      dataKey="name"
      stroke="#64748b"
      interval="preserveStartEnd"
      minTickGap={30}
      style={{ fontSize: '0.75rem' }}
    />
    <YAxis
      stroke="#64748b"
      width={30}
      style={{ fontSize: '0.75rem' }}
    />
    <Tooltip
      contentStyle={{
        backgroundColor: '#1f2937',
        border: '1px solid #374151',
        borderRadius: '6px',
        color: 'white'
      }}
    />
    <Line
      type="monotone"
      dataKey="power"
      stroke="#4A90E2"
      strokeWidth={0.5}
      dot={{ r: 1 }}
      activeDot={{ r: 3 }}
    />
  </LineChart>
</ResponsiveContainer>
```

**Data Format:**
```typescript
{
  name: string,         // Formatted timestamp
  power: number,        // Y-axis value
  voltage: number,
  frequency: number,
  current: number,
  powerFactor: number,
  energy: number,
  timestamp: string
}
```

### Bar Chart (Energy Consumption)
```tsx
<ResponsiveContainer width="100%" height={250}>
  <BarChart data={energyData}>
    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
    <XAxis
      dataKey="name"
      stroke="#64748b"
      interval="preserveStartEnd"
      minTickGap={30}
    />
    <YAxis
      stroke="#64748b"
      width={30}
    />
    <Tooltip />
    <Bar
      dataKey="energy"
      fill="#4A90E2"
      radius={[8, 8, 0, 0]}    // Rounded top corners
    />
  </BarChart>
</ResponsiveContainer>
```

### Chart Configurations by Time Range

**24h View:**
- Data points: 288 (every 5 minutes)
- X-axis: Time labels (HH:mm format)
- Display: All data points

**7d View:**
- Raw: 2016 data points (5-min intervals × 7 days)
- Aggregated: 168 hourly averages
- X-axis: Date + time labels

**1m View:**
- Raw: 8640 data points (5-min intervals × 30 days)
- Aggregated: 30 daily averages
- X-axis: Date labels (MM/DD)

**1y View:**
- Data points: 365 (daily from yearly subcollection)
- X-axis: Month labels

---

## Utilities & Business Logic

### Date Parsing (`dateParser.ts`)

**Function: parseTimestampFromDocId(docId)**
```typescript
// Handles multiple formats:
// - "20251030T074839" (YYYYMMDDTHHmmss)
// - "20251024T0943" (YYYYMMDDTHHmm)
// - "20241101" (YYYYMMDD)

// Returns: Date object
```

**Function: formatTimestamp(docId)**
```typescript
// Returns: "10/30/2025, 7:48:39 AM"
```

**Function: formatTimeOnly(docId)**
```typescript
// Returns: "07:48" (HH:mm)
```

**Function: formatDateOnly(docId)**
```typescript
// Returns: "10/30/2025" (MM/DD/YYYY)
```

### Chart Aggregation (`chartAggregation.ts`)

**Function: aggregateToHourlyAverages(readings)**
```typescript
// Input: Array of 15-minute interval readings
// Output: Array of hourly averages

// Aggregation Logic:
- Groups readings by hour
- Averages: power, voltage, frequency, current, power_factor
- Energy: Uses last reading's cumulative value per hour
- Returns one data point per hour
```

**Function: aggregateToDailyAverages(readings)**
```typescript
// Input: Array of 15-minute interval readings
// Output: Array of daily averages

// Aggregation Logic:
- Groups readings by day
- Averages: power, voltage, frequency, current, power_factor
- Energy: Uses last reading's cumulative value per day
- Returns one data point per day
```

### Energy Calculation (`energyCalculator.ts`)

**Function: calculateEnergyConsumption(readings)**
```typescript
// Energy in Firestore is cumulative (total kWh)
// To get consumption for a period:
// consumption = latestReading.energy - firstReading.energy

// For bar charts:
// Daily consumption = energy[day] - energy[day-1]
```

**Monthly Energy Calculation:**
```typescript
// Get current month's readings
// Find first and last reading of month
// monthlyEnergy = lastReading.energy - firstReading.energy
```

**Total Energy:**
```typescript
// Simply use the latest reading's energy value
// (it's cumulative from device installation)
```

---

## UI Component Library Migration

### shadcn/ui Components to Use

The application will use shadcn/ui components instead of custom-built components:

**Form Components:**
- `<Input />` - For text inputs in login, signup, and popup forms
- `<Button />` - For all buttons (submit, cancel, action buttons)
- `<Label />` - For form labels

**Layout & Display:**
- `<Card />` - For HomeCard, RankingCard, AnalyticCard wrappers
- `<Dialog />` - For all popup modals (Add Device, Edit Device, Set Limit, Delete Confirmation)
- `<Tooltip />` - For chart tooltips and hover information
- `<Tabs />` - For time range selection (24h, 7d, 1m, 1y) and graph type selection
- `<Switch />` - For device on/off toggle

**Navigation:**
- `<ScrollArea />` - For RankingCard scrollable list

**Feedback:**
- `<Alert />` - For error messages and notifications

### Icon Migration Map

Replace custom SVG icons with Lucide React equivalents:

| Current Custom Icon | Lucide React Replacement | Import |
|---------------------|---------------------------|---------|
| `homeIcon` | `Home` | `import { Home } from 'lucide-react'` |
| `analyticsIcon` | `TrendingUp` or `LineChart` | `import { TrendingUp } from 'lucide-react'` |
| `accountIcon` | `User` | `import { User } from 'lucide-react'` |
| `menuIcon` | `Menu` | `import { Menu } from 'lucide-react'` |
| `editIcon` | `Pencil` | `import { Pencil } from 'lucide-react'` |
| `trashIcon` | `Trash2` | `import { Trash2 } from 'lucide-react'` |
| `refreshIcon` | `RefreshCw` | `import { RefreshCw } from 'lucide-react'` |
| `limitIcon` | `AlertTriangle` | `import { AlertTriangle } from 'lucide-react'` |

**Keep as Custom SVG Components:**
- `appLogoWithText` - Branded logo with text (used in header/navbar)
- `AppIcon` - App icon logo (used as favicon or brand mark)

These custom SVG components should be kept in `components/icons/custom-logos.tsx` with the same gradient styling.

### Custom Logo Components (Keep These)

**File: `components/icons/custom-logos.tsx`**

These two components use custom gradient SVGs and should be preserved exactly as-is:

1. **appLogoWithText** - Full logo with "Little Aide" text
   - Dimensions: 426.8 × 118.8 (or auto height based on size prop)
   - Uses cyan-to-pink gradient (`#00E0FF` → `#FF6DDF`)
   - Contains hexagonal icon + "Little Aide" text
   - Used in: Navbar, Header, Login/Signup pages

2. **AppIcon** - Icon only (no text)
   - Dimensions: 118.6 × 102.7 (or auto height based on size prop)
   - Same cyan-to-pink gradient
   - Hexagonal shape with electrical device icon inside
   - Used in: Favicon, mobile icons, brand marks

**Component Interface:**
```typescript
interface IconProps {
  size?: number | string;
  color?: string;  // Not used in logo (uses gradients)
  className?: string;
}
```

**Reference from current codebase:**
- Source: `E:\home\despro\aide-master\aide-master\src\assets\icons.tsx` (lines 164-287)
- These SVGs contain complex gradient definitions that define the brand identity

### Component Style Mapping

**Current Buttons → shadcn Button:**
```tsx
// Before (custom CSS)
<button className="submit-button">Submit</button>

// After (shadcn + Tailwind)
<Button className="bg-gradient-submit">Submit</Button>
```

**Current Popups → shadcn Dialog:**
```tsx
// Before (custom modal)
<div className="popup-overlay">
  <div className="popup-content">...</div>
</div>

// After (shadcn Dialog)
<Dialog>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>...</DialogTitle>
    </DialogHeader>
    ...
  </DialogContent>
</Dialog>
```

**Current Toggle → shadcn Switch:**
```tsx
// Before (custom toggle)
<div className="toggle-switch">
  <input type="checkbox" />
  <span className="slider"></span>
</div>

// After (shadcn Switch)
<Switch checked={isOn} onCheckedChange={handleToggle} />
```

---

## Migration Strategy

### Phase 1: Project Setup
1. Create Next.js 15 app with TypeScript
2. Install dependencies:
   - Firebase 12.5.0
   - Recharts 3.3.0
   - Tailwind CSS 4
   - shadcn/ui (via CLI: `npx shadcn@latest init`)
   - lucide-react (for icons)
   - date-fns (for date handling)
3. Configure Tailwind with custom colors and gradients
4. Set up Firebase environment variables
5. Install shadcn/ui components as needed:
   - Button, Input, Dialog, Card, Switch, Tooltip, Tabs, etc.

### Phase 2: Firebase Integration
1. Create `lib/firebase/config.ts` with Firebase initialization
2. Create `lib/firebase/firestore.ts` for database operations
3. Create `lib/firebase/auth.ts` for authentication
4. Implement same subscription and caching patterns

### Phase 3: Authentication
1. Create auth context provider
2. Implement login/signup pages
3. Set up middleware for protected routes
4. Add session persistence

### Phase 4: Core Pages
1. Create layout with sidebar navigation
2. Implement Home dashboard page
3. Implement Analytics page
4. Implement Account page

### Phase 5: Components
1. Build Navbar component with Tailwind
2. Create chart components (HomeCard, RankingCard) using Recharts
3. Build AnalyticCard and expanded view
4. Create modal/popup components using shadcn/ui Dialog
5. Create custom icon components (keep appLogoWithText and AppIcon as custom SVG)
6. Use Lucide React icons for standard UI icons:
   - Home icon → `<Home />` from lucide-react
   - Analytics icon → `<TrendingUp />` or `<LineChart />` from lucide-react
   - Account icon → `<User />` from lucide-react
   - Menu icon → `<Menu />` from lucide-react
   - Edit icon → `<Edit />` or `<Pencil />` from lucide-react
   - Trash icon → `<Trash2 />` from lucide-react
   - Refresh icon → `<RefreshCw />` from lucide-react
   - Limit icon → `<AlertTriangle />` from lucide-react

### Phase 6: State & Hooks
1. Implement custom hooks (useDevices, useChartData)
2. Set up caching layer
3. Add real-time listeners

### Phase 7: Utilities
1. Port date parsing functions
2. Port aggregation functions
3. Port energy calculation logic

### Phase 8: Styling
1. Convert all SCSS to Tailwind classes
2. Implement animations with Tailwind
3. Add responsive breakpoints
4. Test on multiple devices

### Phase 9: Testing & Optimization
1. Test real-time updates
2. Test multi-user scenarios
3. Optimize bundle size
4. Add loading states
5. Error handling

### Next.js Specific Considerations

**Routing:**
- Use App Router (`app/` directory)
- Pages: `/login`, `/signup`, `/home`, `/analytic`, `/account`
- Middleware for auth protection

**Server vs Client Components:**
- Auth context: Client component
- Chart components: Client component (Recharts)
- Firebase listeners: Client-side only
- Static pages: Can be server components

**Data Fetching:**
- Real-time: Use `onSnapshot` in client components
- Initial load: Can use server components with Firebase Admin SDK
- Caching: Use React Query or SWR for enhanced caching

**Environment Variables:**
- All Firebase config in `.env.local`
- Public variables prefixed with `NEXT_PUBLIC_`

**File Structure:**
```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── signup/page.tsx
├── (dashboard)/
│   ├── layout.tsx          # Sidebar layout
│   ├── home/page.tsx
│   ├── analytic/page.tsx
│   └── account/page.tsx
├── layout.tsx              # Root layout
└── page.tsx                # Redirect to /home

components/
├── navbar.tsx
├── home-card.tsx
├── ranking-card.tsx
├── analytic-card.tsx
├── analytic-card-expanded.tsx
└── modals/
    ├── add-device-modal.tsx
    ├── edit-device-modal.tsx
    ├── set-limit-modal.tsx
    └── delete-confirmation-modal.tsx

lib/
├── firebase/
│   ├── config.ts
│   ├── auth.ts
│   └── firestore.ts
├── hooks/
│   ├── use-devices.ts
│   ├── use-chart-data.ts
│   └── use-user.ts
└── utils/
    ├── date-parser.ts
    ├── chart-aggregation.ts
    └── energy-calculator.ts

contexts/
└── user-context.tsx

types/
└── index.ts
```

---

## Key Files to Reference During Migration

### Critical Files
1. `src/services/firebaseConfig.ts` - Firebase setup
2. `src/services/firebaseService.ts` - All Firestore operations
3. `src/services/authService.ts` - Auth functions
4. `src/contexts/UserContext.tsx` - Global state pattern
5. `src/hooks/useDevices.ts` - Device subscription logic
6. `src/hooks/useChartData.ts` - Chart data fetching
7. `src/types/interfaces.ts` - All TypeScript types

### UI Reference Files
8. `src/components/Navbar.tsx` + `Navbar.scss` - Navigation styling
9. `src/components/HomeCard.tsx` - Pie chart implementation
10. `src/components/AnalyticCard.tsx` - Line/bar charts
11. `src/pages/home.tsx` - Dashboard layout
12. `src/pages/analytic.tsx` - Analytics grid layout

### Utility Files
13. `src/utils/dateParser.ts` - Date formatting logic
14. `src/utils/chartAggregation.ts` - Data aggregation
15. `src/utils/energyCalculator.ts` - Energy calculations

---

## Testing Checklist

### Functionality
- [ ] User signup and login
- [ ] Session persistence
- [ ] Add device by ID
- [ ] Rename device
- [ ] Delete device
- [ ] Toggle device on/off
- [ ] Set energy limit
- [ ] Real-time data updates
- [ ] Chart time range switching
- [ ] Chart type carousel
- [ ] Home dashboard pie charts
- [ ] Device rankings
- [ ] Expanded chart modal
- [ ] Logout

### UI/UX
- [ ] Responsive on mobile
- [ ] Smooth animations
- [ ] Loading states
- [ ] Error messages
- [ ] Hover effects
- [ ] Toggle switch styling
- [ ] Modal overlays
- [ ] Carousel indicators
- [ ] Sidebar collapse/expand

### Performance
- [ ] Firebase subscription cleanup
- [ ] No duplicate listeners
- [ ] Proper caching
- [ ] Fast initial load
- [ ] Smooth chart rendering
- [ ] Efficient aggregation

---

## End of Documentation

This document contains all the information needed to rewrite the AIDE Energy Monitor application in Next.js + Tailwind CSS while maintaining the same functionality, styling, and Firebase integration.