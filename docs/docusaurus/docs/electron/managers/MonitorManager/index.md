# electron/managers/MonitorManager

Orchestrates all monitoring operations for sites and monitors, including
scheduling, status checking, and lifecycle management across the Electron
backend.

## Remarks

Coordinates monitor lifecycle, scheduling, and event-driven updates for sites
and monitors. All backend monitoring logic flows through this manager.
Interacts with repositories, event bus, and service layer according to the
repository and event-driven patterns.

Key responsibilities:

- Monitor lifecycle management (create, start, stop, delete)
- Scheduled monitoring with configurable intervals
- Status checking and health monitoring for sites
- Event emission for monitor state changes and status updates
- Cache coordination for real-time monitor data access
- Integration with enhanced monitoring services
- Error handling and recovery for failed monitoring operations
- Transaction management for monitor database operations

## Examples

```typescript
const monitorManager = new MonitorManager({
    eventBus,
    siteRepository,
    monitorRepository,
    historyRepository,
    databaseService,
    cache,
});

// Start monitoring for a site
const monitor = await monitorManager.startMonitoring(siteId);

// Check status manually
const status = await monitorManager.checkSiteStatus(siteId);
```

```typescript
// Listen for status updates
eventBus.onTyped("monitor:statusUpdated", (data) => {
    console.log(`Site ${data.siteId} status: ${data.status}`);
});

// Monitor will emit events automatically
await monitorManager.startMonitoring(siteId);
```

## Classes

- [MonitorManager](classes/MonitorManager.md)

## Interfaces

- [MonitorManagerDependencies](interfaces/MonitorManagerDependencies.md)
