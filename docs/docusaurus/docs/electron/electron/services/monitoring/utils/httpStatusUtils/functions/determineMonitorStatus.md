# Function: determineMonitorStatus()

> **determineMonitorStatus**(`httpStatus`): `"down"` \| `"up"`

Defined in: [electron/services/monitoring/utils/httpStatusUtils.ts:32](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/utils/httpStatusUtils.ts#L32)

Determines monitor status ("up" or "down") from an HTTP status code.

## Parameters

### httpStatus

`number`

The HTTP status code to evaluate (integer).

## Returns

`"down"` \| `"up"`

"up" if the site is responding (including client errors and redirects), "down" if server error or invalid code.

## Remarks

- 1xx–4xx: "up" (site is responding)
- 5xx: "down" (server error)
- \<100 or \>599: "down" (invalid code)
Used by monitoring services to classify site health.

## Example

```typescript
determineMonitorStatus(200); // "up"
determineMonitorStatus(404); // "up"
determineMonitorStatus(500); // "down"
determineMonitorStatus(999); // "down"
```

## See

[MDN: HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
