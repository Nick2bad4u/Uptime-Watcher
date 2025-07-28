# Function: validateMonitor()

> **validateMonitor**(`monitor`): `monitor is Monitor`

Defined in: [shared/utils/validation.ts:37](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/utils/validation.ts#L37)

Enhanced monitor validation using shared type guards.
Provides consistent validation across frontend and backend.

## Parameters

### monitor

[`Partial`](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype)\<[`Monitor`](../../../types/interfaces/Monitor.md)\>

Partial monitor data to validate

## Returns

`monitor is Monitor`

Type predicate indicating if the monitor is valid
