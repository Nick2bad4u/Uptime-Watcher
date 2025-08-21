# electron/services/application/ApplicationService

Main application service that orchestrates all other services and coordinates
application lifecycle across the Electron backend.

## Remarks

Uses dependency injection through [ServiceContainer](../../ServiceContainer/classes/ServiceContainer.md) to manage all
services and their dependencies. Provides proper initialization order, event
handler setup, and cleanup. Handles Electron app events and orchestrates
service startup and shutdown.

Key responsibilities:

- Application lifecycle management (startup, shutdown, error handling)
- Service container initialization and dependency injection
- Event handler registration for Electron app events
- Graceful shutdown coordination for all services
- Error handling and recovery for application-level failures
- Development vs production environment handling
- Service health monitoring and status reporting

## Examples

```typescript
const appService = new ApplicationService();

// Initialize all services
await appService.initializeServices();

// Start the application
await appService.startApplication();

// Shutdown gracefully
await appService.shutdown();
```

```typescript
// Access services through the container
const databaseManager = appService.getDatabaseManager();
const monitorManager = appService.getMonitorManager();
```

## Classes

- [ApplicationService](classes/ApplicationService.md)
