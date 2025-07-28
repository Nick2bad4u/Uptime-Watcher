# Interface: Logger

Defined in: [electron/utils/interfaces.ts:14](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/interfaces.ts#L14)

Standardized logging interface used throughout utilities.

## Remarks

Provides consistent logging patterns and error reporting across all utility modules.
All logging methods accept a message string followed by optional additional arguments
for structured logging and context information.

## Properties

### debug()

> **debug**: (`message`, ...`args`) => `void`

Defined in: [electron/utils/interfaces.ts:21](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/interfaces.ts#L21)

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

Defined in: [electron/utils/interfaces.ts:34](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/interfaces.ts#L34)

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

Defined in: [electron/utils/interfaces.ts:42](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/interfaces.ts#L42)

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

Defined in: [electron/utils/interfaces.ts:50](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/interfaces.ts#L50)

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
