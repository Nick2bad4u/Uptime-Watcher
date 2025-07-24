# Interface: BaseMonitorConfig

Defined in: [electron/services/monitoring/MonitorTypeRegistry.ts:24](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/monitoring/MonitorTypeRegistry.ts#L24)

## Properties

### description

> `readonly` **description**: `string`

Defined in: [electron/services/monitoring/MonitorTypeRegistry.ts:26](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/monitoring/MonitorTypeRegistry.ts#L26)

Description of what this monitor checks

***

### displayName

> `readonly` **displayName**: `string`

Defined in: [electron/services/monitoring/MonitorTypeRegistry.ts:28](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/monitoring/MonitorTypeRegistry.ts#L28)

Human-readable display name

***

### fields

> `readonly` **fields**: [`MonitorFieldDefinition`](../../../../../shared/types/interfaces/MonitorFieldDefinition.md)[]

Defined in: [electron/services/monitoring/MonitorTypeRegistry.ts:30](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/monitoring/MonitorTypeRegistry.ts#L30)

Field definitions for dynamic form generation

***

### serviceFactory()

> `readonly` **serviceFactory**: () => [`IMonitorService`](../../types/interfaces/IMonitorService.md)

Defined in: [electron/services/monitoring/MonitorTypeRegistry.ts:32](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/monitoring/MonitorTypeRegistry.ts#L32)

Factory function to create monitor service instances

#### Returns

[`IMonitorService`](../../types/interfaces/IMonitorService.md)

***

### type

> `readonly` **type**: `string`

Defined in: [electron/services/monitoring/MonitorTypeRegistry.ts:34](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/monitoring/MonitorTypeRegistry.ts#L34)

Unique identifier for the monitor type

***

### uiConfig?

> `readonly` `optional` **uiConfig**: `object`

Defined in: [electron/services/monitoring/MonitorTypeRegistry.ts:36](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/monitoring/MonitorTypeRegistry.ts#L36)

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

`Record`\<`string`, `unknown`\>

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

Defined in: [electron/services/monitoring/MonitorTypeRegistry.ts:64](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/monitoring/MonitorTypeRegistry.ts#L64)

Zod validation schema for this monitor type

***

### version

> `readonly` **version**: `string`

Defined in: [electron/services/monitoring/MonitorTypeRegistry.ts:66](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/monitoring/MonitorTypeRegistry.ts#L66)

Version of the monitor implementation
