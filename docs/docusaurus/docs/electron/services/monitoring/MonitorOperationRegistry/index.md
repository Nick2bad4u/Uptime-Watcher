# electron/services/monitoring/MonitorOperationRegistry

Monitor operation registry for tracking and correlating monitoring
operations.

## Remarks

This service provides operation correlation to prevent race conditions
between monitor state changes and delayed check operations. Each monitoring
operation is assigned a unique ID and tracked throughout its lifecycle.

## Classes

- [MonitorOperationRegistry](classes/MonitorOperationRegistry.md)

## Interfaces

- [MonitorCheckOperation](interfaces/MonitorCheckOperation.md)
- [MonitorCheckResult](interfaces/MonitorCheckResult.md)

## Variables

- [operationRegistry](variables/operationRegistry.md)
