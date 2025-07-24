# Function: determineMonitorStatus()

> **determineMonitorStatus**(`httpStatus`): `"down"` \| `"up"`

Defined in: [electron/services/monitoring/utils/httpStatusUtils.ts:29](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/monitoring/utils/httpStatusUtils.ts#L29)

Determine monitor status based on HTTP status code.

## Parameters

### httpStatus

`number`

HTTP status code to evaluate

## Returns

`"down"` \| `"up"`

Monitor status: "up" if site is responding, "down" if server error or invalid code

## Remarks

Business rules for status determination:
- 1xx (Informational): "up" - rare but valid responses indicating server is active
- 2xx (Success): "up" - successful requests
- 3xx (Redirection): "up" - site is responding with redirects
- 4xx (Client Error): "up" - site is responding, client-side issue
- 5xx (Server Error): "down" - server-side issues indicate service problems
- Invalid codes (\< 100, \> 599): "down" - malformed or non-HTTP responses

## Example

```typescript
determineMonitorStatus(200); // "up"
determineMonitorStatus(404); // "up" - site responding but resource not found
determineMonitorStatus(500); // "down" - server error
determineMonitorStatus(999); // "down" - invalid HTTP status code
```
