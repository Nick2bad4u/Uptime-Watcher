# Interface: MonitorTypeConfig

Defined in: [src/utils/monitorTypeHelper.ts:15](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/monitorTypeHelper.ts#L15)

Frontend representation of monitor type configuration.

## Properties

### description

> **description**: `string`

Defined in: [src/utils/monitorTypeHelper.ts:17](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/monitorTypeHelper.ts#L17)

Description of what this monitor checks

***

### displayName

> **displayName**: `string`

Defined in: [src/utils/monitorTypeHelper.ts:19](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/monitorTypeHelper.ts#L19)

Human-readable display name

***

### fields

> **fields**: [`MonitorFieldDefinition`](../../../../shared/types/interfaces/MonitorFieldDefinition.md)[]

Defined in: [src/utils/monitorTypeHelper.ts:21](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/monitorTypeHelper.ts#L21)

Field definitions for dynamic form generation

***

### type

> **type**: `string`

Defined in: [src/utils/monitorTypeHelper.ts:23](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/monitorTypeHelper.ts#L23)

Unique identifier for the monitor type

***

### uiConfig?

> `optional` **uiConfig**: `object`

Defined in: [src/utils/monitorTypeHelper.ts:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/monitorTypeHelper.ts#L25)

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

Defined in: [src/utils/monitorTypeHelper.ts:48](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/monitorTypeHelper.ts#L48)

Version of the monitor implementation
