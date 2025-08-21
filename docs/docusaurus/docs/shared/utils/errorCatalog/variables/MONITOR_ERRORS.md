# Variable: MONITOR\_ERRORS

> `const` **MONITOR\_ERRORS**: `object`

Defined in: [shared/utils/errorCatalog.ts:77](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/errorCatalog.ts#L77)

Monitor-related error messages.

## Type declaration

### CANNOT\_REMOVE\_LAST

> `readonly` **CANNOT\_REMOVE\_LAST**: `"Cannot remove the last monitor from a site. Use site removal instead."` = `"Cannot remove the last monitor from a site. Use site removal instead."`

Error when trying to remove the last monitor from a site

### CONFIGURATION\_INVALID

> `readonly` **CONFIGURATION\_INVALID**: `"Monitor configuration is invalid"` = `"Monitor configuration is invalid"`

Error when monitor configuration is invalid

### FAILED\_TO\_ADD

> `readonly` **FAILED\_TO\_ADD**: `"Failed to add monitor"` = `"Failed to add monitor"`

Error when attempting to add a monitor fails

### FAILED\_TO\_REMOVE

> `readonly` **FAILED\_TO\_REMOVE**: `"Failed to remove monitor"` = `"Failed to remove monitor"`

Error when attempting to remove a monitor fails

### FAILED\_TO\_UPDATE

> `readonly` **FAILED\_TO\_UPDATE**: `"Failed to update monitor"` = `"Failed to update monitor"`

Error when attempting to update a monitor fails

### FAILED\_TO\_UPDATE\_INTERVAL

> `readonly` **FAILED\_TO\_UPDATE\_INTERVAL**: `"Failed to update check interval"` = `"Failed to update check interval"`

Error when attempting to update check interval fails

### INVALID\_ID

> `readonly` **INVALID\_ID**: `"Monitor ID is invalid or missing"` = `"Monitor ID is invalid or missing"`

Error when monitor ID is invalid or missing

### INVALID\_INTERVAL

> `readonly` **INVALID\_INTERVAL**: `"Check interval must be a positive number"` = `"Check interval must be a positive number"`

Error when check interval is invalid

### INVALID\_RETRY\_ATTEMPTS

> `readonly` **INVALID\_RETRY\_ATTEMPTS**: `"Retry attempts must be a non-negative number"` = `"Retry attempts must be a non-negative number"`

Error when retry attempts value is invalid

### INVALID\_TIMEOUT

> `readonly` **INVALID\_TIMEOUT**: `"Timeout must be a positive number"` = `"Timeout must be a positive number"`

Error when timeout value is invalid

### NOT\_FOUND

> `readonly` **NOT\_FOUND**: `"Monitor not found"` = `"Monitor not found"`

Error when a requested monitor cannot be found

### TYPE\_NOT\_SUPPORTED

> `readonly` **TYPE\_NOT\_SUPPORTED**: `"Monitor type is not supported"` = `"Monitor type is not supported"`

Error when monitor type is not supported

## Remarks

Error messages for monitor operations, configuration validation, and monitor
lifecycle management.
