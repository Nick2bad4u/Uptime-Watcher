# Interface: MonitorFieldValidation

Defined in: [shared/types/formData.ts:137](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L137)

Monitor field validation interface.

## Remarks

Used for validating individual monitor fields based on monitor type.

## Properties

### fieldName

> **fieldName**: `string`

Defined in: [shared/types/formData.ts:139](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L139)

Field name

***

### fieldType

> **fieldType**: `"string"` \| `"number"` \| `"boolean"` \| `"port"` \| `"url"` \| `"host"`

Defined in: [shared/types/formData.ts:141](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L141)

Field type

***

### max?

> `optional` **max**: `number`

Defined in: [shared/types/formData.ts:143](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L143)

Maximum value (for number fields)

***

### min?

> `optional` **min**: `number`

Defined in: [shared/types/formData.ts:145](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L145)

Minimum value (for number fields)

***

### pattern?

> `optional` **pattern**: [`RegExp`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/RegExp)

Defined in: [shared/types/formData.ts:147](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L147)

Validation pattern (for string fields)

***

### required

> **required**: `boolean`

Defined in: [shared/types/formData.ts:149](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L149)

Whether the field is required

***

### validator()?

> `optional` **validator**: (`value`) => `null` \| `string`

Defined in: [shared/types/formData.ts:151](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L151)

Custom validation function

#### Parameters

##### value

`unknown`

#### Returns

`null` \| `string`
