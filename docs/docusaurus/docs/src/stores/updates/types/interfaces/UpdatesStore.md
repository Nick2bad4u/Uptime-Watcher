# Interface: UpdatesStore

Defined in: [src/stores/updates/types.ts:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/updates/types.ts#L25)

Updates store interface. Manages application update status and operations.

## Properties

### applyUpdate()

> **applyUpdate**: () => `void`

Defined in: [src/stores/updates/types.ts:27](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/updates/types.ts#L27)

Apply downloaded update and restart

#### Returns

`void`

***

### clearUpdateError()

> **clearUpdateError**: () => `void`

Defined in: [src/stores/updates/types.ts:29](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/updates/types.ts#L29)

Clear update error

#### Returns

`void`

***

### setUpdateError()

> **setUpdateError**: (`error`) => `void`

Defined in: [src/stores/updates/types.ts:31](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/updates/types.ts#L31)

Set update error

#### Parameters

##### error

`undefined` | `string`

#### Returns

`void`

***

### setUpdateInfo()

> **setUpdateInfo**: (`info`) => `void`

Defined in: [src/stores/updates/types.ts:33](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/updates/types.ts#L33)

Set update info

#### Parameters

##### info

`undefined` | [`UpdateInfo`](UpdateInfo.md)

#### Returns

`void`

***

### setUpdateProgress()

> **setUpdateProgress**: (`progress`) => `void`

Defined in: [src/stores/updates/types.ts:36](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/updates/types.ts#L36)

Set update progress

#### Parameters

##### progress

`number`

#### Returns

`void`

***

### setUpdateStatus()

> **setUpdateStatus**: (`status`) => `void`

Defined in: [src/stores/updates/types.ts:39](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/updates/types.ts#L39)

Set update status

#### Parameters

##### status

[`UpdateStatus`](../../../types/type-aliases/UpdateStatus.md)

#### Returns

`void`

***

### updateError

> **updateError**: `undefined` \| `string`

Defined in: [src/stores/updates/types.ts:41](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/updates/types.ts#L41)

Update error message if any

***

### updateInfo

> **updateInfo**: `undefined` \| [`UpdateInfo`](UpdateInfo.md)

Defined in: [src/stores/updates/types.ts:43](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/updates/types.ts#L43)

Update information

***

### updateProgress

> **updateProgress**: `number`

Defined in: [src/stores/updates/types.ts:45](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/updates/types.ts#L45)

Update progress (0-100)

***

### updateStatus

> **updateStatus**: [`UpdateStatus`](../../../types/type-aliases/UpdateStatus.md)

Defined in: [src/stores/updates/types.ts:48](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/updates/types.ts#L48)

Current update status
