# Class: LoggerAdapter

Defined in: [electron/utils/database/serviceFactory.ts:12](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/utils/database/serviceFactory.ts#L12)

Adapter for the logger to implement Logger interface.

## Constructors

### Constructor

> **new LoggerAdapter**(`logger`): `LoggerAdapter`

Defined in: [electron/utils/database/serviceFactory.ts:15](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/utils/database/serviceFactory.ts#L15)

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

Defined in: [electron/utils/database/serviceFactory.ts:19](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/utils/database/serviceFactory.ts#L19)

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

Defined in: [electron/utils/database/serviceFactory.ts:23](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/utils/database/serviceFactory.ts#L23)

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

Defined in: [electron/utils/database/serviceFactory.ts:27](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/utils/database/serviceFactory.ts#L27)

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

Defined in: [electron/utils/database/serviceFactory.ts:31](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/utils/database/serviceFactory.ts#L31)

#### Parameters

##### message

`string`

##### args

...`unknown`[]

#### Returns

`void`
