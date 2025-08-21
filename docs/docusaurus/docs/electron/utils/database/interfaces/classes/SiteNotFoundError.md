# Class: SiteNotFoundError

Defined in: [electron/utils/database/interfaces.ts:98](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/database/interfaces.ts#L98)

Custom error for site not found scenarios.

Thrown when attempting to access a site that doesn't exist in the system.

## Extends

- [`Error`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

## Constructors

### Constructor

> **new SiteNotFoundError**(`identifier`): `SiteNotFoundError`

Defined in: [electron/utils/database/interfaces.ts:104](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/database/interfaces.ts#L104)

Create a new SiteNotFoundError.

#### Parameters

##### identifier

`string`

The site identifier that was not found

#### Returns

`SiteNotFoundError`

#### Overrides

`Error.constructor`
