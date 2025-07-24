# Class: MonitorValidator

Defined in: [electron/managers/validators/MonitorValidator.ts:30](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/managers/validators/MonitorValidator.ts#L30)

Validates monitor configuration according to business rules.
Uses registry-driven validation with Zod schemas.

## Constructors

### Constructor

> **new MonitorValidator**(): `MonitorValidator`

#### Returns

`MonitorValidator`

## Methods

### shouldApplyDefaultInterval()

> **shouldApplyDefaultInterval**(`monitor`): `boolean`

Defined in: [electron/managers/validators/MonitorValidator.ts:37](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/managers/validators/MonitorValidator.ts#L37)

Business rule: Determine if a monitor should receive a default interval.

#### Parameters

##### monitor

[`Monitor`](../../../../../shared/types/interfaces/Monitor.md)

The monitor configuration to evaluate

#### Returns

`boolean`

True if the monitor should receive a default check interval

***

### validateMonitorConfiguration()

> **validateMonitorConfiguration**(`monitor`): [`ValidationResult`](../../interfaces/interfaces/ValidationResult.md)

Defined in: [electron/managers/validators/MonitorValidator.ts:48](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/managers/validators/MonitorValidator.ts#L48)

Validate monitor configuration according to business rules.
Uses shared Zod schemas for comprehensive validation.

#### Parameters

##### monitor

[`Monitor`](../../../../../shared/types/interfaces/Monitor.md)

The monitor configuration to validate

#### Returns

[`ValidationResult`](../../interfaces/interfaces/ValidationResult.md)

Validation result with errors and validity status
