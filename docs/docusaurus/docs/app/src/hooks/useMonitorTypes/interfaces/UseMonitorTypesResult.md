# Interface: UseMonitorTypesResult

Defined in: [src/hooks/useMonitorTypes.ts:50](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/useMonitorTypes.ts#L50)

Result interface for the useMonitorTypes hook

## Properties

### error

> **error**: `undefined` \| `string`

Defined in: [src/hooks/useMonitorTypes.ts:52](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/useMonitorTypes.ts#L52)

Error message if loading failed

***

### isLoading

> **isLoading**: `boolean`

Defined in: [src/hooks/useMonitorTypes.ts:54](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/useMonitorTypes.ts#L54)

Whether monitor types are currently loading

***

### options

> **options**: `object`[]

Defined in: [src/hooks/useMonitorTypes.ts:56](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/useMonitorTypes.ts#L56)

Monitor type options for form select fields

#### label

> **label**: `string`

#### value

> **value**: `string`

***

### refresh()

> **refresh**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/hooks/useMonitorTypes.ts:58](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/useMonitorTypes.ts#L58)

Refresh monitor types from backend

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>
