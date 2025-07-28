# Interface: MonitorFieldDefinition

Defined in: [shared/types.ts:180](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types.ts#L180)

Field definition for dynamic form generation.

## Remarks

Used for monitor type configuration in both frontend and backend. Defines the structure of fields for dynamic forms and monitor configuration.

## Properties

### helpText?

> `optional` **helpText**: `string`

Defined in: [shared/types.ts:182](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types.ts#L182)

Help text for the field

***

### label

> **label**: `string`

Defined in: [shared/types.ts:184](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types.ts#L184)

Display label for the field

***

### max?

> `optional` **max**: `number`

Defined in: [shared/types.ts:186](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types.ts#L186)

Max value for number fields

***

### min?

> `optional` **min**: `number`

Defined in: [shared/types.ts:188](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types.ts#L188)

Min value for number fields

***

### name

> **name**: `string`

Defined in: [shared/types.ts:190](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types.ts#L190)

Field name (matches monitor property)

***

### placeholder?

> `optional` **placeholder**: `string`

Defined in: [shared/types.ts:192](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types.ts#L192)

Placeholder text

***

### required

> **required**: `boolean`

Defined in: [shared/types.ts:194](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types.ts#L194)

Whether field is required

***

### type

> **type**: `"number"` \| `"url"` \| `"text"`

Defined in: [shared/types.ts:196](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types.ts#L196)

Input type for form rendering
