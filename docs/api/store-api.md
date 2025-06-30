# 🏪 Store API Reference

> **Navigation:** [📖 Docs Home](../README) » [📚 API Reference](README) » **Store API**

The Store API provides centralized state management for the Uptime Watcher application using Zustand. This API manages sites, monitors, settings, UI state, and backend synchronization.

## Table of Contents

- [Core Interfaces](#core-interfaces)
- [State Properties](#state-properties)
- [Actions](#actions)
- [Selectors](#selectors)
- [Usage Examples](#usage-examples)
- [Error Handling](#error-handling)
- [Migration Guide](#migration-guide)

## Core Interfaces

### `AppSettings`

Application configuration and user preferences.

```typescript
interface AppSettings {
    /** Enable desktop notifications */
    notifications: boolean;
    /** Auto-start monitoring on app launch */
    autoStart: boolean;
    /** Minimize to system tray instead of closing */
    minimizeToTray: boolean;
    /** Current theme name */
    theme: ThemeName;
    /** Enable sound alerts for status changes */
    soundAlerts: boolean;
    /** Maximum number of history records to keep */
    historyLimit: number;
}
```

### `AppState`

Main application state interface containing all global state and actions.

```typescript
interface AppState {
    // Core data
    sites: Site[];
    settings: AppSettings;
    
    // UI state
    showSettings: boolean;
    selectedSiteId: string | undefined;
    showSiteDetails: boolean;
    
    // Error handling
    lastError: string | undefined;
    isLoading: boolean;
    
    // Statistics
    totalUptime: number;
    totalDowntime: number;
    
    // Site details UI state
    activeSiteDetailsTab: string;
    siteDetailsChartTimeRange: "1h" | "24h" | "7d" | "30d";
    showAdvancedMetrics: boolean;
    
    // Monitor selection state
    selectedMonitorIds: Record<string, string>;
    
    // Application updates
    updateStatus: UpdateStatus;
    updateError: string | undefined;
    
    // Actions and selectors...
}
```

### `UpdateStatus`

Application update status enumeration.

```typescript
type UpdateStatus = "idle" | "checking" | "available" | "downloading" | "downloaded" | "error";
```

## State Properties

### Core Data

| Property | Type | Description |
|----------|------|-------------|
| `sites` | `Site[]` | Array of monitored sites with their monitors |
| `settings` | `AppSettings` | Application configuration and preferences |

### UI State

| Property | Type | Description |
|----------|------|-------------|
| `showSettings` | `boolean` | Whether settings modal is open |
| `selectedSiteId` | `string \| undefined` | Currently selected site identifier |
| `showSiteDetails` | `boolean` | Whether site details modal is open |
| `activeSiteDetailsTab` | `string` | Active tab in site details modal |
| `siteDetailsChartTimeRange` | `"1h" \| "24h" \| "7d" \| "30d"` | Selected time range for charts |
| `showAdvancedMetrics` | `boolean` | Whether to show advanced metrics |
| `selectedMonitorIds` | `Record<string, string>` | Map of site ID to selected monitor ID |

### Error Handling

| Property | Type | Description |
|----------|------|-------------|
| `lastError` | `string \| undefined` | Last error message to display |
| `isLoading` | `boolean` | Global loading state |

### Statistics

| Property | Type | Description |
|----------|------|-------------|
| `totalUptime` | `number` | Total uptime across all sites |
| `totalDowntime` | `number` | Total downtime across all sites |

### Application Updates

| Property | Type | Description |
|----------|------|-------------|
| `updateStatus` | `UpdateStatus` | Current update status |
| `updateError` | `string \| undefined` | Update error message if any |

## Actions

### Backend Integration Actions

#### `initializeApp(): Promise<void>`

Initializes the application and loads data from the backend.

```typescript
const { initializeApp } = useStore();

// Initialize on app startup
await initializeApp();
```

#### `createSite(siteData: Omit<Site, "identifier" | "monitors"> & { monitors?: Monitor[] }): Promise<void>`

Creates a new site with optional monitors.

```typescript
const { createSite } = useStore();

await createSite({
    name: "My Website",
    monitors: [{
        id: "monitor-1",
        type: "http",
        url: "https://example.com",
        status: "pending",
        history: []
    }]
});
```

#### `deleteSite(identifier: string): Promise<void>`

Deletes a site and all its monitors.

```typescript
const { deleteSite } = useStore();

await deleteSite("site-id-123");
```

#### `modifySite(identifier: string, updates: Partial<Site>): Promise<void>`

Updates site properties.

```typescript
const { modifySite } = useStore();

await modifySite("site-id-123", {
    name: "Updated Site Name"
});
```

#### `checkSiteNow(siteId: string, monitorId: string): Promise<void>`

Performs an immediate status check for a specific monitor.

```typescript
const { checkSiteNow } = useStore();

await checkSiteNow("site-id-123", "monitor-id-456");
```

### Monitoring Control Actions

#### `startSiteMonitorMonitoring(siteId: string, monitorId: string): Promise<void>`

Starts monitoring for a specific monitor.

```typescript
const { startSiteMonitorMonitoring } = useStore();

await startSiteMonitorMonitoring("site-id-123", "monitor-id-456");
```

#### `stopSiteMonitorMonitoring(siteId: string, monitorId: string): Promise<void>`

Stops monitoring for a specific monitor.

```typescript
const { stopSiteMonitorMonitoring } = useStore();

await stopSiteMonitorMonitoring("site-id-123", "monitor-id-456");
```

### Synchronization Actions

#### `fullSyncFromBackend(): Promise<void>`

Performs a complete synchronization with the backend.

```typescript
const { fullSyncFromBackend } = useStore();

await fullSyncFromBackend();
```

#### `syncSitesFromBackend(): Promise<void>`

Syncs only site data from the backend.

```typescript
const { syncSitesFromBackend } = useStore();

await syncSitesFromBackend();
```

### Settings Actions

#### `updateSettings(settings: Partial<AppSettings>): void`

Updates application settings.

```typescript
const { updateSettings } = useStore();

updateSettings({
    notifications: true,
    theme: "dark",
    timeout: 10000
});
```

#### `resetSettings(): void`

Resets all settings to default values.

```typescript
const { resetSettings } = useStore();

resetSettings();
```

### UI State Actions

#### `setShowSettings(show: boolean): void`

Controls settings modal visibility.

```typescript
const { setShowSettings } = useStore();

setShowSettings(true);
```

#### `setSelectedSite(site: Site | undefined): void`

Sets the currently selected site.

```typescript
const { setSelectedSite } = useStore();

setSelectedSite(site);
```

#### `setShowSiteDetails(show: boolean): void`

Controls site details modal visibility.

```typescript
const { setShowSiteDetails } = useStore();

setShowSiteDetails(true);
```

#### `setActiveSiteDetailsTab(tab: string): void`

Sets the active tab in site details modal.

```typescript
const { setActiveSiteDetailsTab } = useStore();

setActiveSiteDetailsTab("analytics");
```

### Error Management Actions

#### `setError(error: string | undefined): void`

Sets the global error message.

```typescript
const { setError } = useStore();

setError("Failed to connect to server");
```

#### `clearError(): void`

Clears the current error message.

```typescript
const { clearError } = useStore();

clearError();
```

#### `setLoading(loading: boolean): void`

Sets the global loading state.

```typescript
const { setLoading } = useStore();

setLoading(true);
```

### Monitor Selection Actions

#### `setSelectedMonitorId(siteId: string, monitorId: string): void`

Sets the selected monitor for a site.

```typescript
const { setSelectedMonitorId } = useStore();

setSelectedMonitorId("site-id-123", "monitor-id-456");
```

#### `getSelectedMonitorId(siteId: string): string | undefined`

Gets the selected monitor ID for a site.

```typescript
const { getSelectedMonitorId } = useStore();

const monitorId = getSelectedMonitorId("site-id-123");
```

## Selectors

### `getSelectedSite(): Site | undefined`

Returns the currently selected site.

```typescript
const { getSelectedSite } = useStore();

const selectedSite = getSelectedSite();
```

## Usage Examples

### Basic Store Usage

```typescript
import { useStore } from './store';

function MyComponent() {
    const {
        sites,
        settings,
        isLoading,
        createSite,
        updateSettings
    } = useStore();

    const handleCreateSite = async () => {
        try {
            await createSite({
                name: "New Site",
                monitors: [{
                    id: crypto.randomUUID(),
                    type: "http",
                    url: "https://example.com",
                    status: "pending",
                    history: []
                }]
            });
        } catch (error) {
            console.error("Failed to create site:", error);
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Sites: {sites.length}</h1>
            <button onClick={handleCreateSite}>
                Add Site
            </button>
        </div>
    );
}
```

### Settings Management

```typescript
function SettingsComponent() {
    const { settings, updateSettings } = useStore();

    const handleThemeChange = (theme: ThemeName) => {
        updateSettings({ theme });
    };

    const handleNotificationsToggle = () => {
        updateSettings({ 
            notifications: !settings.notifications 
        });
    };

    return (
        <div>
            <label>
                <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={handleNotificationsToggle}
                />
                Enable notifications
            </label>
            
            <select 
                value={settings.theme}
                onChange={(e) => handleThemeChange(e.target.value as ThemeName)}
            >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
            </select>
        </div>
    );
}
```

### Error Handling

```typescript
function ErrorBoundaryComponent() {
    const { lastError, clearError } = useStore();

    if (lastError) {
        return (
            <div className="error-banner">
                <span>{lastError}</span>
                <button onClick={clearError}>
                    Dismiss
                </button>
            </div>
        );
    }

    return null;
}
```

## Error Handling

### Common Error Scenarios

1. **Network Failures**: Backend communication errors
2. **Validation Errors**: Invalid site or monitor data
3. **Timeout Errors**: Operations exceeding timeout limits
4. **State Conflicts**: Concurrent state modifications

### Error Recovery Patterns

```typescript
// Automatic retry with exponential backoff
const { createSite, setError } = useStore();

const createSiteWithRetry = async (siteData: any, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            await createSite(siteData);
            return;
        } catch (error) {
            if (attempt === maxRetries) {
                setError(`Failed to create site after ${maxRetries} attempts`);
                throw error;
            }
            
            const delay = Math.pow(2, attempt) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};
```

## Migration Guide

### Store Structure Best Practices

The store supports multi-monitor sites with the following structure:

1. **Site structure**: Each site can have multiple monitors in the `monitors` array
2. **Theme management**: Use `settings.theme` for theme preferences
3. **Monitor actions**: Require both `siteId` and `monitorId` for specificity

### Version History

- **v2.0.0**: Introduced multi-monitor support
- **v1.5.0**: Added theme system
- **v1.3.0**: Added per-monitor state management

### Best Practice Example

```typescript
// Current site structure (v2.x+)
const site = {
    identifier: "site-1",
    name: "My Site",
    monitors: [{
        id: "monitor-1",
        type: "http",
        url: "https://example.com",
        status: "up",
        history: []
    }]
};
```

## See Also

- [📋 Types API](types-api) - Core type definitions and interfaces
- [🔗 IPC API](ipc-api) - Electron backend communication
- [🧩 Hook APIs](hook-apis) - React hooks that use the store
- [🎨 Theme API](theme-api) - Theme system integration
- [📊 Monitor API](monitor-api) - Monitoring service integration

---

> **Related:** [📚 API Reference](README) | [📖 Documentation Home](../README)

- [Hook APIs](hook-apis) - React hooks for store integration
