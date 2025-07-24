# Interface: Logger

Defined in: [electron/utils/interfaces.ts:10](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/interfaces.ts#L10)

Standardized logging interface used throughout utilities.
Provides consistent logging patterns and error reporting.

## Properties

### debug()

> **debug**: (`message`, ...`args`) => `void`

Defined in: [electron/utils/interfaces.ts:11](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/interfaces.ts#L11)

#### Parameters

##### message

`string`

##### args

...`unknown`[]

#### Returns

`void`

***

### error()

> **error**: (`message`, `error?`, ...`args`) => `void`

Defined in: [electron/utils/interfaces.ts:12](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/interfaces.ts#L12)

#### Parameters

##### message

`string`

##### error?

`unknown`

##### args?

...`unknown`[]

#### Returns

`void`

***

### info()

> **info**: (`message`, ...`args`) => `void`

Defined in: [electron/utils/interfaces.ts:13](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/interfaces.ts#L13)

#### Parameters

##### message

`string`

##### args

...`unknown`[]

#### Returns

`void`

***

### warn()

> **warn**: (`message`, ...`args`) => `void`

Defined in: [electron/utils/interfaces.ts:14](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/interfaces.ts#L14)

#### Parameters

##### message

`string`

##### args

...`unknown`[]

#### Returns

`void`
