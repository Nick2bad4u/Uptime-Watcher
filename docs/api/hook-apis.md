# 🪝 Hook APIs Reference

> **Navigation:** [📖 Docs Home](../README) » [📚 API Reference](README) » **Hook APIs**

The Hook APIs provide a comprehensive set of custom React hooks for managing site monitoring, state synchronization, analytics, and user interactions in the Uptime Watcher application.

## Table of Contents

- [Overview](#overview)
- [Site Hooks](#site-hooks)
- [Core Hooks](#core-hooks)
- [Theme Hooks](#theme-hooks)
- [Utility Hooks](#utility-hooks)
- [Hook Patterns](#hook-patterns)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)
- [Custom Hook Development](#custom-hook-development)

## Overview

The application's hook system is organized into several categories:

- **Site Management**: Hooks for site operations, monitoring, and analytics
- **State Synchronization**: Hooks for backend integration and data consistency
- **Theme Management**: Hooks for theming and visual state
- **UI State**: Hooks for managing component and modal states

### Hook Organization

```text
src/hooks/
├── site/                    # Site-specific hooks
│   ├── useSite.ts          # Combined site functionality
│   ├── useSiteActions.ts   # Site action handlers
│   ├── useSiteMonitor.ts   # Monitor management
│   ├── useSiteStats.ts     # Analytics and statistics
│   ├── useSiteDetails.ts   # Site detail management
│   ├── useSiteAnalytics.ts # Analytics calculations
│   └── index.ts            # Barrel exports
├── useBackendFocusSync.ts  # Backend synchronization
└── theme/                  # Theme hooks (in src/theme/)
    └── useTheme.ts         # Theme management
```

## Site Hooks

### `useSite(site: Site)`

A comprehensive hook that combines all site-related functionality.

#### Parameters

- `site`: Site object to work with

#### Returns

```typescript
interface UseSiteReturn {
 // Monitor data (from useSiteMonitor)
 latestSite: Site;
 selectedMonitorId: string;
 monitor: Monitor | undefined;
 status: "up" | "down" | "pending";
 responseTime?: number;
 isMonitoring: boolean;
 monitorIds: string[];
 filteredHistory: StatusHistory[];
 handleMonitorIdChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;

 // Statistics (from useSiteStats)
 uptime: number;
 checkCount: number;
 averageResponseTime: number;

 // Actions (from useSiteActions)
 handleStartMonitoring: () => void;
 handleStopMonitoring: () => void;
 handleCheckNow: () => void;
 handleCardClick: () => void;

 // UI state
 isLoading: boolean;
}
```

#### Usage

```typescript
import { useSite } from '../hooks/site';

function SiteCard({ site }: { site: Site }) {
    const {
        monitor,
        uptime,
        averageResponseTime,
        handleStartMonitoring,
        handleStopMonitoring,
        handleCheckNow,
        handleCardClick,
        isLoading
    } = useSite(site);

    if (!monitor) {
        return <div>No monitor available</div>;
    }

    return (
        <div className="site-card" onClick={handleCardClick}>
            <h3>{site.name}</h3>
            <div>Uptime: {uptime.toFixed(2)}%</div>
            <div>Avg Response: {averageResponseTime}ms</div>

            <button onClick={handleStartMonitoring} disabled={isLoading}>
                Start Monitoring
            </button>
            <button onClick={handleCheckNow} disabled={isLoading}>
                Check Now
            </button>
        </div>
    );
}
```

### `useSiteActions(site: Site, monitor: Monitor | undefined)`

Provides action handlers for site operations.

#### Parameters

- `site`: Site object to act upon
- `monitor`: Specific monitor to use for actions

#### Returns

```typescript
interface SiteActionsResult {
 handleStartMonitoring: () => void;
 handleStopMonitoring: () => void;
 handleCheckNow: () => void;
 handleCardClick: () => void;
}
```

#### Usage

```typescript
function SiteControls({ site, monitor }: { site: Site; monitor: Monitor }) {
    const {
        handleStartMonitoring,
        handleStopMonitoring,
        handleCheckNow
    } = useSiteActions(site, monitor);

    return (
        <div className="site-controls">
            <button onClick={handleStartMonitoring}>
                Start Monitoring
            </button>
            <button onClick={handleStopMonitoring}>
                Stop Monitoring
            </button>
            <button onClick={handleCheckNow}>
                Check Now
            </button>
        </div>
    );
}
```

### `useSiteMonitor(site: Site)`

Manages monitor selection and monitoring state for a site.

#### Parameters

- `site`: Site object containing monitors

#### Returns

```typescript
interface SiteMonitorResult {
 latestSite: Site;
 selectedMonitorId: string;
 monitor: Monitor | undefined;
 status: "up" | "down" | "pending";
 responseTime?: number;
 isMonitoring: boolean;
 monitorIds: string[];
 filteredHistory: StatusHistory[];
 handleMonitorIdChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}
```

#### Usage

```typescript
function MonitorSelector({ site }: { site: Site }) {
    const {
        monitor,
        selectedMonitorId,
        handleMonitorIdChange,
        isMonitoring
    } = useSiteMonitor(site);

    return (
        <div>
            <select
                value={selectedMonitorId || ''}
                onChange={handleMonitorIdChange}
            >
                {site.monitors.map(m => (
                    <option key={m.id} value={m.id}>
                        {m.type}: {m.url || `${m.host}:${m.port}`}
                    </option>
                ))}
            </select>

            <div>
                Status: {isMonitoring ? 'Monitoring' : 'Stopped'}
            </div>
        </div>
    );
}
```

### `useSiteStats(history: StatusHistory[]): SiteStats`

Calculates statistics from site monitoring history.

#### Parameters

- `history`: Array of status history records

#### Returns

```typescript
interface SiteStats {
 uptime: number;
 checkCount: number;
 averageResponseTime: number;
}
```

#### Usage

```typescript
function SiteAnalytics({ site }: { site: Site }) {
    const monitor = site.monitors[0]; // Example: use first monitor
    const {
        uptime,
        averageResponseTime,
        checkCount
    } = useSiteStats(monitor?.history || []);

    return (
        <div className="site-analytics">
            <h3>Site Statistics</h3>
            <div>Uptime: {uptime.toFixed(2)}%</div>
            <div>Average Response Time: {averageResponseTime}ms</div>
            <div>Total Checks: {checkCount}</div>
        </div>
    );
}
```

### `useSiteAnalytics(monitor: Monitor | undefined, timeRange: "1h" | "24h" | "7d" | "30d")`

Calculates comprehensive site analytics and metrics with time-based filtering.

#### Parameters

- `monitor`: Monitor object to analyze
- `timeRange`: Time range for filtering data

#### Returns

```typescript
interface SiteAnalytics {
 totalChecks: number;
 upCount: number;
 downCount: number;
 uptime: string;
 avgResponseTime: number;
 fastestResponse: number;
 slowestResponse: number;
 p50: number;
 p95: number;
 p99: number;
 downtimePeriods: DowntimePeriod[];
 filteredHistory: StatusHistory[];
 timeRangeLabel: string;
 formatResponseTime: (time: number) => string;
 formatDuration: (duration: number) => string;
}
```

#### Usage

```typescript
function SiteAnalyticsDisplay({ monitor }: { monitor: Monitor }) {
    const analytics = useSiteAnalytics(monitor, "24h");

    return (
        <div className="analytics">
            <h3>Analytics - {analytics.timeRangeLabel}</h3>
            <div>Uptime: {analytics.uptime}</div>
            <div>Avg Response: {analytics.avgResponseTime}ms</div>
            <div>P95: {analytics.p95}ms</div>
            <div>P99: {analytics.p99}ms</div>
            <div>Total Checks: {analytics.totalChecks}</div>
        </div>
    );
}
```

### `useSiteDetails({ site: Site })`

Manages comprehensive site details state and operations for the SiteDetails component.

#### Parameters

- `site`: Site object to manage details for

#### Returns

```typescript
interface UseSiteDetailsReturn {
 // UI state
 activeSiteDetailsTab: string;
 showAdvancedMetrics: boolean;
 siteDetailsChartTimeRange: "1h" | "24h" | "7d" | "30d";

 // Site data
 currentSite: Site;
 selectedMonitor: Monitor | undefined;
 selectedMonitorId: string;
 siteExists: boolean;

 // Form state
 localName: string;
 localCheckInterval: number;
 hasUnsavedChanges: boolean;
 intervalChanged: boolean;

 // Loading states
 isLoading: boolean;
 isMonitoring: boolean;
 isRefreshing: boolean;

 // Analytics
 analytics: SiteAnalytics;

 // Event handlers
 handleCheckNow: (isAutoRefresh?: boolean) => Promise<void>;
 handleStartMonitoring: () => Promise<void>;
 handleStopMonitoring: () => Promise<void>;
 handleMonitorIdChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
 handleIntervalChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
 handleSaveInterval: () => Promise<void>;
 handleSaveName: () => Promise<void>;
 handleRemoveSite: () => Promise<void>;

 // State setters
 setLocalName: (name: string) => void;
 setActiveSiteDetailsTab: (tab: string) => void;
 setSiteDetailsChartTimeRange: (range: "1h" | "24h" | "7d" | "30d") => void;
 setShowAdvancedMetrics: (show: boolean) => void;
}
```

#### Usage

```typescript
import { useSiteDetails } from '../hooks/site';

function SiteDetails({ site, onClose }: { site: Site; onClose: () => void }) {
    const {
        currentSite,
        selectedMonitor,
        activeSiteDetailsTab,
        siteDetailsChartTimeRange,
        isLoading,
        isMonitoring,
        analytics,
        handleStartMonitoring,
        handleStopMonitoring,
        handleCheckNow,
        setActiveSiteDetailsTab,
        setSiteDetailsChartTimeRange
    } = useSiteDetails({ site });

    if (!currentSite) {
        return null;
    }

    return (
        <div className="site-details">
            <div className="tabs">
                {['overview', 'analytics', 'history', 'settings'].map(tab => (
                    <button
                        key={tab}
                        className={activeSiteDetailsTab === tab ? 'active' : ''}
                        onClick={() => setActiveSiteDetailsTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="time-range-selector">
                {['1h', '24h', '7d', '30d'].map(range => (
                    <button
                        key={range}
                        className={siteDetailsChartTimeRange === range ? 'active' : ''}
                        onClick={() => setSiteDetailsChartTimeRange(range as any)}
                    >
                        {range}
                    </button>
                ))}
            </div>

            <div className="controls">
                <button
                    onClick={handleStartMonitoring}
                    disabled={isLoading || isMonitoring}
                >
                    Start Monitoring
                </button>
                <button
                    onClick={handleStopMonitoring}
                    disabled={isLoading || !isMonitoring}
                >
                    Stop Monitoring
                </button>
                <button onClick={() => handleCheckNow()}>
                    Check Now
                </button>
            </div>

            {/* Tab content based on activeSiteDetailsTab */}
        </div>
    );
}
```

## Core Hooks

### `useBackendFocusSync(enabled?: boolean)`

Synchronizes data with backend when application window gains focus.

#### Parameters

- `enabled`: Whether to enable focus-based synchronization (default: false)

#### Usage

```typescript
function App() {
    // Enable automatic sync when user returns to the app
    useBackendFocusSync(true);

    return (
        <div className="app">
            {/* App content */}
        </div>
    );
}
```

#### Advanced Usage with Conditions

```typescript
function DataProvider({ children }) {
    const { settings } = useStore();

    // Only sync if auto-sync is enabled in settings
    useBackendFocusSync(settings.autoSync);

    // Or sync conditionally based on time since last sync
    const [lastSync, setLastSync] = useState(Date.now());
    const shouldSync = Date.now() - lastSync > 60000; // 1 minute

    useBackendFocusSync(shouldSync);

    return <>{children}</>;
}
```

## Theme Hooks

### `useTheme()`

Comprehensive theme management hook.

#### Returns

```typescript
interface UseThemeReturn {
 availableThemes: ThemeName[];
 currentTheme: Theme;
 getColor: (path: string) => string;
 getStatusColor: (status: StatusType) => string;
 isDark: boolean;
 setTheme: (theme: ThemeName) => void;
 systemTheme: "light" | "dark";
 themeManager: ThemeManager;
 themeName: ThemeName;
 themeVersion: number;
 toggleTheme: () => void;
}
```

#### Usage

{% raw %}

```typescript
function ThemedComponent() {
    const {
        currentTheme,
        isDark,
        setTheme,
        getStatusColor
    } = useTheme();

    return (
        <div style={{
            backgroundColor: currentTheme.colors.background.primary,
            color: currentTheme.colors.text.primary
        }}>
            <button onClick={() => setTheme(isDark ? 'light' : 'dark')}>
                Switch Theme
            </button>

            <div style={{ color: getStatusColor('up') }}>
                Service is operational
            </div>
        </div>
    );
}
```

{% endraw %}

### `useThemeValue<T>(selector: (theme: Theme) => T): T`

Utility hook for accessing specific values from the current theme.

#### Usage

```typescript
function Component() {
    const primaryColor = useThemeValue(theme => theme.colors.primary[500]);
    return <div style={{ color: primaryColor }}>Themed text</div>;
}
```

### `useStatusColors()`

Hook for accessing theme-aware status colors.

#### Returns

```typescript
interface StatusColors {
 up: string;
 down: string;
 pending: string;
 unknown: string;
}
```

### `useThemeClasses()`

Hook for theme-aware CSS classes using CSS custom properties.

#### Returns

```typescript
interface ThemeClasses {
 getBackgroundClass: (variant?: "primary" | "secondary" | "tertiary") => CSSProperties;
 getTextClass: (variant?: "primary" | "secondary" | "tertiary" | "inverse") => CSSProperties;
 getBorderClass: (variant?: "primary" | "secondary" | "focus") => CSSProperties;
 getSurfaceClass: (variant?: "base" | "elevated" | "overlay") => CSSProperties;
 getStatusClass: (status: "up" | "down" | "pending" | "unknown") => CSSProperties;
 getColor: (path: string) => string;
}
```

### `useAvailabilityColors()`

Hook for availability-based color mapping.

#### Returns

```typescript
interface AvailabilityColors {
    getAvailabilityColor: (percentage: number) => string;
    getAvailabilityVariant: (percentage: number) => "success" | "warning" | "danger";
    getAvailabilityDescription: (percentage: number) => string;
}
    getAvailabilityDescription: (percentage: number) => string;
}
```

## Utility Hooks

### Custom Validation Hook

```typescript
function useFormValidation<T>(initialValues: T, validationRules: ValidationRules<T>) {
 const [values, setValues] = useState(initialValues);
 const [errors, setErrors] = useState<Partial<T>>({});
 const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

 const validate = useCallback(
  (fieldName: keyof T, value: any) => {
   const rule = validationRules[fieldName];
   if (rule) {
    const error = rule(value);
    setErrors((prev) => ({ ...prev, [fieldName]: error }));
    return !error;
   }
   return true;
  },
  [validationRules]
 );

 const handleChange = useCallback(
  (fieldName: keyof T, value: any) => {
   setValues((prev) => ({ ...prev, [fieldName]: value }));
   validate(fieldName, value);
  },
  [validate]
 );

 const handleBlur = useCallback((fieldName: keyof T) => {
  setTouched((prev) => ({ ...prev, [fieldName]: true }));
 }, []);

 const isValid = useMemo(() => {
  return Object.values(errors).every((error) => !error);
 }, [errors]);

 return {
  values,
  errors,
  touched,
  isValid,
  handleChange,
  handleBlur,
  validate,
 };
}
```

### Data Fetching Hook

```typescript
function useApiData<T>(fetchFn: () => Promise<T>, dependencies: any[] = []) {
 const [data, setData] = useState<T | null>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 const fetchData = useCallback(async () => {
  try {
   setLoading(true);
   setError(null);
   const result = await fetchFn();
   setData(result);
  } catch (err) {
   setError(err instanceof Error ? err.message : "Unknown error");
  } finally {
   setLoading(false);
  }
 }, dependencies);

 useEffect(() => {
  fetchData();
 }, [fetchData]);

 return {
  data,
  loading,
  error,
  refetch: fetchData,
 };
}
```

## Hook Patterns

### Compound Hooks Pattern

```typescript
// Base hooks
function useMonitorData(siteId: string) {
 // Monitor-specific data logic
}

function useMonitorActions(siteId: string) {
 // Monitor-specific actions
}

function useMonitorState(siteId: string) {
 // Monitor UI state
}

// Compound hook combining related functionality
function useMonitor(siteId: string) {
 const data = useMonitorData(siteId);
 const actions = useMonitorActions(siteId);
 const state = useMonitorState(siteId);

 return {
  ...data,
  ...actions,
  ...state,
 };
}
```

### Provider Hook Pattern

```typescript
// Context for sharing hook data
const SiteContext = createContext<UseSiteReturn | null>(null);

export function SiteProvider({ site, children }: { site: Site; children: React.ReactNode }) {
    const siteData = useSite(site);

    return (
        <SiteContext.Provider value={siteData}>
            {children}
        </SiteContext.Provider>
    );
}

export function useSiteContext() {
    const context = useContext(SiteContext);
    if (!context) {
        throw new Error('useSiteContext must be used within SiteProvider');
    }
    return context;
}
```

### Conditional Hook Pattern

```typescript
function useConditionalData(condition: boolean, fetcher: () => Promise<any>) {
 const [data, setData] = useState(null);

 useEffect(() => {
  if (condition) {
   fetcher().then(setData);
  }
 }, [condition, fetcher]);

 return condition ? data : null;
}
```

## Usage Examples

### Complete Site Management Component

{% raw %}

```typescript
import { useSite, useSiteDetails } from '../hooks/site';
import { useTheme } from '../theme/useTheme';

function SiteManagementCard({ site }: { site: Site }) {
    // Get all site functionality
    const {
        monitor,
        uptime,
        averageResponseTime,
        handleStartMonitoring,
        handleStopMonitoring,
        handleCheckNow,
        handleCardClick,
        isLoading
    } = useSite(site);

    // Get theme for styling
    const { currentTheme, getStatusColor } = useTheme();

    // Get site details management from store
    const { setSelectedSite, setShowSiteDetails } = useStore();

    const openDetails = () => {
        setSelectedSite(site);
        setShowSiteDetails(true);
    };

    if (!monitor) {
        return (
            <div className="site-card error">
                <h3>{site.name}</h3>
                <p>No monitor configured</p>
            </div>
        );
    }

    return (
        <div
            className="site-card"
            style={{
                backgroundColor: currentTheme.colors.background.secondary,
                borderColor: currentTheme.colors.border.primary
            }}
        >
            <div className="site-header">
                <h3 style={{ color: currentTheme.colors.text.primary }}>
                    {site.name}
                </h3>
                <span
                    className="status-indicator"
                    style={{
                        color: getStatusColor(monitor.status),
                        backgroundColor: getStatusColor(monitor.status) + '20'
                    }}
                >
                    {monitor.status.toUpperCase()}
                </span>
            </div>

            <div className="site-metrics">
                <div className="metric">
                    <span className="label">Uptime</span>
                    <span
                        className="value"
                        style={{ color: getStatusColor(monitor.status) }}
                    >
                        {uptime.toFixed(2)}%
                    </span>
                </div>

                <div className="metric">
                    <span className="label">Response Time</span>
                    <span className="value">{averageResponseTime}ms</span>
                </div>
            </div>

            <div className="site-actions">
                <button
                    onClick={handleStartMonitoring}
                    disabled={isLoading || monitor.monitoring}
                    className="action-btn start"
                >
                    Start Monitoring
                </button>

                <button
                    onClick={handleStopMonitoring}
                    disabled={isLoading || !monitor.monitoring}
                    className="action-btn stop"
                >
                    Stop Monitoring
                </button>

                <button
                    onClick={handleCheckNow}
                    disabled={isLoading}
                    className="action-btn check"
                >
                    Check Now
                </button>

                <button
                    onClick={openDetails}
                    className="action-btn details"
                >
                    View Details
                </button>
            </div>
        </div>
    );
}
```

{% endraw %}

### Dashboard with Multiple Hooks

{% raw %}

```typescript
function Dashboard() {
    const { sites, isLoading } = useStore();
    const { currentTheme } = useTheme();

    // Enable automatic sync when user returns
    useBackendFocusSync(true);

    return (
        <div
            className="dashboard"
            style={{
                backgroundColor: currentTheme.colors.background.primary,
                color: currentTheme.colors.text.primary
            }}
        >
            <header className="dashboard-header">
                <h1>Site Monitor Dashboard</h1>
                {isLoading && <div className="loading-indicator">Syncing...</div>}
            </header>

            <div className="sites-grid">
                {sites.map(site => (
                    <SiteManagementCard key={site.identifier} site={site} />
                ))}
            </div>
        </div>
    );
}
```

{% endraw %}

## Best Practices

### 1. Hook Composition

```typescript
// ✅ Good - Compose related hooks
function useSiteManagement(site: Site) {
 const monitor = useSiteMonitor(site);
 const stats = useSiteStats(monitor.filteredHistory);
 const actions = useSiteActions(site, monitor.monitor);

 return { ...monitor, ...stats, ...actions };
}

// ❌ Bad - Use many hooks separately in component
function SiteComponent({ site }) {
 const monitor = useSiteMonitor(site);
 const stats = useSiteStats(monitor.filteredHistory);
 const actions = useSiteActions(site, monitor.monitor);
 // ... component logic
}
```

### 2. Memoization

```typescript
// ✅ Good - Memoize expensive calculations
function useSiteStats(history: StatusHistory[]) {
 const stats = useMemo(() => {
  return calculateStats(history);
 }, [history]);

 return stats;
}

// ❌ Bad - Calculate on every render
function useSiteStats(history: StatusHistory[]) {
 return calculateStats(history); // Recalculates every time
}
```

### 3. Dependency Management

```typescript
// ✅ Good - Stable dependencies
const handleAction = useCallback(() => {
 performAction(site.id);
}, [site.id]);

// ❌ Bad - Unstable dependencies
const handleAction = useCallback(() => {
 performAction(site.id);
}, [site]); // Entire site object changes reference
```

### 4. Error Boundaries

```typescript
function useSafeApiCall<T>(apiCall: () => Promise<T>) {
 const [state, setState] = useState<{
  data: T | null;
  error: string | null;
  loading: boolean;
 }>({
  data: null,
  error: null,
  loading: false,
 });

 const execute = useCallback(async () => {
  setState((prev) => ({ ...prev, loading: true, error: null }));

  try {
   const data = await apiCall();
   setState({ data, error: null, loading: false });
  } catch (error) {
   setState({
    data: null,
    error: error instanceof Error ? error.message : "Unknown error",
    loading: false,
   });
  }
 }, [apiCall]);

 return { ...state, execute };
}
```

## Custom Hook Development

### Hook Structure Template

```typescript
function useCustomHook(
 // Parameters
 param1: string,
 param2?: number
) {
 // State
 const [state, setState] = useState(initialState);

 // Store or context usage
 const { relatedData } = useStore();

 // Computed values
 const computedValue = useMemo(() => {
  return computeValue(state, relatedData);
 }, [state, relatedData]);

 // Actions
 const handleAction = useCallback(
  () => {
   // Action logic
  },
  [
   /* dependencies */
  ]
 );

 // Effects
 useEffect(
  () => {
   // Side effects
  },
  [
   /* dependencies */
  ]
 );

 // Return interface
 return {
  // Data
  data: state,
  computedValue,

  // Actions
  handleAction,

  // Status
  isLoading: state.loading,
 };
}
```

### Testing Hooks

```typescript
// Hook testing utility
function renderHookWithProviders<T>(hook: () => T) {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>
            <StoreProvider>
                {children}
            </StoreProvider>
        </ThemeProvider>
    );

    return renderHook(hook, { wrapper });
}

// Test example
test('useSiteStats calculates uptime correctly', () => {
    const mockHistory = [
        { timestamp: 1000, status: 'up', responseTime: 100 },
        { timestamp: 2000, status: 'down', responseTime: 0 },
        { timestamp: 3000, status: 'up', responseTime: 150 }
    ];

    const { result } = renderHookWithProviders(() =>
        useSiteStats(mockHistory)
    );

    expect(result.current.uptimePercentage).toBe(66.67);
    expect(result.current.totalChecks).toBe(3);
});
```

## See Also

- [Store API](store-api) - State management integration
- [Component Props](component-props) - Component interfaces
- [Theme API](theme-api) - Theming system hooks
