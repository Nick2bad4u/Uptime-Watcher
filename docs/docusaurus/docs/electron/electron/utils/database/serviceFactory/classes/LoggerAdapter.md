# Class: LoggerAdapter

Defined in: [electron/utils/database/serviceFactory.ts:18](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/database/serviceFactory.ts#L18)

Adapter for the logger to implement Logger interface.

Adapts the monitorLogger instance to match the Logger interface required
by database services, providing a consistent logging interface across
different components while maintaining type safety.

## See

Logger for the interface this class implements

## Constructors

### Constructor

> **new LoggerAdapter**(`logger`): `LoggerAdapter`

Defined in: [electron/utils/database/serviceFactory.ts:21](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/database/serviceFactory.ts#L21)

#### Parameters

##### logger

###### debug

(`message`, ...`args`) => `void` = `...`

###### error

(`message`, `error?`, ...`args`) => `void` = `...`

###### info

(`message`, ...`args`) => `void` = `...`

###### warn

(`message`, ...`args`) => `void` = `...`

#### Returns

`LoggerAdapter`

## Methods

### debug()

> **debug**(`message`, ...`args`): `void`

Defined in: [electron/utils/database/serviceFactory.ts:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/database/serviceFactory.ts#L25)

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

Defined in: [electron/utils/database/serviceFactory.ts:29](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/database/serviceFactory.ts#L29)

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

Defined in: [electron/utils/database/serviceFactory.ts:33](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/database/serviceFactory.ts#L33)

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

Defined in: [electron/utils/database/serviceFactory.ts:37](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/database/serviceFactory.ts#L37)

#### Parameters

##### message

`string`

##### args

...`unknown`[]

#### Returns

`void`
