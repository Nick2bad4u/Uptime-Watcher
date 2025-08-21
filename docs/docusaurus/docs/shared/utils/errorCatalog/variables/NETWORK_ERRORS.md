# Variable: NETWORK\_ERRORS

> `const` **NETWORK\_ERRORS**: `object`

Defined in: [shared/utils/errorCatalog.ts:205](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/errorCatalog.ts#L205)

Network-related error messages.

## Type declaration

### AUTHENTICATION\_FAILED

> `readonly` **AUTHENTICATION\_FAILED**: `"Authentication failed"` = `"Authentication failed"`

Error when authentication fails

### AUTHORIZATION\_FAILED

> `readonly` **AUTHORIZATION\_FAILED**: `"Authorization failed"` = `"Authorization failed"`

Error when authorization fails

### BAD\_REQUEST

> `readonly` **BAD\_REQUEST**: `"Bad request"` = `"Bad request"`

Error when request is malformed

### CONNECTION\_FAILED

> `readonly` **CONNECTION\_FAILED**: `"Network connection failed"` = `"Network connection failed"`

Error when network connection fails

### CONNECTION\_TIMEOUT

> `readonly` **CONNECTION\_TIMEOUT**: `"Connection timed out"` = `"Connection timed out"`

Error when connection times out

### DNS\_RESOLUTION\_FAILED

> `readonly` **DNS\_RESOLUTION\_FAILED**: `"DNS resolution failed"` = `"DNS resolution failed"`

Error when DNS resolution fails

### HOST\_UNREACHABLE

> `readonly` **HOST\_UNREACHABLE**: `"Host unreachable"` = `"Host unreachable"`

Error when host cannot be reached

### RESOURCE\_NOT\_FOUND

> `readonly` **RESOURCE\_NOT\_FOUND**: `"Resource not found"` = `"Resource not found"`

Error when resource is not found

### SERVER\_ERROR

> `readonly` **SERVER\_ERROR**: `"Server error"` = `"Server error"`

Error when server returns error

### SSL\_CONNECTION\_FAILED

> `readonly` **SSL\_CONNECTION\_FAILED**: `"SSL/TLS connection failed"` = `"SSL/TLS connection failed"`

Error when SSL/TLS connection fails

## Remarks

Error messages for network operations, connectivity issues, and communication
errors.
