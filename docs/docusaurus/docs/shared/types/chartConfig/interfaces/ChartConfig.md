# Interface: ChartConfig

Defined in: [shared/types/chartConfig.ts:20](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/chartConfig.ts#L20)

Chart configuration interface.

## Remarks

Main configuration interface for Chart.js charts used in Uptime Watcher.

## Properties

### animation?

> `optional` **animation**: `object`

Defined in: [shared/types/chartConfig.ts:22](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/chartConfig.ts#L22)

Animation configuration

#### duration?

> `optional` **duration**: `number`

#### easing?

> `optional` **easing**: `string`

***

### interaction?

> `optional` **interaction**: `object`

Defined in: [shared/types/chartConfig.ts:27](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/chartConfig.ts#L27)

Interaction configuration

#### intersect?

> `optional` **intersect**: `boolean`

#### mode?

> `optional` **mode**: `"x"` \| `"y"` \| `"nearest"` \| `"index"` \| `"dataset"` \| `"point"`

***

### maintainAspectRatio?

> `optional` **maintainAspectRatio**: `boolean`

Defined in: [shared/types/chartConfig.ts:32](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/chartConfig.ts#L32)

Whether to maintain aspect ratio

***

### plugins?

> `optional` **plugins**: [`ChartPluginsConfig`](ChartPluginsConfig.md)

Defined in: [shared/types/chartConfig.ts:34](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/chartConfig.ts#L34)

Plugin configurations

***

### responsive?

> `optional` **responsive**: `boolean`

Defined in: [shared/types/chartConfig.ts:36](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/chartConfig.ts#L36)

Whether the chart is responsive

***

### scales?

> `optional` **scales**: [`ChartScalesConfig`](ChartScalesConfig.md)

Defined in: [shared/types/chartConfig.ts:38](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/chartConfig.ts#L38)

Scale configurations
