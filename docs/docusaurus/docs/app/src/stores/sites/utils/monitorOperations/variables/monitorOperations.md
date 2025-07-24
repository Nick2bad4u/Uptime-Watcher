# Variable: monitorOperations

> `const` **monitorOperations**: `object`

Defined in: [src/stores/sites/utils/monitorOperations.ts:114](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/utils/monitorOperations.ts#L114)

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

##### status

[`MonitorStatus`](../../../../../../shared/types/type-aliases/MonitorStatus.md)

#### Returns

[`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

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
