# Interface: BaseMonitorConfig

Defined in: [electron/services/monitoring/MonitorTypeRegistry.ts:58](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorTypeRegistry.ts#L58)

Configuration contract for a monitor type in the monitoring system.

## Remarks

Each monitor type (e.g., HTTP, Port) must provide a configuration object
describing its metadata, validation schema, UI display options, and service
factory. This enables dynamic registration, validation, and UI rendering for
new monitor types.

## Param

Description of what this monitor checks.

## Param

Human-readable display name for UI.

## Param

Field definitions for dynamic form generation.

## Param

Factory function to create monitor service instances.

## Param

Unique identifier for the monitor type.

## Param

Optional UI display configuration for analytics, history,
  and help texts.

## Param

Zod validation schema for this monitor type.

## Param

Version of the monitor implementation.

## Properties

### description

> `readonly` **description**: `string`

Defined in: [electron/services/monitoring/MonitorTypeRegistry.ts:60](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorTypeRegistry.ts#L60)

Description of what this monitor checks

***

### displayName

> `readonly` **displayName**: `string`

Defined in: [electron/services/monitoring/MonitorTypeRegistry.ts:62](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorTypeRegistry.ts#L62)

Human-readable display name

***

### fields

> `readonly` **fields**: [`MonitorFieldDefinition`](../../../../../shared/types/interfaces/MonitorFieldDefinition.md)[]

Defined in: [electron/services/monitoring/MonitorTypeRegistry.ts:64](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorTypeRegistry.ts#L64)

Field definitions for dynamic form generation

***

### serviceFactory()

> `readonly` **serviceFactory**: () => [`IMonitorService`](../../types/interfaces/IMonitorService.md)

Defined in: [electron/services/monitoring/MonitorTypeRegistry.ts:66](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorTypeRegistry.ts#L66)

Factory function to create monitor service instances

#### Returns

[`IMonitorService`](../../types/interfaces/IMonitorService.md)

***

### type

> `readonly` **type**: `string`

Defined in: [electron/services/monitoring/MonitorTypeRegistry.ts:68](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorTypeRegistry.ts#L68)

Unique identifier for the monitor type

***

### uiConfig?

> `readonly` `optional` **uiConfig**: `object`

Defined in: [electron/services/monitoring/MonitorTypeRegistry.ts:70](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorTypeRegistry.ts#L70)

UI display configuration

#### detailFormats?

> `optional` **detailFormats**: `object`

Detail label formatter for different contexts

##### detailFormats.analyticsLabel?

> `optional` **analyticsLabel**: `string`

Format for analytics display

##### detailFormats.historyDetail()?

> `optional` **historyDetail**: (`details`) => `string`

Format for history detail column

###### Parameters

###### details

`string`

###### Returns

`string`

#### display?

> `optional` **display**: `object`

Display preferences

##### display.showAdvancedMetrics?

> `optional` **showAdvancedMetrics**: `boolean`

##### display.showUrl?

> `optional` **showUrl**: `boolean`

#### formatDetail()?

> `optional` **formatDetail**: (`details`) => `string`

Function to format detail display in history (e.g., "Port: 80",
"Response Code: 200")

##### Parameters

###### details

`string`

##### Returns

`string`

#### formatTitleSuffix()?

> `optional` **formatTitleSuffix**: (`monitor`) => `string`

Function to format title suffix for history charts (e.g., "
(https://example.com)")

##### Parameters

###### monitor

[`Monitor`](../../../../../shared/types/interfaces/Monitor.md)

##### Returns

`string`

#### helpTexts?

> `optional` **helpTexts**: `object`

Help text for form fields

##### helpTexts.primary?

> `optional` **primary**: `string`

##### helpTexts.secondary?

> `optional` **secondary**: `string`

#### supportsAdvancedAnalytics?

> `optional` **supportsAdvancedAnalytics**: `boolean`

Whether this monitor type supports advanced analytics

#### supportsResponseTime?

> `optional` **supportsResponseTime**: `boolean`

Whether this monitor type supports response time analytics

***

### validationSchema

> `readonly` **validationSchema**: `ZodType`

Defined in: [electron/services/monitoring/MonitorTypeRegistry.ts:104](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorTypeRegistry.ts#L104)

Zod validation schema for this monitor type

***

### version

> `readonly` **version**: `string`

Defined in: [electron/services/monitoring/MonitorTypeRegistry.ts:106](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorTypeRegistry.ts#L106)

Version of the monitor implementation
