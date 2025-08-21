# Interface: UseMonitorTypesResult

Defined in: [src/hooks/useMonitorTypes.ts:53](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/useMonitorTypes.ts#L53)

Result interface for the useMonitorTypes hook

## Properties

### error

> **error**: `undefined` \| `string`

Defined in: [src/hooks/useMonitorTypes.ts:55](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/useMonitorTypes.ts#L55)

Error message if loading failed

***

### isLoading

> **isLoading**: `boolean`

Defined in: [src/hooks/useMonitorTypes.ts:57](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/useMonitorTypes.ts#L57)

Whether monitor types are currently loading

***

### options

> **options**: `object`[]

Defined in: [src/hooks/useMonitorTypes.ts:59](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/useMonitorTypes.ts#L59)

Monitor type options for form select fields

#### label

> **label**: `string`

#### value

> **value**: `string`

***

### refresh()

> **refresh**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/hooks/useMonitorTypes.ts:61](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/useMonitorTypes.ts#L61)

Refresh monitor types from backend

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>
