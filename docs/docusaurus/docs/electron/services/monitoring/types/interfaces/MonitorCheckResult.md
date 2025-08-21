# Interface: MonitorCheckResult

Defined in: [electron/services/monitoring/types.ts:106](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/types.ts#L106)

Result of a monitor check operation.

## Remarks

Contains the outcome of a single health check attempt, including status,
performance metrics, and optional diagnostic information.

## Properties

### details?

> `optional` **details**: `string`

Defined in: [electron/services/monitoring/types.ts:115](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/types.ts#L115)

Optional human-readable details about the check result.

#### Remarks

May include status codes, response headers, or other diagnostic
information useful for troubleshooting or display purposes. Examples:
"HTTP 200 OK", "Connection timeout", "DNS resolution failed"

***

### error?

> `optional` **error**: `string`

Defined in: [electron/services/monitoring/types.ts:125](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/types.ts#L125)

Optional error message if the check failed.

#### Remarks

Provides technical error information for debugging failed checks. Should
not be displayed directly to end users. Examples: "ECONNREFUSED", "Socket
timeout", "Certificate expired"

***

### responseTime

> **responseTime**: `number`

Defined in: [electron/services/monitoring/types.ts:134](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/types.ts#L134)

Response time in milliseconds.

#### Remarks

For successful checks, this represents the actual response time. For
failed checks, this may represent timeout value or time until failure.

***

### status

> **status**: `"down"` \| `"up"`

Defined in: [electron/services/monitoring/types.ts:143](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/types.ts#L143)

Status outcome of the check.

#### Remarks

- `"up"`: Monitor endpoint is healthy and responding normally
- `"down"`: Monitor endpoint is failing, unreachable, or returned an error
