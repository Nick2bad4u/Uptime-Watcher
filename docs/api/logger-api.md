# 📝 Logger API Reference

> **Navigation:** [📖 Docs Home](../README) » [📚 API Reference](README/) » **Logger API**

The Logger API provides centralized logging functionality with structured formatting and categorization for both frontend and backend components.

## Frontend Logger (Renderer Process)

Located in `src/services/logger.ts` - provides logging for the React application.

### Default Export: logger

Main logger object with comprehensive logging capabilities.

```typescript
import logger from './services/logger';
```

#### Basic Logging Methods

##### debug(message: string, ...args: unknown[]): void

Log debug information for development purposes.

**Parameters:**

- **message** (`string`): The debug message
- **args** (`unknown[]`): Additional arguments to log

**Example:**

```typescript
logger.debug('Component mounted', { componentName: 'SiteCard' });
```

##### info(message: string, ...args: unknown[]): void

Log general application flow information.

**Parameters:**

- **message** (`string`): The info message
- **args** (`unknown[]`): Additional arguments to log

**Example:**

```typescript
logger.info('User action completed successfully');
```

##### warn(message: string, ...args: unknown[]): void

Log warnings for unexpected but non-error conditions.

**Parameters:**

- **message** (`string`): The warning message
- **args** (`unknown[]`): Additional arguments to log

**Example:**

```typescript
logger.warn('API response took longer than expected', { duration: 5000 });
```

##### error(message: string, error?: Error | unknown, ...args: unknown[]): void

Log errors with optional error object handling.

**Parameters:**

- **message** (`string`): The error message
- **error** (`Error | unknown`, optional): Error object or additional data
- **args** (`unknown[]`): Additional arguments to log

**Example:**

```typescript
try {
    // Some operation
} catch (error) {
    logger.error('Operation failed', error);
}
```

##### verbose(message: string, ...args: unknown[]): void

Log very detailed debugging information.

##### silly(message: string, ...args: unknown[]): void

Log extremely detailed debugging information.

#### Specialized Logging Categories

##### app

Application lifecycle and performance logging.

```typescript
logger.app.started()
logger.app.stopped()
logger.app.error(context: string, error: Error)
logger.app.performance(operation: string, duration: number)
```

**Examples:**

```typescript
logger.app.started(); // Log application startup
logger.app.performance('Data fetch', 150); // Log operation timing
logger.app.error('initialization', new Error('Config missing'));
```

##### site

Site monitoring and status logging.

```typescript
logger.site.added(identifier: string)
logger.site.removed(identifier: string)
logger.site.check(identifier: string, status: string, responseTime?: number)
logger.site.statusChange(identifier: string, oldStatus: string, newStatus: string)
logger.site.error(identifier: string, error: Error | string)
```

**Examples:**

```typescript
logger.site.added('example.com');
logger.site.check('example.com', 'up', 250);
logger.site.statusChange('example.com', 'down', 'up');
logger.site.error('example.com', 'Connection timeout');
```

##### user

User interaction and settings logging.

```typescript
logger.user.action(action: string, details?: unknown)
logger.user.settingsChange(setting: string, oldValue: unknown, newValue: unknown)
```

**Examples:**

```typescript
logger.user.action('Site added', { url: 'example.com' });
logger.user.settingsChange('theme', 'light', 'dark');
```

##### system

System and Electron event logging.

```typescript
logger.system.notification(title: string, body: string)
logger.system.window(action: string, windowName?: string)
logger.system.tray(action: string)
```

**Examples:**

```typescript
logger.system.notification('Status Alert', 'Site is down');
logger.system.window('minimized', 'main');
logger.system.tray('clicked');
```

#### Raw Access

Access to the underlying electron-log instance for special cases:

```typescript
logger.raw.transports.file.level = 'error';
```

## Backend Logger (Main Process)

Located in `electron/utils/logger.ts` - provides logging for the Electron main process.

### Exported Loggers

#### logger

General purpose backend logger with MONITOR prefix.

```typescript
import { logger } from './utils/logger';

logger.debug(message: string, ...args: unknown[])
logger.info(message: string, ...args: unknown[])
logger.warn(message: string, ...args: unknown[])
logger.error(message: string, error?: unknown, ...args: unknown[])
```

#### dbLogger

Database-specific logger with DB prefix.

```typescript
import { dbLogger } from './utils/logger';

dbLogger.debug('Query executed', { query: 'SELECT * FROM sites' });
dbLogger.error('Connection failed', error);
```

#### monitorLogger

Monitor-specific logger with MONITOR prefix.

```typescript
import { monitorLogger } from './utils/logger';

monitorLogger.info('Health check started', { siteId: 'example.com' });
monitorLogger.warn('Slow response detected', { responseTime: 5000 });
```

## Configuration

### Frontend Logger Configuration

The frontend logger is configured with:

- **Console transport**: Debug level with timestamp formatting
- **File transport**: Info level (handled by main process via IPC)
- **Format**: `[{h}:{i}:{s}.{ms}] [{level}] {text}`

### Backend Logger Configuration

The backend loggers use electron-log/main with:

- **Prefixed messages**: Each logger adds its own prefix (`[MONITOR]`, `[DB]`)
- **Error handling**: Automatic error object formatting with stack traces
- **Consistent formatting**: Structured logging across all backend services

## Usage Examples

### Error Handling Pattern

```typescript
// Frontend
async function fetchSiteData(siteId: string) {
    try {
        logger.debug('Fetching site data', { siteId });
        const data = await api.getSite(siteId);
        logger.info('Site data fetched successfully');
        return data;
    } catch (error) {
        logger.error('Failed to fetch site data', error, { siteId });
        throw error;
    }
}

// Backend
async function checkSiteHealth(site: Site) {
    try {
        monitorLogger.info('Starting health check', { site: site.identifier });
        const result = await performCheck(site);
        monitorLogger.debug('Health check completed', { result });
        return result;
    } catch (error) {
        monitorLogger.error('Health check failed', error, { site: site.identifier });
        throw error;
    }
}
```

### Performance Monitoring

```typescript
// Track operation performance
const startTime = Date.now();
await performOperation();
const duration = Date.now() - startTime;
logger.app.performance('Data synchronization', duration);
```

### Status Change Tracking

```typescript
// Log site status changes
function handleStatusChange(site: Site, oldStatus: string, newStatus: string) {
    logger.site.statusChange(site.identifier, oldStatus, newStatus);
    
    if (newStatus === 'down') {
        logger.warn('Site went down', { 
            site: site.identifier,
            lastCheck: site.lastChecked 
        });
    }
}
```

## Best Practices

### Message Formatting

- Use clear, descriptive messages
- Include relevant context data as additional arguments
- Use consistent terminology across the application

### Log Levels

- **debug**: Development debugging, verbose information
- **info**: Normal application flow, user actions
- **warn**: Unexpected conditions that don't prevent operation
- **error**: Errors that require attention or prevent operation

### Context Information

Always include relevant context:

```typescript
// Good
logger.error('Site check failed', error, { 
    siteId: site.identifier, 
    monitorType: monitor.type,
    attempt: retryCount 
});

// Avoid
logger.error('Check failed', error);
```

### Performance Considerations

- Use appropriate log levels to avoid performance impact in production
- Pass objects as additional arguments rather than stringifying them
- Use debug/verbose levels for high-frequency operations

## Integration Notes

- Frontend and backend loggers are coordinated through electron-log
- File logging is centralized in the main process
- All logs include consistent timestamp and level formatting
- Structured data is preserved for analysis and debugging
- Log files are automatically rotated and managed by electron-log

## See Also

- [🔔 Notification API](notification-api/) - System notification logging
- [📊 Monitor API](monitor-api/) - Monitoring event logging
- [🏪 Store API](store-api/) - State change logging
- [💾 Database API](database-api/) - Database operation logging
- [🔗 IPC API](ipc-api/) - Inter-process communication logging
- [🛠️ Utilities API](utilities-api/) - Utility function logging

---

> **Related:** [📚 API Reference](README/) | [📖 Documentation Home](../README)
