# Variable: default

> `const` **default**: `object`

Defined in: [src/services/logger.ts:24](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/services/logger.ts#L24)

## Type declaration

### app

> **app**: `object`

#### app.error()

> **error**: (`context`, `error`) => `void`

##### Parameters

###### context

`string`

###### error

[`Error`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

##### Returns

`void`

#### app.performance()

> **performance**: (`operation`, `duration`) => `void`

##### Parameters

###### operation

`string`

###### duration

`number`

##### Returns

`void`

#### app.started()

> **started**: () => `void`

##### Returns

`void`

#### app.stopped()

> **stopped**: () => `void`

##### Returns

`void`

### debug()

> **debug**: (`message`, ...`arguments_`) => `void`

#### Parameters

##### message

`string`

##### arguments\_

...`unknown`[]

#### Returns

`void`

### error()

> **error**: (`message`, `error?`, ...`arguments_`) => `void`

#### Parameters

##### message

`string`

##### error?

[`Error`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

##### arguments\_?

...`unknown`[]

#### Returns

`void`

### info()

> **info**: (`message`, ...`arguments_`) => `void`

#### Parameters

##### message

`string`

##### arguments\_

...`unknown`[]

#### Returns

`void`

### raw

> **raw**: `RendererLogger` & `object` = `log`

### silly()

> **silly**: (`message`, ...`arguments_`) => `void`

#### Parameters

##### message

`string`

##### arguments\_

...`unknown`[]

#### Returns

`void`

### site

> **site**: `object`

#### site.added()

> **added**: (`identifier`) => `void`

##### Parameters

###### identifier

`string`

##### Returns

`void`

#### site.check()

> **check**: (`identifier`, `status`, `responseTime?`) => `void`

##### Parameters

###### identifier

`string`

###### status

`string`

###### responseTime?

`number`

##### Returns

`void`

#### site.error()

> **error**: (`identifier`, `error`) => `void`

##### Parameters

###### identifier

`string`

###### error

`string` | [`Error`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

##### Returns

`void`

#### site.removed()

> **removed**: (`identifier`) => `void`

##### Parameters

###### identifier

`string`

##### Returns

`void`

#### site.statusChange()

> **statusChange**: (`identifier`, `oldStatus`, `newStatus`) => `void`

##### Parameters

###### identifier

`string`

###### oldStatus

`string`

###### newStatus

`string`

##### Returns

`void`

### system

> **system**: `object`

#### system.notification()

> **notification**: (`title`, `body`) => `void`

##### Parameters

###### title

`string`

###### body

`string`

##### Returns

`void`

#### system.tray()

> **tray**: (`action`) => `void`

##### Parameters

###### action

`string`

##### Returns

`void`

#### system.window()

> **window**: (`action`, `windowName?`) => `void`

##### Parameters

###### action

`string`

###### windowName?

`string`

##### Returns

`void`

### user

> **user**: `object`

#### user.action()

> **action**: (`action`, `details?`) => `void`

##### Parameters

###### action

`string`

###### details?

`unknown`

##### Returns

`void`

#### user.settingsChange()

> **settingsChange**: (`setting`, `oldValue`, `newValue`) => `void`

##### Parameters

###### setting

`string`

###### oldValue

`unknown`

###### newValue

`unknown`

##### Returns

`void`

### verbose()

> **verbose**: (`message`, ...`arguments_`) => `void`

#### Parameters

##### message

`string`

##### arguments\_

...`unknown`[]

#### Returns

`void`

### warn()

> **warn**: (`message`, ...`arguments_`) => `void`

#### Parameters

##### message

`string`

##### arguments\_

...`unknown`[]

#### Returns

`void`
