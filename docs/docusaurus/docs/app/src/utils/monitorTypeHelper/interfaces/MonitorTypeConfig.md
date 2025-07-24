# Interface: MonitorTypeConfig

Defined in: [src/utils/monitorTypeHelper.ts:14](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/utils/monitorTypeHelper.ts#L14)

Frontend representation of monitor type configuration.

## Properties

### description

> **description**: `string`

Defined in: [src/utils/monitorTypeHelper.ts:16](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/utils/monitorTypeHelper.ts#L16)

Description of what this monitor checks

***

### displayName

> **displayName**: `string`

Defined in: [src/utils/monitorTypeHelper.ts:18](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/utils/monitorTypeHelper.ts#L18)

Human-readable display name

***

### fields

> **fields**: [`MonitorFieldDefinition`](../../../../shared/types/interfaces/MonitorFieldDefinition.md)[]

Defined in: [src/utils/monitorTypeHelper.ts:20](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/utils/monitorTypeHelper.ts#L20)

Field definitions for dynamic form generation

***

### type

> **type**: `string`

Defined in: [src/utils/monitorTypeHelper.ts:22](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/utils/monitorTypeHelper.ts#L22)

Unique identifier for the monitor type

***

### uiConfig?

> `optional` **uiConfig**: `object`

Defined in: [src/utils/monitorTypeHelper.ts:24](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/utils/monitorTypeHelper.ts#L24)

UI display configuration

#### detailFormats?

> `optional` **detailFormats**: `object`

Detail label formatter for different contexts

##### detailFormats.analyticsLabel?

> `optional` **analyticsLabel**: `string`

Format for analytics display

#### display?

> `optional` **display**: `object`

Display preferences

##### display.showAdvancedMetrics?

> `optional` **showAdvancedMetrics**: `boolean`

##### display.showUrl?

> `optional` **showUrl**: `boolean`

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

### version

> **version**: `string`

Defined in: [src/utils/monitorTypeHelper.ts:47](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/utils/monitorTypeHelper.ts#L47)

Version of the monitor implementation
