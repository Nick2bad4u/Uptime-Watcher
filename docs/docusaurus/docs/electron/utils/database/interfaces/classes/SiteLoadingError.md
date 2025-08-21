# Class: SiteLoadingError

Defined in: [electron/utils/database/interfaces.ts:72](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/database/interfaces.ts#L72)

Custom error for site loading operations.

Provides enhanced error context and stack trace preservation for site loading
failures.

## Extends

- [`Error`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

## Constructors

### Constructor

> **new SiteLoadingError**(`message`, `cause?`): `SiteLoadingError`

Defined in: [electron/utils/database/interfaces.ts:79](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/database/interfaces.ts#L79)

Create a new SiteLoadingError.

#### Parameters

##### message

`string`

Descriptive error message

##### cause?

[`Error`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Optional underlying error that caused this failure

#### Returns

`SiteLoadingError`

#### Overrides

`Error.constructor`
