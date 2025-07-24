# Interface: MonitorFieldDefinition

Defined in: [shared/types.ts:110](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/shared/types.ts#L110)

Field definition for dynamic form generation.
Used for monitor type configuration in both frontend and backend.

## Properties

### helpText?

> `optional` **helpText**: `string`

Defined in: [shared/types.ts:112](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/shared/types.ts#L112)

Help text for the field

***

### label

> **label**: `string`

Defined in: [shared/types.ts:114](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/shared/types.ts#L114)

Display label for the field

***

### max?

> `optional` **max**: `number`

Defined in: [shared/types.ts:116](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/shared/types.ts#L116)

Max value for number fields

***

### min?

> `optional` **min**: `number`

Defined in: [shared/types.ts:118](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/shared/types.ts#L118)

Min value for number fields

***

### name

> **name**: `string`

Defined in: [shared/types.ts:120](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/shared/types.ts#L120)

Field name (matches monitor property)

***

### placeholder?

> `optional` **placeholder**: `string`

Defined in: [shared/types.ts:122](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/shared/types.ts#L122)

Placeholder text

***

### required

> **required**: `boolean`

Defined in: [shared/types.ts:124](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/shared/types.ts#L124)

Whether field is required

***

### type

> **type**: `"number"` \| `"url"` \| `"text"`

Defined in: [shared/types.ts:126](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/shared/types.ts#L126)

Input type for form rendering
