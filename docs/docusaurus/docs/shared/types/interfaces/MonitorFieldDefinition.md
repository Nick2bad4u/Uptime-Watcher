# Interface: MonitorFieldDefinition

Defined in: [shared/types.ts:129](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types.ts#L129)

Field definition for dynamic form generation.

## Remarks

Used for monitor type configuration in both frontend and backend. Defines the
structure of fields for dynamic forms and monitor configuration.

## Properties

### helpText?

> `optional` **helpText**: `string`

Defined in: [shared/types.ts:131](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types.ts#L131)

Help text for the field

***

### label

> **label**: `string`

Defined in: [shared/types.ts:133](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types.ts#L133)

Display label for the field

***

### max?

> `optional` **max**: `number`

Defined in: [shared/types.ts:135](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types.ts#L135)

Max value for number fields

***

### min?

> `optional` **min**: `number`

Defined in: [shared/types.ts:137](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types.ts#L137)

Min value for number fields

***

### name

> **name**: `string`

Defined in: [shared/types.ts:139](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types.ts#L139)

Field name (matches monitor property)

***

### options?

> `optional` **options**: `object`[]

Defined in: [shared/types.ts:141](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types.ts#L141)

Options for select fields

#### label

> **label**: `string`

#### value

> **value**: `string`

***

### placeholder?

> `optional` **placeholder**: `string`

Defined in: [shared/types.ts:143](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types.ts#L143)

Placeholder text

***

### required

> **required**: `boolean`

Defined in: [shared/types.ts:145](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types.ts#L145)

Whether field is required

***

### type

> **type**: `"number"` \| `"select"` \| `"text"` \| `"url"`

Defined in: [shared/types.ts:147](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types.ts#L147)

Input type for form rendering
