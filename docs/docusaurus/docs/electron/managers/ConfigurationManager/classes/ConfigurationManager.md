# Class: ConfigurationManager

Defined in: [electron/managers/ConfigurationManager.ts:112](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/ConfigurationManager.ts#L112)

Manages business configuration, validation, and policy rules for the
application.

## Remarks

Centralizes business logic for configuration decisions, validation, and
caching of results. Uses composition with specialized validators and
standardized caches for performance. All configuration and validation flows
should use this manager for consistency.

## Constructors

### Constructor

> **new ConfigurationManager**(): `ConfigurationManager`

Defined in: [electron/managers/ConfigurationManager.ts:269](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/ConfigurationManager.ts#L269)

Creates a new ConfigurationManager instance.

#### Returns

`ConfigurationManager`

#### Remarks

Instantiates specialized validators and initializes standardized caches
for configuration and validation results.

## Methods

### validateMonitorConfiguration()

> **validateMonitorConfiguration**(`monitor`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ValidationResult`](../../validators/interfaces/interfaces/ValidationResult.md)\>

Defined in: [electron/managers/ConfigurationManager.ts:176](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/ConfigurationManager.ts#L176)

Validates a monitor configuration according to business rules, with
caching.

#### Parameters

##### monitor

[`Monitor`](../../../../shared/types/interfaces/Monitor.md)

The monitor configuration to validate. Must be a member
  of [Site.monitors](../../../../shared/types/interfaces/Site.md#monitors).

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ValidationResult`](../../validators/interfaces/interfaces/ValidationResult.md)\>

A promise resolving to a [ValidationResult](../../validators/interfaces/interfaces/ValidationResult.md) with errors and
  validity status.

#### Remarks

Delegates to [MonitorValidator.validateMonitorConfiguration](../../validators/MonitorValidator/classes/MonitorValidator.md#validatemonitorconfiguration) and
caches results for performance.

***

### validateSiteConfiguration()

> **validateSiteConfiguration**(`site`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ValidationResult`](../../validators/interfaces/interfaces/ValidationResult.md)\>

Defined in: [electron/managers/ConfigurationManager.ts:229](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/ConfigurationManager.ts#L229)

Validates a site configuration according to business rules, with caching.

#### Parameters

##### site

[`Site`](../../../../shared/types/interfaces/Site.md)

The [Site](../../../../shared/types/interfaces/Site.md) configuration to validate.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ValidationResult`](../../validators/interfaces/interfaces/ValidationResult.md)\>

A promise resolving to a [ValidationResult](../../validators/interfaces/interfaces/ValidationResult.md) with errors and
  validity status.

#### Remarks

Delegates to [SiteValidator.validateSiteConfiguration](../../validators/SiteValidator/classes/SiteValidator.md#validatesiteconfiguration) and caches
results for performance.

***

### clearValidationCache()

> **clearValidationCache**(): `void`

Defined in: [electron/managers/ConfigurationManager.ts:296](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/ConfigurationManager.ts#L296)

Clears the validation cache.

#### Returns

`void`

#### Remarks

Use this method to invalidate cached validation results after
configuration updates or changes.

***

### getCacheStats()

> **getCacheStats**(): `object`

Defined in: [electron/managers/ConfigurationManager.ts:313](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/ConfigurationManager.ts#L313)

Gets cache statistics for configuration and validation caches.

#### Returns

`object`

An object containing statistics for both configuration and
  validation caches.

##### configuration

> **configuration**: [`CacheStats`](../../../utils/cache/StandardizedCache/interfaces/CacheStats.md)

##### validation

> **validation**: [`CacheStats`](../../../utils/cache/StandardizedCache/interfaces/CacheStats.md)

#### Example

```typescript
const stats = configManager.getCacheStats();
console.log(stats);
```

***

### getDefaultMonitorInterval()

> **getDefaultMonitorInterval**(): `number`

Defined in: [electron/managers/ConfigurationManager.ts:331](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/ConfigurationManager.ts#L331)

Gets the default monitor check interval according to business rules.

#### Returns

`number`

The default check interval in milliseconds.

#### Remarks

This value is used when a monitor does not specify a custom interval.

***

### getHistoryRetentionRules()

> **getHistoryRetentionRules**(): [`HistoryRetentionConfig`](../interfaces/HistoryRetentionConfig.md)

Defined in: [electron/managers/ConfigurationManager.ts:344](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/ConfigurationManager.ts#L344)

Gets history retention configuration according to business rules.

#### Returns

[`HistoryRetentionConfig`](../interfaces/HistoryRetentionConfig.md)

The [HistoryRetentionConfig](../interfaces/HistoryRetentionConfig.md) object specifying default,
  minimum, and maximum history limits.

#### Remarks

These limits align with the history limit options available in the UI.

***

### getMaximumPortNumber()

> **getMaximumPortNumber**(): `number`

Defined in: [electron/managers/ConfigurationManager.ts:357](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/ConfigurationManager.ts#L357)

Gets the maximum allowed port number according to business rules.

#### Returns

`number`

The maximum allowed port number (65535).

***

### getMinimumCheckInterval()

> **getMinimumCheckInterval**(): `number`

Defined in: [electron/managers/ConfigurationManager.ts:366](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/ConfigurationManager.ts#L366)

Gets the minimum allowed check interval according to business rules.

#### Returns

`number`

The minimum allowed check interval in milliseconds (1000 ms).

***

### getMinimumTimeout()

> **getMinimumTimeout**(): `number`

Defined in: [electron/managers/ConfigurationManager.ts:375](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/ConfigurationManager.ts#L375)

Gets the minimum allowed timeout according to business rules.

#### Returns

`number`

The minimum allowed timeout in milliseconds (1000 ms).

***

### shouldApplyDefaultInterval()

> **shouldApplyDefaultInterval**(`monitor`): `boolean`

Defined in: [electron/managers/ConfigurationManager.ts:391](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/ConfigurationManager.ts#L391)

Determines if a monitor should receive a default check interval.

#### Parameters

##### monitor

[`Monitor`](../../../../shared/types/interfaces/Monitor.md)

The monitor configuration to evaluate. Must be a member
  of [Site.monitors](../../../../shared/types/interfaces/Site.md#monitors).

#### Returns

`boolean`

`true` if the monitor should receive a default check interval;
  otherwise, `false`.

#### Remarks

Delegates to [MonitorValidator.shouldApplyDefaultInterval](../../validators/MonitorValidator/classes/MonitorValidator.md#shouldapplydefaultinterval).

***

### shouldAutoStartMonitoring()

> **shouldAutoStartMonitoring**(`site`): `boolean`

Defined in: [electron/managers/ConfigurationManager.ts:408](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/ConfigurationManager.ts#L408)

Determines if monitoring should be auto-started for a site according to
business rules.

#### Parameters

##### site

[`Site`](../../../../shared/types/interfaces/Site.md)

The [Site](../../../../shared/types/interfaces/Site.md) configuration to evaluate.

#### Returns

`boolean`

`true` if monitoring should be auto-started for the site;
  otherwise, `false`.

#### Remarks

Monitoring is not auto-started in development mode or for sites without
monitors. The site's `monitoring` property takes precedence.

***

### shouldIncludeInExport()

> **shouldIncludeInExport**(`site`): `boolean`

Defined in: [electron/managers/ConfigurationManager.ts:435](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/ConfigurationManager.ts#L435)

Determines if a site should be included in exports according to business
rules.

#### Parameters

##### site

[`Site`](../../../../shared/types/interfaces/Site.md)

The [Site](../../../../shared/types/interfaces/Site.md) configuration to evaluate.

#### Returns

`boolean`

`true` if the site should be included in exports; otherwise,
  `false`.

#### Remarks

Delegates to [SiteValidator.shouldIncludeInExport](../../validators/SiteValidator/classes/SiteValidator.md#shouldincludeinexport) for consistency.
