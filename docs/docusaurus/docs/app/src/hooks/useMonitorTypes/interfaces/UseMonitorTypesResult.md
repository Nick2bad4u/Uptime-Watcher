# Interface: UseMonitorTypesResult

Defined in: [src/hooks/useMonitorTypes.ts:16](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/hooks/useMonitorTypes.ts#L16)

Result interface for the useMonitorTypes hook

## Properties

### error

> **error**: `undefined` \| `string`

Defined in: [src/hooks/useMonitorTypes.ts:18](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/hooks/useMonitorTypes.ts#L18)

Error message if loading failed

***

### isLoading

> **isLoading**: `boolean`

Defined in: [src/hooks/useMonitorTypes.ts:20](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/hooks/useMonitorTypes.ts#L20)

Whether monitor types are currently loading

***

### options

> **options**: `object`[]

Defined in: [src/hooks/useMonitorTypes.ts:22](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/hooks/useMonitorTypes.ts#L22)

Monitor type options for form select fields

#### label

> **label**: `string`

#### value

> **value**: `string`

***

### refresh()

> **refresh**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/hooks/useMonitorTypes.ts:24](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/hooks/useMonitorTypes.ts#L24)

Refresh monitor types from backend

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>
