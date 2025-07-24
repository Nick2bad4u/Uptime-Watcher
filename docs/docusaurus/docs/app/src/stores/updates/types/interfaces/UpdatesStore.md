# Interface: UpdatesStore

Defined in: [src/stores/updates/types.ts:26](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/updates/types.ts#L26)

Updates store interface.
Manages application update status and operations.

## Properties

### applyUpdate()

> **applyUpdate**: () => `void`

Defined in: [src/stores/updates/types.ts:28](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/updates/types.ts#L28)

Apply downloaded update and restart

#### Returns

`void`

***

### clearUpdateError()

> **clearUpdateError**: () => `void`

Defined in: [src/stores/updates/types.ts:30](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/updates/types.ts#L30)

Clear update error

#### Returns

`void`

***

### setUpdateError()

> **setUpdateError**: (`error`) => `void`

Defined in: [src/stores/updates/types.ts:32](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/updates/types.ts#L32)

Set update error

#### Parameters

##### error

`undefined` | `string`

#### Returns

`void`

***

### setUpdateInfo()

> **setUpdateInfo**: (`info`) => `void`

Defined in: [src/stores/updates/types.ts:34](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/updates/types.ts#L34)

Set update info

#### Parameters

##### info

`undefined` | [`UpdateInfo`](UpdateInfo.md)

#### Returns

`void`

***

### setUpdateProgress()

> **setUpdateProgress**: (`progress`) => `void`

Defined in: [src/stores/updates/types.ts:37](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/updates/types.ts#L37)

Set update progress

#### Parameters

##### progress

`number`

#### Returns

`void`

***

### setUpdateStatus()

> **setUpdateStatus**: (`status`) => `void`

Defined in: [src/stores/updates/types.ts:40](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/updates/types.ts#L40)

Set update status

#### Parameters

##### status

[`UpdateStatus`](../../../types/type-aliases/UpdateStatus.md)

#### Returns

`void`

***

### updateError

> **updateError**: `undefined` \| `string`

Defined in: [src/stores/updates/types.ts:42](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/updates/types.ts#L42)

Update error message if any

***

### updateInfo

> **updateInfo**: `undefined` \| [`UpdateInfo`](UpdateInfo.md)

Defined in: [src/stores/updates/types.ts:44](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/updates/types.ts#L44)

Update information

***

### updateProgress

> **updateProgress**: `number`

Defined in: [src/stores/updates/types.ts:46](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/updates/types.ts#L46)

Update progress (0-100)

***

### updateStatus

> **updateStatus**: [`UpdateStatus`](../../../types/type-aliases/UpdateStatus.md)

Defined in: [src/stores/updates/types.ts:49](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/updates/types.ts#L49)

Current update status
