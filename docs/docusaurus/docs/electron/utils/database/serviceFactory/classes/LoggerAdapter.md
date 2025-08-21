# Class: LoggerAdapter

Defined in: [electron/utils/database/serviceFactory.ts:27](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/database/serviceFactory.ts#L27)

Adapter for the logger to implement Logger interface.

Adapts the monitorLogger instance to match the Logger interface required by
database services, providing a consistent logging interface across different
components while maintaining type safety.

## See

Logger for the interface this class implements

## Constructors

### Constructor

> **new LoggerAdapter**(`logger`): `LoggerAdapter`

Defined in: [electron/utils/database/serviceFactory.ts:30](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/database/serviceFactory.ts#L30)

#### Parameters

##### logger

`Logger`

#### Returns

`LoggerAdapter`

## Methods

### debug()

> **debug**(`message`, ...`args`): `void`

Defined in: [electron/utils/database/serviceFactory.ts:34](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/database/serviceFactory.ts#L34)

#### Parameters

##### message

`string`

##### args

...`unknown`[]

#### Returns

`void`

***

### error()

> **error**(`message`, `error?`, ...`args?`): `void`

Defined in: [electron/utils/database/serviceFactory.ts:38](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/database/serviceFactory.ts#L38)

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

> **info**(`message`, ...`args`): `void`

Defined in: [electron/utils/database/serviceFactory.ts:42](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/database/serviceFactory.ts#L42)

#### Parameters

##### message

`string`

##### args

...`unknown`[]

#### Returns

`void`

***

### warn()

> **warn**(`message`, ...`args`): `void`

Defined in: [electron/utils/database/serviceFactory.ts:46](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/database/serviceFactory.ts#L46)

#### Parameters

##### message

`string`

##### args

...`unknown`[]

#### Returns

`void`
