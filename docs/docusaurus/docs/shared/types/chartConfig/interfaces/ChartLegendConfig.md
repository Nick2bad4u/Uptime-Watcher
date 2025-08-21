# Interface: ChartLegendConfig

Defined in: [shared/types/chartConfig.ts:112](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/chartConfig.ts#L112)

Chart legend configuration interface.

## Remarks

Defines the structure for Chart.js legend configuration.

## Properties

### display?

> `optional` **display**: `boolean`

Defined in: [shared/types/chartConfig.ts:114](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/chartConfig.ts#L114)

Whether to display the legend

***

### labels?

> `optional` **labels**: `object`

Defined in: [shared/types/chartConfig.ts:116](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/chartConfig.ts#L116)

Labels configuration

#### boxHeight?

> `optional` **boxHeight**: `number`

#### boxWidth?

> `optional` **boxWidth**: `number`

#### color?

> `optional` **color**: `string`

#### font?

> `optional` **font**: `object`

##### font.family?

> `optional` **family**: `string`

##### font.size?

> `optional` **size**: `number`

##### font.style?

> `optional` **style**: `"normal"` \| `"italic"`

##### font.weight?

> `optional` **weight**: `"bold"` \| `"normal"`

#### padding?

> `optional` **padding**: `number`

#### usePointStyle?

> `optional` **usePointStyle**: `boolean`

***

### position?

> `optional` **position**: `"left"` \| `"right"` \| `"bottom"` \| `"top"` \| `"chartArea"`

Defined in: [shared/types/chartConfig.ts:130](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/chartConfig.ts#L130)

Legend position
