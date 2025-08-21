# electron/services/monitoring/MonitorStatusUpdateService

Monitor status update service with operation correlation support.

## Remarks

This service ensures that status updates from monitoring operations are only
applied if the operation is still valid and the monitor is actively
monitoring. Prevents race conditions between state changes and delayed check
results.

## Classes

- [MonitorStatusUpdateService](classes/MonitorStatusUpdateService.md)

## Interfaces

- [StatusUpdateMonitorCheckResult](interfaces/StatusUpdateMonitorCheckResult.md)
