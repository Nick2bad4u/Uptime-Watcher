# Interface: ChartScaleConfig

Defined in: [shared/types/chartConfig.ts:158](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/chartConfig.ts#L158)

Chart scale configuration interface.

## Remarks

Defines the structure for Chart.js scale configuration objects.

## Properties

### display?

> `optional` **display**: `boolean`

Defined in: [shared/types/chartConfig.ts:160](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/chartConfig.ts#L160)

Whether to display the scale

***

### grid?

> `optional` **grid**: `object`

Defined in: [shared/types/chartConfig.ts:162](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/chartConfig.ts#L162)

Grid line configuration

#### color?

> `optional` **color**: `string`

#### display?

> `optional` **display**: `boolean`

#### lineWidth?

> `optional` **lineWidth**: `number`

***

### max?

> `optional` **max**: `number`

Defined in: [shared/types/chartConfig.ts:168](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/chartConfig.ts#L168)

Maximum value for the scale

***

### min?

> `optional` **min**: `number`

Defined in: [shared/types/chartConfig.ts:170](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/chartConfig.ts#L170)

Minimum value for the scale

***

### position?

> `optional` **position**: `"left"` \| `"right"` \| `"bottom"` \| `"top"`

Defined in: [shared/types/chartConfig.ts:172](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/chartConfig.ts#L172)

Position of the scale

***

### stacked?

> `optional` **stacked**: `boolean`

Defined in: [shared/types/chartConfig.ts:174](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/chartConfig.ts#L174)

Stacking configuration

***

### ticks?

> `optional` **ticks**: `object`

Defined in: [shared/types/chartConfig.ts:176](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/chartConfig.ts#L176)

Ticks configuration

#### callback()?

> `optional` **callback**: (`value`, `index`, `values`) => `string`

##### Parameters

###### value

`number`

###### index

`number`

###### values

`number`[]

##### Returns

`string`

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

#### max?

> `optional` **max**: `number`

#### min?

> `optional` **min**: `number`

#### precision?

> `optional` **precision**: `number`

#### stepSize?

> `optional` **stepSize**: `number`

***

### title?

> `optional` **title**: `object`

Defined in: [shared/types/chartConfig.ts:191](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/chartConfig.ts#L191)

Scale title configuration

#### color?

> `optional` **color**: `string`

#### display?

> `optional` **display**: `boolean`

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

#### text?

> `optional` **text**: `string`

***

### type?

> `optional` **type**: `"time"` \| `"linear"` \| `"logarithmic"` \| `"category"`

Defined in: [shared/types/chartConfig.ts:204](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/chartConfig.ts#L204)

Scale type
