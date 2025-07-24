# Class: MonitorFactory

Defined in: [electron/services/monitoring/MonitorFactory.ts:11](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/monitoring/MonitorFactory.ts#L11)

Factory for creating and managing monitor services.
Uses the registry's service factories for complete automation.

## Constructors

### Constructor

> **new MonitorFactory**(): `MonitorFactory`

#### Returns

`MonitorFactory`

## Methods

### clearCache()

> `static` **clearCache**(): `void`

Defined in: [electron/services/monitoring/MonitorFactory.ts:18](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/monitoring/MonitorFactory.ts#L18)

Clear all cached service instances.
Useful for testing or configuration reloading.

#### Returns

`void`

***

### getAvailableTypes()

> `static` **getAvailableTypes**(): `string`[]

Defined in: [electron/services/monitoring/MonitorFactory.ts:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/monitoring/MonitorFactory.ts#L25)

Get all available monitor types from registry.

#### Returns

`string`[]

***

### getMonitor()

> `static` **getMonitor**(`type`, `config?`, `forceConfigUpdate?`): [`IMonitorService`](../../types/interfaces/IMonitorService.md)

Defined in: [electron/services/monitoring/MonitorFactory.ts:46](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/monitoring/MonitorFactory.ts#L46)

Get the appropriate monitor service for the given monitor type.

#### Parameters

##### type

Monitor type string

`"http"` | `"port"`

##### config?

[`MonitorConfig`](../../types/interfaces/MonitorConfig.md)

Optional monitor configuration to apply

##### forceConfigUpdate?

`boolean` = `false`

Whether to update config on existing instances

#### Returns

[`IMonitorService`](../../types/interfaces/IMonitorService.md)

Monitor service instance with applied configuration

#### Throws

Error if monitor type is not supported

#### Remarks

Uses singleton pattern to cache monitor instances per type. If an instance
already exists and config is provided, the behavior depends on forceConfigUpdate:
- true: Updates existing instance with new config
- false: Returns existing instance without config changes (default)

For consistent configuration across all instances, use [updateConfig](#updateconfig) instead.

***

### updateConfig()

> `static` **updateConfig**(`config`): `void`

Defined in: [electron/services/monitoring/MonitorFactory.ts:103](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/monitoring/MonitorFactory.ts#L103)

Update configuration for all monitor types.

#### Parameters

##### config

[`MonitorConfig`](../../types/interfaces/MonitorConfig.md)

Monitor configuration object containing settings to apply

#### Returns

`void`

#### Remarks

Applies the provided configuration to ALL currently initialized monitor instances.
This ensures consistent configuration across all monitor types.

The config object should contain settings applicable to all monitor types.
Type-specific settings may be ignored by monitors that don't support them.

Note: Only affects already-created instances. Future instances created via
[getMonitor](#getmonitor) will need their configuration set explicitly.

#### Example

```typescript
// Update timeout for all monitor instances
MonitorFactory.updateConfig({ timeout: 10000 });
```
