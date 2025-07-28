# Variable: TIMEOUT\_CONSTRAINTS\_MS

> `const` **TIMEOUT\_CONSTRAINTS\_MS**: `object`

Defined in: [src/constants.ts:188](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/constants.ts#L188)

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

These values correspond to TIMEOUT_CONSTRAINTS but are converted
to milliseconds for actual timeout implementation.
