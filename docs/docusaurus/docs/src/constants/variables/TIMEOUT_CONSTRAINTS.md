# Variable: TIMEOUT\_CONSTRAINTS

> `const` **TIMEOUT\_CONSTRAINTS**: `object`

Defined in: [src/constants.ts:266](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/constants.ts#L266)

Request timeout constraints for HTTP monitoring.

## Type declaration

### MAX

> `readonly` **MAX**: `300` = `300`

Maximum timeout in seconds

### MIN

> `readonly` **MIN**: `1` = `1`

Minimum timeout in seconds

### STEP

> `readonly` **STEP**: `1` = `1`

Step increment in seconds

## Remarks

Defines the user-facing timeout limits in seconds for form validation and UI
display. These values are converted to milliseconds for backend use.
