# Interface: ErrorCatalogInterface

Defined in: [shared/utils/errorCatalog.ts:306](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/errorCatalog.ts#L306)

Interface for the error catalog structure.

## Properties

### database

> `readonly` **database**: `object`

Defined in: [shared/utils/errorCatalog.ts:307](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/errorCatalog.ts#L307)

#### BACKUP\_FAILED

> `readonly` **BACKUP\_FAILED**: `"Backup operation failed"` = `"Backup operation failed"`

Error when backup operation fails

#### CONNECTION\_FAILED

> `readonly` **CONNECTION\_FAILED**: `"Database connection failed"` = `"Database connection failed"`

Error when database connection fails

#### CONSTRAINT\_VIOLATION

> `readonly` **CONSTRAINT\_VIOLATION**: `"Data constraint violation"` = `"Data constraint violation"`

Error when data constraint is violated

#### DATABASE\_LOCKED

> `readonly` **DATABASE\_LOCKED**: `"Database is locked"` = `"Database is locked"`

Error when database is locked

#### DUPLICATE\_ENTRY

> `readonly` **DUPLICATE\_ENTRY**: `"Duplicate entry detected"` = `"Duplicate entry detected"`

Error when duplicate entry is detected

#### IMPORT\_DATA\_INVALID

> `readonly` **IMPORT\_DATA\_INVALID**: `"Invalid import data format"` = `"Invalid import data format"`

Error when import data format is invalid

#### MIGRATION\_FAILED

> `readonly` **MIGRATION\_FAILED**: `"Data migration failed"` = `"Data migration failed"`

Error when data migration fails

#### QUERY\_FAILED

> `readonly` **QUERY\_FAILED**: `"Database query failed"` = `"Database query failed"`

Error when query execution fails

#### RECORD\_NOT\_FOUND

> `readonly` **RECORD\_NOT\_FOUND**: `"Record not found"` = `"Record not found"`

Error when record is not found

#### RESTORE\_FAILED

> `readonly` **RESTORE\_FAILED**: `"Restore operation failed"` = `"Restore operation failed"`

Error when restore operation fails

#### TRANSACTION\_FAILED

> `readonly` **TRANSACTION\_FAILED**: `"Database transaction failed"` = `"Database transaction failed"`

Error when transaction fails

***

### ipc

> `readonly` **ipc**: `object`

Defined in: [shared/utils/errorCatalog.ts:308](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/errorCatalog.ts#L308)

#### INVALID\_RESPONSE\_FORMAT

> `readonly` **INVALID\_RESPONSE\_FORMAT**: `"Invalid IPC response format"` = `"Invalid IPC response format"`

Error when IPC response format is invalid

#### IPC\_OPERATION\_FAILED

> `readonly` **IPC\_OPERATION\_FAILED**: `"Operation failed"` = `"Operation failed"`

Error when IPC operation fails

#### VALIDATION\_FAILED

> `readonly` **VALIDATION\_FAILED**: `"IPC validation failed"` = `"IPC validation failed"`

Error when IPC validation fails

***

### monitors

> `readonly` **monitors**: `object`

Defined in: [shared/utils/errorCatalog.ts:309](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/errorCatalog.ts#L309)

#### CANNOT\_REMOVE\_LAST

> `readonly` **CANNOT\_REMOVE\_LAST**: `"Cannot remove the last monitor from a site. Use site removal instead."` = `"Cannot remove the last monitor from a site. Use site removal instead."`

Error when trying to remove the last monitor from a site

#### CONFIGURATION\_INVALID

> `readonly` **CONFIGURATION\_INVALID**: `"Monitor configuration is invalid"` = `"Monitor configuration is invalid"`

Error when monitor configuration is invalid

#### FAILED\_TO\_ADD

> `readonly` **FAILED\_TO\_ADD**: `"Failed to add monitor"` = `"Failed to add monitor"`

Error when attempting to add a monitor fails

#### FAILED\_TO\_REMOVE

> `readonly` **FAILED\_TO\_REMOVE**: `"Failed to remove monitor"` = `"Failed to remove monitor"`

Error when attempting to remove a monitor fails

#### FAILED\_TO\_UPDATE

> `readonly` **FAILED\_TO\_UPDATE**: `"Failed to update monitor"` = `"Failed to update monitor"`

Error when attempting to update a monitor fails

#### FAILED\_TO\_UPDATE\_INTERVAL

> `readonly` **FAILED\_TO\_UPDATE\_INTERVAL**: `"Failed to update check interval"` = `"Failed to update check interval"`

Error when attempting to update check interval fails

#### INVALID\_ID

> `readonly` **INVALID\_ID**: `"Monitor ID is invalid or missing"` = `"Monitor ID is invalid or missing"`

Error when monitor ID is invalid or missing

#### INVALID\_INTERVAL

> `readonly` **INVALID\_INTERVAL**: `"Check interval must be a positive number"` = `"Check interval must be a positive number"`

Error when check interval is invalid

#### INVALID\_RETRY\_ATTEMPTS

> `readonly` **INVALID\_RETRY\_ATTEMPTS**: `"Retry attempts must be a non-negative number"` = `"Retry attempts must be a non-negative number"`

Error when retry attempts value is invalid

#### INVALID\_TIMEOUT

> `readonly` **INVALID\_TIMEOUT**: `"Timeout must be a positive number"` = `"Timeout must be a positive number"`

Error when timeout value is invalid

#### NOT\_FOUND

> `readonly` **NOT\_FOUND**: `"Monitor not found"` = `"Monitor not found"`

Error when a requested monitor cannot be found

#### TYPE\_NOT\_SUPPORTED

> `readonly` **TYPE\_NOT\_SUPPORTED**: `"Monitor type is not supported"` = `"Monitor type is not supported"`

Error when monitor type is not supported

***

### network

> `readonly` **network**: `object`

Defined in: [shared/utils/errorCatalog.ts:310](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/errorCatalog.ts#L310)

#### AUTHENTICATION\_FAILED

> `readonly` **AUTHENTICATION\_FAILED**: `"Authentication failed"` = `"Authentication failed"`

Error when authentication fails

#### AUTHORIZATION\_FAILED

> `readonly` **AUTHORIZATION\_FAILED**: `"Authorization failed"` = `"Authorization failed"`

Error when authorization fails

#### BAD\_REQUEST

> `readonly` **BAD\_REQUEST**: `"Bad request"` = `"Bad request"`

Error when request is malformed

#### CONNECTION\_FAILED

> `readonly` **CONNECTION\_FAILED**: `"Network connection failed"` = `"Network connection failed"`

Error when network connection fails

#### CONNECTION\_TIMEOUT

> `readonly` **CONNECTION\_TIMEOUT**: `"Connection timed out"` = `"Connection timed out"`

Error when connection times out

#### DNS\_RESOLUTION\_FAILED

> `readonly` **DNS\_RESOLUTION\_FAILED**: `"DNS resolution failed"` = `"DNS resolution failed"`

Error when DNS resolution fails

#### HOST\_UNREACHABLE

> `readonly` **HOST\_UNREACHABLE**: `"Host unreachable"` = `"Host unreachable"`

Error when host cannot be reached

#### RESOURCE\_NOT\_FOUND

> `readonly` **RESOURCE\_NOT\_FOUND**: `"Resource not found"` = `"Resource not found"`

Error when resource is not found

#### SERVER\_ERROR

> `readonly` **SERVER\_ERROR**: `"Server error"` = `"Server error"`

Error when server returns error

#### SSL\_CONNECTION\_FAILED

> `readonly` **SSL\_CONNECTION\_FAILED**: `"SSL/TLS connection failed"` = `"SSL/TLS connection failed"`

Error when SSL/TLS connection fails

***

### sites

> `readonly` **sites**: `object`

Defined in: [shared/utils/errorCatalog.ts:311](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/errorCatalog.ts#L311)

#### ALREADY\_EXISTS

> `readonly` **ALREADY\_EXISTS**: `"Site with this identifier already exists"` = `"Site with this identifier already exists"`

Error when site already exists with the same identifier

#### FAILED\_TO\_ADD

> `readonly` **FAILED\_TO\_ADD**: `"Failed to add site"` = `"Failed to add site"`

Error when attempting to add a site fails

#### FAILED\_TO\_CHECK

> `readonly` **FAILED\_TO\_CHECK**: `"Failed to check site"` = `"Failed to check site"`

Error when site configuration check fails

#### FAILED\_TO\_DELETE

> `readonly` **FAILED\_TO\_DELETE**: `"Failed to delete site"` = `"Failed to delete site"`

Error when attempting to delete a site fails

#### FAILED\_TO\_UPDATE

> `readonly` **FAILED\_TO\_UPDATE**: `"Failed to update site"` = `"Failed to update site"`

Error when attempting to update a site fails

#### INVALID\_IDENTIFIER

> `readonly` **INVALID\_IDENTIFIER**: `"Site identifier is invalid or missing"` = `"Site identifier is invalid or missing"`

Error when site identifier is invalid or empty

#### INVALID\_NAME

> `readonly` **INVALID\_NAME**: `"Site name is invalid or missing"` = `"Site name is invalid or missing"`

Error when site name is invalid or empty

#### NOT\_FOUND

> `readonly` **NOT\_FOUND**: `"Site not found"` = `"Site not found"`

Error when a requested site cannot be found

***

### system

> `readonly` **system**: `object`

Defined in: [shared/utils/errorCatalog.ts:312](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/errorCatalog.ts#L312)

#### ACCESS\_DENIED

> `readonly` **ACCESS\_DENIED**: `"Access denied"` = `"Access denied"`

Error when resource access is denied

#### CLEANUP\_FAILED

> `readonly` **CLEANUP\_FAILED**: `"Cleanup operation failed"` = `"Cleanup operation failed"`

Error when cleanup operation fails

#### CONFIGURATION\_ERROR

> `readonly` **CONFIGURATION\_ERROR**: `"Configuration error"` = `"Configuration error"`

Error when configuration is missing or invalid

#### INITIALIZATION\_FAILED

> `readonly` **INITIALIZATION\_FAILED**: `"Initialization failed"` = `"Initialization failed"`

Error when initialization fails

#### INTERNAL\_ERROR

> `readonly` **INTERNAL\_ERROR**: `"An internal error occurred"` = `"An internal error occurred"`

Generic internal server error

#### OPERATION\_FAILED\_NO\_FALLBACK

> `readonly` **OPERATION\_FAILED\_NO\_FALLBACK**: `"Operation failed and no fallback value provided"` = `"Operation failed and no fallback value provided"`

Error when operation fails and no fallback value provided

#### OPERATION\_NOT\_PERMITTED

> `readonly` **OPERATION\_NOT\_PERMITTED**: `"Operation not permitted"` = `"Operation not permitted"`

Error when operation is not permitted

#### OPERATION\_TIMEOUT

> `readonly` **OPERATION\_TIMEOUT**: `"Operation timed out"` = `"Operation timed out"`

Error when operation times out

#### SERVICE\_UNAVAILABLE

> `readonly` **SERVICE\_UNAVAILABLE**: `"Service temporarily unavailable"` = `"Service temporarily unavailable"`

Error when service is unavailable

***

### validation

> `readonly` **validation**: `object`

Defined in: [shared/utils/errorCatalog.ts:313](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/errorCatalog.ts#L313)

#### EMAIL\_INVALID

> `readonly` **EMAIL\_INVALID**: `"Email format is invalid"` = `"Email format is invalid"`

Error when email format is invalid

#### FIELD\_INVALID\_FORMAT

> `readonly` **FIELD\_INVALID\_FORMAT**: `"Field format is invalid"` = `"Field format is invalid"`

Error when field format is invalid

#### FIELD\_REQUIRED

> `readonly` **FIELD\_REQUIRED**: `"This field is required"` = `"This field is required"`

Error when required field is missing

#### HOST\_INVALID

> `readonly` **HOST\_INVALID**: `"Host address is invalid"` = `"Host address is invalid"`

Error when host address is invalid

#### PORT\_INVALID

> `readonly` **PORT\_INVALID**: `"Port number must be between 1 and 65535"` = `"Port number must be between 1 and 65535"`

Error when port number is invalid

#### STRING\_TOO\_LONG

> `readonly` **STRING\_TOO\_LONG**: `"Value exceeds maximum length"` = `"Value exceeds maximum length"`

Error when string length exceeds maximum

#### STRING\_TOO\_SHORT

> `readonly` **STRING\_TOO\_SHORT**: `"Value is below minimum length"` = `"Value is below minimum length"`

Error when string length is below minimum

#### URL\_INVALID

> `readonly` **URL\_INVALID**: `"URL format is invalid"` = `"URL format is invalid"`

Error when URL format is invalid

#### VALIDATION\_FAILED

> `readonly` **VALIDATION\_FAILED**: `"Validation failed"` = `"Validation failed"`

Error when validation fails for an event

#### VALUE\_OUT\_OF\_RANGE

> `readonly` **VALUE\_OUT\_OF\_RANGE**: `"Value is out of allowed range"` = `"Value is out of allowed range"`

Error when value is out of allowed range
