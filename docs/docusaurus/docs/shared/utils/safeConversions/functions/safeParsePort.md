# Function: safeParsePort()

> **safeParsePort**(`value`, `defaultValue`): `number`

Defined in: [shared/utils/safeConversions.ts:179](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/safeConversions.ts#L179)

Safely converts a value to a port number (1-65535) with fallback.

## Parameters

### value

`unknown`

Value to convert to port number

### defaultValue

`number` = `80`

Fallback value if conversion fails (default: 80)

## Returns

`number`

Valid port number in range 1-65535, or the default value

## Remarks

Validates that the converted integer falls within the valid TCP/UDP port
range. Port 0 is reserved and not allowed. Returns the default value for any
value outside the valid range or that cannot be converted.

## Example

```typescript
safeParsePort("8080"); // 8080
safeParsePort("65536"); // 80 (out of range)
safeParsePort("0"); // 80 (invalid port)
safeParsePort("invalid"); // 80
```
