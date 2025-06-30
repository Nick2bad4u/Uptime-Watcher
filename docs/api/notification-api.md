# 🔔 Notification API Reference

> **Navigation:** [📖 Docs Home](../README) » [📚 API Reference](README) » **Notification API**

The Notification API provides system notification functionality for monitoring status changes with configurable alert settings.

## Classes

### NotificationService

Main service class for handling system notifications.

```typescript
export class NotificationService {
 constructor(config?: NotificationConfig);
}
```

#### Constructor

- **config** (`NotificationConfig`, optional): Initial notification configuration
  - Default: `{ showDownAlerts: true, showUpAlerts: true }`

#### Methods

##### notifyMonitorDown(site: Site, monitorId: string): void

Shows a notification when a monitor goes down.

**Parameters:**

- **site** (`Site`): The site object containing monitor information
- **monitorId** (`string`): ID of the monitor that went down

**Behavior:**

- Only shows notification if `showDownAlerts` is enabled
- Uses critical urgency level
- Logs the alert event
- Gracefully handles unsupported platforms

**Example:**

```typescript
const notificationService = new NotificationService();
notificationService.notifyMonitorDown(site, "monitor-123");
```

##### notifyMonitorUp(site: Site, monitorId: string): void

Shows a notification when a monitor comes back up.

**Parameters:**

- **site** (`Site`): The site object containing monitor information
- **monitorId** (`string`): ID of the monitor that came back up

**Behavior:**

- Only shows notification if `showUpAlerts` is enabled
- Uses normal urgency level
- Logs the restoration event
- Gracefully handles unsupported platforms

**Example:**

```typescript
notificationService.notifyMonitorUp(site, "monitor-123");
```

##### updateConfig(config: Partial&lt;NotificationConfig&gt;): void

Updates the notification configuration.

**Parameters:**

- **config** (`Partial<NotificationConfig>`): Partial configuration to merge

**Example:**

```typescript
notificationService.updateConfig({ showDownAlerts: false });
```

##### getConfig(): NotificationConfig

Returns the current notification configuration.

**Returns:** Complete notification configuration object

**Example:**

```typescript
const config = notificationService.getConfig();
console.log(config.showDownAlerts); // true/false
```

##### isSupported(): boolean

Checks if notifications are supported on the current platform.

**Returns:** `true` if notifications are supported, `false` otherwise

**Example:**

```typescript
if (notificationService.isSupported()) {
 // Safe to show notifications
}
```

## Interfaces

### NotificationConfig

Configuration interface for notification settings.

```typescript
export interface NotificationConfig {
 showDownAlerts: boolean;
 showUpAlerts: boolean;
}
```

**Properties:**

- **showDownAlerts** (`boolean`): Whether to show notifications when monitors go down
- **showUpAlerts** (`boolean`): Whether to show notifications when monitors come back up

## Usage Examples

### Basic Setup

```typescript
import { NotificationService } from "./services/notifications/NotificationService";

// Create with default settings
const notifications = new NotificationService();

// Create with custom settings
const customNotifications = new NotificationService({
 showDownAlerts: true,
 showUpAlerts: false, // Only show down alerts
});
```

### Monitoring Integration

```typescript
// In monitoring service
class MonitoringService {
 private notifications: NotificationService;

 constructor() {
  this.notifications = new NotificationService();
 }

 private handleStatusChange(site: Site, monitorId: string, newStatus: string) {
  if (newStatus === "down") {
   this.notifications.notifyMonitorDown(site, monitorId);
  } else if (newStatus === "up") {
   this.notifications.notifyMonitorUp(site, monitorId);
  }
 }
}
```

### Dynamic Configuration

```typescript
// Toggle notifications based on user preferences
function updateNotificationSettings(preferences: UserPreferences) {
 notifications.updateConfig({
  showDownAlerts: preferences.enableDownAlerts,
  showUpAlerts: preferences.enableUpAlerts,
 });
}

// Check platform support before enabling
if (notifications.isSupported()) {
 updateNotificationSettings(userPrefs);
} else {
 console.warn("Notifications not supported on this platform");
}
```

## Error Handling

The NotificationService handles errors gracefully:

- **Platform Support**: Automatically checks `Notification.isSupported()` before attempting to show notifications
- **Missing Monitor**: Uses "unknown" as fallback monitor type if monitor not found in site
- **Logging**: All notification events are logged for debugging and audit purposes

## Platform Considerations

- **Windows**: Full notification support with action center integration
- **macOS**: Native notification center support
- **Linux**: Depends on desktop environment notification support
- **Electron**: Uses system notification APIs regardless of platform

## Integration Notes

- Service is designed to work with the main Electron process
- Integrates with the application's logging system
- Works alongside the monitoring service for real-time status updates
- Configuration can be persisted and restored across application sessions

## See Also

- [📊 Monitor API](monitor-api) - Monitoring service integration
- [📋 Types API](types-api) - Site and monitor type definitions
- [📝 Logger API](logger-api) - Event logging integration
- [🏪 Store API](store-api) - Configuration state management
- [🔗 IPC API](ipc-api) - Electron main/renderer communication
- [💾 Database API](database-api) - Settings persistence

---

> **Related:** [📚 API Reference](README) | [📖 Documentation Home](../README)
