# 🪝 Hook APIs Reference

> **Navigation:** [📖 Docs Home](../README.md) » [📚 API Reference](README.md) » **Hook APIs**

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
│   └── useSiteDetails.ts   # Site detail views
├── useBackendFocusSync.ts  # Backend synchronization
└── ...                     # Other utility hooks
```

## Site Hooks

### `useSite(site: Site)`

A comprehensive hook that combines all site-related functionality.

#### Parameters

- `site`: Site object to work with

#### Returns

```typescript
interface UseSiteReturn {
 // Monitor data
 monitor: Monitor | undefined;
 filteredHistory: StatusHistory[];
 monitoringStatus: boolean;

 // Statistics
 uptimePercentage: number;
 averageResponseTime: number;
 totalChecks: number;
 upChecks: number;
 downChecks: number;

 // Actions
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
        uptimePercentage,
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
            <div>Uptime: {uptimePercentage.toFixed(2)}%</div>
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
 monitor: Monitor | undefined;
 selectedMonitorId: string | undefined;
 setSelectedMonitorId: (monitorId: string) => void;
 filteredHistory: StatusHistory[];
 monitoringStatus: boolean;
}
```

#### Usage

```typescript
function MonitorSelector({ site }: { site: Site }) {
    const {
        monitor,
        selectedMonitorId,
        setSelectedMonitorId,
        monitoringStatus
    } = useSiteMonitor(site);

    return (
        <div>
            <select
                value={selectedMonitorId || ''}
                onChange={(e) => setSelectedMonitorId(e.target.value)}
            >
                {site.monitors.map(m => (
                    <option key={m.id} value={m.id}>
                        {m.type}: {m.url || `${m.host}:${m.port}`}
                    </option>
                ))}
            </select>

            <div>
                Status: {monitoringStatus ? 'Monitoring' : 'Stopped'}
            </div>
        </div>
    );
}
```

### `useSiteStats(history: StatusHistory[], timeRange?: string)`

Calculates statistics from site monitoring history.

#### Parameters

- `history`: Array of status history records
- `timeRange`: Optional time range filter ("1h", "24h", "7d", "30d")

#### Returns

```typescript
interface SiteStatsResult {
 uptimePercentage: number;
 averageResponseTime: number;
 totalChecks: number;
 upChecks: number;
 downChecks: number;
 uptimeHours: number;
 downtimeHours: number;
 lastCheckTime: Date | undefined;
 statusCounts: {
  up: number;
  down: number;
  pending: number;
 };
}
```

#### Usage

```typescript
function SiteAnalytics({ site }: { site: Site }) {
    const monitor = site.monitors[0]; // Example: use first monitor
    const {
        uptimePercentage,
        averageResponseTime,
        totalChecks,
        upChecks,
        downChecks,
        lastCheckTime
    } = useSiteStats(monitor?.history || []);

    return (
        <div className="site-analytics">
            <h3>Site Statistics</h3>
            <div>Uptime: {uptimePercentage.toFixed(2)}%</div>
            <div>Average Response Time: {averageResponseTime}ms</div>
            <div>Total Checks: {totalChecks}</div>
            <div>Successful Checks: {upChecks}</div>
            <div>Failed Checks: {downChecks}</div>
            {lastCheckTime && (
                <div>Last Check: {lastCheckTime.toLocaleString()}</div>
            )}
        </div>
    );
}
```

### `useSiteDetails()`

Manages site details modal state and navigation.

#### Returns

```typescript
interface SiteDetailsResult {
 selectedSite: Site | undefined;
 showSiteDetails: boolean;
 activeSiteDetailsTab: string;
 siteDetailsChartTimeRange: "1h" | "24h" | "7d" | "30d";
 showAdvancedMetrics: boolean;

 setSelectedSite: (site: Site | undefined) => void;
 setShowSiteDetails: (show: boolean) => void;
 setActiveSiteDetailsTab: (tab: string) => void;
 setSiteDetailsChartTimeRange: (range: "1h" | "24h" | "7d" | "30d") => void;
 setShowAdvancedMetrics: (show: boolean) => void;
}
```

#### Usage

```typescript
function SiteDetailsModal() {
    const {
        selectedSite,
        showSiteDetails,
        activeSiteDetailsTab,
        siteDetailsChartTimeRange,
        setShowSiteDetails,
        setActiveSiteDetailsTab,
        setSiteDetailsChartTimeRange
    } = useSiteDetails();

    if (!showSiteDetails || !selectedSite) {
        return null;
    }

    return (
        <div className="modal">
            <div className="modal-header">
                <h2>{selectedSite.name}</h2>
                <button onClick={() => setShowSiteDetails(false)}>
                    Close
                </button>
            </div>

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
 currentTheme: Theme;
 themeName: ThemeName;
 isDark: boolean;
 systemTheme: "light" | "dark";
 themeVersion: number;

 setTheme: (theme: ThemeName) => void;
 getStatusColor: (status: StatusType) => string;
 getAvailabilityColor: (percentage: number) => string;
}
```

#### Usage

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

```typescript
import { useSite, useSiteDetails } from '../hooks/site';
import { useTheme } from '../theme/useTheme';

function SiteManagementCard({ site }: { site: Site }) {
    // Get all site functionality
    const {
        monitor,
        uptimePercentage,
        averageResponseTime,
        handleStartMonitoring,
        handleStopMonitoring,
        handleCheckNow,
        handleCardClick,
        isLoading
    } = useSite(site);

    // Get theme for styling
    const { currentTheme, getStatusColor, getAvailabilityColor } = useTheme();

    // Get site details management
    const { setSelectedSite, setShowSiteDetails } = useSiteDetails();

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
                        style={{ color: getAvailabilityColor(uptimePercentage) }}
                    >
                        {uptimePercentage.toFixed(2)}%
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

### Dashboard with Multiple Hooks

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

            <SiteDetailsModal />
        </div>
    );
}
```

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

- [Store API](store-api.md) - State management integration
- [Component Props](component-props.md) - Component interfaces
- [Theme API](theme-api.md) - Theming system hooks
