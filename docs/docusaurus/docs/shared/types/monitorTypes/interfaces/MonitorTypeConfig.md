# Interface: MonitorTypeConfig

Defined in: [shared/types/monitorTypes.ts:20](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorTypes.ts#L20)

Shared representation of a monitor type configuration used by frontend and
backend.

## Remarks

Mirrors the structure provided by the backend registry and consumed by the
renderer. Kept in shared types to avoid circular dependencies between
src/utils helpers and Zustand stores.

## Properties

### description

> **description**: `string`

Defined in: [shared/types/monitorTypes.ts:22](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorTypes.ts#L22)

Description of what this monitor checks

***

### displayName

> **displayName**: `string`

Defined in: [shared/types/monitorTypes.ts:24](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorTypes.ts#L24)

Human-readable display name

***

### fields

> **fields**: [`MonitorFieldDefinition`](../../interfaces/MonitorFieldDefinition.md)[]

Defined in: [shared/types/monitorTypes.ts:26](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorTypes.ts#L26)

Field definitions for dynamic form generation

***

### type

> **type**: `string`

Defined in: [shared/types/monitorTypes.ts:28](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorTypes.ts#L28)

Unique identifier for the monitor type

***

### uiConfig?

> `optional` **uiConfig**: `object`

Defined in: [shared/types/monitorTypes.ts:30](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorTypes.ts#L30)

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

Defined in: [shared/types/monitorTypes.ts:53](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorTypes.ts#L53)

Version of the monitor implementation
