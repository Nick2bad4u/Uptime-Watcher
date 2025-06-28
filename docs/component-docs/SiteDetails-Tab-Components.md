# SiteDetails Tab Components Documentation

## Overview

The SiteDetails modal includes several specialized tab components that provide different views of site monitoring data. Each tab focuses on specific aspects of site monitoring: overview statistics, historical data, analytics, and configuration settings.

---

## Component Hierarchy

```text
SiteDetails (main modal)
├── SiteDetailsHeader
├── SiteDetailsNavigation (tab navigation)
├── Tab Components
│   ├── OverviewTab
│   ├── HistoryTab
│   ├── AnalyticsTab
│   └── SettingsTab
└── ScreenshotThumbnail (when available)
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
- **Uptime Percentage**: Visual uptime display with color coding
- **Check Count**: Total number of monitoring checks performed
- **Visual Progress Bars**: Themed progress indicators for uptime

#### Statistics Cards

The OverviewTab uses a card-based layout for metrics:

```typescript
// Metric cards with icons and themed styling
<ThemedCard variant="secondary" padding="md">
    <div className="flex items-center gap-3">
        <MdSpeed className="text-2xl" />
        <div>
            <ThemedText size="sm" variant="secondary">
                Avg Response Time
            </ThemedText>
            <ThemedText size="lg" weight="semibold">
                {formatResponseTime(avgResponseTime)}
            </ThemedText>
        </div>
    </div>
</ThemedCard>
```

#### Site Management Actions

- **Remove Site**: Destructive action with confirmation
- **Loading States**: Progress indicators during operations
- **Error Handling**: User feedback for failed operations

### Visual Components

- **Progress Bars**: Uptime visualization with theme-aware colors
- **Metric Cards**: Responsive card layout for statistics
- **Action Buttons**: Themed buttons with loading states
- **Icons**: React Icons integration for visual enhancement

---

## HistoryTab Component

### HistoryTab Location & Files

- **Component:** `src/components/SiteDetails/tabs/HistoryTab.tsx`
- **Purpose**: Displays comprehensive historical monitoring data

### HistoryTab Features

#### Historical Data Visualization

- **Timeline Charts**: Complete monitoring history over time
- **Status Indicators**: Visual status change timeline
- **Response Time Graphs**: Performance trends over time
- **Filtering Options**: Time range and status filtering

#### Data Analysis

- **Trend Analysis**: Uptime trends and patterns
- **Incident Timeline**: Downtime incidents and recovery
- **Performance Metrics**: Historical response time analysis
- **Export Functionality**: Data export options for analysis

### Implementation Patterns

```typescript
// Historical data rendering with HistoryChart integration
<HistoryChart
    history={fullHistoryData}
    title="Complete History"
    maxItems={500}
    className="detailed-history-chart"
/>

// Status filter controls
<div className="flex gap-2 mb-4">
    <ThemedButton
        variant={filter === 'all' ? 'primary' : 'secondary'}
        size="sm"
        onClick={() => setFilter('all')}
    >
        All Status
    </ThemedButton>
    <ThemedButton
        variant={filter === 'incidents' ? 'primary' : 'secondary'}
        size="sm"
        onClick={() => setFilter('incidents')}
    >
        Incidents Only
    </ThemedButton>
</div>
```

---

## AnalyticsTab Component

### AnalyticsTab Location & Files

- **Component:** `src/components/SiteDetails/tabs/AnalyticsTab.tsx`
- **Purpose**: Advanced analytics and insights for monitoring data

### AnalyticsTab Features

#### Advanced Metrics

- **Availability Trends**: Long-term availability analysis
- **Performance Analytics**: Response time distribution and trends
- **Incident Analysis**: Downtime pattern analysis
- **Comparative Metrics**: Performance comparison over time periods

#### Visualization Components

- **Chart Integration**: Advanced charts for data visualization
- **Metric Summaries**: Statistical summaries and insights
- **Trend Indicators**: Visual trend arrows and percentage changes
- **Time Range Selection**: Configurable analysis periods

### Analytics Features

```typescript
// Analytics calculations and display
const performanceScore = calculatePerformanceScore(monitor);
const availabilityTrend = calculateAvailabilityTrend(history);
const incidentFrequency = calculateIncidentFrequency(incidents);

// Insight generation
<ThemedCard variant="info" padding="md">
    <div className="flex items-center gap-2 mb-2">
        <MdTrendingUp className="text-success" />
        <ThemedText weight="semibold">Performance Insight</ThemedText>
    </div>
    <ThemedText size="sm" variant="secondary">
        {generatePerformanceInsight(performanceScore, availabilityTrend)}
    </ThemedText>
</ThemedCard>
```

---

## SettingsTab Component

### SettingsTab Location & Files

- **Component:** `src/components/SiteDetails/tabs/SettingsTab.tsx`
- **Purpose**: Site-specific configuration and monitoring settings

### SettingsTab Features

#### Monitoring Configuration

- **Check Interval**: Adjustable monitoring frequency
- **Timeout Settings**: Request timeout configuration
- **Retry Logic**: Retry attempt configuration
- **Notification Settings**: Site-specific alert preferences

#### Site Management

- **Site Information**: Editable site name and URL
- **Tag Management**: Add/remove organizational tags
- **Monitor Management**: Add/remove monitoring endpoints
- **Threshold Configuration**: Custom alert thresholds

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

- **Site Title**: Prominent site name display
- **Status Indicator**: Real-time status display
- **Quick Actions**: Header-level action buttons
- **Close Control**: Modal close functionality

### SiteDetailsNavigation Component

#### SiteDetailsNavigation Location & Files

- **Component:** `src/components/SiteDetails/SiteDetailsNavigation.tsx`

#### SiteDetailsNavigation Features

- **Tab Navigation**: Switch between different tab views
- **Active State**: Visual indication of current tab
- **Keyboard Support**: Arrow key navigation between tabs
- **Badge Indicators**: Notification badges on tabs (if applicable)

#### Navigation Implementation

```typescript
interface TabItem {
 id: string;
 label: string;
 component: React.ComponentType<any>;
 badge?: number;
}

const tabs: TabItem[] = [
 { id: "overview", label: "Overview", component: OverviewTab },
 { id: "history", label: "History", component: HistoryTab },
 { id: "analytics", label: "Analytics", component: AnalyticsTab },
 { id: "settings", label: "Settings", component: SettingsTab },
];
```

### ScreenshotThumbnail Component

#### ScreenshotThumbnail Location & Files

- **Component:** `src/components/SiteDetails/ScreenshotThumbnail.tsx`

#### ScreenshotThumbnail Features

- **Visual Preview**: Thumbnail preview of site screenshots
- **Lazy Loading**: Efficient image loading and caching
- **Error Handling**: Graceful handling of missing screenshots
- **Click to Expand**: Full-size screenshot view

---

## Integration Patterns

### Tab State Management

```typescript
// Tab state management in parent component
const [activeTab, setActiveTab] = useState<string>('overview');

// Tab content rendering
const renderTabContent = () => {
    switch (activeTab) {
        case 'overview':
            return <OverviewTab {...overviewProps} />;
        case 'history':
            return <HistoryTab {...historyProps} />;
        case 'analytics':
            return <AnalyticsTab {...analyticsProps} />;
        case 'settings':
            return <SettingsTab {...settingsProps} />;
        default:
            return <OverviewTab {...overviewProps} />;
    }
};
```

### Data Flow

- **Props Down**: Data flows from parent SiteDetails to tabs
- **Events Up**: User actions bubble up through event handlers
- **State Synchronization**: Tab state synchronized with modal state
- **Loading Coordination**: Loading states coordinated across tabs

---

## Performance Considerations

### Tab Optimization

- **Lazy Loading**: Tab content loaded only when activated
- **Data Memoization**: Expensive calculations memoized
- **Component Memoization**: React.memo for tab components
- **Virtual Scrolling**: For large datasets in history/analytics

### Memory Management

```typescript
// Memoized tab components
export const OverviewTab = React.memo(function OverviewTab(props) {
 // Component implementation
});

// Memoized calculations
const memoizedStats = useMemo(() => {
 return calculateSiteStatistics(monitor, history);
}, [monitor, history]);
```

---

## Accessibility Features

### Tab Navigation

- **ARIA Roles**: Proper tab and tabpanel roles
- **Keyboard Navigation**: Arrow keys for tab switching
- **Focus Management**: Focus moved to tab content on selection
- **Screen Reader**: Tab announcements and content descriptions

### Content Accessibility

```typescript
// ARIA attributes for tab navigation
<div role="tablist" aria-label="Site details">
    {tabs.map((tab) => (
        <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`${tab.id}-panel`}
            onClick={() => setActiveTab(tab.id)}
        >
            {tab.label}
        </button>
    ))}
</div>

<div
    role="tabpanel"
    id={`${activeTab}-panel`}
    aria-labelledby={`${activeTab}-tab`}
>
    {renderTabContent()}
</div>
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
