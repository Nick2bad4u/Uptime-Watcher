# Class: MonitorValidator

Defined in: [electron/managers/validators/MonitorValidator.ts:36](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/validators/MonitorValidator.ts#L36)

Validates monitor configuration according to business rules and shared Zod schemas.

## Remarks

This class provides monitor validation logic for SiteManager and ConfigurationManager.
It uses registry-driven validation and shared Zod schemas to ensure consistency between frontend and backend validation rules.

## Constructors

### Constructor

> **new MonitorValidator**(): `MonitorValidator`

#### Returns

`MonitorValidator`

## Methods

### shouldApplyDefaultInterval()

> **shouldApplyDefaultInterval**(`monitor`): `boolean`

Defined in: [electron/managers/validators/MonitorValidator.ts:53](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/validators/MonitorValidator.ts#L53)

Determines if a monitor should receive a default check interval according to business rules.

#### Parameters

##### monitor

[`Monitor`](../../../../../shared/types/interfaces/Monitor.md)

The monitor configuration to evaluate. Must be a member of [Site.monitors](../../../../../shared/types/interfaces/Site.md#monitors).

#### Returns

`boolean`

`true` if the monitor should receive a default check interval; otherwise, `false`.

#### Remarks

A default interval is applied if the monitor's `checkInterval` is zero.

#### Example

```typescript
if (validator.shouldApplyDefaultInterval(monitor)) {
  monitor.checkInterval = DEFAULT_INTERVAL;
}
```

***

### validateMonitorConfiguration()

> **validateMonitorConfiguration**(`monitor`): [`ValidationResult`](../../interfaces/interfaces/ValidationResult.md)

Defined in: [electron/managers/validators/MonitorValidator.ts:74](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/validators/MonitorValidator.ts#L74)

Validates a monitor configuration according to business rules and shared Zod schemas.

#### Parameters

##### monitor

[`Monitor`](../../../../../shared/types/interfaces/Monitor.md)

The monitor configuration to validate. Must be a member of [Site.monitors](../../../../../shared/types/interfaces/Site.md#monitors).

#### Returns

[`ValidationResult`](../../interfaces/interfaces/ValidationResult.md)

A [ValidationResult](../../interfaces/interfaces/ValidationResult.md) object containing an array of error messages and validity status.

#### Remarks

Uses registry-driven validation for timing, retry attempts, and type-specific requirements.

#### Example

```typescript
const result = validator.validateMonitorConfiguration(monitor);
if (!result.isValid) {
  console.error(result.errors);
}
```
