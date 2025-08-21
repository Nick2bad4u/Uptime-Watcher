# Variable: VALIDATION\_ERRORS

> `const` **VALIDATION\_ERRORS**: `object`

Defined in: [shared/utils/errorCatalog.ts:125](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/errorCatalog.ts#L125)

Validation-related error messages.

## Type declaration

### EMAIL\_INVALID

> `readonly` **EMAIL\_INVALID**: `"Email format is invalid"` = `"Email format is invalid"`

Error when email format is invalid

### FIELD\_INVALID\_FORMAT

> `readonly` **FIELD\_INVALID\_FORMAT**: `"Field format is invalid"` = `"Field format is invalid"`

Error when field format is invalid

### FIELD\_REQUIRED

> `readonly` **FIELD\_REQUIRED**: `"This field is required"` = `"This field is required"`

Error when required field is missing

### HOST\_INVALID

> `readonly` **HOST\_INVALID**: `"Host address is invalid"` = `"Host address is invalid"`

Error when host address is invalid

### PORT\_INVALID

> `readonly` **PORT\_INVALID**: `"Port number must be between 1 and 65535"` = `"Port number must be between 1 and 65535"`

Error when port number is invalid

### STRING\_TOO\_LONG

> `readonly` **STRING\_TOO\_LONG**: `"Value exceeds maximum length"` = `"Value exceeds maximum length"`

Error when string length exceeds maximum

### STRING\_TOO\_SHORT

> `readonly` **STRING\_TOO\_SHORT**: `"Value is below minimum length"` = `"Value is below minimum length"`

Error when string length is below minimum

### URL\_INVALID

> `readonly` **URL\_INVALID**: `"URL format is invalid"` = `"URL format is invalid"`

Error when URL format is invalid

### VALIDATION\_FAILED

> `readonly` **VALIDATION\_FAILED**: `"Validation failed"` = `"Validation failed"`

Error when validation fails for an event

### VALUE\_OUT\_OF\_RANGE

> `readonly` **VALUE\_OUT\_OF\_RANGE**: `"Value is out of allowed range"` = `"Value is out of allowed range"`

Error when value is out of allowed range

## Remarks

Error messages for data validation, constraint violations, and input
validation errors.
