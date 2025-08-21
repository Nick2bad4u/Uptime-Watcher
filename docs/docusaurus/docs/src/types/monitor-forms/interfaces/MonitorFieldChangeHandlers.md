# Interface: MonitorFieldChangeHandlers

Defined in: [src/types/monitor-forms.ts:41](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/monitor-forms.ts#L41)

Type-safe field change handlers for monitor forms

## Properties

### boolean()

> **boolean**: (`fieldName`, `value`) => `void`

Defined in: [src/types/monitor-forms.ts:43](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/monitor-forms.ts#L43)

Handler for boolean fields

#### Parameters

##### fieldName

`string`

##### value

`boolean`

#### Returns

`void`

***

### number()

> **number**: (`fieldName`, `value`) => `void`

Defined in: [src/types/monitor-forms.ts:45](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/monitor-forms.ts#L45)

Handler for number fields

#### Parameters

##### fieldName

`string`

##### value

`number`

#### Returns

`void`

***

### object()

> **object**: (`fieldName`, `value`) => `void`

Defined in: [src/types/monitor-forms.ts:47](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/monitor-forms.ts#L47)

Handler for object fields

#### Parameters

##### fieldName

`string`

##### value

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

#### Returns

`void`

***

### string()

> **string**: (`fieldName`, `value`) => `void`

Defined in: [src/types/monitor-forms.ts:49](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/monitor-forms.ts#L49)

Handler for string fields

#### Parameters

##### fieldName

`string`

##### value

`string`

#### Returns

`void`
