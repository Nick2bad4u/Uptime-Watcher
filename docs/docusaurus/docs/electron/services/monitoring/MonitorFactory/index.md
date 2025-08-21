# electron/services/monitoring/MonitorFactory

Factory for creating and managing monitor service instances with
configuration support.

## Remarks

Provides singleton-pattern monitor service instances with configuration
management. Validates monitor types against the registry and ensures only one
instance per monitor type exists. Supports configuration updates and cache
management for all registered monitor types.

## Interfaces

- [MonitorServiceResult](interfaces/MonitorServiceResult.md)

## Functions

- [clearMonitorFactoryCache](functions/clearMonitorFactoryCache.md)
- [getAvailableMonitorTypes](functions/getAvailableMonitorTypes.md)
- [getMonitorWithResult](functions/getMonitorWithResult.md)
- [getMonitor](functions/getMonitor.md)
- [updateMonitorConfig](functions/updateMonitorConfig.md)
