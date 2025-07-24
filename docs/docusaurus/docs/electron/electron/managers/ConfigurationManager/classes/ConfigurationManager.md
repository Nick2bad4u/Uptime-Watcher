# Class: ConfigurationManager

Defined in: [electron/managers/ConfigurationManager.ts:34](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/managers/ConfigurationManager.ts#L34)

Manages business configuration and policies with standardized caching.
Centralizes business rules that were previously scattered across utilities.
Uses composition pattern with specialized validators to reduce complexity.
Implements caching for validation results and configuration values for performance.

## Remarks

ConfigurationManager instances should be obtained via ServiceContainer.getInstance().getConfigurationManager()
This ensures proper dependency injection and lifecycle management

## Constructors

### Constructor

> **new ConfigurationManager**(): `ConfigurationManager`

Defined in: [electron/managers/ConfigurationManager.ts:40](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/managers/ConfigurationManager.ts#L40)

#### Returns

`ConfigurationManager`

## Methods

### clearValidationCache()

> **clearValidationCache**(): `void`

Defined in: [electron/managers/ConfigurationManager.ts:63](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/managers/ConfigurationManager.ts#L63)

Clear validation cache when configuration changes.

#### Returns

`void`

***

### getCacheStats()

> **getCacheStats**(): `object`

Defined in: [electron/managers/ConfigurationManager.ts:70](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/managers/ConfigurationManager.ts#L70)

Get cache statistics for monitoring.

#### Returns

`object`

##### configuration

> **configuration**: [`CacheStats`](../../../utils/cache/StandardizedCache/interfaces/CacheStats.md)

##### validation

> **validation**: [`CacheStats`](../../../utils/cache/StandardizedCache/interfaces/CacheStats.md)

***

### getDefaultMonitorInterval()

> **getDefaultMonitorInterval**(): `number`

Defined in: [electron/managers/ConfigurationManager.ts:83](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/managers/ConfigurationManager.ts#L83)

Get the default monitor check interval according to business rules.

#### Returns

`number`

***

### getHistoryRetentionRules()

> **getHistoryRetentionRules**(): [`HistoryRetentionConfig`](../interfaces/HistoryRetentionConfig.md)

Defined in: [electron/managers/ConfigurationManager.ts:91](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/managers/ConfigurationManager.ts#L91)

Get history retention configuration according to business rules.
These limits align with the history limit options available in the UI.

#### Returns

[`HistoryRetentionConfig`](../interfaces/HistoryRetentionConfig.md)

***

### getMaximumPortNumber()

> **getMaximumPortNumber**(): `number`

Defined in: [electron/managers/ConfigurationManager.ts:102](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/managers/ConfigurationManager.ts#L102)

Business rule: Get the maximum allowed port number.

#### Returns

`number`

***

### getMinimumCheckInterval()

> **getMinimumCheckInterval**(): `number`

Defined in: [electron/managers/ConfigurationManager.ts:109](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/managers/ConfigurationManager.ts#L109)

Business rule: Get the minimum allowed check interval.

#### Returns

`number`

***

### getMinimumTimeout()

> **getMinimumTimeout**(): `number`

Defined in: [electron/managers/ConfigurationManager.ts:116](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/managers/ConfigurationManager.ts#L116)

Business rule: Get the minimum allowed timeout.

#### Returns

`number`

***

### shouldApplyDefaultInterval()

> **shouldApplyDefaultInterval**(`monitor`): `boolean`

Defined in: [electron/managers/ConfigurationManager.ts:123](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/managers/ConfigurationManager.ts#L123)

Business rule: Determine if a monitor should receive a default interval.

#### Parameters

##### monitor

[`Monitor`](../../../../shared/types/interfaces/Monitor.md)

#### Returns

`boolean`

***

### shouldAutoStartMonitoring()

> **shouldAutoStartMonitoring**(`site`): `boolean`

Defined in: [electron/managers/ConfigurationManager.ts:130](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/managers/ConfigurationManager.ts#L130)

Business rule: Determine if monitoring should be auto-started for a site.

#### Parameters

##### site

[`Site`](../../../../shared/types/interfaces/Site.md)

#### Returns

`boolean`

***

### shouldIncludeInExport()

> **shouldIncludeInExport**(`site`): `boolean`

Defined in: [electron/managers/ConfigurationManager.ts:149](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/managers/ConfigurationManager.ts#L149)

Business rule: Determine if a site should be included in exports.
Delegates to site validator for consistency.

#### Parameters

##### site

[`Site`](../../../../shared/types/interfaces/Site.md)

#### Returns

`boolean`

***

### validateMonitorConfiguration()

> **validateMonitorConfiguration**(`monitor`): `Promise`\<[`ValidationResult`](../../validators/interfaces/interfaces/ValidationResult.md)\>

Defined in: [electron/managers/ConfigurationManager.ts:164](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/managers/ConfigurationManager.ts#L164)

Validate monitor configuration according to business rules with caching.

#### Parameters

##### monitor

[`Monitor`](../../../../shared/types/interfaces/Monitor.md)

The monitor configuration to validate

#### Returns

`Promise`\<[`ValidationResult`](../../validators/interfaces/interfaces/ValidationResult.md)\>

Promise resolving to validation result with errors and validity status

#### Remarks

Delegates to specialized monitor validator and caches results for performance.
Marked as async for forward compatibility with future validator implementations
that may require asynchronous operations or cache backends.

***

### validateSiteConfiguration()

> **validateSiteConfiguration**(`site`): `Promise`\<[`ValidationResult`](../../validators/interfaces/interfaces/ValidationResult.md)\>

Defined in: [electron/managers/ConfigurationManager.ts:207](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/managers/ConfigurationManager.ts#L207)

Validate site configuration according to business rules with caching.

#### Parameters

##### site

[`Site`](../../../../shared/types/interfaces/Site.md)

The site configuration to validate

#### Returns

`Promise`\<[`ValidationResult`](../../validators/interfaces/interfaces/ValidationResult.md)\>

Promise resolving to validation result with errors and validity status

#### Remarks

Delegates to specialized site validator and caches results for performance.
Marked as async for forward compatibility with future validator implementations
that may require asynchronous operations or cache backends.
