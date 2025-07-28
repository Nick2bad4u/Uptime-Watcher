# Variable: RETRY\_CONSTRAINTS

> `const` **RETRY\_CONSTRAINTS**: `object`

Defined in: [src/constants.ts:204](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/constants.ts#L204)

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

Defines the limits for retry attempts when monitors fail,
balancing between resilience and avoiding excessive load.
