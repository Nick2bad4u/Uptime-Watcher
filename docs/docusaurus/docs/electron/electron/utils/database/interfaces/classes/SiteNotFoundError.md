# Class: SiteNotFoundError

Defined in: [electron/utils/database/interfaces.ts:93](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/database/interfaces.ts#L93)

Custom error for site not found scenarios.

Thrown when attempting to access a site that doesn't exist in the system.

## Extends

- [`Error`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

## Constructors

### Constructor

> **new SiteNotFoundError**(`identifier`): `SiteNotFoundError`

Defined in: [electron/utils/database/interfaces.ts:99](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/database/interfaces.ts#L99)

Create a new SiteNotFoundError.

#### Parameters

##### identifier

`string`

The site identifier that was not found

#### Returns

`SiteNotFoundError`

#### Overrides

`Error.constructor`
