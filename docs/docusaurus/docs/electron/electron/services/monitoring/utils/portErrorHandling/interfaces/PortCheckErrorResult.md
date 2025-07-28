# Interface: PortCheckErrorResult

Defined in: [electron/services/monitoring/utils/portErrorHandling.ts:47](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/utils/portErrorHandling.ts#L47)

Result structure for a failed port check operation.

## Remarks

Used to communicate port check failures to the frontend in a standardized, type-safe format.

## Example

```typescript
{
  details: "443",
  error: "Port not reachable",
  responseTime: 1200,
  status: "down"
}
```

## See

[handlePortCheckError](../functions/handlePortCheckError.md)

## Properties

### details

> **details**: `string`

Defined in: [electron/services/monitoring/utils/portErrorHandling.ts:52](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/utils/portErrorHandling.ts#L52)

The port number that was being checked, as a string.

***

### error

> **error**: `string`

Defined in: [electron/services/monitoring/utils/portErrorHandling.ts:59](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/utils/portErrorHandling.ts#L59)

Standardized error message for frontend consumption.

#### Remarks

Typically [PORT\_NOT\_REACHABLE](../variables/PORT_NOT_REACHABLE.md) or a system error message.

***

### responseTime

> **responseTime**: `number`

Defined in: [electron/services/monitoring/utils/portErrorHandling.ts:66](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/utils/portErrorHandling.ts#L66)

Response time in milliseconds, or -1 if measurement failed.

#### Remarks

Used for diagnostics and retry/backoff strategies.

***

### status

> **status**: `"down"`

Defined in: [electron/services/monitoring/utils/portErrorHandling.ts:71](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/utils/portErrorHandling.ts#L71)

Always the string literal "down" for error results.
