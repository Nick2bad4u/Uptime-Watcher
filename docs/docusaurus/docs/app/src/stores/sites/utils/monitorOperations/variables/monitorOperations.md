# Variable: monitorOperations

> `const` **monitorOperations**: `object`

Defined in: [src/stores/sites/utils/monitorOperations.ts:168](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/sites/utils/monitorOperations.ts#L168)

Creates monitor update operations

## Type declaration

### toggleMonitoring()

> **toggleMonitoring**: (`monitor`) => [`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

Toggle monitor monitoring state

#### Parameters

##### monitor

[`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

#### Returns

[`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

### updateCheckInterval()

> **updateCheckInterval**: (`monitor`, `interval`) => [`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

Update monitor check interval

#### Parameters

##### monitor

[`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

##### interval

`number`

#### Returns

[`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

### updateRetryAttempts()

> **updateRetryAttempts**: (`monitor`, `retryAttempts`) => [`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

Update monitor retry attempts

#### Parameters

##### monitor

[`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

##### retryAttempts

`number`

#### Returns

[`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

### updateStatus()

> **updateStatus**: (`monitor`, `status`) => [`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

Update monitor status

#### Parameters

##### monitor

[`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

The monitor to update

##### status

[`MonitorStatus`](../../../../../../shared/types/type-aliases/MonitorStatus.md)

The new status to set

#### Returns

[`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

Updated monitor with validated status

#### Throws

Error if status is not valid

### updateTimeout()

> **updateTimeout**: (`monitor`, `timeout`) => [`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

Update monitor timeout

#### Parameters

##### monitor

[`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

##### timeout

`number`

#### Returns

[`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)
