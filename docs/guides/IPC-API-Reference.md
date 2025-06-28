# IPC API Reference

## Overview

This document describes the Inter-Process Communication (IPC) API between the Electron main process and renderer process in Uptime Watcher. The API is organized by domain and provides type-safe communication channels.

---

## API Organization

The IPC API is organized into logical domains:

- **Sites:** Site management operations
- **Monitors:** Monitoring configuration and status
- **Settings:** Application settings and preferences
- **Database:** Data persistence operations
- **Window:** Window management and lifecycle
- **Notifications:** User notification system

---

## Sites API

### `sites:create`

Create a new site for monitoring.

**Request:**
```typescript
interface CreateSiteRequest {
  url: string;
  name?: string;
  monitorType: 'http' | 'port';
  interval?: number;
  timeout?: number;
}
```

**Response:**
```typescript
interface Site {
  id: string;
  url: string;
  name: string;
  monitors: Monitor[];
  createdAt: string;
  updatedAt: string;
}
```

**Usage:**
```typescript
const site = await window.electronAPI.sites.create({
  url: 'https://example.com',
  name: 'Example Site',
  monitorType: 'http'
});
```

### `sites:update`

Update an existing site configuration.

**Request:**
```typescript
interface UpdateSiteRequest {
  id: string;
  updates: Partial<CreateSiteRequest>;
}
```

**Response:**
```typescript
interface Site {
  // Same as create response
}
```

### `sites:delete`

Delete a site and all its monitoring data.

**Request:**
```typescript
interface DeleteSiteRequest {
  id: string;
}
```

**Response:**
```typescript
interface DeleteSiteResponse {
  success: boolean;
  deletedId: string;
}
```

### `sites:list`

Get all configured sites.

**Request:** None

**Response:**
```typescript
interface Site[] {
  // Array of Site objects
}
```

### `sites:get`

Get a specific site by ID.

**Request:**
```typescript
interface GetSiteRequest {
  id: string;
}
```

**Response:**
```typescript
interface Site {
  // Site object or null if not found
}
```

---

## Monitors API

### `monitors:start`

Start monitoring for a specific site.

**Request:**
```typescript
interface StartMonitorRequest {
  siteId: string;
  monitorType: 'http' | 'port';
  config: MonitorConfig;
}
```

**Response:**
```typescript
interface StartMonitorResponse {
  success: boolean;
  monitorId: string;
}
```

### `monitors:stop`

Stop monitoring for a specific site.

**Request:**
```typescript
interface StopMonitorRequest {
  siteId: string;
  monitorId: string;
}
```

**Response:**
```typescript
interface StopMonitorResponse {
  success: boolean;
  stoppedMonitorId: string;
}
```

### `monitors:status`

Get current monitoring status for a site.

**Request:**
```typescript
interface MonitorStatusRequest {
  siteId: string;
}
```

**Response:**
```typescript
interface MonitorStatus {
  siteId: string;
  status: 'online' | 'offline' | 'unknown';
  lastCheck: string;
  responseTime?: number;
  error?: string;
}
```

### `monitors:history`

Get monitoring history for a site.

**Request:**
```typescript
interface MonitorHistoryRequest {
  siteId: string;
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
}
```

**Response:**
```typescript
interface MonitorHistoryResponse {
  checks: MonitorCheck[];
  total: number;
  hasMore: boolean;
}

interface MonitorCheck {
  id: string;
  siteId: string;
  timestamp: string;
  status: 'online' | 'offline' | 'error';
  responseTime?: number;
  statusCode?: number;
  error?: string;
}
```

---

## Settings API

### `settings:get`

Get application settings.

**Request:**
```typescript
interface GetSettingsRequest {
  keys?: string[]; // Optional: specific keys to retrieve
}
```

**Response:**
```typescript
interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  checkInterval: number;
  historyRetention: number;
  autoStart: boolean;
  minimizeToTray: boolean;
}
```

### `settings:update`

Update application settings.

**Request:**
```typescript
interface UpdateSettingsRequest {
  settings: Partial<AppSettings>;
}
```

**Response:**
```typescript
interface UpdateSettingsResponse {
  success: boolean;
  updatedSettings: AppSettings;
}
```

---

## Database API

### `database:backup`

Create a backup of the database.

**Request:**
```typescript
interface BackupRequest {
  path?: string; // Optional: custom backup path
}
```

**Response:**
```typescript
interface BackupResponse {
  success: boolean;
  backupPath: string;
  timestamp: string;
}
```

### `database:restore`

Restore database from backup.

**Request:**
```typescript
interface RestoreRequest {
  backupPath: string;
}
```

**Response:**
```typescript
interface RestoreResponse {
  success: boolean;
  restoredFrom: string;
}
```

### `database:export`

Export data in various formats.

**Request:**
```typescript
interface ExportRequest {
  format: 'json' | 'csv' | 'xml';
  path: string;
  includeHistory?: boolean;
}
```

**Response:**
```typescript
interface ExportResponse {
  success: boolean;
  exportPath: string;
  recordCount: number;
}
```

---

## Window API

### `window:minimize`

Minimize the application window.

**Request:** None

**Response:**
```typescript
interface WindowResponse {
  success: boolean;
}
```

### `window:maximize`

Maximize or restore the application window.

**Request:** None

**Response:**
```typescript
interface WindowResponse {
  success: boolean;
  isMaximized: boolean;
}
```

### `window:close`

Close the application window.

**Request:** None

**Response:** None (window closes)

### `window:hide`

Hide the application window to system tray.

**Request:** None

**Response:**
```typescript
interface WindowResponse {
  success: boolean;
}
```

### `window:show`

Show the application window from system tray.

**Request:** None

**Response:**
```typescript
interface WindowResponse {
  success: boolean;
}
```

---

## Notifications API

### `notifications:show`

Show a system notification.

**Request:**
```typescript
interface ShowNotificationRequest {
  title: string;
  body: string;
  icon?: string;
  urgent?: boolean;
  silent?: boolean;
}
```

**Response:**
```typescript
interface NotificationResponse {
  success: boolean;
  notificationId: string;
}
```

### `notifications:permission`

Check notification permission status.

**Request:** None

**Response:**
```typescript
interface NotificationPermission {
  granted: boolean;
  canRequest: boolean;
}
```

---

## Event Channels

The IPC API also includes event channels for real-time updates:

### Site Status Updates

**Channel:** `site-status-changed`

**Payload:**
```typescript
interface SiteStatusEvent {
  siteId: string;
  status: 'online' | 'offline' | 'error';
  timestamp: string;
  responseTime?: number;
  previousStatus?: string;
}
```

**Usage:**
```typescript
window.electronAPI.onSiteStatusChanged((event) => {
  console.log('Site status changed:', event);
});
```

### Monitor Events

**Channel:** `monitor-event`

**Payload:**
```typescript
interface MonitorEvent {
  type: 'started' | 'stopped' | 'error' | 'check-completed';
  siteId: string;
  monitorId: string;
  timestamp: string;
  data?: any;
}
```

### Settings Changes

**Channel:** `settings-changed`

**Payload:**
```typescript
interface SettingsChangedEvent {
  changedKeys: string[];
  newSettings: Partial<AppSettings>;
}
```

---

## Error Handling

All IPC calls return standardized error responses when failures occur:

```typescript
interface IPCError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

### Common Error Codes

- `SITE_NOT_FOUND` - Requested site does not exist
- `MONITOR_ERROR` - Monitoring operation failed
- `DATABASE_ERROR` - Database operation failed
- `PERMISSION_DENIED` - Insufficient permissions
- `VALIDATION_ERROR` - Invalid request data
- `NETWORK_ERROR` - Network connectivity issue

---

## Type Definitions

The complete TypeScript type definitions are available in:

- `electron/types.ts` - Backend type definitions
- `src/types.ts` - Frontend type definitions
- `electron/preload.ts` - IPC bridge type definitions

---

## Usage Examples

### Complete Site Management Example

```typescript
// Create a new site
const newSite = await window.electronAPI.sites.create({
  url: 'https://api.example.com',
  name: 'Example API',
  monitorType: 'http'
});

// Start monitoring
await window.electronAPI.monitors.start({
  siteId: newSite.id,
  monitorType: 'http',
  config: {
    interval: 60000, // 1 minute
    timeout: 30000   // 30 seconds
  }
});

// Listen for status changes
window.electronAPI.onSiteStatusChanged((event) => {
  if (event.siteId === newSite.id) {
    console.log(`${newSite.name} is now ${event.status}`);
  }
});

// Get monitoring history
const history = await window.electronAPI.monitors.history({
  siteId: newSite.id,
  limit: 100
});
```

### Settings Management Example

```typescript
// Get current settings
const settings = await window.electronAPI.settings.get();

// Update theme
await window.electronAPI.settings.update({
  settings: {
    theme: 'dark',
    notifications: true
  }
});

// Listen for settings changes
window.electronAPI.onSettingsChanged((event) => {
  console.log('Settings updated:', event.newSettings);
});
```

---

## Security Considerations

- All IPC channels are validated and type-checked
- User input is sanitized before database operations
- File system access is restricted to application directories
- Network requests include timeout and retry limits
- Database queries use parameterized statements

---

## Development Notes

- Use TypeScript for all IPC interactions
- Handle errors gracefully with user feedback
- Implement loading states for async operations
- Test IPC calls with various data scenarios
- Monitor IPC performance for large data transfers

---

For implementation details, see the source files:
- `electron/services/ipc/IpcService.ts`
- `electron/preload.ts`
- `src/services/electronAPI.ts`
