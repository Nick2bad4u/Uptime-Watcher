# Function: getEnvironment()

> **getEnvironment**(): `string`

Defined in: [shared/utils/environment.ts:58](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/environment.ts#L58)

Get the current environment name safely.

## Returns

`string`

Environment name or 'unknown' if not set

## Remarks

Returns 'unknown' as fallback to indicate unspecified environment state. This
is intentionally different from getNodeEnv() which assumes 'development' for
safety in development workflows. Use this when you need to detect unspecified
environments, use getNodeEnv() when you need development defaults.
