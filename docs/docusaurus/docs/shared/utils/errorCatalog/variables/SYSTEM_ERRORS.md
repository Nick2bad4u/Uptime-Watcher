# Variable: SYSTEM\_ERRORS

> `const` **SYSTEM\_ERRORS**: `object`

Defined in: [shared/utils/errorCatalog.ts:166](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/errorCatalog.ts#L166)

System-related error messages.

## Type declaration

### ACCESS\_DENIED

> `readonly` **ACCESS\_DENIED**: `"Access denied"` = `"Access denied"`

Error when resource access is denied

### CLEANUP\_FAILED

> `readonly` **CLEANUP\_FAILED**: `"Cleanup operation failed"` = `"Cleanup operation failed"`

Error when cleanup operation fails

### CONFIGURATION\_ERROR

> `readonly` **CONFIGURATION\_ERROR**: `"Configuration error"` = `"Configuration error"`

Error when configuration is missing or invalid

### INITIALIZATION\_FAILED

> `readonly` **INITIALIZATION\_FAILED**: `"Initialization failed"` = `"Initialization failed"`

Error when initialization fails

### INTERNAL\_ERROR

> `readonly` **INTERNAL\_ERROR**: `"An internal error occurred"` = `"An internal error occurred"`

Generic internal server error

### OPERATION\_FAILED\_NO\_FALLBACK

> `readonly` **OPERATION\_FAILED\_NO\_FALLBACK**: `"Operation failed and no fallback value provided"` = `"Operation failed and no fallback value provided"`

Error when operation fails and no fallback value provided

### OPERATION\_NOT\_PERMITTED

> `readonly` **OPERATION\_NOT\_PERMITTED**: `"Operation not permitted"` = `"Operation not permitted"`

Error when operation is not permitted

### OPERATION\_TIMEOUT

> `readonly` **OPERATION\_TIMEOUT**: `"Operation timed out"` = `"Operation timed out"`

Error when operation times out

### SERVICE\_UNAVAILABLE

> `readonly` **SERVICE\_UNAVAILABLE**: `"Service temporarily unavailable"` = `"Service temporarily unavailable"`

Error when service is unavailable

## Remarks

Error messages for general system operations, infrastructure issues, and
application-level errors.
