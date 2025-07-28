# Variable: logger

> `const` **logger**: `object`

Defined in: [electron/utils/logger.ts:38](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/logger.ts#L38)

Main backend logger for general application operations.
Uses "BACKEND" prefix to distinguish from specialized loggers.

## Type declaration

### debug()

> **debug**: (`message`, ...`args`) => `void`

#### Parameters

##### message

`string`

##### args

...`unknown`[]

#### Returns

`void`

### error()

> **error**: (`message`, `error?`, ...`args`) => `void`

#### Parameters

##### message

`string`

##### error?

`unknown`

##### args?

...`unknown`[]

#### Returns

`void`

### info()

> **info**: (`message`, ...`args`) => `void`

#### Parameters

##### message

`string`

##### args

...`unknown`[]

#### Returns

`void`

### warn()

> **warn**: (`message`, ...`args`) => `void`

#### Parameters

##### message

`string`

##### args

...`unknown`[]

#### Returns

`void`
