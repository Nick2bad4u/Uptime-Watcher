# Interface: Logger

Defined in: [electron/utils/interfaces.ts:49](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/interfaces.ts#L49)

Standardized logging interface used throughout utilities.

## Remarks

Provides consistent logging patterns and error reporting across all utility
modules. All logging methods accept a message string followed by optional
additional arguments for structured logging and context information.

## Properties

### debug()

> **debug**: (`message`, ...`args`) => `void`

Defined in: [electron/utils/interfaces.ts:56](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/interfaces.ts#L56)

Log debug information for development and troubleshooting.

#### Parameters

##### message

`string`

The debug message to log

##### args

...`unknown`[]

Additional arguments for context

#### Returns

`void`

***

### error()

> **error**: (`message`, `error?`, ...`args`) => `void`

Defined in: [electron/utils/interfaces.ts:69](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/interfaces.ts#L69)

Log error messages with optional error objects.

#### Parameters

##### message

`string`

The error message to log

##### error?

`unknown`

Optional error object or additional context

##### args?

...`unknown`[]

Additional arguments for context

#### Returns

`void`

#### Remarks

When an Error object is provided, the logger should extract and format
the error message and stack trace appropriately for debugging.

***

### info()

> **info**: (`message`, ...`args`) => `void`

Defined in: [electron/utils/interfaces.ts:77](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/interfaces.ts#L77)

Log general informational messages.

#### Parameters

##### message

`string`

The information message to log

##### args

...`unknown`[]

Additional arguments for context

#### Returns

`void`

***

### warn()

> **warn**: (`message`, ...`args`) => `void`

Defined in: [electron/utils/interfaces.ts:85](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/interfaces.ts#L85)

Log warning messages for potential issues.

#### Parameters

##### message

`string`

The warning message to log

##### args

...`unknown`[]

Additional arguments for context

#### Returns

`void`
