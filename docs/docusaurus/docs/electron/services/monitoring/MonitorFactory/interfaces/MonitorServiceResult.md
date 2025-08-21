# Interface: MonitorServiceResult

Defined in: [electron/services/monitoring/MonitorFactory.ts:39](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorFactory.ts#L39)

Result of monitor service retrieval with configuration status.

## Remarks

This interface uses `exactOptionalPropertyTypes` TypeScript configuration,
which means optional properties must be explicitly handled to avoid type
errors. The `configurationError` property should only be included when
there's an actual error.

## Properties

### configurationApplied

> **configurationApplied**: `boolean`

Defined in: [electron/services/monitoring/MonitorFactory.ts:43](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorFactory.ts#L43)

Whether configuration was successfully applied (if config was provided)

***

### configurationError?

> `optional` **configurationError**: `string`

Defined in: [electron/services/monitoring/MonitorFactory.ts:48](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorFactory.ts#L48)

Configuration error message if application failed (only present when
there's an error)

***

### instance

> **instance**: [`IMonitorService`](../../types/interfaces/IMonitorService.md)

Defined in: [electron/services/monitoring/MonitorFactory.ts:50](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorFactory.ts#L50)

The monitor service instance
