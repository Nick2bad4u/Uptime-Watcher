# SiteDetails Tab Components Documentation

## Overview

The SiteDetails modal includes several specialized tab components that provide different views of site monitoring data. Each tab focuses on specific aspects of site monitoring: overview statistics, historical data, analytics, and configuration settings.

---

## Component Hierarchy

```text
SiteDetails (main modal)
├── SiteDetailsHeader
├── SiteDetailsNavigation (tab navigation & controls)
├── Tab Content
│   ├── OverviewTab
│   ├── HistoryTab  
│   ├── AnalyticsTab (when monitor has analytics data)
│   └── SettingsTab
└── ScreenshotThumbnail (integrated in header)
```

---

## OverviewTab Component

### Location & Files

- **Component:** `src/components/SiteDetails/tabs/OverviewTab.tsx`
- **Purpose**: Displays key site metrics, statistics, and primary actions

### Props Interface

```typescript
interface OverviewTabProps {
    avgResponseTime: number;
    fastestResponse: number;
    formatResponseTime: (time: number) => string;
    handleRemoveSite: () => Promise<void>;
    isLoading: boolean;
    selectedMonitor: Monitor;
    slowestResponse: number;
    totalChecks: number;
    uptime: string;
}
```

### Key Features

#### Performance Metrics Display

- **Response Time Statistics**: Average, fastest, and slowest response times
- **Uptime Percentage**: Visual uptime display with color coding and progress bar
- **Check Count**: Total number of monitoring checks performed
- **Status Indicator**: Monitor status with visual indicator
- **Theme-aware Colors**: Availability-based coloring for metrics

#### Statistics Cards

The OverviewTab uses a card-based layout for metrics in a 2x2 grid (4 cards total):

```typescript
// Four main metric cards with icons and themed styling
1. Status Card - Shows monitor status with StatusIndicator
2. Uptime Card - Progress bar and badge with percentage
3. Response Time Card - Average response time display
4. Total Checks Card - Count of total monitoring checks

// Performance Overview Card - Additional metrics
- Fastest Response with success badge
- Slowest Response with warning badge

// Quick Actions Card - Site management
- Remove Site button with confirmation
```

#### Site Management Actions

- **Remove Site**: Destructive action with confirmation
- **Loading States**: Progress indicators during operations
- **Error Handling**: User feedback for failed operations

### Visual Components

- **ThemedCard**: Grid layout for metrics with icon, title, and hoverable states
- **StatusIndicator**: Large status display with text
- **ThemedProgress**: Uptime visualization with theme-aware colors and labels
- **ThemedBadge**: Colored badges for uptime percentage and performance metrics
- **Action Buttons**: Remove site button with trash icon and loading states
- **Icons**: React Icons (MdSpeed, MdAccessTime, etc.) for visual enhancement

---

## HistoryTab Component

### HistoryTab Location & Files

- **Component:** `src/components/SiteDetails/tabs/HistoryTab.tsx`
- **Purpose**: Displays comprehensive historical monitoring data

### HistoryTab Features

#### Historical Data Visualization

- **Paginated History List**: Scrollable list of check records with timestamps
- **Status Filtering**: Filter by all, up, or down status with button controls
- **Configurable Display Limits**: Dropdown to show 10, 25, 50, 100+ records
- **Detailed Records**: Each record shows timestamp, status, response time, and check number
- **Monitor Type Details**: Shows response codes for HTTP, port info for port monitors

#### Data Analysis

- **Status Analysis**: Filter and count up/down status records
- **Check Numbering**: Sequential numbering of checks for reference
- **Response Time Display**: Formatted response times with units
- **User Action Logging**: Tracks filter changes and display limit modifications

### Implementation Patterns

```typescript
// Historical data filtering and display
const filteredHistoryRecords = (selectedMonitor.history || [])
    .filter((record: StatusHistory) => historyFilter === "all" || record.status === historyFilter)
    .slice(0, historyLimit);

// Status filter controls with logging
<div className="flex space-x-1">
    {(["all", "up", "down"] as const).map((filter) => (
        <ThemedButton
            key={filter}
            variant={historyFilter === filter ? "primary" : "ghost"}
            size="xs"
            onClick={() => {
                setHistoryFilter(filter);
                logger.user.action("History filter changed", { filter, monitorId, monitorType });
            }}
        >
            {filter === "all" ? "All" : filter === "up" ? "✅ Up" : "❌ Down"}
        </ThemedButton>
    ))}
</div>
```

---

## AnalyticsTab Component

### AnalyticsTab Location & Files

- **Component:** `src/components/SiteDetails/tabs/AnalyticsTab.tsx`
- **Purpose**: Advanced analytics and insights for monitoring data

### AnalyticsTab Features

#### Advanced Metrics

- **Availability Summary**: Large percentage display with availability rating
- **Response Time Analysis**: Average response times (HTTP/Port monitors only)
- **Downtime Tracking**: Total downtime and incident count
- **Performance Percentiles**: P50, P95, P99 response time percentiles
- **Interactive Charts**: Line, bar, and doughnut charts with Chart.js

#### Visualization Components

- **Chart.js Integration**: Line charts for response time trends, bar charts for up/down counts
- **Metric Summary Cards**: 3-column grid with availability, response time, and downtime
- **Advanced Metrics Toggle**: Show/hide detailed percentile and MTTR data
- **Responsive Charts**: Chart sizing adapts to container and time range

### Analytics Features

```typescript
// Analytics summary display with conditional rendering
{(monitorType === "http" || monitorType === "port") && (
    <ThemedBox surface="base" padding="lg" border rounded="lg">
        <ThemedText size="sm" variant="secondary">
            Avg Response Time
        </ThemedText>
        <ThemedText size="3xl" weight="bold">
            {formatResponseTime(avgResponseTime)}
        </ThemedText>
    </ThemedBox>
)}

// Advanced metrics toggle
<ThemedButton
    variant="ghost"
    size="sm"
    onClick={() => {
        setShowAdvancedMetrics(!showAdvancedMetrics);
        logger.user.action("Advanced metrics toggled", { shown: !showAdvancedMetrics });
    }}
>
    {showAdvancedMetrics ? "Hide" : "Show"} Advanced Metrics
</ThemedButton>
```

---

## SettingsTab Component

### SettingsTab Location & Files

- **Component:** `src/components/SiteDetails/tabs/SettingsTab.tsx`
- **Purpose**: Site-specific configuration and monitoring settings

### SettingsTab Features

#### Site Configuration

- **Site Name Editing**: Editable site name with save/validation
- **Monitor Information**: Display of monitor type, URL/host details
- **Check Interval**: Adjustable monitoring frequency from predefined options
- **Unsaved Changes Tracking**: Visual indicators for pending changes

#### Site Management

- **Site Removal**: Destructive action with confirmation and logging
- **Settings Persistence**: Save name and interval changes separately
- **Monitor Status Display**: Current monitor configuration and status
- **Change Detection**: Tracks local vs. saved state for both name and interval

### Configuration Interface

```typescript
interface SettingsTabProps {
    site: Site;
    onUpdateSite: (updates: Partial<Site>) => Promise<void>;
    onUpdateMonitor: (monitorId: string, updates: Partial<Monitor>) => Promise<void>;
    isLoading: boolean;
}

// Settings form with real-time updates
<FormField
    id="check-interval"
    label="Check Interval"
    helpText="How frequently to check this site"
>
    <ThemedSelect
        value={monitor.interval}
        onChange={(e) => handleIntervalChange(e.target.value)}
        options={intervalOptions}
    />
</FormField>
```

---

## Supporting Components

### SiteDetailsHeader Component

#### SiteDetailsHeader Location & Files

- **Component:** `src/components/SiteDetails/SiteDetailsHeader.tsx`

#### SiteDetailsHeader Features

- **Site Title**: Prominent site name display with truncation
- **URL Display**: Clickable URL for HTTP monitors (opens externally)
- **Status Indicator**: Large status display with loading spinner during refresh
- **Screenshot Integration**: Embedded ScreenshotThumbnail component
- **Gradient Header**: Styled header with overlay and accent bar

### SiteDetailsNavigation Component

#### SiteDetailsNavigation Location & Files

- **Component:** `src/components/SiteDetails/SiteDetailsNavigation.tsx`

#### SiteDetailsNavigation Features

- **Tab Navigation**: Switch between Overview, History, Analytics (monitor-specific), and Settings
- **Monitor Controls**: Start/Stop monitoring, Check Now buttons
- **Monitor Selection**: Dropdown for multi-monitor sites
- **Interval Configuration**: Check interval selector with save functionality
- **Chart Time Range**: Time range selection for analytics charts
- **User Action Logging**: Comprehensive logging of all navigation and control actions

#### Navigation Implementation

```typescript
// Tab rendering with conditional analytics tab
{activeSiteDetailsTab === "overview" && <OverviewTab {...props} />}
{activeSiteDetailsTab === `${selectedMonitorId}-analytics` && <AnalyticsTab {...props} />}
{activeSiteDetailsTab === "history" && <HistoryTab {...props} />}
{activeSiteDetailsTab === "settings" && <SettingsTab {...props} />}

// Monitor-specific analytics tab ID
const analyticsTabId = `${selectedMonitorId}-analytics`;
```

### ScreenshotThumbnail Component

#### ScreenshotThumbnail Location & Files

- **Component:** `src/components/SiteDetails/ScreenshotThumbnail.tsx`

#### ScreenshotThumbnail Features

- **Microlink API Integration**: Generates screenshots using Microlink service
- **Hover Preview**: Expandable preview overlay with portal rendering
- **External URL Opening**: Handles both Electron and browser contexts
- **Viewport Positioning**: Smart positioning to keep preview within viewport bounds
- **Theme Awareness**: Adapts to current theme for overlay styling

---

## Integration Patterns

### Tab State Management

```typescript
// Tab state management with useSiteDetails hook
const { activeSiteDetailsTab, setActiveSiteDetailsTab } = useSiteDetails({ site });

// Conditional tab content rendering based on active tab
const renderTabContent = () => {
    switch (activeSiteDetailsTab) {
        case 'overview':
            return <OverviewTab {...overviewProps} />;
        case `${selectedMonitorId}-analytics`:
            return <AnalyticsTab {...analyticsProps} />;
        case 'history':
            return <HistoryTab {...historyProps} />;
        case 'settings':
            return <SettingsTab {...settingsProps} />;
        default:
            return <OverviewTab {...overviewProps} />;
    }
};
```

### Data Flow

- **useSiteDetails Hook**: Central hook manages all state and provides data to tabs
- **Props Down**: Data flows from SiteDetails through tab props
- **Events Up**: User actions bubble up through event handlers with logging
- **Chart Configuration**: ChartConfigService provides theme-aware chart configurations
- **Loading Coordination**: Loading states coordinated across tabs and navigation

---

## Performance Considerations

### Tab Optimization

- **Conditional Rendering**: Tab content rendered only when active
- **Chart.js Optimization**: Chart configurations memoized with theme changes
- **User Action Logging**: Comprehensive logging prevents duplicate actions
- **State Persistence**: Tab state persisted in global store

### Memory Management

```typescript
// Chart configuration memoization
const chartConfig = useMemo(() => new ChartConfigService(currentTheme), [currentTheme]);
const lineChartOptions = useMemo(() => chartConfig.getLineChartConfig(), [chartConfig]);

// Chart data memoization
const lineChartData = useMemo(() => ({
    datasets: [{
        data: analytics.filteredHistory.map((h) => h.responseTime),
        // ... other config
    }],
    labels: analytics.filteredHistory.map((h) => new Date(h.timestamp)),
}), [analytics.filteredHistory, currentTheme]);
```

---

## Accessibility Features

### Tab Navigation

- **Click Navigation**: Tab buttons for switching between views
- **Tab State Persistence**: Active tab stored in global state
- **Conditional Tabs**: Analytics tab ID includes monitor ID for specificity
- **User Action Logging**: All tab changes logged for analytics

### Content Accessibility

```typescript
// Accessible tab content with proper ARIA
<ThemedBox variant="primary" padding="lg" className="max-h-[70vh] overflow-y-auto">
    {activeSiteDetailsTab === "overview" && (
        <OverviewTab {...overviewProps} />
    )}
    {/* Other conditional tab content */}
</ThemedBox>

// External URL handling with accessibility
<a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    tabIndex={0}
    aria-label={`Open ${url} in browser`}
    onClick={handleExternalOpen}
>
    {url}
</a>
```

---

## Future Enhancements

### Planned Features

- **Custom Dashboards**: User-configurable tab layouts
- **Export Options**: Tab-specific data export
- **Real-time Updates**: Live data updates within tabs
- **Comparison Mode**: Compare multiple sites side-by-side

### Extensibility

- **Plugin Tabs**: Third-party tab extensions
- **Custom Metrics**: User-defined metric displays
- **Theme Customization**: Per-tab theme overrides
- **Data Connectors**: Integration with external analytics services
