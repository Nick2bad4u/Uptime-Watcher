# Variable: ERROR\_MESSAGES

> `const` **ERROR\_MESSAGES**: `object`

Defined in: [src/constants/errors.ts:19](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/constants/errors.ts#L19)

Standardized error messages used across the application.

## Type declaration

### FAILED\_TO\_ADD\_MONITOR

> `readonly` **FAILED\_TO\_ADD\_MONITOR**: `"Failed to add monitor"` = `"Failed to add monitor"`

### FAILED\_TO\_ADD\_SITE

> `readonly` **FAILED\_TO\_ADD\_SITE**: `"Failed to add site"` = `"Failed to add site"`

### FAILED\_TO\_CHECK\_SITE

> `readonly` **FAILED\_TO\_CHECK\_SITE**: `"Failed to check site"` = `"Failed to check site"`

### FAILED\_TO\_DELETE\_SITE

> `readonly` **FAILED\_TO\_DELETE\_SITE**: `"Failed to delete site"` = `"Failed to delete site"`

### FAILED\_TO\_UPDATE\_INTERVAL

> `readonly` **FAILED\_TO\_UPDATE\_INTERVAL**: `"Failed to update check interval"` = `"Failed to update check interval"`

### FAILED\_TO\_UPDATE\_SITE

> `readonly` **FAILED\_TO\_UPDATE\_SITE**: `"Failed to update site"` = `"Failed to update site"`

### SITE\_NOT\_FOUND

> `readonly` **SITE\_NOT\_FOUND**: `"Site not found"` = `"Site not found"`

## Remarks

These constants provide consistent error messaging throughout the application.
The `as const` assertion ensures type safety and prevents modification.
