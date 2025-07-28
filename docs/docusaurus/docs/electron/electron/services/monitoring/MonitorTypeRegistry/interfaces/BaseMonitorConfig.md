# Interface: BaseMonitorConfig

Defined in: [electron/services/monitoring/MonitorTypeRegistry.ts:43](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/MonitorTypeRegistry.ts#L43)

Configuration contract for a monitor type in the monitoring system.

## Remarks

Each monitor type (e.g., HTTP, Port) must provide a configuration object
describing its metadata, validation schema, UI display options, and service factory.
This enables dynamic registration, validation, and UI rendering for new monitor types.

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

Optional UI display configuration for analytics, history, and help texts.

## Param

Zod validation schema for this monitor type.

## Param

Version of the monitor implementation.

## Properties

### description

> `readonly` **description**: `string`

Defined in: [electron/services/monitoring/MonitorTypeRegistry.ts:45](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/MonitorTypeRegistry.ts#L45)

Description of what this monitor checks

***

### displayName

> `readonly` **displayName**: `string`

Defined in: [electron/services/monitoring/MonitorTypeRegistry.ts:47](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/MonitorTypeRegistry.ts#L47)

Human-readable display name

***

### fields

> `readonly` **fields**: [`MonitorFieldDefinition`](../../../../../shared/types/interfaces/MonitorFieldDefinition.md)[]

Defined in: [electron/services/monitoring/MonitorTypeRegistry.ts:49](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/MonitorTypeRegistry.ts#L49)

Field definitions for dynamic form generation

***

### serviceFactory()

> `readonly` **serviceFactory**: () => [`IMonitorService`](../../types/interfaces/IMonitorService.md)

Defined in: [electron/services/monitoring/MonitorTypeRegistry.ts:51](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/MonitorTypeRegistry.ts#L51)

Factory function to create monitor service instances

#### Returns

[`IMonitorService`](../../types/interfaces/IMonitorService.md)

***

### type

> `readonly` **type**: `string`

Defined in: [electron/services/monitoring/MonitorTypeRegistry.ts:53](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/MonitorTypeRegistry.ts#L53)

Unique identifier for the monitor type

***

### uiConfig?

> `readonly` `optional` **uiConfig**: `object`

Defined in: [electron/services/monitoring/MonitorTypeRegistry.ts:55](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/MonitorTypeRegistry.ts#L55)

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

Function to format detail display in history (e.g., "Port: 80", "Response Code: 200")

##### Parameters

###### details

`string`

##### Returns

`string`

#### formatTitleSuffix()?

> `optional` **formatTitleSuffix**: (`monitor`) => `string`

Function to format title suffix for history charts (e.g., " (https://example.com)")

##### Parameters

###### monitor

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

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

Defined in: [electron/services/monitoring/MonitorTypeRegistry.ts:83](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/MonitorTypeRegistry.ts#L83)

Zod validation schema for this monitor type

***

### version

> `readonly` **version**: `string`

Defined in: [electron/services/monitoring/MonitorTypeRegistry.ts:85](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/MonitorTypeRegistry.ts#L85)

Version of the monitor implementation
