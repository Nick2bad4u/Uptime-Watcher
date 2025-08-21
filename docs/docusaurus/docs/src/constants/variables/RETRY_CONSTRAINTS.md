# Variable: RETRY\_CONSTRAINTS

> `const` **RETRY\_CONSTRAINTS**: `object`

Defined in: [src/constants.ts:298](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/constants.ts#L298)

Retry attempt constraints for per-monitor retry configuration.

## Type declaration

### DEFAULT

> `readonly` **DEFAULT**: `3` = `3`

Default number of retry attempts

### MAX

> `readonly` **MAX**: `10` = `10`

Maximum retry attempts allowed

### MIN

> `readonly` **MIN**: `0` = `0`

Minimum retry attempts (immediate failure)

### STEP

> `readonly` **STEP**: `1` = `1`

Step increment for retry configuration

## Remarks

Defines the limits for retry attempts when monitors fail, balancing between
resilience and avoiding excessive load.
