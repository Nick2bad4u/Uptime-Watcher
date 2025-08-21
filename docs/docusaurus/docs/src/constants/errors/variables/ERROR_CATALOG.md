# Variable: ERROR\_CATALOG

> `const` **ERROR\_CATALOG**: `object`

Defined in: [src/constants/errors.ts:15](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/constants/errors.ts#L15)

Structured error catalog containing all application error messages. Messages
are organized by domain for better maintainability.

## Type declaration

### database

> `readonly` **database**: `object`

#### database.CONNECTION\_FAILED

> `readonly` **CONNECTION\_FAILED**: `"Database connection failed"` = `"Database connection failed"`

#### database.QUERY\_FAILED

> `readonly` **QUERY\_FAILED**: `"Database query failed"` = `"Database query failed"`

#### database.RECORD\_NOT\_FOUND

> `readonly` **RECORD\_NOT\_FOUND**: `"Record not found"` = `"Record not found"`

### monitors

> `readonly` **monitors**: `object`

#### monitors.CANNOT\_REMOVE\_LAST

> `readonly` **CANNOT\_REMOVE\_LAST**: `"Cannot remove the last monitor from a site. Use site removal instead."` = `"Cannot remove the last monitor from a site. Use site removal instead."`

#### monitors.FAILED\_TO\_ADD

> `readonly` **FAILED\_TO\_ADD**: `"Failed to add monitor"` = `"Failed to add monitor"`

#### monitors.FAILED\_TO\_UPDATE\_INTERVAL

> `readonly` **FAILED\_TO\_UPDATE\_INTERVAL**: `"Failed to update check interval"` = `"Failed to update check interval"`

#### monitors.NOT\_FOUND

> `readonly` **NOT\_FOUND**: `"Monitor not found"` = `"Monitor not found"`

### network

> `readonly` **network**: `object`

#### network.CONNECTION\_FAILED

> `readonly` **CONNECTION\_FAILED**: `"Network connection failed"` = `"Network connection failed"`

#### network.CONNECTION\_TIMEOUT

> `readonly` **CONNECTION\_TIMEOUT**: `"Connection timed out"` = `"Connection timed out"`

#### network.HOST\_UNREACHABLE

> `readonly` **HOST\_UNREACHABLE**: `"Host unreachable"` = `"Host unreachable"`

### sites

> `readonly` **sites**: `object`

#### sites.FAILED\_TO\_ADD

> `readonly` **FAILED\_TO\_ADD**: `"Failed to add site"` = `"Failed to add site"`

#### sites.FAILED\_TO\_CHECK

> `readonly` **FAILED\_TO\_CHECK**: `"Failed to check site"` = `"Failed to check site"`

#### sites.FAILED\_TO\_DELETE

> `readonly` **FAILED\_TO\_DELETE**: `"Failed to delete site"` = `"Failed to delete site"`

#### sites.FAILED\_TO\_UPDATE

> `readonly` **FAILED\_TO\_UPDATE**: `"Failed to update site"` = `"Failed to update site"`

#### sites.NOT\_FOUND

> `readonly` **NOT\_FOUND**: `"Site not found"` = `"Site not found"`

### system

> `readonly` **system**: `object`

#### system.INTERNAL\_ERROR

> `readonly` **INTERNAL\_ERROR**: `"An internal error occurred"` = `"An internal error occurred"`

#### system.OPERATION\_TIMEOUT

> `readonly` **OPERATION\_TIMEOUT**: `"Operation timed out"` = `"Operation timed out"`

#### system.SERVICE\_UNAVAILABLE

> `readonly` **SERVICE\_UNAVAILABLE**: `"Service temporarily unavailable"` = `"Service temporarily unavailable"`

### validation

> `readonly` **validation**: `object`

#### validation.FIELD\_REQUIRED

> `readonly` **FIELD\_REQUIRED**: `"This field is required"` = `"This field is required"`

#### validation.HOST\_INVALID

> `readonly` **HOST\_INVALID**: `"Host address is invalid"` = `"Host address is invalid"`

#### validation.URL\_INVALID

> `readonly` **URL\_INVALID**: `"URL format is invalid"` = `"URL format is invalid"`
