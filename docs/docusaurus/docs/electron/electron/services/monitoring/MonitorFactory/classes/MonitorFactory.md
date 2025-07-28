# Class: MonitorFactory

Defined in: [electron/services/monitoring/MonitorFactory.ts:43](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/MonitorFactory.ts#L43)

Factory for creating, caching, and managing monitor service instances for all registered monitor types.

## Remarks

This class provides a singleton instance per monitor type, using the registry's service factories for instantiation.
It ensures that only one instance per monitor type exists at a time, and provides configuration management for all monitor services.
All monitor type validation and service instantiation is delegated to the monitor type registry.

## Example

```typescript
// Retrieve a monitor service instance for HTTP
const httpMonitor = MonitorFactory.getMonitor("http", { timeout: 5000 });
// Update configuration for all monitor services
MonitorFactory.updateConfig({ timeout: 10000 });
// Clear all cached monitor service instances
MonitorFactory.clearCache();
```

## Constructors

### Constructor

> **new MonitorFactory**(): `MonitorFactory`

#### Returns

`MonitorFactory`

## Methods

### clearCache()

> `static` **clearCache**(): `void`

Defined in: [electron/services/monitoring/MonitorFactory.ts:69](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/MonitorFactory.ts#L69)

Clears all cached monitor service instances.

#### Returns

`void`

#### Remarks

Useful for testing, reloading configuration, or resetting the monitor service state.
After calling this method, new service instances will be created on demand.

#### Example

```typescript
MonitorFactory.clearCache();
```

***

### getAvailableTypes()

> `static` **getAvailableTypes**(): `string`[]

Defined in: [electron/services/monitoring/MonitorFactory.ts:88](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/MonitorFactory.ts#L88)

Retrieves all available monitor types from the registry.

#### Returns

`string`[]

An array of registered monitor type strings.

#### Remarks

This method returns all monitor types currently registered in the system, including both built-in and dynamically registered types.

#### Example

```typescript
const types = MonitorFactory.getAvailableTypes();
```

***

### getMonitor()

> `static` **getMonitor**(`type`, `config?`, `forceConfigUpdate?`): [`IMonitorService`](../../types/interfaces/IMonitorService.md)

Defined in: [electron/services/monitoring/MonitorFactory.ts:121](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/MonitorFactory.ts#L121)

Retrieves the monitor service instance for a given monitor type, creating it if necessary.

#### Parameters

##### type

The monitor type string. Must be a valid registered type.

`"http"` | `"port"`

##### config?

[`MonitorConfig`](../../types/interfaces/MonitorConfig.md)

Optional monitor configuration to apply to the instance.

##### forceConfigUpdate?

`boolean` = `false`

If true, updates the configuration on an existing instance even if already set.

#### Returns

[`IMonitorService`](../../types/interfaces/IMonitorService.md)

The monitor service instance for the specified type.

#### Remarks

- Validates the monitor type against the registry.
- Uses the singleton pattern: returns the cached instance if available, otherwise creates a new one.
- If a configuration is provided, updates the instance's configuration if forced or if the instance is new.
- Throws if the monitor type is unsupported or if no factory is registered for the type.
- Configuration failures are logged but do not prevent service retrieval.

#### Throws

Error If the monitor type is not supported or no service factory is registered for the type.

#### Example

```typescript
const monitor = MonitorFactory.getMonitor("http", { timeout: 5000 });
```

#### See

 - [IMonitorService](../../types/interfaces/IMonitorService.md)
 - [MonitorConfig](../../types/interfaces/MonitorConfig.md)
 - [getMonitorServiceFactory](../../MonitorTypeRegistry/functions/getMonitorServiceFactory.md)
 - [isValidMonitorType](../../MonitorTypeRegistry/functions/isValidMonitorType.md)
 - [getMonitorWithResult](#getmonitorwithresult) for version that returns configuration status

***

### getMonitorWithResult()

> `static` **getMonitorWithResult**(`type`, `config?`, `forceConfigUpdate?`): [`MonitorServiceResult`](../interfaces/MonitorServiceResult.md)

Defined in: [electron/services/monitoring/MonitorFactory.ts:150](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/MonitorFactory.ts#L150)

Retrieves the monitor service instance with configuration application status.

#### Parameters

##### type

The monitor type string. Must be a valid registered type.

`"http"` | `"port"`

##### config?

[`MonitorConfig`](../../types/interfaces/MonitorConfig.md)

Optional monitor configuration to apply to the instance.

##### forceConfigUpdate?

`boolean` = `false`

If true, updates the configuration on an existing instance even if already set.

#### Returns

[`MonitorServiceResult`](../interfaces/MonitorServiceResult.md)

Result object containing the service instance and configuration status.

#### Remarks

Same as [getMonitor](#getmonitor) but returns detailed result including configuration application status.
Use this method when you need to know if configuration was successfully applied.

#### Throws

Error If the monitor type is not supported or no service factory is registered for the type.

#### Example

```typescript
const result = MonitorFactory.getMonitorWithResult("http", { timeout: 5000 });
if (!result.configurationApplied && result.configurationError) {
  console.warn("Config failed:", result.configurationError);
}
```

***

### updateConfig()

> `static` **updateConfig**(`config`): `void`

Defined in: [electron/services/monitoring/MonitorFactory.ts:226](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/MonitorFactory.ts#L226)

Updates configuration for all currently initialized monitor service instances.

#### Parameters

##### config

[`MonitorConfig`](../../types/interfaces/MonitorConfig.md)

Monitor configuration object containing settings to apply to all monitor services.

#### Returns

`void`

#### Remarks

- Applies the provided configuration to all cached monitor service instances.
- Only affects already-created instances; future instances require explicit config on creation.
- Type-specific settings in the config object may be ignored by some monitor types if not applicable.
- Errors during config update are logged and do not interrupt updates for other instances.

#### Example

```typescript
MonitorFactory.updateConfig({ timeout: 10000 });
```

#### See

[MonitorConfig](../../types/interfaces/MonitorConfig.md)
