# Interface: MonitorServiceResult

Defined in: [electron/services/monitoring/MonitorFactory.ts:14](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/MonitorFactory.ts#L14)

Result of monitor service retrieval with configuration status.

## Remarks

This interface uses `exactOptionalPropertyTypes` TypeScript configuration,
which means optional properties must be explicitly handled to avoid type errors.
The `configurationError` property should only be included when there's an actual error.

## Properties

### configurationApplied

> **configurationApplied**: `boolean`

Defined in: [electron/services/monitoring/MonitorFactory.ts:16](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/MonitorFactory.ts#L16)

Whether configuration was successfully applied (if config was provided)

***

### configurationError?

> `optional` **configurationError**: `string`

Defined in: [electron/services/monitoring/MonitorFactory.ts:18](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/MonitorFactory.ts#L18)

Configuration error message if application failed (only present when there's an error)

***

### instance

> **instance**: [`IMonitorService`](../../types/interfaces/IMonitorService.md)

Defined in: [electron/services/monitoring/MonitorFactory.ts:20](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/MonitorFactory.ts#L20)

The monitor service instance
