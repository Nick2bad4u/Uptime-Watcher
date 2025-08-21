# Interface: PortCheckErrorResult

Defined in: [electron/services/monitoring/utils/portErrorHandling.ts:54](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/utils/portErrorHandling.ts#L54)

Result structure for a failed port check operation.

## Remarks

Used to communicate port check failures to the frontend in a standardized,
type-safe format.

## Example

```typescript
{
    "details": "443",
    "error": "Port not reachable",
    "responseTime": 1200,
    "status": "down"
}
```

## See

[handlePortCheckError](../functions/handlePortCheckError.md)

## Properties

### details

> **details**: `string`

Defined in: [electron/services/monitoring/utils/portErrorHandling.ts:60](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/utils/portErrorHandling.ts#L60)

The port number that was being checked, as a string.

***

### error

> **error**: `string`

Defined in: [electron/services/monitoring/utils/portErrorHandling.ts:69](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/utils/portErrorHandling.ts#L69)

Standardized error message for frontend consumption.

#### Remarks

Typically [PORT\_NOT\_REACHABLE](../variables/PORT_NOT_REACHABLE.md) or a system error message.

***

### responseTime

> **responseTime**: `number`

Defined in: [electron/services/monitoring/utils/portErrorHandling.ts:78](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/utils/portErrorHandling.ts#L78)

Response time in milliseconds, or -1 if measurement failed.

#### Remarks

Used for diagnostics and retry/backoff strategies.

***

### status

> **status**: `"down"`

Defined in: [electron/services/monitoring/utils/portErrorHandling.ts:84](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/utils/portErrorHandling.ts#L84)

Always the string literal "down" for error results.
