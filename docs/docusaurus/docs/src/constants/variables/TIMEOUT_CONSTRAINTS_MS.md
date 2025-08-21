# Variable: TIMEOUT\_CONSTRAINTS\_MS

> `const` **TIMEOUT\_CONSTRAINTS\_MS**: `object`

Defined in: [src/constants.ts:282](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/constants.ts#L282)

Internal timeout constraints in milliseconds for backend operations.

## Type declaration

### MAX

> `readonly` **MAX**: `300000` = `300_000`

Maximum timeout in milliseconds

### MIN

> `readonly` **MIN**: `1000` = `1000`

Minimum timeout in milliseconds

### STEP

> `readonly` **STEP**: `1000` = `1000`

Step increment in milliseconds

## Remarks

These values correspond to TIMEOUT_CONSTRAINTS but are converted to
milliseconds for actual timeout implementation.
