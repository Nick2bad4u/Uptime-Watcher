# SiteDetails Component Documentation

## Overview

The `SiteDetails` component is a comprehensive modal interface that provides detailed information about monitored sites in the Uptime Watcher application. It features a tabbed navigation system offering overview, analytics, history, and settings views for individual sites.

## Location & Structure

The SiteDetails component follows a modular architecture:

- **Main Component:** `src/components/SiteDetails/SiteDetails.tsx`
- **Header Component:** `src/components/SiteDetails/SiteDetailsHeader.tsx`
- **Navigation:** `src/components/SiteDetails/SiteDetailsNavigation.tsx`
- **Screenshot:** `src/components/SiteDetails/ScreenshotThumbnail.tsx`
- **Tab Components:** `src/components/SiteDetails/tabs/` (OverviewTab, AnalyticsTab, HistoryTab, SettingsTab)
- **Styles:** `src/components/SiteDetails/SiteDetails.css`
- **Index:** `src/components/SiteDetails/index.ts`

## Props Interface

```typescript
interface SiteDetailsProps {
 /** The site object to display details for */
 site: Site;
 /** Callback function to close the site details view */
 onClose: () => void;
}
```

## Key Dependencies

The component integrates with several Chart.js components and plugins:

- **Chart.js Components:** CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, TimeScale, Filler, DoughnutController, ArcElement
- **Chart.js Plugins:** zoomPlugin for interactive chart features
- **Chart.js Adapters:** chartjs-adapter-date-fns for time-based charts

## Architecture

### Main Component Structure

The `SiteDetails` component serves as the primary container that:

- Renders a modal overlay with backdrop functionality
- Uses the `useSiteDetails` custom hook for comprehensive state management
- Integrates with `ChartConfigService` for theme-aware chart configurations
- Manages Chart.js component registration and configuration
- Handles modal click-outside-to-close behavior

### Component Composition

1. **SiteDetailsHeader** - Displays site information, status, and close button
2. **SiteDetailsNavigation** - Provides tab navigation and monitoring controls
3. **Tab Components** - Renders content based on active tab selection
4. **ThemedBox** - Provides consistent theming and layout structure

## State Management

The component uses the `useSiteDetails` custom hook which provides comprehensive state management:

### Core State

- `currentSite` - The current site being displayed
- `selectedMonitor` - Currently selected monitor for the site
- `selectedMonitorId` - ID of the selected monitor
- `siteExists` - Boolean indicating if the site exists

### UI State

- `activeSiteDetailsTab` - Currently active tab ("overview", "analytics", "history", "settings")
- `isLoading` - Loading state for various operations
- `isRefreshing` - State indicating data refresh in progress
- `isMonitoring` - Boolean indicating if monitoring is active
- `showAdvancedMetrics` - Toggle for advanced analytics display
- `siteDetailsChartTimeRange` - Selected time range for charts ("1h", "24h", "7d", "30d")

### Form State

- `localName` - Local state for site name editing
- `localCheckInterval` - Local state for check interval editing
- `hasUnsavedChanges` - Boolean indicating unsaved changes
- `intervalChanged` - Boolean indicating interval has been modified

### Analytics State

- `analytics` - Comprehensive analytics data from `useSiteAnalytics` hook

### Event Handlers

- `handleCheckNow` - Triggers immediate site check
- `handleStartMonitoring` / `handleStopMonitoring` - Monitor control
- `handleSaveName` / `handleSaveInterval` - Save form changes
- `handleRemoveSite` - Site deletion
- `handleIntervalChange` / `handleMonitorIdChange` - Form updates
- `setActiveSiteDetailsTab` - Tab navigation
- `setSiteDetailsChartTimeRange` - Chart time range updates

## Chart Integration

The component integrates Chart.js through the `ChartConfigService` for consistent, theme-aware visualizations:

### Chart Configuration Service

```typescript
const chartConfig = useMemo(() => new ChartConfigService(currentTheme), [currentTheme]);
```

### Chart Types

- **Line Chart:** Response time over time with area fill
- **Bar Chart:** Up/down status distribution
- **Doughnut Chart:** Uptime/downtime percentage visualization

### Chart Data

Charts use analytics data processed through `useMemo` hooks:

```typescript
const lineChartData = useMemo(
 () => ({
  datasets: [
   {
    backgroundColor: currentTheme.colors.primary[500] + "20",
    borderColor: currentTheme.colors.primary[500],
    data: analytics.filteredHistory.map((h) => h.responseTime),
    fill: true,
    label: "Response Time (ms)",
    tension: 0.1,
   },
  ],
  labels: analytics.filteredHistory.map((h) => new Date(h.timestamp)),
 }),
 [analytics.filteredHistory, currentTheme]
);
```

## Tab System

The component renders different tabs based on `activeSiteDetailsTab` state:

### Overview Tab (`"overview"`)

- Displays basic site metrics and status information
- Shows uptime percentage and response time statistics
- Provides monitor selection and basic controls

### Analytics Tab (`${selectedMonitorId}-analytics`)

- Comprehensive charts and performance metrics
- Configurable time ranges and advanced metrics toggle
- Interactive charts with zoom and pan capabilities

### History Tab (`"history"`)

- Historical monitoring data display
- Detailed check history with timestamps and status

### Settings Tab (`"settings"`)

- Site configuration options
- Monitor settings and interval configuration
- Site management actions (delete, rename)

## Usage Example

```tsx
import { SiteDetails } from "./components/SiteDetails";

function Dashboard() {
 const [selectedSite, setSelectedSite] = useState<Site | null>(null);

 return (
  <div>
   {/* Site cards or list */}
   <SiteCard site={site} onClick={() => setSelectedSite(site)} />

   {/* Site details modal */}
   {selectedSite && <SiteDetails site={selectedSite} onClose={() => setSelectedSite(null)} />}
  </div>
 );
}
```

## Key Features

- **Modal Interface:** Fixed overlay with backdrop click-to-close functionality
- **Tabbed Navigation:** Organized content sections with smooth transitions
- **Real-time Data:** Live updates through analytics hooks and monitoring state
- **Interactive Charts:** Chart.js integration with zoom, pan, and theme awareness
- **Form Management:** Local state handling for editable fields with unsaved changes tracking
- **Responsive Design:** Adaptive layout for different screen sizes
- **Theme Integration:** Full support for light/dark themes through theming system
- **Performance Optimized:** Memoized chart configurations and efficient re-rendering

## Styling & CSS

### Modal Structure

The component uses a fixed overlay approach:

```css
.site-details-modal {
 position: fixed;
 inset: 0;
 z-index: 1000;
 display: flex;
 align-items: center;
 justify-content: center;
 padding: var(--spacing-md);
 background-color: var(--color-background-modal);
 backdrop-filter: blur(4px);
}
```

### Responsive Design

- Maximum width of 1200px for optimal reading
- Maximum height of 90vh to prevent viewport overflow
- Adaptive padding and spacing for mobile devices

### CSS Classes

- `.site-details-modal` - Main modal overlay
- `.site-details-content` - Modal content container with `animate-scale-in` animation
- `.site-details-header` - Header section with gradient background and hover effects
- Tab content uses `max-h-[70vh] overflow-y-auto` for scrollable areas

## Performance Considerations

### Memoization Strategy

- Chart configurations memoized with `useMemo` and dependency on theme changes
- Chart data memoized with dependencies on analytics and theme
- Chart config service instance memoized to prevent unnecessary recreations

### Conditional Rendering

- Component returns `undefined` if `siteExists` is false
- Tab content only renders when the specific tab is active
- Charts only initialize when their respective tabs are displayed

### Event Handling

- Click outside modal handled through event propagation stopping
- Form changes tracked locally to minimize unnecessary re-renders

## Integration Points

### Custom Hooks

- **`useSiteDetails`** - Primary state management hook providing all component functionality
- **`useSiteAnalytics`** - Analytics data processing and filtering
- **`useTheme`** - Theme context for consistent styling

### Services

- **`ChartConfigService`** - Centralized chart configuration management
- **Theme system** - Consistent theming across all components

### Component Dependencies

- **`ThemedBox`** - Themed container components for consistent UI
- **`SiteDetailsHeader`** - Site information and controls
- **`SiteDetailsNavigation`** - Tab navigation and monitoring controls
- **Tab components** - Specialized content components for each view

### External Libraries

- **Chart.js** - Data visualization with full theme integration
- **chartjs-plugin-zoom** - Interactive chart features
- **chartjs-adapter-date-fns** - Time-based chart axis formatting

## Technical Implementation Details

### Component Flow

1. Component receives `site` prop and `onClose` callback
2. `useSiteDetails` hook initializes with site data and provides comprehensive state
3. Chart.js components are registered and configured
4. Chart configurations created using `ChartConfigService` with current theme
5. Chart data computed from analytics with memoization
6. Conditional rendering based on `siteExists` state
7. Modal overlay renders with backdrop click-to-close behavior
8. Active tab content renders based on `activeSiteDetailsTab` state

### State Synchronization

- Local form state (name, interval) synchronized with global site data
- Unsaved changes tracking prevents data loss
- Real-time monitoring state updates reflected in UI
- Chart time range and advanced metrics preferences preserved

## Related Components

- **SiteCard** - Triggers SiteDetails modal from dashboard
- **SiteDetailsHeader** - Header section with site info and controls
- **SiteDetailsNavigation** - Tab navigation and monitoring controls
- **Tab components** - OverviewTab, AnalyticsTab, HistoryTab, SettingsTab
- **ScreenshotThumbnail** - Site preview image handling
